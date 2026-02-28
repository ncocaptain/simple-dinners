import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { candidateLibrary } from "../core/planner";
import { getRecipeBySlug, getCookbookRecipeBySlug } from "../core/recipeStore";

function splitLines(s?: string) {
  return (s ?? "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

// keep helpers OUTSIDE the component (less re-creation, cleaner)
function findCandidateBySlug(slug: string) {
  const s = (slug || "").trim().toLowerCase();
  return (
    candidateLibrary.find((r) => (r.slug || "").toLowerCase() === s) ?? null
  );
}

export default function RecipePage() {
  const navigate = useNavigate();
  const { slug = "" } = useParams();
  const location = useLocation();

  const qs = new URLSearchParams(location.search);
  const from = qs.get("from") || "/week";

  // Source of truth: recipeStore → cookbook → candidateLibrary
  // Ratings stay locked to cookbook: candidateLibrary gets rating fields stripped.
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

  const heroUrl =
    recipe.photoUrl ||
    `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1400&q=80&sig=${encodeURIComponent(
      slug
    )}`;

  const ingredients = splitLines(recipe.ingredients ?? "");
  const instructions = splitLines(recipe.instructions ?? "");

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
  };

  return (
    <div
  style={{
    padding: window.innerWidth < 640
      ? "8px 8px 24px"
      : "24px",
    maxWidth: 980,
    margin: "0 auto",
  }}
>
      {/* Breadcrumbs */}
      

      {/* Action row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <button style={btn} onClick={() => navigate(from)}>
          ← Back
        </button>
        <button style={btn} onClick={() => window.print()}>
          🖨️ Print
        </button>
        <button
  style={btn}
  onClick={async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.name,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  }}
>
  📤 Share
</button>
<button
  style={btn}
  onClick={() => {
    const raw = localStorage.getItem("simple-dinners:cookbook:v1");
    const existing = raw ? JSON.parse(raw) : [];

    const already = existing.find((r: any) => r.slug === recipe.slug);

    if (already) {
      alert("Already in cookbook.");
      return;
    }

    const updated = [...existing, recipe];
    localStorage.setItem(
      "simple-dinners:cookbook:v1",
      JSON.stringify(updated)
    );

    alert("Added to cookbook!");
  }}
>
  ⭐ Add to Cookbook
</button>
      </div>

      {/* Flow Card */}
      <div style={card}>
        {/* Hero */}
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
              background: "linear-gradient(to top, rgba(2,6,23,0.85), rgba(2,6,23,0.15))",
            }}
          />
          <div style={{ position: "absolute", left: 18, right: 18, bottom: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 950, lineHeight: 1.1 }}>{recipe.name}</div>
               <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              <span style={pill}>🧾 Ingredients: {ingredients.length || "—"}</span>
              <span style={pill}>✅ Steps: {instructions.length || "—"}</span>
            </div>
          </div>
        </div>

        {/* Ingredients */}
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

        {/* Instructions */}
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

        {/* Notes */}
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