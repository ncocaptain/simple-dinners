import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star, Trash2, BookOpen, Plus, X, Download, Loader2, 
  Printer, Share2, Pencil, BookUser, ChevronDown, ChevronUp 
} from "lucide-react";

import { normalize, violatesAllergens, isVegetarianByHeuristic } from "../core/planner";
import type { Meal, Preferences } from "../core/types";
import { days } from "../core/data";
import { upsertRecipeFromMeal } from "../core/recipeStore";
import { setCookbook as persistCookbook } from "../core/cookbookStore";

import Button from "../components/Button";
import Card from "../components/Card";
import { useInputStyles } from "../components/inputStyles";
import { useToast } from "../components/Toast";
import { PUBLIC_APP_URL } from "../core/appConfig";

// =====================================================
// Helpers & Sub-components
// =====================================================

function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "good" | "warn" | "bad" }) {
  const bg = tone === "good" ? "rgba(34,197,94,.16)" : tone === "warn" ? "rgba(245,158,11,.18)" : tone === "bad" ? "rgba(239,68,68,.16)" : "rgba(148,163,184,.18)";
  const border = tone === "good" ? "rgba(34,197,94,.35)" : tone === "warn" ? "rgba(245,158,11,.35)" : tone === "bad" ? "rgba(239,68,68,.35)" : "rgba(148,163,184,.30)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: bg, border: `1px solid ${border}`, lineHeight: 1.2, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function scaleIngredients(text: string, factor: number) {
  if (factor === 1) return text;
  return text.replace(/(\d+[\d\/\.]*)/g, (match) => {
    if (match.includes('/')) {
      const [num, den] = match.split('/').map(Number);
      return ((num / den) * factor).toFixed(2).replace(/\.00$/, '');
    }
    const val = parseFloat(match);
    return isNaN(val) ? match : (val * factor).toString();
  });
}

