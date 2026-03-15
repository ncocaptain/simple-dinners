import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { candidateLibrary } from "../core/planner";
import { getRecipeBySlug, getCookbookRecipeBySlug } from "../core/recipeStore";
import { 
  Printer, ArrowLeft, BookUser, ShoppingCart, Play, History, 
  Star, X, ChevronRight, ChevronLeft, Timer, CheckCircle2, Share2 
} from "lucide-react";
import { addIngredientsToList } from "../shoppingList";
import { recordCook, getCookHistoryFor } from "../core/cookHistoryStore";
import { PUBLIC_APP_URL } from "../core/appConfig";

// --- HELPERS ---
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

function scaleIngredient(line: string, factor: number): string {
  // Regex to find numbers, decimals, or fractions at the start of the line
  return line.replace(/^(\d+\/\d+|\d+\s\d+\/\d+|\d+(\.\d+)?)/g, (match) => {
    let value = 0;

    if (match.includes('/')) {
      // Handle "1 1/2" style fractions
      const parts = match.split(' ');
      if (parts.length === 2) {
        const [num, den] = parts[1].split('/').map(Number);
        value = Number(parts[0]) + (num / den);
      } else {
        // Handle "1/2" style fractions
        const [num, den] = parts[0].split('/').map(Number);
        value = num / den;
      }
    } else {
      value = parseFloat(match);
    }

    const scaled = value * factor;
    
    // If the result is a whole number, keep it simple. 
    // If it's a decimal, round to 2 places (e.g., 0.33)
    return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(2).replace(/\.?0+$/, "");
  });
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
  const pill: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", fontSize: 13, fontWeight: 800, color: "#f8fafc" };
  const card: React.CSSProperties = { borderRadius: 32, overflow: "hidden", background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)", color: "#f8fafc", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" };
  const section: React.CSSProperties = { padding: "32px 28px", borderTop: "1px solid rgba(255,255,255,0.08)" };
  const h3: React.CSSProperties = { margin: "0 0 20px", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.6, fontWeight: 900 };
  const btn: React.CSSProperties = { padding: "14px 20px", borderRadius: 16, background: "rgba(255,255,255,0.06)", color: "#f8fafc", cursor: "pointer", fontWeight: 900, border: "1px solid rgba(255,255,255,0.12)", display: "inline-flex", alignItems: "center", gap: 10 };

  const recipe = useMemo(() => {
    return getCookbookRecipeBySlug?.(slug) || getRecipeBySlug(slug) || findCandidateBySlug(slug);
  }, [slug]);

  // --- TIMER EFFECT ---
  useEffect(() => {
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

  if (!recipe) return <div style={{ padding: 24, color: "white" }}>Recipe not found.</div>;

  const history = getCookHistoryFor(recipe.slug || slug);
  const rawIngredients = splitLines(recipe?.ingredients ?? "");
  const ingredients = useMemo(() => rawIngredients.map(line => scaleIngredient(line, servingFactor)), [rawIngredients, servingFactor]);
  const instructions = splitLines(recipe?.instructions ?? "");
  const currentStep = instructions[stepIndex] || "";
  const detectedTime = parseStepDuration(currentStep);
  const heroUrl = recipe?.photoUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1400&q=80&sig=${encodeURIComponent(slug)}`;

  // --- VIEW 1: COOK MODE ---
  if (cookMode) {
    return (
      <div style={{ padding: "16px", maxWidth: 600, margin: "0 auto", display: "grid", gap: 16 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button style={{ ...btn, padding: "8px 12px" }} onClick={() => setCookMode(false)}><X size={18} /> Exit</button>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 900, fontSize: 13 }}>Step {stepIndex + 1} of {instructions.length}</div>
          </div>
        </header>
        <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "#14b8a6", width: `${((stepIndex + 1) / instructions.length) * 100}%`, transition: "width 0.3s ease" }} />
        </div>
        <div 
          style={{ ...card, padding: 24, minHeight: 240, display: "flex", flexDirection: "column", justifyContent: "center", touchAction: "none" }}
          onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
          onTouchEnd={(e) => {
            if (!touchStart) return;
            const distance = touchStart - e.changedTouches[0].clientX;
            if (distance > 50) setStepIndex(s => Math.min(instructions.length - 1, s + 1));
            if (distance < -50) setStepIndex(s => Math.max(0, s - 1));
            setTouchStart(null);
          }}
        >
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
              {Math.floor(timerSeconds/60)}:{(timerSeconds%60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
        <footer style={{ display: "flex", gap: 12 }}>
            <button style={{ ...btn, flex: 1 }} onClick={() => setStepIndex(s => Math.max(0, s-1))} disabled={stepIndex === 0}>
              <ChevronLeft size={18} /> Back
            </button>
            <button style={{ ...btn, flex: 1.5, background: "#14b8a6", border: "none" }} onClick={() => stepIndex >= instructions.length - 1 ? setCookMode(false) : setStepIndex(s => s + 1)}>
              {stepIndex >= instructions.length - 1 ? <><CheckCircle2 /> Finish</> : <>Next <ChevronRight /></>}
            </button>
        </footer>
      </div>
    );
  }

  // --- VIEW 2: STANDARD DETAIL ---
  return (
    <div style={{ padding: "32px 20px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
        <button style={btn} onClick={() => navigate(fromPath)}>
          <ArrowLeft size={18} /> {fromPath === "/cookbook" ? "Cookbook" : "Back"}
        </button>
        
        <button 
          style={{ ...btn, background: "#14b8a6", border: "none" }} 
          onClick={() => { recordCook(recipe.slug || slug); setCookMode(true); }}
        >
          <Play size={18} fill="currentColor" /> Enter Cook Mode
        </button>

        {/* Serving Scaler - FIXES setServingFactor unused error */}
        <div style={{ ...btn, background: "rgba(255,255,255,0.03)", gap: 15 }}>
          <span style={{ fontSize: 11, opacity: 0.6 }}>SCALE:</span>
          <button onClick={() => setServingFactor(0.5)} style={{ color: servingFactor === 0.5 ? "#14b8a6" : "inherit", background: 'none', border: 'none', fontWeight: 900, cursor: 'pointer' }}>½x</button>
          <button onClick={() => setServingFactor(1)} style={{ color: servingFactor === 1 ? "#14b8a6" : "inherit", background: 'none', border: 'none', fontWeight: 900, cursor: 'pointer' }}>1x</button>
          <button onClick={() => setServingFactor(2)} style={{ color: servingFactor === 2 ? "#14b8a6" : "inherit", background: 'none', border: 'none', fontWeight: 900, cursor: 'pointer' }}>2x</button>
        </div>

        <button style={btn} onClick={() => window.print()}><Printer size={18} /> Print</button>

        <button 
          style={btn} 
          onClick={async () => {
            await navigator.clipboard.writeText(`${PUBLIC_APP_URL}/recipe/${recipe.slug || slug}`);
            alert("Link copied!");
          }}
        >
          <Share2 size={18} />
        </button>

        <button style={btn} onClick={() => { addIngredientsToList(recipe.name, ingredients.join("\n")); alert("Added to list!"); }}>
          <ShoppingCart size={18} /> List
        </button>
      </div>

      <div style={card}>
        <div style={{ position: "relative", height: 340 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${heroUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,1) 5%, rgba(15,23,42,0.4) 50%, transparent 100%)" }} />
          <div style={{ position: "absolute", left: 28, right: 28, bottom: 24 }}>
            <h1 style={{ fontSize: "42px", fontWeight: 950, lineHeight: 1.1, margin: 0 }}>{recipe.name}</h1>
            <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
              <span style={pill}>🧾 {ingredients.length} Ingredients</span>
              <span style={pill}>✅ {instructions.length} Steps</span>
              {recipe.favorite && <span style={{ ...pill, color: "#facc15" }}><Star size={16} fill="#facc15" /> Favorite</span>}
              {history.timesCooked > 0 && <span style={pill}><History size={16} /> Made {history.timesCooked}x</span>}
            </div>
          </div>
        </div>

        {recipe.notes && (
          <div style={{ ...section, background: "rgba(20,184,166,0.05)", borderLeft: "4px solid #14b8a6" }}>
            <div style={{ ...h3, color: "#14b8a6" }}><BookUser size={16} style={{ marginRight: 8 }} /> The Captain's Notes</div>
            <div style={{ fontSize: "17px", lineHeight: 1.6, fontStyle: "italic", opacity: 0.9 }}>"{recipe.notes}"</div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          <div style={{ ...section, borderRight: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={h3}>Ingredients</div>
              <button onClick={() => setCheckedIngredients([])} style={{ fontSize: 11, fontWeight: 900, color: "#14b8a6", background: 'none', border: 'none' }}>RESET</button>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 12 }}>
              {ingredients.map((line, i) => (
                <li key={i} onClick={() => setCheckedIngredients(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])} style={{ fontSize: "17px", display: "flex", gap: 12, cursor: 'pointer', opacity: checkedIngredients.includes(i) ? 0.3 : 1 }}>
                  <span style={{ color: "#14b8a6", marginTop: 4 }}>{checkedIngredients.includes(i) ? <CheckCircle2 size={16} /> : "•"}</span>
                  <span style={{ textDecoration: checkedIngredients.includes(i) ? 'line-through' : 'none' }}>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={section}>
            <div style={h3}>Instructions</div>
            <div style={{ display: "grid", gap: 24 }}>
              {instructions.map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 16 }}>
                  <span style={{ fontSize: "13px", fontWeight: 900, color: "#14b8a6", background: "rgba(20,184,166,0.1)", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, flexShrink: 0 }}>{i + 1}</span>
                  <p style={{ margin: 0, fontSize: "18px", lineHeight: 1.7, opacity: 0.9 }}>{line}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}