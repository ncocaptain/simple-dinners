import type {
  GroceryRequirementGroup,
  GrocerySearchOnlyRequirement,
} from "./groceryRequirementSummary";

export type RetailerRequirementStatus =
  | "search-ready"
  | "package-match-needed";

export type RetailerRequirementMode =
  | "weight"
  | "exact-package"
  | "individual-count"
  | "package-count"
  | "recipe-volume";

export type GroceryRetailerMatch = {
  requirement: GroceryRequirementGroup;
  status: RetailerRequirementStatus;
  mode: RetailerRequirementMode;
  searchName: string;
  purchaseTarget: string;
  reason: string;
  canAutoAddToCart: false;
};

const normalized = (value: string) =>
  String(value || "").toLowerCase().replace(/\s+/g, " ").trim();

const INDIVIDUAL_COUNT_PRODUCTS = new Set([
  "ripe bananas",
  "banana",
  "bananas",
  "tomato",
  "tomatoes",
]);

const PACKAGE_DEPENDENT_COUNTS = new Set([
  "graham cracker sheets",
  "ready-to-eat vanilla pudding snack cups",
  "ready-to-eat chocolate pudding snack cups",
  "vanilla wafer cookies",
  "chocolate sandwich cookies",
  "gummy worms",
]);

const PACKAGE_UNITS = new Set([
  "can",
  "package",
  "packet",
  "box",
  "jar",
  "carton",
  "bag",
  "block",
]);

const VOLUME_UNITS = new Set([
  "cup",
  "Tbsp",
  "tsp",
  "ml",
  "l",
]);

function friendlyNumber(value: number) {
  if (Number.isInteger(value)) return String(value);
  return String(Math.round(value * 100) / 100);
}

function pluralUnit(unit: string, quantity: number) {
  if (quantity === 1) return unit;

  const plurals: Record<string, string> = {
    can: "cans",
    package: "packages",
    packet: "packets",
    box: "boxes",
    jar: "jars",
    carton: "cartons",
    bag: "bags",
    block: "blocks",
  };

  return plurals[unit] ?? unit;
}

export function assessRetailerRequirement(
  requirement: GroceryRequirementGroup
): GroceryRetailerMatch {
  const name = normalized(requirement.shoppingName);
  const quantity = friendlyNumber(requirement.quantity);
  const unit = requirement.unit;
  const searchName =
    requirement.searchCandidate.trim() ||
    requirement.shoppingName.trim();

  if (unit === "lb" || unit === "oz") {
    return {
      requirement,
      status: "search-ready",
      mode: "weight",
      searchName,
      purchaseTarget: `${quantity} ${unit}`,
      reason:
        "The recipe already provides a weight target. The retailer still chooses the actual sellable item.",
      canAutoAddToCart: false,
    };
  }

  if (
    requirement.packageSize &&
    PACKAGE_UNITS.has(unit)
  ) {
    return {
      requirement,
      status: "search-ready",
      mode: "exact-package",
      searchName,
      purchaseTarget:
        `${quantity} ${pluralUnit(unit, requirement.quantity)} · ${requirement.packageSize}`,
      reason:
        "The recipe provides both a package unit and package size, so the retailer search can target that size.",
      canAutoAddToCart: false,
    };
  }

  if (unit === "count") {
    if (INDIVIDUAL_COUNT_PRODUCTS.has(name)) {
      return {
        requirement,
        status: "search-ready",
        mode: "individual-count",
        searchName,
        purchaseTarget: `${quantity} individual`,
        reason:
          "This product is commonly selectable as individual produce. Availability still depends on the retailer.",
        canAutoAddToCart: false,
      };
    }

    return {
      requirement,
      status: "package-match-needed",
      mode: "package-count",
      searchName,
      purchaseTarget: `${quantity} needed`,
      reason: PACKAGE_DEPENDENT_COUNTS.has(name)
        ? "The recipe count is known, but the store may sell this product only in a package or multipack."
        : "The recipe count is known, but the retailer package quantity has not been verified.",
      canAutoAddToCart: false,
    };
  }

  if (PACKAGE_UNITS.has(unit)) {
    return {
      requirement,
      status: "search-ready",
      mode: "exact-package",
      searchName,
      purchaseTarget:
        `${quantity} ${pluralUnit(unit, requirement.quantity)}`,
      reason:
        "The recipe identifies the package unit. The retailer still needs to match an actual product.",
      canAutoAddToCart: false,
    };
  }

  if (VOLUME_UNITS.has(unit)) {
    return {
      requirement,
      status: "package-match-needed",
      mode: "recipe-volume",
      searchName,
      purchaseTarget: `${quantity} ${unit} required`,
      reason:
        "Recipe volume cannot safely determine a store package size without retailer product data.",
      canAutoAddToCart: false,
    };
  }

  return {
    requirement,
    status: "package-match-needed",
    mode: "recipe-volume",
    searchName,
    purchaseTarget: `${quantity} ${unit}`.trim(),
    reason:
      "A retailer-specific package or selling unit is still required.",
    canAutoAddToCart: false,
  };
}

export function assessRetailerSearchOnlyRequirement(
  requirement: GrocerySearchOnlyRequirement
) {
  return {
    requirement,
    status: "search-only" as const,
    mode: "quantity-unspecified" as const,
    searchName:
      requirement.searchCandidate.trim() ||
      requirement.shoppingName.trim(),
    purchaseTarget: "Quantity not specified",
    reason:
      "The recipe names the grocery but does not specify an amount. Product search is safe, but package quantity must be chosen by the shopper.",
    canAutoAddToCart: false as const,
  };
}

export function buildRetailerMatchPreview(
  requirements: readonly GroceryRequirementGroup[]
) {
  const items = requirements.map(assessRetailerRequirement);

  return {
    items,
    searchReady: items.filter(
      (item) => item.status === "search-ready"
    ).length,
    packageMatchNeeded: items.filter(
      (item) => item.status === "package-match-needed"
    ).length,
    canAutoAddToCart: false as const,
  };
}
