import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as cheerio from "cheerio";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Force CORS headers so the Pixel 10 doesn't get blocked by its own network
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);
    const url = body?.url;

    if (!url) return res.status(400).json({ error: "No URL found" });

    // 2. STEALTH FETCH: Mimics a real modern Android browser
    const response = await fetch(url, {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Upgrade-Insecure-Requests": "1"
      },
    });

    // If we hit a block, we return 200 but with an error message 
    // This stops the browser/phone from throwing a "Hard 402 Error"
    if (!response.ok) {
       return res.status(200).json({ 
         error: `Website Blocked Scraper (Error ${response.status})`,
         details: "This site has high bot protection. Try a different recipe link." 
       });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // 3. THE DRAGNET: Extracting the goods
    const title = $("h1").first().text() || $("title").text() || "New Recipe";
    
    let ingredients: string[] = [];
    $('[class*="ingredient"], [itemprop="recipeIngredient"], li:contains("cup"), li:contains("tbsp")').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text && text.length > 2 && !ingredients.includes(text)) ingredients.push(text);
    });

    let instructions: string[] = [];
    $('[class*="instruction"], [class*="step"], [itemprop="recipeInstructions"] li, [class*="direction"]').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text && text.length > 5 && !instructions.includes(text)) instructions.push(text);
    });

    const photoUrl = $('meta[property="og:image"]').attr('content') || "";

    return res.status(200).json({ 
      recipe: {
        name: title.trim(),
        ingredients: ingredients.length > 0 ? ingredients.join('\n') : "Ingredients not found.", 
        instructions: instructions.length > 0 ? instructions.join('\n\n') : "Instructions not found.",
        photoUrl: photoUrl,
        sourceUrl: url
      }
    });

  } catch (err: any) {
    return res.status(200).json({ error: "Scraper failed", details: err.message });
  }
}