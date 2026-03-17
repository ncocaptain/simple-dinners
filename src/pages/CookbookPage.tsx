import { useState, useEffect } from "react";
import { ShoppingCart, CheckCircle2, Plus, X, Link as LinkIcon } from "lucide-react"; 
import { formatIngredients } from "../core/utils";
import Card from "../components/Card";

export default function CookbookPage({ cookbook, setCookbook, extraIngredients, setExtraIngredients, pantry }: any) {
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null); 
  const [selectedForShop, setSelectedForShop] = useState<string[]>([]);
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualRecipe, setManualRecipe] = useState({ name: "", ingredients: "", instructions: "" });

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

  // --- HANDLERS ---
  const toggleForShop = (ing: string) => {
    setSelectedForShop(prev => prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]);
  };

  const handleAddToShop = () => {
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
        alert("Recipe imported!");
      } else { 
        alert(data.error || "Failed to import."); 
      }
    } catch (err) { 
      alert("Connection error. Ensure api/import-recipe.js is deployed."); 
    } finally { 
      setIsImporting(false); 
    }
  };

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRecipe.name.trim()) {
      alert("Please enter a recipe name.");
      return;
    }
    const newRecipe = {
      ...manualRecipe,
      photoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
      effort: "normal" as const
    };
    setCookbook([...cookbook, newRecipe]);
    setManualRecipe({ name: "", ingredients: "", instructions: "" });
    setShowManual(false);
    alert("Recipe saved!");
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: "0 20px 120px 20px" }}>
      <div style={{ maxWidth: '550px', width: '100%' }}>
        <header style={{ textAlign: "center", margin: "20px 0" }}>
          <h2 style={{ fontSize: 32, fontWeight: 1000, margin: 0 }}>Cookbook</h2>
        </header>

        {/* --- SINGLE TOOLBAR (Magic Import + Manual Toggle) --- */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <Card style={{ flex: 1, padding: 0 }}>
             <form onSubmit={handleImport} style={{ display: "flex", alignItems: 'center', position: 'relative' }}>
                <LinkIcon size={18} style={{ position: 'absolute', left: 12, opacity: 0.4 }} />
                <input 
                  placeholder="Paste URL..." 
                  value={importUrl} 
                  onChange={e => setImportUrl(e.target.value)} 
                  style={{ 
                    flex: 1, background: 'none', border: 'none', color: 'white', 
                    padding: '14px 14px 14px 40px', outline: 'none', fontSize: 14 
                  }} 
                />
                <button type="submit" disabled={isImporting} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: 8, padding: '0 15px', fontWeight: 800, height: '100%' }}>
                  {isImporting ? "..." : "IMPORT"}
                </button>
             </form>
          </Card>
          <button 
            onClick={() => setShowManual(!showManual)} 
            style={{ 
              background: showManual ? '#ef4444' : 'rgba(255,255,255,0.1)', 
              border: 'none', color: 'white', borderRadius: 12, width: 50, 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}
          >
            {showManual ? <X size={24} /> : <Plus size={24} />}
          </button>
        </div>

        {/* --- MANUAL FORM --- */}
        {showManual && (
          <Card style={{ marginBottom: 24 }}>
            <form onSubmit={handleManualSave} style={{ display: 'grid', gap: 12 }}>
              <input 
                placeholder="Recipe Name" 
                value={manualRecipe.name} 
                onChange={e => setManualRecipe({...manualRecipe, name: e.target.value})} 
                style={{ padding: 14, borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 600 }} 
              />
              <textarea 
                placeholder="Ingredients (one per line)" 
                value={manualRecipe.ingredients} 
                onChange={e => setManualRecipe({...manualRecipe, ingredients: e.target.value})} 
                style={{ padding: 14, borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: 100, fontSize: 14 }} 
              />
              <textarea 
                placeholder="Instructions..." 
                value={manualRecipe.instructions} 
                onChange={e => setManualRecipe({...manualRecipe, instructions: e.target.value})} 
                style={{ padding: 14, borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: 100, fontSize: 14 }} 
              />
              <button type="submit" style={{ padding: 16, background: '#22c55e', color: 'white', border: 'none', borderRadius: 12, fontWeight: 900, cursor: 'pointer' }}>
                SAVE TO COOKBOOK
              </button>
            </form>
          </Card>
        )}

        {/* --- RECIPE LIST --- */}
        <div style={{ display: 'grid', gap: 12 }}>
          {cookbook.map((recipe: any) => (
            <div key={recipe.name} onClick={() => setSelectedRecipe(recipe)} style={{ cursor: 'pointer' }}>
              <Card style={{ padding: '16px' }}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{recipe.name}</div>
              </Card>
            </div>
          ))}
        </div>

        {/* --- DETAIL OVERLAY --- */}
        {selectedRecipe && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0f172a', zIndex: 2000, padding: 20, overflowY: 'auto' }}>
            <button 
              onClick={() => setSelectedRecipe(null)} 
              style={{ position: 'absolute', right: 20, top: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: 10, borderRadius: '50%', zIndex: 2001 }}
            >
              <X />
            </button>
            
            <h2 style={{ fontSize: 28, fontWeight: 900, marginTop: 40, paddingRight: 40, color: '#fff' }}>
              {selectedRecipe.name}
            </h2>
            
            <p style={{ fontSize: 13, opacity: 0.5, marginBottom: 20, fontWeight: 600 }}>
              SELECT ITEMS TO ADD TO YOUR SHOPPING LIST:
            </p>

            <div style={{ display: "grid", gap: 10 }}>
              {selectedRecipe.ingredients.split('\n').filter(Boolean).map((ing: string, i: number) => {
                const isSelected = selectedForShop.includes(ing);
                return (
                  <div 
                    key={i} 
                    onClick={() => toggleForShop(ing)} 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 12, 
                      padding: "16px", 
                      borderRadius: "16px", 
                      background: isSelected ? "rgba(34, 197, 94, 0.15)" : "rgba(255,255,255,0.03)", 
                      border: isSelected ? "1px solid #22c55e" : "1px solid rgba(255,255,255,0.08)", 
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: 'pointer' 
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: '6px', 
                      border: isSelected ? 'none' : '2px solid rgba(255,255,255,0.2)',
                      background: isSelected ? '#22c55e' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isSelected && <CheckCircle2 size={16} color="white" />}
                    </div>

                    <span style={{ 
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)',
                      fontSize: 15
                    }}>
                      {formatIngredients(ing)}
                    </span>
                  </div>
                );
              })}
            </div>

            {selectedForShop.length > 0 && (
              <button 
                onClick={handleAddToShop} 
                style={{ 
                  position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)", 
                  background: "#22c55e", color: "white", padding: "18px 36px", borderRadius: "40px", 
                  fontWeight: 900, border: "none", zIndex: 2002, display: "flex", alignItems: "center", 
                  gap: 12, width: "max-content", 
                  boxShadow: '0 15px 30px rgba(34, 197, 94, 0.4)'
                }}
              >
                <ShoppingCart size={20} /> 
                ADD {selectedForShop.length} ITEMS TO LIST
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}