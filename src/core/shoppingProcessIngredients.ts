/**
 * This built-in chicken recipe purchases frying oil, then explicitly reserves
 * 1/4 cup in the skillet for gravy. That exact secondary line is not a new buy.
 * Match recipe + full source line; "reserved" alone never excludes an item.
 */
export function isRecipeSuppliedShoppingIngredient(
  recipeName: string,
  ingredientLine: string,
): boolean {
  const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");
  const recipe = normalize(recipeName);
  const line = normalize(ingredientLine);
  return (
    recipe === "dolly-inspired country-fried crispy chicken" ||
    recipe === "pollo crujiente frito al estilo campestre inspirado en dolly"
  ) && (
    line === "1/4 cup reserved frying oil or chicken drippings" ||
    line === "1/4 cup de aceite de freír reservado o jugos del pollo"
  );
}

/** Read-only recovery of the exact old generated IDs captured in the audit. */
export function isLegacyRecipeSuppliedShoppingItem(item: {
  id: string;
  sourceRecipe?: string;
  recipeIngredientText?: string;
  text: string;
}): boolean {
  if (item.recipeIngredientText?.trim()) return false;
  const recipe = String(item.sourceRecipe || "").trim().toLowerCase();
  const text = item.text.trim().toLowerCase().replace(/\s+/g, " ");
  if (recipe === "dolly-inspired country-fried crispy chicken") {
    return text === "1/4 cup frying oil or chicken drippings" &&
      /^frying-oil-or-chicken-drippings-dolly-inspired-country-fried-crispy-chicken-1-4-cup-reserved-frying-oil-or-chicken-drippings-\d+-\d+$/.test(item.id);
  }
  if (recipe === "pollo crujiente frito al estilo campestre inspirado en dolly") {
    return text === "1/4 cup aceite de freir reservado o jugos del pollo" &&
      /^aceite-de-freir-reservado-o-jugos-del-pollo-pollo-crujiente-frito-al-estilo-campestre-inspirado-en-dolly-1-4-cup-de-aceite-de-fre-r-reservado-o-jugos-del-pollo-\d+-\d+$/.test(item.id);
  }
  return false;
}
