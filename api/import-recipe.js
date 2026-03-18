// api/import-recipe.js   ← keep this filename

import { scrape } from 'recipe-scrapers';

export default async function handler(req, res) {
  // Log for Vercel debugging (shows up in function logs)
  console.log('API invoked with URL:', req.body?.url);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed – use POST' });
  }

  const { url } = req.body;

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return res.status(400).json({ error: 'A valid recipe URL is required' });
  }

  try {
    console.log('Starting scrape for:', url);

    const recipe = await scrape(url);  // This should now work

    // Normalize the output (fields can vary by site)
    const formatted = {
      title: recipe.title || recipe.name || 'Recipe Imported',
      description: recipe.description || '',
      image: recipe.image || recipe.images?.[0] || '',
      yields: recipe.yields || recipe.recipeYield || 'Servings unknown',
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      totalTime: recipe.totalTime,
      ingredients: recipe.ingredients || recipe.recipeIngredient || [],
      instructions: recipe.instructions || recipe.recipeInstructions || [],
      // Feel free to add more like author, category, etc.
    };

    console.log('Scrape successful - title:', formatted.title);

    return res.status(200).json({
      success: true,
      recipe: formatted
    });
  } catch (err) {
    console.error('Scrape error:', err.message);
    console.error(err.stack);  // Full stack for Vercel logs

    let userError = 'Failed to import this recipe. The site may not be supported or blocked the request.';
    if (err.message?.includes('not supported') || err.message?.includes('not implemented')) {
      userError = 'Sorry, this recipe website isn\'t supported yet. Try a different one (e.g., Allrecipes, BBC Good Food).';
    }

    return res.status(500).json({ error: userError });
  }
}

export const config = {
  maxDuration: 30  // Give slow sites more time
};