import { useNavigate } from "react-router-dom";
import { 
  Lock, Unlock, Plus, ChevronRight, 
  CalendarDays, Sparkles, ChefHat, Trash2 
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
  addDayToCookbook
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
      [day]: { name: "", ingredients: "", instructions: "", photoUrl: "" } 
    }));
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ maxWidth: "550px", width: "100%", padding: "0 20px 140px 20px", display: "grid", gap: 24 }}>
        
        <header style={{ textAlign: "center", marginTop: 20 }}>
          <h2 style={{ fontSize: 28, fontWeight: 1000, margin: 0 }}>Weekly Planner</h2>
          <p style={{ opacity: 0.5, fontSize: 15, marginTop: 4 }}>Tap a day to view the recipe.</p>
        </header>

        {/* Floating Action Button for Generating */}
        <div style={{ position: "sticky", top: 20, zIndex: 10 }}>
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
                  
                  {/* Day Label & Lock */}
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

                  {/* Meal Info */}
                  {hasMeal ? (
                    <div 
                      onClick={() =>
  navigate(`/recipe/${encodeURIComponent(meal.slug || meal.name)}?from=/week`)
}
                      style={{ display: "flex", gap: 16, alignItems: "center", cursor: "pointer" }}
                    >
                      <img 
                        src={meal.photoUrl} 
                        style={{ width: 85, height: 85, borderRadius: 18, objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 19, marginBottom: 4, lineHeight: 1.2 }}>{meal.name}</div>
                        <div style={{ fontSize: 13, opacity: 0.5, display: "flex", alignItems: "center", gap: 4 }}>
                          <ChefHat size={14} /> Tap for Details
                        </div>
                      </div>
                      <ChevronRight size={20} style={{ opacity: 0.2 }} />
                    </div>
                  ) : (
                    <div 
                      onClick={() => navigate("/cookbook")}
                      style={{ 
                        padding: "24px", borderRadius: "18px", border: "2px dashed rgba(255,255,255,0.1)", 
                        textAlign: "center", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontWeight: 700
                      }}
                    >
                      <Plus size={24} style={{ marginBottom: 6 }} />
                      <div>Pick a meal from Cookbook</div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  {hasMeal && !isLocked && (
                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                      <button 
                        onClick={() => clearDay(day)}
                        style={{ flex: 1, padding: "12px", borderRadius: "14px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", fontWeight: 800, cursor: "pointer" }}
                      >
                        <Trash2 size={16} style={{ marginBottom: -3, marginRight: 4 }} /> Remove
                      </button>
                      <button 
                        onClick={() => addDayToCookbook(day)}
                        style={{ flex: 1, padding: "12px", borderRadius: "14px", background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "none", fontWeight: 800, cursor: "pointer" }}
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