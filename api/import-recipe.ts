import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as cheerio from "cheerio";

type ParsedRecipe = {
  name: string;
  ingredients: string;
  instructions: string;
  photoUrl: string;
  sourceUrl: string;
};

function cleanText(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function joinLines(lines: string[]): string {
  return Array.from(new Set(lines.map(cleanText))).filter(Boolean).join("\n");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. SET THE HEADERS IMMEDIATELY
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', '*'); // Allow all headers

  // 2. FORCE THE PREFLIGHT TO RESPOND
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return; // <--- This 'return' is critical!
  }

  // 3. NOW PROCEED WITH THE REST
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const { url } = req.body || {};
    if (!url) throw new Error("No URL provided");
    
    // 3. FETCH THE WEBSITE
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0" },
    });

    if (!response.ok) {
      return res.status(400).json({ 
        error: `Website blocked the request (Error ${response.status}).` 
      });
    }

    // 4. LOAD TOOLS
    const html = await response.text();
    const $ = cheerio.load(html);
    let recipe: Partial<ParsedRecipe> = { sourceUrl: url };

    // 5. JSON-LD SCRAPING
    const scripts = $('script[type="application/ld+json"]').map((_, el) => $(el).text()).get();
    for (const raw of scripts) {
      try {
        const data = JSON.parse(raw);
        const nodes = data["@graph"] || [data];
        const node = nodes.find((n: any) => n["@type"] === "Recipe" || (Array.isArray(n["@type"]) && n["@type"].includes("Recipe")));
        
        if (node) {
          recipe.name = cleanText(node.name);
          recipe.ingredients = joinLines(node.recipeIngredient || node.ingredients || []);
          const inst = node.recipeInstructions;
          recipe.instructions = Array.isArray(inst) 
            ? joinLines(inst.map((i: any) => i.text || i.name || i))
            : cleanText(String(inst || ""));
          recipe.photoUrl = typeof node.image === 'string' ? node.image : (node.image?.url || "");
        }
      } catch (e) { }
    }

    // 6. FALLBACK SELECTORS
    if (!recipe.ingredients) {
      const ingredientSelectors = [".wprm-recipe-ingredient", ".tasty-recipe-ingredients li", ".mv-create-ingredients li", ".recipe-ingredients li", ".ingredients li", "[class*='ingredient']"];
      const lines: string[] = [];
      ingredientSelectors.forEach(sel => {
        $(sel).each((_, el) => { lines.push($(el).text()); });
      });
      recipe.ingredients = joinLines(lines);
    }

    if (!recipe.name) recipe.name = cleanText($("title").text() || "New Recipe");

    // 7. SUCCESS
    return res.status(200).json({ recipe });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}