// recipeStore.ts
import type { Meal } from "./types";

export const RECIPES_LS_KEY = "simple-dinners:recipes:v1";

// ADD: cookbook key (change this string if your app uses a different one)
export const COOKBOOK_LS_KEY = "simple-dinners:cookbook:v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ADD: cookbook lookup
export function getCookbookRecipeBySlug(slug: string): (Meal & any) | null {
  const s = (slug || "").trim().toLowerCase();

  // Cookbook stored as an array of meals/entries in localStorage:
  // If your cookbook is stored differently (map/object), tell me and I’ll adjust.
  const all = safeParse<(Meal & any)[]>(
    localStorage.getItem(COOKBOOK_LS_KEY),
    []
  );

  return all.find((r) => (r.slug || "").toLowerCase() === s) ?? null;
}

export type SavedRecipe = Meal & {
  id: string;
  slug: string;
  createdAt: number;
  updatedAt: number;
};


function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function slugify(name: string) {
  return (name ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function loadRecipes(): SavedRecipe[] {
  return safeParse<SavedRecipe[]>(localStorage.getItem(RECIPES_LS_KEY), []);
}

export function saveRecipes(recipes: SavedRecipe[]) {
  localStorage.setItem(RECIPES_LS_KEY, JSON.stringify(recipes));
}

export function upsertRecipeFromMeal(meal: Meal): SavedRecipe {
  const recipes = loadRecipes();
  const now = Date.now();

  const nameKey = (meal.name ?? "").trim().toLowerCase();
  const foundIdx = recipes.findIndex(r => (r.name ?? "").trim().toLowerCase() === nameKey);

  // Create slug only when creating new
  if (foundIdx >= 0) {
    const existing = recipes[foundIdx];
    const updated: SavedRecipe = {
      ...existing,
      name: meal.name,
      ingredients: meal.ingredients ?? "",
      instructions: meal.instructions,
      photoUrl: meal.photoUrl,
      effort: meal.effort,
      updatedAt: now,
    };
    recipes[foundIdx] = updated;
    saveRecipes(recipes);
    return updated;
  }

  const base = slugify(meal.name);
  const existingSlugs = new Set(recipes.map(r => r.slug));
  let slug = base || "recipe";
  let i = 2;
  while (existingSlugs.has(slug)) slug = `${base}-${i++}`;

  const created: SavedRecipe = {
    ...meal,
    id: makeId(),
    slug,
    createdAt: now,
    updatedAt: now,
  };

  recipes.unshift(created);
  saveRecipes(recipes);
  return created;
}

export function getRecipeBySlug(slug: string): SavedRecipe | undefined {
  return loadRecipes().find(r => r.slug === slug);
}