import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, Utensils, Info } from "lucide-react";
import { days } from "../core/data";
import Button from "../components/Button";
import Card from "../components/Card";
import type { Effort, PantryItem } from "../core/types";

export default function PlanPage({
  daySettings,
  setDaySettings,
  pantry,
  setPantry,
  generateDinnerPlan,
  dietaryNotes,
  setDietaryNotes,
}: {
  daySettings: Record<string, Effort>;
  setDaySettings: React.Dispatch<React.SetStateAction<Record<string, Effort>>>;
  pantry: PantryItem[];
  setPantry: React.Dispatch<React.SetStateAction<PantryItem[]>>;
  generateDinnerPlan: (force?: boolean) => void;
  dietaryNotes: string;
  setDietaryNotes: React.Dispatch<React.SetStateAction<string>>;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [pantryText, setPantryText] = React.useState(
    pantry.map((p) => p.name).join(", ")
  );

  useEffect(() => {
    setPantryText(pantry.map((p) => p.name).join(", "));
  }, [pantry]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("first") === "true") {
      generateDinnerPlan();
    }
  }, []);

  const commitPantry = () => {
    const tokens = pantryText.split(/[\n,]/g).map((t) => t.trim()).filter(Boolean);
    setPantry(tokens.map((name) => ({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      createdAt: Date.now(),
    })));
  };

  const handleGenerate = () => {
    commitPantry();
    generateDinnerPlan();
  };

  const effortOptions: { key: Effort; label: string }[] = [
    { key: "quick", label: "Quick" },
    { key: "normal", label: "Normal" },
    { key: "big", label: "Big cook" },
    { key: "takeout", label: "Takeout" },
  ];

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "16px", borderRadius: "16px",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    color: "white", fontSize: "16px", fontFamily: "inherit", outline: "none", boxSizing: "border-box"
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ maxWidth: "550px", width: "100%", padding: "0 20px 120px 20px", display: "grid", gap: 24 }}>
        <Card title={<><Sparkles size={22} /> Plan Your Week</>} subtitle="Set your daily effort and kitchen status.">
          <div style={{ display: "grid", gap: 20, marginBottom: 12 }}>
            {days.map((day) => (
              <div key={day} style={{ paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontWeight: 900, fontSize: 13, color: "#22c55e", textTransform: "uppercase", marginBottom: 12 }}>
                  {day}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {effortOptions.map((opt) => {
                    const active = (daySettings[day] ?? "normal") === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => setDaySettings((prev) => ({ ...prev, [day]: opt.key }))}
                        style={{
                          padding: "10px 14px", borderRadius: "12px", border: "1px solid",
                          borderColor: active ? "#22c55e" : "rgba(255,255,255,0.1)",
                          background: active ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.03)",
                          color: active ? "#22c55e" : "rgba(255,255,255,0.5)",
                          fontWeight: 800, fontSize: 13, cursor: "pointer", transition: "all 0.2s"
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gap: 24, marginTop: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Utensils size={18} style={{ opacity: 0.5 }} />
                <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>In the Kitchen</h3>
              </div>
              <textarea
                placeholder="Chicken, Spinach, Rice..."
                value={pantryText}
                onChange={(e) => setPantryText(e.target.value)}
                onBlur={commitPantry}
                style={{ ...inputBase, minHeight: 100 }}
              />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Info size={18} style={{ opacity: 0.5 }} />
                <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>Dietary Notes</h3>
              </div>
              <textarea
                placeholder="Dislikes, allergies, or picky eaters..."
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                style={{ ...inputBase, minHeight: 100 }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gap: 12, marginTop: 32 }}>
            <Button onClick={handleGenerate} style={{ padding: "20px", fontSize: 18 }}>
              ✨ Generate New Plan
            </Button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button 
                onClick={() => { commitPantry(); navigate("/cook-now"); }} 
                style={{ padding: "16px", borderRadius: "16px", background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", fontWeight: 800, cursor: "pointer" }}
              >
                🍳 Cook Now
              </button>
              <button 
                onClick={() => { commitPantry(); generateDinnerPlan(true); }} 
                style={{ padding: "16px", borderRadius: "16px", background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", fontWeight: 800, cursor: "pointer" }}
              >
                🔄 Re-Roll
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}