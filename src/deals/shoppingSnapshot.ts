import { buildGroceryHandoffFromShopping } from "../fulfillment/groceryHandoffFromShopping";
import { summarizeGroceryRequirements } from "../fulfillment/groceryRequirementSummary";
import type { GroceryHandoffLine } from "../fulfillment/groceryHandoff";
import { DEALS_IDENTITY_VERSION, deriveIngredientIdentity } from "./ingredientIdentity";
import type { ShoppingNeed, ShoppingPurchaseSnapshot, ShoppingSnapshotInput } from "./types";

export const DEALS_SNAPSHOT_VERSION = 1 as const;

function freeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

/** Stable property ordering; array order remains meaningful to the handoff. */
function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
      .map(([key, entry]) => [key, stableValue(entry)]));
  }
  return value;
}

/**
 * Pure, detached snapshot of the authoritative purchase pipeline. No storage,
 * Pantry recalculation, amount inference, provider work, or ShoppingItem writes.
 * Caller must supply the same combined coverage decisions as ShoppingListPage
 * (including forceBuy), not independently manufactured Pantry coverage.
 */
export function buildShoppingPurchaseSnapshot(
  input: ShoppingSnapshotInput,
): ShoppingPurchaseSnapshot {
  const rawItems = structuredClone(input.rawItems.map((item) => ({ ...item })));
  const combinedRows = structuredClone(input.combinedRows.map((row) => ({
    ...row, sourceIds: [...row.sourceIds],
  })));
  const pantryBuyAnywayIds = [...input.pantryBuyAnywayIds].sort();
  const handoff = buildGroceryHandoffFromShopping(
    rawItems, combinedRows, new Set(pantryBuyAnywayIds),
  );
  const summary = summarizeGroceryRequirements(handoff.lines);
  const signature = JSON.stringify(stableValue({
    version: DEALS_SNAPSHOT_VERSION,
    identityVersion: DEALS_IDENTITY_VERSION,
    rawItems,
    combinedRows,
    pantryBuyAnywayIds,
    // Include derived output so changed registry/pipeline results invalidate it.
    handoff,
    summary,
    identities: handoff.lines.map((line) => deriveIngredientIdentity([line], rawItems)),
  }));

  const lineById = new Map(handoff.lines.map((line) => [line.itemId, line]));
  const needs: ShoppingNeed[] = [];
  function addNeed(
    lines: GroceryHandoffLine[],
    state: ShoppingNeed["state"],
    requirement: ShoppingNeed["requirement"],
    reviewReason: ShoppingNeed["reviewReason"],
  ) {
    const sourceIds = lines.map((line) => line.itemId);
    needs.push({
      id: `need-${needs.length}`,
      sourceIds,
      shoppingName: lines[0].shoppingName,
      searchName: lines[0].searchCandidate,
      originalIngredients: lines.map((line) => line.originalIngredient),
      identity: deriveIngredientIdentity(lines, rawItems),
      state,
      requirement,
      reviewReason,
      lines,
    });
  }

  for (const group of summary.groups) {
    addNeed(group.sourceLines.map((source) => lineById.get(source.itemId)!),
      "measured", {
        quantity: group.quantity, unit: group.unit, packageSize: group.packageSize,
      }, null);
  }
  for (const item of summary.searchOnly) {
    const line = lineById.get(item.itemId)!;
    addNeed([line], "search-only", {
      quantity: null, unit: "", packageSize: line.packageSize,
    }, item.reason);
  }
  for (const review of summary.reviews) {
    const line = lineById.get(review.itemId)!;
    addNeed([line], "needs-review", {
      quantity: line.quantity, unit: line.unit, packageSize: line.packageSize,
    }, review.reason);
  }

  return freeze({
    version: DEALS_SNAPSHOT_VERSION,
    identityVersion: DEALS_IDENTITY_VERSION,
    signature,
    rawItems,
    combinedRows,
    pantryBuyAnywayIds,
    needs,
    holds: handoff.holds,
    excludedCheckedRows: handoff.excludedCheckedRows,
    excludedCoveredRows: handoff.excludedCoveredRows,
    excludedCheckedSources: handoff.excludedChecked,
  });
}
