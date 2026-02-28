// src/core/planner.ts
import type { Meal, PantryItem, Effort } from "./types";
import { ALLERGENS, MEAT_WORDS, SUBS, NEW_BUILTIN_RECIPES } from "./data";

// --------------------
// Basic helpers
// --------------------
export function normalize(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// --------------------
// Pantry scoring
// --------------------
export function getPantryTokens(pantry: PantryItem[]) {
  if (!Array.isArray(pantry)) return [];
  return pantry
    .map((p) => normalize(p.name))
    .flatMap((s) => s.split(/[\n,;/|]/g))
    .map((s) => s.trim())
    .filter(Boolean);
}

export function scoreMealAgainstPantry(meal: Meal, tokens: string[]) {
  if (!tokens.length) return 0;

  const nameHay = normalize(meal.name || "");
  const ingHay = normalize(meal.ingredients || "");

  let score = 0;
  for (const t of tokens) {
    if (t.length < 3) continue;
    if (ingHay.includes(t)) score += 3;
    if (nameHay.includes(t)) score += 1;
  }
  return score;
}

// --------------------
// Substitutions (from data.ts)
// --------------------
export { SUBS };

// --------------------
// Allergen + veg helpers (pure functions)
// --------------------
export const allergenKeywords: string[] = ALLERGENS.flatMap((a) => a.keywords.map(normalize));

export function violatesAllergens(ingredients: string, activeAllergens: string[] = []) {
  if (!activeAllergens.length) return false;

  const ing = normalize(ingredients || "");
  const selected = ALLERGENS.filter((a) => activeAllergens.includes(a.key));
  const badWords = selected.flatMap((a) => a.keywords.map(normalize));

  return badWords.some((bad) => ing.includes(bad));
}

export function isVegetarianByHeuristic(ingredients: string) {
  const ing = normalize(ingredients || "");
  return !MEAT_WORDS.some((w) => ing.includes(normalize(w)));
}

// --------------------
// Candidate library (from data.ts)
// --------------------
export const candidateLibrary: Meal[] = [
  ...NEW_BUILTIN_RECIPES,

  // TAKEOUT / NO-COOK
  {
    id: "takeout-drive-thru-night",
    slug: "takeout-drive-thru-night",
    name: "Drive-Thru Night",
    ingredients: "Order out (no groceries).",
    effort: "takeout",
  },
  {
    id: "takeout-rotisserie-chicken-night",
    slug: "takeout-rotisserie-chicken-night",
    name: "Rotisserie Chicken Night",
    ingredients: "Rotisserie chicken, salad kit, rolls.",
    effort: "takeout",
  },
  {
    id: "takeout-frozen-pizza-night",
    slug: "takeout-frozen-pizza-night",
    name: "Frozen Pizza Night",
    ingredients: "Frozen pizza, salad kit.",
    effort: "takeout",
  },
  {
    id: "takeout-deli-sandwich-night",
    slug: "takeout-deli-sandwich-night",
    name: "Deli Sandwich Night",
    ingredients: "Deli meat, bread, cheese, chips.",
    effort: "takeout",
  },
];

// --------------------
// Optional: pure plan generator (NO React)
// --------------------
export function generatePlan(args: {
  meals: Record<string, Meal>;
  cookbook: Array<{ name: string; ingredients: string; instructions?: string; photoUrl?: string }>;
  pantry: PantryItem[];
  daySettings: Record<string, Effort>;
  prefs: { vegetarian: boolean; allowSubstitutions: boolean; allergens?: string[] };
  days: readonly string[];
}) {
  const { meals, cookbook, pantry, daySettings, prefs, days } = args;

  const pantryTokens = getPantryTokens(pantry);

  // Convert cookbook recipes into Meal objects
  const cookbookPool: Meal[] = (cookbook ?? []).map((r) => ({
    name: r.name,
    ingredients: r.ingredients,
    instructions: r.instructions,
    photoUrl: r.photoUrl,
    effort: "normal",
  }));

  // Build pool and filter allergens
  const pool: Meal[] = [...cookbookPool, ...candidateLibrary].filter(
    (m) => !violatesAllergens(m.ingredients, prefs.allergens || [])
  );

  // Vegetarian filter/subs is handled in App currently; keep generator simple:
  const ranked = pool
    .map((m) => ({ m, score: scoreMealAgainstPantry(m, pantryTokens) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.m);

  const next: Record<string, Meal> = { ...meals };
  const used = new Set<string>();

  for (const d of days) {
    const existing = next[d]?.name?.trim();
    if (existing) used.add(normalize(existing));
  }

  for (const day of days) {
    const existing = next[day];
    if (existing?.name?.trim()) continue;

    const needed = daySettings[day] || "normal";

    if (needed === "takeout") {
      next[day] = {
        name: "Takeout Night",
        ingredients: "order out (no groceries)",
        effort: "takeout",
      };
      continue;
    }

    const pick = ranked.find((m) => !used.has(normalize(m.name))) || ranked[0];
    if (pick) {
      next[day] = pick;
      used.add(normalize(pick.name));
    }
  }

  return next;
}