import type { PantryItem } from "./types";

export type PantryUsageReason =
  | "ready"
  | "staple"
  | "unknown-amount"
  | "unit-mismatch";

export type PantryUsageSuggestion = {
  pantryId: string;
  pantryName: string;
  ingredientText: string;
  pantryQuantity: number | null;
  pantryUnit: string | null;
  recipeQuantity: number | null;
  recipeUnit: string | null;
  isStaple: boolean;
  canDeduct: boolean;
  reason: PantryUsageReason;
};

const UNICODE_FRACTIONS: Record<string, number> = {
  "¼": 0.25,
  "½": 0.5,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

const UNIT_ALIASES: Record<string, string> = {
  cup: "cup",
  cups: "cup",

  tbsp: "tbsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",

  tsp: "tsp",
  teaspoon: "tsp",
  teaspoons: "tsp",

  oz: "oz",
  ounce: "oz",
  ounces: "oz",

  lb: "lb",
  lbs: "lb",
  pound: "lb",
  pounds: "lb",

  g: "g",
  gram: "g",
  grams: "g",

  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",

  ml: "ml",
  milliliter: "ml",
  milliliters: "ml",

  l: "l",
  liter: "l",
  liters: "l",

  can: "can",
  cans: "can",

  package: "package",
  packages: "package",
  pkg: "package",
  pkgs: "package",

  bag: "bag",
  bags: "bag",

  jar: "jar",
  jars: "jar",

  carton: "carton",
  cartons: "carton",

  clove: "clove",
  cloves: "clove",

  slice: "slice",
  slices: "slice",

  piece: "piece",
  pieces: "piece",
};

const DESCRIPTORS = new Set([
  "fresh",
  "large",
  "small",
  "medium",
  "extra",
  "virgin",
  "boneless",
  "skinless",
  "lean",
  "halved",
  "diced",
  "chopped",
  "minced",
  "sliced",
  "shredded",
  "softened",
  "melted",
  "beaten",
  "drained",
  "rinsed",
  "divided",
  "optional",
  "unsalted",
  "salted",
  "cooked",
  "uncooked",
]);

function parseQuantity(
  raw: string
): number | null {
  const value = raw.trim();

  if (!value) return null;

  if (
    UNICODE_FRACTIONS[value] !==
    undefined
  ) {
    return UNICODE_FRACTIONS[value];
  }

  const mixed = value.match(
    /^(\d+)\s+(\d+)\/(\d+)$/
  );

  if (mixed) {
    const whole = Number(mixed[1]);
    const numerator = Number(mixed[2]);
    const denominator = Number(mixed[3]);

    if (!denominator) return null;

    return (
      whole +
      numerator / denominator
    );
  }

  const fraction = value.match(
    /^(\d+)\/(\d+)$/
  );

  if (fraction) {
    const numerator =
      Number(fraction[1]);
    const denominator =
      Number(fraction[2]);

    if (!denominator) return null;

    return numerator / denominator;
  }

  const numberValue =
    Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : null;
}

function normalizeUnit(
  value: string | null | undefined
) {
  if (!value) return null;

  return (
    UNIT_ALIASES[
      value.toLowerCase().trim()
    ] || value.toLowerCase().trim()
  );
}

function singularizeWord(
  word: string
) {
  if (
    word.endsWith("ies") &&
    word.length > 4
  ) {
    return `${word.slice(0, -3)}y`;
  }

  if (
    word.endsWith("oes") &&
    word.length > 4
  ) {
    return word.slice(0, -2);
  }

  if (
    word.endsWith("ses") &&
    word.length > 4
  ) {
    return word.slice(0, -1);
  }

  if (
    word.endsWith("s") &&
    !word.endsWith("ss") &&
    word.length > 3
  ) {
    return word.slice(0, -1);
  }

  return word;
}

function normalizeIngredientName(
  text: string
) {
  const source =
    String(text || "")
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .toLowerCase();

  /*
   * Pantry identity needs to preserve product form when
   * that form changes what the ingredient actually is.
   *
   * "tomatoes, diced" = fresh tomatoes that need prep.
   * "diced tomatoes" = canned/prepared diced tomatoes.
   *
   * "garlic, minced" = a clove that needs prep.
   * "minced garlic" = prepared/jarred minced garlic.
   */
  const preservedForm =
    /\bfire[- ]roasted\s+diced\s+tomatoes?\b/.test(
      source
    )
      ? "fire-roasted-diced"
      : /\bdiced\s+tomatoes?\b/.test(
          source
        )
        ? "diced"
        : /\bminced\s+garlic\b/.test(
            source
          )
          ? "minced"
          : "";

  const normalized =
    source
      .replace(/\([^)]*\)/g, " ")
      .replace(
        /[^a-z0-9\s]/g,
        " "
      )
      .split(/\s+/)
      .map((word) =>
        word.trim()
      )
      .filter(Boolean)
      .filter(
        (word) =>
          !DESCRIPTORS.has(
            word
          )
      )
      .filter(
        (word) =>
          !UNIT_ALIASES[word]
      )
      .map(singularizeWord)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

  if (!normalized) {
    return "";
  }

  return preservedForm
    ? `${preservedForm} ${normalized}`
    : normalized;
}

