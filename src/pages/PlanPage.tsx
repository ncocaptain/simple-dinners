import React, { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sparkles,
  Utensils,
  Info,
  Refrigerator,
  ChevronRight,
  Leaf,
  AlertCircle,
} from "lucide-react";
import { days } from "../core/data";
import Button from "../components/Button";
import Card from "../components/Card";
import type { Effort, PantryItem } from "../core/types";
import { ALLERGENS } from "../core/planner";

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
      generateDinnerPlan(true);
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

  const updatePrefs = (updatedFields: any) => {
    const nextPrefs = { ...prefs, ...updatedFields };
    setPrefs(nextPrefs);
    localStorage.setItem("prefs", JSON.stringify(nextPrefs));
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

  const toggleAllergen = (key: string) => {
    const current = Array.isArray(prefs.allergens) ? prefs.allergens : [];
    const exists = current.includes(key);

    updatePrefs({
      allergens: exists
        ? current.filter((item: string) => item !== key)
        : [...current, key],
    });
  };

  const handleGenerate = () => {
    commitPantry();
    generateDinnerPlan(true);
  };

  const effortOptions: { key: Effort; label: string }[] = [
  { key: "quick", label: "Quick" },
  { key: "normal", label: "Normal" },
  { key: "big", label: "Big" },
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
    gap: 10,
    marginBottom: 10,
  };

  const heroTitle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  lineHeight: 1.1,
};

const heroIconWrap: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 14,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.22)",
  color: "#86efac",
  flexShrink: 0,
};

const sectionIconWrap: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 12,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(34,197,94,0.1)",
  border: "1px solid rgba(34,197,94,0.18)",
  color: "#86efac",
  flexShrink: 0,
};

const helperRow: React.CSSProperties = {
  marginTop: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap",
};

const helperText: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.55,
  lineHeight: 1.4,
};

const countPill: React.CSSProperties = {
  padding: "5px 9px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.72)",
  fontSize: 12,
  fontWeight: 800,
  whiteSpace: "nowrap",
};

  const activeAllergens: string[] = Array.isArray(prefs.allergens)
    ? prefs.allergens
    : [];

  const allergenLabels: Record<string, string> = {
    shellfish: "Shellfish",
    fish: "Fish",
    dairy: "Dairy",
    Eggs: "Eggs",
    peanuts: "Peanuts",
    tree_nuts: "Tree Nuts",
    gluten: "Gluten",
    soy: "Soy",
    sesame: "Sesame",
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
    <span style={heroTitle}>
      <span style={heroIconWrap}>
        <Sparkles size={19} />
      </span>
      <span>Kitchen & Plan</span>
    </span>
  }
  subtitle="Use what you already have, set your preferences, and generate smarter dinners."
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
                <span style={sectionIconWrap}>
  <Refrigerator size={17} />
</span>
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
                style={{ ...inputBase, minHeight: 96 }}
              />

              <div style={helperRow}>
  <span style={helperText}>
    Separate items with commas or new lines.
  </span>

  <span style={countPill}>
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
                <span style={sectionIconWrap}>
  <Leaf size={17} />
</span>
                <h3 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>
                  Dietary Preferences
                </h3>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "10px 0 4px 0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      padding: 10,
                      background: "rgba(34, 197, 94, 0.1)",
                      borderRadius: 12,
                    }}
                  >
                    <Leaf size={20} color="#22c55e" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800 }}>Vegetarian Mode</div>
                    <div style={{ fontSize: 12, opacity: 0.5 }}>
                      Prioritize plant-based meals
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updatePrefs({ vegetarian: !prefs.vegetarian })}
                  style={{
                    width: 54,
                    height: 30,
                    borderRadius: 20,
                    background: prefs.vegetarian
                      ? "#22c55e"
                      : "rgba(255,255,255,0.1)",
                    position: "relative",
                    cursor: "pointer",
                    border: "none",
                    transition: "background 0.3s ease",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "white",
                      position: "absolute",
                      top: 4,
                      left: prefs.vegetarian ? 28 : 4,
                      transition:
                        "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    }}
                  />
                </button>
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
                <span style={sectionIconWrap}>
  <AlertCircle size={17} />
</span>
                <h3 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>
                  Allergies & Restrictions
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
                These are hard blockers for meal generation.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ALLERGENS.map((key) => {
                  const active = activeAllergens.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleAllergen(key)}
                      style={{
                        border: "1px solid",
                        borderColor: active
                          ? "rgba(239,68,68,0.4)"
                          : "rgba(255,255,255,0.08)",
                        borderRadius: 999,
                        padding: "10px 14px",
                        background: active
                          ? "rgba(239,68,68,0.12)"
                          : "rgba(255,255,255,0.04)",
                        color: active ? "#fca5a5" : "rgba(255,255,255,0.8)",
                        fontWeight: 800,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      {allergenLabels[key] ?? key}
                    </button>
                  );
                })}
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
                <span style={sectionIconWrap}>
  <Info size={17} />
</span>
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
                Add dislikes, picky eater notes, or softer preferences for the planner.
              </p>

              <textarea
                placeholder="Kids don't like spicy food, no mushrooms, lighter meals on weekdays..."
                value={prefs.dietaryNotes || ""}
                onChange={(e) => updatePrefs({ dietaryNotes: e.target.value })}
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
                <span style={sectionIconWrap}>
  <Utensils size={17} />
</span>
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 6,
              }}
            >
              <Button onClick={handleGenerate} style={{ padding: "16px", fontSize: 16 }}>
                ✨ Generate Plan
              </Button>

              <button
                type="button"
                onClick={() => {
                  commitPantry();
                  navigate("/week");
                }}
                style={{
                  padding: "16px",
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