import { useState } from "react"; // Removed 'React'
import { Plus, Search, ChefHat, Image as ImageIcon, X } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import type { Meal } from "../core/types";

export default function CookbookPage({ 
  cookbook, 
  setCookbook, 
  // setMeals removed from here to satisfy the compiler
}: { 
  cookbook: Meal[], 
  setCookbook: any
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [newRecipe, setNewRecipe] = useState<Meal>({
    name: "",
    ingredients: "",
    instructions: "",
    photoUrl: ""
  });

  const handleAdd = () => {
    if (!newRecipe.name) return;
    // Fallback if they leave photo blank
    const recipeToAdd = {
      ...newRecipe,
      photoUrl: newRecipe.photoUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80&sig=${Date.now()}`
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
          <p style={{ opacity: 0.5, fontSize: 15 }}>Your personal collection of recipes.</p>
        </header>

        {/* Search & Add */}
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

        {/* Add Recipe Modal Overlay */}
        {isAdding && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <Card style={{ maxWidth: "450px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>New Recipe</h3>
                <X onClick={() => setIsAdding(false)} style={{ cursor: "pointer", opacity: 0.5 }} />
              </div>
              
              <div style={{ display: "grid", gap: 16 }}>
                <input 
                  placeholder="Recipe Name" 
                  value={newRecipe.name}
                  onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})}
                  style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                />
                
                {/* THE NEW PHOTO URL FIELD */}
                <div style={{ position: "relative" }}>
                  <ImageIcon size={18} style={{ position: "absolute", left: 14, top: 14, opacity: 0.3 }} />
                  <input 
                    placeholder="Photo URL (Optional)" 
                    value={newRecipe.photoUrl}
                    onChange={(e) => setNewRecipe({...newRecipe, photoUrl: e.target.value})}
                    style={{ width: "100%", padding: "14px 14px 14px 44px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  />
                </div>

                <textarea 
                  placeholder="Ingredients (one per line)" 
                  value={newRecipe.ingredients}
                  onChange={(e) => setNewRecipe({...newRecipe, ingredients: e.target.value})}
                  style={{ width: "100%", height: 100, padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", resize: "none" }}
                />
                <textarea 
                  placeholder="Instructions" 
                  value={newRecipe.instructions}
                  onChange={(e) => setNewRecipe({...newRecipe, instructions: e.target.value})}
                  style={{ width: "100%", height: 100, padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", resize: "none" }}
                />
                <Button onClick={handleAdd}>Save to Cookbook</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Recipe Grid */}
        <div style={{ display: "grid", gap: 16 }}>
          {filtered.map((meal, i) => (
            <Card key={i} style={{ padding: 12 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <img src={meal.photoUrl} style={{ width: 70, height: 70, borderRadius: 12, objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>{meal.name}</div>
                  <div style={{ fontSize: 13, opacity: 0.4 }}>Added to your collection</div>
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