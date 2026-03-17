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
    const data = await response.json();

    if (data.status !== 'success') throw new Error("Could not reach the recipe site.");

    // Simple normalization from the microlink data
    const recipe = {
      name: data.data.title || "New Recipe",
      ingredients: "Check the source link for ingredients!", // Microlink is a lighter scraper
      instructions: "Check the source link for instructions!",
      photoUrl: data.data.image?.url || "",
      effort: "normal",
      sourceUrl: url
    };

    return res.status(200).json({ recipe });

  } catch (err) {
    console.error("Scraper Error:", err.message);
    return res.status(500).json({ error: "Magic Import failed", details: err.message });
  }
}