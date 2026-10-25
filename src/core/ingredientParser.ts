export const INGREDIENT_QUANTITY_PATTERN =
  "\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+\\.\\d+|\\d+|½|¼|¾|⅓|⅔|⅛|⅜|⅝|⅞";

export const INGREDIENT_UNIT_PATTERN =
  "cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|oz|ounce|ounces|lb|lbs|pound|pounds|g|gram|grams|kg|kilogram|kilograms|ml|milliliter|milliliters|l|liter|liters|clove|cloves|can|cans|package|packages|pkg|pkgs|box|boxes|strip|strips|slice|slices|stick|sticks|bunch|bunches|head|heads|jar|jars|carton|cartons|bag|bags|tube|tubes|packet|packets|loaf|loaves|piece|pieces";

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
  kilogram: "kg",
  kilograms: "kg",
  ml: "ml",
  milliliter: "ml",
  milliliters: "ml",
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
  strip: "strip",
  strips: "strip",
  slice: "slice",
  slices: "slice",
  stick: "stick",
  sticks: "stick",
  bunch: "bunch",
  bunches: "bunch",
  head: "head",
  heads: "head",
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
  loaf: "loaf",
  loaves: "loaf",
  piece: "piece",
  pieces: "piece",
};

const IDENTITY_DESCRIPTORS = new Set([
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

const SECTION_HEADER_PATTERNS = [
  /seasoning:?$/i,
  /^sauce:?$/i,
  /glaze:?$/i,
  /topping:?$/i,
  /toppings:?$/i,
  /marinade:?$/i,
  /dressing:?$/i,
  /filling:?$/i,
  /quick chili topping:?$/i,
  /^for .+:?$/i,
  /^main(?: dish)?:?$/i,
  /^optional:?$/i,
];

function normalizeAscii(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[’]/g, "'")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function singularizeWord(word: string) {
  if (word.endsWith("ies") && word.length > 4) {
    return `${word.slice(0, -3)}y`;
  }

  if (word.endsWith("oes") && word.length > 4) {
    return word.slice(0, -2);
  }

  if (word.endsWith("ses") && word.length > 4) {
    return word.slice(0, -1);
  }

  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3) {
    return word.slice(0, -1);
  }

  return word;
}

export function parseIngredientQuantity(value: string): number | null {
  const cleaned = String(value || "").trim();
  if (!cleaned) return null;

  if (UNICODE_FRACTIONS[cleaned] !== undefined) {
    return UNICODE_FRACTIONS[cleaned];
  }

  const mixed = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const numerator = Number(mixed[2]);
    const denominator = Number(mixed[3]);
    return denominator ? whole + numerator / denominator : null;
  }

  const fraction = cleaned.match(/^(\d+)\/(\d+)$/);
  if (fraction) {
    const numerator = Number(fraction[1]);
    const denominator = Number(fraction[2]);
    return denominator ? numerator / denominator : null;
  }

  const numberValue = Number(cleaned);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export function normalizeIngredientUnit(
  value: string | null | undefined
): string | null {
  const cleaned = String(value || "").trim().toLowerCase();
  if (!cleaned) return null;
  return UNIT_ALIASES[cleaned] || cleaned;
}

export function isIngredientSectionHeader(value: string) {
  const raw = String(value || "").trim();
  if (!raw) return true;

  if (raw.endsWith(":") && !/\d/.test(raw)) {
    return true;
  }

  const cleaned = normalizeAscii(raw).replace(/[:;,]+$/g, "");
  return SECTION_HEADER_PATTERNS.some((pattern) => pattern.test(cleaned));
}

export function isOptionalIngredientLine(value: string) {
  return /\boptional\b|\bopcional\b/i.test(String(value || ""));
}

export function splitIngredientLines(
  ingredients: string,
  options: { includeOptional?: boolean } = {}
) {
  const includeOptional = options.includeOptional ?? true;

  return String(ingredients || "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !isIngredientSectionHeader(line))
    .filter((line) => includeOptional || !isOptionalIngredientLine(line));
}

function normalizePackageSize(value: string) {
  const cleaned = normalizeAscii(value)
    .replace(/(\d)(oz|ounce|ounces|lb|lbs|pound|pounds|g|kg|ml|l)\b/g, "$1 $2")
    .replace(/ounces?\b/g, "oz")
    .replace(/pounds?\b/g, "lb")
    .replace(/\blbs?\b/g, "lb")
    .replace(/\s+/g, " ")
    .trim();

  return /\b\d+(?:\.\d+)?\s*(?:oz|lb|g|kg|ml|l)\b/i.test(cleaned)
    ? cleaned
    : "";
}

export function normalizeIngredientIdentity(value: string) {
  const source = normalizeAscii(value);

  const preservedForm =
    /\bfire[- ]roasted\s+diced\s+tomatoes?\b/.test(source)
      ? "fire-roasted-diced"
      : /\bdiced\s+tomatoes?\b/.test(source)
        ? "diced"
        : /\bminced\s+garlic\b/.test(source)
          ? "minced"
          : "";

  const normalized = source
    .replace(/\([^)]*\)/g, " ")
    .replace(/,?\s*(?:to taste|as needed|optional|opcional|divided)\b.*$/i, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .filter((word) => !IDENTITY_DESCRIPTORS.has(word))
    .filter((word) => !UNIT_ALIASES[word])
    .map(singularizeWord)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return "";

  return preservedForm ? `${preservedForm} ${normalized}` : normalized;
}

export type ParsedIngredientLine = {
  raw: string;
  quantity: number | null;
  quantityMax: number | null;
  isRange: boolean;
  unit: string | null;
  packageSize: string;
  nameText: string;
  normalizedName: string;
  optional: boolean;
  sectionHeader: boolean;
};

export function parseIngredientLine(value: string): ParsedIngredientLine {
  const raw = String(value || "").trim();
  const sectionHeader = isIngredientSectionHeader(raw);
  const optional = isOptionalIngredientLine(raw);

  if (!raw || sectionHeader) {
    return {
      raw,
      quantity: null,
      quantityMax: null,
      isRange: false,
      unit: null,
      packageSize: "",
      nameText: "",
      normalizedName: "",
      optional,
      sectionHeader,
    };
  }

  let text = normalizeAscii(raw)
    .replace(/^[-•*]+\s*/, "")
    .replace(/^[/\\\-–—]+\s*/, "")
    .replace(/^about\s+/i, "")
    .trim();

  let packageSize = "";
  const sizeMatch = text.match(/\(([^)]+)\)/);
  if (sizeMatch) {
    packageSize = normalizePackageSize(sizeMatch[1]);
    if (packageSize) {
      text = text.replace(sizeMatch[0], " ").replace(/\s+/g, " ").trim();
    }
  }

  let quantity: number | null = null;
  let quantityMax: number | null = null;
  let isRange = false;

  const rangeMatch = text.match(
    new RegExp(
      `^(${INGREDIENT_QUANTITY_PATTERN})\\s*(?:-|–|—|to)\\s*(${INGREDIENT_QUANTITY_PATTERN})(?=\\s|$)`,
      "i"
    )
  );

  if (rangeMatch) {
    quantity = parseIngredientQuantity(rangeMatch[1]);
    quantityMax = parseIngredientQuantity(rangeMatch[2]);
    isRange = true;
    text = text.slice(rangeMatch[0].length).trim();
  } else {
    const quantityMatch = text.match(
      new RegExp(`^(${INGREDIENT_QUANTITY_PATTERN})(?=\\s|\\(|$)`, "i")
    );

    if (quantityMatch) {
      quantity = parseIngredientQuantity(quantityMatch[1]);
      quantityMax = quantity;
      text = text.slice(quantityMatch[0].length).trim();
    }
  }

  const unitMatch = text.match(
    new RegExp(`^(${INGREDIENT_UNIT_PATTERN})\\b`, "i")
  );

  let unit: string | null = null;
  if (unitMatch) {
    unit = normalizeIngredientUnit(unitMatch[1]);
    text = text.slice(unitMatch[0].length).trim();
  }

  const nameText = text
    .replace(/,?\s*(?:optional|opcional)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    raw,
    quantity,
    quantityMax,
    isRange,
    unit,
    packageSize,
    nameText,
    normalizedName: normalizeIngredientIdentity(nameText),
    optional,
    sectionHeader,
  };
}
