/**
 * Grocery fulfillment choice classification.
 *
 * Read-only: never changes recipe ingredients,
 * quantities, saved items, or display text.
 */

export type GroceryChoiceInput = {
  normalizedName?: string;
  recipeIngredientText?: string;
  grocerySearchName?: string;
};

export type GroceryChoiceResult = {
  status: "ready" | "needs-selection" | "preparation-note";
  originalIngredient: string;
  searchName: string;
  requiresSelection: boolean;
  reason?:
    | "alternative"
    | "unspecified-choice"
    | "make-or-buy"
    | "preparation-note";
};

export function resolveGroceryChoice(
  item: GroceryChoiceInput
): GroceryChoiceResult {
  const originalIngredient = String(
    item.recipeIngredientText ||
    item.normalizedName ||
    ""
  ).trim();

  const searchName = String(
    item.grocerySearchName ||
    item.normalizedName ||
    ""
  ).trim();

  const source = [
    originalIngredient,
    item.normalizedName || "",
    searchName,
  ].join(" ");

  // Remove known cooking/preparation phrases from
  // choice detection, not from the original ingredient.
  const preparationPatterns = [
    /\btails?\s+on\s+or\s+off\b/gi,
    /\b(?:finely\s+)?minced\s+or\s+grated\b/gi,
    /\bskillet\s+or\s+pot\b/gi,
    /\bfried\s+or\s+soft[- ]boiled\b/gi,
  ];

  let candidate = source;

  for (const pattern of preparationPatterns) {
    candidate = candidate.replace(pattern, " ");
  }

  const removedPreparation = candidate !== source;

  const result = (
    status: GroceryChoiceResult["status"],
    reason?: GroceryChoiceResult["reason"]
  ): GroceryChoiceResult => ({
    status,
    originalIngredient,
    searchName,
    requiresSelection: status === "needs-selection",
    ...(reason ? { reason } : {}),
  });

  if (/\b(?:of choice|your choice)\b/i.test(candidate)) {
    return result("needs-selection", "unspecified-choice");
  }

  if (
    /\b(?:store[- ]bought\s+or\s+homemade|homemade\s+or\s+store[- ]bought)\b/i.test(
      candidate
    )
  ) {
    return result("needs-selection", "make-or-buy");
  }

  if (/\bor\b/i.test(candidate)) {
    return result("needs-selection", "alternative");
  }

  if (removedPreparation) {
    return result("preparation-note", "preparation-note");
  }

  // "Ready" here only means no choice was detected.
  // Retailer suitability is checked separately.
  return result("ready");
}


// GROCERY_DELIVERY_SAFETY_GATE_V1
// A search candidate is NOT a verified retailer product.

export type GroceryDeliveryInput = GroceryChoiceInput & {
  quantity?: number | null;
  unit?: string;
  packageSize?: string;
};

