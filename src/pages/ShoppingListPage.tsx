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
    <div style={{ maxWidth: 550, margin: "0 auto", padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>Shopping List</h2>

      <Card>
        <form onSubmit={handleAddExtra} style={{ display: "flex", gap: 8 }}>
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add item..."
            style={{ flex: 1 }}
          />
          <button type="submit">
            <Plus />
          </button>
        </form>
      </Card>

      {grouped.map((group) => (
        <div key={group.section}>
          <h4>{group.section}</h4>

          {group.items.map((item) => (
            <div key={item.id} onClick={() => toggleItem(item.id)}>
              {item.checked ? <CheckCircle2 /> : <Circle />}
              {cleanIngredient(formatIngredients(item.text, true))}
            </div>
          ))}
        </div>
      ))}

      {shoppingItems.length === 0 && (
        <div style={{ textAlign: "center", opacity: 0.4 }}>
          <ShoppingCart />
          <p>List is empty</p>
        </div>
      )}
    </div>
  );
}