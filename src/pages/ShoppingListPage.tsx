import { useEffect, useState } from "react";
import { loadShoppingList, saveShoppingList } from "../shoppingList";
import type { ShoppingItem } from "../shoppingList";

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    setItems(loadShoppingList());
  }, []);

  const toggle = (id: string) => {
    const updated = items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i));
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

const displayItems = items
  .slice()
  .sort((a, b) => {
    // unchecked first
    if (a.checked !== b.checked) return a.checked ? 1 : -1;
    // newest first
    return b.addedAt - a.addedAt;
  });

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1>Shopping List</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
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
        <ul style={{ listStyle: "none", padding: 0 }}>
          {displayItems.map((item) => (
            <li
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
    cursor: "pointer"
  }}
/>
              <span style={{ flex: 1, textDecoration: item.checked ? "line-through" : "none" }}>
                {item.text}
              </span>
              <button
  onClick={() => remove(item.id)}
  style={{
    padding: "8px 10px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    color: "#f8fafc",
    cursor: "pointer",
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.12)",
  }}
>
  Remove
</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}