import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import type { Meal } from "../core/types";
import { days } from "../core/data";

type Day = (typeof days)[number];

// =====================================================
// Date helpers
// =====================================================

function getTodayDayName(): Day {
  const jsDay = new Date().getDay(); // 0=Sun, 1=Mon, ...
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

// =====================================================
// Display helpers
// =====================================================

function fallbackPhotoUrl(name?: string) {
  const q = encodeURIComponent((name || "dinner").trim());
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80&sig=1&meal=${q}`;
}

function effortLabel(effort?: string) {
  switch (effort) {
    case "quick":
      return "⚡ Quick";
    case "normal":
      return "🧑‍🍳 Normal";
    case "big":
      return "🍳 Big";
    case "takeout":
      return "🥡 Takeout";
    default:
      return "🧑‍🍳 Normal";
  }
}

function getIngredientPreview(ingredientsText?: string) {
  const ingredients = (ingredientsText || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    preview: ingredients.slice(0, 3).join(" • "),
    remaining: Math.max(ingredients.length - 3, 0),
  };
}

// =====================================================
// Page
// =====================================================

export default function HomePage({
  meals,
}: {
  meals: Record<Day, Meal>;
}) {
  const navigate = useNavigate();

  const today = getTodayDayName();
  const todayMeal = meals[today];
  const todayHasMeal = !!todayMeal?.name?.trim();

  const todayIndex = days.indexOf(today);
  const tomorrow = days[(todayIndex + 1) % days.length];
  const tomorrowMeal = meals[tomorrow];
  const tomorrowHasMeal = !!tomorrowMeal?.name?.trim();

  const plannedCount = days.filter((d) => meals[d]?.name?.trim()).length;
  const hasAnyPlan = plannedCount > 0;

  const { preview, remaining } = getIngredientPreview(todayMeal?.ingredients);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {todayHasMeal ? (
        <>
          <Card
            title="Tonight’s Dinner"
            subtitle={`Dinner for ${today} · ${plannedCount}/${days.length} meals planned`}
          >
            <div style={{ display: "grid", gap: 16 }}>
              <img
                src={todayMeal.photoUrl || fallbackPhotoUrl(todayMeal.name)}
                alt={todayMeal.name}
                style={{
                  width: "100%",
                  height: 240,
                  objectFit: "cover",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />

              <div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 1000,
                    lineHeight: 1.1,
                    marginBottom: 8,
                  }}
                >
                  {todayMeal.name}
                </div>

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    opacity: 0.85,
                    marginBottom: 8,
                  }}
                >
                  {effortLabel(todayMeal.effort)}
                </div>

                <div style={{ opacity: 0.8, lineHeight: 1.5 }}>
                  <div>{preview || "Your dinner is ready to go."}</div>

                  {remaining > 0 ? (
                    <div style={{ marginTop: 4, fontSize: 13, opacity: 0.75 }}>
                      + {remaining} more ingredient{remaining === 1 ? "" : "s"}
                    </div>
                  ) : null}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button
                  onClick={() =>
                    navigate(`/recipe/${encodeURIComponent(todayMeal.slug || todayMeal.name)}`)
                  }
                >
                  View Recipe
                </Button>

                <Button variant="secondary" onClick={() => navigate("/week")}>
                  Swap Dinner
                </Button>

                <Button variant="secondary" onClick={() => navigate("/week")}>
                  Week Plan
                </Button>

                <Button variant="secondary" onClick={() => navigate("/shopping-list")}>
                  Shopping List
                </Button>

                <Button variant="secondary" onClick={() => navigate("/cookbook")}>
                  Cookbook
                </Button>
              </div>
            </div>
          </Card>

          {tomorrowHasMeal ? (
            <Card title="Coming Tomorrow" subtitle={tomorrow}>
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ fontSize: 20, fontWeight: 900 }}>{tomorrowMeal.name}</div>
                <div style={{ opacity: 0.8 }}>
                  Ready when you are. Your week plan is already doing the heavy lifting.
                </div>
              </div>
            </Card>
          ) : null}
        </>
      ) : hasAnyPlan ? (
        <Card
          title="No dinner planned for tonight"
          subtitle={`${today} · ${plannedCount}/${days.length} meals planned`}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ opacity: 0.85, lineHeight: 1.5 }}>
              You already have part of your week planned, but tonight is still open.
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button onClick={() => navigate("/week")}>Open Week Plan</Button>
              <Button variant="secondary" onClick={() => navigate("/cookbook")}>
                Pick from Cookbook
              </Button>
              <Button variant="secondary" onClick={() => navigate("/cook-now")}>
                Cook Now
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="Welcome to Simple Dinners" subtitle="Let’s solve dinner for the week.">
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ opacity: 0.85, lineHeight: 1.5 }}>
              You haven’t generated your week yet. Start with your schedule and preferences,
              then let Simple Dinners build your plan.
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button onClick={() => navigate("/plan")}>Plan My Week</Button>
              <Button variant="secondary" onClick={() => navigate("/cookbook")}>
                Open Cookbook
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}