import { useNavigate } from "react-router-dom";
import { Share2 } from "lucide-react"; // Added this import
import Card from "../components/Card";
import Button from "../components/Button";
import type { Meal } from "../core/types";
import { days } from "../core/data";
import { useToast } from "../components/Toast"; // Added for the clipboard toast

type Day = (typeof days)[number];

// =====================================================
// Display helpers
// =====================================================

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
  return {
    preview: ingredients.slice(0, 3).join(" • "),
    remaining: Math.max(ingredients.length - 3, 0),
  };
}

// =====================================================
// Page
// =====================================================

export default function HomePage({ meals }: { meals: Record<Day, Meal> }) {
  const navigate = useNavigate();
  const toastApi: any = useToast();
  const toast = toastApi.toast ?? toastApi;

  const today = getTodayDayName();
  const todayMeal = meals[today];
  const todayHasMeal = !!todayMeal?.name?.trim();
  const plannedCount = days.filter((d) => meals[d]?.name?.trim()).length;
  const hasAnyPlan = plannedCount > 0;

  const sharePlan = async () => {
    const weekText = days
      .map(day => {
        const meal = meals[day];
        return `${day}: ${meal?.name || "No meal planned"}`;
      })
      .join("\n");

    const fullMessage = `📅 Simple Dinners Menu:\n\n${weekText}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "Simple Dinners Menu", text: fullMessage });
      } else {
        await navigator.clipboard.writeText(fullMessage);
        toast("Menu copied to clipboard!");
      }
    } catch (err) {
      console.log("Error sharing", err);
    }
  };

  // -----------------------------------------------------
  // UI RENDER
  // -----------------------------------------------------
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ maxWidth: "550px", width: "100%", padding: "0 20px 40px 20px", display: "grid", gap: 20 }}>
        
        {/* Share Button Section */}
        {hasAnyPlan && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <button 
              onClick={sharePlan}
              style={{ 
                display: "flex", alignItems: "center", gap: 10, padding: "12px 24px", 
                borderRadius: "20px", background: "rgba(34,197,94,0.1)", 
                border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e",
                fontWeight: 800, cursor: "pointer"
              }}
            >
              <Share2 size={18} /> Share Week's Menu
            </button>
          </div>
        )}

        {todayHasMeal ? (
          <>
            <Card
              title="Tonight’s Dinner"
              subtitle={`Dinner for ${today} · ${plannedCount}/${days.length} meals planned`}
            >
              <div style={{ display: "grid", gap: 16 }}>
                <img
                  src={todayMeal.photoUrl || fallbackPhotoUrl(todayMeal.name)}
                  style={{ width: "100%", height: 260, objectFit: "cover", borderRadius: 20 }}
                />

                <div>
                  <div style={{ fontSize: 28, fontWeight: 1000, marginBottom: 8 }}>{todayMeal.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, opacity: 0.8, marginBottom: 8 }}>
                    {effortLabel(todayMeal.effort)}
                  </div>
                  <div style={{ opacity: 0.8, fontSize: 15 }}>
                    {getIngredientPreview(todayMeal.ingredients).preview || "Ready to cook!"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Button onClick={() => navigate(`/recipe/${encodeURIComponent(todayMeal.slug || todayMeal.name)}`)}>
                    View Recipe
                  </Button>
                  <Button variant="secondary" onClick={() => navigate("/week")}>Swap Dinner</Button>
                </div>
              </div>
            </Card>

            {/* Tomorrow Preview */}
            {meals[days[(days.indexOf(today) + 1) % days.length]]?.name?.trim() && (
              <Card title="Tomorrow" subtitle={days[(days.indexOf(today) + 1) % days.length]}>
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