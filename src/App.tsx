import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import WeekPage from "./pages/WeekPage";
import CookbookPage from "./pages/CookbookPage";



export type Meal = { name: string; ingredients: string };

export type Recipe = {
  id: string;
  name: string;
  ingredients: string;
  instructions?: string;
  photoUrl?: string;
  favorite?: boolean;
  createdAt: number;
  updatedAt?: number;
};


export type Preferences = {
  vegetarian: boolean;
  allowSubstitutions: boolean;
  allergens: string[];
};

export const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export const ALLERGENS: Array<{ key: string; label: string; keywords: string[] }> = [
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
  { name: "Tacos", ingredients: "tortillas, ground beef, taco seasoning, lettuce, cheese, salsa" },
  { name: "Spaghetti", ingredients: "spaghetti, marinara sauce, garlic, parmesan, ground beef" },
  { name: "Chicken Stir Fry", ingredients: "chicken, soy sauce, broccoli, bell pepper, rice, garlic" },
  { name: "Burgers", ingredients: "burger buns, ground beef, cheese, lettuce, tomato, pickles" },
  { name: "BBQ Chicken", ingredients: "chicken, bbq sauce, corn, potatoes, butter" },
  { name: "Chicken Alfredo", ingredients: "chicken, fettuccine, alfredo sauce, parmesan, broccoli" },
  { name: "Chili", ingredients: "ground beef, beans, tomatoes, chili seasoning, onion, cheddar" },
  { name: "Salmon + Veg", ingredients: "salmon, lemon, asparagus, olive oil, garlic" },
  { name: "Pizza Night", ingredients: "pizza dough, sauce, mozzarella, pepperoni, mushrooms" },
  { name: "Sheet Pan Sausage", ingredients: "sausage, potatoes, carrots, onion, olive oil" },
  { name: "Fajitas", ingredients: "chicken, bell peppers, onion, tortillas, fajita seasoning" },
  { name: "Quesadillas", ingredients: "tortillas, cheese, chicken, salsa, sour cream" },
  { name: "Breakfast for Dinner", ingredients: "eggs, bacon, pancake mix, syrup, butter" },
  { name: "Meatballs", ingredients: "meatballs, marinara sauce, pasta, parmesan, garlic bread" },

  { name: "Veggie Tacos", ingredients: "tortillas, black beans, taco seasoning, lettuce, cheese, salsa" },
  { name: "Veggie Stir Fry", ingredients: "tofu, soy sauce, broccoli, bell pepper, rice, garlic" },
  { name: "Margherita Pizza", ingredients: "pizza dough, sauce, mozzarella, basil, olive oil" },
  { name: "Pesto Pasta", ingredients: "pasta, pesto, parmesan, cherry tomatoes, spinach" },
  { name: "Veggie Chili", ingredients: "beans, tomatoes, chili seasoning, onion, bell pepper, cheddar" },
  { name: "Chickpea Curry", ingredients: "chickpeas, curry paste, coconut milk, onion, rice" },
  { name: "Bean Burrito Bowls", ingredients: "black beans, rice, corn, salsa, avocado, cheese" },
  { name: "Grilled Cheese + Tomato Soup", ingredients: "bread, cheddar, butter, tomato soup" },
  { name: "Veggie Fried Rice", ingredients: "rice, eggs, peas, carrots, soy sauce, garlic" },
  { name: "Greek Salad Pitas", ingredients: "pita, cucumber, tomato, feta, olives, tzatziki" },
  { name: "Roasted Veggie Bowls", ingredients: "sweet potato, broccoli, chickpeas, olive oil, tahini" },
];

