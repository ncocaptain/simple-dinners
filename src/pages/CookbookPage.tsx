import { useState, useRef } from "react";
import { Plus, Search, X, Upload, Trash2, Edit2 } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import type { Meal } from "../core/types";

export default function CookbookPage({ cookbook, setCookbook }: { cookbook: Meal[], setCookbook: any }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [importUrl, setImportUrl] = useState("");

  const [newRecipe, setNewRecipe] = useState<Meal>({ name: "", ingredients: "", instructions: "", photoUrl: "" });

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
    setNewRecipe({ name: "", ingredients: "", instructions: "", photoUrl: "" });
    setImportUrl("");
  };

  const startEdit = (index: number) => {
    setNewRecipe(cookbook[index]);
    setEditingIndex(index);
    setIsAdding(true);
  };

  const deleteRecipe = (index: number) => {
    if (window.confirm("Delete this recipe?")) {
      setCookbook(cookbook.filter((_, i) => i !== index));
    }
  };

  const filtered = cookbook.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ maxWidth: "550px", width: "100%", padding: "0 20px 120px 20px", display: "grid", gap: 24 }}>
        
        <header style={{ textAlign: "center", marginTop: 20 }}>
          <h2 style={{ fontSize: 28, fontWeight: 1000, margin: 0 }}>My Cookbook</h2>
        </header>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: 14, top: 14, opacity: 0.3 }} />
            <input 
              placeholder="Search recipes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "14px 14px 14px 44px", borderRadius: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
            />
          </div>
          <button onClick={() => setIsAdding(true)} style={{ padding: "0 20px", borderRadius: "16px", background: "#22c55e", border: "none", color: "white", fontWeight: 800 }}>
            <Plus size={24} />
          </button>
        </div>

        {isAdding && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <Card style={{ maxWidth: "450px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{editingIndex !== null ? "Edit Recipe" : "New Recipe"}</h3>
                <X onClick={closeModal} style={{ cursor: "pointer", opacity: 0.5 }} />
              </div>
              
              <div style={{ display: "grid", gap: 16 }}>
                {/* Magic Import Section (Placeholder) */}
                <div style={{ padding: 12, borderRadius: 12, background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input placeholder="Paste URL..." value={importUrl} onChange={(e) => setImportUrl(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "none", color: "white", fontSize: 12 }} />
                    <button onClick={() => alert("Scraper coming in v22.0.7!")} style={{ padding: "0 10px", borderRadius: "8px", background: "#22c55e", border: "none", color: "white", fontSize: 11, fontWeight: 700 }}>Import</button>
                  </div>
                </div>

                <div onClick={() => fileInputRef.current?.click()} style={{ width: "100%", height: 120, borderRadius: 12, border: "2px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", background: "rgba(255,255,255,0.02)" }}>
                  {newRecipe.photoUrl ? <img src={newRecipe.photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Upload size={20} style={{ opacity: 0.3 }} />}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: "none" }} />

                <input placeholder="Recipe Name" value={newRecipe.name} onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
                <textarea placeholder="Ingredients" value={newRecipe.ingredients} onChange={(e) => setNewRecipe({...newRecipe, ingredients: e.target.value})} style={{ width: "100%", height: 80, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", resize: "none" }} />
                
                <Button onClick={handleSave}>{editingIndex !== null ? "Update Recipe" : "Save to Cookbook"}</Button>
              </div>
            </Card>
          </div>
        )}

        <div style={{ display: "grid", gap: 16 }}>
          {filtered.map((meal, i) => (
            <Card key={i} style={{ padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <img src={meal.photoUrl} style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{meal.name}</div>
                </div>
                <div style={{ display: "flex", gap: 12, opacity: 0.3 }}>
                  <Edit2 size={18} onClick={() => startEdit(i)} style={{ cursor: "pointer" }} />
                  <Trash2 size={18} onClick={() => deleteRecipe(i)} style={{ cursor: "pointer", color: "#ef4444" }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}