import { useEffect, useState } from "react";
import { ShoppingBasket, Trash2, CheckCircle2, Circle, XCircle, Trash } from "lucide-react";
import { loadShoppingList, saveShoppingList } from "../shoppingList";
import type { ShoppingItem } from "../shoppingList";
import { GROCERY_CATEGORY_ORDER } from "../core/groceryCategories";

import Card from "../components/Card";
import Button from "../components/Button";

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    setItems(loadShoppingList());
  }, []);

  const toggle = (id: string) => {
    const updated = items.map((i) => i.id === id ? { ...i, checked: !i.checked } : i);
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
    if (window.confirm("Clear the entire list?")) {
      setItems([]);
      saveShoppingList([]);
    }
  };

  const groupedItems = GROCERY_CATEGORY_ORDER.map((category) => {
    const categoryItems = items
      .filter((item) => item.category === category)
      .slice()
      .sort((a, b) => {
        if (a.checked !== b.checked) return a.checked ? 1 : -1;
        return b.addedAt - a.addedAt;
      });
    return { category, items: categoryItems };
  }).filter((group) => group.items.length > 0);

  return (
    <div style={{ maxWidth: "550px", margin: "0 auto", padding: "0 20px 40px 20px" }}>
      <Card 
        title={<><ShoppingBasket size={22} /> Shopping List</>} 
        subtitle={`${items.filter(i => !i.checked).length} items remaining`}
      >
        
        {/* Action Header */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
          <Button 
            variant="secondary" 
            style={{ flex: 1, background: "rgba(255,255,255,0.05)" }}
            onClick={clearChecked}
            disabled={!items.some(i => i.checked)}
          >
            <XCircle size={16} /> Clear Checked
          </Button>
          <Button 
            variant="danger" 
            style={{ flex: 1, background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.2)" }}
            onClick={clearAll}
            disabled={items.length === 0}
          >
            <Trash size={16} /> Clear All
          </Button>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", opacity: 0.5 }}>
            <ShoppingBasket size={48} style={{ margin: "0 auto 16px auto", display: "block" }} />
            <p style={{ fontSize: 16 }}>Your list is empty.<br/>Add items from the Cookbook!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 24 }}>
            {groupedItems.map((group) => (
              <div key={group.category}>
                <h3 style={{ 
                  fontSize: 12, 
                  fontWeight: 900, 
                  textTransform: "uppercase", 
                  letterSpacing: "0.1em", 
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 12,
                  paddingLeft: 8
                }}>
                  {group.category}
                </h3>
                
                <div style={{ display: "grid", gap: 8 }}>
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "16px 20px",
                        borderRadius: "20px",
                        background: item.checked ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                        border: "1px solid",
                        borderColor: item.checked ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {item.checked ? (
                        <CheckCircle2 size={24} color="#22c55e" />
                      ) : (
                        <Circle size={24} color="rgba(255,255,255,0.2)" />
                      )}

                      <span style={{
                        flex: 1,
                        fontSize: "17px",
                        fontWeight: item.checked ? 400 : 600,
                        color: item.checked ? "rgba(255,255,255,0.3)" : "#f8fafc",
                        textDecoration: item.checked ? "line-through" : "none",
                      }}>
                        {item.text}
                      </span>

                      {!item.checked && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); remove(item.id); }}
                          style={{ 
                            background: "none", 
                            border: "none", 
                            color: "rgba(239,68,68,0.4)",
                            padding: "8px"
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}