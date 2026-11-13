import { buildShoppingPurchaseSnapshot } from "./shoppingSnapshot";
import { compareStoreBaskets } from "./basketComparison";
import { compareNeedPrices } from "./savings";
import type {
  DeepReadonly, ShoppingSnapshotInput, ShoppingPurchaseSnapshot, ProductOffer,
  ContentBasis, PackageSize, NeedComparisonTarget, StorePriceSet,
} from "./types";

/** Navigation payload only; deliberately omits raw rows and the private signature. */
export type DealsRouteSnapshot = Pick<ShoppingPurchaseSnapshot,
  "version" | "needs" | "excludedCheckedRows" | "excludedCheckedSources" | "excludedCoveredRows"
> & { readonly holds: readonly (ShoppingPurchaseSnapshot["holds"][number] & { readonly shoppingName: string })[] };

export function createDealsRouteSnapshot(input: ShoppingSnapshotInput): DealsRouteSnapshot {
  const snapshot = buildShoppingPurchaseSnapshot(input);
  return {
    version: snapshot.version, needs: snapshot.needs,
    excludedCheckedRows: snapshot.excludedCheckedRows,
    excludedCheckedSources: snapshot.excludedCheckedSources,
    excludedCoveredRows: snapshot.excludedCoveredRows,
    holds: snapshot.holds.map((hold) => ({ ...hold, shoppingName: [...new Set(input.rawItems
      .filter((item) => hold.sourceIds.includes(item.id))
      .map((item) => item.normalizedName || item.text))].join(", ") })),
  };
}

export type MatchDecisions = Readonly<Record<string, "accepted" | "rejected">>;
export type FixtureScenario = "standard" | "stale" | "inapplicable";
export const FIXTURE_NOW = Date.UTC(2026, 10, 13, 15);
export const FIXTURE_STORES = ["sample-a", "sample-b"] as const;

type CatalogItem = { canonicalId: string; basis: ContentBasis; small: PackageSize; large: PackageSize };
const weight = (quantity: number, unit = "oz"): PackageSize => ({ kind: "single", basis: "net", size: { quantity, unit } });
// Explicit synthetic product specifications, NOT inferred from recipe/registry defaults.
const CATALOG: readonly CatalogItem[] = [
  { canonicalId: "chicken-breast", basis: "net", small: weight(12), large: weight(24) },
  { canonicalId: "rice", basis: "net", small: weight(16), large: weight(32) },
  { canonicalId: "milk", basis: "net", small: weight(500, "ml"), large: weight(1000, "ml") },
  { canonicalId: "black-beans", basis: "net", small: weight(15), large: weight(30) },
  { canonicalId: "egg", basis: "count", small: { kind: "single", basis: "count", size: { quantity: 6, unit: "each" } },
    large: { kind: "single", basis: "count", size: { quantity: 12, unit: "each" } } },
];
export type FixtureProduct = Readonly<{ offer: ProductOffer; variant: "small" | "large" | "unknown" | "mismatch" }>;

