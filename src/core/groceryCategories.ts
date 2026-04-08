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
// =====================================================
const CATEGORY_KEYWORDS: Array<{
  category: GroceryCategory;
  keywords: string[];
}> = [
  {
    category: "Produce",
    keywords: [
      "onion",
      "garlic",
      "tomato",
      "tomatoes",
      "lettuce",
      "spinach",
      "broccoli",
      "carrot",
      "carrots",
      "celery",
      "bell pepper",
      "peppers",
      "potato",
      "potatoes",
      "lime",
      "lemon",
      "cilantro",
      "parsley",
      "avocado",
      "green onion",
      "cucumber",
      "zucchini",
      "mushroom",
      "mushrooms",
      "corn",
      "apple",
      "apples",
      "banana",
      "bananas",
      "grapes",
      "strawberries",
      "blueberries",
    ],
  },
  {
    category: "Meat / Seafood",
    keywords: [
      "ground beef",
      "beef",
      "chicken",
      "pork",
      "sausage",
      "turkey",
      "bacon",
      "ham",
      "steak",
      "shrimp",
      "fish",
      "salmon",
      "tilapia",
      "tuna",
      "crab",
      "lobster",
      "scallops",
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
      "frozen fruit",
      "waffles",
    ],
  },
  {
    category: "Spices / Seasonings",
    keywords: [
      "salt",
      "pepper",
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
    ],
  },
  {
    category: "Bakery",
    keywords: [
      "bread",
      "rolls",
      "bun",
      "buns",
      "tortilla",
      "tortillas",
      "bagel",
      "pita",
      "naan",
      "hamburger buns",
      "hot dog buns",
      "english muffin",
    ],
  },
  {
    category: "Pantry",
    keywords: [
      "rice",
      "pasta",
      "spaghetti",
      "flour",
      "sugar",
      "brown sugar",
      "beans",
      "black beans",
      "chili beans",
      "tomato sauce",
      "diced tomatoes",
      "broth",
      "stock",
      "oil",
      "olive oil",
      "vinegar",
      "soy sauce",
      "salsa",
      "peanut butter",
      "jelly",
      "macaroni",
      "ketchup",
      "mustard",
      "mayonnaise",
      "mayo",
      "breadcrumbs",
      "crackers",
      "cereal",
      "oats",
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
// =====================================================
export function categorizeGroceryItem(name: string): GroceryCategory {
  const normalized = normalize(name);

  if (normalized.includes("stock") || normalized.includes("broth")) {
    return "Pantry";
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