// src/core/planner.ts
import type { Meal, PantryItem, Effort } from "./types";
import {
  ALLERGENS,
  MEAT_WORDS,
  NEW_BUILTIN_RECIPES,
  NEW_VEGETARIAN_RECIPES,
} from "./data";
import { getCookHistory, getCookHistoryFor } from "./cookHistoryStore";
import { isFavorite } from "./favoritesStore";

// =====================================================
// Text helpers
// =====================================================
export function normalize(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugFromMeal(meal: Meal) {
  return meal.slug || normalize(meal.name || "").replace(/\s+/g, "-");
}


// =====================================================
// Pantry helpers
// =====================================================
export function parsePantryText(text: string): string[] {
  if (!text?.trim()) return [];

  return text
    .split(/[\n,]+/g)
    .map((x) => norm(x))
    .filter(Boolean);
}

export function getPantryTokens(pantry: PantryItem[]) {
  if (!Array.isArray(pantry)) return [];

  return pantry
    .map((p) => normalize(p.name))
    .flatMap((s) => s.split(/[\n,;/|]/g))
    .map((s) => s.trim())
    .filter(Boolean);
}

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

export function scoreMealAgainstPantry(meal: Meal, tokens: string[]) {
  if (!tokens.length) return 0;

  const nameHay = normalize(meal.name || "");
  const ingHay = normalize(meal.ingredients || "");

  let score = 0;

  for (const token of tokens) {
    if (token.length < 3) continue;
    if (ingHay.includes(token)) score += 3;
    if (nameHay.includes(token)) score += 1;
  }

  return score;
}

// =====================================================
// Vegetarian + allergen helpers
// =====================================================


export function isVegetarianByHeuristic(ingredients: string) {
  const ing = normalize(ingredients || "");
  return !MEAT_WORDS.some((w) => ing.includes(normalize(w)));
}

export const allergenKeywords: string[] = ALLERGENS.flatMap((a) =>
  a.keywords.map(normalize)
);

export function violatesAllergens(
  ingredients: string,
  activeAllergens: string[] = []
) {
  if (!activeAllergens.length) return false;

  const ing = normalize(ingredients || "");
  const selected = ALLERGENS.filter((a) => activeAllergens.includes(a.key));
  const badWords = selected.flatMap((a) => a.keywords.map(normalize));

  return badWords.some((bad) => ing.includes(bad));
}

// =====================================================
// Meal tags + eligibility
// =====================================================


function hasAnyTag(meal: Meal, tags: string[]) {
  return (
    Array.isArray((meal as any).tags) &&
    (meal as any).tags.some((t: string) =>
      tags.includes(String(t).toLowerCase())
    )
  );
}

function isMealEligibleForPlan(
  meal: Meal,
  options?: {
    includeDesserts?: boolean;
    includeAppetizers?: boolean;
  }
) {
  const excludedTags = ["seasoning", "side", "snack", "breakfast"];

  if (!options?.includeDesserts) excludedTags.push("dessert");
  if (!options?.includeAppetizers) excludedTags.push("appetizer");

  return !hasAnyTag(meal, excludedTags);
}

// =====================================================
// Learning / planner scoring
// =====================================================
function isFamilyClassic(slug?: string) {
  if (!slug) return false;

  const history = getCookHistory();
  const entry = history[slug];

  return !!entry && entry.timesCooked >= 3;
}

function getPantryLearningBoost(slug?: string): number {
  if (!slug) return 0;

  const history = getCookHistory();
  const entry = history[slug];
  if (!entry) return 0;

  const timesCookedBoost = Math.min(entry.timesCooked * 2, 12);

  let recencyBoost = 0;
  if (entry.lastCookedAt) {
    const cookedTime =
      typeof entry.lastCookedAt === "number"
        ? entry.lastCookedAt
        : new Date(entry.lastCookedAt).getTime();

    const daysAgo = Math.floor((Date.now() - cookedTime) / (1000 * 60 * 60 * 24));

    if (daysAgo <= 7) recencyBoost = 3;
    else if (daysAgo <= 30) recencyBoost = 1;
  }

  return timesCookedBoost + recencyBoost;
}

export function getPlannerScore(meal: Meal): number {
  const slug = slugFromMeal(meal);
  const history = getCookHistoryFor(slug);

  let score = 0;

  // Learned familiarity
  score += getPantryLearningBoost(slug);

  // Favorites should appear more often
  if (isFavorite(slug)) {
    score += 30;
  }

  // Family classics get a strong boost
  if (isFamilyClassic(slug)) {
    score += 25;
  }

  // Familiar meals get a small bump
  score += (history.timesCooked || 0) * 4;

  // Penalize meals cooked too recently
  if (history.lastCookedAt) {
    const lastCooked =
      typeof history.lastCookedAt === "number"
        ? history.lastCookedAt
        : new Date(history.lastCookedAt).getTime();

    const daysSinceCooked =
      (Date.now() - lastCooked) / (1000 * 60 * 60 * 24);

    if (daysSinceCooked < 3) score -= 40;
    else if (daysSinceCooked < 7) score -= 15;
    else if (daysSinceCooked < 14) score -= 5;
  }

  return score;
}

// =====================================================
// Candidate library (Updated with your new Data)
// =====================================================
export const candidateLibrary: Meal[] = [
  ...NEW_BUILTIN_RECIPES,
  ...NEW_VEGETARIAN_RECIPES.map(m => ({ ...m, isVegetarian: true })),

  {
    id: "takeout-drive-thru-night",
    slug: "takeout-drive-thru-night",
    name: "Drive-Thru Night",
    ingredients: "Order out (no groceries).",
    instructions: "Head to your favorite drive-thru!", // Added this
    effort: "takeout",
    isVegetarian: true,
    photoUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "leftover-night",
    slug: "leftover-night",
    name: "Leftover Night",
    ingredients: "Use leftovers.",
    instructions: "Reheat leftovers from a previous meal.",
    effort: "quick",
    isVegetarian: true,
    photoUrl: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80"
  }
];

// =====================================================
// Pure plan generator (Fixed & Shielded)
// =====================================================
export function generatePlan(args: {
  meals: Record<string, Meal>;
  cookbook: Array<{
    name: string;
    ingredients: string;
    instructions?: string;
    photoUrl?: string;
  }>;
  pantry: PantryItem[];
  pantryText?: string;
  daySettings: Record<string, Effort>;
  prefs: {
    vegetarian: boolean;
    allergens?: string[];
    includeDesserts?: boolean;
    includeAppetizers?: boolean;
  };
  days: readonly string[];
}) {
  const { meals, cookbook, pantry, pantryText, daySettings, prefs, days } = args;

  const pantryTokens = getPantryTokens(pantry);
  const pantryTextTokens = parsePantryText(pantryText ?? "");
  const allPantryTokens = Array.from(new Set([...pantryTokens, ...pantryTextTokens]));

  // 1. Convert Cookbook to Meals
  const cookbookPool: Meal[] = (cookbook ?? []).map((recipe) => ({
    name: recipe.name,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions || "",
    photoUrl: recipe.photoUrl || "",
    effort: "normal",
    slug: normalize(recipe.name).replace(/\s+/g, "-"),
    // If it doesn't have meat words, it's veggie
    isVegetarian: isVegetarianByHeuristic(recipe.ingredients)
  }));

  // 2. THE VEGETARIAN SHIELD (Apply this to the total pool first)
  let fullPool: Meal[] = [...cookbookPool, ...candidateLibrary];

  if (prefs.vegetarian) {
    fullPool = fullPool.filter(meal => 
      meal.isVegetarian || isVegetarianByHeuristic(meal.ingredients)
    );
  }

  // 3. Final Eligibility & Allergen check
  fullPool = fullPool.filter(
  (meal) =>
    isMealEligibleForPlan(meal, {
      includeDesserts: prefs.includeDesserts,
      includeAppetizers: prefs.includeAppetizers,
    }) &&
    !violatesAllergens(meal.ingredients, prefs.allergens || [])
);

  // 4. Score and Rank
  const rankedPool: Meal[] = fullPool
    .map((meal) => ({
      meal,
      score: (scoreMealAgainstPantry(meal, allPantryTokens) * 10) + getPlannerScore(meal) + (Math.random() * 10)
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.meal);

  const next: Record<string, Meal> = { ...meals };
  const usedMealNames = new Set<string>();

  // Mark already-set meals as used
  for (const day of days) {
    if (next[day]?.name) usedMealNames.add(normalize(next[day].name));
  }

  for (const day of days) {
    // If a day is already filled (and not cleared), skip it
    if (next[day]?.name) continue;

    const neededEffort = daySettings[day] || "normal";

    // Find the first meal in our pre-filtered/ranked pool that fits the criteria
    const chosenMeal = rankedPool.find(candidate => {
      if (usedMealNames.has(normalize(candidate.name))) return false;
      
      const candidateEffort = candidate.effort || "normal";
      
      // Effort Matching
      if (neededEffort === "takeout") return candidateEffort === "takeout";
      if (neededEffort === "normal") return candidateEffort === "normal" || candidateEffort === "quick";
      return candidateEffort === neededEffort;
    });

    if (chosenMeal) {
      next[day] = chosenMeal;
      usedMealNames.add(normalize(chosenMeal.name));
    }
  }
  
  return next;
}