// src/shoppingList.ts
export type ShoppingItem = {
  id: string;          // stable-ish key
  text: string;        // e.g. "1 cup shredded cheddar cheese"
  checked: boolean;
  addedAt: number;
};

const KEY = "simple-dinners.shoppingList.v1";

function safeParse(json: string | null): ShoppingItem[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadShoppingList(): ShoppingItem[] {
  return safeParse(localStorage.getItem(KEY));
}

export function saveShoppingList(items: ShoppingItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function normalizeIngredientLines(ingredients: string): string[] {
  return ingredients
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    // drop headings like "FOR GARNISH:" if you want
    .filter((l) => !/^\s*for\s+garnish\s*:?\s*$/i.test(l));
}

function makeId(text: string) {
  // Good enough: deterministic-ish key (no crypto needed)
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

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
    const text = line;
    const id = makeId(text);

    // avoid duplicates
    if (existingIds.has(id)) continue;

    newItems.push({
      id,
      text,
      checked: false,
      addedAt: now,
    });
  }

  const merged = [...existing, ...newItems];
  saveShoppingList(merged);

  return { items: merged, addedCount: newItems.length };
}