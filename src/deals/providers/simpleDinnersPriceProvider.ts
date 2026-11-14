import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { parseIngredientLine } from "../../core/ingredientParser";
import { candidateSchema, packageSchema, priceSchema, type DealsProvider, type ProductCandidate,
  type ProviderMetadata, type ProviderResult, type ProviderPrice, type ProviderFailure } from "../provider";

const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const LIMIT = 100; // Bounded reads; truncation is an explicit failure, never complete coverage.
const text = z.string().min(1).max(500);
const time = z.string().datetime({ offset: true });
const productSchema = z.object({
  id: z.string().uuid(), normalized_name: text, canonical_ingredient_id: text.nullable(),
  grocery_search_name: text, product_form_key: text, form_verified: z.boolean(),
  package_kind: z.enum(["single", "multipack", "variable-weight"]),
  content_basis: z.enum(["net", "drained", "count", "unknown"]),
  package_quantity: z.number().positive().nullable(), package_unit: text.nullable(),
  pack_count: z.number().int().positive().nullable(),
});
const observationSchema = z.object({
  id: z.string().uuid(), product_id: z.string().uuid(), store_id: z.string().uuid(),
  currency: z.string().regex(/^[A-Z]{3}$/), channel: z.enum(["in-store", "pickup", "delivery"]),
  regular_price_minor: z.number().int().nonnegative().safe().nullable(),
  sale_price_minor: z.number().int().nonnegative().safe().nullable(),
  selling_basis: z.enum(["package", "measure"]), selling_quantity: z.number().positive().nullable(), selling_unit: text.nullable(),
  observed_at: time, expires_at: time.nullable(), sale_expires_at: time.nullable(),
  availability: z.enum(["in-stock", "out-of-stock", "unknown"]),
  conditions: priceSchema.shape.conditions,
  source_type: z.enum(["manual", "receipt-confirmed", "user-contributed", "approved-feed"]),
  source_confidence: z.enum(["verified", "unverified"]),
});
const storeSchema = z.object({ id: z.string().uuid(), retailer_name: text, active: z.boolean() });
const nameKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

/** Inject the existing publishable-key client. No automatic registration or UI use.
 * Only canonical IDs, product IDs and store context leave the device, never original
 * recipe constraints, request IDs, eligibility keys or snapshot signatures.
 */
