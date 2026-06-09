import { ALL_RECIPES } from "./data";
import type { Meal } from "./types";

function normalizeSideName(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/\+/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(simple|classic|easy|homemade|casero|casera|sencillo|sencilla|clasico|clasica)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const SIDE_ALIASES: Record<string, string[]> = {
  cornbread: ["corn bread", "pan de maiz"],
  "tortilla chips": ["totopos", "chips de tortilla"],
  "simple green salad": ["green salad", "ensalada verde", "ensalada verde sencilla"],
  "fruit salad": ["ensalada de frutas"],
  "carrot sticks with ranch": ["palitos de zanahoria con ranch"],
};

function getRecipesByTag(tagName: string): Meal[] {
  const normalizedTag = String(tagName || "").toLowerCase().trim();

  return ALL_RECIPES.filter((meal: Meal) =>
    Array.isArray(meal.tags)
      ? meal.tags.some(
          (tag) => String(tag).toLowerCase().trim() === normalizedTag
        )
      : false
  );
}

function getSideRecipes(): Meal[] {
  return getRecipesByTag("side");
}

function getDessertRecipes(): Meal[] {
  return getRecipesByTag("dessert");
}

function getRecipeMatchNames(meal: Meal): string[] {
  return [
    meal.name,
    meal.slug,
    meal.id,
    meal.translations?.es?.name,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);
}

function recipeMatchesName(meal: Meal, incomingName: string) {
  const original = String(incomingName || "").trim();
  if (!original) return false;

  const lower = original.toLowerCase().trim();
  const normalized = normalizeSideName(original);

  const matchNames = getRecipeMatchNames(meal);

  return matchNames.some((name) => {
    const candidateLower = name.toLowerCase().trim();
    const candidateNormalized = normalizeSideName(name);

    if (candidateLower === lower) return true;
    if (candidateNormalized === normalized) return true;

    const aliases = SIDE_ALIASES[candidateNormalized] || [];

    return aliases.some(
      (alias) => normalizeSideName(alias) === normalized
    );
  });
}

export function findSideRecipeByName(sideName: string): Meal | null {
  const original = String(sideName || "").trim();
  if (!original) return null;

  const normalized = normalizeSideName(original);
  const sideRecipes = getSideRecipes();

  return (
    sideRecipes.find((meal) => recipeMatchesName(meal, original)) ||
    sideRecipes.find((meal) => {
      const names = getRecipeMatchNames(meal).map(normalizeSideName);

      return names.some((name) => {
        const aliases = SIDE_ALIASES[name] || [];
        return aliases.some(
          (alias) => normalizeSideName(alias) === normalized
        );
      });
    }) ||
    null
  );
}

export function getSideShoppingLines(sideName: string) {
  const sideRecipe = findSideRecipeByName(sideName);

  if (!sideRecipe?.ingredients?.trim()) {
    return {
      sideName,
      sideRecipe: null,
      lines: [sideName],
    };
  }

  return {
    sideName,
    sideRecipe,
    lines: sideRecipe.ingredients
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean),
  };
}

export function findDessertRecipeByName(dessertName: string): Meal | null {
  const original = String(dessertName || "").trim();
  if (!original) return null;

  const dessertRecipes = getDessertRecipes();

  return (
    dessertRecipes.find((meal) => recipeMatchesName(meal, original)) || null
  );
}

export function getDessertShoppingLines(dessertName: string) {
  const dessertRecipe = findDessertRecipeByName(dessertName);

  if (!dessertRecipe?.ingredients?.trim()) {
    return {
      dessertName,
      dessertRecipe: null,
      lines: [dessertName],
    };
  }

  return {
    dessertName,
    dessertRecipe,
    lines: dessertRecipe.ingredients
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean),
  };
}