import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { ShareRecipeExtractor } from "../plugins/shareRecipeExtractor";

const API_BASE = "https://simple-dinners-api.onrender.com";
const SOURCE_STEPS_PLACEHOLDER = "Steps available at source link!";

function extractFirstUrlFromSharedText(value: string | null): string {
  if (!value) return "";

  let text = value.trim().replace(/\+/g, " ");

  try {
    text = decodeURIComponent(text);
  } catch {
    // If already decoded, keep going.
  }

  const match = text.match(
    /(?:https?:\/\/|www\.|pin\.it\/|pinterest\.com\/)[^\s"'<>]+/i
  );

  if (!match) {
    return "";
  }

  let foundUrl = match[0]
    .replace(/[)\].,!?]+$/g, "")
    .replace(/&amp;/g, "&")
    .trim();

  if (foundUrl.startsWith("www.")) {
    foundUrl = `https://${foundUrl}`;
  }

  if (foundUrl.startsWith("pin.it/") || foundUrl.startsWith("pinterest.com/")) {
    foundUrl = `https://${foundUrl}`;
  }

  return foundUrl;
}

function isPinterestUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();

    return (
      host === "pin.it" ||
      host === "pinterest.com" ||
      host === "www.pinterest.com" ||
      host.endsWith(".pinterest.com")
    );
  } catch {
    const lower = rawUrl.toLowerCase();

    return lower.includes("pinterest.com") || lower.includes("pin.it/");
  }
}

function isCaptionAssistSocialUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();

    return (
      host.includes("instagram.com") ||
      host.includes("tiktok.com") ||
      host.includes("facebook.com") ||
      host.includes("fb.watch")
    );
  } catch {
    const lower = rawUrl.toLowerCase();

    return (
      lower.includes("instagram.com") ||
      lower.includes("tiktok.com") ||
      lower.includes("facebook.com") ||
      lower.includes("fb.watch")
    );
  }
}

function getRawSharedValue(params: URLSearchParams): string {
  const knownKeys = [
    "url",
    "text",
    "title",
    "sharedUrl",
    "sharedText",
    "content",
    "message",
    "u",
  ];

  const knownValues = knownKeys
    .map((key) => params.get(key))
    .filter((value): value is string => Boolean(value && value.trim()));

  const allValues = Array.from(params.values()).filter((value) =>
    Boolean(value && value.trim())
  );

  return Array.from(new Set([...knownValues, ...allValues])).join("\n");
}

function countRecipeLines(value: unknown): number {
  const text = String(value || "").trim();

  if (!text || text === SOURCE_STEPS_PLACEHOLDER) {
    return 0;
  }

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;
}

function getResultSourceUrl(result: any): string {
  return String(
    result?.sourceUrl ||
      result?.importedFromUrl ||
      result?.recipe?.sourceUrl ||
      ""
  );
}

function isIncompleteSocialImport(result: any): boolean {
  const sourceUrl = getResultSourceUrl(result).toLowerCase();

  if (!isCaptionAssistSocialUrl(sourceUrl)) {
    return false;
  }

  const ingredientCount = Array.isArray(result?.ingredients)
    ? result.ingredients.length
    : countRecipeLines(result?.recipe?.ingredients);

  const instructionCount = Array.isArray(result?.instructions)
    ? result.instructions.length
    : countRecipeLines(result?.recipe?.instructions);

  return ingredientCount === 0 && instructionCount === 0;
}

