import { useState, useRef, useEffect } from "react";
import { Plus, Search, X, Upload, Trash2, Edit2, ChefHat, ArrowLeft } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import type { Meal } from "../core/types";
import { formatIngredients } from "../core/utils";

export default function CookbookPage({ cookbook, setCookbook }: { cookbook: Meal[], setCookbook: any }) {
  // --- STATE ---
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Meal | null>(null);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newRecipe, setNewRecipe] = useState<Meal>({ 
    name: "", 
    ingredients: "", 
    instructions: "", 
    photoUrl: "",
    effort: "normal"
  });

  // --- BACK-SWIPE PROTECTION ---
  useEffect(() => {
    if (selectedRecipe) {
      window.history.pushState({ view: 'recipe' }, '');
      const handleBack = (_e: PopStateEvent) => {
        setSelectedRecipe(null);
        setCheckedIngredients([]);
      };
      window.addEventListener('popstate', handleBack);
      return () => window.removeEventListener('popstate', handleBack);
    }
  }, [selectedRecipe]);

  // --- HANDLERS ---
  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewRecipe({ ...newRecipe, photoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!newRecipe.name) return;
    const recipeToSave = {
      ...newRecipe,
      photoUrl: newRecipe.photoUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80`
    };

    if (editingIndex !== null) {
      const updated = [...cookbook];
      updated[editingIndex] = recipeToSave;
      setCookbook(updated);
    } else {
      setCookbook([recipeToSave, ...cookbook]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setNewRecipe({ name: "", ingredients: "", instructions: "", photoUrl: "", effort: "normal" });
  };

  const startEdit = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setNewRecipe(cookbook[index]);
    setEditingIndex(index);
    setIsAdding(true);
  };

  const deleteRecipe = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (window.confirm("Delete this recipe?")) {
      setCookbook(cookbook.filter((_, i) => i !== index));
    }
  };

  const toggleIngredient = (ingredient: string) => {
    setCheckedIngredients(prev => 
      prev.includes(ingredient) ? prev.filter(i => i !== ingredient) : [...prev, ingredient]
    );
  };

  const filtered = cookbook.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  // --- DETAIL VIEW RENDER ---
  if (selectedRecipe) {
    // We trim and filter to ensure we only count real ingredients for the "Mission Complete" check
    const lines = (selectedRecipe.ingredients || "").split('\n').filter(line => line.trim() !== "");
    const isMissionComplete = lines.length > 0 && lines.every(ing => checkedIngredients.includes(ing));

    return (
      <div style={{ width: "100%", maxWidth: "550px", padding: "20px", paddingBottom: "120px" }}>
        <button 
          onClick={() => { setSelectedRecipe(null); setCheckedIngredients([]); }} 
          style={{ background: "none", border: "none", color: "white", display: "flex", alignItems: "center", gap: 8, marginBottom: 20, cursor: "pointer", opacity: 0.6 }}
        >
          <ArrowLeft size={20} /> Back to Cookbook
        </button>

        <img src={selectedRecipe.photoUrl} style={{ width: "100%", height: 250, borderRadius: 24, objectFit: "cover", marginBottom: 24 }} />

        {isMissionComplete && (
          <div style={{ background: "linear-gradient(135deg, #22c55e, #10b981)", padding: "20px", borderRadius: "20px", marginBottom: 24, textAlign: "center", boxShadow: "0 10px 20px rgba(34, 197, 94, 0.2)", animation: "popIn 0.4s ease" }}>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "white" }}>🏆 MISSION COMPLETE!</h3>
            <p style={{ margin: "4px 0 0 0", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>Prep is done. The kitchen is yours, Captain!</p>
          </div>
        )}

        <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>{selectedRecipe.name}</h2>
        
        <div style={{ display: "grid", gap: 24 }}>
          <section>
            <h4 style={{ color: "#22c55e", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Ingredients</h4>
            {/* THE LIVING LIST FIX: Changed display to flex with column direction */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {lines.map((ing, index) => {
                const isChecked = checkedIngredients.includes(ing);
                return (
                  <div 
                    key={index} 
                    onClick={() => toggleIngredient(ing)} 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 12, 
                      padding: "12px 16px", 
                      borderRadius: "12px", 
                      background: isChecked ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)", 
                      border: isChecked ? "1px solid transparent" : "1px solid rgba(255,255,255,0.1)", 
                      cursor: "pointer", 
                      order: isChecked ? 100 : 0, // High order shuffles checked items to bottom
                      opacity: isChecked ? 0.4 : 1,
                      transition: "all 0.3s ease"
                    }}
                  >
                    <div style={{ width: 20, height: 20, borderRadius: 6, border: "2px solid #22c55e", background: isChecked ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isChecked && <X size={14} color="white" strokeWidth={4} />}
                    </div>
                    <span style={{ fontSize: 16, textDecoration: isChecked ? "line-through" : "none", fontWeight: isChecked ? 400 : 600 }}>
                      {formatIngredients(ing)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
          
          <section>
            <h4 style={{ color: "#22c55e", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Instructions</h4>
            <div style={{ whiteSpace: "pre-line", fontSize: 16, lineHeight: "1.6", opacity: 0.8 }}>{selectedRecipe.instructions || "No instructions provided."}</div>
          </section>
        </div>
      </div>
    );
  }

  // --- MAIN LIST VIEW RENDER ---
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ maxWidth: "550px", width: "100%", padding: "0 20px 120px 20px", display: "grid", gap: 24 }}>
        <header style={{ textAlign: "center", marginTop: 20 }}><h2 style={{ fontSize: 28, fontWeight: 1000, margin: 0 }}>My Cookbook</h2></header>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: 14, top: 14, opacity: 0.3 }} />
            <input placeholder="Search recipes..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "14px 14px 14px 44px", borderRadius: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
          </div>
          <button onClick={() => setIsAdding(true)} style={{ padding: "0 20px", borderRadius: "16px", background: "#22c55e", border: "none", color: "white", fontWeight: 800 }}><Plus size={24} /></button>
        </div>

        {isAdding && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <Card style={{ maxWidth: "450px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{editingIndex !== null ? "Edit Recipe" : "New Recipe"}</h3>
                <X onClick={closeModal} style={{ cursor: "pointer", opacity: 0.5 }} />
              </div>
              <div style={{ display: "grid", gap: 16 }}>
                <div onClick={() => fileInputRef.current?.click()} style={{ width: "100%", height: 120, borderRadius: 12, border: "2px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", background: "rgba(255,255,255,0.02)" }}>
                  {newRecipe.photoUrl ? <img src={newRecipe.photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Upload size={20} style={{ opacity: 0.3 }} />}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: "none" }} />
                <input placeholder="Recipe Name" value={newRecipe.name} onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
                
                <div style={{ display: "flex", gap: 8 }}>
                  {(["quick", "normal", "big"] as const).map((level) => (
                    <button key={level} onClick={() => setNewRecipe({ ...newRecipe, effort: level })} style={{ flex: 1, padding: "8px", borderRadius: "8px", fontSize: "12px", textTransform: "capitalize", border: "1px solid rgba(255,255,255,0.1)", background: newRecipe.effort === level ? "#22c55e" : "rgba(255,255,255,0.05)", color: "white", fontWeight: 700, cursor: "pointer" }}>{level}</button>
                  ))}
                </div>

                <textarea placeholder="Ingredients (e.g. 0.5 cup salt)" value={newRecipe.ingredients} onChange={(e) => setNewRecipe({...newRecipe, ingredients: e.target.value})} style={{ width: "100%", height: 80, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", resize: "none" }} />
                <textarea placeholder="Instructions" value={newRecipe.instructions} onChange={(e) => setNewRecipe({...newRecipe, instructions: e.target.value})} style={{ width: "100%", height: 120, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", resize: "none" }} />
                <Button onClick={handleSave}>{editingIndex !== null ? "Update Recipe" : "Save to Cookbook"}</Button>
              </div>
            </Card>
          </div>
        )}

        <div style={{ display: "grid", gap: 16 }}>
          {filtered.map((meal, i) => (
            <Card key={i} style={{ padding: 0, overflow: "hidden" }}>
              <div onClick={() => setSelectedRecipe(meal)} style={{ padding: "12px 16px", cursor: "pointer", display: "flex", gap: 16, alignItems: "center" }}>
                <img src={meal.photoUrl} style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover" }} />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 16 }}>{meal.name}</div></div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 12, opacity: 0.3 }}>
                    <Edit2 size={18} onClick={(e) => startEdit(e, i)} style={{ cursor: "pointer" }} />
                    <Trash2 size={18} onClick={(e) => deleteRecipe(e, i)} style={{ cursor: "pointer", color: "#ef4444" }} />
                  </div>
                  <ChefHat size={20} style={{ opacity: 0.2 }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}