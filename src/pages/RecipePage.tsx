import SafeRecipeImage from "../components/SafeRecipeImage";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Printer,
  ArrowLeft,
  ShoppingCart,
  Play,
  Share2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  BookOpen,
  Timer,
  Mic,
  MicOff,
  Moon,
  ChefHat,
  Pin,
  X,
  HeartPulse,
} from "lucide-react";

import { getRecipeBySlug } from "../core/recipes";
import {
  ALL_RECIPES,
  getSuggestedDessertsForRecipe,
} from "../core/data";
import { addIngredientsToList } from "../shoppingList";
import { recordCook, getCookHistoryFor } from "../core/cookHistoryStore";
import { isCommonPantryStaple } from "../core/pantry";
import TipsModal from "../components/TipsModal";
import { t, getStoredLanguage } from "../i18n";
import { getLocalizedMeal } from "../core/localizedMeal";
import { Capacitor } from "@capacitor/core";
import { SpeechRecognition } from "@capgo/capacitor-speech-recognition";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import {
  cancelCookTimerAlert,
  scheduleCookTimerAlert,
} from "../core/cookTimerNotifications";
import { API_BASE } from "../core/api";
import { usePlusAccess } from "../plus/usePlusAccess";
import {
  getDisplaySides,
  getCustomSides,
  setCustomSides,
} from "../core/customSides";
import {
  getSideShoppingLines,
  findSideRecipeByName,
  getDessertShoppingLines,
  findDessertRecipeByName,
} from "../core/sideRecipeMatcher";
import {
  getRecipeScaleLabel,
  RECIPE_SCALE_OPTIONS,
  scaleIngredientLines,
  scaleInstructionLines,
  type RecipeScale,
} from "../core/recipeScaling";



// =====================================================
// Builder: helpers
// =====================================================

