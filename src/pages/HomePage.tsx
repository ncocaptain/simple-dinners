import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import type { Meal } from "../core/types";
import { days } from "../core/data";
import { candidateLibrary } from "../core/planner";
import { useToast } from "../components/Toast";

type Day = (typeof days)[number];

function getTodayDayName(): Day {
  const jsDay = new Date().getDay();
  const map: Record<number, Day> = {
    0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday",
    4: "Thursday", 5: "Friday", 6: "Saturday",
  };
  return map[jsDay];
}

function fallbackPhotoUrl(name?: string) {
  const q = encodeURIComponent((name || "dinner").trim());
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80&sig=1&meal=${q}`;
}

function effortLabel(effort?: string) {
  switch (effort) {
    case "quick": return "⚡ Quick";
    case "normal": return "🧑‍🍳 Normal";
    case "big": return "🍳 Big";
    case "takeout": return "🥡 Takeout";
    default: return "🧑‍🍳 Normal";
  }
}

function getIngredientPreview(ingredientsText?: string) {
  const ingredients = (ingredientsText || "").split("\n").map(s => s.trim()).filter(Boolean);
  return ingredients.slice(0, 2).join(" • ");
}

export default function HomePage({
  meals,
  setMeals
}: {
  meals: Record<Day, Meal>,
  setMeals: (newMeals: Record<Day, Meal>) => void
}) {
  const navigate = useNavigate();
  const toastApi: any = useToast();
  const toast = toastApi.toast ?? toastApi;

  const today = getTodayDayName();
  const todayMeal = meals[today];
  const todayHasMeal = !!todayMeal?.name?.trim();
  const plannedCount = days.filter((d) => meals[d]?.name?.trim()).length;

  const handleSwapToday = () => {
    const neededEffort = todayMeal.effort || "normal";

    const pool = candidateLibrary.filter(m =>
      m.name !== todayMeal.name &&
      (neededEffort === "normal"
        ? (m.effort === "normal" || m.effort === "quick")
        : m.effort === neededEffort)
    );

    if (pool.length > 0) {
      const newMeal = pool[Math.floor(Math.random() * pool.length)];
      setMeals({
        ...meals,
        [today]: newMeal
      });
      toast(`Swapped to ${newMeal.name}!`);
    }
  };

  // 🔥 NEW: Notes-first preview
  const previewText =
    todayMeal?.notes?.trim() ||
    getIngredientPreview(todayMeal?.ingredients) ||
    "Ready to cook!";

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ maxWidth: "550px", width: "100%", padding: "0 20px 40px 20px", display: "grid", gap: 20 }}>

        {todayHasMeal ? (
          <>
            <Card
              title="Tonight’s Dinner"
              subtitle={`Dinner for ${today} · ${plannedCount}/${days.length} meals planned`}
            >
              <div style={{ display: "grid", gap: 16, position: "relative" }}>

                {/* Image */}
                <div style={{ position: "relative" }}>
                  <img
                    src={todayMeal.photoUrl || fallbackPhotoUrl(todayMeal.name)}
                    style={{ width: "100%", height: 260, objectFit: "cover", borderRadius: 20 }}
                  />

                  <button
                    onClick={handleSwapToday}
                    style={{
                      position: "absolute", bottom: 12, right: 12,
                      width: 44, height: 44, borderRadius: "22px",
                      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
                      border: "1px solid rgba(255,255,255,0.2)", color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer"
                    }}
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>

                {/* Content */}
               <div>
  <div style={{ fontSize: 28, fontWeight: 1000, marginBottom: 8 }}>
    {todayMeal.name}
  </div>

  <div style={{ fontSize: 14, fontWeight: 800, opacity: 0.8, marginBottom: 8 }}>
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

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Button onClick={() =>
                    navigate(`/recipe/${encodeURIComponent(todayMeal.slug || todayMeal.name)}`)
                  }>
                    View Recipe
                  </Button>

                  <Button variant="secondary" onClick={handleSwapToday}>
                    Swap Dinner
                  </Button>
                </div>

              </div>
            </Card>

            {/* Tomorrow */}
            {meals[days[(days.indexOf(today) + 1) % days.length]]?.name?.trim() && (
              <Card
                title="Tomorrow"
                subtitle={days[(days.indexOf(today) + 1) % days.length]}
              >
                <div style={{ fontSize: 20, fontWeight: 900 }}>
                  {meals[days[(days.indexOf(today) + 1) % days.length]].name}
                </div>
              </Card>
            )}
          </>
        ) : (
          <Card title="No Plan Found" subtitle="Let's solve dinner for the week.">
            <Button onClick={() => navigate("/plan")}>Plan My Week</Button>
          </Card>
        )}
      </div>
    </div>
  );
}