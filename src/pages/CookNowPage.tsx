import { useState } from "react";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatIngredients } from "../core/utils";
import { days } from "../core/data"; // Import days to find today

export default function CookNowPage({ meals }: { meals: any }) {
  const navigate = useNavigate();
  const [prepped, setPrepped] = useState<string[]>([]);

  // Identify today's meal
  const todayIndex = new Date().getDay(); // 0 (Sun) to 6 (Sat)
  const todayName = days[todayIndex];
  const meal = meals[todayName];

  if (!meal || !meal.name) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <h2>No mission for {todayName}.</h2>
        <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  const ingredients = (meal.ingredients || "").split("\n").filter((i: string) => i.trim());

  const togglePrep = (ing: string) => {
    setPrepped(prev => 
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  };

  return (
    <div style={{ maxWidth: "550px", margin: "0 auto", padding: "20px 20px 120px 20px" }}>
      <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "white", display: "flex", alignItems: "center", gap: 8, marginBottom: 20, opacity: 0.6 }}>
        <ArrowLeft size={20} /> Back
      </button>

      <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>{meal.name}</h2>
      <div style={{ color: "#22c55e", fontWeight: 800, fontSize: 12, textTransform: "uppercase", marginBottom: 24 }}>Cook Mode Active</div>

      {/* LIVING LIST */}
      <section style={{ marginBottom: 40 }}>
        <h4 style={{ opacity: 0.4, fontSize: 12, fontWeight: 900, textTransform: "uppercase", marginBottom: 16 }}>Prep Station</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ingredients.map((ing: string, i: number) => {
            const isDone = prepped.includes(ing);
            return (
              <div 
                key={i} 
                onClick={() => togglePrep(ing)}
                style={{ 
                  display: "flex", alignItems: "center", gap: 12, padding: "16px", borderRadius: "16px", 
                  background: isDone ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                  order: isDone ? 100 : 0, // Moves to bottom
                  opacity: isDone ? 0.3 : 1,
                  transition: "all 0.3s ease"
                }}
              >
                {isDone ? <CheckCircle2 size={22} color="#22c55e" /> : <Circle size={22} style={{ opacity: 0.2 }} />}
                <span style={{ textDecoration: isDone ? "line-through" : "none", fontWeight: 600 }}>
                  {formatIngredients(ing)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* INSTRUCTIONS */}
      <section>
        <h4 style={{ opacity: 0.4, fontSize: 12, fontWeight: 900, textTransform: "uppercase", marginBottom: 16 }}>Instructions</h4>
        <div style={{ fontSize: 18, lineHeight: "1.6", whiteSpace: "pre-line", opacity: 0.9 }}>
          {meal.instructions}
        </div>
      </section>
    </div>
  );
}