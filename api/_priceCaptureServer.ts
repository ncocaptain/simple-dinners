import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { captureEnvelopeSchema, captureRowSchema, storedConditions, validateCaptureRow, type CaptureResult } from "../src/deals/capture/model.js";

export type CaptureEnvironment = Record<string, string | undefined>;
export function captureEnabled(env: CaptureEnvironment) {
  return env.NODE_ENV === "development" && (!env.VERCEL_ENV || env.VERCEL_ENV === "development") && env.PRICE_CAPTURE_ENABLED === "true";
}
export async function authorizeCapture(client: Pick<SupabaseClient, "auth">, bearer: string, allowlist: string) {
  const allowed = allowlist.split(",").map((id) => id.trim()).filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  if (!allowed.length || !/^Bearer [^\s]+$/.test(bearer)) return false;
  const { data, error } = await client.auth.getUser(bearer.slice(7));
  return !error && Boolean(data.user && allowed.includes(data.user.id));
}
export function captureServerClient(env: CaptureEnvironment) {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Capture server is not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export async function captureBatch(client: Pick<SupabaseClient, "rpc">, body: unknown, now: number) {
  const envelope = captureEnvelopeSchema.safeParse(body);
  if (!envelope.success) return null;
  const seen = new Set<string>(); const results: CaptureResult[] = [];
  for (let index = 0; index < envelope.data.rows.length; index++) {
    const checked = validateCaptureRow(envelope.data.rows[index], now);
    const original = envelope.data.rows[index];
    const parsed = captureRowSchema.safeParse(original);
    const replayOnly = !checked.row && parsed.success && checked.errors.length === 1 &&
      ["Observation freshness: stale", "Sale has expired and no regular price is known"].includes(checked.errors[0]);
    const row = checked.row ?? (replayOnly && parsed.success ? parsed.data : null);
    if (!row) { results.push({ rowId: parsed.success ? parsed.data.rowId : `row-${index + 1}`, status: "invalid", errors: checked.errors }); continue; }
    if (seen.has(row.rowId)) { results.push({ rowId: row.rowId, status: "invalid", errors: ["Duplicate row ID in batch"] }); continue; }
    seen.add(row.rowId);
    try {
      const observation = Object.fromEntries(Object.entries(row.observation).filter(([key]) => key !== "membership"));
      const { data, error } = await client.rpc("price_network_capture_row", { p_row_id: row.rowId, p_store_id: row.storeId, p_product: row.product,
        p_existing_product_id: row.existingProductId, p_replay_only: replayOnly, p_observation: { ...observation, conditions: storedConditions(row) } });
      if (error || !data || !["saved", "replayed"].includes(data.status) || typeof data.productId !== "string" || typeof data.observationId !== "string") {
        results.push({ rowId: row.rowId, status: "failed", errors: ["Row was not confirmed. Retry unchanged; if content was edited, use a new row/batch. Check server setup, active store and product identity."] });
      } else results.push({ rowId: row.rowId, status: data.status, productId: data.productId, observationId: data.observationId, productAction: data.productAction });
    } catch { results.push({ rowId: row.rowId, status: "failed", errors: ["Write outcome unknown; retry this unchanged row to reconcile safely"] }); }
  }
  return results;
}
