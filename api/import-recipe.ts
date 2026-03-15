import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Force CORS headers so your laptop/phone can't be blocked by the browser
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle Preflight
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 2. IMMEDIATE RESPONSE TEST
    // We are ignoring the scraper logic entirely for one deployment.
    // If you see this on your screen, the "Bridge" is open.
    return res.status(200).json({
      recipe: {
        name: "I am alive!",
        ingredients: "Connection test successful. No 402 here.",
        instructions: "If you see this, the bouncer let us in.",
        photoUrl: "",
        sourceUrl: "test-success"
      }
    });

  } catch (err: any) {
    // We use status 200 even for errors to see if we can bypass the 402 filter
    return res.status(200).json({ error: "Minimalist test failed", details: err.message });
  }
}