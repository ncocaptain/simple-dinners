// api/import-recipe.js

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

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/'
      },
      redirect: 'follow',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    // Simple regex to find JSON-LD script tags (robust enough for most sites)
    const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let recipeData = null;

    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const jsonStr = match[1].trim();
        const data = JSON.parse(jsonStr);

        // Handle @graph or direct @type: Recipe
        if (data['@type'] === 'Recipe') {
          recipeData = data;
          break;
        } else if (data['@graph']) {
          recipeData = data['@graph'].find(item => item['@type'] === 'Recipe');
          if (recipeData) break;
        }
      } catch (parseErr) {
        console.warn('JSON-LD parse error:', parseErr.message);
      }
    }

    if (!recipeData) {
      throw new Error('No valid Recipe JSON-LD found on the page');
    }

    // Normalize to your app's format
    const formatted = {
      title: recipeData.name || 'Imported Recipe',
      description: recipeData.description || '',
      image: recipeData.image?.url || recipeData.image || recipeData.images?.[0] || '',
      yields: recipeData.recipeYield || 'Unknown servings',
      prepTime: recipeData.prepTime,
      cookTime: recipeData.cookTime,
      totalTime: recipeData.totalTime,
      ingredients: recipeData.recipeIngredient || [],
      instructions: recipeData.recipeInstructions?.map(step => typeof step === 'string' ? step : step.text) || [],
      // extras
      author: recipeData.author?.name || '',
      category: recipeData.recipeCategory || '',
      cuisine: recipeData.recipeCuisine || ''
    };

    console.log('Extracted success - title:', formatted.title);

    return res.status(200).json({
      success: true,
      recipe: formatted
    });
  } catch (err) {
    console.error('Extraction failed:', err.message);
    console.error(err.stack || err);

    let msg = 'Failed to import recipe – site may block automated requests.';
    if (err.message.includes('402')) {
      msg = 'Site blocked the request (402 Payment Required) – likely anti-bot protection. Try manual entry or different URL.';
    } else if (err.message.includes('No valid Recipe')) {
      msg = 'Could not find structured recipe data on the page.';
    }

    return res.status(500).json({ error: msg });
  }
}

export const config = {
  maxDuration: 30,
};