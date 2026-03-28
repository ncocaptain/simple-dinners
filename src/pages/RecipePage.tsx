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
  Timer,
} from "lucide-react";

import { getRecipeBySlug } from "../core/recipes";
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

function extractTimerSeconds(text: string): number | null {
  const lower = text.toLowerCase();

  const hourMatch = lower.match(/(\d+)\s*(hour|hours|hr|hrs)/i);
  const minuteMatch = lower.match(/(\d+)\s*(minute|minutes|min|mins)/i);
  const secondMatch = lower.match(/(\d+)\s*(second|seconds|sec|secs)/i);

  let total = 0;

  if (hourMatch) total += parseInt(hourMatch[1], 10) * 3600;
  if (minuteMatch) total += parseInt(minuteMatch[1], 10) * 60;
  if (secondMatch) total += parseInt(secondMatch[1], 10);

  return total > 0 ? total : null;
}

function formatTimer(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  }

  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function ingredientMatchesStep(step: string, ingredient: string) {
  const stepText = step.toLowerCase();
  const cleaned = ingredient
    .toLowerCase()
    .replace(/^[\d/\s.,()-]+/, "")
    .replace(
      /\b(cup|cups|tbsp|tsp|teaspoon|teaspoons|tablespoon|tablespoons|lb|lbs|oz|ounce|ounces|clove|cloves|can|cans|package|packages|slice|slices)\b/g,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned
    .split(" ")
    .map((w) => w.trim())
    .filter((w) => w.length > 2)
    .slice(0, 3);

  return words.some((word) => stepText.includes(word));
}

function playTimerDoneSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;

    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.6);
  } catch {
    // ignore audio failures
  }
}

// =====================================================
// Builder: page
// =====================================================

type RecipePageProps = {
  onAddToCookbook: (recipe: any) => {
    ok: boolean;
    already?: boolean;
    reason?: string;
  };
};

