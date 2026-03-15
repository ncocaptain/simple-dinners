import React from "react";
import type { Meal, Effort } from "../core/types";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { days } from "../core/data";
import { getTonightDinner } from "../core/tonight";
import { getCookHistoryFor } from "../core/cookHistoryStore";
import { getDinnerStreak, recordDinnerStreak } from "../core/streakStore";
import {
  Trash2,
  RefreshCcw,
  CalendarPlus,
  Plus,
  X,
  Lock,
  Unlock,
} from "lucide-react";

type Day = (typeof days)[number];

type ShoppingItem = {
  id: string;
  name: string;
  checked: boolean;
  createdAt: number;
};

const SHOP_LS_KEY = "simple-dinners:shopping-list:v1";

const EMPTY_MEAL: Meal = {
  name: "",
  ingredients: "",
  instructions: "",
  photoUrl: "",
};

const EMPTY_WEEK = Object.fromEntries(
  days.map((d) => [d, { ...EMPTY_MEAL }])
) as Record<Day, Meal>;

const EMPTY_LOCKS = Object.fromEntries(
  days.map((d) => [d, false])
) as Record<Day, boolean>;

function pad2(n: number) { return String(n).padStart(2, "0"); }

function todayKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function toICSLocal(d: Date) {
  return d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + "T" +
    pad2(d.getHours()) + pad2(d.getMinutes()) + pad2(d.getSeconds());
}

