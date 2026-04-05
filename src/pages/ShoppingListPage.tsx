import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
} from "lucide-react";
import Card from "../components/Card";
import {
  loadShoppingList,
  saveShoppingList,
  type ShoppingItem,
} from "../shoppingList";
import {
  categorizeGroceryItem,
  type GroceryCategory,
  GROCERY_CATEGORY_ORDER,
} from "../core/groceryCategories";

type ParsedAmount = {
  quantity: number | null;
  unit: string | null;
  name: string;
};

type CombinedItem = {
  id: string;
  checked: boolean;
  category: GroceryCategory;
  sourceIds: string[];
  count: number;
  recipeCount: number;
  recipeCountLabel: string;
  displayText: string;
};

const COUNTABLE_BASE_WORDS = new Set([
  "Egg",
  "Onion",
  "potato",
  "tomato",
  "avocado",
  "banana",
  "apple",
  "orange",
  "lemon",
  "lime",
  "tortilla",
  "bun",
  "roll",
  "bagel",
  "pickle",
  "Pepper",
  "carrot",
  "cucumber",
  "zucchini",
  "jalapeno",
  "clove",
]);

const COUNTABLE_PHRASES: Record<string, string> = {
  Eggs: "Egg",
  Onions: "Onion",
  Potatoes: "potato",
  tomatoes: "tomato",
  avocados: "avocado",
  bananas: "banana",
  apples: "apple",
  oranges: "orange",
  lemons: "lemon",
  limes: "lime",
  tortillas: "tortilla",
  buns: "bun",
  rolls: "roll",
  bagels: "bagel",
  pickles: "pickle",
  Peppers: "Pepper",
  carrots: "carrot",
  cucumbers: "cucumber",
  zucchinis: "zucchini",
  jalapenos: "jalapeno",
  cloves: "clove",
  "chicken breasts": "chicken breast",
  "chicken thighs": "chicken thigh",
  drumsticks: "drumstick",
  porkchops: "porkchop",
  "pork chops": "pork chop",
};

const ALWAYS_SHOW_MEASURED_TOTALS = new Set([
  "Ground beef",
  "beef",
  "chicken",
  "chicken breast",
  "chicken thigh",
  "pork",
  "pork chop",
  "sausage",
  "bacon",
  "turkey",
  "Shrimp",
  "salmon",
  "fish",
  "cheddar cheese",
  "mozzarella cheese",
  "parmesan cheese",
  "rice",
  "pasta",
]);

const HIDE_MEASURED_TOTALS = new Set([
  "Salt",
  "Pepper",
  "Pepper",
  "Garlic Powder",
  "Onion powder",
  "Paprika",
  "italian seasoning",
  "cumin",
  "chili powder",
  "oregano",
  "baby bella mushrooms",
]);

function parseFraction(value: string): number | null {
  const trimmed = value.trim();

  if (/^\d+\s+\d+\/\d+$/.test(trimmed)) {
    const [whole, frac] = trimmed.split(" ");
    const [num, den] = frac.split("/").map(Number);
    if (!den) return null;
    return Number(whole) + num / den;
  }

  if (/^\d+\/\d+$/.test(trimmed)) {
    const [num, den] = trimmed.split("/").map(Number);
    if (!den) return null;
    return num / den;
  }

  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function formatQuantity(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2).replace(/\.?0+$/, "");
}

function normalizeUnit(unit: string | null): string | null {
  if (!unit) return null;

  const u = unit.toLowerCase().replace(/\./g, "").trim();

  if (["lb", "lbs", "pound", "pounds"].includes(u)) return "lb";
  if (["oz", "ounce", "ounces"].includes(u)) return "oz";
  if (["cup", "cups"].includes(u)) return "cup";
  if (["Tbsp", "tablespoon", "tablespoons"].includes(u)) return "Tbsp";
  if (["tsp", "teaspoon", "teaspoons"].includes(u)) return "tsp";
  if (["can", "cans"].includes(u)) return "can";
  if (["package", "packages", "pkg", "pkgs"].includes(u)) return "package";
  if (["clove", "cloves"].includes(u)) return "clove";

  return u;
}

