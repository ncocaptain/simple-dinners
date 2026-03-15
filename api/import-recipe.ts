import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as cheerio from "cheerio";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);
    const url = body?.url;

    if (!url) return res.status(200).json({ error: "No URL provided." });

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Referer": "https://www.google.com/",
      }
    });

    if (!response.ok) {
      return res.status(200).json({ 
        error: `Website Blocked Scraper (Error ${response.status})`,
        details: "This site has high bot protection. Try a major site like AllRecipes to verify it works!"
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 1. TRY JSON-LD FIRST (The "Secret" Data Google uses)
    let ingredients: string[] = [];
    let instructions: string[] = [];
    let title = $('meta[property="og:title"]').attr('content') || $("h1").first().text();

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || "");
        const recipeData = Array.isArray(data) ? data.find(i => i["@type"] === "Recipe") : (data["@type"] === "Recipe" ? data : data["@graph"]?.find((i: any) => i["@type"] === "Recipe"));
        
        if (recipeData) {
          if (recipeData.recipeIngredient) ingredients = recipeData.recipeIngredient;
          if (recipeData.recipeInstructions) {
             instructions = recipeData.recipeInstructions.map((i: any) => i.text || i.name || i);
          }
        }
      } catch (e) { /* ignore parse errors */ }
    });

    // 2. FALLBACK TO CHEERIO SELECTORS (If JSON-LD fails)
    if (ingredients.length === 0) {
      $('[class*="ingredient"], [itemprop="recipeIngredient"], li:contains("cup")').each((_, el) => {
        ingredients.push($(el).text().trim());
      });
    }

    return res.status(200).json({
      recipe: {
        name: title || "New Recipe",
        ingredients: ingredients.join('\n'),
        instructions: instructions.join('\n\n'),
        photoUrl: $('meta[property="og:image"]').attr('content') || "",
        sourceUrl: url
      }
    });

  } catch (err: any) {
    return res.status(200).json({ error: "Scraper failed", details: err.message });
  }
}