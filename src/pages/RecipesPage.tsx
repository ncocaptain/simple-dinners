import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  Heart,
  Leaf,
  Salad,
  Clock3,
} from "lucide-react";
import Card from "../components/Card";
import type { Meal, Effort } from "../core/types";
import { NEW_BUILTIN_RECIPES } from "../core/data";
import { getCookbook, addToCookbook } from "../core/cookbookStore";


type RecipesPageProps = {
  recipes?: Meal[];
};

const pageWrap: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "16px 16px 96px",
};

const heroCard: React.CSSProperties = {
  padding: 18,
  borderRadius: 20,
};

const titleRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 10,
  flexWrap: "wrap",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 28,
  lineHeight: 1.1,
  fontWeight: 800,
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  opacity: 0.82,
  fontSize: 14,
};

const controlsWrap: React.CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 16,
};

const searchWrap: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 14px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const searchInput: React.CSSProperties = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  color: "inherit",
  fontSize: 15,
};

const chipRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const chipBase: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "inherit",
  borderRadius: 999,
  padding: "10px 14px",
  fontSize: 13,
  cursor: "pointer",
};

const statsRow: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 12,
  fontSize: 13,
  opacity: 0.8,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
  marginTop: 18,
};

const recipeCard: React.CSSProperties = {
  overflow: "hidden",
  borderRadius: 20,
};

const photoStyle: React.CSSProperties = {
  width: "100%",
  aspectRatio: "4 / 3",
  objectFit: "cover",
  display: "block",
  background: "rgba(255,255,255,0.05)",
};

const contentStyle: React.CSSProperties = {
  padding: 14,
  display: "grid",
  gap: 10,
};

const nameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 800,
  lineHeight: 1.2,
};

const tagWrap: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const tagStyle: React.CSSProperties = {
  fontSize: 12,
  padding: "5px 9px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.1)",
  opacity: 0.92,
};

const noteStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  lineHeight: 1.45,
  opacity: 0.82,
  minHeight: 38,
};

const actionRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const btn: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.07)",
  color: "inherit",
  borderRadius: 12,
  padding: "10px 12px",
  fontSize: 13,
  cursor: "pointer",
};

function normalizeText(value: unknown) {
  return String(value ?? "").toLowerCase().trim();
}

function includesAnyTag(recipe: Meal, wanted: string[]) {
  const tags = Array.isArray(recipe.tags) ? recipe.tags.map(normalizeText) : [];
  return wanted.some((tag) => tags.includes(normalizeText(tag)));
}

function effortLabel(effort?: Effort | string) {
  if (!effort) return "normal";
  return String(effort);
}

