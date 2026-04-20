import { useEffect, useMemo, useState } from "react";

const LS_KEY = "simple-dinners:shopping-list:v1";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useShoppingList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const sorted = useMemo(() => {
    // unchecked first, newest first within each group
    return [...items].sort((a, b) => {
      if (a.checked !== b.checked) return a.checked ? 1 : -1;
      return b.createdAt - a.createdAt;
    });
  }, [items]);

  function addItem({ name, qty, unit, category }) {
    const cleanName = (name || "").trim();
    if (!cleanName) return;

    setItems((prev) => [
      {
        id: uid(),
        name: cleanName,
        qty: (qty || "").trim() || "",
        unit: (unit || "").trim() || "",
        category: category || "Other",
        checked: false,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  }

  function toggleItem(id) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it)));
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function clearChecked() {
    setItems((prev) => prev.filter((it) => !it.checked));
  }

  return { items: sorted, addItem, toggleItem, removeItem, clearChecked };
}