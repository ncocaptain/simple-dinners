import type { ShoppingItem } from "../shoppingList";
import { findCanonicalIngredient } from "../core/ingredientRegistry";
import { parseIngredientLine } from "../core/ingredientParser";
import { resolveGroceryChoice } from "../core/groceryChoiceResolver";
import type { GroceryHandoffLine } from "../fulfillment/groceryHandoff";
import type { DeepReadonly, IngredientIdentity } from "./types";

export const DEALS_IDENTITY_VERSION = 1 as const;

/**
 * Exact registry evidence only. Unknown source wording (including product-form
 * modifiers) withholds identity rather than stripping constraints or guessing.
 * This intentionally sacrifices coverage; it is not retailer product matching.
 * Registry quantities/packages are never read.
 */
export function deriveIngredientIdentity(
  lines: readonly DeepReadonly<GroceryHandoffLine>[],
  rawItems: readonly Readonly<ShoppingItem>[],
): IngredientIdentity {
  const sources = new Map(rawItems.map((item) => [item.id, item]));
  const original = (line: DeepReadonly<GroceryHandoffLine>) => {
    const source = sources.get(line.itemId);
    // The handoff falls back to normalizedName when recipe wording is absent.
    // Also check saved text so manual/product modifiers are not lost there.
    return source?.recipeIngredientText || source?.text || line.originalIngredient;
  };

  if (lines.some((line) => resolveGroceryChoice({
    normalizedName: line.shoppingName,
    grocerySearchName: line.searchCandidate,
    recipeIngredientText: original(line),
  }).status !== "ready")) {
    return { canonicalIngredientId: null, status: "needs-review", reason: "unresolved-choice" };
  }

  const evidence = lines.flatMap((line) => [
    line.shoppingName,
    line.searchCandidate,
    // Use nameText, not normalizedName: the latter removes product descriptors.
    parseIngredientLine(line.originalIngredient).nameText,
    parseIngredientLine(original(line)).nameText,
  ]).filter((value) => value.trim());
  const matches = evidence.map(findCanonicalIngredient);
  const ids = new Set(matches.flatMap((match) => match ? [match.id] : []));

  if (ids.size > 1) {
    return { canonicalIngredientId: null, status: "needs-review", reason: "registry-disagreement" };
  }
  if (ids.size === 0) {
    return { canonicalIngredientId: null, status: "unmapped", reason: "registry-miss" };
  }
  if (matches.some((match) => !match)) {
    return { canonicalIngredientId: null, status: "needs-review", reason: "unverified-product-wording" };
  }
  return {
    canonicalIngredientId: [...ids][0],
    status: "matched",
    reason: "registry-agreement",
  };
}
