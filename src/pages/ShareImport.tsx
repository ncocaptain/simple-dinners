import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { ShareRecipeExtractor } from "../plugins/shareRecipeExtractor";

const API_BASE = "https://simple-dinners-api.onrender.com";

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

export default function ShareImport() {
  const [params] = useSearchParams();

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

const rawSharedValue = getRawSharedValue(params);
const url = extractFirstUrlFromSharedText(rawSharedValue);

  const navigate = useNavigate();

  const [status, setStatus] = useState("Ready to import recipe...");
  const [jsonLdLength, setJsonLdLength] = useState<number | null>(null);

  useEffect(() => {
    async function importFromUrl(recipeUrl: string) {
      const response = await fetch(`${API_BASE}/import-recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: recipeUrl }),
      });

      return response.json();
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

      return response.json();
    }

    async function runShareImport() {
      if (!url) {
        setStatus("No shared URL found.");
        return;
      }

      try {
        let data;

        const platform = Capacitor.getPlatform();
        const pinterestShare = isPinterestUrl(url);

        if (pinterestShare) {
          setStatus("Finding the original recipe from Pinterest...");
          data = await importFromUrl(url);
        } else if (platform === "android") {
          try {
            setStatus("Opening recipe page securely to read recipe details...");

            const result = await ShareRecipeExtractor.extractJsonLd({ url });

            setJsonLdLength(result.length);
            setStatus("Sending recipe data to Simple Dinners...");

            data = await importFromJsonLd(url, result.jsonLd);

            if (!data?.success || !data?.recipe) {
              throw new Error(data?.error || "JSON-LD import failed");
            }
          } catch {
            setStatus("Trying the recipe link another way...");
            data = await importFromUrl(url);
          }
        } else {
          setStatus("Sending recipe link to Simple Dinners...");
          data = await importFromUrl(url);
        }

        if (!data?.success || !data?.recipe) {
          throw new Error(data?.error || "Recipe import failed");
        }

        setStatus(`Imported: ${data.recipe.name || data.name || "Recipe"}`);

        setTimeout(() => {
          navigate("/cookbook", {
            replace: true,
            state: {
              sharedImportedRecipe: data.recipe,
            },
          });
        }, 500);
      } catch (error) {
  console.error("Share import failed:", error);

  setStatus(
    `Share import failed. Shared value: ${rawSharedValue || "none"} | Extracted URL: ${
      url || "none"
    }`
  );
}
    }

    runShareImport();
  }, [url, navigate]);

  return (
    <div style={{ padding: 24 }}>
      <h1>📥 Importing Recipe</h1>

      <p>{status}</p>

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