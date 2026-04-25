import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Pencil,
  X,
} from "lucide-react";
import Card from "../components/Card";
import {
  loadShoppingList,
  saveShoppingList,
  type ShoppingItem,
} from "../shoppingList";
import {
  categorizeGroceryItem,
  type GroceryCategory,
  GROCERY_CATEGORY_ORDER,
} from "../core/groceryCategories";
import TipsModal from "../components/TipsModal";

// =====================================================
// Page tips
// =====================================================
const SHOPPING_TIPS = [
  "Add groceries or household items",
  "Items are grouped by store section",
  "Tap items to check them off",
  "Add only selected ingredients from recipes",
];

// =====================================================
// Parsed / combined item types
// =====================================================
type ParsedAmount = {
  quantity: number | null;
  unit: string | null;
  name: string;
};

type ParsedIngredient = ParsedAmount & {
  minQuantity?: number | null;
  maxQuantity?: number | null;
};

type CombinedItem = {
  id: string;
  checked: boolean;
  category: GroceryCategory;
  sourceIds: string[];
  count: number;
  recipeCount: number;
  recipeCountLabel: string;
  displayText: string;
};

// =====================================================
// Countable ingredient rules
// These are ingredients that should display like:
// 1 Onion, 2 Eggs, 6 Hamburger Buns
// =====================================================
const COUNTABLE_BASE_WORDS = new Set([
  "egg",
  "onion",
  "potato",
  "tomato",
  "avocado",
  "banana",
  "apple",
  "orange",
  "lemon",
  "lime",
  "tortilla",
  "bun",
  "roll",
  "bagel",
  "carrot",
  "cucumber",
  "zucchini",
  "jalapeno",
  "jalapeño",
  "clove",
]);

const COUNTABLE_PHRASES: Record<string, string> = {
  eggs: "egg",
  onions: "onion",
  potatoes: "potato",
  tomatoes: "tomato",
  avocados: "avocado",
  bananas: "banana",
  apples: "apple",
  oranges: "orange",
  lemons: "lemon",
  limes: "lime",
  tortillas: "tortilla",
  buns: "bun",
  rolls: "roll",
  bagels: "bagel",
  carrots: "carrot",
  cucumbers: "cucumber",
  zucchinis: "zucchini",
  jalapenos: "jalapeno",
  jalapeños: "jalapeno",
"jalapeño": "jalapeno",
  cloves: "clove",
  "chicken breasts": "chicken breast",
  "chicken thighs": "chicken thigh",
  drumsticks: "drumstick",
  porkchops: "porkchop",
  "pork chops": "pork chop",
  "hamburger buns": "hamburger bun",
  "hot dog buns": "hot dog bun",
};

// =====================================================
// Rules for when measured totals should be shown
// Example: Ground Beef, 3.5 lbs
// =====================================================
const ALWAYS_SHOW_MEASURED_TOTALS = new Set([
  "ground beef",
  "beef",
  "chicken",
  "chicken breast",
  "chicken thigh",
  "pork",
  "pork chop",
  "sausage",
  "bacon",
  "turkey",
  "shrimp",
  "salmon",
  "fish",
  "cheddar cheese",
  "mozzarella cheese",
  "parmesan cheese",
  "rice",
  "pasta",
  "manicotti shells",
]);

const HIDE_MEASURED_TOTALS = new Set([
  "salt",
  "black pepper",
  "garlic powder",
  "onion powder",
  "paprika",
  "italian seasoning",
  "cumin",
  "chili powder",
  "oregano",
  "baby bella mushrooms",
  "simple syrup",
]);

// =====================================================
// Fraction / quantity helpers
// =====================================================
function parseFraction(value: string): number | null {
  const trimmed = value.trim();

  if (/^\d+\s+\d+\/\d+$/.test(trimmed)) {
    const [whole, frac] = trimmed.split(" ");
    const [num, den] = frac.split("/").map(Number);
    if (!den) return null;
    return Number(whole) + num / den;
  }

  if (/^\d+\/\d+$/.test(trimmed)) {
    const [num, den] = trimmed.split("/").map(Number);
    if (!den) return null;
    return num / den;
  }

  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function formatQuantity(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2).replace(/\.?0+$/, "");
}

