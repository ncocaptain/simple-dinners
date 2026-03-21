import { useEffect, useState } from "react";
import type { CSSProperties, FormEvent, MouseEvent } from "react";
import {
  CheckCircle2,
  Plus,
  X,
  Link as LinkIcon,
  BookOpen,
  ShoppingCart,
  Pencil,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { formatIngredients } from "../core/utils";
import Card from "../components/Card";
import { addIngredientsToList } from "../shoppingList";

type Recipe = {
  slug?: string;
  name?: string;
  ingredients?: string;
  instructions?: string;
  photoUrl?: string;
  sourceUrl?: string;
  effort?: string;
};

type CookbookPageProps = {
  cookbook: Recipe[];
  setCookbook: React.Dispatch<React.SetStateAction<Recipe[]>>;
};

function slugify(text: string) {
  return (text || "recipe")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function splitLines(text?: string) {
  return (text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeMultilineField(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((v) => String(v ?? "").trim())
      .filter(Boolean)
      .join("\n");
  }

  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/•/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\n{2,}/g, "\n")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function stripIngredientAmount(line: string): string {
  return String(line ?? "")
    .trim()
    .replace(/^\([^)]*\)\s*/, "")
    .replace(
      /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?(?:\s*[-–]\s*\d+(?:\.\d+)?)?)\s*/i,
      ""
    )
    .replace(
      /^(cups?|cup|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|lb|lbs|pounds?|g|kg|ml|l|cloves?|cans?|packages?|pkgs?|sticks?|slices?|pinch|dash)\b\.?\s*/i,
      ""
    )
    .replace(/^of\s+/i, "")
    .replace(/^[,\-–:;\s]+/, "")
    .trim();
}

function getRecipeStatus(recipe: Recipe) {
  const ingredientCount = splitLines(recipe?.ingredients).length;
  const instructionsMissing =
    !recipe?.instructions ||
    recipe.instructions === "Steps available at source link!";
  const stepCount = instructionsMissing ? 0 : splitLines(recipe?.instructions).length;

  if (ingredientCount === 0 && stepCount === 0) return "Needs finishing";
  if (ingredientCount === 0) return "Needs ingredients";
  if (stepCount === 0) return "Needs steps";
  return "Ready";
}

export default function CookbookPage({
  cookbook = [],
  setCookbook,
}: CookbookPageProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedForShop, setSelectedForShop] = useState<string[]>([]);
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const [manualRecipe, setManualRecipe] = useState({
    name: "",
    ingredients: "",
    instructions: "",
    photoUrl: "",
    sourceUrl: "",
  });

  useEffect(() => {
    if (!selectedRecipe) {
      setSelectedForShop([]);
      return;
    }

    // Open cookbook recipes with nothing selected.
    setSelectedForShop([]);
  }, [selectedRecipe]);

  const toggleForShop = (ing: string) => {
    setSelectedForShop((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const handleAddToShop = () => {
    if (!selectedRecipe) return;

    const cleanedItems = selectedForShop
      .map((item) => stripIngredientAmount(item))
      .map((item) => item.trim())
      .filter(Boolean);

    if (!cleanedItems.length) return;

    addIngredientsToList(selectedRecipe.name || "Recipe", cleanedItems.join("\n"));
    setSelectedForShop([]);
    setSelectedRecipe(null);

    alert(`${cleanedItems.length} items added to your Shopping List!`);
  };

  const resetManualRecipe = () => {
    setManualRecipe({
      name: "",
      ingredients: "",
      instructions: "",
      photoUrl: "",
      sourceUrl: "",
    });
    setEditingSlug(null);
  };

  const openNewRecipeModal = () => {
    resetManualRecipe();
    setShowManual(true);
  };

  const openEditRecipe = (recipe: Recipe) => {
    setManualRecipe({
      name: recipe?.name || "",
      ingredients: recipe?.ingredients || "",
      instructions:
        recipe?.instructions === "Steps available at source link!"
          ? ""
          : recipe?.instructions || "",
      photoUrl: recipe?.photoUrl || "",
      sourceUrl: recipe?.sourceUrl || "",
    });

    setEditingSlug(recipe?.slug || null);
    setSelectedRecipe(null);
    setShowManual(true);
  };

  const handleDeleteRecipe = (recipe: Recipe) => {
    const ok = window.confirm(`Delete "${recipe?.name}" from your cookbook?`);
    if (!ok) return;

    setCookbook((prev) => prev.filter((r) => r.slug !== recipe.slug));
    setSelectedRecipe(null);
    alert("Recipe deleted.");
  };

  const handleImport = async (e?: FormEvent | MouseEvent) => {
    e?.preventDefault();

    if (!importUrl.trim()) {
      alert("Please paste a recipe URL.");
      return;
    }

    setIsImporting(true);

    try {
      const API_BASE = "https://dinners.ncocaptain.com";

      const response = await fetch(`${API_BASE}/api/import-recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl.trim() }),
      });

      const data = await response.json();

      if (data?.recipe) {
        const imported = data.recipe;

        const normalizedRecipe: Recipe = {
          ...imported,
          name: String(imported?.name ?? "").trim(),
          ingredients: normalizeMultilineField(imported?.ingredients),
          instructions: normalizeMultilineField(imported?.instructions),
          photoUrl: String(imported?.photoUrl ?? "").trim(),
          sourceUrl: String(imported?.sourceUrl ?? "").trim(),
          effort: imported?.effort || "normal",
          slug:
            imported?.slug ||
            `${slugify(imported?.name || "recipe")}-${Date.now()
              .toString()
              .slice(-4)}`,
        };

        setCookbook((prev) => [...prev, normalizedRecipe]);

        setImportUrl("");
        setShowManual(false);
        alert("Recipe imported!");
      } else {
        alert(data?.error || "Failed to import recipe.");
      }
    } catch {
      alert("Unable to import recipe right now. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleManualSave = (e?: FormEvent | MouseEvent) => {
    e?.preventDefault();

    if (!manualRecipe.name.trim()) {
      alert("Please enter a name.");
      return;
    }

    const cleanedRecipe: Recipe = {
      name: manualRecipe.name.trim(),
      ingredients: normalizeMultilineField(manualRecipe.ingredients),
      instructions: normalizeMultilineField(manualRecipe.instructions),
      photoUrl: manualRecipe.photoUrl.trim(),
      sourceUrl: manualRecipe.sourceUrl.trim(),
      effort: "normal",
    };

    if (editingSlug) {
      setCookbook((prev) =>
        prev.map((recipe) =>
          recipe.slug === editingSlug
            ? {
                ...recipe,
                ...cleanedRecipe,
              }
            : recipe
        )
      );
      alert("Recipe updated!");
    } else {
      const recipeToSave: Recipe = {
        ...cleanedRecipe,
        slug: `${slugify(manualRecipe.name)}-${Date.now().toString().slice(-4)}`,
      };

      setCookbook((prev) => [...prev, recipeToSave]);
      alert("Recipe saved to Cookbook!");
    }

    resetManualRecipe();
    setShowManual(false);
  };

  const btn: CSSProperties = {
    border: "none",
    borderRadius: 14,
    color: "white",
    cursor: "pointer",
    fontWeight: 800,
  };

  const sectionCard: CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 22,
    padding: 22,
    backdropFilter: "blur(10px)",
  };

  const selectedIngredientCount = selectedRecipe
    ? splitLines(selectedRecipe.ingredients).length
    : 0;

  const instructionsMissing =
    !selectedRecipe?.instructions ||
    selectedRecipe.instructions === "Steps available at source link!";

  const needsRecipeFix =
    !!selectedRecipe &&
    (splitLines(selectedRecipe.ingredients).length === 0 || instructionsMissing);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 20px 120px 20px",
      }}
    >
      <div style={{ maxWidth: "650px", width: "100%" }}>
        <header style={{ textAlign: "center", margin: "20px 0 24px" }}>
          <h2 style={{ fontSize: 34, fontWeight: 1000, margin: 0 }}>Cookbook</h2>
        </header>

        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <Card style={{ flex: 1, padding: 0 }}>
            <form
              onSubmit={handleImport}
              style={{ display: "flex", alignItems: "center", position: "relative" }}
            >
              <LinkIcon
                size={18}
                style={{ position: "absolute", left: 12, opacity: 0.4 }}
              />
              <input
                placeholder="Paste recipe URL..."
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  color: "white",
                  padding: "14px 14px 14px 40px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={isImporting}
                style={{
                  ...btn,
                  background: "#22c55e",
                  padding: "0 16px",
                  cursor: isImporting ? "default" : "pointer",
                  borderRadius: 0,
                  height: 48,
                }}
              >
                {isImporting ? "..." : "IMPORT"}
              </button>
            </form>
          </Card>

          <button
            onClick={openNewRecipeModal}
            style={{
              ...btn,
              background: "rgba(255,255,255,0.08)",
              width: 52,
              borderRadius: 14,
            }}
          >
            <Plus />
          </button>
        </div>

        {showManual && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.88)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "500px",
                background: "#1e293b",
                borderRadius: "24px",
                padding: "30px",
                position: "relative",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
              }}
            >
              <button
                onClick={() => {
                  setShowManual(false);
                  resetManualRecipe();
                }}
                style={{
                  position: "absolute",
                  right: 20,
                  top: 20,
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <X size={24} />
              </button>

              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 25 }}>
                {editingSlug ? "Edit Recipe" : "New Recipe"}
              </h2>

              {!editingSlug && (
                <div
                  style={{
                    background: "rgba(34, 197, 94, 0.05)",
                    border: "1px dashed rgba(34, 197, 94, 0.3)",
                    borderRadius: "16px",
                    padding: "20px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        background: "#22c55e",
                        color: "#000",
                        fontSize: 10,
                        fontWeight: 900,
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      BETA
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 800 }}>
                      Magic Import
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      placeholder="Paste URL..."
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      style={{
                        flex: 1,
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "white",
                        padding: "12px",
                        borderRadius: "10px",
                      }}
                    />
                    <button
                      onClick={handleImport}
                      disabled={isImporting}
                      style={{
                        ...btn,
                        background: "#22c55e",
                        padding: "0 15px",
                        borderRadius: "10px",
                        color: "white",
                        cursor: isImporting ? "default" : "pointer",
                      }}
                    >
                      {isImporting ? "..." : "Magic"}
                    </button>
                  </div>

                  <p style={{ fontSize: 11, opacity: 0.55, marginTop: 10 }}>
                    Some sites import better than others. If it misses details, use
                    manual entry.
                  </p>
                </div>
              )}

              <form onSubmit={handleManualSave} style={{ display: "grid", gap: 12 }}>
                <input
                  placeholder="Recipe Name"
                  value={manualRecipe.name}
                  onChange={(e) =>
                    setManualRecipe({ ...manualRecipe, name: e.target.value })
                  }
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                  }}
                />

                <textarea
                  placeholder="Ingredients (one per line)"
                  value={manualRecipe.ingredients}
                  onChange={(e) =>
                    setManualRecipe({
                      ...manualRecipe,
                      ingredients: e.target.value,
                    })
                  }
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    minHeight: 100,
                  }}
                />

                <textarea
                  placeholder="Instructions (one step per line)"
                  value={manualRecipe.instructions}
                  onChange={(e) =>
                    setManualRecipe({
                      ...manualRecipe,
                      instructions: e.target.value,
                    })
                  }
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    minHeight: 120,
                  }}
                />

                <div style={{ position: "relative" }}>
                  <ImageIcon
                    size={18}
                    style={{ position: "absolute", left: 12, top: 14, opacity: 0.45 }}
                  />
                  <input
                    placeholder="Photo URL (optional)"
                    value={manualRecipe.photoUrl}
                    onChange={(e) =>
                      setManualRecipe({
                        ...manualRecipe,
                        photoUrl: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "14px 14px 14px 40px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "white",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ position: "relative" }}>
                  <ExternalLink
                    size={18}
                    style={{ position: "absolute", left: 12, top: 14, opacity: 0.45 }}
                  />
                  <input
                    placeholder="Source URL (optional)"
                    value={manualRecipe.sourceUrl}
                    onChange={(e) =>
                      setManualRecipe({
                        ...manualRecipe,
                        sourceUrl: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "14px 14px 14px 40px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "white",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    ...btn,
                    padding: 16,
                    background: "rgba(34, 197, 94, 0.12)",
                    color: "#22c55e",
                    border: "1px solid #22c55e",
                  }}
                >
                  {editingSlug ? "Update Recipe" : "Save to Cookbook"}
                </button>
              </form>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {(cookbook || []).map((recipe, index) => {
            const status = getRecipeStatus(recipe);
            const ingredientCount = splitLines(recipe?.ingredients).length;
            const stepCount =
              !recipe?.instructions ||
              recipe.instructions === "Steps available at source link!"
                ? 0
                : splitLines(recipe?.instructions).length;

            return (
              <div
                key={recipe.slug || `${recipe.name}-${index}`}
                onClick={() => setSelectedRecipe(recipe)}
                style={{ cursor: "pointer" }}
              >
                <Card style={{ padding: 0, overflow: "hidden" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: recipe?.photoUrl ? "92px 1fr" : "1fr",
                      alignItems: "stretch",
                    }}
                  >
                    {recipe?.photoUrl && (
                      <div
                        style={{
                          backgroundImage: `url(${recipe.photoUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          minHeight: 92,
                        }}
                      />
                    )}

                    <div style={{ padding: "16px" }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 18,
                          marginBottom: 8,
                        }}
                      >
                        {recipe.name}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "rgba(255,255,255,0.85)",
                          }}
                        >
                          {ingredientCount} ingredients
                        </div>

                        <div
                          style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "rgba(255,255,255,0.85)",
                          }}
                        >
                          {stepCount} steps
                        </div>

                        <div
                          style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            background:
                              status === "Ready"
                                ? "rgba(34,197,94,0.12)"
                                : "rgba(250,204,21,0.12)",
                            border:
                              status === "Ready"
                                ? "1px solid rgba(34,197,94,0.35)"
                                : "1px solid rgba(250,204,21,0.35)",
                            fontSize: 12,
                            fontWeight: 800,
                            color: status === "Ready" ? "#22c55e" : "#facc15",
                          }}
                        >
                          {status}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {selectedRecipe && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(2,6,23,0.96), rgba(15,23,42,0.98))",
              zIndex: 2000,
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setSelectedRecipe(null)}
              style={{
                position: "fixed",
                right: 20,
                top: 20,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "white",
                padding: 10,
                borderRadius: "50%",
                cursor: "pointer",
                zIndex: 10,
              }}
            >
              <X />
            </button>

            <div
              style={{
                maxWidth: 900,
                margin: "0 auto",
                padding: "40px 20px 140px",
              }}
            >
              <div
                style={{
                  ...sectionCard,
                  padding: 0,
                  marginBottom: 20,
                  overflow: "hidden",
                  background:
                    "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(255,255,255,0.03))",
                }}
              >
                {selectedRecipe.photoUrl && (
                  <div
                    style={{
                      height: 220,
                      backgroundImage: `url(${selectedRecipe.photoUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                )}

                <div style={{ padding: "28px 26px" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#22c55e",
                      marginBottom: 14,
                    }}
                  >
                    <BookOpen size={14} />
                    Cookbook Recipe
                  </div>

                  <h2
                    style={{
                      fontSize: "clamp(28px, 4vw, 42px)",
                      fontWeight: 950,
                      lineHeight: 1.1,
                      margin: 0,
                      color: "#fff",
                    }}
                  >
                    {selectedRecipe.name}
                  </h2>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      marginTop: 18,
                    }}
                  >
                    <div
                      style={{
                        padding: "8px 12px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.85)",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {selectedIngredientCount} ingredients
                    </div>
                    <div
                      style={{
                        padding: "8px 12px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.85)",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {instructionsMissing
                        ? "Needs instructions"
                        : `${splitLines(selectedRecipe.instructions).length} steps`}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      marginTop: 16,
                    }}
                  >
                    {selectedRecipe.sourceUrl && (
                      <a
                        href={selectedRecipe.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          fontSize: 13,
                          color: "#22c55e",
                          textDecoration: "none",
                          fontWeight: 700,
                        }}
                      >
                        View Original Recipe →
                      </a>
                    )}

                    <button
                      onClick={() => openEditRecipe(selectedRecipe)}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "white",
                        borderRadius: 12,
                        padding: "10px 14px",
                        cursor: "pointer",
                        fontWeight: 800,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteRecipe(selectedRecipe)}
                      style={{
                        background: "rgba(239,68,68,0.12)",
                        border: "1px solid rgba(239,68,68,0.35)",
                        color: "#f87171",
                        borderRadius: 12,
                        padding: "10px 14px",
                        cursor: "pointer",
                        fontWeight: 800,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: 20,
                }}
              >
                <div style={sectionCard}>
                  <div
                    style={{
                      color: "#22c55e",
                      fontSize: 14,
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: 16,
                    }}
                  >
                    Ingredients
                  </div>

                  <p style={{ fontSize: 13, opacity: 0.55, margin: "0 0 18px" }}>
                    Select items to add to your shopping list.
                  </p>

                  <div style={{ display: "grid", gap: 10 }}>
                    {selectedIngredientCount === 0 ? (
                      <div
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          fontSize: 16,
                          lineHeight: 1.6,
                        }}
                      >
                        We couldn&apos;t detect the ingredients for this recipe.
                        Add them here in a few seconds.
                      </div>
                    ) : (
                      splitLines(selectedRecipe.ingredients).map((ing, i) => {
                        const isSelected = selectedForShop.includes(ing);

                        return (
                          <div
                            key={`${ing}-${i}`}
                            onClick={() => toggleForShop(ing)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              padding: "16px",
                              borderRadius: "16px",
                              background: isSelected
                                ? "rgba(34, 197, 94, 0.15)"
                                : "rgba(255,255,255,0.03)",
                              border: isSelected
                                ? "1px solid #22c55e"
                                : "1px solid rgba(255,255,255,0.08)",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <div
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: "6px",
                                background: isSelected ? "#22c55e" : "transparent",
                                border: isSelected
                                  ? "none"
                                  : "2px solid rgba(255,255,255,0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {isSelected && <CheckCircle2 size={16} color="white" />}
                            </div>

                            <span
                              style={{
                                fontWeight: isSelected ? 700 : 500,
                                color: isSelected ? "#fff" : "rgba(255,255,255,0.85)",
                                lineHeight: 1.5,
                              }}
                            >
                              {formatIngredients(ing)}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div style={sectionCard}>
                  <div
                    style={{
                      color: "#22c55e",
                      fontSize: 14,
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: 16,
                    }}
                  >
                    Instructions
                  </div>

                  {instructionsMissing ? (
                    <div
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 16,
                        lineHeight: 1.7,
                      }}
                    >
                      Instructions were not imported for this recipe. You can still
                      use the source link or finish the recipe manually.
                    </div>
                  ) : splitLines(selectedRecipe.instructions).length === 0 ? (
                    <div
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: 16,
                        lineHeight: 1.6,
                      }}
                    >
                      No instructions found for this recipe yet.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 16 }}>
                      {splitLines(selectedRecipe.instructions).map((step, i) => (
                        <div
                          key={`${step}-${i}`}
                          style={{
                            display: "flex",
                            gap: 14,
                            alignItems: "flex-start",
                          }}
                        >
                          <div
                            style={{
                              minWidth: 30,
                              height: 30,
                              borderRadius: 10,
                              background: "rgba(34, 197, 94, 0.15)",
                              color: "#22c55e",
                              fontWeight: 900,
                              fontSize: 13,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginTop: 2,
                            }}
                          >
                            {i + 1}
                          </div>

                          <div
                            style={{
                              color: "rgba(255,255,255,0.9)",
                              lineHeight: 1.75,
                              fontSize: 16,
                            }}
                          >
                            {step}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {needsRecipeFix && (
                    <button
                      onClick={() => openEditRecipe(selectedRecipe)}
                      style={{
                        marginTop: 18,
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: 14,
                        background: "rgba(34, 197, 94, 0.12)",
                        border: "1px solid #22c55e",
                        color: "#22c55e",
                        fontWeight: 900,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                      }}
                    >
                      <Pencil size={16} />
                      Add Ingredients & Steps
                    </button>
                  )}
                </div>
              </div>
            </div>

            {selectedForShop.length > 0 && (
              <button
                onClick={handleAddToShop}
                style={{
                  position: "fixed",
                  bottom: 34,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#22c55e",
                  color: "white",
                  padding: "18px 34px",
                  borderRadius: "999px",
                  fontWeight: 900,
                  border: "none",
                  boxShadow: "0 16px 34px rgba(34, 197, 94, 0.35)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <ShoppingCart size={18} />
                ADD {selectedForShop.length} TO LIST
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}