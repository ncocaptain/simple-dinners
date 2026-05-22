import type { Meal } from "./types";
import type { LanguageCode } from "../i18n";

export function getLocalizedMeal(meal: Meal | null | undefined, language: LanguageCode): Meal | null {
  if (!meal) return null;

  if (language !== "es") return meal;

  const translated = meal.translations?.es;

  if (!translated) return meal;

  return {
    ...meal,
    name: translated.name || meal.name,
    notes: translated.notes || meal.notes,
    ingredients: translated.ingredients || meal.ingredients,
    instructions: translated.instructions || meal.instructions,
    tags: translated.tags || meal.tags,
  };
}