import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  Leaf,
  Salad,
  Clock3,
  Plus,
  CalendarPlus,
  Flame,
} from "lucide-react";
import Card from "../components/Card";
import type { Meal, Effort } from "../core/types";
import { ALL_RECIPES, days } from "../core/data";
import { getCookbook } from "../core/cookbookStore";
import { t, getStoredLanguage, type LanguageCode } from "../i18n";

type RecipesPageProps = {
  recipes?: Meal[];
  onAddToWeek?: (meal: Meal, day: string) => void;
  onAddToCookbook: (recipe: Meal) => {
    ok: boolean;
    already?: boolean;
    reason?: string;
  };
};

const RECIPES_PAGE_STATE_KEY = "simple-dinners:recipes-page-state";

// =====================================================
// Builder: helpers
// =====================================================

function normalizeText(value?: string) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeTags(tags?: string[]) {
  return (tags ?? []).map((tag) => normalizeText(tag));
}

function hasTag(meal: Meal, tag: string) {
  return normalizeTags(meal.tags).includes(normalizeText(tag));
}

function getVisibleRecipeTags(recipe: Meal) {
  const hiddenTags = new Set([
    "quick",
    "normal",
    "big",
    "takeout",
    "grilling",
  ]);

  const seen = new Set<string>();

  return (recipe.tags ?? [])
    .map((tag) => String(tag || "").trim())
    .filter(Boolean)
    .filter((tag) => {
      const normalized = normalizeText(tag);

      if (hiddenTags.has(normalized)) return false;
      if (seen.has(normalized)) return false;

      seen.add(normalized);
      return true;
    });
}

function effortLabel(effort?: Effort | string) {
  const value = String(effort || "normal").trim().toLowerCase();

  if (value === "quick") return t("recipes.effort.quick");
  if (value === "big") return t("recipes.effort.big");
  if (value === "takeout") return t("recipes.effort.takeout");

  return t("recipes.effort.normal");
}

function normalizePhotoUrl(url?: string) {
  if (!url) return "";
  const trimmed = url.trim();

  if (trimmed.startsWith("/images/")) {
    return trimmed.replace(/\.(png|jpg|jpeg)$/i, ".jpg");
  }

  return trimmed;
}

// =====================================================
// Builder: page
// =====================================================

