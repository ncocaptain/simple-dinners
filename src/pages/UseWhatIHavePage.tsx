import {
  useMemo,
  type CSSProperties,
} from "react";

import {
  ArrowLeft,
  Check,
  ChefHat,
  Refrigerator,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import Card from "../components/Card";
import SafeRecipeImage from "../components/SafeRecipeImage";

import {
  DINNER_RECIPES,
} from "../core/data";

import {
  getCookbook,
} from "../core/cookbookStore";

import {
  getLocalizedMeal,
} from "../core/localizedMeal";

import {
  filterMealsForPrefs,
} from "../core/planner";

import {
  rankRecipesByPantry,
} from "../core/pantryRecipeMatch";

import type {
  Meal,
  PantryItem,
  Preferences,
} from "../core/types";

import {
  addIngredientsToList,
} from "../shoppingList";

import {
  getStoredLanguage,
  t,
} from "../i18n";

type UseWhatIHavePageProps = {
  pantry: PantryItem[];
  prefs: Preferences;
};

function recipeKey(recipe: Meal) {
  return String(
    recipe.slug ||
      recipe.id ||
      recipe.name ||
      ""
  )
    .trim()
    .toLowerCase();
}

function mergeDinnerRecipes() {
  const seen =
    new Set<string>();

  return [
    ...DINNER_RECIPES,
    ...getCookbook(),
  ].filter((recipe) => {
    const key =
      recipeKey(recipe);

    if (
      !key ||
      seen.has(key)
    ) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export default function UseWhatIHavePage({
  pantry,
  prefs,
}: UseWhatIHavePageProps) {
  const navigate =
    useNavigate();

  const language =
    getStoredLanguage();

  const matches =
    useMemo(() => {
      const recipes =
        filterMealsForPrefs(
          mergeDinnerRecipes(),
          {
            vegetarian:
              Boolean(
                prefs.vegetarian
              ),
            allergens:
              prefs.allergens || [],
          }
        );

      return rankRecipesByPantry(
        recipes,
        pantry
      ).slice(0, 12);
    }, [
      pantry,
      prefs.vegetarian,
      prefs.allergens,
    ]);

  const pageStyle:
    CSSProperties = {
      width: "100%",
      padding:
        "0 20px 120px",
      boxSizing:
        "border-box",
    };

  const contentStyle:
    CSSProperties = {
      width: "100%",
      maxWidth: 650,
      margin: "0 auto",
      display: "grid",
      gap: 16,
    };

  const topButtonStyle:
    CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      width: "fit-content",
      border: "none",
      background:
        "transparent",
      color:
        "rgba(255,255,255,0.72)",
      padding: "4px 0",
      fontWeight: 800,
      cursor: "pointer",
    };

  const actionButton:
    CSSProperties = {
      minHeight: 42,
      borderRadius: 13,
      padding:
        "10px 13px",
      fontWeight: 900,
      cursor: "pointer",
      display:
        "inline-flex",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
    };

  const openRecipe = (
    recipe: Meal
  ) => {
    const slug =
      String(
        recipe.slug ||
          recipe.id ||
          ""
      ).trim();

    if (!slug) return;

    navigate(
      `/recipe/${encodeURIComponent(
        slug
      )}?from=%2Fuse-what-i-have`
    );
  };

  const addMissingToList = (
    recipe: Meal
  ) => {
    addIngredientsToList(
      recipe.name,
      recipe.ingredients
    );

    navigate(
      "/shopping-list"
    );
  };

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <button
          type="button"
          onClick={() =>
            navigate("/plan")
          }
          style={
            topButtonStyle
          }
        >
          <ArrowLeft
            size={17}
          />
          {t(
            "usePantry.backToPantry"
          )}
        </button>

        <Card>
          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius:
                    15,
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  background:
                    "rgba(34,197,94,0.12)",
                  border:
                    "1px solid rgba(34,197,94,0.22)",
                  color:
                    "#86efac",
                }}
              >
                <ChefHat
                  size={21}
                />
              </span>

              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 24,
                    lineHeight: 1.1,
                  }}
                >
                  {t(
                    "usePantry.title"
                  )}
                </h1>

                <div
                  style={{
                    marginTop: 5,
                    fontSize: 13,
                    opacity: 0.62,
                    lineHeight: 1.4,
                  }}
                >
                  {t(
                    "usePantry.subtitle"
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: 7,
                padding:
                  "10px 12px",
                borderRadius:
                  13,
                background:
                  "rgba(255,255,255,0.035)",
                border:
                  "1px solid rgba(255,255,255,0.07)",
                fontSize: 12,
                fontWeight: 800,
                color:
                  "rgba(255,255,255,0.7)",
              }}
            >
              <Refrigerator
                size={15}
              />
              {pantry.length}{" "}
              {pantry.length === 1
                ? t(
                    "usePantry.pantryItem"
                  )
                : t(
                    "usePantry.pantryItems"
                  )}
            </div>
          </div>
        </Card>

        {pantry.length === 0 ? (
          <Card>
            <div
              style={{
                padding:
                  "18px 4px",
                textAlign:
                  "center",
                display: "grid",
                gap: 10,
              }}
            >
              <Refrigerator
                size={34}
                style={{
                  margin:
                    "0 auto",
                  opacity: 0.5,
                }}
              />

              <div
                style={{
                  fontWeight: 900,
                  fontSize: 17,
                }}
              >
                {t(
                  "usePantry.noPantryTitle"
                )}
              </div>

              <div
                style={{
                  fontSize: 13,
                  opacity: 0.62,
                  lineHeight: 1.45,
                }}
              >
                {t(
                  "usePantry.noPantrySubtitle"
                )}
              </div>
            </div>
          </Card>
        ) : matches.length === 0 ? (
          <Card>
            <div
              style={{
                padding:
                  "18px 4px",
                textAlign:
                  "center",
                display: "grid",
                gap: 10,
              }}
            >
              <Sparkles
                size={34}
                style={{
                  margin:
                    "0 auto",
                  opacity: 0.5,
                }}
              />

              <div
                style={{
                  fontWeight: 900,
                  fontSize: 17,
                }}
              >
                {t(
                  "usePantry.noMatchesTitle"
                )}
              </div>

              <div
                style={{
                  fontSize: 13,
                  opacity: 0.62,
                  lineHeight: 1.45,
                }}
              >
                {t(
                  "usePantry.noMatchesSubtitle"
                )}
              </div>
            </div>
          </Card>
        ) : (
          matches.map(
            (match, index) => {
              const raw =
                match.recipe;

              const display =
                getLocalizedMeal(
                  raw,
                  language
                ) || raw;

              const percent =
                Math.round(
                  match.coverage *
                    100
                );

              return (
                <Card
                  key={
                    recipeKey(raw)
                  }
                  style={{
                    padding: 0,
                    overflow:
                      "hidden",
                  }}
                >
                  <SafeRecipeImage
                    src={
                      display.photoUrl ||
                      raw.photoUrl
                    }
                    alt={
                      display.name
                    }
                    onClick={() =>
                      openRecipe(raw)
                    }
                    style={{
                      width: "100%",
                      height: 190,
                      objectFit:
                        "cover",
                      cursor:
                        "pointer",
                    }}
                    fallbackStyle={{
                      background:
                        "rgba(255,255,255,0.04)",
                    }}
                    iconSize={32}
                  />

                  <div
                    style={{
                      padding: 16,
                      display:
                        "grid",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "flex-start",
                        justifyContent:
                          "space-between",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        {index === 0 && (
                          <div
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: 5,
                              marginBottom:
                                6,
                              padding:
                                "4px 8px",
                              borderRadius:
                                999,
                              background:
                                "rgba(34,197,94,0.12)",
                              border:
                                "1px solid rgba(34,197,94,0.22)",
                              color:
                                "#86efac",
                              fontSize:
                                10,
                              fontWeight:
                                900,
                              textTransform:
                                "uppercase",
                              letterSpacing:
                                0.5,
                            }}
                          >
                            <Sparkles
                              size={11}
                            />
                            {t(
                              "usePantry.bestMatch"
                            )}
                          </div>
                        )}

                        <div
                          style={{
                            fontSize: 18,
                            fontWeight:
                              900,
                            lineHeight:
                              1.2,
                          }}
                        >
                          {
                            display.name
                          }
                        </div>
                      </div>

                      <div
                        style={{
                          flexShrink: 0,
                          minWidth: 54,
                          textAlign:
                            "center",
                          padding:
                            "7px 9px",
                          borderRadius:
                            12,
                          background:
                            "rgba(34,197,94,0.10)",
                          border:
                            "1px solid rgba(34,197,94,0.18)",
                          color:
                            "#86efac",
                          fontWeight:
                            900,
                          fontSize: 13,
                        }}
                      >
                        {percent}%
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          gap: 10,
                          marginBottom:
                            7,
                          fontSize: 12,
                        }}
                      >
                        <span
                          style={{
                            fontWeight:
                              900,
                          }}
                        >
                          {t(
                            "usePantry.youHave"
                          )}{" "}
                          {
                            match.matchedCount
                          }{" "}
                          {t(
                            "usePantry.of"
                          )}{" "}
                          {
                            match.totalCount
                          }{" "}
                          {t(
                            "usePantry.ingredients"
                          )}
                        </span>

                        <span
                          style={{
                            opacity:
                              0.58,
                          }}
                        >
                          {
                            match.missingCount
                          }{" "}
                          {t(
                            "usePantry.missing"
                          )}
                        </span>
                      </div>

                      <div
                        style={{
                          height: 8,
                          width:
                            "100%",
                          borderRadius:
                            999,
                          overflow:
                            "hidden",
                          background:
                            "rgba(255,255,255,0.08)",
                        }}
                      >
                        <div
                          style={{
                            width:
                              `${percent}%`,
                            height:
                              "100%",
                            borderRadius:
                              999,
                            background:
                              "#22c55e",
                          }}
                        />
                      </div>
                    </div>

                    {match
                      .matchedIngredients
                      .length > 0 && (
                      <div
                        style={{
                          display:
                            "flex",
                          flexWrap:
                            "wrap",
                          gap: 6,
                        }}
                      >
                        {match
                          .matchedIngredients
                          .slice(0, 5)
                          .map(
                            (
                              ingredient
                            ) => (
                              <span
                                key={
                                  ingredient
                                }
                                style={{
                                  display:
                                    "inline-flex",
                                  alignItems:
                                    "center",
                                  gap: 4,
                                  padding:
                                    "5px 8px",
                                  borderRadius:
                                    999,
                                  background:
                                    "rgba(34,197,94,0.08)",
                                  color:
                                    "#bbf7d0",
                                  fontSize:
                                    11,
                                  fontWeight:
                                    800,
                                }}
                              >
                                <Check
                                  size={11}
                                />
                                {
                                  ingredient
                                }
                              </span>
                            )
                          )}
                      </div>
                    )}

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          match.missingCount >
                          0
                            ? "1fr 1fr"
                            : "1fr",
                        gap: 8,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          openRecipe(raw)
                        }
                        style={{
                          ...actionButton,
                          border:
                            "1px solid rgba(255,255,255,0.11)",
                          background:
                            "rgba(255,255,255,0.06)",
                          color:
                            "white",
                        }}
                      >
                        <ChefHat
                          size={16}
                        />
                        {t(
                          "usePantry.openRecipe"
                        )}
                      </button>

                      {match.missingCount >
                        0 && (
                        <button
                          type="button"
                          onClick={() =>
                            addMissingToList(
                              raw
                            )
                          }
                          style={{
                            ...actionButton,
                            border:
                              "1px solid rgba(34,197,94,0.28)",
                            background:
                              "rgba(34,197,94,0.14)",
                            color:
                              "#86efac",
                          }}
                        >
                          <ShoppingCart
                            size={16}
                          />
                          {t(
                            "usePantry.addMissing"
                          )}
                        </button>
                      )}
                    </div>

                    {match.missingCount ===
                      0 && (
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          gap: 6,
                          fontSize: 12,
                          fontWeight:
                            900,
                          color:
                            "#86efac",
                        }}
                      >
                        <Check
                          size={14}
                        />
                        {t(
                          "usePantry.haveEverything"
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            }
          )
        )}
      </div>
    </div>
  );
}
