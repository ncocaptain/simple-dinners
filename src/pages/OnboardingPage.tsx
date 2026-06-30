import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { completeOnboarding } from "../core/onboardingStore";

const STARTER_ITEMS = [
  "Chicken",
  "Ground beef",
  "Pasta",
  "Rice",
  "Eggs",
  "Milk",
  "Butter",
  "Cheese",
  "Onion",
  "Garlic",
  "Potatoes",
  "Canned tomatoes",
  "Bread",
];

const pageStyle: React.CSSProperties = {
  minHeight: "100dvh",
  width: "100%",
  boxSizing: "border-box",
  padding: "16px 16px max(20px, env(safe-area-inset-bottom))",
  display: "flex",
  justifyContent: "center",
  alignItems: "stretch",
  color: "#f8fafc",
};

const shellStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 760,
  margin: "0 auto",
  display: "flex",
};

const panelStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "calc(100dvh - 36px)",
  padding: 24,
  borderRadius: 22,
  background: "rgba(15,23,42,0.55)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const headerStyle: React.CSSProperties = {
  flex: "0 0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 18,
  flexWrap: "wrap",
};

const contentStyle: React.CSSProperties = {
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  padding: "4px 2px 16px",
};

const centeredContentStyle: React.CSSProperties = {
  ...contentStyle,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const footerStyle: React.CSSProperties = {
  flex: "0 0 auto",
  paddingTop: 16,
  borderTop: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  justifyContent: "space-between",
};

const footerGroupStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
};

const primaryButton: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 14,
  background: "rgba(20,184,166,0.25)",
  border: "1px solid rgba(20,184,166,0.45)",
  color: "#f8fafc",
  fontWeight: 900,
  cursor: "pointer",
};

const primaryButtonWide: React.CSSProperties = {
  ...primaryButton,
  width: "100%",
};

const secondaryButton: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#f8fafc",
  fontWeight: 800,
  cursor: "pointer",
};

function normalizeItem(text: string) {
  return text.trim().toLowerCase();
}

