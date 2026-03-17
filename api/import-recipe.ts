import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const recipeScrapers = require('recipe-scrapers');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const url = body?.url;

    if (!url) return res.status(200).json({ error: "No URL provided." });

    // Handle potential default export vs named export
    const scrape = typeof recipeScrapers === 'function' ? recipeScrapers : recipeScrapers.default;

    if (typeof scrape !== 'function') {
        throw new Error("Scraper library initialized incorrectly.");
    }

    const recipe = await scrape(url);

    if (!recipe) throw new Error("Could not extract recipe data.");

    // Robust mapping for 1.5.1 data structure
    const cleaned = {
      name: recipe.name || recipe.title || "New Recipe",
      ingredients: Array.isArray(recipe.ingredients) 
        ? recipe.ingredients.join('\n') 
        : (recipe.recipeIngredient ? (Array.isArray(recipe.recipeIngredient) ? recipe.recipeIngredient.join('\n') : recipe.recipeIngredient) : ""),
      instructions: Array.isArray(recipe.instructions) 
        ? recipe.instructions.join('\n\n') 
        : (recipe.recipeInstructions ? (Array.isArray(recipe.recipeInstructions) ? recipe.recipeInstructions.join('\n\n') : recipe.recipeInstructions) : ""),
      photoUrl: recipe.image || recipe.thumbnail || "",
      effort: "normal",
      sourceUrl: url
    };

    return res.status(200).json({ recipe: cleaned });

  } catch (err: any) {
    console.error("Scraper Error:", err);
    return res.status(500).json({ 
      error: "Magic Import failed", 
      details: err.message || "Internal Server Error" 
    });
  }
}