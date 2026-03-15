import { Settings, ShieldCheck, Leaf, AlertCircle } from "lucide-react";
import { ALLERGENS } from "../core/data";
import type { Preferences } from "../core/types";

import Card from "../components/Card";

export default function SettingsPage({ prefs, setPrefs }: { prefs: Preferences; setPrefs: any }) {
  
  const toggleAllergen = (key: string) => {
    const current = prefs.allergens || [];
    const next = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    setPrefs({ ...prefs, allergens: next });
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ 
        maxWidth: "550px", 
        width: "100%", 
        padding: "0 20px 40px 20px", 
        boxSizing: "border-box" 
      }}>
        <Card 
          title={<><Settings size={22} /> Preferences</>} 
          subtitle="How the planner selects your meals."
        >
          
          {/* 1. Vegetarian Section */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
              Dietary Style
            </h3>
            <div 
              onClick={() => setPrefs({ ...prefs, vegetarian: !prefs.vegetarian })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "24px",
                borderRadius: "28px",
                background: prefs.vegetarian ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)",
                border: "1px solid",
                borderColor: prefs.vegetarian ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ 
                width: 52, 
                height: 52, 
                borderRadius: 18, 
                background: prefs.vegetarian ? "#22c55e" : "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: prefs.vegetarian ? "#fff" : "rgba(255,255,255,0.3)"
              }}>
                <Leaf size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: 18, color: "#f8fafc" }}>Vegetarian Mode</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Hide recipes containing meat</div>
              </div>
              <div style={{ 
                width: 28, 
                height: 28, 
                borderRadius: 14, 
                border: "2px solid",
                borderColor: prefs.vegetarian ? "#22c55e" : "rgba(255,255,255,0.2)",
                background: prefs.vegetarian ? "#22c55e" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {prefs.vegetarian && <ShieldCheck size={18} color="#fff" />}
              </div>
            </div>
          </div>

          {/* 2. Allergens Section */}
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
              Allergens (Filter Out)
            </h3>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(2, 1fr)", 
              gap: "12px" 
            }}>
              {ALLERGENS.map((a) => {
                const isActive = (prefs.allergens || []).includes(a.key);
                return (
                  <div
                    key={a.key}
                    onClick={() => toggleAllergen(a.key)}
                    style={{
                      padding: "20px 16px",
                      borderRadius: "24px",
                      background: isActive ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.03)",
                      border: "1px solid",
                      borderColor: isActive ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 10
                    }}
                  >
                    <AlertCircle size={22} color={isActive ? "#ef4444" : "rgba(255,255,255,0.2)"} />
                    <span style={{ 
                      fontSize: 15, 
                      fontWeight: 800, 
                      color: isActive ? "#f8fafc" : "rgba(255,255,255,0.6)" 
                    }}>
                      {a.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.2em" }}>
              Simple Dinners v22.0
            </div>
          </div>

        </Card>
      </div>
    </div>
  );
}