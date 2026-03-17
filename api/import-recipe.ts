import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const scrape = require('recipe-scrapers');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Headers for CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const url = body?.url;

    if (!url) return res.status(200).json({ error: "No URL provided." });

    // 2. The Scrape Call
    const recipe = await scrape(url);

    if (!recipe) throw new Error("Could not extract recipe data.");

    // 3. Normalization
    const cleaned = {
      name: recipe.name || recipe.title || "New Recipe",
      ingredients: Array.isArray(recipe.ingredients) 
        ? recipe.ingredients.join('\n') 
        : (recipe.recipeIngredient ? recipe.recipeIngredient.join('\n') : ""),
      instructions: Array.isArray(recipe.instructions) 
        ? recipe.instructions.join('\n\n') 
        : (recipe.recipeInstructions ? recipe.recipeInstructions.join('\n\n') : ""),
      photoUrl: recipe.image || "",
      effort: "normal",
      sourceUrl: url
    };

    return res.status(200).json({ recipe: cleaned });

  } catch (err: any) {
    console.error("Scraper Error:", err);
    return res.status(200).json({ 
      error: "Magic Import failed", 
      details: err.message || "Site might be protected." 
    });
  }
}