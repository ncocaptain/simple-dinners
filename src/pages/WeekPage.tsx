import { useNavigate } from "react-router-dom";
import { 
  Lock, Unlock, Plus, ChevronRight, 
  CalendarDays, Sparkles, ChefHat 
} from "lucide-react";
import Card from "../components/Card";
import { days } from "../core/data";
import type { Meal, Effort } from "../core/types";

export default function WeekPage({
  meals,
  setMeals,
  generateDinnerPlan,
  lockedDays,
  setLockedDays,
  // These were missing from the props list, causing the App.tsx error:
  addDayToCookbook,
}: {
  meals: Record<string, Meal>;
  setMeals: any;
  generateDinnerPlan: (force?: boolean) => void;
  lockedDays: Record<string, boolean>;
  setLockedDays: any;
  addDayToCookbook: (day: string) => void;
  setDaySettings: any;
  daySettings: Record<string, Effort>;
}) {
  const navigate = useNavigate();

  const toggleLock = (day: string) => {
    setLockedDays((prev: any) => ({ ...prev, [day]: !prev[day] }));
  };

  const clearDay = (day: string) => {
    setMeals((prev: any) => ({ 
      ...prev, 
      [day]: { name: "", ingredients: "", instructions: "", photoUrl: "" } 
    }));
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ maxWidth: "550px", width: "100%", padding: "0 20px 120px 20px", display: "grid", gap: 24 }}>
        
        <header style={{ textAlign: "center", marginBottom: 10 }}>
          <h2 style={{ fontSize: 24, fontWeight: 1000, margin: "0 0 8px 0" }}>Weekly Lineup</h2>
          <p style={{ opacity: 0.6, fontSize: 14 }}>Lock your favorites and randomize the rest.</p>
        </header>

        <div style={{ position: "sticky", top: 20, zIndex: 10, marginBottom: 10 }}>
          <button 
            onClick={() => generateDinnerPlan(true)}
            style={{ 
              width: "100%", padding: "18px", borderRadius: "24px", 
              background: "#22c55e", color: "#fff", border: "none", 
              fontWeight: 900, fontSize: 18, display: "flex", 
              alignItems: "center", justifyContent: "center", gap: 12,
              boxShadow: "0 10px 25px -5px rgba(34,197,94,0.4)", cursor: "pointer"
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
              <Card key={day} style={{ padding: 0, overflow: "hidden", borderRadius: "24px" }}>
                <div style={{ padding: "20px", display: "grid", gap: 16 }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <CalendarDays size={18} style={{ opacity: 0.4 }} />
                      <span style={{ fontWeight: 900, fontSize: 18, textTransform: "uppercase" }}>{day}</span>
                    </div>
                    <button 
                      onClick={() => toggleLock(day)}
                      style={{ 
                        background: isLocked ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)", 
                        border: "none", padding: "8px 12px", borderRadius: "12px", 
                        color: isLocked ? "#22c55e" : "rgba(255,255,255,0.4)",
                        display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: 800
                      }}
                    >
                      {isLocked ? <Lock size={14} /> : <Unlock size={14} />} 
                      {isLocked ? "LOCKED" : "LOCK"}
                    </button>
                  </div>

                  {hasMeal ? (
                    <div 
                      onClick={() => navigate(`/recipe/${encodeURIComponent(meal.slug || meal.name)}`)}
                      style={{ display: "flex", gap: 16, alignItems: "center", cursor: "pointer" }}
                    >
                      <img 
                        src={meal.photoUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80&sig=${day}`} 
                        style={{ width: 80, height: 80, borderRadius: 16, objectFit: "cover" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{meal.name}</div>
                        <div style={{ fontSize: 13, opacity: 0.5, display: "flex", alignItems: "center", gap: 4 }}>
                          <ChefHat size={14} /> View Recipe
                        </div>
                      </div>
                      <ChevronRight size={20} style={{ opacity: 0.2 }} />
                    </div>
                  ) : (
                    <div 
                      onClick={() => navigate("/cookbook")}
                      style={{ 
                        padding: "20px", borderRadius: "16px", border: "2px dashed rgba(255,255,255,0.1)", 
                        textAlign: "center", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontWeight: 700
                      }}
                    >
                      <Plus size={20} style={{ marginBottom: 4 }} />
                      <div>Tap to pick a meal</div>
                    </div>
                  )}

                  {hasMeal && !isLocked && (
                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                      <button 
                        onClick={() => clearDay(day)}
                        style={{ flex: 1, padding: "10px", borderRadius: "12px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", fontWeight: 800 }}
                      >
                        Remove
                      </button>
                      <button 
                        onClick={() => addDayToCookbook(day)}
                        style={{ flex: 1, padding: "10px", borderRadius: "12px", background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "none", fontWeight: 800 }}
                      >
                        Save to Cookbook
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
        <div style={{ height: 60 }} />
      </div>
    </div>
  );
}