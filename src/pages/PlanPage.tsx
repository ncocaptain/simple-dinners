import React from "react";
import { days } from "../App";
import type { Effort } from "../App";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

type Day = (typeof days)[number];

export default function PlanPage({
  daySettings,
  setDaySettings,
  dietaryNotes,
  setDietaryNotes,
  vegetarian,
  setVegetarian,
  generateDinnerPlan,
}: {
  daySettings: Record<Day, Effort>;
  setDaySettings: React.Dispatch<
    React.SetStateAction<Record<Day, Effort>>
  >;
  dietaryNotes: string;
  setDietaryNotes: React.Dispatch<React.SetStateAction<string>>;
  vegetarian: boolean;
  setVegetarian: React.Dispatch<React.SetStateAction<boolean>>;
  generateDinnerPlan: () => void;
}) {
  const navigate = useNavigate();

  const card: React.CSSProperties = {
    maxWidth: 720,
    margin: "0 auto",
    padding: 24,
    borderRadius: 20,
    background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    gap: 22,
  };

  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    fontWeight: 600,
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
  };

  

  return (
    <div style={{ padding: 24 }}>
      <div style={card}>
        <div>
          <div
  style={{
    textAlign: "center",
    marginBottom: 24,
  }}
>
  <h1
    style={{
      margin: 0,
      fontSize: 32,
      fontWeight: 1000,
      letterSpacing: 0.5,
    }}
  >
    Plan Your Week
  </h1>

  <div
    style={{
      marginTop: 6,
      fontSize: 18,
      opacity: 0.7,
      letterSpacing: 0.3,
    }}
  >
    Smart dinner planning tailored to your schedule
  </div>
</div>

        </div>

        {days.map((day) => (
          <div key={day} style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 800 }}>{day}</div>
            <select
              value={daySettings[day] ?? "normal"}
              onChange={(e) =>
                setDaySettings((prev) => ({
                  ...prev,
                  [day]: e.target.value as Effort,
                }))
              }
              style={selectStyle}
            >
              <option value="quick">Quick Meal Needed</option>
              <option value="normal">Some Time</option>
              <option value="big">Plenty of Time</option>
              <option value="takeout">Eating Out / Takeout</option>
            </select>
          </div>
        ))}
<label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800 }}>
  <input
    type="checkbox"
    checked={vegetarian}
    onChange={(e) => setVegetarian(e.target.checked)}
  />
  Vegetarian meals only
</label>

        <div>
          <h2 style={{ marginBottom: 6 }}>Dietary Notes</h2>
          <textarea
            placeholder="Preferences or restrictions..."
            value={dietaryNotes}
            onChange={(e) => setDietaryNotes(e.target.value)}
            style={textarea}
          />
        </div>

        <Button
          onClick={() => {
            generateDinnerPlan();
            navigate("/week");
          }}
        >
          ✨ Generate My Dinner Plan
        </Button>
      </div>
    </div>
  );
}
