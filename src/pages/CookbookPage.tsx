import { useState, useEffect } from "react";
import { ShoppingCart, CheckCircle2, Circle, Plus, X, Link as LinkIcon } from "lucide-react"; 
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
      } else { alert(data.error || "Failed."); }
    } catch (err) { alert("Connection error."); } finally { setIsImporting(false); }
  };

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRecipe.name.trim()) {
      alert("Give your masterpiece a name first!");
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

        {/* --- TOOLS (Import + Toggle Manual) --- */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <Card style={{ flex: 1, padding: 0 }}>
             <form onSubmit={handleImport} style={{ display: "flex", padding: 8 }}>
                <input 
                  placeholder="Paste URL..." 
                  value={importUrl} 
                  onChange={e => setImportUrl(e.target.value)} 
                  style={{ flex: 1, background: 'none', border: 'none', color: 'white', padding: '10px', outline: 'none' }} 
                />
                <button type="submit" disabled={isImporting} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: 8, padding: '0 15px', fontWeight: 800 }}>
                  {isImporting ? "..." : "IMPORT"}
                </button>
             </form>
          </Card>
          <button 
            onClick={() => setShowManual(!showManual)} 
            style={{ 
              background: showManual ? '#ef4444' : 'rgba(255,255,255,0.1)', 
              border: 'none', color: 'white', borderRadius: 12, width: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}
          >
            {showManual ? <X size={24} /> : <Plus size={24} />}
          </button>
        </div>
        <Card style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
   <form onSubmit={handleImport} style={{ display: "flex", alignItems: 'center', position: 'relative' }}>
      {/* THE ICON IS BACK */}
      <LinkIcon 
        size={18} 
        style={{ position: 'absolute', left: 12, opacity: 0.4, pointerEvents: 'none' }} 
      />
      <input 
        placeholder="Paste URL..." 
        value={importUrl} 
        onChange={e => setImportUrl(e.target.value)} 
        style={{ 
          flex: 1, 
          background: 'none', 
          border: 'none', 
          color: 'white', 
          padding: '14px 14px 14px 40px', // Added 40px left padding to make room for the icon
          outline: 'none',
          fontSize: 14
        }} 
      />
      <button 
        type="submit" 
        disabled={isImporting} 
        style={{ 
          background: '#22c55e', 
          color: 'white', 
          border: 'none', 
          padding: '0 20px', 
          height: '100%',
          fontWeight: 900, 
          fontSize: 12,
          cursor: 'pointer'
        }}
      >
        {isImporting ? "..." : "IMPORT"}
      </button>
   </form>
</Card>

        {/* --- MANUAL FORM --- */}
        {showManual && (
          <Card style={{ marginBottom: 24 }}>
            <form onSubmit={handleManualSave} style={{ display: 'grid', gap: 12 }}>
              <input placeholder="Recipe Name" value={manualRecipe.name} onChange={e => setManualRecipe({...manualRecipe, name: e.target.value})} style={{ padding: 14, borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 600 }} />
              <textarea placeholder="Ingredients (one per line)" value={manualRecipe.ingredients} onChange={e => setManualRecipe({...manualRecipe, ingredients: e.target.value})} style={{ padding: 14, borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: 100, fontSize: 14 }} />
              <textarea placeholder="Cooking Instructions..." value={manualRecipe.instructions} onChange={e => setManualRecipe({...manualRecipe, instructions: e.target.value})} style={{ padding: 14, borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: 100, fontSize: 14 }} />
              <button type="submit" style={{ padding: 16, background: '#22c55e', color: 'white', border: 'none', borderRadius: 12, fontWeight: 900, cursor: 'pointer' }}>SAVE TO COOKBOOK</button>
            </form>
          </Card>
        )}

        {/* --- RECIPE LIST --- */}
        <div style={{ display: 'grid', gap: 12 }}>
          {cookbook.map((recipe: any) => (
            <div key={recipe.name} onClick={() => setSelectedRecipe(recipe)} style={{ cursor: 'pointer' }}>
              <Card style={{ padding: '16px' }}><div style={{ fontWeight: 800, fontSize: 18 }}>{recipe.name}</div></Card>
            </div>
          ))}
        </div>

        {/* --- DETAIL OVERLAY --- */}
        {selectedRecipe && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0f172a', zIndex: 2000, padding: 20, overflowY: 'auto' }}>
            <button onClick={() => setSelectedRecipe(null)} style={{ position: 'absolute', right: 20, top: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: 10, borderRadius: '50%', zIndex: 2001 }}><X /></button>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginTop: 40, paddingRight: 40 }}>{selectedRecipe.name}</h2>
            
            <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
              {selectedRecipe.ingredients.split('\n').filter(Boolean).map((ing: string, i: number) => {
                const isSelected = selectedForShop.includes(ing);
                return (
                  <div key={i} onClick={() => toggleForShop(ing)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px", borderRadius: "14px", background: isSelected ? "rgba(34, 197, 94, 0.1)" : "rgba(255,255,255,0.05)", border: isSelected ? "1px solid #22c55e" : "1px solid rgba(255,255,255,0.1)", cursor: 'pointer' }}>
                    {isSelected ? <CheckCircle2 size={20} color="#22c55e" /> : <Circle size={20} style={{ opacity: 0.2 }} />}
                    <span>{formatIngredients(ing)}</span>
                  </div>
                );
              })}
            </div>

            {selectedForShop.length > 0 && (
              <button onClick={handleAddToShop} style={{ position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)", background: "#22c55e", color: "white", padding: "16px 32px", borderRadius: "40px", fontWeight: 900, border: "none", zIndex: 2002, display: "flex", alignItems: "center", gap: 10, width: "max-content" }}>
                <ShoppingCart size={20} /> ADD {selectedForShop.length} TO SHOP
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}