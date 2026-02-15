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
    tone === "good" ? "rgba(34,197,94,.16)" :
    tone === "warn" ? "rgba(245,158,11,.18)" :
    tone === "bad" ? "rgba(239,68,68,.16)" :
    "rgba(148,163,184,.18)";

  const border =
    tone === "good" ? "rgba(34,197,94,.35)" :
    tone === "warn" ? "rgba(245,158,11,.35)" :
    tone === "bad" ? "rgba(239,68,68,.35)" :
    "rgba(148,163,184,.30)";

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
  const [importUrl, setImportUrl] = React.useState("");
  const [isImporting, setIsImporting] = React.useState(false);

  

  const [cookbookSearch, setCookbookSearch] = React.useState<string>("");

  const [cookbookFavoritesFirst] = React.useState<boolean>(() => {

    const saved = localStorage.getItem("cookbookFavoritesFirst");
    return saved ? saved === "true" : true;
  });

  const [cookbookMatchPrefsOnly] =
  React.useState<boolean>(() => {
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

    const firstEmptyDay = () =>
    days.find((d) => {
      const m = meals[d];
      const name = (m?.name || "").trim();
      const ing = (m?.ingredients || "").trim();
      return name.length === 0 && ing.length === 0;
    });

  const addRecipeToFirstEmpty = (recipe: Recipe) => {
    const d = firstEmptyDay();
    if (!d) {
      toast("No empty days available", "warning");
      return;
    }
    addRecipeToDay(recipe, d);
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
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
  <input
    placeholder="Search recipes…"
    value={cookbookSearch}
    onChange={(e) => setCookbookSearch(e.target.value)}
    style={{ ...base, flex: 1, minWidth: 220 }}
  />
  <Badge>{filteredCookbook.length} recipes</Badge>
</div>


      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
  <input
    placeholder="Paste recipe URL…"
    value={importUrl}
    onChange={(e) => setImportUrl(e.target.value)}
    style={{ ...base, flex: 1, minWidth: 220 }}
  />
  <Button
    onClick={async () => {
      const url = importUrl.trim();
      if (!url) return;

      try {
        setIsImporting(true);
        const resp = await fetch("/api/recipe-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error ?? "Import failed");

        const r = data.recipe;

        // Create a new recipe entry in your cookbook
        setCookbook((prev) => [
          {
            id: crypto.randomUUID(),
            name: r.name,
            ingredients: r.ingredients || "",
            instructions: r.instructions || "",
            photoUrl: r.photoUrl || "",
            favorite: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            sourceUrl: r.sourceUrl,
          },
          ...prev,
        ]);

        setImportUrl("");
        toast("Imported recipe!");
      } catch (err: any) {
        toast(err?.message ?? "Import failed", "error");
      } finally {
        setIsImporting(false);
      }
    }}
    disabled={isImporting}
  >
    {isImporting ? "Importing…" : "Import"}
  </Button>
</div>


      <div style={{ marginBottom: 12, opacity: 0.8 }}>
        Recipes: <b>{filteredCookbook.length}</b>
      </div>

      {filteredCookbook.length === 0 ? (
        <div style={{ opacity: 0.75 }}>
          Your cookbook is empty. Add one from the Week page.
        </div>
      ) : (
        <div
              style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 12,
              marginTop: 12,
  }}
>
          {/* ✅ IMPORTANT: use { } map so we can declare variables */}
          {filteredCookbook.map((r) => {
            const isEditing = editingId === r.id;

            return (
              <Card
  key={r.id}
  style={{
    padding: 0,
    overflow: "hidden",
    border: `1px solid ${theme.colors.border}`,
  }}
>
  {/* Banner image */}
  {r.photoUrl ? (
    <div style={{ position: "relative" }}>
      <img
        src={r.photoUrl}
        alt={r.name}
        style={{
          width: "100%",
          height: 180,
          objectFit: "cover",
          display: "block",
        }}
      />
      {/* subtle gradient so text/actions pop if you ever overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.25))",
        }}
      />
    </div>
  ) : null}

  {/* Body */}
  <div style={{ padding: theme.spacing.md }}>
    {/* Title row */}
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 950, fontSize: 18, lineHeight: 1.15 }}>
          {r.name}
        </div>

        {/* Badges */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          {violatesAllergens(r.ingredients) ? (
            <Badge tone="warn">⚠️ Contains allergens</Badge>
          ) : (
            <Badge tone="good">✅ Allergen-safe</Badge>
          )}

          {prefs.vegetarian ? (
            isVegetarianByHeuristic(r.ingredients) ? (
              <Badge tone="good">🥦 Vegetarian</Badge>
            ) : (
              <Badge tone="warn">🍖 Non-veg</Badge>
            )
          ) : (
            <Badge>🍽️ Any diet</Badge>
          )}

          {r.sourceUrl ? <Badge>🔗 Source</Badge> : null}
        </div>
      </div>

      {/* Favorite button */}
      <Button
        variant="secondary"
        onClick={() => toggleFavoriteRecipe(r.id)}
        title={r.favorite ? "Unfavorite" : "Favorite"}
        style={{ padding: "8px 10px" }}
      >
        {r.favorite ? "⭐" : "☆"}
      </Button>
    </div>

    {/* Ingredients section */}
    <div style={{ marginTop: 14 }}>
      <div style={{ fontWeight: 900, fontSize: 12, opacity: 0.8, letterSpacing: 0.6 }}>
        INGREDIENTS
      </div>
      <div style={{ marginTop: 6, opacity: 0.92, lineHeight: 1.45 }}>
        {r.ingredients}
      </div>
    </div>

    {/* Instructions collapsible */}
    {r.instructions && r.instructions.trim() ? (
      <div style={{ marginTop: 12 }}>
        <details>
          <summary style={{ cursor: "pointer", fontWeight: 900 }}>
            📋 Instructions
          </summary>
          <div style={{ marginTop: 8, whiteSpace: "pre-wrap", opacity: 0.92, lineHeight: 1.5 }}>
            {r.instructions}
          </div>
        </details>
      </div>
    ) : null}

    {/* Footer actions */}
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginTop: 14,
        paddingTop: 12,
        borderTop: `1px solid ${theme.colors.border}`,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button variant="secondary" onClick={() => startEditRecipe(r)}>
          ✏️ Edit
        </Button>
        <Button variant="danger" onClick={() => removeFromCookbook(r.id)}>
          🗑️ Delete
        </Button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Button onClick={() => addRecipeToFirstEmpty(r)}>➕ Add to first empty</Button>


        <select
          defaultValue=""
          onChange={(e) => {
            const day = e.target.value;
            if (!day) return;
            addRecipeToDay(r, day);
            e.currentTarget.value = "";
          }}
          style={{ ...base, width: "auto" }}
        >
          <option value="">Pick day…</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>

    {/* tiny meta */}
    <div style={{ fontSize: 11, opacity: 0.6, marginTop: 10 }}>
      Created: {new Date(r.createdAt).toLocaleDateString()}
      {r.updatedAt ? ` • Updated: ${new Date(r.updatedAt).toLocaleDateString()}` : ""}
    </div>
  </div>
</Card>

            );
          })}
        </div>
      )}
    </Card>
  );
}
