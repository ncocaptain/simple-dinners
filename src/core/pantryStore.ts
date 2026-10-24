import type { PantryItem } from "./types";
import type { GroceryCategory } from "./groceryCategories";

export const PANTRY_STORAGE_KEY = "pantry";
export const PANTRY_UPDATED_EVENT =
  "simple-dinners:pantry-updated";

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