async function importFromUrl(recipeUrl: string, captionText = "") {
  const response = await fetch(`${API_BASE}/import-recipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: recipeUrl,
      ...(captionText.trim() ? { captionText: captionText.trim() } : {}),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Recipe import failed");
  }

  return data;
}

async function importFromJsonLd(recipeUrl: string, jsonLd: string) {
  const response = await fetch(`${API_BASE}/import-jsonld`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: recipeUrl,
      jsonLd,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "JSON-LD import failed");
  }

  return data;
}

export default function ShareImport() {
  const [params] = useSearchParams();
  const rawSharedValue = getRawSharedValue(params);
  const url = extractFirstUrlFromSharedText(rawSharedValue);

  const navigate = useNavigate();

  const [status, setStatus] = useState("Ready to save recipe...");
  const [jsonLdLength, setJsonLdLength] = useState<number | null>(null);
  const [captionAssistResult, setCaptionAssistResult] = useState<any | null>(
    null
  );
  const [captionAssistText, setCaptionAssistText] = useState("");
  const [captionAssistLoading, setCaptionAssistLoading] = useState(false);

  const finishImport = useCallback(
    (data: any) => {
      setStatus(`Recipe found: ${data.recipe.name || data.name || "Recipe"}`);

      setTimeout(() => {
        navigate("/cookbook", {
          replace: true,
          state: {
            sharedImportedRecipe: data.recipe,
          },
        });
      }, 500);
    },
    [navigate]
  );

  async function finishWithCaptionAssist() {
    if (!captionAssistResult) return;

    if (!captionAssistText.trim()) {
      setStatus("Paste the recipe caption first.");
      return;
    }

    const sourceUrl = getResultSourceUrl(captionAssistResult) || url;

    if (!sourceUrl) {
      setStatus("Missing source link for this recipe.");
      return;
    }

    setCaptionAssistLoading(true);
    setStatus("Finishing recipe from caption...");

    try {
      const cleanedCaptionText = captionAssistText.trim();

const captionPayload = {
  url: sourceUrl,
  captionText: cleanedCaptionText,
  sharedText: cleanedCaptionText,
};

const captionResponse = await fetch(`${API_BASE}/import-recipe`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(captionPayload),
});

const assistedData = await captionResponse.json();

if (!captionResponse.ok) {
  throw new Error(assistedData?.error || "Caption Assist failed.");
}

if (!assistedData?.success || !assistedData?.recipe) {
  throw new Error(assistedData?.error || "Caption Assist failed.");
}

const ingredientCount = countRecipeLines(assistedData.recipe.ingredients);
const instructionCount = countRecipeLines(assistedData.recipe.instructions);

if (ingredientCount === 0 || instructionCount === 0) {
  setStatus(
    "We still couldn't finish this recipe from the caption. Try pasting the full caption, including Ingredients and How to Make."
  );
  return;
}

setCaptionAssistResult(null);
setCaptionAssistText("");
finishImport(assistedData);
    } catch (error) {
      console.error("Caption Assist failed:", error);
      setStatus(
        "We couldn’t finish this recipe from the caption. You can still save it and edit it manually."
      );
    } finally {
      setCaptionAssistLoading(false);
    }
  }

  function saveNeedsFinishing() {
    if (!captionAssistResult) return;

    const fallbackResult = captionAssistResult;

    setCaptionAssistResult(null);
    setCaptionAssistText("");

    finishImport(fallbackResult);
  }

  useEffect(() => {
    async function runShareImport() {
      if (!url) {
        setStatus("No shared URL found.");
        return;
      }

      try {
        let data;

        const platform = Capacitor.getPlatform();
        const pinterestShare = isPinterestUrl(url);
        const captionAssistSocialShare = isCaptionAssistSocialUrl(url);

        if (pinterestShare) {
          setStatus("Finding the original recipe from Pinterest...");
          data = await importFromUrl(url);
        } else if (captionAssistSocialShare) {
          setStatus("Finding post details...");
          data = await importFromUrl(url);
        } else if (platform === "android") {
          try {
            setStatus("Opening recipe page securely to read recipe details...");

            const result = await ShareRecipeExtractor.extractJsonLd({ url });

            setJsonLdLength(result.length);
            setStatus("Saving recipe details to Simple Dinners...");

            data = await importFromJsonLd(url, result.jsonLd);

            if (!data?.success || !data?.recipe) {
              throw new Error(data?.error || "JSON-LD import failed");
            }
          } catch {
            setStatus("Trying to find the recipe another way...");
            data = await importFromUrl(url);
          }
        } else {
          setStatus("Finding recipe details...");
          data = await importFromUrl(url);
        }

        if (!data?.success || !data?.recipe) {
          throw new Error(data?.error || "Recipe import failed");
        }

        if (isIncompleteSocialImport(data)) {
          setCaptionAssistResult(data);
          setCaptionAssistText("");
          setStatus("We found the post, but not the full recipe text.");
          return;
        }

        finishImport(data);
      } catch (error) {
        console.error("Share recipe failed:", error);

        if (isPinterestUrl(url)) {
          setStatus(
            "We couldn’t open this Pinterest link. Try opening the pin, copying the full Pinterest link, and pasting it into Simple Dinners."
          );
          return;
        }

        setStatus(
          "We couldn’t save this shared recipe link. Try copying the recipe link and pasting it into Simple Dinners."
        );
      }
    }

    runShareImport();
  }, [url, finishImport]);

  return (
    <div style={{ padding: 24, paddingBottom: 140, maxWidth: 900, margin: "0 auto" }}>
      <h1>📥 Saving Recipe</h1>

      <p>{status}</p>

      {captionAssistResult && (
        <div
          style={{
            marginTop: 20,
            padding: 18,
            borderRadius: 18,
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Paste caption to finish</h2>

          <p style={{ lineHeight: 1.5 }}>
            We found the post, but not the full recipe text. Paste the caption text if you can, and Simple Dinners will try to finish the recipe.
          </p>

          <textarea
            value={captionAssistText}
            onChange={(event) => setCaptionAssistText(event.target.value)}
            placeholder="Paste the recipe caption here..."
            rows={9}
            style={{
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 14,
  border: "1px solid rgba(255, 255, 255, 0.22)",
  background: "#0f172a",
  color: "#f8fafc",
  padding: 12,
  fontSize: 16,
  resize: "vertical",
  minHeight: 180,
}}
          />

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 14,
            }}
          >
            <button
              type="button"
              onClick={finishWithCaptionAssist}
              disabled={captionAssistLoading || !captionAssistText.trim()}
              style={{
  padding: "12px 16px",
  borderRadius: 999,
  border: 0,
  background:
    captionAssistLoading || !captionAssistText.trim()
      ? "rgba(148, 163, 184, 0.45)"
      : "#22c55e",
  color: "#ffffff",
  fontWeight: 700,
  cursor:
    captionAssistLoading || !captionAssistText.trim()
      ? "not-allowed"
      : "pointer",
}}
            >
              {captionAssistLoading ? "Finishing..." : "Finish with Caption"}
            </button>

            <button
              type="button"
              onClick={saveNeedsFinishing}
              disabled={captionAssistLoading}
              style={{
                padding: "12px 16px",
                borderRadius: 999,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "transparent",
                color: "inherit",
                fontWeight: 700,
                cursor: captionAssistLoading ? "not-allowed" : "pointer",
              }}
            >
              Save Needs Finishing
            </button>
          </div>

          <p style={{ fontSize: 13, opacity: 0.72, lineHeight: 1.45 }}>
            Can’t paste the caption? Save it as Needs Finishing and edit the
            ingredients and steps later.
          </p>
        </div>
      )}

      {jsonLdLength !== null && (
        <p>Recipe data found: {jsonLdLength} characters</p>
      )}

      {url && (
        <p style={{ fontSize: 12, opacity: 0.7, wordBreak: "break-all" }}>
          {url}
        </p>
      )}
    </div>
  );
}