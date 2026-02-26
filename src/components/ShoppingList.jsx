import { useMemo, useState } from "react";
import { useShoppingList } from "../hooks/useShoppingList";
import "./ShoppingList.css";

const CATEGORIES = ["Produce", "Meat", "Dairy", "Pantry", "Frozen", "Other"];
const UNITS = ["", "ct", "lb", "oz", "g", "kg", "can", "jar", "box", "bag", "cup", "tbsp", "tsp"];

export default function ShoppingList() {
  const { items, addItem, toggleItem, removeItem, clearChecked } = useShoppingList();

  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("Other");

  const checkedCount = useMemo(() => items.filter((i) => i.checked).length, [items]);

  function onSubmit(e) {
    e.preventDefault();
    addItem({ name, qty, unit, category });
    setName("");
    setQty("");
    setUnit("");
    setCategory("Other");
  }

  return (
    <section className="shop">
      <div className="shopHeader">
        <div>
          <h2 className="shopTitle">Shopping List</h2>
          <p className="shopSub">
            Add what you need, check it off in the store.
          </p>
        </div>

        <button
          className="shopBtn secondary"
          type="button"
          onClick={clearChecked}
          disabled={checkedCount === 0}
          title="Remove checked items"
        >
          Clear checked
        </button>
      </div>

      <form className="shopForm" onSubmit={onSubmit}>
        <input
          className="shopInput"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Add an ingredient (e.g., "chicken thighs")'
          autoComplete="off"
        />

        <input
          className="shopSmall"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="Qty"
          inputMode="decimal"
        />

        <select className="shopSmall" value={unit} onChange={(e) => setUnit(e.target.value)}>
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u || "Unit"}
            </option>
          ))}
        </select>

        <select className="shopSmall" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button className="shopBtn" type="submit">
          Add
        </button>
      </form>

      {items.length === 0 ? (
        <div className="shopEmpty">No items yet. Add a few ingredients to get started.</div>
      ) : (
        <ul className="shopList">
          {items.map((it) => (
            <li key={it.id} className={`shopItem ${it.checked ? "checked" : ""}`}>
              <label className="shopCheck">
                <input
                  type="checkbox"
                  checked={it.checked}
                  onChange={() => toggleItem(it.id)}
                />
                <span className="shopName">
                  {it.name}
                  <span className="shopMeta">
                    {(it.qty || it.unit) ? ` • ${it.qty || ""} ${it.unit || ""}`.trim() : ""}
                    {it.category ? ` • ${it.category}` : ""}
                  </span>
                </span>
              </label>

              <button
                className="shopIconBtn"
                type="button"
                onClick={() => removeItem(it.id)}
                aria-label={`Remove ${it.name}`}
                title="Remove"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}