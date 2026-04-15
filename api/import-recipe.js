export default async function handler(req, res) {
  const allowedOrigins = [
    "https://dinners.ncocaptain.com",
    "capacitor://localhost",
    "http://localhost",
    "https://localhost",
  ];

  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", allowedOrigins.includes(origin) ? origin : "https://dinners.ncocaptain.com");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "URL required" });

  try {
    // --- HELPER FUNCTIONS ---
    function toArray(value) {
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    }

    function cleanText(value) {
      return String(value || "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<\/li>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&#39;/gi, "'")
        .replace(/&quot;/gi, '"')
        .replace(/&frac12;/gi, "½")
        .replace(/&frac14;/gi, "¼")
        .replace(/&frac34;/gi, "¾")
        .replace(/\s+/g, " ")
        .trim();
    }

    function isGarbageLine(line, isInstruction = false) {
      const s = String(line || "").trim();
      if (!s) return true;

      // Instructions are often very long (e.g., The Kitchn). 
      // We bump the limit to 800 characters for steps.
      const charLimit = isInstruction ? 800 : 300;
      if (s.length > charLimit) return true;

      // Check for code/technical bloat but allow "List" words if they are part of a sentence
      const technicalBloat = /@context|@graph|schema\.org|wp-|--wp-|linear-gradient|svg\+xml|data:image|function\(|document\.|window\.|stylesheet/i.test(s);
      const isHtml = /<\/?[a-z][\s\S]*>/i.test(s);
      const isCss = /[{};]/.test(s) && s.includes(':');

      return technicalBloat || isHtml || isCss;
    }

    function cleanLineArray(lines, isInstruction = false) {
      return lines
        .map((line) => cleanText(line))
        .filter(Boolean)
        .filter((line) => line.length > 1)
        .filter((line) => !isGarbageLine(line, isInstruction))
        .filter((line, index, arr) => arr.indexOf(line) === index);
    }

    function slugify(text) {
      return String(text || "recipe").toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
    }

    function toTitleCase(text) {
      return String(text || "").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    }

    // --- EXTRACTION LOGIC ---
    function extractJsonLdBlocks(html) {
      const blocks = [];
      const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
      let match;
      while ((match = jsonLdRegex.exec(html)) !== null) {
        try {
          const raw = match[1]?.trim();
          if (raw) blocks.push(JSON.parse(raw));
        } catch (e) { /* ignore malformed JSON */ }
      }
      return blocks;
    }

    function findRecipeInObject(obj) {
      if (!obj || typeof obj !== 'object') return null;
      if (obj["@type"] === "Recipe" || (Array.isArray(obj["@type"]) && obj["@type"].includes("Recipe"))) return obj;
      
      const values = Array.isArray(obj) ? obj : Object.values(obj);
      for (const val of values) {
        const found = findRecipeInObject(val);
        if (found) return found;
      }
      return null;
    }

    function extractInstructionText(input) {
  if (!input) return [];
  
  // If it's just a string, return it in an array
  if (typeof input === "string") return [input];

  // If it's an array (common for recipeInstructions)
  if (Array.isArray(input)) {
    return input.flatMap(item => {
      if (typeof item === "string") return item;
      // This part handles the { "@type": "HowToStep", "text": "..." } structure
      if (typeof item === "object") {
        return item.text || item.name || "";
      }
      return "";
    });
  }

  // If it's a nested object (some sites use a single object for one step)
  if (typeof input === "object") {
    return extractInstructionText(input.text || input.itemListElement || []);
  }

  return [];
}

    async function fetchWithTimeout(targetUrl) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          },
        });
        clearTimeout(id);
        return response.ok ? await response.text() : null;
      } catch (e) {
        return null;
      }
    }

    // --- EXECUTION ---
    let html = await fetchWithTimeout(url);
    let recipeData = null;

    if (html) {
      const blocks = extractJsonLdBlocks(html);
      recipeData = findRecipeInObject(blocks);
    }

    // Microlink Fallback if primary fetch or JSON-LD failed
    if (!recipeData) {
      try {
        const mLink = `https://api.microlink.io?url=${encodeURIComponent(url)}&meta=true`;
        const mRes = await fetch(mLink);
        const mJson = await mRes.json();
        if (mJson.status === "success") {
          const mHtml = mJson.data.html || "";
          html = html || mHtml;
          recipeData = findRecipeInObject(extractJsonLdBlocks(mHtml));
        }
      } catch (e) { console.error("Microlink failed"); }
    }

    // Final Mapping
    const ingredientsList = cleanLineArray(toArray(recipeData?.recipeIngredient || recipeData?.ingredients || []));
    const instructionList = cleanLineArray(extractInstructionText(recipeData?.recipeInstructions || recipeData?.instructions || []), true);
    
    // Image extraction logic
    let photoUrl = "";
    if (recipeData?.image) {
      const img = recipeData.image;
      photoUrl = typeof img === "string" ? img : (Array.isArray(img) ? img[0] : (img.url || img.contentUrl || ""));
    }

    const recipeName = toTitleCase(recipeData?.name || cleanText(html?.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]) || "New Recipe");

    const formatted = {
      name: recipeName,
      ingredients: ingredientsList.join("\n"),
      instructions: instructionList.length > 0 ? instructionList.join("\n") : "Steps available at source link!",
      photoUrl,
      slug: `${slugify(recipeName)}-${Date.now().toString().slice(-4)}`,
      sourceUrl: url,
      effort: "normal",
    };

    return res.status(200).json({ success: true, recipe: formatted });

  } catch (err) {
    return res.status(500).json({ error: "Magic Import failed. Use manual entry!" });
  }
}