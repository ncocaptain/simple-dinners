import type { GroceryRequirementGroup } from "./groceryRequirementSummary";
import type { KrogerProduct } from "./krogerCatalog";
import type { RetailerPackageSolution } from "./retailerPackageSolver";

export type KrogerCartSelectionMode =
  | "calculated-package-match"
  | "manual-package-choice";

export type KrogerCartSelection = {
  requirementKey: string;
  shoppingName: string;
  productId: string;
  upc: string;
  description: string;
  size: string;
  quantity: number;
  selectionMode: KrogerCartSelectionMode;
  canAutoAddToCart: false;
};

export function groceryRequirementKey(
  requirement: GroceryRequirementGroup
) {
  const sourceIds = requirement.sourceLines
    .map((line) => line.itemId)
    .sort()
    .join(",");

  return JSON.stringify([
    requirement.searchCandidate
      .toLowerCase()
      .trim(),
    requirement.shoppingName
      .toLowerCase()
      .trim(),
    requirement.quantity,
    requirement.unit
      .toLowerCase()
      .trim(),
    requirement.packageSize
      .toLowerCase()
      .trim(),
    sourceIds,
  ]);
}

function productForSolution(
  solution: RetailerPackageSolution,
  products: readonly KrogerProduct[]
) {
  return products.find(
    (product) =>
      product.productId ===
      solution.candidate.id
  );
}

export function buildCalculatedKrogerCartSelection(
  requirement: GroceryRequirementGroup,
  solution: RetailerPackageSolution,
  products: readonly KrogerProduct[]
): KrogerCartSelection | null {
  const product = productForSolution(
    solution,
    products
  );

  if (
    !product ||
    !product.productId ||
    !product.upc ||
    solution.packagesNeeded < 1
  ) {
    return null;
  }

  return {
    requirementKey:
      groceryRequirementKey(requirement),
    shoppingName:
      requirement.shoppingName,
    productId: product.productId,
    upc: product.upc,
    description: product.description,
    size: product.size,
    quantity: solution.packagesNeeded,
    selectionMode:
      "calculated-package-match",
    canAutoAddToCart: false,
  };
}

export function buildManualKrogerCartSelection(
  requirement: GroceryRequirementGroup,
  product: KrogerProduct
): KrogerCartSelection | null {
  if (
    !product.productId ||
    !product.upc
  ) {
    return null;
  }

  return {
    requirementKey:
      groceryRequirementKey(requirement),
    shoppingName:
      requirement.shoppingName,
    productId: product.productId,
    upc: product.upc,
    description: product.description,
    size: product.size,
    quantity: 1,
    selectionMode:
      "manual-package-choice",
    canAutoAddToCart: false,
  };
}

export function buildKrogerCartPreview(
  selections: readonly KrogerCartSelection[]
) {
  return {
    provider: "kroger" as const,
    items: selections.map((selection) => ({
      upc: selection.upc,
      quantity: selection.quantity,
    })),
    selectionCount: selections.length,
    canSubmitToCart: false as const,
  };
}
