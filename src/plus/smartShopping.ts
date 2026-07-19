import {
  categorizeGroceryItem,
  type GroceryCategory,
} from "../core/groceryCategories";
import type { ShoppingItem } from "../shoppingList";
import {
  resolveSmartShoppingThumbnail,
  type SmartShoppingThumbnailMatchType,
} from "./smartShoppingThumbnails";

// =====================================================
// Smart Shopping preview types
// Preview-only for now. Nothing in this file saves data.
// =====================================================

export type SmartShoppingChange =
  | "combined"
  | "normalized"
  | "quantity-separated"
  | "recategorized";

export type SmartShoppingQuantityStatus =
  | "known"
  | "unknown"
  | "none";

export type SmartShoppingPreviewItem = {
  previewId: string;
  sourceIds: string[];
  originalTexts: string[];

  normalizedName: string;
  displayName: string;
  quantityText: string;
  quantityStatus: SmartShoppingQuantityStatus;
  category: GroceryCategory;

  thumbnailKey: string;
  thumbnailMatchType: SmartShoppingThumbnailMatchType;
  thumbnailAltText: string;

  checked: boolean;
  changes: SmartShoppingChange[];
  confidence: number;
};

export type SmartShoppingPreview = {
  version: 1;
  baseSignature: string;

  originalItemCount: number;
  proposedItemCount: number;
  combinedEntryCount: number;

  items: SmartShoppingPreviewItem[];
};

export type SmartShoppingApplyPlanReason =
  | "ready"
  | "stale-preview"
  | "missing-items"
  | "no-changes";

export type SmartShoppingApplyPlan = {
  version: 1;

  canApply: boolean;
  reason: SmartShoppingApplyPlanReason;

  beforeSignature: string;
  afterSignature: string;

  sourceItemCount: number;
  changedItemCount: number;

  originalItems: ShoppingItem[];
  nextItems: ShoppingItem[];
};

// Some of these fields may be present on newer shopping-list items.
// Keeping the extension local means this file remains compatible even
// while the main ShoppingItem type evolves.
type SmartShoppingSourceItem = ShoppingItem & {
  displayText?: string;
  grocerySearchName?: string;
  groceryNotes?: string;
};

type PreviewGroup = {
  key: string;
  normalizedName: string;
  category: GroceryCategory;
  checked: boolean;
  unit: string;
  packageSize: string;
  items: SmartShoppingSourceItem[];
};

// =====================================================
// General text helpers
// =====================================================

function cleanSpacing(value: unknown): string {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/^[-•*]+\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value: unknown): string {
  return cleanSpacing(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’]/g, "'")
    .replace(/[,:;]+$/g, "")
    .trim();
}

