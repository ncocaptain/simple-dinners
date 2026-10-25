import type {
  Meal,
  PantryItem,
} from "./types";

import {
  getPantryComparableIngredientName,
  getPantryComparableName,
} from "./pantryUsage";

import {
  getPantryFreshness,
} from "./pantryFreshness";

export type PantryRecipeMatch = {
  recipe: Meal;
  matchedCount: number;
  totalCount: number;
  missingCount: number;
  coverage: number;
  score: number;
  matchedIngredients: string[];
  useSoonMatchedCount: number;
  useSoonMatchedIngredients: string[];
};

function isSectionHeader(line: string) {
  const value = String(line || "").trim();

  if (!value) return true;

  return (
    value.endsWith(":") &&
    !/\d/.test(value)
  );
}

function isOptionalIngredient(line: string) {
  return /\boptional\b/i.test(
    String(line || "")
  );
}

function ingredientLines(ingredients: string) {
  return String(ingredients || "")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(
      (line) => !isSectionHeader(line)
    )
    .filter(
      (line) => !isOptionalIngredient(line)
    );
}

export function matchRecipeToPantry(
  recipe: Meal,
  pantryItems: PantryItem[]
): PantryRecipeMatch {
  const pantryNames = new Set(
    pantryItems
      .filter(
        (item) =>
          getPantryFreshness(
            item.expiresAt
          ).status !==
          "past-date"
      )
      .map((item) =>
        getPantryComparableName(item.name)
      )
      .filter(Boolean)
  );

  const useSoonPantryNames =
    new Set(
      pantryItems
        .filter(
          (item) =>
            getPantryFreshness(
              item.expiresAt
            ).status ===
            "use-soon"
        )
        .map((item) =>
          getPantryComparableName(
            item.name
          )
        )
        .filter(Boolean)
    );

  const uniqueIngredients =
    new Set<string>();

  for (
    const line of ingredientLines(
      recipe.ingredients
    )
  ) {
    const normalized =
      getPantryComparableIngredientName(
        line
      );

    if (normalized) {
      uniqueIngredients.add(
        normalized
      );
    }
  }

  const ingredientNames =
    Array.from(
      uniqueIngredients
    );

  const matchedIngredients =
    ingredientNames.filter(
      (ingredientName) =>
        pantryNames.has(
          ingredientName
        )
    );

  const useSoonMatchedIngredients =
    matchedIngredients.filter(
      (ingredientName) =>
        useSoonPantryNames.has(
          ingredientName
        )
    );

  const useSoonMatchedCount =
    useSoonMatchedIngredients.length;

  const totalCount =
    ingredientNames.length;

  const matchedCount =
    matchedIngredients.length;

  const missingCount =
    Math.max(
      0,
      totalCount -
        matchedCount
    );

  const coverage =
    totalCount > 0
      ? matchedCount /
        totalCount
      : 0;

  const score =
    coverage * 100 +
    matchedCount * 20 +
    Math.min(
      useSoonMatchedCount,
      3
    ) *
      15;

  return {
    recipe,
    matchedCount,
    totalCount,
    missingCount,
    coverage,
    score,
    matchedIngredients,
    useSoonMatchedCount,
    useSoonMatchedIngredients,
  };
}

export function rankRecipesByPantry(
  recipes: Meal[],
  pantryItems: PantryItem[]
) {
  return recipes
    .map((recipe) =>
      matchRecipeToPantry(
        recipe,
        pantryItems
      )
    )
    .filter(
      (match) =>
        match.totalCount > 0 &&
        match.matchedCount > 0
    )
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (
        b.matchedCount !==
        a.matchedCount
      ) {
        return (
          b.matchedCount -
          a.matchedCount
        );
      }

      if (
        b.coverage !==
        a.coverage
      ) {
        return (
          b.coverage -
          a.coverage
        );
      }

      return a.recipe.name.localeCompare(
        b.recipe.name
      );
    });
}
