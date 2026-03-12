import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as cheerio from "cheerio";

type ParsedRecipe = {
  name: string;
  ingredients: string;
  instructions: string;
  photoUrl: string;
  sourceUrl: string;
};

// =====================================================
// 1. HELPERS
// =====================================================
function cleanText(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function joinLines(lines: string[]): string {
  return Array.from(new Set(lines.map(cleanText))).filter(Boolean).join("\n");
}

// =====================================================
// 2. MAIN HANDLER
// =====================================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const { url } = req.body || {};
    
    // 1. FETCH THE WEBSITE
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0" },
    });

    // 2. THE SAFETY GATE
    if (!response.ok) {
      return res.status(400).json({ 
        error: `Website blocked the request (Error ${response.status}). Some sites don't allow sharing.` 
      });
    }

    // 3. CONVERT TO TEXT & LOAD CHEERIO
    const html = await response.text();
    const $ = cheerio.load(html); // <--- This line was missing!
    let recipe: Partial<ParsedRecipe> = { sourceUrl: url }; // <--- This line was missing!

    // -----------------------------------------------------
    // A. Try JSON-LD (Structured Data)
    // -----------------------------------------------------
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
      } catch (e) { /* ignore parse errors */ }
    }

    // -----------------------------------------------------
    // B. Fallback to HTML Selectors (If JSON-LD failed)
    // -----------------------------------------------------
    if (!recipe.ingredients) {
      const ingredientSelectors = [
        ".wprm-recipe-ingredient", 
        ".tasty-recipe-ingredients li", 
        ".mv-create-ingredients li",
        ".recipe-ingredients li", 
        ".ingredients li",
        "[class*='ingredient']"
      ];
      
      const lines: string[] = [];
      ingredientSelectors.forEach(sel => {
        $(sel).each((_, el) => { lines.push($(el).text()); });
      });
      recipe.ingredients = joinLines(lines);
    }

    if (!recipe.name) recipe.name = cleanText($("title").text() || "New Recipe");

    // SEND THE DATA BACK TO THE APP
    return res.status(200).json({ recipe });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}