export const SUBS: Array<{ pattern: RegExp; replacement: string }> = [
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

export function normalize(s: string) {
  return (s || "").trim().toLowerCase();
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function applyVegSub(meal: Meal): Meal {
  let ing = meal.ingredients;
  for (const { pattern, replacement } of SUBS) ing = ing.replace(pattern, replacement);
  const name = normalize(meal.name).includes("(veg)") ? meal.name : `${meal.name} (Veg)`;
  return { name, ingredients: ing };
}

export function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function escapeCsvCell(value: string) {
  const v = value ?? "";
  const needsQuotes = /[",\n]/.test(v);
  const escaped = v.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function PreferencesPanel({
  prefs,
  setPrefs,
  safeAllergens,
  toggleAllergen,
  suggestionCount,
  

}: {
  
  prefs: Preferences;
  setPrefs: React.Dispatch<React.SetStateAction<Preferences>>;
  safeAllergens: string[];
  toggleAllergen: (key: string) => void;
  suggestionCount: number;
}) {
  

  return (
    <div style={{ marginTop: 14, marginBottom: 16, padding: 12, borderRadius: 10, border: "1px solid #e5e7eb" }}>
      <h2 style={{ marginTop: 0 }}>Preferences</h2>

      <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <input
          type="checkbox"
          checked={!!prefs.vegetarian}
          onChange={(e) => setPrefs((p) => ({ ...p, vegetarian: e.target.checked }))}
        />
        <span style={{ fontWeight: 600 }}>Vegetarian mode</span>
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <input
          type="checkbox"
          checked={!!prefs.allowSubstitutions}
          disabled={!prefs.vegetarian}
          onChange={(e) => setPrefs((p) => ({ ...p, allowSubstitutions: e.target.checked }))}
        />
        <span style={{ fontWeight: 600, opacity: prefs.vegetarian ? 1 : 0.6 }}>
          Allow meat substitutions (only when vegetarian mode is on)
        </span>
      </label>

      <div style={{ textAlign: "left" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Allergens to avoid</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 8 }}>
          {ALLERGENS.map((a) => (
            <label key={a.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={safeAllergens.includes(a.key)} onChange={() => toggleAllergen(a.key)} />
              <span>{a.label}</span>
            </label>
          ))}
        </div>

        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 10 }}>
          Suggestion pool size: <b>{suggestionCount}</b>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [meals, setMeals] = useState<Record<string, Meal>>(() => {
    const saved = localStorage.getItem("meals");
    try {
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [checkedItems, setCheckedItems] = React.useState<string[]>(() => {
  try {
    const saved = localStorage.getItem("checkedItems");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
});
  

   const COOKBOOK_KEY = "simpleDinnersCookbook";

const [cookbook, setCookbook] = React.useState<Recipe[]>(() => {
  try {
    const saved = localStorage.getItem(COOKBOOK_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
});

React.useEffect(() => {
  localStorage.setItem(COOKBOOK_KEY, JSON.stringify(cookbook));
}, [cookbook]);



  const [prefs, setPrefs] = useState<Preferences>(() => {
    const fallback: Preferences = { vegetarian: false, allowSubstitutions: true, allergens: [] };
    const saved = localStorage.getItem("prefs");
    if (!saved) return fallback;

    try {
      const p = JSON.parse(saved);
      return {
        vegetarian: !!p.vegetarian,
        allowSubstitutions: p.allowSubstitutions !== undefined ? !!p.allowSubstitutions : true,
        allergens: Array.isArray(p.allergens) ? p.allergens : [],
      };
    } catch {
      return fallback;
    }
  });

  const safeAllergens = Array.isArray(prefs.allergens) ? prefs.allergens : [];

  // Persist
  useEffect(() => localStorage.setItem("meals", JSON.stringify(meals)), [meals]);
  useEffect(() => localStorage.setItem("checkedItems", JSON.stringify(checkedItems)), [checkedItems]);
  useEffect(() => localStorage.setItem("cookbook", JSON.stringify(cookbook)), [cookbook]);
  useEffect(() => localStorage.setItem("prefs", JSON.stringify({ ...prefs, allergens: safeAllergens })), [prefs, safeAllergens]);

  // Derived: allergen keywords
  const allergenKeywords = useMemo(() => {
    const selected = new Set(safeAllergens);
    return ALLERGENS.filter((a) => selected.has(a.key)).flatMap((a) => a.keywords.map(normalize));
  }, [safeAllergens]);

  const violatesAllergens = (ingredients: string) => {
    const ing = normalize(ingredients);
    return allergenKeywords.some((bad) => ing.includes(bad));
  };

  const isVegetarianByHeuristic = (ingredients: string) => {
    const ing = normalize(ingredients);
    return !MEAT_WORDS.some((w) => ing.includes(w));
  };

  // Candidate library for auto-fill
  const candidateLibrary = useMemo(() => {
    const base = MEAL_LIBRARY.filter((m) => !violatesAllergens(m.ingredients));

    if (!prefs.vegetarian) return base;

    const nativeVeg = base.filter((m) => isVegetarianByHeuristic(m.ingredients));
    if (!prefs.allowSubstitutions) return nativeVeg;

    const substituted = base.map(applyVegSub).filter((m) => !violatesAllergens(m.ingredients));

    const all = [...nativeVeg, ...substituted];
    const seen = new Set<string>();
    return all.filter((m) => {
      const k = normalize(m.name);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [prefs.vegetarian, prefs.allowSubstitutions, allergenKeywords]);

  const suggestionCount = candidateLibrary.length;

  // Actions
  const toggleAllergen = (key: string) => {
    setPrefs((p) => {
      const current = Array.isArray(p.allergens) ? p.allergens : [];
      const has = current.includes(key);
      return { ...p, allergens: has ? current.filter((a) => a !== key) : [...current, key] };
    });
  };

  const fillEmptyDaysWithPrompt = () => {
    const emptyDays = days.filter((d) => {
      const name = (meals[d]?.name || "").trim();
      const ing = (meals[d]?.ingredients || "").trim();
      return name.length === 0 && ing.length === 0;
    });

    if (emptyDays.length === 0) return alert("No empty days to fill 👍");
    if (candidateLibrary.length === 0) return alert("No meals match your preferences.");

    const usedNames = new Set(days.map((d) => normalize(meals[d]?.name || "")).filter(Boolean));
    const available = shuffle(candidateLibrary.filter((m) => !usedNames.has(normalize(m.name))));
    const fallback = shuffle(candidateLibrary);

    const nextMeals = { ...meals };
    let idx = 0;

    emptyDays.forEach((day) => {
      const candidate = available[idx] || fallback[idx] || fallback[0];
      idx++;

      const ok = window.confirm(`Fill ${day} with:\n\n${candidate.name}\n\nIngredients:\n${candidate.ingredients}?`);
      if (ok) nextMeals[day] = candidate;
    });

    setMeals(nextMeals);
  };

  const uniqueShoppingList = useMemo(() => {
    const items = Object.values(meals).flatMap((meal) =>
      (meal?.ingredients || "")
        .split(",")
        .map((i) => normalize(i))
        .filter(Boolean)
    );
    return Array.from(new Set(items));
  }, [meals]);

  const addDayToCookbook = (day: string) => {
    const m = meals[day];
    const name = (m?.name || "").trim();
    const ingredients = (m?.ingredients || "").trim();
    if (!name || !ingredients) return alert("Add a meal name and ingredients first 🙂");

    const keyName = normalize(name);
    const keyIng = normalize(ingredients);
    const exists = cookbook.some((r) => normalize(r.name) === keyName && normalize(r.ingredients) === keyIng);
    if (exists) return alert("That recipe is already in your cookbook 👍");

    const recipe: Recipe = { id: makeId(), name, ingredients, favorite: false, createdAt: Date.now() };
    setCookbook((prev) => [recipe, ...prev]);
  };

  const NavButton = ({ to, label }: { to: string; label: string }) => {
    const active = location.pathname === to || (to === "/week" && location.pathname === "/");
    return (
      <button
        onClick={() => navigate(to)}
        style={{
          padding: "10px 14px",
          cursor: "pointer",
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          backgroundColor: active ? "#111827" : "white",
          color: active ? "white" : "#111827",
          fontWeight: 900,
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ padding: 20, maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>🍽️ Simple Dinners</h1>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <NavButton to="/week" label="Week Plan" />
          <NavButton to="/cookbook" label="Cookbook" />
        </div>
      </div>

      <PreferencesPanel
        prefs={prefs}
        setPrefs={setPrefs}
        safeAllergens={safeAllergens}
        toggleAllergen={toggleAllergen}
        suggestionCount={suggestionCount}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/week" replace />} />
        <Route
          path="/week"
          element={
            <WeekPage
              meals={meals}
              setMeals={setMeals}
              checkedItems={checkedItems}
              setCheckedItems={setCheckedItems}
              addDayToCookbook={addDayToCookbook}
              fillEmptyDaysWithPrompt={fillEmptyDaysWithPrompt}
              uniqueShoppingList={uniqueShoppingList}
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
              prefs={prefs}
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
