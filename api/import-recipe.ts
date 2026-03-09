import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as cheerio from "cheerio";

// =====================================================
// Types
// =====================================================

type ParsedRecipe = {
  name: string;
  ingredients: string;
  instructions: string;
  photoUrl: string;
  sourceUrl: string;
};

// =====================================================
// Small helpers
// =====================================================

function cleanText(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function hasMeaningfulRecipeData(recipe: Partial<ParsedRecipe>): boolean {
  return !!(
    recipe.name?.trim() ||
    recipe.ingredients?.trim() ||
    recipe.instructions?.trim()
  );
}

function joinLines(lines: string[]): string {
  return lines.map((x) => cleanText(x)).filter(Boolean).join("\n");
}

// =====================================================
// Image helpers
// =====================================================

function pickBestImage(image: any): string {
  if (!image) return "";

  if (typeof image === "string") return image;

  if (Array.isArray(image)) {
    for (const item of image) {
      const found = pickBestImage(item);
      if (found) return found;
    }
    return "";
  }

  if (typeof image === "object") {
    if (typeof image.url === "string") return image.url;
    if (typeof image.contentUrl === "string") return image.contentUrl;
    if (typeof image["@id"] === "string") return image["@id"];
  }

  return "";
}

// =====================================================
// Instruction helpers
// =====================================================

function extractInstructionLines(value: any): string[] {
  if (!value) return [];

  if (typeof value === "string") {
    return [cleanText(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractInstructionLines(item));
  }

  if (typeof value === "object") {
    const lines: string[] = [];
    const type = value["@type"];

    const isHowToStep =
      type === "HowToStep" ||
      (Array.isArray(type) && type.includes("HowToStep"));

    const isHowToSection =
      type === "HowToSection" ||
      (Array.isArray(type) && type.includes("HowToSection"));

    if (isHowToStep) {
      if (typeof value.text === "string") lines.push(cleanText(value.text));
      else if (typeof value.name === "string") lines.push(cleanText(value.name));
    } else if (isHowToSection) {
      if (typeof value.name === "string") lines.push(cleanText(value.name));
      if (value.itemListElement) {
        lines.push(...extractInstructionLines(value.itemListElement));
      }
    } else {
      if (typeof value.text === "string") lines.push(cleanText(value.text));
      if (typeof value.name === "string") lines.push(cleanText(value.name));
      if (value.itemListElement) {
        lines.push(...extractInstructionLines(value.itemListElement));
      }
    }

    return lines.filter(Boolean);
  }

  return [];
}

function normalizeInstructions(value: any): string {
  return joinLines(extractInstructionLines(value));
}

// =====================================================
// JSON-LD helpers
// =====================================================

function isRecipeNode(obj: any): boolean {
  const type = obj?.["@type"];
  if (!type) return false;
  if (Array.isArray(type)) return type.includes("Recipe");
  return type === "Recipe";
}

function findRecipeObject(ld: any): any | null {
  if (!ld) return null;

  if (Array.isArray(ld)) {
    for (const item of ld) {
      const found = findRecipeObject(item);
      if (found) return found;
    }
    return null;
  }

  if (typeof ld !== "object") return null;

  if (isRecipeNode(ld)) return ld;

  const containers = [
    ld["@graph"],
    ld.mainEntity,
    ld.mainEntityOfPage,
    ld.itemListElement,
    ld.hasPart,
    ld.subjectOf,
  ];

  for (const container of containers) {
    const found = findRecipeObject(container);
    if (found) return found;
  }

  for (const key of Object.keys(ld)) {
    const value = ld[key];
    if (value && typeof value === "object") {
      const found = findRecipeObject(value);
      if (found) return found;
    }
  }

  return null;
}

function extractFromJsonLd($: cheerio.CheerioAPI, url: string): ParsedRecipe | null {
  const scripts = $('script[type="application/ld+json"]')
    .map((_, el) => $(el).text())
    .get()
    .filter(Boolean);

  for (const raw of scripts) {
    try {
      const parsed = JSON.parse(raw);
      const recipeNode = findRecipeObject(parsed);

      if (!recipeNode) continue;

      const name = cleanText(String(recipeNode.name || ""));

      const ingredientsArray = asArray<string>(
        recipeNode.recipeIngredient || recipeNode.ingredients
      )
        .map((item) => cleanText(String(item)))
        .filter(Boolean);

      const instructions = normalizeInstructions(recipeNode.recipeInstructions);
      const photoUrl = pickBestImage(recipeNode.image);

      const recipe: ParsedRecipe = {
        name,
        ingredients: ingredientsArray.join("\n"),
        instructions,
        photoUrl,
        sourceUrl: url,
      };

      if (hasMeaningfulRecipeData(recipe)) {
        return recipe;
      }
    } catch {
      // ignore malformed JSON-LD blocks
    }
  }

  return null;
}

// =====================================================
// Fallback HTML helpers
// =====================================================

function extractTextList($: cheerio.CheerioAPI, selectors: string[]): string[] {
  for (const selector of selectors) {
    const items = $(selector)
      .map((_, el) => cleanText($(el).text()))
      .get()
      .filter(Boolean);

    if (items.length >= 2) return items;
  }

  return [];
}

function extractSingleText($: cheerio.CheerioAPI, selectors: string[]): string {
  for (const selector of selectors) {
    const text = cleanText($(selector).first().text());
    if (text) return text;
  }

  return "";
}

function extractFromFallbackHtml($: cheerio.CheerioAPI, url: string): ParsedRecipe | null {
  const name =
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $("title").text() ||
    "";

  const photoUrl =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    $(".wprm-recipe-image img").attr("src") ||
    $(".mv-create-image img").attr("src") ||
    $(".tasty-recipes-image img").attr("src") ||
    "";

  const ingredientSelectors = [
    '[itemprop="recipeIngredient"]',
    ".wprm-recipe-ingredient",
    ".mv-create-ingredients li",
    ".tasty-recipes-ingredients li",
    ".recipe-ingredients li",
    ".ingredients li",
    ".ingredients-item",
    "li.ingredient",
  ];

  const instructionSelectors = [
    '[itemprop="recipeInstructions"] li',
    '[itemprop="recipeInstructions"] p',
    ".wprm-recipe-instruction",
    ".mv-create-instructions li",
    ".tasty-recipes-instructions li",
    ".recipe-method li",
    ".recipe-directions li",
    ".instructions li",
    ".direction",
  ];

  const ingredientsList = extractTextList($, ingredientSelectors);
  let instructionsList = extractTextList($, instructionSelectors);

  if (instructionsList.length === 0) {
    const blockText = extractSingleText($, [
      '[itemprop="recipeInstructions"]',
      ".wprm-recipe-instructions",
      ".mv-create-instructions",
      ".tasty-recipes-instructions",
      ".recipe-method",
      ".instructions",
    ]);

    if (blockText) {
      instructionsList = blockText
        .split(/\n|\. (?=[A-Z])/)
        .map((s) => cleanText(s))
        .filter(Boolean);
    }
  }

  const recipe: ParsedRecipe = {
    name: cleanText(name),
    ingredients: joinLines(ingredientsList),
    instructions: joinLines(instructionsList),
    photoUrl: cleanText(photoUrl),
    sourceUrl: url,
  };

  if (hasMeaningfulRecipeData(recipe)) {
    return recipe;
  }

  return null;
}

// =====================================================
// API handler
// =====================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { url } = req.body || {};

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Missing url" });
    }

    if (!/^https?:\/\//i.test(url)) {
      return res
        .status(400)
        .json({ error: "URL must start with http:// or https://" });
    }

        let response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Referer: "https://www.google.com/",
      },
      redirect: "follow",
    });

    if (!response.ok && !url.endsWith("/")) {
      response = await fetch(`${url}/`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Referer: "https://www.google.com/",
        },
        redirect: "follow",
      });
    }

    if (!response.ok) {
      return res.status(400).json({
        error: `Fetch failed: ${response.status} ${response.statusText}`,
      });
    }

if (!response.ok) {
  return res.status(400).json({
    error: `Fetch failed: ${response.status} ${response.statusText}`,
  });
}

    if (!response.ok) {
      return res.status(400).json({
        error: `Fetch failed: ${response.status} ${response.statusText}`,
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const jsonLdRecipe = extractFromJsonLd($, url);
    if (jsonLdRecipe) {
      return res.status(200).json({ recipe: jsonLdRecipe });
    }

    const fallbackRecipe = extractFromFallbackHtml($, url);
    if (fallbackRecipe) {
      return res.status(200).json({ recipe: fallbackRecipe });
    }

    return res.status(422).json({
      error:
        "Could not find recipe data on that page. Try another recipe site or add the recipe manually.",
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      error: err?.message || "Server error importing recipe",
    });
  }
}