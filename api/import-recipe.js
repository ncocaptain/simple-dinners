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

    function isGarbageLine(line) {
      const s = String(line || "").trim();
      if (!s) return true;

      return (
        s.length > 300 ||
        /@context|@graph|schema\.org|wp-|--wp-|linear-gradient|svg\+xml|data:image|@media|function\(|document\.|window\.|stylesheet|Breadcrumb|organization|listitem/i.test(s) ||
        /<\/?[a-z][\s\S]*>/i.test(s) ||
        /[{};]/.test(s) ||
        /(https?:\/\/\S+)/i.test(s) ||
        s.split(" ").length > 45
      );
    }

    function cleanLineArray(lines) {
      return lines
        .map((line) => cleanText(line))
        .filter(Boolean)
        .filter((line) => line.length > 1)
        .filter((line) => !isGarbageLine(line))
        .filter((line, index, arr) => arr.indexOf(line) === index);
    }

    function slugify(text) {
      return String(text || "recipe")
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }

    function toTitleCase(text) {
      return String(text || "")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    function titleFromUrl(inputUrl) {
      try {
        const pathname = new URL(inputUrl).pathname;
        const lastPart = pathname.split("/").filter(Boolean).pop() || "";
        return lastPart.replace(/[-_]+/g, " ").trim();
      } catch {
        return "";
      }
    }

    function extractImage(imageField) {
      if (!imageField) return "";
      if (typeof imageField === "string") return imageField;

      if (Array.isArray(imageField)) {
        for (const item of imageField) {
          const found = extractImage(item);
          if (found) return found;
        }
        return "";
      }

      if (typeof imageField === "object") {
        return imageField.url || imageField.contentUrl || imageField.thumbnailUrl || "";
      }

      return "";
    }

    function parsePossibleJson(value) {
      if (!value) return null;
      if (typeof value !== "string") return value;

      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }

    function findRecipeInObject(obj) {
      if (!obj) return null;

      const type = obj["@type"];

      if (type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"))) {
        return obj;
      }

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
          const value = obj[key];
          if (value && typeof value === "object") {
            const found = findRecipeInObject(value);
            if (found) return found;
          }
        }
      }

      return null;
    }

    function extractJsonLdBlocks(html) {
      const blocks = [];
      const jsonLdRegex =
        /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

      let match;
      while ((match = jsonLdRegex.exec(html)) !== null) {
        const raw = match[1]?.trim();
        if (!raw) continue;

        const parsed = parsePossibleJson(raw);
        if (parsed) blocks.push(parsed);
      }

      return blocks;
    }

    function extractInstructionText(input) {
      if (!input) return [];

      if (typeof input === "string") {
        const text = cleanText(input);
        if (!text) return [];

        const splitByLines = text
          .split(/\r?\n/)
          .map((x) => cleanText(x))
          .filter(Boolean);

        if (splitByLines.length > 1) return splitByLines;

        const splitBySentence = text
          .split(/(?<=[.?!])\s+(?=[A-Z0-9])/)
          .map((x) => cleanText(x))
          .filter(Boolean);

        return splitBySentence.length > 1 ? splitBySentence : [text];
      }

      if (Array.isArray(input)) {
        let all = [];
        for (const item of input) {
          all = all.concat(extractInstructionText(item));
        }
        return cleanLineArray(all);
      }

      if (typeof input === "object") {
        if (input.text) return extractInstructionText(input.text);
        if (input.name && !input.text) return extractInstructionText(input.name);
        if (input.itemListElement) return extractInstructionText(input.itemListElement);

        if (input["@type"] === "HowToStep" && input.text) {
          return extractInstructionText(input.text);
        }

        if (input["@type"] === "HowToSection") {
          return extractInstructionText(input.itemListElement || []);
        }
      }

      return [];
    }

    function looksLikeIngredient(line) {
      const s = cleanText(line);
      if (!s || isGarbageLine(s)) return false;

      return /(\d|½|¼|¾|⅓|⅔|cup|cups|tbsp|tsp|teaspoon|tablespoon|oz|ounce|lb|pound|clove|can|package|box|salt|pepper|oil|butter|garlic|onion|cheese|milk|cream|egg|flour|sugar|basil|tomato|broth|stock|beans|corn|rice|pasta|chicken|beef|pork|shrimp|lemon|lime|cilantro|parsley)/i.test(
        s
      );
    }

    function looksLikeStep(line) {
      const s = cleanText(line);
      if (!s || isGarbageLine(s)) return false;
      if (s.length < 18) return false;
      if (/advertisement|rate this recipe|print|save|share|review|nutrition/i.test(s)) {
        return false;
      }

      return /mix|stir|cook|bake|heat|place|add|whisk|combine|pour|season|serve|grill|broil|simmer|preheat|remove|transfer|marinate|drain|slice|flip|cover|reduce|bring|boil|blend|puree/i.test(
        s
      );
    }

    function extractAllRecipesIngredients(html) {
      const collected = [];

      const patterns = [
        /<span[^>]*class=["'][^"']*ingredients-item-name[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi,
        /<li[^>]*class=["'][^"']*mntl-structured-ingredients__list-item[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi,
        /<p[^>]*class=["'][^"']*mntl-structured-ingredients__list-item[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi,
        /<span[^>]*data-ingredient-name=["']true["'][^>]*>([\s\S]*?)<\/span>/gi,
      ];

      for (const pattern of patterns) {
        const matches = [...html.matchAll(pattern)]
          .map((m) => cleanText(m[1]))
          .filter(Boolean);

        if (matches.length > 0) {
          collected.push(...matches);
          break;
        }
      }

      return cleanLineArray(collected).slice(0, 60);
    }

    function extractAllRecipesInstructions(html) {
      const collected = [];

      const patterns = [
        /<li[^>]*class=["'][^"']*mntl-sc-block-group--LI[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi,
        /<p[^>]*class=["'][^"']*comp mntl-sc-block mntl-sc-block-html[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi,
        /<div[^>]*class=["'][^"']*comp mntl-sc-block mntl-sc-block-html[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
      ];

      for (const pattern of patterns) {
        const matches = [...html.matchAll(pattern)]
          .map((m) => cleanText(m[1]))
          .filter(Boolean)
          .filter(looksLikeStep);

        if (matches.length > 0) {
          collected.push(...matches);
          break;
        }
      }

      return cleanLineArray(collected).slice(0, 30);
    }

    function extractIngredientsFromHtml(html) {
      const collected = [];

      const patterns = [
        /<span[^>]*class=["'][^"']*ingredients-item-name[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi,
        /<li[^>]*class=["'][^"']*mntl-structured-ingredients__list-item[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi,
        /<p[^>]*class=["'][^"']*mntl-structured-ingredients__list-item[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi,
        /<li[^>]*class=["'][^"']*ingredient[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi,
        /<li[^>]*data-ingredient[^>]*>([\s\S]*?)<\/li>/gi,
      ];

      for (const pattern of patterns) {
        const matches = [...html.matchAll(pattern)]
          .map((m) => cleanText(m[1]))
          .filter(Boolean);

        const filtered = matches.filter(looksLikeIngredient);

        if (filtered.length >= 1) {
          collected.push(...filtered);
          break;
        }
      }

      return cleanLineArray(collected).slice(0, 60);
    }

    function extractInstructionsFromHtml(html) {
      const collected = [];

      const patterns = [
        /<li[^>]*class=["'][^"']*mntl-sc-block-group--LI[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi,
        /<li[^>]*class=["'][^"']*comp mntl-sc-block mntl-sc-block-html[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi,
        /<li[^>]*class=["'][^"']*instruction[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi,
        /<div[^>]*class=["'][^"']*direction[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
        /<p[^>]*class=["'][^"']*instruction[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi,
      ];

      for (const pattern of patterns) {
        const matches = [...html.matchAll(pattern)]
          .map((m) => cleanText(m[1]))
          .filter(Boolean)
          .filter(looksLikeStep);

        if (matches.length >= 1) {
          collected.push(...matches);
          break;
        }
      }

      return cleanLineArray(collected).slice(0, 30);
    }

    async function fetchDirectHtml(targetUrl) {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: "https://www.google.com/",
          DNT: "1",
        },
      });

      if (!response.ok) {
        throw new Error(`Direct fetch failed: ${response.status}`);
      }

      return await response.text();
    }

    let safeHtml = "";
    let safeText = "";
    let safeTitle = "";
    let recipeData = null;
    let photoUrl = "";

    try {
      safeHtml = await fetchDirectHtml(url);
      safeText = cleanText(safeHtml);
      safeTitle =
        cleanText(safeHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "") ||
        "";

      const jsonLdBlocks = extractJsonLdBlocks(safeHtml);
      for (const block of jsonLdBlocks) {
        const found = findRecipeInObject(block);
        if (found) {
          recipeData = found;
          break;
        }
      }

      photoUrl = extractImage(recipeData?.image);

      console.log("DIRECT FETCH OK", {
        title: safeTitle,
        htmlLength: safeHtml.length,
        textLength: safeText.length,
        foundRecipe: !!recipeData,
        hostname,
      });
    } catch (directErr) {
      console.log("DIRECT FETCH FAILED:", directErr?.message || directErr);
    }

    if (!safeHtml || (!recipeData && !safeTitle)) {
      try {
        const mLink = `https://api.microlink.io?url=${encodeURIComponent(
          url
        )}&meta=true`;
        const response = await fetch(mLink);
        const result = await response.json();

        if (result.status === "success") {
          const microlinkHtml = result?.data?.html || "";
          const microlinkText = result?.data?.text || "";
          const microlinkTitle = result?.data?.title || "";

          if (!safeHtml) safeHtml = microlinkHtml;
          if (!safeText) safeText = microlinkText;
          if (!safeTitle) safeTitle = microlinkTitle;

          if (!recipeData && microlinkHtml) {
            const jsonLdBlocks = extractJsonLdBlocks(microlinkHtml);
            for (const block of jsonLdBlocks) {
              const found = findRecipeInObject(block);
              if (found) {
                recipeData = found;
                break;
              }
            }
          }

          if (!photoUrl) {
            photoUrl =
              extractImage(recipeData?.image) ||
              extractImage(result?.data?.image) ||
              "";
          }

          console.log("MICROLINK FALLBACK", {
            title: microlinkTitle,
            htmlLength: microlinkHtml.length,
            textLength: microlinkText.length,
            foundRecipe: !!recipeData,
          });
        }
      } catch (microlinkErr) {
        console.log("MICROLINK FAILED:", microlinkErr?.message || microlinkErr);
      }
    }

    let ingredientsList = [];

    if (recipeData?.recipeIngredient) {
      ingredientsList = cleanLineArray(toArray(recipeData.recipeIngredient));
    }

    if (ingredientsList.length === 0 && recipeData?.nutrition?.ingredient) {
      ingredientsList = cleanLineArray(toArray(recipeData.nutrition.ingredient));
    }

    if (ingredientsList.length === 0 && recipeData) {
      const altFields = [
        recipeData.ingredients,
        recipeData.recipeIngredients,
        recipeData.ingredient,
      ];

      for (const field of altFields) {
        if (!field) continue;
        const extracted = cleanLineArray(toArray(field));
        if (extracted.length > 0) {
          ingredientsList = extracted;
          break;
        }
      }
    }

    if (ingredientsList.length === 0 && hostname.includes("allrecipes") && safeHtml) {
      ingredientsList = extractAllRecipesIngredients(safeHtml);
    }

    if (ingredientsList.length === 0 && safeHtml) {
      ingredientsList = extractIngredientsFromHtml(safeHtml);
    }

    if (ingredientsList.length === 0 && safeText) {
      const lines = safeText
        .split(/\r?\n/)
        .map((line) => cleanText(line))
        .filter(Boolean);

      ingredientsList = cleanLineArray(lines.filter(looksLikeIngredient)).slice(0, 40);
    }

    let instructionList = [];

    if (recipeData?.recipeInstructions) {
      instructionList = cleanLineArray(
        extractInstructionText(recipeData.recipeInstructions)
      );
    }

    if (instructionList.length === 0 && recipeData?.instructions) {
      instructionList = cleanLineArray(extractInstructionText(recipeData.instructions));
    }

    if (instructionList.length === 0 && hostname.includes("allrecipes") && safeHtml) {
      instructionList = extractAllRecipesInstructions(safeHtml);
    }

    if (instructionList.length === 0 && safeHtml) {
      instructionList = extractInstructionsFromHtml(safeHtml);
    }

    if (instructionList.length === 0 && safeText) {
      const lines = safeText
        .split(/\r?\n/)
        .map((line) => cleanText(line))
        .filter(Boolean);

      instructionList = cleanLineArray(lines.filter(looksLikeStep)).slice(0, 20);
    }

    const rawName =
      recipeData?.name || safeTitle || titleFromUrl(url) || "New Recipe";

    const recipeName = toTitleCase(cleanText(rawName)) || "New Recipe";

    if (!photoUrl && safeHtml) {
      photoUrl =
        cleanText(
          safeHtml.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
            ""
        ) ||
        cleanText(
          safeHtml.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
            ""
        ) ||
        "";
    }

    const hasIngredients = ingredientsList.length > 0;
    const hasInstructions = instructionList.length > 0;

    const successLevel =
      hasIngredients && hasInstructions
        ? "full"
        : hasIngredients || hasInstructions
        ? "partial"
        : "metadata-only";

    console.log("FINAL IMPORT RESULT", {
      recipeName,
      ingredientsCount: ingredientsList.length,
      instructionsCount: instructionList.length,
      hasPhoto: !!photoUrl,
      successLevel,
      hostname,
    });

    const formatted = {
      name: recipeName,
      ingredients: ingredientsList.join("\n"),
      instructions: hasInstructions
        ? instructionList.join("\n")
        : "Steps available at source link!",
      photoUrl,
      slug: `${slugify(recipeName)}-${Date.now().toString().slice(-4)}`,
      sourceUrl: url,
      effort: "normal",
      importStatus: successLevel,
    };

    return res.status(200).json({
  success: true,
  successLevel,
  debugVersion: "importer-v2-allrecipes-fallback",
  recipe: formatted,
});
  } catch (err) {
    console.error("Magic Import failed:", err);
    return res.status(500).json({
      error: "Magic Import failed. Use manual entry!",
    });
  }
}