import type { Meal, PantryItem } from "./types";

type CookNowMeal = Meal & {
  favorite?: boolean;
};

type CookNowResult = {
  meal: CookNowMeal;
  score: number;
  matched: string[];
  missing: string[];
};

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function splitIngredients(text?: string): string[] {
  return (text ?? "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((line) => {
      return line
        .toLowerCase()
        .replace(/^\d+(\s*\/\s*\d+)?\s*/, "")
        .replace(/\b(cup|cups|tbsp|tsp|lb|lbs|oz|clove|cloves|can|cans|package|packages)\b/g, "")
        .replace(/[(),.-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    })
    .filter(Boolean);
}

function pantryNames(pantry: PantryItem[]): string[] {
  return pantry.map((p) => normalize(p.name));
}

function ingredientMatchesPantry(ingredient: string, pantry: string[]) {
  return pantry.some((p) => ingredient.includes(p) || p.includes(ingredient));
}

export function rankCookNowMeals(args: {
  meals: CookNowMeal[];
  pantry: PantryItem[];
  favorites?: string[];
}): CookNowResult[] {
  const { meals, pantry, favorites = [] } = args;
  const pantryList = pantryNames(pantry);
  const favSet = new Set(favorites.map(normalize));

  const results: CookNowResult[] = meals.map((meal) => {
    const ingredients = splitIngredients(meal.ingredients);

    const matched = ingredients.filter((ing) =>
      ingredientMatchesPantry(ing, pantryList)
    );

    const missing = ingredients.filter(
      (ing) => !ingredientMatchesPantry(ing, pantryList)
    );

    let score = 0;

    score += matched.length * 10;
    score -= missing.length * 6;

    if (meal.effort === "quick") score += 12;
    if (meal.effort === "normal") score += 6;

    if (favSet.has(normalize(meal.name))) score += 15;
    if (meal.favorite) score += 15;

    score -= Math.max(0, ingredients.length - 6);

    return {
      meal,
      score,
      matched,
      missing,
    };
  });

  return results.sort((a, b) => b.score - a.score);
}