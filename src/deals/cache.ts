import {
  candidateSchema, metadataSchema, providerPriceSchema, storeSchema,
  type ProductCandidate, type ProductQuery, type ProviderContext, type ProviderEnvironment,
  type ProviderMetadata, type ProviderPrice, type ProviderResult, type ProviderStore,
} from "./provider";
import { z } from "zod";

export type CacheKind = "store-directory" | "product-metadata" | "price-observations" | "availability" | "negative";
export const DEFAULT_DEALS_TTLS: Readonly<Record<CacheKind, number>> = Object.freeze({
  "store-directory": 7 * 86400000, "product-metadata": 86400000,
  "price-observations": 3600000, availability: 5 * 60000, negative: 5 * 60000,
});
export type CacheContext = ProviderContext & Readonly<{
  providerId: string; environment: ProviderEnvironment;
  query: Omit<ProductQuery, "requestId">;
  productIds: readonly string[];
  storeSearch: Readonly<{ postalCode: string; cursor: string | null }> | null;
  pageCursor: string | null;
  visibility: "public" | "private"; ownerKey: string | null; personalized: boolean;
}>;
export interface DealsCacheStorage {
  get(key: string): unknown; set(key: string, value: unknown): void;
  delete(key: string): void; clear(): void;
}
export class MemoryDealsCacheStorage implements DealsCacheStorage {
  private readonly values = new Map<string, unknown>();
  private readonly limit: number;
  constructor(limit = 256) {
    if (!Number.isSafeInteger(limit) || limit < 1) throw new Error("Invalid memory cache limit");
    this.limit = limit;
  }
  get(key: string) { return structuredClone(this.values.get(key)); }
  set(key: string, value: unknown) {
    if (!this.values.has(key) && this.values.size >= this.limit) this.values.delete(this.values.keys().next().value!);
    this.values.set(key, structuredClone(value));
  }
  delete(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
}
export type CacheData = {
  "store-directory": ProviderResult<ProviderStore>;
  "product-metadata": ProviderResult<ProductCandidate>;
  "price-observations": ProviderResult<ProviderPrice>;
  availability: ProviderResult<ProviderPrice>;
  negative: Readonly<{ empty: true }>;
};
export type CacheRead<T> = Readonly<{ status: "hit"; value: T; expiresAt: number } | { status: "miss" | "unavailable"; value: null }>;

/** Local context key only; never accepts a snapshot or its private signature. */
export function dealsCacheKey(kind: CacheKind, context: CacheContext): string {
  return JSON.stringify([kind, context.providerId, context.environment, context.retailerId, context.storeId, context.channel,
    context.currency, context.query.searchName, context.query.canonicalIngredientId, [...context.query.productConstraints].sort(),
    [...context.productIds].sort(), context.storeSearch, context.pageCursor, context.eligibilityKey, context.personalized, context.visibility, context.ownerKey]);
}
const schemas = {
  "store-directory": z.object({ items: z.array(storeSchema), failures: z.tuple([]), metadata: metadataSchema }),
  "product-metadata": z.object({ items: z.array(candidateSchema), failures: z.tuple([]), metadata: metadataSchema }),
  "price-observations": z.object({ items: z.array(providerPriceSchema), failures: z.tuple([]), metadata: metadataSchema }),
  availability: z.object({ items: z.array(providerPriceSchema), failures: z.tuple([]), metadata: metadataSchema }),
  negative: z.object({ empty: z.literal(true) }),
};
export class DealsCache {
  private readonly storage: DealsCacheStorage;
  private readonly now: () => number;
  private readonly ttls: Partial<Record<CacheKind, number>>;
  constructor(storage: DealsCacheStorage = new MemoryDealsCacheStorage(), now: () => number = Date.now, ttls: Partial<Record<CacheKind, number>> = {}) {
    this.storage = storage; this.now = now; this.ttls = { ...ttls };
  }
  maxAge(kind: CacheKind): number {
    const value = this.ttls[kind] ?? DEFAULT_DEALS_TTLS[kind];
    return Number.isFinite(value) && value > 0 ? value : 0;
  }
  private allowed(context: CacheContext) {
    return context.visibility === "private" ? Boolean(context.ownerKey) : !context.personalized && context.ownerKey === null;
  }
  get<K extends CacheKind>(kind: K, context: CacheContext): CacheRead<CacheData[K]> {
    if (!this.allowed(context) || (kind === "store-directory" && !context.storeSearch?.postalCode.trim())) return { status: "miss", value: null };
    try {
      const raw = this.storage.get(dealsCacheKey(kind, context));
      if (!raw || typeof raw !== "object" || !("expiresAt" in raw) || typeof raw.expiresAt !== "number" ||
          !("storedAt" in raw) || typeof raw.storedAt !== "number" || !Number.isFinite(raw.storedAt) || raw.storedAt > this.now() ||
          this.maxAge(kind) === 0 || raw.storedAt + this.maxAge(kind) <= this.now() ||
          !Number.isFinite(raw.expiresAt) || raw.expiresAt <= this.now() || !("data" in raw)) {
        this.storage.delete(dealsCacheKey(kind, context)); return { status: "miss", value: null };
      }
      const parsed = schemas[kind].safeParse(raw.data);
      if (!parsed.success) return { status: "miss", value: null };
      const data = parsed.data;
      if ("metadata" in data && ((context.visibility === "public" && data.metadata.audience !== "public") || data.metadata.providerId !== context.providerId || data.metadata.environment !== context.environment ||
          data.metadata.observedAt > this.now() || data.metadata.observedAt + this.maxAge(kind) <= this.now() || data.metadata.expiresAt <= this.now())) return { status: "miss", value: null };
      const prices = "items" in data && (kind === "price-observations" || kind === "availability")
        ? (data as ProviderResult<ProviderPrice>).items : [];
      if ((prices.length && "metadata" in data && data.metadata.sourceScope !== "store") || prices.some((item) => item.price.observedAt > this.now() || item.price.observedAt + this.maxAge(kind) <= this.now() || item.price.expiresAt <= this.now() ||
          item.price.storeId !== context.storeId || item.price.retailerId !== context.retailerId || item.price.channel !== context.channel ||
          [item.price.regularPrice, item.price.salePrice].some((money) => money !== null && money.currency !== context.currency) ||
          (context.visibility === "public" && item.price.conditions.some((condition) => condition.kind === "membership" || condition.kind === "coupon")))) return { status: "miss", value: null };
      const expiresAt = Math.min(raw.expiresAt, raw.storedAt + this.maxAge(kind),
        "metadata" in data ? Math.min(data.metadata.expiresAt, data.metadata.observedAt + this.maxAge(kind)) : Infinity,
        ...prices.flatMap((item) => [item.price.expiresAt, item.price.observedAt + this.maxAge(kind)]));
      return { status: "hit", value: structuredClone(data) as CacheData[K], expiresAt };
    } catch { return { status: "unavailable", value: null }; }
  }
  set<K extends CacheKind>(kind: K, context: CacheContext, data: CacheData[K], sourceExpiresAt = Infinity): boolean {
    if (!this.allowed(context) || (kind === "store-directory" && !context.storeSearch?.postalCode.trim())) return false;
    try {
      const parsed = schemas[kind].safeParse(data);
      if (!parsed.success) return false;
      const normalized = parsed.data;
      const metadata: ProviderMetadata | null = "metadata" in normalized ? normalized.metadata : null;
      if (metadata && ((context.visibility === "public" && metadata.audience !== "public") || metadata.providerId !== context.providerId || metadata.environment !== context.environment || metadata.observedAt > this.now() || metadata.expiresAt <= this.now())) return false;
      const prices = "items" in normalized && (kind === "price-observations" || kind === "availability")
        ? (normalized as ProviderResult<ProviderPrice>).items : [];
      if (prices.length && (metadata?.sourceScope !== "store" || prices.some((item) => item.price.observedAt > this.now() || item.price.observedAt + this.maxAge(kind) <= this.now() || item.price.expiresAt <= this.now() ||
          item.price.storeId !== context.storeId || item.price.retailerId !== context.retailerId || item.price.channel !== context.channel ||
          [item.price.regularPrice, item.price.salePrice].some((money) => money !== null && money.currency !== context.currency)))) return false;
      if (context.visibility === "public" && prices.some((item) => item.price.conditions.some((condition) => condition.kind === "membership" || condition.kind === "coupon"))) return false;
      const ttl = this.ttls[kind] ?? DEFAULT_DEALS_TTLS[kind];
      const expiresAt = Math.min(this.now() + ttl, sourceExpiresAt, metadata?.expiresAt ?? Infinity,
        metadata ? metadata.observedAt + ttl : Infinity,
        ...prices.flatMap((item) => [item.price.expiresAt, item.price.observedAt + ttl]));
      if (!Number.isFinite(ttl) || ttl <= 0 || !Number.isFinite(expiresAt) || expiresAt <= this.now()) return false;
      this.storage.set(dealsCacheKey(kind, context), { storedAt: this.now(), expiresAt, data: normalized }); return true;
    } catch { return false; }
  }
  clear(): boolean { try { this.storage.clear(); return true; } catch { return false; } }
}
