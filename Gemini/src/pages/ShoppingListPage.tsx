import { useEffect, useState } from "react";
import { loadShoppingList, saveShoppingList } from "../shoppingList";
import type { ShoppingItem } from "../shoppingList";
import { GROCERY_CATEGORY_ORDER } from "../core/groceryCategories";

export default function ShoppingListPage() {
  // =====================================================
  // Builder: page state
  // =====================================================
  const [items, setItems] = useState<ShoppingItem[]>([]);

  // =====================================================
  // Builder: initial load
  // =====================================================
  useEffect(() => {
    setItems(loadShoppingList());
  }, []);

  // =====================================================
  // Builder: item actions
  // =====================================================
  const toggle = (id: string) => {
    const updated = items.map((i) =>
      i.id === id ? { ...i, checked: !i.checked } : i
    );
    setItems(updated);
    saveShoppingList(updated);
  };

  const remove = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    saveShoppingList(updated);
  };

  const clearChecked = () => {
    const updated = items.filter((i) => !i.checked);
    setItems(updated);
    saveShoppingList(updated);
  };

  const clearAll = () => {
    setItems([]);
    saveShoppingList([]);
  };

  // =====================================================
  // Builder: shared button styles
  // =====================================================
  const btn: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 14,
    background: "rgba(20,184,166,0.18)",
    color: "#f8fafc",
    cursor: "pointer",
    fontWeight: 900,
    border: "1px solid rgba(20,184,166,0.35)",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  const btnDisabled: React.CSSProperties = {
    ...btn,
    opacity: 0.5,
    cursor: "not-allowed",
  };

  const removeBtn: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    color: "#f8fafc",
    cursor: "pointer",
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.12)",
  };

  // =====================================================
  // Builder: grouped shopping list data
  // =====================================================
  const groupedItems = GROCERY_CATEGORY_ORDER.map((category) => {
    const categoryItems = items
      .filter((item) => item.category === category)
      .slice()
      .sort((a, b) => {
        if (a.checked !== b.checked) return a.checked ? 1 : -1;
        return b.addedAt - a.addedAt;
      });

    return {
      category,
      items: categoryItems,
    };
  }).filter((group) => group.items.length > 0);

  // =====================================================
  // Builder: page UI
  // =====================================================
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16, color: "#f8fafc" }}>
      <h1 style={{ marginTop: 0 }}>Shopping List</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <button
          onClick={clearChecked}
          disabled={items.every((i) => !i.checked)}
          style={items.every((i) => !i.checked) ? btnDisabled : btn}
        >
          Clear checked
        </button>

        <button
          onClick={clearAll}
          disabled={items.length === 0}
          style={items.length === 0 ? btnDisabled : btn}
        >
          Clear all
        </button>
      </div>

      {items.length === 0 ? (
        <p>No items yet. Add ingredients from a recipe.</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {groupedItems.map((group) => (
            <div
              key={group.category}
              style={{
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 16,
                padding: 16,
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  opacity: 0.7,
                  marginBottom: 10,
                  letterSpacing: 0.3,
                }}
              >
                {group.category}
              </div>

              <div style={{ display: "grid", gap: 4 }}>
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 8px",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      opacity: item.checked ? 0.6 : 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggle(item.id)}
                      style={{
                        width: 18,
                        height: 18,
                        accentColor: "#14b8a6",
                        cursor: "pointer",
                      }}
                    />

                    <span
                      style={{
                        flex: 1,
                        textDecoration: item.checked ? "line-through" : "none",
                      }}
                    >
                      {item.text}
                    </span>

                    <button onClick={() => remove(item.id)} style={removeBtn}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}