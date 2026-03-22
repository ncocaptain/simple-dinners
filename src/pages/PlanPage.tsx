import React, { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sparkles,
  Utensils,
  Info,
  Refrigerator,
  ChevronRight,
} from "lucide-react";
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
  prefs,
  setPrefs,
}: {
  daySettings: Record<string, Effort>;
  setDaySettings: React.Dispatch<React.SetStateAction<Record<string, Effort>>>;
  pantry: PantryItem[];
  setPantry: React.Dispatch<React.SetStateAction<PantryItem[]>>;
  generateDinnerPlan: (force?: boolean) => void;
  prefs: any;
  setPrefs: any;
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

  const pantryItems = useMemo(() => {
    return pantryText
      .split(/[\n,]/g)
      .map((t) => t.trim())
      .filter(Boolean);
  }, [pantryText]);

  const commitPantry = () => {
    const unique = Array.from(
      new Map(
        pantryItems.map((name) => [
          name.toLowerCase(),
          {
            id: name.toLowerCase().replace(/\s+/g, "-"),
            name,
            createdAt: Date.now(),
          },
        ])
      ).values()
    );

    setPantry(unique);
  };

  const removePantryItem = (nameToRemove: string) => {
    const nextItems = pantryItems.filter(
      (item) => item.toLowerCase() !== nameToRemove.toLowerCase()
    );
    const nextText = nextItems.join(", ");
    setPantryText(nextText);

    setPantry(
      nextItems.map((name) => ({
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        createdAt: Date.now(),
      }))
    );
  };

  const handleDietaryNotesChange = (text: string) => {
    const nextPrefs = { ...prefs, dietaryNotes: text };
    setPrefs(nextPrefs);
    localStorage.setItem("prefs", JSON.stringify(nextPrefs));
  };

  const handleGenerate = () => {
    commitPantry();
    generateDinnerPlan();
  };

  const handleReroll = () => {
    commitPantry();
    generateDinnerPlan(true);
  };

  const handleCookNow = () => {
    commitPantry();
    navigate("/cook-now");
  };

  const effortOptions: { key: Effort; label: string }[] = [
    { key: "quick", label: "Quick" },
    { key: "normal", label: "Normal" },
    { key: "big", label: "Big cook" },
    { key: "takeout", label: "Takeout" },
  ];

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "16px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "white",
    fontSize: "16px",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  const sectionTitleRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          maxWidth: "550px",
          width: "100%",
          padding: "0 20px 120px 20px",
          display: "grid",
          gap: 24,
        }}
      >
        <Card
          title={
            <>
              <Sparkles size={22} />
              Kitchen & Plan
            </>
          }
          subtitle="Use what you already have, set your week, and generate smarter dinners."
        >
          <div style={{ display: "grid", gap: 24 }}>
            <section
              style={{
                padding: 16,
                borderRadius: 20,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={sectionTitleRow}>
                <Refrigerator size={18} style={{ opacity: 0.6 }} />
                <h3 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>
                  What’s In Your Kitchen
                </h3>
              </div>

              <p
                style={{
                  margin: "0 0 12px 0",
                  fontSize: 14,
                  opacity: 0.62,
                  lineHeight: 1.4,
                }}
              >
                Add ingredients you already have. Your weekly plan will prefer
                meals that use them.
              </p>

              {!!pantryItems.length && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  {pantryItems.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => removePantryItem(item)}
                      style={{
                        border: "none",
                        borderRadius: 999,
                        padding: "8px 12px",
                        background: "rgba(34,197,94,0.14)",
                        color: "#86efac",
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                      title="Remove item"
                    >
                      {item} ×
                    </button>
                  ))}
                </div>
              )}

              <textarea
                placeholder="Chicken, spinach, rice, pasta sauce..."
                value={pantryText}
                onChange={(e) => setPantryText(e.target.value)}
                onBlur={commitPantry}
                style={{ ...inputBase, minHeight: 110 }}
              />

              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  opacity: 0.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span>
                  Separate items with commas or new lines.
                </span>
                <span>
                  {pantryItems.length} item{pantryItems.length !== 1 ? "s" : ""}
                </span>
              </div>
            </section>

            <section
              style={{
                padding: 16,
                borderRadius: 20,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={sectionTitleRow}>
                <Info size={18} style={{ opacity: 0.6 }} />
                <h3 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>
                  Dietary Notes
                </h3>
              </div>

              <p
                style={{
                  margin: "0 0 12px 0",
                  fontSize: 14,
                  opacity: 0.62,
                  lineHeight: 1.4,
                }}
              >
                Add dislikes, allergies, picky eater notes, or anything else
                you want the planner to consider.
              </p>

              <textarea
                placeholder="No mushrooms, shellfish allergy, kids don't like spicy foods..."
                value={prefs.dietaryNotes || ""}
                onChange={(e) => handleDietaryNotesChange(e.target.value)}
                style={{ ...inputBase, minHeight: 110 }}
              />
            </section>

            <section
              style={{
                padding: 16,
                borderRadius: 20,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={sectionTitleRow}>
                <Utensils size={18} style={{ opacity: 0.6 }} />
                <h3 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>
                  Set Your Week
                </h3>
              </div>

              <p
                style={{
                  margin: "0 0 14px 0",
                  fontSize: 14,
                  opacity: 0.62,
                  lineHeight: 1.4,
                }}
              >
                Tell the planner how much effort you want each day.
              </p>

              <div style={{ display: "grid", gap: 18 }}>
                {days.map((day) => (
                  <div
                    key={day}
                    style={{
                      paddingBottom: 16,
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: 13,
                        color: "#22c55e",
                        textTransform: "uppercase",
                        marginBottom: 12,
                      }}
                    >
                      {day}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {effortOptions.map((opt) => {
                        const active = (daySettings[day] ?? "normal") === opt.key;

                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() =>
                              setDaySettings((prev) => ({
                                ...prev,
                                [day]: opt.key,
                              }))
                            }
                            style={{
                              padding: "10px 14px",
                              borderRadius: "12px",
                              border: "1px solid",
                              borderColor: active
                                ? "#22c55e"
                                : "rgba(255,255,255,0.1)",
                              background: active
                                ? "rgba(34,197,94,0.1)"
                                : "rgba(255,255,255,0.03)",
                              color: active
                                ? "#22c55e"
                                : "rgba(255,255,255,0.6)",
                              fontWeight: 800,
                              fontSize: 13,
                              cursor: "pointer",
                              transition: "all 0.2s",
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
            </section>

            <div style={{ display: "grid", gap: 12, marginTop: 6 }}>
              <Button onClick={handleGenerate} style={{ padding: "20px", fontSize: 18 }}>
                ✨ Generate New Plan
              </Button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button
                  type="button"
                  onClick={handleCookNow}
                  style={{
                    padding: "16px",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.05)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  🍳 Cook Now
                </button>

                <button
                  type="button"
                  onClick={handleReroll}
                  style={{
                    padding: "16px",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.05)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  🔄 Re-Roll
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  commitPantry();
                  navigate("/week");
                }}
                style={{
                  padding: "14px 16px",
                  borderRadius: "16px",
                  background: "transparent",
                  color: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                Back to Week
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}