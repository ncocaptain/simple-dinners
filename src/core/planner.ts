// src/core/planner.ts
import type { Meal, PantryItem, Effort } from "./types";
import { ALLERGENS, MEAT_WORDS, NEW_BUILTIN_RECIPES, NEW_VEGETARIAN_RECIPES } from "./data";
import { getCookHistory } from "./cookHistoryStore";
import { isFavorite } from "./favoritesStore";
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

function getPantryLearningBoost(slug?: string): number {
  if (!slug) return 0;

  const history = getCookHistory();
  const entry = history[slug];
  if (!entry) return 0;

  const timesCookedBoost = Math.min(entry.timesCooked * 2, 12);

  let recencyBoost = 0;
  if (entry.lastCookedAt) {
    const cookedTime = new Date(entry.lastCookedAt).getTime();
    const now = Date.now();
    const daysAgo = Math.floor((now - cookedTime) / (1000 * 60 * 60 * 24));

    if (daysAgo <= 7) recencyBoost = 3;
    else if (daysAgo <= 30) recencyBoost = 1;
  }

  return timesCookedBoost + recencyBoost;
}

function getPlannerScore(meal: Meal): number {
  let score = 0;

  score += getPantryLearningBoost(meal.slug);

  if (isFavorite(meal.slug)) {
    score += 15;
  }

  return score;
}

// simple normalization so "Bell Peppers" and "bell pepper" match
function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

// Parse a textarea list like:
// "chicken, rice\nbroccoli\nsoy sauce"
export function parsePantryText(text: string): string[] {
  if (!text?.trim()) return [];
  return text
    .split(/[\n,]+/g)
    .map((x) => norm(x))
    .filter(Boolean);
}

// Score by counting how many pantry terms show up in ingredients
export function pantryScore(meal: Meal, pantryTerms: string[]): number {
  if (!pantryTerms.length) return 0;
  const haystack = norm(meal.ingredients ?? "");
  let score = 0;

  for (const term of pantryTerms) {
    if (term.length < 3) continue;
    if (haystack.includes(term)) score += 1;
  }

  return score;
}

// Prefer meals that match pantry, but keep variety
export function sortMealsByPantry(meals: Meal[], pantryTerms: string[]): Meal[] {
  if (!pantryTerms.length) return meals;

  return [...meals].sort((a, b) => {
    const sb = pantryScore(b, pantryTerms);
    const sa = pantryScore(a, pantryTerms);
    if (sb !== sa) return sb - sa;

    const eb = b.effort === "quick" ? 1 : 0;
    const ea = a.effort === "quick" ? 1 : 0;
    return eb - ea;
  });
}

// --------------------
// Vegetarian helpers
// --------------------
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
// Allergen + meal helpers
// --------------------
export const allergenKeywords: string[] = ALLERGENS.flatMap((a) =>
  a.keywords.map(normalize)
);

export function violatesAllergens(ingredients: string, activeAllergens: string[] = []) {
  if (!activeAllergens.length) return false;

  const ing = normalize(ingredients || "");
  const selected = ALLERGENS.filter((a) => activeAllergens.includes(a.key));
  const badWords = selected.flatMap((a) => a.keywords.map(normalize));

  return badWords.some((bad) => ing.includes(bad));
}

function hasTag(meal: Meal, tag: string) {
  return Array.isArray((meal as any).tags) && (meal as any).tags.includes(tag);
}

function isMealEligibleForPlan(meal: Meal) {
  if (hasTag(meal, "seasoning")) return false;
  return true;
}

export function isVegetarianByHeuristic(ingredients: string) {
  const ing = normalize(ingredients || "");
  return !MEAT_WORDS.some((w) => ing.includes(normalize(w)));
}

// --------------------
// Candidate library
// --------------------
export const candidateLibrary: Meal[] = [
  ...NEW_BUILTIN_RECIPES,
  ...NEW_VEGETARIAN_RECIPES,

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
// Pure plan generator
// --------------------
export function generatePlan(args: {
  meals: Record<string, Meal>;
  cookbook: Array<{ name: string; ingredients: string; instructions?: string; photoUrl?: string }>;
  pantry: PantryItem[];
  pantryText?: string;
  daySettings: Record<string, Effort>;
  prefs: { vegetarian: boolean; allergens?: string[] };
  days: readonly string[];
}) {
  const { meals, cookbook, pantry, pantryText, daySettings, prefs, days } = args;

  const pantryTokens = getPantryTokens(pantry);
  const pantryTextTokens = parsePantryText(pantryText ?? "");
  const allPantryTokens = Array.from(new Set([...pantryTokens, ...pantryTextTokens]));

  const cookbookPool: Meal[] = (cookbook ?? []).map((r) => ({
    name: r.name,
    ingredients: r.ingredients,
    instructions: r.instructions,
    photoUrl: r.photoUrl,
    effort: "normal",
    slug: normalize(r.name).replace(/\s+/g, "-"),
  }));

  const pool: Meal[] = [...cookbookPool, ...candidateLibrary].filter(
    (m) =>
      isMealEligibleForPlan(m) &&
      !violatesAllergens(m.ingredients, prefs.allergens || [])
  );

  const baseRanked: Meal[] = pool
    .map((m) => {
      const pantryMatchScore = scoreMealAgainstPantry(m, allPantryTokens);
      const plannerScore = getPlannerScore(m);
      const variety = Math.random() * 3;

      return {
        m,
        score: pantryMatchScore * 10 + plannerScore + variety,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.m);

  const ranked: Meal[] = prefs.vegetarian
    ? baseRanked.filter((m) => isVegetarianMeal(m, MEAT_WORDS))
    : baseRanked;

  const next: Record<string, Meal> = { ...meals };
  const used = new Set<string>();

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

    let finalized: Meal | null = null;

    // First pass: avoid repeats
    for (let attempt = 0; attempt < ranked.length && !finalized; attempt++) {
      const candidate = ranked[attempt];
      if (!candidate?.name) continue;

      if (used.has(normalize(candidate.name))) continue;

      const candEffort = candidate.effort ?? "normal";
      if (needed === "normal") {
        if (candEffort !== "normal" && candEffort !== "quick") continue;
      } else {
        if (candEffort !== needed) continue;
      }

      if (prefs.vegetarian && !isVegetarianMeal(candidate, MEAT_WORDS)) continue;

      finalized = candidate;
    }

    // Fallback: allow repeats, still enforce effort + vegetarian
    if (!finalized) {
      for (let attempt = 0; attempt < ranked.length && !finalized; attempt++) {
        const candidate = ranked[attempt];
        if (!candidate?.name) continue;

        const candEffort = candidate.effort ?? "normal";
        if (needed === "normal") {
          if (candEffort !== "normal" && candEffort !== "quick") continue;
        } else {
          if (candEffort !== needed) continue;
        }

        if (prefs.vegetarian && !isVegetarianMeal(candidate, MEAT_WORDS)) continue;

        finalized = candidate;
      }
    }

    if (finalized) {
      next[day] = finalized;
      used.add(normalize(finalized.name));
    }
  }

  return next;
}