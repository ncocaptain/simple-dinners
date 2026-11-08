import type { ShoppingItem } from "../shoppingList";
import { buildGroceryHandoffPreview } from "./groceryHandoff";

/**
 * Uses Pantry coverage already calculated by ShoppingListPage.
 * Does not independently match Pantry ingredients.
 */
export type CombinedGrocerySnapshot = {
  id: string;
  checked: boolean;
  sourceIds: readonly string[];
  pantryCoverage: "none" | "partial" | "covered";
  pantryKey: string;
  pantryRestock: boolean;
};

export type GroceryHandoffHold = {
  rowId: string;
  reason:
    | "partial-pantry"
    | "missing-source"
    | "duplicate-source";
  sourceIds: string[];
};

/**
 * Builds a read-only handoff from existing Shopping List decisions.
 *
 * No retailer calls, automatic substitutions, package guesses,
 * purchases, or Shopping List mutations.
 */
export function buildGroceryHandoffFromShopping(
  rawItems: readonly ShoppingItem[],
  combinedRows: readonly CombinedGrocerySnapshot[],
  pantryBuyAnywayIds: ReadonlySet<string>,
) {
  const rawById = new Map(
    rawItems.map((item) => [item.id, item])
  );

  const selectedSourceIds = new Set<string>();
  const selectedRaw: ShoppingItem[] = [];
  const holds: GroceryHandoffHold[] = [];

  let excludedCheckedRows = 0;
  let excludedCoveredRows = 0;

  // Match the Shopping List's existing Restock priority.
  const restockKeys = new Set(
    combinedRows
      .filter(
        (row) =>
          !row.checked &&
          row.pantryRestock &&
          row.pantryKey
      )
      .map((row) => row.pantryKey)
  );

  for (const row of combinedRows) {
    if (row.checked) {
      excludedCheckedRows++;
      continue;
    }

    const buyAnyway =
      pantryBuyAnywayIds.has(row.id) ||
      row.pantryRestock ||
      (
        Boolean(row.pantryKey) &&
        restockKeys.has(row.pantryKey)
      );

    if (
      row.pantryCoverage === "covered" &&
      !buyAnyway
    ) {
      excludedCoveredRows++;
      continue;
    }

    // Do not guess Pantry shortfalls or convert units.
    if (
      row.pantryCoverage === "partial" &&
      !buyAnyway
    ) {
      holds.push({
        rowId: row.id,
        reason: "partial-pantry",
        sourceIds: [...row.sourceIds],
      });
      continue;
    }

    const ids = row.sourceIds;

    if (
      !ids.length ||
      ids.some((id) => !rawById.has(id))
    ) {
      holds.push({
        rowId: row.id,
        reason: "missing-source",
        sourceIds: [...ids],
      });
      continue;
    }

    // Prevent duplicate raw ingredients from entering a
    // retailer handoff through overlapping merged rows.
    if (
      new Set(ids).size !== ids.length ||
      ids.some((id) => selectedSourceIds.has(id))
    ) {
      holds.push({
        rowId: row.id,
        reason: "duplicate-source",
        sourceIds: [...ids],
      });
      continue;
    }

    for (const id of ids) {
      selectedSourceIds.add(id);
      selectedRaw.push(rawById.get(id)!);
    }
  }

  const preview = buildGroceryHandoffPreview(
    selectedRaw
  );

  return {
    ...preview,
    totalMergedRows: combinedRows.length,
    excludedCheckedRows,
    excludedCoveredRows,
    holds,
    requiresAttention:
      preview.requiresAttention + holds.length,
    canAutoAddToCart: false as const,
  };
}
