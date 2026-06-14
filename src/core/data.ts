import type { Meal } from "./types";


export const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const ALLERGENS = [
  { key: "peanuts", label: "Peanuts", keywords: ["peanut", "peanuts"] },
  {
    key: "tree_nuts",
    label: "Tree Nuts",
    keywords: [
      "almond",
      "walnut",
      "pecan",
      "cashew",
      "pistachio",
      "hazelnut",
      "tree nut",
      "nuts",
    ],
  },
  {
    key: "dairy",
    label: "Dairy",
    keywords: [
      "milk",
      "cheese",
      "butter",
      "cream",
      "yogurt",
      "parmesan",
      "mozzarella",
      "feta",
      "ricotta",
      "cheddar",
      "swiss",
      "sour cream",
    ],
  },
  { key: "eggs", label: "Eggs", keywords: ["egg", "eggs", "mayonnaise", "mayo"] },
  {
    key: "soy",
    label: "Soy",
    keywords: ["soy", "soy sauce", "tofu", "tempeh", "edamame", "teriyaki"],
  },
  {
    key: "gluten",
    label: "Wheat / Gluten",
    keywords: [
      "wheat",
      "gluten",
      "bread",
      "pasta",
      "tortilla",
      "buns",
      "flour",
      "breadcrumbs",
      "cracker crumbs",
      "panko",
      "naan",
      "pie crust",
      "pizza dough",
      "manicotti",
      "egg noodles",
    ],
  },
  {
    key: "shellfish",
    label: "Shellfish",
    keywords: [
      "shrimp",
      "crab",
      "lobster",
      "scallop",
      "scallops",
      "shellfish",
      "clam",
      "clams",
      "mussels",
      "oysters",
    ],
  },
  { key: "fish", label: "Fish", keywords: ["fish", "salmon", "tuna", "tilapia", "cod"] },
  { key: "sesame", label: "Sesame", keywords: ["sesame", "tahini", "sesame oil", "sesame seeds"] },
];

export const MEAT_WORDS = [
  "beef",
  "ground beef",
  "chicken",
  "pork",
  "bacon",
  "sausage",
  "pepperoni",
  "meatball",
  "ham",
  "turkey",
  "salmon",
  "fish",
  "shrimp",
  "tilapia",
  "crab",
  "scallops",
];

const DESSERT_NAME = {
  blueberryCheesecakeCrescentRolls: {
    en: "Blueberry Cheesecake Crescent Rolls",
    es: "Crecientes de cheesecake con arándanos",
  },
  campfireBananaBoats: {
    en: "Campfire Banana Boats",
    es: "Bananas de Fogata",
  },
  darkChocolateDippedStrawberries: {
    en: "Dark Chocolate Dipped Strawberries",
    es: "Fresas cubiertas con chocolate oscuro",
  },
  chocolatePeanutButterNoBakeBars: {
    en: "Chocolate Peanut Butter No-Bake Bars",
    es: "Barras sin hornear de chocolate y crema de cacahuate",
  },
  chocolateChipCookies: {
    en: "Chocolate Chip Cookies",
    es: "Galletas con Chispas de Chocolate",
  },
  classicBrownies: {
    en: "Classic Brownies",
    es: "Brownies Clásicos",
  },
  appleCrisp: {
    en: "Apple Crisp",
    es: "Crumble de Manzana",
  },
  bananaPudding: {
    en: "Banana Pudding",
    es: "Pudín de Plátano",
  },
  riceKrispieTreats: {
    en: "Rice Krispie Treats",
    es: "Cuadritos de Arroz Inflado",
  },
  strawberryShortcake: {
    en: "Strawberry Shortcake",
    es: "Pastelito de Fresas",
  },
  peachCobbler: {
    en: "Peach Cobbler",
    es: "Cobbler de Durazno",
  },
  lemonBars: {
    en: "Lemon Bars",
    es: "Barritas de Limón",
  },
  noBakeCheesecakeCups: {
    en: "No-Bake Cheesecake Cups",
    es: "Vasitos de Cheesecake Sin Horno",
  },
  chocolateMugCake: {
    en: "Chocolate Mug Cake",
    es: "Pastel de Chocolate en Taza",
  },
  iceCreamSundaes: {
    en: "Ice Cream Sundaes",
    es: "Helados Sundae",
  },
  smores: {
    en: "S'mores",
    es: "S'mores",
  },
  oreoDirtCups: {
    en: "Oreo Dirt Cups",
    es: "Vasitos de Tierra con Oreo",
  },
  snickerdoodles: {
    en: "Snickerdoodles",
    es: "Galletas Snickerdoodle",
  },
  peanutButterCookies: {
    en: "Peanut Butter Cookies",
    es: "Galletas de Mantequilla de Cacahuate",
  },
  oatmealRaisinCookies: {
    en: "Oatmeal Raisin Cookies",
    es: "Galletas de Avena con Pasas",
  },
  blueberryCrisp: {
    en: "Blueberry Crisp",
    es: "Crumble de Arándanos",
  },
  cherryDumpCake: {
    en: "Cherry Dump Cake",
    es: "Pastel Fácil de Cereza",
  },
  sopapillaBars: {
    en: "Sopapilla Bars",
    es: "Barritas de Sopapilla",
  },
  chocolatePudding: {
    en: "Chocolate Pudding",
    es: "Pudín de Chocolate",
  },
  miniCheesecakes: {
    en: "Mini Cheesecakes",
    es: "Mini Cheesecakes",
  },
  puppyChowMuddyBuddies: {
    en: "Puppy Chow (Muddy Buddies)",
    es: "Muddy Buddies (Puppy Chow)",
  },
  pecanPieBars: {
    en: "Pecan Pie Bars",
    es: "Barritas de Pay de Nuez",
  },
  chocolateChipCookieBars: {
    en: "Chocolate Chip Cookie Bars",
    es: "Barritas de Galleta con Chispas de Chocolate",
  },
} as const;

type DessertKey = keyof typeof DESSERT_NAME;

function dessertEN(...keys: DessertKey[]) {
  return keys.map((key) => DESSERT_NAME[key].en);
}

function dessertES(...keys: DessertKey[]) {
  return keys.map((key) => DESSERT_NAME[key].es);
}

export const DESSERT_SUGGESTIONS_BY_RECIPE: Partial<
  Record<string, DessertKey[]>
> = {
  "quick-beef-chili": [
    "blueberryCheesecakeCrescentRolls",
    "chocolatePeanutButterNoBakeBars",
    "campfireBananaBoats",
  ],

  "normal-school-pizza": [
    "chocolateChipCookies",
    "classicBrownies",
    "riceKrispieTreats",
  ],

  "normal-tilapia-asparagus-foil-packets": [
    "lemonBars",
    "darkChocolateDippedStrawberries",
    "noBakeCheesecakeCups",
  ],

  "normal-slow-cooker-beef-enchilada-casserole": [
    "sopapillaBars",
    "iceCreamSundaes",
    "chocolatePudding",
  ],

  "normal-shepherds-pie": [
    "appleCrisp",
    "classicBrownies",
    "bananaPudding",
  ],

  "normal-italian-sausage-stuffed-peppers": [
    "miniCheesecakes",
    "lemonBars",
    "chocolateChipCookieBars",
  ],

  "quick-honey-garlic-chicken": [
    "darkChocolateDippedStrawberries",
    "noBakeCheesecakeCups",
    "chocolateMugCake",
  ],

  "quick-lemon-butter-salmon": [
    "lemonBars",
    "darkChocolateDippedStrawberries",
    "strawberryShortcake",
  ],

  "cajun-shrimp-sausage-potato-bake": [
  "bananaPudding",
  "lemonBars",
  "peachCobbler",
],

  "quick-chicken-fried-rice": [
    "oreoDirtCups",
    "riceKrispieTreats",
    "iceCreamSundaes",
  ],

  "quick-bbq-chicken-flatbread": [
    "campfireBananaBoats",
    "bananaPudding",
    "peachCobbler",
  ],

  "normal-baked-ziti": [
    "miniCheesecakes",
    "chocolateChipCookieBars",
    "classicBrownies",
  ],

  "normal-chicken-alfredo": [
    "strawberryShortcake",
    "miniCheesecakes",
    "lemonBars",
  ],

  "normal-beef-stroganoff": [
    "appleCrisp",
    "classicBrownies",
    "chocolatePudding",
  ],

  "normal-chicken-pot-pie": [
    "appleCrisp",
    "bananaPudding",
    "chocolateChipCookieBars",
  ],

  "normal-taco-pasta": [
    "sopapillaBars",
    "iceCreamSundaes",
    "chocolatePudding",
  ],

  "pan-seared-scallops-lemon-risotto": [
    "lemonBars",
    "darkChocolateDippedStrawberries",
    "miniCheesecakes",
  ],

  "lemon-herb-roasted-salmon": [
    "lemonBars",
    "strawberryShortcake",
    "noBakeCheesecakeCups",
  ],

  "beef-broccoli-stir-fry": [
    "darkChocolateDippedStrawberries",
    "riceKrispieTreats",
    "iceCreamSundaes",
  ],

  "zuppa-toscana-soup": [
    "miniCheesecakes",
    "chocolateChipCookieBars",
    "appleCrisp",
  ],

  "hidden-veggie-meatloaf": [
    "classicBrownies",
    "appleCrisp",
    "chocolateChipCookies",
  ],

  "toms-spaghetti": [
    "miniCheesecakes",
    "classicBrownies",
    "chocolateChipCookieBars",
  ],

  "shrimp-scampi": [
    "lemonBars",
    "strawberryShortcake",
    "darkChocolateDippedStrawberries",
  ],

  "maryland-crab-cake": [
    "lemonBars",
    "peachCobbler",
    "darkChocolateDippedStrawberries",
  ],

  "crock-pot-roast-beef": [
    "appleCrisp",
    "pecanPieBars",
    "classicBrownies",
  ],

  "big-crockpot-potato-soup": [
    "chocolateChipCookies",
    "riceKrispieTreats",
    "chocolatePudding",
  ],

  "big-crispy-chicken-wings": [
    "riceKrispieTreats",
    "iceCreamSundaes",
    "puppyChowMuddyBuddies",
  ],

  "normal-grilled-bbq-chicken-thighs": [
    "campfireBananaBoats",
    "peachCobbler",
    "bananaPudding",
  ],

  "quick-grilled-steak": [
    "pecanPieBars",
    "chocolatePudding",
    "miniCheesecakes",
  ],

  "quick-grilled-chicken-breasts": [
    "strawberryShortcake",
    "noBakeCheesecakeCups",
    "lemonBars",
  ],

  "quick-grilled-shrimp-skewers": [
    "lemonBars",
    "darkChocolateDippedStrawberries",
    "strawberryShortcake",
  ],

  "quick-grilled-sausage-peppers": [
    "miniCheesecakes",
    "chocolateChipCookieBars",
    "lemonBars",
  ],

  "normal-grilled-pork-chops": [
    "appleCrisp",
    "peachCobbler",
    "snickerdoodles",
  ],

  "quick-grilled-burgers": [
    "chocolateChipCookies",
    "iceCreamSundaes",
    "riceKrispieTreats",
  ],

  "grilled-cheese-sandwich": [
    "chocolatePudding",
    "riceKrispieTreats",
    "chocolateChipCookies",
  ],

  "quick-chicken-parmesan-melts": [
    "miniCheesecakes",
    "chocolateChipCookieBars",
    "lemonBars",
  ],

  "quick-taco-mac-skillet": [
    "sopapillaBars",
    "iceCreamSundaes",
    "chocolatePudding",
  ],

  "quick-lemon-pepper-tilapia": [
    "lemonBars",
    "darkChocolateDippedStrawberries",
    "noBakeCheesecakeCups",
  ],

  "quick-bbq-chicken": [
    "campfireBananaBoats",
    "peachCobbler",
    "bananaPudding",
  ],

  "normal-simple-tacos": [
    "sopapillaBars",
    "iceCreamSundaes",
    "chocolatePudding",
  ],

  "quick-sloppy-joes-sandwich": [
    "chocolateChipCookies",
    "riceKrispieTreats",
    "iceCreamSundaes",
  ],

  "big-beef-lasagna": [
    "miniCheesecakes",
    "classicBrownies",
    "chocolateChipCookieBars",
  ],

  "normal-chili-cheese-dogs": [
    "iceCreamSundaes",
    "riceKrispieTreats",
    "puppyChowMuddyBuddies",
  ],

  "big-white-chicken-chili": [
    "blueberryCheesecakeCrescentRolls",
    "chocolatePeanutButterNoBakeBars",
    "noBakeCheesecakeCups",
  ],

  "normal-taco-soup": [
    "sopapillaBars",
    "iceCreamSundaes",
    "chocolatePudding",
  ],

  "big-sheet-pan-fajitas": [
    "sopapillaBars",
    "iceCreamSundaes",
    "chocolatePudding",
  ],

  "normal-air-fryer-chicken-tenders": [
    "chocolateChipCookies",
    "riceKrispieTreats",
    "iceCreamSundaes",
  ],

  "big-baked-chicken-thighs": [
    "appleCrisp",
    "classicBrownies",
    "chocolateChipCookies",
  ],

  "big-bbq-chicken-drumsticks": [
    "campfireBananaBoats",
    "peachCobbler",
    "bananaPudding",
  ],

  "smoked-pulled-pork": [
    "peachCobbler",
    "bananaPudding",
    "pecanPieBars",
  ],

  "big-smoked-meatloaf": [
    "appleCrisp",
    "classicBrownies",
    "pecanPieBars",
  ],

  "pork-street-tacos": [
    "sopapillaBars",
    "iceCreamSundaes",
    "chocolatePudding",
  ],

  "roasted-tomato-basil-soup": [
    "chocolatePudding",
    "chocolateChipCookies",
    "strawberryShortcake",
  ],

  "slow-cooker-beef-stew": [
    "appleCrisp",
    "pecanPieBars",
    "classicBrownies",
  ],

  "loaded-taco-party-ring": [
    "sopapillaBars",
    "iceCreamSundaes",
    "puppyChowMuddyBuddies",
  ],

  "barbecue-chicken-pizza": [
    "campfireBananaBoats",
    "bananaPudding",
    "chocolateChipCookies",
  ],

  "homemade-fried-chicken": [
    "peachCobbler",
    "bananaPudding",
    "pecanPieBars",
  ],

  "chimichurri-skirt-steak-bowls": [
    "darkChocolateDippedStrawberries",
    "lemonBars",
    "noBakeCheesecakeCups",
  ],

  "lamb-and-beef-gateway-burgers": [
    "miniCheesecakes",
    "lemonBars",
    "darkChocolateDippedStrawberries",
  ],

  "air-fryer-brisket-taquitos": [
    "sopapillaBars",
    "iceCreamSundaes",
    "chocolatePudding",
  ],

  "homemade-pizza-pockets": [
    "chocolateChipCookies",
    "riceKrispieTreats",
    "iceCreamSundaes",
  ],

  "baked-potato-bar": [
    "chocolatePudding",
    "classicBrownies",
    "strawberryShortcake",
  ],

  "alphabet-star-pasta-soup": [
    "riceKrispieTreats",
    "chocolatePudding",
    "chocolateChipCookies",
  ],

  "mississippi-chicken": [
    "appleCrisp",
    "classicBrownies",
    "bananaPudding",
  ],

  "garlic-herb-pork-loin": [
    "appleCrisp",
    "peachCobbler",
    "snickerdoodles",
  ],

  "smashburgers-with-tallow-crisped-edges": [
    "iceCreamSundaes",
    "chocolateChipCookies",
    "puppyChowMuddyBuddies",
  ],

  "slow-cooked-birria-tacos": [
    "sopapillaBars",
    "iceCreamSundaes",
    "chocolatePudding",
  ],

  "hot-honey-applewood-smoked-ribs": [
    "peachCobbler",
    "bananaPudding",
    "pecanPieBars",
  ],

  "spatchcock-butter-bath-chicken": [
    "appleCrisp",
    "strawberryShortcake",
    "classicBrownies",
  ],

  "korean-inspired-mini-beef-patties": [
    "darkChocolateDippedStrawberries",
    "riceKrispieTreats",
    "iceCreamSundaes",
  ],

  "duck-carnitas-tacos": [
    "sopapillaBars",
    "miniCheesecakes",
    "chocolatePudding",
  ],

  "wagyu-blend-meatloaf": [
    "appleCrisp",
    "pecanPieBars",
    "classicBrownies",
  ],

  "big-jamaican-jerk-chicken": [
    "campfireBananaBoats",
    "bananaPudding",
    "peachCobbler",
  ],

  "quick-classic-hobo-foil-packet": [
    "smores",
    "campfireBananaBoats",
    "riceKrispieTreats",
  ],

  "big-dutch-oven-taco-mountain": [
    "sopapillaBars",
    "iceCreamSundaes",
    "puppyChowMuddyBuddies",
  ],

  "big-campfire-chili-mac": [
    "campfireBananaBoats",
    "smores",
    "chocolateChipCookies",
  ],

  "quick-hot-dog-octopus-veggie-kebabs": [
    "iceCreamSundaes",
    "riceKrispieTreats",
    "smores",
  ],

  "quick-pie-iron-pudgie-pies": [
    "campfireBananaBoats",
    "smores",
    "chocolateChipCookies",
  ],

  "quick-vegetable-stir-fry": [
    "darkChocolateDippedStrawberries",
    "riceKrispieTreats",
    "iceCreamSundaes",
  ],

  "vegetable-lo-mein-noodles": [
    "darkChocolateDippedStrawberries",
    "riceKrispieTreats",
    "chocolatePudding",
  ],

  "crispy-sheet-pan-gnocchi-roasted-veggies": [
    "lemonBars",
    "miniCheesecakes",
    "chocolateChipCookieBars",
  ],

  "creamy-shells-peas-parmesan": [
    "strawberryShortcake",
    "lemonBars",
    "miniCheesecakes",
  ],

  "black-bean-corn-quesadillas": [
    "sopapillaBars",
    "iceCreamSundaes",
    "chocolatePudding",
  ],

  "taco-style-lentil-sloppy-joes": [
    "chocolateChipCookies",
    "riceKrispieTreats",
    "iceCreamSundaes",
  ],

  "normal-vegan-jambalaya": [
    "peachCobbler",
    "bananaPudding",
    "lemonBars",
  ],

  "quick-black-bean-quesadillas": [
    "sopapillaBars",
    "iceCreamSundaes",
    "chocolatePudding",
  ],

  "quick-pesto-naan-pizzas": [
    "strawberryShortcake",
    "chocolateChipCookies",
    "lemonBars",
  ],

  "quick-jamaican-jerk-tofu": [
    "campfireBananaBoats",
    "bananaPudding",
    "peachCobbler",
  ],

  "big-vegetarian-shepherds-pie": [
    "appleCrisp",
    "classicBrownies",
    "bananaPudding",
  ],

  "quick-creamy-tortellini": [
    "strawberryShortcake",
    "miniCheesecakes",
    "lemonBars",
  ],

  "big-spinach-ricotta-stuffed-shells": [
    "miniCheesecakes",
    "classicBrownies",
    "chocolateChipCookieBars",
  ],

  "normal-chickpea-curry": [
    "riceKrispieTreats",
    "noBakeCheesecakeCups",
    "darkChocolateDippedStrawberries",
  ],

  "normal-spicy-tofu-mushroom-hash": [
    "darkChocolateDippedStrawberries",
    "lemonBars",
    "riceKrispieTreats",
  ],

  "quick-caprese-pasta": [
    "strawberryShortcake",
    "lemonBars",
    "noBakeCheesecakeCups",
  ],

  "big-mediterranean-stuffed-peppers": [
    "lemonBars",
    "miniCheesecakes",
    "darkChocolateDippedStrawberries",
  ],

  "quick-vegetable-pad-thai": [
    "darkChocolateDippedStrawberries",
    "riceKrispieTreats",
    "iceCreamSundaes",
  ],

  "big-roasted-vegetable-wellington": [
    "appleCrisp",
    "pecanPieBars",
    "miniCheesecakes",
  ],

  "big-black-bean-burgers-sweet-potato-fries": [
    "chocolateChipCookies",
    "iceCreamSundaes",
    "riceKrispieTreats",
  ],

  "big-sweet-potato-black-bean-enchiladas": [
    "sopapillaBars",
    "iceCreamSundaes",
    "chocolatePudding",
  ],

  "vegetarian-fri-chik-noodle-casserole": [
    "classicBrownies",
    "appleCrisp",
    "chocolateChipCookies",
  ],

  "normal-caprese-stuffed-portobello-mushrooms": [
    "strawberryShortcake",
    "lemonBars",
    "miniCheesecakes",
  ],

  "normal-spinach-mushroom-feta-crustless-quiche": [
    "strawberryShortcake",
    "blueberryCheesecakeCrescentRolls",
    "lemonBars",
  ],

  "quick-cream-cheese-spinach-pasta": [
    "strawberryShortcake",
    "miniCheesecakes",
    "chocolateChipCookieBars",
  ],

  "quick-caprese-sandwich": [
    "chocolateChipCookies",
    "strawberryShortcake",
    "chocolatePudding",
  ],

  "creamy-mushroom-stroganoff": [
    "appleCrisp",
    "classicBrownies",
    "chocolatePudding",
  ],

  "oyster-mushroom-bbq-tacos": [
    "campfireBananaBoats",
    "peachCobbler",
    "bananaPudding",
  ],

  "gochujang-tofu-broccoli-stir-fry": [
    "darkChocolateDippedStrawberries",
    "riceKrispieTreats",
    "iceCreamSundaes",
  ],

  "coconut-curry-ramen": [
    "darkChocolateDippedStrawberries",
    "noBakeCheesecakeCups",
    "riceKrispieTreats",
  ],

  "kimchi-brown-rice-bliss-bowl": [
    "darkChocolateDippedStrawberries",
    "riceKrispieTreats",
    "iceCreamSundaes",
  ],

  "sweet-potato-kale-chili": [
    "appleCrisp",
    "chocolatePeanutButterNoBakeBars",
    "noBakeCheesecakeCups",
  ],

  "greek-style-baked-orzo": [
    "lemonBars",
    "miniCheesecakes",
    "darkChocolateDippedStrawberries",
  ],

  "mushroom-sage-tagliatelle": [
    "appleCrisp",
    "miniCheesecakes",
    "classicBrownies",
  ],

  "vegan-crunchwrap-supreme": [
    "sopapillaBars",
    "iceCreamSundaes",
    "chocolatePudding",
  ],

  "cauliflower-gnocchi-mushroom-alfredo": [
    "strawberryShortcake",
    "miniCheesecakes",
    "lemonBars",
  ],

  "black-bean-sweet-potato-tacos": [
    "sopapillaBars",
    "iceCreamSundaes",
    "chocolatePudding",
  ],

  "mediterranean-chickpea-bowl": [
    "lemonBars",
    "darkChocolateDippedStrawberries",
    "noBakeCheesecakeCups",
  ],

  "cheese-enchiladas": [
    "sopapillaBars",
    "iceCreamSundaes",
    "chocolatePudding",
  ],

  "quick-southwest-chicken-salad": [
    "iceCreamSundaes",
    "riceKrispieTreats",
    "darkChocolateDippedStrawberries",
  ],

  "normal-grilled-chicken-caesar-salad": [
    "strawberryShortcake",
    "lemonBars",
    "darkChocolateDippedStrawberries",
  ],

  "normal-cobb-salad": [
    "strawberryShortcake",
    "chocolateChipCookies",
    "noBakeCheesecakeCups",
  ],

  "normal-steakhouse-salad": [
    "pecanPieBars",
    "chocolatePudding",
    "miniCheesecakes",
  ],

  "normal-avocado-ranch-chicken-salad": [
    "strawberryShortcake",
    "lemonBars",
    "iceCreamSundaes",
  ],

  "big-buffalo-chicken-salad": [
    "riceKrispieTreats",
    "iceCreamSundaes",
    "chocolateChipCookies",
  ],

  "big-asian-chicken-salad": [
    "darkChocolateDippedStrawberries",
    "riceKrispieTreats",
    "iceCreamSundaes",
  ],

  "big-taco-salad": [
    "sopapillaBars",
    "iceCreamSundaes",
    "chocolatePudding",
  ],



};

export function getSuggestedDessertsForRecipe(
  recipe: { slug?: string; id?: string; suggestedDesserts?: string[] } | null | undefined,
  language: "en" | "es" = "en"
) {
  const recipeKey = recipe?.slug || recipe?.id || "";
  const dessertKeys = DESSERT_SUGGESTIONS_BY_RECIPE[recipeKey];

  if (dessertKeys?.length) {
    return dessertKeys.map((key) =>
      language === "es" ? DESSERT_NAME[key].es : DESSERT_NAME[key].en
    );
  }

  return Array.isArray(recipe?.suggestedDesserts)
    ? recipe.suggestedDesserts.filter((dessert) => String(dessert).trim())
    : [];
}

// =====================================================
// DINNER / MAIN RECIPES
// =====================================================

export const NEW_BUILTIN_RECIPES: Meal[] = [
  
  {
  id: "quick-beef-chili",
  slug: "quick-beef-chili",
  name: "Chili",
  effort: "quick",
  photoUrl: "/images/quick-beef-chili.jpg",
  tags: [
    "dinner",
    "beef",
    "one-pot",
    "stovetop",
    "spicy",
    "comfort",
    "quick",
    "leftovers-friendly",
  ],
  // Chili
suggestedSides: [
  "Cornbread",
  "Tortilla chips",
  "Simple green salad",
],
suggestedDesserts: [
  "Blueberry Cheesecake Crescent Rolls",
  "Chocolate Peanut Butter No-Bake Bars",
  "Campfire Banana Boats",
],
  notes:
    "A hearty, no-fuss chili that is easy to throw together and even better the next day.",
  ingredients: `1 lb ground beef
2 (14.5 oz) cans fire-roasted diced tomatoes
1 (28 oz) can diced tomatoes
1 (15.5 oz) can chili beans (do not drain)
1 (15 oz) can corn, drained
1 (15 oz) can black beans, drained and rinsed
1 packet chili seasoning
shredded cheese
sour cream
fresh or pickled jalapeños`,
  instructions: `Brown the ground beef in a large pot over medium heat until fully cooked.
Drain excess grease.
Add fire-roasted tomatoes, diced tomatoes, chili beans, corn, black beans, and chili seasoning. Stir well.
Bring to a gentle simmer.
Reduce heat and simmer uncovered for 30 minutes, stirring occasionally.
Serve hot and top with shredded cheese, sour cream, and jalapeños.`,

  translations: {
    es: {
      name: "Chili casero",
      notes:
        "Un chili sustancioso y fácil de preparar, perfecto para una cena sin complicaciones y aún mejor al día siguiente.",
      tags: [
        "cena",
        "carne de res",
        "una olla",
        "estufa",
        "picante",
        "comida reconfortante",
        "rápido",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Pan de maíz",
        "Totopos",
        "Ensalada verde sencilla",
      ],
      suggestedDesserts: [
  "Crecientes de cheesecake con arándanos",
  "Barras sin hornear de chocolate y crema de cacahuate",
  "Bananas de Fogata",
],
      ingredients: `1 lb de carne molida de res
2 latas (14.5 oz) de tomates asados en cubitos
1 lata (28 oz) de tomates en cubitos
1 lata (15.5 oz) de frijoles para chili, sin escurrir
1 lata (15 oz) de maíz, escurrido
1 lata (15 oz) de frijoles negros, escurridos y enjuagados
1 paquete de sazonador para chili
queso rallado
crema agria
jalapeños frescos o en escabeche`,
      instructions: `Dora la carne molida de res en una olla grande a fuego medio hasta que esté completamente cocida.
Escurre el exceso de grasa.
Agrega los tomates asados, los tomates en cubitos, los frijoles para chili, el maíz, los frijoles negros y el sazonador para chili. Mezcla bien.
Lleva a un hervor suave.
Reduce el fuego y cocina sin tapar durante 30 minutos, revolviendo de vez en cuando.
Sirve caliente y agrega queso rallado, crema agria y jalapeños encima.`,
    },
  },
},

  {
  id: "normal-chicken-greenbean-mushroom-bake",
  slug: "normal-chicken-greenbean-mushroom-bake",
  name: "Chicken Green Bean Mushroom Bake",
  effort: "normal",
  photoUrl: "/images/normal-chicken-greenbean-mushroom-bake.jpg",
  tags: ["dinner", "chicken", "bake", "casserole", "comfort", "family-friendly", "leftovers-friendly"],
  // Chicken Green Bean Mushroom Bake
suggestedSides: [
  "Dinner rolls",
  "Side salad",
  "Roasted carrots",
],
suggestedDesserts: [ "No-Bake Cheesecake Cups", "Classic Brownies", "Chocolate Chip Cookies", ],
  notes: "A creamy baked chicken dinner that works well for cozy weeknights and reheats nicely.",
  ingredients: `4 skinless chicken breasts
8 oz baby bella mushrooms, sliced
2 (10.5 oz) cans cream of mushroom soup
1 (14.5 oz) can green beans, drained
1 Tbsp garlic, minced
2 Tbsp butter
1 cup white rice
2 cups water
1/2 cup shredded mozzarella cheese
salt
pepper`,
  instructions: `Preheat oven to 375°F.
In a baking dish, mix 1 can of cream of mushroom soup, mushrooms, and green beans.
In a skillet over medium-high heat, melt 2 Tbsp butter and brown chicken on both sides with 1 Tbsp garlic.
Place chicken on top of the mixture in the baking dish.
Spread the remaining 1 can of cream of mushroom soup over the chicken.
Cover tightly with foil and bake for 30 minutes, or until chicken reaches 165°F.
Meanwhile, bring 2 cups water to a boil, add rice, reduce heat, cover, and simmer 15 minutes. Rest 5 minutes.
Uncover dish, sprinkle mozzarella on top, and return to oven 5 to 10 minutes until melted.
Serve chicken and mushroom mixture over rice; season with salt and pepper.`,
  translations: {
    es: {
      name: "Pollo al horno con ejotes y champiñones",
      notes:
        "Una cena cremosa de pollo al horno, perfecta para noches acogedoras y muy buena para recalentar.",
      tags: [
        "cena",
        "pollo",
        "horneado",
        "cazuela",
        "comida reconfortante",
        "familiar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Panecillos",
        "Ensalada sencilla",
        "Zanahorias rostizadas",
      ],
      suggestedDesserts: [ "Vasitos de Cheesecake Sin Horno", "Brownies Clásicos", "Galletas con Chispas de Chocolate", ],
      ingredients: `4 pechugas de pollo sin piel
8 oz de champiñones baby bella, rebanados
2 latas (10.5 oz) de crema de champiñones
1 lata (14.5 oz) de ejotes, escurridos
1 Tbsp de ajo, picado
2 Tbsp de mantequilla
1 cup de arroz blanco
2 cups de agua
1/2 cup de queso mozzarella rallado
sal
pimienta`,
      instructions: `Precalienta el horno a 375°F.
En un molde para hornear, mezcla 1 lata de crema de champiñones, los champiñones y los ejotes.
En un sartén a fuego medio-alto, derrite 2 Tbsp de mantequilla y dora el pollo por ambos lados con 1 Tbsp de ajo.
Coloca el pollo sobre la mezcla en el molde para hornear.
Unta la lata restante de crema de champiñones sobre el pollo.
Cubre bien con papel aluminio y hornea durante 30 minutos, o hasta que el pollo alcance 165°F.
Mientras tanto, hierve 2 cups de agua, agrega el arroz, reduce el fuego, tapa y cocina a fuego bajo durante 15 minutos. Deja reposar 5 minutos.
Destapa el molde, espolvorea mozzarella encima y regresa al horno de 5 a 10 minutos, hasta que se derrita.
Sirve el pollo y la mezcla de champiñones sobre arroz; sazona con sal y pimienta.`,
    },
  },
},

{
  id: "seared-ahi-tuna",
  slug: "seared-ahi-tuna",
  name: "Seared Ahi Tuna",
  ingredients: `Tuna:
2 ahi tuna steaks (about 6 oz each)
1 Tbsp sesame oil (or olive oil)
1/2 tsp salt
1/4 tsp black pepper

Crust (optional but recommended):
2 Tbsp sesame seeds (white or mixed)
1 tsp soy sauce

Sauce:
2 Tbsp soy sauce
1 Tbsp rice vinegar
1 tsp honey
1/2 tsp sesame oil

Optional:
1 tsp wasabi
1 Tbsp green onions, sliced`,
  instructions: `Pat 2 ahi tuna steaks completely dry with paper towels.

Lightly brush tuna with 1 tsp soy sauce, then press into 2 Tbsp sesame seeds to coat all sides if using.

Season with 1/2 tsp salt and 1/4 tsp black pepper.

Heat 1 Tbsp sesame oil in a skillet (preferably cast iron) over high heat until just smoking.

Place tuna in the pan and sear for 60 to 90 seconds per side, until a deep golden crust forms while the center remains rare.

Remove from heat and let rest for 2 minutes.

In a small bowl, whisk together 2 Tbsp soy sauce, 1 Tbsp rice vinegar, 1 tsp honey, and 1/2 tsp sesame oil.

Slice tuna against the grain into thin pieces.

Serve with sauce, wasabi if desired, and garnish with green onions.`,
  photoUrl: "/images/seared-ahi-tuna.jpg",
  effort: "quick",
  tags: ["dinner", "seafood", "tuna", "quick", "healthy", "high-protein", "asian", "premium"],
  isVegetarian: false,
  // Seared Ahi Tuna
suggestedSides: [
  "Steamed rice",
  "Cucumber salad",
  "Roasted asparagus",
],
suggestedDesserts: [ "Dark Chocolate Dipped Strawberries", "No-Bake Cheesecake Cups", "Lemon Bars", ],
  notes: "Use sushi-grade ahi tuna for best results. The key is a very hot pan and a quick sear to keep the center tender and rare.",
  translations: {
    es: {
      name: "Atún ahi sellado",
      notes:
        "Usa atún ahi de calidad para sushi para mejores resultados. La clave es un sartén muy caliente y un sellado rápido para mantener el centro tierno y poco cocido.",
      tags: [
        "cena",
        "mariscos",
        "atún",
        "rápido",
        "saludable",
        "alto en proteína",
        "asiático",
        "especial",
      ],
      suggestedSides: [
        "Arroz al vapor",
        "Ensalada de pepino",
        "Espárragos rostizados",
      ],
      suggestedDesserts: [ "Fresas cubiertas con chocolate oscuro", "Vasitos de Cheesecake Sin Horno", "Barritas de Limón", ],
      ingredients: `Atún:
2 filetes de atún ahi (aprox. 6 oz cada uno)
1 Tbsp de aceite de sésamo o aceite de oliva
1/2 tsp de sal
1/4 tsp de pimienta negra

Costra (opcional pero recomendada):
2 Tbsp de semillas de sésamo blancas o mixtas
1 tsp de salsa de soya

Salsa:
2 Tbsp de salsa de soya
1 Tbsp de vinagre de arroz
1 tsp de miel
1/2 tsp de aceite de sésamo

Opcional:
1 tsp de wasabi
1 Tbsp de cebollines, rebanados`,
      instructions: `Seca completamente 2 filetes de atún ahi con toallas de papel.

Barniza ligeramente el atún con 1 tsp de salsa de soya, luego presiona sobre 2 Tbsp de semillas de sésamo para cubrir todos los lados, si las usas.

Sazona con 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Calienta 1 Tbsp de aceite de sésamo en un sartén, preferiblemente de hierro fundido, a fuego alto hasta que apenas empiece a humear.

Coloca el atún en el sartén y sella de 60 a 90 segundos por lado, hasta formar una costra dorada mientras el centro queda poco cocido.

Retira del fuego y deja reposar durante 2 minutos.

En un tazón pequeño, bate 2 Tbsp de salsa de soya, 1 Tbsp de vinagre de arroz, 1 tsp de miel y 1/2 tsp de aceite de sésamo.

Corta el atún contra la fibra en rebanadas delgadas.

Sirve con la salsa, wasabi si deseas, y decora con cebollines.`,
    },
  },
},

{
  id: "big-beef-salisbury-steak",
  slug: "big-beef-salisbury-steak",
  name: "Salisbury Steak with Mushroom Gravy",
  effort: "big",
  photoUrl: "/images/big-beef-salisbury-steak.jpg",
  tags: ["dinner", "beef", "stovetop", "comfort", "gravy", "family-friendly"],
  // Salisbury Steak with Mushroom Gravy
suggestedSides: [
  "Mashed potatoes",
  "Green beans",
  "Dinner rolls",
],
suggestedDesserts: [ "Classic Brownies", "Apple Crisp", "Chocolate Mug Cake", ],
  notes: "Classic comfort food with rich mushroom gravy that is perfect over mashed potatoes.",
  ingredients: `1 lb ground beef
1/4 cup panko breadcrumbs
1 large egg, beaten
5 tsp ketchup
1 tsp dijon mustard
1/2 tsp dried oregano
1 Tbsp olive oil
2 Tbsp butter
2 Tbsp flour
1 1/2 cups beef stock
1 tsp worcestershire sauce
1/2 tsp onion powder
8 oz baby bella mushrooms, sliced
salt
pepper`,
  instructions: `In a bowl, mix ground beef, 1/4 cup breadcrumbs, 1 egg, 2 tsp ketchup, 1 tsp dijon, and 1/2 tsp oregano until just combined.
Shape into 4 oval patties, about 3/4-inch thick.
Heat 1 Tbsp olive oil in a large skillet over medium-high heat.
Cook patties about 3 minutes per side until browned; transfer to a plate.
Reduce heat to medium; melt 2 Tbsp butter in the same skillet.
Whisk in 2 Tbsp flour until smooth; cook 1 to 2 minutes.
Reduce heat to medium-low and slowly whisk in 1 1/2 cups beef stock until smooth.
Stir in 1 Tbsp ketchup, 1 tsp worcestershire, and 1/2 tsp onion powder.
Add mushrooms and simmer about 5 minutes until thickened; season with salt and pepper.
Return patties to skillet, nestle into gravy, cover, and cook 10 minutes or until temperature reaches 160°F.
Serve over mashed potatoes with mushroom gravy spooned on top.`,
  translations: {
    es: {
      name: "Filetes Salisbury con gravy de champiñones",
      notes:
        "Un clásico de comida reconfortante con un gravy rico de champiñones, perfecto para servir sobre puré de papas.",
      tags: [
        "cena",
        "carne de res",
        "estufa",
        "comida reconfortante",
        "gravy",
        "familiar",
      ],
      suggestedSides: [
        "Puré de papas",
        "Ejotes",
        "Panecillos",
      ],
      suggestedDesserts: [ "Brownies Clásicos", "Crumble de Manzana", "Pastel de Chocolate en Taza", ],
      ingredients: `1 lb de carne molida de res
1/4 cup de pan molido panko
1 huevo grande, batido
5 tsp de ketchup
1 tsp de mostaza dijon
1/2 tsp de orégano seco
1 Tbsp de aceite de oliva
2 Tbsp de mantequilla
2 Tbsp de harina
1 1/2 cups de caldo de res
1 tsp de salsa worcestershire
1/2 tsp de cebolla en polvo
8 oz de champiñones baby bella, rebanados
sal
pimienta`,
      instructions: `En un tazón, mezcla la carne molida, 1/4 cup de pan molido, 1 huevo, 2 tsp de ketchup, 1 tsp de dijon y 1/2 tsp de orégano hasta que todo esté apenas combinado.
Forma 4 tortitas ovaladas de aproximadamente 3/4 inch de grosor.
Calienta 1 Tbsp de aceite de oliva en un sartén grande a fuego medio-alto.
Cocina las tortitas unos 3 minutos por lado, hasta que estén doradas; pásalas a un plato.
Reduce el fuego a medio y derrite 2 Tbsp de mantequilla en el mismo sartén.
Bate 2 Tbsp de harina hasta que quede suave; cocina de 1 a 2 minutos.
Reduce el fuego a medio-bajo y agrega lentamente 1 1/2 cups de caldo de res, batiendo hasta que quede suave.
Agrega 1 Tbsp de ketchup, 1 tsp de salsa worcestershire y 1/2 tsp de cebolla en polvo.
Agrega los champiñones y cocina a fuego lento unos 5 minutos, hasta que espese; sazona con sal y pimienta.
Regresa las tortitas al sartén, acomódalas dentro del gravy, tapa y cocina 10 minutos o hasta que alcancen 160°F.
Sirve sobre puré de papas con el gravy de champiñones encima.`,
    },
  },
},

{
  id: "normal-wild-west-shrimp",
  slug: "normal-wild-west-shrimp",
  name: "Wild West Shrimp",
  effort: "normal",
  photoUrl: "/images/normal-wild-west-shrimp.jpg",
  tags: ["dinner", "seafood", "shellfish", "shrimp", "fried", "spicy", "restaurant-style"],
  // Wild West Shrimp
suggestedSides: [
  "French fries",
  "Coleslaw",
  "Corn on the cob",
],
suggestedDesserts: [ "Campfire Banana Boats", "Rice Krispie Treats", "Chocolate Peanut Butter No-Bake Bars", ],
  notes: "A restaurant-style shrimp dish with bold buttery heat and a crunchy coating.",
  ingredients: `1 lb medium shrimp, peeled and deveined
1 1/2 cups flour
1 tsp pepper
1/2 tsp salt
1 cup milk
frying oil (enough for about 2 inches deep)
1 Tbsp Old Bay seasoning
1/2 cup butter
1 Tbsp garlic, minced
1 Tbsp lemon juice
6 cherry peppers, chopped`,
  instructions: `Add oil to a frying pan or pot and heat over medium-high.
In a bowl, mix 1 1/2 cups flour, 1/2 tsp salt, and 1 tsp pepper.
Place 1 cup milk in a separate bowl.
Dredge shrimp in milk, then coat in flour mixture. Shake off excess.
Fry shrimp in batches until golden and cooked through.
Remove with a slotted spoon and drain on paper towels.

In a separate pan, melt 1/2 cup butter over low heat.
Add 1 Tbsp garlic and 1 Tbsp lemon juice and stir.
Add 6 chopped cherry peppers and about 1 Tbsp Old Bay seasoning.
Sauté over low heat for 2 to 3 minutes.

Drizzle the mixture over the fried shrimp.
Serve warm with ranch dressing.`,
  translations: {
    es: {
      name: "Camarones estilo Wild West",
      notes:
        "Un plato de camarones estilo restaurante con mantequilla, un toque picante y una cubierta crujiente.",
      tags: [
        "cena",
        "mariscos",
        "camarones",
        "frito",
        "picante",
        "estilo restaurante",
      ],
      suggestedSides: [
        "Papas fritas",
        "Ensalada de col",
        "Elote",
      ],
      suggestedDesserts: [ "Bananas de Fogata", "Cuadritos de Arroz Inflado", "Barras sin hornear de chocolate y crema de cacahuate", ],
      ingredients: `1 lb de camarones medianos, pelados y desvenados
1 1/2 cups de harina
1 tsp de pimienta
1/2 tsp de sal
1 cup de leche
aceite para freír, suficiente para unas 2 inches de profundidad
1 Tbsp de sazonador Old Bay
1/2 cup de mantequilla
1 Tbsp de ajo, picado
1 Tbsp de jugo de limón
6 chiles cherry, picados`,
      instructions: `Agrega aceite a un sartén o una olla y calienta a fuego medio-alto.
En un tazón, mezcla 1 1/2 cups de harina, 1/2 tsp de sal y 1 tsp de pimienta.
Coloca 1 cup de leche en otro tazón.
Pasa los camarones por la leche y luego cúbrelos con la mezcla de harina. Sacude el exceso.
Fríe los camarones en tandas hasta que estén dorados y bien cocidos.
Retíralos con una cuchara ranurada y escúrrelos sobre toallas de papel.

En otro sartén, derrite 1/2 cup de mantequilla a fuego bajo.
Agrega 1 Tbsp de ajo y 1 Tbsp de jugo de limón, y mezcla.
Agrega 6 chiles cherry picados y aproximadamente 1 Tbsp de sazonador Old Bay.
Saltea a fuego bajo de 2 a 3 minutos.

Rocía la mezcla sobre los camarones fritos.
Sirve caliente con aderezo ranch.`,
    },
  },
},

{
  id: "big-mushroom-swiss-sliders",
  slug: "big-mushroom-swiss-sliders",
  name: "Mushroom Swiss Sliders",
  effort: "big",
  photoUrl: "/images/big-mushroom-swiss-sliders.jpg",
  tags: ["dinner", "beef", "sliders", "sandwich", "bake", "party", "comfort", "family-friendly"],
  // Mushroom Swiss Sliders
suggestedSides: [
  "French fries",
  "Pickles",
  "Coleslaw",
],
suggestedDesserts: dessertEN(
  "chocolateChipCookies",
  "classicBrownies",
  "riceKrispieTreats"
),
  notes: "Great for feeding a crowd or using as a fun family dinner night.",
  ingredients: `1 Tbsp seasoned salt
1 Tbsp hamburger seasoning
1/4 tsp salt
1/4 tsp pepper
1 Tbsp olive oil
1/2 cup yellow onion, diced
1 tsp garlic, minced
1 lb ground beef
1/2 tsp worcestershire sauce
3/4 cup (1 1/2 stick) butter
8 oz baby bella mushrooms, sliced
1/4 cup beef broth
1/4 cup milk
1/2 cup shredded Swiss cheese
1 tsp garlic salt
2 tsp sesame seeds
1 package King’s Hawaiian rolls (12 count)
12 slices Swiss cheese`,
  instructions: `Preheat oven to 350°F. Spray a 9x13-inch baking dish with nonstick spray.

In a small bowl, mix 1 Tbsp seasoned salt, 1 Tbsp hamburger seasoning, 1/4 tsp salt, and 1/4 tsp pepper.
Heat 1 Tbsp olive oil in a large skillet over medium heat.
Add 1/2 cup diced onion and 1 tsp garlic and cook 1 to 2 minutes.
Add ground beef and break apart with a spoon.
Stir in 1/2 tsp worcestershire and seasoning mixture.
Cook 8 to 10 minutes until no pink remains. Drain and set aside.

In a medium saucepan over medium heat, melt 1/2 cup butter.
Add mushrooms and cook 5 to 10 minutes until softened.
Add 1/4 cup beef broth and 1/4 cup milk.
Reduce heat and slowly whisk in 1/2 cup shredded Swiss cheese until melted.
Stir in cooked hamburger mixture and combine well.

Melt 1/4 cup butter and mix with 1 tsp garlic salt and 2 tsp sesame seeds in a small bowl.

Slice rolls in half and place bottom halves in baking dish.
Layer 6 slices Swiss cheese on bottom buns.
Spread hamburger mixture evenly over cheese.
Top with remaining 6 slices of Swiss cheese.
Place top halves of buns on sliders.
Brush tops with seasoned butter mixture.

Cover with foil and bake 20 minutes until cheese is melted.
Remove foil and bake 5 more minutes until tops are golden brown.
Serve warm.`,
  translations: {
    es: {
      name: "Sliders de champiñones y queso suizo",
      notes:
        "Ideales para alimentar a varias personas o para una cena familiar divertida.",
      tags: [
        "cena",
        "carne de res",
        "sliders",
        "sándwich",
        "horneado",
        "fiesta",
        "comida reconfortante",
        "familiar",
      ],
      suggestedSides: [
        "Papas fritas",
        "Pepinillos",
        "Ensalada de col",
      ],
      suggestedDesserts: dessertES(
  "chocolateChipCookies",
  "classicBrownies",
  "riceKrispieTreats"
),
      ingredients: `1 Tbsp de sal sazonada
1 Tbsp de sazonador para hamburguesa
1/4 tsp de sal
1/4 tsp de pimienta
1 Tbsp de aceite de oliva
1/2 cup de cebolla amarilla, picada en cubitos
1 tsp de ajo, picado
1 lb de carne molida de res
1/2 tsp de salsa worcestershire
3/4 cup (1 1/2 barras) de mantequilla
8 oz de champiñones baby bella, rebanados
1/4 cup de caldo de res
1/4 cup de leche
1/2 cup de queso suizo rallado
1 tsp de sal de ajo
2 tsp de semillas de sésamo
1 paquete de panecillos King’s Hawaiian (12 piezas)
12 rebanadas de queso suizo`,
      instructions: `Precalienta el horno a 350°F. Rocía un molde para hornear de 9x13 inches con spray antiadherente.

En un tazón pequeño, mezcla 1 Tbsp de sal sazonada, 1 Tbsp de sazonador para hamburguesa, 1/4 tsp de sal y 1/4 tsp de pimienta.
Calienta 1 Tbsp de aceite de oliva en un sartén grande a fuego medio.
Agrega 1/2 cup de cebolla picada y 1 tsp de ajo, y cocina de 1 a 2 minutos.
Agrega la carne molida y sepárala con una cuchara.
Incorpora 1/2 tsp de salsa worcestershire y la mezcla de sazonadores.
Cocina de 8 a 10 minutos, hasta que no quede color rosado. Escurre y reserva.

En una cacerola mediana a fuego medio, derrite 1/2 cup de mantequilla.
Agrega los champiñones y cocina de 5 a 10 minutos, hasta que se ablanden.
Agrega 1/4 cup de caldo de res y 1/4 cup de leche.
Reduce el fuego y bate lentamente 1/2 cup de queso suizo rallado hasta que se derrita.
Agrega la mezcla de carne cocida y combina bien.

Derrite 1/4 cup de mantequilla y mezcla con 1 tsp de sal de ajo y 2 tsp de semillas de sésamo en un tazón pequeño.

Corta los panecillos por la mitad y coloca las mitades inferiores en el molde para hornear.
Coloca 6 rebanadas de queso suizo sobre los panes inferiores.
Extiende la mezcla de carne de manera uniforme sobre el queso.
Cubre con las 6 rebanadas restantes de queso suizo.
Coloca las mitades superiores de los panes sobre los sliders.
Barniza la parte superior con la mezcla de mantequilla sazonada.

Cubre con papel aluminio y hornea durante 20 minutos, hasta que el queso se derrita.
Retira el papel aluminio y hornea 5 minutos más, hasta que la parte superior esté dorada.
Sirve caliente.`,
    },
  },
},

  {
  id: "normal-school-pizza",
  slug: "normal-school-pizza",
  name: "School Pizza",
  effort: "normal",
  photoUrl: "/images/normal-school-pizza.jpg",
  tags: ["dinner", "pizza", "bake", "comfort", "kid-friendly", "sheet-pan", "family-friendly"],
  // School Pizza
suggestedSides: [
  "Simple green salad",
  "Fruit salad",
  "Carrot sticks with ranch",
],
suggestedDesserts: [
  "Chocolate Chip Cookies",
  "Classic Brownies",
  "Rice Krispie Treats",
],
  notes: "A nostalgic sheet-pan pizza that brings back cafeteria memories in the best way.",
  ingredients: `4 Tbsp olive oil, divided
3 Tbsp cornmeal
1 lb prepared pizza dough
1 lb mild ground Italian sausage
3 Tbsp Italian seasoning
1 (13 oz) jar pizza sauce
4 cups shredded mozzarella cheese`,
  instructions: `Preheat oven to 400°F.
Drizzle 3 Tbsp olive oil onto a half sheet pan and brush to coat evenly.
Sprinkle 3 Tbsp cornmeal over the pan.

Stretch pizza dough into a rectangle to fit the sheet pan.
If the dough resists stretching, let it rest 5 minutes and continue.

Heat remaining 1 Tbsp olive oil in a skillet over medium-high heat.
Add sausage and 3 Tbsp Italian seasoning.
Cook 7 to 8 minutes until browned and no longer pink.
Drain excess grease.

Bake crust alone for 7 to 8 minutes until it no longer looks wet and begins to lightly brown.
Remove from oven.

Spread pizza sauce evenly over crust, reaching the edges.
Sprinkle cooked sausage evenly over sauce.
Top with 4 cups shredded mozzarella.

Return to oven and bake 8 to 10 minutes until cheese is melted and lightly golden.
Remove and slice into 8 rectangles.
Serve warm.`,
  translations: {
    es: {
      name: "Pizza escolar",
      notes:
        "Una pizza nostálgica en bandeja que trae recuerdos de cafetería de la mejor manera.",
      tags: [
        "cena",
        "pizza",
        "horneado",
        "comida reconfortante",
        "para niños",
        "bandeja",
        "familiar",
      ],
      suggestedSides: [
        "Ensalada verde sencilla",
        "Ensalada de frutas",
        "Palitos de zanahoria con ranch",
      ],
      suggestedDesserts: [
  "Galletas con Chispas de Chocolate",
  "Brownies Clásicos",
  "Cuadritos de Arroz Inflado",
],
      ingredients: `4 Tbsp de aceite de oliva, dividido
3 Tbsp de harina de maíz
1 lb de masa de pizza preparada
1 lb de salchicha italiana molida suave
3 Tbsp de sazonador italiano
1 frasco (13 oz) de salsa para pizza
4 cups de queso mozzarella rallado`,
      instructions: `Precalienta el horno a 400°F.
Rocía 3 Tbsp de aceite de oliva sobre una bandeja grande para hornear y extiéndelo para cubrirla de manera uniforme.
Espolvorea 3 Tbsp de harina de maíz sobre la bandeja.

Estira la masa de pizza en forma de rectángulo para que quepa en la bandeja.
Si la masa se resiste a estirarse, déjala reposar 5 minutos y continúa.

Calienta la 1 Tbsp restante de aceite de oliva en un sartén a fuego medio-alto.
Agrega la salchicha y 3 Tbsp de sazonador italiano.
Cocina de 7 a 8 minutos, hasta que esté dorada y ya no esté rosada.
Escurre el exceso de grasa.

Hornea solo la base de pizza de 7 a 8 minutos, hasta que ya no se vea húmeda y empiece a dorarse ligeramente.
Retira del horno.

Extiende la salsa para pizza de manera uniforme sobre la base, llegando hasta los bordes.
Espolvorea la salchicha cocida de manera uniforme sobre la salsa.
Cubre con 4 cups de queso mozzarella rallado.

Regresa al horno y hornea de 8 a 10 minutos, hasta que el queso se derrita y esté ligeramente dorado.
Retira y corta en 8 rectángulos.
Sirve caliente.`,
    },
  },
},

{
  id: "big-shotgun-shells",
  slug: "big-shotgun-shells",
  name: "Shotgun Shells",
  effort: "big",
  photoUrl: "/images/big-shotgun-shells.jpg",
  tags: ["dinner", "beef", "pork", "bbq", "bake", "party", "comfort", "game-day"],
  // Shotgun Shells
suggestedSides: [
  "Baked beans",
  "Coleslaw",
  "Macaroni salad",
],
suggestedDesserts: [ "Apple Crisp", "Campfire Banana Boats", "Chocolate Chip Cookies", ],
  notes: "A big-flavor BBQ dinner that is fun for weekends, cookouts, or game day.",
  ingredients: `2 (8 oz) boxes manicotti shells (uncooked)
1 1/2 lb ground beef
1 lb hot Italian sausage
1 medium red onion, finely diced
2 cups colby jack cheese, shredded
6 oz cream cheese, softened
1 jalapeno, finely diced
2 tsp Cajun seasoning
2 tsp garlic powder
2 tsp pepper
1 tsp red pepper flakes
3 (12 oz) packages bacon
1/2 cup barbecue sauce (plus extra for brushing)`,
  instructions: `Preheat oven to 300°F.
Line a baking sheet with aluminum foil and place a wire rack on top.

In a large bowl, mix together 1 1/2 lb ground beef, 1 lb hot Italian sausage, 1 medium onion, 2 cups colby jack cheese, 6 oz cream cheese, 1 jalapeno, 2 tsp Cajun seasoning, 2 tsp garlic powder, 2 tsp pepper, and 1 tsp red pepper flakes until fully combined.

Gently stuff uncooked manicotti shells from both ends, making sure there are no air pockets.

Wrap each stuffed shell tightly with bacon, covering the ends completely. You may need two pieces of bacon per shell.

Brush additional barbecue sauce over both sides of each wrapped shell.

Place shells on prepared rack and bake for 60 minutes.

Flip shells over, brush with more barbecue sauce, and bake an additional 60 to 70 minutes until bacon is crispy and cooked through.

Serve hot.`,
  translations: {
    es: {
      name: "Conchas rellenas envueltas en tocino",
      notes:
        "Una cena BBQ llena de sabor, perfecta para fines de semana, parrilladas o día de partido.",
      tags: [
        "cena",
        "carne de res",
        "cerdo",
        "bbq",
        "horneado",
        "fiesta",
        "comida reconfortante",
        "día de partido",
      ],
      suggestedSides: [
        "Frijoles horneados",
        "Ensalada de col",
        "Ensalada de macarrones",
      ],
      suggestedDesserts: [ "Crumble de Manzana", "Bananas de Fogata", "Galletas con Chispas de Chocolate", ],
      ingredients: `2 cajas (8 oz) de conchas manicotti, sin cocinar
1 1/2 lb de carne molida de res
1 lb de salchicha italiana picante
1 cebolla roja mediana, finamente picada
2 cups de queso colby jack rallado
6 oz de queso crema, suavizado
1 jalapeño, finamente picado
2 tsp de sazonador cajún
2 tsp de ajo en polvo
2 tsp de pimienta
1 tsp de hojuelas de chile rojo
3 paquetes (12 oz) de tocino
1/2 cup de salsa barbecue, más extra para barnizar`,
      instructions: `Precalienta el horno a 300°F.
Cubre una bandeja para hornear con papel aluminio y coloca una rejilla encima.

En un tazón grande, mezcla 1 1/2 lb de carne molida, 1 lb de salchicha italiana picante, 1 cebolla mediana, 2 cups de queso colby jack, 6 oz de queso crema, 1 jalapeño, 2 tsp de sazonador cajún, 2 tsp de ajo en polvo, 2 tsp de pimienta y 1 tsp de hojuelas de chile rojo hasta que todo esté bien combinado.

Rellena suavemente las conchas manicotti sin cocinar por ambos extremos, asegurándote de que no queden bolsas de aire.

Envuelve cada concha rellena firmemente con tocino, cubriendo completamente los extremos. Puede que necesites dos piezas de tocino por concha.

Barniza ambos lados de cada concha envuelta con más salsa barbecue.

Coloca las conchas sobre la rejilla preparada y hornea durante 60 minutos.

Voltea las conchas, barniza con más salsa barbecue y hornea de 60 a 70 minutos más, hasta que el tocino esté crujiente y bien cocido.

Sirve caliente.`,
    },
  },
},

{
  id: "cajun-shrimp-sausage-potato-bake",
  slug: "cajun-shrimp-sausage-potato-bake",
  name: "Cajun Shrimp and Sausage Potato Bake",
  ingredients: `Main Dish:
3 lbs red potatoes, cubed
4 jalapeño smoked sausages, sliced into medallions
1 lb shrimp, peeled and deveined
1 (14 oz) can corn, drained
1 green bell pepper, diced
1 red bell pepper, diced
1 yellow onion, diced
4 tbsp butter, divided
2 tbsp garlic, minced
1 tbsp olive oil

Seasonings:
1 tsp paprika
1 tbsp Italian seasoning
1 tbsp dried rosemary
1 tbsp dried thyme
1/2 tsp cayenne pepper`,
  instructions: `Preheat oven to 400°F.

Cube 3 lbs red potatoes.

Slice 4 jalapeño smoked sausages into medallions.

Dice 1 green bell pepper, 1 red bell pepper, and 1 yellow onion.

In a large bowl, combine the potatoes, sausage, corn, bell peppers, and onion.

Drizzle with 1 tbsp olive oil.

Add 2 tbsp minced garlic, 1 tsp paprika, 1 tbsp Italian seasoning, 1 tbsp dried rosemary, 1 tbsp dried thyme, and 1/2 tsp cayenne pepper.

Toss until everything is evenly coated.

Place 4 tbsp butter into the bottom of a large roasting pan, dividing it into 4 pieces.

Pour the potato mixture into the roasting pan and spread evenly.

Bake for 20 minutes.

Remove from the oven and stir.

Bake for another 20 minutes.

Remove from the oven and stir again.

Add 1 lb shrimp and mix into the pan.

Return to the oven and bake for 5 additional minutes, until the shrimp are pink and cooked through.

Serve warm.`,
  photoUrl: "/images/cajun-shrimp-sausage-potato-bake.webp",
  effort: "normal",
  tags: [
    "dinner",
    "shrimp",
    "sausage",
    "cajun",
    "one-pan",
    "oven",
    "comfort",
    "family"
  ],
  suggestedSides: [
    "cornbread",
    "side-salad",
    "coleslaw"
  ],
  translations: {
    es: {
      name: "Horneado Cajún de Camarones, Salchicha y Papas",
      suggestedSides: [
        "pan de maíz",
        "ensalada",
        "ensalada de col"
      ],
      ingredients: `Plato Principal:
3 libras de papas rojas en cubos
4 salchichas ahumadas con jalapeño en rodajas
1 libra de camarones pelados y limpios
1 lata (14 oz) de maíz escurrido
1 pimiento verde picado
1 pimiento rojo picado
1 cebolla amarilla picada
4 cucharadas de mantequilla, divididas
2 cucharadas de ajo picado
1 cucharada de aceite de oliva

Condimentos:
1 cucharadita de paprika
1 cucharada de condimento italiano
1 cucharada de romero seco
1 cucharada de tomillo seco
1/2 cucharadita de pimienta de cayena`,
      instructions: `Precalienta el horno a 400°F.

Corta 3 libras de papas rojas en cubos.

Corta 4 salchichas ahumadas con jalapeño en rodajas.

Pica 1 pimiento verde, 1 pimiento rojo y 1 cebolla amarilla.

En un recipiente grande mezcla las papas, la salchicha, el maíz, los pimientos y la cebolla.

Agrega 1 cucharada de aceite de oliva.

Añade 2 cucharadas de ajo picado, 1 cucharadita de paprika, 1 cucharada de condimento italiano, 1 cucharada de romero seco, 1 cucharada de tomillo seco y 1/2 cucharadita de pimienta de cayena.

Mezcla bien hasta cubrir todos los ingredientes.

Coloca 4 cucharadas de mantequilla en el fondo de una charola para hornear grande.

Vierte la mezcla de papas en la charola y distribuye uniformemente.

Hornea durante 20 minutos.

Retira del horno y mezcla.

Hornea otros 20 minutos.

Retira nuevamente y mezcla.

Agrega 1 libra de camarones y revuelve para incorporarlos.

Hornea 5 minutos más hasta que los camarones estén rosados y completamente cocidos.

Sirve caliente.`,
      tags: [
        "cena",
        "camarones",
        "salchicha",
        "cajún",
        "una bandeja",
        "horno",
        "comfort",
        "familiar"
      ],
      notes: "Una comida completa en una sola bandeja con sabores cajunes, salchicha ahumada y camarones tiernos. Perfecta para alimentar a toda la familia con una limpieza mínima."
    }
  },
  isVegetarian: false,
  notes: "This one-pan Cajun-inspired dinner combines smoky sausage, tender shrimp, potatoes, and vegetables for a hearty family meal with minimal cleanup."
},

{
  id: "normal-classic-meatloaf",
  slug: "normal-classic-meatloaf",
  name: "Classic Meatloaf",
  effort: "normal",
  photoUrl: "/images/normal-classic-meatloaf.jpg",
  tags: ["dinner", "beef", "bake", "comfort", "classic", "family-friendly", "leftovers-friendly"],
  // Classic Meatloaf
suggestedSides: [
  "Mashed potatoes",
  "Green beans",
  "Dinner rolls",
],
suggestedDesserts: [ "Classic Brownies", "Apple Crisp", "Chocolate Chip Cookies", ],
  isVegetarian: false,
  notes: "Juicy, tender meatloaf with a sweet and tangy glaze. For extra flavor, sauté the onions and garlic before mixing. Great served with mashed potatoes and green beans.",
  ingredients: `1 1/2 lbs ground beef
1 cup breadcrumbs (or crushed crackers)
1/2 cup milk
1 small yellow onion, finely diced
2 cloves garlic, minced
2 large eggs
2 Tbsp ketchup
1 Tbsp worcestershire sauce
1 tsp salt
1/2 tsp pepper
1 tsp smoked paprika
1/2 tsp dried thyme
1/2 tsp dried parsley
1/2 tsp onion powder

FOR GLAZE
1/3 cup ketchup
2 Tbsp brown sugar
1 Tbsp worcestershire sauce
1 tsp mustard`,
  instructions: `Preheat oven to 375°F. Line a baking sheet with parchment paper or lightly grease a loaf pan.

In a large bowl, combine 1 cup breadcrumbs and 1/2 cup milk. Let sit for 2 to 3 minutes until absorbed.

Add ground beef, diced onion, garlic, eggs, 2 Tbsp ketchup, 1 Tbsp worcestershire sauce, 1 tsp salt, 1/2 tsp pepper, 1 tsp smoked paprika, 1/2 tsp thyme, 1/2 tsp parsley, and 1/2 tsp onion powder. Mix gently with your hands until just combined. Do not overmix.

Transfer the mixture to the prepared baking sheet or loaf pan. Shape into a loaf about 8 to 9 inches long.

In a small bowl, whisk together 1/3 cup ketchup, 2 Tbsp brown sugar, 1 Tbsp worcestershire sauce, and 1 tsp mustard. Spread half of the glaze over the meatloaf.

Bake for 40 minutes. Remove from the oven, spread the remaining glaze on top, and return to the oven.

Bake for an additional 15 to 25 minutes, until the internal temperature reaches 160°F and the glaze is caramelized.

Let rest for 10 minutes before slicing and serving.`,
  translations: {
    es: {
      name: "Pastel de carne clásico",
      notes:
        "Un pastel de carne jugoso y tierno con un glaseado dulce y ácido. Para más sabor, sofríe la cebolla y el ajo antes de mezclar. Queda muy bien con puré de papas y ejotes.",
      tags: [
        "cena",
        "carne de res",
        "horneado",
        "comida reconfortante",
        "clásico",
        "familiar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Puré de papas",
        "Ejotes",
        "Panecillos",
      ],
      suggestedDesserts: [ "Brownies Clásicos", "Crumble de Manzana", "Galletas con Chispas de Chocolate", ],
      ingredients: `1 1/2 lbs de carne molida de res
1 cup de pan molido o galletas saladas trituradas
1/2 cup de leche
1 cebolla amarilla pequeña, finamente picada
2 dientes de ajo, picados
2 huevos grandes
2 Tbsp de ketchup
1 Tbsp de salsa worcestershire
1 tsp de sal
1/2 tsp de pimienta
1 tsp de paprika ahumada
1/2 tsp de tomillo seco
1/2 tsp de perejil seco
1/2 tsp de cebolla en polvo

PARA EL GLASEADO
1/3 cup de ketchup
2 Tbsp de azúcar morena
1 Tbsp de salsa worcestershire
1 tsp de mostaza`,
      instructions: `Precalienta el horno a 375°F. Cubre una bandeja para hornear con papel pergamino o engrasa ligeramente un molde para pan.

En un tazón grande, combina 1 cup de pan molido y 1/2 cup de leche. Deja reposar de 2 a 3 minutos, hasta que se absorba.

Agrega la carne molida, la cebolla picada, el ajo, los huevos, 2 Tbsp de ketchup, 1 Tbsp de salsa worcestershire, 1 tsp de sal, 1/2 tsp de pimienta, 1 tsp de paprika ahumada, 1/2 tsp de tomillo, 1/2 tsp de perejil y 1/2 tsp de cebolla en polvo. Mezcla suavemente con las manos hasta que apenas se combine. No mezcles demasiado.

Pasa la mezcla a la bandeja preparada o al molde para pan. Dale forma de pan de aproximadamente 8 a 9 inches de largo.

En un tazón pequeño, bate 1/3 cup de ketchup, 2 Tbsp de azúcar morena, 1 Tbsp de salsa worcestershire y 1 tsp de mostaza. Unta la mitad del glaseado sobre el pastel de carne.

Hornea durante 40 minutos. Retira del horno, unta el glaseado restante encima y regresa al horno.

Hornea de 15 a 25 minutos más, hasta que la temperatura interna alcance 160°F y el glaseado esté caramelizado.

Deja reposar 10 minutos antes de cortar y servir.`,
    },
  },
},

{
  id: "normal-tilapia-asparagus-foil-packets",
  slug: "normal-tilapia-asparagus-foil-packets",
  name: "Tilapia & Asparagus Foil Packets",
  effort: "normal",
  photoUrl: "/images/normal-tilapia-asparagus-foil-packets.jpg",
  tags: ["dinner", "seafood", "fish", "tilapia", "foil-packets", "bake", "healthy", "one-pan"],
  // Tilapia & Asparagus Foil Packets
suggestedSides: [
  "Rice pilaf",
  "Lemon potatoes",
  "Side salad",
],
  notes: "A light and easy fish dinner with almost no cleanup.",
  ingredients: `1 bunch asparagus
2 yellow squash
1/4 tsp garlic powder
4 tilapia fillets, thawed
1/4 tsp salt
1/4 tsp paprika
4 Tbsp butter
4 tsp lemon juice
1 tsp dried oregano`,
  instructions: `Preheat oven to 375°F.

Lay out four 2-foot sheets of aluminum foil.

Cut off end of asparagus and place slightly off-center on the foil, forming a base layer.
Top with sliced squash and sprinkle with 1/4 tsp garlic powder.

Place one tilapia fillet on top of the vegetables.
Season with 1/4 tsp salt and 1/4 tsp paprika.

Add 2 Tbsp butter on top of each fillet.
Drizzle with 2 tsp lemon juice.
Sprinkle with 1 tsp dried oregano.

Fold foil over and seal all three edges tightly to create a packet.

Place packets on a baking sheet or in glass baking dishes.

Bake for 20 minutes.

Carefully open packets. Steam will be hot. Remove from foil before serving.`,
  translations: {
    es: {
      name: "Paquetes de tilapia y espárragos en aluminio",
      notes:
        "Una cena ligera y fácil de pescado, con casi nada que limpiar.",
      tags: [
        "cena",
        "mariscos",
        "pescado",
        "tilapia",
        "paquetes de aluminio",
        "horneado",
        "saludable",
        "una bandeja",
      ],
      suggestedSides: [
        "Arroz pilaf",
        "Papas al limón",
        "Ensalada sencilla",
      ],
      ingredients: `1 manojo de espárragos
2 calabazas amarillas
1/4 tsp de ajo en polvo
4 filetes de tilapia, descongelados
1/4 tsp de sal
1/4 tsp de paprika
4 Tbsp de mantequilla
4 tsp de jugo de limón
1 tsp de orégano seco`,
      instructions: `Precalienta el horno a 375°F.

Extiende cuatro hojas de papel aluminio de 2 pies.

Corta los extremos de los espárragos y colócalos un poco fuera del centro sobre el aluminio, formando una capa base.
Cubre con calabaza rebanada y espolvorea 1/4 tsp de ajo en polvo.

Coloca un filete de tilapia encima de las verduras.
Sazona con 1/4 tsp de sal y 1/4 tsp de paprika.

Agrega 2 Tbsp de mantequilla encima de cada filete.
Rocía con 2 tsp de jugo de limón.
Espolvorea con 1 tsp de orégano seco.

Dobla el papel aluminio y sella bien los tres bordes para formar un paquete.

Coloca los paquetes en una bandeja para hornear o en moldes de vidrio.

Hornea durante 20 minutos.

Abre los paquetes con cuidado. El vapor estará caliente. Retira del aluminio antes de servir.`,
    },
  },
},

  {
  id: "normal-slow-cooker-beef-enchilada-casserole",
  slug: "normal-slow-cooker-beef-enchilada-casserole",
  name: "Slow Cooker Beef Enchilada Casserole",
  effort: "normal",
  photoUrl: "/images/normal-slow-cooker-beef-enchilada-casserole.jpg",
  tags: ["dinner", "beef", "slow-cooker", "casserole", "mexican", "comfort", "leftovers-friendly"],
  // Slow Cooker Beef Enchilada Casserole
suggestedSides: [
  "Cilantro lime rice",
  "Chips and salsa",
  "Mexican street corn",
],
  notes: "An easy crockpot dinner that is filling, cheesy, and great for busy evenings.",
  ingredients: `1 1/2 lbs lean ground beef
1 packet taco seasoning
1 (15 oz) can black beans, drained and rinsed
1 (28 oz) jar enchilada sauce
1 (4 oz) can green chilies
1 white onion, diced
10 (6-inch) corn tortillas, cut into wedges
1 1/2 cups shredded Mexican cheese blend
cilantro, chopped
pico de gallo
sour cream`,
  instructions: `In a large skillet over medium-high heat, cook 1 1/2 lbs lean ground beef until browned.
Drain excess grease and stir in 1 packet of taco seasoning.

Transfer the seasoned beef to the slow cooker.
Add 28 oz enchilada sauce, 15 oz drained black beans, 4 oz green chilies, and 1 diced white onion.
Stir to combine.

Cover and cook on Low for 3 to 4 hours.

Stir in half of the corn tortilla wedges (5 tortillas) and 3/4 cup of the shredded Mexican cheese.
Layer the remaining tortilla wedges and the remaining 3/4 cup of cheese on top.

Cover and cook on High for about 30 minutes, or until the cheese is fully melted.

Garnish with chopped cilantro, pico de gallo, and sour cream before serving.`,
  translations: {
    es: {
      name: "Cazuela de enchiladas de res en olla lenta",
      notes:
        "Una cena fácil en olla lenta, llenadora, con mucho queso y perfecta para noches ocupadas.",
      tags: [
        "cena",
        "carne de res",
        "olla lenta",
        "cazuela",
        "mexicana",
        "comida reconfortante",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Arroz con cilantro y lima",
        "Totopos con salsa",
        "Elote estilo mexicano",
      ],
      ingredients: `1 1/2 lbs de carne molida de res magra
1 paquete de sazonador para tacos
1 lata (15 oz) de frijoles negros, escurridos y enjuagados
1 frasco (28 oz) de salsa para enchiladas
1 lata (4 oz) de chiles verdes
1 cebolla blanca, picada en cubitos
10 tortillas de maíz (6-inch), cortadas en triángulos
1 1/2 cups de mezcla de quesos mexicanos rallados
cilantro, picado
pico de gallo
crema agria`,
      instructions: `En un sartén grande a fuego medio-alto, cocina 1 1/2 lbs de carne molida de res magra hasta que esté dorada.
Escurre el exceso de grasa e incorpora 1 paquete de sazonador para tacos.

Pasa la carne sazonada a la olla lenta.
Agrega 28 oz de salsa para enchiladas, 15 oz de frijoles negros escurridos, 4 oz de chiles verdes y 1 cebolla blanca picada.
Mezcla para combinar.

Tapa y cocina en Low de 3 a 4 horas.

Agrega la mitad de los triángulos de tortilla de maíz (5 tortillas) y 3/4 cup de queso mexicano rallado.
Coloca encima los triángulos de tortilla restantes y el 3/4 cup restante de queso.

Tapa y cocina en High durante unos 30 minutos, o hasta que el queso esté completamente derretido.

Decora con cilantro picado, pico de gallo y crema agria antes de servir.`,
    },
  },
},

{
  id: "normal-shepherds-pie",
  slug: "normal-shepherds-pie",
  name: "Shepherd’s Pie",
  effort: "normal",
  photoUrl: "/images/normal-shepherds-pie.jpg",
  tags: ["dinner", "beef", "bake", "comfort", "casserole", "family-friendly", "leftovers-friendly"],
  // Shepherd’s Pie
suggestedSides: [
  "Dinner rolls",
  "Simple green salad",
  "Roasted carrots",
],
  notes: "A warm, classic comfort meal that feels right at home on chilly nights.",
  ingredients: `1 1/2 to 2 lbs potatoes (about 3 large), peeled and quartered
8 Tbsp butter (1 stick), divided
1 medium yellow onion, chopped
2 cups mixed vegetables (diced carrots, corn, peas)
1 1/2 lbs ground beef
1/2 cup beef broth
1 tsp worcestershire sauce
salt
pepper
8 oz baby bella mushrooms
2 cloves garlic`,
  instructions: `Place 1 1/2 to 2 lbs of peeled and quartered potatoes in a pot and cover with at least 1 inch of cold water. Add a teaspoon of salt. Bring to a boil, reduce to a simmer, and cook until tender, about 20 minutes.

While potatoes cook, melt 4 Tbsp butter in a large sauté pan over medium heat. Add 1 chopped medium onion and the diced carrots from the mixed vegetables and cook until tender, about 6 to 10 minutes.

Add 8 oz baby bella mushrooms and 2 cloves garlic; cook 2 to 3 minutes until mushrooms soften.

Add 1 1/2 lbs ground beef, along with the remaining corn and peas from the mixed vegetables. Cook until the beef is no longer pink. Season with salt and pepper.

Stir in 1 tsp worcestershire sauce and 1/2 cup beef broth. Bring to a simmer, reduce heat to low, and cook uncovered for about 10 minutes. Add a splash more broth if needed to keep it from drying out.

Drain the potatoes and place in a bowl with the remaining 4 Tbsp butter. Mash and season with salt and pepper to taste.

Preheat oven to 400°F. Spread the beef mixture in an even layer in an 8x13 baking dish.

Spread the mashed potatoes over the top. Rough up the surface with a fork to create peaks.

Bake about 30 minutes until browned and bubbling.`,
  translations: {
    es: {
      name: "Pastel de carne con puré",
      notes:
        "Una comida clásica, cálida y reconfortante que queda perfecta para noches frías.",
      tags: [
        "cena",
        "carne de res",
        "horneado",
        "comida reconfortante",
        "cazuela",
        "familiar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Panecillos",
        "Ensalada verde sencilla",
        "Zanahorias rostizadas",
      ],
      ingredients: `1 1/2 a 2 lbs de papas (aprox. 3 grandes), peladas y cortadas en cuartos
8 Tbsp de mantequilla (1 barra), dividida
1 cebolla amarilla mediana, picada
2 cups de verduras mixtas (zanahorias en cubitos, maíz, chícharos)
1 1/2 lbs de carne molida de res
1/2 cup de caldo de res
1 tsp de salsa worcestershire
sal
pimienta
8 oz de champiñones baby bella
2 dientes de ajo`,
      instructions: `Coloca 1 1/2 a 2 lbs de papas peladas y cortadas en cuartos en una olla y cúbrelas con al menos 1 inch de agua fría. Agrega 1 tsp de sal. Lleva a hervor, reduce a fuego bajo y cocina hasta que estén tiernas, unos 20 minutos.

Mientras se cocinan las papas, derrite 4 Tbsp de mantequilla en un sartén grande a fuego medio. Agrega 1 cebolla mediana picada y las zanahorias en cubitos de las verduras mixtas, y cocina hasta que estén tiernas, de 6 a 10 minutos.

Agrega 8 oz de champiñones baby bella y 2 dientes de ajo; cocina de 2 a 3 minutos, hasta que los champiñones se ablanden.

Agrega 1 1/2 lbs de carne molida de res, junto con el maíz y los chícharos restantes de las verduras mixtas. Cocina hasta que la carne ya no esté rosada. Sazona con sal y pimienta.

Incorpora 1 tsp de salsa worcestershire y 1/2 cup de caldo de res. Lleva a hervor suave, reduce el fuego a bajo y cocina sin tapar unos 10 minutos. Agrega un poco más de caldo si es necesario para que no se seque.

Escurre las papas y colócalas en un tazón con las 4 Tbsp restantes de mantequilla. Machaca y sazona con sal y pimienta al gusto.

Precalienta el horno a 400°F. Extiende la mezcla de carne en una capa uniforme en un molde para hornear de 8x13.

Extiende el puré de papas encima. Raspa ligeramente la superficie con un tenedor para crear picos.

Hornea unos 30 minutos, hasta que esté dorado y burbujeante.`,
    },
  },
},

{
  id: "normal-italian-sausage-stuffed-peppers",
  slug: "normal-italian-sausage-stuffed-peppers",
  name: "Italian Sausage Stuffed Peppers",
  effort: "normal",
  photoUrl: "/images/normal-italian-sausage-stuffed-peppers.jpg",
  tags: ["dinner", "pork", "italian", "bake", "stuffed-peppers", "comfort", "family-friendly"],
  // Italian Sausage Stuffed Peppers
suggestedSides: [
  "Garlic bread",
  "Caesar salad",
  "Roasted zucchini",
],
  notes: "A solid weeknight baked dinner that is filling without being too fussy.",
  ingredients: `1 lb Italian sausage
2 tsp olive oil
1 (14.5 oz) can fire-roasted diced tomatoes
2 tsp garlic powder
2 tsp onion powder
2 tsp Italian seasoning
1 tsp worcestershire sauce
1 1/2 cups rice, cooked
1/4 cup chicken broth
1/4 cup grated Parmesan cheese
1 cup mozzarella cheese, grated
3 large bell peppers
red pepper flakes
fresh basil`,
  instructions: `Preheat oven to 375°F.

Cut around the stem of 3 large bell peppers and remove it. Slice peppers in half lengthwise and remove seeds and white membrane. Place cut-side up in a baking dish.

Heat 2 tsp olive oil in a large skillet over medium-high heat. Brown 1 lb Italian sausage, breaking into small pieces, about 3 to 4 minutes. Drain grease if needed.

Add 1 (14.5 oz) can fire-roasted diced tomatoes, 2 tsp garlic powder, 2 tsp onion powder, 2 tsp Italian seasoning, 1 tsp worcestershire sauce, 1/4 cup chicken broth, and 1 1/2 cups cooked rice. Stir to combine and bring to a simmer. Cook 3 to 4 minutes until liquid is mostly gone.

Stir in 1/4 cup grated Parmesan cheese and remove from heat.

Fill pepper halves with sausage mixture and top with 1 cup grated mozzarella cheese.

Cover with foil and bake 25 to 30 minutes, or longer if you like softer peppers, until peppers are tender.

Remove foil and broil 2 to 3 minutes until cheese is browned.

Cool 1 to 2 minutes. Top with fresh basil and red pepper flakes if desired and serve.`,
  translations: {
    es: {
      name: "Pimientos rellenos de salchicha italiana",
      notes:
        "Una cena horneada para entre semana, llenadora y sin complicarse demasiado.",
      tags: [
        "cena",
        "cerdo",
        "italiana",
        "horneado",
        "pimientos rellenos",
        "comida reconfortante",
        "familiar",
      ],
      suggestedSides: [
        "Pan de ajo",
        "Ensalada César",
        "Calabacita rostizada",
      ],
      ingredients: `1 lb de salchicha italiana
2 tsp de aceite de oliva
1 lata (14.5 oz) de tomates asados en cubitos
2 tsp de ajo en polvo
2 tsp de cebolla en polvo
2 tsp de sazonador italiano
1 tsp de salsa worcestershire
1 1/2 cups de arroz cocido
1/4 cup de caldo de pollo
1/4 cup de queso parmesano rallado
1 cup de queso mozzarella rallado
3 pimientos grandes
hojuelas de chile rojo
albahaca fresca`,
      instructions: `Precalienta el horno a 375°F.

Corta alrededor del tallo de 3 pimientos grandes y retíralo. Corta los pimientos por la mitad a lo largo y quita las semillas y la membrana blanca. Colócalos con el corte hacia arriba en un molde para hornear.

Calienta 2 tsp de aceite de oliva en un sartén grande a fuego medio-alto. Dora 1 lb de salchicha italiana, separándola en trozos pequeños, unos 3 a 4 minutos. Escurre la grasa si es necesario.

Agrega 1 lata (14.5 oz) de tomates asados en cubitos, 2 tsp de ajo en polvo, 2 tsp de cebolla en polvo, 2 tsp de sazonador italiano, 1 tsp de salsa worcestershire, 1/4 cup de caldo de pollo y 1 1/2 cups de arroz cocido. Mezcla para combinar y lleva a hervor suave. Cocina de 3 a 4 minutos, hasta que casi no quede líquido.

Incorpora 1/4 cup de queso parmesano rallado y retira del fuego.

Rellena las mitades de pimiento con la mezcla de salchicha y cubre con 1 cup de queso mozzarella rallado.

Cubre con papel aluminio y hornea de 25 a 30 minutos, o más si prefieres los pimientos más suaves, hasta que estén tiernos.

Retira el papel aluminio y gratina de 2 a 3 minutos, hasta que el queso esté dorado.

Deja enfriar de 1 a 2 minutos. Agrega albahaca fresca y hojuelas de chile rojo si deseas, y sirve.`,
    },
  },
},

{
  id: "quick-honey-garlic-chicken",
  slug: "quick-honey-garlic-chicken",
  name: "Honey Garlic Chicken",
  effort: "quick",
  photoUrl: "/images/quick-honey-garlic-chicken.jpg",
  tags: ["dinner", "chicken", "quick", "one-pan", "sweet-savory", "weeknight", "leftovers-friendly"],
  isVegetarian: false,
  // Honey Garlic Chicken
suggestedSides: [
  "Steamed rice",
  "Broccoli",
  "Cucumber salad",
],
suggestedDesserts: [
  "Dark Chocolate Dipped Strawberries",
  "No-Bake Cheesecake Cups",
  "Chocolate Mug Cake",
],
  notes: "Fast and flavorful honey garlic chicken with a sticky, glossy sauce. Great served over rice with steamed broccoli or stir-fried vegetables.",
  ingredients: `1 1/2 lbs boneless, skinless chicken breast
2 Tbsp cornstarch (optional)
1 Tbsp olive oil
1/2 tsp salt
1/2 tsp pepper
1/3 cup honey
1/4 cup soy sauce
4 cloves garlic, minced
1 Tbsp fresh ginger, grated (or 1/2 tsp ground ginger)
1 Tbsp rice vinegar (or apple cider vinegar)
1 tsp sesame oil (optional)
1 tsp cornstarch + 2 Tbsp water (for slurry)
2 green onions, sliced
1 tsp sesame seeds (optional)`,
  instructions: `Pat 1 1/2 lbs boneless, skinless chicken breast dry and cut into bite-sized pieces. Season with 1/2 tsp salt and 1/2 tsp pepper, then toss lightly with 2 Tbsp cornstarch if using.

Heat 1 Tbsp olive oil in a large skillet or cast iron pan over medium-high heat. Add chicken in a single layer and cook for 4 to 5 minutes without moving, until a deep golden-brown crust forms. Flip and cook another 3 to 4 minutes until nearly cooked through.

Reduce heat to medium. Add 4 cloves minced garlic and 1 Tbsp fresh grated ginger to the pan and cook for 30 to 60 seconds until fragrant.

Pour in 1/3 cup honey, 1/4 cup soy sauce, 1 Tbsp rice vinegar, and 1 tsp sesame oil. Stir well, scraping up any browned bits from the pan.

Bring the sauce to a gentle simmer. Mix 1 tsp cornstarch with 2 Tbsp water to create a slurry.

Stir the cornstarch slurry into the pan and cook for 2 to 3 minutes, stirring frequently, until the sauce thickens and becomes glossy.

Remove from heat and toss the chicken until fully coated in the sauce.

Garnish with 2 sliced green onions and 1 tsp sesame seeds before serving.`,
  translations: {
    es: {
      name: "Pollo con miel y ajo",
      notes:
        "Pollo rápido y lleno de sabor con salsa de miel y ajo, pegajosa y brillante. Queda muy bien sobre arroz con brócoli al vapor o verduras salteadas.",
      tags: [
        "cena",
        "pollo",
        "rápido",
        "una sartén",
        "dulce y salado",
        "entre semana",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Arroz al vapor",
        "Brócoli",
        "Ensalada de pepino",
      ],
      suggestedDesserts: [
  "Fresas cubiertas con chocolate oscuro",
  "Vasitos de Cheesecake Sin Horno",
  "Pastel de Chocolate en Taza",
],
      ingredients: `1 1/2 lbs de pechuga de pollo sin hueso y sin piel
2 Tbsp de maicena, opcional
1 Tbsp de aceite de oliva
1/2 tsp de sal
1/2 tsp de pimienta
1/3 cup de miel
1/4 cup de salsa de soya
4 dientes de ajo, picados
1 Tbsp de jengibre fresco, rallado, o 1/2 tsp de jengibre molido
1 Tbsp de vinagre de arroz o vinagre de manzana
1 tsp de aceite de sésamo, opcional
1 tsp de maicena + 2 Tbsp de agua para espesar
2 cebollines, rebanados
1 tsp de semillas de sésamo, opcional`,
      instructions: `Seca 1 1/2 lbs de pechuga de pollo sin hueso y sin piel, y córtala en trozos pequeños. Sazona con 1/2 tsp de sal y 1/2 tsp de pimienta, luego mezcla ligeramente con 2 Tbsp de maicena si la usas.

Calienta 1 Tbsp de aceite de oliva en un sartén grande o de hierro fundido a fuego medio-alto. Agrega el pollo en una sola capa y cocina de 4 a 5 minutos sin moverlo, hasta que se forme una costra dorada. Voltea y cocina otros 3 a 4 minutos, hasta que esté casi cocido.

Reduce el fuego a medio. Agrega 4 dientes de ajo picados y 1 Tbsp de jengibre fresco rallado al sartén, y cocina de 30 a 60 segundos, hasta que suelte aroma.

Agrega 1/3 cup de miel, 1/4 cup de salsa de soya, 1 Tbsp de vinagre de arroz y 1 tsp de aceite de sésamo. Mezcla bien, raspando los trozos dorados del fondo del sartén.

Lleva la salsa a un hervor suave. Mezcla 1 tsp de maicena con 2 Tbsp de agua para formar una mezcla espesante.

Incorpora la mezcla de maicena al sartén y cocina de 2 a 3 minutos, revolviendo con frecuencia, hasta que la salsa espese y quede brillante.

Retira del fuego y revuelve el pollo hasta cubrirlo completamente con la salsa.

Decora con 2 cebollines rebanados y 1 tsp de semillas de sésamo antes de servir.`,
    },
  },
},

{
  id: "quick-lemon-butter-salmon",
  slug: "quick-lemon-butter-salmon",
  name: "Lemon Butter Salmon",
  effort: "quick",
  photoUrl: "/images/quick-lemon-butter-salmon.jpg",
  tags: ["dinner", "seafood", "fish", "salmon", "quick", "healthy", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  // Lemon Butter Salmon
suggestedSides: [
  "Rice pilaf",
  "Roasted asparagus",
  "Simple green salad",
],
  notes: "Quick, restaurant-quality salmon with a rich lemon butter sauce. Crispy on the outside, tender inside. Excellent with rice, roasted vegetables, or a light salad.",
  ingredients: `4 salmon fillets (about 6 oz each, skin-on preferred)
1/2 tsp salt
1/2 tsp pepper
1 Tbsp olive oil
3 Tbsp unsalted butter
3 cloves garlic, minced
juice of 1 lemon
1 tsp lemon zest
1 Tbsp fresh parsley`,
  instructions: `Pat 4 salmon fillets (about 6 oz each) dry with paper towels. Season both sides with 1/2 tsp salt and 1/2 tsp pepper.

Heat 1 Tbsp olive oil in a large skillet (preferably cast iron or stainless steel) over medium-high heat.

Once the oil is hot and shimmering, place the salmon skin-side down. Press gently with a spatula for the first 30 seconds to prevent curling.

Cook undisturbed for 4 to 5 minutes, until the skin is crispy and a golden crust forms. The salmon should be mostly opaque about two-thirds up the sides.

Flip carefully and cook another 2 to 3 minutes, until just cooked through and flaky.

Reduce heat to medium-low. Add 3 Tbsp unsalted butter to the pan and let it melt. Stir in 3 cloves minced garlic and cook for 30 to 60 seconds until fragrant but not browned.

Squeeze in the juice of 1 lemon and add 1 tsp lemon zest if using. Spoon the lemon butter sauce over the salmon continuously for about 1 minute.

Remove from heat. Garnish with 1 Tbsp chopped fresh parsley and serve immediately.`,
  translations: {
    es: {
      name: "Salmón con mantequilla y limón",
      notes:
        "Salmón rápido con calidad de restaurante y una rica salsa de mantequilla con limón. Crujiente por fuera y tierno por dentro. Excelente con arroz, verduras asadas o una ensalada ligera.",
      tags: [
        "cena",
        "mariscos",
        "pescado",
        "salmón",
        "rápido",
        "saludable",
        "una sartén",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Arroz pilaf",
        "Espárragos rostizados",
        "Ensalada verde sencilla",
      ],
      ingredients: `4 filetes de salmón (aprox. 6 oz cada uno, con piel preferiblemente)
1/2 tsp de sal
1/2 tsp de pimienta
1 Tbsp de aceite de oliva
3 Tbsp de mantequilla sin sal
3 dientes de ajo, picados
jugo de 1 limón
1 tsp de ralladura de limón
1 Tbsp de perejil fresco`,
      instructions: `Seca 4 filetes de salmón (aprox. 6 oz cada uno) con toallas de papel. Sazona ambos lados con 1/2 tsp de sal y 1/2 tsp de pimienta.

Calienta 1 Tbsp de aceite de oliva en un sartén grande, preferiblemente de hierro fundido o acero inoxidable, a fuego medio-alto.

Cuando el aceite esté caliente y brillante, coloca el salmón con la piel hacia abajo. Presiona suavemente con una espátula durante los primeros 30 segundos para evitar que se curve.

Cocina sin mover de 4 a 5 minutos, hasta que la piel esté crujiente y se forme una costra dorada. El salmón debe verse opaco en unas dos terceras partes de los lados.

Voltea con cuidado y cocina otros 2 a 3 minutos, hasta que esté apenas cocido y se desmenuce fácilmente.

Reduce el fuego a medio-bajo. Agrega 3 Tbsp de mantequilla sin sal al sartén y deja que se derrita. Incorpora 3 dientes de ajo picados y cocina de 30 a 60 segundos, hasta que suelte aroma pero no se dore.

Exprime el jugo de 1 limón y agrega 1 tsp de ralladura de limón si la usas. Baña el salmón con la salsa de mantequilla y limón continuamente durante aproximadamente 1 minuto.

Retira del fuego. Decora con 1 Tbsp de perejil fresco picado y sirve de inmediato.`,
    },
  },
},

  {
  id: "quick-chicken-fried-rice",
  slug: "quick-chicken-fried-rice",
  name: "Chicken Fried Rice",
  effort: "quick",
  photoUrl: "/images/quick-chicken-fried-rice.jpg",
  tags: ["dinner", "chicken", "rice", "one-pan", "quick", "takeout-style", "leftovers-friendly"],
  isVegetarian: false,
  // Chicken Fried Rice
suggestedSides: [
  "Egg rolls",
  "Cucumber salad",
  "Steamed edamame",
],
  notes: "Quick and flavorful fried rice using leftover chicken and rice. For best texture, use cold, day-old rice so it crisps up instead of getting mushy.",
  ingredients: `2 cups cooked and chilled rice (day-old preferred)
1 lb cooked chicken, diced (or rotisserie chicken)
2 eggs, beaten
1 cup frozen mixed vegetables
2 Tbsp soy sauce (plus more to taste)
1 Tbsp sesame oil
1 Tbsp vegetable oil
2 green onions, sliced
2 cloves garlic, minced
1 tsp fresh ginger, grated
1/2 tsp pepper`,
  instructions: `Heat a large skillet or wok over medium-high heat. Add 1 Tbsp vegetable oil.

Pour in 2 beaten eggs and scramble quickly until just set, about 1 minute. Remove from the pan and set aside.

In the same pan, add 2 cloves minced garlic and 1 tsp grated ginger. Cook for 30 seconds until fragrant.

Add 1 cup frozen mixed vegetables and cook for 2 to 3 minutes until heated through and slightly tender.

Add 2 cups cooked and chilled rice, breaking up any clumps with a spatula. Cook for 3 to 4 minutes, stirring occasionally, until the rice is hot and lightly crisped in spots.

Stir in 1 lb diced cooked chicken and cook for another 2 to 3 minutes until heated through.

Add 2 Tbsp soy sauce, 1 Tbsp sesame oil, and 1/2 tsp pepper. Toss everything together until evenly coated.

Return the scrambled eggs to the pan and gently fold them in.

Remove from heat, sprinkle with 2 sliced green onions, and serve immediately.`,
  translations: {
    es: {
      name: "Arroz frito con pollo",
      notes:
        "Arroz frito rápido y lleno de sabor usando pollo y arroz sobrantes. Para mejor textura, usa arroz frío del día anterior para que se dore en lugar de ponerse blando.",
      tags: [
        "cena",
        "pollo",
        "arroz",
        "una sartén",
        "rápido",
        "estilo comida para llevar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Rollitos primavera",
        "Ensalada de pepino",
        "Edamame al vapor",
      ],
      ingredients: `2 cups de arroz cocido y frío, preferiblemente del día anterior
1 lb de pollo cocido, cortado en cubitos, o pollo rostizado
2 huevos, batidos
1 cup de verduras mixtas congeladas
2 Tbsp de salsa de soya, más al gusto
1 Tbsp de aceite de sésamo
1 Tbsp de aceite vegetal
2 cebollines, rebanados
2 dientes de ajo, picados
1 tsp de jengibre fresco, rallado
1/2 tsp de pimienta`,
      instructions: `Calienta un sartén grande o wok a fuego medio-alto. Agrega 1 Tbsp de aceite vegetal.

Vierte 2 huevos batidos y revuelve rápidamente hasta que apenas cuajen, aproximadamente 1 minuto. Retira del sartén y reserva.

En el mismo sartén, agrega 2 dientes de ajo picados y 1 tsp de jengibre rallado. Cocina 30 segundos, hasta que suelte aroma.

Agrega 1 cup de verduras mixtas congeladas y cocina de 2 a 3 minutos, hasta que estén calientes y ligeramente tiernas.

Agrega 2 cups de arroz cocido y frío, separando los grumos con una espátula. Cocina de 3 a 4 minutos, revolviendo de vez en cuando, hasta que el arroz esté caliente y ligeramente crujiente en algunas partes.

Incorpora 1 lb de pollo cocido en cubitos y cocina otros 2 a 3 minutos, hasta que esté caliente.

Agrega 2 Tbsp de salsa de soya, 1 Tbsp de aceite de sésamo y 1/2 tsp de pimienta. Mezcla todo hasta que quede cubierto de manera uniforme.

Regresa los huevos revueltos al sartén e incorpóralos suavemente.

Retira del fuego, espolvorea 2 cebollines rebanados y sirve de inmediato.`,
    },
  },
},

{
  id: "quick-bbq-chicken-flatbread",
  slug: "quick-bbq-chicken-flatbread",
  name: "BBQ Chicken Flatbread",
  effort: "quick",
  photoUrl: "/images/quick-bbq-chicken-flatbread.jpg",
  tags: ["dinner", "chicken", "quick", "flatbread", "pizza", "kid-friendly", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  // BBQ Chicken Flatbread
suggestedSides: [
  "Coleslaw",
  "Corn on the cob",
  "Fruit salad",
],
  notes: "A quick, fun flatbread loaded with BBQ chicken and melty cheese. Great for using leftover or rotisserie chicken and easy to customize with your favorite toppings.",
  ingredients: `2 flatbreads or naan
1 cup cooked chicken, shredded (rotisserie works great)
1/2 cup BBQ sauce (plus extra for drizzling)
1/2 small red onion, thinly sliced
1 cup mozzarella cheese, shredded
1/2 cup smoked gouda or cheddar cheese (optional, for more flavor)
1 Tbsp olive oil
1 Tbsp fresh cilantro, chopped (optional)
1/2 tsp garlic powder`,
  instructions: `Preheat oven to 400°F. Place 2 flatbreads on a baking sheet and lightly brush the edges with 1 Tbsp olive oil.

Spread 1/2 cup BBQ sauce evenly over each flatbread, leaving a small border around the edges.

Toss 1 cup shredded cooked chicken with a spoonful of BBQ sauce for extra flavor, then distribute evenly over the flatbreads.

Top with 1/2 small red onion, 1 cup shredded mozzarella, and 1/2 cup smoked gouda or cheddar.

Sprinkle lightly with 1/2 tsp garlic powder.

Bake for 8 to 10 minutes, until the cheese is fully melted, bubbly, and starting to brown on the edges.

For extra caramelization, broil on high for 1 to 2 minutes, watching closely so it doesn’t burn.

Remove from the oven, drizzle with additional BBQ sauce if desired, and sprinkle with 1 Tbsp chopped fresh cilantro.

Slice and serve immediately.`,
  translations: {
    es: {
      name: "Pan plano con pollo BBQ",
      notes:
        "Un pan plano rápido y divertido con pollo BBQ y queso derretido. Ideal para usar pollo sobrante o rostizado, y fácil de personalizar con tus ingredientes favoritos.",
      tags: [
        "cena",
        "pollo",
        "rápido",
        "pan plano",
        "pizza",
        "para niños",
        "una bandeja",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Ensalada de col",
        "Elote",
        "Ensalada de frutas",
      ],
      ingredients: `2 panes planos o naan
1 cup de pollo cocido, deshebrado; el pollo rostizado funciona muy bien
1/2 cup de salsa BBQ, más extra para rociar
1/2 cebolla roja pequeña, rebanada finamente
1 cup de queso mozzarella rallado
1/2 cup de queso gouda ahumado o cheddar, opcional para más sabor
1 Tbsp de aceite de oliva
1 Tbsp de cilantro fresco, picado, opcional
1/2 tsp de ajo en polvo`,
      instructions: `Precalienta el horno a 400°F. Coloca 2 panes planos en una bandeja para hornear y barniza ligeramente los bordes con 1 Tbsp de aceite de oliva.

Extiende 1/2 cup de salsa BBQ de manera uniforme sobre cada pan plano, dejando un borde pequeño alrededor.

Mezcla 1 cup de pollo cocido deshebrado con una Tbsp de salsa BBQ para más sabor, luego distribúyelo de manera uniforme sobre los panes.

Cubre con 1/2 cebolla roja pequeña, 1 cup de mozzarella rallada y 1/2 cup de gouda ahumado o cheddar.

Espolvorea ligeramente con 1/2 tsp de ajo en polvo.

Hornea de 8 a 10 minutos, hasta que el queso esté completamente derretido, burbujeante y empiece a dorarse en los bordes.

Para más caramelización, gratina en alto de 1 a 2 minutos, vigilando de cerca para que no se queme.

Retira del horno, rocía con más salsa BBQ si deseas y espolvorea 1 Tbsp de cilantro fresco picado.

Corta y sirve de inmediato.`,
    },
  },
},

{
  id: "normal-baked-ziti",
  slug: "normal-baked-ziti",
  name: "Baked Ziti",
  effort: "normal",
  photoUrl: "/images/normal-baked-ziti.jpg",
  tags: ["dinner", "pasta", "beef", "bake", "comfort", "italian", "family-friendly", "leftovers-friendly"],
  isVegetarian: false,
  // Baked Ziti
suggestedSides: [
  "Garlic bread",
  "Caesar salad",
  "Roasted broccoli",
],
  notes: "A hearty, cheesy baked pasta layered with rich meat sauce. Perfect for feeding a crowd and excellent for leftovers—flavors deepen even more the next day.",
  ingredients: `1 lb ziti pasta
1 lb ground beef (or Italian sausage for more flavor)
1 (24 oz) jar marinara sauce
1/2 cup water (or reserved pasta water)
1 cup ricotta cheese
2 cups mozzarella cheese, shredded
1/2 cup Parmesan cheese, grated
1 small yellow onion, diced
2 cloves garlic, minced
1 Tbsp olive oil
1 tsp Italian seasoning
1/2 tsp salt
1/2 tsp pepper
1/4 cup fresh parsley, chopped (optional)`,
  instructions: `Preheat oven to 375°F. Lightly grease a 9x13 baking dish.

Bring a large pot of salted water to a boil. Cook 1 lb ziti pasta until just al dente, about 1 to 2 minutes less than package directions. Drain and set aside.

Heat 1 Tbsp olive oil in a large skillet over medium heat. Add 1 diced small yellow onion and cook for 4 to 5 minutes until softened.

Add 2 cloves minced garlic and cook for 30 seconds until fragrant.

Add 1 lb ground beef and cook until browned, breaking it apart as it cooks. Drain excess grease if needed.

Stir in 1 (24 oz) jar marinara sauce, 1/2 cup water, 1 tsp Italian seasoning, 1/2 tsp salt, and 1/2 tsp pepper. Simmer for 5 to 10 minutes until slightly thickened.

In a large bowl, combine the cooked pasta with most of the meat sauce, reserving about 1 cup for layering.

Spread a thin layer of sauce on the bottom of the baking dish. Add half of the pasta mixture, then dollop 1/2 cup ricotta and sprinkle with 1 cup mozzarella.

Repeat with the remaining pasta, 1/2 cup ricotta, and 1 cup mozzarella. Top with the reserved sauce and finish with 1/2 cup Parmesan cheese.

Cover loosely with foil and bake for 20 minutes. Remove foil and bake another 10 to 15 minutes until the cheese is melted and bubbly with lightly golden edges.

Let rest for 10 minutes before serving. Garnish with 1/4 cup fresh chopped parsley if desired.`,
  translations: {
    es: {
      name: "Ziti al horno",
      notes:
        "Una pasta horneada sustanciosa y llena de queso, con capas de salsa de carne. Perfecta para alimentar a varias personas y excelente para sobras; los sabores se intensifican aún más al día siguiente.",
      tags: [
        "cena",
        "pasta",
        "carne de res",
        "horneado",
        "comida reconfortante",
        "italiana",
        "familiar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Pan de ajo",
        "Ensalada César",
        "Brócoli asado",
      ],
      ingredients: `1 lb de pasta ziti
1 lb de carne molida de res, o salchicha italiana para más sabor
1 frasco (24 oz) de salsa marinara
1/2 cup de agua o agua reservada de la pasta
1 cup de queso ricotta
2 cups de queso mozzarella rallado
1/2 cup de queso parmesano rallado
1 cebolla amarilla pequeña, picada en cubitos
2 dientes de ajo, picados
1 Tbsp de aceite de oliva
1 tsp de sazonador italiano
1/2 tsp de sal
1/2 tsp de pimienta
1/4 cup de perejil fresco, picado, opcional`,
      instructions: `Precalienta el horno a 375°F. Engrasa ligeramente un molde para hornear de 9x13.

Hierve una olla grande con agua salada. Cocina 1 lb de pasta ziti hasta que esté apenas al dente, aproximadamente 1 a 2 minutos menos que las instrucciones del paquete. Escurre y reserva.

Calienta 1 Tbsp de aceite de oliva en un sartén grande a fuego medio. Agrega 1 cebolla amarilla pequeña picada y cocina de 4 a 5 minutos, hasta que se ablande.

Agrega 2 dientes de ajo picados y cocina 30 segundos, hasta que suelte aroma.

Agrega 1 lb de carne molida de res y cocina hasta que se dore, separándola mientras se cocina. Escurre el exceso de grasa si es necesario.

Incorpora 1 frasco (24 oz) de salsa marinara, 1/2 cup de agua, 1 tsp de sazonador italiano, 1/2 tsp de sal y 1/2 tsp de pimienta. Cocina a fuego bajo de 5 a 10 minutos, hasta que espese un poco.

En un tazón grande, mezcla la pasta cocida con la mayor parte de la salsa de carne, reservando aproximadamente 1 cup para las capas.

Extiende una capa delgada de salsa en el fondo del molde. Agrega la mitad de la mezcla de pasta, luego coloca Tbsp de 1/2 cup de ricotta y espolvorea 1 cup de mozzarella.

Repite con la pasta restante, 1/2 cup de ricotta y 1 cup de mozzarella. Cubre con la salsa reservada y termina con 1/2 cup de queso parmesano.

Cubre sin apretar con papel aluminio y hornea durante 20 minutos. Retira el papel aluminio y hornea otros 10 a 15 minutos, hasta que el queso esté derretido y burbujeante, con bordes ligeramente dorados.

Deja reposar 10 minutos antes de servir. Decora con 1/4 cup de perejil fresco picado si deseas.`,
    },
  },
},

{
  id: "normal-chicken-alfredo",
  slug: "normal-chicken-alfredo",
  name: "Chicken Alfredo",
  effort: "normal",
  photoUrl: "/images/normal-chicken-alfredo.jpg",
  tags: ["dinner", "pasta", "chicken", "comfort", "italian", "stovetop", "leftovers-friendly"],
  isVegetarian: false,
  // Chicken Alfredo
suggestedSides: [
  "Garlic bread",
  "Caesar salad",
  "Steamed broccoli",
],
  notes: "Rich and creamy chicken alfredo with a smooth Parmesan sauce. Use freshly grated Parmesan for best results and add pasta water to achieve a silky, restaurant-style finish.",
  ingredients: `2 boneless, skinless chicken breasts, sliced
12 oz fettuccine
1 Tbsp olive oil
1/2 tsp salt
1/2 tsp pepper
1/2 tsp garlic powder (optional)
1/2 cup (1 stick) unsalted butter
3 cloves garlic, minced
1 cup heavy cream
1 cup freshly grated Parmesan cheese
1/2 cup reserved pasta water
1/4 tsp pepper (for sauce)
1/4 cup fresh parsley, chopped (optional)`,
  instructions: `Bring a large pot of salted water to a boil. Cook 12 oz fettuccine according to package directions until al dente. Reserve 1/2 cup pasta water, then drain.

Season 2 sliced chicken breasts with 1/2 tsp salt, 1/2 tsp pepper, and 1/2 tsp garlic powder.

Heat 1 Tbsp olive oil in a large skillet over medium-high heat. Add the chicken and cook for 4 to 5 minutes, stirring occasionally, until golden brown and cooked through. Remove and set aside.

Reduce heat to medium. In the same pan, melt 1/2 cup unsalted butter. Add 3 cloves minced garlic and cook for 30 to 60 seconds until fragrant.

Pour in 1 cup heavy cream and bring to a gentle simmer. Cook for 3 to 5 minutes, stirring occasionally, until slightly thickened.

Stir in 1 cup freshly grated Parmesan cheese gradually, whisking until melted and smooth.

Add a splash of the reserved pasta water and stir until the sauce becomes silky and coats the back of a spoon.

Return the chicken to the pan, then add the cooked pasta. Toss everything together until evenly coated with the sauce. Add 1/4 tsp pepper for seasoning.

Taste and adjust salt and pepper as needed. Remove from heat and garnish with 1/4 cup chopped fresh parsley before serving.`,
  translations: {
    es: {
      name: "Pollo Alfredo",
      notes:
        "Pollo Alfredo rico y cremoso con una salsa suave de parmesano. Usa parmesano recién rallado para mejores resultados y agrega agua de la pasta para lograr una textura sedosa estilo restaurante.",
      tags: [
        "cena",
        "pasta",
        "pollo",
        "comida reconfortante",
        "italiana",
        "estufa",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Pan de ajo",
        "Ensalada César",
        "Brócoli al vapor",
      ],
      ingredients: `2 pechugas de pollo sin hueso y sin piel, rebanadas
12 oz de fettuccine
1 Tbsp de aceite de oliva
1/2 tsp de sal
1/2 tsp de pimienta
1/2 tsp de ajo en polvo, opcional
1/2 cup (1 barra) de mantequilla sin sal
3 dientes de ajo, picados
1 cup de crema espesa
1 cup de queso parmesano recién rallado
1/2 cup de agua reservada de la pasta
1/4 tsp de pimienta para la salsa
1/4 cup de perejil fresco, picado, opcional`,
      instructions: `Hierve una olla grande con agua salada. Cocina 12 oz de fettuccine según las instrucciones del paquete hasta que esté al dente. Reserva 1/2 cup de agua de la pasta y luego escurre.

Sazona 2 pechugas de pollo rebanadas con 1/2 tsp de sal, 1/2 tsp de pimienta y 1/2 tsp de ajo en polvo.

Calienta 1 Tbsp de aceite de oliva en un sartén grande a fuego medio-alto. Agrega el pollo y cocina de 4 a 5 minutos, revolviendo de vez en cuando, hasta que esté dorado y bien cocido. Retira y reserva.

Reduce el fuego a medio. En el mismo sartén, derrite 1/2 cup de mantequilla sin sal. Agrega 3 dientes de ajo picados y cocina de 30 a 60 segundos, hasta que suelte aroma.

Vierte 1 cup de crema espesa y lleva a un hervor suave. Cocina de 3 a 5 minutos, revolviendo ocasionalmente, hasta que espese un poco.

Incorpora gradualmente 1 cup de queso parmesano recién rallado, batiendo hasta que se derrita y quede suave.

Agrega un poco del agua reservada de la pasta y mezcla hasta que la salsa quede sedosa y cubra el dorso de una cuchara.

Regresa el pollo al sartén y luego agrega la pasta cocida. Mezcla todo hasta cubrirlo de manera uniforme con la salsa. Agrega 1/4 tsp de pimienta para sazonar.

Prueba y ajusta sal y pimienta si es necesario. Retira del fuego y decora con 1/4 cup de perejil fresco picado antes de servir.`,
    },
  },
},

{
  id: "normal-beef-stroganoff",
  slug: "normal-beef-stroganoff",
  name: "Beef Stroganoff",
  effort: "normal",
  photoUrl: "/images/normal-beef-stroganoff.jpg",
  tags: ["dinner", "beef", "comfort", "stovetop", "pasta", "family-friendly", "leftovers-friendly"],
  isVegetarian: false,
  // Beef Stroganoff
suggestedSides: [
  "Simple green salad",
  "Roasted carrots",
  "Dinner rolls",
],
  notes: "Creamy, savory beef stroganoff with tender beef and mushrooms in a rich sauce. For best results, sear the beef quickly over high heat and avoid boiling after adding sour cream to prevent curdling.",
  ingredients: `1 lb beef sirloin, thinly sliced
8 oz baby bella mushrooms, sliced
1 small yellow onion, diced
2 cloves garlic, minced
2 Tbsp butter
1 Tbsp olive oil
2 Tbsp flour
1 cup beef broth
1 tsp worcestershire sauce
1/2 cup sour cream
1/2 tsp salt (plus more to taste)
1/2 tsp pepper
8 oz egg noodles
1/4 cup fresh parsley, chopped (optional)`,
  instructions: `Cook 8 oz egg noodles in a large pot of salted boiling water according to package directions. Drain and set aside.

Heat 1 Tbsp olive oil in a large skillet over medium-high heat. Add 1 lb thinly sliced beef sirloin in a single layer and sear for 2 to 3 minutes until browned. Season with 1/2 tsp salt and 1/2 tsp pepper. Do not overcrowd the pan. Remove and set aside.

In the same skillet, reduce heat to medium and add 2 Tbsp butter. Add 1 small diced yellow onion and cook for 4 to 5 minutes until softened.

Add 8 oz sliced baby bella mushrooms and cook for 5 to 7 minutes, stirring occasionally, until they release their moisture and begin to brown.

Add 2 cloves minced garlic and cook for 30 seconds until fragrant.

Sprinkle 2 Tbsp flour over the mixture and stir continuously for 1 minute to cook out the raw flour taste.

Slowly pour in 1 cup beef broth while stirring, scraping up any browned bits from the bottom of the pan. Stir in 1 tsp worcestershire sauce.

Bring to a gentle simmer and cook for 3 to 5 minutes, until the sauce thickens and coats the back of a spoon.

Reduce heat to low. Stir in 1/2 cup sour cream until smooth and creamy.

Return the beef to the pan and cook for 2 to 3 minutes until heated through. Do not boil after adding sour cream.

Serve over the cooked egg noodles and garnish with 1/4 cup fresh parsley if desired.`,
  translations: {
    es: {
      name: "Stroganoff de res",
      notes:
        "Stroganoff de res cremoso y sabroso, con carne tierna y champiñones en una salsa rica. Para mejores resultados, sella la carne rápidamente a fuego alto y evita hervir después de agregar la crema agria para que no se corte.",
      tags: [
        "cena",
        "carne de res",
        "comida reconfortante",
        "estufa",
        "pasta",
        "familiar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Ensalada verde sencilla",
        "Zanahorias rostizadas",
        "Panecillos",
      ],
      ingredients: `1 lb de sirloin de res, rebanado finamente
8 oz de champiñones baby bella, rebanados
1 cebolla amarilla pequeña, picada en cubitos
2 dientes de ajo, picados
2 Tbsp de mantequilla
1 Tbsp de aceite de oliva
2 Tbsp de harina
1 cup de caldo de res
1 tsp de salsa worcestershire
1/2 cup de crema agria
1/2 tsp de sal, más al gusto
1/2 tsp de pimienta
8 oz de fideos de huevo
1/4 cup de perejil fresco, picado, opcional`,
      instructions: `Cocina 8 oz de fideos de huevo en una olla grande con agua hirviendo y sal, según las instrucciones del paquete. Escurre y reserva.

Calienta 1 Tbsp de aceite de oliva en un sartén grande a fuego medio-alto. Agrega 1 lb de sirloin de res rebanado finamente en una sola capa y sella de 2 a 3 minutos, hasta que se dore. Sazona con 1/2 tsp de sal y 1/2 tsp de pimienta. No llenes demasiado el sartén. Retira y reserva.

En el mismo sartén, reduce el fuego a medio y agrega 2 Tbsp de mantequilla. Agrega 1 cebolla amarilla pequeña picada y cocina de 4 a 5 minutos, hasta que se ablande.

Agrega 8 oz de champiñones baby bella rebanados y cocina de 5 a 7 minutos, revolviendo de vez en cuando, hasta que suelten su humedad y empiecen a dorarse.

Agrega 2 dientes de ajo picados y cocina 30 segundos, hasta que suelte aroma.

Espolvorea 2 Tbsp de harina sobre la mezcla y revuelve continuamente durante 1 minuto para quitar el sabor a harina cruda.

Vierte lentamente 1 cup de caldo de res mientras revuelves, raspando los trozos dorados del fondo del sartén. Incorpora 1 tsp de salsa worcestershire.

Lleva a un hervor suave y cocina de 3 a 5 minutos, hasta que la salsa espese y cubra el dorso de una cuchara.

Reduce el fuego a bajo. Incorpora 1/2 cup de crema agria hasta que quede suave y cremosa.

Regresa la carne al sartén y cocina de 2 a 3 minutos, hasta que se caliente por completo. No hiervas después de agregar la crema agria.

Sirve sobre los fideos de huevo cocidos y decora con 1/4 cup de perejil fresco si deseas.`,
    },
  },
},

  {
  id: "normal-chicken-pot-pie",
  slug: "normal-chicken-pot-pie",
  name: "Chicken Pot Pie",
  effort: "normal",
  photoUrl: "/images/normal-chicken-pot-pie.jpg",
  tags: ["dinner", "chicken", "bake", "comfort", "casserole", "family-friendly", "leftovers-friendly"],
  isVegetarian: false,
  // Chicken Pot Pie
suggestedSides: [
  "Side salad",
  "Roasted green beans",
  "Cranberry sauce",
],
  notes: "Creamy, classic chicken pot pie with a flaky golden crust. Letting it rest before serving helps the filling set and makes cleaner portions.",
  ingredients: `2 cups cooked chicken, diced (rotisserie works great)
1 cup frozen mixed vegetables
1/2 cup (1 stick) unsalted butter
1/2 cup all-purpose flour
2 cups chicken broth
1 cup milk
1 small yellow onion, diced
2 cloves garlic, minced
1/2 tsp salt (plus more to taste)
1/2 tsp pepper
1/2 tsp dried thyme (optional)
1 refrigerated pie crust
1 egg, beaten (optional, for egg wash)`,
  instructions: `Preheat oven to 400°F. Lightly grease a baking dish or pie dish.

In a large skillet or saucepan, melt 1/2 cup unsalted butter over medium heat. Add 1 diced small yellow onion and cook for 4 to 5 minutes until softened.

Add 2 cloves minced garlic and cook for 30 seconds until fragrant.

Stir in 1/2 cup all-purpose flour and cook for 1 to 2 minutes, stirring constantly, to form a roux and remove the raw flour taste.

Slowly whisk in 2 cups chicken broth and 1 cup milk, stirring continuously to prevent lumps.

Bring to a gentle simmer and cook for 5 to 7 minutes, stirring often, until the sauce thickens and coats the back of a spoon.

Stir in 2 cups diced cooked chicken, 1 cup frozen mixed vegetables, 1/2 tsp salt, 1/2 tsp pepper, and 1/2 tsp dried thyme. Cook for 2 to 3 minutes until heated through.

Pour the filling into the prepared baking dish.

Lay 1 refrigerated pie crust over the top, trimming any excess and pressing lightly to seal the edges. Cut a few small slits in the top to allow steam to escape.

Brush with 1 beaten egg if using for a golden finish.

Bake for 30 to 35 minutes, until the crust is golden brown and the filling is bubbling around the edges.

Let rest for 10 minutes before serving to allow the filling to set.`,
  translations: {
    es: {
      name: "Pay de pollo",
      notes:
        "Un pay de pollo clásico, cremoso y con una corteza dorada y hojaldrada. Dejarlo reposar antes de servir ayuda a que el relleno se asiente y sea más fácil cortarlo.",
      tags: [
        "cena",
        "pollo",
        "horneado",
        "comida reconfortante",
        "cazuela",
        "familiar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Ensalada sencilla",
        "Ejotes asados",
        "Salsa de arándanos",
      ],
      ingredients: `2 cups de pollo cocido, cortado en cubitos; el pollo rostizado funciona muy bien
1 cup de verduras mixtas congeladas
1/2 cup (1 barra) de mantequilla sin sal
1/2 cup de harina de todo uso
2 cups de caldo de pollo
1 cup de leche
1 cebolla amarilla pequeña, picada en cubitos
2 dientes de ajo, picados
1/2 tsp de sal, más al gusto
1/2 tsp de pimienta
1/2 tsp de tomillo seco, opcional
1 masa refrigerada para pay
1 huevo, batido, opcional para barnizar`,
      instructions: `Precalienta el horno a 400°F. Engrasa ligeramente un molde para hornear o molde para pay.

En un sartén grande o cacerola, derrite 1/2 cup de mantequilla sin sal a fuego medio. Agrega 1 cebolla amarilla pequeña picada y cocina de 4 a 5 minutos, hasta que se ablande.

Agrega 2 dientes de ajo picados y cocina 30 segundos, hasta que suelte aroma.

Incorpora 1/2 cup de harina de todo uso y cocina de 1 a 2 minutos, revolviendo constantemente, para formar un roux y quitar el sabor a harina cruda.

Agrega lentamente 2 cups de caldo de pollo y 1 cup de leche, batiendo continuamente para evitar grumos.

Lleva a un hervor suave y cocina de 5 a 7 minutos, revolviendo con frecuencia, hasta que la salsa espese y cubra el dorso de una cuchara.

Incorpora 2 cups de pollo cocido en cubitos, 1 cup de verduras mixtas congeladas, 1/2 tsp de sal, 1/2 tsp de pimienta y 1/2 tsp de tomillo seco. Cocina de 2 a 3 minutos, hasta que todo esté caliente.

Vierte el relleno en el molde preparado.

Coloca 1 masa refrigerada para pay encima, recorta el exceso y presiona ligeramente para sellar los bordes. Haz unos pequeños cortes en la parte superior para que escape el vapor.

Barniza con 1 huevo batido si lo usas para un acabado dorado.

Hornea de 30 a 35 minutos, hasta que la corteza esté dorada y el relleno burbujee por los bordes.

Deja reposar 10 minutos antes de servir para que el relleno se asiente.`,
    },
  },
},

{
  id: "normal-taco-pasta",
  slug: "normal-taco-pasta",
  name: "Cheesy Taco Pasta",
  effort: "normal",
  photoUrl: "/images/normal-taco-pasta.jpg",
  tags: ["dinner", "pasta", "tex-mex", "beef", "cheesy", "one-pan", "family-friendly", "leftovers-friendly"],
  isVegetarian: false,
  // Cheesy Taco Pasta
suggestedSides: [
  "Chips and salsa",
  "Mexican street corn",
  "Simple green salad",
],
  notes: "A cheesy, taco-inspired pasta with bold flavor and a creamy finish. Great for family dinners and even better as leftovers the next day.",
  ingredients: `1 lb ground beef
8 oz pasta (rotini or shells work best)
1 Tbsp olive oil
1 small yellow onion, diced
2 cloves garlic, minced
1 (14.5 oz) can diced tomatoes (with juices)
1 cup beef broth
1 cup cheddar cheese, shredded
1/2 cup Monterey Jack cheese (optional, for extra melt)
1/4 cup cream cheese (optional, for extra creaminess)

Taco Pasta Seasoning:
1 Tbsp chili powder
1 tsp cumin
1/2 tsp paprika (or smoked paprika for extra depth)
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/4 tsp pepper`,
  instructions: `Bring a large pot of salted water to a boil. Cook 8 oz pasta according to package directions until al dente. Drain and set aside.

Heat 1 Tbsp olive oil in a large skillet over medium heat. Add 1 diced small yellow onion and cook for 4 to 5 minutes until softened.

Add 2 cloves minced garlic and cook for 30 seconds until fragrant.

Add 1 lb ground beef and cook until browned, breaking it apart as it cooks. Drain excess grease if needed.

Stir in the taco seasoning: 1 Tbsp chili powder, 1 tsp cumin, 1/2 tsp paprika, 1/2 tsp garlic powder, 1/2 tsp onion powder, 1/2 tsp salt, and 1/4 tsp pepper. Cook for 1 minute to toast the spices.

Add 1 (14.5 oz) can diced tomatoes with their juices and 1 cup beef broth. Stir well and bring to a simmer.

Let the mixture simmer for 5 to 7 minutes, until slightly thickened and the flavors are well combined.

Reduce heat to low. Stir in 1/4 cup cream cheese if using until melted and smooth.

Add the cooked pasta and toss to coat evenly.

Stir in 1 cup shredded cheddar cheese and 1/2 cup Monterey Jack if using until melted and creamy.

Remove from heat and serve warm.`,
  translations: {
    es: {
      name: "Pasta de taco con queso",
      notes:
        "Una pasta inspirada en tacos, con mucho queso, sabor intenso y un acabado cremoso. Ideal para cenas familiares y aún mejor como sobras al día siguiente.",
      tags: [
        "cena",
        "pasta",
        "tex-mex",
        "carne de res",
        "con queso",
        "una sartén",
        "familiar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Totopos con salsa",
        "Elote estilo mexicano",
        "Ensalada verde sencilla",
      ],
      ingredients: `1 lb de carne molida de res
8 oz de pasta; rotini o conchas funcionan mejor
1 Tbsp de aceite de oliva
1 cebolla amarilla pequeña, picada en cubitos
2 dientes de ajo, picados
1 lata (14.5 oz) de tomates en cubitos, con sus jugos
1 cup de caldo de res
1 cup de queso cheddar rallado
1/2 cup de queso Monterey Jack, opcional para que se derrita mejor
1/4 cup de queso crema, opcional para más cremosidad

Sazonador para pasta de taco:
1 Tbsp de chile en polvo
1 tsp de comino
1/2 tsp de paprika, o paprika ahumada para más profundidad
1/2 tsp de ajo en polvo
1/2 tsp de cebolla en polvo
1/2 tsp de sal
1/4 tsp de pimienta`,
      instructions: `Hierve una olla grande con agua salada. Cocina 8 oz de pasta según las instrucciones del paquete hasta que esté al dente. Escurre y reserva.

Calienta 1 Tbsp de aceite de oliva en un sartén grande a fuego medio. Agrega 1 cebolla amarilla pequeña picada y cocina de 4 a 5 minutos, hasta que se ablande.

Agrega 2 dientes de ajo picados y cocina 30 segundos, hasta que suelte aroma.

Agrega 1 lb de carne molida de res y cocina hasta que se dore, separándola mientras se cocina. Escurre el exceso de grasa si es necesario.

Incorpora el sazonador para taco: 1 Tbsp de chile en polvo, 1 tsp de comino, 1/2 tsp de paprika, 1/2 tsp de ajo en polvo, 1/2 tsp de cebolla en polvo, 1/2 tsp de sal y 1/4 tsp de pimienta. Cocina 1 minuto para tostar las especias.

Agrega 1 lata (14.5 oz) de tomates en cubitos con sus jugos y 1 cup de caldo de res. Mezcla bien y lleva a hervor suave.

Deja cocinar de 5 a 7 minutos, hasta que espese un poco y los sabores se integren.

Reduce el fuego a bajo. Incorpora 1/4 cup de queso crema si lo usas, hasta que se derrita y quede suave.

Agrega la pasta cocida y mezcla para cubrirla de manera uniforme.

Incorpora 1 cup de queso cheddar rallado y 1/2 cup de Monterey Jack si lo usas, hasta que se derritan y quede cremoso.

Retira del fuego y sirve caliente.`,
    },
  },
},

{
  id: "pan-seared-scallops-lemon-risotto",
  slug: "pan-seared-scallops-lemon-risotto",
  name: "Pan-Seared Scallops with Lemon Risotto",
  effort: "big",
  photoUrl: "/images/pan-seared-scallops-lemon-risotto.jpg",
  tags: ["dinner", "seafood", "shellfish", "scallops", "risotto", "date-night", "restaurant-style"],
  isVegetarian: false,
  // Pan-Seared Scallops with Lemon Risotto
suggestedSides: [
  "Roasted asparagus",
  "Simple green salad",
  "Garlic bread",
],
  notes: "Elegant, restaurant-quality scallops with creamy lemon risotto. Key to success: keep the stock warm, stir the risotto gradually, and ensure scallops are very dry before searing for a perfect golden crust.",
  ingredients: `10 large sea scallops (side muscle removed)
1 cup Arborio rice
3 cups chicken stock (kept warm)
1/2 cup dry white wine (optional, or extra stock)
1/2 cup Parmesan cheese, freshly grated
2 Tbsp butter (divided)
1 Tbsp olive oil
1 small shallot, finely diced (or 1/4 onion)
2 cloves garlic, minced
1 Tbsp lemon zest
1 Tbsp lemon juice
1/2 tsp salt (plus more to taste)
1/2 tsp pepper
1 Tbsp fresh parsley, chopped (optional)`,
  instructions: `In a saucepan, keep 3 cups chicken stock warm over low heat.

In a large skillet or sauté pan, melt 1 Tbsp butter with 1 Tbsp olive oil over medium heat. Add 1 finely diced small shallot and cook for 2 to 3 minutes until softened.

Add 2 cloves minced garlic and cook for 30 seconds until fragrant.

Stir in 1 cup Arborio rice and cook for 1 to 2 minutes, stirring constantly, until the edges of the grains look slightly translucent.

Pour in 1/2 cup dry white wine and stir until mostly absorbed.

Add the warm chicken stock one ladle at a time, stirring frequently. Allow each addition to absorb before adding the next.

Continue this process for 18 to 22 minutes, until the rice is creamy and tender with a slight bite.

Stir in the remaining 1 Tbsp butter, 1/2 cup freshly grated Parmesan cheese, 1 Tbsp lemon zest, 1 Tbsp lemon juice, 1/2 tsp salt, and 1/2 tsp pepper. The risotto should be loose and creamy, not stiff. Adjust with a splash of stock if needed. Keep warm.

Pat 10 large sea scallops very dry with paper towels and season lightly with salt and pepper.

Heat a separate skillet over high heat until very hot. Add a small amount of oil.

Place scallops in the pan and sear undisturbed for 1 1/2 to 2 minutes until a deep golden-brown crust forms.

Flip and cook another 1 to 2 minutes until just opaque in the center. Do not overcook.

Spoon risotto onto plates and top with the seared scallops. Garnish with 1 Tbsp chopped fresh parsley if desired and serve immediately.`,
  translations: {
    es: {
      name: "Vieiras selladas con risotto de limón",
      notes:
        "Vieiras elegantes, estilo restaurante, con risotto cremoso de limón. La clave es mantener el caldo caliente, agregarlo poco a poco al risotto y secar muy bien las vieiras antes de sellarlas para lograr una corteza dorada perfecta.",
      tags: [
        "cena",
        "mariscos",
        "vieiras",
        "risotto",
        "noche especial",
        "estilo restaurante",
      ],
      suggestedSides: [
        "Espárragos rostizados",
        "Ensalada verde sencilla",
        "Pan de ajo",
      ],
      ingredients: `10 vieiras grandes de mar, sin el músculo lateral
1 cup de arroz Arborio
3 cups de caldo de pollo, mantenido caliente
1/2 cup de vino blanco seco, opcional, o más caldo
1/2 cup de queso parmesano recién rallado
2 Tbsp de mantequilla, dividida
1 Tbsp de aceite de oliva
1 chalota pequeña, finamente picada, o 1/4 de cebolla
2 dientes de ajo, picados
1 Tbsp de ralladura de limón
1 Tbsp de jugo de limón
1/2 tsp de sal, más al gusto
1/2 tsp de pimienta
1 Tbsp de perejil fresco, picado, opcional`,
      instructions: `En una cacerola, mantén 3 cups de caldo de pollo caliente a fuego bajo.

En un sartén grande o sartén para saltear, derrite 1 Tbsp de mantequilla con 1 Tbsp de aceite de oliva a fuego medio. Agrega 1 chalota pequeña finamente picada y cocina de 2 a 3 minutos, hasta que se ablande.

Agrega 2 dientes de ajo picados y cocina 30 segundos, hasta que suelte aroma.

Incorpora 1 cup de arroz Arborio y cocina de 1 a 2 minutos, revolviendo constantemente, hasta que los bordes de los granos se vean ligeramente translúcidos.

Vierte 1/2 cup de vino blanco seco y revuelve hasta que se absorba casi por completo.

Agrega el caldo de pollo caliente, un cucharón a la vez, revolviendo con frecuencia. Deja que cada adición se absorba antes de agregar la siguiente.

Continúa este proceso de 18 a 22 minutos, hasta que el arroz esté cremoso y tierno, con una ligera firmeza al morder.

Incorpora la 1 Tbsp restante de mantequilla, 1/2 cup de queso parmesano recién rallado, 1 Tbsp de ralladura de limón, 1 Tbsp de jugo de limón, 1/2 tsp de sal y 1/2 tsp de pimienta. El risotto debe quedar suelto y cremoso, no rígido. Ajusta con un chorrito de caldo si es necesario. Mantén caliente.

Seca muy bien 10 vieiras grandes con toallas de papel y sazona ligeramente con sal y pimienta.

Calienta otro sartén a fuego alto hasta que esté muy caliente. Agrega una pequeña cantidad de aceite.

Coloca las vieiras en el sartén y sella sin mover de 1 1/2 a 2 minutos, hasta que se forme una costra dorada intensa.

Voltea y cocina de 1 a 2 minutos más, hasta que estén apenas opacas en el centro. No las cocines de más.

Sirve el risotto en platos y coloca las vieiras selladas encima. Decora con 1 Tbsp de perejil fresco picado si deseas y sirve de inmediato.`,
    },
  },
},

{
  id: "lemon-herb-roasted-salmon",
  slug: "lemon-herb-roasted-salmon",
  name: "Lemon Herb Roasted Salmon",
  effort: "normal",
  photoUrl: "/images/lemon-herb-roasted-salmon.jpg",
  tags: ["dinner", "seafood", "fish", "salmon", "oven", "healthy", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  // Lemon Herb Roasted Salmon
suggestedSides: [
  "Rice pilaf",
  "Roasted potatoes",
  "Simple green salad",
],
  notes: "Light, fresh roasted salmon with lemon and herbs. A simple one-pan meal that pairs perfectly with rice or roasted potatoes and reheats well for leftovers.",
  ingredients: `4 salmon fillets (about 6 oz each)
1 bunch asparagus, trimmed
2 Tbsp olive oil
2 cloves garlic, minced
1 lemon, sliced
1 Tbsp lemon juice
2 Tbsp fresh dill, chopped (or 1 tsp dried dill)
1/2 tsp salt
1/2 tsp pepper
1/2 tsp paprika (optional, for light color and depth)`,
  instructions: `Preheat oven to 400°F. Line a baking sheet with parchment paper or foil for easy cleanup.

Arrange 4 salmon fillets and 1 bunch trimmed asparagus on the baking sheet in a single layer.

Drizzle 2 Tbsp olive oil evenly over the salmon and asparagus.

Sprinkle 2 cloves minced garlic, 2 Tbsp chopped fresh dill, 1/2 tsp salt, 1/2 tsp pepper, and 1/2 tsp paprika if using over everything.

Place 1 sliced lemon on top of the salmon and drizzle with 1 Tbsp fresh lemon juice.

Roast for 12 to 15 minutes, depending on thickness, until the salmon is opaque and flakes easily with a fork.

For a slightly crisp top, broil on high for 1 to 2 minutes at the end, watching closely.

Remove from the oven and serve immediately.`,
  translations: {
    es: {
      name: "Salmón asado con limón y hierbas",
      notes:
        "Salmón asado ligero y fresco con limón y hierbas. Una comida sencilla en una sola bandeja que combina perfectamente con arroz o papas asadas y se recalienta bien como sobras.",
      tags: [
        "cena",
        "mariscos",
        "pescado",
        "salmón",
        "horno",
        "saludable",
        "una bandeja",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Arroz pilaf",
        "Papas asadas",
        "Ensalada verde sencilla",
      ],
      ingredients: `4 filetes de salmón (aprox. 6 oz cada uno)
1 manojo de espárragos, recortados
2 Tbsp de aceite de oliva
2 dientes de ajo, picados
1 limón, rebanado
1 Tbsp de jugo de limón
2 Tbsp de eneldo fresco, picado, o 1 tsp de eneldo seco
1/2 tsp de sal
1/2 tsp de pimienta
1/2 tsp de paprika, opcional para color ligero y más profundidad`,
      instructions: `Precalienta el horno a 400°F. Cubre una bandeja para hornear con papel pergamino o aluminio para facilitar la limpieza.

Coloca 4 filetes de salmón y 1 manojo de espárragos recortados en la bandeja en una sola capa.

Rocía 2 Tbsp de aceite de oliva de manera uniforme sobre el salmón y los espárragos.

Espolvorea 2 dientes de ajo picados, 2 Tbsp de eneldo fresco picado, 1/2 tsp de sal, 1/2 tsp de pimienta y 1/2 tsp de paprika si la usas sobre todo.

Coloca 1 limón rebanado encima del salmón y rocía con 1 Tbsp de jugo de limón fresco.

Asa de 12 a 15 minutos, según el grosor, hasta que el salmón esté opaco y se desmenuce fácilmente con un tenedor.

Para una parte superior un poco crujiente, gratina en alto de 1 a 2 minutos al final, vigilando de cerca.

Retira del horno y sirve de inmediato.`,
    },
  },
},

{
  id: "beef-broccoli-stir-fry",
  slug: "beef-broccoli-stir-fry",
  name: "Beef and Broccoli Stir-Fry",
  effort: "quick",
  photoUrl: "/images/beef-broccoli-stir-fry.jpg",
  tags: ["dinner", "beef", "stir-fry", "one-pan", "quick", "takeout-style", "leftovers-friendly"],
  isVegetarian: false,
  // Beef and Broccoli Stir-Fry
suggestedSides: [
  "Steamed rice",
  "Egg rolls",
  "Cucumber salad",
],
  notes: "Quick, takeout-style beef and broccoli with a savory, glossy sauce. Slice the beef thinly against the grain for maximum tenderness and cook quickly over high heat.",
  ingredients: `1 lb flank steak, thinly sliced against the grain
3 cups broccoli florets
2 Tbsp soy sauce (plus more to taste)
1 Tbsp oyster sauce (optional, for deeper flavor)
1 tsp fresh ginger, grated (or 1/2 tsp ground ginger)
2 cloves garlic, minced
1 Tbsp brown sugar
1 Tbsp sesame oil
1 Tbsp vegetable oil (or canola oil)
1/2 cup beef broth (or water)
1 tsp cornstarch + 2 Tbsp water (for slurry)
1/2 tsp pepper
2 green onions, sliced (optional)`,
  instructions: `In a small bowl, whisk together 2 Tbsp soy sauce, 1 Tbsp oyster sauce if using, 1 tsp grated ginger, 2 cloves minced garlic, 1 Tbsp brown sugar, and 1/2 cup beef broth. Set aside.

Heat a wok or large skillet over high heat. Add 1 Tbsp vegetable oil.

Add 1 lb thinly sliced flank steak in a single layer and sear for 2 to 3 minutes without stirring too much, until browned. Remove and set aside.

In the same pan, add 3 cups broccoli florets and stir-fry for 3 to 4 minutes until bright green and tender-crisp. Add a splash of water if needed to help steam.

Return the beef to the pan and pour in the prepared sauce.

Bring to a quick simmer over high heat. Mix 1 tsp cornstarch with 2 Tbsp water to create a slurry; stir it into the pan and cook for 1 to 2 minutes, stirring constantly, until the sauce thickens and becomes glossy.

Drizzle with 1 Tbsp sesame oil and sprinkle with 1/2 tsp pepper. Toss everything together until well coated.

Remove from heat, garnish with 2 sliced green onions if desired, and serve immediately.`,
  translations: {
    es: {
      name: "Salteado de res con brócoli",
      notes:
        "Res con brócoli rápida, estilo comida para llevar, con una salsa sabrosa y brillante. Corta la carne finamente contra la fibra para máxima suavidad y cocínala rápido a fuego alto.",
      tags: [
        "cena",
        "carne de res",
        "salteado",
        "una sartén",
        "rápido",
        "estilo comida para llevar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Arroz al vapor",
        "Rollitos primavera",
        "Ensalada de pepino",
      ],
      ingredients: `1 lb de flank steak, rebanado finamente contra la fibra
3 cups de floretes de brócoli
2 Tbsp de salsa de soya, más al gusto
1 Tbsp de salsa de ostión, opcional para más sabor
1 tsp de jengibre fresco, rallado, o 1/2 tsp de jengibre molido
2 dientes de ajo, picados
1 Tbsp de azúcar morena
1 Tbsp de aceite de sésamo
1 Tbsp de aceite vegetal o aceite de canola
1/2 cup de caldo de res o agua
1 tsp de maicena + 2 Tbsp de agua para espesar
1/2 tsp de pimienta
2 cebollines, rebanados, opcional`,
      instructions: `En un tazón pequeño, bate 2 Tbsp de salsa de soya, 1 Tbsp de salsa de ostión si la usas, 1 tsp de jengibre rallado, 2 dientes de ajo picados, 1 Tbsp de azúcar morena y 1/2 cup de caldo de res. Reserva.

Calienta un wok o sartén grande a fuego alto. Agrega 1 Tbsp de aceite vegetal.

Agrega 1 lb de flank steak rebanado finamente en una sola capa y sella de 2 a 3 minutos sin revolver demasiado, hasta que se dore. Retira y reserva.

En el mismo sartén, agrega 3 cups de floretes de brócoli y saltea de 3 a 4 minutos, hasta que estén verdes brillantes y tiernos pero firmes. Agrega un chorrito de agua si es necesario para ayudar a vaporizar.

Regresa la carne al sartén y vierte la salsa preparada.

Lleva a un hervor rápido a fuego alto. Mezcla 1 tsp de maicena con 2 Tbsp de agua para formar una mezcla espesante; incorpórala al sartén y cocina de 1 a 2 minutos, revolviendo constantemente, hasta que la salsa espese y quede brillante.

Rocía con 1 Tbsp de aceite de sésamo y espolvorea 1/2 tsp de pimienta. Mezcla todo hasta que quede bien cubierto.

Retira del fuego, decora con 2 cebollines rebanados si deseas y sirve de inmediato.`,
    },
  },
},

 {
  id: "zuppa-toscana-soup",
  slug: "zuppa-toscana-soup",
  name: "Zuppa Toscana Soup",
  effort: "normal",
  photoUrl: "/images/zuppa-toscana-soup.jpg",
  tags: ["dinner", "soup", "pork", "italian", "comfort", "one-pot", "family-friendly", "leftovers-friendly"],
  // Zuppa Toscana Soup
suggestedSides: [
  "Garlic bread",
  "Caesar salad",
  "Breadsticks",
],
  notes: "A rich and cozy soup that feels like restaurant comfort food at home.",
  ingredients: `1 lb Italian ground sausage
4 Tbsp butter
1 white onion, diced
1 Tbsp garlic, minced
6 cups chicken broth
2 cups water
5 yellow potatoes, cut into 1-inch pieces
3 tsp salt
1 tsp pepper
2 cups heavy cream
4 cups fresh kale, chopped
bacon bits
Parmesan cheese, grated`,
  instructions: `In a large pot, sauté 1 lb Italian ground sausage for 5 to 6 minutes until browned.

Use a slotted spoon to transfer the sausage to a plate and set aside.

In the same pot, add 4 Tbsp butter and sauté 1 diced white onion over medium heat until translucent.

Add 1 Tbsp minced garlic and sauté for another minute until fragrant.

Add 6 cups chicken broth, 2 cups water, 5 yellow potatoes cut into 1-inch pieces, 3 tsp salt, and 1 tsp pepper, and bring to a boil.

Boil until the potatoes are tender.

Stir in 4 cups fresh chopped kale and 2 cups heavy cream, then add the cooked sausage back to the pot.

Taste and adjust salt and pepper if needed.

Serve topped with grated Parmesan cheese and bacon bits if desired.`,
  translations: {
    es: {
      name: "Sopa Zuppa Toscana",
      notes:
        "Una sopa rica y acogedora que sabe a comida reconfortante de restaurante en casa.",
      tags: [
        "cena",
        "sopa",
        "cerdo",
        "italiana",
        "comida reconfortante",
        "una olla",
        "familiar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Pan de ajo",
        "Ensalada César",
        "Palitos de pan",
      ],
      ingredients: `1 lb de salchicha italiana molida
4 Tbsp de mantequilla
1 cebolla blanca, picada en cubitos
1 Tbsp de ajo, picado
6 cups de caldo de pollo
2 cups de agua
5 papas amarillas, cortadas en trozos de 1 inch
3 tsp de sal
1 tsp de pimienta
2 cups de crema espesa
4 cups de kale fresco, picado
tocino en trocitos
queso parmesano rallado`,
      instructions: `En una olla grande, saltea 1 lb de salchicha italiana molida durante 5 a 6 minutos, hasta que esté dorada.

Usa una cuchara ranurada para pasar la salchicha a un plato y reserva.

En la misma olla, agrega 4 Tbsp de mantequilla y sofríe 1 cebolla blanca picada a fuego medio hasta que esté translúcida.

Agrega 1 Tbsp de ajo picado y sofríe 1 minuto más, hasta que suelte aroma.

Agrega 6 cups de caldo de pollo, 2 cups de agua, 5 papas amarillas cortadas en trozos de 1 inch, 3 tsp de sal y 1 tsp de pimienta, y lleva a hervor.

Hierve hasta que las papas estén tiernas.

Incorpora 4 cups de kale fresco picado y 2 cups de crema espesa, luego regresa la salchicha cocida a la olla.

Prueba y ajusta sal y pimienta si es necesario.

Sirve con queso parmesano rallado y tocino en trocitos encima si deseas.`,
    },
  },
},

{
  id: "hidden-veggie-meatloaf",
  slug: "hidden-veggie-meatloaf",
  name: "Hidden Veggie Meatloaf",
  effort: "normal",
  photoUrl: "/images/hidden-veggie-meatloaf.jpg",
  tags: ["dinner", "beef", "meatloaf", "comfort", "family-friendly", "kid-friendly", "leftovers-friendly"],
  isVegetarian: false,
  // Hidden Veggie Meatloaf
suggestedSides: [
  "Mashed potatoes",
  "Green beans",
  "Dinner rolls",
],
  notes: "A moist, flavorful meatloaf packed with hidden vegetables. Squeezing moisture from the zucchini is key to preventing a soggy texture. Perfect with mashed potatoes and great for leftovers.",
  ingredients: `1 1/2 lbs ground beef (80/20 preferred)
1 medium zucchini, peeled and finely grated
2 carrots, peeled and finely grated
1/2 small yellow onion, finely minced or grated
1/2 cup fresh spinach, finely chopped
1 large egg
3/4 cup panko breadcrumbs
1/4 cup milk
1 Tbsp worcestershire sauce
1 Tbsp ketchup
1 tsp garlic powder
1/2 tsp dried Italian seasoning (optional)
1 tsp salt
1/2 tsp pepper

For the glaze:
1/2 cup ketchup
1 Tbsp brown sugar
1 tsp yellow mustard`,
  instructions: `Preheat oven to 375°F. Line a baking sheet with parchment paper or lightly grease a loaf pan.

Place 1 medium peeled and finely grated zucchini in a clean towel or paper towels and squeeze out as much moisture as possible. This step prevents a watery meatloaf.

In a large bowl, combine 1 large egg, 1/4 cup milk, 3/4 cup panko breadcrumbs, 1 Tbsp worcestershire sauce, 1 Tbsp ketchup, 1 tsp garlic powder, 1/2 tsp dried Italian seasoning if using, 1 tsp salt, and 1/2 tsp pepper.

Add the squeezed grated zucchini, 2 peeled and finely grated carrots, 1/2 small finely minced yellow onion, and 1/2 cup finely chopped fresh spinach. Mix until evenly combined.

Add 1 1/2 lbs ground beef and gently mix with your hands until just combined. Do not overmix or the meatloaf will be dense.

Shape the mixture into a loaf on the prepared baking sheet or press into a loaf pan.

Bake for 40 minutes.

Meanwhile, whisk together 1/2 cup ketchup, 1 Tbsp brown sugar, and 1 tsp yellow mustard in a small bowl.

Remove the meatloaf from the oven, spread the glaze evenly over the top, and return to the oven.

Bake for an additional 15 to 20 minutes, until the internal temperature reaches 160°F and the glaze is slightly caramelized.

Let rest for 10 minutes before slicing and serving.`,
  translations: {
    es: {
      name: "Pastel de carne con verduras escondidas",
      notes:
        "Un pastel de carne jugoso y sabroso con verduras escondidas. Exprimir la humedad del zucchini es clave para evitar una textura aguada. Perfecto con puré de papas y excelente para sobras.",
      tags: [
        "cena",
        "carne de res",
        "pastel de carne",
        "comida reconfortante",
        "familiar",
        "para niños",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Puré de papas",
        "Ejotes",
        "Panecillos",
      ],
      ingredients: `1 1/2 lbs de carne molida de res, preferiblemente 80/20
1 zucchini mediano, pelado y finamente rallado
2 zanahorias, peladas y finamente ralladas
1/2 cebolla amarilla pequeña, finamente picada o rallada
1/2 cup de espinaca fresca, finamente picada
1 huevo grande
3/4 cup de pan molido panko
1/4 cup de leche
1 Tbsp de salsa worcestershire
1 Tbsp de ketchup
1 tsp de ajo en polvo
1/2 tsp de sazonador italiano seco, opcional
1 tsp de sal
1/2 tsp de pimienta

Para el glaseado:
1/2 cup de ketchup
1 Tbsp de azúcar morena
1 tsp de mostaza amarilla`,
      instructions: `Precalienta el horno a 375°F. Cubre una bandeja para hornear con papel pergamino o engrasa ligeramente un molde para pan.

Coloca 1 zucchini mediano pelado y finamente rallado en una toalla limpia o toallas de papel y exprime la mayor cantidad de humedad posible. Este paso evita que el pastel de carne quede aguado.

En un tazón grande, combina 1 huevo grande, 1/4 cup de leche, 3/4 cup de pan molido panko, 1 Tbsp de salsa worcestershire, 1 Tbsp de ketchup, 1 tsp de ajo en polvo, 1/2 tsp de sazonador italiano seco si lo usas, 1 tsp de sal y 1/2 tsp de pimienta.

Agrega el zucchini rallado y exprimido, 2 zanahorias peladas y finamente ralladas, 1/2 cebolla amarilla pequeña finamente picada y 1/2 cup de espinaca fresca finamente picada. Mezcla hasta que todo esté bien combinado.

Agrega 1 1/2 lbs de carne molida de res y mezcla suavemente con las manos hasta que apenas se combine. No mezcles demasiado o el pastel de carne quedará denso.

Forma un pan con la mezcla sobre la bandeja preparada o presiónala dentro de un molde para pan.

Hornea durante 40 minutos.

Mientras tanto, bate 1/2 cup de ketchup, 1 Tbsp de azúcar morena y 1 tsp de mostaza amarilla en un tazón pequeño.

Retira el pastel de carne del horno, extiende el glaseado de manera uniforme encima y regresa al horno.

Hornea de 15 a 20 minutos más, hasta que la temperatura interna alcance 160°F y el glaseado esté ligeramente caramelizado.

Deja reposar 10 minutos antes de cortar y servir.`,
    },
  },
},

{
  id: "toms-spaghetti",
  slug: "toms-spaghetti",
  name: "Tom's Spaghetti",
  effort: "normal",
  photoUrl: "/images/toms-spaghetti.jpg",
  tags: ["dinner", "pasta", "beef", "spaghetti", "comfort", "family-friendly", "leftovers-friendly"],
  // Tom's Spaghetti
suggestedSides: [
  "Caesar salad",
  "Garlic bread",
  "Roasted broccoli",
],
  notes: "A classic, hearty spaghetti dinner that pairs perfectly with Caesar salad and garlic bread.",
  ingredients: `1 box angel hair pasta
1 lb ground beef
1 green bell pepper, diced
1 (28 oz) can diced tomatoes
1 (16 oz) can tomato sauce
1 (6 oz) can tomato paste
2 tsp dried thyme
4 Tbsp Italian seasoning, divided
1 tsp salt
1/2 tsp pepper
2 Tbsp butter
1 Tbsp olive oil`,
  instructions: `Cook 1 lb ground beef in a skillet over medium heat until browned. Drain grease.

Add 1 diced green bell pepper, 1 can diced tomatoes, 1 can tomato sauce, 1 can tomato paste, 2 tsp dried thyme, 2 Tbsp Italian seasoning, 1 tsp salt, and 1/2 tsp pepper. Stir well.

Bring to a simmer, reduce heat to low, and simmer for 30 minutes.

In a pot, bring 6 cups of salted water to a boil. Add 1 box angel hair pasta and cook for about 5 minutes, stirring occasionally.

Drain the pasta and return it to the pot. Add 2 Tbsp butter, 1 Tbsp olive oil, and the remaining 2 Tbsp Italian seasoning. Stir well.

Serve pasta topped with meat sauce.

Optional: Pair with Caesar salad and garlic bread.`,
  translations: {
    es: {
      name: "Espagueti de Tom",
      notes:
        "Una cena clásica y sustanciosa de espagueti que combina perfecto con ensalada César y pan de ajo.",
      tags: [
        "cena",
        "pasta",
        "carne de res",
        "espagueti",
        "comida reconfortante",
        "familiar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Ensalada César",
        "Pan de ajo",
        "Brócoli asado",
      ],
      ingredients: `1 caja de pasta cabello de ángel
1 lb de carne molida de res
1 pimiento verde, picado en cubitos
1 lata (28 oz) de tomates en cubitos
1 lata (16 oz) de salsa de tomate
1 lata (6 oz) de pasta de tomate
2 tsp de tomillo seco
4 Tbsp de sazonador italiano, dividido
1 tsp de sal
1/2 tsp de pimienta
2 Tbsp de mantequilla
1 Tbsp de aceite de oliva`,
      instructions: `Cocina 1 lb de carne molida de res en un sartén a fuego medio hasta que esté dorada. Escurre la grasa.

Agrega 1 pimiento verde picado, 1 lata de tomates en cubitos, 1 lata de salsa de tomate, 1 lata de pasta de tomate, 2 tsp de tomillo seco, 2 Tbsp de sazonador italiano, 1 tsp de sal y 1/2 tsp de pimienta. Mezcla bien.

Lleva a un hervor suave, reduce el fuego a bajo y cocina durante 30 minutos.

En una olla, hierve 6 cups de agua con sal. Agrega 1 caja de pasta cabello de ángel y cocina unos 5 minutos, revolviendo de vez en cuando.

Escurre la pasta y regrésala a la olla. Agrega 2 Tbsp de mantequilla, 1 Tbsp de aceite de oliva y las 2 Tbsp restantes de sazonador italiano. Mezcla bien.

Sirve la pasta cubierta con salsa de carne.

Opcional: acompaña con ensalada César y pan de ajo.`,
    },
  },
},

{
  id: "shrimp-scampi",
  slug: "shrimp-scampi",
  name: "Shrimp Scampi",
  effort: "quick",
  photoUrl: "/images/shrimp-scampi.jpg",
  tags: ["dinner", "seafood", "shellfish", "shrimp", "quick", "skillet", "pasta", "restaurant-style"],
  // Shrimp Scampi
suggestedSides: [
  "Angel hair pasta",
  "Garlic bread",
  "Caesar salad",
],
  notes: "Light, buttery, and full of flavor. Great over angel hair pasta for an easy restaurant-style dinner at home.",
  ingredients: `1 1/2 lbs large shrimp, peeled and deveined
2 Tbsp butter
2 Tbsp olive oil
4 garlic cloves, minced
1/4 tsp red pepper flakes (optional)
1/2 cup dry white wine or low-sodium chicken broth
1 1/2 Tbsp lemon juice
1 lemon, cut into wedges
1/4 cup chopped fresh parsley
salt, to taste
pepper, to taste`,
  instructions: `Pat 1 1/2 lbs large shrimp dry and season with 1/2 tsp salt and 1/2 tsp pepper.

Heat 1 Tbsp olive oil and 1 Tbsp butter in a large non-reactive skillet over medium-high heat.

Add the shrimp in a single layer and cook 1 to 2 minutes per side until just opaque. Remove to a plate.

Lower heat to medium. Add the remaining 1 Tbsp olive oil and 1 Tbsp butter.

Sauté 4 minced garlic cloves and 1/4 tsp red pepper flakes, if using, for about 30 seconds until fragrant.

Add 1/2 cup dry white wine or low-sodium chicken broth and simmer for 2 minutes until reduced by half.

Stir in 1 1/2 Tbsp lemon juice.

Return the shrimp and any juices to the skillet and toss to coat.

Remove from heat and stir in 1/4 cup chopped fresh parsley.

Serve with lemon wedges from 1 lemon.

Optional: Pair with angel hair pasta.`,
  translations: {
    es: {
      name: "Camarones al ajillo con mantequilla",
      notes:
        "Ligero, mantequilloso y lleno de sabor. Queda excelente sobre pasta cabello de ángel para una cena fácil estilo restaurante en casa.",
      tags: [
        "cena",
        "mariscos",
        "camarones",
        "rápido",
        "sartén",
        "pasta",
        "estilo restaurante",
      ],
      suggestedSides: [
        "Pasta cabello de ángel",
        "Pan de ajo",
        "Ensalada César",
      ],
      ingredients: `1 1/2 lbs de camarones grandes, pelados y desvenados
2 Tbsp de mantequilla
2 Tbsp de aceite de oliva
4 dientes de ajo, picados
1/4 tsp de hojuelas de chile rojo, opcional
1/2 cup de vino blanco seco o caldo de pollo bajo en sodio
1 1/2 Tbsp de jugo de limón
1 limón, cortado en gajos
1/4 cup de perejil fresco picado
sal, al gusto
pimienta, al gusto`,
      instructions: `Seca 1 1/2 lbs de camarones grandes y sazona con 1/2 tsp de sal y 1/2 tsp de pimienta.

Calienta 1 Tbsp de aceite de oliva y 1 Tbsp de mantequilla en un sartén grande no reactivo a fuego medio-alto.

Agrega los camarones en una sola capa y cocina de 1 a 2 minutos por lado, hasta que apenas estén opacos. Retíralos a un plato.

Baja el fuego a medio. Agrega la 1 Tbsp restante de aceite de oliva y la 1 Tbsp restante de mantequilla.

Saltea 4 dientes de ajo picados y 1/4 tsp de hojuelas de chile rojo, si las usas, durante unos 30 segundos, hasta que suelten aroma.

Agrega 1/2 cup de vino blanco seco o caldo de pollo bajo en sodio y cocina a fuego bajo durante 2 minutos, hasta que se reduzca a la mitad.

Incorpora 1 1/2 Tbsp de jugo de limón.

Regresa los camarones y sus jugos al sartén y mezcla para cubrirlos.

Retira del fuego e incorpora 1/4 cup de perejil fresco picado.

Sirve con gajos de 1 limón.

Opcional: acompaña con pasta cabello de ángel.`,
    },
  },
},

{
  id: "maryland-crab-cake",
  slug: "maryland-crab-cake",
  name: "Maryland Crab Cake",
  effort: "normal",
  photoUrl: "/images/maryland-crab-cake.jpg",
  tags: ["dinner", "seafood", "shellfish", "crab", "baked", "classic", "maryland"],
  // Maryland Crab Cake
suggestedSides: [
  "Coleslaw",
  "Corn on the cob",
  "Roasted potatoes",
],
  notes: "Classic crab cakes with plenty of crab flavor and just enough binder to hold them together.",
  ingredients: `1 lb lump crab meat
1 large egg
1/4 cup mayonnaise
1 tsp dijon mustard
1 tsp worcestershire sauce
1 tsp fresh lemon juice
1 1/2 tsp Old Bay seasoning
1 tsp fresh parsley, chopped
2/3 cup cracker crumbs
1 lemon, cut into wedges`,
  instructions: `In a small bowl, whisk together 1/4 cup mayonnaise, 1 large egg, 1 tsp dijon mustard, 1 tsp worcestershire sauce, 1 1/2 tsp Old Bay seasoning, 1 tsp fresh lemon juice, and 1 tsp chopped fresh parsley.

Add 1 lb lump crab meat and gently fold it into the sauce.

Add 2/3 cup cracker crumbs and continue mixing gently. Be careful not to break up the crab meat too much.

Cover and refrigerate for at least 30 minutes.

Preheat oven to 400°F.

Divide the mixture into 6 portions and form into slightly flattened crab cakes.

Place on a parchment-lined baking sheet.

Bake for 15 to 18 minutes, until lightly browned.

Serve with lemon wedges from 1 lemon and your choice of cocktail sauce or tartar sauce.`,
  translations: {
    es: {
      name: "Pastelitos de cangrejo estilo Maryland",
      notes:
        "Pastelitos clásicos de cangrejo con mucho sabor a cangrejo y solo lo suficiente para mantenerlos unidos.",
      tags: [
        "cena",
        "mariscos",
        "cangrejo",
        "horneado",
        "clásico",
        "maryland",
      ],
      suggestedSides: [
        "Ensalada de col",
        "Elote",
        "Papas asadas",
      ],
      ingredients: `1 lb de carne de cangrejo en trozos
1 huevo grande
1/4 cup de mayonesa
1 tsp de mostaza dijon
1 tsp de salsa worcestershire
1 tsp de jugo de limón fresco
1 1/2 tsp de sazonador Old Bay
1 tsp de perejil fresco, picado
2/3 cup de migas de galleta salada
1 limón, cortado en gajos`,
      instructions: `En un tazón pequeño, bate 1/4 cup de mayonesa, 1 huevo grande, 1 tsp de mostaza dijon, 1 tsp de salsa worcestershire, 1 1/2 tsp de sazonador Old Bay, 1 tsp de jugo de limón fresco y 1 tsp de perejil fresco picado.

Agrega 1 lb de carne de cangrejo en trozos e incorpórala suavemente a la salsa.

Agrega 2/3 cup de migas de galleta salada y continúa mezclando con cuidado. Procura no deshacer demasiado la carne de cangrejo.

Cubre y refrigera por al menos 30 minutos.

Precalienta el horno a 400°F.

Divide la mezcla en 6 porciones y forma pastelitos de cangrejo ligeramente aplanados.

Colócalos en una bandeja para hornear cubierta con papel pergamino.

Hornea de 15 a 18 minutos, hasta que estén ligeramente dorados.

Sirve con gajos de 1 limón y la salsa cóctel o tártara que prefieras.`,
    },
  },
},

{
  id: "crock-pot-roast-beef",
  slug: "crock-pot-roast-beef",
  name: "Crock Pot Roast Beef",
  effort: "big",
  photoUrl: "/images/crock-pot-roast-beef.jpg",
  tags: ["dinner", "beef", "roast", "slow-cooker", "comfort", "family-friendly", "leftovers-friendly"],
  // Crock Pot Roast Beef
suggestedSides: [
  "Dinner rolls",
  "Side salad",
  "Green beans",
],
  notes: "A hearty slow-cooker classic with tender beef, vegetables, and an optional homemade gravy.",
  ingredients: `1 1/2 Tbsp olive oil, divided
1 (3 lb) chuck roast
1 tsp salt
1 tsp pepper
1 medium yellow onion, cut into thick slices
5 garlic cloves, minced
2 cups beef broth
2 tsp worcestershire sauce
1 Tbsp fresh thyme, minced
1 Tbsp fresh rosemary, minced
2 1/2 lbs small Yukon gold potatoes, left whole
2 cups baby carrots
2 cups celery, cut into 1-inch pieces
1 (8 oz) package baby bella mushrooms
2 1/2 Tbsp cornstarch mixed with 3 Tbsp beef broth (optional)
2 Tbsp fresh parsley, chopped`,
  instructions: `Heat 1 Tbsp olive oil in a large pot over medium-high heat.

Pat the 3 lb chuck roast dry and season generously with 1 tsp salt and 1 tsp pepper.

Sear roast until browned on both sides, about 4 to 5 minutes per side. Transfer to the slow cooker.

Add the remaining 1/2 Tbsp olive oil to the pot. Add 1 medium yellow onion cut into thick slices and cook for 2 minutes.

Add the 8 oz package of baby bella mushrooms and cook until they begin to brown. Add 5 minced garlic cloves and cook for 30 seconds more.

Pour the onion and mushroom mixture over the roast in the slow cooker.

Return the pot to heat. Add 2 cups beef broth, 2 tsp worcestershire sauce, 1 Tbsp minced fresh thyme, and 1 Tbsp minced fresh rosemary. Scrape up any browned bits from the bottom of the pot, then remove from heat.

Layer 2 1/2 lbs small Yukon gold potatoes, 2 cups baby carrots, and 2 cups celery cut into 1-inch pieces over and around the roast. Pour the broth mixture over the top and season lightly with additional salt and pepper.

Cover and cook on low for 8 to 9 hours, until the roast and vegetables are tender.

Remove the roast and vegetables. Shred the roast and discard excess fat.

Optional gravy: Strain the broth into a saucepan. Heat over medium-high. Whisk the 2 1/2 Tbsp cornstarch with 3 Tbsp beef broth, then stir into the simmering broth. Simmer for 30 to 60 seconds until thickened.

Serve the roast and vegetables topped with gravy and sprinkled with 2 Tbsp fresh chopped parsley.`,
  translations: {
    es: {
      name: "Carne asada en olla lenta",
      notes:
        "Un clásico sustancioso de olla lenta con carne tierna, verduras y un gravy casero opcional.",
      tags: [
        "cena",
        "carne de res",
        "asado",
        "olla lenta",
        "comida reconfortante",
        "familiar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Panecillos",
        "Ensalada sencilla",
        "Ejotes",
      ],
      ingredients: `1 1/2 Tbsp de aceite de oliva, dividido
1 asado de chuck roast (3 lb)
1 tsp de sal
1 tsp de pimienta
1 cebolla amarilla mediana, cortada en rebanadas gruesas
5 dientes de ajo, picados
2 cups de caldo de res
2 tsp de salsa worcestershire
1 Tbsp de tomillo fresco, picado
1 Tbsp de romero fresco, picado
2 1/2 lbs de papas Yukon gold pequeñas, enteras
2 cups de zanahorias baby
2 cups de apio, cortado en trozos de 1 inch
1 paquete (8 oz) de champiñones baby bella
2 1/2 Tbsp de maicena mezclada con 3 Tbsp de caldo de res, opcional
2 Tbsp de perejil fresco, picado`,
      instructions: `Calienta 1 Tbsp de aceite de oliva en una olla grande a fuego medio-alto.

Seca el chuck roast de 3 lb y sazónalo generosamente con 1 tsp de sal y 1 tsp de pimienta.

Sella el asado hasta que esté dorado por ambos lados, unos 4 a 5 minutos por lado. Pásalo a la olla lenta.

Agrega la 1/2 Tbsp restante de aceite de oliva a la olla. Agrega 1 cebolla amarilla mediana cortada en rebanadas gruesas y cocina durante 2 minutos.

Agrega el paquete de 8 oz de champiñones baby bella y cocina hasta que empiecen a dorarse. Agrega 5 dientes de ajo picados y cocina 30 segundos más.

Vierte la mezcla de cebolla y champiñones sobre el asado en la olla lenta.

Regresa la olla al fuego. Agrega 2 cups de caldo de res, 2 tsp de salsa worcestershire, 1 Tbsp de tomillo fresco picado y 1 Tbsp de romero fresco picado. Raspa los trozos dorados del fondo de la olla y luego retira del fuego.

Coloca 2 1/2 lbs de papas Yukon gold pequeñas, 2 cups de zanahorias baby y 2 cups de apio cortado en trozos de 1 inch sobre y alrededor del asado. Vierte la mezcla de caldo encima y sazona ligeramente con más sal y pimienta.

Tapa y cocina en low de 8 a 9 horas, hasta que el asado y las verduras estén tiernos.

Retira el asado y las verduras. Deshebra el asado y desecha el exceso de grasa.

Gravy opcional: cuela el caldo en una cacerola. Calienta a fuego medio-alto. Bate 2 1/2 Tbsp de maicena con 3 Tbsp de caldo de res, luego incorpora al caldo hirviendo suavemente. Cocina de 30 a 60 segundos, hasta que espese.

Sirve el asado y las verduras cubiertos con gravy y espolvoreados con 2 Tbsp de perejil fresco picado.`,
    },
  },
},

{
  id: "big-crockpot-potato-soup",
  slug: "big-crockpot-potato-soup",
  name: "Crock Pot Potato Soup",
  effort: "big",
  photoUrl: "/images/big-crockpot-potato-soup.jpg",
  tags: ["dinner", "soup", "comfort", "slow-cooker", "potatoes", "family-friendly", "leftovers-friendly"],
  isVegetarian: false,
  // Crock Pot Potato Soup
suggestedSides: [
  "Grilled cheese",
  "Side salad",
  "Dinner rolls",
],
  notes: "Creamy, hearty potato soup made easy in the slow cooker. Mashing some of the potatoes creates a thicker, more comforting texture without extra effort.",
  ingredients: `1 (30 oz) bag frozen diced hash brown potatoes
1 (32 oz) chicken broth
1 (10.75 oz) can cream of chicken soup
1/2 cup yellow onion, finely chopped
2 cloves garlic, minced
1/2 tsp pepper
1/2 tsp salt (plus more to taste)
1 tsp dried parsley (optional)
1/2 tsp smoked paprika (optional, for depth)
1 (8 oz) cream cheese, softened and cubed
1/2 cup sour cream (optional, for extra creaminess)

Toppings (optional):
green onions, sliced
cheddar cheese, shredded
bacon bits`,
  instructions: `Add 1 bag frozen diced hash brown potatoes, 1 carton chicken broth, 1 can cream of chicken soup, 1/2 cup finely chopped yellow onion, 2 minced garlic cloves, 1/2 tsp pepper, 1/2 tsp salt, 1 tsp dried parsley, and 1/2 tsp smoked paprika if using to a slow cooker. Stir to combine.

Cover and cook on low for 5 to 6 hours or on high for 3 to 4 hours, until the potatoes are tender and the flavors are well blended.

Use a potato masher to lightly mash some of the potatoes directly in the slow cooker to thicken the soup while still leaving some chunks for texture.

Add 8 oz softened and cubed cream cheese and stir until fully melted and smooth.

Stir in 1/2 cup sour cream if using, and cook for an additional 20 to 30 minutes on low until creamy and heated through.

Taste and adjust seasoning as needed.

Serve hot and top with shredded cheddar cheese, bacon bits, and sliced green onions if desired.`,
  translations: {
    es: {
      name: "Sopa de papa en olla lenta",
      notes:
        "Una sopa de papa cremosa y sustanciosa hecha fácil en la olla lenta. Machacar parte de las papas crea una textura más espesa y reconfortante sin esfuerzo extra.",
      tags: [
        "cena",
        "sopa",
        "comida reconfortante",
        "olla lenta",
        "papas",
        "familiar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Sándwich de queso a la plancha",
        "Ensalada sencilla",
        "Panecillos",
      ],
      ingredients: `1 bolsa (30 oz) de papas hash brown congeladas en cubitos
1 cartón (32 oz) de caldo de pollo
1 lata (10.75 oz) de crema de pollo
1/2 cup de cebolla amarilla, finamente picada
2 dientes de ajo, picados
1/2 tsp de pimienta
1/2 tsp de sal, más al gusto
1 tsp de perejil seco, opcional
1/2 tsp de paprika ahumada, opcional para más profundidad
1 paquete (8 oz) de queso crema, suavizado y cortado en cubitos
1/2 cup de crema agria, opcional para más cremosidad

Toppings opcionales:
cebollines, rebanados
queso cheddar, rallado
tocino en trocitos`,
      instructions: `Agrega 1 bolsa de papas hash brown congeladas en cubitos, 1 cartón de caldo de pollo, 1 lata de crema de pollo, 1/2 cup de cebolla amarilla finamente picada, 2 dientes de ajo picados, 1/2 tsp de pimienta, 1/2 tsp de sal, 1 tsp de perejil seco y 1/2 tsp de paprika ahumada si la usas a una olla lenta. Mezcla para combinar.

Tapa y cocina en low de 5 a 6 horas o en high de 3 a 4 horas, hasta que las papas estén tiernas y los sabores estén bien integrados.

Usa un machacador de papas para machacar ligeramente algunas papas directamente en la olla lenta y espesar la sopa, dejando algunos trozos para textura.

Agrega 8 oz de queso crema suavizado y cortado en cubitos, y mezcla hasta que se derrita completamente y quede suave.

Incorpora 1/2 cup de crema agria si la usas, y cocina de 20 a 30 minutos adicionales en low, hasta que esté cremosa y caliente.

Prueba y ajusta los condimentos según sea necesario.

Sirve caliente y cubre con queso cheddar rallado, tocino en trocitos y cebollines rebanados si deseas.`,
    },
  },
},

{
  id: "big-crispy-chicken-wings",
  slug: "big-crispy-chicken-wings",
  name: "Crispy Chicken Wings",
  effort: "big",
  photoUrl: "/images/big-crispy-chicken-wings.jpg",
  tags: ["dinner", "chicken", "wings", "fried", "game-day", "crispy", "comfort", "crowd-pleaser"],
  isVegetarian: false,
  // Crispy Chicken Wings
suggestedSides: [
  "Celery sticks",
  "Carrot sticks",
  "French fries",
],
  notes: "Ultra crispy, restaurant-style wings made at home. Drying the wings thoroughly and frying at the correct temperature are the keys to achieving that perfect crunch.",
  ingredients: `2 to 3 lbs chicken wings (flats and drums, separated)
vegetable oil (for frying)
1 Tbsp beef tallow (optional, for extra flavor)
1/2 cup cornstarch
1 tsp salt
1/2 tsp pepper
1/2 tsp garlic powder
1/2 tsp paprika (optional)

Buffalo Sauce:
1/2 cup Frank’s RedHot
1/3 cup unsalted butter, melted

Optional for serving:
celery sticks
carrot sticks
ranch or blue cheese dressing`,
  instructions: `If using whole wings, separate 2 to 3 lbs of chicken wings into flats and drums and remove wing tips.

Pat the wings completely dry with paper towels. For best results, place wings on a rack and refrigerate uncovered for several hours or overnight to dry out the skin.

In a large bowl, toss the wings with 1/2 cup cornstarch, 1 tsp salt, 1/2 tsp pepper, 1/2 tsp garlic powder, and 1/2 tsp paprika until evenly coated.

Heat vegetable oil and 1 Tbsp beef tallow if using in a deep pot or fryer to 375°F.

Fry wings in batches for 10 to 12 minutes, until golden brown, crispy, and the internal temperature reaches at least 165°F. Do not overcrowd the pot.

Remove wings to a wire rack, not paper towels, to keep them crispy.

In a separate bowl, whisk together 1/2 cup Frank’s RedHot and 1/3 cup melted unsalted butter.

Toss the wings in the sauce until evenly coated, or serve sauce on the side for dipping.

Serve immediately with celery sticks, carrot sticks, and ranch or blue cheese dressing if desired.`,
  translations: {
    es: {
      name: "Alitas de pollo crujientes",
      notes:
        "Alitas ultra crujientes estilo restaurante hechas en casa. Secar bien las alitas y freír a la temperatura correcta son las claves para lograr ese crujido perfecto.",
      tags: [
        "cena",
        "pollo",
        "alitas",
        "frito",
        "día de partido",
        "crujiente",
        "comida reconfortante",
        "para compartir",
      ],
      suggestedSides: [
        "Bastones de apio",
        "Palitos de zanahoria",
        "Papas fritas",
      ],
      ingredients: `2 a 3 lbs de alitas de pollo, flats y drums separados
aceite vegetal para freír
1 Tbsp de sebo de res, opcional para más sabor
1/2 cup de maicena
1 tsp de sal
1/2 tsp de pimienta
1/2 tsp de ajo en polvo
1/2 tsp de paprika, opcional

Salsa Buffalo:
1/2 cup de Frank’s RedHot
1/3 cup de mantequilla sin sal, derretida

Opcional para servir:
palitos de apio
palitos de zanahoria
aderezo ranch o blue cheese`,
      instructions: `Si usas alitas enteras, separa 2 a 3 lbs de alitas de pollo en flats y drums, y retira las puntas.

Seca completamente las alitas con toallas de papel. Para mejores resultados, coloca las alitas sobre una rejilla y refrigera destapadas durante varias horas o toda la noche para secar la piel.

En un tazón grande, mezcla las alitas con 1/2 cup de maicena, 1 tsp de sal, 1/2 tsp de pimienta, 1/2 tsp de ajo en polvo y 1/2 tsp de paprika hasta cubrirlas de manera uniforme.

Calienta aceite vegetal y 1 Tbsp de sebo de res si lo usas en una olla profunda o freidora a 375°F.

Fríe las alitas en tandas de 10 a 12 minutos, hasta que estén doradas, crujientes y la temperatura interna alcance al menos 165°F. No llenes demasiado la olla.

Retira las alitas a una rejilla, no a toallas de papel, para mantenerlas crujientes.

En otro tazón, bate 1/2 cup de Frank’s RedHot y 1/3 cup de mantequilla sin sal derretida.

Mezcla las alitas con la salsa hasta cubrirlas de manera uniforme, o sirve la salsa aparte para mojar.

Sirve de inmediato con palitos de apio, palitos de zanahoria y aderezo ranch o blue cheese si deseas.`,
    },
  },
},

{
  id: "normal-grilled-bbq-chicken-thighs",
  slug: "normal-grilled-bbq-chicken-thighs",
  name: "Grilled BBQ Chicken Thighs",
  effort: "normal",
  photoUrl: "/images/normal-grilled-bbq-chicken-thighs.jpg",
  tags: ["dinner", "chicken", "grilling", "bbq", "summer", "juicy", "leftovers-friendly"],
  isVegetarian: false,
  // Grilled BBQ Chicken Thighs
suggestedSides: [
  "Baked beans",
  "Coleslaw",
  "Corn on the cob",
],
  notes: "Juicy, smoky grilled chicken thighs with a sticky BBQ glaze. Cooking over indirect heat prevents burning while keeping the inside tender and flavorful.",
  ingredients: `6 bone-in, skin-on chicken thighs
1 Tbsp olive oil
1 tsp salt
1/2 tsp pepper
1/2 tsp garlic powder
1/2 tsp paprika (or smoked paprika for extra flavor)
1 cup BBQ sauce (plus extra for serving)`,
  instructions: `Preheat grill to medium heat, about 375°F to 400°F. Set up for indirect heat if possible.

Pat 6 bone-in, skin-on chicken thighs dry with paper towels. Rub with 1 Tbsp olive oil, then season evenly with 1 tsp salt, 1/2 tsp pepper, 1/2 tsp garlic powder, and 1/2 tsp paprika.

Place chicken skin-side down over direct heat. Grill for 5 to 7 minutes, until the skin is crispy and has nice grill marks.

Flip and move to indirect heat. Close the lid and cook for 15 to 20 minutes, turning occasionally, until the internal temperature reaches about 155°F to 160°F.

Brush 1 cup BBQ sauce on both sides of the chicken and return briefly to direct heat. Grill for 2 to 3 minutes, turning once, until the sauce is caramelized and slightly charred.

Remove from grill when internal temperature reaches 165°F.

Let rest for 5 minutes before serving.`,
  translations: {
    es: {
      name: "Muslos de pollo BBQ a la parrilla",
      notes:
        "Muslos de pollo jugosos y ahumados a la parrilla con un glaseado BBQ pegajoso. Cocinar con calor indirecto evita que se quemen mientras quedan tiernos y llenos de sabor por dentro.",
      tags: [
        "cena",
        "pollo",
        "parrilla",
        "bbq",
        "verano",
        "jugoso",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Frijoles horneados",
        "Ensalada de col",
        "Elote",
      ],
      ingredients: `6 muslos de pollo con hueso y piel
1 Tbsp de aceite de oliva
1 tsp de sal
1/2 tsp de pimienta
1/2 tsp de ajo en polvo
1/2 tsp de paprika o paprika ahumada para más sabor
1 cup de salsa BBQ, más extra para servir`,
      instructions: `Precalienta la parrilla a fuego medio, aproximadamente 375°F a 400°F. Prepara una zona de calor indirecto si es posible.

Seca 6 muslos de pollo con hueso y piel con toallas de papel. Frota con 1 Tbsp de aceite de oliva y luego sazona de manera uniforme con 1 tsp de sal, 1/2 tsp de pimienta, 1/2 tsp de ajo en polvo y 1/2 tsp de paprika.

Coloca el pollo con la piel hacia abajo sobre calor directo. Asa de 5 a 7 minutos, hasta que la piel esté crujiente y tenga buenas marcas de parrilla.

Voltea y mueve a calor indirecto. Cierra la tapa y cocina de 15 a 20 minutos, volteando de vez en cuando, hasta que la temperatura interna alcance aproximadamente 155°F a 160°F.

Barniza 1 cup de salsa BBQ por ambos lados del pollo y regresa brevemente a calor directo. Asa de 2 a 3 minutos, volteando una vez, hasta que la salsa esté caramelizada y ligeramente tostada.

Retira de la parrilla cuando la temperatura interna alcance 165°F.

Deja reposar 5 minutos antes de servir.`,
    },
  },
},

{
  id: "quick-grilled-steak",
  slug: "quick-grilled-steak",
  name: "Grilled Steak",
  effort: "quick",
  photoUrl: "/images/quick-grilled-steak.jpg",
  tags: ["dinner", "beef", "grilling", "classic", "quick", "high-protein", "low-carb"],
  isVegetarian: false,
  // Grilled Steak
suggestedSides: [
  "Baked potato",
  "Grilled asparagus",
  "Side salad",
],
  notes: "Simple, classic grilled steak with a flavorful crust and juicy center. Letting the steak rest before slicing is key to keeping it tender and juicy.",
  ingredients: `2 ribeye or sirloin steaks (about 1 to 1 1/2 inches thick)
1 Tbsp olive oil
1 tsp salt
1/2 tsp pepper
1/2 tsp garlic powder (optional)
1 Tbsp butter (optional, for finishing)`,
  instructions: `Preheat grill to high heat, about 450°F to 500°F.

Pat 2 ribeye or sirloin steaks completely dry with paper towels. Rub with 1 Tbsp olive oil and season generously with 1 tsp salt, 1/2 tsp pepper, and 1/2 tsp garlic powder if using.

Place steaks on the hot grill and cook undisturbed for 4 to 5 minutes, until a deep golden-brown crust forms.

Flip and cook another 3 to 5 minutes, depending on thickness and desired doneness.

For more even cooking, move steaks to a slightly cooler part of the grill and close the lid if needed.

Remove from grill when internal temperature reaches about 130°F for medium-rare. It will rise as it rests.

Top with a small pat of butter if desired and let rest for 5 to 10 minutes before slicing.

Slice against the grain and serve.`,
  translations: {
    es: {
      name: "Bistec a la parrilla",
      notes:
        "Un bistec clásico y sencillo a la parrilla, con una costra sabrosa y un centro jugoso. Dejarlo reposar antes de cortarlo es clave para mantenerlo tierno y jugoso.",
      tags: [
        "cena",
        "carne de res",
        "parrilla",
        "clásico",
        "rápido",
        "alto en proteína",
        "bajo en carbohidratos",
      ],
      suggestedSides: [
        "Papa al horno",
        "Espárragos a la parrilla",
        "Ensalada sencilla",
      ],
      ingredients: `2 bistecs ribeye o sirloin (aprox. 1 a 1 1/2 inches de grosor)
1 Tbsp de aceite de oliva
1 tsp de sal
1/2 tsp de pimienta
1/2 tsp de ajo en polvo, opcional
1 Tbsp de mantequilla, opcional para terminar`,
      instructions: `Precalienta la parrilla a fuego alto, aproximadamente 450°F a 500°F.

Seca completamente 2 bistecs ribeye o sirloin con toallas de papel. Frota con 1 Tbsp de aceite de oliva y sazona generosamente con 1 tsp de sal, 1/2 tsp de pimienta y 1/2 tsp de ajo en polvo si lo usas.

Coloca los bistecs en la parrilla caliente y cocina sin mover de 4 a 5 minutos, hasta que se forme una costra dorada intensa.

Voltea y cocina otros 3 a 5 minutos, según el grosor y el punto de cocción deseado.

Para una cocción más pareja, mueve los bistecs a una zona un poco más fresca de la parrilla y cierra la tapa si es necesario.

Retira de la parrilla cuando la temperatura interna alcance unos 130°F para término medio-rojo. La temperatura subirá mientras reposa.

Agrega un poco de mantequilla encima si deseas y deja reposar de 5 a 10 minutos antes de cortar.

Corta contra la fibra y sirve.`,
    },
  },
},

{
  id: "quick-grilled-chicken-breasts",
  slug: "quick-grilled-chicken-breasts",
  name: "Grilled Chicken Breasts",
  effort: "quick",
  photoUrl: "/images/quick-grilled-chicken-breasts.jpg",
  tags: ["dinner", "chicken", "grilling", "healthy", "high-protein", "meal-prep", "quick", "leftovers-friendly"],
  isVegetarian: false,
  // Grilled Chicken Breasts
suggestedSides: [
  "Rice pilaf",
  "Grilled vegetables",
  "Simple green salad",
],
  notes: "Juicy, versatile grilled chicken breasts that pair with almost anything. Pounding to even thickness and not overcooking are key to keeping them tender.",
  ingredients: `4 boneless, skinless chicken breasts
2 Tbsp olive oil
1 tsp salt
1/2 tsp pepper
1 tsp garlic powder
1/2 tsp paprika (optional, for color and flavor)
1 Tbsp lemon juice (optional, for brightness)`,
  instructions: `Preheat grill to medium-high heat, about 400°F to 425°F.

If 4 boneless, skinless chicken breasts are thick, pound them to an even thickness for more even cooking.

Pat chicken dry with paper towels. Brush with 2 Tbsp olive oil, then season evenly with 1 tsp salt, 1/2 tsp pepper, 1 tsp garlic powder, and 1/2 tsp paprika if using.

Place chicken on the grill and cook for 5 to 6 minutes without moving, until grill marks form and the chicken releases easily.

Flip and cook another 5 to 7 minutes, or until internal temperature reaches 160°F to 165°F.

If needed, move to a slightly cooler part of the grill and close the lid to finish cooking without burning.

Remove from grill and drizzle with 1 Tbsp lemon juice if using.

Let rest for 5 minutes before slicing to keep juices locked in.`,
  translations: {
    es: {
      name: "Pechugas de pollo a la parrilla",
      notes:
        "Pechugas de pollo jugosas y versátiles que combinan con casi todo. Aplanarlas a un grosor uniforme y no cocinarlas de más es clave para mantenerlas tiernas.",
      tags: [
        "cena",
        "pollo",
        "parrilla",
        "saludable",
        "alto en proteína",
        "meal prep",
        "rápido",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Arroz pilaf",
        "Verduras a la parrilla",
        "Ensalada verde sencilla",
      ],
      ingredients: `4 pechugas de pollo sin hueso y sin piel
2 Tbsp de aceite de oliva
1 tsp de sal
1/2 tsp de pimienta
1 tsp de ajo en polvo
1/2 tsp de paprika, opcional para color y sabor
1 Tbsp de jugo de limón, opcional para dar frescura`,
      instructions: `Precalienta la parrilla a fuego medio-alto, aproximadamente 400°F a 425°F.

Si las 4 pechugas de pollo sin hueso y sin piel están gruesas, aplánalas hasta que tengan un grosor uniforme para que se cocinen parejo.

Seca el pollo con toallas de papel. Barniza con 2 Tbsp de aceite de oliva, luego sazona de manera uniforme con 1 tsp de sal, 1/2 tsp de pimienta, 1 tsp de ajo en polvo y 1/2 tsp de paprika si la usas.

Coloca el pollo en la parrilla y cocina de 5 a 6 minutos sin moverlo, hasta que se formen marcas de parrilla y el pollo se despegue fácilmente.

Voltea y cocina otros 5 a 7 minutos, o hasta que la temperatura interna alcance 160°F a 165°F.

Si es necesario, mueve el pollo a una zona un poco más fresca de la parrilla y cierra la tapa para terminar la cocción sin quemarlo.

Retira de la parrilla y rocía con 1 Tbsp de jugo de limón si lo usas.

Deja reposar 5 minutos antes de cortar para mantener los jugos dentro.`,
    },
  },
},

{
  id: "quick-grilled-shrimp-skewers",
  slug: "quick-grilled-shrimp-skewers",
  name: "Grilled Shrimp Skewers",
  effort: "quick",
  photoUrl: "/images/quick-grilled-shrimp-skewers.jpg",
  tags: ["dinner", "seafood", "shellfish", "shrimp", "grilling", "quick", "healthy", "high-protein", "leftovers-friendly"],
  isVegetarian: false,
  // Grilled Shrimp Skewers
suggestedSides: [
  "Cilantro lime rice",
  "Grilled vegetables",
  "Cucumber salad",
],
  notes: "Quick and flavorful grilled shrimp with bright lemon and garlic. Watch closely while cooking—shrimp cook fast and can become rubbery if overdone.",
  ingredients: `1 lb large shrimp, peeled and deveined (tails on or off)
2 Tbsp olive oil
2 cloves garlic, minced
juice of 1 lemon
1 tsp lemon zest (optional, for extra brightness)
1/2 tsp salt
1/2 tsp pepper
1/2 tsp paprika (optional, for color and mild flavor)
1 Tbsp fresh parsley, chopped (optional)`,
  instructions: `Preheat grill to medium-high heat, about 400°F to 425°F.

If using wooden skewers, soak them in water for at least 20 minutes to prevent burning.

Pat 1 lb large shrimp dry with paper towels. Thread onto skewers, keeping them close together but not overcrowded.

In a small bowl, whisk together 2 Tbsp olive oil, 2 minced cloves garlic, the juice of 1 lemon, 1 tsp lemon zest if using, 1/2 tsp salt, 1/2 tsp pepper, and 1/2 tsp paprika.

Brush the mixture evenly over the shrimp.

Place skewers on the grill and cook for 2 to 3 minutes per side, until the shrimp turn pink, opaque, and slightly firm.

Avoid overcooking—shrimp should form a loose “C” shape, not a tight “O”.

Remove from grill and sprinkle with 1 Tbsp fresh chopped parsley if desired. Serve immediately.`,
  translations: {
    es: {
      name: "Brochetas de camarón a la parrilla",
      notes:
        "Camarones a la parrilla rápidos y llenos de sabor, con limón fresco y ajo. Vigílalos de cerca mientras se cocinan; los camarones se cocinan rápido y pueden quedar gomosos si se pasan.",
      tags: [
        "cena",
        "mariscos",
        "camarones",
        "parrilla",
        "rápido",
        "saludable",
        "alto en proteína",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Arroz con cilantro y lima",
        "Verduras a la parrilla",
        "Ensalada de pepino",
      ],
      ingredients: `1 lb de camarones grandes, pelados y desvenados, con o sin cola
2 Tbsp de aceite de oliva
2 dientes de ajo, picados
jugo de 1 limón
1 tsp de ralladura de limón, opcional para más frescura
1/2 tsp de sal
1/2 tsp de pimienta
1/2 tsp de paprika, opcional para color y sabor suave
1 Tbsp de perejil fresco, picado, opcional`,
      instructions: `Precalienta la parrilla a fuego medio-alto, aproximadamente 400°F a 425°F.

Si usas brochetas de madera, remójalas en agua por al menos 20 minutos para evitar que se quemen.

Seca 1 lb de camarones grandes con toallas de papel. Ensártalos en brochetas, manteniéndolos juntos pero sin amontonarlos.

En un tazón pequeño, bate 2 Tbsp de aceite de oliva, 2 dientes de ajo picados, el jugo de 1 limón, 1 tsp de ralladura de limón si la usas, 1/2 tsp de sal, 1/2 tsp de pimienta y 1/2 tsp de paprika.

Barniza la mezcla de manera uniforme sobre los camarones.

Coloca las brochetas en la parrilla y cocina de 2 a 3 minutos por lado, hasta que los camarones estén rosados, opacos y ligeramente firmes.

Evita cocinarlos de más; los camarones deben formar una “C” suelta, no una “O” cerrada.

Retira de la parrilla y espolvorea con 1 Tbsp de perejil fresco picado si deseas. Sirve de inmediato.`,
    },
  },
},

{
  id: "quick-grilled-sausage-peppers",
  slug: "quick-grilled-sausage-peppers",
  name: "Grilled Sausage and Peppers",
  effort: "quick",
  photoUrl: "/images/quick-grilled-sausage-peppers.jpg",
  tags: ["dinner", "sausage", "grilling", "quick", "summer", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  // Grilled Sausage and Peppers
suggestedSides: [
  "Hoagie rolls",
  "Potato salad",
  "Coleslaw",
],
  notes: "A quick, flavorful grilling classic with smoky sausage and tender peppers. Adding a splash of balsamic at the end brings a subtle sweetness that elevates the dish.",
  ingredients: `1 (12 to 14 oz) package smoked sausage or Italian sausage
2 bell peppers (any color), sliced
1 large yellow onion, sliced
1 Tbsp olive oil
1/2 tsp salt
1/2 tsp pepper
1/2 tsp Italian seasoning (optional)
1/2 tsp garlic powder
1 Tbsp balsamic vinegar (optional, for finishing)
hoagie rolls or buns (optional, for serving)`,
  instructions: `Preheat grill to medium heat, about 375°F to 400°F.

Toss 2 sliced bell peppers and 1 large sliced yellow onion with 1 Tbsp olive oil, 1/2 tsp salt, 1/2 tsp pepper, 1/2 tsp Italian seasoning, and 1/2 tsp garlic powder.

Place the sausage directly on the grill and cook for 10 to 12 minutes, turning occasionally, until heated through and lightly charred.

Meanwhile, place the seasoned vegetables in a grill basket or foil pan. Grill for 8 to 10 minutes, stirring occasionally, until tender and slightly charred at the edges.

For extra flavor, drizzle the vegetables with 1 Tbsp balsamic vinegar during the last minute of cooking.

Remove everything from the grill and let rest for a few minutes.

Serve the sausage with the peppers and onions, either on a plate or in toasted hoagie rolls.`,
  translations: {
    es: {
      name: "Salchicha y pimientos a la parrilla",
      notes:
        "Un clásico rápido y sabroso a la parrilla, con salchicha ahumada y pimientos tiernos. Agregar un chorrito de balsámico al final aporta una dulzura sutil que eleva el plato.",
      tags: [
        "cena",
        "salchicha",
        "parrilla",
        "rápido",
        "verano",
        "una sartén",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Panecillos para hoagie",
        "Ensalada de papa",
        "Ensalada de col",
      ],
      ingredients: `1 paquete (12 a 14 oz) de salchicha ahumada o salchicha italiana
2 pimientos, de cualquier color, rebanados
1 cebolla amarilla grande, rebanada
1 Tbsp de aceite de oliva
1/2 tsp de sal
1/2 tsp de pimienta
1/2 tsp de sazonador italiano, opcional
1/2 tsp de ajo en polvo
1 Tbsp de vinagre balsámico, opcional para terminar
panes hoagie o bollos, opcional para servir`,
      instructions: `Precalienta la parrilla a fuego medio, aproximadamente 375°F a 400°F.

Mezcla 2 pimientos rebanados y 1 cebolla amarilla grande rebanada con 1 Tbsp de aceite de oliva, 1/2 tsp de sal, 1/2 tsp de pimienta, 1/2 tsp de sazonador italiano y 1/2 tsp de ajo en polvo.

Coloca la salchicha directamente en la parrilla y cocina de 10 a 12 minutos, volteando de vez en cuando, hasta que esté caliente y ligeramente tostada.

Mientras tanto, coloca las verduras sazonadas en una canasta para parrilla o charola de aluminio. Asa de 8 a 10 minutos, revolviendo ocasionalmente, hasta que estén tiernas y ligeramente tostadas en los bordes.

Para más sabor, rocía las verduras con 1 Tbsp de vinagre balsámico durante el último minuto de cocción.

Retira todo de la parrilla y deja reposar unos minutos.

Sirve la salchicha con los pimientos y cebollas, ya sea en un plato o dentro de panes hoagie tostados.`,
    },
  },
},

{
  id: "normal-grilled-pork-chops",
  slug: "normal-grilled-pork-chops",
  name: "Grilled Pork Chops",
  effort: "normal",
  photoUrl: "/images/normal-grilled-pork-chops.jpg",
  tags: ["dinner", "pork", "grilling", "juicy", "high-protein", "summer", "leftovers-friendly"],
  isVegetarian: false,
  // Grilled Pork Chops
suggestedSides: [
  "Applesauce",
  "Roasted potatoes",
  "Green beans",
],
  notes: "Juicy grilled pork chops with a flavorful crust. Avoid overcooking—pulling at 140°F to 145°F and resting ensures tender, not dry, pork.",
  ingredients: `4 bone-in pork chops (about 1 inch thick)
2 Tbsp olive oil
1 tsp salt
1/2 tsp pepper
1 tsp paprika (or smoked paprika for extra depth)
1/2 tsp garlic powder
1/2 tsp onion powder
1 Tbsp brown sugar (optional, for light caramelization)`,
  instructions: `Preheat grill to medium-high heat, about 400°F to 425°F. Set up a two-zone fire if possible.

Pat 4 bone-in pork chops dry with paper towels. Rub with 2 Tbsp olive oil, then season evenly with 1 tsp salt, 1/2 tsp pepper, 1 tsp paprika, 1/2 tsp garlic powder, 1/2 tsp onion powder, and 1 Tbsp brown sugar if using.

Place pork chops over direct heat and grill for 3 to 4 minutes without moving, until grill marks form.

Flip and cook another 3 to 4 minutes.

Move pork chops to indirect heat, close the lid, and cook for an additional 4 to 6 minutes, until internal temperature reaches 140°F to 145°F.

Remove from grill and let rest for 5 minutes. The temperature will rise slightly as it rests.

Serve warm.`,
  translations: {
    es: {
      name: "Chuletas de cerdo a la parrilla",
      notes:
        "Chuletas de cerdo jugosas a la parrilla con una costra llena de sabor. Evita cocinarlas de más; retirarlas a 140°F a 145°F y dejarlas reposar asegura que queden tiernas, no secas.",
      tags: [
        "cena",
        "cerdo",
        "parrilla",
        "jugoso",
        "alto en proteína",
        "verano",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Puré de manzana",
        "Papas asadas",
        "Ejotes",
      ],
      ingredients: `4 chuletas de cerdo con hueso (aprox. 1 inch de grosor)
2 Tbsp de aceite de oliva
1 tsp de sal
1/2 tsp de pimienta
1 tsp de paprika o paprika ahumada para más profundidad
1/2 tsp de ajo en polvo
1/2 tsp de cebolla en polvo
1 Tbsp de azúcar morena, opcional para una caramelización ligera`,
      instructions: `Precalienta la parrilla a fuego medio-alto, aproximadamente 400°F a 425°F. Prepara una zona de dos temperaturas si es posible.

Seca 4 chuletas de cerdo con hueso con toallas de papel. Frota con 2 Tbsp de aceite de oliva y luego sazona de manera uniforme con 1 tsp de sal, 1/2 tsp de pimienta, 1 tsp de paprika, 1/2 tsp de ajo en polvo, 1/2 tsp de cebolla en polvo y 1 Tbsp de azúcar morena si la usas.

Coloca las chuletas sobre calor directo y asa de 3 a 4 minutos sin moverlas, hasta que se formen marcas de parrilla.

Voltea y cocina otros 3 a 4 minutos.

Mueve las chuletas a calor indirecto, cierra la tapa y cocina de 4 a 6 minutos más, hasta que la temperatura interna alcance 140°F a 145°F.

Retira de la parrilla y deja reposar 5 minutos. La temperatura subirá un poco mientras reposan.

Sirve caliente.`,
    },
  },
},

{
  id: "quick-grilled-burgers",
  slug: "quick-grilled-burgers",
  name: "Grilled Burgers",
  effort: "quick",
  photoUrl: "/images/quick-grilled-burgers.jpg",
  tags: ["dinner", "beef", "grilling", "cookout", "quick", "summer", "family-friendly"],
  // Grilled Burgers
suggestedSides: [
  "French fries",
  "Coleslaw",
  "Watermelon slices",
],
  notes: "A classic backyard burger with juicy patties, melted cheese, and all your favorite toppings.",
  ingredients: `2 lbs ground beef (80/20)
1 1/2 tsp salt
1 tsp pepper
1/2 tsp garlic powder
1/2 Tbsp olive oil
4 to 6 hamburger buns
sliced cheddar cheese
lettuce
tomato, sliced
onion, sliced
pickles`,
  instructions: `Divide 2 lbs ground beef into equal portions, about 1/3 to 1/2 lb each.
Gently shape into patties about 1 inch thick.
Press a small dimple into the center of each patty to prevent puffing.

Preheat grill to medium-high heat.

Lightly brush patties with 1/2 Tbsp olive oil, then season generously with 1 1/2 tsp salt, 1 tsp pepper, and 1/2 tsp garlic powder just before grilling.

Place patties on the grill and close the lid.
Grill for 4 to 5 minutes on the first side until a nice char develops.

Flip once and do not press down on the patties.
Cook another 4 to 5 minutes, or until desired doneness.

During the last minute, add cheddar cheese slices and close the lid to melt.

Remove from grill and let rest for 2 to 3 minutes.

While burgers rest, toast 4 to 6 hamburger buns and sliced onions on the grill for 30 to 45 seconds.

Assemble burgers with lettuce, sliced tomato, and pickles, and serve with chips or potato wedges.`,
  translations: {
    es: {
      name: "Hamburguesas a la parrilla",
      notes:
        "Una hamburguesa clásica de patio con carne jugosa, queso derretido y todos tus toppings favoritos.",
      tags: [
        "cena",
        "carne de res",
        "parrilla",
        "parrillada",
        "rápido",
        "verano",
        "familiar",
      ],
      suggestedSides: [
        "Papas fritas",
        "Ensalada de col",
        "Rebanadas de sandía",
      ],
      ingredients: `2 lbs de carne molida de res (80/20)
1 1/2 tsp de sal
1 tsp de pimienta
1/2 tsp de ajo en polvo
1/2 Tbsp de aceite de oliva
4 a 6 panes para hamburguesa
queso cheddar en rebanadas
lechuga
tomate, rebanado
cebolla, rebanada
pepinillos`,
      instructions: `Divide 2 lbs de carne molida de res en porciones iguales, de aproximadamente 1/3 a 1/2 lb cada una.
Forma suavemente hamburguesas de aproximadamente 1 inch de grosor.
Presiona un pequeño hueco en el centro de cada hamburguesa para evitar que se infle.

Precalienta la parrilla a fuego medio-alto.

Barniza ligeramente las hamburguesas con 1/2 Tbsp de aceite de oliva, luego sazona generosamente con 1 1/2 tsp de sal, 1 tsp de pimienta y 1/2 tsp de ajo en polvo justo antes de asarlas.

Coloca las hamburguesas en la parrilla y cierra la tapa.
Asa de 4 a 5 minutos por el primer lado, hasta que se forme un buen dorado.

Voltea una sola vez y no presiones las hamburguesas.
Cocina otros 4 a 5 minutos, o hasta el punto de cocción deseado.

Durante el último minuto, agrega las rebanadas de queso cheddar y cierra la tapa para que se derrita.

Retira de la parrilla y deja reposar de 2 a 3 minutos.

Mientras reposan las hamburguesas, tuesta de 4 a 6 panes para hamburguesa y las rebanadas de cebolla en la parrilla de 30 a 45 segundos.

Arma las hamburguesas con lechuga, tomate rebanado y pepinillos, y sirve con papas fritas de bolsa o gajos de papa.`,
    },
  },
},

{
  id: "grilled-cheese-sandwich",
  slug: "grilled-cheese-sandwich",
  name: "Grilled Cheese Sandwich",
  effort: "quick",
  photoUrl: "/images/grilled-cheese-sandwich.jpg",
  tags: ["lunch", "sandwich", "quick", "comfort", "cheese", "kid-friendly"],
  // Grilled Cheese Sandwich
suggestedSides: [
  "Tomato soup",
  "Pickle spears",
  "Apple slices",
],
  notes: "Simple, classic, and always a winner. Even better with a bowl of warm tomato soup.",
  ingredients: `sourdough bread
butter
mild cheddar cheese slices`,
  instructions: `Spread 1/2 Tbsp butter on one side of each slice of sourdough bread.

Heat a non-stick pan over medium-low heat.

Place 2 slices of bread in the pan, buttered side down.

Stack mild cheddar cheese slices on one piece of bread, then top with the other piece of bread, buttered side facing up.

Cook, flipping once, until both sides are golden brown and the cheese is melted, about 6 minutes total.

Cut in half diagonally and serve.

Optional: Serve with warm tomato soup.`,
  translations: {
    es: {
      name: "Sándwich de queso a la plancha",
      notes:
        "Simple, clásico y siempre ganador. Aún mejor con un tazón de sopa de tomate caliente.",
      tags: [
        "almuerzo",
        "sándwich",
        "rápido",
        "comida reconfortante",
        "queso",
        "para niños",
      ],
      suggestedSides: [
        "Sopa de tomate",
        "Pepinillos en tiras",
        "Rebanadas de manzana",
      ],
      ingredients: `pan de masa madre
mantequilla
rebanadas de queso cheddar suave`,
      instructions: `Unta 1/2 Tbsp de mantequilla en un lado de cada rebanada de pan de masa madre.

Calienta un sartén antiadherente a fuego medio-bajo.

Coloca 2 rebanadas de pan en el sartén, con el lado con mantequilla hacia abajo.

Apila rebanadas de queso cheddar suave sobre una rebanada de pan, luego cubre con la otra rebanada de pan, con el lado con mantequilla hacia arriba.

Cocina, volteando una vez, hasta que ambos lados estén dorados y el queso se derrita, aproximadamente 6 minutos en total.

Corta en diagonal por la mitad y sirve.

Opcional: sirve con sopa de tomate caliente.`,
    },
  },
},

{
  id: "quick-chicken-parmesan-melts",
  slug: "quick-chicken-parmesan-melts",
  name: "Chicken Parmesan Melts",
  effort: "quick",
  photoUrl: "/images/quick-chicken-parmesan-melts.jpg",
  tags: ["dinner", "chicken", "quick", "italian", "sandwich", "cheesy", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  // Chicken Parmesan Melts
suggestedSides: [
  "Caesar salad",
  "Garlic bread",
  "Roasted broccoli",
],
  notes: "Crispy chicken parmesan sandwiches with melty cheese and warm marinara. Toasting the bread first keeps the rolls from getting soggy and adds great texture.",
  ingredients: `4 cooked chicken cutlets or breaded chicken patties
1 cup marinara sauce (plus extra for dipping)
1 cup mozzarella cheese, shredded
1/4 cup Parmesan cheese, grated
4 sandwich rolls (hoagie or sub rolls)
1 Tbsp olive oil or butter
1/2 tsp garlic powder
1/2 tsp Italian seasoning
fresh basil or parsley (optional)`,
  instructions: `Preheat oven to 400°F or set broiler to high.

Slice 4 sandwich rolls and lightly brush the cut sides with 1 Tbsp olive oil or butter. Place on a baking sheet and toast for 3 to 4 minutes until lightly golden.

Heat 4 cooked chicken cutlets or breaded chicken patties according to package directions or warm leftover cutlets until hot and crispy.

Warm 1 cup marinara sauce in a small saucepan or microwave.

Place the chicken on the toasted rolls. Spoon the marinara over each piece, then top with 1 cup shredded mozzarella and a sprinkle of 1/4 cup grated Parmesan.

Sprinkle lightly with 1/2 tsp garlic powder and 1/2 tsp Italian seasoning.

Bake for 5 to 7 minutes, or broil for 2 to 3 minutes, until the cheese is melted, bubbly, and slightly golden.

Remove from the oven, garnish with fresh basil or parsley if desired, and serve immediately with extra marinara for dipping.`,
  translations: {
    es: {
      name: "Sándwiches de pollo parmesano gratinados",
      notes:
        "Sándwiches crujientes de pollo parmesano con queso derretido y marinara caliente. Tostar el pan primero evita que se humedezca y agrega muy buena textura.",
      tags: [
        "cena",
        "pollo",
        "rápido",
        "italiana",
        "sándwich",
        "con queso",
        "una bandeja",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Ensalada César",
        "Pan de ajo",
        "Brócoli asado",
      ],
      ingredients: `4 milanesas de pollo cocidas o tortitas de pollo empanizadas
1 cup de salsa marinara, más extra para mojar
1 cup de queso mozzarella rallado
1/4 cup de queso parmesano rallado
4 panes para sándwich, tipo hoagie o sub
1 Tbsp de aceite de oliva o mantequilla
1/2 tsp de ajo en polvo
1/2 tsp de sazonador italiano
albahaca fresca o perejil, opcional`,
      instructions: `Precalienta el horno a 400°F o ajusta el gratinador en alto.

Corta 4 panes para sándwich y barniza ligeramente los lados cortados con 1 Tbsp de aceite de oliva o mantequilla. Colócalos en una bandeja para hornear y tuesta de 3 a 4 minutos, hasta que estén ligeramente dorados.

Calienta 4 milanesas de pollo cocidas o tortitas de pollo empanizadas según las instrucciones del paquete, o calienta milanesas sobrantes hasta que estén calientes y crujientes.

Calienta 1 cup de salsa marinara en una cacerola pequeña o en el microondas.

Coloca el pollo sobre los panes tostados. Pon marinara sobre cada pieza, luego cubre con 1 cup de mozzarella rallada y un poco de 1/4 cup de parmesano rallado.

Espolvorea ligeramente con 1/2 tsp de ajo en polvo y 1/2 tsp de sazonador italiano.

Hornea de 5 a 7 minutos, o gratina de 2 a 3 minutos, hasta que el queso esté derretido, burbujeante y ligeramente dorado.

Retira del horno, decora con albahaca fresca o perejil si deseas, y sirve de inmediato con marinara extra para mojar.`,
    },
  },
},

{
  id: "quick-taco-mac-skillet",
  slug: "quick-taco-mac-skillet",
  name: "Taco Mac Skillet",
  effort: "quick",
  photoUrl: "/images/quick-taco-mac-skillet.jpg",
  tags: ["dinner", "beef", "pasta", "quick", "tex-mex", "one-pan", "family-friendly", "leftovers-friendly"],
  isVegetarian: false,
  // Taco Mac Skillet
suggestedSides: [
  "Chips and salsa",
  "Simple green salad",
  "Mexican street corn",
],
  notes: "A quick, cheesy taco-inspired pasta made in one pan. Adding cream cheese creates a smoother, richer sauce and helps everything come together perfectly.",
  ingredients: `1 lb ground beef
2 cups cooked macaroni (elbow pasta)
1 Tbsp olive oil
1/2 small yellow onion, diced
2 cloves garlic, minced
1 packet taco seasoning (or 2 Tbsp homemade taco seasoning)
1/2 cup water
1 cup salsa
1 cup cheddar cheese, shredded
1/2 cup Monterey Jack cheese (optional, for extra melt)
1/4 cup cream cheese (optional, for extra creaminess)
1/2 tsp pepper

Optional toppings:
sour cream
green onions, sliced
jalapeños`,
  instructions: `Heat 1 Tbsp olive oil in a large skillet over medium heat. Add 1/2 diced small yellow onion and cook for 3 to 4 minutes until softened.

Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

Add 1 lb ground beef and cook until browned, breaking it apart as it cooks. Drain excess grease if needed.

Stir in 1 packet taco seasoning or 2 Tbsp homemade seasoning and cook for 1 minute to toast the spices.

Add 1/2 cup water and 1 cup salsa, stirring to combine. Bring to a simmer and cook for 3 to 5 minutes until slightly thickened.

Reduce heat to low. Stir in 1/4 cup cream cheese if using until melted and smooth.

Add 2 cups cooked macaroni and toss until evenly coated.

Stir in 1 cup shredded cheddar and 1/2 cup Monterey Jack if using until melted and creamy.

Season with 1/2 tsp pepper, or more to taste. Remove from heat.

Serve immediately with optional toppings like sour cream, sliced green onions, or jalapeños if desired.`,
  translations: {
    es: {
      name: "Macarrones con taco en sartén",
      notes:
        "Una pasta rápida inspirada en tacos, con queso y hecha en una sola sartén. Agregar queso crema crea una salsa más suave y rica, y ayuda a que todo se una perfectamente.",
      tags: [
        "cena",
        "carne de res",
        "pasta",
        "rápido",
        "tex-mex",
        "una sartén",
        "familiar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Totopos con salsa",
        "Ensalada verde sencilla",
        "Elote estilo mexicano",
      ],
      ingredients: `1 lb de carne molida de res
2 cups de macarrones cocidos
1 Tbsp de aceite de oliva
1/2 cebolla amarilla pequeña, picada en cubitos
2 dientes de ajo, picados
1 paquete de sazonador para tacos o 2 Tbsp de sazonador casero para tacos
1/2 cup de agua
1 cup de salsa
1 cup de queso cheddar rallado
1/2 cup de queso Monterey Jack, opcional para que se derrita mejor
1/4 cup de queso crema, opcional para más cremosidad
1/2 tsp de pimienta

Toppings opcionales:
crema agria
cebollines, rebanados
jalapeños`,
      instructions: `Calienta 1 Tbsp de aceite de oliva en un sartén grande a fuego medio. Agrega 1/2 cebolla amarilla pequeña picada y cocina de 3 a 4 minutos, hasta que se ablande.

Agrega 2 dientes de ajo picados y cocina 30 segundos, hasta que suelte aroma.

Agrega 1 lb de carne molida de res y cocina hasta que se dore, separándola mientras se cocina. Escurre el exceso de grasa si es necesario.

Incorpora 1 paquete de sazonador para tacos o 2 Tbsp de sazonador casero y cocina 1 minuto para tostar las especias.

Agrega 1/2 cup de agua y 1 cup de salsa, mezclando para combinar. Lleva a hervor suave y cocina de 3 a 5 minutos, hasta que espese un poco.

Reduce el fuego a bajo. Incorpora 1/4 cup de queso crema si lo usas, hasta que se derrita y quede suave.

Agrega 2 cups de macarrones cocidos y mezcla hasta cubrirlos de manera uniforme.

Incorpora 1 cup de cheddar rallado y 1/2 cup de Monterey Jack si lo usas, hasta que se derritan y quede cremoso.

Sazona con 1/2 tsp de pimienta, o más al gusto. Retira del fuego.

Sirve de inmediato con toppings opcionales como crema agria, cebollines rebanados o jalapeños si deseas.`,
    },
  },
},

{
  id: "quick-lemon-pepper-tilapia",
  slug: "quick-lemon-pepper-tilapia",
  name: "Lemon Pepper Tilapia",
  effort: "quick",
  photoUrl: "/images/quick-lemon-pepper-tilapia.jpg",
  tags: ["dinner", "seafood", "fish", "tilapia", "quick", "light", "healthy", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  // Lemon Pepper Tilapia
suggestedSides: [
  "Rice pilaf",
  "Steamed broccoli",
  "Side salad",
],
  notes: "Light, quick tilapia with bright lemon flavor and simple seasoning. Patting the fish dry and not overcooking are key to a tender, flaky result.",
  ingredients: `4 tilapia fillets
1 Tbsp olive oil
1 tsp lemon pepper seasoning
1/2 tsp garlic powder
1/2 tsp paprika (optional, for color)
1/2 tsp salt (adjust based on seasoning)
1 Tbsp fresh lemon juice
1 lemon, sliced
1 Tbsp butter (optional, for finishing)
1 Tbsp fresh parsley, chopped (optional)`,
  instructions: `Pat 4 tilapia fillets dry with paper towels to help achieve a light sear.

Season both sides with 1 tsp lemon pepper seasoning, 1/2 tsp garlic powder, 1/2 tsp paprika if using, and 1/2 tsp salt.

Heat 1 Tbsp olive oil in a large skillet over medium heat.

Once the oil is hot, add the tilapia and cook for 3 to 4 minutes without moving, until the edges turn opaque and the bottom develops a light golden color.

Flip carefully and cook another 2 to 3 minutes, until the fish flakes easily with a fork.

Add 1 Tbsp butter and squeeze 1 Tbsp fresh lemon juice into the pan. Spoon the lemon butter over the fish for about 30 seconds.

Remove from heat and garnish with sliced lemon and fresh parsley if desired. Serve immediately.`,
  translations: {
    es: {
      name: "Tilapia con limón y pimienta",
      notes:
        "Tilapia ligera y rápida con sabor fresco de limón y condimentos simples. Secar bien el pescado y no cocinarlo de más es clave para que quede tierno y se desmenuce fácilmente.",
      tags: [
        "cena",
        "mariscos",
        "pescado",
        "tilapia",
        "rápido",
        "ligero",
        "saludable",
        "una sartén",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Arroz pilaf",
        "Brócoli al vapor",
        "Ensalada sencilla",
      ],
      ingredients: `4 filetes de tilapia
1 Tbsp de aceite de oliva
1 tsp de sazonador limón-pimienta
1/2 tsp de ajo en polvo
1/2 tsp de paprika, opcional para color
1/2 tsp de sal, ajusta según el sazonador
1 Tbsp de jugo de limón fresco
1 limón, rebanado
1 Tbsp de mantequilla, opcional para terminar
1 Tbsp de perejil fresco, picado, opcional`,
      instructions: `Seca 4 filetes de tilapia con toallas de papel para ayudar a lograr un sellado ligero.

Sazona ambos lados con 1 tsp de sazonador limón-pimienta, 1/2 tsp de ajo en polvo, 1/2 tsp de paprika si la usas y 1/2 tsp de sal.

Calienta 1 Tbsp de aceite de oliva en un sartén grande a fuego medio.

Cuando el aceite esté caliente, agrega la tilapia y cocina de 3 a 4 minutos sin mover, hasta que los bordes se vuelvan opacos y la parte inferior tome un color dorado ligero.

Voltea con cuidado y cocina otros 2 a 3 minutos, hasta que el pescado se desmenuce fácilmente con un tenedor.

Agrega 1 Tbsp de mantequilla y exprime 1 Tbsp de jugo de limón fresco en el sartén. Baña el pescado con la mantequilla de limón durante unos 30 segundos.

Retira del fuego y decora con limón rebanado y perejil fresco si deseas. Sirve de inmediato.`,
    },
  },
},

{
  id: "quick-bbq-chicken",
  slug: "quick-bbq-chicken",
  name: "Oven BBQ Chicken",
  effort: "quick",
  photoUrl: "/images/quick-bbq-chicken.jpg",
  tags: ["dinner", "chicken", "quick", "bbq", "family-friendly", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  // Oven BBQ Chicken
suggestedSides: [
  "Baked beans",
  "Coleslaw",
  "Corn on the cob",
],
  notes: "Juicy oven-baked BBQ chicken with a sticky, caramelized finish. Adding the sauce near the end prevents burning while keeping the chicken tender and flavorful.",
  ingredients: `4 boneless, skinless chicken breasts
1 Tbsp olive oil
1 tsp salt
1/2 tsp pepper
1/2 tsp garlic powder
1/2 tsp paprika (or smoked paprika for extra flavor)
1/2 cup BBQ sauce (plus extra for serving)`,
  instructions: `Preheat oven to 425°F. Line a baking sheet with foil or parchment paper.

If 4 boneless, skinless chicken breasts are thick, pound them to an even thickness for more even cooking.

Pat chicken dry with paper towels. Drizzle with 1 Tbsp olive oil and season evenly with 1 tsp salt, 1/2 tsp pepper, 1/2 tsp garlic powder, and 1/2 tsp paprika.

Place chicken on the prepared baking sheet and bake for 15 minutes.

Remove from the oven and brush 1/2 cup BBQ sauce evenly over the top of each piece.

Return to the oven and bake for another 5 to 8 minutes, until the internal temperature reaches 160°F.

For extra caramelization, broil on high for 1 to 2 minutes, watching closely to prevent burning.

Remove from oven and let rest for 5 minutes. The temperature will rise to 165°F as it rests.

Serve warm with additional BBQ sauce if desired.`,
  translations: {
    es: {
      name: "Pollo BBQ al horno",
      notes:
        "Pollo BBQ jugoso horneado, con un acabado pegajoso y caramelizado. Agregar la salsa cerca del final evita que se queme y mantiene el pollo tierno y lleno de sabor.",
      tags: [
        "cena",
        "pollo",
        "rápido",
        "bbq",
        "familiar",
        "una bandeja",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Frijoles horneados",
        "Ensalada de col",
        "Elote",
      ],
      ingredients: `4 pechugas de pollo sin hueso y sin piel
1 Tbsp de aceite de oliva
1 tsp de sal
1/2 tsp de pimienta
1/2 tsp de ajo en polvo
1/2 tsp de paprika o paprika ahumada para más sabor
1/2 cup de salsa BBQ, más extra para servir`,
      instructions: `Precalienta el horno a 425°F. Cubre una bandeja para hornear con papel aluminio o papel pergamino.

Si las 4 pechugas de pollo sin hueso y sin piel están gruesas, aplánalas hasta que tengan un grosor uniforme para una cocción más pareja.

Seca el pollo con toallas de papel. Rocía con 1 Tbsp de aceite de oliva y sazona de manera uniforme con 1 tsp de sal, 1/2 tsp de pimienta, 1/2 tsp de ajo en polvo y 1/2 tsp de paprika.

Coloca el pollo en la bandeja preparada y hornea durante 15 minutos.

Retira del horno y barniza 1/2 cup de salsa BBQ de manera uniforme sobre la parte superior de cada pieza.

Regresa al horno y hornea de 5 a 8 minutos más, hasta que la temperatura interna alcance 160°F.

Para más caramelización, gratina en alto de 1 a 2 minutos, vigilando de cerca para evitar que se queme.

Retira del horno y deja reposar 5 minutos. La temperatura subirá a 165°F mientras reposa.

Sirve caliente con más salsa BBQ si deseas.`,
    },
  },
},

{
  id: "normal-simple-tacos",
  slug: "normal-simple-tacos",
  name: "Simple Tacos",
  effort: "normal",
  photoUrl: "/images/normal-simple-tacos.jpg",
  tags: ["dinner", "beef", "tacos", "tex-mex", "family-friendly", "build-your-own", "leftovers-friendly"],
  isVegetarian: false,
  // Simple Tacos
suggestedSides: [
  "Cilantro lime rice",
  "Chips and salsa",
  "Mexican street corn",
],
  notes: "Classic, easy taco night with seasoned ground beef and fresh toppings. Letting the meat simmer with seasoning helps build deeper flavor and prevents it from being dry.",
  ingredients: `1 lb ground beef
2/3 cup water
1/2 small white onion, diced
4 roma tomatoes, diced
1 cup cheddar cheese, shredded
2 cups lettuce, chopped
8 to 10 taco shells (hard or soft)

Optional toppings:
sour cream
hot sauce

Taco Seasoning:
1/2 Tbsp chili powder
1 tsp cumin
1 tsp salt
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp paprika
1/8 tsp dried oregano
1/4 tsp pepper
1/8 tsp crushed red pepper or jalapeño flakes`,
  instructions: `Preheat oven to 350°F if using hard taco shells.

In a small bowl, mix all taco seasoning ingredients until well combined. Set aside.

Heat a large skillet over medium heat. Add 1 lb ground beef and cook for 5 to 7 minutes, breaking it apart as it cooks, until no longer pink. Drain excess grease if needed.

Add 2/3 cup water and the prepared taco seasoning to the skillet. Stir well and bring to a simmer.

Cook for 3 to 5 minutes, stirring occasionally, until the sauce thickens and coats the meat.

Warm 8 to 10 taco shells according to package directions.

Set out the diced onion, diced roma tomatoes, shredded cheddar cheese, chopped lettuce, and any optional toppings to create a taco bar.

Fill shells with seasoned beef and desired toppings. Serve immediately.`,
  translations: {
    es: {
      name: "Tacos sencillos",
      notes:
        "Una noche clásica y fácil de tacos con carne molida sazonada y toppings frescos. Dejar que la carne hierva suavemente con el sazonador ayuda a desarrollar más sabor y evita que quede seca.",
      tags: [
        "cena",
        "carne de res",
        "tacos",
        "tex-mex",
        "familiar",
        "arma a tu gusto",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Arroz con cilantro y lima",
        "Totopos con salsa",
        "Elote estilo mexicano",
      ],
      ingredients: `1 lb de carne molida de res
2/3 cup de agua
1/2 cebolla blanca pequeña, picada en cubitos
4 tomates roma, picados en cubitos
1 cup de queso cheddar rallado
2 cups de lechuga, picada
8 a 10 tortillas o shells para taco, duros o suaves

Toppings opcionales:
crema agria
salsa picante

Sazonador para tacos:
1/2 Tbsp de chile en polvo
1 tsp de comino
1 tsp de sal
1/2 tsp de ajo en polvo
1/2 tsp de cebolla en polvo
1/2 tsp de paprika
1/8 tsp de orégano seco
1/4 tsp de pimienta
1/8 tsp de chile rojo triturado o hojuelas de jalapeño`,
      instructions: `Precalienta el horno a 350°F si usas shells duros para taco.

En un tazón pequeño, mezcla todos los ingredientes del sazonador para tacos hasta que estén bien combinados. Reserva.

Calienta un sartén grande a fuego medio. Agrega 1 lb de carne molida de res y cocina de 5 a 7 minutos, separándola mientras se cocina, hasta que ya no esté rosada. Escurre el exceso de grasa si es necesario.

Agrega 2/3 cup de agua y el sazonador para tacos preparado al sartén. Mezcla bien y lleva a hervor suave.

Cocina de 3 a 5 minutos, revolviendo de vez en cuando, hasta que la salsa espese y cubra la carne.

Calienta de 8 a 10 shells o tortillas para taco según las instrucciones del paquete.

Coloca la cebolla picada, los tomates roma picados, el queso cheddar rallado, la lechuga picada y cualquier topping opcional para crear una barra de tacos.

Rellena los tacos con la carne sazonada y los toppings que quieras. Sirve de inmediato.`,
    },
  },
},

{
  id: "quick-sloppy-joes-sandwich",
  slug: "quick-sloppy-joes-sandwich",
  name: "Sloppy Joes Sandwich",
  effort: "quick",
  photoUrl: "/images/quick-sloppy-joes-sandwich.jpg",
  tags: ["dinner", "beef", "sandwich", "quick", "family-friendly", "comfort", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  // Sloppy Joes Sandwich
suggestedSides: [
  "French fries",
  "Pickles",
  "Coleslaw",
],
  notes: "Classic sloppy joes with a rich, slightly sweet and tangy sauce. Simmering the sauce helps deepen the flavor and gives it that signature thick, saucy texture.",
  ingredients: `1 lb ground beef
1 Tbsp olive oil
1/2 small yellow onion, finely diced
2 cloves garlic, minced
8 oz tomato sauce
1/2 cup ketchup
2 Tbsp brown sugar
2 Tbsp worcestershire sauce
1 tsp yellow mustard
1/2 tsp garlic powder
1/4 tsp onion powder
1/4 tsp pepper
1/2 tsp salt (adjust to taste)

For serving:
hamburger buns
sliced pickles`,
  instructions: `Heat 1 Tbsp olive oil in a large skillet over medium heat. Add 1/2 small finely diced yellow onion and cook for 3 to 4 minutes until softened.

Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

Add 1 lb ground beef and cook over medium to medium-high heat for 5 to 7 minutes, breaking it apart as it cooks, until browned with no pink remaining. Drain excess grease if needed.

In a small bowl, whisk together 8 oz tomato sauce, 1/2 cup ketchup, 2 Tbsp brown sugar, 2 Tbsp worcestershire sauce, 1 tsp yellow mustard, 1/2 tsp garlic powder, 1/4 tsp onion powder, 1/2 tsp salt, and 1/4 tsp pepper.

Pour the sauce into the skillet with the beef and stir to combine.

Reduce heat to low and simmer for 10 to 15 minutes, stirring occasionally, until the sauce thickens and becomes rich and slightly glossy.

Lightly toast the hamburger buns if desired.

Spoon the sloppy joe mixture onto the buns and top with sliced pickles. Serve warm.`,
  translations: {
    es: {
      name: "Sándwich Sloppy Joe",
      notes:
        "Sloppy joes clásicos con una salsa rica, ligeramente dulce y ácida. Cocinar la salsa a fuego bajo ayuda a intensificar el sabor y le da esa textura espesa y jugosa característica.",
      tags: [
        "cena",
        "carne de res",
        "sándwich",
        "rápido",
        "familiar",
        "comida reconfortante",
        "una sartén",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Papas fritas",
        "Pepinillos",
        "Ensalada de col",
      ],
      ingredients: `1 lb de carne molida de res
1 Tbsp de aceite de oliva
1/2 cebolla amarilla pequeña, finamente picada
2 dientes de ajo, picados
8 oz de salsa de tomate
1/2 cup de ketchup
2 Tbsp de azúcar morena
2 Tbsp de salsa worcestershire
1 tsp de mostaza amarilla
1/2 tsp de ajo en polvo
1/4 tsp de cebolla en polvo
1/4 tsp de pimienta
1/2 tsp de sal, ajusta al gusto

Para servir:
panes para hamburguesa
pepinillos rebanados`,
      instructions: `Calienta 1 Tbsp de aceite de oliva en un sartén grande a fuego medio. Agrega 1/2 cebolla amarilla pequeña finamente picada y cocina de 3 a 4 minutos, hasta que se ablande.

Agrega 2 dientes de ajo picados y cocina 30 segundos, hasta que suelte aroma.

Agrega 1 lb de carne molida de res y cocina a fuego medio a medio-alto de 5 a 7 minutos, separándola mientras se cocina, hasta que esté dorada y sin partes rosadas. Escurre el exceso de grasa si es necesario.

En un tazón pequeño, bate 8 oz de salsa de tomate, 1/2 cup de ketchup, 2 Tbsp de azúcar morena, 2 Tbsp de salsa worcestershire, 1 tsp de mostaza amarilla, 1/2 tsp de ajo en polvo, 1/4 tsp de cebolla en polvo, 1/2 tsp de sal y 1/4 tsp de pimienta.

Vierte la salsa en el sartén con la carne y mezcla para combinar.

Reduce el fuego a bajo y cocina de 10 a 15 minutos, revolviendo de vez en cuando, hasta que la salsa espese y quede rica y ligeramente brillante.

Tuesta ligeramente los panes para hamburguesa si deseas.

Sirve la mezcla de sloppy joe sobre los panes y cubre con pepinillos rebanados. Sirve caliente.`,
    },
  },
},

{
  id: "big-beef-lasagna",
  slug: "big-beef-lasagna",
  name: "Classic Lasagna",
  photoUrl: "/images/big-beef-lasagna.jpg",
  effort: "big",
  tags: ["dinner", "pasta", "beef", "bake", "italian", "comfort", "crowd-pleaser", "leftovers-friendly"],
  // Classic Lasagna
suggestedSides: [
  "Garlic bread",
  "Caesar salad",
  "Roasted broccoli",
],
  notes: "A crowd-pleasing layered pasta bake with beef, sausage, ricotta, and plenty of cheese.",
  ingredients: `12 lasagna noodles, uncooked
2 1/2 cups shredded mozzarella cheese
1/4 cup shredded Parmesan cheese
1/2 lb lean ground beef
1/2 lb Italian sausage
1 yellow onion, diced
2 cloves garlic, minced
36 oz pasta sauce
2 Tbsp tomato paste
1 tsp Italian seasoning
1/2 tsp salt, plus more to taste
2 cups ricotta cheese or cottage cheese
1/4 cup chopped fresh parsley
1 large egg, beaten
1 1/2 cups shredded mozzarella cheese
1/4 cup shredded Parmesan cheese
1/4 tsp salt
1/4 tsp pepper`,
  instructions: `Preheat the oven to 350°F.

Bring a large pot of salted water to a boil. Add 12 uncooked lasagna noodles and cook until al dente. Drain, rinse under cold water, and set aside.

In a large skillet, brown 1/2 lb lean ground beef, 1/2 lb Italian sausage, 1 diced yellow onion, and 2 minced garlic cloves over medium-high heat until no pink remains. Drain any fat.

Stir in 36 oz pasta sauce, 2 Tbsp tomato paste, 1 tsp Italian seasoning, 1/2 tsp salt, and 1/4 tsp pepper. Simmer uncovered over medium heat for 5 minutes or until slightly thickened. Taste and season with additional salt if desired.

In a separate medium bowl, combine 1 1/2 cups shredded mozzarella cheese, 1/4 cup shredded Parmesan cheese, 2 cups ricotta cheese or cottage cheese, 1/4 cup chopped fresh parsley, 1 beaten large egg, and 1/4 tsp salt.

Spread 1 cup of the meat sauce in a 9x13 pan or casserole dish. Top with 3 lasagna noodles. Layer with 1 cup of the ricotta cheese mixture and 1 cup of meat sauce. Repeat twice more. Finish with 3 noodles topped with the remaining sauce.

Cover with foil and bake for 45 minutes.

Remove the foil and sprinkle the top of the lasagna with the remaining 2 1/2 cups shredded mozzarella cheese and 1/4 cup shredded Parmesan cheese.

Bake uncovered for an additional 15 minutes or until browned and bubbly. Broil for 2 to 3 minutes if desired.

Rest for at least 15 minutes before cutting.`,
  translations: {
    es: {
      name: "Lasaña clásica",
      notes:
        "Una pasta horneada en capas, perfecta para compartir, con carne de res, salchicha, ricotta y mucho queso.",
      tags: [
        "cena",
        "pasta",
        "carne de res",
        "horneado",
        "italiana",
        "comida reconfortante",
        "para compartir",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Pan de ajo",
        "Ensalada César",
        "Brócoli asado",
      ],
      ingredients: `12 láminas de lasaña, sin cocinar
2 1/2 cups de queso mozzarella rallado
1/4 cup de queso parmesano rallado
1/2 lb de carne molida de res magra
1/2 lb de salchicha italiana
1 cebolla amarilla, picada en cubitos
2 dientes de ajo, picados
36 oz de salsa para pasta
2 Tbsp de pasta de tomate
1 tsp de sazonador italiano
1/2 tsp de sal, más al gusto
2 cups de queso ricotta o cottage cheese
1/4 cup de perejil fresco picado
1 huevo grande, batido
1 1/2 cups de queso mozzarella rallado
1/4 cup de queso parmesano rallado
1/4 tsp de sal
1/4 tsp de pimienta`,
      instructions: `Precalienta el horno a 350°F.

Hierve una olla grande con agua salada. Agrega 12 láminas de lasaña sin cocinar y cocina hasta que estén al dente. Escurre, enjuaga con agua fría y reserva.

En un sartén grande, dora 1/2 lb de carne molida de res magra, 1/2 lb de salchicha italiana, 1 cebolla amarilla picada y 2 dientes de ajo picados a fuego medio-alto, hasta que no quede color rosado. Escurre la grasa.

Incorpora 36 oz de salsa para pasta, 2 Tbsp de pasta de tomate, 1 tsp de sazonador italiano, 1/2 tsp de sal y 1/4 tsp de pimienta. Cocina sin tapar a fuego medio durante 5 minutos o hasta que espese un poco. Prueba y agrega más sal si deseas.

En un tazón mediano aparte, combina 1 1/2 cups de queso mozzarella rallado, 1/4 cup de queso parmesano rallado, 2 cups de queso ricotta o cottage cheese, 1/4 cup de perejil fresco picado, 1 huevo grande batido y 1/4 tsp de sal.

Extiende 1 cup de salsa de carne en un molde de 9x13 o una cazuela. Cubre con 3 láminas de lasaña. Agrega una capa de 1 cup de la mezcla de ricotta y 1 cup de salsa de carne. Repite dos veces más. Termina con 3 láminas cubiertas con la salsa restante.

Cubre con papel aluminio y hornea durante 45 minutos.

Retira el papel aluminio y espolvorea la parte superior de la lasaña con las 2 1/2 cups restantes de queso mozzarella rallado y 1/4 cup de queso parmesano rallado.

Hornea sin cubrir 15 minutos más, o hasta que esté dorada y burbujeante. Gratina de 2 a 3 minutos si deseas.

Deja reposar al menos 15 minutos antes de cortar.`,
    },
  },
},

{
  id: "normal-chili-cheese-dogs",
  slug: "normal-chili-cheese-dogs",
  name: "Chili Cheese Dogs",
  effort: "normal",
  photoUrl: "/images/normal-chili-cheese-dogs.jpg",
  tags: ["dinner", "hot-dogs", "comfort", "family-friendly", "one-pan", "crowd-pleaser"],
  isVegetarian: false,
  // Chili Cheese Dogs
suggestedSides: [
  "French fries",
  "Coleslaw",
  "Watermelon slices",
],
  notes: "Loaded chili cheese dogs with a rich, flavorful beef chili. Letting the chili simmer helps it thicken so it stays on the dog instead of running off.",
  ingredients: `8 hot dogs
8 hot dog buns
1 cup cheddar cheese, shredded
1/2 small white onion, finely diced (optional)

Quick Chili Topping:
1 lb ground beef
1 (8 oz) can tomato sauce
1/2 cup water
1 Tbsp chili powder
1 tsp cumin
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/4 tsp pepper
1 tsp worcestershire sauce (optional, for depth)`,
  instructions: `Heat a large skillet over medium heat. Add 1 lb ground beef and cook for 5 to 7 minutes, breaking it apart until browned. Drain excess grease if needed.

Add 8 oz tomato sauce, 1/2 cup water, 1 Tbsp chili powder, 1 tsp cumin, 1/2 tsp garlic powder, 1/2 tsp onion powder, 1/2 tsp salt, 1/4 tsp pepper, and 1 tsp worcestershire sauce if using. Stir well.

Bring to a simmer and cook for 10 to 15 minutes, stirring occasionally, until the chili thickens and becomes rich and scoopable.

Meanwhile, cook 8 hot dogs using your preferred method, grill, stovetop, or air fryer, until heated through and lightly browned.

Lightly toast 8 hot dog buns if desired.

Place hot dogs in the buns and top generously with the prepared chili, 1 cup shredded cheddar cheese, and 1/2 finely diced small onion if using.

Serve immediately while hot.`,
  translations: {
    es: {
      name: "Hot dogs con chili y queso",
      notes:
        "Hot dogs cargados con chili de res rico y lleno de sabor. Dejar que el chili hierva suavemente ayuda a que espese para que se quede sobre el hot dog en lugar de escurrirse.",
      tags: [
        "cena",
        "hot dogs",
        "comida reconfortante",
        "familiar",
        "una sartén",
        "para compartir",
      ],
      suggestedSides: [
        "Papas fritas",
        "Ensalada de col",
        "Rebanadas de sandía",
      ],
      ingredients: `8 hot dogs
8 panes para hot dog
1 cup de queso cheddar rallado
1/2 cebolla blanca pequeña, finamente picada, opcional

Chili rápido para cubrir:
1 lb de carne molida de res
1 lata (8 oz) de salsa de tomate
1/2 cup de agua
1 Tbsp de chile en polvo
1 tsp de comino
1/2 tsp de ajo en polvo
1/2 tsp de cebolla en polvo
1/2 tsp de sal
1/4 tsp de pimienta
1 tsp de salsa worcestershire, opcional para más profundidad`,
      instructions: `Calienta un sartén grande a fuego medio. Agrega 1 lb de carne molida de res y cocina de 5 a 7 minutos, separándola hasta que esté dorada. Escurre el exceso de grasa si es necesario.

Agrega 8 oz de salsa de tomate, 1/2 cup de agua, 1 Tbsp de chile en polvo, 1 tsp de comino, 1/2 tsp de ajo en polvo, 1/2 tsp de cebolla en polvo, 1/2 tsp de sal, 1/4 tsp de pimienta y 1 tsp de salsa worcestershire si la usas. Mezcla bien.

Lleva a un hervor suave y cocina de 10 a 15 minutos, revolviendo ocasionalmente, hasta que el chili espese y quede rico y fácil de servir con cuchara.

Mientras tanto, cocina 8 hot dogs usando tu método preferido: parrilla, estufa o freidora de aire, hasta que estén calientes y ligeramente dorados.

Tuesta ligeramente 8 panes para hot dog si deseas.

Coloca los hot dogs en los panes y cubre generosamente con el chili preparado, 1 cup de queso cheddar rallado y 1/2 cebolla pequeña finamente picada si la usas.

Sirve de inmediato mientras estén calientes.`,
    },
  },
},

{
  id: "big-white-chicken-chili",
  slug: "big-white-chicken-chili",
  name: "White Chicken Chili",
  effort: "big",
  photoUrl: "/images/big-white-chicken-chili.jpg",
  tags: ["dinner", "chili", "chicken", "one-pot", "comfort", "creamy", "leftovers-friendly"],
  isVegetarian: false,
  // White Chicken Chili
suggestedSides: [
  "Cornbread",
  "Tortilla chips",
  "Simple green salad",
],
  notes: "Creamy, cozy white chicken chili with bold flavor and a smooth texture. Mashing some of the beans and adding cream cheese creates a rich, hearty consistency without needing heavy cream.",
  ingredients: `2 cups cooked shredded chicken (rotisserie works great)
1 Tbsp olive oil
1 small yellow onion, chopped
2 cloves garlic, minced
2 (15 oz) cans white beans, drained and rinsed
1 (4 oz) can green chiles
4 cups chicken broth
4 oz cream cheese, softened and cubed
1/2 cup sour cream (optional, for extra creaminess)
1 Tbsp lime juice

White Chili Seasoning:
1 tsp cumin
1 tsp chili powder
1/2 tsp dried oregano
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/4 tsp pepper
1/4 tsp cayenne pepper (optional)

Optional toppings:
shredded cheese
cilantro
green onions
tortilla chips`,
  instructions: `Heat 1 Tbsp olive oil in a large pot or Dutch oven over medium heat. Add 1 chopped small yellow onion and cook for 4 to 5 minutes until softened.

Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

Stir in 2 cups cooked shredded chicken, 2 cans drained and rinsed white beans, 1 can green chiles, and 4 cups chicken broth.

In a small bowl, mix all White Chili Seasoning ingredients. Add to the pot and stir well.

Bring to a gentle simmer and cook for 20 to 25 minutes, allowing flavors to develop.

Use a spoon or potato masher to lightly mash some of the beans to naturally thicken the chili while leaving some whole for texture.

Reduce heat to low. Stir in 4 oz softened and cubed cream cheese until fully melted and smooth.

Stir in 1/2 cup sour cream if using, and add 1 Tbsp lime juice to brighten the flavor.

Taste and adjust seasoning as needed.

Serve hot with desired toppings like shredded cheese, cilantro, green onions, and tortilla chips.`,
  translations: {
    es: {
      name: "Chili blanco de pollo",
      notes:
        "Un chili blanco de pollo cremoso y acogedor, con sabor intenso y textura suave. Machacar parte de los frijoles y agregar queso crema crea una consistencia rica y sustanciosa sin necesitar crema espesa.",
      tags: [
        "cena",
        "chili",
        "pollo",
        "una olla",
        "comida reconfortante",
        "cremoso",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Pan de maíz",
        "Totopos",
        "Ensalada verde sencilla",
      ],
      ingredients: `2 cups de pollo cocido y deshebrado; el pollo rostizado funciona muy bien
1 Tbsp de aceite de oliva
1 cebolla amarilla pequeña, picada
2 dientes de ajo, picados
2 latas (15 oz) de frijoles blancos, escurridos y enjuagados
1 lata (4 oz) de chiles verdes
4 cups de caldo de pollo
4 oz de queso crema, suavizado y cortado en cubitos
1/2 cup de crema agria, opcional para más cremosidad
1 Tbsp de jugo de lima

Sazonador para chili blanco:
1 tsp de comino
1 tsp de chile en polvo
1/2 tsp de orégano seco
1/2 tsp de ajo en polvo
1/2 tsp de cebolla en polvo
1/2 tsp de sal
1/4 tsp de pimienta
1/4 tsp de pimienta de cayena, opcional

Toppings opcionales:
queso rallado
cilantro
cebollines
totopos`,
      instructions: `Calienta 1 Tbsp de aceite de oliva en una olla grande o Dutch oven a fuego medio. Agrega 1 cebolla amarilla pequeña picada y cocina de 4 a 5 minutos, hasta que se ablande.

Agrega 2 dientes de ajo picados y cocina 30 segundos, hasta que suelte aroma.

Incorpora 2 cups de pollo cocido y deshebrado, 2 latas de frijoles blancos escurridos y enjuagados, 1 lata de chiles verdes y 4 cups de caldo de pollo.

En un tazón pequeño, mezcla todos los ingredientes del sazonador para chili blanco. Agrégalos a la olla y mezcla bien.

Lleva a un hervor suave y cocina de 20 a 25 minutos para que los sabores se desarrollen.

Usa una cuchara o machacador de papas para machacar ligeramente algunos frijoles y espesar el chili de forma natural, dejando algunos enteros para textura.

Reduce el fuego a bajo. Incorpora 4 oz de queso crema suavizado y en cubitos hasta que se derrita por completo y quede suave.

Agrega 1/2 cup de crema agria si la usas, y 1 Tbsp de jugo de lima para darle frescura.

Prueba y ajusta los condimentos según sea necesario.

Sirve caliente con toppings como queso rallado, cilantro, cebollines y totopos.`,
    },
  },
},

{
  id: "normal-taco-soup",
  slug: "normal-taco-soup",
  name: "Taco Soup",
  effort: "normal",
  photoUrl: "/images/normal-taco-soup.jpg",
  tags: ["dinner", "soup", "tex-mex", "one-pot", "beef", "family-friendly", "leftovers-friendly"],
  isVegetarian: false,
  // Taco Soup
suggestedSides: [
  "Tortilla chips",
  "Cilantro lime rice",
  "Cornbread",
],
  notes: "Hearty taco-inspired soup with bold flavor and a rich broth. Letting it simmer helps everything come together, and it tastes even better the next day.",
  ingredients: `1 lb ground beef
1 Tbsp olive oil
1 small yellow onion, chopped
2 cloves garlic, minced
1 (15 oz) can corn, drained
1 (15 oz) can black beans, drained and rinsed
1 (14.5 oz) can diced tomatoes (with juices)
1 (10 oz) can Rotel
2 cups beef broth
1 Tbsp tomato paste (optional, for deeper flavor)

Taco Seasoning:
1 Tbsp chili powder
1 tsp cumin
1/2 tsp paprika (or smoked paprika for extra depth)
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/4 tsp pepper

Optional toppings:
shredded cheese
sour cream
tortilla chips
green onions`,
  instructions: `Heat 1 Tbsp olive oil in a large pot or Dutch oven over medium heat. Add 1 chopped small yellow onion and cook for 4 to 5 minutes until softened.

Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

Add 1 lb ground beef and cook for 5 to 7 minutes, breaking it apart as it cooks, until browned. Drain excess grease if needed.

Stir in the taco seasoning and cook for 1 minute to toast the spices.

Add 1 can drained corn, 1 can drained and rinsed black beans, 1 can diced tomatoes with juices, 1 can Rotel, 2 cups beef broth, and 1 Tbsp tomato paste if using. Stir well.

Bring to a simmer and cook for 20 to 25 minutes, stirring occasionally, until flavors are well combined.

Taste and adjust seasoning if needed.

Serve hot with desired toppings such as shredded cheese, sour cream, tortilla chips, and green onions.`,
  translations: {
    es: {
      name: "Sopa de taco",
      notes:
        "Una sopa sustanciosa inspirada en tacos, con mucho sabor y un caldo rico. Dejarla cocinar a fuego bajo ayuda a que todo se integre, y sabe aún mejor al día siguiente.",
      tags: [
        "cena",
        "sopa",
        "tex-mex",
        "una olla",
        "carne de res",
        "familiar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Totopos",
        "Arroz con cilantro y lima",
        "Pan de maíz",
      ],
      ingredients: `1 lb de carne molida de res
1 Tbsp de aceite de oliva
1 cebolla amarilla pequeña, picada
2 dientes de ajo, picados
1 lata (15 oz) de maíz, escurrido
1 lata (15 oz) de frijoles negros, escurridos y enjuagados
1 lata (14.5 oz) de tomates en cubitos, con sus jugos
1 lata (10 oz) de Rotel
2 cups de caldo de res
1 Tbsp de pasta de tomate, opcional para más sabor

Sazonador para tacos:
1 Tbsp de chile en polvo
1 tsp de comino
1/2 tsp de paprika o paprika ahumada para más profundidad
1/2 tsp de ajo en polvo
1/2 tsp de cebolla en polvo
1/2 tsp de sal
1/4 tsp de pimienta

Toppings opcionales:
queso rallado
crema agria
totopos
cebollines`,
      instructions: `Calienta 1 Tbsp de aceite de oliva en una olla grande o Dutch oven a fuego medio. Agrega 1 cebolla amarilla pequeña picada y cocina de 4 a 5 minutos, hasta que se ablande.

Agrega 2 dientes de ajo picados y cocina 30 segundos, hasta que suelte aroma.

Agrega 1 lb de carne molida de res y cocina de 5 a 7 minutos, separándola mientras se cocina, hasta que esté dorada. Escurre el exceso de grasa si es necesario.

Incorpora el sazonador para tacos y cocina 1 minuto para tostar las especias.

Agrega 1 lata de maíz escurrido, 1 lata de frijoles negros escurridos y enjuagados, 1 lata de tomates en cubitos con sus jugos, 1 lata de Rotel, 2 cups de caldo de res y 1 Tbsp de pasta de tomate si la usas. Mezcla bien.

Lleva a un hervor suave y cocina de 20 a 25 minutos, revolviendo de vez en cuando, hasta que los sabores estén bien combinados.

Prueba y ajusta los condimentos si es necesario.

Sirve caliente con toppings como queso rallado, crema agria, totopos y cebollines.`,
    },
  },
},

{
  id: "big-sheet-pan-fajitas",
  slug: "big-sheet-pan-fajitas",
  name: "Sheet Pan Fajitas",
  effort: "big",
  photoUrl: "/images/big-sheet-pan-fajitas.jpg",
  tags: ["dinner", "chicken", "sheet-pan", "tex-mex", "family-friendly", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  // Sheet Pan Fajitas
suggestedSides: [
  "Cilantro lime rice",
  "Chips and salsa",
  "Refried beans",
],
  notes: "Easy, colorful sheet pan fajitas with bold seasoning and roasted flavor. Spreading everything in a single layer and using high heat helps achieve those slightly charred, restaurant-style edges.",
  ingredients: `1 1/2 lbs chicken breast, sliced into strips
2 bell peppers (any color), sliced
1 large yellow onion, sliced
2 Tbsp olive oil
1 Tbsp lime juice

Fajita Seasoning:
1 Tbsp chili powder
1 tsp paprika (or smoked paprika for extra depth)
1 tsp cumin
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/4 tsp pepper
1/4 tsp cayenne pepper (optional)

For serving:
tortillas
sour cream
shredded cheese
guacamole (optional)`,
  instructions: `Preheat oven to 425°F. Line a large sheet pan with parchment paper or foil.

Spread 1 1/2 lbs sliced chicken breast, 2 sliced bell peppers, and 1 large sliced yellow onion evenly across the sheet pan in a single layer. Avoid overcrowding to ensure proper roasting.

In a small bowl, mix all fajita seasoning ingredients.

Drizzle 2 Tbsp olive oil and 1 Tbsp lime juice over the chicken and vegetables. Sprinkle the prepared seasoning evenly over everything.

Toss well to coat, then spread back out into a single layer.

Bake for 20 to 25 minutes, stirring once halfway through, until the chicken is cooked through and the vegetables are tender with slightly charred edges.

For extra char, broil on high for 2 to 3 minutes at the end, watching closely.

Remove from oven and serve immediately in warm tortillas with sour cream, shredded cheese, and guacamole if desired.`,
  translations: {
    es: {
      name: "Fajitas en bandeja",
      notes:
        "Fajitas fáciles y coloridas en bandeja, con sazonador intenso y sabor asado. Extender todo en una sola capa y usar fuego alto ayuda a lograr esos bordes ligeramente tostados estilo restaurante.",
      tags: [
        "cena",
        "pollo",
        "bandeja",
        "tex-mex",
        "familiar",
        "una bandeja",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Arroz con cilantro y lima",
        "Totopos con salsa",
        "Frijoles refritos",
      ],
      ingredients: `1 1/2 lbs de pechuga de pollo, rebanada en tiras
2 pimientos, de cualquier color, rebanados
1 cebolla amarilla grande, rebanada
2 Tbsp de aceite de oliva
1 Tbsp de jugo de lima

Sazonador para fajitas:
1 Tbsp de chile en polvo
1 tsp de paprika o paprika ahumada para más profundidad
1 tsp de comino
1/2 tsp de ajo en polvo
1/2 tsp de cebolla en polvo
1/2 tsp de sal
1/4 tsp de pimienta
1/4 tsp de pimienta de cayena, opcional

Para servir:
tortillas
crema agria
queso rallado
guacamole, opcional`,
      instructions: `Precalienta el horno a 425°F. Cubre una bandeja grande para hornear con papel pergamino o papel aluminio.

Extiende 1 1/2 lbs de pechuga de pollo en tiras, 2 pimientos rebanados y 1 cebolla amarilla grande rebanada de manera uniforme sobre la bandeja en una sola capa. Evita amontonar para que se asen bien.

En un tazón pequeño, mezcla todos los ingredientes del sazonador para fajitas.

Rocía 2 Tbsp de aceite de oliva y 1 Tbsp de jugo de lima sobre el pollo y las verduras. Espolvorea el sazonador preparado de manera uniforme sobre todo.

Mezcla bien para cubrir, luego vuelve a extender en una sola capa.

Hornea de 20 a 25 minutos, revolviendo una vez a la mitad, hasta que el pollo esté bien cocido y las verduras estén tiernas con bordes ligeramente tostados.

Para más dorado, gratina en alto de 2 a 3 minutos al final, vigilando de cerca.

Retira del horno y sirve de inmediato en tortillas calientes con crema agria, queso rallado y guacamole si deseas.`,
    },
  },
},

{
  id: "normal-air-fryer-chicken-tenders",
  slug: "normal-air-fryer-chicken-tenders",
  name: "Air Fryer Chicken Tenders",
  effort: "normal",
  photoUrl: "/images/normal-air-fryer-chicken-tenders.jpg",
  tags: ["dinner", "chicken", "air-fryer", "crispy", "family-friendly", "kid-friendly", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  // Air Fryer Chicken Tenders
suggestedSides: [
  "French fries",
  "Carrot sticks with ranch",
  "Fruit salad",
],
  notes: "Crispy, golden chicken tenders made in the air fryer. Using panko breadcrumbs and spraying lightly with oil helps achieve that extra crunch without deep frying.",
  ingredients: `1 1/2 lbs chicken tenders
1/2 cup all-purpose flour
2 large eggs, beaten
1 cup breadcrumbs (panko preferred for extra crunch)

Chicken Seasoning:
1 tsp paprika (or smoked paprika for extra flavor)
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/4 tsp pepper

Cooking spray`,
  instructions: `Preheat air fryer to 400°F.

Pat 1 1/2 lbs chicken tenders dry with paper towels.

In three shallow bowls, set up a breading station: one with 1/2 cup all-purpose flour, one with 2 large beaten eggs, and one with 1 cup breadcrumbs mixed with the Chicken Seasoning.

Dredge each chicken tender in the flour, shaking off excess. Dip into the egg, then coat thoroughly in the seasoned breadcrumbs, pressing lightly so the coating sticks.

Place tenders in the air fryer basket in a single layer, leaving space between each piece. Spray lightly with cooking spray.

Cook for 10 to 12 minutes, flipping halfway through, until golden brown and the internal temperature reaches 165°F.

For extra crispiness, spray lightly again with cooking spray after flipping.

Serve hot with your favorite dipping sauces.`,
  translations: {
    es: {
      name: "Tiras de pollo en freidora de aire",
      notes:
        "Tiras de pollo doradas y crujientes hechas en la freidora de aire. Usar pan molido panko y rociar ligeramente con aceite ayuda a lograr más crujiente sin freír en aceite profundo.",
      tags: [
        "cena",
        "pollo",
        "freidora de aire",
        "crujiente",
        "familiar",
        "para niños",
        "una tanda",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Papas fritas",
        "Palitos de zanahoria con ranch",
        "Ensalada de frutas",
      ],
      ingredients: `1 1/2 lbs de tiras de pollo
1/2 cup de harina de todo uso
2 huevos grandes, batidos
1 cup de pan molido, preferiblemente panko para más crujiente

Sazonador para pollo:
1 tsp de paprika o paprika ahumada para más sabor
1/2 tsp de ajo en polvo
1/2 tsp de cebolla en polvo
1/2 tsp de sal
1/4 tsp de pimienta

spray para cocinar`,
      instructions: `Precalienta la freidora de aire a 400°F.

Seca 1 1/2 lbs de tiras de pollo con toallas de papel.

Prepara tres tazones poco profundos para empanizar: uno con 1/2 cup de harina de todo uso, uno con 2 huevos grandes batidos y uno con 1 cup de pan molido mezclado con el sazonador para pollo.

Pasa cada tira de pollo por la harina, sacudiendo el exceso. Sumérgela en el huevo y luego cúbrela bien con el pan molido sazonado, presionando ligeramente para que se adhiera.

Coloca las tiras en la canasta de la freidora de aire en una sola capa, dejando espacio entre cada pieza. Rocía ligeramente con spray para cocinar.

Cocina de 10 a 12 minutos, volteando a la mitad, hasta que estén doradas y la temperatura interna alcance 165°F.

Para que queden más crujientes, rocía ligeramente otra vez con spray para cocinar después de voltearlas.

Sirve calientes con tus salsas favoritas para mojar.`,
    },
  },
},

{
  id: "big-baked-chicken-thighs",
  slug: "big-baked-chicken-thighs",
  name: "Baked Chicken Thighs",
  effort: "big",
  photoUrl: "/images/big-baked-chicken-thighs.jpg",
  tags: ["dinner", "chicken", "bake", "crispy", "comfort", "family-friendly", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  // Baked Chicken Thighs
suggestedSides: [
  "Mashed potatoes",
  "Green beans",
  "Dinner rolls",
],
  notes: "Crispy, flavorful baked chicken thighs with juicy meat and golden skin. Patting the chicken dry and using high heat are key to achieving that perfect crisp.",
  ingredients: `6 bone-in, skin-on chicken thighs
1 Tbsp olive oil

Chicken Rub:
1 tsp smoked paprika
1 tsp garlic powder
1 tsp onion powder
1/2 tsp salt
1/2 tsp pepper
1/2 tsp dried thyme
1/2 tsp baking powder (optional, for extra crispy skin)`,
  instructions: `Preheat oven to 425°F. Line a baking sheet with foil and place a wire rack on top if available.

Pat 6 bone-in, skin-on chicken thighs very dry with paper towels. This is key for crispy skin.

Rub the chicken with 1 Tbsp olive oil.

In a small bowl, mix all Chicken Rub ingredients. Sprinkle evenly over the chicken, rubbing to coat all sides and under the skin where possible.

Place chicken thighs skin-side up on the rack or baking sheet, leaving space between each piece.

Bake for 35 to 40 minutes, until the skin is crispy and the internal temperature reaches 165°F.

For extra crispiness, broil on high for 2 to 3 minutes at the end, watching closely.

Remove from the oven and let rest for 5 minutes before serving.`,
  translations: {
    es: {
      name: "Muslos de pollo al horno",
      notes:
        "Muslos de pollo al horno crujientes y llenos de sabor, con carne jugosa y piel dorada. Secar bien el pollo y usar alta temperatura son claves para lograr ese crujiente perfecto.",
      tags: [
        "cena",
        "pollo",
        "horneado",
        "crujiente",
        "comida reconfortante",
        "familiar",
        "una bandeja",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Puré de papas",
        "Ejotes",
        "Panecillos",
      ],
      ingredients: `6 muslos de pollo con hueso y piel
1 Tbsp de aceite de oliva

Rub para pollo:
1 tsp de paprika ahumada
1 tsp de ajo en polvo
1 tsp de cebolla en polvo
1/2 tsp de sal
1/2 tsp de pimienta
1/2 tsp de tomillo seco
1/2 tsp de polvo para hornear, opcional para piel extra crujiente`,
      instructions: `Precalienta el horno a 425°F. Cubre una bandeja para hornear con papel aluminio y coloca una rejilla encima si tienes una.

Seca muy bien 6 muslos de pollo con hueso y piel con toallas de papel. Esto es clave para una piel crujiente.

Frota el pollo con 1 Tbsp de aceite de oliva.

En un tazón pequeño, mezcla todos los ingredientes del rub para pollo. Espolvorea de manera uniforme sobre el pollo, frotando para cubrir todos los lados y debajo de la piel cuando sea posible.

Coloca los muslos con la piel hacia arriba sobre la rejilla o bandeja, dejando espacio entre cada pieza.

Hornea de 35 a 40 minutos, hasta que la piel esté crujiente y la temperatura interna alcance 165°F.

Para más crujiente, gratina en alto de 2 a 3 minutos al final, vigilando de cerca.

Retira del horno y deja reposar 5 minutos antes de servir.`,
    },
  },
},

{
  id: "big-bbq-chicken-drumsticks",
  slug: "big-bbq-chicken-drumsticks",
  name: "BBQ Chicken Drumsticks",
  effort: "big",
  photoUrl: "/images/big-bbq-chicken-drumsticks.jpg",
  tags: ["dinner", "chicken", "bbq", "bake", "comfort", "family-friendly", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  // BBQ Chicken Drumsticks
suggestedSides: [
  "Baked beans",
  "Coleslaw",
  "Corn on the cob",
],
  notes: "Sticky, flavorful BBQ drumsticks with a seasoned crust and caramelized sauce. Drying the chicken and baking at higher heat helps achieve crispy skin before adding the sauce.",
  ingredients: `8 chicken drumsticks
1 Tbsp olive oil
1/2 cup barbecue sauce (plus extra for serving)

BBQ Rub:
1 tsp smoked paprika
1 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/2 tsp pepper
1/2 tsp brown sugar
1/2 tsp baking powder (optional, for crispier skin)`,
  instructions: `Preheat oven to 425°F. Line a baking sheet with foil and place a wire rack on top if available.

Pat 8 chicken drumsticks very dry with paper towels. This helps the skin crisp up.

Rub the drumsticks with 1 Tbsp olive oil.

In a small bowl, mix all BBQ Rub ingredients. Sprinkle evenly over the drumsticks, coating all sides.

Place drumsticks on the rack or baking sheet with space between each piece.

Bake for 30 to 35 minutes, until the skin is crispy and the internal temperature reaches about 155°F to 160°F.

Remove from the oven and brush generously with 1/2 cup barbecue sauce.

Return to the oven and bake for another 10 to 15 minutes, until the sauce is sticky, caramelized, and the internal temperature reaches 165°F.

For extra caramelization, broil on high for 2 to 3 minutes at the end, watching closely.

Let rest for 5 minutes before serving with extra barbecue sauce if desired.`,
  translations: {
    es: {
      name: "Piernas de pollo BBQ",
      notes:
        "Piernas de pollo BBQ pegajosas y llenas de sabor, con una costra sazonada y salsa caramelizada. Secar el pollo y hornearlo a temperatura alta ayuda a lograr piel crujiente antes de agregar la salsa.",
      tags: [
        "cena",
        "pollo",
        "bbq",
        "horneado",
        "comida reconfortante",
        "familiar",
        "una bandeja",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Frijoles horneados",
        "Ensalada de col",
        "Elote",
      ],
      ingredients: `8 piernas de pollo
1 Tbsp de aceite de oliva
1/2 cup de salsa barbecue, más extra para servir

Rub BBQ:
1 tsp de paprika ahumada
1 tsp de ajo en polvo
1/2 tsp de cebolla en polvo
1/2 tsp de sal
1/2 tsp de pimienta
1/2 tsp de azúcar morena
1/2 tsp de polvo para hornear, opcional para piel más crujiente`,
      instructions: `Precalienta el horno a 425°F. Cubre una bandeja para hornear con papel aluminio y coloca una rejilla encima si tienes una.

Seca muy bien 8 piernas de pollo con toallas de papel. Esto ayuda a que la piel quede crujiente.

Frota las piernas con 1 Tbsp de aceite de oliva.

En un tazón pequeño, mezcla todos los ingredientes del rub BBQ. Espolvorea de manera uniforme sobre las piernas, cubriendo todos los lados.

Coloca las piernas sobre la rejilla o bandeja, dejando espacio entre cada pieza.

Hornea de 30 a 35 minutos, hasta que la piel esté crujiente y la temperatura interna alcance aproximadamente 155°F a 160°F.

Retira del horno y barniza generosamente con 1/2 cup de salsa barbecue.

Regresa al horno y hornea de 10 a 15 minutos más, hasta que la salsa esté pegajosa, caramelizada y la temperatura interna alcance 165°F.

Para más caramelización, gratina en alto de 2 a 3 minutos al final, vigilando de cerca.

Deja reposar 5 minutos antes de servir con más salsa barbecue si deseas.`,
    },
  },
},

{
  id: "smoked-pulled-pork",
  slug: "smoked-pulled-pork",
  name: "Smoked Pulled Pork",
  ingredients: `8 lb pork shoulder
1/4 cup yellow mustard
1/4 cup Kinder's Woodfire Garlic seasoning (or similar BBQ rub)
1 cup barbecue sauce (plus extra for serving)`,
  instructions: `Remove the 8 lb pork shoulder from packaging and pat it completely dry with paper towels.

Rub the pork shoulder all over with 1/4 cup yellow mustard as a binder.

Season generously on all sides with 1/4 cup Kinder's Woodfire Garlic, pressing it into the meat.

Preheat smoker to 250°F and add pellets.

Place the pork shoulder directly on the smoker grates and cook for about 7 hours, or until the internal temperature reaches 200°F.

Remove from smoker, wrap tightly in aluminum foil, and let rest for 1 hour.

Unwrap and shred the pork using your hands or forks.

Toss the shredded pork with 1 cup barbecue sauce until well coated.

Serve warm or use in recipes like Pork Street Tacos.`,
  photoUrl: "/images/smoked-pulled-pork.jpg",
  effort: "big",
  tags: ["dinner", "pork", "smoker", "bbq", "meal-prep", "protein", "base-recipe"],
  isVegetarian: false,
  // Smoked Pulled Pork
suggestedSides: [
  "Coleslaw",
  "Baked beans",
  "Smoked mac and cheese",
],
  notes: "Tender, smoky pulled pork that works as a base for multiple meals like tacos, sandwiches, and bowls.",
  translations: {
    es: {
      name: "Cerdo deshebrado ahumado",
      notes:
        "Cerdo deshebrado tierno y ahumado que funciona como base para varias comidas, como tacos, sándwiches y bowls.",
      tags: [
        "cena",
        "cerdo",
        "ahumador",
        "bbq",
        "meal prep",
        "proteína",
        "receta base",
      ],
      suggestedSides: [
        "Ensalada de col",
        "Frijoles horneados",
        "Macarrones con queso ahumados",
      ],
      ingredients: `8 lb de paleta de cerdo
1/4 cup de mostaza amarilla
1/4 cup de sazonador Kinder's Woodfire Garlic o un rub BBQ similar
1 cup de salsa barbecue, más extra para servir`,
      instructions: `Retira la paleta de cerdo de 8 lb del empaque y sécala completamente con toallas de papel.

Frota toda la paleta de cerdo con 1/4 cup de mostaza amarilla para que el sazonador se adhiera.

Sazona generosamente todos los lados con 1/4 cup de Kinder's Woodfire Garlic, presionándolo sobre la carne.

Precalienta el ahumador a 250°F y agrega pellets.

Coloca la paleta de cerdo directamente sobre las rejillas del ahumador y cocina unas 7 horas, o hasta que la temperatura interna alcance 200°F.

Retira del ahumador, envuelve bien en papel aluminio y deja reposar 1 hora.

Desenvuelve y deshebra el cerdo con las manos o con tenedores.

Mezcla el cerdo deshebrado con 1 cup de salsa barbecue hasta que quede bien cubierto.

Sirve caliente o úsalo en recetas como tacos callejeros de cerdo.`,
    },
  },
},

{
  id: "big-smoked-meatloaf",
  slug: "big-smoked-meatloaf",
  name: "Smoked Meatloaf",
  ingredients: `1/2 cup breadcrumbs
1/3 cup milk
1 lb ground beef
1 lb ground pork
1/2 cup Parmesan cheese, grated
1/2 cup white onion, minced
1 Tbsp dried parsley
4 cloves garlic, minced
2 Tbsp ketchup
1 Tbsp Worcestershire sauce
2 tsp salt
1 tsp pepper
1/2 tsp red pepper flakes
2 Tbsp BBQ rub (your favorite)
1 cup BBQ sauce (plus extra for serving)`,
  instructions: `In a large bowl, combine 1/2 cup breadcrumbs and 1/3 cup milk. Let soak for 5 minutes to form a panade.

Add 1 lb ground beef, 1 lb ground pork, 1/2 cup grated Parmesan, 1/2 cup minced onion, 1 Tbsp dried parsley, 4 cloves minced garlic, 2 Tbsp ketchup, 1 Tbsp Worcestershire sauce, 2 tsp salt, 1 tsp pepper, and 1/2 tsp red pepper flakes. Mix gently by hand until just combined. Do not overmix.

Shape the mixture into a loaf using a loaf pan, then refrigerate for 30 minutes to help it hold its shape.

Preheat smoker to 250°F.

Remove meatloaf from pan and place directly on a smoker rack or basket. Season all sides evenly with about 2 Tbsp BBQ rub.

Smoke for 90 minutes.

Brush 1 cup BBQ sauce generously over the meatloaf and continue smoking for another 30 minutes, until the internal temperature reaches 160°F.

Remove from smoker and let rest for 10 minutes before slicing.

Serve warm with extra BBQ sauce if desired.`,
  photoUrl: "/images/big-smoked-meatloaf.jpg",
  effort: "big",
  tags: ["dinner", "beef", "pork", "smoker", "bbq", "comfort", "family", "leftovers-friendly"],
  isVegetarian: false,
  // Smoked Meatloaf
suggestedSides: [
  "Mashed potatoes",
  "Green beans",
  "Dinner rolls",
],
  notes: "Smoky, juicy meatloaf with a rich BBQ glaze. Including measurements in each step makes it easier to follow in Cook Mode without jumping back and forth.",
  translations: {
    es: {
      name: "Pastel de carne ahumado",
      notes:
        "Pastel de carne ahumado y jugoso con un glaseado BBQ intenso. Incluir medidas en cada paso hace que sea más fácil seguirlo en Cook Mode sin tener que ir y venir.",
      tags: [
        "cena",
        "carne de res",
        "cerdo",
        "ahumador",
        "bbq",
        "comida reconfortante",
        "familiar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Puré de papas",
        "Ejotes",
        "Panecillos",
      ],
      ingredients: `1/2 cup de pan molido
1/3 cup de leche
1 lb de carne molida de res
1 lb de carne molida de cerdo
1/2 cup de queso parmesano rallado
1/2 cup de cebolla blanca, picada finamente
1 Tbsp de perejil seco
4 dientes de ajo, picados
2 Tbsp de ketchup
1 Tbsp de salsa Worcestershire
2 tsp de sal
1 tsp de pimienta
1/2 tsp de hojuelas de chile rojo
2 Tbsp de rub BBQ de tu preferencia
1 cup de salsa BBQ, más extra para servir`,
      instructions: `En un tazón grande, combina 1/2 cup de pan molido y 1/3 cup de leche. Deja remojar durante 5 minutos para formar una panade.

Agrega 1 lb de carne molida de res, 1 lb de carne molida de cerdo, 1/2 cup de parmesano rallado, 1/2 cup de cebolla picada finamente, 1 Tbsp de perejil seco, 4 dientes de ajo picados, 2 Tbsp de ketchup, 1 Tbsp de salsa Worcestershire, 2 tsp de sal, 1 tsp de pimienta y 1/2 tsp de hojuelas de chile rojo. Mezcla suavemente con las manos hasta que apenas se combine. No mezcles demasiado.

Forma la mezcla en un pan usando un molde para pan, luego refrigera durante 30 minutos para ayudar a que mantenga su forma.

Precalienta el ahumador a 250°F.

Retira el pastel de carne del molde y colócalo directamente sobre una rejilla o canasta para ahumador. Sazona todos los lados de manera uniforme con aproximadamente 2 Tbsp de rub BBQ.

Ahúma durante 90 minutos.

Barniza generosamente el pastel de carne con 1 cup de salsa BBQ y continúa ahumando otros 30 minutos, hasta que la temperatura interna alcance 160°F.

Retira del ahumador y deja reposar 10 minutos antes de cortar.

Sirve caliente con más salsa BBQ si deseas.`,
    },
  },
},

{
  id: "pork-street-tacos",
  slug: "pork-street-tacos",
  name: "Pork Street Tacos",
  ingredients: `Pulled pork (see "Smoked Pulled Pork" recipe)
8 small corn or flour tortillas
1/2 cup white onion, finely chopped
1/2 cup fresh cilantro, chopped
2 avocados, sliced
2 fresh jalapeños, sliced
lime wedges (optional)`,
  instructions: `Warm 8 tortillas in a skillet over medium heat or directly over a flame until soft and slightly charred.

Fill each tortilla with a generous portion of prepared pulled pork (see Smoked Pulled Pork recipe).

Top with chopped white onion, fresh cilantro, sliced avocado, and jalapeños.

Squeeze fresh lime juice over the tacos if desired.

Serve immediately.`,
  photoUrl: "/images/pork-street-tacos.jpg",
  effort: "normal",
  tags: ["dinner", "tacos", "pork", "mexican", "assembly", "family", "street-food"],
  isVegetarian: false,
  // Pork Street Tacos
suggestedSides: [
  "Cilantro lime rice",
  "Chips and salsa",
  "Mexican street corn",
],
  notes: "Simple street-style tacos built around flavorful smoked pulled pork. Use the Smoked Pulled Pork recipe for the base protein.",
  translations: {
    es: {
      name: "Tacos callejeros de cerdo",
      notes:
        "Tacos sencillos estilo callejero hechos con cerdo deshebrado ahumado lleno de sabor. Usa la receta de cerdo deshebrado ahumado como proteína base.",
      tags: [
        "cena",
        "tacos",
        "cerdo",
        "mexicana",
        "armado",
        "familiar",
        "comida callejera",
      ],
      suggestedSides: [
        "Arroz con cilantro y lima",
        "Totopos con salsa",
        "Elote estilo mexicano",
      ],
      ingredients: `cerdo deshebrado, ver receta "Cerdo deshebrado ahumado"
8 tortillas pequeñas de maíz o harina
1/2 cup de cebolla blanca, finamente picada
1/2 cup de cilantro fresco, picado
2 aguacates, rebanados
2 jalapeños frescos, rebanados
gajos de lima, opcional`,
      instructions: `Calienta 8 tortillas en un sartén a fuego medio o directamente sobre la llama, hasta que estén suaves y ligeramente tostadas.

Rellena cada tortilla con una porción generosa de cerdo deshebrado preparado, ver receta de Cerdo deshebrado ahumado.

Cubre con cebolla blanca picada, cilantro fresco, aguacate rebanado y jalapeños.

Exprime jugo de lima fresco sobre los tacos si deseas.

Sirve de inmediato.`,
    },
  },
},

{
  id: "roasted-tomato-basil-soup",
  slug: "roasted-tomato-basil-soup",
  name: "Roasted Tomato Basil Soup",
  ingredients: `3 lbs tomatoes, halved
1 sweet onion, cut into thick wedges
3 Tbsp olive oil
1 tsp salt
1/2 tsp black pepper
1 Tbsp butter
1 Tbsp garlic, minced
2 1/2 cups vegetable broth
1/2 cup fresh basil leaves, chopped
1 sprig fresh thyme
1/4 cup heavy cream`,
  instructions: `Preheat oven to 425°F. Line a large baking sheet with parchment paper.

Arrange 3 lbs halved tomatoes (cut-side up) and 1 sliced sweet onion on the baking sheet.

Drizzle with 3 Tbsp olive oil and sprinkle with 1 tsp salt and 1/2 tsp black pepper.

Roast for 40 to 45 minutes, until the tomatoes are softened and beginning to caramelize.

In a large pot, melt 1 Tbsp butter over medium heat. Add 1 Tbsp minced garlic and cook for 30 seconds until fragrant.

Carefully transfer the roasted tomatoes and onion, along with their juices, into the pot.

Add 2 1/2 cups vegetable broth and 1/2 cup chopped fresh basil. Stir well.

Use an immersion blender (or carefully transfer to a blender) and blend until smooth.

Add 1 sprig fresh thyme and 1/4 cup heavy cream. Stir to combine.

Simmer over low heat for at least 30 minutes, stirring occasionally, until flavors deepen.

Remove the thyme sprig. Taste and adjust seasoning with additional salt and pepper if needed.

Serve warm.`,
  photoUrl: "/images/roasted-tomato-basil-soup.jpg",
  effort: "normal",
  tags: ["dinner", "soup", "comfort", "vegetarian", "roasted", "cozy"],
  isVegetarian: true,
  // Roasted Tomato Basil Soup
suggestedSides: [
  "Grilled cheese sandwich",
  "Garlic bread",
  "Side salad",
],
  notes: "Roasting the tomatoes and onion brings out natural sweetness and depth of flavor. Pairs perfectly with a grilled cheese sandwich.",
  translations: {
    es: {
      name: "Sopa de tomate asado y albahaca",
      notes:
        "Asar los tomates y la cebolla resalta su dulzura natural y aporta más profundidad de sabor. Combina perfecto con un sándwich de queso a la plancha.",
      tags: [
        "cena",
        "sopa",
        "comida reconfortante",
        "vegetariano",
        "asado",
        "acogedor",
      ],
      suggestedSides: [
        "Sándwich de queso a la plancha",
        "Pan de ajo",
        "Ensalada sencilla",
      ],
      ingredients: `3 lbs de tomates, cortados por la mitad
1 cebolla dulce, cortada en gajos gruesos
3 Tbsp de aceite de oliva
1 tsp de sal
1/2 tsp de pimienta negra
1 Tbsp de mantequilla
1 Tbsp de ajo, picado
2 1/2 cups de caldo de pollo
1/2 cup de hojas de albahaca fresca, picadas
1 ramita de tomillo fresco
1/4 cup de crema espesa`,
      instructions: `Precalienta el horno a 425°F. Cubre una bandeja grande para hornear con papel pergamino.

Coloca 3 lbs de tomates cortados por la mitad, con el lado cortado hacia arriba, y 1 cebolla dulce rebanada en la bandeja.

Rocía con 3 Tbsp de aceite de oliva y espolvorea con 1 tsp de sal y 1/2 tsp de pimienta negra.

Asa de 40 a 45 minutos, hasta que los tomates estén suaves y empiecen a caramelizarse.

En una olla grande, derrite 1 Tbsp de mantequilla a fuego medio. Agrega 1 Tbsp de ajo picado y cocina 30 segundos, hasta que suelte aroma.

Pasa con cuidado los tomates y la cebolla asados, junto con sus jugos, a la olla.

Agrega 2 1/2 cups de caldo de pollo y 1/2 cup de albahaca fresca picada. Mezcla bien.

Usa una licuadora de inmersión, o pasa cuidadosamente a una licuadora, y licúa hasta que quede suave.

Agrega 1 ramita de tomillo fresco y 1/4 cup de crema espesa. Mezcla para combinar.

Cocina a fuego bajo por al menos 30 minutos, revolviendo de vez en cuando, hasta que los sabores se intensifiquen.

Retira la ramita de tomillo. Prueba y ajusta con más sal y pimienta si es necesario.

Sirve caliente.`,
    },
  },
},

{
  id: "slow-cooker-beef-stew",
  slug: "slow-cooker-beef-stew",
  name: "Slow Cooker Beef Stew",
  ingredients: `2 lbs beef stew meat
2 Tbsp olive oil
1 yellow onion, chopped
1 lb baby potatoes, cubed
1/2 lb carrots, diced
4 cups beef broth
3 tsp garlic, minced
2 Tbsp tomato paste
2 Tbsp Worcestershire sauce
1 tsp dried thyme
1 bay leaf
3 Tbsp cornstarch
3 Tbsp water
1 1/2 cups frozen peas
2 Tbsp fresh parsley, chopped
salt and black pepper, to taste`,
  instructions: `Heat 2 Tbsp olive oil in a skillet over medium heat.

Season 2 lbs beef stew meat with salt and black pepper. Add to the skillet and sear for about 3 minutes, turning to brown all sides.

Transfer the seared beef to a slow cooker along with 1 chopped onion, 1 lb cubed baby potatoes, and 1/2 lb diced carrots.

In a bowl, whisk together 4 cups beef broth, 3 tsp minced garlic, 2 Tbsp tomato paste, 2 Tbsp Worcestershire sauce, and 1 tsp thyme.

Pour the broth mixture over the beef and vegetables. Add 1 bay leaf.

Cover and cook on low for 6 to 7 hours or on high for 3 to 4 hours, until the beef is tender.

About 20 minutes before serving, remove the bay leaf.

In a small bowl, mix 3 Tbsp cornstarch with 3 Tbsp water to create a slurry. Stir into the stew.

Add 1 1/2 cups frozen peas and cover again. Cook until the stew thickens and peas are heated through.

Stir in 2 Tbsp chopped fresh parsley. Taste and adjust salt and pepper as needed.

Serve warm.`,
  photoUrl: "/images/slow-cooker-beef-stew.jpg",
  effort: "big",
  tags: ["dinner", "beef", "slow-cooker", "comfort", "one-pot", "family", "hearty", "leftovers-friendly"],
  isVegetarian: false,
  // Slow Cooker Beef Stew
suggestedSides: [
  "Dinner rolls",
  "Side salad",
  "Cornbread",
],
  notes: "A classic, hearty beef stew with tender meat and rich broth. Searing the beef first adds deeper flavor, and the cornstarch slurry gives it a perfectly thick finish.",
  translations: {
    es: {
      name: "Estofado de res en olla lenta",
      notes:
        "Un estofado clásico y sustancioso de res, con carne tierna y caldo rico. Sellar la carne primero agrega más sabor, y la mezcla de maicena le da un acabado perfectamente espeso.",
      tags: [
        "cena",
        "carne de res",
        "olla lenta",
        "comida reconfortante",
        "una olla",
        "familiar",
        "sustancioso",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Panecillos",
        "Ensalada sencilla",
        "Pan de maíz",
      ],
      ingredients: `2 lbs de carne de res para estofado
2 Tbsp de aceite de oliva
1 cebolla amarilla, picada
1 lb de papas baby, cortadas en cubitos
1/2 lb de zanahorias, cortadas en cubitos
4 cups de caldo de res
3 tsp de ajo, picado
2 Tbsp de pasta de tomate
2 Tbsp de salsa Worcestershire
1 tsp de tomillo seco
1 hoja de laurel
3 Tbsp de maicena
3 Tbsp de agua
1 1/2 cups de chícharos congelados
2 Tbsp de perejil fresco, picado
sal y pimienta negra, al gusto`,
      instructions: `Calienta 2 Tbsp de aceite de oliva en un sartén a fuego medio.

Sazona 2 lbs de carne de res para estofado con sal y pimienta negra. Agrega al sartén y sella durante unos 3 minutos, volteando para dorar todos los lados.

Pasa la carne sellada a una olla lenta junto con 1 cebolla picada, 1 lb de papas baby en cubitos y 1/2 lb de zanahorias en cubitos.

En un tazón, bate 4 cups de caldo de res, 3 tsp de ajo picado, 2 Tbsp de pasta de tomate, 2 Tbsp de salsa Worcestershire y 1 tsp de tomillo.

Vierte la mezcla de caldo sobre la carne y las verduras. Agrega 1 hoja de laurel.

Tapa y cocina en low de 6 a 7 horas o en high de 3 a 4 horas, hasta que la carne esté tierna.

Unos 20 minutos antes de servir, retira la hoja de laurel.

En un tazón pequeño, mezcla 3 Tbsp de maicena con 3 Tbsp de agua para formar una mezcla espesante. Incorpórala al estofado.

Agrega 1 1/2 cups de chícharos congelados y tapa de nuevo. Cocina hasta que el estofado espese y los chícharos estén calientes.

Incorpora 2 Tbsp de perejil fresco picado. Prueba y ajusta sal y pimienta si es necesario.

Sirve caliente.`,
    },
  },
},

{
  id: "loaded-taco-party-ring",
  slug: "loaded-taco-party-ring",
  name: "Loaded Taco Party Ring with Cilantro Lime Rice",
  ingredients: `Taco Ring:
1 lb ground beef
1/2 lb onion, diced
1/2 cup water
3 Tbsp taco seasoning
16 oz refrigerated crescent rolls
1 cup cheddar cheese, shredded
2 Tbsp olive oil
1 Tbsp red pepper flakes (optional)

Cilantro Lime Rice:
10 oz cooked rice
2 Tbsp cilantro lime seasoning (or lime juice + chopped cilantro + pinch of salt)`,
  instructions: `Preheat oven to 375°F.

In a skillet over medium heat, cook 1 lb ground beef and 1/2 lb diced onion until beef is browned. Drain excess grease.

Add 1/2 cup water and 3 Tbsp taco seasoning. Stir and simmer for 10 minutes until slightly thickened.

Arrange 16 oz crescent roll dough in a sunburst pattern on a baking sheet, with the wide ends overlapping in the center and the points facing outward.

Spoon the beef mixture into the center ring.

Sprinkle 1 cup shredded cheddar cheese evenly over the beef.

Fold the pointed ends of the dough over the filling and tuck underneath to form a ring.

Bake for about 18 minutes, until golden brown.

Brush the top with 2 Tbsp olive oil and sprinkle with 1 Tbsp red pepper flakes if using.

Slice and serve.

For the rice: In a bowl, combine 10 oz cooked rice with 2 Tbsp cilantro lime seasoning (or mix in lime juice, chopped cilantro, and salt to taste). Serve alongside.`,
  photoUrl: "/images/loaded-taco-party-ring.jpg",
  effort: "normal",
  tags: ["dinner", "beef", "bake", "party", "family", "tex-mex", "fun", "shareable"],
  isVegetarian: false,
  // Loaded Taco Party Ring with Cilantro Lime Rice
suggestedSides: [
  "Chips and salsa",
  "Guacamole",
  "Street corn",
],
  notes: "A fun, shareable taco-inspired bake wrapped in flaky crescent dough. Great for parties or family dinners and pairs perfectly with fresh cilantro lime rice.",
  translations: {
    es: {
      name: "Rosca de taco cargada con arroz de cilantro y lima",
      notes:
        "Un horneado divertido inspirado en tacos, ideal para compartir, envuelto en masa hojaldrada de crescent rolls. Excelente para fiestas o cenas familiares y combina perfecto con arroz fresco de cilantro y lima.",
      tags: [
        "cena",
        "carne de res",
        "horneado",
        "fiesta",
        "familiar",
        "tex-mex",
        "divertido",
        "para compartir",
      ],
      suggestedSides: [
        "Totopos con salsa",
        "Guacamole",
        "Elote estilo callejero",
      ],
      ingredients: `Rosca de taco:
1 lb de carne molida de res
1/2 lb de cebolla, picada en cubitos
1/2 cup de agua
3 Tbsp de sazonador para tacos
16 oz de masa refrigerada para crescent rolls
1 cup de queso cheddar rallado
2 Tbsp de aceite de oliva
1 Tbsp de hojuelas de chile rojo, opcional

Arroz de cilantro y lima:
10 oz de arroz cocido
2 Tbsp de sazonador cilantro-lima, o jugo de lima + cilantro picado + una pizca de sal`,
      instructions: `Precalienta el horno a 375°F.

En un sartén a fuego medio, cocina 1 lb de carne molida de res y 1/2 lb de cebolla picada hasta que la carne esté dorada. Escurre el exceso de grasa.

Agrega 1/2 cup de agua y 3 Tbsp de sazonador para tacos. Mezcla y cocina a fuego bajo durante 10 minutos, hasta que espese un poco.

Acomoda 16 oz de masa para crescent rolls en forma de sol sobre una bandeja para hornear, con los extremos anchos superpuestos en el centro y las puntas hacia afuera.

Coloca la mezcla de carne en el aro central.

Espolvorea 1 cup de queso cheddar rallado de manera uniforme sobre la carne.

Dobla las puntas de la masa sobre el relleno y mételas por debajo para formar una rosca.

Hornea unos 18 minutos, hasta que esté dorada.

Barniza la parte superior con 2 Tbsp de aceite de oliva y espolvorea con 1 Tbsp de hojuelas de chile rojo si las usas.

Corta y sirve.

Para el arroz: en un tazón, combina 10 oz de arroz cocido con 2 Tbsp de sazonador cilantro-lima, o mezcla con jugo de lima, cilantro picado y sal al gusto. Sirve al lado.`,
    },
  },
},

{
  id: "barbecue-chicken-pizza",
  slug: "barbecue-chicken-pizza",
  name: "Barbecue Chicken Pizza",
  ingredients: `Chicken:
1 lb boneless skinless chicken breast or thighs
1 Tbsp olive oil
1/2 tsp salt
1/4 tsp black pepper
1/2 tsp smoked paprika (optional, for extra depth)

Pizza Base:
1 lb pizza dough (store-bought or homemade)
1/2 cup barbecue sauce (plus 2 Tbsp for chicken)
1 1/2 cups mozzarella cheese, shredded
1/2 cup red onion, thinly sliced
1/4 cup fresh cilantro, chopped

Optional:
1/4 cup cheddar cheese, shredded
1/2 jalapeño, thinly sliced`,
  instructions: `Preheat oven to 475°F. If using a pizza stone or steel, place it in the oven while preheating.

Heat 1 Tbsp olive oil in a skillet over medium-high heat.

Season 1 lb chicken with 1/2 tsp salt, 1/4 tsp black pepper, and 1/2 tsp smoked paprika if using.

Cook chicken for 5 to 6 minutes per side, until a deep golden-brown crust forms and the internal temperature reaches 165°F.

Remove from heat, let rest for 5 minutes, then slice or shred. Toss with 2 Tbsp barbecue sauce.

On a lightly floured surface, stretch 1 lb pizza dough into a 12 to 14-inch round.

Spread 1/2 cup barbecue sauce evenly over the dough, leaving a small border around the edges.

Top with 1 1/2 cups mozzarella cheese, followed by the barbecue chicken, 1/2 cup sliced red onion, and optional cheddar or jalapeños.

Transfer to a pizza peel or baking sheet and bake for 10 to 14 minutes, until the crust is golden and the cheese is melted and bubbly with light browning.

Remove from oven and sprinkle with 1/4 cup fresh cilantro.

Let rest for 2 to 3 minutes before slicing and serving.`,
  photoUrl: "/images/barbecue-chicken-pizza.jpg",
  effort: "normal",
  tags: ["dinner", "pizza", "chicken", "bbq", "oven", "family", "comfort"],
  isVegetarian: false,
  // Barbecue Chicken Pizza
suggestedSides: [
  "Coleslaw",
  "Simple green salad",
  "Fruit salad",
],
  notes: "A bold, smoky-sweet pizza with tender barbecue chicken and melty cheese. Cooking the chicken separately ensures great texture and prevents excess moisture on the pizza.",
  translations: {
    es: {
      name: "Pizza de pollo barbecue",
      notes:
        "Una pizza intensa, ahumada y dulce, con pollo barbecue tierno y queso derretido. Cocinar el pollo por separado asegura buena textura y evita exceso de humedad en la pizza.",
      tags: [
        "cena",
        "pizza",
        "pollo",
        "bbq",
        "horno",
        "familiar",
        "comida reconfortante",
      ],
      suggestedSides: [
        "Ensalada de col",
        "Ensalada verde sencilla",
        "Ensalada de frutas",
      ],
      ingredients: `Pollo:
1 lb de pechuga o muslos de pollo sin hueso y sin piel
1 Tbsp de aceite de oliva
1/2 tsp de sal
1/4 tsp de pimienta negra
1/2 tsp de paprika ahumada, opcional para más profundidad

Base de pizza:
1 lb de masa para pizza, comprada o casera
1/2 cup de salsa barbecue, más 2 Tbsp para el pollo
1 1/2 cups de queso mozzarella rallado
1/2 cup de cebolla roja, rebanada finamente
1/4 cup de cilantro fresco, picado

Opcional:
1/4 cup de queso cheddar rallado
1/2 jalapeño, rebanado finamente`,
      instructions: `Precalienta el horno a 475°F. Si usas piedra o acero para pizza, colócalo en el horno mientras se precalienta.

Calienta 1 Tbsp de aceite de oliva en un sartén a fuego medio-alto.

Sazona 1 lb de pollo con 1/2 tsp de sal, 1/4 tsp de pimienta negra y 1/2 tsp de paprika ahumada si la usas.

Cocina el pollo de 5 a 6 minutos por lado, hasta que se forme una costra dorada intensa y la temperatura interna alcance 165°F.

Retira del fuego, deja reposar 5 minutos y luego rebana o deshebra. Mezcla con 2 Tbsp de salsa barbecue.

Sobre una superficie ligeramente enharinada, estira 1 lb de masa para pizza en un círculo de 12 a 14 inches.

Extiende 1/2 cup de salsa barbecue de manera uniforme sobre la masa, dejando un borde pequeño alrededor.

Cubre con 1 1/2 cups de queso mozzarella, seguido del pollo barbecue, 1/2 cup de cebolla roja rebanada y cheddar o jalapeños opcionales.

Pasa a una pala para pizza o bandeja para hornear y hornea de 10 a 14 minutos, hasta que la corteza esté dorada y el queso esté derretido y burbujeante con un dorado ligero.

Retira del horno y espolvorea con 1/4 cup de cilantro fresco.

Deja reposar de 2 a 3 minutos antes de cortar y servir.`,
    },
  },
},

{
  id: "homemade-fried-chicken",
  slug: "homemade-fried-chicken",
  name: "Homemade Fried Chicken",
  ingredients: `Chicken:
3 lbs bone-in chicken pieces (legs, thighs, breasts, wings)
2 cups buttermilk
1 Tbsp hot sauce (optional)
1 tsp salt
1/2 tsp black pepper

Flour Coating:
2 cups all-purpose flour
1 Tbsp paprika (or smoked paprika for extra depth)
1 tsp garlic powder
1 tsp onion powder
1 tsp salt
1/2 tsp black pepper
1/2 tsp cayenne pepper (optional)

For Frying:
vegetable oil (enough for 2 to 3 inches in a skillet or pot)`,
  instructions: `In a large bowl, combine 2 cups buttermilk, 1 Tbsp hot sauce if using, 1 tsp salt, and 1/2 tsp black pepper.

Add 3 lbs chicken pieces, making sure they are fully coated. Cover and refrigerate for at least 2 hours, or overnight for best flavor and tenderness.

In a separate bowl, mix 2 cups flour, 1 Tbsp paprika, 1 tsp garlic powder, 1 tsp onion powder, 1 tsp salt, 1/2 tsp black pepper, and 1/2 tsp cayenne if using.

Remove chicken from the buttermilk, letting excess drip off.

Dredge each piece in the seasoned flour, pressing firmly so a thick coating adheres. Set coated chicken on a rack and let rest for 10 to 15 minutes to help the crust stick.

Heat vegetable oil in a large cast iron skillet or heavy pot over medium heat until it reaches 325°F to 350°F.

Carefully place chicken in the hot oil, skin-side down. Do not overcrowd the pan.

Fry for 12 to 15 minutes, turning occasionally, until the crust is deep golden-brown and crispy and the internal temperature reaches 165°F.

Transfer chicken to a wire rack (not paper towels) to drain and stay crispy.

Let rest for 5 minutes before serving.`,
  photoUrl: "/images/homemade-fried-chicken.jpg",
  effort: "big",
  tags: ["dinner", "chicken", "fried", "comfort", "crispy", "family", "southern"],
  isVegetarian: false,
  // Homemade Fried Chicken
suggestedSides: [
  "Mashed potatoes",
  "Coleslaw",
  "Biscuits",
],
  notes: "Classic crispy fried chicken with a flavorful, well-seasoned crust. Marinating in buttermilk keeps the chicken juicy while creating a tender interior.",
  translations: {
    es: {
      name: "Pollo frito casero",
      notes:
        "Pollo frito clásico y crujiente con una costra bien sazonada y llena de sabor. Marinar en buttermilk mantiene el pollo jugoso y crea un interior tierno.",
      tags: [
        "cena",
        "pollo",
        "frito",
        "comida reconfortante",
        "crujiente",
        "familiar",
        "sureño",
      ],
      suggestedSides: [
        "Puré de papas",
        "Ensalada de col",
        "Biscuits",
      ],
      ingredients: `Pollo:
3 lbs de piezas de pollo con hueso, piernas, muslos, pechugas o alitas
2 cups de buttermilk
1 Tbsp de salsa picante, opcional
1 tsp de sal
1/2 tsp de pimienta negra

Cobertura de harina:
2 cups de harina de todo uso
1 Tbsp de paprika o paprika ahumada para más profundidad
1 tsp de ajo en polvo
1 tsp de cebolla en polvo
1 tsp de sal
1/2 tsp de pimienta negra
1/2 tsp de pimienta de cayena, opcional

Para freír:
aceite vegetal, suficiente para 2 a 3 inches en un sartén u olla`,
      instructions: `En un tazón grande, combina 2 cups de buttermilk, 1 Tbsp de salsa picante si la usas, 1 tsp de sal y 1/2 tsp de pimienta negra.

Agrega 3 lbs de piezas de pollo, asegurándote de que queden completamente cubiertas. Cubre y refrigera por al menos 2 horas, o toda la noche para mejor sabor y ternura.

En otro tazón, mezcla 2 cups de harina, 1 Tbsp de paprika, 1 tsp de ajo en polvo, 1 tsp de cebolla en polvo, 1 tsp de sal, 1/2 tsp de pimienta negra y 1/2 tsp de cayena si la usas.

Retira el pollo del buttermilk, dejando escurrir el exceso.

Pasa cada pieza por la harina sazonada, presionando firmemente para que se adhiera una capa gruesa. Coloca el pollo empanizado sobre una rejilla y deja reposar de 10 a 15 minutos para ayudar a que la costra se adhiera.

Calienta aceite vegetal en un sartén grande de hierro fundido o una olla pesada a fuego medio hasta que alcance 325°F a 350°F.

Coloca cuidadosamente el pollo en el aceite caliente, con la piel hacia abajo. No llenes demasiado el sartén.

Fríe de 12 a 15 minutos, volteando de vez en cuando, hasta que la costra esté dorada intensa y crujiente, y la temperatura interna alcance 165°F.

Pasa el pollo a una rejilla, no a toallas de papel, para escurrirlo y mantenerlo crujiente.

Deja reposar 5 minutos antes de servir.`,
    },
  },
},

{
  id: "chimichurri-skirt-steak-bowls",
  slug: "chimichurri-skirt-steak-bowls",
  name: "Chimichurri Skirt Steak Bowls",
  effort: "normal",
  photoUrl: "/images/chimichurri-skirt-steak-bowls.jpg",
  tags: [
    "dinner",
    "beef",
    "bowls",
    "grilling",
    "healthy",
    "high-protein",
    "meal-prep",
  ],
  isVegetarian: false,
  // Chimichurri Skirt Steak Bowls
suggestedSides: [
  "Tortilla chips",
  "Grilled vegetables",
  "Side salad",
],
  notes:
    "Skirt steak cooks quickly and develops incredible flavor over high heat. Always slice against the grain to keep the steak tender, and let the chimichurri sit a few minutes before serving so the flavors meld together.",
  ingredients: `Steak:
1 1/2 lbs skirt steak
1 tbsp olive oil
1 tsp salt
1/2 tsp black pepper
1/2 tsp smoked paprika

Chimichurri Sauce:
1 cup fresh parsley, finely chopped
2 tbsp fresh cilantro, chopped
3 cloves garlic, minced
2 tbsp red wine vinegar
1/2 cup olive oil
1/2 tsp red pepper flakes
1/2 tsp salt
1/4 tsp black pepper

Bowls:
3 cups cooked rice
1 cup cherry tomatoes, halved
1 avocado, sliced
1 cup corn
1/2 cup red onion, thinly sliced

Optional:
lime wedges
crumbled cotija cheese`,
  instructions: `Pat 1 1/2 lbs skirt steak dry with paper towels and rub with 1 tbsp olive oil.

Season with 1 tsp salt, 1/2 tsp black pepper, and 1/2 tsp smoked paprika.

In a bowl, combine 1 cup parsley, 2 tbsp cilantro, 3 cloves garlic, 2 tbsp red wine vinegar, 1/2 cup olive oil, 1/2 tsp red pepper flakes, 1/2 tsp salt, and 1/4 tsp black pepper. Stir well and set aside.

Heat a cast iron skillet or grill pan over high heat until very hot.

Cook the skirt steak for 3 to 4 minutes per side, until a deep char forms and the internal temperature reaches about 130°F for medium-rare.

Remove from heat and let rest for 5 to 10 minutes before slicing thinly against the grain.

Assemble bowls with 3 cups cooked rice as the base.

Top with sliced steak, cherry tomatoes, avocado, corn, and red onion.

Spoon chimichurri generously over the steak and bowls.

Serve with lime wedges and cotija cheese if desired.`,
  translations: {
    es: {
      name: "Bowls de Arrachera con Chimichurri",
      notes:
        "La arrachera se cocina rápidamente y desarrolla un sabor increíble a fuego alto. Siempre corta la carne en contra de la fibra para mantenerla tierna y deja reposar el chimichurri unos minutos para que los sabores se integren.",
      tags: [
        "cena",
        "carne",
        "bowls",
        "parrilla",
        "saludable",
        "alto en proteína",
        "meal-prep",
      ],
      suggestedSides: [
        "Totopos",
        "Verduras a la parrilla",
        "Ensalada sencilla",
      ],
      ingredients: `Carne:
1 1/2 lbs de arrachera
1 Tbsp de aceite de oliva
1 tsp de sal
1/2 tsp de pimienta negra
1/2 tsp de paprika ahumada

Salsa Chimichurri:
1 cup de perejil fresco, finamente picado
2 Tbsp de cilantro fresco, picado
3 dientes de ajo, picados
2 Tbsp de vinagre de vino tinto
1/2 cup de aceite de oliva
1/2 tsp de hojuelas de chile rojo
1/2 tsp de sal
1/4 tsp de pimienta negra

Bowls:
3 cups de arroz cocido
1 cup de tomates cherry, partidos a la mitad
1 aguacate, en rebanadas
1 cup de maíz
1/2 cup de cebolla morada, en rodajas finas

Opcional:
gajos de limón
queso cotija desmoronado`,
      instructions: `Seca 1 1/2 lbs de arrachera con toallas de papel y úntala con 1 Tbsp de aceite de oliva.

Sazona con 1 tsp de sal, 1/2 tsp de pimienta negra y 1/2 tsp de paprika ahumada.

En un tazón, mezcla 1 cup de perejil, 2 Tbsp de cilantro, 3 dientes de ajo, 2 Tbsp de vinagre de vino tinto, 1/2 cup de aceite de oliva, 1/2 tsp de hojuelas de chile rojo, 1/2 tsp de sal y 1/4 tsp de pimienta negra. Mezcla bien y reserva.

Calienta una sartén de hierro fundido o parrilla a fuego alto hasta que esté muy caliente.

Cocina la arrachera de 3 a 4 minutos por lado hasta que se forme un dorado intenso y la temperatura interna alcance aproximadamente 130°F para término medio rojo.

Retira del fuego y deja reposar de 5 a 10 minutos antes de cortar en tiras delgadas en contra de la fibra.

Arma los bowls usando 3 cups de arroz cocido como base.

Agrega la carne, tomates cherry, aguacate, maíz y cebolla morada.

Sirve abundante chimichurri encima de la carne y los bowls.

Sirve con limón y queso cotija si lo deseas.`,
    },
  },
},

{
  id: "lamb-and-beef-gateway-burgers",
  slug: "lamb-and-beef-gateway-burgers",
  name: "Lamb and Beef Gateway Burgers",
  effort: "normal",
  photoUrl: "/images/lamb-and-beef-gateway-burgers.jpg",
  tags: [
    "dinner",
    "burgers",
    "beef",
    "lamb",
    "grilling",
    "comfort",
    "premium",
    "family",
  ],
  isVegetarian: false,
  // Lamb and Beef Gateway Burgers
suggestedSides: [
  "Sweet potato fries",
  "Greek salad",
  "Pickles",
],
  notes:
    "Blending lamb with beef creates a rich, flavorful burger without being overpowering. The creamy herb sauce balances the richness and makes these burgers approachable even for people new to lamb.",
  ingredients: `Burger Patties:
1 lb ground beef (80/20 recommended)
1 lb ground lamb
1 tsp salt
1/2 tsp black pepper
1 tsp garlic powder
1 tsp dried oregano
1 tbsp Worcestershire sauce

Herb Sauce:
1/2 cup Greek yogurt
1 tbsp lemon juice
1 tbsp fresh parsley, chopped
1 clove garlic, minced
1/4 tsp salt

Assembly:
4 brioche burger buns
1/2 cup red onion, thinly sliced
1 cup arugula or lettuce
4 slices feta cheese (optional)
1 tbsp butter, softened`,
  instructions: `In a large bowl, combine 1 lb ground beef, 1 lb ground lamb, 1 tsp salt, 1/2 tsp black pepper, 1 tsp garlic powder, 1 tsp oregano, and 1 tbsp Worcestershire sauce.

Mix gently until just combined, being careful not to overwork the meat.

Form into 4 burger patties slightly wider than the buns.

In a small bowl, whisk together 1/2 cup Greek yogurt, 1 tbsp lemon juice, 1 tbsp parsley, 1 clove garlic, and 1/4 tsp salt. Refrigerate until ready to serve.

Heat a cast iron skillet or grill over medium-high heat.

Butter the inside of 4 brioche buns with 1 tbsp softened butter and toast until golden brown. Set aside.

Cook burger patties for 4 to 5 minutes per side, until a deep crust forms and the internal temperature reaches 160°F.

If using feta cheese, place on the burgers during the final minute of cooking.

Spread herb sauce onto the toasted buns.

Top with burgers, red onion, and arugula.

Serve immediately while hot and juicy.`,
  translations: {
    es: {
      name: "Hamburguesas Mixtas de Cordero y Res",
      notes:
        "Mezclar cordero con carne de res crea una hamburguesa rica y llena de sabor sin ser demasiado intensa. La salsa cremosa de hierbas equilibra perfectamente la carne y hace que estas hamburguesas sean ideales incluso para quienes nunca han probado el cordero.",
      tags: [
        "cena",
        "hamburguesas",
        "carne",
        "cordero",
        "parrilla",
        "comfort",
        "premium",
        "familiar",
      ],
      suggestedSides: [
        "Papas fritas de camote",
        "Ensalada griega",
        "Pepinillos",
      ],
      ingredients: `Hamburguesas:
1 lb de carne molida de res (80/20 recomendado)
1 lb de carne molida de cordero
1 tsp de sal
1/2 tsp de pimienta negra
1 tsp de ajo en polvo
1 tsp de orégano seco
1 Tbsp de salsa Worcestershire

Salsa de Hierbas:
1/2 cup de yogur griego
1 Tbsp de jugo de limón
1 Tbsp de perejil fresco, picado
1 diente de ajo, picado
1/4 tsp de sal

Montaje:
4 panes brioche para hamburguesa
1/2 cup de cebolla morada, en rodajas finas
1 cup de arúgula o lechuga
4 rebanadas de queso feta (opcional)
1 Tbsp de mantequilla, suave`,
      instructions: `En un tazón grande, mezcla 1 lb de carne molida de res, 1 lb de carne molida de cordero, 1 tsp de sal, 1/2 tsp de pimienta negra, 1 tsp de ajo en polvo, 1 tsp de orégano y 1 Tbsp de salsa Worcestershire.

Mezcla suavemente hasta integrar, evitando trabajar demasiado la carne.

Forma 4 hamburguesas ligeramente más grandes que los panes.

En un tazón pequeño, mezcla 1/2 cup de yogur griego, 1 Tbsp de jugo de limón, 1 Tbsp de perejil, 1 diente de ajo y 1/4 tsp de sal. Refrigera hasta servir.

Calienta una sartén de hierro fundido o parrilla a fuego medio-alto.

Unta mantequilla en el interior de los panes brioche y tuéstalos hasta que estén dorados. Reserva.

Cocina las hamburguesas de 4 a 5 minutos por lado hasta que se forme una costra dorada intensa y la temperatura interna alcance 160°F.

Si usas queso feta, colócalo sobre las hamburguesas durante el último minuto de cocción.

Unta la salsa de hierbas en los panes tostados.

Agrega las hamburguesas, cebolla morada y arúgula.

Sirve inmediatamente mientras estén calientes y jugosas.`,
    },
  },
},

{
  id: "air-fryer-brisket-taquitos",
  slug: "air-fryer-brisket-taquitos",
  name: "Air Fryer Brisket Taquitos",
  effort: "normal",
  photoUrl: "/images/air-fryer-brisket-taquitos.jpg",
  tags: [
    "dinner",
    "beef",
    "air-fryer",
    "tex-mex",
    "crispy",
    "comfort",
    "leftovers",
    "family",
  ],
  isVegetarian: false,
  // Air Fryer Brisket Taquitos
suggestedSides: [
  "Chips and salsa",
  "Mexican street corn",
  "Cilantro lime rice",
],
  notes:
    "Using leftover brisket makes these taquitos incredibly flavorful and easy. Warming the tortillas first is the key to preventing them from cracking while rolling.",
  ingredients: `Filling:
2 cups cooked brisket, shredded
1/2 cup Monterey Jack cheese, shredded
1/4 cup cream cheese, softened
1/4 cup salsa
1 tsp chili powder
1/2 tsp cumin
1/4 tsp garlic powder

Taquitos:
10 corn tortillas
olive oil spray

Optional Toppings:
sour cream
guacamole
pico de gallo
fresh cilantro
lime wedges`,
  instructions: `In a large bowl, combine 2 cups shredded brisket, 1/2 cup Monterey Jack cheese, 1/4 cup cream cheese, 1/4 cup salsa, 1 tsp chili powder, 1/2 tsp cumin, and 1/4 tsp garlic powder.

Mix until evenly combined.

Warm 10 corn tortillas for 20 to 30 seconds in the microwave wrapped in a damp paper towel to make them flexible and prevent cracking.

Spoon about 2 to 3 tbsp of brisket filling onto each tortilla and roll tightly.

Preheat air fryer to 400°F.

Lightly spray the taquitos with olive oil spray on all sides.

Place taquitos seam-side down in the air fryer basket in a single layer, working in batches if needed.

Cook for 7 to 9 minutes, flipping halfway through, until deeply golden and crispy.

Serve hot with sour cream, guacamole, pico de gallo, cilantro, and lime wedges if desired.`,
  translations: {
    es: {
      name: "Taquitos de Brisket en Freidora de Aire",
      notes:
        "Usar brisket sobrante hace que estos taquitos sean increíblemente sabrosos y fáciles de preparar. Calentar las tortillas primero ayuda a evitar que se rompan al enrollarlas.",
      tags: [
        "cena",
        "carne",
        "freidora de aire",
        "tex-mex",
        "crujiente",
        "comfort",
        "sobras",
        "familiar",
      ],
      suggestedSides: [
        "Totopos con salsa",
        "Elote estilo mexicano",
        "Arroz con cilantro y lima",
      ],
      ingredients: `Relleno:
2 cups de brisket cocido y deshebrado
1/2 cup de queso Monterey Jack rallado
1/4 cup de queso crema, suave
1/4 cup de salsa
1 tsp de chile en polvo
1/2 tsp de comino
1/4 tsp de ajo en polvo

Taquitos:
10 tortillas de maíz
spray de aceite de oliva

Toppings Opcionales:
crema agria
guacamole
pico de gallo
cilantro fresco
gajos de limón`,
      instructions: `En un tazón grande, mezcla 2 cups de brisket deshebrado, 1/2 cup de queso Monterey Jack, 1/4 cup de queso crema, 1/4 cup de salsa, 1 tsp de chile en polvo, 1/2 tsp de comino y 1/4 tsp de ajo en polvo.

Mezcla hasta integrar bien.

Calienta 10 tortillas de maíz durante 20 a 30 segundos en el microondas envueltas en una toalla húmeda para hacerlas más flexibles y evitar que se rompan.

Coloca aproximadamente 2 a 3 Tbsp del relleno en cada tortilla y enrolla firmemente.

Precalienta la freidora de aire a 400°F.

Rocía ligeramente los taquitos con spray de aceite de oliva por todos lados.

Coloca los taquitos con la unión hacia abajo en la canasta de la freidora en una sola capa, cocinando en tandas si es necesario.

Cocina de 7 a 9 minutos, volteando a la mitad del tiempo, hasta que estén dorados y crujientes.

Sirve calientes con crema agria, guacamole, pico de gallo, cilantro y limón si lo deseas.`,
    },
  },
},

{
  id: "homemade-pizza-pockets",
  slug: "homemade-pizza-pockets",
  name: "Homemade Pizza Pockets",
  effort: "normal",
  photoUrl: "/images/homemade-pizza-pockets.jpg",
  tags: [
    "dinner",
    "pizza",
    "comfort",
    "family",
    "kid-friendly",
    "handheld",
    "oven",
  ],
  isVegetarian: false,
  // Homemade Pizza Pockets
suggestedSides: [
  "Marinara dipping sauce",
  "Simple green salad",
  "Carrot sticks with ranch",
],
  notes:
    "Keeping the sauce light helps prevent soggy pizza pockets. Sealing the edges tightly is the key to keeping the cheese and fillings from leaking while baking.",
  ingredients: `Dough:
1 lb pizza dough (store-bought or homemade)
1 tbsp flour (for rolling)

Filling:
1 cup marinara sauce
1 1/2 cups mozzarella cheese, shredded
1/2 cup pepperoni slices
1/2 tsp Italian seasoning
1/4 tsp garlic powder

Finish:
1 tbsp olive oil
1 tbsp parmesan cheese, grated

Optional:
pizza toppings of choice (sausage, mushrooms, peppers, olives)`,
  instructions: `Preheat oven to 425°F.

Lightly flour a work surface with 1 tbsp flour.

Roll 1 lb pizza dough into a large rectangle and cut into 4 equal portions.

Spread about 2 tbsp marinara sauce onto one half of each dough piece, leaving a small border around the edges.

Top with mozzarella cheese, pepperoni, 1/2 tsp Italian seasoning, and 1/4 tsp garlic powder divided evenly between the pockets.

Fold the dough over the filling and press the edges firmly to seal. Crimp edges with a fork if desired.

Place pizza pockets onto a parchment-lined baking sheet.

Brush the tops with 1 tbsp olive oil.

Cut a small slit in the top of each pocket to allow steam to escape.

Bake for 15 to 18 minutes, until deeply golden-brown and crisp.

Remove from oven and sprinkle with 1 tbsp parmesan cheese.

Let cool for 5 minutes before serving because the filling will be very hot.`,
  translations: {
    es: {
      name: "Pizza Pockets Caseros",
      notes:
        "Usar poca salsa ayuda a evitar que las pizza pockets queden aguadas. Sellar bien los bordes evita que el queso y los rellenos se salgan durante el horneado.",
      tags: [
        "cena",
        "pizza",
        "comfort",
        "familiar",
        "niños",
        "portátil",
        "horno",
      ],
      suggestedSides: [
        "Salsa marinara para acompañar",
        "Ensalada verde sencilla",
        "Palitos de zanahoria con ranch",
      ],
      ingredients: `Masa:
1 lb de masa para pizza (casera o comprada)
1 Tbsp de harina (para extender)

Relleno:
1 cup de salsa marinara
1 1/2 cups de queso mozzarella rallado
1/2 cup de pepperoni
1/2 tsp de sazón italiana
1/4 tsp de ajo en polvo

Final:
1 Tbsp de aceite de oliva
1 Tbsp de queso parmesano rallado

Opcional:
ingredientes para pizza al gusto (salchicha, champiñones, pimientos, aceitunas)`,
      instructions: `Precalienta el horno a 425°F.

Espolvorea ligeramente una superficie de trabajo con 1 Tbsp de harina.

Extiende 1 lb de masa para pizza formando un rectángulo grande y córtalo en 4 partes iguales.

Coloca aproximadamente 2 Tbsp de salsa marinara en una mitad de cada pieza de masa, dejando un pequeño borde alrededor.

Agrega mozzarella, pepperoni, 1/2 tsp de sazón italiana y 1/4 tsp de ajo en polvo divididos entre las piezas.

Dobla la masa sobre el relleno y presiona bien los bordes para sellar. Puedes marcar los bordes con un tenedor si deseas.

Coloca las pizza pockets sobre una bandeja con papel para hornear.

Barniza la parte superior con 1 Tbsp de aceite de oliva.

Haz un pequeño corte en la parte superior de cada pieza para permitir que salga el vapor.

Hornea de 15 a 18 minutos hasta que estén doradas y crujientes.

Retira del horno y espolvorea 1 Tbsp de queso parmesano.

Deja enfriar 5 minutos antes de servir porque el relleno estará muy caliente.`,
    },
  },
},

{
  id: "baked-potato-bar",
  slug: "baked-potato-bar",
  name: "Baked Potato Bar",
  effort: "normal",
  photoUrl: "/images/baked-potato-bar.jpg",
  tags: [
    "dinner",
    "potatoes",
    "family",
    "comfort",
    "customizable",
    "oven",
    "party-food",
  ],
  isVegetarian: false,
  // Baked Potato Bar
suggestedSides: [
  "Side salad",
  "Steamed broccoli",
  "Chili",
],
  notes:
    "Baking potatoes directly on the oven rack helps create crisp skins while keeping the inside fluffy. Setting up a topping bar makes this perfect for family dinners or casual gatherings.",
  ingredients: `Potatoes:
6 large russet potatoes
2 tbsp olive oil
1 tsp salt
1/2 tsp black pepper

Classic Toppings:
1 cup cheddar cheese, shredded
1/2 cup sour cream
1/2 cup bacon bits
1/4 cup green onions, sliced
2 tbsp butter

Optional Toppings:
broccoli florets, steamed
chili
jalapeños
pulled pork
buffalo chicken
ranch dressing`,
  instructions: `Preheat oven to 425°F.

Scrub 6 russet potatoes clean and dry thoroughly with paper towels.

Rub potatoes with 2 tbsp olive oil and season evenly with 1 tsp salt and 1/2 tsp black pepper.

Place potatoes directly on the oven rack or on a baking sheet.

Bake for 50 to 65 minutes, until the skins are crisp and the centers are fork-tender.

While the potatoes bake, prepare desired toppings such as shredded cheese, sour cream, bacon bits, steamed broccoli, or warmed chili.

Remove potatoes from the oven and let cool for 5 minutes.

Slice each potato open lengthwise and gently fluff the inside with a fork.

Add 2 tbsp butter divided between the potatoes, then set out toppings buffet-style so everyone can build their own potato.

Serve warm.`,
  translations: {
    es: {
      name: "Barra de Papas Horneadas",
      notes:
        "Hornear las papas directamente sobre la rejilla del horno ayuda a crear una piel crujiente mientras el interior queda suave y esponjoso. Preparar una barra de toppings hace que esta comida sea perfecta para cenas familiares o reuniones casuales.",
      tags: [
        "cena",
        "papas",
        "familiar",
        "comfort",
        "personalizable",
        "horno",
        "comida para fiestas",
      ],
      suggestedSides: [
        "Ensalada sencilla",
        "Brócoli al vapor",
        "Chili",
      ],
      ingredients: `Papas:
6 papas russet grandes
2 Tbsp de aceite de oliva
1 tsp de sal
1/2 tsp de pimienta negra

Toppings Clásicos:
1 cup de queso cheddar rallado
1/2 cup de crema agria
1/2 cup de trocitos de tocino
1/4 cup de cebollines en rodajas
2 Tbsp de mantequilla

Toppings Opcionales:
brócoli al vapor
chili
jalapeños
pulled pork
pollo buffalo
aderezo ranch`,
      instructions: `Precalienta el horno a 425°F.

Lava bien 6 papas russet y sécalas completamente con toallas de papel.

Unta las papas con 2 Tbsp de aceite de oliva y sazona uniformemente con 1 tsp de sal y 1/2 tsp de pimienta negra.

Coloca las papas directamente sobre la rejilla del horno o en una bandeja para hornear.

Hornea de 50 a 65 minutos hasta que la piel esté crujiente y el interior suave al pinchar con un tenedor.

Mientras las papas se hornean, prepara los toppings deseados como queso rallado, crema agria, tocino, brócoli o chili caliente.

Retira las papas del horno y deja enfriar durante 5 minutos.

Haz un corte a lo largo de cada papa y esponja el interior suavemente con un tenedor.

Agrega las 2 Tbsp de mantequilla divididas entre las papas y coloca los toppings estilo buffet para que cada persona arme la suya.

Sirve caliente.`,
    },
  },
},

{
  id: "alphabet-star-pasta-soup",
  slug: "alphabet-star-pasta-soup",
  name: "Alphabet or Star-Shaped Pasta Soup",
  effort: "quick",
  photoUrl: "/images/alphabet-star-pasta-soup.jpg",
  tags: [
    "dinner",
    "soup",
    "comfort",
    "family",
    "kid-friendly",
    "one-pot",
    "meal-prep",
  ],
  isVegetarian: false,
  // Alphabet or Star-Shaped Pasta Soup
suggestedSides: [
  "Grilled cheese sandwich",
  "Apple slices",
  "Crackers",
],
  notes:
    "Small pasta shapes cook quickly and make this soup especially family-friendly. Stir occasionally while simmering so the pasta cooks evenly and doesn’t stick to the bottom of the pot.",
  ingredients: `Soup Base:
1 tbsp olive oil
1 small onion, diced
2 carrots, diced
2 celery stalks, diced
2 cloves garlic, minced

Soup:
6 cups chicken broth (or vegetable broth for vegetarian)
1 (14 oz) can diced tomatoes
1 tsp Italian seasoning
1/2 tsp salt
1/4 tsp black pepper

Pasta:
1 cup alphabet pasta or stelline pasta

Optional:
1 cup cooked shredded chicken
2 tbsp fresh parsley, chopped
parmesan cheese for serving`,
  instructions: `Heat 1 tbsp olive oil in a large pot over medium heat.

Add 1 diced onion, 2 diced carrots, and 2 diced celery stalks. Cook 5 to 6 minutes until softened.

Add 2 cloves garlic and cook 30 seconds until fragrant.

Pour in 6 cups broth and 1 can diced tomatoes.

Add 1 tsp Italian seasoning, 1/2 tsp salt, and 1/4 tsp black pepper.

Bring the soup to a gentle boil.

Stir in 1 cup alphabet pasta or stelline pasta.

Reduce heat to a simmer and cook 8 to 10 minutes, stirring occasionally, until the pasta is tender.

Add 1 cup shredded chicken if using and heat through for 2 minutes.

Taste and adjust seasoning if needed.

Serve warm with fresh parsley and parmesan cheese if desired.`,
  translations: {
    es: {
      name: "Sopa de Pasta de Letras o Estrellitas",
      notes:
        "Las pastas pequeñas se cocinan rápidamente y hacen que esta sopa sea perfecta para toda la familia. Revuelve ocasionalmente mientras hierve a fuego lento para evitar que la pasta se pegue al fondo de la olla.",
      tags: [
        "cena",
        "sopa",
        "comfort",
        "familiar",
        "niños",
        "una olla",
        "meal-prep",
      ],
      suggestedSides: [
        "Sándwich de queso a la plancha",
        "Rebanadas de manzana",
        "Galletas saladas",
      ],
      ingredients: `Base de la Sopa:
1 Tbsp de aceite de oliva
1 cebolla pequeña, picada
2 zanahorias, picadas
2 tallos de apio, picados
2 dientes de ajo, picados

Sopa:
6 cups de caldo de pollo (o caldo de verduras para versión vegetariana)
1 lata (14 oz) de tomates picados
1 tsp de sazón italiana
1/2 tsp de sal
1/4 tsp de pimienta negra

Pasta:
1 cup de pasta de letras o estrellitas

Opcional:
1 cup de pollo cocido y desmenuzado
2 Tbsp de perejil fresco, picado
queso parmesano para servir`,
      instructions: `Calienta 1 Tbsp de aceite de oliva en una olla grande a fuego medio.

Agrega 1 cebolla picada, 2 zanahorias picadas y 2 tallos de apio picados. Cocina de 5 a 6 minutos hasta que estén suaves.

Agrega 2 dientes de ajo y cocina 30 segundos hasta que estén fragantes.

Vierte 6 cups de caldo y 1 lata de tomates picados.

Agrega 1 tsp de sazón italiana, 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Lleva la sopa a un hervor suave.

Agrega 1 cup de pasta de letras o estrellitas.

Reduce el fuego y cocina a fuego lento de 8 a 10 minutos, revolviendo ocasionalmente, hasta que la pasta esté tierna.

Agrega 1 cup de pollo desmenuzado si lo deseas y cocina 2 minutos más hasta que esté caliente.

Prueba y ajusta la sazón si es necesario.

Sirve caliente con perejil fresco y queso parmesano si deseas.`,
    },
  },
},

{
  id: "mississippi-chicken",
  slug: "mississippi-chicken",
  name: "Mississippi Chicken",
  effort: "big",
  photoUrl: "/images/mississippi-chicken.jpg",
  tags: [
    "dinner",
    "chicken",
    "slow-cooker",
    "comfort",
    "easy",
    "family",
    "meal-prep",
  ],
  isVegetarian: false,
  // Mississippi Chicken
suggestedSides: [
  "Mashed potatoes",
  "Green beans",
  "Dinner rolls",
],
  notes:
    "A super simple slow cooker classic with rich, tangy flavor. The butter and seasoning create a savory sauce while the pepperoncini adds a mild kick without being too spicy.",
  ingredients: `Chicken:
2 to 3 lbs boneless skinless chicken breasts (or thighs)

Seasoning:
1 packet ranch seasoning mix
1 packet au jus gravy mix (or brown gravy mix)

Flavor:
1/2 cup butter (1 stick), sliced
6 to 8 pepperoncini peppers
1/4 cup pepperoncini juice (optional, for extra tang)`,
  instructions: `Place 2 to 3 lbs chicken in the bottom of a slow cooker.

Sprinkle 1 packet ranch seasoning and 1 packet au jus mix evenly over the chicken.

Top with 1/2 cup sliced butter and 6 to 8 pepperoncini peppers. Add 1/4 cup pepperoncini juice if using.

Cover and cook on low for 6 to 7 hours or on high for 3 to 4 hours, until the chicken is very tender and easily shreds.

Use two forks to shred the chicken directly in the slow cooker, mixing it with the juices and melted butter.

Serve warm.`,
  translations: {
    es: {
      name: "Pollo Mississippi",
      notes:
        "Un clásico súper fácil de olla lenta con sabor rico y ligeramente ácido. La mantequilla y los sazonadores crean una salsa sabrosa mientras los pepperoncini aportan un toque suave sin ser demasiado picante.",
      tags: [
        "cena",
        "pollo",
        "olla lenta",
        "comfort",
        "fácil",
        "familiar",
        "meal-prep",
      ],
      suggestedSides: [
        "Puré de papas",
        "Ejotes",
        "Panecillos",
      ],
      ingredients: `Pollo:
2 a 3 lbs de pechugas de pollo sin hueso y sin piel (o muslos)

Sazonadores:
1 paquete de mezcla ranch
1 paquete de mezcla au jus (o gravy marrón)

Sabor:
1/2 cup de mantequilla (1 barra), en rebanadas
6 a 8 chiles pepperoncini
1/4 cup de jugo de pepperoncini (opcional, para más sabor ácido)`,
      instructions: `Coloca 2 a 3 lbs de pollo en el fondo de una olla lenta.

Espolvorea 1 paquete de mezcla ranch y 1 paquete de mezcla au jus uniformemente sobre el pollo.

Agrega 1/2 cup de mantequilla en rebanadas y 6 a 8 pepperoncini. Añade 1/4 cup de jugo de pepperoncini si lo deseas.

Cubre y cocina a temperatura baja de 6 a 7 horas o alta de 3 a 4 horas, hasta que el pollo esté muy tierno y se desmenuce fácilmente.

Usa dos tenedores para desmenuzar el pollo directamente en la olla lenta, mezclándolo con los jugos y la mantequilla derretida.

Sirve caliente.`,
    },
  },
},

{
  id: "garlic-herb-pork-loin",
  slug: "garlic-herb-pork-loin",
  name: "Garlic Herb Pork Loin",
  effort: "normal",
  photoUrl: "/images/garlic-herb-pork-loin.jpg",
  tags: [
    "dinner",
    "pork",
    "oven",
    "comfort",
    "family",
    "roasted",
    "high-protein",
  ],
  isVegetarian: false,
  // Garlic Herb Pork Loin
suggestedSides: [
  "Roasted potatoes",
  "Green beans",
  "Side salad",
],
  notes:
    "Searing the pork before roasting builds a flavorful crust while keeping the inside juicy. Letting the pork rest before slicing helps retain moisture and keeps the meat tender.",
  ingredients: `Pork:
3 to 4 lb pork loin
1 tbsp olive oil

Seasoning Rub:
1 tsp salt
1/2 tsp black pepper
1 tsp garlic powder
1 tsp onion powder
1 tsp dried thyme
1 tsp smoked paprika (or regular paprika for a milder flavor)

Pan Sauce:
2 tbsp butter
3 cloves garlic, minced
1 cup chicken broth
1 tbsp Dijon mustard
1 tsp Worcestershire sauce
1 tbsp fresh parsley, chopped`,
  instructions: `Preheat oven to 375°F.

Pat 3 to 4 lb pork loin completely dry with paper towels. Rub all sides with 1 tbsp olive oil.

In a small bowl, combine 1 tsp salt, 1/2 tsp black pepper, 1 tsp garlic powder, 1 tsp onion powder, 1 tsp thyme, and 1 tsp smoked paprika.

Season the pork loin evenly on all sides, pressing the seasoning into the meat.

Heat a large oven-safe skillet or cast iron pan over medium-high heat.

Sear the pork loin for 2 to 3 minutes per side, until a deep golden-brown crust forms.

Transfer the skillet to the oven and roast for 45 to 60 minutes, or until the thickest part reaches an internal temperature of 145°F.

Remove the pork loin from the pan and let rest for 10 minutes before slicing.

While the pork rests, place the skillet back over medium heat.

Add 2 tbsp butter and 3 cloves garlic. Cook for 30 seconds until fragrant.

Pour in 1 cup chicken broth, 1 tbsp Dijon mustard, and 1 tsp Worcestershire sauce.

Simmer for 3 to 5 minutes, scraping up browned bits from the pan, until the sauce slightly thickens and coats the back of a spoon.

Slice the pork loin and spoon the sauce over the top.

Garnish with 1 tbsp fresh parsley and serve warm.`,
  translations: {
    es: {
      name: "Lomo de Cerdo con Ajo y Hierbas",
      notes:
        "Sellar el cerdo antes de hornearlo crea una costra llena de sabor y ayuda a mantener el interior jugoso. Dejar reposar el lomo antes de cortarlo conserva los jugos y mantiene la carne tierna.",
      tags: [
        "cena",
        "cerdo",
        "horno",
        "comfort",
        "familiar",
        "asado",
        "alto en proteína",
      ],
      suggestedSides: [
        "Papas asadas",
        "Ejotes",
        "Ensalada sencilla",
      ],
      ingredients: `Cerdo:
3 a 4 lb de lomo de cerdo
1 Tbsp de aceite de oliva

Mezcla de Sazonadores:
1 tsp de sal
1/2 tsp de pimienta negra
1 tsp de ajo en polvo
1 tsp de cebolla en polvo
1 tsp de tomillo seco
1 tsp de paprika ahumada (o paprika regular para un sabor más suave)

Salsa:
2 Tbsp de mantequilla
3 dientes de ajo, picados
1 cup de caldo de pollo
1 Tbsp de mostaza Dijon
1 tsp de salsa Worcestershire
1 Tbsp de perejil fresco, picado`,
      instructions: `Precalienta el horno a 375°F.

Seca completamente 3 a 4 lb de lomo de cerdo con toallas de papel. Unta todos los lados con 1 Tbsp de aceite de oliva.

En un tazón pequeño, mezcla 1 tsp de sal, 1/2 tsp de pimienta negra, 1 tsp de ajo en polvo, 1 tsp de cebolla en polvo, 1 tsp de tomillo y 1 tsp de paprika ahumada.

Sazona el lomo de cerdo uniformemente por todos lados, presionando la mezcla sobre la carne.

Calienta una sartén grande apta para horno o una sartén de hierro fundido a fuego medio-alto.

Sella el lomo de cerdo de 2 a 3 minutos por lado, hasta que se forme una costra dorada intensa.

Transfiere la sartén al horno y asa de 45 a 60 minutos, o hasta que la parte más gruesa alcance una temperatura interna de 145°F.

Retira el lomo de cerdo de la sartén y deja reposar 10 minutos antes de cortarlo.

Mientras el cerdo reposa, coloca la sartén nuevamente a fuego medio.

Agrega 2 Tbsp de mantequilla y 3 dientes de ajo. Cocina 30 segundos hasta que esté fragante.

Vierte 1 cup de caldo de pollo, 1 Tbsp de mostaza Dijon y 1 tsp de salsa Worcestershire.

Cocina a fuego lento de 3 a 5 minutos, raspando los trozos dorados del fondo de la sartén, hasta que la salsa espese ligeramente y cubra el dorso de una cuchara.

Corta el lomo de cerdo en rebanadas y sirve la salsa por encima.

Decora con 1 Tbsp de perejil fresco y sirve caliente.`,
    },
  },
},

{
  id: "smashburgers-with-tallow-crisped-edges",
  slug: "smashburgers-with-tallow-crisped-edges",
  name: "Smashburgers with Tallow-Crisped Edges",
  effort: "normal",
  photoUrl: "/images/smashburgers-with-tallow-crisped-edges.jpg",
  tags: [
    "dinner",
    "beef",
    "burgers",
    "comfort",
    "cast-iron",
    "crispy",
    "family",
    "griddle",
  ],
  isVegetarian: false,
  // Smashburgers with Tallow-Crisped Edges
suggestedSides: [
  "French fries",
  "Pickles",
  "Coleslaw",
],
  notes:
    "High heat and pressing the burgers immediately are the keys to classic smashburger texture. Beef tallow helps create deeply crisped, flavorful edges similar to diner-style burgers.",
  ingredients: `Burgers:
2 lbs ground beef (80/20 recommended)
1 tbsp beef tallow
1 tsp salt
1/2 tsp black pepper

Burger Sauce:
1/2 cup mayonnaise
2 tbsp ketchup
1 tbsp mustard
1 tbsp pickle relish
1/2 tsp garlic powder
1/4 tsp black pepper

Assembly:
4 burger buns
4 slices American cheese
1/2 cup onion, thinly sliced
pickle slices
lettuce (optional)
2 tbsp butter, softened`,
  instructions: `Divide 2 lbs ground beef into 8 loosely packed balls, about 4 oz each. Do not overwork the meat.

In a small bowl, whisk together 1/2 cup mayonnaise, 2 tbsp ketchup, 1 tbsp mustard, 1 tbsp pickle relish, 1/2 tsp garlic powder, and 1/4 tsp black pepper. Refrigerate until ready to use.

Heat a large cast iron skillet or flat-top griddle over high heat until very hot.

Add 1 tbsp beef tallow and spread evenly across the surface.

Butter the inside of 4 burger buns with 2 tbsp softened butter and toast cut-side down until golden brown. Set aside.

Place 2 beef balls onto the hot surface. Immediately smash very thin using a sturdy spatula or burger press.

Season with salt and pepper.

Cook for 2 to 3 minutes without moving, until the edges become deeply browned, crisp, and lacy.

Flip the burgers and immediately top 4 patties with American cheese.

Cook another 1 to 2 minutes until the cheese melts and the burgers are cooked through.

Stack two patties together for each burger.

Spread burger sauce onto the toasted buns.

Top with burgers, onions, pickles, and lettuce if desired.

Serve immediately while hot and crispy.`,
  translations: {
    es: {
      name: "Smashburgers con Bordes Crujientes de Sebo",
      notes:
        "El calor alto y aplastar las hamburguesas inmediatamente son la clave para lograr la textura clásica de un smashburger. El sebo de res ayuda a crear bordes extremadamente crujientes y llenos de sabor al estilo diner.",
      tags: [
        "cena",
        "carne",
        "hamburguesas",
        "comfort",
        "hierro fundido",
        "crujiente",
        "familiar",
        "plancha",
      ],
      suggestedSides: [
        "Papas fritas",
        "Pepinillos",
        "Ensalada de col",
      ],
      ingredients: `Hamburguesas:
2 lbs de carne molida de res (80/20 recomendado)
1 Tbsp de sebo de res
1 tsp de sal
1/2 tsp de pimienta negra

Salsa para Hamburguesa:
1/2 cup de mayonesa
2 Tbsp de ketchup
1 Tbsp de mostaza
1 Tbsp de relish de pepinillo
1/2 tsp de ajo en polvo
1/4 tsp de pimienta negra

Montaje:
4 panes para hamburguesa
4 rebanadas de queso americano
1/2 cup de cebolla, en rodajas finas
rodajas de pepinillo
lechuga (opcional)
2 Tbsp de mantequilla, suave`,
      instructions: `Divide 2 lbs de carne molida en 8 bolas sueltas de aproximadamente 4 oz cada una. No trabajes demasiado la carne.

En un tazón pequeño, mezcla 1/2 cup de mayonesa, 2 Tbsp de ketchup, 1 Tbsp de mostaza, 1 Tbsp de relish de pepinillo, 1/2 tsp de ajo en polvo y 1/4 tsp de pimienta negra. Refrigera hasta usar.

Calienta una sartén de hierro fundido o plancha a fuego alto hasta que esté muy caliente.

Agrega 1 Tbsp de sebo de res y distribúyelo uniformemente sobre la superficie.

Unta mantequilla en el interior de 4 panes para hamburguesa y tuéstalos con el lado cortado hacia abajo hasta que estén dorados. Reserva.

Coloca 2 bolas de carne sobre la superficie caliente y aplástalas inmediatamente usando una espátula resistente o prensa para hamburguesas.

Sazona con sal y pimienta.

Cocina de 2 a 3 minutos sin moverlas hasta que los bordes estén profundamente dorados, crujientes y delgados.

Voltea las hamburguesas y coloca inmediatamente queso americano sobre 4 de las piezas.

Cocina 1 a 2 minutos más hasta que el queso se derrita y las hamburguesas estén completamente cocidas.

Coloca dos hamburguesas juntas para cada pan.

Unta salsa sobre los panes tostados.

Agrega las hamburguesas, cebolla, pepinillos y lechuga si deseas.

Sirve inmediatamente mientras estén calientes y crujientes.`,
    },
  },
},

{
  id: "slow-cooked-birria-tacos",
  slug: "slow-cooked-birria-tacos",
  name: "Slow-Cooked Birria Tacos",
  effort: "big",
  photoUrl: "/images/slow-cooked-birria-tacos.jpg",
  tags: [
    "dinner",
    "beef",
    "tacos",
    "slow-cooker",
    "mexican",
    "comfort",
    "crispy",
    "family",
  ],
  isVegetarian: false,
  // Slow-Cooked Birria Tacos
suggestedSides: [
  "Mexican street corn",
  "Chips and salsa",
  "Cilantro lime rice",
],
  notes:
    "Slow cooking creates deeply flavorful, fall-apart beef while dipping the tortillas into the broth gives the tacos their signature crispy red exterior. Skim excess grease from the broth if desired before serving.",
  ingredients: `Beef:
3 lbs beef chuck roast, cut into large chunks
1 tbsp olive oil
1 tsp salt
1/2 tsp black pepper

Chile Sauce:
4 dried guajillo chiles, seeds removed
2 dried ancho chiles, seeds removed
1 chipotle pepper in adobo
1 small onion, roughly chopped
4 cloves garlic
1 (14 oz) can fire-roasted tomatoes
2 cups beef broth
2 tbsp apple cider vinegar

Seasoning:
1 tbsp chili powder
1 tsp cumin
1 tsp oregano
1/2 tsp smoked paprika
1/2 tsp cinnamon
1 bay leaf

Tacos:
12 corn tortillas
2 cups Oaxaca or mozzarella cheese, shredded
1/2 cup white onion, diced
1/4 cup cilantro, chopped

Optional:
lime wedges, for serving`,
  instructions: `Heat a dry skillet over medium heat.

Toast 4 guajillo chiles and 2 ancho chiles for 30 to 60 seconds per side until fragrant, being careful not to burn them.

Place toasted chiles in a bowl and cover with hot water. Let soak for 10 minutes until softened.

Heat 1 tbsp olive oil in a large skillet or Dutch oven over medium-high heat.

Season 3 lbs beef chuck roast with 1 tsp salt and 1/2 tsp black pepper.

Sear the beef in batches for 2 to 3 minutes per side until a deep golden-brown crust forms.

Transfer beef to a slow cooker.

Drain the softened chiles and add them to a blender along with 1 chipotle pepper, 1 chopped onion, 4 cloves garlic, 1 can fire-roasted tomatoes, 2 cups beef broth, 2 tbsp apple cider vinegar, 1 tbsp chili powder, 1 tsp cumin, 1 tsp oregano, 1/2 tsp smoked paprika, and 1/2 tsp cinnamon.

Blend until completely smooth.

Pour the sauce over the beef and add 1 bay leaf.

Cover and cook on low for 8 to 9 hours or high for 5 to 6 hours, until the beef shreds easily.

Remove the beef and shred with two forks. Return shredded beef to the cooking liquid.

Heat a skillet or griddle over medium heat.

Dip 1 tortilla lightly into the top layer of birria broth, then place onto the hot skillet.

Sprinkle with cheese and add shredded beef to one side.

Cook 2 to 3 minutes until crispy and lightly charred, then fold in half.

Continue cooking another 1 to 2 minutes until the cheese melts and the tortilla crisps.

Serve topped with diced onion and cilantro alongside small bowls of warm birria broth for dipping.`,
  translations: {
    es: {
      name: "Tacos de Birria Cocidos Lentamente",
      notes:
        "La cocción lenta crea una carne extremadamente jugosa y llena de sabor. Mojar las tortillas en el caldo le da a los tacos su clásico exterior rojo y crujiente. Puedes retirar el exceso de grasa del caldo antes de servir si lo deseas.",
      tags: [
        "cena",
        "carne",
        "tacos",
        "olla lenta",
        "mexicana",
        "comfort",
        "crujiente",
        "familiar",
      ],
      suggestedSides: [
        "Elote estilo mexicano",
        "Totopos con salsa",
        "Arroz con cilantro y lima",
      ],
      ingredients: `Carne:
3 lbs de chuck roast de res, cortado en trozos grandes
1 Tbsp de aceite de oliva
1 tsp de sal
1/2 tsp de pimienta negra

Salsa de Chiles:
4 chiles guajillo secos, sin semillas
2 chiles ancho secos, sin semillas
1 chile chipotle en adobo
1 cebolla pequeña, en trozos
4 dientes de ajo
1 lata (14 oz) de tomates rostizados
2 cups de caldo de res
2 Tbsp de vinagre de manzana

Sazonadores:
1 Tbsp de chile en polvo
1 tsp de comino
1 tsp de orégano
1/2 tsp de paprika ahumada
1/2 tsp de canela
1 hoja de laurel

Tacos:
12 tortillas de maíz
2 cups de queso Oaxaca o mozzarella rallado
1/2 cup de cebolla blanca, picada
1/4 cup de cilantro, picado

Opcional:
gajos de limón para servir`,
      instructions: `Calienta una sartén seca a fuego medio.

Tuesta 4 chiles guajillo y 2 chiles ancho durante 30 a 60 segundos por lado hasta que estén fragantes, cuidando no quemarlos.

Coloca los chiles tostados en un tazón y cúbrelos con agua caliente. Déjalos reposar 10 minutos hasta que estén suaves.

Calienta 1 Tbsp de aceite de oliva en una sartén grande u horno holandés a fuego medio-alto.

Sazona 3 lbs de carne con 1 tsp de sal y 1/2 tsp de pimienta negra.

Sella la carne en tandas de 2 a 3 minutos por lado hasta formar una costra dorada intensa.

Transfiere la carne a una olla lenta.

Escurre los chiles suaves y colócalos en una licuadora junto con 1 chile chipotle, 1 cebolla, 4 dientes de ajo, 1 lata de tomates rostizados, 2 cups de caldo de res, 2 Tbsp de vinagre de manzana, 1 Tbsp de chile en polvo, 1 tsp de comino, 1 tsp de orégano, 1/2 tsp de paprika ahumada y 1/2 tsp de canela.

Licúa hasta obtener una salsa completamente suave.

Vierte la salsa sobre la carne y agrega 1 hoja de laurel.

Cubre y cocina a temperatura baja de 8 a 9 horas o alta de 5 a 6 horas hasta que la carne se desmenuce fácilmente.

Retira la carne y desmenúzala con dos tenedores. Regresa la carne al caldo.

Calienta una sartén o plancha a fuego medio.

Moja ligeramente 1 tortilla en la capa superior del caldo de birria y colócala sobre la sartén caliente.

Agrega queso y carne desmenuzada a un lado de la tortilla.

Cocina de 2 a 3 minutos hasta que esté crujiente y ligeramente dorada, luego dóblala por la mitad.

Continúa cocinando 1 a 2 minutos más hasta que el queso se derrita y la tortilla quede crujiente.

Sirve con cebolla picada y cilantro, acompañado de pequeños tazones de caldo caliente para mojar.`,
    },
  },
},

{
  id: "hot-honey-applewood-smoked-ribs",
  slug: "hot-honey-applewood-smoked-ribs",
  name: "Hot Honey Applewood Smoked Ribs",
  effort: "big",
  photoUrl: "/images/hot-honey-applewood-smoked-ribs.jpg",
  tags: [
    "dinner",
    "pork",
    "bbq",
    "smoker",
    "ribs",
    "comfort",
    "cookout",
    "spicy",
  ],
  isVegetarian: false,
  // Hot Honey Applewood Smoked Ribs
suggestedSides: [
  "Baked beans",
  "Coleslaw",
  "Smoked mac and cheese",
],
  notes:
    "Low-and-slow smoking creates tender ribs while the hot honey glaze adds a sweet heat finish with beautiful caramelization. Avoid over-smoking early on so the glaze flavor still shines through.",
  ingredients: `Ribs:
2 racks baby back ribs
2 tbsp yellow mustard

Dry Rub:
2 tbsp brown sugar
1 tbsp smoked paprika
1 tsp garlic powder
1 tsp onion powder
1 tsp salt
1/2 tsp black pepper
1/2 tsp cayenne pepper

Hot Honey Glaze:
1/2 cup honey
2 tbsp hot sauce
1 tbsp butter
1 tsp apple cider vinegar

Optional:
applewood pellets or wood chips
extra hot sauce for serving`,
  instructions: `Remove the membrane from the back of 2 racks of ribs and pat completely dry with paper towels.

Rub both racks lightly with 2 tbsp yellow mustard to help the seasoning stick.

In a small bowl, combine 2 tbsp brown sugar, 1 tbsp smoked paprika, 1 tsp garlic powder, 1 tsp onion powder, 1 tsp salt, 1/2 tsp black pepper, and 1/2 tsp cayenne pepper.

Season the ribs generously on all sides, pressing the rub into the meat.

Preheat smoker to 250°F using applewood pellets or wood chips.

Place ribs bone-side down in the smoker and cook for 2 hours undisturbed.

After 2 hours, lightly spritz the ribs with water or apple juice if desired to keep the surface moist.

Continue smoking another 1 1/2 to 2 hours, until the ribs develop a deep mahogany color and the meat begins pulling back from the bones.

In a small saucepan over low heat, combine 1/2 cup honey, 2 tbsp hot sauce, 1 tbsp butter, and 1 tsp apple cider vinegar. Stir until smooth and glossy.

Brush the hot honey glaze generously over the ribs during the final 20 to 30 minutes of cooking.

Cook until the glaze becomes sticky and caramelized.

Remove ribs from the smoker and let rest for 10 minutes before slicing between the bones.

Serve warm with extra hot sauce if desired.`,
  translations: {
    es: {
      name: "Costillas Ahumadas con Miel Picante y Madera de Manzano",
      notes:
        "El ahumado lento crea costillas tiernas mientras el glaseado de miel picante aporta un equilibrio perfecto entre dulce y picante con una caramelización increíble. Evita ahumar demasiado al inicio para que el sabor del glaseado siga destacando.",
      tags: [
        "cena",
        "cerdo",
        "bbq",
        "ahumador",
        "costillas",
        "comfort",
        "parrillada",
        "picante",
      ],
      suggestedSides: [
        "Frijoles horneados",
        "Ensalada de col",
        "Macarrones con queso ahumados",
      ],
      ingredients: `Costillas:
2 racks de costillas baby back
2 Tbsp de mostaza amarilla

Rub Seco:
2 Tbsp de azúcar morena
1 Tbsp de paprika ahumada
1 tsp de ajo en polvo
1 tsp de cebolla en polvo
1 tsp de sal
1/2 tsp de pimienta negra
1/2 tsp de pimienta cayena

Glaseado de Miel Picante:
1/2 cup de miel
2 Tbsp de salsa picante
1 Tbsp de mantequilla
1 tsp de vinagre de manzana

Opcional:
pellets o astillas de madera de manzano
más salsa picante para servir`,
      instructions: `Retira la membrana de la parte trasera de 2 racks de costillas y sécalas completamente con toallas de papel.

Unta ligeramente ambas costillas con 2 Tbsp de mostaza amarilla para ayudar a que el sazonador se adhiera.

En un tazón pequeño, mezcla 2 Tbsp de azúcar morena, 1 Tbsp de paprika ahumada, 1 tsp de ajo en polvo, 1 tsp de cebolla en polvo, 1 tsp de sal, 1/2 tsp de pimienta negra y 1/2 tsp de pimienta cayena.

Sazona generosamente las costillas por todos lados, presionando el rub sobre la carne.

Precalienta el ahumador a 250°F usando pellets o astillas de madera de manzano.

Coloca las costillas con el hueso hacia abajo y cocina durante 2 horas sin moverlas.

Después de 2 horas, rocía ligeramente las costillas con agua o jugo de manzana si deseas mantener la superficie húmeda.

Continúa ahumando de 1 1/2 a 2 horas más hasta que las costillas desarrollen un color caoba profundo y la carne comience a separarse de los huesos.

En una cacerola pequeña a fuego bajo, mezcla 1/2 cup de miel, 2 Tbsp de salsa picante, 1 Tbsp de mantequilla y 1 tsp de vinagre de manzana. Revuelve hasta que quede suave y brillante.

Barniza generosamente las costillas con el glaseado durante los últimos 20 a 30 minutos de cocción.

Cocina hasta que el glaseado esté pegajoso y caramelizado.

Retira las costillas del ahumador y deja reposar 10 minutos antes de cortar entre los huesos.

Sirve calientes con más salsa picante si lo deseas.`,
    },
  },
},

{
  id: "spatchcock-butter-bath-chicken",
  slug: "spatchcock-butter-bath-chicken",
  name: "Spatchcocked Butter-Bath Chicken",
  effort: "big",
  photoUrl: "/images/spatchcock-butter-bath-chicken.jpg",
  tags: [
    "dinner",
    "chicken",
    "roasted",
    "comfort",
    "cast-iron",
    "crispy",
    "family",
  ],
  isVegetarian: false,
  // Spatchcocked Butter-Bath Chicken
suggestedSides: [
  "Roasted potatoes",
  "Green beans",
  "Simple green salad",
],
  notes:
    "Spatchcocking helps the chicken cook more evenly and quickly while the butter bath keeps the meat juicy and flavorful. Drying the skin thoroughly before roasting is the key to maximum crispiness.",
  ingredients: `Chicken:
1 whole chicken (4 to 5 lbs)
2 tbsp olive oil

Seasoning:
1 tsp salt
1/2 tsp black pepper
1 tsp garlic powder
1 tsp onion powder
1 tsp smoked paprika
1/2 tsp dried thyme

Butter Bath:
1/2 cup butter
4 cloves garlic, smashed
2 sprigs fresh rosemary
2 sprigs fresh thyme
1 lemon, halved`,
  instructions: `Preheat oven to 425°F.

Using kitchen shears, remove the backbone from 1 whole chicken. Flip the chicken over and press firmly on the breastbone until flattened.

Pat the chicken completely dry with paper towels.

Rub the chicken with 2 tbsp olive oil.

In a small bowl, combine 1 tsp salt, 1/2 tsp black pepper, 1 tsp garlic powder, 1 tsp onion powder, 1 tsp smoked paprika, and 1/2 tsp thyme.

Season the chicken generously on all sides and under the skin where possible.

In a large cast iron skillet or roasting pan, melt 1/2 cup butter over medium heat.

Add 4 smashed garlic cloves, rosemary, thyme, and the halved lemon. Cook for 1 to 2 minutes until fragrant.

Place the chicken skin-side up into the butter bath.

Roast for 45 to 55 minutes, basting every 15 minutes with the melted butter, until the skin becomes deeply golden and crisp and the thickest part of the thigh reaches 165°F.

If needed, broil for 1 to 2 minutes at the end for extra crispy skin.

Remove from oven and let rest for 10 minutes before carving.

Spoon some of the buttery pan juices over the chicken before serving.`,
  translations: {
    es: {
      name: "Pollo Spatchcock en Baño de Mantequilla",
      notes:
        "Abrir el pollo estilo spatchcock ayuda a que se cocine de manera más uniforme y rápida, mientras el baño de mantequilla mantiene la carne jugosa y llena de sabor. Secar bien la piel antes de hornear es la clave para lograr máxima textura crujiente.",
      tags: [
        "cena",
        "pollo",
        "horneado",
        "comfort",
        "hierro fundido",
        "crujiente",
        "familiar",
      ],
      suggestedSides: [
        "Papas asadas",
        "Ejotes",
        "Ensalada verde sencilla",
      ],
      ingredients: `Pollo:
1 pollo entero (4 a 5 lbs)
2 Tbsp de aceite de oliva

Sazonadores:
1 tsp de sal
1/2 tsp de pimienta negra
1 tsp de ajo en polvo
1 tsp de cebolla en polvo
1 tsp de paprika ahumada
1/2 tsp de tomillo seco

Baño de Mantequilla:
1/2 cup de mantequilla
4 dientes de ajo, aplastados
2 ramas de romero fresco
2 ramas de tomillo fresco
1 limón, cortado a la mitad`,
      instructions: `Precalienta el horno a 425°F.

Usando tijeras de cocina, retira la columna vertebral de 1 pollo entero. Voltea el pollo y presiona firmemente sobre el hueso del pecho hasta aplanarlo.

Seca completamente el pollo con toallas de papel.

Unta el pollo con 2 Tbsp de aceite de oliva.

En un tazón pequeño, mezcla 1 tsp de sal, 1/2 tsp de pimienta negra, 1 tsp de ajo en polvo, 1 tsp de cebolla en polvo, 1 tsp de paprika ahumada y 1/2 tsp de tomillo.

Sazona el pollo generosamente por todos lados y debajo de la piel cuando sea posible.

En una sartén grande de hierro fundido o bandeja para hornear, derrite 1/2 cup de mantequilla a fuego medio.

Agrega 4 dientes de ajo aplastados, romero, tomillo y el limón partido. Cocina de 1 a 2 minutos hasta que desprenda aroma.

Coloca el pollo con la piel hacia arriba dentro del baño de mantequilla.

Hornea de 45 a 55 minutos, bañando el pollo con mantequilla cada 15 minutos, hasta que la piel esté profundamente dorada y crujiente y la parte más gruesa del muslo alcance 165°F.

Si es necesario, usa el broiler durante 1 a 2 minutos al final para una piel aún más crujiente.

Retira del horno y deja reposar 10 minutos antes de cortar.

Sirve el pollo con un poco de los jugos de mantequilla por encima.`,
    },
  },
},

{
  id: "korean-inspired-mini-beef-patties",
  slug: "korean-inspired-mini-beef-patties",
  name: "Korean-Inspired Mini Beef Patties (Wanja Jeon)",
  effort: "normal",
  photoUrl: "/images/korean-inspired-mini-beef-patties.jpg",
  tags: [
    "dinner",
    "beef",
    "korean",
    "pan-fried",
    "family",
    "comfort",
    "asian",
    "meal-prep",
  ],
  isVegetarian: false,
  // Korean-Inspired Mini Beef Patties
suggestedSides: [
  "Steamed rice",
  "Cucumber salad",
  "Kimchi",
],
  notes:
    "These savory Korean-style beef patties are tender inside with a lightly crisp exterior. Grated onion helps keep the patties juicy while the egg coating creates their signature golden finish.",
  ingredients: `Beef Patties:
1 lb ground beef
1/4 cup yellow onion, finely grated
2 cloves garlic, minced
1 green onion, finely sliced
1 tbsp soy sauce
1 tsp sesame oil
1/2 tsp salt
1/4 tsp black pepper
1/4 tsp ginger, grated
1/3 cup panko breadcrumbs
1 large egg

Coating:
1/4 cup flour
1 large egg, beaten

For Cooking:
2 tbsp neutral oil (vegetable or avocado oil)

Optional Garnish:
sesame seeds
green onions, sliced

Dipping Sauce:
2 tbsp soy sauce
1 tbsp rice vinegar
1 tsp sesame oil
1 tsp honey or brown sugar`,
  instructions: `In a large bowl, combine 1 lb ground beef, 1/4 cup grated onion, 2 cloves garlic, 1 sliced green onion, 1 tbsp soy sauce, 1 tsp sesame oil, 1/2 tsp salt, 1/4 tsp black pepper, 1/4 tsp ginger, 1/3 cup panko breadcrumbs, and 1 egg.

Mix gently until just combined, being careful not to overwork the meat.

Form the mixture into small patties about 2 inches wide and 1/2 inch thick.

Lightly coat each patty in 1/4 cup flour, then dip into 1 beaten egg.

Heat 2 tbsp oil in a large skillet over medium heat.

Cook patties in batches for 3 to 4 minutes per side, until deeply golden-brown and cooked through to an internal temperature of 160°F.

Transfer to a wire rack or paper towel-lined plate.

In a small bowl, whisk together 2 tbsp soy sauce, 1 tbsp rice vinegar, 1 tsp sesame oil, and 1 tsp honey.

Serve patties warm with dipping sauce and garnish with sesame seeds and green onions if desired.`,
  translations: {
    es: {
      name: "Mini Tortitas de Res al Estilo Coreano (Wanja Jeon)",
      notes:
        "Estas sabrosas tortitas coreanas de res quedan tiernas por dentro y ligeramente crujientes por fuera. La cebolla rallada ayuda a mantener la carne jugosa mientras el recubrimiento de huevo crea su clásico acabado dorado.",
      tags: [
        "cena",
        "carne",
        "coreana",
        "frito en sartén",
        "familiar",
        "comfort",
        "asiática",
        "meal-prep",
      ],
      suggestedSides: [
        "Arroz al vapor",
        "Ensalada de pepino",
        "Kimchi",
      ],
      ingredients: `Tortitas de Res:
1 lb de carne molida de res
1/4 cup de cebolla amarilla, finamente rallada
2 dientes de ajo, picados
1 cebollín, en rodajas finas
1 Tbsp de salsa de soya
1 tsp de aceite de ajonjolí
1/2 tsp de sal
1/4 tsp de pimienta negra
1/4 tsp de jengibre rallado
1/3 cup de pan molido panko
1 huevo grande

Cobertura:
1/4 cup de harina
1 huevo grande, batido

Para Cocinar:
2 Tbsp de aceite neutro (vegetal o de aguacate)

Decoración Opcional:
semillas de ajonjolí
cebollines en rodajas

Salsa para Mojar:
2 Tbsp de salsa de soya
1 Tbsp de vinagre de arroz
1 tsp de aceite de ajonjolí
1 tsp de miel o azúcar morena`,
      instructions: `En un tazón grande, mezcla 1 lb de carne molida, 1/4 cup de cebolla rallada, 2 dientes de ajo, 1 cebollín, 1 Tbsp de salsa de soya, 1 tsp de aceite de ajonjolí, 1/2 tsp de sal, 1/4 tsp de pimienta negra, 1/4 tsp de jengibre, 1/3 cup de pan molido panko y 1 huevo.

Mezcla suavemente hasta integrar, evitando trabajar demasiado la carne.

Forma pequeñas tortitas de aproximadamente 2 inches de ancho y 1/2 inch de grosor.

Cubre ligeramente cada tortita con 1/4 cup de harina y luego pásala por 1 huevo batido.

Calienta 2 Tbsp de aceite en una sartén grande a fuego medio.

Cocina las tortitas en tandas durante 3 a 4 minutos por lado hasta que estén doradas y cocidas completamente a una temperatura interna de 160°F.

Transfiérelas a una rejilla o plato con papel absorbente.

En un tazón pequeño, mezcla 2 Tbsp de salsa de soya, 1 Tbsp de vinagre de arroz, 1 tsp de aceite de ajonjolí y 1 tsp de miel.

Sirve las tortitas calientes con la salsa y decora con semillas de ajonjolí y cebollines si deseas.`,
    },
  },
},

{
  id: "duck-carnitas-tacos",
  slug: "duck-carnitas-tacos",
  name: "Duck Carnitas Tacos",
  effort: "big",
  photoUrl: "/images/duck-carnitas-tacos.jpg",
  tags: [
    "dinner",
    "duck",
    "tacos",
    "mexican",
    "crispy",
    "comfort",
    "premium",
    "slow-cooked",
  ],
  isVegetarian: false,
  // Duck Carnitas Tacos
suggestedSides: [
  "Cilantro lime rice",
  "Pickled red onions",
  "Chips and guacamole",
],
  notes:
    "Slow braising renders duck legs incredibly tender while crisping the shredded meat afterward creates classic carnitas texture. Rendering the duck skin first builds deep flavor into the entire dish.",
  ingredients: `Duck:
4 duck legs
1 tbsp salt
1/2 tsp black pepper
1 tsp cumin
1 tsp smoked paprika
1 tsp oregano

Braising Liquid:
1 orange, juiced
1 lime, juiced
1/2 onion, sliced
4 cloves garlic, smashed
1 cup chicken broth
2 bay leaves

Tacos:
12 small corn tortillas
1/2 cup white onion, diced
1/4 cup cilantro, chopped

Optional Toppings:
pickled red onions
avocado slices
lime wedges
hot sauce`,
  instructions: `Preheat oven to 325°F.

Pat 4 duck legs dry with paper towels.

Season all sides with 1 tbsp salt, 1/2 tsp black pepper, 1 tsp cumin, 1 tsp smoked paprika, and 1 tsp oregano.

Heat a large Dutch oven or heavy oven-safe pot over medium heat.

Place duck legs skin-side down and cook for 6 to 8 minutes until a deep golden-brown crust forms and fat renders out.

Flip and cook another 2 minutes. Remove excess rendered fat if needed, leaving about 2 tbsp in the pot.

Add 1 sliced onion and 4 smashed garlic cloves. Cook 2 to 3 minutes until lightly softened.

Pour in the juice of 1 orange, the juice of 1 lime, and 1 cup chicken broth. Add 2 bay leaves.

Return duck legs to the pot skin-side up.

Cover and transfer to the oven.

Cook for 2 1/2 to 3 hours, until the duck is extremely tender and easily pulls apart.

Remove duck from the braising liquid and shred the meat, discarding bones and excess fat.

Heat a skillet over medium-high heat.

Add shredded duck in a single layer and cook 3 to 5 minutes until the edges become crispy and caramelized.

Warm 12 tortillas.

Fill tortillas with crispy duck carnitas and top with diced onion, cilantro, and desired toppings.

Serve immediately with lime wedges.`,
  translations: {
    es: {
      name: "Tacos de Carnitas de Pato",
      notes:
        "El braseado lento deja las piernas de pato increíblemente tiernas mientras dorar la carne desmenuzada al final crea la clásica textura crujiente de las carnitas. Dorar primero la piel del pato aporta muchísimo sabor a todo el platillo.",
      tags: [
        "cena",
        "pato",
        "tacos",
        "mexicana",
        "crujiente",
        "comfort",
        "premium",
        "cocción lenta",
      ],
      suggestedSides: [
        "Arroz con cilantro y lima",
        "Cebollas rojas encurtidas",
        "Totopos con guacamole",
      ],
      ingredients: `Pato:
4 piernas de pato
1 Tbsp de sal
1/2 tsp de pimienta negra
1 tsp de comino
1 tsp de paprika ahumada
1 tsp de orégano

Líquido para Brasear:
1 naranja, exprimida
1 limón, exprimido
1/2 cebolla, en rodajas
4 dientes de ajo, aplastados
1 cup de caldo de pollo
2 hojas de laurel

Tacos:
12 tortillas pequeñas de maíz
1/2 cup de cebolla blanca, picada
1/4 cup de cilantro, picado

Toppings Opcionales:
cebollas moradas encurtidas
rebanadas de aguacate
gajos de limón
salsa picante`,
      instructions: `Precalienta el horno a 325°F.

Seca 4 piernas de pato con toallas de papel.

Sazona todos los lados con 1 Tbsp de sal, 1/2 tsp de pimienta negra, 1 tsp de comino, 1 tsp de paprika ahumada y 1 tsp de orégano.

Calienta un horno holandés grande o una olla resistente para horno a fuego medio.

Coloca las piernas de pato con la piel hacia abajo y cocina de 6 a 8 minutos hasta que se forme una costra dorada intensa y la grasa comience a derretirse.

Voltea y cocina 2 minutos más. Retira el exceso de grasa dejando aproximadamente 2 Tbsp en la olla.

Agrega 1/2 cebolla en rodajas y 4 dientes de ajo aplastados. Cocina de 2 a 3 minutos hasta que se suavicen ligeramente.

Vierte el jugo de 1 naranja, el jugo de 1 limón y 1 cup de caldo de pollo. Agrega 2 hojas de laurel.

Regresa las piernas de pato a la olla con la piel hacia arriba.

Cubre y transfiere al horno.

Cocina de 2 1/2 a 3 horas hasta que el pato esté extremadamente tierno y se desmenuce fácilmente.

Retira el pato del líquido de cocción y desmenuza la carne, descartando huesos y exceso de grasa.

Calienta una sartén a fuego medio-alto.

Agrega el pato desmenuzado en una sola capa y cocina de 3 a 5 minutos hasta que los bordes estén crujientes y caramelizados.

Calienta 12 tortillas.

Rellena las tortillas con el pato crujiente y agrega cebolla, cilantro y los toppings deseados.

Sirve inmediatamente con gajos de limón.`,
    },
  },
},

{
  id: "wagyu-blend-meatloaf",
  slug: "wagyu-blend-meatloaf",
  name: "Wagyu-Blend Meatloaf",
  effort: "big",
  photoUrl: "/images/wagyu-blend-meatloaf.jpg",
  tags: [
    "dinner",
    "beef",
    "meatloaf",
    "comfort",
    "family",
    "oven",
    "premium",
  ],
  isVegetarian: false,
  // Wagyu-Blend Meatloaf
suggestedSides: [
  "Mashed potatoes",
  "Roasted carrots",
  "Dinner rolls",
],
  notes:
    "Using a wagyu blend adds extra richness and tenderness to classic meatloaf. Mixing gently and allowing the loaf to rest before slicing helps keep it juicy and tender.",
  ingredients: `Meatloaf:
1 lb wagyu ground beef
1 lb ground chuck
1 cup breadcrumbs
1/2 cup whole milk
2 large eggs
1/2 cup yellow onion, finely diced
4 cloves garlic, minced
1/2 cup parmesan cheese, grated
2 tbsp Worcestershire sauce
2 tbsp ketchup
1 tbsp fresh parsley, chopped
1 tsp salt
1/2 tsp black pepper
1/2 tsp smoked paprika

Glaze:
1/2 cup ketchup
2 tbsp brown sugar
1 tbsp Dijon mustard
1 tsp Worcestershire sauce`,
  instructions: `Preheat oven to 350°F.

In a large bowl, combine 1 cup breadcrumbs and 1/2 cup whole milk. Let soak for 5 minutes until softened.

Add 1 lb wagyu ground beef, 1 lb ground chuck, 2 eggs, 1/2 cup diced onion, 4 cloves garlic, 1/2 cup parmesan, 2 tbsp Worcestershire sauce, 2 tbsp ketchup, 1 tbsp parsley, 1 tsp salt, 1/2 tsp black pepper, and 1/2 tsp smoked paprika.

Mix gently with your hands until just combined. Do not overmix or the meatloaf can become dense.

Form the mixture into a loaf shape on a parchment-lined baking sheet or place into a lightly greased loaf pan.

Bake for 40 minutes.

In a small bowl, whisk together 1/2 cup ketchup, 2 tbsp brown sugar, 1 tbsp Dijon mustard, and 1 tsp Worcestershire sauce.

Brush the glaze generously over the meatloaf.

Return to the oven and bake another 20 to 25 minutes, until the internal temperature reaches 160°F and the glaze becomes glossy and caramelized.

Let rest for 10 minutes before slicing.

Serve warm with extra glaze spooned over the top if desired.`,
  translations: {
    es: {
      name: "Pastel de Carne con Mezcla Wagyu",
      notes:
        "Usar una mezcla con wagyu aporta más jugosidad y una textura increíblemente tierna al clásico pastel de carne. Mezclar suavemente y dejar reposar antes de cortar ayuda a conservar todos los jugos.",
      tags: [
        "cena",
        "carne",
        "pastel de carne",
        "comfort",
        "familiar",
        "horno",
        "premium",
      ],
      suggestedSides: [
        "Puré de papas",
        "Zanahorias rostizadas",
        "Panecillos",
      ],
      ingredients: `Pastel de Carne:
1 lb de carne molida wagyu
1 lb de carne molida chuck
1 cup de pan molido
1/2 cup de leche entera
2 huevos grandes
1/2 cup de cebolla amarilla, finamente picada
4 dientes de ajo, picados
1/2 cup de queso parmesano rallado
2 Tbsp de salsa Worcestershire
2 Tbsp de ketchup
1 Tbsp de perejil fresco, picado
1 tsp de sal
1/2 tsp de pimienta negra
1/2 tsp de paprika ahumada

Glaseado:
1/2 cup de ketchup
2 Tbsp de azúcar morena
1 Tbsp de mostaza Dijon
1 tsp de salsa Worcestershire`,
      instructions: `Precalienta el horno a 350°F.

En un tazón grande, mezcla 1 cup de pan molido y 1/2 cup de leche entera. Deja reposar durante 5 minutos hasta que se suavice.

Agrega 1 lb de carne wagyu, 1 lb de carne chuck, 2 huevos, 1/2 cup de cebolla, 4 dientes de ajo, 1/2 cup de parmesano, 2 Tbsp de salsa Worcestershire, 2 Tbsp de ketchup, 1 Tbsp de perejil, 1 tsp de sal, 1/2 tsp de pimienta negra y 1/2 tsp de paprika ahumada.

Mezcla suavemente con las manos hasta integrar. No mezcles demasiado o el pastel de carne puede quedar denso.

Forma una pieza tipo loaf sobre una bandeja con papel para hornear o colócala en un molde ligeramente engrasado.

Hornea durante 40 minutos.

En un tazón pequeño, mezcla 1/2 cup de ketchup, 2 Tbsp de azúcar morena, 1 Tbsp de mostaza Dijon y 1 tsp de salsa Worcestershire.

Barniza generosamente el pastel de carne con el glaseado.

Regresa al horno y hornea de 20 a 25 minutos más hasta que la temperatura interna alcance 160°F y el glaseado esté brillante y caramelizado.

Deja reposar 10 minutos antes de cortar.

Sirve caliente con más glaseado encima si lo deseas.`,
    },
  },
},

{
  id: "big-jamaican-jerk-chicken",
  slug: "big-jamaican-jerk-chicken",
  name: "Jamaican Jerk Chicken",
  effort: "big",
  photoUrl: "/images/big-jamaican-jerk-chicken.jpg",
  tags: [
    "dinner",
    "chicken",
    "jamaican",
    "grilling",
    "spicy",
    "high-protein",
    "family",
    "cookout"
  ],
  isVegetarian: false,
  suggestedSides: [
  "Cilantro Lime Rice",
  "Black Beans",
  "Watermelon Slices",
],
  notes:
    "This bold Jamaican-style jerk chicken is packed with citrus, warm spices, fresh herbs, and fiery habanero peppers. Marinating overnight creates the deepest flavor and juiciest grilled chicken.",
  ingredients: `Chicken:
4 boneless skinless chicken breasts

Jerk Marinade:
4 habanero peppers, chopped
1 red onion, chopped
4 garlic cloves, chopped
4 scallions, trimmed
1/4 cup soy sauce
1/4 cup apple cider vinegar
2 tbsp olive oil
3/4 cup orange juice
juice from 1/2 lime
1 tbsp fresh ginger, grated
2 tbsp brown sugar
1 tsp nutmeg
1 tsp allspice
1 tsp cinnamon
1 tsp dried thyme
1 tsp salt
1 tbsp black pepper`,
  instructions: `Add 4 chopped habanero peppers, 1 chopped red onion, 4 chopped garlic cloves, 4 scallions, 1/4 cup soy sauce, 1/4 cup apple cider vinegar, 2 tbsp olive oil, 3/4 cup orange juice, juice from 1/2 lime, 1 tbsp grated ginger, 2 tbsp brown sugar, 1 tsp nutmeg, 1 tsp allspice, 1 tsp cinnamon, 1 tsp dried thyme, 1 tsp salt, and 1 tbsp black pepper to a food processor or blender.

Blend until the marinade is completely smooth.

Using a knife, poke several small holes in 4 boneless skinless chicken breasts to help the marinade penetrate the meat.

Place the chicken into a large bowl or resealable bag.

Pour the jerk marinade over the chicken and coat all sides thoroughly.

Cover and refrigerate for at least 2 hours, or overnight for the best flavor.

Remove the chicken from the marinade and discard the used marinade.

Preheat a grill to medium-high heat and lightly oil the grill grates.

Grill the chicken for 6 to 8 minutes per side, or about 15 minutes total, until the internal temperature reaches 165°F.

Remove from the grill and let rest for 5 minutes before serving.

Serve warm with rice, grilled vegetables, or a fresh salad.`,
  translations: {
    es: {
      name: "Pollo Jerk Jamaicano",
      notes:
        "Este pollo jerk estilo jamaicano está lleno de cítricos, especias aromáticas, hierbas frescas y el picante característico del habanero. Marinar durante toda la noche aporta el mejor sabor y una textura jugosa.",
      tags: [
        "cena",
        "pollo",
        "jamaicano",
        "parrilla",
        "picante",
        "alto en proteína",
        "familiar",
        "parrillada"
      ],
      suggestedSides: [
  "Arroz con Cilantro y Limón",
  "Frijoles Negros Sazonados",
  "Rebanadas de Sandía",
],
      ingredients: `Pollo:
4 pechugas de pollo sin hueso y sin piel

Marinada Jerk:
4 chiles habaneros, picados
1 cebolla morada, picada
4 dientes de ajo, picados
4 cebollines, cortados
1/4 cup de salsa de soya
1/4 cup de vinagre de manzana
2 Tbsp de aceite de oliva
3/4 cup de jugo de naranja
jugo de 1/2 limón verde
1 Tbsp de jengibre fresco rallado
2 Tbsp de azúcar morena
1 tsp de nuez moscada
1 tsp de pimienta de Jamaica (allspice)
1 tsp de canela
1 tsp de tomillo seco
1 tsp de sal
1 Tbsp de pimienta negra`,
      instructions: `Agrega 4 chiles habaneros picados, 1 cebolla morada picada, 4 dientes de ajo picados, 4 cebollines, 1/4 cup de salsa de soya, 1/4 cup de vinagre de manzana, 2 Tbsp de aceite de oliva, 3/4 cup de jugo de naranja, el jugo de 1/2 limón verde, 1 Tbsp de jengibre rallado, 2 Tbsp de azúcar morena, 1 tsp de nuez moscada, 1 tsp de pimienta de Jamaica, 1 tsp de canela, 1 tsp de tomillo seco, 1 tsp de sal y 1 Tbsp de pimienta negra en un procesador de alimentos o licuadora.

Licúa hasta obtener una marinada completamente suave.

Con un cuchillo, haz varios pequeños cortes en 4 pechugas de pollo para ayudar a que la marinada penetre mejor.

Coloca el pollo en un recipiente grande o bolsa con cierre hermético.

Vierte la marinada jerk sobre el pollo y cubre bien todos los lados.

Tapa y refrigera durante al menos 2 horas, o toda la noche para obtener el mejor sabor.

Retira el pollo de la marinada y desecha la marinada usada.

Precalienta una parrilla a fuego medio-alto y engrasa ligeramente las rejillas.

Asa el pollo durante 6 a 8 minutos por lado, aproximadamente 15 minutos en total, hasta que alcance una temperatura interna de 165°F.

Retira de la parrilla y deja reposar durante 5 minutos antes de servir.

Sirve caliente con arroz, verduras a la parrilla o una ensalada fresca.`,
    },
  },
},


];

export const CAMPFIRE_RECIPES: Meal[] = [
  
  {
  id: "quick-classic-hobo-foil-packet",
  slug: "quick-classic-hobo-foil-packet",
  name: "The Classic Hobo Foil Packet",
  effort: "quick",
  photoUrl: "/images/quick-classic-hobo-foil-packet.jpg",
  tags: [
    "dinner",
    "campfire",
    "beef",
    "foil-packet",
    "one-pan",
    "family-friendly",
    "outdoors",
  ],
  isVegetarian: false,
  // The Classic Hobo Foil Packet
suggestedSides: [
  "Baked beans",
  "Corn on the cob",
  "Watermelon slices",
],
  notes:
    "A classic campfire meal with juicy beef, tender potatoes, and smoky flavor all cooked in one easy foil packet. Great for camping trips or backyard fire pits.",
  ingredients: `1 lb ground beef
2 cups baby potatoes, thinly sliced
1 cup carrots, sliced
1/2 onion, sliced
2 tbsp butter
1 tsp garlic powder
1 tsp salt
1/2 tsp black pepper
heavy-duty aluminum foil`,
  instructions: `Preheat a campfire grate or grill to medium heat.

Lay out 4 large sheets of heavy-duty foil.

Divide 1 lb ground beef into 4 portions and place each portion in the center of the foil sheets.

Top each packet with sliced potatoes, carrots, and onion.

Season each packet with garlic powder, salt, and black pepper. Add 1/2 tbsp butter to each packet.

Fold the foil tightly into sealed packets so steam stays trapped inside.

Cook over the campfire or grill for 25 to 35 minutes, flipping halfway through, until the potatoes are fork-tender and the beef is fully cooked.

Carefully open the packets because hot steam will escape. Serve directly from the foil for easy cleanup.`,
  translations: {
    es: {
      name: "Paquete Clásico Hobo en Papel Aluminio",
      notes:
        "Una clásica comida de fogata con carne jugosa, papas tiernas y sabor ahumado, todo cocinado en un práctico paquete de aluminio. Perfecto para campamentos o fogatas en casa.",
      tags: [
        "cena",
        "fogata",
        "carne",
        "papel aluminio",
        "una sartén",
        "familiar",
        "aire libre",
      ],
      suggestedSides: [
        "Frijoles horneados",
        "Elote",
        "Rebanadas de sandía",
      ],
      ingredients: `1 lb de carne molida
2 cups de papas pequeñas, en rodajas finas
1 cup de zanahorias, en rodajas
1/2 cebolla, en rodajas
2 Tbsp de mantequilla
1 tsp de ajo en polvo
1 tsp de sal
1/2 tsp de pimienta negra
papel aluminio resistente`,
      instructions: `Precalienta una parrilla de fogata o asador a fuego medio.

Coloca 4 hojas grandes de papel aluminio resistente.

Divide 1 lb de carne molida en 4 porciones y coloca cada porción en el centro de cada hoja.

Agrega papas, zanahorias y cebolla sobre cada paquete.

Sazona cada paquete con ajo en polvo, sal y pimienta negra. Añade 1/2 Tbsp de mantequilla a cada uno.

Cierra bien los paquetes de aluminio para mantener el vapor atrapado dentro.

Cocina sobre la fogata o parrilla durante 25 a 35 minutos, volteando a la mitad del tiempo, hasta que las papas estén tiernas y la carne completamente cocida.

Abre cuidadosamente los paquetes porque saldrá vapor caliente. Sirve directamente en el aluminio para facilitar la limpieza.`,
    },
  },
},

{
  id: "big-dutch-oven-taco-mountain",
  slug: "big-dutch-oven-taco-mountain",
  name: "Dutch Oven Taco Mountain",
  effort: "big",
  photoUrl: "/images/big-dutch-oven-taco-mountain.jpg",
  tags: [
    "dinner",
    "campfire",
    "tacos",
    "beef",
    "dutch-oven",
    "family-friendly",
    "comfort",
  ],
  isVegetarian: false,
  // Dutch Oven Taco Mountain
suggestedSides: [
  "Chips and salsa",
  "Guacamole",
  "Mexican street corn",
],
  notes:
    "Layers of seasoned beef, cheese, tortillas, and toppings cooked together in a Dutch oven for the ultimate campfire taco casserole.",
  ingredients: `1 lb ground beef
1 small onion, diced
1 packet taco seasoning
2/3 cup water
1 (10 oz) can Rotel
6 small flour tortillas
2 cups cheddar cheese, shredded
1 cup tortilla chips, lightly crushed
1/2 cup sour cream
1/4 cup green onions, sliced
1 tbsp olive oil`,
  instructions: `Preheat a Dutch oven over a campfire grate or hot coals using medium heat.

Add 1 tbsp olive oil and 1 diced onion. Cook 3 to 4 minutes until softened.

Add 1 lb ground beef and cook until browned with no pink remaining. Drain excess grease if needed.

Stir in 1 packet taco seasoning, 2/3 cup water, and 1 can Rotel. Simmer 3 to 5 minutes until slightly thickened.

Layer 2 tortillas into the bottom of the Dutch oven, tearing them if needed to fit.

Add a layer of taco meat, cheddar cheese, and crushed tortilla chips.

Repeat the layers until all ingredients are used, finishing with cheese on top.

Cover the Dutch oven and cook for 15 to 20 minutes, until the cheese is melted and bubbly.

Remove from heat and let rest for 5 minutes before serving.

Top with sour cream and sliced green onions before serving.`,
  translations: {
    es: {
      name: "Montaña de Tacos en Horno Holandés",
      notes:
        "Capas de carne sazonada, queso, tortillas y toppings cocinadas juntas en un horno holandés para una comida perfecta de fogata.",
      tags: [
        "cena",
        "fogata",
        "tacos",
        "carne",
        "horno holandés",
        "familiar",
        "comfort",
      ],
      suggestedSides: [
        "Totopos con salsa",
        "Guacamole",
        "Elote estilo mexicano",
      ],
      ingredients: `1 lb de carne molida
1 cebolla pequeña, picada
1 paquete de sazonador para tacos
2/3 cup de agua
1 lata (10 oz) de Rotel
6 tortillas pequeñas de harina
2 cups de queso cheddar rallado
1 cup de totopos triturados ligeramente
1/2 cup de crema agria
1/4 cup de cebollines en rodajas
1 Tbsp de aceite de oliva`,
      instructions: `Precalienta un horno holandés sobre una parrilla de fogata o brasas a fuego medio.

Agrega 1 Tbsp de aceite de oliva y 1 cebolla picada. Cocina de 3 a 4 minutos hasta que esté suave.

Agrega 1 lb de carne molida y cocina hasta que ya no esté rosada. Escurre el exceso de grasa si es necesario.

Incorpora 1 paquete de sazonador para tacos, 2/3 cup de agua y 1 lata de Rotel. Cocina de 3 a 5 minutos hasta que espese ligeramente.

Coloca 2 tortillas en el fondo del horno holandés, rompiéndolas si es necesario.

Agrega una capa de carne, queso cheddar y totopos triturados.

Repite las capas hasta usar todos los ingredientes, terminando con queso encima.

Cubre el horno holandés y cocina de 15 a 20 minutos hasta que el queso esté derretido y burbujeante.

Retira del fuego y deja reposar 5 minutos antes de servir.

Agrega crema agria y cebollines antes de servir.`,
    },
  },
},

{
  id: "big-campfire-chili-mac",
  slug: "big-campfire-chili-mac",
  name: "Campfire Chili Mac",
  effort: "big",
  photoUrl: "/images/big-campfire-chili-mac.jpg",
  tags: [
    "dinner",
    "campfire",
    "pasta",
    "beef",
    "one-pot",
    "comfort",
    "family-friendly",
  ],
  isVegetarian: false,
  // Campfire Chili Mac
suggestedSides: [
  "Cornbread",
  "Simple green salad",
  "Tortilla chips",
],
  notes:
    "A hearty one-pot campfire meal packed with beef, pasta, chili flavor, and melty cheese. Perfect for cooler nights around the fire.",
  ingredients: `1 lb ground beef
1 small onion, diced
2 cloves garlic, minced
1 tbsp olive oil
1 packet chili seasoning
1 (14 oz) can diced tomatoes
1 (15 oz) can kidney beans, drained
3 cups beef broth
2 cups elbow macaroni
2 cups cheddar cheese, shredded
1/2 tsp salt
1/4 tsp black pepper`,
  instructions: `Preheat a large Dutch oven or heavy camp pot over medium heat on a campfire grate.

Add 1 tbsp olive oil, 1 diced onion, and 2 cloves garlic. Cook 3 to 4 minutes until softened and fragrant.

Add 1 lb ground beef and cook until browned with no pink remaining. Drain excess grease if needed.

Stir in 1 packet chili seasoning, 1 can diced tomatoes, 1 can kidney beans, 3 cups beef broth, 1/2 tsp salt, and 1/4 tsp black pepper.

Bring the mixture to a gentle simmer.

Stir in 2 cups elbow macaroni and cook uncovered for 10 to 12 minutes, stirring occasionally, until the pasta is tender and most of the liquid is absorbed.

Reduce heat to low and stir in 2 cups cheddar cheese until melted and creamy.

Remove from heat and let rest for 5 minutes before serving.`,
  translations: {
    es: {
      name: "Chili Mac de Fogata",
      notes:
        "Una abundante comida de una sola olla con carne, pasta, sabor a chili y mucho queso derretido. Perfecta para noches frescas alrededor de la fogata.",
      tags: [
        "cena",
        "fogata",
        "pasta",
        "carne",
        "una olla",
        "comfort",
        "familiar",
      ],
      suggestedSides: [
        "Pan de maíz",
        "Ensalada verde sencilla",
        "Totopos",
      ],
      ingredients: `1 lb de carne molida
1 cebolla pequeña, picada
2 dientes de ajo, picados
1 Tbsp de aceite de oliva
1 paquete de sazonador para chili
1 lata (14 oz) de tomates picados
1 lata (15 oz) de frijoles rojos, escurridos
3 cups de caldo de res
2 cups de coditos
2 cups de queso cheddar rallado
1/2 tsp de sal
1/4 tsp de pimienta negra`,
      instructions: `Precalienta un horno holandés grande o una olla resistente sobre una parrilla de fogata a fuego medio.

Agrega 1 Tbsp de aceite de oliva, 1 cebolla picada y 2 dientes de ajo. Cocina de 3 a 4 minutos hasta que estén suaves y fragantes.

Agrega 1 lb de carne molida y cocina hasta que ya no esté rosada. Escurre el exceso de grasa si es necesario.

Incorpora 1 paquete de sazonador para chili, 1 lata de tomates picados, 1 lata de frijoles rojos, 3 cups de caldo de res, 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Lleva la mezcla a fuego lento.

Agrega 2 cups de coditos y cocina sin tapar de 10 a 12 minutos, revolviendo ocasionalmente, hasta que la pasta esté tierna y la mayor parte del líquido se absorba.

Reduce el fuego y agrega 2 cups de queso cheddar hasta que se derrita y quede cremoso.

Retira del fuego y deja reposar 5 minutos antes de servir.`,
    },
  },
},

{
  id: "quick-hot-dog-octopus-veggie-kebabs",
  slug: "quick-hot-dog-octopus-veggie-kebabs",
  name: "Skewer Hot Dog Octopus and Veggie Kebabs",
  effort: "quick",
  photoUrl: "/images/quick-hot-dog-octopus-veggie-kebabs.jpg",
  tags: [
    "dinner",
    "campfire",
    "hot-dogs",
    "kid-friendly",
    "skewers",
    "grilling",
    "family-friendly",
  ],
  isVegetarian: false,
  // Skewer Hot Dog Octopus and Veggie Kebabs
suggestedSides: [
  "Potato chips",
  "Fruit salad",
  "Baked beans",
],
  notes:
    "A fun campfire meal where hot dogs split into octopus-style legs while roasting over the fire. Great for kids and easy camping dinners.",
  ingredients: `8 hot dogs
1 bell pepper, chopped into large pieces
1 small red onion, cut into chunks
1 zucchini, sliced into thick rounds
1 tbsp olive oil
1/2 tsp garlic powder
1/2 tsp salt
1/4 tsp black pepper
wooden or metal skewers`,
  instructions: `Preheat a campfire grate or grill to medium heat.

Using a knife, cut one end of each hot dog into 4 to 6 strips about halfway down to create "octopus legs."

In a bowl, toss bell pepper, red onion, and zucchini with 1 tbsp olive oil, 1/2 tsp garlic powder, 1/2 tsp salt, and 1/4 tsp black pepper.

Thread vegetables and hot dogs onto skewers, alternating ingredients for even cooking.

Place skewers over the campfire or grill.

Cook for 8 to 12 minutes, rotating occasionally, until the vegetables are tender and lightly charred and the hot dog legs curl outward like octopus tentacles.

Serve warm directly from the skewers.`,
  translations: {
    es: {
      name: "Brochetas de Pulpo de Hot Dog y Verduras",
      notes:
        "Una divertida comida de fogata donde los hot dogs se abren como patas de pulpo mientras se asan. Perfecta para niños y cenas fáciles de campamento.",
      tags: [
        "cena",
        "fogata",
        "hot dogs",
        "niños",
        "brochetas",
        "parrilla",
        "familiar",
      ],
      suggestedSides: [
        "Papas fritas de bolsa",
        "Ensalada de frutas",
        "Frijoles horneados",
      ],
      ingredients: `8 hot dogs
1 pimiento morrón, cortado en trozos grandes
1 cebolla roja pequeña, en trozos
1 calabacín, en rodajas gruesas
1 Tbsp de aceite de oliva
1/2 tsp de ajo en polvo
1/2 tsp de sal
1/4 tsp de pimienta negra
brochetas de madera o metal`,
      instructions: `Precalienta una parrilla de fogata o asador a fuego medio.

Con un cuchillo, corta un extremo de cada hot dog en 4 a 6 tiras hasta la mitad para crear "patas de pulpo."

En un tazón, mezcla el pimiento, la cebolla roja y el calabacín con 1 Tbsp de aceite de oliva, 1/2 tsp de ajo en polvo, 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Inserta verduras y hot dogs en las brochetas alternando ingredientes.

Coloca las brochetas sobre la fogata o parrilla.

Cocina de 8 a 12 minutos, girando ocasionalmente, hasta que las verduras estén tiernas y ligeramente asadas y las patas de los hot dogs se curven hacia afuera como tentáculos.

Sirve caliente directamente en las brochetas.`,
    },
  },
},

{
  id: "quick-pie-iron-pudgie-pies",
  slug: "quick-pie-iron-pudgie-pies",
  name: "Pie Iron Pudgie Pies",
  effort: "quick",
  photoUrl: "/images/quick-pie-iron-pudgie-pies.jpg",
  tags: [
    "dinner",
    "campfire",
    "sandwiches",
    "pie-iron",
    "kid-friendly",
    "comfort",
    "family-friendly",
  ],
  isVegetarian: false,
  // Pie Iron Pudgie Pies
suggestedSides: [
  "Chips",
  "Carrot sticks with ranch",
  "Apple slices",
],
  notes:
    "A nostalgic campfire favorite with crispy toasted bread and melty fillings cooked inside a pie iron over the fire.",
  ingredients: `8 slices sandwich bread
2 tbsp butter, softened
1 cup pizza sauce
1 cup mozzarella cheese, shredded
1/2 cup pepperoni slices
1/2 tsp Italian seasoning
pie iron cooker`,
  instructions: `Preheat a pie iron over a campfire grate or hot coals for 2 to 3 minutes.

Butter one side of each bread slice with 2 tbsp softened butter divided evenly.

Place one slice of bread butter-side down into the pie iron.

Spread about 2 tbsp pizza sauce onto the bread, then top with mozzarella cheese, pepperoni, and a sprinkle of Italian seasoning.

Place another slice of bread on top with the buttered side facing outward.

Close the pie iron firmly and trim any excess bread if needed.

Cook over the campfire for 3 to 5 minutes per side, flipping carefully halfway through, until the bread is crispy and golden brown and the cheese is melted.

Carefully remove the pudgie pie from the pie iron and let cool for 1 to 2 minutes before serving because the filling will be very hot.`,
  translations: {
    es: {
      name: "Pudgie Pies en Pie Iron",
      notes:
        "Un clásico nostálgico de fogata con pan crujiente y rellenos derretidos cocinados dentro de un pie iron sobre el fuego.",
      tags: [
        "cena",
        "fogata",
        "sándwiches",
        "pie iron",
        "niños",
        "comfort",
        "familiar",
      ],
      suggestedSides: [
        "Papas fritas de bolsa",
        "Palitos de zanahoria con aderezo ranch",
        "Rebanadas de manzana",
      ],
      ingredients: `8 rebanadas de pan de molde
2 Tbsp de mantequilla, suave
1 cup de salsa para pizza
1 cup de queso mozzarella rallado
1/2 cup de pepperoni
1/2 tsp de sazón italiana
pie iron para fogata`,
      instructions: `Precalienta un pie iron sobre una parrilla de fogata o brasas calientes durante 2 a 3 minutos.

Unta mantequilla en un lado de cada rebanada de pan usando las 2 Tbsp divididas.

Coloca una rebanada de pan con el lado con mantequilla hacia abajo dentro del pie iron.

Agrega aproximadamente 2 Tbsp de salsa para pizza, luego mozzarella, pepperoni y un poco de sazón italiana.

Coloca otra rebanada encima con la mantequilla hacia afuera.

Cierra bien el pie iron y corta el exceso de pan si es necesario.

Cocina sobre la fogata de 3 a 5 minutos por lado, volteando cuidadosamente a la mitad, hasta que el pan esté dorado y crujiente y el queso derretido.

Retira cuidadosamente el pudgie pie y deja enfriar de 1 a 2 minutos antes de servir porque el relleno estará muy caliente.`,
    },
  },
},


];

// =====================================================
// SIDE DISHES / DESSERTS / NON-DINNER EXTRAS
// =====================================================

export const SIDE_DISHES: Meal[] = [
  
  {
  id: "big-smoked-mac-and-cheese",
  slug: "big-smoked-mac-and-cheese",
  name: "Smoked Mac and Cheese",
  ingredients: `2 cups uncooked macaroni noodles
1 cup milk, divided
1 cup shredded cheddar cheese, divided
4 oz cream cheese, cubed
12 oz Velveeta cheese, cubed
1/2 tsp salt
1/2 tsp black pepper
1/4 tsp garlic powder
1/8 tsp ground cumin`,
  instructions: `Bring a pot of water to a boil and cook 2 cups macaroni noodles according to package directions. Drain and place in a large bowl.

Add 1/2 tsp salt, 1/2 tsp black pepper, 1/4 tsp garlic powder, and 1/8 tsp cumin to the noodles. Stir to combine.

Mix in 3/4 cup shredded cheddar cheese, 4 oz cubed cream cheese, and 12 oz cubed Velveeta.

Transfer everything to a baking dish and pour 1/2 cup milk over the top.

Preheat smoker or grill to 250°F.

Place the dish in the smoker and cook for 15 minutes.

Stir the mac and cheese, then continue cooking another 15 minutes. Stir again.

Pour in the remaining 1/2 cup milk and sprinkle the remaining 1/4 cup cheddar cheese over the top.

Increase temperature to 400°F and cook for 5 to 10 minutes until melted, bubbly, and lightly browned.

Remove and let rest for a few minutes before serving.`,
  photoUrl: "/images/big-smoked-mac-and-cheese.jpg",
  effort: "big",
  tags: ["side", "bbq", "smoker", "comfort", "cheesy", "family", "cookout"],
  isVegetarian: true,
  notes: "Ultra-creamy smoked mac and cheese made without a traditional sauce. The cheese melts directly into the noodles while smoking, creating rich flavor with minimal effort.",
  translations: {
    es: {
      name: "Macarrones con queso ahumados",
      notes:
        "Macarrones con queso ultra cremosos y ahumados, hechos sin una salsa tradicional. El queso se derrite directamente en la pasta mientras se ahúma, creando mucho sabor con poco esfuerzo.",
      tags: [
        "acompañamiento",
        "bbq",
        "ahumador",
        "comida reconfortante",
        "con queso",
        "familiar",
        "parrillada",
      ],
      ingredients: `2 cups de macarrones sin cocinar
1 cup de leche, dividida
1 cup de queso cheddar rallado, dividido
4 oz de queso crema, cortado en cubitos
12 oz de queso Velveeta, cortado en cubitos
1/2 tsp de sal
1/2 tsp de pimienta negra
1/4 tsp de ajo en polvo
1/8 tsp de comino molido`,
      instructions: `Hierve una olla con agua y cocina 2 cups de macarrones según las instrucciones del paquete. Escurre y coloca en un tazón grande.

Agrega 1/2 tsp de sal, 1/2 tsp de pimienta negra, 1/4 tsp de ajo en polvo y 1/8 tsp de comino a los macarrones. Mezcla para combinar.

Incorpora 3/4 cup de queso cheddar rallado, 4 oz de queso crema en cubitos y 12 oz de Velveeta en cubitos.

Pasa todo a un molde para hornear y vierte 1/2 cup de leche encima.

Precalienta el ahumador o la parrilla a 250°F.

Coloca el molde en el ahumador y cocina durante 15 minutos.

Revuelve los macarrones con queso y continúa cocinando otros 15 minutos. Revuelve otra vez.

Vierte la 1/2 cup restante de leche y espolvorea el 1/4 cup restante de queso cheddar encima.

Sube la temperatura a 400°F y cocina de 5 a 10 minutos, hasta que esté derretido, burbujeante y ligeramente dorado.

Retira y deja reposar unos minutos antes de servir.`,
    },
  },
},

{
  id: "quick-airfryer-baked-potato",
  slug: "quick-airfryer-baked-potato",
  name: "Air Fryer Baked Potato",
  effort: "quick",
  photoUrl: "/images/quick-airfryer-baked-potato.jpg",
  tags: ["side", "air-fryer", "comfort", "quick", "vegetarian"],
  isVegetarian: true,
  notes: "An easy side dish that goes with almost anything and needs very little hands-on work.",
  ingredients: `1 large russet potato
1/2 tsp salt
1 Tbsp olive oil (or cooking spray)
1 to 2 Tbsp butter (depending on potato size)
shredded cheese (optional)
sour cream (optional)`,
  instructions: `Rinse 1 large russet potato and dry completely.
Pierce the potato with a fork in 4 to 6 spots.
Coat the potato evenly with 1 Tbsp olive oil or cooking spray.
Sprinkle with 1/2 tsp salt and rotate to coat all sides.
Preheat air fryer to 400°F.
Air fry for 60 minutes, shaking the basket once or twice.
Slice down the middle, fluff with a fork, and add 1 to 2 Tbsp butter along with optional shredded cheese and sour cream.`,
  translations: {
    es: {
      name: "Papa horneada en freidora de aire",
      notes:
        "Un acompañamiento fácil que va con casi cualquier comida y requiere muy poco trabajo.",
      tags: [
        "acompañamiento",
        "freidora de aire",
        "comida reconfortante",
        "rápido",
        "vegetariano",
      ],
      ingredients: `1 papa russet grande
1/2 tsp de sal
1 Tbsp de aceite de oliva o spray para cocinar
1 a 2 Tbsp de mantequilla, según el tamaño de la papa
queso rallado, opcional
crema agria, opcional`,
      instructions: `Enjuaga 1 papa russet grande y sécala completamente.
Pica la papa con un tenedor en 4 a 6 lugares.
Cubre la papa de manera uniforme con 1 Tbsp de aceite de oliva o spray para cocinar.
Espolvorea con 1/2 tsp de sal y gírala para cubrir todos los lados.
Precalienta la freidora de aire a 400°F.
Cocina en la freidora de aire durante 60 minutos, sacudiendo la canasta una o dos veces.
Corta por el centro, esponja el interior con un tenedor y agrega 1 a 2 Tbsp de mantequilla junto con queso rallado y crema agria si deseas.`,
    },
  },
},

{
  id: "quick-garlic-roasted-potatoes",
  slug: "quick-garlic-roasted-potatoes",
  name: "Garlic Roasted Potatoes",
  effort: "quick",
  photoUrl: "/images/quick-garlic-roasted-potatoes.jpg",
  tags: ["side", "roasted", "vegetarian", "comfort", "oven"],
  isVegetarian: true,
  notes: "Crispy, simple potatoes that work with almost any main dish.",
  ingredients: `3 lbs small red or white potatoes
1/4 cup olive oil
1 1/2 tsp salt
1 tsp pepper
2 Tbsp garlic, minced
2 Tbsp fresh parsley, minced`,
  instructions: `Preheat oven to 400°F.

Cut 3 lbs small red or white potatoes in halves or quarters and place in a bowl with 1/4 cup olive oil, 1 1/2 tsp salt, 1 tsp pepper, and 2 Tbsp minced garlic. Toss until coated.

Transfer to a sheet pan and spread into a single layer.

Roast 45 minutes to 1 hour until browned and crisp, flipping twice during cooking for even browning.

Remove from oven, toss with 2 Tbsp minced fresh parsley, season to taste, and serve hot.`,
  translations: {
    es: {
      name: "Papas asadas con ajo",
      notes:
        "Papas simples y crujientes que combinan con casi cualquier plato principal.",
      tags: [
        "acompañamiento",
        "asado",
        "vegetariano",
        "comida reconfortante",
        "horno",
      ],
      ingredients: `3 lbs de papas rojas o blancas pequeñas
1/4 cup de aceite de oliva
1 1/2 tsp de sal
1 tsp de pimienta
2 Tbsp de ajo, picado
2 Tbsp de perejil fresco, picado`,
      instructions: `Precalienta el horno a 400°F.

Corta 3 lbs de papas rojas o blancas pequeñas en mitades o cuartos y colócalas en un tazón con 1/4 cup de aceite de oliva, 1 1/2 tsp de sal, 1 tsp de pimienta y 2 Tbsp de ajo picado. Mezcla hasta cubrirlas.

Pasa las papas a una bandeja para hornear y extiéndelas en una sola capa.

Asa de 45 minutos a 1 hora, hasta que estén doradas y crujientes, volteándolas dos veces durante la cocción para que se doren de manera uniforme.

Retira del horno, mezcla con 2 Tbsp de perejil fresco picado, sazona al gusto y sirve caliente.`,
    },
  },
},

{
  id: "buffalo-chicken-tots",
  slug: "buffalo-chicken-tots",
  name: "Buffalo Chicken Tots",
  ingredients: `1 (32 oz) bag frozen tater tots
1 Tbsp olive oil

2 cups cooked chicken, shredded
1/2 cup buffalo sauce (plus more for drizzle)

1 cup cheddar cheese, shredded
1/2 cup mozzarella cheese, shredded (optional)

1/2 cup blue cheese crumbles (optional)
1/2 cup ranch or blue cheese dressing

2 green onions, sliced
1 jalapeño or chili pepper, thinly sliced (optional)`,
  instructions: `Preheat oven to 400°F.

Toss 1 (32 oz) bag tater tots with 1 Tbsp olive oil and spread in a single layer on a baking sheet.

Bake according to package directions, about 20 to 25 minutes, until crispy and golden.

While the tots bake, combine 2 cups shredded chicken with 1/2 cup buffalo sauce in a bowl. Toss until evenly coated.

Remove tots from the oven and transfer to an oven-safe skillet or baking dish.

Top with buffalo chicken, then sprinkle 1 cup cheddar cheese and 1/2 cup mozzarella if using.

Add 1/2 cup blue cheese crumbles and sliced jalapeños if desired.

Return to oven and bake 5 to 10 minutes, until cheese is melted and everything is hot.

Remove from oven and drizzle with ranch or blue cheese dressing.

Garnish with sliced green onions and serve immediately.`,
  photoUrl: "/images/buffalo-chicken-tots.jpg",
  effort: "quick",
  tags: [
  "side",
  "appetizer",
  "snack",
  "chicken",
  "buffalo",
  "game-day",
  "comfort",
  "party",
  "loaded",
],
isVegetarian: false,
  notes: "Crispy tater tots loaded with buffalo chicken, melty cheese, and cool ranch. Inspired by restaurant-style totchos but simplified for easy home cooking.",
  translations: {
    es: {
      name: "Tater tots con pollo buffalo",
      notes:
        "Tater tots crujientes cargados con pollo buffalo, queso derretido y ranch fresco. Inspirados en totchos estilo restaurante, pero simplificados para cocinar fácilmente en casa.",
      tags: [
        "aperitivo",
        "snack",
        "pollo",
        "buffalo",
        "día de partido",
        "comida reconfortante",
        "fiesta",
        "cargado",
      ],
      ingredients: `1 bolsa (32 oz) de tater tots congelados
1 Tbsp de aceite de oliva

2 cups de pollo cocido, deshebrado
1/2 cup de salsa buffalo, más extra para rociar

1 cup de queso cheddar rallado
1/2 cup de queso mozzarella rallado, opcional

1/2 cup de queso azul desmoronado, opcional
1/2 cup de aderezo ranch o blue cheese

2 cebollines, rebanados
1 jalapeño o chile, rebanado finamente, opcional`,
      instructions: `Precalienta el horno a 400°F.

Mezcla 1 bolsa (32 oz) de tater tots con 1 Tbsp de aceite de oliva y extiéndelos en una sola capa sobre una bandeja para hornear.

Hornea según las instrucciones del paquete, aproximadamente de 20 a 25 minutos, hasta que estén crujientes y dorados.

Mientras se hornean los tots, combina 2 cups de pollo deshebrado con 1/2 cup de salsa buffalo en un tazón. Mezcla hasta cubrirlo de manera uniforme.

Retira los tots del horno y pásalos a un sartén apto para horno o a un molde para hornear.

Cubre con el pollo buffalo, luego espolvorea 1 cup de queso cheddar y 1/2 cup de mozzarella si la usas.

Agrega 1/2 cup de queso azul desmoronado y jalapeños rebanados si deseas.

Regresa al horno y hornea de 5 a 10 minutos, hasta que el queso se derrita y todo esté caliente.

Retira del horno y rocía con aderezo ranch o blue cheese.

Decora con cebollines rebanados y sirve de inmediato.`,
    },
  },
},

{
  id: "classic-potato-salad",
  slug: "classic-potato-salad",
  name: "Classic Potato Salad",
  ingredients: `2 lbs Yukon Gold or red potatoes, cut into 1-inch chunks
1 tsp salt (for boiling water)
3 large eggs

1/2 cup celery, finely diced
1/3 cup red onion, finely diced
1/4 cup dill pickles or relish, chopped
2 Tbsp fresh parsley, chopped

3/4 cup mayonnaise
1 Tbsp Dijon mustard
1 Tbsp apple cider vinegar
1 tsp sugar
1/2 tsp salt (plus more to taste)
1/4 tsp black pepper
1/2 tsp paprika`,
  instructions: `Place 2 lbs chopped potatoes in a large pot and cover with cold water. Add 1 tsp salt and bring to a boil over high heat.

Reduce to a gentle boil and cook for 10 to 12 minutes, until potatoes are fork-tender but still hold their shape. Drain and let cool slightly.

While potatoes cook, place 3 eggs in a saucepan and cover with water. Bring to a boil, then turn off heat, cover, and let sit for 10 to 12 minutes. Transfer to ice water, peel, and chop.

In a large bowl, whisk together 3/4 cup mayonnaise, 1 Tbsp Dijon mustard, 1 Tbsp apple cider vinegar, 1 tsp sugar, 1/2 tsp salt, 1/4 tsp black pepper, and 1/2 tsp paprika until smooth.

Add the slightly warm potatoes to the dressing and gently toss to coat.

Add chopped eggs, 1/2 cup celery, 1/3 cup red onion, 1/4 cup pickles, and 2 Tbsp parsley. Fold everything together until evenly combined.

Cover and refrigerate for at least 1 to 2 hours to allow flavors to develop.

Before serving, taste and adjust salt and pepper if needed. Sprinkle with additional paprika if desired.`,
  photoUrl: "/images/classic-potato-salad.jpg",
  effort: "normal",
  tags: ["side", "potatoes", "salad", "bbq", "summer", "comfort", "family", "cookout"],
  isVegetarian: true,
  notes: "A creamy, classic potato salad with balanced tang and texture. Dressing the potatoes while slightly warm helps them absorb more flavor.",
  translations: {
    es: {
      name: "Ensalada clásica de papa",
      notes:
        "Una ensalada clásica de papa, cremosa, con buen equilibrio de acidez y textura. Mezclar las papas con el aderezo mientras aún están ligeramente tibias ayuda a que absorban más sabor.",
      tags: [
        "acompañamiento",
        "papas",
        "ensalada",
        "bbq",
        "verano",
        "comida reconfortante",
        "familiar",
        "parrillada",
      ],
      ingredients: `2 lbs de papas Yukon Gold o rojas, cortadas en trozos de 1 inch
1 tsp de sal para el agua de cocción
3 huevos grandes

1/2 cup de apio, finamente picado
1/3 cup de cebolla roja, finamente picada
1/4 cup de pepinillos dill o relish, picados
2 Tbsp de perejil fresco, picado

3/4 cup de mayonesa
1 Tbsp de mostaza Dijon
1 Tbsp de vinagre de manzana
1 tsp de azúcar
1/2 tsp de sal, más al gusto
1/4 tsp de pimienta negra
1/2 tsp de paprika`,
      instructions: `Coloca 2 lbs de papas picadas en una olla grande y cúbrelas con agua fría. Agrega 1 tsp de sal y lleva a hervor a fuego alto.

Reduce a un hervor suave y cocina de 10 a 12 minutos, hasta que las papas estén tiernas al pincharlas con un tenedor pero aún mantengan su forma. Escurre y deja enfriar ligeramente.

Mientras se cocinan las papas, coloca 3 huevos en una cacerola y cúbrelos con agua. Lleva a hervor, luego apaga el fuego, tapa y deja reposar de 10 a 12 minutos. Pásalos a agua con hielo, pela y pica.

En un tazón grande, bate 3/4 cup de mayonesa, 1 Tbsp de mostaza Dijon, 1 Tbsp de vinagre de manzana, 1 tsp de azúcar, 1/2 tsp de sal, 1/4 tsp de pimienta negra y 1/2 tsp de paprika hasta que quede suave.

Agrega las papas ligeramente tibias al aderezo y mezcla suavemente para cubrirlas.

Agrega los huevos picados, 1/2 cup de apio, 1/3 cup de cebolla roja, 1/4 cup de pepinillos y 2 Tbsp de perejil. Incorpora todo con cuidado hasta combinar de manera uniforme.

Cubre y refrigera por al menos 1 a 2 horas para que los sabores se desarrollen.

Antes de servir, prueba y ajusta sal y pimienta si es necesario. Espolvorea con más paprika si deseas.`,
    },
  },
},

// Popular Sides Pack

{
  id: "quick-garlic-green-beans",
  slug: "quick-garlic-green-beans",
  name: "Garlic Green Beans",
  effort: "quick",
  photoUrl: "/images/quick-garlic-green-beans.jpg",
  tags: ["side", "vegetarian", "vegetable", "green-beans", "quick", "healthy"],
  isVegetarian: true,
  notes: "A simple, flexible side that can be steamed, sautéed, or roasted with garlic.",
  ingredients: `1 lb fresh green beans, trimmed
1 tbsp olive oil or butter
2 cloves garlic, minced
1/2 tsp salt
1/4 tsp black pepper
1 tbsp lemon juice (optional)`,
  instructions: `Heat 1 tbsp olive oil or butter in a large skillet over medium heat.

Add 1 lb green beans and cook for 5 to 7 minutes, stirring occasionally, until bright green and tender-crisp.

Add 2 cloves minced garlic, 1/2 tsp salt, and 1/4 tsp black pepper.

Cook for 1 to 2 minutes until the garlic is fragrant.

Finish with 1 tbsp lemon juice if desired and serve warm.`,
  translations: {
    es: {
      name: "Ejotes con Ajo",
      notes: "Una guarnición sencilla y flexible que se puede cocinar al vapor, saltear o rostizar con ajo.",
      tags: ["acompañamiento", "vegetariano", "verdura", "ejotes", "rápido", "saludable"],
      ingredients: `1 lb de ejotes frescos, limpios
1 Tbsp de aceite de oliva o mantequilla
2 dientes de ajo, picados
1/2 tsp de sal
1/4 tsp de pimienta negra
1 Tbsp de jugo de limón (opcional)`,
      instructions: `Calienta 1 Tbsp de aceite de oliva o mantequilla en una sartén grande a fuego medio.

Agrega 1 lb de ejotes y cocina de 5 a 7 minutos, revolviendo ocasionalmente, hasta que estén verdes brillantes y tiernos pero crujientes.

Agrega 2 dientes de ajo picados, 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Cocina de 1 a 2 minutos hasta que el ajo esté fragante.

Termina con 1 Tbsp de jugo de limón si deseas y sirve caliente.`,
    },
  },
},

{
  id: "quick-lemon-roasted-broccoli",
  slug: "quick-lemon-roasted-broccoli",
  name: "Lemon Roasted Broccoli",
  effort: "quick",
  photoUrl: "/images/quick-lemon-roasted-broccoli.jpg",
  tags: ["side", "vegetarian", "vegetable", "broccoli", "roasted", "healthy"],
  isVegetarian: true,
  notes: "High heat gives broccoli crispy edges while lemon keeps it bright and fresh.",
  ingredients: `1 large head broccoli, cut into florets
2 tbsp olive oil
1/2 tsp salt
1/4 tsp black pepper
1 tbsp lemon juice
1/4 cup parmesan cheese, grated (optional)`,
  instructions: `Preheat oven to 425°F.

Toss broccoli with 2 tbsp olive oil, 1/2 tsp salt, and 1/4 tsp black pepper.

Spread in a single layer on a baking sheet.

Roast for 18 to 22 minutes, until edges are browned and crispy.

Finish with 1 tbsp lemon juice and parmesan if desired.`,
  translations: {
    es: {
      name: "Brócoli Rostizado con Limón",
      notes: "El calor alto deja el brócoli crujiente en los bordes mientras el limón aporta frescura.",
      tags: ["acompañamiento", "vegetariano", "verdura", "brócoli", "rostizado", "saludable"],
      ingredients: `1 cabeza grande de brócoli, cortada en floretes
2 Tbsp de aceite de oliva
1/2 tsp de sal
1/4 tsp de pimienta negra
1 Tbsp de jugo de limón
1/4 cup de queso parmesano rallado (opcional)`,
      instructions: `Precalienta el horno a 425°F.

Mezcla el brócoli con 2 Tbsp de aceite de oliva, 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Extiende en una sola capa sobre una bandeja.

Rostiza de 18 a 22 minutos hasta que los bordes estén dorados y crujientes.

Termina con 1 Tbsp de jugo de limón y parmesano si deseas.`,
    },
  },
},

{
  id: "quick-glazed-carrots",
  slug: "quick-glazed-carrots",
  name: "Glazed Carrots",
  effort: "quick",
  photoUrl: "/images/quick-glazed-carrots.jpg",
  tags: ["side", "vegetarian", "vegetable", "carrots", "sweet", "family-friendly"],
  isVegetarian: true,
  notes: "Tender carrots simmered with butter and honey for a simple sweet-savory side.",
  ingredients: `1 lb carrots, sliced
2 tbsp butter
1 tbsp honey or brown sugar
1/2 tsp salt
1/4 tsp black pepper
1 tbsp fresh parsley, chopped (optional)`,
  instructions: `Place 1 lb sliced carrots in a skillet with enough water to barely cover the bottom.

Cover and simmer over medium heat for 6 to 8 minutes until tender.

Drain excess water if needed.

Add 2 tbsp butter, 1 tbsp honey or brown sugar, 1/2 tsp salt, and 1/4 tsp black pepper.

Cook 2 to 3 minutes, stirring, until the carrots are glossy and lightly glazed.

Garnish with parsley if desired and serve warm.`,
  translations: {
    es: {
      name: "Zanahorias Glaseadas",
      notes: "Zanahorias tiernas cocinadas con mantequilla y miel para una guarnición simple, dulce y salada.",
      tags: ["acompañamiento", "vegetariano", "verdura", "zanahorias", "dulce", "familiar"],
      ingredients: `1 lb de zanahorias, en rodajas
2 Tbsp de mantequilla
1 Tbsp de miel o azúcar morena
1/2 tsp de sal
1/4 tsp de pimienta negra
1 Tbsp de perejil fresco, picado (opcional)`,
      instructions: `Coloca 1 lb de zanahorias en una sartén con suficiente agua para cubrir apenas el fondo.

Cubre y cocina a fuego medio de 6 a 8 minutos hasta que estén tiernas.

Escurre el exceso de agua si es necesario.

Agrega 2 Tbsp de mantequilla, 1 Tbsp de miel o azúcar morena, 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Cocina de 2 a 3 minutos, revolviendo, hasta que las zanahorias estén brillantes y glaseadas.

Decora con perejil si deseas y sirve caliente.`,
    },
  },
},

{
  id: "quick-garlic-butter-asparagus",
  slug: "quick-garlic-butter-asparagus",
  name: "Garlic Butter Asparagus",
  effort: "quick",
  photoUrl: "/images/quick-garlic-butter-asparagus.jpg",
  tags: [
    "side",
    "vegetarian",
    "vegetable",
    "asparagus",
    "quick",
    "healthy",
  ],
  isVegetarian: true,
  notes:
    "A quick and elegant side dish that pairs well with chicken, steak, pork, or seafood. Cooking over medium-high heat keeps the asparagus tender-crisp.",
  ingredients: `1 lb asparagus, trimmed
1 tbsp butter
1 tbsp olive oil
2 cloves garlic, minced
1/2 tsp salt
1/4 tsp black pepper
1 tbsp lemon juice (optional)`,
  instructions: `Heat 1 tbsp butter and 1 tbsp olive oil in a large skillet over medium-high heat.

Add 1 lb asparagus and cook for 4 to 6 minutes, stirring occasionally, until bright green and tender-crisp.

Add 2 cloves minced garlic, 1/2 tsp salt, and 1/4 tsp black pepper.

Cook for 30 to 60 seconds until fragrant.

Finish with 1 tbsp lemon juice if desired.

Serve immediately while warm.`,
  translations: {
    es: {
      name: "Espárragos Salteados con Ajo y Mantequilla",
      notes:
        "Una guarnición rápida y elegante que combina perfectamente con pollo, carne de res, cerdo o mariscos. Cocinar a fuego medio-alto ayuda a mantener los espárragos tiernos pero crujientes.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "verdura",
        "espárragos",
        "rápido",
        "saludable",
      ],
      ingredients: `1 lb de espárragos, recortados
1 Tbsp de mantequilla
1 Tbsp de aceite de oliva
2 dientes de ajo, picados
1/2 tsp de sal
1/4 tsp de pimienta negra
1 Tbsp de jugo de limón (opcional)`,
      instructions: `Calienta 1 Tbsp de mantequilla y 1 Tbsp de aceite de oliva en una sartén grande a fuego medio-alto.

Agrega 1 lb de espárragos y cocina de 4 a 6 minutos, revolviendo ocasionalmente, hasta que estén verdes brillantes y tiernos pero crujientes.

Agrega 2 dientes de ajo picados, 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Cocina de 30 a 60 segundos hasta que el ajo esté fragante.

Termina con 1 Tbsp de jugo de limón si lo deseas.

Sirve inmediatamente.`,
    },
  },
},

{
  id: "quick-crispy-brussels-sprouts",
  slug: "quick-crispy-brussels-sprouts",
  name: "Crispy Brussels Sprouts",
  effort: "quick",
  photoUrl: "/images/quick-crispy-brussels-sprouts.jpg",
  tags: [
    "side",
    "vegetarian",
    "vegetable",
    "brussels-sprouts",
    "roasted",
    "healthy",
  ],
  isVegetarian: true,
  notes:
    "Roasting Brussels sprouts at high heat creates crispy caramelized edges and a tender center. A drizzle of balsamic glaze adds the perfect finishing touch.",
  ingredients: `1 1/2 lbs Brussels sprouts, halved
2 tbsp olive oil
1/2 tsp salt
1/4 tsp black pepper
1 tbsp balsamic glaze (optional)
2 tbsp parmesan cheese, grated (optional)`,
  instructions: `Preheat oven to 425°F.

Toss 1 1/2 lbs Brussels sprouts with 2 tbsp olive oil, 1/2 tsp salt, and 1/4 tsp black pepper.

Spread onto a baking sheet in a single layer.

Roast for 22 to 28 minutes, stirring once halfway through, until deeply browned and crispy around the edges.

Transfer to a serving dish.

Drizzle with 1 tbsp balsamic glaze and sprinkle with parmesan cheese if desired.

Serve warm.`,
  translations: {
    es: {
      name: "Coles de Bruselas Crujientes",
      notes:
        "Rostizar las coles de Bruselas a temperatura alta crea bordes caramelizados y crujientes con un centro tierno. Un poco de glaseado balsámico les da un toque espectacular.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "verdura",
        "coles de bruselas",
        "rostizado",
        "saludable",
      ],
      ingredients: `1 1/2 lbs de coles de Bruselas, partidas a la mitad
2 Tbsp de aceite de oliva
1/2 tsp de sal
1/4 tsp de pimienta negra
1 Tbsp de glaseado balsámico (opcional)
2 Tbsp de queso parmesano rallado (opcional)`,
      instructions: `Precalienta el horno a 425°F.

Mezcla 1 1/2 lbs de coles de Bruselas con 2 Tbsp de aceite de oliva, 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Extiéndelas en una bandeja para hornear en una sola capa.

Hornea de 22 a 28 minutos, revolviendo una vez a mitad de cocción, hasta que estén bien doradas y crujientes en los bordes.

Transfiérelas a un plato para servir.

Rocía con 1 Tbsp de glaseado balsámico y espolvorea parmesano si lo deseas.

Sirve caliente.`,
    },
  },
},

{
  id: "quick-buttered-corn-on-the-cob",
  slug: "quick-buttered-corn-on-the-cob",
  name: "Buttered Corn on the Cob",
  effort: "quick",
  photoUrl: "/images/quick-buttered-corn-on-the-cob.jpg",
  tags: [
    "side",
    "vegetarian",
    "corn",
    "summer",
    "cookout",
    "family-friendly",
  ],
  isVegetarian: true,
  notes:
    "A classic cookout favorite. Sweet corn and melted butter are hard to beat, and this side works with almost any grilled meal.",
  ingredients: `6 ears corn, husked
4 tbsp butter
1/2 tsp salt
1/4 tsp black pepper

Optional:
parmesan cheese
chili powder
lime wedges`,
  instructions: `Bring a large pot of water to a boil.

Add 6 ears of corn and cook for 5 to 7 minutes until tender.

Remove the corn and allow excess water to drain.

Spread 4 tbsp butter evenly over the hot corn.

Season with 1/2 tsp salt and 1/4 tsp black pepper.

Add parmesan cheese, chili powder, or lime juice if desired.

Serve immediately.`,
  translations: {
    es: {
      name: "Elote con Mantequilla",
      notes:
        "Un clásico de parrilladas y reuniones familiares. El maíz dulce con mantequilla combina perfectamente con casi cualquier comida.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "elote",
        "verano",
        "parrillada",
        "familiar",
      ],
      ingredients: `6 elotes, sin hojas
4 Tbsp de mantequilla
1/2 tsp de sal
1/4 tsp de pimienta negra

Opcional:
queso parmesano
chile en polvo
gajos de limón`,
      instructions: `Hierve una olla grande con agua.

Agrega 6 elotes y cocina de 5 a 7 minutos hasta que estén tiernos.

Retira los elotes y deja escurrir el exceso de agua.

Unta 4 Tbsp de mantequilla sobre los elotes calientes.

Sazona con 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Agrega parmesano, chile en polvo o jugo de limón si lo deseas.

Sirve inmediatamente.`,
    },
  },
},

{
  id: "quick-creamed-corn",
  slug: "quick-creamed-corn",
  name: "Creamed Corn",
  effort: "quick",
  photoUrl: "/images/quick-creamed-corn.jpg",
  tags: [
    "side",
    "vegetarian",
    "corn",
    "creamy",
    "comfort",
    "holiday",
  ],
  isVegetarian: true,
  notes:
    "A rich and creamy classic side dish that pairs beautifully with barbecue, roasted meats, and holiday meals.",
  ingredients: `2 tbsp butter
3 cups corn kernels (fresh, frozen, or canned)
1 cup heavy cream
2 oz cream cheese, softened
1/2 tsp salt
1/4 tsp black pepper
1 tsp sugar (optional)`,
  instructions: `Melt 2 tbsp butter in a medium saucepan over medium heat.

Add 3 cups corn kernels and cook for 3 to 4 minutes until heated through.

Pour in 1 cup heavy cream and add 2 oz cream cheese.

Stir frequently until the cream cheese melts completely.

Add 1/2 tsp salt, 1/4 tsp black pepper, and 1 tsp sugar if desired.

Simmer for 5 to 7 minutes until the sauce thickens slightly.

Serve warm.`,
  translations: {
    es: {
      name: "Maíz Cremoso",
      notes:
        "Una guarnición clásica, rica y cremosa que combina perfectamente con parrilladas, carnes asadas y comidas festivas.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "maíz",
        "cremoso",
        "comfort",
        "festivo",
      ],
      ingredients: `2 Tbsp de mantequilla
3 cups de granos de maíz
1 cup de crema espesa
2 oz de queso crema, suavizado
1/2 tsp de sal
1/4 tsp de pimienta negra
1 tsp de azúcar (opcional)`,
      instructions: `Derrite 2 Tbsp de mantequilla en una cacerola a fuego medio.

Agrega 3 cups de maíz y cocina de 3 a 4 minutos hasta que esté caliente.

Vierte 1 cup de crema espesa y agrega 2 oz de queso crema.

Revuelve frecuentemente hasta que el queso crema se derrita por completo.

Agrega 1/2 tsp de sal, 1/4 tsp de pimienta negra y 1 tsp de azúcar si lo deseas.

Cocina a fuego lento de 5 a 7 minutos hasta que la salsa espese ligeramente.

Sirve caliente.`,
    },
  },
},

{
  id: "quick-roasted-cauliflower",
  slug: "quick-roasted-cauliflower",
  name: "Roasted Cauliflower",
  effort: "quick",
  photoUrl: "/images/quick-roasted-cauliflower.jpg",
  tags: [
    "side",
    "vegetarian",
    "cauliflower",
    "roasted",
    "healthy",
    "low-carb",
  ],
  isVegetarian: true,
  notes:
    "Roasting transforms cauliflower into a sweet, nutty side dish with crispy golden edges and incredible flavor.",
  ingredients: `1 large head cauliflower, cut into florets
2 tbsp olive oil
1/2 tsp salt
1/4 tsp black pepper
1/2 tsp garlic powder

Optional:
2 tbsp parmesan cheese
1 tbsp lemon juice`,
  instructions: `Preheat oven to 425°F.

Toss cauliflower florets with 2 tbsp olive oil, 1/2 tsp salt, 1/4 tsp black pepper, and 1/2 tsp garlic powder.

Spread onto a baking sheet in a single layer.

Roast for 22 to 28 minutes, stirring halfway through, until deeply golden and tender.

Finish with parmesan cheese or lemon juice if desired.

Serve warm.`,
  translations: {
    es: {
      name: "Coliflor Rostizada",
      notes:
        "Rostizar la coliflor resalta su dulzura natural y crea bordes dorados y crujientes llenos de sabor.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "coliflor",
        "rostizado",
        "saludable",
        "bajo en carbohidratos",
      ],
      ingredients: `1 cabeza grande de coliflor, cortada en floretes
2 Tbsp de aceite de oliva
1/2 tsp de sal
1/4 tsp de pimienta negra
1/2 tsp de ajo en polvo

Opcional:
2 Tbsp de queso parmesano
1 Tbsp de jugo de limón`,
      instructions: `Precalienta el horno a 425°F.

Mezcla la coliflor con 2 Tbsp de aceite de oliva, 1/2 tsp de sal, 1/4 tsp de pimienta negra y 1/2 tsp de ajo en polvo.

Extiende en una bandeja para hornear en una sola capa.

Hornea de 22 a 28 minutos, revolviendo a mitad de cocción, hasta que esté dorada y tierna.

Agrega parmesano o jugo de limón si lo deseas.

Sirve caliente.`,
    },
  },
},

{
  id: "quick-sauteed-zucchini-squash",
  slug: "quick-sauteed-zucchini-squash",
  name: "Sautéed Zucchini and Squash",
  effort: "quick",
  photoUrl: "/images/quick-sauteed-zucchini-squash.jpg",
  tags: [
    "side",
    "vegetarian",
    "zucchini",
    "squash",
    "summer",
    "healthy",
  ],
  isVegetarian: true,
  notes:
    "A simple summer favorite featuring tender zucchini, yellow squash, and sweet onions cooked until lightly caramelized.",
  ingredients: `1 zucchini, sliced
1 yellow squash, sliced
1/2 onion, sliced
1 tbsp olive oil
1 tbsp butter
1/2 tsp salt
1/4 tsp black pepper
1/2 tsp garlic powder`,
  instructions: `Heat 1 tbsp olive oil and 1 tbsp butter in a large skillet over medium heat.

Add 1 zucchini, 1 yellow squash, and 1/2 sliced onion.

Cook for 8 to 10 minutes, stirring occasionally, until tender and lightly browned.

Season with 1/2 tsp salt, 1/4 tsp black pepper, and 1/2 tsp garlic powder.

Cook 1 minute longer and serve warm.`,
  translations: {
    es: {
      name: "Calabacín y Calabaza Salteados",
      notes:
        "Un favorito del verano con calabacín, calabaza amarilla y cebolla cocinados hasta quedar tiernos y ligeramente caramelizados.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "calabacín",
        "calabaza",
        "verano",
        "saludable",
      ],
      ingredients: `1 calabacín, en rodajas
1 calabaza amarilla, en rodajas
1/2 cebolla, en rodajas
1 Tbsp de aceite de oliva
1 Tbsp de mantequilla
1/2 tsp de sal
1/4 tsp de pimienta negra
1/2 tsp de ajo en polvo`,
      instructions: `Calienta 1 Tbsp de aceite de oliva y 1 Tbsp de mantequilla en una sartén grande a fuego medio.

Agrega 1 calabacín, 1 calabaza amarilla y 1/2 cebolla.

Cocina de 8 a 10 minutos, revolviendo ocasionalmente, hasta que estén tiernos y ligeramente dorados.

Sazona con 1/2 tsp de sal, 1/4 tsp de pimienta negra y 1/2 tsp de ajo en polvo.

Cocina 1 minuto más y sirve caliente.`,
    },
  },
},

{
  id: "quick-creamed-spinach",
  slug: "quick-creamed-spinach",
  name: "Creamed Spinach",
  effort: "quick",
  photoUrl: "/images/quick-creamed-spinach.jpg",
  tags: [
    "side",
    "vegetarian",
    "spinach",
    "creamy",
    "comfort",
    "holiday",
  ],
  isVegetarian: true,
  notes:
    "A steakhouse favorite featuring tender spinach in a rich, cheesy cream sauce. Perfect alongside beef, chicken, pork, or holiday meals.",
  ingredients: `Spinach:
1 lb fresh spinach

Sauce:
2 tbsp butter
2 cloves garlic, minced
2 tbsp flour
1 cup whole milk
1/2 cup parmesan cheese, grated
2 oz cream cheese, softened
1/2 tsp salt
1/4 tsp black pepper
1/8 tsp nutmeg (optional)`,
  instructions: `Bring a large pot of water to a boil.

Add 1 lb spinach and cook for 30 seconds until wilted.

Drain and squeeze out excess moisture. Roughly chop and set aside.

Melt 2 tbsp butter in a skillet over medium heat.

Add 2 cloves garlic and cook for 30 seconds.

Whisk in 2 tbsp flour and cook for 1 minute.

Slowly pour in 1 cup milk while whisking constantly.

Add parmesan cheese, cream cheese, 1/2 tsp salt, 1/4 tsp black pepper, and nutmeg if using.

Cook 3 to 5 minutes until thick and creamy.

Stir in the spinach and cook 1 to 2 minutes until heated through.

Serve warm.`,
  translations: {
    es: {
      name: "Espinacas a la Crema",
      notes:
        "Un clásico de restaurante con espinacas tiernas en una salsa cremosa y quesosa. Perfecto para acompañar carnes, pollo, cerdo o comidas festivas.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "espinacas",
        "cremoso",
        "comfort",
        "festivo",
      ],
      ingredients: `Espinacas:
1 lb de espinacas frescas

Salsa:
2 Tbsp de mantequilla
2 dientes de ajo, picados
2 Tbsp de harina
1 cup de leche entera
1/2 cup de queso parmesano rallado
2 oz de queso crema, suavizado
1/2 tsp de sal
1/4 tsp de pimienta negra
1/8 tsp de nuez moscada (opcional)`,
      instructions: `Hierve una olla grande con agua.

Agrega 1 lb de espinacas y cocina durante 30 segundos hasta que se marchiten.

Escurre y exprime el exceso de líquido. Pica ligeramente y reserva.

Derrite 2 Tbsp de mantequilla en una sartén a fuego medio.

Agrega 2 dientes de ajo y cocina 30 segundos.

Incorpora 2 Tbsp de harina y cocina 1 minuto.

Vierte lentamente 1 cup de leche mientras bates constantemente.

Agrega parmesano, queso crema, 1/2 tsp de sal, 1/4 tsp de pimienta negra y nuez moscada si la usas.

Cocina de 3 a 5 minutos hasta obtener una salsa espesa y cremosa.

Incorpora las espinacas y cocina 1 a 2 minutos hasta que estén calientes.

Sirve caliente.`,
    },
  },
},

{
  id: "quick-peas-and-carrots",
  slug: "quick-peas-and-carrots",
  name: "Peas and Carrots",
  effort: "quick",
  photoUrl: "/images/quick-peas-and-carrots.jpg",
  tags: [
    "side",
    "vegetarian",
    "peas",
    "carrots",
    "family-friendly",
    "quick",
  ],
  isVegetarian: true,
  notes:
    "A colorful and simple side dish that's quick to prepare and pairs well with almost any dinner.",
  ingredients: `2 cups frozen peas
2 cups carrots, diced
2 tbsp butter
1/2 tsp salt
1/4 tsp black pepper
1 tsp honey (optional)`,
  instructions: `Bring a medium saucepan of water to a boil.

Add 2 cups carrots and cook for 5 minutes.

Add 2 cups peas and cook for 2 additional minutes.

Drain well.

Return vegetables to the saucepan.

Add 2 tbsp butter, 1/2 tsp salt, 1/4 tsp black pepper, and 1 tsp honey if desired.

Stir until butter melts and vegetables are coated.

Serve warm.`,
  translations: {
    es: {
      name: "Chícharos y Zanahorias",
      notes:
        "Una guarnición sencilla, colorida y rápida de preparar que combina con prácticamente cualquier comida.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "chícharos",
        "zanahorias",
        "familiar",
        "rápido",
      ],
      ingredients: `2 cups de chícharos congelados
2 cups de zanahorias en cubos
2 Tbsp de mantequilla
1/2 tsp de sal
1/4 tsp de pimienta negra
1 tsp de miel (opcional)`,
      instructions: `Hierve una cacerola mediana con agua.

Agrega 2 cups de zanahorias y cocina durante 5 minutos.

Agrega 2 cups de chícharos y cocina 2 minutos más.

Escurre bien.

Regresa las verduras a la cacerola.

Agrega 2 Tbsp de mantequilla, 1/2 tsp de sal, 1/4 tsp de pimienta negra y 1 tsp de miel si lo deseas.

Revuelve hasta que la mantequilla se derrita y cubra las verduras.

Sirve caliente.`,
    },
  },
},

{
  id: "quick-roasted-root-vegetables",
  slug: "quick-roasted-root-vegetables",
  name: "Roasted Root Vegetables",
  effort: "quick",
  photoUrl: "/images/quick-roasted-root-vegetables.jpg",
  tags: [
    "side",
    "vegetarian",
    "roasted",
    "vegetables",
    "healthy",
    "fall",
  ],
  isVegetarian: true,
  notes:
    "Roasting brings out the natural sweetness of root vegetables while creating delicious caramelized edges.",
  ingredients: `2 carrots, peeled and chopped
2 parsnips, peeled and chopped
2 medium beets, peeled and chopped
2 tbsp olive oil
1 tsp salt
1/2 tsp black pepper
1 tsp dried thyme

Optional:
1 tbsp balsamic glaze
fresh parsley for garnish`,
  instructions: `Preheat oven to 425°F.

Place carrots, parsnips, and beets onto a large baking sheet.

Drizzle with 2 tbsp olive oil.

Season with 1 tsp salt, 1/2 tsp black pepper, and 1 tsp dried thyme.

Toss well and spread into a single layer.

Roast for 30 to 35 minutes, stirring halfway through, until tender and caramelized.

Drizzle with balsamic glaze and garnish with parsley if desired.

Serve warm.`,
  translations: {
    es: {
      name: "Verduras de Raíz Rostizadas",
      notes:
        "Rostizar verduras de raíz resalta su dulzura natural y crea deliciosos bordes caramelizados.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "rostizado",
        "verduras",
        "saludable",
        "otoño",
      ],
      ingredients: `2 zanahorias, peladas y picadas
2 chirivías, peladas y picadas
2 remolachas medianas, peladas y picadas
2 Tbsp de aceite de oliva
1 tsp de sal
1/2 tsp de pimienta negra
1 tsp de tomillo seco

Opcional:
1 Tbsp de glaseado balsámico
perejil fresco para decorar`,
      instructions: `Precalienta el horno a 425°F.

Coloca las zanahorias, chirivías y remolachas en una bandeja grande para hornear.

Rocía con 2 Tbsp de aceite de oliva.

Sazona con 1 tsp de sal, 1/2 tsp de pimienta negra y 1 tsp de tomillo seco.

Mezcla bien y acomoda en una sola capa.

Hornea de 30 a 35 minutos, revolviendo a mitad del tiempo, hasta que estén tiernas y caramelizadas.

Rocía con glaseado balsámico y decora con perejil si lo deseas.

Sirve caliente.`,
    },
  },
},


{
  id: "quick-creamy-mashed-potatoes",
  slug: "quick-creamy-mashed-potatoes",
  name: "Creamy Mashed Potatoes",
  effort: "quick",
  photoUrl: "/images/quick-creamy-mashed-potatoes.jpg",
  tags: [
    "side",
    "vegetarian",
    "potatoes",
    "comfort",
    "holiday",
    "family-friendly",
  ],
  isVegetarian: true,
  notes:
    "Rich, buttery mashed potatoes that pair perfectly with gravy, roasted meats, or holiday dinners.",
  ingredients: `2 lbs russet potatoes, peeled and cubed
4 tbsp butter
1/2 cup whole milk
1/2 cup sour cream
1 tsp salt
1/4 tsp black pepper

Optional:
gravy
fresh chives`,
  instructions: `Place 2 lbs potatoes into a large pot and cover with cold water.

Bring to a boil and cook for 15 to 18 minutes until fork tender.

Drain well and return to the pot.

Add 4 tbsp butter, 1/2 cup milk, 1/2 cup sour cream, 1 tsp salt, and 1/4 tsp black pepper.

Mash until smooth and creamy.

Adjust seasoning if needed.

Serve warm with gravy or fresh chives if desired.`,
  translations: {
    es: {
      name: "Puré de Papas Cremoso",
      notes:
        "Un puré de papas rico y mantequilloso que combina perfectamente con gravy, carnes asadas y comidas festivas.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "papas",
        "comfort",
        "festivo",
        "familiar",
      ],
      ingredients: `2 lbs de papas russet, peladas y en cubos
4 Tbsp de mantequilla
1/2 cup de leche entera
1/2 cup de crema agria
1 tsp de sal
1/4 tsp de pimienta negra

Opcional:
gravy
cebollín fresco`,
      instructions: `Coloca 2 lbs de papas en una olla grande y cúbrelas con agua fría.

Lleva a ebullición y cocina de 15 a 18 minutos hasta que estén tiernas.

Escurre bien y regresa las papas a la olla.

Agrega 4 Tbsp de mantequilla, 1/2 cup de leche, 1/2 cup de crema agria, 1 tsp de sal y 1/4 tsp de pimienta negra.

Tritura hasta obtener una textura suave y cremosa.

Ajusta la sazón si es necesario.

Sirve caliente con gravy o cebollín fresco si lo deseas.`,
    },
  },
},

{
  id: "quick-seasoned-fries",
  slug: "quick-seasoned-fries",
  name: "Seasoned Fries",
  effort: "quick",
  photoUrl: "/images/quick-seasoned-fries.jpg",
  tags: [
    "side",
    "vegetarian",
    "potatoes",
    "fries",
    "air-fryer",
    "family-friendly",
  ],
  isVegetarian: true,
  notes:
    "Crispy fries with simple seasoning. Works great with shoestring, waffle, curly, or steak fries.",
  ingredients: `1 lb frozen fries
1 tbsp olive oil
1 tsp seasoned salt
1/2 tsp garlic powder
1/4 tsp black pepper

Optional:
ketchup
ranch dressing
fry sauce`,
  instructions: `Preheat oven to 425°F or air fryer to 400°F.

Toss 1 lb fries with 1 tbsp olive oil, 1 tsp seasoned salt, 1/2 tsp garlic powder, and 1/4 tsp black pepper.

Arrange in a single layer.

Bake for 20 to 25 minutes or air fry for 12 to 15 minutes until golden and crispy.

Serve immediately with your favorite dipping sauce.`,
  translations: {
    es: {
      name: "Papas Fritas Sazonadas",
      notes:
        "Papas crujientes con un sazonado sencillo. Funciona perfectamente con papas waffle, curly, shoestring o estilo steak fries.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "papas",
        "papas fritas",
        "freidora de aire",
        "familiar",
      ],
      ingredients: `1 lb de papas fritas congeladas
1 Tbsp de aceite de oliva
1 tsp de sal sazonada
1/2 tsp de ajo en polvo
1/4 tsp de pimienta negra

Opcional:
ketchup
aderezo ranch
salsa para papas`,
      instructions: `Precalienta el horno a 425°F o la freidora de aire a 400°F.

Mezcla 1 lb de papas fritas con 1 Tbsp de aceite de oliva, 1 tsp de sal sazonada, 1/2 tsp de ajo en polvo y 1/4 tsp de pimienta negra.

Colócalas en una sola capa.

Hornea de 20 a 25 minutos o cocina en freidora de aire de 12 a 15 minutos hasta que estén doradas y crujientes.

Sirve inmediatamente con tu salsa favorita.`,
    },
  },
},

{
  id: "quick-roasted-red-potatoes",
  slug: "quick-roasted-red-potatoes",
  name: "Roasted Red Potatoes",
  effort: "quick",
  photoUrl: "/images/quick-roasted-red-potatoes.jpg",
  tags: [
    "side",
    "vegetarian",
    "potatoes",
    "roasted",
    "healthy",
    "family-friendly",
  ],
  isVegetarian: true,
  notes:
    "Crispy on the outside and fluffy inside, these roasted red potatoes pair well with almost any main dish.",
  ingredients: `2 lbs red potatoes, cut into bite-size pieces
2 tbsp olive oil
3 cloves garlic, minced
1 tsp dried rosemary
1 tsp salt
1/2 tsp black pepper

Optional:
2 tbsp parmesan cheese
fresh parsley`,
  instructions: `Preheat oven to 425°F.

Place potatoes onto a large baking sheet.

Add 2 tbsp olive oil, 3 cloves garlic, 1 tsp rosemary, 1 tsp salt, and 1/2 tsp black pepper.

Toss until evenly coated.

Spread into a single layer.

Roast for 30 to 35 minutes, stirring halfway through, until golden brown and crisp.

Top with parmesan cheese or parsley if desired.

Serve warm.`,
  translations: {
    es: {
      name: "Papas Rojas Rostizadas",
      notes:
        "Crujientes por fuera y suaves por dentro, estas papas combinan perfectamente con casi cualquier plato principal.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "papas",
        "rostizado",
        "saludable",
        "familiar",
      ],
      ingredients: `2 lbs de papas rojas, cortadas en trozos
2 Tbsp de aceite de oliva
3 dientes de ajo, picados
1 tsp de romero seco
1 tsp de sal
1/2 tsp de pimienta negra

Opcional:
2 Tbsp de queso parmesano
perejil fresco`,
      instructions: `Precalienta el horno a 425°F.

Coloca las papas en una bandeja grande para hornear.

Agrega 2 Tbsp de aceite de oliva, 3 dientes de ajo, 1 tsp de romero, 1 tsp de sal y 1/2 tsp de pimienta negra.

Mezcla hasta cubrir uniformemente.

Extiende en una sola capa.

Hornea de 30 a 35 minutos, revolviendo a mitad del tiempo, hasta que estén doradas y crujientes.

Agrega parmesano o perejil si lo deseas.

Sirve caliente.`,
    },
  },
},

{
  id: "quick-crispy-smashed-potatoes",
  slug: "quick-crispy-smashed-potatoes",
  name: "Crispy Smashed Potatoes",
  effort: "quick",
  photoUrl: "/images/quick-crispy-smashed-potatoes.jpg",
  tags: ["side", "vegetarian", "potatoes", "crispy", "roasted", "comfort", "family-friendly"],
  isVegetarian: true,
  notes: "Boiling the potatoes first creates a fluffy inside while roasting them after smashing gives them ultra-crispy edges.",
  ingredients: `2 lbs baby potatoes
2 tbsp olive oil
1 tsp garlic powder
1 tsp salt
1/2 tsp black pepper

Optional:
2 tbsp parmesan cheese
1 tbsp fresh parsley, chopped
sour cream for serving`,
  instructions: `Preheat oven to 425°F.

Bring a large pot of salted water to a boil.

Add 2 lbs baby potatoes and cook for 15 to 18 minutes, until fork-tender.

Drain potatoes and let them cool for 5 minutes.

Place potatoes on a parchment-lined baking sheet.

Use the bottom of a glass or measuring cup to gently flatten each potato.

Drizzle with 2 tbsp olive oil.

Sprinkle with 1 tsp garlic powder, 1 tsp salt, and 1/2 tsp black pepper.

Roast for 25 to 30 minutes, until deeply golden brown and crispy around the edges.

Top with parmesan cheese and parsley if desired.

Serve warm with sour cream if desired.`,
  translations: {
    es: {
      name: "Papas Aplastadas Crujientes",
      notes: "Hervir las papas primero crea un interior suave, mientras que rostizarlas después de aplastarlas les da bordes ultra crujientes.",
      tags: ["acompañamiento", "vegetariano", "papas", "crujiente", "rostizado", "comfort", "familiar"],
      ingredients: `2 lbs de papas pequeñas
2 Tbsp de aceite de oliva
1 tsp de ajo en polvo
1 tsp de sal
1/2 tsp de pimienta negra

Opcional:
2 Tbsp de queso parmesano
1 Tbsp de perejil fresco, picado
crema agria para servir`,
      instructions: `Precalienta el horno a 425°F.

Hierve una olla grande con agua y sal.

Agrega 2 lbs de papas pequeñas y cocina de 15 a 18 minutos, hasta que estén tiernas al pincharlas con un tenedor.

Escurre las papas y deja enfriar durante 5 minutos.

Coloca las papas en una bandeja con papel para hornear.

Usa el fondo de un vaso o cup medidora para aplastar suavemente cada papa.

Rocía con 2 Tbsp de aceite de oliva.

Espolvorea 1 tsp de ajo en polvo, 1 tsp de sal y 1/2 tsp de pimienta negra.

Rostiza de 25 a 30 minutos, hasta que estén doradas y crujientes en los bordes.

Agrega parmesano y perejil si deseas.

Sirve caliente con crema agria si deseas.`,
    },
  },
},

{
  id: "normal-scalloped-potatoes",
  slug: "normal-scalloped-potatoes",
  name: "Scalloped Potatoes",
  effort: "normal",
  photoUrl: "/images/normal-scalloped-potatoes.jpg",
  tags: ["side", "vegetarian", "potatoes", "comfort", "holiday", "casserole", "creamy"],
  isVegetarian: true,
  notes: "Classic scalloped potatoes are baked in a rich cream sauce until tender, bubbly, and lightly golden on top.",
  ingredients: `Potatoes:
2 lbs Yukon Gold potatoes, thinly sliced

Cream Sauce:
3 tbsp butter
3 tbsp flour
2 cups whole milk
1 cup heavy cream
1 tsp salt
1/2 tsp black pepper
1/2 tsp garlic powder
1/4 tsp nutmeg (optional)

Optional:
fresh parsley for garnish`,
  instructions: `Preheat oven to 375°F.

Grease a 9x13 baking dish.

Melt 3 tbsp butter in a saucepan over medium heat.

Whisk in 3 tbsp flour and cook for 1 minute.

Slowly whisk in 2 cups milk and 1 cup heavy cream until smooth.

Add 1 tsp salt, 1/2 tsp black pepper, 1/2 tsp garlic powder, and 1/4 tsp nutmeg if using.

Cook for 3 to 5 minutes, stirring often, until the sauce slightly thickens.

Arrange half of the sliced potatoes in the baking dish.

Pour half of the cream sauce over the potatoes.

Repeat with remaining potatoes and sauce.

Cover with foil and bake for 50 minutes.

Remove foil and bake another 20 minutes, until the potatoes are tender and the top is lightly golden.

Let rest for 10 minutes before serving.

Garnish with parsley if desired.`,
  translations: {
    es: {
      name: "Papas en Salsa Cremosa",
      notes: "Las papas scalloped clásicas se hornean en una salsa cremosa hasta quedar tiernas, burbujeantes y ligeramente doradas por encima.",
      tags: ["acompañamiento", "vegetariano", "papas", "comfort", "festivo", "cacerola", "cremoso"],
      ingredients: `Papas:
2 lbs de papas Yukon Gold, en rodajas finas

Salsa Cremosa:
3 Tbsp de mantequilla
3 Tbsp de harina
2 cups de leche entera
1 cup de crema espesa
1 tsp de sal
1/2 tsp de pimienta negra
1/2 tsp de ajo en polvo
1/4 tsp de nuez moscada (opcional)

Opcional:
perejil fresco para decorar`,
      instructions: `Precalienta el horno a 375°F.

Engrasa un molde para hornear de 9x13.

Derrite 3 Tbsp de mantequilla en una cacerola a fuego medio.

Agrega 3 Tbsp de harina y bate durante 1 minuto.

Incorpora lentamente 2 cups de leche y 1 cup de crema espesa, batiendo hasta que quede suave.

Agrega 1 tsp de sal, 1/2 tsp de pimienta negra, 1/2 tsp de ajo en polvo y 1/4 tsp de nuez moscada si la usas.

Cocina de 3 a 5 minutos, revolviendo con frecuencia, hasta que la salsa espese ligeramente.

Coloca la mitad de las papas en el molde.

Vierte la mitad de la salsa cremosa sobre las papas.

Repite con las papas y salsa restantes.

Cubre con papel aluminio y hornea durante 50 minutos.

Retira el aluminio y hornea 20 minutos más, hasta que las papas estén tiernas y la parte superior ligeramente dorada.

Deja reposar 10 minutos antes de servir.

Decora con perejil si deseas.`,
    },
  },
},

{
  id: "quick-baked-sweet-potatoes",
  slug: "quick-baked-sweet-potatoes",
  name: "Baked Sweet Potatoes",
  effort: "quick",
  photoUrl: "/images/quick-baked-sweet-potatoes.jpg",
  tags: ["side", "vegetarian", "sweet-potatoes", "healthy", "oven", "family-friendly"],
  isVegetarian: true,
  notes: "Simple baked sweet potatoes with a fluffy center and naturally sweet flavor. Perfect with butter, cinnamon, or a drizzle of honey.",
  ingredients: `4 medium sweet potatoes
1 tbsp olive oil
1/2 tsp salt

Optional:
2 tbsp butter
1/2 tsp cinnamon
1 tbsp honey or maple syrup`,
  instructions: `Preheat oven to 425°F.

Scrub 4 sweet potatoes clean and dry thoroughly.

Rub sweet potatoes with 1 tbsp olive oil and sprinkle with 1/2 tsp salt.

Place directly on the oven rack or on a parchment-lined baking sheet.

Bake for 45 to 55 minutes, until the skins are slightly wrinkled and the centers are fork-tender.

Slice open and fluff the inside with a fork.

Top with butter, cinnamon, honey, or maple syrup if desired.

Serve warm.`,
  translations: {
    es: {
      name: "Batatas Horneadas",
      notes: "Batatas simples al horno con un centro suave y esponjoso y sabor naturalmente dulce. Perfectas con mantequilla, canela o un poco de miel.",
      tags: ["acompañamiento", "vegetariano", "batatas", "saludable", "horno", "familiar"],
      ingredients: `4 batatas medianas
1 Tbsp de aceite de oliva
1/2 tsp de sal

Opcional:
2 Tbsp de mantequilla
1/2 tsp de canela
1 Tbsp de miel o maple syrup`,
      instructions: `Precalienta el horno a 425°F.

Lava bien 4 batatas y sécalas completamente.

Unta las batatas con 1 Tbsp de aceite de oliva y espolvorea 1/2 tsp de sal.

Colócalas directamente sobre la rejilla del horno o en una bandeja con papel para hornear.

Hornea de 45 a 55 minutos, hasta que la piel esté ligeramente arrugada y el centro esté suave al pinchar con un tenedor.

Ábrelas y esponja el interior con un tenedor.

Agrega mantequilla, canela, miel o maple syrup si deseas.

Sirve caliente.`,
    },
  },
},

{
  id: "quick-roasted-sweet-potato-cubes",
  slug: "quick-roasted-sweet-potato-cubes",
  name: "Roasted Sweet Potato Cubes",
  effort: "quick",
  photoUrl: "/images/quick-roasted-sweet-potato-cubes.jpg",
  tags: ["side", "vegetarian", "sweet-potatoes", "roasted", "healthy", "meal-prep"],
  isVegetarian: true,
  notes: "Roasting sweet potato cubes at high heat brings out their natural sweetness and creates caramelized edges.",
  ingredients: `2 lbs sweet potatoes, peeled and cubed
2 tbsp olive oil
1 tsp salt
1/2 tsp black pepper
1/2 tsp garlic powder
1/2 tsp smoked paprika
1/4 tsp cinnamon (optional)`,
  instructions: `Preheat oven to 425°F.

Place 2 lbs cubed sweet potatoes on a large baking sheet.

Drizzle with 2 tbsp olive oil.

Season with 1 tsp salt, 1/2 tsp black pepper, 1/2 tsp garlic powder, 1/2 tsp smoked paprika, and cinnamon if using.

Toss until evenly coated and spread into a single layer.

Roast for 25 to 30 minutes, stirring halfway through, until tender inside and caramelized on the edges.

Serve warm.`,
  translations: {
    es: {
      name: "Cubos de Batata Rostizados",
      notes: "Rostizar cubos de batata a temperatura alta resalta su dulzura natural y crea bordes caramelizados.",
      tags: ["acompañamiento", "vegetariano", "batatas", "rostizado", "saludable", "meal-prep"],
      ingredients: `2 lbs de batatas, peladas y en cubos
2 Tbsp de aceite de oliva
1 tsp de sal
1/2 tsp de pimienta negra
1/2 tsp de ajo en polvo
1/2 tsp de paprika ahumada
1/4 tsp de canela (opcional)`,
      instructions: `Precalienta el horno a 425°F.

Coloca 2 lbs de batatas en cubos sobre una bandeja grande.

Rocía con 2 Tbsp de aceite de oliva.

Sazona con 1 tsp de sal, 1/2 tsp de pimienta negra, 1/2 tsp de ajo en polvo, 1/2 tsp de paprika ahumada y canela si la usas.

Mezcla hasta cubrir uniformemente y extiende en una sola capa.

Rostiza de 25 a 30 minutos, revolviendo a mitad del tiempo, hasta que estén tiernas por dentro y caramelizadas en los bordes.

Sirve caliente.`,
    },
  },
},

{
  id: "quick-sweet-potato-fries",
  slug: "quick-sweet-potato-fries",
  name: "Sweet Potato Fries",
  effort: "quick",
  photoUrl: "/images/quick-sweet-potato-fries.jpg",
  tags: ["side", "vegetarian", "sweet-potatoes", "fries", "oven", "family-friendly"],
  isVegetarian: true,
  notes: "A sweet and savory alternative to regular fries with crispy edges and tender centers.",
  ingredients: `2 large sweet potatoes, cut into fries
2 tbsp olive oil
1 tbsp cornstarch
1 tsp salt
1/2 tsp garlic powder
1/2 tsp smoked paprika
1/4 tsp black pepper

Optional:
ranch dressing
chipotle mayo
ketchup`,
  instructions: `Preheat oven to 425°F.

Place sweet potato fries in a large bowl.

Toss with 1 tbsp cornstarch until lightly coated.

Add 2 tbsp olive oil, 1 tsp salt, 1/2 tsp garlic powder, 1/2 tsp smoked paprika, and 1/4 tsp black pepper.

Spread fries in a single layer on a parchment-lined baking sheet.

Bake for 25 to 30 minutes, flipping halfway through, until browned on the edges and tender inside.

Let rest for 3 to 5 minutes before serving so the fries firm up slightly.

Serve with your favorite dipping sauce.`,
  translations: {
    es: {
      name: "Papas Fritas de Batata",
      notes: "Una alternativa dulce y salada a las papas fritas tradicionales, con bordes crujientes y centro suave.",
      tags: ["acompañamiento", "vegetariano", "batatas", "papas fritas", "horno", "familiar"],
      ingredients: `2 batatas grandes, cortadas en tiras
2 Tbsp de aceite de oliva
1 Tbsp de maicena
1 tsp de sal
1/2 tsp de ajo en polvo
1/2 tsp de paprika ahumada
1/4 tsp de pimienta negra

Opcional:
aderezo ranch
mayonesa chipotle
ketchup`,
      instructions: `Precalienta el horno a 425°F.

Coloca las tiras de batata en un tazón grande.

Mezcla con 1 Tbsp de maicena hasta cubrir ligeramente.

Agrega 2 Tbsp de aceite de oliva, 1 tsp de sal, 1/2 tsp de ajo en polvo, 1/2 tsp de paprika ahumada y 1/4 tsp de pimienta negra.

Extiende en una sola capa sobre una bandeja con papel para hornear.

Hornea de 25 a 30 minutos, volteando a mitad del tiempo, hasta que estén doradas en los bordes y suaves por dentro.

Deja reposar de 3 a 5 minutos antes de servir para que se afirmen un poco.

Sirve con tu salsa favorita.`,
    },
  },
},

{
  id: "normal-sweet-potato-casserole",
  slug: "normal-sweet-potato-casserole",
  name: "Sweet Potato Casserole",
  effort: "normal",
  photoUrl: "/images/normal-sweet-potato-casserole.jpg",
  tags: ["side", "vegetarian", "sweet-potatoes", "casserole", "holiday", "comfort"],
  isVegetarian: true,
  notes: "A classic holiday-style casserole with creamy mashed sweet potatoes and a sweet, crunchy topping.",
  ingredients: `Sweet Potatoes:
3 lbs sweet potatoes, peeled and cubed
4 tbsp butter
1/2 cup brown sugar
1/2 cup milk
2 large eggs
1 tsp vanilla extract
1/2 tsp cinnamon
1/2 tsp salt

Topping:
1 cup chopped pecans
1/2 cup brown sugar
1/4 cup flour
3 tbsp butter, melted

Optional:
2 cups mini marshmallows`,
  instructions: `Preheat oven to 350°F.

Place 3 lbs cubed sweet potatoes in a large pot and cover with water.

Boil for 15 to 18 minutes, until fork-tender.

Drain well and mash until smooth.

Stir in 4 tbsp butter, 1/2 cup brown sugar, 1/2 cup milk, 2 eggs, 1 tsp vanilla, 1/2 tsp cinnamon, and 1/2 tsp salt.

Spread the mixture into a greased 9x13 baking dish.

In a bowl, combine 1 cup pecans, 1/2 cup brown sugar, 1/4 cup flour, and 3 tbsp melted butter.

Sprinkle the topping evenly over the sweet potatoes.

Bake for 25 to 30 minutes, until the topping is golden and the casserole is set.

If using marshmallows, add 2 cups mini marshmallows during the final 5 minutes and bake until toasted.

Let rest for 5 minutes before serving.`,
  translations: {
    es: {
      name: "Cacerola de Batata",
      notes: "Una cacerola clásica de estilo festivo con batatas cremosas y una cobertura dulce y crujiente.",
      tags: ["acompañamiento", "vegetariano", "batatas", "cacerola", "festivo", "comfort"],
      ingredients: `Batatas:
3 lbs de batatas, peladas y en cubos
4 Tbsp de mantequilla
1/2 cup de azúcar morena
1/2 cup de leche
2 huevos grandes
1 tsp de vainilla
1/2 tsp de canela
1/2 tsp de sal

Cobertura:
1 cup de nueces pecanas picadas
1/2 cup de azúcar morena
1/4 cup de harina
3 Tbsp de mantequilla derretida

Opcional:
2 cups de mini malvaviscos`,
      instructions: `Precalienta el horno a 350°F.

Coloca 3 lbs de batatas en cubos en una olla grande y cúbrelas con agua.

Hierve de 15 a 18 minutos, hasta que estén tiernas al pincharlas con un tenedor.

Escurre bien y tritura hasta obtener una mezcla suave.

Agrega 4 Tbsp de mantequilla, 1/2 cup de azúcar morena, 1/2 cup de leche, 2 huevos, 1 tsp de vainilla, 1/2 tsp de canela y 1/2 tsp de sal.

Extiende la mezcla en un molde engrasado de 9x13.

En un tazón, mezcla 1 cup de pecanas, 1/2 cup de azúcar morena, 1/4 cup de harina y 3 Tbsp de mantequilla derretida.

Espolvorea la cobertura uniformemente sobre las batatas.

Hornea de 25 a 30 minutos, hasta que la cobertura esté dorada y la cacerola esté firme.

Si usas malvaviscos, agrega 2 cups de mini malvaviscos durante los últimos 5 minutos y hornea hasta que estén tostados.

Deja reposar 5 minutos antes de servir.`,
    },
  },
},

{
  id: "quick-fluffy-white-rice",
  slug: "quick-fluffy-white-rice",
  name: "Fluffy White Rice",
  effort: "quick",
  photoUrl: "/images/quick-fluffy-white-rice.jpg",
  tags: ["side", "vegetarian", "rice", "simple", "meal-prep", "family-friendly"],
  isVegetarian: true,
  notes: "Perfectly fluffy white rice is one of the most versatile side dishes and pairs with nearly any main course.",
  ingredients: `1 cup long-grain white rice or jasmine rice
2 cups water
1 tbsp butter
1/2 tsp salt`,
  instructions: `Rinse 1 cup rice under cold water until the water runs mostly clear.

Combine rice, 2 cups water, 1 tbsp butter, and 1/2 tsp salt in a medium saucepan.

Bring to a boil over medium-high heat.

Reduce heat to low, cover, and simmer for 15 to 18 minutes.

Remove from heat and let stand covered for 5 minutes.

Fluff gently with a fork before serving.`,
  translations: {
    es: {
      name: "Arroz Blanco Esponjoso",
      notes: "Un arroz blanco perfectamente esponjoso es una de las guarniciones más versátiles y combina con casi cualquier plato principal.",
      tags: ["acompañamiento", "vegetariano", "arroz", "simple", "meal-prep", "familiar"],
      ingredients: `1 cup de arroz blanco de grano largo o arroz jazmín
2 cups de agua
1 Tbsp de mantequilla
1/2 tsp de sal`,
      instructions: `Enjuaga 1 cup de arroz bajo agua fría hasta que el agua salga casi clara.

Combina el arroz, 2 cups de agua, 1 Tbsp de mantequilla y 1/2 tsp de sal en una cacerola mediana.

Lleva a ebullición a fuego medio-alto.

Reduce el fuego a bajo, tapa y cocina de 15 a 18 minutos.

Retira del fuego y deja reposar tapado durante 5 minutos.

Esponja suavemente con un tenedor antes de servir.`,
    },
  },
},

{
  id: "quick-brown-rice",
  slug: "quick-brown-rice",
  name: "Brown Rice",
  effort: "quick",
  photoUrl: "/images/quick-brown-rice.jpg",
  tags: ["side", "vegetarian", "rice", "healthy", "whole-grain", "meal-prep"],
  isVegetarian: true,
  notes: "Brown rice offers a nutty flavor and heartier texture while providing more fiber than traditional white rice.",
  ingredients: `1 cup brown rice
2 1/2 cups water
1 tbsp butter or olive oil
1/2 tsp salt`,
  instructions: `Rinse 1 cup brown rice under cold water.

Combine rice, 2 1/2 cups water, 1 tbsp butter, and 1/2 tsp salt in a saucepan.

Bring to a boil.

Reduce heat to low, cover, and simmer for 40 to 45 minutes.

Remove from heat and let stand covered for 10 minutes.

Fluff with a fork and serve warm.`,
  translations: {
    es: {
      name: "Arroz Integral",
      notes: "El arroz integral ofrece un sabor más intenso y una textura más firme, además de contener más fibra que el arroz blanco.",
      tags: ["acompañamiento", "vegetariano", "arroz", "saludable", "grano integral", "meal-prep"],
      ingredients: `1 cup de arroz integral
2 1/2 cups de agua
1 Tbsp de mantequilla o aceite de oliva
1/2 tsp de sal`,
      instructions: `Enjuaga 1 cup de arroz integral bajo agua fría.

Combina el arroz, 2 1/2 cups de agua, 1 Tbsp de mantequilla y 1/2 tsp de sal en una cacerola.

Lleva a ebullición.

Reduce el fuego a bajo, tapa y cocina de 40 a 45 minutos.

Retira del fuego y deja reposar tapado durante 10 minutos.

Esponja con un tenedor y sirve caliente.`,
    },
  },
},

{
  id: "quick-rice-pilaf",
  slug: "quick-rice-pilaf",
  name: "Rice Pilaf",
  effort: "quick",
  photoUrl: "/images/quick-rice-pilaf.jpg",
  tags: ["side", "vegetarian", "rice", "pilaf", "comfort", "family-friendly"],
  isVegetarian: true,
  notes: "Toasting the rice before cooking adds depth of flavor while broth and herbs make this side dish extra flavorful.",
  ingredients: `1 cup long-grain white rice
1/4 cup broken spaghetti or orzo
2 tbsp butter
2 cups vegetable broth
1/2 tsp salt
1/4 tsp black pepper
1 tbsp fresh parsley, chopped`,
  instructions: `Melt 2 tbsp butter in a saucepan over medium heat.

Add 1 cup rice and 1/4 cup broken spaghetti or orzo.

Cook for 3 to 4 minutes, stirring frequently, until lightly toasted.

Pour in 2 cups vegetable broth.

Add 1/2 tsp salt and 1/4 tsp black pepper.

Bring to a boil.

Reduce heat to low, cover, and simmer for 18 minutes.

Remove from heat and let rest for 5 minutes.

Fluff with a fork and stir in parsley before serving.`,
  translations: {
    es: {
      name: "Arroz Pilaf",
      notes: "Tostar el arroz antes de cocinarlo agrega profundidad de sabor mientras que el caldo y las hierbas lo hacen especialmente delicioso.",
      tags: ["acompañamiento", "vegetariano", "arroz", "pilaf", "comfort", "familiar"],
      ingredients: `1 cup de arroz blanco de grano largo
1/4 cup de espagueti troceado u orzo
2 Tbsp de mantequilla
2 cups de caldo de verduras
1/2 tsp de sal
1/4 tsp de pimienta negra
1 Tbsp de perejil fresco picado`,
      instructions: `Derrite 2 Tbsp de mantequilla en una cacerola a fuego medio.

Agrega 1 cup de arroz y 1/4 cup de espagueti troceado u orzo.

Cocina de 3 a 4 minutos, revolviendo frecuentemente, hasta que estén ligeramente tostados.

Vierte 2 cups de caldo de verduras.

Agrega 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Lleva a ebullición.

Reduce el fuego a bajo, tapa y cocina durante 18 minutos.

Retira del fuego y deja reposar 5 minutos.

Esponja con un tenedor y agrega el perejil antes de servir.`,
    },
  },
},

{
  id: "quick-vegetable-fried-rice",
  slug: "quick-vegetable-fried-rice",
  name: "Vegetable Fried Rice",
  effort: "quick",
  photoUrl: "/images/quick-vegetable-fried-rice.jpg",
  tags: ["side", "vegetarian", "rice", "asian", "one-pan", "meal-prep"],
  isVegetarian: true,
  notes: "Day-old rice works best because it stays firm and creates the classic fried rice texture.",
  ingredients: `3 cups cooked cold rice
1 tbsp sesame oil
1 tbsp vegetable oil
2 eggs, beaten
1 cup frozen peas and carrots
3 green onions, sliced
2 cloves garlic, minced
3 tbsp soy sauce
1 tsp sesame oil

Optional:
sesame seeds`,
  instructions: `Heat 1 tbsp vegetable oil and 1 tbsp sesame oil in a large skillet or wok over medium-high heat.

Add 2 beaten eggs and scramble until cooked. Remove and set aside.

Add peas and carrots and cook for 2 to 3 minutes.

Add 3 cups cold rice and stir-fry for 3 to 4 minutes.

Add garlic and green onions and cook for 1 minute.

Return the eggs to the pan.

Add 3 tbsp soy sauce and 1 tsp sesame oil.

Stir until everything is evenly coated and heated through.

Garnish with sesame seeds if desired and serve warm.`,
  translations: {
    es: {
      name: "Arroz Frito con Verduras",
      notes: "El arroz del día anterior funciona mejor porque mantiene su textura y crea el clásico resultado del arroz frito.",
      tags: ["acompañamiento", "vegetariano", "arroz", "asiático", "una sartén", "meal-prep"],
      ingredients: `3 cups de arroz cocido frío
1 Tbsp de aceite de ajonjolí
1 Tbsp de aceite vegetal
2 huevos, batidos
1 cup de chícharos y zanahorias congelados
3 cebollines, en rodajas
2 dientes de ajo, picados
3 Tbsp de salsa de soya
1 tsp de aceite de ajonjolí

Opcional:
semillas de ajonjolí`,
      instructions: `Calienta 1 Tbsp de aceite vegetal y 1 Tbsp de aceite de ajonjolí en una sartén grande o wok a fuego medio-alto.

Agrega los huevos batidos y cocínalos revolviendo hasta que estén listos. Retira y reserva.

Agrega los chícharos y zanahorias y cocina de 2 a 3 minutos.

Agrega las 3 cups de arroz frío y saltea de 3 a 4 minutos.

Agrega el ajo y los cebollines y cocina 1 minuto más.

Regresa los huevos a la sartén.

Agrega 3 Tbsp de salsa de soya y 1 tsp de aceite de ajonjolí.

Revuelve hasta que todo esté bien cubierto y caliente.

Decora con semillas de ajonjolí si lo deseas y sirve caliente.`,
    },
  },
},

{
  id: "quick-herb-quinoa",
  slug: "quick-herb-quinoa",
  name: "Herb Quinoa",
  effort: "quick",
  photoUrl: "/images/quick-herb-quinoa.jpg",
  tags: [
    "side",
    "vegetarian",
    "quinoa",
    "healthy",
    "high-protein",
    "meal-prep",
  ],
  isVegetarian: true,
  notes:
    "Cooking quinoa in broth instead of water adds extra flavor while fresh herbs keep it bright and versatile.",
  ingredients: `1 cup quinoa, rinsed
2 cups vegetable broth
1 tbsp olive oil
2 tbsp fresh parsley, chopped
1 tbsp fresh cilantro, chopped
1 tbsp lemon juice
1/2 tsp salt
1/4 tsp black pepper`,
  instructions: `Rinse 1 cup quinoa thoroughly under cold water.

Combine quinoa and 2 cups vegetable broth in a medium saucepan.

Bring to a boil over medium-high heat.

Reduce heat to low, cover, and simmer for 15 minutes until the liquid is absorbed.

Remove from heat and let stand covered for 5 minutes.

Fluff with a fork.

Stir in 1 tbsp olive oil, parsley, cilantro, lemon juice, 1/2 tsp salt, and 1/4 tsp black pepper.

Serve warm or chilled.`,
  translations: {
    es: {
      name: "Quinoa con Hierbas",
      notes:
        "Cocinar la quinoa en caldo en lugar de agua aporta más sabor, mientras que las hierbas frescas le dan un toque ligero y versátil.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "quinoa",
        "saludable",
        "alto en proteína",
        "meal-prep",
      ],
      ingredients: `1 cup de quinoa, enjuagada
2 cups de caldo de verduras
1 Tbsp de aceite de oliva
2 Tbsp de perejil fresco picado
1 Tbsp de cilantro fresco picado
1 Tbsp de jugo de limón
1/2 tsp de sal
1/4 tsp de pimienta negra`,
      instructions: `Enjuaga bien 1 cup de quinoa bajo agua fría.

Combina la quinoa y 2 cups de caldo de verduras en una cacerola mediana.

Lleva a ebullición a fuego medio-alto.

Reduce el fuego a bajo, tapa y cocina durante 15 minutos hasta que se absorba el líquido.

Retira del fuego y deja reposar tapada durante 5 minutos.

Esponja con un tenedor.

Agrega 1 Tbsp de aceite de oliva, perejil, cilantro, jugo de limón, 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Sirve caliente o fría.`,
    },
  },
},

{
  id: "quick-lemon-herb-couscous",
  slug: "quick-lemon-herb-couscous",
  name: "Lemon Herb Couscous",
  effort: "quick",
  photoUrl: "/images/quick-lemon-herb-couscous.jpg",
  tags: [
    "side",
    "vegetarian",
    "couscous",
    "quick",
    "healthy",
    "meal-prep",
  ],
  isVegetarian: true,
  notes:
    "Couscous cooks in minutes, making it one of the fastest side dishes for busy weeknights.",
  ingredients: `1 cup couscous
1 cup vegetable broth
1 tbsp olive oil
1 tbsp lemon juice
2 tbsp fresh parsley, chopped
1/2 tsp salt
1/4 tsp black pepper`,
  instructions: `Bring 1 cup vegetable broth to a boil in a small saucepan.

Remove from heat and stir in 1 cup couscous.

Cover and let stand for 5 minutes.

Fluff with a fork.

Stir in 1 tbsp olive oil, 1 tbsp lemon juice, 2 tbsp parsley, 1/2 tsp salt, and 1/4 tsp black pepper.

Serve warm.`,
  translations: {
    es: {
      name: "Cuscús con Limón y Hierbas",
      notes:
        "El cuscús se cocina en minutos, lo que lo convierte en una de las guarniciones más rápidas para noches ocupadas.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "cuscús",
        "rápido",
        "saludable",
        "meal-prep",
      ],
      ingredients: `1 cup de cuscús
1 cup de caldo de verduras
1 Tbsp de aceite de oliva
1 Tbsp de jugo de limón
2 Tbsp de perejil fresco picado
1/2 tsp de sal
1/4 tsp de pimienta negra`,
      instructions: `Lleva 1 cup de caldo de verduras a ebullición en una cacerola pequeña.

Retira del fuego y agrega 1 cup de cuscús.

Tapa y deja reposar durante 5 minutos.

Esponja con un tenedor.

Agrega 1 Tbsp de aceite de oliva, 1 Tbsp de jugo de limón, 2 Tbsp de perejil, 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Sirve caliente.`,
    },
  },
},

{
  id: "quick-cilantro-lime-rice",
  slug: "quick-cilantro-lime-rice",
  name: "Cilantro Lime Rice",
  effort: "quick",
  photoUrl: "/images/quick-cilantro-lime-rice.jpg",
  tags: [
    "side",
    "vegetarian",
    "rice",
    "mexican",
    "tex-mex",
    "family-friendly",
  ],
  isVegetarian: true,
  notes:
    "Bright, fresh, and citrusy, this rice pairs perfectly with tacos, burritos, fajitas, and grilled meats.",
  ingredients: `1 cup long-grain white rice
2 cups water
1 tbsp butter
1/2 tsp salt

Finish:
1 lime, juiced
1/4 cup fresh cilantro, chopped
1/2 tsp lime zest (optional)`,
  instructions: `Rinse 1 cup rice under cold water.

Combine rice, 2 cups water, 1 tbsp butter, and 1/2 tsp salt in a saucepan.

Bring to a boil over medium-high heat.

Reduce heat to low, cover, and simmer for 15 to 18 minutes.

Remove from heat and let stand covered for 5 minutes.

Fluff with a fork.

Stir in the juice of 1 lime, 1/4 cup cilantro, and lime zest if using.

Serve warm.`,
  translations: {
    es: {
      name: "Arroz con cilantro y lima",
      notes:
        "Fresco, brillante y lleno de sabor cítrico, este arroz combina perfectamente con tacos, burritos, fajitas y carnes a la parrilla.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "arroz",
        "mexicano",
        "tex-mex",
        "familiar",
      ],
      ingredients: `1 cup de arroz blanco de grano largo
2 cups de agua
1 Tbsp de mantequilla
1/2 tsp de sal

Final:
1 limón verde, exprimido
1/4 cup de cilantro fresco picado
1/2 tsp de ralladura de limón (opcional)`,
      instructions: `Enjuaga 1 cup de arroz bajo agua fría.

Combina el arroz, 2 cups de agua, 1 Tbsp de mantequilla y 1/2 tsp de sal en una cacerola.

Lleva a ebullición a fuego medio-alto.

Reduce el fuego a bajo, tapa y cocina de 15 a 18 minutos.

Retira del fuego y deja reposar tapado durante 5 minutos.

Esponja con un tenedor.

Agrega el jugo de 1 limón verde, 1/4 cup de cilantro y la ralladura si la usas.

Sirve caliente.`,
    },
  },
},

{
  id: "quick-creamy-macaroni-cheese",
  slug: "quick-creamy-macaroni-cheese",
  name: "Creamy Macaroni and Cheese",
  effort: "quick",
  photoUrl: "/images/quick-creamy-macaroni-cheese.jpg",
  tags: [
    "side",
    "vegetarian",
    "pasta",
    "mac-and-cheese",
    "comfort",
    "family-friendly",
    "kid-friendly",
  ],
  isVegetarian: true,
  notes:
    "The ultimate comfort food. Creamy, cheesy, and always a crowd favorite for weeknight dinners and holiday meals.",
  ingredients: `Pasta:
12 oz elbow macaroni

Cheese Sauce:
2 tbsp butter
2 tbsp flour
2 cups whole milk
2 cups cheddar cheese, shredded
1/2 tsp salt
1/4 tsp black pepper
1/4 tsp paprika`,
  instructions: `Bring a large pot of salted water to a boil.

Cook 12 oz elbow macaroni according to package directions.

Drain and set aside.

Melt 2 tbsp butter in a saucepan over medium heat.

Whisk in 2 tbsp flour and cook for 1 minute.

Slowly whisk in 2 cups milk until smooth.

Cook for 3 to 4 minutes until slightly thickened.

Add 2 cups cheddar cheese, 1/2 tsp salt, 1/4 tsp black pepper, and 1/4 tsp paprika.

Stir until smooth and creamy.

Add the cooked macaroni and stir until evenly coated.

Serve immediately.`,
  translations: {
    es: {
      name: "Macarrones con Queso Cremosos",
      notes:
        "La comida reconfortante por excelencia. Cremosa, llena de queso y siempre favorita en cenas familiares y comidas festivas.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "pasta",
        "macarrones con queso",
        "comfort",
        "familiar",
        "niños",
      ],
      ingredients: `Pasta:
12 oz de macarrones tipo elbow

Salsa de Queso:
2 Tbsp de mantequilla
2 Tbsp de harina
2 cups de leche entera
2 cups de queso cheddar rallado
1/2 tsp de sal
1/4 tsp de pimienta negra
1/4 tsp de paprika`,
      instructions: `Hierve una olla grande con agua y sal.

Cocina 12 oz de macarrones según las instrucciones del paquete.

Escurre y reserva.

Derrite 2 Tbsp de mantequilla en una cacerola a fuego medio.

Agrega 2 Tbsp de harina y cocina durante 1 minuto.

Incorpora lentamente 2 cups de leche batiendo constantemente.

Cocina de 3 a 4 minutos hasta que espese ligeramente.

Agrega 2 cups de queso cheddar, 1/2 tsp de sal, 1/4 tsp de pimienta negra y 1/4 tsp de paprika.

Revuelve hasta que quede suave y cremosa.

Agrega la pasta cocida y mezcla hasta cubrir completamente.

Sirve inmediatamente.`,
    },
  },
},

{
  id: "quick-classic-pasta-salad",
  slug: "quick-classic-pasta-salad",
  name: "Classic Pasta Salad",
  effort: "quick",
  photoUrl: "/images/quick-classic-pasta-salad.jpg",
  tags: [
    "side",
    "vegetarian",
    "pasta",
    "cold-side",
    "cookout",
    "summer",
    "meal-prep",
  ],
  isVegetarian: true,
  notes:
    "A refreshing cold pasta salad loaded with vegetables, cheese, and Italian dressing. Perfect for cookouts, picnics, and meal prep.",
  ingredients: `12 oz rotini pasta
1 cup cherry tomatoes, halved
1 cup cucumber, diced
1/2 cup red bell pepper, diced
1/2 cup black olives, sliced
1/2 cup mozzarella cheese cubes
3/4 cup Italian dressing
1/2 tsp salt
1/4 tsp black pepper`,
  instructions: `Cook 12 oz rotini according to package directions.

Drain and rinse under cold water until completely cooled.

Transfer pasta to a large bowl.

Add cherry tomatoes, cucumber, bell pepper, olives, and mozzarella cheese.

Pour in 3/4 cup Italian dressing.

Season with 1/2 tsp salt and 1/4 tsp black pepper.

Toss until evenly coated.

Refrigerate for at least 30 minutes before serving for best flavor.`,
  translations: {
    es: {
      name: "Ensalada de Pasta Clásica",
      notes:
        "Una ensalada de pasta fría y refrescante con verduras, queso y aderezo italiano. Perfecta para parrilladas, picnics y preparación de comidas.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "pasta",
        "frío",
        "parrillada",
        "verano",
        "meal-prep",
      ],
      ingredients: `12 oz de pasta rotini
1 cup de tomates cherry partidos por la mitad
1 cup de pepino en cubos
1/2 cup de pimiento rojo en cubos
1/2 cup de aceitunas negras en rodajas
1/2 cup de cubos de queso mozzarella
3/4 cup de aderezo italiano
1/2 tsp de sal
1/4 tsp de pimienta negra`,
      instructions: `Cocina 12 oz de pasta rotini según las instrucciones del paquete.

Escurre y enjuaga con agua fría hasta que esté completamente fría.

Transfiere la pasta a un tazón grande.

Agrega tomates cherry, pepino, pimiento, aceitunas y mozzarella.

Vierte 3/4 cup de aderezo italiano.

Sazona con 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Mezcla hasta cubrir uniformemente.

Refrigera durante al menos 30 minutos antes de servir para obtener mejor sabor.`,
    },
  },
},

{
  id: "quick-buttered-noodles",
  slug: "quick-buttered-noodles",
  name: "Buttered Noodles",
  effort: "quick",
  photoUrl: "/images/quick-buttered-noodles.jpg",
  tags: [
    "side",
    "vegetarian",
    "pasta",
    "comfort",
    "kid-friendly",
    "family-friendly",
  ],
  isVegetarian: true,
  notes:
    "Simple buttered noodles are a timeless comfort side dish that pairs well with chicken, beef, pork, and countless family meals.",
  ingredients: `12 oz egg noodles
4 tbsp butter
1/2 tsp salt
1/4 tsp black pepper
2 tbsp fresh parsley, chopped

Optional:
1/4 cup parmesan cheese`,
  instructions: `Bring a large pot of salted water to a boil.

Cook 12 oz egg noodles according to package directions.

Reserve 2 tbsp pasta water and drain the noodles.

Return noodles to the pot.

Add 4 tbsp butter and toss until melted.

Add reserved pasta water, 1/2 tsp salt, and 1/4 tsp black pepper.

Stir until glossy and evenly coated.

Sprinkle with parsley and parmesan cheese if desired.

Serve warm.`,
  translations: {
    es: {
      name: "Fideos con Mantequilla",
      notes:
        "Los fideos con mantequilla son una guarnición clásica y reconfortante que combina perfectamente con pollo, res, cerdo y muchas comidas familiares.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "pasta",
        "comfort",
        "niños",
        "familiar",
      ],
      ingredients: `12 oz de fideos de huevo
4 Tbsp de mantequilla
1/2 tsp de sal
1/4 tsp de pimienta negra
2 Tbsp de perejil fresco picado

Opcional:
1/4 cup de queso parmesano`,
      instructions: `Hierve una olla grande con agua y sal.

Cocina 12 oz de fideos de huevo según las instrucciones del paquete.

Reserva 2 Tbsp del agua de cocción y escurre los fideos.

Regresa los fideos a la olla.

Agrega 4 Tbsp de mantequilla y mezcla hasta que se derrita.

Agrega el agua reservada, 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Revuelve hasta que queden brillantes y bien cubiertos.

Espolvorea con perejil y queso parmesano si lo deseas.

Sirve caliente.`,
    },
  },
},

{
  id: "quick-soft-dinner-rolls",
  slug: "quick-soft-dinner-rolls",
  name: "Soft Dinner Rolls",
  effort: "quick",
  photoUrl: "/images/quick-soft-dinner-rolls.jpg",
  tags: [
    "side",
    "vegetarian",
    "bread",
    "rolls",
    "comfort",
    "holiday",
    "family-friendly",
  ],
  isVegetarian: true,
  notes:
    "Warm, fluffy dinner rolls are the perfect addition to holiday meals, soups, and comfort food dinners.",
  ingredients: `1 package refrigerated dinner rolls (12 count)
2 tbsp butter, melted

Optional:
1 tsp honey
1 tbsp fresh parsley, chopped`,
  instructions: `Preheat oven according to package directions.

Arrange dinner rolls on a baking sheet or in a baking dish.

Bake until golden brown and cooked through.

Brush immediately with 2 tbsp melted butter.

Add honey or parsley if desired.

Serve warm.`,
  translations: {
    es: {
      name: "Panecillos Suaves para la Cena",
      notes:
        "Los panecillos calientes y esponjosos son el complemento perfecto para comidas festivas, sopas y cenas reconfortantes.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "pan",
        "panecillos",
        "comfort",
        "festivo",
        "familiar",
      ],
      ingredients: `1 paquete de panecillos refrigerados (12 piezas)
2 Tbsp de mantequilla derretida

Opcional:
1 tsp de miel
1 Tbsp de perejil fresco picado`,
      instructions: `Precalienta el horno según las instrucciones del paquete.

Coloca los panecillos en una bandeja para hornear o molde.

Hornea hasta que estén dorados y completamente cocidos.

Barniza inmediatamente con 2 Tbsp de mantequilla derretida.

Agrega miel o perejil si lo deseas.

Sirve caliente.`,
    },
  },
},

{
  id: "quick-garlic-bread",
  slug: "quick-garlic-bread",
  name: "Garlic Bread",
  effort: "quick",
  photoUrl: "/images/quick-garlic-bread.jpg",
  tags: [
    "side",
    "vegetarian",
    "bread",
    "garlic",
    "comfort",
    "italian",
    "family-friendly",
  ],
  isVegetarian: true,
  notes:
    "Crispy on the outside and buttery inside, garlic bread is the perfect partner for pasta, soup, and salad.",
  ingredients: `1 loaf French bread or Italian bread
1/2 cup butter, softened
3 cloves garlic, minced
1 tbsp fresh parsley, chopped
1/4 tsp salt

Optional:
1/4 cup parmesan cheese`,
  instructions: `Preheat oven to 400°F.

Slice the loaf in half lengthwise.

In a bowl, combine 1/2 cup butter, 3 cloves garlic, 1 tbsp parsley, and 1/4 tsp salt.

Spread evenly over the cut sides of the bread.

Sprinkle with parmesan cheese if desired.

Bake for 10 to 12 minutes until hot and lightly golden.

For extra crispiness, broil for 1 to 2 minutes.

Slice and serve warm.`,
  translations: {
    es: {
      name: "Pan de Ajo",
      notes:
        "Crujiente por fuera y mantequilloso por dentro, el pan de ajo es el acompañamiento perfecto para pasta, sopa y ensaladas.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "pan",
        "ajo",
        "comfort",
        "italiano",
        "familiar",
      ],
      ingredients: `1 barra de pan francés o italiano
1/2 cup de mantequilla suavizada
3 dientes de ajo picados
1 Tbsp de perejil fresco picado
1/4 tsp de sal

Opcional:
1/4 cup de queso parmesano`,
      instructions: `Precalienta el horno a 400°F.

Corta el pan a lo largo por la mitad.

En un tazón mezcla 1/2 cup de mantequilla, 3 dientes de ajo, 1 Tbsp de perejil y 1/4 tsp de sal.

Unta la mezcla sobre las caras cortadas del pan.

Espolvorea parmesano si lo deseas.

Hornea de 10 a 12 minutos hasta que esté caliente y ligeramente dorado.

Para un acabado más crujiente, usa el asador durante 1 a 2 minutos.

Corta en rebanadas y sirve caliente.`,
    },
  },
},

{
  id: "quick-classic-cornbread",
  slug: "quick-classic-cornbread",
  name: "Classic Cornbread",
  effort: "quick",
  photoUrl: "/images/quick-classic-cornbread.jpg",
  tags: [
    "side",
    "vegetarian",
    "bread",
    "cornbread",
    "southern",
    "comfort",
    "family-friendly",
  ],
  isVegetarian: true,
  notes:
    "A Southern favorite with a lightly sweet flavor and tender crumb. Perfect with chili, barbecue, and hearty stews.",
  ingredients: `1 cup cornmeal
1 cup all-purpose flour
1/4 cup sugar
1 tbsp baking powder
1/2 tsp salt
1 cup milk
1/3 cup vegetable oil
1 large egg`,
  instructions: `Preheat oven to 400°F.

Grease an 8-inch baking dish or cast iron skillet.

In a large bowl, whisk together cornmeal, flour, sugar, baking powder, and salt.

In another bowl, whisk milk, oil, and egg.

Add wet ingredients to dry ingredients and stir until just combined.

Pour batter into the prepared pan.

Bake for 18 to 22 minutes until golden brown and a toothpick comes out clean.

Allow to cool slightly before serving.`,
  translations: {
    es: {
      name: "Pan de Maíz Clásico",
      notes:
        "Un favorito sureño con un sabor ligeramente dulce y una textura tierna. Perfecto con chili, barbacoa y guisos abundantes.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "pan",
        "pan de maíz",
        "sureño",
        "comfort",
        "familiar",
      ],
      ingredients: `1 cup de harina de maíz
1 cup de harina de trigo
1/4 cup de azúcar
1 Tbsp de polvo para hornear
1/2 tsp de sal
1 cup de leche
1/3 cup de aceite vegetal
1 huevo grande`,
      instructions: `Precalienta el horno a 400°F.

Engrasa un molde de 8 inches o una sartén de hierro fundido.

En un tazón grande mezcla harina de maíz, harina, azúcar, polvo para hornear y sal.

En otro tazón mezcla leche, aceite y huevo.

Agrega los ingredientes húmedos a los secos y mezcla solo hasta integrar.

Vierte la masa en el molde preparado.

Hornea de 18 a 22 minutos hasta que esté dorado y un palillo salga limpio.

Deja enfriar ligeramente antes de servir.`,
    },
  },
},

{
  id: "quick-buttery-biscuits",
  slug: "quick-buttery-biscuits",
  name: "Buttery Biscuits",
  effort: "quick",
  photoUrl: "/images/quick-buttery-biscuits.jpg",
  tags: [
    "side",
    "vegetarian",
    "bread",
    "biscuits",
    "southern",
    "comfort",
    "family-friendly",
  ],
  isVegetarian: true,
  notes:
    "Flaky, buttery biscuits with tender layers. Perfect for breakfast, dinner, or alongside soups and stews.",
  ingredients: `2 cups all-purpose flour
1 tbsp baking powder
1/2 tsp salt
6 tbsp cold butter, cubed
3/4 cup milk

Optional:
2 tbsp melted butter for brushing`,
  instructions: `Preheat oven to 425°F.

In a large bowl, whisk together flour, baking powder, and salt.

Cut in 6 tbsp cold butter until the mixture resembles coarse crumbs.

Pour in 3/4 cup milk and stir until a dough forms.

Turn onto a lightly floured surface and gently pat into a 1-inch thick rectangle.

Fold the dough over itself 3 to 4 times to create layers.

Cut into biscuits using a biscuit cutter or glass.

Place on a baking sheet and bake for 12 to 15 minutes until golden brown.

Brush with melted butter and serve warm.`,
  translations: {
    es: {
      name: "Biscuits de Mantequilla",
      notes:
        "Biscuits hojaldrados y mantequillosos con capas tiernas. Perfectos para desayunos, cenas o para acompañar sopas y guisos.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "pan",
        "biscuits",
        "sureño",
        "comfort",
        "familiar",
      ],
      ingredients: `2 cups de harina de trigo
1 Tbsp de polvo para hornear
1/2 tsp de sal
6 Tbsp de mantequilla fría en cubos
3/4 cup de leche

Opcional:
2 Tbsp de mantequilla derretida para barnizar`,
      instructions: `Precalienta el horno a 425°F.

En un tazón grande mezcla harina, polvo para hornear y sal.

Incorpora 6 Tbsp de mantequilla fría hasta obtener migas gruesas.

Agrega 3/4 cup de leche y mezcla hasta formar una masa.

Coloca la masa sobre una superficie ligeramente enharinada y aplánala hasta formar un rectángulo de aproximadamente 1 inch de grosor.

Dobla la masa sobre sí misma 3 o 4 veces para crear capas.

Corta los biscuits con un cortador o vaso.

Colócalos en una bandeja para hornear y hornea de 12 a 15 minutos hasta que estén dorados.

Barniza con mantequilla derretida y sirve caliente.`,
    },
  },
},

{
  id: "normal-baked-beans",
  slug: "normal-baked-beans",
  name: "Baked Beans",
  effort: "normal",
  photoUrl: "/images/normal-baked-beans.jpg",
  tags: ["side", "beans", "bbq", "comfort", "sweet", "cookout", "family-friendly"],
  isVegetarian: false,
  notes: "Sweet, savory, and smoky baked beans with brown sugar, bacon, and molasses. Perfect for barbecue, cookouts, and potlucks.",
  ingredients: `Beans:
2 (28 oz) cans baked beans
6 slices bacon, chopped
1/2 onion, diced

Sauce:
1/2 cup brown sugar
1/4 cup molasses
1/4 cup ketchup
1 tbsp yellow mustard
1 tbsp Worcestershire sauce
1/2 tsp black pepper`,
  instructions: `Preheat oven to 350°F.

Cook 6 slices chopped bacon in a skillet over medium heat until browned and slightly crisp.

Add 1/2 diced onion and cook for 3 to 4 minutes until softened.

In a baking dish, combine 2 cans baked beans, cooked bacon, onion, 1/2 cup brown sugar, 1/4 cup molasses, 1/4 cup ketchup, 1 tbsp mustard, 1 tbsp Worcestershire sauce, and 1/2 tsp black pepper.

Stir until well combined.

Bake uncovered for 45 to 55 minutes, until thick, glossy, and bubbling around the edges.

Let rest for 5 minutes before serving.`,
  translations: {
    es: {
      name: "Frijoles Horneados",
      notes: "Frijoles dulces, salados y ahumados con azúcar morena, tocino y melaza. Perfectos para barbacoa, parrilladas y reuniones familiares.",
      tags: ["acompañamiento", "frijoles", "bbq", "comfort", "dulce", "parrillada", "familiar"],
      ingredients: `Frijoles:
2 latas (28 oz) de frijoles horneados
6 rebanadas de tocino, picado
1/2 cebolla, picada

Salsa:
1/2 cup de azúcar morena
1/4 cup de melaza
1/4 cup de ketchup
1 Tbsp de mostaza amarilla
1 Tbsp de salsa Worcestershire
1/2 tsp de pimienta negra`,
      instructions: `Precalienta el horno a 350°F.

Cocina 6 rebanadas de tocino picado en una sartén a fuego medio hasta que esté dorado y ligeramente crujiente.

Agrega 1/2 cebolla picada y cocina de 3 a 4 minutos hasta que esté suave.

En un molde para hornear, mezcla 2 latas de frijoles horneados, tocino, cebolla, 1/2 cup de azúcar morena, 1/4 cup de melaza, 1/4 cup de ketchup, 1 Tbsp de mostaza, 1 Tbsp de salsa Worcestershire y 1/2 tsp de pimienta negra.

Revuelve hasta combinar bien.

Hornea sin tapar de 45 a 55 minutos, hasta que estén espesos, brillantes y burbujeando en los bordes.

Deja reposar 5 minutos antes de servir.`,
    },
  },
},

{
  id: "quick-seasoned-black-beans",
  slug: "quick-seasoned-black-beans",
  name: "Seasoned Black Beans",
  effort: "quick",
  photoUrl: "/images/quick-seasoned-black-beans.jpg",
  tags: ["side", "vegetarian", "beans", "black-beans", "mexican", "tex-mex", "quick"],
  isVegetarian: true,
  notes: "Simple black beans seasoned with garlic, onion, and cumin. Great next to tacos, rice bowls, enchiladas, or grilled meats.",
  ingredients: `Beans:
2 (15 oz) cans black beans, drained and rinsed
1 tbsp olive oil
1/2 onion, diced
2 cloves garlic, minced

Seasoning:
1 tsp cumin
1/2 tsp salt
1/4 tsp black pepper
1/2 cup vegetable broth or water

Optional:
1 tbsp lime juice
2 tbsp fresh cilantro, chopped`,
  instructions: `Heat 1 tbsp olive oil in a saucepan over medium heat.

Add 1/2 diced onion and cook for 3 to 4 minutes until softened.

Add 2 cloves minced garlic and cook for 30 seconds until fragrant.

Stir in 2 cans black beans, 1 tsp cumin, 1/2 tsp salt, 1/4 tsp black pepper, and 1/2 cup broth or water.

Simmer for 8 to 10 minutes, stirring occasionally, until the beans are warm and slightly thickened.

Finish with 1 tbsp lime juice and 2 tbsp cilantro if desired.

Serve warm.`,
  translations: {
    es: {
      name: "Frijoles Negros Sazonados",
      notes: "Frijoles negros sencillos sazonados con ajo, cebolla y comino. Perfectos con tacos, bowls de arroz, enchiladas o carnes a la parrilla.",
      tags: ["acompañamiento", "vegetariano", "frijoles", "frijoles negros", "mexicano", "tex-mex", "rápido"],
      ingredients: `Frijoles:
2 latas (15 oz) de frijoles negros, escurridos y enjuagados
1 Tbsp de aceite de oliva
1/2 cebolla, picada
2 dientes de ajo, picados

Sazonadores:
1 tsp de comino
1/2 tsp de sal
1/4 tsp de pimienta negra
1/2 cup de caldo de verduras o agua

Opcional:
1 Tbsp de jugo de limón
2 Tbsp de cilantro fresco, picado`,
      instructions: `Calienta 1 Tbsp de aceite de oliva en una cacerola a fuego medio.

Agrega 1/2 cebolla picada y cocina de 3 a 4 minutos hasta que esté suave.

Agrega 2 dientes de ajo picados y cocina 30 segundos hasta que estén fragantes.

Incorpora 2 latas de frijoles negros, 1 tsp de comino, 1/2 tsp de sal, 1/4 tsp de pimienta negra y 1/2 cup de caldo o agua.

Cocina a fuego lento de 8 a 10 minutos, revolviendo ocasionalmente, hasta que los frijoles estén calientes y ligeramente espesos.

Termina con 1 Tbsp de jugo de limón y 2 Tbsp de cilantro si deseas.

Sirve caliente.`,
    },
  },
},

{
  id: "quick-refried-beans",
  slug: "quick-refried-beans",
  name: "Refried Beans",
  effort: "quick",
  photoUrl: "/images/quick-refried-beans.jpg",
  tags: ["side", "vegetarian", "beans", "pinto-beans", "mexican", "tex-mex", "comfort"],
  isVegetarian: true,
  notes: "Creamy mashed pinto beans with simple seasoning. A classic side for tacos, burritos, enchiladas, and rice plates.",
  ingredients: `Beans:
2 (15 oz) cans pinto beans, drained and rinsed
1 tbsp olive oil or butter
1/2 onion, diced
2 cloves garlic, minced

Seasoning:
1 tsp cumin
1/2 tsp salt
1/4 tsp black pepper
1/2 cup vegetable broth or water

Optional:
1/2 cup cheddar cheese, shredded
2 tbsp cilantro, chopped`,
  instructions: `Heat 1 tbsp olive oil or butter in a skillet over medium heat.

Add 1/2 diced onion and cook for 3 to 4 minutes until softened.

Add 2 cloves minced garlic and cook for 30 seconds until fragrant.

Add 2 cans pinto beans, 1 tsp cumin, 1/2 tsp salt, 1/4 tsp black pepper, and 1/2 cup broth or water.

Simmer for 5 to 7 minutes until hot and slightly softened.

Mash the beans with a potato masher until mostly smooth, adding more broth if needed.

Stir in cheddar cheese if desired.

Garnish with cilantro and serve warm.`,
  translations: {
    es: {
      name: "Frijoles Refritos",
      notes: "Frijoles pintos machacados y cremosos con sazón sencilla. Un acompañamiento clásico para tacos, burritos, enchiladas y platos con arroz.",
      tags: ["acompañamiento", "vegetariano", "frijoles", "frijoles pintos", "mexicano", "tex-mex", "comfort"],
      ingredients: `Frijoles:
2 latas (15 oz) de frijoles pintos, escurridos y enjuagados
1 Tbsp de aceite de oliva o mantequilla
1/2 cebolla, picada
2 dientes de ajo, picados

Sazonadores:
1 tsp de comino
1/2 tsp de sal
1/4 tsp de pimienta negra
1/2 cup de caldo de verduras o agua

Opcional:
1/2 cup de queso cheddar rallado
2 Tbsp de cilantro picado`,
      instructions: `Calienta 1 Tbsp de aceite de oliva o mantequilla en una sartén a fuego medio.

Agrega 1/2 cebolla picada y cocina de 3 a 4 minutos hasta que esté suave.

Agrega 2 dientes de ajo picados y cocina 30 segundos hasta que estén fragantes.

Agrega 2 latas de frijoles pintos, 1 tsp de comino, 1/2 tsp de sal, 1/4 tsp de pimienta negra y 1/2 cup de caldo o agua.

Cocina a fuego lento de 5 a 7 minutos hasta que estén calientes y ligeramente suaves.

Machaca los frijoles con un machacador de papas hasta que estén casi suaves, agregando más caldo si es necesario.

Agrega queso cheddar si deseas.

Decora con cilantro y sirve caliente.`,
    },
  },
},

{
  id: "quick-greek-lemon-potatoes",
  slug: "quick-greek-lemon-potatoes",
  name: "Greek Lemon Potatoes",
  effort: "quick",
  photoUrl: "/images/quick-greek-lemon-potatoes.jpg",
  tags: [
    "side",
    "vegetarian",
    "potatoes",
    "greek",
    "roasted",
    "lemon",
    "family-friendly",
  ],
  isVegetarian: true,
  notes:
    "These Greek-style lemon potatoes are roasted until tender with bright citrus flavor, garlic, and herbs. They're especially delicious alongside chicken, lamb, or grilled seafood.",
  ingredients: `Potatoes:
2 lbs Yukon Gold potatoes, cut into wedges

Seasoning:
1/4 cup olive oil
1/4 cup fresh lemon juice
1 cup vegetable broth
3 cloves garlic, minced
1 tsp dried oregano
1 tsp salt
1/2 tsp black pepper

Optional:
1 tbsp fresh parsley, chopped
lemon wedges for serving`,
  instructions: `Preheat oven to 425°F.

Place 2 lbs potato wedges into a 9x13 baking dish or rimmed baking sheet.

In a bowl, whisk together 1/4 cup olive oil, 1/4 cup lemon juice, 1 cup broth, 3 cloves garlic, 1 tsp oregano, 1 tsp salt, and 1/2 tsp black pepper.

Pour the mixture over the potatoes and toss to coat evenly.

Arrange the potatoes in a single layer.

Roast for 40 to 50 minutes, turning once halfway through, until the potatoes are tender and the liquid has mostly absorbed.

For extra browning, broil for 2 to 3 minutes at the end if desired.

Garnish with parsley and serve with lemon wedges if desired.`,
  translations: {
    es: {
      name: "Papas Griegas al Limón",
      notes:
        "Estas papas estilo griego se rostizan hasta quedar tiernas con un brillante sabor a limón, ajo y hierbas. Son perfectas junto a pollo, cordero o mariscos a la parrilla.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "papas",
        "griego",
        "rostizado",
        "limón",
        "familiar",
      ],
      ingredients: `Papas:
2 lbs de papas Yukon Gold, cortadas en gajos

Sazonadores:
1/4 cup de aceite de oliva
1/4 cup de jugo de limón fresco
1 cup de caldo de pollo (o caldo de verduras)
3 dientes de ajo, picados
1 tsp de orégano seco
1 tsp de sal
1/2 tsp de pimienta negra

Opcional:
1 Tbsp de perejil fresco picado
gajos de limón para servir`,
      instructions: `Precalienta el horno a 425°F.

Coloca 2 lbs de papas en gajos en un molde de 9x13 o en una bandeja para hornear.

En un tazón, mezcla 1/4 cup de aceite de oliva, 1/4 cup de jugo de limón, 1 cup de caldo, 3 dientes de ajo, 1 tsp de orégano, 1 tsp de sal y 1/2 tsp de pimienta negra.

Vierte la mezcla sobre las papas y revuelve para cubrirlas uniformemente.

Acomoda las papas en una sola capa.

Hornea de 40 a 50 minutos, volteándolas una vez a mitad de cocción, hasta que estén tiernas y el líquido se haya absorbido casi por completo.

Para un acabado más dorado, usa el asador durante 2 a 3 minutos al final si lo deseas.

Decora con perejil y sirve con gajos de limón si lo deseas.`,
    },
  },
},

{
  id: "quick-classic-side-salad",
  slug: "quick-classic-side-salad",
  name: "Classic Side Salad",
  effort: "quick",
  photoUrl: "/images/quick-classic-side-salad.jpg",
  tags: [
    "side",
    "vegetarian",
    "salad",
    "healthy",
    "fresh",
    "quick",
    "family-friendly",
  ],
  isVegetarian: true,
  notes:
    "A simple, fresh side salad that pairs well with almost any meal. Easily customize with your favorite vegetables, cheese, or dressing.",
  ingredients: `Salad:
1 head romaine lettuce, chopped
1 cup cherry tomatoes, halved
1 cucumber, sliced
1/4 cup red onion, thinly sliced
1/2 cup croutons

Dressing:
1/4 cup Italian dressing

Optional:
1/4 cup shredded cheddar cheese
1/4 cup parmesan cheese
sliced olives`,
  instructions: `Wash and dry the romaine lettuce thoroughly.

Place lettuce, cherry tomatoes, cucumber, and red onion into a large bowl.

Add 1/2 cup croutons.

Drizzle with 1/4 cup Italian dressing.

Toss gently until evenly coated.

Top with cheese or olives if desired.

Serve immediately while fresh and crisp.`,
  translations: {
    es: {
      name: "Ensalada de Acompañamiento Clásica",
      notes:
        "Una ensalada fresca y sencilla que combina con casi cualquier comida. Fácil de personalizar con tus verduras, quesos o aderezos favoritos.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "ensalada",
        "saludable",
        "fresco",
        "rápido",
        "familiar",
      ],
      ingredients: `Ensalada:
1 cabeza de lechuga romana, picada
1 cup de tomates cherry, partidos por la mitad
1 pepino, en rodajas
1/4 cup de cebolla morada, en rodajas finas
1/2 cup de crutones

Aderezo:
1/4 cup de aderezo italiano

Opcional:
1/4 cup de queso cheddar rallado
1/4 cup de queso parmesano
aceitunas en rodajas`,
      instructions: `Lava y seca bien la lechuga romana.

Coloca la lechuga, los tomates cherry, el pepino y la cebolla morada en un tazón grande.

Agrega 1/2 cup de crutones.

Rocía con 1/4 cup de aderezo italiano.

Mezcla suavemente hasta cubrir uniformemente.

Agrega queso o aceitunas si lo deseas.

Sirve inmediatamente mientras esté fresca y crujiente.`,
    },
  },
},

{
  id: "quick-classic-coleslaw",
  slug: "quick-classic-coleslaw",
  name: "Classic Coleslaw",
  effort: "quick",
  photoUrl: "/images/quick-classic-coleslaw.jpg",
  tags: ["side", "vegetarian", "slaw", "bbq", "cookout", "fresh", "family-friendly"],
  isVegetarian: true,
  notes: "A cool, creamy, crunchy side that pairs perfectly with barbecue, fried chicken, burgers, and sandwiches.",
  ingredients: `Slaw:
1 (14 oz) bag coleslaw mix
1/4 cup red onion, thinly sliced

Dressing:
1/2 cup mayonnaise
2 tbsp apple cider vinegar
1 tbsp sugar
1 tsp Dijon mustard
1/2 tsp salt
1/4 tsp black pepper`,
  instructions: `In a large bowl, combine 1 bag coleslaw mix and 1/4 cup sliced red onion.

In a separate bowl, whisk together 1/2 cup mayonnaise, 2 tbsp apple cider vinegar, 1 tbsp sugar, 1 tsp Dijon mustard, 1/2 tsp salt, and 1/4 tsp black pepper until smooth.

Pour the dressing over the coleslaw mix.

Toss until the cabbage is evenly coated.

Refrigerate for at least 20 minutes before serving for best flavor.

Stir again before serving.`,
  translations: {
    es: {
      name: "Ensalada de Col Clásica",
      notes: "Una guarnición fresca, cremosa y crujiente que combina perfectamente con barbacoa, pollo frito, hamburguesas y sándwiches.",
      tags: ["acompañamiento", "vegetariano", "ensalada de col", "bbq", "parrillada", "fresco", "familiar"],
      ingredients: `Ensalada:
1 bolsa (14 oz) de mezcla para coleslaw
1/4 cup de cebolla morada, en rodajas finas

Aderezo:
1/2 cup de mayonesa
2 Tbsp de vinagre de manzana
1 Tbsp de azúcar
1 tsp de mostaza Dijon
1/2 tsp de sal
1/4 tsp de pimienta negra`,
      instructions: `En un tazón grande, mezcla 1 bolsa de coleslaw y 1/4 cup de cebolla morada.

En otro tazón, bate 1/2 cup de mayonesa, 2 Tbsp de vinagre de manzana, 1 Tbsp de azúcar, 1 tsp de mostaza Dijon, 1/2 tsp de sal y 1/4 tsp de pimienta negra hasta que quede suave.

Vierte el aderezo sobre la mezcla de col.

Revuelve hasta que la col esté cubierta uniformemente.

Refrigera por lo menos 20 minutos antes de servir para mejor sabor.

Revuelve nuevamente antes de servir.`,
    },
  },
},

{
  id: "quick-classic-dill-pickles",
  slug: "quick-classic-dill-pickles",
  name: "Classic Dill Pickles",
  effort: "quick",
  photoUrl: "/images/quick-classic-dill-pickles.jpg",
  tags: [
    "side",
    "vegetarian",
    "pickles",
    "condiment",
    "snack",
    "make-ahead",
    "low-calorie",
  ],
  isVegetarian: true,
  notes:
    "These crisp, tangy refrigerator pickles are easy to make and pair perfectly with burgers, sandwiches, barbecue, and charcuterie boards.",
  ingredients: `Pickles:
4 small cucumbers, sliced into spears or rounds

Brine:
1 cup water
1 cup white vinegar
1 tbsp kosher salt
1 tbsp sugar

Flavorings:
2 cloves garlic, smashed
1 tsp dill seed
2 tbsp fresh dill
1/2 tsp black peppercorns

Optional:
1/4 tsp red pepper flakes`,
  instructions: `Place 4 sliced cucumbers into a clean quart-sized jar or airtight container.

Add 2 smashed garlic cloves, 1 tsp dill seed, 2 tbsp fresh dill, and 1/2 tsp peppercorns.

In a small saucepan, combine 1 cup water, 1 cup vinegar, 1 tbsp kosher salt, and 1 tbsp sugar.

Heat over medium heat, stirring until the salt and sugar dissolve.

Remove from heat and allow the brine to cool for 10 minutes.

Pour the brine over the cucumbers until fully submerged.

Add red pepper flakes if desired.

Cover and refrigerate for at least 24 hours before serving.

For best flavor, allow the pickles to sit for 2 to 3 days before enjoying.`,
  translations: {
    es: {
      name: "Pepinillos Clásicos con Eneldo",
      notes:
        "Estos pepinillos crujientes y ácidos son fáciles de preparar y combinan perfectamente con hamburguesas, sándwiches, barbacoa y tablas de aperitivos.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "pepinillos",
        "condimento",
        "botana",
        "preparar con anticipación",
        "bajo en calorías",
      ],
      ingredients: `Pepinillos:
4 pepinos pequeños, cortados en tiras o rodajas

Salmuera:
1 cup de agua
1 cup de vinagre blanco
1 Tbsp de sal kosher
1 Tbsp de azúcar

Saborizantes:
2 dientes de ajo aplastados
1 tsp de semillas de eneldo
2 Tbsp de eneldo fresco
1/2 tsp de granos de pimienta negra

Opcional:
1/4 tsp de hojuelas de chile rojo`,
      instructions: `Coloca 4 pepinos cortados en un frasco limpio o recipiente hermético.

Agrega 2 dientes de ajo, 1 tsp de semillas de eneldo, 2 Tbsp de eneldo fresco y 1/2 tsp de granos de pimienta.

En una cacerola pequeña, combina 1 cup de agua, 1 cup de vinagre, 1 Tbsp de sal kosher y 1 Tbsp de azúcar.

Calienta a fuego medio, revolviendo hasta disolver la sal y el azúcar.

Retira del fuego y deja enfriar durante 10 minutos.

Vierte la salmuera sobre los pepinos hasta cubrirlos completamente.

Agrega hojuelas de chile rojo si lo deseas.

Tapa y refrigera durante al menos 24 horas antes de servir.

Para obtener el mejor sabor, deja reposar los pepinillos de 2 a 3 días antes de disfrutarlos.`,
    },
  },
},

{
  id: "quick-simple-green-salad",
  slug: "quick-simple-green-salad",
  name: "Simple Green Salad",
  effort: "quick",
  photoUrl: "/images/quick-simple-green-salad.jpg",
  tags: [
    "side",
    "vegetarian",
    "salad",
    "healthy",
    "fresh",
    "quick",
    "family-friendly",
  ],
  isVegetarian: true,
  notes:
    "A light, fresh green salad that pairs with almost any meal. Simple ingredients and a quick vinaigrette keep it crisp and refreshing.",
  ingredients: `Salad:
5 oz mixed greens or spring mix
1 cucumber, sliced
1 cup cherry tomatoes, halved

Vinaigrette:
2 tbsp olive oil
1 tbsp red wine vinegar
1/2 tsp Dijon mustard
1/4 tsp salt
1/4 tsp black pepper

Optional:
1/4 cup croutons
1/4 cup shredded parmesan cheese`,
  instructions: `Wash and dry the greens thoroughly.

Place mixed greens, cucumber, and cherry tomatoes into a large salad bowl.

In a small bowl, whisk together 2 tbsp olive oil, 1 tbsp red wine vinegar, 1/2 tsp Dijon mustard, 1/4 tsp salt, and 1/4 tsp black pepper.

Drizzle the vinaigrette over the salad.

Toss gently until evenly coated.

Top with croutons or parmesan cheese if desired.

Serve immediately while fresh and crisp.`,
  translations: {
    es: {
      name: "Ensalada Verde Sencilla",
      notes:
        "Una ensalada verde ligera y fresca que combina con casi cualquier comida. Ingredientes simples y una vinagreta rápida la mantienen crujiente y refrescante.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "ensalada",
        "saludable",
        "fresco",
        "rápido",
        "familiar",
      ],
      ingredients: `Ensalada:
5 oz de mezcla de hojas verdes o spring mix
1 pepino, en rodajas
1 cup de tomates cherry, partidos por la mitad

Vinagreta:
2 Tbsp de aceite de oliva
1 Tbsp de vinagre de vino tinto
1/2 tsp de mostaza Dijon
1/4 tsp de sal
1/4 tsp de pimienta negra

Opcional:
1/4 cup de crutones
1/4 cup de queso parmesano rallado`,
      instructions: `Lava y seca bien las hojas verdes.

Coloca las hojas verdes, el pepino y los tomates cherry en un tazón grande.

En un recipiente pequeño, bate 2 Tbsp de aceite de oliva, 1 Tbsp de vinagre de vino tinto, 1/2 tsp de mostaza Dijon, 1/4 tsp de sal y 1/4 tsp de pimienta negra.

Rocía la vinagreta sobre la ensalada.

Mezcla suavemente hasta cubrir uniformemente.

Agrega crutones o queso parmesano si lo deseas.

Sirve inmediatamente mientras esté fresca y crujiente.`,
    },
  },
},

{
  id: "quick-avocado-slices",
  slug: "quick-avocado-slices",
  name: "Avocado Slices",
  effort: "quick",
  photoUrl: "/images/quick-avocado-slices.jpg",
  tags: [
    "side",
    "vegetarian",
    "avocado",
    "healthy",
    "fresh",
    "quick",
    "low-carb",
  ],
  isVegetarian: true,
  notes:
    "Simple avocado slices add creamy texture and fresh flavor to tacos, grilled meats, sandwiches, rice bowls, and salads.",
  ingredients: `2 ripe avocados
1 tbsp lime juice
1/4 tsp salt
1/8 tsp black pepper

Optional:
1 tbsp cilantro, chopped
pinch of chili powder`,
  instructions: `Cut 2 ripe avocados in half and remove the pits.

Carefully slice each avocado into thin slices.

Transfer to a serving plate.

Drizzle with 1 tbsp lime juice.

Sprinkle with 1/4 tsp salt and 1/8 tsp black pepper.

Top with cilantro or chili powder if desired.

Serve immediately.`,
  translations: {
    es: {
      name: "Rebanadas de Aguacate",
      notes:
        "Las rebanadas de aguacate aportan una textura cremosa y un sabor fresco que combina perfectamente con tacos, carnes a la parrilla, sándwiches, bowls de arroz y ensaladas.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "aguacate",
        "saludable",
        "fresco",
        "rápido",
        "bajo en carbohidratos",
      ],
      ingredients: `2 aguacates maduros
1 Tbsp de jugo de limón verde
1/4 tsp de sal
1/8 tsp de pimienta negra

Opcional:
1 Tbsp de cilantro picado
pizca de chile en polvo`,
      instructions: `Corta 2 aguacates maduros por la mitad y retira los huesos.

Corta cuidadosamente cada mitad en rebanadas finas.

Colócalas en un plato para servir.

Rocía con 1 Tbsp de jugo de limón verde.

Espolvorea con 1/4 tsp de sal y 1/8 tsp de pimienta negra.

Agrega cilantro o chile en polvo si lo deseas.

Sirve inmediatamente.`,
    },
  },
},

{
  id: "quick-buttered-toast",
  slug: "quick-buttered-toast",
  name: "Buttered Toast",
  effort: "quick",
  photoUrl: "/images/quick-buttered-toast.jpg",
  tags: [
    "side",
    "vegetarian",
    "bread",
    "toast",
    "quick",
    "breakfast",
    "family-friendly",
  ],
  isVegetarian: true,
  notes:
    "Simple golden toast with melted butter. A classic side for breakfast, soups, eggs, and comfort-food meals.",
  ingredients: `4 slices sandwich bread
2 tbsp butter, softened

Optional:
jam
honey
cinnamon sugar
peanut butter`,
  instructions: `Preheat a toaster or toaster oven.

Toast 4 slices of bread until golden brown and crisp.

Spread 2 tbsp softened butter evenly over the warm toast.

Top with jam, honey, cinnamon sugar, or peanut butter if desired.

Serve immediately while warm.`,
  translations: {
    es: {
      name: "Pan Tostado con Mantequilla",
      notes:
        "Pan tostado dorado con mantequilla derretida. Un acompañamiento clásico para desayunos, sopas, huevos y comidas reconfortantes.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "pan",
        "tostada",
        "rápido",
        "desayuno",
        "familiar",
      ],
      ingredients: `4 rebanadas de pan de molde
2 Tbsp de mantequilla suave

Opcional:
mermelada
miel
azúcar con canela
mantequilla de cacahuate`,
      instructions: `Precalienta una tostadora o un horno tostador.

Tuesta 4 rebanadas de pan hasta que estén doradas y crujientes.

Unta 2 Tbsp de mantequilla sobre el pan caliente.

Agrega mermelada, miel, azúcar con canela o mantequilla de cacahuate si lo deseas.

Sirve inmediatamente mientras esté caliente.`,
    },
  },
},

{
  id: "quick-classic-tomato-soup",
  slug: "quick-classic-tomato-soup",
  name: "Classic Tomato Soup",
  effort: "quick",
  photoUrl: "/images/quick-classic-tomato-soup.jpg",
  tags: [
    "side",
    "vegetarian",
    "soup",
    "comfort",
    "family-friendly",
    "one-pot",
    "quick",
  ],
  isVegetarian: true,
  notes:
    "Smooth, comforting tomato soup that's perfect with grilled cheese sandwiches, crackers, or crusty bread. A timeless family favorite.",
  ingredients: `Soup:
2 tbsp butter
1 small onion, diced
2 cloves garlic, minced
1 (28 oz) can crushed tomatoes
2 cups vegetable broth

Seasoning:
1 tsp sugar
1/2 tsp salt
1/4 tsp black pepper
1/2 tsp dried basil

Finish:
1/2 cup heavy cream or half-and-half

Optional:
fresh basil
croutons
shredded parmesan cheese`,
  instructions: `Melt 2 tbsp butter in a large pot over medium heat.

Add 1 diced onion and cook for 4 to 5 minutes until softened.

Add 2 cloves minced garlic and cook for 30 seconds until fragrant.

Stir in 1 can crushed tomatoes and 2 cups vegetable broth.

Add 1 tsp sugar, 1/2 tsp salt, 1/4 tsp black pepper, and 1/2 tsp dried basil.

Bring to a gentle simmer and cook for 15 minutes.

Use an immersion blender to blend until smooth, or carefully blend in batches using a blender.

Stir in 1/2 cup heavy cream.

Cook for 2 more minutes until heated through.

Serve warm with basil, croutons, or parmesan cheese if desired.`,
  translations: {
    es: {
      name: "Sopa Clásica de Tomate",
      notes:
        "Una sopa de tomate suave y reconfortante, perfecta con sándwiches de queso a la parrilla, galletas saladas o pan crujiente. Un clásico favorito de toda la familia.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "sopa",
        "comfort",
        "familiar",
        "una olla",
        "rápido",
      ],
      ingredients: `Sopa:
2 Tbsp de mantequilla
1 cebolla pequeña, picada
2 dientes de ajo, picados
1 lata (28 oz) de tomates triturados
2 cups de caldo de verduras

Sazonadores:
1 tsp de azúcar
1/2 tsp de sal
1/4 tsp de pimienta negra
1/2 tsp de albahaca seca

Final:
1/2 cup de crema espesa o half-and-half

Opcional:
albahaca fresca
crutones
queso parmesano rallado`,
      instructions: `Derrite 2 Tbsp de mantequilla en una olla grande a fuego medio.

Agrega 1 cebolla picada y cocina de 4 a 5 minutos hasta que esté suave.

Agrega 2 dientes de ajo picados y cocina durante 30 segundos hasta que estén fragantes.

Incorpora 1 lata de tomates triturados y 2 cups de caldo de verduras.

Agrega 1 tsp de azúcar, 1/2 tsp de sal, 1/4 tsp de pimienta negra y 1/2 tsp de albahaca seca.

Lleva a fuego lento y cocina durante 15 minutos.

Usa una licuadora de inmersión para triturar hasta obtener una textura suave, o licúa cuidadosamente en tandas.

Agrega 1/2 cup de crema espesa.

Cocina 2 minutos más hasta que esté caliente.

Sirve caliente con albahaca, crutones o queso parmesano si lo deseas.`,
    },
  },
},

{
  id: "quick-apple-slices",
  slug: "quick-apple-slices",
  name: "Apple Slices",
  effort: "quick",
  photoUrl: "/images/quick-apple-slices.jpg",
  tags: [
    "side",
    "vegetarian",
    "fruit",
    "healthy",
    "fresh",
    "quick",
    "kid-friendly",
  ],
  isVegetarian: true,
  notes:
    "Fresh apple slices are a simple, naturally sweet side that pairs well with sandwiches, pork dishes, lunch boxes, and snacks.",
  ingredients: `2 apples (Honeycrisp, Gala, Fuji, or Granny Smith)
1 tbsp lemon juice

Optional:
1 tbsp peanut butter
1 tbsp caramel dip
1/4 tsp cinnamon`,
  instructions: `Wash and dry 2 apples thoroughly.

Cut each apple into thin slices or wedges.

Remove and discard the core.

Toss the apple slices with 1 tbsp lemon juice to help prevent browning.

Arrange on a serving plate.

Serve plain or with peanut butter, caramel dip, or a sprinkle of cinnamon if desired.`,
  translations: {
    es: {
      name: "Rodajas de Manzana",
      notes:
        "Las rodajas de manzana frescas son una guarnición simple y naturalmente dulce que combina perfectamente con sándwiches, platos de cerdo, almuerzos y refrigerios.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "fruta",
        "saludable",
        "fresco",
        "rápido",
        "niños",
      ],
      ingredients: `2 manzanas (Honeycrisp, Gala, Fuji o Granny Smith)
1 Tbsp de jugo de limón

Opcional:
1 Tbsp de mantequilla de cacahuate
1 Tbsp de salsa de caramelo
1/4 tsp de canela`,
      instructions: `Lava y seca bien 2 manzanas.

Corta cada manzana en rodajas finas o gajos.

Retira y desecha el corazón.

Mezcla las rodajas con 1 Tbsp de jugo de limón para ayudar a evitar que se oscurezcan.

Colócalas en un plato para servir.

Sirve solas o con mantequilla de cacahuate, salsa de caramelo o una pizca de canela si lo deseas.`,
    },
  },
},

{
  id: "quick-celery-sticks",
  slug: "quick-celery-sticks",
  name: "Celery Sticks",
  effort: "quick",
  photoUrl: "/images/quick-celery-sticks.jpg",
  tags: [
    "side",
    "vegetarian",
    "vegetables",
    "healthy",
    "fresh",
    "quick",
    "low-calorie",
  ],
  isVegetarian: true,
  notes:
    "Crunchy, refreshing celery sticks are a simple healthy side dish that pairs well with wings, sandwiches, soups, and snack platters.",
  ingredients: `1 bunch celery
1 cup cold water

Optional:
1/4 cup ranch dressing
1/4 cup peanut butter
1/4 cup hummus
1/4 cup cream cheese`,
  instructions: `Wash the celery thoroughly under cold running water.

Trim the ends and remove any damaged stalks.

Cut the celery into sticks about 3 to 4 inches long.

Place the celery sticks in a bowl of cold water for 10 minutes for extra crispness.

Drain and pat dry.

Arrange on a serving plate.

Serve plain or with ranch dressing, peanut butter, hummus, or cream cheese if desired.`,
  translations: {
    es: {
      name: "Palitos de Apio",
      notes:
        "Los palitos de apio son crujientes, refrescantes y una opción saludable que combina perfectamente con alitas, sándwiches, sopas y bandejas de aperitivos.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "verduras",
        "saludable",
        "fresco",
        "rápido",
        "bajo en calorías",
      ],
      ingredients: `1 manojo de apio
1 cup de agua fría

Opcional:
1/4 cup de aderezo ranch
1/4 cup de mantequilla de cacahuate
1/4 cup de hummus
1/4 cup de queso crema`,
      instructions: `Lava bien el apio bajo agua fría.

Recorta los extremos y retira los tallos dañados.

Corta el apio en palitos de aproximadamente 3 a 4 inches de largo.

Coloca los palitos en un recipiente con agua fría durante 10 minutos para que queden más crujientes.

Escurre y seca ligeramente.

Acomoda en un plato para servir.

Sirve solo o con aderezo ranch, mantequilla de cacahuate, hummus o queso crema si lo deseas.`,
    },
  },
},

{
  id: "quick-carrot-sticks",
  slug: "quick-carrot-sticks",
  name: "Carrot Sticks",
  effort: "quick",
  photoUrl: "/images/quick-carrot-sticks.jpg",
  tags: [
    "side",
    "vegetarian",
    "vegetables",
    "healthy",
    "fresh",
    "quick",
    "kid-friendly",
  ],
  isVegetarian: true,
  notes:
    "Crunchy, naturally sweet carrot sticks are a simple and healthy side dish that pairs well with sandwiches, wraps, lunch boxes, and snack platters.",
  ingredients: `4 large carrots, peeled

Optional:
1/4 cup ranch dressing
1/4 cup hummus
1/4 cup peanut butter
1/4 tsp ranch seasoning`,
  instructions: `Wash and peel 4 large carrots.

Trim the ends.

Cut the carrots into sticks about 3 to 4 inches long and 1/2 inch thick.

Place the carrot sticks in a bowl of ice water for 10 minutes for extra crispness if desired.

Drain and pat dry.

Arrange on a serving plate.

Serve plain or with ranch dressing, hummus, or peanut butter for dipping.`,
  translations: {
    es: {
      name: "Palitos de Zanahoria",
      notes:
        "Los palitos de zanahoria son crujientes, naturalmente dulces y una opción saludable que combina perfectamente con sándwiches, wraps, almuerzos y bandejas de aperitivos.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "verduras",
        "saludable",
        "fresco",
        "rápido",
        "niños",
      ],
      ingredients: `4 zanahorias grandes, peladas

Opcional:
1/4 cup de aderezo ranch
1/4 cup de hummus
1/4 cup de mantequilla de cacahuate
1/4 tsp de sazonador ranch`,
      instructions: `Lava y pela 4 zanahorias grandes.

Recorta los extremos.

Corta las zanahorias en palitos de aproximadamente 3 a 4 inches de largo y 1/2 inch de grosor.

Coloca los palitos en un recipiente con agua helada durante 10 minutos para obtener una textura más crujiente si lo deseas.

Escurre y seca ligeramente.

Acomoda en un plato para servir.

Sirve solos o con aderezo ranch, hummus o mantequilla de cacahuate para acompañar.`,
    },
  },
},

{
  id: "quick-classic-fruit-salad",
  slug: "quick-classic-fruit-salad",
  name: "Classic Fruit Salad",
  effort: "quick",
  photoUrl: "/images/quick-classic-fruit-salad.jpg",
  tags: [
    "side",
    "vegetarian",
    "fruit",
    "healthy",
    "fresh",
    "quick",
    "family-friendly",
  ],
  isVegetarian: true,
  notes:
    "A colorful mix of fresh fruit that's naturally sweet, refreshing, and perfect for breakfast, brunch, cookouts, or as a light side dish.",
  ingredients: `Fruit:
2 cups strawberries, sliced
1 cup blueberries
1 cup grapes, halved
2 apples, diced
2 oranges, peeled and segmented

Dressing:
1 tbsp honey
1 tbsp lime juice

Optional:
1 tbsp fresh mint, chopped`,
  instructions: `Wash all fruit thoroughly.

Slice 2 cups strawberries, halve 1 cup grapes, dice 2 apples, and segment 2 oranges.

Place all fruit into a large mixing bowl.

In a small bowl, whisk together 1 tbsp honey and 1 tbsp lime juice.

Pour the dressing over the fruit.

Gently toss until evenly coated.

Sprinkle with fresh mint if desired.

Serve immediately or refrigerate until ready to serve.`,
  translations: {
    es: {
      name: "Ensalada de Frutas Clásica",
      notes:
        "Una colorida mezcla de frutas frescas, naturalmente dulce y refrescante. Perfecta para desayunos, brunch, parrilladas o como acompañamiento ligero.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "fruta",
        "saludable",
        "fresco",
        "rápido",
        "familiar",
      ],
      ingredients: `Fruta:
2 cups de fresas, en rodajas
1 cup de arándanos
1 cup de uvas, cortadas por la mitad
2 manzanas, en cubos
2 naranjas, peladas y en gajos

Aderezo:
1 Tbsp de miel
1 Tbsp de jugo de limón verde

Opcional:
1 Tbsp de menta fresca picada`,
      instructions: `Lava bien toda la fruta.

Corta 2 cups de fresas, parte 1 cup de uvas por la mitad, corta 2 manzanas en cubos y separa 2 naranjas en gajos.

Coloca toda la fruta en un tazón grande.

En un recipiente pequeño, mezcla 1 Tbsp de miel y 1 Tbsp de jugo de limón verde.

Vierte el aderezo sobre la fruta.

Revuelve suavemente hasta cubrir uniformemente.

Espolvorea con menta fresca si lo deseas.

Sirve inmediatamente o refrigera hasta el momento de servir.`,
    },
  },
},

{
  id: "quick-steamed-rice",
  slug: "quick-steamed-rice",
  name: "Steamed Rice",
  effort: "quick",
  photoUrl: "/images/quick-steamed-rice.jpg",
  tags: [
    "side",
    "vegetarian",
    "rice",
    "simple",
    "healthy",
    "family-friendly",
    "meal-prep",
  ],
  isVegetarian: true,
  notes:
    "Light, fluffy steamed rice is a versatile side dish that pairs perfectly with stir-fries, curries, grilled meats, and countless family meals.",
  ingredients: `1 cup long-grain white rice
2 cups water
1/2 tsp salt

Optional:
1 tbsp butter
1 tbsp fresh parsley, chopped`,
  instructions: `Rinse 1 cup rice under cold water until the water runs mostly clear.

Combine rice, 2 cups water, and 1/2 tsp salt in a medium saucepan.

Bring to a boil over medium-high heat.

Reduce heat to low, cover tightly, and simmer for 15 to 18 minutes until the water is absorbed.

Remove from heat and let stand covered for 5 minutes.

Fluff gently with a fork.

Stir in 1 tbsp butter if desired.

Serve warm.`,
  translations: {
    es: {
      name: "Arroz al Vapor",
      notes:
        "El arroz al vapor es ligero, esponjoso y muy versátil. Combina perfectamente con salteados, curries, carnes a la parrilla y muchas comidas familiares.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "arroz",
        "simple",
        "saludable",
        "familiar",
        "meal-prep",
      ],
      ingredients: `1 cup de arroz blanco de grano largo
2 cups de agua
1/2 tsp de sal

Opcional:
1 Tbsp de mantequilla
1 Tbsp de perejil fresco picado`,
      instructions: `Enjuaga 1 cup de arroz bajo agua fría hasta que el agua salga casi transparente.

Combina el arroz, 2 cups de agua y 1/2 tsp de sal en una cacerola mediana.

Lleva a ebullición a fuego medio-alto.

Reduce el fuego a bajo, tapa bien y cocina de 15 a 18 minutos hasta que el agua se absorba.

Retira del fuego y deja reposar tapado durante 5 minutos.

Esponja suavemente con un tenedor.

Agrega 1 Tbsp de mantequilla si lo deseas.

Sirve caliente.`,
    },
  },
},

{
  id: "quick-classic-cucumber-salad",
  slug: "quick-classic-cucumber-salad",
  name: "Classic Cucumber Salad",
  effort: "quick",
  photoUrl: "/images/quick-classic-cucumber-salad.jpg",
  tags: [
    "side",
    "vegetarian",
    "salad",
    "cucumber",
    "healthy",
    "fresh",
    "quick",
  ],
  isVegetarian: true,
  notes:
    "A cool and refreshing cucumber salad with a light tangy dressing. Perfect alongside grilled meats, sandwiches, barbecue, or summer dinners.",
  ingredients: `Salad:
2 large cucumbers, thinly sliced
1/4 red onion, thinly sliced

Dressing:
3 tbsp apple cider vinegar
1 tbsp olive oil
1 tsp sugar
1/2 tsp salt
1/4 tsp black pepper

Optional:
1 tbsp fresh dill, chopped
1 tbsp fresh parsley, chopped`,
  instructions: `Wash and thinly slice 2 cucumbers.

Thinly slice 1/4 red onion.

Place cucumbers and onion in a large bowl.

In a small bowl, whisk together 3 tbsp apple cider vinegar, 1 tbsp olive oil, 1 tsp sugar, 1/2 tsp salt, and 1/4 tsp black pepper.

Pour the dressing over the vegetables.

Toss until evenly coated.

Refrigerate for 15 to 30 minutes before serving for the best flavor.

Garnish with fresh dill or parsley if desired.

Serve chilled.`,
  translations: {
    es: {
      name: "Ensalada Clásica de Pepino",
      notes:
        "Una ensalada de pepino fresca y refrescante con un aderezo ligero y ácido. Perfecta para acompañar carnes a la parrilla, sándwiches, barbacoa o cenas de verano.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "ensalada",
        "pepino",
        "saludable",
        "fresco",
        "rápido",
      ],
      ingredients: `Ensalada:
2 pepinos grandes, en rodajas finas
1/4 cebolla morada, en rodajas finas

Aderezo:
3 Tbsp de vinagre de manzana
1 Tbsp de aceite de oliva
1 tsp de azúcar
1/2 tsp de sal
1/4 tsp de pimienta negra

Opcional:
1 Tbsp de eneldo fresco picado
1 Tbsp de perejil fresco picado`,
      instructions: `Lava y corta en rodajas finas 2 pepinos.

Corta en rodajas finas 1/4 de cebolla morada.

Coloca los pepinos y la cebolla en un tazón grande.

En un recipiente pequeño, mezcla 3 Tbsp de vinagre de manzana, 1 Tbsp de aceite de oliva, 1 tsp de azúcar, 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Vierte el aderezo sobre las verduras.

Mezcla hasta cubrir uniformemente.

Refrigera de 15 a 30 minutos antes de servir para obtener mejor sabor.

Decora con eneldo o perejil fresco si lo deseas.

Sirve fría.`,
    },
  },
},

{
  id: "quick-fresh-spring-rolls",
  slug: "quick-fresh-spring-rolls",
  name: "Fresh Spring Rolls",
  effort: "quick",
  photoUrl: "/images/quick-fresh-spring-rolls.jpg",
  tags: [
    "side",
    "vegetarian",
    "asian",
    "fresh",
    "healthy",
    "light",
    "no-cook",
  ],
  isVegetarian: true,
  notes:
    "Fresh spring rolls are light, colorful, and packed with crisp vegetables. They're perfect as a side dish, appetizer, or healthy snack.",
  ingredients: `Spring Rolls:
8 rice paper wrappers
1 cup lettuce, shredded
1 cup carrots, julienned
1 cucumber, julienned
1 bell pepper, thinly sliced
1/4 cup fresh cilantro leaves
1/4 cup fresh mint leaves

Dipping Sauce:
1/4 cup sweet chili sauce

Optional:
1 avocado, sliced
1 cup cooked rice noodles`,
  instructions: `Fill a shallow dish or pie plate with warm water.

Dip 1 rice paper wrapper into the water for 10 to 15 seconds until softened.

Lay the wrapper flat on a clean work surface.

Place a small amount of lettuce, carrots, cucumber, bell pepper, cilantro, and mint near the bottom third of the wrapper.

Add avocado or rice noodles if desired.

Fold the bottom edge over the filling.

Fold in both sides and roll tightly to form a spring roll.

Repeat with the remaining wrappers and filling.

Serve immediately with sweet chili sauce for dipping.`,
  translations: {
    es: {
      name: "Rollitos Primavera Frescos",
      notes:
        "Los rollitos primavera frescos son ligeros, coloridos y están llenos de verduras crujientes. Son perfectos como acompañamiento, aperitivo o refrigerio saludable.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "asiático",
        "fresco",
        "saludable",
        "ligero",
        "sin cocción",
      ],
      ingredients: `Rollitos:
8 hojas de papel de arroz
1 cup de lechuga, picada
1 cup de zanahorias en tiras finas
1 pepino en tiras finas
1 pimiento morrón en tiras finas
1/4 cup de hojas de cilantro fresco
1/4 cup de hojas de menta fresca

Salsa para Mojar:
1/4 cup de salsa dulce de chile

Opcional:
1 aguacate en rebanadas
1 cup de fideos de arroz cocidos`,
      instructions: `Llena un plato hondo o molde poco profundo con agua tibia.

Sumerge 1 hoja de papel de arroz durante 10 a 15 segundos hasta que se suavice.

Coloca la hoja sobre una superficie limpia.

Agrega una pequeña cantidad de lechuga, zanahoria, pepino, pimiento, cilantro y menta cerca de la parte inferior.

Agrega aguacate o fideos de arroz si lo deseas.

Dobla la parte inferior sobre el relleno.

Dobla ambos lados hacia adentro y enrolla firmemente para formar el rollito.

Repite con las hojas y el relleno restantes.

Sirve inmediatamente con salsa dulce de chile para acompañar.`,
    },
  },
},

{
  id: "quick-dill-pickle-spears",
  slug: "quick-dill-pickle-spears",
  name: "Dill Pickle Spears",
  effort: "quick",
  photoUrl: "/images/quick-dill-pickle-spears.jpg",
  tags: [
    "side",
    "vegetarian",
    "pickles",
    "condiment",
    "low-calorie",
    "fresh",
    "quick",
  ],
  isVegetarian: true,
  notes:
    "Crunchy dill pickle spears add a tangy, refreshing bite that pairs perfectly with burgers, sandwiches, barbecue, and deli-style meals.",
  ingredients: `4 large dill pickle spears

Optional:
1/4 tsp dill weed
1/8 tsp black pepper
1/8 tsp red pepper flakes`,
  instructions: `Drain 4 dill pickle spears from the jar.

Pat lightly with paper towels if desired.

Arrange the pickle spears on a serving plate.

Sprinkle with dill weed, black pepper, or red pepper flakes if desired.

Serve chilled.`,
  translations: {
    es: {
      name: "Pepinillos en Gajos",
      notes:
        "Los pepinillos en gajos son crujientes, ácidos y refrescantes. Combinan perfectamente con hamburguesas, sándwiches, barbacoa y comidas estilo deli.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "pepinillos",
        "condimento",
        "bajo en calorías",
        "fresco",
        "rápido",
      ],
      ingredients: `4 gajos grandes de pepinillo eneldo

Opcional:
1/4 tsp de eneldo seco
1/8 tsp de pimienta negra
1/8 tsp de hojuelas de chile rojo`,
      instructions: `Escurre 4 gajos de pepinillo del frasco.

Sécalos ligeramente con papel absorbente si lo deseas.

Colócalos en un plato para servir.

Espolvorea con eneldo, pimienta negra o hojuelas de chile si lo deseas.

Sirve fríos.`,
    },
  },
},

{
  id: "quick-roasted-zucchini",
  slug: "quick-roasted-zucchini",
  name: "Roasted Zucchini",
  effort: "quick",
  photoUrl: "/images/quick-roasted-zucchini.jpg",
  tags: [
    "side",
    "vegetarian",
    "vegetables",
    "zucchini",
    "roasted",
    "healthy",
    "quick",
  ],
  isVegetarian: true,
  notes:
    "Simple roasted zucchini becomes tender and lightly caramelized in the oven. A quick and healthy side dish that pairs well with chicken, fish, pasta, and grilled meats.",
  ingredients: `2 medium zucchini, sliced into half-moons
2 tbsp olive oil
1 tsp garlic powder
1/2 tsp salt
1/4 tsp black pepper

Optional:
2 tbsp parmesan cheese
1 tbsp fresh parsley, chopped
1 tsp lemon juice`,
  instructions: `Preheat oven to 425°F.

Line a baking sheet with parchment paper.

Place 2 sliced zucchini on the baking sheet.

Drizzle with 2 tbsp olive oil.

Sprinkle with 1 tsp garlic powder, 1/2 tsp salt, and 1/4 tsp black pepper.

Toss until evenly coated and spread into a single layer.

Roast for 15 to 20 minutes, stirring once halfway through, until tender and lightly browned.

Sprinkle with parmesan cheese, parsley, or lemon juice if desired.

Serve warm.`,
  translations: {
    es: {
      name: "Calabacín Rostizado",
      notes:
        "El calabacín rostizado queda tierno y ligeramente caramelizado. Es un acompañamiento rápido y saludable que combina perfectamente con pollo, pescado, pasta y carnes a la parrilla.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "verduras",
        "calabacín",
        "rostizado",
        "saludable",
        "rápido",
      ],
      ingredients: `2 calabacines medianos, cortados en medias lunas
2 Tbsp de aceite de oliva
1 tsp de ajo en polvo
1/2 tsp de sal
1/4 tsp de pimienta negra

Opcional:
2 Tbsp de queso parmesano
1 Tbsp de perejil fresco picado
1 tsp de jugo de limón`,
      instructions: `Precalienta el horno a 425°F.

Cubre una bandeja para hornear con papel para hornear.

Coloca los 2 calabacines cortados sobre la bandeja.

Rocía con 2 Tbsp de aceite de oliva.

Espolvorea 1 tsp de ajo en polvo, 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Mezcla hasta cubrir uniformemente y acomoda en una sola capa.

Hornea de 15 a 20 minutos, revolviendo una vez a mitad de cocción, hasta que estén tiernos y ligeramente dorados.

Agrega parmesano, perejil o jugo de limón si lo deseas.

Sirve caliente.`,
    },
  },
},

{
  id: "quick-side-caesar-salad",
  slug: "quick-side-caesar-salad",
  name: "Side Caesar Salad",
  effort: "quick",
  photoUrl: "/images/quick-side-caesar-salad.jpg",
  tags: [
    "side",
    "vegetarian",
    "salad",
    "caesar",
    "fresh",
    "quick",
    "restaurant-style",
  ],
  isVegetarian: true,
  notes:
    "A crisp and refreshing Caesar salad with crunchy romaine, parmesan cheese, and creamy Caesar dressing. Perfect alongside pasta, chicken, steak, or seafood.",
  ingredients: `Salad:
1 head romaine lettuce, chopped
1/2 cup croutons
1/4 cup parmesan cheese, grated

Dressing:
1/4 cup Caesar dressing

Optional:
fresh cracked black pepper
lemon wedges`,
  instructions: `Wash and dry the romaine lettuce thoroughly.

Chop the lettuce into bite-sized pieces and place in a large bowl.

Add 1/2 cup croutons and 1/4 cup parmesan cheese.

Drizzle with 1/4 cup Caesar dressing.

Toss gently until evenly coated.

Top with fresh cracked black pepper if desired.

Serve immediately with lemon wedges if desired.`,
  translations: {
    es: {
      name: "Ensalada César de Acompañamiento",
      notes:
        "Una ensalada César fresca y crujiente con lechuga romana, queso parmesano y aderezo César cremoso. Perfecta junto a pasta, pollo, bistec o mariscos.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "ensalada",
        "césar",
        "fresco",
        "rápido",
        "estilo restaurante",
      ],
      ingredients: `Ensalada:
1 cabeza de lechuga romana, picada
1/2 cup de crutones
1/4 cup de queso parmesano rallado

Aderezo:
1/4 cup de aderezo César

Opcional:
pimienta negra recién molida
gajos de limón`,
      instructions: `Lava y seca bien la lechuga romana.

Corta la lechuga en trozos del tamaño de un bocado y colócala en un tazón grande.

Agrega 1/2 cup de crutones y 1/4 cup de queso parmesano.

Rocía con 1/4 cup de aderezo César.

Mezcla suavemente hasta cubrir uniformemente.

Agrega pimienta negra recién molida si lo deseas.

Sirve inmediatamente con gajos de limón si lo deseas.`,
    },
  },
},

{
  id: "quick-watermelon-slices",
  slug: "quick-watermelon-slices",
  name: "Watermelon Slices",
  effort: "quick",
  photoUrl: "/images/quick-watermelon-slices.jpg",
  tags: [
    "side",
    "vegetarian",
    "fruit",
    "healthy",
    "fresh",
    "summer",
    "hydrating",
  ],
  isVegetarian: true,
  notes:
    "Sweet, juicy watermelon slices are refreshing, hydrating, and perfect for cookouts, picnics, and warm-weather meals.",
  ingredients: `1 small seedless watermelon

Optional:
1 tbsp lime juice
1 tbsp fresh mint, chopped
pinch of sea salt`,
  instructions: `Wash the outside of the watermelon thoroughly.

Place the watermelon on a cutting board.

Cut in half, then cut into wedges or triangular slices.

Remove any visible seeds if necessary.

Arrange the slices on a serving platter.

Drizzle with lime juice, sprinkle with mint, or add a small pinch of sea salt if desired.

Serve chilled.`,
  translations: {
    es: {
      name: "Rebanadas de Sandía",
      notes:
        "Las rebanadas de sandía son dulces, jugosas, refrescantes e hidratantes. Perfectas para parrilladas, picnics y comidas de verano.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "fruta",
        "saludable",
        "fresco",
        "verano",
        "hidratante",
      ],
      ingredients: `1 sandía pequeña sin semillas

Opcional:
1 Tbsp de jugo de limón verde
1 Tbsp de menta fresca picada
pizca de sal marina`,
      instructions: `Lava bien el exterior de la sandía.

Coloca la sandía sobre una tabla para cortar.

Córtala por la mitad y luego en gajos o rebanadas triangulares.

Retira las semillas visibles si es necesario.

Acomoda las rebanadas en una fuente para servir.

Rocía con jugo de limón, espolvorea menta o agrega una pizca de sal marina si lo deseas.

Sirve bien fría.`,
    },
  },
},

{
  id: "quick-side-greek-salad",
  slug: "quick-side-greek-salad",
  name: "Side Greek Salad",
  effort: "quick",
  photoUrl: "/images/quick-side-greek-salad.jpg",
  tags: [
    "side",
    "vegetarian",
    "salad",
    "greek",
    "healthy",
    "fresh",
    "mediterranean",
  ],
  isVegetarian: true,
  notes:
    "A fresh Mediterranean-inspired salad with crisp vegetables, feta cheese, and a simple olive oil dressing. Perfect alongside grilled chicken, lamb, seafood, or pita dishes.",
  ingredients: `Salad:
2 cups romaine lettuce, chopped
1 cup cucumber, diced
1 cup cherry tomatoes, halved
1/4 cup red onion, thinly sliced
1/4 cup Kalamata olives
1/4 cup feta cheese, crumbled

Dressing:
2 tbsp olive oil
1 tbsp red wine vinegar
1/2 tsp dried oregano
1/4 tsp salt
1/4 tsp black pepper

Optional:
lemon wedges`,
  instructions: `Wash and dry the lettuce thoroughly.

Place lettuce, cucumber, tomatoes, red onion, olives, and feta cheese into a large bowl.

In a small bowl, whisk together 2 tbsp olive oil, 1 tbsp red wine vinegar, 1/2 tsp oregano, 1/4 tsp salt, and 1/4 tsp black pepper.

Drizzle the dressing over the salad.

Toss gently until evenly coated.

Serve immediately with lemon wedges if desired.`,
  translations: {
    es: {
      name: "Ensalada Griega de Acompañamiento",
      notes:
        "Una ensalada fresca de inspiración mediterránea con verduras crujientes, queso feta y un sencillo aderezo de aceite de oliva. Perfecta junto a pollo, cordero, mariscos o pan pita.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "ensalada",
        "griega",
        "saludable",
        "fresco",
        "mediterráneo",
      ],
      ingredients: `Ensalada:
2 cups de lechuga romana, picada
1 cup de pepino, en cubos
1 cup de tomates cherry, partidos por la mitad
1/4 cup de cebolla morada, en rodajas finas
1/4 cup de aceitunas Kalamata
1/4 cup de queso feta desmoronado

Aderezo:
2 Tbsp de aceite de oliva
1 Tbsp de vinagre de vino tinto
1/2 tsp de orégano seco
1/4 tsp de sal
1/4 tsp de pimienta negra

Opcional:
gajos de limón`,
      instructions: `Lava y seca bien la lechuga.

Coloca la lechuga, el pepino, los tomates, la cebolla morada, las aceitunas y el queso feta en un tazón grande.

En un recipiente pequeño, mezcla 2 Tbsp de aceite de oliva, 1 Tbsp de vinagre de vino tinto, 1/2 tsp de orégano, 1/4 tsp de sal y 1/4 tsp de pimienta negra.

Vierte el aderezo sobre la ensalada.

Mezcla suavemente hasta cubrir uniformemente.

Sirve inmediatamente con gajos de limón si lo deseas.`,
    },
  },
},

{
  id: "quick-mexican-street-corn",
  slug: "quick-mexican-street-corn",
  name: "Mexican Street Corn",
  effort: "quick",
  photoUrl: "/images/quick-mexican-street-corn.jpg",
  tags: [
    "side",
    "vegetarian",
    "corn",
    "mexican",
    "tex-mex",
    "cookout",
    "family-friendly",
  ],
  isVegetarian: true,
  notes:
    "Inspired by traditional elote, this Mexican street corn is creamy, tangy, and packed with bold flavor from lime, cotija cheese, and chili powder.",
  ingredients: `Corn:
4 ears corn, husked

Topping:
1/4 cup mayonnaise
1/4 cup sour cream
1/2 cup cotija cheese, crumbled
1 tbsp lime juice
1 tsp chili powder
1/2 tsp garlic powder

Finish:
2 tbsp fresh cilantro, chopped
lime wedges for serving`,
  instructions: `Preheat a grill to medium-high heat or heat a grill pan.

Cook 4 ears of corn for 8 to 10 minutes, turning occasionally, until lightly charred on all sides.

In a small bowl, combine 1/4 cup mayonnaise, 1/4 cup sour cream, 1 tbsp lime juice, 1 tsp chili powder, and 1/2 tsp garlic powder.

Brush the grilled corn generously with the creamy mixture.

Sprinkle evenly with 1/2 cup cotija cheese.

Top with 2 tbsp chopped cilantro.

Serve immediately with lime wedges for squeezing over the corn.`,
  translations: {
    es: {
      name: "Elote Estilo Callejero",
      notes:
        "Inspirado en el tradicional elote mexicano, este acompañamiento es cremoso, ácido y lleno de sabor gracias al limón, queso cotija y chile en polvo.",
      tags: [
        "acompañamiento",
        "vegetariano",
        "maíz",
        "mexicano",
        "tex-mex",
        "parrillada",
        "familiar",
      ],
      ingredients: `Maíz:
4 elotes, sin hojas

Cobertura:
1/4 cup de mayonesa
1/4 cup de crema agria
1/2 cup de queso cotija desmoronado
1 Tbsp de jugo de limón verde
1 tsp de chile en polvo
1/2 tsp de ajo en polvo

Final:
2 Tbsp de cilantro fresco picado
gajos de limón para servir`,
      instructions: `Precalienta una parrilla a fuego medio-alto o calienta una sartén para asar.

Cocina 4 elotes durante 8 a 10 minutos, girándolos ocasionalmente, hasta que estén ligeramente dorados por todos lados.

En un recipiente pequeño, mezcla 1/4 cup de mayonesa, 1/4 cup de crema agria, 1 Tbsp de jugo de limón, 1 tsp de chile en polvo y 1/2 tsp de ajo en polvo.

Unta generosamente la mezcla cremosa sobre los elotes calientes.

Espolvorea uniformemente con 1/2 cup de queso cotija.

Agrega 2 Tbsp de cilantro picado.

Sirve inmediatamente con gajos de limón para exprimir encima.`,
    },
  },
},



];

export const DESSERTS: Meal[] = [
  
  {
  id: "quick-blueberry-cheesecake-crescent-rolls",
  slug: "quick-blueberry-cheesecake-crescent-rolls",
  name: "Blueberry Cheesecake Crescent Rolls",
  photoUrl: "/images/quick-blueberry-cheesecake-crescent-rolls.jpg",
  effort: "quick",
  tags: ["dessert", "quick", "sweet", "bake", "blueberry", "easy"],
  notes: "Simple dessert that feels fancy. Great for breakfast treats too.",
  ingredients: `3 oz cream cheese, softened
1/2 tsp vanilla extract
2 1/2 Tbsp powdered sugar
1 tube crescent roll dough
2/3 cup fresh blueberries`,
  instructions: `Preheat oven to 375°F.

In a bowl, mix 3 oz softened cream cheese, 1/2 tsp vanilla extract, and 2 1/2 Tbsp powdered sugar until smooth.

Separate 1 tube of crescent dough into triangles.

Spread the cream cheese mixture on the bottom third of each triangle and top with 2/3 cup fresh blueberries distributed evenly among triangles.

Roll from the wide end to the tip.

Place on a baking sheet and bake for 10 minutes or until golden brown.`,
  translations: {
    es: {
      name: "Crecientes de cheesecake con arándanos",
      notes:
        "Un postre sencillo que se siente elegante. También queda muy bien como antojo para el desayuno.",
      tags: ["postre", "rápido", "dulce", "horneado", "arándanos", "fácil"],
      ingredients: `3 oz de queso crema, suavizado
1/2 tsp de extracto de vainilla
2 1/2 Tbsp de azúcar glass
1 tubo de masa para crescent rolls
2/3 cup de arándanos frescos`,
      instructions: `Precalienta el horno a 375°F.

En un tazón, mezcla 3 oz de queso crema suavizado, 1/2 tsp de extracto de vainilla y 2 1/2 Tbsp de azúcar glass hasta que quede suave.

Separa 1 tubo de masa para crescent rolls en triángulos.

Unta la mezcla de queso crema en el tercio inferior de cada triángulo y coloca 2/3 cup de arándanos frescos distribuidos de manera uniforme entre los triángulos.

Enrolla desde el extremo ancho hacia la punta.

Coloca en una bandeja para hornear y hornea durante 10 minutos o hasta que estén dorados.`,
    },
  },
},

{
  id: "quick-campfire-banana-boats",
  slug: "quick-campfire-banana-boats",
  name: "Campfire Banana Boats",
  effort: "quick",
  photoUrl: "/images/quick-campfire-banana-boats.jpg",
  tags: [
    "dessert",
    "campfire",
    "banana",
    "foil-packet",
    "kid-friendly",
    "sweet",
    "family-friendly",
  ],
  isVegetarian: true,
  notes:
    "A fun and easy campfire dessert with warm melted chocolate, gooey marshmallows, and soft bananas wrapped in foil.",
  ingredients: `4 bananas
1/2 cup chocolate chips
1 cup mini marshmallows
1/4 cup graham cracker crumbs
heavy-duty aluminum foil`,
  instructions: `Preheat a campfire grate or grill to medium-low heat.

Using a knife, slice each banana lengthwise through the peel without cutting all the way through.

Gently open the bananas and stuff each one with chocolate chips and mini marshmallows.

Sprinkle graham cracker crumbs over the filling.

Wrap each banana tightly in heavy-duty aluminum foil.

Place the foil packets over the campfire or grill and cook for 8 to 10 minutes, until the chocolate is melted and the marshmallows are gooey.

Carefully unwrap because hot steam will escape.

Serve warm directly from the foil with spoons if desired.`,
  translations: {
    es: {
      name: "Bananas de Fogata",
      notes:
        "Un postre divertido y fácil de fogata con chocolate derretido, malvaviscos suaves y bananas calientes envueltas en aluminio.",
      tags: [
        "postre",
        "fogata",
        "banana",
        "papel aluminio",
        "niños",
        "dulce",
        "familiar",
      ],
      ingredients: `4 bananas
1/2 cup de chispas de chocolate
1 cup de mini malvaviscos
1/4 cup de migas de galleta graham
papel aluminio resistente`,
      instructions: `Precalienta una parrilla de fogata o asador a fuego medio-bajo.

Con un cuchillo, corta cada banana a lo largo sobre la cáscara sin atravesarla completamente.

Abre ligeramente las bananas y rellena con chispas de chocolate y mini malvaviscos.

Espolvorea migas de galleta graham sobre el relleno.

Envuelve cada banana firmemente en papel aluminio resistente.

Coloca los paquetes sobre la fogata o parrilla y cocina de 8 a 10 minutos hasta que el chocolate esté derretido y los malvaviscos suaves.

Abre cuidadosamente porque saldrá vapor caliente.

Sirve caliente directamente en el aluminio con cucharas si deseas.`,
    },
  },
},

{
  id: "quick-dark-chocolate-dipped-strawberries",
  slug: "quick-dark-chocolate-dipped-strawberries",
  name: "Dark Chocolate Dipped Strawberries",
  effort: "quick",
  photoUrl: "/images/quick-dark-chocolate-dipped-strawberries.jpg",
  tags: ["dessert", "snack", "no-bake", "quick", "vegetarian"],
  isVegetarian: true,
  notes: "A simple dessert that feels special without a lot of work.",
  ingredients: `12 large ripe strawberries
1/2 cup dark chocolate baking chips
1 tsp coconut oil`,
  instructions: `Wash 12 large ripe strawberries and dry completely. Chocolate will not stick if wet.
Bring a small pot with a few inches of water to a gentle simmer.
Add 1/2 cup dark chocolate baking chips and 1 tsp coconut oil to a heat-safe glass bowl.
Set the bowl over the pot like a double boiler, making sure the bowl does not touch the water.
Stir until the chocolate is fully melted and smooth.
Line a sheet pan with parchment paper.
Dip the strawberries one at a time and place on the parchment.
Refrigerate for 20 to 30 minutes until the chocolate sets.
Store leftovers in an airtight container in the refrigerator.`,
  translations: {
    es: {
      name: "Fresas cubiertas con chocolate oscuro",
      notes:
        "Un postre sencillo que se siente especial sin mucho trabajo.",
      tags: [
        "postre",
        "snack",
        "sin hornear",
        "rápido",
        "vegetariano",
      ],
      ingredients: `12 fresas grandes y maduras
1/2 cup de chispas de chocolate oscuro para hornear
1 tsp de aceite de coco`,
      instructions: `Lava 12 fresas grandes y maduras, y sécalas completamente. El chocolate no se pegará si están mojadas.
Lleva una olla pequeña con unas pocas inches de agua a un hervor suave.
Agrega 1/2 cup de chispas de chocolate oscuro y 1 tsp de aceite de coco a un tazón de vidrio resistente al calor.
Coloca el tazón sobre la olla como baño maría, asegurándote de que el tazón no toque el agua.
Revuelve hasta que el chocolate esté completamente derretido y suave.
Cubre una bandeja para hornear con papel pergamino.
Sumerge las fresas una por una y colócalas sobre el papel pergamino.
Refrigera de 20 a 30 minutos, hasta que el chocolate se endurezca.
Guarda las sobras en un recipiente hermético en el refrigerador.`,
    },
  },
},

{
  id: "chocolate-peanut-butter-no-bake-bars",
  slug: "chocolate-peanut-butter-no-bake-bars",
  name: "Chocolate Peanut Butter No-Bake Bars",
  ingredients: `1 cup natural peanut butter
1/2 cup maple syrup
1 tsp vanilla extract
2 cups gluten-free oats (quick or rolled)
1 cup dairy-free chocolate chips
1 Tbsp coconut oil`,
  instructions: `In a large bowl, mix 1 cup peanut butter, 1/2 cup maple syrup, and 1 tsp vanilla extract until smooth and fully combined.

Stir in 2 cups oats until everything is evenly coated and forms a thick mixture.

Line an 8x8 pan with parchment paper and press the mixture firmly into an even layer.

In a microwave-safe bowl, combine 1 cup chocolate chips and 1 Tbsp coconut oil. Microwave in 30-second intervals, stirring between each, until smooth and melted.

Pour the melted chocolate over the oat mixture and spread evenly across the top.

Refrigerate for 1 to 2 hours, or until firm.

Slice into bars and serve.`,
  photoUrl: "/images/chocolate-peanut-butter-no-bake-bars.jpg",
  effort: "quick",
  tags: ["dessert", "snack", "no-bake", "gluten-free", "dairy-free", "sweet", "meal-prep"],
  isVegetarian: true,
  notes: "An easy no-bake treat with peanut butter and chocolate. Perfect for meal prep, snacks, or a quick dessert without turning on the oven.",
  translations: {
    es: {
      name: "Barras sin hornear de chocolate y crema de cacahuate",
      notes:
        "Un antojo fácil sin hornear con crema de cacahuate y chocolate. Perfecto para meal prep, snacks o un postre rápido sin encender el horno.",
      tags: [
        "postre",
        "snack",
        "sin hornear",
        "sin gluten",
        "sin lácteos",
        "dulce",
        "meal prep",
      ],
      ingredients: `1 cup de crema de cacahuate natural
1/2 cup de jarabe de maple
1 tsp de extracto de vainilla
2 cups de avena sin gluten, rápida o tradicional
1 cup de chispas de chocolate sin lácteos
1 Tbsp de aceite de coco`,
      instructions: `En un tazón grande, mezcla 1 cup de crema de cacahuate, 1/2 cup de jarabe de maple y 1 tsp de extracto de vainilla hasta que quede suave y bien combinado.

Incorpora 2 cups de avena hasta que todo quede cubierto de manera uniforme y se forme una mezcla espesa.

Cubre un molde de 8x8 con papel pergamino y presiona la mezcla firmemente en una capa uniforme.

En un tazón apto para microondas, combina 1 cup de chispas de chocolate y 1 Tbsp de aceite de coco. Calienta en intervalos de 30 segundos, revolviendo entre cada uno, hasta que quede suave y derretido.

Vierte el chocolate derretido sobre la mezcla de avena y extiéndelo de manera uniforme por encima.

Refrigera de 1 a 2 horas, o hasta que esté firme.

Corta en barras y sirve.`,
    },
  },
},

{
  id: "quick-chocolate-chip-cookies",
  slug: "quick-chocolate-chip-cookies",
  name: "Chocolate Chip Cookies",
  effort: "quick",
  photoUrl: "/images/quick-chocolate-chip-cookies.jpg",
  tags: [
    "dessert",
    "cookies",
    "chocolate",
    "sweet",
    "family",
    "kid-friendly"
  ],
  isVegetarian: true,
  notes:
    "Classic soft and chewy chocolate chip cookies with crisp edges and gooey centers. A timeless dessert that everyone loves.",
  ingredients: `Dry Ingredients:
2 1/4 cups all-purpose flour
1 tsp baking soda
1/2 tsp salt

Wet Ingredients:
1 cup butter, softened
3/4 cup brown sugar
3/4 cup granulated sugar
2 large eggs
2 tsp vanilla extract

Mix-Ins:
2 cups chocolate chips`,
  instructions: `Preheat oven to 375°F.

In a medium bowl, whisk together 2 1/4 cups flour, 1 tsp baking soda, and 1/2 tsp salt.

In a large bowl, beat 1 cup softened butter, 3/4 cup brown sugar, and 3/4 cup granulated sugar until light and fluffy.

Add 2 eggs and 2 tsp vanilla extract and mix until combined.

Gradually add the dry ingredients and mix until a dough forms.

Fold in 2 cups chocolate chips.

Drop rounded tablespoons of dough onto parchment-lined baking sheets.

Bake for 9 to 11 minutes until the edges are lightly golden.

Cool on the baking sheet for 5 minutes before transferring to a wire rack.`,
  translations: {
    es: {
      name: "Galletas con Chispas de Chocolate",
      notes:
        "Clásicas galletas suaves y masticables con bordes dorados y centros llenos de chocolate derretido. Un postre favorito para toda la familia.",
      tags: [
        "postre",
        "galletas",
        "chocolate",
        "dulce",
        "familiar",
        "niños"
      ],
      ingredients: `Ingredientes Secos:
2 1/4 cups de harina
1 tsp de bicarbonato de sodio
1/2 tsp de sal

Ingredientes Húmedos:
1 cup de mantequilla suave
3/4 cup de azúcar morena
3/4 cup de azúcar
2 huevos grandes
2 tsp de extracto de vainilla

Complementos:
2 cups de chispas de chocolate`,
      instructions: `Precalienta el horno a 375°F.

En un recipiente mediano mezcla 2 1/4 cups de harina, 1 tsp de bicarbonato y 1/2 tsp de sal.

En un recipiente grande bate 1 cup de mantequilla, 3/4 cup de azúcar morena y 3/4 cup de azúcar hasta obtener una mezcla esponjosa.

Agrega 2 huevos y 2 tsp de vainilla y mezcla bien.

Añade gradualmente los ingredientes secos hasta formar una masa.

Incorpora 2 cups de chispas de chocolate.

Coloca Tbsp de masa sobre bandejas para hornear cubiertas con papel para hornear.

Hornea de 9 a 11 minutos hasta que los bordes estén ligeramente dorados.

Deja enfriar durante 5 minutos antes de transferir a una rejilla.`,
    },
  },
},

{
  id: "quick-classic-brownies",
  slug: "quick-classic-brownies",
  name: "Classic Brownies",
  effort: "quick",
  photoUrl: "/images/quick-classic-brownies.jpg",
  tags: [
    "dessert",
    "chocolate",
    "brownies",
    "sweet",
    "family",
    "kid-friendly"
  ],
  isVegetarian: true,
  notes:
    "Rich, fudgy brownies with deep chocolate flavor and chewy edges. Perfect for family dinners, potlucks, and special occasions.",
  ingredients: `Dry Ingredients:
1 cup all-purpose flour
1/2 cup unsweetened cocoa powder
1/2 tsp salt

Wet Ingredients:
1/2 cup butter, melted
1 cup granulated sugar
2 large eggs
1 tsp vanilla extract

Optional:
1/2 cup chocolate chips
1/2 cup chopped walnuts`,
  instructions: `Preheat oven to 350°F.

Grease or line an 8x8-inch baking pan with parchment paper.

In a medium bowl, whisk together 1 cup flour, 1/2 cup cocoa powder, and 1/2 tsp salt.

In a large bowl, whisk together 1/2 cup melted butter and 1 cup sugar until combined.

Add 2 eggs and 1 tsp vanilla extract and whisk until smooth.

Stir the dry ingredients into the wet ingredients until just combined.

Fold in 1/2 cup chocolate chips or walnuts if using.

Spread the batter evenly into the prepared pan.

Bake for 25 to 30 minutes, until a toothpick inserted near the center comes out with a few moist crumbs.

Allow the brownies to cool completely before slicing into squares.

Serve and enjoy.`,
  translations: {
    es: {
      name: "Brownies Clásicos",
      notes:
        "Brownies ricos y húmedos con intenso sabor a chocolate y bordes ligeramente masticables. Perfectos para cenas familiares, reuniones y ocasiones especiales.",
      tags: [
        "postre",
        "chocolate",
        "brownies",
        "dulce",
        "familiar",
        "niños"
      ],
      ingredients: `Ingredientes Secos:
1 cup de harina
1/2 cup de cacao en polvo sin azúcar
1/2 tsp de sal

Ingredientes Húmedos:
1/2 cup de mantequilla derretida
1 cup de azúcar
2 huevos grandes
1 tsp de extracto de vainilla

Opcional:
1/2 cup de chispas de chocolate
1/2 cup de nueces picadas`,
      instructions: `Precalienta el horno a 350°F.

Engrasa o cubre un molde de 8x8 inches con papel para hornear.

En un recipiente mediano mezcla 1 cup de harina, 1/2 cup de cacao en polvo y 1/2 tsp de sal.

En un recipiente grande mezcla 1/2 cup de mantequilla derretida y 1 cup de azúcar.

Agrega 2 huevos y 1 tsp de vainilla y bate hasta obtener una mezcla suave.

Incorpora los ingredientes secos hasta que estén combinados.

Agrega las chispas de chocolate o nueces si las usas.

Extiende la masa uniformemente en el molde preparado.

Hornea de 25 a 30 minutos, hasta que un palillo insertado en el centro salga con algunas migas húmedas.

Deja enfriar completamente antes de cortar en cuadrados.

Sirve y disfruta.`,
    },
  },
},

{
  id: "normal-apple-crisp",
  slug: "normal-apple-crisp",
  name: "Apple Crisp",
  effort: "normal",
  photoUrl: "/images/normal-apple-crisp.jpg",
  tags: [
    "dessert",
    "apple",
    "fruit",
    "baked",
    "comfort",
    "family",
    "fall"
  ],
  isVegetarian: true,
  notes:
    "Tender cinnamon-spiced apples topped with a buttery oat crumble. Serve warm on its own or with a scoop of vanilla ice cream.",
  ingredients: `Apple Filling:
6 apples, peeled and sliced
1/4 cup brown sugar
1 tbsp lemon juice
1 tsp cinnamon
1/4 tsp nutmeg

Crisp Topping:
1 cup old-fashioned oats
3/4 cup all-purpose flour
1/2 cup brown sugar
1/2 tsp cinnamon
1/2 cup butter, melted`,
  instructions: `Preheat oven to 350°F.

Lightly grease a 9x13-inch baking dish.

In a large bowl, combine 6 sliced apples, 1/4 cup brown sugar, 1 tbsp lemon juice, 1 tsp cinnamon, and 1/4 tsp nutmeg.

Spread the apple mixture evenly into the baking dish.

In a separate bowl, combine 1 cup oats, 3/4 cup flour, 1/2 cup brown sugar, and 1/2 tsp cinnamon.

Pour in 1/2 cup melted butter and stir until crumbly.

Sprinkle the topping evenly over the apples.

Bake for 35 to 40 minutes, until the apples are tender and the topping is golden brown.

Allow to cool for 10 minutes before serving.

Serve warm.`,
  translations: {
    es: {
      name: "Crumble de Manzana",
      notes:
        "Manzanas tiernas con canela cubiertas con una crujiente mezcla de avena y mantequilla. Delicioso solo o acompañado con helado de vainilla.",
      tags: [
        "postre",
        "manzana",
        "fruta",
        "horneado",
        "comfort",
        "familiar",
        "otoño"
      ],
      ingredients: `Relleno de Manzana:
6 manzanas, peladas y en rodajas
1/4 cup de azúcar morena
1 Tbsp de jugo de limón
1 tsp de canela
1/4 tsp de nuez moscada

Cobertura:
1 cup de avena tradicional
3/4 cup de harina
1/2 cup de azúcar morena
1/2 tsp de canela
1/2 cup de mantequilla derretida`,
      instructions: `Precalienta el horno a 350°F.

Engrasa ligeramente un molde para hornear de 9x13 inches.

En un recipiente grande mezcla 6 manzanas en rodajas, 1/4 cup de azúcar morena, 1 Tbsp de jugo de limón, 1 tsp de canela y 1/4 tsp de nuez moscada.

Distribuye la mezcla de manzana en el molde.

En otro recipiente mezcla 1 cup de avena, 3/4 cup de harina, 1/2 cup de azúcar morena y 1/2 tsp de canela.

Agrega 1/2 cup de mantequilla derretida y mezcla hasta obtener migas gruesas.

Espolvorea la cobertura sobre las manzanas.

Hornea de 35 a 40 minutos, hasta que las manzanas estén tiernas y la cobertura dorada.

Deja enfriar durante 10 minutos antes de servir.

Sirve caliente.`,
    },
  },
},

{
  id: "quick-banana-pudding",
  slug: "quick-banana-pudding",
  name: "Banana Pudding",
  effort: "quick",
  photoUrl: "/images/quick-banana-pudding.jpg",
  tags: [
    "dessert",
    "banana",
    "no-bake",
    "comfort",
    "family",
    "southern"
  ],
  isVegetarian: true,
  notes:
    "A creamy Southern classic layered with bananas, vanilla pudding, and vanilla wafers. Easy to make ahead and always a crowd favorite.",
  ingredients: `Pudding:
2 (3.4 oz) boxes instant vanilla pudding
3 cups cold milk

Layers:
4 bananas, sliced
1 (11 oz) box vanilla wafers

Finish:
1 cup whipped topping`,
  instructions: `In a large bowl, whisk 2 boxes vanilla pudding mix with 3 cups cold milk for 2 minutes.

Let the pudding sit for 5 minutes to thicken.

In a serving dish, spread a thin layer of pudding on the bottom.

Add a layer of vanilla wafers and a layer of sliced bananas.

Top with more pudding.

Repeat the layers until all ingredients are used.

Spread 1 cup whipped topping over the top.

Refrigerate for at least 2 hours before serving.

Serve chilled.`,
  translations: {
    es: {
      name: "Pudín de Plátano",
      notes:
        "Un clásico sureño cremoso con capas de plátano, pudín de vainilla y galletas de vainilla. Fácil de preparar con anticipación y siempre un favorito.",
      tags: [
        "postre",
        "plátano",
        "sin hornear",
        "comfort",
        "familiar",
        "sureño"
      ],
      ingredients: `Pudín:
2 cajas (3.4 oz) de pudín instantáneo de vainilla
3 cups de leche fría

Capas:
4 plátanos en rodajas
1 caja (11 oz) de galletas de vainilla

Final:
1 cup de cobertura batida`,
      instructions: `En un recipiente grande mezcla 2 cajas de pudín de vainilla con 3 cups de leche fría durante 2 minutos.

Deja reposar durante 5 minutos para que espese.

Extiende una capa fina de pudín en el fondo de una fuente.

Agrega una capa de galletas y una capa de plátanos.

Cubre con más pudín.

Repite las capas hasta usar todos los ingredientes.

Cubre con 1 cup de cobertura batida.

Refrigera durante al menos 2 horas antes de servir.

Sirve frío.`,
    },
  },
},

{
  id: "quick-rice-krispie-treats",
  slug: "quick-rice-krispie-treats",
  name: "Rice Krispie Treats",
  effort: "quick",
  photoUrl: "/images/quick-rice-krispie-treats.jpg",
  tags: [
    "dessert",
    "no-bake",
    "sweet",
    "family",
    "kid-friendly",
    "party"
  ],
  isVegetarian: true,
  notes:
    "A classic no-bake dessert made with crispy rice cereal and gooey marshmallows. Fast, easy, and loved by kids and adults alike.",
  ingredients: `Treats:
6 cups crispy rice cereal
10 oz mini marshmallows
3 tbsp butter

Optional:
1/2 cup chocolate chips
sprinkles`,
  instructions: `Grease a 9x13-inch baking dish.

Melt 3 tbsp butter in a large pot over low heat.

Add 10 oz mini marshmallows and stir continuously until completely melted and smooth.

Remove from heat.

Add 6 cups crispy rice cereal and stir until evenly coated.

Fold in chocolate chips or sprinkles if desired.

Press the mixture gently into the prepared baking dish.

Allow to cool for 30 minutes.

Cut into squares and serve.`,
  translations: {
    es: {
      name: "Cuadritos de Arroz Inflado",
      notes:
        "Un clásico postre sin horno preparado con cereal de arroz inflado y malvaviscos derretidos. Fácil, rápido y perfecto para toda la familia.",
      tags: [
        "postre",
        "sin hornear",
        "dulce",
        "familiar",
        "niños",
        "fiesta"
      ],
      ingredients: `Postre:
6 cups de cereal de arroz inflado
10 oz de mini malvaviscos
3 Tbsp de mantequilla

Opcional:
1/2 cup de chispas de chocolate
grageas`,
      instructions: `Engrasa un molde de 9x13 inches.

Derrite 3 Tbsp de mantequilla en una olla grande a fuego bajo.

Agrega 10 oz de mini malvaviscos y revuelve hasta que se derritan por completo.

Retira del fuego.

Agrega 6 cups de cereal de arroz inflado y mezcla hasta cubrir uniformemente.

Incorpora chispas de chocolate o grageas si lo deseas.

Presiona suavemente la mezcla en el molde preparado.

Deja enfriar durante 30 minutos.

Corta en cuadros y sirve.`,
    },
  },
},

{
  id: "quick-strawberry-shortcake",
  slug: "quick-strawberry-shortcake",
  name: "Strawberry Shortcake",
  effort: "quick",
  photoUrl: "/images/quick-strawberry-shortcake.jpg",
  tags: [
    "dessert",
    "strawberry",
    "fruit",
    "sweet",
    "family",
    "summer"
  ],
  isVegetarian: true,
  notes:
    "Fresh strawberries, fluffy whipped cream, and tender shortcake come together in this classic dessert that's light, sweet, and always a crowd-pleaser.",
  ingredients: `Strawberries:
1 lb strawberries, sliced
1/4 cup sugar

Shortcakes:
4 shortcake biscuits or dessert biscuits

Topping:
1 cup whipped cream`,
  instructions: `Place 1 lb sliced strawberries into a bowl.

Sprinkle with 1/4 cup sugar and stir gently.

Let the strawberries sit for 20 to 30 minutes until juicy.

Split 4 shortcake biscuits in half.

Place the bottom half of each biscuit onto a serving plate.

Spoon strawberries and juices over the biscuits.

Top with 1 cup whipped cream divided evenly.

Place the top half of each biscuit over the whipped cream if desired.

Serve immediately.`,
  translations: {
    es: {
      name: "Pastelito de Fresas",
      notes:
        "Fresas frescas, crema batida y suaves bizcochos se combinan en este postre clásico, ligero y delicioso que encanta a toda la familia.",
      tags: [
        "postre",
        "fresa",
        "fruta",
        "dulce",
        "familiar",
        "verano"
      ],
      ingredients: `Fresas:
1 lb de fresas, en rodajas
1/4 cup de azúcar

Bizcochos:
4 bizcochos para shortcake

Cobertura:
1 cup de crema batida`,
      instructions: `Coloca 1 lb de fresas en rodajas en un recipiente.

Espolvorea con 1/4 cup de azúcar y mezcla suavemente.

Deja reposar de 20 a 30 minutos hasta que las fresas suelten sus jugos.

Corta 4 bizcochos por la mitad.

Coloca la mitad inferior de cada uno en platos para servir.

Agrega las fresas y sus jugos sobre los bizcochos.

Añade 1 cup de crema batida repartida entre las porciones.

Coloca la parte superior del bizcocho encima si lo deseas.

Sirve inmediatamente.`,
    },
  },
},

{
  id: "normal-peach-cobbler",
  slug: "normal-peach-cobbler",
  name: "Peach Cobbler",
  effort: "normal",
  photoUrl: "/images/normal-peach-cobbler.jpg",
  tags: [
    "dessert",
    "peach",
    "fruit",
    "baked",
    "comfort",
    "family",
    "southern"
  ],
  isVegetarian: true,
  notes:
    "Sweet peaches baked beneath a golden buttery topping. A comforting classic that's even better served warm with vanilla ice cream.",
  ingredients: `Peach Filling:
6 cups peaches, sliced
1/2 cup sugar
1 tbsp lemon juice
1 tsp cinnamon

Cobbler Topping:
1 cup all-purpose flour
1 cup sugar
2 tsp baking powder
1/4 tsp salt
1 cup milk
1/2 cup butter, melted`,
  instructions: `Preheat oven to 350°F.

Pour 1/2 cup melted butter into a 9x13-inch baking dish.

In a bowl, combine 6 cups sliced peaches, 1/2 cup sugar, 1 tbsp lemon juice, and 1 tsp cinnamon.

Spread the peaches evenly over the melted butter.

In another bowl, whisk together 1 cup flour, 1 cup sugar, 2 tsp baking powder, and 1/4 tsp salt.

Stir in 1 cup milk until smooth.

Pour the batter evenly over the peaches. Do not stir.

Bake for 40 to 45 minutes until golden brown and bubbling around the edges.

Allow to cool for 10 minutes before serving.

Serve warm.`,
  translations: {
    es: {
      name: "Cobbler de Durazno",
      notes:
        "Duraznos dulces horneados bajo una cubierta dorada y mantecosa. Un clásico reconfortante que queda aún mejor acompañado con helado de vainilla.",
      tags: [
        "postre",
        "durazno",
        "fruta",
        "horneado",
        "comfort",
        "familiar",
        "sureño"
      ],
      ingredients: `Relleno:
6 cups de duraznos en rodajas
1/2 cup de azúcar
1 Tbsp de jugo de limón
1 tsp de canela

Cobertura:
1 cup de harina
1 cup de azúcar
2 tsp de polvo para hornear
1/4 tsp de sal
1 cup de leche
1/2 cup de mantequilla derretida`,
      instructions: `Precalienta el horno a 350°F.

Vierte 1/2 cup de mantequilla derretida en un molde para hornear de 9x13 inches.

En un recipiente mezcla 6 cups de duraznos, 1/2 cup de azúcar, 1 Tbsp de jugo de limón y 1 tsp de canela.

Distribuye los duraznos sobre la mantequilla.

En otro recipiente mezcla 1 cup de harina, 1 cup de azúcar, 2 tsp de polvo para hornear y 1/4 tsp de sal.

Agrega 1 cup de leche y mezcla hasta obtener una masa suave.

Vierte la masa sobre los duraznos. No mezcles.

Hornea de 40 a 45 minutos hasta que esté dorado y burbujeante.

Deja enfriar durante 10 minutos antes de servir.

Sirve caliente.`,
    },
  },
},

{
  id: "normal-lemon-bars",
  slug: "normal-lemon-bars",
  name: "Lemon Bars",
  effort: "normal",
  photoUrl: "/images/normal-lemon-bars.jpg",
  tags: [
    "dessert",
    "lemon",
    "citrus",
    "sweet",
    "baked",
    "family",
    "spring"
  ],
  isVegetarian: true,
  notes:
    "Bright, tangy lemon filling layered over a buttery shortbread crust. A refreshing dessert that's sweet, tart, and perfect for sharing.",
  ingredients: `Crust:
1 cup butter, softened
1/2 cup powdered sugar
2 cups all-purpose flour

Lemon Filling:
4 large eggs
1 1/2 cups granulated sugar
1/4 cup all-purpose flour
2/3 cup fresh lemon juice

Finish:
powdered sugar for dusting`,
  instructions: `Preheat oven to 350°F.

Lightly grease a 9x13-inch baking dish.

In a bowl, combine 1 cup softened butter, 1/2 cup powdered sugar, and 2 cups flour until a dough forms.

Press the dough evenly into the baking dish.

Bake for 18 to 20 minutes until lightly golden.

While the crust bakes, whisk together 4 eggs, 1 1/2 cups sugar, 1/4 cup flour, and 2/3 cup lemon juice until smooth.

Pour the lemon mixture over the hot crust.

Return to the oven and bake for 20 to 25 minutes until the center is set.

Allow to cool completely.

Dust with powdered sugar before slicing into bars.

Serve chilled or at room temperature.`,
  translations: {
    es: {
      name: "Barritas de Limón",
      notes:
        "Un relleno brillante y ácido de limón sobre una base mantecosa tipo shortbread. Un postre refrescante, dulce y perfecto para compartir.",
      tags: [
        "postre",
        "limón",
        "cítrico",
        "dulce",
        "horneado",
        "familiar",
        "primavera"
      ],
      ingredients: `Base:
1 cup de mantequilla suave
1/2 cup de azúcar glas
2 cups de harina

Relleno de Limón:
4 huevos grandes
1 1/2 cups de azúcar
1/4 cup de harina
2/3 cup de jugo de limón fresco

Final:
azúcar glas para espolvorear`,
      instructions: `Precalienta el horno a 350°F.

Engrasa ligeramente un molde para hornear de 9x13 inches.

En un recipiente mezcla 1 cup de mantequilla, 1/2 cup de azúcar glas y 2 cups de harina hasta formar una masa.

Presiona la masa uniformemente en el molde.

Hornea de 18 a 20 minutos hasta que esté ligeramente dorada.

Mientras tanto, bate 4 huevos, 1 1/2 cups de azúcar, 1/4 cup de harina y 2/3 cup de jugo de limón hasta obtener una mezcla suave.

Vierte la mezcla de limón sobre la base caliente.

Hornea nuevamente de 20 a 25 minutos hasta que el centro esté firme.

Deja enfriar completamente.

Espolvorea con azúcar glas antes de cortar en barras.

Sirve frío o a temperatura ambiente.`,
    },
  },
},

{
  id: "quick-no-bake-cheesecake-cups",
  slug: "quick-no-bake-cheesecake-cups",
  name: "No-Bake Cheesecake Cups",
  effort: "quick",
  photoUrl: "/images/quick-no-bake-cheesecake-cups.jpg",
  tags: [
    "dessert",
    "cheesecake",
    "no-bake",
    "sweet",
    "family",
    "party"
  ],
  isVegetarian: true,
  notes:
    "Creamy cheesecake filling layered with graham cracker crumbs and topped with fresh fruit. An easy make-ahead dessert that's always a hit.",
  ingredients: `Crust:
1 cup graham cracker crumbs
3 tbsp butter, melted

Cheesecake Filling:
8 oz cream cheese, softened
1/2 cup powdered sugar
1 tsp vanilla extract
1 cup whipped topping

Optional Toppings:
strawberries
blueberries
cherry pie filling
caramel sauce`,
  instructions: `In a small bowl, combine 1 cup graham cracker crumbs and 3 tbsp melted butter.

Divide the crumb mixture evenly among 4 serving cups.

In a large bowl, beat 8 oz softened cream cheese until smooth.

Add 1/2 cup powdered sugar and 1 tsp vanilla extract and mix until combined.

Fold in 1 cup whipped topping until smooth and fluffy.

Spoon or pipe the cheesecake filling over the graham cracker layer.

Top with strawberries, blueberries, cherry pie filling, or caramel sauce if desired.

Refrigerate for at least 1 hour before serving.

Serve chilled.`,
  translations: {
    es: {
      name: "Vasitos de Cheesecake Sin Horno",
      notes:
        "Un cremoso relleno de cheesecake con capas de galleta triturada y fruta fresca. Un postre fácil de preparar con anticipación y perfecto para compartir.",
      tags: [
        "postre",
        "cheesecake",
        "sin hornear",
        "dulce",
        "familiar",
        "fiesta"
      ],
      ingredients: `Base:
1 cup de migas de galleta tipo graham
3 Tbsp de mantequilla derretida

Relleno:
8 oz de queso crema suave
1/2 cup de azúcar glas
1 tsp de extracto de vainilla
1 cup de cobertura batida

Coberturas Opcionales:
fresas
arándanos
relleno de cereza
salsa de caramelo`,
      instructions: `En un recipiente pequeño mezcla 1 cup de migas de galleta y 3 Tbsp de mantequilla derretida.

Divide la mezcla entre 4 vasos para servir.

En un recipiente grande bate 8 oz de queso crema hasta que quede suave.

Agrega 1/2 cup de azúcar glas y 1 tsp de vainilla.

Incorpora 1 cup de cobertura batida hasta obtener una mezcla ligera y cremosa.

Coloca el relleno sobre la capa de galleta.

Agrega fresas, arándanos, relleno de cereza o caramelo si lo deseas.

Refrigera durante al menos 1 hora antes de servir.

Sirve frío.`,
    },
  },
},

{
  id: "quick-chocolate-mug-cake",
  slug: "quick-chocolate-mug-cake",
  name: "Chocolate Mug Cake",
  effort: "quick",
  photoUrl: "/images/quick-chocolate-mug-cake.jpg",
  tags: [
    "dessert",
    "chocolate",
    "quick",
    "microwave",
    "single-serving",
    "family",
    "kid-friendly"
  ],
  isVegetarian: true,
  notes:
    "A rich chocolate cake made in a mug in just minutes. Perfect when you want dessert fast without baking an entire cake.",
  ingredients: `Dry Ingredients:
4 tbsp all-purpose flour
2 tbsp sugar
1 tbsp cocoa powder
1/4 tsp baking powder

Wet Ingredients:
3 tbsp milk
2 tbsp vegetable oil
1/4 tsp vanilla extract

Optional:
1 tbsp chocolate chips
whipped cream
vanilla ice cream`,
  instructions: `In a large microwave-safe mug, combine 4 tbsp flour, 2 tbsp sugar, 1 tbsp cocoa powder, and 1/4 tsp baking powder.

Add 3 tbsp milk, 2 tbsp vegetable oil, and 1/4 tsp vanilla extract.

Stir until smooth and no dry pockets remain.

Fold in 1 tbsp chocolate chips if desired.

Microwave on high for 60 to 90 seconds until the cake is set but still moist.

Allow to cool for 1 to 2 minutes.

Top with whipped cream or ice cream if desired.

Serve warm directly from the mug.`,
  translations: {
    es: {
      name: "Pastel de Chocolate en Taza",
      notes:
        "Un pastel de chocolate rico y esponjoso preparado en minutos en el microondas. Perfecto cuando quieres un postre rápido sin hornear un pastel completo.",
      tags: [
        "postre",
        "chocolate",
        "rápido",
        "microondas",
        "porción individual",
        "familiar",
        "niños"
      ],
      ingredients: `Ingredientes Secos:
4 Tbsp de harina
2 Tbsp de azúcar
1 Tbsp de cacao en polvo
1/4 tsp de polvo para hornear

Ingredientes Húmedos:
3 Tbsp de leche
2 Tbsp de aceite vegetal
1/4 tsp de extracto de vainilla

Opcional:
1 Tbsp de chispas de chocolate
crema batida
helado de vainilla`,
      instructions: `En una taza grande apta para microondas mezcla 4 Tbsp de harina, 2 Tbsp de azúcar, 1 Tbsp de cacao y 1/4 tsp de polvo para hornear.

Agrega 3 Tbsp de leche, 2 Tbsp de aceite vegetal y 1/4 tsp de vainilla.

Mezcla hasta que quede suave y sin grumos.

Incorpora 1 Tbsp de chispas de chocolate si lo deseas.

Cocina en el microondas de 60 a 90 segundos hasta que el pastel esté cocido pero aún húmedo.

Deja reposar durante 1 a 2 minutos.

Agrega crema batida o helado si lo deseas.

Sirve caliente directamente en la taza.`,
    },
  },
},

{
  id: "quick-ice-cream-sundaes",
  slug: "quick-ice-cream-sundaes",
  name: "Ice Cream Sundaes",
  effort: "quick",
  photoUrl: "/images/quick-ice-cream-sundaes.jpg",
  tags: [
    "dessert",
    "ice-cream",
    "sweet",
    "family",
    "kid-friendly",
    "party",
    "customizable"
  ],
  isVegetarian: true,
  notes:
    "A classic ice cream sundae with endless topping possibilities. Fun, customizable, and perfect for family dessert night.",
  ingredients: `Ice Cream:
4 cups vanilla ice cream

Toppings:
1/4 cup chocolate syrup
1/4 cup caramel sauce
1/4 cup whipped cream

Optional:
maraschino cherries
sprinkles
crushed cookies
chopped peanuts
mini chocolate chips`,
  instructions: `Scoop 4 cups vanilla ice cream into 4 serving bowls.

Drizzle each bowl with chocolate syrup and caramel sauce.

Top with whipped cream.

Add sprinkles, crushed cookies, peanuts, or chocolate chips if desired.

Finish with a maraschino cherry if desired.

Serve immediately before the ice cream melts.`,
  translations: {
    es: {
      name: "Helados Sundae",
      notes:
        "Un clásico sundae de helado con infinitas posibilidades de toppings. Divertido, personalizable y perfecto para una noche de postre en familia.",
      tags: [
        "postre",
        "helado",
        "dulce",
        "familiar",
        "niños",
        "fiesta",
        "personalizable"
      ],
      ingredients: `Helado:
4 cups de helado de vainilla

Coberturas:
1/4 cup de jarabe de chocolate
1/4 cup de salsa de caramelo
1/4 cup de crema batida

Opcional:
cerezas marrasquino
grageas
galletas trituradas
cacahuates picados
mini chispas de chocolate`,
      instructions: `Sirve 4 cups de helado de vainilla en 4 recipientes.

Agrega jarabe de chocolate y salsa de caramelo sobre cada porción.

Cubre con crema batida.

Agrega grageas, galletas trituradas, cacahuates o chispas de chocolate si lo deseas.

Termina con una cereza marrasquino si lo deseas.

Sirve inmediatamente antes de que el helado se derrita.`,
    },
  },
},

{
  id: "quick-smores",
  slug: "quick-smores",
  name: "S'mores",
  effort: "quick",
  photoUrl: "/images/quick-smores.jpg",
  tags: [
    "dessert",
    "campfire",
    "chocolate",
    "family",
    "kid-friendly",
    "summer",
    "sweet"
  ],
  isVegetarian: true,
  notes:
    "A campfire classic featuring toasted marshmallows, melted chocolate, and graham crackers. Simple, nostalgic, and always a favorite.",
  ingredients: `8 graham cracker squares
4 large marshmallows
4 squares milk chocolate

Optional:
dark chocolate
peanut butter cups
cookies and cream chocolate`,
  instructions: `Break 8 graham cracker squares in half and arrange them on a plate.

Place 4 squares of chocolate onto 4 graham cracker halves.

Toast 4 marshmallows over a campfire, fire pit, grill, or under a broiler until golden brown and gooey.

Place a toasted marshmallow on top of each chocolate square.

Top with the remaining graham cracker halves.

Press gently to melt the chocolate.

Serve immediately while warm and gooey.`,
  translations: {
    es: {
      name: "S'mores",
      notes:
        "Un clásico de fogata con malvaviscos tostados, chocolate derretido y galletas graham. Sencillo, nostálgico y siempre un favorito.",
      tags: [
        "postre",
        "fogata",
        "chocolate",
        "familiar",
        "niños",
        "verano",
        "dulce"
      ],
      ingredients: `8 cuadros de galleta graham
4 malvaviscos grandes
4 cuadros de chocolate con leche

Opcional:
chocolate oscuro
vasitos de mantequilla de cacahuate
chocolate de galletas y crema`,
      instructions: `Parte 8 cuadros de galleta graham por la mitad y colócalos en un plato.

Pon 4 cuadros de chocolate sobre 4 mitades de galleta.

Tuesta 4 malvaviscos sobre una fogata, parrilla o bajo el asador del horno hasta que estén dorados y suaves.

Coloca un malvavisco tostado sobre cada trozo de chocolate.

Cubre con las mitades restantes de galleta.

Presiona suavemente para ayudar a derretir el chocolate.

Sirve inmediatamente mientras estén calientes y suaves.`,
    },
  },
},

{
  id: "quick-oreo-dirt-cups",
  slug: "quick-oreo-dirt-cups",
  name: "Oreo Dirt Cups",
  effort: "quick",
  photoUrl: "/images/quick-oreo-dirt-cups.jpg",
  tags: [
    "dessert",
    "oreo",
    "no-bake",
    "chocolate",
    "family",
    "kid-friendly",
    "party"
  ],
  isVegetarian: true,
  notes:
    "Creamy chocolate pudding layered with crushed Oreo cookies. A fun, nostalgic dessert that's always a hit with kids and adults.",
  ingredients: `Pudding:
2 (3.9 oz) boxes instant chocolate pudding
3 cups cold milk

Layers:
20 Oreo cookies, crushed

Finish:
1 cup whipped topping

Optional:
gummy worms
extra crushed Oreos`,
  instructions: `In a large bowl, whisk together 2 boxes chocolate pudding mix and 3 cups cold milk for 2 minutes.

Allow the pudding to thicken for 5 minutes.

Place a layer of crushed Oreo cookies into the bottom of 4 serving cups.

Add a layer of chocolate pudding.

Repeat the layers until the cups are filled.

Top with 1 cup whipped topping divided evenly between the cups.

Sprinkle with additional crushed Oreos.

Add gummy worms if desired.

Refrigerate for 30 minutes before serving.

Serve chilled.`,
  translations: {
    es: {
      name: "Vasitos de Tierra con Oreo",
      notes:
        "Capas de pudín de chocolate cremoso y galletas Oreo trituradas. Un postre divertido y nostálgico que encanta a niños y adultos.",
      tags: [
        "postre",
        "oreo",
        "sin hornear",
        "chocolate",
        "familiar",
        "niños",
        "fiesta"
      ],
      ingredients: `Pudín:
2 cajas (3.9 oz) de pudín instantáneo de chocolate
3 cups de leche fría

Capas:
20 galletas Oreo trituradas

Final:
1 cup de crema batida

Opcional:
gomitas en forma de gusano
más Oreo trituradas`,
      instructions: `En un recipiente grande mezcla 2 cajas de pudín de chocolate con 3 cups de leche fría durante 2 minutos.

Deja reposar durante 5 minutos para que espese.

Coloca una capa de Oreo trituradas en el fondo de 4 vasos.

Agrega una capa de pudín de chocolate.

Repite las capas hasta llenar los vasos.

Cubre con 1 cup de crema batida repartida entre los vasos.

Espolvorea más Oreo trituradas por encima.

Agrega gomitas si lo deseas.

Refrigera durante 30 minutos antes de servir.

Sirve frío.`,
    },
  },
},

{
  id: "quick-snickerdoodles",
  slug: "quick-snickerdoodles",
  name: "Snickerdoodles",
  effort: "quick",
  photoUrl: "/images/quick-snickerdoodles.jpg",
  tags: [
    "dessert",
    "cookies",
    "cinnamon",
    "sweet",
    "family",
    "kid-friendly",
    "baked"
  ],
  isVegetarian: true,
  notes:
    "Soft, chewy cookies rolled in cinnamon sugar. A timeless favorite with a lightly crisp exterior and tender center.",
  ingredients: `Cookie Dough:
1/2 cup butter, softened
3/4 cup sugar
1 large egg
1 tsp vanilla extract
1 1/2 cups all-purpose flour
1/2 tsp baking soda
1/4 tsp salt

Cinnamon Sugar:
2 tbsp sugar
1 tsp cinnamon`,
  instructions: `Preheat oven to 375°F.

Line a baking sheet with parchment paper.

In a large bowl, cream together 1/2 cup softened butter and 3/4 cup sugar until light and fluffy.

Add 1 egg and 1 tsp vanilla extract and mix until combined.

Stir in 1 1/2 cups flour, 1/2 tsp baking soda, and 1/4 tsp salt until a soft dough forms.

In a small bowl, combine 2 tbsp sugar and 1 tsp cinnamon.

Roll the dough into 1-inch balls.

Coat each dough ball in the cinnamon sugar mixture.

Place on the baking sheet about 2 inches apart.

Bake for 8 to 10 minutes until the edges are set.

Allow to cool for 5 minutes before serving.`,
  translations: {
    es: {
      name: "Galletas Snickerdoodle",
      notes:
        "Galletas suaves y masticables cubiertas de azúcar con canela. Un clásico casero con exterior ligeramente crujiente y centro tierno.",
      tags: [
        "postre",
        "galletas",
        "canela",
        "dulce",
        "familiar",
        "niños",
        "horneado"
      ],
      ingredients: `Masa:
1/2 cup de mantequilla suave
3/4 cup de azúcar
1 huevo grande
1 tsp de extracto de vainilla
1 1/2 cups de harina
1/2 tsp de bicarbonato de sodio
1/4 tsp de sal

Azúcar con Canela:
2 Tbsp de azúcar
1 tsp de canela`,
      instructions: `Precalienta el horno a 375°F.

Cubre una bandeja para hornear con papel para hornear.

En un recipiente grande bate 1/2 cup de mantequilla y 3/4 cup de azúcar hasta que quede esponjosa.

Agrega 1 huevo y 1 tsp de vainilla y mezcla bien.

Incorpora 1 1/2 cups de harina, 1/2 tsp de bicarbonato y 1/4 tsp de sal hasta formar una masa suave.

En un recipiente pequeño mezcla 2 Tbsp de azúcar y 1 tsp de canela.

Forma bolitas de aproximadamente 1 inch.

Pasa cada bolita por la mezcla de azúcar con canela.

Colócalas en la bandeja dejando espacio entre ellas.

Hornea de 8 a 10 minutos hasta que los bordes estén firmes.

Deja enfriar durante 5 minutos antes de servir.`,
    },
  },
},

{
  id: "quick-peanut-butter-cookies",
  slug: "quick-peanut-butter-cookies",
  name: "Peanut Butter Cookies",
  effort: "quick",
  photoUrl: "/images/quick-peanut-butter-cookies.jpg",
  tags: [
    "dessert",
    "cookies",
    "peanut-butter",
    "sweet",
    "family",
    "kid-friendly",
    "baked"
  ],
  isVegetarian: true,
  notes:
    "Classic peanut butter cookies with a soft center, lightly crisp edges, and the signature fork-pressed pattern. A timeless favorite for peanut butter lovers.",
  ingredients: `Cookie Dough:
1/2 cup butter, softened
1/2 cup creamy peanut butter
1/2 cup brown sugar
1/2 cup granulated sugar
1 large egg
1 tsp vanilla extract
1 1/4 cups all-purpose flour
1/2 tsp baking soda
1/4 tsp salt`,
  instructions: `Preheat oven to 350°F.

Line a baking sheet with parchment paper.

In a large bowl, cream together 1/2 cup softened butter, 1/2 cup peanut butter, 1/2 cup brown sugar, and 1/2 cup granulated sugar until smooth.

Add 1 egg and 1 tsp vanilla extract and mix until combined.

Stir in 1 1/4 cups flour, 1/2 tsp baking soda, and 1/4 tsp salt until a dough forms.

Roll the dough into 1-inch balls and place on the baking sheet.

Use a fork to gently press a crisscross pattern onto each cookie.

Bake for 9 to 11 minutes until the edges are lightly golden.

Allow the cookies to cool on the baking sheet for 5 minutes before transferring to a wire rack.

Serve and enjoy.`,
  translations: {
    es: {
      name: "Galletas de Mantequilla de Cacahuate",
      notes:
        "Clásicas galletas de mantequilla de cacahuate con centro suave, bordes ligeramente crujientes y el tradicional diseño marcado con tenedor.",
      tags: [
        "postre",
        "galletas",
        "mantequilla de cacahuate",
        "dulce",
        "familiar",
        "niños",
        "horneado"
      ],
      ingredients: `Masa:
1/2 cup de mantequilla suave
1/2 cup de mantequilla de cacahuate cremosa
1/2 cup de azúcar morena
1/2 cup de azúcar
1 huevo grande
1 tsp de extracto de vainilla
1 1/4 cups de harina
1/2 tsp de bicarbonato de sodio
1/4 tsp de sal`,
      instructions: `Precalienta el horno a 350°F.

Cubre una bandeja para hornear con papel para hornear.

En un recipiente grande bate 1/2 cup de mantequilla, 1/2 cup de mantequilla de cacahuate, 1/2 cup de azúcar morena y 1/2 cup de azúcar hasta que quede suave.

Agrega 1 huevo y 1 tsp de vainilla y mezcla bien.

Incorpora 1 1/4 cups de harina, 1/2 tsp de bicarbonato y 1/4 tsp de sal hasta formar una masa.

Forma bolitas de aproximadamente 1 inch y colócalas sobre la bandeja.

Usa un tenedor para marcar el clásico patrón cruzado sobre cada galleta.

Hornea de 9 a 11 minutos hasta que los bordes estén ligeramente dorados.

Deja enfriar durante 5 minutos en la bandeja antes de transferir a una rejilla.

Sirve y disfruta.`,
    },
  },
},

{
  id: "quick-oatmeal-raisin-cookies",
  slug: "quick-oatmeal-raisin-cookies",
  name: "Oatmeal Raisin Cookies",
  effort: "quick",
  photoUrl: "/images/quick-oatmeal-raisin-cookies.jpg",
  tags: [
    "dessert",
    "cookies",
    "oatmeal",
    "raisin",
    "sweet",
    "family",
    "baked"
  ],
  isVegetarian: true,
  notes:
    "Soft and chewy oatmeal raisin cookies packed with cinnamon flavor and hearty oats. A classic homemade favorite.",
  ingredients: `Cookie Dough:
1/2 cup butter, softened
1/2 cup brown sugar
1/4 cup granulated sugar
1 large egg
1 tsp vanilla extract
3/4 cup all-purpose flour
1/2 tsp baking soda
1/2 tsp cinnamon
1/4 tsp salt
1 1/2 cups old-fashioned oats
3/4 cup raisins`,
  instructions: `Preheat oven to 350°F.

Line a baking sheet with parchment paper.

In a large bowl, cream together 1/2 cup butter, 1/2 cup brown sugar, and 1/4 cup sugar until fluffy.

Add 1 egg and 1 tsp vanilla extract and mix until combined.

Stir in 3/4 cup flour, 1/2 tsp baking soda, 1/2 tsp cinnamon, and 1/4 tsp salt.

Mix in 1 1/2 cups oats and 3/4 cup raisins.

Drop rounded tablespoons of dough onto the baking sheet.

Bake for 10 to 12 minutes until lightly golden.

Allow to cool for 5 minutes before serving.`,
  translations: {
    es: {
      name: "Galletas de Avena con Pasas",
      notes:
        "Galletas suaves y masticables con avena, pasas y un toque de canela. Un clásico casero que nunca pasa de moda.",
      tags: [
        "postre",
        "galletas",
        "avena",
        "pasas",
        "dulce",
        "familiar",
        "horneado"
      ],
      ingredients: `Masa:
1/2 cup de mantequilla suave
1/2 cup de azúcar morena
1/4 cup de azúcar
1 huevo grande
1 tsp de extracto de vainilla
3/4 cup de harina
1/2 tsp de bicarbonato de sodio
1/2 tsp de canela
1/4 tsp de sal
1 1/2 cups de avena tradicional
3/4 cup de pasas`,
      instructions: `Precalienta el horno a 350°F.

Cubre una bandeja para hornear con papel para hornear.

Bate 1/2 cup de mantequilla, 1/2 cup de azúcar morena y 1/4 cup de azúcar hasta que quede esponjosa.

Agrega 1 huevo y 1 tsp de vainilla.

Incorpora 3/4 cup de harina, 1/2 tsp de bicarbonato, 1/2 tsp de canela y 1/4 tsp de sal.

Agrega 1 1/2 cups de avena y 3/4 cup de pasas.

Coloca Tbsp de masa sobre la bandeja.

Hornea de 10 a 12 minutos hasta que estén ligeramente doradas.

Deja enfriar durante 5 minutos antes de servir.`,
    },
  },
},

{
  id: "normal-blueberry-crisp",
  slug: "normal-blueberry-crisp",
  name: "Blueberry Crisp",
  effort: "normal",
  photoUrl: "/images/normal-blueberry-crisp.jpg",
  tags: [
    "dessert",
    "blueberry",
    "fruit",
    "baked",
    "comfort",
    "family",
    "summer"
  ],
  isVegetarian: true,
  notes:
    "Sweet blueberries baked beneath a buttery oat topping. This simple fruit dessert is bursting with berry flavor and delicious served warm.",
  ingredients: `Blueberry Filling:
6 cups blueberries
1/2 cup sugar
1 tbsp lemon juice
2 tbsp cornstarch

Crisp Topping:
1 cup old-fashioned oats
3/4 cup all-purpose flour
1/2 cup brown sugar
1/2 tsp cinnamon
1/2 cup butter, melted`,
  instructions: `Preheat oven to 350°F.

Lightly grease an 8x8-inch baking dish.

In a large bowl, combine 6 cups blueberries, 1/2 cup sugar, 1 tbsp lemon juice, and 2 tbsp cornstarch.

Stir until evenly coated.

Spread the blueberry mixture into the prepared baking dish.

In a separate bowl, combine 1 cup oats, 3/4 cup flour, 1/2 cup brown sugar, and 1/2 tsp cinnamon.

Pour in 1/2 cup melted butter and stir until crumbly.

Sprinkle the topping evenly over the blueberries.

Bake for 35 to 40 minutes until the filling is bubbling and the topping is golden brown.

Allow to cool for 10 minutes before serving.

Serve warm.`,
  translations: {
    es: {
      name: "Crumble de Arándanos",
      notes:
        "Arándanos dulces horneados bajo una cubierta crujiente de avena y mantequilla. Un postre sencillo lleno de sabor a fruta fresca.",
      tags: [
        "postre",
        "arándanos",
        "fruta",
        "horneado",
        "comfort",
        "familiar",
        "verano"
      ],
      ingredients: `Relleno:
6 cups de arándanos
1/2 cup de azúcar
1 Tbsp de jugo de limón
2 Tbsp de maicena

Cobertura:
1 cup de avena tradicional
3/4 cup de harina
1/2 cup de azúcar morena
1/2 tsp de canela
1/2 cup de mantequilla derretida`,
      instructions: `Precalienta el horno a 350°F.

Engrasa ligeramente un molde para hornear de 8x8 inches.

En un recipiente grande mezcla 6 cups de arándanos, 1/2 cup de azúcar, 1 Tbsp de jugo de limón y 2 Tbsp de maicena.

Revuelve hasta cubrir uniformemente.

Coloca la mezcla en el molde preparado.

En otro recipiente mezcla 1 cup de avena, 3/4 cup de harina, 1/2 cup de azúcar morena y 1/2 tsp de canela.

Agrega 1/2 cup de mantequilla derretida y mezcla hasta formar migas.

Espolvorea la cobertura sobre los arándanos.

Hornea de 35 a 40 minutos hasta que el relleno esté burbujeante y la cobertura dorada.

Deja enfriar durante 10 minutos antes de servir.

Sirve caliente.`,
    },
  },
},

{
  id: "quick-cherry-dump-cake",
  slug: "quick-cherry-dump-cake",
  name: "Cherry Dump Cake",
  effort: "quick",
  photoUrl: "/images/quick-cherry-dump-cake.jpg",
  tags: [
    "dessert",
    "cherry",
    "fruit",
    "cake",
    "easy",
    "family",
    "potluck"
  ],
  isVegetarian: true,
  notes:
    "One of the easiest desserts you'll ever make. Cherry pie filling, cake mix, and butter bake into a warm, sweet dessert with almost no prep work.",
  ingredients: `Fruit Layer:
2 (21 oz) cans cherry pie filling

Cake Layer:
1 box yellow cake mix

Topping:
1/2 cup butter, melted

Optional:
vanilla ice cream
whipped cream`,
  instructions: `Preheat oven to 350°F.

Spread 2 cans cherry pie filling evenly into a 9x13-inch baking dish.

Sprinkle 1 box yellow cake mix evenly over the pie filling.

Pour 1/2 cup melted butter evenly over the cake mix.

Do not stir.

Bake for 40 to 45 minutes until the top is golden brown and the filling is bubbling around the edges.

Allow to cool for 10 minutes before serving.

Serve warm with vanilla ice cream or whipped cream if desired.`,
  translations: {
    es: {
      name: "Pastel Fácil de Cereza",
      notes:
        "Uno de los postres más fáciles que existen. El relleno de cereza, la mezcla para pastel y la mantequilla se hornean juntos para crear un postre cálido y delicioso con muy poco esfuerzo.",
      tags: [
        "postre",
        "cereza",
        "fruta",
        "pastel",
        "fácil",
        "familiar",
        "reuniones"
      ],
      ingredients: `Capa de Fruta:
2 latas (21 oz) de relleno para pay de cereza

Capa de Pastel:
1 caja de mezcla para pastel amarillo

Cobertura:
1/2 cup de mantequilla derretida

Opcional:
helado de vainilla
crema batida`,
      instructions: `Precalienta el horno a 350°F.

Extiende uniformemente 2 latas de relleno para pay de cereza en un molde para hornear de 9x13 inches.

Espolvorea 1 caja de mezcla para pastel amarillo sobre el relleno.

Vierte 1/2 cup de mantequilla derretida sobre la mezcla para pastel.

No mezcles.

Hornea de 40 a 45 minutos hasta que la superficie esté dorada y el relleno burbujee en los bordes.

Deja enfriar durante 10 minutos antes de servir.

Sirve caliente con helado de vainilla o crema batida si lo deseas.`,
    },
  },
},

{
  id: "quick-sopapilla-bars",
  slug: "quick-sopapilla-bars",
  name: "Sopapilla Bars",
  effort: "quick",
  photoUrl: "/images/quick-sopapilla-bars.jpg",
  tags: [
    "dessert",
    "cinnamon",
    "cream-cheese",
    "sweet",
    "family",
    "party",
    "tex-mex"
  ],
  isVegetarian: true,
  notes:
    "Flaky pastry layered with sweet cream cheese and topped with cinnamon sugar. These bars are simple to make and always disappear quickly.",
  ingredients: `Bars:
2 (8 oz) cans crescent roll dough
2 (8 oz) packages cream cheese, softened
1 cup granulated sugar
1 tsp vanilla extract

Topping:
1/4 cup butter, melted
1/4 cup sugar
1 tsp cinnamon`,
  instructions: `Preheat oven to 350°F.

Lightly grease a 9x13-inch baking dish.

Unroll 1 can crescent roll dough and press it into the bottom of the baking dish.

In a large bowl, beat 2 packages softened cream cheese, 1 cup sugar, and 1 tsp vanilla extract until smooth.

Spread the cream cheese mixture evenly over the dough.

Unroll the second can of crescent roll dough and place it over the cream cheese layer.

Brush the top with 1/4 cup melted butter.

In a small bowl, combine 1/4 cup sugar and 1 tsp cinnamon.

Sprinkle the cinnamon sugar evenly over the top.

Bake for 30 to 35 minutes until golden brown.

Allow to cool completely before slicing into bars.

Serve at room temperature or chilled.`,
  translations: {
    es: {
      name: "Barritas de Sopapilla",
      notes:
        "Capas de masa hojaldrada rellenas de queso crema dulce y cubiertas con azúcar y canela. Un postre fácil y siempre popular en reuniones familiares.",
      tags: [
        "postre",
        "canela",
        "queso crema",
        "dulce",
        "familiar",
        "fiesta",
        "tex-mex"
      ],
      ingredients: `Barritas:
2 latas (8 oz) de masa para medialunas
2 paquetes (8 oz) de queso crema, suave
1 cup de azúcar
1 tsp de extracto de vainilla

Cobertura:
1/4 cup de mantequilla derretida
1/4 cup de azúcar
1 tsp de canela`,
      instructions: `Precalienta el horno a 350°F.

Engrasa ligeramente un molde para hornear de 9x13 inches.

Extiende 1 lata de masa para medialunas en el fondo del molde.

En un recipiente grande bate 2 paquetes de queso crema, 1 cup de azúcar y 1 tsp de vainilla hasta que quede suave.

Distribuye la mezcla uniformemente sobre la masa.

Coloca la segunda lámina de masa sobre el relleno.

Pincela la superficie con 1/4 cup de mantequilla derretida.

En un recipiente pequeño mezcla 1/4 cup de azúcar y 1 tsp de canela.

Espolvorea la mezcla sobre la superficie.

Hornea de 30 a 35 minutos hasta que esté dorado.

Deja enfriar completamente antes de cortar en barras.

Sirve a temperatura ambiente o frío.`,
    },
  },
},

{
  id: "quick-chocolate-pudding",
  slug: "quick-chocolate-pudding",
  name: "Chocolate Pudding",
  effort: "quick",
  photoUrl: "/images/quick-chocolate-pudding.jpg",
  tags: [
    "dessert",
    "chocolate",
    "no-bake",
    "sweet",
    "family",
    "kid-friendly",
    "classic"
  ],
  isVegetarian: true,
  notes:
    "Smooth, rich chocolate pudding that's creamy, comforting, and easy to make. A timeless dessert that's loved by kids and adults alike.",
  ingredients: `Pudding:
1/2 cup sugar
1/4 cup cocoa powder
3 tbsp cornstarch
1/4 tsp salt
2 3/4 cups whole milk
1 tsp vanilla extract
2 tbsp butter

Optional:
whipped cream
chocolate shavings`,
  instructions: `In a medium saucepan, whisk together 1/2 cup sugar, 1/4 cup cocoa powder, 3 tbsp cornstarch, and 1/4 tsp salt.

Gradually whisk in 2 3/4 cups milk until smooth.

Place the saucepan over medium heat.

Cook for 8 to 10 minutes, whisking constantly, until the mixture thickens and begins to bubble.

Remove from heat.

Stir in 1 tsp vanilla extract and 2 tbsp butter until smooth.

Pour the pudding into serving dishes.

Cover and refrigerate for at least 2 hours until chilled.

Top with whipped cream or chocolate shavings if desired.

Serve cold.`,
  translations: {
    es: {
      name: "Pudín de Chocolate",
      notes:
        "Un pudín de chocolate suave, cremoso y lleno de sabor. Un postre clásico y reconfortante que encanta a niños y adultos.",
      tags: [
        "postre",
        "chocolate",
        "sin hornear",
        "dulce",
        "familiar",
        "niños",
        "clásico"
      ],
      ingredients: `Pudín:
1/2 cup de azúcar
1/4 cup de cacao en polvo
3 Tbsp de maicena
1/4 tsp de sal
2 3/4 cups de leche entera
1 tsp de extracto de vainilla
2 Tbsp de mantequilla

Opcional:
crema batida
virutas de chocolate`,
      instructions: `En una cacerola mediana mezcla 1/2 cup de azúcar, 1/4 cup de cacao en polvo, 3 Tbsp de maicena y 1/4 tsp de sal.

Agrega poco a poco 2 3/4 cups de leche mientras bates hasta que quede suave.

Coloca la cacerola a fuego medio.

Cocina de 8 a 10 minutos, batiendo constantemente, hasta que la mezcla espese y comience a burbujear.

Retira del fuego.

Agrega 1 tsp de vainilla y 2 Tbsp de mantequilla y mezcla hasta que quede suave.

Vierte el pudín en recipientes para servir.

Cubre y refrigera durante al menos 2 horas.

Agrega crema batida o virutas de chocolate si lo deseas.

Sirve frío.`,
    },
  },
},

{
  id: "normal-mini-cheesecakes",
  slug: "normal-mini-cheesecakes",
  name: "Mini Cheesecakes",
  effort: "normal",
  photoUrl: "/images/normal-mini-cheesecakes.jpg",
  tags: [
    "dessert",
    "cheesecake",
    "baked",
    "sweet",
    "family",
    "party",
    "holiday"
  ],
  isVegetarian: true,
  notes:
    "Creamy individual cheesecakes with a buttery graham cracker crust. Perfect for parties, holidays, or whenever you want an easy make-ahead dessert.",
  ingredients: `Crust:
1 cup graham cracker crumbs
3 tbsp butter, melted

Cheesecake Filling:
16 oz cream cheese, softened
1/2 cup granulated sugar
2 large eggs
1 tsp vanilla extract

Optional Toppings:
strawberries
blueberries
cherry pie filling
caramel sauce
chocolate sauce`,
  instructions: `Preheat oven to 325°F.

Line a 12-cup muffin tin with paper liners.

In a small bowl, combine 1 cup graham cracker crumbs and 3 tbsp melted butter.

Divide the mixture evenly among the muffin cups and press firmly into the bottom.

In a large bowl, beat 16 oz softened cream cheese and 1/2 cup sugar until smooth.

Add 2 eggs, one at a time, mixing after each addition.

Mix in 1 tsp vanilla extract.

Divide the cheesecake filling evenly among the muffin cups.

Bake for 18 to 22 minutes until the centers are just set.

Remove from the oven and cool for 30 minutes.

Refrigerate for at least 2 hours before serving.

Top with fruit, caramel, or chocolate sauce if desired.`,
  translations: {
    es: {
      name: "Mini Cheesecakes",
      notes:
        "Cheesecakes individuales y cremosos con una base de galleta graham. Perfectos para fiestas, celebraciones o como un postre preparado con anticipación.",
      tags: [
        "postre",
        "cheesecake",
        "horneado",
        "dulce",
        "familiar",
        "fiesta",
        "festivo"
      ],
      ingredients: `Base:
1 cup de migas de galleta tipo graham
3 Tbsp de mantequilla derretida

Relleno:
16 oz de queso crema suave
1/2 cup de azúcar
2 huevos grandes
1 tsp de extracto de vainilla

Coberturas Opcionales:
fresas
arándanos
relleno de cereza
salsa de caramelo
salsa de chocolate`,
      instructions: `Precalienta el horno a 325°F.

Coloca capacillos en un molde para 12 muffins.

En un recipiente pequeño mezcla 1 cup de migas de galleta y 3 Tbsp de mantequilla derretida.

Divide la mezcla entre los moldes y presiónala en el fondo.

En un recipiente grande bate 16 oz de queso crema y 1/2 cup de azúcar hasta que quede suave.

Agrega 2 huevos, uno a la vez, mezclando después de cada adición.

Incorpora 1 tsp de vainilla.

Divide el relleno entre los moldes.

Hornea de 18 a 22 minutos hasta que los centros estén apenas firmes.

Retira del horno y deja enfriar durante 30 minutos.

Refrigera durante al menos 2 horas antes de servir.

Agrega fruta, caramelo o salsa de chocolate si lo deseas.`,
    },
  },
},

{
  id: "quick-puppy-chow-muddy-buddies",
  slug: "quick-puppy-chow-muddy-buddies",
  name: "Puppy Chow (Muddy Buddies)",
  effort: "quick",
  photoUrl: "/images/quick-puppy-chow-muddy-buddies.jpg",
  tags: [
    "dessert",
    "no-bake",
    "chocolate",
    "peanut-butter",
    "party",
    "family",
    "sweet"
  ],
  isVegetarian: true,
  notes:
    "A crunchy cereal snack coated in chocolate, peanut butter, and powdered sugar. Perfect for parties, movie nights, and holiday gatherings.",
  ingredients: `Snack Mix:
9 cups rice cereal squares

Chocolate Coating:
1 cup semi-sweet chocolate chips
1/2 cup creamy peanut butter
1/4 cup butter

Finish:
1 tsp vanilla extract
1 1/2 cups powdered sugar`,
  instructions: `Place 9 cups rice cereal squares into a very large mixing bowl.

In a microwave-safe bowl, combine 1 cup chocolate chips, 1/2 cup peanut butter, and 1/4 cup butter.

Microwave in 30-second intervals, stirring after each interval, until smooth.

Stir in 1 tsp vanilla extract.

Pour the chocolate mixture over the cereal.

Gently stir until all of the cereal is evenly coated.

Transfer the coated cereal to a large zip-top bag or container.

Add 1 1/2 cups powdered sugar.

Seal and shake until completely coated.

Spread onto a baking sheet or parchment paper to cool for 10 minutes.

Serve immediately or store in an airtight container.`,
  translations: {
    es: {
      name: "Muddy Buddies (Puppy Chow)",
      notes:
        "Un popular bocadillo dulce cubierto con chocolate, mantequilla de cacahuate y azúcar glas. Perfecto para fiestas, noches de películas y celebraciones.",
      tags: [
        "postre",
        "sin hornear",
        "chocolate",
        "mantequilla de cacahuate",
        "fiesta",
        "familiar",
        "dulce"
      ],
      ingredients: `Mezcla:
9 cups de cereal de arroz en cuadros

Cobertura de Chocolate:
1 cup de chispas de chocolate semidulce
1/2 cup de mantequilla de cacahuate cremosa
1/4 cup de mantequilla

Final:
1 tsp de extracto de vainilla
1 1/2 cups de azúcar glas`,
      instructions: `Coloca 9 cups de cereal en cuadros en un recipiente grande.

En un recipiente apto para microondas combina 1 cup de chispas de chocolate, 1/2 cup de mantequilla de cacahuate y 1/4 cup de mantequilla.

Calienta en intervalos de 30 segundos, mezclando después de cada uno, hasta que quede suave.

Agrega 1 tsp de vainilla.

Vierte la mezcla de chocolate sobre el cereal.

Revuelve suavemente hasta cubrir todo el cereal.

Transfiere el cereal a una bolsa grande con cierre o recipiente con tapa.

Agrega 1 1/2 cups de azúcar glas.

Cierra y agita hasta cubrir completamente.

Extiende sobre papel para hornear y deja enfriar durante 10 minutos.

Sirve o guarda en un recipiente hermético.`,
    },
  },
},

{
  id: "normal-pecan-pie-bars",
  slug: "normal-pecan-pie-bars",
  name: "Pecan Pie Bars",
  effort: "normal",
  photoUrl: "/images/normal-pecan-pie-bars.jpg",
  tags: [
    "dessert",
    "pecan",
    "bars",
    "holiday",
    "sweet",
    "family",
    "baked"
  ],
  isVegetarian: true,
  notes:
    "Everything you love about pecan pie in an easy-to-serve bar. Perfect for holidays, potlucks, and family gatherings.",
  ingredients: `Shortbread Crust:
1 cup butter, softened
1/2 cup brown sugar
2 cups all-purpose flour

Pecan Filling:
3 large eggs
1 cup light corn syrup
3/4 cup brown sugar
2 tbsp butter, melted
1 tsp vanilla extract
1/4 tsp salt
2 cups pecans, chopped`,
  instructions: `Preheat oven to 350°F.

Lightly grease a 9x13-inch baking dish.

In a large bowl, combine 1 cup softened butter, 1/2 cup brown sugar, and 2 cups flour.

Mix until crumbly dough forms.

Press the dough evenly into the bottom of the baking dish.

Bake for 18 to 20 minutes until lightly golden.

While the crust bakes, whisk together 3 eggs, 1 cup corn syrup, 3/4 cup brown sugar, 2 tbsp melted butter, 1 tsp vanilla extract, and 1/4 tsp salt.

Stir in 2 cups chopped pecans.

Pour the pecan mixture over the warm crust.

Bake for 25 to 30 minutes until the filling is set.

Allow to cool completely before cutting into bars.

Serve at room temperature.`,
  translations: {
    es: {
      name: "Barritas de Pay de Nuez",
      notes:
        "Todo el sabor del clásico pay de nuez en una práctica barrita. Perfectas para días festivos, reuniones y comidas familiares.",
      tags: [
        "postre",
        "nuez",
        "barritas",
        "festivo",
        "dulce",
        "familiar",
        "horneado"
      ],
      ingredients: `Base de Mantequilla:
1 cup de mantequilla suave
1/2 cup de azúcar morena
2 cups de harina

Relleno de Nuez:
3 huevos grandes
1 cup de jarabe de maíz claro
3/4 cup de azúcar morena
2 Tbsp de mantequilla derretida
1 tsp de extracto de vainilla
1/4 tsp de sal
2 cups de nueces picadas`,
      instructions: `Precalienta el horno a 350°F.

Engrasa ligeramente un molde para hornear de 9x13 inches.

En un recipiente grande mezcla 1 cup de mantequilla, 1/2 cup de azúcar morena y 2 cups de harina.

Mezcla hasta formar una masa desmoronada.

Presiona la masa uniformemente en el fondo del molde.

Hornea de 18 a 20 minutos hasta que esté ligeramente dorada.

Mientras tanto, bate 3 huevos, 1 cup de jarabe de maíz, 3/4 cup de azúcar morena, 2 Tbsp de mantequilla derretida, 1 tsp de vainilla y 1/4 tsp de sal.

Agrega 2 cups de nueces picadas.

Vierte la mezcla sobre la base caliente.

Hornea de 25 a 30 minutos hasta que el relleno esté firme.

Deja enfriar completamente antes de cortar en barras.

Sirve a temperatura ambiente.`,
    },
  },
},

{
  id: "quick-chocolate-chip-cookie-bars",
  slug: "quick-chocolate-chip-cookie-bars",
  name: "Chocolate Chip Cookie Bars",
  effort: "quick",
  photoUrl: "/images/quick-chocolate-chip-cookie-bars.jpg",
  tags: [
    "dessert",
    "cookies",
    "chocolate",
    "bars",
    "sweet",
    "family",
    "kid-friendly"
  ],
  isVegetarian: true,
  notes:
    "Everything you love about chocolate chip cookies in an easy-to-make bar. Soft, chewy, and packed with chocolate in every bite.",
  ingredients: `Cookie Bar Dough:
1/2 cup butter, softened
1/2 cup brown sugar
1/4 cup granulated sugar
1 large egg
1 tsp vanilla extract
1 1/4 cups all-purpose flour
1/2 tsp baking soda
1/4 tsp salt
1 cup semi-sweet chocolate chips

Optional:
1/2 cup chopped walnuts
1/2 cup milk chocolate chips`,
  instructions: `Preheat oven to 350°F.

Lightly grease or line an 8x8-inch baking dish with parchment paper.

In a large bowl, cream together 1/2 cup softened butter, 1/2 cup brown sugar, and 1/4 cup granulated sugar until light and fluffy.

Add 1 egg and 1 tsp vanilla extract and mix until combined.

Stir in 1 1/4 cups flour, 1/2 tsp baking soda, and 1/4 tsp salt until a soft dough forms.

Fold in 1 cup chocolate chips and walnuts if using.

Spread the dough evenly into the prepared baking dish.

Bake for 20 to 24 minutes until the edges are golden brown and the center is set.

Allow to cool for at least 15 minutes before slicing into bars.

Serve warm or at room temperature.`,
  translations: {
    es: {
      name: "Barritas de Galleta con Chispas de Chocolate",
      notes:
        "Todo el sabor de las clásicas galletas con chispas de chocolate en una práctica barrita. Suaves, masticables y llenas de chocolate.",
      tags: [
        "postre",
        "galletas",
        "chocolate",
        "barritas",
        "dulce",
        "familiar",
        "niños"
      ],
      ingredients: `Masa:
1/2 cup de mantequilla suave
1/2 cup de azúcar morena
1/4 cup de azúcar
1 huevo grande
1 tsp de extracto de vainilla
1 1/4 cups de harina
1/2 tsp de bicarbonato de sodio
1/4 tsp de sal
1 cup de chispas de chocolate semidulce

Opcional:
1/2 cup de nueces picadas
1/2 cup de chispas de chocolate con leche`,
      instructions: `Precalienta el horno a 350°F.

Engrasa ligeramente o cubre un molde de 8x8 inches con papel para hornear.

En un recipiente grande bate 1/2 cup de mantequilla, 1/2 cup de azúcar morena y 1/4 cup de azúcar hasta que quede esponjosa.

Agrega 1 huevo y 1 tsp de vainilla y mezcla bien.

Incorpora 1 1/4 cups de harina, 1/2 tsp de bicarbonato y 1/4 tsp de sal hasta formar una masa suave.

Agrega 1 cup de chispas de chocolate y nueces si las usas.

Extiende la masa uniformemente en el molde preparado.

Hornea de 20 a 24 minutos hasta que los bordes estén dorados y el centro firme.

Deja enfriar durante al menos 15 minutos antes de cortar en barras.

Sirve tibias o a temperatura ambiente.`,
    },
  },
},

];

export const EXTRA_RECIPES: Meal[] = [
  {
  id: "quick-classic-guacamole",
  slug: "quick-classic-guacamole",
  name: "Guacamole",
  effort: "quick",
  photoUrl: "/images/quick-classic-guacamole.jpg",
  tags: ["dip", "side", "mexican", "no-cook", "quick", "vegetarian"],
  isVegetarian: true,
  notes: "Fresh and simple guacamole that works as a snack, side, or taco-night add-on.",
  ingredients: `3 ripe avocados, peeled and pitted
1 lime, juiced
1 tsp salt
1/2 cup diced white onion
3 Tbsp chopped fresh cilantro
2 Roma tomatoes, diced
1 tsp garlic, minced
pinch of cayenne pepper (optional)`,
  instructions: `In a medium bowl, mash 3 peeled and pitted ripe avocados with the juice of 1 lime and 1 tsp salt until your desired consistency, slightly chunky is usually best.
Stir in 1/2 cup diced white onion, 3 Tbsp chopped fresh cilantro, 2 diced Roma tomatoes, and 1 tsp minced garlic.
Add a pinch of cayenne pepper if desired and mix well.
Taste and adjust salt or lime as needed.
Refrigerate for 1 hour for the best flavor, or serve immediately with tortilla chips.`,
  translations: {
    es: {
      name: "Guacamole",
      notes:
        "Guacamole fresco y sencillo que funciona como snack, acompañamiento o extra para noche de tacos.",
      tags: [
        "dip",
        "acompañamiento",
        "mexicano",
        "sin cocinar",
        "rápido",
        "vegetariano",
      ],
      ingredients: `3 aguacates maduros, pelados y sin hueso
1 lima, exprimida
1 tsp de sal
1/2 cup de cebolla blanca, picada en cubitos
3 Tbsp de cilantro fresco, picado
2 tomates Roma, picados en cubitos
1 tsp de ajo, picado
una pizca de pimienta de cayena, opcional`,
      instructions: `En un tazón mediano, machaca 3 aguacates maduros pelados y sin hueso con el jugo de 1 lima y 1 tsp de sal hasta lograr la consistencia que prefieras; ligeramente con trozos suele quedar mejor.
Incorpora 1/2 cup de cebolla blanca picada, 3 Tbsp de cilantro fresco picado, 2 tomates Roma picados y 1 tsp de ajo picado.
Agrega una pizca de pimienta de cayena si deseas y mezcla bien.
Prueba y ajusta la sal o la lima según sea necesario.
Refrigera durante 1 hora para mejor sabor, o sirve de inmediato con totopos.`,
    },
  },
},

{
  id: "quick-homemade-chili-seasoning",
  slug: "quick-homemade-chili-seasoning",
  name: "Homemade Chili Seasoning",
  effort: "quick",
  photoUrl: "/images/quick-homemade-chili-seasoning.jpg",
  tags: ["seasoning", "pantry", "spice-mix", "quick", "vegetarian"],
  isVegetarian: true,
  notes: "A pantry staple that is great to keep on hand for chili nights.",
  ingredients: `1 Tbsp chili powder
1 tsp ground cumin
1/4 tsp cayenne pepper
1/4 tsp garlic powder
1/2 tsp onion powder
1 tsp salt
1/4 tsp pepper
small pinch ground cinnamon`,
  instructions: `Add all ingredients to a small bowl.
Stir very well until evenly combined.
Transfer to an airtight container or spice shaker.
Store in a cool, dry place.
Use in place of one store-bought chili seasoning packet.`,
  translations: {
    es: {
      name: "Sazonador casero para chili",
      notes:
        "Un básico de despensa ideal para tener listo en noches de chili.",
      tags: [
        "sazonador",
        "despensa",
        "mezcla de especias",
        "rápido",
        "vegetariano",
      ],
      ingredients: `1 Tbsp de chile en polvo
1 tsp de comino molido
1/4 tsp de pimienta de cayena
1/4 tsp de ajo en polvo
1/2 tsp de cebolla en polvo
1 tsp de sal
1/4 tsp de pimienta
una pizca pequeña de canela molida`,
      instructions: `Agrega todos los ingredientes a un tazón pequeño.
Mezcla muy bien hasta que todo esté combinado de manera uniforme.
Pasa a un recipiente hermético o frasco para especias.
Guarda en un lugar fresco y seco.
Usa en lugar de un paquete de sazonador para chili comprado en tienda.`,
    },
  },
},

{
  id: "quick-captains-wing-rub",
  slug: "quick-captains-wing-rub",
  name: "Captain's Wing Rub",
  photoUrl: "/images/quick-captains-wing-rub.jpg",
  effort: "quick",
  tags: ["seasoning", "pantry", "spice-mix", "quick", "vegetarian"],
  isVegetarian: true,
  notes: "Bold, spicy, and tangy. Great for wings or grilled meats.",
  ingredients: `2 Tbsp smoked paprika
1 1/2 Tbsp cayenne pepper
1 tsp ancho chili powder
1 tsp garlic powder
1 tsp onion powder
1 tsp fine sea salt
1/2 tsp citric acid
1/2 tsp cumin
1/4 tsp chipotle powder
1/2 tsp jalapeno pepper flakes`,
  instructions: `Combine all ingredients in a bowl.

Mix thoroughly and store in an airtight container.

Use as a dry rub or seasoning for wings and meats.`,
  translations: {
    es: {
      name: "Rub del Capitán para alitas",
      notes:
        "Intenso, picante y con un toque ácido. Excelente para alitas o carnes a la parrilla.",
      tags: [
        "sazonador",
        "despensa",
        "mezcla de especias",
        "rápido",
        "vegetariano",
      ],
      ingredients: `2 Tbsp de paprika ahumada
1 1/2 Tbsp de pimienta de cayena
1 tsp de chile ancho en polvo
1 tsp de ajo en polvo
1 tsp de cebolla en polvo
1 tsp de sal marina fina
1/2 tsp de ácido cítrico
1/2 tsp de comino
1/4 tsp de chipotle en polvo
1/2 tsp de hojuelas de jalapeño`,
      instructions: `Combina todos los ingredientes en un tazón.

Mezcla muy bien y guarda en un recipiente hermético.

Usa como rub seco o sazonador para alitas y carnes.`,
    },
  },
},

{
  id: "chicken-salad-croissant",
  slug: "chicken-salad-croissant",
  name: "Chicken Salad Croissant",
  ingredients: `Chicken:
1 lb boneless skinless chicken breasts
1 Tbsp olive oil
1/2 tsp salt
1/4 tsp black pepper

Chicken Salad:
1/2 cup mayonnaise
1 Tbsp Dijon mustard
1 Tbsp lemon juice
1/2 tsp garlic powder
1/4 tsp salt (plus more to taste)
1/4 tsp black pepper
1/2 cup celery, finely diced
1/3 cup red grapes, halved (optional)
1/4 cup sliced almonds or pecans (optional)
2 Tbsp fresh parsley, chopped

Assembly:
4 croissants, sliced
lettuce leaves (optional)
tomato slices (optional)`,
  instructions: `Preheat a skillet over medium heat. Add 1 Tbsp olive oil.

Season 1 lb chicken breasts with 1/2 tsp salt and 1/4 tsp black pepper.

Cook chicken for 5 to 6 minutes per side, until a golden-brown crust forms and the internal temperature reaches 165°F.

Remove from heat and let rest for 5 to 10 minutes, then dice or shred into bite-sized pieces.

In a large bowl, whisk together 1/2 cup mayonnaise, 1 Tbsp Dijon mustard, 1 Tbsp lemon juice, 1/2 tsp garlic powder, 1/4 tsp salt, and 1/4 tsp black pepper until smooth.

Add the chopped chicken, 1/2 cup celery, 1/3 cup grapes if using, 1/4 cup nuts if using, and 2 Tbsp parsley. Fold gently until everything is evenly coated.

Taste and adjust seasoning with additional salt, pepper, or lemon juice as needed.

Slice 4 croissants and layer with lettuce if desired.

Spoon chicken salad generously onto each croissant and top with tomato slices if using.

Serve immediately.`,
  photoUrl: "/images/chicken-salad-croissant.jpg",
  effort: "normal",
  tags: ["lunch", "chicken", "sandwich", "quick", "meal-prep", "family", "fresh"],
  isVegetarian: false,
  // Chicken Salad Croissant
suggestedSides: [
  "Potato chips",
  "Fruit salad",
  "Pickle spears",
],
  notes: "A creamy, balanced chicken salad served on flaky croissants. Letting the chicken rest before chopping keeps it juicy, and a splash of lemon brightens the entire dish.",
  translations: {
    es: {
      name: "Croissant de ensalada de pollo",
      notes:
        "Una ensalada de pollo cremosa y equilibrada servida en croissants hojaldrados. Dejar reposar el pollo antes de picarlo lo mantiene jugoso, y un toque de limón ilumina todo el plato.",
      tags: [
        "almuerzo",
        "pollo",
        "sándwich",
        "rápido",
        "meal prep",
        "familiar",
        "fresco",
      ],
      suggestedSides: [
        "Papitas",
        "Ensalada de frutas",
        "Pepinillos",
      ],

      ingredients: `Pollo:
1 lb de pechugas de pollo sin hueso y sin piel
1 Tbsp de aceite de oliva
1/2 tsp de sal
1/4 tsp de pimienta negra

Ensalada de pollo:
1/2 cup de mayonesa
1 Tbsp de mostaza Dijon
1 Tbsp de jugo de limón
1/2 tsp de ajo en polvo
1/4 tsp de sal, más al gusto
1/4 tsp de pimienta negra
1/2 cup de apio, finamente picado
1/3 cup de uvas rojas, cortadas por la mitad, opcional
1/4 cup de almendras rebanadas o nueces pecanas, opcional
2 Tbsp de perejil fresco, picado

Armado:
4 croissants, rebanados
hojas de lechuga, opcional
rebanadas de tomate, opcional`,
      instructions: `Precalienta un sartén a fuego medio. Agrega 1 Tbsp de aceite de oliva.

Sazona 1 lb de pechugas de pollo con 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Cocina el pollo de 5 a 6 minutos por lado, hasta que se forme una costra dorada y la temperatura interna alcance 165°F.

Retira del fuego y deja reposar de 5 a 10 minutos, luego corta en cubitos o deshebra en piezas pequeñas.

En un tazón grande, bate 1/2 cup de mayonesa, 1 Tbsp de mostaza Dijon, 1 Tbsp de jugo de limón, 1/2 tsp de ajo en polvo, 1/4 tsp de sal y 1/4 tsp de pimienta negra hasta que quede suave.

Agrega el pollo picado, 1/2 cup de apio, 1/3 cup de uvas si las usas, 1/4 cup de nueces si las usas y 2 Tbsp de perejil. Incorpora suavemente hasta que todo quede cubierto de manera uniforme.

Prueba y ajusta los condimentos con más sal, pimienta o jugo de limón según sea necesario.

Rebana 4 croissants y agrega una capa de lechuga si deseas.

Coloca una porción generosa de ensalada de pollo sobre cada croissant y cubre con rebanadas de tomate si las usas.

Sirve de inmediato.`,
    },
  },
},

{
  id: "quick-sausage-muffins",
  slug: "quick-sausage-muffins",
  name: "Sausage Muffins",
  effort: "quick",
  photoUrl: "/images/quick-sausage-muffins.jpg",
  tags: ["breakfast", "quick", "kid-friendly", "meal-prep", "pork"],
  // Sausage Muffins
suggestedSides: [
  "Fresh fruit",
  "Hash browns",
  "Yogurt",
],
  notes: "Easy grab-and-go breakfast muffins that also work for busy mornings or snacks.",
  ingredients: `1 cup Bisquick
1 lb breakfast sausage, cooked
4 eggs, beaten
1 cup cheddar cheese, shredded`,
  instructions: `Preheat oven to 350°F.

Cook 1 lb breakfast sausage in a skillet until browned and set aside to cool slightly.

In a medium bowl, combine 4 beaten eggs, 1 cup Bisquick, the cooked sausage, and 1 cup shredded cheddar cheese. Mix well until thoroughly combined.

Spray muffin tins with cooking spray.

Fill each muffin cup 1/2 to 3/4 full with the mixture.

Bake for 20 minutes or until the muffins are set and lightly browned on top.`,
  translations: {
    es: {
      name: "Muffins de salchicha",
      notes:
        "Muffins fáciles de desayuno para llevar, perfectos también para mañanas ocupadas o snacks.",
      tags: [
        "desayuno",
        "rápido",
        "para niños",
        "meal prep",
        "cerdo",
      ],
      suggestedSides: [
        "Fruta fresca",
        "Papas hash brown",
        "Yogur",
      ],

      ingredients: `1 cup de Bisquick
1 lb de salchicha de desayuno, cocida
4 huevos, batidos
1 cup de queso cheddar rallado`,
      instructions: `Precalienta el horno a 350°F.

Cocina 1 lb de salchicha de desayuno en un sartén hasta que esté dorada y reserva para que se enfríe un poco.

En un tazón mediano, combina 4 huevos batidos, 1 cup de Bisquick, la salchicha cocida y 1 cup de queso cheddar rallado. Mezcla bien hasta que todo esté completamente combinado.

Rocía moldes para muffins con spray para cocinar.

Llena cada molde de muffin de 1/2 a 3/4 con la mezcla.

Hornea durante 20 minutos o hasta que los muffins estén firmes y ligeramente dorados por encima.`,
    },
  },
},

  {
  id: "big-french-toast-casserole",
  slug: "big-french-toast-casserole",
  name: "French Toast Casserole",
  photoUrl: "/images/big-french-toast-casserole.jpg",
  effort: "big",
  tags: ["breakfast", "brunch", "bake", "sweet", "family-friendly", "make-ahead"],
  // French Toast Casserole
suggestedSides: [
  "Fresh berries",
  "Bacon",
  "Scrambled eggs",
],
  notes: "Perfect make-ahead breakfast for holidays or weekends.",
  ingredients: `1 loaf sourdough bread
8 large eggs
2 cups milk
1/2 cup heavy cream
1 Tbsp vanilla extract
3/4 cup sugar
1/2 cup all-purpose flour
1/2 cup light brown sugar
1 tsp ground cinnamon
1/4 tsp salt
1 stick unsalted butter, cut into pieces
fresh blueberries (optional)
fresh strawberries (optional)`,
  instructions: `Preheat oven to 350°F.

Cut 1 loaf sourdough bread into cubes and place in a greased 9x13 baking dish.

In a large bowl, whisk together 8 large eggs, 2 cups milk, 1/2 cup heavy cream, 1 Tbsp vanilla extract, and 3/4 cup sugar. Pour the mixture evenly over the bread cubes.

Cover and refrigerate for at least 4 hours, or overnight.

In a separate bowl, mix 1/2 cup all-purpose flour, 1/2 cup light brown sugar, 1 tsp ground cinnamon, and 1/4 tsp salt. Cut in 1 stick of unsalted butter using a pastry cutter or fork until the mixture is crumbly. Refrigerate the topping until ready to bake.

Remove the dish from the fridge and sprinkle the chilled crumble topping evenly over the soaked bread.

Bake uncovered for 50 minutes until the top is golden and the center is set.

Top with fresh blueberries and strawberries if desired before serving.`,
  translations: {
    es: {
      name: "Cazuela de pan francés",
      notes:
        "Desayuno perfecto para preparar con anticipación en días festivos o fines de semana.",
      tags: [
        "desayuno",
        "brunch",
        "horneado",
        "dulce",
        "familiar",
        "preparar con anticipación",
      ],
      suggestedSides: [
        "Frutos rojos frescos",
        "Tocino",
        "Huevos revueltos",
      ],

      ingredients: `1 pan de masa madre
8 huevos grandes
2 cups de leche
1/2 cup de crema espesa
1 Tbsp de extracto de vainilla
3/4 cup de azúcar
1/2 cup de harina de todo uso
1/2 cup de azúcar morena clara
1 tsp de canela molida
1/4 tsp de sal
1 barra de mantequilla sin sal, cortada en trozos
arándanos frescos, opcional
fresas frescas, opcional`,
      instructions: `Precalienta el horno a 350°F.

Corta 1 pan de masa madre en cubos y colócalo en un molde para hornear de 9x13 engrasado.

En un tazón grande, bate 8 huevos grandes, 2 cups de leche, 1/2 cup de crema espesa, 1 Tbsp de extracto de vainilla y 3/4 cup de azúcar. Vierte la mezcla de manera uniforme sobre los cubos de pan.

Cubre y refrigera por al menos 4 horas, o durante toda la noche.

En otro tazón, mezcla 1/2 cup de harina de todo uso, 1/2 cup de azúcar morena clara, 1 tsp de canela molida y 1/4 tsp de sal. Incorpora 1 barra de mantequilla sin sal usando un cortador de masa o un tenedor hasta que la mezcla quede arenosa. Refrigera la cobertura hasta que sea momento de hornear.

Retira el molde del refrigerador y espolvorea la cobertura fría de manera uniforme sobre el pan remojado.

Hornea sin cubrir durante 50 minutos, hasta que la parte superior esté dorada y el centro esté firme.

Cubre con arándanos frescos y fresas si deseas antes de servir.`,
    },
  },
},

{
  id: "plantation-tea",
  slug: "plantation-tea",
  name: "Plantation Tea",
  ingredients: `1 quart hot water
6 black tea bags
1 quart cold water
16 oz pineapple juice
1 fresh pineapple, peeled, cored, and cut into spears`,
  instructions: `Bring 1 quart water to just below boiling and pour into a large pitcher.

Add 6 black tea bags and steep for 5 minutes.

Remove the tea bags and pour in 1 quart cold water.

Add 16 oz pineapple juice and stir well to combine.

Refrigerate overnight for best flavor.

Serve over ice and garnish with fresh pineapple spears.`,
  photoUrl: "/images/plantation-tea.jpg",
  effort: "quick",
  tags: ["drink", "beverage", "tea", "summer", "batch", "refreshing", "non-alcoholic"],
  isVegetarian: true,
  notes: "A refreshing iced tea with a tropical pineapple twist. Letting it chill overnight helps the flavors fully blend and mellow.",
  translations: {
    es: {
      name: "Té tropical de piña",
      notes:
        "Un té helado refrescante con un toque tropical de piña. Dejarlo enfriar toda la noche ayuda a que los sabores se mezclen y se suavicen.",
      tags: [
        "bebida",
        "té",
        "verano",
        "para preparar en cantidad",
        "refrescante",
        "sin alcohol",
      ],
      ingredients: `1 quart de agua caliente
6 bolsitas de té negro
1 quart de agua fría
16 oz de jugo de piña
1 piña fresca, pelada, sin corazón y cortada en lanzas`,
      instructions: `Calienta 1 quart de agua hasta justo antes de hervir y viértela en una jarra grande.

Agrega 6 bolsitas de té negro y deja reposar durante 5 minutos.

Retira las bolsitas de té y vierte 1 quart de agua fría.

Agrega 16 oz de jugo de piña y mezcla bien para combinar.

Refrigera durante toda la noche para mejor sabor.

Sirve sobre hielo y decora con lanzas de piña fresca.`,
    },
  },
},

{
  id: "blueberry-lemonade",
  slug: "blueberry-lemonade",
  name: "Blueberry Lemonade",
  ingredients: `2 1/8 cups fresh blueberries (divided)
3/4 cup granulated sugar
2/3 cup freshly squeezed lemon juice
4 cups cold water (divided)
1 lemon, sliced`,
  instructions: `Add 2 cups blueberries, 3/4 cup sugar, and 1 cup water to a blender. Blend on medium-high speed for about 1 minute, until completely smooth.

Strain the blueberry puree through a fine mesh sieve into a pitcher to remove skins.

Add 2/3 cup freshly squeezed lemon juice and the remaining 3 cups cold water to the pitcher. Stir well to combine.

Taste and add more water if a lighter flavor is desired.

Refrigerate until well chilled.

Before serving, add sliced lemon and the remaining 1/8 cup blueberries as garnish.

Serve over ice.`,
  photoUrl: "/images/blueberry-lemonade.jpg",
  effort: "quick",
  tags: ["drink", "beverage", "summer", "refreshing", "batch", "non-alcoholic"],
  isVegetarian: true,
  notes: "Bright and refreshing homemade lemonade with a natural blueberry twist. Straining the puree gives it a smooth texture while keeping all the fresh flavor.",
  translations: {
    es: {
      name: "Limonada de arándanos",
      notes:
        "Limonada casera brillante y refrescante con un toque natural de arándanos. Colar el puré le da una textura suave mientras conserva todo el sabor fresco.",
      tags: [
        "bebida",
        "verano",
        "refrescante",
        "para preparar en cantidad",
        "sin alcohol",
      ],
      ingredients: `2 1/8 cups de arándanos frescos, divididos
3/4 cup de azúcar granulada
2/3 cup de jugo de limón recién exprimido
4 cups de agua fría, dividida
1 limón, rebanado`,
      instructions: `Agrega 2 cups de arándanos, 3/4 cup de azúcar y 1 cup de agua a una licuadora. Licúa a velocidad media-alta durante aproximadamente 1 minuto, hasta que quede completamente suave.

Cuela el puré de arándanos a través de un colador de malla fina hacia una jarra para retirar las pieles.

Agrega 2/3 cup de jugo de limón recién exprimido y las 3 cups restantes de agua fría a la jarra. Mezcla bien para combinar.

Prueba y agrega más agua si deseas un sabor más ligero.

Refrigera hasta que esté bien fría.

Antes de servir, agrega limón rebanado y el 1/8 cup restante de arándanos como decoración.

Sirve sobre hielo.`,
    },
  },
},

{
  id: "nojito",
  slug: "nojito",
  name: "Nojito (Mint Lime Mocktail)",
  ingredients: `crushed ice
8 mint leaves
3 oz lime juice
1 1/2 oz simple syrup
2 oz club soda
mint sprig, for garnish`,
  instructions: `Fill a pint glass about 1/3 full with crushed ice.

Add 8 mint leaves to the glass.

Pour in 3 oz lime juice and 1 1/2 oz simple syrup.

Gently muddle the mint leaves into the liquid using a muddler or wooden spoon, pressing lightly to release flavor without tearing the leaves.

Fill the glass with more crushed ice.

Top with 2 oz club soda.

Garnish with a fresh mint sprig and serve immediately.`,
  photoUrl: "/images/nojito.jpg",
  effort: "quick",
  tags: ["drink", "beverage", "mocktail", "refreshing", "summer", "non-alcoholic"],
  isVegetarian: true,
  notes: "A refreshing non-alcoholic mojito-style drink with bright lime and fresh mint. Gently muddling the mint keeps the flavor clean without bitterness.",
  translations: {
    es: {
      name: "Nojito de menta y lima",
      notes:
        "Una bebida refrescante sin alcohol estilo mojito, con lima brillante y menta fresca. Machacar suavemente la menta mantiene el sabor limpio sin amargor.",
      tags: [
        "bebida",
        "mocktail",
        "refrescante",
        "verano",
        "sin alcohol",
      ],
      ingredients: `hielo triturado
8 hojas de menta
3 oz de jugo de lima
1 1/2 oz de jarabe simple
2 oz de agua mineral con gas
ramita de menta para decorar`,
      instructions: `Llena un vaso tipo pint aproximadamente 1/3 con hielo triturado.

Agrega 8 hojas de menta al vaso.

Vierte 3 oz de jugo de lima y 1 1/2 oz de jarabe simple.

Machaca suavemente las hojas de menta en el líquido usando un muddler o una cuchara de madera, presionando ligeramente para liberar el sabor sin romper demasiado las hojas.

Llena el vaso con más hielo triturado.

Cubre con 2 oz de agua mineral con gas.

Decora con una ramita de menta fresca y sirve de inmediato.`,
    },
  },
},


];

// =====================================================
// VEGETARIAN DINNERS
// =====================================================

export const NEW_VEGETARIAN_RECIPES: Meal[] = [
  
  {
  id: "quick-vegetable-stir-fry",
  slug: "quick-vegetable-stir-fry",
  name: "Vegetable Stir Fry",
  effort: "quick",
  photoUrl: "/images/quick-vegetable-stir-fry.jpg",
  tags: ["vegetarian", "dinner", "quick", "healthy", "skillet", "one-pan", "asian"],
  isVegetarian: true,
  // Vegetable Stir Fry
suggestedSides: [
  "Steamed rice",
  "Spring rolls",
  "Cucumber salad",
],
  notes: "A flexible, colorful dinner that is easy to adjust with whatever vegetables you have on hand.",
  ingredients: `2 Tbsp olive oil
1 red bell pepper, sliced
1 yellow bell pepper, sliced
8 oz baby bella mushrooms, sliced
3 cups small broccoli florets
1 cup sugar snap peas
1 cup carrots, thinly sliced
3 green onions, thinly sliced
sesame seeds, for garnish

STIR FRY SAUCE
1/2 cup water
1/3 cup low-sodium soy sauce
1 Tbsp honey or brown sugar
1 Tbsp rice vinegar
2 tsp toasted sesame oil
2 garlic cloves, grated
2 tsp grated fresh ginger
1 Tbsp cornstarch
1/2 tsp red pepper flakes, optional
salt, to taste
pepper, to taste`,
  instructions: `In a medium bowl, whisk together the STIR FRY SAUCE: 1/2 cup water, 1/3 cup low-sodium soy sauce, 1 Tbsp honey or brown sugar, 1 Tbsp rice vinegar, 2 tsp toasted sesame oil, 2 grated garlic cloves, 2 tsp grated fresh ginger, 1 Tbsp cornstarch, and 1/2 tsp red pepper flakes if using. Set aside.

Heat 2 Tbsp olive oil in a large skillet or wok over high heat. Add the sliced red and yellow bell peppers, 8 oz sliced baby bella mushrooms, 3 cups small broccoli florets, 1 cup sugar snap peas, 1 cup thinly sliced carrots, and most of the 3 thinly sliced green onions. Toss and cook, stirring occasionally, for 3 to 4 minutes, or until vegetables soften slightly.

Reduce heat to medium and pour in the whisked sauce. Stir and cook for 1 to 2 minutes, or until the sauce thickens and vegetables are crisp-tender. Season with salt and pepper to taste.

Top with the remaining green onions and sesame seeds and serve immediately.`,
  translations: {
    es: {
      name: "Salteado de verduras",
      notes:
        "Una cena flexible, colorida y fácil de ajustar con las verduras que tengas a mano.",
      tags: [
        "vegetariano",
        "cena",
        "rápido",
        "saludable",
        "sartén",
        "una sartén",
        "asiático",
      ],
      suggestedSides: [
        "Arroz al vapor",
        "Rollitos primavera",
        "Ensalada de pepino",
      ],
      ingredients: `2 Tbsp de aceite de oliva
1 pimiento rojo, rebanado
1 pimiento amarillo, rebanado
8 oz de champiñones baby bella, rebanados
3 cups de floretes pequeños de brócoli
1 cup de chícharos sugar snap
1 cup de zanahorias, rebanadas finamente
3 cebollines, rebanados finamente
semillas de sésamo, para decorar

SALSA PARA SALTEADO
1/2 cup de agua
1/3 cup de salsa de soya baja en sodio
1 Tbsp de miel o azúcar morena
1 Tbsp de vinagre de arroz
2 tsp de aceite de sésamo tostado
2 dientes de ajo, rallados
2 tsp de jengibre fresco rallado
1 Tbsp de maicena
1/2 tsp de hojuelas de chile rojo, opcional
sal y pimienta, al gusto`,
      instructions: `En un tazón mediano, bate la SALSA PARA SALTEADO: 1/2 cup de agua, 1/3 cup de salsa de soya baja en sodio, 1 Tbsp de miel o azúcar morena, 1 Tbsp de vinagre de arroz, 2 tsp de aceite de sésamo tostado, 2 dientes de ajo rallados, 2 tsp de jengibre fresco rallado, 1 Tbsp de maicena y 1/2 tsp de hojuelas de chile rojo si las usas. Reserva.

Calienta 2 Tbsp de aceite de oliva en un sartén grande o wok a fuego alto. Agrega los pimientos rojo y amarillo rebanados, 8 oz de champiñones baby bella rebanados, 3 cups de floretes pequeños de brócoli, 1 cup de chícharos sugar snap, 1 cup de zanahorias rebanadas finamente y la mayor parte de los 3 cebollines rebanados. Mezcla y cocina, revolviendo de vez en cuando, de 3 a 4 minutos, o hasta que las verduras se ablanden ligeramente.

Reduce el fuego a medio y vierte la salsa batida. Revuelve y cocina de 1 a 2 minutos, o hasta que la salsa espese y las verduras estén tiernas pero crujientes. Sazona con sal y pimienta al gusto.

Cubre con los cebollines restantes y semillas de sésamo, y sirve de inmediato.`,
    },
  },
},

{
  id: "vegetable-lo-mein-noodles",
  slug: "vegetable-lo-mein-noodles",
  name: "Vegetable Lo Mein Noodles",
  effort: "quick",
  photoUrl: "/images/vegetable-lo-mein-noodles.jpg",
  tags: [
    "vegetarian",
    "dinner",
    "noodles",
    "asian",
    "quick",
    "one-pan",
    "takeout-style",
  ],
  isVegetarian: true,
  // Vegetable Lo Mein Noodles
suggestedSides: [
  "Spring rolls",
  "Cucumber salad",
  "Steamed edamame",
],
  notes:
    "Cooking the vegetables over high heat helps them stay crisp and flavorful instead of soft and soggy. Tossing the noodles directly in the sauce at the end gives them that classic glossy lo mein texture.",
  ingredients: `Noodles:
8 oz lo mein noodles (or spaghetti as a substitute)

Vegetables:
1 tbsp sesame oil
1 tbsp olive oil
1 cup mushrooms, sliced
1 cup carrots, shredded
1 bell pepper, sliced
1 cup broccoli florets
3 green onions, sliced
2 cloves garlic, minced
1 tsp fresh ginger, grated

Sauce:
1/4 cup soy sauce
2 tbsp hoisin sauce
1 tbsp brown sugar
1 tsp sesame oil
1 tbsp rice vinegar
1/4 tsp red pepper flakes (optional)

Optional:
sesame seeds for garnish`,
  instructions: `Cook 8 oz lo mein noodles according to package directions. Drain and set aside.

In a small bowl, whisk together 1/4 cup soy sauce, 2 tbsp hoisin sauce, 1 tbsp brown sugar, 1 tsp sesame oil, 1 tbsp rice vinegar, and red pepper flakes if using.

Heat 1 tbsp sesame oil and 1 tbsp olive oil in a large skillet or wok over medium-high heat.

Add 1 cup mushrooms, 1 cup carrots, 1 bell pepper, and 1 cup broccoli.

Cook 5 to 7 minutes, stirring frequently, until the vegetables are tender-crisp with light caramelization.

Add 3 green onions, 2 cloves garlic, and 1 tsp ginger. Cook 30 seconds until fragrant.

Add the cooked noodles and pour in the sauce.

Toss continuously for 2 to 3 minutes until the noodles are fully coated and glossy.

Serve hot and garnish with sesame seeds if desired.`,
  translations: {
    es: {
      name: "Fideos Lo Mein con Verduras",
      notes:
        "Cocinar las verduras a fuego alto ayuda a que queden crujientes y llenas de sabor en lugar de blandas. Mezclar los fideos directamente con la salsa al final les da esa textura brillante clásica del lo mein.",
      tags: [
        "vegetariano",
        "cena",
        "fideos",
        "asiática",
        "rápido",
        "una sartén",
        "estilo comida para llevar",
      ],
      suggestedSides: [
        "Rollitos primavera",
        "Ensalada de pepino",
        "Edamame al vapor",
      ],
      ingredients: `Fideos:
8 oz de fideos lo mein (o espagueti como sustituto)

Verduras:
1 Tbsp de aceite de ajonjolí
1 Tbsp de aceite de oliva
1 cup de champiñones, en rodajas
1 cup de zanahorias ralladas
1 pimiento morrón, en rodajas
1 cup de floretes de brócoli
3 cebollines, en rodajas
2 dientes de ajo, picados
1 tsp de jengibre fresco, rallado

Salsa:
1/4 cup de salsa de soya
2 Tbsp de salsa hoisin
1 Tbsp de azúcar morena
1 tsp de aceite de ajonjolí
1 Tbsp de vinagre de arroz
1/4 tsp de hojuelas de chile rojo (opcional)

Opcional:
semillas de ajonjolí para decorar`,
      instructions: `Cocina 8 oz de fideos lo mein según las instrucciones del paquete. Escurre y reserva.

En un tazón pequeño, mezcla 1/4 cup de salsa de soya, 2 Tbsp de salsa hoisin, 1 Tbsp de azúcar morena, 1 tsp de aceite de ajonjolí, 1 Tbsp de vinagre de arroz y hojuelas de chile rojo si las usas.

Calienta 1 Tbsp de aceite de ajonjolí y 1 Tbsp de aceite de oliva en una sartén grande o wok a fuego medio-alto.

Agrega 1 cup de champiñones, 1 cup de zanahorias, 1 pimiento morrón y 1 cup de brócoli.

Cocina de 5 a 7 minutos, revolviendo con frecuencia, hasta que las verduras estén tiernas pero crujientes y ligeramente caramelizadas.

Agrega 3 cebollines, 2 dientes de ajo y 1 tsp de jengibre. Cocina 30 segundos hasta que desprenda aroma.

Agrega los fideos cocidos y vierte la salsa.

Mezcla constantemente de 2 a 3 minutos hasta que los fideos estén completamente cubiertos y brillantes.

Sirve caliente y decora con semillas de ajonjolí si deseas.`,
    },
  },
},

{
  id: "crispy-sheet-pan-gnocchi-roasted-veggies",
  slug: "crispy-sheet-pan-gnocchi-roasted-veggies",
  name: "Crispy Sheet-Pan Gnocchi with Roasted Veggies",
  effort: "quick",
  photoUrl: "/images/crispy-sheet-pan-gnocchi-roasted-veggies.jpg",
  tags: [
    "vegetarian",
    "dinner",
    "sheet-pan",
    "gnocchi",
    "roasted",
    "one-pan",
    "healthy",
    "comfort",
  ],
  isVegetarian: true,
  // Crispy Sheet-Pan Gnocchi with Roasted Veggies
suggestedSides: [
  "Simple green salad",
  "Garlic bread",
  "Roasted broccoli",
],
  notes:
    "Roasting shelf-stable gnocchi directly on the sheet pan gives it crispy edges and a soft center without boiling. Spread everything into a single layer so the vegetables roast instead of steam.",
  ingredients: `Sheet Pan:
1 (16 oz) package shelf-stable potato gnocchi
1 zucchini, sliced
1 bell pepper, chopped
1 small red onion, sliced
1 cup cherry tomatoes
3 tbsp olive oil

Seasoning:
1 tsp garlic powder
1 tsp Italian seasoning
1/2 tsp salt
1/4 tsp black pepper
1/4 tsp red pepper flakes (optional)

Finish:
1/4 cup parmesan cheese, grated
2 tbsp fresh basil, chopped
1 tbsp balsamic glaze (optional)`,
  instructions: `Preheat oven to 425°F.

Line a large sheet pan with parchment paper.

Add 1 package gnocchi, zucchini, bell pepper, red onion, and cherry tomatoes to the sheet pan.

Drizzle with 3 tbsp olive oil.

Sprinkle with 1 tsp garlic powder, 1 tsp Italian seasoning, 1/2 tsp salt, 1/4 tsp black pepper, and red pepper flakes if using.

Toss everything well until evenly coated and spread into a single layer.

Roast for 25 to 30 minutes, stirring halfway through, until the gnocchi is crispy on the outside and the vegetables are caramelized and tender.

Remove from the oven and immediately sprinkle with 1/4 cup parmesan cheese and 2 tbsp fresh basil.

Drizzle with balsamic glaze if desired and serve warm.`,
  translations: {
    es: {
      name: "Gnocchi Crujiente en Charola con Verduras Rostizadas",
      notes:
        "Rostizar el gnocchi directamente en la charola crea bordes crujientes y un centro suave sin necesidad de hervirlo. Extender todo en una sola capa ayuda a que las verduras se rosticen en lugar de cocinarse al vapor.",
      tags: [
        "vegetariano",
        "cena",
        "sheet-pan",
        "gnocchi",
        "rostizado",
        "una sartén",
        "saludable",
        "comfort",
      ],
      suggestedSides: [
        "Ensalada verde sencilla",
        "Pan de ajo",
        "Brócoli asado",
      ],
      ingredients: `Charola:
1 paquete (16 oz) de gnocchi de papa estable en estante
1 calabacín, en rodajas
1 pimiento morrón, picado
1 cebolla morada pequeña, en rodajas
1 cup de tomates cherry
3 Tbsp de aceite de oliva

Sazonadores:
1 tsp de ajo en polvo
1 tsp de sazón italiana
1/2 tsp de sal
1/4 tsp de pimienta negra
1/4 tsp de hojuelas de chile rojo (opcional)

Final:
1/4 cup de queso parmesano rallado
2 Tbsp de albahaca fresca, picada
1 Tbsp de glaseado balsámico (opcional)`,
      instructions: `Precalienta el horno a 425°F.

Cubre una charola grande con papel para hornear.

Agrega 1 paquete de gnocchi, calabacín, pimiento morrón, cebolla morada y tomates cherry a la charola.

Rocía con 3 Tbsp de aceite de oliva.

Espolvorea 1 tsp de ajo en polvo, 1 tsp de sazón italiana, 1/2 tsp de sal, 1/4 tsp de pimienta negra y hojuelas de chile rojo si las usas.

Mezcla bien hasta cubrir todo uniformemente y acomoda en una sola capa.

Hornea de 25 a 30 minutos, revolviendo a la mitad del tiempo, hasta que el gnocchi esté crujiente por fuera y las verduras caramelizadas y tiernas.

Retira del horno y agrega inmediatamente 1/4 cup de queso parmesano y 2 Tbsp de albahaca fresca.

Rocía con glaseado balsámico si deseas y sirve caliente.`,
    },
  },
},

{
  id: "creamy-shells-peas-parmesan",
  slug: "creamy-shells-peas-parmesan",
  name: "Creamy Shells with Peas and Parmesan",
  effort: "quick",
  photoUrl: "/images/creamy-shells-peas-parmesan.jpg",
  tags: [
    "vegetarian",
    "dinner",
    "pasta",
    "comfort",
    "creamy",
    "quick",
    "family",
  ],
  isVegetarian: true,
  // Creamy Shells with Peas and Parmesan
suggestedSides: [
  "Garlic bread",
  "Caesar salad",
  "Roasted carrots",
],
  notes:
    "The reserved pasta water helps create a silky sauce that clings perfectly to the shells. Adding the peas at the end keeps them bright green and tender instead of overcooked.",
  ingredients: `Pasta:
12 oz medium pasta shells
1 cup frozen peas

Sauce:
2 tbsp butter
3 cloves garlic, minced
1 cup heavy cream (or half-and-half for lighter)
3/4 cup parmesan cheese, grated
1/2 tsp garlic powder
1/2 tsp salt
1/4 tsp black pepper

Finish:
1/4 cup reserved pasta water
2 tbsp fresh parsley, chopped (optional)`,
  instructions: `Bring a large pot of salted water to a boil.

Cook 12 oz pasta shells according to package directions.

During the final 2 minutes of cooking, add 1 cup frozen peas to the pasta water.

Reserve 1/4 cup pasta water, then drain the pasta and peas.

In a large skillet over medium heat, melt 2 tbsp butter.

Add 3 cloves garlic and cook for 30 seconds until fragrant.

Pour in 1 cup heavy cream and bring to a gentle simmer.

Stir in 3/4 cup parmesan cheese, 1/2 tsp garlic powder, 1/2 tsp salt, and 1/4 tsp black pepper.

Cook 2 to 3 minutes, stirring frequently, until the sauce becomes smooth and lightly coats the back of a spoon.

Add the cooked shells and peas to the skillet and toss to coat evenly.

Add reserved pasta water a little at a time if needed to loosen the sauce.

Garnish with parsley if using and serve immediately.`,
  translations: {
    es: {
      name: "Conchas Cremosas con Chícharos y Parmesano",
      notes:
        "El agua reservada de la pasta ayuda a crear una salsa sedosa que se adhiere perfectamente a las conchas. Agregar los chícharos al final ayuda a mantenerlos verdes y tiernos en lugar de sobrecocinados.",
      tags: [
        "vegetariano",
        "cena",
        "pasta",
        "comfort",
        "cremoso",
        "rápido",
        "familiar",
      ],
      suggestedSides: [
        "Pan de ajo",
        "Ensalada César",
        "Zanahorias rostizadas",
      ],
      ingredients: `Pasta:
12 oz de pasta tipo conchas medianas
1 cup de chícharos congelados

Salsa:
2 Tbsp de mantequilla
3 dientes de ajo, picados
1 cup de crema espesa (o half-and-half para una versión más ligera)
3/4 cup de queso parmesano rallado
1/2 tsp de ajo en polvo
1/2 tsp de sal
1/4 tsp de pimienta negra

Final:
1/4 cup de agua reservada de la pasta
2 Tbsp de perejil fresco, picado (opcional)`,
      instructions: `Hierve una olla grande con agua y sal.

Cocina 12 oz de pasta tipo conchas según las instrucciones del paquete.

Durante los últimos 2 minutos de cocción, agrega 1 cup de chícharos congelados al agua de la pasta.

Reserva 1/4 cup del agua de cocción y luego escurre la pasta y los chícharos.

En una sartén grande a fuego medio, derrite 2 Tbsp de mantequilla.

Agrega 3 dientes de ajo y cocina 30 segundos hasta que estén fragantes.

Vierte 1 cup de crema espesa y lleva a fuego lento suave.

Agrega 3/4 cup de parmesano, 1/2 tsp de ajo en polvo, 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Cocina de 2 a 3 minutos, revolviendo frecuentemente, hasta que la salsa quede suave y cubra ligeramente el dorso de una cuchara.

Agrega las conchas y los chícharos cocidos a la sartén y mezcla bien para cubrirlos con la salsa.

Agrega poco a poco el agua reservada de la pasta si necesitas adelgazar la salsa.

Decora con perejil si deseas y sirve inmediatamente.`,
    },
  },
},

{
  id: "black-bean-corn-quesadillas",
  slug: "black-bean-corn-quesadillas",
  name: "Black Bean and Corn Quesadillas",
  effort: "quick",
  photoUrl: "/images/black-bean-corn-quesadillas.jpg",
  tags: [
    "vegetarian",
    "dinner",
    "quesadillas",
    "tex-mex",
    "quick",
    "family",
    "comfort",
  ],
  isVegetarian: true,
  // Black Bean and Corn Quesadillas
suggestedSides: [
  "Cilantro lime rice",
  "Chips and salsa",
  "Guacamole",
],
  notes:
    "Cooking quesadillas over medium heat allows the tortillas to crisp properly while giving the cheese time to melt completely. A light layer of butter or oil helps create a golden, restaurant-style finish.",
  ingredients: `Filling:
1 (15 oz) can black beans, drained and rinsed
1 cup corn kernels
1 cup cheddar cheese, shredded
1/2 tsp chili powder
1/2 tsp cumin
1/4 tsp garlic powder
1/4 tsp salt

Quesadillas:
4 large flour tortillas
1 tbsp butter or olive oil

Optional Toppings:
sour cream
salsa
guacamole
fresh cilantro
lime wedges`,
  instructions: `In a medium bowl, combine 1 can black beans, 1 cup corn, 1 cup cheddar cheese, 1/2 tsp chili powder, 1/2 tsp cumin, 1/4 tsp garlic powder, and 1/4 tsp salt.

Heat a large skillet over medium heat.

Lightly brush one side of each tortilla with butter or olive oil.

Place 1 tortilla into the skillet and spread about 1/4 of the filling over half of the tortilla.

Fold the tortilla over the filling and cook for 2 to 3 minutes until golden brown and crisp on the bottom.

Flip carefully and cook another 2 to 3 minutes until the cheese is melted and both sides are crispy.

Repeat with remaining tortillas and filling.

Slice into wedges and serve warm with desired toppings.`,
  translations: {
    es: {
      name: "Quesadillas de Frijoles Negros y Elote",
      notes:
        "Cocinar las quesadillas a fuego medio permite que las tortillas queden crujientes mientras el queso se derrite completamente. Una ligera capa de mantequilla o aceite ayuda a lograr un acabado dorado estilo restaurante.",
      tags: [
        "vegetariano",
        "cena",
        "quesadillas",
        "tex-mex",
        "rápido",
        "familiar",
        "comfort",
      ],
      suggestedSides: [
        "Arroz con cilantro y lima",
        "Totopos con salsa",
        "Guacamole",
      ],
      ingredients: `Relleno:
1 lata (15 oz) de frijoles negros, escurridos y enjuagados
1 cup de granos de elote
1 cup de queso cheddar rallado
1/2 tsp de chile en polvo
1/2 tsp de comino
1/4 tsp de ajo en polvo
1/4 tsp de sal

Quesadillas:
4 tortillas grandes de harina
1 Tbsp de mantequilla o aceite de oliva

Toppings Opcionales:
crema agria
salsa
guacamole
cilantro fresco
gajos de limón`,
      instructions: `En un tazón mediano, mezcla 1 lata de frijoles negros, 1 cup de elote, 1 cup de queso cheddar, 1/2 tsp de chile en polvo, 1/2 tsp de comino, 1/4 tsp de ajo en polvo y 1/4 tsp de sal.

Calienta una sartén grande a fuego medio.

Unta ligeramente un lado de cada tortilla con mantequilla o aceite de oliva.

Coloca 1 tortilla en la sartén y distribuye aproximadamente 1/4 del relleno sobre la mitad de la tortilla.

Dobla la tortilla sobre el relleno y cocina de 2 a 3 minutos hasta que esté dorada y crujiente por debajo.

Voltea cuidadosamente y cocina otros 2 a 3 minutos hasta que el queso se derrita y ambos lados estén crujientes.

Repite con las tortillas y relleno restantes.

Corta en triángulos y sirve caliente con los toppings deseados.`,
    },
  },
},

{
  id: "taco-style-lentil-sloppy-joes",
  slug: "taco-style-lentil-sloppy-joes",
  name: "Taco-Style Lentil Sloppy Joes",
  effort: "quick",
  photoUrl: "/images/taco-style-lentil-sloppy-joes.jpg",
  tags: [
    "vegetarian",
    "dinner",
    "sandwiches",
    "tex-mex",
    "comfort",
    "quick",
    "family",
  ],
  isVegetarian: true,
  // Taco-Style Lentil Sloppy Joes
suggestedSides: [
  "Sweet potato fries",
  "Coleslaw",
  "Pickle spears",
],
  notes:
    "Lentils create a hearty texture that works perfectly in sloppy joes while soaking up bold taco-style flavors. Letting the mixture simmer helps it thicken into a rich, scoopable filling.",
  ingredients: `Lentil Filling:
1 tbsp olive oil
1/2 onion, diced
1 bell pepper, diced
2 cloves garlic, minced
1 cup cooked lentils
1/2 cup tomato sauce
1/4 cup salsa
1 tbsp tomato paste

Seasoning:
1 tsp chili powder
1/2 tsp cumin
1/2 tsp smoked paprika
1/2 tsp garlic powder
1/2 tsp salt
1/4 tsp black pepper

Assembly:
4 hamburger buns
1/2 cup cheddar cheese, shredded

Optional Toppings:
avocado slices
jalapeños
cilantro
sour cream`,
  instructions: `Heat 1 tbsp olive oil in a large skillet over medium heat.

Add 1/2 diced onion and 1 diced bell pepper. Cook 5 to 6 minutes until softened.

Add 2 cloves garlic and cook 30 seconds until fragrant.

Stir in 1 cup cooked lentils, 1/2 cup tomato sauce, 1/4 cup salsa, and 1 tbsp tomato paste.

Add 1 tsp chili powder, 1/2 tsp cumin, 1/2 tsp smoked paprika, 1/2 tsp garlic powder, 1/2 tsp salt, and 1/4 tsp black pepper.

Simmer for 8 to 10 minutes, stirring occasionally, until the mixture thickens and becomes saucy.

Toast 4 hamburger buns if desired.

Spoon the lentil mixture onto the buns and top with 1/2 cup shredded cheddar cheese divided evenly.

Add desired toppings and serve warm.`,
  translations: {
    es: {
      name: "Sloppy Joes de Lentejas Estilo Taco",
      notes:
        "Las lentejas crean una textura abundante perfecta para sloppy joes mientras absorben los sabores intensos estilo taco. Cocinar la mezcla a fuego lento ayuda a espesarla y crear un relleno rico y fácil de servir.",
      tags: [
        "vegetariano",
        "cena",
        "sándwiches",
        "tex-mex",
        "comfort",
        "rápido",
        "familiar",
      ],
      suggestedSides: [
        "Papas fritas de camote",
        "Ensalada de col",
        "Pepinillos en tiras",
      ],
      ingredients: `Relleno de Lentejas:
1 Tbsp de aceite de oliva
1/2 cebolla, picada
1 pimiento morrón, picado
2 dientes de ajo, picados
1 cup de lentejas cocidas
1/2 cup de salsa de tomate
1/4 cup de salsa
1 Tbsp de pasta de tomate

Sazonadores:
1 tsp de chile en polvo
1/2 tsp de comino
1/2 tsp de paprika ahumada
1/2 tsp de ajo en polvo
1/2 tsp de sal
1/4 tsp de pimienta negra

Montaje:
4 panes para hamburguesa
1/2 cup de queso cheddar rallado

Toppings Opcionales:
rebanadas de aguacate
jalapeños
cilantro
crema agria`,
      instructions: `Calienta 1 Tbsp de aceite de oliva en una sartén grande a fuego medio.

Agrega 1/2 cebolla picada y 1 pimiento morrón picado. Cocina de 5 a 6 minutos hasta que estén suaves.

Agrega 2 dientes de ajo y cocina 30 segundos hasta que estén fragantes.

Incorpora 1 cup de lentejas cocidas, 1/2 cup de salsa de tomate, 1/4 cup de salsa y 1 Tbsp de pasta de tomate.

Agrega 1 tsp de chile en polvo, 1/2 tsp de comino, 1/2 tsp de paprika ahumada, 1/2 tsp de ajo en polvo, 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Cocina a fuego lento de 8 a 10 minutos, revolviendo ocasionalmente, hasta que la mezcla espese y quede jugosa.

Tuesta 4 panes para hamburguesa si lo deseas.

Coloca la mezcla de lentejas sobre los panes y agrega 1/2 cup de queso cheddar dividida uniformemente.

Añade los toppings deseados y sirve caliente.`,
    },
  },
},

{
  id: "normal-vegan-jambalaya",
  slug: "normal-vegan-jambalaya",
  name: "Vegan Jambalaya",
  effort: "normal",
  photoUrl: "/images/normal-vegan-jambalaya.jpg",
  tags: ["vegetarian", "vegan", "dinner", "one-pot", "healthy", "spicy", "leftovers-friendly"],
  isVegetarian: true,
  // Vegan Jambalaya
suggestedSides: [
  "Cornbread",
  "Side salad",
  "Roasted okra",
],
  notes: "Hearty, plant-based jambalaya with bold spices and a rich tomato base. Letting it rest before serving helps the rice finish absorbing flavor and improves texture.",
  ingredients: `2 Tbsp olive oil
1/2 large yellow onion, chopped
2 cloves garlic, minced
1/2 red bell pepper, chopped
1/2 green bell pepper, chopped
1 carrot, peeled and chopped
1 (14 oz) can crushed tomatoes
2 Tbsp soy sauce (or tamari)
1 tsp smoked paprika (or regular paprika)
1 tsp ground cumin
1 tsp dried oregano
1 tsp dried thyme
1 tsp garlic powder
1 tsp onion powder
1/2 tsp salt
1/4 tsp pepper
1/8 tsp cayenne pepper (optional)
1 cup uncooked white rice
3 cups vegetable stock
1 (15 oz) can chickpeas, drained and rinsed
1 (15 oz) can kidney beans, drained and rinsed
1 Tbsp tomato paste (optional, for deeper flavor)
1 Tbsp lemon juice (optional, for brightness)

Optional garnish:
fresh parsley, chopped`,
  instructions: `Heat 2 Tbsp olive oil in a large pot or Dutch oven over medium heat. Add 1/2 chopped large yellow onion, 1/2 chopped red bell pepper, 1/2 chopped green bell pepper, and 1 chopped carrot. Cook for 5 to 6 minutes until softened.

Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

Stir in 1 Tbsp tomato paste if using and cook for 1 minute to deepen flavor.

Add 1 can crushed tomatoes and cook for 4 to 5 minutes, stirring occasionally, until slightly thickened.

Stir in 2 Tbsp soy sauce, 1 tsp smoked paprika, 1 tsp ground cumin, 1 tsp dried oregano, 1 tsp dried thyme, 1 tsp garlic powder, 1 tsp onion powder, 1/2 tsp salt, 1/4 tsp pepper, and 1/8 tsp cayenne pepper if using. Cook for 1 minute to bloom the spices.

Add 1 cup uncooked white rice and 3 cups vegetable stock. Stir well and bring to a boil.

Reduce heat to low, cover, and simmer for 15 to 18 minutes, stirring once or twice, until the rice is tender and most of the liquid is absorbed.

Stir in 1 can drained and rinsed chickpeas and 1 can drained and rinsed kidney beans. Cook for 2 to 3 minutes until heated through.

Remove from heat and stir in 1 Tbsp lemon juice if using. Let sit for 5 minutes before serving.

Garnish with fresh chopped parsley if desired and serve warm.`,
  translations: {
    es: {
      name: "Jambalaya vegana",
      notes:
        "Jambalaya sustanciosa a base de plantas, con especias intensas y una base rica de tomate. Dejarla reposar antes de servir ayuda a que el arroz termine de absorber sabor y mejora la textura.",
      tags: [
        "vegetariano",
        "vegano",
        "cena",
        "una olla",
        "saludable",
        "picante",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Pan de maíz",
        "Ensalada sencilla",
        "Okra asada",
      ],
      ingredients: `2 Tbsp de aceite de oliva
1/2 cebolla amarilla grande, picada
2 dientes de ajo, picados
1/2 pimiento rojo, picado
1/2 pimiento verde, picado
1 zanahoria, pelada y picada
1 lata (14 oz) de tomates triturados
2 Tbsp de salsa de soya o tamari
1 tsp de paprika ahumada o paprika regular
1 tsp de comino molido
1 tsp de orégano seco
1 tsp de tomillo seco
1 tsp de ajo en polvo
1 tsp de cebolla en polvo
1/2 tsp de sal
1/4 tsp de pimienta
1/8 tsp de pimienta de cayena, opcional
1 cup de arroz blanco sin cocinar
3 cups de caldo de verduras
1 lata (15 oz) de garbanzos, escurridos y enjuagados
1 lata (15 oz) de frijoles rojos, escurridos y enjuagados
1 Tbsp de pasta de tomate, opcional para más sabor
1 Tbsp de jugo de limón, opcional para frescura

Decoración opcional:
perejil fresco, picado`,
      instructions: `Calienta 2 Tbsp de aceite de oliva en una olla grande o Dutch oven a fuego medio. Agrega 1/2 cebolla amarilla grande picada, 1/2 pimiento rojo picado, 1/2 pimiento verde picado y 1 zanahoria picada. Cocina de 5 a 6 minutos, hasta que se ablanden.

Agrega 2 dientes de ajo picados y cocina 30 segundos, hasta que suelte aroma.

Incorpora 1 Tbsp de pasta de tomate si la usas y cocina 1 minuto para intensificar el sabor.

Agrega 1 lata de tomates triturados y cocina de 4 a 5 minutos, revolviendo de vez en cuando, hasta que espese un poco.

Incorpora 2 Tbsp de salsa de soya, 1 tsp de paprika ahumada, 1 tsp de comino molido, 1 tsp de orégano seco, 1 tsp de tomillo seco, 1 tsp de ajo en polvo, 1 tsp de cebolla en polvo, 1/2 tsp de sal, 1/4 tsp de pimienta y 1/8 tsp de cayena si la usas. Cocina 1 minuto para activar las especias.

Agrega 1 cup de arroz blanco sin cocinar y 3 cups de caldo de verduras. Mezcla bien y lleva a hervor.

Reduce el fuego a bajo, tapa y cocina de 15 a 18 minutos, revolviendo una o dos veces, hasta que el arroz esté tierno y la mayor parte del líquido se haya absorbido.

Incorpora 1 lata de garbanzos escurridos y enjuagados, y 1 lata de frijoles rojos escurridos y enjuagados. Cocina de 2 a 3 minutos, hasta que estén calientes.

Retira del fuego e incorpora 1 Tbsp de jugo de limón si lo usas. Deja reposar 5 minutos antes de servir.

Decora con perejil fresco picado si deseas y sirve caliente.`,
    },
  },
},

{
  id: "quick-black-bean-quesadillas",
  slug: "quick-black-bean-quesadillas",
  name: "Black Bean Quesadillas",
  effort: "quick",
  photoUrl: "/images/quick-black-bean-quesadillas.jpg",
  tags: ["vegetarian", "dinner", "quick", "mexican", "kid-friendly", "skillet", "one-pan", "leftovers-friendly"],
  isVegetarian: true,
  // Black Bean Quesadillas
suggestedSides: [
  "Chips and salsa",
  "Mexican street corn",
  "Cilantro lime rice",
],
  notes: "Quick and satisfying quesadillas with creamy black beans and melted cheese. Mashing some of the beans helps everything hold together and creates a better texture.",
  ingredients: `4 small flour tortillas
1 cup cheddar cheese, shredded
1 (15 oz) can black beans, drained and rinsed
1/2 cup salsa (plus extra for serving)
1 Tbsp olive oil or butter
1/2 tsp cumin (optional, for extra flavor)
1/2 tsp garlic powder
1/4 tsp salt
1/4 tsp pepper`,
  instructions: `Heat a large skillet over medium heat.

In a small bowl, lightly mash about half of 1 can of drained and rinsed black beans with a fork to help them hold together. Stir in 1/2 tsp cumin if using, 1/2 tsp garlic powder, 1/4 tsp salt, and 1/4 tsp pepper.

Place one of the 4 small flour tortillas in the skillet and sprinkle a layer of shredded cheddar cheese over half of it.

Add a layer of the seasoned black beans, then a spoonful of salsa, followed by a little more of the cheese.

Fold the tortilla over and cook for 2 to 3 minutes, until the bottom is golden and crispy.

Flip and cook another 2 to 3 minutes, until the cheese is fully melted and the tortilla is crisp.

Repeat with the remaining tortillas, adding 1 Tbsp olive oil or butter to the pan as needed.

Slice and serve warm with extra salsa.`,
  translations: {
    es: {
      name: "Quesadillas de frijoles negros",
      notes:
        "Quesadillas rápidas y satisfactorias con frijoles negros cremosos y queso derretido. Machacar parte de los frijoles ayuda a que todo se mantenga unido y mejora la textura.",
      tags: [
        "vegetariano",
        "cena",
        "rápido",
        "mexicano",
        "para niños",
        "sartén",
        "una sartén",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Totopos con salsa",
        "Elote estilo mexicano",
        "Arroz con cilantro y lima",
      ],
      ingredients: `4 tortillas de harina pequeñas
1 cup de queso cheddar rallado
1 lata (15 oz) de frijoles negros, escurridos y enjuagados
1/2 cup de salsa, más extra para servir
1 Tbsp de aceite de oliva o mantequilla
1/2 tsp de comino, opcional para más sabor
1/2 tsp de ajo en polvo
1/4 tsp de sal
1/4 tsp de pimienta`,
      instructions: `Calienta un sartén grande a fuego medio.

En un tazón pequeño, machaca ligeramente aproximadamente la mitad de 1 lata de frijoles negros escurridos y enjuagados con un tenedor para ayudar a que se mantengan unidos. Incorpora 1/2 tsp de comino si lo usas, 1/2 tsp de ajo en polvo, 1/4 tsp de sal y 1/4 tsp de pimienta.

Coloca una de las 4 tortillas de harina pequeñas en el sartén y espolvorea una capa de queso cheddar rallado sobre la mitad.

Agrega una capa de frijoles negros sazonados, luego una Tbsp de salsa y un poco más de queso.

Dobla la tortilla y cocina de 2 a 3 minutos, hasta que la parte inferior esté dorada y crujiente.

Voltea y cocina otros 2 a 3 minutos, hasta que el queso esté completamente derretido y la tortilla esté crujiente.

Repite con las tortillas restantes, agregando 1 Tbsp de aceite de oliva o mantequilla al sartén según sea necesario.

Corta y sirve caliente con más salsa.`,
    },
  },
},

{
  id: "quick-pesto-naan-pizzas",
  slug: "quick-pesto-naan-pizzas",
  name: "Pesto Naan Pizzas",
  effort: "quick",
  photoUrl: "/images/quick-pesto-naan-pizzas.jpg",
  tags: ["vegetarian", "dinner", "quick", "pizza", "kid-friendly", "one-pan", "leftovers-friendly"],
  isVegetarian: true,
  // Pesto Naan Pizzas
suggestedSides: [
  "Simple green salad",
  "Fruit salad",
  "Roasted broccoli",
],
  notes: "Quick and flavorful naan pizzas with bright pesto and melty cheese. Brushing the edges with olive oil helps create a crisp, golden crust.",
  ingredients: `2 naan breads
1/4 cup basil pesto
1 cup mozzarella cheese, shredded
1/2 cup cherry tomatoes, halved
1 Tbsp olive oil
1/4 cup Parmesan cheese, grated (optional)
1/2 tsp garlic powder
1 Tbsp fresh basil, chopped (optional)`,
  instructions: `Preheat oven to 400°F. Place 2 naan breads on a baking sheet.

Lightly brush the edges of the naan with 1 Tbsp olive oil for a crispier crust.

Spread 1/4 cup basil pesto evenly over each naan, leaving a small border around the edges.

Sprinkle 1 cup shredded mozzarella evenly over the top, followed by 1/2 cup halved cherry tomatoes and 1/4 cup grated Parmesan if using.

Sprinkle lightly with 1/2 tsp garlic powder.

Bake for 8 to 10 minutes, until the cheese is melted, bubbly, and the edges are lightly crisp.

For extra browning, broil on high for 1 to 2 minutes, watching closely.

Remove from oven and top with 1 Tbsp fresh chopped basil if desired. Slice and serve immediately.`,
  translations: {
    es: {
      name: "Pizzas de naan con pesto",
      notes:
        "Pizzas rápidas de naan con pesto fresco y queso derretido. Barnizar los bordes con aceite de oliva ayuda a crear una corteza dorada y crujiente.",
      tags: [
        "vegetariano",
        "cena",
        "rápido",
        "pizza",
        "para niños",
        "una bandeja",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Ensalada verde sencilla",
        "Ensalada de frutas",
        "Brócoli asado",
      ],
      ingredients: `2 panes naan
1/4 cup de pesto de albahaca
1 cup de queso mozzarella rallado
1/2 cup de tomates cherry, cortados por la mitad
1 Tbsp de aceite de oliva
1/4 cup de queso parmesano rallado, opcional
1/2 tsp de ajo en polvo
1 Tbsp de albahaca fresca, picada, opcional`,
      instructions: `Precalienta el horno a 400°F. Coloca 2 panes naan en una bandeja para hornear.

Barniza ligeramente los bordes del naan con 1 Tbsp de aceite de oliva para una corteza más crujiente.

Extiende 1/4 cup de pesto de albahaca de manera uniforme sobre cada naan, dejando un borde pequeño alrededor.

Espolvorea 1 cup de mozzarella rallada de manera uniforme encima, seguido de 1/2 cup de tomates cherry partidos por la mitad y 1/4 cup de parmesano rallado si lo usas.

Espolvorea ligeramente con 1/2 tsp de ajo en polvo.

Hornea de 8 a 10 minutos, hasta que el queso esté derretido, burbujeante y los bordes estén ligeramente crujientes.

Para dorar más, gratina en alto de 1 a 2 minutos, vigilando de cerca.

Retira del horno y cubre con 1 Tbsp de albahaca fresca picada si deseas. Corta y sirve de inmediato.`,
    },
  },
},

{
  id: "quick-jamaican-jerk-tofu",
  slug: "quick-jamaican-jerk-tofu",
  name: "Jamaican Jerk Tofu",
  effort: "quick",
  photoUrl: "/images/quick-jamaican-jerk-tofu.jpg",
  tags: ["vegetarian", "vegan", "dinner", "quick", "spicy", "skillet", "healthy", "one-pan", "leftovers-friendly"],
  isVegetarian: true,
  // Jamaican Jerk Tofu
suggestedSides: [
  "Coconut rice",
  "Grilled pineapple",
  "Cucumber salad",
],
  notes: "Bold, spicy jerk tofu with crisp edges and tender vegetables. Pressing the tofu and letting it sear undisturbed are key to getting a great texture.",
  ingredients: `1 (14 oz) block extra-firm tofu, pressed
2 Tbsp Jamaican jerk seasoning
1 Tbsp olive oil
1 Tbsp soy sauce (or tamari)
1 tsp brown sugar (optional, to balance heat)
1 cup bell peppers, sliced
1/2 small red onion, sliced
1 Tbsp lime juice (optional, for brightness)
1 Tbsp cornstarch (optional, for extra crispiness)`,
  instructions: `Press 1 block extra-firm tofu for at least 10 to 15 minutes to remove excess moisture, then cut into bite-sized cubes.

In a bowl, toss the tofu with 2 Tbsp Jamaican jerk seasoning, 1 Tbsp soy sauce or tamari, and 1 tsp brown sugar if using. For extra crispiness, lightly coat with 1 Tbsp cornstarch.

Heat 1 Tbsp olive oil in a large skillet over medium-high heat.

Add the tofu in a single layer and cook for 4 to 5 minutes without moving, until golden and crisp on one side.

Flip and cook another 3 to 4 minutes until crisp on multiple sides.

Add 1 cup sliced bell peppers and 1/2 sliced small red onion to the skillet. Cook for 4 to 5 minutes, stirring occasionally, until tender but still slightly crisp.

Drizzle with 1 Tbsp lime juice if using and toss everything together.

Serve hot.`,
  translations: {
    es: {
      name: "Tofu jerk jamaicano",
      notes:
        "Tofu jerk intenso y picante, con bordes crujientes y verduras tiernas. Prensar el tofu y dejarlo sellar sin moverlo es clave para lograr buena textura.",
      tags: [
        "vegetariano",
        "vegano",
        "cena",
        "rápido",
        "picante",
        "sartén",
        "saludable",
        "una sartén",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Arroz con coco",
        "Piña a la parrilla",
        "Ensalada de pepino",
      ],
      ingredients: `1 bloque (14 oz) de tofu extra firme, prensado
2 Tbsp de sazonador jerk jamaicano
1 Tbsp de aceite de oliva
1 Tbsp de salsa de soya o tamari
1 tsp de azúcar morena, opcional para balancear el picante
1 cup de pimientos, rebanados
1/2 cebolla roja pequeña, rebanada
1 Tbsp de jugo de lima, opcional para frescura
1 Tbsp de maicena, opcional para más crujiente`,
      instructions: `Prensa 1 bloque de tofu extra firme durante al menos 10 a 15 minutos para retirar el exceso de humedad, luego córtalo en cubos pequeños.

En un tazón, mezcla el tofu con 2 Tbsp de sazonador jerk jamaicano, 1 Tbsp de salsa de soya o tamari y 1 tsp de azúcar morena si la usas. Para más crujiente, cubre ligeramente con 1 Tbsp de maicena.

Calienta 1 Tbsp de aceite de oliva en un sartén grande a fuego medio-alto.

Agrega el tofu en una sola capa y cocina de 4 a 5 minutos sin moverlo, hasta que esté dorado y crujiente por un lado.

Voltea y cocina otros 3 a 4 minutos, hasta que esté crujiente por varios lados.

Agrega 1 cup de pimientos rebanados y 1/2 cebolla roja pequeña rebanada al sartén. Cocina de 4 a 5 minutos, revolviendo de vez en cuando, hasta que estén tiernos pero aún ligeramente crujientes.

Rocía con 1 Tbsp de jugo de lima si lo usas y mezcla todo.

Sirve caliente.`,
    },
  },
},

  {
  id: "big-vegetarian-shepherds-pie",
  slug: "big-vegetarian-shepherds-pie",
  name: "Vegetarian Shepherd’s Pie",
  effort: "big",
  photoUrl: "/images/big-vegetarian-shepherds-pie.jpg",
  tags: ["vegetarian", "dinner", "bake", "comfort", "casserole", "family-friendly", "leftovers-friendly"],
  isVegetarian: true,
  // Vegetarian Shepherd’s Pie
suggestedSides: [
  "Dinner rolls",
  "Side salad",
  "Roasted carrots",
],
  notes: "Hearty vegetarian shepherd’s pie with a rich lentil filling and creamy mashed potato topping. Letting it rest before serving helps the layers hold together and improves texture.",
  ingredients: `1 1/2 cups cooked lentils
4 large potatoes, peeled and chopped
2 cups mixed vegetables (carrots, peas, corn)
1 cup vegetable broth
1/4 cup milk
2 Tbsp butter
1 Tbsp olive oil
1 small yellow onion, diced
2 cloves garlic, minced
1 Tbsp tomato paste (optional, for depth)
1 tsp dried thyme (optional)
1/2 tsp salt (plus more to taste)
1/2 tsp pepper
1/2 cup shredded cheddar cheese (optional, for topping)`,
  instructions: `Preheat oven to 400°F. Lightly grease a baking dish.

Bring a large pot of salted water to a boil. Add 4 large peeled and chopped potatoes and cook for 12 to 15 minutes until fork-tender. Drain and mash with 2 Tbsp butter and 1/4 cup milk until smooth. Season with salt and 1/2 tsp pepper and set aside.

Heat 1 Tbsp olive oil in a large skillet over medium heat. Add 1 small diced yellow onion and cook for 4 to 5 minutes until softened.

Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

Stir in 2 cups mixed vegetables and cook for 5 to 7 minutes until tender.

Add 1 1/2 cups cooked lentils, 1 cup vegetable broth, 1 Tbsp tomato paste, and 1 tsp dried thyme if using. Stir well and simmer for 5 to 7 minutes until the mixture thickens slightly.

Season to taste with additional salt and pepper.

Transfer the lentil mixture to the prepared baking dish and spread evenly.

Top with the mashed potatoes, spreading to the edges. Use a fork to create texture on top for better browning.

Sprinkle with 1/2 cup shredded cheddar cheese if using.

Bake for 20 to 25 minutes, until heated through and the top is lightly golden.

For extra browning, broil on high for 2 to 3 minutes at the end, watching closely.

Let rest for 5 to 10 minutes before serving.`,
  translations: {
    es: {
      name: "Pastel vegetariano con puré",
      notes:
        "Un pastel vegetariano sustancioso con relleno rico de lentejas y una cubierta cremosa de puré de papas. Dejarlo reposar antes de servir ayuda a que las capas se mantengan juntas y mejora la textura.",
      tags: [
        "vegetariano",
        "cena",
        "horneado",
        "comida reconfortante",
        "cazuela",
        "familiar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Panecillos",
        "Ensalada sencilla",
        "Zanahorias rostizadas",
      ],
      ingredients: `1 1/2 cups de lentejas cocidas
4 papas grandes, peladas y picadas
2 cups de verduras mixtas (zanahorias, chícharos, maíz)
1 cup de caldo de verduras
1/4 cup de leche
2 Tbsp de mantequilla
1 Tbsp de aceite de oliva
1 cebolla amarilla pequeña, picada en cubitos
2 dientes de ajo, picados
1 Tbsp de pasta de tomate, opcional para más profundidad
1 tsp de tomillo seco, opcional
1/2 tsp de sal, más al gusto
1/2 tsp de pimienta
1/2 cup de queso cheddar rallado, opcional para cubrir`,
      instructions: `Precalienta el horno a 400°F. Engrasa ligeramente un molde para hornear.

Hierve una olla grande con agua salada. Agrega 4 papas grandes peladas y picadas, y cocina de 12 a 15 minutos hasta que estén tiernas al pincharlas con un tenedor. Escurre y machaca con 2 Tbsp de mantequilla y 1/4 cup de leche hasta que quede suave. Sazona con sal y 1/2 tsp de pimienta, y reserva.

Calienta 1 Tbsp de aceite de oliva en un sartén grande a fuego medio. Agrega 1 cebolla amarilla pequeña picada y cocina de 4 a 5 minutos, hasta que se ablande.

Agrega 2 dientes de ajo picados y cocina 30 segundos, hasta que suelte aroma.

Incorpora 2 cups de verduras mixtas y cocina de 5 a 7 minutos, hasta que estén tiernas.

Agrega 1 1/2 cups de lentejas cocidas, 1 cup de caldo de verduras, 1 Tbsp de pasta de tomate y 1 tsp de tomillo seco si lo usas. Mezcla bien y cocina a fuego bajo de 5 a 7 minutos, hasta que la mezcla espese un poco.

Sazona al gusto con más sal y pimienta.

Pasa la mezcla de lentejas al molde preparado y extiéndela de manera uniforme.

Cubre con el puré de papas, extendiéndolo hasta los bordes. Usa un tenedor para crear textura encima y lograr mejor dorado.

Espolvorea con 1/2 cup de queso cheddar rallado si lo usas.

Hornea de 20 a 25 minutos, hasta que esté caliente y la parte superior esté ligeramente dorada.

Para más dorado, gratina en alto de 2 a 3 minutos al final, vigilando de cerca.

Deja reposar de 5 a 10 minutos antes de servir.`,
    },
  },
},

{
  id: "quick-creamy-tortellini",
  slug: "quick-creamy-tortellini",
  name: "Creamy Spinach Tortellini",
  effort: "quick",
  photoUrl: "/images/quick-creamy-tortellini.jpg",
  tags: ["vegetarian", "dinner", "pasta", "quick", "comfort", "one-pan", "leftovers-friendly"],
  isVegetarian: true,
  // Creamy Spinach Tortellini
suggestedSides: [
  "Garlic bread",
  "Caesar salad",
  "Roasted broccoli",
],
  notes: "Creamy, comforting tortellini with a smooth Parmesan sauce. Adding pasta water helps create a silky texture that clings perfectly to the pasta.",
  ingredients: `1 (20 oz) package cheese tortellini
1 Tbsp olive oil or butter
2 cloves garlic, minced
1 cup heavy cream
1/2 cup Parmesan cheese, freshly grated
2 cups fresh spinach
1/2 cup reserved pasta water
1/2 tsp salt (plus more to taste)
1/4 tsp pepper
1/4 tsp red pepper flakes (optional)
1 Tbsp lemon juice (optional, for brightness)`,
  instructions: `Bring a large pot of salted water to a boil. Cook 1 package cheese tortellini according to package directions. Reserve 1/2 cup pasta water, then drain.

Heat 1 Tbsp olive oil or butter in a large skillet over medium heat. Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

Pour in 1 cup heavy cream and bring to a gentle simmer. Cook for 3 to 4 minutes, stirring occasionally, until slightly thickened.

Stir in 1/2 cup freshly grated Parmesan cheese gradually, whisking until smooth.

Add 2 cups fresh spinach and cook for 1 to 2 minutes until wilted.

Add the cooked tortellini to the skillet and toss to coat. Add a splash of the reserved pasta water as needed to loosen the sauce and make it silky.

Season with 1/2 tsp salt, 1/4 tsp pepper, and 1/4 tsp red pepper flakes if using.

Remove from heat and stir in 1 Tbsp lemon juice if desired. Serve immediately.`,
  translations: {
    es: {
      name: "Tortellini cremoso con espinaca",
      notes:
        "Tortellini cremoso y reconfortante con una salsa suave de parmesano. Agregar agua de la pasta ayuda a crear una textura sedosa que se adhiere perfectamente a la pasta.",
      tags: [
        "vegetariano",
        "cena",
        "pasta",
        "rápido",
        "comida reconfortante",
        "una sartén",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Pan de ajo",
        "Ensalada César",
        "Brócoli asado",
      ],
      ingredients: `1 paquete (20 oz) de tortellini de queso
1 Tbsp de aceite de oliva o mantequilla
2 dientes de ajo, picados
1 cup de crema espesa
1/2 cup de queso parmesano recién rallado
2 cups de espinaca fresca
1/2 cup de agua reservada de la pasta
1/2 tsp de sal, más al gusto
1/4 tsp de pimienta
1/4 tsp de hojuelas de chile rojo, opcional
1 Tbsp de jugo de limón, opcional para frescura`,
      instructions: `Hierve una olla grande con agua salada. Cocina 1 paquete de tortellini de queso según las instrucciones del paquete. Reserva 1/2 cup de agua de la pasta y luego escurre.

Calienta 1 Tbsp de aceite de oliva o mantequilla en un sartén grande a fuego medio. Agrega 2 dientes de ajo picados y cocina 30 segundos, hasta que suelte aroma.

Vierte 1 cup de crema espesa y lleva a un hervor suave. Cocina de 3 a 4 minutos, revolviendo de vez en cuando, hasta que espese un poco.

Incorpora gradualmente 1/2 cup de queso parmesano recién rallado, batiendo hasta que quede suave.

Agrega 2 cups de espinaca fresca y cocina de 1 a 2 minutos, hasta que se marchite.

Agrega el tortellini cocido al sartén y mezcla para cubrirlo. Agrega un chorrito del agua reservada de la pasta según sea necesario para aflojar la salsa y hacerla sedosa.

Sazona con 1/2 tsp de sal, 1/4 tsp de pimienta y 1/4 tsp de hojuelas de chile rojo si las usas.

Retira del fuego e incorpora 1 Tbsp de jugo de limón si deseas. Sirve de inmediato.`,
    },
  },
},

{
  id: "big-spinach-ricotta-stuffed-shells",
  slug: "big-spinach-ricotta-stuffed-shells",
  name: "Spinach and Ricotta Stuffed Shells",
  effort: "big",
  photoUrl: "/images/big-spinach-ricotta-stuffed-shells.jpg",
  tags: ["vegetarian", "dinner", "pasta", "bake", "comfort", "italian", "family-friendly", "leftovers-friendly"],
  isVegetarian: true,
  // Spinach and Ricotta Stuffed Shells
suggestedSides: [
  "Garlic bread",
  "Caesar salad",
  "Roasted zucchini",
],
  notes: "Classic stuffed shells with a creamy ricotta and spinach filling. Adding an egg helps bind the filling, and baking covered first keeps everything moist before finishing uncovered for a golden top.",
  ingredients: `1 box jumbo pasta shells
1 (15 oz) ricotta cheese
2 cups fresh spinach, chopped
1 (24 oz) marinara sauce
1 cup mozzarella cheese, shredded
1/2 cup Parmesan cheese, grated
1 large egg
2 cloves garlic, minced
1/2 tsp salt
1/2 tsp pepper
1/2 tsp dried Italian seasoning (optional)`,
  instructions: `Preheat oven to 375°F. Lightly grease a 9x13 baking dish.

Bring a large pot of salted water to a boil. Cook 1 box jumbo pasta shells until al dente, about 1 to 2 minutes less than package directions. Drain and set aside to cool slightly.

In a large bowl, combine 15 oz ricotta cheese, 2 cups chopped fresh spinach, 1/2 cup shredded mozzarella, 1/2 cup grated Parmesan, 1 large egg, 2 minced cloves garlic, 1/2 tsp salt, 1/2 tsp pepper, and 1/2 tsp dried Italian seasoning if using. Mix until smooth and well combined.

Spread a thin layer of 1 jar marinara sauce on the bottom of the baking dish.

Stuff each cooked shell with the ricotta mixture and arrange them in the dish.

Pour the remaining marinara sauce evenly over the shells, then sprinkle with the remaining 1/2 cup mozzarella.

Cover loosely with foil and bake for 20 minutes.

Remove foil and bake an additional 10 to 15 minutes, until the cheese is melted and bubbly with lightly golden edges.

Let rest for 5 to 10 minutes before serving.`,
  translations: {
    es: {
      name: "Conchas rellenas de espinaca y ricotta",
      notes:
        "Conchas rellenas clásicas con un relleno cremoso de ricotta y espinaca. Agregar huevo ayuda a unir el relleno, y hornear cubierto primero mantiene todo húmedo antes de terminar sin cubrir para dorar la parte superior.",
      tags: [
        "vegetariano",
        "cena",
        "pasta",
        "horneado",
        "comida reconfortante",
        "italiana",
        "familiar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Pan de ajo",
        "Ensalada César",
        "Calabacín asado",
      ],
      ingredients: `1 caja de conchas jumbo de pasta
1 envase (15 oz) de queso ricotta
2 cups de espinaca fresca, picada
1 frasco (24 oz) de salsa marinara
1 cup de queso mozzarella rallado
1/2 cup de queso parmesano rallado
1 huevo grande
2 dientes de ajo, picados
1/2 tsp de sal
1/2 tsp de pimienta
1/2 tsp de sazonador italiano seco, opcional`,
      instructions: `Precalienta el horno a 375°F. Engrasa ligeramente un molde para hornear de 9x13.

Hierve una olla grande con agua salada. Cocina 1 caja de conchas jumbo de pasta hasta que estén al dente, aproximadamente 1 a 2 minutos menos que las instrucciones del paquete. Escurre y reserva para que se enfríen un poco.

En un tazón grande, combina 15 oz de queso ricotta, 2 cups de espinaca fresca picada, 1/2 cup de mozzarella rallada, 1/2 cup de parmesano rallado, 1 huevo grande, 2 dientes de ajo picados, 1/2 tsp de sal, 1/2 tsp de pimienta y 1/2 tsp de sazonador italiano seco si lo usas. Mezcla hasta que quede suave y bien combinado.

Extiende una capa delgada de 1 frasco de salsa marinara en el fondo del molde.

Rellena cada concha cocida con la mezcla de ricotta y acomódalas en el molde.

Vierte la salsa marinara restante de manera uniforme sobre las conchas, luego espolvorea con la 1/2 cup restante de mozzarella.

Cubre sin apretar con papel aluminio y hornea durante 20 minutos.

Retira el papel aluminio y hornea otros 10 a 15 minutos, hasta que el queso esté derretido y burbujeante, con bordes ligeramente dorados.

Deja reposar de 5 a 10 minutos antes de servir.`,
    },
  },
},

{
  id: "normal-chickpea-curry",
  slug: "normal-chickpea-curry",
  name: "Chickpea Curry",
  effort: "normal",
  photoUrl: "/images/normal-chickpea-curry.jpg",
  tags: ["vegetarian", "vegan", "dinner", "curry", "chickpeas", "one-pot", "comfort", "leftovers-friendly"],
  isVegetarian: true,
  // Chickpea Curry
suggestedSides: [
  "Basmati rice",
  "Naan",
  "Cucumber yogurt salad",
],
  notes: "Creamy, warmly spiced chickpea curry with a tomato-coconut sauce. Great with basmati rice, naan, or a simple cucumber yogurt salad.",
  ingredients: `2 (15 oz) cans chickpeas, drained and rinsed
1 Tbsp olive oil
1 small yellow onion, finely diced
3 cloves garlic, minced
1 medium red bell pepper, diced
1 Tbsp fresh ginger, grated
1 tsp ground cumin
1 tsp ground coriander
1 tsp turmeric
1/2 tsp smoked paprika
1/2 tsp chili powder
1 tsp salt, to taste
1 (14 oz) can crushed tomatoes
1 (13.5 oz) can full-fat coconut milk
1/2 cup vegetable broth
1 tsp sugar (optional)
juice of 1/2 lemon
1/4 cup fresh cilantro, chopped
cooked basmati rice`,
  instructions: `Heat 1 Tbsp olive oil in a large skillet or Dutch oven over medium heat. Add 1 finely diced small yellow onion and 1 diced medium red bell pepper and cook for 5 to 7 minutes, stirring occasionally, until softened and lightly golden.

Add 3 minced cloves garlic and 1 Tbsp grated fresh ginger. Cook for 1 to 2 minutes, stirring often, until fragrant.

Add 1 tsp ground cumin, 1 tsp ground coriander, 1 tsp turmeric, 1/2 tsp smoked paprika, 1/2 tsp chili powder, and 1 tsp salt. Stir constantly for 30 to 60 seconds over medium-low heat to bloom the spices.

Pour in 1 can crushed tomatoes and stir well. Cook for 5 minutes, stirring occasionally, until the mixture thickens slightly and deepens in color.

Add 2 cans drained and rinsed chickpeas, 1 can full-fat coconut milk, 1/2 cup vegetable broth, and 1 tsp sugar if using. Stir to combine, then bring to a gentle simmer over medium heat.

Reduce the heat to low and simmer uncovered for 15 to 20 minutes, stirring occasionally, until the sauce thickens and coats the back of a spoon.

Stir in the juice of 1/2 lemon and 1/4 cup chopped fresh cilantro. Taste and adjust salt if needed.

Serve hot over cooked basmati rice or with warm naan.`,
  translations: {
    es: {
      name: "Curry de garbanzos",
      notes:
        "Curry de garbanzos cremoso y cálidamente especiado, con salsa de tomate y coco. Queda muy bien con arroz basmati, naan o una ensalada sencilla de pepino con yogur.",
      tags: [
        "vegetariano",
        "vegano",
        "cena",
        "curry",
        "garbanzos",
        "una olla",
        "comida reconfortante",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Arroz basmati",
        "Naan",
        "Ensalada de pepino con yogur",
      ],
      ingredients: `2 latas (15 oz) de garbanzos, escurridos y enjuagados
1 Tbsp de aceite de oliva
1 cebolla amarilla pequeña, finamente picada
3 dientes de ajo, picados
1 pimiento rojo mediano, picado en cubitos
1 Tbsp de jengibre fresco, rallado
1 tsp de comino molido
1 tsp de cilantro molido
1 tsp de cúrcuma
1/2 tsp de paprika ahumada
1/2 tsp de chile en polvo
1 tsp de sal, al gusto
1 lata (14 oz) de tomates triturados
1 lata (13.5 oz) de leche de coco entera
1/2 cup de caldo de verduras
1 tsp de azúcar, opcional
jugo de 1/2 limón
1/4 cup de cilantro fresco, picado
arroz basmati cocido`,
      instructions: `Calienta 1 Tbsp de aceite de oliva en un sartén grande o Dutch oven a fuego medio. Agrega 1 cebolla amarilla pequeña finamente picada y 1 pimiento rojo mediano picado, y cocina de 5 a 7 minutos, revolviendo de vez en cuando, hasta que se ablanden y se doren ligeramente.

Agrega 3 dientes de ajo picados y 1 Tbsp de jengibre fresco rallado. Cocina de 1 a 2 minutos, revolviendo con frecuencia, hasta que suelte aroma.

Agrega 1 tsp de comino molido, 1 tsp de cilantro molido, 1 tsp de cúrcuma, 1/2 tsp de paprika ahumada, 1/2 tsp de chile en polvo y 1 tsp de sal. Revuelve constantemente de 30 a 60 segundos a fuego medio-bajo para activar las especias.

Vierte 1 lata de tomates triturados y mezcla bien. Cocina 5 minutos, revolviendo de vez en cuando, hasta que la mezcla espese ligeramente y el color se intensifique.

Agrega 2 latas de garbanzos escurridos y enjuagados, 1 lata de leche de coco entera, 1/2 cup de caldo de verduras y 1 tsp de azúcar si la usas. Mezcla para combinar y lleva a un hervor suave a fuego medio.

Reduce el fuego a bajo y cocina sin tapar de 15 a 20 minutos, revolviendo de vez en cuando, hasta que la salsa espese y cubra el dorso de una cuchara.

Incorpora el jugo de 1/2 limón y 1/4 cup de cilantro fresco picado. Prueba y ajusta la sal si es necesario.

Sirve caliente sobre arroz basmati cocido o con naan caliente.`,
    },
  },
},

{
  id: "normal-spicy-tofu-mushroom-hash",
  slug: "normal-spicy-tofu-mushroom-hash",
  name: "Vegetarian Spicy Skillet Hash",
  effort: "normal",
  photoUrl: "/images/normal-spicy-tofu-mushroom-hash.jpg",
  tags: ["vegetarian", "vegan", "dinner", "skillet", "spicy", "healthy", "one-pan", "leftovers-friendly"],
  isVegetarian: true,
  // Vegetarian Spicy Skillet Hash
suggestedSides: [
  "Simple green salad",
  "Avocado slices",
  "Toast",
],
  notes: "Crispy, hearty skillet hash with bold Cajun flavor. Letting the tofu and potatoes cook undisturbed helps develop a golden crust and great texture.",
  ingredients: `1 (14 oz) block firm tofu, pressed and cubed
2 cups king oyster mushrooms, sliced
2 cups potatoes, diced (small cubes for even cooking)
1 cup bell peppers, diced
2 Tbsp Cajun spice blend
2 Tbsp olive oil
1/2 tsp salt (plus more to taste)
1/2 tsp pepper
1 Tbsp soy sauce (optional, for depth)
1/2 tsp smoked paprika (optional)
1 Tbsp fresh parsley, chopped (optional)`,
  instructions: `Heat 1 Tbsp olive oil in a large skillet over medium-high heat.

Add 2 cups diced potatoes in a single layer and cook for 10 to 12 minutes, stirring occasionally, until golden, crispy on the edges, and tender inside. Season lightly with 1/2 tsp salt and 1/2 tsp pepper.

While potatoes cook, pat 1 block cubed firm tofu dry with paper towels for better browning.

Push potatoes to one side of the skillet. Add the remaining 1 Tbsp olive oil to the empty side, then add the tofu and 2 cups sliced king oyster mushrooms.

Cook undisturbed for 3 to 4 minutes to develop a golden crust, then stir and continue cooking for another 3 to 4 minutes until browned.

Add 1 cup diced bell peppers and sprinkle 2 Tbsp Cajun seasoning and 1/2 tsp smoked paprika if using over everything. Stir to combine.

Cook for 5 to 7 minutes, stirring occasionally, until peppers are tender and everything is well coated in seasoning.

Drizzle with 1 Tbsp soy sauce if using and toss to combine. Taste and adjust seasoning as needed.

Remove from heat, garnish with 1 Tbsp fresh chopped parsley if desired, and serve hot.`,
  translations: {
    es: {
      name: "Hash vegetariano picante en sartén",
      notes:
        "Un hash sustancioso y crujiente en sartén con sabor cajún intenso. Dejar que el tofu y las papas se cocinen sin moverlos ayuda a desarrollar una costra dorada y una gran textura.",
      tags: [
        "vegetariano",
        "vegano",
        "cena",
        "sartén",
        "picante",
        "saludable",
        "una sartén",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Ensalada verde sencilla",
        "Rebanadas de aguacate",
        "Pan tostado",
      ],
      ingredients: `1 bloque (14 oz) de tofu firme, prensado y cortado en cubos
2 cups de hongos king oyster, rebanados
2 cups de papas, cortadas en cubitos pequeños para cocción uniforme
1 cup de pimientos, picados en cubitos
2 Tbsp de mezcla de especias cajún
2 Tbsp de aceite de oliva
1/2 tsp de sal, más al gusto
1/2 tsp de pimienta
1 Tbsp de salsa de soya, opcional para más profundidad
1/2 tsp de paprika ahumada, opcional
1 Tbsp de perejil fresco, picado, opcional`,
      instructions: `Calienta 1 Tbsp de aceite de oliva en un sartén grande a fuego medio-alto.

Agrega 2 cups de papas en cubitos en una sola capa y cocina de 10 a 12 minutos, revolviendo de vez en cuando, hasta que estén doradas, crujientes en los bordes y tiernas por dentro. Sazona ligeramente con 1/2 tsp de sal y 1/2 tsp de pimienta.

Mientras se cocinan las papas, seca 1 bloque de tofu firme en cubos con toallas de papel para que se dore mejor.

Empuja las papas a un lado del sartén. Agrega la 1 Tbsp restante de aceite de oliva al lado vacío, luego agrega el tofu y 2 cups de hongos king oyster rebanados.

Cocina sin mover de 3 a 4 minutos para desarrollar una costra dorada, luego revuelve y continúa cocinando otros 3 a 4 minutos, hasta que se dore.

Agrega 1 cup de pimientos en cubitos y espolvorea 2 Tbsp de sazonador cajún y 1/2 tsp de paprika ahumada si la usas sobre todo. Mezcla para combinar.

Cocina de 5 a 7 minutos, revolviendo de vez en cuando, hasta que los pimientos estén tiernos y todo esté bien cubierto con el sazonador.

Rocía con 1 Tbsp de salsa de soya si la usas y mezcla para combinar. Prueba y ajusta los condimentos según sea necesario.

Retira del fuego, decora con 1 Tbsp de perejil fresco picado si deseas y sirve caliente.`,
    },
  },
},

  {
  id: "quick-caprese-pasta",
  slug: "quick-caprese-pasta",
  name: "Caprese Pasta",
  effort: "quick",
  photoUrl: "/images/quick-caprese-pasta.jpg",
  tags: ["vegetarian", "dinner", "pasta", "quick", "italian", "healthy", "one-pan", "light"],
  isVegetarian: true,
  // Caprese Pasta
suggestedSides: [
  "Garlic bread",
  "Simple green salad",
  "Roasted asparagus",
],
  notes: "Fresh and light pasta with juicy tomatoes and creamy mozzarella. Adding pasta water helps create a light sauce that brings everything together without heaviness.",
  ingredients: `1/2 lb penne pasta
1 cup cherry tomatoes, halved
1/2 cup mozzarella pearls
1/4 cup fresh basil, torn
2 Tbsp olive oil
1 clove garlic, minced (optional)
1 Tbsp balsamic glaze (optional, for finishing)
1/4 cup reserved pasta water
1/2 tsp salt (plus more to taste)
1/4 tsp pepper`,
  instructions: `Bring a large pot of salted water to a boil. Cook 1/2 lb penne pasta according to package directions until al dente. Reserve 1/4 cup pasta water, then drain.

Heat 2 Tbsp olive oil in the same pot or a large skillet over medium heat. Add 1 minced clove garlic if using and cook for 30 seconds until fragrant.

Add 1 cup halved cherry tomatoes and cook for 2 to 3 minutes, just until they begin to soften and release some juices.

Return the cooked pasta to the pot and toss with the tomatoes.

Add 1/2 cup mozzarella pearls and a splash of the reserved pasta water. Toss gently until everything is combined and slightly glossy.

Remove from heat and fold in 1/4 cup torn fresh basil.

Season with 1/2 tsp salt and 1/4 tsp pepper to taste. Drizzle with 1 Tbsp balsamic glaze if desired.

Serve immediately.`,
  translations: {
    es: {
      name: "Pasta caprese",
      notes:
        "Pasta fresca y ligera con tomates jugosos y mozzarella cremosa. Agregar agua de la pasta ayuda a crear una salsa ligera que une todo sin hacerlo pesado.",
      tags: [
        "vegetariano",
        "cena",
        "pasta",
        "rápido",
        "italiana",
        "saludable",
        "una sartén",
        "ligero",
      ],
      suggestedSides: [
        "Pan de ajo",
        "Ensalada verde sencilla",
        "Espárragos rostizados",
      ],
      ingredients: `1/2 lb de pasta penne
1 cup de tomates cherry, cortados por la mitad
1/2 cup de perlas de mozzarella
1/4 cup de albahaca fresca, troceada
2 Tbsp de aceite de oliva
1 diente de ajo, picado, opcional
1 Tbsp de glaseado balsámico, opcional para terminar
1/4 cup de agua reservada de la pasta
1/2 tsp de sal, más al gusto
1/4 tsp de pimienta`,
      instructions: `Hierve una olla grande con agua salada. Cocina 1/2 lb de pasta penne según las instrucciones del paquete hasta que esté al dente. Reserva 1/4 cup de agua de la pasta y luego escurre.

Calienta 2 Tbsp de aceite de oliva en la misma olla o en un sartén grande a fuego medio. Agrega 1 diente de ajo picado si lo usas y cocina 30 segundos, hasta que suelte aroma.

Agrega 1 cup de tomates cherry cortados por la mitad y cocina de 2 a 3 minutos, solo hasta que empiecen a suavizarse y soltar jugo.

Regresa la pasta cocida a la olla y mezcla con los tomates.

Agrega 1/2 cup de perlas de mozzarella y un chorrito del agua reservada de la pasta. Mezcla suavemente hasta que todo quede combinado y ligeramente brillante.

Retira del fuego e incorpora 1/4 cup de albahaca fresca troceada.

Sazona con 1/2 tsp de sal y 1/4 tsp de pimienta al gusto. Rocía con 1 Tbsp de glaseado balsámico si deseas.

Sirve de inmediato.`,
    },
  },
},

{
  id: "big-mediterranean-stuffed-peppers",
  slug: "big-mediterranean-stuffed-peppers",
  name: "Mediterranean Stuffed Bell Peppers",
  effort: "big",
  photoUrl: "/images/big-mediterranean-stuffed-peppers.jpg",
  tags: ["vegetarian", "dinner", "bake", "healthy", "mediterranean", "one-pan", "leftovers-friendly"],
  isVegetarian: true,
  // Mediterranean Stuffed Bell Peppers
suggestedSides: [
  "Greek salad",
  "Pita bread",
  "Cucumber salad",
],
  notes: "Bright and flavorful stuffed peppers with a Mediterranean twist. Adding lemon juice and fresh herbs helps balance the richness of the feta and brings everything together.",
  ingredients: `4 large bell peppers, tops removed and seeds discarded
2 cups cooked quinoa
1/2 cup feta cheese, crumbled
1/4 cup Kalamata olives, chopped
1/2 cup cherry tomatoes, chopped
2 Tbsp olive oil
2 cloves garlic, minced
1/2 small red onion, finely diced
1 tsp dried oregano
1/2 tsp salt (plus more to taste)
1/4 tsp pepper
1 Tbsp lemon juice
1/4 cup fresh parsley, chopped (optional)`,
  instructions: `Preheat oven to 375°F. Lightly grease a baking dish.

Place 4 prepared bell peppers upright in the dish. Add a small amount of water to the bottom of the dish to help steam the peppers.

Heat 2 Tbsp olive oil in a skillet over medium heat. Add 1/2 finely diced small red onion and cook for 3 to 4 minutes until softened.

Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

In a large bowl, combine 2 cups cooked quinoa, the sautéed onion and garlic, 1/2 cup crumbled feta, 1/4 cup chopped Kalamata olives, 1/2 cup chopped cherry tomatoes, 1 tsp dried oregano, 1/2 tsp salt, and 1/4 tsp pepper. Stir well.

Add 1 Tbsp lemon juice and mix to combine.

Spoon the filling evenly into the bell peppers, packing lightly.

Cover the dish with foil and bake for 30 minutes, until the peppers are tender.

Remove foil and bake an additional 5 to 10 minutes for slight browning on top.

Garnish with 1/4 cup fresh chopped parsley if desired and serve warm.`,
  translations: {
    es: {
      name: "Pimientos rellenos mediterráneos",
      notes:
        "Pimientos rellenos brillantes y llenos de sabor con un toque mediterráneo. Agregar jugo de limón y hierbas frescas ayuda a equilibrar la riqueza del feta y une todos los sabores.",
      tags: [
        "vegetariano",
        "cena",
        "horneado",
        "saludable",
        "mediterráneo",
        "una bandeja",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Ensalada griega",
        "Pan pita",
        "Ensalada de pepino",
      ],
      ingredients: `4 pimientos grandes, sin la parte superior y sin semillas
2 cups de quinoa cocida
1/2 cup de queso feta, desmoronado
1/4 cup de aceitunas Kalamata, picadas
1/2 cup de tomates cherry, picados
2 Tbsp de aceite de oliva
2 dientes de ajo, picados
1/2 cebolla roja pequeña, finamente picada
1 tsp de orégano seco
1/2 tsp de sal, más al gusto
1/4 tsp de pimienta
1 Tbsp de jugo de limón
1/4 cup de perejil fresco, picado, opcional`,
      instructions: `Precalienta el horno a 375°F. Engrasa ligeramente un molde para hornear.

Coloca 4 pimientos preparados de pie en el molde. Agrega una pequeña cantidad de agua al fondo del molde para ayudar a vaporizar los pimientos.

Calienta 2 Tbsp de aceite de oliva en un sartén a fuego medio. Agrega 1/2 cebolla roja pequeña finamente picada y cocina de 3 a 4 minutos, hasta que se ablande.

Agrega 2 dientes de ajo picados y cocina 30 segundos, hasta que suelte aroma.

En un tazón grande, combina 2 cups de quinoa cocida, la cebolla y el ajo salteados, 1/2 cup de feta desmoronado, 1/4 cup de aceitunas Kalamata picadas, 1/2 cup de tomates cherry picados, 1 tsp de orégano seco, 1/2 tsp de sal y 1/4 tsp de pimienta. Mezcla bien.

Agrega 1 Tbsp de jugo de limón y mezcla para combinar.

Rellena los pimientos de manera uniforme, compactando ligeramente.

Cubre el molde con papel aluminio y hornea durante 30 minutos, hasta que los pimientos estén tiernos.

Retira el papel aluminio y hornea de 5 a 10 minutos más para dorar ligeramente la parte superior.

Decora con 1/4 cup de perejil fresco picado si deseas y sirve caliente.`,
    },
  },
},

{
  id: "quick-vegetable-pad-thai",
  slug: "quick-vegetable-pad-thai",
  name: "Vegetable Pad Thai",
  effort: "quick",
  photoUrl: "/images/quick-vegetable-pad-thai.jpg",
  tags: ["vegetarian", "dinner", "quick", "asian", "skillet", "one-pan", "leftovers-friendly"],
  isVegetarian: true,
  // Vegetable Pad Thai
suggestedSides: [
  "Spring rolls",
  "Cucumber salad",
  "Steamed edamame",
],
  notes: "Quick, takeout-style pad Thai with balanced sweet, savory, and tangy flavors. Cooking tofu undisturbed helps create a crispy texture, and adding lime at the end brightens the dish.",
  ingredients: `8 oz rice noodles
8 oz firm tofu, pressed and cubed
1 cup bean sprouts
1/3 cup pad Thai sauce
1 Tbsp olive oil (or neutral oil)
1 egg (optional, for traditional style)
2 green onions, sliced
2 cloves garlic, minced
2 tsp crushed peanuts (plus more for serving)
1 Tbsp soy sauce (optional, for depth)
1 Tbsp lime juice
1 tsp brown sugar (optional, to balance flavors)

Optional toppings:
extra peanuts
lime wedges
cilantro`,
  instructions: `Soak 8 oz rice noodles in warm water according to package directions until just tender, then drain well.

Heat 1 Tbsp olive oil in a wok or large skillet over medium-high heat.

Add 8 oz pressed and cubed firm tofu in a single layer and cook for 4 to 5 minutes without moving, until golden and crisp on one side. Flip and cook another 3 to 4 minutes. Remove and set aside.

In the same pan, add 2 minced cloves garlic and cook for 30 seconds until fragrant.

If using 1 egg, push ingredients to one side and scramble the egg until just set.

Add the drained noodles and 1/3 cup pad Thai sauce. Toss quickly to coat and heat through.

Return the tofu to the pan. Add 1 cup bean sprouts, 2 sliced green onions, 1 Tbsp soy sauce if using, 1 Tbsp lime juice, and 1 tsp brown sugar if using.

Toss everything together for 1 to 2 minutes until heated through and evenly coated.

Remove from heat and top with 2 tsp crushed peanuts.

Serve immediately with lime wedges and optional extra peanuts or cilantro.`,
  translations: {
    es: {
      name: "Pad Thai de verduras",
      notes:
        "Pad Thai rápido estilo comida para llevar, con sabores dulces, salados y ácidos bien equilibrados. Cocinar el tofu sin moverlo ayuda a crear una textura crujiente, y agregar lima al final le da frescura al plato.",
      tags: [
        "vegetariano",
        "cena",
        "rápido",
        "asiático",
        "sartén",
        "una sartén",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Rollitos primavera",
        "Ensalada de pepino",
        "Edamame al vapor",
      ],
      ingredients: `8 oz de fideos de arroz
8 oz de tofu firme, prensado y cortado en cubos
1 cup de brotes de frijol
1/3 cup de salsa pad Thai
1 Tbsp de aceite de oliva o aceite neutro
1 huevo, opcional para estilo tradicional
2 cebollines, rebanados
2 dientes de ajo, picados
2 tsp de cacahuates triturados, más extra para servir
1 Tbsp de salsa de soya, opcional para más profundidad
1 Tbsp de jugo de lima
1 tsp de azúcar morena, opcional para equilibrar sabores

Toppings opcionales:
más cacahuates
gajos de lima
cilantro`,
      instructions: `Remoja 8 oz de fideos de arroz en agua tibia según las instrucciones del paquete hasta que estén apenas tiernos, luego escurre bien.

Calienta 1 Tbsp de aceite de oliva en un wok o sartén grande a fuego medio-alto.

Agrega 8 oz de tofu firme prensado y en cubos en una sola capa, y cocina de 4 a 5 minutos sin moverlo, hasta que esté dorado y crujiente por un lado. Voltea y cocina otros 3 a 4 minutos. Retira y reserva.

En el mismo sartén, agrega 2 dientes de ajo picados y cocina 30 segundos, hasta que suelte aroma.

Si usas 1 huevo, empuja los ingredientes a un lado y revuelve el huevo hasta que apenas cuaje.

Agrega los fideos escurridos y 1/3 cup de salsa pad Thai. Mezcla rápidamente para cubrir y calentar.

Regresa el tofu al sartén. Agrega 1 cup de brotes de frijol, 2 cebollines rebanados, 1 Tbsp de salsa de soya si la usas, 1 Tbsp de jugo de lima y 1 tsp de azúcar morena si la usas.

Mezcla todo de 1 a 2 minutos, hasta que esté caliente y bien cubierto.

Retira del fuego y cubre con 2 tsp de cacahuates triturados.

Sirve de inmediato con gajos de lima y, si deseas, más cacahuates o cilantro.`,
    },
  },
},

{
  id: "big-roasted-vegetable-wellington",
  slug: "big-roasted-vegetable-wellington",
  name: "Roasted Vegetable Wellington",
  effort: "big",
  photoUrl: "/images/big-roasted-vegetable-wellington.jpg",
  tags: ["vegetarian", "dinner", "bake", "comfort", "holiday", "showstopper", "leftovers-friendly"],
  isVegetarian: true,
  // Roasted Vegetable Wellington
suggestedSides: [
  "Mashed potatoes",
  "Green beans",
  "Side salad",
],
  notes: "An elegant vegetarian main with layers of roasted vegetables and flaky pastry. Removing excess moisture from the filling and using breadcrumbs helps keep the pastry crisp.",
  ingredients: `1 sheet puff pastry, thawed
1 large sweet potato, peeled and sliced into rounds
4 cups fresh spinach
2 large portobello mushrooms, stems removed
4 oz goat cheese
1 egg, beaten (for egg wash)
1 Tbsp olive oil
1/2 small yellow onion, finely diced
2 cloves garlic, minced
1/2 tsp salt (plus more to taste)
1/2 tsp pepper
1/2 tsp dried thyme (optional)
1 Tbsp balsamic vinegar (optional, for depth)
1 Tbsp breadcrumbs (optional, to prevent sogginess)`,
  instructions: `Preheat oven to 400°F. Line a baking sheet with parchment paper.

Toss 1 large sweet potato with a little olive oil, 1/2 tsp salt, and 1/2 tsp pepper. Roast on a baking sheet for 15 to 20 minutes until tender. Set aside.

Heat 1 Tbsp olive oil in a skillet over medium heat. Add 1/2 finely diced small onion and cook for 3 to 4 minutes until softened.

Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

Add 4 cups fresh spinach and cook until wilted. Remove from heat and let cool slightly, then squeeze out excess moisture thoroughly.

In the same skillet, cook 2 large portobello mushrooms for 5 to 7 minutes until tender and most of their moisture has released. Drizzle with 1 Tbsp balsamic vinegar if using and cook 1 minute more. Let cool.

Roll out 1 sheet of thawed puff pastry slightly if needed. Sprinkle 1 Tbsp breadcrumbs in the center area to help absorb moisture and prevent a soggy bottom.

Layer the roasted sweet potato, the spinach mixture, and the mushrooms, then crumble 4 oz goat cheese over the top. Sprinkle with 1/2 tsp dried thyme if using.

Fold the pastry over the filling, sealing edges tightly. Place seam-side down on the prepared baking sheet.

Brush the pastry with 1 beaten egg and score the top lightly with a knife for decoration and steam release.

Bake for 25 to 30 minutes, until the pastry is golden brown and puffed.

Let rest for 5 to 10 minutes before slicing and serving.`,
  translations: {
    es: {
      name: "Wellington de verduras asadas",
      notes:
        "Un plato principal vegetariano elegante con capas de verduras asadas y masa hojaldrada. Retirar el exceso de humedad del relleno y usar pan molido ayuda a mantener la masa crujiente.",
      tags: [
        "vegetariano",
        "cena",
        "horneado",
        "comida reconfortante",
        "festivo",
        "plato especial",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Puré de papas",
        "Ejotes",
        "Ensalada sencilla",
      ],
      ingredients: `1 hoja de masa de hojaldre, descongelada
1 camote grande, pelado y rebanado en rodajas
4 cups de espinaca fresca
2 hongos portobello grandes, sin tallos
4 oz de queso de cabra
1 huevo, batido, para barnizar
1 Tbsp de aceite de oliva
1/2 cebolla amarilla pequeña, finamente picada
2 dientes de ajo, picados
1/2 tsp de sal, más al gusto
1/2 tsp de pimienta
1/2 tsp de tomillo seco, opcional
1 Tbsp de vinagre balsámico, opcional para más profundidad
1 Tbsp de pan molido, opcional para evitar que se humedezca`,
      instructions: `Precalienta el horno a 400°F. Cubre una bandeja para hornear con papel pergamino.

Mezcla 1 camote grande con un poco de aceite de oliva, 1/2 tsp de sal y 1/2 tsp de pimienta. Asa en una bandeja durante 15 a 20 minutos, hasta que esté tierno. Reserva.

Calienta 1 Tbsp de aceite de oliva en un sartén a fuego medio. Agrega 1/2 cebolla amarilla pequeña finamente picada y cocina de 3 a 4 minutos, hasta que se ablande.

Agrega 2 dientes de ajo picados y cocina 30 segundos, hasta que suelte aroma.

Agrega 4 cups de espinaca fresca y cocina hasta que se marchite. Retira del fuego y deja enfriar un poco, luego exprime muy bien el exceso de humedad.

En el mismo sartén, cocina 2 hongos portobello grandes durante 5 a 7 minutos, hasta que estén tiernos y hayan soltado la mayor parte de su humedad. Rocía con 1 Tbsp de vinagre balsámico si lo usas y cocina 1 minuto más. Deja enfriar.

Extiende ligeramente 1 hoja de masa de hojaldre descongelada si es necesario. Espolvorea 1 Tbsp de pan molido en el centro para absorber humedad y evitar una base aguada.

Coloca en capas el camote asado, la mezcla de espinaca y los hongos, luego desmorona 4 oz de queso de cabra encima. Espolvorea con 1/2 tsp de tomillo seco si lo usas.

Dobla la masa sobre el relleno y sella bien los bordes. Coloca con la unión hacia abajo sobre la bandeja preparada.

Barniza la masa con 1 huevo batido y marca ligeramente la parte superior con un cuchillo para decorar y dejar salir vapor.

Hornea de 25 a 30 minutos, hasta que la masa esté dorada e inflada.

Deja reposar de 5 a 10 minutos antes de cortar y servir.`,
    },
  },
},

{
  id: "big-black-bean-burgers-sweet-potato-fries",
  slug: "big-black-bean-burgers-sweet-potato-fries",
  name: "Black Bean Burgers with Sweet Potato Fries",
  effort: "big",
  photoUrl: "/images/big-black-bean-burgers-sweet-potato-fries.jpg",
  tags: ["vegetarian", "dinner", "comfort", "kid-friendly", "american", "crispy", "family-friendly", "leftovers-friendly"],
  isVegetarian: true,
  // Black Bean Burgers with Sweet Potato Fries
suggestedSides: [
  "Coleslaw",
  "Pickle spears",
  "Side salad",
],
  notes: "A hearty homemade black bean burger dinner with crispy sweet potato fries. Letting the patties rest before cooking helps them hold together better, while high heat gives them a nicely browned crust.",
  ingredients: `2 (15 oz) cans black beans, drained and rinsed
2 large sweet potatoes, cut into wedges
1/2 cup breadcrumbs
1/2 small red onion, finely diced
3 cloves garlic, minced
1 Tbsp ground cumin
1/2 tsp smoked paprika (optional, for extra depth)
3 Tbsp olive oil, divided
1 large egg
1/2 tsp salt, plus more to taste
1/2 tsp pepper
4 burger buns

Optional for serving:
lettuce
tomato
sliced avocado
burger sauce`,
  instructions: `Preheat oven to 425°F. Line a large baking sheet with parchment paper.

Toss 2 large sweet potatoes with 1 1/2 Tbsp olive oil, a pinch of salt, and a pinch of pepper. Spread in a single layer on the baking sheet.

Roast for 25 to 30 minutes, flipping halfway through, until tender inside and browned on the edges.

While the fries roast, place 2 cans of drained and rinsed black beans in a large bowl and mash until mostly broken down but still slightly chunky.

Add 1/2 finely diced small red onion, 3 minced cloves garlic, 1/2 cup breadcrumbs, 1 Tbsp ground cumin, 1/2 tsp smoked paprika if using, 1 large egg, 1/2 tsp salt, and 1/2 tsp pepper. Mix until well combined.

Form the mixture into 4 firm patties. If the mixture feels too soft, let it rest for 5 to 10 minutes so the breadcrumbs can absorb moisture.

Heat the remaining 1 1/2 Tbsp olive oil in a large skillet over medium heat.

Cook the 4 patties for 4 to 5 minutes per side, until deeply browned and crisp on the outside. Flip carefully.

Toast 4 burger buns if desired.

Serve patties on buns with your favorite toppings like lettuce, tomato, sliced avocado, or burger sauce, alongside the hot sweet potato fries.`,
  translations: {
    es: {
      name: "Hamburguesas de frijol negro con papas de camote",
      notes:
        "Una cena sustanciosa de hamburguesas caseras de frijol negro con papas de camote crujientes. Dejar reposar las tortitas antes de cocinarlas ayuda a que se mantengan juntas, mientras que el fuego alto les da una costra bien dorada.",
      tags: [
        "vegetariano",
        "cena",
        "comida reconfortante",
        "para niños",
        "americana",
        "crujiente",
        "familiar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Ensalada de col",
        "Pepinillos en tiras",
        "Ensalada sencilla",
      ],
      ingredients: `2 latas (15 oz) de frijoles negros, escurridos y enjuagados
2 camotes grandes, cortados en gajos
1/2 cup de pan molido
1/2 cebolla roja pequeña, finamente picada
3 dientes de ajo, picados
1 Tbsp de comino molido
1/2 tsp de paprika ahumada, opcional para más profundidad
3 Tbsp de aceite de oliva, dividido
1 huevo grande
1/2 tsp de sal, más al gusto
1/2 tsp de pimienta
4 panes para hamburguesa

Opcional para servir:
lechuga
tomate
aguacate rebanado
salsa para hamburguesa`,
      instructions: `Precalienta el horno a 425°F. Cubre una bandeja grande para hornear con papel pergamino.

Mezcla 2 camotes grandes con 1 1/2 Tbsp de aceite de oliva, una pizca de sal y una pizca de pimienta. Extiende en una sola capa sobre la bandeja.

Asa de 25 a 30 minutos, volteando a la mitad, hasta que estén tiernos por dentro y dorados en los bordes.

Mientras se asan las papas, coloca 2 latas de frijoles negros escurridos y enjuagados en un tazón grande y machaca hasta que estén mayormente deshechos, pero todavía un poco con textura.

Agrega 1/2 cebolla roja pequeña finamente picada, 3 dientes de ajo picados, 1/2 cup de pan molido, 1 Tbsp de comino molido, 1/2 tsp de paprika ahumada si la usas, 1 huevo grande, 1/2 tsp de sal y 1/2 tsp de pimienta. Mezcla hasta combinar bien.

Forma 4 tortitas firmes con la mezcla. Si la mezcla se siente demasiado suave, déjala reposar de 5 a 10 minutos para que el pan molido absorba humedad.

Calienta la 1 1/2 Tbsp restante de aceite de oliva en un sartén grande a fuego medio.

Cocina las 4 tortitas de 4 a 5 minutos por lado, hasta que estén bien doradas y crujientes por fuera. Voltea con cuidado.

Tuesta 4 panes para hamburguesa si deseas.

Sirve las tortitas en los panes con tus toppings favoritos, como lechuga, tomate, aguacate rebanado o salsa para hamburguesa, junto con las papas de camote calientes.`,
    },
  },
},

{
  id: "big-sweet-potato-black-bean-enchiladas",
  slug: "big-sweet-potato-black-bean-enchiladas",
  name: "Sweet Potato and Black Bean Enchiladas",
  effort: "big",
  photoUrl: "/images/big-sweet-potato-black-bean-enchiladas.jpg",
  tags: ["vegetarian", "dinner", "bake", "mexican", "comfort", "family-friendly", "leftovers-friendly"],
  isVegetarian: true,
  // Sweet Potato and Black Bean Enchiladas
suggestedSides: [
  "Cilantro lime rice",
  "Chips and salsa",
  "Guacamole",
],
  notes: "Hearty vegetarian enchiladas with a perfect balance of sweet and savory flavors. Roasting the sweet potatoes instead of boiling adds depth and prevents the filling from becoming watery.",
  ingredients: `2 large sweet potatoes, peeled and cubed
1 (15 oz) can black beans, drained and rinsed
8 corn tortillas
2 cups enchilada sauce
1 1/2 cups Monterey Jack cheese, shredded
1/4 cup fresh cilantro, chopped
1 Tbsp olive oil
1/2 small red onion, finely diced
2 cloves garlic, minced
1 tsp cumin
1/2 tsp chili powder
1/2 tsp salt
1/4 tsp pepper
1 Tbsp lime juice`,
  instructions: `Preheat oven to 400°F. Line a baking sheet with parchment paper.

Toss 2 large peeled and cubed sweet potatoes with 1 Tbsp olive oil, 1/2 tsp salt, and 1/4 tsp pepper. Roast for 20 to 25 minutes until tender and lightly caramelized.

In a skillet over medium heat, cook 1/2 finely diced small red onion for 3 to 4 minutes until softened. Add 2 minced cloves garlic and cook for 30 seconds.

In a large bowl, mash the roasted sweet potatoes slightly, leaving some texture. Stir in 1 can drained and rinsed black beans, the sautéed onion and garlic, 1 tsp cumin, 1/2 tsp chili powder, and 1 Tbsp lime juice. Mix well.

Reduce oven temperature to 375°F.

Spread a thin layer of 2 cups enchilada sauce in a baking dish.

Warm 8 corn tortillas slightly to make them pliable. Spoon the filling into each tortilla, roll tightly, and place seam-side down in the dish.

Pour the remaining enchilada sauce over the top and sprinkle evenly with 1 1/2 cups shredded Monterey Jack cheese.

Bake for 20 to 25 minutes, until the cheese is melted and bubbly.

Garnish with 1/4 cup chopped fresh cilantro before serving.`,
  translations: {
    es: {
      name: "Enchiladas de camote y frijoles negros",
      notes:
        "Enchiladas vegetarianas sustanciosas con un equilibrio perfecto entre sabores dulces y salados. Asar los camotes en lugar de hervirlos agrega profundidad y evita que el relleno quede aguado.",
      tags: [
        "vegetariano",
        "cena",
        "horneado",
        "mexicano",
        "comida reconfortante",
        "familiar",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Arroz con cilantro y lima",
        "Totopos con salsa",
        "Guacamole",
      ],
      ingredients: `2 camotes grandes, pelados y cortados en cubos
1 lata (15 oz) de frijoles negros, escurridos y enjuagados
8 tortillas de maíz
2 cups de salsa para enchiladas
1 1/2 cups de queso Monterey Jack rallado
1/4 cup de cilantro fresco, picado
1 Tbsp de aceite de oliva
1/2 cebolla roja pequeña, finamente picada
2 dientes de ajo, picados
1 tsp de comino
1/2 tsp de chile en polvo
1/2 tsp de sal
1/4 tsp de pimienta
1 Tbsp de jugo de lima`,
      instructions: `Precalienta el horno a 400°F. Cubre una bandeja para hornear con papel pergamino.

Mezcla 2 camotes grandes pelados y cortados en cubos con 1 Tbsp de aceite de oliva, 1/2 tsp de sal y 1/4 tsp de pimienta. Asa de 20 a 25 minutos, hasta que estén tiernos y ligeramente caramelizados.

En un sartén a fuego medio, cocina 1/2 cebolla roja pequeña finamente picada de 3 a 4 minutos, hasta que se ablande. Agrega 2 dientes de ajo picados y cocina 30 segundos.

En un tazón grande, machaca ligeramente los camotes asados, dejando algo de textura. Incorpora 1 lata de frijoles negros escurridos y enjuagados, la cebolla y el ajo salteados, 1 tsp de comino, 1/2 tsp de chile en polvo y 1 Tbsp de jugo de lima. Mezcla bien.

Reduce la temperatura del horno a 375°F.

Extiende una capa delgada de 2 cups de salsa para enchiladas en un molde para hornear.

Calienta ligeramente 8 tortillas de maíz para que sean flexibles. Coloca relleno en cada tortilla, enrolla firmemente y acomoda con la unión hacia abajo en el molde.

Vierte el resto de la salsa para enchiladas encima y espolvorea de manera uniforme con 1 1/2 cups de queso Monterey Jack rallado.

Hornea de 20 a 25 minutos, hasta que el queso esté derretido y burbujeante.

Decora con 1/4 cup de cilantro fresco picado antes de servir.`,
    },
  },
},

{
  id: "vegetarian-fri-chik-noodle-casserole",
  slug: "vegetarian-fri-chik-noodle-casserole",
  name: "Vegetarian Fri-Chik Noodle Casserole",
  effort: "normal",
  photoUrl: "/images/vegetarian-fri-chik-noodle-casserole.jpg",
  tags: ["vegetarian", "dinner", "casserole", "pasta", "comfort", "bake", "leftovers-friendly"],
  isVegetarian: true,
  // Vegetarian Fri-Chik Noodle Casserole
suggestedSides: [
  "Side salad",
  "Green beans",
  "Dinner rolls",
],
  notes: "A hearty, comforting casserole that even non-vegetarians will love. Perfect for make-ahead dinners since it tastes even better the next day.",
  ingredients: `12 oz egg noodles
1 medium yellow onion, chopped
1 medium white onion, chopped
1 can Loma Linda Fri-Chik & Gravy
2 eggs, beaten
2 1/2 Tbsp McKay's Chicken Seasoning
1 (10.5 oz) can cream of mushroom soup
1 cup milk
1 (8 oz) block sharp cheddar cheese, shredded
1 (8 oz) baby bella mushrooms, sliced
2 Tbsp butter
1 Tbsp olive oil
1 Tbsp garlic, minced
1 (4 to 7 oz) can green chilies (optional)
salt
pepper`,
  instructions: `Preheat oven to 350°F.

Cook 12 oz egg noodles according to package directions, omitting salt. Drain and set aside.

In a skillet, heat 2 Tbsp butter and 1 Tbsp olive oil over medium heat. Cook 1 chopped medium yellow onion and 1 chopped medium white onion until translucent.

Add 8 oz sliced baby bella mushrooms and cook until they begin to brown. Stir in 1 Tbsp minced garlic and cook for 2 more minutes.

Chop the contents of 1 can Loma Linda Fri-Chik into small pieces.

In a large bowl, combine the cooked noodles, 2 beaten eggs, 1 cup milk, the cooked onions and mushrooms, 1 can cream of mushroom soup, most of the shredded sharp cheddar cheese, reserving some for the topping, the chopped Fri-Chik with its gravy, 2 1/2 Tbsp McKay's Chicken Seasoning, salt, pepper, and 1 can green chilies if using. Mix well.

Transfer the mixture to a baking dish and cover tightly with foil. Bake for 1 hour.

Remove the foil, top with the remaining shredded cheese, and bake uncovered for 5 to 10 minutes until the cheese is fully melted and bubbly.`,
  translations: {
    es: {
      name: "Cazuela vegetariana de fideos con Fri-Chik",
      notes:
        "Una cazuela sustanciosa y reconfortante que incluso los no vegetarianos van a disfrutar. Perfecta para preparar con anticipación, ya que sabe aún mejor al día siguiente.",
      tags: [
        "vegetariano",
        "cena",
        "cazuela",
        "pasta",
        "comida reconfortante",
        "horneado",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Ensalada sencilla",
        "Ejotes",
        "Panecillos",
      ],
      ingredients: `12 oz de fideos de huevo
1 cebolla amarilla mediana, picada
1 cebolla blanca mediana, picada
1 lata de Loma Linda Fri-Chik & Gravy
2 huevos, batidos
2 1/2 Tbsp de sazonador McKay's Chicken
1 lata (10.5 oz) de crema de champiñones
1 cup de leche
1 bloque (8 oz) de queso cheddar fuerte, rallado
1 paquete (8 oz) de champiñones baby bella, rebanados
2 Tbsp de mantequilla
1 Tbsp de aceite de oliva
1 Tbsp de ajo, picado
1 lata (4 a 7 oz) de chiles verdes, opcional
sal
pimienta`,
      instructions: `Precalienta el horno a 350°F.

Cocina 12 oz de fideos de huevo según las instrucciones del paquete, sin agregar sal. Escurre y reserva.

En un sartén, calienta 2 Tbsp de mantequilla y 1 Tbsp de aceite de oliva a fuego medio. Cocina 1 cebolla amarilla mediana picada y 1 cebolla blanca mediana picada hasta que estén translúcidas.

Agrega 8 oz de champiñones baby bella rebanados y cocina hasta que empiecen a dorarse. Incorpora 1 Tbsp de ajo picado y cocina 2 minutos más.

Pica el contenido de 1 lata de Loma Linda Fri-Chik en trozos pequeños.

En un tazón grande, combina los fideos cocidos, 2 huevos batidos, 1 cup de leche, las cebollas y champiñones cocidos, 1 lata de crema de champiñones, la mayor parte del queso cheddar fuerte rallado reservando un poco para cubrir, el Fri-Chik picado con su gravy, 2 1/2 Tbsp de sazonador McKay's Chicken, sal, pimienta y 1 lata de chiles verdes si los usas. Mezcla bien.

Pasa la mezcla a un molde para hornear y cubre bien con papel aluminio. Hornea durante 1 hora.

Retira el papel aluminio, cubre con el queso rallado restante y hornea sin cubrir de 5 a 10 minutos, hasta que el queso esté completamente derretido y burbujeante.`,
    },
  },
},

{
  id: "normal-caprese-stuffed-portobello-mushrooms",
  slug: "normal-caprese-stuffed-portobello-mushrooms",
  name: "Caprese Stuffed Portobello Mushrooms",
  effort: "normal",
  photoUrl: "/images/normal-caprese-stuffed-portobello-mushrooms.jpg",
  tags: ["vegetarian", "dinner", "bake", "italian", "healthy", "low-carb", "one-pan", "light"],
  isVegetarian: true,
  // Caprese Stuffed Portobello Mushrooms
suggestedSides: [
  "Garlic bread",
  "Simple green salad",
  "Roasted asparagus",
],
  notes: "A lighter caprese-inspired dinner with juicy tomatoes and melted mozzarella. Roasting the mushrooms first helps remove excess moisture and prevents a soggy final dish.",
  ingredients: `5 to 6 large portobello mushrooms, stems removed and gills scraped
2 Tbsp butter
2 cloves garlic, minced
1 Tbsp fresh parsley, chopped
5 to 6 fresh mozzarella balls, sliced
1 cup cherry tomatoes, halved
1 Tbsp olive oil
1/2 tsp salt
1/4 tsp pepper
1/4 cup balsamic vinegar
2 tsp brown sugar
fresh basil, shredded`,
  instructions: `Preheat oven to 400°F. Line a baking sheet with parchment paper.

Brush 5 to 6 large portobello mushrooms lightly with 1 Tbsp olive oil and season with 1/2 tsp salt and 1/4 tsp pepper. Place gill-side down and roast for 8 to 10 minutes to release excess moisture.

Meanwhile, melt 2 Tbsp butter in a small pan over medium heat. Add 2 minced cloves garlic and 1 Tbsp chopped fresh parsley; cook for 30 seconds until fragrant. Remove from heat.

Remove mushrooms from oven and carefully drain any liquid. Flip so they are gill-side up.

Brush the insides with the garlic butter mixture.

Fill each mushroom with the sliced fresh mozzarella and 1 cup halved cherry tomatoes.

Return to the oven and bake for 8 to 10 minutes, until cheese is melted and bubbly.

For extra browning, broil on high for 1 to 2 minutes, watching closely.

In a small saucepan, combine 1/4 cup balsamic vinegar and 2 tsp brown sugar. Bring to a simmer and cook for 5 to 8 minutes until reduced and syrupy.

Drizzle the balsamic glaze over the mushrooms, top with shredded fresh basil, and serve immediately.`,
  translations: {
    es: {
      name: "Portobellos rellenos estilo caprese",
      notes:
        "Una cena ligera inspirada en caprese, con tomates jugosos y mozzarella derretida. Asar los champiñones primero ayuda a retirar el exceso de humedad y evita que el plato final quede aguado.",
      tags: [
        "vegetariano",
        "cena",
        "horneado",
        "italiana",
        "saludable",
        "bajo en carbohidratos",
        "una bandeja",
        "ligero",
      ],
      suggestedSides: [
        "Pan de ajo",
        "Ensalada verde sencilla",
        "Espárragos rostizados",
      ],
      ingredients: `5 a 6 champiñones portobello grandes, sin tallos y con las agallas raspadas
2 Tbsp de mantequilla
2 dientes de ajo, picados
1 Tbsp de perejil fresco, picado
5 a 6 bolitas de mozzarella fresca, rebanadas
1 cup de tomates cherry, cortados por la mitad
1 Tbsp de aceite de oliva
1/2 tsp de sal
1/4 tsp de pimienta
1/4 cup de vinagre balsámico
2 tsp de azúcar morena
albahaca fresca, cortada en tiras`,
      instructions: `Precalienta el horno a 400°F. Cubre una bandeja para hornear con papel pergamino.

Barniza ligeramente 5 a 6 champiñones portobello grandes con 1 Tbsp de aceite de oliva y sazona con 1/2 tsp de sal y 1/4 tsp de pimienta. Colócalos con las agallas hacia abajo y asa de 8 a 10 minutos para que suelten el exceso de humedad.

Mientras tanto, derrite 2 Tbsp de mantequilla en una sartén pequeña a fuego medio. Agrega 2 dientes de ajo picados y 1 Tbsp de perejil fresco picado; cocina 30 segundos, hasta que suelte aroma. Retira del fuego.

Retira los champiñones del horno y escurre cuidadosamente cualquier líquido. Voltéalos para que queden con las agallas hacia arriba.

Barniza el interior con la mezcla de mantequilla y ajo.

Rellena cada champiñón con mozzarella fresca rebanada y 1 cup de tomates cherry partidos por la mitad.

Regresa al horno y hornea de 8 a 10 minutos, hasta que el queso esté derretido y burbujeante.

Para más dorado, gratina en alto de 1 a 2 minutos, vigilando de cerca.

En una cacerola pequeña, combina 1/4 cup de vinagre balsámico y 2 tsp de azúcar morena. Lleva a hervor suave y cocina de 5 a 8 minutos, hasta que se reduzca y quede como jarabe.

Rocía el glaseado balsámico sobre los champiñones, cubre con albahaca fresca en tiras y sirve de inmediato.`,
    },
  },
},

{
  id: "normal-spinach-mushroom-feta-crustless-quiche",
  slug: "normal-spinach-mushroom-feta-crustless-quiche",
  name: "Spinach Mushroom Feta Crustless Quiche",
  effort: "normal",
  photoUrl: "/images/normal-spinach-mushroom-feta-crustless-quiche.jpg",
  tags: ["vegetarian", "breakfast", "brunch", "dinner", "bake", "meal-prep", "healthy"],
  isVegetarian: true,
  // Spinach Mushroom Feta Crustless Quiche
suggestedSides: [
  "Fruit salad",
  "Roasted potatoes",
  "Side salad",
],
  notes: "A good breakfast-for-dinner or meal-prep option with lots of savory flavor.",
  ingredients: `1 (10 oz) bag spinach
8 oz baby bella mushrooms, sliced
1 clove garlic, minced
1/8 tsp salt
1 Tbsp cooking oil, divided
2 oz feta cheese, crumbled
4 large eggs
1/4 cup grated Parmesan cheese
1/4 tsp pepper
1 cup milk
1/2 cup shredded mozzarella`,
  instructions: `Preheat oven to 350°F.

Rinse 8 oz baby bella mushrooms and slice thinly. Mince 1 clove garlic.

In a skillet over medium heat, add the sliced mushrooms, minced garlic, 1/8 tsp salt, and 1/2 Tbsp cooking oil. Sauté until mushrooms release their moisture and it fully evaporates. No liquid should remain in the pan.

Brush the remaining 1/2 Tbsp oil inside a 9-inch pie plate.

Layer the cooked mushrooms, 1 bag fresh spinach, and 2 oz crumbled feta cheese into the pie plate.

In a large bowl, whisk together 4 large eggs, 1/4 cup grated Parmesan cheese, 1/4 tsp pepper, and 1 cup milk until well combined.

Pour the egg mixture evenly over the vegetables and cheese. Top with 1/2 cup shredded mozzarella.

Bake for about 50 minutes, or until the quiche is golden on top and the internal temperature reaches 160°F.

Let the quiche rest slightly to set before slicing and serving.`,
  translations: {
    es: {
      name: "Quiche sin corteza de espinaca, champiñones y feta",
      notes:
        "Una buena opción de desayuno para la cena o meal prep, con mucho sabor salado.",
      tags: [
        "vegetariano",
        "desayuno",
        "brunch",
        "cena",
        "horneado",
        "meal prep",
        "saludable",
      ],
      suggestedSides: [
        "Ensalada de frutas",
        "Papas asadas",
        "Ensalada sencilla",
      ],
      ingredients: `1 bolsa (10 oz) de espinaca
8 oz de champiñones baby bella, rebanados
1 diente de ajo, picado
1/8 tsp de sal
1 Tbsp de aceite para cocinar, dividido
2 oz de queso feta, desmoronado
4 huevos grandes
1/4 cup de queso parmesano rallado
1/4 tsp de pimienta
1 cup de leche
1/2 cup de queso mozzarella rallado`,
      instructions: `Precalienta el horno a 350°F.

Enjuaga 8 oz de champiñones baby bella y rebánalos finamente. Pica 1 diente de ajo.

En un sartén a fuego medio, agrega los champiñones rebanados, el ajo picado, 1/8 tsp de sal y 1/2 Tbsp de aceite para cocinar. Saltea hasta que los champiñones suelten su humedad y esta se evapore por completo. No debe quedar líquido en el sartén.

Barniza el interior de un molde para pay de 9 inches con la 1/2 Tbsp restante de aceite.

Coloca capas de champiñones cocidos, 1 bolsa de espinaca fresca y 2 oz de queso feta desmoronado en el molde.

En un tazón grande, bate 4 huevos grandes, 1/4 cup de queso parmesano rallado, 1/4 tsp de pimienta y 1 cup de leche hasta que esté bien combinado.

Vierte la mezcla de huevo de manera uniforme sobre las verduras y el queso. Cubre con 1/2 cup de mozzarella rallada.

Hornea unos 50 minutos, o hasta que el quiche esté dorado por encima y la temperatura interna alcance 160°F.

Deja reposar un poco para que se asiente antes de cortar y servir.`,
    },
  },
},

{
  id: "quick-cream-cheese-spinach-pasta",
  slug: "quick-cream-cheese-spinach-pasta",
  name: "Cream Cheese Spinach Pasta",
  effort: "quick",
  photoUrl: "/images/quick-cream-cheese-spinach-pasta.jpg",
  tags: ["vegetarian", "dinner", "pasta", "quick", "comfort", "creamy", "one-pan", "leftovers-friendly"],
  isVegetarian: true,
  // Cream Cheese Spinach Pasta
suggestedSides: [
  "Garlic bread",
  "Caesar salad",
  "Roasted broccoli",
],
  notes: "Creamy, comforting pasta made with simple ingredients. Adding pasta water gradually helps create a smooth, silky sauce that clings perfectly to the noodles.",
  ingredients: `12 oz pasta (penne or rotini)
4 oz cream cheese, softened and cubed
1/2 cup Parmesan cheese, freshly grated
2 cups fresh spinach
2 cloves garlic, minced
1 Tbsp butter
1/2 cup reserved pasta water
1/2 tsp salt (plus more to taste)
1/4 tsp pepper
1/4 tsp red pepper flakes (optional)
1 tsp lemon juice (optional, for brightness)`,
  instructions: `Bring a large pot of salted water to a boil. Cook 12 oz pasta according to package directions until al dente. Reserve 1/2 cup pasta water, then drain.

In the same pot or a large skillet, melt 1 Tbsp butter over medium heat. Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

Add 4 oz softened and cubed cream cheese and a splash of the reserved pasta water. Stir until the cream cheese begins to melt and form a smooth sauce.

Gradually add 1/2 cup freshly grated Parmesan cheese, stirring continuously until fully melted and combined.

Add more of the reserved pasta water as needed to create a smooth, creamy consistency.

Stir in 2 cups fresh spinach and cook for 1 to 2 minutes until wilted.

Add the cooked pasta and toss well to coat evenly.

Season with 1/2 tsp salt, 1/4 tsp pepper, and 1/4 tsp red pepper flakes if using.

Remove from heat and stir in 1 tsp lemon juice if desired for brightness. Serve immediately.`,
  translations: {
    es: {
      name: "Pasta con espinaca y queso crema",
      notes:
        "Pasta cremosa y reconfortante hecha con ingredientes simples. Agregar agua de la pasta poco a poco ayuda a crear una salsa suave y sedosa que se adhiere perfectamente a los fideos.",
      tags: [
        "vegetariano",
        "cena",
        "pasta",
        "rápido",
        "comida reconfortante",
        "cremoso",
        "una sartén",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Pan de ajo",
        "Ensalada César",
        "Brócoli asado",
      ],
      ingredients: `12 oz de pasta, penne o rotini
4 oz de queso crema, suavizado y cortado en cubitos
1/2 cup de queso parmesano recién rallado
2 cups de espinaca fresca
2 dientes de ajo, picados
1 Tbsp de mantequilla
1/2 cup de agua reservada de la pasta
1/2 tsp de sal, más al gusto
1/4 tsp de pimienta
1/4 tsp de hojuelas de chile rojo, opcional
1 tsp de jugo de limón, opcional para frescura`,
      instructions: `Hierve una olla grande con agua salada. Cocina 12 oz de pasta según las instrucciones del paquete hasta que esté al dente. Reserva 1/2 cup de agua de la pasta y luego escurre.

En la misma olla o en un sartén grande, derrite 1 Tbsp de mantequilla a fuego medio. Agrega 2 dientes de ajo picados y cocina 30 segundos, hasta que suelte aroma.

Agrega 4 oz de queso crema suavizado y cortado en cubitos, junto con un chorrito del agua reservada de la pasta. Revuelve hasta que el queso crema empiece a derretirse y forme una salsa suave.

Agrega gradualmente 1/2 cup de queso parmesano recién rallado, revolviendo continuamente hasta que se derrita por completo y se combine.

Agrega más agua reservada de la pasta según sea necesario para crear una consistencia suave y cremosa.

Incorpora 2 cups de espinaca fresca y cocina de 1 a 2 minutos, hasta que se marchite.

Agrega la pasta cocida y mezcla bien para cubrirla de manera uniforme.

Sazona con 1/2 tsp de sal, 1/4 tsp de pimienta y 1/4 tsp de hojuelas de chile rojo si las usas.

Retira del fuego e incorpora 1 tsp de jugo de limón si deseas más frescura. Sirve de inmediato.`,
    },
  },
},

{
  id: "quick-caprese-sandwich",
  slug: "quick-caprese-sandwich",
  name: "Caprese Grilled Cheese",
  effort: "quick",
  photoUrl: "/images/quick-caprese-sandwich.jpg",
  tags: ["vegetarian", "dinner", "sandwich", "quick", "skillet", "comfort", "italian", "one-pan"],
  isVegetarian: true,
  // Caprese Grilled Cheese
suggestedSides: [
  "Tomato soup",
  "Apple slices",
  "Side salad",
],
  notes: "A fresh twist on grilled cheese with melty mozzarella, juicy tomato, and basil. Letting the sandwich rest briefly helps the cheese set slightly for cleaner slices.",
  ingredients: `4 slices sourdough bread
4 oz fresh mozzarella, sliced
1 tomato, thinly sliced
1/4 cup fresh basil leaves
1 Tbsp butter
1 Tbsp olive oil (optional, for extra crisp)
1/4 tsp salt
1/4 tsp pepper
1 Tbsp balsamic glaze (optional, for finishing)`,
  instructions: `Heat a skillet over medium heat.

Lightly season 1 thinly sliced tomato with 1/4 tsp salt and 1/4 tsp pepper to enhance flavor.

Layer 4 oz sliced fresh mozzarella, the seasoned tomato slices, and 1/4 cup fresh basil leaves between 4 slices of sourdough bread to make two sandwiches.

Spread 1 Tbsp butter evenly on the outside of each sandwich. For extra crispiness, you can also add a light drizzle of 1 Tbsp olive oil to the pan.

Place sandwiches in the skillet and cook for 3 to 4 minutes, pressing gently, until the bread is golden brown and crisp.

Flip and cook another 3 to 4 minutes, until the cheese is fully melted.

Remove from skillet and let rest for 1 to 2 minutes before slicing.

Drizzle with 1 Tbsp balsamic glaze if desired and serve warm.`,
  translations: {
    es: {
      name: "Sándwich caprese de queso a la plancha",
      notes:
        "Una versión fresca del grilled cheese, con mozzarella derretida, tomate jugoso y albahaca. Dejar reposar el sándwich brevemente ayuda a que el queso se asiente un poco para cortarlo más limpio.",
      tags: [
        "vegetariano",
        "cena",
        "sándwich",
        "rápido",
        "sartén",
        "comida reconfortante",
        "italiana",
        "una sartén",
      ],
      suggestedSides: [
        "Sopa de tomate",
        "Rebanadas de manzana",
        "Ensalada sencilla",
      ],
      ingredients: `4 rebanadas de pan de masa madre
4 oz de mozzarella fresca, rebanada
1 tomate, rebanado finamente
1/4 cup de hojas de albahaca fresca
1 Tbsp de mantequilla
1 Tbsp de aceite de oliva, opcional para más crujiente
1/4 tsp de sal
1/4 tsp de pimienta
1 Tbsp de glaseado balsámico, opcional para terminar`,
      instructions: `Calienta un sartén a fuego medio.

Sazona ligeramente 1 tomate rebanado finamente con 1/4 tsp de sal y 1/4 tsp de pimienta para realzar el sabor.

Coloca en capas 4 oz de mozzarella fresca rebanada, las rebanadas de tomate sazonadas y 1/4 cup de hojas de albahaca fresca entre 4 rebanadas de pan de masa madre para hacer dos sándwiches.

Unta 1 Tbsp de mantequilla de manera uniforme por fuera de cada sándwich. Para que quede más crujiente, también puedes agregar un chorrito ligero de 1 Tbsp de aceite de oliva al sartén.

Coloca los sándwiches en el sartén y cocina de 3 a 4 minutos, presionando suavemente, hasta que el pan esté dorado y crujiente.

Voltea y cocina otros 3 a 4 minutos, hasta que el queso esté completamente derretido.

Retira del sartén y deja reposar de 1 a 2 minutos antes de cortar.

Rocía con 1 Tbsp de glaseado balsámico si deseas y sirve caliente.`,
    },
  },
},

{
  id: "creamy-mushroom-stroganoff",
  slug: "creamy-mushroom-stroganoff",
  name: "Creamy Mushroom Stroganoff",
  ingredients: `8 oz egg noodles
2 Tbsp butter
1 Tbsp olive oil
16 oz mushrooms, sliced
1/2 onion, diced
2 cloves garlic, minced
1 Tbsp flour
1 1/2 cups vegetable broth
1/2 cup sour cream
1 tsp paprika
1/2 tsp salt
1/4 tsp black pepper`,
  instructions: `Cook 8 oz egg noodles according to package directions and set aside.

Heat 2 Tbsp butter and 1 Tbsp olive oil in a skillet over medium-high heat.

Add 16 oz mushrooms and cook 6 to 8 minutes until deeply browned.

Add 1/2 diced onion and cook 3 to 4 minutes until softened. Add 2 cloves garlic and cook 30 seconds.

Stir in 1 Tbsp flour and cook 1 minute.

Add 1 1/2 cups vegetable broth and simmer until slightly thickened.

Reduce heat to low and stir in 1/2 cup sour cream, 1 tsp paprika, 1/2 tsp salt, and 1/4 tsp pepper.

Add noodles and toss to coat. Serve warm.`,
  photoUrl: "/images/creamy-mushroom-stroganoff.jpg",
  effort: "normal",
  tags: ["vegetarian", "dinner", "comfort", "pasta", "creamy", "one-pan"],
  isVegetarian: true,
  // Creamy Mushroom Stroganoff
suggestedSides: [
  "Roasted carrots",
  "Side salad",
  "Dinner rolls",
],
  notes: "A rich, creamy vegetarian twist on a comfort classic with deep mushroom flavor.",
  translations: {
    es: {
      name: "Stroganoff cremoso de champiñones",
      notes:
        "Una versión vegetariana rica y cremosa de un clásico reconfortante, con profundo sabor a champiñones.",
      tags: [
        "vegetariano",
        "cena",
        "comida reconfortante",
        "pasta",
        "cremoso",
        "una sartén",
      ],
      suggestedSides: [
        "Zanahorias rostizadas",
        "Ensalada sencilla",
        "Panecillos",
      ],
      ingredients: `8 oz de fideos de huevo
2 Tbsp de mantequilla
1 Tbsp de aceite de oliva
16 oz de champiñones, rebanados
1/2 cebolla, picada en cubitos
2 dientes de ajo, picados
1 Tbsp de harina
1 1/2 cups de caldo de verduras
1/2 cup de crema agria
1 tsp de paprika
1/2 tsp de sal
1/4 tsp de pimienta negra`,
      instructions: `Cocina 8 oz de fideos de huevo según las instrucciones del paquete y reserva.

Calienta 2 Tbsp de mantequilla y 1 Tbsp de aceite de oliva en un sartén a fuego medio-alto.

Agrega 16 oz de champiñones y cocina de 6 a 8 minutos, hasta que estén bien dorados.

Agrega 1/2 cebolla picada y cocina de 3 a 4 minutos, hasta que se ablande. Agrega 2 dientes de ajo y cocina 30 segundos.

Incorpora 1 Tbsp de harina y cocina 1 minuto.

Agrega 1 1/2 cups de caldo de verduras y cocina a fuego bajo hasta que espese un poco.

Reduce el fuego a bajo e incorpora 1/2 cup de crema agria, 1 tsp de paprika, 1/2 tsp de sal y 1/4 tsp de pimienta.

Agrega los fideos y mezcla para cubrirlos. Sirve caliente.`,
    },
  },
},

{
  id: "oyster-mushroom-bbq-tacos",
  slug: "oyster-mushroom-bbq-tacos",
  name: "Oyster Mushroom BBQ Tacos",
  ingredients: `Mushrooms:
12 oz oyster mushrooms, torn into strips
1 Tbsp olive oil
1/2 tsp salt
1/4 tsp black pepper
1/2 tsp smoked paprika (or regular paprika)

BBQ Sauce:
1/2 cup barbecue sauce
1 Tbsp apple cider vinegar
1 tsp honey or maple syrup (optional)

Assembly:
8 small tortillas
1 cup coleslaw mix
1/4 cup red onion, thinly sliced
2 Tbsp fresh cilantro, chopped`,
  instructions: `Preheat oven to 425°F.

Toss 12 oz oyster mushrooms with 1 Tbsp olive oil, 1/2 tsp salt, 1/4 tsp black pepper, and 1/2 tsp smoked paprika.

Spread mushrooms in a single layer on a baking sheet.

Roast for 20 to 25 minutes, stirring halfway, until edges are crispy and slightly charred.

In a bowl, mix 1/2 cup barbecue sauce with 1 Tbsp apple cider vinegar and 1 tsp honey if using.

Toss the roasted mushrooms with the BBQ sauce until evenly coated.

Warm 8 tortillas in a skillet over medium heat or directly over a flame.

Fill tortillas with BBQ mushrooms, then top with coleslaw mix, sliced red onion, and cilantro.

Serve immediately.`,
  photoUrl: "/images/oyster-mushroom-bbq-tacos.jpg",
  effort: "quick",
  tags: ["vegetarian", "dinner", "tacos", "bbq", "vegan", "plant-based", "comfort", "tex-mex"],
  isVegetarian: true,
  // Oyster Mushroom BBQ Tacos
suggestedSides: [
  "Cilantro lime rice",
  "Chips and salsa",
  "Street corn",
],
  notes: "Oyster mushrooms roast into a tender, slightly crispy texture that mimics pulled meat. Don’t overcrowd the pan to get the best caramelization.",
  translations: {
    es: {
      name: "Tacos BBQ de hongos ostra",
      notes:
        "Los hongos ostra se asan hasta quedar tiernos y ligeramente crujientes, con una textura que recuerda a carne deshebrada. No llenes demasiado la bandeja para lograr la mejor caramelización.",
      tags: [
        "vegetariano",
        "cena",
        "tacos",
        "bbq",
        "vegano",
        "a base de plantas",
        "comida reconfortante",
        "tex-mex",
      ],
      suggestedSides: [
        "Arroz con cilantro y lima",
        "Totopos con salsa",
        "Elote estilo callejero",
      ],
      ingredients: `Hongos:
12 oz de hongos ostra, deshebrados en tiras
1 Tbsp de aceite de oliva
1/2 tsp de sal
1/4 tsp de pimienta negra
1/2 tsp de paprika ahumada o paprika regular

Salsa BBQ:
1/2 cup de salsa barbecue
1 Tbsp de vinagre de manzana
1 tsp de miel o jarabe de maple, opcional

Armado:
8 tortillas pequeñas
1 cup de mezcla para coleslaw
1/4 cup de cebolla roja, rebanada finamente
2 Tbsp de cilantro fresco, picado`,
      instructions: `Precalienta el horno a 425°F.

Mezcla 12 oz de hongos ostra con 1 Tbsp de aceite de oliva, 1/2 tsp de sal, 1/4 tsp de pimienta negra y 1/2 tsp de paprika ahumada.

Extiende los hongos en una sola capa sobre una bandeja para hornear.

Asa de 20 a 25 minutos, revolviendo a la mitad, hasta que los bordes estén crujientes y ligeramente tostados.

En un tazón, mezcla 1/2 cup de salsa barbecue con 1 Tbsp de vinagre de manzana y 1 tsp de miel si la usas.

Mezcla los hongos asados con la salsa BBQ hasta cubrirlos de manera uniforme.

Calienta 8 tortillas en un sartén a fuego medio o directamente sobre la llama.

Rellena las tortillas con los hongos BBQ, luego cubre con mezcla para coleslaw, cebolla roja rebanada y cilantro.

Sirve de inmediato.`,
    },
  },
},

{
  id: "gochujang-tofu-broccoli-stir-fry",
  slug: "gochujang-tofu-broccoli-stir-fry",
  name: "Gochujang Tofu Broccoli Stir-Fry",
  ingredients: `Tofu:
1 (14 oz) block extra-firm tofu, pressed and cubed
1 Tbsp cornstarch
1 Tbsp olive oil

Sauce:
2 Tbsp gochujang (Korean chili paste)
1 Tbsp soy sauce
1 Tbsp honey or maple syrup
1 tsp sesame oil
1 Tbsp rice vinegar
1/4 cup water

Stir-Fry:
2 cups broccoli florets
2 cloves garlic, minced
1 tsp fresh ginger, grated
1 Tbsp olive oil

Optional:
2 cups cooked rice, for serving
1 Tbsp sesame seeds
2 green onions, sliced`,
  instructions: `Press 1 (14 oz) tofu for at least 10 minutes to remove excess moisture, then cut into cubes.

Toss tofu with 1 Tbsp cornstarch until lightly coated.

Heat 1 Tbsp olive oil in a large skillet or wok over medium-high heat.

Add tofu in a single layer and cook 4 to 5 minutes without moving, until golden and crisp. Flip and cook another 3 to 4 minutes. Remove and set aside.

In a small bowl, whisk together 2 Tbsp gochujang, 1 Tbsp soy sauce, 1 Tbsp honey or maple syrup, 1 tsp sesame oil, 1 Tbsp rice vinegar, and 1/4 cup water.

In the same pan, heat 1 Tbsp olive oil over medium-high heat. Add 2 cups broccoli and cook 4 to 5 minutes until tender-crisp.

Add 2 cloves garlic and 1 tsp ginger. Cook 30 seconds until fragrant.

Return tofu to the pan and pour in the sauce.

Cook 2 to 3 minutes, stirring, until the sauce thickens slightly and coats the tofu and broccoli.

Serve over rice and garnish with sesame seeds and green onions if desired.`,
  photoUrl: "/images/gochujang-tofu-broccoli-stir-fry.jpg",
  effort: "quick",
  tags: ["vegetarian", "dinner", "stir-fry", "spicy", "healthy", "one-pan", "vegan", "asian"],
  isVegetarian: true,
  // Gochujang Tofu Broccoli Stir-Fry
suggestedSides: [
  "Steamed rice",
  "Cucumber salad",
  "Kimchi",
],
  notes: "A bold, spicy-sweet stir-fry with crispy tofu and tender broccoli. Letting the tofu cook undisturbed helps create the best texture.",
  translations: {
    es: {
      name: "Salteado de tofu con brócoli y gochujang",
      notes:
        "Un salteado intenso, picante y dulce, con tofu crujiente y brócoli tierno. Dejar que el tofu se cocine sin moverlo ayuda a lograr la mejor textura.",
      tags: [
        "vegetariano",
        "cena",
        "salteado",
        "picante",
        "saludable",
        "una sartén",
        "vegano",
        "asiático",
      ],
      suggestedSides: [
        "Arroz al vapor",
        "Ensalada de pepino",
        "Kimchi",
      ],
      ingredients: `Tofu:
1 bloque (14 oz) de tofu extra firme, prensado y cortado en cubos
1 Tbsp de maicena
1 Tbsp de aceite de oliva

Salsa:
2 Tbsp de gochujang, pasta coreana de chile
1 Tbsp de salsa de soya
1 Tbsp de miel o jarabe de maple
1 tsp de aceite de sésamo
1 Tbsp de vinagre de arroz
1/4 cup de agua

Salteado:
2 cups de floretes de brócoli
2 dientes de ajo, picados
1 tsp de jengibre fresco, rallado
1 Tbsp de aceite de oliva

Opcional:
2 cups de arroz cocido, para servir
1 Tbsp de semillas de sésamo
2 cebollines, rebanados`,
      instructions: `Prensa 1 bloque (14 oz) de tofu durante al menos 10 minutos para retirar el exceso de humedad, luego córtalo en cubos.

Mezcla el tofu con 1 Tbsp de maicena hasta cubrirlo ligeramente.

Calienta 1 Tbsp de aceite de oliva en un sartén grande o wok a fuego medio-alto.

Agrega el tofu en una sola capa y cocina de 4 a 5 minutos sin moverlo, hasta que esté dorado y crujiente. Voltea y cocina otros 3 a 4 minutos. Retira y reserva.

En un tazón pequeño, bate 2 Tbsp de gochujang, 1 Tbsp de salsa de soya, 1 Tbsp de miel o jarabe de maple, 1 tsp de aceite de sésamo, 1 Tbsp de vinagre de arroz y 1/4 cup de agua.

En el mismo sartén, calienta 1 Tbsp de aceite de oliva a fuego medio-alto. Agrega 2 cups de brócoli y cocina de 4 a 5 minutos, hasta que esté tierno pero crujiente.

Agrega 2 dientes de ajo y 1 tsp de jengibre. Cocina 30 segundos, hasta que suelte aroma.

Regresa el tofu al sartén y vierte la salsa.

Cocina de 2 a 3 minutos, revolviendo, hasta que la salsa espese ligeramente y cubra el tofu y el brócoli.

Sirve sobre arroz y decora con semillas de sésamo y cebollines si deseas.`,
    },
  },
},

{
  id: "coconut-curry-ramen",
  slug: "coconut-curry-ramen",
  name: "Coconut Curry Ramen",
  ingredients: `Broth:
1 Tbsp olive oil
2 cloves garlic, minced
1 tsp fresh ginger, grated
2 Tbsp red curry paste
1 (13.5 oz) can coconut milk
3 cups vegetable broth
1 Tbsp soy sauce
1 tsp brown sugar
1 Tbsp lime juice

Noodles & Add-ins:
8 oz ramen noodles (discard seasoning packets)
1 cup mushrooms, sliced
1 cup baby spinach
1/2 cup carrots, shredded
1/2 cup bell peppers, sliced

Optional Toppings:
2 soft-boiled eggs
2 green onions, sliced
1 Tbsp chili oil
fresh cilantro`,
  instructions: `Heat 1 Tbsp olive oil in a large pot over medium heat.

Add 2 cloves garlic and 1 tsp ginger. Cook for 30 seconds until fragrant.

Stir in 2 Tbsp red curry paste and cook for 1 minute to deepen the flavor.

Pour in 1 can coconut milk and 3 cups vegetable broth. Stir to combine.

Add 1 Tbsp soy sauce and 1 tsp brown sugar. Bring to a gentle simmer.

Add mushrooms, carrots, and bell peppers. Simmer for 5 to 7 minutes until tender.

Add 8 oz ramen noodles and cook according to package directions, about 3 to 4 minutes.

Stir in 1 cup spinach and 1 Tbsp lime juice. Cook until spinach wilts.

Ladle into bowls and top with soft-boiled eggs, green onions, chili oil, and cilantro if desired. Serve hot.`,
  photoUrl: "/images/coconut-curry-ramen.jpg",
  effort: "normal",
  tags: ["vegetarian", "dinner", "soup", "ramen", "comfort", "spicy", "one-pot", "asian"],
  isVegetarian: true,
  // Coconut Curry Ramen
suggestedSides: [
  "Spring rolls",
  "Cucumber salad",
  "Steamed edamame",
],
  notes: "A rich, creamy ramen with bold curry flavor and a silky coconut broth. Adjust spice by adding more or less curry paste or chili oil.",
  translations: {
    es: {
      name: "Ramen de curry con coco",
      notes:
        "Un ramen rico y cremoso con sabor intenso a curry y un caldo sedoso de coco. Ajusta el picante agregando más o menos pasta de curry o aceite de chile.",
      tags: [
        "vegetariano",
        "cena",
        "sopa",
        "ramen",
        "comida reconfortante",
        "picante",
        "una olla",
        "asiático",
      ],
      suggestedSides: [
        "Rollitos primavera",
        "Ensalada de pepino",
        "Edamame al vapor",
      ],
      ingredients: `Caldo:
1 Tbsp de aceite de oliva
2 dientes de ajo, picados
1 tsp de jengibre fresco, rallado
2 Tbsp de pasta de curry rojo
1 lata (13.5 oz) de leche de coco
3 cups de caldo de verduras
1 Tbsp de salsa de soya
1 tsp de azúcar morena
1 Tbsp de jugo de lima

Fideos y agregados:
8 oz de fideos ramen, desecha los paquetes de sazonador
1 cup de champiñones, rebanados
1 cup de espinaca baby
1/2 cup de zanahorias, ralladas
1/2 cup de pimientos, rebanados

Toppings opcionales:
2 huevos pasados por agua
2 cebollines, rebanados
1 Tbsp de aceite de chile
cilantro fresco`,
      instructions: `Calienta 1 Tbsp de aceite de oliva en una olla grande a fuego medio.

Agrega 2 dientes de ajo y 1 tsp de jengibre. Cocina 30 segundos, hasta que suelte aroma.

Incorpora 2 Tbsp de pasta de curry rojo y cocina 1 minuto para intensificar el sabor.

Vierte 1 lata de leche de coco y 3 cups de caldo de verduras. Mezcla para combinar.

Agrega 1 Tbsp de salsa de soya y 1 tsp de azúcar morena. Lleva a un hervor suave.

Agrega los champiñones, las zanahorias y los pimientos. Cocina a fuego bajo de 5 a 7 minutos, hasta que estén tiernos.

Agrega 8 oz de fideos ramen y cocina según las instrucciones del paquete, aproximadamente 3 a 4 minutos.

Incorpora 1 cup de espinaca y 1 Tbsp de jugo de lima. Cocina hasta que la espinaca se marchite.

Sirve en tazones y cubre con huevos pasados por agua, cebollines, aceite de chile y cilantro si deseas. Sirve caliente.`,
    },
  },
},

{
  id: "mediterranean-zucchini-fritters-tzatziki",
  slug: "mediterranean-zucchini-fritters-tzatziki",
  name: "Mediterranean Zucchini Fritters with Tzatziki",
  ingredients: `Fritters:
2 medium zucchini, grated
1/2 tsp salt
1/3 cup all-purpose flour (or chickpea flour for gluten-free)
1/4 cup feta cheese, crumbled
2 Tbsp fresh dill, chopped (or parsley)
2 Tbsp green onion, sliced
1 clove garlic, minced
1 large egg
1/4 tsp black pepper
2 Tbsp olive oil (for frying)

Tzatziki:
1 cup Greek yogurt
1/2 cup cucumber, grated and squeezed dry
1 Tbsp lemon juice
1 Tbsp olive oil
1 clove garlic, minced
1 Tbsp fresh dill, chopped
1/4 tsp salt`,
  instructions: `Grate 2 zucchini and place in a bowl with 1/2 tsp salt. Let sit for 10 minutes to draw out moisture.

Transfer zucchini to a clean towel and squeeze out as much liquid as possible. This step is key for crispy fritters.

In a bowl, combine the drained zucchini with 1/3 cup flour, 1/4 cup feta, 2 Tbsp dill, 2 Tbsp green onion, 1 clove garlic, 1 egg, and 1/4 tsp black pepper. Mix until a thick batter forms.

Heat 2 Tbsp olive oil in a skillet over medium heat.

Scoop about 2 Tbsp of the mixture per fritter into the pan and flatten slightly.

Cook 3 to 4 minutes per side, until deep golden-brown and crisp on the outside.

Transfer to a paper towel-lined plate or wire rack.

In a separate bowl, combine 1 cup Greek yogurt, 1/2 cup squeezed cucumber, 1 Tbsp lemon juice, 1 Tbsp olive oil, 1 clove garlic, 1 Tbsp dill, and 1/4 tsp salt. Stir until smooth.

Serve fritters warm with tzatziki on the side.`,
  photoUrl: "/images/mediterranean-zucchini-fritters-tzatziki.jpg",
  effort: "normal",
  tags: [
  "vegetarian",
  "side",
  "appetizer",
  "mediterranean",
  "crispy",
  "skillet",
  "healthy",
],
  isVegetarian: true,
  notes: "Crispy on the outside and tender inside, these fritters depend on removing excess moisture from the zucchini. The tzatziki adds a cool, tangy balance.",
  translations: {
    es: {
      name: "Tortitas mediterráneas de zucchini con tzatziki",
      notes:
        "Crujientes por fuera y tiernas por dentro, estas tortitas dependen de retirar el exceso de humedad del zucchini. El tzatziki agrega un equilibrio fresco y ácido.",
      tags: [
        "vegetariano",
        "cena",
        "aperitivo",
        "mediterráneo",
        "crujiente",
        "sartén",
        "saludable",
      ],
      ingredients: `Tortitas:
2 zucchini medianos, rallados
1/2 tsp de sal
1/3 cup de harina de todo uso o harina de garbanzo para sin gluten
1/4 cup de queso feta, desmoronado
2 Tbsp de eneldo fresco, picado, o perejil
2 Tbsp de cebollín, rebanado
1 diente de ajo, picado
1 huevo grande
1/4 tsp de pimienta negra
2 Tbsp de aceite de oliva para freír

Tzatziki:
1 cup de yogur griego
1/2 cup de pepino, rallado y exprimido
1 Tbsp de jugo de limón
1 Tbsp de aceite de oliva
1 diente de ajo, picado
1 Tbsp de eneldo fresco, picado
1/4 tsp de sal`,
      instructions: `Ralla 2 zucchini y colócalos en un tazón con 1/2 tsp de sal. Deja reposar 10 minutos para sacar la humedad.

Pasa el zucchini a una toalla limpia y exprime la mayor cantidad de líquido posible. Este paso es clave para tortitas crujientes.

En un tazón, combina el zucchini escurrido con 1/3 cup de harina, 1/4 cup de feta, 2 Tbsp de eneldo, 2 Tbsp de cebollín, 1 diente de ajo, 1 huevo y 1/4 tsp de pimienta negra. Mezcla hasta formar una masa espesa.

Calienta 2 Tbsp de aceite de oliva en un sartén a fuego medio.

Coloca aproximadamente 2 Tbsp de la mezcla por cada tortita en el sartén y aplana ligeramente.

Cocina de 3 a 4 minutos por lado, hasta que estén bien doradas y crujientes por fuera.

Pasa a un plato con toallas de papel o a una rejilla.

En otro tazón, combina 1 cup de yogur griego, 1/2 cup de pepino exprimido, 1 Tbsp de jugo de limón, 1 Tbsp de aceite de oliva, 1 diente de ajo, 1 Tbsp de eneldo y 1/4 tsp de sal. Mezcla hasta que quede suave.

Sirve las tortitas calientes con tzatziki al lado.`,
    },
  },
},

{
  id: "kimchi-brown-rice-bliss-bowl",
  slug: "kimchi-brown-rice-bliss-bowl",
  name: "Kimchi Brown Rice Bliss Bowls",
  ingredients: `Rice Base:
2 cups cooked brown rice

Protein:
1 (14 oz) block firm tofu, cubed
1 Tbsp soy sauce
1 tsp sesame oil
1 Tbsp olive oil

Vegetables:
1 cup kimchi, chopped
1/2 cup carrots, shredded
1/2 cup cucumber, sliced
1 cup baby spinach

Sauce:
1 Tbsp gochujang
1 Tbsp soy sauce
1 tsp honey or maple syrup
1 tsp sesame oil
1 Tbsp water

Optional Toppings:
2 fried or soft-boiled eggs
1 Tbsp sesame seeds
2 green onions, sliced`,
  instructions: `Heat 1 Tbsp olive oil in a skillet over medium-high heat.

Add 1 (14 oz) cubed tofu and cook 4 to 5 minutes until lightly browned. Flip and cook another 3 to 4 minutes until crisp.

Add 1 Tbsp soy sauce and 1 tsp sesame oil to the tofu. Toss to coat and cook 1 more minute. Remove from heat.

In a small bowl, whisk together 1 Tbsp gochujang, 1 Tbsp soy sauce, 1 tsp honey or maple syrup, 1 tsp sesame oil, and 1 Tbsp water.

Warm 2 cups cooked brown rice if needed.

Assemble bowls with rice as the base.

Top with tofu, 1 cup kimchi, 1/2 cup shredded carrots, 1/2 cup cucumber, and 1 cup spinach.

Drizzle sauce over the top.

Add eggs, sesame seeds, and green onions if desired. Serve immediately.`,
  photoUrl: "/images/kimchi-brown-rice-bliss-bowl.jpg",
  effort: "quick",
  tags: ["vegetarian", "dinner", "bowl", "healthy", "fermented", "asian", "meal-prep"],
  isVegetarian: true,
  // Kimchi Brown Rice Bliss Bowls
suggestedSides: [
  "Cucumber salad",
  "Steamed edamame",
  "Miso soup",
],
  notes: "A bold, tangy bowl with probiotic-rich kimchi and crispy tofu. Adjust spice by increasing or reducing gochujang.",
  translations: {
    es: {
      name: "Bowls de arroz integral con kimchi",
      notes:
        "Un bowl intenso y ácido con kimchi rico en probióticos y tofu crujiente. Ajusta el picante aumentando o reduciendo el gochujang.",
      tags: [
        "vegetariano",
        "cena",
        "bowl",
        "saludable",
        "fermentado",
        "asiático",
        "meal prep",
      ],
      suggestedSides: [
        "Ensalada de pepino",
        "Edamame al vapor",
        "Sopa de miso",
      ],
      ingredients: `Base de arroz:
2 cups de arroz integral cocido

Proteína:
1 bloque (14 oz) de tofu firme, cortado en cubos
1 Tbsp de salsa de soya
1 tsp de aceite de sésamo
1 Tbsp de aceite de oliva

Verduras:
1 cup de kimchi, picado
1/2 cup de zanahorias, ralladas
1/2 cup de pepino, rebanado
1 cup de espinaca baby

Salsa:
1 Tbsp de gochujang
1 Tbsp de salsa de soya
1 tsp de miel o jarabe de maple
1 tsp de aceite de sésamo
1 Tbsp de agua

Toppings opcionales:
2 huevos fritos o pasados por agua
1 Tbsp de semillas de sésamo
2 cebollines, rebanados`,
      instructions: `Calienta 1 Tbsp de aceite de oliva en un sartén a fuego medio-alto.

Agrega 1 bloque (14 oz) de tofu en cubos y cocina de 4 a 5 minutos hasta que esté ligeramente dorado. Voltea y cocina otros 3 a 4 minutos, hasta que esté crujiente.

Agrega 1 Tbsp de salsa de soya y 1 tsp de aceite de sésamo al tofu. Mezcla para cubrir y cocina 1 minuto más. Retira del fuego.

En un tazón pequeño, bate 1 Tbsp de gochujang, 1 Tbsp de salsa de soya, 1 tsp de miel o jarabe de maple, 1 tsp de aceite de sésamo y 1 Tbsp de agua.

Calienta 2 cups de arroz integral cocido si es necesario.

Arma los bowls usando el arroz como base.

Cubre con tofu, 1 cup de kimchi, 1/2 cup de zanahorias ralladas, 1/2 cup de pepino y 1 cup de espinaca.

Rocía la salsa por encima.

Agrega huevos, semillas de sésamo y cebollines si deseas. Sirve de inmediato.`,
    },
  },
},

{
  id: "sweet-potato-kale-chili",
  slug: "sweet-potato-kale-chili",
  name: "Sweet Potato and Kale Chili",
  ingredients: `Base:
1 Tbsp olive oil
1 small onion, diced
2 cloves garlic, minced

Chili:
2 cups sweet potatoes, peeled and cubed
1 (15 oz) can black beans, drained
1 (15 oz) can kidney beans, drained
1 (14 oz) can diced tomatoes
2 cups vegetable broth
2 cups kale, chopped

Seasoning:
1 Tbsp chili powder
1 tsp cumin
1/2 tsp smoked paprika (or regular paprika)
1/2 tsp salt
1/4 tsp black pepper

Optional:
1/2 tsp cayenne pepper (for heat)
1 Tbsp lime juice`,
  instructions: `Heat 1 Tbsp olive oil in a large pot over medium heat.

Add 1 diced onion and cook 4 to 5 minutes until softened.

Add 2 cloves garlic and cook 30 seconds until fragrant.

Stir in 2 cups cubed sweet potatoes, 1 can black beans, 1 can kidney beans, 1 can diced tomatoes, and 2 cups vegetable broth.

Add 1 Tbsp chili powder, 1 tsp cumin, 1/2 tsp smoked paprika, 1/2 tsp salt, 1/4 tsp black pepper, and cayenne if using. Stir well.

Bring to a boil, then reduce heat to a low simmer.

Cover and cook for 20 to 25 minutes, until sweet potatoes are fork-tender.

Stir in 2 cups chopped kale and cook 3 to 5 minutes until wilted.

Finish with 1 Tbsp lime juice if desired. Taste and adjust seasoning.

Serve hot.`,
  photoUrl: "/images/sweet-potato-kale-chili.jpg",
  effort: "normal",
  tags: ["vegetarian", "dinner", "chili", "one-pot", "comfort", "healthy", "meal-prep"],
  isVegetarian: true,
  // Sweet Potato and Kale Chili
suggestedSides: [
  "Cornbread",
  "Side salad",
  "Tortilla chips",
],
  notes: "A hearty, nutrient-packed chili with natural sweetness from the potatoes and a slight kick from the spices. Great for leftovers and freezer-friendly.",
  translations: {
    es: {
      name: "Chili de camote y kale",
      notes:
        "Un chili sustancioso y lleno de nutrientes, con dulzura natural de los camotes y un ligero toque picante de las especias. Excelente para sobras y apto para congelar.",
      tags: [
        "vegetariano",
        "cena",
        "chili",
        "una olla",
        "comida reconfortante",
        "saludable",
        "meal prep",
      ],
      suggestedSides: [
        "Pan de maíz",
        "Ensalada sencilla",
        "Totopos",
      ],
      ingredients: `Base:
1 Tbsp de aceite de oliva
1 cebolla pequeña, picada en cubitos
2 dientes de ajo, picados

Chili:
2 cups de camotes, pelados y cortados en cubos
1 lata (15 oz) de frijoles negros, escurridos
1 lata (15 oz) de frijoles rojos, escurridos
1 lata (14 oz) de tomates en cubitos
2 cups de caldo de verduras
2 cups de kale, picado

Sazonador:
1 Tbsp de chile en polvo
1 tsp de comino
1/2 tsp de paprika ahumada o paprika regular
1/2 tsp de sal
1/4 tsp de pimienta negra

Opcional:
1/2 tsp de pimienta de cayena para picante
1 Tbsp de jugo de lima`,
      instructions: `Calienta 1 Tbsp de aceite de oliva en una olla grande a fuego medio.

Agrega 1 cebolla picada y cocina de 4 a 5 minutos, hasta que se ablande.

Agrega 2 dientes de ajo y cocina 30 segundos, hasta que suelte aroma.

Incorpora 2 cups de camotes en cubos, 1 lata de frijoles negros, 1 lata de frijoles rojos, 1 lata de tomates en cubitos y 2 cups de caldo de verduras.

Agrega 1 Tbsp de chile en polvo, 1 tsp de comino, 1/2 tsp de paprika ahumada, 1/2 tsp de sal, 1/4 tsp de pimienta negra y cayena si la usas. Mezcla bien.

Lleva a hervor, luego reduce el fuego a un hervor bajo.

Tapa y cocina de 20 a 25 minutos, hasta que los camotes estén tiernos al pincharlos con un tenedor.

Incorpora 2 cups de kale picado y cocina de 3 a 5 minutos, hasta que se marchite.

Termina con 1 Tbsp de jugo de lima si deseas. Prueba y ajusta los condimentos.

Sirve caliente.`,
    },
  },
},

{
  id: "greek-style-baked-orzo",
  slug: "greek-style-baked-orzo",
  name: "Greek-Style Baked Orzo",
  ingredients: `Base:
1 Tbsp olive oil
1/2 onion, diced
2 cloves garlic, minced

Orzo Bake:
1 cup uncooked orzo
1 (14 oz) can diced tomatoes
2 cups vegetable broth
1/2 cup kalamata olives, sliced
1 tsp dried oregano
1/2 tsp salt
1/4 tsp black pepper

Finish:
1/2 cup feta cheese, crumbled
1/4 cup fresh parsley, chopped
1 Tbsp lemon juice`,
  instructions: `Preheat oven to 375°F.

Heat 1 Tbsp olive oil in an oven-safe skillet or pot over medium heat.

Add 1/2 diced onion and cook 4 to 5 minutes until softened.

Add 2 cloves garlic and cook 30 seconds until fragrant.

Stir in 1 cup uncooked orzo and toast for 1 to 2 minutes, stirring, until lightly golden and nutty.

Add 1 can diced tomatoes, 2 cups vegetable broth, 1/2 cup olives, 1 tsp oregano, 1/2 tsp salt, and 1/4 tsp black pepper. Stir well.

Bring to a light simmer, then transfer to the oven.

Bake uncovered for 18 to 22 minutes, until the orzo is tender and most of the liquid is absorbed.

Remove from oven and stir gently.

Top with 1/2 cup feta, 1/4 cup parsley, and 1 Tbsp lemon juice.

Let rest for 5 minutes before serving.`,
  photoUrl: "/images/greek-style-baked-orzo.jpg",
  effort: "normal",
  tags: ["vegetarian", "dinner", "pasta", "bake", "mediterranean", "one-pan", "comfort"],
  isVegetarian: true,
  // Greek-Style Baked Orzo
suggestedSides: [
  "Greek salad",
  "Pita bread",
  "Cucumber salad",
],
  notes: "A bright, savory baked orzo dish with Mediterranean flavors. Toasting the orzo first adds depth, and the lemon at the end keeps it fresh and balanced.",
  translations: {
    es: {
      name: "Orzo al horno estilo griego",
      notes:
        "Un plato de orzo al horno brillante y sabroso, con sabores mediterráneos. Tostar el orzo primero agrega profundidad, y el limón al final lo mantiene fresco y equilibrado.",
      tags: [
        "vegetariano",
        "cena",
        "pasta",
        "horneado",
        "mediterráneo",
        "una sartén",
        "comida reconfortante",
      ],
      suggestedSides: [
        "Ensalada griega",
        "Pan pita",
        "Ensalada de pepino",
      ],
      ingredients: `Base:
1 Tbsp de aceite de oliva
1/2 cebolla, picada en cubitos
2 dientes de ajo, picados

Orzo al horno:
1 cup de orzo sin cocinar
1 lata (14 oz) de tomates en cubitos
2 cups de caldo de verduras
1/2 cup de aceitunas kalamata, rebanadas
1 tsp de orégano seco
1/2 tsp de sal
1/4 tsp de pimienta negra

Para terminar:
1/2 cup de queso feta, desmoronado
1/4 cup de perejil fresco, picado
1 Tbsp de jugo de limón`,
      instructions: `Precalienta el horno a 375°F.

Calienta 1 Tbsp de aceite de oliva en un sartén u olla apta para horno a fuego medio.

Agrega 1/2 cebolla picada y cocina de 4 a 5 minutos, hasta que se ablande.

Agrega 2 dientes de ajo y cocina 30 segundos, hasta que suelte aroma.

Incorpora 1 cup de orzo sin cocinar y tuesta de 1 a 2 minutos, revolviendo, hasta que esté ligeramente dorado y con aroma a nuez.

Agrega 1 lata de tomates en cubitos, 2 cups de caldo de verduras, 1/2 cup de aceitunas, 1 tsp de orégano, 1/2 tsp de sal y 1/4 tsp de pimienta negra. Mezcla bien.

Lleva a un hervor suave, luego pasa al horno.

Hornea sin cubrir de 18 a 22 minutos, hasta que el orzo esté tierno y la mayor parte del líquido se haya absorbido.

Retira del horno y revuelve suavemente.

Cubre con 1/2 cup de feta, 1/4 cup de perejil y 1 Tbsp de jugo de limón.

Deja reposar 5 minutos antes de servir.`,
    },
  },
},

{
  id: "mushroom-sage-tagliatelle",
  slug: "mushroom-sage-tagliatelle",
  name: "Mushroom and Sage Tagliatelle",
  ingredients: `Pasta:
12 oz tagliatelle (or fettuccine)

Mushrooms:
2 Tbsp olive oil
1 Tbsp butter
16 oz mushrooms, sliced (cremini or mixed mushrooms)
1/2 tsp salt
1/4 tsp black pepper

Sauce:
2 cloves garlic, minced
1 tsp fresh sage, finely chopped (or 1/2 tsp dried sage)
1/2 cup heavy cream (or half-and-half for lighter)
1/2 cup parmesan cheese, grated
1/2 cup reserved pasta water

Finish:
1 Tbsp butter
1 Tbsp fresh parsley, chopped (optional)`,
  instructions: `Bring a large pot of salted water to a boil and cook 12 oz tagliatelle according to package directions. Reserve 1/2 cup pasta water before draining.

Heat 2 Tbsp olive oil and 1 Tbsp butter in a large skillet over medium-high heat.

Add 16 oz mushrooms in a single layer and cook 6 to 8 minutes without stirring too much, until deeply browned and slightly crisp on the edges.

Season with 1/2 tsp salt and 1/4 tsp black pepper.

Add 2 cloves garlic and 1 tsp sage. Cook 30 seconds until fragrant.

Reduce heat to medium and pour in 1/2 cup heavy cream. Simmer gently for 2 to 3 minutes.

Stir in 1/2 cup grated parmesan and a splash of reserved pasta water, stirring until the sauce becomes smooth and lightly coats the back of a spoon.

Add cooked pasta and toss to coat, adding more pasta water as needed to loosen the sauce.

Finish with 1 Tbsp butter for extra richness and gloss.

Garnish with parsley if using and serve immediately.`,
  photoUrl: "/images/mushroom-sage-tagliatelle.jpg",
  effort: "normal",
  tags: ["vegetarian", "dinner", "pasta", "comfort", "italian", "creamy", "date-night"],
  isVegetarian: true,
  // Mushroom and Sage Tagliatelle
suggestedSides: [
  "Garlic bread",
  "Simple green salad",
  "Roasted asparagus",
],
  notes: "Deeply browned mushrooms create rich, savory flavor while sage adds warmth. Avoid overcrowding the pan so the mushrooms caramelize instead of steaming.",
  translations: {
    es: {
      name: "Tagliatelle con champiñones y salvia",
      notes:
        "Los champiñones bien dorados crean un sabor rico y sabroso, mientras que la salvia aporta calidez. Evita llenar demasiado el sartén para que los champiñones se caramelicen en lugar de cocinarse al vapor.",
      tags: [
        "vegetariano",
        "cena",
        "pasta",
        "comida reconfortante",
        "italiana",
        "cremoso",
        "noche especial",
      ],
      suggestedSides: [
        "Pan de ajo",
        "Ensalada verde sencilla",
        "Espárragos rostizados",
      ],
      ingredients: `Pasta:
12 oz de tagliatelle o fettuccine

Champiñones:
2 Tbsp de aceite de oliva
1 Tbsp de mantequilla
16 oz de champiñones, rebanados, cremini o mezcla de champiñones
1/2 tsp de sal
1/4 tsp de pimienta negra

Salsa:
2 dientes de ajo, picados
1 tsp de salvia fresca, finamente picada, o 1/2 tsp de salvia seca
1/2 cup de crema espesa o half-and-half para más ligero
1/2 cup de queso parmesano, rallado
1/2 cup de agua reservada de la pasta

Para terminar:
1 Tbsp de mantequilla
1 Tbsp de perejil fresco, picado, opcional`,
      instructions: `Hierve una olla grande con agua salada y cocina 12 oz de tagliatelle según las instrucciones del paquete. Reserva 1/2 cup de agua de la pasta antes de escurrir.

Calienta 2 Tbsp de aceite de oliva y 1 Tbsp de mantequilla en un sartén grande a fuego medio-alto.

Agrega 16 oz de champiñones en una sola capa y cocina de 6 a 8 minutos sin revolver demasiado, hasta que estén bien dorados y ligeramente crujientes en los bordes.

Sazona con 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Agrega 2 dientes de ajo y 1 tsp de salvia. Cocina 30 segundos, hasta que suelte aroma.

Reduce el fuego a medio y vierte 1/2 cup de crema espesa. Cocina a fuego suave de 2 a 3 minutos.

Incorpora 1/2 cup de parmesano rallado y un chorrito del agua reservada de la pasta, revolviendo hasta que la salsa quede suave y cubra ligeramente el dorso de una cuchara.

Agrega la pasta cocida y mezcla para cubrir, agregando más agua de pasta según sea necesario para aflojar la salsa.

Termina con 1 Tbsp de mantequilla para más riqueza y brillo.

Decora con perejil si lo usas y sirve de inmediato.`,
    },
  },
},

{
  id: "vegan-crunchwrap-supreme",
  slug: "vegan-crunchwrap-supreme",
  name: "Vegan Crunchwrap Supreme",
  ingredients: `Filling:
1 Tbsp olive oil
1/2 onion, diced
1 (15 oz) can black beans, drained and rinsed
1 tsp chili powder
1/2 tsp cumin
1/2 tsp paprika
1/2 tsp salt
1/4 tsp black pepper

Creamy Sauce:
1/2 cup vegan sour cream (or dairy-free yogurt)
1 Tbsp lime juice
1/2 tsp garlic powder
1/4 tsp salt

Assembly:
4 large flour tortillas
4 small tostada shells (or tortilla chips)
1 cup shredded lettuce
1/2 cup tomatoes, diced
1/2 cup vegan cheese, shredded`,
  instructions: `Heat 1 Tbsp olive oil in a skillet over medium heat.

Add 1/2 diced onion and cook 4 to 5 minutes until softened.

Add 1 can black beans, 1 tsp chili powder, 1/2 tsp cumin, 1/2 tsp paprika, 1/2 tsp salt, and 1/4 tsp black pepper. Cook 5 to 7 minutes, lightly mashing some beans until the mixture is thick and slightly creamy.

In a small bowl, mix 1/2 cup vegan sour cream, 1 Tbsp lime juice, 1/2 tsp garlic powder, and 1/4 tsp salt until smooth.

Warm 4 large tortillas until soft and flexible.

In the center of each tortilla, spread a layer of bean filling.

Top with a tostada shell, then add a spoonful of sauce, 1/4 cup lettuce, tomatoes, and vegan cheese.

Fold the edges of the tortilla up and over the center, working around to create a sealed wrap.

Heat a clean skillet over medium heat and place the crunchwrap seam-side down.

Cook 3 to 4 minutes until golden and sealed, then flip and cook another 2 to 3 minutes until crisp.

Serve warm.`,
  photoUrl: "/images/vegan-crunchwrap-supreme.jpg",
  effort: "normal",
  tags: ["vegetarian", "vegan", "dinner", "wraps", "tex-mex", "comfort", "handheld", "fun"],
  isVegetarian: true,
  // Vegan Crunchwrap Supreme
suggestedSides: [
  "Chips and salsa",
  "Guacamole",
  "Cilantro lime rice",
],
  notes: "A plant-based take on a fast-food favorite with a crispy exterior and layered textures. Pressing seam-side down first helps seal the wrap.",
  translations: {
    es: {
      name: "Crunchwrap Supreme vegano",
      notes:
        "Una versión a base de plantas de un favorito estilo comida rápida, con exterior crujiente y capas de textura. Presionarlo primero con la unión hacia abajo ayuda a sellar el wrap.",
      tags: [
        "vegetariano",
        "vegano",
        "cena",
        "wraps",
        "tex-mex",
        "comida reconfortante",
        "para comer con la mano",
        "divertido",
      ],
      suggestedSides: [
        "Totopos con salsa",
        "Guacamole",
        "Arroz con cilantro y lima",
      ],
      ingredients: `Relleno:
1 Tbsp de aceite de oliva
1/2 cebolla, picada en cubitos
1 lata (15 oz) de frijoles negros, escurridos y enjuagados
1 tsp de chile en polvo
1/2 tsp de comino
1/2 tsp de paprika
1/2 tsp de sal
1/4 tsp de pimienta negra

Salsa cremosa:
1/2 cup de crema agria vegana o yogur sin lácteos
1 Tbsp de jugo de lima
1/2 tsp de ajo en polvo
1/4 tsp de sal

Armado:
4 tortillas de harina grandes
4 tostadas pequeñas o chips de tortilla
1 cup de lechuga rallada
1/2 cup de tomates, picados en cubitos
1/2 cup de queso vegano rallado`,
      instructions: `Calienta 1 Tbsp de aceite de oliva en un sartén a fuego medio.

Agrega 1/2 cebolla picada y cocina de 4 a 5 minutos, hasta que se ablande.

Agrega 1 lata de frijoles negros, 1 tsp de chile en polvo, 1/2 tsp de comino, 1/2 tsp de paprika, 1/2 tsp de sal y 1/4 tsp de pimienta negra. Cocina de 5 a 7 minutos, machacando ligeramente algunos frijoles hasta que la mezcla quede espesa y un poco cremosa.

En un tazón pequeño, mezcla 1/2 cup de crema agria vegana, 1 Tbsp de jugo de lima, 1/2 tsp de ajo en polvo y 1/4 tsp de sal hasta que quede suave.

Calienta 4 tortillas grandes hasta que estén suaves y flexibles.

En el centro de cada tortilla, extiende una capa del relleno de frijoles.

Cubre con una tostada, luego agrega una Tbsp de salsa, 1/4 cup de lechuga, tomates y queso vegano.

Dobla los bordes de la tortilla hacia arriba y sobre el centro, trabajando alrededor para formar un wrap sellado.

Calienta un sartén limpio a fuego medio y coloca el crunchwrap con la unión hacia abajo.

Cocina de 3 a 4 minutos, hasta que esté dorado y sellado, luego voltea y cocina otros 2 a 3 minutos, hasta que esté crujiente.

Sirve caliente.`,
    },
  },
},

{
  id: "cauliflower-gnocchi-mushroom-alfredo",
  slug: "cauliflower-gnocchi-mushroom-alfredo",
  name: "Cauliflower Gnocchi with Mushroom Alfredo",
  ingredients: `Gnocchi:
1 (12 oz) package cauliflower gnocchi
1 Tbsp olive oil

Mushrooms:
1 Tbsp olive oil
1 Tbsp butter
12 oz mushrooms, sliced
1/2 tsp salt
1/4 tsp black pepper

Alfredo Sauce:
2 cloves garlic, minced
1 cup heavy cream (or half-and-half for lighter)
3/4 cup parmesan cheese, grated
1/2 tsp garlic powder
1/4 tsp salt
1/4 tsp black pepper
1/4 cup reserved pasta water (optional, for thinning)

Finish:
1 Tbsp butter
2 Tbsp fresh parsley, chopped (optional)`,
  instructions: `Heat 1 Tbsp olive oil in a large skillet over medium-high heat.

Add 1 (12 oz) cauliflower gnocchi in a single layer and cook 4 to 5 minutes without stirring until golden and crisp. Flip and cook another 3 to 4 minutes. Remove and set aside.

In the same pan, heat 1 Tbsp olive oil and 1 Tbsp butter over medium-high heat.

Add 12 oz mushrooms and cook 6 to 8 minutes until deeply browned and slightly crispy on the edges.

Season with 1/2 tsp salt and 1/4 tsp black pepper.

Add 2 cloves garlic and cook 30 seconds until fragrant.

Reduce heat to medium and pour in 1 cup heavy cream. Simmer for 2 to 3 minutes.

Stir in 3/4 cup parmesan cheese, 1/2 tsp garlic powder, 1/4 tsp salt, and 1/4 tsp black pepper. Stir until smooth and creamy.

Add the cooked gnocchi back to the pan and toss to coat. Add a splash of pasta water if needed to loosen the sauce.

Finish with 1 Tbsp butter for extra richness and gloss.

Garnish with parsley if using and serve immediately.`,
  photoUrl: "/images/cauliflower-gnocchi-mushroom-alfredo.jpg",
  effort: "normal",
  tags: ["vegetarian", "dinner", "pasta", "comfort", "creamy", "skillet", "modern"],
  isVegetarian: true,
  // Cauliflower Gnocchi with Mushroom Alfredo
suggestedSides: [
  "Garlic bread",
  "Caesar salad",
  "Roasted broccoli",
],
  notes: "Crisping the gnocchi first gives it a better texture than boiling. Let the mushrooms brown properly to build deep flavor before adding the sauce.",
  translations: {
    es: {
      name: "Gnocchi de coliflor con Alfredo de champiñones",
      notes:
        "Dorar primero los gnocchi les da mejor textura que hervirlos. Deja que los champiñones se doren bien para crear sabor profundo antes de agregar la salsa.",
      tags: [
        "vegetariano",
        "cena",
        "pasta",
        "comida reconfortante",
        "cremoso",
        "sartén",
        "moderno",
      ],
      suggestedSides: [
        "Pan de ajo",
        "Ensalada César",
        "Brócoli asado",
      ],
      ingredients: `Gnocchi:
1 paquete (12 oz) de gnocchi de coliflor
1 Tbsp de aceite de oliva

Champiñones:
1 Tbsp de aceite de oliva
1 Tbsp de mantequilla
12 oz de champiñones, rebanados
1/2 tsp de sal
1/4 tsp de pimienta negra

Salsa Alfredo:
2 dientes de ajo, picados
1 cup de crema espesa o half-and-half para más ligero
3/4 cup de queso parmesano, rallado
1/2 tsp de ajo en polvo
1/4 tsp de sal
1/4 tsp de pimienta negra
1/4 cup de agua reservada de la pasta, opcional para aligerar

Para terminar:
1 Tbsp de mantequilla
2 Tbsp de perejil fresco, picado, opcional`,
      instructions: `Calienta 1 Tbsp de aceite de oliva en un sartén grande a fuego medio-alto.

Agrega 1 paquete (12 oz) de gnocchi de coliflor en una sola capa y cocina de 4 a 5 minutos sin revolver, hasta que estén dorados y crujientes. Voltea y cocina otros 3 a 4 minutos. Retira y reserva.

En el mismo sartén, calienta 1 Tbsp de aceite de oliva y 1 Tbsp de mantequilla a fuego medio-alto.

Agrega 12 oz de champiñones y cocina de 6 a 8 minutos, hasta que estén bien dorados y ligeramente crujientes en los bordes.

Sazona con 1/2 tsp de sal y 1/4 tsp de pimienta negra.

Agrega 2 dientes de ajo y cocina 30 segundos, hasta que suelte aroma.

Reduce el fuego a medio y vierte 1 cup de crema espesa. Cocina a fuego bajo de 2 a 3 minutos.

Incorpora 3/4 cup de queso parmesano, 1/2 tsp de ajo en polvo, 1/4 tsp de sal y 1/4 tsp de pimienta negra. Revuelve hasta que quede suave y cremoso.

Regresa los gnocchi cocidos al sartén y mezcla para cubrirlos. Agrega un chorrito de agua de pasta si necesitas aflojar la salsa.

Termina con 1 Tbsp de mantequilla para más riqueza y brillo.

Decora con perejil si lo usas y sirve de inmediato.`,
    },
  },
},

{
  id: "avocado-toast",
  slug: "avocado-toast",
  name: "Avocado Toast",
  ingredients: `Base:
2 slices bread (sourdough or whole grain recommended)
1 Tbsp olive oil (optional, for toasting)

Avocado:
1 ripe avocado
1 Tbsp lemon juice
1/4 tsp salt
1/4 tsp black pepper

Optional Toppings:
2 eggs (fried or poached)
1/4 tsp red pepper flakes
1 Tbsp feta cheese, crumbled
1 Tbsp cherry tomatoes, halved
1 tsp everything bagel seasoning`,
  instructions: `Toast 2 slices of bread until golden and crisp. For extra flavor, brush lightly with 1 Tbsp olive oil before toasting in a skillet over medium heat.

In a bowl, mash 1 ripe avocado with 1 Tbsp lemon juice, 1/4 tsp salt, and 1/4 tsp black pepper until smooth but slightly chunky.

Spread the avocado mixture evenly over the toasted bread.

Add desired toppings such as eggs, feta, tomatoes, red pepper flakes, or everything bagel seasoning.

Serve immediately.`,
  photoUrl: "/images/avocado-toast.jpg",
  effort: "quick",
  tags: ["vegetarian", "breakfast", "lunch", "quick", "healthy", "toast", "simple"],
  isVegetarian: true,
  // Avocado Toast
suggestedSides: [
  "Fresh fruit",
  "Yogurt",
  "Hash browns",
],
  notes: "Use ripe avocados for the best texture and flavor. A squeeze of lemon helps brighten the taste and prevent browning.",
  translations: {
    es: {
      name: "Tostada de aguacate",
      notes:
        "Usa aguacates maduros para lograr la mejor textura y sabor. Un chorrito de limón ayuda a realzar el sabor y evitar que se oxide.",
      tags: [
        "vegetariano",
        "desayuno",
        "almuerzo",
        "rápido",
        "saludable",
        "tostada",
        "simple",
      ],
      suggestedSides: [
        "Fruta fresca",
        "Yogur",
        "Papas hash brown",
      ],
      ingredients: `Base:
2 rebanadas de pan, se recomienda masa madre o integral
1 Tbsp de aceite de oliva, opcional para tostar

Aguacate:
1 aguacate maduro
1 Tbsp de jugo de limón
1/4 tsp de sal
1/4 tsp de pimienta negra

Toppings opcionales:
2 huevos, fritos o pochados
1/4 tsp de hojuelas de chile rojo
1 Tbsp de queso feta, desmoronado
1 Tbsp de tomates cherry, cortados por la mitad
1 tsp de sazonador everything bagel`,
      instructions: `Tuesta 2 rebanadas de pan hasta que estén doradas y crujientes. Para más sabor, barniza ligeramente con 1 Tbsp de aceite de oliva antes de tostar en un sartén a fuego medio.

En un tazón, machaca 1 aguacate maduro con 1 Tbsp de jugo de limón, 1/4 tsp de sal y 1/4 tsp de pimienta negra hasta que quede suave pero con un poco de textura.

Extiende la mezcla de aguacate de manera uniforme sobre el pan tostado.

Agrega los toppings que quieras, como huevos, feta, tomates, hojuelas de chile rojo o sazonador everything bagel.

Sirve de inmediato.`,
    },
  },
},

{
  id: "black-bean-sweet-potato-tacos",
  slug: "black-bean-sweet-potato-tacos",
  name: "Black Bean and Sweet Potato Tacos",
  ingredients: `2 cups sweet potatoes, diced
1 Tbsp olive oil
1/2 tsp salt
1/4 tsp pepper
1 tsp chili powder
1/2 tsp cumin
1 (15 oz) can black beans, drained
8 tortillas
1/2 cup avocado, sliced
1/4 cup cilantro, chopped`,
  instructions: `Preheat oven to 425°F.

Toss 2 cups diced sweet potatoes with 1 Tbsp olive oil, 1/2 tsp salt, 1/4 tsp pepper, 1 tsp chili powder, and 1/2 tsp cumin.

Roast for 20 to 25 minutes until tender and slightly caramelized.

Warm 8 tortillas.

Fill tortillas with roasted sweet potatoes and black beans.

Top with avocado and cilantro. Serve warm.`,
  photoUrl: "/images/black-bean-sweet-potato-tacos.jpg",
  effort: "normal",
  tags: ["vegetarian", "dinner", "tacos", "tex-mex", "healthy"],
  isVegetarian: true,
  // Black Bean and Sweet Potato Tacos
suggestedSides: [
  "Cilantro lime rice",
  "Chips and salsa",
  "Mexican street corn",
],
  notes: "Sweet, smoky, and filling tacos perfect for a meatless night.",
  translations: {
    es: {
      name: "Tacos de frijol negro y camote",
      notes:
        "Tacos dulces, ahumados y llenadores, perfectos para una noche sin carne.",
      tags: [
        "vegetariano",
        "cena",
        "tacos",
        "tex-mex",
        "saludable",
      ],
      suggestedSides: [
        "Arroz con cilantro y lima",
        "Totopos con salsa",
        "Elote estilo mexicano",
      ],
      ingredients: `2 cups de camotes, cortados en cubitos
1 Tbsp de aceite de oliva
1/2 tsp de sal
1/4 tsp de pimienta
1 tsp de chile en polvo
1/2 tsp de comino
1 lata (15 oz) de frijoles negros, escurridos
8 tortillas
1/2 cup de aguacate, rebanado
1/4 cup de cilantro, picado`,
      instructions: `Precalienta el horno a 425°F.

Mezcla 2 cups de camotes en cubitos con 1 Tbsp de aceite de oliva, 1/2 tsp de sal, 1/4 tsp de pimienta, 1 tsp de chile en polvo y 1/2 tsp de comino.

Asa de 20 a 25 minutos, hasta que estén tiernos y ligeramente caramelizados.

Calienta 8 tortillas.

Rellena las tortillas con camotes asados y frijoles negros.

Cubre con aguacate y cilantro. Sirve caliente.`,
    },
  },
},

{
  id: "chickpea-salad-sandwich",
  slug: "chickpea-salad-sandwich",
  name: "Chickpea Salad Sandwich",
  ingredients: `1 (15 oz) can chickpeas, drained
1/3 cup mayonnaise
1 Tbsp Dijon mustard
1 Tbsp lemon juice
1/4 cup celery, diced
2 Tbsp red onion, diced
4 slices bread`,
  instructions: `In a bowl, mash 1 can chickpeas until slightly chunky.

Add 1/3 cup mayonnaise, 1 Tbsp Dijon mustard, and 1 Tbsp lemon juice. Stir to combine.

Mix in 1/4 cup celery and 2 Tbsp red onion.

Spread onto 4 slices of bread and assemble sandwiches. Serve immediately.`,
  photoUrl: "/images/chickpea-salad-sandwich.jpg",
  effort: "quick",
  tags: ["vegetarian", "lunch", "sandwich", "quick", "meal-prep"],
  isVegetarian: true,
  // Chickpea Salad Sandwich
suggestedSides: [
  "Potato chips",
  "Fruit salad",
  "Pickle spears",
],
  notes: "A simple, protein-packed vegetarian alternative to chicken or tuna salad.",
  translations: {
    es: {
      name: "Sándwich de ensalada de garbanzos",
      notes:
        "Una alternativa vegetariana sencilla y llena de proteína a la ensalada de pollo o atún.",
      tags: [
        "vegetariano",
        "almuerzo",
        "sándwich",
        "rápido",
        "meal prep",
      ],
      suggestedSides: [
        "Papas fritas de bolsa",
        "Ensalada de frutas",
        "Pepinillos en tiras",
      ],
      ingredients: `1 lata (15 oz) de garbanzos, escurridos
1/3 cup de mayonesa
1 Tbsp de mostaza Dijon
1 Tbsp de jugo de limón
1/4 cup de apio, picado en cubitos
2 Tbsp de cebolla roja, picada en cubitos
4 rebanadas de pan`,
      instructions: `En un tazón, machaca 1 lata de garbanzos hasta que queden ligeramente con textura.

Agrega 1/3 cup de mayonesa, 1 Tbsp de mostaza Dijon y 1 Tbsp de jugo de limón. Mezcla para combinar.

Incorpora 1/4 cup de apio y 2 Tbsp de cebolla roja.

Extiende sobre 4 rebanadas de pan y arma los sándwiches. Sirve de inmediato.`,
    },
  },
},

{
  id: "mediterranean-chickpea-bowl",
  slug: "mediterranean-chickpea-bowl",
  name: "Mediterranean Chickpea Bowl",
  ingredients: `2 cups cooked rice or quinoa
1 (15 oz) can chickpeas, drained
1 cup cucumber, diced
1 cup cherry tomatoes, halved
1/2 cup feta cheese
2 Tbsp olive oil
1 Tbsp lemon juice
1/2 tsp salt`,
  instructions: `In a bowl, combine 2 cups cooked rice or quinoa with 1 can chickpeas.

Add 1 cup cucumber, 1 cup tomatoes, and 1/2 cup feta.

Drizzle with 2 Tbsp olive oil and 1 Tbsp lemon juice.

Season with 1/2 tsp salt and toss. Serve.`,
  photoUrl: "/images/mediterranean-chickpea-bowl.jpg",
  effort: "quick",
  tags: ["vegetarian", "dinner", "bowl", "healthy", "meal-prep"],
  isVegetarian: true,
  // Mediterranean Chickpea Bowl
suggestedSides: [
  "Pita bread",
  "Cucumber salad",
  "Hummus",
],
  notes: "Fresh, filling, and perfect for quick healthy meals.",
  translations: {
    es: {
      name: "Bowl mediterráneo de garbanzos",
      notes:
        "Fresco, llenador y perfecto para comidas saludables rápidas.",
      tags: [
        "vegetariano",
        "cena",
        "bowl",
        "saludable",
        "meal prep",
      ],
      suggestedSides: [
        "Pan pita",
        "Ensalada de pepino",
        "Hummus",
      ],
      ingredients: `2 cups de arroz o quinoa cocidos
1 lata (15 oz) de garbanzos, escurridos
1 cup de pepino, picado en cubitos
1 cup de tomates cherry, cortados por la mitad
1/2 cup de queso feta
2 Tbsp de aceite de oliva
1 Tbsp de jugo de limón
1/2 tsp de sal`,
      instructions: `En un tazón, combina 2 cups de arroz o quinoa cocidos con 1 lata de garbanzos.

Agrega 1 cup de pepino, 1 cup de tomates y 1/2 cup de feta.

Rocía con 2 Tbsp de aceite de oliva y 1 Tbsp de jugo de limón.

Sazona con 1/2 tsp de sal, mezcla y sirve.`,
    },
  },
},

{
  id: "cheese-enchiladas",
  slug: "cheese-enchiladas",
  name: "Cheese Enchiladas",
  ingredients: `8 tortillas
2 cups enchilada sauce
2 cups cheddar cheese, shredded`,
  instructions: `Preheat oven to 375°F.

Spread 1/2 cup enchilada sauce in a baking dish.

Fill each tortilla with cheese, roll, and place seam-side down.

Pour remaining sauce over the top and sprinkle with remaining cheese.

Bake for 20 minutes until bubbly. Serve warm.`,
  photoUrl: "/images/cheese-enchiladas.jpg",
  effort: "normal",
  tags: ["vegetarian", "dinner", "comfort", "mexican", "bake"],
  isVegetarian: true,
  suggestedSides: [
  "Cilantro lime rice",
  "Chips and salsa",
  "Guacamole",
],
  notes: "Simple, cheesy comfort food perfect for busy nights.",
  translations: {
    es: {
      name: "Enchiladas de queso",
      notes:
        "Comida reconfortante simple y llena de queso, perfecta para noches ocupadas.",
      tags: [
        "vegetariano",
        "cena",
        "comida reconfortante",
        "mexicano",
        "horneado",
      ],
      suggestedSides: [
        "Arroz con cilantro y lima",
        "Totopos con salsa",
        "Guacamole",
      ],
      ingredients: `8 tortillas
2 cups de salsa para enchiladas
2 cups de queso cheddar rallado`,
      instructions: `Precalienta el horno a 375°F.

Extiende 1/2 cup de salsa para enchiladas en un molde para hornear.

Rellena cada tortilla con queso, enrolla y coloca con la unión hacia abajo.

Vierte el resto de la salsa encima y espolvorea con el queso restante.

Hornea durante 20 minutos, hasta que esté burbujeante. Sirve caliente.`,
    },
  },
},

{
  id: "quick-grilled-corn",
  slug: "quick-grilled-corn",
  name: "Grilled Corn on the Cob",
  effort: "quick",
  photoUrl: "/images/quick-grilled-corn.jpg",
  tags: ["side", "grilling", "summer", "vegetarian", "bbq", "easy"],
  isVegetarian: true,
  notes: "Sweet, juicy grilled corn with a light char and buttery finish. Brushing with oil before grilling helps achieve even color and prevents sticking.",
  ingredients: `4 ears corn, husked
2 Tbsp butter, melted
1 Tbsp olive oil
1/2 tsp salt (plus more to taste)
1/4 tsp pepper (optional)
1/2 tsp garlic powder (optional)
1 Tbsp fresh parsley or cilantro, chopped (optional)
lime wedges (optional)`,
  instructions: `Preheat grill to medium heat, about 375°F to 400°F.

Brush 4 husked ears of corn lightly with 1 Tbsp olive oil to help prevent sticking and promote even charring.

Place the corn directly on the grill grates.

Grill for 8 to 10 minutes, turning every 2 to 3 minutes, until kernels are tender and lightly charred on all sides.

Remove from the grill and brush generously with 2 Tbsp melted butter.

Sprinkle with 1/2 tsp salt, 1/4 tsp pepper, and 1/2 tsp garlic powder if using.

Garnish with 1 Tbsp fresh chopped parsley or cilantro and serve with lime wedges if desired.`,
  translations: {
    es: {
      name: "Elote a la parrilla",
      notes:
        "Elote dulce y jugoso a la parrilla, con un ligero dorado y acabado con mantequilla. Barnizar con aceite antes de asar ayuda a lograr color uniforme y evita que se pegue.",
      tags: [
        "acompañamiento",
        "parrilla",
        "verano",
        "vegetariano",
        "bbq",
        "fácil",
      ],
      ingredients: `4 elotes, sin hojas
2 Tbsp de mantequilla, derretida
1 Tbsp de aceite de oliva
1/2 tsp de sal, más al gusto
1/4 tsp de pimienta, opcional
1/2 tsp de ajo en polvo, opcional
1 Tbsp de perejil fresco o cilantro, picado, opcional
gajos de lima, opcional`,
      instructions: `Precalienta la parrilla a fuego medio, aproximadamente 375°F a 400°F.

Barniza ligeramente 4 elotes sin hojas con 1 Tbsp de aceite de oliva para evitar que se peguen y ayudar a que se doren de manera uniforme.

Coloca los elotes directamente sobre las rejillas de la parrilla.

Asa de 8 a 10 minutos, girando cada 2 a 3 minutos, hasta que los granos estén tiernos y ligeramente dorados por todos lados.

Retira de la parrilla y barniza generosamente con 2 Tbsp de mantequilla derretida.

Espolvorea con 1/2 tsp de sal, 1/4 tsp de pimienta y 1/2 tsp de ajo en polvo si lo usas.

Decora con 1 Tbsp de perejil fresco o cilantro picado, y sirve con gajos de lima si deseas.`,
    },
  },
},

{
  id: "quick-grilled-veggie-kabobs",
  slug: "quick-grilled-veggie-kabobs",
  name: "Grilled Veggie Kabobs",
  effort: "quick",
  photoUrl: "/images/quick-grilled-veggie-kabobs.jpg",
  tags: ["vegetarian", "grilling", "healthy", "side", "summer", "one-pan"],
  isVegetarian: true,
  notes: "Simple, colorful grilled vegetables with a light char. Cutting vegetables to similar sizes helps them cook evenly, and a quick finish with acid brightens the flavor.",
  ingredients: `1 zucchini, sliced into thick rounds
1 bell pepper (any color), chopped into chunks
1/2 red onion, cut into chunks
8 oz mushrooms (whole or halved)
2 Tbsp olive oil
1/2 tsp salt (plus more to taste)
1/4 tsp pepper
1/2 tsp garlic powder
1/2 tsp dried Italian seasoning (optional)
1 Tbsp balsamic vinegar or lemon juice (optional, for finishing)`,
  instructions: `Preheat grill to medium heat, about 375°F to 400°F.

If using wooden skewers, soak them in water for at least 20 minutes to prevent burning.

In a large bowl, toss 1 zucchini, 1 chopped bell pepper, 1/2 red onion, and 8 oz mushrooms with 2 Tbsp olive oil, 1/2 tsp salt, 1/4 tsp pepper, 1/2 tsp garlic powder, and 1/2 tsp dried Italian seasoning if using.

Thread the seasoned vegetables onto skewers, alternating pieces for even cooking and a colorful presentation.

Place kabobs on the grill and cook for 8 to 10 minutes, turning every few minutes, until vegetables are tender and lightly charred.

Remove from grill and drizzle with 1 Tbsp balsamic vinegar or lemon juice if using for a bright finish.

Serve warm.`,
  translations: {
    es: {
      name: "Brochetas de verduras a la parrilla",
      notes:
        "Verduras simples y coloridas a la parrilla con un ligero dorado. Cortarlas en tamaños similares ayuda a que se cocinen parejo, y terminar con un toque ácido realza el sabor.",
      tags: [
        "vegetariano",
        "cena",
        "parrilla",
        "saludable",
        "acompañamiento",
        "verano",
        "una tanda",
      ],
      ingredients: `1 zucchini, rebanado en rodajas gruesas
1 pimiento, de cualquier color, cortado en trozos
1/2 cebolla roja, cortada en trozos
8 oz de champiñones, enteros o partidos por la mitad
2 Tbsp de aceite de oliva
1/2 tsp de sal, más al gusto
1/4 tsp de pimienta
1/2 tsp de ajo en polvo
1/2 tsp de sazonador italiano seco, opcional
1 Tbsp de vinagre balsámico o jugo de limón, opcional para terminar`,
      instructions: `Precalienta la parrilla a fuego medio, aproximadamente 375°F a 400°F.

Si usas brochetas de madera, remójalas en agua por al menos 20 minutos para evitar que se quemen.

En un tazón grande, mezcla 1 zucchini, 1 pimiento picado, 1/2 cebolla roja y 8 oz de champiñones con 2 Tbsp de aceite de oliva, 1/2 tsp de sal, 1/4 tsp de pimienta, 1/2 tsp de ajo en polvo y 1/2 tsp de sazonador italiano seco si lo usas.

Ensarta las verduras sazonadas en brochetas, alternando las piezas para una cocción uniforme y una presentación colorida.

Coloca las brochetas en la parrilla y cocina de 8 a 10 minutos, girando cada pocos minutos, hasta que las verduras estén tiernas y ligeramente doradas.

Retira de la parrilla y rocía con 1 Tbsp de vinagre balsámico o jugo de limón si lo usas para un acabado fresco.

Sirve caliente.`,
    },
  },
},

];

// Optional non-dinner vegetarian meals
export const VEGETARIAN_EXTRAS: Meal[] = [
  
  {
  id: "quick-avocado-white-bean-wraps",
  slug: "quick-avocado-white-bean-wraps",
  name: "Avocado and White Bean Wraps",
  effort: "quick",
  photoUrl: "/images/quick-avocado-white-bean-wraps.jpg",
  tags: ["vegetarian", "vegan", "lunch", "quick", "no-cook", "healthy", "meal-prep"],
  isVegetarian: true,
  suggestedSides: [
  "Fruit salad",
  "Potato chips",
  "Cucumber salad",
],
  notes: "A quick, fresh wrap with creamy avocado and protein-packed beans. Lightly mashing the beans helps everything hold together while keeping a good texture.",
  ingredients: `1 cup cannellini beans, drained and rinsed
1 ripe avocado
1 Tbsp lime juice
2 Tbsp fresh cilantro, chopped
1/4 tsp salt (plus more to taste)
1/4 tsp pepper
1/4 tsp garlic powder (optional)
2 large whole wheat tortillas
1/4 cup shredded carrots
1/2 cup fresh spinach leaves
1 Tbsp olive oil (optional, for richness)`,
  instructions: `In a medium bowl, mash 1 ripe avocado with 1 Tbsp lime juice, 1/4 tsp salt, 1/4 tsp pepper, and 1/4 tsp garlic powder if using until mostly smooth.

Add 1 cup drained and rinsed cannellini beans and lightly mash about half of them into the avocado mixture, leaving some whole for texture.

Stir in 2 Tbsp chopped fresh cilantro and 1 Tbsp olive oil if using. Taste and adjust seasoning as needed.

Lay 2 large whole wheat tortillas flat and spread the bean and avocado mixture evenly down the center of each.

Top the mixture with 1/4 cup shredded carrots and 1/2 cup fresh spinach leaves.

Roll the tortillas tightly, folding in the sides as you go to secure the filling.

Slice in half and serve immediately.`,
  translations: {
    es: {
      name: "Wraps de aguacate y frijoles blancos",
      notes:
        "Un wrap rápido y fresco con aguacate cremoso y frijoles llenos de proteína. Machacar ligeramente los frijoles ayuda a que todo se mantenga unido sin perder buena textura.",
      tags: [
        "vegetariano",
        "vegano",
        "almuerzo",
        "rápido",
        "sin cocinar",
        "saludable",
        "meal prep",
      ],
      suggestedSides: [
        "Ensalada de frutas",
        "Papas fritas",
        "Ensalada de pepino",
      ],
      ingredients: `1 cup de frijoles cannellini, escurridos y enjuagados
1 aguacate maduro
1 Tbsp de jugo de lima
2 Tbsp de cilantro fresco, picado
1/4 tsp de sal, más al gusto
1/4 tsp de pimienta
1/4 tsp de ajo en polvo, opcional
2 tortillas grandes de trigo integral
1/4 cup de zanahorias ralladas
1/2 cup de hojas de espinaca fresca
1 Tbsp de aceite de oliva, opcional para más riqueza`,
      instructions: `En un tazón mediano, machaca 1 aguacate maduro con 1 Tbsp de jugo de lima, 1/4 tsp de sal, 1/4 tsp de pimienta y 1/4 tsp de ajo en polvo si lo usas, hasta que quede casi suave.

Agrega 1 cup de frijoles cannellini escurridos y enjuagados, y machaca ligeramente aproximadamente la mitad dentro de la mezcla de aguacate, dejando algunos enteros para textura.

Incorpora 2 Tbsp de cilantro fresco picado y 1 Tbsp de aceite de oliva si lo usas. Prueba y ajusta los condimentos según sea necesario.

Coloca 2 tortillas grandes de trigo integral extendidas y reparte la mezcla de frijoles y aguacate de manera uniforme por el centro de cada una.

Cubre la mezcla con 1/4 cup de zanahorias ralladas y 1/2 cup de hojas de espinaca fresca.

Enrolla las tortillas firmemente, doblando los lados mientras enrollas para asegurar el relleno.

Corta por la mitad y sirve de inmediato.`,
    },
  },
},

{
  id: "normal-spicy-mushroom-potato-hash",
  slug: "normal-spicy-mushroom-potato-hash",
  name: "Spicy Skillet Mushroom and Potato Hash",
  effort: "normal",
  photoUrl: "/images/normal-spicy-mushroom-potato-hash.jpg",
  tags: ["vegetarian", "breakfast", "brunch", "skillet", "spicy", "comfort", "one-pan", "leftovers-friendly"],
  isVegetarian: true,
  suggestedSides: [
  "Toast",
  "Fresh fruit",
  "Avocado slices",
],
  notes: "Crispy, hearty skillet hash with bold flavor and tender vegetables. Letting the potatoes cook undisturbed at first helps build a golden crust for the best texture.",
  ingredients: `2 large russet potatoes, diced (small cubes)
8 oz baby bella mushrooms, sliced
1 jalapeño, minced
1/2 red onion, diced
2 Tbsp olive oil
1 tsp smoked paprika
1/2 tsp garlic powder
1/2 tsp salt (plus more to taste)
1/4 tsp pepper
2 eggs
1 Tbsp fresh parsley or green onions, chopped (optional)`,
  instructions: `Bring a pot of salted water to a boil. Add 2 large diced russet potatoes and parboil for 5 minutes, then drain and let them dry slightly.

Heat 2 Tbsp olive oil in a large, heavy skillet over medium-high heat.

Add the potatoes in a single layer and cook for 8 to 10 minutes, stirring occasionally, until golden and crispy on the outside.

Add 8 oz sliced baby bella mushrooms, 1/2 diced red onion, and 1 minced jalapeño. Let cook undisturbed for 2 to 3 minutes, then stir and continue cooking for another 4 to 5 minutes until vegetables are tender and lightly browned.

Sprinkle 1 tsp smoked paprika, 1/2 tsp garlic powder, 1/2 tsp salt, and 1/4 tsp pepper over the hash and toss to combine.

Reduce heat to medium. Create two small wells in the hash and crack 2 eggs, one into each well.

Cover the skillet and cook until the eggs are set to your preference, about 3 to 5 minutes.

Garnish with 1 Tbsp fresh chopped parsley or green onions if desired and serve hot.`,
  translations: {
    es: {
      name: "Hash picante de champiñones y papas en sartén",
      notes:
        "Un hash crujiente y sustancioso en sartén, con sabor intenso y verduras tiernas. Dejar que las papas se cocinen sin moverlas al principio ayuda a formar una costra dorada para la mejor textura.",
      tags: [
        "vegetariano",
        "desayuno",
        "brunch",
        "sartén",
        "picante",
        "comida reconfortante",
        "una sartén",
        "bueno para sobras",
      ],
      suggestedSides: [
        "Pan tostado",
        "Fruta fresca",
        "Rebanadas de aguacate",
      ],
      ingredients: `2 papas russet grandes, cortadas en cubitos pequeños
8 oz de champiñones baby bella, rebanados
1 jalapeño, picado finamente
1/2 cebolla roja, picada en cubitos
2 Tbsp de aceite de oliva
1 tsp de paprika ahumada
1/2 tsp de ajo en polvo
1/2 tsp de sal, más al gusto
1/4 tsp de pimienta
2 huevos
1 Tbsp de perejil fresco o cebollines, picados, opcional`,
      instructions: `Hierve una olla con agua salada. Agrega 2 papas russet grandes cortadas en cubitos y hiérvelas parcialmente durante 5 minutos, luego escurre y deja que se sequen un poco.

Calienta 2 Tbsp de aceite de oliva en un sartén grande y pesado a fuego medio-alto.

Agrega las papas en una sola capa y cocina de 8 a 10 minutos, revolviendo de vez en cuando, hasta que estén doradas y crujientes por fuera.

Agrega 8 oz de champiñones baby bella rebanados, 1/2 cebolla roja picada y 1 jalapeño picado. Deja cocinar sin mover de 2 a 3 minutos, luego revuelve y continúa cocinando otros 4 a 5 minutos, hasta que las verduras estén tiernas y ligeramente doradas.

Espolvorea 1 tsp de paprika ahumada, 1/2 tsp de ajo en polvo, 1/2 tsp de sal y 1/4 tsp de pimienta sobre el hash, y mezcla para combinar.

Reduce el fuego a medio. Haz dos pequeños huecos en el hash y rompe 2 huevos, uno en cada hueco.

Cubre el sartén y cocina hasta que los huevos estén al punto que prefieras, aproximadamente de 3 a 5 minutos.

Decora con 1 Tbsp de perejil fresco picado o cebollines si deseas, y sirve caliente.`,
    },
  },
},

];

export const NEW_SALAD_RECIPES: Meal[] = [
  // =====================================================
  // QUICK
  // =====================================================
  {
  id: "quick-classic-garden-salad",
  slug: "quick-classic-garden-salad",
  name: "Classic Garden Salad",
  photoUrl: "/images/quick-classic-garden-salad.jpg",
  effort: "quick",
  tags: ["salad", "quick", "vegetarian", "side", "fresh", "healthy"],
  isVegetarian: true,
  ingredients: `1 head romaine lettuce, chopped
1 cup cherry tomatoes, halved
1 cucumber, sliced
1/2 red onion, thinly sliced
1/2 cup shredded carrots
1/2 cup croutons
1/4 cup ranch or Italian dressing`,
  instructions: `Wash and chop 1 head of romaine lettuce.

In a large bowl, combine the chopped lettuce, 1 cup halved cherry tomatoes, 1 sliced cucumber, 1/2 thinly sliced red onion, and 1/2 cup shredded carrots.

Top the vegetable mixture with 1/2 cup croutons.

Drizzle with 1/4 cup ranch or Italian dressing just before serving and toss well to coat.`,
  notes: "A crisp everyday salad that works as a side or a light lunch.",
  translations: {
    es: {
      name: "Ensalada clásica de jardín",
      notes:
        "Una ensalada crujiente para todos los días que funciona como acompañamiento o almuerzo ligero.",
      tags: [
        "ensalada",
        "rápido",
        "vegetariano",
        "acompañamiento",
        "fresco",
        "saludable",
      ],
      ingredients: `1 cabeza de lechuga romana, picada
1 cup de tomates cherry, cortados por la mitad
1 pepino, rebanado
1/2 cebolla roja, rebanada finamente
1/2 cup de zanahorias ralladas
1/2 cup de crutones
1/4 cup de aderezo ranch o italiano`,
      instructions: `Lava y pica 1 cabeza de lechuga romana.

En un tazón grande, combina la lechuga picada, 1 cup de tomates cherry partidos por la mitad, 1 pepino rebanado, 1/2 cebolla roja rebanada finamente y 1/2 cup de zanahorias ralladas.

Cubre la mezcla de verduras con 1/2 cup de crutones.

Rocía con 1/4 cup de aderezo ranch o italiano justo antes de servir y mezcla bien para cubrir.`,
    },
  },
},

{
  id: "quick-greek-salad",
  slug: "quick-greek-salad",
  name: "Greek Salad",
  photoUrl: "/images/quick-greek-salad.jpg",
  effort: "quick",
  tags: ["salad", "quick", "vegetarian", "mediterranean", "fresh", "healthy"],
  isVegetarian: true,
  ingredients: `1 cucumber, chopped
1 pint cherry tomatoes, halved
1/2 red onion, sliced
1 green bell pepper, chopped
1/2 cup Kalamata olives
1/2 cup feta cheese, crumbled
2 Tbsp olive oil
1 Tbsp red wine vinegar
1 tsp dried oregano
salt, to taste
pepper, to taste`,
  instructions: `In a large bowl, combine 1 chopped cucumber, 1 pint halved cherry tomatoes, 1/2 sliced red onion, 1 chopped green bell pepper, 1/2 cup Kalamata olives, and 1/2 cup crumbled feta cheese.

In a small bowl, whisk together 2 Tbsp olive oil, 1 Tbsp red wine vinegar, 1 tsp dried oregano, and salt and pepper to taste.

Pour the dressing over the salad and toss gently to ensure everything is evenly coated.

Serve immediately or chill in the refrigerator until ready to serve.`,
  notes: "Bright, salty, and refreshing with a classic Mediterranean flavor.",
  translations: {
    es: {
      name: "Ensalada griega",
      notes:
        "Brillante, salada y refrescante, con un sabor mediterráneo clásico.",
      tags: [
        "ensalada",
        "rápido",
        "vegetariano",
        "mediterráneo",
        "fresco",
        "saludable",
      ],
      ingredients: `1 pepino, picado
1 pinta de tomates cherry, cortados por la mitad
1/2 cebolla roja, rebanada
1 pimiento verde, picado
1/2 cup de aceitunas Kalamata
1/2 cup de queso feta, desmoronado
2 Tbsp de aceite de oliva
1 Tbsp de vinagre de vino tinto
1 tsp de orégano seco
sal y pimienta al gusto`,
      instructions: `En un tazón grande, combina 1 pepino picado, 1 pinta de tomates cherry partidos por la mitad, 1/2 cebolla roja rebanada, 1 pimiento verde picado, 1/2 cup de aceitunas Kalamata y 1/2 cup de queso feta desmoronado.

En un tazón pequeño, bate 2 Tbsp de aceite de oliva, 1 Tbsp de vinagre de vino tinto, 1 tsp de orégano seco, y sal y pimienta al gusto.

Vierte el aderezo sobre la ensalada y mezcla suavemente para que todo quede cubierto de manera uniforme.

Sirve de inmediato o refrigera hasta que esté lista para servir.`,
    },
  },
},

{
  id: "quick-caprese-salad",
  slug: "quick-caprese-salad",
  name: "Caprese Salad",
  photoUrl: "/images/quick-caprese-salad.jpg",
  effort: "quick",
  tags: ["salad", "quick", "vegetarian", "italian", "fresh", "no-cook"],
  isVegetarian: true,
  ingredients: `3 large tomatoes, sliced
8 oz fresh mozzarella, sliced
1/4 cup fresh basil leaves
2 Tbsp olive oil
1 Tbsp balsamic glaze
salt, to taste
pepper, to taste`,
  instructions: `Arrange 3 large sliced tomatoes and 8 oz sliced fresh mozzarella on a platter, alternating the slices.

Tuck 1/4 cup fresh basil leaves between the tomato and mozzarella layers.

Drizzle the entire platter with 2 Tbsp olive oil and 1 Tbsp balsamic glaze.

Season lightly with salt and pepper to taste just before serving.`,
  notes: "Simple, fresh, and perfect for warm-weather meals.",
  translations: {
    es: {
      name: "Ensalada caprese",
      notes:
        "Simple, fresca y perfecta para comidas de clima cálido.",
      tags: [
        "ensalada",
        "rápido",
        "vegetariano",
        "italiana",
        "fresco",
        "sin cocinar",
      ],
      ingredients: `3 tomates grandes, rebanados
8 oz de mozzarella fresca, rebanada
1/4 cup de hojas de albahaca fresca
2 Tbsp de aceite de oliva
1 Tbsp de glaseado balsámico
sal y pimienta al gusto`,
      instructions: `Acomoda 3 tomates grandes rebanados y 8 oz de mozzarella fresca rebanada en un plato, alternando las rebanadas.

Coloca 1/4 cup de hojas de albahaca fresca entre las capas de tomate y mozzarella.

Rocía todo el plato con 2 Tbsp de aceite de oliva y 1 Tbsp de glaseado balsámico.

Sazona ligeramente con sal y pimienta al gusto justo antes de servir.`,
    },
  },
},

{
  id: "quick-southwest-chicken-salad",
  slug: "quick-southwest-chicken-salad",
  name: "Southwest Chicken Salad",
  photoUrl: "/images/quick-southwest-chicken-salad.jpg",
  effort: "quick",
  tags: ["salad", "quick", "chicken", "dinner", "protein", "tex-mex"],
  ingredients: `2 cups cooked chicken, chopped
1 head romaine lettuce, chopped
1 cup corn
1 cup black beans, drained and rinsed
1 cup cherry tomatoes, halved
1/2 cup cheddar cheese, shredded
1 avocado, diced
1/4 cup tortilla strips
1/3 cup southwest ranch dressing`,
  instructions: `In a large bowl, combine 1 head chopped romaine lettuce, 2 cups chopped cooked chicken, 1 cup corn, 1 cup drained and rinsed black beans, 1 cup halved cherry tomatoes, 1/2 cup shredded cheddar cheese, and 1 diced avocado.

Top the mixture with 1/4 cup tortilla strips for crunch.

Drizzle with 1/3 cup southwest ranch dressing and toss well just before serving to keep the lettuce and strips crisp.`,
  notes: "A hearty salad that feels like a full dinner, not just a side.",
  translations: {
    es: {
      name: "Ensalada southwest de pollo",
      notes:
        "Una ensalada sustanciosa que se siente como una cena completa, no solo un acompañamiento.",
      tags: [
        "ensalada",
        "rápido",
        "pollo",
        "cena",
        "proteína",
        "tex-mex",
      ],
      ingredients: `2 cups de pollo cocido, picado
1 cabeza de lechuga romana, picada
1 cup de maíz
1 cup de frijoles negros, escurridos y enjuagados
1 cup de tomates cherry, cortados por la mitad
1/2 cup de queso cheddar rallado
1 aguacate, picado en cubitos
1/4 cup de tiras de tortilla
1/3 cup de aderezo ranch southwest`,
      instructions: `En un tazón grande, combina 1 cabeza de lechuga romana picada, 2 cups de pollo cocido picado, 1 cup de maíz, 1 cup de frijoles negros escurridos y enjuagados, 1 cup de tomates cherry partidos por la mitad, 1/2 cup de queso cheddar rallado y 1 aguacate picado en cubitos.

Cubre la mezcla con 1/4 cup de tiras de tortilla para darle textura crujiente.

Rocía con 1/3 cup de aderezo ranch southwest y mezcla bien justo antes de servir para mantener la lechuga y las tiras crujientes.`,
    },
  },
},

{
  id: "quick-cucumber-tomato-salad",
  slug: "quick-cucumber-tomato-salad",
  name: "Cucumber Tomato Salad",
  photoUrl: "/images/quick-cucumber-tomato-salad.jpg",
  effort: "quick",
  tags: ["salad", "quick", "vegetarian", "side", "fresh", "summer"],
  isVegetarian: true,
  ingredients: `2 cucumbers, sliced
3 tomatoes, chopped
1/4 red onion, thinly sliced
2 Tbsp olive oil
1 Tbsp red wine vinegar
1 tsp sugar
salt, to taste
pepper, to taste`,
  instructions: `Add 2 sliced cucumbers, 3 chopped tomatoes, and 1/4 thinly sliced red onion to a large bowl.

In a small separate bowl, whisk together 2 Tbsp olive oil, 1 Tbsp red wine vinegar, 1 tsp sugar, and salt and pepper to taste until the sugar is mostly dissolved.

Pour the dressing over the vegetables and toss well to ensure everything is evenly coated.

For the best flavor, chill in the refrigerator for 15 minutes before serving to let the juices meld.`,
  notes: "Cool, crisp, and great with grilled dinners.",
  translations: {
    es: {
      name: "Ensalada de pepino y tomate",
      notes:
        "Fresca, crujiente y excelente con cenas a la parrilla.",
      tags: [
        "ensalada",
        "rápido",
        "vegetariano",
        "acompañamiento",
        "fresco",
        "verano",
      ],
      ingredients: `2 pepinos, rebanados
3 tomates, picados
1/4 cebolla roja, rebanada finamente
2 Tbsp de aceite de oliva
1 Tbsp de vinagre de vino tinto
1 tsp de azúcar
sal y pimienta al gusto`,
      instructions: `Agrega 2 pepinos rebanados, 3 tomates picados y 1/4 de cebolla roja rebanada finamente a un tazón grande.

En un tazón pequeño aparte, bate 2 Tbsp de aceite de oliva, 1 Tbsp de vinagre de vino tinto, 1 tsp de azúcar, y sal y pimienta al gusto hasta que el azúcar esté casi disuelta.

Vierte el aderezo sobre las verduras y mezcla bien para que todo quede cubierto de manera uniforme.

Para mejor sabor, refrigera durante 15 minutos antes de servir para que los jugos se integren.`,
    },
  },
},

  // =====================================================
  // NORMAL
  // =====================================================
  {
  id: "normal-grilled-chicken-caesar-salad",
  slug: "normal-grilled-chicken-caesar-salad",
  name: "Grilled Chicken Caesar Salad",
  photoUrl: "/images/normal-grilled-chicken-caesar-salad.jpg",
  effort: "normal",
  tags: ["salad", "normal", "chicken", "dinner", "protein", "classic"],
  ingredients: `2 chicken breasts
1 Tbsp olive oil
1 tsp garlic powder
1/2 tsp salt
1/4 tsp pepper
1 head romaine lettuce, chopped
1/2 cup Caesar dressing
1/3 cup Parmesan cheese
1 cup croutons`,
  instructions: `Season 2 chicken breasts with 1 Tbsp olive oil, 1 tsp garlic powder, 1/2 tsp salt, and 1/4 tsp pepper.

Cook the chicken in a skillet or grill pan over medium-high heat until fully cooked, reaching an internal temperature of 165°F, then slice into strips.

In a large bowl, add 1 head chopped romaine lettuce, 1/2 cup Caesar dressing, 1/3 cup Parmesan cheese, and 1 cup croutons. Toss well to coat the leaves evenly.

Top the salad with the warm sliced chicken and serve immediately.`,
  notes: "A restaurant-style classic that works perfectly as a dinner salad.",
  translations: {
    es: {
      name: "Ensalada César con pollo a la parrilla",
      notes:
        "Un clásico estilo restaurante que funciona perfectamente como ensalada para la cena.",
      tags: [
        "ensalada",
        "normal",
        "pollo",
        "cena",
        "proteína",
        "clásico",
      ],
      ingredients: `2 pechugas de pollo
1 Tbsp de aceite de oliva
1 tsp de ajo en polvo
1/2 tsp de sal
1/4 tsp de pimienta
1 cabeza de lechuga romana, picada
1/2 cup de aderezo César
1/3 cup de queso parmesano
1 cup de crutones`,
      instructions: `Sazona 2 pechugas de pollo con 1 Tbsp de aceite de oliva, 1 tsp de ajo en polvo, 1/2 tsp de sal y 1/4 tsp de pimienta.

Cocina el pollo en un sartén o sartén parrilla a fuego medio-alto hasta que esté completamente cocido y alcance una temperatura interna de 165°F, luego córtalo en tiras.

En un tazón grande, agrega 1 cabeza de lechuga romana picada, 1/2 cup de aderezo César, 1/3 cup de queso parmesano y 1 cup de crutones. Mezcla bien para cubrir las hojas de manera uniforme.

Cubre la ensalada con el pollo tibio en tiras y sirve de inmediato.`,
    },
  },
},

{
  id: "normal-cobb-salad",
  slug: "normal-cobb-salad",
  name: "Cobb Salad",
  photoUrl: "/images/normal-cobb-salad.jpg",
  effort: "normal",
  tags: ["salad", "normal", "chicken", "bacon", "dinner", "protein"],
  ingredients: `1 head romaine lettuce, chopped
2 cups cooked chicken, chopped
4 strips bacon, cooked and crumbled
2 hard-boiled eggs, chopped
1 avocado, diced
1 cup cherry tomatoes, halved
1/2 cup blue cheese crumbles
1/3 cup ranch dressing`,
  instructions: `Arrange 1 head chopped romaine lettuce in a large serving bowl or on a wide platter as the base.

Top the lettuce in neat, parallel rows with 2 cups chopped cooked chicken, 4 strips cooked and crumbled bacon, 2 chopped hard-boiled eggs, 1 diced avocado, 1 cup halved cherry tomatoes, and 1/2 cup blue cheese crumbles.

Drizzle 1/3 cup ranch dressing over the top just before serving, or serve the dressing on the side to keep the ingredients fresh.`,
  notes: "Loaded with protein and toppings, this one eats like a full meal.",
  translations: {
    es: {
      name: "Ensalada Cobb",
      notes:
        "Cargada de proteína y toppings, esta ensalada se siente como una comida completa.",
      tags: [
        "ensalada",
        "normal",
        "pollo",
        "tocino",
        "cena",
        "proteína",
      ],
      ingredients: `1 cabeza de lechuga romana, picada
2 cups de pollo cocido, picado
4 tiras de tocino, cocidas y desmoronadas
2 huevos duros, picados
1 aguacate, picado en cubitos
1 cup de tomates cherry, cortados por la mitad
1/2 cup de queso azul desmoronado
1/3 cup de aderezo ranch`,
      instructions: `Acomoda 1 cabeza de lechuga romana picada en un tazón grande para servir o sobre un plato amplio como base.

Cubre la lechuga en filas ordenadas y paralelas con 2 cups de pollo cocido picado, 4 tiras de tocino cocidas y desmoronadas, 2 huevos duros picados, 1 aguacate en cubitos, 1 cup de tomates cherry partidos por la mitad y 1/2 cup de queso azul desmoronado.

Rocía 1/3 cup de aderezo ranch por encima justo antes de servir, o sirve el aderezo aparte para mantener los ingredientes frescos.`,
    },
  },
},

{
  id: "normal-steakhouse-salad",
  slug: "normal-steakhouse-salad",
  name: "Steakhouse Salad",
  photoUrl: "/images/normal-steakhouse-salad.jpg",
  effort: "normal",
  tags: ["salad", "normal", "beef", "dinner", "protein", "hearty"],
  ingredients: `1 lb sirloin steak
1 Tbsp olive oil
1 tsp salt
1/2 tsp pepper
1 head romaine lettuce, chopped
1 cup cherry tomatoes, halved
1/2 red onion, sliced
1/2 cup crumbled blue cheese
1/4 cup French's fried onions
1/3 cup balsamic vinaigrette`,
  instructions: `Season 1 lb sirloin steak with 1 Tbsp olive oil, 1 tsp salt, and 1/2 tsp pepper.

Cook the steak in a skillet over medium-high heat until it reaches your desired doneness. Let the steak rest for at least 5 minutes, then slice it thinly against the grain.

In a large bowl, combine 1 head chopped romaine lettuce, 1 cup halved cherry tomatoes, 1/2 sliced red onion, 1/2 cup crumbled blue cheese, and 1/4 cup crispy fried onions.

Top the vegetable mixture with the sliced steak and drizzle with 1/3 cup balsamic vinaigrette just before serving.`,
  notes: "Bold steakhouse flavor in a lighter, salad-style dinner.",
  translations: {
    es: {
      name: "Ensalada estilo steakhouse",
      notes:
        "Sabor intenso de steakhouse en una cena más ligera estilo ensalada.",
      tags: [
        "ensalada",
        "normal",
        "carne de res",
        "cena",
        "proteína",
        "sustancioso",
      ],
      ingredients: `1 lb de bistec sirloin
1 Tbsp de aceite de oliva
1 tsp de sal
1/2 tsp de pimienta
1 cabeza de lechuga romana, picada
1 cup de tomates cherry, cortados por la mitad
1/2 cebolla roja, rebanada
1/2 cup de queso azul desmoronado
1/4 cup de cebollas fritas French's
1/3 cup de vinagreta balsámica`,
      instructions: `Sazona 1 lb de bistec sirloin con 1 Tbsp de aceite de oliva, 1 tsp de sal y 1/2 tsp de pimienta.

Cocina el bistec en un sartén a fuego medio-alto hasta que alcance el punto de cocción deseado. Deja reposar el bistec por al menos 5 minutos, luego rebánalo finamente contra la fibra.

En un tazón grande, combina 1 cabeza de lechuga romana picada, 1 cup de tomates cherry partidos por la mitad, 1/2 cebolla roja rebanada, 1/2 cup de queso azul desmoronado y 1/4 cup de cebollas fritas crujientes.

Cubre la mezcla de verduras con el bistec rebanado y rocía con 1/3 cup de vinagreta balsámica justo antes de servir.`,
    },
  },
},

{
  id: "normal-broccoli-bacon-salad",
  slug: "normal-broccoli-bacon-salad",
  name: "Broccoli Bacon Salad",
  photoUrl: "/images/normal-broccoli-bacon-salad.jpg",
  effort: "normal",
  tags: ["salad", "normal", "side", "broccoli", "bacon", "potluck"],
  ingredients: `4 cups broccoli florets
6 strips bacon, cooked and crumbled
1/2 red onion, diced
1/2 cup cheddar cheese, shredded
1/4 cup sunflower seeds
1/3 cup mayonnaise
1 Tbsp apple cider vinegar
1 Tbsp sugar`,
  instructions: `In a large bowl, combine 4 cups broccoli florets, 6 strips cooked and crumbled bacon, 1/2 diced red onion, 1/2 cup shredded cheddar cheese, and 1/4 cup sunflower seeds.

In a separate small bowl, whisk together 1/3 cup mayonnaise, 1 Tbsp apple cider vinegar, and 1 Tbsp sugar until the dressing is smooth and the sugar has dissolved.

Pour the dressing over the broccoli mixture and mix well to ensure everything is thoroughly coated.

Chill in the refrigerator for at least 30 minutes before serving for the best flavor and texture.`,
  notes: "Crunchy, creamy, and one of those salads people always go back for.",
  translations: {
    es: {
      name: "Ensalada de brócoli con tocino",
      notes:
        "Crujiente, cremosa y de esas ensaladas por las que todos vuelven por más.",
      tags: [
        "ensalada",
        "normal",
        "acompañamiento",
        "brócoli",
        "tocino",
        "comida para compartir",
      ],
      ingredients: `4 cups de floretes de brócoli
6 tiras de tocino, cocidas y desmoronadas
1/2 cebolla roja, picada en cubitos
1/2 cup de queso cheddar rallado
1/4 cup de semillas de girasol
1/3 cup de mayonesa
1 Tbsp de vinagre de manzana
1 Tbsp de azúcar`,
      instructions: `En un tazón grande, combina 4 cups de floretes de brócoli, 6 tiras de tocino cocidas y desmoronadas, 1/2 cebolla roja picada, 1/2 cup de queso cheddar rallado y 1/4 cup de semillas de girasol.

En otro tazón pequeño, bate 1/3 cup de mayonesa, 1 Tbsp de vinagre de manzana y 1 Tbsp de azúcar hasta que el aderezo quede suave y el azúcar se disuelva.

Vierte el aderezo sobre la mezcla de brócoli y mezcla bien para que todo quede completamente cubierto.

Refrigera por al menos 30 minutos antes de servir para lograr el mejor sabor y textura.`,
    },
  },
},

{
  id: "normal-avocado-ranch-chicken-salad",
  slug: "normal-avocado-ranch-chicken-salad",
  name: "Avocado Ranch Chicken Salad",
  photoUrl: "/images/normal-avocado-ranch-chicken-salad.jpg",
  effort: "normal",
  tags: ["salad", "normal", "chicken", "avocado", "dinner", "protein"],
  ingredients: `2 cups cooked chicken, chopped
1 head romaine lettuce, chopped
1 avocado, diced
1 cup cherry tomatoes, halved
1/2 cucumber, sliced
1/4 red onion, sliced
1/2 cup cheddar cheese, shredded
1/3 cup ranch dressing`,
  instructions: `In a large bowl, combine 1 head chopped romaine lettuce, 2 cups chopped cooked chicken, 1 diced avocado, 1 cup halved cherry tomatoes, 1/2 sliced cucumber, 1/4 sliced red onion, and 1/2 cup shredded cheddar cheese.

Drizzle 1/3 cup ranch dressing over the ingredients.

Toss gently to coat everything in the dressing without mashing the avocado, and serve right away.`,
  notes: "Creamy, filling, and easy enough for a weeknight dinner.",
  translations: {
    es: {
      name: "Ensalada de pollo con aguacate y ranch",
      notes:
        "Cremosa, llenadora y lo bastante fácil para una cena entre semana.",
      tags: [
        "ensalada",
        "normal",
        "pollo",
        "aguacate",
        "cena",
        "proteína",
      ],
      ingredients: `2 cups de pollo cocido, picado
1 cabeza de lechuga romana, picada
1 aguacate, picado en cubitos
1 cup de tomates cherry, cortados por la mitad
1/2 pepino, rebanado
1/4 cebolla roja, rebanada
1/2 cup de queso cheddar rallado
1/3 cup de aderezo ranch`,
      instructions: `En un tazón grande, combina 1 cabeza de lechuga romana picada, 2 cups de pollo cocido picado, 1 aguacate en cubitos, 1 cup de tomates cherry partidos por la mitad, 1/2 pepino rebanado, 1/4 cebolla roja rebanada y 1/2 cup de queso cheddar rallado.

Rocía 1/3 cup de aderezo ranch sobre los ingredientes.

Mezcla suavemente para cubrir todo con el aderezo sin machacar el aguacate, y sirve de inmediato.`,
    },
  },
},
  // =====================================================
  // BIG
  // =====================================================
  {
  id: "big-buffalo-chicken-salad",
  slug: "big-buffalo-chicken-salad",
  name: "Buffalo Chicken Salad",
  photoUrl: "/images/big-buffalo-chicken-salad.jpg",
  effort: "big",
  tags: ["salad", "big", "chicken", "buffalo", "dinner", "spicy"],
  ingredients: `2 chicken breasts, breaded or grilled
1/3 cup buffalo sauce
1 head romaine lettuce, chopped
1 cup cherry tomatoes, halved
1/2 cucumber, sliced
1/4 red onion, sliced
1/2 cup cheddar cheese, shredded
1/4 cup blue cheese crumbles
1/3 cup ranch or blue cheese dressing`,
  instructions: `Cook 2 chicken breasts, breaded or grilled, until fully done and they reach an internal temperature of 165°F, then slice into strips or bite-sized pieces.

In a small bowl, toss the cooked chicken with 1/3 cup buffalo sauce until every piece is well coated.

In a large serving bowl, combine 1 head chopped romaine lettuce, 1 cup halved cherry tomatoes, 1/2 sliced cucumber, 1/4 sliced red onion, 1/2 cup shredded cheddar cheese, and 1/4 cup blue cheese crumbles.

Top the vegetable mixture with the buffalo chicken and drizzle with 1/3 cup ranch or blue cheese dressing before serving.`,
  notes: "Big flavor and just enough heat to make salad night exciting.",
  translations: {
    es: {
      name: "Ensalada de pollo buffalo",
      notes:
        "Mucho sabor y el picante justo para hacer que la noche de ensalada sea emocionante.",
      tags: [
        "ensalada",
        "grande",
        "pollo",
        "buffalo",
        "cena",
        "picante",
      ],
      ingredients: `2 pechugas de pollo, empanizadas o a la parrilla
1/3 cup de salsa buffalo
1 cabeza de lechuga romana, picada
1 cup de tomates cherry, cortados por la mitad
1/2 pepino, rebanado
1/4 cebolla roja, rebanada
1/2 cup de queso cheddar rallado
1/4 cup de queso azul desmoronado
1/3 cup de aderezo ranch o blue cheese`,
      instructions: `Cocina 2 pechugas de pollo, empanizadas o a la parrilla, hasta que estén completamente cocidas y alcancen una temperatura interna de 165°F, luego córtalas en tiras o trozos pequeños.

En un tazón pequeño, mezcla el pollo cocido con 1/3 cup de salsa buffalo hasta que cada pieza quede bien cubierta.

En un tazón grande para servir, combina 1 cabeza de lechuga romana picada, 1 cup de tomates cherry partidos por la mitad, 1/2 pepino rebanado, 1/4 cebolla roja rebanada, 1/2 cup de queso cheddar rallado y 1/4 cup de queso azul desmoronado.

Cubre la mezcla de verduras con el pollo buffalo y rocía con 1/3 cup de aderezo ranch o blue cheese antes de servir.`,
    },
  },
},

{
  id: "big-asian-chicken-salad",
  slug: "big-asian-chicken-salad",
  name: "Asian Chicken Salad",
  photoUrl: "/images/big-asian-chicken-salad.jpg",
  effort: "big",
  tags: ["salad", "big", "chicken", "dinner", "crunchy", "asian-inspired"],
  ingredients: `2 cups cooked chicken, shredded
1 bag coleslaw mix
1 cup romaine lettuce, chopped
1/2 cup shredded carrots
1/2 cup sliced almonds
1/4 cup crispy chow mein noodles
2 green onions, sliced
1/4 cup sesame ginger dressing`,
  instructions: `In a large bowl, combine 1 bag coleslaw mix, 1 cup chopped romaine lettuce, 1/2 cup shredded carrots, 1/2 cup sliced almonds, 1/4 cup crispy chow mein noodles, and 2 sliced green onions.

Top the vegetable and nut mixture with 2 cups shredded cooked chicken.

Drizzle with 1/4 cup sesame ginger dressing and toss thoroughly just before serving to ensure the noodles and almonds stay perfectly crunchy.`,
  notes: "Crunchy, colorful, and a great break from the usual salad routine.",
  translations: {
    es: {
      name: "Ensalada asiática de pollo",
      notes:
        "Crujiente, colorida y una gran forma de salir de la rutina de ensaladas de siempre.",
      tags: [
        "ensalada",
        "grande",
        "pollo",
        "cena",
        "crujiente",
        "inspirado en Asia",
      ],
      ingredients: `2 cups de pollo cocido, deshebrado
1 bolsa de mezcla para coleslaw
1 cup de lechuga romana, picada
1/2 cup de zanahorias ralladas
1/2 cup de almendras rebanadas
1/4 cup de fideos chow mein crujientes
2 cebollines, rebanados
1/4 cup de aderezo de sésamo y jengibre`,
      instructions: `En un tazón grande, combina 1 bolsa de mezcla para coleslaw, 1 cup de lechuga romana picada, 1/2 cup de zanahorias ralladas, 1/2 cup de almendras rebanadas, 1/4 cup de fideos chow mein crujientes y 2 cebollines rebanados.

Cubre la mezcla de verduras y almendras con 2 cups de pollo cocido deshebrado.

Rocía con 1/4 cup de aderezo de sésamo y jengibre, y mezcla bien justo antes de servir para que los fideos y las almendras se mantengan perfectamente crujientes.`,
    },
  },
},

{
  id: "big-strawberry-spinach-salad",
  slug: "big-strawberry-spinach-salad",
  name: "Strawberry Spinach Salad",
  photoUrl: "/images/big-strawberry-spinach-salad.jpg",
  effort: "big",
  tags: ["salad", "big", "vegetarian", "spinach", "fruit", "fresh"],
  isVegetarian: true,
  ingredients: `1 bag baby spinach
1 cup strawberries, sliced
1/2 cup blueberries
1/4 red onion, thinly sliced
1/2 cup feta cheese
1/4 cup candied pecans
1/3 cup poppy seed dressing`,
  instructions: `In a large serving bowl, combine 1 bag baby spinach, 1 cup sliced strawberries, 1/2 cup blueberries, 1/4 thinly sliced red onion, 1/2 cup feta cheese, and 1/4 cup candied pecans.

Drizzle 1/3 cup poppy seed dressing over the salad.

Toss gently to ensure the delicate spinach and berries are evenly coated, and serve immediately to keep the pecans crunchy.`,
  notes: "Sweet, tangy, and pretty enough to steal the show on the table.",
  translations: {
    es: {
      name: "Ensalada de espinaca con fresas",
      notes:
        "Dulce, ácida y lo suficientemente bonita como para robarse la atención en la mesa.",
      tags: [
        "ensalada",
        "grande",
        "vegetariano",
        "espinaca",
        "fruta",
        "fresco",
      ],
      ingredients: `1 bolsa de espinaca baby
1 cup de fresas, rebanadas
1/2 cup de arándanos
1/4 cebolla roja, rebanada finamente
1/2 cup de queso feta
1/4 cup de nueces pecanas caramelizadas
1/3 cup de aderezo de semillas de amapola`,
      instructions: `En un tazón grande para servir, combina 1 bolsa de espinaca baby, 1 cup de fresas rebanadas, 1/2 cup de arándanos, 1/4 cebolla roja rebanada finamente, 1/2 cup de queso feta y 1/4 cup de nueces pecanas caramelizadas.

Rocía 1/3 cup de aderezo de semillas de amapola sobre la ensalada.

Mezcla suavemente para que la espinaca delicada y las frutas queden cubiertas de manera uniforme, y sirve de inmediato para mantener las nueces crujientes.`,
    },
  },
},

{
  id: "big-taco-salad",
  slug: "big-taco-salad",
  name: "Taco Salad",
  photoUrl: "/images/big-taco-salad.jpg",
  effort: "big",
  tags: ["salad", "big", "beef", "tex-mex", "dinner", "family-friendly"],
  ingredients: `1 lb ground beef
1 packet taco seasoning
1 head romaine lettuce, chopped
1 cup cherry tomatoes, halved
1 cup corn
1 cup black beans, drained and rinsed
1 cup cheddar cheese, shredded
1/2 cup salsa
1/2 cup sour cream
1 cup tortilla chips, crushed`,
  instructions: `In a skillet over medium-high heat, cook 1 lb ground beef until fully browned. Drain any excess fat, then stir in 1 packet taco seasoning, following packet directions for water if needed.

In a large serving bowl, combine 1 head chopped romaine lettuce, 1 cup halved cherry tomatoes, 1 cup corn, 1 cup drained and rinsed black beans, and 1 cup shredded cheddar cheese.

Top the vegetable mixture with the warm seasoned taco meat.

Finish by adding 1/2 cup salsa, 1/2 cup sour cream, and 1 cup crushed tortilla chips. Toss gently or serve as-is for a layered look.`,
  notes: "A fun dinner salad that still feels hearty and family-friendly.",
  translations: {
    es: {
      name: "Ensalada de taco",
      notes:
        "Una ensalada divertida para la cena que todavía se siente sustanciosa y familiar.",
      tags: [
        "ensalada",
        "grande",
        "carne de res",
        "tex-mex",
        "cena",
        "familiar",
      ],
      ingredients: `1 lb de carne molida de res
1 paquete de sazonador para tacos
1 cabeza de lechuga romana, picada
1 cup de tomates cherry, cortados por la mitad
1 cup de maíz
1 cup de frijoles negros, escurridos y enjuagados
1 cup de queso cheddar rallado
1/2 cup de salsa
1/2 cup de crema agria
1 cup de chips de tortilla, triturados`,
      instructions: `En un sartén a fuego medio-alto, cocina 1 lb de carne molida de res hasta que esté completamente dorada. Escurre el exceso de grasa y luego incorpora 1 paquete de sazonador para tacos, siguiendo las instrucciones del paquete para agregar agua si es necesario.

En un tazón grande para servir, combina 1 cabeza de lechuga romana picada, 1 cup de tomates cherry partidos por la mitad, 1 cup de maíz, 1 cup de frijoles negros escurridos y enjuagados, y 1 cup de queso cheddar rallado.

Cubre la mezcla de verduras con la carne de taco sazonada y caliente.

Termina agregando 1/2 cup de salsa, 1/2 cup de crema agria y 1 cup de chips de tortilla triturados. Mezcla suavemente o sirve así para una presentación en capas.`,
    },
  },
},

{
  id: "big-mediterranean-chickpea-salad",
  slug: "big-mediterranean-chickpea-salad",
  name: "Mediterranean Chickpea Salad",
  photoUrl: "/images/big-mediterranean-chickpea-salad.jpg",
  effort: "big",
  tags: ["salad", "big", "vegetarian", "chickpeas", "healthy", "meal-prep"],
  isVegetarian: true,
  ingredients: `2 cans chickpeas, drained and rinsed
1 cucumber, chopped
1 pint cherry tomatoes, halved
1/2 red onion, diced
1/2 cup feta cheese
1/4 cup parsley, chopped
2 Tbsp olive oil
1 Tbsp lemon juice
1 tsp dried oregano
salt, to taste
pepper, to taste`,
  instructions: `In a large bowl, combine 2 cans drained and rinsed chickpeas, 1 chopped cucumber, 1 pint halved cherry tomatoes, 1/2 diced red onion, 1/2 cup feta cheese, and 1/4 cup chopped parsley.

In a small bowl, whisk together 2 Tbsp olive oil, 1 Tbsp lemon juice, 1 tsp dried oregano, and salt and pepper to taste.

Pour the dressing over the chickpea mixture and toss well to ensure everything is evenly coated.

Serve immediately or chill in the refrigerator to allow the flavors to meld.`,
  notes: "Protein-packed, fresh, and great for lunches the next day too.",
  translations: {
    es: {
      name: "Ensalada mediterránea de garbanzos",
      notes:
        "Llena de proteína, fresca y excelente también para almuerzos del día siguiente.",
      tags: [
        "ensalada",
        "grande",
        "vegetariano",
        "garbanzos",
        "saludable",
        "meal prep",
      ],
      ingredients: `2 latas de garbanzos, escurridos y enjuagados
1 pepino, picado
1 pinta de tomates cherry, cortados por la mitad
1/2 cebolla roja, picada en cubitos
1/2 cup de queso feta
1/4 cup de perejil, picado
2 Tbsp de aceite de oliva
1 Tbsp de jugo de limón
1 tsp de orégano seco
sal y pimienta al gusto`,
      instructions: `En un tazón grande, combina 2 latas de garbanzos escurridos y enjuagados, 1 pepino picado, 1 pinta de tomates cherry partidos por la mitad, 1/2 cebolla roja picada en cubitos, 1/2 cup de queso feta y 1/4 cup de perejil picado.

En un tazón pequeño, bate 2 Tbsp de aceite de oliva, 1 Tbsp de jugo de limón, 1 tsp de orégano seco, y sal y pimienta al gusto.

Vierte el aderezo sobre la mezcla de garbanzos y mezcla bien para que todo quede cubierto de manera uniforme.

Sirve de inmediato o refrigera para dejar que los sabores se integren.`,
    },
  },
},
];



// =====================================================
// SUBSTITUTIONS / POOLS
// =====================================================

export const SUBS = [
  { pattern: /\bground beef\b/gi, replacement: "black beans" },
  { pattern: /\bbeef\b/gi, replacement: "black beans" },
  { pattern: /\bchicken\b/gi, replacement: "tofu" },
  { pattern: /\bpork\b/gi, replacement: "jackfruit" },
  { pattern: /\bbacon\b/gi, replacement: "tempeh bacon" },
  { pattern: /\bsausage\b/gi, replacement: "plant sausage" },
  { pattern: /\bpepperoni\b/gi, replacement: "plant pepperoni" },
  { pattern: /\bmeatballs?\b/gi, replacement: "lentil meatballs" },
  { pattern: /\bham\b/gi, replacement: "smoked tofu" },
  { pattern: /\bturkey\b/gi, replacement: "tofu" },
  { pattern: /\bsalmon\b/gi, replacement: "chickpeas" },
  { pattern: /\bfish\b/gi, replacement: "chickpeas" },
  { pattern: /\bshrimp\b/gi, replacement: "hearts of palm" },
  { pattern: /\bcrab\b/gi, replacement: "hearts of palm" },
  { pattern: /\bscallops?\b/gi, replacement: "king oyster mushrooms" },
];

export const VEGGIE_POOL = NEW_VEGETARIAN_RECIPES.map((meal) => ({
  ...meal,
  isVegetarian: true,
}));

export const ALL_RECIPES: Meal[] = [
  ...NEW_BUILTIN_RECIPES,
  ...CAMPFIRE_RECIPES,
  ...NEW_VEGETARIAN_RECIPES,
  ...SIDE_DISHES,
  ...DESSERTS,
  ...EXTRA_RECIPES,
  ...VEGETARIAN_EXTRAS,
  ...NEW_SALAD_RECIPES,
];