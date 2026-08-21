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
  Share2,
  Sparkles,
  Image as ImageIcon,
  ImageOff,
} from "lucide-react";
import Card from "../components/Card";
import SmartShoppingThumbnail from "../components/SmartShoppingThumbnail";
import {
  loadSmartShoppingPreferences,
  setShowSmartShoppingPictures,
  SMART_SHOPPING_PREFERENCES_CHANGED_EVENT,
  type SmartShoppingPreferences,
} from "../plus/smartShoppingPreferences";
import {
  loadRawShoppingList,
  saveShoppingList,
  SHOPPING_LIST_CHANGED_EVENT,
  type ShoppingItem,
} from "../shoppingList";
import {
  categorizeGroceryItem,
  type GroceryCategory,
  GROCERY_CATEGORY_ORDER,
} from "../core/groceryCategories";
import TipsModal from "../components/TipsModal";
import SmartShoppingPreviewModal from "../components/SmartShoppingPreviewModal";
import {
  buildShoppingListSignature,
  buildSmartShoppingApplyPlan,
  buildSmartShoppingPreview,
  canonicalizeSmartShoppingName,
  type SmartShoppingApplyPlan,
  type SmartShoppingPreview,
} from "../plus/smartShopping";
import { t, getStoredLanguage } from "../i18n";
import { ShoppingSyncStatus } from "../cloud/ShoppingSyncStatus";
import {
  resolveSmartShoppingThumbnail,
  type SmartShoppingThumbnailMatchType,
} from "../plus/smartShoppingThumbnails";
import {
  usePlusAccess,
} from "../plus/usePlusAccess";

// =====================================================
// ShoppingListPage map
// 1) Types and constants
// 2) Formatting / parsing helpers
// 3) Ingredient cleanup and category rules
// 4) Manual item helpers
// 5) Page component and render
// =====================================================

// =====================================================
// Page tips
// =====================================================
const SHOPPING_TIPS = [
  t("shopping.tips.addItems"),
  t("shopping.tips.grouped"),
  t("shopping.tips.tapToCheck"),
  t("shopping.tips.selectedIngredients"),
];

// =====================================================
// Parsed / combined item types
// =====================================================
type ParsedAmount = {
  quantity: number | null;
  unit: string | null;
  name: string;
  packageSize?: string;
};

type ParsedIngredient = ParsedAmount & {
  minQuantity?: number | null;
  maxQuantity?: number | null;
};

type RecipeBreakdownItem = {
  recipeName: string;
  amountText: string;
};

type ShoppingItemWithSmartMeta = ShoppingItem & {
  normalizedName?: string;
  quantity?: number;
  unit?: string | null;
  packageSize?: string;
};

type CombinedItem = {
  id: string;
  checked: boolean;
  category: GroceryCategory;
  sourceIds: string[];
  count: number;
  recipeCount: number;
  recipeCountLabel: string;
  recipeNames: string[];
  recipeBreakdown: RecipeBreakdownItem[];
  thumbnailKey: string;
  thumbnailMatchType: SmartShoppingThumbnailMatchType;
  thumbnailAltText: string;
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
  "green bell pepper",
  "red bell pepper",
  "yellow bell pepper",
  "bell pepper",
]);

const COUNTABLE_PHRASES: Record<string, string> = {
  eggs: "egg",
  onions: "onion",
  "yellow onions": "yellow onion",
  "white onions": "white onion",
  "red onions": "red onion",
  "green onions": "green onion",
  potatoes: "potato",
  tomatoes: "tomato",
  "roma tomatoes": "roma tomato",
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
  "green bell peppers": "green bell pepper",
  "red bell peppers": "red bell pepper",
  "yellow bell peppers": "yellow bell pepper",
  "bell peppers": "bell pepper",
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
  "baby bella mushrooms",
  "parsley",
  "cilantro",
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
  "simple syrup",
]);

// =====================================================
// Recipe merge rules
// Keep these top-level so the shopping "brain" is easy to scan.
// =====================================================
const FORCE_COUNTABLE_RECIPE_ITEMS = new Set([
  "chicken breast",
  "chicken thigh",
  "drumstick",
  "pork chop",
  "porkchop",
  "garlic",
]);

const SMART_SHOPPING_FORCE_COUNTABLE_ITEMS = new Set([
  "bell pepper",
  "green bell pepper",
  "red bell pepper",
  "yellow bell pepper",
  "orange bell pepper",
]);

const MERGE_AS_SINGLE_SPICES = new Set([
  "salt",
  "black pepper",
  "paprika",
  "cumin",
  "chili powder",
  "oregano",
  "garlic powder",
  "onion powder",
  "italian seasoning",
  "red pepper flakes",
  "cayenne pepper",
  "seasoning",
]);

const MERGE_AS_SINGLE_DAIRY_ITEMS = new Set([
  "butter",
  "sour cream",
  "cream cheese",
  "parmesan cheese",
]);

const MERGE_AS_SINGLE_BAKING_ITEMS = new Set([
  "powdered sugar",
  "confectioners sugar",
  "confectioner's sugar",
  "azucar glas",
  "azúcar glas",
]);

const DEFAULT_CAN_PACKAGE_SIZE_BY_NAME: Record<string, string> = {
  "black beans": "15 oz",
  corn: "15 oz",
};

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

function formatQuantity(value: number | null | undefined) {
  if (value === null || value === undefined) return "";

  const rounded = Math.round(value * 1000) / 1000;

  if (Number.isInteger(rounded)) return String(rounded);

  const whole = Math.floor(rounded);
  const fraction = rounded - whole;

  const fractions: Array<[number, string]> = [
    [0.125, "1/8"],
    [0.25, "1/4"],
    [0.333, "1/3"],
    [0.5, "1/2"],
    [0.667, "2/3"],
    [0.75, "3/4"],
  ];

  const match = fractions.find(([amount]) => Math.abs(fraction - amount) < 0.02);

  if (match) {
    const [, label] = match;
    return whole > 0 ? `${whole} ${label}` : label;
  }

  return rounded.toFixed(2).replace(/\.?0+$/, "");
}

// =====================================================
// Display helpers
// These control how items look on screen
// =====================================================
const SMALL_TITLE_WORDS = new Set([
  "of",
  "and",
  "or",
  "the",
  "a",
  "an",
  "with",
  "in",

  // Spanish connector words
  "de",
  "del",
  "la",
  "las",
  "el",
  "los",
  "y",
  "con",
  "en",
]);

