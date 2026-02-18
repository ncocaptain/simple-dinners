import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import WeekPage from "./pages/WeekPage";
import CookbookPage from "./pages/CookbookPage";
import PlanPage from "./pages/PlanPage";

// --- Types ---
export type Recipe = {
  id: string;
  name: string;
  ingredients: string;
  instructions?: string;
  photoUrl?: string;
  favorite?: boolean;
  createdAt: number;
  updatedAt?: number;
  sourceUrl?: string;
};

export type Preferences = {
  vegetarian: boolean;
  allowSubstitutions: boolean;
  allergens: string[];
};

export type Effort = "quick" | "normal" | "big" | "takeout";

export type Meal = {
  name: string;
  ingredients: string;
  instructions?: string;
  photoUrl?: string;
  description?: string;
  prepMinutes?: number;
  servings?: number;
  rating?: number;
  effort?: Effort;
};

export type PantryItem = {
  id: string;
  name: string;
  qty?: string;
  unit?: string;
  category?: string;
  expiresAt?: number;
  createdAt: number;
  updatedAt?: number;
};

// --- Constants ---
export const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

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

// --- Helpers ---
export function normalize(s: string) {
  return (s || "").trim().toLowerCase();
}

export function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function mealImageUrl(name?: string) {
  const q = encodeURIComponent((name || "cooking dinner").trim());
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80&sig=1&meal=${q}`;
}

export function applyVegSub(meal: Meal): Meal {
  let ing = meal.ingredients;
  for (const { pattern, replacement } of SUBS) ing = ing.replace(pattern, replacement);
  const name = normalize(meal.name).includes("(veg)") ? meal.name : `${meal.name} (Veg)`;
  return { ...meal, name, ingredients: ing };
}

// --- Main App ---
export default function App() {
  const navigate = useNavigate();

  // Meals
  const [meals, setMeals] = useState<Record<string, Meal>>(() => {
    try {
      return JSON.parse(localStorage.getItem("meals") || "{}");
    } catch {
      return {};
    }
  });

  // Day settings
  const defaultDaySettings = useMemo(() => {
    return Object.fromEntries(days.map((d) => [d, "normal"])) as Record<(typeof days)[number], Effort>;
  }, []);

  const [daySettings, setDaySettings] = useState<Record<(typeof days)[number], Effort>>(() => {
    try {
      const saved = localStorage.getItem("daySettings");
      return saved ? JSON.parse(saved) : defaultDaySettings;
    } catch {
      return defaultDaySettings;
    }
  });

  // Shopping checks
  const [checkedItems, setCheckedItems] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("checkedItems") || "[]");
    } catch {
      return [];
    }
  });

  // Cookbook
  const [cookbook, setCookbook] = useState<Recipe[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("simpleDinnersCookbook") || "[]");
    } catch {
      return [];
    }
  });

  // Pantry (migrate old shapes safely)
  const [pantry, setPantry] = useState<PantryItem[]>(() => {
    try {
      const raw = localStorage.getItem("pantry");
      if (!raw) return [];
      const parsed = JSON.parse(raw);

      // already PantryItem[]
      if (Array.isArray(parsed) && parsed.length && typeof parsed[0] === "object" && parsed[0] && "name" in parsed[0]) {
        return parsed as PantryItem[];
      }

      // array of strings
      if (Array.isArray(parsed) && (parsed.length === 0 || typeof parsed[0] === "string")) {
        return (parsed as string[]).map((name) => ({ id: makeId(), name, createdAt: Date.now() }));
      }

      // single string
      if (typeof parsed === "string") {
        const tokens = parsed
          .split(/[\n,]/g)
          .map((t) => t.trim())
          .filter(Boolean);
        return tokens.map((name) => ({ id: makeId(), name, createdAt: Date.now() }));
      }

      return [];
    } catch {
      return [];
    }
  });

  // Base prefs (static-ish)
  const [prefs] = useState<Preferences>(() => {
    try {
      const saved = localStorage.getItem("prefs");
      return saved ? JSON.parse(saved) : { vegetarian: false, allowSubstitutions: true, allergens: [] };
    } catch {
      return { vegetarian: false, allowSubstitutions: true, allergens: [] };
    }
  });

  const [dietaryNotes, setDietaryNotes] = useState<string>(() => localStorage.getItem("dietaryNotes") || "");
  const [vegetarian, setVegetarian] = useState<boolean>(() => localStorage.getItem("vegetarian") === "true");

  const effectivePrefs: Preferences = useMemo(
    () => ({
      ...prefs,
      vegetarian,
    }),
    [prefs, vegetarian]
  );

  // Persist
  useEffect(() => localStorage.setItem("meals", JSON.stringify(meals)), [meals]);
  useEffect(() => localStorage.setItem("daySettings", JSON.stringify(daySettings)), [daySettings]);
  useEffect(() => localStorage.setItem("checkedItems", JSON.stringify(checkedItems)), [checkedItems]);
  useEffect(() => localStorage.setItem("simpleDinnersCookbook", JSON.stringify(cookbook)), [cookbook]);
  useEffect(() => localStorage.setItem("dietaryNotes", dietaryNotes), [dietaryNotes]);
  useEffect(() => localStorage.setItem("vegetarian", String(vegetarian)), [vegetarian]);
  useEffect(() => localStorage.setItem("prefs", JSON.stringify(prefs)), [prefs]);
  useEffect(() => localStorage.setItem("pantry", JSON.stringify(pantry)), [pantry]);

  // Allergens
  const allergenKeywords = useMemo(() => {
    return ALLERGENS.filter((a) => (effectivePrefs.allergens || []).includes(a.key)).flatMap((a) =>
      a.keywords.map(normalize)
    );
  }, [effectivePrefs.allergens]);

  const violatesAllergens = (ingredients: string) => {
    const ing = normalize(ingredients);
    return allergenKeywords.some((bad) => ing.includes(bad));
  };

  const isVegetarianByHeuristic = (ingredients: string) => {
    const ing = normalize(ingredients);
    return !MEAT_WORDS.some((w) => ing.includes(normalize(w)));
  };

  // Candidate library filtered for prefs
  const candidateLibrary = useMemo(() => {
    let list = MEAL_LIBRARY.filter((m) => !violatesAllergens(m.ingredients));

    if (effectivePrefs.vegetarian) {
      if (effectivePrefs.allowSubstitutions) {
        list = list.map(applyVegSub);
      } else {
        list = list.filter((m) => isVegetarianByHeuristic(m.ingredients));
      }
    }

    return list.filter((m) => !violatesAllergens(m.ingredients));
  }, [effectivePrefs.vegetarian, effectivePrefs.allowSubstitutions, allergenKeywords]);

  // Pantry scoring
  const pantryTokens = useMemo(() => {
  if (!Array.isArray(pantry)) return [];
  return pantry
    .map((p) => normalize(p.name))
    .flatMap((s) => s.split(/[\n,]/g))
    .map((s) => s.trim())
    .filter(Boolean);
}, [pantry]);



  const scoreMealAgainstPantry = (meal: Meal, tokens: string[]) => {
  if (!tokens.length) return 0;

  const nameHay = normalize(meal.name);
  const ingHay = normalize(meal.ingredients);

  let score = 0;

  for (const t of tokens) {
    if (t.length < 3) continue;

    // ingredients match = strong
    if (ingHay.includes(t)) score += 3;

    // name match = small boost
    if (nameHay.includes(t)) score += 1;
  }

  return score;
};


  // Actions
  const addDayToCookbook = (day: string) => {
    const m = meals[day];
    if (!m?.name || !m?.ingredients) return alert("Fill in meal details first!");
    const recipe: Recipe = {
      id: makeId(),
      name: m.name,
      ingredients: m.ingredients,
      instructions: m.instructions,
      photoUrl: m.photoUrl,
      favorite: false,
      createdAt: Date.now(),
    };
    setCookbook((prev) => [recipe, ...prev]);
  };

  const generateDinnerPlan = () => {
  const isEmpty = (m?: Meal) => !m || !m.name?.trim();

  // Cookbook pool filtered + substituted if needed
  const cookbookPool: Meal[] = (cookbook ?? [])
    .filter((r) => {
      if (violatesAllergens(r.ingredients)) return false;

      if (!effectivePrefs.vegetarian) return true;

      if (isVegetarianByHeuristic(r.ingredients)) return true;

      return effectivePrefs.allowSubstitutions;
    })
    .map((r) => {
      const baseMeal: Meal = {
        name: r.name,
        ingredients: r.ingredients,
        instructions: r.instructions,
        photoUrl: r.photoUrl,
        effort: "normal",
      };

      if (
        effectivePrefs.vegetarian &&
        effectivePrefs.allowSubstitutions &&
        !isVegetarianByHeuristic(r.ingredients)
      ) {
        return applyVegSub(baseMeal);
      }

      return baseMeal;
    })
    .filter((m) => !violatesAllergens(m.ingredients));

  // Master pool
  const pool: Meal[] = [...cookbookPool, ...candidateLibrary].map((m) => ({
    ...m,
    photoUrl: m.photoUrl || mealImageUrl(m.name),
    effort: m.effort || "normal",
  }));

  const todaySeed = new Date().getFullYear() * 10000 + (new Date().getMonth() + 1) * 100 + new Date().getDate();

  // Pantry-first ordering for the whole week
  const ranked = pool
    .map((m, idx) => ({
      m,
      pantryScore: scoreMealAgainstPantry(m, pantryTokens),
      // deterministic-ish tiebreak so it doesn't feel random every render
      tie: (todaySeed + idx) % 97,
    }))
    .sort((a, b) => {
      if (b.pantryScore !== a.pantryScore) return b.pantryScore - a.pantryScore;
      return a.tie - b.tie;
    })
    .map((x) => x.m);

  setMeals((prev) => {
    const next = { ...prev };
    let changed = false;

    const usedNames = new Set<string>();

    // pre-mark meals already in the week so we avoid repeating them
    days.forEach((d) => {
      const existing = prev[d]?.name?.trim();
      if (existing) usedNames.add(normalize(existing));
    });

    days.forEach((day) => {
      if (!isEmpty(prev[day])) return;

      const needed = daySettings[day] || "normal";

      // Pantry-first: start from ranked list, then prefer matching effort
      const bestEffort = ranked.filter((m) => (m.effort || "normal") === needed);
      const candidates = bestEffort.length ? bestEffort : ranked;

      // No repeats: try to pick something not used yet
      const pick =
        candidates.find((m) => !usedNames.has(normalize(m.name))) ||
        candidates[0]; // if we run out, allow repeat

      if (pick) {
        next[day] = pick;
        usedNames.add(normalize(pick.name));
        changed = true;
      }
    });

    if (changed) navigate("/week");
    return changed ? next : prev;
  });
};


  // Menu
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Shopping list
  const uniqueShoppingList = useMemo(() => {
    const items = Object.values(meals)
      .flatMap((m) => (m?.ingredients || "").split(","))
      .map((s) => s.trim())
      .filter(Boolean)
      .map(normalize);
    return Array.from(new Set(items));
  }, [meals]);

  return (
    <div style={{ padding: 20, maxWidth: 980, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ textAlign: "center", flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 1000, letterSpacing: 0.5 }}>Simple Dinners</h1>
          <div style={{ marginTop: 6, fontSize: 16, opacity: 0.72, letterSpacing: 0.3 }}>
            Smart dinner planning based on your schedule
          </div>
        </div>

        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen((s) => !s)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(2,6,23,0.65)",
              color: "rgba(255,255,255,0.92)",
              fontWeight: 900,
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <div style={{ display: "grid", gap: 3 }}>
              <span style={{ width: 18, height: 2, background: "white", borderRadius: 2 }} />
              <span style={{ width: 18, height: 2, background: "white", borderRadius: 2 }} />
              <span style={{ width: 18, height: 2, background: "white", borderRadius: 2 }} />
            </div>
          </button>

          {menuOpen && (
            <div
              role="menu"
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 10px)",
                minWidth: 220,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(2,6,23,0.92)",
                boxShadow: "0 18px 45px rgba(0,0,0,0.45)",
                overflow: "hidden",
                transformOrigin: "top right",
                animation: "menuIn 120ms ease-out",
                zIndex: 50,
              }}
            >
              <style>{`
                @keyframes menuIn {
                  from { transform: translateY(-6px) scale(0.98); opacity: 0; }
                  to   { transform: translateY(0) scale(1); opacity: 1; }
                }
              `}</style>

              <button
                role="menuitem"
                onClick={() => {
                  navigate("/plan");
                  setMenuOpen(false);
                }}
                style={menuItemStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                My Schedule
                <div style={menuSubStyle}>Set effort + dietary notes</div>
              </button>

              <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />

              <button
                role="menuitem"
                onClick={() => {
                  navigate("/week");
                  setMenuOpen(false);
                }}
                style={menuItemStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Week Plan
                <div style={menuSubStyle}>Plan meals + shopping list</div>
              </button>

              <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />

              <button
                role="menuitem"
                onClick={() => {
                  navigate("/cookbook");
                  setMenuOpen(false);
                }}
                style={menuItemStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Cookbook
                <div style={menuSubStyle}>Manage saved recipes</div>
              </button>
            </div>
          )}
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/plan" replace />} />

        <Route
          path="/plan"
          element={
            <PlanPage
              daySettings={daySettings}
              setDaySettings={setDaySettings}
              dietaryNotes={dietaryNotes}
              setDietaryNotes={setDietaryNotes}
              vegetarian={vegetarian}
              setVegetarian={setVegetarian}
              pantry={pantry}
              setPantry={setPantry}
              generateDinnerPlan={generateDinnerPlan}
            />
          }
        />

        <Route
          path="/week"
          element={
            <WeekPage
              meals={meals}
              setMeals={setMeals}
              checkedItems={checkedItems}
              setCheckedItems={setCheckedItems}
              addDayToCookbook={addDayToCookbook}
              uniqueShoppingList={uniqueShoppingList}
              generateDinnerPlan={generateDinnerPlan}
              daySettings={daySettings}
              setDaySettings={setDaySettings}
            />
          }
        />

        <Route
          path="/cookbook"
          element={
            <CookbookPage
              meals={meals}
              setMeals={setMeals}
              cookbook={cookbook}
              setCookbook={setCookbook}
              prefs={effectivePrefs}
              allergenKeywords={allergenKeywords}
              violatesAllergens={violatesAllergens}
              isVegetarianByHeuristic={isVegetarianByHeuristic}
            />
          }
        />
      </Routes>
    </div>
  );
}

// Styles used by menu items
const menuItemStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: "12px 14px",
  background: "transparent",
  border: "none",
  color: "rgba(255,255,255,0.92)",
  cursor: "pointer",
  fontWeight: 900,
};

const menuSubStyle: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.7,
  fontWeight: 700,
  marginTop: 2,
};
