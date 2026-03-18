// api/import-recipe.js

import { scrape } from 'recipe-scrapers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url } = req.body;

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Valid URL required' });
  }

  try {
    const recipe = await scrape(url);

    const formatted = {
      title: recipe.title || recipe.name || 'Imported Recipe',
      description: recipe.description || '',
      image: recipe.image || '',
      yields: recipe.yields || '',
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      // add more fields as needed
    };

    return res.status(200).json({ success: true, recipe: formatted });
  } catch (err) {
    console.error('Scrape error:', err);
    const msg = err.message.includes('not supported')
      ? 'This website is not supported yet'
      : 'Failed to scrape recipe';

    return res.status(500).json({ error: msg });
  }
}

export const config = {
  maxDuration: 30,
};