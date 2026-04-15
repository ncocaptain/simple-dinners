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
    // 1. Better Fetcher with "Human" Headers
    async function getHtml(targetUrl) {
      try {
        const response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/ *;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          }
        });
        if (!response.ok) return null;
        return await response.text();
      } catch (e) {
        return null;
      }
    }

    // 2. The Fallback Logic (Microlink)
    let html = await getHtml(url);
    
    // If html is empty, we MUST use Microlink to act as our proxy
    if (!html || html.length < 500) {
      const mLink = `https://api.microlink.io?url=${encodeURIComponent(url)}&meta=true&content=true`;
      const mRes = await fetch(mLink);
      const mJson = await mRes.json();
      html = mJson?.data?.html || html;
    }

    if (!html) throw new Error("Could not reach website");

    // 3. Robust JSON-LD Extraction
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

    // Deep search for the Recipe object
    const findRecipe = (obj) => {
      if (!obj || typeof obj !== 'object') return null;
      if (obj["@type"] === "Recipe" || (Array.isArray(obj["@type"]) && obj["@type"].includes("Recipe"))) return obj;
      for (const k in obj) {
        const found = findRecipe(obj[k]);
        if (found) return found;
      }
      return null;
    };

    const recipe = findRecipe(jsonLdBlocks);

    if (!recipe) {
       return res.status(200).json({ 
         success: true, 
         recipe: { name: "Manual Entry Needed", ingredients: "", instructions: "We couldn't bypass the site's security. Please paste manually!", sourceUrl: url } 
       });
    }

    // 4. Data Formatting
    const clean = (txt) => txt?.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
    
    const ingredients = (recipe.recipeIngredient || []).map(clean).filter(Boolean);
    
    // Handle the Kitchn's nested Instruction format
    const instructions = (recipe.recipeInstructions || []).flatMap(step => {
      if (typeof step === 'string') return clean(step);
      if (step.text) return clean(step.text);
      if (step.itemListElement) return step.itemListElement.map(s => clean(s.text || s.name));
      return [];
    }).filter(Boolean);

    let photoUrl = "";
    if (recipe.image) {
      const img = recipe.image;
      photoUrl = Array.isArray(img) ? img[0] : (typeof img === 'string' ? img : img.url);
    }

    return res.status(200).json({
      success: true,
      recipe: {
        name: recipe.name || "New Recipe",
        ingredients: ingredients.join("\n"),
        instructions: instructions.length > 0 ? instructions.join("\n") : "Steps available at source link!",
        photoUrl: photoUrl || "",
        sourceUrl: url
      }
    });

  } catch (err) {
    return res.status(500).json({ error: "Server Error" });
  }
}