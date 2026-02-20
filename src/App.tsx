import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import WeekPage from "./pages/WeekPage";
import CookbookPage from "./pages/CookbookPage";
import PlanPage from "./pages/PlanPage";
import type { Effort, Meal, PantryItem, Preferences, Recipe } from "./core/types";
import {
  SUBS,
  normalize,
  candidateLibrary,
  scoreMealAgainstPantry,
  violatesAllergens,
  isVegetarianByHeuristic,
  allergenKeywords,
  getPantryTokens,
} from "./core/planner";
import { days } from "./core/data";



type Day = (typeof days)[number];

const EMPTY_MEAL: Meal = { name: "", ingredients: "", instructions: "", photoUrl: "" };
const EMPTY_WEEK = Object.fromEntries(days.map((d) => [d, EMPTY_MEAL])) as Record<Day, Meal>;





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
    marginTop: 4,
    fontSize: 12,
    opacity: 0.75,
    fontWeight: 600,
  };
  // Meals (ONE state, merged with EMPTY_WEEK)
  const [meals, setMeals] = useState<Record<Day, Meal>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("meals") || "{}") as Partial<Record<Day, Meal>>;
      return { ...EMPTY_WEEK, ...saved };
    } catch {
      return EMPTY_WEEK;
    }
  });

  // Day settings
  const defaultDaySettings = useMemo(() => {
    return Object.fromEntries(days.map((d) => [d, "normal"])) as Record<Day, Effort>;
  }, []);

  const [daySettings, setDaySettings] = useState<Record<Day, Effort>>(() => {
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

  // Pantry
  const [pantry, setPantry] = useState<PantryItem[]>(() => {
    try {
      const raw = localStorage.getItem("pantry");
      if (!raw) return [];
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed) && parsed.length && typeof parsed[0] === "object" && parsed[0] && "name" in parsed[0]) {
        return parsed as PantryItem[];
      }

      if (Array.isArray(parsed) && (parsed.length === 0 || typeof parsed[0] === "string")) {
        return (parsed as string[]).map((name) => ({ id: makeId(), name, createdAt: Date.now() }));
      }

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

  // Prefs
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
  useEffect(() => localStorage.setItem("pantry", JSON.stringify(pantry)), [pantry]);

  // Actions
  const addDayToCookbook = (day: Day) => {
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

  const generateDinnerPlan = (force = false) => {
  const isEmpty = (m?: Meal) => !m || !m.name?.trim();

  const cookbookPool: Meal[] = (cookbook ?? [])
    .filter((r) => {
      if (violatesAllergens(r.ingredients, effectivePrefs.allergens)) return false;

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
    .filter((m) => !violatesAllergens(m.ingredients, effectivePrefs.allergens));

  const pool: Meal[] = [...cookbookPool, ...candidateLibrary].map((m) => ({
    ...m,
    photoUrl: m.photoUrl || mealImageUrl(m.name),
    effort: m.effort || "normal",
  }));

  const pantryTokensLocal = getPantryTokens(pantry);
  const today = new Date();
  const todaySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  const ranked = pool
    .map((m, idx) => ({
      m,
      pantryScore: scoreMealAgainstPantry(m, pantryTokensLocal),
      tie: (todaySeed + idx) % 97,
    }))
    .sort((a, b) => {
      if (b.pantryScore !== a.pantryScore) return b.pantryScore - a.pantryScore;
      return a.tie - b.tie;
    })
    .map((x) => x.m);

  const prevMeals = meals;
  const next: Record<Day, Meal> = { ...prevMeals };
  let changed = false;

  const usedNames = new Set<string>();
  if (!force) {
    days.forEach((d) => {
      const existing = prevMeals[d]?.name?.trim();
      if (existing) usedNames.add(normalize(existing));
    });
  }

  const fallbackMeal = (day: Day): Meal => {
    const needed = daySettings[day] || "normal";
    if (needed === "takeout") {
      return {
        name: "Takeout Night",
        ingredients: "order out (no groceries)",
        effort: "takeout",
        photoUrl: mealImageUrl("takeout dinner"),
      };
    }
    return {
      name: "Plan later",
      ingredients: "",
      instructions: "",
      effort: needed,
      photoUrl: mealImageUrl("dinner"),
    };
  };

  days.forEach((day) => {
    if (!force && !isEmpty(prevMeals[day])) return;

    const needed = daySettings[day] || "normal";

    if (needed === "takeout") {
      next[day] = fallbackMeal(day);
      changed = true;
      return;
    }

    if (ranked.length) {
      const bestEffort = ranked.filter((m) => (m.effort || "normal") === needed);
      const candidates = bestEffort.length ? bestEffort : ranked;

      const pick =
        candidates.find((m) => !usedNames.has(normalize(m.name))) ||
        candidates[0];

      if (pick) {
        next[day] = pick;
        usedNames.add(normalize(pick.name));
        changed = true;
        return;
      }
    }

    next[day] = fallbackMeal(day);
    changed = true;
  });

  if (!changed) {
    alert("Nothing to generate (all days already have meals). Tip: add a Force Generate button.");
    return;
  }

  setMeals(next);
  navigate("/week");
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
    <div className="mainCard">
      {/* keep your existing return content INSIDE here */}
      <div
        style={{
          padding: 20,
          maxWidth: 980,
          margin: "0 auto",
          minHeight: "100vh",
          background: "transparent",
        }}
      >
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

      <button
  onClick={() => generateDinnerPlan(true)}
  style={{ padding: "10px 12px", borderRadius: 12, fontWeight: 900 }}
>
  Force Generate
</button>

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
              zIndex: 50,
            }}
          >
            <button
              role="menuitem"
              onClick={() => {
                navigate("/plan");
                setMenuOpen(false);
              }}
              style={menuItemStyle}
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
        </div>
);
}