import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { candidateLibrary } from "../core/planner";
import { getRecipeBySlug, getCookbookRecipeBySlug } from "../core/recipeStore";
import { Printer, ArrowLeft, BookUser, ShoppingCart, Play, History, Star, X, ChevronRight, ChevronLeft, Timer, CheckCircle2 } from "lucide-react";
import { addIngredientsToList } from "../shoppingList";
import { recordCook, getCookHistoryFor } from "../core/cookHistoryStore";

// =====================================================
// Helpers
// =====================================================
function splitLines(s?: string) {
  return (s ?? "").split("\n").map((x) => x.trim()).filter(Boolean);
}

function findCandidateBySlug(slug: string) {
  const s = (slug || "").trim().toLowerCase();
  return candidateLibrary.find((r) => (r.slug || "").toLowerCase() === s) ?? null;
}

function parseStepDuration(step: string): number | null {
  const match = step.match(/(\d+)\s*(?:-|to)?\s*(\d+)?\s*(minute|min|minutes|hour|hr|hours)/i);
  if (!match) return null;
  const val = match[2] ? parseInt(match[2]) : parseInt(match[1]);
  const unit = match[3].toLowerCase();
  return unit.startsWith('h') ? val * 3600 : val * 60;
}

export default function RecipePage() {
  const navigate = useNavigate();
  const { slug = "" } = useParams();
  const location = useLocation();
  
  // Cook Mode Logic States
  const [cookMode, setCookMode] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [checkedIngredients, setCheckedIngredients] = React.useState<number[]>([]);
  const [timerSeconds, setTimerSeconds] = React.useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = React.useState(false);

  const qs = new URLSearchParams(location.search);
  const fromPath = qs.get("from") || "/week";

  const recipe = React.useMemo(() => {
    return getCookbookRecipeBySlug?.(slug) || getRecipeBySlug(slug) || findCandidateBySlug(slug);
  }, [slug]);

  if (!recipe) return <div style={{ padding: 24, color: "white" }}>Recipe not found.</div>;

  const history = getCookHistoryFor(recipe.slug || slug);
  const ingredients = splitLines(recipe?.ingredients ?? "");
  const instructions = splitLines(recipe?.instructions ?? "");
  const currentStep = instructions[stepIndex] || "";
  const detectedTime = parseStepDuration(currentStep);
  const heroUrl = recipe?.photoUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1400&q=80&sig=${encodeURIComponent(slug)}`;

  // Timer Effect
  React.useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerSeconds && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(s => s! - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      alert("Timer finished!");
      setTimerSeconds(null);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Styles
  const pill: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", fontSize: 12, fontWeight: 900, color: "#f8fafc" };
  const card: React.CSSProperties = { borderRadius: 20, overflow: "hidden", background: "rgba(30,41,59,0.40)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.10)", color: "#f8fafc" };
  const section: React.CSSProperties = { padding: 18, borderTop: "1px solid rgba(255,255,255,0.08)" };
  const h3: React.CSSProperties = { margin: "0 0 10px", fontSize: 14, textTransform: "uppercase", opacity: 0.7, fontWeight: 900 };
  const btn: React.CSSProperties = { padding: "12px 16px", borderRadius: 14, background: "rgba(255,255,255,0.06)", color: "#f8fafc", cursor: "pointer", fontWeight: 900, border: "1px solid rgba(255,255,255,0.12)", display: "inline-flex", alignItems: "center", gap: 8 };

  // =====================================================
  // THE INTERACTIVE COOK MODE VIEW
  // =====================================================
  if (cookMode) {
    return (
      <div style={{ padding: "16px", maxWidth: 600, margin: "0 auto", display: "grid", gap: 16 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button style={{ ...btn, padding: "8px 12px" }} onClick={() => setCookMode(false)}><X size={18} /> Exit</button>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 900, fontSize: 13 }}>Step {stepIndex + 1} of {instructions.length}</div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>Swipe left/right to move</div>
          </div>
        </header>

        <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "#14b8a6", width: `${((stepIndex + 1) / instructions.length) * 100}%`, transition: "width 0.3s ease" }} />
        </div>

        <div style={{ ...card, padding: 24, minHeight: 240, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 14, opacity: 0.5, fontWeight: 800, marginBottom: 8 }}>{recipe.name}</div>
          <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.4 }}>{currentStep}</div>
          
          {detectedTime && !timerSeconds && (
            <button 
              style={{ ...btn, marginTop: 20, background: "rgba(20,184,166,0.1)", borderColor: "#14b8a6" }}
              onClick={() => { setTimerSeconds(detectedTime); setIsTimerRunning(true); }}
            >
              <Timer size={18} /> Start {Math.floor(detectedTime/60)}m Timer
            </button>
          )}
          
          {timerSeconds !== null && (
            <div style={{ marginTop: 20, fontSize: 32, fontWeight: 900, color: "#14b8a6" }}>
              {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>

        <div style={{ ...card, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontWeight: 900, fontSize: 12, textTransform: "uppercase", opacity: 0.6 }}>Ingredients</span>
            <button style={{ background: "none", border: "none", color: "#14b8a6", fontWeight: 800, fontSize: 12, cursor: "pointer" }} onClick={() => setCheckedIngredients([])}>Reset</button>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {ingredients.map((ing, i) => {
              const isUsedInStep = currentStep.toLowerCase().includes(ing.split(' ')[2]?.toLowerCase() || "___");
              return (
                <label key={i} style={{ 
                  display: "flex", gap: 10, padding: 12, borderRadius: 10, cursor: "pointer",
                  background: isUsedInStep ? "rgba(234,179,8,0.15)" : "rgba(255,255,255,0.03)",
                  border: isUsedInStep ? "1px solid rgba(234,179,8,0.3)" : "1px solid transparent",
                  opacity: checkedIngredients.includes(i) ? 0.4 : 1
                }}>
                  <input type="checkbox" checked={checkedIngredients.includes(i)} onChange={() => setCheckedIngredients(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])} />
                  <span style={{ fontSize: 14, fontWeight: isUsedInStep ? 800 : 500, textDecoration: checkedIngredients.includes(i) ? "line-through" : "none" }}>{ing}</span>
                </label>
              );
            })}
          </div>
        </div>

        <footer style={{ display: "flex", gap: 12 }}>
          <button style={{ ...btn, flex: 1, opacity: stepIndex === 0 ? 0.3 : 1 }} onClick={() => setStepIndex(s => Math.max(0, s-1))} disabled={stepIndex === 0}>
            <ChevronLeft /> Previous
          </button>
          
          <button 
            style={{ ...btn, flex: 1.5, background: "#14b8a6", border: "none" }} 
            onClick={() => {
              if (stepIndex >= instructions.length - 1) {
                recordCook(recipe.slug || slug);
                alert("🎉 Great job! You made a tasty dinner.");
                setCookMode(false);
                setStepIndex(0);
              } else {
                setStepIndex(s => s + 1);
              }
            }}
          >
            {stepIndex >= instructions.length - 1 ? <><CheckCircle2 /> Finish 🍽️</> : <>Next Step <ChevronRight /></>}
          </button>

          <button style={{ ...btn, flex: 1 }} onClick={() => setCheckedIngredients(ingredients.map((_, i) => i))}>
            Prep Done
          </button>
        </footer>
      </div>
    );
  }

  // =====================================================
  // STANDARD VIEW
  // =====================================================
  return (
    <div style={{ padding: "24px", maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <button style={btn} onClick={() => navigate(fromPath)}>
          <ArrowLeft size={16} /> {fromPath === "/cookbook" ? "Back to Cookbook" : "Back"}
        </button>
        <button style={btn} onClick={() => window.print()}><Printer size={16} /> Print</button>
        
        <button 
          style={{ ...btn, background: "rgba(59,130,246,0.2)", borderColor: "rgba(59,130,246,0.4)" }} 
          onClick={() => { recordCook(recipe.slug || slug); setCookMode(true); }}
        >
          <Play size={16} fill="currentColor" /> Cook Mode
        </button>

        <button style={{ ...btn, background: "rgba(20,184,166,0.15)" }} onClick={() => { addIngredientsToList(recipe.name, recipe.ingredients); alert("Added to list!"); }}>
          <ShoppingCart size={16} /> Add to List
        </button>
      </div>

      <div style={card}>
        <div style={{ position: "relative", height: 280 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${heroUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(2,6,23,0.9), rgba(2,6,23,0.2))" }} />
          <div style={{ position: "absolute", left: 18, right: 18, bottom: 16 }}>
            <div style={{ fontSize: 32, fontWeight: 950 }}>{recipe.name}</div>
            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <span style={pill}>🧾 {ingredients.length} Ingredients</span>
              <span style={pill}>✅ {instructions.length} Steps</span>
              {recipe.favorite && <span style={{ ...pill, color: "#facc15" }}><Star size={14} fill="#facc15" /> Favorite</span>}
              {history.timesCooked > 0 && <span style={pill}><History size={14} /> Made {history.timesCooked}x</span>}
            </div>
          </div>
        </div>

        {recipe.notes && (
          <div style={{ ...section, background: "rgba(234,179,8,0.05)" }}>
            <div style={{ ...h3, color: "#eab308" }}><BookUser size={14} style={{ marginRight: 6 }} /> Private Notes</div>
            <div style={{ fontStyle: "italic", opacity: 0.9 }}>"{recipe.notes}"</div>
          </div>
        )}

        <div style={section}>
          <div style={h3}>Ingredients</div>
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
            {ingredients.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        </div>

        <div style={section}>
          <div style={h3}>Instructions</div>
          <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 12 }}>
            {instructions.map((line, i) => <li key={i} style={{ lineHeight: 1.6 }}>{line}</li>)}
          </ol>
        </div>
      </div>
    </div>
  );
}