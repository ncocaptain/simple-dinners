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
  { key: "tree_nuts", label: "Tree Nuts", keywords: ["almond", "walnut", "pecan", "cashew", "pistachio", "hazelnut", "tree nut", "nuts"] },
  { key: "dairy", label: "Dairy", keywords: ["milk", "cheese", "butter", "cream", "yogurt", "parmesan", "mozzarella", "feta"] },
  { key: "eggs", label: "Eggs", keywords: ["egg", "eggs"] },
  { key: "soy", label: "Soy", keywords: ["soy", "soy sauce", "tofu", "tempeh", "edamame"] },
  { key: "gluten", label: "Wheat / Gluten", keywords: ["wheat", "gluten", "bread", "pasta", "tortilla", "buns", "flour"] },
  { key: "shellfish", label: "Shellfish", keywords: ["shrimp", "crab", "lobster", "shellfish"] },
  { key: "fish", label: "Fish", keywords: ["fish", "salmon", "tuna"] },
  { key: "sesame", label: "Sesame", keywords: ["sesame", "tahini"] },
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
];

export const MEAL_LIBRARY: Meal[] = [
  // -----------------------------
  // QUICK (10–20 min)
  // -----------------------------
  { name: "Veggie Quesadillas", ingredients: "tortillas, cheese, black beans, salsa, bell peppers", effort: "quick" },
  { name: "Chicken Quesadillas", ingredients: "tortillas, chicken, cheese, salsa", effort: "quick" },
  { name: "Tacos", ingredients: "tortillas, ground beef, taco seasoning, lettuce, cheese, salsa", effort: "quick" },
  { name: "Taco Salad", ingredients: "lettuce, ground beef, taco seasoning, cheese, salsa, tortilla chips", effort: "quick" },
  { name: "Egg Fried Rice", ingredients: "rice, eggs, soy sauce, peas, carrots, garlic", effort: "quick" },
  { name: "Veggie Stir Fry", ingredients: "broccoli, bell peppers, soy sauce, garlic, rice", effort: "quick" },
  { name: "Chicken Stir Fry", ingredients: "chicken, broccoli, soy sauce, garlic, bell peppers, rice", effort: "quick" },
  { name: "Sausage & Peppers Skillet", ingredients: "sausage, bell peppers, onion, garlic, olive oil", effort: "quick" },
  { name: "Garlic Butter Shrimp", ingredients: "shrimp, butter, garlic, lemon, rice", effort: "quick" },
  { name: "Avocado Toast + Eggs", ingredients: "bread, avocado, eggs, salt, pepper", effort: "quick" },
  { name: "Grilled Cheese + Tomato Soup", ingredients: "bread, cheese, butter, tomato soup", effort: "quick" },
  { name: "Sheet Pan Sausage & Veg", ingredients: "sausage, potatoes, broccoli, olive oil, garlic", effort: "quick" },
  { name: "BLT Sandwiches", ingredients: "bacon, bread, lettuce, tomato, mayo", effort: "quick" },
  { name: "Tuna Melt", ingredients: "tuna, mayo, bread, cheese", effort: "quick" },
  { name: "Greek Yogurt Bowls", ingredients: "yogurt, honey, berries, granola", effort: "quick" },

  // -----------------------------
  // NORMAL (20–40 min)
  // -----------------------------
  { name: "Spaghetti", ingredients: "spaghetti, marinara sauce, garlic, parmesan, ground beef", effort: "normal" },
  { name: "Pasta Primavera", ingredients: "pasta, zucchini, broccoli, garlic, parmesan, olive oil", effort: "normal" },
  { name: "Chicken Parmesan", ingredients: "chicken, marinara sauce, mozzarella, parmesan, pasta", effort: "normal" },
  { name: "Baked Chicken & Potatoes", ingredients: "chicken, potatoes, olive oil, garlic, rosemary", effort: "normal" },
  { name: "Burgers & Fries", ingredients: "ground beef, buns, cheese, lettuce, potatoes", effort: "normal" },
  { name: "Turkey Burgers", ingredients: "turkey, buns, lettuce, tomato, onion", effort: "normal" },
  { name: "Chili", ingredients: "ground beef, beans, diced tomatoes, chili seasoning, onion", effort: "normal" },
  { name: "Veggie Chili", ingredients: "beans, diced tomatoes, chili seasoning, onion, bell peppers", effort: "normal" },
  { name: "Chicken Tikka-ish Bowls", ingredients: "chicken, rice, yogurt, garlic, spices", effort: "normal" },
  { name: "Salmon Rice Bowls", ingredients: "salmon, rice, soy sauce, cucumber, sesame", effort: "normal" },
  { name: "Shrimp Pasta", ingredients: "shrimp, pasta, garlic, butter, parmesan", effort: "normal" },
  { name: "Meatball Subs", ingredients: "meatballs, marinara sauce, sub rolls, mozzarella", effort: "normal" },
  { name: "Burrito Bowls", ingredients: "rice, black beans, chicken, salsa, cheese, lettuce", effort: "normal" },
  { name: "Chicken Caesar Wraps", ingredients: "tortillas, chicken, romaine, parmesan, caesar dressing", effort: "normal" },
  { name: "Veggie Wraps", ingredients: "tortillas, hummus, cucumber, spinach, bell peppers", effort: "normal" },
  { name: "Homemade Ramen", ingredients: "ramen noodles, eggs, soy sauce, green onion, garlic", effort: "normal" },
  { name: "Pork Chops & Green Beans", ingredients: "pork chops, green beans, butter, garlic", effort: "normal" },
  { name: "Beef & Broccoli", ingredients: "beef, broccoli, soy sauce, garlic, rice", effort: "normal" },
  { name: "Chicken Fajitas", ingredients: "chicken, bell peppers, onion, tortillas, fajita seasoning", effort: "normal" },
  { name: "Veggie Fajitas", ingredients: "bell peppers, onion, tortillas, fajita seasoning, salsa", effort: "normal" },
  { name: "Baked Ziti", ingredients: "pasta, marinara sauce, mozzarella, ricotta, parmesan", effort: "normal" },
  { name: "Mac & Cheese", ingredients: "pasta, cheese, milk, butter", effort: "normal" },
  { name: "Tortellini + Marinara", ingredients: "tortellini, marinara sauce, parmesan, garlic", effort: "normal" },

  // -----------------------------
  // BIG COOK (40–90 min)
  // -----------------------------
  { name: "Pizza Night", ingredients: "pizza dough, sauce, mozzarella, pepperoni, mushrooms", effort: "big" },
  { name: "Homemade Veggie Pizza", ingredients: "pizza dough, sauce, mozzarella, mushrooms, bell peppers, onion", effort: "big" },
  { name: "Chicken Alfredo", ingredients: "chicken, fettuccine, alfredo sauce, parmesan, broccoli", effort: "big" },
  { name: "Lasagna", ingredients: "lasagna noodles, marinara sauce, ricotta, mozzarella, ground beef", effort: "big" },
  { name: "Baked Salmon + Veg", ingredients: "salmon, asparagus, lemon, olive oil, garlic", effort: "big" },
  { name: "Pot Roast", ingredients: "beef roast, potatoes, carrots, onion, broth", effort: "big" },
  { name: "Pulled Pork Sandwiches", ingredients: "pork shoulder, bbq sauce, buns, coleslaw", effort: "big" },
  { name: "Chicken Soup", ingredients: "chicken, carrots, celery, onion, broth, noodles", effort: "big" },
  { name: "Beef Tacos Party Tray", ingredients: "tortillas, ground beef, taco seasoning, cheese, lettuce, salsa", effort: "big" },
  { name: "Stuffed Peppers", ingredients: "bell peppers, ground beef, rice, tomato sauce, cheese", effort: "big" },
  { name: "Veggie Stuffed Peppers", ingredients: "bell peppers, rice, black beans, tomato sauce, cheese", effort: "big" },
  { name: "Baked Chicken Thighs", ingredients: "chicken thighs, garlic, butter, potatoes", effort: "big" },

  // -----------------------------
  // TAKEOUT / NO-COOK
  // -----------------------------
  { name: "Drive-Thru Night", ingredients: "order out (no groceries)", effort: "takeout" },
  { name: "Rotisserie Chicken Night", ingredients: "rotisserie chicken, salad kit, rolls", effort: "takeout" },
  { name: "Frozen Pizza Night", ingredients: "frozen pizza, salad kit", effort: "takeout" },
  { name: "Deli Sandwich Night", ingredients: "deli meat, bread, cheese, chips", effort: "takeout" },
];




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
];