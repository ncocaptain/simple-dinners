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
import OnboardingPage from "./pages/OnboardingPage";
import RecipePage from "./pages/RecipePage";
import HomePage from "./pages/HomePage";
import TestersGuidePage from "./pages/TestersGuidePage";
import FeedbackForm from "./pages/FeedbackForm";
import RecipesPage from "./pages/RecipesPage";
import { ToastProvider, useToast } from "./components/Toast";
import { ThemeProvider } from "./theme";
import {
  Home,
  Calendar,
  BookOpen,
  BookOpenText,
  ShoppingCart,
  Settings,
} from "lucide-react";

// Core
import type { Effort, Meal, PantryItem, Preferences } from "./core/types";
import { generatePlan } from "./core/planner";
import { days, ALL_RECIPES } from "./core/data";
import {
  getCookbook,
  setCookbook as persistCookbook,
} from "./core/cookbookStore";
import { hasCompletedOnboarding } from "./core/onboardingStore";

type CookbookRecipe = Meal & {
  sourceUrl?: string;
};

const APP_VERSION = "22.0.7";

// =====================================================
// Builder: helpers
// =====================================================

const mealImageUrl = (name?: string) => {
  const q = encodeURIComponent((name || "cooking dinner").trim());
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80&sig=1&meal=${q}`;
};

function normalizePhotoUrl(url?: string) {
  if (!url) return "";

  const trimmed = String(url).trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("/images/")) {
    return trimmed.replace(/\.(png|jpe?g)$/i, ".webp");
  }

  return trimmed;
}

function normalizeMealKey(value?: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function findRecipeInSources(
  meal: Meal | undefined,
  cookbook: CookbookRecipe[]
): Meal | null {
  if (!meal) return null;

  const slugKey = normalizeMealKey(meal.slug ?? meal.id);
  const nameKey = normalizeMealKey(meal.name);

  const builtInMatch =
    ALL_RECIPES.find((recipe) => {
      const recipeSlug = normalizeMealKey(recipe.slug ?? recipe.id);
      const recipeName = normalizeMealKey(recipe.name);
      return (
        (slugKey && recipeSlug === slugKey) ||
        (nameKey && recipeName === nameKey)
      );
    }) ?? null;

  if (builtInMatch) return builtInMatch;

  const cookbookMatch =
    cookbook.find((recipe) => {
      const recipeSlug = normalizeMealKey(recipe.slug ?? recipe.id);
      const recipeName = normalizeMealKey(recipe.name);
      return (
        (slugKey && recipeSlug === slugKey) ||
        (nameKey && recipeName === nameKey)
      );
    }) ?? null;

  return cookbookMatch ?? null;
}

function resolveMeal(meal: Meal | undefined, cookbook: CookbookRecipe[]): Meal | undefined {
  if (!meal) return meal;

  const latest = findRecipeInSources(meal, cookbook);

  const merged: Meal = latest
    ? {
        ...meal,
        ...latest,
      }
    : {
        ...meal,
      };

  return {
    ...merged,
    photoUrl: normalizePhotoUrl(merged.photoUrl) || mealImageUrl(merged.name),
  };
}

function migrateSavedMeals(
  rawMeals: Record<string, Meal>,
  cookbook: CookbookRecipe[]
): Record<string, Meal> {
  const next: Record<string, Meal> = {};

  for (const day of days) {
    const meal = rawMeals?.[day];
    if (!meal) continue;

    const repaired = resolveMeal(meal, cookbook);
    if (repaired) next[day] = repaired;
  }

  return next;
}

// =====================================================
// Builder: adaptive bottom inset
// =====================================================

function getAdaptiveBottomInset() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return 20;
  }

  const ua = navigator.userAgent.toLowerCase();
  const isSamsung = ua.includes("samsung");

  // Samsung needs more breathing room
  return isSamsung ? 26 : 16;
}

// =====================================================
// Builder: back handler
// =====================================================

function BackHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let listener: { remove: () => Promise<void> } | undefined;

    const setup = async () => {
      try {
        listener = await CapacitorApp.addListener("backButton", () => {
          if (window.history.length > 1) {
            window.history.back();
            return;
          }

          if (location.pathname !== "/") {
            navigate("/");
          }
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

// =====================================================
// Builder: navigation
// =====================================================

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const adaptiveInset = getAdaptiveBottomInset();

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
        left: 0,
        right: 0,
        bottom: `calc(env(safe-area-inset-bottom, 0px) + ${adaptiveInset}px)`,
        zIndex: 1000,
        pointerEvents: "none",
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
          boxShadow: "0 16px 40px -8px rgba(0,0,0,0.6)",
          pointerEvents: "auto",
        }}
      >
        {navItem("/", Home, "Home")}
        {navItem("/week", Calendar, "Week")}
        {navItem("/cookbook", BookOpen, "Cook")}
        {navItem("/shopping-list", ShoppingCart, "Shop")}
        {navItem("/plan", Settings, "Plan")}
        {navItem("/recipes", BookOpenText, "Recipes")}
      </div>
    </div>
  );
}

// =====================================================
// Builder: app content
// =====================================================

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const hideBottomNav = location.pathname.startsWith("/recipe/");
  const [showTesterPrompt, setShowTesterPrompt] = useState(false);
  const toastApi: any = useToast();
  const toast = toastApi.toast ?? toastApi;

  // =====================================================
  // Builder: state
  // =====================================================

  const [cookbook, setCookbook] = useState<CookbookRecipe[]>(() => getCookbook());

  const [meals, setMeals] = useState<Record<string, Meal>>(() => {
    try {
      const savedMeals = JSON.parse(localStorage.getItem("meals") || "{}");
      const savedCookbook = getCookbook();
      return migrateSavedMeals(savedMeals, savedCookbook);
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

  // =====================================================
  // Builder: update checks
  // =====================================================

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


  // =====================================================
  // Builder: repair meals when cookbook/library changes
  // =====================================================

  useEffect(() => {
    setMeals((prev) => {
      const repaired = migrateSavedMeals(prev, cookbook);

      const prevJson = JSON.stringify(prev);
      const repairedJson = JSON.stringify(repaired);

      return prevJson === repairedJson ? prev : repaired;
    });
  }, [cookbook]);

  // =====================================================
  // Builder: persistence
  // =====================================================

  useEffect(() => {
    const normalizedMeals = migrateSavedMeals(meals, cookbook);

    localStorage.setItem("meals", JSON.stringify(normalizedMeals));
    localStorage.setItem("daySettings", JSON.stringify(daySettings));
    localStorage.setItem("pantry", JSON.stringify(pantry));
    localStorage.setItem("lockedDays", JSON.stringify(lockedDays));
    localStorage.setItem("app-version", APP_VERSION);
    persistCookbook(cookbook);
  }, [meals, cookbook, daySettings, pantry, lockedDays]);

  useEffect(() => {
    localStorage.setItem("prefs", JSON.stringify(prefs));
  }, [prefs]);

  // =====================================================
  // Builder: cookbook actions
  // =====================================================

  const handleAddToCookbook = (recipe: CookbookRecipe) => {
    const slug = (recipe?.slug ?? recipe?.id ?? "").toString().trim();

    if (!slug) {
      return { ok: false as const, reason: "missing-slug" as const };
    }

    const exists = cookbook.some(
      (r) => normalizeMealKey(r.slug ?? r.id) === normalizeMealKey(slug)
    );

    if (exists) {
      return { ok: true as const, already: true as const };
    }

    const normalized: CookbookRecipe = {
      ...recipe,
      id: recipe?.id ?? slug,
      slug,
      name: String(recipe?.name ?? "").trim(),
      effort: recipe?.effort ?? "normal",
      ingredients: String(recipe?.ingredients ?? ""),
      instructions: String(recipe?.instructions ?? ""),
      photoUrl: normalizePhotoUrl(String(recipe?.photoUrl ?? "")),
      notes: String((recipe as any)?.notes ?? ""),
      tags: Array.isArray((recipe as any)?.tags) ? (recipe as any).tags : [],
      sourceUrl: String(recipe?.sourceUrl ?? ""),
    };

    setCookbook((prev) => [...prev, normalized]);

    return { ok: true as const, already: false as const };
  };

  const addDayToCookbook = (day: string) => {
    const meal = meals[day];
    if (!meal?.name) return;
    handleAddToCookbook(meal as CookbookRecipe);
  };

  // =====================================================
  // Builder: planner actions
  // =====================================================

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

    const hydratedMeals: Record<string, Meal> = {};

    for (const d of days) {
      const meal = next[d];
      if (!meal) continue;

      hydratedMeals[d] = resolveMeal(meal, cookbook) ?? {
        ...meal,
        photoUrl: normalizePhotoUrl(meal.photoUrl) || mealImageUrl(meal.name),
      };
    }

    setMeals(hydratedMeals);
    navigate("/week");
  };

  const requireOnboarding = (element: React.ReactNode) =>
    hasCompletedOnboarding() ? element : <Navigate to="/onboarding" replace />;

  const adaptiveInset = getAdaptiveBottomInset();

  return (
    <div
  style={{
    minHeight: "100vh",
    paddingBottom: hideBottomNav
  ? "24px"
  : `calc(120px + env(safe-area-inset-bottom, 0px) + ${adaptiveInset}px)`,
  }}
>
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

        <Route
          path="/recipe/:slug"
          element={<RecipePage onAddToCookbook={handleAddToCookbook} />}
        />

        <Route
          path="/shopping-list"
          element={requireOnboarding(<ShoppingListPage />)}
        />

        <Route path="/settings" element={<Navigate to="/plan" replace />} />
        <Route path="/guide" element={<TestersGuidePage />} />
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/feedback" element={<FeedbackForm />} />

        <Route
  path="/recipes"
  element={
    <RecipesPage
      onAddToCookbook={handleAddToCookbook}
      onAddToWeek={(meal: Meal, day: string) => {
        const resolvedMeal = resolveMeal(meal, cookbook) ?? {
          ...meal,
          photoUrl:
            normalizePhotoUrl(meal.photoUrl) || mealImageUrl(meal.name),
        };

        setMeals((prev) => ({
          ...prev,
          [day]: resolvedMeal,
        }));

        navigate("/week");
      }}
    />
  }
/>

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