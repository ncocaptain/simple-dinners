import type { ShoppingItem } from "../shoppingList";
import {
  assessGroceryDeliveryReadiness,
  type GroceryQuantityOption,
} from "../core/groceryChoiceResolver";

/**
 * Read-only grocery handoff preview.
 *
 * The caller supplies the items the shopper is actually
 * reviewing, after the appropriate pantry filtering.
 *
 * This module NEVER sends items to a retailer.
 */

export type GroceryHandoffLine = {
  itemId: string;
  shoppingName: string;
  sourceRecipe: string | null;
  originalIngredient: string;
  searchCandidate: string;
  quantity: number | null;
  unit: string;
  packageSize: string;
  status:
    | "search-candidate"
    | "needs-choice"
    | "needs-product-review"
    | "needs-search-term"
    | "needs-quantity-review";
  quantityOptions: GroceryQuantityOption[] | null;
  needsQuantityRecalculation: boolean;
  canAutoAddToCart: false;
};

export function buildGroceryHandoffPreview(
  items: readonly ShoppingItem[]
) {
  const lines: GroceryHandoffLine[] = [];
  let excludedChecked = 0;

  for (const item of items) {
    // Checked items are not part of the pending purchase.
    if (item.checked) {
      excludedChecked++;
      continue;
    }

    const originalIngredient =
      item.recipeIngredientText ||
      item.normalizedName ||
      item.text ||
      "";

    const readiness = assessGroceryDeliveryReadiness({
      normalizedName: item.normalizedName || item.text,
      recipeIngredientText: originalIngredient,
      grocerySearchName: item.grocerySearchName,
      quantity: item.quantity,
      unit: item.unit,
      packageSize: item.packageSize,
    });

    const status = readiness.state;

    lines.push({
      itemId: item.id,
      shoppingName: item.normalizedName || item.text,
      sourceRecipe: item.sourceRecipe || null,
      originalIngredient,
      searchCandidate: readiness.searchName,
      quantity: readiness.quantity,
      unit: readiness.unit,
      packageSize: readiness.packageSize,
      status,
      quantityOptions: readiness.quantityOptions,
      needsQuantityRecalculation:
        readiness.needsQuantityRecalculation,
      canAutoAddToCart: false,
    });
  }

  return {
    totalInput: items.length,
    excludedChecked,
    lines,
    requiresAttention: lines.filter(
      line => line.status !== "search-candidate"
    ).length,
    // Retailer-specific matches and purchase sizes
    // have not been verified.
    canAutoAddToCart: false as const,
  };
}
