// api/import-recipe.js
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "No URL provided" });

    // Using an API-based scraper that is much more stable on Vercel
    const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}&palette=true&audio=true&video=true&iframe=true`);
    // Inside your scraper try/catch
const data = await response.json();

// If the API doesn't find the ingredients, we'll try to pull them from the metadata
const ingredientsText = data.data.text?.slice(0, 1000) || ""; 
// Use a regex to look for typical ingredient lines (numbers + units)
const potentialIngredients = ingredientsText.match(/^(\d|½|¼|¾|cup|tbsp|tsp).*/gim);

const recipe = {
  name: data.data.title || "New Recipe",
  ingredients: potentialIngredients ? potentialIngredients.join('\n') : "Check source link for ingredients!",
  photoUrl: data.data.image?.url || "",
  sourceUrl: url
};

    return res.status(200).json({ recipe });

  } catch (err) {
    console.error("Scraper Error:", err.message);
    return res.status(500).json({ error: "Magic Import failed", details: err.message });
  }
}