import React, { useEffect, useMemo, useState } from "react";
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
  recipeCountLabel: string;
  displayText: string;
};

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
  if (["tbsp", "tablespoon", "tablespoons"].includes(u)) return "tbsp";
  if (["tsp", "teaspoon", "teaspoons"].includes(u)) return "tsp";
  if (["can", "cans"].includes(u)) return "can";
  if (["package", "packages", "pkg", "pkgs"].includes(u)) return "package";
  if (["egg", "eggs"].includes(u)) return "egg";
  if (["clove", "cloves"].includes(u)) return "clove";

  return u;
}

function pluralizeUnit(unit: string, quantity: number): string {
  if (quantity === 1) {
    if (unit === "lb") return "lb";
    if (unit === "oz") return "oz";
    if (unit === "cup") return "cup";
    if (unit === "tbsp") return "tbsp";
    if (unit === "tsp") return "tsp";
    if (unit === "can") return "can";
    if (unit === "package") return "package";
    if (unit === "egg") return "egg";
    if (unit === "clove") return "clove";
    return unit;
  }

  if (unit === "lb") return "lbs";
  if (unit === "oz") return "oz";
  if (unit === "cup") return "cups";
  if (unit === "tbsp") return "tbsp";
  if (unit === "tsp") return "tsp";
  if (unit === "can") return "cans";
  if (unit === "package") return "packages";
  if (unit === "egg") return "eggs";
  if (unit === "clove") return "cloves";
  return `${unit}s`;
}

function cleanIngredientName(line: string) {
  let text = line.toLowerCase().trim();

  text = text.replace(/\([^)]*\)/g, " ");

  const removePhrases = [
    "to taste",
    "as needed",
    "optional",
    "for garnish",
    "plus more for garnish",
    "divided",
    "stems removed",
    "seeds removed",
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

  if (text === "salt and pepper") return "salt / pepper";

  return text;
}

function parseIngredient(line: string): ParsedAmount {
  const raw = line.trim();

  const match = raw.match(
    /^\s*(\d+\s\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(lb|lbs|pound|pounds|oz|ounce|ounces|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|can|cans|package|packages|pkg|pkgs|egg|eggs|clove|cloves)?\s+(.*)$/i
  );

  if (!match) {
    return {
      quantity: null,
      unit: null,
      name: cleanIngredientName(raw),
    };
  }

  const [, qtyRaw, unitRaw, rest] = match;

  return {
    quantity: parseFraction(qtyRaw),
    unit: normalizeUnit(unitRaw ?? null),
    name: cleanIngredientName(rest),
  };
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
  const [hideChecked, setHideChecked] = useState(false);
  const [touchStartX, setTouchStartX] = useState<Record<string, number>>({});

  const persistShoppingItems = (updated: ShoppingItem[]) => {
    setShoppingItems(updated);
    saveShoppingList(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();

    const raw = newItem.trim();
    if (!raw) return;

    const parsed = parseIngredient(raw);
    const cleanedName = parsed.name || raw;
    const id = makeManualId(cleanedName);

    const alreadyExists = shoppingItems.some((item) => item.id === id);
    if (alreadyExists) {
      setNewItem("");
      return;
    }

    const added: ShoppingItem = {
      id,
      text: raw,
      checked: false,
      addedAt: Date.now(),
      category: categorizeGroceryItem(cleanedName),
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

  const checkedCount = shoppingItems.filter((item) => item.checked).length;

  const combinedItems = useMemo(() => {
    const map = new Map<
      string,
      {
        checked: boolean;
        category: GroceryCategory;
        sourceIds: string[];
        count: number;
        quantities: number[];
        units: Set<string>;
        name: string;
      }
    >();

    for (const item of shoppingItems) {
      const parsed = parseIngredient(item.text);
      const name = parsed.name || cleanIngredientName(item.text);
      const category = item.category || categorizeGroceryItem(name);
      const key = `${category}::${name}`;

      const existing = map.get(key);

      if (existing) {
        existing.sourceIds.push(item.id);
        existing.count += 1;
        existing.checked = existing.checked && item.checked;
        if (parsed.quantity !== null) existing.quantities.push(parsed.quantity);
        if (parsed.unit) existing.units.add(parsed.unit);
      } else {
        map.set(key, {
          checked: item.checked,
          category,
          sourceIds: [item.id],
          count: 1,
          quantities: parsed.quantity !== null ? [parsed.quantity] : [],
          units: parsed.unit ? new Set([parsed.unit]) : new Set(),
          name,
        });
      }
    }

    return Array.from(map.entries()).map(([key, value]) => {
      const unitList = Array.from(value.units);
      const canMergeQuantity =
        value.quantities.length === value.count &&
        unitList.length === 1 &&
        value.quantities.length > 0;

      let displayText = value.name;

      if (canMergeQuantity) {
        const total = value.quantities.reduce((sum, q) => sum + q, 0);
        const unit = unitList[0];
        displayText = `${formatQuantity(total)} ${pluralizeUnit(unit, total)} ${value.name}`;
      } else if (value.count > 1) {
        displayText = `${value.name} ×${value.count}`;
      }

      return {
        id: key,
        checked: value.checked,
        category: value.category,
        sourceIds: value.sourceIds,
        count: value.count,
        recipeCountLabel: value.count > 1 ? `(${value.count} recipes)` : "",
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
              placeholder="Add milk, bread, snacks..."
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
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
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
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
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