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