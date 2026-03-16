import { useState, useRef } from "react";
import { Plus, Search, ChefHat, X, Upload } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import type { Meal } from "../core/types";

export default function CookbookPage({ 
  cookbook, 
  setCookbook 
}: { 
  cookbook: Meal[], 
  setCookbook: any
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newRecipe, setNewRecipe] = useState<Meal>({
    name: "",
    ingredients: "",
    instructions: "",
    photoUrl: ""
  });

  // Handle converting the uploaded image to a string
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewRecipe({ ...newRecipe, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (!newRecipe.name) return;
    const recipeToAdd = {
      ...newRecipe,
      photoUrl: newRecipe.photoUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80`
    };
    setCookbook([recipeToAdd, ...cookbook]);
    setIsAdding(false);
    setNewRecipe({ name: "", ingredients: "", instructions: "", photoUrl: "" });
  };

  const filtered = cookbook.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

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
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>New Recipe</h3>
                <X onClick={() => setIsAdding(false)} style={{ cursor: "pointer", opacity: 0.5 }} />
              </div>
              
              <div style={{ display: "grid", gap: 16 }}>
                {/* Image Preview / Upload Button */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    width: "100%", height: 180, borderRadius: 16, border: "2px dashed rgba(255,255,255,0.1)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", overflow: "hidden", position: "relative", background: "rgba(255,255,255,0.02)"
                  }}
                >
                  {newRecipe.photoUrl ? (
                    <img src={newRecipe.photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <>
                      <Upload size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                      <span style={{ fontSize: 13, opacity: 0.5 }}>Tap to upload photo</span>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: "none" }} />

                <input 
                  placeholder="Recipe Name" 
                  value={newRecipe.name}
                  onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})}
                  style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                />

                <textarea 
                  placeholder="Ingredients" 
                  value={newRecipe.ingredients}
                  onChange={(e) => setNewRecipe({...newRecipe, ingredients: e.target.value})}
                  style={{ width: "100%", height: 100, padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                />
                <Button onClick={handleAdd}>Save to Cookbook</Button>
              </div>
            </Card>
          </div>
        )}

        <div style={{ display: "grid", gap: 16 }}>
          {filtered.map((meal, i) => (
            <Card key={i} style={{ padding: 12 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <img src={meal.photoUrl} style={{ width: 70, height: 70, borderRadius: 12, objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>{meal.name}</div>
                </div>
                <ChefHat size={20} style={{ opacity: 0.2 }} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}