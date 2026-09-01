import type { GroceryCategory } from "../core/groceryCategories";

export type SmartShoppingThumbnailMatchType =
  | "exact"
  | "broad"
  | "category";

export type SmartShoppingThumbnailMatch = {
  thumbnailKey: string;
  matchType: SmartShoppingThumbnailMatchType;
  altText: string;
};

const EXACT_THUMBNAIL_KEYS: Record<string, string> = {
  // Produce
  onion: "onion",
  "yellow onion": "yellow-onion",
  "white onion": "white-onion",
  "red onion": "red-onion",
  "green onion": "green-onion",

  potato: "potato",
  "red potato": "red-potato",
  "red potatoes": "red-potato",
  "sweet potato": "sweet-potato",

  garlic: "garlic",

  "bell pepper": "bell-pepper",
  "green bell pepper": "green-bell-pepper",
  "red bell pepper": "red-bell-pepper",
  "yellow bell pepper": "yellow-bell-pepper",
  "orange bell pepper": "orange-bell-pepper",

  tomato: "tomato",
  avocado: "avocado",
  carrot: "carrot",
  cucumber: "cucumber",
  jalapeno: "jalapeno",
  lemon: "lemon",
  lime: "lime",
  apple: "apple",
  banana: "banana",
  orange: "orange",

  // Dairy and eggs
  egg: "eggs",
  eggs: "eggs",
  butter: "butter",
  milk: "milk",
  "whole milk": "milk",
  "almond milk": "almond-milk",
  "cheddar cheese": "cheddar-cheese",
  cheese: "cheese",
  "ice cream": "ice-cream",

  // Meat and seafood
  "ground beef": "ground-beef",
  "chicken breast": "chicken-breast",
  "chicken thigh": "chicken-thigh",
  "pork chop": "pork-chop",
  shrimp: "shrimp",
  salmon: "salmon",
  tilapia: "white-fish",
  "tilapia fillet": "white-fish",
  "tilapia fillets": "white-fish",
  cod: "white-fish",
  "cod fillet": "white-fish",
  haddock: "white-fish",
  pollock: "white-fish",
  sausage: "sausage",
  "smoked sausage": "sausage",
  "jalapeno smoked sausage": "sausage",
  "jalapeno smoked sausages": "sausage",

  // Pantry
  pasta: "pasta",
  spaghetti: "pasta",
  rice: "rice",
  flour: "flour",
  sugar: "sugar",
  "black beans": "black-beans",
  "canned black beans": "canned-black-beans",
  "dried black beans": "dried-black-beans",
  corn: "corn",
  "canned corn": "canned-corn",
  "olive oil": "olive-oil",

  // Bakery
  bread: "bread",
  "hamburger bun": "hamburger-buns",
  "hot dog bun": "hot-dog-buns",
  tortilla: "tortillas",
  bagel: "bagels",

  // Beverages
  water: "water",
  soda: "soda",
  "energy drink": "energy-drink",
  "energy drinks": "energy-drink",

  // Additional produce aliases
  onions: "onion",
  "yellow onions": "yellow-onion",
  "white onions": "white-onion",
  "red onions": "red-onion",
  "green onions": "green-onion",
  scallion: "green-onion",
  scallions: "green-onion",

  potatoes: "potato",
  "sweet potatoes": "sweet-potato",

  "garlic clove": "garlic",
  "garlic cloves": "garlic",

  "bell peppers": "bell-pepper",
  "green bell peppers": "green-bell-pepper",
  "green pepper": "green-bell-pepper",
  "green peppers": "green-bell-pepper",
  "red bell peppers": "red-bell-pepper",
  "yellow bell peppers": "yellow-bell-pepper",
  "orange bell peppers": "orange-bell-pepper",

  tomatoes: "tomato",
  "fresh tomato": "tomato",
  "fresh tomatoes": "tomato",

  avocados: "avocado",
  carrots: "carrot",
  "shredded carrot": "carrot",
  "shredded carrots": "carrot",
  cucumbers: "cucumber",
  jalapenos: "jalapeno",
  lemons: "lemon",
  limes: "lime",
  apples: "apple",
  bananas: "banana",
  oranges: "orange",

  // Additional dairy and fridge items
  mozzarella: "mozzarella-cheese",
  "mozzarella cheese": "mozzarella-cheese",
  "shredded mozzarella": "mozzarella-cheese",
  "fresh mozzarella": "mozzarella-cheese",

  yogurt: "yogurt",
  "plain yogurt": "yogurt",
  "greek yogurt": "yogurt",

  parmesan: "parmesan-cheese",
  "parmesan cheese": "parmesan-cheese",
  "grated parmesan": "parmesan-cheese",

  "cream cheese": "cream-cheese",
  "softened cream cheese": "cream-cheese",

  "heavy cream": "heavy-cream",
  "heavy whipping cream": "heavy-cream",
  "whipping cream": "heavy-cream",

  "shredded cheddar": "cheddar-cheese",
  "sharp cheddar": "cheddar-cheese",
  "sliced cheese": "cheese",

  "sour cream": "sour-cream",
  sourcream: "sour-cream",

  "vanilla ice cream": "ice-cream",

  // Additional meat and seafood aliases
  "chicken thighs": "chicken-thigh",
  "boneless chicken thigh": "chicken-thigh",
  "boneless chicken thighs": "chicken-thigh",

  "pork chops": "pork-chop",
  "bone in pork chop": "pork-chop",
  "bone in pork chops": "pork-chop",

  "salmon fillet": "salmon",
  "salmon fillets": "salmon",

  "white fish": "white-fish",
  "white fish fillet": "white-fish",
  "fish fillet": "white-fish",

  steak: "steak",
  steaks: "steak",
  "sirloin steak": "steak",
  "beef steak": "steak",

  bacon: "bacon",
  "bacon strips": "bacon",
  "sliced bacon": "bacon",

  "ground turkey": "ground-turkey",
  "lean ground turkey": "ground-turkey",

  ham: "ham",
  "sliced ham": "ham",
  "diced ham": "ham",

  sausages: "sausage",
  "smoked sausages": "sausage",

  "raw shrimp": "raw-shrimp",
  "peeled raw shrimp": "raw-shrimp",

  "whole chicken": "whole-chicken",
  "roasting chicken": "whole-chicken",

  // Additional pantry items and aliases
  "peanut butter": "peanut-butter",
  "creamy peanut butter": "peanut-butter",

  "strawberry jam": "strawberry-jam",
  "strawberry preserves": "strawberry-jam",

  "vegetable oil": "vegetable-oil",
  "cooking oil": "vegetable-oil",

  "diced tomatoes": "diced-tomatoes",
  "canned diced tomatoes": "diced-tomatoes",
  "fire roasted diced tomatoes": "diced-tomatoes",

  "all purpose flour": "flour",
  "all-purpose flour": "flour",

  "white sugar": "sugar",
  "granulated sugar": "sugar",

  "sandwich bread": "bread",
  "white bread": "bread",
  "wheat bread": "bread",

  // Produce add-ons
  asparagus: "asparagus",
  "asparagus spears": "asparagus",

  cilantro: "cilantro",
  "fresh cilantro": "cilantro",
  "flank steak": "steak",
  "flank steaks": "steak",
  "ancho chili powder": "chili-powder",
  "flour tortilla": "tortillas",
  "flour tortillas": "tortillas",
  "guacamole": "avocado",
  "jasmine rice": "rice",
  "nonfat greek yogurt": "yogurt",
  "manicotti shell": "pasta",
  "manicotti shells": "pasta",
  "chopped cilantro": "cilantro",

  ginger: "ginger",
  "fresh ginger": "ginger",
  "ginger root": "ginger",

  mint: "mint",
  "fresh mint": "mint",
  "mint leaves": "mint",

  spinach: "spinach",
  "baby spinach": "spinach",
  "spinach leaves": "spinach",

  broccoli: "broccoli",
  "broccoli florets": "broccoli",
  "fresh broccoli": "broccoli",
  "chopped broccoli": "broccoli",

  // Spices
  "garlic powder": "garlic-powder",
  "onion powder": "onion-powder",
  "chili powder": "chili-powder",

  "black pepper": "black-pepper",
  "ground black pepper": "black-pepper",
  "ground pepper": "black-pepper",

  cumin: "ground-cumin",
  "ground cumin": "ground-cumin",

  cinnamon: "cinnamon",
  "ground cinnamon": "cinnamon",

  "crushed red pepper": "crushed-red-pepper",
  "red pepper flakes": "crushed-red-pepper",
  "crushed red pepper flakes": "crushed-red-pepper",

  "italian seasoning": "italian-seasoning",

  oregano: "oregano",
  "dried oregano": "oregano",

  "bay leaf": "bay-leaves",
  "bay leaves": "bay-leaves",

  "dried basil": "basil",

  // Bakery plural aliases
  "hamburger buns": "hamburger-buns",
  "hot dog buns": "hot-dog-buns",
  tortillas: "tortillas",
  bagels: "bagels",

  "white rice": "rice",
  oats: "oats",
  "rolled oats": "oats",
  "egg noodles": "egg-noodles",
  penne: "penne",
  "mashed potatoes": "mashed-potatoes",
  "baked potato": "baked-potato",

  // Shopping thumbnail expansion batch 1
  "breadcrumbs": "breadcrumbs",
  "bread crumbs": "breadcrumbs",
  "worcestershire sauce": "worcestershire-sauce",
  "bbq sauce": "bbq-sauce",
  "barbecue sauce": "bbq-sauce",
  "salt": "salt",
  "kosher salt": "salt",
  "sea salt": "salt",
  "orange juice": "orange-juice",
  "paprika": "paprika",
  "smoked paprika": "paprika",
  "fresno pepper": "fresno-pepper",
  "fresno peppers": "fresno-pepper",
  "salsa": "salsa",
  "turmeric": "turmeric",
  "ground turmeric": "turmeric",
  "chicken broth": "chicken-broth",
  "chicken stock": "chicken-broth",
  "parsley": "parsley",
  "fresh parsley": "parsley",
  "chopped parsley": "parsley",
  "romaine lettuce": "romaine-lettuce",
  "romaine": "romaine-lettuce",

  // Shopping thumbnail expansion batch 2
  "chipotle hot sauce": "chipotle-hot-sauce",
  "sea scallop": "sea-scallops",
  "sea scallops": "sea-scallops",
  "scallop": "sea-scallops",
  "scallops": "sea-scallops",
  "lobster tail": "lobster-tail",
  "lobster tails": "lobster-tail",
  "seafood broth": "seafood-broth",
  "seafood stock": "seafood-broth",
  "dried thyme": "dried-thyme",
  "buffalo sauce": "buffalo-sauce",
  "buffalo wing sauce": "buffalo-sauce",

  // Common built-in recipe thumbnail aliases
  "unsalted butter": "butter",
  "fresh spinach": "spinach",
  "fresh basil": "basil",
  "fresh basil leaves": "basil",
  "corn tortilla": "tortillas",
  "corn tortillas": "tortillas",
  "ripe avocado": "avocado",
  "old-fashioned oats": "oats",
  "old fashioned oats": "oats",
  "panko breadcrumbs": "breadcrumbs",
  "panko bread crumbs": "breadcrumbs",
  "sourdough bread": "bread",
  "corn on the cob": "corn",
  "shredded chicken": "chicken-breast",
  "cooked shredded chicken": "chicken-breast",
  "chicken": "chicken-breast",

  // Built-in cookbook thumbnail expansion
  "brown sugar": "brown-sugar",
  "light brown sugar": "brown-sugar",
  "dark brown sugar": "brown-sugar",
  "vanilla extract": "vanilla-extract",
  "pure vanilla extract": "vanilla-extract",
  "soy sauce": "soy-sauce",
  "low sodium soy sauce": "soy-sauce",
  "low-sodium soy sauce": "soy-sauce",
  "beef broth": "beef-broth",
  "beef stock": "beef-broth",
  "ketchup": "ketchup",
  "tomato ketchup": "ketchup",
  "cornstarch": "cornstarch",
  "corn starch": "cornstarch",
  "vegetable broth": "vegetable-broth",
  "vegetable stock": "vegetable-broth",
  "cayenne pepper": "cayenne-pepper",
  "dijon mustard": "dijon-mustard",
  "honey": "honey",
  "sesame oil": "sesame-oil",
  "toasted sesame oil": "sesame-oil",
  "apple cider vinegar": "apple-cider-vinegar",
  "sesame seed": "sesame-seeds",
  "sesame seeds": "sesame-seeds",
  "yellow mustard": "yellow-mustard",
  "mushroom": "mushrooms",
  "mushrooms": "mushrooms",
  "baby bella mushroom": "mushrooms",
  "baby bella mushrooms": "mushrooms",
  "celery": "celery",
  "celery stalk": "celery",
  "celery stalks": "celery",
  "mayonnaise": "mayonnaise",
  "mayo": "mayonnaise",
  "zucchini": "zucchini",
  "zucchinis": "zucchini",
  "baking powder": "baking-powder",
  "cream of chicken soup": "cream-of-chicken-soup",

  // Additional built-in recipe thumbnail aliases
  "dried parsley": "parsley",
  "lettuce": "romaine-lettuce",
  "mustard": "yellow-mustard",
  "thyme": "dried-thyme",
  "avocado slices": "avocado",
  "baby carrot": "carrot",
  "baby carrots": "carrot",
  "burger bun": "hamburger-buns",
  "burger buns": "hamburger-buns",
  "cold butter": "butter",
  "extra bbq sauce": "bbq-sauce",
  "extra barbecue sauce": "bbq-sauce",
  "corn kernels": "corn",
  "brown rice": "rice",
  "hot dogs bun": "hot-dog-buns",

  // Built-in cookbook thumbnail expansion batch
  "crouton": "croutons",
  "croutons": "croutons",
  "dried rosemary": "dried-rosemary",
  "rosemary": "dried-rosemary",
  "marinara": "marinara-sauce",
  "marinara sauce": "marinara-sauce",
  "tortilla chip": "tortilla-chips",
  "tortilla chips": "tortilla-chips",
  "baking soda": "baking-soda",
  "rice vinegar": "rice-vinegar",
  "seasoned rice vinegar": "rice-vinegar",
  "blueberry": "blueberries",
  "blueberries": "blueberries",
  "fresh blueberries": "blueberries",
  "chickpea": "chickpeas",
  "chickpeas": "chickpeas",
  "garbanzo bean": "chickpeas",
  "garbanzo beans": "chickpeas",
  "chocolate chip": "chocolate-chips",
  "chocolate chips": "chocolate-chips",
  "mini chocolate chips": "chocolate-chips",
  "frozen mixed vegetables": "frozen-mixed-vegetables",
  "mixed vegetables": "frozen-mixed-vegetables",

  // Additional cookbook cleanup aliases
  "bacon bits": "bacon",
  "frozen peas and carrot": "frozen-mixed-vegetables",
  "frozen peas and carrots": "frozen-mixed-vegetables",

  // Built-in cookbook thumbnail expansion batch
  "hot dog": "hot-dogs",
  "hot dogs": "hot-dogs",
  "hot sauce": "hot-sauce",
  "powdered sugar": "powdered-sugar",
  "confectioners sugar": "powdered-sugar",
  "confectioner's sugar": "powdered-sugar",
  "red wine vinegar": "red-wine-vinegar",
  "strawberry": "strawberries",
  "strawberries": "strawberries",
  "fresh strawberries": "strawberries",
  "whipped cream": "whipped-cream",
  "whipped topping": "whipped-cream",
  "fresh dill": "fresh-dill",
  "dill": "fresh-dill",
  "kalamata olive": "kalamata-olives",
  "kalamata olives": "kalamata-olives",
  "kidney bean": "kidney-beans",
  "kidney beans": "kidney-beans",
  "nutmeg": "nutmeg",
  "ground nutmeg": "nutmeg",
};

