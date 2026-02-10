import React from "react";
import { normalize, days } from "../App";
import type { Meal, Preferences, Recipe } from "../App";
import Button from "../components/Button";
import Card from "../components/Card";
import { useInputStyles } from "../components/inputStyles";
import { useToast } from "../components/Toast";
import { uploadImageToCloudinary } from "../utils/uploadImage";

export default function CookbookPage({
  meals,
  setMeals,
  cookbook,
  setCookbook,
  prefs,
  allergenKeywords,
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
  const { base, theme } = useInputStyles();

  // ✅ Missing state (you are using these later)
  const [editInstructions, setEditInstructions] = React.useState<string>("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState<string>("");
  const [editIngredients, setEditIngredients] = React.useState<string>("");
  const [editPhotoUrl, setEditPhotoUrl] = React.useState<string>("");
  const [isUploading, setIsUploading] = React.useState(false);
  

  const [cookbookSearch, setCookbookSearch] = React.useState<string>("");

  const [cookbookFavoritesFirst, setCookbookFavoritesFirst] = React.useState<boolean>(() => {
    const saved = localStorage.getItem("cookbookFavoritesFirst");
    return saved ? saved === "true" : true;
  });

  const [cookbookMatchPrefsOnly, setCookbookMatchPrefsOnly] = React.useState<boolean>(() => {
    const saved = localStorage.getItem("cookbookMatchPrefsOnly");
    return saved ? saved === "true" : true;
  });

  React.useEffect(() => {
    localStorage.setItem("cookbookFavoritesFirst", String(cookbookFavoritesFirst));
  }, [cookbookFavoritesFirst]);

  React.useEffect(() => {
    localStorage.setItem("cookbookMatchPrefsOnly", String(cookbookMatchPrefsOnly));
  }, [cookbookMatchPrefsOnly]);

  const recipeMatchesPreferences = (r: { ingredients: string }) => {
    if (violatesAllergens(r.ingredients)) return false;
    if (!prefs.vegetarian) return true;

    if (isVegetarianByHeuristic(r.ingredients)) return true;
    return prefs.allowSubstitutions;
  };

  const filteredCookbook = React.useMemo(() => {
    const q = normalize(cookbookSearch);
    let list = Array.isArray(cookbook) ? [...cookbook] : [];

    if (q) list = list.filter((r) => normalize(r.name).includes(q) || normalize(r.ingredients).includes(q));
    if (cookbookMatchPrefsOnly) list = list.filter(recipeMatchesPreferences);

    list.sort((a, b) => {
      if (cookbookFavoritesFirst && a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      const at = a.updatedAt ?? a.createdAt ?? 0;
      const bt = b.updatedAt ?? b.createdAt ?? 0;
      return bt - at;
    });

    return list;
  }, [
    cookbook,
    cookbookSearch,
    cookbookFavoritesFirst,
    cookbookMatchPrefsOnly,
    prefs.vegetarian,
    prefs.allowSubstitutions,
    allergenKeywords,
  ]);

  const startEditRecipe = (r: Recipe) => {
  setEditingId(r.id);
  setEditName(r.name ?? "");
  setEditIngredients(r.ingredients ?? "");
  setEditPhotoUrl(r.photoUrl ?? "");
  setEditInstructions(r.instructions ?? "");
  
};


  const cancelEditRecipe = () => {
  setEditingId(null);
  setEditName("");
  setEditIngredients("");
  setEditPhotoUrl("");
  setEditInstructions("");
};


  const saveEditRecipe = (id: string) => {
    const name = editName.trim();
    const ingredients = editIngredients.trim();

    if (!name || !ingredients) {
      toast("Recipe needs a name and ingredients.", "warning");
      return;
    }

    const keyName = normalize(name);
    const keyIng = normalize(ingredients);

    const duplicate = cookbook.some(
      (r) => r.id !== id && normalize(r.name) === keyName && normalize(r.ingredients) === keyIng
    );
    if (duplicate) {
      toast("Recipe already exists in your cookbook", "error");
      return;
    }

    setCookbook((prev) =>
  prev.map((r) =>
    r.id === id
      ? {
          ...r,
          name,
          ingredients,
          instructions: editInstructions.trim(),
          photoUrl: editPhotoUrl,
          updatedAt: Date.now(),
        }
      : r
  )
);


    cancelEditRecipe();
    toast("Recipe saved!");
  };

  const removeFromCookbook = (id: string) => {
    setCookbook((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) cancelEditRecipe();
  };

  const toggleFavoriteRecipe = (id: string) => {
    setCookbook((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, favorite: !r.favorite, updatedAt: Date.now() } : r
      )
    );
  };

  const addRecipeToDay = (recipe: Recipe, day: string) => {
    setMeals((prev) => ({
      ...prev,
      [day]: { name: recipe.name, ingredients: recipe.ingredients },
    }));
    toast(`Added to ${day}!`);
  };

  return (
    <Card
      title="📚 Cookbook"
      subtitle="Save recipes, favorite them, and drop them into your weekly plan."
    >
      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Search cookbook…"
          value={cookbookSearch}
          onChange={(e) => setCookbookSearch(e.target.value)}
          style={{ ...base, width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: 12, opacity: 0.8 }}>
        Recipes: <b>{filteredCookbook.length}</b>
      </div>

      {filteredCookbook.length === 0 ? (
        <div style={{ opacity: 0.75 }}>
          Your cookbook is empty. Add one from the Week page.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {/* ✅ IMPORTANT: use { } map so we can declare variables */}
          {filteredCookbook.map((r) => {
            const isEditing = editingId === r.id;

            return (
              <Card key={r.id} style={{ padding: theme.spacing.md }}>
                {/* Image outside edit mode */}
                {!isEditing && r.photoUrl && (
                  <img
                    src={r.photoUrl}
                    alt={r.name}
                    style={{
                      width: "100%",
                      maxHeight: 220,
                      objectFit: "cover",
                      borderRadius: 12,
                      marginBottom: 10,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  />
                )}

                {!isEditing ? (
                  <>
                    <div style={{ fontWeight: 900 }}>{r.name}</div>
                    <div style={{ opacity: 0.85, marginTop: 6 }}>{r.ingredients}</div>
                    {r.instructions && r.instructions.trim() && (
                      <div style={{ marginTop: 10, opacity: 0.92, whiteSpace: "pre-wrap" }}>
                      <div style={{ fontWeight: 800, marginBottom: 4 }}>Instructions</div>
                      <div>{r.instructions}</div>
                      </div>
                )}


                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      <Button variant="secondary" onClick={() => startEditRecipe(r)}>
                        ✏️ Edit
                      </Button>

                      <Button variant="secondary" onClick={() => toggleFavoriteRecipe(r.id)}>
                        {r.favorite ? "⭐ Favorited" : "☆ Favorite"}
                      </Button>

                      <Button variant="danger" onClick={() => removeFromCookbook(r.id)}>
                        🗑️ Delete
                      </Button>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      <Button onClick={() => addRecipeToDay(r, days[0])} variant="secondary">
                        ➕ Add to Monday
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 900, marginBottom: 8 }}>Editing</div>

                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Recipe name"
                      style={{ ...base, width: "100%", marginBottom: 8 }}
                    />

                    <input
                      value={editIngredients}
                      onChange={(e) => setEditIngredients(e.target.value)}
                      placeholder="Ingredients (comma separated)"
                      style={{ ...base, width: "100%", marginBottom: 10 }}
                    />
                    <textarea
                      value={editInstructions}
                      onChange={(e) => setEditInstructions(e.target.value)}
                      placeholder="Instructions (step-by-step)…"
                      rows={6}
                      style={{ ...base, width: "100%", marginBottom: 10 }}
/>

                    {editPhotoUrl && (
                      <img
                        src={editPhotoUrl}
                        alt="Recipe"
                        style={{
                          width: "100%",
                          maxHeight: 220,
                          objectFit: "cover",
                          borderRadius: 12,
                          marginBottom: 8,
                          border: `1px solid ${theme.colors.border}`,
                        }}
                      />
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        try {
                          setIsUploading(true);
                          const url = await uploadImageToCloudinary(file);
                          setEditPhotoUrl(url);
                          toast("Photo uploaded!");
                        } catch (err: any) {
                          toast(err?.message ?? "Upload failed", "error");
                        } finally {
                          setIsUploading(false);
                          e.currentTarget.value = "";
                        }
                      }}
                      style={{ ...base, width: "100%" }}
                    />

                    {isUploading && (
                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                        Uploading…
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      <Button onClick={() => saveEditRecipe(r.id)}>Save</Button>
                      <Button variant="secondary" onClick={cancelEditRecipe}>
                        Cancel
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditPhotoUrl("");
                          toast("Photo removed");
                        }}
                      >
                        Remove photo
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </Card>
  );
}
