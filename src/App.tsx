import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";

// Pages & Components
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
import { ToastProvider, useToast } from "./components/Toast";
import { ThemeProvider } from "./theme";
import { Calendar, BookOpen, ShoppingBasket, Settings, Utensils } from "lucide-react";

// Core
import type { Effort, Meal, PantryItem, Preferences } from "./core/types";
import { generatePlan } from "./core/planner"; 
import { days } from "./core/data";
import { getCookbook, setCookbook as persistCookbook, addToCookbook } from "./core/cookbookStore";
import { hasCompletedOnboarding } from "./core/onboardingStore";

const mealImageUrl = (name?: string) => {
  const q = encodeURIComponent((name || "cooking dinner").trim());
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80&sig=1&meal=${q}`;
};

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
        <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase" }}>{label}</span>
      </button>
    );
  };

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", position: "fixed", bottom: 24, zIndex: 1000 }}>
      <div style={{ 
        display: "flex", gap: 6, padding: "8px 12px", background: "rgba(15, 23, 42, 0.85)", 
        backdropFilter: "blur(16px)", borderRadius: "32px", border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 12px 30px -5px rgba(0,0,0,0.5)" 
      }}>
        {navItem("/", Utensils, "Home")} 
        {navItem("/week", Calendar, "Week")} 
        {navItem("/cookbook", BookOpen, "Cook")}
        {navItem("/shopping-list", ShoppingBasket, "Shop")}
        {navItem("/settings", Settings, "Setup")}
      </div>
    </div>
  );
}

// --- APP CONTENT (Where the logic lives) ---
function AppContent() {
  const navigate = useNavigate();
  const toastApi: any = useToast();
  const toast = toastApi.toast ?? toastApi; 
  
  const APP_VERSION = "22.0.7"; 

  // --- AUTO-UPDATE LOGIC ---
  useEffect(() => {
    if (import.meta.env.PROD) {
      const checkForUpdates = async () => {
        try {
          const response = await fetch(window.location.href, { method: 'HEAD' });
          const etag = response.headers.get('etag');
          const lastEtag = localStorage.getItem('app-etag');

          if (lastEtag && etag && lastEtag !== etag) {
            localStorage.setItem('app-etag', etag);
            toast("New update deployed! Reloading...");
            setTimeout(() => window.location.reload(), 2000);
          } else if (etag) {
            localStorage.setItem('app-etag', etag);
          }
        } catch (e) { console.log("Update check failed", e); }
      };
      checkForUpdates();
      window.addEventListener('focus', checkForUpdates);
      return () => window.removeEventListener('focus', checkForUpdates);
    }
  }, [toast]);

  // --- STATE ---
  const [cookbook, setCookbook] = useState<any[]>(() => getCookbook());
  const [meals, setMeals] = useState<Record<string, Meal>>(() => {
    try { return JSON.parse(localStorage.getItem("meals") || "{}"); } catch { return {}; }
  });
  const [daySettings, setDaySettings] = useState<Record<string, Effort>>(() => {
    try { return JSON.parse(localStorage.getItem("daySettings") || "{}"); } catch { return {}; }
  });
  const [pantry, setPantry] = useState<PantryItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("pantry") || "[]"); } catch { return []; }
  });
  const [prefs, setPrefs] = useState<Preferences>(() => {
    try { return JSON.parse(localStorage.getItem("prefs") || '{"vegetarian": false}'); } catch { return { vegetarian: false }; }
  });
  const [dietaryNotes, setDietaryNotes] = useState(() => localStorage.getItem("dietaryNotes") || "");
  const [vegetarian] = useState(() => localStorage.getItem("vegetarian") === "true");
  const [lockedDays, setLockedDays] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lockedDays") || "{}"); } catch { return {}; }
  });

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem("meals", JSON.stringify(meals));
    localStorage.setItem("daySettings", JSON.stringify(daySettings));
    localStorage.setItem("pantry", JSON.stringify(pantry));
    localStorage.setItem("lockedDays", JSON.stringify(lockedDays));
    localStorage.setItem("app-version", APP_VERSION);
    persistCookbook(cookbook);
  }, [meals, daySettings, pantry, lockedDays, cookbook]);

  const addDayToCookbook = (day: string) => {
    const meal = meals[day];
    if (meal?.name) {
      addToCookbook(meal);
      setCookbook(getCookbook());
    }
  };

  const generateDinnerPlan = (force = false) => {
    const seedMeals = force ? Object.fromEntries(days.map(d => [d, lockedDays[d] ? meals[d] : { name: "", ingredients: "", instructions: "", photoUrl: "" }])) : meals;
    const next = generatePlan({ meals: seedMeals as any, cookbook, pantry, daySettings, prefs: { ...prefs, vegetarian }, days });
    
    const withPhotos = { ...next } as Record<string, Meal>;
    for (const d of days) {
      if (withPhotos[d] && !withPhotos[d].photoUrl) {
        withPhotos[d].photoUrl = mealImageUrl(withPhotos[d].name);
      }
    }
    setMeals(withPhotos);
    navigate("/");
  };

  const requireOnboarding = (element: React.ReactNode) => 
    hasCompletedOnboarding() ? element : <Navigate to="/onboarding" replace />;

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 110 }}>
      <header style={{ padding: "32px 20px", textAlign: "center", maxWidth: "550px", margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 1000, color: "#f8fafc" }}>Simple Dinners</h1>
        <div style={{ fontSize: 12, opacity: 0.4, fontWeight: 800, textTransform: "uppercase" }}>Captain's Kitchen • v{APP_VERSION}</div>
      </header>

      <Routes>
        <Route path="/" element={requireOnboarding(<HomePage meals={meals} setMeals={setMeals} />)} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/plan" element={requireOnboarding(<PlanPage daySettings={daySettings} setDaySettings={setDaySettings} pantry={pantry} setPantry={setPantry} dietaryNotes={dietaryNotes} setDietaryNotes={setDietaryNotes} generateDinnerPlan={generateDinnerPlan} />)} />
        <Route path="/week" element={requireOnboarding(<WeekPage meals={meals} setMeals={setMeals} addDayToCookbook={addDayToCookbook} generateDinnerPlan={generateDinnerPlan} lockedDays={lockedDays} setLockedDays={setLockedDays} />)} />
        <Route path="/cookbook" element={requireOnboarding(<CookbookPage cookbook={cookbook} setCookbook={setCookbook} />)} />
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
  );
}

// --- MAIN APP (Providers only) ---
export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}