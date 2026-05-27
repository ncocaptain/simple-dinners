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
import UpdateBanner from "./components/UpdateBanner";

// Core
import type {
  Effort,
  Meal,
  PantryItem,
  Preferences,
  PlannedDay,
} from "./core/types";
import { generatePlan } from "./core/planner";
import { days, ALL_RECIPES } from "./core/data";
import {
  getCookbook,
  setCookbook as persistCookbook,
} from "./core/cookbookStore";
import { hasCompletedOnboarding } from "./core/onboardingStore";
import { t, getStoredLanguage, type LanguageCode } from "./i18n";
import { Capacitor } from "@capacitor/core";

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

  const trimmed = url.trim();

  if (trimmed.startsWith("/images/")) {
    const extension = Capacitor.getPlatform() === "android" ? ".webp" : ".jpg";
    return trimmed.replace(/\.(png|jpg|jpeg|webp)$/i, extension);
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

function resolveMeal(
  meal: Meal | undefined,
  cookbook: CookbookRecipe[]
): Meal | undefined {
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

function normalizePlannedDay(
  value: any,
  cookbook: CookbookRecipe[]
): PlannedDay {
  if (!value) {
    return { mode: "planned", meal: null };
  }

  if (
    typeof value === "object" &&
    "mode" in value &&
    "meal" in value
  ) {
    return {
      mode:
        value.mode === "leftovers" || value.mode === "freezer"
          ? value.mode
          : "planned",
      meal:
        value.mode === "planned"
          ? resolveMeal(value.meal, cookbook) ?? null
          : null,
    };
  }

  const repaired = resolveMeal(value as Meal, cookbook);
  return {
    mode: "planned",
    meal: repaired ?? null,
  };
}

function migrateSavedMeals(
  rawMeals: Record<string, any>,
  cookbook: CookbookRecipe[]
): Record<string, PlannedDay> {
  const next: Record<string, PlannedDay> = {};

  for (const day of days) {
    next[day] = normalizePlannedDay(rawMeals?.[day], cookbook);
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
        {navItem("/", Home, t("nav.home").toUpperCase())}
{navItem("/week", Calendar, t("nav.week").toUpperCase())}
{navItem("/cookbook", BookOpen, t("nav.cook").toUpperCase())}
{navItem("/shopping-list", ShoppingCart, t("nav.shop").toUpperCase())}
{navItem("/plan", Settings, t("nav.plan").toUpperCase())}
{navItem("/recipes", BookOpenText, t("nav.recipes").toUpperCase())}
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

  const [meals, setMeals] = useState<Record<string, PlannedDay>>(() => {
    try {
      const savedMeals = JSON.parse(localStorage.getItem("meals") || "{}");
      const savedCookbook = getCookbook();
      return migrateSavedMeals(savedMeals, savedCookbook);
    } catch {
      return Object.fromEntries(
        days.map((day) => [day, { mode: "planned", meal: null }])
      ) as Record<string, PlannedDay>;
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

  const [language, setLanguage] = useState<LanguageCode>(() => getStoredLanguage());
  void language;

useEffect(() => {
  const handleLanguageChange = () => {
    setLanguage(getStoredLanguage());
  };

  window.addEventListener("simple-dinners:language-changed", handleLanguageChange);

  return () => {
    window.removeEventListener("simple-dinners:language-changed", handleLanguageChange);
  };
}, []);

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

  useEffect(() => {
  const refreshPantry = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("pantry") || "[]");
      setPantry(Array.isArray(saved) ? saved : []);
    } catch {
      setPantry([]);
    }
  };

  window.addEventListener("simple-dinners:pantry-updated", refreshPantry);

  return () => {
    window.removeEventListener("simple-dinners:pantry-updated", refreshPantry);
  };
}, []);

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
    const meal = meals[day]?.meal;
    if (!meal?.name) return;
    handleAddToCookbook(meal as CookbookRecipe);
  };

  // =====================================================
  // Builder: planner actions
  // =====================================================

  const generateDinnerPlan = (force = false) => {
    const lockedMeals = Object.fromEntries(
      days.map((d) => {
        const dayPlan = meals[d];

        if (lockedDays[d] && dayPlan?.mode === "planned" && dayPlan?.meal) {
          return [d, dayPlan.meal];
        }

        return [d, null];
      })
    ) as Partial<Record<(typeof days)[number], Meal | null>>;

    const next = generatePlan({
      cookbook,
      pantry: pantry.map((item) => item.name),
      daySettings,
      lockedMeals: force ? lockedMeals : lockedMeals,
      preferences: prefs,
    });

    const hydratedMeals: Record<string, PlannedDay> = {} as Record<
      string,
      PlannedDay
    >;

    for (const d of days) {
      const existing = meals[d];

      if (lockedDays[d] && existing) {
        hydratedMeals[d] = existing;
        continue;
      }

      const meal = next[d];

      hydratedMeals[d] = {
        mode: "planned",
        meal: meal
          ? resolveMeal(meal, cookbook) ?? {
              ...meal,
              photoUrl:
                normalizePhotoUrl(meal.photoUrl) || mealImageUrl(meal.name),
            }
          : null,
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
      minHeight: "100dvh",
      background:
        "linear-gradient(180deg, #050505 0%, #07111f 45%, #06111f 100%)",
      color: "#f8fafc",
      paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)",
      paddingBottom: hideBottomNav
        ? "calc(24px + env(safe-area-inset-bottom, 0px))"
        : `calc(120px + env(safe-area-inset-bottom, 0px) + ${adaptiveInset}px)`,
      overflowX: "hidden",
    }}
  >
      <BackHandler />
      <UpdateBanner />

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
          {t("app.tagline").toUpperCase()}
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
            <CookbookPage
  cookbook={cookbook}
  setCookbook={setCookbook}
  onAddToWeek={(recipe, day) => {
    setMeals((prev) => ({
      ...prev,
      [day]: {
        mode: "planned",
        meal: recipe,
      },
    }));
  }}
/>
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
                  [day]: {
                    mode: "planned",
                    meal: resolvedMeal,
                  },
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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <div
  style={{
    minHeight: "100dvh",
    background:
      "linear-gradient(180deg, #050505 0%, #07111f 45%, #06111f 100%)",
    opacity: visible ? 1 : 0,
    transition: "opacity 300ms ease",
  }}
>
          <AppContent />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}