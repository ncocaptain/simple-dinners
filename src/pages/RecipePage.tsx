import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { candidateLibrary } from "../core/planner";
import { getRecipeBySlug, getCookbookRecipeBySlug } from "../core/recipeStore";
import {
  Printer,
  ArrowLeft,
  BookUser,
  ShoppingCart,
  Play,
  History,
  Star,
  X,
  ChevronRight,
  ChevronLeft,
  Timer,
  CheckCircle2,
} from "lucide-react";
import { addIngredientsToList } from "../shoppingList";
import { recordCook, getCookHistoryFor } from "../core/cookHistoryStore";

// --- HELPERS ---
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
    .replace(/\n{2,}/g, "\n")
    .split("\n")
    .map((x) => x.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
}

function findCandidateBySlug(slug: string) {
  const s = (slug || "").trim().toLowerCase();
  return candidateLibrary.find((r) => (r.slug || "").toLowerCase() === s) ?? null;
}

function parseStepDuration(step: string): number | null {
  const match = step.match(
    /(\d+)\s*(?:-|to)?\s*(\d+)?\s*(minute|min|minutes|hour|hr|hours)/i
  );
  if (!match) return null;

  const val = match[2] ? parseInt(match[2], 10) : parseInt(match[1], 10);
  const unit = match[3].toLowerCase();

  return unit.startsWith("h") ? val * 3600 : val * 60;
}

function scaleIngredient(line: string, factor: number): string {
  return line.replace(
    /^(\d+\/\d+|\d+\s\d+\/\d+|\d+(\.\d+)?)/g,
    (match) => {
      let value = 0;

      if (match.includes("/")) {
        const parts = match.split(" ");

        if (parts.length === 2) {
          const [num, den] = parts[1].split("/").map(Number);
          value = Number(parts[0]) + num / den;
        } else {
          const [num, den] = parts[0].split("/").map(Number);
          value = num / den;
        }
      } else {
        value = parseFloat(match);
      }

      const scaled = value * factor;
      return scaled % 1 === 0
        ? scaled.toString()
        : scaled.toFixed(2).replace(/\.?0+$/, "");
    }
  );
}

function cleanIngredientLine(line: string) {
  return String(line)
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/^\s*[-*•]\s*/, "")
    .trim();
}