function formatDisplayName(value: string): string {
  const cleaned = cleanSpacing(value);

  if (!cleaned) {
    return "Unknown item";
  }

  const specialNames: Record<string, string> = {
    "aa batteries": "AA Batteries",
    "aaa batteries": "AAA Batteries",
    bbq: "BBQ",
    "bbq sauce": "BBQ Sauce",
    "ziploc bags": "Ziploc Bags",
    "ziplock bags": "Ziplock Bags",
  };

  const normalized = normalizeText(cleaned);

  if (specialNames[normalized]) {
    return specialNames[normalized];
  }

  const smallWords = new Set([
    "a",
    "an",
    "and",
    "in",
    "of",
    "or",
    "the",
    "with",
  ]);

  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase();

      if (index > 0 && smallWords.has(lower)) {
        return lower;
      }

      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

// =====================================================
// Conservative product identity aliases
//
// These rules only collapse products that are clearly the
// same grocery item. Meaningful product differences remain
// separate unless we add an explicit rule later.
// =====================================================

const EXACT_NAME_ALIASES: Record<string, string> = {
  // Eggs
  egg: "egg",
  eggs: "egg",

  // Onions
  onion: "onion",
  onions: "onion",

  "yellow onion": "yellow onion",
  "yellow onions": "yellow onion",

  "white onion": "white onion",
  "white onions": "white onion",

  "red onion": "red onion",
  "red onions": "red onion",

  "green onion": "green onion",
  "green onions": "green onion",
  scallion: "green onion",
  scallions: "green onion",
  "spring onion": "green onion",
  "spring onions": "green onion",

  // Bell peppers
  "bell pepper": "bell pepper",
  "bell peppers": "bell pepper",

  "green pepper": "green bell pepper",
  "green peppers": "green bell pepper",
  "green bell pepper": "green bell pepper",
  "green bell peppers": "green bell pepper",

  "red bell pepper": "red bell pepper",
  "red bell peppers": "red bell pepper",

  "yellow bell pepper": "yellow bell pepper",
  "yellow bell peppers": "yellow bell pepper",

  "orange bell pepper": "orange bell pepper",
  "orange bell peppers": "orange bell pepper",

  // Common produce plurals
  potato: "potato",
  potatoes: "potato",

  "sweet potato": "sweet potato",
  "sweet potatoes": "sweet potato",

  tomato: "tomato",
  tomatoes: "tomato",

  avocado: "avocado",
  avocados: "avocado",

  banana: "banana",
  bananas: "banana",

  apple: "apple",
  apples: "apple",

  orange: "orange",
  oranges: "orange",

  lemon: "lemon",
  lemons: "lemon",

  lime: "lime",
  limes: "lime",

  carrot: "carrot",
  carrots: "carrot",

  cucumber: "cucumber",
  cucumbers: "cucumber",

  jalapeno: "jalapeno",
  jalapenos: "jalapeno",
  jalapeño: "jalapeno",
  jalapeños: "jalapeno",

  // Bakery
  "hamburger bun": "hamburger bun",
  "hamburger buns": "hamburger bun",
  "burger bun": "hamburger bun",
  "burger buns": "hamburger bun",

  "hot dog bun": "hot dog bun",
  "hot dog buns": "hot dog bun",

  tortilla: "tortilla",
  tortillas: "tortilla",

  bagel: "bagel",
  bagels: "bagel",

  roll: "roll",
  rolls: "roll",

  // Cheddar cheese preparation wording
  cheddar: "cheddar cheese",
  "shredded cheddar": "cheddar cheese",
  "shredded cheddar cheese": "cheddar cheese",
  "cheddar shredded cheese": "cheddar cheese",
  "cheddar cheese shredded": "cheddar cheese",

  // Black beans
  "black bean": "black beans",
  "black beans": "black beans",

  "canned black bean": "canned black beans",
  "canned black beans": "canned black beans",
  "can of black beans": "canned black beans",

  "dry black bean": "dried black beans",
  "dry black beans": "dried black beans",
  "dried black bean": "dried black beans",
  "dried black beans": "dried black beans",

  // Common meats
  "chicken breast": "chicken breast",
  "chicken breasts": "chicken breast",

  "chicken thigh": "chicken thigh",
  "chicken thighs": "chicken thigh",

  "pork chop": "pork chop",
  "pork chops": "pork chop",
};

// Size words are safe to remove only for this curated set.
// We intentionally do not remove them from products such
// as eggs, packages, meat cuts, or beverages.
const SIZE_INSENSITIVE_PRODUCE = new Set([
  "onion",
  "yellow onion",
  "white onion",
  "red onion",
  "green onion",
  "bell pepper",
  "green bell pepper",
  "red bell pepper",
  "yellow bell pepper",
  "orange bell pepper",
  "potato",
  "sweet potato",
  "tomato",
  "avocado",
  "banana",
  "apple",
  "orange",
  "lemon",
  "lime",
  "carrot",
  "cucumber",
  "jalapeno",
]);

function cleanCanonicalCandidate(
  value: unknown,
): string {
  return normalizeText(value)
    .replace(/[(),]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function canonicalizeSmartShoppingName(
  value: unknown,
): string {
  const cleaned = cleanCanonicalCandidate(value);

  if (!cleaned) {
    return "";
  }

  const exactMatch =
    EXACT_NAME_ALIASES[cleaned] ?? cleaned;

  const sizeMatch = exactMatch.match(
    /^(small|medium|large|extra large)\s+(.+)$/,
  );

  if (!sizeMatch) {
    return exactMatch;
  }

  const nameWithoutSize =
    EXACT_NAME_ALIASES[sizeMatch[2]] ??
    sizeMatch[2];

  if (
    SIZE_INSENSITIVE_PRODUCE.has(
      nameWithoutSize,
    )
  ) {
    return nameWithoutSize;
  }

  return exactMatch;
}

// =====================================================
// Quantity and unit helpers
// =====================================================

const LEADING_QUANTITY_PATTERN =
  "(?:\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:\\.\\d+)?|½|¼|¾|⅓|⅔|⅛)";

const LEADING_UNIT_PATTERN =
  "(?:cups?|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|lbs?|pounds?|grams?|kg|ml|liters?|cloves?|cans?|packages?|pkg|pkgs|boxes?|slices?|sticks?|bunches?|jars?|cartons?|bags?|tubes?|packets?)";

function removeLeadingQuantity(value: string): string {
  return cleanSpacing(
    value
      .replace(
        new RegExp(
          `^${LEADING_QUANTITY_PATTERN}\\s+${LEADING_UNIT_PATTERN}\\s+`,
          "i",
        ),
        "",
      )
      .replace(
        new RegExp(`^${LEADING_QUANTITY_PATTERN}\\s+`, "i"),
        "",
      ),
  );
}

function normalizeUnit(value: unknown): string {
  const normalized = normalizeText(value).replace(/\./g, "");
  // Recipe-generated countable items may use this internal
  // marker, while manually entered countable items have no unit.
  // They represent the same shopping-unit type.
  if (normalized === "__count__") {
    return "";
  }

  const unitAliases: Record<string, string> = {
    cup: "cup",
    cups: "cup",

    tbsp: "Tbsp",
    tablespoon: "Tbsp",
    tablespoons: "Tbsp",

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

    ml: "ml",

    l: "l",
    liter: "l",
    liters: "l",

    clove: "clove",
    cloves: "clove",

    can: "can",
    cans: "can",

    package: "package",
    packages: "package",
    pkg: "package",
    pkgs: "package",

    box: "box",
    boxes: "box",

    slice: "slice",
    slices: "slice",

    stick: "stick",
    sticks: "stick",

    bunch: "bunch",
    bunches: "bunch",

    jar: "jar",
    jars: "jar",

    carton: "carton",
    cartons: "carton",

    bag: "bag",
    bags: "bag",

    tube: "tube",
    tubes: "tube",

    packet: "packet",
    packets: "packet",
  };

  return unitAliases[normalized] ?? normalized;
}

function pluralizeUnit(unit: string, quantity: number): string {
  if (!unit || Math.abs(quantity - 1) < 0.0001) {
    return unit;
  }

  const pluralUnits: Record<string, string> = {
    cup: "cups",
    Tbsp: "Tbsp",
    tsp: "tsp",
    oz: "oz",
    lb: "lbs",
    g: "g",
    kg: "kg",
    ml: "ml",
    l: "l",
    clove: "cloves",
    can: "cans",
    package: "packages",
    box: "boxes",
    slice: "slices",
    stick: "sticks",
    bunch: "bunches",
    jar: "jars",
    carton: "cartons",
    bag: "bags",
    tube: "tubes",
    packet: "packets",
  };

  return pluralUnits[unit] ?? unit;
}

function formatQuantity(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;

  if (Number.isInteger(rounded)) {
    return String(rounded);
  }

  const whole = Math.floor(rounded);
  const fraction = rounded - whole;

  const commonFractions: Array<[number, string]> = [
    [0.125, "1/8"],
    [0.25, "1/4"],
    [1 / 3, "1/3"],
    [0.5, "1/2"],
    [2 / 3, "2/3"],
    [0.75, "3/4"],
  ];

  const fractionMatch = commonFractions.find(
    ([amount]) => Math.abs(fraction - amount) < 0.02,
  );

  if (fractionMatch) {
    const fractionLabel = fractionMatch[1];

    return whole > 0
      ? `${whole} ${fractionLabel}`
      : fractionLabel;
  }

  return rounded.toFixed(2).replace(/\.?0+$/, "");
}

function getFiniteQuantity(
  item: SmartShoppingSourceItem,
): number | null {
  if (
    typeof item.quantity === "number" &&
    Number.isFinite(item.quantity)
  ) {
    return item.quantity;
  }

  return null;
}

// =====================================================
// Item-name selection
// Prefer structured shopping metadata when available.
// =====================================================

function getPreviewName(
  item: SmartShoppingSourceItem,
): string {
  const isManualItem =
    !cleanSpacing(item.sourceRecipe);

  // Manual text may contain important product-form wording
  // such as canned, dried, fresh, frozen, sliced, or shredded.
  //
  // Inspect the original text first so an older broad Smart
  // Shopping identity cannot erase that distinction.
  if (isManualItem) {
    const manualSource =
      cleanSpacing(item.text) ||
      cleanSpacing(item.displayText);

    if (manualSource) {
      return canonicalizeSmartShoppingName(
        removeLeadingQuantity(manualSource),
      );
    }
  }

  const structuredName =
    cleanSpacing(item.grocerySearchName) ||
    cleanSpacing(item.normalizedName);

  if (structuredName) {
    return canonicalizeSmartShoppingName(
      removeLeadingQuantity(structuredName),
    );
  }

  const displayFallback =
    cleanSpacing(item.displayText) ||
    cleanSpacing(item.text);

  return canonicalizeSmartShoppingName(
    removeLeadingQuantity(displayFallback),
  );
}

// =====================================================
// Stable signature
//
// This lets a future Apply button verify that the raw
// shopping list has not changed since preview creation.
// =====================================================

function normalizeSignatureItem(
  item: SmartShoppingSourceItem,
) {
  return {
    id: String(item.id || ""),
    text: String(item.text || ""),
    checked: Boolean(item.checked),
    addedAt: Number(item.addedAt || 0),
    category: item.category,
    sourceRecipe: String(item.sourceRecipe || ""),
    normalizedName: String(item.normalizedName || ""),
    quantity: getFiniteQuantity(item),
    unit: String(item.unit || ""),
    packageSize: String(item.packageSize || ""),
    displayText: String(item.displayText || ""),
    grocerySearchName: String(
      item.grocerySearchName || "",
    ),
    groceryNotes: String(item.groceryNotes || ""),
  };
}

export function buildShoppingListSignature(
  items: ShoppingItem[],
): string {
  return JSON.stringify(
    (items as SmartShoppingSourceItem[])
      .map(normalizeSignatureItem)
      .sort((first, second) =>
        first.id.localeCompare(second.id),
      ),
  );
}

export function isSmartShoppingPreviewCurrent(
  preview: SmartShoppingPreview,
  rawItems: ShoppingItem[],
): boolean {
  return (
    preview.baseSignature ===
    buildShoppingListSignature(rawItems)
  );
}

// =====================================================
// Small deterministic hash for preview-only IDs
// =====================================================

function hashText(value: string): string {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

// =====================================================
// Quantity preview
// =====================================================

function buildQuantityPreview(
  group: PreviewGroup,
): {
  text: string;
  status: SmartShoppingQuantityStatus;
} {
  const quantities =
    group.items.map(getFiniteQuantity);

  const knownQuantities = quantities.filter(
    (quantity): quantity is number =>
      quantity !== null,
  );

  const allQuantitiesKnown =
    knownQuantities.length ===
    group.items.length &&
    knownQuantities.length > 0;

  if (allQuantitiesKnown) {
    const total = knownQuantities.reduce(
      (sum, quantity) => sum + quantity,
      0,
    );

    const formattedTotal =
      formatQuantity(total);

    if (group.unit) {
      return {
        text: `${formattedTotal} ${pluralizeUnit(
          group.unit,
          total,
        )}`,
        status: "known",
      };
    }

    if (group.packageSize) {
      return {
        text: `${formattedTotal} · ${group.packageSize}`,
        status: "known",
      };
    }

    return {
      text: formattedTotal,
      status: "known",
    };
  }

  // Multiple entries without complete quantities may be
  // grouped for visibility, but their amount is unknown.
  if (group.items.length > 1) {
    return {
      text: "",
      status: "unknown",
    };
  }

  if (group.packageSize) {
    return {
      text: group.packageSize,
      status: "none",
    };
  }

  return {
    text: "",
    status: "none",
  };
}

// =====================================================
// Preview change descriptions
// =====================================================

function buildChanges(
  group: PreviewGroup,
  quantityStatus: SmartShoppingQuantityStatus,
): SmartShoppingChange[] {
  const changes: SmartShoppingChange[] = [];

  if (group.items.length > 1) {
    changes.push("combined");
  }

  const hasNormalizedDifference = group.items.some(
    (item) => {
      const originalFallback =
        cleanSpacing(item.normalizedName) ||
        cleanSpacing(item.grocerySearchName) ||
        removeLeadingQuantity(
          cleanSpacing(item.displayText) ||
          cleanSpacing(item.text),
        );

      return (
        normalizeText(originalFallback) !==
        group.normalizedName
      );
    },
  );

  if (hasNormalizedDifference) {
    changes.push("normalized");
  }

  if (quantityStatus === "known") {
    changes.push("quantity-separated");
  }

  const categoryChanged =
    group.items.some(
      (item) =>
        item.category !== group.category
    );

  if (categoryChanged) {
    changes.push("recategorized");
  }

  return changes;
}

function calculateConfidence(
  group: PreviewGroup,
): number {
  const allHaveStructuredNames = group.items.every(
    (item) =>
      Boolean(cleanSpacing(item.normalizedName)) ||
      Boolean(cleanSpacing(item.grocerySearchName)),
  );

  if (allHaveStructuredNames) {
    return group.items.length > 1 ? 0.99 : 1;
  }

  return group.items.length > 1 ? 0.94 : 0.9;
}

// =====================================================
// Preview builder
//
// Important:
// - No localStorage
// - No saveShoppingList
// - No Supabase
// - No network calls
// - No AI
// =====================================================

function resolveSmartShoppingCategory(
  normalizedName: string,
  unit: string,
  existingCategory: GroceryCategory,
): GroceryCategory {
  const name = normalizeText(normalizedName);
  const normalizedUnit = normalizeUnit(unit);

  // Meat terms must win over produce words such as
  // jalapeno, apple, or pepper appearing in a product name.
  if (
    name.includes("sausage") ||
    name.includes("ground beef") ||
    name.includes("chicken breast") ||
    name.includes("chicken thigh") ||
    name.includes("pork chop") ||
    name.includes("shrimp") ||
    name.includes("salmon") ||
    name.includes("tilapia")
  ) {
    return "Meat / Seafood" as GroceryCategory;
  }

  // Frozen products.
  if (
    name.includes("ice cream") ||
    name.includes("frozen pizza") ||
    name.includes("frozen vegetables")
  ) {
    return "Frozen" as GroceryCategory;
  }

  // Dairy and eggs.
  if (
    name === "butter" ||
    name === "egg" ||
    name === "eggs" ||
    name.includes("milk") ||
    name.includes("cheese") ||
    name.includes("yogurt")
  ) {
    return "Dairy / Eggs" as GroceryCategory;
  }

  // Canned produce shops in the pantry department.
  if (
    normalizedUnit === "can" &&
    (
      name.includes("corn") ||
      name.includes("bean") ||
      name.includes("tomato")
    )
  ) {
    return "Pantry" as GroceryCategory;
  }

  const categorized =
    categorizeGroceryItem(normalizedName);

  // Keep a useful existing category when the general
  // classifier can only produce an unknown fallback.
  if (
    String(categorized).toLowerCase() === "other" &&
    String(existingCategory).toLowerCase() !== "other"
  ) {
    return existingCategory;
  }

  return categorized;
}

export function buildSmartShoppingPreview(
  rawItems: ShoppingItem[],
): SmartShoppingPreview {
  const sourceItems =
    rawItems as SmartShoppingSourceItem[];

  const groups = new Map<string, PreviewGroup>();

  for (const item of sourceItems) {
    const normalizedName = getPreviewName(item);

    if (!normalizedName) {
      continue;
    }

    const unit = normalizeUnit(item.unit);
    const packageSize = normalizeText(item.packageSize);
    const proposedCategory =
      resolveSmartShoppingCategory(
        normalizedName,
        unit,
        item.category,
      );

    // Keep checked and unchecked items separate.
    // Keep categories separate so v1 does not guess that
    // two differently categorized products are identical.
    const sourceKind = cleanSpacing(
      item.sourceRecipe
    )
      ? "recipe"
      : "manual";

    const hasKnownQuantity =
      getFiniteQuantity(item) !== null;

    // Known-quantity items may safely match across manual
    // and recipe sources when their product identity, unit,
    // and package size agree.
    //
    // Unknown-quantity items remain separated by source type.
    // Manual unknown duplicates may still group together,
    // but they will not hide inside a measured recipe row.
    const sourceCompatibility =
      hasKnownQuantity
        ? "known-quantity"
        : sourceKind;

    const key = [
      item.checked ? "checked" : "unchecked",
      sourceCompatibility,
      normalizedName,
      unit,
      packageSize,
    ].join("|");

    const existingGroup = groups.get(key);

    if (existingGroup) {
      existingGroup.items.push(item);
      existingGroup.category = proposedCategory;
      continue;
    }

    groups.set(key, {
      key,
      normalizedName,
      category: proposedCategory,
      checked: Boolean(item.checked),
      unit,
      packageSize,
      items: [item],
    });
  }

  const previewItems = Array.from(groups.values())
    .map((group): SmartShoppingPreviewItem => {
      const quantityPreview =
        buildQuantityPreview(group);
      const thumbnail =
        resolveSmartShoppingThumbnail(
          group.normalizedName,
          group.category,
        );

      return {
        previewId: `smart-${hashText(group.key)}`,
        sourceIds: group.items.map((item) => item.id),
        originalTexts: group.items.map(
          (item) => item.text,
        ),

        normalizedName: group.normalizedName,
        displayName: formatDisplayName(
          group.normalizedName,
        ),
        quantityText: quantityPreview.text,
        quantityStatus: quantityPreview.status,
        category: group.category,

        thumbnailKey: thumbnail.thumbnailKey,
        thumbnailMatchType: thumbnail.matchType,
        thumbnailAltText: thumbnail.altText,

        checked: group.checked,
        changes: buildChanges(
          group,
          quantityPreview.status,
        ),
        confidence: calculateConfidence(group),
      };
    })
    .sort((first, second) => {
      const categoryComparison =
        String(first.category).localeCompare(
          String(second.category),
        );

      if (categoryComparison !== 0) {
        return categoryComparison;
      }

      return first.displayName.localeCompare(
        second.displayName,
      );
    });

  return {
    version: 1,
    baseSignature:
      buildShoppingListSignature(rawItems),

    originalItemCount: rawItems.length,
    proposedItemCount: previewItems.length,
    combinedEntryCount: Math.max(
      0,
      rawItems.length - previewItems.length,
    ),

    items: previewItems,
  };
}

// =====================================================
// Apply-plan helpers
//
// These functions only calculate a proposed raw snapshot.
// They do not write to storage, dispatch events, or sync.
// =====================================================

function cloneShoppingItems(
  items: ShoppingItem[],
): ShoppingItem[] {
  return items.map((item) => ({ ...item }));
}

function buildPreviewItemBySourceId(
  preview: SmartShoppingPreview,
): Map<string, SmartShoppingPreviewItem> {
  const previewBySourceId = new Map<
    string,
    SmartShoppingPreviewItem
  >();

  for (const previewItem of preview.items) {
    for (const sourceId of previewItem.sourceIds) {
      previewBySourceId.set(
        sourceId,
        previewItem,
      );
    }
  }

  return previewBySourceId;
}

function didSmartShoppingItemChange(
  before: SmartShoppingSourceItem,
  after: SmartShoppingSourceItem,
): boolean {
  return (
    normalizeText(before.normalizedName) !==
    normalizeText(after.normalizedName) ||
    normalizeText(before.grocerySearchName) !==
    normalizeText(after.grocerySearchName) ||
    before.category !== after.category
  );
}

export function buildSmartShoppingApplyPlan(
  preview: SmartShoppingPreview,
  rawItems: ShoppingItem[],
): SmartShoppingApplyPlan {
  const originalItems =
    cloneShoppingItems(rawItems);

  const beforeSignature =
    buildShoppingListSignature(originalItems);

  // Never build an Apply plan from an outdated preview.
  if (
    !isSmartShoppingPreviewCurrent(
      preview,
      originalItems,
    )
  ) {
    return {
      version: 1,

      canApply: false,
      reason: "stale-preview",

      beforeSignature,
      afterSignature: beforeSignature,

      sourceItemCount: originalItems.length,
      changedItemCount: 0,

      originalItems,
      nextItems: cloneShoppingItems(
        originalItems,
      ),
    };
  }

  const previewBySourceId =
    buildPreviewItemBySourceId(preview);

  const currentIds = new Set(
    originalItems.map((item) => item.id),
  );

  const previewSourceIds = preview.items.flatMap(
    (item) => item.sourceIds,
  );

  const hasMissingSourceItems =
    previewSourceIds.some(
      (sourceId) => !currentIds.has(sourceId),
    );

  if (hasMissingSourceItems) {
    return {
      version: 1,

      canApply: false,
      reason: "missing-items",

      beforeSignature,
      afterSignature: beforeSignature,

      sourceItemCount: originalItems.length,
      changedItemCount: 0,

      originalItems,
      nextItems: cloneShoppingItems(
        originalItems,
      ),
    };
  }

  let changedItemCount = 0;

  const nextItems = originalItems.map(
    (rawItem): ShoppingItem => {
      const sourceItem =
        rawItem as SmartShoppingSourceItem;

      const previewItem =
        previewBySourceId.get(rawItem.id);

      if (!previewItem) {
        return { ...rawItem };
      }

      // Preserve the raw ingredient text and quantity details.
      //
      // Updating the normalized shopping identity allows
      // the existing shopping-list display layer to combine
      // matching items without destroying recipe provenance.
      const nextItem: SmartShoppingSourceItem = {
        ...sourceItem,

        normalizedName:
          previewItem.normalizedName,

        grocerySearchName:
          previewItem.normalizedName,

        category: previewItem.category,
      };

      if (
        didSmartShoppingItemChange(
          sourceItem,
          nextItem,
        )
      ) {
        changedItemCount += 1;
      }

      return nextItem as ShoppingItem;
    },
  );

  const afterSignature =
    buildShoppingListSignature(nextItems);

  const hasChanges =
    changedItemCount > 0 &&
    beforeSignature !== afterSignature;

  return {
    version: 1,

    canApply: hasChanges,
    reason: hasChanges
      ? "ready"
      : "no-changes",

    beforeSignature,
    afterSignature,

    sourceItemCount: originalItems.length,
    changedItemCount,

    originalItems,
    nextItems,
  };
}