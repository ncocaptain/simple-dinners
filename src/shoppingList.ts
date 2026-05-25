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
  packageSize?: string;
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

function normalizePackageSize(value?: string) {
  const cleaned = String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "";

  return cleaned
    .replace(/ounces?\b/g, "oz")
    .replace(/pounds?\b/g, "lb")
    .replace(/\blbs?\b/g, "lb")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPackageSize(value?: string) {
  return normalizePackageSize(value);
}

function formatSmartName(value: string) {
  const cleaned = cleanupSpacing(String(value || "").toLowerCase());

  const specialDisplayName = SPECIAL_DISPLAY_NAMES[cleaned];
  if (specialDisplayName) {
    return specialDisplayName;
  }

  const smallWords = new Set(["of", "and", "or", "the", "in", "with"]);

  return String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && smallWords.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

const CUP_MEASURE_NOISE = new Set([
  "pasta",
  "rice",
  "flour",
  "sugar",
  "brown sugar",
  "bread crumbs",
  "breadcrumbs",
  "oil",
  "olive oil",
  "vegetable oil",
  "canola oil",
  "sesame oil",
  "toasted sesame oil",
]);

const DEFAULT_BUY_DISPLAY: Record<string, string> = {
  garlic: "1 clove Garlic",
  cilantro: "1 bunch Cilantro",
  parsley: "1 bunch Parsley",
  cheese: "Shredded Cheddar Cheese",
  "brown sugar": "Brown Sugar",
};

// =====================================================
// Builder: unit helpers
// =====================================================
function normalizeUnit(unit?: string) {
  const value = String(unit || "").trim().toLowerCase();
  if (!value) return "";

  const map: Record<string, string> = {
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
    kg: "kg",
    ml: "ml",
    l: "l",
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

  return pluralMap[unit] || unit;
}

const UNIT_PATTERN =
  "cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|oz|ounce|ounces|lb|lbs|pound|pounds|g|kg|ml|l|clove|cloves|can|cans|package|packages|pkg|pkgs|box|boxes|slice|slices|stick|sticks|bunch|bunches|jar|jars|carton|cartons|bag|bags|tube|tubes|packet|packets";

const QUANTITY_PATTERN =
  "\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+\\.\\d+|\\d+|½|¼|¾|⅓|⅔|⅛";

// =====================================================
// Builder: normalization helpers
// =====================================================
function normalizeAscii(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[’]/g, "'")
    .trim();
}

function cleanupSpacing(text: string) {
  return String(text || "")
    .replace(/^[-•*]+\s*/, "")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\b(\w+)\s+\1\b/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[:;,]+$/g, "");
}

// =====================================================
// Builder: manual shopping item helpers
// Manual entries should preserve shopper meaning. Recipe entries can still
// be cleaned, but we avoid stripping words that change what someone buys.
// =====================================================
const SPECIAL_DISPLAY_NAMES: Record<string, string> = {
  "aa batteries": "AA Batteries",
  "aaa batteries": "AAA Batteries",
  "ziploc bags": "Ziploc Bags",
  "ziplock bags": "Ziplock Bags",
  "#2 pencils": "#2 Pencils",
};

const COUNTABLE_MANUAL_SINGULARS: Record<string, string> = {
  eggs: "egg",
  onions: "onion",
  "yellow onions": "yellow onion",
  "white onions": "white onion",
  "red onions": "red onion",
  "green onions": "green onion",
  carrots: "carrot",
  potatoes: "potato",
  tomatoes: "tomato",
  avocados: "avocado",
  lemons: "lemon",
  limes: "lime",
  tortillas: "tortilla",
  "hamburger buns": "hamburger bun",
  "hot dog buns": "hot dog bun",
  buns: "bun",
  rolls: "roll",
  bagels: "bagel",
  cucumbers: "cucumber",
  zucchinis: "zucchini",
  jalapenos: "jalapeno",
  jalapeños: "jalapeno",
  "bell peppers": "bell pepper",
  "green bell peppers": "green bell pepper",
  "red bell peppers": "red bell pepper",
  "yellow bell peppers": "yellow bell pepper",
};

function removeLeadingAmountAndUnit(text: string) {
  return cleanupSpacing(
    normalizeAscii(text)
      .replace(
        new RegExp(`^(?:${QUANTITY_PATTERN})\\s+(?:${UNIT_PATTERN})\\s+`, "i"),
        ""
      )
      .replace(new RegExp(`^(?:${QUANTITY_PATTERN})\\s+`, "i"), "")
  );
}

function normalizeManualShoppingName(text: string) {
  return cleanupSpacing(
    normalizeAscii(text)
      .replace(/<[^>]+>/g, " ")
      .replace(/^[-•*]+\s*/, "")
      .replace(/ /g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function normalizeManualCountableName(name: string, quantity: number | null) {
  const cleaned = normalizeManualShoppingName(name);
  if (quantity === null) return cleaned;

  // Preserve shopping-specific descriptors/forms even when there is a quantity.
  // Example: 2 fresh jalapenos, 1 shredded mozzarella cheese, 1 block cheddar cheese.
  if (
    /\b(fresh|frozen|pickled|jarred|canned|shredded|sliced|grated|block|whole)\b/.test(cleaned)
  ) {
    return cleaned;
  }

  return COUNTABLE_MANUAL_SINGULARS[cleaned] || cleaned;
}

function parseManualShoppingParts(line: string): {
  normalizedName: string;
  quantity: number | null;
  unit: string;
  packageSize: string;
} {
  let text = normalizeManualShoppingName(line);
  if (!text || isSectionHeader(text)) {
    return { normalizedName: "", quantity: null, unit: "", packageSize: "" };
  }

  let packageSize = "";
  const sizeMatch = text.match(/\(([^)]+)\)/);
  if (sizeMatch) {
    packageSize = normalizePackageSize(sizeMatch[1]);
    text = text.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  }

  let quantity: number | null = null;
  let unit = "";

  // Do not treat #2 pencils as a quantity. It is the item name.
  if (!text.startsWith("#")) {
    const quantityMatch = text.match(new RegExp(`^(${QUANTITY_PATTERN})\\b`, "i"));
    if (quantityMatch) {
      quantity = parseFraction(quantityMatch[1]);
      text = text.slice(quantityMatch[0].length).trim();
    }

    const unitMatch = text.match(new RegExp(`^(${UNIT_PATTERN})\\b`, "i"));
    if (unitMatch) {
      unit = normalizeUnit(unitMatch[1]);
      text = text.slice(unitMatch[0].length).trim();
    }
  }

  const normalizedName = normalizeManualCountableName(text, quantity);

  return {
    normalizedName,
    quantity,
    unit,
    packageSize,
  };
}

function preserveManualShoppingName(text: string) {
  const cleaned = normalizeManualShoppingName(text);
  const withoutAmount = removeLeadingAmountAndUnit(cleaned);

  if (SPECIAL_DISPLAY_NAMES[cleaned]) return cleaned;
  if (SPECIAL_DISPLAY_NAMES[withoutAmount]) return withoutAmount;

  // Preserve any manual/store cheese wording. Cheese form/type matters.
  if (cleaned.includes("cheese")) return cleaned;
  if (withoutAmount.includes("cheese")) return withoutAmount;

  // Preserve common household item wording exactly enough for display.
  if (/\b(batteries|ziploc bags|ziplock bags|paper plates|paper towels|bag of ice|bags of ice|pencils)\b/.test(cleaned)) {
    return cleaned;
  }
  if (/\b(batteries|ziploc bags|ziplock bags|paper plates|paper towels|bag of ice|bags of ice|pencils)\b/.test(withoutAmount)) {
    return withoutAmount;
  }

  return "";
}


const SECTION_HEADER_PATTERNS = [
  /seasoning:?$/,
  /sauce:?$/,
  /glaze:?$/,
  /topping:?$/,
  /toppings:?$/,
  /marinade:?$/,
  /dressing:?$/,
  /filling:?$/,
  /quick chili topping:?$/,
  /^for .+:?$/,
];

function isSectionHeader(text: string) {
  const cleaned = cleanupSpacing(normalizeAscii(text));
  if (!cleaned) return true;
  if (String(text).trim().endsWith(":")) return true;
  return SECTION_HEADER_PATTERNS.some((pattern) => pattern.test(cleaned));
}

const RECIPE_STYLE_PHRASES = [
  "to taste",
  "as needed",
  "optional",
  "for garnish",
  "plus more for garnish",
  "plus more",
  "divided",
  "stems removed",
  "seeds removed",
  "for topping",
  "for serving",
  "serve with",
  "if desired",
  "if using",
  "skin-on preferred",
  "day-old preferred",
  "rotisserie works great",
  "side muscle removed",
];

const PREP_WORDS = [
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
  "trimmed",
  "thawed",
  "cooked",
  "uncooked",
  "prepared",
  "reserved",
  "low-sodium",
  "low sodium",
];

function removeRecipeStylePhrases(text: string) {
  let next = text;
  RECIPE_STYLE_PHRASES.forEach((phrase) => {
    next = next.replaceAll(phrase, " ");
  });
  return next;
}

function removePrepWords(text: string) {
  const protectedManualName = preserveManualShoppingName(text);
  if (protectedManualName) return protectedManualName;

  let next = text;
  const shopperMeaningfulWords = new Set([
    "fresh",
    "freshly",
    "sliced",
    "shredded",
    "grated",
    "whole",
  ]);

  PREP_WORDS.forEach((word) => {
    if (shopperMeaningfulWords.has(word)) return;
    next = next.replace(new RegExp(`\\b${word}\\b`, "g"), " ");
  });

  return next;
}

function protectRealPeppers(text: string) {
  return text
    .replace(/\bgreen bell black pepper\b/g, "green bell pepper")
    .replace(/\bred bell black pepper\b/g, "red bell pepper")
    .replace(/\byellow bell black pepper\b/g, "yellow bell pepper")
    .replace(/\bcayenne black pepper\b/g, "cayenne pepper")
    .replace(/\bred black pepper flakes\b/g, "red pepper flakes");
}

function normalizePantryAndSeasonings(text: string) {
  const cleaned = cleanupSpacing(text);

  if (cleaned === "salt and pepper" || cleaned === "salt and black pepper") {
    return "salt / pepper";
  }

  return protectRealPeppers(text)
    .replace(/\bfreshly ground black pepper\b/g, "black pepper")
    .replace(/\bground black pepper\b/g, "black pepper")
    .replace(/\bfreshly ground pepper\b/g, "black pepper")
    .replace(/\bground pepper\b/g, "black pepper")
    .replace(/\bblack black pepper\b/g, "black pepper")
    .replace(/\bpepper\b/g, (match, offset, full) => {
      const before = full.slice(0, offset).trimEnd();
      const after = full.slice(offset + match.length).trimStart();

      if (
        before.endsWith("bell") ||
        before.endsWith("green") ||
        before.endsWith("red") ||
        before.endsWith("yellow") ||
        before.endsWith("cayenne") ||
        after.startsWith("flakes")
      ) {
        return match;
      }

      return "black pepper";
    })
    .replace(/\bblack black pepper\b/g, "black pepper")
    .replace(/\bonion powders?\b/g, "onion powder")
    .replace(/\bgarlic powders?\b/g, "garlic powder")
    .replace(/\bsmoked paprika\b/g, "paprika")
    .replace(/\bpaprikas\b/g, "paprika")
    .replace(/\bchile powder\b/g, "chili powder");
}

function normalizeProduce(text: string) {
  return text
    .replace(/\bjuice of (\d+ )?lemons?\b/g, "lemon")
    .replace(/\blemon juice\b/g, "lemon")
    .replace(/\blemon zest\b/g, "lemon")
    .replace(/\blime juice\b/g, "lime")
    .replace(/\bgarlic cloves?\b/g, "garlic")
    .replace(/\bcloves? garlic\b/g, "garlic")
    .replace(/\bminced garlic\b/g, "garlic")
    .replace(/\bgarlic, minced\b/g, "garlic")
    .replace(/\byellow onions?\b/g, "yellow onion")
    .replace(/\bwhite onions?\b/g, "white onion")
    .replace(/\bred onions?\b/g, "red onion")
    .replace(/\bgreen onions?\b/g, "green onion")
    .replace(/\bonions?\b/g, "onion")
    .replace(/\bsweet potatoes\b/g, "sweet potato")
    .replace(/\bsweet potatoe\b/g, "sweet potato")
    .replace(/\bcarrots?\b/g, "carrot")
    .replace(/\beggs?\b/g, "egg")
    .replace(/\bspinach leaves\b/g, "spinach")
    .replace(/\bmint leaves?\b/g, "mint")
    .replace(/\bmint sprigs?\b/g, "mint")
    .replace(/\bcilantro leaves?\b/g, "cilantro")
    .replace(/\bparsley leaves?\b/g, "parsley")
    .replace(/\bor pickled jalapeno\b/g, "jalapeno")
    .replace(/\bjalapeno peppers?\b/g, "jalapenos");
}

function normalizeCannedAndJarredGoods(text: string) {
  return text
    .replace(/\bfire[- ]roasted diced tomatoes?\b/g, "fire-roasted diced tomatoes")
    .replace(/\bfire[- ]roasted tomatoes?\b/g, "fire-roasted tomatoes")
    .replace(/\bdiced tomatoes?\b/g, "diced tomatoes")
    .replace(/\bcrushed tomatoes?\b/g, "crushed tomatoes")
    .replace(/\bstewed tomatoes?\b/g, "stewed tomatoes")
    .replace(/\btomato sauce\b/g, "tomato sauce")
    .replace(/\btomato paste\b/g, "tomato paste")
    .replace(/\bchili beans?\b/g, "chili beans")
    .replace(/\bblack beans?\b/g, "black beans")
    .replace(/\bkidney beans?\b/g, "kidney beans")
    .replace(/\bpinto beans?\b/g, "pinto beans")
    .replace(/\bwhite beans?\b/g, "white beans");
}

function normalizeProteinsAndBakery(text: string) {
  return text
    .replace(/\bextra lean ground beef\b/g, "ground beef")
    .replace(/\blean ground beef\b/g, "ground beef")
    .replace(/\bground italian sausage\b/g, "italian sausage")
    .replace(/\bitalian ground sausage\b/g, "italian sausage")
    .replace(/\bhot dog buns?\b/g, "hot dog bun")
    .replace(/\bhot dogs?\b/g, "hot dog")
    .replace(/\bhamburger buns?\b/g, "hamburger bun")
    .replace(/\bchicken breasts?\b/g, "chicken breast")
    .replace(/\bchicken thighs?\b/g, "chicken thigh")
    .replace(/\bdrumsticks?\b/g, "drumstick")
    .replace(/\bbone[- ]in pork chops?\b/g, "bone-in pork chop")
    .replace(/\bpork chops?\b/g, "pork chop")
    .replace(/\bmanicotti shells?\b/g, "manicotti shells");
}

function normalizeDairyAndCheese(text: string) {
  const cleaned = cleanupSpacing(text);

  // Cheese form/type matters at the store. Keep it shopper-friendly instead
  // of collapsing everything into generic "cheese".
  if (cleaned.includes("cheese")) {
    return cleaned
      .replace(/\bshredded cheese\b/g, "shredded cheddar cheese")
      .replace(/\bgrated cheese\b/g, "shredded cheddar cheese")
      .replace(/\bcheese slices?\b/g, "cheese slices")
      .replace(/\bmozzarella, shredded\b/g, "shredded mozzarella cheese")
      .replace(/\bmozzarella cheese, shredded\b/g, "shredded mozzarella cheese")
      .replace(/\bcheddar cheese, shredded\b/g, "shredded cheddar cheese")
      .replace(/\bmexican cheese blend, shredded\b/g, "shredded mexican cheese blend")
      .replace(/\bparmesan cheese, grated\b/g, "grated parmesan cheese")
      .replace(/\bswiss cheese, shredded\b/g, "shredded swiss cheese")
      .replace(/\bblock of ([a-z\s]+ cheese)\b/g, "block $1")
      .replace(/\b([a-z\s]+ cheese) block\b/g, "block $1")
      .replace(/\bcream cheese, softened\b/g, "cream cheese")
      .replace(/\bcream cheese, cubed\b/g, "cream cheese");
  }

  return text
    .replace(/\bice creams?\b/g, "ice cream")
    .replace(/\bvanilla ice cream\b/g, "vanilla ice cream")
    .replace(/\bstrawberry ice cream\b/g, "strawberry ice cream")
    .replace(/\bchocolate ice cream\b/g, "chocolate ice cream");
}

function normalizeMushrooms(text: string) {
  return text
    .replace(/\bcremini mushrooms?\b/g, "baby bella mushrooms")
    .replace(/\bbaby bella mushrooms?\b/g, "baby bella mushrooms");
}

function removeNonShoppingItems(text: string) {
  const cleaned = cleanupSpacing(text);

  // Hide plain non-shopping helpers, but do not remove these words from
  // real grocery/household items like "bag of ice".
  const nonShoppingExactItems = new Set([
    "water",
    "tap water",
    "cold water",
    "warm water",
    "hot water",
    "ice",
    "crushed ice",
    "cooking spray",
    "nonstick spray",
  ]);

  if (nonShoppingExactItems.has(cleaned)) {
    return "";
  }

  return text
    .replace(/\s*\+\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeIngredientCore(text: string) {
  let next = normalizeAscii(text);

  next = next.replace(/<[^>]+>/g, " ");
  next = next.replace(/^[-•*]+\s*/, "");
  next = next.replace(/^[/\\\-–—]+\s*/, "");
  next = next.replace(/\([^)]*\)/g, " ");
  next = cleanupSpacing(next);

  const protectedManualName = preserveManualShoppingName(next);
  if (protectedManualName) return protectedManualName;

  if (isSectionHeader(next)) return "";

  next = removeRecipeStylePhrases(next);
  next = next.replace(/^\s*up to\s+/i, "");
  next = next.replace(/^\s*to\s+/i, "");
  next = normalizePantryAndSeasonings(next);
  next = normalizeProduce(next);
  next = normalizeCannedAndJarredGoods(next);
  next = normalizeProteinsAndBakery(next);
  next = normalizeDairyAndCheese(next);
  next = normalizeMushrooms(next);
  next = removeNonShoppingItems(next);
  next = removePrepWords(next);

  next = next.replace(/\bcans?\s+of\s+/g, " ");
  next = next.replace(/\bcans?\s+/g, " ");
  next = next.replace(/\bboxes?\s+of\s+/g, " ");
  next = next.replace(/\bboxes?\s+/g, " ");
  next = next.replace(/\bpackages?\s+of\s+/g, " ");

  next = next.replace(
    new RegExp(`^\\s*(?:${QUANTITY_PATTERN})\\s+(?:${UNIT_PATTERN})?\\s*`, "i"),
    ""
  );

  next = next.replace(
    /^\d*\.?\d+\s+(carrot|onion|red onion|yellow onion|white onion|green onion|egg|garlic|jalapeno|mint|lemon|lime|sweet potato|green bell pepper|red bell pepper|yellow bell pepper|bell pepper)\b/g,
    "$1"
  );

  next = protectRealPeppers(next);
  next = next.split(",")[0];
  next = cleanupSpacing(next);

  // Remove dangling connector words from lines like
  // "4 oz cream cheese and ..." after cleanup has stripped the second item.
  next = next.replace(/\b(and|or|with)$/g, "").trim();
  next = cleanupSpacing(next);

  if (!next || next.length < 2) return "";
  if (/^[^a-z]+$/i.test(next)) return "";

  return next;
}

// =====================================================
// Builder: category cleanup
// =====================================================
function cleanIngredientForCategory(line: string) {
  return normalizeIngredientCore(line);
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
    .filter((l) => !isSectionHeader(l));
}

// =====================================================
// Builder: normalize display name
// =====================================================
function normalizeIngredientName(line: string) {
  return normalizeIngredientCore(line);
}

// =====================================================
// Builder: parse quantity + unit + normalized name
// =====================================================
function parseIngredientParts(line: string): {
  normalizedName: string;
  quantity: number | null;
  unit: string;
  packageSize: string;
} {
  let text = normalizeAscii(line);

  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/^[-•*]\s*/, "");
  text = text.replace(/^[/\\\-–—]+\s*/, "");
  text = text.replace(/\u00a0/g, " ");
  text = text.replace(/\s+/g, " ").trim();

  if (isSectionHeader(text)) {
    return { normalizedName: "", quantity: null, unit: "", packageSize: "" };
  }

  let quantity: number | null = null;
  let unit = "";

  // Convert "juice of 1 lemon" before quantity parsing so it becomes 1 lemon.
  const juiceOfLemonMatch = text.match(/^juice of (\d+) lemons?\b/);
  if (juiceOfLemonMatch) {
    return {
      normalizedName: "lemon",
      quantity: parseFraction(juiceOfLemonMatch[1]),
      unit: "",
      packageSize: "",
    };
  }

  // Preserve package/can sizes such as "2 (14.5 oz) cans fire-roasted diced tomatoes".
  let packageSize = "";
  const sizeMatch = text.match(/\(([^)]+)\)/);
  if (sizeMatch) {
    packageSize = normalizePackageSize(sizeMatch[1]);
  }

  // Remove parenthetical size after capturing so quantity + unit parsing still works.
  text = text.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();

  const quantityMatch = text.match(
    new RegExp(`^(${QUANTITY_PATTERN})\\b`, "i")
  );

  if (quantityMatch) {
    quantity = parseFraction(quantityMatch[1]);
    text = text.slice(quantityMatch[0].length).trim();
  }

  const unitMatch = text.match(new RegExp(`^(${UNIT_PATTERN})\\b`, "i"));

  if (unitMatch) {
    unit = normalizeUnit(unitMatch[1]);
    text = text.slice(unitMatch[0].length).trim();
  }

  const normalizedName = normalizeIngredientName(text);

  // Smart defaults stored as real metadata so ShoppingListPage can merge correctly.
  if (normalizedName === "garlic") {
    unit = "clove";
    if (quantity === null) quantity = 1;
  }

  if (normalizedName === "cilantro" || normalizedName === "parsley") {
    unit = "bunch";
    if (quantity === null) quantity = 1;
  }

  return {
    normalizedName,
    quantity,
    unit,
    packageSize,
  };
}

// =====================================================
// Builder: display text from parsed parts
// =====================================================
const COUNTABLE_DISPLAY_NAMES = new Set([
  "egg",
  "onion",
  "yellow onion",
  "white onion",
  "red onion",
  "green onion",
  "carrot",
  "garlic",
  "potato",
  "sweet potato",
  "tomato",
  "avocado",
  "banana",
  "apple",
  "orange",
  "lemon",
  "lime",
  "tortilla",
  "hamburger bun",
  "hot dog bun",
  "bun",
  "roll",
  "bagel",
  "cucumber",
  "zucchini",
  "jalapeno",
  "green bell pepper",
  "red bell pepper",
  "yellow bell pepper",
  "bell pepper",
  "chicken breast",
  "chicken thigh",
  "drumstick",
  "pork chop",
  "bone-in pork chop",
  "hot dog",
]);

function pluralizeCountableName(name: string, quantity: number) {
  if (Math.abs(quantity - 1) < 0.0001) return name;

  const irregular: Record<string, string> = {
    egg: "eggs",
    onion: "onions",
    "yellow onion": "yellow onions",
    "white onion": "white onions",
    "red onion": "red onions",
    "green onion": "green onions",
    carrot: "carrots",
    garlic: "garlic",
    potato: "potatoes",
    "sweet potato": "sweet potatoes",
    tomato: "tomatoes",
    avocado: "avocados",
    lemon: "lemons",
    lime: "limes",
    tortilla: "tortillas",
    "hamburger bun": "hamburger buns",
    "hot dog bun": "hot dog buns",
    bun: "buns",
    roll: "rolls",
    bagel: "bagels",
    cucumber: "cucumbers",
    zucchini: "zucchinis",
    jalapeno: "jalapenos",
    "green bell pepper": "green bell peppers",
    "red bell pepper": "red bell peppers",
    "yellow bell pepper": "yellow bell peppers",
    "bell pepper": "bell peppers",
    "chicken breast": "chicken breasts",
    "chicken thigh": "chicken thighs",
    drumstick: "drumsticks",
    "pork chop": "pork chops",
    "bone-in pork chop": "bone-in pork chops",
    "hot dog": "hot dogs",
  };

  return irregular[name] || `${name}s`;
}

const DEFAULT_COUNTABLE_FALLBACK = new Set([
  "lemon",
  "lime",
  "onion",
  "yellow onion",
  "white onion",
  "red onion",
  "green onion",
  "carrot",
  "apple",
  "banana",
]);


function buildDisplayText(
  normalizedName: string,
  quantity: number | null,
  unit: string,
  packageSize?: string
) {
  if (!normalizedName) return "";
  

  const name = normalizedName.toLowerCase().trim();
  const displayName = formatSmartName(name);
  const size = formatPackageSize(packageSize);

  if (preserveManualShoppingName(name) && quantity === null && !unit) {
    return displayName;
  }

  // Avoid grocery-noise measurements like "1/2 cup pasta". Users buy pasta, not half a cup.
  if (
  unit &&
  ["cup", "Tbsp", "tsp"].includes(unit) &&
  CUP_MEASURE_NOISE.has(name)
) {
  return displayName;
}
  // Default to 1 for loose countable produce if no quantity
if (quantity === null && DEFAULT_COUNTABLE_FALLBACK.has(name)) {
  return `1 ${formatSmartName(name)}`;
}

  // Helpful defaults for common loose items when recipes do not include a real quantity.
  if (quantity === null && DEFAULT_BUY_DISPLAY[name]) {
    return DEFAULT_BUY_DISPLAY[name];
  }

  if (quantity !== null) {
    const qty = formatQuantity(quantity);

    if (unit && unit !== "__count__") {
      if (size) {
        return `${qty} (${size}) ${pluralizeUnit(unit, quantity)} ${displayName}`.trim();
      }

      return `${qty} ${pluralizeUnit(unit, quantity)} ${displayName}`.trim();
    }

    if (COUNTABLE_DISPLAY_NAMES.has(name)) {
      return `${qty} ${formatSmartName(pluralizeCountableName(name, quantity))}`;
    }

    return `${qty} ${displayName}`.trim();
  }

  return displayName;
}

// =====================================================
// Builder: category resolver
// Keeps normalized seasonings in the right store section
// =====================================================
const FORCED_SPICE_ITEMS = new Set([
  "salt",
  "black pepper",
  "garlic powder",
  "onion powder",
  "paprika",
  "italian seasoning",
  "cumin",
  "chili powder",
  "oregano",
  "old bay seasoning",
  "cajun seasoning",
  "seasoned salt",
  "red pepper flakes",
  "cayenne pepper",
  "dried thyme",
  "chinese five spice",
]);

const HIDDEN_ITEMS = new Set([
  "",
  "salt / pepper",
  "salt and pepper",
  "salt and black pepper",
  "water",
  "ice",
  "crushed ice",
  "cooking spray",
  "nonstick spray",
  "cup",
  "cups",
  "tbsp",
  "tsp",
  "oz",
  "lb",
  "g",
  "kg",
  "ml",
  "l",
  "__count__",
]);

function shouldHideShoppingItem(name: string) {
  const protectedManualName = preserveManualShoppingName(name);
  if (protectedManualName) return false;

  const cleaned = normalizeIngredientName(name).toLowerCase();
  return HIDDEN_ITEMS.has(cleaned);
}

function isRealPepperProduce(cleaned: string) {
  return (
    cleaned.includes("bell pepper") ||
    cleaned.includes("red pepper") ||
    cleaned.includes("yellow pepper") ||
    cleaned.includes("green pepper") ||
    cleaned.includes("poblano") ||
    cleaned.includes("jalapeno") ||
    cleaned.includes("jalapeño")
  );
}

function isSalsaPantryItem(cleaned: string) {
  return (
    cleaned === "salsa" ||
    cleaned.includes("jar salsa") ||
    cleaned.includes("salsa verde")
  );
}

function isCornstarchPantryItem(cleaned: string) {
  return cleaned.includes("cornstarch") || cleaned.includes("corn starch");
}

function resolveShoppingCategory(name: string): GroceryCategory {
  const cleaned =
    preserveManualShoppingName(name) ||
    normalizeIngredientName(name) ||
    cleanIngredientForCategory(name);

  const lower = cleaned.toLowerCase();

  // Important overrides before broad category matching:
  // real peppers are produce, salsa/cornstarch are pantry.
  if (isRealPepperProduce(lower)) {
    return "Produce";
  }

  if (isSalsaPantryItem(lower) || isCornstarchPantryItem(lower)) {
    return "Pantry";
  }

  if (
    lower.includes("mixed stir fry vegetables") ||
    lower.includes("stir fry vegetables")
  ) {
    return "Frozen";
  }

  if (
    lower.includes("tortilla chips") ||
    lower.includes("breadcrumbs") ||
    lower.includes("bread crumbs") ||
    lower.includes("cracker crumbs") ||
    lower.includes("lasagna noodles") ||
    lower.includes("egg noodles") ||
    lower.includes("noodles") ||
    lower.includes("pasta")
  ) {
    return "Pantry";
  }

  if (
    lower.includes("dijon mustard") ||
    lower.includes("mustard") ||
    lower.includes("honey") ||
    lower.includes("sesame oil") ||
    lower.includes("toasted sesame oil") ||
    lower.includes("olive oil") ||
    lower.includes("oil") ||
    lower.includes("vinegar") ||
    lower.includes("rice vinegar") ||
    lower.includes("balsamic vinegar")
  ) {
    return "Pantry";
  }

  if (FORCED_SPICE_ITEMS.has(lower)) {
    return "Spices / Seasonings";
  }

  return categorizeGroceryItem(cleaned);
}

// =====================================================
// Builder: safe duplicate merging
// First pass: only merge obvious recipe-generated countable items.
// Manual items are preserved exactly as entered.
// =====================================================
const SAFE_COUNTABLE_MERGE_NAMES = new Set([
  "lemon",
  "lime",
  "onion",
  "yellow onion",
  "white onion",
  "red onion",
  "green onion",
  "carrot",
  "potato",
  "sweet potato",
  "tomato",
  "avocado",
  "banana",
  "apple",
  "orange",
  "egg",
  "tortilla",
  "hamburger bun",
  "hot dog bun",
  "bun",
  "roll",
  "bagel",
  "cucumber",
  "zucchini",
  "jalapeno",
  "green bell pepper",
  "red bell pepper",
  "yellow bell pepper",
  "bell pepper",
]);

function getSafeMergeQuantity(item: ShoppingItem): number | null {
  const name = String(item.normalizedName || "").toLowerCase().trim();

  if (!SAFE_COUNTABLE_MERGE_NAMES.has(name)) return null;

  const unit = normalizeUnit(item.unit || "");
  const packageSize = normalizePackageSize(item.packageSize || "");

  // Do not merge packaged/container items in this first pass.
  if (packageSize) return null;

  // Only merge loose/countable items for now.
  if (unit && unit !== "__count__") return null;

  if (typeof item.quantity === "number" && Number.isFinite(item.quantity)) {
    return item.quantity;
  }

  // If a recipe produced "Lemon" with no quantity, treat it as 1 lemon.
  return 1;
}

function shouldSafelyMergeItem(item: ShoppingItem) {
  // Manual entries stay exactly as typed.
  if (!String(item.sourceRecipe || "").trim()) return false;

  const qty = getSafeMergeQuantity(item);
  return qty !== null;
}

function safeMergeKey(item: ShoppingItem) {
  const name = String(item.normalizedName || "").toLowerCase().trim();
  const unit = normalizeUnit(item.unit || "");
  const packageSize = normalizePackageSize(item.packageSize || "");

  return [name, unit || "__count__", packageSize].join("|");
}

function mergeSafeShoppingItems(items: ShoppingItem[]): ShoppingItem[] {
  const merged = new Map<string, ShoppingItem>();
  const output: ShoppingItem[] = [];

  for (const item of items) {
    if (!shouldSafelyMergeItem(item)) {
      output.push(item);
      continue;
    }

    const key = safeMergeKey(item);
    const existing = merged.get(key);
    const qty = getSafeMergeQuantity(item) ?? 0;

    if (!existing) {
      const nextItem: ShoppingItem = {
        ...item,
        quantity: qty,
        unit: "",
        packageSize: "",
        text: buildDisplayText(item.normalizedName || item.text, qty, "", ""),
        category: resolveShoppingCategory(item.normalizedName || item.text),
      };

      merged.set(key, nextItem);
      output.push(nextItem);
      continue;
    }

    const existingQty = getSafeMergeQuantity(existing) ?? 0;
    const newQty = existingQty + qty;

    existing.quantity = newQty;
    existing.text = buildDisplayText(existing.normalizedName || existing.text, newQty, "", "");
    existing.checked = existing.checked && item.checked;
    existing.addedAt = Math.min(existing.addedAt || Date.now(), item.addedAt || Date.now());

    const existingSources = String(existing.sourceRecipe || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const nextSource = String(item.sourceRecipe || "").trim();

    if (nextSource && !existingSources.includes(nextSource)) {
      existing.sourceRecipe = [...existingSources, nextSource].join(", ");
    }
  }

  return output;
}

// =====================================================
// Builder: load list with backward compatibility
// =====================================================
export function loadShoppingList(): ShoppingItem[] {
  const items = safeParse(localStorage.getItem(KEY));

  const normalizedItems = items
    .map((item: any) => {
      const sourceRecipe = String(item.sourceRecipe || "");
      const isManualItem = !sourceRecipe.trim();

      if (isManualItem) {
        const parsedManual = parseManualShoppingParts(item.text || item.normalizedName || "");
        const normalizedName =
          parsedManual.normalizedName ||
          normalizeManualShoppingName(item.normalizedName || item.text || "");

        if (!normalizedName || shouldHideShoppingItem(normalizedName)) return null;

        const quantity =
          typeof item.quantity === "number" ? item.quantity : parsedManual.quantity;
        const unit = normalizeUnit(item.unit || parsedManual.unit || "");
        const packageSize = normalizePackageSize(
          item.packageSize || parsedManual.packageSize || ""
        );

        return {
          ...item,
          id:
            item.id ||
            `${makeId(normalizedName)}-item-${item.addedAt || Date.now()}`,
          text: buildDisplayText(normalizedName, quantity, unit, packageSize),
          normalizedName,
          quantity,
          unit,
          packageSize,
          category: resolveShoppingCategory(normalizedName),
          sourceRecipe: "",
        } as ShoppingItem;
      }

      const parsed = parseIngredientParts(item.text || "");
      const savedNormalizedName = normalizeIngredientName(item.normalizedName || "");

      // Older saved entries may have collapsed "shredded cheese" into generic
      // "cheese". Prefer the original line parse when it gives us a more
      // shopper-useful cheese name like "shredded cheddar cheese".
      const normalizedName =
        savedNormalizedName === "cheese" && parsed.normalizedName && parsed.normalizedName !== "cheese"
          ? parsed.normalizedName
          : savedNormalizedName ||
            parsed.normalizedName ||
            normalizeIngredientName(item.text || "");

      if (!normalizedName || shouldHideShoppingItem(normalizedName)) return null;

      const quantity =
        typeof item.quantity === "number" ? item.quantity : parsed.quantity;
      const unit = normalizeUnit(item.unit || parsed.unit || "");
      const packageSize = normalizePackageSize(item.packageSize || parsed.packageSize || "");

      return {
        ...item,
        id:
          item.id ||
          `${makeId(normalizedName)}-${item.sourceRecipe || "item"}-${item.addedAt || 0}`,
        text: buildDisplayText(normalizedName, quantity, unit, packageSize),
        normalizedName,
        quantity,
        unit,
        packageSize,
        category: resolveShoppingCategory(normalizedName),
        sourceRecipe,
      } as ShoppingItem;
        })
    .filter(Boolean) as ShoppingItem[];

  return mergeSafeShoppingItems(normalizedItems);
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
  // Use raw saved storage here, not loadShoppingList().
  // loadShoppingList() returns a merged display version; saving that back can
  // make recipe refresh/removal lose individual recipe ingredient detail.
  const existing = safeParse(localStorage.getItem(KEY));
  const lines = normalizeIngredientLines(ingredients);

  const now = Date.now();
  const newItems: ShoppingItem[] = [];

  for (const line of lines) {
    const parsed = parseIngredientParts(line);
    if (!parsed.normalizedName || shouldHideShoppingItem(parsed.normalizedName)) {
      continue;
    }

    // keep items separate per recipe/line so UI can merge/count later
    const id = `${makeId(parsed.normalizedName)}-${makeId(recipeName || "recipe")}-${makeId(
      line
    )}-${now}-${newItems.length}`;

    const text = buildDisplayText(
      parsed.normalizedName,
      parsed.quantity,
      parsed.unit,
      parsed.packageSize
    );

    newItems.push({
      id,
      text,
      checked: false,
      addedAt: now,
      category: resolveShoppingCategory(parsed.normalizedName),
      sourceRecipe: recipeName || "",
      normalizedName: parsed.normalizedName,
      quantity: parsed.quantity,
      unit: parsed.unit,
      packageSize: parsed.packageSize,
    });
  }

    // Idempotent recipe adds: adding the same recipe again refreshes its ingredients instead of duplicating them.
  const recipeKey = String(recipeName || "").trim().toLowerCase();

  const existingWithoutSameRecipe = recipeKey
    ? existing.filter(
        (item) =>
          String(item.sourceRecipe || "").trim().toLowerCase() !== recipeKey
      )
    : existing;

  const merged = [...existingWithoutSameRecipe, ...newItems];

  // Save the real raw/individual recipe items so recipe refresh/removal stays safe.
  saveShoppingList(merged);

  // Return the smarter display version immediately for the UI.
  const displayItems = mergeSafeShoppingItems(merged);

  return { items: displayItems, addedCount: newItems.length };
}