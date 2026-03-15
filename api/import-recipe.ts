import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as cheerio from "cheerio";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Manually allow CORS (Sometimes vercel.json headers are ignored on errors)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    // 2. The "Super Parser"
    // Handles objects, strings, and raw buffers
    let body = req.body;
    if (Buffer.isBuffer(body)) {
      body = JSON.parse(body.toString());
    } else if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const url = body?.url;
    console.log("Processing URL:", url);

    if (!url) {
      return res.status(400).json({ error: "No URL found in body" });
    }
    
    // 3. Fetch with broader headers to avoid bot detection
    const response = await fetch(url, {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
      },
    });

    if (!response.ok) {
       // If the recipe site blocks us, tell the app why
       return res.status(response.status).json({ error: `Site returned ${response.status}` });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const recipeName = $("h1").first().text() || $("title").text() || "New Recipe";

    const recipe = {
      name: recipeName.trim(),
      ingredients: "Connection working! Ready for logic.", 
      instructions: "Server is responding.",
      photoUrl: "",
      sourceUrl: url
    };

    return res.status(200).json({ recipe });

  } catch (err: any) {
    console.error("Server Error:", err.message);
    // Returning 200 with an error object can sometimes bypass 402/500 bouncers
    return res.status(200).json({ error: "Scraper error", details: err.message });
  }
}