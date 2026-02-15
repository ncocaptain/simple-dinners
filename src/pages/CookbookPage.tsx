import React from "react";
import { normalize, days } from "../App";
import type { Meal, Preferences, Recipe } from "../App";
import Button from "../components/Button";
import Card from "../components/Card";
import { useInputStyles } from "../components/inputStyles";
import { useToast } from "../components/Toast";
import { uploadImageToCloudinary } from "../utils/uploadImage";

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

export default function CookbookPage({
  meals,
  setMeals,
  cookbook,
  setCookbook,
  prefs,
  allergenKeywords, // ok to keep even if unused
  violatesAllergens,
  isVegetarianByHeuristic,
}: {
  meals: Record<string, Meal>;
  setMeals: React.Dispatch<React.SetStateAction<Record<string, Meal>>>;
  cookbook: Recipe[];
  setCookbook: React.Dispatch<React.SetStateAction<Recipe[]>>;
  prefs: Preferences;
  allergenKeywords: string[];
  violatesAllergens: (ingredients: string) => boolean;
  isVegetarianByHeuristic: (ingredients: string) => boolean;
}) {
  const toast = useToast();
  const { base } = useInputStyles(); // ✅ remove unused theme

  // Consolidated State
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editDraft, setEditDraft] = React.useState<Partial<Recipe>>({});
  const [isUploading, setIsUploading] = React.useState(false);

  const [importUrl, setImportUrl] = React.useState("");
  const [isImporting, setIsImporting] = React.useState(false);

  const [cookbookSearch, setCookbookSearch] = React.useState("");
  const [cookbookFavoritesFirst] = React.useState(true);
  const [cookbookMatchPrefsOnly] = React.useState(true);

  const recipeMatchesPreferences = (r: { ingredients: string }) => {
    if (violatesAllergens(r.ingredients)) return false;
    if (!prefs.vegetarian) return true;
    return isVegetarianByHeuristic(r.ingredients) || prefs.allowSubstitutions;
  };

  const filteredCookbook = React.useMemo(() => {
    const q = normalize(cookbookSearch);
    let list = Array.isArray(cookbook) ? [...cookbook] : [];

    if (q) {
      list = list.filter(
        (r) => normalize(r.name).includes(q) || normalize(r.ingredients).includes(q)
      );
    }

    if (cookbookMatchPrefsOnly) list = list.filter(recipeMatchesPreferences);

    list.sort((a, b) => {
      if (cookbookFavoritesFirst && a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
    });

    return list;
  }, [
    cookbook,
    cookbookSearch,
    cookbookFavoritesFirst,
    cookbookMatchPrefsOnly,
    prefs.vegetarian,
    prefs.allowSubstitutions,
    violatesAllergens,
    isVegetarianByHeuristic,
  ]);

  const startEditRecipe = (r: Recipe) => {
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

    setCookbook((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ...editDraft,
              name,
              ingredients,
              updatedAt: Date.now(),
            }
          : r
      )
    );

    cancelEdit();
    toast("Recipe updated!");
  };

  const toggleFavorite = (id: string) => {
    setCookbook((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, favorite: !r.favorite, updatedAt: Date.now() } : r
      )
    );
  };

  const removeRecipe = (id: string) => {
    setCookbook((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) cancelEdit();
  };

  const addRecipeToDay = (recipe: Recipe, day: string) => {
    setMeals((prev) => ({
      ...prev,
      [day]: { name: recipe.name, ingredients: recipe.ingredients },
    }));
    toast(`Added to ${day}!`);
  };

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadImageToCloudinary(file);
      setEditDraft((prev) => ({ ...prev, photoUrl: url }));
      toast("Image uploaded!");
    } catch (err) {
      console.error(err);
      toast("Upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card title="📚 Cookbook" subtitle="Manage your saved recipes and meal plan.">
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          placeholder="Search recipes..."
          value={cookbookSearch}
          onChange={(e) => setCookbookSearch(e.target.value)}
          style={{ ...base, flex: 1 }}
        />
        <Badge>{filteredCookbook.length} Recipes</Badge>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          placeholder="Import from URL..."
          value={importUrl}
          onChange={(e) => setImportUrl(e.target.value)}
          style={{ ...base, flex: 1 }}
        />
        <Button
          onClick={() => {
            setIsImporting(true);
            toast("Importing feature triggered");
            setTimeout(() => setIsImporting(false), 300);
          }}
          disabled={isImporting}
        >
          {isImporting ? "..." : "Import"}
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {filteredCookbook.map((r) => {
          const isEditing = editingId === r.id;

          return (
            <Card key={r.id} style={{ padding: 0, overflow: "hidden" }}>
              {isEditing ? (
                <div style={{ padding: 16, display: "grid", gap: 10 }}>
                  <input
                    style={base}
                    value={editDraft.name ?? ""}
                    onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                    placeholder="Recipe Name"
                  />

                  <textarea
                    style={{ ...base, minHeight: 80 }}
                    value={editDraft.ingredients ?? ""}
                    onChange={(e) => setEditDraft({ ...editDraft, ingredients: e.target.value })}
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
                  {r.photoUrl ? (
                    <img
                      src={r.photoUrl}
                      alt={r.name}
                      style={{ width: "100%", height: 180, objectFit: "cover" }}
                    />
                  ) : null}

                  <div style={{ padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                      <h3 style={{ margin: 0 }}>{r.name}</h3>

                      <button
                        onClick={() => toggleFavorite(r.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 20,
                          lineHeight: 1,
                        }}
                        aria-label="Toggle favorite"
                        title="Toggle favorite"
                      >
                        {r.favorite ? "⭐" : "☆"}
                      </button>
                    </div>

                    <div style={{ margin: "10px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {violatesAllergens(r.ingredients) ? (
                        <Badge tone="bad">Allergens</Badge>
                      ) : (
                        <Badge tone="good">Safe</Badge>
                      )}

                      {isVegetarianByHeuristic(r.ingredients) ? (
                        <Badge tone="good">Veg</Badge>
                      ) : (
                        <Badge tone="warn">Meat</Badge>
                      )}
                    </div>

                    <p style={{ fontSize: 13, opacity: 0.8, margin: "8px 0 0" }}>{r.ingredients}</p>

                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 15, flexWrap: "wrap" }}>
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
                        onChange={(e) => {
                          const day = e.target.value;
                          if (!day) return;
                          addRecipeToDay(r, day);
                          e.currentTarget.value = ""; // reset to placeholder
                        }}
                        defaultValue=""
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
