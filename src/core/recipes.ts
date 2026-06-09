import { ALL_RECIPES } from "./data";
import { getCookbook } from "./cookbookStore";
import type { Meal } from "./types";

export type Recipe = Meal & { slug: string };

function normalizeSlug(value: string) {
  return String(value || "").trim().toLowerCase();
}

function findBySlug(recipes: Meal[], key: string) {
  return recipes.find((recipe) => {
    const recipeSlug = normalizeSlug(recipe.slug || recipe.id || "");
    return recipeSlug === key;
  });
}

export function getRecipeBySlug(slug: string) {
  const key = normalizeSlug(slug);

  const cookbook = getCookbook();

  const builtInRecipe = findBySlug(ALL_RECIPES, key);
  const cookbookRecipe = findBySlug(cookbook, key);

  if (builtInRecipe && cookbookRecipe) {
    return {
      ...builtInRecipe,
      ...cookbookRecipe,

      // Keep newer built-in add-on data if the saved copy is missing it.
      suggestedSides:
        cookbookRecipe.suggestedSides?.length
          ? cookbookRecipe.suggestedSides
          : builtInRecipe.suggestedSides,

      suggestedDesserts:
        cookbookRecipe.suggestedDesserts?.length
          ? cookbookRecipe.suggestedDesserts
          : builtInRecipe.suggestedDesserts,

      translations: {
        ...builtInRecipe.translations,
        ...cookbookRecipe.translations,
        es: {
          ...builtInRecipe.translations?.es,
          ...cookbookRecipe.translations?.es,
          suggestedSides:
            cookbookRecipe.translations?.es?.suggestedSides?.length
              ? cookbookRecipe.translations.es.suggestedSides
              : builtInRecipe.translations?.es?.suggestedSides,
          suggestedDesserts:
            cookbookRecipe.translations?.es?.suggestedDesserts?.length
              ? cookbookRecipe.translations.es.suggestedDesserts
              : builtInRecipe.translations?.es?.suggestedDesserts,
        },
      },
    } as Recipe;
  }

  return (builtInRecipe || cookbookRecipe) as Recipe | undefined;
}