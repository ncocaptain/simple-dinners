import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import WeekPage from "./pages/WeekPage";
import CookbookPage from "./pages/CookbookPage";
import PlanPage from "./pages/PlanPage";
import TakeoutSettingsPage from "./pages/TakeoutSettingsPage";
import type { Effort, Meal, PantryItem, Preferences } from "./core/types";

import {
  SUBS,
  normalize,
  candidateLibrary,
  scoreMealAgainstPantry,
  violatesAllergens,
  isVegetarianByHeuristic,

  getPantryTokens,
} from "./core/planner";

import { days } from "./core/data";
import { ToastProvider } from "./components/Toast";
import { ThemeProvider } from "./theme";
import RecipePage from "./pages/RecipePage";

// ✅ Use cookbookStore as the only cookbook system for now
import { getCookbook, setCookbook as persistCookbook, addToCookbook } from "./core/cookbookStore";
import ShoppingListPage from "./pages/ShoppingListPage";

type Day = (typeof days)[number];

type CookbookEntry = Meal & {
  id: string;
  slug?: string;
  favorite?: boolean;
  createdAt?: number;
  updatedAt?: number;
};

const EMPTY_MEAL: Meal = { name: "", ingredients: "", instructions: "", photoUrl: "" };
const EMPTY_WEEK = Object.fromEntries(days.map((d) => [d, EMPTY_MEAL])) as Record<Day, Meal>;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

// Local time format: YYYYMMDDTHHMMSS
function toICSLocal(d: Date) {
  return (
    d.getFullYear() +
    pad2(d.getMonth() + 1) +
    pad2(d.getDate()) +
    "T" +
    pad2(d.getHours()) +
    pad2(d.getMinutes()) +
    pad2(d.getSeconds())
  );
}