// =====================================================
// Display helpers
// These control how items look on screen
// =====================================================
function formatDisplayName(name: string) {
  if (!name) return "";

  return name
    .split(" ")
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function normalizeUnit(unit: string | null): string | null {
  if (!unit) return null;

  const u = unit.toLowerCase().replace(/\./g, "").trim();

  if (["lb", "lbs", "pound", "pounds"].includes(u)) return "lb";
  if (["oz", "ounce", "ounces"].includes(u)) return "oz";
  if (["cup", "cups"].includes(u)) return "cup";
  if (["tbsp", "tablespoon", "tablespoons"].includes(u)) return "Tbsp";
  if (["tsp", "teaspoon", "teaspoons"].includes(u)) return "tsp";
  if (["can", "cans"].includes(u)) return "can";
  if (["package", "packages", "pkg", "pkgs"].includes(u)) return "package";
  if (["clove", "cloves"].includes(u)) return "clove";
  if (["box", "boxes"].includes(u)) return "box";

  return u;
}

function pluralizeUnit(unit: string, quantity: number): string {
  if (quantity === 1) {
    if (unit === "lb") return "lb";
    if (unit === "oz") return "oz";
    if (unit === "cup") return "cup";
    if (unit === "Tbsp") return "Tbsp";
    if (unit === "tsp") return "tsp";
    if (unit === "can") return "can";
    if (unit === "package") return "package";
    if (unit === "clove") return "clove";
    return unit;
  }

  if (unit === "lb") return "lbs";
  if (unit === "oz") return "oz";
  if (unit === "cup") return "cups";
  if (unit === "Tbsp") return "Tbsp";
  if (unit === "tsp") return "tsp";
  if (unit === "can") return "cans";
  if (unit === "package") return "packages";
  if (unit === "clove") return "cloves";
  if (unit === "box") return quantity === 1 ? "box" : "boxes";
  return `${unit}s`;
}

// =====================================================
// Singular / plural helpers for countable items
// =====================================================
function singularizeWord(word: string): string {
  const lower = word.trim().toLowerCase();

  const irregular: Record<string, string> = {
    eggs: "egg",
    onions: "onion",
    potatoes: "potato",
    tomatoes: "tomato",
    avocados: "avocado",
    bananas: "banana",
    apples: "apple",
    oranges: "orange",
    lemons: "lemon",
    limes: "lime",
    tortillas: "tortilla",
    buns: "bun",
    rolls: "roll",
    bagels: "bagel",
    carrots: "carrot",
    cucumbers: "cucumber",
    zucchinis: "zucchini",
    jalapenos: "jalapeno",
    cloves: "clove",
  };

  if (irregular[lower]) return irregular[lower];
  if (lower.endsWith("ies")) return `${lower.slice(0, -3)}y`;
  if (lower.endsWith("oes")) return lower.slice(0, -2);
  if (lower.endsWith("es")) return lower.slice(0, -2);
  if (lower.endsWith("s") && !lower.endsWith("ss")) return lower.slice(0, -1);
  return lower;
}

function pluralizeCountable(name: string, quantity: number): string {
  if (quantity === 1) return name;

  const irregular: Record<string, string> = {
    egg: "eggs",
    onion: "onions",
    potato: "potatoes",
    tomato: "tomatoes",
    avocado: "avocados",
    banana: "bananas",
    apple: "apples",
    orange: "oranges",
    lemon: "lemons",
    lime: "limes",
    tortilla: "tortillas",
    bun: "buns",
    roll: "rolls",
    bagel: "bagels",
    carrot: "carrots",
    cucumber: "cucumbers",
    zucchini: "zucchinis",
    jalapeno: "jalapenos",
    clove: "cloves",
    "chicken breast": "chicken breasts",
    "chicken thigh": "chicken thighs",
    drumstick: "drumsticks",
    porkchop: "porkchops",
    "pork chop": "pork chops",
    "hamburger bun": "hamburger buns",
    "hot dog bun": "hot dog buns",
  };

  return irregular[name] || `${name}s`;
}

// =====================================================
// Ingredient cleanup
// This is where recipe-style ingredient lines get cleaned
// into shopper-friendly names
// =====================================================
const SECTION_HEADER_PATTERNS = [
  /seasoning:?$/,
  /sauce:?$/,
  /glaze:?$/,
  /topping:?$/,
  /toppings:?$/,
  /marinade:?$/,
  /dressing:?$/,
  /filling:?$/,
];

const RECIPE_STYLE_PHRASES = [
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
  "serve with",
  "if desired",
  "if using",
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
  "ripe",
  "trimmed",
  "thawed",
];

function cleanupSpacing(text: string) {
  return text
    .replace(/^[-•*]\s*/, "")
    .replace(/\b(\w+)\s+\1\b/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[:]+$/, "");
}

function isSectionHeader(text: string) {
  const cleaned = cleanupSpacing(text.toLowerCase());
  if (!cleaned) return true;
  if (text.trim().endsWith(":")) return true;
  return SECTION_HEADER_PATTERNS.some((pattern) => pattern.test(cleaned));
}

function removeRecipeStylePhrases(text: string) {
  let next = text;
  RECIPE_STYLE_PHRASES.forEach((phrase) => {
    next = next.replaceAll(phrase, " ");
  });
  return next;
}

function normalizePantryAndSeasonings(text: string) {
  const cleaned = cleanupSpacing(text);

  if (cleaned === "salt and pepper" || cleaned === "salt and black pepper") {
    return "salt / pepper";
  }

  return text
    // repair previously saved bad pepper names
    .replace(/\bgreen bell black pepper\b/g, "green bell pepper")
    .replace(/\bred bell black pepper\b/g, "red bell pepper")
    .replace(/\byellow bell black pepper\b/g, "yellow bell pepper")
    .replace(/\bcayenne black pepper\b/g, "cayenne pepper")
    .replace(/\bred black pepper flakes\b/g, "red pepper flakes")
    .replace(/\bsalt and black pepper\b/g, "salt / pepper")

    // normalize only true black pepper references
    .replace(/\bfreshly ground black pepper\b/g, "black pepper")
    .replace(/\bground black pepper\b/g, "black pepper")
    .replace(/\bfreshly ground pepper\b/g, "black pepper")
    .replace(/\bground pepper\b/g, "black pepper")
    .replace(/\bblack pepper\b/g, "black pepper")
    .replace(/\bblack black pepper\b/g, "black pepper")

    // keep these as their own real ingredients
    .replace(/\bgreen bell pepper\b/g, "green bell pepper")
    .replace(/\bred bell pepper\b/g, "red bell pepper")
    .replace(/\byellow bell pepper\b/g, "yellow bell pepper")
    .replace(/\bjalapeno pepper\b/g, "jalapeno")
    .replace(/\bcayenne pepper\b/g, "cayenne pepper")
    .replace(/\bred pepper flakes\b/g, "red pepper flakes")

    // seasoning cleanup
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
    .replace(/\bsweet potatoes\b/g, "sweet potato")
    .replace(/\bsweet potatoe\b/g, "sweet potato")
    .replace(/\bgarlic cloves?\b/g, "garlic")
    .replace(/\bcloves? garlic\b/g, "garlic")
    .replace(/\bminced garlic\b/g, "garlic")
    .replace(/\bgarlic, minced\b/g, "garlic")
    .replace(/\byellow onions?\b/g, "yellow onion")
    .replace(/\bwhite onions?\b/g, "white onion")
    .replace(/\bred onions?\b/g, "red onion")
    .replace(/\bgreen onions?\b/g, "green onion")
    .replace(/\bonions?\b/g, "onion")
    .replace(/\bcarrots?\b/g, "carrot")
    .replace(/\beggs?\b/g, "egg")
    .replace(/\bspinach leaves\b/g, "spinach")
    .replace(/\bmint leaves?\b/g, "mint")
    .replace(/\bmint sprigs?\b/g, "mint")
    .replace(/\bcilantro leaves?\b/g, "cilantro")
    .replace(/\bparsley leaves?\b/g, "parsley")
    .replace(/\bjalapeños?\b/g, "jalapeno")
    .replace(/\bjalapenos?\b/g, "jalapeno")
    .replace(/\bjalapeno peppers?\b/g, "jalapeno");
}

function normalizeProteinsAndBakery(text: string) {
  return text
    .replace(/\bextra lean ground beef\b/g, "ground beef")
    .replace(/\blean ground beef\b/g, "ground beef")
    .replace(/\bhot dog buns?\b/g, "hot dog bun")
    .replace(/\bhot dogs?\b/g, "hot dog")
    .replace(/\bhamburger buns?\b/g, "hamburger bun")
    .replace(/\bchicken breasts?\b/g, "chicken breast")
    .replace(/\bchicken thighs?\b/g, "chicken thigh")
    .replace(/\bdrumsticks?\b/g, "drumstick")
    .replace(/\bpork chops?\b/g, "pork chop");
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

function removePrepWords(text: string) {
  let next = text;
  PREP_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    next = next.replace(regex, " ");
  });
  return next;
}

