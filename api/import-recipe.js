export default async function handler(req, res) {
  const allowedOrigins = [
    "https://dinners.ncocaptain.com",
    "capacitor://localhost",
    "http://localhost",
    "https://localhost",
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "https://dinners.ncocaptain.com");
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "URL required" });

  try {
    const target = new URL(url);
    const hostname = target.hostname.toLowerCase();

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

    function extractReadableText(html) {
      return String(html || "")
        .replace(/<li[^>]*>/gi, "\n")
        .replace(/<\/li>/gi, "\n")
        .replace(/<p[^>]*>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\n\s+/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    }

    function isGarbageLine(line) {
      const s = String(line || "").trim();
      if (!s || s.length > 500) return true;
      return /@context|@graph|schema\.org|wp-|--wp-|linear-gradient|svg\+xml|data:image|function\(|document\.|window\.|stylesheet/i.test(s);
    }

    function cleanLineArray(lines) {
      return lines
        .map((line) => cleanText(line))
        .filter(Boolean)
        .filter((line) => line.length > 1 && !isGarbageLine(line))
        .filter((line, index, arr) => arr.indexOf(line) === index);
    }

    function slugify(text) {
      return String(text || "recipe").toLowerCase().trim()
        .replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
    }

    function toTitleCase(text) {
      return String(text || "").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    }

    function extractImage(imageField) {
      if (!imageField) return "";
      if (typeof imageField === "string") return imageField;
      if (Array.isArray(imageField)) return extractImage(imageField[0]);
      if (typeof imageField === "object") return imageField.url || imageField.contentUrl || "";
      return "";
    }

    function findRecipeInObject(obj) {
      if (!obj) return null;
      const type = obj["@type"];
      if (type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"))) return obj;
      if (Array.isArray(obj)) {
        for (const item of obj) {
          const found = findRecipeInObject(item);
          if (found) return found;
        }
      }
      if (obj["@graph"] && Array.isArray(obj["@graph"])) {
        for (const item of obj["@graph"]) {
          const found = findRecipeInObject(item);
          if (found) return found;
        }
      }
      if (typeof obj === "object") {
        for (const key of Object.keys(obj)) {
          const found = findRecipeInObject(obj[key]);
          if (found) return found;
        }
      }
      return null;
    }

    function extractJsonLdBlocks(html) {
      const blocks = [];
      const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
      let match;
      while ((match = jsonLdRegex.exec(html)) !== null) {
        try {
          const parsed = JSON.parse(match[1].trim());
          if (parsed) blocks.push(parsed);
        } catch (e) {}
      }
      return blocks;
    }

    function extractInstructionText(input) {
      if (!input) return [];
      if (typeof input === "string") return [cleanText(input)];
      if (Array.isArray(input)) {
        let all = [];
        for (const item of input) all = all.concat(extractInstructionText(item));
        return all;
      }
      if (typeof input === "object") {
        if (input.text) return [cleanText(input.text)];
        if (input.itemListElement) return extractInstructionText(input.itemListElement);
      }
      return [];
    }

    // --- FETCH LOGIC ---
    async function fetchRenderedHtml(targetUrl) {
      // Added waitForSelector to ensure Allrecipes JS loads the list
      const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(targetUrl)}&render=true&waitForSelector=.mntl-structured-ingredients__list`;
      const response = await fetch(apiUrl);
      const result = await response.json();
      if (result.status !== "success") throw new Error("Microlink failed");
      return result.data;
    }

    async function fetchDirectHtml(targetUrl) {
      const response = await fetch(targetUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" }
      });
      if (!response.ok) throw new Error("Direct fetch blocked");
      return await response.text();
    }

    let safeHtml = "";
    let safeTitle = "";
    let photoUrl = "";
    let recipeData = null;

    // Logic: Allrecipes requires rendering. Others try direct first.
    if (hostname.includes("allrecipes.com")) {
      const rendered = await fetchRenderedHtml(url);
      safeHtml = rendered.html;
      safeTitle = rendered.title;
      photoUrl = extractImage(rendered.image);
    } else {
      try {
        safeHtml = await fetchDirectHtml(url);
      } catch (e) {
        const rendered = await fetchRenderedHtml(url);
        safeHtml = rendered.html;
        safeTitle = rendered.title;
        photoUrl = extractImage(rendered.image);
      }
    }

    // Try JSON-LD first (Most accurate)
    const blocks = extractJsonLdBlocks(safeHtml);
    recipeData = findRecipeInObject(blocks);

    // --- INGREDIENT EXTRACTION ---
    let ingredientsList = [];
    if (recipeData?.recipeIngredient) {
      ingredientsList = cleanLineArray(toArray(recipeData.recipeIngredient));
    }

    if (ingredientsList.length === 0) {
      // Current Allrecipes class patterns
      const patterns = [
        /class="[^"]*mntl-structured-ingredients__list-item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
        /class="[^"]*ingredients-item-name[^"]*"[^>]*>([\s\S]*?)<\/span>/gi
      ];
      for (const pattern of patterns) {
        const matches = [...safeHtml.matchAll(pattern)].map(m => cleanText(m[1]));
        if (matches.length > 0) {
          ingredientsList = cleanLineArray(matches);
          break;
        }
      }
    }

    // --- INSTRUCTION EXTRACTION ---
    let instructionList = [];
    if (recipeData?.recipeInstructions) {
      instructionList = cleanLineArray(extractInstructionText(recipeData.recipeInstructions));
    }

    if (instructionList.length === 0) {
      const patterns = [
        /class="[^"]*mntl-sc-block-group--LI[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
        /class="[^"]*recipe__steps-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
      ];
      for (const pattern of patterns) {
        const matches = [...safeHtml.matchAll(pattern)].map(m => cleanText(m[1]));
        if (matches.length > 0) {
          instructionList = cleanLineArray(matches);
          break;
        }
      }
    }

    // Final clean up
    const finalName = toTitleCase(recipeData?.name || safeTitle || "New Recipe");
    const successLevel = (ingredientsList.length > 0 && instructionList.length > 0) ? "full" : "partial";

    return res.status(200).json({
      success: true,
      successLevel,
      recipe: {
        name: finalName,
        ingredients: ingredientsList.join("\n"),
        instructions: instructionList.length > 0 ? instructionList.join("\n") : "Steps available at source link!",
        photoUrl: photoUrl || extractImage(recipeData?.image),
        slug: `${slugify(finalName)}-${Date.now().toString().slice(-4)}`,
        sourceUrl: url,
        importStatus: successLevel
      }
    });

  } catch (err) {
    console.error("Import failed:", err);
    return res.status(500).json({ error: "Magic Import failed. Use manual entry!" });
  }
}