function splitLines(s?: string) {
  return String(s ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/•/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}


const RECIPE_NOTES_KEY = "simple-dinners.recipe-notes.v1";

type RecipeNotesMap = Record<string, string>;

function loadRecipeNotes(): RecipeNotesMap {
  try {
    return JSON.parse(localStorage.getItem(RECIPE_NOTES_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveRecipeNotes(notes: RecipeNotesMap) {
  localStorage.setItem(RECIPE_NOTES_KEY, JSON.stringify(notes));
}

function getRecipeUserNote(recipeKey: string) {
  if (!recipeKey) return "";
  const all = loadRecipeNotes();
  return all[recipeKey] || "";
}

function setRecipeUserNote(recipeKey: string, note: string) {
  if (!recipeKey) return;
  const all = loadRecipeNotes();
  all[recipeKey] = note;
  saveRecipeNotes(all);
}

function cleanIngredientText(text: string) {
  return String(text || "")
    .replace(/,?\s*to taste/gi, "")
    .replace(/,?\s*optional/gi, "")
    .replace(/,?\s*divided/gi, "")
    .replace(/\(\s*,/g, "(")
    .replace(/\bfor glaze\b/gi, "") // remove "for glaze"
    .replace(/,+$/, "") // 🔥 remove trailing commas
    .replace(/\s{2,}/g, " ")
    .trim();
}
function formatIngredientDisplay(text: string) {
  const cleaned = String(text || "").trim();

  if (!cleaned) return "";

  const language = getStoredLanguage();

  if (language === "es") {
    const lower = cleaned.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  return cleaned
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function formatEffortLabel(effort?: string) {
  if (!effort) return "";
  const value = String(effort).trim();
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeRecipeLookupKey(value?: string) {
  return String(value || "").trim().toLowerCase();
}

function normalizeTagForDisplay(tag: string) {
  return String(tag || "")
    .trim()
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getVisibleRecipeTags(recipe: any) {
  const hiddenTags = new Set(["quick", "normal", "big", "takeout", "grilling"]);
  const seen = new Set<string>();

  return (Array.isArray(recipe?.tags) ? recipe.tags : [])
    .map((tag: string) => String(tag || "").trim())
    .filter(Boolean)
    .filter((tag: string) => {
      const normalized = tag.toLowerCase();
      if (hiddenTags.has(normalized)) return false;
      if (seen.has(normalized)) return false;

      seen.add(normalized);
      return true;
    });
}

function normalizeCookText(text: string) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getIngredientCoreText(ingredient: string) {
  return normalizeCookText(
    cleanIngredientText(ingredient)
      .replace(/\b\d+(?:[\/.]\d+)?\b/g, " ")
      .replace(
        /\b(cup|cups|tablespoon|tablespoons|tbsp|teaspoon|teaspoons|tsp|pound|pounds|lb|lbs|ounce|ounces|oz|clove|cloves|can|cans|package|packages|pkg|slice|slices)\b/g,
        " "
      )
  );
}

function getIngredientKeywords(ingredient: string) {
  return getIngredientCoreText(ingredient)
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean)
    .filter(
      (word) =>
        ![
          "fresh",
          "large",
          "small",
          "medium",
          "extra",
          "virgin",
          "boneless",
          "skinless",
          "lean",
          "halved",
          "diced",
          "chopped",
          "minced",
          "sliced",
          "shredded",
          "softened",
          "melted",
          "beaten",
        ].includes(word)
    );
}

function getCookModeIngredientLabel(text: string) {
  return cleanIngredientText(text);
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

function extractTimerSeconds(text: string): number | null {
  const lower = text.toLowerCase();

  const hourMinuteMatch = lower.match(
    /(\d+)\s*(hour|hours|hr|hrs)\s*(\d+)\s*(minute|minutes|min|mins)/i
  );
  if (hourMinuteMatch) {
    return (
      parseInt(hourMinuteMatch[1], 10) * 3600 +
      parseInt(hourMinuteMatch[3], 10) * 60
    );
  }

  const hourMatch = lower.match(/(\d+)\s*(hour|hours|hr|hrs)/i);
  const minuteMatch = lower.match(/(\d+)\s*(minute|minutes|min|mins)/i);
  const secondMatch = lower.match(/(\d+)\s*(second|seconds|sec|secs)/i);

  let total = 0;

  if (hourMatch) total += parseInt(hourMatch[1], 10) * 3600;
  if (minuteMatch) total += parseInt(minuteMatch[1], 10) * 60;
  if (secondMatch) total += parseInt(secondMatch[1], 10);

  return total > 0 ? total : null;
}

function formatTimer(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  }

  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function hasCookWord(text: string, word: string) {
  return new RegExp(`\\b${word}\\b`, "i").test(text);
}

function isGlazeIngredient(ingredient: string) {
  const text = normalizeCookText(ingredient);
  return (
    text.includes("glaze") ||
    text.includes("for glaze")
  );
}

function isActiveGlazeStep(step: string) {
  const text = normalizeCookText(step);

  if (!hasCookWord(text, "glaze")) return false;

  return (
    hasCookWord(text, "mix") ||
    hasCookWord(text, "whisk") ||
    hasCookWord(text, "stir") ||
    hasCookWord(text, "make") ||
    hasCookWord(text, "combine") ||
    hasCookWord(text, "spread") ||
    hasCookWord(text, "brush")
  );
}

function isIngredientHeader(line: string) {
  const text = String(line || "").trim();

  if (!text) return true;

  return text === text.toUpperCase() && text.length < 40 && !/\d/.test(text);
}

function getIngredientDisplayKey(ingredient: string) {
  const text = getIngredientCoreText(ingredient);
  const isGlaze = isGlazeIngredient(ingredient);

  if (text.includes("ketchup")) {
    return isGlaze ? "ketchup_glaze" : "ketchup";
  }

  if (text.includes("mustard")) {
    return isGlaze ? "mustard_glaze" : "mustard";
  }

  if (text.includes("worcestershire")) {
    return isGlaze ? "worcestershire_glaze" : "worcestershire";
  }

  if (text.includes("brown sugar")) {
    return isGlaze ? "brown_sugar_glaze" : "brown_sugar";
  }

  if (text.includes("egg")) return "egg";
  if (text.includes("breadcrumbs")) return "breadcrumbs";
  if (text.includes("beef stock")) return "beef_stock";
  if (text.includes("oregano")) return "oregano";
  if (text.includes("old bay")) return "old_bay";
  if (text.includes("cherry peppers")) return "cherry_peppers";
  if (text.includes("black pepper")) return "black_pepper";
  if (text === "pepper") return "pepper";
  if (text.includes("salt")) return "salt";

  return text;
}

function ingredientMatchesStep(ingredient: string, step: string) {
  const stepText = normalizeCookText(step);
  const ingredientText = getIngredientCoreText(ingredient);
  const keywords = getIngredientKeywords(ingredient);
  const isPantry = isCommonPantryStaple(ingredient, normalizeCookText);
  const isGlaze = isGlazeIngredient(ingredient);
  const activeGlazeStep = isActiveGlazeStep(step);

  if (!stepText || !keywords.length) return false;


  // =====================================================
  // Glaze logic
  // =====================================================

  if (isGlaze && !activeGlazeStep) {
    return false;
  }

  if (activeGlazeStep && !isGlaze) {
    if (
      ingredientText.includes("ketchup") ||
      ingredientText.includes("mustard") ||
      ingredientText.includes("worcestershire") ||
      ingredientText.includes("brown sugar")
    ) {
      return false;
    }
  }

  if (activeGlazeStep && isGlaze) {
  if (
    (ingredientText.includes("ketchup") && stepText.includes("ketchup")) ||
    (ingredientText.includes("mustard") && stepText.includes("mustard")) ||
    (ingredientText.includes("worcestershire") &&
      stepText.includes("worcestershire")) ||
    (ingredientText.includes("brown sugar") &&
      stepText.includes("brown sugar"))
  ) {
    return true;
  }

  if (stepText.includes("glaze")) {
    return true;
  }
}

  // =====================================================
  // Garnish / serving-only ingredients
  // Only show these on finishing or serving steps
  // =====================================================

  if (
    ingredientText.includes("to serve") ||
    ingredientText.includes("for serving") ||
    ingredientText.includes("garnish") ||
    ingredientText.includes("optional garnish")
  ) {
    return (
      stepText.includes("serve") ||
      stepText.includes("serving") ||
      stepText.includes("garnish") ||
      stepText.includes("top with") ||
      stepText.includes("sprinkle") ||
      stepText.includes("finish with")
    );
  }

  // =====================================================
  // Protections for stock / broth
  // =====================================================

  if (ingredientText.includes("stock") && !stepText.includes("stock")) {
    return false;
  }

  if (ingredientText.includes("broth") && !stepText.includes("broth")) {
    return false;
  }

  if (
    ingredientText.includes("ground beef") &&
    (stepText.includes("beef stock") || stepText.includes("beef broth"))
  ) {
    return false;
  }

  if (
    (ingredientText.includes("chicken breast") ||
      ingredientText.includes("chicken breasts") ||
      ingredientText.includes("chicken thighs")) &&
    stepText.includes("chicken broth")
  ) {
    return false;
  }

  // =====================================================
  // Pepper handling
  // =====================================================

  if (ingredientText.includes("cherry peppers")) {
    return (
      stepText.includes("cherry peppers") ||
      stepText.includes("chopped cherry peppers")
    );
  }

  if (ingredientText.includes("black pepper")) {
    if (stepText.includes("black pepper")) return true;
    if (stepText.includes("pepper") && !stepText.includes("cherry peppers")) {
      return true;
    }
    return false;
  }

  if (ingredientText === "pepper") {
    if (stepText.includes("pepper") && !stepText.includes("cherry peppers")) {
      return true;
    }
    return false;
  }

  // =====================================================
  // Salt handling
  // =====================================================

  if (ingredientText.includes("salt")) {
    return stepText.includes("salt");
  }

    // =====================================================
  // Strong food-specific matching
  // Prevents long ingredient descriptions from matching weak words
  // like "bite", "pieces", "firm", "mixed", etc.
  // =====================================================

  if (ingredientText.includes("tofu")) {
    return hasCookWord(stepText, "tofu");
  }

  if (ingredientText.includes("noodle") || ingredientText.includes("noodles")) {
  return hasCookWord(stepText, "noodle") || hasCookWord(stepText, "noodles");
}

  if (
    ingredientText.includes("mixed stir fry vegetables") ||
    ingredientText.includes("mixed stir-fry vegetables") ||
    ingredientText.includes("stir fry vegetables") ||
    ingredientText.includes("stir-fry vegetables")
  ) {
    return (
      hasCookWord(stepText, "vegetable") ||
      hasCookWord(stepText, "vegetables") ||
      stepText.includes("stir fry") ||
      stepText.includes("stir-fry")
    );
  }

  // =====================================================
  // Smart rules
  // =====================================================

  if (
    (stepText.includes("onion") || stepText.includes("onions")) &&
    ingredientText.includes("onion")
  ) {
    return true;
  }

  if (stepText.includes("garlic") && ingredientText.includes("garlic")) {
    return true;
  }

  if (stepText.includes("season") && ingredientText.includes("season")) {
    return true;
  }

  if (
    (stepText.includes("spice") || stepText.includes("spices")) &&
    isPantry &&
    !isGlaze
  ) {
    return true;
  }

  // =====================================================
  // Exact phrase
  // =====================================================

  if (
    ingredientText &&
    ingredientText.length >= 4 &&
    stepText.includes(ingredientText)
  ) {
    return true;
  }

  // =====================================================
  // Partial keyword matching
  // Helps things like:
  // "smoked paprika" -> "paprika"
  // "dried thyme" -> "thyme"
  // "yellow onion" -> "onion"
  // =====================================================

    const weakIngredientWords = new Set([
    "yellow",
    "white",
    "fresh",
    "dried",
    "smoked",
    "ground",
    "extra",
    "firm",
    "pressed",
    "bite",
    "size",
    "pieces",
    "piece",
    "cut",
    "into",
    "mixed",
    "stir",
    "fry",
    "chopped",
    "minced",
    "sliced",
    "diced",
    "grated",
    "shredded",
    "divided",
    "optional",
    "about",
    "medium",
    "large",
    "small",
    "tender",
  ]);

  const meaningfulKeywords = keywords.filter(
    (word) => word.length >= 4 && !weakIngredientWords.has(word)
  );

  if (meaningfulKeywords.some((word) => hasCookWord(stepText, word))) {
    return true;
  }

  // =====================================================
  // Short useful keywords
  // =====================================================

  const usefulShortKeywords = keywords.filter((word) =>
    ["egg", "eggs", "oil", "ham"].includes(word)
  );

  if (usefulShortKeywords.some((word) => hasCookWord(stepText, word))) {
    return true;
  }

  return false;
}

function playTimerDoneSound() {
  try {
    const audio = new Audio("/audio/diner_order_up.wav");
    audio.volume = 1;

    void audio.play().catch(() => {
      // Native notification still handles locked-device alerts.
    });
  } catch {
    // ignore audio failures
  }
}

const FINISH_MESSAGES = [
  t("recipe.finishMessages.dinnerReady", "Dinner is ready!"),
  t("recipe.finishMessages.smellsAmazing", "Smells amazing!"),
  t("recipe.finishMessages.kitchenWin", "Kitchen win!"),
  t("recipe.finishMessages.platesUp", "Plates up!"),
  t("recipe.finishMessages.nicelyDone", "Nicely done!"),
  t("recipe.finishMessages.dinnerHandled", "Dinner handled!"),
  t("recipe.finishMessages.nailedIt", "Nailed it!"),
];




// =====================================================
// Builder: types
// =====================================================

type RecipePageProps = {
  onAddToCookbook: (recipe: any) => {
    ok: boolean;
    already?: boolean;
    reason?: string;
  };
};

type NutritionValues = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sodiumMg: number;
};

type RecipeNutritionAnalysis = {
  source: string;
  estimated: boolean;
  servings: number;
  coverage: number;
  qualityScore?: number;
  confidence: "high" | "medium" | "low";
  perRecipe: NutritionValues;
  perServing: NutritionValues;
  cached: boolean;
};

type NutritionApiResponse = {
  success: boolean;
  successLevel?: string;
  error?: string;
  nutrition?: RecipeNutritionAnalysis;
};


export default function RecipePage({ onAddToCookbook }: RecipePageProps) {
  const navigate = useNavigate();
  const { slug = "" } = useParams();
  const location = useLocation();

  const {
    hasPlus,
    plusLoading,
    requirePlus,
  } = usePlusAccess();

useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}, [location.pathname]);

  const recipeTips = [
    t("recipe.tips.ingredients", "Select ingredients to add only what you need"),
    t("recipe.tips.notes", "Save recipes to your cookbook"),
    t("recipe.tips.cookMode", "Use Cook Mode for step-by-step guidance"),
    t("recipe.tips.back", "Tap back to return to your plan"),
  ];

  const cookTips = [
    t("cookMode.tips.swipe", "Swipe left or right to move between steps"),
    t("cookMode.tips.timers", "Start timers when detected"),
    t("cookMode.tips.ingredients", "Ingredients match the current step"),
    t("cookMode.tips.history", "Mark Cooked to track history"),
  ];

  // =====================================================
  // Builder: route state
  // =====================================================

  const params = new URLSearchParams(location.search);
  const from = params.get("from") || "/week";
  const printMode = params.get("print") === "1";
  const startInCookMode = params.get("cook") === "true";

  // =====================================================
  // Builder: recipe lookup
  // =====================================================

  const recipe = useMemo(() => getRecipeBySlug(slug), [slug]);

  const builtInRecipe = useMemo(() => {
    const key = normalizeRecipeLookupKey(slug);

    return ALL_RECIPES.find((item) => {
      const itemKey = normalizeRecipeLookupKey(item.slug || item.id || "");
      return itemKey === key;
    });
  }, [slug]);

  const sourceRecipe = useMemo(() => {
    if (builtInRecipe && recipe) {
      return {
        ...builtInRecipe,
        ...recipe,

        // Backfill newer built-in add-on data when an older saved/cookbook
        // recipe does not have it yet.
        suggestedSides:
          recipe.suggestedSides?.length
            ? recipe.suggestedSides
            : builtInRecipe.suggestedSides,

        suggestedDesserts:
          recipe.suggestedDesserts?.length
            ? recipe.suggestedDesserts
            : builtInRecipe.suggestedDesserts,

        translations: {
          ...builtInRecipe.translations,
          ...recipe.translations,
          es: {
            ...builtInRecipe.translations?.es,
            ...recipe.translations?.es,
            suggestedSides:
              recipe.translations?.es?.suggestedSides?.length
                ? recipe.translations.es.suggestedSides
                : builtInRecipe.translations?.es?.suggestedSides,
            suggestedDesserts:
              recipe.translations?.es?.suggestedDesserts?.length
                ? recipe.translations.es.suggestedDesserts
                : builtInRecipe.translations?.es?.suggestedDesserts,
          },
        },
      };
    }

    return recipe || builtInRecipe;
  }, [recipe, builtInRecipe]);

  // =====================================================
  // Builder: local state
  // =====================================================

  const [cookMode, setCookMode] = useState(startInCookMode);
  const [cookStage, setCookStage] = useState<"prep" | "steps">("prep");
  const [prepCheckedIngredients, setPrepCheckedIngredients] = useState<
    Record<number, boolean>
  >({});
  const [handsFreeEnabled, setHandsFreeEnabled] = useState(false);
  const [handsFreeListening, setHandsFreeListening] = useState(false);
  const [handsFreeStatus, setHandsFreeStatus] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [savedState, setSavedState] = useState<"idle" | "saved" | "already">(
    "idle"
  );
  const [saveMessage, setSaveMessage] = useState("");
  const [finishMessage, setFinishMessage] = useState("");
  const [checkedIngredients, setCheckedIngredients] = useState<
    Record<number, boolean>
  >({});
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerEndsAt, setTimerEndsAt] = useState<number | null>(null);
  const [timerFinished, setTimerFinished] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [keepAwake, setKeepAwake] = useState(false);
  const [userNote, setUserNote] = useState<string>("");
  const [showNoteModal, setShowNoteModal] = useState(false);
const [draftUserNote, setDraftUserNote] = useState("");
  const [noteDraft, setNoteDraft] = useState<string>("");
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [showCookAllIngredients, setShowCookAllIngredients] = useState(false);
const [showAllInstructions, setShowAllInstructions] = useState(false);
const [editSidesOpen, setEditSidesOpen] = useState(false);
const [sideDraft, setSideDraft] = useState("");
const [sideDraftList, setSideDraftList] = useState<string[]>([]);
const [checkedSides, setCheckedSides] = useState<Record<string, boolean>>({});
const [checkedDesserts, setCheckedDesserts] = useState<Record<string, boolean>>({});
const [recipeScale, setRecipeScale] = useState<RecipeScale>(1);

const [nutrition, setNutrition] =
  useState<RecipeNutritionAnalysis | null>(null);

const [nutritionLoading, setNutritionLoading] =
  useState(false);

const [nutritionError, setNutritionError] =
  useState("");

  const wakeLockRef = useRef<any>(null);

  const handsFreeEnabledRef = useRef(false);
  const handsFreeSpeakingRef = useRef(false);
  const handsFreeCommandAtRef = useRef(0);
  const currentCookStepRef = useRef("");
  const cookInstructionCountRef = useRef(0);

  const recipeNoteKey = sourceRecipe?.slug || sourceRecipe?.name || "";

  useEffect(() => {
    setTimerFinished(false);
  }, [slug]);
  const safeRecipe =
  getLocalizedMeal(sourceRecipe, getStoredLanguage()) ||
  sourceRecipe || {
    id: "",
    slug: "",
    name: t("recipe.fallbackTitle", "Recipe"),
    effort: "normal",
    photoUrl: "",
    tags: [],
    notes: "",
    ingredients: "",
    instructions: "",
  };

  // =====================================================
  // Builder: derived recipe data
  // =====================================================

  const baseIngredients = useMemo(
  () => splitLines(safeRecipe?.ingredients),
  [safeRecipe?.ingredients]
);

const baseInstructions = useMemo(
  () => splitLines(safeRecipe?.instructions),
  [safeRecipe?.instructions]
);

const ingredients = useMemo(
  () => scaleIngredientLines(baseIngredients, recipeScale),
  [baseIngredients, recipeScale]
);

const instructions = useMemo(
  () => scaleInstructionLines(baseInstructions, recipeScale),
  [baseInstructions, recipeScale]
);

const baseServings =
  typeof safeRecipe.servings === "number" ? safeRecipe.servings : null;

const scaledServings =
  baseServings !== null
    ? Math.max(1, Math.round(baseServings * recipeScale))
    : null;
  const visibleIngredients = showAllIngredients
  ? ingredients
  : ingredients.slice(0, 5);

const visibleInstructions = showAllInstructions
  ? instructions
  : instructions.slice(0, 5);

const hasMoreIngredients = ingredients.length > 5;
const hasMoreInstructions = instructions.length > 5;

const prepIngredientItems = useMemo(
  () =>
    ingredients
      .map((ingredient, index) => ({
        ingredient,
        index,
      }))
      .filter(
        ({ ingredient }) =>
          !isIngredientHeader(ingredient) &&
          !ingredient.trim().endsWith(":")
      ),
  [ingredients]
);

const prepReadyCount = prepIngredientItems.filter(
  ({ index }) => prepCheckedIngredients[index]
).length;

async function analyzeNutrition() {
  if (
    !requirePlus({
      feature: "nutrition",
    })
  ) {
    return;
  }

  if (nutritionLoading) {
    return;
  }

  if (
    baseServings === null ||
    baseServings <= 0
  ) {
    setNutritionError(
      currentLanguage === "es"
        ? "Esta receta necesita información de porciones antes de calcular la nutrición."
        : "This recipe needs serving information before nutrition can be calculated."
    );
    return;
  }

  const nutritionIngredients =
    String(
      sourceRecipe?.ingredients ||
      safeRecipe.ingredients ||
      ""
    ).trim();

  if (!nutritionIngredients) {
    setNutritionError(
      currentLanguage === "es"
        ? "No hay ingredientes suficientes para calcular la nutrición."
        : "There are not enough ingredients to calculate nutrition."
    );
    return;
  }

  setNutritionLoading(true);
  setNutritionError("");

  try {
    const response = await fetch(
      `${API_BASE}/nutrition`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          recipeName:
            sourceRecipe?.name ||
            safeRecipe.name,
          ingredients:
            nutritionIngredients,
          servings:
            baseServings,
        }),
      }
    );

    const raw =
      await response.text();

    let data:
      | NutritionApiResponse
      | null = null;

    try {
      data =
        JSON.parse(raw) as
          NutritionApiResponse;
    } catch {
      data = null;
    }

    if (
      !response.ok ||
      !data?.success ||
      !data.nutrition
    ) {
      throw new Error(
        data?.error ||
          (
            currentLanguage === "es"
              ? "No se pudo calcular la nutrición."
              : "Nutrition analysis could not be completed."
          )
      );
    }

    setNutrition(
      data.nutrition
    );
  } catch (error) {
    console.error(
      "Nutrition analysis failed:",
      error
    );

    setNutritionError(
      error instanceof Error
        ? error.message
        : (
          currentLanguage === "es"
            ? "No se pudo calcular la nutrición."
            : "Nutrition analysis could not be completed."
        )
    );
  } finally {
    setNutritionLoading(false);
  }
}

  const photoUrl = normalizePhotoUrl(sourceRecipe?.photoUrl);
  const currentStep = instructions[stepIndex] || "";

  currentCookStepRef.current = currentStep;
  cookInstructionCountRef.current = instructions.length;

  const detectedTimerSeconds = extractTimerSeconds(currentStep);
  const isLastStep =
    instructions.length > 0 && stepIndex >= instructions.length - 1;
  const isGrilling = Array.isArray(sourceRecipe?.tags)
    ? sourceRecipe.tags.includes("grilling")
    : false;

  const stepIngredients = useMemo(() => {
    if (!currentStep?.trim()) return [];

    if (isActiveGlazeStep(currentStep)) {
      const glazeItems = ingredients.filter((ingredient) => {
        if (isIngredientHeader(ingredient)) return false;
        return isGlazeIngredient(ingredient);
      });

      const seen = new Set<string>();

      const dedupedGlazeItems = glazeItems.filter((ingredient) => {
        const key = getIngredientDisplayKey(ingredient);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return dedupedGlazeItems.slice(0, 15);
    }

    const matched = ingredients.filter((ingredient) => {
      if (isIngredientHeader(ingredient)) return false;
      return ingredientMatchesStep(ingredient, currentStep);
    });

    const seen = new Set<string>();

    const deduped = matched.filter((ingredient) => {
      const key = getIngredientDisplayKey(ingredient);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return deduped.slice(0, 15);
  }, [ingredients, currentStep]);

  // =====================================================
  // Builder: effects
  // =====================================================

  useEffect(() => {
    if (!sourceRecipe?.slug) return;
    const history = getCookHistoryFor(sourceRecipe.slug);
    setHistoryCount(history?.timesCooked ?? 0);
  }, [sourceRecipe?.slug]);

  useEffect(() => {
    const savedNote = getRecipeUserNote(recipeNoteKey);
    setUserNote(savedNote);
    setNoteDraft(savedNote);
    setNoteModalOpen(false);
  }, [recipeNoteKey]);

  useEffect(() => {
    setNutrition(null);
    setNutritionError("");
    setNutritionLoading(false);
  }, [recipeNoteKey]);

  useEffect(() => {
    if (!printMode) return;

    const id = window.setTimeout(() => window.print(), 300);
    return () => window.clearTimeout(id);
  }, [printMode]);

  useEffect(() => {
  setStepIndex(0);
  setCookStage("prep");
  setPrepCheckedIngredients({});
  setShowCookAllIngredients(false);
  setCheckedIngredients({});
  setCheckedSides({});
  setCheckedDesserts({});
  setTimerSeconds(null);
  setTimerRunning(false);
  setTimerEndsAt(null);
  setSaveMessage("");
  setFinishMessage("");
}, [slug]);

  useEffect(() => {
    if (!cookMode) return;
    if (stepIndex >= instructions.length) {
      setStepIndex(0);
    }
  }, [cookMode, stepIndex, instructions.length]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let disposed = false;
    let partialHandle: any = null;
    let listeningHandle: any = null;
    let errorHandle: any = null;

    void (async () => {
      partialHandle =
        await SpeechRecognition.addListener(
          "partialResults",
          (event) => {
            const transcript =
              event.matches?.[0] || "";

            if (transcript) {
              void handleHandsFreeTranscript(
                transcript
              );
            }
          }
        );

      if (disposed) {
        await partialHandle.remove();
        return;
      }

      listeningHandle =
        await SpeechRecognition.addListener(
          "listeningState",
          (event) => {
            if (
              event.state === "started" ||
              event.status === "started"
            ) {
              setHandsFreeListening(true);
            }

            if (
              event.state === "stopped" ||
              event.status === "stopped"
            ) {
              setHandsFreeListening(false);
            }
          }
        );

      if (disposed) {
        await listeningHandle.remove();
        return;
      }

      errorHandle =
        await SpeechRecognition.addListener(
          "error",
          () => {
            if (
              handsFreeEnabledRef.current &&
              !handsFreeSpeakingRef.current
            ) {
              setHandsFreeStatus(
                getStoredLanguage() === "es"
                  ? "No entendí eso. Sigo escuchando…"
                  : "Didn't catch that. Still listening…"
              );
            }
          }
        );

      if (disposed) {
        await errorHandle.remove();
      }
    })();

    return () => {
      disposed = true;

      handsFreeEnabledRef.current = false;

      if (partialHandle) {
        void partialHandle.remove();
      }

      if (listeningHandle) {
        void listeningHandle.remove();
      }

      if (errorHandle) {
        void errorHandle.remove();
      }

      void SpeechRecognition.setPTTState({
        held: false,
        mute: true,
      }).catch(() => {});

      void SpeechRecognition.forceStop({
        timeout: 800,
      }).catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!saveMessage) return;
    const t = window.setTimeout(() => setSaveMessage(""), 1800);
    return () => window.clearTimeout(t);
  }, [saveMessage]);

  useEffect(() => {
    if (!finishMessage) return;
    const t = window.setTimeout(() => setFinishMessage(""), 2600);
    return () => window.clearTimeout(t);
  }, [finishMessage]);

  useEffect(() => {
    if (savedState === "idle") return;
    const t = window.setTimeout(() => setSavedState("idle"), 1400);
    return () => window.clearTimeout(t);
  }, [savedState]);

  useEffect(() => {
    if (!timerRunning || timerEndsAt === null) return;

    let completed = false;

    const syncTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil((timerEndsAt - Date.now()) / 1000)
      );

      if (remaining <= 0) {
        if (completed) return;
        completed = true;

        setTimerRunning(false);
        setTimerEndsAt(null);
        setTimerSeconds(null);
        setTimerFinished(true);
        setSaveMessage(t("cookMode.timerDone", "⏱️ Timer done!"));
        playTimerDoneSound();

        if ("vibrate" in navigator) {
          navigator.vibrate?.([200, 100, 200, 100, 300]);
        }

        return;
      }

      setTimerSeconds(remaining);
    };

    syncTimer();

    const intervalId = window.setInterval(syncTimer, 250);

    return () => window.clearInterval(intervalId);
  }, [timerRunning, timerEndsAt]);

  useEffect(() => {
    let cancelled = false;

    async function syncWakeLock() {
      try {
        if (
          keepAwake &&
          cookMode &&
          "wakeLock" in navigator &&
          !wakeLockRef.current
        ) {
          const sentinel = await (navigator as any).wakeLock.request("screen");
          if (!cancelled) {
            wakeLockRef.current = sentinel;

            sentinel.addEventListener?.("release", () => {
              wakeLockRef.current = null;
            });
          }
        }

        if ((!keepAwake || !cookMode) && wakeLockRef.current) {
          await wakeLockRef.current.release?.();
          wakeLockRef.current = null;
        }
      } catch {
        if (keepAwake) {
          setSaveMessage(t("cookMode.screenAwakeUnsupported", "Screen awake not supported on this device"));
          setKeepAwake(false);
        }
      }
    }

    syncWakeLock();

    return () => {
      cancelled = true;
    };
  }, [keepAwake, cookMode]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (
        document.visibilityState === "visible" &&
        keepAwake &&
        cookMode &&
        "wakeLock" in navigator &&
        !wakeLockRef.current
      ) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request(
            "screen"
          );
        } catch {
          // ignore
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [keepAwake, cookMode]);

  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release?.();
        wakeLockRef.current = null;
      }
    };
  }, []);

  // =====================================================
  // Builder: empty state
  // =====================================================

  if (!sourceRecipe) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "40px 20px 120px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 700,
            textAlign: "center",
            padding: 24,
            borderRadius: 20,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>{t("recipe.notFound", "Recipe not found")}</h2>
          <p style={{ opacity: 0.7, marginBottom: 20 }}>
            {t("recipe.couldNotLoad", "This recipe could not be loaded.")}
          </p>

          <button
            onClick={() => navigate("/recipes")}
            style={{
              border: "none",
              borderRadius: 12,
              padding: "12px 16px",
              background: "rgba(34,197,94,0.12)",
              color: "#86efac",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {t("recipe.backToRecipes", "Back to Recipes")}
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // Builder: actions
  // =====================================================

  const handleBack = () => {
    navigate(from);
  };

  const handleShare = async () => {
    const shareUrl =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
        ? `https://dinners.ncocaptain.com/recipe/${encodeURIComponent(
            safeRecipe.slug || ""
          )}`
        : `${window.location.origin}/recipe/${encodeURIComponent(
            safeRecipe.slug || ""
          )}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: safeRecipe.name || t("recipe.fallbackTitle", "Recipe"),
          url: shareUrl,
        });
        return;
      } catch {
        // ignore cancelled share
      }
    }

    await navigator.clipboard.writeText(shareUrl);
    setSaveMessage(t("recipe.linkCopied", "Link copied!"));
  };

  const openNoteModal = () => {
  setDraftUserNote(userNote);
  setShowNoteModal(true);
};

  function handleEditUserNote() {
    setNoteDraft(userNote);
    setNoteModalOpen(true);
  }

  const handleSaveUserNote = () => {
  const trimmed = draftUserNote.trim();
  setUserNote(trimmed);
  setRecipeUserNote(recipeNoteKey, trimmed);
  setShowNoteModal(false);
  setSaveMessage(
    trimmed
      ? t("recipe.personalNoteSaved", "Personal note saved ✓")
      : t("recipe.personalNoteCleared", "Personal note cleared")
  );
};

const handleCloseNoteModal = () => {
  setShowNoteModal(false);
};

  function handleClearUserNote() {
    setNoteDraft("");
    setUserNote("");
    setRecipeUserNote(recipeNoteKey, "");
    setNoteModalOpen(false);
    setSaveMessage(t("recipe.personalNoteCleared", "Personal note cleared"));
  }

  const handleAddToCookbook = () => {
    if (!safeRecipe.slug) {
      setSaveMessage(t("recipe.missingInfo", "Missing recipe info"));
      return;
    }

    const result = onAddToCookbook({
      ...safeRecipe,
      id: safeRecipe.id ?? safeRecipe.slug,
      slug: safeRecipe.slug,
      name: safeRecipe.name ?? "",
      effort: safeRecipe.effort ?? "normal",
      photoUrl: safeRecipe.photoUrl ?? "",
      tags: Array.isArray(safeRecipe.tags) ? safeRecipe.tags : [],
      notes: safeRecipe.notes ?? "",
      ingredients: safeRecipe.ingredients ?? "",
      instructions: safeRecipe.instructions ?? "",
    });

    if (!result.ok) {
      setSaveMessage(t("recipe.couldNotSave", "Could not save recipe"));
      return;
    }

    localStorage.setItem("scrollToCookbook", safeRecipe.slug);

    if (result.already) {
      setSavedState("already");
      setSaveMessage(t("recipe.alreadyInCookbook", "Already in Cookbook"));
    } else {
      setSavedState("saved");
      setSaveMessage(t("recipe.savedToCookbook", "Saved to Cookbook ✓"));
    }
  };

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const togglePrepIngredient = (index: number) => {
    setPrepCheckedIngredients((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleEnterCookMode = () => {
    setStepIndex(0);
    setCookStage("prep");
    setPrepCheckedIngredients({});
    setCookMode(true);
  };

  const handleStartCooking = () => {
    setStepIndex(0);
    setCookStage("steps");
  };

  function normalizeHandsFreeText(value: string) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getHandsFreeCommand(value: string) {
    const text = normalizeHandsFreeText(value);

    const nextCommands = new Set([
      "next",
      "next step",
      "continue",
      "go forward",
      "siguiente",
      "siguiente paso",
      "continuar",
    ]);

    const previousCommands = new Set([
      "previous",
      "previous step",
      "back",
      "go back",
      "anterior",
      "paso anterior",
      "atras",
      "regresa",
    ]);

    const repeatCommands = new Set([
      "repeat",
      "repeat step",
      "repeat that",
      "say that again",
      "read step",
      "read the step",
      "read it again",
      "repite",
      "repetir",
      "repite el paso",
      "lee el paso",
      "leelo de nuevo",
    ]);

    if (nextCommands.has(text)) return "next";
    if (previousCommands.has(text)) return "previous";
    if (repeatCommands.has(text)) return "repeat";

    return null;
  }

  async function pauseHandsFreeRecognition() {
    try {
      await SpeechRecognition.setPTTState({
        held: false,
        mute: true,
      });
    } catch {
      // ignore
    }

    try {
      await SpeechRecognition.forceStop({
        timeout: 800,
      });
    } catch {
      // ignore
    }

    setHandsFreeListening(false);
  }

  async function beginHandsFreeRecognition() {
    if (
      !handsFreeEnabledRef.current ||
      handsFreeSpeakingRef.current
    ) {
      return;
    }

    try {
      const current =
        await SpeechRecognition.isListening();

      if (current.listening) {
        setHandsFreeListening(true);
        return;
      }
    } catch {
      // continue and attempt to start
    }

    const language =
      getStoredLanguage() === "es"
        ? "es-US"
        : "en-US";

    await SpeechRecognition.setPTTState({
      held: true,
      mute: true,
    });

    await SpeechRecognition.start({
      language,
      maxResults: 3,
      partialResults: true,
      popup: false,
      continuousPTT: true,
      muteRecognizerBeep: true,
      allowForSilence: 1400,
      contextualStrings:
        language === "es-US"
          ? [
              "siguiente paso",
              "paso anterior",
              "repite el paso",
            ]
          : [
              "next step",
              "previous step",
              "repeat step",
            ],
    });

    await SpeechRecognition.setPTTState({
      held: true,
      mute: true,
    });

    setHandsFreeListening(true);
    setHandsFreeStatus(
      getStoredLanguage() === "es"
        ? 'Escuchando… Di "siguiente paso".'
        : 'Listening… Say "next step".'
    );
  }

  async function startHandsFreeMode() {
    if (!Capacitor.isNativePlatform()) {
      setHandsFreeStatus(
        getStoredLanguage() === "es"
          ? "El modo manos libres está disponible en la aplicación móvil."
          : "Hands-Free Mode is available in the mobile app."
      );
      return;
    }

    try {
      const availability =
        await SpeechRecognition.available();

      if (!availability.available) {
        setHandsFreeStatus(
          getStoredLanguage() === "es"
            ? "El reconocimiento de voz no está disponible en este dispositivo."
            : "Speech recognition is not available on this device."
        );
        return;
      }

      let permission =
        await SpeechRecognition.checkPermissions();

      if (
        permission.speechRecognition !== "granted"
      ) {
        permission =
          await SpeechRecognition.requestPermissions();
      }

      if (
        permission.speechRecognition !== "granted"
      ) {
        setHandsFreeStatus(
          getStoredLanguage() === "es"
            ? "Permite el acceso al micrófono para usar el modo manos libres."
            : "Allow microphone access to use Hands-Free Mode."
        );
        return;
      }

      handsFreeEnabledRef.current = true;
      setHandsFreeEnabled(true);

      await beginHandsFreeRecognition();
    } catch (error) {
      console.warn(
        "Hands-Free Mode could not start:",
        error
      );

      handsFreeEnabledRef.current = false;
      setHandsFreeEnabled(false);
      setHandsFreeListening(false);

      setHandsFreeStatus(
        getStoredLanguage() === "es"
          ? "No se pudo iniciar el modo manos libres."
          : "Hands-Free Mode could not start."
      );
    }
  }

  async function stopHandsFreeMode() {
    handsFreeEnabledRef.current = false;
    handsFreeSpeakingRef.current = false;

    setHandsFreeEnabled(false);
    setHandsFreeListening(false);
    setHandsFreeStatus("");

    if (!Capacitor.isNativePlatform()) return;

    try {
      await SpeechRecognition.setPTTState({
        held: false,
        mute: true,
      });
    } catch {
      // ignore
    }

    try {
      await SpeechRecognition.forceStop({
        timeout: 800,
      });
    } catch {
      // ignore
    }

    try {
      await TextToSpeech.stop();
    } catch {
      // ignore
    }
  }

  async function speakCurrentCookStep() {
    const step = currentCookStepRef.current.trim();

    if (!step) return;

    handsFreeSpeakingRef.current = true;

    setHandsFreeStatus(
      getStoredLanguage() === "es"
        ? "Leyendo el paso…"
        : "Reading the step…"
    );

    await pauseHandsFreeRecognition();

    try {
      await TextToSpeech.stop();
    } catch {
      // ignore
    }

    const words = step
      .split(/\s+/)
      .filter(Boolean).length;

    const expectedSpeechMs = Math.min(
      12000,
      Math.max(1400, words * 360)
    );

    const speechStartedAt = Date.now();

    try {
      await TextToSpeech.speak({
        text: step,
        lang:
          getStoredLanguage() === "es"
            ? "es-US"
            : "en-US",
        rate: 0.92,
        pitch: 1,
        volume: 1,
        category: "ambient",
        queueStrategy: 0,
      });
    } catch (error) {
      console.warn(
        "Cook Mode speech failed:",
        error
      );
    }

    const elapsed =
      Date.now() - speechStartedAt;

    const remainingWait =
      expectedSpeechMs - elapsed;

    if (remainingWait > 0) {
      await new Promise((resolve) =>
        window.setTimeout(
          resolve,
          remainingWait
        )
      );
    }

    handsFreeSpeakingRef.current = false;

    if (handsFreeEnabledRef.current) {
      try {
        await beginHandsFreeRecognition();
      } catch (error) {
        console.warn(
          "Hands-Free Mode could not resume:",
          error
        );
      }
    }
  }

  async function handleHandsFreeTranscript(
    transcript: string
  ) {
    if (
      !handsFreeEnabledRef.current ||
      handsFreeSpeakingRef.current
    ) {
      return;
    }

    const command =
      getHandsFreeCommand(transcript);

    if (!command) return;

    const now = Date.now();

    if (
      now - handsFreeCommandAtRef.current <
      1800
    ) {
      return;
    }

    handsFreeCommandAtRef.current = now;

    const isSpanish =
      getStoredLanguage() === "es";

    if (command === "next") {
      setStepIndex((prev) =>
        Math.min(
          cookInstructionCountRef.current - 1,
          prev + 1
        )
      );

      setHandsFreeStatus(
        isSpanish
          ? "✓ Siguiente paso"
          : "✓ Next step"
      );
      return;
    }

    if (command === "previous") {
      setStepIndex((prev) =>
        Math.max(0, prev - 1)
      );

      setHandsFreeStatus(
        isSpanish
          ? "✓ Paso anterior"
          : "✓ Previous step"
      );
      return;
    }

    if (command === "repeat") {
      setHandsFreeStatus(
        isSpanish
          ? "✓ Repitiendo paso"
          : "✓ Repeating step"
      );

      await speakCurrentCookStep();
    }
  };

  const toggleSide = (side: string) => {
  setCheckedSides((prev) => ({
    ...prev,
    [side]: !prev[side],
  }));
};
const toggleDessert = (dessert: string) => {
  setCheckedDesserts((prev) => ({
    ...prev,
    [dessert]: !prev[dessert],
  }));
};

  const handleAddIngredients = () => {
    const selectedIngredients = ingredients.filter(
      (_, index) => checkedIngredients[index]
    );

    const linesToSend = selectedIngredients.length
      ? selectedIngredients
      : ingredients;

    addIngredientsToList(safeRecipe.name || "Recipe", linesToSend.join("\n"));

    setSaveMessage(
      selectedIngredients.length
        ? t("recipe.selectedIngredientsAdded", "Selected ingredients added ✓")
        : t("recipe.allIngredientsAdded", "All ingredients added ✓")
    );
  };

  const handleAddSidesToShoppingList = () => {
  if (!suggestedSides.length) return;

  const selectedSides = suggestedSides.filter((side) => checkedSides[side]);
  const sidesToProcess = selectedSides.length ? selectedSides : suggestedSides;

  const shoppingLines = sidesToProcess.flatMap((side) => {
    const result = getSideShoppingLines(side);
    return result.lines;
  });

  addIngredientsToList(
    `${safeRecipe.name || "Recipe"} sides`,
    shoppingLines.join("\n")
  );

  setSaveMessage(
    selectedSides.length
      ? t("recipe.selectedSidesAdded", "Selected sides added ✓")
      : t("recipe.allSidesAdded", "All sides added ✓")
  );
};

const handleAddDessertsToShoppingList = () => {
  if (!suggestedDesserts.length) return;

  const selectedDesserts = suggestedDesserts.filter(
    (dessert) => checkedDesserts[dessert]
  );

  const dessertsToProcess = selectedDesserts.length
    ? selectedDesserts
    : suggestedDesserts;

  const shoppingLines = dessertsToProcess.flatMap((dessert) => {
    const result = getDessertShoppingLines(dessert);
    return result.lines;
  });

  addIngredientsToList(
    `${safeRecipe.name || "Recipe"} desserts`,
    shoppingLines.join("\n")
  );

  setSaveMessage(
    selectedDesserts.length
      ? t("recipe.selectedDessertsAdded", "Selected desserts added ✓")
      : t("recipe.allDessertsAdded", "All desserts added ✓")
  );
};

  const handleFinishCooking = () => {
    void stopHandsFreeMode();

    if (safeRecipe.slug) {
      recordCook(safeRecipe.slug);
      const history = getCookHistoryFor(safeRecipe.slug);
      setHistoryCount(history?.timesCooked ?? 0);
    }

    const randomMessage =
      FINISH_MESSAGES[Math.floor(Math.random() * FINISH_MESSAGES.length)];

    setFinishMessage(randomMessage);
    setSaveMessage(t("recipe.finished", "Recipe finished ✓"));
  };

  const handleStartTimer = () => {
    if (!detectedTimerSeconds) return;

    const endsAt =
      Date.now() + detectedTimerSeconds * 1000;

    setTimerSeconds(detectedTimerSeconds);
    setTimerEndsAt(endsAt);
    setTimerFinished(false);
    setTimerRunning(true);
    setSaveMessage(
      t("cookMode.timerStarted", "Timer started")
    );

    void scheduleCookTimerAlert({
      endsAt,
      recipeName: safeRecipe.name,
      language:
        currentLanguage === "es" ? "es" : "en",
    }).then((result) => {
      if (result.permissionDenied) {
        setSaveMessage(
          currentLanguage === "es"
            ? "Temporizador iniciado · Activa las notificaciones para recibir alertas."
            : "Timer started · Enable notifications to receive timer alerts."
        );
      }
    });
  };

  const handlePauseResumeTimer = () => {
    if (timerSeconds === null) return;

    if (timerRunning) {
      const remaining =
        timerEndsAt !== null
          ? Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000))
          : timerSeconds;

      setTimerSeconds(remaining);
      setTimerEndsAt(null);
      setTimerRunning(false);
      void cancelCookTimerAlert();
      return;
    }

    if (timerSeconds <= 0) return;

    const endsAt =
      Date.now() + timerSeconds * 1000;

    setTimerEndsAt(endsAt);
    setTimerRunning(true);

    void scheduleCookTimerAlert({
      endsAt,
      recipeName: safeRecipe.name,
      language:
        currentLanguage === "es" ? "es" : "en",
    });
  };

  const handleClearTimer = () => {
    setTimerRunning(false);
    setTimerEndsAt(null);
    setTimerSeconds(null);
    setTimerFinished(false);
    void cancelCookTimerAlert();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;

    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      setStepIndex((prev) => Math.min(instructions.length - 1, prev + 1));
    } else if (distance < -minSwipeDistance) {
      setStepIndex((prev) => Math.max(0, prev - 1));
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };



  // =====================================================
  // Builder: shared styles
  // =====================================================

  const pageWrap: React.CSSProperties = {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: printMode ? "0" : "0 20px 120px",
  };

  const innerWrap: React.CSSProperties = {
    width: "100%",
    maxWidth: 850,
    display: "grid",
    gap: 20,
  };

  const topBtn: React.CSSProperties = {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "white",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  const cookChipBtn: React.CSSProperties = {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "white",
    borderRadius: 999,
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
  };

  const messageStyle: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 12,
    background: "rgba(34,197,94,0.12)",
    border: "1px solid rgba(34,197,94,0.35)",
    color: "#86efac",
    fontSize: 13,
    fontWeight: 800,
    width: "fit-content",
  };

  const sectionCardStyle: React.CSSProperties = {
  padding: 20,
  borderRadius: 24,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
};

const sectionHeaderRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
  marginBottom: 14,
};

const sectionHeadingWrap: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const sectionIconBadge: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 12,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(34,197,94,0.10)",
  border: "1px solid rgba(34,197,94,0.20)",
  color: "#86efac",
  flexShrink: 0,
};

const countBadge: React.CSSProperties = {
  padding: "5px 9px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.72)",
  fontSize: 12,
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const ingredientHeaderStyle: React.CSSProperties = {
  marginTop: 4,
  marginBottom: 2,
  fontSize: 12,
  fontWeight: 1000,
  letterSpacing: 0.8,
  textTransform: "uppercase",
  color: "#86efac",
};

const instructionStepStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  padding: "12px 0",
  borderBottom: "1px solid rgba(255,255,255,0.055)",
};

  const pageHeaderCard: React.CSSProperties = {
    padding: 16,
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    display: "grid",
    gap: 14,
  };

  const primaryCookButton: React.CSSProperties = {
    border: "1px solid rgba(34,197,94,0.45)",
    background: "rgba(34,197,94,0.14)",
    color: "#86efac",
    borderRadius: 18,
    padding: "15px 16px",
    fontWeight: 1000,
    fontSize: 16,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  };

  const actionGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 10,
};

  const utilityGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 8,
};

  const smallActionBtn: React.CSSProperties = {
    ...topBtn,
    justifyContent: "center",
    fontSize: 12,
    padding: "9px 8px",
    opacity: 0.86,
  };

  const metadataPill: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 900,
    padding: "5px 9px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.82)",
    letterSpacing: 0.35,
  };

  const recipeSideKey = safeRecipe.slug || safeRecipe.name;
  const currentLanguage = getStoredLanguage();

const suggestedDesserts = getSuggestedDessertsForRecipe(
  sourceRecipe || safeRecipe,
  currentLanguage === "es" ? "es" : "en"
);



const suggestedSides = getDisplaySides(
  recipeSideKey,
  safeRecipe.suggestedSides
);

const hasCustomSides = !!getCustomSides(recipeSideKey);

function openEditSides() {
  setSideDraftList(suggestedSides);
  setSideDraft("");
  setEditSidesOpen(true);
}

function addSideDraft() {
  const cleaned = sideDraft.replace(/\s+/g, " ").trim();
  if (!cleaned) return;

  setSideDraftList((prev) =>
    Array.from(new Set([...prev, cleaned]))
  );
  setSideDraft("");
}

function removeSideDraft(side: string) {
  setSideDraftList((prev) => prev.filter((item) => item !== side));
}

function saveSideDrafts() {
  setCustomSides(recipeSideKey, sideDraftList);
  setEditSidesOpen(false);
}

function resetSideDrafts() {
  setCustomSides(recipeSideKey, []);
  setSideDraftList([]);
  setEditSidesOpen(false);
}

  const visibleRecipeTags = getVisibleRecipeTags(safeRecipe);

  // =====================================================
  // Builder: render
  // =====================================================

  return (
  <div style={pageWrap}>
    <div style={innerWrap}>
      {!printMode && !cookMode && (
        <>
          {/* =====================================================
              Recipe page header + primary actions
          ===================================================== */}

          <div style={pageHeaderCard}>
            <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  }}
>
  <h1
    style={{
      margin: 0,
      fontSize: 34,
      lineHeight: 1.08,
      fontWeight: 1000,
      letterSpacing: "-0.04em",
      flex: 1,
    }}
  >
    {safeRecipe.name}
  </h1>

  <TipsModal tips={recipeTips} />
</div>

            <button onClick={handleEnterCookMode} style={primaryCookButton}>
              <Play size={18} />
              {t("recipe.startCookMode")}
            </button>

            <div style={actionGrid}>
              <button onClick={handleBack} style={{ ...topBtn, justifyContent: "center" }}>
                <ArrowLeft size={16} />
                {t("recipe.back")}
              </button>

              <button
                onClick={handleAddIngredients}
                style={{ ...topBtn, justifyContent: "center" }}
              >
                <ShoppingCart size={16} />
                {t("recipe.addItems")}
              </button>

              <button
                onClick={handleAddToCookbook}
                disabled={savedState === "already"}
                style={{
                  ...topBtn,
                  justifyContent: "center",
                  opacity: savedState === "already" ? 0.7 : 1,
                  border:
                    savedState !== "idle"
                      ? "1px solid rgba(34,197,94,0.45)"
                      : topBtn.border,
                  background:
                    savedState !== "idle"
                      ? "rgba(34,197,94,0.12)"
                      : topBtn.background,
                  color: savedState !== "idle" ? "#86efac" : "white",
                  cursor: savedState === "already" ? "default" : "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                <BookOpen size={16} />
                {savedState === "saved"
                  ? `${t("recipe.saved")} ✓`
                  : savedState === "already"
                  ? t("recipe.saved")
                  : t("recipe.save")}
              </button>
            </div>

            <div style={utilityGrid}>


              <button
                onClick={() =>
                  navigate(
                    `/recipe/${encodeURIComponent(
                      safeRecipe.slug || safeRecipe.name || ""
                    )}?from=${encodeURIComponent(from)}&print=1`
                  )
                }
                style={smallActionBtn}
              >
                <Printer size={15} />
                {t("recipe.print")}
              </button>

              <button onClick={handleShare} style={smallActionBtn}>
                <Share2 size={15} />
                {t("recipe.share")}
              </button>

              <button onClick={openNoteModal} style={smallActionBtn}>
                <Pin size={15} />
                {t("recipe.note")}
              </button>
            </div>
          </div>

          {saveMessage && <div style={messageStyle}>{saveMessage}</div>}



          {!!userNote.trim() && (
            <button
              type="button"
              onClick={openNoteModal}
              style={{
                marginTop: 4,
                padding: 12,
                borderRadius: 14,
                background: "rgba(250,204,21,0.10)",
                border: "1px solid rgba(250,204,21,0.25)",
                color: "#fde68a",
                textAlign: "left",
                fontSize: 13,
                lineHeight: 1.45,
                cursor: "pointer",
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <Pin size={15} style={{ marginTop: 2, flexShrink: 0 }} />
              <span>
                <strong>{t("recipe.yourNote", "Your note")}:</strong>{" "}
                {userNote.length > 90 ? `${userNote.slice(0, 90)}...` : userNote}
              </span>
            </button>
          )}

          {showNoteModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: 20,
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 420,
                  background: "#111",
                  borderRadius: 20,
                  padding: 20,
                  display: "grid",
                  gap: 12,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>
  {currentLanguage === "es"
    ? "Nota personal"
    : t("recipe.personalNote", "Personal Note")}
</div>

                  <button onClick={handleCloseNoteModal} style={{ ...topBtn }}>
                    <X size={16} />
                  </button>
                </div>

                <textarea
                  value={draftUserNote}
                  onChange={(e) => setDraftUserNote(e.target.value)}
                  placeholder={
  currentLanguage === "es"
    ? "Agrega un recordatorio, ajuste o preferencia familiar..."
    : t(
        "recipe.personalNotePlaceholder",
        "Add a reminder, tweak, or family preference..."
      )
}
                  style={{
                    width: "100%",
                    minHeight: 120,
                    borderRadius: 12,
                    padding: 10,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                    color: "white",
                    resize: "none",
                  }}
                />

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={handleSaveUserNote} style={topBtn}>
                    {t("recipe.save")}
                  </button>

                  <button onClick={handleCloseNoteModal} style={topBtn}>
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

     {!printMode && cookMode && (
  <>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button
          onClick={() => {
            void stopHandsFreeMode();
            setCookMode(false);
            setCookStage("prep");
          }}
          style={{
            ...topBtn,
            padding: "9px 12px",
            fontSize: 13,
          }}
        >
          <ArrowLeft size={15} />
          {t("cookMode.exit")}
        </button>

        <button
          onClick={() => setKeepAwake((prev) => !prev)}
          style={{
            ...cookChipBtn,
            padding: "9px 12px",
            fontSize: 13,
            border: keepAwake
              ? "1px solid rgba(34,197,94,0.45)"
              : cookChipBtn.border,
            background: keepAwake
              ? "rgba(34,197,94,0.12)"
              : cookChipBtn.background,
            color: keepAwake ? "#86efac" : "white",
          }}
        >
          <Moon size={15} />
          {currentLanguage === "es"
            ? "Pantalla activa"
            : "Screen Awake"}
        </button>

        {cookStage === "steps" && (
          <button
            type="button"
            onClick={() => {
              if (handsFreeEnabled) {
                void stopHandsFreeMode();
              } else {
                void startHandsFreeMode();
              }
            }}
            style={{
              ...cookChipBtn,
              padding: "9px 12px",
              fontSize: 13,
              border: handsFreeEnabled
                ? "1px solid rgba(34,197,94,0.45)"
                : cookChipBtn.border,
              background: handsFreeEnabled
                ? "rgba(34,197,94,0.12)"
                : cookChipBtn.background,
              color: handsFreeEnabled
                ? "#86efac"
                : "white",
            }}
          >
            {handsFreeEnabled ? (
              <MicOff size={15} />
            ) : (
              <Mic size={15} />
            )}

            {handsFreeEnabled
              ? currentLanguage === "es"
                ? "Manos libres: ON"
                : "Hands-Free: ON"
              : currentLanguage === "es"
              ? "Manos libres"
              : "Hands-Free"}
          </button>
        )}

        <TipsModal tips={cookTips} />
      </div>
    </div>

    {saveMessage && <div style={messageStyle}>{saveMessage}</div>}

    {cookStage === "steps" &&
      (handsFreeEnabled || handsFreeStatus) && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 16,
            background: handsFreeEnabled
              ? "rgba(34,197,94,0.08)"
              : "rgba(255,255,255,0.04)",
            border: handsFreeEnabled
              ? "1px solid rgba(34,197,94,0.22)"
              : "1px solid rgba(255,255,255,0.08)",
            display: "grid",
            gap: 5,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 1000,
              color: handsFreeEnabled
                ? "#86efac"
                : "rgba(255,255,255,0.78)",
            }}
          >
            <Mic size={16} />

            {handsFreeEnabled
              ? handsFreeListening
                ? currentLanguage === "es"
                  ? "Escuchando"
                  : "Listening"
                : currentLanguage === "es"
                ? "Manos libres activo"
                : "Hands-Free active"
              : currentLanguage === "es"
              ? "Manos libres"
              : "Hands-Free"}
          </div>

          <div
            style={{
              fontSize: 12,
              lineHeight: 1.45,
              color: "rgba(255,255,255,0.62)",
            }}
          >
            {handsFreeStatus ||
              (currentLanguage === "es"
                ? 'Di "siguiente paso", "paso anterior" o "repite el paso".'
                : 'Say "next step", "previous step", or "repeat step".')}
          </div>
        </div>
      )}

    {finishMessage && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.35)",
          zIndex: 999,
          padding: 24,
        }}
      >
        <div
          style={{
            minWidth: 280,
            maxWidth: 360,
            padding: "22px 24px",
            borderRadius: 22,
            background: "rgba(22,163,74,0.20)",
            border: "1px solid rgba(34,197,94,0.40)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
            color: "#dcfce7",
            fontSize: 17,
            lineHeight: 1.35,
            fontWeight: 900,
            textAlign: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          {finishMessage}
        </div>
      </div>
    )}
  </>
)}

      {!cookMode && (
        <div
          style={{
            overflow: "hidden",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          {photoUrl ? (
            <SafeRecipeImage
              src={photoUrl}
              alt={safeRecipe.name || "Recipe"}
              iconSize={32}
              style={{
                width: "100%",
                aspectRatio: "16 / 8",
                objectFit: "cover",
                display: "block",
                background: "rgba(255,255,255,0.04)",
              }}
            />
          ) : null}

          <div style={{ padding: 18, display: "grid", gap: 10 }}>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {safeRecipe.effort && (
                <span style={metadataPill}>
                  {formatEffortLabel(String(safeRecipe.effort))}
                </span>
              )}

              {isGrilling && (
                <span
                  style={{
                    ...metadataPill,
                    background: "rgba(250,204,21,0.15)",
                    border: "1px solid rgba(250,204,21,0.35)",
                    color: "#fde68a",
                  }}
                >
                  🔥 {t("recipe.grilling", "Grilling")}
                </span>
              )}

              {visibleRecipeTags.slice(0, 4).map((tag: string) => (
                <span key={tag} style={metadataPill}>
                  {normalizeTagForDisplay(tag)}
                </span>
              ))}
            </div>

            {!!safeRecipe.notes?.trim() && (
              <p
                style={{
                  margin: 0,
                  opacity: 0.72,
                  lineHeight: 1.5,
                }}
              >
                {safeRecipe.notes}
              </p>
            )}

            {suggestedSides.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                      color: "#86efac",
                    }}
                  >
                    {t("recipe.goesWellWith", "Goes well with")}
                    {hasCustomSides ? " · Custom" : ""}
                  </div>

                  <button
                    type="button"
                    onClick={openEditSides}
                    style={{
                      border: "none",
                      borderRadius: 999,
                      padding: "6px 10px",
                      background: "rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.82)",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {currentLanguage === "es" ? "Editar" : t("recipe.editSides", "Edit")}
                  </button>
                </div>


<div
  style={{
    display: "grid",
    gap: 8,
  }}
>
  {suggestedSides.map((side: string) => {
    const checked = !!checkedSides[side];
    const sideRecipe = findSideRecipeByName(side);
    const hasCookButton = !!(sideRecipe && (sideRecipe.slug || sideRecipe.name));

    return (
      <div
        key={side}
        style={{
          display: "grid",
          gridTemplateColumns: hasCookButton
            ? "minmax(0, 1fr) 42px"
            : "minmax(0, 1fr)",
          gap: 8,
          alignItems: "center",
          width: "100%",
        }}
      >
        <button
          type="button"
          onClick={() => toggleSide(side)}
          style={{
            minWidth: 0,
            width: "100%",
            padding: "8px 10px",
            borderRadius: 999,
            background: checked
              ? "rgba(34,197,94,0.14)"
              : "rgba(255,255,255,0.06)",
            border: checked
              ? "1px solid rgba(34,197,94,0.32)"
              : "1px solid rgba(255,255,255,0.10)",
            color: checked ? "#86efac" : "rgba(255,255,255,0.88)",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 6,
            textAlign: "left",
            whiteSpace: "normal",
            lineHeight: 1.2,
          }}
        >
          <CheckCircle2
            size={14}
            style={{
              color: checked ? "#22c55e" : "rgba(255,255,255,0.35)",
              flexShrink: 0,
            }}
          />
          <span>{side}</span>
        </button>

        {hasCookButton && (
          <button
            type="button"
            title={t("recipe.cookSide", "Cook side")}
            aria-label={t("recipe.cookSide", "Cook side")}
            onClick={() => {
              const sideRecipeKey = sideRecipe.slug || sideRecipe.name || "";

              navigate(
                `/recipe/${encodeURIComponent(
                  sideRecipeKey
                )}?from=${encodeURIComponent(
                  `/recipe/${safeRecipe.slug || safeRecipe.name || ""}`
                )}&cook=true`
              );
            }}
            style={{
              width: 42,
              height: 42,
              padding: 0,
              borderRadius: 999,
              background: "rgba(34,197,94,0.10)",
              border: "1px solid rgba(34,197,94,0.24)",
              color: "#86efac",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Play size={15} />
          </button>
        )}
      </div>
    );
  })}
</div>
                <button
  type="button"
  onClick={handleAddSidesToShoppingList}
  style={{
    width: "fit-content",
    border: "1px solid rgba(34,197,94,0.22)",
    borderRadius: 999,
    padding: "8px 12px",
    background: "rgba(34,197,94,0.08)",
    color: "#86efac",
    fontSize: 13,
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  }}
>
  <ShoppingCart size={14} />
  {t("recipe.addSidesToShoppingList", "Add sides to shopping list")}
</button>
              </div>
            )}

            {suggestedDesserts.length > 0 && (
  <div
    style={{
      display: "grid",
      gap: 8,
      marginTop: 10,
      paddingTop: 12,
      borderTop: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <div
      style={{
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        color: "#facc15",
      }}
    >
      {t("recipe.optionalDessert", "Want something sweet?")}
    </div>


<div
  style={{
    display: "grid",
    gap: 8,
  }}
>
  {suggestedDesserts.map((dessert: string) => {
    const checked = !!checkedDesserts[dessert];
    const dessertRecipe = findDessertRecipeByName(dessert);
    const hasCookButton = !!(
      dessertRecipe && (dessertRecipe.slug || dessertRecipe.name)
    );

    return (
      <div
        key={dessert}
        style={{
          display: "grid",
          gridTemplateColumns: hasCookButton
            ? "minmax(0, 1fr) 42px"
            : "minmax(0, 1fr)",
          gap: 8,
          alignItems: "center",
          width: "100%",
        }}
      >
        <button
          type="button"
          onClick={() => toggleDessert(dessert)}
          style={{
            minWidth: 0,
            width: "100%",
            padding: "8px 10px",
            borderRadius: 999,
            background: checked
              ? "rgba(250,204,21,0.14)"
              : "rgba(255,255,255,0.06)",
            border: checked
              ? "1px solid rgba(250,204,21,0.32)"
              : "1px solid rgba(255,255,255,0.10)",
            color: checked ? "#fde68a" : "rgba(255,255,255,0.88)",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 6,
            textAlign: "left",
            whiteSpace: "normal",
            lineHeight: 1.2,
          }}
        >
          <CheckCircle2
            size={14}
            style={{
              color: checked ? "#facc15" : "rgba(255,255,255,0.35)",
              flexShrink: 0,
            }}
          />
          <span>{dessert}</span>
        </button>

        {hasCookButton && (
          <button
            type="button"
            title={t("recipe.cookDessert", "Cook dessert")}
            aria-label={t("recipe.cookDessert", "Cook dessert")}
            onClick={() => {
              const dessertRecipeKey =
                dessertRecipe.slug || dessertRecipe.name || "";

              navigate(
                `/recipe/${encodeURIComponent(
                  dessertRecipeKey
                )}?from=${encodeURIComponent(
                  `/recipe/${safeRecipe.slug || safeRecipe.name || ""}`
                )}&cook=true`
              );
            }}
            style={{
              width: 42,
              height: 42,
              padding: 0,
              borderRadius: 999,
              background: "rgba(250,204,21,0.10)",
              border: "1px solid rgba(250,204,21,0.24)",
              color: "#fde68a",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Play size={15} />
          </button>
        )}
      </div>
    );
  })}
</div>

    <button
      type="button"
      onClick={handleAddDessertsToShoppingList}
      style={{
        width: "fit-content",
        border: "1px solid rgba(250,204,21,0.24)",
        borderRadius: 999,
        padding: "8px 12px",
        background: "rgba(250,204,21,0.08)",
        color: "#fde68a",
        fontSize: 13,
        fontWeight: 900,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
      }}
    >
      <ShoppingCart size={14} />
      {t("recipe.addDessertsToShoppingList", "Add desserts to shopping list")}
    </button>
  </div>
)}

            {suggestedSides.length === 0 && (
              <button
                type="button"
                onClick={openEditSides}
                style={{
                  border: "1px solid rgba(34,197,94,0.22)",
                  borderRadius: 999,
                  padding: "8px 12px",
                  background: "rgba(34,197,94,0.08)",
                  color: "#86efac",
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: "pointer",
                  width: "fit-content",
                }}
              >
                {t("recipe.addSides", "Add sides")}
              </button>
            )}

            <div style={{ fontSize: 13, opacity: 0.55 }}>
              {t("recipe.cooked")} {historyCount}{" "}
{historyCount === 1 ? t("recipe.time") : t("recipe.times")}
            </div>
          </div>
        </div>
      )}

      {cookMode && cookStage === "prep" && (
        <div
          style={{
            padding: 20,
            borderRadius: 24,
            border: "1px solid rgba(34,197,94,0.22)",
            background:
              "linear-gradient(180deg, rgba(34,197,94,0.08), rgba(255,255,255,0.035))",
            display: "grid",
            gap: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 14,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 1000,
                  letterSpacing: 0.7,
                  textTransform: "uppercase",
                  color: "#86efac",
                  marginBottom: 5,
                }}
              >
                {currentLanguage === "es"
                  ? "Preparación"
                  : "Prep"}
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: 28,
                  lineHeight: 1.1,
                  fontWeight: 1000,
                }}
              >
                {currentLanguage === "es"
                  ? "Ten todo listo"
                  : "Get everything ready"}
              </h2>

              <div
                style={{
                  marginTop: 7,
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: "rgba(255,255,255,0.60)",
                }}
              >
                {currentLanguage === "es"
                  ? "Reúne los ingredientes antes de comenzar. Puedes empezar cuando quieras."
                  : "Gather your ingredients before you begin. Start cooking whenever you're ready."}
              </div>
            </div>

            <div
              style={{
                borderRadius: 999,
                padding: "7px 11px",
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.24)",
                color: "#86efac",
                fontSize: 12,
                fontWeight: 1000,
                whiteSpace: "nowrap",
              }}
            >
              {prepReadyCount} {currentLanguage === "es" ? "de" : "of"}{" "}
              {prepIngredientItems.length}{" "}
              {currentLanguage === "es" ? "listos" : "ready"}
            </div>
          </div>

          {scaledServings !== null && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(255,255,255,0.07)",
                fontSize: 13,
                fontWeight: 900,
                color: "rgba(255,255,255,0.76)",
              }}
            >
              {currentLanguage === "es"
                ? `Preparando ${scaledServings} ${
                    scaledServings === 1 ? "porción" : "porciones"
                  }`
                : `Preparing ${scaledServings} ${
                    scaledServings === 1 ? "serving" : "servings"
                  }`}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gap: 8,
            }}
          >
            {prepIngredientItems.length ? (
              prepIngredientItems.map(({ ingredient, index }) => {
                const ready = !!prepCheckedIngredients[index];

                return (
                  <button
                    key={`${ingredient}-${index}`}
                    type="button"
                    onClick={() => togglePrepIngredient(index)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 11,
                      textAlign: "left",
                      padding: "11px 12px",
                      borderRadius: 15,
                      cursor: "pointer",
                      color: ready
                        ? "#bbf7d0"
                        : "rgba(255,255,255,0.90)",
                      background: ready
                        ? "rgba(34,197,94,0.10)"
                        : "rgba(255,255,255,0.035)",
                      border: ready
                        ? "1px solid rgba(34,197,94,0.28)"
                        : "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <CheckCircle2
                      size={18}
                      style={{
                        marginTop: 1,
                        flexShrink: 0,
                        color: ready
                          ? "#22c55e"
                          : "rgba(255,255,255,0.28)",
                      }}
                    />

                    <span
                      style={{
                        lineHeight: 1.45,
                        fontSize: 14,
                        fontWeight: 750,
                        textDecoration: ready
                          ? "line-through"
                          : "none",
                        opacity: ready ? 0.72 : 1,
                      }}
                    >
                      {formatIngredientDisplay(ingredient)}
                    </span>
                  </button>
                );
              })
            ) : (
              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.035)",
                  color: "rgba(255,255,255,0.58)",
                  fontSize: 13,
                }}
              >
                {currentLanguage === "es"
                  ? "No hay ingredientes para preparar."
                  : "No ingredients to prep."}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleStartCooking}
            style={{
              ...primaryCookButton,
              padding: "16px 18px",
              marginTop: 2,
            }}
          >
            <ChefHat size={19} />
            {currentLanguage === "es"
              ? "Comenzar a cocinar"
              : "Start Cooking"}
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {cookMode && cookStage === "steps" ? (
  <div
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    style={{
      padding: 20,
      borderRadius: 24,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.04)",
      display: "grid",
      gap: 14,
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          width: "fit-content",
          padding: "6px 10px",
          borderRadius: 999,
          background: "rgba(34,197,94,0.10)",
          border: "1px solid rgba(34,197,94,0.20)",
          color: "#86efac",
          fontSize: 12,
          fontWeight: 1000,
        }}
      >
        {t("cookMode.step", "Step")}{" "}
        {instructions.length ? stepIndex + 1 : 0}{" "}
        {t("cookMode.of", "of")} {instructions.length}
      </div>
    </div>

    <div
      style={{
        fontSize: 28,
        lineHeight: 1.5,
        fontWeight: 900,
      }}
    >
      {currentStep || t("cookMode.noInstructions", "No instructions available.")}
    </div>

    {stepIngredients.length > 0 && (
      <div
        style={{
          padding: 14,
          borderRadius: 16,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "grid",
          gap: 9,
        }}
      >
        <div
          style={{
            fontSize: 12,
            opacity: 0.62,
            fontWeight: 900,
          }}
        >
          {t("cookMode.ingredientsInStep")}
        </div>

        {stepIngredients.map((ingredient, index) => (
          <div
            key={`${ingredient}-${index}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "rgba(255,255,255,0.78)",
            }}
          >
            <CheckCircle2
              size={14}
              style={{
                color: "#86efac",
                opacity: 0.65,
                flexShrink: 0,
              }}
            />

            <span
              style={{
                fontSize: 13,
                lineHeight: 1.4,
              }}
            >
              {formatIngredientDisplay(
                getCookModeIngredientLabel(ingredient)
              )}
            </span>
          </div>
        ))}
      </div>
    )}

    <div
      style={{
        padding: "11px 13px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          minWidth: 0,
          display: "grid",
          gap: 3,
        }}
      >
        <div
          style={{
            fontSize: 12,
            opacity: 0.62,
            fontWeight: 900,
          }}
        >
          {t("cookMode.myNotes")}
        </div>

        <div
          style={{
            fontSize: 12,
            lineHeight: 1.4,
            opacity: userNote.trim() ? 0.82 : 0.46,
            whiteSpace: "pre-wrap",
          }}
        >
          {userNote.trim()
            ? userNote
            : t("cookMode.addPersonalNote")}
        </div>
      </div>

      <button
        onClick={handleEditUserNote}
        style={{
          ...cookChipBtn,
          padding: "8px 11px",
          fontSize: 12,
          flexShrink: 0,
        }}
      >
        {t("cookMode.editNote")}
      </button>
    </div>

    {(detectedTimerSeconds || timerSeconds !== null) && (
      <div
        style={{
          padding: 14,
          borderRadius: 16,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "grid",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 900,
          }}
        >
          <Timer size={16} />
          {t("cookMode.timer")}
        </div>

        <div style={{ fontSize: 28, fontWeight: 1000 }}>
          {timerFinished
            ? "0:00"
            : timerSeconds !== null
            ? formatTimer(timerSeconds)
            : detectedTimerSeconds
            ? formatTimer(detectedTimerSeconds)
            : "0:00"}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {timerSeconds === null && detectedTimerSeconds && (
            <button onClick={handleStartTimer} style={topBtn}>
              <Timer size={16} />
              {timerFinished
                ? currentLanguage === "es"
                  ? "Iniciar de nuevo"
                  : "Start Again"
                : t("cookMode.startTimer")}
            </button>
          )}

          {timerSeconds !== null && (
            <>
              <button onClick={handlePauseResumeTimer} style={topBtn}>
                {timerRunning ? t("cookMode.pauseTimer", "Pause Timer") : t("cookMode.resumeTimer", "Resume Timer")}
              </button>

              <button onClick={handleClearTimer} style={topBtn}>
                {t("cookMode.clearTimer", "Clear Timer")}
              </button>
            </>
          )}
        </div>
      </div>
    )}

    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.025)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() =>
          setShowCookAllIngredients((prev) => !prev)
        }
        aria-expanded={showCookAllIngredients}
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          color: "white",
          padding: "13px 14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          textAlign: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            minWidth: 0,
          }}
        >
          <ShoppingCart
            size={16}
            style={{ color: "#86efac", flexShrink: 0 }}
          />

          <span
            style={{
              fontSize: 14,
              fontWeight: 1000,
            }}
          >
            {currentLanguage === "es"
              ? "Todos los ingredientes"
              : "All ingredients"}
          </span>

          <span
            style={{
              fontSize: 11,
              fontWeight: 900,
              padding: "3px 7px",
              borderRadius: 999,
              background: "rgba(34,197,94,0.10)",
              color: "#86efac",
            }}
          >
            {prepIngredientItems.length}
          </span>
        </div>

        <ChevronRight
          size={17}
          style={{
            flexShrink: 0,
            opacity: 0.65,
            transform: showCookAllIngredients
              ? "rotate(90deg)"
              : "rotate(0deg)",
            transition: "transform 0.18s ease",
          }}
        />
      </button>

      {showCookAllIngredients && (
        <div
          style={{
            borderTop:
              "1px solid rgba(255,255,255,0.07)",
            padding: "6px 14px 14px",
            display: "grid",
            gap: 0,
          }}
        >
          {ingredients.map((ingredient, index) => {
            const isHeader =
              isIngredientHeader(ingredient) ||
              ingredient.trim().endsWith(":");

            if (isHeader) {
              return (
                <div
                  key={`${ingredient}-${index}`}
                  style={{
                    padding: "12px 0 5px",
                    fontSize: 11,
                    fontWeight: 1000,
                    letterSpacing: 0.7,
                    textTransform: "uppercase",
                    color: "#86efac",
                  }}
                >
                  {ingredient.replace(/:$/, "")}
                </div>
              );
            }

            return (
              <div
                key={`${ingredient}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 9,
                  padding: "8px 0",
                  borderBottom:
                    index === ingredients.length - 1
                      ? "none"
                      : "1px solid rgba(255,255,255,0.045)",
                }}
              >
                <CheckCircle2
                  size={14}
                  style={{
                    marginTop: 2,
                    flexShrink: 0,
                    color: "rgba(255,255,255,0.28)",
                  }}
                />

                <span
                  style={{
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: "rgba(255,255,255,0.78)",
                  }}
                >
                  {formatIngredientDisplay(ingredient)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>

    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <button
        onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
        style={{
          ...topBtn,
          opacity: stepIndex <= 0 ? 0.32 : 1,
          cursor: stepIndex <= 0 ? "default" : "pointer",
        }}
        disabled={stepIndex <= 0}
      >
        <ChevronLeft size={16} />
        {t("cookMode.previous")}
      </button>

      {!isLastStep ? (
        <button
          onClick={() =>
            setStepIndex((prev) => Math.min(instructions.length - 1, prev + 1))
          }
          style={{
            ...topBtn,
            border: "1px solid rgba(34,197,94,0.45)",
            background: "rgba(34,197,94,0.12)",
            color: "#86efac",
          }}
          disabled={stepIndex >= instructions.length - 1}
        >
          {t("cookMode.next")}
          <ChevronRight size={16} />
        </button>
      ) : (
        <button
          onClick={handleFinishCooking}
          style={{
            ...topBtn,
            border: "1px solid rgba(34,197,94,0.45)",
            background: "rgba(34,197,94,0.12)",
            color: "#86efac",
          }}
        >
          <ChefHat size={16} />
          {t("cookMode.finishCooking", "Finish Cooking")}
        </button>
      )}

    </div>
  </div>
) : !cookMode ? (
  <>
    <div
      style={{
        padding: 16,
        borderRadius: 22,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "grid",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 1000,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            {currentLanguage === "es" ? "Tamaño de la receta" : "Recipe Size"}
          </div>

          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.58)",
              marginTop: 3,
              lineHeight: 1.4,
            }}
          >
            {currentLanguage === "es"
              ? "Ajusta las cantidades sin cambiar la receta guardada."
              : "Adjust amounts without changing the saved recipe."}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 6,
            minWidth: 220,
          }}
        >
          {RECIPE_SCALE_OPTIONS.map((scale) => {
            const active = recipeScale === scale;

            return (
              <button
                key={scale}
                type="button"
                onClick={() => setRecipeScale(scale)}
                style={{
                  borderRadius: 999,
                  padding: "9px 10px",
                  border: active
                    ? "1px solid rgba(34,197,94,0.45)"
                    : "1px solid rgba(255,255,255,0.10)",
                  background: active
                    ? "rgba(34,197,94,0.16)"
                    : "rgba(255,255,255,0.05)",
                  color: active ? "#86efac" : "rgba(255,255,255,0.78)",
                  fontWeight: 1000,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {getRecipeScaleLabel(
                  scale,
                  currentLanguage === "es" ? "es" : "en"
                )}
              </button>

            );
          })}

        </div>
                {scaledServings !== null && (
          <div
            style={{
              paddingTop: 10,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              fontSize: 13,
              fontWeight: 900,
              color: "#86efac",
            }}
          >
            {currentLanguage === "es"
              ? `Rinde ${scaledServings} ${
                  scaledServings === 1 ? "porción" : "porciones"
                }`
              : `Serves ${scaledServings}`}
          </div>
        )}
      </div>
    </div>

    <div style={sectionCardStyle}>
      <div style={sectionHeaderRow}>
        <div style={sectionHeadingWrap}>
          <span style={sectionIconBadge}>
            <HeartPulse size={16} />
          </span>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                }}
              >
                {currentLanguage === "es"
                  ? "Nutrición"
                  : "Nutrition"}
              </h2>

              <span
                style={{
                  fontSize: 10,
                  fontWeight: 1000,
                  letterSpacing: 0.7,
                  textTransform: "uppercase",
                  padding: "4px 7px",
                  borderRadius: 999,
                  color: "#86efac",
                  background:
                    "rgba(34,197,94,0.12)",
                  border:
                    "1px solid rgba(34,197,94,0.22)",
                }}
              >
                Plus
              </span>
            </div>

            <div
              style={{
                fontSize: 12,
                opacity: 0.58,
                marginTop: 3,
              }}
            >
              {currentLanguage === "es"
                ? "Valores estimados por porción."
                : "Estimated values per serving."}
            </div>
          </div>
        </div>

        {nutrition && (
          <span style={countBadge}>
            {nutrition.confidence === "high"
              ? currentLanguage === "es"
                ? "Alta confianza"
                : "High confidence"
              : nutrition.confidence === "medium"
                ? currentLanguage === "es"
                  ? "Confianza media"
                  : "Medium confidence"
                : currentLanguage === "es"
                  ? "Confianza baja"
                  : "Low confidence"}
          </span>
        )}
      </div>

      {!hasPlus && !plusLoading && (
        <div
          style={{
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              padding: 14,
              borderRadius: 16,
              background:
                "rgba(255,255,255,0.025)",
              border:
                "1px solid rgba(255,255,255,0.06)",
              fontSize: 13,
              lineHeight: 1.55,
              color:
                "rgba(255,255,255,0.72)",
            }}
          >
            {currentLanguage === "es"
              ? "Consulta calorías, proteína, carbohidratos, grasa, fibra y sodio con Simple Dinners Plus."
              : "See calories, protein, carbs, fat, fiber, and sodium with Simple Dinners Plus."}
          </div>

          <button
            type="button"
            onClick={() =>
              requirePlus({
                feature: "nutrition",
              })
            }
            style={{
              ...primaryCookButton,
              padding: "12px 14px",
              fontSize: 14,
            }}
          >
            <HeartPulse size={17} />

            {currentLanguage === "es"
              ? "Ver nutrición con Plus"
              : "View Nutrition with Plus"}
          </button>
        </div>
      )}

      {plusLoading && (
        <div
          style={{
            fontSize: 13,
            color:
              "rgba(255,255,255,0.60)",
          }}
        >
          {currentLanguage === "es"
            ? "Comprobando Simple Dinners Plus…"
            : "Checking Simple Dinners Plus…"}
        </div>
      )}

      {hasPlus &&
        !nutrition &&
        !nutritionLoading && (
          <div
            style={{
              display: "grid",
              gap: 12,
            }}
          >
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background:
                  "rgba(255,255,255,0.025)",
                border:
                  "1px solid rgba(255,255,255,0.06)",
                fontSize: 13,
                lineHeight: 1.55,
                color:
                  "rgba(255,255,255,0.72)",
              }}
            >
              {currentLanguage === "es"
                ? "Calcula una estimación nutricional utilizando datos de USDA FoodData Central."
                : "Calculate an estimated nutrition breakdown using USDA FoodData Central data."}
            </div>

            {nutritionError && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background:
                    "rgba(239,68,68,0.08)",
                  border:
                    "1px solid rgba(239,68,68,0.18)",
                  color: "#fca5a5",
                  fontSize: 12,
                  lineHeight: 1.45,
                }}
              >
                {nutritionError}
              </div>
            )}

            <button
              type="button"
              onClick={
                analyzeNutrition
              }
              disabled={
                baseServings ===
                null
              }
              style={{
                ...primaryCookButton,
                padding: "12px 14px",
                fontSize: 14,
                opacity:
                  baseServings ===
                  null
                    ? 0.5
                    : 1,
                cursor:
                  baseServings ===
                  null
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <HeartPulse size={17} />

              {currentLanguage === "es"
                ? "Analizar nutrición"
                : "Analyze Nutrition"}
            </button>
          </div>
        )}

      {hasPlus &&
        nutritionLoading && (
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background:
                "rgba(34,197,94,0.07)",
              border:
                "1px solid rgba(34,197,94,0.14)",
              display: "grid",
              gap: 6,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 1000,
                color: "#86efac",
              }}
            >
              {currentLanguage === "es"
                ? "Analizando ingredientes…"
                : "Analyzing ingredients…"}
            </div>

            <div
              style={{
                fontSize: 12,
                lineHeight: 1.45,
                color:
                  "rgba(255,255,255,0.58)",
              }}
            >
              {currentLanguage === "es"
                ? "Estamos comparando los ingredientes con datos nutricionales de USDA FoodData Central."
                : "Matching ingredients with USDA FoodData Central nutrition data."}
            </div>
          </div>
        )}

      {hasPlus && nutrition && (
        <div
          style={{
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontSize: 36,
                lineHeight: 1,
                fontWeight: 1000,
                color: "#fff",
              }}
            >
              {
                nutrition
                  .perServing
                  .calories
              }
            </div>

            <div
              style={{
                paddingBottom: 3,
                fontSize: 13,
                fontWeight: 900,
                color:
                  "rgba(255,255,255,0.62)",
              }}
            >
              {currentLanguage === "es"
                ? "calorías por porción"
                : "calories per serving"}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: 8,
            }}
          >
            {[
              {
                label:
                  currentLanguage ===
                  "es"
                    ? "Proteína"
                    : "Protein",
                value: `${nutrition.perServing.proteinG}g`,
              },
              {
                label:
                  currentLanguage ===
                  "es"
                    ? "Carbohidratos"
                    : "Carbs",
                value: `${nutrition.perServing.carbsG}g`,
              },
              {
                label:
                  currentLanguage ===
                  "es"
                    ? "Grasa"
                    : "Fat",
                value: `${nutrition.perServing.fatG}g`,
              },
              {
                label:
                  currentLanguage ===
                  "es"
                    ? "Fibra"
                    : "Fiber",
                value: `${nutrition.perServing.fiberG}g`,
              },
              {
                label:
                  currentLanguage ===
                  "es"
                    ? "Sodio"
                    : "Sodium",
                value: `${nutrition.perServing.sodiumMg}mg`,
              },
              {
                label:
                  currentLanguage ===
                  "es"
                    ? "Ingredientes identificados"
                    : "Ingredients matched",
                value: `${Math.round(
                  nutrition.coverage *
                    100
                )}%`,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding:
                    "11px 12px",
                  borderRadius: 14,
                  background:
                    "rgba(255,255,255,0.035)",
                  border:
                    "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color:
                      "rgba(255,255,255,0.52)",
                    marginBottom: 3,
                  }}
                >
                  {item.label}
                </div>

                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 1000,
                    color: "#fff",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              paddingTop: 10,
              borderTop:
                "1px solid rgba(255,255,255,0.06)",
              fontSize: 11,
              lineHeight: 1.5,
              color:
                "rgba(255,255,255,0.48)",
            }}
          >
            {currentLanguage === "es"
              ? "Estimación basada en datos de USDA FoodData Central. Los valores pueden variar según la marca, el tamaño de la porción y la preparación."
              : "Estimated using USDA FoodData Central data. Values may vary by brand, portion size, and preparation."}
          </div>
        </div>
      )}
    </div>

    <div style={sectionCardStyle}>
      <div style={sectionHeaderRow}>
        <div style={sectionHeadingWrap}>
          <span style={sectionIconBadge}>
            <ShoppingCart size={16} />
          </span>

          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>
              {t("recipe.ingredients")}
            </h2>
            <div style={{ fontSize: 12, opacity: 0.58, marginTop: 3 }}>
              {t("recipe.tapIngredients")}
            </div>
          </div>
        </div>

        <span style={countBadge}>
          {ingredients.length} {t("recipe.ingredientCount")}
        </span>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {visibleIngredients.map((item, index) => {
          const checked = !!checkedIngredients[index];
          const isHeader = isIngredientHeader(item) || item.trim().endsWith(":");

          if (isHeader) {
            return (
              <div key={`${item}-${index}`} style={ingredientHeaderStyle}>
                {item.replace(/:$/, "")}
              </div>
            );
          }

          return (
            <button
              key={`${item}-${index}`}
              type="button"
              onClick={() => toggleIngredient(index)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                textAlign: "left",
                background: checked
                  ? "rgba(34,197,94,0.06)"
                  : "rgba(255,255,255,0.02)",
                border: checked
                  ? "1px solid rgba(34,197,94,0.18)"
                  : "1px solid rgba(255,255,255,0.045)",
                padding: "10px 11px",
                borderRadius: 14,
                cursor: "pointer",
                color: "white",
                opacity: checked ? 0.72 : 1,
              }}
            >
              <CheckCircle2
                size={16}
                style={{
                  marginTop: 2,
                  color: checked ? "#22c55e" : "rgba(255,255,255,0.35)",
                  flexShrink: 0,
                }}
              />

              <span
                style={{
                  lineHeight: 1.45,
                  textDecoration: checked ? "line-through" : "none",
                }}
              >
                {item}
              </span>
            </button>
          );
        })}

        {hasMoreIngredients && (
          <button
            type="button"
            onClick={() => setShowAllIngredients((prev) => !prev)}
            style={{
              marginTop: 12,
              width: "100%",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              color: "#86efac",
              borderRadius: 14,
              padding: "12px 14px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {showAllIngredients
              ? t("recipe.showFewerIngredients")
              : `${t("recipe.showAllIngredients")} (${ingredients.length})`}
          </button>
        )}
      </div>
    </div>

    <div style={sectionCardStyle}>
      <div style={sectionHeaderRow}>
        <div style={sectionHeadingWrap}>
          <span style={sectionIconBadge}>
            <ChefHat size={16} />
          </span>

          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>
              {t("recipe.instructions")}
            </h2>
            <div style={{ fontSize: 12, opacity: 0.58, marginTop: 3 }}>
              {t("recipe.followSteps")}
            </div>
          </div>
        </div>

        <span style={countBadge}>
          {instructions.length} {t("recipe.stepCount")}
        </span>
      </div>

      <div style={{ display: "grid", gap: 0 }}>
        {visibleInstructions.map((step, index) => (
          <div
            key={`${step}-${index}`}
            style={{
              ...instructionStepStyle,
              borderBottom:
                index === visibleInstructions.length - 1
                  ? "none"
                  : instructionStepStyle.borderBottom,
            }}
          >
            <div
              style={{
                minWidth: 28,
                height: 28,
                borderRadius: 999,
                background: "rgba(34,197,94,0.12)",
                color: "#86efac",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 13,
                marginTop: 2,
              }}
            >
              {index + 1}
            </div>

            <div style={{ lineHeight: 1.6 }}>{step}</div>
          </div>
        ))}
      </div>
    </div>
  </>
) : null}

      {!cookMode && hasMoreInstructions && (
  <button
    type="button"
    onClick={() => setShowAllInstructions((prev) => !prev)}
    style={{
      marginTop: 12,
      width: "100%",
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.04)",
      color: "#86efac",
      borderRadius: 14,
      padding: "12px 14px",
      fontWeight: 900,
      cursor: "pointer",
    }}
  >
    {showAllInstructions
      ? t("recipe.showFewerSteps")
      : `${t("recipe.showAllSteps")} (${instructions.length})`}
  </button>
)}




      {editSidesOpen && !printMode && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(2,6,23,0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setEditSidesOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 24,
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(2,6,23,0.98))",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
              padding: 20,
              color: "#fff",
              display: "grid",
              gap: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 22 }}>
                  {t("recipe.editSidesTitle", "Edit sides")}
                </h3>
                <p
                  style={{
                    margin: "6px 0 0",
                    opacity: 0.65,
                    fontSize: 14,
                    lineHeight: 1.45,
                  }}
                >
                  {t(
                    "recipe.editSidesSubtitle",
                    "Customize what goes well with this recipe."
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditSidesOpen(false)}
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  color: "white",
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                aria-label={t("recipe.closeSidesEditor", "Close sides editor")}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {sideDraftList.length > 0 ? (
                sideDraftList.map((side) => (
                  <div
                    key={side}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    <span style={{ fontWeight: 800 }}>{side}</span>

                    <button
                      type="button"
                      onClick={() => removeSideDraft(side)}
                      style={{
                        border: "none",
                        background: "rgba(239,68,68,0.12)",
                        color: "#f87171",
                        borderRadius: 999,
                        padding: "6px 10px",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      {t("recipe.removeSide", "Remove")}
                    </button>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.55)",
                    fontWeight: 700,
                  }}
                >
                  {t("recipe.noCustomSides", "No custom sides yet.")}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={sideDraft}
                onChange={(e) => setSideDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSideDraft();
                  }
                }}
                placeholder={t("recipe.addSidePlaceholder", "Add a side...")}
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                  borderRadius: 14,
                  padding: "12px 14px",
                  fontWeight: 700,
                }}
              />

              <button
                type="button"
                onClick={addSideDraft}
                style={{
                  border: "none",
                  borderRadius: 14,
                  padding: "12px 14px",
                  background: "rgba(34,197,94,0.16)",
                  color: "#86efac",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {t("recipe.addSide", "Add")}
              </button>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <button
                type="button"
                onClick={saveSideDrafts}
                style={{
                  border: "none",
                  borderRadius: 16,
                  padding: "13px 14px",
                  background: "rgba(34,197,94,0.18)",
                  color: "#86efac",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {t("recipe.saveSides", "Save sides")}
              </button>

              <button
                type="button"
                onClick={resetSideDrafts}
                style={{
                  border: "1px solid rgba(239,68,68,0.24)",
                  borderRadius: 16,
                  padding: "12px 14px",
                  background: "rgba(239,68,68,0.08)",
                  color: "#f87171",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {t("recipe.resetDefaultSides", "Reset to default sides")}
              </button>

              <button
                type="button"
                onClick={() => setEditSidesOpen(false)}
                style={{
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 16,
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.78)",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {t("common.cancel", "Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
      {noteModalOpen && !printMode && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.58)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setNoteModalOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(12,18,28,0.96)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
              color: "white",
              padding: 18,
              display: "grid",
              gap: 14,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 1000,
                    fontSize: 18,
                  }}
                >
                  <Pin size={18} />
                  {t("recipe.personalNote", "Personal Note")}
                </div>
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                  {t("recipe.personalNoteSubtitle", "Save reminders, tweaks, or family preferences for this recipe.")}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setNoteModalOpen(false)}
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  color: "white",
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                aria-label={t("recipe.closeNoteEditor", "Close note editor")}
              >
                <X size={18} />
              </button>
            </div>

            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder={t("recipe.noteExample", "Example: Add extra garlic next time, make sauce on the side, kids liked this one...")}
              autoFocus
              rows={6}
              style={{
                width: "100%",
                boxSizing: "border-box",
                resize: "vertical",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                padding: 14,
                fontSize: 15,
                lineHeight: 1.45,
                outline: "none",
                fontFamily: "inherit",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={handleClearUserNote}
                disabled={!userNote.trim() && !noteDraft.trim()}
                style={{
                  ...topBtn,
                  opacity: !userNote.trim() && !noteDraft.trim() ? 0.45 : 1,
                }}
              >
                {t("recipe.clearNote", "Clear Note")}
              </button>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => {
                    setNoteDraft(userNote);
                    setNoteModalOpen(false);
                  }}
                  style={topBtn}
                >
                  {t("common.cancel")}
                </button>

                <button
                  type="button"
                  onClick={handleSaveUserNote}
                  style={{
                    ...topBtn,
                    border: "1px solid rgba(34,197,94,0.45)",
                    background: "rgba(34,197,94,0.12)",
                    color: "#86efac",
                  }}
                >
                  {t("recipe.saveNote", "Save Note")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
); }