import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as cheerio from "cheerio";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Force CORS headers for mobile app stability
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);
    const url = body?.url;

    if (!url) return res.status(200).json({ error: "No URL provided." });

    // 2. SUPER-STEALTH FETCH: Mimics a real Chrome browser coming from a Google search
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.google.com/",
        "Sec-Ch-Ua": '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0"
      }
    });

    if (!response.ok) {
      return res.status(200).json({ 
        error: `Website Blocked Scraper (Error ${response.status})`,
        details: "This recipe site's security filter rejected the request. Try a different blog link."
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 3. ROBUST DATA EXTRACTION
    // Title: Priority to OpenGraph tags (harder to block)
    const title = $('meta[property="og:title"]').attr('content') || $("h1").first().text() || $("title").text();
    
    // Ingredients: Look for list items that contain common measurements
    let ingredients: string[] = [];
    $('[class*="ingredient"], [itemprop="recipeIngredient"], li:contains("cup"), li:contains("tbsp"), li:contains("oz"), li:contains("tsp")').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text && text.length > 2 && text.length < 300 && !ingredients.includes(text)) {
        ingredients.push(text);
      }
    });

    // Instructions: Look for common instruction containers
    let instructions: string[] = [];
    $('[class*="instruction"], [class*="step"], [itemprop="recipeInstructions"] li, [class*="direction"]').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text && text.length > 5 && !instructions.includes(text)) {
        instructions.push(text);
      }
    });

    // Image: Grab the high-res social media image
    const photoUrl = $('meta[property="og:image"]').attr('content') || 
                     $('meta[name="twitter:image"]').attr('content') || "";

    return res.status(200).json({
      recipe: {
        name: title?.trim() || "New Recipe",
        ingredients: ingredients.length > 0 ? ingredients.join('\n') : "Ingredients list not found automatically.",
        instructions: instructions.length > 0 ? instructions.join('\n\n') : "Instructions not found automatically.",
        photoUrl: photoUrl,
        sourceUrl: url
      }
    });

  } catch (err: any) {
    console.error("Scraper crash:", err.message);
    return res.status(200).json({ error: "Scraper failed", details: err.message });
  }
}