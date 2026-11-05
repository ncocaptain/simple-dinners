/**
 * Store-neutral product identity used for shopping-list presentation and
 * future retailer searches. Recipe quantities, ingredient wording, and pantry
 * matching must keep their own data; this is only the shopper-facing layer.
 *
 * Do not guess a purchasable package size from cups or tablespoons:
 * real sizes/stock depend on the selected retailer.
 */
export type GroceryProductIdentity = {
  displayName: string;
  searchName: string;
  showRecipeVolume: boolean;
};

export function getGroceryProductIdentity(
  ingredientName: string,
): GroceryProductIdentity | null {
  const name = String(ingredientName || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const product = (
    displayName: string,
    showRecipeVolume = false,
  ): GroceryProductIdentity => ({
    displayName,
    searchName: displayName,
    showRecipeVolume,
  });

  if (/^(?:fresh )?strawberr(?:y|ies)$/.test(name)) {
    return product("Fresh Strawberries", true);
  }

  if (/^(?:fresh )?blueberr(?:y|ies)$/.test(name)) {
    return product("Fresh Blueberries", true);
  }

  if (name === "whipped cream" || name === "ready to use whipped cream") {
    return product("Whipped Cream", true);
  }

  if (name === "corn chips") {
    return product("Corn Chips", true);
  }

  if (name === "granola") {
    return product("Granola", true);
  }

  if (name === "vanilla yogurt") {
    return product("Vanilla Yogurt", true);
  }

  if (/^graham cracker (?:sheets?|crumbs?)$/.test(name) ||
      name === "graham crackers") {
    return product("Graham Crackers");
  }

  if (/^(?:ready to eat )?pound cake$/.test(name)) {
    return product("Pound Cake");
  }

  if (/^(?:ready to eat )?apple pie filling$/.test(name)) {
    return product("Apple Pie Filling");
  }

  const pudding = name.match(
    /^(?:ready to eat )?(chocolate|vanilla) pudding snack cups?$/,
  );
  if (pudding) {
    return product(
      pudding[1] === "chocolate"
        ? "Chocolate Pudding Snack Cups"
        : "Vanilla Pudding Snack Cups",
    );
  }

  return null;
}

export type GroceryPurchaseAmount = {
  quantity: number;
  unit: string | null;
  packageSize?: string;
  mixedUnits?: boolean;
  isCountable?: boolean;
};

/**
 * Format a purchase-oriented label, while leaving the actual recipe
 * quantity and original ingredient text unchanged in ShoppingItem.
 *
 * "3 cups strawberries" -> "Fresh Strawberries · 3 cups needed"
 * No speculative package conversion or product SKU is implied.
 */
export function formatGroceryPurchaseLabel(
  ingredientName: string,
  amount: GroceryPurchaseAmount,
): string | null {
  const match = getGroceryProductIdentity(ingredientName);
  if (!match) return null;

  const { quantity, unit, packageSize = "", mixedUnits = false, isCountable = false } = amount;
  const hasQuantity = Number.isFinite(quantity) && quantity > 0;
  const cleanQty = (value: number) =>
    Number.isInteger(value)
      ? String(value)
      : String(Number(value.toFixed(2)));

  if (
    match.showRecipeVolume &&
    hasQuantity &&
    !mixedUnits &&
    (unit === "cup" || unit === "Tbsp" || unit === "tsp")
  ) {
    const unitLabel =
      unit === "cup"
        ? quantity === 1 ? "cup" : "cups"
        : unit;
    return match.displayName + " · " + cleanQty(quantity) + " " +
      unitLabel + " needed";
  }

  if (isCountable && hasQuantity && !mixedUnits) {
    return cleanQty(quantity) + " " + match.displayName;
  }

  if (
    hasQuantity && !mixedUnits && unit &&
    ["can", "package", "box", "jar", "carton", "bag", "packet"].includes(unit)
  ) {
    const plural = quantity === 1
      ? unit
      : unit === "box" ? "boxes" : unit + "s";
    const size = packageSize ? " (" + packageSize + ")" : "";
    return cleanQty(quantity) + " " + plural + size + " " +
      match.displayName;
  }

  return match.displayName;
}
