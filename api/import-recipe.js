export default async function handler(req, res) {
  const allowedOrigins = ["https://dinners.ncocaptain.com", "capacitor://localhost", "http://localhost", "https://localhost"];
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", allowedOrigins.includes(origin) ? origin : "https://dinners.ncocaptain.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "URL required" });

  try {
    async function getHtml(targetUrl) {
      try {
        const response = await fetch(targetUrl, {
          // These headers are more specifically tuned to look like a modern Chrome browser
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1'
          }
        });
        return response.ok ? await response.text() : null;
      } catch (e) { return null; }
    }

    let html = await getHtml(url);
    
    // Microlink Fallback - Simplified
    if (!html || html.length < 500) {
      try {
        const mRes = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}&meta=true&content=true`);
        const mJson = await mRes.json();
        html = mJson?.data?.html || "";
      } catch (e) { html = ""; }
    }

    if (!html) {
      return res.status(200).json({
        success: true,
        recipe: { name: "Manual Import Needed", ingredients: "", instructions: "Site blocked automatic access. Please paste details manually!", sourceUrl: url }
      });
    }

    // --- JSON-LD DEEP DIVE ---
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
        if (obj[k] && typeof obj[k] === 'object') {
          const found = findRecipe(obj[k]);
          if (found) return found;
        }
      }
      return null;
    };

    const recipe = findRecipe(jsonLdBlocks);
    const clean = (txt) => typeof txt === 'string' ? txt.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim() : "";

    // Instruction logic: Drill deep for the actual text content
    const extractText = (val) => {
      if (typeof val === 'string') return val;
      if (val?.text) return val.text;
      if (val?.name) return val.name;
      return "";
    };

    const ingredients = Array.isArray(recipe?.recipeIngredient) ? recipe.recipeIngredient.map(clean).filter(Boolean) : [];
    const rawSteps = recipe?.recipeInstructions || [];
    const instructionList = (Array.isArray(rawSteps) ? rawSteps : [rawSteps]).flatMap(step => {
      if (step?.itemListElement) return step.itemListElement.map(s => clean(extractText(s)));
      return clean(extractText(step));
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
        instructions: instructionList.length > 0 ? instructionList.join("\n") : "Steps available at source link!",
        photoUrl: photoUrl || "",
        sourceUrl: url
      }
    });

  } catch (err) {
    return res.status(200).json({ 
      success: true, 
      recipe: { name: "Import Error", ingredients: "", instructions: "Please enter manually.", sourceUrl: url } 
    });
  }
}