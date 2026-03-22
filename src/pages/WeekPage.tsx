import { useNavigate } from "react-router-dom";
import {
  Lock,
  Unlock,
  Plus,
  ChevronRight,
  CalendarDays,
  Sparkles,
  ChefHat,
  Trash2,
  CalendarPlus,
} from "lucide-react";
import Card from "../components/Card";
import { days } from "../core/data";
import type { Meal } from "../core/types";

export default function WeekPage({
  meals,
  setMeals,
  generateDinnerPlan,
  lockedDays,
  setLockedDays,
  addDayToCookbook,
}: {
  meals: Record<string, Meal>;
  setMeals: any;
  generateDinnerPlan: (force?: boolean) => void;
  lockedDays: Record<string, boolean>;
  setLockedDays: any;
  addDayToCookbook: (day: string) => void;
}) {
  const navigate = useNavigate();

  const toggleLock = (day: string) => {
    setLockedDays((prev: any) => ({ ...prev, [day]: !prev[day] }));
  };

  const clearDay = (day: string) => {
    setMeals((prev: any) => ({
      ...prev,
      [day]: { name: "", ingredients: "", instructions: "", photoUrl: "" },
    }));
  };

  function pad2(n: number) {
    return String(n).padStart(2, "0");
  }

  // Local time format for ICS: YYYYMMDDTHHMMSS
  function toICSLocal(date: Date) {
    return (
      date.getFullYear().toString() +
      pad2(date.getMonth() + 1) +
      pad2(date.getDate()) +
      "T" +
      pad2(date.getHours()) +
      pad2(date.getMinutes()) +
      pad2(date.getSeconds())
    );
  }

  function escapeICS(text: string) {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function getNextDateForDay(dayName: string) {
    const today = new Date();
    const todayDay = today.getDay(); // 0 = Sunday
    const dayMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const targetDay = dayMap[dayName];
    if (targetDay === undefined) return new Date(today);

    let diff = targetDay - todayDay;
    if (diff < 0) diff += 7;

    const result = new Date(today);
    result.setHours(18, 0, 0, 0);
    result.setDate(today.getDate() + diff);

    return result;
  }

  function downloadICS(day: string, meal: Meal) {
    const start = getNextDateForDay(day);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const title = `Dinner: ${meal?.name?.trim() || "Meal"}`;

    const descriptionParts = [
      "Planned in Simple Dinners",
      meal?.ingredients?.trim() ? `Ingredients:\n${meal.ingredients.trim()}` : "",
      meal?.instructions?.trim() ? `Instructions:\n${meal.instructions.trim()}` : "",
    ].filter(Boolean);

    const description = descriptionParts.join("\n\n");

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Simple Dinners//Meal Planner//EN",
      "BEGIN:VEVENT",
      `UID:${Date.now()}-${day.toLowerCase()}@simpledinners`,
      `DTSTAMP:${toICSLocal(new Date())}`,
      `DTSTART:${toICSLocal(start)}`,
      `DTEND:${toICSLocal(end)}`,
      `SUMMARY:${escapeICS(title)}`,
      `DESCRIPTION:${escapeICS(description)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = (meal?.name || "meal")
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    link.href = url;
    link.download = `${day.toLowerCase()}-${safeName}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

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
          padding: "0 20px 140px 20px",
          display: "grid",
          gap: 24,
        }}
      >
        <header style={{ textAlign: "center", marginTop: 20 }}>
          <h2 style={{ fontSize: 28, fontWeight: 1000, margin: 0 }}>
            Weekly Planner
          </h2>
          <p style={{ opacity: 0.5, fontSize: 15, marginTop: 4 }}>
            Tap a day to view the recipe.
          </p>
        </header>

        <div style={{ position: "sticky", top: 20, zIndex: 10 }}>
          <button
            onClick={() => generateDinnerPlan(true)}
            style={{
              width: "100%",
              padding: "18px",
              borderRadius: "24px",
              background: "#22c55e",
              color: "#fff",
              border: "none",
              fontWeight: 900,
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              boxShadow: "0 10px 25px -5px rgba(34,197,94,0.4)",
              cursor: "pointer",
            }}
          >
            <Sparkles size={22} fill="white" />
            Generate New Plan
          </button>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {days.map((day) => {
            const meal = meals[day];
            const hasMeal = !!meal?.name?.trim();
            const isLocked = lockedDays[day];

            return (
              <Card
                key={day}
                style={{ padding: 0, overflow: "hidden", borderRadius: "24px" }}
              >
                <div style={{ padding: "20px", display: "grid", gap: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <CalendarDays size={18} style={{ opacity: 0.4 }} />
                      <span
                        style={{
                          fontWeight: 900,
                          fontSize: 18,
                          textTransform: "uppercase",
                        }}
                      >
                        {day}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleLock(day)}
                      style={{
                        background: isLocked
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(255,255,255,0.05)",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "12px",
                        color: isLocked ? "#22c55e" : "rgba(255,255,255,0.4)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                        fontWeight: 800,
                      }}
                    >
                      {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                      {isLocked ? "LOCKED" : "LOCK"}
                    </button>
                  </div>

                  {hasMeal ? (
                    <>
                      <div
                        onClick={() =>
                          navigate(
                            `/recipe/${encodeURIComponent(
                              meal.slug || meal.name
                            )}?from=/week`
                          )
                        }
                        style={{
                          display: "flex",
                          gap: 16,
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={meal.photoUrl}
                          alt={meal.name || "Meal"}
                          style={{
                            width: 85,
                            height: 85,
                            borderRadius: 18,
                            objectFit: "cover",
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(255,255,255,0.04)",
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: 19,
                              marginBottom: 4,
                              lineHeight: 1.2,
                            }}
                          >
                            {meal.name}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              opacity: 0.5,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <ChefHat size={14} />
                            Tap for Details
                          </div>
                        </div>
                        <ChevronRight size={20} style={{ opacity: 0.2 }} />
                      </div>

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button
                          onClick={() => downloadICS(day, meal)}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: "12px",
                            borderRadius: "14px",
                            background: "rgba(59,130,246,0.12)",
                            color: "#60a5fa",
                            border: "none",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                          }}
                        >
                          <CalendarPlus size={16} />
                          Add to Calendar
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      onClick={() => navigate("/cookbook")}
                      style={{
                        padding: "24px",
                        borderRadius: "18px",
                        border: "2px dashed rgba(255,255,255,0.1)",
                        textAlign: "center",
                        cursor: "pointer",
                        color: "rgba(255,255,255,0.4)",
                        fontWeight: 700,
                      }}
                    >
                      <Plus size={24} style={{ marginBottom: 6 }} />
                      <div>Pick a meal from Cookbook</div>
                    </div>
                  )}

                  {hasMeal && !isLocked && (
                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                      <button
                        onClick={() => clearDay(day)}
                        style={{
                          flex: 1,
                          padding: "12px",
                          borderRadius: "14px",
                          background: "rgba(239,68,68,0.1)",
                          color: "#ef4444",
                          border: "none",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        <Trash2
                          size={16}
                          style={{ marginBottom: -3, marginRight: 4 }}
                        />
                        Remove
                      </button>

                      <button
                        onClick={() => addDayToCookbook(day)}
                        style={{
                          flex: 1,
                          padding: "12px",
                          borderRadius: "14px",
                          background: "rgba(34,197,94,0.1)",
                          color: "#22c55e",
                          border: "none",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Save Recipe
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}