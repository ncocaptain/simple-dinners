import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as cheerio from "cheerio";

type ImportedRecipe = {
  name: string;
  ingredients: string;
  instructions: string;
  photoUrl: string;
  sourceUrl: string;
};

function asArray<T>(v: T | T[] | undefined | null): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeInstructions(instr: any): string {
  // JSON-LD can be string, array of strings, or HowToStep objects
  if (!instr) return "";
  if (typeof instr === "string") return instr.trim();

  const arr = asArray(instr);

  const steps = arr
    .map((x) => {
      if (!x) return "";
      if (typeof x === "string") return x;
      if (typeof x === "object") {
        // HowToStep { text }, or nested items
        if (typeof x.text === "string") return x.text;
        if (typeof x.name === "string") return x.name;
      }
      return "";
    })
    .map((x) => stripHtml(String(x)))
    .filter(Boolean);

  return steps.join("\n");
}

function pickBestImage(image: any): string {
  // image can be string, array, or object with url
  if (!image) return "";
  if (typeof image === "string") return image;
  if (Array.isArray(image)) return pickBestImage(image[0]);
  if (typeof image === "object") {
    if (typeof image.url === "string") return image.url;
  }
  return "";
}

function extractFromJsonLd($: cheerio.CheerioAPI): Partial<ImportedRecipe> {
  const scripts = $('script[type="application/ld+json"]')
    .map((_, el) => $(el).text())
    .get();

  for (const raw of scripts) {
    try {
      const parsed = JSON.parse(raw);

      const nodes = asArray<any>(parsed).flatMap((p) => {
        // Sometimes wrapped in @graph
        if (p && p["@graph"]) return asArray(p["@graph"]);
        return [p];
      });

      // Find a Recipe node
      const recipeNode = nodes.find((n) => {
        const t = n?.["@type"];
        if (!t) return false;
        if (Array.isArray(t)) return t.includes("Recipe");
        return t === "Recipe";
      });

      if (!recipeNode) continue;

      const name = (recipeNode.name ?? "").toString().trim();

      const ingredientsArr = asArray<string>(recipeNode.recipeIngredient).map((x) =>
        stripHtml(String(x))
      );
      const ingredients = ingredientsArr.filter(Boolean).join(", ");

      const instructions = normalizeInstructions(recipeNode.recipeInstructions);

      const photoUrl = pickBestImage(recipeNode.image);

      return { name, ingredients, instructions, photoUrl };
    } catch {
      // ignore invalid JSON
    }
  }

  return {};
}

function extractFromOpenGraph($: cheerio.CheerioAPI): Partial<ImportedRecipe> {
  const ogTitle =
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $("title").text();

  const ogImage =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    "";

  return {
    name: (ogTitle ?? "").trim(),
    photoUrl: (ogImage ?? "").trim(),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST" });
    return;
  }

  const { url } = req.body || {};
  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Missing url" });
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    res.status(400).json({ error: "Invalid URL" });
    return;
  }

  // Basic safety: only http/https
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    res.status(400).json({ error: "URL must be http/https" });
    return;
  }

  try {
    const r = await fetch(url, {
      headers: {
        // Helps some sites return normal HTML
        "User-Agent":
          "Mozilla/5.0 (compatible; SimpleDinnersBot/1.0; +https://dinners.ncocaptain.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!r.ok) {
      res.status(400).json({ error: `Fetch failed: ${r.status}` });
      return;
    }

    const html = await r.text();
    const $ = cheerio.load(html);

    const jsonLd = extractFromJsonLd($);
    const og = extractFromOpenGraph($);

    const result: ImportedRecipe = {
      name: (jsonLd.name || og.name || "").trim() || "Imported Recipe",
      ingredients: (jsonLd.ingredients || "").trim(),
      instructions: (jsonLd.instructions || "").trim(),
      photoUrl: (jsonLd.photoUrl || og.photoUrl || "").trim(),
      sourceUrl: url,
    };

    res.status(200).json({ recipe: result });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Unknown error" });
  }
}
