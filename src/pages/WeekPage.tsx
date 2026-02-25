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

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

// Local time format: YYYYMMDDTHHMMSS
function toICSLocal(d: Date) {
  return (
    d.getFullYear() +
    pad2(d.getMonth() + 1) +
    pad2(d.getDate()) +
    "T" +
    pad2(d.getHours()) +
    pad2(d.getMinutes()) +
    pad2(d.getSeconds())
  );
}

function escapeICS(text: string) {
  return (text ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function startOfWeekMonday(base: Date) {
  const d = new Date(base);
  const day = d.getDay(); // 0 Sun ... 6 Sat
  const diff = day === 0 ? -6 : 1 - day; // to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addWeekToCalendar(days: readonly Day[], meals: Record<Day, Meal>) {
  const monday = startOfWeekMonday(new Date());

  const events = days
    .map((day, idx) => {
      const meal = meals[day];
      if (!meal?.name?.trim()) return null;

      const date = new Date(monday);
      date.setDate(monday.getDate() + idx);

      const start = new Date(date);
      start.setHours(18, 0, 0, 0);

      const end = new Date(date);
      end.setHours(19, 0, 0, 0);

      return {
        title: `Dinner: ${meal.name}`,
        start,
        end,
        description: meal.ingredients?.trim()
          ? `Ingredients: ${meal.ingredients}`
          : undefined,
      };
    })
    .filter(Boolean) as { title: string; start: Date; end: Date; description?: string }[];

  if (events.length === 0) return;

  const dtstamp = toICSLocal(new Date());

  const body = events
    .map((e, i) => {
      const uid = `${dtstamp}-${i}@simple-dinners`;
      return [
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `SUMMARY:${escapeICS(e.title)}`,
        e.description ? `DESCRIPTION:${escapeICS(e.description)}` : "",
        `DTSTART:${toICSLocal(e.start)}`,
        `DTEND:${toICSLocal(e.end)}`,
        "END:VEVENT",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Simple Dinners//EN",
    body,
    "END:VCALENDAR",
  ].join("\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "simple-dinners-week.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}




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
  
  const openNearby = (category: string) => {
  if (!navigator.geolocation) {
    alert("Location not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords: { latitude, longitude } }) => {
      const q = encodeURIComponent(category);
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${q}&center=${latitude},${longitude}`;

      const ua = navigator.userAgent;
      const isiOS = /iPad|iPhone|iPod/.test(ua);
      const isAndroid = /Android/.test(ua);

      // Desktop
      if (!isiOS && !isAndroid) {
        window.open(webUrl, "_blank", "noopener,noreferrer");
        return;
      }

      // Mobile native-first + fallback
      const startedAt = Date.now();
      if (isiOS) {
        window.location.href = `https://maps.apple.com/?q=${q}&ll=${latitude},${longitude}`;
      } else {
        window.location.href = `geo:${latitude},${longitude}?q=${q}`;
      }

      setTimeout(() => {
        if (Date.now() - startedAt < 1200) window.location.href = webUrl;
      }, 900);
    },
    (err: GeolocationPositionError) => {
      console.error(err);
      alert("Could not get your location. Check location permissions.");
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
  );
};
  
  const [animDays, setAnimDays] = React.useState<Record<string, boolean>>({});
  const [openDay, setOpenDay] = React.useState<Day | null>(null);
  const [openEffortDay, setOpenEffortDay] = React.useState<Day | null>(null);
  const prevMealsRef = React.useRef<Record<Day, Meal>>(EMPTY_WEEK);

  const EFFORT_OPTIONS: { value: Effort; label: string }[] = [
    { value: "quick", label: "Quick" },
    { value: "normal", label: "Normal" },
    { value: "big", label: "Big cook" },
    { value: "takeout", label: "Takeout" },
  ];

  // ---------- Close dropdown on outside click ----------
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // If we click outside the dropdown container, close it
      if (!target.closest(".effort-selector-container")) {
        setOpenEffortDay(null);
      }
    };

    if (openEffortDay) window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [openEffortDay]);

  // ---------- Animation Logic ----------
  React.useEffect(() => {
    const prev = prevMealsRef.current;
    const nextAnim: Partial<Record<Day, boolean>> = {};
    days.forEach((day) => {
      const prevKey = `${prev[day]?.name ?? ""}`;
      const nextKey = `${meals[day]?.name ?? ""}`;
      if (prevKey !== nextKey && meals[day]?.name) {
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

  // ---------- Actions ----------
  const clearWeek = () => {
    if (!window.confirm("Clear the entire week?")) return;
    setMeals(EMPTY_WEEK);
    setCheckedItems([]);
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

 
  // ---------- Styles ----------
  const cardGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 16,
    marginTop: 16,
  };

  const recipeCard: React.CSSProperties = {
    borderRadius: 18,
    overflow: "visible", // ✅ allow dropdown to escape
    background: "rgba(30,41,59,0.40)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 10px 26px rgba(0,0,0,0.35)",
    transition: "all .18s ease",
    color: "#f8fafc",
  };

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

  const chip: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    fontSize: 12,
    fontWeight: 800,
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

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#f8fafc" }}>This Week</h2>
        <button
          onClick={() => addWeekToCalendar(days, meals)}
          style={{ padding: "10px 16px", borderRadius: 14, background: "rgba(255,255,255,0.05)", color: "#f8fafc", cursor: "pointer", fontWeight: 600, border: "1px solid rgba(255,255,255,0.12)" }}
        >
          📅 Add to Calendar
        </button>
      </div>

      {/* Main Grid */}
      <div style={cardGrid}>
        {days.map((day) => {
          const meal = meals[day];
          const effort = daySettings[day] ?? "normal";
          const heroUrl = meal?.photoUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80&sig=${day}`;

          return (
            <div
  key={day}
  style={{
    ...recipeCard,
    position: "relative",
    zIndex: openEffortDay === day ? 999 : 1,
    animation: animDays[day] ? "popGlow 450ms ease-out" : "none",
  }}
>
              <div
  style={{
    height: 120,
    overflow: "hidden",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  }}
>
  <div
    style={{
      height: "100%",
      backgroundImage: `url(${heroUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  />
</div>
              
              <div style={{ padding: 16, display: "grid", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{meal?.name || "No meal planned"}</div>
                    <div style={{ fontSize: 12, opacity: 0.6, fontWeight: 700 }}>{day.toUpperCase()}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={iconBtn} onClick={() => addDayToCookbook(day)}>➕</button>
                    <button style={iconBtn} onClick={() => clearDay(day)}>🧹</button>
                  </div>
                </div>

                {/* Effort Selector */}
                <div className="effort-selector-container" style={{ position: "relative", display: "inline-block" }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenEffortDay(openEffortDay === day ? null : day);
                    }}
                    style={{ ...chip, cursor: "pointer", userSelect: "none" }}
                  >
                    <span style={{ opacity: 0.7, fontSize: 11, fontWeight: 800 }}>Effort</span>
                    <span style={{ fontSize: 12, fontWeight: 900 }}>
                      {EFFORT_OPTIONS.find((o) => o.value === effort)?.label ?? "Normal"}
                    </span>
                    <span style={{ opacity: 0.6 }}>▾</span>
                  </button>

                  {openEffortDay === day && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        left: 0,
                        zIndex: 2000,
                        minWidth: 140,
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(15,23,42,0.95)",
                        backdropFilter: "blur(14px)",
                        WebkitBackdropFilter: "blur(14px)",
                        boxShadow: "0 12px 28px rgba(0,0,0,0.55)",
                        overflow: "hidden",
                      }}
                    >
                      {EFFORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setDaySettings(prev => ({ ...prev, [day]: opt.value }));
                            setOpenEffortDay(null);
                          }}
                          style={{
                            width: "100%", textAlign: "left", padding: "10px 12px", border: "none",
                            background: opt.value === effort ? "rgba(20,184,166,0.2)" : "transparent",
                            color: "white", cursor: "pointer", fontWeight: opt.value === effort ? 900 : 500,
                            fontSize: 13
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setOpenDay(openDay === day ? null : day)}
                  style={{ background: "none", border: "none", color: "#14b8a6", fontWeight: 900, cursor: "pointer", fontSize: 13, textAlign: "left", width: "fit-content", padding: 0 }}
                >
                  {openDay === day ? "Hide details ▴" : "Edit details ▾"}
                </button>

                {effort === "takeout" && (
  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
    <button
      type="button"
      onClick={() => openNearby("restaurants")}
      style={{ ...chip, cursor: "pointer" }}
    >
      🍔 Food
    </button>

    <button
      type="button"
      onClick={() => openNearby("coffee")}
      style={{ ...chip, cursor: "pointer" }}
    >
      ☕ Coffee
    </button>

    <button
      type="button"
      onClick={() => openNearby("grocery store")}
      style={{ ...chip, cursor: "pointer" }}
    >
      🛒 Grocery
    </button>

    <button
      type="button"
      onClick={() => openNearby("pharmacy")}
      style={{ ...chip, cursor: "pointer" }}
    >
      💊 Pharmacy
    </button>

    <button
      type="button"
      onClick={() => openNearby("pizza")}
      style={{ ...chip, cursor: "pointer" }}
    >
      🍕 Pizza
    </button>
  </div>
)}

                {openDay === day && (
                  <div style={{ display: "grid", gap: 10, padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
                    <input placeholder="Meal name" value={meal?.name ?? ""} onChange={(e) => updateMeal(day, "name", e.target.value)} style={input} />
                    <input placeholder="Ingredients..." value={meal?.ingredients ?? ""} onChange={(e) => updateMeal(day, "ingredients", e.target.value)} style={input} />
                    <textarea
                      placeholder="Cooking steps..."
                      value={meal?.instructions ?? ""}
                      onChange={(e) => updateMeal(day, "instructions", e.target.value)}
                      style={{ ...input, minHeight: 90, resize: "vertical" }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 32 }}>
        <Button onClick={generateDinnerPlan}>🎲 Re-Generate</Button>
        <Button variant="secondary" onClick={() => navigate("/cookbook")}>📚 Cookbook</Button>
        <Button variant="danger" onClick={clearWeek}>🧹 Reset Week</Button>
      </div>

      {/* Shopping List Section */}
      <div style={{ marginTop: 32, padding: 24, borderRadius: 20, background: "rgba(15,23,42,0.2)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <h2 style={{ marginBottom: 20, margin: 0 }}>Shopping List</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginTop: 20 }}>
          {uniqueShoppingList.length === 0 ? (
            <p style={{ opacity: 0.5 }}>No items yet!</p>
          ) : (
            uniqueShoppingList.map((item) => (
              <label key={item} style={{ display: "flex", gap: 10, padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={checkedItems.includes(normalize(item))} onChange={() => toggleItem(item)} />
                <span style={{ textDecoration: checkedItems.includes(normalize(item)) ? "line-through" : "none" }}>{item}</span>
              </label>
            ))
          )}
        </div>
      </div>
    </>
  );
}