function formatDisplayName(name: string) {
  if (!name) return "";

  const cleaned = String(name || "")
    // Repair malformed wording from older saved shopping items.
    .replace(/\bhot dogs\s+(bun|buns)\b/gi, "hot dog $1")
    .replace(/^de\s+/i, "")
    .replace(/^del\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "";

  if (getStoredLanguage() === "es") {
    const lower = cleaned.toLowerCase();

    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  return cleaned
    .split(" ")
    .map((word, index) => {
      if (!word) return word;

      const lower = word.toLowerCase();
      if (index !== 0 && SMALL_TITLE_WORDS.has(lower)) {
        return lower;
      }

      return lower.charAt(0).toUpperCase() + lower.slice(1);
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
  if (["jar", "jars"].includes(u)) return "jar";
  if (["carton", "cartons"].includes(u)) return "carton";
  if (["bag", "bags"].includes(u)) return "bag";
  if (["bunch", "bunches"].includes(u)) return "bunch";
  if (["strip", "strips"].includes(u)) return "strip";
  if (["tube", "tubes"].includes(u)) return "tube";
  if (["packet", "packets"].includes(u)) return "packet";
  if (["slice", "slices"].includes(u)) return "slice";

  return u;
}

function pluralizeUnit(unit: string, quantity: number): string {
  if (quantity === 1 || quantity < 1) {
    if (unit === "lb") return "lb";
    if (unit === "oz") return "oz";
    if (unit === "cup") return "cup";
    if (unit === "Tbsp") return "Tbsp";
    if (unit === "tsp") return "tsp";
    if (unit === "can") return "can";
    if (unit === "package") return "package";
    if (unit === "slice") {
      return quantity === 1 ? "slice" : "slices";
    }
    if (unit === "strip") {
      return quantity === 1 ? "strip" : "strips";
    }
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
  if (unit === "jar") return quantity === 1 ? "jar" : "jars";
  if (unit === "carton") return quantity === 1 ? "carton" : "cartons";
  if (unit === "bag") return quantity === 1 ? "bag" : "bags";
  if (unit === "bunch") return quantity === 1 ? "bunch" : "bunches";
  if (unit === "tube") return quantity === 1 ? "tube" : "tubes";
  if (unit === "packet") return quantity === 1 ? "packet" : "packets";
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
    "sweet potato": "sweet potatoes",
    tomato: "tomatoes",
    "roma tomato": "roma tomatoes",
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
    zucchini: "zucchini",
    jalapeno: "jalapenos",
    clove: "cloves",
    "chicken breast": "chicken breasts",
    "chicken thigh": "chicken thighs",
    drumstick: "drumsticks",
    porkchop: "porkchops",
    "pork chop": "pork chops",
    "hamburger bun": "hamburger buns",
    "hot dog bun": "hot dog buns",
    "green bell pepper": "green bell peppers",
    "red bell pepper": "red bell peppers",
    "yellow bell pepper": "yellow bell peppers",
    "bell pepper": "bell peppers",
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
  "for dusting",
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
    // Recipe amounts such as "a pinch of" are not useful
    // as the shopper-facing ingredient identity.
    .replace(/^(?:a\s+)?pinch(?:\s+of)?\s+/g, "")

    // repair older saved bad names first
    .replace(/\bgreen bell black pepper\b/g, "green bell pepper")
    .replace(/\bred bell black pepper\b/g, "red bell pepper")
    .replace(/\byellow bell black pepper\b/g, "yellow bell pepper")
    .replace(/\bcayenne black pepper\b/g, "cayenne pepper")
    .replace(/\bred black pepper flakes\b/g, "red pepper flakes")
    .replace(/\bsalt and black pepper\b/g, "salt / pepper")

    // true black pepper references
    .replace(/\bfreshly ground black pepper\b/g, "black pepper")
    .replace(/\bground black pepper\b/g, "black pepper")
    .replace(/\bfreshly ground pepper\b/g, "black pepper")
    .replace(/\bground pepper\b/g, "black pepper")
    .replace(/\bblack black pepper\b/g, "black pepper")
    .replace(/\bcracked black pepper\b/g, "black pepper")
    .replace(/\bfresh cracked black pepper\b/g, "black pepper")
    .replace(/\bfreshly cracked black pepper\b/g, "black pepper")


    // safe fallback: plain "pepper" becomes black pepper, but real peppers stay real peppers
    .replace(/\bpepper\b/g, (match, offset, full) => {
      const before = full.slice(0, offset).trimEnd();
      const after = full.slice(offset + match.length).trimStart();

      if (
        before.endsWith("bell") ||
        before.endsWith("cayenne") ||
        before.endsWith("red") ||
        before.endsWith("green") ||
        before.endsWith("yellow") ||
        after.startsWith("flakes")
      ) {
        return match;
      }

      return "black pepper";
    })

    .replace(/\bblack black pepper\b/g, "black pepper")
    .replace(/\bjalapeno pepper\b/g, "jalapeno")
    .replace(/\bonion powders?\b/g, "onion powder")
    .replace(/\bgarlic powders?\b/g, "garlic powder")
    .replace(/\bsmoked paprika\b/g, "paprika")
    .replace(/\bpaprikas\b/g, "paprika")
    .replace(/\bchile powder\b/g, "chili powder")
    .replace(/\bground cumin\b/g, "cumin");
}

function normalizeProduce(text: string) {
  return text
    .replace(/\bjuice of (\d+ )?lemons?\b/g, "lemon")
    .replace(/\blemon juice\b/g, "lemon")
    .replace(/\blemon zest\b/g, "lemon")
    .replace(/\bsweet potatoes\b/g, "sweet potato")
    .replace(/\bsweet potatoe\b/g, "sweet potato")
    .replace(/\broma tomato(?:es|s)?\b/g, "roma tomato")
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
    .replace(/\bjalapeno peppers?\b/g, "jalapeno")
    .replace(/\bcoleslaw mix\b/g, "coleslaw mix");
}

function normalizeProteinsAndBakery(text: string) {
  return text
    .replace(/\bextra lean ground beef\b/g, "ground beef")
    .replace(/\blean ground beef\b/g, "ground beef")
    .replace(/\bhot dogs?\s+buns?\b/g, "hot dog bun")
    .replace(/\bhot dogs?\b/g, "hot dogs")
    .replace(/\bhamburger buns?\b/g, "hamburger bun")
    .replace(/\bchicken breasts?\b/g, "chicken breast")
    .replace(/\bchicken thighs?\b/g, "chicken thigh")
    .replace(/\bdrumsticks?\b/g, "drumstick")
    .replace(/\bpork chops?\b/g, "pork chop")
    .replace(/\bbone-in pork chops?\b/g, "pork chop")
    .replace(/\bsalmon fillets?\b/g, "salmon")
    .replace(/\bsalmon filet\b/g, "salmon")
    .replace(/\bsalmon filets\b/g, "salmon");
}

function normalizeDairyAndCheese(text: string) {
  return text
    // If a recipe only says "shredded cheese", treat it as shredded cheddar.
    // It is much more useful on a shopping list than plain "Cheese".
    .replace(/\bshredded cheese\b/g, "shredded cheddar cheese")
    .replace(/\bgrated cheese\b/g, "shredded cheddar cheese")
    .replace(/\bcheese slices?\b/g, "sliced cheese")
    .replace(/\bsliced cheese\b/g, "sliced cheese")
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
    .replace(/\bshredded parmesan cheese\b/g, "parmesan cheese")
    .replace(/\bparmesan, grated\b/g, "parmesan cheese")
    .replace(/\bparmesan\b/g, "parmesan cheese")
    .replace(/\bshredded swiss cheese\b/g, "swiss cheese")
    .replace(/\bswiss cheese, shredded\b/g, "swiss cheese")
    .replace(/\bsmoked gouda\b/g, "smoked gouda cheese")
    .replace(/\bgouda\b/g, "gouda cheese")
    .replace(/\bcream cheese, softened\b/g, "cream cheese")
    .replace(/\bcream cheese, cubed\b/g, "cream cheese")
    .replace(/\bunsalted butter\b/g, "butter")
    .replace(/\bsalted butter\b/g, "butter")
    .replace(/\bcold milk\b/g, "milk")
    .replace(/\bwhole milk\b/g, "milk")
    .replace(/\bheavy whipping cream\b/g, "heavy cream")
}

function normalizeMushrooms(text: string) {
  return text
    .replace(/\bcremini mushrooms?\b/g, "baby bella mushrooms")
    .replace(/\bbaby bella mushrooms?\b/g, "baby bella mushrooms");
}

function removePrepWords(text: string) {
  let next = text;

  // Keep shopper-specific cheese wording. "Sliced cheese" is a real grocery
  // item, while "sliced onion" is just prep wording.
  const keepSlicedCheese =
    /\bsliced cheese\b/i.test(next) || /\bcheese slices?\b/i.test(next);

  PREP_WORDS.forEach((word) => {
    if (word === "sliced" && keepSlicedCheese) return;

    const regex = new RegExp(`\\b${word}\\b`, "g");
    next = next.replace(regex, " ");
  });

  return next.replace(/\bcheese slices?\b/gi, "sliced cheese");
}

function removeNonShoppingItems(text: string) {
  let next = text;
  const cleaned = cleanupSpacing(next);

  if (cleaned === "ice" || cleaned === "crushed ice") {
    next = "";
  }

  return next
    .replace(/\bwater\b/g, "")
    .replace(/\s*\+\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


// =====================================================
// Suggested side cleanup
// Suggested sides enter the shopping list as plain text, not full recipe
// ingredients. These helpers keep them shopper-friendly and categorized.
// =====================================================
const PREPARED_SIDE_NAMES = new Set([
  // Produce-style sides
  "asparagus",
  "broccoli",
  "carrot",
  "corn on the cob",
  "cucumber salad",
  "green beans",
  "grilled vegetables",
  "mexican street corn",
  "pickle spears",
  "pickles",
  "potato",
  "roasted potatoes",
  "romaine lettuce",
  "simple green salad",
  "side salad",
  "caesar salad",
  "fruit salad",
  "coleslaw",
  "spring mix",
  "watermelon slices",

  // Pantry / snack sides
  "baked beans",
  "brown sugar",
  "chips and salsa",
  "cornbread",
  "crackers",
  "croutons",
  "guacamole",
  "hummus",
  "ketchup",
  "molasses",
  "potato chips",
  "rice",
  "rice pilaf",
  "salsa",
  "tortilla chips",
  "yellow mustard",

  // Bakery sides
  "breadsticks",
  "dinner rolls",
  "garlic bread",
  "naan",
  "pita bread",

  // Frozen sides
  "egg rolls",
  "french fries",
  "spring rolls",
  "steamed edamame",
  "sweet potato fries",
]);

function normalizeSideSuggestionText(text: string) {
  let cleaned = cleanupSpacing(String(text || "").toLowerCase());

  if (!cleaned) return "";

  // =====================================================
  // Repair awkward "choice" wording from recipe lines
  // =====================================================
  if (
    cleaned.includes("parsley or cilantro") ||
    cleaned.includes("cilantro or parsley") ||
    cleaned.includes("parsley/cilantro") ||
    cleaned.includes("cilantro/parsley")
  ) {
    return "parsley";
  }

  // =====================================================
  // Salad / prepared produce sides
  // =====================================================
  if (
    cleaned.includes("simple green salad") ||
    cleaned === "side salad" ||
    cleaned === "green salad"
  ) {
    return "simple green salad";
  }

  if (cleaned.includes("caesar salad")) return "caesar salad";
  if (cleaned.includes("cucumber salad")) return "cucumber salad";
  if (cleaned.includes("fruit salad")) return "fruit salad";
  if (cleaned.includes("coleslaw mix")) return "coleslaw mix";
  if (cleaned.includes("coleslaw")) return "coleslaw";
  if (cleaned.includes("spring mix") || cleaned.includes("salad mix")) {
    return "spring mix";
  }
  if (cleaned.includes("romaine") || cleaned.includes("head romaine lettuce")) {
    return "romaine lettuce";
  }

  // =====================================================
  // Vegetables from suggested sides
  // =====================================================
  if (
    cleaned.includes("roasted asparagus") ||
    cleaned.includes("grilled asparagus") ||
    cleaned === "asparagus"
  ) {
    return "asparagus";
  }

  if (
    cleaned.includes("roasted broccoli") ||
    cleaned.includes("steamed broccoli") ||
    cleaned.includes("head broccoli") ||
    cleaned === "broccoli"
  ) {
    return "broccoli";
  }

  if (
    cleaned.includes("green beans") ||
    cleaned.includes("roasted green beans")
  ) {
    return "green beans";
  }

  if (
    cleaned.includes("roasted carrots") ||
    cleaned.includes("carrot sticks") ||
    cleaned === "carrots"
  ) {
    return "carrot";
  }

  if (
    cleaned.includes("grilled vegetables") ||
    cleaned.includes("grilled veggies") ||
    cleaned.includes("roasted vegetables") ||
    cleaned.includes("roasted veggies")
  ) {
    return "grilled vegetables";
  }

  // Collapse street-corn/corn-on-cob wording to one shopping item so the list
  // does not show both "Mexican Street Corn" and "Corn On the Cob" separately.
  // Corn sides
  if (
    cleaned.includes("mexican street corn") ||
    cleaned.includes("street corn")
  ) {
    return "mexican street corn";
  }

  if (
    cleaned.includes("corn on the cob") ||
    cleaned.includes("ears corn") ||
    cleaned.includes("ear corn")
  ) {
    return "corn on the cob";
  }

  if (
    cleaned.includes("roasted potatoes") ||
    cleaned.includes("mashed potatoes") ||
    cleaned.includes("baked potato") ||
    cleaned === "potatoes"
  ) {
    return "potato";
  }

  if (cleaned.includes("watermelon")) return "watermelon slices";
  if (cleaned.includes("pickle spear")) return "pickle spears";
  if (cleaned === "pickles" || cleaned === "pickle") return "pickles";

  // =====================================================
  // Citrus / herbs
  // =====================================================
  if (
    cleaned.includes("lime wedge") ||
    cleaned.includes("lime zest") ||
    cleaned.includes("lime juice")
  ) {
    return "lime";
  }

  if (
    cleaned.includes("lemon wedge") ||
    cleaned.includes("lemon zest") ||
    cleaned.includes("lemon juice")
  ) {
    return "lemon";
  }

  // =====================================================
  // Pantry / snack sides
  // =====================================================
  if (cleaned === "chips" || cleaned.includes("potato chips")) return "potato chips";
  if (cleaned.includes("chips and salsa")) return "chips and salsa";
  if (cleaned === "salsa") return "salsa";
  if (cleaned.includes("tortilla chips")) return "tortilla chips";
  if (cleaned.includes("crouton")) return "croutons";
  if (cleaned.includes("baked beans")) return "baked beans";
  if (cleaned.includes("brown sugar")) return "brown sugar";
  if (cleaned.includes("molasses")) return "molasses";
  if (cleaned.includes("ketchup")) return "ketchup";
  if (cleaned.includes("yellow mustard")) return "yellow mustard";
  if (cleaned.includes("mustard")) return "yellow mustard";
  if (cleaned.includes("guacamole")) return "guacamole";
  if (cleaned.includes("hummus")) return "hummus";
  if (cleaned.includes("cornbread")) return "cornbread";
  if (cleaned.includes("crackers")) return "crackers";

  // =====================================================
  // Bakery / frozen / starchy sides
  // =====================================================
  if (cleaned.includes("garlic bread")) return "garlic bread";
  if (cleaned.includes("dinner rolls") || cleaned === "rolls") return "dinner rolls";
  if (cleaned.includes("breadsticks")) return "breadsticks";
  if (cleaned.includes("naan")) return "naan";
  if (cleaned.includes("pita")) return "pita bread";
  if (cleaned.includes("french fries")) return "french fries";
  if (cleaned.includes("sweet potato fries")) return "sweet potato fries";
  if (cleaned.includes("spring roll")) return "spring rolls";
  if (cleaned.includes("egg roll")) return "egg rolls";
  if (cleaned.includes("edamame")) return "steamed edamame";
  if (cleaned.includes("rice pilaf")) return "rice pilaf";
  if (cleaned.includes("cilantro lime rice")) return "cilantro lime rice";
  if (
    cleaned === "rice" ||
    cleaned === "steamed rice" ||
    cleaned === "white rice" ||
    cleaned === "long grain white rice" ||
    cleaned === "long-grain white rice"
  ) {
    return "white rice";
  }

  return cleaned;
}

function isPreparedSideName(name: string) {
  const cleaned = normalizeSideSuggestionText(name);
  return PREPARED_SIDE_NAMES.has(cleaned);
}

function normalizeIngredientText(text: string) {
  let next = text;
  next = normalizeSideSuggestionText(next);
  next = normalizePantryAndSeasonings(next);
  next = normalizeProduce(next);
  next = normalizeProteinsAndBakery(next);
  next = normalizeDairyAndCheese(next);
  next = normalizeMushrooms(next);
  next = normalizeSideSuggestionText(next);
  next = removeNonShoppingItems(next);
  next = removePrepWords(next);
  next = normalizeSideSuggestionText(next);
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
  text = text
    .replace(/\bwooden or metal skewers?\b/g, "skewers")
    .replace(/\bmetal or wooden skewers?\b/g, "skewers")
    .replace(/\bwooden skewers?\b/g, "wooden skewers")
    .replace(/\bmetal skewers?\b/g, "metal skewers");
  text = text.replace(/^(and|or|with)\s+/g, "").trim();

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
  text = text.replace(/\bor\s+(pickled|jarred|canned)\s+[a-z\s]+/g, "");

  // final cleanup
  text = text.split(",")[0];
  text = cleanupSpacing(text);

  // Remove dangling connector words from messy recipe lines.
  // Example: "4 oz cream cheese and" -> "cream cheese".
  text = text.replace(/\b(and|or|with)$/g, "").trim();
  text = cleanupSpacing(text);
  // Spanish ingredient cleanup.
  // Examples:
  // "de sal" -> "sal"
  // "de bicarbonato de sodio" -> "bicarbonato de sodio"
  // "2 cups de fresas" stays as "2 cups de fresas"
  text = text
    .replace(/^de\s+/i, "")
    .replace(/^del\s+/i, "")
    .replace(/\bDe\b/g, "de")
    .replace(/\bDel\b/g, "del")
    .trim();

  text = cleanupSpacing(text);

  return text;
}

// =====================================================
// Package size helpers
// Keeps details like "14.5 oz" for canned/boxed goods
// =====================================================
function normalizePackageSize(value: string | null | undefined) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(\d)(oz|ounce|ounces|lb|lbs|pound|pounds|g|kg|ml|l)\b/g, "$1 $2")
    .replace(/ounces?\b/g, "oz")
    .replace(/pounds?\b/g, "lb")
    .replace(/\blbs?\b/g, "lb")
    .replace(/\s+/g, " ")
    .trim();
}

function getOzFromPackageSize(value?: string) {
  const cleaned = normalizePackageSize(value || "");
  const match = cleaned.match(/^(\d+(?:\.\d+)?)\s*oz$/i);
  if (!match) return null;

  const amount = Number(match[1]);
  return Number.isFinite(amount) ? amount : null;
}

function extractPackageSize(text: string) {
  const match = text.match(/\(([^)]*(?:oz|ounce|ounces|g|kg|ml|l)[^)]*)\)/i);
  return match ? normalizePackageSize(match[1]) : "";
}

function isPackageSizeSensitiveUnit(unit: string | null) {
  return (
    unit === "can" ||
    unit === "package" ||
    unit === "box" ||
    unit === "jar" ||
    unit === "carton" ||
    unit === "bag"
  );
}

function formatPackageSize(packageSize: string) {
  return normalizePackageSize(packageSize);
}

function normalizeContainerIngredientName(name: string, unit: string | null) {
  const cleaned = cleanIngredientName(name).toLowerCase();

  if (unit === "can" && cleaned === "corn on the cob") {
    return "corn";
  }

  return name;
}

// =====================================================
// Ingredient parsing
// This figures out quantity, unit, cleaned name,
// and supports ranges like "4 to 6 hamburger buns"
// =====================================================
function parseIngredient(line: string): ParsedIngredient {
  const originalRaw = String(line || "")
    .trim()
    .replace(/\s+/g, " ");

  const packageSize = extractPackageSize(originalRaw);

  const raw = originalRaw
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ");

  // Recipe wording such as "juice of 1 lemon" should become
  // a practical countable grocery item: "1 Lemon".
  const citrusJuiceMatch = raw.match(
    /^\s*juice\s+(?:of|from)\s+(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s+(lemons?|limes?|oranges?)\b/i
  );

  if (citrusJuiceMatch) {
    const [, qtyRaw, citrusRaw] = citrusJuiceMatch;
    const quantity = parseFraction(qtyRaw);
    const citrusName = citrusRaw.toLowerCase().replace(/s$/i, "");

    return {
      quantity,
      minQuantity: quantity,
      maxQuantity: quantity,
      unit: "__count__",
      name: citrusName,
      packageSize,
    };
  }

  const measuredRangeMatch = raw.match(
    /^\s*(\d+\s\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+\s\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s+(lb|lbs|pound|pounds|oz|ounce|ounces|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|can|cans|package|packages|pkg|pkgs|box|boxes|clove|cloves|jar|jars|carton|cartons|bag|bags|strip|strips|slice|slices)\s+(.*)$/i
  );

  if (measuredRangeMatch) {
    const [, minRaw, maxRaw, unitRaw, rest] = measuredRangeMatch;

    const normalizedUnit = normalizeUnit(unitRaw);
    const cleanedName = cleanIngredientName(rest);

    return {
      quantity: parseFraction(maxRaw),
      minQuantity: parseFraction(minRaw),
      maxQuantity: parseFraction(maxRaw),
      unit: normalizedUnit,
      name: normalizeContainerIngredientName(cleanedName, normalizedUnit),
      packageSize,
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
      packageSize,
    };
  }

  const measuredMatch = raw.match(
    /^\s*(\d+\s\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s+(lb|lbs|pound|pounds|oz|ounce|ounces|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|can|cans|package|packages|pkg|pkgs|clove|cloves|box|boxes|jar|jars|carton|cartons|bag|bags|strip|strips|slice|slices)\s+(.*)$/i
  );

  if (measuredMatch) {
    const [, qtyRaw, unitRaw, rest] = measuredMatch;

    const normalizedUnit = normalizeUnit(unitRaw);
    const cleanedName = cleanIngredientName(rest);

    return {
      quantity: parseFraction(qtyRaw),
      minQuantity: parseFraction(qtyRaw),
      maxQuantity: parseFraction(qtyRaw),
      unit: normalizedUnit,
      name: normalizeContainerIngredientName(cleanedName, normalizedUnit),
      packageSize,
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
      packageSize,
    };
  }

  return {
    quantity: null,
    minQuantity: null,
    maxQuantity: null,
    unit: null,
    name: cleanIngredientName(raw),
    packageSize,
  };
}

// =====================================================
// Countable ingredient helpers
// =====================================================
function normalizeCountableName(name: string): string {
  const cleaned = cleanIngredientName(name);
  const lower = cleaned.toLowerCase();

  if (COUNTABLE_PHRASES[lower]) return COUNTABLE_PHRASES[lower];
  if (COUNTABLE_BASE_WORDS.has(lower)) return lower;

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
function shouldHideMainRowAmount(name: string, unit: string | null) {
  const cleaned = cleanIngredientName(name).toLowerCase();

  // Keep important purchase quantities visible.
  // These are things shoppers usually buy by weight, count, or container.
  if (
    unit &&
    [
      "lb",
      "oz",
      "can",
      "package",
      "box",
      "jar",
      "carton",
      "bag",
      "tube",
      "packet",
      "strip",
      "slice",
    ].includes(unit)
  ) {
    return false;
  }

  const hideAmountFor = new Set([
    "butter",
    "cheddar cheese",
    "mozzarella cheese",
    "parmesan cheese",
    "monterey jack cheese",
    "blue cheese crumbles",
    "sour cream",
    "cream cheese",
    "mayonnaise",
    "ketchup",
    "mustard",
    "dijon mustard",
    "honey",
    "olive oil",
    "vegetable oil",
    "canola oil",
    "sesame oil",
    "toasted sesame oil",
    "rice vinegar",
    "balsamic vinegar",
    "vinegar",
    "tomato paste",
    "tomato sauce",
    "sesame seeds",
    "champagne",
    "white wine",
    "red wine",
    "cooking wine",
  ]);

  return hideAmountFor.has(cleaned);
}
function shouldShowMeasuredTotal(
  name: string,
  unit: string | null,
  total: number
) {
  const cleaned = cleanIngredientName(name).toLowerCase();

  if (!unit) return false;
  // Recipe-volume measurements are useful in the source breakdown,
  // but "2 cups Chicken" is not a practical main shopping-list label.
  if (
    ["cup", "Tbsp", "tsp"].includes(unit) &&
    [
      "chicken",
      "cooked chicken",
      "diced chicken",
      "shredded chicken",
    ].includes(cleaned)
  ) {
    return false;
  }
  if (HIDE_MEASURED_TOTALS.has(cleaned)) return false;
  if (ALWAYS_SHOW_MEASURED_TOTALS.has(cleaned)) return true;

  if (
    [
      "lb",
      "oz",
      "can",
      "package",
      "box",
      "jar",
      "carton",
      "bag",
      "tube",
      "packet",
      "strip",
      "slice",
    ].includes(unit)
  ) {
    return true;
  }

  if ((unit === "cup" || unit === "Tbsp" || unit === "tsp") && total >= 2) {
    return true;
  }

  return false;
}

// =====================================================
// Grocery category rules
// Keep special cases above the broad categorizeGroceryItem fallback.
// =====================================================
function isRealPepperProduce(cleaned: string) {
  if (
    cleaned.includes("red pepper flakes") ||
    cleaned.includes("cayenne pepper") ||
    cleaned.includes("black pepper")
  ) {
    return false;
  }

  return (
    cleaned === "green pepper" ||
    cleaned === "green peppers" ||
    cleaned.includes("bell pepper") ||
    cleaned.includes("red bell pepper") ||
    cleaned.includes("yellow bell pepper") ||
    cleaned.includes("green bell pepper") ||
    cleaned.includes("poblano") ||
    cleaned.includes("jalapeno") ||
    cleaned.includes("jalapeño")
  );
}

function isFreshChileProduce(cleaned: string) {
  if (
    cleaned.includes("chili powder") ||
    cleaned.includes("chile powder") ||
    cleaned.includes("red pepper flakes") ||
    cleaned.includes("cayenne pepper")
  ) {
    return false;
  }

  return (
    cleaned.includes("mild red chili") ||
    cleaned.includes("red chili") ||
    cleaned.includes("red chile") ||
    cleaned.includes("chili pepper") ||
    cleaned.includes("chile pepper")
  );
}

function isPreparedProduceSide(cleaned: string) {
  return (
    cleaned.includes("simple green salad") ||
    cleaned.includes("side salad") ||
    cleaned.includes("caesar salad") ||
    cleaned.includes("cucumber salad") ||
    cleaned.includes("fruit salad") ||
    cleaned.includes("coleslaw") ||
    cleaned.includes("spring mix") ||
    cleaned.includes("salad mix") ||
    cleaned.includes("romaine lettuce") ||
    cleaned.includes("asparagus") ||
    cleaned.includes("broccoli") ||
    cleaned.includes("green beans") ||
    cleaned.includes("carrot") ||
    cleaned.includes("grilled vegetables") ||
    cleaned.includes("watermelon") ||
    cleaned.includes("pickle") ||
    cleaned.includes("corn on the cob") ||
    cleaned.includes("mexican street corn") ||
    cleaned.includes("ears corn") ||
    cleaned.includes("ear corn") ||
    cleaned === "guacamole" ||
    cleaned === "fresh guacamole" ||
    cleaned === "prepared guacamole" ||
    cleaned === "potato" ||
    cleaned.includes("roasted potatoes") ||
    cleaned.includes("mashed potatoes") ||
    cleaned.includes("baked potato")
  );
}

function isPreparedPantrySide(cleaned: string) {
  return (
    cleaned.includes("potato chips") ||
    cleaned.includes("chips and salsa") ||
    cleaned.includes("tortilla chips") ||
    cleaned.includes("croutons") ||
    cleaned.includes("baked beans") ||
    cleaned.includes("brown sugar") ||
    cleaned.includes("molasses") ||
    cleaned.includes("ketchup") ||
    cleaned.includes("mustard") ||
    cleaned.includes("hummus") ||
    cleaned.includes("salsa") ||
    cleaned.includes("rice pilaf") ||
    cleaned.includes("cilantro lime rice") ||
    cleaned === "rice" ||
    cleaned.includes("vegetable broth") ||
    cleaned.includes("white rice") ||
    cleaned.includes("long grain white rice") ||
    cleaned.includes("orzo") ||
    cleaned.includes("spaghetti") ||
    cleaned.includes("cornbread") ||
    cleaned.includes("crackers")
  );
}

function isPreparedBakerySide(cleaned: string) {
  return (
    cleaned.includes("garlic bread") ||
    cleaned.includes("dinner rolls") ||
    cleaned.includes("breadsticks") ||
    cleaned.includes("naan") ||
    cleaned.includes("pita bread")
  );
}

function isPreparedFrozenSide(cleaned: string) {
  return (
    cleaned.includes("ice cream") ||
    cleaned.includes("helado") ||
    cleaned.includes("french fries") ||
    cleaned.includes("sweet potato fries") ||
    cleaned.includes("egg rolls") ||
    cleaned.includes("egg roll") ||
    cleaned.includes("spring rolls") ||
    cleaned.includes("spring roll") ||
    cleaned.includes("edamame")
  );
}

function isSalsaPantryItem(cleaned: string) {
  return (
    cleaned === "salsa" ||
    cleaned.includes("jar salsa") ||
    cleaned.includes("salsa verde") ||
    cleaned.includes("chips and salsa")
  );
}

function isBakeryBreadItem(cleaned: string) {
  return (
    cleaned.includes("hamburger bun") ||
    cleaned.includes("burger bun") ||
    cleaned.includes("hot dog bun") ||
    cleaned.includes("hoagie roll") ||
    cleaned.includes("sandwich roll") ||
    cleaned.includes("slider bun") ||
    cleaned.includes("hawaiian roll") ||
    cleaned.includes("king's hawaiian roll") ||
    cleaned.includes("kings hawaiian roll") ||
    isPreparedBakerySide(cleaned)
  );
}

function isFrozenVegetableItem(cleaned: string) {
  return (
    cleaned.includes("mixed stir fry vegetables") ||
    cleaned.includes("stir fry vegetables")
  );
}

function isPastaOrCrumbPantryItem(cleaned: string) {
  return (
    cleaned.includes("tortilla chips") ||
    cleaned.includes("potato chips") ||
    cleaned.includes("chips and salsa") ||
    cleaned.includes("croutons") ||
    cleaned.includes("breadcrumbs") ||
    cleaned.includes("bread crumbs") ||
    cleaned.includes("cracker crumbs") ||
    cleaned.includes("lasagna noodles") ||
    cleaned.includes("egg noodles") ||
    cleaned.includes("noodles") ||
    cleaned.includes("pasta")
  );
}

function isCondimentOilOrVinegarPantryItem(cleaned: string) {
  return (
    cleaned.includes("dijon mustard") ||
    cleaned.includes("mustard") ||
    cleaned.includes("ketchup") ||
    cleaned.includes("honey") ||
    cleaned.includes("sesame oil") ||
    cleaned.includes("toasted sesame oil") ||
    cleaned.includes("olive oil") ||
    cleaned.includes("oil") ||
    cleaned.includes("vinegar") ||
    cleaned.includes("rice vinegar") ||
    cleaned.includes("balsamic vinegar")
  );
}

function isTomatoPantryItem(cleaned: string) {
  return cleaned.includes("tomato paste") || cleaned.includes("tomato sauce");
}

function isWinePantryItem(cleaned: string) {
  return (
    cleaned.includes("champagne") ||
    cleaned.includes("white wine") ||
    cleaned.includes("red wine") ||
    cleaned.includes("cooking wine")
  );
}

function isFrenchFriedOnionPantryItem(cleaned: string) {
  return cleaned.includes("french fried onion") || cleaned.includes("fried onion");
}

function isCornstarchPantryItem(cleaned: string) {
  return cleaned.includes("cornstarch") || cleaned.includes("corn starch");
}

function isBeanPantryItem(cleaned: string) {
  return cleaned.includes("black beans");
}
function isDessertBakeryItem(cleaned: string) {
  return (
    cleaned.includes("shortcake biscuit") ||
    cleaned.includes("dessert biscuit") ||
    cleaned.includes("vanilla wafer")
  );
}

function isBakingStaplePantryItem(cleaned: string) {
  return (
    // Baking basics
    cleaned.includes("cornmeal") ||
    cleaned.includes("cornstarch") ||
    cleaned.includes("corn starch") ||
    cleaned.includes("maicena") ||
    cleaned.includes("baking powder") ||
    cleaned.includes("baking soda") ||
    cleaned.includes("polvo para hornear") ||
    cleaned.includes("bicarbonato") ||
    cleaned.includes("all purpose flour") ||
    cleaned.includes("all-purpose flour") ||
    cleaned.includes("flour") ||
    cleaned.includes("harina") ||

    // Sugars
    cleaned.includes("powdered sugar") ||
    cleaned.includes("azucar glas") ||
    cleaned.includes("azúcar glas") ||
    cleaned.includes("brown sugar") ||
    cleaned.includes("azucar morena") ||
    cleaned.includes("azúcar morena") ||
    cleaned.includes("granulated sugar") ||
    cleaned.includes("sugar") ||
    cleaned.includes("azucar") ||
    cleaned.includes("azúcar") ||

    // Chocolate / dessert items
    cleaned.includes("cocoa powder") ||
    cleaned.includes("cocoa") ||
    cleaned.includes("cacao") ||
    cleaned.includes("cacao en polvo") ||
    cleaned.includes("chocolate shavings") ||
    cleaned.includes("virutas de chocolate") ||
    cleaned.includes("chocolate chips") ||
    cleaned.includes("chispas de chocolate") ||
    cleaned.includes("dark chocolate") ||
    cleaned.includes("baking chips") ||
    cleaned.includes("mini chocolate chips") ||
    cleaned.includes("mini marshmallows") ||
    cleaned.includes("vanilla wafers") ||
    cleaned.includes("crispy rice cereal") ||
    cleaned.includes("instant vanilla pudding") ||

    // Dessert toppings / add-ins
    cleaned.includes("chocolate syrup") ||
    cleaned.includes("jarabe de chocolate") ||
    cleaned.includes("sirope de chocolate") ||
    cleaned.includes("maraschino cherry") ||
    cleaned.includes("maraschino cherries") ||
    cleaned.includes("cereza maraschino") ||
    cleaned.includes("cerezas maraschino") ||
    cleaned.includes("cookies") ||
    cleaned.includes("cookie crumbs") ||
    cleaned.includes("oreo") ||
    cleaned.includes("galletas") ||
    cleaned.includes("peanuts") ||
    cleaned.includes("peanut") ||
    cleaned.includes("cacahuate") ||
    cleaned.includes("cacahuates") ||
    cleaned.includes("maní") ||
    cleaned.includes("mani") ||
    cleaned.includes("walnuts") ||
    cleaned.includes("walnut") ||
    cleaned.includes("nueces") ||
    cleaned.includes("nuez") ||
    cleaned.includes("pecans") ||
    cleaned.includes("pecan") ||
    cleaned.includes("nuez pecana") ||

    // Dessert mixes / add-ins
    cleaned.includes("graham cracker crumbs") ||
    cleaned.includes("migas de galleta") ||
    cleaned.includes("galleta graham") ||
    cleaned.includes("cake mix") ||
    cleaned.includes("mezcla para pastel") ||
    cleaned.includes("pudding mix") ||
    cleaned.includes("pudin") ||
    cleaned.includes("pudín") ||
    cleaned.includes("marshmallow") ||
    cleaned.includes("malvavisco") ||
    cleaned.includes("sprinkles") ||
    cleaned.includes("grageas") ||

    // Other baking/dessert pantry items
    cleaned.includes("vanilla extract") ||
    cleaned.includes("extracto de vainilla") ||
    cleaned.includes("vanilla") ||
    cleaned.includes("vainilla") ||
    cleaned.includes("coconut oil") ||
    cleaned.includes("aceite de coco") ||
    cleaned.includes("oats") ||
    cleaned.includes("avena")
  );
}

function isSkewerOrGrillSupply(cleaned: string) {
  return (
    cleaned.includes("wooden skewer") ||
    cleaned.includes("bamboo skewer") ||
    cleaned.includes("skewers") ||
    cleaned === "wooden" ||
    cleaned === "bamboo"
  );
}

function isForcedSpice(cleaned: string) {
  const forcedSpices = new Set([
    "salt",
    "black pepper",
    "salt / pepper",
    "msg",
    "monosodium glutamate",
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
    "cayenne pepper",
    "dried thyme",
    "chinese five spice",
  ]);

  return forcedSpices.has(cleaned);
}

function resolveShoppingCategory(name: string): GroceryCategory {
  const cleaned = cleanIngredientName(name).toLowerCase();
  // Explicit protections before broad pantry/spice fallbacks.
  if (
    cleaned.includes("smoked sausage") ||
    cleaned.includes("pepperoni")
  ) {
    return "Meat / Seafood";
  }

  if (cleaned === "msg" || cleaned.includes("monosodium glutamate")) {
    return "Spices / Seasonings";
  }

  if (isPreparedFrozenSide(cleaned)) return "Frozen";
  if (isPreparedBakerySide(cleaned)) return "Bakery";
  if (isPreparedPantrySide(cleaned)) return "Pantry";
  if (isPreparedProduceSide(cleaned)) return "Produce";
  if (isDessertBakeryItem(cleaned)) return "Bakery";

  if (isSkewerOrGrillSupply(cleaned)) return "Household";
  if (isBakingStaplePantryItem(cleaned)) return "Pantry";

  // Egg rule, but avoid egg rolls.
  if (
    cleaned === "egg" ||
    cleaned === "eggs" ||
    cleaned.includes(" eggs") ||
    cleaned.includes(" egg")
  ) {
    return "Dairy / Eggs";
  }
  if (
    cleaned.includes("peach") ||
    cleaned.includes("peaches") ||
    cleaned.includes("durazno") ||
    cleaned.includes("duraznos")
  ) {
    return "Produce";
  }

  if (isRealPepperProduce(cleaned) || isFreshChileProduce(cleaned)) return "Produce";
  if (isBakeryBreadItem(cleaned)) return "Bakery";
  if (isFrozenVegetableItem(cleaned)) return "Frozen";

  if (
    isSalsaPantryItem(cleaned) ||
    isCornstarchPantryItem(cleaned) ||
    isFrenchFriedOnionPantryItem(cleaned) ||
    isTomatoPantryItem(cleaned) ||
    isWinePantryItem(cleaned) ||
    isBeanPantryItem(cleaned) ||
    isPastaOrCrumbPantryItem(cleaned) ||
    isCondimentOilOrVinegarPantryItem(cleaned)
  ) {
    return "Pantry";
  }

  if (isForcedSpice(cleaned)) return "Spices / Seasonings";

  return categorizeGroceryItem(cleaned);
}

function resolveShoppingCategoryForItem(
  name: string,
  unit: string | null,
  packageSize?: string
): GroceryCategory {
  const cleaned = cleanIngredientName(name).toLowerCase();
  // Explicit protections before broad pantry/spice fallbacks.
  if (
    cleaned.includes("smoked sausage") ||
    cleaned.includes("pepperoni")
  ) {
    return "Meat / Seafood";
  }

  if (cleaned === "msg" || cleaned.includes("monosodium glutamate")) {
    return "Spices / Seasonings";
  }
  // Bakery items must win before the broad packaged-item Pantry fallback.
  // Bakery items must win before broad packaged-item or meat rules.
  if (
    isBakeryBreadItem(cleaned) ||
    /\b(?:flour|corn|wheat)?\s*tortillas?\b/.test(cleaned) ||
    /\bhot dogs?\s+buns?\b/.test(cleaned)
  ) {
    return "Bakery";
  }

  // Broth and stock are pantry products, even when their names
  // contain meat words such as beef or chicken.
  if (
    /\b(?:beef|chicken|vegetable)?\s*(?:broth|stock)\b/.test(cleaned)
  ) {
    return "Pantry";
  }

  // Refrigerated bagged produce must win before the broad
  // package/bag-to-Pantry fallback.
  if (
    cleaned.includes("coleslaw mix") ||
    cleaned.includes("bagged coleslaw") ||
    cleaned.includes("shredded coleslaw")
  ) {
    return "Produce";
  }

  // Canned/boxed/jarred items belong in pantry even if the ingredient name
  // contains produce words like tomatoes or corn.
  if (
    unit &&
    ["can", "package", "box", "jar", "carton", "bag", "tube", "packet"].includes(unit)
  ) {
    return "Pantry";
  }

  if (
    packageSize &&
    (cleaned.includes("tomato") ||
      cleaned.includes("beans") ||
      cleaned.includes("corn") ||
      cleaned.includes("soup"))
  ) {
    return "Pantry";
  }

  if (isPreparedFrozenSide(cleaned)) return "Frozen";
  if (isPreparedBakerySide(cleaned)) return "Bakery";
  if (isPreparedPantrySide(cleaned)) return "Pantry";
  if (isPreparedProduceSide(cleaned)) return "Produce";

  if (isSkewerOrGrillSupply(cleaned)) return "Household";

  if (
    cleaned.includes("salmon") ||
    cleaned.includes("hot dog") ||
    cleaned.includes("sausage") ||
    cleaned.includes("bacon") ||
    cleaned.includes("ground beef") ||
    cleaned.includes("ground pork") ||
    cleaned.includes("chicken") ||
    cleaned.includes("beef") ||
    cleaned.includes("pork") ||
    cleaned.includes("shrimp")
  ) {
    return "Meat / Seafood";
  }
  if (
    cleaned.includes("peach") ||
    cleaned.includes("peaches") ||
    cleaned.includes("durazno") ||
    cleaned.includes("duraznos")
  ) {
    return "Produce";
  }

  // Put BEFORE generic cheese / dairy checks
  if (
    cleaned.includes("smoked mac and cheese") ||
    cleaned.includes("mac and cheese") ||
    cleaned.includes("macaroni and cheese")
  ) {
    return "Pantry";
  }

  if (
    cleaned.includes("butter") ||
    cleaned.includes("gouda cheese") ||
    cleaned.includes("smoked gouda") ||
    cleaned.includes("cheese") ||
    cleaned.includes("milk") ||
    cleaned.includes("cream") ||
    cleaned === "egg" ||
    cleaned === "eggs" ||
    cleaned.includes(" eggs") ||
    cleaned.includes(" egg")
  ) {
    return "Dairy / Eggs";
  }

  if (isBakingStaplePantryItem(cleaned)) return "Pantry";
  if (isRealPepperProduce(cleaned) || isFreshChileProduce(cleaned)) return "Produce";
  if (isBakeryBreadItem(cleaned)) return "Bakery";
  if (isFrozenVegetableItem(cleaned)) return "Frozen";

  if (
    isSalsaPantryItem(cleaned) ||
    isCornstarchPantryItem(cleaned) ||
    isFrenchFriedOnionPantryItem(cleaned) ||
    isTomatoPantryItem(cleaned) ||
    isWinePantryItem(cleaned) ||
    isBeanPantryItem(cleaned) ||
    isPastaOrCrumbPantryItem(cleaned) ||
    isCondimentOilOrVinegarPantryItem(cleaned)
  ) {
    return "Pantry";
  }

  if (
    cleaned.includes("greek salad") ||
    cleaned.includes("macaroni salad") ||
    cleaned.includes("potato salad") ||
    cleaned.includes("pasta salad") ||
    cleaned.includes("caesar salad") ||
    cleaned.includes("simple green salad") ||
    cleaned.includes("fruit salad") ||
    cleaned.includes("coleslaw")
  ) {
    return "Produce";
  }

  if (cleaned.includes("kimchi")) {
    return "Produce";
  }



  return resolveShoppingCategory(name);
}

function shouldHideShoppingItem(name: string) {
  const cleaned = cleanIngredientName(name).toLowerCase();

  const unitOnlyOrJunk = new Set([
    "salt / pepper",
    "salt and pepper",
    "salt and black pepper",
    "salt black pepper",
    "salt & pepper",
    "salt pepper",
    "black pepper salt",
    "water",
    "ice",
    "cup",
    "cups",
    "tsp",
    "tbsp",
    "tablespoon",
    "tablespoons",
    "teaspoon",
    "teaspoons",
    "oz",
    "ounce",
    "ounces",
    "lb",
    "lbs",
    "pound",
    "pounds",
    "can",
    "cans",
    "box",
    "boxes",
    "package",
    "packages",
  ]);

  return !cleaned || unitOnlyOrJunk.has(cleaned) || /^[^a-z]+$/i.test(cleaned);
}


function formatRecipeBreakdownAmount(
  name: string,
  quantity: number,
  unit: string | null,
  isCountable: boolean,
  packageSize?: string
) {
  if (quantity <= 0) return "";

  if (isCountable) {
    const qty = Math.ceil(quantity);
    const baseName = singularizeWord(name);

    if (baseName === "garlic") {
      return `${qty} ${qty === 1 ? "clove" : "cloves"}`;
    }

    return `${qty} ${formatDisplayName(pluralizeCountable(baseName, qty))}`;
  }

  if (unit && unit !== "__count__") {
    const sizeText =
      packageSize && isPackageSizeSensitiveUnit(unit)
        ? ` (${formatPackageSize(packageSize)})`
        : "";
    return `${formatQuantity(quantity)} ${pluralizeUnit(unit, quantity)}${sizeText}`;
  }

  return formatQuantity(quantity);
}

// =====================================================
// Pantry helpers
// =====================================================
type PantryItem = {
  id: string;
  name: string;
  createdAt: number;
};

const PANTRY_STORAGE_KEY = "pantry";

function makePantryId(text: string) {
  return `pantry-${text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${Date.now()}`;
}

function loadPantryItems(): PantryItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(PANTRY_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePantryItems(items: PantryItem[]) {
  localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("simple-dinners:pantry-updated"));
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
// Manual shopping item helpers
// Manual entries should be respected. This path avoids recipe-style
// cleanup so "fresh jalapenos", "#2 pencils", and specific cheeses survive.
// =====================================================
function normalizeManualText(text: string) {
  return String(text || "")
    .replace(/^[-•*]+\s*/, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[:;,]+$/g, "");
}

function formatManualName(name: string) {
  const cleaned = normalizeManualText(name);
  if (!cleaned) return "";

  const special: Record<string, string> = {
    "aa": "AA",
    "aaa": "AAA",
    "aa batteries": "AA Batteries",
    "aaa batteries": "AAA Batteries",
    "ziploc": "Ziploc",
    "ziploc bags": "Ziploc Bags",
    "ziplock bags": "Ziplock Bags",
  };

  const fullKey = cleaned.toLowerCase();
  if (special[fullKey]) return special[fullKey];

  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase();

      if (/^#\d+$/i.test(word)) return word.toUpperCase();
      if (special[lower]) return special[lower];

      if (index !== 0 && SMALL_TITLE_WORDS.has(lower)) {
        return lower;
      }

      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function singularizeManualPhrase(name: string) {
  const words = normalizeManualText(name).toLowerCase().split(" ").filter(Boolean);
  if (!words.length) return "";

  const last = words[words.length - 1];
  words[words.length - 1] = singularizeWord(last);

  return words.join(" ");
}

function pluralizeManualPhrase(name: string, quantity: number) {
  const displayName = formatManualName(name);

  if (Math.abs(quantity - 1) < 0.0001) {
    return displayName;
  }

  const lower = displayName.toLowerCase();

  // Mass/store-form grocery items should not get an awkward "s".
  if (
    lower.endsWith("cheese") ||
    lower.endsWith("rice") ||
    lower.endsWith("pasta") ||
    lower.endsWith("beef") ||
    lower.endsWith("chicken") ||
    lower.endsWith("pork") ||
    lower.endsWith("fish")
  ) {
    return displayName;
  }

  const words = displayName.split(" ").filter(Boolean);
  if (!words.length) return displayName;

  const last = words[words.length - 1];

  if (last.toLowerCase().endsWith("s")) {
    return displayName;
  }

  if (last.toLowerCase().endsWith("y")) {
    words[words.length - 1] = `${last.slice(0, -1)}ies`;
  } else if (
    last.toLowerCase().endsWith("ch") ||
    last.toLowerCase().endsWith("sh") ||
    last.toLowerCase().endsWith("x")
  ) {
    words[words.length - 1] = `${last}es`;
  } else {
    words[words.length - 1] = `${last}s`;
  }

  return words.join(" ");
}

function parseManualShoppingItem(raw: string): {
  rawText: string;
  name: string;
  mergeName: string;
  quantity: number | null;
  unit: string | null;
  packageSize: string;
  displayText: string;
} {
  const rawText = normalizeManualText(raw);
  let rest = rawText;
  let quantity: number | null = null;
  let unit: string | null = null;
  const packageSize = extractPackageSize(rawText);

  // Preserve things like "#2 pencils"; the # is part of the item, not a quantity.
  if (!rest.startsWith("#")) {
    const quantityMatch = rest.match(
      new RegExp(`^(${"\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:\\.\\d+)?|½|¼|¾|⅓|⅔|⅛"})\\s+(.+)$`, "i")
    );

    if (quantityMatch) {
      quantity = parseFraction(quantityMatch[1]);
      rest = quantityMatch[2].trim();

      const unitMatch = rest.match(
        /^(lb|lbs|pound|pounds|oz|ounce|ounces|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|can|cans|package|packages|pkg|pkgs|clove|cloves|box|boxes|jar|jars|carton|cartons|bag|bags|tube|tubes|packet|packets|strip|strips|slice|slices)\s+(.+)$/i
      );

      if (unitMatch) {
        unit = normalizeUnit(unitMatch[1]);
        rest = unitMatch[2].trim();
      }
    }
  }

  const name = normalizeManualText(rest.replace(/\([^)]*\)/g, " "));
  const mergeName =
    quantity !== null ? singularizeManualPhrase(name) : normalizeManualText(name).toLowerCase();

  let displayText = formatManualName(name);

  if (quantity !== null) {
    const qty = formatQuantity(quantity);

    if (unit) {
      displayText = `${qty} ${pluralizeUnit(unit, quantity)} ${formatManualName(name)}`.trim();
    } else {
      displayText = `${qty} ${pluralizeManualPhrase(singularizeManualPhrase(name), quantity)}`.trim();
    }
  }

  return {
    rawText,
    name,
    mergeName,
    quantity,
    unit,
    packageSize,
    displayText,
  };
}

function shouldHideManualShoppingItem(name: string) {
  return !normalizeManualText(name);
}

function getCategoryLabel(section: GroceryCategory) {
  const labels: Record<string, string> = {
    Produce: t("categories.produce"),
    "Meat / Seafood": t("categories.meatSeafood"),
    "Dairy / Eggs": t("categories.dairyEggs"),
    Bakery: t("categories.bakery"),
    Pantry: t("categories.pantry"),
    Frozen: t("categories.frozen"),
    "Spices / Seasonings": t("categories.spices"),
    "Paper Goods": t("categories.paperGoods"),
    Household: t("categories.household"),
    Other: t("categories.other"),
  };

  return labels[section] || section;
}


// =====================================================
// Page component
// =====================================================
export default function ShoppingListPage() {
  const {
    requirePlus,
  } = usePlusAccess();

  const [newItem, setNewItem] = useState("");
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() =>
    loadRawShoppingList()
  );
  const [hideChecked, setHideChecked] = useState(false);
  const [smartShoppingPreview, setSmartShoppingPreview] =
    useState<SmartShoppingPreview | null>(null);
  const [
    smartShoppingPreviewIsStale,
    setSmartShoppingPreviewIsStale,
  ] = useState(false);
  const [
    smartShoppingPreferences,
    setSmartShoppingPreferences,
  ] = useState<SmartShoppingPreferences>(() =>
    loadSmartShoppingPreferences()
  );
  const [
    smartShoppingApplyPlan,
    setSmartShoppingApplyPlan,
  ] = useState<SmartShoppingApplyPlan | null>(null);

  const [
    smartShoppingUndoPlan,
    setSmartShoppingUndoPlan,
  ] = useState<SmartShoppingApplyPlan | null>(null);

  const [
    smartShoppingStatusMessage,
    setSmartShoppingStatusMessage,
  ] = useState("");
  const [touchStartX, setTouchStartX] = useState<Record<string, number>>({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editText, setEditText] = useState("");
  const [editingGroup, setEditingGroup] = useState<CombinedItem | null>(null);
  const [sourceModalGroup, setSourceModalGroup] = useState<CombinedItem | null>(null);
  const [pantryMessage, setPantryMessage] = useState("");

  // =====================================================
  // Refresh list when returning to page
  // =====================================================
  useEffect(() => {
    const refresh = () => {
      setShoppingItems(loadRawShoppingList());
    };

    refresh();

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  useEffect(() => {
    const refresh = () => {
      setShoppingItems(loadRawShoppingList());
    };

    refresh();

    window.addEventListener("focus", refresh);
    window.addEventListener(
      SHOPPING_LIST_CHANGED_EVENT,
      refresh,
    );
    document.addEventListener(
      "visibilitychange",
      refresh,
    );

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener(
        SHOPPING_LIST_CHANGED_EVENT,
        refresh,
      );
      document.removeEventListener(
        "visibilitychange",
        refresh,
      );
    };
  }, []);

  useEffect(() => {
    const refreshSmartShoppingPreferences = () => {
      setSmartShoppingPreferences(
        loadSmartShoppingPreferences()
      );
    };

    // Updates this page when the preference is changed
    // elsewhere in the current app session.
    window.addEventListener(
      SMART_SHOPPING_PREFERENCES_CHANGED_EVENT,
      refreshSmartShoppingPreferences
    );

    // Keeps another browser tab on this device in sync.
    window.addEventListener(
      "storage",
      refreshSmartShoppingPreferences
    );

    return () => {
      window.removeEventListener(
        SMART_SHOPPING_PREFERENCES_CHANGED_EVENT,
        refreshSmartShoppingPreferences
      );

      window.removeEventListener(
        "storage",
        refreshSmartShoppingPreferences
      );
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
  // Smart Shopping preview
  //
  // Preview-only:
  // - Reads the raw shopping snapshot
  // - Does not save
  // - Does not dispatch a sync event
  // - Does not modify household data
  // =====================================================
  const createSmartShoppingPreview = () => {
    const rawItems = loadRawShoppingList();

    if (rawItems.length === 0) {
      setSmartShoppingPreview(null);
      setSmartShoppingApplyPlan(null);
      setSmartShoppingPreviewIsStale(false);
      return;
    }

    const preview =
      buildSmartShoppingPreview(rawItems);

    const applyPlan =
      buildSmartShoppingApplyPlan(
        preview,
        rawItems
      );

    setSmartShoppingPreview(preview);
    setSmartShoppingApplyPlan(applyPlan);
    setSmartShoppingPreviewIsStale(false);
  };

  const openSmartShoppingPreview = () => {
    if (
      !requirePlus({
        feature: "smart-shopping",
      })
    ) {
      return;
    }

    setSmartShoppingStatusMessage("");
    createSmartShoppingPreview();
  };

  const refreshSmartShoppingPreview = () => {
    createSmartShoppingPreview();
  };

  const closeSmartShoppingPreview = () => {
    setSmartShoppingPreview(null);
    setSmartShoppingApplyPlan(null);
    setSmartShoppingPreviewIsStale(false);
  };

  const applySmartShoppingChanges = () => {
    if (
      !requirePlus({
        feature: "smart-shopping",
      })
    ) {
      return;
    }

    if (!smartShoppingPreview) {
      return;
    }

    // Rebuild the plan at the exact moment Apply is tapped.
    // This prevents an older in-memory plan from overwriting
    // a household edit that arrived moments earlier.
    const latestRawItems =
      loadRawShoppingList();

    const latestPlan =
      buildSmartShoppingApplyPlan(
        smartShoppingPreview,
        latestRawItems
      );

    if (!latestPlan.canApply) {
      setSmartShoppingApplyPlan(latestPlan);

      if (
        latestPlan.reason === "stale-preview" ||
        latestPlan.reason === "missing-items"
      ) {
        setSmartShoppingPreviewIsStale(true);
      }

      return;
    }

    saveShoppingList(latestPlan.nextItems);

    // Reload the page's existing shopper-friendly view.
    setShoppingItems(loadRawShoppingList());

    // Keep the complete raw before/after plan for Undo.
    setSmartShoppingUndoPlan(latestPlan);

    setSmartShoppingStatusMessage(
      getStoredLanguage() === "es"
        ? "Lista organizada."
        : "List organized."
    );

    closeSmartShoppingPreview();
  };

  const undoSmartShoppingChanges = () => {
    if (!smartShoppingUndoPlan) {
      return;
    }

    const latestRawItems =
      loadRawShoppingList();

    const latestSignature =
      buildShoppingListSignature(
        latestRawItems
      );

    // Do not overwrite newer local or household changes.
    if (
      latestSignature !==
      smartShoppingUndoPlan.afterSignature
    ) {
      setSmartShoppingUndoPlan(null);

      setSmartShoppingStatusMessage(
        getStoredLanguage() === "es"
          ? "La lista cambió después de organizarla, por lo que no se puede deshacer de forma segura."
          : "The list changed after it was organized, so it cannot be safely undone."
      );

      return;
    }

    saveShoppingList(
      smartShoppingUndoPlan.originalItems
    );

    setShoppingItems(loadRawShoppingList());
    setSmartShoppingUndoPlan(null);

    setSmartShoppingStatusMessage(
      getStoredLanguage() === "es"
        ? "Se deshicieron los cambios."
        : "Changes undone."
    );
  };

  const toggleSmartShoppingPictures = () => {
    const nextPreferences =
      setShowSmartShoppingPictures(
        !smartShoppingPreferences.showItemPictures
      );

    setSmartShoppingPreferences(
      nextPreferences
    );
  };
  // =====================================================
  // Manual add item
  // =====================================================
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();

    const raw = newItem.trim();
    if (!raw) return;

    const manual = parseManualShoppingItem(raw);

    if (shouldHideManualShoppingItem(manual.name)) {
      setNewItem("");
      return;
    }

    const id = `${makeManualId(manual.rawText || raw)}-${Date.now()}`;

    const added: ShoppingItem = {
      id,
      text: manual.rawText,
      checked: false,
      addedAt: Date.now(),
      category: resolveShoppingCategoryForItem(
        manual.name,
        manual.unit,
        manual.packageSize
      ),
      sourceRecipe: "",
      normalizedName: manual.name,
      quantity: manual.quantity ?? undefined,
      unit: manual.unit ?? undefined,
      packageSize: manual.packageSize || undefined,
    } as ShoppingItem & {
      sourceRecipe?: string;
      normalizedName?: string;
      quantity?: number;
      unit?: string | null;
      packageSize?: string;
      manualEntry?: boolean;
    };

    // Manual entries are intentionally not over-cleaned. The combined list
    // below only merges explicit matching quantities, like:
    // "1 white onion" + "1 white onion" -> "2 White Onions".
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
    const confirmed = window.confirm(t("shopping.clearConfirm"));
    if (!confirmed) return;
    persistShoppingItems([]);
  };

  const addCheckedItemsToPantry = () => {
    const checkedGroups = combinedItems.filter((item) => item.checked);
    if (checkedGroups.length === 0) return;



    const existingPantry = loadPantryItems();

    const existingNames = new Set(
      existingPantry.map((item) => cleanIngredientName(item.name).toLowerCase())
    );

    const newPantryItems: PantryItem[] = [];

    for (const group of checkedGroups) {
      let pantryName = group.displayText;

      // Remove leading amounts from grouped display names:
      // "10 cloves Garlic" -> "Garlic"
      // "2 Avocados" -> "Avocado"
      pantryName = pantryName
        .replace(/^\d+(\.\d+)?\s+(clove|cloves)\s+/i, "")
        .replace(/^\d+(\.\d+)?\s+/i, "")
        .trim();

      pantryName = cleanIngredientName(pantryName);

      // Extra safety fixes
      if (pantryName.includes("garlic")) pantryName = "garlic";
      if (pantryName.includes("cilantro")) pantryName = "cilantro";

      if (!pantryName || shouldHideShoppingItem(pantryName)) continue;

      const key = cleanIngredientName(pantryName).toLowerCase();
      if (existingNames.has(key)) continue;

      existingNames.add(key);

      newPantryItems.push({
        id: makePantryId(pantryName),
        name: formatDisplayName(pantryName),
        createdAt: Date.now(),
      });
    }

    if (newPantryItems.length === 0) {
      setPantryMessage("Those items are already in your Pantry.");
      setTimeout(() => setPantryMessage(""), 2500);
      return;
    }

    savePantryItems([...existingPantry, ...newPantryItems]);

    setPantryMessage(
      `Added ${newPantryItems.length} ${newPantryItems.length === 1 ? "item" : "items"
      } to Pantry`
    );

    setTimeout(() => setPantryMessage(""), 2500);
  };

  const checkedCount = shoppingItems.filter((item) => item.checked).length;

  const shareShoppingList = async () => {
    const itemsToShare = combinedItems.filter((item) => !item.checked);

    if (itemsToShare.length === 0) {
      alert(t("shopping.noItemsToShare"));
      return;
    }

    const itemCount = itemsToShare.length;
    const itemLabel = itemCount === 1 ? "item" : "items";

    let text = `🛒 Simple Dinners Shopping List\n`;
    text += `${itemCount} ${itemLabel} to pick up\n\n`;

    GROCERY_CATEGORY_ORDER.forEach((section) => {
      const sectionItems = itemsToShare.filter(
        (item) => item.category === section
      );

      if (sectionItems.length === 0) return;

      text += `${getCategoryLabel(section)}\n`;

      sectionItems.forEach((item) => {
        text += `□ ${item.displayText}\n`;
      });

      text += "\n";
    });

    text += `Generated with Simple Dinners`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Simple Dinners Shopping List",
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        alert(t("shopping.copied"));
      }
    } catch (err) {
      console.error("Share shopping list failed:", err);
    }
  };

  // =====================================================
  // Combine / merge shopping items for cleaner display
  // Manual entries and recipe ingredients intentionally use different paths.
  // Manual = preserve what the user typed.
  // Recipe = smart cleanup and merging.
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
        isManual: boolean;
        isCountable: boolean;
        totalQuantity: number;
        minQuantity: number;
        maxQuantity: number;
        unit: string | null;
        packageSize: string;
        mixedUnits: boolean;
        recipeNames: Set<string>;
        recipeBreakdown: Map<
          string,
          {
            quantity: number;
            unit: string | null;
            packageSize: string;
            isCountable: boolean;
            name: string;
            mixedUnits: boolean;
          }
        >;
      }
    >();

    for (const item of shoppingItems) {
      const recipeName = String((item as any).sourceRecipe || "").trim();
      const isManualItem = !recipeName;

      // =====================================================
      // Manual item path
      // =====================================================
      if (isManualItem) {
        const smartItem = item as ShoppingItemWithSmartMeta;
        const manual = parseManualShoppingItem(
          String(item.text || smartItem.normalizedName || "")
        );

        if (shouldHideManualShoppingItem(manual.name)) continue;

        const unit = normalizeUnit(
          smartItem.unit !== undefined && smartItem.unit !== null
            ? smartItem.unit
            : manual.unit
        );

        const quantity =
          typeof smartItem.quantity === "number"
            ? smartItem.quantity
            : manual.quantity;

        const packageSize =
          normalizePackageSize(smartItem.packageSize) ||
          normalizePackageSize(manual.packageSize);

        const approvedSmartName =
          canonicalizeSmartShoppingName(
            String(
              smartItem.grocerySearchName ||
              smartItem.normalizedName ||
              ""
            )
          );

        const hasApprovedSmartIdentity =
          approvedSmartName.length > 0;

        // Once approved, the Smart Shopping identity takes
        // priority over descriptive variations in the raw text.
        const mergeName =
          hasApprovedSmartIdentity
            ? approvedSmartName
            : quantity !== null
              ? singularizeManualPhrase(
                manual.name
              )
              : normalizeManualText(
                manual.name
              ).toLowerCase();

        // A plain manual countable item such as "white onion"
        // reasonably means one item and may merge with a matching
        // recipe ingredient. Non-countable manual entries remain
        // protected unless the user supplied a real quantity.
        const manualLooksCountable =
          !unit &&
          (
            FORCE_COUNTABLE_RECIPE_ITEMS.has(
              mergeName
            ) ||
            SMART_SHOPPING_FORCE_COUNTABLE_ITEMS.has(
              mergeName
            ) ||
            isCountableIngredient(mergeName)
          );

        const effectiveQuantity =
          quantity !== null
            ? quantity
            : manualLooksCountable
              ? 1
              : null;

        const canMergeWithRecipe =
          hasApprovedSmartIdentity &&
          effectiveQuantity !== null;

        const manualIsCountable =
          canMergeWithRecipe &&
          manualLooksCountable;

        const mergeUnit =
          manualIsCountable
            ? "__count__"
            : unit;

        const categoryName =
          hasApprovedSmartIdentity
            ? approvedSmartName
            : manual.name;

        const category =
          resolveShoppingCategoryForItem(
            categoryName,
            mergeUnit,
            packageSize
          );

        const packageKey =
          packageSize &&
            isPackageSizeSensitiveUnit(mergeUnit)
            ? packageSize
            : "";

        const key = canMergeWithRecipe
          ? `recipe::${category}::${mergeName}::${mergeUnit || ""}::${packageKey}`
          : quantity !== null ||
            hasApprovedSmartIdentity
            ? `manual::${category}::${mergeName}::${unit || ""}::${packageSize}`
            : `manual::${category}::${mergeName}::${item.id}`;

        const quantityToAdd =
          effectiveQuantity !== null
            ? manualIsCountable
              ? Math.ceil(effectiveQuantity)
              : effectiveQuantity
            : 0;

        const existing = map.get(key);

        if (existing) {
          existing.sourceIds.push(item.id);
          existing.count += 1;
          existing.checked = existing.checked && item.checked;

          if (quantityToAdd > 0) {
            existing.totalQuantity += quantityToAdd;
            existing.minQuantity += quantityToAdd;
            existing.maxQuantity += quantityToAdd;
          }

          if (
            existing.unit !== mergeUnit ||
            existing.packageSize !== packageSize
          ) {
            if (
              existing.unit !== null ||
              mergeUnit !== null ||
              existing.packageSize ||
              packageSize
            ) {
              existing.mixedUnits = true;
            }
          }
        } else {
          map.set(key, {
            checked: item.checked,
            category,
            sourceIds: [item.id],
            count: 1,

            name:
              canMergeWithRecipe ||
                quantity !== null ||
                hasApprovedSmartIdentity
                ? mergeName
                : manual.name,

            // An approved, measured manual item uses the same
            // shopper-facing formatting as compatible recipe items.
            // It remains a separate raw row underneath.
            isManual: !canMergeWithRecipe,
            isCountable: manualIsCountable,

            totalQuantity: quantityToAdd,
            minQuantity: quantityToAdd,
            maxQuantity: quantityToAdd,

            unit: mergeUnit ?? null,
            packageSize,
            mixedUnits: false,

            // Manual rows do not pretend to be recipes.
            recipeNames: new Set(),
            recipeBreakdown: new Map(),
          });
        }

        continue;
      }

      // =====================================================
      // Recipe ingredient path
      // =====================================================
      const smartItem = item as ShoppingItemWithSmartMeta;
      const cleanedRaw = cleanIngredientName(item.text);
      const parsed = parseIngredient(item.text);
      const savedName = String(smartItem.normalizedName || "").trim().toLowerCase();
      const parsedName = parsed.name || cleanedRaw;

      // Prefer the freshly parsed name when an older saved item only kept a
      // vague name like "cheese". This lets updated cleanup rules fix existing
      // list items such as "shredded cheese" -> "cheddar cheese".
      const cleanedName =
        savedName && savedName !== "cheese"
          ? savedName
          : parsedName || savedName;

      if (shouldHideShoppingItem(cleanedName)) continue;

      let parsedUnit =
        smartItem.unit !== undefined && smartItem.unit !== null
          ? smartItem.unit
          : parsed.unit;

      if (parsedUnit === "__count__") {
        parsedUnit = null;
      }

      parsedUnit = normalizeUnit(parsedUnit);

      let parsedQuantity =
        typeof smartItem.quantity === "number"
          ? smartItem.quantity
          : parsed.quantity ?? null;

      let packageSize =
        normalizePackageSize(smartItem.packageSize) ||
        normalizePackageSize(parsed.packageSize);

      const preNormalizedName = cleanIngredientName(cleanedName)
        .toLowerCase()
        .replace(/\bbone-in pork chops?\b/g, "pork chop");

      let safeName = preNormalizedName
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Repair older saved wording such as "hot dogs buns".
      if (/\bhot dogs?\s+buns?\b/.test(safeName)) {
        safeName = "hot dog bun";
      }

      // Recover bacon quantities from original recipe wording.
      const baconPieceMatch = String(item.text || "").match(
        /^\s*(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(?:-|–|to)?\s*(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)?\s+(strips?|slices?)\s+bacon\b/i
      );

      if (baconPieceMatch) {
        const [, minRaw, maxRaw, unitRaw] = baconPieceMatch;

        safeName = "bacon";
        parsedUnit = normalizeUnit(unitRaw);
        parsedQuantity = parseFraction(maxRaw || minRaw);

        parsed.minQuantity = parseFraction(minRaw);
        parsed.maxQuantity = parseFraction(maxRaw || minRaw);
      }

      // Repair older parsed rows such as "6 strips bacon"
      // where the quantity survived but "strips" became part of the name.
      if (
        (!parsedUnit || parsedUnit === "strip") &&
        /^(?:(?:strip|strips)\s+bacon|bacon\s+(?:strip|strips))$/.test(
          safeName
        )
      ) {
        safeName = "bacon";
        parsedUnit = "strip";

        if (parsedQuantity === null) {
          parsedQuantity = 1;
        }
      }

      // Run the junk/combined-seasoning check after final name cleanup.
      if (shouldHideShoppingItem(safeName)) {
        continue;
      }

      if (parsedUnit === "can" && safeName === "corn on the cob") {
        safeName = "corn";
      } else if (!parsedUnit) {
        safeName = normalizeSideSuggestionText(safeName);
      }

      // --- Recipe name fixes before category/merge decisions ---
      // Protect seasoning and pantry onion/garlic items before broad produce cleanup.
      if (safeName.includes("onion powder")) {
        safeName = "onion powder";
      } else if (
        safeName.includes("french fried onion") ||
        safeName.includes("fried onion")
      ) {
        safeName = "french fried onions";
      } else if (safeName.includes("garlic powder")) {
        safeName = "garlic powder";
      } else if (safeName.includes("garlic")) {
        safeName = "garlic";
      }

      if (safeName.includes("pork") && safeName.includes("chop")) {
        safeName = "pork chop";
      }

      if (safeName.includes("chicken") && safeName.includes("breast")) {
        safeName = "chicken breast";
      }

      if (safeName === "eggs") {
        safeName = "egg";
      }

      if (
        safeName.includes("onion") &&
        safeName !== "onion powder" &&
        safeName !== "french fried onions"
      ) {
        if (safeName.includes("green")) safeName = "green onion";
        else if (safeName.includes("red")) safeName = "red onion";
        else if (safeName.includes("yellow")) safeName = "yellow onion";
        else if (safeName.includes("white")) safeName = "white onion";
        else safeName = "onion";
      }

      // --- Recipe merge behavior ---
      // Loose recipe onions should merge as countable items.
      if (
        safeName === "onion" ||
        safeName === "yellow onion" ||
        safeName === "white onion" ||
        safeName === "red onion" ||
        safeName === "green onion"
      ) {
        parsedUnit = null;
        if (parsedQuantity === null) parsedQuantity = 1;
      }

      // Lemon/lime juice or zest should shop as whole fruit.
      if (safeName === "lemon" || safeName === "lime") {
        if (parsedUnit === "tsp" || parsedUnit === "Tbsp" || parsedUnit === "cup") {
          parsedUnit = null;
          parsedQuantity = 1;
        }
      }

      // Fresh herbs shop better as bunches than tsp/Tbsp/cup amounts.
      if (safeName === "parsley" || safeName === "cilantro") {
        if (
          !parsedUnit ||
          parsedUnit === "tsp" ||
          parsedUnit === "Tbsp" ||
          parsedUnit === "cup"
        ) {
          parsedUnit = "bunch";
          parsedQuantity = 1;
        }
      }

      // Plain black beans should merge with canned black beans.
      if (safeName === "black bean") {
        safeName = "black beans";
      }

      if (safeName === "black beans") {
        if (!parsedUnit) parsedUnit = "can";
        if (parsedQuantity === null) parsedQuantity = 1;
        if (!packageSize) packageSize = DEFAULT_CAN_PACKAGE_SIZE_BY_NAME["black beans"];
      }

      if (safeName === "corn") {
        if (!parsedUnit || parsedUnit === "cup" || parsedUnit === "Tbsp" || parsedUnit === "tsp") {
          parsedUnit = "can";
        }
        if (parsedQuantity === null) parsedQuantity = 1;
        if (!packageSize) packageSize = DEFAULT_CAN_PACKAGE_SIZE_BY_NAME.corn;
      }

      // Spices and small dairy check-items should merge by name, not teaspoon amounts.
      if (MERGE_AS_SINGLE_SPICES.has(safeName)) {
        parsedUnit = null;
        parsedQuantity = null;
      }

      if (MERGE_AS_SINGLE_DAIRY_ITEMS.has(safeName)) {
        parsedUnit = null;
        parsedQuantity = null;
      }
      if (MERGE_AS_SINGLE_BAKING_ITEMS.has(safeName)) {
        parsedUnit = null;
        parsedQuantity = null;
      }

      // Treat generic cheddar cheese as one grocery item when one recipe gives
      // an amount and another only says "shredded cheese".
      if (safeName === "cheddar cheese") {
        if (parsedUnit === "cup" || parsedUnit === "Tbsp" || parsedUnit === "tsp") {
          parsedUnit = null;
          parsedQuantity = null;
        }
      }

      // Treat loose/measured beans as canned pantry items for shopping.
      // Example: "1 cup black beans, rinsed" should shop as "1 (15 oz) can Black Beans".
      if (
        safeName === "black beans" ||
        safeName === "pinto beans" ||
        safeName === "kidney beans" ||
        safeName === "white beans" ||
        safeName === "chili beans"
      ) {
        if (!parsedUnit || parsedUnit === "cup" || parsedUnit === "Tbsp" || parsedUnit === "tsp") {
          parsedUnit = "can";
          parsedQuantity = parsedQuantity ?? 1;
          if (!packageSize && safeName === "black beans") {
            packageSize = DEFAULT_CAN_PACKAGE_SIZE_BY_NAME["black beans"];
          }
        }
      }

      // Treat loose or cup-measured baby bella mushrooms as the common 8 oz package.
      // Preserve real package/weight amounts if the recipe already gives oz/lb/package.
      if (safeName === "baby bella mushrooms") {
        const packageOz = getOzFromPackageSize(packageSize);

        if (packageOz && (!parsedUnit || parsedUnit === "oz")) {
          parsedUnit = "oz";
          parsedQuantity = packageOz;
        } else if (
          !parsedUnit ||
          parsedUnit === "cup" ||
          parsedUnit === "Tbsp" ||
          parsedUnit === "tsp"
        ) {
          parsedUnit = "oz";
          parsedQuantity = 8;
        }
      }

      // Prepared side suggestions are plain shopping-list ideas, not measured
      // recipe ingredients. Merge them by name and keep awkward units off the row.
      if (isPreparedSideName(safeName)) {
        parsedUnit = null;
        parsedQuantity = null;
        packageSize = "";
      }

      const forceCountable =
        FORCE_COUNTABLE_RECIPE_ITEMS.has(safeName) ||
        SMART_SHOPPING_FORCE_COUNTABLE_ITEMS.has(
          safeName
        );

      const isMeasured = !forceCountable && parsedUnit !== null;
      const isCountable =
        forceCountable || (!isMeasured && isCountableIngredient(safeName));

      const normalizedName = isCountable
        ? normalizeCountableName(safeName)
        : safeName;

      const mergeUnit = isCountable ? "__count__" : parsedUnit;

      // Keep recipe-style measurements in the source breakdown when they are
      // not especially useful on the main shopper-facing row.
      const isVolumeMeasuredTomato =
        (
          normalizedName === "cherry tomato" ||
          normalizedName === "cherry tomatoes"
        ) &&
        (
          mergeUnit === "cup" ||
          mergeUnit === "Tbsp" ||
          mergeUnit === "tsp"
        );

      const hideMainMeasurement =
        normalizedName === "white rice" ||
        isVolumeMeasuredTomato;

      const groupedUnit = hideMainMeasurement ? null : mergeUnit;
      const groupedPackageSize = hideMainMeasurement ? "" : packageSize;

      const category = resolveShoppingCategoryForItem(
        normalizedName,
        mergeUnit,
        packageSize
      );

      const packageKey =
        groupedPackageSize && isPackageSizeSensitiveUnit(groupedUnit)
          ? groupedPackageSize
          : "";

      const key = `recipe::${category}::${normalizedName}::${groupedUnit || ""}::${packageKey}`;


      const quantityToAdd =
        parsedQuantity !== null
          ? isCountable
            ? Math.ceil(parsedQuantity)
            : parsedQuantity
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
      const mainQuantityToAdd = hideMainMeasurement ? 0 : quantityToAdd;
      const mainMinQuantityToAdd = hideMainMeasurement ? 0 : minQuantityToAdd;
      const mainMaxQuantityToAdd = hideMainMeasurement ? 0 : maxQuantityToAdd;

      const recipeQuantityToAdd = quantityToAdd > 0 ? quantityToAdd : 0;
      const recipeUnit = mergeUnit ?? null;

      const existing = map.get(key);

      if (existing) {
        existing.sourceIds.push(item.id);
        existing.count += 1;
        existing.checked = existing.checked && item.checked;

        if (mainQuantityToAdd > 0) {
          existing.totalQuantity += mainQuantityToAdd;
          existing.minQuantity += mainMinQuantityToAdd;
          existing.maxQuantity += mainMaxQuantityToAdd;
        }

        if (
          existing.unit !== groupedUnit ||
          existing.packageSize !== groupedPackageSize
        ) {
          if (
            existing.unit !== null ||
            groupedUnit !== null ||
            existing.packageSize ||
            groupedPackageSize
          ) {
            existing.mixedUnits = true;
          }
        }

        existing.recipeNames.add(recipeName);

        const breakdown = existing.recipeBreakdown.get(recipeName);
        if (breakdown) {
          breakdown.quantity += recipeQuantityToAdd;
          if (breakdown.unit !== recipeUnit || breakdown.packageSize !== packageSize) {
            breakdown.mixedUnits = true;
          }
        } else {
          existing.recipeBreakdown.set(recipeName, {
            quantity: recipeQuantityToAdd,
            unit: recipeUnit,
            packageSize,
            isCountable,
            name: normalizedName,
            mixedUnits: false,
          });
        }
      } else {
        map.set(key, {
          checked: item.checked,
          category,
          sourceIds: [item.id],
          count: 1,
          name: normalizedName,
          isManual: false,
          isCountable,
          totalQuantity: mainQuantityToAdd,
          minQuantity: mainMinQuantityToAdd,
          maxQuantity: mainMaxQuantityToAdd,
          unit: groupedUnit ?? null,
          packageSize: groupedPackageSize,
          mixedUnits: false,
          recipeNames: new Set([recipeName]),
          recipeBreakdown: new Map([
            [
              recipeName,
              {
                quantity: recipeQuantityToAdd,
                unit: recipeUnit,
                packageSize,
                isCountable,
                name: normalizedName,
                mixedUnits: false,
              },
            ],
          ]),
        });
      }
    }

    return Array.from(map.entries()).map(([key, value]) => {
      let displayText = value.isManual
        ? formatManualName(value.name)
        : formatDisplayName(value.name);

      if (value.isManual) {
        if (value.totalQuantity > 0) {
          const qty = value.totalQuantity;

          if (!value.mixedUnits && value.unit) {
            displayText = `${formatQuantity(qty)} ${pluralizeUnit(
              value.unit,
              qty
            )} ${formatManualName(value.name)}`.trim();
          } else {
            displayText = `${formatQuantity(qty)} ${pluralizeManualPhrase(
              value.name,
              qty
            )}`.trim();
          }
        } else if (value.count > 1) {
          const entryDescription =
            getStoredLanguage() === "es"
              ? `${value.count} artículos en la lista`
              : `${value.count} list entries`;

          displayText = `${formatManualName(
            value.name
          )} · ${entryDescription}`;
        }
      } else if (value.isCountable) {
        const qty =
          value.totalQuantity > 0
            ? value.totalQuantity
            : value.count > 0
              ? value.count
              : 1;

        const baseName = singularizeWord(value.name);

        const min = Math.ceil(value.minQuantity || qty);
        const max = Math.ceil(value.maxQuantity || qty);
        const finalQty = Math.ceil(qty);

        const formattedName = formatDisplayName(
          pluralizeCountable(baseName, finalQty)
        );

        if (baseName === "garlic") {
          displayText = `${finalQty} ${finalQty === 1 ? "clove" : "cloves"
            } Garlic`;
        } else if (min !== max) {
          displayText = `${min}-${max} ${formattedName}`;
        } else {
          displayText = `${finalQty} ${formattedName}`;
        }
      } else if (
        !value.mixedUnits &&
        value.unit &&
        value.totalQuantity > 0 &&
        shouldShowMeasuredTotal(value.name, value.unit, value.totalQuantity) &&
        !shouldHideMainRowAmount(value.name, value.unit)
      ) {
        const formattedName = formatDisplayName(value.name);

        const packageText =
          value.packageSize && isPackageSizeSensitiveUnit(value.unit)
            ? ` (${formatPackageSize(value.packageSize)})`
            : "";

        displayText = `${formatQuantity(value.totalQuantity)} ${pluralizeUnit(
          value.unit,
          value.totalQuantity
        )}${packageText} ${formattedName}`;
      }

      const recipeNames = Array.from(value.recipeNames)
        .flatMap((name) =>
          String(name || "")
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean)
        )
        .filter((name, index, arr) => arr.indexOf(name) === index)
        .sort((a, b) => a.localeCompare(b));
      const recipeCount = recipeNames.length;
      const recipeBreakdown = recipeNames.map((recipeName) => {
        const breakdown = value.recipeBreakdown.get(recipeName);
        const amountText = breakdown
          ? formatRecipeBreakdownAmount(
            breakdown.name,
            breakdown.quantity,
            breakdown.mixedUnits ? null : breakdown.unit,
            breakdown.isCountable,
            breakdown.mixedUnits ? "" : breakdown.packageSize
          )
          : "";

        return { recipeName, amountText };
      });

      const thumbnail =
        resolveSmartShoppingThumbnail(
          value.name,
          value.category
        );

      return {
        id: key,
        checked: value.checked,
        category: value.category,
        sourceIds: value.sourceIds,
        count: value.count,
        recipeCount,
        recipeCountLabel: recipeCount > 1 ? `(${recipeCount} recipes)` : "",
        recipeNames,
        recipeBreakdown,
        thumbnailKey: thumbnail.thumbnailKey,
        thumbnailMatchType: thumbnail.matchType,
        thumbnailAltText: thumbnail.altText,
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

    // Once a user edits an item, treat the edited text as a manual shopping
    // entry so the app does not fight their wording.
    const manual = parseManualShoppingItem(trimmed);

    if (shouldHideManualShoppingItem(manual.name)) return;

    const updated = shoppingItems.map((item) =>
      editingGroup.sourceIds.includes(item.id)
        ? ({
          ...item,
          text: manual.rawText,
          category: resolveShoppingCategoryForItem(
            manual.name,
            manual.unit,
            manual.packageSize
          ),
          sourceRecipe: "",
          normalizedName: manual.name,
          quantity: manual.quantity ?? undefined,
          unit: manual.unit ?? undefined,
          packageSize: manual.packageSize || undefined,
        } as ShoppingItem & {
          normalizedName?: string;
          quantity?: number;
          unit?: string | null;
          packageSize?: string;
        })
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

  const openSourceModal = (group: CombinedItem) => {
    if (group.recipeNames.length === 0) return;
    setSourceModalGroup(group);
  };

  const closeSourceModal = () => {
    setSourceModalGroup(null);
  };

  // =====================================================
  // Render
  // =====================================================
  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 20px 120px 20px",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: "550px",
          width: "100%",
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        <header>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h1>{t("shopping.title")}</h1>
            <TipsModal tips={SHOPPING_TIPS} />
          </div>
          <ShoppingSyncStatus />
        </header>

        <Card style={{ marginBottom: 8 }}>
          <form onSubmit={handleAddItem} style={{ display: "flex", gap: 10 }}>
            <input
              placeholder={t("shopping.inputPlaceholder")}
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              style={{
                flex: "1 1 auto",
                minWidth: 0,
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
                flexShrink: 0,
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

          {combinedItems.length > 0 && (
            <button
              onClick={shareShoppingList}
              style={{
                background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.28)",
                color: "#93c5fd",
                fontSize: 11,
                fontWeight: 900,
                padding: "6px 12px",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                letterSpacing: 0.3,
              }}
            >
              <Share2 size={14} />
              {t("shopping.shareList").toUpperCase()}
            </button>
          )}

          {combinedItems.length > 0 && (
            <button
              type="button"
              onClick={openSmartShoppingPreview}
              style={{
                minHeight: 34,
                padding: "7px 12px",
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                gap: 7,

                background:
                  "linear-gradient(135deg, rgba(147,51,234,0.24), rgba(79,70,229,0.18))",

                border:
                  "1px solid rgba(192,132,252,0.38)",

                color: "#f3e8ff",

                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.08), 0 7px 20px rgba(88,28,135,0.2)",

                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 0.3,
              }}
            >
              <Sparkles
                size={14}
                style={{
                  flexShrink: 0,
                  color: "#d8b4fe",
                }}
              />

              <span>
                {getStoredLanguage() === "es"
                  ? "ORGANIZAR LISTA"
                  : "ORGANIZE LIST"}
              </span>

              <span
                style={{
                  padding: "3px 6px",
                  borderRadius: 999,
                  background:
                    "rgba(216,180,254,0.13)",
                  border:
                    "1px solid rgba(216,180,254,0.22)",
                  color: "#e9d5ff",
                  fontSize: 8,
                  fontWeight: 950,
                  lineHeight: 1,
                  letterSpacing: 0.7,
                }}
              >
                PLUS
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleSmartShoppingPictures}
            aria-pressed={
              smartShoppingPreferences.showItemPictures
            }
            style={{
              minHeight: 34,
              padding: "7px 11px",
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,

              background:
                smartShoppingPreferences.showItemPictures
                  ? "rgba(59,130,246,0.09)"
                  : "rgba(255,255,255,0.035)",

              border:
                smartShoppingPreferences.showItemPictures
                  ? "1px solid rgba(96,165,250,0.2)"
                  : "1px solid rgba(255,255,255,0.08)",

              color:
                smartShoppingPreferences.showItemPictures
                  ? "rgba(191,219,254,0.82)"
                  : "rgba(255,255,255,0.52)",

              fontSize: 10,
              fontWeight: 850,
              letterSpacing: 0.25,
            }}
          >
            {smartShoppingPreferences.showItemPictures ? (
              <ImageIcon size={14} />
            ) : (
              <ImageOff size={14} />
            )}

            {getStoredLanguage() === "es"
              ? smartShoppingPreferences.showItemPictures
                ? "OCULTAR FOTOS"
                : "MOSTRAR FOTOS"
              : smartShoppingPreferences.showItemPictures
                ? "HIDE PICTURES"
                : "SHOW PICTURES"}
          </button>

          {smartShoppingStatusMessage && (
            <div
              role="status"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "12px 14px",
                marginBottom: 16,
                borderRadius: 15,
                background:
                  "rgba(34,197,94,0.09)",
                border:
                  "1px solid rgba(74,222,128,0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  minWidth: 0,
                  color: "#bbf7d0",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                <CheckCircle2
                  size={17}
                  style={{ flexShrink: 0 }}
                />

                <span>
                  {smartShoppingStatusMessage}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  flexShrink: 0,
                }}
              >
                {smartShoppingUndoPlan && (
                  <button
                    type="button"
                    onClick={
                      undoSmartShoppingChanges
                    }
                    style={{
                      padding: "6px 10px",
                      borderRadius: 10,
                      background:
                        "rgba(34,197,94,0.12)",
                      border:
                        "1px solid rgba(74,222,128,0.22)",
                      color: "#bbf7d0",
                      fontSize: 10,
                      fontWeight: 900,
                    }}
                  >
                    {getStoredLanguage() === "es"
                      ? "DESHACER"
                      : "UNDO"}
                  </button>
                )}

                <button
                  type="button"
                  aria-label={
                    getStoredLanguage() === "es"
                      ? "Cerrar mensaje"
                      : "Dismiss message"
                  }
                  onClick={() =>
                    setSmartShoppingStatusMessage("")
                  }
                  style={{
                    width: 28,
                    height: 28,
                    padding: 0,
                    borderRadius: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "rgba(255,255,255,0.04)",
                    border:
                      "1px solid rgba(255,255,255,0.08)",
                    color:
                      "rgba(255,255,255,0.65)",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
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
            {hideChecked
              ? t("shopping.showChecked").toUpperCase()
              : t("shopping.hideChecked").toUpperCase()}
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
              {t("common.clearAll").toUpperCase()}
            </button>
          )}

          {checkedCount > 0 && (
            <button
              onClick={addCheckedItemsToPantry}
              style={{
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.28)",
                color: "#86efac",
                fontSize: 11,
                fontWeight: 900,
                padding: "6px 12px",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                letterSpacing: 0.3,
              }}
            >
              {t("shopping.addBoughtToPantry").toUpperCase()} ({checkedCount})
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
              {t("shopping.clearChecked").toUpperCase()} ({checkedCount})
            </button>
          )}
        </div>

        {pantryMessage && (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 12px",
              borderRadius: 14,
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.22)",
              color: "#86efac",
              fontSize: 13,
              fontWeight: 800,
              textAlign: "center",
            }}
          >
            {pantryMessage}
          </div>
        )}

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
                {getCategoryLabel(group.section).toUpperCase()}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.1)",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gap: 8,
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
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
                    padding: "14px 12px",
                    borderRadius: "14px",
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    overflow: "hidden",
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
                      flex: "1 1 auto",
                      overflow: "hidden",
                    }}
                  >
                    {item.checked ? (
                      <CheckCircle2 size={18} color="#22c55e" />
                    ) : (
                      <Circle size={18} style={{ opacity: 0.2, flexShrink: 0 }} />
                    )}

                    {smartShoppingPreferences.showItemPictures && (
                      <SmartShoppingThumbnail
                        thumbnailKey={item.thumbnailKey}
                        altText={item.thumbnailAltText}
                        category={item.category}
                        size={36}
                        variant="list"
                      />
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        if (item.recipeNames.length === 0) return;
                        e.stopPropagation();
                        openSourceModal(item);
                      }}
                      style={{
                        flex: "1 1 auto",
                        minWidth: 0,
                        maxWidth: "100%",
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "inherit",
                        font: "inherit",
                        textAlign: "left",
                        cursor: item.recipeNames.length > 0 ? "pointer" : "default",
                        overflow: "hidden",
                      }}
                      aria-label={
                        item.recipeNames.length > 0
                          ? `Show recipes using ${item.displayText}`
                          : undefined
                      }
                      title={
                        item.recipeNames.length > 0
                          ? "Show recipes using this item"
                          : undefined
                      }
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          textDecoration: item.checked ? "line-through" : "none",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "block",
                          whiteSpace: "nowrap",
                          minWidth: 0,
                          maxWidth: "100%",
                        }}
                      >
                        {item.displayText}
                        {item.recipeCountLabel ? (
                          <span
                            style={{
                              marginLeft: 8,
                              fontSize: 12,
                              opacity: 0.85,
                              fontWeight: 900,
                              color: "#86efac",
                            }}
                          >
                            {item.recipeCountLabel}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
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
              {hideChecked ? t("shopping.noUnchecked") : t("shopping.empty")}
            </div>
          </div>
        )}

        {sourceModalGroup && (
          <div
            onClick={closeSourceModal}
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
            <div
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
                  <div style={{ fontSize: 18, fontWeight: 900 }}>
                    Used In{" "}
                    {sourceModalGroup.recipeCount > 0
                      ? `(${sourceModalGroup.recipeCount} ${sourceModalGroup.recipeCount === 1 ? "recipe" : "recipes"
                      })`
                      : ""}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.65 }}>
                    {sourceModalGroup.displayText}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeSourceModal}
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
                  aria-label="Close recipe source details"
                  title="Close"
                >
                  <X size={17} />
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 8,
                  maxHeight: 260,
                  overflowY: "auto",
                  paddingRight: 2,
                }}
              >
                {sourceModalGroup.recipeBreakdown.map((recipe) => (
                  <div
                    key={recipe.recipeName}
                    style={{
                      padding: "11px 12px",
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: 14,
                        fontWeight: 800,
                      }}
                    >
                      {recipe.recipeName}
                    </span>

                    {recipe.amountText ? (
                      <span
                        style={{
                          flexShrink: 0,
                          fontSize: 12,
                          fontWeight: 900,
                          color: "#86efac",
                          opacity: 0.95,
                        }}
                      >
                        {recipe.amountText}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={closeSourceModal}
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white",
                  opacity: 0.9,
                  fontWeight: 900,
                }}
              >
                {t("common.done")}
              </button>
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
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{t("shopping.editItem")}</div>
                  <div style={{ fontSize: 12, opacity: 0.55 }}>
                    {t("shopping.editItemSubtitle")}
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
                  {t("common.save")}
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
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <SmartShoppingPreviewModal
        preview={smartShoppingPreview}
        isStale={smartShoppingPreviewIsStale}
        canApply={Boolean(
          smartShoppingApplyPlan?.canApply
        )}
        showItemPictures={
          smartShoppingPreferences.showItemPictures
        }
        onClose={closeSmartShoppingPreview}
        onRefresh={refreshSmartShoppingPreview}
        onApply={applySmartShoppingChanges}
      />
    </div>
  );
}