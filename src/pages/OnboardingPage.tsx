import { completeOnboarding } from "../core/onboardingStore";
import { useNavigate } from "react-router-dom";

export default function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "80px auto",
        padding: 24,
        textAlign: "center",
        color: "#f8fafc",
      }}
    >
      <h1 style={{ fontSize: 34, fontWeight: 900 }}>
        Welcome to Simple Dinners
      </h1>

      <p style={{ opacity: 0.8, marginTop: 12 }}>
        Dinner planning based around you.
      </p>

      <div style={{ marginTop: 40 }}>
        <button
          onClick={() => {
            completeOnboarding();
            navigate("/week");
          }}
          style={{
            padding: "14px 20px",
            borderRadius: 14,
            background: "rgba(20,184,166,0.25)",
            border: "1px solid rgba(20,184,166,0.45)",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Let's Set Up Your Kitchen →
        </button>
      </div>
    </div>
  );
}