export function buildFixturePreview(
  snapshot: DealsRouteSnapshot,
  decisions: MatchDecisions,
  selectedStoreIds: readonly string[],
  scenario: FixtureScenario,
) {
  const targets: NeedComparisonTarget[] = snapshot.needs.map((need) => ({
    need, productFormKey: need.identity.canonicalIngredientId || "",
    requirementBasis: CATALOG.find((entry) => entry.canonicalId === need.identity.canonicalIngredientId)?.basis ?? "unknown",
  }));
  const products: FixtureProduct[] = [];
  for (const target of targets) {
    const entry = CATALOG.find((item) => item.canonicalId === target.need.identity.canonicalIngredientId);
    if (!entry || target.need.identity.status !== "matched" || target.need.state === "needs-review") continue;
    for (const storeId of FIXTURE_STORES.filter((id) => selectedStoreIds.includes(id))) {
      for (const variant of ["small", "large", "unknown", "mismatch"] as const) {
        const id = `${target.need.id}:${storeId}:${variant}`;
        const amount = (variant === "large" ? 350 : variant === "unknown" ? 100 : 200) + (storeId === "sample-b" ? 50 : 0);
        const mismatch = variant === "mismatch";
        products.push({ variant, offer: {
          id, productId: `${entry.canonicalId}:${variant}`, needId: target.need.id,
          productFormKey: mismatch ? `different-form:${entry.canonicalId}` : entry.canonicalId,
          compatibility: mismatch ? "mismatch" : decisions[id] === "rejected" ? "unverified"
            : decisions[id] === "accepted" || variant !== "unknown" ? "verified" : "unverified",
          packageSize: variant === "large" ? entry.large : variant === "unknown"
            ? { kind: "single", basis: entry.basis, size: null } : entry.small,
          price: {
            productId: `${entry.canonicalId}:${variant}`, retailerId: storeId, storeId: scenario === "inapplicable" ? "other-store" : storeId,
            channel: "in-store", regularPrice: { amountMinor: amount + (variant === "small" ? 50 : 0), currency: "USD" },
            salePrice: variant === "small" ? { amountMinor: amount, currency: "USD" } : null,
            sellingBasis: { kind: "package" }, conditions: [], availability: "in-stock",
            observedAt: FIXTURE_NOW - 1000, expiresAt: scenario === "stale" ? FIXTURE_NOW - 1 : FIXTURE_NOW + 60000,
          },
        } });
      }
    }
  }
  const stores: StorePriceSet[] = FIXTURE_STORES.filter((id) => selectedStoreIds.includes(id)).map((storeId) => ({
    retailerId: storeId, storeId, channel: "in-store", offers: products.filter((product) => product.offer.price.retailerId === storeId).map((product) => product.offer),
  }));
  const comparisons = targets.map((target) => ({ target, stores: stores.map((store) => ({
    storeId: store.storeId,
    result: compareNeedPrices(target, store.offers.filter((offer) => offer.needId === target.need.id), {
      retailerId: store.retailerId, storeId: store.storeId, channel: store.channel, currency: "USD", now: FIXTURE_NOW,
    }),
  })) }));
  return { products, comparisons, basket: compareStoreBaskets(targets, stores, { currency: "USD", now: FIXTURE_NOW },
    snapshot.holds.map((_, index) => `hold:${index}`)) };
}

// Router history state is optional (direct navigation) and not a persistence API.
export function readDealsRouteSnapshot(state: unknown): DealsRouteSnapshot | null {
  const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object";
  const strings = (value: unknown): boolean => Array.isArray(value) && value.every((entry) => typeof entry === "string");
  if (!object(state) || !object(state.dealsSnapshot)) return null;
  const value = state.dealsSnapshot;
  if (value.version !== 1 || !Array.isArray(value.needs) || !Array.isArray(value.holds) ||
      ![value.excludedCheckedRows, value.excludedCheckedSources, value.excludedCoveredRows]
        .every((count) => Number.isSafeInteger(count) && Number(count) >= 0)) return null;
  if (!value.needs.every((need: unknown) => object(need) && typeof need.id === "string" &&
      typeof need.shoppingName === "string" && typeof need.searchName === "string" && strings(need.sourceIds) && strings(need.originalIngredients) &&
      ["measured", "search-only", "needs-review"].includes(String(need.state)) && object(need.identity) &&
      ["matched", "unmapped", "needs-review"].includes(String(need.identity.status)) &&
      (need.identity.canonicalIngredientId === null || typeof need.identity.canonicalIngredientId === "string") &&
      object(need.requirement) && (need.requirement.quantity === null || (typeof need.requirement.quantity === "number" && Number.isFinite(need.requirement.quantity))) &&
      typeof need.requirement.unit === "string" && typeof need.requirement.packageSize === "string" &&
      Array.isArray(need.lines) && need.lines.every((line: unknown) => object(line) && typeof line.status === "string"))) return null;
  if (!value.holds.every((hold: unknown) => object(hold) && typeof hold.rowId === "string" && typeof hold.shoppingName === "string" && strings(hold.sourceIds) &&
      ["partial-pantry", "missing-source", "duplicate-source"].includes(String(hold.reason)))) return null;
  return value as DeepReadonly<DealsRouteSnapshot>;
}
