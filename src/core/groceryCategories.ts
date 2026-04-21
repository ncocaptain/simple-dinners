// =====================================================
// Builder: grocery category types
// =====================================================
export type GroceryCategory =
  | "Produce"
  | "Meat / Seafood"
  | "Dairy / Eggs"
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
      "scallops",
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
      "cornstarch",
      "sugar",
      "brown sugar",
      "honey",
      "beans",
      "black beans",
      "chili beans",
      "tomato sauce",
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
function normalize(text: string) {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

// =====================================================
// Builder: category matcher
// Uses a few direct rules first for items that are
// especially common or ambiguous, then falls back to
// the keyword map above.
// =====================================================
export function categorizeGroceryItem(name: string): GroceryCategory {
  const normalized = normalize(name);

  // ===== FORCE SPICES FIRST =====
if (
  normalized.includes("pepper flakes") ||
  normalized.includes("red pepper flakes") ||
  normalized.includes("cayenne") ||
  normalized.includes("cayenne pepper") ||
  normalized.includes("black pepper") ||
  normalized.includes("ground pepper") ||
  normalized.includes("paprika") ||
  normalized.includes("cumin") ||
  normalized.includes("oregano") ||
  normalized.includes("basil") ||
  normalized.includes("seasoning") ||
  normalized.includes("spice")
) {
  return "Spices / Seasonings";
}

// ===== GINGER RULE (important) =====
if (normalized.includes("ginger")) {
  if (normalized.includes("tsp") || normalized.includes("tbsp")) {
    return "Spices / Seasonings"; // ground ginger
  }
  return "Produce"; // fresh ginger
}

  // pantry shortcuts
  if (normalized.includes("stock") || normalized.includes("broth")) {
    return "Pantry";
  }

  // bakery shortcuts
  if (
    normalized.includes("pizza dough") ||
    normalized.includes("prepared pizza dough")
  ) {
    return "Bakery";
  }

  // frozen shortcuts
  if (
    normalized.includes("mixed vegetables") ||
    normalized.includes("frozen vegetables")
  ) {
    return "Frozen";
  }

  // produce shortcuts
  if (
    normalized.includes("asparagus") ||
    normalized.includes("sugar snap peas") ||
    normalized.includes("snap peas") ||
    normalized.includes("yellow squash") ||
    normalized.includes("spinach leaves") ||
    normalized.includes("broccoli florets")
  ) {
    return "Produce";
  }

  // spice shortcuts
  if (
    normalized.includes("garlic powder") ||
    normalized.includes("onion powder") ||
    normalized.includes("italian seasoning") ||
    normalized.includes("black pepper")
  ) {
    return "Spices / Seasonings";
  }

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