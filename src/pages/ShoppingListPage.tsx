import { useMemo, useState } from "react";
import { Plus, ShoppingCart, CheckCircle2, Circle } from "lucide-react";
import Card from "../components/Card";
import { formatIngredients } from "../core/utils";
import {
  loadShoppingList,
  saveShoppingList,
  type ShoppingItem,
} from "../shoppingList";
import { categorizeGroceryItem } from "../core/groceryCategories";

type StoreSection =
  | "Produce"
  | "Meat"
  | "Dairy"
  | "Bakery"
  | "Frozen"
  | "Pantry"
  | "Spices"
  | "Other";

const SECTION_ORDER: StoreSection[] = [
  "Produce",
  "Meat",
  "Dairy",
  "Bakery",
  "Frozen",
  "Pantry",
  "Spices",
  "Other",
];

function cleanIngredient(line: string) {
  return line.toLowerCase().replace(/\([^)]*\)/g, "").split(",")[0].trim();
}

export default function ShoppingListPage({
  extraIngredients,
  setExtraIngredients,
}: any) {
  const [newItem, setNewItem] = useState("");
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() =>
    loadShoppingList()
  );

  const toggleItem = (id: string) => {
    const updated = shoppingItems.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setShoppingItems(updated);
    saveShoppingList(updated);
  };

  const handleAddExtra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setExtraIngredients([...extraIngredients, newItem.trim()]);
    setNewItem("");
  };


  const grouped = useMemo(() => {
    const items = shoppingItems.map((item) => ({
      ...item,
      section: categorizeGroceryItem(item.text),
    }));

    return SECTION_ORDER.map((section) => ({
      section,
      items: items.filter((i) => i.section === section),
    })).filter((g) => g.items.length > 0);
  }, [shoppingItems]);

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
      
      {/* HEADER */}
      <header style={{ textAlign: "center", margin: "20px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 1000, margin: 0 }}>
          Shopping List
        </h2>
      </header>

      {/* INPUT */}
      <Card style={{ marginBottom: 28 }}>
        <form onSubmit={handleAddExtra} style={{ display: "flex", gap: 10 }}>
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

      {/* SECTIONS */}
      {grouped.map((group) => (
        <div key={group.section} style={{ marginBottom: 28 }}>
          
          {/* SECTION HEADER */}
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

          {/* ITEMS */}
          <div style={{ display: "grid", gap: 8 }}>
            {group.items.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
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
                {item.checked ? (
                  <CheckCircle2 size={18} color="#22c55e" />
                ) : (
                  <Circle size={18} style={{ opacity: 0.2 }} />
                )}

                <span
                  style={{
                    fontWeight: 600,
                    textDecoration: item.checked ? "line-through" : "none",
                  }}
                >
                  {cleanIngredient(formatIngredients(item.text, true))}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* EMPTY STATE */}
      {grouped.length === 0 && (
        <div style={{ textAlign: "center", padding: 80, opacity: 0.2 }}>
          <ShoppingCart size={48} style={{ marginBottom: 16 }} />
          <div style={{ fontWeight: 800 }}>List is empty</div>
        </div>
      )}
    </div>
  </div>
);
}