import { ArrowLeft, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";

export default function SettingsPage({ prefs, setPrefs }: { prefs: any, setPrefs: any }) {
  const navigate = useNavigate();

  const toggleVegetarian = () => {
    const newValue = !prefs.vegetarian;
    setPrefs({ ...prefs, vegetarian: newValue });
    localStorage.setItem("vegetarian", String(newValue));
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ maxWidth: "550px", width: "100%", padding: "20px" }}>
        <button 
          onClick={() => navigate("/")} 
          style={{ background: "none", border: "none", color: "white", display: "flex", alignItems: "center", gap: 8, marginBottom: 20, cursor: "pointer", opacity: 0.6 }}
        >
          <ArrowLeft size={20} /> Back
        </button>

        <h1 style={{ fontSize: 32, fontWeight: 1000, marginBottom: 24 }}>Setup</h1>

        <Card title="Dietary Preferences">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ padding: 10, background: "rgba(34, 197, 94, 0.1)", borderRadius: 12 }}>
                <Leaf size={20} color="#22c55e" />
              </div>
              <div>
                <div style={{ fontWeight: 800 }}>Vegetarian Mode</div>
                <div style={{ fontSize: 12, opacity: 0.5 }}>Prioritize plant-based meals</div>
              </div>
            </div>

            <button 
              onClick={toggleVegetarian}
              style={{
                width: 54, height: 30, borderRadius: 20,
                background: prefs.vegetarian ? "#22c55e" : "rgba(255,255,255,0.1)",
                position: "relative", cursor: "pointer", border: "none",
                transition: "background 0.3s ease"
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: "50%", background: "white",
                position: "absolute", top: 4, left: prefs.vegetarian ? 28 : 4,
                transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }} />
            </button>
          </div>
        </Card>

        <div style={{ marginTop: 40, textAlign: "center", opacity: 0.3, fontSize: 12, fontWeight: 800 }}>
          SIMPLE DINNERS v22.0.7<br />
          KINGSPORT, TN
        </div>
      </div>
    </div>
  );
}