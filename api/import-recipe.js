// api/import-recipe.js
// Use ESM: import / export

import { scrape } from 'recipe-scrapers';

export default async function handler(req, res) {
  console.log('Invocation started for URL:', req.body?.url);  // Logs to Vercel

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed – use POST' });
  }

  const { url } = req.body;

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Valid URL required' });
  }

  try {
    console.log('Scraping:', url);
    const recipe = await scrape(url);  // or scrape(url, { fetchOptions: { ... } }) if needed

    // Normalize fields (adjust based on what recipe-scrapers returns)
    const normalized = {
      title: recipe.title || 'No title found',
      description: recipe.description || '',
      image: recipe.image || '',
      yields: recipe.yields || 'Unknown',
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      // Add more as needed
    };

    console.log('Success - title:', normalized.title);
    return res.status(200).json({ success: true, recipe: normalized });
  } catch (err) {
    console.error('Scrape failed:', err.message, err.stack);
    let message = 'Failed to import recipe';
    if (err.message?.includes('not supported') || err.message?.includes('not implemented')) {
      message = 'This site is not supported yet – try another URL';
    }
    return res.status(500).json({ error: message });
  }
}

// Optional: longer timeout
export const config = {
  maxDuration: 30,
};