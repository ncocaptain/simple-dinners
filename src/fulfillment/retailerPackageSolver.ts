import type { GroceryRequirementGroup } from "./groceryRequirementSummary";

export type RetailerPackageCandidate = {
  id: string;
  productName: string;
  packageQuantity: number;
  packageUnit: string;
  packageCount?: number;
};

export type RetailerPackageSolution = {
  candidate: RetailerPackageCandidate;
  packagesNeeded: number;
  requirementInCandidateUnits: number;
  totalAvailable: number;
  excess: number;
  canAutoAddToCart: false;
};

type Dimension = "volume" | "weight" | "count";

const normalizedUnit = (value: string) =>
  String(value || "").trim().toLowerCase();

function unitDimension(unit: string): Dimension | null {
  const value = normalizedUnit(unit);

  if (
    [
      "cup",
      "cups",
      "tbsp",
      "tablespoon",
      "tablespoons",
      "tsp",
      "teaspoon",
      "teaspoons",
      "ml",
      "milliliter",
      "milliliters",
      "l",
      "liter",
      "liters",
      "fl oz",
      "fluid ounce",
      "fluid ounces",
    ].includes(value)
  ) {
    return "volume";
  }

  if (
    [
      "oz",
      "ounce",
      "ounces",
      "lb",
      "lbs",
      "pound",
      "pounds",
      "g",
      "gram",
      "grams",
      "kg",
      "kilogram",
      "kilograms",
    ].includes(value)
  ) {
    return "weight";
  }

  if (
    [
      "count",
      "each",
      "ea",
      "piece",
      "pieces",
      "ear",
      "ears",
    ].includes(value)
  ) {
    return "count";
  }

  return null;
}

function toBase(quantity: number, unit: string): number | null {
  const value = normalizedUnit(unit);
  const dimension = unitDimension(value);

  if (!Number.isFinite(quantity) || quantity <= 0 || !dimension) {
    return null;
  }

  if (dimension === "volume") {
    const mlPerUnit: Record<string, number> = {
      cup: 236.588,
      cups: 236.588,
      tbsp: 14.7868,
      tablespoon: 14.7868,
      tablespoons: 14.7868,
      tsp: 4.92892,
      teaspoon: 4.92892,
      teaspoons: 4.92892,
      ml: 1,
      milliliter: 1,
      milliliters: 1,
      l: 1000,
      liter: 1000,
      liters: 1000,
      "fl oz": 29.5735,
      "fluid ounce": 29.5735,
      "fluid ounces": 29.5735,
    };

    return quantity * mlPerUnit[value];
  }

  if (dimension === "weight") {
    const gramsPerUnit: Record<string, number> = {
      oz: 28.3495,
      ounce: 28.3495,
      ounces: 28.3495,
      lb: 453.592,
      lbs: 453.592,
      pound: 453.592,
      pounds: 453.592,
      g: 1,
      gram: 1,
      grams: 1,
      kg: 1000,
      kilogram: 1000,
      kilograms: 1000,
    };

    return quantity * gramsPerUnit[value];
  }

  return quantity;
}

export function solveRetailerPackageCandidate(
  requirement: GroceryRequirementGroup,
  candidate: RetailerPackageCandidate
): RetailerPackageSolution | null {
  const requirementDimension =
    unitDimension(requirement.unit);
  const candidateDimension =
    unitDimension(candidate.packageUnit);

  if (
    !requirementDimension ||
    !candidateDimension ||
    requirementDimension !== candidateDimension
  ) {
    return null;
  }

  const requiredBase = toBase(
    requirement.quantity,
    requirement.unit
  );
  const packageBase = toBase(
    candidate.packageQuantity,
    candidate.packageUnit
  );

  if (
    requiredBase === null ||
    packageBase === null ||
    packageBase <= 0
  ) {
    return null;
  }

  const unitsPerRetailPackage =
    candidate.packageCount &&
    candidate.packageCount > 0
      ? candidate.packageCount
      : 1;

  const availablePerPackage =
    packageBase * unitsPerRetailPackage;

  const packagesNeeded = Math.max(
    1,
    Math.ceil(
      (requiredBase - 1e-9) /
        availablePerPackage
    )
  );

  const totalAvailable =
    availablePerPackage * packagesNeeded;

  return {
    candidate,
    packagesNeeded,
    requirementInCandidateUnits:
      requiredBase / packageBase,
    totalAvailable,
    excess: Math.max(
      0,
      totalAvailable - requiredBase
    ),
    canAutoAddToCart: false,
  };
}

export function rankRetailerPackageCandidates(
  requirement: GroceryRequirementGroup,
  candidates: readonly RetailerPackageCandidate[]
) {
  return candidates
    .map((candidate) =>
      solveRetailerPackageCandidate(
        requirement,
        candidate
      )
    )
    .filter(
      (
        result
      ): result is RetailerPackageSolution =>
        Boolean(result)
    )
    .sort(
      (first, second) =>
        first.packagesNeeded -
          second.packagesNeeded ||
        first.excess - second.excess ||
        first.candidate.productName.localeCompare(
          second.candidate.productName
        )
    );
}
