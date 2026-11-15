import { hasSpanishIngredientChoice } from "./spanishIngredients";
import { categorizeGroceryItem, type GroceryCategory } from "./groceryCategories";
import { findCanonicalIngredient, normalizeSpanishIngredientLine } from "./ingredientRegistry";

// Pantry names have already had packaging prefixes removed. Prefer product
// identity over loose grocery keywords; never infer or store an inventory amount.
export function categorizePantryItem(name: string, unit?: string | null): GroceryCategory {
  if (hasSpanishIngredientChoice(name)) return "Other";
  name = normalizeSpanishIngredientLine(name).text;
  const normalized = name.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim();
  if (/\b(?:hand warmers?|colace)\b/.test(normalized)) return "Other";
  if (/\bfrozen\b/.test(normalized)) return "Frozen";
  if (/\b(?:fresh|cherry|grape) tomato(?:es)?\b/.test(normalized) || /\bcorn on the cob\b/.test(normalized)) return "Produce";
  if (/\b(?:corn|tomato(?:es)?|green beans?|pineapple rings?|black eyed peas)\b/.test(normalized) && (/\b(?:can|cans|canned)\b/.test(normalized) || /^(?:can|cans)$/.test(unit || ""))) return "Pantry";
  // Product/aisle identities demonstrated by the built-in catalog. Keep this
  // presentation mapping separate from inventory matching and quantities.
  if (/^(?:full fat )?coconut milk$/.test(normalized)) return "Pantry";
  if (/^(?:plain |panko )?bread\s?crumbs$/.test(normalized)) return "Pantry";
  if (/^(?:yellow |green |red |orange )?bell peppers?$/.test(normalized)) return "Produce";
  if (/^(?:seedless )?watermelon$/.test(normalized)) return "Produce";
  if (/^(?:fresh )?chives$/.test(normalized)) return "Produce";
  if (/^(?:refrigerated )?biscuits$|^pico de gallo$/.test(normalized)) return "Deli / Refrigerated";
  if (/^(?:jalapeno smoked sausages?|cocktail sausages?)$/.test(normalized)) return "Meat / Seafood";
  if (/^(?:(?:manicotti|lasagna|ramen|lo mein) (?:shells|noodles)|shelf stable potato gnocchi|cauliflower gnocchi|cheese tortellini|crispy chow mein noodles)$/.test(normalized)) return "Pantry";
  if (/^(?:enchilada sauce|green chiles|gochujang|maple syrup|caramel sauce|rotel|lentils|quinoa|buffalo sauce|vanilla wafers|cocoa powder|unsweetened cocoa powder|cracker crumbs|pumpkin puree|stuffing mix|yellow cake mix|corn muffin mix|instant vanilla pudding|instant chocolate pudding|turkey gravy|french fried onions)$/.test(normalized)) return "Pantry";
  if (/^ground coriander$/.test(normalized)) return "Spices / Seasonings";
  if (/^(?:flour or corn tortillas)$/.test(normalized)) return "Bakery";
  if (/^(?:olive oil or avocado oil|extra hot sauce)$/.test(normalized)) return "Pantry";
  if (/^(?:oil (?:packed )?)?sun dried tomatoes$/.test(normalized)) return "Pantry";
  if (normalized === "french fries") return "Frozen";
  const canonical = findCanonicalIngredient(name);
  if (canonical) return canonical.category;
  if (/\begg noodles?\b/.test(normalized)) return findCanonicalIngredient("egg noodles")!.category;
  if (/\b(?:diced|crushed|canned|stewed) tomato(?:es)?\b/.test(normalized)) return "Pantry";
  // There is no separate Snacks aisle in the existing category model.
  if (/\b(?:fritos|potato chips|tortilla chips|corn chips)\b/.test(normalized)) return "Pantry";
  return categorizeGroceryItem(name);
}
