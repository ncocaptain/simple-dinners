export type RecipeScale = 0.5 | 1 | 2;

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

const INSTRUCTION_SAFE_UNITS = [
  "cup",
  "cups",
  "tbsp",
  "tablespoon",
  "tablespoons",
  "tsp",
  "teaspoon",
  "teaspoons",
  "oz",
  "ounce",
  "ounces",
  "lb",
  "lbs",
  "pound",
  "pounds",
  "g",
  "gram",
  "grams",
  "kg",
  "ml",
  "l",
  "liter",
  "liters",
];

const DO_NOT_SCALE_UNITS = [
  "minute",
  "minutes",
  "min",
  "mins",
  "hour",
  "hours",
  "hr",
  "hrs",
  "second",
  "seconds",
  "sec",
  "secs",
  "degree",
  "degrees",
  "f",
  "c",
];

const UNIT_GRAMMAR = [
  { singular: "cup", plural: "cups" },
  { singular: "tablespoon", plural: "tablespoons" },
  { singular: "teaspoon", plural: "teaspoons" },
  { singular: "ounce", plural: "ounces" },
  { singular: "pound", plural: "pounds" },
  { singular: "gram", plural: "grams" },
  { singular: "liter", plural: "liters" },

  // Abbreviations stay the same.
  { singular: "tbsp", plural: "tbsp" },
  { singular: "tsp", plural: "tsp" },
  { singular: "oz", plural: "oz" },
  { singular: "lb", plural: "lb" },
  { singular: "lbs", plural: "lbs" },
  { singular: "g", plural: "g" },
  { singular: "kg", plural: "kg" },
  { singular: "ml", plural: "ml" },
  { singular: "l", plural: "l" },
];

const COUNTABLE_ITEMS = [
  { singular: "egg", plural: "eggs" },
  { singular: "onion", plural: "onions" },
  { singular: "pepper", plural: "peppers" },
  { singular: "potato", plural: "potatoes" },
  { singular: "carrot", plural: "carrots" },
  { singular: "clove", plural: "cloves" },
  { singular: "sausage", plural: "sausages" },
  { singular: "scallop", plural: "scallops" },
  { singular: "fillet", plural: "fillets" },
{ singular: "filet", plural: "filets" },
  { singular: "tortilla", plural: "tortillas" },
  { singular: "flatbread", plural: "flatbreads" },
  { singular: "naan", plural: "naan" },
  { singular: "pita", plural: "pitas" },
  { singular: "bun", plural: "buns" },
  { singular: "roll", plural: "rolls" },
  { singular: "slice", plural: "slices" },
  { singular: "can", plural: "cans" },
  { singular: "package", plural: "packages" },
  { singular: "packet", plural: "packets" },
  { singular: "bag", plural: "bags" },
  { singular: "jar", plural: "jars" },
];

const COUNTABLE_DESCRIPTORS = [
  "small",
  "medium",
  "large",
  "whole",
  "fresh",
  "ripe",
  "beaten",
  "chopped",
  "diced",
  "sliced",
  "minced",
  "green",
"red",
"yellow",
"bell",
"jalapeño",
"jalapeno",
"smoked",
"sea",
"salmon",
  "shredded",
  "cooked",
  "large-sized",
  "medium-sized",
  "small-sized",
];

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function roundToNearestEighth(value: number) {
  return Math.round(value * 8) / 8;
}

function formatScaledNumber(value: number) {
  const rounded = roundToNearestEighth(value);

  if (Number.isInteger(rounded)) {
    return String(rounded);
  }

  const whole = Math.floor(rounded);
  const fraction = rounded - whole;

  const denominator = 8;
  const numerator = Math.round(fraction * denominator);
  const divisor = gcd(numerator, denominator);

  const simpleNumerator = numerator / divisor;
  const simpleDenominator = denominator / divisor;

  if (whole === 0) {
    return `${simpleNumerator}/${simpleDenominator}`;
  }

  return `${whole} ${simpleNumerator}/${simpleDenominator}`;
}

function parseQuantity(raw: string): number | null {
  const value = raw.trim();

  if (!value) return null;

  if (UNICODE_FRACTIONS[value] !== undefined) {
    return UNICODE_FRACTIONS[value];
  }

  const mixedMatch = value.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = Number(mixedMatch[1]);
    const numerator = Number(mixedMatch[2]);
    const denominator = Number(mixedMatch[3]);

    if (!denominator) return null;

    return whole + numerator / denominator;
  }

  const fractionMatch = value.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);

    if (!denominator) return null;

    return numerator / denominator;
  }

  const numberValue = Number(value);

  if (Number.isFinite(numberValue)) {
    return numberValue;
  }

  return null;
}

