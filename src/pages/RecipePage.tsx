import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { candidateLibrary } from "../core/planner";
import { getRecipeBySlug, getCookbookRecipeBySlug } from "../core/recipeStore";
import { addToCookbook, getCookbook } from "../core/cookbookStore";
import { Star, Printer, Share2, ArrowLeft } from "lucide-react";
import { addIngredientsToList } from "../shoppingList";

function splitLines(s?: string) {
  return (s ?? "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function findCandidateBySlug(slug: string) {
  const s = (slug || "").trim().toLowerCase();
  return (
    candidateLibrary.find((r) => (r.slug || "").toLowerCase() === s) ?? null
  );
}

function parseStepDuration(step?: string): number | null {
  if (!step) return null;

  const s = step.toLowerCase();

  let hours = 0;
  let minutes = 0;

  for (const match of s.matchAll(/(\d+)\s*(hour|hours|hr|hrs)\b/g)) {
    hours += Number(match[1]);
  }

  for (const match of s.matchAll(/(\d+)\s*(minute|minutes|min|mins)\b/g)) {
    minutes += Number(match[1]);
  }

  const totalSeconds = hours * 3600 + minutes * 60;
  return totalSeconds > 0 ? totalSeconds : null;
}

function formatTimer(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function playTimerDoneSound() {
  const AudioContextClass =
    window.AudioContext || (window as any).webkitAudioContext;

  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();

  const startBeep = () => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.6);

    oscillator.onended = () => {
      ctx.close();
    };
  };

  if (ctx.state === "suspended") {
    ctx.resume().then(startBeep).catch(() => {
      ctx.close();
    });
  } else {
    startBeep();
  }
}

export default function RecipePage({ setCookbook }: { setCookbook: any }) {
  const navigate = useNavigate();
  const { slug = "" } = useParams();
  const location = useLocation();

  const [cookMode, setCookMode] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);
  const [touchEndX, setTouchEndX] = React.useState<number | null>(null);

  const [timerDurationSeconds, setTimerDurationSeconds] = React.useState<number | null>(null);
  const [timerEndsAt, setTimerEndsAt] = React.useState<number | null>(null);
  const [timerRunning, setTimerRunning] = React.useState(false);
  const [timerFinished, setTimerFinished] = React.useState(false);
  const [nowMs, setNowMs] = React.useState(Date.now());
  const [checkedIngredients, setCheckedIngredients] = React.useState<number[]>([]);
  const [checksLoaded, setChecksLoaded] = React.useState(false);

  React.useEffect(() => {
  if (!checksLoaded) return;
  localStorage.setItem(`cook-checks-${slug}`, JSON.stringify(checkedIngredients));
}, [checkedIngredients, slug, checksLoaded]);

  React.useEffect(() => {
    const qs = new URLSearchParams(location.search);
    if (qs.get("print") === "1") {
      setTimeout(() => window.print(), 200);
    }
  }, [location.search]);

  const qs = new URLSearchParams(location.search);
  const from = qs.get("from") || "/week";

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  React.useEffect(() => {
  setStepIndex(0);
  setCookMode(false);
  setTimerDurationSeconds(null);
  setTimerEndsAt(null);
  setTimerRunning(false);
  setTimerFinished(false);
  setNowMs(Date.now());

  try {
    const saved = localStorage.getItem(`cook-checks-${slug}`);
    setCheckedIngredients(saved ? JSON.parse(saved) : []);
  } catch {
    setCheckedIngredients([]);
  }

  setChecksLoaded(true);
}, [slug]);

  const recipe = React.useMemo(() => {
    const fromStore = getRecipeBySlug(slug);
    if (fromStore) return fromStore;

    const fromCookbook = getCookbookRecipeBySlug?.(slug);
    if (fromCookbook) return fromCookbook;

    const fromCandidate = findCandidateBySlug(slug);
    if (!fromCandidate) return null;

    const { rating, ratingCount, stars, ...safe } = fromCandidate as any;
    return safe;
  }, [slug]);

  if (!recipe) {
    return (
      <div style={{ padding: 24, color: "#f8fafc" }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            fontWeight: 900,
            opacity: 0.8,
            marginBottom: 14,
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              color: "#14b8a6",
              cursor: "pointer",
              fontWeight: 900,
              padding: 0,
            }}
          >
            Home
          </button>
          <span style={{ opacity: 0.5 }}>→</span>
          <button
            onClick={() => navigate(from)}
            style={{
              background: "none",
              border: "none",
              color: "#14b8a6",
              cursor: "pointer",
              fontWeight: 900,
              padding: 0,
            }}
          >
            Week Plan
          </button>
          <span style={{ opacity: 0.5 }}>→</span>
          <span style={{ color: "#f8fafc", opacity: 0.95 }}>Recipe</span>
        </div>

        <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 900 }}>
          Recipe not found
        </h1>
        <p style={{ opacity: 0.75, marginTop: 8 }}>
          I couldn’t find a saved recipe with slug{" "}
          <code style={{ opacity: 0.9 }}>{slug}</code>.
        </p>

        <button
          onClick={() => navigate(from)}
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 14,
            background: "rgba(20,184,166,0.18)",
            color: "#f8fafc",
            cursor: "pointer",
            fontWeight: 900,
            border: "1px solid rgba(20,184,166,0.35)",
          }}
        >
          ← Back to Week
        </button>
      </div>
    );
  }

  const ingredients = splitLines(recipe.ingredients ?? "");
  const instructions = splitLines(recipe.instructions ?? "");
  const currentStep = instructions[stepIndex] || "";
  const detectedDuration = parseStepDuration(currentStep);
  const stepLower = currentStep.toLowerCase();

