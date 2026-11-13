import { z } from "zod";
import type { ContentBasis, PackageSize, PriceObservation } from "./types";

export type ProviderEnvironment = "test" | "production";
export type ProviderCapabilities = Readonly<{
  storeDiscovery: boolean; productSearch: boolean; localPrices: boolean;
  availability: boolean; promotions: boolean; batchSearch: boolean;
}>;
export type ProviderIdentity = Readonly<{
  id: string; name: string; environment: ProviderEnvironment;
  capabilities: ProviderCapabilities; maxBatchSize: number;
}>;
export type ProviderFailureCode = "unsupported" | "unauthorized" | "unavailable" | "rate-limited"
  | "invalid-request" | "malformed-response" | "cancelled";
export type ProviderFailure = Readonly<{
  code: ProviderFailureCode; requestId?: string; retryAfterMs?: number;
}>;
export type ProviderMetadata = Readonly<{
  audience: "public" | "personalized" | "unknown";
  providerId: string; environment: ProviderEnvironment; sourceScope: "store" | "retailer" | "catalog";
  observedAt: number; expiresAt: number; attribution: string | null;
  nextCursor: string | null;
}>;
export type ProviderResult<T> = Readonly<{
  items: readonly T[]; failures: readonly ProviderFailure[]; metadata: ProviderMetadata;
}>;
export type ProviderStore = Readonly<{ retailerId: string; storeId: string; name: string }>;
export type ProviderContext = Readonly<{
  retailerId: string; storeId: string; channel: PriceObservation["channel"]; currency: string;
  // An opaque eligibility preference, never an access token or credential.
  eligibilityKey: string;
}>;
export type ProductQuery = Readonly<{
  requestId: string; searchName: string; canonicalIngredientId: string;
  productConstraints: readonly string[];
}>;
export type ProductCandidate = Readonly<{
  requestId: string; productId: string; title: string; canonicalIngredientId: string;
  productFormKey: string; requirementBasis: ContentBasis; packageSize: PackageSize;
  // Verified means assessed against ALL query constraints, not just a name hit.
  compatibility: "verified" | "unverified" | "mismatch";
}>;
export type ProviderPrice = Readonly<{ productId: string; price: PriceObservation }>;
export interface DealsProvider {
  readonly identity: ProviderIdentity;
  discoverStores?(request: Readonly<{ postalCode: string; cursor?: string }>, signal: AbortSignal): Promise<ProviderResult<ProviderStore>>;
  searchProducts(request: Readonly<{ context: ProviderContext; queries: readonly ProductQuery[]; cursor?: string }>, signal: AbortSignal): Promise<ProviderResult<ProductCandidate>>;
  getPrices?(request: Readonly<{ context: ProviderContext; productIds: readonly string[]; cursor?: string }>, signal: AbortSignal): Promise<ProviderResult<ProviderPrice>>;
}

// Reconstruct only allowlisted normalized fields. Unrestricted payloads/credentials
// never cross this boundary into results or the cache, even on typed transports.
const identifier = z.string().min(1).max(500);
const timestamp = z.number().finite().nonnegative();
const measure = z.object({ quantity: z.number().finite().positive(), unit: identifier });
const basis = z.enum(["net", "drained", "count", "unknown"]);
export const packageSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("single"), basis, size: measure.nullable() }),
  z.object({ kind: z.literal("multipack"), basis, packCount: z.number().int().positive().safe().nullable(), innerSize: measure.nullable() }),
  z.object({ kind: z.literal("variable-weight"), basis }),
]);
const money = z.object({ amountMinor: z.number().int().nonnegative().safe(), currency: z.string().regex(/^[A-Z]{3}$/) });
export const priceSchema = z.object({
  productId: identifier, retailerId: identifier, storeId: identifier,
  channel: z.enum(["in-store", "pickup", "delivery"]),
  regularPrice: money.nullable(), salePrice: money.nullable(),
  sellingBasis: z.discriminatedUnion("kind", [z.object({ kind: z.literal("package") }), z.object({ kind: z.literal("measure"), measure })]),
  conditions: z.array(z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("membership"), eligibility: z.enum(["eligible", "ineligible", "unknown"]) }),
    z.object({ kind: z.literal("coupon"), eligibility: z.enum(["eligible", "ineligible", "unknown"]) }),
    z.object({ kind: z.literal("minimum-quantity"), packages: z.number().int().positive().safe() }),
    z.object({ kind: z.literal("unsupported-promotion"), description: z.string().max(500) }),
  ])).max(100),
  observedAt: timestamp, expiresAt: timestamp,
  availability: z.enum(["in-stock", "out-of-stock", "unknown"]),
}).refine((value) => value.expiresAt > value.observedAt);
export const storeSchema = z.object({ retailerId: identifier, storeId: identifier, name: identifier });
export const candidateSchema = z.object({
  requestId: identifier, productId: identifier, title: identifier, canonicalIngredientId: identifier,
  productFormKey: identifier, requirementBasis: basis, packageSize: packageSchema,
  compatibility: z.enum(["verified", "unverified", "mismatch"]),
});
export const providerPriceSchema = z.object({ productId: identifier, price: priceSchema })
  .refine((value) => value.productId === value.price.productId);
export const metadataSchema = z.object({
  providerId: identifier, environment: z.enum(["test", "production"]),
  audience: z.enum(["public", "personalized", "unknown"]),
  sourceScope: z.enum(["store", "retailer", "catalog"]), observedAt: timestamp, expiresAt: timestamp,
  attribution: z.string().max(1000).nullable(), nextCursor: z.string().max(500).nullable(),
}).refine((value) => value.expiresAt > value.observedAt);
const failureSchema = z.object({
  code: z.enum(["unsupported", "unauthorized", "unavailable", "rate-limited", "invalid-request", "malformed-response", "cancelled"]),
  requestId: identifier.optional(), retryAfterMs: z.number().finite().nonnegative().max(86400000).optional(),
});
const envelope = z.object({ items: z.array(z.unknown()).max(1000), failures: z.array(z.unknown()).max(1000), metadata: metadataSchema });

export function parseProviderResult<T>(raw: unknown, schema: z.ZodType<T>, identity: ProviderIdentity): ProviderResult<T> | null {
  const parsed = envelope.safeParse(raw);
  if (!parsed.success || parsed.data.metadata.providerId !== identity.id || parsed.data.metadata.environment !== identity.environment) return null;
  const items: T[] = [];
  const failures: ProviderFailure[] = [];
  for (const value of parsed.data.items) {
    const item = schema.safeParse(value);
    if (item.success) items.push(item.data);
    else failures.push({ code: "malformed-response" });
  }
  for (const value of parsed.data.failures) {
    const failure = failureSchema.safeParse(value);
    failures.push(failure.success ? failure.data : { code: "malformed-response" });
  }
  return { items, failures, metadata: parsed.data.metadata };
}
