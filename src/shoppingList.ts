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
  let next = text;
  PREP_WORDS.forEach((word) => {
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
    .replace(/\bjalapeno peppers?\b/g, "jalapeno")
    .replace(/\bjalapenos?\b/g, "jalapeno");
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
    .replace(/\bpork chops?\b/g, "pork chop")
    .replace(/\bmanicotti shells?\b/g, "manicotti shells");
}

function normalizeDairyAndCheese(text: string) {
  return text
    .replace(/\bshredded mozzarella cheese\b/g, "mozzarella cheese")
    .replace(/\bgrated mozzarella cheese\b/g, "mozzarella cheese")
    .replace(/\bmozzarella, shredded\b/g, "mozzarella cheese")
    .replace(/\bmozzarella cheese, shredded\b/g, "mozzarella cheese")
    .replace(/\bshredded cheddar cheese\b/g, "cheddar cheese")
    .replace(/\bgrated cheddar cheese\b/g, "cheddar cheese")
    .replace(/\bcheddar cheese, shredded\b/g, "cheddar cheese")
    .replace(/\bshredded mexican cheese blend\b/g, "mexican cheese blend")
    .replace(/\bmexican cheese blend, shredded\b/g, "mexican cheese blend")
    .replace(/\bgrated parmesan cheese\b/g, "parmesan cheese")
    .replace(/\bfreshly grated parmesan cheese\b/g, "parmesan cheese")
    .replace(/\bparmesan cheese, grated\b/g, "parmesan cheese")
    .replace(/\bshredded swiss cheese\b/g, "swiss cheese")
    .replace(/\bswiss cheese, shredded\b/g, "swiss cheese")
    .replace(/\bcream cheese, softened\b/g, "cream cheese")
    .replace(/\bcream cheese, cubed\b/g, "cream cheese");
}

function normalizeMushrooms(text: string) {
  return text
    .replace(/\bcremini mushrooms?\b/g, "baby bella mushrooms")
    .replace(/\bbaby bella mushrooms?\b/g, "baby bella mushrooms");
}

function removeNonShoppingItems(text: string) {
  return text
    .replace(/\bwater\b/g, " ")
    .replace(/\bice\b/g, " ")
    .replace(/\bcrushed ice\b/g, " ")
    .replace(/\bcooking spray\b/g, " ")
    .replace(/\bnonstick spray\b/g, " ")
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
    "hot dog": "hot dogs",
  };

  return irregular[name] || `${name}s`;
}



function buildDisplayText(
  normalizedName: string,
  quantity: number | null,
  unit: string,
  packageSize?: string
) {
  if (!normalizedName) return "";

  if (quantity !== null) {
    const qty = formatQuantity(quantity);

    if (unit) {
      const size = formatPackageSize(packageSize);
      if (size) {
        return `${qty} (${size}) ${pluralizeUnit(unit, quantity)} ${normalizedName}`.trim();
      }

      return `${qty} ${pluralizeUnit(unit, quantity)} ${normalizedName}`.trim();
    }

    if (COUNTABLE_DISPLAY_NAMES.has(normalizedName)) {
      return `${qty} ${pluralizeCountableName(normalizedName, quantity)}`;
    }

    return `${qty} ${normalizedName}`.trim();
  }

  return normalizedName;
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
]);

function shouldHideShoppingItem(name: string) {
  const cleaned = normalizeIngredientName(name).toLowerCase();
  return HIDDEN_ITEMS.has(cleaned);
}

function resolveShoppingCategory(name: string): GroceryCategory {
  const cleaned = normalizeIngredientName(name) || cleanIngredientForCategory(name);

  if (FORCED_SPICE_ITEMS.has(cleaned.toLowerCase())) {
    return "Spices" as GroceryCategory;
  }

  return categorizeGroceryItem(cleaned);
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
        normalizeIngredientName(item.normalizedName || "") ||
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
    ? existing.filter((item) => String(item.sourceRecipe || "").trim().toLowerCase() !== recipeKey)
    : existing;

  const merged = [...existingWithoutSameRecipe, ...newItems];
  saveShoppingList(merged);

  return { items: merged, addedCount: newItems.length };
}
