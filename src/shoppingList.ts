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
// Builder: load list with backward compatibility
// =====================================================
export function loadShoppingList(): ShoppingItem[] {
  const items = safeParse(localStorage.getItem(KEY));

  return items.map((item: any) => ({
    ...item,
    category: item.category || categorizeGroceryItem(item.text || ""),
  }));
}

// =====================================================
// Builder: save list
// =====================================================
export function saveShoppingList(items: ShoppingItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

// =====================================================
// Builder: ingredient line cleanup
// =====================================================
export function normalizeIngredientLines(ingredients: string): string[] {
  const normalized = ingredients
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\u2022/g, "\n")
    .replace(/\u2023/g, "\n")
    .replace(/\u25e6/g, "\n")
    .replace(/\u2043/g, "\n")
    .replace(/\u2219/g, "\n")
    .replace(/^\s*[-*•]\s*/gm, "")
    .replace(/\n{2,}/g, "\n");

  return normalized
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^\s*for\s+garnish\s*:?\s*$/i.test(l));
}

// =====================================================
// Builder: helper cleanup for duplicate merging
// =====================================================
function stripMeasurements(line: string): string {
  let text = line.toLowerCase().trim();

  text = text.replace(/\([^)]*\)/g, " ");

  text = text.replace(
    /^\s*\d+(?:\s+\d+\/\d+|\/\d+|\.\d+)?\s*(?:x\s*)?/,
    ""
  );

  text = text.replace(
    /^\s*(cups?|cup|tablespoons?|tbsp|teaspoons?|tsp|pounds?|lbs?|lb|ounces?|oz|cans?|packages?|pkgs?|cloves?|slices?|sticks?)\b\.?\s*/,
    ""
  );

  return text.trim();
}

function cleanIngredientForKey(line: string): string {
  let text = stripMeasurements(line);

  const removePhrases = [
    "to taste",
    "as needed",
    "optional",
    "for garnish",
    "plus more for garnish",
    "divided",
    "stems removed",
    "seeds removed",
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
  ];

  removeWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    text = text.replace(regex, " ");
  });

  const removeNouns = ["clove", "cloves", "fillet", "fillets"];
  removeNouns.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    text = text.replace(regex, " ");
  });

  text = text.split(",")[0];
  text = text.replace(/^[-•*]\s*/, "");
  text = text.replace(/\s+/g, " ").trim();

  if (text === "salt and pepper") return "salt-pepper";

  return text;
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

function makeIngredientKey(text: string) {
  const cleaned = cleanIngredientForKey(text);
  return makeId(cleaned || text);
}

// =====================================================
// Builder: add recipe ingredients to shopping list
// =====================================================
export function addIngredientsToList(
  _recipeName: string,
  ingredients: string
): { items: ShoppingItem[]; addedCount: number } {
  const existing = loadShoppingList();
  const existingIds = new Set(existing.map((i) => i.id));

  const lines = normalizeIngredientLines(ingredients);

  const now = Date.now();
  const newItems: ShoppingItem[] = [];

  for (const line of lines) {
    const text = line.trim();
    if (!text) continue;

    const id = makeIngredientKey(text);

    if (existingIds.has(id)) continue;

    newItems.push({
      id,
      text,
      checked: false,
      addedAt: now,
      category: categorizeGroceryItem(text),
    });

    existingIds.add(id);
  }

  const merged = [...existing, ...newItems];
  saveShoppingList(merged);

  return { items: merged, addedCount: newItems.length };
}