const BROAD_THUMBNAIL_RULES: Array<{
  matches: (name: string) => boolean;
  thumbnailKey: string;
}> = [
    {
      matches: (name) =>
        name.includes("onion") &&
        !name.includes("onion powder") &&
        !name.includes("fried onion"),
      thumbnailKey: "onion",
    },
    {
      matches: (name) =>
        name.includes("potato"),
      thumbnailKey: "potato",
    },
    {
      matches: (name) =>
        name.includes("bell pepper"),
      thumbnailKey: "bell-pepper",
    },
    {
      matches: (name) =>
        name.includes("tomato"),
      thumbnailKey: "tomato",
    },
    {
      matches: (name) =>
        name.includes("cheddar"),
      thumbnailKey: "cheddar-cheese",
    },
    {
      matches: (name) =>
        name.includes("cheese"),
      thumbnailKey: "cheese",
    },
    {
      matches: (name) =>
        name.includes("ground beef"),
      thumbnailKey: "ground-beef",
    },
    {
      matches: (name) =>
        name.includes("chicken breast"),
      thumbnailKey: "chicken-breast",
    },
    {
      matches: (name) =>
        name.includes("chicken thigh"),
      thumbnailKey: "chicken-thigh",
    },
    {
      matches: (name) =>
        name.includes("shrimp"),
      thumbnailKey: "shrimp",
    },
    {
      matches: (name) =>
        name.includes("salmon"),
      thumbnailKey: "salmon",
    },
    {
      matches: (name) =>
        name.includes("sausage"),
      thumbnailKey: "sausage",
    },
    {
      matches: (name) =>
        name.includes("black bean"),
      thumbnailKey: "black-beans",
    },
    {
      matches: (name) =>
        name.includes("pasta") ||
        name.includes("spaghetti") ||
        name.includes("macaroni") ||
        name.includes("noodle"),
      thumbnailKey: "pasta",
    },
    {
      matches: (name) =>
        name.includes("milk") &&
        !name.includes("almond"),
      thumbnailKey: "milk",
    },
  ];

