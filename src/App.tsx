import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";

// Pages
import WeekPage from "./pages/WeekPage";
import CookbookPage from "./pages/CookbookPage";
import PlanPage from "./pages/PlanPage";
import ShoppingListPage from "./pages/ShoppingListPage";
import CookNowPage from "./pages/CookNowPage";
import OnboardingPage from "./pages/OnboardingPage";
import RecipePage from "./pages/RecipePage";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import TestersGuidePage from "./pages/TestersGuidePage";
import FeedbackForm from "./pages/FeedbackForm";

// Components & Icons
import { ToastProvider } from "./components/Toast";
import { ThemeProvider } from "./theme";
import { Calendar, BookOpen, ShoppingBasket, Settings } from "lucide-react";

// Core
import type { Effort, Meal, PantryItem, Preferences } from "./core/types";
import { generatePlan } from "./core/planner"; 
import { days } from "./core/data";
import { getCookbook, setCookbook as persistCookbook, addToCookbook } from "./core/cookbookStore";
import { hasCompletedOnboarding } from "./core/onboardingStore";

// Constants
const EMPTY_MEAL: Meal = { name: "", ingredients: "", instructions: "", photoUrl: "" };
const EMPTY_WEEK = Object.fromEntries(days.map((d) => [d, { ...EMPTY_MEAL }])) as Record<string, Meal>;
const EMPTY_LOCKS = Object.fromEntries(days.map((d) => [d, false])) as Record<string, boolean>;

