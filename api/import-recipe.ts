import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as cheerio from "cheerio";

type ParsedRecipe = {
  name: string;
  ingredients: string;
  instructions?: string;
  image?: string;
  sourceUrl: string;
};

function pickFirstString(x: any): string | undefined {
  if (!x) return undefined;
  if (typeof x === "string") return x;
  if (Array.isArray(x)) return pickFirstString(x[0]);
  if (typeof x === "object" && typeof x.url === "string") return x.url;
  return undefined;
}

function flattenToTextLines(x: any): string[] {
  if (!x) return [];
  if (typeof x === "string") return [x];
  if (Array.isArray(x)) return x.flatMap(flattenToTextLines);
  if (typeof x === "object") {
    // HowToStep sometimes looks like { text: "..." }
    if (typeof x.text === "string") return [x.text];
  }
  return [];
}

function findRecipeObject(ld: any): any | null {
  if (!ld) return null;

  const isRecipe = (o: any) =>
    o &&
    (o["@type"] === "Recipe" ||
      (Array.isArray(o["@type"]) && o["@type"].includes("Recipe")));

  if (Array.isArray(ld)) {
    for (const item of ld) {
      const found = findRecipeObject(item);
      if (found) return found;
    }
    return null;
  }

  if (typeof ld === "object") {
    if (isRecipe(ld)) return ld;

    // common wrappers
    if (ld["@graph"]) return findRecipeObject(ld["@graph"]);
    if (ld.mainEntity) return findRecipeObject(ld.mainEntity);
    if (ld.mainEntityOfPage) return findRecipeObject(ld.mainEntityOfPage);
  }

  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = String(req.query.url || "").trim();
    if (!url) return res.status(400).json({ error: "Missing url" });

    // Basic safety: only http(s)
    if (!/^https?:\/\//i.test(url)) {
      return res.status(400).json({ error: "URL must start with http:// or https://" });
    }

    const resp = await fetch(url, {
      headers: {
        // Helps some sites return normal HTML
        "User-Agent":
          "Mozilla/5.0 (compatible; SimpleDinnersBot/1.0; +https://dinners.ncocaptain.com)",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!resp.ok) {
      return res.status(400).json({ error: `Fetch failed: ${resp.status} ${resp.statusText}` });
    }

    const html = await resp.text();
    const $ = cheerio.load(html);

    // 1) Try JSON-LD schema (best)
    let recipe: ParsedRecipe | null = null;

    const scripts = $('script[type="application/ld+json"]')
      .map((_, el) => $(el).text())
      .get()
      .filter(Boolean);

    for (const raw of scripts) {
      try {
        const parsed = JSON.parse(raw);
        const r = findRecipeObject(parsed);
        if (!r) continue;

        const name = (r.name || "").toString().trim();
        const ingredientsArr = Array.isArray(r.recipeIngredient)
          ? r.recipeIngredient
          : Array.isArray(r.ingredients)
          ? r.ingredients
          : [];
        const ingredients = ingredientsArr
          .map((s: any) => String(s).trim())
          .filter(Boolean)
          .join(", ");

        const instructionsLines = flattenToTextLines(r.recipeInstructions);
        const instructions = instructionsLines
          .map((s) => s.trim())
          .filter(Boolean)
          .join("\n");

        const image = pickFirstString(r.image);

        if (name && ingredients) {
          recipe = {
            name,
            ingredients,
            instructions: instructions || undefined,
            image,
            sourceUrl: url,
          };
          break;
        }
      } catch {
        // ignore bad JSON
      }
    }

    // 2) Fallback heuristic (basic)
    if (!recipe) {
      const ogTitle =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text() ||
        "Imported recipe";

      const ogImage =
        $('meta[property="og:image"]').attr("content") ||
        $('meta[name="twitter:image"]').attr("content");

      // Try common ingredient selectors
      const ingredientCandidates = [
        '[itemprop="recipeIngredient"]',
        ".ingredients-item",
        ".recipe-ingredients li",
        ".ingredients li",
      ];

      let ingredients: string[] = [];
      for (const sel of ingredientCandidates) {
        const hits = $(sel)
          .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
          .get()
          .filter(Boolean);
        if (hits.length >= 2) {
          ingredients = hits;
          break;
        }
      }

      const ingredientsJoined = ingredients.join(", ");

      if (ingredientsJoined.trim()) {
        recipe = {
          name: ogTitle.trim(),
          ingredients: ingredientsJoined,
          image: ogImage,
          sourceUrl: url,
        };
      }
    }

    if (!recipe) {
      return res.status(422).json({
        error:
          "Could not find a Recipe schema on that page. Try a different recipe site or paste ingredients manually.",
      });
    }

    return res.status(200).json(recipe);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Server error importing recipe" });
  }
}