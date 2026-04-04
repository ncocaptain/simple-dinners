import { categorizeGroceryItem, type GroceryCategory } from "./core/groceryCategories";

// =====================================================
// Builder: shopping list item type
// =====================================================
export type ShoppingItem = {
  id: string;
  text: string;
  checked: boolean;
  addedAt: number;
  category: GroceryCategory;
  sourceRecipe?: string;

  // smart merge helpers
  normalizedName?: string;
  quantity?: number | null;
  unit?: string;
};

const KEY = "simple-dinners.shoppingList.v1";

// =====================================================
// Builder: safe localStorage parsing
// =====================================================
function safeParse(json: string | null): ShoppingItem[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// =====================================================
// Builder: deterministic-ish item id
// =====================================================
function makeId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// =====================================================
// Builder: number helpers
// =====================================================
function parseFraction(value: string): number | null {
  const cleaned = value.trim();

  if (!cleaned) return null;

  const unicodeFractions: Record<string, number> = {
    "½": 0.5,
    "¼": 0.25,
    "¾": 0.75,
    "⅓": 1 / 3,
    "⅔": 2 / 3,
    "⅛": 0.125,
  };

  if (unicodeFractions[cleaned] !== undefined) {
    return unicodeFractions[cleaned];
  }

  if (/^\d+\s+\d+\/\d+$/.test(cleaned)) {
    const [whole, frac] = cleaned.split(" ");
    const [num, den] = frac.split("/").map(Number);
    if (!den) return null;
    return Number(whole) + num / den;
  }

  if (/^\d+\/\d+$/.test(cleaned)) {
    const [num, den] = cleaned.split("/").map(Number);
    if (!den) return null;
    return num / den;
  }

  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function formatQuantity(value: number | null | undefined) {
  if (value === null || value === undefined) return "";

  const rounded = Math.round(value * 100) / 100;

  const commonFractions: Record<number, string> = {
    0.125: "1/8",
    0.25: "1/4",
    0.333: "1/3",
    0.5: "1/2",
    0.667: "2/3",
    0.75: "3/4",
  };

  const whole = Math.floor(rounded);
  const fraction = Math.round((rounded - whole) * 1000) / 1000;

  const fractionKey = Math.round(fraction * 1000) / 1000;
  const matchedFraction =
    commonFractions[Number(fractionKey.toFixed(3))] ??
    commonFractions[Number(fraction.toFixed(3))];

  if (whole > 0 && matchedFraction) {
    return `${whole} ${matchedFraction}`;
  }

  if (whole === 0 && matchedFraction) {
    return matchedFraction;
  }

  if (Number.isInteger(rounded)) {
    return String(rounded);
  }

  return String(rounded);
}

// =====================================================
// Builder: unit helpers
// =====================================================
function normalizeUnit(unit?: string) {
  const value = String(unit || "").trim().toLowerCase();
  if (!value) return "";

  const map: Record<string, string> = {
    cup: "cup",
    cups: "cup",
    Tbsp: "Tbsp",
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
    clove: "clove",
    cloves: "clove",
    can: "can",
    cans: "can",
    package: "package",
    packages: "package",
    slice: "slice",
    slices: "slice",
  };

  return map[value] || value;
}

function pluralizeUnit(unit: string, quantity: number | null | undefined) {
  if (!unit) return "";
  if (quantity === null || quantity === undefined) return unit;
  if (Math.abs(quantity - 1) < 0.0001) return unit;

  const pluralMap: Record<string, string> = {
    cup: "cups",
    Tbsp: "Tbsp",
    tsp: "tsp",
    oz: "oz",
    lb: "lbs",
    clove: "cloves",
    can: "cans",
    package: "packages",
    slice: "slices",
  };

  return pluralMap[unit] || unit;
}

// =====================================================
// Builder: category cleanup
// =====================================================
function cleanIngredientForCategory(line: string) {
  let text = String(line || "").toLowerCase().trim();

  text = text.replace(/\([^)]*\)/g, " ");
  text = text.replace(/^[-•*]\s*/, "");
  text = text.replace(/<[^>]+>/g, " ");

  const removePhrases = [
    "to taste",
    "as needed",
    "optional",
    "for garnish",
    "plus more for garnish",
    "divided",
    "stems removed",
    "seeds removed",
    "for topping",
    "for serving",
    "plus more",
  ];

  removePhrases.forEach((phrase) => {
    text = text.replaceAll(phrase, " ");
  });

  const removeWords = [
    "small",
    "medium",
    "large",
    "extra-large",
    "fresh",
    "freshly",
    "thin",
    "thinly",
    "thick",
    "thickly",
    "finely",
    "roughly",
    "chopped",
    "diced",
    "minced",
    "sliced",
    "halved",
    "cubed",
    "shredded",
    "grated",
    "peeled",
    "crushed",
    "softened",
    "melted",
    "beaten",
    "drained",
    "rinsed",
    "packed",
    "whole",
    "boneless",
    "skinless",
    "lean",
  ];

  removeWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    text = text.replace(regex, " ");
  });

  text = text.replace(/\bcans?\s+of\s+/g, " ");
  text = text.replace(/\bcans?\s+/g, " ");
  text = text.replace(/^[/\\\-–—]+\s*/, "");
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

