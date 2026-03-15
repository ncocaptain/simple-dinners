import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as cheerio from "cheerio";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Let vercel.json handle the CORS headers, but we handle the preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

  try {
    // 2. ROBUST BODY PARSING
    // Android/Capacitor sometimes sends a string instead of a pre-parsed object.
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error("Failed to parse string body:", body);
      }
    }

    const url = body?.url;

    // 3. LOGGING FOR DEBUGGING
    console.log("Request received for URL:", url);

    if (!url) {
      return res.status(400).json({ error: "No URL provided in request body." });
    }
    
    // 4. SCRAPING LOGIC
    const response = await fetch(url, {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" 
      },
    });

    if (!response.ok) {
      console.error(`External fetch failed with status: ${response.status}`);
      return res.status(response.status).json({ error: `Website returned ${response.status}` });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // 5. EXTRACT DATA (Enhanced slightly from minimal test)
    // Most recipe sites use 'h1' for the title
    const recipeName = $("h1").first().text() || $("title").text() || "New Recipe";

    const recipe = {
      name: recipeName.trim(),
      ingredients: "Successfully connected! Now let's get the real data.", 
      instructions: "Connection is solid.",
      photoUrl: "",
      sourceUrl: url
    };

    // 6. ALWAYS RETURN JSON
    return res.status(200).json({ recipe });

  } catch (err: any) {
    console.error("Internal Server Error:", err.message);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}