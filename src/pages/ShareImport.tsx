import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { ShareRecipeExtractor } from "../plugins/shareRecipeExtractor";

export default function ShareImport() {
  const [params] = useSearchParams();
  const url = params.get("url");
  const navigate = useNavigate();

  const [status, setStatus] = useState("Ready to import recipe...");
  const [jsonLdLength, setJsonLdLength] = useState<number | null>(null);

  useEffect(() => {
    async function runShareImport() {
      if (!url) {
        setStatus("No shared URL found.");
        return;
      }

      try {
        let data;

        if (Capacitor.getPlatform() === "android") {
          setStatus("Opening recipe page securely to read recipe details...");

          const result = await ShareRecipeExtractor.extractJsonLd({ url });

          setJsonLdLength(result.length);
          setStatus("Sending recipe data to Simple Dinners...");

          const response = await fetch(
            "https://simple-dinners-api.onrender.com/import-jsonld",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                url,
                jsonLd: result.jsonLd,
              }),
            }
          );

          data = await response.json();
        } else {
          setStatus("Sending recipe link to Simple Dinners...");

          const response = await fetch(
            "https://simple-dinners-api.onrender.com/import-recipe",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url }),
            }
          );

          data = await response.json();
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
      } catch {
        setStatus("Share import failed. Please try pasting the recipe link instead.");
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