const highlightedIngredients = ingredients.map((line) => {
  const words = line.toLowerCase().split(" ");
  return words.some((w) => w.length > 3 && stepLower.includes(w));
});

  const timerSeconds =
    timerDurationSeconds === null
      ? null
      : timerRunning && timerEndsAt !== null
      ? Math.max(0, Math.ceil((timerEndsAt - nowMs) / 1000))
      : timerDurationSeconds;

  React.useEffect(() => {
    setTimerDurationSeconds(null);
    setTimerEndsAt(null);
    setTimerRunning(false);
    setTimerFinished(false);
    setNowMs(Date.now());
  }, [stepIndex]);

  React.useEffect(() => {
    if (!timerRunning || timerEndsAt === null) return;

    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, 250);

    return () => window.clearInterval(id);
  }, [timerRunning, timerEndsAt]);

  React.useEffect(() => {
    if (!timerRunning || timerSeconds === null) return;

    if (timerSeconds <= 0) {
      setTimerRunning(false);
      setTimerDurationSeconds(0);
      setTimerEndsAt(null);
    }
  }, [timerRunning, timerSeconds]);

  React.useEffect(() => {
    if (timerSeconds !== 0 || timerFinished) return;

    setTimerFinished(true);
    playTimerDoneSound();

    if ("vibrate" in navigator) {
      navigator.vibrate?.([200, 100, 200, 100, 300]);
    }

    alert("Timer finished!");
  }, [timerSeconds, timerFinished]);

  const minSwipeDistance = 50;

function toggleIngredient(index: number) {
  setCheckedIngredients((prev) =>
    prev.includes(index)
      ? prev.filter((i) => i !== index)
      : [...prev, index]
  );
}

