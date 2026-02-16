import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import WeekPage from "./pages/WeekPage";
import CookbookPage from "./pages/CookbookPage";

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

export const MEAT_WORDS = ["beef", "ground beef", "chicken", "pork", "bacon", "sausage", "pepperoni", "meatball", "ham", "turkey", "salmon", "fish", "shrimp"];

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
export function normalize(s: string) { return (s || "").trim().toLowerCase(); }

export function applyVegSub(meal: Meal): Meal {
  let ing = meal.ingredients;
  for (const { pattern, replacement } of SUBS) ing = ing.replace(pattern, replacement);
  const name = normalize(meal.name).includes("(veg)") ? meal.name : `${meal.name} (Veg)`;
  return { ...meal, name, ingredients: ing };
}

export function makeId() { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }

export function mealImageUrl(name?: string) {
  const q = encodeURIComponent((name || "cooking dinner").trim());
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80&q=${q}`;
}

// --- Main App ---
export default function App() {
  const navigate = useNavigate();

  // State Persistence Hooks
  const [meals, setMeals] = useState<Record<string, Meal>>(() => JSON.parse(localStorage.getItem("meals") || "{}"));
  const [daySettings, setDaySettings] = useState<Record<string, Effort>>(() => JSON.parse(localStorage.getItem("daySettings") || "{}") || {
    Monday: "normal", Tuesday: "normal", Wednesday: "normal", Thursday: "normal", Friday: "normal", Saturday: "normal", Sunday: "normal"
  });
  const [checkedItems, setCheckedItems] = useState<string[]>(() => JSON.parse(localStorage.getItem("checkedItems") || "[]"));
  const [cookbook, setCookbook] = useState<Recipe[]>(() => JSON.parse(localStorage.getItem("simpleDinnersCookbook") || "[]"));
  const [prefs] = useState<Preferences>(() => {
    const saved = localStorage.getItem("prefs");
    return saved ? JSON.parse(saved) : { vegetarian: false, allowSubstitutions: true, allergens: [] };
  });

  // Effectful Persistence
  useEffect(() => localStorage.setItem("meals", JSON.stringify(meals)), [meals]);
  useEffect(() => localStorage.setItem("daySettings", JSON.stringify(daySettings)), [daySettings]);
  useEffect(() => localStorage.setItem("checkedItems", JSON.stringify(checkedItems)), [checkedItems]);
  useEffect(() => localStorage.setItem("simpleDinnersCookbook", JSON.stringify(cookbook)), [cookbook]);
  useEffect(() => localStorage.setItem("prefs", JSON.stringify(prefs)), [prefs]);

  // Logic Memos
  const allergenKeywords = useMemo(() => {
    return ALLERGENS.filter((a) => (prefs.allergens || []).includes(a.key)).flatMap((a) => a.keywords.map(normalize));
  }, [prefs.allergens]);

  const violatesAllergens = (ingredients: string) => {
    const ing = normalize(ingredients);
    return allergenKeywords.some((bad) => ing.includes(bad));
  };

  const isVegetarianByHeuristic = (ingredients: string) => !MEAT_WORDS.some((w) => normalize(ingredients).includes(w));

  const candidateLibrary = useMemo(() => {
    let list = MEAL_LIBRARY.filter((m) => !violatesAllergens(m.ingredients));
    if (prefs.vegetarian) {
      if (prefs.allowSubstitutions) {
        list = list.map(applyVegSub);
      } else {
        list = list.filter((m) => isVegetarianByHeuristic(m.ingredients));
      }
    }
    return list.filter(m => !violatesAllergens(m.ingredients));
  }, [prefs.vegetarian, prefs.allowSubstitutions, allergenKeywords]);

  // Actions
  const generateDinnerPlan = () => {
    const isEmpty = (m?: Meal) => !m || !m.name.trim();
    
    const pool: Meal[] = [
      ...cookbook.map(r => ({ name: r.name, ingredients: r.ingredients, effort: "normal" as const, photoUrl: r.photoUrl })),
      ...candidateLibrary
    ].map(m => ({ ...m, photoUrl: m.photoUrl || mealImageUrl(m.name) }));

    setMeals(prev => {
      const next = { ...prev };
      let changed = false;
      days.forEach((day, i) => {
        if (!isEmpty(prev[day])) return;
        const needed = daySettings[day] || "normal";
        const matches = pool.filter(m => (m.effort || "normal") === needed);
        const finalPool = matches.length ? matches : pool;
        if (finalPool.length) {
          next[day] = finalPool[(new Date().getDate() + i) % finalPool.length];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  };

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

  const addDayToCookbook = (day: string) => {
    const m = meals[day];
    if (!m?.name || !m?.ingredients) return alert("Fill in meal details first!");
    const recipe: Recipe = { id: makeId(), name: m.name, ingredients: m.ingredients, favorite: false, createdAt: Date.now() };
    setCookbook(prev => [recipe, ...prev]);
  };

  return (
    <div style={{ padding: 20, maxWidth: 980, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div
  style={{
    textAlign: "center",
    marginBottom: 24,
  }}
>
  <h1
    style={{
      margin: 0,
      fontSize: 32,
      fontWeight: 1000,
      letterSpacing: 0.5,
    }}
  >
    Simple Dinners
  </h1>

  <div
    style={{
      marginTop: 6,
      fontSize: 18,
      opacity: 0.7,
      letterSpacing: 0.3,
    }}
  >
    Smart dinner planning based on your schedule
  </div>
</div>

       <div ref={menuRef} style={{ position: "relative" }}>
  <div ref={menuRef} style={{ position: "relative" }}>
  <button
  onClick={() => setMenuOpen((s) => !s)}
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


 </div>


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
          navigate("/week");
          setMenuOpen(false);
        }}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "12px 14px",
          background: "transparent",
          border: "none",
          color: "rgba(255,255,255,0.92)",
          cursor: "pointer",
          fontWeight: 900,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        Week Plan
        <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 700, marginTop: 2 }}>
          Plan meals + shopping list
        </div>
      </button>

      <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />

      <button
        role="menuitem"
        onClick={() => {
          navigate("/cookbook");
          setMenuOpen(false);
        }}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "12px 14px",
          background: "transparent",
          border: "none",
          color: "rgba(255,255,255,0.92)",
          cursor: "pointer",
          fontWeight: 900,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        Cookbook
        <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 700, marginTop: 2 }}>
          Manage saved recipes
        </div>
      </button>
    </div>
  )}
</div>


      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/week" replace />} />
        <Route path="/week" element={<WeekPage meals={meals} setMeals={setMeals} checkedItems={checkedItems} setCheckedItems={setCheckedItems} addDayToCookbook={addDayToCookbook} uniqueShoppingList={Array.from(new Set(Object.values(meals).flatMap(m => m.ingredients.split(',').map(normalize))))} generateDinnerPlan={generateDinnerPlan} daySettings={daySettings} setDaySettings={setDaySettings} />} />
        <Route path="/cookbook" element={<CookbookPage meals={meals} setMeals={setMeals} cookbook={cookbook} setCookbook={setCookbook} prefs={prefs} allergenKeywords={allergenKeywords} violatesAllergens={violatesAllergens} isVegetarianByHeuristic={isVegetarianByHeuristic} />} />
      </Routes>
    </div>
  );
}