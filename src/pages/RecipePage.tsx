import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Printer,
  ArrowLeft,
  ShoppingCart,
  Play,
  History,
  Star,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

import { getRecipeBySlug } from "../core/recipes";
import { addToCookbook } from "../core/cookbookStore";
import { addIngredientsToList } from "../shoppingList";
import { recordCook, getCookHistoryFor } from "../core/cookHistoryStore";

// =====================================================
// Builder: helpers
// =====================================================

function splitLines(s?: string) {
  return String(s ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/•/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizePhotoUrl(url?: string) {
  if (!url) return "";
  const trimmed = url.trim();

  if (trimmed.startsWith("/images/")) {
    return trimmed.replace(/\.(png|jpg|jpeg)$/i, ".webp");
  }

  return trimmed;
}

// =====================================================
// Builder: page
// =====================================================

export default function RecipePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug = "" } = useParams();

  // =====================================================
  // Builder: route state
  // =====================================================

  const params = new URLSearchParams(location.search);
  const from = params.get("from") || "/week";
  const printMode = params.get("print") === "1";
  const startInCookMode = params.get("cook") === "true";

  // =====================================================
  // Builder: recipe lookup
  // =====================================================

  const recipe = useMemo(() => {
    return getRecipeBySlug(slug);
  }, [slug]);

  // =====================================================
  // Builder: local state
  // =====================================================

  const [cookMode, setCookMode] = useState(startInCookMode);
  const [stepIndex, setStepIndex] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);

  // =====================================================
  // Builder: empty state
  // =====================================================

  if (!recipe) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "40px 20px 120px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 700,
            textAlign: "center",
            padding: 24,
            borderRadius: 20,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Recipe not found</h2>
          <p style={{ opacity: 0.7, marginBottom: 20 }}>
            This recipe could not be loaded.
          </p>

          <button
            onClick={() => navigate("/recipes")}
            style={{
              border: "none",
              borderRadius: 12,
              padding: "12px 16px",
              background: "rgba(34,197,94,0.12)",
              color: "#86efac",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // Builder: narrowed recipe
  // =====================================================

  const safeRecipe = recipe;

  // =====================================================
  // Builder: derived recipe content
  // =====================================================

  const ingredients = useMemo(
    () => splitLines(safeRecipe.ingredients),
    [safeRecipe.ingredients]
  );

  const instructions = useMemo(
    () => splitLines(safeRecipe.instructions),
    [safeRecipe.instructions]
  );

  const photoUrl = normalizePhotoUrl(safeRecipe.photoUrl);

  // =====================================================
  // Builder: effects
  // =====================================================

  useEffect(() => {
    if (!safeRecipe.slug) return;
    const history = getCookHistoryFor(safeRecipe.slug);
    setHistoryCount(history?.timesCooked ?? 0);
  }, [safeRecipe.slug]);

  useEffect(() => {
    if (printMode) {
      const id = window.setTimeout(() => window.print(), 300);
      return () => window.clearTimeout(id);
    }
  }, [printMode]);

  useEffect(() => {
    if (!cookMode) return;
    if (stepIndex >= instructions.length) {
      setStepIndex(0);
    }
  }, [cookMode, stepIndex, instructions.length]);

  // =====================================================
  // Builder: actions
  // =====================================================

  const handleBack = () => {
    navigate(from);
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: safeRecipe.name || "Recipe",
          url,
        });
        return;
      } catch {}
    }

    await navigator.clipboard.writeText(url);
    alert("Link copied!");
  };

  const handleAddToCookbook = () => {
    if (!safeRecipe?.slug) {
      alert("This recipe is missing a slug.");
      return;
    }

    const result = addToCookbook({
      ...safeRecipe,
      id: safeRecipe.id ?? safeRecipe.slug,
      slug: safeRecipe.slug,
      name: safeRecipe.name ?? "",
      effort: safeRecipe.effort ?? "normal",
      photoUrl: safeRecipe.photoUrl ?? "",
      tags: Array.isArray(safeRecipe.tags) ? safeRecipe.tags : [],
      notes: safeRecipe.notes ?? "",
      ingredients: safeRecipe.ingredients ?? "",
      instructions: safeRecipe.instructions ?? "",
    });

    if (result.ok && !result.already) {
      alert("Added to cookbook!");
      return;
    }

    if (result.already) {
      alert("Already in cookbook!");
      return;
    }

    alert("Could not add recipe.");
  };

  const handleAddIngredients = () => {
    addIngredientsToList(
      safeRecipe.name || "Recipe",
      safeRecipe.ingredients || ""
    );
    alert("Ingredients added to shopping list!");
  };

  const handleCooked = () => {
    if (!safeRecipe.slug) return;
    recordCook(safeRecipe.slug);
    const history = getCookHistoryFor(safeRecipe.slug);
    setHistoryCount(history?.timesCooked ?? 0);
    alert("Cook recorded!");
  };

  // =====================================================
  // Builder: shared styles
  // =====================================================

  const pageWrap: React.CSSProperties = {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: printMode ? "0" : "0 20px 120px",
  };

  const innerWrap: React.CSSProperties = {
    width: "100%",
    maxWidth: 850,
    display: "grid",
    gap: 20,
  };

  const topBtn: React.CSSProperties = {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "white",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  // =====================================================
  // Builder: render
  // =====================================================

  return (
    <div style={pageWrap}>
      <div style={innerWrap}>
        {/* =====================================================
            Builder: top actions
        ===================================================== */}
        {!printMode && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button onClick={handleBack} style={topBtn}>
              <ArrowLeft size={16} />
              Back
            </button>

            <button
              onClick={() =>
                navigate(
                  `/recipe/${encodeURIComponent(
                    safeRecipe.slug || safeRecipe.name || ""
                  )}?from=${encodeURIComponent(from)}&print=1`
                )
              }
              style={topBtn}
            >
              <Printer size={16} />
              Print
            </button>

            <button onClick={handleShare} style={topBtn}>
              <Star size={16} />
              Share
            </button>

            <button onClick={handleAddToCookbook} style={topBtn}>
              <BookOpen size={16} />
              Add to Cookbook
            </button>

            <button onClick={handleAddIngredients} style={topBtn}>
              <ShoppingCart size={16} />
              Add Ingredients
            </button>

            <button onClick={() => setCookMode((v) => !v)} style={topBtn}>
              <Play size={16} />
              {cookMode ? "Exit Cook Mode" : "Cook Mode"}
            </button>

            <button onClick={handleCooked} style={topBtn}>
              <History size={16} />
              Mark Cooked
            </button>
          </div>
        )}

        {/* =====================================================
            Builder: hero
        ===================================================== */}
        <div
          style={{
            overflow: "hidden",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={safeRecipe.name || "Recipe"}
              style={{
                width: "100%",
                aspectRatio: "16 / 8",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : null}

          <div style={{ padding: 20 }}>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 1000 }}>
              {safeRecipe.name}
            </h1>

            {!!safeRecipe.notes?.trim() && (
              <p
                style={{
                  marginTop: 10,
                  marginBottom: 0,
                  opacity: 0.7,
                  lineHeight: 1.5,
                }}
              >
                {safeRecipe.notes}
              </p>
            )}

            <div style={{ marginTop: 10, fontSize: 13, opacity: 0.55 }}>
              Cooked {historyCount} time{historyCount === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        {/* =====================================================
            Builder: cook mode
        ===================================================== */}
        {cookMode ? (
          <div
            style={{
              padding: 20,
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              display: "grid",
              gap: 16,
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.6, fontWeight: 800 }}>
              Step {instructions.length ? stepIndex + 1 : 0} of{" "}
              {instructions.length}
            </div>

            <div style={{ fontSize: 22, lineHeight: 1.5, fontWeight: 800 }}>
              {instructions[stepIndex] || "No instructions available."}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => setStepIndex((v) => Math.max(0, v - 1))}
                style={topBtn}
                disabled={stepIndex <= 0}
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                onClick={() =>
                  setStepIndex((v) => Math.min(instructions.length - 1, v + 1))
                }
                style={topBtn}
                disabled={stepIndex >= instructions.length - 1}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* =====================================================
                Builder: ingredients
            ===================================================== */}
            <div
              style={{
                padding: 20,
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <h2 style={{ marginTop: 0 }}>Ingredients</h2>

              <div style={{ display: "grid", gap: 10 }}>
                {ingredients.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
                  >
                    <CheckCircle2 size={16} style={{ marginTop: 2, opacity: 0.5 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* =====================================================
                Builder: instructions
            ===================================================== */}
            <div
              style={{
                padding: 20,
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <h2 style={{ marginTop: 0 }}>Instructions</h2>

              <div style={{ display: "grid", gap: 14 }}>
                {instructions.map((step, index) => (
                  <div
                    key={`${step}-${index}`}
                    style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
                  >
                    <div
                      style={{
                        minWidth: 28,
                        height: 28,
                        borderRadius: 999,
                        background: "rgba(34,197,94,0.12)",
                        color: "#86efac",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: 13,
                        marginTop: 2,
                      }}
                    >
                      {index + 1}
                    </div>

                    <div style={{ lineHeight: 1.6 }}>{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}