function parseIngredientLine(
  ingredient: string
) {
  let text = String(
    ingredient || ""
  )
    .replace(
      /,?\s*to taste/gi,
      ""
    )
    .replace(
      /,?\s*optional/gi,
      ""
    )
    .replace(
      /,?\s*divided/gi,
      ""
    )
    .trim();

  const quantityPattern =
    /^((?:\d+\s+\d+\/\d+)|(?:\d+\/\d+)|(?:\d+(?:\.\d+)?)|[¼½¾⅓⅔⅛⅜⅝⅞])(?=\s|\(|$)/;

  const quantityMatch =
    text.match(quantityPattern);

  let quantity: number | null =
    null;

  if (quantityMatch) {
    quantity =
      parseQuantity(
        quantityMatch[1]
      );

    text = text
      .slice(
        quantityMatch[0].length
      )
      .trim();
  }

  const unitPattern =
    /^(cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|oz|ounce|ounces|lb|lbs|pound|pounds|g|gram|grams|kg|kilogram|kilograms|ml|milliliter|milliliters|l|liter|liters|can|cans|package|packages|pkg|pkgs|bag|bags|jar|jars|carton|cartons|clove|cloves|slice|slices|piece|pieces)\b/i;

  const unitMatch =
    text.match(unitPattern);

  let unit: string | null =
    null;

  if (unitMatch) {
    unit =
      normalizeUnit(
        unitMatch[1]
      );

    text = text
      .slice(
        unitMatch[0].length
      )
      .trim();
  }

  return {
    quantity,
    unit,
    name:
      normalizeIngredientName(
        text
      ),
  };
}

export function getPantryComparableName(
  value: string
) {
  return normalizeIngredientName(
    value
  );
}

export function getPantryComparableIngredientName(
  ingredient: string
) {
  return parseIngredientLine(
    ingredient
  ).name;
}

function getPantryMatchKey(
  item: PantryItem
) {
  return getPantryComparableName(
    item.name
  );
}

function unitsMatch(
  pantryUnit: string | null,
  recipeUnit: string | null
) {
  return (
    normalizeUnit(pantryUnit) ===
    normalizeUnit(recipeUnit)
  );
}

export function buildPantryUsageSuggestions(
  ingredientLines: string[],
  pantryItems: PantryItem[]
): PantryUsageSuggestion[] {
  const pantryByName =
    new Map<string, PantryItem>();

  for (const item of pantryItems) {
    const key =
      getPantryMatchKey(item);

    if (!key) continue;

    pantryByName.set(
      key,
      item
    );
  }

  const suggestions =
    new Map<
      string,
      PantryUsageSuggestion
    >();

  for (
    const ingredientText
    of ingredientLines
  ) {
    const parsed =
      parseIngredientLine(
        ingredientText
      );

    if (!parsed.name) {
      continue;
    }

    const pantryItem =
      pantryByName.get(
        parsed.name
      );

    if (!pantryItem) {
      continue;
    }

    const pantryQuantity =
      typeof pantryItem.quantity ===
      "number"
        ? pantryItem.quantity
        : null;

    const pantryUnit =
      normalizeUnit(
        pantryItem.unit
      );

    const recipeUnit =
      normalizeUnit(
        parsed.unit
      );

    let reason:
      PantryUsageReason =
        "ready";

    let canDeduct = true;

    if (pantryItem.isStaple) {
      reason = "staple";
      canDeduct = false;
    } else if (
      pantryQuantity === null ||
      parsed.quantity === null
    ) {
      reason =
        "unknown-amount";
      canDeduct = false;
    } else if (
      !unitsMatch(
        pantryUnit,
        recipeUnit
      )
    ) {
      reason =
        "unit-mismatch";
      canDeduct = false;
    }

    const existing =
      suggestions.get(
        pantryItem.id
      );

    if (!existing) {
      suggestions.set(
        pantryItem.id,
        {
          pantryId:
            pantryItem.id,
          pantryName:
            pantryItem.name,
          ingredientText,
          pantryQuantity,
          pantryUnit,
          recipeQuantity:
            parsed.quantity,
          recipeUnit,
          isStaple:
            Boolean(
              pantryItem.isStaple
            ),
          canDeduct,
          reason,
        }
      );

      continue;
    }

    const canCombine =
      existing.canDeduct &&
      canDeduct &&
      existing.recipeQuantity !==
        null &&
      parsed.quantity !== null &&
      unitsMatch(
        existing.recipeUnit,
        recipeUnit
      );

    suggestions.set(
      pantryItem.id,
      {
        ...existing,
        ingredientText:
          `${existing.ingredientText} + ${ingredientText}`,
        recipeQuantity:
          canCombine
            ? (
                existing.recipeQuantity ??
                0
              ) +
              (
                parsed.quantity ??
                0
              )
            : existing.recipeQuantity,
        canDeduct:
          canCombine,
        reason:
          canCombine
            ? "ready"
            : existing.isStaple
              ? "staple"
              : "unit-mismatch",
      }
    );
  }

  return Array.from(
    suggestions.values()
  );
}

export function applyPantryUsage(
  pantryItems: PantryItem[],
  suggestions: PantryUsageSuggestion[],
  selectedIds: Set<string>
) {
  const usageById =
    new Map(
      suggestions
        .filter(
          (suggestion) =>
            selectedIds.has(
              suggestion.pantryId
            )
        )
        .map(
          (suggestion) => [
            suggestion.pantryId,
            suggestion,
          ]
        )
    );

  return pantryItems.flatMap(
    (item) => {
      const usage =
        usageById.get(
          item.id
        );

      if (!usage) {
        return [item];
      }

      if (
        item.isStaple
      ) {
        return [item];
      }

      // If Simple Dinners cannot safely calculate a
      // partial deduction, selecting the item means
      // the user explicitly confirmed it was used up.
      if (
        !usage.canDeduct
      ) {
        return [];
      }

      if (
        typeof item.quantity !==
          "number" ||
        usage.recipeQuantity ===
          null ||
        !unitsMatch(
          item.unit ?? null,
          usage.recipeUnit
        )
      ) {
        return [item];
      }

      const nextQuantity =
        Math.round(
          (
            item.quantity -
            usage.recipeQuantity
          ) * 1000
        ) / 1000;

      if (
        nextQuantity <= 0
      ) {
        return [];
      }

      return [
        {
          ...item,
          quantity:
            nextQuantity,
          updatedAt:
            Date.now(),
        },
      ];
    }
  );
}

export function formatPantryUsageAmount(
  quantity: number | null,
  unit: string | null
) {
  if (quantity === null) {
    return "";
  }

  const value =
    Number.isInteger(quantity)
      ? String(quantity)
      : quantity
          .toFixed(2)
          .replace(/0+$/, "")
          .replace(/\.$/, "");

  return unit
    ? `${value} ${unit}`
    : value;
}
