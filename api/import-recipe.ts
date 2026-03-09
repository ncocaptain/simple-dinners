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

function hasMeaningfulData(recipe: Partial<ParsedRecipe>): boolean {
  return !!(
    recipe.name?.trim() ||
    recipe.ingredients?.trim() ||
    recipe.instructions?.trim()
  );
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

    if (typeof value.text === "string") {
      lines.push(cleanText(value.text));
    }

    if (typeof value.name === "string") {
      lines.push(cleanText(value.name));
    }

    if (value.itemListElement) {
      lines.push(...extractInstructionLines(value.itemListElement));
    }

    return lines.filter(Boolean);
  }

  return [];
}

function normalizeInstructions(value: any): string {
  return extractInstructionLines(value)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

// =====================================================
// JSON-LD helpers
// =====================================================

function findRecipeObject(ld: any): any | null {
  if (!ld) return null;

  const isRecipe = (obj: any) =>
    obj &&
    (obj["@type"] === "Recipe" ||
      (Array.isArray(obj["@type"]) && obj["@type"].includes("Recipe")));

  if (Array.isArray(ld)) {
    for (const item of ld) {
      const found = findRecipeObject(item);
      if (found) return found;
    }
    return null;
  }

  if (typeof ld === "object") {
    if (isRecipe(ld)) return ld;

    if (ld["@graph"]) {
      const found = findRecipeObject(ld["@graph"]);
      if (found) return found;
    }

    if (ld.mainEntity) {
      const found = findRecipeObject(ld.mainEntity);
      if (found) return found;
    }

    if (ld.mainEntityOfPage) {
      const found = findRecipeObject(ld.mainEntityOfPage);
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

      const name = String(recipeNode.name || "").trim();

      const ingredientsArray = asArray<string>(
        recipeNode.recipeIngredient || recipeNode.ingredients
      )
        .map((item) => cleanText(String(item)))
        .filter(Boolean);

      const ingredients = ingredientsArray.join("\n");
      const instructions = normalizeInstructions(recipeNode.recipeInstructions);
      const photoUrl = pickBestImage(recipeNode.image);

      const recipe: ParsedRecipe = {
        name,
        ingredients,
        instructions,
        photoUrl,
        sourceUrl: url,
      };

      if (hasMeaningfulData(recipe)) {
        return recipe;
      }
    } catch {
      // Ignore malformed JSON-LD blocks
    }
  }

  return null;
}

// =====================================================
// Fallback HTML/Open Graph extraction
// =====================================================

function extractFromFallbackHtml($: cheerio.CheerioAPI, url: string): ParsedRecipe | null {
  const name =
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $("title").text() ||
    "";

  const photoUrl =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    "";

  const ingredientSelectors = [
    '[itemprop="recipeIngredient"]',
    ".ingredients-item",
    ".recipe-ingredients li",
    ".ingredients li",
  ];

  let ingredientsList: string[] = [];

  for (const selector of ingredientSelectors) {
    const matches = $(selector)
      .map((_, el) => cleanText($(el).text()))
      .get()
      .filter(Boolean);

    if (matches.length >= 2) {
      ingredientsList = matches;
      break;
    }
  }

  const recipe: ParsedRecipe = {
    name: cleanText(name),
    ingredients: ingredientsList.join("\n"),
    instructions: "",
    photoUrl: cleanText(photoUrl),
    sourceUrl: url,
  };

  if (hasMeaningfulData(recipe)) {
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

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SimpleDinnersBot/1.0; +https://dinners.ncocaptain.com)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return res.status(400).json({
        error: `Fetch failed: ${response.status} ${response.statusText}`,
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 1) Best source: Recipe JSON-LD
    const jsonLdRecipe = extractFromJsonLd($, url);
    if (jsonLdRecipe) {
      return res.status(200).json({ recipe: jsonLdRecipe });
    }

    // 2) Fallback: Open Graph + common ingredient selectors
    const fallbackRecipe = extractFromFallbackHtml($, url);
    if (fallbackRecipe) {
      return res.status(200).json({ recipe: fallbackRecipe });
    }

    // 3) Nothing useful found
    return res.status(422).json({
      error:
        "Could not find recipe data on that page. Try a different recipe site or paste ingredients manually.",
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      error: err?.message || "Server error importing recipe",
    });
  }
}