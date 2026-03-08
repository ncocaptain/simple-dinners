import React from "react";
import { useNavigate } from "react-router-dom";
import { candidateLibrary } from "../core/planner";
import { rankCookNowMeals } from "../core/cookNow";
import { getCookbook } from "../core/cookbookStore";
import type { PantryItem } from "../core/types";
import Button from "../components/Button";

function loadPantry(): PantryItem[] {
  try {
    const raw = localStorage.getItem("pantry");
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (
      Array.isArray(parsed) &&
      parsed.length &&
      typeof parsed[0] === "object" &&
      parsed[0] &&
      "name" in parsed[0]
    ) {
      return parsed as PantryItem[];
    }

    if (Array.isArray(parsed) && (parsed.length === 0 || typeof parsed[0] === "string")) {
      return (parsed as string[]).map((name, i) => ({
        id: `pantry-${i}-${name}`,
        name,
        createdAt: Date.now(),
      }));
    }

    if (typeof parsed === "string") {
      return parsed
        .split(/[\n,]/g)
        .map((t) => t.trim())
        .filter(Boolean)
        .map((name, i) => ({
          id: `pantry-${i}-${name}`,
          name,
          createdAt: Date.now(),
        }));
    }

    return [];
  } catch {
    return [];
  }
}

export default function CookNowPage() {
  const navigate = useNavigate();

  const pantry = React.useMemo(() => loadPantry(), []);
  const cookbook = React.useMemo(() => getCookbook(), []);

  const allMeals = React.useMemo(() => {
    return [...candidateLibrary, ...cookbook];
  }, [cookbook]);

  const ranked = React.useMemo(() => {
    return rankCookNowMeals({
      meals: allMeals,
      pantry,
      favorites: cookbook
        .filter((m: any) => Boolean(m.favorite))
        .map((m: any) => m.name),
    });
  }, [allMeals, pantry, cookbook]);

  const top = ranked.slice(0, 6);

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <h1 style={{ marginBottom: 6 }}>🍳 Cook Now</h1>
          <p style={{ opacity: 0.8, margin: 0 }}>
            Best dinner ideas based on your pantry and favorites.
          </p>
        </div>
      </div>

      {top.length === 0 ? (
        <div className="card">
          <p>No meals found yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {top.map(({ meal, matched, missing }, idx) => (
            <div
              key={meal.slug ?? meal.id ?? `${meal.name}-${idx}`}
              className="card"
              style={{
                padding: 16,
                borderRadius: 16,
                border: "1px solid var(--border, #ddd)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 6px" }}>{meal.name}</h3>
                  <div style={{ fontSize: 14, opacity: 0.85 }}>
  {missing.length === 0 && "✅ You can cook this now"}
  {missing.length > 0 && missing.length <= 2 && "🟡 Almost ready"}
  {missing.length > 2 && "🛒 Needs a few ingredients"}
  {meal.effort ? ` • ${meal.effort}` : ""}
</div>
                </div>

                <Button
                  onClick={() => {
                    const slug = meal.slug ?? meal.id;
                    if (slug) navigate(`/recipe/${slug}`);
                  }}
                >
                  Open
                </Button>
              </div>

              <div style={{ marginTop: 12, fontSize: 14 }}>
                <div style={{ marginBottom: 6 }}>
                  <strong>You have:</strong>{" "}
                  {matched.length ? matched.slice(0, 4).join(", ") : "Not much yet"}
                </div>
                <div>
                  <strong>Missing:</strong>{" "}
                  {missing.length ? missing.slice(0, 4).join(", ") : "Nothing — you can make this now"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}