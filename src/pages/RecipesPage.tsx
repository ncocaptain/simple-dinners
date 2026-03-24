import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  Leaf,
  Salad,
  Clock3,
  Plus,
  CalendarPlus,
} from "lucide-react";
import Card from "../components/Card";
import type { Meal, Effort } from "../core/types";
import { ALL_RECIPES } from "../core/data";
import { getCookbook, addToCookbook } from "../core/cookbookStore";

type RecipesPageProps = {
  recipes?: Meal[];
  onAddToWeek?: (meal: Meal) => void;
};

function normalizeText(value?: string) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeTags(tags?: string[]) {
  return (tags ?? []).map((tag) => normalizeText(tag));
}

function hasTag(meal: Meal, tag: string) {
  return normalizeTags(meal.tags).includes(normalizeText(tag));
}

function effortLabel(effort?: Effort | string) {
  if (!effort) return "Normal";
  const value = String(effort);
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function RecipesPage({
  recipes,
  onAddToWeek,
}: RecipesPageProps) {
  const navigate = useNavigate();

  // =====================================================
  // Builder: state
  // =====================================================

  const [query, setQuery] = useState("");
  const [effort, setEffort] = useState<"all" | Effort>("all");
  const [showCookbookOnly, setShowCookbookOnly] = useState(false);
  const [showVegetarianOnly, setShowVegetarianOnly] = useState(false);
  const [showSaladsOnly, setShowSaladsOnly] = useState(false);
  const [, forceRefresh] = useState(0);

  // =====================================================
  // Builder: cookbook data
  // =====================================================

  const cookbook = useMemo(() => getCookbook() as Meal[], []);
  const cookbookKeys = useMemo(
    () =>
      new Set(
        cookbook
          .map((recipe) =>
            String(recipe.slug || recipe.id || recipe.name || "").trim().toLowerCase()
          )
          .filter(Boolean)
      ),
    [cookbook]
  );

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

      return true;
    });
  }, [
    mergedRecipes,
    query,
    effort,
    showCookbookOnly,
    showVegetarianOnly,
    showSaladsOnly,
    cookbookKeys,
  ]);

  // =====================================================
  // Builder: actions
  // =====================================================

  const handleOpenRecipe = (recipe: Meal) => {
    if (!recipe.slug) return;
    navigate(`/recipe/${recipe.slug}?from=%2Frecipes`);
  };

  const handleAddToCookbook = (recipe: Meal) => {
    addToCookbook(recipe);
    forceRefresh((v) => v + 1);
  };

  const handleAddToWeek = (recipe: Meal) => {
    if (onAddToWeek) {
      onAddToWeek(recipe);
      return;
    }

    if (recipe.slug) {
      navigate(`/recipe/${recipe.slug}?from=%2Frecipes`);
    }
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
    opacity: 0.6,
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
                  Master Recipe Book
                </h1>
              </div>

              <p style={{ margin: 0, fontSize: 14, opacity: 0.65, lineHeight: 1.5 }}>
                Search your recipe library like a dinner dictionary. Browse built-ins,
                salads, and anything saved to your cookbook.
              </p>
            </div>

            <div style={searchWrap}>
              <Search size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search recipes, ingredients, tags, notes..."
                style={searchInput}
              />
            </div>

            <div style={chipRow}>
              {(["all", "quick", "normal", "big", "frozen", "takeout"] as const).map(
                (value) => {
                  const active = effort === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setEffort(value as "all" | Effort)}
                      style={{
                        ...chipBase,
                        background: active ? "rgba(34,197,94,0.12)" : chipBase.background,
                        border: active
                          ? "1px solid rgba(34,197,94,0.45)"
                          : chipBase.border,
                        color: active ? "#86efac" : chipBase.color,
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <Clock3 size={14} />
                        {value === "all"
                          ? "All Efforts"
                          : value.charAt(0).toUpperCase() + value.slice(1)}
                      </span>
                    </button>
                  );
                }
              )}
            </div>

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
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <BookOpen size={14} />
                  In Cookbook
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowVegetarianOnly((v) => !v)}
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
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Leaf size={14} />
                  Vegetarian
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowSaladsOnly((v) => !v)}
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
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Salad size={14} />
                  Salads
                </span>
              </button>
            </div>

            <div style={statsRow}>
              <span>{mergedRecipes.length} total recipes</span>
              <span>{filteredRecipes.length} showing</span>
              <span>{cookbook.length} in cookbook</span>
            </div>
          </div>
        </Card>

        <div style={gridStyle}>
          {filteredRecipes.map((recipe) => {
            const recipeKey = String(recipe.slug || recipe.id || recipe.name || "")
              .trim()
              .toLowerCase();

            const isSaved = cookbookKeys.has(recipeKey);

            return (
              <Card key={recipeKey} style={recipeCardStyle}>
                {recipe.photoUrl ? (
                  <img
                    src={recipe.photoUrl}
                    alt={recipe.name}
                    style={photoStyle}
                    onClick={() => handleOpenRecipe(recipe)}
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
                      {(recipe.tags ?? []).slice(0, 4).map((tag: string) => (
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
                      {recipe.notes || "A delicious recipe ready for your planner."}
                    </p>
                  </div>

                  <div style={btnRow}>
                    <button
                      type="button"
                      style={btnStyle}
                      onClick={() => handleOpenRecipe(recipe)}
                    >
                      Open Recipe
                    </button>

                    <button
                      type="button"
                      style={btnStyle}
                      onClick={() => handleAddToCookbook(recipe)}
                    >
                      <Plus size={14} />
                      {isSaved ? "Saved" : "Add to Cookbook"}
                    </button>

                    <button
                      type="button"
                      style={btnStyle}
                      onClick={() => handleAddToWeek(recipe)}
                    >
                      <CalendarPlus size={14} />
                      Add to Week
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}