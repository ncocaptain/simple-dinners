import { z } from "zod";
import { INGREDIENT_REGISTRY } from "../../core/ingredientRegistry";
import { priceNetworkFreshness } from "../priceNetworkFreshness";
import { normalizeMeasure } from "../packageComparability";

export const CAPTURE_BATCH_LIMIT = 20;
const required = (max: number) => z.string().trim().min(1).max(max);
const optional = (max: number) => z.string().trim().min(1).max(max).nullable();
const quantity = z.number().finite().positive().max(1e9).nullable();
const money = z.number().int().nonnegative().safe().nullable();
const date = z.string().max(64).datetime({ offset: true }).refine((value) => Number.isFinite(Date.parse(value)));
export const captureProductSchema = z.object({
  normalized_name: required(500), brand: optional(200), gtin: z.string().regex(/^([0-9]{8}|[0-9]{12}|[0-9]{13}|[0-9]{14})$/).nullable(),
  canonical_ingredient_id: required(200).refine((id) => INGREDIENT_REGISTRY.some((item) => item.id === id), "Choose an existing ingredient ID"),
  grocery_search_name: required(500), product_form_key: required(500), form_verified: z.boolean(),
  package_kind: z.enum(["single", "multipack", "variable-weight"]), content_basis: z.enum(["net", "drained", "count", "unknown"]),
  package_quantity: quantity, package_unit: optional(100), pack_count: z.number().int().positive().max(10000).nullable(),
}).strict().superRefine((p, ctx) => {
  if ((p.package_quantity === null) !== (p.package_unit === null)) ctx.addIssue({ code: "custom", message: "Package quantity and unit must both be known or both absent" });
  if ((p.package_kind !== "multipack" && p.pack_count !== null) || (p.package_kind === "variable-weight" && p.package_quantity !== null)) ctx.addIssue({ code: "custom", message: "Invalid package specification" });
  if (p.package_quantity !== null && p.package_unit !== null) {
    const measure = normalizeMeasure({ quantity: p.package_quantity, unit: p.package_unit });
    if (!measure.value || (p.content_basis === "count" && (measure.value.unit !== "each" || !Number.isInteger(measure.value.quantity))) ||
        (["net", "drained"].includes(p.content_basis) && measure.value?.unit === "each")) ctx.addIssue({ code: "custom", message: "Package unit and content basis conflict" });
  }
});
export const captureRowSchema = z.object({
  rowId: z.string().uuid(), storeId: z.string().uuid(), existingProductId: z.string().uuid().nullable(), product: captureProductSchema,
  observation: z.object({
    regular_price_minor: money, sale_price_minor: money, currency: z.enum(["USD", "CAD", "EUR", "GBP"]),
    channel: z.enum(["in-store", "pickup", "delivery"]), selling_basis: z.enum(["package", "measure"]),
    selling_quantity: quantity, selling_unit: optional(100), observed_at: date, expires_at: date.nullable(), sale_expires_at: date.nullable(),
    availability: z.enum(["in-stock", "out-of-stock", "unknown"]), source_type: z.enum(["manual", "receipt-confirmed", "user-contributed", "approved-feed"]),
    source_confidence: z.enum(["verified", "unverified"]), membership: z.enum(["none", "required"]),
  }).strict(),
}).strict();
export type CaptureRow = z.infer<typeof captureRowSchema>;
export type CaptureProduct = z.infer<typeof captureProductSchema>;
export const captureEnvelopeSchema = z.object({ rows: z.array(z.unknown()).min(1).max(CAPTURE_BATCH_LIMIT) }).strict();
export type CaptureResult = { rowId: string; status: "saved" | "replayed" | "invalid" | "failed"; productId?: string; observationId?: string; productAction?: "created" | "reused"; errors?: string[] };

/** Decimal strings only: no floating-point money survives this boundary. */
export function dollarsToMinor(value: string): number | null {
  if (!value.trim()) return null;
  if (!/^(0|[1-9]\d{0,10})(\.\d{1,2})?$/.test(value.trim())) throw new Error("Use a nonnegative USD amount with at most two decimals");
  const [whole, fraction = ""] = value.trim().split(".");
  const amount = Number(BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0")));
  if (!Number.isSafeInteger(amount)) throw new Error("Price is too large");
  return amount;
}
export function validateCaptureRow(raw: unknown, now: number): { row: CaptureRow | null; errors: string[]; warnings: string[] } {
  const parsed = captureRowSchema.safeParse(raw);
  if (!parsed.success) return { row: null, errors: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`), warnings: [] };
  const row = parsed.data, o = row.observation; const errors: string[] = [], warnings: string[] = [];
  if (o.regular_price_minor === null && o.sale_price_minor === null) errors.push("At least one usable price is required");
  if ((o.membership === "required" || o.sale_expires_at !== null) && o.sale_price_minor === null) errors.push("Card conditions/sale expiry require a sale price");
  if (o.selling_basis === "package" ? o.selling_quantity !== null || o.selling_unit !== null : o.selling_quantity === null || o.selling_unit === null) errors.push("Selling quantity/unit must match selling basis");
  if (o.selling_basis === "measure" && o.selling_quantity !== null && o.selling_unit !== null) {
    const measure = normalizeMeasure({ quantity: o.selling_quantity, unit: o.selling_unit });
    if (!measure.value || measure.value.unit !== "g" || row.product.package_kind !== "variable-weight") errors.push("Measured selling prices require a variable-weight product and a supported weight unit");
  }
  // Zero future skew is deliberately conservative and agrees with Phase 5D.
  const validity = priceNetworkFreshness({ sourceType: o.source_type, observedAt: Date.parse(o.observed_at),
    expiresAt: o.expires_at === null ? null : Date.parse(o.expires_at), saleExpiresAt: o.sale_expires_at === null ? null : Date.parse(o.sale_expires_at), hasSalePrice: o.sale_price_minor !== null }, now);
  if (validity.status !== "valid") errors.push(`Observation freshness: ${validity.status}`);
  else {
    if (o.regular_price_minor === null && !validity.saleCurrent) errors.push("Sale has expired and no regular price is known");
    if (o.expires_at !== null && Date.parse(o.expires_at) > validity.observationExpiresAt) warnings.push(`Source expiration exceeds the source maximum; provider validity is capped at ${new Date(validity.observationExpiresAt).toISOString()}`);
    if (!row.product.form_verified || o.source_confidence !== "verified") warnings.push("Unverified identity/source cannot participate in automatic Deals comparisons");
  }
  return { row: errors.length ? null : row, errors, warnings };
}
export function storedConditions(row: CaptureRow) { return row.observation.membership === "required" ? [{ kind: "membership" as const, eligibility: "unknown" as const }] : []; }
export function sameCaptureProduct(a: CaptureProduct, b: CaptureProduct): boolean {
  return Object.keys(captureProductSchema.shape).every((key) => a[key as keyof CaptureProduct] === b[key as keyof CaptureProduct]);
}
