import { useEffect, useMemo, useState } from "react";

export type ShoppingItem = {
  id: string;
  name: string;
  qty?: string;
  unit?: string;
  category?: string;
  checked: boolean;
  createdAt: number;
};

const LS_KEY = "simple-dinners:shopping-list:v1";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);

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

  function addItem(input: { name: string; qty?: string; unit?: string; category?: string }) {
    const name = input.name.trim();
    if (!name) return;

    setItems((prev) => [
      {
        id: uid(),
        name,
        qty: input.qty?.trim() || undefined,
        unit: input.unit?.trim() || undefined,
        category: input.category || undefined,
        checked: false,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  }

  function toggleItem(id: string) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function clearChecked() {
    setItems((prev) => prev.filter((it) => !it.checked));
  }

  function resetAll() {
    setItems([]);
  }

  return { items: sorted, addItem, toggleItem, removeItem, clearChecked, resetAll };
}