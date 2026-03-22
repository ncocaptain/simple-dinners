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
// Builder: deterministic-ish item id
// =====================================================
function makeId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// =====================================================
// Builder: add recipe ingredients to shopping list
// =====================================================
export function addIngredientsToList(
  _recipeName: string,
  ingredients: string
): { items: ShoppingItem[]; addedCount: number } {
  const existing = loadShoppingList();

  const existingIds = new Set(
    existing.map((i) => makeId(i.text.trim().toLowerCase()))
  );

  const lines = normalizeIngredientLines(ingredients);

  const now = Date.now();
  const newItems: ShoppingItem[] = [];

  for (const line of lines) {
    const text = line.trim();
    if (!text) continue;

    const id = makeId(text.toLowerCase());

    // Only skip exact same full ingredient line
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