function normalizeTextForMatch(text: string) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getIngredientKeywords(line: string): string[] {
  const cleaned = normalizeTextForMatch(line)
    .replace(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s+/g, "")
    .replace(
      /^(cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|oz|ounce|ounces|lb|lbs|pound|pounds|clove|cloves|can|cans|package|packages|pkg|pkgs|slice|slices|stick|sticks)\s+/g,
      ""
    )
    .replace(
      /\b(chopped|diced|minced|sliced|softened|melted|divided|drained|rinsed|beaten|large|small|medium|optional|to taste)\b/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned.split(" ").filter(Boolean);

  return words.filter(
    (word) =>
      word.length >= 3 &&
      ![
        "and",
        "with",
        "for",
        "the",
        "fresh",
        "ground",
        "extra",
        "virgin",
        "into",
      ].includes(word)
  );
}

function stepMentionsIngredient(step: string, ingredientLine: string): boolean {
  const stepText = ` ${normalizeTextForMatch(step)} `;
  const keywords = getIngredientKeywords(ingredientLine);

  if (keywords.length === 0) return false;

  return keywords.some((word) => stepText.includes(` ${word} `));
}

function highlightStepText(step: string, ingredients: string[]) {
  let result = step;

  ingredients.forEach((line) => {
    const keywords = getIngredientKeywords(line);

    keywords.forEach((word) => {
      if (word.length < 3) return;

      const regex = new RegExp(`\\b(${word})\\b`, "gi");

      result = result.replace(
        regex,
        `<span style="color:#14b8a6;font-weight:800">$1</span>`
      );
    });
  });

  return result;
}

function randomCongrats(recipeName?: string) {
  const messages = [
    `Boom. ${recipeName || "Dinner"} is officially conquered.`,
    `Nicely done, Chef. ${recipeName || "That recipe"} looks like a win.`,
    `Mission accomplished. Dinner is served.`,
    `You crushed it. Time to eat.`,
    `Another great meal in the books.`,
    `Captain’s orders complete — enjoy that meal.`,
    `That’s a wrap. Hope it tastes amazing.`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

export default function RecipePage() {
  const navigate = useNavigate();
  const { slug = "" } = useParams();
  const location = useLocation();

  const qs = new URLSearchParams(location.search);
  const fromPath = qs.get("from") || "/week";

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fromPath);
    }
  }

  // --- STATE ---
  const [cookMode, setCookMode] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [servingFactor, setServingFactor] = useState(1);
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [completedCookIngredients, setCompletedCookIngredients] = useState<string[]>([]);
  const [showCookIngredients, setShowCookIngredients] = useState(false);

  // --- STYLES ---
  const pill: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    fontSize: 12,
    fontWeight: 800,
    color: "rgba(255,255,255,0.9)",
  };

  const card: React.CSSProperties = {
    borderRadius: 32,
    overflow: "hidden",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#f8fafc",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
  };

  const section: React.CSSProperties = {
    padding: "32px 24px",
  };

  const h3: React.CSSProperties = {
    margin: "0 0 20px",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    color: "#14b8a6",
    fontWeight: 900,
  };

  const btn: React.CSSProperties = {
    padding: "12px 18px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.06)",
    color: "#f8fafc",
    cursor: "pointer",
    fontWeight: 800,
    border: "1px solid rgba(255,255,255,0.1)",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
  };

  // --- RECIPE ---
  const recipe = useMemo(() => {
    return (
      getCookbookRecipeBySlug?.(slug) ||
      getRecipeBySlug(slug) ||
      findCandidateBySlug(slug)
    );
  }, [slug]);

  const history = useMemo(() => {
    if (!recipe) return { timesCooked: 0 };
    return getCookHistoryFor(recipe.slug || slug);
  }, [recipe, slug]);

  const rawIngredients = useMemo(() => {
    return splitLines(recipe?.ingredients ?? "");
  }, [recipe?.ingredients]);

  const ingredients = useMemo(() => {
    return rawIngredients.map((line) => scaleIngredient(line, servingFactor));
  }, [rawIngredients, servingFactor]);

  const selectedIngredients = useMemo(() => {
    return checkedIngredients.map((i) => ingredients[i]).filter(Boolean);
  }, [checkedIngredients, ingredients]);

  const instructions = useMemo(() => {
    return splitLines(recipe?.instructions ?? "");
  }, [recipe?.instructions]);

  const currentStep = instructions[stepIndex] || "";

  const highlightedIngredientIndexes = useMemo(() => {
    return ingredients
      .map((line, i) => (stepMentionsIngredient(currentStep, line) ? i : -1))
      .filter((i) => i !== -1);
  }, [currentStep, ingredients]);

  const highlightedStep = useMemo(() => {
    return highlightStepText(currentStep, ingredients);
  }, [currentStep, ingredients]);

  const currentStepIngredients = useMemo(() => {
    return ingredients.filter((line) => stepMentionsIngredient(currentStep, line));
  }, [currentStep, ingredients]);

  const detectedTime = parseStepDuration(currentStep);
  const heroUrl = recipe?.photoUrl || "";

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isTimerRunning && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((s) => (s !== null ? s - 1 : null));
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      alert("Timer finished!");
      setTimerSeconds(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  useEffect(() => {
    setCheckedIngredients([]);
    setCompletedCookIngredients([]);
    setServingFactor(1);
    setStepIndex(0);
    setCookMode(false);
    setShowCookIngredients(false);
  }, [slug]);

  if (!recipe) {
    return (
      <div style={{ padding: 40, color: "white", textAlign: "center" }}>
        Recipe not found.
      </div>
    );
  }

  const toggleCompletedCookIngredient = (line: string) => {
    setCompletedCookIngredients((prev) =>
      prev.includes(line) ? prev.filter((x) => x !== line) : [...prev, line]
    );
  };

  const handleAddSelectedToList = () => {
    const cleanedItems = selectedIngredients.map(cleanIngredientLine).filter(Boolean);

    if (!cleanedItems.length) return;

    const result = addIngredientsToList(recipe.name, cleanedItems.join("\n"));

    alert(
      result.addedCount > 0
        ? `Added ${result.addedCount} item${result.addedCount === 1 ? "" : "s"} to list!`
        : "No new items were added. They may already be on your shopping list."
    );

    setCheckedIngredients([]);
  };

  const handleAddAllToList = () => {
    const cleanedItems = ingredients.map(cleanIngredientLine).filter(Boolean);

    if (!cleanedItems.length) return;

    const result = addIngredientsToList(recipe.name, cleanedItems.join("\n"));

    alert(
      result.addedCount > 0
        ? `Added ${result.addedCount} item${result.addedCount === 1 ? "" : "s"} to list!`
        : "No new items were added. They may already be on your shopping list."
    );
  };

  const handleCookModeAdvance = () => {
    if (stepIndex >= instructions.length - 1) {
      setCookMode(false);
      alert(randomCongrats(recipe.name));
      return;
    }

    setStepIndex((s) => s + 1);
  };

  // --- COOK MODE ---
  if (cookMode) {
    return (
      <div
        style={{
          padding: "20px 20px 180px 20px",
          maxWidth: 760,
          margin: "0 auto",
          display: "grid",
          gap: 20,
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <button
            style={{
              ...btn,
              background: "rgba(239,68,68,0.1)",
              borderColor: "rgba(239,68,68,0.2)",
            }}
            onClick={() => setCookMode(false)}
          >
            <X size={18} /> Exit
          </button>

          <div style={{ flex: 1, minWidth: 220, textAlign: "center" }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 950,
                color: "#fff",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {recipe.name}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                fontWeight: 900,
                color: "rgba(255,255,255,0.45)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              Cook Mode
            </div>
          </div>

          <div style={{ textAlign: "right", minWidth: 100 }}>
            <div style={{ fontWeight: 900, fontSize: 14, color: "#14b8a6" }}>
              STEP {stepIndex + 1} / {Math.max(instructions.length, 1)}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.45)",
                marginTop: 2,
              }}
            >
              Swipe or tap next
            </div>
          </div>
        </header>

        <div
          style={{
            height: 8,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#14b8a6",
              width: `${
                instructions.length > 0
                  ? ((stepIndex + 1) / instructions.length) * 100
                  : 0
              }%`,
              transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>

        <div
          style={{
            ...card,
            padding: "40px 32px",
            minHeight: 260,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            background: "rgba(15, 23, 42, 0.88)",
            border: "1px solid rgba(20,184,166,0.14)",
          }}
          onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
          onTouchEnd={(e) => {
            if (!touchStart) return;

            const distance = touchStart - e.changedTouches[0].clientX;

            if (distance > 70) {
              setStepIndex((s) => Math.min(instructions.length - 1, s + 1));
            }

            if (distance < -70) {
              setStepIndex((s) => Math.max(0, s - 1));
            }

            setTouchStart(null);
          }}
        >
          {instructions.length === 0 ? (
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>
              No instructions available for this recipe yet.
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 850,
                  lineHeight: 1.5,
                  color: "#fff",
                }}
                dangerouslySetInnerHTML={{ __html: highlightedStep }}
              />

              {currentStepIngredients.length > 0 && (
                <div
                  style={{
                    marginTop: 22,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    justifyContent: "center",
                  }}
                >
                  {currentStepIngredients.map((line, i) => (
                    <span
                      key={`${line}-${i}`}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 999,
                        background: "rgba(20,184,166,0.14)",
                        border: "1px solid rgba(20,184,166,0.35)",
                        color: "#14b8a6",
                        fontWeight: 800,
                        fontSize: 12,
                      }}
                    >
                      {line}
                    </span>
                  ))}
                </div>
              )}

              {detectedTime && timerSeconds === null && (
                <button
                  style={{
                    ...btn,
                    marginTop: 32,
                    alignSelf: "center",
                    background: "#14b8a6",
                    color: "#0f172a",
                    border: "none",
                  }}
                  onClick={() => {
                    setTimerSeconds(detectedTime);
                    setIsTimerRunning(true);
                  }}
                >
                  <Timer size={20} /> Start {Math.floor(detectedTime / 60)}m Timer
                </button>
              )}

              {timerSeconds !== null && (
                <div
                  style={{
                    marginTop: 32,
                    fontSize: 48,
                    fontWeight: 950,
                    color: "#14b8a6",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {Math.floor(timerSeconds / 60)}:
                  {(timerSeconds % 60).toString().padStart(2, "0")}
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <button
            style={{
              ...btn,
              justifyContent: "center",
              background: showCookIngredients
                ? "rgba(20,184,166,0.14)"
                : "rgba(255,255,255,0.06)",
              border: showCookIngredients
                ? "1px solid rgba(20,184,166,0.35)"
                : "1px solid rgba(255,255,255,0.1)",
              color: showCookIngredients ? "#5eead4" : "#f8fafc",
            }}
            onClick={() => setShowCookIngredients((v) => !v)}
          >
            {showCookIngredients ? "Hide Ingredients" : "View Ingredients"}
          </button>

          {showCookIngredients && (
            <div
              style={{
                ...card,
                padding: "24px",
                background: "rgba(15, 23, 42, 0.78)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  marginBottom: 14,
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#14b8a6",
                }}
              >
                Ingredients
              </div>

              {ingredients.length === 0 ? (
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 15 }}>
                  No ingredients available.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: 10,
                  }}
                >
                  {[...ingredients]
                    .map((line, i) => ({ line, i }))
                    .sort((a, b) => {
                      const aDone = completedCookIngredients.includes(a.line) ? 1 : 0;
                      const bDone = completedCookIngredients.includes(b.line) ? 1 : 0;
                      return aDone - bDone;
                    })
                    .map(({ line, i }) => {
                      const isHighlighted = highlightedIngredientIndexes.includes(i);
                      const isDone = completedCookIngredients.includes(line);

                      return (
                        <div
                          key={`${line}-${i}`}
                          onClick={() => toggleCompletedCookIngredient(line)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "14px 16px",
                            borderRadius: 14,
                            background: isDone
                              ? "rgba(255,255,255,0.02)"
                              : isHighlighted
                              ? "rgba(20,184,166,0.18)"
                              : "rgba(255,255,255,0.03)",
                            border: isDone
                              ? "1px solid rgba(255,255,255,0.06)"
                              : isHighlighted
                              ? "1px solid rgba(20,184,166,0.55)"
                              : "1px solid rgba(255,255,255,0.08)",
                            transition: "all 0.2s ease",
                            cursor: "pointer",
                            opacity: isDone ? 0.42 : 1,
                          }}
                        >
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: isDone
                                ? "rgba(255,255,255,0.25)"
                                : isHighlighted
                                ? "#14b8a6"
                                : "rgba(255,255,255,0.2)",
                              flexShrink: 0,
                            }}
                          />

                          <span
                            style={{
                              color: isDone
                                ? "rgba(255,255,255,0.45)"
                                : isHighlighted
                                ? "#fff"
                                : "rgba(255,255,255,0.78)",
                              fontWeight: isHighlighted && !isDone ? 800 : 500,
                              lineHeight: 1.4,
                              textDecoration: isDone ? "line-through" : "none",
                            }}
                          >
                            {line}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>

        <footer
  style={{
    position: "fixed",
    left: "50%",
    bottom: 90,
    transform: "translateX(-50%)",
    width: "min(760px, calc(100% - 32px))",
    display: "flex",
    gap: 12,
    padding: 12,
    borderRadius: 22,
    background: "rgba(15, 23, 42, 0.96)",
border: "1px solid rgba(20,184,166,0.18)",
boxShadow: "0 24px 50px rgba(0,0,0,0.55)",
    backdropFilter: "blur(10px)",
    zIndex: 1200,
  }}
>
  <button
    style={{
      ...btn,
      flex: 1,
      justifyContent: "center",
      opacity: stepIndex === 0 || instructions.length === 0 ? 0.45 : 1,
      cursor:
        stepIndex === 0 || instructions.length === 0 ? "not-allowed" : "pointer",
    }}
    onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
    disabled={stepIndex === 0 || instructions.length === 0}
  >
    <ChevronLeft size={20} />
    Prev
  </button>

  <button
    style={{
      ...btn,
      flex: 2.4,
      justifyContent: "center",
      background: "#14b8a6",
      color: "#0f172a",
      border: "none",
      opacity: instructions.length === 0 ? 0.5 : 1,
      cursor: instructions.length === 0 ? "not-allowed" : "pointer",
    }}
    onClick={handleCookModeAdvance}
    disabled={instructions.length === 0}
  >
    {stepIndex >= instructions.length - 1 ? (
      <>
        <CheckCircle2 size={18} />
        Done
      </>
    ) : (
      <>
        Next Step
        <ChevronRight size={18} />
      </>
    )}
  </button>
</footer>
      </div>
    );
  }

  // --- STANDARD VIEW ---
  return (
    <div style={{ padding: "20px 16px 120px 16px", maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 24,
          justifyContent: "center",
        }}
      >
        <button style={btn} onClick={handleBack}>
          <ArrowLeft size={18} /> {fromPath === "/cookbook" ? "Cookbook" : "Back"}
        </button>

        <button
          style={{ ...btn, background: "#14b8a6", color: "#0f172a", border: "none" }}
          onClick={() => {
            recordCook(recipe.slug || slug);
            setCookMode(true);
          }}
        >
          <Play size={18} fill="currentColor" /> Cook Mode
        </button>

        <div
          style={{
            ...btn,
            background: "rgba(255,255,255,0.04)",
            gap: 14,
            padding: "8px 16px",
          }}
        >
          <button
            onClick={() => setServingFactor(0.5)}
            style={{
              color: servingFactor === 0.5 ? "#14b8a6" : "rgba(255,255,255,0.4)",
              background: "none",
              border: "none",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            ½x
          </button>
          <button
            onClick={() => setServingFactor(1)}
            style={{
              color: servingFactor === 1 ? "#14b8a6" : "rgba(255,255,255,0.4)",
              background: "none",
              border: "none",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            1x
          </button>
          <button
            onClick={() => setServingFactor(2)}
            style={{
              color: servingFactor === 2 ? "#14b8a6" : "rgba(255,255,255,0.4)",
              background: "none",
              border: "none",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            2x
          </button>
        </div>

        <button style={btn} onClick={() => window.print()}>
          <Printer size={18} />
        </button>

        <button style={btn} onClick={handleAddAllToList} title="Add all ingredients">
          <ShoppingCart size={18} />
          Add All
        </button>
      </div>

      <div style={card}>
        <div style={{ position: "relative", height: 380, background: "#0f172a" }}>
          {heroUrl ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${heroUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.35)",
                fontWeight: 800,
                fontSize: 18,
                letterSpacing: "0.04em",
              }}
            >
              No recipe photo yet
            </div>
          )}

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(15,23,42,1) 0%, rgba(15,23,42,0.4) 60%, transparent 100%)",
            }}
          />

          <div style={{ position: "absolute", left: 24, right: 24, bottom: 32 }}>
            <h1
              style={{
                fontSize: "38px",
                fontWeight: 950,
                lineHeight: 1.1,
                margin: 0,
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              {recipe.name}
            </h1>

            <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
              <span style={pill}>{ingredients.length} items</span>
              <span style={pill}>{instructions.length} steps</span>

              {recipe.favorite && (
                <span
                  style={{
                    ...pill,
                    color: "#facc15",
                    borderColor: "rgba(250,204,21,0.3)",
                  }}
                >
                  <Star size={14} fill="#facc15" /> Favorite
                </span>
              )}

              {history.timesCooked > 0 && (
                <span style={pill}>
                  <History size={14} /> Made {history.timesCooked}x
                </span>
              )}
            </div>
          </div>
        </div>

        {recipe.notes && (
          <div
            style={{
              padding: "24px",
              background: "rgba(20,184,166,0.08)",
              borderBottom: "1px solid rgba(20,184,166,0.1)",
            }}
          >
            <div
              style={{
                ...h3,
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <BookUser size={14} /> Notes
            </div>

            <div
              style={{
                fontSize: "17px",
                lineHeight: 1.6,
                fontStyle: "italic",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              "{recipe.notes}"
            </div>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          }}
        >
          <div
            style={{
              ...section,
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <div style={h3}>Ingredients</div>
              <button
                onClick={() => setCheckedIngredients([])}
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#14b8a6",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                RESET
              </button>
            </div>

            {ingredients.length === 0 ? (
              <div
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 16,
                  lineHeight: 1.6,
                }}
              >
                No ingredients were found for this recipe yet.
              </div>
            ) : (
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "grid",
                  gap: 10,
                }}
              >
                {ingredients.map((line, i) => {
                  const isChecked = checkedIngredients.includes(i);

                  return (
                    <li
                      key={i}
                      onClick={() =>
                        setCheckedIngredients((prev) =>
                          isChecked ? prev.filter((x) => x !== i) : [...prev, i]
                        )
                      }
                      style={{
                        fontSize: "17px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "12px 16px",
                        borderRadius: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        background: isChecked
                          ? "rgba(20, 184, 166, 0.15)"
                          : "rgba(255,255,255,0.03)",
                        border: isChecked
                          ? "1px solid #14b8a6"
                          : "1px solid rgba(255,255,255,0.08)",
                        opacity: isChecked ? 1 : 0.8,
                      }}
                    >
                      <span
                        style={{
                          color: "#14b8a6",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {isChecked ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              border: "2px solid rgba(20,184,166,0.4)",
                              borderRadius: "50%",
                            }}
                          />
                        )}
                      </span>

                      <span
                        style={{
                          fontWeight: isChecked ? 800 : 500,
                          color: isChecked ? "#fff" : "rgba(255,255,255,0.9)",
                          lineHeight: 1.4,
                        }}
                      >
                        {line}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div style={section}>
            <div style={h3}>Instructions</div>

            {instructions.length === 0 ? (
              <div
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 16,
                  lineHeight: 1.6,
                }}
              >
                No instructions were found for this recipe yet.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 28 }}>
                {instructions.map((line, i) => (
                  <div key={i} style={{ display: "flex", gap: 20 }}>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 900,
                        color: "#14b8a6",
                        background: "rgba(20,184,166,0.12)",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 10,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "18px",
                        lineHeight: 1.7,
                        color: "rgba(255,255,255,0.9)",
                      }}
                    >
                      {line}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {checkedIngredients.length > 0 && (
        <button
          onClick={handleAddSelectedToList}
          style={{
            position: "fixed",
            bottom: 34,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#22c55e",
            color: "white",
            padding: "18px 34px",
            borderRadius: "999px",
            fontWeight: 900,
            border: "none",
            boxShadow: "0 16px 34px rgba(34, 197, 94, 0.35)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            zIndex: 1200,
          }}
        >
          <ShoppingCart size={18} />
          ADD {checkedIngredients.length} TO LIST
        </button>
      )}
    </div>
  );
}