// =====================================================
// Builder: normalize ingredient lines
// =====================================================
export function normalizeIngredientLines(ingredients: string): string[] {
  return String(ingredients)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/•/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\n{2,}/g, "\n")
    .split("\n")
    .map((l) => l.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean)
    .filter((l) => !/^\s*for\s+garnish\s*:?\s*$/i.test(l));
}

// =====================================================
// Builder: normalize display name
// =====================================================
function normalizeIngredientName(line: string) {
  let text = String(line || "").toLowerCase().trim();

  text = text.replace(/\([^)]*\)/g, " ");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/^[-•*]\s*/, "");
  text = text.replace(/^[/\\\-–—]+\s*/, "");
  text = text.replace(/\u00a0/g, " ");

  if (/^\s*for\s+.+$/i.test(text)) return "";
  if (/^\s*[:;,./-]+\s*$/i.test(text)) return "";

  const junkPhrases = [
    "to taste",
    "as needed",
    "optional",
    "for garnish",
    "for serving",
    "for topping",
    "plus more",
    "plus more for garnish",
    "divided",
  ];

  junkPhrases.forEach((phrase) => {
    text = text.replaceAll(phrase, " ");
  });

  const prepWords = [
    "small",
    "medium",
    "large",
    "extra-large",
    "fresh",
    "freshly",
    "thin",
    "thinly",
    "thick",
    "thickly",
    "finely",
    "roughly",
    "chopped",
    "diced",
    "minced",
    "sliced",
    "halved",
    "cubed",
    "shredded",
    "grated",
    "peeled",
    "crushed",
    "softened",
    "melted",
    "beaten",
    "drained",
    "rinsed",
    "packed",
    "whole",
    "boneless",
    "skinless",
  ];

  prepWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    text = text.replace(regex, " ");
  });

  text = text.replace(/\bcans?\s+of\s+/g, " ");
  text = text.replace(/\bcans?\s+/g, " ");
  text = text.replace(/\bcan\s+/g, " ");

  // strip leading quantity chunks repeatedly
  let changed = true;
  while (changed) {
    const before = text;

    text = text.replace(
      /^\s*(\d+([./]\d+)?|\d+\s+\d+\/\d+|½|¼|¾|⅓|⅔|⅛)\s*/i,
      ""
    );

    text = text.replace(
      /^\s*(cup|cups|Tbsp|tsp|teaspoon|teaspoons|tablespoon|tablespoons|oz|ounce|ounces|lb|lbs|pound|pounds|g|kg|ml|l|clove|cloves|can|cans|package|packages|slice|slices)\b\s*/i,
      ""
    );

    changed = before !== text;
  }

  // normalize common variants
  text = text.replace(/\blean ground beef\b/g, "ground beef");
  text = text.replace(/\bextra lean ground beef\b/g, "ground beef");
  text = text.replace(/\bground black pepper\b/g, "black pepper");
  text = text.replace(/\bonion powders?\b/g, "onion powder");
  text = text.replace(/\bgarlic powders?\b/g, "garlic powder");
  text = text.replace(/\bslices?\s+bread\b/g, "bread");
  text = text.replace(/\bbaby bella mushrooms?\b/g, "cremini mushrooms");
  text = text.replace(/\bcremini mushrooms?\b/g, "cremini mushrooms");
  text = text.replace(/\bgarlic cloves?\b/g, "garlic");
  text = text.replace(/\beggs?\b/g, "egg");
  text = text.replace(/\bonions?\b/g, "onion");
  text = text.replace(/\bcarrots?\b/g, "carrot");

  text = text.replace(/\s*\/\s*/g, " / ");
  text = text.replace(/\s+/g, " ").trim();

  if (!text || text.length < 2) return "";
  if (/^[^a-z]+$/i.test(text)) return "";

  return text;
}