function scaleQuantityText(raw: string, scale: RecipeScale) {
  const parsed = parseQuantity(raw);

  if (parsed === null) return raw;

  return formatScaledNumber(parsed * scale);
}

function preserveCapitalization(original: string, replacement: string) {
  if (original === original.toUpperCase()) {
    return replacement.toUpperCase();
  }

  if (original[0] === original[0]?.toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }

  return replacement;
}

function normalizeMeasurementUnitGrammar(text: string) {
  const unitPattern = UNIT_GRAMMAR.flatMap((unit) => [
    unit.singular,
    unit.plural,
  ])
    .map((unit) => unit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  const quantityUnitRegex = new RegExp(
    `\\b((?:\\d+\\s+\\d+\\/\\d+)|(?:\\d+\\/\\d+)|(?:\\d+(?:\\.\\d+)?))\\s+(${unitPattern})\\b`,
    "gi"
  );

  return text.replace(quantityUnitRegex, (match, amount, unit) => {
    const parsedAmount = parseQuantity(amount);

    if (parsedAmount === null) return match;

    const found = UNIT_GRAMMAR.find(
      (entry) =>
        entry.singular.toLowerCase() === unit.toLowerCase() ||
        entry.plural.toLowerCase() === unit.toLowerCase()
    );

    if (!found) return match;

    // Abbreviations like tbsp, tsp, oz, lb stay as written.
    if (found.singular === found.plural) {
      return `${amount} ${unit}`;
    }

    const nextUnit = parsedAmount <= 1 ? found.singular : found.plural;

    return `${amount} ${preserveCapitalization(unit, nextUnit)}`;
  });
}

function protectParentheses(text: string) {
  const protectedParts: string[] = [];

  const protectedText = text.replace(/\([^)]*\)/g, (match) => {
    const token = `__PAREN_${protectedParts.length}__`;
    protectedParts.push(match);
    return token;
  });

  return {
    protectedText,
    restore(value: string) {
      return protectedParts.reduce((result, part, index) => {
        const token = `__PAREN_${index}__`;
        return result.split(token).join(part);
      }, value);
    },
  };
}

