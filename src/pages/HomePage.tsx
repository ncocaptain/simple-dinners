import SafeRecipeImage from "../components/SafeRecipeImage";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import type { PlannedDay } from "../core/types";
import { days } from "../core/data";
import { candidateLibrary } from "../core/planner";
import { useToast } from "../components/Toast";
import { t, getStoredLanguage } from "../i18n";
import { getLocalizedMeal } from "../core/localizedMeal";

type Day = (typeof days)[number];

function getTodayDayName(): Day {
  const jsDay = new Date().getDay();
  const map: Record<number, Day> = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };
  return map[jsDay];
}

function fallbackPhotoUrl(name?: string) {
  const q = encodeURIComponent((name || "dinner").trim());
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80&sig=1&meal=${q}`;
}

function effortLabel(effort?: string) {
  switch (effort) {
    case "quick":
      return `⚡ ${t("home.quick")}`;
    case "normal":
      return `🧑‍🍳 ${t("home.normal")}`;
    case "big":
      return `🍳 ${t("home.big")}`;
    case "takeout":
      return `🥡 ${t("home.takeout")}`;
    default:
      return `🧑‍🍳 ${t("home.normal")}`;
  }
}

function getHomeDayLabel(day: string) {
  const labels: Record<string, string> = {
    Monday: t("home.days.monday"),
    Tuesday: t("home.days.tuesday"),
    Wednesday: t("home.days.wednesday"),
    Thursday: t("home.days.thursday"),
    Friday: t("home.days.friday"),
    Saturday: t("home.days.saturday"),
    Sunday: t("home.days.sunday"),
  };

  return labels[day] || day;
}

function getIngredientPreview(ingredientsText?: string) {
  const ingredients = (ingredientsText || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return ingredients.slice(0, 2).join(" • ");
}

export default function HomePage({
  meals,
  setMeals,
}: {
  meals: Record<string, PlannedDay>;
  setMeals: React.Dispatch<React.SetStateAction<Record<string, PlannedDay>>>;
}) {
  const navigate = useNavigate();
  const toastApi: any = useToast();
  const toast = toastApi.toast ?? toastApi;

  const today = getTodayDayName();
  const language = getStoredLanguage();

const todayPlan = meals[today];
const rawTodayMeal = todayPlan?.mode === "planned" ? todayPlan.meal : null;
const todayMeal = getLocalizedMeal(rawTodayMeal, language);
const todayHasMeal = !!todayMeal?.name?.trim();

  const plannedCount = days.filter((d) => {
    const dayPlan = meals[d];
    return dayPlan?.mode === "planned" && !!dayPlan?.meal?.name?.trim();
  }).length;

  const handleSwapToday = () => {
    if (!rawTodayMeal) return;

const neededEffort = rawTodayMeal.effort || "normal";

    const pool = candidateLibrary.filter(
  (m) =>
    m.name !== rawTodayMeal.name &&
    (neededEffort === "normal"
      ? m.effort === "normal" || m.effort === "quick"
      : m.effort === neededEffort)
);

    if (pool.length > 0) {
      const newMeal = pool[Math.floor(Math.random() * pool.length)];

      setMeals((prev) => ({
        ...prev,
        [today]: {
          mode: "planned",
          meal: newMeal,
        },
      }));

      toast(`${t("home.swappedTo")} ${newMeal.name}!`);
    }
  };

  const previewText =
    todayMeal?.notes?.trim() ||
    getIngredientPreview(todayMeal?.ingredients) ||
    t("home.readyToCook");

  const tomorrow = days[(days.indexOf(today) + 1) % days.length];
  const tomorrowPlan = meals[tomorrow];
const rawTomorrowMeal =
  tomorrowPlan?.mode === "planned" ? tomorrowPlan.meal : null;
const tomorrowMeal = getLocalizedMeal(rawTomorrowMeal, language);

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
          padding: "0 20px 40px 20px",
          display: "grid",
          gap: 20,
        }}
      >
        {todayHasMeal && todayMeal ? (
          <>
            <Card
              title={t("home.todaysDinner")}
              subtitle={`${t("home.dinnerFor")} ${getHomeDayLabel(today)} · ${plannedCount}/${days.length} ${t("home.mealsPlanned")}`}
            >
              <div style={{ display: "grid", gap: 16, position: "relative" }}>
                <div style={{ position: "relative" }}>
                  <SafeRecipeImage
                    src={todayMeal.photoUrl}
                    fallbackSrc={fallbackPhotoUrl(todayMeal.name)}
                    alt={todayMeal.name || t("home.todaysDinner")}
                    iconSize={32}
                    style={{
                      width: "100%",
                      height: 260,
                      objectFit: "cover",
                      borderRadius: 20,
                      background: "rgba(255,255,255,0.04)",
                    }}
                  />

                  <button
                    onClick={handleSwapToday}
                    style={{
                      position: "absolute",
                      bottom: 12,
                      right: 12,
                      width: 44,
                      height: 44,
                      borderRadius: "22px",
                      background: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(4px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 1000,
                      marginBottom: 8,
                    }}
                  >
                    {todayMeal.name}
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      opacity: 0.8,
                      marginBottom: 8,
                    }}
                  >
                    {effortLabel(todayMeal.effort)}
                  </div>

                  <div
                    style={{
                      opacity: 0.75,
                      fontSize: 15,
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: 45,
                    }}
                  >
                    {previewText}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Button
                    onClick={() =>
                      navigate(
                        `/recipe/${encodeURIComponent(
                          todayMeal.slug || todayMeal.name
                        )}`
                      )
                    }
                  >
                    {t("home.viewRecipe")}
                  </Button>

                  <Button variant="secondary" onClick={handleSwapToday}>
                    {t("home.swapDinner")}
                  </Button>
                </div>
              </div>
            </Card>

            {tomorrowMeal?.name?.trim() && (
              <Card title={t("home.tomorrow")} subtitle={getHomeDayLabel(tomorrow)}>
                <div style={{ fontSize: 20, fontWeight: 900 }}>
                  {tomorrowMeal.name}
                </div>
              </Card>
            )}
          </>
        ) : (
          <Card title={t("home.noPlanFound")} subtitle={t("home.noPlanSubtitle")}>
            <Button onClick={() => navigate("/plan")}>{t("home.planMyWeek")}</Button>
          </Card>
        )}
      </div>
    </div>
  );
}