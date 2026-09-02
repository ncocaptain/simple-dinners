// =====================================================
// Builder: grocery category types
// =====================================================
export type GroceryCategory =
  | "Produce"
  | "Meat / Seafood"
  | "Dairy / Eggs"
  | "Deli / Refrigerated"
  | "Pantry"
  | "Frozen"
  | "Spices / Seasonings"
  | "Bakery"
  | "Beverages"
  | "Household"
  | "Cleaning"
  | "Paper Goods"
  | "Personal Care"
  | "Pharmacy"
  | "Pet"
  | "Other";

// =====================================================
// Builder: keyword map for smart grocery grouping
// Order matters. More specific categories should appear
// before broader ones when keyword overlap is possible.
// =====================================================
const CATEGORY_KEYWORDS: Array<{
  category: GroceryCategory;
  keywords: string[];
}> = [
  {
    category: "Produce",
    keywords: [
      "onion",
      "yellow onion",
      "red onion",
      "white onion",
      "green onion",
      "scallion",
      "scallions",
      "shallot",
      "shallots",
      "garlic",
      "garlic cloves",
      "tomato",
      "tomatoes",
      "lettuce",
      "spinach",
      "spinach leaves",
      "broccoli",
      "broccoli florets",
      "carrot",
      "carrots",
      "celery",
      "bell pepper",
      "red bell pepper",
      "yellow bell pepper",
      "green bell pepper",
      "orange bell pepper",
      "pepper",
      "peppers",
      "potato",
      "potatoes",
      "lime",
      "lemon",
      "lemon juice",
      "lime juice",
      "lemon zest",
      "lime zest",
      "cilantro",
      "parsley",
      "avocado",
      "cucumber",
      "zucchini",
      "yellow squash",
      "squash",
      "mushroom",
      "mushrooms",
      "baby bella mushrooms",
      "corn",
      "corn on the cob",
      "apple",
      "apples",
      "banana",
      "bananas",
      "grapes",
      "strawberries",
      "blueberries",
      "raspberries",
      "blackberries",
      "asparagus",
      "bunch asparagus",
      "sugar snap peas",
      "snap peas",
      "snow peas",
      "peas",
      "dill",
      "ginger",
      "fresh ginger",
      "jalapeno",
      "jalapenos",
      "poblano",
      "habanero",
      "habanero pepper",
      "habanero peppers",
      "serrano",
      "cabbage",
      "cauliflower",
      "green beans",
      "brussels sprouts",
      "sweet potato",
      "sweet potatoes",
      "fresh herbs",
    ],
  },
  {
    category: "Meat / Seafood",
    keywords: [
      "ground beef",
      "beef",
      "chicken",
      "chicken breast",
      "chicken thighs",
      "chicken tenders",
      "chicken tenderloins",
      "pork",
      "pork chop",
      "pork chops",
      "sausage",
      "italian sausage",
      "ground italian sausage",
      "mild ground italian sausage",
      "turkey",
      "ground turkey",
      "bacon",
      "ham",
      "sandwich meat",
      "deli meat",
      "lunch meat",
      "lunchmeat",
      "cold cuts",
      "steak",
      "shrimp",
      "fish",
      "salmon",
      "salmon fillets",
      "tilapia",
      "tilapia fillets",
      "tuna",
      "crab",
      "lobster",
      "scallop",
      "scallops",
      "sea scallop",
      "sea scallops",
      "ground chicken",
    ],
  },
  {
    category: "Dairy / Eggs",
    keywords: [
      "milk",
      "butter",
      "cheese",
      "mozzarella",
      "cheddar",
      "parmesan",
      "cream",
      "sour cream",
      "yogurt",
      "egg",
      "eggs",
      "half and half",
      "heavy cream",
      "ricotta",
      "feta",
      "swiss",
      "cream cheese",
      "cottage cheese",
    ],
  },
  {
    category: "Bakery",
    keywords: [
      "bread",
      "rolls",
      "bun",
      "buns",
      "hamburger bun",
      "hamburger buns",
      "hot dog bun",
      "hot dog buns",
      "tortilla",
      "tortillas",
      "wheat tortillas",
      "corn tortillas",
      "bagel",
      "bagels",
      "pita",
      "naan",
      "english muffin",
      "english muffins",
      "pizza dough",
      "prepared pizza dough",
      "dough",
    ],
  },
  {
    category: "Frozen",
    keywords: [
      "frozen",
      "hash browns",
      "frozen pizza",
      "ice cream",
      "frozen vegetables",
      "frozen vegetable",
      "mixed vegetables",
      "frozen fruit",
      "waffles",
      "freezer meal",
      "freezer item",
    ],
  },
  {
    category: "Pantry",
    keywords: [
      "rice",
      "pasta",
      "spaghetti",
      "flour",
      "cornmeal",
      "grits",
      "cornstarch",
      "sugar",
      "brown sugar",
      "honey",
      "beans",
      "black beans",
      "chili beans",
      "tomato sauce",
      "taco sauce",
      "bbq sauce",
      "barbecue sauce",
      "diced tomatoes",
      "broth",
      "stock",
      "beef broth",
      "chicken broth",
      "vegetable broth",
      "oil",
      "olive oil",
      "sesame oil",
      "toasted sesame oil",
      "vinegar",
      "rice vinegar",
      "soy sauce",
      "low sodium soy sauce",
      "salsa",
      "peanut butter",
      "jelly",
      "macaroni",
      "ketchup",
      "yellow mustard",
      "mustard",
      "mayonnaise",
      "mayo",
      "breadcrumbs",
      "crackers",
      "cereal",
      "oats",
      "pizza sauce",
      "jar pizza sauce",
      "stir fry sauce",
      "worcestershire sauce",
      "sesame seeds",
      "pickles",
      "citric acid",
      "beef broth",
      "chicken seasoning",
      "prepared sauce",
    ],
  },
  {
    category: "Spices / Seasonings",
    keywords: [
      "salt",
      "pepper",
      "black pepper",
      "paprika",
      "cumin",
      "turmeric",
      "oregano",
      "basil",
      "garlic powder",
      "onion powder",
      "chili powder",
      "red pepper flakes",
      "italian seasoning",
      "seasoning",
      "cajun seasoning",
      "taco seasoning",
      "parsley flakes",
      "dried dill",
      "dried parsley",
      "ground ginger",
      "ginger powder",
      "smoked paprika",
      "seasoned salt",
      "chicken seasoning",
    ],
  },
  {
    category: "Beverages",
    keywords: [
      "coffee",
      "tea",
      "juice",
      "soda",
      "sprite",
      "sprite zero",
      "sprite zero sugar",
      "water",
      "sparkling water",
      "sports drink",
      "drink mix",
      "orange juice",
      "apple juice",
    ],
  },
  {
    category: "Household",
    keywords: [
      "batteries",
      "battery",
      "light bulbs",
      "foil",
      "aluminum foil",
      "plastic wrap",
      "zip bags",
      "ziploc",
      "storage bags",
      "trash bags",
      "charcoal",
      "matches",
      "lighter",
    ],
  },
  {
    category: "Cleaning",
    keywords: [
      "dish soap",
      "dishwasher pods",
      "dishwasher detergent",
      "laundry detergent",
      "bleach",
      "cleaner",
      "spray cleaner",
      "sponges",
      "scrub brush",
      "disinfecting wipes",
      "soap refill",
    ],
  },
  {
    category: "Paper Goods",
    keywords: [
      "paper towels",
      "toilet paper",
      "napkins",
      "tissues",
      "plates",
      "paper plates",
      "cups",
      "plastic cups",
    ],
  },
  {
    category: "Personal Care",
    keywords: [
      "shampoo",
      "conditioner",
      "body wash",
      "soap",
      "toothpaste",
      "toothbrush",
      "deodorant",
      "lotion",
      "brow liner",
      "razor",
      "razors",
    ],
  },
  {
    category: "Pharmacy",
    keywords: [
      "ibuprofen",
      "acetaminophen",
      "tylenol",
      "advil",
      "allergy medicine",
      "bandages",
      "antacid",
      "cold medicine",
      "cough drops",
      "vitamins",
    ],
  },
  {
    category: "Pet",
    keywords: [
      "dog food",
      "cat food",
      "pet food",
      "dog treats",
      "cat litter",
      "pet litter",
    ],
  },
];

