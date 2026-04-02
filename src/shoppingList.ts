import { categorizeGroceryItem, type GroceryCategory } from "./core/groceryCategories";

// =====================================================
// Builder: shopping list item type
// =====================================================
export type ShoppingItem = {
  id: string;
  text: string;
  checked: boolean;
  addedAt: number;
  category: GroceryCategory;
  sourceRecipe?: string;
};

const KEY = "simple-dinners.shoppingList.v1";

// =====================================================
// Builder: safe localStorage parsing
// =====================================================
function safeParse(json: string | null): ShoppingItem[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// =====================================================
// Builder: deterministic-ish item id
// =====================================================
function makeId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// =====================================================
// Builder: ingredient cleanup for categorizing
// =====================================================
function cleanIngredientForCategory(line: string) {
  let text = String(line || "").toLowerCase().trim();

  text = text.replace(/\([^)]*\)/g, " ");
  text = text.replace(/^[-•*]\s*/, "");
  text = text.replace(/<[^>]+>/g, " ");

  const removePhrases = [
    "to taste",
    "as needed",
    "optional",
    "for garnish",
    "plus more for garnish",
    "divided",
    "stems removed",
    "seeds removed",
    "for topping",
    "for serving",
    "plus more",
  ];

  removePhrases.forEach((phrase) => {
    text = text.replaceAll(phrase, " ");
  });

  const removeWords = [
    "small",
    "medium",
    "large",
    "extra-large",
    "fresh",
    "freshly",
    "thin",
    "thinly",
    "thick",
    "thickly",
    "finely",
    "roughly",
    "chopped",
    "diced",
    "minced",
    "sliced",
    "halved",
    "cubed",
    "shredded",
    "grated",
    "peeled",
    "crushed",
    "softened",
    "melted",
    "beaten",
    "drained",
    "rinsed",
    "packed",
    "whole",
    "boneless",
    "skinless",
    "lean",
  ];

  removeWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    text = text.replace(regex, " ");
  });

  text = text.replace(/\bcans?\s+of\s+/g, " ");
  text = text.replace(/\bcans?\s+/g, " ");
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

// =====================================================
// Builder: normalize ingredient lines from recipe text
// =====================================================
export function normalizeIngredientLines(ingredients: string): string[] {
  return String(ingredients)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/•/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\n{2,}/g, "\n")
    .split("\n")
    .map((l) => l.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean)
    .filter((l) => !/^\s*for\s+garnish\s*:?\s*$/i.test(l));
}

// =====================================================
// Builder: normalize ingredient for display + merging
// =====================================================
function normalizeIngredientForDisplay(line: string) {
  let text = String(line || "").toLowerCase().trim();

  text = text.replace(/\([^)]*\)/g, " ");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/^[-•*]\s*/, "");
  text = text.replace(/\u00a0/g, " ");

  if (/^\s*for\s+.+$/i.test(text)) return "";
  if (/^\s*[:;,./-]+\s*$/i.test(text)) return "";

  const junkPhrases = [
    "to taste",
    "as needed",
    "optional",
    "for garnish",
    "for serving",
    "for topping",
    "plus more",
    "plus more for garnish",
    "divided",
  ];

  junkPhrases.forEach((phrase) => {
    text = text.replaceAll(phrase, " ");
  });

  const prepWords = [
    "small",
    "medium",
    "large",
    "extra-large",
    "fresh",
    "freshly",
    "thin",
    "thinly",
    "thick",
    "thickly",
    "finely",
    "roughly",
    "chopped",
    "diced",
    "minced",
    "sliced",
    "halved",
    "cubed",
    "shredded",
    "grated",
    "peeled",
    "crushed",
    "softened",
    "melted",
    "beaten",
    "drained",
    "rinsed",
    "packed",
    "whole",
    "boneless",
    "skinless",
  ];

  prepWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    text = text.replace(regex, " ");
  });

  // remove leading amounts and units
  text = text.replace(
    /^\s*(\d+([./]\d+)?|\d+\s+\d+\/\d+|½|¼|¾|⅓|⅔)\s*/g,
    ""
  );

  text = text.replace(
    /^\s*(cup|cups|tbsp|tsp|teaspoon|teaspoons|tablespoon|tablespoons|oz|ounce|ounces|lb|lbs|pound|pounds|g|kg|ml|l|clove|cloves|can|cans|package|packages|slice|slices)\b/g,
    ""
  );

  // normalize canned wording
  text = text.replace(/\bcans?\s+of\s+/g, " ");
  text = text.replace(/\bcans?\s+/g, " ");
  text = text.replace(/\bcan\s+/g, " ");

  // normalize common patterns
  text = text.replace(/\blean ground beef\b/g, "ground beef");
  text = text.replace(/\bextra lean ground beef\b/g, "ground beef");
  text = text.replace(/\bground black pepper\b/g, "black pepper");
  text = text.replace(/\bonion powders?\b/g, "onion powder");
  text = text.replace(/\bgarlic powders?\b/g, "garlic powder");
  text = text.replace(/\bslices?\s+bread\b/g, "bread");
  text = text.replace(/\beggs?\b/g, "eggs");

  // clean repeated spaces and separators
  text = text.replace(/\s*\/\s*/g, " / ");
  text = text.replace(/\s+/g, " ").trim();

  // remove weak/junk results
  if (!text || text.length < 2) return "";
  if (/^[^a-z]+$/i.test(text)) return "";
  if (text === ":" || text === "/" || text === "-") return "";

  return text;
}

// =====================================================
// Builder: load list with backward compatibility
// =====================================================
export function loadShoppingList(): ShoppingItem[] {
  const items = safeParse(localStorage.getItem(KEY));

  return items
    .map((item: any) => {
      const normalizedText = normalizeIngredientForDisplay(item.text || "");

      if (!normalizedText) return null;

      return {
        ...item,
        id: item.id || makeId(normalizedText),
        text: normalizedText,
        category:
          item.category ||
          categorizeGroceryItem(cleanIngredientForCategory(normalizedText)),
        sourceRecipe: item.sourceRecipe || "",
      } as ShoppingItem;
    })
    .filter(Boolean) as ShoppingItem[];
}

// =====================================================
// Builder: save list
// =====================================================
export function saveShoppingList(items: ShoppingItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

// =====================================================
// Builder: add recipe ingredients to shopping list
// =====================================================
export function addIngredientsToList(
  recipeName: string,
  ingredients: string
): { items: ShoppingItem[]; addedCount: number } {
  const existing = loadShoppingList();

  const existingIds = new Set(existing.map((i) => makeId(i.text.trim().toLowerCase())));
  const lines = normalizeIngredientLines(ingredients);

  const now = Date.now();
  const newItems: ShoppingItem[] = [];

  for (const line of lines) {
    const normalizedText = normalizeIngredientForDisplay(line);
    if (!normalizedText) continue;

    const id = makeId(normalizedText);
    if (!id) continue;

    if (existingIds.has(id)) continue;

    newItems.push({
      id,
      text: normalizedText,
      checked: false,
      addedAt: now,
      category: categorizeGroceryItem(
        cleanIngredientForCategory(normalizedText)
      ),
      sourceRecipe: recipeName || "",
    });

    existingIds.add(id);
  }

  const merged = [...existing, ...newItems];
  saveShoppingList(merged);

  return { items: merged, addedCount: newItems.length };
}