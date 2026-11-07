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

export type GrocerySearchOnlyRequirement = {
  itemId: string;
  shoppingName: string;
  searchCandidate: string;
  sourceRecipe: string | null;
  originalIngredient: string;
  reason: "quantity-unspecified";
  canAutoAddToCart: false;
};

const startsWithRecipeAmount = (value: string) =>
  /^\s*(?:\d|[¼½¾⅓⅔⅛])/.test(
    String(value || "")
  );

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

// GROCERY_COUNTABLE_REQUIREMENTS_V2
// Infer individual counts conservatively from the original recipe wording.
// This is a recipe requirement count, never a retailer package count.

const LEADING_NON_COUNT_UNITS =
  /^(?:cups?|tbsp|tablespoons?|tsp|teaspoons?|lb|lbs|pounds?|oz|ounces?|ml|milliliters?|l|liters?|cans?|packages?|packets?|jars?|boxes?|bags?|bottles?|cartons?|bunches?|heads?|cloves?)\b/i;

const COUNT_DESCRIPTORS =
  /\b(?:fresh|ripe|small|medium|large|extra[- ]large|roma|boneless|bone[- ]in|skinless|skin[- ]on|cooked|uncooked|raw|whole|thin|thick|lean|yellow|white|red|green)\b/g;

function singularizeCountToken(value: string) {
  if (/ies$/.test(value)) {
    return value.replace(/ies$/, "y");
  }

  if (/(?:ches|shes|xes|zes|ses)$/.test(value)) {
    return value.replace(/es$/, "");
  }

  if (/s$/.test(value) && !/ss$/.test(value)) {
    return value.slice(0, -1);
  }

  return value;
}

function comparableCountPhrase(value: string) {
  return normalized(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/,.*/g, " ")
    .replace(COUNT_DESCRIPTORS, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(singularizeCountToken)
    .join(" ")
    .trim();
}

function resolveRequirementUnit(
  line: GroceryHandoffLine
): string {
  const explicitUnit = line.unit.trim();
  if (explicitUnit) return explicitUnit;

  if (
    !Number.isInteger(line.quantity) ||
    (line.quantity ?? 0) <= 0
  ) {
    return "";
  }

  const match = String(
    line.originalIngredient || ""
  )
    .trim()
    .match(/^(\d+)\s+(.+)$/);

  if (
    !match ||
    Number(match[1]) !== line.quantity
  ) {
    return "";
  }

  const rawRemainder = match[2].trim();

  // Never reinterpret a lost measurement/container unit as a count.
  // Examples that must stay under review:
  // "1 Tbsp green onions", "2 cans tomatoes", "4 oz cheese".
  if (LEADING_NON_COUNT_UNITS.test(rawRemainder)) {
    return "";
  }

  const sourcePhrase =
    comparableCountPhrase(rawRemainder);

  const shoppingPhrase =
    comparableCountPhrase(line.shoppingName);

  if (!sourcePhrase || !shoppingPhrase) {
    return "";
  }

  const sourceTokens = new Set(
    sourcePhrase.split(/\s+/).filter(Boolean)
  );

  const shoppingTokens =
    shoppingPhrase.split(/\s+/).filter(Boolean);

  // Every meaningful shopping-name token must appear in the original
  // count phrase. This handles "4 skinless chicken breasts",
  // "2 ahi tuna steaks", "1 large egg", and "6 cherry peppers"
  // while refusing unrelated or measurement-led wording.
  if (
    !shoppingTokens.length ||
    !shoppingTokens.every(
      (token) => sourceTokens.has(token)
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
  const searchOnly: GrocerySearchOnlyRequirement[] = [];

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
      // A named grocery without a recipe amount is still safe to search.
      // Do not invent a quantity/package, and never auto-add it to a cart.
      // If the raw recipe *did* start with a numeric amount, keep it as a
      // true parser/data review instead of masking a lost quantity.
      if (!startsWithRecipeAmount(line.originalIngredient)) {
        searchOnly.push({
          itemId: line.itemId,
          shoppingName: line.shoppingName,
          searchCandidate: line.searchCandidate,
          sourceRecipe: line.sourceRecipe,
          originalIngredient: line.originalIngredient,
          reason: "quantity-unspecified",
          canAutoAddToCart: false,
        });
        continue;
      }

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
    searchOnly,
    reviews,
    canAutoAddToCart: false as const,
  };
}
