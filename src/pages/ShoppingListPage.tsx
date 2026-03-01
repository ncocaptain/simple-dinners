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

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1>Shopping List</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={clearChecked}>Clear checked</button>
        <button onClick={clearAll}>Clear all</button>
      </div>

      {items.length === 0 ? (
        <p>No items yet. Add ingredients from a recipe.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((item) => (
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
              <input type="checkbox" checked={item.checked} onChange={() => toggle(item.id)} />
              <span style={{ flex: 1, textDecoration: item.checked ? "line-through" : "none" }}>
                {item.text}
              </span>
              <button onClick={() => remove(item.id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}