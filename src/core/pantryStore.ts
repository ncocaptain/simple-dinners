import type { PantryItem } from "./types";
import type { GroceryCategory } from "./groceryCategories";
import {
  normalizeIngredientUnit,
} from "./ingredientParser";

export const PANTRY_STORAGE_KEY = "pantry";
export const PANTRY_UPDATED_EVENT =
  "simple-dinners:pantry-updated";

const PANTRY_UNIT_PREFIXES: Record<
  string,
  string[]
> = {
  cup: ["cup", "cups"],
  tbsp: [
    "tbsp",
    "tablespoon",
    "tablespoons",
  ],
  tsp: [
    "tsp",
    "teaspoon",
    "teaspoons",
  ],
  oz: [
    "oz",
    "ounce",
    "ounces",
  ],
  lb: [
    "lb",
    "lbs",
    "pound",
    "pounds",
  ],
  g: ["g", "gram", "grams"],
  kg: [
    "kg",
    "kilogram",
    "kilograms",
  ],
  ml: [
    "ml",
    "milliliter",
    "milliliters",
  ],
  l: ["l", "liter", "liters"],
  clove: ["clove", "cloves"],
  can: ["can", "cans"],
  package: [
    "package",
    "packages",
    "pkg",
    "pkgs",
  ],
  box: ["box", "boxes"],
  strip: ["strip", "strips"],
  slice: ["slice", "slices"],
  stick: ["stick", "sticks"],
  bunch: ["bunch", "bunches"],
  head: ["head", "heads"],
  jar: ["jar", "jars"],
  carton: ["carton", "cartons"],
  bag: ["bag", "bags"],
  tube: ["tube", "tubes"],
  packet: ["packet", "packets"],
  loaf: ["loaf", "loaves"],
  piece: ["piece", "pieces"],
};

export function cleanPantryItemName(
  value: string,
  unit?: string | null
) {
  const original =
    String(value || "")
      .replace(/\s+/g, " ")
      .trim();

  if (!original) {
    return "";
  }

  const normalizedUnit =
    String(
      normalizeIngredientUnit(
        unit
      ) || ""
    ).toLowerCase();

  if (!normalizedUnit) {
    return original;
  }

  const aliases =
    PANTRY_UNIT_PREFIXES[
      normalizedUnit
    ] || [normalizedUnit];

  const prefixPattern =
    new RegExp(
      "^(?:" +
        aliases
          .join("|") +
        ")\\b[\\s:–—-]*",
      "i"
    );

  const cleaned =
    original
      .replace(
        prefixPattern,
        ""
      )
      .replace(/\s+/g, " ")
      .trim();

  return cleaned || original;
}

export function formatPantryUnitLabel(
  unit: string | null | undefined,
  quantity: number | null | undefined
) {
  const normalized =
    normalizeIngredientUnit(unit);

  if (!normalized) {
    return "";
  }

  const shouldPluralize =
    typeof quantity === "number" &&
    quantity > 1;

  if (!shouldPluralize) {
    return normalized;
  }

  const plurals:
    Record<string, string> = {
      cup: "cups",
      clove: "cloves",
      can: "cans",
      package: "packages",
      box: "boxes",
      strip: "strips",
      slice: "slices",
      stick: "sticks",
      bunch: "bunches",
      head: "heads",
      jar: "jars",
      carton: "cartons",
      bag: "bags",
      tube: "tubes",
      packet: "packets",
      loaf: "loaves",
      piece: "pieces",
    };

  return (
    plurals[normalized] ||
    normalized
  );
}

function finiteNumber(value: unknown) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : null;
}

export function makePantryId(text: string) {
  const slug = String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `pantry-${slug || "item"}-${Date.now()}`;
}

function normalizePantryItem(
  value: unknown
): PantryItem | null {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  const raw =
    value as Record<string, unknown>;

  const name =
    typeof raw.name === "string"
      ? raw.name.trim()
      : "";

  if (!name) {
    return null;
  }

  const createdAt =
    finiteNumber(raw.createdAt) ??
    Date.now();

  const id =
    typeof raw.id === "string" &&
    raw.id.trim()
      ? raw.id.trim()
      : makePantryId(name);

  const item: PantryItem = {
    id,
    name,
    createdAt,
  };

  const quantity =
    finiteNumber(raw.quantity);

  if (
    quantity !== null &&
    quantity >= 0
  ) {
    item.quantity = quantity;
  }

  if (raw.unit === null) {
    item.unit = null;
  } else if (
    typeof raw.unit === "string"
  ) {
    const unit = raw.unit.trim();

    if (unit) {
      item.unit = unit;
    }
  }

  item.name =
    cleanPantryItemName(
      item.name,
      item.unit
    );

  if (
    typeof raw.category === "string" &&
    raw.category.trim()
  ) {
    item.category =
      raw.category as GroceryCategory;
  }

  if (
    typeof raw.packageSize === "string" &&
    raw.packageSize.trim()
  ) {
    item.packageSize =
      raw.packageSize.trim();
  }

  if (
    typeof raw.isStaple === "boolean"
  ) {
    item.isStaple =
      raw.isStaple;
  }

  if (
    typeof raw.isLow === "boolean"
  ) {
    item.isLow =
      raw.isLow;
  }

  if (raw.expiresAt === null) {
    item.expiresAt = null;
  } else {
    const expiresAt =
      finiteNumber(raw.expiresAt);

    if (expiresAt !== null) {
      item.expiresAt =
        expiresAt;
    }
  }

  const updatedAt =
    finiteNumber(raw.updatedAt);

  if (updatedAt !== null) {
    item.updatedAt =
      updatedAt;
  }

  return item;
}

export function loadPantryItems(): PantryItem[] {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(
        PANTRY_STORAGE_KEY
      ) || "[]"
    );

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(normalizePantryItem)
      .filter(
        (
          item
        ): item is PantryItem =>
          item !== null
      );
  } catch {
    return [];
  }
}

export function writePantryItems(
  items: PantryItem[]
) {
  const normalized = items
    .map(normalizePantryItem)
    .filter(
      (
        item
      ): item is PantryItem =>
        item !== null
    );

  localStorage.setItem(
    PANTRY_STORAGE_KEY,
    JSON.stringify(normalized)
  );

  return normalized;
}

export function savePantryItems(
  items: PantryItem[]
) {
  const normalized =
    writePantryItems(items);

  window.dispatchEvent(
    new Event(PANTRY_UPDATED_EVENT)
  );

  return normalized;
}

export function mergePantryNamesWithExisting(
  names: string[],
  existingItems: PantryItem[]
) {
  const existingByName = new Map(
    existingItems.map((item) => [
      item.name.trim().toLowerCase(),
      item,
    ])
  );

  const seen =
    new Set<string>();

  const next: PantryItem[] = [];

  for (const rawName of names) {
    const name =
      String(rawName || "").trim();

    if (!name) continue;

    const key =
      name.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    const existing =
      existingByName.get(key);

    if (existing) {
      next.push({
        ...existing,
        name,
      });

      continue;
    }

    next.push({
      id: makePantryId(name),
      name,
      createdAt: Date.now(),
    });
  }

  return next;
}
