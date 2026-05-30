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
  Utensils,
  Share2,
} from "lucide-react";
import Card from "../components/Card";
import { days } from "../core/data";
import type { Meal, PlannedDay } from "../core/types";
import TipsModal from "../components/TipsModal";
import { t, getStoredLanguage } from "../i18n";
import { getLocalizedMeal } from "../core/localizedMeal";
import { Capacitor } from "@capacitor/core";

type WalkthroughStep = 1 | 2 | 3;

type TooltipPosition = {
  top: number;
  left: number;
  width: number;
};

// =====================================================
// Prep Ahead helpers
// =====================================================
const PREP_AHEAD_IGNORE = new Set([
  "salt",
  "pepper",
  "black pepper",
  "salt and pepper",
  "oil",
  "olive oil",
  "vegetable oil",
  "water",
  "butter",
  "cooking spray",
  "flour",
  "sugar",
]);

const PREP_AHEAD_NORMALIZE: Record<string, string> = {
  onions: "onion",
  "yellow onion": "onion",
  "white onion": "onion",
  "red onion": "onion",
  garlic: "garlic",
  "garlic cloves": "garlic",
  "cloves garlic": "garlic",
  lemons: "lemon",
  limes: "lime",
  tomatoes: "tomato",
  avocados: "avocado",
  cilantro: "cilantro",
  parsley: "parsley",
  "green onions": "green onion",
  "bell peppers": "bell pepper",
  "green bell pepper": "bell pepper",
  "red bell pepper": "bell pepper",
  "yellow bell pepper": "bell pepper",
};


