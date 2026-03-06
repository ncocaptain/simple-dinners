import React from "react";
import { normalize } from "../core/planner";
import type { Meal, Preferences } from "../core/types";
import Button from "../components/Button";
import Card from "../components/Card";
import { useInputStyles } from "../components/inputStyles";
import { useToast } from "../components/Toast";
import { uploadImageToCloudinary } from "../utils/uploadImage";
import { days } from "../core/data";
import { upsertRecipeFromMeal } from "../core/recipeStore";
import { setCookbook as persistCookbook } from "../core/cookbookStore";
import { Star, Pencil, Trash2, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Printer, Share2 } from "lucide-react";
import { addIngredientsToList } from "../shoppingList";
import { ShoppingCart } from "lucide-react";
import { violatesAllergens, isVegetarianByHeuristic } from "../core/planner";

type CookbookEntry = Meal & {
  id: string; // make id required for stable keys/edits
  slug?: string;
  favorite?: boolean;
  createdAt?: number;
  updatedAt?: number;
};

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const bg =
    tone === "good"
      ? "rgba(34,197,94,.16)"
      : tone === "warn"
      ? "rgba(245,158,11,.18)"
      : tone === "bad"
      ? "rgba(239,68,68,.16)"
      : "rgba(148,163,184,.18)";

  const border =
    tone === "good"
      ? "rgba(34,197,94,.35)"
      : tone === "warn"
      ? "rgba(245,158,11,.35)"
      : tone === "bad"
      ? "rgba(239,68,68,.35)"
      : "rgba(148,163,184,.30)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        background: bg,
        border: `1px solid ${border}`,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function fallbackPhotoUrl(name?: string) {
  const q = encodeURIComponent((name || "dinner").trim());
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80&sig=1&meal=${q}`;
}

function decodeHtmlEntities(s: string) {
  if (!s) return s;
  return s
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function pickPhotoUrl(recipe: any): string {
  const candidate =
    recipe?.photoUrl ??
    recipe?.image ??
    recipe?.imageUrl ??
    recipe?.thumbnail ??
    recipe?.thumbnailUrl ??
    recipe?.ogImage ??
    recipe?.image_url ??
    recipe?.photo ??
    recipe?.images?.[0] ??
    recipe?.imageUrls?.[0];

  return typeof candidate === "string" && candidate.startsWith("http") ? candidate : "";
}

export default function CookbookPage({
  setMeals,
  cookbook,
  setCookbook,
  prefs,
}: {
  setMeals: React.Dispatch<React.SetStateAction<Record<string, Meal>>>;
  cookbook: CookbookEntry[];
  setCookbook: React.Dispatch<React.SetStateAction<CookbookEntry[]>>;
  prefs: Preferences;
}) {
  // support either hook-shape: useToast() -> fn OR { toast: fn }
  const toastApi: any = useToast();
  const toast: any = toastApi.toast ?? toastApi;

  const { base } = useInputStyles();

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editDraft, setEditDraft] = React.useState<Partial<CookbookEntry>>({});
  const [isUploading, setIsUploading] = React.useState(false);
  const navigate = useNavigate();
const [expandedId, setExpandedId] = React.useState<string | null>(null);

const toggleExpanded = (id?: string) => {
  if (!id) return;
  setExpandedId((cur) => (cur === id ? null : id));
};

const [pickerId, setPickerId] = React.useState<string | null>(null);
const [selectedLines, setSelectedLines] = React.useState<string[]>([]);
const [pickerMsg, setPickerMsg] = React.useState<string>("");

const getSlug = (r: CookbookEntry) => (r.slug ?? r.id ?? "").toString().trim();

const onShare = async (r: CookbookEntry) => {
  const slug = getSlug(r);
  const url = slug ? `${window.location.origin}/recipe/${encodeURIComponent(slug)}?from=${encodeURIComponent("/cookbook")}` : window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({ title: r.name, url });
      return;
    } catch {}
  }
  await navigator.clipboard.writeText(url);
  toast("Link copied!");
};

const onPrint = (r: CookbookEntry) => {
  const slug = getSlug(r);
  if (!slug) {
    toast("Missing slug for print.", "warning");
    return;
  }
  // Navigate to recipe page and let that page print (cleanest)
  navigate(`/recipe/${encodeURIComponent(slug)}?from=${encodeURIComponent("/cookbook")}&print=1`);
};

  const [importUrl, setImportUrl] = React.useState("");
  const [isImporting, setIsImporting] = React.useState(false);

  const [cookbookSearch, setCookbookSearch] = React.useState("");

  const cookbookFavoritesFirst = true;
  const cookbookMatchPrefsOnly = true;

  // Ensure every entry has an id (defensive)
  const normalizeEntry = React.useCallback((r: any): CookbookEntry => {
    const id = String(r?.id ?? r?.slug ?? r?.name ?? Math.random().toString(36).slice(2));
    return {
      ...r,
      id,
      slug: r?.slug ?? r?.id ?? id,
      favorite: Boolean(r?.favorite),
      createdAt: r?.createdAt ?? Date.now(),
      updatedAt: r?.updatedAt ?? r?.createdAt ?? Date.now(),
      name: r?.name ?? "Untitled",
      ingredients: r?.ingredients ?? "",
      instructions: r?.instructions ?? "",
      photoUrl: r?.photoUrl ?? "",
    };
  }, []);

    const recipeMatchesPreferences = React.useCallback(
    (r: { ingredients: string }) => {
      if (violatesAllergens(r.ingredients, prefs.allergens || [])) return false;
      if (!prefs.vegetarian) return true;
      return isVegetarianByHeuristic(r.ingredients);
    },
    [prefs.vegetarian, prefs.allergens]
  );

  const filteredCookbook = React.useMemo(() => {
    const q = normalize(cookbookSearch);
    let list = Array.isArray(cookbook) ? cookbook.map(normalizeEntry) : [];

    if (q) {
      list = list.filter(
        (r) => normalize(r.name).includes(q) || normalize(r.ingredients).includes(q)
      );
    }

    if (cookbookMatchPrefsOnly) list = list.filter(recipeMatchesPreferences);

    list.sort((a, b) => {
      if (cookbookFavoritesFirst && a.favorite !== b.favorite) return a.favorite ? -1 : 1;

      const at = a.updatedAt ?? a.createdAt ?? 0;
      const bt = b.updatedAt ?? b.createdAt ?? 0;
      return bt - at;
    });

    return list;
  }, [cookbook, cookbookSearch, cookbookFavoritesFirst, cookbookMatchPrefsOnly, recipeMatchesPreferences, normalizeEntry]);

  const startEditRecipe = (r: CookbookEntry) => {
    setEditingId(r.id);
    setEditDraft(r);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const saveEditRecipe = (id: string) => {
    const name = (editDraft.name ?? "").trim();
    const ingredients = (editDraft.ingredients ?? "").trim();

    if (!name || !ingredients) {
      toast("Name and ingredients are required", "warning");
      return;
    }

    setCookbook((prev) => {
      const next = (Array.isArray(prev) ? prev : []).map((r) =>
        r.id === id
          ? normalizeEntry({
              ...r,
              ...editDraft,
              name,
              ingredients,
              updatedAt: Date.now(),
            })
          : normalizeEntry(r)
      );
      persistCookbook(next as any);
      return next;
    });

    cancelEdit();
    toast("Recipe updated!", "success");
  };

  const toggleFavorite = (id: string) => {
    setCookbook((prev) => {
      const next = (Array.isArray(prev) ? prev : []).map((r) =>
        r.id === id ? { ...normalizeEntry(r), favorite: !r.favorite, updatedAt: Date.now() } : normalizeEntry(r)
      );
      persistCookbook(next as any);
      return next;
    });
  };

  const removeRecipe = (id: string) => {
    setCookbook((prev) => {
      const next = (Array.isArray(prev) ? prev : []).filter((r) => r.id !== id).map(normalizeEntry);
      persistCookbook(next as any);
      return next;
    });
    if (editingId === id) cancelEdit();
    toast("Recipe removed", "success");
  };

  const addRecipeToDay = (recipe: CookbookEntry, day: string) => {
    setMeals((prev) => ({
      ...prev,
      [day]: {
        id: recipe.id,
        slug: recipe.slug, // keep slug for RecipePage
        name: recipe.name,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions ?? "",
        photoUrl: recipe.photoUrl ?? "",
      },
    }));
    toast(`Added to ${day}!`, "success");
  };

  const splitIngredientLines = (raw?: string) =>
  (raw ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((l) => !/^\s*for\s+garnish\s*:?\s*$/i.test(l));

const toggleSelectLine = (line: string) => {
  setSelectedLines((cur) =>
    cur.includes(line) ? cur.filter((x) => x !== line) : [...cur, line]
  );
};

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadImageToCloudinary(file);
      setEditDraft((prev) => ({ ...prev, photoUrl: url }));
      toast("Image uploaded!", "success");
    } catch (err) {
      console.error(err);
      toast("Upload failed", "error");
    } finally {
      setIsUploading(false);
      e.currentTarget.value = "";
    }
  };

  const onImport = async () => {
    const url = importUrl.trim();
    if (!url) return toast("Paste a recipe URL first.", "warning");

    try {
      setIsImporting(true);

      const resp = await fetch(`/api/import-recipe?url=${encodeURIComponent(url)}`);
      const raw = await resp.text();

      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {}

      if (!resp.ok) {
        const msg = data?.error || data?.message || raw?.slice(0, 180) || `HTTP ${resp.status}`;
        toast(`Recipe import failed: ${msg}`, "error");
        return;
      }

      const recipe = data?.recipe ?? data;
      if (!recipe) {
        toast("Recipe import succeeded, but no recipe data was found.", "error");
        return;
      }

      const mealForStore: Meal = {
        name: decodeHtmlEntities(recipe.title || recipe.name || "Imported Recipe"),
        ingredients: recipe.ingredients || "",
        instructions: recipe.instructions || "",
        photoUrl: pickPhotoUrl(recipe),
      };

      // This writes to recipes store (RECIPES_LS_KEY)
      const saved = upsertRecipeFromMeal(mealForStore);

      // Put it into cookbook UI list and persist via cookbookStore key
      setCookbook((prev) => {
        const entry: CookbookEntry = normalizeEntry({ ...saved, favorite: false });
        const next = [entry, ...(Array.isArray(prev) ? prev.map(normalizeEntry) : [])]
          .filter((r, idx, arr) => arr.findIndex((x) => x.id === r.id) === idx);
        persistCookbook(next as any);
        return next;
      });

      toast("Recipe imported!", "success");
      setImportUrl("");
    } catch (e: any) {
      toast(`Import failed: ${e?.message || "Unknown error"}`, "error");
    } finally {
      setIsImporting(false);
    }
  };

  const recipeCountLabel = filteredCookbook.length === 1 ? "Recipe" : "Recipes";
  const showEmptyState = filteredCookbook.length === 0;
  const actionBtn: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#f8fafc",
  cursor: "pointer",
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

  return (
    <Card
  title={
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <BookOpen size={20} />
      Cookbook
    </span>
  }
  subtitle="Manage your saved recipes and meal plan."
>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
        <input
          placeholder="Search recipes..."
          value={cookbookSearch}
          onChange={(e) => setCookbookSearch(e.target.value)}
          style={{ ...base, flex: 1 }}
        />

        {cookbookSearch.trim() ? (
          <Button variant="secondary" onClick={() => setCookbookSearch("")}>
            Clear
          </Button>
        ) : null}

        <Badge>
          {filteredCookbook.length} {recipeCountLabel}
        </Badge>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          placeholder="Paste recipe URL..."
          value={importUrl}
          onChange={(e) => setImportUrl(e.target.value)}
          style={{ ...base, flex: 1 }}
        />
        <Button onClick={onImport} disabled={isImporting}>
          {isImporting ? "Importing…" : "Import Recipe"}
        </Button>
      </div>

      {showEmptyState ? (
        <div
          style={{
            padding: 18,
            borderRadius: 14,
            border: "1px solid rgba(148,163,184,.25)",
            background: "rgba(2,6,23,0.25)",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 6 }}>No recipes to show</div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            {cookbook.length === 0
              ? "Your cookbook is empty. Add recipes from your Week Plan to get started."
              : "You have recipes, but your search or filters are hiding them. Try clearing the search box."}
          </div>
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
          marginTop: showEmptyState ? 16 : 0,
        }}
      >
      {filteredCookbook.map((r) => {
  const rid = (r.id ?? r.slug ?? r.name).toString(); // stable fallback
  const isEditing = editingId === r.id;
  const isExpanded = expandedId === rid;

  return (
    <Card key={rid} style={{ padding: 0, overflow: "hidden" }}>
      {isEditing ? (
        // ✅ keep your real edit UI here (not "..."), or paste the existing edit form
        <div style={{ padding: 16, display: "grid", gap: 10 }}>
          <input
            style={base}
            value={editDraft.name ?? ""}
            onChange={(e) => setEditDraft((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Recipe Name"
          />

          <textarea
            style={{ ...base, minHeight: 80 }}
            value={editDraft.ingredients ?? ""}
            onChange={(e) => setEditDraft((prev) => ({ ...prev, ingredients: e.target.value }))}
            placeholder="Ingredients"
          />

          <textarea
            style={{ ...base, minHeight: 120 }}
            value={editDraft.instructions ?? ""}
            onChange={(e) => setEditDraft((prev) => ({ ...prev, instructions: e.target.value }))}
            placeholder="Instructions"
          />

          <input type="file" onChange={onPickImage} disabled={isUploading} />
          {isUploading ? <div style={{ fontSize: 12, opacity: 0.8 }}>Uploading…</div> : null}

          <div style={{ display: "flex", gap: 8 }}>
            <Button onClick={() => saveEditRecipe(r.id)}>Save</Button>
            <Button variant="secondary" onClick={cancelEdit}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <img
            src={r.photoUrl || fallbackPhotoUrl(r.name)}
            alt={r.name}
            style={{ width: "100%", height: 180, objectFit: "cover", cursor: "pointer" }}
            loading="lazy"
            onClick={() => toggleExpanded(rid)}
          />

          <div style={{ padding: 16, display: "grid", gap: 10 }}>
            {/* Title row */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 18, lineHeight: 1.15 }}>{r.name}</div>
                <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>
                  {r.updatedAt ? `Updated ${new Date(r.updatedAt).toLocaleDateString()}` : ""}
                </div>
              </div>

              <button
                onClick={() => toggleFavorite(r.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: 2,
                  display: "grid",
                  placeItems: "center",
                }}
                aria-label="Toggle favorite"
                title="Toggle favorite"
              >
                <Star
                  size={18}
                  fill={r.favorite ? "#facc15" : "none"}
                  stroke={r.favorite ? "#facc15" : "currentColor"}
                />
              </button>
            </div>

            {/* Badges */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {violatesAllergens(r.ingredients, prefs.allergens || []) ? (
                <Badge tone="bad">Allergens</Badge>
              ) : (
                <Badge tone="good">Safe</Badge>
              )}
              {isVegetarianByHeuristic(r.ingredients) ? (
                <Badge tone="good">Vegetarian</Badge>
              ) : (
                <Badge tone="warn">Meat</Badge>
              )}
            </div>

            {/* Action bar */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => toggleExpanded(rid)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#f8fafc",
                    cursor: "pointer",
                    fontWeight: 800,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {isExpanded ? "Hide" : "Details"}
                </button>

                <button type="button" onClick={() => onPrint(r)} style={actionBtn}>
                  <Printer size={16} />
                  Print
                </button>

                <button type="button" onClick={() => onShare(r)} style={actionBtn}>
                  <Share2 size={16} />
                  Share
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (expandedId !== rid) setExpandedId(rid);

                    if (pickerId === rid) {
                      setPickerId(null);
                      setSelectedLines([]);
                      setPickerMsg("");
                    } else {
                      setPickerId(rid);
                      setSelectedLines([]);
                      setPickerMsg("");
                    }
                  }}
                  style={{
                    ...actionBtn,
                    background: pickerId === rid ? "rgba(20,184,166,0.18)" : (actionBtn as any).background,
                    border: pickerId === rid ? "1px solid rgba(20,184,166,0.35)" : (actionBtn as any).border,
                  }}
                  disabled={!r.ingredients?.trim()}
                  title={!r.ingredients?.trim() ? "No ingredients" : "Add to shopping list"}
                >
                  <ShoppingCart size={16} />
                  List
                </button>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <Button variant="secondary" onClick={() => startEditRecipe(r)}>
                  <Pencil size={16} />
                </Button>
                <Button variant="danger" onClick={() => removeRecipe(r.id)}>
                  <Trash2 size={16} />
                </Button>

                <select
                  style={{ ...base, width: "auto" }}
                  defaultValue=""
                  onChange={(e) => {
                    const day = e.target.value;
                    if (!day) return;
                    addRecipeToDay(r, day);
                    e.currentTarget.value = "";
                  }}
                >
                  <option value="" disabled>
                    Plan for...
                  </option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expanded */}
            {isExpanded ? (
              <div
                style={{
                  marginTop: 6,
                  padding: 12,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "grid",
                  gap: 10,
                }}
              >
                <div style={{ fontWeight: 900, opacity: 0.85, fontSize: 12, letterSpacing: 0.3, textTransform: "uppercase" }}>
                  Ingredients
                </div>

                {pickerId === rid ? (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ opacity: 0.75, fontSize: 13, fontWeight: 700 }}>Select ingredients to add:</div>

                    <div style={{ display: "grid", gap: 8 }}>
                      {splitIngredientLines(r.ingredients).map((line) => (
                        <label
                          key={line}
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            cursor: "pointer",
                            padding: "8px 10px",
                            borderRadius: 12,
                            border: "1px solid rgba(255,255,255,0.06)",
                            background: "rgba(255,255,255,0.02)",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedLines.includes(line)}
                            onChange={() => toggleSelectLine(line)}
                            style={{ marginTop: 3 }}
                          />
                          <span style={{ lineHeight: 1.45 }}>{line}</span>
                        </label>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        style={actionBtn}
                        onClick={() => {
                          const lines = splitIngredientLines(r.ingredients);
                          setSelectedLines(lines);
                          setPickerMsg("");
                        }}
                      >
                        Select all
                      </button>

                      <button
                        type="button"
                        style={actionBtn}
                        onClick={() => {
                          setSelectedLines([]);
                          setPickerMsg("");
                        }}
                      >
                        Clear
                      </button>

                      <button
                        type="button"
                        style={{
                          ...actionBtn,
                          background: "rgba(20,184,166,0.18)",
                          border: "1px solid rgba(20,184,166,0.35)",
                          fontWeight: 900,
                        }}
                        onClick={() => {
                          if (selectedLines.length === 0) {
                            setPickerMsg("Select at least one item.");
                            return;
                          }
                          const joined = selectedLines.join("\n");
                          const res = addIngredientsToList(r.name, joined);
                          setPickerMsg(`Added ${res.addedCount} item${res.addedCount === 1 ? "" : "s"} ✅`);
                          setPickerId(null);
                          setSelectedLines([]);
                        }}
                      >
                        Add selected
                      </button>
                    </div>

                    {pickerMsg ? <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.85 }}>{pickerMsg}</div> : null}
                  </div>
                ) : (
                  <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.55, opacity: 0.9 }}>{r.ingredients || "—"}</div>
                )}

                <div
                  style={{
                    fontWeight: 900,
                    opacity: 0.85,
                    fontSize: 12,
                    letterSpacing: 0.3,
                    textTransform: "uppercase",
                    marginTop: 6,
                  }}
                >
                  Instructions
                </div>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.55, opacity: 0.9 }}>{r.instructions || "—"}</div>
              </div>
            ) : null}
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