function getUnitPattern(units: string[]) {
  return units
    .map((unit) => unit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
}

function getCountableItemPattern() {
  return COUNTABLE_ITEMS.flatMap((item) => [item.singular, item.plural])
    .map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
}

function getDescriptorPattern() {
  return COUNTABLE_DESCRIPTORS.map((item) =>
    item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  ).join("|");
}

function normalizeCountableItem(item: string, amount: number) {
  const found = COUNTABLE_ITEMS.find(
    (entry) =>
      entry.singular.toLowerCase() === item.toLowerCase() ||
      entry.plural.toLowerCase() === item.toLowerCase()
  );

  if (!found) return item;

  return amount <= 1 ? found.singular : found.plural;
}

function pluralizeCountableQuantityText(text: string) {
  const itemPattern = getCountableItemPattern();
  const descriptorPattern = getDescriptorPattern();

  const countableRegex = new RegExp(
  `\\b((?:\\d+\\s+\\d+\\/\\d+)|(?:\\d+\\/\\d+)|(?:\\d+(?:\\.\\d)?\\d*)|[${Object.keys(
    UNICODE_FRACTIONS
  ).join("")}])\\s+((?:(?:${descriptorPattern})\\s+)*)(${itemPattern})\\b`,
  "gi"
);

  return text.replace(countableRegex, (match, amount, descriptors, item) => {
    const parsedAmount = parseQuantity(amount);

    if (parsedAmount === null) return match;

    const normalizedItem = normalizeCountableItem(item, parsedAmount);

    return `${amount} ${descriptors || ""}${normalizedItem}`;
  });
}

function scaleCountableInstructionItems(text: string, scale: RecipeScale) {
  const itemPattern = getCountableItemPattern();
  const descriptorPattern = getDescriptorPattern();

  const countableRegex = new RegExp(
    `\\b((?:\\d+\\s+\\d+\\/\\d+)|(?:\\d+\\/\\d+)|(?:\\d+(?:\\.\\d+)?))\\s+((?:(?:${descriptorPattern})\\s+)*)(${itemPattern})\\b`,
    "gi"
  );

  return text.replace(countableRegex, (match, amount, descriptors, item) => {
    const parsedAmount = parseQuantity(amount);

    if (parsedAmount === null) return match;

    const scaledAmountNumber = parsedAmount * scale;
    const scaledAmountText = formatScaledNumber(scaledAmountNumber);
    const scaledItem = normalizeCountableItem(item, scaledAmountNumber);

    return `${scaledAmountText} ${descriptors || ""}${scaledItem}`;
  });
}

function scaleLooseEggMentions(text: string, scale: RecipeScale) {
  if (scale === 1) return text;

  const looseEggRegex =
    /\b(the\s+)?egg\b(?!\s+(mixture|wash|noodles?|rolls?|bites?|salad))/gi;

  return text.replace(looseEggRegex, (...args) => {
    const match = args[0] as string;
    const article = (args[1] as string | undefined) || "";
    const offset = args[args.length - 2] as number;
    const fullText = args[args.length - 1] as string;

    const before = fullText.slice(Math.max(0, offset - 40), offset);
    const descriptorPattern = getDescriptorPattern();
    const unicodeFractionPattern = Object.keys(UNICODE_FRACTIONS).join("");

    const alreadyNumberedEggRegex = new RegExp(
      `((?:\\d+\\s+\\d+\\/\\d+)|(?:\\d+\\/\\d+)|(?:\\d+(?:\\.\\d+)?)|[${unicodeFractionPattern}])\\s+(?:(?:${descriptorPattern})\\s+)*$`,
      "i"
    );

    // If it already says something like "1 beaten egg",
    // do not touch it again.
    if (alreadyNumberedEggRegex.test(before)) {
      return match;
    }

    if (scale === 2) {
      return `${article}eggs`;
    }

    return `${article}1/2 egg`;
  });
}

export function scaleIngredientLine(
  ingredient: string,
  scale: RecipeScale
): string {
  if (scale === 1) return ingredient;

  const trimmed = ingredient.trim();

  if (!trimmed) return ingredient;

  const unicodeFractionPattern = Object.keys(UNICODE_FRACTIONS).join("");

  const leadingQuantityPattern = new RegExp(
    `^((?:\\d+\\s+\\d+\\/\\d+)|(?:\\d+\\/\\d+)|(?:\\d+(?:\\.\\d+)?)|[${unicodeFractionPattern}])(?=\\s|\\(|$)`
  );

  const match = trimmed.match(leadingQuantityPattern);

  if (!match) return ingredient;

  const originalQuantity = match[1];
  const scaledQuantity = scaleQuantityText(originalQuantity, scale);
  const scaledLine = trimmed.replace(originalQuantity, scaledQuantity);

  return normalizeMeasurementUnitGrammar(
  pluralizeCountableQuantityText(scaledLine)
);
}

export function scaleIngredientLines(
  ingredients: string[],
  scale: RecipeScale
): string[] {
  return ingredients.map((ingredient) => scaleIngredientLine(ingredient, scale));
}

export function scaleInstructionText(
  instruction: string,
  scale: RecipeScale
): string {
  if (scale === 1) return instruction;

  const { protectedText, restore } = protectParentheses(instruction);

  const safeUnitPattern = getUnitPattern(INSTRUCTION_SAFE_UNITS);
  const blockedUnitPattern = getUnitPattern(DO_NOT_SCALE_UNITS);

  const measurementRegex = new RegExp(
    `\\b((?:\\d+\\s+\\d+\\/\\d+)|(?:\\d+\\/\\d+)|(?:\\d+(?:\\.\\d+)?))\\s+(${safeUnitPattern})\\b`,
    "gi"
  );

  const blockedRegex = new RegExp(
    `\\b((?:\\d+\\s+\\d+\\/\\d+)|(?:\\d+\\/\\d+)|(?:\\d+(?:\\.\\d+)?))\\s+(${blockedUnitPattern})\\b`,
    "gi"
  );

  const blockedMatches = new Set<string>();

  protectedText.replace(blockedRegex, (match) => {
    blockedMatches.add(match);
    return match;
  });

  let scaled = protectedText.replace(measurementRegex, (match, amount, unit) => {
    if (blockedMatches.has(match)) return match;

    return `${scaleQuantityText(amount, scale)} ${unit}`;
  });

  scaled = scaleCountableInstructionItems(scaled, scale);
scaled = scaleLooseEggMentions(scaled, scale);
scaled = normalizeMeasurementUnitGrammar(scaled);

return restore(scaled);
}

export function scaleInstructionLines(
  instructions: string[],
  scale: RecipeScale
): string[] {
  return instructions.map((instruction) =>
    scaleInstructionText(instruction, scale)
  );
}

export function getRecipeScaleLabel(scale: RecipeScale, language: "en" | "es") {
  if (language === "es") {
    if (scale === 0.5) return "Mitad";
    if (scale === 2) return "Doble";
    return "Original";
  }

  if (scale === 0.5) return "Half";
  if (scale === 2) return "Double";
  return "Original";
}

export const RECIPE_SCALE_OPTIONS: RecipeScale[] = [0.5, 1, 2];