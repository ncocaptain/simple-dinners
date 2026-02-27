import recipesRaw from "./recipes.json";
import type { Meal } from "./types";

export type Recipe = Meal & { slug: string };

export const RECIPES = recipesRaw as Recipe[];

export function getRecipeBySlug(slug: string) {
  return RECIPES.find(r => r.slug === slug);
}