function normalizeThumbnailName(
  value: unknown,
): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCategoryThumbnailKey(
  category: GroceryCategory,
): string {
  const normalizedCategory =
    normalizeThumbnailName(category);

  if (normalizedCategory.includes("produce")) {
    return "category-produce";
  }

  if (
    normalizedCategory.includes("dairy") ||
    normalizedCategory.includes("egg")
  ) {
    return "category-dairy-eggs";
  }

  if (
    normalizedCategory.includes("meat") ||
    normalizedCategory.includes("seafood")
  ) {
    return "category-meat-seafood";
  }

  if (normalizedCategory.includes("bakery")) {
    return "category-bakery";
  }

  if (normalizedCategory.includes("frozen")) {
    return "category-frozen";
  }

  if (normalizedCategory.includes("spice")) {
    return "category-spices";
  }

  if (normalizedCategory.includes("beverage")) {
    return "category-beverages";
  }

  if (normalizedCategory.includes("household")) {
    return "category-household";
  }

  if (normalizedCategory.includes("pantry")) {
    return "category-pantry";
  }

  return "category-other";
}

// =====================================================
// Curated local thumbnail registry
//
// Only keys listed here trigger a local image request.
// This prevents unnecessary 404 requests for products
// that do not have an image yet.
//
// Add each key here when its matching WebP is placed in:
// public/shopping-thumbnails/
// =====================================================

