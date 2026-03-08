import React from "react";
import type { Meal, Effort } from "../core/types";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { days } from "../core/data";
import { loadTakeoutCategories, type TakeoutCategory } from "../core/takeout";
import {
  Trash2,
  BookOpen,
  RefreshCcw,
  CalendarPlus,
  Plus,
  X,
  Lock,
  Unlock,
} from "lucide-react";
import { getTonightDinner } from "../core/tonight";

type Day = (typeof days)[number];

// =====================================================
// Builder: empty week helpers
// =====================================================
const EMPTY_MEAL: Meal = { name: "", ingredients: "", instructions: "", photoUrl: "" };

const EMPTY_WEEK = Object.fromEntries(
  days.map((d) => [d, { ...EMPTY_MEAL }])
) as Record<Day, Meal>;

const EMPTY_LOCKS = Object.fromEntries(
  days.map((d) => [d, false])
) as Record<Day, boolean>;


// =====================================================
// Builder: calendar helpers
// =====================================================
function pad2(n: number) {
  return String(n).padStart(2, "0");
}

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

function mealImageUrl(name?: string) {
  const q = encodeURIComponent((name || "cooking dinner").trim());
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80&sig=1&meal=${q}`;
}

function startOfWeekMonday(base: Date) {
  const d = new Date(base);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
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

// =====================================================
// Builder: page component
// =====================================================
export default function WeekPage({
  meals,
  setMeals,
  addDayToCookbook,
  generateDinnerPlan,
  daySettings,
  setDaySettings,
  lockedDays,
  setLockedDays,
}: {
  meals: Record<Day, Meal>;
  setMeals: React.Dispatch<React.SetStateAction<Record<Day, Meal>>>;
  addDayToCookbook: (day: Day) => void;
  generateDinnerPlan: (force?: boolean) => void;
  daySettings: Record<Day, Effort>;
  setDaySettings: React.Dispatch<React.SetStateAction<Record<Day, Effort>>>;
  lockedDays: Record<Day, boolean>;
  setLockedDays: React.Dispatch<React.SetStateAction<Record<Day, boolean>>>;
}) {
  const navigate = useNavigate();
  const todayIndex = (() => {
  const jsDay = new Date().getDay(); // 0 = Sun, 1 = Mon, ...
  return jsDay === 0 ? 6 : jsDay - 1; // convert to Monday-first index
})();

const todayKey = days[todayIndex] as Day;
const tonight = getTonightDinner(meals?.[todayKey]);

  // =====================================================
  // Builder: local shopping list types + state
  // =====================================================
  type ShoppingItem = {
    id: string;
    name: string;
    checked: boolean;
    createdAt: number;
  };

  const SHOP_LS_KEY = "simple-dinners:shopping-list:v1";

  function makeId() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  const [shopItems, setShopItems] = React.useState<ShoppingItem[]>([]);
  const [shopInput, setShopInput] = React.useState("");

  // =====================================================
  // Builder: recipe navigation
  // =====================================================
  const openRecipePage = (day: Day) => {
    const slug = meals[day]?.slug?.trim();
    if (!slug) return;

    navigate(`/recipe/${encodeURIComponent(slug)}?from=${encodeURIComponent("/week")}`);
  };

  // =====================================================
  // Builder: takeout categories
  // =====================================================
  const [takeoutCategories] = React.useState<TakeoutCategory[]>(() =>
    loadTakeoutCategories()
  );

  // =====================================================
  // Builder: local shopping list persistence
  // =====================================================
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(SHOP_LS_KEY);
      if (raw) setShopItems(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(SHOP_LS_KEY, JSON.stringify(shopItems));
    } catch {
      // ignore
    }
  }, [shopItems]);

  // =====================================================
  // Builder: shopping list actions
  // =====================================================
  const addShopItem = () => {
    const name = shopInput.trim();
    if (!name) return;

    setShopItems((prev) => [
      { id: makeId(), name, checked: false, createdAt: Date.now() },
      ...prev,
    ]);
    setShopInput("");
  };

  const toggleShopItem = (id: string) => {
    setShopItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it))
    );
  };

  const removeShopItem = (id: string) => {
    setShopItems((prev) => prev.filter((it) => it.id !== id));
  };

  const clearCheckedShopItems = () => {
    setShopItems((prev) => prev.filter((it) => !it.checked));
  };

  // =====================================================
  // Builder: nearby takeout opener
  // =====================================================
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

        if (!isiOS && !isAndroid) {
          window.open(webUrl, "_blank", "noopener,noreferrer");
          return;
        }

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

  // =====================================================
  // Builder: card animation + open state
  // =====================================================
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

  // =====================================================
  // Builder: close effort dropdown on outside click
  // =====================================================
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".effort-selector-container")) {
        setOpenEffortDay(null);
      }
    };

    if (openEffortDay) window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [openEffortDay]);

  // =====================================================
  // Builder: animate cards when meals change
  // =====================================================
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
      prevMealsRef.current = meals;
      return () => clearTimeout(t);
    }

    prevMealsRef.current = meals;
  }, [meals]);

  // =====================================================
  // Builder: week actions
  // =====================================================
  const clearWeek = () => {
    if (!window.confirm("Clear the entire week?")) return;
    setMeals(EMPTY_WEEK);
    setShopItems([]);
    localStorage.removeItem(SHOP_LS_KEY);
    setLockedDays(EMPTY_LOCKS);
  };

  const updateMeal = (day: Day, field: keyof Meal, value: string) => {
    setMeals((prev) => ({
      ...prev,
      [day]: { ...(prev[day] ?? EMPTY_MEAL), [field]: value },
    }));
  };

  const clearDay = (day: Day) => {
    setMeals((prev) => ({ ...prev, [day]: EMPTY_MEAL }));
    setLockedDays((prev) => ({ ...prev, [day]: false }));
  };

  const toggleDayLock = (day: Day) => {
    setLockedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  // =====================================================
  // Builder: shared styles
  // =====================================================
  const cardGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 16,
    marginTop: 16,
  };

  const recipeCard: React.CSSProperties = {
    borderRadius: 18,
    overflow: "visible",
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

  // =====================================================
  // Builder: week range label
  // =====================================================
  const formatRange = () => {
    const start = startOfWeekMonday(new Date());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const fmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
    const fmtYear = new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const sameYear = start.getFullYear() === end.getFullYear();
    return sameYear
      ? `${fmt.format(start)} – ${fmtYear.format(end)}`
      : `${fmtYear.format(start)} – ${fmtYear.format(end)}`;
  };

  const weekRange = formatRange();

  // =====================================================
  // Builder: page UI
  // =====================================================
  return (
    <>
      <style>{`
        @keyframes popGlow {
          0% { transform: scale(0.98); }
          50% { transform: scale(1.02); border-color: #14b8a6; }
          100% { transform: scale(1); }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#f8fafc" }}>
            This Week
          </h2>
          <div style={{ marginTop: 4, opacity: 0.75, fontWeight: 700, fontSize: 13 }}>
            {weekRange}
          </div>
        </div>

        <button
          onClick={() => addWeekToCalendar(days, meals)}
          style={{
            padding: "10px 16px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.05)",
            color: "#f8fafc",
            cursor: "pointer",
            fontWeight: 600,
            border: "1px solid rgba(255,255,255,0.12)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CalendarPlus size={16} />
          Add to Calendar
        </button>
      </div>

      <div
  style={{
    marginBottom: 24,
    padding: 20,
    borderRadius: 20,
    backgroundImage: tonight?.photoUrl
      ? `linear-gradient(rgba(15,23,42,0.75), rgba(15,23,42,0.9)), url(${tonight.photoUrl})`
      : "linear-gradient(135deg, rgba(20,184,166,0.18), rgba(15,23,42,0.55))",
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: "1px solid rgba(20,184,166,0.35)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.28)",
    backdropFilter: "blur(2px)",
    color: "#f8fafc",
  }}
>
  <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.8, letterSpacing: 0.6 }}>
    TONIGHT'S DINNER
  </div>

  <div style={{ marginTop: 6, fontSize: 28, fontWeight: 900 }}>
    {tonight?.name?.trim() || "No dinner suggestion yet"}
  </div>

  <div
    style={{
      marginTop: 8,
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: "center",
    }}
  >
    {tonight?.effort && (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "6px 12px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          fontSize: 12,
          fontWeight: 800,
        }}
      >
        Effort: {tonight.effort}
      </span>
    )}
{meals[todayKey]?.name && (
    <span
  style={{
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 12,
    fontWeight: 800,
  }}
>
  {todayKey.toUpperCase()}
</span>
)}
  </div>

  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
    <Button
      onClick={() => {
        if (tonight?.slug?.trim()) {
          navigate(`/recipe/${encodeURIComponent(tonight.slug)}?from=${encodeURIComponent("/week")}`);
        }
      }}
    >
      Cook Now
    </Button>

    <Button variant="secondary" onClick={() => generateDinnerPlan(true)}>
      <RefreshCcw size={16} style={{ marginRight: 8 }} />
      Swap Suggestion
    </Button>
  </div>
</div>

      <div style={cardGrid}>
        {days.map((day) => {
          const meal = meals[day];
          const effort = daySettings[day] ?? "normal";
          const heroUrl = meal?.photoUrl || mealImageUrl(meal?.name);
          const canOpen = Boolean(meal?.slug?.trim());
          const isLocked = Boolean(lockedDays[day]);

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
                  cursor: canOpen ? "pointer" : "default",
                }}
                onClick={canOpen ? () => openRecipePage(day) : undefined}
                role={canOpen ? "button" : undefined}
                tabIndex={canOpen ? 0 : undefined}
                onKeyDown={
                  canOpen
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") openRecipePage(day);
                      }
                    : undefined
                }
                aria-label={canOpen ? `Open recipe for ${meal?.name ?? "meal"}` : undefined}
              >
                <div
                  className={`recipe-hero ${canOpen ? "clickable" : ""}`}
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
                    <div style={{ fontSize: 18, fontWeight: 900 }}>
                      {meal?.name || "No meal planned"}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.6, fontWeight: 700 }}>
                      {day.toUpperCase()}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      style={iconBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDayLock(day);
                      }}
                      title={isLocked ? "Unlock day" : "Lock day"}
                      aria-label={isLocked ? "Unlock day" : "Lock day"}
                    >
                      {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>

                    <button
                      style={iconBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        addDayToCookbook(day);
                      }}
                      title="Save to cookbook"
                      aria-label="Save to cookbook"
                    >
                      <BookOpen size={16} />
                    </button>

                    <button
                      style={iconBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        clearDay(day);
                      }}
                      title="Clear day"
                      aria-label="Clear day"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div
                  className="effort-selector-container"
                  style={{ position: "relative", display: "inline-block" }}
                >
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

                  {isLocked && (
                    <span
                      style={{
                        marginLeft: 8,
                        ...chip,
                        background: "rgba(20,184,166,0.18)",
                        border: "1px solid rgba(20,184,166,0.35)",
                      }}
                    >
                      🔒 Locked
                    </span>
                  )}

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
                          onClick={(e) => {
                            e.stopPropagation();
                            setDaySettings((prev) => ({ ...prev, [day]: opt.value }));
                            setOpenEffortDay(null);
                          }}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "10px 12px",
                            border: "none",
                            background:
                              opt.value === effort ? "rgba(20,184,166,0.2)" : "transparent",
                            color: "white",
                            cursor: "pointer",
                            fontWeight: opt.value === effort ? 900 : 500,
                            fontSize: 13,
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
                  style={{
                    background: "none",
                    border: "none",
                    color: "#14b8a6",
                    fontWeight: 900,
                    cursor: "pointer",
                    fontSize: 13,
                    textAlign: "left",
                    width: "fit-content",
                    padding: 0,
                  }}
                >
                  {openDay === day ? "Hide details ▴" : "Edit details ▾"}
                </button>

                {effort === "takeout" && (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {takeoutCategories.map((c) => (
                      <button
                        key={c.label}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openNearby(c.query);
                        }}
                        style={{ ...chip, cursor: "pointer" }}
                      >
                        {c.emoji} {c.label}
                      </button>
                    ))}
                  </div>
                )}

                {openDay === day && (
                  <div
                    style={{
                      display: "grid",
                      gap: 10,
                      padding: 12,
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <input
                      placeholder="Meal name"
                      value={meal?.name ?? ""}
                      onChange={(e) => updateMeal(day, "name", e.target.value)}
                      style={input}
                    />

                    <input
                      placeholder="Slug (e.g. taco-bowls)"
                      value={meal?.slug ?? ""}
                      onChange={(e) => updateMeal(day, "slug", e.target.value)}
                      style={input}
                    />

                    <input
                      placeholder="Ingredients..."
                      value={meal?.ingredients ?? ""}
                      onChange={(e) => updateMeal(day, "ingredients", e.target.value)}
                      style={input}
                    />

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

      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 32 }}>
        <Button onClick={() => generateDinnerPlan(true)}>
          <RefreshCcw size={16} style={{ marginRight: 8 }} />
          Re-Generate Unlocked Days
        </Button>

        <Button variant="secondary" onClick={() => navigate("/cookbook")}>
          <BookOpen size={16} style={{ marginRight: 8 }} />
          Cookbook
        </Button>

        <Button variant="danger" onClick={clearWeek}>
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Reset Week
        </Button>
      </div>

      <div
        style={{
          marginTop: 32,
          padding: 24,
          borderRadius: 20,
          background: "rgba(15,23,42,0.2)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}
        >
          <h2 style={{ margin: 0 }}>Shopping List</h2>
          <button
            type="button"
            onClick={clearCheckedShopItems}
            disabled={shopItems.every((i) => !i.checked)}
            style={{
              padding: "10px 14px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.05)",
              color: "#f8fafc",
              cursor: "pointer",
              fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.12)",
              opacity: shopItems.every((i) => !i.checked) ? 0.5 : 1,
            }}
          >
            Clear checked
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <input
            value={shopInput}
            onChange={(e) => setShopInput(e.target.value)}
            placeholder='Add item (e.g. "milk")'
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addShopItem();
              }
            }}
            style={{
              flex: "1 1 220px",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={addShopItem}
            style={{
              padding: "10px 16px",
              borderRadius: 14,
              background: "rgba(20,184,166,0.18)",
              color: "#f8fafc",
              cursor: "pointer",
              fontWeight: 900,
              border: "1px solid rgba(20,184,166,0.35)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 10,
          }}
        >
          {shopItems.length === 0 ? (
            <p style={{ opacity: 0.5, margin: 0 }}>No items yet!</p>
          ) : (
            shopItems
              .slice()
              .sort((a, b) => {
                if (a.checked !== b.checked) return a.checked ? 1 : -1;
                return b.createdAt - a.createdAt;
              })
              .map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: 12,
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleShopItem(item.id)}
                    />
                    <span
                      style={{
                        textDecoration: item.checked ? "line-through" : "none",
                        opacity: item.checked ? 0.75 : 1,
                      }}
                    >
                      {item.name}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => removeShopItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.06)",
                      color: "white",
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
          )}
        </div>
      </div>
    </>
  );
}