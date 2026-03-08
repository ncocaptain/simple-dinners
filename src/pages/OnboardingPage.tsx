import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { completeOnboarding } from "../core/onboardingStore";

const STARTER_ITEMS = [
  "chicken",
  "ground beef",
  "pasta",
  "rice",
  "eggs",
  "milk",
  "butter",
  "cheese",
  "onion",
  "garlic",
  "potatoes",
  "canned tomatoes",
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [vegetarian, setVegetarian] = useState(false);
  const [dietaryNotes, setDietaryNotes] = useState("");

  function toggleItem(item: string) {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }

  function finishSetup() {
    localStorage.setItem("pantry", JSON.stringify(selectedItems));
    localStorage.setItem("vegetarian", String(vegetarian));
    localStorage.setItem("dietaryNotes", dietaryNotes);
    completeOnboarding();
    navigate("/plan?first=true");
  }

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "60px auto",
        padding: 24,
        color: "#f8fafc",
      }}
    >
      {step === 1 && (
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 12 }}>
            Welcome to Simple Dinners
          </h1>

          <p style={{ opacity: 0.8, fontSize: 16 }}>
            Dinner planning based around you.
          </p>

          <button
            onClick={() => setStep(2)}
            style={{
              marginTop: 32,
              padding: "14px 20px",
              borderRadius: 14,
              background: "rgba(20,184,166,0.25)",
              border: "1px solid rgba(20,184,166,0.45)",
              color: "#f8fafc",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Let's Set Up Your Kitchen →
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 10 }}>
            What do you usually keep on hand?
          </h1>

          <p style={{ opacity: 0.8, marginBottom: 20 }}>
            Pick a few basics so your first plan feels more personal.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {STARTER_ITEMS.map((item) => {
              const active = selectedItems.includes(item);

              return (
                <button
                  key={item}
                  onClick={() => toggleItem(item)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 999,
                    border: active
                      ? "1px solid rgba(20,184,166,0.65)"
                      : "1px solid rgba(255,255,255,0.12)",
                    background: active
                      ? "rgba(20,184,166,0.20)"
                      : "rgba(255,255,255,0.06)",
                    color: "#f8fafc",
                    fontWeight: 800,
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
            <button
              onClick={() => setStep(1)}
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#f8fafc",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Back
            </button>

            <button
              onClick={() => setStep(3)}
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                background: "rgba(20,184,166,0.25)",
                border: "1px solid rgba(20,184,166,0.45)",
                color: "#f8fafc",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 10 }}>
            Any preferences?
          </h1>

          <p style={{ opacity: 0.8, marginBottom: 20 }}>
            A couple quick details and we’ll build your first plan.
          </p>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 18,
              fontWeight: 700,
            }}
          >
            <input
              type="checkbox"
              checked={vegetarian}
              onChange={(e) => setVegetarian(e.target.checked)}
            />
            Vegetarian
          </label>

          <textarea
            value={dietaryNotes}
            onChange={(e) => setDietaryNotes(e.target.value)}
            placeholder="Anything else? (allergies, dislikes, low-carb, kid-friendly...)"
            style={{
              width: "100%",
              minHeight: 120,
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "#f8fafc",
              resize: "vertical",
              outline: "none",
            }}
          />

          <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
            <button
              onClick={() => setStep(2)}
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#f8fafc",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Back
            </button>

            <button
              onClick={finishSetup}
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                background: "rgba(20,184,166,0.25)",
                border: "1px solid rgba(20,184,166,0.45)",
                color: "#f8fafc",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Generate My First Week →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}