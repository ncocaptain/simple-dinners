import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
        setStatus("Opening recipe page securely to read recipe details...");

        const result = await ShareRecipeExtractor.extractJsonLd({ url });

        setJsonLdLength(result.length);
        setStatus("Sending recipe data to Simple Dinners...");

        const response = await fetch(
          "https://simple-dinners-api.onrender.com/import-jsonld",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url,
              jsonLd: result.jsonLd,
            }),
          }
        );

        const data = await response.json();

        console.log("Imported recipe:", data?.recipe?.name || data?.name);
        console.log("Full import data:", JSON.stringify(data).slice(0, 1000));

        setStatus(`Imported: ${data?.recipe?.name || data?.name || "Recipe"}`);

setTimeout(() => {
  navigate("/cookbook", {
    replace: true,
    state: {
      sharedImportedRecipe: data?.recipe,
    },
  });
}, 500);
      } catch (error) {
        console.error("Share import failed:", error);
        setStatus("Share import failed. Check Logcat.");
      }
    }

    runShareImport();
  }, [url]);

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