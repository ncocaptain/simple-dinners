import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const recipeScrapers = require('recipe-scrapers');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const url = body?.url;

    if (!url) return res.status(200).json({ error: "No URL provided." });

    // 1. Robust Library Access
    // Some versions of recipe-scrapers export a function, some export a default object
    const scrape = typeof recipeScrapers === 'function' 
      ? recipeScrapers 
      : (recipeScrapers.default || recipeScrapers);

    if (typeof scrape !== 'function') {
      console.error("Library Load Error: recipeScrapers is type", typeof recipeScrapers);
      return res.status(500).json({ error: "Scraper library failed to initialize." });
    }

    // 2. The Actual Scrape with a Timeout
    // We wrap it in a Promise.race to ensure Vercel doesn't just hang and 500
    const recipe = await Promise.race([
      scrape(url),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 8000))
    ]) as any;

    if (!recipe) throw new Error("No data returned from scraper.");

    // 3. Normalized Mapping
    const cleaned = {
      name: recipe.name || recipe.title || "New Recipe",
      ingredients: Array.isArray(recipe.ingredients) 
        ? recipe.ingredients.join('\n') 
        : (recipe.recipeIngredient ? recipe.recipeIngredient.join('\n') : ""),
      instructions: Array.isArray(recipe.instructions) 
        ? recipe.instructions.join('\n\n') 
        : (recipe.recipeInstructions ? recipe.recipeInstructions.join('\n\n') : ""),
      photoUrl: recipe.image || recipe.thumbnail || "",
      effort: "normal",
      sourceUrl: url
    };

    return res.status(200).json({ recipe: cleaned });

  } catch (err: any) {
    // This will now show up clearly in your Vercel Function Logs
    console.error("CRITICAL API ERROR:", err.message);
    
    return res.status(500).json({ 
      error: "Magic Import failed", 
      details: err.message,
      note: "Check Vercel logs for CRITICAL API ERROR"
    });
  }
}