function escapeICS(text: string) {
  return (text ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function startOfWeekMonday(base: Date) {
  const d = new Date(base);
  const day = d.getDay(); // 0 Sun ... 6 Sat
  const diff = day === 0 ? -6 : 1 - day; // back/forward to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addWeekToCalendar(days: readonly Day[], meals: Record<Day, Meal>) {
  const monday = startOfWeekMonday(new Date());

  const events = days
    .map((day, idx) => {
      const meal = meals[day];
      if (!meal?.name?.trim()) return null; // skip EMPTY_MEAL

      const date = new Date(monday);
      date.setDate(monday.getDate() + idx);

      const start = new Date(date);
      start.setHours(18, 0, 0, 0); // 6:00 PM

      const end = new Date(date);
      end.setHours(19, 0, 0, 0); // 7:00 PM

      return {
        title: `Dinner: ${meal.name}`,
        start,
        end,
        description: meal.ingredients?.trim() ? `Ingredients: ${meal.ingredients}` : undefined,
      };
    })
    .filter(Boolean) as { title: string; start: Date; end: Date; description?: string }[];

  if (events.length === 0) return;

  const dtstamp = toICSLocal(new Date());
  const body = events
    .map((e, i) => {
      const uid = `${dtstamp}-${i}@simple-dinners`;
      return [
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `SUMMARY:${escapeICS(e.title)}`,
        e.description ? `DESCRIPTION:${escapeICS(e.description)}` : "",
        `DTSTART:${toICSLocal(e.start)}`,
        `DTEND:${toICSLocal(e.end)}`,
        "END:VEVENT",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Simple Dinners//EN", body, "END:VCALENDAR"].join("\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "simple-dinners-week.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
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
  const replacementsUsed: string[] = [];

  for (const { pattern, replacement } of SUBS) {
    if (pattern.test(ing)) {
      ing = ing.replace(pattern, replacement);
      replacementsUsed.push(replacement);
    }
  }

  const baseName = meal.name.replace(/\s*\(veg.*?\)/i, "").trim();
  const label = replacementsUsed.length > 0 ? `(${capitalize(replacementsUsed[0])})` : "(Veg swap)";

  return {
    ...meal,
    name: `${baseName} ${label}`,
    ingredients: ing,
  };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// --- Main App ---
export default function App() {
  const navigate = useNavigate();

  const [cookbook, setCookbook] = useState<CookbookEntry[]>(() => {
  const raw = getCookbook() as any[];
  const now = Date.now();

  // ensure every entry has an id (and a slug fallback)
  return (Array.isArray(raw) ? raw : []).map((r: any) => {
    const id = String(r?.id ?? r?.slug ?? r?.name ?? Math.random().toString(36).slice(2));
    return {
      ...r,
      id,
      slug: r?.slug ?? id,
      favorite: Boolean(r?.favorite),
      createdAt: r?.createdAt ?? now,
      updatedAt: r?.updatedAt ?? r?.createdAt ?? now,
    } as CookbookEntry;
  });
});

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

  const dividerStyle: React.CSSProperties = {
    height: 1,
    background: "rgba(255,255,255,0.08)",
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

  // Cookbook
  

  // Pantry
  const [pantry, setPantry] = useState<PantryItem[]>(() => {
    try {
      const raw = localStorage.getItem("pantry");
      if (!raw) return [];
      const parsed = JSON.parse(raw);

      if (
        Array.isArray(parsed) &&
        parsed.length &&
        typeof parsed[0] === "object" &&
        parsed[0] &&
        "name" in parsed[0]
      ) {
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
  useEffect(() => persistCookbook(cookbook as any), [cookbook]);
  useEffect(() => localStorage.setItem("dietaryNotes", dietaryNotes), [dietaryNotes]);
  useEffect(() => localStorage.setItem("vegetarian", String(vegetarian)), [vegetarian]);
  useEffect(() => localStorage.setItem("pantry", JSON.stringify(pantry)), [pantry]);

  // Actions
const addDayToCookbook = (day: Day) => {
  const meal = meals[day];
  if (!meal?.name?.trim()) return;

  const res = addToCookbook(meal);

  // refresh in-memory cookbook so CookbookPage updates immediately
  setCookbook(getCookbook());

  // write slug/id back to the week's meal so /recipe/:slug works
  if (res.ok) {
    const slug = (meal.slug ?? meal.id ?? meal.name).toString().trim();
    setMeals((prev) => ({
      ...prev,
      [day]: { ...prev[day], slug, id: prev[day].id ?? slug },
    }));
  }
};

  const generateDinnerPlan = (force = false) => {
    const isEmpty = (m?: Meal) => !m || !m.name?.trim();

    const baseMeals: Meal[] = [
      ...(cookbook ?? []).map((r) => ({
        name: r.name,
        ingredients: r.ingredients,
        instructions: r.instructions,
        photoUrl: r.photoUrl,
        effort: "normal" as const,
      })),
      ...candidateLibrary,
    ];

    const filtered = baseMeals
      .filter((m) => !violatesAllergens(m.ingredients, effectivePrefs.allergens))
      .flatMap((m) => {
        if (!effectivePrefs.vegetarian) return [m];
        if (isVegetarianByHeuristic(m.ingredients)) return [m];
        return effectivePrefs.allowSubstitutions ? [applyVegSub(m)] : [];
      });

    const pool: Meal[] = filtered.map((m) => ({
      ...m,
      photoUrl: m.photoUrl || mealImageUrl(m.name),
      effort: m.effort || "normal",
    }));

    const pantryTokensLocal = getPantryTokens(pantry);

    const today = new Date();
    const todaySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    const ranked = pool
      .map((m) => ({
        m,
        pantryScore: scoreMealAgainstPantry(m, pantryTokensLocal),
        tie: (todaySeed + hashString(m.id ?? m.name)) % 97,
      }))
      .sort((a, b) => {
        if (b.pantryScore !== a.pantryScore) return b.pantryScore - a.pantryScore;
        return a.tie - b.tie;
      })
      .map((x) => x.m);

    function hashString(s: string): number {
      let h = 0;
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
      return Math.abs(h);
    }

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

        const pick = candidates.find((m) => !usedNames.has(normalize(m.name))) || candidates[0];

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

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="mainCard">
          <div
            style={{
              padding: "16px 12px",
              maxWidth: 1200,
              width: "100%",
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
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ textAlign: "center", flex: 1 }}>
                <h1 className="heroTitle" style={{ margin: 0, fontSize: 32, fontWeight: 1000 }}>
                  Simple Dinners
                </h1>

                <div className="heroSubtitle" style={{ marginTop: 6, fontSize: 16, letterSpacing: 0.3 }}>
                  Dinner planning based around you
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

                    <div style={dividerStyle} />

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

                    <div style={dividerStyle} />

                    
<button
  role="menuitem"
  onClick={() => {
    navigate("/shopping-list");
    setMenuOpen(false);
  }}
  style={menuItemStyle}
>
  Shopping List
  <div style={menuSubStyle}>View & check off groceries</div>
</button>
<div style={dividerStyle} />

                    <button
                      role="menuitem"
                      onClick={() => {
                        navigate("/takeout-settings");
                        setMenuOpen(false);
                      }}
                      style={menuItemStyle}
                    >
                      Takeout Categories
                      <div style={menuSubStyle}>Customize food types</div>
                    </button>

                    <div style={dividerStyle} />

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

                    <div style={dividerStyle} />

                    <button
                      role="menuitem"
                      onClick={() => {
                        const confirmReplace = confirm("Replace this week’s meals with a new plan?");
                        if (confirmReplace) generateDinnerPlan(true);
                        setMenuOpen(false);
                      }}
                      style={{ ...menuItemStyle, color: "rgba(255, 120, 120, 0.95)" }}
                    >
                      Regenerate Week
                      <div style={menuSubStyle}>Replace current meals</div>
                    </button>
                  </div>
                )}
              </div>
            </header>

            <Routes>
  <Route path="/" element={<Navigate to="/plan" replace />} />
  <Route path="/takeout-settings" element={<TakeoutSettingsPage />} />
  <Route path="/recipe/:slug" element={<RecipePage setCookbook={setCookbook} />} />
  <Route path="/shopping-list" element={<ShoppingListPage />} />

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
        addDayToCookbook={addDayToCookbook}
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
        setMeals={setMeals}
        cookbook={cookbook}
        setCookbook={setCookbook}
        prefs={effectivePrefs}
        violatesAllergens={violatesAllergens}
        isVegetarianByHeuristic={isVegetarianByHeuristic}
      />
    }
  />

  <Route path="*" element={<Navigate to="/plan" replace />} />
</Routes>
          </div>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}