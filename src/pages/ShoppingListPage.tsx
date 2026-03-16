import { useState } from "react";
import { Plus, Trash2, ShoppingCart, Tag, Eraser } from "lucide-react"; // Swapped Sweep for Eraser
import Card from "../components/Card";
import { formatIngredients } from "../core/utils";

export default function ShoppingListPage({ meals, extraIngredients, setExtraIngredients }: any) {
  const [newItem, setNewItem] = useState("");

  const handleAddExtra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setExtraIngredients([...extraIngredients, newItem.trim()]);
    setNewItem("");
  };

  const removeExtra = (index: number) => {
    setExtraIngredients(extraIngredients.filter((_: any, i: number) => i !== index));
  };

  const clearAllExtras = () => {
    if (window.confirm("Clear all manual items from your list?")) {
      setExtraIngredients([]);
    }
  };

  // Gather recipe ingredients
  const recipeIngredients = Object.values(meals)
    .map((m: any) => m.ingredients)
    .filter(Boolean)
    .join("\n")
    .split("\n")
    .filter((line: string) => line.trim() !== "");

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ maxWidth: "550px", width: "100%", padding: "0 20px 120px 20px" }}>
        
        <header style={{ textAlign: "center", margin: "20px 0" }}>
          <h2 style={{ fontSize: 28, fontWeight: 1000, margin: 0 }}>Shopping List</h2>
        </header>

        <Card>
          <form onSubmit={handleAddExtra} style={{ display: "flex", gap: 8 }}>
            <input 
              placeholder="Add milk, bread, snacks..." 
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              style={{ 
                flex: 1, padding: "12px", borderRadius: "12px", 
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", 
                color: "white", outline: "none" 
              }}
            />
            <button 
              type="submit"
              style={{ 
                padding: "0 16px", borderRadius: "12px", background: "#22c55e", 
                border: "none", color: "white", cursor: "pointer" 
              }}
            >
              <Plus size={24} />
            </button>
          </form>
        </Card>

        <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
          {/* --- EXTRA ITEMS SECTION --- */}
          {extraIngredients.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 900, opacity: 0.4, textTransform: "uppercase" }}>Manual Items</span>
              <button 
                onClick={clearAllExtras}
                style={{ background: "none", border: "none", color: "#ef4444", fontSize: 11, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                <Eraser size={14} /> CLEAR ALL
              </button>
            </div>
          )}

          {extraIngredients.map((item: string, i: number) => (
            <div key={`extra-${i}`} style={{ 
              display: "flex", alignItems: "center", justifyContent: "space-between", 
              padding: "16px", background: "rgba(34, 197, 94, 0.1)", 
              borderRadius: "16px", border: "1px solid rgba(34, 197, 94, 0.2)" 
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Tag size={16} color="#22c55e" />
                <span style={{ fontWeight: 700 }}>{item}</span>
              </div>
              <Trash2 
                size={18} 
                onClick={() => removeExtra(i)} 
                style={{ cursor: "pointer", opacity: 0.5, color: "#ef4444" }} 
              />
            </div>
          ))}

          {/* --- RECIPE ITEMS SECTION --- */}
          {recipeIngredients.length > 0 && (
            <div style={{ marginTop: 12, marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 900, opacity: 0.4, textTransform: "uppercase" }}>From Your Plan</span>
            </div>
          )}

          {/* --- RECIPE ITEMS SECTION --- */}
{recipeIngredients.map((item: string, i: number) => (
  <div key={`recipe-${i}`} style={{ 
    display: "flex", alignItems: "center", gap: 12, padding: "16px", 
    background: "rgba(255,255,255,0.05)", borderRadius: "16px", 
    border: "1px solid rgba(255,255,255,0.1)" 
  }}>
    <ShoppingCart size={18} style={{ opacity: 0.3 }} />
    {/* ADD THE 'true' FLAG HERE */}
    <span style={{ fontWeight: 600 }}>{formatIngredients(item, true)}</span>
  </div>
))}

          {recipeIngredients.length === 0 && extraIngredients.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, opacity: 0.3 }}>
              <ShoppingCart size={48} style={{ marginBottom: 16 }} />
              <div style={{ fontWeight: 800 }}>Your list is empty.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}