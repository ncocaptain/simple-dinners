import { ArrowLeft, Leaf, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";

export default function SettingsPage({ prefs, setPrefs }: { prefs: any, setPrefs: any }) {
  const navigate = useNavigate();

  const updatePrefs = (updatedFields: any) => {
    // 1. Merge new data into old data (Preserves allergies!)
    const newPrefs = { ...prefs, ...updatedFields };
    
    // 2. Update the parent state (Triggers instant UI movement)
    setPrefs(newPrefs);
    
    // 3. Save to the phone's memory
    localStorage.setItem("prefs", JSON.stringify(newPrefs));
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

        <div style={{ display: "grid", gap: 20 }}>
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
                onClick={() => updatePrefs({ vegetarian: !prefs.vegetarian })}
                style={{
                  width: 54, height: 30, borderRadius: 20,
                  background: prefs.vegetarian ? "#22c55e" : "rgba(255,255,255,0.1)",
                  position: "relative", cursor: "pointer", border: "none",
                  transition: "background 0.3s ease"
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", background: "white",
                  position: "absolute", top: 4, 
                  left: prefs.vegetarian ? 28 : 4, // LOOKS AT LIVE STATE
                  transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                }} />
              </button>
            </div>
          </Card>

          <Card title="Health & Safety">
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "10px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: 0.8 }}>
                <AlertCircle size={18} color="#ef4444" />
                <span style={{ fontSize: 14, fontWeight: 700 }}>Allergies & Restrictions</span>
              </div>
              <textarea 
                placeholder="e.g. Nut allergies, no shellfish..."
                value={prefs.dietaryNotes || ""}
                onChange={(e) => updatePrefs({ dietaryNotes: e.target.value })}
                style={{ 
                  width: "100%", minHeight: 80, padding: 12, borderRadius: 12,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "white", fontSize: 14, resize: "none"
                }}
              />
            </div>
          </Card>
        </div>

        <div style={{ marginTop: 40, textAlign: "center", opacity: 0.3, fontSize: 12, fontWeight: 800 }}>
          SIMPLE DINNERS v22.0.7<br />
          KINGSPORT, TN
        </div>
      </div>
    </div>
  );
}