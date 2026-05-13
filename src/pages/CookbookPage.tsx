// =========================================================
// IMPORTS
// =========================================================

import { useEffect, useState } from "react";
import type {
  CSSProperties,
  Dispatch,
  FormEvent,
  MouseEvent,
  SetStateAction,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  X,
  Link as LinkIcon,
  Pencil,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  FileText,
} from "lucide-react";

import Card from "../components/Card";
import TipsModal from "../components/TipsModal";
import type { Meal } from "../core/types";

// =========================================================
// TYPES
// =========================================================

type RecipeEffort = NonNullable<Meal["effort"]>;

type CookbookRecipe = Meal & {
  sourceUrl?: string;
  tags?: string[];
  isVegetarian?: boolean;
  notes?: string;
};

type ManualRecipeDraft = {
  name: string;
  ingredients: string;
  instructions: string;
  photoUrl: string;
  sourceUrl: string;
  effort: RecipeEffort;
  tags: string[];
  isVegetarian: boolean;
  notes: string;
};

type CookbookPageProps = {
  cookbook: CookbookRecipe[];
  setCookbook: Dispatch<SetStateAction<CookbookRecipe[]>>;
  onAddToWeek?: (recipe: CookbookRecipe, day: string) => void;
};

// =========================================================
// HELPER FUNCTIONS
// =========================================================

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

function normalizePhotoUrl(url?: string) {
  if (!url) return "";

  const trimmed = url.trim();

  if (trimmed.startsWith("/images/")) {
    return trimmed.replace(/\.(png|jpg|jpeg)$/i, ".jpg");
  }

  return trimmed;
}

function normalizeEffort(value: unknown): RecipeEffort {
  if (
    value === "quick" ||
    value === "normal" ||
    value === "big" ||
    value === "takeout"
  ) {
    return value;
  }

  return "normal";
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((tag) => String(tag ?? "").trim().toLowerCase())
    .filter(Boolean);
}

function normalizeNotes(value: unknown): string {
  return String(value ?? "").trim();
}

function getRecipeStatus(recipe: CookbookRecipe) {
  const ingredientCount = splitLines(recipe?.ingredients).length;
  const instructionsMissing =
    !recipe?.instructions ||
    recipe.instructions === "Steps available at source link!";

  const stepCount = instructionsMissing
    ? 0
    : splitLines(recipe?.instructions).length;

  if (ingredientCount === 0 && stepCount === 0) return "Needs finishing";
  if (ingredientCount === 0) return "Needs ingredients";
  if (stepCount === 0) return "Needs steps";

  return "Ready";
}

function findPossiblyUnusedIngredients(
  ingredientsText: string,
  instructionsText: string
) {
  const instructions = instructionsText.toLowerCase();

  return splitLines(ingredientsText).filter((ingredient) => {
    const cleaned = ingredient
      .toLowerCase()
      .replace(/\([^)]*\)/g, "")
      .replace(/\d+\/\d+|\d+(\.\d+)?/g, "")
      .replace(
        /\b(cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|lb|lbs|pound|pounds|oz|ounce|ounces|g|gram|grams|ml|milliliter|milliliters|liter|liters|can|cans|jar|jars|package|packages|pinch|dash)\b/g,
        ""
      )
      .replace(/[^a-z\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleaned || cleaned.length < 3) return false;

    const words = cleaned
      .split(" ")
      .map((word) => word.trim())
      .filter((word) => word.length > 3);

    if (words.length === 0) return false;

    return !words.some((word) => instructions.includes(word));
  });
}

// =========================================================
// EMPTY DRAFT
// =========================================================

