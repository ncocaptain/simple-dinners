import type { CaptureProduct, CaptureRow } from "./model";
import { CAPTURE_BATCH_LIMIT, dollarsToMinor, validateCaptureRow } from "./model";

export type CaptureDraft = Record<string, string> & { rowId: string };
export function blankCaptureDraft(): CaptureDraft {
  return { rowId: crypto.randomUUID(), storeId: "", existingProductId: "", normalized_name: "", brand: "", gtin: "", canonical_ingredient_id: "",
    grocery_search_name: "", product_form_key: "", form_verified: "false", package_kind: "", content_basis: "", package_quantity: "", package_unit: "", pack_count: "",
    regular: "", sale: "", currency: "USD", channel: "in-store", selling_basis: "", selling_quantity: "", selling_unit: "", observed_at: new Date().toISOString(),
    expires_at: "", sale_expires_at: "", availability: "unknown", source_type: "manual", source_confidence: "unverified", membership: "", quotedPrice: "", pasteWarning: "" };
}
export function parseCapturePaste(text: string): CaptureDraft[] {
  if (text.length > 30000) throw new Error("Paste is limited to 30,000 characters");
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length > CAPTURE_BATCH_LIMIT) throw new Error("At most 20 rows per batch");
  return lines.map((line) => {
    const row = blankCaptureDraft(); const parts = line.split("|").map((part) => part.trim());
    row.normalized_name = parts[0] ?? ""; row.pasteWarning = "Review identity, package, content basis, price type and membership before Save.";
    const price = parts[1]?.match(/^(?:(regular|sale):\s*)?\$?(\d+(?:\.\d{1,2})?)(?:\s*\/\s*([a-z ]+))?$/i);
    if (price) {
      if (price[1]) row[price[1].toLowerCase()] = price[2]; else row.quotedPrice = price[2];
      if (price[3]) { row.selling_basis = "measure"; row.selling_quantity = "1"; row.selling_unit = price[3].trim(); }
    } else if (parts[1]) row.pasteWarning += " Unrecognized price wording.";
    if (["in-stock", "out-of-stock", "unknown"].includes(parts[2])) row.availability = parts[2];
    if (parts.length !== 3) row.pasteWarning += " Expected name | price | availability.";
    return row;
  });
}
export function draftFromProduct(draft: CaptureDraft, product: CaptureProduct & { id: string }): CaptureDraft {
  return { ...draft, ...Object.fromEntries(Object.entries(product).filter(([key]) => key !== "id").map(([key, value]) => [key, value === null ? "" : String(value)])), existingProductId: product.id };
}
const numeric = (value: string) => value.trim() === "" ? null : /^\d+(?:\.\d+)?$/.test(value) ? Number(value) : NaN;
export function reviewCaptureDraft(draft: CaptureDraft, now: number) {
  try {
    const row = { rowId: draft.rowId, storeId: draft.storeId, existingProductId: draft.existingProductId || null,
      product: { normalized_name: draft.normalized_name, brand: draft.brand || null, gtin: draft.gtin || null, canonical_ingredient_id: draft.canonical_ingredient_id,
        grocery_search_name: draft.grocery_search_name, product_form_key: draft.product_form_key, form_verified: draft.form_verified === "true",
        package_kind: draft.package_kind, content_basis: draft.content_basis, package_quantity: numeric(draft.package_quantity), package_unit: draft.package_unit || null, pack_count: numeric(draft.pack_count) },
      observation: { regular_price_minor: dollarsToMinor(draft.regular), sale_price_minor: dollarsToMinor(draft.sale), currency: draft.currency, channel: draft.channel,
        selling_basis: draft.selling_basis, selling_quantity: numeric(draft.selling_quantity), selling_unit: draft.selling_unit || null, observed_at: draft.observed_at,
        expires_at: draft.expires_at || null, sale_expires_at: draft.sale_expires_at || null, availability: draft.availability, source_type: draft.source_type, source_confidence: draft.source_confidence, membership: draft.membership } };
    const result = validateCaptureRow(row, now);
    if (draft.quotedPrice) return { row: null, errors: ["Assign the pasted quote explicitly to Regular or Sale"], warnings: result.warnings };
    return result;
  } catch (error) { return { row: null, errors: [error instanceof Error ? error.message : "Invalid row"], warnings: [] }; }
}
export type CaptureCatalog = { stores: { id: string; retailer_name: string; store_name: string | null; store_number: string | null; city: string | null; state: string | null }[]; products: (CaptureProduct & { id: string })[] };
export type ReviewedCaptureRow = CaptureRow;
