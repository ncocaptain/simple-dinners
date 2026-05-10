export default async function handler(req, res) {
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
    res.setHeader("Access-Control-Allow-Origin", "https://dinners.ncocaptain.com");
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { text } = req.body || {};

  if (!text) {
    return res.status(400).json({ error: "Recipe text required" });
  }

  try {
    const response = await fetch(
      "https://simple-dinners-api.onrender.com/import-text",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    );

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (err) {
    console.error("Text import proxy failed:", err);

    return res.status(500).json({
      error: "Text import failed",
      details: err?.message || "Unknown error",
    });
  }
}