function removeNonShoppingItems(text: string) {
  return text
    .replace(/\bwater\b/g, "")
    .replace(/\bice\b/g, "")
    .replace(/\s*\+\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeIngredientText(text: string) {
  let next = text;
  next = normalizePantryAndSeasonings(next);
  next = normalizeProduce(next);
  next = normalizeProteinsAndBakery(next);
  next = normalizeDairyAndCheese(next);
  next = normalizeMushrooms(next);
  next = removeNonShoppingItems(next);
  next = removePrepWords(next);
  return next;
}

// =====================================================
// Ingredient cleanup
// This is where recipe-style ingredient lines get cleaned
// into shopper-friendly names
// =====================================================
function cleanIngredientName(line: string) {
  let text = line
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  text = text.replace(/^[/\\\-–—]+\s*/, "");
  text = text.replace(/\([^)]*\)/g, " ");
  text = cleanupSpacing(text);

  if (isSectionHeader(text)) return "";

  text = removeRecipeStylePhrases(text);
  text = text.replace(/^\s*up to\s+/i, "");
  text = text.replace(/^\s*to\s+/i, "");
  text = normalizeIngredientText(text);

  // special cleanup for quantity + common countables
  text = text.replace(
    /^\d*\.?\d+\s+(carrot|onion|red onion|yellow onion|white onion|green onion|egg|garlic|jalapeno|mint|onion powder|garlic powder)\b/g,
    "$1"
  );

  // remove loose alternate phrasing like "or pickled"
  text = text.replace(/\bor\s+[a-z\s]+/g, "");

  // final cleanup
  text = text.split(",")[0];
  text = cleanupSpacing(text);

  return text;
}

// =====================================================
// Ingredient parsing
// This figures out quantity, unit, cleaned name,
// and supports ranges like "4 to 6 hamburger buns"
// =====================================================
function parseIngredient(line: string): ParsedIngredient {
  const raw = line
    .trim()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ");

  const measuredRangeMatch = raw.match(
    /^\s*(\d+\s\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+\s\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s+(lb|lbs|pound|pounds|oz|ounce|ounces|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|can|cans|package|packages|pkg|pkgs|box|boxes|clove|cloves)\s+(.*)$/i
  );

  if (measuredRangeMatch) {
    const [, minRaw, maxRaw, unitRaw, rest] = measuredRangeMatch;

    return {
      quantity: parseFraction(maxRaw),
      minQuantity: parseFraction(minRaw),
      maxQuantity: parseFraction(maxRaw),
      unit: normalizeUnit(unitRaw),
      name: cleanIngredientName(rest),
    };
  }

  const countedRangeMatch = raw.match(
    /^\s*(\d+\s\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+\s\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s+(.+)$/i
  );

  if (countedRangeMatch) {
    const [, minRaw, maxRaw, rest] = countedRangeMatch;

    return {
      quantity: parseFraction(maxRaw),
      minQuantity: parseFraction(minRaw),
      maxQuantity: parseFraction(maxRaw),
      unit: "__count__",
      name: cleanIngredientName(rest),
    };
  }

  const measuredMatch = raw.match(
    /^\s*(\d+\s\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s+(lb|lbs|pound|pounds|oz|ounce|ounces|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|can|cans|package|packages|pkg|pkgs|clove|cloves|box|boxes)\s+(.*)$/i
  );

  if (measuredMatch) {
    const [, qtyRaw, unitRaw, rest] = measuredMatch;

    return {
      quantity: parseFraction(qtyRaw),
      minQuantity: parseFraction(qtyRaw),
      maxQuantity: parseFraction(qtyRaw),
      unit: normalizeUnit(unitRaw),
      name: cleanIngredientName(rest),
    };
  }

  const countedMatch = raw.match(
    /^\s*(\d+\s\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s+(.+)$/i
  );

  if (countedMatch) {
    const [, qtyRaw, rest] = countedMatch;

    return {
      quantity: parseFraction(qtyRaw),
      minQuantity: parseFraction(qtyRaw),
      maxQuantity: parseFraction(qtyRaw),
      unit: "__count__",
      name: cleanIngredientName(rest),
    };
  }

  return {
    quantity: null,
    minQuantity: null,
    maxQuantity: null,
    unit: null,
    name: cleanIngredientName(raw),
  };
}

// =====================================================
// Countable ingredient helpers
// =====================================================
function normalizeCountableName(name: string): string {
  const cleaned = cleanIngredientName(name);
  const lower = cleaned.toLowerCase();

  if (COUNTABLE_PHRASES[lower]) return COUNTABLE_PHRASES[lower];

  const words = lower.split(" ").filter(Boolean);
  if (!words.length) return lower;

  if (words.length === 1) {
    const singular = singularizeWord(words[0]);
    if (COUNTABLE_BASE_WORDS.has(singular)) return singular;
  }

  return lower;
}

function isCountableIngredient(name: string): boolean {
  const normalized = normalizeCountableName(name);
  const cleaned = cleanIngredientName(name).toLowerCase();

  if (normalized !== cleaned) return true;

  const words = normalized.split(" ").filter(Boolean);
  if (!words.length) return false;

  const lastWord = singularizeWord(words[words.length - 1]);
  return COUNTABLE_BASE_WORDS.has(lastWord);
}

// =====================================================
// Measured total display rules
// =====================================================
function shouldShowMeasuredTotal(
  name: string,
  unit: string | null,
  total: number
) {
  const cleaned = cleanIngredientName(name).toLowerCase();

  if (!unit) return false;
  if (HIDE_MEASURED_TOTALS.has(cleaned)) return false;
  if (ALWAYS_SHOW_MEASURED_TOTALS.has(cleaned)) return true;

  if (["lb", "oz", "can", "package", "box"].includes(unit)) {
    return true;
  }

  if ((unit === "cup" || unit === "Tbsp" || unit === "tsp") && total >= 2) {
    return true;
  }

  return false;
}


function resolveShoppingCategory(name: string): GroceryCategory {
  const cleaned = cleanIngredientName(name).toLowerCase();

  const forcedSpices = new Set([
    "salt",
    "black pepper",
    "salt / pepper",
    "garlic powder",
    "onion powder",
    "paprika",
    "italian seasoning",
    "cumin",
    "chili powder",
    "oregano",
    "cajun seasoning",
    "old bay seasoning",
    "seasoned salt",
    "red pepper flakes",
  ]);

  if (forcedSpices.has(cleaned)) {
    return "Spices" as GroceryCategory;
  }

  return categorizeGroceryItem(cleaned);
}

function shouldHideShoppingItem(name: string) {
  const cleaned = cleanIngredientName(name).toLowerCase();

  return (
    !cleaned ||
    [
      "salt / pepper",
      "salt and pepper",
      "salt and black pepper",
      "water",
      "ice",
      "cup",
      "cups",
      "tsp",
      "tbsp",
      "oz",
      "lb",
      "can",
      "cans",
      "box",
      "boxes",
      "package",
      "packages",
    ].includes(cleaned)
  );
}

// =====================================================
// Manual item id helper
// =====================================================
function makeManualId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// =====================================================
// Page component
// =====================================================
export default function ShoppingListPage() {
  const [newItem, setNewItem] = useState("");
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() =>
    loadShoppingList()
  );
  const [hideChecked, setHideChecked] = useState(false);
  const [touchStartX, setTouchStartX] = useState<Record<string, number>>({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editText, setEditText] = useState("");
  const [editingGroup, setEditingGroup] = useState<CombinedItem | null>(null);

  // =====================================================
  // Refresh list when returning to page
  // =====================================================
  useEffect(() => {
    const refresh = () => {
      setShoppingItems(loadShoppingList());
    };

    refresh();

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  // =====================================================
  // Save helper
  // =====================================================
  const persistShoppingItems = (updated: ShoppingItem[]) => {
    setShoppingItems(updated);
    saveShoppingList(updated);
  };

  // =====================================================
  // Manual add item
  // =====================================================
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();

    const raw = newItem.trim();
    if (!raw) return;

    const cleanedRaw = cleanIngredientName(raw);
    const parsed = parseIngredient(cleanedRaw);
    const cleanedName = parsed.name || cleanedRaw;
    if (!cleanedName) {
      setNewItem("");
      return;
    }

    const id = makeManualId(cleanedName || raw);

    const alreadyExists = shoppingItems.some(
      (item) => item.text.trim().toLowerCase() === cleanedName.toLowerCase()
    );

    if (alreadyExists) {
      setNewItem("");
      return;
    }

    const added: ShoppingItem = {
      id,
      text: cleanedName,
      checked: false,
      addedAt: Date.now(),
      category: resolveShoppingCategory(cleanedName),
      sourceRecipe: "",
    } as ShoppingItem & { sourceRecipe?: string };

    persistShoppingItems([...shoppingItems, added]);
    setNewItem("");
  };

  // =====================================================
  // Toggle grouped item checked state
  // =====================================================
  const toggleItemGroup = (group: CombinedItem) => {
    const shouldCheck = !group.checked;

    const updated = shoppingItems.map((item) =>
      group.sourceIds.includes(item.id) ? { ...item, checked: shouldCheck } : item
    );

    persistShoppingItems(updated);
  };

  // =====================================================
  // Delete grouped item
  // =====================================================
  const deleteItemGroup = (group: CombinedItem) => {
    const updated = shoppingItems.filter(
      (item) => !group.sourceIds.includes(item.id)
    );
    persistShoppingItems(updated);
  };

  // =====================================================
  // Clear helpers
  // =====================================================
  const clearCheckedItems = () => {
    persistShoppingItems(shoppingItems.filter((item) => !item.checked));
  };

  const clearAllItems = () => {
    const confirmed = window.confirm("Clear your entire shopping list?");
    if (!confirmed) return;
    persistShoppingItems([]);
  };

  const checkedCount = shoppingItems.filter((item) => item.checked).length;

  // =====================================================
  // Combine / merge shopping items for cleaner display
  // =====================================================
  const combinedItems = useMemo(() => {
    const map = new Map<
      string,
      {
        checked: boolean;
        category: GroceryCategory;
        sourceIds: string[];
        count: number;
        name: string;
        isCountable: boolean;
        totalQuantity: number;
        minQuantity: number;
        maxQuantity: number;
        unit: string | null;
        mixedUnits: boolean;
        recipeNames: Set<string>;
      }
    >();

    for (const item of shoppingItems) {
      const cleanedRaw = cleanIngredientName(item.text);
      const parsed = parseIngredient(cleanedRaw);
      const cleanedName = parsed.name || cleanedRaw;
      if (shouldHideShoppingItem(cleanedName)) continue;

      const isMeasured = parsed.unit !== null && parsed.unit !== "__count__";
const isCountable = !isMeasured && isCountableIngredient(cleanedName);
      const normalizedName = isCountable
        ? normalizeCountableName(cleanedName)
        : cleanedName.toLowerCase();

      const category = resolveShoppingCategory(normalizedName);
      const mergeUnit = isCountable ? "__count__" : parsed.unit;
      const key = `${category}::${normalizedName}`;

      const quantityToAdd =
  parsed.quantity !== null
    ? isCountable
      ? Math.ceil(parsed.quantity)
      : parsed.quantity
    : isCountable
    ? 1
    : 0;

      const minQuantityToAdd =
  parsed.minQuantity !== null && parsed.minQuantity !== undefined
    ? isCountable
      ? Math.ceil(parsed.minQuantity)
      : parsed.minQuantity
    : quantityToAdd;

const maxQuantityToAdd =
  parsed.maxQuantity !== null && parsed.maxQuantity !== undefined
    ? isCountable
      ? Math.ceil(parsed.maxQuantity)
      : parsed.maxQuantity
    : quantityToAdd;

      const recipeName = String((item as any).sourceRecipe || "").trim();

      const existing = map.get(key);

      if (existing) {
        existing.sourceIds.push(item.id);
        existing.count += 1;
        existing.checked = existing.checked && item.checked;

        if (quantityToAdd > 0) {
          existing.totalQuantity += quantityToAdd;
          existing.minQuantity =
            existing.minQuantity > 0
              ? Math.min(existing.minQuantity, minQuantityToAdd)
              : minQuantityToAdd;
          existing.maxQuantity = Math.max(
            existing.maxQuantity,
            maxQuantityToAdd
          );
        }

        if (existing.unit !== mergeUnit) {
          if (existing.unit !== null || mergeUnit !== null) {
            existing.mixedUnits = true;
          }
        }

        if (recipeName) {
          existing.recipeNames.add(recipeName);
        }
      } else {
        map.set(key, {
          checked: item.checked,
          category,
          sourceIds: [item.id],
          count: 1,
          name: normalizedName,
          isCountable,
          totalQuantity: quantityToAdd,
          minQuantity: minQuantityToAdd,
          maxQuantity: maxQuantityToAdd,
          unit: mergeUnit ?? null,
          mixedUnits: false,
          recipeNames: recipeName ? new Set([recipeName]) : new Set(),
        });
      }
    }

    return Array.from(map.entries()).map(([key, value]) => {
      let displayText = formatDisplayName(value.name);

      if (value.isCountable) {
  const qty = value.totalQuantity > 0 ? value.totalQuantity : value.count;

  const baseName = singularizeWord(value.name);

  // ✅ round everything here
  const min = Math.ceil(value.minQuantity || qty);
  const max = Math.ceil(value.maxQuantity || qty);
  const finalQty = Math.ceil(qty);

  const formattedName = formatDisplayName(
    pluralizeCountable(baseName, finalQty)
  );

  // ✅ collapse 1–1 → 1
  if (min !== max) {
    displayText = `${min}-${max} ${formattedName}`;
  } else {
    displayText = `${finalQty} ${formattedName}`;
  }
      } else if (
        !value.mixedUnits &&
        value.unit &&
        value.totalQuantity > 0 &&
        shouldShowMeasuredTotal(value.name, value.unit, value.totalQuantity)
      ) {
        const formattedName = formatDisplayName(value.name);
        displayText = `${formattedName}, ${formatQuantity(
          value.totalQuantity
        )} ${pluralizeUnit(value.unit, value.totalQuantity)}`;
      }

      const recipeCount = value.recipeNames.size;

      return {
        id: key,
        checked: value.checked,
        category: value.category,
        sourceIds: value.sourceIds,
        count: value.count,
        recipeCount,
        recipeCountLabel: recipeCount > 1 ? `(${recipeCount} recipes)` : "",
        displayText,
      } satisfies CombinedItem;
    });
  }, [shoppingItems]);

  // =====================================================
  // Group items by grocery section
  // =====================================================
  const grouped = useMemo(() => {
    const visibleItems = hideChecked
      ? combinedItems.filter((item) => !item.checked)
      : combinedItems;

    return GROCERY_CATEGORY_ORDER.map((section) => ({
      section,
      items: visibleItems.filter((item) => item.category === section),
    })).filter((group) => group.items.length > 0);
  }, [combinedItems, hideChecked]);

  const openEditItem = (group: CombinedItem) => {
    setEditingGroup(group);
    setEditText(group.displayText);
    setEditModalOpen(true);
  };

  const handleSaveEditItem = () => {
    const trimmed = editText.trim();
    if (!trimmed || !editingGroup) return;

    const updated = shoppingItems.map((item) =>
      editingGroup.sourceIds.includes(item.id)
        ? {
            ...item,
            text: trimmed,
            category: resolveShoppingCategory(trimmed),
          }
        : item
    );

    persistShoppingItems(updated);
    setEditModalOpen(false);
    setEditingGroup(null);
    setEditText("");
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingGroup(null);
    setEditText("");
  };

  // =====================================================
  // Render
  // =====================================================
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 20px 120px 20px",
      }}
    >
      <div style={{ maxWidth: "550px", width: "100%" }}>
        <header>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h1>Shopping List</h1>
            <TipsModal tips={SHOPPING_TIPS} />
          </div>
        </header>

        <Card style={{ marginBottom: 8 }}>
          <form onSubmit={handleAddItem} style={{ display: "flex", gap: 10 }}>
            <input
              placeholder="Add groceries or household items"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              style={{
                flex: 1,
                padding: "14px 16px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "white",
                outline: "none",
                fontSize: 14,
              }}
            />

            <button
              type="submit"
              style={{
                width: 50,
                borderRadius: "14px",
                background: "#22c55e",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={20} />
            </button>
          </form>
        </Card>

        <div
          style={{
            marginTop: 8,
            marginBottom: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setHideChecked((prev) => !prev)}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
              fontSize: 11,
              fontWeight: 800,
              padding: "6px 12px",
              borderRadius: "999px",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              letterSpacing: 0.3,
            }}
          >
            {hideChecked ? <Eye size={14} /> : <EyeOff size={14} />}
            {hideChecked ? "SHOW CHECKED" : "HIDE CHECKED"}
          </button>

          {shoppingItems.length > 0 && (
            <button
              onClick={clearAllItems}
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#ef4444",
                fontSize: 11,
                fontWeight: 800,
                padding: "6px 12px",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                letterSpacing: 0.3,
              }}
            >
              CLEAR ALL
            </button>
          )}

          {checkedCount > 0 && (
            <button
              onClick={clearCheckedItems}
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#ef4444",
                fontSize: 11,
                fontWeight: 800,
                padding: "6px 12px",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                letterSpacing: 0.3,
              }}
            >
              CLEAR CHECKED ({checkedCount})
            </button>
          )}
        </div>

        {grouped.map((group) => (
          <div key={group.section} style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.1)",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: 1.5,
                  opacity: 0.5,
                }}
              >
                {group.section.toUpperCase()}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.1)",
                }}
              />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {group.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleItemGroup(item)}
                  onTouchStart={(e) =>
                    setTouchStartX((prev) => ({
                      ...prev,
                      [item.id]: e.targetTouches[0].clientX,
                    }))
                  }
                  onTouchEnd={(e) => {
                    const start = touchStartX[item.id];
                    if (start == null) return;

                    const end = e.changedTouches[0].clientX;
                    const delta = start - end;

                    if (delta > 70) {
                      deleteItemGroup(item);
                    }

                    setTouchStartX((prev) => {
                      const next = { ...prev };
                      delete next[item.id];
                      return next;
                    });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: "14px",
                    background: item.checked
                      ? "transparent"
                      : "rgba(255,255,255,0.05)",
                    border: item.checked
                      ? "1px solid rgba(255,255,255,0.05)"
                      : "1px solid rgba(255,255,255,0.1)",
                    opacity: item.checked ? 0.3 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    {item.checked ? (
                      <CheckCircle2 size={18} color="#22c55e" />
                    ) : (
                      <Circle size={18} style={{ opacity: 0.2, flexShrink: 0 }} />
                    )}

                    <span
                      style={{
                        fontWeight: 600,
                        textDecoration: item.checked ? "line-through" : "none",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.displayText}
                      {item.recipeCountLabel ? (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 12,
                            opacity: 0.6,
                            fontWeight: 800,
                          }}
                        >
                          {item.recipeCountLabel}
                        </span>
                      ) : null}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditItem(item);
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "white",
                        opacity: 0.7,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        flexShrink: 0,
                      }}
                      aria-label={`Edit ${item.displayText}`}
                      title="Edit item"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItemGroup(item);
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.14)",
                        color: "#ef4444",
                        opacity: 0.75,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        flexShrink: 0,
                      }}
                      aria-label={`Delete ${item.displayText}`}
                      title="Delete item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {grouped.length === 0 && (
          <div style={{ textAlign: "center", padding: 80, opacity: 0.2 }}>
            <ShoppingCart size={48} style={{ marginBottom: 16 }} />
            <div style={{ fontWeight: 800 }}>
              {hideChecked ? "No unchecked items" : "List is empty"}
            </div>
          </div>
        )}

        {editModalOpen && (
          <div
            onClick={handleCloseEditModal}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 20,
              backdropFilter: "blur(6px)",
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEditItem();
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 420,
                background: "rgba(17,17,17,0.96)",
                borderRadius: 22,
                padding: 20,
                display: "grid",
                gap: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
                transform: "scale(1)",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ display: "grid", gap: 3 }}>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>Edit Item</div>
                  <div style={{ fontSize: 12, opacity: 0.55 }}>
                    Update the item name or quantity.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    flexShrink: 0,
                  }}
                  aria-label="Close edit item"
                  title="Close"
                >
                  <X size={17} />
                </button>
              </div>

              <input
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Example: 2 red onions"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  color: "white",
                  outline: "none",
                  fontSize: 15,
                  transition: "border 0.18s ease, box-shadow 0.18s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border =
                    "1px solid rgba(34,197,94,0.55)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 4px rgba(34,197,94,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border =
                    "1px solid rgba(255,255,255,0.12)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />

              <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
                <button
                  type="submit"
                  disabled={!editText.trim()}
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: editText.trim()
                      ? "rgba(34,197,94,0.15)"
                      : "rgba(255,255,255,0.04)",
                    border: editText.trim()
                      ? "1px solid rgba(34,197,94,0.35)"
                      : "1px solid rgba(255,255,255,0.08)",
                    color: editText.trim() ? "#86efac" : "rgba(255,255,255,0.35)",
                    fontWeight: 900,
                    cursor: editText.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "white",
                    opacity: 0.82,
                    fontWeight: 800,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}