export function createSimpleDinnersPriceProvider(client: Pick<SupabaseClient, "from">, now: () => number = Date.now): DealsProvider {
  const identity: DealsProvider["identity"] = {
    id: "simple-dinners-price-network", name: "Simple Dinners Price Network", environment: "production",
    maxBatchSize: 20,
    capabilities: { storeDiscovery: false, productSearch: true, localPrices: true, availability: true, promotions: true, batchSearch: true },
  };
  function result<T>(items: T[], failures: ProviderFailure[] = [], expiresAt = now() + 60000, attribution: string | null = null): ProviderResult<T> {
    const metadata: ProviderMetadata = { providerId: identity.id, environment: identity.environment, audience: "public",
      sourceScope: "store", observedAt: now(), expiresAt, attribution, nextCursor: null };
    return { items, failures, metadata };
  }
  async function validStore(context: { storeId: string; retailerId: string }, signal: AbortSignal) {
    const { data, error } = await client.from("price_network_stores").select("id,retailer_name,active")
      .eq("id", context.storeId).eq("active", true).abortSignal(signal).limit(1);
    if (error) throw new Error("Store unavailable");
    const parsed = storeSchema.safeParse(data?.[0]);
    // v1 retailer identity is the exact curated retailer name, stores have UUID IDs.
    return parsed.success && parsed.data.retailer_name === context.retailerId;
  }
  return {
    identity,
    async searchProducts({ context, queries, cursor }, signal) {
      if (cursor || queries.length > identity.maxBatchSize || !queries.length) return result([], [{ code: "invalid-request" }]);
      if (signal.aborted) return result([], [{ code: "cancelled" }]);
      try {
        if (!await validStore(context, signal)) return result([]);
        const items: ProductCandidate[] = []; const failures: ProviderFailure[] = [];
        for (const query of queries) {
          if (!query.canonicalIngredientId) continue;
          const { data, error } = await client.from("price_network_products")
            .select("id,normalized_name,canonical_ingredient_id,grocery_search_name,product_form_key,form_verified,package_kind,content_basis,package_quantity,package_unit,pack_count")
            .eq("canonical_ingredient_id", query.canonicalIngredientId).order("id").limit(LIMIT).abortSignal(signal);
          if (error) { failures.push({ code: "unavailable", requestId: query.requestId }); continue; }
          if (data?.length === LIMIT) { failures.push({ code: "unavailable", requestId: query.requestId }); continue; }
          for (const raw of data ?? []) {
            const parsed = productSchema.safeParse(raw);
            if (!parsed.success) { failures.push({ code: "malformed-response", requestId: query.requestId }); continue; }
            const p = parsed.data;
            if (p.canonical_ingredient_id !== query.canonicalIngredientId || nameKey(p.grocery_search_name) !== nameKey(query.searchName)) continue;
            const measure = p.package_quantity !== null && p.package_unit !== null ? { quantity: p.package_quantity, unit: p.package_unit } : null;
            const packageSize = packageSchema.parse(p.package_kind === "single" ? { kind: "single", basis: p.content_basis, size: measure }
              : p.package_kind === "multipack" ? { kind: "multipack", basis: p.content_basis, innerSize: measure, packCount: p.pack_count }
                : { kind: "variable-weight", basis: p.content_basis });
            // Quantity parsing reuses the existing parser; unknown/form-modified
            // wording cannot become verified simply through a canonical ID hit.
            const verified = p.form_verified && query.productConstraints.length > 0 && query.productConstraints.every((constraint) =>
              nameKey(parseIngredientLine(constraint).nameText) === nameKey(p.grocery_search_name));
            items.push(candidateSchema.parse({ requestId: query.requestId, productId: p.id, title: p.normalized_name,
              canonicalIngredientId: p.canonical_ingredient_id, productFormKey: p.product_form_key,
              requirementBasis: p.content_basis, packageSize, compatibility: verified ? "verified" : "unverified" }));
          }
        }
        return result(items, failures);
      } catch { return result([], [{ code: signal.aborted ? "cancelled" : "unavailable" }]); }
    },
    async getPrices({ context, productIds, cursor }, signal) {
      if (cursor || !productIds.length || productIds.length > identity.maxBatchSize || new Set(productIds).size !== productIds.length) return result([], [{ code: "invalid-request" }]);
      if (signal.aborted) return result([], [{ code: "cancelled" }]);
      try {
        if (!await validStore(context, signal)) return result([]);
        const items: ProviderPrice[] = []; const failures: ProviderFailure[] = []; const provenance: string[] = [];
        let expiresAt = now() + 60000;
        // One bounded indexed history read per product prevents a busy product's
        // history from crowding another out of a global row limit.
        for (const productId of productIds) {
          const clock = now();
          const { data, error } = await client.from("price_network_observations")
            .select("id,product_id,store_id,currency,channel,regular_price_minor,sale_price_minor,selling_basis,selling_quantity,selling_unit,observed_at,expires_at,sale_expires_at,availability,conditions,source_type,source_confidence")
            .eq("store_id", context.storeId).eq("product_id", productId).eq("currency", context.currency).eq("channel", context.channel)
            .gte("observed_at", new Date(clock - MAX_AGE_MS).toISOString()).lte("observed_at", new Date(clock).toISOString())
            .order("observed_at", { ascending: false }).order("id", { ascending: false }).limit(LIMIT).abortSignal(signal);
          if (error || data?.length === LIMIT) { failures.push({ code: "unavailable", requestId: productId }); continue; }
          for (const raw of data ?? []) {
            const parsed = observationSchema.safeParse(raw);
            // Do not resurrect an older price behind malformed newer evidence.
            if (!parsed.success) { failures.push({ code: "malformed-response", requestId: productId }); break; }
            const o = parsed.data; const observedAt = Date.parse(o.observed_at);
            const expiry = Math.min(observedAt + MAX_AGE_MS, o.expires_at ? Date.parse(o.expires_at) : Infinity);
            if (o.store_id !== context.storeId || o.product_id !== productId || o.currency !== context.currency || o.channel !== context.channel || observedAt > clock || expiry <= clock) continue;
            // Unverified latest evidence must not revive an older verified quote.
            if (o.source_confidence !== "verified") break;
            const saleCurrent = o.sale_price_minor !== null && (!o.sale_expires_at || Date.parse(o.sale_expires_at) > clock);
            const money = (amountMinor: number | null) => amountMinor === null ? null : { amountMinor, currency: o.currency };
            const price = priceSchema.safeParse({ productId, retailerId: context.retailerId, storeId: o.store_id, channel: o.channel,
              regularPrice: money(o.regular_price_minor), salePrice: saleCurrent ? money(o.sale_price_minor) : null,
              sellingBasis: o.selling_basis === "package" ? { kind: "package" } : { kind: "measure", measure: { quantity: o.selling_quantity, unit: o.selling_unit } },
              conditions: saleCurrent ? o.conditions : [], observedAt,
              expiresAt: saleCurrent && o.sale_expires_at ? Math.min(expiry, Date.parse(o.sale_expires_at)) : expiry,
              availability: o.availability });
            if (!price.success) { failures.push({ code: "malformed-response", requestId: productId }); break; }
            items.push({ productId, price: price.data }); expiresAt = Math.min(expiresAt, price.data.expiresAt);
            provenance.push(`${o.source_type} (${o.source_confidence}), observed ${o.observed_at}`); break;
          }
        }
        return result(items, failures, expiresAt, provenance.join("; ").slice(0, 1000) || null);
      } catch { return result([], [{ code: signal.aborted ? "cancelled" : "unavailable" }]); }
    },
  };
}
