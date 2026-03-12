import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import TestersGuidePage from "./pages/TestersGuidePage";

// =====================================================
// 1. COMPONENT & PAGE IMPORTS
// These are the different "screens" of your app.
// =====================================================
import WeekPage from "./pages/WeekPage";
import CookbookPage from "./pages/CookbookPage";
import PlanPage from "./pages/PlanPage";
import TakeoutSettingsPage from "./pages/TakeoutSettingsPage";
import ShoppingListPage from "./pages/ShoppingListPage";
import CookNowPage from "./pages/CookNowPage";
import OnboardingPage from "./pages/OnboardingPage";
import RecipePage from "./pages/RecipePage";
import HomePage from "./pages/HomePage";

// =====================================================
// 2. PROVIDERS & UTILS
// Providers handle global things like "Pop-up notifications" (Toasts) 
// and "Dark/Light Mode" (Theme).
// =====================================================
import { ToastProvider } from "./components/Toast";
import { ThemeProvider } from "./theme";

// =====================================================
// 3. CORE LOGIC & DATA
// This brings in your "Brain" files—how the plan is 
// generated and how data is saved to the phone.
// =====================================================
import type { Effort, Meal, PantryItem, Preferences } from "./core/types";
import { generatePlan } from "./core/planner";
import { days } from "./core/data";
import {
  getCookbook,
  setCookbook as persistCookbook,
  addToCookbook,
} from "./core/cookbookStore";
import { hasCompletedOnboarding } from "./core/onboardingStore";

// =====================================================
// 4. TYPES & CONSTANTS
// Defining the "shapes" of data (like what a Cookbook Entry looks like).
// =====================================================
type Day = (typeof days)[number];

type CookbookEntry = Meal & {
  id: string;
  slug?: string;
  favorite?: boolean;
  createdAt?: number;
  updatedAt?: number;
  tags?: string[];
  effort?: "quick" | "normal" | "big";
};

const EMPTY_MEAL: Meal = {
  name: "",
  ingredients: "",
  instructions: "",
  photoUrl: "",
};

const EMPTY_WEEK = Object.fromEntries(
  days.map((d) => [d, { ...EMPTY_MEAL }])
) as Record<Day, Meal>;

const EMPTY_LOCKS = Object.fromEntries(
  days.map((d) => [d, false])
) as Record<Day, boolean>;

