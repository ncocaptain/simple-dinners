import { DealsCache, type CacheContext } from "./cache";
import { DealsProviderRegistry } from "./providerRegistry";
import {
  candidateSchema, parseProviderResult, providerPriceSchema,
  type ProductCandidate, type ProductQuery, type ProviderContext,
  type ProviderEnvironment, type ProviderFailure, type ProviderResult, type ProviderMetadata,
} from "./provider";
import { compareStoreBaskets } from "./basketComparison";
import { compareNeedPrices } from "./savings";
import type {
  BasketComparison, BestPriceResult, ContentBasis, NeedComparisonTarget, ProductOffer,
  ShoppingPurchaseSnapshot, StorePriceSet,
} from "./types";

export type ProviderSelection = ProviderContext & Readonly<{ providerId: string; environment: ProviderEnvironment }>;
export type DealsCoordinatorInput = Readonly<{
  snapshot: ShoppingPurchaseSnapshot;
  selections: readonly ProviderSelection[];
  currency: string;
  // Explicit Phase 2 evidence. Missing evidence cannot be supplied by a provider.
  comparisonBasis: Readonly<Record<string, Readonly<{ productFormKey: string; requirementBasis: ContentBasis }>>>;
  cacheAccess: Readonly<{ visibility: "public" | "private"; ownerKey: string | null; personalized: boolean }>;
}>;
export type SessionDecisions = Readonly<Record<string, "accepted" | "rejected">>;
export type ProviderIssue = Readonly<{
  providerId: string; storeId: string; needId: string; stage: "search" | "prices" | "registry";
  failure: ProviderFailure;
}>;
export type DealsCoordinatorResult = Readonly<{
  offers: readonly ProductOffer[]; errors: readonly ProviderIssue[];
  comparisons: readonly Readonly<{ needId: string; storeId: string; result: BestPriceResult }>[];
  basket: BasketComparison;
  expiresAt: number | null;
  sources: readonly ProviderMetadata[];
  partial: boolean;
  cancelled: boolean;
}>;

/** Race transport with cancellation, including providers that ignore AbortSignal. */
async function abortable<T>(signal: AbortSignal, action: () => Promise<T>): Promise<T> {
  if (signal.aborted) throw new Error("cancelled");
  let remove = () => {};
  const cancelled = new Promise<never>((_, reject) => {
    const abort = () => reject(new Error("cancelled"));
    signal.addEventListener("abort", abort, { once: true });
    remove = () => signal.removeEventListener("abort", abort);
  });
  try { return await Promise.race([Promise.resolve().then(() => { if (signal.aborted) throw new Error("cancelled"); return action(); }), cancelled]); }
  finally { remove(); }
}

export class DealsCoordinator {
  private generation = 0;
  private active: AbortController | null = null;
  private readonly retryUntil = new Map<string, number>();
  private readonly registry: DealsProviderRegistry;
  private readonly cache: DealsCache;
  private readonly now: () => number;
  private readonly concurrency: number;
  private readonly availabilityTtlMs: number;
  constructor(registry: DealsProviderRegistry, cache?: DealsCache, now: () => number = Date.now, concurrency = 3, availabilityTtlMs = 5 * 60000) {
    this.registry = registry; this.cache = cache ?? new DealsCache(undefined, now);
    this.now = now; this.concurrency = concurrency; this.availabilityTtlMs = availabilityTtlMs;
    if (!Number.isSafeInteger(concurrency) || concurrency < 1 || concurrency > 20 ||
        !Number.isFinite(availabilityTtlMs) || availabilityTtlMs <= 0) throw new Error("Invalid Deals coordinator limits");
  }
  cancel() { this.generation++; this.active?.abort(); this.active = null; }
  clearCache() { this.cancel(); return this.cache.clear(); }