const mealImageUrl = (name?: string) => {
  const q = encodeURIComponent((name || "cooking dinner").trim());
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80&sig=1&meal=${q}`;
};

// =====================================================
// NAVIGATION COMPONENT
// =====================================================
function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItem = (path: string, Icon: any, label: string) => {
    const isActive = location.pathname === path;
    return (
      <button
        onClick={() => navigate(path)}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 4, background: "none", border: "none", cursor: "pointer",
          color: isActive ? "#22c55e" : "rgba(255,255,255,0.4)",
          transition: "all 0.2s ease", padding: "8px 12px"
        }}
      >
        <Icon size={22} strokeWidth={isActive ? 3 : 2} />
        <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", position: "fixed", bottom: 24, zIndex: 1000 }}>
      <div style={{ 
        display: "flex", gap: 8, padding: "8px 16px", background: "rgba(15, 23, 42, 0.85)", 
        backdropFilter: "blur(16px)", borderRadius: "32px", border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 12px 30px -5px rgba(0,0,0,0.5)"
      }}>
        {navItem("/week", Calendar, "Week")} 
        {navItem("/cookbook", BookOpen, "Cook")}
        {navItem("/shopping-list", ShoppingBasket, "Shop")}
        {navItem("/settings", Settings, "Setup")}
      </div>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const APP_VERSION = "22.0.1"; 

  const [cookbook, setCookbook] = useState<any[]>(() => {
    const raw = getCookbook() as any[];
    return (Array.isArray(raw) ? raw : []).map(r => ({ ...r, favorite: Boolean(r.favorite) }));
  });

  const [meals, setMeals] = useState<Record<string, Meal>>(() => {
    const saved = JSON.parse(localStorage.getItem("meals") || "{}");
    return { ...EMPTY_WEEK, ...saved };
  });

  const [daySettings, setDaySettings] = useState<Record<string, Effort>>(() => {
    const saved = localStorage.getItem("daySettings");
    return saved ? JSON.parse(saved) : Object.fromEntries(days.map(d => [d, "normal"]));
  });

  const [pantry, setPantry] = useState<PantryItem[]>(() => JSON.parse(localStorage.getItem("pantry") || "[]"));

  const [prefs, setPrefs] = useState<Preferences>(() => {
    const saved = localStorage.getItem("prefs");
    return saved ? JSON.parse(saved) : { vegetarian: false, allergens: [] };
  });

  const [dietaryNotes, setDietaryNotes] = useState<string>(() => localStorage.getItem("dietaryNotes") || "");
  const [vegetarian] = useState<boolean>(() => localStorage.getItem("vegetarian") === "true");

  const [lockedDays, setLockedDays] = useState<Record<string, boolean>>(() => 
    JSON.parse(localStorage.getItem("lockedDays") || JSON.stringify(EMPTY_LOCKS))
  );

  useEffect(() => { localStorage.setItem("meals", JSON.stringify(meals)); }, [meals]);
  useEffect(() => { localStorage.setItem("daySettings", JSON.stringify(daySettings)); }, [daySettings]);
  useEffect(() => { localStorage.setItem("prefs", JSON.stringify(prefs)); }, [prefs]);
  useEffect(() => { localStorage.setItem("pantry", JSON.stringify(pantry)); }, [pantry]);
  useEffect(() => { localStorage.setItem("lockedDays", JSON.stringify(lockedDays)); }, [lockedDays]);
  useEffect(() => { localStorage.setItem("dietaryNotes", dietaryNotes); }, [dietaryNotes]);
  useEffect(() => { localStorage.setItem("vegetarian", String(vegetarian)); }, [vegetarian]);
  useEffect(() => { persistCookbook(cookbook); }, [cookbook]);

  useEffect(() => {
    const savedVersion = localStorage.getItem("app-version");
    if (savedVersion !== APP_VERSION) {
      localStorage.setItem("app-version", APP_VERSION);
      window.location.reload(); 
    }
  }, []);

  const addDayToCookbook = (day: string) => {
    const meal = meals[day];
    if (!meal?.name?.trim()) return;
    addToCookbook(meal);
    setCookbook(getCookbook());
  };

  const generateDinnerPlan = (force = false) => {
    const seedMeals = force ? Object.fromEntries(days.map(d => [d, lockedDays[d] ? meals[d] : { ...EMPTY_MEAL }])) : meals;
    const next = generatePlan({ 
        meals: seedMeals as any, 
        cookbook, 
        pantry, 
        daySettings, 
        prefs: { ...prefs, vegetarian }, 
        days 
    });
    
    const withPhotos = { ...EMPTY_WEEK, ...next } as Record<string, Meal>;
    for (const d of days) {
      const meal = withPhotos[d];
      if (meal && !meal.photoUrl) {
        withPhotos[d] = { ...meal, photoUrl: mealImageUrl(meal.name || "dinner") };
      }
    }
    setMeals(withPhotos);
    navigate("/");
  };

  const requireOnboarding = (element: React.ReactNode) => 
    hasCompletedOnboarding() ? element : <Navigate to="/onboarding" replace />;

  return (
    <ThemeProvider>
      <ToastProvider>
        <div style={{ minHeight: "100vh", background: "transparent", paddingBottom: 110 }}>
          
          <header style={{ padding: "32px 20px 20px", textAlign: "center", maxWidth: "550px", margin: "0 auto" }}>
            <h1 style={{ margin: 0, fontSize: 36, fontWeight: 1000, color: "#f8fafc" }}>Simple Dinners</h1>
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.4, textTransform: "uppercase", marginTop: 4 }}>
              Captain's Kitchen • v22.0.1
            </div>
          </header>

          <Routes>
            <Route path="/" element={requireOnboarding(<HomePage meals={meals} />)} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            
            <Route path="/plan" element={requireOnboarding(
                <PlanPage 
                    daySettings={daySettings} 
                    setDaySettings={setDaySettings} 
                    pantry={pantry} 
                    setPantry={setPantry} 
                    dietaryNotes={dietaryNotes}
                    setDietaryNotes={setDietaryNotes}
                    generateDinnerPlan={generateDinnerPlan} 
                />
            )} />

            {/* FIXED: Removed daySettings/setDaySettings to match WeekPage props */}
            <Route path="/week" element={requireOnboarding(
                <WeekPage 
                    meals={meals} 
                    setMeals={setMeals} 
                    addDayToCookbook={addDayToCookbook} 
                    generateDinnerPlan={generateDinnerPlan} 
                    lockedDays={lockedDays} 
                    setLockedDays={setLockedDays} 
                />
            )} />

            <Route path="/cookbook" element={requireOnboarding(<CookbookPage setMeals={setMeals} cookbook={cookbook} setCookbook={setCookbook} prefs={{...prefs, vegetarian}} />)} />
            <Route path="/recipe/:slug" element={<RecipePage />} />
            <Route path="/shopping-list" element={requireOnboarding(<ShoppingListPage />)} />
            <Route path="/cook-now" element={requireOnboarding(<CookNowPage pantry={pantry} />)} />
            <Route path="/settings" element={<SettingsPage prefs={{...prefs, vegetarian}} setPrefs={setPrefs} />} />
            <Route path="/guide" element={<TestersGuidePage />} />
            <Route path="/feedback" element={<FeedbackForm />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Navigation />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}