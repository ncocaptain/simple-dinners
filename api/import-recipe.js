export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { url } = req.body || {};
  if (!url) {
    return res.status(400).json({ error: "URL required" });
  }

  try {
    const mLink = `https://api.microlink.io?url=${encodeURIComponent(
      url
    )}&meta=false&data.recipe.selector=script[type="application/ld+json"]`;

    const response = await fetch(mLink);
    const result = await response.json();

    if (result.status !== "success") {
      throw new Error("Microlink failed");
    }

    const safeHtml = result?.data?.html || "";
    const safeRecipeBlock = result?.data?.recipe || "";
    const safeText = result?.data?.text || "";
    const safeTitle = result?.data?.title || "New Recipe";

    function toArray(value) {
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    }

    function cleanText(value) {
      return String(value || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/\s+/g, " ")
        .trim();
    }

    function cleanLineArray(lines) {
      return lines
        .map((line) => cleanText(line))
        .filter(Boolean)
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

    function extractImage(imageField) {
      if (!imageField) return "";

      if (typeof imageField === "string") {
        return imageField;
      }

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
          const sectionSteps = extractInstructionText(input.itemListElement || []);
          return sectionSteps;
        }
      }

      return [];
    }

    function findRecipeInObject(obj) {
      if (!obj) return null;

      if (
        obj["@type"] === "Recipe" ||
        (Array.isArray(obj["@type"]) && obj["@type"].includes("Recipe"))
      ) {
        return obj;
      }

      if (obj["@graph"] && Array.isArray(obj["@graph"])) {
        for (const item of obj["@graph"]) {
          const found = findRecipeInObject(item);
          if (found) return found;
        }
      }

      if (Array.isArray(obj)) {
        for (const item of obj) {
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

    function parsePossibleJson(value) {
      if (!value) return null;
      if (typeof value !== "string") return value;

      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }

    let recipeData = null;

    const parsedRecipeBlock = parsePossibleJson(safeRecipeBlock);
    if (parsedRecipeBlock) {
      recipeData = findRecipeInObject(parsedRecipeBlock);
    }

    if (!recipeData && safeHtml) {
      const jsonLdRegex =
        /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

      let match;
      while ((match = jsonLdRegex.exec(safeHtml)) !== null) {
        const raw = match[1]?.trim();
        const parsed = parsePossibleJson(raw);

        if (!parsed) continue;

        const found = findRecipeInObject(parsed);
        if (found) {
          recipeData = found;
          break;
        }
      }
    }

    let ingredientsList = [];

    if (recipeData?.recipeIngredient) {
      ingredientsList = cleanLineArray(toArray(recipeData.recipeIngredient));
    } else {
      const greedyRegex =
        /^.*(\d|½|¼|¾|⅓|⅔|cup|cups|tbsp|tsp|teaspoon|teaspoons|tablespoon|tablespoons|oz|ounce|ounces|lb|lbs|pound|pounds|pkg|package|can|cans|clove|cloves).*$/gim;

      ingredientsList = cleanLineArray(safeText.match(greedyRegex) || []).slice(0, 30);
    }

    let instructionList = [];

    if (recipeData?.recipeInstructions) {
      instructionList = cleanLineArray(
        extractInstructionText(recipeData.recipeInstructions)
      );
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
            .slice(instructionStart + 1, instructionStart + 12)
            .filter((line) => line.length > 20)
        );
      }
    }

    const photoUrl =
      extractImage(recipeData?.image) ||
      extractImage(result?.data?.image) ||
      "";

    const recipeName = cleanText(recipeData?.name || safeTitle || "New Recipe");

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