function handleSwipeGesture() {
  if (touchStartX === null || touchEndX === null) return;
  if (instructions.length === 0) return;

  const distance = touchStartX - touchEndX;

  if (distance > minSwipeDistance && stepIndex < instructions.length - 1) {
    setStepIndex((i) => i + 1);
  } else if (distance < -minSwipeDistance && stepIndex > 0) {
    setStepIndex((i) => i - 1);
  }

  setTouchStartX(null);
  setTouchEndX(null);
}

  const heroUrl =
    recipe.photoUrl ||
    `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1400&q=80&sig=${encodeURIComponent(
      slug
    )}`;

  const pill: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    fontSize: 12,
    fontWeight: 900,
    color: "#f8fafc",
  };

  const isMobile = window.innerWidth < 640;

  const card: React.CSSProperties = {
    borderRadius: isMobile ? 14 : 20,
    marginLeft: isMobile ? -8 : 0,
    marginRight: isMobile ? -8 : 0,
    overflow: "hidden",
    background: "rgba(30,41,59,0.40)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 10px 26px rgba(0,0,0,0.35)",
    color: "#f8fafc",
  };

  const section: React.CSSProperties = {
    padding: window.innerWidth < 640 ? 16 : 18,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  };

  const h3: React.CSSProperties = {
    margin: "0 0 10px",
    fontSize: 14,
    letterSpacing: 0.2,
    textTransform: "uppercase",
    opacity: 0.7,
    fontWeight: 900,
  };

  const btn: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.06)",
    color: "#f8fafc",
    cursor: "pointer",
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.12)",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  if (cookMode) {
    return (
      <div
        style={{
          padding: window.innerWidth < 640 ? "16px 12px 24px" : "24px",
          maxWidth: 760,
          margin: "0 auto",
          color: "#f8fafc",
          display: "grid",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <button style={btn} onClick={() => setCookMode(false)}>
            <ArrowLeft size={16} />
            Exit Cook Mode
          </button>

          <div style={{ display: "grid", gap: 6 }}>
            <div style={pill}>
              Step {instructions.length === 0 ? 0 : stepIndex + 1} of{" "}
              {instructions.length}
            </div>
            <div style={{ fontSize: 12, opacity: 0.65, fontWeight: 700 }}>
              Swipe left or right to move between steps
            </div>
          </div>
        </div>

        

        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${
                instructions.length
                  ? ((stepIndex + 1) / instructions.length) * 100
                  : 0
              }%`,
              background: "rgba(20,184,166,0.95)",
              borderRadius: 999,
              transition: "width 180ms ease",
            }}
          />
        </div>

        <div
          onTouchStart={(e) => {
            setTouchEndX(null);
            setTouchStartX(e.targetTouches[0].clientX);
          }}
          onTouchMove={(e) => {
            setTouchEndX(e.targetTouches[0].clientX);
          }}
          onTouchEnd={handleSwipeGesture}
          style={{
            borderRadius: 20,
            background: "rgba(30,41,59,0.55)",
            border: "1px solid rgba(255,255,255,0.10)",
            padding: window.innerWidth < 640 ? 18 : 28,
            minHeight: 220,
            display: "grid",
            alignItems: "center",
            touchAction: "pan-y",
            userSelect: "none",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 14,
                opacity: 0.7,
                fontWeight: 900,
                marginBottom: 10,
              }}
            >
              {recipe.name}
            </div>

            <div
              style={{
                fontSize: window.innerWidth < 640 ? 24 : 30,
                lineHeight: 1.45,
                fontWeight: 800,
              }}
            >
              {currentStep || "No instructions saved."}
            </div>

            {detectedDuration !== null && (
              <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
                {timerSeconds === null ? (
                  <button
                    style={btn}
                    onClick={() => {
                      setTimerFinished(false);
                      setTimerDurationSeconds(detectedDuration);
                      setTimerEndsAt(Date.now() + detectedDuration * 1000);
                      setTimerRunning(true);
                      setNowMs(Date.now());
                    }}
                  >
                    ⏱ Start {formatTimer(detectedDuration)} Timer
                  </button>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gap: 10,
                      padding: 14,
                      borderRadius: 16,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      maxWidth: 420,
                    }}
                  >
                    <div style={{ fontSize: 28, fontWeight: 900 }}>
                      {timerSeconds === 0 ? "Time’s up! 🔔" : formatTimer(timerSeconds)}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        style={btn}
                        onClick={() => {
                          if (timerSeconds === null) return;

                          if (timerRunning) {
                            setTimerDurationSeconds(timerSeconds);
                            setTimerEndsAt(null);
                            setTimerRunning(false);
                            setNowMs(Date.now());
                          } else {
                            setTimerEndsAt(Date.now() + timerSeconds * 1000);
                            setTimerRunning(true);
                            setNowMs(Date.now());
                          }
                        }}
                      >
                        {timerRunning ? "Pause" : "Resume"}
                      </button>

                      <button
                        style={btn}
                        onClick={() => {
                          setTimerFinished(false);
                          setTimerDurationSeconds(detectedDuration);
                          setTimerEndsAt(null);
                          setTimerRunning(false);
                          setNowMs(Date.now());
                        }}
                      >
                        Reset
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        style={btn}
                        onClick={() => {
                          if (timerSeconds === null) return;
                          const next = timerSeconds + 60;
                          setTimerFinished(false);
                          setTimerDurationSeconds(next);
                          setNowMs(Date.now());
                          if (timerRunning) {
                            setTimerEndsAt(Date.now() + next * 1000);
                          } else {
                            setTimerEndsAt(null);
                          }
                        }}
                      >
                        +1 min
                      </button>

                      <button
                        style={btn}
                        onClick={() => {
                          if (timerSeconds === null) return;
                          const next = timerSeconds + 300;
                          setTimerFinished(false);
                          setTimerDurationSeconds(next);
                          setNowMs(Date.now());
                          if (timerRunning) {
                            setTimerEndsAt(Date.now() + next * 1000);
                          } else {
                            setTimerEndsAt(null);
                          }
                        }}
                      >
                        +5 min
                      </button>

                      <button
                        style={btn}
                        onClick={() => {
                          if (timerSeconds === null) return;
                          const next = Math.max(0, timerSeconds - 60);
                          setTimerFinished(false);
                          setTimerDurationSeconds(next);
                          setNowMs(Date.now());
                          if (timerRunning && next > 0) {
                            setTimerEndsAt(Date.now() + next * 1000);
                          } else {
                            setTimerEndsAt(null);
                            setTimerRunning(false);
                          }
                        }}
                      >
                        -1 min
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div
  style={{
    borderRadius: 18,
    background: "rgba(30,41,59,0.45)",
    border: "1px solid rgba(255,255,255,0.10)",
    padding: window.innerWidth < 640 ? 16 : 18,
    display: "grid",
    gap: 10,
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap",
    }}
  >
    <div style={{ fontSize: 13, fontWeight: 900, opacity: 0.75, textTransform: "uppercase" }}>
  Ingredients ({checkedIngredients.length}/{ingredients.length})
</div>

    {ingredients.length > 0 && (
      <button
        style={btn}
        onClick={() => setCheckedIngredients([])}
      >
        Reset checks
      </button>
    )}
  </div>

  {ingredients.length === 0 ? (
    <div style={{ opacity: 0.7 }}>No ingredients saved.</div>
  ) : (
    <div style={{ display: "grid", gap: 8 }}>
      {ingredients.map((line, idx) => {
  const checked = checkedIngredients.includes(idx);
  const highlight = highlightedIngredients[idx];

        return (
          <button
            key={idx}
            onClick={() => toggleIngredient(idx)}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              width: "100%",
              textAlign: "left",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: highlight
  ? "0 0 0 1px rgba(234,179,8,0.35)"
  : "none",
              background: checked
  ? "rgba(20,184,166,0.22)"
  : highlight
  ? "rgba(234,179,8,0.18)"
  : "rgba(255,255,255,0.05)",
              color: "#f8fafc",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: 18,
                lineHeight: 1,
                marginTop: 1,
                opacity: checked ? 1 : 0.85,
              }}
            >
              {checked ? "✓" : "☐"}
            </span>

            <span
              style={{
                lineHeight: 1.45,
                textDecoration: checked ? "line-through" : "none",
                opacity: checked ? 0.7 : 1,
                fontWeight: checked ? 700 : 500,
              }}
            >
              {line}
            </span>
          </button>
        );
      })}
    </div>
  )}
</div>
        <div
          style={{ display: "flex", gap: 10, justifyContent: "space-between" }}
        >
          <button
            style={{
              ...btn,
              opacity: stepIndex === 0 ? 0.5 : 1,
              cursor: stepIndex === 0 ? "not-allowed" : "pointer",
            }}
            onClick={() => {
              setStepIndex((i) => Math.max(0, i - 1));
            }}
            disabled={stepIndex === 0}
          >
            ← Previous
          </button>

          <button
            style={{
              ...btn,
              opacity: stepIndex >= instructions.length - 1 ? 0.5 : 1,
              cursor:
                stepIndex >= instructions.length - 1
                  ? "not-allowed"
                  : "pointer",
            }}
            onClick={() => {
              setStepIndex((i) => Math.min(instructions.length - 1, i + 1));
            }}
            disabled={stepIndex >= instructions.length - 1}
          >
            Next →
          </button>
          <button
  style={btn}
  onClick={() => setCheckedIngredients(ingredients.map((_, i) => i))}
>
Prep complete
</button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: window.innerWidth < 640 ? "8px 8px 24px" : "24px",
        maxWidth: 980,
        margin: "0 auto",
      }}
    >
      <div
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}
      >
        <button style={btn} onClick={() => navigate(from)}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <ArrowLeft size={16} />
            Back
          </span>
        </button>

        <button style={btn} onClick={() => window.print()}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Printer size={16} />
            Print
          </span>
        </button>

        <button
          style={btn}
          onClick={async () => {
            const url = window.location.href;

            if (navigator.share) {
              try {
                await navigator.share({ title: recipe.name, url });
              } catch {}
            } else {
              await navigator.clipboard.writeText(url);
              alert("Link copied!");
            }
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Share2 size={16} />
            Share
          </span>
        </button>

        <button style={btn} onClick={() => setCookMode(true)}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            🍳 Cook Mode
          </span>
        </button>

        <button
          style={btn}
          onClick={() => {
            const res = addToCookbook(recipe);

            if (!res.ok) {
              alert("Could not add (missing slug).");
              return;
            }

            if (res.already) {
              alert("Already in cookbook.");
              return;
            }

            setCookbook(getCookbook() as any);
            alert("Added to cookbook!");
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Star size={16} />
            Add to Cookbook
          </span>
        </button>

        <button
          style={btn}
          onClick={() => {
            const result = addIngredientsToList(recipe.name, recipe.ingredients);
            alert(`Added ${result.addedCount} items to shopping list.`);
          }}
        >
          Add to shopping list
        </button>
      </div>

      <div style={card}>
        <div style={{ position: "relative", height: 280 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${heroUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(2,6,23,0.85), rgba(2,6,23,0.15))",
            }}
          />
          <div style={{ position: "absolute", left: 18, right: 18, bottom: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 950, lineHeight: 1.1 }}>
              {recipe.name}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              <span style={pill}>🧾 Ingredients: {ingredients.length || "—"}</span>
              <span style={pill}>✅ Steps: {instructions.length || "—"}</span>
            </div>
          </div>
        </div>

        <div style={section}>
          <div style={h3}>Ingredients</div>
          {ingredients.length === 0 ? (
            <div style={{ opacity: 0.7 }}>No ingredients saved.</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
              {ingredients.map((line, idx) => (
                <li key={idx} style={{ lineHeight: 1.5 }}>
                  {line}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={section}>
          <div style={h3}>Instructions</div>
          {instructions.length === 0 ? (
            <div style={{ opacity: 0.7 }}>No steps saved.</div>
          ) : (
            <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 10 }}>
              {instructions.map((line, idx) => (
                <li key={idx} style={{ lineHeight: 1.55 }}>
                  {line}
                </li>
              ))}
            </ol>
          )}
        </div>

        <div style={section}>
          <div style={h3}>Notes</div>
          <textarea
            placeholder="Optional notes (e.g. add hot sauce, swap pasta, double batch...)"
            style={{
              width: "100%",
              minHeight: 110,
              padding: "12px 12px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              fontSize: 14,
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>
      </div>
    </div>
  );
}