const fallbackPhotoUrl = (name?: string) => {
  const q = encodeURIComponent((name || "dinner").trim());
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80&sig=1&meal=${q}`;
};

const slugify = (val: string) => val.trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

export default function CookbookPage({ setMeals, cookbook, setCookbook, prefs }: { 
  setMeals: React.Dispatch<React.SetStateAction<Record<string, Meal>>>; 
  cookbook: any[]; 
  setCookbook: React.Dispatch<React.SetStateAction<any[]>>; 
  prefs: Preferences; 
}) {
  const toastApi: any = useToast();
  const toast: any = toastApi.toast ?? toastApi;
  const { base } = useInputStyles();
  const navigate = useNavigate();

  const [cookbookSearch, setCookbookSearch] = useState("");
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState<Record<string, number>>({});

  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  
  const [customName, setCustomName] = useState("");
  const [customIngredients, setCustomIngredients] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");

  const normalizeEntry = useCallback((r: any) => {
    const id = String(r?.id ?? r?.slug ?? r?.name ?? Math.random().toString(36).slice(2));
    return { 
      ...r, id, slug: r?.slug ?? r?.id ?? id, 
      favorite: Boolean(r?.favorite), 
      createdAt: r?.createdAt ?? Date.now(), 
      updatedAt: r?.updatedAt ?? Date.now(), 
      name: r?.name ?? "Untitled", 
      ingredients: r?.ingredients ?? "", 
      instructions: r?.instructions ?? "", 
      photoUrl: r?.photoUrl ?? ""
    };
  }, []);

  const filteredCookbook = useMemo(() => {
    const q = normalize(cookbookSearch);
    let list = Array.isArray(cookbook) ? cookbook.map(normalizeEntry) : [];
    if (q) list = list.filter(r => normalize(r.name).includes(q) || normalize(r.ingredients).includes(q));
    if (prefs.vegetarian) list = list.filter(r => isVegetarianByHeuristic(r.ingredients));
    list = list.filter(r => !violatesAllergens(r.ingredients, prefs.allergens || []));
    return list.sort((a, b) => (a.favorite !== b.favorite ? (a.favorite ? -1 : 1) : (b.updatedAt || 0) - (a.updatedAt || 0)));
  }, [cookbook, cookbookSearch, prefs, normalizeEntry]);

  const onImportRecipe = async () => {
    if (!importUrl.trim()) { toast("Please enter a URL first.", "warning"); return; }
    try {
      setIsImporting(true);
      const res = await fetch("https://dinners.ncocaptain.com/api/import-recipe", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl.trim() }) 
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Import failed");

      setCustomName(data.recipe.name || ""); 
      setCustomIngredients(data.recipe.ingredients || ""); 
      setCustomInstructions(data.recipe.instructions || ""); 
      setCustomPhotoUrl(data.recipe.photoUrl || "");

      setShowImport(false); 
      setShowAddRecipe(true); 
      toast("Recipe Found!", "success");
    } catch (err: any) { 
      toast(err.message || "Connection failed.", "error"); 
    } finally { 
      setIsImporting(false); 
    }
  };

  const onAddCustomRecipe = () => {
    if (!customName || !customIngredients) { toast("Name and ingredients required.", "warning"); return; }
    const mealId = editingId || crypto.randomUUID();
    const meal = { id: mealId, slug: slugify(customName), name: customName, ingredients: customIngredients, instructions: customInstructions, photoUrl: customPhotoUrl, updatedAt: Date.now() };
    const saved = upsertRecipeFromMeal(meal as Meal);
    setCookbook(prev => { 
      const next = editingId ? prev.map(r => r.id === editingId ? normalizeEntry(saved) : r) : [normalizeEntry(saved), ...prev];
      persistCookbook(next as any); return next; 
    });
    setShowAddRecipe(false); setEditingId(null); setCustomName(""); setCustomIngredients(""); setCustomInstructions(""); setCustomPhotoUrl(""); 
    toast(editingId ? "Updated!" : "Saved!", "success");
  };

  const actionBtn: React.CSSProperties = { padding: "8px 10px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#f8fafc", cursor: "pointer", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 8 };

  return (
    <Card title={<><BookOpen size={20} /> Cookbook</>} subtitle="Manage your saved recipes.">
      
      <div style={{ display: "grid", gap: 16, marginBottom: 24 }}>
        <input placeholder="Search recipes..." value={cookbookSearch} onChange={(e) => setCookbookSearch(e.target.value)} style={{ ...base, flex: 1 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="secondary" onClick={() => { setShowAddRecipe(!showAddRecipe); setShowImport(false); setEditingId(null); setCustomName(""); setCustomIngredients(""); setCustomInstructions(""); setCustomPhotoUrl(""); }}>
            {showAddRecipe ? <X size={16} /> : <Plus size={16} />} {showAddRecipe ? "Close" : "Add Your Own"}
          </Button>
          <Button variant="secondary" onClick={() => { setShowImport(!showImport); setShowAddRecipe(false); }}>
            {showImport ? <X size={16} /> : <Download size={16} />} {showImport ? "Close" : "Import"}
          </Button>
        </div>
      </div>

      {showImport && (
        <div style={{ display: "flex", gap: 10, padding: 14, borderRadius: 16, background: "rgba(2,6,23,0.25)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 20 }}>
          <input placeholder="Paste URL..." value={importUrl} onChange={(e) => setImportUrl(e.target.value)} style={{ ...base, flex: 1 }} />
          <Button onClick={onImportRecipe} disabled={isImporting}>{isImporting ? <Loader2 size={16} className="animate-spin" /> : "Go"}</Button>
        </div>
      )}

      {showAddRecipe && (
        <div style={{ display: "grid", gap: 10, padding: 16, borderRadius: 16, background: "rgba(2,6,23,0.25)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 900, marginBottom: 4 }}>{editingId ? "Edit Recipe" : "New Recipe"}</h3>
          <input placeholder="Recipe Name" value={customName} onChange={(e) => setCustomName(e.target.value)} style={base} />
          <textarea placeholder="Ingredients" value={customIngredients} onChange={(e) => setCustomIngredients(e.target.value)} style={{ ...base, minHeight: 80 }} />
          <textarea placeholder="Instructions" value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} style={{ ...base, minHeight: 80 }} />
          <Button onClick={onAddCustomRecipe}>{editingId ? "Update Recipe" : "Save to Cookbook"}</Button>
        </div>
      )}

      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px", padding: "0 20px 40px 20px", width: "100%", maxWidth: "1200px", boxSizing: "border-box", justifyContent: "center" }}>
          {filteredCookbook.map((r) => {
            const rid = r.id;
            const navUrl = `/recipe/${encodeURIComponent(r.slug || r.id)}?from=/cookbook`;
            const isExpanded = expandedId === rid;
            const currentMult = multiplier[rid] || 1;

            return (
              <Card key={rid} style={{ padding: 0, overflow: "hidden", borderRadius: "24px", width: "100%", margin: "0 auto", border: "1px solid rgba(255,255,255,0.08)" }}>
                <img src={r.photoUrl || fallbackPhotoUrl(r.name)} alt={r.name} onClick={() => navigate(navUrl)} style={{ width: "100%", height: 180, objectFit: "cover", display: "block", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.08)" }} />

                <div style={{ padding: "24px 20px", display: "grid", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, minHeight: "52px" }}>
                    <div style={{ fontWeight: 900, fontSize: "20px", lineHeight: "1.2", cursor: "pointer", color: "#f8fafc" }} onClick={() => navigate(navUrl)}>{r.name}</div>
                    <button onClick={() => { const next = cookbook.map(x => x.id === rid ? { ...x, favorite: !x.favorite } : x); setCookbook(next); persistCookbook(next as any); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                      <Star size={22} fill={r.favorite ? "#facc15" : "none"} stroke={r.favorite ? "#facc15" : "currentColor"} />
                    </button>
                  </div>
                  
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {violatesAllergens(r.ingredients, prefs.allergens || []) ? <Badge tone="bad">Allergens</Badge> : <Badge tone="good">Safe</Badge>}
                    {isVegetarianByHeuristic(r.ingredients) && <Badge tone="good">Veg</Badge>}
                    {r.effort && <Badge tone="warn">{r.effort}</Badge>}
                    {/* FIXED: Added BookUser Badge */}
                    {r.notes && <Badge tone="good"><BookUser size={12}/> Notes</Badge>}
                  </div>
                  
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
                    <button style={actionBtn} onClick={() => setExpandedId(isExpanded ? null : rid)}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Details
                    </button>
                    
                    <button style={actionBtn} onClick={() => navigate(navUrl)}>
                      <BookOpen size={14} />
                    </button>

                    {/* FIXED: Added Printer Action */}
                    <button style={actionBtn} onClick={() => navigate(`${navUrl}&print=1`)}>
                      <Printer size={14} />
                    </button>

                    {/* FIXED: Added Share2 Action with PUBLIC_APP_URL */}
                    <button 
                      style={actionBtn} 
                      onClick={async () => { 
                        await navigator.clipboard.writeText(`${PUBLIC_APP_URL}/recipe/${r.slug || r.id}`); 
                        toast("Copied Link!"); 
                      }}
                    >
                      <Share2 size={14} />
                    </button>

                    {/* FIXED: Added Pencil Action */}
                    <button 
                      style={actionBtn} 
                      onClick={() => { 
                        setEditingId(rid); 
                        setShowAddRecipe(true); 
                        setCustomName(r.name);
                        setCustomIngredients(r.ingredients);
                        setCustomInstructions(r.instructions);
                        setCustomPhotoUrl(r.photoUrl || "");
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <Pencil size={14} />
                    </button>

                    <button style={{ ...actionBtn, background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.2)" }} onClick={() => { if(window.confirm("Delete recipe?")){ const next = cookbook.filter(x => x.id !== rid); setCookbook(next); persistCookbook(next as any); } }}><Trash2 size={14} /></button>
                  </div>

                  {/* EXPANDABLE MULTIPLIER SECTION */}
                  {isExpanded && (
                    <div style={{ padding: "12px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.5)" }}>SCALE:</span>
                        {[1, 2, 3].map(m => (
                          <button key={m} onClick={() => setMultiplier(prev => ({ ...prev, [rid]: m }))} style={{ padding: "4px 8px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 900, background: currentMult === m ? "#22c55e" : "rgba(255,255,255,0.05)", color: currentMult === m ? "#fff" : "rgba(255,255,255,0.5)" }}>{m}x</button>
                        ))}
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.5, color: "rgba(248,250,252,0.8)", whiteSpace: "pre-wrap" }}>
                        {scaleIngredients(r.ingredients, currentMult)}
                      </div>
                    </div>
                  )}
                  
                  <select style={{ ...base, width: "100%", fontSize: 14, height: "42px", marginTop: "4px" }} defaultValue="" onChange={e => { setMeals(prev => ({ ...prev, [e.target.value]: { ...r, ingredients: scaleIngredients(r.ingredients, currentMult) } })); toast(`Added to ${e.target.value}`); e.target.value = ""; }}>
                    <option value="" disabled>Plan for...</option>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Card>
  );
}