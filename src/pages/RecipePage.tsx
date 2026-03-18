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
  return (s ?? "")
    .split("\n")
    .map((x) => x.trim())
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

export default function RecipePage() {
  const navigate = useNavigate();
  const { slug = "" } = useParams();
  const location = useLocation();

  // --- STATE ---
  const [cookMode, setCookMode] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [servingFactor, setServingFactor] = useState(1);
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);

  const qs = new URLSearchParams(location.search);
  const fromPath = qs.get("from") || "/week";

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

  const instructions = useMemo(() => {
    return splitLines(recipe?.instructions ?? "");
  }, [recipe?.instructions]);

  const currentStep = instructions[stepIndex] || "";
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

  if (!recipe) {
    return (
      <div style={{ padding: 40, color: "white", textAlign: "center" }}>
        Recipe not found.
      </div>
    );
  }

  // --- COOK MODE ---
  if (cookMode) {
    return (
      <div
        style={{
          padding: "20px",
          maxWidth: 600,
          margin: "0 auto",
          display: "grid",
          gap: 20,
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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

          <div style={{ fontWeight: 900, fontSize: 14, color: "#14b8a6" }}>
            STEP {stepIndex + 1} / {Math.max(instructions.length, 1)}
          </div>
        </header>

        <div
          style={{
            height: 8,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 4,
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
            padding: 32,
            minHeight: 300,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
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
                  fontSize: "26px",
                  fontWeight: 800,
                  lineHeight: 1.5,
                  color: "#fff",
                }}
              >
                {currentStep}
              </div>

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

        <footer style={{ display: "flex", gap: 16 }}>
          <button
            style={{ ...btn, flex: 1 }}
            onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
            disabled={stepIndex === 0 || instructions.length === 0}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            style={{
              ...btn,
              flex: 3,
              background: "#14b8a6",
              color: "#0f172a",
              border: "none",
            }}
            onClick={() =>
              stepIndex >= instructions.length - 1
                ? setCookMode(false)
                : setStepIndex((s) => s + 1)
            }
            disabled={instructions.length === 0}
          >
            {stepIndex >= instructions.length - 1 ? (
              <>
                <CheckCircle2 /> Done
              </>
            ) : (
              <>
                Next Step <ChevronRight />
              </>
            )}
          </button>
        </footer>
      </div>
    );
  }

  // --- STANDARD VIEW ---
  return (
    <div style={{ padding: "20px 16px 60px 16px", maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 24,
          justifyContent: "center",
        }}
      >
        <button style={btn} onClick={() => navigate(fromPath)}>
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

        <button
          style={btn}
          onClick={() => {
            addIngredientsToList(recipe.name, ingredients.join("\n"));
            alert("Added to list!");
          }}
        >
          <ShoppingCart size={18} />
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
              <BookUser size={14} /> The Captain&apos;s Notes
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
    </div>
  );
}