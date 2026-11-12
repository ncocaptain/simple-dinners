import type {
  GroceryRequirementGroup,
  GrocerySearchOnlyRequirement,
} from "./groceryRequirementSummary";

export type WalmartSearchIntent = {
  key: string;
  shoppingName: string;
  searchCandidate: string;
  quantity: number | null;
  unit: string | null;
  packageSize: string;
  source:
    | "measured"
    | "search-only";
};

export type WalmartHandoffItem = {
  productId: string;
  quantity: number;
  addToCartUrl?: string;
};

export type WalmartHandoffResult = {
  url: string;
  itemCount: number;
};

/**
 * Converts the retailer-neutral grocery preview into Walmart search intents.
 *
 * This does not call Walmart, use affiliate links, assume partner access,
 * or mutate the user's shopping list.
 */
export function buildWalmartSearchIntents(
  requirements:
    readonly GroceryRequirementGroup[],
  searchOnly:
    readonly GrocerySearchOnlyRequirement[],
): WalmartSearchIntent[] {
  const measured =
    requirements.map(
      (requirement, index) => ({
        key:
          `measured-${index}-${requirement.searchCandidate}`,
        shoppingName:
          requirement.shoppingName,
        searchCandidate:
          requirement.searchCandidate,
        quantity:
          requirement.quantity,
        unit:
          requirement.unit,
        packageSize:
          requirement.packageSize,
        source:
          "measured" as const,
      }),
    );

  const unmeasured =
    searchOnly.map(
      (requirement) => ({
        key:
          `search-${requirement.itemId}`,
        shoppingName:
          requirement.shoppingName,
        searchCandidate:
          requirement.searchCandidate,
        quantity: null,
        unit: null,
        packageSize: "",
        source:
          "search-only" as const,
      }),
    );

  return [
    ...measured,
    ...unmeasured,
  ];
}

/**
 * Placeholder seam for a future approved/public Walmart handoff method.
 * Keep this intentionally unimplemented until we have a compliant URL
 * format or third-party provider contract to target.
 */
export function buildWalmartCartHandoff(
  _items: readonly WalmartHandoffItem[],
): WalmartHandoffResult | null {
  return null;
}
