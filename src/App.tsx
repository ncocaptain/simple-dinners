import React, { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";

// Pages & Components
import WeekPage from "./pages/WeekPage";
import CookbookPage from "./pages/CookbookPage";
import PlanPage from "./pages/PlanPage";
import ShoppingListPage from "./pages/ShoppingListPage";
import CookNowPage from "./pages/CookNowPage";
import OnboardingPage from "./pages/OnboardingPage";
import RecipePage from "./pages/RecipePage";
import HomePage from "./pages/HomePage";
import TestersGuidePage from "./pages/TestersGuidePage";
import FeedbackForm from "./pages/FeedbackForm";
import WhatsNewPage from "./pages/WhatsNewPage";
import { ToastProvider, useToast } from "./components/Toast";
import { ThemeProvider } from "./theme";
import {
  Calendar,
  BookOpen,
  ShoppingBasket,
  Settings,
  Utensils,
} from "lucide-react";

// Core
import type { Effort, Meal, PantryItem, Preferences } from "./core/types";
import { generatePlan } from "./core/planner";
import { days } from "./core/data";
import {
  getCookbook,
  setCookbook as persistCookbook,
  addToCookbook,
} from "./core/cookbookStore";
import { hasCompletedOnboarding } from "./core/onboardingStore";
import RecipesPage from "./pages/RecipesPage";

const APP_VERSION = "22.0.7";

const mealImageUrl = (name?: string) => {
  const q = encodeURIComponent((name || "cooking dinner").trim());
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80&sig=1&meal=${q}`;
};

function BackHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let listener: { remove: () => Promise<void> } | undefined;

    const setup = async () => {
      try {
        listener = await CapacitorApp.addListener("backButton", () => {
          // If browser/app has history, go back
          if (window.history.length > 1) {
            window.history.back();
            return;
          }

          // If somehow no history but not on home, go home
          if (location.pathname !== "/") {
            navigate("/");
            return;
          }

          // Already at home: do nothing so app does not close immediately
        });
      } catch (err) {
        console.log("Capacitor back button listener not available", err);
      }
    };

    setup();

    return () => {
      listener?.remove();
    };
  }, [location.pathname, navigate]);

  useEffect(() => {
    const handlePopState = () => {
      if (location.pathname === "/") {
        navigate("/");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [location.pathname, navigate]);

  return null;
}

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItem = (path: string, Icon: any, label: string) => {
    const isActive = location.pathname === path;

    return (
      <button
        onClick={() => navigate(path)}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: isActive ? "#22c55e" : "rgba(255,255,255,0.4)",
          transition: "all 0.2s ease",
          padding: "8px 12px",
        }}
      >
        <Icon size={22} strokeWidth={isActive ? 3 : 2} />
        <span
          style={{
            fontSize: 9,
            fontWeight: 900,
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        position: "fixed",
        bottom: 24,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "8px 12px",
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(16px)",
          borderRadius: "32px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 12px 30px -5px rgba(0,0,0,0.5)",
        }}
      >
        {navItem("/", Utensils, "Home")}
        {navItem("/week", Calendar, "Week")}
        {navItem("/cookbook", BookOpen, "Cook")}
        {navItem("/shopping-list", ShoppingBasket, "Shop")}
        {navItem("/plan", Settings, "Plan")}
      </div>
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
const hideBottomNav = location.pathname.startsWith("/recipe/");
  const [showTesterPrompt, setShowTesterPrompt] = useState(false);
  const toastApi: any = useToast();
  const toast = toastApi.toast ?? toastApi;

  // --- app update + chunk reload handling ---
  useEffect(() => {
    if (import.meta.env.PROD) {
      const checkForUpdates = async () => {
        try {
          const response = await fetch(window.location.href, { method: "HEAD" });
          const etag = response.headers.get("etag");
          const lastEtag = localStorage.getItem("app-etag");

          if (lastEtag && etag && lastEtag !== etag) {
            localStorage.setItem("app-etag", etag);
            toast("New update deployed! Reloading...");
            setTimeout(() => window.location.reload(), 2000);
          } else if (etag) {
            localStorage.setItem("app-etag", etag);
          }
        } catch (e) {
          console.log("Update check failed", e);
        }
      };

      checkForUpdates();
      window.addEventListener("focus", checkForUpdates);
      return () => window.removeEventListener("focus", checkForUpdates);
    }

    const handleError = (e: ErrorEvent) => {
      if (
        e.message.includes("Loading chunk") ||
        e.message.includes("Script error")
      ) {
        window.location.reload();
      }
    };

    window.addEventListener("error", handleError, true);
    return () => window.removeEventListener("error", handleError, true);
  }, [toast]);

  // --- what's new redirect ---
  useEffect(() => {
    const seenVersion = localStorage.getItem("seen-whats-new");

    if (seenVersion !== APP_VERSION) {
      navigate("/whats-new");
      localStorage.setItem("seen-whats-new", APP_VERSION);
    }
  }, [navigate]);

  // --- STATE ---
  const [cookbook, setCookbook] = useState<any[]>(() => getCookbook());

  const [meals, setMeals] = useState<Record<string, Meal>>(() => {
    try {
      return JSON.parse(localStorage.getItem("meals") || "{}");
    } catch {
      return {};
    }
  });

  const [daySettings, setDaySettings] = useState<Record<string, Effort>>(() => {
    try {
      return JSON.parse(localStorage.getItem("daySettings") || "{}");
    } catch {
      return {};
    }
  });

  const [pantry, setPantry] = useState<PantryItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("pantry") || "[]");
    } catch {
      return [];
    }
  });

  const [prefs, setPrefs] = useState<Preferences>(() => {
    try {
      const saved = localStorage.getItem("prefs");
      return saved
        ? JSON.parse(saved)
        : {
            vegetarian: false,
            dietaryNotes: "",
            includeDesserts: false,
            includeAppetizers: false,
          };
    } catch {
      return {
        vegetarian: false,
        dietaryNotes: "",
        includeDesserts: false,
        includeAppetizers: false,
      };
    }
  });

  const [lockedDays, setLockedDays] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem("lockedDays") || "{}");
    } catch {
      return {};
    }
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
  const seedMeals = force
    ? Object.fromEntries(
        days.map((d) => [
          d,
          lockedDays[d]
            ? meals[d]
            : { name: "", ingredients: "", instructions: "", photoUrl: "" },
        ])
      )
    : meals;

  const next = generatePlan({
    cookbook,
    pantry: pantry.map((item) => item.name),
    daySettings,
    lockedMeals: seedMeals as Partial<Record<(typeof days)[number], Meal | null>>,
    preferences: prefs,
  });

  const withPhotos = { ...next } as Record<string, Meal>;

  for (const d of days) {
    if (withPhotos[d] && !withPhotos[d].photoUrl) {
      withPhotos[d].photoUrl = mealImageUrl(withPhotos[d].name);
    }
  }

  setMeals(withPhotos);
  navigate("/week");
};

  const requireOnboarding = (element: React.ReactNode) =>
    hasCompletedOnboarding() ? element : <Navigate to="/onboarding" replace />;

  return (
    <div style={{ minHeight: "100vh", paddingBottom: hideBottomNav ? 24 : 110 }}>
      <BackHandler />

      <header
        style={{
          padding: "32px 20px",
          textAlign: "center",
          maxWidth: "550px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 36,
            fontWeight: 1000,
            color: "#f8fafc",
          }}
        >
          Simple Dinners
        </h1>
        <div
          style={{
            fontSize: 12,
            opacity: 0.4,
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          Dinner Built Around You
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={requireOnboarding(
            <HomePage meals={meals} setMeals={setMeals} />
          )}
        />

        <Route path="/onboarding" element={<OnboardingPage />} />

        <Route
          path="/plan"
          element={requireOnboarding(
            <PlanPage
              daySettings={daySettings}
              setDaySettings={setDaySettings}
              pantry={pantry}
              setPantry={setPantry}
              prefs={prefs}
              setPrefs={setPrefs}
              generateDinnerPlan={generateDinnerPlan}
            />
          )}
        />

        <Route
  path="/week"
  element={
    <WeekPage
      meals={meals}
      setMeals={setMeals}
      generateDinnerPlan={generateDinnerPlan}
      lockedDays={lockedDays}
      setLockedDays={setLockedDays}
      addDayToCookbook={addDayToCookbook}
    />
  }
/>

        <Route
          path="/cookbook"
          element={requireOnboarding(
            <CookbookPage cookbook={cookbook} setCookbook={setCookbook} />
          )}
        />

        <Route path="/recipe/:slug" element={<RecipePage />} />

        <Route
          path="/shopping-list"
          element={requireOnboarding(<ShoppingListPage />)}
        />

        <Route
          path="/cook-now"
          element={requireOnboarding(<CookNowPage meals={meals} />)}
        />

        <Route path="/settings" element={<Navigate to="/plan" replace />} />
        <Route path="/guide" element={<TestersGuidePage />} />
        <Route path="/whats-new" element={<WhatsNewPage />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showTesterPrompt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              maxWidth: 400,
              width: "100%",
              background: "#1e293b",
              borderRadius: 20,
              padding: 24,
              border: "1px solid rgba(255,255,255,0.1)",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>
              🧪 Test Missions
            </h3>

            <p style={{ opacity: 0.7, marginBottom: 20, lineHeight: 1.5 }}>
              Want to help improve the app? Try a couple quick test missions and
              tell me what feels off.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowTesterPrompt(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "white",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Maybe Later
              </button>

              <button
                onClick={() => {
                  setShowTesterPrompt(false);
                  navigate("/guide");
                }}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  background: "#22c55e",
                  border: "none",
                  color: "#0f172a",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Let&apos;s Go
              </button>
            </div>
          </div>
        </div>
      )}

      {!hideBottomNav && <Navigation />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
          <AppContent />
        </ToastProvider>
    </ThemeProvider>
  );
}