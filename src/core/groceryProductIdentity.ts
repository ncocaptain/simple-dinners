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
