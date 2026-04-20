import type { Meal, PantryItem } from "./types";

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, "");
}

export function matchPantry(
  meal: Meal,
  pantry: PantryItem[]
) {
  const ingredients = (meal.ingredients || "")
    .split("\n")
    .map((i) => normalize(i));

  const pantrySet = new Set(
    pantry.map((p) => normalize(p.name))
  );

  const have: string[] = [];
  const missing: string[] = [];

  for (const ing of ingredients) {
    const found = Array.from(pantrySet).some((p) =>
      ing.includes(p)
    );

    if (found) have.push(ing);
    else missing.push(ing);
  }

  return {
    have,
    missing,
    score: have.length - missing.length,
  };
}

export function rankMeals(
  meals: Meal[],
  pantry: PantryItem[]
) {
  return meals
    .map((meal) => {
      const match = matchPantry(meal, pantry);

      return {
        meal,
        ...match,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function whatCanICook(
  cookbook: Meal[],
  pantry: PantryItem[]
) {
  const ranked = rankMeals(cookbook, pantry);

  return ranked.slice(0, 5);
}