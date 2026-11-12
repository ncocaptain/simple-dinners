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
