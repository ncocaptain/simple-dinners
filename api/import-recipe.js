export default async function handler(req, res) {
  // =========================================================
  // CORS
  // =========================================================

  const allowedOrigins = [
    "https://dinners.ncocaptain.com",
    "capacitor://localhost",
    "http://localhost",
    "https://localhost",
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader(
      "Access-Control-Allow-Origin",
      "https://dinners.ncocaptain.com"
    );
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // =========================================================
  // ONLY ALLOW POST
  // =========================================================

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST only",
    });
  }

  // =========================================================
  // GET URL
  // =========================================================

  const { url } = req.body || {};

  if (!url) {
    return res.status(400).json({
      error: "URL required",
    });
  }

  // =========================================================
  // TRY NEW RENDER IMPORT API
  // =========================================================

  try {
    console.log("Using Simple Dinners API importer:", url);

    const response = await fetch(
      "https://simple-dinners-api.onrender.com/import-recipe",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      }
    );

    const data = await response.json();

    console.log("API IMPORT RESULT", {
      success: data?.success,
      successLevel: data?.successLevel,
      recipeName: data?.recipe?.name,
      ingredientsCount:
        data?.recipe?.ingredients?.split("\n")?.length || 0,
      instructionsCount:
        data?.recipe?.instructions?.split("\n")?.length || 0,
    });

    // =========================================================
    // SUCCESS
    // =========================================================

    if (data?.success && data?.recipe) {
      return res.status(200).json(data);
    }

    // =========================================================
    // API FAILED
    // =========================================================

    return res.status(500).json({
      error: "Import failed from API",
      debug: data,
    });
  } catch (err) {
    console.error("Render API Import failed:", err);

    return res.status(500).json({
      error: "Recipe import failed",
      details: err?.message || "Unknown error",
    });
  }
}