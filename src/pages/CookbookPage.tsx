// =========================================================
// IMPORTS
// =========================================================

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ChangeEvent,
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
import { t, getStoredLanguage } from "../i18n";
import type { Meal } from "../core/types";
import { getLocalizedMeal } from "../core/localizedMeal";
import { Capacitor } from "@capacitor/core";
import {
  CookbookSyncStatus,
} from "../cloud/CookbookSyncStatus";
import { API_BASE } from "../core/api";

const SOURCE_STEPS_PLACEHOLDER = "Steps available at source link!";

const MAX_SCREENSHOT_FILES = 5;
const MAX_SCREENSHOT_FILE_BYTES = 8 * 1024 * 1024;
const MAX_SCREENSHOT_TOTAL_BYTES = 25 * 1024 * 1024;

const SCREENSHOT_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

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
    const extension = Capacitor.getPlatform() === "android" ? ".webp" : ".jpg";
    return trimmed.replace(/\.(png|jpg|jpeg|webp)$/i, extension);
  }

  return trimmed;
}

function getSharedRecipeUrlFromSearch(search: string) {
  const params = new URLSearchParams(search);

  const rawUrl =
    params.get("url") ||
    params.get("sharedUrl") ||
    params.get("text") ||
    "";

  const trimmed = rawUrl.trim();

  if (!trimmed) return "";

  const directUrlMatch = trimmed.match(/https?:\/\/[^\s]+/i);

  if (directUrlMatch) {
    return directUrlMatch[0];
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

function normalizeImportedRecipe(
  imported: any,
  data: any = {},
  fallbackSourceUrl = ""
): ManualRecipeDraft {
  return {
    name: String(imported?.name ?? "").trim(),
    ingredients: normalizeMultilineField(imported?.ingredients),
    instructions: normalizeMultilineField(imported?.instructions),
    photoUrl: String(imported?.photoUrl ?? "").trim(),
    sourceUrl:
      String(imported?.sourceUrl ?? "").trim() || fallbackSourceUrl.trim(),
    effort: normalizeEffort(imported?.effort ?? data?.effort),
    tags: normalizeTags(imported?.tags ?? data?.tags),
    isVegetarian:
      imported?.isVegetarian === true || data?.isVegetarian === true,
    notes: normalizeNotes(imported?.notes ?? data?.notes),
  };
}

function hasRealRecipeDetails(recipe: ManualRecipeDraft) {
  const ingredientCount = splitLines(recipe.ingredients).length;

  const instructions = normalizeMultilineField(recipe.instructions);
  const instructionsArePlaceholder =
    !instructions ||
    instructions.trim().toLowerCase() ===
    "steps available at source link!".toLowerCase();

  const stepCount = instructionsArePlaceholder
    ? 0
    : splitLines(instructions).length;

  return ingredientCount > 0 && stepCount > 0;
}

function looksLikeSocialRecipeUrl(url: string) {
  const value = String(url || "").toLowerCase();

  return (
    value.includes("facebook.com") ||
    value.includes("fb.watch") ||
    value.includes("instagram.com") ||
    value.includes("tiktok.com") ||
    value.includes("pinterest.com")
  );
}

function getRecipeStatus(recipe: CookbookRecipe) {
  const ingredientCount = splitLines(recipe?.ingredients).length;
  const instructionsMissing =
    !recipe?.instructions ||
    recipe.instructions === SOURCE_STEPS_PLACEHOLDER;

  const stepCount = instructionsMissing
    ? 0
    : splitLines(recipe?.instructions).length;

  if (ingredientCount === 0 && stepCount === 0) return "Needs finishing";
  if (ingredientCount === 0) return "Needs ingredients";
  if (stepCount === 0) return "Needs steps";

  return "Ready";
}

function normalizeIngredientForMatching(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b\d+\s*x\s*\d+\b/g, " ")
    .replace(/\d+\/\d+|\d+(\.\d+)?/g, " ")
    .replace(
      /\b(cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|lb|lbs|pound|pounds|oz|ounce|ounces|g|gram|grams|ml|milliliter|milliliters|liter|liters|can|cans|jar|jars|package|packages|pinch|dash|clove|cloves|slice|slices|piece|pieces|medium|large|small)\b/g,
      " "
    )
    .replace(
      /\b(chopped|minced|sliced|diced|grated|shredded|softened|melted|divided|optional|fresh|dried|finely|roughly|thinly|halved|peeled|seeded|drained|rinsed|packed|about|plus|more|less|for|serving|serve|to|taste|if|using)\b/g,
      " "
    )
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ingredientLooksLikeHeading(line: string) {
  const text = line.trim();

  return (
    text.endsWith(":") &&
    text.length <= 32 &&
    !/\d/.test(text)
  );
}

function getIngredientKeywords(ingredient: string) {
  const normalized = normalizeIngredientForMatching(ingredient);

  if (!normalized) return [];

  const stopWords = new Set([
    "and",
    "or",
    "with",
    "the",
    "for",
    "into",
    "from",
    "your",
    "their",
    "this",
    "that",
    "mixture",
  ]);

  const synonymMap: Record<string, string[]> = {
    oil: ["oil", "olive oil", "canola oil", "vegetable oil"],
    tomatoes: ["tomato", "tomatoes"],
    tomato: ["tomato", "tomatoes"],
    potatoes: ["potato", "potatoes"],
    potato: ["potato", "potatoes"],
    mushrooms: ["mushroom", "mushrooms"],
    mushroom: ["mushroom", "mushrooms"],
    noodles: ["noodle", "noodles", "pasta"],
    noodle: ["noodle", "noodles", "pasta"],
    cheese: ["cheese", "cheddar", "mozzarella", "parmesan", "gouda"],
    cheddar: ["cheddar", "cheese"],
    mozzarella: ["mozzarella", "cheese"],
    parmesan: ["parmesan", "cheese"],
    garlic: ["garlic"],
    ginger: ["ginger"],
    basil: ["basil"],
    parsley: ["parsley"],
    cilantro: ["cilantro"],
    onion: ["onion", "onions", "shallot", "shallots"],
    onions: ["onion", "onions", "shallot", "shallots"],
    shallot: ["shallot", "shallots", "onion", "onions"],
    shallots: ["shallot", "shallots", "onion", "onions"],
    chicken: ["chicken"],
    beef: ["beef"],
    pork: ["pork", "sausage"],
    sausage: ["sausage", "pork"],
    tofu: ["tofu"],
    broth: ["broth", "stock"],
    stock: ["stock", "broth"],
    sauce: ["sauce"],
    vinegar: ["vinegar"],
    honey: ["honey"],
    preserves: ["preserves", "jam"],
    seasoning: ["seasoning", "seasonings"],
    soup: ["soup"],
  };

  const words = normalized
    .split(" ")
    .map((word) => word.trim())
    .filter((word) => word.length > 2)
    .filter((word) => !stopWords.has(word));

  const keywords = new Set<string>();

  words.forEach((word) => {
    keywords.add(word);

    if (word.endsWith("s") && word.length > 4) {
      keywords.add(word.slice(0, -1));
    }

    const synonyms = synonymMap[word];

    if (synonyms) {
      synonyms.forEach((synonym) => keywords.add(synonym));
    }
  });

  return Array.from(keywords);
}

function findPossiblyUnusedIngredients(
  ingredientsText: string,
  instructionsText: string
) {
  const instructions = normalizeIngredientForMatching(instructionsText);

  if (!instructions) return [];

  const alwaysIgnore = [
    "salt",
    "pepper",
    "black pepper",
    "chili flakes",
    "red pepper flakes",
    "water",
    "cooking spray",
    "nonstick cooking spray",
    "oil for frying",
  ];

  return splitLines(ingredientsText).filter((ingredient) => {
    const original = ingredient.trim();
    const normalized = normalizeIngredientForMatching(original);

    if (!original || !normalized) return false;
    if (ingredientLooksLikeHeading(original)) return false;

    if (
      alwaysIgnore.some(
        (item) =>
          normalized === item ||
          normalized.includes(item) ||
          item.includes(normalized)
      )
    ) {
      return false;
    }

    const keywords = getIngredientKeywords(original);

    if (keywords.length === 0) return false;

    const meaningfulKeywords = keywords.filter((keyword) => keyword.length > 3);

    if (meaningfulKeywords.length === 0) return false;

    return !meaningfulKeywords.some((keyword) =>
      instructions.includes(keyword)
    );
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


const COOKBOOK_TIP_KEYS = [
  "cookbook.tips.saveFavorites",
  "cookbook.tips.tapRecipe",
  "cookbook.tips.instantUpdates",
];

function getCookbookDayLabel(day: string) {
  const labels: Record<string, string> = {
    Monday: t("week.days.monday"),
    Tuesday: t("week.days.tuesday"),
    Wednesday: t("week.days.wednesday"),
    Thursday: t("week.days.thursday"),
    Friday: t("week.days.friday"),
    Saturday: t("week.days.saturday"),
    Sunday: t("week.days.sunday"),
  };

  return labels[day] || day;
}

function getCookbookEffortLabel(effort?: string) {
  const value = String(effort || "normal").toLowerCase();

  const labels: Record<string, string> = {
    quick: t("recipes.effort.quick"),
    normal: t("recipes.effort.normal"),
    big: t("recipes.effort.big"),
    takeout: t("recipes.effort.takeout"),
  };

  return labels[value] || value;
}

function getRecipeStatusLabel(status: string) {
  const labels: Record<string, string> = {
    Ready: t("cookbook.status.ready"),
    "Needs finishing": t("cookbook.status.needsFinishing"),
    "Needs ingredients": t("cookbook.status.needsIngredients"),
    "Needs steps": t("cookbook.status.needsSteps"),
  };

  return labels[status] || status;
}

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
  const cookbookTips = COOKBOOK_TIP_KEYS.map((key) => t(key));
  const language = getStoredLanguage();

  // =========================================================
  // STATE
  // =========================================================

  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const [captionAssistDraft, setCaptionAssistDraft] =
    useState<ManualRecipeDraft | null>(null);
  const [captionAssistText, setCaptionAssistText] = useState("");
  const [captionAssistStatus, setCaptionAssistStatus] = useState("");
  const [isCaptionAssisting, setIsCaptionAssisting] = useState(false);
  const [captionAssistAction, setCaptionAssistAction] = useState<
    "caption" | "screenshots" | null
  >(null);

  const captionScreenshotInputRef = useRef<HTMLInputElement | null>(null);
  const [captionScreenshotFiles, setCaptionScreenshotFiles] = useState<File[]>([]);
  const [captionScreenshotPreviewUrls, setCaptionScreenshotPreviewUrls] =
    useState<string[]>([]);
  const [captionScreenshotError, setCaptionScreenshotError] = useState("");

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
  const localizedCookbook = useMemo(
    () =>
      (cookbook || []).map((recipe) => ({
        raw: recipe,
        display: getLocalizedMeal(recipe, language) || recipe,
      })),
    [cookbook, language]
  );

  // =========================================================
  // EFFECTS
  // =========================================================

  useEffect(() => {
    const previewUrls = captionScreenshotFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setCaptionScreenshotPreviewUrls(previewUrls);

    return () => {
      previewUrls.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
    };
  }, [captionScreenshotFiles]);

  useEffect(() => {
    const sharedUrl = getSharedRecipeUrlFromSearch(location.search);

    if (!sharedUrl) return;

    setImportUrl(sharedUrl);

    const timer = window.setTimeout(() => {
      const input = document.getElementById("cookbook-import-url-input");

      if (input) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        (input as HTMLInputElement).focus();
      }
    }, 150);

    return () => window.clearTimeout(timer);
  }, [location.search]);

  useEffect(() => {
    const sharedImportedRecipe = location.state?.sharedImportedRecipe;

    if (!sharedImportedRecipe) return;

    const normalizedRecipe = normalizeImportedRecipe(sharedImportedRecipe);

    setManualRecipe(normalizedRecipe);
    setEditingSlug(null);
    setHasImportedDraft(true);
    setShowManual(true);

    navigate("/cookbook", { replace: true });
  }, [location.state, navigate]);

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

  const resetCaptionScreenshots = () => {
    setCaptionScreenshotFiles([]);
    setCaptionScreenshotError("");

    if (captionScreenshotInputRef.current) {
      captionScreenshotInputRef.current.value = "";
    }
  };

  const openCaptionAssistModal = (recipe: ManualRecipeDraft) => {
    setCaptionAssistDraft(recipe);
    setCaptionAssistText("");
    resetCaptionScreenshots();
    setCaptionAssistAction(null);
    setCaptionAssistStatus(
      "We found the post, but not the full recipe text. Paste the caption, use screenshots, or save it as Needs Finishing."
    );
    setShowTextImport(false);
    setShowManual(false);
  };

  const closeCaptionAssistModal = () => {
    if (isCaptionAssisting) return;
    setCaptionAssistDraft(null);
    setCaptionAssistText("");
    resetCaptionScreenshots();
    setCaptionAssistAction(null);
    setCaptionAssistStatus("");
  };

  const chooseCaptionScreenshots = () => {
    captionScreenshotInputRef.current?.click();
  };

  const handleCaptionScreenshotSelection = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.currentTarget.files || []);

    // Let the user pick the same file again after removing it.
    event.currentTarget.value = "";

    if (selectedFiles.length === 0) return;

    const invalidType = selectedFiles.find(
      (file) => !SCREENSHOT_MIME_TYPES.has(file.type)
    );

    if (invalidType) {
      setCaptionScreenshotError(
        "Please choose JPEG, PNG, or WebP screenshots."
      );
      return;
    }

    const oversizedFile = selectedFiles.find(
      (file) => file.size > MAX_SCREENSHOT_FILE_BYTES
    );

    if (oversizedFile) {
      setCaptionScreenshotError(
        `${oversizedFile.name} is larger than 8 MB.`
      );
      return;
    }

    if (
      captionScreenshotFiles.length + selectedFiles.length >
      MAX_SCREENSHOT_FILES
    ) {
      setCaptionScreenshotError(
        `Choose up to ${MAX_SCREENSHOT_FILES} screenshots total.`
      );
      return;
    }

    const combinedFiles = [...captionScreenshotFiles, ...selectedFiles];
    const totalBytes = combinedFiles.reduce(
      (total, file) => total + file.size,
      0
    );

    if (totalBytes > MAX_SCREENSHOT_TOTAL_BYTES) {
      setCaptionScreenshotError(
        "Those screenshots are larger than 25 MB combined. Try fewer or smaller images."
      );
      return;
    }

    setCaptionScreenshotFiles(combinedFiles);
    setCaptionScreenshotError("");
  };

  const removeCaptionScreenshot = (indexToRemove: number) => {
    setCaptionScreenshotFiles((currentFiles) =>
      currentFiles.filter((_, index) => index !== indexToRemove)
    );
    setCaptionScreenshotError("");
  };

  const saveCaptionAssistNeedsFinishing = () => {
    if (!captionAssistDraft) return;

    setManualRecipe(captionAssistDraft);
    setEditingSlug(null);
    setHasImportedDraft(true);
    setShowManual(true);
    setCaptionAssistDraft(null);
    setCaptionAssistText("");
    resetCaptionScreenshots();
    setCaptionAssistAction(null);
    setCaptionAssistStatus("");
  };

  const openEditRecipe = (recipe: CookbookRecipe) => {
    setManualRecipe({
      name: recipe?.name || "",
      ingredients: recipe?.ingredients || "",
      instructions:
        recipe?.instructions === SOURCE_STEPS_PLACEHOLDER
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
    const ok = window.confirm(`${t("cookbook.confirmDeletePrefix")} "${recipe?.name}" ${t("cookbook.confirmDeleteSuffix")}`);
    if (!ok) return;

    setCookbook((prev) => prev.filter((r) => r.slug !== recipe.slug));
    alert(t("cookbook.recipeDeleted"));
  };

  // =========================================================
  // URL IMPORT
  // =========================================================

  const handleImport = async (e?: FormEvent | MouseEvent) => {
    e?.preventDefault();

    if (!importUrl.trim()) {
      alert(t("cookbook.alertPasteUrl"));
      return;
    }

    setIsImporting(true);

    try {
      (document.activeElement as HTMLElement)?.blur();

      const response = await fetch(`${API_BASE}/import-recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl.trim() }),
      });

      if (!response.ok) {
        let errorMessage = t("cookbook.recipeImportFailed");

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
        const normalizedRecipe = normalizeImportedRecipe(
          imported,
          data,
          importUrl.trim()
        );

        const importSourceUrl = normalizedRecipe.sourceUrl || importUrl.trim();

        if (!hasRealRecipeDetails(normalizedRecipe)) {
          if (looksLikeSocialRecipeUrl(importSourceUrl)) {
            setImportUrl(importSourceUrl);
            openCaptionAssistModal(normalizedRecipe);
            return;
          }

          alert(
            "Simple Dinners found the link, but could not read enough recipe details. Try Paste Text if the recipe is shown on the page."
          );

          setPasteText("");
          setShowTextImport(true);
          setImportUrl(importSourceUrl);

          return;
        }

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
          alert(t("cookbook.importSparse"));
        } else {
          alert(t("cookbook.importedReviewSave"));
        }
      } else {
        alert(data?.error || t("cookbook.failedToImportRecipe"));
      }
    } catch (err) {
      console.error("Import failed:", err);
      alert(t("cookbook.unableImportNow"));
    } finally {
      setIsImporting(false);
    }
  };

  const handleCaptionAssistImport = async () => {
    if (!captionAssistDraft) return;

    if (!captionAssistText.trim()) {
      setCaptionAssistStatus("Paste the recipe caption first.");
      return;
    }

    const sourceUrl = captionAssistDraft.sourceUrl || importUrl.trim();

    if (!sourceUrl) {
      setCaptionAssistStatus("Missing source link for this recipe.");
      return;
    }

    setIsCaptionAssisting(true);
    setCaptionAssistAction("caption");
    setCaptionAssistStatus("Finishing recipe from caption...");

    try {
      const cleanedCaptionText = captionAssistText.trim();

      const response = await fetch(`${API_BASE}/import-recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: sourceUrl,
          captionText: cleanedCaptionText,
          sharedText: cleanedCaptionText,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.recipe) {
        throw new Error(data?.error || "Caption Assist failed.");
      }

      const normalizedRecipe = normalizeImportedRecipe(
        data.recipe,
        data,
        sourceUrl
      );

      if (!hasRealRecipeDetails(normalizedRecipe)) {
        setCaptionAssistStatus(
          "We still couldn't finish this recipe from the caption. Try pasting the full caption, including the ingredients and steps."
        );
        return;
      }

      setManualRecipe(normalizedRecipe);
      setEditingSlug(null);
      setHasImportedDraft(true);
      setShowManual(true);
      setImportUrl("");
      setCaptionAssistDraft(null);
      setCaptionAssistText("");
      resetCaptionScreenshots();
      setCaptionAssistStatus("");

      alert(t("cookbook.importedReviewSave"));
    } catch (err) {
      console.error("Caption Assist failed:", err);
      setCaptionAssistStatus(
        "We couldn’t finish this recipe from the caption. You can still save it and edit it manually."
      );
    } finally {
      setIsCaptionAssisting(false);
      setCaptionAssistAction(null);
    }
  };

  const handleScreenshotAssistImport = async () => {
    if (!captionAssistDraft) return;

    if (captionScreenshotFiles.length === 0) {
      setCaptionScreenshotError("Choose at least one screenshot.");
      return;
    }

    const sourceUrl = captionAssistDraft.sourceUrl || importUrl.trim();
    const rawSourceTitle = captionAssistDraft.name.trim();
    const sourceTitle =
      /^(instagram|tiktok|facebook|social|saved|imported)( recipe)?$/i.test(
        rawSourceTitle
      )
        ? ""
        : rawSourceTitle;

    setIsCaptionAssisting(true);
    setCaptionAssistAction("screenshots");
    setCaptionScreenshotError("");
    setCaptionAssistStatus(
      captionScreenshotFiles.length === 1
        ? "Reading recipe screenshot..."
        : `Combining ${captionScreenshotFiles.length} recipe screenshots...`
    );

    try {
      const formData = new FormData();

      captionScreenshotFiles.forEach((file) => {
        formData.append("screenshots", file, file.name);
      });

      if (sourceUrl) {
        formData.append("sourceUrl", sourceUrl);
      }

      if (sourceTitle) {
        formData.append("sourceTitle", sourceTitle);
      }

      formData.append("language", language || navigator.language || "en");

      const response = await fetch(`${API_BASE}/import-screenshots`, {
        method: "POST",
        body: formData,
      });

      let data: any;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Simple Dinners could not read the screenshot import response."
        );
      }

      if (!response.ok || !data?.success || !data?.recipe) {
        throw new Error(
          data?.error ||
          "Simple Dinners could not read a recipe from those screenshots."
        );
      }

      const mergedRecipe = {
        ...data.recipe,
        photoUrl: data.recipe.photoUrl || captionAssistDraft.photoUrl,
        sourceUrl: data.recipe.sourceUrl || sourceUrl,
      };

      const normalizedRecipe = normalizeImportedRecipe(
        mergedRecipe,
        data,
        sourceUrl
      );

      setManualRecipe(normalizedRecipe);
      setEditingSlug(null);
      setHasImportedDraft(true);
      setShowManual(true);
      setImportUrl("");
      setCaptionAssistDraft(null);
      setCaptionAssistText("");
      resetCaptionScreenshots();
      setCaptionAssistStatus("");

      alert(t("cookbook.importedReviewSave"));
    } catch (err) {
      console.error("Screenshot Assist failed:", err);
      setCaptionAssistStatus(
        err instanceof Error
          ? err.message
          : "We couldn’t read a recipe from those screenshots. Try again or save it as Needs Finishing."
      );
    } finally {
      setIsCaptionAssisting(false);
      setCaptionAssistAction(null);
    }
  };

  // =========================================================
  // TEXT IMPORT
  // =========================================================

  const handleTextImport = async () => {
    if (!pasteText.trim()) {
      alert(t("cookbook.alertPasteText"));
      return;
    }

    setIsTextImporting(true);

    try {
      (document.activeElement as HTMLElement)?.blur();

      const response = await fetch(`${API_BASE}/import-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data?.recipe) {
        alert(data?.error || t("cookbook.textImportFailed"));
        return;
      }

      const imported = data.recipe;

      setManualRecipe(normalizeImportedRecipe(imported, data));

      setPasteText("");
      setShowTextImport(false);
      setEditingSlug(null);
      setHasImportedDraft(true);
      setShowManual(true);

      alert(t("cookbook.textImportedReview"));
    } catch (err) {
      console.error("Text import failed:", err);
      alert(t("cookbook.unableImportTextNow"));
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
      alert(t("cookbook.alertEnterName"));
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

      alert(t("cookbook.recipeUpdated"));
    } else {
      const recipeToSave: CookbookRecipe = {
        ...cleanedRecipe,
        slug: `${slugify(manualRecipe.name)}-${Date.now()
          .toString()
          .slice(-4)}`,
      };

      setCookbook((prev) => [...prev, recipeToSave]);
      alert(t("cookbook.recipeSavedToCookbook"));
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
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(38px, 9vw, 58px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.055em",
                  fontWeight: 1000,
                }}
              >
                {t("cookbook.title")}
              </h1>

              <TipsModal tips={cookbookTips} />
            </div>

            <CookbookSyncStatus />
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
              <span>{t("cookbook.selectingRecipeFor")} {getCookbookDayLabel(pickForDay)}</span>

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
                {t("common.cancel")}
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
                      id="cookbook-import-url-input"
                      placeholder={t("cookbook.pasteRecipeLink")}
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
                    {isImporting ? "..." : t("cookbook.import").toUpperCase()}
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
                  {t("cookbook.addManually")}
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
                  {t("cookbook.pasteText")}
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
                    ? t("cookbook.editRecipe")
                    : hasImportedDraft
                      ? t("cookbook.reviewImportedRecipe")
                      : t("cookbook.newRecipe")}
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
                    ? t("cookbook.updateRecipeDetails")
                    : hasImportedDraft
                      ? t("cookbook.reviewImportedDetails")
                      : t("cookbook.addManualOrPasteUrl")}
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
                      {t("cookbook.importFromUrl")}
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
                          placeholder={t("cookbook.pasteRecipeLink")}
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
                            ? t("cookbook.reimport")
                            : t("cookbook.import")}
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
                        ? t("cookbook.importedDetailsLoaded")
                        : t("cookbook.importAvailableDetails")}
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
                    {t("cookbook.unusedIngredientsWarning")}
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
                    {t("cookbook.smartDetailsDetected")}: {getCookbookEffortLabel(manualRecipe.effort)} {t("cookbook.effort").toLowerCase()}
                    {manualRecipe.isVegetarian ? ` · ${t("recipes.vegetarian")}` : ""}
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
                    placeholder={t("cookbook.recipeName")}
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
                    placeholder={t("cookbook.ingredientsPlaceholder")}
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
                    placeholder={t("cookbook.instructionsPlaceholder")}
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
                      placeholder={t("cookbook.photoUrlPlaceholder")}
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
                      placeholder={t("cookbook.sourceUrlPlaceholder")}
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
                    {editingSlug ? t("cookbook.updateRecipe") : t("cookbook.saveToCookbook")}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* =========================================================
              CAPTION ASSIST MODAL
          ========================================================= */}

          {captionAssistDraft && (
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
                  maxHeight: "90vh",
                  overflowY: "auto",
                  boxSizing: "border-box",
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
                    Finish this recipe
                  </h2>

                  <button
                    onClick={closeCaptionAssistModal}
                    disabled={isCaptionAssisting}
                    style={{
                      background: "none",
                      border: "none",
                      color: "white",
                      cursor: isCaptionAssisting ? "default" : "pointer",
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>

                <p
                  style={{
                    opacity: 0.78,
                    lineHeight: 1.6,
                    marginBottom: 12,
                    fontSize: 14,
                  }}
                >
                  {captionAssistStatus ||
                    "We found the post, but not the full recipe text. Paste the caption or add screenshots showing the ingredients and instructions."}
                </p>

                {captionAssistDraft.name && (
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      marginBottom: 14,
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {captionAssistDraft.name}
                  </div>
                )}

                <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>
                  Paste caption text
                </h3>

                <textarea
                  value={captionAssistText}
                  onChange={(e) => setCaptionAssistText(e.target.value)}
                  placeholder="Paste the recipe caption here..."
                  disabled={isCaptionAssisting}
                  rows={7}
                  style={{
                    width: "100%",
                    minHeight: 170,
                    resize: "vertical",
                    borderRadius: 16,
                    padding: 16,
                    boxSizing: "border-box",
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.18)",
                    color: "#f8fafc",
                    outline: "none",
                    marginBottom: 12,
                    lineHeight: 1.6,
                    opacity: isCaptionAssisting ? 0.72 : 1,
                  }}
                />

                <button
                  onClick={handleCaptionAssistImport}
                  disabled={isCaptionAssisting || !captionAssistText.trim()}
                  style={{
                    ...btn,
                    width: "100%",
                    padding: 14,
                    borderRadius: 16,
                    background:
                      isCaptionAssisting || !captionAssistText.trim()
                        ? "rgba(148,163,184,0.45)"
                        : "#22c55e",
                    color: "white",
                    cursor:
                      isCaptionAssisting || !captionAssistText.trim()
                        ? "default"
                        : "pointer",
                  }}
                >
                  {captionAssistAction === "caption"
                    ? "Finishing..."
                    : "Finish with Caption"}
                </button>

                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 20,
                    borderTop: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>
                    Or use screenshots
                  </h3>

                  <p
                    style={{
                      margin: "0 0 12px",
                      fontSize: 13,
                      lineHeight: 1.5,
                      opacity: 0.72,
                    }}
                  >
                    Add up to five screenshots showing the ingredients and
                    instructions. Choose them in recipe order.
                  </p>

                  <input
                    ref={captionScreenshotInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleCaptionScreenshotSelection}
                    style={{ display: "none" }}
                  />

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={chooseCaptionScreenshots}
                      disabled={
                        isCaptionAssisting ||
                        captionScreenshotFiles.length >= MAX_SCREENSHOT_FILES
                      }
                      style={{
                        ...btn,
                        padding: "12px 16px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.14)",
                        color: "white",
                        opacity:
                          isCaptionAssisting ||
                            captionScreenshotFiles.length >= MAX_SCREENSHOT_FILES
                            ? 0.55
                            : 1,
                        cursor:
                          isCaptionAssisting ||
                            captionScreenshotFiles.length >= MAX_SCREENSHOT_FILES
                            ? "default"
                            : "pointer",
                      }}
                    >
                      {captionScreenshotFiles.length > 0
                        ? "Add More Screenshots"
                        : "Choose Screenshots"}
                    </button>

                    <span style={{ fontSize: 12, opacity: 0.68 }}>
                      {captionScreenshotFiles.length} of {MAX_SCREENSHOT_FILES}
                    </span>
                  </div>

                  {captionScreenshotError && (
                    <p
                      role="alert"
                      style={{
                        margin: "10px 0 0",
                        color: "#fca5a5",
                        fontSize: 13,
                        lineHeight: 1.45,
                      }}
                    >
                      {captionScreenshotError}
                    </p>
                  )}

                  {captionScreenshotFiles.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(105px, 1fr))",
                        gap: 10,
                        marginTop: 14,
                      }}
                    >
                      {captionScreenshotFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                          style={{
                            position: "relative",
                            overflow: "hidden",
                            borderRadius: 14,
                            border: "1px solid rgba(255,255,255,0.14)",
                            background: "#0f172a",
                          }}
                        >
                          <img
                            src={captionScreenshotPreviewUrls[index]}
                            alt={`Recipe screenshot ${index + 1}`}
                            style={{
                              display: "block",
                              width: "100%",
                              aspectRatio: "4 / 5",
                              objectFit: "cover",
                            }}
                          />

                          <div
                            style={{
                              position: "absolute",
                              left: 7,
                              top: 7,
                              minWidth: 26,
                              height: 26,
                              padding: "0 7px",
                              borderRadius: 999,
                              display: "grid",
                              placeItems: "center",
                              background: "rgba(15,23,42,0.9)",
                              color: "white",
                              fontSize: 12,
                              fontWeight: 900,
                            }}
                          >
                            {index + 1}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeCaptionScreenshot(index)}
                            disabled={isCaptionAssisting}
                            aria-label={`Remove screenshot ${index + 1}`}
                            style={{
                              position: "absolute",
                              right: 7,
                              top: 7,
                              width: 30,
                              height: 30,
                              borderRadius: 999,
                              border: "none",
                              background: "rgba(15,23,42,0.9)",
                              color: "white",
                              fontSize: 18,
                              lineHeight: 1,
                              cursor: isCaptionAssisting
                                ? "default"
                                : "pointer",
                            }}
                          >
                            ×
                          </button>

                          <div
                            title={file.name}
                            style={{
                              padding: "8px 9px",
                              fontSize: 11,
                              opacity: 0.72,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {captionScreenshotFiles.length > 0 && (
                    <>
                      <p
                        style={{
                          margin: "10px 0 0",
                          fontSize: 12,
                          opacity: 0.66,
                          lineHeight: 1.45,
                        }}
                      >
                        Screenshot 1 will be read first. Remove and reselect
                        images to change their order.
                      </p>

                      <button
                        type="button"
                        onClick={handleScreenshotAssistImport}
                        disabled={isCaptionAssisting}
                        style={{
                          ...btn,
                          width: "100%",
                          marginTop: 12,
                          padding: 14,
                          borderRadius: 16,
                          background: isCaptionAssisting
                            ? "rgba(148,163,184,0.35)"
                            : "rgba(139,92,246,0.18)",
                          border: "1px solid rgba(139,92,246,0.45)",
                          color: isCaptionAssisting ? "#cbd5e1" : "#ddd6fe",
                          cursor: isCaptionAssisting ? "default" : "pointer",
                        }}
                      >
                        {captionAssistAction === "screenshots"
                          ? "Reading Screenshots..."
                          : "Finish with Screenshots"}
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={saveCaptionAssistNeedsFinishing}
                  disabled={isCaptionAssisting}
                  style={{
                    ...btn,
                    width: "100%",
                    marginTop: 18,
                    padding: 14,
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "white",
                    cursor: isCaptionAssisting ? "default" : "pointer",
                  }}
                >
                  Save Needs Finishing
                </button>

                <p
                  style={{
                    fontSize: 12,
                    opacity: 0.68,
                    lineHeight: 1.5,
                    marginTop: 12,
                    marginBottom: 0,
                  }}
                >
                  Everything opens in Review Recipe before it is saved to your
                  Cookbook.
                </p>
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
                    {t("cookbook.pasteRecipeText")}
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
                  {t("cookbook.pasteRecipeTextDescription")}
                </p>

                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={t("cookbook.pasteRecipeTextHere")}
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
                    ? t("cookbook.organizingRecipe")
                    : t("cookbook.importRecipeText")}
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              COOKBOOK LIST
          ========================================================= */}

          <div style={{ display: "grid", gap: 14 }}>
            {localizedCookbook.map(({ raw, display }, index) => {
              const status = getRecipeStatus(raw);
              const ingredientCount = splitLines(display?.ingredients).length;
              const stepCount =
                !display?.instructions ||
                  display.instructions === "Steps available at source link!"
                  ? 0
                  : splitLines(display?.instructions).length;

              const recipeSlug =
                raw.slug || `${slugify(raw.name || "recipe")}-${index}`;

              const recipePhotoUrl = normalizePhotoUrl(display?.photoUrl || raw?.photoUrl);

              return (
                <div
                  key={recipeSlug}
                  id={`cookbook-${recipeSlug}`}
                  onClick={() => handleRecipeClick(raw, recipeSlug)}
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
                          alt={display.name || raw.name}
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
                          {display.name || raw.name}
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
                            {t("cookbook.tapToAddTo")} {getCookbookDayLabel(pickForDay)}
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
                            {ingredientCount} {t("recipe.ingredientCount")}
                          </div>

                          <div style={pillStyle}>{stepCount} {t("recipe.stepCount")}</div>

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
                            {getRecipeStatusLabel(status)}
                          </div>

                          {raw.effort && (
                            <div style={pillStyle}>{getCookbookEffortLabel(raw.effort)}</div>
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
                            openEditRecipe(raw);
                          }}
                          style={{
                            ...actionBtnStyle,
                            background: "rgba(255,255,255,0.05)",
                            color: "white",
                          }}
                          title={t("cookbook.editRecipe")}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRecipe(raw);
                          }}
                          style={{
                            ...actionBtnStyle,
                            background: "rgba(239,68,68,0.12)",
                            border: "1px solid rgba(239,68,68,0.35)",
                            color: "#f87171",
                          }}
                          title={t("cookbook.deleteRecipe")}
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
                  {t("cookbook.importingRecipe")}
                </div>

                <div
                  style={{
                    fontSize: 14,
                    opacity: 0.72,
                    lineHeight: 1.6,
                  }}
                >
                  {t("cookbook.importingRecipeDescription")}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}