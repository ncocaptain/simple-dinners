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
    ],
  },
  {
    category: "Meat",
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
    ],
  },
  {
    category: "Dairy",
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
      "salt",
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