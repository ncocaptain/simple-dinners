import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { captureRequest } from "../deals/capture/client";
import { blankCaptureDraft, draftFromProduct, parseCapturePaste, reviewCaptureDraft, type CaptureCatalog, type CaptureDraft } from "../deals/capture/draft";
import { CAPTURE_BATCH_LIMIT, sameCaptureProduct, type CaptureResult, type CaptureRow } from "../deals/capture/model";
import { priceNetworkFreshness } from "../deals/priceNetworkFreshness";
import "../components/deals/Deals.css";
import "../components/deals/PriceCapture.css";

const choices: Record<string, readonly string[]> = {
  form_verified: ["false", "true"], package_kind: ["single", "multipack", "variable-weight"], content_basis: ["net", "drained", "count", "unknown"],
  currency: ["USD", "CAD", "EUR", "GBP"], channel: ["in-store", "pickup", "delivery"], selling_basis: ["package", "measure"], availability: ["in-stock", "out-of-stock", "unknown"],
  source_type: ["manual", "receipt-confirmed", "user-contributed", "approved-feed"], source_confidence: ["unverified", "verified"], membership: ["none", "required"],
};
const fields: readonly [string, string][] = [
  ["normalized_name", "Normalized product name"], ["brand", "Brand (optional)"], ["gtin", "GTIN (optional)"], ["canonical_ingredient_id", "Canonical ingredient ID"],
  ["grocery_search_name", "Grocery search name"], ["product_form_key", "Product form key"], ["form_verified", "Form verified"], ["package_kind", "Package kind"],
  ["content_basis", "Content basis"], ["package_quantity", "Package quantity (blank if unknown)"], ["package_unit", "Package unit (blank if unknown)"], ["pack_count", "Multipack count (when known)"],
  ["regular", "Regular price (currency units)"], ["sale", "Sale price (currency units)"], ["currency", "Currency"], ["channel", "Channel"], ["selling_basis", "Selling basis"],
  ["selling_quantity", "Selling quantity (measure only)"], ["selling_unit", "Selling unit (measure only)"], ["observed_at", "Observed date/time (ISO with timezone)"],
  ["expires_at", "Observation expiration (optional ISO)"], ["sale_expires_at", "Sale expiration (optional ISO)"], ["availability", "Availability"],
  ["source_type", "Source type"], ["source_confidence", "Source confidence"], ["membership", "Membership/card condition"],
];
export default function PriceCapturePage() {
  if (!import.meta.env.DEV) return <Navigate to="/shopping-list" replace />;
  return <PrivateCapture />;
}
function PrivateCapture() {
  const [catalog, setCatalog] = useState<CaptureCatalog | null>(null);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState<CaptureDraft[]>(() => [blankCaptureDraft()]);
  const [excluded, setExcluded] = useState<readonly string[]>([]);
  const [paste, setPaste] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [submittedRows, setSubmittedRows] = useState<CaptureRow[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<CaptureResult[] | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    if (!supabase) { setError("App connection is not configured."); return; }
    void captureRequest(supabase, undefined, controller.signal).then((data) => {
      if (!controller.signal.aborted && Array.isArray(data.stores) && Array.isArray(data.products)) setCatalog(data);
    }).catch((reason) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Capture unavailable"); });
    return () => controller.abort();
  }, []);
  const checked = drafts.map((draft) => ({ draft, ...reviewCaptureDraft(draft, Date.now()) }));
  const selected = checked.filter(({ draft }) => !excluded.includes(draft.rowId));
  const allValid = selected.length > 0 && selected.every((item) => item.row && catalog?.stores.some((store) => store.id === item.row?.storeId));
  const update = (id: string, key: string, value: string) => setDrafts((rows) => rows.map((row) => row.rowId === id ? { ...row, [key]: value,
    ...(["storeId", "regular", "sale", "currency", "channel", "selling_basis", "selling_quantity", "selling_unit", "observed_at", "expires_at", "sale_expires_at", "availability", "source_type", "source_confidence", "membership"].includes(key) ? {} : { existingProductId: "" }) } : row));
  const save = async () => {
    if (!supabase || (!submittedRows && !allValid) || saving) return;
    const payload = submittedRows ?? selected.flatMap((item) => item.row ? [structuredClone(item.row)] : []);
    setSubmittedRows(payload);
    setSaving(true); setAttempted(true); setError("");
    try {
      const data = await captureRequest(supabase, payload);
      if (!Array.isArray(data.results) || data.results.length !== selected.length) throw new Error("Incomplete save response; retry unchanged batch safely.");
      setResults(data.results);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Save outcome unknown. Retry unchanged batch."); }
    finally { setSaving(false); }
  };
  return <main className="deals-workspace price-capture-workspace">
    <Link to="/shopping-deals" className="deals-back">Back to Deals preview</Link><h1>Private batch Price Capture</h1>
    <p role="note">Development maintainer tool. Review every field before saving. Unsaved rows stay in memory only. Closing this page discards the batch.</p>
    {error && <p role="alert">{error}</p>}
    {!catalog ? <p role="status">{error ? "Capture is locked until the server authorizes this account." : "Checking maintainer access…"}</p> : <>
      {!catalog.stores.length && <p role="status">No active Price Network stores are available.</p>}
      {!reviewing && <>
        <label className="deals-choice">Paste structured rows<textarea value={paste} maxLength={30000} onChange={(event) => setPaste(event.target.value)} placeholder="Chicken breast | $2.99/lb | in-stock" /></label>
        <button type="button" onClick={() => { try { const rows = parseCapturePaste(paste); const blank = blankCaptureDraft(); const replaceBlank = drafts.length === 1 && Object.entries(drafts[0]).every(([key, value]) => key === "rowId" || key === "observed_at" || value === blank[key]); if ((replaceBlank ? 0 : drafts.length) + rows.length > CAPTURE_BATCH_LIMIT) throw new Error("At most 20 rows per batch; remove the initial blank row if needed."); setDrafts((prior) => replaceBlank ? rows : [...prior, ...rows]); setPaste(""); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Invalid paste"); } }}>Prefill rows from paste</button>
        <button type="button" disabled={drafts.length >= CAPTURE_BATCH_LIMIT} onClick={() => setDrafts((prior) => [...prior, blankCaptureDraft()])}>Add row</button>
      </>}
      {checked.map(({ draft, row, errors, warnings }, index) => {
        const matches = catalog.products.filter((product) => product.normalized_name === draft.normalized_name);
        const exact = row ? catalog.products.find((product) => sameCaptureProduct(product, row.product)) : null;
        const active = !excluded.includes(draft.rowId);
        const storeLabel = catalog.stores.find((store) => store.id === draft.storeId);
        const o = row?.observation;
        const validity = o ? priceNetworkFreshness({ sourceType: o.source_type, observedAt: Date.parse(o.observed_at), expiresAt: o.expires_at ? Date.parse(o.expires_at) : null,
          saleExpiresAt: o.sale_expires_at ? Date.parse(o.sale_expires_at) : null, hasSalePrice: o.sale_price_minor !== null }, Date.now()) : null;
        return <fieldset className="deals-card" key={draft.rowId}><legend>Row {index + 1}: {draft.normalized_name || "New product"}</legend>
          <label className="deals-choice"><input type="checkbox" checked={active} disabled={attempted} onChange={(event) => setExcluded((prior) => event.target.checked ? prior.filter((id) => id !== draft.rowId) : [...prior, draft.rowId])} />Include row</label>
          {!reviewing ? <>
            <label className="deals-choice">Store<select value={draft.storeId} onChange={(event) => update(draft.rowId, "storeId", event.target.value)}><option value="">Choose active store</option>
              {catalog.stores.map((store) => <option key={store.id} value={store.id}>{[store.retailer_name, store.store_name, store.store_number, store.city, store.state].filter(Boolean).join(" · ")}</option>)}</select></label>
            <label className="deals-choice">Existing product suggestions (review identity)<select value={draft.existingProductId} onChange={(event) => { const product = catalog.products.find((item) => item.id === event.target.value); setDrafts((rows) => rows.map((r) => r.rowId === draft.rowId ? product ? draftFromProduct(r, product) : { ...r, existingProductId: "" } : r)); }}>
              <option value="">New product / automatic exact-spec reuse</option>{matches.map((product) => <option key={product.id} value={product.id}>{product.normalized_name} · {product.brand} · {product.product_form_key} · {product.package_kind} · {product.package_quantity} {product.package_unit} · {product.content_basis} · packs {product.pack_count}</option>)}</select></label>
            {draft.pasteWarning && <p>{draft.pasteWarning}</p>}
            {!!draft.quotedPrice && <p>Unassigned pasted quote: ${draft.quotedPrice} <button type="button" onClick={() => setDrafts((rows) => rows.map((r) => r.rowId === draft.rowId ? { ...r, regular: r.quotedPrice, quotedPrice: "" } : r))}>Use as regular</button>
              <button type="button" onClick={() => setDrafts((rows) => rows.map((r) => r.rowId === draft.rowId ? { ...r, sale: r.quotedPrice, quotedPrice: "" } : r))}>Use as sale</button></p>}
            {fields.map(([key, label]) => <label className="deals-choice" key={key}>{label}{choices[key]
              ? <select value={draft[key]} onChange={(event) => update(draft.rowId, key, event.target.value)}><option value="">Review / choose</option>{choices[key].map((value) => <option key={value} value={value}>{key === "membership" ? value === "required" ? "Membership required — eligibility unknown" : "No membership condition" : key === "form_verified" ? value === "true" ? "Yes" : "No" : value}</option>)}</select>
              : <input value={draft[key]} maxLength={key === "normalized_name" || key === "grocery_search_name" || key === "product_form_key" ? 500 : 200} onChange={(event) => update(draft.rowId, key, event.target.value)} />}</label>)}
            <button type="button" onClick={() => setDrafts((rows) => rows.filter((r) => r.rowId !== draft.rowId))}>Remove row</button>
          </> : <>
            <p>Observation request ID: {draft.rowId}</p>
            <p>Store: {[storeLabel?.retailer_name, storeLabel?.store_name, storeLabel?.store_number].filter(Boolean).join(" · ") || "Unresolved"}</p>
            <p>Product: {draft.normalized_name} · {draft.brand} · {draft.canonical_ingredient_id} · {draft.product_form_key} · form verified: {draft.form_verified}</p>
            <p>Package: {draft.package_kind} · {draft.content_basis} · {draft.package_quantity || "unknown"} {draft.package_unit} · packs {draft.pack_count || "unknown"}</p>
            <p>Regular: {draft.regular ? `${draft.currency} ${draft.regular}` : "unknown"} · Sale: {draft.sale ? `${draft.currency} ${draft.sale}` : "unknown"} · {draft.currency}</p>
            <p>Selling: {draft.selling_basis} {draft.selling_quantity} {draft.selling_unit} · {draft.channel} · {draft.availability}</p>
            <p>Membership: {draft.membership === "required" ? "With store card — eligibility remains unknown" : draft.membership || "Unresolved"}</p>
            <p>Observed: {draft.observed_at} · Source expiration: {draft.expires_at || "not supplied"} · Sale expiration: {draft.sale_expires_at || "not supplied"}</p>
            <p>Provider usable until: {validity?.status === "valid" ? new Date(validity.priceExpiresAt).toISOString() : "unavailable"} (source policy, not an inferred advertised date)</p>
            <p>Source/confidence: {draft.source_type} / {draft.source_confidence}</p><p>{draft.existingProductId || exact ? "Existing product (exact specification)" : "New immutable product"}</p>
          </>}
          {active && errors.map((message, i) => <p role="alert" key={i}>{message}</p>)}{warnings.map((message, i) => <p role="note" key={i}>{message}</p>)}
        </fieldset>;
      })}
      {!reviewing ? <button type="button" disabled={!selected.length} onClick={() => setReviewing(true)}>Review selected batch</button> : <div className="deals-actions">
        {!attempted && <button type="button" onClick={() => setReviewing(false)}>Edit batch</button>}
        <button type="button" disabled={(!submittedRows && !allValid) || saving} onClick={() => void save()}>{saving ? "Saving…" : attempted ? "Retry unchanged batch" : "Save reviewed batch"}</button>
      </div>}
      {results && <section aria-label="Capture results"><h2>Row results</h2>{results.map((result, index) => <p role="status" key={`${result.rowId}:${index}`}>Submitted row {index + 1}: {result.status} · {result.productAction} product {result.productId} · observation {result.observationId} {result.errors?.join("; ")}</p>)}</section>}
      <button type="button" disabled={saving} onClick={() => { setDrafts([blankCaptureDraft()]); setExcluded([]); setReviewing(false); setAttempted(false); setSubmittedRows(null); setResults(null); setPaste(""); setError(""); }}>Capture another batch</button>
    </>}
  </main>;
}
