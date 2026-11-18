import type { ShoppingItem } from "../shoppingList";

export type ManualShoppingEdit = {
  rawText: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  packageSize: string;
  category: ShoppingItem["category"];
};

/** An explicit edit creates one manual need, not one copy per old recipe. */
export function editShoppingItemGroup(
  items: ShoppingItem[],
  sourceIds: readonly string[],
  edit: ManualShoppingEdit,
): ShoppingItem[] {
  const selected = new Set(sourceIds);
  const sources = items.filter(item => selected.has(item.id));
  if (!sources.length) return items;
  const first = sources[0];
  // Whitelist manual fields. Never carry recipe/Smart Shopping identity,
  // cached display/notes, old measurements, or product-specific restock intent.
  const manual: ShoppingItem = {
    id: first.id,
    addedAt: first.addedAt,
    checked: sources.every(item => item.checked),
    text: edit.rawText,
    category: edit.category,
    sourceRecipe: "",
    normalizedName: edit.name,
    quantity: edit.quantity ?? undefined,
    unit: edit.unit ?? undefined,
    packageSize: edit.packageSize || undefined,
  };
  return items.flatMap(item => item.id === first.id ? [manual] : selected.has(item.id) ? [] : [item]);
}
