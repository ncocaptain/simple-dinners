import { useState } from "react";
import type { CSSProperties, FormEvent, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  X,
  Link as LinkIcon,
  Pencil,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import Card from "../components/Card";

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
  const navigate = useNavigate();

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
    setShowManual(true);
  };

  const handleDeleteRecipe = (recipe: Recipe) => {
    const ok = window.confirm(`Delete "${recipe?.name}" from your cookbook?`);
    if (!ok) return;

    setCookbook((prev) => prev.filter((r) => r.slug !== recipe.slug));
    alert("Recipe deleted.");
  };

  const handleImport = async (e?: React.FormEvent | React.MouseEvent) => {
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

      if (!response.ok) {
        const text = await response.text();
        console.error("Import API error:", response.status, text);
        alert("Recipe import failed.");
        return;
      }

      const data = await response.json();

      if (data?.recipe) {
        const imported = data.recipe;

        const normalizedRecipe = {
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
    } catch (err) {
      console.error("Import failed:", err);
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

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 20px 120px",
      }}
    >
      <div style={{ maxWidth: "650px", width: "100%" }}>
        <header style={{ textAlign: "center", margin: "0 0 14px" }}>
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
                placeholder="Paste recipe link..."
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
                    background: "rgba(255,255,255,0.03)",
                    border: "1px dashed rgba(255,255,255,0.12)",
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
                      flexWrap: "wrap",
                    }}
                  >
                    
                    <span style={{ fontSize: 16, fontWeight: 800 }}>
                      Import from URL
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      placeholder="Paste recipe link..."
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
                      {isImporting ? "..." : "Import"}
                    </button>
                  </div>

                  <p style={{ fontSize: 11, opacity: 0.62, marginTop: 10, lineHeight: 1.5 }}>
                    Imports ingredients and steps when possible. You can edit
                    anything below.
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

            const recipeSlug =
              recipe.slug || `${slugify(recipe.name || "recipe")}-${index}`;

            return (
              <div
                key={recipeSlug}
                onClick={() => navigate(`/recipe/${recipeSlug}?from=/cookbook`)}
                style={{ cursor: "pointer" }}
              >
                <Card style={{ padding: 0, overflow: "hidden" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: recipe?.photoUrl ? "92px 1fr auto" : "1fr auto",
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

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "16px",
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditRecipe(recipe);
                        }}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "white",
                          borderRadius: 12,
                          padding: "10px 12px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Edit recipe"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRecipe(recipe);
                        }}
                        style={{
                          background: "rgba(239,68,68,0.12)",
                          border: "1px solid rgba(239,68,68,0.35)",
                          color: "#f87171",
                          borderRadius: 12,
                          padding: "10px 12px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Delete recipe"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}