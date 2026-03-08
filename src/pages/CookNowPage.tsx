import React from "react";
import { useNavigate } from "react-router-dom";
import { candidateLibrary } from "../core/planner";
import { rankCookNowMeals } from "../core/cookNow";
import { getCookbook } from "../core/cookbookStore";
import type { PantryItem } from "../core/types";
import Button from "../components/Button";

export default function CookNowPage({ pantry }: { pantry: PantryItem[] }) {
  const navigate = useNavigate();
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

  const best = ranked[0];
  const top = ranked.slice(1, 6);

  const surpriseMeal = React.useMemo(() => {
    if (!best && top.length === 0) return null;
    const bestPool = [best, ...top].filter(Boolean).slice(0, 3);
    return bestPool[Math.floor(Math.random() * bestPool.length)]?.meal ?? null;
  }, [best, top]);

  const [rouletteMeal, setRouletteMeal] = React.useState<(typeof ranked)[number] | null>(null);
  const [spinning, setSpinning] = React.useState(false);

  function openCookMode(slug?: string) {
    if (slug) navigate(`/recipe/${slug}?cook=true`);
  }

  function spinRoulette() {
    if (spinning || ranked.length === 0) return;

    setSpinning(true);
    let cycles = 0;

    const interval = window.setInterval(() => {
      const randomMeal = ranked[Math.floor(Math.random() * ranked.length)];
      setRouletteMeal(randomMeal);
      cycles++;

      if (cycles > 12) {
        window.clearInterval(interval);
        setSpinning(false);

        const slug = randomMeal.meal.slug ?? randomMeal.meal.id;
        openCookMode(slug);
      }
    }, 120);
  }

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            width: "100%",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ marginBottom: 6 }}>🍳 Cook Now</h1>
            <p style={{ opacity: 0.8, margin: 0 }}>
              Dinner ideas based on what you already have in your kitchen.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button
              disabled={!surpriseMeal}
              onClick={() => {
                const slug = surpriseMeal?.slug ?? surpriseMeal?.id;
                openCookMode(slug);
              }}
            >
              ⚡ Surprise Me
            </Button>

            <Button onClick={spinRoulette}>
              🎰 Dinner Roulette
            </Button>
          </div>
        </div>
      </div>

      {spinning && rouletteMeal && (
        <div
          className="card"
          style={{
            textAlign: "center",
            fontSize: 24,
            fontWeight: 900,
            padding: 18,
            marginBottom: 16,
            borderRadius: 18,
          }}
        >
          🎰 {rouletteMeal.meal.name}
        </div>
      )}

      {!best ? (
        <div className="card">
          <p>No meals found yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          <div
            className="card"
            style={{
              padding: 18,
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.12)",
              background:
                "linear-gradient(145deg, rgba(20,184,166,0.12), rgba(15,23,42,0.4))",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                opacity: 0.75,
                marginBottom: 8,
              }}
            >
              🍽 TONIGHT’S BEST MATCH
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 220 }}>
                <h2 style={{ margin: "0 0 8px" }}>{best.meal.name}</h2>

                <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 10 }}>
                  {best.missing.length === 0 && "✅ You can cook this now"}
                  {best.missing.length > 0 &&
                    best.missing.length <= 2 &&
                    "🟡 Almost ready"}
                  {best.missing.length > 2 && "🛒 Needs a few ingredients"}
                  {best.meal.effort ? ` • ${best.meal.effort}` : ""}
                </div>

                <div style={{ fontSize: 14, marginBottom: 6 }}>
                  <strong>You have:</strong>{" "}
                  {best.matched.length
                    ? best.matched.slice(0, 5).join(", ")
                    : "Not much yet"}
                </div>

                <div style={{ fontSize: 14 }}>
                  <strong>Missing:</strong>{" "}
                  {best.missing.length
                    ? best.missing.slice(0, 5).join(", ")
                    : "Nothing — you can make this now"}
                </div>
              </div>

              <Button
                onClick={() => {
                  const slug = best.meal.slug ?? best.meal.id;
                  openCookMode(slug);
                }}
              >
                🍳 Start Cooking
              </Button>
            </div>
          </div>

          {top.length > 0 && (
            <div style={{ display: "grid", gap: 12 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  opacity: 0.72,
                  letterSpacing: 0.5,
                }}
              >
                MORE IDEAS
              </div>

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
                        {missing.length > 0 &&
                          missing.length <= 2 &&
                          "🟡 Almost ready"}
                        {missing.length > 2 && "🛒 Needs a few ingredients"}
                        {meal.effort ? ` • ${meal.effort}` : ""}
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        const slug = meal.slug ?? meal.id;
                        openCookMode(slug);
                      }}
                    >
                      🍳 Start Cooking
                    </Button>
                  </div>

                  <div style={{ marginTop: 12, fontSize: 14 }}>
                    <div style={{ marginBottom: 6 }}>
                      <strong>You have:</strong>{" "}
                      {matched.length
                        ? matched.slice(0, 4).join(", ")
                        : "Not much yet"}
                    </div>
                    <div>
                      <strong>Missing:</strong>{" "}
                      {missing.length
                        ? missing.slice(0, 4).join(", ")
                        : "Nothing — you can make this now"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}