export default function RecipePage({ onAddToCookbook }: RecipePageProps) {
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

  const recipe = useMemo(() => getRecipeBySlug(slug), [slug]);

  // =====================================================
  // Builder: local state
  // =====================================================

  const [cookMode, setCookMode] = useState(startInCookMode);
  const [stepIndex, setStepIndex] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [savedState, setSavedState] = useState<"idle" | "saved" | "already">(
    "idle"
  );
  const [saveMessage, setSaveMessage] = useState("");
  const [checkedIngredients, setCheckedIngredients] = useState<
    Record<number, boolean>
  >({});
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);

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
  const currentStep = instructions[stepIndex] || "";
  const detectedTimerSeconds = extractTimerSeconds(currentStep);

  const stepIngredients = useMemo(() => {
    if (!currentStep) return [];
    return ingredients.filter((ingredient) =>
      ingredientMatchesStep(currentStep, ingredient)
    );
  }, [currentStep, ingredients]);

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

  useEffect(() => {
    if (!saveMessage) return;
    const t = window.setTimeout(() => setSaveMessage(""), 1800);
    return () => window.clearTimeout(t);
  }, [saveMessage]);

  useEffect(() => {
    if (savedState === "idle") return;
    const t = window.setTimeout(() => setSavedState("idle"), 1400);
    return () => window.clearTimeout(t);
  }, [savedState]);

  useEffect(() => {
    if (!timerRunning || timerSeconds === null) return;

    const t = window.setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev === null) return null;

        if (prev <= 1) {
          window.clearInterval(t);
          setTimerRunning(false);
          setSaveMessage("⏱️ Timer done!");
          playTimerDoneSound();

          if ("vibrate" in navigator) {
            navigator.vibrate?.([200, 100, 200]);
          }

          return null;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(t);
  }, [timerRunning, timerSeconds]);

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
    setSaveMessage("Link copied!");
  };

  const handleAddToCookbook = () => {
    if (!safeRecipe?.slug) {
      setSaveMessage("Missing recipe info");
      return;
    }

    const result = onAddToCookbook({
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

    if (result.ok) {
      localStorage.setItem("scrollToCookbook", safeRecipe.slug);

      if (result.already) {
        setSavedState("already");
        setSaveMessage("Already in Cookbook");
      } else {
        setSavedState("saved");
        setSaveMessage("Saved to Cookbook ✓");
      }

      return;
    }

    setSaveMessage("Could not save recipe");
  };

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleAddIngredients = () => {
    const selectedIngredients = ingredients.filter(
      (_, index) => checkedIngredients[index]
    );

    const linesToSend = selectedIngredients.length
      ? selectedIngredients
      : ingredients;

    addIngredientsToList(safeRecipe.name || "Recipe", linesToSend.join("\n"));

    setSaveMessage(
      selectedIngredients.length
        ? "Selected ingredients added ✓"
        : "All ingredients added ✓"
    );
  };

  const handleCooked = () => {
    if (!safeRecipe.slug) return;
    recordCook(safeRecipe.slug);
    const history = getCookHistoryFor(safeRecipe.slug);
    setHistoryCount(history?.timesCooked ?? 0);
    setSaveMessage("Cook recorded ✓");
  };

  const handleStartTimer = () => {
    if (!detectedTimerSeconds) return;
    setTimerSeconds(detectedTimerSeconds);
    setTimerRunning(true);
    setSaveMessage("Timer started");
  };

  const handlePauseResumeTimer = () => {
    if (timerSeconds === null) return;
    setTimerRunning((prev) => !prev);
  };

  const handleClearTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(null);
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
        {!printMode && (
          <>
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

              <button
                onClick={handleAddToCookbook}
                disabled={savedState === "already"}
                style={{
                  ...topBtn,
                  opacity: savedState === "already" ? 0.7 : 1,
                  transform:
                    savedState === "saved" ? "scale(1.05)" : "scale(1)",
                  border:
                    savedState !== "idle"
                      ? "1px solid rgba(34,197,94,0.45)"
                      : topBtn.border,
                  background:
                    savedState !== "idle"
                      ? "rgba(34,197,94,0.12)"
                      : topBtn.background,
                  color: savedState !== "idle" ? "#86efac" : "white",
                  cursor: savedState === "already" ? "default" : "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                <BookOpen size={16} />
                {savedState === "saved"
                  ? "Saved ✓"
                  : savedState === "already"
                  ? "Saved"
                  : "Add to Cookbook"}
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

            {saveMessage && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
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
          </>
        )}

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
              {currentStep || "No instructions available."}
            </div>

            {stepIngredients.length > 0 && (
              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "grid",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.65, fontWeight: 800 }}>
                  Ingredients in this step
                </div>

                {stepIngredients.map((ingredient, index) => (
                  <div
                    key={`${ingredient}-${index}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      opacity: 0.85,
                    }}
                  >
                    <CheckCircle2 size={14} style={{ opacity: 0.5 }} />
                    <span style={{ fontSize: 14 }}>{ingredient}</span>
                  </div>
                ))}
              </div>
            )}

            {(detectedTimerSeconds || timerSeconds !== null) && (
              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "grid",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 900,
                  }}
                >
                  <Timer size={16} />
                  Timer
                </div>

                <div style={{ fontSize: 28, fontWeight: 1000 }}>
                  {timerSeconds !== null
                    ? formatTimer(timerSeconds)
                    : detectedTimerSeconds
                    ? formatTimer(detectedTimerSeconds)
                    : "0:00"}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {timerSeconds === null && detectedTimerSeconds && (
                    <button onClick={handleStartTimer} style={topBtn}>
                      <Timer size={16} />
                      Start Timer
                    </button>
                  )}

                  {timerSeconds !== null && (
                    <>
                      <button onClick={handlePauseResumeTimer} style={topBtn}>
                        {timerRunning ? "Pause Timer" : "Resume Timer"}
                      </button>

                      <button onClick={handleClearTimer} style={topBtn}>
                        Clear Timer
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

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
                  setStepIndex((v) =>
                    Math.min(instructions.length - 1, v + 1)
                  )
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
            <div
              style={{
                padding: 20,
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                <h2 style={{ margin: 0 }}>Ingredients</h2>

                <div style={{ fontSize: 12, opacity: 0.6 }}>
                  Tap ingredients to select specific items
                </div>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {ingredients.map((item, index) => {
                  const checked = !!checkedIngredients[index];

                  return (
                    <button
                      key={`${item}-${index}`}
                      type="button"
                      onClick={() => toggleIngredient(index)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        textAlign: "left",
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        color: "white",
                        opacity: checked ? 0.55 : 1,
                      }}
                    >
                      <CheckCircle2
                        size={16}
                        style={{
                          marginTop: 2,
                          color: checked ? "#22c55e" : "rgba(255,255,255,0.35)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          textDecoration: checked ? "line-through" : "none",
                        }}
                      >
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

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
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
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