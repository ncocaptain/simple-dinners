import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Printer,
  ArrowLeft,
  ShoppingCart,
  Play,
  History,
  Share2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  BookOpen,
  Timer,
  Moon,
  ChefHat,
  Pin,
  X,
} from "lucide-react";

import { getRecipeBySlug } from "../core/recipes";
import { addIngredientsToList } from "../shoppingList";
import { recordCook, getCookHistoryFor } from "../core/cookHistoryStore";
import { isCommonPantryStaple } from "../core/pantry";
import TipsModal from "../components/TipsModal";



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
  return String(text || "")
    .replace(/\b\w/g, (c) => c.toUpperCase()) // capitalize words
    .replace(/\s+/g, " ")
    .replace(/,+$/, "") // remove trailing commas
    .trim();
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
  return cleanIngredientText(text)
    .replace(/\([^)]*\)/g, "")
    .replace(/\b\d+(?:[\/.]\d+)?\b/g, "")
    .replace(
      /\b(cup|cups|tablespoon|tablespoons|tbsp|teaspoon|teaspoons|tsp|pound|pounds|lb|lbs|ounce|ounces|oz|clove|cloves|can|cans|package|packages|pkg|slice|slices)\b/gi,
      ""
    )
    .replace(
      /\b(large|small|medium|fresh|boneless|skinless|lean|halved|diced|chopped|minced|sliced|shredded|softened|melted|beaten|dried|finely)\b/gi,
      ""
    )
    .replace(/\s{2,}/g, " ")
    .trim();
}

function normalizePhotoUrl(url?: string) {
  if (!url) return "";
  const trimmed = url.trim();

  if (trimmed.startsWith("/images/")) {
    return trimmed.replace(/\.(png|jpg|jpeg)$/i, ".jpg");
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

  const meaningfulKeywords = keywords.filter(
    (word) =>
      word.length >= 4 &&
      !["yellow", "white", "fresh", "dried", "smoked", "ground"].includes(word)
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
    const AudioCtx =
      window.AudioContext ||
      (window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;

    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    const oscillator1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    oscillator1.type = "sine";
    oscillator1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);

    oscillator1.connect(gain1);
    gain1.connect(ctx.destination);
    oscillator1.start();
    oscillator1.stop(ctx.currentTime + 0.22);

    const oscillator2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    oscillator2.type = "sine";
    oscillator2.frequency.setValueAtTime(1174, ctx.currentTime + 0.25);
    gain2.gain.setValueAtTime(0.0001, ctx.currentTime + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.28);
    gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.65);

    oscillator2.connect(gain2);
    gain2.connect(ctx.destination);
    oscillator2.start(ctx.currentTime + 0.22);
    oscillator2.stop(ctx.currentTime + 0.65);
  } catch {
    // ignore audio failures
  }
}

