import type { GroceryRequirementGroup } from "./groceryRequirementSummary";
import {
  assessRetailerRequirement,
  type GroceryRetailerMatch,
} from "./groceryRetailerMatch";

export type InstacartMeasurement = {
  quantity: number;
  unit: string;
};

export type InstacartLineItem = {
  name: string;
  display_text: string;
  line_item_measurements?: InstacartMeasurement[];
};

export type InstacartShoppingListPayload = {
  title: string;
  link_type: "shopping_list";
  expires_in: number;
  line_items: InstacartLineItem[];
  landing_page_configuration?: {
    partner_linkback_url?: string;
  };
};

const UNIT_MAP: Record<string, string> = {
  lb: "lb",
  oz: "ounce",
  cup: "cup",
  Tbsp: "tablespoon",
  tsp: "teaspoon",
  ml: "ml",
  l: "liter",
  can: "can",
  package: "package",
  packet: "packet",
  bunch: "bunch",
  head: "head",
  count: "each",
};

function rounded(value: number) {
  return Math.round(value * 1000000) / 1000000;
}

function parsePackageWeight(packageSize: string) {
  const match = String(packageSize || "")
    .trim()
    .match(/^(\d+(?:\.\d+)?)\s*(oz|lb)$/i);

  if (!match) return null;

  return {
    quantity: Number(match[1]),
    unit: match[2].toLowerCase(),
  };
}

function displayRequirement(
  requirement: GroceryRequirementGroup,
  retailerMatch: GroceryRetailerMatch
) {
  if (requirement.packageSize) {
    return `${requirement.shoppingName} — ${retailerMatch.purchaseTarget}`;
  }

  return `${requirement.shoppingName} — ${retailerMatch.purchaseTarget}`;
}

function buildMeasurement(
  requirement: GroceryRequirementGroup,
  retailerMatch: GroceryRetailerMatch
): InstacartMeasurement[] | undefined {
  // A count of crackers/cookies/snack cups refers to pieces inside a
  // purchasable package, not store package count. Let Instacart match
  // the product and show the recipe requirement in display_text.
  if (retailerMatch.mode === "package-count") {
    return undefined;
  }

  const packageWeight = parsePackageWeight(
    requirement.packageSize
  );

  // Preserve total packaged weight when the recipe explicitly names
  // a can/package size, e.g. 2 x 14.5 oz cans -> 29 ounces can.
  if (
    packageWeight &&
    ["can", "package"].includes(requirement.unit)
  ) {
    const total = rounded(
      requirement.quantity * packageWeight.quantity
    );

    if (packageWeight.unit === "oz") {
      return [{
        quantity: total,
        unit:
          requirement.unit === "can"
            ? "ounces can"
            : "ounce",
      }];
    }

    if (packageWeight.unit === "lb") {
      return [{
        quantity: total,
        unit:
          requirement.unit === "can"
            ? "lb can"
            : "lb",
      }];
    }
  }

  const unit = UNIT_MAP[requirement.unit];

  if (!unit) {
    return undefined;
  }

  return [{
    quantity: rounded(requirement.quantity),
    unit,
  }];
}

export function buildInstacartLineItem(
  requirement: GroceryRequirementGroup
): InstacartLineItem {
  const retailerMatch =
    assessRetailerRequirement(requirement);

  const measurements = buildMeasurement(
    requirement,
    retailerMatch
  );

  return {
    name:
      retailerMatch.searchName ||
      requirement.shoppingName,
    display_text: displayRequirement(
      requirement,
      retailerMatch
    ),
    ...(measurements?.length
      ? { line_item_measurements: measurements }
      : {}),
  };
}

export function buildInstacartShoppingListPayload(
  requirements: readonly GroceryRequirementGroup[],
  options?: {
    title?: string;
    linkBackUrl?: string;
    expiresInDays?: number;
  }
): InstacartShoppingListPayload {
  const lineItems = requirements
    .filter(
      (item) =>
        item &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0 &&
        String(
          item.searchCandidate || item.shoppingName
        ).trim()
    )
    .map(buildInstacartLineItem);

  if (!lineItems.length) {
    throw new Error(
      "No grocery requirements are available for Instacart."
    );
  }

  const expiresIn = Math.max(
    1,
    Math.min(
      365,
      Math.floor(options?.expiresInDays ?? 7)
    )
  );

  const linkBackUrl =
    String(options?.linkBackUrl || "").trim();

  return {
    title:
      String(options?.title || "").trim() ||
      "Simple Dinners Grocery List",
    link_type: "shopping_list",
    expires_in: expiresIn,
    line_items: lineItems,
    ...(linkBackUrl
      ? {
          landing_page_configuration: {
            partner_linkback_url: linkBackUrl,
          },
        }
      : {}),
  };
}
