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
  Download,
  Utensils,
  Refrigerator,
  Pencil,
} from "lucide-react";
import Card from "../components/Card";
import { days } from "../core/data";
import type { Meal, PantryItem } from "../core/types";

export default function WeekPage({
  meals,
  setMeals,
  generateDinnerPlan,
  lockedDays,
  setLockedDays,
  addDayToCookbook,
  pantry = [],
  pantryText = "",
  kitchenPath = "/pantry",
}: {
  meals: Record<string, Meal>;
  setMeals: React.Dispatch<React.SetStateAction<Record<string, Meal>>>;
  generateDinnerPlan: (force?: boolean) => void;
  lockedDays: Record<string, boolean>;
  setLockedDays: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  addDayToCookbook: (day: string) => void;
  pantry?: PantryItem[];
  pantryText?: string;
  kitchenPath?: string;
}) {
  const navigate = useNavigate();

  const toggleLock = (day: string) => {
    setLockedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const clearDay = (day: string) => {
    setMeals((prev) => ({
      ...prev,
      [day]: { name: "", ingredients: "", instructions: "", photoUrl: "" } as Meal,
    }));
  };

  function pad2(n: number) {
    return String(n).padStart(2, "0");
  }

  function safeFileName(text: string) {
    return (text || "meal")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function escapeICS(text: string) {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

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

  function toGoogleUTC(date: Date) {
    return (
      date.getUTCFullYear().toString() +
      pad2(date.getUTCMonth() + 1) +
      pad2(date.getUTCDate()) +
      "T" +
      pad2(date.getUTCHours()) +
      pad2(date.getUTCMinutes()) +
      pad2(date.getUTCSeconds()) +
      "Z"
    );
  }

  function getNextDateForDay(dayName: string) {
    const today = new Date();
    const todayDay = today.getDay();

    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const targetDay = dayMap[(dayName || "").toLowerCase()];
    const result = new Date(today);

    if (targetDay === undefined) {
      result.setHours(18, 0, 0, 0);
      return result;
    }

    let diff = targetDay - todayDay;
    if (diff < 0) diff += 7;

    result.setDate(today.getDate() + diff);
    result.setHours(18, 0, 0, 0);
    return result;
  }

  function buildMealDescription(meal: Meal) {
    const parts = [
      "Planned in Simple Dinners",
      meal?.ingredients?.trim() ? `Ingredients:\n${meal.ingredients.trim()}` : "",
      meal?.instructions?.trim() ? `Instructions:\n${meal.instructions.trim()}` : "",
    ].filter(Boolean);

    return parts.join("\n\n");
  }

  function buildEventTimes(day: string) {
    const start = getNextDateForDay(day);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return { start, end };
  }

  function buildICSEvent(day: string, meal: Meal, index = 0) {
    const { start, end } = buildEventTimes(day);
    const title = `Dinner: ${meal?.name?.trim() || "Meal"}`;
    const description = buildMealDescription(meal);

    return [
      "BEGIN:VEVENT",
      `UID:${Date.now()}-${index}-${safeFileName(day)}-${safeFileName(
        meal?.name || "meal"
      )}@simpledinners`,
      `DTSTAMP:${toICSLocal(new Date())}`,
      `DTSTART:${toICSLocal(start)}`,
      `DTEND:${toICSLocal(end)}`,
      `SUMMARY:${escapeICS(title)}`,
      `DESCRIPTION:${escapeICS(description)}`,
      "END:VEVENT",
    ].join("\r\n");
  }

  function downloadICSFile(filename: string, events: string[]) {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Simple Dinners//Meal Planner//EN",
      ...events,
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function downloadDayICS(day: string, meal: Meal) {
    const filename = `${safeFileName(day)}-${safeFileName(meal?.name || "meal")}.ics`;
    downloadICSFile(filename, [buildICSEvent(day, meal)]);
  }

  function downloadWholeWeekICS() {
    const plannedDays = days.filter((day) => !!meals[day]?.name?.trim());
    if (!plannedDays.length) return;

    const events = plannedDays.map((day, index) => buildICSEvent(day, meals[day], index));
    downloadICSFile("simple-dinners-week-plan.ics", events);
  }

  function openGoogleCalendar(day: string, meal: Meal) {
    const { start, end } = buildEventTimes(day);
    const title = `Dinner: ${meal?.name?.trim() || "Meal"}`;
    const details = buildMealDescription(meal);

    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(title)}` +
      `&dates=${toGoogleUTC(start)}/${toGoogleUTC(end)}` +
      `&details=${encodeURIComponent(details)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  function addWholeWeekToCalendar() {
    const plannedDays = days.filter((day) => !!meals[day]?.name?.trim());
    if (!plannedDays.length) return;

    downloadWholeWeekICS();
  }

  const plannedMealCount = days.filter((day) => !!meals[day]?.name?.trim()).length;

  const pantryNames = (pantry ?? [])
    .map((item) => item?.name?.trim())
    .filter(Boolean) as string[];

  const pantryTextItems = (pantryText || "")
    .split(/[\n,]+/g)
    .map((item) => item.trim())
    .filter(Boolean);

  const kitchenItems = Array.from(new Set([...pantryNames, ...pantryTextItems]));
  const kitchenPreview = kitchenItems.slice(0, 6);
  const hasKitchenItems = kitchenItems.length > 0;

  const btnBase: React.CSSProperties = {
    border: "none",
    borderRadius: 14,
    padding: "12px",
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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
          padding: "0 20px 140px 20px",
          display: "grid",
          gap: 24,
        }}
      >
        <header style={{ textAlign: "center", marginTop: 20 }}>
          <h2 style={{ fontSize: 28, fontWeight: 1000, margin: 0 }}>Weekly Planner</h2>
          <p style={{ opacity: 0.5, fontSize: 15, marginTop: 4 }}>
            Tap a day to view the recipe.
          </p>
        </header>

        <div style={{ position: "sticky", top: 20, zIndex: 10, display: "grid", gap: 10 }}>
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

          <button
            onClick={addWholeWeekToCalendar}
            disabled={!plannedMealCount}
            style={{
              ...btnBase,
              width: "100%",
              background: plannedMealCount
                ? "rgba(59,130,246,0.12)"
                : "rgba(255,255,255,0.05)",
              color: plannedMealCount ? "#60a5fa" : "rgba(255,255,255,0.35)",
              cursor: plannedMealCount ? "pointer" : "not-allowed",
            }}
          >
            <CalendarPlus size={16} />
            {plannedMealCount
              ? `Add ${plannedMealCount} Meal${plannedMealCount > 1 ? "s" : ""} to Calendar`
              : "No meals planned"}
          </button>
        </div>

        <Card style={{ padding: 0, overflow: "hidden", borderRadius: "24px" }}>
          <div style={{ padding: "18px 20px", display: "grid", gap: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Refrigerator size={18} style={{ opacity: 0.55 }} />
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>What’s In Your Kitchen</div>
                  <div style={{ fontSize: 13, opacity: 0.55 }}>
                    Planner will prefer meals using what you already have.
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(kitchenPath)}
                style={{
                  border: "none",
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.88)",
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <Pencil size={14} />
                Manage
              </button>
            </div>

            {hasKitchenItems ? (
              <>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {kitchenPreview.map((item) => (
                    <span
                      key={item}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 999,
                        background: "rgba(34,197,94,0.12)",
                        color: "#86efac",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {item}
                    </span>
                  ))}

                  {kitchenItems.length > kitchenPreview.length && (
                    <span
                      style={{
                        padding: "8px 12px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      +{kitchenItems.length - kitchenPreview.length} more
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 13, opacity: 0.5 }}>
                  Using {kitchenItems.length} kitchen item{kitchenItems.length !== 1 ? "s" : ""} to
                  influence your week plan.
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate(kitchenPath)}
                style={{
                  border: "2px dashed rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.5)",
                  borderRadius: 18,
                  padding: "18px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Add kitchen items to help generate smarter meal plans
              </button>
            )}
          </div>
        </Card>

        <div style={{ display: "grid", gap: 16 }}>
          {days.map((day) => {
            const meal = meals[day];
            const hasMeal = !!meal?.name?.trim();
            const isLocked = !!lockedDays[day];

            return (
              <Card key={day} style={{ padding: 0, overflow: "hidden", borderRadius: "24px" }}>
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
                            `/recipe/${encodeURIComponent(meal.slug || meal.name || "")}?from=/week`
                          )
                        }
                        style={{
                          display: "flex",
                          gap: 16,
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        {meal.photoUrl ? (
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
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 85,
                              height: 85,
                              borderRadius: 18,
                              border: "1px solid rgba(255,255,255,0.1)",
                              background: "rgba(255,255,255,0.04)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Utensils size={22} style={{ opacity: 0.4 }} />
                          </div>
                        )}

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

                        <ChevronRight size={20} style={{ opacity: 0.2, flexShrink: 0 }} />
                      </div>

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button
                          onClick={() => openGoogleCalendar(day, meal)}
                          style={{
                            ...btnBase,
                            flex: 1,
                            minWidth: 0,
                            background: "rgba(59,130,246,0.12)",
                            color: "#60a5fa",
                          }}
                        >
                          <CalendarPlus size={16} />
                          Add to Calendar
                        </button>

                        <button
                          onClick={() => downloadDayICS(day, meal)}
                          style={{
                            ...btnBase,
                            flex: 1,
                            minWidth: 0,
                            background: "rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.88)",
                          }}
                        >
                          <Download size={16} />
                          .ics
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
                        <Trash2 size={16} style={{ marginBottom: -3, marginRight: 4 }} />
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