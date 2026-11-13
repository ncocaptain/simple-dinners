import { solveRetailerPackageCandidate } from "../fulfillment/retailerPackageSolver";
import { assessRetailerRequirement } from "../fulfillment/groceryRetailerMatch";
import type {
  Calculation, ContentBasis, Measure, NeedComparisonTarget,
  NormalizedMeasure, PackageSize,
} from "./types";

// US customary volume; exact definitions avoid the rounded conversion factors
// in the fulfillment solver. The solver is reused AFTER normalization below.
const UNITS: Record<string, readonly [NormalizedMeasure["unit"], number]> = {};
for (const [names, unit, factor] of [
  [["g", "gram", "grams"], "g", 1],
  [["kg", "kilogram", "kilograms"], "g", 1000],
  [["oz", "ounce", "ounces"], "g", 28.349523125],
  [["lb", "lbs", "pound", "pounds"], "g", 453.59237],
  [["ml", "milliliter", "milliliters"], "ml", 1],
  [["l", "liter", "liters"], "ml", 1000],
  [["fl oz", "fluid ounce", "fluid ounces"], "ml", 29.5735295625],
  [["cup", "cups"], "ml", 236.5882365],
  [["tbsp", "tablespoon", "tablespoons"], "ml", 14.78676478125],
  [["tsp", "teaspoon", "teaspoons"], "ml", 4.92892159375],
  [["count", "each", "ea", "piece", "pieces", "ear", "ears"], "each", 1],
] as const) {
  for (const name of names) UNITS[name] = [unit, factor];
}

export function normalizeMeasure(measure: Measure): Calculation<NormalizedMeasure> {
  if (!Number.isFinite(measure.quantity) || measure.quantity <= 0) {
    return { value: null, reason: "invalid-measure" };
  }
  const key = measure.unit.trim().toLowerCase().replace(/\s+/g, " ");
  const conversion = Object.hasOwn(UNITS, key) ? UNITS[key] : undefined;
  if (!conversion) return { value: null, reason: "unsupported-unit" };
  const quantity = measure.quantity * conversion[1];
  if (!Number.isFinite(quantity) || quantity > Number.MAX_SAFE_INTEGER || quantity <= 0) {
    return { value: null, reason: "numeric-overflow" };
  }
  return { value: { quantity, unit: conversion[0] } };
}

export function usablePackageContents(size: PackageSize): Calculation<NormalizedMeasure> {
  if (size.kind === "variable-weight") return { value: null, reason: "variable-weight" };
  if (size.basis === "unknown") return { value: null, reason: "unknown-package" };
  const measure = size.kind === "single" ? size.size : size.innerSize;
  if (!measure) return { value: null, reason: "unknown-package" };
  const normalized = normalizeMeasure(measure);
  if (!normalized.value) return normalized;
  if (normalized.value.unit === "each" && !Number.isSafeInteger(normalized.value.quantity)) {
    return { value: null, reason: "invalid-measure" };
  }
  if ((size.basis === "count") !== (normalized.value.unit === "each")) {
    return { value: null, reason: "basis-mismatch" };
  }
  const count = size.kind === "single" ? 1 : size.packCount;
  if (count === null || !Number.isSafeInteger(count) || count <= 0) {
    return { value: null, reason: "unknown-package" };
  }
  const quantity = normalized.value.quantity * count;
  if (!Number.isFinite(quantity) || quantity > Number.MAX_SAFE_INTEGER) {
    return { value: null, reason: "numeric-overflow" };
  }
  return { value: { quantity, unit: normalized.value.unit } };
}

export function comparePackages(
  left: Readonly<{ productFormKey: string; packageSize: PackageSize }>,
  right: Readonly<{ productFormKey: string; packageSize: PackageSize }>,
): Calculation<Readonly<{ left: NormalizedMeasure; right: NormalizedMeasure }>> {
  if (!left.productFormKey || left.productFormKey !== right.productFormKey) {
    return { value: null, reason: "product-mismatch" };
  }
  if (left.packageSize.basis !== right.packageSize.basis) {
    return { value: null, reason: "basis-mismatch" };
  }
  const a = usablePackageContents(left.packageSize);
  if (!a.value) return a;
  const b = usablePackageContents(right.packageSize);
  if (!b.value) return b;
  if (a.value.unit !== b.value.unit) return { value: null, reason: "dimension-mismatch" };
  return { value: { left: a.value, right: b.value } };
}

