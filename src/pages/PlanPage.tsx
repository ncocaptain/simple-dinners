import React from "react";
import { useNavigate } from "react-router-dom";
import { days } from "../core/data";
import Button from "../components/Button";
import type { Effort, PantryItem } from "../core/types";

export default function PlanPage({
  daySettings,
  setDaySettings,
  pantry,
  setPantry,
  vegetarian,
  setVegetarian,
  generateDinnerPlan,
  dietaryNotes,
  setDietaryNotes,
}: {
  daySettings: Record<string, Effort>;
  setDaySettings: React.Dispatch<React.SetStateAction<Record<string, Effort>>>;

  pantry: PantryItem[];
  setPantry: React.Dispatch<React.SetStateAction<PantryItem[]>>;

  vegetarian: boolean;
  setVegetarian: React.Dispatch<React.SetStateAction<boolean>>;

  generateDinnerPlan: (force?: boolean) => void;

  dietaryNotes: string;
  setDietaryNotes: React.Dispatch<React.SetStateAction<string>>;
}) {

  const navigate = useNavigate();
  // =====================================================
  // Builder: shared styles
  // =====================================================
  const card: React.CSSProperties = {
    width: "100%",
    maxWidth: 1200,
    margin: "0 auto",
    padding: "22px 12px",
    borderRadius: 20,
    background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    gap: 22,
  };

  const textarea: React.CSSProperties = {
    width: "100%",
    minHeight: 100,
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: "14px",
  };

  const pill: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const pillActive: React.CSSProperties = {
    background: "rgba(20,184,166,0.20)",
    border: "1px solid rgba(20,184,166,0.40)",
    color: "#14b8a6",
  };

  const secondaryBtn: React.CSSProperties = {
    padding: "12px 16px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.06)",
    color: "#f8fafc",
    cursor: "pointer",
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.12)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };

  // =====================================================
  // Builder: effort choices
  // =====================================================
  const effortOptions: { key: Effort; label: string }[] = [
    { key: "quick", label: "Quick" },
    { key: "normal", label: "Normal" },
    { key: "big", label: "Big cook" },
    { key: "takeout", label: "Takeout" },
  ];

  // =====================================================
  // Builder: local pantry input state
  // =====================================================
  const [pantryText, setPantryText] = React.useState(
    pantry.map((p) => p.name).join(", ")
  );

  React.useEffect(() => {
    setPantryText(pantry.map((p) => p.name).join(", "));
  }, [pantry]);

  // =====================================================
  // Builder: persist pantry textarea into pantry items
  // =====================================================
  const commitPantry = () => {
    const tokens = pantryText
      .split(/[\n,]/g)
      .map((t) => t.trim())
      .filter(Boolean);

    setPantry(
      tokens.map((name) => ({
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        createdAt: Date.now(),
      }))
    );
  };

  // =====================================================
  // Builder: planner actions
  // =====================================================
  const handleGenerate = () => {
    commitPantry();
    generateDinnerPlan();
  };

  const handleGenerateAgain = () => {
    commitPantry();
    generateDinnerPlan(true);
  };

  // =====================================================
  // Builder: page UI
  // =====================================================
  return (
    <div style={{ padding: "18px 6px" }}>
      <div style={card}>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <h2 className="cardTitle">Plan Your Week</h2>
          <div className="readableText">
            Choose your effort level for each day
          </div>
        </div>

        {/* =====================================================
            Builder: day-by-day effort settings
        ====================================================== */}
        {days.map((day) => (
          <div
            key={day}
            style={{
              display: "grid",
              gap: 8,
              paddingBottom: 10,
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div className="dayLabel">{day}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {effortOptions.map((opt) => {
                const active = (daySettings[day] ?? "normal") === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() =>
                      setDaySettings((prev) => ({ ...prev, [day]: opt.key }))
                    }
                    style={{ ...pill, ...(active ? pillActive : {}) }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* =====================================================
            Builder: preference inputs
        ====================================================== */}
        <div style={{ display: "grid", gap: 20, marginTop: 10 }}>
          <label
            className="sectionLabel"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <input
              type="checkbox"
              checked={vegetarian}
              onChange={(e) => setVegetarian(e.target.checked)}
            />
            Vegetarian meals only
          </label>

          <div>
            <h3 className="sectionLabel">What's in your kitchen?</h3>
            <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>
              List ingredients you have (comma separated). We&apos;ll prioritize these.
            </div>

            <textarea
              placeholder="e.g. Chicken, Spinach, Rice, Onions"
              value={pantryText}
              onChange={(e) => setPantryText(e.target.value)}
              onBlur={commitPantry}
              style={textarea}
            />
          </div>

          <div>
            <h3 className="sectionLabel">Dietary Notes</h3>
            <textarea
              placeholder="Allergies, dislikes, or other preferences..."
              value={dietaryNotes}
              onChange={(e) => setDietaryNotes(e.target.value)}
              style={textarea}
            />
          </div>
        </div>

        {/* =====================================================
            Builder: planner action buttons
        ====================================================== */}
        <div
          style={{
            display: "grid",
            gap: 10,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            alignItems: "stretch",
          }}
        >
          <Button onClick={handleGenerate}>✨ Generate My Dinner Plan</Button>
          <Button
  variant="secondary"
  onClick={() => {
    commitPantry();
    navigate("/cook-now");
  }}
>
  🍳 What Can I Cook Right Now?
</Button>

          <button type="button" onClick={handleGenerateAgain} style={secondaryBtn}>
            🔄 Generate Again
          </button>
        </div>
      </div>
    </div>
  );
}