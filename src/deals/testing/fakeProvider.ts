import type {
  DealsProvider, ProviderFailure, ProviderIdentity, ProviderMetadata, ProviderResult,
} from "../provider";

export type FakeScenario = "success" | "empty" | "partial" | "rate-limit" | "unavailable" | "malformed" | "mismatch";
export type FakeStage = "stores" | "search" | "prices";

/** Manual gate: tests advance requests without sleeps or real timers. */
export class FakeProviderGate {
  private pending: Array<{ release: () => void; cancel: () => void }> = [];
  get size() { return this.pending.length; }
  wait(signal: AbortSignal, ignoreAbort = false): Promise<void> {
    return new Promise((resolve, reject) => {
      const remove = () => { this.pending = this.pending.filter((item) => item !== entry); signal.removeEventListener("abort", abort); };
      const abort = () => { remove(); reject(new Error("cancelled")); };
      const entry = { release: () => { remove(); resolve(); }, cancel: abort };
      if (signal.aborted && !ignoreAbort) { reject(new Error("cancelled")); return; }
      this.pending.push(entry);
      if (!ignoreAbort) signal.addEventListener("abort", abort, { once: true });
    });
  }
  releaseNext() { this.pending[0]?.release(); }
  releaseAll() { [...this.pending].forEach((entry) => entry.release()); }
}

/** Explicitly injected test/development fake. Never registered by application code. */
export function createFakeDealsProvider(options: Readonly<{
  id?: string; now: () => number; scenario?: (stage: FakeStage) => FakeScenario;
  wait?: (stage: FakeStage, signal: AbortSignal) => Promise<void>;
  ignoreAbort?: boolean;
}>) {
  const identity: ProviderIdentity = {
    id: options.id ?? "fake-deals", name: "Synthetic Deals Test Provider", environment: "test", maxBatchSize: 2,
    capabilities: { storeDiscovery: true, productSearch: true, localPrices: true, availability: true, promotions: true, batchSearch: true },
  };
  const requests: Array<{ stage: FakeStage; payload: unknown }> = [];
  let active = 0, maximum = 0;
  const metadata = (scope: ProviderMetadata["sourceScope"]): ProviderMetadata => ({
    audience: "public", providerId: identity.id, environment: "test", sourceScope: scope,
    observedAt: options.now(), expiresAt: options.now() + 3600000,
    attribution: "Synthetic fixtures only", nextCursor: null,
  });
  async function perform<T>(stage: FakeStage, payload: unknown, signal: AbortSignal, build: (scenario: FakeScenario) => ProviderResult<T>): Promise<ProviderResult<T>> {
    const failure = (code: ProviderFailure["code"]): ProviderResult<T> => ({ items: [], failures: [{ code, ...(code === "rate-limited" ? { retryAfterMs: 2000 } : {}) }], metadata: metadata("store") });
    if (signal.aborted && !options.ignoreAbort) return failure("cancelled");
    requests.push({ stage, payload: structuredClone(payload) }); active++; maximum = Math.max(maximum, active);
    try {
      await options.wait?.(stage, signal);
      if (signal.aborted && !options.ignoreAbort) return failure("cancelled");
      const scenario = options.scenario?.(stage) ?? "success";
      if (scenario === "unavailable") return failure("unavailable");
      if (scenario === "rate-limit") return failure("rate-limited");
      if (scenario === "malformed") return { raw: "deliberately malformed" } as unknown as ProviderResult<T>;
      if (scenario === "empty") return { items: [], failures: [], metadata: metadata("store") };
      return build(scenario);
    } catch { return failure(signal.aborted ? "cancelled" : "unavailable"); }
    finally { active--; }
  }
  const provider: DealsProvider = {
    identity,
    discoverStores: (request, signal) => perform("stores", request, signal, () => ({
      items: [{ retailerId: "sample-retailer", storeId: "sample-store", name: "Synthetic store" }], failures: [], metadata: metadata("retailer"),
    })),
    searchProducts: (request, signal) => perform("search", request, signal, (scenario) => ({
      items: request.queries.flatMap((query) => [12, 24].map((quantity, index) => ({
        requestId: query.requestId, productId: `${query.canonicalIngredientId}-${index}`, title: `Synthetic package ${index}`,
        canonicalIngredientId: query.canonicalIngredientId, productFormKey: query.canonicalIngredientId,
        requirementBasis: "net" as const, packageSize: { kind: "single" as const, basis: "net" as const, size: { quantity, unit: "oz" } },
        compatibility: "verified" as const,
      }))),
      failures: scenario === "partial" ? [{ code: "unavailable", requestId: request.queries[0]?.requestId }] : [],
      metadata: metadata("catalog"),
    })),
    getPrices: (request, signal) => perform("prices", request, signal, (scenario) => ({
      items: request.productIds.filter((_, index) => scenario !== "partial" || index === 0).map((productId, index) => ({
        productId, price: {
          productId, retailerId: request.context.retailerId,
          storeId: scenario === "mismatch" ? "other-store" : request.context.storeId,
          channel: scenario === "mismatch" ? "delivery" as const : request.context.channel,
          regularPrice: { amountMinor: index === 0 ? 200 : 350, currency: request.context.currency }, salePrice: null,
          sellingBasis: { kind: "package" as const }, conditions: [], availability: "in-stock" as const,
          observedAt: options.now(), expiresAt: options.now() + 3600000,
        },
      })),
      failures: scenario === "partial" && request.productIds.length > 1 ? [{ code: "unavailable", requestId: request.productIds[1] }] : [],
      metadata: metadata("store"),
    })),
  };
  return { provider, requests, get activeCount() { return active; }, get maxActiveCount() { return maximum; } };
}
