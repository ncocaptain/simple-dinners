/**
 * Conservative Pantry unit compatibility.
 *
 * A fresh/countable item must not be covered by a canned
 * or jarred version of that product.
 *
 * Unknown conversions remain subject to existing Pantry
 * partial-coverage handling.
 */

export type PantryUnitCompatibility =
  | "compatible"
  | "incompatible"
  | "uncertain";

function normalizedUnit(value: string | null | undefined) {
  const unit = String(value ?? "").trim().toLowerCase();

  if (/^(?:count|each|ea|pieces?|__count__)$/.test(unit)) {
    return "count";
  }

  if (/^(?:cans?|tins?)$/.test(unit)) return "can";
  if (/^jars?$/.test(unit)) return "jar";

  return unit;
}

export function classifyPantryUnitMatch(
  requiredUnit: string | null | undefined,
  pantryUnit: string | null | undefined,
  requiredIsCountable: boolean
): PantryUnitCompatibility {
  const required = requiredIsCountable
    ? "count"
    : normalizedUnit(requiredUnit);

  const available = normalizedUnit(pantryUnit);

  const preservedContainers = new Set(["can", "jar"]);

  if (
    (required === "count" &&
      preservedContainers.has(available)) ||
    (available === "count" &&
      preservedContainers.has(required))
  ) {
    return "incompatible";
  }

  if (required === available) {
    return "compatible";
  }

  return "uncertain";
}

export function selectCompatiblePantryItem<
  T extends { unit?: string | null }
>(
  candidates: readonly T[],
  requiredUnit: string | null | undefined,
  requiredIsCountable: boolean
): T | undefined {
  const classify = (item: T) =>
    classifyPantryUnitMatch(
      requiredUnit,
      item.unit,
      requiredIsCountable
    );

  // Prefer an exact compatible unit even when a different
  // Pantry item appears earlier.
  return (
    candidates.find(
      (item) => classify(item) === "compatible"
    ) ??
    candidates.find(
      (item) => classify(item) === "uncertain"
    )
  );
}
