import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  // =====================================================
  // Updated Styles for Symmetry & Breathability
  // =====================================================
  const card: React.CSSProperties = {
    width: "100%",
    maxWidth: 800, // Reduced from 1200 for a more focused "Form" feel
    margin: "0 auto",
    padding: "32px 24px", // Increased padding
    borderRadius: 24, // Consistent with our new Card look
    background: "rgba(15,23,42,0.8)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    gap: 32, // More space between sections
    boxSizing: "border-box"
  };

  const textarea: React.CSSProperties = {
    width: "100%",
    minHeight: 120,
    padding: 16,
    borderRadius: 16,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "white",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: "16px", // Better for thumb-typing
    marginTop: 8,
  };

  const pill: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.7)",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const pillActive: React.CSSProperties = {
    background: "rgba(20,184,166,0.15)",
    border: "1px solid rgba(20,184,166,0.5)",
    color: "#14b8a6",
  };

  const secondaryBtn: React.CSSProperties = {
    padding: "14px 20px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.04)",
    color: "#f8fafc",
    cursor: "pointer",
    fontWeight: 800,
    border: "1px solid rgba(255,255,255,0.1)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };

  const effortOptions: { key: Effort; label: string }[] = [
    { key: "quick", label: "Quick" },
    { key: "normal", label: "Normal" },
    { key: "big", label: "Big cook" },
    { key: "takeout", label: "Takeout" },
  ];

  const [pantryText, setPantryText] = React.useState(
    pantry.map((p) => p.name).join(", ")
  );

  React.useEffect(() => {
    setPantryText(pantry.map((p) => p.name).join(", "));
  }, [pantry]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("first") === "true") {
      generateDinnerPlan();
    }
  }, []);

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

  const handleGenerate = () => {
    commitPantry();
    generateDinnerPlan();
  };

  return (
    <div style={{ padding: "20px 16px 60px 16px" }}> {/* External symmetry */}
      <div style={card}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 8 }}>Plan Your Week</h2>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>
            Choose your effort level for each day
          </div>
        </div>

        {/* Effort Selection Grid */}
        <div style={{ display: "grid", gap: 20 }}>
          {days.map((day) => (
            <div
              key={day}
              style={{
                display: "grid",
                gap: 12,
                paddingBottom: 20,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 14, color: "rgba(20,184,166,0.9)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {day}
              </div>
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
        </div>

        {/* Preference Section */}
        <div style={{ display: "grid", gap: 28 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
            <input
              type="checkbox"
              style={{ width: 20, height: 20, accentColor: "#14b8a6" }}
              checked={vegetarian}
              onChange={(e) => setVegetarian(e.target.checked)}
            />
            Vegetarian meals only
          </label>

          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>What's in your kitchen?</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
              List ingredients you have (comma separated).
            </p>
            <textarea
              placeholder="e.g. Chicken, Spinach, Rice"
              value={pantryText}
              onChange={(e) => setPantryText(e.target.value)}
              onBlur={commitPantry}
              style={textarea}
            />
          </div>

          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Dietary Notes</h3>
            <textarea
              placeholder="Allergies, dislikes, or other preferences..."
              value={dietaryNotes}
              onChange={(e) => setDietaryNotes(e.target.value)}
              style={textarea}
            />
          </div>
        </div>

        {/* Action Buttons Container */}
        <div style={{ display: "grid", gap: 12, marginTop: 10 }}>
          <Button onClick={handleGenerate} style={{ height: 56, fontSize: 18 }}>✨ Generate My Dinner Plan</Button>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <button 
              type="button" 
              onClick={() => { commitPantry(); navigate("/cook-now"); }} 
              style={secondaryBtn}
            >
              🍳 Cook Now
            </button>
            <button 
              type="button" 
              onClick={() => { commitPantry(); generateDinnerPlan(true); }} 
              style={secondaryBtn}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}