// =====================================================
// Builder: parse quantity + unit + normalized name
// =====================================================
function parseIngredientParts(line: string): {
  normalizedName: string;
  quantity: number | null;
  unit: string;
} {
  let text = String(line || "").toLowerCase().trim();

  text = text.replace(/\([^)]*\)/g, " ");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/^[-•*]\s*/, "");
  text = text.replace(/^[/\\\-–—]+\s*/, "");
  text = text.replace(/\u00a0/g, " ");
  text = text.replace(/\s+/g, " ").trim();

  let quantity: number | null = null;
  let unit = "";

  const quantityMatch = text.match(
    /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+\.\d+|\d+|½|¼|¾|⅓|⅔|⅛)\b/
  );

  if (quantityMatch) {
    quantity = parseFraction(quantityMatch[1]);
    text = text.slice(quantityMatch[0].length).trim();
  }

  const unitMatch = text.match(
    /^(cup|cups|Tbsp|tsp|teaspoon|teaspoons|tablespoon|tablespoons|oz|ounce|ounces|lb|lbs|pound|pounds|g|kg|ml|l|clove|cloves|can|cans|package|packages|slice|slices)\b/
  );

  if (unitMatch) {
    unit = normalizeUnit(unitMatch[1]);
    text = text.slice(unitMatch[0].length).trim();
  }

  const normalizedName = normalizeIngredientName(text);

  return {
    normalizedName,
    quantity,
    unit,
  };
}

// =====================================================
// Builder: display text from parsed parts
// =====================================================
function buildDisplayText(
  normalizedName: string,
  quantity: number | null,
  unit: string
) {
  if (!normalizedName) return "";

  if (quantity !== null) {
    const qty = formatQuantity(quantity);

    if (unit) {
      return `${qty} ${pluralizeUnit(unit, quantity)} ${normalizedName}`.trim();
    }

    // natural count nouns
    if (normalizedName === "onion") {
      return `${qty} ${Math.abs(quantity - 1) < 0.0001 ? "onion" : "onions"}`;
    }

    if (normalizedName === "carrot") {
      return `${qty} ${Math.abs(quantity - 1) < 0.0001 ? "carrot" : "carrots"}`;
    }

    if (normalizedName === "egg") {
      return `${qty} ${Math.abs(quantity - 1) < 0.0001 ? "egg" : "eggs"}`;
    }

    return `${qty} ${normalizedName}`.trim();
  }

  if (normalizedName === "egg") return "eggs";
  if (normalizedName === "carrot") return "carrots";
  if (normalizedName === "onion") return "onions";

  return normalizedName;
}

// =====================================================
// Builder: load list with backward compatibility
// =====================================================
export function loadShoppingList(): ShoppingItem[] {
  const items = safeParse(localStorage.getItem(KEY));

  return items
    .map((item: any) => {
      const parsed = parseIngredientParts(item.text || "");
      const normalizedName =
        item.normalizedName || parsed.normalizedName || normalizeIngredientName(item.text || "");

      if (!normalizedName) return null;

      const quantity =
        typeof item.quantity === "number" ? item.quantity : parsed.quantity;
      const unit = item.unit || parsed.unit || "";

      return {
        ...item,
        id:
          item.id ||
          `${makeId(normalizedName)}-${item.sourceRecipe || "item"}-${item.addedAt || 0}`,
        text: buildDisplayText(normalizedName, quantity, unit),
        normalizedName,
        quantity,
        unit,
        category: categorizeGroceryItem(cleanIngredientForCategory(normalizedName)),
        sourceRecipe: item.sourceRecipe || "",
      } as ShoppingItem;
    })
    .filter(Boolean) as ShoppingItem[];
}

// =====================================================
// Builder: save list
// =====================================================
export function saveShoppingList(items: ShoppingItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

// =====================================================
// Builder: add recipe ingredients to shopping list
// =====================================================
export function addIngredientsToList(
  recipeName: string,
  ingredients: string
): { items: ShoppingItem[]; addedCount: number } {
  const existing = loadShoppingList();
  const lines = normalizeIngredientLines(ingredients);

  const now = Date.now();
  const newItems: ShoppingItem[] = [];

  for (const line of lines) {
    const parsed = parseIngredientParts(line);
    if (!parsed.normalizedName) continue;

    // keep items separate per recipe/line so UI can merge/count later
    const id = `${makeId(parsed.normalizedName)}-${makeId(recipeName || "recipe")}-${makeId(
      line
    )}-${now}-${newItems.length}`;

    const text = buildDisplayText(
      parsed.normalizedName,
      parsed.quantity,
      parsed.unit
    );

    newItems.push({
      id,
      text,
      checked: false,
      addedAt: now,
      category: categorizeGroceryItem(
        cleanIngredientForCategory(parsed.normalizedName)
      ),
      sourceRecipe: recipeName || "",
      normalizedName: parsed.normalizedName,
      quantity: parsed.quantity,
      unit: parsed.unit,
    });
  }

  const merged = [...existing, ...newItems];
  saveShoppingList(merged);

  return { items: merged, addedCount: newItems.length };
}