import type { VercelRequest, VercelResponse } from "@vercel/node";

type Prefs = {
  vegetarian?: boolean;
  allowSubstitutions?: boolean;
  allergens?: string[]; // optional
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY in environment" });

  const { prefs, existingMeals } = (req.body ?? {}) as {
    prefs?: Prefs;
    existingMeals?: Record<string, { name?: string; ingredients?: string; instructions?: string }>;
  };

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  const emptyDays = days.filter((d) => {
    const m = existingMeals?.[d];
    const name = (m?.name ?? "").trim();
    const ing = (m?.ingredients ?? "").trim();
    const instr = (m?.instructions ?? "").trim();
    return !name && !ing && !instr;
  });

  // If none empty, nothing to do
  if (emptyDays.length === 0) return res.status(200).json({ meals: {} });

  const vegetarian = !!prefs?.vegetarian;
  const allowSubs = !!prefs?.allowSubstitutions;
  const allergens = Array.isArray(prefs?.allergens) ? prefs!.allergens!.filter(Boolean) : [];

  const prompt = `
You are generating a weekly dinner plan.

Return ONLY valid JSON (no markdown, no commentary).
Create dinner recipes for these days: ${JSON.stringify(emptyDays)}.

Constraints:
- Keep recipes realistic, not gourmet, weeknight friendly.
- Include measurements (cups, tbsp, oz, etc).
- Ingredients should be a single comma-separated string.
- Instructions should be step-by-step (numbered or new lines).
- If vegetarian=${vegetarian}, make all recipes vegetarian.
- If allergens list is not empty, avoid these allergens: ${allergens.join(", ")}.
- If allowSubstitutions=${allowSubs}, you may include a short substitution note inside instructions.

JSON shape:
{
  "meals": {
    "Monday": { "name": "...", "ingredients": "...", "instructions": "..." },
    ...
  }
}
`;

  try {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      encodeURIComponent(apiKey);

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1800,
        },
      }),
    });

    const data = await resp.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("") ?? "";

    // Try to parse JSON safely (Gemini sometimes adds whitespace)
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      return res.status(500).json({ error: "Model did not return JSON", raw: text.slice(0, 500) });
    }

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

    return res.status(200).json(parsed);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "Unknown error" });
  }
}
