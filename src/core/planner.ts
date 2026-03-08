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

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
function mealTextForMeatCheck(meal: Meal) {
  return `${meal?.name ?? ""}\n${meal?.ingredients ?? ""}\n${meal?.instructions ?? ""}`;
}

function isVegetarianMeal(meal: Meal, meatWords: string[]) {
  const text = mealTextForMeatCheck(meal);

  return !meatWords.some((word) =>
    new RegExp(`\\b${escapeRegExp(word)}\\b`, "i").test(text)
  );
}

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
function hasTag(meal: Meal, tag: string) {
  return Array.isArray((meal as any).tags) && (meal as any).tags.includes(tag);
}

function mealSupportsLeftovers(meal: Meal) {
  return hasTag(meal, "leftovers");
}

function isMealEligibleForPlan(meal: Meal) {
  if (hasTag(meal, "seasoning")) return false;
  return true;
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
// Candidate library
// =====================================================
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
  {
    id: "leftover-night",
    slug: "leftover-night",
    name: "Leftover Night",
    ingredients: "Use leftovers from a recent dinner.",
    instructions: "Reheat and serve leftover portions from the previous meal.",
    effort: "quick",
  },
];

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
  }>;
  pantry: PantryItem[];
  pantryText?: string;
  daySettings: Record<string, Effort>;
  prefs: { vegetarian: boolean; allergens?: string[] };
  days: readonly string[];
}) {
  const { meals, cookbook, pantry, pantryText, daySettings, prefs, days } = args;

  const pantryTokens = getPantryTokens(pantry);
  const pantryTextTokens = parsePantryText(pantryText ?? "");
  const allPantryTokens = Array.from(
    new Set([...pantryTokens, ...pantryTextTokens])
  );

  const cookbookPool: Meal[] = (cookbook ?? []).map((recipe) => ({
    name: recipe.name,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    photoUrl: recipe.photoUrl,
    effort: "normal",
    slug: normalize(recipe.name).replace(/\s+/g, "-"),
  }));

  const fullPool: Meal[] = [...cookbookPool, ...candidateLibrary].filter(
    (meal) =>
      isMealEligibleForPlan(meal) &&
      !violatesAllergens(meal.ingredients, prefs.allergens || [])
  );

  const rankedPool: Meal[] = fullPool
    .map((meal) => {
      const pantryMatchScore = scoreMealAgainstPantry(meal, allPantryTokens);
      const plannerScore = getPlannerScore(meal);
      const variety = Math.random() * 6;

      return {
        meal,
        score: pantryMatchScore * 10 + plannerScore + variety,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.meal);

  const candidatePool: Meal[] = prefs.vegetarian
    ? rankedPool.filter((meal) => isVegetarianMeal(meal, MEAT_WORDS))
    : rankedPool;

  const next: Record<string, Meal> = { ...meals };
  const usedMealNames = new Set<string>();

  for (const day of days) {
    const existingName = next[day]?.name?.trim();
    if (existingName) {
      usedMealNames.add(normalize(existingName));
    }
  }

  for (const day of days) {
    const existingMeal = next[day];
    if (existingMeal?.name?.trim()) continue;

    const neededEffort = daySettings[day] || "normal";

    const dayIndex = days.indexOf(day);
    const previousDay = dayIndex > 0 ? days[dayIndex - 1] : null;
    const previousMeal = previousDay ? next[previousDay] : null;

    const canUseLeftovers =
      previousMeal &&
      mealSupportsLeftovers(previousMeal) &&
      !usedMealNames.has(normalize("Leftover Night"));

    if (canUseLeftovers && neededEffort !== "takeout" && Math.random() < 0.6) {
      next[day] = {
        name: `Leftovers from ${previousMeal.name}`,
        slug: "leftover-night",
        ingredients: `Use leftovers from ${previousMeal.name}.`,
        instructions: `Reheat and serve leftovers from ${previousMeal.name}.`,
        effort: "quick",
      } as Meal;

      usedMealNames.add(normalize("Leftover Night"));
      continue;
    }

    if (neededEffort === "takeout") {
      next[day] = {
        name: "Takeout Night",
        ingredients: "order out (no groceries)",
        effort: "takeout",
      };
      continue;
    }

    let chosenMeal: Meal | null = null;

    // First pass: avoid repeats
    for (const candidate of candidatePool) {
      if (!candidate?.name) continue;
      if (usedMealNames.has(normalize(candidate.name))) continue;
      if (prefs.vegetarian && !isVegetarianMeal(candidate, MEAT_WORDS)) continue;

      const candidateEffort = candidate.effort ?? "normal";

      if (neededEffort === "normal") {
        if (candidateEffort !== "normal" && candidateEffort !== "quick") continue;
      } else {
        if (candidateEffort !== neededEffort) continue;
      }

      chosenMeal = candidate;
      break;
    }

    // Fallback: allow repeats if needed
    if (!chosenMeal) {
      for (const candidate of candidatePool) {
        if (!candidate?.name) continue;
        if (prefs.vegetarian && !isVegetarianMeal(candidate, MEAT_WORDS)) continue;

        const candidateEffort = candidate.effort ?? "normal";

        if (neededEffort === "normal") {
          if (candidateEffort !== "normal" && candidateEffort !== "quick") continue;
        } else {
          if (candidateEffort !== neededEffort) continue;
        }

        chosenMeal = candidate;
        break;
      }
    }

    if (chosenMeal) {
      next[day] = chosenMeal;
      usedMealNames.add(normalize(chosenMeal.name));
    }
  }

  return next;
}