// =====================================================
// Builder: normalization helper
// =====================================================
// =====================================================
// Builder: normalization helper
// =====================================================
function normalize(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^\w\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(normalized: string, keywords: string[]) {
  return keywords.some((keyword) => normalized.includes(normalize(keyword)));
}

const RECOGNIZED_BRAND_BEVERAGES = [
  "sprite",
];

function isRecognizedBrandBeverage(normalized: string) {
  return RECOGNIZED_BRAND_BEVERAGES.some(
    (brand) =>
      normalized === brand ||
      normalized.startsWith(`${brand} `)
  );
}

// =====================================================
// Builder: category matcher
// Smarter priority rules first, then keyword fallback.
// =====================================================
export function categorizeGroceryItem(name: string): GroceryCategory {
  const normalized = normalize(name);

  if (!normalized) return "Other";

  // Recognizable beverage brands should win before broad Pantry words.
  // Example: "Sprite Zero Sugar" must not match "sugar" -> Pantry.
  if (isRecognizedBrandBeverage(normalized)) {
    return "Beverages";
  }

  // Refrigerated deli items.
  if (
    normalized === "hummus" ||
    normalized === "guacamole" ||
    normalized === "fresh guacamole" ||
    normalized === "prepared guacamole"
  ) {
    return "Deli / Refrigerated";
  }

  // ===== FROZEN FIRST =====
  // Frozen should beat Produce/Pantry.
  if (normalized === "breakfast bowl" || normalized === "breakfast bowls") {
    return "Frozen";
  }

  if (
    includesAny(normalized, [
      "frozen",
      "freezer",
      "hash browns",
      "tater tots",
      "ice cream",
      "frozen vegetables",
      "frozen vegetable",
      "mixed vegetables",
      "frozen fruit",
      "congelado",
      "congelada",
      "congelados",
      "congeladas",
    ])
  ) {
    return "Frozen";
  }

  // ===== HOUSEHOLD / NON-FOOD FIRST =====
  if (
    includesAny(normalized, [
      "batteries",
      "battery",
      "light bulbs",
      "foil",
      "aluminum foil",
      "parchment paper",
      "wax paper",
      "plastic wrap",
      "zip bags",
      "ziploc",
      "storage bags",
      "trash bags",
      "garbage bags",
      "charcoal",
      "matches",
      "lighter",
      "skewers",
      "toothpicks",
      "papel aluminio",
      "papel pergamino",
      "bolsas de basura",
      "baterias",
      "pilas",
      "carbon",
      "brochetas",
      "palillos",
    ])
  ) {
    return "Household";
  }

  if (
    includesAny(normalized, [
      "paper towels",
      "toilet paper",
      "napkins",
      "tissues",
      "paper plates",
      "plastic cups",
      "toallas de papel",
      "papel higienico",
      "servilletas",
      "platos de papel",
      "vasos plasticos",
    ])
  ) {
    return "Paper Goods";
  }

  if (
    includesAny(normalized, [
      "dish soap",
      "dishwasher pods",
      "dishwasher detergent",
      "laundry detergent",
      "bleach",
      "cleaner",
      "spray cleaner",
      "sponges",
      "scrub brush",
      "disinfecting wipes",
      "jabon para platos",
      "detergente",
      "cloro",
      "limpiador",
      "esponjas",
    ])
  ) {
    return "Cleaning";
  }

  // ===== FRESH HERBS / FRESH PRODUCE EXCEPTIONS =====
  // This keeps "fresh basil" in Produce, not Spices.
  if (
    includesAny(normalized, [
      "fresh basil",
      "fresh parsley",
      "fresh cilantro",
      "fresh dill",
      "fresh thyme",
      "fresh rosemary",
      "basil leaves",
      "cilantro fresco",
      "perejil fresco",
      "albahaca fresca",
      "eneldo fresco",
      "tomillo fresco",
      "romero fresco",
    ])
  ) {
    return "Produce";
  }

    // ===== EXACT PRODUCE / PANTRY EXCEPTIONS =====
  // Exact matching prevents short translated keywords such as
  // "sal" from incorrectly matching words such as "salad".
  if (
    [
      "salad",
      "ensalada",
      "orange",
"oranges",
"naranja",
"naranjas",
"mint",
"fresh mint",
"mint leaves",
"menta",
"menta fresca",
"hojas de menta",
    ].includes(normalized)
  ) {
    return "Produce";
  }

  if (
    [
      "taco shell",
      "taco shells",
      "hard taco shell",
      "hard taco shells",
      "crunchy taco shell",
      "crunchy taco shells",
      "con queso",
      "queso dip",
      "salsa con queso",
      "popcorn",
      "microwave popcorn",
      "popcorn kernels",
      "tortilla chips",
      "almond",
      "almonds",
      "almendra",
      "almendras",
    ].includes(normalized)
  ) {
    return "Pantry";
  }

  // Core protections for items that broad substring rules can misclassify.
  if (
    normalized === "chuck roast" ||
    normalized.includes("pepperoni") ||
    normalized.includes("salami")
  ) {
    return "Meat / Seafood";
  }

  if (
    normalized === "msg" ||
    normalized.includes("monosodium glutamate")
  ) {
    return "Spices / Seasonings";
  }

  if (
    normalized === "coleslaw mix" ||
    normalized === "bagged coleslaw mix" ||
    normalized === "shredded coleslaw mix"
  ) {
    return "Produce";
  }

  // Spanish "sal" must match as a word, not as a substring.
  // This prevents collisions with items such as salsa or salami.
  if (normalized === "sal" || normalized.startsWith("sal ")) {
    return "Spices / Seasonings";
  }

  // Fresh Fresno and Habanero peppers are produce, not black-pepper-style seasoning.
  if (
    normalized === "habanero pepper" ||
    normalized === "habanero peppers" ||
    normalized === "fresno pepper" ||
    normalized === "fresno peppers" ||
    normalized === "fresno chile" ||
    normalized === "fresno chiles" ||
    normalized === "chile fresno" ||
    normalized === "chiles fresno"
  ) {
    return "Produce";
  }

  // ===== SPICES / SEASONINGS =====
  // Spices should beat Pantry and Produce for things like pepper, cumin, taco seasoning.
  if (
    includesAny(normalized, [
      "salt",
      "pepper",
      "black pepper",
      "ground pepper",
      "red pepper flakes",
      "pepper flakes",
      "cayenne",
      "cayenne pepper",
      "paprika",
      "smoked paprika",
      "cumin",
      "turmeric",
      "oregano",
      "dried basil",
      "dried parsley",
      "dried dill",
      "dried thyme",
      "thyme",
      "rosemary",
      "garlic powder",
      "onion powder",
      "chili powder",
      "italian seasoning",
      "cajun seasoning",
      "taco seasoning",
      "chili seasoning",
      "seasoning packet",
      "seasoning",
      "spice",
      "rub",
      "cinnamon",
      "nutmeg",
      "pimienta",
      "pimenton",
      "comino",
      "curcuma",
      "cúrcuma",
      "oregano",
      "ajo en polvo",
      "cebolla en polvo",
      "chile en polvo",
      "sazonador",
      "condimento",
      "canela",
    ])
  ) {
    return "Spices / Seasonings";
  }

  // ===== GINGER RULE =====
  // tsp/tbsp ginger usually means ground ginger; fresh ginger is produce.
  if (normalized.includes("ginger") || normalized.includes("jengibre")) {
    if (
      normalized.includes("tsp") ||
      normalized.includes("tbsp") ||
      normalized.includes("ground") ||
      normalized.includes("molido")
    ) {
      return "Spices / Seasonings";
    }

    return "Produce";
  }

  // ===== PANTRY CONTAINER RULE =====
  // This is the big Mr. Smarty Pants rule:
  // "can corn" should go Pantry, not Produce.
  const hasPantryContainer = includesAny(normalized, [
    "can",
    "cans",
    "canned",
    "jar",
    "jars",
    "bottle",
    "bottles",
    "box",
    "boxes",
    "packet",
    "packets",
    "lata",
    "latas",
    "frasco",
    "frascos",
    "botella",
    "botellas",
    "caja",
    "cajas",
    "paquete",
    "paquetes",
  ]);

  if (hasPantryContainer) {
    // Keep obvious dairy refrigerated even if it says package/block/container.
    if (
      includesAny(normalized, [
        "cheese",
        "cream cheese",
        "sour cream",
        "heavy cream",
        "milk",
        "yogurt",
        "butter",
        "queso",
        "queso crema",
        "crema agria",
        "crema espesa",
        "leche",
        "yogur",
        "mantequilla",
      ]) &&
      !normalized.includes("coconut milk") &&
      !normalized.includes("leche de coco")
    ) {
      return "Dairy / Eggs";
    }

    // Keep obvious fresh/refrigerated meat as meat.
    if (
      includesAny(normalized, [
        "chicken",
        "beef",
        "ground beef",
        "pork",
        "bacon",
        "sausage",
        "steak",
        "shrimp",
        "salmon",
        "tilapia",
        "pollo",
        "carne",
        "res",
        "cerdo",
        "tocino",
        "salchicha",
        "bistec",
        "camarones",
      ]) &&
      !normalized.includes("tuna") &&
      !normalized.includes("atun")
    ) {
      return "Meat / Seafood";
    }

    return "Pantry";
  }

  // ===== COMMON DIRECT RULES =====
  if (normalized.includes("stock") || normalized.includes("broth") || normalized.includes("caldo")) {
    return "Pantry";
  }

  if (
    normalized.includes("pizza dough") ||
    normalized.includes("prepared pizza dough") ||
    normalized.includes("masa para pizza")
  ) {
    return "Bakery";
  }

  // ===== FALLBACK TO EXISTING KEYWORD MAP =====
  for (const group of CATEGORY_KEYWORDS) {
    if (group.keywords.some((keyword) => normalized.includes(normalize(keyword)))) {
      return group.category;
    }
  }

  return "Other";
}

// =====================================================
// Builder: display order for grouped shopping list
// =====================================================
export const GROCERY_CATEGORY_ORDER: GroceryCategory[] = [
  "Produce",
  "Meat / Seafood",
  "Dairy / Eggs",
  "Deli / Refrigerated",
  "Bakery",
  "Frozen",
  "Pantry",
  "Spices / Seasonings",
  "Beverages",
  "Household",
  "Cleaning",
  "Paper Goods",
  "Personal Care",
  "Pharmacy",
  "Pet",
  "Other",
];