function cleanupPrepIngredient(line: string) {
  let text = String(line || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/^\s*[-•*]\s*/, "")
    .replace(
      /^\s*(\d+\s\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(cup|cups|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|lb|lbs|pounds?|cloves?|cans?|packages?|boxes?|jars?|bags?)?\s+/i,
      ""
    )
    .replace(/\b(chopped|diced|minced|sliced|shredded|grated|fresh|freshly|small|medium|large|drained|rinsed|divided|optional|to taste)\b/g, " ")
    .split(",")[0]
    .replace(/\s+/g, " ")
    .trim();

  if (PREP_AHEAD_NORMALIZE[text]) {
    text = PREP_AHEAD_NORMALIZE[text];
  }

  if (text.includes("garlic")) text = "garlic";
  if (text.includes("cilantro")) text = "cilantro";
  if (text.includes("lime")) text = "lime";
  if (text.includes("lemon")) text = "lemon";
  if (text.includes("onion")) text = text.includes("green") ? "green onion" : "onion";
  if (text.includes("bell pepper")) text = "bell pepper";

  if (!text || PREP_AHEAD_IGNORE.has(text)) return "";

  return text;
}

function extractPrepIngredients(ingredients?: string) {
  return Array.from(
    new Set(
      String(ingredients || "")
        .split(/\n+/)
        .map(cleanupPrepIngredient)
        .filter(Boolean)
    )
  );
}

function formatPrepIngredient(name: string) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getPrepAheadItems(todayMeal?: Meal | null, tomorrowMeal?: Meal | null) {
  if (!todayMeal || !tomorrowMeal) return [];

  const todayItems = extractPrepIngredients(todayMeal.ingredients);
  const tomorrowItems = new Set(extractPrepIngredients(tomorrowMeal.ingredients));

  return todayItems.filter((item) => tomorrowItems.has(item)).slice(0, 4);
}

export default function WeekPage({
  meals,
  setMeals,
  generateDinnerPlan,
  lockedDays,
  setLockedDays,
  addDayToCookbook,
}: {
  meals: Record<string, PlannedDay>;
  setMeals: React.Dispatch<React.SetStateAction<Record<string, PlannedDay>>>;
  generateDinnerPlan: (force?: boolean) => void;
  lockedDays: Record<string, boolean>;
  setLockedDays: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  addDayToCookbook: (day: string) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const language = getStoredLanguage();

  const WEEK_TIP_KEYS = [
    "week.tips.tapMeal",
    "week.tips.lockDay",
    "week.tips.leftoversFreezer",
    "week.tips.generateAnytime",
  ];

  const weekTips = WEEK_TIP_KEYS.map((key) => t(key));

  const [showFirstMessage, setShowFirstMessage] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState<WalkthroughStep>(1);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(
    null
  );
  const [highlightDay, setHighlightDay] = useState<string | null>(null);
  const [showAddedMessage, setShowAddedMessage] = useState<string | null>(null);

  const generatePlanRef = useRef<HTMLButtonElement | null>(null);
  const firstLockRef = useRef<HTMLButtonElement | null>(null);
  const wholeWeekCalendarRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isFirst = params.get("first") === "true";

    if (!isFirst) return;

    const hasMeals = days.some((day) => {
      const dayPlan = meals[day];
      return dayPlan?.mode === "planned" && !!dayPlan?.meal?.name?.trim();
    });

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

    const spaceBelow = window.innerHeight - rect.bottom;
    const tooltipHeight = Math.min(320, window.innerHeight * 0.5);

    let top: number;

    if (spaceBelow < tooltipHeight) {
      top = rect.top - tooltipHeight - 16;
    } else {
      top = rect.bottom + 16;
    }

    top = Math.max(20, top);
    top = Math.min(top, window.innerHeight - tooltipHeight - 20);

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
  }, [showWalkthrough, walkthroughStep, meals, activeTargetRef]);

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

  useEffect(() => {
    const addedDay = location.state?.addedDay as string | undefined;

    if (!addedDay) return;

    setHighlightDay(addedDay);
    setShowAddedMessage(addedDay);

    const el = document.getElementById(`day-${addedDay}`);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }

    const highlightTimeout = setTimeout(() => {
      setHighlightDay(null);
    }, 2000);

    const messageTimeout = setTimeout(() => {
      setShowAddedMessage(null);
    }, 2500);

    navigate("/week", { replace: true });

    return () => {
      clearTimeout(highlightTimeout);
      clearTimeout(messageTimeout);
    };
  }, [location.state, navigate]);

  function normalizePhotoUrl(url?: string) {
  if (!url) return "";

  const trimmed = url.trim();

  if (trimmed.startsWith("/images/")) {
    const extension = Capacitor.getPlatform() === "android" ? ".webp" : ".jpg";
    return trimmed.replace(/\.(png|jpg|jpeg|webp)$/i, extension);
  }

  return trimmed;
}

  const toggleLock = (day: string) => {
    setLockedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const clearDay = (day: string) => {
    setMeals((prev) => ({
      ...prev,
      [day]: { mode: "planned", meal: null },
    }));
  };

  const setLeftovers = (day: string) => {
    setMeals((prev) => ({
      ...prev,
      [day]: { mode: "leftovers", meal: null },
    }));
  };

  const setFreezer = (day: string) => {
    setMeals((prev) => ({
      ...prev,
      [day]: { mode: "freezer", meal: null },
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
      t("week.plannedInSimpleDinners"),
      meal?.ingredients?.trim() ? `${t("recipe.ingredients")}:\n${meal.ingredients.trim()}` : "",
      meal?.instructions?.trim()
        ? `${t("recipe.instructions")}:\n${meal.instructions.trim()}`
        : "",
    ].filter(Boolean);

    return parts.join("\n\n");
  }

  function getDayLabel(dayPlan: PlannedDay | undefined) {
    if (!dayPlan) return null;

    if (dayPlan.mode === "leftovers") return t("week.leftovers");
    if (dayPlan.mode === "freezer") return t("week.freezerNight");

    if (dayPlan.mode === "planned") {
      return dayPlan.meal?.name?.trim() || null;
    }

    return null;
  }

  function buildEventTimes(day: string) {
    const start = getNextDateForDay(day);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return { start, end };
  }

  function buildICSEvent(day: string, dayPlan: PlannedDay, index = 0) {
    const { start, end } = buildEventTimes(day);
    const label = getDayLabel(dayPlan) || t("week.meal");
    const title = `${t("week.dinner")}: ${label}`;
    const description =
      dayPlan.mode === "planned" && dayPlan.meal
        ? buildMealDescription(dayPlan.meal)
        : t("week.plannedInSimpleDinners");

    return [
      "BEGIN:VEVENT",
      `UID:${Date.now()}-${index}-${safeFileName(day)}-${safeFileName(
        label
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
        const label = getDayLabel(meals[day]);
        if (!label) return null;
        return `${getTranslatedDay(day)}: ${label}`;
      })
      .filter(Boolean) as string[];

    if (!lines.length) return;

    const text = `${t("week.shareTextTitle")}:\n\n${lines.join("\n")}`;

    if (navigator.share) {
      navigator
        .share({
          title: t("week.shareTitle"),
          text,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert(t("week.copied"));
    }
  }

  function downloadDayICS(day: string, dayPlan: PlannedDay) {
    const label = getDayLabel(dayPlan) || t("week.meal").toLowerCase();
    const filename = `${safeFileName(day)}-${safeFileName(label)}.ics`;
    downloadICSFile(filename, [buildICSEvent(day, dayPlan)]);
  }

  function downloadWholeWeekICS() {
    const validDays = days.filter((day) => !!getDayLabel(meals[day]));

    if (!validDays.length) return;

    const events = validDays.map((day, index) =>
      buildICSEvent(day, meals[day], index)
    );

    downloadICSFile("simple-dinners-week-plan.ics", events);
  }

  function openGoogleCalendar(day: string, dayPlan: PlannedDay) {
    const { start, end } = buildEventTimes(day);
    const label = getDayLabel(dayPlan) || t("week.meal");
    const title = `${t("week.dinner")}: ${label}`;
    const details =
      dayPlan.mode === "planned" && dayPlan.meal
        ? buildMealDescription(dayPlan.meal)
        : t("week.plannedInSimpleDinners");

    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(title)}` +
      `&dates=${toGoogleUTC(start)}/${toGoogleUTC(end)}` +
      `&details=${encodeURIComponent(details)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  function addWholeWeekToCalendar() {
    const validDays = days.filter((day) => !!getDayLabel(meals[day]));
    if (!validDays.length) return;
    downloadWholeWeekICS();
  }

  const plannedMealCount = days.filter((day) => !!getDayLabel(meals[day])).length;

  function getTranslatedDay(day: string) {
    const key = String(day || "").toLowerCase();
    return t(`week.days.${key}`, day);
  }

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
        title: t("week.walkthrough.step1Title"),
        body: t("week.walkthrough.step1Body"),
        cta: t("week.walkthrough.next"),
      };
    }

    if (walkthroughStep === 2) {
      return {
        title: t("week.walkthrough.step2Title"),
        body: t("week.walkthrough.step2Body"),
        cta: t("week.walkthrough.next"),
      };
    }

    return {
      title: t("week.walkthrough.step3Title"),
      body: t("week.walkthrough.step3Body"),
      cta: t("week.walkthrough.startPlanning"),
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
          <header>
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <h1>{t("week.title")}</h1>
              <TipsModal tips={weekTips} />
            </div>
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
              {t("week.firstWeekReady")}
            </div>
          )}

          <div style={{ display: "grid", gap: 16 }}>
            {days.map((day, index) => {
              const dayPlan = meals[day];
const mode = dayPlan?.mode ?? "planned";

const rawMeal = mode === "planned" ? dayPlan?.meal ?? null : null;
const meal = getLocalizedMeal(rawMeal, language);

const isLeftovers = mode === "leftovers";
const isFreezer = mode === "freezer";
const hasMeal = !!meal?.name?.trim();
const isLocked = !!lockedDays[day];
const mealPhotoUrl = normalizePhotoUrl(meal?.photoUrl);

const nextDay = days[index + 1];
const nextDayPlan = nextDay ? meals[nextDay] : undefined;
const rawNextMeal =
  nextDayPlan?.mode === "planned" ? nextDayPlan.meal ?? null : null;
const nextMeal = getLocalizedMeal(rawNextMeal, language);

const prepAheadItems = getPrepAheadItems(meal, nextMeal);

              return (
                <Card
                  key={getTranslatedDay(day)}
                  style={{
                    padding: 0,
                    overflow: "hidden",
                    borderRadius: "24px",
                    position: "relative",
                    zIndex: showWalkthrough ? 2 : "auto",
                    outline: highlightDay === day ? "2px solid #22c55e" : undefined,
                    boxShadow:
                      highlightDay === day
                        ? "0 0 0 6px rgba(34,197,94,0.18)"
                        : undefined,
                    transition: "outline 0.4s ease, box-shadow 0.4s ease",
                  }}
                >
                  <div
                    id={`day-${getTranslatedDay(day)}`}
                    style={{ padding: "20px", display: "grid", gap: 16 }}
                  >
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
                          {getTranslatedDay(day)}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {showAddedMessage === day && (
                          <div
                            style={{
                              padding: "6px 10px",
                              borderRadius: 999,
                              background: "rgba(34,197,94,0.14)",
                              border: "1px solid rgba(34,197,94,0.35)",
                              color: "#86efac",
                              fontSize: 12,
                              fontWeight: 800,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {t("week.added")} ✅
                          </div>
                        )}

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
                            ...getSpotlightStyle(index === 0 && isActiveTarget("lock")),
                          }}
                        >
                          {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                          {isLocked ? t("week.locked").toUpperCase() : t("week.lock").toUpperCase()}
                        </button>
                      </div>
                    </div>

                    {isLeftovers ? (
                      <div style={{ display: "grid", gap: 16 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 16,
                            alignItems: "center",
                          }}
                        >
                          <img
                            src="/images/leftovers.jpg"
                            alt={t("week.leftovers")}
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

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: 19,
                                marginBottom: 4,
                                lineHeight: 1.2,
                              }}
                            >
                              {t("week.leftoversNight")}
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
                              {t("week.noCookingTonight")} 👍
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <button
                            title={t("week.longPressICS")}
                            onClick={() => {
                              if (dayPlan) openGoogleCalendar(day, dayPlan);
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              if (dayPlan) downloadDayICS(day, dayPlan);
                            }}
                            onTouchStart={(e) => {
                              const timer = setTimeout(() => {
                                if (dayPlan) downloadDayICS(day, dayPlan);
                              }, 600);

                              const clear = () => clearTimeout(timer);

                              e.currentTarget.addEventListener("touchend", clear, {
                                once: true,
                              });
                              e.currentTarget.addEventListener("touchmove", clear, {
                                once: true,
                              });
                            }}
                            style={{
                              ...btnBase,
                              flex: 1,
                              minWidth: 0,
                              background: "rgba(59,130,246,0.12)",
                              color: "#60a5fa",
                            }}
                          >
                            <CalendarPlus size={16} />
                            {t("week.addToCalendar")}
                          </button>
                        </div>
                      </div>
                    ) : isFreezer ? (
                      <div style={{ display: "grid", gap: 16 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 16,
                            alignItems: "center",
                          }}
                        >
                          <img
                            src="/images/freezer-night.jpg"
                            alt={t("week.freezerNight")}
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

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: 19,
                                marginBottom: 4,
                                lineHeight: 1.2,
                              }}
                            >
                              {t("week.freezerNight")}
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
                              {t("week.noCookingTonight")} 👍
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <button
                            title={t("week.longPressICS")}
                            onClick={() => {
                              if (dayPlan) openGoogleCalendar(day, dayPlan);
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              if (dayPlan) downloadDayICS(day, dayPlan);
                            }}
                            onTouchStart={(e) => {
                              const timer = setTimeout(() => {
                                if (dayPlan) downloadDayICS(day, dayPlan);
                              }, 600);

                              const clear = () => clearTimeout(timer);

                              e.currentTarget.addEventListener("touchend", clear, {
                                once: true,
                              });
                              e.currentTarget.addEventListener("touchmove", clear, {
                                once: true,
                              });
                            }}
                            style={{
                              ...btnBase,
                              flex: 1,
                              minWidth: 0,
                              background: "rgba(59,130,246,0.12)",
                              color: "#60a5fa",
                            }}
                          >
                            <CalendarPlus size={16} />
                            {t("week.addToCalendar")}
                          </button>
                        </div>
                      </div>
                    ) : hasMeal && meal ? (
                      <>
                        <div
                          onClick={() => {
                            navigate(
  `/recipe/${encodeURIComponent(
    rawMeal?.slug || rawMeal?.name || meal?.slug || meal?.name || ""
  )}?from=/week`
);
                          }}
                          style={{
                            display: "flex",
                            gap: 16,
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                        >
                          {mealPhotoUrl ? (
                            <img
                              src={mealPhotoUrl}
                              alt={meal.name || t("week.meal")}
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
                              {t("week.tapForDetails")}
                            </div>
                          </div>

                                                    <ChevronRight
                            size={20}
                            style={{ opacity: 0.2, flexShrink: 0 }}
                          />
                        </div>

                        {Array.isArray(meal.suggestedSides) &&
                          meal.suggestedSides.length > 0 && (
                            <div
                              style={{
                                display: "grid",
                                gap: 7,
                                padding: "10px 12px",
                                borderRadius: 16,
                                background: "rgba(34,197,94,0.08)",
                                border: "1px solid rgba(34,197,94,0.16)",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 900,
                                  letterSpacing: 0.35,
                                  textTransform: "uppercase",
                                  color: "#86efac",
                                }}
                              >
                                {t("recipe.goesWellWith", "Goes well with")}
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 6,
                                }}
                              >
                                {meal.suggestedSides.slice(0, 3).map((side) => (
                                  <span
                                    key={side}
                                    style={{
                                      padding: "5px 7px",
                                      borderRadius: 999,
                                      background: "rgba(255,255,255,0.06)",
                                      border: "1px solid rgba(255,255,255,0.10)",
                                      color: "rgba(255,255,255,0.86)",
                                      fontSize: 12,
                                      fontWeight: 800,
                                    }}
                                  >
                                    {side}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {prepAheadItems.length >= 2 && nextDay && (
  <div
    style={{
      padding: "12px 14px",
      borderRadius: 16,
      background: "rgba(20,184,166,0.12)",
      border: "1px solid rgba(20,184,166,0.24)",
      color: "#ccfbf1",
      display: "grid",
      gap: 4,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        fontSize: 13,
        fontWeight: 900,
      }}
    >
      <Sparkles size={14} />
      {t("week.prepAheadTip")}
    </div>

    <div
      style={{
        fontSize: 13,
        lineHeight: 1.45,
        opacity: 0.86,
      }}
    >
      {t("week.prepAheadPrefix")}{" "}
      <strong>
        {prepAheadItems
          .slice(0, 3)
          .map(formatPrepIngredient)
          .join(", ")}
      </strong>{" "}
      {t("week.prepAheadAgainOn")} {getTranslatedDay(nextDay)}.{" "}
      {t("week.prepAheadSuffix")}
    </div>
  </div>
)}

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <button
                            title={t("week.longPressICS")}
                            onClick={() => {
                              if (dayPlan) openGoogleCalendar(day, dayPlan);
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              if (dayPlan) downloadDayICS(day, dayPlan);
                            }}
                            onTouchStart={(e) => {
                              const timer = setTimeout(() => {
                                if (dayPlan) downloadDayICS(day, dayPlan);
                              }, 600);

                              const clear = () => clearTimeout(timer);

                              e.currentTarget.addEventListener("touchend", clear, {
                                once: true,
                              });
                              e.currentTarget.addEventListener("touchmove", clear, {
                                once: true,
                              });
                            }}
                            style={{
                              ...btnBase,
                              flex: 1,
                              minWidth: 0,
                              background: "rgba(59,130,246,0.12)",
                              color: "#60a5fa",
                            }}
                          >
                            <CalendarPlus size={16} />
                            {t("week.addToCalendar")}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: "grid", gap: 10 }}>
                        <div
                          onClick={() => navigate("/cookbook", { state: { pickForDay: day } })}
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
                          <div>{t("week.pickMealFromCookbook")}</div>
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
                          {t("week.setAsLeftovers")}
                        </button>

                        <button
                          onClick={() => setFreezer(day)}
                          style={{
                            padding: "12px",
                            borderRadius: "14px",
                            background: "rgba(59,130,246,0.12)",
                            color: "#60a5fa",
                            border: "none",
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          🧊 {t("week.freezerNight")}
                        </button>
                      </div>
                    )}

                    {!isLocked && (
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
                            {t("week.leftovers")}
                          </button>
                        )}

                        {!isFreezer && (
                          <button
                            onClick={() => setFreezer(day)}
                            style={{
                              flex: 1,
                              padding: "12px",
                              borderRadius: "14px",
                              background: "rgba(59,130,246,0.12)",
                              color: "#60a5fa",
                              border: "none",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            🧊 {t("week.freezer")}
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
                          {t("week.remove")}
                        </button>

                        {mode === "planned" && hasMeal && (
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
                            {t("week.saveRecipe")}
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
              {plannedMealCount ? t("week.shareWeekPlan") : t("week.noMealsToShare")}
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
              {t("week.generateNewPlan")}
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
                ? `${t("week.add")} ${plannedMealCount} ${
                    plannedMealCount === 1
                      ? t("week.calendarDay")
                      : t("week.calendarDays")
                  } ${t("week.toCalendar")}`
                : t("week.noMealsPlanned")}
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
                borderRadius: 20,
                background:
                  "linear-gradient(180deg, rgba(15,23,42,0.96) 0%, rgba(2,6,23,0.98) 100%)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.42)",
                padding: 22,
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
                  {t("week.walkthrough.quickTour")}
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

              <div
                style={{
                  marginTop: 12,
                  padding: "8px 10px",
                  borderRadius: 12,
                  background: "rgba(20,184,166,0.14)",
                  border: "1px solid rgba(20,184,166,0.28)",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#ccfbf1",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Sparkles size={12} />
                {walkthroughStep === 1 && t("week.walkthrough.tapButton")}
                {walkthroughStep === 2 && t("week.walkthrough.tryLocking")}
                {walkthroughStep === 3 && t("week.walkthrough.addMealsCalendar")}
              </div>

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
                  {t("week.walkthrough.skip")}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}