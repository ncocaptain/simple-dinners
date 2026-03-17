import { useState, useEffect } from "react";
// Removed 'Plus' to fix TS6133
import { ShoppingCart, CheckCircle2, Circle, Link as LinkIcon } from "lucide-react"; 
import { formatIngredients } from "../core/utils";
import Card from "../components/Card";

export default function CookbookPage({ 
  cookbook,
  setCookbook,
  extraIngredients, 
  setExtraIngredients, 
  pantry 
}: any) {
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null); 
  const [selectedForShop, setSelectedForShop] = useState<string[]>([]);
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // --- FUNCTIONS (Fixes TS2304) ---
  const toggleForShop = (ing: string) => {
    setSelectedForShop(prev => 
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  };

  const handleAddToShop = () => {
    // Uses extraIngredients and setExtraIngredients (Fixes TS6133)
    const currentList = new Set(extraIngredients);
    selectedForShop.forEach(item => currentList.add(item.trim()));
    
    setExtraIngredients(Array.from(currentList));
    setSelectedForShop([]); 
    alert(`${selectedForShop.length} items added to Shop!`);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl.trim()) return;
    setIsImporting(true);
    try {
      const response = await fetch('/api/import-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl }),
      });
      const data = await response.json();
      if (data.recipe) {
        setCookbook([...cookbook, data.recipe]);
        setImportUrl("");
      } else {
        alert(data.error || "Failed to import.");
      }
    } catch (err) {
      alert("Error connecting to scraper.");
    } finally {
      setIsImporting(false);
    }
  };

  // --- SMART-SELECT LOGIC ---
  useEffect(() => {
    if (selectedRecipe) {
      const ings = (selectedRecipe.ingredients || "").split('\n').filter(Boolean);
      const missing = ings.filter((ing: string) => 
        !pantry.some((p: any) => ing.toLowerCase().includes(p.name.toLowerCase()))
      );
      setSelectedForShop(missing);
    }
  }, [selectedRecipe, pantry]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: "0 20px 120px 20px" }}>
      <div style={{ maxWidth: '550px', width: '100%' }}>
        
        <header style={{ textAlign: "center", margin: "20px 0" }}>
          <h2 style={{ fontSize: 32, fontWeight: 1000, margin: 0 }}>Cookbook</h2>
          <p style={{ opacity: 0.5, fontSize: 14 }}>{cookbook.length} recipes saved</p>
        </header>

        <Card style={{ marginBottom: 24 }}>
          <form onSubmit={handleImport} style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <LinkIcon size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
              <input 
                placeholder="Paste recipe URL here..." 
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                style={{ 
                  width: '100%', padding: "12px 12px 12px 40px", borderRadius: "12px", 
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", 
                  color: "white", outline: "none" 
                }}
              />
            </div>
            <button 
              type="submit"
              disabled={isImporting}
              style={{ padding: "0 20px", borderRadius: "12px", background: "#22c55e", border: "none", color: "white", fontWeight: 800 }}
            >
              {isImporting ? "..." : "IMPORT"}
            </button>
          </form>
        </Card>

        {/* --- LIST --- */}
        <div style={{ display: 'grid', gap: 12 }}>
          {cookbook.map((recipe: any) => (
            <Card key={recipe.name} onClick={() => setSelectedRecipe(recipe)} style={{ cursor: 'pointer' }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{recipe.name}</div>
            </Card>
          ))}
        </div>

        {/* --- OVERLAY --- */}
        {selectedRecipe && (
          <div className="recipe-overlay" style={{ marginTop: 40, padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>{selectedRecipe.name}</h2>
              <button onClick={() => setSelectedRecipe(null)} style={{ color: 'white', background: 'rgba(255,255,255,0.1)', border: 'none', padding: '8px 12px', borderRadius: 8 }}>Close</button>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {selectedRecipe.ingredients.split('\n').filter(Boolean).map((ing: string, i: number) => {
                const isSelected = selectedForShop.includes(ing);
                return (
                  <div 
                    key={i} 
                    onClick={() => toggleForShop(ing)}
                    style={{ 
                      display: "flex", alignItems: "center", gap: 12, padding: "14px", 
                      borderRadius: "14px", background: isSelected ? "rgba(34, 197, 94, 0.1)" : "rgba(255,255,255,0.05)",
                      border: isSelected ? "1px solid #22c55e" : "1px solid rgba(255,255,255,0.1)",
                      cursor: 'pointer'
                    }}
                  >
                    {isSelected ? <CheckCircle2 size={20} color="#22c55e" /> : <Circle size={20} style={{ opacity: 0.2 }} />}
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
                  fontWeight: 900, border: "none", zIndex: 100, display: "flex", alignItems: "center", gap: 10
                }}
              >
                <ShoppingCart size={20} /> ADD {selectedForShop.length} TO SHOP
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}