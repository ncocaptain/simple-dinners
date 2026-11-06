import type { GroceryHandoffLine } from "./groceryHandoff";

export type GroceryRequirementGroup = {
  shoppingName: string;
  searchCandidate: string;
  quantity: number;
  unit: string;
  packageSize: string;
  sourceLines: Array<{
    itemId: string;
    sourceRecipe: string | null;
    originalIngredient: string;
    quantity: number;
  }>;
  canAutoAddToCart: false;
};

export type GroceryRequirementReview = {
  itemId: string;
  reason:
    | "unresolved-item"
    | "missing-quantity"
    | "missing-unit"
    | "missing-search";
};

const normalized = (value: string) =>
  value.toLowerCase().replace(/\s+/g, " ").trim();

// Keep retailer-important original product descriptions
// distinct even when their normalized names are identical.
function sourceFingerprint(value: string) {
  return String(value || "")
    .replace(
      /^\s*(?:\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(?:(?:lb|lbs|pounds?|oz|ounces?|cups?|tbsp|tablespoons?|tsp|teaspoons?|cans?|packets?|packages?)\b)?\s*/i,
      ""
    )
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// GROCERY_COUNTABLE_REQUIREMENTS_V1
// These are individual recipe counts, not retailer pack sizes.
// Only infer counts for explicitly recognized products.
const COUNTABLE_REQUIREMENT_NAMES = new Set([
  "graham cracker sheets",
  "ready-to-eat vanilla pudding snack cups",
  "ripe bananas",
  "tomato",
  "tomatoes",
  "vanilla wafer cookies",
  "ready-to-eat chocolate pudding snack cups",
  "chocolate sandwich cookies",
  "gummy worms",
]);

function resolveRequirementUnit(
  line: GroceryHandoffLine
): string {
  const explicitUnit = line.unit.trim();
  if (explicitUnit) return explicitUnit;

  if (
    !Number.isInteger(line.quantity) ||
    (line.quantity ?? 0) <= 0 ||
    !COUNTABLE_REQUIREMENT_NAMES.has(
      normalized(line.shoppingName)
    )
  ) {
    return "";
  }

  const match = String(
    line.originalIngredient || ""
  ).trim().match(/^(\d+)\s+(.+)$/);

  const sourceName = normalized(match?.[2] ?? "");

  // A recipe can say "1 tomato" or "1 medium tomato".
  // Never interpret "1 can tomatoes" as an individual tomato.
  const individualTomato =
    ["tomato", "tomatoes"].includes(
      normalized(line.shoppingName)
    ) &&
    /^(?:(?:fresh|ripe|small|medium|large|roma)\s+)*tomato(?:es)?\b/.test(
      sourceName
    );

  if (
    !match ||
    Number(match[1]) !== line.quantity ||
    !(
      sourceName.startsWith(normalized(line.shoppingName)) ||
      individualTomato
    )
  ) {
    return "";
  }

  return "count";
}

export function summarizeGroceryRequirements(
  lines: readonly GroceryHandoffLine[]
) {
  const groups = new Map<string, GroceryRequirementGroup>();
  const reviews: GroceryRequirementReview[] = [];

  for (const line of lines) {
    const requirementUnit = resolveRequirementUnit(line);

    let reason: GroceryRequirementReview["reason"] | null = null;

    if (line.status !== "search-candidate") {
      reason = "unresolved-item";
    } else if (!line.searchCandidate.trim()) {
      reason = "missing-search";
    } else if (
      typeof line.quantity !== "number" ||
      !Number.isFinite(line.quantity) ||
      line.quantity <= 0
    ) {
      reason = "missing-quantity";
    } else if (!requirementUnit) {
      // Do not guess whether an unspecified unit
      // represents count, weight, or volume.
      reason = "missing-unit";
    }

    if (reason) {
      reviews.push({ itemId: line.itemId, reason });
      continue;
    }

    const quantity = line.quantity as number;

    const key = JSON.stringify([
      normalized(line.searchCandidate),
      normalized(line.shoppingName),
      normalized(requirementUnit),
      normalized(line.packageSize),
      sourceFingerprint(line.originalIngredient),
    ]);

    const source = {
      itemId: line.itemId,
      sourceRecipe: line.sourceRecipe,
      originalIngredient: line.originalIngredient,
      quantity,
    };

    const existing = groups.get(key);

    if (existing) {
      existing.quantity =
        Math.round(
          (existing.quantity + quantity) * 1000000
        ) / 1000000;

      existing.sourceLines.push(source);
    } else {
      groups.set(key, {
        shoppingName: line.shoppingName,
        searchCandidate: line.searchCandidate,
        quantity,
        unit: requirementUnit,
        packageSize: line.packageSize,
        sourceLines: [source],
        canAutoAddToCart: false,
      });
    }
  }

  return {
    originalLines: lines.length,
    groups: Array.from(groups.values()),
    reviews,
    canAutoAddToCart: false as const,
  };
}
