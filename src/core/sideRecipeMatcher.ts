import { ALL_RECIPES } from "./data";
import type { Meal } from "./types";

function normalizeSideName(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const SIDE_ALIASES: Record<string, string> = {
  // =====================================================
  // Bread / bakery sides
  // =====================================================
  "garlic bread": "quick-garlic-bread",
  "cheesy garlic bread": "quick-garlic-bread",
  "toast garlic bread": "quick-garlic-bread",

  "dinner rolls": "quick-soft-dinner-rolls",
  "rolls": "quick-soft-dinner-rolls",
  "soft dinner rolls": "quick-soft-dinner-rolls",

  // =====================================================
  // Potato sides
  // =====================================================
  "baked potato": "quick-airfryer-baked-potato",
  "baked potatoes": "quick-airfryer-baked-potato",
  "air fryer baked potato": "quick-airfryer-baked-potato",
  "loaded baked potato": "quick-airfryer-baked-potato",
  "loaded baked potatoes": "quick-airfryer-baked-potato",

  "mashed potatoes": "quick-creamy-mashed-potatoes",
  "creamy mashed potatoes": "quick-creamy-mashed-potatoes",
  "potatoes mashed": "quick-creamy-mashed-potatoes",

  "roasted potatoes": "quick-garlic-roasted-potatoes",
  "garlic roasted potatoes": "quick-garlic-roasted-potatoes",
  "roasted garlic potatoes": "quick-garlic-roasted-potatoes",

  "red potatoes": "quick-roasted-red-potatoes",
  "roasted red potatoes": "quick-roasted-red-potatoes",

  "crispy smashed potatoes": "quick-crispy-smashed-potatoes",
  "smashed potatoes": "quick-crispy-smashed-potatoes",

  "scalloped potatoes": "normal-scalloped-potatoes",
  "creamy scalloped potatoes": "normal-scalloped-potatoes",

  "potato salad": "classic-potato-salad",
  "classic potato salad": "classic-potato-salad",

  "french fries": "quick-seasoned-fries",
  "fries": "quick-seasoned-fries",
  "seasoned fries": "quick-seasoned-fries",
  "potato fries": "quick-seasoned-fries",

  // =====================================================
  // Sweet potato sides
  // =====================================================
  "baked sweet potato": "quick-baked-sweet-potatoes",
  "baked sweet potatoes": "quick-baked-sweet-potatoes",

  "roasted sweet potatoes": "quick-roasted-sweet-potato-cubes",
  "roasted sweet potato cubes": "quick-roasted-sweet-potato-cubes",
  "sweet potato cubes": "quick-roasted-sweet-potato-cubes",

  "sweet potato fries": "quick-sweet-potato-fries",
  "sweet potato wedges": "quick-sweet-potato-fries",

  "sweet potato casserole": "normal-sweet-potato-casserole",

  // =====================================================
  // Batch 2: Vegetable sides
  // =====================================================

  // Green beans
  "green beans": "quick-garlic-green-beans",
  "garlic green beans": "quick-garlic-green-beans",
  "roasted green beans": "quick-garlic-green-beans",
  "steamed green beans": "quick-garlic-green-beans",

  // Broccoli
  "broccoli": "quick-lemon-roasted-broccoli",
  "roasted broccoli": "quick-lemon-roasted-broccoli",
  "lemon roasted broccoli": "quick-lemon-roasted-broccoli",
  "steamed broccoli": "quick-lemon-roasted-broccoli",

  // Carrots
  "carrots": "quick-glazed-carrots",
  "glazed carrots": "quick-glazed-carrots",
  "roasted carrots": "quick-glazed-carrots",
  "steamed carrots": "quick-glazed-carrots",

  // Asparagus
  "asparagus": "quick-garlic-butter-asparagus",
  "garlic butter asparagus": "quick-garlic-butter-asparagus",
  "roasted asparagus": "quick-garlic-butter-asparagus",
  "grilled asparagus": "quick-garlic-butter-asparagus",
  "steamed asparagus": "quick-garlic-butter-asparagus",

  // Brussels sprouts
  "brussels sprouts": "quick-crispy-brussels-sprouts",
  "crispy brussels sprouts": "quick-crispy-brussels-sprouts",
  "roasted brussels sprouts": "quick-crispy-brussels-sprouts",

  // Cauliflower
  "cauliflower": "quick-roasted-cauliflower",
  "roasted cauliflower": "quick-roasted-cauliflower",
  "parmesan cauliflower": "quick-roasted-cauliflower",

  // Zucchini / squash
  "zucchini": "quick-sauteed-zucchini-squash",
  "zucchini and squash": "quick-sauteed-zucchini-squash",
  "sautéed zucchini and squash": "quick-sauteed-zucchini-squash",
  "sauteed zucchini and squash": "quick-sauteed-zucchini-squash",
  "summer squash": "quick-sauteed-zucchini-squash",

  // Spinach
  "creamed spinach": "quick-creamed-spinach",
  "spinach": "quick-creamed-spinach",

  // Peas / carrots
  "peas and carrots": "quick-peas-and-carrots",
  "peas": "quick-peas-and-carrots",

  // Root vegetables
  "roasted root vegetables": "quick-roasted-root-vegetables",
  "root vegetables": "quick-roasted-root-vegetables",
  "roasted vegetables": "quick-roasted-root-vegetables",

  // Grilled vegetables
  "grilled vegetables": "quick-grilled-veggie-kabobs",
  "grilled veggies": "quick-grilled-veggie-kabobs",
  "veggie kabobs": "quick-grilled-veggie-kabobs",
  "grilled veggie kabobs": "quick-grilled-veggie-kabobs",

  // Corn
  "corn on the cob": "quick-buttered-corn-on-the-cob",
  "buttered corn on the cob": "quick-buttered-corn-on-the-cob",
  "corn": "quick-buttered-corn-on-the-cob",
  "grilled corn": "quick-grilled-corn",
  "grilled corn on the cob": "quick-grilled-corn",
  "creamed corn": "quick-creamed-corn",

    // =====================================================
  // Batch 3: Rice, grains, beans, and Tex-Mex sides
  // =====================================================

  // Rice / grains

  "brown rice": "quick-brown-rice",

  "rice pilaf": "quick-rice-pilaf",

  "cilantro lime rice": "quick-cilantro-lime-rice",
  "lime rice": "quick-cilantro-lime-rice",


  // Beans

  "refried beans": "quick-refried-beans",

  "baked beans": "normal-baked-beans",


  // Tex-Mex simple sides

  "guacamole": "quick-classic-guacamole",

  // =====================================================
// Batch 4: BBQ, cookout, and comfort sides
// =====================================================

// Mac and cheese
"smoked mac and cheese": "big-smoked-mac-and-cheese",
"mac and cheese": "big-smoked-mac-and-cheese",
"macaroni and cheese": "big-smoked-mac-and-cheese",

// Potato / pasta salads
"pasta salad": "quick-classic-pasta-salad",


  // Appetizer-ish / special
  "buffalo chicken tots": "buffalo-chicken-tots",
};

function getSideRecipes(): Meal[] {
  return ALL_RECIPES.filter((meal: Meal) =>
    Array.isArray(meal.tags)
      ? meal.tags.some((tag) => String(tag).toLowerCase() === "side")
      : false
  );
}

export function findSideRecipeByName(sideName: string): Meal | null {
  const original = String(sideName || "").trim();
  if (!original) return null;

  const lower = original.toLowerCase().trim();
  const normalized = normalizeSideName(original);

  const aliasSlug =
    SIDE_ALIASES[lower] ||
    SIDE_ALIASES[normalized];

  const sideRecipes = getSideRecipes();

  if (aliasSlug) {
    return (
      sideRecipes.find((meal) => meal.slug === aliasSlug || meal.id === aliasSlug) ||
      null
    );
  }

  return (
    sideRecipes.find((meal) => {
      const recipeName = String(meal.name || "");
      return (
        recipeName.toLowerCase().trim() === lower ||
        normalizeSideName(recipeName) === normalized
      );
    }) || null
  );
}

export function getSideShoppingLines(sideName: string) {
  const sideRecipe = findSideRecipeByName(sideName);

  if (!sideRecipe?.ingredients?.trim()) {
    return {
      sideName,
      sideRecipe: null,
      lines: [sideName],
    };
  }

  return {
    sideName,
    sideRecipe,
    lines: sideRecipe.ingredients
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean),
  };
}