function pluralizeUnit(unit: string, quantity: number): string {
  if (quantity === 1) {
    if (unit === "lb") return "lb";
    if (unit === "oz") return "oz";
    if (unit === "cup") return "cup";
    if (unit === "Tbsp") return "Tbsp";
    if (unit === "tsp") return "tsp";
    if (unit === "can") return "can";
    if (unit === "package") return "package";
    if (unit === "clove") return "clove";
    return unit;
  }

  if (unit === "lb") return "lbs";
  if (unit === "oz") return "oz";
  if (unit === "cup") return "cups";
  if (unit === "Tbsp") return "Tbsp";
  if (unit === "tsp") return "tsp";
  if (unit === "can") return "cans";
  if (unit === "package") return "packages";
  if (unit === "clove") return "cloves";
  return `${unit}s`;
}

function singularizeWord(word: string): string {
  const lower = word.trim().toLowerCase();

  const irregular: Record<string, string> = {
    Eggs: "Egg",
    Onions: "Onion",
    Potatoes: "potato",
    tomatoes: "tomato",
    avocados: "avocado",
    bananas: "banana",
    apples: "apple",
    oranges: "orange",
    lemons: "lemon",
    limes: "lime",
    tortillas: "tortilla",
    buns: "bun",
    rolls: "roll",
    bagels: "bagel",
    pickles: "pickle",
    Peppers: "Pepper",
    carrots: "carrot",
    cucumbers: "cucumber",
    zucchinis: "zucchini",
    jalapenos: "jalapeno",
    cloves: "clove",
  };

  if (irregular[lower]) return irregular[lower];
  if (lower.endsWith("ies")) return `${lower.slice(0, -3)}y`;
  if (lower.endsWith("oes")) return lower.slice(0, -2);
  if (lower.endsWith("es")) return lower.slice(0, -2);
  if (lower.endsWith("s") && !lower.endsWith("ss")) return lower.slice(0, -1);
  return lower;
}

function pluralizeCountable(name: string, quantity: number): string {
  if (quantity === 1) return name;

  const irregular: Record<string, string> = {
    Egg: "Eggs",
    Onion: "Onions",
    potato: "Potatoes",
    tomato: "tomatoes",
    avocado: "avocados",
    banana: "bananas",
    apple: "apples",
    orange: "oranges",
    lemon: "lemons",
    lime: "limes",
    tortilla: "tortillas",
    bun: "buns",
    roll: "rolls",
    bagel: "bagels",
    pickle: "pickles",
    Pepper: "Peppers",
    carrot: "carrots",
    cucumber: "cucumbers",
    zucchini: "zucchinis",
    jalapeno: "jalapenos",
    clove: "cloves",
    "chicken breast": "chicken breasts",
    "chicken thigh": "chicken thighs",
    drumstick: "drumsticks",
    porkchop: "porkchops",
    "pork chop": "pork chops",
  };

  return irregular[name] || `${name}s`;
}

function cleanIngredientName(line: string) {
  let text = line.toLowerCase().trim();

  text = text.replace(/^[/\\\-–—]+\s*/, "");
  text = text.replace(/\([^)]*\)/g, " ");

  text = text.replace(/\bcremini mushrooms?\b/g, "baby bella mushrooms");
  text = text.replace(/\bbaby bella mushrooms?\b/g, "baby bella mushrooms");

  text = text.replace(/\bOnion powders?\b/g, "Onion powder");
  text = text.replace(/\bGarlic Powders?\b/g, "Garlic Powder");

  text = text.replace(/\bOnions?\b/g, "Onion");
  text = text.replace(/\bcarrots?\b/g, "carrot");
  text = text.replace(/\bEggs?\b/g, "Egg");

  text = text.replace(
    /^\d*\.?\d+\s+(carrot|Onion|Egg|Onion powder|Garlic Powder)\b/g,
    "$1"
  );

  const removePhrases = [
    "to taste",
    "as needed",
    "optional",
    "for garnish",
    "plus more for garnish",
    "divided",
    "stems removed",
    "seeds removed",
    "for topping",
    "for serving",
  ];

  removePhrases.forEach((phrase) => {
    text = text.replaceAll(phrase, " ");
  });

  const removeWords = [
    "small",
    "medium",
    "large",
    "extra-large",
    "fresh",
    "freshly",
    "thin",
    "thinly",
    "thick",
    "thickly",
    "finely",
    "roughly",
    "chopped",
    "diced",
    "minced",
    "sliced",
    "halved",
    "cubed",
    "shredded",
    "grated",
    "peeled",
    "crushed",
    "softened",
    "melted",
    "beaten",
    "drained",
    "rinsed",
    "packed",
    "whole",
    "boneless",
    "skinless",
  ];

  removeWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    text = text.replace(regex, " ");
  });

  text = text.split(",")[0];
  text = text.replace(/^[-•*]\s*/, "");
  text = text.replace(/\s+/g, " ").trim();

  if (text === "Salt and Pepper") return "Salt / Pepper";

  return text;
}

