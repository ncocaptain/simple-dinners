// =====================================================
// Builder: grocery category types
// =====================================================
export type GroceryCategory =
  | "Produce"
  | "Meat"
  | "Dairy"
  | "Pantry"
  | "Frozen"
  | "Spices"
  | "Bakery"
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
      "Onion",
      "Garlic",
      "tomato",
      "tomatoes",
      "lettuce",
      "spinach",
      "broccoli",
      "carrot",
      "carrots",
      "celery",
      "bell Pepper",
      "Peppers",
      "potato",
      "Potatoes",
      "lime",
      "lemon",
      "cilantro",
      "parsley",
      "avocado",
      "green Onion",
      "cucumber",
      "zucchini",
      "mushroom",
      "mushrooms",
      "corn",
    ],
  },
  {
    category: "Meat",
    keywords: [
      "Ground beef",
      "beef",
      "chicken",
      "pork",
      "sausage",
      "turkey",
      "bacon",
      "ham",
      "steak",
      "Shrimp",
    ],
  },
  {
    category: "Dairy",
    keywords: [
      "Milk",
      "Butter",
      "cheese",
      "mozzarella",
      "cheddar",
      "parmesan",
      "cream",
      "sour cream",
      "yogurt",
      "Egg",
      "Eggs",
    ],
  },
  {
    category: "Frozen",
    keywords: [
      "frozen",
      "hash browns",
      "frozen pizza",
      "ice cream",
    ],
  },
  {
    category: "Spices",
    keywords: [
      "Salt",
      "Pepper",
      "Paprika",
      "cumin",
      "oregano",
      "basil",
      "Garlic Powder",
      "Onion powder",
      "chili powder",
      "red Pepper flakes",
      "italian seasoning",
      "seasoning",
    ],
  },
  {
    category: "Bakery",
    keywords: [
      "Bread",
      "rolls",
      "bun",
      "buns",
      "tortilla",
      "tortillas",
      "bagel",
      "pita",
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
      "Brown Sugar",
      "beans",
      "black beans",
      "chili beans",
      "tomato sauce",
      "diced tomatoes",
      "broth",
      "stock",
      "oil",
      "Olive Oil",
      "vinegar",
      "soy sauce",
      "salsa",
      "peanut Butter",
      "jelly",
      "macaroni",
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
  "Meat",
  "Dairy",
  "Pantry",
  "Frozen",
  "Spices",
  "Bakery",
  "Other",
];