import { useState, useEffect } from "react";
// Removed Plus and Search since they aren't used in this view yet
import { ShoppingCart, CheckCircle2, Circle } from "lucide-react"; 
import { formatIngredients } from "../core/utils";

// Removed cookbook/setCookbook from the props if you aren't using them in the list view
export default function CookbookPage({ 
  cookbook,
  extraIngredients, 
  setExtraIngredients, 
  pantry 
}: any) {
  // If you have a list of recipes, you need a way to select one:
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null); 
  const [selectedForShop, setSelectedForShop] = useState<string[]>([]);

  // SMART-SELECT: Auto-highlight items NOT in your pantry
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
    // DE-DUPE: Merge current list with new items
    const currentList = new Set(extraIngredients);
    selectedForShop.forEach(item => currentList.add(item.trim()));
    
    setExtraIngredients(Array.from(currentList));
    setSelectedForShop([]); // Clear selection
    alert(`${selectedForShop.length} items added to Shop!`);
  };

  return (
    <div style={{ padding: "0 20px 120px 20px" }}>
      {/* ... Search and List logic ... */}

      {cookbook.map((recipe: any) => (
  <div 
    key={recipe.name} 
    onClick={() => setSelectedRecipe(recipe)} // This uses the variable!
    style={{ cursor: 'pointer' }}
  >
    {recipe.name}
  </div>
))}

      {selectedRecipe && (
        <div className="recipe-overlay">
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
                     transition: "all 0.2s"
                   }}
                 >
                   {isSelected ? <CheckCircle2 size={20} color="#22c55e" /> : <Circle size={20} style={{ opacity: 0.3 }} />}
                   <span style={{ fontWeight: 600 }}>{formatIngredients(ing)}</span>
                 </div>
               );
             })}
           </div>

           {/* FLOATING ACTION BUTTON */}
           {selectedForShop.length > 0 && (
             <button 
               onClick={handleAddToShop}
               style={{ 
                 position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)",
                 background: "#22c55e", color: "white", padding: "16px 32px", borderRadius: "40px",
                 fontWeight: 900, boxShadow: "0 10px 25px rgba(34, 197, 94, 0.5)", border: "none", 
                 zIndex: 100, display: "flex", alignItems: "center", gap: 10, width: "max-content"
               }}
             >
               <ShoppingCart size={20} /> ADD {selectedForShop.length} TO SHOP
             </button>
           )}
        </div>
      )}
    </div>
  );
}