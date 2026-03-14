import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as cheerio from "cheerio";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Respond to OPTIONS immediately (Vercel.json handles the headers)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: "No URL" });
    
    // Fetch the recipe site
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0" },
    });

    if (!response.ok) {
       return res.status(400).json({ error: "Website blocked scraper" });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Minimal return object to test the connection
    const recipe = {
      name: $("title").text() || "New Recipe",
      ingredients: "Test Ingredient", 
      instructions: "Test Instruction",
      photoUrl: "",
      sourceUrl: url
    };

    return res.status(200).json({ recipe });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}