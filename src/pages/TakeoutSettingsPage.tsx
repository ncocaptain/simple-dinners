import React from "react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import {
  DEFAULT_TAKEOUT_CATEGORIES,
  loadTakeoutCategories,
  saveTakeoutCategories,
  type TakeoutCategory,
} from "../core/takeout";
import FeedbackForm from "../components/FeedbackForm";

function cleanCats(cats: TakeoutCategory[]) {
  // remove empties + trim
  return cats
    .map((c) => ({
      emoji: (c.emoji || "🍴").trim(),
      label: (c.label || "").trim(),
      query: (c.query || "").trim(),
    }))
    .filter((c) => c.label.length > 0 && c.query.length > 0);
}

export default function TakeoutSettingsPage() {
  const navigate = useNavigate();
  const [cats, setCats] = React.useState<TakeoutCategory[]>(() => loadTakeoutCategories());

  React.useEffect(() => {
    saveTakeoutCategories(cats);
  }, [cats]);

  const input: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    fontSize: 14,
    outline: "none",
  };

  const iconBtn: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  };

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#f8fafc" }}>Takeout Categories</h2>
          <div style={{ marginTop: 6, opacity: 0.75, fontWeight: 700, fontSize: 13 }}>
            These show up on “Takeout Night” and open nearby results.
          </div>
        </div>

        <Button variant="secondary" onClick={() => navigate("/week")}>
          ← Back
        </Button>
      </div>

      <div
        style={{
          marginTop: 18,
          padding: 18,
          borderRadius: 18,
          background: "rgba(15,23,42,0.2)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <div style={{ display: "grid", gap: 12 }}>
          {cats.map((c, idx) => (
            <div
              key={`${c.label}-${idx}`}
              style={{
                display: "grid",
                gridTemplateColumns: "70px 1fr 1.2fr 40px",
                gap: 10,
                alignItems: "center",
                padding: 12,
                borderRadius: 16,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <input
                value={c.emoji}
                onChange={(e) => {
                  const v = e.target.value;
                  setCats((prev) => prev.map((x, i) => (i === idx ? { ...x, emoji: v } : x)));
                }}
                placeholder="🍔"
                style={{ ...input, textAlign: "center" }}
              />

              <input
                value={c.label}
                onChange={(e) => {
                  const v = e.target.value;
                  setCats((prev) => prev.map((x, i) => (i === idx ? { ...x, label: v } : x)));
                }}
                placeholder="Label (e.g. Thai)"
                style={input}
              />

              <input
                value={c.query}
                onChange={(e) => {
                  const v = e.target.value;
                  setCats((prev) => prev.map((x, i) => (i === idx ? { ...x, query: v } : x)));
                }}
                placeholder='Search query (e.g. "thai restaurant")'
                style={input}
              />

              <button
                type="button"
                onClick={() => setCats((prev) => prev.filter((_, i) => i !== idx))}
                style={iconBtn}
                aria-label="Remove category"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          <Button
            onClick={() =>
              setCats((prev) => [
                ...prev,
                { emoji: "🍴", label: "New", query: "restaurants" },
              ])
            }
          >
            ➕ Add category
          </Button>

          <Button
            variant="secondary"
            onClick={() => setCats(DEFAULT_TAKEOUT_CATEGORIES)}
          >
            ♻️ Reset defaults
          </Button>

          <Button
            variant="secondary"
            onClick={() => setCats((prev) => cleanCats(prev))}
          >
            ✨ Clean up
          </Button>
        </div>
      </div>

      <div style={{ marginTop: 14, opacity: 0.7, fontSize: 13, fontWeight: 700 }}>
        Tip: Make queries specific (e.g., “thai restaurant”, “bbq”, “burgers”) for better results.
      </div>

      <style>{`
        @media (max-width: 900px) {
          .takeoutRow { grid-template-columns: 70px 1fr 1fr 40px; }
        }
        @media (max-width: 700px) {
          .takeoutRow { grid-template-columns: 70px 1fr; }
        }
      `}</style>
    </div>
  );
  // Place it at the bottom of your existing settings
return (
  <div style={{ padding: 24 }}>
    {/* ... your existing takeout settings ... */}
    <div style={{ marginTop: 40 }}>
      <FeedbackForm />
    </div>
  </div>
);
}