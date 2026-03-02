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

// --- Vegetarian helpers (source of truth in generator) ---

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Match meat words as whole-ish words (handles "ground beef", "chicken", etc.)


// Apply SUBS replacements to a block of text.
// Supports SUBS as Record<string, string> or Array<[string, string]>
function applySubs(
  text: string,
  subs: Array<{ pattern: RegExp; replacement: string }>
) {
  if (!text) return text;
  if (!subs?.length) return text;

  let out = text;
  for (const { pattern, replacement } of subs) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function mealTextForMeatCheck(meal: Meal) {
  return `${meal?.name ?? ""}\n${meal?.ingredients ?? ""}\n${meal?.instructions ?? ""}`;
}

function isVegetarianMeal(meal: Meal, meatWords: string[]) {
  const t = mealTextForMeatCheck(meal);

  return !meatWords.some((w) =>
    new RegExp(`\\b${escapeRegExp(w)}\\b`, "i").test(t)
  );
}

/**
 * Returns a finalized meal for prefs, or null if it can't be made vegetarian-safe.
 */
type SubRule = { pattern: RegExp; replacement: string };

function finalizeMealForPrefs(
  meal: Meal,
  prefs: { vegetarian: boolean; allowSubstitutions: boolean },
  meatWords: string[],
  subs: SubRule[]
): Meal | null {
  if (!prefs.vegetarian) return meal;

  if (isVegetarianMeal(meal, meatWords)) return meal;

  if (!prefs.allowSubstitutions) return null;

  const next: Meal = {
    ...meal,
    name: applySubs(meal?.name ?? "", subs),
    ingredients: applySubs(meal?.ingredients ?? "", subs),
    instructions: applySubs(meal?.instructions ?? "", subs),
  };

  if (!isVegetarianMeal(next, meatWords)) return null;

  // Nice touch: if we had to sub, optionally mark it
  // next.name = next.name === meal.name ? next.name : `${next.name} (veg)`;

  return next;
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

  // Rank by pantry match
  const baseRanked: Meal[] = pool
    .map((m) => ({ m, score: scoreMealAgainstPantry(m, pantryTokens) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.m);

  // Vegetarian-aware candidate list:
  // - If vegetarian OFF: use baseRanked as-is
  // - If vegetarian ON: allow vegetarian meals always; allow meat meals only if subs allowed (we'll validate after subs)
  const ranked: Meal[] = prefs.vegetarian
    ? baseRanked.filter((m) => isVegetarianMeal(m, MEAT_WORDS) || !!prefs.allowSubstitutions)
    : baseRanked;

  const next: Record<string, Meal> = { ...meals };
  const used = new Set<string>();

  // Mark already-filled days as used so we don't repeat them
  for (const d of days) {
    const existingName = next[d]?.name?.trim();
    if (existingName) used.add(normalize(existingName));
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

    // Try to find a meal that:
    // - isn't used yet
    // - matches effort preference (if your Meal has effort; if not, this still works)
    // - can be finalized for vegetarian prefs (when applicable)
    let finalized: Meal | null = null;

    for (let attempt = 0; attempt < ranked.length && !finalized; attempt++) {
      const candidate = ranked[attempt];
      if (!candidate?.name) continue;

      // Avoid repeats
      if (used.has(normalize(candidate.name))) continue;

      // Optional: effort gating (only if your meals have effort)
      // If you want to enforce effort more strictly, uncomment:
      // if (candidate.effort && candidate.effort !== needed && needed !== "normal") continue;

      const maybe = finalizeMealForPrefs(candidate, prefs, MEAT_WORDS, SUBS) as Meal | null;
      if (!maybe) continue;

      // If day requires quick/easy etc, you can check here if you want:
      // if (needed !== "normal" && maybe.effort && maybe.effort !== needed) continue;

      finalized = maybe;
    }

    // Fallback: if everything is "used" or rejected by vegetarian rules, allow repeats but still enforce vegetarian safety
    if (!finalized) {
      for (let attempt = 0; attempt < ranked.length && !finalized; attempt++) {
        const candidate = ranked[attempt];
        const maybe = finalizeMealForPrefs(candidate, prefs, MEAT_WORDS, SUBS) as Meal | null;
        if (maybe) finalized = maybe;
      }
    }

    if (finalized) {
      next[day] = finalized;
      used.add(normalize(finalized.name));
    }
  }

  return next;
}