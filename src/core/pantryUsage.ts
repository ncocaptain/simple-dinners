import type { PantryItem } from "./types";

import {
  normalizeIngredientIdentity,
  normalizeIngredientUnit,
  parseIngredientLine as parseSharedIngredientLine,
} from "./ingredientParser";

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

export function getPantryComparableName(
  value: string
) {
  return normalizeIngredientIdentity(
    value
  );
}

export function getPantryComparableIngredientName(
  ingredient: string
) {
  return parseSharedIngredientLine(
    ingredient
  ).normalizedName;
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
    normalizeIngredientUnit(pantryUnit) ===
    normalizeIngredientUnit(recipeUnit)
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
      parseSharedIngredientLine(
        ingredientText
      );

    if (!parsed.normalizedName) {
      continue;
    }

    const pantryItem =
      pantryByName.get(
        parsed.normalizedName
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
      normalizeIngredientUnit(
        pantryItem.unit
      );

    const recipeUnit =
      normalizeIngredientUnit(
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