export function normalizeRequirement(target: NeedComparisonTarget): Calculation<NormalizedMeasure> {
  const { need } = target;
  if (need.state === "needs-review") return { value: null, reason: "need-review" };
  if (need.state === "search-only" || need.requirement.quantity === null) {
    return { value: null, reason: "unspecified-quantity" };
  }
  const requirement = {
    shoppingName: need.shoppingName,
    searchCandidate: need.searchName,
    quantity: need.requirement.quantity,
    unit: need.requirement.unit,
    packageSize: need.requirement.packageSize,
    sourceLines: [],
    canAutoAddToCart: false as const,
  };
  const assessment = assessRetailerRequirement(requirement);
  if (assessment.mode === "exact-package") {
    // Only an explicitly supplied size, never a registry/package default.
    const parsed = requirement.packageSize.trim().match(/^(\d+(?:\.\d+)?)\s*([a-z ]+)$/i);
    if (!parsed) return { value: null, reason: "unsupported-requirement" };
    return normalizeMeasure({ quantity: Number(parsed[1]) * requirement.quantity, unit: parsed[2] });
  }
  return normalizeMeasure({ quantity: requirement.quantity, unit: requirement.unit });
}

export function packageCoverage(
  target: NeedComparisonTarget,
  size: PackageSize,
  minimumPackages = 1,
): Calculation<Readonly<{
  packagesNeeded: number; required: NormalizedMeasure;
  supplied: NormalizedMeasure; excess: NormalizedMeasure;
}>> {
  if (!Number.isSafeInteger(minimumPackages) || minimumPackages < 1) {
    return { value: null, reason: "invalid-measure" };
  }
  const required = normalizeRequirement(target);
  if (!required.value) return required;
  if (target.requirementBasis === "unknown" || target.requirementBasis !== size.basis) {
    return { value: null, reason: "basis-mismatch" };
  }
  const contents = usablePackageContents(size);
  if (!contents.value) return contents;
  if (required.value.unit !== contents.value.unit) {
    return { value: null, reason: "dimension-mismatch" };
  }
  const unit = required.value.unit === "each" ? "count" : required.value.unit;
  const solution = solveRetailerPackageCandidate({
    shoppingName: target.need.shoppingName, searchCandidate: target.need.searchName,
    quantity: required.value.quantity, unit, packageSize: "", sourceLines: [], canAutoAddToCart: false,
  }, {
    id: "comparison", productName: target.need.shoppingName,
    packageQuantity: contents.value.quantity, packageUnit: unit,
  });
  if (!solution || !Number.isSafeInteger(solution.packagesNeeded) ||
      !Number.isFinite(solution.totalAvailable) || solution.totalAvailable > Number.MAX_SAFE_INTEGER ||
      solution.totalAvailable < required.value.quantity - 1e-9) {
    return { value: null, reason: "numeric-overflow" };
  }
  const packagesNeeded = Math.max(solution.packagesNeeded, minimumPackages);
  const supplied = contents.value.quantity * packagesNeeded;
  if (!Number.isFinite(supplied) || supplied > Number.MAX_SAFE_INTEGER) {
    return { value: null, reason: "numeric-overflow" };
  }
  return { value: {
    packagesNeeded,
    required: required.value,
    supplied: { quantity: supplied, unit: required.value.unit },
    excess: { quantity: Math.max(0, supplied - required.value.quantity), unit: required.value.unit },
  } };
}

export function compatibleBasis(basis: ContentBasis, measure: NormalizedMeasure): boolean {
  return basis !== "unknown" && ((basis === "count") === (measure.unit === "each"));
}
