// api/import-recipe.js

import { scrape } from 'recipe-scrapers';

export default async function handler(req, res) {
  console.log('API called with URL:', req.body?.url || '(no url)');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed – POST required' });
  }

  const { url } = req.body || {};

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Valid recipe URL required' });
  }

  try {
    console.log(`Scraping: ${url}`);
    const recipe = await scrape(url);

    // Adapt/normalize based on what the library actually returns
    // (check Vercel logs or console.log(recipe) during a test run)
    const formattedRecipe = {
      title: recipe.title || recipe.name || 'Imported Recipe',
      description: recipe.description || '',
      image: recipe.image || '',
      yields: recipe.yields || recipe.recipeYield || '',
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || (typeof recipe.instructions === 'string' ? recipe.instructions.split(/\n+/) : []),
      // Add prepTime, cookTime, author, etc. if present in recipe object
    };

    console.log('Scrape OK – title:', formattedRecipe.title);

    return res.status(200).json({ success: true, recipe: formattedRecipe });
  } catch (err) {
    console.error('Scrape failed:', err.message);
    console.error(err.stack || err);

    let friendlyError = 'Could not import the recipe (site may not be supported or blocked the request)';
    if (err.message?.includes('not supported') || err.message?.includes('not implemented')) {
      friendlyError = 'This recipe site is not yet supported by the scraper. Try Allrecipes, BBC Good Food, or similar.';
    }

    return res.status(500).json({ error: friendlyError });
  }
}

export const config = {
  maxDuration: 30, // seconds – helps with slower sites
};