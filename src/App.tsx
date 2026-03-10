import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import WeekPage from "./pages/WeekPage";
import CookbookPage from "./pages/CookbookPage";
import PlanPage from "./pages/PlanPage";
import TakeoutSettingsPage from "./pages/TakeoutSettingsPage";
import ShoppingListPage from "./pages/ShoppingListPage";
import CookNowPage from "./pages/CookNowPage";
import OnboardingPage from "./pages/OnboardingPage";
import RecipePage from "./pages/RecipePage";

import { ToastProvider } from "./components/Toast";
import { ThemeProvider } from "./theme";

import type { Effort, Meal, PantryItem, Preferences } from "./core/types";
import { generatePlan } from "./core/planner";
import { days } from "./core/data";
import {
  getCookbook,
  setCookbook as persistCookbook,
  addToCookbook,
} from "./core/cookbookStore";
import { hasCompletedOnboarding } from "./core/onboardingStore";
import HomePage from "./pages/HomePage";

type Day = (typeof days)[number];

type CookbookEntry = Meal & {
  id: string;
  slug?: string;
  favorite?: boolean;
  createdAt?: number;
  updatedAt?: number;
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

export function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function mealImageUrl(name?: string) {
  const q = encodeURIComponent((name || "cooking dinner").trim());
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80&sig=1&meal=${q}`;
}

export default function App() {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const [cookbook, setCookbook] = useState<CookbookEntry[]>(() => {
    const raw = getCookbook() as any[];
    const now = Date.now();

    return (Array.isArray(raw) ? raw : []).map((r: any) => {
      const id = String(
        r?.id ?? r?.slug ?? r?.name ?? Math.random().toString(36).slice(2)
      );

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
      const saved = JSON.parse(
        localStorage.getItem("meals") || "{}"
      ) as Partial<Record<Day, Meal>>;

      return { ...EMPTY_WEEK, ...saved };
    } catch {
      return EMPTY_WEEK;
    }
  });

  const defaultDaySettings = useMemo(
    () =>
      Object.fromEntries(days.map((d) => [d, "normal"])) as Record<Day, Effort>,
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

      if (
        Array.isArray(parsed) &&
        parsed.length &&
        typeof parsed[0] === "object" &&
        parsed[0] &&
        "name" in parsed[0]
      ) {
        return parsed as PantryItem[];
      }

      if (
        Array.isArray(parsed) &&
        (parsed.length === 0 || typeof parsed[0] === "string")
      ) {
        return (parsed as string[]).map((name) => ({
          id: makeId(),
          name,
          createdAt: Date.now(),
        }));
      }

      if (typeof parsed === "string") {
        const tokens = parsed
          .split(/[\n,]/g)
          .map((t) => t.trim())
          .filter(Boolean);

        return tokens.map((name) => ({
          id: makeId(),
          name,
          createdAt: Date.now(),
        }));
      }

      return [];
    } catch {
      return [];
    }
  });

  const [prefs] = useState<Preferences>(() => {
    try {
      const saved = localStorage.getItem("prefs");
      return saved ? JSON.parse(saved) : { vegetarian: false, allergens: [] };
    } catch {
      return { vegetarian: false, allergens: [] };
    }
  });

  const [dietaryNotes, setDietaryNotes] = useState<string>(
    () => localStorage.getItem("dietaryNotes") || ""
  );

  const [vegetarian, setVegetarian] = useState<boolean>(
    () => localStorage.getItem("vegetarian") === "true"
  );

  const [lockedDays, setLockedDays] = useState<Record<Day, boolean>>(() => {
    try {
      const saved = localStorage.getItem("lockedDays");
      return saved ? JSON.parse(saved) : EMPTY_LOCKS;
    } catch {
      return EMPTY_LOCKS;
    }
  });

  const effectivePrefs: Preferences = useMemo(
    () => ({
      ...prefs,
      vegetarian,
    }),
    [prefs, vegetarian]
  );

  useEffect(() => {
    localStorage.setItem("meals", JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem("daySettings", JSON.stringify(daySettings));
  }, [daySettings]);

  useEffect(() => {
    persistCookbook(cookbook as any);
  }, [cookbook]);

  useEffect(() => {
    localStorage.setItem("dietaryNotes", dietaryNotes);
  }, [dietaryNotes]);

  useEffect(() => {
    localStorage.setItem("vegetarian", String(vegetarian));
  }, [vegetarian]);

  useEffect(() => {
    localStorage.setItem("pantry", JSON.stringify(pantry));
  }, [pantry]);

  useEffect(() => {
    localStorage.setItem("lockedDays", JSON.stringify(lockedDays));
  }, [lockedDays]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const addDayToCookbook = (day: Day) => {
    const meal = meals[day];
    if (!meal?.name?.trim()) return;

    const res = addToCookbook(meal);

    setCookbook(getCookbook());

    if (res.ok) {
      const slug = (meal.slug ?? meal.id ?? meal.name).toString().trim();

      setMeals((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          slug,
          id: prev[day].id ?? slug,
        },
      }));
    }
  };

  const generateDinnerPlan = (force = false) => {
    const seedMeals: Record<Day, Meal> = force
      ? (Object.fromEntries(
          days.map((d) => [d, lockedDays[d] ? meals[d] : { ...EMPTY_MEAL }])
        ) as Record<Day, Meal>)
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
      if (!meal) continue;

      if (!meal.photoUrl) {
        withPhotos[d] = {
          ...meal,
          photoUrl: mealImageUrl(meal.name || "dinner"),
        };
      }
    }

    setMeals(withPhotos);
    navigate("/week");
  };

  const requireOnboarding = (element: React.ReactNode) => {
    return hasCompletedOnboarding() ? (
      element
    ) : (
      <Navigate to="/onboarding" replace />
    );
  };

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

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="mainCard">
          <div
            style={{
              padding: "12px 12px 16px",
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
                <h1
                  className="heroTitle"
                  style={{ margin: 0, fontSize: 32, fontWeight: 1000 }}
                >
                  Simple Dinners
                </h1>

                <button
  role="menuitem"
  onClick={() => {
    navigate("/");
    setMenuOpen(false);
  }}
  style={menuItemStyle}
>
  Home
  <div style={menuSubStyle}>Tonight’s dinner and week status</div>
</button>

<div style={dividerStyle} />
              </div>

              <div
  ref={menuRef}
  style={{
    position: "relative",
    marginTop: 6,
    alignSelf: "flex-start",
  }}
>
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
                    <span
                      style={{
                        width: 18,
                        height: 2,
                        background: "white",
                        borderRadius: 2,
                      }}
                    />
                    <span
                      style={{
                        width: 18,
                        height: 2,
                        background: "white",
                        borderRadius: 2,
                      }}
                    />
                    <span
                      style={{
                        width: 18,
                        height: 2,
                        background: "white",
                        borderRadius: 2,
                      }}
                    />
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
    navigate("/");
    setMenuOpen(false);
  }}
  style={menuItemStyle}
>
  Home
  <div style={menuSubStyle}>Tonight’s dinner and week status</div>
</button>

<div style={dividerStyle} />
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
                        navigate("/cook-now");
                        setMenuOpen(false);
                      }}
                      style={menuItemStyle}
                    >
                      🍳 Cook Now
                      <div style={menuSubStyle}>
                        See what you can cook right now
                      </div>
                    </button>

                    <div style={dividerStyle} />

                    <button
                      role="menuitem"
                      onClick={() => {
                        const confirmReplace = window.confirm(
                          "Replace this week’s meals with a new plan?"
                        );
                        if (confirmReplace) {
                          generateDinnerPlan(true);
                        }
                        setMenuOpen(false);
                      }}
                      style={{
                        ...menuItemStyle,
                        color: "rgba(255, 120, 120, 0.95)",
                      }}
                    >
                      Regenerate Week
                      <div style={menuSubStyle}>Replace current meals</div>
                    </button>

                    <div style={dividerStyle} />

                    <button
                      role="menuitem"
                      onClick={() => {
                        localStorage.removeItem("sd-onboarding-complete");
                        navigate("/onboarding");
                        setMenuOpen(false);
                      }}
                      style={menuItemStyle}
                    >
                      Restart Onboarding
                      <div style={menuSubStyle}>Run first-time setup again</div>
                    </button>
                  </div>
                )}
              </div>
            </header>

            <Routes>
              <Route
  path="/"
  element={
    hasCompletedOnboarding() ? (
      <HomePage meals={meals} />
    ) : (
      <Navigate to="/onboarding" replace />
    )
  }
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
                    vegetarian={vegetarian}
                    setVegetarian={setVegetarian}
                    generateDinnerPlan={generateDinnerPlan}
                    dietaryNotes={dietaryNotes}
                    setDietaryNotes={setDietaryNotes}
                  />
                )}
              />

              <Route
                path="/week"
                element={requireOnboarding(
                  <WeekPage
                    meals={meals}
                    setMeals={setMeals}
                    addDayToCookbook={addDayToCookbook}
                    generateDinnerPlan={generateDinnerPlan}
                    daySettings={daySettings}
                    setDaySettings={setDaySettings}
                    lockedDays={lockedDays}
                    setLockedDays={setLockedDays}
                  />
                )}
              />

              <Route
                path="/cookbook"
                element={requireOnboarding(
                  <CookbookPage
                    setMeals={setMeals}
                    cookbook={cookbook}
                    setCookbook={setCookbook}
                    prefs={effectivePrefs}
                  />
                )}
              />

              <Route
                path="/recipe/:slug"
                element={<RecipePage setCookbook={setCookbook} />}
              />

              <Route path="/shopping-list" element={<ShoppingListPage />} />

              <Route
                path="/cook-now"
                element={<CookNowPage pantry={pantry} />}
              />

              <Route
                path="/takeout-settings"
                element={<TakeoutSettingsPage />}
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}