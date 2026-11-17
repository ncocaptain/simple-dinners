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
