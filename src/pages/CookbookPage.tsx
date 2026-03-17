import { useState, useEffect } from "react";
import { ShoppingCart, CheckCircle2, Circle } from "lucide-react"; 
import { formatIngredients } from "../core/utils";
import Card from "../components/Card"; // Ensure Card is imported

export default function CookbookPage({ 
  cookbook,
  extraIngredients, 
  setExtraIngredients, 
  pantry 
}: any) {
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null); 
  const [selectedForShop, setSelectedForShop] = useState<string[]>([]);

  useEffect(() => {
    if (selectedRecipe) {
      const ings = (selectedRecipe.ingredients || "").split('\n').filter(Boolean);
      const missing = ings.filter((ing: string) => 
        !pantry.some((p: any) => ing.toLowerCase().includes(p.name.toLowerCase()))
      );
      setSelectedForShop(missing);
    }
  }, [selectedRecipe, pantry]);

  const toggleForShop = (ing: string) => {
    setSelectedForShop(prev => 
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  };

  const handleAddToShop = () => {
    const currentList = new Set(extraIngredients);
    selectedForShop.forEach(item => currentList.add(item.trim()));
    setExtraIngredients(Array.from(currentList));
    setSelectedForShop([]); 
    alert(`${selectedForShop.length} items added to Shop!`);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: "0 20px 120px 20px" }}>
      <div style={{ maxWidth: '550px', width: '100%' }}>
        
        {/* RECIPE LIST VIEW */}
        {cookbook.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 100, opacity: 0.5 }}>
            <h3 style={{ fontWeight: 800 }}>Your Cookbook is Empty</h3>
            <p>Try importing a recipe to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {cookbook.map((recipe: any) => (
              <Card key={recipe.name} onClick={() => setSelectedRecipe(recipe)}>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{recipe.name}</div>
              </Card>
            ))}
          </div>
        )}

        {/* RECIPE DETAIL OVERLAY (Now inside the main div) */}
        {selectedRecipe && (
          <div className="recipe-overlay" style={{ marginTop: 40, padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 24 }}>
            <h2 style={{ fontSize: 28, fontWeight: 1000 }}>{selectedRecipe.name}</h2>
            
            <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
              {selectedRecipe.ingredients.split('\n').map((ing: string, i: number) => {
                const isSelected = selectedForShop.includes(ing);
                return (
                  <div 
                    key={i} 
                    onClick={() => toggleForShop(ing)}
                    style={{ 
                      display: "flex", alignItems: "center", gap: 12, padding: "14px", 
                      borderRadius: "14px", background: "rgba(255,255,255,0.05)",
                      border: isSelected ? "1px solid #22c55e" : "1px solid rgba(255,255,255,0.1)",
                      transition: "all 0.2s",
                      cursor: 'pointer'
                    }}
                  >
                    {isSelected ? <CheckCircle2 size={20} color="#22c55e" /> : <Circle size={20} style={{ opacity: 0.3 }} />}
                    <span style={{ fontWeight: 600 }}>{formatIngredients(ing)}</span>
                  </div>
                );
              })}
            </div>

            {selectedForShop.length > 0 && (
              <button 
                onClick={handleAddToShop}
                style={{ 
                  position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)",
                  background: "#22c55e", color: "white", padding: "16px 32px", borderRadius: "40px",
                  fontWeight: 900, boxShadow: "0 10px 25px rgba(34, 197, 94, 0.5)", border: "none", 
                  zIndex: 100, display: "flex", alignItems: "center", gap: 10, width: "max-content",
                  cursor: 'pointer'
                }}
              >
                <ShoppingCart size={20} /> ADD {selectedForShop.length} TO SHOP
              </button>
            )}
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedRecipe(null)}
              style={{ marginTop: 20, background: 'none', border: 'none', color: '#666', fontWeight: 700, cursor: 'pointer' }}
            >
              Close Recipe
            </button>
          </div>
        )}
      </div>
    </div>
  );
}