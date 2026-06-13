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
      return protectedParts.reduce(
        (result, part, index) => result.replace(`__PAREN_${index}__`, part),
        value
      );
    },
  };
}

function getUnitPattern(units: string[]) {
  return units
    .map((unit) => unit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
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

  return trimmed.replace(originalQuantity, scaledQuantity);
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

  const scaled = protectedText.replace(measurementRegex, (match, amount, unit) => {
    if (blockedMatches.has(match)) return match;

    return `${scaleQuantityText(amount, scale)} ${unit}`;
  });

  return restore(scaled);
}

export function scaleInstructionLines(
  instructions: string[],
  scale: RecipeScale
): string[] {
  return instructions.map((instruction) => scaleInstructionText(instruction, scale));
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