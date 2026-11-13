import type { ShoppingItem } from "../shoppingList";
import type { GroceryHandoffLine } from "../fulfillment/groceryHandoff";
import type {
  CombinedGrocerySnapshot,
  GroceryHandoffHold,
} from "../fulfillment/groceryHandoffFromShopping";
import type { GroceryRequirementReview } from "../fulfillment/groceryRequirementSummary";

export type DeepReadonly<T> = T extends readonly (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

/** Already-calculated Shopping List decisions, not Pantry inventory to rematch. */
export type ShoppingSnapshotInput = {
  readonly rawItems: readonly Readonly<ShoppingItem>[];
  readonly combinedRows: readonly DeepReadonly<CombinedGrocerySnapshot>[];
  readonly pantryBuyAnywayIds: ReadonlySet<string>;
};

export type IngredientIdentity = DeepReadonly<{
  canonicalIngredientId: string | null;
  status: "matched" | "unmapped" | "needs-review";
  reason:
    | "registry-agreement"
    | "registry-miss"
    | "registry-disagreement"
    | "unverified-product-wording"
    | "unresolved-choice";
}>;

/** Amounts come only from the handoff/summary, never registry package defaults. */
export type ShoppingNeed = DeepReadonly<{
  id: string; // Snapshot-local, not a persisted ShoppingItem ID.
  sourceIds: string[];
  shoppingName: string;
  searchName: string;
  originalIngredients: string[];
  identity: IngredientIdentity;
  // Requirement readiness only; identity may independently need review.
  state: "measured" | "search-only" | "needs-review";
  requirement: {
    quantity: number | null;
    unit: string;
    packageSize: string;
  };
  reviewReason: GroceryRequirementReview["reason"] | "quantity-unspecified" | null;
  // Keep choice options, source recipe, exact per-line amounts and readiness.
  lines: GroceryHandoffLine[];
}>;

export type ShoppingPurchaseSnapshot = DeepReadonly<{
  version: 1;
  identityVersion: 1;
  /** Deterministic local equality token; contains source data, NOT anonymized. */
  signature: string;
  rawItems: ShoppingItem[];
  combinedRows: CombinedGrocerySnapshot[];
  pantryBuyAnywayIds: string[];
  needs: ShoppingNeed[];
  holds: GroceryHandoffHold[];
  excludedCheckedRows: number;
  excludedCoveredRows: number;
  excludedCheckedSources: number;
}>;
