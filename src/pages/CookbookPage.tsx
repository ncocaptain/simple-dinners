import { useState, useEffect } from "react";
import { CheckCircle2, Plus, X, Link as LinkIcon } from "lucide-react";
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
      <div style={{ maxWidth: "550px", width: "100%" }}>
        <header style={{ textAlign: "center", margin: "20px 0" }}>
          <h2 style={{ fontSize: 32, fontWeight: 1000 }}>Cookbook</h2>
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
                placeholder="Paste URL..."
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
                  background: "#22c55e",
                  color: "white",
                  border: "none",
                  padding: "0 15px",
                  fontWeight: 800,
                  cursor: isImporting ? "default" : "pointer",
                }}
              >
                {isImporting ? "..." : "IMPORT"}
              </button>
            </form>
          </Card>

          <button
            onClick={() => setShowManual(!showManual)}
            style={{
              background: showManual ? "#ef4444" : "rgba(255,255,255,0.1)",
              border: "none",
              color: "white",
              borderRadius: 12,
              width: 50,
              cursor: "pointer",
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
              backgroundColor: "rgba(0,0,0,0.9)",
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
                maxWidth: "450px",
                background: "#1e293b",
                borderRadius: "24px",
                padding: "30px",
                position: "relative",
                border: "1px solid rgba(255,255,255,0.1)",
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
                      background: "#22c55e",
                      color: "white",
                      padding: "0 15px",
                      borderRadius: "10px",
                      fontWeight: 900,
                      border: "none",
                      cursor: isImporting ? "default" : "pointer",
                    }}
                  >
                    {isImporting ? "..." : "Magic"}
                  </button>
                </div>

                <p style={{ fontSize: 11, opacity: 0.5, marginTop: 10 }}>
                  ⚠️ Some blogs block "Magic" scouts. If it fails, use manual entry!
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
                    padding: 16,
                    background: "rgba(34, 197, 94, 0.1)",
                    color: "#22c55e",
                    border: "1px solid #22c55e",
                    borderRadius: 12,
                    fontWeight: 900,
                    cursor: "pointer",
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
              <Card style={{ padding: "16px" }}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{recipe.name}</div>
              </Card>
            </div>
          ))}
        </div>

        {selectedRecipe && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "#0f172a",
              zIndex: 2000,
              padding: 20,
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setSelectedRecipe(null)}
              style={{
                position: "absolute",
                right: 20,
                top: 20,
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "white",
                padding: 10,
                borderRadius: "50%",
                cursor: "pointer",
              }}
            >
              <X />
            </button>

            <div
              style={{
                maxWidth: 700,
                margin: "0 auto",
                paddingTop: 40,
                paddingBottom: 120,
              }}
            >
              <h2
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  marginTop: 0,
                  color: "#fff",
                  marginBottom: 10,
                }}
              >
                {selectedRecipe.name}
              </h2>

              <p style={{ fontSize: 13, opacity: 0.5, marginBottom: 20 }}>
                SELECT ITEMS TO ADD TO LIST:
              </p>

              <div style={{ display: "grid", gap: 10, marginBottom: 30 }}>
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
                            color: isSelected ? "#fff" : "rgba(255,255,255,0.8)",
                          }}
                        >
                          {formatIngredients(ing)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  padding: 20,
                }}
              >
                <h3
                  style={{
                    color: "#22c55e",
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginTop: 0,
                    marginBottom: 16,
                  }}
                >
                  Instructions
                </h3>

                {splitLines(selectedRecipe.instructions).length === 0 ? (
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
                              minWidth: 28,
                              height: 28,
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
                              lineHeight: 1.7,
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

            {selectedForShop.length > 0 && (
              <button
                onClick={handleAddToShop}
                style={{
                  position: "fixed",
                  bottom: 40,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#22c55e",
                  color: "white",
                  padding: "18px 36px",
                  borderRadius: "40px",
                  fontWeight: 900,
                  border: "none",
                  boxShadow: "0 15px 30px rgba(34, 197, 94, 0.4)",
                  cursor: "pointer",
                }}
              >
                ADD {selectedForShop.length} TO LIST
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}