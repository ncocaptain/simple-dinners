// api/import-recipe.js
// If using TypeScript, rename to .ts and add types as needed

const { scrape } = require('recipe-scrapers');  // or import { scrape } from 'recipe-scrapers';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed – use POST' });
  }

  const { url } = req.body;

  if (!url || typeof url !== 'string' || !url.match(/^https?:\/\//)) {
    return res.status(400).json({ error: 'Please provide a valid URL' });
  }

  try {
    const recipe = await scrape(url, {
      // Optional: pass custom fetch options if sites block default user-agent
      fetchOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    });

    // Normalize/shape the output (fields vary by site/parser)
    const normalized = {
      title: recipe.title || recipe.name || 'Untitled Recipe',
      description: recipe.description || '',
      image: recipe.image?.url || recipe.image || '',
      author: recipe.author || '',
      yields: recipe.yields || recipe.recipeYield || '4 servings',
      prepTime: recipe.prepTime || null,
      cookTime: recipe.cookTime || null,
      totalTime: recipe.totalTime || null,
      ingredients: Array.isArray(recipe.ingredients) 
        ? recipe.ingredients 
        : (recipe.recipeIngredient || []),
      instructions: Array.isArray(recipe.instructions) 
        ? recipe.instructions 
        : (typeof recipe.instructions === 'string' 
            ? recipe.instructions.split(/\n|\r\n/) 
            : recipe.recipeInstructions || []),
      category: recipe.category || '',
      cuisine: recipe.cuisine || '',
      // Add nutrition, ratings, etc. if present in recipe object
    };

    return res.status(200).json({ success: true, recipe: normalized });
  } catch (err) {
    console.error('Scrape error:', err);

    let userMessage = 'Failed to import the recipe. The site may not be supported or blocked access.';
    if (err.message?.includes('not implemented') || err.message?.includes('unsupported')) {
      userMessage = 'This recipe website is not supported yet. Try a different site or enter manually.';
    }

    return res.status(500).json({ error: userMessage, details: err.message });
  }
};

// Optional: longer timeout for slow sites
module.exports.config = {
  maxDuration: 30, // seconds
};