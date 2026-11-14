import type { VercelRequest, VercelResponse } from "@vercel/node";
import { authorizeCapture, captureBatch, captureEnabled, captureServerClient } from "./_priceCaptureServer.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (!captureEnabled(process.env)) return res.status(404).json({ error: "Not found" });
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const client = captureServerClient(process.env);
    if (!await authorizeCapture(client, String(req.headers.authorization ?? ""), process.env.PRICE_CAPTURE_MAINTAINER_IDS ?? "")) return res.status(403).json({ error: "Maintainer authorization required" });
    if (req.method === "GET") {
      const [stores, products] = await Promise.all([
        client.from("price_network_stores").select("id,retailer_name,store_name,store_number,city,state").eq("active", true).order("id").limit(101),
        client.from("price_network_products").select("id,normalized_name,brand,gtin,canonical_ingredient_id,grocery_search_name,product_form_key,form_verified,package_kind,content_basis,package_quantity,package_unit,pack_count").order("id").limit(501),
      ]);
      if (stores.error || products.error || !stores.data || !products.data || stores.data.length > 100 || products.data.length > 500) return res.status(503).json({ error: "Catalog unavailable or beyond capture limit" });
      return res.status(200).json({ stores: stores.data, products: products.data });
    }
    if (!String(req.headers["content-type"]).startsWith("application/json")) return res.status(415).json({ error: "JSON required" });
    if (Buffer.byteLength(JSON.stringify(req.body) ?? "") > 100000) return res.status(413).json({ error: "Batch too large" });
    const results = await captureBatch(client, req.body, Date.now());
    return results ? res.status(200).json({ results }) : res.status(400).json({ error: "Invalid batch; use 1–20 rows" });
  } catch { return res.status(503).json({ error: "Capture server unavailable; no write confirmation. Retry unchanged rows safely." }); }
}