// =====================================================
// 5. HELPER FUNCTIONS
// Small tools for creating IDs or generating random meal images.
// =====================================================
export function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function mealImageUrl(name?: string) {
  const q = encodeURIComponent((name || "cooking dinner").trim());
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80&sig=1&meal=${q}`;
}

// =====================================================
// 6. MAIN APP COMPONENT
// The "Captain's Chair" where all the data and logic live.
// =====================================================
export default function App() {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  // -----------------------------------------------------
  // A. APP STATE (Variables that change)
  // These keep track of your cookbook, your planned meals, 
  // and whether the menu is open.
  // -----------------------------------------------------
  const [menuOpen, setMenuOpen] = useState(false);

  const [cookbook, setCookbook] = useState<CookbookEntry[]>(() => {
    const raw = getCookbook() as any[];
    const now = Date.now();
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

  const [meals, setMeals] = useState<Record<Day, Meal>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("meals") || "{}") as Partial<Record<Day, Meal>>;
      return { ...EMPTY_WEEK, ...saved };
    } catch {
      return EMPTY_WEEK;
    }
  });

  const defaultDaySettings = useMemo(
    () => Object.fromEntries(days.map((d) => [d, "normal"])) as Record<Day, Effort>,
    []
  );

  const [daySettings, setDaySettings] = useState<Record<Day, Effort>>(() => {
    try {
      const saved = localStorage.getItem("daySettings");
      return saved ? JSON.parse(saved) : defaultDaySettings;
    } catch {
      return defaultDaySettings;
    }
  });

  const [pantry, setPantry] = useState<PantryItem[]>(() => {
    try {
      const raw = localStorage.getItem("pantry");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length && typeof parsed[0] === "object" && "name" in parsed[0]) {
        return parsed as PantryItem[];
      }
      return [];
    } catch { return []; }
  });

  const [prefs] = useState<Preferences>(() => {
    try {
      const saved = localStorage.getItem("prefs");
      return saved ? JSON.parse(saved) : { vegetarian: false, allergens: [] };
    } catch { return { vegetarian: false, allergens: [] }; }
  });

  const [dietaryNotes, setDietaryNotes] = useState<string>(() => localStorage.getItem("dietaryNotes") || "");
  const [vegetarian, setVegetarian] = useState<boolean>(() => localStorage.getItem("vegetarian") === "true");
  const [lockedDays, setLockedDays] = useState<Record<Day, boolean>>(() => {
    try {
      const saved = localStorage.getItem("lockedDays");
      return saved ? JSON.parse(saved) : EMPTY_LOCKS;
    } catch { return EMPTY_LOCKS; }
  });

  const effectivePrefs: Preferences = useMemo(() => ({ ...prefs, vegetarian }), [prefs, vegetarian]);

  // -----------------------------------------------------
  // B. PERSISTENCE (Saving to Phone)
  // Whenever the data above changes, these "Effects" 
  // save it to the phone's memory (localStorage).
  // -----------------------------------------------------
  useEffect(() => { localStorage.setItem("meals", JSON.stringify(meals)); }, [meals]);
  useEffect(() => { localStorage.setItem("daySettings", JSON.stringify(daySettings)); }, [daySettings]);
  useEffect(() => { persistCookbook(cookbook as CookbookEntry[]); }, [cookbook]);
  useEffect(() => { localStorage.setItem("dietaryNotes", dietaryNotes); }, [dietaryNotes]);
  useEffect(() => { localStorage.setItem("vegetarian", String(vegetarian)); }, [vegetarian]);
  useEffect(() => { localStorage.setItem("pantry", JSON.stringify(pantry)); }, [pantry]);
  useEffect(() => { localStorage.setItem("lockedDays", JSON.stringify(lockedDays)); }, [lockedDays]);

  // -----------------------------------------------------
  // C. EVENT LISTENERS
  // Handles closing the menu when you click outside or press Escape.
  // -----------------------------------------------------
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const APP_VERSION = "1.0.2"; // Bump this number every time you push an update

useEffect(() => {
  const savedVersion = localStorage.getItem("app-version");
  
  if (savedVersion !== APP_VERSION) {
    localStorage.setItem("app-version", APP_VERSION);
    // This line forces the browser to bypass the cache and reload everything
    window.location.reload(); 
  }
}, []);

  // -----------------------------------------------------
  // D. ACTION HELPERS
  // Logic for adding a meal to the cookbook or 
  // triggering the "Magic" dinner plan generator.
  // -----------------------------------------------------
  const addDayToCookbook = (day: Day) => {
    const meal = meals[day];
    if (!meal?.name?.trim()) return;
    const res = addToCookbook(meal);
    setCookbook(getCookbook());
    if (res.ok) {
      const slug = (meal.slug ?? meal.id ?? meal.name).toString().trim();
      setMeals((prev) => ({ ...prev, [day]: { ...prev[day], slug, id: prev[day].id ?? slug } }));
    }
  };

  const generateDinnerPlan = (force = false) => {
    const seedMeals: Record<Day, Meal> = force
      ? (Object.fromEntries(days.map((d) => [d, lockedDays[d] ? meals[d] : { ...EMPTY_MEAL }])) as Record<Day, Meal>)
      : meals;

    const next = generatePlan({
      meals: seedMeals,
      cookbook: cookbook ?? [],
      pantry,
      daySettings,
      prefs: effectivePrefs,
      days,
    });

    const withPhotos = { ...EMPTY_WEEK, ...next } as Record<Day, Meal>;
    for (const d of days) {
      const meal = withPhotos[d];
      if (meal && !meal.photoUrl) {
        withPhotos[d] = { ...meal, photoUrl: mealImageUrl(meal.name || "dinner") };
      }
    }
    setMeals(withPhotos);
    navigate("/week");
  };

  const requireOnboarding = (element: React.ReactNode) => {
    return hasCompletedOnboarding() ? element : <Navigate to="/onboarding" replace />;
  };

  // -----------------------------------------------------
  // E. STYLES
  // Look and feel for the menu items.
  // -----------------------------------------------------
  const menuItemStyle: React.CSSProperties = {
    width: "100%", textAlign: "left", padding: "12px 14px", background: "transparent",
    border: "none", color: "rgba(255,255,255,0.92)", cursor: "pointer", fontWeight: 900,
  };

  const menuSubStyle: React.CSSProperties = { marginTop: 4, fontSize: 12, opacity: 0.75, fontWeight: 600 };
  const dividerStyle: React.CSSProperties = { height: 1, background: "rgba(255,255,255,0.08)" };

  // -----------------------------------------------------
  // F. VISUAL LAYOUT (HTML/JSX)
  // This is what actually draws the header, menu, and 
  // content on the screen.
  // -----------------------------------------------------
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="mainCard">
          <div style={{ padding: "12px 12px 16px", maxWidth: 1200, width: "100%", margin: "0 auto", minHeight: "100vh", background: "transparent" }}>
            
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
              <div style={{ textAlign: "center", flex: 1 }}>
                <h1 className="heroTitle" style={{ margin: 0, fontSize: 32, fontWeight: 1000 }}>Simple Dinners</h1>
                <button role="menuitem" onClick={() => { navigate("/"); setMenuOpen(false); }} style={menuItemStyle}>
                  Home <div style={menuSubStyle}>Tonight’s dinner and week status</div>
                </button>
                <div style={dividerStyle} />
              </div>

              {/* Navigation Menu Button */}
              <div ref={menuRef} style={{ position: "relative", marginTop: 6, alignSelf: "flex-start" }}>
                <button
                  onClick={() => setMenuOpen((s) => !s)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.12)", background: "rgba(2,6,23,0.65)",
                    color: "rgba(255,255,255,0.92)", fontWeight: 900, cursor: "pointer", backdropFilter: "blur(10px)"
                  }}
                >
                  <div style={{ display: "grid", gap: 3 }}>
                    <span style={{ width: 18, height: 2, background: "white", borderRadius: 2 }} />
                    <span style={{ width: 18, height: 2, background: "white", borderRadius: 2 }} />
                    <span style={{ width: 18, height: 2, background: "white", borderRadius: 2 }} />
                  </div>
                </button>

                {/* Dropdown Menu Items */}
                {menuOpen && (
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 10px)", minWidth: 220, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(2,6,23,0.92)", boxShadow: "0 18px 45px rgba(0,0,0,0.45)", overflow: "hidden", zIndex: 50 }}>
                    <button onClick={() => { navigate("/"); setMenuOpen(false); }} style={menuItemStyle}>Home <div style={menuSubStyle}>Tonight’s dinner</div></button>
                    <div style={dividerStyle} />
                    <button onClick={() => { navigate("/plan"); setMenuOpen(false); }} style={menuItemStyle}>My Schedule <div style={menuSubStyle}>Set effort</div></button>
                    <div style={dividerStyle} />
                    <button onClick={() => { navigate("/week"); setMenuOpen(false); }} style={menuItemStyle}>Week Plan <div style={menuSubStyle}>Plan meals</div></button>
                    <div style={dividerStyle} />
                    <button onClick={() => { navigate("/shopping-list"); setMenuOpen(false); }} style={menuItemStyle}>Shopping List <div style={menuSubStyle}>Groceries</div></button>
                    <div style={dividerStyle} />
                    <button onClick={() => { navigate("/cookbook"); setMenuOpen(false); }} style={menuItemStyle}>Cookbook <div style={menuSubStyle}>Saved recipes</div></button>
                    <div style={dividerStyle} />
                    <button onClick={() => { navigate("/cook-now"); setMenuOpen(false); }} style={menuItemStyle}>🍳 Cook Now <div style={menuSubStyle}>What's in the pantry?</div></button>
                    <button onClick={() => { navigate("/guide"); setMenuOpen(false); }} style={menuItemStyle}>
  🚀 Tester's Guide
  <div style={menuSubStyle}>See your testing missions</div>
</button>
<div style={dividerStyle} />
</div>
                )}
              </div>
            </header>

            {/* -----------------------------------------------------
                G. ROUTES (The Map)
                This tells the app which screen to show based on 
                the URL (e.g., /cookbook shows the Cookbook Page).
                ----------------------------------------------------- */}
            <Routes>
  <Route path="/" element={hasCompletedOnboarding() ? <HomePage meals={meals} /> : <Navigate to="/onboarding" replace />} />
  <Route path="/onboarding" element={<OnboardingPage />} />
  <Route path="/plan" element={requireOnboarding(<PlanPage daySettings={daySettings} setDaySettings={setDaySettings} pantry={pantry} setPantry={setPantry} vegetarian={vegetarian} setVegetarian={setVegetarian} generateDinnerPlan={generateDinnerPlan} dietaryNotes={dietaryNotes} setDietaryNotes={setDietaryNotes} />)} />
  <Route path="/week" element={requireOnboarding(<WeekPage meals={meals} setMeals={setMeals} addDayToCookbook={addDayToCookbook} generateDinnerPlan={generateDinnerPlan} daySettings={daySettings} setDaySettings={setDaySettings} lockedDays={lockedDays} setLockedDays={setLockedDays} />)} />
  <Route path="/cookbook" element={requireOnboarding(<CookbookPage setMeals={setMeals} cookbook={cookbook} setCookbook={setCookbook} prefs={effectivePrefs} />)} />
  <Route path="/r/:slug" element={<RecipePage />} />
  <Route path="/recipe/:slug" element={<RecipePage />} />
  <Route path="/shopping-list" element={<ShoppingListPage />} />
  <Route path="/cook-now" element={<CookNowPage pantry={pantry} />} />
  <Route path="/takeout-settings" element={<TakeoutSettingsPage />} />
  
  {/* Move the Guide route ABOVE the "*" route */}
  <Route path="/guide" element={<TestersGuidePage />} />

  {/* This "*" route should ALWAYS be the very last one in the list */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>

          </div>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}