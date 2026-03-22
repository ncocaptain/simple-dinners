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
  return (s || "")
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

function getPantryMatchCount(meal: Meal, tokens: string[]) {
  if (!tokens.length) return 0;

  const ingHay = normalize(meal.ingredients || "");
  const nameHay = normalize(meal.name || "");
  let matches = 0;

  for (const token of Array.from(new Set(tokens))) {
    if (token.length < 3) continue;
    if (ingHay.includes(token) || nameHay.includes(token)) {
      matches += 1;
    }
  }

  return matches;
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

    const daysAgo = Math.floor(
      (Date.now() - cookedTime) / (1000 * 60 * 60 * 24)
    );

    if (daysAgo <= 7) recencyBoost = 3;
    else if (daysAgo <= 30) recencyBoost = 1;
  }

  return timesCookedBoost + recencyBoost;
}

export function getPlannerScore(meal: Meal): number {
  const slug = slugFromMeal(meal);
  const history = getCookHistoryFor(slug);

  let score = 0;

  score += getPantryLearningBoost(slug);

  if (isFavorite(slug)) {
    score += 30;
  }

  if (isFamilyClassic(slug)) {
    score += 25;
  }

  score += (history.timesCooked || 0) * 4;

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
// Candidate library
// =====================================================
export const candidateLibrary: Meal[] = [
  ...NEW_BUILTIN_RECIPES,
  ...NEW_VEGETARIAN_RECIPES.map((m) => ({ ...m, isVegetarian: true })),

  {
    id: "takeout-drive-thru-night",
    slug: "takeout-drive-thru-night",
    name: "Drive-Thru Night",
    ingredients: "Order out (no groceries).",
    instructions: "Head to your favorite drive-thru!",
    effort: "takeout",
    isVegetarian: true,
    photoUrl:
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "leftover-night",
    slug: "leftover-night",
    name: "Leftover Night",
    ingredients: "Use leftovers.",
    instructions: "Reheat leftovers from a previous meal.",
    effort: "quick",
    isVegetarian: true,
    photoUrl:
      "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80",
  },
];

type MealSource = "cookbook" | "builtin";

type RankedCandidate = {
  meal: Meal;
  source: MealSource;
  pantryMatches: number;
  score: number;
};

function passesPreferenceFilters(
  meal: Meal,
  prefs: {
    vegetarian: boolean;
    allergens?: string[];
    includeDesserts?: boolean;
    includeAppetizers?: boolean;
  }
) {
  if (prefs.vegetarian) {
    const veggie = meal.isVegetarian || isVegetarianByHeuristic(meal.ingredients);
    if (!veggie) return false;
  }

  if (
    !isMealEligibleForPlan(meal, {
      includeDesserts: prefs.includeDesserts,
      includeAppetizers: prefs.includeAppetizers,
    })
  ) {
    return false;
  }

  if (violatesAllergens(meal.ingredients, prefs.allergens || [])) {
    return false;
  }

  return true;
}

function normalizeCookbookMeal(
  recipe: {
    name: string;
    ingredients: string;
    instructions?: string;
    photoUrl?: string;
    slug?: string;
    effort?: Effort;
    tags?: string[];
  }
): Meal {
  return {
    name: recipe.name,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions || "",
    photoUrl: recipe.photoUrl || "",
    effort: recipe.effort || "normal",
    slug: recipe.slug || normalize(recipe.name).replace(/\s+/g, "-"),
    isVegetarian: isVegetarianByHeuristic(recipe.ingredients),
    ...(recipe.tags ? { tags: recipe.tags } : {}),
  } as Meal;
}

function getEffortFitBonus(meal: Meal, neededEffort: Effort): number {
  const effort = meal.effort || "normal";

  if (neededEffort === "takeout") {
    return effort === "takeout" ? 100 : -1000;
  }

  if (neededEffort === "quick") {
    if (effort === "quick") return 25;
    if (effort === "normal") return -8;
    return -1000;
  }

  if (neededEffort === "normal") {
    if (effort === "normal") return 14;
    if (effort === "quick") return 10;
    return -1000;
  }

  return 0;
}

function scoreCandidateForDay(args: {
  meal: Meal;
  source: MealSource;
  pantryTokens: string[];
  neededEffort: Effort;
}) {
  const { meal, source, pantryTokens, neededEffort } = args;

  const pantryScore = scoreMealAgainstPantry(meal, pantryTokens);
  const pantryMatches = getPantryMatchCount(meal, pantryTokens);
  const plannerScore = getPlannerScore(meal);
  const effortBonus = getEffortFitBonus(meal, neededEffort);

  if (effortBonus <= -1000) {
    return {
      pantryMatches,
      score: -100000,
    };
  }

  let score = 0;

  // Strong preference for user cookbook before built-in recipes
  if (source === "cookbook") score += 40;

  // Prefer meals that use what is already in the kitchen
  score += pantryScore * 10;
  score += pantryMatches * 6;

  // Favor learned / favorite / family classics
  score += plannerScore;

  // Respect effort target
  score += effortBonus;

  // Tiny randomness so plans don't feel robotic
  score += Math.random() * 4;

  return {
    pantryMatches,
    score,
  };
}

// =====================================================
// Pure plan generator
// =====================================================
export function generatePlan(args: {
  meals: Record<string, Meal>;
  cookbook: Array<{
    name: string;
    ingredients: string;
    instructions?: string;
    photoUrl?: string;
    slug?: string;
    effort?: Effort;
    tags?: string[];
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
  const allPantryTokens = Array.from(
    new Set([...pantryTokens, ...pantryTextTokens].filter(Boolean))
  );

  const cookbookPool: Meal[] = (cookbook ?? []).map(normalizeCookbookMeal);
  const builtinPool: Meal[] = [...candidateLibrary];

  const filteredCookbookPool = cookbookPool.filter((meal) =>
    passesPreferenceFilters(meal, prefs)
  );
  const filteredBuiltinPool = builtinPool.filter((meal) =>
    passesPreferenceFilters(meal, prefs)
  );

  const next: Record<string, Meal> = { ...meals };
  const usedMealNames = new Set<string>();

  for (const day of days) {
    if (next[day]?.name) {
      usedMealNames.add(normalize(next[day].name));
    }
  }

  for (const day of days) {
    if (next[day]?.name) continue;

    const neededEffort = daySettings[day] || "normal";

    const rankedCookbook: RankedCandidate[] = filteredCookbookPool
      .filter((meal) => !usedMealNames.has(normalize(meal.name)))
      .map((meal) => {
        const scored = scoreCandidateForDay({
          meal,
          source: "cookbook",
          pantryTokens: allPantryTokens,
          neededEffort,
        });

        return {
          meal,
          source: "cookbook" as const,
          pantryMatches: scored.pantryMatches,
          score: scored.score,
        };
      })
      .sort((a, b) => b.score - a.score);

    const rankedBuiltin: RankedCandidate[] = filteredBuiltinPool
      .filter((meal) => !usedMealNames.has(normalize(meal.name)))
      .map((meal) => {
        const scored = scoreCandidateForDay({
          meal,
          source: "builtin",
          pantryTokens: allPantryTokens,
          neededEffort,
        });

        return {
          meal,
          source: "builtin" as const,
          pantryMatches: scored.pantryMatches,
          score: scored.score,
        };
      })
      .sort((a, b) => b.score - a.score);

    // Priority order:
    // 1. cookbook with pantry matches
    // 2. builtin with pantry matches
    // 3. cookbook best remaining
    // 4. builtin best remaining
    const chosen =
      rankedCookbook.find((x) => x.pantryMatches > 0) ||
      rankedBuiltin.find((x) => x.pantryMatches > 0) ||
      rankedCookbook[0] ||
      rankedBuiltin[0];

    if (chosen?.meal) {
      next[day] = chosen.meal;
      usedMealNames.add(normalize(chosen.meal.name));
    }
  }

  return next;
}