import React from "react";
import { days, normalize } from "../App";
import type { Meal, Effort } from "../App";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

type Day = (typeof days)[number];

export default function WeekPage({
  meals,
  setMeals,
  checkedItems,
  setCheckedItems,
  addDayToCookbook,
  uniqueShoppingList,
  generateDinnerPlan,
  daySettings,
  setDaySettings,
}: {
  meals: Record<string, Meal>;
  setMeals: React.Dispatch<React.SetStateAction<Record<string, Meal>>>;
  checkedItems: string[];
  setCheckedItems: React.Dispatch<React.SetStateAction<string[]>>;
  addDayToCookbook: (day: string) => void;
  uniqueShoppingList: string[];
  generateDinnerPlan: () => void;
  daySettings: Record<Day, Effort>;
  setDaySettings: React.Dispatch<React.SetStateAction<Record<Day, Effort>>>;
}) {
  const navigate = useNavigate();
  const clearWeek = () => {
  if (!window.confirm("Clear the entire week?")) return;
  setMeals({});
  setCheckedItems([]); // auto-clear shopping checks
  navigate("/plan");   // ✅ back to landing page
};
  const [hoveredDay, setHoveredDay] = React.useState<Day | null>(null);
  const [animDays, setAnimDays] = React.useState<Record<string, boolean>>({});
  const [openDay, setOpenDay] = React.useState<Day | null>(null);

  const prevMealsRef = React.useRef<Record<string, Meal>>({});

  // ---------- Animation Logic ----------
  React.useEffect(() => {
    const prev = prevMealsRef.current;
    const nextAnim: Partial<Record<Day, boolean>> = {};

    days.forEach((day) => {
      const prevKey = `${prev[day]?.name ?? ""}||${prev[day]?.ingredients ?? ""}`;
      const nextKey = `${meals[day]?.name ?? ""}||${meals[day]?.ingredients ?? ""}`;
      const nowHasContent = (meals[day]?.name ?? "").trim() || (meals[day]?.ingredients ?? "").trim();
      
      if (prevKey !== nextKey && nowHasContent) {
        nextAnim[day as Day] = true;
      }
    });

    if (Object.keys(nextAnim).length > 0) {
      setAnimDays((s) => ({ ...s, ...nextAnim }));
      const t = window.setTimeout(() => {
        setAnimDays((s) => {
          const copy = { ...s };
          (Object.keys(nextAnim) as Day[]).forEach((d) => delete copy[d]);
          return copy;
        });
      }, 450);
      prevMealsRef.current = meals;
      return () => window.clearTimeout(t);
    }
    prevMealsRef.current = meals;
  }, [meals]);

  // ---------- Styles ----------
  

  const showMoreBtn: React.CSSProperties = {
    background: "transparent", border: "none", color: "rgba(255,255,255,0.78)",
    fontWeight: 1000, cursor: "pointer", padding: 0,
  };

  const expandPanel: React.CSSProperties = {
    marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)",
    display: "grid", gap: 10,
  };

  const cardGrid: React.CSSProperties = {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14,
  };

  const recipeCard: React.CSSProperties = {
    borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(2,6,23,0.45)", boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
    transition: "transform .15s ease, border-color .15s ease, box-shadow .15s ease",
  };

  const cardHover: React.CSSProperties = {
    transform: "translateY(-2px)", borderColor: "rgba(255,255,255,0.16)", boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
  };

  const heroImg: React.CSSProperties = {
    height: 150, borderBottom: "1px solid rgba(255,255,255,0.08)",
    backgroundSize: "cover", backgroundPosition: "center",
  };

  const cardContent: React.CSSProperties = { padding: 14, display: "grid", gap: 10 };
  const input: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 12, outline: "none",
    border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.92)",
  };

  const iconBtn: React.CSSProperties = {
    width: 30, height: 30, borderRadius: 10, border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.92)", cursor: "pointer", display: "grid", placeItems: "center",
  };

  const updateMeal = (day: Day, field: keyof Meal, value: string) => {
    setMeals((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const clearDay = (day: Day) => {
    setMeals((prev) => ({ ...prev, [day]: { name: "", ingredients: "" } }));
  };

  const toggleItem = (item: string) => {
    const n = normalize(item);
    setCheckedItems((prev) => (prev.includes(n) ? prev.filter((i) => i !== n) : [...prev, n]));
  };

  return (
    <>
      <style>{`
        @keyframes popGlow {
          0%   { transform: scale(0.98); box-shadow: 0 0 0 rgba(0,0,0,0); }
          60%  { transform: scale(1.01); box-shadow: 0 12px 30px rgba(0,0,0,0.35); }
          100% { transform: scale(1.00); box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
        }
      `}</style>

     

      <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(15,23,42,0.30)", padding: 14 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 950 }}>This Week</h2>
        <div style={cardGrid}>
          {days.map((day) => {
            const meal = meals[day];
            const hovered = hoveredDay === day;


            
            // Logic for dynamic hero image
            const heroUrl = meal?.photoUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80&q=${encodeURIComponent(meal?.name || "food")}`;

            return (
              <div
                key={day}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                style={{
                  ...recipeCard,
                  ...(hovered ? cardHover : {}),
                  animation: animDays?.[day] ? "popGlow 450ms ease-out" : undefined,
                }}
              >
                <div style={{ ...heroImg, backgroundImage: `url(${heroUrl})` }} />

                <div style={cardContent}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 1000 }}>{meal?.name || "No meal planned"}</div>
                      <div style={{ fontSize: 12, opacity: 0.75 }}>{day.toUpperCase()}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={iconBtn} title="Add to cookbook" onClick={() => addDayToCookbook(day)}>➕</button>
                      <button style={iconBtn} title="Clear plan for this day" onClick={() => window.confirm(`Clear ${day}?`) && clearDay(day)}>🧹</button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 900 }}>Time:</div>
                    <select
                      value={daySettings[day] ?? "normal"}
                      onChange={(e) => setDaySettings(prev => ({ ...prev, [day]: e.target.value as Effort }))}
                      style={{ background: "#0f172a", color: "white", padding: "4px 8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <option value="quick">Quick</option>
                      <option value="normal">Normal</option>
                      <option value="big">Big cook</option>
                      <option value="takeout">Takeout</option>
                    </select>
                  </div>

                  <input placeholder="Meal name" value={meal?.name ?? ""} onChange={(e) => updateMeal(day, "name", e.target.value)} style={input} />
                  <input placeholder="Ingredients..." value={meal?.ingredients ?? ""} onChange={(e) => updateMeal(day, "ingredients", e.target.value)} style={input} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                    <button style={showMoreBtn} onClick={() => setOpenDay((d) => (d === day ? null : day))}>
                      {openDay === day ? "Show Less ▴" : "Show More ▾"}
                    </button>
                    <div style={{ fontSize: 12, opacity: 0.65, fontWeight: 900 }}>
                      {meal?.name?.trim() ? "Planned ✅" : "Empty ⬜"}
                    </div>
                  </div>

                  {openDay === day && (
                    <div style={expandPanel}>
                      <div style={{ display: "grid", gap: 6 }}>
                        <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 1000 }}>Instructions</div>
                        <textarea
                          placeholder="Cooking steps..."
                          value={meal?.instructions ?? ""}
                          onChange={(e) => updateMeal(day, "instructions", e.target.value)}
                          style={{ ...input, minHeight: 80, resize: "vertical" }}
                        />
                      </div>
                      
                      <button
                        style={{ ...iconBtn, width: "fit-content", padding: "8px 12px", height: "auto", borderRadius: 12 }}
                        title="Copy ingredients to clipboard"
                        onClick={() => {
                          const text = (meal?.ingredients ?? "").trim();
                          if (!text) return alert("No ingredients to copy yet 🙂");
                          navigator.clipboard.writeText(text);
                        }}
                      >
                        📋 Copy Ingredients
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
maxWidth: 800,
margin: "24px auto 0",

    gap: 12,
    marginTop: 24,
    paddingTop: 20,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    flexWrap: "wrap",
  }}
>
  <Button onClick={generateDinnerPlan}>
    🎲 Generate Plan
  </Button>

  <Button
  variant="danger"
  onClick={() => {
    if (window.confirm("Clear the entire week?")) clearWeek();
  }}
>
  🧹 Clear Week
</Button>



  <Button
    variant="secondary"
    onClick={() => navigate("/cookbook")}
  >
    📚 Go to Cookbook
  </Button>
</div>


      <div style={{ marginTop: 14, padding: 14, borderRadius: 16, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(15,23,42,0.30)" }}>
        <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  }}
>
  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 950 }}>
    Shopping List
  </h2>

  {checkedItems.length > 0 && (
    <button
      onClick={() => setCheckedItems([])}
      style={{
        background: "none",
        border: "none",
        color: "rgba(255,255,255,0.65)",
        fontSize: 12,
        fontWeight: 900,
        cursor: "pointer",
        textDecoration: "underline",
      }}
    >
      Clear
    </button>
  )}
</div>

        <div style={{ display: "grid", gap: 8 }}>
          {uniqueShoppingList.length === 0 ? "Empty list." : uniqueShoppingList.map((item) => {
            const n = normalize(item);
            const checked = checkedItems.includes(n);
            return (
              <label key={n} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px", borderRadius: 12, background: checked ? "rgba(34,197,94,0.14)" : "rgba(255,255,255,0.05)", cursor: "pointer" }}>
                <input type="checkbox" checked={checked} onChange={() => toggleItem(item)} />
                <span style={{ textDecoration: checked ? "line-through" : "none", opacity: checked ? 0.7 : 1 }}>{item}</span>
              </label>
            );
          })}
        </div>
      </div>
    </>
  );
}