import { ALL_RECIPES } from "./data";
import { getCookbook } from "./cookbookStore";
import type { Meal } from "./types";

export type Recipe = Meal & { slug: string };

function normalizeSlug(value: string) {
  return String(value || "").trim().toLowerCase();
}

export function getRecipeBySlug(slug: string) {
  const key = normalizeSlug(slug);

  const cookbook = getCookbook();
  const allRecipes = [...ALL_RECIPES, ...cookbook];

  return allRecipes.find((recipe) => {
    const recipeSlug = normalizeSlug(recipe.slug || recipe.id || "");
    return recipeSlug === key;
  }) as Recipe | undefined;
}