const EMPTY_MANUAL_RECIPE: ManualRecipeDraft = {
  name: "",
  ingredients: "",
  instructions: "",
  photoUrl: "",
  sourceUrl: "",
  effort: "normal",
  tags: [],
  isVegetarian: false,
  notes: "",
};

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function CookbookPage({
  cookbook = [],
  setCookbook,
  onAddToWeek,
}: CookbookPageProps) {
  // =========================================================
  // ROUTER / PAGE CONTEXT
  // =========================================================

  const navigate = useNavigate();
  const location = useLocation();
  const pickForDay = location.state?.pickForDay as string | undefined;

  // =========================================================
  // TIPS
  // =========================================================

  const COOKBOOK_TIPS = [
    "Save your favorite recipes",
    "Tap a recipe to cook it anytime",
    "Your saved recipes update instantly",
  ];

  // =========================================================
  // STATE
  // =========================================================

  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const [showTextImport, setShowTextImport] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [isTextImporting, setIsTextImporting] = useState(false);

  const [showManual, setShowManual] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [hasImportedDraft, setHasImportedDraft] = useState(false);
  const [highlightSlug, setHighlightSlug] = useState<string | null>(null);

  const [manualRecipe, setManualRecipe] =
    useState<ManualRecipeDraft>(EMPTY_MANUAL_RECIPE);

  const possiblyUnusedIngredients = findPossiblyUnusedIngredients(
    manualRecipe.ingredients,
    manualRecipe.instructions
  );

  // =========================================================
  // EFFECTS
  // =========================================================

  useEffect(() => {
    const savedSlug = localStorage.getItem("scrollToCookbook");
    if (!savedSlug) return;

    setHighlightSlug(savedSlug);

    const timer = window.setTimeout(() => {
      const el = document.getElementById(`cookbook-${savedSlug}`);

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);

    localStorage.removeItem("scrollToCookbook");

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!highlightSlug) return;

    const timer = window.setTimeout(() => {
      setHighlightSlug(null);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [highlightSlug]);

  // =========================================================
  // MODAL HELPERS
  // =========================================================

  const resetManualRecipe = () => {
    setManualRecipe(EMPTY_MANUAL_RECIPE);
    setEditingSlug(null);
    setHasImportedDraft(false);
  };

  const closeManualModal = () => {
    setShowManual(false);
    resetManualRecipe();
  };

  const openNewRecipeModal = () => {
    resetManualRecipe();
    setImportUrl("");
    setShowManual(true);
  };

  const openTextImportModal = () => {
    setShowManual(false);
    setShowTextImport(true);
  };

  const closeTextImportModal = () => {
    if (isTextImporting) return;
    setShowTextImport(false);
  };

  const openEditRecipe = (recipe: CookbookRecipe) => {
    setManualRecipe({
      name: recipe?.name || "",
      ingredients: recipe?.ingredients || "",
      instructions:
        recipe?.instructions === "Steps available at source link!"
          ? ""
          : recipe?.instructions || "",
      photoUrl: recipe?.photoUrl || "",
      sourceUrl: recipe?.sourceUrl || "",
      effort: normalizeEffort(recipe?.effort),
      tags: normalizeTags(recipe?.tags),
      isVegetarian: recipe?.isVegetarian === true,
      notes: normalizeNotes(recipe?.notes),
    });

    setEditingSlug(recipe?.slug || null);
    setHasImportedDraft(false);
    setShowManual(true);
  };

  // =========================================================
  // DELETE RECIPE
  // =========================================================

  const handleDeleteRecipe = (recipe: CookbookRecipe) => {
    const ok = window.confirm(`Delete "${recipe?.name}" from your cookbook?`);
    if (!ok) return;

    setCookbook((prev) => prev.filter((r) => r.slug !== recipe.slug));
    alert("Recipe deleted.");
  };

  // =========================================================
  // URL IMPORT
  // =========================================================

  const handleImport = async (e?: FormEvent | MouseEvent) => {
    e?.preventDefault();

    if (!importUrl.trim()) {
      alert("Please paste a recipe URL.");
      return;
    }

    setIsImporting(true);

    try {
      const API_BASE = "https://dinners.ncocaptain.com";

      (document.activeElement as HTMLElement)?.blur();

      const response = await fetch(`${API_BASE}/api/import-recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl.trim() }),
      });

      if (!response.ok) {
        let errorMessage = "Recipe import failed.";

        try {
          const errorData = await response.json();

          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Ignore JSON parse errors
        }

        console.error("Import API error:", response.status, errorMessage);
        alert(errorMessage);
        return;
      }

      const data = await response.json();

      if (data?.recipe) {
        const imported = data.recipe;

        const normalizedRecipe: ManualRecipeDraft = {
          name: String(imported?.name ?? "").trim(),
          ingredients: normalizeMultilineField(imported?.ingredients),
          instructions: normalizeMultilineField(imported?.instructions),
          photoUrl: String(imported?.photoUrl ?? "").trim(),
          sourceUrl:
            String(imported?.sourceUrl ?? "").trim() || importUrl.trim(),
          effort: normalizeEffort(imported?.effort ?? data?.effort),
          tags: normalizeTags(imported?.tags ?? data?.tags),
          isVegetarian:
            imported?.isVegetarian === true || data?.isVegetarian === true,
          notes: normalizeNotes(imported?.notes ?? data?.notes),
        };

        setManualRecipe(normalizedRecipe);

        setEditingSlug(null);
        setHasImportedDraft(true);
        setShowManual(true);
        setImportUrl("");

        if (
          !normalizedRecipe.name &&
          !normalizedRecipe.ingredients &&
          !normalizedRecipe.instructions
        ) {
          alert(
            "Import finished, but not much was found. You can fill in the details manually."
          );
        } else {
          alert("Imported recipe details. Review and save before adding it.");
        }
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

  // =========================================================
  // TEXT IMPORT
  // =========================================================

  const handleTextImport = async () => {
    if (!pasteText.trim()) {
      alert("Please paste recipe text.");
      return;
    }

    setIsTextImporting(true);

    try {
      const API_BASE = "https://dinners.ncocaptain.com";

      (document.activeElement as HTMLElement)?.blur();

      const response = await fetch(`${API_BASE}/api/import-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data?.recipe) {
        alert(data?.error || "Text import failed.");
        return;
      }

      const imported = data.recipe;

      setManualRecipe({
        name: String(imported?.name ?? "").trim(),
        ingredients: normalizeMultilineField(imported?.ingredients),
        instructions: normalizeMultilineField(imported?.instructions),
        photoUrl: String(imported?.photoUrl ?? "").trim(),
        sourceUrl: String(imported?.sourceUrl ?? "").trim(),
        effort: normalizeEffort(imported?.effort ?? data?.effort),
        tags: normalizeTags(imported?.tags ?? data?.tags),
        isVegetarian:
          imported?.isVegetarian === true || data?.isVegetarian === true,
        notes: normalizeNotes(imported?.notes ?? data?.notes),
      });

      setPasteText("");
      setShowTextImport(false);
      setEditingSlug(null);
      setHasImportedDraft(true);
      setShowManual(true);

      alert("Text recipe imported. Review and save before adding it.");
    } catch (err) {
      console.error("Text import failed:", err);
      alert("Unable to import text right now. Please try again.");
    } finally {
      setIsTextImporting(false);
    }
  };

  // =========================================================
  // SAVE MANUAL / IMPORTED RECIPE
  // =========================================================

  const handleManualSave = (e?: FormEvent | MouseEvent) => {
    e?.preventDefault();

    if (!manualRecipe.name.trim()) {
      alert("Please enter a name.");
      return;
    }

    const normalizedPhotoUrl = normalizePhotoUrl(manualRecipe.photoUrl);

    const cleanedRecipe: CookbookRecipe = {
      name: manualRecipe.name.trim(),
      ingredients: normalizeMultilineField(manualRecipe.ingredients),
      instructions: normalizeMultilineField(manualRecipe.instructions),
      photoUrl: normalizedPhotoUrl,
      sourceUrl: manualRecipe.sourceUrl.trim(),
      effort: normalizeEffort(manualRecipe.effort),
      tags: normalizeTags(manualRecipe.tags),
      isVegetarian: manualRecipe.isVegetarian === true,
      notes: normalizeNotes(manualRecipe.notes),
      id: slugify(manualRecipe.name),
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
      const recipeToSave: CookbookRecipe = {
        ...cleanedRecipe,
        slug: `${slugify(manualRecipe.name)}-${Date.now()
          .toString()
          .slice(-4)}`,
      };

      setCookbook((prev) => [...prev, recipeToSave]);
      alert("Recipe saved to Cookbook!");
    }

    closeManualModal();
  };

  // =========================================================
  // RECIPE CARD CLICK
  // =========================================================

  const handleRecipeClick = (recipe: CookbookRecipe, recipeSlug: string) => {
    if (pickForDay && onAddToWeek) {
      onAddToWeek(recipe, pickForDay);
      navigate("/week", { state: { addedDay: pickForDay } });
      return;
    }

    navigate(`/recipe/${recipeSlug}?from=/cookbook`);
  };

  // =========================================================
  // SHARED STYLES
  // =========================================================

  const btn: CSSProperties = {
    border: "none",
    borderRadius: 14,
    color: "white",
    cursor: "pointer",
    fontWeight: 800,
  };

  const pillStyle: CSSProperties = {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.85)",
  };

  const actionBtnStyle: CSSProperties = {
    width: 42,
    height: 42,
    borderRadius: 12,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.1)",
    flexShrink: 0,
  };

  const spinnerStyles = `
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
`;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <style>{spinnerStyles}</style>

      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 16px 120px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: 680, width: "100%" }}>
          {/* =========================================================
              PAGE HEADER
          ========================================================= */}

          <header>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h1>Cookbook</h1>
              <TipsModal tips={COOKBOOK_TIPS} />
            </div>
          </header>

          {/* =========================================================
              PICK FOR WEEK BANNER
          ========================================================= */}

          {pickForDay && (
            <div
              style={{
                marginBottom: 12,
                padding: "12px 14px",
                borderRadius: 14,
                background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.35)",
                color: "#60a5fa",
                fontWeight: 800,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Selecting recipe for {pickForDay}</span>

              <button
                onClick={() => navigate("/week")}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#93c5fd",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* =========================================================
              IMPORT / ADD RECIPE CARD
          ========================================================= */}

          <Card style={{ padding: 14, marginBottom: 12 }}>
            <div style={{ display: "grid", gap: 12 }}>
              <form onSubmit={handleImport} style={{ display: "grid", gap: 10 }}>
                <div
                  style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 10,
                    alignItems: "stretch",
                  }}
                >
                  <div style={{ position: "relative", minWidth: 0 }}>
                    <LinkIcon
                      size={18}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        opacity: 0.45,
                      }}
                    />

                    <input
                      placeholder="Paste recipe link..."
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "white",
                        padding: "14px 14px 14px 40px",
                        borderRadius: 18,
                        outline: "none",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isImporting}
                    style={{
                      ...btn,
                      background: "#22c55e",
                      padding: "0 18px",
                      minWidth: 96,
                      borderRadius: 18,
                      cursor: isImporting ? "default" : "pointer",
                    }}
                  >
                    {isImporting ? "..." : "IMPORT"}
                  </button>
                </div>
              </form>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <button
                  onClick={openNewRecipeModal}
                  style={{
                    ...btn,
                    padding: "14px 16px",
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <Plus size={18} />
                  Add Manually
                </button>

                <button
                  onClick={openTextImportModal}
                  style={{
                    ...btn,
                    padding: "14px 16px",
                    borderRadius: 18,
                    background: "rgba(59,130,246,0.12)",
                    border: "1px solid rgba(59,130,246,0.28)",
                    color: "#93c5fd",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <FileText size={18} />
                  Paste Text
                </button>
              </div>
            </div>
          </Card>

          {/* =========================================================
              MANUAL / REVIEW MODAL
          ========================================================= */}

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
                  maxWidth: "520px",
                  background: "#1e293b",
                  borderRadius: "24px",
                  padding: "28px",
                  position: "relative",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  boxSizing: "border-box",
                }}
              >
                <button
                  onClick={closeManualModal}
                  style={{
                    position: "absolute",
                    right: 18,
                    top: 18,
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  <X size={24} />
                </button>

                <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
                  {editingSlug
                    ? "Edit Recipe"
                    : hasImportedDraft
                    ? "Review Imported Recipe"
                    : "New Recipe"}
                </h2>

                <p
                  style={{
                    marginTop: 0,
                    marginBottom: 18,
                    opacity: 0.72,
                    lineHeight: 1.5,
                    fontSize: 14,
                  }}
                >
                  {editingSlug
                    ? "Update your recipe details below."
                    : hasImportedDraft
                    ? "Review the imported details and make any edits before saving."
                    : "Add a recipe manually, or paste a recipe URL below to import details."}
                </p>

                {!editingSlug && (
                  <div
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px dashed rgba(255,255,255,0.12)",
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        marginBottom: 10,
                      }}
                    >
                      Import from URL
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 8,
                      }}
                    >
                      <div style={{ position: "relative", minWidth: 0 }}>
                        <LinkIcon
                          size={18}
                          style={{
                            position: "absolute",
                            left: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            opacity: 0.45,
                          }}
                        />

                        <input
                          placeholder="Paste recipe link..."
                          value={importUrl}
                          onChange={(e) => setImportUrl(e.target.value)}
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            background: "rgba(0,0,0,0.3)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "white",
                            padding: "12px 12px 12px 40px",
                            borderRadius: 12,
                            outline: "none",
                          }}
                        />
                      </div>

                      <button
                        onClick={handleImport}
                        disabled={isImporting}
                        style={{
                          ...btn,
                          background: "#22c55e",
                          padding: "0 16px",
                          borderRadius: 12,
                          color: "white",
                          cursor: isImporting ? "default" : "pointer",
                          minWidth: 96,
                        }}
                      >
                        {isImporting
                          ? "..."
                          : hasImportedDraft
                          ? "Re-import"
                          : "Import"}
                      </button>
                    </div>

                    <p
                      style={{
                        fontSize: 12,
                        opacity: 0.66,
                        marginTop: 10,
                        lineHeight: 1.5,
                        marginBottom: 0,
                      }}
                    >
                      {hasImportedDraft
                        ? "Imported details are loaded below. Edit anything you want before saving."
                        : "Ingredients and instructions are imported when available. You can edit everything before saving."}
                    </p>
                  </div>
                )}

                {hasImportedDraft && possiblyUnusedIngredients.length > 0 && (
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      background: "rgba(250,204,21,0.12)",
                      border: "1px solid rgba(250,204,21,0.3)",
                      color: "#fde68a",
                      fontSize: 13,
                      lineHeight: 1.5,
                      fontWeight: 700,
                      marginBottom: 14,
                    }}
                  >
                    Some ingredients may not appear in the instructions. Give
                    this recipe a quick review before saving.
                  </div>
                )}

                {hasImportedDraft && (
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      background: "rgba(59,130,246,0.1)",
                      border: "1px solid rgba(59,130,246,0.25)",
                      color: "#bfdbfe",
                      fontSize: 12,
                      lineHeight: 1.5,
                      fontWeight: 700,
                      marginBottom: 14,
                    }}
                  >
                    Smart details detected: {manualRecipe.effort} effort
                    {manualRecipe.isVegetarian ? " · Vegetarian" : ""}
                    {manualRecipe.tags.length > 0
                      ? ` · ${manualRecipe.tags.slice(0, 4).join(", ")}`
                      : ""}
                  </div>
                )}

                <form
                  onSubmit={handleManualSave}
                  style={{ display: "grid", gap: 12 }}
                >
                  <input
                    placeholder="Recipe Name"
                    value={manualRecipe.name}
                    onChange={(e) =>
                      setManualRecipe({
                        ...manualRecipe,
                        name: e.target.value,
                      })
                    }
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "white",
                      outline: "none",
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
                      minHeight: 110,
                      outline: "none",
                      resize: "vertical",
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
                      minHeight: 130,
                      outline: "none",
                      resize: "vertical",
                    }}
                  />

                  <div style={{ position: "relative" }}>
                    <ImageIcon
                      size={18}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: 14,
                        opacity: 0.45,
                      }}
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
                        outline: "none",
                      }}
                    />
                  </div>

                  <div style={{ position: "relative" }}>
                    <ExternalLink
                      size={18}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: 14,
                        opacity: 0.45,
                      }}
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
                        outline: "none",
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

          {/* =========================================================
              PASTE TEXT MODAL
          ========================================================= */}

          {showTextImport && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.88)",
                zIndex: 10001,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 560,
                  background: "#1e293b",
                  borderRadius: 24,
                  padding: 28,
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 18,
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>
                    Paste Recipe Text
                  </h2>

                  <button
                    onClick={closeTextImportModal}
                    style={{
                      background: "none",
                      border: "none",
                      color: "white",
                      cursor: isTextImporting ? "default" : "pointer",
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>

                <p
                  style={{
                    opacity: 0.72,
                    lineHeight: 1.6,
                    marginBottom: 18,
                    fontSize: 14,
                  }}
                >
                  Paste recipe text from websites, Facebook posts, notes,
                  screenshots, or anywhere else.
                </p>

                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste recipe text here..."
                  disabled={isTextImporting}
                  style={{
                    width: "100%",
                    minHeight: 260,
                    resize: "vertical",
                    borderRadius: 16,
                    padding: 16,
                    boxSizing: "border-box",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    outline: "none",
                    marginBottom: 18,
                    lineHeight: 1.6,
                    opacity: isTextImporting ? 0.72 : 1,
                  }}
                />

                <button
                  onClick={handleTextImport}
                  disabled={isTextImporting}
                  style={{
                    ...btn,
                    width: "100%",
                    padding: 16,
                    borderRadius: 16,
                    background: "rgba(59,130,246,0.18)",
                    border: "1px solid rgba(59,130,246,0.35)",
                    color: "#93c5fd",
                    cursor: isTextImporting ? "default" : "pointer",
                  }}
                >
                  {isTextImporting
                    ? "Simple Dinners is organizing your recipe..."
                    : "Import Recipe Text"}
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              COOKBOOK LIST
          ========================================================= */}

          <div style={{ display: "grid", gap: 14 }}>
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

              const recipePhotoUrl = normalizePhotoUrl(recipe?.photoUrl);

              return (
                <div
                  key={recipeSlug}
                  id={`cookbook-${recipeSlug}`}
                  onClick={() => handleRecipeClick(recipe, recipeSlug)}
                  style={{ cursor: "pointer" }}
                >
                  <Card
                    style={{
                      padding: 0,
                      overflow: "hidden",
                      outline:
                        highlightSlug === recipeSlug
                          ? "2px solid #22c55e"
                          : undefined,
                      boxShadow:
                        highlightSlug === recipeSlug
                          ? "0 0 0 4px rgba(34,197,94,0.12)"
                          : undefined,
                      transition: "outline 0.2s ease, box-shadow 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: recipePhotoUrl
                          ? "84px minmax(0,1fr) auto"
                          : "minmax(0,1fr) auto",
                        alignItems: "stretch",
                      }}
                    >
                      {recipePhotoUrl && (
                        <img
                          src={recipePhotoUrl}
                          alt={recipe.name}
                          style={{
                            width: 84,
                            minHeight: 104,
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      )}

                      <div style={{ padding: 16, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 18,
                            marginBottom: 10,
                            lineHeight: 1.25,
                            wordBreak: "break-word",
                          }}
                        >
                          {recipe.name}
                        </div>

                        {pickForDay && (
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 12,
                              fontWeight: 800,
                              color: "#60a5fa",
                            }}
                          >
                            Tap to add to {pickForDay}
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={pillStyle}>
                            {ingredientCount} ingredients
                          </div>

                          <div style={pillStyle}>{stepCount} steps</div>

                          <div
                            style={{
                              ...pillStyle,
                              background:
                                status === "Ready"
                                  ? "rgba(34,197,94,0.12)"
                                  : "rgba(250,204,21,0.12)",
                              border:
                                status === "Ready"
                                  ? "1px solid rgba(34,197,94,0.35)"
                                  : "1px solid rgba(250,204,21,0.35)",
                              color: status === "Ready" ? "#22c55e" : "#facc15",
                              fontWeight: 800,
                            }}
                          >
                            {status}
                          </div>

                          {recipe.effort && (
                            <div style={pillStyle}>{recipe.effort}</div>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          gap: 8,
                          padding: 12,
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditRecipe(recipe);
                          }}
                          style={{
                            ...actionBtnStyle,
                            background: "rgba(255,255,255,0.05)",
                            color: "white",
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
                            ...actionBtnStyle,
                            background: "rgba(239,68,68,0.12)",
                            border: "1px solid rgba(239,68,68,0.35)",
                            color: "#f87171",
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

          {/* =========================================================
              IMPORT LOADING OVERLAY
          ========================================================= */}

          {isImporting && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.76)",
                zIndex: 10000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                backdropFilter: "blur(4px)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 360,
                  borderRadius: 28,
                  padding: "28px 24px",
                  background: "#1e293b",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 25px 70px rgba(0,0,0,0.5)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 999,
                    margin: "0 auto 18px",
                    border: "4px solid rgba(34,197,94,0.18)",
                    borderTopColor: "#22c55e",
                    animation: "spin 0.9s linear infinite",
                  }}
                />

                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    marginBottom: 10,
                  }}
                >
                  Importing Recipe...
                </div>

                <div
                  style={{
                    fontSize: 14,
                    opacity: 0.72,
                    lineHeight: 1.6,
                  }}
                >
                  We're grabbing the ingredients, instructions, and recipe image.
                  <br />
                  Some websites can take up to a minute.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}