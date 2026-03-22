import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  ListChecks,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatIngredients } from "../core/utils";
import { days } from "../core/data";

export default function CookNowPage({ meals }: { meals: any }) {
  const navigate = useNavigate();
  const [prepped, setPrepped] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);

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

  const ingredients = useMemo(
    () =>
      (meal.ingredients || "")
        .split("\n")
        .map((i: string) => i.trim())
        .filter(Boolean),
    [meal.ingredients]
  );

  const steps = useMemo(() => {
    return (meal.instructions || "")
      .split("\n")
      .map((s: string) => s.trim())
      .filter(Boolean);
  }, [meal.instructions]);

  const totalSteps = steps.length;
  const activeStep = steps[currentStep] || "";

  const togglePrep = (ing: string) => {
    setPrepped((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const goPrevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const goNextStep = () => {
    setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  const stepIngredients = useMemo(() => {
    if (!activeStep) return [];

    const stepText = activeStep.toLowerCase();

    return ingredients.filter((ing: string) => {
      const formatted = formatIngredients(ing);
      const loweredIngredient = formatted.toLowerCase();

      const cleaned = loweredIngredient
        .replace(/^\d+([\/.]\d+)?\s*/, "")
        .replace(
          /\b(cup|cups|tbsp|tsp|teaspoon|teaspoons|tablespoon|tablespoons|oz|ounce|ounces|lb|lbs|pound|pounds|clove|cloves|can|cans|package|packages)\b/g,
          ""
        )
        .replace(/[(),]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!cleaned) return false;

      const words = cleaned
        .split(" ")
        .map((w) => w.trim())
        .filter((w) => w.length > 2);

      if (stepText.includes(cleaned)) return true;

      return words.some((word) => stepText.includes(word));
    });
  }, [activeStep, ingredients]);

  return (
    <div
      style={{
        maxWidth: "650px",
        margin: "0 auto",
        padding: "20px 20px 120px 20px",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none",
          border: "none",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 20,
          opacity: 0.7,
          cursor: "pointer",
        }}
      >
        <ArrowLeft size={20} /> Back
      </button>

      <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
        {meal.name}
      </h2>

      <div
        style={{
          color: "#22c55e",
          fontWeight: 800,
          fontSize: 12,
          textTransform: "uppercase",
          marginBottom: 24,
          letterSpacing: 1,
        }}
      >
        Cook Mode Active
      </div>

      {/* STEP CARD */}
      <section
        style={{
          marginBottom: 24,
          padding: 20,
          borderRadius: 20,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              opacity: 0.6,
              fontSize: 12,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Step {totalSteps > 0 ? currentStep + 1 : 0} of {totalSteps}
          </div>

          {totalSteps > 1 && (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={goPrevStep}
                disabled={currentStep === 0}
                style={navBtn(currentStep === 0)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goNextStep}
                disabled={currentStep === totalSteps - 1}
                style={navBtn(currentStep === totalSteps - 1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            fontSize: 22,
            lineHeight: 1.5,
            fontWeight: 700,
            marginBottom: stepIngredients.length ? 18 : 0,
          }}
        >
          {activeStep || "No instructions available."}
        </div>

        {stepIngredients.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {stepIngredients.map((ing: string, i: number) => (
              <div
                key={`${ing}-${i}`}
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  background: "rgba(34,197,94,0.14)",
                  border: "1px solid rgba(34,197,94,0.28)",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#bbf7d0",
                }}
              >
                {formatIngredients(ing)}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* INGREDIENT TOGGLE */}
      <section style={{ marginBottom: 32 }}>
        <button
          onClick={() => setShowIngredients((prev) => !prev)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "14px 16px",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          <ListChecks size={18} />
          {showIngredients ? "Hide Full Ingredients" : "View Full Ingredients"}
        </button>

        {showIngredients && (
          <div style={{ marginTop: 16 }}>
            <h4
              style={{
                opacity: 0.4,
                fontSize: 12,
                fontWeight: 900,
                textTransform: "uppercase",
                marginBottom: 16,
                letterSpacing: 1,
              }}
            >
              Prep Station
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ingredients.map((ing: string, i: number) => {
                const isDone = prepped.includes(ing);

                return (
                  <div
                    key={i}
                    onClick={() => togglePrep(ing)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "16px",
                      borderRadius: "16px",
                      background: isDone
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(255,255,255,0.05)",
                      opacity: isDone ? 0.35 : 1,
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                  >
                    {isDone ? (
                      <CheckCircle2 size={22} color="#22c55e" />
                    ) : (
                      <Circle size={22} style={{ opacity: 0.25 }} />
                    )}

                    <span
                      style={{
                        textDecoration: isDone ? "line-through" : "none",
                        fontWeight: 600,
                      }}
                    >
                      {formatIngredients(ing)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function navBtn(disabled: boolean): React.CSSProperties {
  return {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: disabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)",
    color: "white",
    opacity: disabled ? 0.35 : 1,
    cursor: disabled ? "default" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}