export function assessGroceryDeliveryReadiness(
  item: GroceryDeliveryInput
) {
  const choice = resolveGroceryChoice(item);

  const raw = choice.originalIngredient;

  // Alternatives with their own numeric amounts must not
  // inherit the first ingredient's quantity automatically.
  const alternativeQuantityPattern =
    /\bor\s+(?:about\s+)?(?:\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(?:tsp|tbsp|teaspoons?|tablespoons?|cups?|oz|ounces?|lb|lbs|pounds?|cans?|packages?|packets?|cloves?|small|medium|large|onions?)\b/i;

  const needsQuantityRecalculation =
    choice.requiresSelection &&
    alternativeQuantityPattern.test(raw);

  let state:
    | "search-candidate"
    | "needs-choice"
    | "needs-product-review"
    | "needs-search-term";

  if (!choice.searchName.trim()) {
    state = "needs-search-term";
  } else if (choice.requiresSelection) {
    state = "needs-choice";
  } else if (choice.status === "preparation-note") {
    state = "needs-product-review";
  } else {
    state = "search-candidate";
  }

  return {
    state,
    originalIngredient: raw,
    searchName: choice.searchName,
    quantity: item.quantity ?? null,
    unit: item.unit ?? "",
    packageSize: item.packageSize ?? "",
    choiceReason: choice.reason ?? null,
    needsQuantityRecalculation,
    quantityOptions: getGroceryQuantityOptions(raw),
    quantityNeedsReview:
      item.quantity == null ||
      !Number.isFinite(item.quantity) ||
      item.quantity <= 0,
    // No retailer-specific product/package has been verified.
    canAutoAddToCart: false as const,
  };
}


// GROCERY_QUANTITY_OPTIONS_V1
// Recipe requirements, NOT retailer package quantities.
// Every alternative needs an explicit shopper choice.

export type GroceryQuantityOption = {
  searchName: string | null;
  quantity: number;
  unit: string;
  packageSize?: string;
  fulfillmentAction: "search" | "manual-preparation";
};

export function getGroceryQuantityOptions(
  originalIngredient: string
): GroceryQuantityOption[] | null {
  const raw = String(originalIngredient || "");

  const rules: Array<{
    pattern: RegExp;
    options: GroceryQuantityOption[];
  }> = [
    {
      pattern: /\b1\s+tbsp\s+fresh ginger\b.*\bor\s+1\/2\s+tsp\s+ground ginger\b/i,
      options: [
        { searchName: "Fresh Ginger", quantity: 1, unit: "Tbsp", fulfillmentAction: "search" },
        { searchName: "Ground Ginger", quantity: 0.5, unit: "tsp", fulfillmentAction: "search" }
      ]
    },
    {
      pattern: /\b1\s+small shallot\b.*\bor\s+1\/4\s+onion\b/i,
      options: [
        { searchName: "Shallot", quantity: 1, unit: "count", fulfillmentAction: "search" },
        { searchName: "Onion", quantity: 0.25, unit: "count", fulfillmentAction: "search" }
      ]
    },
    {
      pattern: /\b2\s+tbsp\s+fresh dill\b.*\bor\s+1\s+tsp\s+dried dill\b/i,
      options: [
        { searchName: "Fresh Dill", quantity: 2, unit: "Tbsp", fulfillmentAction: "search" },
        { searchName: "Dried Dill", quantity: 1, unit: "tsp", fulfillmentAction: "search" }
      ]
    },
    {
      pattern: /\b1\s+tsp\s+fresh ginger\b.*\bor\s+1\/2\s+tsp\s+ground ginger\b/i,
      options: [
        { searchName: "Fresh Ginger", quantity: 1, unit: "tsp", fulfillmentAction: "search" },
        { searchName: "Ground Ginger", quantity: 0.5, unit: "tsp", fulfillmentAction: "search" }
      ]
    },
    {
      pattern: /\b1\s+packet\s+taco seasoning\b.*\bor\s+2\s+tbsp\s+homemade taco seasoning\b/i,
      options: [
        { searchName: "Taco Seasoning", quantity: 1, unit: "packet", fulfillmentAction: "search" },
        { searchName: null, quantity: 2, unit: "Tbsp", fulfillmentAction: "manual-preparation" }
      ]
    },
    {
      pattern: /\b1\s+cup\s+cooked shredded chicken\b.*\bor\s+1\s+can\s+\(15\s+oz\)\s+black beans\b/i,
      options: [
        { searchName: "Cooked Shredded Chicken", quantity: 1, unit: "cup", fulfillmentAction: "search" },
        { searchName: "Black Beans", quantity: 1, unit: "can", packageSize: "15 oz", fulfillmentAction: "search" }
      ]
    },
    {
      pattern: /\b1\s+tsp\s+fresh sage\b.*\bor\s+1\/2\s+tsp\s+dried sage\b/i,
      options: [
        { searchName: "Fresh Sage", quantity: 1, unit: "tsp", fulfillmentAction: "search" },
        { searchName: "Dried Sage", quantity: 0.5, unit: "tsp", fulfillmentAction: "search" }
      ]
    }
  ];

  const matched = rules.find(rule => rule.pattern.test(raw));

  return matched
    ? matched.options.map(option => ({ ...option }))
    : null;
}
