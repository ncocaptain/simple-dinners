export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { url } = req.body || {};
  if (!url) {
    return res.status(400).json({ error: "URL required" });
  }

  try {
    const mLink = `https://api.microlink.io?url=${encodeURIComponent(url)}&meta=true`;
    const response = await fetch(mLink);
    const result = await response.json();

    if (result.status !== "success") {
      throw new Error("Microlink failed");
    }

    const safeHtml = result?.data?.html || "";
    const safeText = result?.data?.text || "";
    const safeTitle = result?.data?.title || "";

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

    function cleanLineArray(lines) {
      return lines
        .map((line) => cleanText(line))
        .filter(Boolean)
        .filter((line) => line.length > 1)
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
        return (
          imageField.url ||
          imageField.contentUrl ||
          imageField.thumbnailUrl ||
          ""
        );
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

      if (
        type === "Recipe" ||
        (Array.isArray(type) && type.includes("Recipe"))
      ) {
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
        if (input.text) {
          return extractInstructionText(input.text);
        }

        if (input.itemListElement) {
          return extractInstructionText(input.itemListElement);
        }

        if (input.name && input["@type"] === "HowToSection") {
          return extractInstructionText(input.itemListElement || []);
        }
      }

      return [];
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

    function extractIngredientsFromHtml(html) {
      const collected = [];

      const patterns = [
        /<li[^>]*data-ingredient[^>]*>([\s\S]*?)<\/li>/gi,
        /<li[^>]*class=["'][^"']*ingredient[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi,
        /<span[^>]*class=["'][^"']*ingredients-item-name[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi,
        /<p[^>]*class=["'][^"']*ingredient[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi,
        /<li[^>]*>([\s\S]*?)<\/li>/gi,
      ];

      for (const pattern of patterns) {
        const matches = [...html.matchAll(pattern)].map((m) => cleanText(m[1]));
        const filtered = matches.filter((line) =>
          /(\d|½|¼|¾|⅓|⅔|cup|cups|tbsp|tsp|teaspoon|teaspoons|tablespoon|tablespoons|oz|ounce|ounces|lb|lbs|pound|pounds|clove|cloves|salt|pepper|oil|butter|garlic|onion|tofu)/i.test(
            line
          )
        );

        if (filtered.length >= 3) {
          collected.push(...filtered);
          break;
        }
      }

      return cleanLineArray(collected).slice(0, 40);
    }

    function extractInstructionsFromHtml(html) {
      const collected = [];

      const patterns = [
        /<li[^>]*class=["'][^"']*instruction[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi,
        /<p[^>]*class=["'][^"']*instruction[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi,
        /<div[^>]*class=["'][^"']*direction[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
      ];

      for (const pattern of patterns) {
        const matches = [...html.matchAll(pattern)].map((m) => cleanText(m[1]));
        const filtered = matches.filter((line) => line.length > 20);
        if (filtered.length >= 2) {
          collected.push(...filtered);
          break;
        }
      }

      return cleanLineArray(collected).slice(0, 20);
    }

    let recipeData = null;

    const jsonLdBlocks = extractJsonLdBlocks(safeHtml);
    for (const block of jsonLdBlocks) {
      const found = findRecipeInObject(block);
      if (found) {
        recipeData = found;
        break;
      }
    }

    let ingredientsList = [];

    if (recipeData?.recipeIngredient) {
      ingredientsList = cleanLineArray(toArray(recipeData.recipeIngredient));
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

    if (ingredientsList.length === 0 && safeHtml) {
      ingredientsList = extractIngredientsFromHtml(safeHtml);
    }

    if (ingredientsList.length === 0 && safeText) {
      const lines = safeText
        .split(/\r?\n/)
        .map((line) => cleanText(line))
        .filter(Boolean);

      const likelyIngredients = lines.filter((line) =>
        /(\d|½|¼|¾|⅓|⅔|cup|cups|tbsp|tsp|teaspoon|teaspoons|tablespoon|tablespoons|oz|ounce|ounces|lb|lbs|pound|pounds|clove|cloves|salt|pepper|oil|butter|garlic|onion|tofu)/i.test(
          line
        )
      );

      ingredientsList = cleanLineArray(likelyIngredients).slice(0, 30);
    }

    let instructionList = [];

    if (recipeData?.recipeInstructions) {
      instructionList = cleanLineArray(
        extractInstructionText(recipeData.recipeInstructions)
      );
    }

    if (instructionList.length === 0 && safeHtml) {
      instructionList = extractInstructionsFromHtml(safeHtml);
    }

    if (instructionList.length === 0 && safeText) {
      const textLines = safeText
        .split(/\r?\n/)
        .map((line) => cleanText(line))
        .filter(Boolean);

      const instructionStart = textLines.findIndex((line) =>
        /instructions|directions|method|preparation/i.test(line)
      );

      if (instructionStart >= 0) {
        instructionList = cleanLineArray(
          textLines
            .slice(instructionStart + 1, instructionStart + 14)
            .filter((line) => line.length > 20)
        );
      }
    }

    const photoUrl =
      extractImage(recipeData?.image) ||
      extractImage(result?.data?.image) ||
      "";

    const rawName =
      recipeData?.name ||
      safeTitle ||
      titleFromUrl(url) ||
      "New Recipe";

    const recipeName = toTitleCase(cleanText(rawName)) || "New Recipe";

    const formatted = {
      name: recipeName,
      ingredients: ingredientsList.join("\n"),
      instructions:
        instructionList.length > 0
          ? instructionList.join("\n")
          : "Steps available at source link!",
      photoUrl,
      slug: `${slugify(recipeName)}-${Date.now().toString().slice(-4)}`,
      sourceUrl: url,
      effort: "normal",
    };

    return res.status(200).json({
      success: true,
      recipe: formatted,
    });
  } catch (err) {
    console.error("Magic Import failed:", err);
    return res.status(500).json({
      error: "Magic Import failed. Use manual entry!",
    });
  }
}