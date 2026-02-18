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
  { name: "Tacos", ingredients: "tortillas, ground beef, taco seasoning, lettuce, cheese, salsa", effort: "quick" },
  { name: "Spaghetti", ingredients: "spaghetti, marinara sauce, garlic, parmesan, ground beef", effort: "normal" },
  { name: "Chicken Alfredo", ingredients: "chicken, fettuccine, alfredo sauce, parmesan, broccoli", effort: "big" },
  { name: "Pizza Night", ingredients: "pizza dough, sauce, mozzarella, pepperoni, mushrooms", effort: "big" },
  { name: "Drive-Thru Night", ingredients: "order out (no groceries)", effort: "takeout" },
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
  // simple reliable fallback image + query param (won’t always change the image but works as a stable fallback)
  const q = encodeURIComponent((name || "cooking dinner").trim());
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80&sig=1&meal=${q}`;
}

export function applyVegSub(meal: Meal): Meal {
  let ing = meal.ingredients;
  for (const { pattern, replacement } of SUBS) ing = ing.replace(pattern, replacement);
  const name = normalize(meal.name).includes("(veg)") ? meal.name : `${meal.name} (Veg)`;
  return { ...meal, name, ingredients: ing };
}

// Fisher–Yates shuffle (seed-ish using current day so it feels “stable-ish”)
function shuffle<T>(arr: T[], seed: number) {
  const a = [...arr];
  let m = a.length;
  let s = seed || 1;
  while (m) {
    // tiny deterministic-ish RNG
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;

    const i = Math.floor(r * m--);
    [a[m], a[i]] = [a[i], a[m]];
  }
  return a;
}

// --- Main App ---
export default function App() {
  const navigate = useNavigate();

  // Meals + persistence
  const [meals, setMeals] = useState<Record<string, Meal>>(() => {
    try {
      return JSON.parse(localStorage.getItem("meals") || "{}");
    } catch {
      return {};
    }
  });

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

  const [checkedItems, setCheckedItems] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("checkedItems") || "[]");
    } catch {
      return [];
    }
  });

  const [cookbook, setCookbook] = useState<Recipe[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("simpleDinnersCookbook") || "[]");
    } catch {
      return [];
    }
  });

  // Base prefs (static-ish) - vegetarian checkbox is controlled separately via PlanPage
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

  // effective prefs used everywhere
  const effectivePrefs: Preferences = useMemo(
    () => ({
      ...prefs,
      vegetarian, // checkbox value is the driver
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

  // Candidate library (built-in meals) filtered for prefs
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

        // vegetarian mode
        if (isVegetarianByHeuristic(r.ingredients)) return true;

        // allow meat only if substitutions allowed
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

    // If pool is tiny, don’t “lock” to a single dish by effort
    // Also add variety by shuffling based on date.
    const seededPool = shuffle(pool, new Date().getFullYear() * 10000 + (new Date().getMonth() + 1) * 100 + new Date().getDate());

    setMeals((prev) => {
      const next = { ...prev };
      let changed = false;

      days.forEach((day, i) => {
        if (!isEmpty(prev[day])) return;

        const needed: Effort = (daySettings[day] || "normal") as Effort;

        const matches = seededPool.filter((m) => (m.effort || "normal") === needed);

        // ✅ broaden buckets when too small:
        // - normal can pull from quick
        // - quick can pull from normal
        // - big can pull from normal
        // - takeout stays takeout if available; otherwise normal
        let broadened: Meal[] = matches;

        if (matches.length < 2) {
          if (needed === "normal") broadened = seededPool.filter((m) => ["normal", "quick"].includes(m.effort || "normal"));
          else if (needed === "quick") broadened = seededPool.filter((m) => ["quick", "normal"].includes(m.effort || "normal"));
          else if (needed === "big") broadened = seededPool.filter((m) => ["big", "normal"].includes(m.effort || "normal"));
          else if (needed === "takeout") broadened = seededPool.filter((m) => m.effort === "takeout");
        }

        const finalPool = broadened.length ? broadened : seededPool;

        if (finalPool.length) {
          // spread days across pool
          next[day] = finalPool[(i + new Date().getDate()) % finalPool.length];
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
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 1000, letterSpacing: 0.5 }}>
            Simple Dinners
          </h1>
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
            {/* Hamburger icon */}
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

      {/* Optional: if you want a global clear button somewhere later, call clearWeek() */}
      {/* <button onClick={clearWeek}>Clear</button> */}
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
