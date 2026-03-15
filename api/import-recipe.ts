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

    // 1. SIMPLE FETCH (No extra 'Stealth' headers that trigger Vercel 402s)
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(200).json({ 
        error: `Website busy (Error ${response.status})`,
        details: "This specific site is blocking us. Try AllRecipes to see it work!" 
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 2. THE DATA DETECTIVE (JSON-LD)
    let ingredients: string[] = [];
    let instructions: string[] = [];
    let title = $('meta[property="og:title"]').attr('content') || $("h1").first().text();

    // Look for the "Secret" recipe data hidden in the code
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
      } catch (e) { /* skip bad data */ }
    });

    return res.status(200).json({
      recipe: {
        name: title || "New Recipe",
        ingredients: ingredients.join('\n') || "Could not auto-find ingredients.",
        instructions: instructions.join('\n\n') || "Could not auto-find instructions.",
        photoUrl: $('meta[property="og:image"]').attr('content') || "",
        sourceUrl: url
      }
    });

  } catch (err: any) {
    return res.status(200).json({ error: "Scraper failed", details: err.message });
  }
}