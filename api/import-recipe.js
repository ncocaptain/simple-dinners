export default async function handler(req, res) {
  const allowedOrigins = ["https://dinners.ncocaptain.com", "capacitor://localhost", "http://localhost", "https://localhost"];
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", allowedOrigins.includes(origin) ? origin : "https://dinners.ncocaptain.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "URL required" });

  try {
    async function getHtml(targetUrl) {
      try {
        const response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
          }
        });
        return response.ok ? await response.text() : null;
      } catch (e) { return null; }
    }

    let html = await getHtml(url);
    
    // Fallback to Microlink if initial fetch fails
    if (!html || html.length < 500) {
      const mRes = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}&meta=true&content=true`);
      const mJson = await mRes.json();
      html = mJson?.data?.html || html;
    }

    if (!html) throw new Error("No HTML found");

    const jsonLdBlocks = [];
    const regex = /<script [^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1].trim());
        if (Array.isArray(parsed)) jsonLdBlocks.push(...parsed);
        else jsonLdBlocks.push(parsed);
      } catch (e) {}
    }

    const findRecipe = (obj) => {
      if (!obj || typeof obj !== 'object') return null;
      if (obj["@type"] === "Recipe" || (Array.isArray(obj["@type"]) && obj["@type"].includes("Recipe"))) return obj;
      for (const k in obj) {
        if (typeof obj[k] === 'object') {
          const found = findRecipe(obj[k]);
          if (found) return found;
        }
      }
      return null;
    };

    const recipe = findRecipe(jsonLdBlocks);
    const clean = (txt) => typeof txt === 'string' ? txt.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim() : "";

    // Safely extract ingredients
    const ingredients = Array.isArray(recipe?.recipeIngredient) 
      ? recipe.recipeIngredient.map(clean).filter(Boolean) 
      : [];

    // Safely extract instructions
    const rawSteps = recipe?.recipeInstructions || [];
    const instructions = (Array.isArray(rawSteps) ? rawSteps : [rawSteps]).flatMap(step => {
      if (typeof step === 'string') return clean(step);
      if (step?.text) return clean(step.text);
      if (Array.isArray(step?.itemListElement)) return step.itemListElement.map(s => clean(s.text || s.name));
      return [];
    }).filter(Boolean);

    let photoUrl = "";
    if (recipe?.image) {
      const img = recipe.image;
      photoUrl = Array.isArray(img) ? img[0] : (typeof img === 'string' ? img : img?.url || "");
    }

    return res.status(200).json({
      success: true,
      recipe: {
        name: recipe?.name || clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]) || "New Recipe",
        ingredients: ingredients.join("\n"),
        instructions: instructions.length > 0 ? instructions.join("\n") : "Steps available at source link!",
        photoUrl: photoUrl || "",
        sourceUrl: url
      }
    });

  } catch (err) {
    console.error("Scraper Error:", err);
    return res.status(200).json({ 
      success: true, 
      recipe: { name: "Manual Entry", ingredients: "", instructions: "Import failed. Please paste manually.", sourceUrl: url } 
    });
  }
}