function parseIngredient(line: string): ParsedAmount {
  const raw = line.trim();

  const measuredMatch = raw.match(
    /^\s*(\d+\s\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s+(lb|lbs|pound|pounds|oz|ounce|ounces|cup|cups|Tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|can|cans|package|packages|pkg|pkgs|clove|cloves)\s+(.*)$/i
  );

  if (measuredMatch) {
    const [, qtyRaw, unitRaw, rest] = measuredMatch;

    return {
      quantity: parseFraction(qtyRaw),
      unit: normalizeUnit(unitRaw),
      name: cleanIngredientName(rest),
    };
  }

  const countedMatch = raw.match(
    /^\s*(\d+\s\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s+(.+)$/i
  );

  if (countedMatch) {
    const [, qtyRaw, rest] = countedMatch;

    return {
      quantity: parseFraction(qtyRaw),
      unit: "__count__",
      name: cleanIngredientName(rest),
    };
  }

  return {
    quantity: null,
    unit: null,
    name: cleanIngredientName(raw),
  };
}

function normalizeCountableName(name: string): string {
  const cleaned = cleanIngredientName(name);

  if (COUNTABLE_PHRASES[cleaned]) return COUNTABLE_PHRASES[cleaned];

  const words = cleaned.split(" ").filter(Boolean);
  if (!words.length) return cleaned;

  if (words.length === 1) {
    const singular = singularizeWord(words[0]);
    if (COUNTABLE_BASE_WORDS.has(singular)) return singular;
  }

  return cleaned;
}

function isCountableIngredient(name: string): boolean {
  const normalized = normalizeCountableName(name);
  if (normalized !== cleanIngredientName(name)) return true;

  const words = normalized.split(" ").filter(Boolean);
  if (!words.length) return false;

  const firstWord = singularizeWord(words[0]);
  return COUNTABLE_BASE_WORDS.has(firstWord);
}

function shouldShowMeasuredTotal(
  name: string,
  unit: string | null,
  total: number
) {
  const cleaned = cleanIngredientName(name);

  if (!unit) return false;
  if (HIDE_MEASURED_TOTALS.has(cleaned)) return false;
  if (ALWAYS_SHOW_MEASURED_TOTALS.has(cleaned)) return true;

  if (unit === "lb" || unit === "oz" || unit === "can" || unit === "package") {
    return true;
  }

  if ((unit === "cup" || unit === "Tbsp" || unit === "tsp") && total >= 2) {
    return true;
  }

  return false;
}

function makeManualId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ShoppingListPage() {
  const [newItem, setNewItem] = useState("");
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() =>
    loadShoppingList()
  );
  const [hideChecked, setHideChecked] = useState(false);
  const [touchStartX, setTouchStartX] = useState<Record<string, number>>({});

  useEffect(() => {
    const refresh = () => {
      setShoppingItems(loadShoppingList());
    };

    refresh();

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const persistShoppingItems = (updated: ShoppingItem[]) => {
    setShoppingItems(updated);
    saveShoppingList(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();

    const raw = newItem.trim();
    if (!raw) return;

    const cleanedRaw = cleanIngredientName(raw);
    const parsed = parseIngredient(cleanedRaw);
    const cleanedName = parsed.name || cleanedRaw;
    const id = makeManualId(cleanedName || raw);

    const alreadyExists = shoppingItems.some(
      (item) => item.text.trim().toLowerCase() === cleanedName.toLowerCase()
    );

    if (alreadyExists) {
      setNewItem("");
      return;
    }

    const added: ShoppingItem = {
      id,
      text: cleanedName,
      checked: false,
      addedAt: Date.now(),
      category: categorizeGroceryItem(cleanedName),
      sourceRecipe: "",
    };

    persistShoppingItems([...shoppingItems, added]);
    setNewItem("");
  };

  const toggleItemGroup = (group: CombinedItem) => {
    const shouldCheck = !group.checked;

    const updated = shoppingItems.map((item) =>
      group.sourceIds.includes(item.id) ? { ...item, checked: shouldCheck } : item
    );

    persistShoppingItems(updated);
  };

  const deleteItemGroup = (group: CombinedItem) => {
    const updated = shoppingItems.filter(
      (item) => !group.sourceIds.includes(item.id)
    );
    persistShoppingItems(updated);
  };

  const clearCheckedItems = () => {
    persistShoppingItems(shoppingItems.filter((item) => !item.checked));
  };

  const clearAllItems = () => {
    const confirmed = window.confirm("Clear your entire shopping list?");
    if (!confirmed) return;
    persistShoppingItems([]);
  };

  const checkedCount = shoppingItems.filter((item) => item.checked).length;

  const combinedItems = useMemo(() => {
    const map = new Map<
      string,
      {
        checked: boolean;
        category: GroceryCategory;
        sourceIds: string[];
        count: number;
        name: string;
        isCountable: boolean;
        totalQuantity: number;
        unit: string | null;
        mixedUnits: boolean;
        recipeNames: Set<string>;
      }
    >();

    for (const item of shoppingItems) {
      const cleanedRaw = cleanIngredientName(item.text);
      const parsed = parseIngredient(cleanedRaw);
      const cleanedName = parsed.name || cleanedRaw;

      const isCountable = isCountableIngredient(cleanedName);
      const normalizedName = isCountable
        ? normalizeCountableName(cleanedName)
        : cleanedName;

      const category = item.category || categorizeGroceryItem(normalizedName);
      const mergeUnit = isCountable ? "__count__" : parsed.unit;
      const key = `${category}::${normalizedName}`;

      const quantityToAdd =
        parsed.quantity !== null ? parsed.quantity : isCountable ? 1 : 0;

      const recipeName = String((item as any).sourceRecipe || "").trim();

      const existing = map.get(key);

      if (existing) {
        existing.sourceIds.push(item.id);
        existing.count += 1;
        existing.checked = existing.checked && item.checked;

        if (quantityToAdd > 0) {
          existing.totalQuantity += quantityToAdd;
        }

        if (existing.unit !== mergeUnit) {
          if (existing.unit !== null || mergeUnit !== null) {
            existing.mixedUnits = true;
          }
        }

        if (recipeName) {
          existing.recipeNames.add(recipeName);
        }
      } else {
        map.set(key, {
          checked: item.checked,
          category,
          sourceIds: [item.id],
          count: 1,
          name: normalizedName,
          isCountable,
          totalQuantity: quantityToAdd,
          unit: mergeUnit ?? null,
          mixedUnits: false,
          recipeNames: recipeName ? new Set([recipeName]) : new Set(),
        });
      }
    }

    return Array.from(map.entries()).map(([key, value]) => {
      let displayText = value.name;

      if (value.isCountable) {
        const qty = value.totalQuantity > 0 ? value.totalQuantity : value.count;
        displayText = `${formatQuantity(qty)} ${pluralizeCountable(
          value.name,
          qty
        )}`;
      } else if (
        !value.mixedUnits &&
        value.unit &&
        value.totalQuantity > 0 &&
        shouldShowMeasuredTotal(value.name, value.unit, value.totalQuantity)
      ) {
        displayText = `${formatQuantity(value.totalQuantity)} ${pluralizeUnit(
          value.unit,
          value.totalQuantity
        )} ${value.name}`;
      } else {
        displayText = value.name;
      }

      const recipeCount = value.recipeNames.size;

      return {
        id: key,
        checked: value.checked,
        category: value.category,
        sourceIds: value.sourceIds,
        count: value.count,
        recipeCount,
        recipeCountLabel: recipeCount > 1 ? `(${recipeCount} recipes)` : "",
        displayText,
      } satisfies CombinedItem;
    });
  }, [shoppingItems]);

  const grouped = useMemo(() => {
    const visibleItems = hideChecked
      ? combinedItems.filter((item) => !item.checked)
      : combinedItems;

    return GROCERY_CATEGORY_ORDER.map((section) => ({
      section,
      items: visibleItems.filter((item) => item.category === section),
    })).filter((group) => group.items.length > 0);
  }, [combinedItems, hideChecked]);

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
          <h2 style={{ fontSize: 28, fontWeight: 1000, margin: 0 }}>
            Shopping List
          </h2>
        </header>

        <Card style={{ marginBottom: 8 }}>
          <form onSubmit={handleAddItem} style={{ display: "flex", gap: 10 }}>
            <input
              placeholder="Add Milk, Bread, snacks..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              style={{
                flex: 1,
                padding: "14px 16px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "white",
                outline: "none",
                fontSize: 14,
              }}
            />

            <button
              type="submit"
              style={{
                width: 50,
                borderRadius: "14px",
                background: "#22c55e",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={20} />
            </button>
          </form>
        </Card>

        <div
          style={{
            marginTop: 8,
            marginBottom: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setHideChecked((prev) => !prev)}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
              fontSize: 11,
              fontWeight: 800,
              padding: "6px 12px",
              borderRadius: "999px",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              letterSpacing: 0.3,
            }}
          >
            {hideChecked ? <Eye size={14} /> : <EyeOff size={14} />}
            {hideChecked ? "SHOW CHECKED" : "HIDE CHECKED"}
          </button>

          {shoppingItems.length > 0 && (
            <button
              onClick={clearAllItems}
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#ef4444",
                fontSize: 11,
                fontWeight: 800,
                padding: "6px 12px",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                letterSpacing: 0.3,
              }}
            >
              CLEAR ALL
            </button>
          )}

          {checkedCount > 0 && (
            <button
              onClick={clearCheckedItems}
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#ef4444",
                fontSize: 11,
                fontWeight: 800,
                padding: "6px 12px",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                letterSpacing: 0.3,
              }}
            >
              CLEAR CHECKED ({checkedCount})
            </button>
          )}
        </div>

        {grouped.map((group) => (
          <div key={group.section} style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.1)",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: 1.5,
                  opacity: 0.5,
                }}
              >
                {group.section.toUpperCase()}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.1)",
                }}
              />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {group.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleItemGroup(item)}
                  onTouchStart={(e) =>
                    setTouchStartX((prev) => ({
                      ...prev,
                      [item.id]: e.targetTouches[0].clientX,
                    }))
                  }
                  onTouchEnd={(e) => {
                    const start = touchStartX[item.id];
                    if (start == null) return;

                    const end = e.changedTouches[0].clientX;
                    const delta = start - end;

                    if (delta > 70) {
                      deleteItemGroup(item);
                    }

                    setTouchStartX((prev) => {
                      const next = { ...prev };
                      delete next[item.id];
                      return next;
                    });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: "14px",
                    background: item.checked
                      ? "transparent"
                      : "rgba(255,255,255,0.05)",
                    border: item.checked
                      ? "1px solid rgba(255,255,255,0.05)"
                      : "1px solid rgba(255,255,255,0.1)",
                    opacity: item.checked ? 0.3 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    {item.checked ? (
                      <CheckCircle2 size={18} color="#22c55e" />
                    ) : (
                      <Circle size={18} style={{ opacity: 0.2, flexShrink: 0 }} />
                    )}

                    <span
                      style={{
                        fontWeight: 600,
                        textDecoration: item.checked ? "line-through" : "none",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.displayText}
                      {item.recipeCountLabel ? (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 12,
                            opacity: 0.6,
                            fontWeight: 800,
                          }}
                        >
                          {item.recipeCountLabel}
                        </span>
                      ) : null}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItemGroup(item);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      opacity: 0.55,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      flexShrink: 0,
                    }}
                    aria-label={`Delete ${item.displayText}`}
                    title="Delete item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {grouped.length === 0 && (
          <div style={{ textAlign: "center", padding: 80, opacity: 0.2 }}>
            <ShoppingCart size={48} style={{ marginBottom: 16 }} />
            <div style={{ fontWeight: 800 }}>
              {hideChecked ? "No unchecked items" : "List is empty"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}