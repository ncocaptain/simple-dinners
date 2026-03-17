import type { VercelRequest, VercelResponse } from "@vercel/node";
// Using the default import as suggested by the library types
import * as recipeScrapers from 'recipe-scrapers'; 

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Headers for Cross-Origin (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);
    const url = body?.url;

    if (!url) return res.status(200).json({ error: "No URL provided." });

    // 2. The Scrape Call
    // This library fetches the HTML and parses the JSON-LD automatically
    const recipe = await scrape(url);

    if (!recipe) {
      throw new Error("Could not extract recipe data from this URL.");
    }

    // 3. Data Normalization
    // Mapping the library's output to your app's specific keys (name, photoUrl, etc.)
    const cleaned = {
      name: recipe.name || recipe.title || "New Recipe",
      // Join arrays into strings using newlines for your textareas
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
      details: err.message || "The website might be blocking automated access." 
    });
  }
}