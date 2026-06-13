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

const COUNTABLE_ITEMS = [
  { singular: "egg", plural: "eggs" },
  { singular: "onion", plural: "onions" },
  { singular: "pepper", plural: "peppers" },
  { singular: "potato", plural: "potatoes" },
  { singular: "carrot", plural: "carrots" },
  { singular: "clove", plural: "cloves" },
  { singular: "tortilla", plural: "tortillas" },
  { singular: "bun", plural: "buns" },
  { singular: "roll", plural: "rolls" },
    { singular: "flatbread", plural: "flatbreads" },
  { singular: "naan", plural: "naan" },
  { singular: "pita", plural: "pitas" },
  { singular: "slice", plural: "slices" },
  { singular: "can", plural: "cans" },
  { singular: "package", plural: "packages" },
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
    `\\b((?:\\d+\\s+\\d+\\/\\d+)|(?:\\d+\\/\\d+)|(?:\\d+(?:\\.\\d+)?))\\s+((?:(?:${descriptorPattern})\\s+)*)(${itemPattern})\\b`,
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

  return text.replace(
    /\b(the\s+)?egg\b(?!\s+(mixture|wash|noodles?|rolls?|bites?|salad))/gi,
    (_match, article = "") => {
      if (scale === 2) {
        return `${article}eggs`;
      }

      return `${article}1/2 egg`;
    }
  );
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

  return pluralizeCountableQuantityText(scaledLine);
}

export function scaleIngredientLines(
  ingredients: string[],
  scale: RecipeScale
): string[] {
  return ingredients.map((ingredient) => scaleIngredientLine(ingredient, scale));
}

function getBaseCountableQuantitiesFromIngredients(ingredients: string[]) {
  const quantities = new Map<string, number>();
  const itemPattern = getCountableItemPattern();
  const descriptorPattern = getDescriptorPattern();
  const unicodeFractionPattern = Object.keys(UNICODE_FRACTIONS).join("");

  const leadingCountableRegex = new RegExp(
    `^((?:\\d+\\s+\\d+\\/\\d+)|(?:\\d+\\/\\d+)|(?:\\d+(?:\\.\\d+)?)|[${unicodeFractionPattern}])\\s+((?:(?:${descriptorPattern})\\s+)*)(${itemPattern})\\b`,
    "i"
  );

  for (const ingredient of ingredients) {
    const trimmed = ingredient.trim();
    const match = trimmed.match(leadingCountableRegex);

    if (!match) continue;

    const amount = parseQuantity(match[1]);
    const item = match[3];

    if (amount === null) continue;

    const found = COUNTABLE_ITEMS.find(
      (entry) =>
        entry.singular.toLowerCase() === item.toLowerCase() ||
        entry.plural.toLowerCase() === item.toLowerCase()
    );

    if (!found) continue;

    quantities.set(found.singular, (quantities.get(found.singular) || 0) + amount);
  }

  return quantities;
}

function scaleLooseCountableMentionsFromIngredients(
  text: string,
  scale: RecipeScale,
  ingredientQuantities: Map<string, number>
) {
  if (scale === 1 || ingredientQuantities.size === 0) return text;

  let result = text;
  const descriptorPattern = getDescriptorPattern();

  for (const [singular, baseAmount] of ingredientQuantities.entries()) {
    const found = COUNTABLE_ITEMS.find((entry) => entry.singular === singular);

    if (!found) continue;

    const scaledAmount = baseAmount * scale;
    const amountText = formatScaledNumber(scaledAmount);
    const scaledItem = normalizeCountableItem(found.singular, scaledAmount);

    const singularPattern = found.singular.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pluralPattern = found.plural.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const blockedEggFollowup =
      found.singular === "egg"
        ? `(?!\\s+(mixture|wash|noodles?|rolls?|bites?|salad))`
        : "";

    const looseRegex = new RegExp(
      `\\b(the\\s+)?((?:(?:${descriptorPattern})\\s+)*)(${singularPattern}|${pluralPattern})\\b${blockedEggFollowup}`,
      "gi"
    );

    result = result.replace(
      looseRegex,
      (match, article = "", descriptors = "", _item, offset, fullText) => {
        const before = fullText.slice(Math.max(0, offset - 12), offset);

        // If it already has a number right before it, let the normal scaler handle it.
        if (/(?:\d|\/)\s*$/.test(before)) return match;

        return `${article || ""}${amountText} ${descriptors || ""}${scaledItem}`;
      }
    );
  }

  return result;
}

function scaleInstructionTextWithQuantities(
  instruction: string,
  scale: RecipeScale,
  ingredientQuantities: Map<string, number>
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
  scaled = scaleLooseCountableMentionsFromIngredients(
    scaled,
    scale,
    ingredientQuantities
  );

  if (!ingredientQuantities.has("egg")) {
    scaled = scaleLooseEggMentions(scaled, scale);
  }

  return restore(scaled);
}

export function scaleInstructionText(
  instruction: string,
  scale: RecipeScale,
  baseIngredients: string[] = []
): string {
  const ingredientQuantities =
    getBaseCountableQuantitiesFromIngredients(baseIngredients);

  return scaleInstructionTextWithQuantities(
    instruction,
    scale,
    ingredientQuantities
  );
}

export function scaleInstructionLines(
  instructions: string[],
  scale: RecipeScale,
  baseIngredients: string[] = []
): string[] {
  const ingredientQuantities =
    getBaseCountableQuantitiesFromIngredients(baseIngredients);

  return instructions.map((instruction) =>
    scaleInstructionTextWithQuantities(
      instruction,
      scale,
      ingredientQuantities
    )
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