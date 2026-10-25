import type {
  Meal,
  PantryItem,
} from "./types";

import {
  normalizeIngredientIdentity,
  parseIngredientLine,
  splitIngredientLines,
} from "./ingredientParser";

import {
  getPantryFreshness,
} from "./pantryFreshness";

type CookNowMeal = Meal & {
  favorite?: boolean;
};

type CookNowResult = {
  meal: CookNowMeal;
  score: number;
  matched: string[];
  missing: string[];
};

function normalize(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function splitIngredients(
  text?: string
): string[] {
  const unique =
    new Set<string>();

  for (
    const line of splitIngredientLines(
      text ?? "",
      {
        includeOptional: false,
      }
    )
  ) {
    const parsed =
      parseIngredientLine(line);

    if (parsed.normalizedName) {
      unique.add(
        parsed.normalizedName
      );
    }
  }

  return Array.from(unique);
}

function pantryNames(
  pantry: PantryItem[]
): string[] {
  return pantry
    .filter(
      (item) =>
        getPantryFreshness(
          item.expiresAt
        ).status !== "past-date"
    )
    .map((item) =>
      normalizeIngredientIdentity(
        item.name
      )
    )
    .filter(Boolean);
}

function ingredientMatchesPantry(
  ingredient: string,
  pantry: string[]
) {
  return pantry.some(
    (pantryName) =>
      ingredient.includes(
        pantryName
      ) ||
      pantryName.includes(
        ingredient
      )
  );
}

export function rankCookNowMeals(
  args: {
    meals: CookNowMeal[];
    pantry: PantryItem[];
    favorites?: string[];
  }
): CookNowResult[] {
  const {
    meals,
    pantry,
    favorites = [],
  } = args;

  const pantryList =
    pantryNames(pantry);

  const favSet =
    new Set(
      favorites.map(normalize)
    );

  const results:
    CookNowResult[] =
      meals.map((meal) => {
        const ingredients =
          splitIngredients(
            meal.ingredients
          );

        const matched =
          ingredients.filter(
            (ingredient) =>
              ingredientMatchesPantry(
                ingredient,
                pantryList
              )
          );

        const missing =
          ingredients.filter(
            (ingredient) =>
              !ingredientMatchesPantry(
                ingredient,
                pantryList
              )
          );

        let score = 0;

        score +=
          matched.length * 12;

        const pantryBasics = [
          "salt",
          "pepper",
          "olive oil",
          "oil",
          "butter",
          "garlic",
          "sugar",
        ];

        const realMissing =
          missing.filter(
            (ingredient) =>
              !pantryBasics.some(
                (basic) =>
                  ingredient.includes(
                    basic
                  )
              )
          );

        score -=
          realMissing.length * 6;

        if (
          meal.effort === "quick"
        ) {
          score += 12;
        }

        if (
          meal.effort === "normal"
        ) {
          score += 6;
        }

        if (
          favSet.has(
            normalize(meal.name)
          )
        ) {
          score += 15;
        }

        if (meal.favorite) {
          score += 15;
        }

        score -= Math.max(
          0,
          ingredients.length - 6
        );

        return {
          meal,
          score,
          matched,
          missing,
        };
      });

  return results.sort(
    (a, b) =>
      b.score - a.score
  );
}
