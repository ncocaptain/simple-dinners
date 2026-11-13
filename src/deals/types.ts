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

// Phase 2: pure comparison contracts. No transport, persistence or provider SDKs.
export type Money = Readonly<{ amountMinor: number; currency: string }>;
export type Measure = Readonly<{ quantity: number; unit: string }>;
export type NormalizedMeasure = Readonly<{ quantity: number; unit: "g" | "ml" | "each" }>;
export type ContentBasis = "net" | "drained" | "count" | "unknown";
export type PackageSize = Readonly<{
  basis: ContentBasis;
} & (
  | { kind: "single"; size: Measure | null }
  | { kind: "multipack"; packCount: number | null; innerSize: Measure | null }
  | { kind: "variable-weight" }
)>;
export type PriceCondition = Readonly<
  | { kind: "membership" | "coupon"; eligibility: "eligible" | "ineligible" | "unknown" }
  | { kind: "minimum-quantity"; packages: number }
  | { kind: "unsupported-promotion"; description: string }
>;
/** Both price fields share exactly this product/store/channel/selling basis. */
export type PriceObservation = Readonly<{
  productId: string;
  retailerId: string;
  storeId: string;
  channel: "in-store" | "pickup" | "delivery";
  regularPrice: Money | null;
  salePrice: Money | null;
  sellingBasis: Readonly<{ kind: "package" } | { kind: "measure"; measure: Measure }>;
  // Conditions apply to salePrice; unresolved/unsupported offers are suppressed.
  conditions: readonly PriceCondition[];
  observedAt: number;
  expiresAt: number;
  availability: "in-stock" | "out-of-stock" | "unknown";
}>;
export type PriceContext = Readonly<{
  retailerId: string;
  storeId: string;
  channel: PriceObservation["channel"];
  currency: string;
  now: number;
}>;
/** Caller-supplied verified equivalence class, NOT derived from convertible units. */
export type ProductOffer = Readonly<{
  id: string;
  productId: string;
  needId: string;
  productFormKey: string;
  compatibility: "verified" | "unverified" | "mismatch";
  packageSize: PackageSize;
  price: PriceObservation;
}>;
export type NeedComparisonTarget = Readonly<{
  need: ShoppingNeed;
  productFormKey: string;
  requirementBasis: ContentBasis;
}>;
export type SuppressionReason =
  | "invalid-measure" | "unsupported-unit" | "unknown-package"
  | "variable-weight" | "basis-mismatch" | "dimension-mismatch"
  | "product-mismatch" | "unverified-product" | "need-review"
  | "unspecified-quantity" | "unsupported-requirement"
  | "invalid-money" | "missing-price" | "currency-mismatch"
  | "inapplicable-price" | "stale-price" | "unavailable"
  | "unresolved-condition" | "ineligible-condition" | "minimum-quantity"
  | "unsupported-promotion" | "missing-regular-price" | "no-positive-savings"
  | "numeric-overflow" | "incomplete-basket" | "invalid-basket";
export type Calculation<T> = Readonly<
  { value: T; reason?: never } | { value: null; reason: SuppressionReason }
>;
/** Rational unit price: integer money per known measure, never rounded for ranking. */
export type UnitPrice = Readonly<{ money: Money; per: NormalizedMeasure }>;
export type RequirementCost = Readonly<{
  packagesNeeded: number;
  minimumPackagesNeeded: number;
  promotionExtraPackages: number;
  purchaseCost: Money;
  required: NormalizedMeasure;
  supplied: NormalizedMeasure;
  excess: NormalizedMeasure;
}>;
export type OfferComparison = Readonly<{
  offerId: string;
  packagePrice: Calculation<Money>;
  unitPrice: Calculation<UnitPrice>;
  requirementCost: Calculation<RequirementCost>;
}>;
export type BestPriceResult = Readonly<{
  offers: readonly OfferComparison[];
  lowestPackagePriceOfferIds: readonly string[];
  lowestUnitPriceOfferIds: readonly string[];
  unitPriceSuppression: "dimension-mismatch" | null;
  lowestRequirementCostOfferIds: readonly string[];
}>;
export type StorePriceSet = Readonly<{
  retailerId: string;
  storeId: string;
  channel: PriceObservation["channel"];
  offers: readonly ProductOffer[];
}>;
export type StoreBasketResult = Readonly<{
  retailerId: string;
  storeId: string;
  channel: PriceObservation["channel"];
  merchandiseSubtotal: Money | null;
  totalSuppression: SuppressionReason | null;
  complete: boolean;
  pricedItemCount: number;
  totalItemCount: number;
  missingNeedIds: readonly string[];
  selections: readonly Readonly<{ needId: string; offerIds: readonly string[]; cost: Money }>[];
}>;
export type BasketComparison = Readonly<{
  stores: readonly StoreBasketResult[];
  cheapestCompleteStores: readonly Readonly<{
    retailerId: string; storeId: string; channel: PriceObservation["channel"];
  }>[];
  winnerSuppression: "incomplete-basket" | "invalid-basket" | null;
}>;
