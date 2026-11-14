import type { SupabaseClient } from "@supabase/supabase-js";

/** Existing session token only. Authorization and all writes belong to the server. */
export async function captureRequest(client: Pick<SupabaseClient, "auth">, rows?: unknown, signal?: AbortSignal) {
  const { data, error } = await client.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("Sign in using the existing app account before opening private capture.");
  const response = await fetch("/api/deals-price-capture", { method: rows === undefined ? "GET" : "POST", signal,
    headers: { Authorization: `Bearer ${data.session.access_token}`, ...(rows === undefined ? {} : { "Content-Type": "application/json" }) },
    ...(rows === undefined ? {} : { body: JSON.stringify({ rows }) }) });
  const result = await response.json();
  if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Capture server unavailable");
  return result;
}
