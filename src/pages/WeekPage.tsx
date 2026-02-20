import React from "react";
import { normalize } from "../core/planner";
import type { Meal, Effort } from "../core/types";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { days } from "../core/data";
type Day = (typeof days)[number];



const EMPTY_MEAL: Meal = { name: "", ingredients: "", instructions: "", photoUrl: "" };

const EMPTY_WEEK = Object.fromEntries(
  days.map((d) => [d, EMPTY_MEAL])
) as Record<Day, Meal>;




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
  meals: Record<Day, Meal>;
  setMeals: React.Dispatch<React.SetStateAction<Record<Day, Meal>>>;

  checkedItems: string[];
  setCheckedItems: React.Dispatch<React.SetStateAction<string[]>>;
  addDayToCookbook: (day: Day) => void;
  uniqueShoppingList: string[];
  generateDinnerPlan: () => void;
  daySettings: Record<Day, Effort>;
  setDaySettings: React.Dispatch<React.SetStateAction<Record<Day, Effort>>>;
}) {

  const navigate = useNavigate();
  const [hoveredDay, setHoveredDay] = React.useState<Day | null>(null);
  const [animDays, setAnimDays] = React.useState<Record<string, boolean>>({});
  const [openDay, setOpenDay] = React.useState<Day | null>(null);
  const prevMealsRef = React.useRef<Record<Day, Meal>>(EMPTY_WEEK);




  // ---------- Actions ----------
  const clearWeek = () => {
    if (!window.confirm("Clear the entire week?")) return;
    setMeals(EMPTY_WEEK);
    setCheckedItems([]);
    navigate("/plan");
  };

 const updateMeal = (day: Day, field: keyof Meal, value: string) => {
  setMeals((prev) => ({
    ...prev,
    [day]: { ...(prev[day] ?? EMPTY_MEAL), [field]: value },
  }));
};


  const clearDay = (day: Day) => {
  setMeals((prev) => ({ ...prev, [day]: EMPTY_MEAL }));
};


  const toggleItem = (item: string) => {
    const n = normalize(item);
    setCheckedItems((prev) => (prev.includes(n) ? prev.filter((i) => i !== n) : [...prev, n]));
  };

  function openNearbyFood() {
  if (!navigator.geolocation) {
    alert("Location not supported on this device.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;

      // Universal web fallback (works everywhere)
      const webUrl = `https://www.google.com/maps/search/food/@${latitude},${longitude},14z`;

      // Try to open the native app first on mobile
      const ua = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(ua);
      const isAndroid = /android/.test(ua);

      // iOS prefers Apple Maps deep link, Android can use geo:
      const iosUrl = `maps://maps.apple.com/?q=restaurants&ll=${latitude},${longitude}`;
      const androidUrl = `geo:${latitude},${longitude}?q=restaurants`;

      if (isIOS) {
        // Attempt native, then fallback to web
        window.location.href = iosUrl;
        setTimeout(() => (window.location.href = webUrl), 600);
        return;
      }

      if (isAndroid) {
        window.location.href = androidUrl;
        setTimeout(() => (window.location.href = webUrl), 600);
        return;
      }

      // Desktop / unknown: just use web in same tab
      window.location.href = webUrl;
    },
    () => alert("Couldn’t get your location. Check browser permissions."),
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

  // ---------- Animation Logic ----------
  React.useEffect(() => {
    const prev = prevMealsRef.current;
    const nextAnim: Partial<Record<Day, boolean>> = {};
    days.forEach((day) => {
      const prevKey = `${prev[day]?.name ?? ""}||${prev[day]?.ingredients ?? ""}`;
      const nextKey = `${meals[day]?.name ?? ""}||${meals[day]?.ingredients ?? ""}`;
      if (prevKey !== nextKey && (meals[day]?.name || meals[day]?.ingredients)) {
        nextAnim[day as Day] = true;
      }
    });
    if (Object.keys(nextAnim).length > 0) {
      setAnimDays((s) => ({ ...s, ...nextAnim }));
      const t = setTimeout(() => setAnimDays({}), 450);
      return () => clearTimeout(t);
    }
    prevMealsRef.current = meals;
  }, [meals]);

  // ---------- Styles ----------
  const cardGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 16,
    marginTop: 16,
  };

  const recipeCard: React.CSSProperties = {
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(2,6,23,0.45)",
    transition: "all .2s ease",
  };

  const input: React.CSSProperties = {
    width: "100%", padding: "10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)", color: "white", outline: "none", fontSize: 14, boxSizing: "border-box"
  };

  const iconBtn: React.CSSProperties = {
    width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)", color: "white", cursor: "pointer"
  };

  return (
    <>
      <style>{`
        @keyframes popGlow {
          0% { transform: scale(0.98); }
          50% { transform: scale(1.02); border-color: #14b8a6; }
          100% { transform: scale(1); }
        }
      `}</style>

      <div style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,23,42,0.2)", padding: 20 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>This Week</h2>
        
        <div style={cardGrid}>
          {days.map((day) => {
            const meal = meals[day];
            const effort = daySettings[day] ?? "normal";
            const heroUrl = meal?.photoUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80&sig=${day}`;

            return (
              <div
                key={day}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                style={{
                  ...recipeCard,
                  transform: hoveredDay === day ? "translateY(-4px)" : "none",
                  animation: animDays[day] ? "popGlow 450ms ease-out" : "none",
                }}
              >
                <div style={{ height: 140, backgroundImage: `url(${heroUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                
                <div style={{ padding: 16, display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900 }}>{meal?.name || "No meal planned"}</div>
                      <div style={{ fontSize: 12, opacity: 0.6, fontWeight: 700 }}>{day.toUpperCase()}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={iconBtn} onClick={() => addDayToCookbook(day)}>➕</button>
                      <button style={iconBtn} onClick={() => window.confirm(`Clear ${day}?`) && clearDay(day)}>🧹</button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 800, opacity: 0.7 }}>Effort:</span>
                    <select
                      value={effort}
                      onChange={(e) => setDaySettings(prev => ({ ...prev, [day]: e.target.value as Effort }))}
                      style={{ background: "#0f172a", color: "white", padding: "4px 8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <option value="quick">Quick</option>
                      <option value="normal">Normal</option>
                      <option value="big">Big cook</option>
                      <option value="takeout">Takeout</option>
                    </select>
                  </div>

                  {effort === "takeout" && (
                    <button onClick={openNearbyFood} style={{ ...input, background: "rgba(20,184,166,0.15)", border: "1px solid #14b8a6", cursor: "pointer", fontWeight: 800 }}>
                      🍔 Find nearby food
                    </button>
                  )}

                  <input placeholder="Meal name" value={meal?.name ?? ""} onChange={(e) => updateMeal(day, "name", e.target.value)} style={input} />
                  <input placeholder="Ingredients..." value={meal?.ingredients ?? ""} onChange={(e) => updateMeal(day, "ingredients", e.target.value)} style={input} />

                  <button 
                    onClick={() => setOpenDay(openDay === day ? null : day)}
                    style={{ background: "none", border: "none", color: "#14b8a6", fontWeight: 800, cursor: "pointer", fontSize: 13, textAlign: "left" }}
                  >
                    {openDay === day ? "Show Less ▴" : "Show More ▾"}
                  </button>

                  {openDay === day && (
                    <div style={{ display: "grid", gap: 10, padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 12 }}>
                       <textarea
                          placeholder="Cooking steps..."
                          value={meal?.instructions ?? ""}
                          onChange={(e) => updateMeal(day, "instructions", e.target.value)}
                          style={{ ...input, minHeight: 80, resize: "vertical" }}
                        />
                        <Button variant="secondary" onClick={() => {
                          navigator.clipboard.writeText(meal?.ingredients || "");
                          alert("Ingredients copied!");
                        }}>📋 Copy Ingredients</Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 32, flexWrap: "wrap" }}>
        <Button onClick={generateDinnerPlan}>🎲 Re-Generate Empty Days</Button>
        <Button variant="secondary" onClick={() => navigate("/cookbook")}>📚 My Cookbook</Button>
        <Button variant="danger" onClick={clearWeek}>🧹 Reset Week</Button>
      </div>

      {/* Shopping List */}
      <div style={{ marginTop: 32, padding: 24, borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,23,42,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontWeight: 900 }}>Shopping List</h2>
          {checkedItems.length > 0 && <button onClick={() => setCheckedItems([])} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 12 }}>Clear all</button>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {uniqueShoppingList.length === 0 ? <p style={{ opacity: 0.5 }}>Add some meals to see your list!</p> : uniqueShoppingList.map((item) => {
            const n = normalize(item);
            const isChecked = checkedItems.includes(n);
            return (
              <label key={n} style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px", borderRadius: 12, background: isChecked ? "rgba(20,184,166,0.1)" : "rgba(255,255,255,0.03)", cursor: "pointer", transition: "all 0.2s" }}>
                <input type="checkbox" checked={isChecked} onChange={() => toggleItem(item)} style={{ accentColor: "#14b8a6" }} />
                <span style={{ textDecoration: isChecked ? "line-through" : "none", opacity: isChecked ? 0.5 : 1, fontSize: 14 }}>{item}</span>
              </label>
            );
          })}
        </div>
      </div>
    </>
  );
}