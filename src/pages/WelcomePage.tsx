import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function WelcomePage() {
  const navigate = useNavigate();

  const start = () => {
    localStorage.setItem("simple-dinners:onboarded", "true");
    navigate("/week");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        textAlign: "center",
        color: "#f8fafc"
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <h1 style={{ fontSize: 36, fontWeight: 900 }}>
          Dinner. Decided.
        </h1>

        <p style={{ opacity: 0.8 }}>
          Simple Dinners helps you solve the nightly
          “what’s for dinner?” problem in seconds.
        </p>

        <div style={{ marginTop: 24 }}>
          <Button onClick={start}>
            Start Planning
          </Button>
        </div>
      </div>
    </div>
  );
}