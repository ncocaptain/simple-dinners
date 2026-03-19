import { useState, useEffect } from "react";
import { CheckCircle2, Plus, X, Link as LinkIcon, BookOpen, ShoppingCart } from "lucide-react";
import { formatIngredients } from "../core/utils";
import Card from "../components/Card";

function slugify(text: string) {
  return (text || "recipe")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function splitLines(text?: string) {
  return (text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function CookbookPage({
  cookbook,
  setCookbook,
  extraIngredients,
  setExtraIngredients,
  pantry,
}: any) {
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [selectedForShop, setSelectedForShop] = useState<string[]>([]);
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualRecipe, setManualRecipe] = useState({
    name: "",
    ingredients: "",
    instructions: "",
  });

  useEffect(() => {
    if (!selectedRecipe) return;

    const ingredients = splitLines(selectedRecipe.ingredients);

    const missing = ingredients.filter(
      (ing: string) =>
        !pantry?.some((p: any) =>
          ing.toLowerCase().includes((p.name || "").toLowerCase())
        )
    );

    setSelectedForShop(missing);
  }, [selectedRecipe, pantry]);

  const toggleForShop = (ing: string) => {
    setSelectedForShop((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const handleAddToShop = () => {
    const currentList = new Set(
      (extraIngredients || []).map((item: string) => item.trim())
    );

    selectedForShop.forEach((item) => currentList.add(item.trim()));

    setExtraIngredients(Array.from(currentList));
    setSelectedForShop([]);
    setSelectedRecipe(null);

    alert(`${selectedForShop.length} items added to your Shopping List!`);
  };

  const handleImport = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();

    if (!importUrl.trim()) {
      alert("Please paste a recipe URL.");
      return;
    }

    setIsImporting(true);

    try {
      const response = await fetch("/api/import-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl.trim() }),
      });

      const data = await response.json();

      if (data?.recipe) {
        setCookbook([
          ...cookbook,
          {
            ...data.recipe,
            slug:
              data.recipe.slug ||
              `${slugify(data.recipe.name || "recipe")}-${Date.now()
                .toString()
                .slice(-4)}`,
          },
        ]);

        setImportUrl("");
        setShowManual(false);
        alert("Recipe imported!");
      } else {
        alert(data?.error || "Failed to import.");
      }
    } catch (err) {
      alert("Connection error. Ensure api/import-recipe.js is deployed.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleManualSave = (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();

    if (!manualRecipe.name.trim()) {
      alert("Please enter a name.");
      return;
    }

    const recipeToSave = {
      ...manualRecipe,
      name: manualRecipe.name.trim(),
      ingredients: manualRecipe.ingredients.trim(),
      instructions: manualRecipe.instructions.trim(),
      effort: "normal",
      photoUrl: "",
      slug: `${slugify(manualRecipe.name)}-${Date.now().toString().slice(-4)}`,
    };

    setCookbook([...cookbook, recipeToSave]);
    setManualRecipe({ name: "", ingredients: "", instructions: "" });
    setShowManual(false);
    alert("Recipe saved to Cookbook!");
  };

  const btn: React.CSSProperties = {
    border: "none",
    borderRadius: 14,
    color: "white",
    cursor: "pointer",
    fontWeight: 800,
  };

  const sectionCard: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 22,
    padding: 22,
    backdropFilter: "blur(10px)",
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 20px 120px 20px",
      }}
    >
      <div style={{ maxWidth: "600px", width: "100%" }}>
        <header style={{ textAlign: "center", margin: "20px 0 24px" }}>
          <h2 style={{ fontSize: 34, fontWeight: 1000, margin: 0 }}>Cookbook</h2>
        </header>

        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <Card style={{ flex: 1, padding: 0 }}>
            <form
              onSubmit={handleImport}
              style={{ display: "flex", alignItems: "center", position: "relative" }}
            >
              <LinkIcon
                size={18}
                style={{ position: "absolute", left: 12, opacity: 0.4 }}
              />
              <input
                placeholder="Paste recipe URL..."
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  color: "white",
                  padding: "14px 14px 14px 40px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={isImporting}
                style={{
                  ...btn,
                  background: "#22c55e",
                  padding: "0 16px",
                  cursor: isImporting ? "default" : "pointer",
                  borderRadius: 0,
                  height: 48,
                }}
              >
                {isImporting ? "..." : "IMPORT"}
              </button>
            </form>
          </Card>

          <button
            onClick={() => setShowManual(!showManual)}
            style={{
              ...btn,
              background: showManual ? "#ef4444" : "rgba(255,255,255,0.08)",
              width: 52,
              borderRadius: 14,
            }}
          >
            {showManual ? <X /> : <Plus />}
          </button>
        </div>

        {showManual && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.88)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "470px",
                background: "#1e293b",
                borderRadius: "24px",
                padding: "30px",
                position: "relative",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
              }}
            >
              <button
                onClick={() => setShowManual(false)}
                style={{
                  position: "absolute",
                  right: 20,
                  top: 20,
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <X size={24} />
              </button>

              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 25 }}>
                New Recipe
              </h2>

              <div
                style={{
                  background: "rgba(34, 197, 94, 0.05)",
                  border: "1px dashed rgba(34, 197, 94, 0.3)",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      background: "#22c55e",
                      color: "#000",
                      fontSize: 10,
                      fontWeight: 900,
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    BETA
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 800 }}>
                    Magic Import
                  </span>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    placeholder="Paste URL..."
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    style={{
                      flex: 1,
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "white",
                      padding: "12px",
                      borderRadius: "10px",
                    }}
                  />
                  <button
                    onClick={handleImport}
                    disabled={isImporting}
                    style={{
                      ...btn,
                      background: "#22c55e",
                      padding: "0 15px",
                      borderRadius: "10px",
                      color: "white",
                      cursor: isImporting ? "default" : "pointer",
                    }}
                  >
                    {isImporting ? "..." : "Magic"}
                  </button>
                </div>

                <p style={{ fontSize: 11, opacity: 0.55, marginTop: 10 }}>
                  Some sites import better than others. If it misses details, use manual entry.
                </p>
              </div>

              <form onSubmit={handleManualSave} style={{ display: "grid", gap: 12 }}>
                <input
                  placeholder="Recipe Name"
                  value={manualRecipe.name}
                  onChange={(e) =>
                    setManualRecipe({ ...manualRecipe, name: e.target.value })
                  }
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                  }}
                />

                <textarea
                  placeholder="Ingredients (one per line)"
                  value={manualRecipe.ingredients}
                  onChange={(e) =>
                    setManualRecipe({
                      ...manualRecipe,
                      ingredients: e.target.value,
                    })
                  }
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    minHeight: 100,
                  }}
                />

                <textarea
                  placeholder="Instructions (one step per line)"
                  value={manualRecipe.instructions}
                  onChange={(e) =>
                    setManualRecipe({
                      ...manualRecipe,
                      instructions: e.target.value,
                    })
                  }
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    minHeight: 120,
                  }}
                />

                <button
                  type="submit"
                  style={{
                    ...btn,
                    padding: 16,
                    background: "rgba(34, 197, 94, 0.12)",
                    color: "#22c55e",
                    border: "1px solid #22c55e",
                  }}
                >
                  Save to Cookbook
                </button>
              </form>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {cookbook.map((recipe: any, index: number) => (
            <div
              key={recipe.slug || `${recipe.name}-${index}`}
              onClick={() => setSelectedRecipe(recipe)}
              style={{ cursor: "pointer" }}
            >
              <Card style={{ padding: "18px 16px" }}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{recipe.name}</div>
              </Card>
            </div>
          ))}
        </div>

        {selectedRecipe && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(2,6,23,0.96), rgba(15,23,42,0.98))",
              zIndex: 2000,
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setSelectedRecipe(null)}
              style={{
                position: "fixed",
                right: 20,
                top: 20,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "white",
                padding: 10,
                borderRadius: "50%",
                cursor: "pointer",
                zIndex: 10,
              }}
            >
              <X />
            </button>

            <div
              style={{
                maxWidth: 900,
                margin: "0 auto",
                padding: "40px 20px 140px",
              }}
            >
              <div
                style={{
                  ...sectionCard,
                  padding: "28px 26px",
                  marginBottom: 20,
                  background:
                    "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(255,255,255,0.03))",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#22c55e",
                    marginBottom: 14,
                  }}
                >
                  <BookOpen size={14} />
                  Cookbook Recipe
                </div>

                <h2
                  style={{
                    fontSize: "clamp(28px, 4vw, 42px)",
                    fontWeight: 950,
                    lineHeight: 1.1,
                    margin: 0,
                    color: "#fff",
                  }}
                >
                  {selectedRecipe.name}
                </h2>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 18,
                  }}
                >
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.85)",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {splitLines(selectedRecipe.ingredients).length} ingredients
                  </div>
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.85)",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {selectedRecipe.instructions === "Steps available at source link!"
                      ? "Instructions not imported"
                      : `${splitLines(selectedRecipe.instructions).length} steps`}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: 20,
                }}
              >
                <div style={sectionCard}>
                  <div
                    style={{
                      color: "#22c55e",
                      fontSize: 14,
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: 16,
                    }}
                  >
                    Ingredients
                  </div>

                  <p style={{ fontSize: 13, opacity: 0.55, margin: "0 0 18px" }}>
                    Select items to add to your shopping list.
                  </p>

                  <div style={{ display: "grid", gap: 10 }}>
                    {splitLines(selectedRecipe.ingredients).length === 0 ? (
                      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>
                        No ingredients found for this recipe yet.
                      </div>
                    ) : (
                      splitLines(selectedRecipe.ingredients).map((ing: string, i: number) => {
                        const isSelected = selectedForShop.includes(ing);

                        return (
                          <div
                            key={`${ing}-${i}`}
                            onClick={() => toggleForShop(ing)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              padding: "16px",
                              borderRadius: "16px",
                              background: isSelected
                                ? "rgba(34, 197, 94, 0.15)"
                                : "rgba(255,255,255,0.03)",
                              border: isSelected
                                ? "1px solid #22c55e"
                                : "1px solid rgba(255,255,255,0.08)",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <div
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: "6px",
                                background: isSelected ? "#22c55e" : "transparent",
                                border: isSelected
                                  ? "none"
                                  : "2px solid rgba(255,255,255,0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {isSelected && <CheckCircle2 size={16} color="white" />}
                            </div>

                            <span
                              style={{
                                fontWeight: isSelected ? 700 : 500,
                                color: isSelected ? "#fff" : "rgba(255,255,255,0.85)",
                                lineHeight: 1.5,
                              }}
                            >
                              {formatIngredients(ing)}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div style={sectionCard}>
                  <div
                    style={{
                      color: "#22c55e",
                      fontSize: 14,
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: 16,
                    }}
                  >
                    Instructions
                  </div>

                  {!selectedRecipe.instructions ||
                  selectedRecipe.instructions === "Steps available at source link!" ? (
                    <div
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 16,
                        lineHeight: 1.7,
                      }}
                    >
                      Instructions were not imported for this recipe. You can still use the
                      source link or add them manually.
                    </div>
                  ) : splitLines(selectedRecipe.instructions).length === 0 ? (
                    <div
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: 16,
                        lineHeight: 1.6,
                      }}
                    >
                      No instructions found for this recipe yet.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 16 }}>
                      {splitLines(selectedRecipe.instructions).map(
                        (step: string, i: number) => (
                          <div
                            key={`${step}-${i}`}
                            style={{
                              display: "flex",
                              gap: 14,
                              alignItems: "flex-start",
                            }}
                          >
                            <div
                              style={{
                                minWidth: 30,
                                height: 30,
                                borderRadius: 10,
                                background: "rgba(34, 197, 94, 0.15)",
                                color: "#22c55e",
                                fontWeight: 900,
                                fontSize: 13,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginTop: 2,
                              }}
                            >
                              {i + 1}
                            </div>

                            <div
                              style={{
                                color: "rgba(255,255,255,0.9)",
                                lineHeight: 1.75,
                                fontSize: 16,
                              }}
                            >
                              {step}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedForShop.length > 0 && (
              <button
                onClick={handleAddToShop}
                style={{
                  position: "fixed",
                  bottom: 34,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#22c55e",
                  color: "white",
                  padding: "18px 34px",
                  borderRadius: "999px",
                  fontWeight: 900,
                  border: "none",
                  boxShadow: "0 16px 34px rgba(34, 197, 94, 0.35)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <ShoppingCart size={18} />
                ADD {selectedForShop.length} TO LIST
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}