const AVAILABLE_LOCAL_THUMBNAIL_KEYS =
  new Set<string>([
    "yellow-onion",
    "red-potato",
    "green-bell-pepper",
    "red-bell-pepper",
    "garlic",
    "yellow-bell-pepper",
    "orange-bell-pepper",
    "onion",
    "white-onion",
    "red-onion",
    "potato",
    "sweet-potato",
    "bell-pepper",
    "tomato",
    "avocado",
    "carrot",
    "cucumber",
    "jalapeno",
    "lemon",
    "lime",
    "apple",
    "banana",
    "mint",
    "green-onion",
    "asparagus",
    "cilantro",
    "ginger",
    "spinach",
    "broccoli",

    "milk",
    "eggs",
    "butter",
    "almond-milk",
    "mozzarella-cheese",
    "yogurt",
    "ice-cream",
    "parmesan-cheese",
    "cream-cheese",
    "heavy-cream",
    "cheddar-cheese",
    "cheese",
    "sour-cream",

    "ground-beef",
    "chicken-breast",
    "shrimp",
    "sausage",
    "chicken-thigh",
    "pork-chop",
    "salmon",
    "white-fish",
    "steak",
    "bacon",
    "ground-turkey",
    "ham",
    "raw-shrimp",
    "whole-chicken",



    "corn",
    "canned-corn",
    "olive-oil",
    "peanut-butter",
    "strawberry-jam",
    "bread",
    "flour",
    "vegetable-oil",
    "sugar",
    "diced-tomatoes",

    "garlic-powder",
    "onion-powder",
    "chili-powder",
    "black-pepper",
    "ground-cumin",
    "cinnamon",
    "crushed-red-pepper",
    "italian-seasoning",
    "oregano",
    "bay-leaves",
    "basil",

    "rice",
    "oats",
    "spaghetti",
    "pasta",
    "egg-noodles",
    "penne",
    "mashed-potatoes",
    "baked-potato",

    "bagels",
    "black-beans",
    "canned-black-beans",
    "dried-black-beans",
    "hamburger-buns",
    "hot-dog-buns",
    "orange",
    "tortillas",
    "water",
    "soda",
    "energy-drink",

    // Shopping thumbnail expansion batch 2
    "chipotle-hot-sauce",
    "sea-scallops",
    "lobster-tail",
    "seafood-broth",
    "dried-thyme",
    "buffalo-sauce",

    // Shopping thumbnail expansion batch 1
    "breadcrumbs",
    "worcestershire-sauce",
    "bbq-sauce",
    "salt",
    "orange-juice",
    "paprika",
    "fresno-pepper",
    "salsa",
    "turmeric",
    "chicken-broth",
    "parsley",
    "romaine-lettuce",

    // Built-in cookbook thumbnail expansion
    "brown-sugar",
    "vanilla-extract",
    "soy-sauce",
    "beef-broth",
    "ketchup",
    "cornstarch",
    "vegetable-broth",
    "cayenne-pepper",
    "dijon-mustard",
    "honey",
    "sesame-oil",
    "apple-cider-vinegar",
    "sesame-seeds",
    "yellow-mustard",
    "mushrooms",
    "celery",
    "mayonnaise",
    "zucchini",
    "baking-powder",
    "cream-of-chicken-soup",

    // Built-in cookbook thumbnail expansion batch
    "croutons",
    "dried-rosemary",
    "marinara-sauce",
    "tortilla-chips",
    "baking-soda",
    "rice-vinegar",
    "blueberries",
    "chickpeas",
    "chocolate-chips",
    "frozen-mixed-vegetables",

    // Built-in cookbook thumbnail expansion batch
    "hot-dogs",
    "hot-sauce",
    "powdered-sugar",
    "red-wine-vinegar",
    "strawberries",
    "whipped-cream",
    "fresh-dill",
    "kalamata-olives",
    "kidney-beans",
    "nutmeg",]);