export default function RecipesPage({ recipes }: RecipesPageProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [effort, setEffort] = useState<"all" | Effort>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showCookbookOnly, setShowCookbookOnly] = useState(false);
  const [showVegetarianOnly, setShowVegetarianOnly] = useState(false);
  const [showSaladsOnly, setShowSaladsOnly] = useState(false);
  const [, forceRefresh] = useState(0);

  const cookbook = useMemo(() => getCookbook(), []);
  const cookbookSlugs = useMemo(
    () => new Set(cookbook.map((r) => r.slug || r.id).filter(Boolean)),
    [cookbook]
  );

  const allRecipes = useMemo(() => {
    const merged = [...(recipes?.length ? recipes : NEW_BUILTIN_RECIPES), ...cookbook];

    const seen = new Set<string>();
    return merged.filter((recipe) => {
      const key = String(recipe.slug || recipe.id || recipe.name || "").trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [recipes, cookbook]);

  const filteredRecipes = useMemo(() => {
    const q = normalizeText(query);

    return allRecipes.filter((recipe) => {
      const recipeText = [
        recipe.name,
        recipe.slug,
        recipe.ingredients,
        recipe.instructions,
        recipe.notes,
        ...(recipe.tags || []),
      ]
        .map(normalizeText)
        .join(" ");

      const matchesQuery = !q || recipeText.includes(q);
      const matchesEffort = effort === "all" || recipe.effort === effort;
      const matchesCookbook =
        !showCookbookOnly || cookbookSlugs.has(recipe.slug || recipe.id || "");
      const matchesVegetarian =
        !showVegetarianOnly ||
        includesAnyTag(recipe, ["vegetarian", "veggie", "meatless"]);
      const matchesSalad = !showSaladsOnly || includesAnyTag(recipe, ["salad"]);

      return (
        matchesQuery &&
        matchesEffort &&
        matchesCookbook &&
        matchesVegetarian &&
        matchesSalad
      );
    });
  }, [
    allRecipes,
    query,
    effort,
    showFavoritesOnly,
    showCookbookOnly,
    showVegetarianOnly,
    showSaladsOnly,
    cookbookSlugs,
  ]);

  return (
    <div style={pageWrap}>
      <Card style={heroCard}>
        <div style={titleRow}>
          <BookOpen size={22} />
          <h1 style={titleStyle}>Master Recipe Book</h1>
        </div>

        <p style={subtitleStyle}>
          Search your full recipe library like a dinner dictionary. Find something
          quick, fresh, hearty, favorite, or salad-focused in seconds.
        </p>

        <div style={controlsWrap}>
          <div style={searchWrap}>
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipes, tags, ingredients, notes..."
              style={searchInput}
            />
          </div>

          <div style={chipRow}>
            {(["all", "quick", "normal", "big", "takeout"] as const).map((value) => {
              const active = effort === value;
              return (
                <button
                  key={value}
                  onClick={() => setEffort(value)}
                  style={{
                    ...chipBase,
                    background: active ? "rgba(255,255,255,0.16)" : chipBase.background,
                    border: active
                      ? "1px solid rgba(255,255,255,0.28)"
                      : chipBase.border,
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <Clock3 size={14} />
                    {value === "all" ? "All Efforts" : value[0].toUpperCase() + value.slice(1)}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={chipRow}>
            <button
              onClick={() => setShowFavoritesOnly((v) => !v)}
              style={{
                ...chipBase,
                background: showFavoritesOnly ? "rgba(255,255,255,0.16)" : chipBase.background,
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Heart size={14} />
                Favorites
              </span>
            </button>

            <button
              onClick={() => setShowCookbookOnly((v) => !v)}
              style={{
                ...chipBase,
                background: showCookbookOnly ? "rgba(255,255,255,0.16)" : chipBase.background,
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <BookOpen size={14} />
                In Cookbook
              </span>
            </button>

            <button
              onClick={() => setShowVegetarianOnly((v) => !v)}
              style={{
                ...chipBase,
                background: showVegetarianOnly ? "rgba(255,255,255,0.16)" : chipBase.background,
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Leaf size={14} />
                Vegetarian
              </span>
            </button>

            <button
              onClick={() => setShowSaladsOnly((v) => !v)}
              style={{
                ...chipBase,
                background: showSaladsOnly ? "rgba(255,255,255,0.16)" : chipBase.background,
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Salad size={14} />
                Salads
              </span>
            </button>
          </div>
        </div>

        <div style={statsRow}>
          <span>{allRecipes.length} total recipes</span>
          <span>{filteredRecipes.length} showing</span>
          <span>{cookbook.length} in cookbook</span>
        </div>
      </Card>

      <div style={gridStyle}>
        {filteredRecipes.map((recipe) => {
          const key = String(recipe.slug || recipe.id || recipe.name);
          const saved = cookbookSlugs.has(recipe.slug || recipe.id || "");
          

          return (
            <Card key={key} style={recipeCard}>
              {recipe.photoUrl ? (
                <img
                  src={recipe.photoUrl}
                  alt={recipe.name}
                  style={photoStyle}
                  onClick={() => {
                    if (recipe.slug) navigate(`/recipe/${recipe.slug}?from=%2Frecipes`);
                  }}
                />
              ) : (
                <div style={photoStyle} />
              )}

              <div style={contentStyle}>
                <h3 style={nameStyle}>{recipe.name}</h3>

                <div style={tagWrap}>
                  <span style={tagStyle}>{effortLabel(recipe.effort)}</span>
                  {(recipe.tags || []).slice(0, 4).map((tag) => (
                    <span key={tag} style={tagStyle}>
                      {tag}
                    </span>
                  ))}
                </div>

                <p style={noteStyle}>{recipe.notes || "A delicious recipe ready for your planner."}</p>

                <div style={actionRow}>
                  <button
                    style={btn}
                    onClick={() => {
                      if (recipe.slug) navigate(`/recipe/${recipe.slug}?from=%2Frecipes`);
                    }}
                  >
                    Open Recipe
                  </button>

                  <button
                    style={btn}
                    onClick={() => {
                      addToCookbook(recipe);
                      forceRefresh((v) => v + 1);
                    }}
                  >
                    {saved ? "Saved" : "Add to Cookbook"}
                  </button>

                  
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}