export default function RecipesPage({
  recipes,
  onAddToWeek,
  onAddToCookbook,
}: RecipesPageProps) {
  const navigate = useNavigate();
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
  // Builder: state
  // =====================================================

  const [query, setQuery] = useState("");
  const [effort, setEffort] = useState<"all" | Effort>("all");
  const [showCookbookOnly, setShowCookbookOnly] = useState(false);
  const [showVegetarianOnly, setshowVegetarianOnly] = useState(false);
  const [showSaladsOnly, setshowSaladsOnly] = useState(false);
  const [showGrillingOnly, setshowGrillingOnly] = useState(false);
  const [cookbook, setCookbook] = useState<Meal[]>(() => getCookbook() as Meal[]);
  const [justAddedSlug, setJustAddedSlug] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [dayPickerOpen, setDayPickerOpen] = useState(false);
  const [selectedMealForWeek, setSelectedMealForWeek] = useState<Meal | null>(
    null
  );
  const [hasRestoredState, setHasRestoredState] = useState(false);

  // =====================================================
  // Builder: recipes page state persistence
  // =====================================================

  function saveRecipesPageState(customScrollY?: number) {
    sessionStorage.setItem(
      RECIPES_PAGE_STATE_KEY,
      JSON.stringify({
        query,
        effort,
        showCookbookOnly,
        showVegetarianOnly,
        showSaladsOnly,
        showGrillingOnly,
        scrollY:
          typeof customScrollY === "number" ? customScrollY : window.scrollY,
      })
    );
  }

  function restoreRecipesPageState() {
    try {
      const raw = sessionStorage.getItem(RECIPES_PAGE_STATE_KEY);
      if (!raw) {
        setHasRestoredState(true);
        return;
      }

      const saved = JSON.parse(raw);

      if (typeof saved.query === "string") setQuery(saved.query);
      if (saved.effort) setEffort(saved.effort);

      if (typeof saved.showCookbookOnly === "boolean") {
        setShowCookbookOnly(saved.showCookbookOnly);
      }
      if (typeof saved.showVegetarianOnly === "boolean") {
        setshowVegetarianOnly(saved.showVegetarianOnly);
      }
      if (typeof saved.showSaladsOnly === "boolean") {
        setshowSaladsOnly(saved.showSaladsOnly);
      }
      if (typeof saved.showGrillingOnly === "boolean") {
        setshowGrillingOnly(saved.showGrillingOnly);
      }

      const scrollY = Number(saved.scrollY ?? 0);

      setTimeout(() => {
        window.scrollTo({ top: scrollY, behavior: "auto" });
      }, 0);
    } catch {
      // ignore bad saved state
    } finally {
      setHasRestoredState(true);
    }
  }

  // =====================================================
  // Builder: effects
  // =====================================================

  useEffect(() => {
    restoreRecipesPageState();
  }, []);

  useEffect(() => {
    if (!saveMessage) return;
    const t = window.setTimeout(() => setSaveMessage(""), 1800);
    return () => window.clearTimeout(t);
  }, [saveMessage]);

  useEffect(() => {
    if (!justAddedSlug) return;
    const t = window.setTimeout(() => setJustAddedSlug(null), 1200);
    return () => window.clearTimeout(t);
  }, [justAddedSlug]);

  useEffect(() => {
    if (!hasRestoredState) return;

    saveRecipesPageState();
  }, [
    hasRestoredState,
    query,
    effort,
    showCookbookOnly,
    showVegetarianOnly,
    showSaladsOnly,
    showGrillingOnly,
  ]);

  useEffect(() => {
    if (!hasRestoredState) return;

    const handleScroll = () => {
      saveRecipesPageState(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    hasRestoredState,
    query,
    effort,
    showCookbookOnly,
    showVegetarianOnly,
    showSaladsOnly,
    showGrillingOnly,
  ]);

  // =====================================================
  // Builder: cookbook data
  // =====================================================

  const cookbookKeys = useMemo(() => {
    return new Set(
      cookbook
        .map((recipe) =>
          String(recipe.slug || recipe.id || recipe.name || "")
            .trim()
            .toLowerCase()
        )
        .filter(Boolean)
    );
  }, [cookbook]);

  // =====================================================
  // Builder: merged recipe source
  // =====================================================

  const mergedRecipes = useMemo(() => {
    const source = recipes?.length ? recipes : ALL_RECIPES;
    const seen = new Set<string>();

    return [...source, ...cookbook].filter((recipe) => {
      const key = String(recipe.slug || recipe.id || recipe.name || "")
        .trim()
        .toLowerCase();

      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [recipes, cookbook]);

  // =====================================================
  // Builder: quick grouped stats
  // =====================================================

  const grillingCount = useMemo(() => {
    return mergedRecipes.filter((recipe) => hasTag(recipe, "grilling")).length;
  }, [mergedRecipes]);

  // =====================================================
  // Builder: filtering
  // =====================================================

  const filteredRecipes = useMemo(() => {
    const q = normalizeText(query);

    return mergedRecipes.filter((recipe) => {
      const searchableText = [
        recipe.name,
        recipe.slug,
        recipe.ingredients,
        recipe.instructions,
        recipe.notes,
        ...(recipe.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const recipeKey = String(recipe.slug || recipe.id || recipe.name || "")
        .trim()
        .toLowerCase();

      if (q && !searchableText.includes(q)) return false;
      if (effort !== "all" && recipe.effort !== effort) return false;
      if (showCookbookOnly && !cookbookKeys.has(recipeKey)) return false;
      if (showVegetarianOnly && !hasTag(recipe, "vegetarian")) return false;
      if (showSaladsOnly && !hasTag(recipe, "salad")) return false;
      if (showGrillingOnly && !hasTag(recipe, "grilling")) return false;

      return true;
    });
  }, [
    mergedRecipes,
    query,
    effort,
    showCookbookOnly,
    showVegetarianOnly,
    showSaladsOnly,
    showGrillingOnly,
    cookbookKeys,
  ]);

  function getRecipeDayLabel(day: string) {
    const labels: Record<string, string> = {
      Monday: t("recipes.days.monday"),
      Tuesday: t("recipes.days.tuesday"),
      Wednesday: t("recipes.days.wednesday"),
      Thursday: t("recipes.days.thursday"),
      Friday: t("recipes.days.friday"),
      Saturday: t("recipes.days.saturday"),
      Sunday: t("recipes.days.sunday"),
    };

    return labels[day] || day;
  }

  function getEffortFilterLabel(value: "all" | Effort) {
    if (value === "all") return t("recipes.allEfforts");
    if (value === "quick") return t("recipes.effort.quick");
    if (value === "normal") return t("recipes.effort.normal");
    if (value === "big") return t("recipes.effort.big");
    if (value === "takeout") return t("recipes.effort.takeout");

    return String(value);
  }

  // =====================================================
  // Builder: actions
  // =====================================================

  const handleOpenRecipe = (recipe: Meal) => {
    if (!recipe.slug) return;
    saveRecipesPageState();
    navigate(`/recipe/${recipe.slug}?from=%2Frecipes`);
  };

  const handleAddToCookbook = (recipe: Meal) => {
    saveRecipesPageState();

    const result = onAddToCookbook(recipe);
    const slug = String(recipe.slug || recipe.id || "").trim().toLowerCase();

    if (result.ok) {
      setCookbook((prev) => {
        const exists = prev.some(
          (r) =>
            String(r.slug || r.id || "")
              .trim()
              .toLowerCase() === slug
        );

        if (exists) return prev;
        return [...prev, recipe];
      });

      setJustAddedSlug(slug);
      localStorage.setItem("scrollToCookbook", slug);

      if (result.already) {
        setSaveMessage(t("recipes.alreadyInCookbook"));
      } else {
        setSaveMessage(t("recipes.savedToCookbook"));
      }

      return;
    }

    setSaveMessage(t("recipes.couldNotSaveRecipe"));
  };

  const handleOpenDayPicker = (recipe: Meal) => {
    saveRecipesPageState();
    setSelectedMealForWeek(recipe);
    setDayPickerOpen(true);
  };

  const handleSelectDay = (day: string) => {
    if (!selectedMealForWeek) return;

    saveRecipesPageState();

    if (onAddToWeek) {
      onAddToWeek(selectedMealForWeek, day);
    } else if (selectedMealForWeek.slug) {
      navigate(`/recipe/${selectedMealForWeek.slug}?from=%2Frecipes`);
    }

    setDayPickerOpen(false);
    setSelectedMealForWeek(null);
    setSaveMessage(`${t("recipes.addedTo")} ${getRecipeDayLabel(day)} ✓`);
  };

  const clearExtraFilters = () => {
    setShowCookbookOnly(false);
    setshowVegetarianOnly(false);
    setshowSaladsOnly(false);
    setshowGrillingOnly(false);
  };

  // =====================================================
  // Builder: shared styles
  // =====================================================

  const pageWrap: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const innerWrap: React.CSSProperties = {
    maxWidth: "1100px",
    width: "100%",
    padding: "0 20px 120px 20px",
    display: "grid",
    gap: 20,
  };

  const heroCard: React.CSSProperties = {
    overflow: "hidden",
  };

  const searchWrap: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 16px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  const searchInput: React.CSSProperties = {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "white",
    fontSize: 16,
    fontFamily: "inherit",
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 12,
    opacity: 0.55,
    fontWeight: 800,
    letterSpacing: 0.6,
  };

  const chipRow: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  };

  const chipBase: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.75)",
    fontWeight: 800,
    fontSize: 13,
    cursor: "pointer",
  };

  const statsRow: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 14,
    fontSize: 13,
    opacity: 0.75,
  };

  const statStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  };

  const statNumber: React.CSSProperties = {
    fontWeight: 900,
    color: "white",
    opacity: 1,
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 16,
  };

  const recipeCardStyle: React.CSSProperties = {
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  };

  const photoStyle: React.CSSProperties = {
    width: "100%",
    aspectRatio: "4 / 3",
    objectFit: "cover",
    display: "block",
    background: "rgba(255,255,255,0.05)",
    cursor: "pointer",
  };

  const bodyStyle: React.CSSProperties = {
    padding: 14,
    display: "grid",
    gap: 10,
    height: "100%",
  };

  const tagsWrap: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  };

  const tagStyle: React.CSSProperties = {
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.75)",
  };

  const grillingTagStyle: React.CSSProperties = {
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    background: "rgba(250,204,21,0.15)",
    border: "1px solid rgba(250,204,21,0.35)",
    color: "#fde68a",
  };

  const btnRow: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: "auto",
  };

  const btnStyle: React.CSSProperties = {
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "white",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 800,
    fontSize: 13,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };

  // =====================================================
  // Builder: render
  // =====================================================

  return (
    <div style={pageWrap}>
      <div style={innerWrap}>
        <Card style={heroCard}>
          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <BookOpen size={22} />
                <h1 style={{ margin: 0, fontSize: 30, fontWeight: 1000 }}>
                  {t("recipes.title")}
                </h1>
              </div>

              <p style={{ margin: 0, fontSize: 14, opacity: 0.65, lineHeight: 1.5 }}>
                {t("recipes.subtitle")}
              </p>
            </div>

            <div style={searchWrap}>
              <Search size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("recipes.searchPlaceholder")}
                style={searchInput}
              />
            </div>

            <div style={sectionLabel}>{t("recipes.effortLabel").toUpperCase()}</div>

            <div style={chipRow}>
              {(["all", "quick", "normal", "big", "takeout"] as const).map(
                (value) => {
                  const active = effort === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setEffort(value as "all" | Effort)}
                      style={{
                        ...chipBase,
                        background: active
                          ? "rgba(34,197,94,0.12)"
                          : chipBase.background,
                        border: active
                          ? "1px solid rgba(34,197,94,0.45)"
                          : chipBase.border,
                        color: active ? "#86efac" : chipBase.color,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Clock3 size={14} />
                        {getEffortFilterLabel(value)}
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            <div style={sectionLabel}>{t("recipes.categoriesLabel").toUpperCase()}</div>

            <div style={chipRow}>
              <button
                type="button"
                onClick={() => setShowCookbookOnly((v) => !v)}
                style={{
                  ...chipBase,
                  background: showCookbookOnly
                    ? "rgba(34,197,94,0.12)"
                    : chipBase.background,
                  border: showCookbookOnly
                    ? "1px solid rgba(34,197,94,0.45)"
                    : chipBase.border,
                  color: showCookbookOnly ? "#86efac" : chipBase.color,
                }}
              >
                <span
                  style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  <BookOpen size={14} />
                  {t("recipes.inCookbook")}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setshowVegetarianOnly((v) => !v)}
                style={{
                  ...chipBase,
                  background: showVegetarianOnly
                    ? "rgba(34,197,94,0.12)"
                    : chipBase.background,
                  border: showVegetarianOnly
                    ? "1px solid rgba(34,197,94,0.45)"
                    : chipBase.border,
                  color: showVegetarianOnly ? "#86efac" : chipBase.color,
                }}
              >
                <span
                  style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  <Leaf size={14} />
                  {t("recipes.vegetarian")}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setshowSaladsOnly((v) => !v)}
                style={{
                  ...chipBase,
                  background: showSaladsOnly
                    ? "rgba(34,197,94,0.12)"
                    : chipBase.background,
                  border: showSaladsOnly
                    ? "1px solid rgba(34,197,94,0.45)"
                    : chipBase.border,
                  color: showSaladsOnly ? "#86efac" : chipBase.color,
                }}
              >
                <span
                  style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  <Salad size={14} />
                  {t("recipes.salads")}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setshowGrillingOnly((v) => !v)}
                style={{
                  ...chipBase,
                  background: showGrillingOnly
                    ? "rgba(250,204,21,0.15)"
                    : chipBase.background,
                  border: showGrillingOnly
                    ? "1px solid rgba(250,204,21,0.35)"
                    : chipBase.border,
                  color: showGrillingOnly ? "#fde68a" : chipBase.color,
                }}
              >
                <span
                  style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  <Flame size={14} />
                  {t("recipes.grilling")}
                </span>
              </button>

              <button
                type="button"
                onClick={clearExtraFilters}
                style={{
                  ...chipBase,
                  background: "transparent",
                  border: "1px dashed rgba(255,255,255,0.25)",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {t("recipes.clearExtras")}
              </button>
            </div>

            <div style={statsRow}>
              <span style={statStyle}>
                <span style={statNumber}>{mergedRecipes.length}</span> {t("recipes.stats.total")}
              </span>
              <span style={statStyle}>
                <span style={statNumber}>{filteredRecipes.length}</span> {t("recipes.stats.showing")}
              </span>
              <span style={statStyle}>
                <span style={statNumber}>{cookbook.length}</span> {t("recipes.stats.inCookbook")}
              </span>
              <span style={statStyle}>
                <span style={statNumber}>{grillingCount}</span> {t("recipes.stats.grilling")}
              </span>
            </div>

            {saveMessage && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 14,
                  background: "rgba(34,197,94,0.12)",
                  border: "1px solid rgba(34,197,94,0.35)",
                  color: "#86efac",
                  fontSize: 13,
                  fontWeight: 800,
                  width: "fit-content",
                }}
              >
                {saveMessage}
              </div>
            )}
          </div>
        </Card>

        <div style={gridStyle}>
          {filteredRecipes.map((recipe) => {
            const recipeKey = String(recipe.slug || recipe.id || recipe.name || "")
              .trim()
              .toLowerCase();

            const isSaved = cookbookKeys.has(recipeKey);
            const recipePhotoUrl = normalizePhotoUrl(recipe.photoUrl);
            const isGrilling = hasTag(recipe, "grilling");

            return (
              <Card key={recipeKey} style={recipeCardStyle}>
                {recipePhotoUrl ? (
                  <img
                    src={recipePhotoUrl}
                    alt={recipe.name}
                    style={photoStyle}
                    onClick={() => handleOpenRecipe(recipe)}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.style.display = "none";
                    }}
                  />
                ) : (
                  <div style={photoStyle} onClick={() => handleOpenRecipe(recipe)} />
                )}

                <div style={bodyStyle}>
                  <div style={{ display: "grid", gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
                      {recipe.name}
                    </h3>

                    <div style={tagsWrap}>
                      <span style={tagStyle}>{effortLabel(recipe.effort)}</span>

                      {isGrilling && (
                        <span style={grillingTagStyle}>🔥 {t("recipes.grilling")}</span>
                      )}

                      {getVisibleRecipeTags(recipe)
  .slice(0, 4)
  .map((tag) => (
    <span key={tag} style={tagStyle}>
      {tag}
    </span>
  ))}
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        opacity: 0.72,
                        lineHeight: 1.45,
                        minHeight: 38,
                      }}
                    >
                      {recipe.notes || t("recipes.defaultNote")}
                    </p>
                  </div>

                  <div style={btnRow}>
                    <button
                      type="button"
                      style={btnStyle}
                      onClick={() => handleOpenRecipe(recipe)}
                    >
                      {t("recipes.openRecipe")}
                    </button>

                    <button
                      type="button"
                      style={{
                        ...btnStyle,
                        opacity: isSaved ? 0.7 : 1,
                        transform:
                          justAddedSlug === recipeKey ? "scale(1.05)" : "scale(1)",
                        border:
                          isSaved || justAddedSlug === recipeKey
                            ? "1px solid rgba(34,197,94,0.45)"
                            : btnStyle.border,
                        background:
                          isSaved || justAddedSlug === recipeKey
                            ? "rgba(34,197,94,0.12)"
                            : btnStyle.background,
                        color:
                          isSaved || justAddedSlug === recipeKey
                            ? "#86efac"
                            : "white",
                        transition: "all 0.18s ease",
                        cursor: isSaved ? "default" : "pointer",
                      }}
                      onClick={() => handleAddToCookbook(recipe)}
                      disabled={isSaved}
                    >
                      <Plus size={14} />
                      {isSaved || justAddedSlug === recipeKey
                        ? t("recipes.savedCheck")
                        : t("recipes.addToCookbook")}
                    </button>

                    <button
                      type="button"
                      style={btnStyle}
                      onClick={() => handleOpenDayPicker(recipe)}
                    >
                      <CalendarPlus size={14} />
                      {t("recipes.addToWeek")}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {!filteredRecipes.length && (
          <Card>
            <div
              style={{
                textAlign: "center",
                padding: "24px 12px",
                opacity: 0.7,
                display: "grid",
                gap: 10,
              }}
            >
              <div>{t("recipes.noRecipesFound")}</div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setEffort("all");
                    clearExtraFilters();
                  }}
                  style={btnStyle}
                >
                  {t("recipes.resetFilters")}
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {dayPickerOpen && selectedMealForWeek && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => {
            setDayPickerOpen(false);
            setSelectedMealForWeek(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#1e293b",
              borderRadius: 20,
              padding: 20,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
            }}
          >
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: 22,
                fontWeight: 900,
                color: "#f8fafc",
              }}
            >
              {t("recipes.addToWeek")}
            </h3>

            <p
              style={{
                margin: "0 0 18px 0",
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.5,
              }}
            >
              {t("recipes.chooseDayPrefix")} <strong>{selectedMealForWeek.name}</strong>. {t("recipes.chooseDaySuffix")}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => handleSelectDay(day)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.06)",
                    color: "#fff",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {getRecipeDayLabel(day)}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setDayPickerOpen(false);
                setSelectedMealForWeek(null);
              }}
              style={{
                marginTop: 14,
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                border: "none",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}