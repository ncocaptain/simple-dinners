import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star, Pencil, Trash2, BookOpen, Plus, X, Printer, Share2,
  Download, Save, Loader2, Image as ImageIcon, BookUser,
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

import { uploadImageToCloudinary } from "../utils/uploadImage";
import { PUBLIC_APP_URL } from "../core/appConfig";

// =====================================================
// Types & Shared Components
// =====================================================

type CookbookEntry = Meal & {
  id: string;
  slug?: string;
  favorite?: boolean;
  createdAt?: number;
  updatedAt?: number;
  tags?: string[];
  effort?: "quick" | "normal" | "big";
  notes?: string;
};

function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "good" | "warn" | "bad" }) {
  const bg = tone === "good" ? "rgba(34,197,94,.16)" : tone === "warn" ? "rgba(245,158,11,.18)" : tone === "bad" ? "rgba(239,68,68,.16)" : "rgba(148,163,184,.18)";
  const border = tone === "good" ? "rgba(34,197,94,.35)" : tone === "warn" ? "rgba(245,158,11,.35)" : tone === "bad" ? "rgba(239,68,68,.35)" : "rgba(148,163,184,.30)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: bg, border: `1px solid ${border}`, lineHeight: 1.2, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

const fallbackPhotoUrl = (name?: string) => {
  const q = encodeURIComponent((name || "dinner").trim());
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80&sig=1&meal=${q}`;
};

const slugify = (val: string) => val.trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
const parseTags = (val: string) => val.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);

export default function CookbookPage({ setMeals, cookbook, setCookbook, prefs }: { 
  setMeals: React.Dispatch<React.SetStateAction<Record<string, Meal>>>; 
  cookbook: CookbookEntry[]; 
  setCookbook: React.Dispatch<React.SetStateAction<CookbookEntry[]>>; 
  prefs: Preferences; 
}) {
  const toastApi: any = useToast();
  const toast: any = toastApi.toast ?? toastApi;
  const { base } = useInputStyles();
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<CookbookEntry>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [cookbookSearch, setCookbookSearch] = useState("");
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customIngredients, setCustomIngredients] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");
  const [isCustomUploading, setIsCustomUploading] = useState(false);
  const [customTags, setCustomTags] = useState("");
  const [customEffort, setCustomEffort] = useState<"quick" | "normal" | "big">("quick");

  const normalizeEntry = useCallback((r: any): CookbookEntry => {
    const id = String(r?.id ?? r?.slug ?? r?.name ?? Math.random().toString(36).slice(2));
    return { 
      ...r, id, slug: r?.slug ?? r?.id ?? id, 
      favorite: Boolean(r?.favorite), 
      createdAt: r?.createdAt ?? Date.now(), 
      updatedAt: r?.updatedAt ?? Date.now(), 
      name: r?.name ?? "Untitled", 
      ingredients: r?.ingredients ?? "", 
      instructions: r?.instructions ?? "", 
      photoUrl: r?.photoUrl ?? "", 
      tags: r?.tags ?? [], 
      effort: r?.effort ?? "normal", 
      notes: r?.notes ?? "" 
    };
  }, []);

  const filteredCookbook = useMemo(() => {
    const q = normalize(cookbookSearch);
    let list = Array.isArray(cookbook) ? cookbook.map(normalizeEntry) : [];
    if (q) list = list.filter(r => normalize(r.name).includes(q) || normalize(r.ingredients).includes(q) || normalize(r.notes ?? "").includes(q));
    if (prefs.vegetarian) list = list.filter(r => isVegetarianByHeuristic(r.ingredients));
    list = list.filter(r => !violatesAllergens(r.ingredients, prefs.allergens || []));
    return list.sort((a, b) => (a.favorite !== b.favorite ? (a.favorite ? -1 : 1) : (b.updatedAt || 0) - (a.updatedAt || 0)));
  }, [cookbook, cookbookSearch, prefs, normalizeEntry]);

  const onImportRecipe = async () => {
    if (!importUrl.trim()) { toast("Please enter a URL first.", "warning"); return; }
    try {
      setIsImporting(true);
      const res = await fetch("https://dinners.ncocaptain.com/api/scrape-recipe", { 
        method: "POST", 
        headers: { 
          "Accept": "application/json",
          "Content-Type": "application/json" 
        }, 
        body: JSON.stringify({ url: importUrl.trim() }) 
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      const imported = data.recipe;
      setCustomName(imported.name || ""); 
      setCustomIngredients(imported.ingredients || ""); 
      setCustomInstructions(imported.instructions || ""); 
      setCustomPhotoUrl(imported.photoUrl || "");

      setShowImport(false); 
      setShowAddRecipe(true); 
      setImportUrl(""); 
      toast("Imported!", "success");
    } catch (err: any) { 
      toast(err.message || "Failed to connect to server.", "error"); 
    } finally { 
      setIsImporting(false); 
    }
  };

  const onSaveEdit = () => {
    if (!editDraft.name || !editDraft.ingredients) { toast("Name and ingredients required", "warning"); return; }
    setCookbook((prev) => {
      const next = prev.map((r) => r.id === editingId ? { ...r, ...editDraft, updatedAt: Date.now() } : r);
      persistCookbook(next as any);
      return next;
    });
    setEditingId(null); setEditDraft({}); toast("Updated!", "success");
  };

  const onAddCustomRecipe = () => {
    if (!customName || !customIngredients) { toast("Name and ingredients required.", "warning"); return; }
    const meal = { id: crypto.randomUUID(), slug: slugify(customName), name: customName, ingredients: customIngredients, instructions: customInstructions, notes: customNotes, photoUrl: customPhotoUrl, tags: parseTags(customTags), effort: customEffort };
    const saved = upsertRecipeFromMeal(meal as Meal);
    setCookbook(prev => { 
      const next = [normalizeEntry(saved), ...prev]; 
      persistCookbook(next as any); 
      return next; 
    });
    setShowAddRecipe(false); setCustomName(""); setCustomIngredients(""); setCustomInstructions(""); setCustomNotes(""); setCustomPhotoUrl(""); setCustomTags(""); setCustomEffort("quick"); toast("Saved!", "success");
  };

  const actionBtn: React.CSSProperties = { padding: "8px 10px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#f8fafc", cursor: "pointer", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 8 };

  return (
    <Card title={<><BookOpen size={20} /> Cookbook</>} subtitle="Manage your saved recipes.">
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input placeholder="Search recipes or notes..." value={cookbookSearch} onChange={(e) => setCookbookSearch(e.target.value)} style={{ ...base, flex: 1 }} />
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <Button variant="secondary" onClick={() => { setShowAddRecipe(!showAddRecipe); setShowImport(false); }}>
          {showAddRecipe ? <X size={16} /> : <Plus size={16} />} {showAddRecipe ? "Close" : "Add Your Own"}
        </Button>
        <Button variant="secondary" onClick={() => { setShowImport(!showImport); setShowAddRecipe(false); }}>
          {showImport ? <X size={16} /> : <Download size={16} />} {showImport ? "Close" : "Import"}
        </Button>
      </div>

      {showImport && (
        <div style={{ display: "flex", gap: 10, padding: 14, borderRadius: 16, background: "rgba(2,6,23,0.25)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 20 }}>
          <input placeholder="Paste URL..." value={importUrl} onChange={(e) => setImportUrl(e.target.value)} style={{ ...base, flex: 1 }} />
          <Button onClick={onImportRecipe} disabled={isImporting}>{isImporting ? <Loader2 size={16} className="animate-spin" /> : "Go"}</Button>
        </div>
      )}

      {showAddRecipe && (
        <div style={{ display: "grid", gap: 10, padding: 16, borderRadius: 16, background: "rgba(2,6,23,0.25)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 20 }}>
          <input placeholder="Recipe Name" value={customName} onChange={(e) => setCustomName(e.target.value)} style={base} />
          <textarea placeholder="Ingredients (one per line)" value={customIngredients} onChange={(e) => setCustomIngredients(e.target.value)} style={{ ...base, minHeight: 80 }} />
          <textarea placeholder="Instructions" value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} style={{ ...base, minHeight: 80 }} />
          
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
             <BookUser size={18} className="opacity-70" />
             <label style={{ fontSize: 13, fontWeight: 800, opacity: 0.9 }}>Notes (Private)</label>
          </div>
          <textarea placeholder="Add private notes..." value={customNotes} onChange={(e) => setCustomNotes(e.target.value)} style={{ ...base, minHeight: 60 }} />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input placeholder="Tags (kids, grilled...)" value={customTags} onChange={(e) => setCustomTags(e.target.value)} style={base} />
            <select value={customEffort} onChange={(e) => setCustomEffort(e.target.value as any)} style={base}>
              <option value="quick">Effort: Quick</option>
              <option value="normal">Effort: Normal</option>
              <option value="big">Effort: Big Project</option>
            </select>
          </div>
          
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label style={{ ...actionBtn, background: isCustomUploading ? "rgba(255,255,255,0.03)" : actionBtn.background }}>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => { 
                const file = e.target.files?.[0]; 
                if(file) { setIsCustomUploading(true); setCustomPhotoUrl(await uploadImageToCloudinary(file)); setIsCustomUploading(false); }
              }} />
              <ImageIcon size={14} /> {customPhotoUrl ? "Photo Added!" : "Upload Photo"}
            </label>
            {isCustomUploading && <Loader2 size={16} className="animate-spin" />}
          </div>
          <Button onClick={onAddCustomRecipe}>Save to Cookbook</Button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {filteredCookbook.map((r) => {
          const rid = r.id; const isEditing = editingId === rid;
          const navUrl = `/recipe/${encodeURIComponent(r.slug || r.id)}?from=/cookbook`;
          
          return (
            <Card key={rid} style={{ padding: 0, overflow: "hidden" }}>
              {isEditing ? (
                <div style={{ padding: 16, display: "grid", gap: 10 }}>
                  <input style={base} value={editDraft.name || ""} onChange={e => setEditDraft({ ...editDraft, name: e.target.value })} />
                  <textarea style={{ ...base, minHeight: 80 }} value={editDraft.ingredients || ""} onChange={e => setEditDraft({ ...editDraft, ingredients: e.target.value })} />
                  <textarea style={{ ...base, minHeight: 60 }} value={editDraft.notes || ""} onChange={e => setEditDraft({ ...editDraft, notes: e.target.value })} placeholder="Private notes..." />
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <input placeholder="Tags" value={Array.isArray(editDraft.tags) ? editDraft.tags.join(", ") : ""} onChange={e => setEditDraft({ ...editDraft, tags: parseTags(e.target.value) })} style={base} />
                    <select value={editDraft.effort || "normal"} onChange={e => setEditDraft({ ...editDraft, effort: e.target.value as any })} style={base}>
                      <option value="quick">Quick</option>
                      <option value="normal">Normal</option>
                      <option value="big">Big</option>
                    </select>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <label style={{ ...actionBtn }}>
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if(file) { setIsUploading(true); const url = await uploadImageToCloudinary(file); setEditDraft(prev => ({ ...prev, photoUrl: url })); setIsUploading(false); }
                      }} />
                      <ImageIcon size={14} /> Swap Photo
                    </label>
                    {isUploading && <Loader2 size={16} className="animate-spin" />}
                  </div>
                  
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button onClick={onSaveEdit} disabled={isUploading}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
                      </span>
                    </Button>
                    <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <img src={r.photoUrl || fallbackPhotoUrl(r.name)} alt={r.name} onClick={() => navigate(navUrl)} style={{ width: "100%", height: 160, objectFit: "cover", display: "block", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.08)" }} />
                  <div style={{ padding: 16, display: "grid", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 900, fontSize: 18, cursor: "pointer" }} onClick={() => navigate(navUrl)}>{r.name}</div>
                      <button onClick={() => { const next = cookbook.map(x => x.id === rid ? { ...x, favorite: !x.favorite } : x); setCookbook(next); persistCookbook(next as any); }} style={{ background: "none", border: "none", cursor: "pointer" }}>
                        <Star size={18} fill={r.favorite ? "#facc15" : "none"} stroke={r.favorite ? "#facc15" : "currentColor"} />
                      </button>
                    </div>
                    
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {violatesAllergens(r.ingredients, prefs.allergens || []) ? <Badge tone="bad">Allergens</Badge> : <Badge tone="good">Safe</Badge>}
                      {isVegetarianByHeuristic(r.ingredients) && <Badge tone="good">Veg</Badge>}
                      {r.effort && <Badge tone="warn">{r.effort}</Badge>}
                      {r.notes && <Badge tone="good"><BookUser size={12}/> Notes</Badge>}
                    </div>
                    
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button style={actionBtn} onClick={() => navigate(navUrl)}><BookOpen size={14} /> Open</button>
                      <button style={actionBtn} onClick={() => navigate(`${navUrl}&print=1`)}><Printer size={14} /></button>
                      <button style={actionBtn} onClick={async () => { await navigator.clipboard.writeText(`${PUBLIC_APP_URL}/recipe/${r.slug || r.id}`); toast("Copied Link!"); }}><Share2 size={14} /></button>
                      <button style={actionBtn} onClick={() => { setEditingId(rid); setEditDraft({...r}); }}><Pencil size={14} /></button>
                      <button style={{ ...actionBtn, background: "rgba(239,68,68,0.1)" }} onClick={() => { if(window.confirm("Delete recipe?")){ const next = cookbook.filter(x => x.id !== rid); setCookbook(next); persistCookbook(next as any); }}}><Trash2 size={14} /></button>
                    </div>
                    
                    <select style={{ ...base, width: "100%", fontSize: 13 }} defaultValue="" onChange={e => { setMeals(prev => ({ ...prev, [e.target.value]: { ...r } })); toast(`Added to ${e.target.value}`); e.target.value = ""; }}>
                      <option value="" disabled>Plan for...</option>
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </Card>
  );
}