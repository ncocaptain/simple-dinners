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
  violatesAllergens,
  isVegetarianByHeuristic,
}: {
  setMeals: React.Dispatch<React.SetStateAction<Record<string, Meal>>>;
  cookbook: CookbookEntry[];
  setCookbook: React.Dispatch<React.SetStateAction<CookbookEntry[]>>;
  prefs: Preferences;
  violatesAllergens: (ingredients: string) => boolean;
  isVegetarianByHeuristic: (ingredients: string) => boolean;
}) {
  // support either hook-shape: useToast() -> fn OR { toast: fn }
  const toastApi: any = useToast();
  const toast: any = toastApi.toast ?? toastApi;

  const { base } = useInputStyles();

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editDraft, setEditDraft] = React.useState<Partial<CookbookEntry>>({});
  const [isUploading, setIsUploading] = React.useState(false);

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
      if (violatesAllergens(r.ingredients)) return false;
      if (!prefs.vegetarian) return true;
      return isVegetarianByHeuristic(r.ingredients) || prefs.allowSubstitutions;
    },
    [violatesAllergens, prefs.vegetarian, prefs.allowSubstitutions, isVegetarianByHeuristic]
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

  return (
    <Card title="📚 Cookbook" subtitle="Manage your saved recipes and meal plan.">
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
          const isEditing = editingId === r.id;

          return (
            <Card key={r.id} style={{ padding: 0, overflow: "hidden" }}>
              {isEditing ? (
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
                    style={{ width: "100%", height: 180, objectFit: "cover" }}
                    loading="lazy"
                  />

                  <div style={{ padding: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        alignItems: "flex-start",
                      }}
                    >
                      <h3 style={{ margin: 0 }}>{r.name}</h3>

                      <button
                        onClick={() => toggleFavorite(r.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, lineHeight: 1 }}
                        aria-label="Toggle favorite"
                        title="Toggle favorite"
                      >
                        {r.favorite ? "⭐" : "☆"}
                      </button>
                    </div>

                    <div style={{ margin: "10px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {violatesAllergens(r.ingredients) ? <Badge tone="bad">Allergens</Badge> : <Badge tone="good">Safe</Badge>}
                      {isVegetarianByHeuristic(r.ingredients) ? <Badge tone="good">Vegetarian</Badge> : <Badge tone="warn">Meat</Badge>}
                    </div>

                    <p style={{ fontSize: 13, opacity: 0.8, margin: "8px 0 0" }}>{r.ingredients}</p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        marginTop: 15,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", gap: 6 }}>
                        <Button variant="secondary" onClick={() => startEditRecipe(r)}>
                          ✏️
                        </Button>
                        <Button variant="danger" onClick={() => removeRecipe(r.id)}>
                          🗑️
                        </Button>
                      </div>

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
                </>
              )}
            </Card>
          );
        })}
      </div>
    </Card>
  );
}