function formatItem(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export default function OnboardingPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [customItem, setCustomItem] = useState("");
  const [vegetarian, setVegetarian] = useState(false);
  const [dietaryNotes, setDietaryNotes] = useState("");

  const progressLabel = useMemo(() => `Step ${step} of 3`, [step]);

  function goToStep(nextStep: number) {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function toggleItem(item: string) {
    setSelectedItems((prev) => {
      const exists = prev.some(
        (x) => normalizeItem(x) === normalizeItem(item)
      );

      if (exists) {
        return prev.filter((x) => normalizeItem(x) !== normalizeItem(item));
      }

      return [...prev, item];
    });
  }

  function removeItem(item: string) {
    setSelectedItems((prev) =>
      prev.filter((x) => normalizeItem(x) !== normalizeItem(item))
    );
  }

  function addCustomItem() {
    const formatted = formatItem(customItem);
    if (!formatted) return;

    setSelectedItems((prev) => {
      const exists = prev.some(
        (x) => normalizeItem(x) === normalizeItem(formatted)
      );
      if (exists) return prev;
      return [...prev, formatted];
    });

    setCustomItem("");
  }

  function finishSetup() {
    const pantryItems = selectedItems.map((item) => ({ name: item }));

    const prefs = {
      vegetarian,
      dietaryNotes,
      includeDesserts: false,
      includeAppetizers: false,
    };

    localStorage.setItem("pantry", JSON.stringify(pantryItems));
    localStorage.setItem("prefs", JSON.stringify(prefs));

    completeOnboarding();
    navigate("/week?first=true");
  }

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={panelStyle}>
          <div style={headerStyle}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 0.8,
                opacity: 0.75,
                textTransform: "uppercase",
              }}
            >
              {progressLabel}
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background:
                      n <= step
                        ? "rgba(20,184,166,0.95)"
                        : "rgba(255,255,255,0.18)",
                    boxShadow:
                      n <= step ? "0 0 0 3px rgba(20,184,166,0.12)" : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div style={centeredContentStyle}>
              <div style={{ textAlign: "center", padding: "10px 6px 6px" }}>
                <img
                  src="/pwa-192x192.png"
                  alt="Simple Dinners"
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 24,
                    marginBottom: 18,
                    boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
                  }}
                />

                <h1
                  style={{
                    fontSize: 36,
                    fontWeight: 1000,
                    margin: "0 0 10px",
                    lineHeight: 1.05,
                  }}
                >
                  Dinner. Decided.
                </h1>

                <p
                  style={{
                    opacity: 0.86,
                    fontSize: 17,
                    maxWidth: 520,
                    margin: "0 auto",
                    lineHeight: 1.5,
                  }}
                >
                  Simple Dinners helps you solve the nightly “what’s for dinner?”
                  problem with a personalized weekly plan, saved recipes, and a
                  simple shopping flow.
                </p>

                <p
                  style={{
                    opacity: 0.7,
                    fontSize: 15,
                    maxWidth: 520,
                    margin: "12px auto 0",
                    lineHeight: 1.5,
                  }}
                >
                  We’ll ask a couple quick questions, then build your first week
                  in seconds.
                </p>

                <div
                  style={{
                    marginTop: 22,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  🍽 Plan smarter • 🛒 Shop easier • 🔥 Keep your streak going
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={contentStyle}>
              <h1 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 10px" }}>
                What do you usually keep on hand?
              </h1>

              <p style={{ opacity: 0.82, marginBottom: 20, lineHeight: 1.5 }}>
                Pick a few basics, then add anything else you almost always keep
                around.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {STARTER_ITEMS.map((item) => {
                  const active = selectedItems.some(
                    (x) => normalizeItem(x) === normalizeItem(item)
                  );

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
                      }}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 22, display: "grid", gap: 10 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: 0.7,
                    opacity: 0.7,
                    textTransform: "uppercase",
                  }}
                >
                  Add your own
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    value={customItem}
                    onChange={(e) => setCustomItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomItem();
                      }
                    }}
                    placeholder="Example: Tortillas, broccoli, beans..."
                    style={{
                      flex: 1,
                      minWidth: 220,
                      padding: "12px 14px",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.06)",
                      color: "#f8fafc",
                      outline: "none",
                      fontSize: 15,
                    }}
                  />

                  <button onClick={addCustomItem} style={primaryButton}>
                    Add
                  </button>
                </div>
              </div>

              {!!selectedItems.length && (
                <div style={{ marginTop: 22, display: "grid", gap: 10 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      letterSpacing: 0.7,
                      opacity: 0.7,
                      textTransform: "uppercase",
                    }}
                  >
                    Your kitchen
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {selectedItems.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => removeItem(item)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 999,
                          border: "1px solid rgba(20,184,166,0.38)",
                          background: "rgba(20,184,166,0.14)",
                          color: "#ccfbf1",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        {item} ✕
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div style={contentStyle}>
              <h1 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 10px" }}>
                Any preferences?
              </h1>

              <p style={{ opacity: 0.82, marginBottom: 20, lineHeight: 1.5 }}>
                A couple quick details and we’ll build your first personalized
                week.
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
                  fontSize: 15,
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          <div style={footerStyle}>
            <div style={footerGroupStyle}>
              {step > 1 && (
                <button onClick={() => goToStep(step - 1)} style={secondaryButton}>
                  Back
                </button>
              )}

              {step === 2 && (
                <button onClick={() => goToStep(3)} style={secondaryButton}>
                  Skip for now
                </button>
              )}
            </div>

            <div style={footerGroupStyle}>
              {step === 1 && (
                <button onClick={() => goToStep(2)} style={primaryButtonWide}>
                  Let&apos;s Set Up Your Kitchen →
                </button>
              )}

              {step === 2 && (
                <button onClick={() => goToStep(3)} style={primaryButton}>
                  Continue
                </button>
              )}

              {step === 3 && (
                <button onClick={finishSetup} style={primaryButton}>
                  Generate My First Week →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
