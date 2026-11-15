import { categorizeGroceryItem, type GroceryCategory } from "./groceryCategories";
import { findCanonicalIngredient } from "./ingredientRegistry";

// Pantry names have already had packaging prefixes removed. Prefer product
// identity over loose grocery keywords; never infer or store an inventory amount.
export function categorizePantryItem(name: string, unit?: string | null): GroceryCategory {
  const normalized = name.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim();
  if (/\b(?:hand warmers?|colace)\b/.test(normalized)) return "Other";
  if (/\bfrozen\b/.test(normalized)) return "Frozen";
  if (/\b(?:fresh|cherry|grape) tomato(?:es)?\b/.test(normalized) || /\bcorn on the cob\b/.test(normalized)) return "Produce";
  if (/\b(?:corn|tomato(?:es)?)\b/.test(normalized) && (/\b(?:can|cans|canned)\b/.test(normalized) || /^(?:can|cans)$/.test(unit || ""))) return "Pantry";
  const canonical = findCanonicalIngredient(name);
  if (canonical) return canonical.category;
  if (/\begg noodles?\b/.test(normalized)) return findCanonicalIngredient("egg noodles")!.category;
  if (/\b(?:diced|crushed|canned|stewed) tomato(?:es)?\b/.test(normalized)) return "Pantry";
  // There is no separate Snacks aisle in the existing category model.
  if (/\b(?:fritos|potato chips|tortilla chips|corn chips)\b/.test(normalized)) return "Pantry";
  return categorizeGroceryItem(name);
}
