import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Share2,
} from "lucide-react";
import Card from "../components/Card";
import { days } from "../core/data";
import type { Meal } from "../core/types";

type WalkthroughStep = 1 | 2 | 3;
type TooltipPosition = {
  top: number;
  left: number;
  width: number;
};

function createLeftoversMeal(day: string): Meal {
  return {
    id: `leftovers-${day.toLowerCase()}`,
    slug: `leftovers-${day.toLowerCase()}`,
    name: "Leftovers",
    ingredients: "",
    instructions: "",
    notes: "Use what’s already in the fridge.",
    effort: "quick" as any,
    tags: ["leftovers"],
    photoUrl: "/images/leftovers.webp",
    isLeftovers: true as any,
  } as Meal;
}

export default function WeekPage({
  meals,
  setMeals,
  generateDinnerPlan,
  lockedDays,
  setLockedDays,
  addDayToCookbook,
}: {
  meals: Record<string, Meal>;
  setMeals: React.Dispatch<React.SetStateAction<Record<string, Meal>>>;
  generateDinnerPlan: (force?: boolean) => void;
  lockedDays: Record<string, boolean>;
  setLockedDays: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  addDayToCookbook: (day: string) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [showFirstMessage, setShowFirstMessage] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState<WalkthroughStep>(1);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(
    null
  );

  const generatePlanRef = useRef<HTMLButtonElement | null>(null);
  const firstLockRef = useRef<HTMLButtonElement | null>(null);
  const wholeWeekCalendarRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isFirst = params.get("first") === "true";

    if (!isFirst) return;

    const hasMeals = days.some((day) => !!meals[day]?.name?.trim());

    if (!hasMeals) {
      generateDinnerPlan();
    }

    setShowFirstMessage(true);

    const seenWalkthrough =
      localStorage.getItem("simple-dinners.seen-week-walkthrough") === "true";

    if (!seenWalkthrough) {
      setShowWalkthrough(true);
      setWalkthroughStep(1);
    }

    const t = window.setTimeout(() => {
      setShowFirstMessage(false);
    }, 3000);

    window.history.replaceState({}, "", "/week");

    return () => window.clearTimeout(t);
  }, [location.search, meals, generateDinnerPlan]);

  function finishWalkthrough() {
    localStorage.setItem("simple-dinners.seen-week-walkthrough", "true");
    setShowWalkthrough(false);
    setWalkthroughStep(1);
    setTooltipPosition(null);
  }

  function nextWalkthroughStep() {
    setWalkthroughStep((prev) => {
      if (prev >= 3) return prev;
      return (prev + 1) as WalkthroughStep;
    });
  }

  const activeTargetRef = useMemo(() => {
    if (walkthroughStep === 1) return generatePlanRef;
    if (walkthroughStep === 2) return firstLockRef;
    return wholeWeekCalendarRef;
  }, [walkthroughStep]);

  function updateTooltipPosition() {
    if (!showWalkthrough) {
      setTooltipPosition(null);
      return;
    }

    const el = activeTargetRef.current;
    if (!el) {
      setTooltipPosition(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const tooltipWidth = Math.min(window.innerWidth - 32, 340);

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    left = Math.max(16, left);
    left = Math.min(left, window.innerWidth - tooltipWidth - 16);

    let top = rect.bottom + 14;

    if (top > window.innerHeight - 220) {
      top = rect.top - 170;
    }

    top = Math.max(16, top);

    setTooltipPosition({
      top,
      left,
      width: tooltipWidth,
    });
  }

  useEffect(() => {
    if (!showWalkthrough) return;

    const t = window.setTimeout(() => {
      updateTooltipPosition();
      activeTargetRef.current?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }, 120);

    return () => window.clearTimeout(t);
  }, [showWalkthrough, walkthroughStep, meals]);

  useEffect(() => {
    if (!showWalkthrough) return;

    const handler = () => updateTooltipPosition();

    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);

    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [showWalkthrough, walkthroughStep]);

  function isActiveTarget(target: "generate" | "lock" | "calendar") {
    if (!showWalkthrough) return false;
    if (walkthroughStep === 1 && target === "generate") return true;
    if (walkthroughStep === 2 && target === "lock") return true;
    if (walkthroughStep === 3 && target === "calendar") return true;
    return false;
  }

  function getSpotlightStyle(active: boolean): React.CSSProperties {
    if (!active) return {};

    return {
      position: "relative",
      zIndex: 10001,
      boxShadow:
        "0 0 0 3px rgba(20,184,166,0.95), 0 0 0 8px rgba(20,184,166,0.18), 0 18px 40px rgba(0,0,0,0.38)",
    };
  }

  function normalizePhotoUrl(url?: string) {
    if (!url) return "";

    const trimmed = url.trim();

    if (trimmed.startsWith("/images/")) {
      return trimmed.replace(/\.(png|jpg|jpeg)$/i, ".webp");
    }

    return trimmed;
  }

  const toggleLock = (day: string) => {
    setLockedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const clearDay = (day: string) => {
    setMeals((prev) => {
      const next = { ...prev };
      delete next[day];
      return next;
    });
  };

  const setLeftovers = (day: string) => {
    setMeals((prev) => ({
      ...prev,
      [day]: createLeftoversMeal(day),
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
      meal?.instructions?.trim()
        ? `Instructions:\n${meal.instructions.trim()}`
        : "",
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

  function shareWeekPlan() {
    const lines = days
      .map((day) => {
        const meal = meals[day];
        return meal?.name?.trim() ? `${day}: ${meal.name}` : null;
      })
      .filter(Boolean);

    if (!lines.length) return;

    const text = `My Simple Dinners Week Plan:\n\n${lines.join("\n")}`;

    if (navigator.share) {
      navigator
        .share({
          title: "My Week Plan",
          text,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert("Week plan copied!");
    }
  }

  function downloadDayICS(day: string, meal: Meal) {
    const filename = `${safeFileName(day)}-${safeFileName(
      meal?.name || "meal"
    )}.ics`;
    downloadICSFile(filename, [buildICSEvent(day, meal)]);
  }

  function downloadWholeWeekICS() {
    const plannedDays = days.filter((day) => !!meals[day]?.name?.trim());
    if (!plannedDays.length) return;

    const events = plannedDays.map((day, index) =>
      buildICSEvent(day, meals[day], index)
    );

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

  const plannedMealCount = days.filter(
    (day) => !!meals[day]?.name?.trim()
  ).length;

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

  function renderWalkthroughContent() {
    if (walkthroughStep === 1) {
      return {
        title: "Generate your week",
        body:
          "Tap Generate New Plan anytime to instantly build a fresh week of dinners.",
        cta: "Next →",
      };
    }

    if (walkthroughStep === 2) {
      return {
        title: "Lock meals you want to keep",
        body:
          "Use Lock on any day to keep that dinner in place when you reroll the rest of the week.",
        cta: "Next →",
      };
    }

    return {
      title: "Add your week to calendar",
      body:
        "Add one meal or your whole week to your calendar so dinner is already scheduled.",
      cta: "Start Planning →",
    };
  }

  const walkthroughContent = renderWalkthroughContent();

  return (
    <>
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

          {showFirstMessage && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.35)",
                color: "#86efac",
                fontWeight: 800,
                textAlign: "center",
              }}
            >
              Your first week is ready 🎉
            </div>
          )}

          <div style={{ display: "grid", gap: 16 }}>
            {days.map((day, index) => {
              const meal = meals[day];
              const isLeftovers = !!(meal as any)?.isLeftovers;
              const hasMeal = !!meal?.name?.trim();
              const isLocked = !!lockedDays[day];
              const mealPhotoUrl = normalizePhotoUrl(meal?.photoUrl);

              return (
                <Card
                  key={day}
                  style={{
                    padding: 0,
                    overflow: "hidden",
                    borderRadius: "24px",
                    position: "relative",
                    zIndex: showWalkthrough ? 2 : "auto",
                  }}
                >
                  <div style={{ padding: "20px", display: "grid", gap: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 10 }}
                      >
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
                        ref={index === 0 ? firstLockRef : undefined}
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
                          ...getSpotlightStyle(
                            index === 0 && isActiveTarget("lock")
                          ),
                        }}
                      >
                        {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                        {isLocked ? "LOCKED" : "LOCK"}
                      </button>
                    </div>

                    {hasMeal ? (
                      <>
                        <div
                          onClick={() => {
                            if (!isLeftovers) {
                              navigate(
                                `/recipe/${encodeURIComponent(
                                  meal.slug || meal.name || ""
                                )}?from=/week`
                              );
                            }
                          }}
                          style={{
                            display: "flex",
                            gap: 16,
                            alignItems: "center",
                            cursor: isLeftovers ? "default" : "pointer",
                          }}
                        >
                          {mealPhotoUrl ? (
                            <img
                              src={mealPhotoUrl}
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
                              {isLeftovers ? "Leftovers Night" : meal.name}
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
                              {isLeftovers
                                ? "No cooking tonight 👍"
                                : "Tap for Details"}
                            </div>
                          </div>

                          {!isLeftovers && (
                            <ChevronRight
                              size={20}
                              style={{ opacity: 0.2, flexShrink: 0 }}
                            />
                          )}
                        </div>

                        <div
                          style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
                        >
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
                      <div style={{ display: "grid", gap: 10 }}>
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

                        <button
                          onClick={() => setLeftovers(day)}
                          style={{
                            padding: "12px",
                            borderRadius: "14px",
                            background: "rgba(234,179,8,0.12)",
                            color: "#facc15",
                            border: "none",
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          <Utensils
                            size={16}
                            style={{ marginRight: 6, marginBottom: -3 }}
                          />
                          Set as Leftovers
                        </button>
                      </div>
                    )}

                    {hasMeal && !isLocked && (
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          marginTop: 4,
                          flexWrap: "wrap",
                        }}
                      >
                        {!isLeftovers && (
                          <button
                            onClick={() => setLeftovers(day)}
                            style={{
                              flex: 1,
                              padding: "12px",
                              borderRadius: "14px",
                              background: "rgba(234,179,8,0.12)",
                              color: "#facc15",
                              border: "none",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            <Utensils
                              size={16}
                              style={{ marginBottom: -3, marginRight: 4 }}
                            />
                            Leftovers
                          </button>
                        )}

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

                        {!isLeftovers && (
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
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <div
            style={{
              display: "grid",
              gap: 10,
              marginTop: 4,
              position: "relative",
              zIndex: showWalkthrough ? 2 : "auto",
            }}
          >
            <button
              onClick={shareWeekPlan}
              disabled={!plannedMealCount}
              style={{
                ...btnBase,
                width: "100%",
                padding: "14px 16px",
                background: plannedMealCount
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(255,255,255,0.05)",
                color: plannedMealCount ? "#86efac" : "rgba(255,255,255,0.35)",
                cursor: plannedMealCount ? "pointer" : "not-allowed",
              }}
            >
              <Share2 size={16} />
              {plannedMealCount ? "Share Week Plan" : "No meals to share"}
            </button>

            <button
              ref={generatePlanRef}
              onClick={() => generateDinnerPlan(true)}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "18px",
                background: "rgba(34,197,94,0.14)",
                color: "#4ade80",
                border: "1px solid rgba(34,197,94,0.22)",
                fontWeight: 900,
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                cursor: "pointer",
                ...getSpotlightStyle(isActiveTarget("generate")),
              }}
            >
              <Sparkles size={18} />
              Generate New Plan
            </button>

            <button
              ref={wholeWeekCalendarRef}
              onClick={addWholeWeekToCalendar}
              disabled={!plannedMealCount}
              style={{
                ...btnBase,
                width: "100%",
                padding: "14px 16px",
                background: plannedMealCount
                  ? "rgba(59,130,246,0.12)"
                  : "rgba(255,255,255,0.05)",
                color: plannedMealCount ? "#60a5fa" : "rgba(255,255,255,0.35)",
                cursor: plannedMealCount ? "pointer" : "not-allowed",
                ...getSpotlightStyle(isActiveTarget("calendar")),
              }}
            >
              <CalendarPlus size={16} />
              {plannedMealCount
                ? `Add ${plannedMealCount} Meal${
                    plannedMealCount > 1 ? "s" : ""
                  } to Calendar`
                : "No meals planned"}
            </button>
          </div>
        </div>
      </div>

      {showWalkthrough && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              background: "rgba(2,6,23,0.72)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />

          {tooltipPosition && (
            <div
              style={{
                position: "fixed",
                top: tooltipPosition.top,
                left: tooltipPosition.left,
                width: tooltipPosition.width,
                zIndex: 10002,
                borderRadius: 22,
                background:
                  "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(2,6,23,0.98) 100%)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.42)",
                padding: 20,
                color: "#f8fafc",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    opacity: 0.7,
                  }}
                >
                  Quick Tour
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 3].map((n) => (
                    <span
                      key={n}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background:
                          n <= walkthroughStep
                            ? "rgba(20,184,166,0.98)"
                            : "rgba(255,255,255,0.16)",
                        boxShadow:
                          n <= walkthroughStep
                            ? "0 0 0 3px rgba(20,184,166,0.14)"
                            : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              <h3
                style={{
                  fontSize: 24,
                  fontWeight: 1000,
                  margin: "0 0 8px",
                  lineHeight: 1.1,
                }}
              >
                {walkthroughContent.title}
              </h3>

              <p
                style={{
                  margin: 0,
                  opacity: 0.84,
                  lineHeight: 1.55,
                  fontSize: 15,
                }}
              >
                {walkthroughContent.body}
              </p>

              <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
                {walkthroughStep < 3 ? (
                  <button
                    onClick={nextWalkthroughStep}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: 16,
                      border: "1px solid rgba(20,184,166,0.42)",
                      background: "rgba(20,184,166,0.22)",
                      color: "#f8fafc",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    {walkthroughContent.cta}
                  </button>
                ) : (
                  <button
                    onClick={finishWalkthrough}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: 16,
                      border: "1px solid rgba(20,184,166,0.42)",
                      background: "rgba(20,184,166,0.22)",
                      color: "#f8fafc",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    {walkthroughContent.cta}
                  </button>
                )}

                <button
                  onClick={finishWalkthrough}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(248,250,252,0.82)",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}