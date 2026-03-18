// api/import-recipe.js

import { scrapeRecipe } from 'recipe-scrapers';

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
    console.log(`Fetching HTML for: ${url}`);

    // Step 1: Fetch the page HTML (use a browser-like User-Agent to avoid blocks)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    console.log('HTML fetched successfully. Starting scrape...');

    // Step 2: Pass BOTH html and url to scrapeRecipe
    const recipe = await scrapeRecipe(html, url, {
      // Optional: enable wild mode for unsupported sites (falls back to schema.org)
      wildMode: true,
      // safeParse: true  // if you want Zod-validated output
    });

    // Normalize the result (fields vary by site/parser)
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
      // extras: author, category, cuisine, etc. if present
    };

    console.log('Scrape success - title:', formatted.title);

    return res.status(200).json({
      success: true,
      recipe: formatted
    });
  } catch (err) {
    console.error('Scrape failed:', err.message);
    console.error(err.stack || err);

    let friendlyMsg = 'Failed to import recipe – the site may block automated requests or not be supported.';
    if (err.message?.includes('not supported') || err.message?.includes('not implemented')) {
      friendlyMsg = 'This recipe website is not yet supported. Try popular sites like Allrecipes, BBC Good Food, or NYT Cooking.';
    } else if (err.message?.includes('fetch') || err.message?.includes('Invalid URL')) {
      friendlyMsg = 'Could not load the page – check the URL or try a different recipe.';
    }

    return res.status(500).json({ error: friendlyMsg });
  }
}

export const config = {
  maxDuration: 30,  // seconds
};