const FINISH_MESSAGES = [
  "Dinner is ready 🎉",
  "That smells amazing 😎",
  "Another kitchen win 🔥",
  "Plates up! 🍽️",
  "Nicely done, chef 👨‍🍳",
  "Dinner = handled 💪",
  "Boom. Nailed it. ⭐",
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

export default function RecipePage({ onAddToCookbook }: RecipePageProps) {
  const navigate = useNavigate();
  const { slug = "" } = useParams();
  const location = useLocation();

useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}, [location.pathname]);

  const RECIPE_TIPS = [
    "Select ingredients to add only what you need",
    "Save recipes to your cookbook",
    "Use Cook Mode for step-by-step guidance",
    "Tap back to return to your plan",
  ];

  const COOK_TIPS = [
    "Swipe left or right to move between steps",
    "Start timers when detected",
    "Ingredients match the current step",
    "Mark Cooked to track history",
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

  // =====================================================
  // Builder: local state
  // =====================================================

  const [cookMode, setCookMode] = useState(startInCookMode);
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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [keepAwake, setKeepAwake] = useState(false);
  const [userNote, setUserNote] = useState<string>("");
  const [showNoteModal, setShowNoteModal] = useState(false);
const [draftUserNote, setDraftUserNote] = useState("");
  const [noteDraft, setNoteDraft] = useState<string>("");
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  const wakeLockRef = useRef<any>(null);
  const recipeNoteKey = recipe?.slug || recipe?.name || "";

  // =====================================================
  // Builder: derived recipe data
  // =====================================================

  const ingredients = useMemo(
    () => splitLines(recipe?.ingredients),
    [recipe?.ingredients]
  );

  const instructions = useMemo(
    () => splitLines(recipe?.instructions),
    [recipe?.instructions]
  );

  const photoUrl = normalizePhotoUrl(recipe?.photoUrl);
  const currentStep = instructions[stepIndex] || "";
  const detectedTimerSeconds = extractTimerSeconds(currentStep);
  const isLastStep =
    instructions.length > 0 && stepIndex >= instructions.length - 1;
  const isGrilling = Array.isArray(recipe?.tags)
    ? recipe.tags.includes("grilling")
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
    if (!recipe?.slug) return;
    const history = getCookHistoryFor(recipe.slug);
    setHistoryCount(history?.timesCooked ?? 0);
  }, [recipe?.slug]);

  useEffect(() => {
    const savedNote = getRecipeUserNote(recipeNoteKey);
    setUserNote(savedNote);
    setNoteDraft(savedNote);
    setNoteModalOpen(false);
  }, [recipeNoteKey]);

  useEffect(() => {
    if (!printMode) return;

    const id = window.setTimeout(() => window.print(), 300);
    return () => window.clearTimeout(id);
  }, [printMode]);

  useEffect(() => {
    setStepIndex(0);
    setCheckedIngredients({});
    setTimerSeconds(null);
    setTimerRunning(false);
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
    if (!timerRunning || timerSeconds === null) return;

    const intervalId = window.setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev === null) return null;

        if (prev <= 1) {
          window.clearInterval(intervalId);
          setTimerRunning(false);
          setTimerSeconds(null);
          setSaveMessage("⏱️ Timer done!");
          playTimerDoneSound();

          if ("vibrate" in navigator) {
            navigator.vibrate?.([200, 100, 200, 100, 300]);
          }

          return null;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerRunning, timerSeconds]);

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
          setSaveMessage("Screen awake not supported on this device");
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

  if (!recipe) {
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
          <h2 style={{ marginTop: 0 }}>Recipe not found</h2>
          <p style={{ opacity: 0.7, marginBottom: 20 }}>
            This recipe could not be loaded.
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
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  const safeRecipe = recipe;

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
          title: safeRecipe.name || "Recipe",
          url: shareUrl,
        });
        return;
      } catch {
        // ignore cancelled share
      }
    }

    await navigator.clipboard.writeText(shareUrl);
    setSaveMessage("Link copied!");
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
    trimmed ? "Personal note saved ✓" : "Personal note cleared"
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
    setSaveMessage("Personal note cleared");
  }

  const handleAddToCookbook = () => {
    if (!safeRecipe.slug) {
      setSaveMessage("Missing recipe info");
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
      setSaveMessage("Could not save recipe");
      return;
    }

    localStorage.setItem("scrollToCookbook", safeRecipe.slug);

    if (result.already) {
      setSavedState("already");
      setSaveMessage("Already in Cookbook");
    } else {
      setSavedState("saved");
      setSaveMessage("Saved to Cookbook ✓");
    }
  };

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [index]: !prev[index],
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
        ? "Selected ingredients added ✓"
        : "All ingredients added ✓"
    );
  };

  const handleCooked = () => {
    if (!safeRecipe.slug) return;

    recordCook(safeRecipe.slug);
    const history = getCookHistoryFor(safeRecipe.slug);
    setHistoryCount(history?.timesCooked ?? 0);
    setSaveMessage("Cook recorded ✓");
  };

  const handleFinishCooking = () => {
    if (safeRecipe.slug) {
      recordCook(safeRecipe.slug);
      const history = getCookHistoryFor(safeRecipe.slug);
      setHistoryCount(history?.timesCooked ?? 0);
    }

    const randomMessage =
      FINISH_MESSAGES[Math.floor(Math.random() * FINISH_MESSAGES.length)];

    setFinishMessage(randomMessage);
    setSaveMessage("Recipe finished ✓");
  };

  const handleStartTimer = () => {
    if (!detectedTimerSeconds) return;
    setTimerSeconds(detectedTimerSeconds);
    setTimerRunning(true);
    setSaveMessage("Timer started");
  };

  const handlePauseResumeTimer = () => {
    if (timerSeconds === null) return;
    setTimerRunning((prev) => !prev);
  };

  const handleClearTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(null);
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

  // =====================================================
  // Builder: render
  // =====================================================

  return (
  <div style={pageWrap}>
    <div style={innerWrap}>
      {!printMode && !cookMode && (
        <>
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h1>Recipe</h1>
              <TipsModal tips={RECIPE_TIPS} />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <button onClick={handleBack} style={topBtn}>
                <ArrowLeft size={16} />
                Back
              </button>

              <button onClick={() => setCookMode(true)} style={topBtn}>
                <Play size={16} />
                Cook Mode
              </button>

              <button onClick={handleAddIngredients} style={topBtn}>
                <ShoppingCart size={16} />
                Add Ingredients
              </button>

              <button
                onClick={handleAddToCookbook}
                disabled={savedState === "already"}
                style={{
                  ...topBtn,
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
                  ? "Saved ✓"
                  : savedState === "already"
                  ? "Saved"
                  : "Save Recipe"}
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                opacity: 0.85,
              }}
            >
              <button onClick={handleCooked} style={topBtn}>
                <History size={16} />
                Mark Cooked
              </button>

              <button
                onClick={() =>
                  navigate(
                    `/recipe/${encodeURIComponent(
                      safeRecipe.slug || safeRecipe.name || ""
                    )}?from=${encodeURIComponent(from)}&print=1`
                  )
                }
                style={topBtn}
              >
                <Printer size={16} />
                Print
              </button>

              <button onClick={handleShare} style={topBtn}>
                <Share2 size={16} />
                Share
              </button>

              <button onClick={openNoteModal} style={topBtn}>
  <Pin size={16} />
  {userNote.trim() ? "View Note" : "Add Note"}
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
      <strong>Your note:</strong>{" "}
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
        <div style={{ fontWeight: 900 }}>Personal Note</div>

        <button onClick={handleCloseNoteModal} style={{ ...topBtn }}>
          <X size={16} />
        </button>
      </div>

      <textarea
        value={draftUserNote}
        onChange={(e) => setDraftUserNote(e.target.value)}
        placeholder="Add a reminder, tweak, or family preference..."
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
          Save
        </button>

        <button onClick={handleCloseNoteModal} style={topBtn}>
          Cancel
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
        <button onClick={() => setCookMode(false)} style={topBtn}>
          <ArrowLeft size={16} />
          Exit Cook Mode
        </button>

        <button
          onClick={() => setKeepAwake((prev) => !prev)}
          style={{
            ...cookChipBtn,
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
          {keepAwake ? "Screen Awake On" : "Keep Screen Awake"}
        </button>

        <TipsModal tips={COOK_TIPS} />
      </div>
    </div>

    {saveMessage && <div style={messageStyle}>{saveMessage}</div>}

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
            <img
              src={photoUrl}
              alt={safeRecipe.name || "Recipe"}
              style={{
                width: "100%",
                aspectRatio: "16 / 8",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : null}

          <div style={{ padding: 20 }}>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 1000 }}>
              {safeRecipe.name}
            </h1>

            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 8,
                flexWrap: "wrap",
              }}
            >
              {safeRecipe.effort && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    padding: "4px 8px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    letterSpacing: 0.5,
                  }}
                >
                  {String(safeRecipe.effort).toUpperCase()}
                </span>
              )}

              {isGrilling && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    padding: "4px 8px",
                    borderRadius: 999,
                    background: "rgba(250,204,21,0.15)",
                    border: "1px solid rgba(250,204,21,0.35)",
                    color: "#fde68a",
                    letterSpacing: 0.5,
                  }}
                >
                  🔥 GRILLING
                </span>
              )}
            </div>

            {!!safeRecipe.notes?.trim() && (
              <p
                style={{
                  marginTop: 10,
                  marginBottom: 0,
                  opacity: 0.7,
                  lineHeight: 1.5,
                }}
              >
                {safeRecipe.notes}
              </p>
            )}

            <div style={{ marginTop: 10, fontSize: 13, opacity: 0.55 }}>
              Cooked {historyCount} time{historyCount === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      )}

      {cookMode ? (
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
      <div style={{ fontSize: 14, opacity: 0.75, fontWeight: 900 }}>
        Step {instructions.length ? stepIndex + 1 : 0} of {instructions.length}
      </div>

      {detectedTimerSeconds && timerSeconds === null && (
        <div style={{ fontSize: 12, opacity: 0.5, fontWeight: 700 }}>
          Timer detected for this step
        </div>
      )}
    </div>

    <div
      style={{
        fontSize: 28,
        lineHeight: 1.5,
        fontWeight: 900,
      }}
    >
      {currentStep || "No instructions available."}
    </div>

    <div
      style={{
        padding: 14,
        borderRadius: 16,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "grid",
        gap: 14,
      }}
    >
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontSize: 12, opacity: 0.6, fontWeight: 800 }}>
          Ingredients in this step
        </div>

        {stepIngredients.length ? (
          stepIngredients.map((ingredient, index) => (
            <div
              key={`${ingredient}-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: 0.8,
              }}
            >
              <CheckCircle2 size={14} style={{ opacity: 0.4 }} />
              <span style={{ fontSize: 13 }}>
                {formatIngredientDisplay(getCookModeIngredientLabel(ingredient))}
              </span>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 13, opacity: 0.5 }}>
            No specific ingredients detected for this step.
          </div>
        )}
      </div>

      <div
        style={{
          paddingTop: 8,
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "grid",
          gap: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.6, fontWeight: 800 }}>
            My Notes
          </div>

          <button onClick={handleEditUserNote} style={cookChipBtn}>
            Edit Note
          </button>
        </div>

        <div
          style={{
            fontSize: 13,
            lineHeight: 1.45,
            opacity: userNote.trim() ? 0.9 : 0.5,
            whiteSpace: "pre-wrap",
          }}
        >
          {userNote.trim() ? userNote : "Add a personal note"}
        </div>
      </div>
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
          Timer
        </div>

        <div style={{ fontSize: 28, fontWeight: 1000 }}>
          {timerSeconds !== null
            ? formatTimer(timerSeconds)
            : detectedTimerSeconds
            ? formatTimer(detectedTimerSeconds)
            : "0:00"}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {timerSeconds === null && detectedTimerSeconds && (
            <button onClick={handleStartTimer} style={topBtn}>
              <Timer size={16} />
              Start Timer
            </button>
          )}

          {timerSeconds !== null && (
            <>
              <button onClick={handlePauseResumeTimer} style={topBtn}>
                {timerRunning ? "Pause Timer" : "Resume Timer"}
              </button>

              <button onClick={handleClearTimer} style={topBtn}>
                Clear Timer
              </button>
            </>
          )}
        </div>
      </div>
    )}

    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <button
        onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
        style={topBtn}
        disabled={stepIndex <= 0}
      >
        <ChevronLeft size={16} />
        Previous
      </button>

      {!isLastStep ? (
        <button
          onClick={() =>
            setStepIndex((prev) => Math.min(instructions.length - 1, prev + 1))
          }
          style={topBtn}
          disabled={stepIndex >= instructions.length - 1}
        >
          Next
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
          Finish Cooking
        </button>
      )}

      <button onClick={handleCooked} style={topBtn}>
        <History size={16} />
        Mark Cooked
      </button>
    </div>
  </div>
) : (
        <>
          <div
            style={{
              padding: 20,
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 10,
              }}
            >
              <h2 style={{ margin: 0 }}>Ingredients</h2>

              <div style={{ fontSize: 12, opacity: 0.6 }}>
                Tap ingredients to select specific items
              </div>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {ingredients.map((item, index) => {
                const checked = !!checkedIngredients[index];

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
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: "white",
                      opacity: checked ? 0.55 : 1,
                    }}
                  >
                    <CheckCircle2
                      size={16}
                      style={{
                        marginTop: 2,
                        color: checked
                          ? "#22c55e"
                          : "rgba(255,255,255,0.35)",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        textDecoration: checked ? "line-through" : "none",
                      }}
                    >
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              padding: 20,
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Instructions</h2>

            <div style={{ display: "grid", gap: 14 }}>
              {instructions.map((step, index) => (
                <div
                  key={`${step}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
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
                  Personal Note
                </div>
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                  Save reminders, tweaks, or family preferences for this recipe.
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
                aria-label="Close note editor"
              >
                <X size={18} />
              </button>
            </div>

            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Example: Add extra garlic next time, make sauce on the side, kids liked this one..."
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
                Clear Note
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
                  Cancel
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
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
); }