export function hasLocalSmartShoppingThumbnail(
  thumbnailKey: string,
): boolean {
  return AVAILABLE_LOCAL_THUMBNAIL_KEYS.has(
    thumbnailKey,
  );
}

export function getLocalSmartShoppingThumbnailSrc(
  thumbnailKey: string,
): string {
  return `/shopping-thumbnails/${thumbnailKey}.webp`;
}

export function resolveSmartShoppingThumbnail(
  productName: unknown,
  category: GroceryCategory,
): SmartShoppingThumbnailMatch {
  const normalizedName =
    normalizeThumbnailName(productName);

  const exactThumbnailKey =
    EXACT_THUMBNAIL_KEYS[normalizedName];

  if (exactThumbnailKey) {
    return {
      thumbnailKey: exactThumbnailKey,
      matchType: "exact",
      altText: normalizedName || "Grocery item",
    };
  }

  const broadMatch =
    BROAD_THUMBNAIL_RULES.find((rule) =>
      rule.matches(normalizedName),
    );

  if (broadMatch) {
    return {
      thumbnailKey: broadMatch.thumbnailKey,
      matchType: "broad",
      altText: normalizedName || "Grocery item",
    };
  }

  const categoryThumbnailKey =
    getCategoryThumbnailKey(category);

  return {
    thumbnailKey: categoryThumbnailKey,
    matchType: "category",
    altText: normalizedName || String(category),
  };
}