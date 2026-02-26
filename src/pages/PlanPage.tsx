import React from "react";
import { days } from "../core/data";
import Button from "../components/Button";
import type { Effort, PantryItem } from "../core/types";



type Day = (typeof days)[number];

export default function PlanPage({
  daySettings,
  setDaySettings,
  dietaryNotes,
  setDietaryNotes,
  vegetarian,
  setVegetarian,
  generateDinnerPlan,
  pantry,
  setPantry,
}: {
  daySettings: Record<Day, Effort>;
  setDaySettings: React.Dispatch<React.SetStateAction<Record<Day, Effort>>>;
  dietaryNotes: string;
  setDietaryNotes: React.Dispatch<React.SetStateAction<string>>;
  vegetarian: boolean;
  setVegetarian: React.Dispatch<React.SetStateAction<boolean>>;
  pantry: PantryItem[];
  setPantry: React.Dispatch<React.SetStateAction<PantryItem[]>>;
  generateDinnerPlan: () => void;
}) {
  
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

  // --- Styles ---
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

  const effortOptions: { key: Effort; label: string }[] = [
    { key: "quick", label: "Quick" },
    { key: "normal", label: "Normal" },
    { key: "big", label: "Big cook" },
    { key: "takeout", label: "Takeout" },
  ];

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

  // Local state for the pantry text to prevent cursor jumping
  const [pantryText, setPantryText] = React.useState(pantry.map((p) => p.name).join(", "));
  React.useEffect(() => {
  setPantryText(pantry.map((p) => p.name).join(", "));
}, [pantry]);


    return (
    <div style={{ padding: "18px 6px" }}>
      <div style={card}>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <h2 className="cardTitle">Plan Your Week</h2>
          <div className="readableText">
  Choose your effort level for each day
</div>
        </div>

        {days.map((day) => (
          <div key={day} style={{ display: "grid", gap: 8, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="dayLabel">{day}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {effortOptions.map((opt) => {
                const active = (daySettings[day] ?? "normal") === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setDaySettings((prev) => ({ ...prev, [day]: opt.key }))}
                    style={{ ...pill, ...(active ? pillActive : {}) }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ display: "grid", gap: 20, marginTop: 10 }}>
          {/* Vegetarian Toggle */}
          <label className="sectionLabel" style={{ display: "flex", alignItems: "center", gap: 8 }}>
  <input
  type="checkbox"
  checked={vegetarian}
  onChange={(e) => setVegetarian(e.target.checked)}
/>
  Vegetarian meals only
</label>

          {/* Pantry Input */}
          <div>
            <h3 className="sectionLabel">
  What's in your kitchen?
</h3>
            <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>
              List ingredients you have (comma separated). We'll prioritize these.
            </div>
            <textarea
  placeholder="e.g. Chicken, Spinach, Rice, Onions"
  value={pantryText}
  onChange={(e) => setPantryText(e.target.value)}
  onBlur={() => commitPantry()}
  style={textarea}
/>
          </div>

          {/* Dietary Notes */}
          <div>
            <h3 className="sectionLabel">
  Dietary Notes
</h3>
            <textarea
              placeholder="Allergies, dislikes, or other preferences..."
              value={dietaryNotes}
              onChange={(e) => setDietaryNotes(e.target.value)}
              style={textarea}
            />
          </div>
        </div>

        <Button onClick={generateDinnerPlan}>✨ Generate My Dinner Plan</Button>

      </div>
    </div>
  );
}