  async run(
    source: DealsCoordinatorInput,
    options: Readonly<{ signal?: AbortSignal; decisions?: SessionDecisions; refresh?: boolean; onProgress?: (result: DealsCoordinatorResult) => void }> = {},
  ): Promise<DealsCoordinatorResult> {
    this.cancel();
    const generation = this.generation;
    const controller = new AbortController(); this.active = controller;
    const abort = () => controller.abort();
    options.signal?.addEventListener("abort", abort, { once: true });
    if (options.signal?.aborted) controller.abort();
    const signal = controller.signal;
    const current = () => !signal.aborted && generation === this.generation;
    const input = structuredClone(source);
    const decisions = { ...options.decisions };
    const offers: ProductOffer[] = [];
    const errors: ProviderIssue[] = [];
    const expiries = new Map<string, number>();
    const sources: ProviderMetadata[] = [];
    const targets: NeedComparisonTarget[] = input.snapshot.needs.map((need) => ({
      need, productFormKey: input.comparisonBasis[need.id]?.productFormKey ?? "",
      requirementBasis: input.comparisonBasis[need.id]?.requirementBasis ?? "unknown",
    }));
    const stores = new Map<string, StorePriceSet>();
    for (const selection of input.selections) {
      const key = JSON.stringify([selection.retailerId, selection.storeId, selection.channel]);
      stores.set(key, { retailerId: selection.retailerId, storeId: selection.storeId, channel: selection.channel, offers: [] });
    }
    const result = (cancelled = false): DealsCoordinatorResult => {
      const selectedStores = [...stores.values()].map((store) => ({ ...store, offers: cancelled ? [] : offers.filter((offer) =>
        offer.price.retailerId === store.retailerId && offer.price.storeId === store.storeId && offer.price.channel === store.channel) }));
      const visible = cancelled ? [] : offers.filter((offer) => offer.price.expiresAt > this.now() && (expiries.get(offer.id) ?? 0) > this.now());
      const validStores = selectedStores.map((store) => ({ ...store, offers: store.offers.filter((offer) => visible.includes(offer)) }));
      return structuredClone({
        offers: visible, errors,
        comparisons: targets.flatMap((target) => validStores.map((store) => ({
          needId: target.need.id, storeId: store.storeId,
          result: compareNeedPrices(target, store.offers.filter((offer) => offer.needId === target.need.id), { ...store, currency: input.currency, now: this.now() }),
        }))),
        basket: compareStoreBaskets(targets, validStores, { currency: input.currency, now: this.now() }, input.snapshot.holds.map((_, index) => `hold:${index}`)),
        expiresAt: visible.length ? Math.min(...visible.map((offer) => expiries.get(offer.id)!)) : null,
        sources,
        partial: errors.length > 0 || sources.some((meta) => meta.nextCursor !== null) || validStores.some((store) => targets.some((target) => !store.offers.some((offer) => offer.needId === target.need.id))),
        cancelled,
      });
    };
    const jobs = input.selections.flatMap((selection) => targets.map((target) => ({ selection, target })));
    let index = 0;
    const work = async () => {
      while (current() && index < jobs.length) {
        const { selection, target } = jobs[index++];
        const { need } = target;
        const issue = (stage: ProviderIssue["stage"], failure: ProviderFailure) => errors.push({ providerId: selection.providerId, storeId: selection.storeId, needId: need.id, stage, failure });
        const provider = this.registry.get(selection.providerId, selection.environment);
        if (!provider || !provider.identity.capabilities.productSearch || !provider.identity.capabilities.localPrices || !provider.getPrices) {
          issue("registry", { code: "unsupported" }); continue;
        }
        if (!selection.storeId || !selection.retailerId || selection.currency !== input.currency || !/^[A-Z]{3}$/.test(input.currency) ||
            !["in-store", "pickup", "delivery"].includes(selection.channel)) {
          issue("registry", { code: "invalid-request" }); continue;
        }
        if (need.state === "needs-review" || need.identity.status !== "matched" || !need.identity.canonicalIngredientId) continue;
        const requestId = `query-${index}`;
        const query: ProductQuery = { requestId, searchName: need.searchName,
          canonicalIngredientId: need.identity.canonicalIngredientId, productConstraints: [...need.originalIngredients] };
        const context: ProviderContext = { retailerId: selection.retailerId, storeId: selection.storeId,
          channel: selection.channel, currency: selection.currency, eligibilityKey: selection.eligibilityKey };
        const cacheContext: CacheContext = { ...context, ...input.cacheAccess, providerId: selection.providerId,
          environment: selection.environment, query: { searchName: query.searchName, canonicalIngredientId: query.canonicalIngredientId, productConstraints: query.productConstraints }, productIds: [], storeSearch: null, pageCursor: null };
        const retryKey = JSON.stringify([selection.providerId, selection.environment]);
        const recordFailures = (stage: ProviderIssue["stage"], failures: readonly ProviderFailure[]) => {
          for (const failure of failures) {
            issue(stage, failure);
            if (failure.code === "rate-limited" && failure.retryAfterMs !== undefined) {
              this.retryUntil.set(retryKey, Math.max(this.retryUntil.get(retryKey) ?? 0, this.now() + failure.retryAfterMs));
            }
          }
        };
        let stage: "search" | "prices" = "search";
        try {
          const retryAfterMs = (this.retryUntil.get(retryKey) ?? 0) - this.now();
          if (retryAfterMs > 0) { issue("registry", { code: "rate-limited", retryAfterMs }); continue; }
          if (!options.refresh && this.cache.get("negative", cacheContext).status === "hit") continue;
          let searched: ProviderResult<ProductCandidate> | null = null;
          const cached = !options.refresh ? this.cache.get("product-metadata", cacheContext) : null;
          const fromCache = cached?.status === "hit";
          if (fromCache) searched = cached.value;
          else {
            const raw = await abortable(signal, () => provider.searchProducts({ context: structuredClone(context), queries: [structuredClone(query)] }, signal));
            if (!current()) break;
            searched = parseProviderResult(raw, candidateSchema, provider.identity);
          }
          if (!searched || searched.metadata.observedAt > this.now() || searched.metadata.expiresAt <= this.now()) {
            issue("search", { code: "malformed-response" }); continue;
          }
          const productMaxAge = this.cache.maxAge("product-metadata");
          const productFreshUntil = fromCache ? cached.expiresAt : Math.min(searched.metadata.expiresAt,
            productMaxAge > 0 ? searched.metadata.observedAt + productMaxAge : Infinity);
          sources.push(searched.metadata);
          recordFailures("search", searched.failures);
          const ids = searched.items.map((candidate) => candidate.productId);
          const candidates = searched.items.filter((candidate) => {
            const valid = (fromCache || candidate.requestId === requestId) && candidate.canonicalIngredientId === query.canonicalIngredientId && ids.filter((id) => id === candidate.productId).length === 1;
            if (!valid) issue("search", { code: "malformed-response", requestId });
            return valid;
          });
          if (!current()) break;
          if (!fromCache && !searched.failures.length && candidates.length === searched.items.length && !searched.metadata.nextCursor) {
            if (!candidates.length && (cacheContext.visibility === "private" || searched.metadata.audience === "public")) this.cache.set("negative", cacheContext, { empty: true }, searched.metadata.expiresAt);
            else this.cache.set("product-metadata", cacheContext, searched);
          }
          if (!candidates.length) continue;
          const priceContext = { ...cacheContext, productIds: candidates.map((candidate) => candidate.productId) };
          const cachedPrices = !options.refresh ? this.cache.get("price-observations", priceContext) : null;
          const cachedAvailability = !options.refresh ? this.cache.get("availability", priceContext) : null;
          const prices = cachedPrices?.status === "hit" && cachedAvailability?.status === "hit" ? cachedPrices.value : null;
          const batches = prices ? [candidates] : Array.from({ length: Math.ceil(candidates.length / provider.identity.maxBatchSize) }, (_, batch) => candidates.slice(batch * provider.identity.maxBatchSize, (batch + 1) * provider.identity.maxBatchSize));
          stage = "prices";
          for (const batch of batches) {
            if (!current()) break;
            const retryRemaining = (this.retryUntil.get(retryKey) ?? 0) - this.now();
            if (retryRemaining > 0) { issue("prices", { code: "rate-limited", retryAfterMs: retryRemaining }); break; }
            const quoted = prices ?? parseProviderResult(await abortable(signal, () => provider.getPrices!({ context: structuredClone(context), productIds: batch.map((candidate) => candidate.productId) }, signal)), providerPriceSchema, provider.identity);
            if (!current()) break;
            if (!quoted || quoted.metadata.sourceScope !== "store" || quoted.metadata.observedAt > this.now() || quoted.metadata.expiresAt <= this.now()) {
              issue("prices", { code: "malformed-response" }); continue;
            }
            sources.push(quoted.metadata);
            recordFailures("prices", quoted.failures);
            const quoteIds = quoted.items.map((quote) => quote.productId);
            const accepted = quoted.items.filter((quote) => {
              const price = quote.price;
              const valid = batch.some((candidate) => candidate.productId === quote.productId) && quoteIds.filter((id) => id === quote.productId).length === 1 &&
                price.retailerId === context.retailerId && price.storeId === context.storeId && price.channel === context.channel &&
                price.observedAt <= this.now() && price.expiresAt > this.now() &&
                (provider.identity.capabilities.availability || price.availability === "unknown") &&
                (provider.identity.capabilities.promotions || (price.salePrice === null && price.conditions.length === 0)) &&
                [price.regularPrice, price.salePrice].every((money) => money === null || money.currency === input.currency);
              if (!valid) issue("prices", { code: "malformed-response", requestId: quote.productId });
              return valid;
            });
            for (const candidate of batch) {
              if (!accepted.some((quote) => quote.productId === candidate.productId) && !quoted.failures.some((failure) => failure.requestId === candidate.productId)) issue("prices", { code: "unavailable", requestId: candidate.productId });
            }
            if (!current()) break;
            if (!prices && !quoted.failures.length && accepted.length === quoted.items.length && accepted.length === candidates.length && !quoted.metadata.nextCursor) {
              const fresh = { ...quoted, items: accepted };
              this.cache.set("price-observations", priceContext, fresh);
              this.cache.set("availability", priceContext, fresh, this.now() + this.availabilityTtlMs);
            }
            for (const candidate of batch) {
              const quote = accepted.find((entry) => entry.productId === candidate.productId);
              if (!quote) continue;
              const id = JSON.stringify([selection.providerId, selection.environment, context.retailerId, context.storeId, context.channel, need.id, candidate.productId]);
              const compatible = candidate.productFormKey === target.productFormKey && candidate.requirementBasis === target.requirementBasis && candidate.compatibility !== "mismatch";
              offers.push({ id, needId: need.id, productId: candidate.productId, productFormKey: candidate.productFormKey,
                packageSize: candidate.packageSize, price: quote.price,
                compatibility: !compatible ? "mismatch" : decisions[id] === "rejected" ? "unverified"
                  : decisions[id] === "accepted" ? "verified" : candidate.compatibility });
              const freshness = (kind: "availability" | "price-observations" | "product-metadata") => {
                const maxAge = this.cache.maxAge(kind);
                return maxAge > 0 ? Math.min(quoted.metadata.observedAt, quote.price.observedAt) + maxAge : Infinity; // zero disables storage, not the source quote
              };
              expiries.set(id, Math.min(
                quoted.metadata.expiresAt, quote.price.expiresAt, searched.metadata.expiresAt,
                productFreshUntil,
                prices && cachedPrices?.status === "hit" ? cachedPrices.expiresAt : freshness("price-observations"),
                prices && cachedAvailability?.status === "hit" ? cachedAvailability.expiresAt : freshness("availability"),
                this.now() + this.availabilityTtlMs,
              ));
            }
          }
        } catch {
          if (current()) issue(stage, { code: "unavailable" });
        }
        if (current()) { try { options.onProgress?.(result()); } catch { /* Observers cannot fail a provider run. */ } }
      }
    };
    try {
      await Promise.all(Array.from({ length: Math.min(this.concurrency, jobs.length) }, work));
      return result(!current());
    } finally {
      options.signal?.removeEventListener("abort", abort);
      if (this.active === controller) this.active = null;
    }
  }
}
