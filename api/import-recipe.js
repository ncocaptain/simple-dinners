// api/import-recipe.js

import { scrapeRecipe } from 'recipe-scrapers';  // ← This is the main scraping function

export default async function handler(req, res) {
  console.log('API called with body:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed – use POST' });
  }

  const { url } = req.body || {};

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Valid recipe URL required' });
  }

  try {
    console.log(`Attempting to scrape: ${url}`);

    // Use scrapeRecipe (the primary function in recent versions)
    const recipe = await scrapeRecipe(url);

    // recipe is usually an object with fields like title, ingredients, etc.
    // Normalize / shape it for your app
    const formatted = {
      title: recipe.title || recipe.name || 'Imported Recipe',
      description: recipe.description || '',
      image: recipe.image || recipe.images?.[0] || '',
      yields: recipe.yields || recipe.recipeYield || 'Unknown servings',
      ingredients: recipe.ingredients || recipe.recipeIngredient || [],
      instructions: recipe.instructions || recipe.recipeInstructions || [],
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      totalTime: recipe.totalTime,
      // Add author, category, cuisine, ratings if available in recipe object
    };

    console.log('Scrape success - title:', formatted.title);

    return res.status(200).json({
      success: true,
      recipe: formatted
    });
  } catch (err) {
    console.error('Scrape failed:', err.message);
    console.error(err.stack || err);

    let friendlyMsg = 'Failed to import recipe – site may block requests or not be supported.';
    if (err.message?.includes('not supported') || err.message?.includes('not implemented')) {
      friendlyMsg = 'This recipe website is not supported yet. Try popular ones like Allrecipes or BBC Good Food.';
    }

    return res.status(500).json({ error: friendlyMsg });
  }
}

export const config = {
  maxDuration: 30,  // seconds
};