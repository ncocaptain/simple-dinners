import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as cheerio from "cheerio";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Force allow CORS to prevent mobile network blocks
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    // 2. Parse the body (handles both string and object formats)
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);
    const url = body?.url;

    if (!url) return res.status(400).json({ error: "No URL found" });

    // 3. STEALTH FETCH: Mimics a real mobile browser to bypass 402/403 errors
    const response = await fetch(url, {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
    });

    if (!response.ok) {
       return res.status(response.status).json({ error: `Site returned ${response.status}` });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // 4. THE DRAGNET: Finding recipe data in the HTML
    const title = $("h1").first().text() || $("title").text() || "New Recipe";
    
    // Find Ingredients (looks for common recipe markers)
    let ingredients: string[] = [];
    $('[class*="ingredient"], [itemprop="recipeIngredient"], li:contains("cup"), li:contains("tbsp")').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text && text.length > 2 && !ingredients.includes(text)) {
        ingredients.push(text);
      }
    });

    // Find Instructions
    let instructions: string[] = [];
    $('[class*="instruction"], [class*="step"], [itemprop="recipeInstructions"] li').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text && text.length > 5 && !instructions.includes(text)) {
        instructions.push(text);
      }
    });

    const photoUrl = $('meta[property="og:image"]').attr('content') || "";

    const recipe = {
      name: title.trim(),
      ingredients: ingredients.length > 0 ? ingredients.join('\n') : "Ingredients not found. Try manual entry!", 
      instructions: instructions.length > 0 ? instructions.join('\n\n') : "Instructions not found.",
      photoUrl: photoUrl,
      sourceUrl: url
    };

    return res.status(200).json({ recipe });

  } catch (err: any) {
    return res.status(200).json({ error: "Scraper error", details: err.message });
  }
}