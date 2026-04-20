import type { Meal, Effort } from "./types";
import { ALL_RECIPES, SIDE_DISHES, DESSERTS, days } from "./data";

// =====================================================
// Planner types
// =====================================================

export type PlannerPrefs = {
  vegetarian: boolean;
  allergens?: string[];
  effort?: Effort | "any";
  includeDesserts?: boolean;
  includeSides?: boolean;
};

type MealBucket = {
  dinners: Meal[];
  sides: Meal[];
  desserts: Meal[];
};

type Day = (typeof days)[number];

// =====================================================
// Allergen + keyword helpers
// =====================================================

export const ALLERGENS = [
  "shellfish",
  "fish",
  "dairy",
  "Eggs",
  "peanuts",
  "tree_nuts",
  "gluten",
  "soy",
  "sesame",
] as const;

const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  shellfish: [
    "Shrimp",
    "crab",
    "lobster",
    "scallop",
    "scallops",
    "clam",
    "clams",
    "mussel",
    "mussels",
    "oyster",
    "oysters",
    "shellfish",
    "langostino",
    "crawfish",
    "crayfish",
    "prawn",
    "prawns",
  ],
  fish: [
    "fish",
    "salmon",
    "tuna",
    "tilapia",
    "cod",
    "mahi",
    "mahi-mahi",
    "trout",
    "halibut",
    "sardine",
    "anchovy",
  ],
  dairy: [
    "Milk",
    "Butter",
    "cheese",
    "cream",
    "half and half",
    "half-and-half",
    "sour cream",
    "yogurt",
    "mozzarella",
    "cheddar",
    "parmesan",
    "american cheese",
    "heavy cream",
    "evaporated Milk",
    "condensed Milk",
    "ricotta",
    "feta",
    "swiss",
  ],
  Eggs: ["Egg", "Eggs", "mayonnaise", "mayo"],
  peanuts: ["peanut", "peanuts", "peanut Butter"],
  tree_nuts: [
    "almond",
    "almonds",
    "cashew",
    "cashews",
    "pecan",
    "pecans",
    "walnut",
    "walnuts",
    "pistachio",
    "pistachios",
    "hazelnut",
    "hazelnuts",
    "tree nut",
    "nuts",
  ],
  gluten: [
    "flour",
    "Breadcrumbs",
    "Bread crumb",
    "pasta",
    "noodle",
    "noodles",
    "Bread",
    "bun",
    "roll",
    "cracker",
    "soy sauce",
    "tortilla",
    "naan",
    "pie crust",
    "pizza dough",
    "manicotti",
    "Egg noodles",
    "panko",
  ],
  soy: ["soy", "soy sauce", "tofu", "edamame", "miso", "teriyaki", "tempeh"],
  sesame: ["sesame", "sesame oil", "sesame seeds", "tahini"],
};

const EFFORT_ALIASES: Record<string, string> = {
  quick: "quick",
  normal: "normal",
  big: "big",
  takeout: "takeout",
  medium: "normal",
  effort: "big",
};

// =====================================================
// Normalizers
// =====================================================

