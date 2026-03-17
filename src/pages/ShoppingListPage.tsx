import { useState } from "react";
import { Plus, Trash2, ShoppingCart, Tag, Eraser, CheckCircle2, Circle } from "lucide-react"; 
import Card from "../components/Card";
import { formatIngredients } from "../core/utils";

export default function ShoppingListPage({ meals, extraIngredients, setExtraIngredients }: any) {
  const [newItem, setNewItem] = useState("");
  const [crossedOff, setCrossedOff] = useState<string[]>([]);

  // --- HANDLERS ---
  const handleAddExtra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setExtraIngredients([...extraIngredients, newItem.trim()]);
    setNewItem("");
  };

  const toggleCrossed = (id: string) => {
    setCrossedOff(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const removeExtra = (index: number) => {
    setExtraIngredients(extraIngredients.filter((_: any, i: number) => i !== index));
  };

  const clearAllExtras = () => {
    if (window.confirm("Clear all manual items?")) setExtraIngredients([]);
  };

  // --- LOGIC: Grouping ingredients by Recipe ---
  const groupedRecipes = Object.values(meals)
    .filter((m: any) => m.ingredients && m.ingredients.trim() !== "")
    .map((m: any) => ({
      name: m.name,
      items: m.ingredients.split("\n").filter((line: string) => line.trim() !== "")
    }));

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 20px 120px 20px" }}>
      <div style={{ maxWidth: "550px", width: "100%" }}>
        
        <header style={{ textAlign: "center", margin: "20px 0" }}>
          <h2 style={{ fontSize: 28, fontWeight: 1000, margin: 0 }}>Shopping List</h2>
        </header>

        {/* INPUT BOX */}
        <Card style={{ marginBottom: 24 }}>
          <form onSubmit={handleAddExtra} style={{ display: "flex", gap: 8 }}>
            <input 
              placeholder="Add milk, bread, snacks..." 
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}
            />
            <button type="submit" style={{ padding: "0 16px", borderRadius: "12px", background: "#22c55e", border: "none", color: "white" }}>
              <Plus size={24} />
            </button>
          </form>
        </Card>

        {/* MANUAL ITEMS SECTION */}
        {extraIngredients.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 900, opacity: 0.4, letterSpacing: 1.5 }}>MANUAL ITEMS</span>
              <button onClick={clearAllExtras} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
                <Eraser size={12} /> CLEAR
              </button>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {extraIngredients.map((item: string, i: number) => {
                const isDone = crossedOff.includes(`extra-${i}`);
                return (
                  <div key={i} onClick={() => toggleCrossed(`extra-${i}`)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: isDone ? "rgba(34, 197, 94, 0.05)" : "rgba(34, 197, 94, 0.1)", borderRadius: "14px", border: "1px solid rgba(34, 197, 94, 0.2)", opacity: isDone ? 0.4 : 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {isDone ? <CheckCircle2 size={16} color="#22c55e" /> : <Tag size={16} color="#22c55e" />}
                      <span style={{ fontWeight: 700, textDecoration: isDone ? "line-through" : "none" }}>{item}</span>
                    </div>
                    <Trash2 size={18} onClick={(e) => { e.stopPropagation(); removeExtra(i); }} style={{ opacity: 0.4, color: "#ef4444" }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RECIPE SECTIONS */}
        {groupedRecipes.map((recipe: any, rIdx: number) => (
          <div key={rIdx} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: 11, fontWeight: 900, opacity: 0.5, letterSpacing: 1.5 }}>{recipe.name.toUpperCase()}</span>
              <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.1)' }} />
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {recipe.items.map((item: string, i: number) => {
                const itemId = `recipe-${rIdx}-${i}`;
                const isDone = crossedOff.includes(itemId);
                return (
                  <div key={i} onClick={() => toggleCrossed(itemId)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: isDone ? "transparent" : "rgba(255,255,255,0.05)", borderRadius: "14px", border: isDone ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(255,255,255,0.1)", opacity: isDone ? 0.3 : 1 }}>
                    {isDone ? <CheckCircle2 size={18} color="#22c55e" /> : <Circle size={18} style={{ opacity: 0.2 }} />}
                    <span style={{ fontWeight: 600, textDecoration: isDone ? "line-through" : "none" }}>
                      {formatIngredients(item, true)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* EMPTY STATE */}
        {groupedRecipes.length === 0 && extraIngredients.length === 0 && (
          <div style={{ textAlign: "center", padding: 80, opacity: 0.2 }}>
            <ShoppingCart size={48} style={{ marginBottom: 16 }} />
            <div style={{ fontWeight: 800 }}>List is empty</div>
          </div>
        )}
      </div>
    </div>
  );
}