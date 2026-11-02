import type {
  GroceryCategory,
} from "./groceryCategories";

export type IngredientMergePolicy =
  | "count"
  | "same-unit"
  | "same-package"
  | "separate";

export type CanonicalIngredient = {
  id: string;
  canonicalName: string;
  category: GroceryCategory;
  grocerySearchName: string;
  aliases?: string[];
  defaultUnit?: string;
  defaultPackageSize?: string;
  mergePolicy: IngredientMergePolicy;
};

export const INGREDIENT_REGISTRY: CanonicalIngredient[] = [
  {
    id: "black-beans",
    canonicalName: "Black Beans",
    category: "Pantry",
    grocerySearchName: "black beans",
    aliases: ["black bean"],
    defaultUnit: "can",
    defaultPackageSize: "15 oz",
    mergePolicy: "same-package",
  },
  {
    id: "pinto-beans",
    canonicalName: "Pinto Beans",
    category: "Pantry",
    grocerySearchName: "pinto beans",
    aliases: ["pinto bean"],
    defaultUnit: "can",
    defaultPackageSize: "15 oz",
    mergePolicy: "same-package",
  },
  {
    id: "kidney-beans",
    canonicalName: "Kidney Beans",
    category: "Pantry",
    grocerySearchName: "kidney beans",
    aliases: ["kidney bean"],
    defaultUnit: "can",
    defaultPackageSize: "15 oz",
    mergePolicy: "same-package",
  },
  {
    id: "chickpeas",
    canonicalName: "Chickpeas",
    category: "Pantry",
    grocerySearchName: "chickpeas",
    aliases: [
      "chickpea",
      "garbanzo bean",
      "garbanzo beans",
    ],
    defaultUnit: "can",
    defaultPackageSize: "15 oz",
    mergePolicy: "same-package",
  },
  {
    id: "corn",
    canonicalName: "Corn",
    category: "Pantry",
    grocerySearchName: "canned corn",
    aliases: ["whole kernel corn"],
    defaultUnit: "can",
    defaultPackageSize: "15 oz",
    mergePolicy: "same-package",
  },
  {
    id: "fire-roasted-diced-tomatoes",
    canonicalName: "Fire Roasted Diced Tomatoes",
    category: "Pantry",
    grocerySearchName: "fire roasted diced tomatoes",
    aliases: [
      "fire roasted tomatoes",
      "diced fire roasted tomatoes",
      "fire-roasted diced tomatoes",
      "fire-roasted tomatoes",
    ],
    defaultUnit: "can",
    defaultPackageSize: "14.5 oz",
    mergePolicy: "same-package",
  },
  {
    id: "diced-tomatoes",
    canonicalName: "Diced Tomatoes",
    category: "Pantry",
    grocerySearchName: "diced tomatoes",
    aliases: ["diced tomato"],
    defaultUnit: "can",
    defaultPackageSize: "14.5 oz",
    mergePolicy: "same-package",
  },
  {
    id: "tomato-sauce",
    canonicalName: "Tomato Sauce",
    category: "Pantry",
    grocerySearchName: "tomato sauce",
    mergePolicy: "same-package",
  },
  {
    id: "tomato-paste",
    canonicalName: "Tomato Paste",
    category: "Pantry",
    grocerySearchName: "tomato paste",
    mergePolicy: "same-package",
  },
  {
    id: "marinara-sauce",
    canonicalName: "Marinara Sauce",
    category: "Pantry",
    grocerySearchName: "marinara sauce",
    aliases: ["marinara"],
    mergePolicy: "same-package",
  },
  {
    id: "chicken-broth",
    canonicalName: "Chicken Broth",
    category: "Pantry",
    grocerySearchName: "chicken broth",
    mergePolicy: "same-unit",
  },
  {
    id: "beef-broth",
    canonicalName: "Beef Broth",
    category: "Pantry",
    grocerySearchName: "beef broth",
    mergePolicy: "same-unit",
  },
  {
    id: "garlic",
    canonicalName: "Garlic",
    category: "Produce",
    grocerySearchName: "garlic",
    aliases: ["garlic clove", "garlic cloves"],
    defaultUnit: "clove",
    mergePolicy: "count",
  },
  {
    id: "cilantro",
    canonicalName: "Cilantro",
    category: "Produce",
    grocerySearchName: "cilantro",
    aliases: ["fresh cilantro"],
    defaultUnit: "bunch",
    mergePolicy: "count",
  },
  {
    id: "parsley",
    canonicalName: "Parsley",
    category: "Produce",
    grocerySearchName: "fresh parsley",
    aliases: ["fresh parsley"],
    defaultUnit: "bunch",
    mergePolicy: "count",
  },
  {
    id: "yellow-onion",
    canonicalName: "Yellow Onion",
    category: "Produce",
    grocerySearchName: "yellow onion",
    aliases: ["yellow onions"],
    mergePolicy: "count",
  },
  {
    id: "red-onion",
    canonicalName: "Red Onion",
    category: "Produce",
    grocerySearchName: "red onion",
    aliases: ["red onions"],
    mergePolicy: "count",
  },
  {
    id: "white-onion",
    canonicalName: "White Onion",
    category: "Produce",
    grocerySearchName: "white onion",
    aliases: ["white onions"],
    mergePolicy: "count",
  },
  {
    id: "green-onion",
    canonicalName: "Green Onion",
    category: "Produce",
    grocerySearchName: "green onions",
    aliases: [
      "green onions",
      "scallion",
      "scallions",
    ],
    mergePolicy: "count",
  },
  {
    id: "lemon",
    canonicalName: "Lemon",
    category: "Produce",
    grocerySearchName: "lemon",
    aliases: ["lemons"],
    mergePolicy: "count",
  },
  {
    id: "lime",
    canonicalName: "Lime",
    category: "Produce",
    grocerySearchName: "lime",
    aliases: ["limes"],
    mergePolicy: "count",
  },
  {
    id: "chicken-breast",
    canonicalName: "Chicken Breast",
    category: "Meat / Seafood",
    grocerySearchName: "chicken breast",
    aliases: [
      "chicken breasts",
      "boneless skinless chicken breast",
      "boneless skinless chicken breasts",
    ],
    mergePolicy: "same-unit",
  },
  {
    id: "chicken-thigh",
    canonicalName: "Chicken Thigh",
    category: "Meat / Seafood",
    grocerySearchName: "chicken thighs",
    aliases: [
      "chicken thighs",
      "boneless skinless chicken thigh",
      "boneless skinless chicken thighs",
    ],
    mergePolicy: "same-unit",
  },
  {
    id: "ground-beef",
    canonicalName: "Ground Beef",
    category: "Meat / Seafood",
    grocerySearchName: "ground beef",
    mergePolicy: "same-unit",
  },
  {
    id: "bacon",
    canonicalName: "Bacon",
    category: "Meat / Seafood",
    grocerySearchName: "bacon",
    mergePolicy: "same-unit",
  },
  {
    id: "egg",
    canonicalName: "Egg",
    category: "Dairy / Eggs",
    grocerySearchName: "eggs",
    aliases: ["eggs"],
    mergePolicy: "count",
  },
  {
    id: "milk",
    canonicalName: "Milk",
    category: "Dairy / Eggs",
    grocerySearchName: "milk",
    mergePolicy: "same-unit",
  },
  {
    id: "butter",
    canonicalName: "Butter",
    category: "Dairy / Eggs",
    grocerySearchName: "butter",
    mergePolicy: "same-unit",
  },
  {
    id: "sour-cream",
    canonicalName: "Sour Cream",
    category: "Dairy / Eggs",
    grocerySearchName: "sour cream",
    mergePolicy: "same-unit",
  },
  {
    id: "cream-cheese",
    canonicalName: "Cream Cheese",
    category: "Dairy / Eggs",
    grocerySearchName: "cream cheese",
    mergePolicy: "same-package",
  },
  {
    id: "shredded-cheddar-cheese",
    canonicalName: "Shredded Cheddar Cheese",
    category: "Dairy / Eggs",
    grocerySearchName: "shredded cheddar cheese",
    aliases: [
      "shredded cheddar",
      "cheddar cheese, shredded",
      "cheddar cheese shredded",
    ],
    mergePolicy: "same-package",
  },
  {
    id: "shredded-mozzarella-cheese",
    canonicalName: "Shredded Mozzarella Cheese",
    category: "Dairy / Eggs",
    grocerySearchName: "shredded mozzarella cheese",
    aliases: ["shredded mozzarella"],
    mergePolicy: "same-package",
  },
  {
    id: "parmesan-cheese",
    canonicalName: "Parmesan Cheese",
    category: "Dairy / Eggs",
    grocerySearchName: "parmesan cheese",
    aliases: ["parmesan"],
    mergePolicy: "separate",
  },
  {
    id: "rice",
    canonicalName: "Rice",
    category: "Pantry",
    grocerySearchName: "rice",
    mergePolicy: "same-unit",
  },
  {
    id: "pasta",
    canonicalName: "Pasta",
    category: "Pantry",
    grocerySearchName: "pasta",
    mergePolicy: "same-unit",
  },
  {
    id: "flour",
    canonicalName: "Flour",
    category: "Pantry",
    grocerySearchName: "all purpose flour",
    aliases: ["all purpose flour", "all-purpose flour"],
    mergePolicy: "same-unit",
  },
  {
    id: "sugar",
    canonicalName: "Sugar",
    category: "Pantry",
    grocerySearchName: "granulated sugar",
    aliases: ["granulated sugar", "white sugar"],
    mergePolicy: "same-unit",
  },
  {
    id: "brown-sugar",
    canonicalName: "Brown Sugar",
    category: "Pantry",
    grocerySearchName: "brown sugar",
    mergePolicy: "same-unit",
  },
  {
    id: "olive-oil",
    canonicalName: "Olive Oil",
    category: "Pantry",
    grocerySearchName: "olive oil",
    aliases: ["extra virgin olive oil"],
    mergePolicy: "same-unit",
  },
  {
    id: "black-pepper",
    canonicalName: "Black Pepper",
    category: "Spices / Seasonings",
    grocerySearchName: "black pepper",
    aliases: [
      "pepper",
      "ground pepper",
      "ground black pepper",
      "freshly ground black pepper",
    ],
    mergePolicy: "same-unit",
  },
  {
    id: "salt",
    canonicalName: "Salt",
    category: "Spices / Seasonings",
    grocerySearchName: "salt",
    mergePolicy: "same-unit",
  },
  {
    id: "tortilla",
    canonicalName: "Tortilla",
    category: "Bakery",
    grocerySearchName: "tortillas",
    aliases: ["tortillas"],
    mergePolicy: "count",
  },
  {
    id: "hamburger-bun",
    canonicalName: "Hamburger Bun",
    category: "Bakery",
    grocerySearchName: "hamburger buns",
    aliases: ["hamburger buns"],
    mergePolicy: "count",
  },
  {
    id: "garlic-powder",
    canonicalName: "Garlic Powder",
    category: "Spices / Seasonings",
    grocerySearchName: "garlic powder",
    mergePolicy: "same-unit",
  },
  {
    id: "paprika",
    canonicalName: "Paprika",
    category: "Spices / Seasonings",
    grocerySearchName: "paprika",
    mergePolicy: "same-unit",
  },
  {
    id: "worcestershire-sauce",
    canonicalName: "Worcestershire Sauce",
    category: "Pantry",
    grocerySearchName: "worcestershire sauce",
    mergePolicy: "same-unit",
  },
  {
    id: "cumin",
    canonicalName: "Cumin",
    category: "Spices / Seasonings",
    grocerySearchName: "ground cumin",
    aliases: ["ground cumin"],
    mergePolicy: "same-unit",
  },
  {
    id: "onion-powder",
    canonicalName: "Onion Powder",
    category: "Spices / Seasonings",
    grocerySearchName: "onion powder",
    mergePolicy: "same-unit",
  },
  {
    id: "dried-thyme",
    canonicalName: "Dried Thyme",
    category: "Spices / Seasonings",
    grocerySearchName: "dried thyme",
    mergePolicy: "same-unit",
  },
  {
    id: "carrot",
    canonicalName: "Carrot",
    category: "Produce",
    grocerySearchName: "carrots",
    aliases: ["carrots"],
    mergePolicy: "count",
  },
  {
    id: "tomato",
    canonicalName: "Tomato",
    category: "Produce",
    grocerySearchName: "tomatoes",
    aliases: ["tomatoes"],
    mergePolicy: "count",
  },
  {
    id: "chili-powder",
    canonicalName: "Chili Powder",
    category: "Spices / Seasonings",
    grocerySearchName: "chili powder",
    mergePolicy: "same-unit",
  },
  {
    id: "ketchup",
    canonicalName: "Ketchup",
    category: "Pantry",
    grocerySearchName: "ketchup",
    mergePolicy: "same-unit",
  },
  {
    id: "soy-sauce",
    canonicalName: "Soy Sauce",
    category: "Pantry",
    grocerySearchName: "soy sauce",
    mergePolicy: "same-unit",
  },
  {
    id: "onion",
    canonicalName: "Onion",
    category: "Produce",
    grocerySearchName: "onion",
    aliases: ["onions"],
    mergePolicy: "count",
  },
  {
    id: "cherry-tomatoes",
    canonicalName: "Cherry Tomatoes",
    category: "Produce",
    grocerySearchName: "cherry tomatoes",
    aliases: ["cherry tomato"],
    mergePolicy: "same-package",
  },
  {
    id: "vanilla-extract",
    canonicalName: "Vanilla Extract",
    category: "Pantry",
    grocerySearchName: "vanilla extract",
    mergePolicy: "same-unit",
  },
  {
    id: "grated-parmesan-cheese",
    canonicalName: "Grated Parmesan Cheese",
    category: "Dairy / Eggs",
    grocerySearchName: "grated parmesan cheese",
    aliases: [
      "parmesan cheese, grated",
      "parmesan cheese grated",
    ],
    mergePolicy: "same-package",
  },
  {
    id: "white-rice",
    canonicalName: "White Rice",
    category: "Pantry",
    grocerySearchName: "white rice",
    mergePolicy: "same-unit",
  },
  {
    id: "bbq-sauce",
    canonicalName: "BBQ Sauce",
    category: "Pantry",
    grocerySearchName: "bbq sauce",
    aliases: ["barbecue sauce"],
    mergePolicy: "same-unit",
  },
  {
    id: "cornstarch",
    canonicalName: "Cornstarch",
    category: "Pantry",
    grocerySearchName: "cornstarch",
    aliases: ["corn starch"],
    mergePolicy: "same-unit",
  },
  {
    id: "sesame-oil",
    canonicalName: "Sesame Oil",
    category: "Pantry",
    grocerySearchName: "sesame oil",
    mergePolicy: "same-unit",
  },
];

function normalizeRegistryKey(
  value: string
) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const REGISTRY_INDEX =
  new Map<
    string,
    CanonicalIngredient
  >();

for (const ingredient of INGREDIENT_REGISTRY) {
  const keys = [
    ingredient.id,
    ingredient.canonicalName,
    ingredient.grocerySearchName,
    ...(ingredient.aliases || []),
  ];

  for (const key of keys) {
    const normalized =
      normalizeRegistryKey(key);

    if (
      normalized &&
      !REGISTRY_INDEX.has(
        normalized
      )
    ) {
      REGISTRY_INDEX.set(
        normalized,
        ingredient
      );
    }
  }
}

export function findCanonicalIngredient(
  value: string
) {
  const key =
    normalizeRegistryKey(
      value
    );

  if (!key) return null;

  return (
    REGISTRY_INDEX.get(
      key
    ) || null
  );
}

export function hasCanonicalIngredient(
  value: string
) {
  return Boolean(
    findCanonicalIngredient(
      value
    )
  );
}