function normalizeText(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

function normalizeTags(tags?: string[]) {
  return (tags ?? []).map((tag) => normalizeText(tag));
}

function normalizeEffort(value?: string) {
  const normalized = normalizeText(value);
  return EFFORT_ALIASES[normalized] ?? normalized;
}

function mealSearchText(meal: Meal) {
  return [
    meal.name,
    meal.ingredients,
    meal.instructions,
    meal.notes,
    ...(meal.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function hasAnyKeyword(text: string, keywords: string[]) {
  const lower = text.toLowerCase();
  return keywords.some((word) => lower.includes(word.toLowerCase()));
}

// =====================================================
// Allergen checks
// =====================================================

export function mealHasAllergen(meal: Meal, allergen: string) {
  const normalizedAllergen = normalizeText(allergen);
  const tags = normalizeTags(meal.tags);
  const text = mealSearchText(meal);

  if (!normalizedAllergen) return false;
  if (tags.includes(normalizedAllergen)) return true;
  if (text.includes(normalizedAllergen)) return true;

  const keywords = ALLERGEN_KEYWORDS[normalizedAllergen] ?? [];
  if (keywords.length > 0 && hasAnyKeyword(text, keywords)) return true;

  return false;
}

// =====================================================
// Meal type helpers
// =====================================================

function isDessert(meal: Meal) {
  return normalizeTags(meal.tags).includes("dessert");
}

function isSideDish(meal: Meal) {
  const tags = normalizeTags(meal.tags);
  return tags.includes("side") || tags.includes("side-dish");
}

function isSalad(meal: Meal) {
  return normalizeTags(meal.tags).includes("salad");
}

function matchesEffort(meal: Meal, requested?: Effort | "any") {
  if (!requested || requested === "any") return true;
  return normalizeEffort(meal.effort) === normalizeEffort(requested);
}

function getMealCategory(meal: Meal) {
  const tags = normalizeTags(meal.tags);
  const effort = normalizeEffort(meal.effort);

  if (tags.includes("salad")) return "salad";
  if (tags.includes("grilling")) return "grilling";
  if (tags.includes("comfort")) return "comfort";
  if (tags.includes("kid-friendly")) return "kid-friendly";
  if (effort === "takeout") return "takeout";
  if (tags.includes("vegetarian") || meal.isVegetarian) return "vegetarian";

  return "general";
}

// =====================================================
// Source library
// =====================================================

function dedupeMeals(items: Meal[]) {
  const seen = new Set<string>();

  return items.filter((meal) => {
    const key = normalizeText(meal.slug || meal.id || meal.name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const dinnerLibrary: Meal[] = dedupeMeals(
  ALL_RECIPES.filter((meal) => {
    const tags = normalizeTags(meal.tags);

    return (
      !tags.includes("dessert") &&
      !tags.includes("side") &&
      !tags.includes("side-dish")
    );
  })
);

export const candidateLibrary = dinnerLibrary;

export const extrasLibrary: MealBucket = {
  dinners: dinnerLibrary,
  sides: dedupeMeals(SIDE_DISHES.filter((meal) => isSideDish(meal))),
  desserts: dedupeMeals(DESSERTS.filter((meal) => isDessert(meal))),
};

// =====================================================
// Filtering
// =====================================================

export function filterMealsForPrefs(meals: Meal[], prefs: PlannerPrefs) {
  let filtered = [...meals];

  filtered = filtered.filter((meal) => !isDessert(meal) && !isSideDish(meal));

  if (prefs.vegetarian) {
    filtered = filtered.filter((meal) => {
      const tags = normalizeTags(meal.tags);
      const text = mealSearchText(meal);

      if (meal.isVegetarian) return true;
      if (tags.includes("vegetarian")) return true;

      const meatWords = [
        "chicken",
        "beef",
        "pork",
        "turkey",
        "sausage",
        "ham",
        "bacon",
        "steak",
        "meatball",
        "Ground beef",
        "Pepperoni",
        "fish",
        "salmon",
        "tilapia",
        "Shrimp",
        "crab",
        "scallop",
        "scallops",
        "lobster",
      ];

      return !hasAnyKeyword(text, meatWords);
    });
  }

    filtered = filtered.filter((meal) => matchesEffort(meal, prefs.effort));

  const blocked = (prefs.allergens ?? []).map(normalizeText).filter(Boolean);
  if (blocked.length > 0) {
    filtered = filtered.filter(
      (meal) => !blocked.some((allergen) => mealHasAllergen(meal, allergen))
    );
  }

  return filtered;
}

// =====================================================
// Picking logic
// =====================================================

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export function pickMeals(meals: Meal[], count: number) {
  return shuffle(meals).slice(0, count);
}

export function buildDinnerPool(prefs: PlannerPrefs) {
  return filterMealsForPrefs(dinnerLibrary, prefs);
}

export function buildPlannerBuckets(prefs: PlannerPrefs): MealBucket {
  const dinners = filterMealsForPrefs(dinnerLibrary, prefs);
  const blocked = (prefs.allergens ?? []).map(normalizeText).filter(Boolean);

  const sides = prefs.includeSides
    ? extrasLibrary.sides.filter(
        (meal) => !blocked.some((allergen) => mealHasAllergen(meal, allergen))
      )
    : [];

  const desserts = prefs.includeDesserts
    ? extrasLibrary.desserts.filter(
        (meal) => !blocked.some((allergen) => mealHasAllergen(meal, allergen))
      )
    : [];

  return {
    dinners,
    sides,
    desserts,
  };
}

// =====================================================
// Planner scoring
// =====================================================

function scoreMealAgainstPantry(
  meal: Meal,
  pantry: string[] = [],
  opts?: { isFirstRun?: boolean }
) {
  const text = mealSearchText(meal);
  const normalizedPantry = pantry.map((item) => normalizeText(item)).filter(Boolean);

  if (normalizedPantry.length === 0) return 0;

  let score = 0;
  let matches = 0;
  const pantryWeight = opts?.isFirstRun ? 5 : 4;

  for (const item of normalizedPantry) {
    if (text.includes(item)) {
      score += pantryWeight;
      matches += 1;
    }
  }

  if (matches >= 2) score += opts?.isFirstRun ? 5 : 3;
  if (matches >= 3) score += opts?.isFirstRun ? 7 : 5;

  return score;
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getTodaySeed() {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

export function getPlannerScore(
  meal: Meal,
  opts?: {
    pantry?: string[];
    favorites?: string[];
    cookedRecently?: string[];
    isFirstRun?: boolean;
    usedCategories?: string[];
  }
) {
  const pantry = opts?.pantry ?? [];
  const favorites = (opts?.favorites ?? []).map(normalizeText);
  const cookedRecently = (opts?.cookedRecently ?? []).map(normalizeText);
  const isFirstRun = !!opts?.isFirstRun;
  const usedCategories = opts?.usedCategories ?? [];
  

  const nameKey = normalizeText(meal.name);
  const idKey = normalizeText(meal.id || meal.slug || meal.name);
  const tags = normalizeTags(meal.tags);
  const category = getMealCategory(meal);

  let score = 0;

  score += scoreMealAgainstPantry(meal, pantry, { isFirstRun });

  if (favorites.includes(nameKey) || favorites.includes(idKey)) {
    score += 8;
  }

  if (cookedRecently.includes(nameKey) || cookedRecently.includes(idKey)) {
    score -= 6;
  }

  if (tags.includes("quick")) score += 1;
  if (tags.includes("comfort")) score += 1;
  if (tags.includes("kid-friendly")) score += 1;
  if (tags.includes("salad") && tags.includes("dinner")) {
    score += 1;
  }

  // Cookbook meals should win more often than built-ins
  if (tags.includes("cookbook")) score += 10;

  
  const recentCategories = usedCategories.slice(-2);

  if (recentCategories.includes(category)) {
    score -= 4;
  }

  if (
    recentCategories.length >= 2 &&
    recentCategories[0] === recentCategories[1] &&
    recentCategories[0] === category
  ) {
    score -= 6;
  }

  const todaySeed = getTodaySeed();
  score += (hashString(meal.id || meal.slug || meal.name) + todaySeed) % 7;

  // Small randomness so rerolls do not feel frozen
  score += Math.random() * 3;

  return score;
}

// =====================================================
// Plan building helpers
// =====================================================

function mealMatchesDayEffort(meal: Meal, effort?: Effort) {
  if (!effort) return true;
  if (effort === "takeout") return normalizeEffort(meal.effort) === "takeout";
  return normalizeEffort(meal.effort) === normalizeEffort(effort);
}

function dedupeByName(items: Meal[]) {
  const seen = new Set<string>();
  return items.filter((meal) => {
    const key = normalizeText(meal.name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeCookbookMeal(meal: Meal): Meal {
  return {
    ...meal,
    id: meal.id || meal.slug || meal.name,
    slug:
      meal.slug ||
      meal.id ||
      normalizeText(meal.name).replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
    instructions: meal.instructions || "",
    photoUrl: meal.photoUrl || "",
    tags: Array.from(new Set([...(meal.tags ?? ["dinner"]), "cookbook"])),
    effort: meal.effort || "normal",
  };
}

function getAllergenSelections(preferences: {
  allergens?: string[];
  dietaryNotes?: string;
}) {
  const selected = new Set(
    (preferences.allergens ?? []).map((x) => normalizeText(x)).filter(Boolean)
  );

  const notes = normalizeText(preferences.dietaryNotes);

  if (notes.includes("shellfish")) selected.add("shellfish");
  if (notes.includes("fish")) selected.add("fish");
  if (notes.includes("dairy")) selected.add("dairy");
  if (notes.includes("egg")) selected.add("Eggs");
  if (notes.includes("peanut")) selected.add("peanuts");
  if (notes.includes("tree nut")) selected.add("tree_nuts");
  if (notes.includes("nuts")) selected.add("tree_nuts");
  if (notes.includes("gluten")) selected.add("gluten");
  if (notes.includes("soy")) selected.add("soy");
  if (notes.includes("sesame")) selected.add("sesame");

  return Array.from(selected);
}

// =====================================================
// Main generator
// =====================================================

export function generatePlan(opts: {
  cookbook?: Meal[];
  pantry?: string[];
  daySettings?: Partial<Record<Day, Effort>>;
  lockedMeals?: Partial<Record<Day, Meal | null>>;
  preferences: {
    vegetarian: boolean;
    allergens?: string[];
    dietaryNotes?: string;
    includeDesserts?: boolean;
    
  };
  favorites?: string[];
  cookedRecently?: string[];
}) {
  const {
    cookbook = [],
    pantry = [],
    daySettings = {},
    lockedMeals = {},
    preferences,
    favorites = [],
    cookedRecently = [],
  } = opts;

  const isFirstRun =
    localStorage.getItem("simple-dinners.hasGeneratedFirstPlan") !== "true";

  const plannerPrefs: PlannerPrefs = {
    vegetarian: preferences.vegetarian,
    allergens: getAllergenSelections(preferences),
    includeDesserts: preferences.includeDesserts,
    effort: "any",
  };

  const cookbookMeals = dedupeMeals(cookbook.map(normalizeCookbookMeal));

  const combinedDinnerLibrary = dedupeMeals([
    ...cookbookMeals,
    ...dinnerLibrary,
  ]);

  const dinnerPool = filterMealsForPrefs(combinedDinnerLibrary, plannerPrefs);
  const usedNames = new Set<string>();
  const usedCategories: string[] = [];
  const plan = {} as Record<Day, Meal>;
  let saladCount = 0;
  const MAX_SALADS = 2;

  for (const day of days) {
    const locked = lockedMeals[day];

    if (locked?.name) {
      plan[day] = locked;
      usedNames.add(normalizeText(locked.name));
      usedCategories.push(getMealCategory(locked));
      continue;
    }

    const requestedEffort = daySettings[day];

    if (requestedEffort === "takeout") {
      plan[day] = {
        id: `takeout-${day.toLowerCase()}`,
        slug: `takeout-${day.toLowerCase()}`,
        name: "Takeout Night",
        ingredients: "Order out (no groceries)",
        instructions:
          "Choose your favorite takeout spot and enjoy a night off from cooking.",
        effort: "takeout",
        tags: ["dinner", "takeout"],
        notes: "A built-in night off from cooking.",
      };
      usedNames.add(normalizeText(plan[day].name));
      usedCategories.push(getMealCategory(plan[day]));
      continue;
    }

    let candidates = dinnerPool
      .filter((meal) => mealMatchesDayEffort(meal, requestedEffort))
      .filter((meal) => {
        if (isSalad(meal) && saladCount >= MAX_SALADS) return false;
        return true;
      });

    if (candidates.length === 0) {
      candidates = [...dinnerPool];
    }

    candidates = dedupeByName(candidates).filter(
      (meal) => !usedNames.has(normalizeText(meal.name))
    );

    if (candidates.length === 0) {
      candidates = dedupeByName(dinnerPool);
    }

    const ranked = [...candidates].sort((a, b) => {
      const aScore = getPlannerScore(a, {
        pantry,
        favorites,
        cookedRecently,
        isFirstRun,
        usedCategories,
      });
      const bScore = getPlannerScore(b, {
        pantry,
        favorites,
        cookedRecently,
        isFirstRun,
        usedCategories,
      });
      return bScore - aScore;
    });

    // Pick from top candidates instead of always #1
const TOP_N = 6;
const pool = ranked.slice(0, TOP_N);

// random pick from top group
const selected =
  pool[Math.floor(Math.random() * pool.length)] ??
  ({
    id: `meal-fallback-${day.toLowerCase()}`,
    slug: `meal-fallback-${day.toLowerCase()}`,
    name: "Dinner Night",
    ingredients: "",
    instructions: "",
    effort: requestedEffort ?? "normal",
    tags: ["dinner"],
  } satisfies Meal);

    plan[day] = selected;
    usedNames.add(normalizeText(selected.name));
    usedCategories.push(getMealCategory(selected));

    if (isSalad(selected)) {
      saladCount++;
    }
  }

  if (isFirstRun) {
    localStorage.setItem("simple-dinners.hasGeneratedFirstPlan", "true");
  }

  return plan;
}