function escapeICS(text: string) {
  return (text ?? "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
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
  const events = days.map((day, idx) => {
    const meal = meals[day];
    if (!meal?.name?.trim()) return null;
    const date = new Date(monday);
    date.setDate(monday.getDate() + idx);
    const start = new Date(date); start.setHours(18, 0, 0, 0);
    const end = new Date(date); end.setHours(19, 0, 0, 0);
    return { title: `Dinner: ${meal.name}`, start, end, description: meal.ingredients?.trim() ? `Ingredients: ${meal.ingredients}` : undefined };
  }).filter(Boolean) as any[];

  if (events.length === 0) return;
  const dtstamp = toICSLocal(new Date());
  const body = events.map((e, i) => {
    const uid = `${dtstamp}-${i}@simple-dinners`;
    return ["BEGIN:VEVENT", `UID:${uid}`, `DTSTAMP:${dtstamp}`, `SUMMARY:${escapeICS(e.title)}`, e.description ? `DESCRIPTION:${escapeICS(e.description)}` : "", `DTSTART:${toICSLocal(e.start)}`, `DTEND:${toICSLocal(e.end)}`, "END:VEVENT"].filter(Boolean).join("\n");
  }).join("\n");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Simple Dinners//EN", body, "END:VCALENDAR"].join("\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "simple-dinners-week.ics";
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

function makeId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export default function WeekPage({
  meals, setMeals, generateDinnerPlan, daySettings, lockedDays, setLockedDays,
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
  const [shopItems, setShopItems] = React.useState<ShoppingItem[]>([]);
  const [shopInput, setShopInput] = React.useState("");
  const [openDay, setOpenDay] = React.useState<Day | null>(null);
  const [streak, setStreak] = React.useState(() => getDinnerStreak());

  const todayIndex = (() => { const jsDay = new Date().getDay(); return jsDay === 0 ? 6 : jsDay - 1; })();
  const todayDay = days[todayIndex] as Day;
  const tonight = getTonightDinner(meals?.[todayDay]);
  const cookedToday = streak.lastCookedDay === todayKey();

  const getTonightBadge = () => {
    const slug = tonight?.slug || tonight?.name?.toLowerCase().replace(/\s+/g, '-');
    if (!slug) return null;
    const history = getCookHistoryFor(slug);
    if (!history.timesCooked) return null;
    return history.timesCooked >= 3 ? "🏆 Family Classic" : "🔥 Cook Again";
  };
  const tonightBadge = getTonightBadge();

  React.useEffect(() => { 
    setStreak(getDinnerStreak());
    const raw = localStorage.getItem(SHOP_LS_KEY);
    if (raw) setShopItems(JSON.parse(raw));
  }, []);

  React.useEffect(() => { localStorage.setItem(SHOP_LS_KEY, JSON.stringify(shopItems)); }, [shopItems]);

  const sectionWrapper: React.CSSProperties = { padding: "20px 16px 40px 16px", maxWidth: 1200, margin: "0 auto" };
  const heroCard: React.CSSProperties = {
    padding: 24, borderRadius: 24, marginBottom: 32, position: "relative", overflow: "hidden",
    backgroundImage: tonight?.photoUrl ? `linear-gradient(rgba(15,23,42,0.8), rgba(15,23,42,0.95)), url(${tonight.photoUrl})` : "linear-gradient(135deg, rgba(20,184,166,0.2), rgba(15,23,42,0.6))",
    backgroundSize: "cover", backgroundPosition: "center", border: "1px solid rgba(20,184,166,0.3)", boxShadow: "0 15px 35px rgba(0,0,0,0.4)"
  };
  const cardGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 };
  const recipeCard: React.CSSProperties = { borderRadius: 24, background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" };
  const iconBtn: React.CSSProperties = { width: 36, height: 36, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "white", cursor: "pointer", display: "grid", placeItems: "center" };
  const chip: React.CSSProperties = { padding: "6px 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", fontSize: 11, fontWeight: 800 };

  const addShopItem = () => {
    if (!shopInput.trim()) return;
    setShopItems(prev => [{ id: makeId(), name: shopInput.trim(), checked: false, createdAt: Date.now() }, ...prev]);
    setShopInput("");
  };

  const clearWeek = () => {
    if (window.confirm("Clear the entire week?")) {
      setMeals(EMPTY_WEEK); setShopItems([]); setLockedDays(EMPTY_LOCKS);
    }
  };

  const updateMeal = (day: Day, field: keyof Meal, value: string) => {
    setMeals((prev) => ({
      ...prev,
      [day]: { ...(prev[day] ?? EMPTY_MEAL), [field]: value },
    }));
  };

  const formatRange = () => {
    const start = startOfWeekMonday(new Date());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
    const fmtYear = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });
    return start.getFullYear() === end.getFullYear()
      ? `${fmt.format(start)} – ${fmtYear.format(end)}`
      : `${fmtYear.format(start)} – ${fmtYear.format(end)}`;
  };
  const weekRange = formatRange();

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

  return (
    <div style={sectionWrapper}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900 }}>This Week</h2>
          <div style={{ opacity: 0.5, fontWeight: 700, fontSize: 14 }}>{weekRange}</div>
        </div>
        <button onClick={() => addWeekToCalendar(days, meals)} style={{ ...iconBtn, width: "auto", padding: "0 16px", gap: 8, fontSize: 13 }}>
          <CalendarPlus size={16} /> <span style={{fontWeight: 800}}>Calendar</span>
        </button>
      </div>

      <div style={heroCard}>
        <div style={{ fontSize: 11, fontWeight: 900, color: "#14b8a6", letterSpacing: "0.1em", marginBottom: 4 }}>TONIGHT'S DINNER</div>
        <h1 style={{ fontSize: 32, fontWeight: 950, margin: "0 0 12px 0" }}>{tonight?.name || "Ready to plan?"}</h1>
        
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <span style={chip}>🔥 Streak: {streak.currentStreak}</span>
          {tonightBadge && <span style={{ ...chip, background: "rgba(20,184,166,0.2)" }}>{tonightBadge}</span>}
          {tonight?.effort && <span style={chip}>Effort: {tonight.effort}</span>}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button onClick={() => tonight?.slug && navigate(`/recipe/${tonight.slug}?from=/week`)} disabled={!tonight?.name}>Cook Now</Button>
          <Button variant="secondary" onClick={() => { setStreak(recordDinnerStreak()); }} disabled={cookedToday || !tonight?.name}>
            {cookedToday ? "Cooked! ✅" : "Mark Cooked"}
          </Button>
          <button onClick={() => generateDinnerPlan(true)} style={{ ...iconBtn, width: 48, height: 48, borderRadius: 16 }}><RefreshCcw size={20}/></button>
        </div>
      </div>

      <div style={cardGrid}>
        {days.map((day) => {
          const meal = meals[day];
          const isLocked = lockedDays[day];
          const hasRecipe = Boolean(meal?.slug);
          return (
            <div key={day} style={recipeCard}>
              <div style={{ height: 140, background: `url(${meal?.photoUrl || mealImageUrl(meal?.name)}) center/cover`, cursor: hasRecipe ? "pointer" : "default" }} 
                   onClick={() => hasRecipe && navigate(`/recipe/${meal.slug}?from=/week`)} />
              
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#14b8a6" }}>{day.toUpperCase()}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{meal?.name || "Empty"}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={iconBtn} onClick={() => setLockedDays(prev => ({ ...prev, [day]: !isLocked }))}>
                      {isLocked ? <Lock size={16} color="#14b8a6" /> : <Unlock size={16} opacity={0.4} />}
                    </button>
                    <button style={iconBtn} onClick={() => setMeals(prev => ({ ...prev, [day]: EMPTY_MEAL }))}><Trash2 size={16}/></button>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                   <span style={chip}>{daySettings[day] || "normal"}</span>
                   <button onClick={() => setOpenDay(openDay === day ? null : day)} style={{ background: 'none', border: 'none', color: '#14b8a6', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                     {openDay === day ? "Hide" : "Edit"}
                   </button>
                </div>

                {openDay === day && (
                  <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
                    <input style={input} placeholder="Meal Name" value={meal.name} onChange={e => updateMeal(day, "name", e.target.value)} />
                    <textarea style={{ ...input, minHeight: 60 }} placeholder="Ingredients" value={meal.ingredients} onChange={e => updateMeal(day, "ingredients", e.target.value)} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 48, padding: 28, borderRadius: 24, background: "rgba(15,23,42,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>Shopping List</h2>
          <button onClick={() => setShopItems(prev => prev.filter(i => !i.checked))} style={{ background: 'none', border: 'none', color: '#14b8a6', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Clear Checked</button>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <input style={{ ...input, flex: 1, height: 48, fontSize: 16 }} placeholder="Add something..." value={shopInput} onChange={e => setShopInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addShopItem()} />
          <Button onClick={addShopItem}><Plus size={20} /></Button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {shopItems.map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
              <input type="checkbox" checked={item.checked} onChange={() => setShopItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i))} style={{ width: 20, height: 20, accentColor: "#14b8a6" }} />
              <span style={{ flex: 1, fontSize: 15, textDecoration: item.checked ? "line-through" : "none", opacity: item.checked ? 0.4 : 1 }}>{item.name}</span>
              <button onClick={() => setShopItems(prev => prev.filter(i => i.id !== item.id))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}><X size={16}/></button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 40 }}>
         <Button variant="danger" onClick={clearWeek}>Reset Everything</Button>
      </div>
    </div>
  );
}