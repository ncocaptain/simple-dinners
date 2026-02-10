import { days, normalize } from "../App";
import type { Meal } from "../App";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";


export default function WeekPage({
  meals,
  setMeals,
  checkedItems,
  setCheckedItems,
  addDayToCookbook,
  fillEmptyDaysWithPrompt,
  uniqueShoppingList,
}: {
  meals: Record<string, Meal>;
  setMeals: React.Dispatch<React.SetStateAction<Record<string, Meal>>>;
  checkedItems: string[];
  setCheckedItems: React.Dispatch<React.SetStateAction<string[]>>;
  addDayToCookbook: (day: string) => void;
  fillEmptyDaysWithPrompt: () => void;
  uniqueShoppingList: string[];
}) {
  const navigate = useNavigate();

  const updateMeal = (day: string, field: keyof Meal, value: string) => {
    setMeals((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const toggleItem = (item: string) => {
    const n = normalize(item);
    setCheckedItems((prev) => (prev.includes(n) ? prev.filter((i) => i !== n) : [...prev, n]));
  };

  return (
    <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <button
          onClick={fillEmptyDaysWithPrompt}
          style={{
            padding: "10px 14px",
            cursor: "pointer",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#60a5fa",
            color: "#0b1b3a",
            fontWeight: 800,
          }}
        >
          🎲 Fill Empty Days (Ask Me)
        </button>

        <Button variant="danger" onClick={() => setCheckedItems([])}>
  Clear Checked Items
</Button>


        {/* READABLE BUTTON */}
        <button
          onClick={() => navigate("/cookbook")}
          style={{
            padding: "10px 14px",
            cursor: "pointer",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#111827",
            color: "white",
            fontWeight: 900,
          }}
        >
          Go to Cookbook →
        </button>
      </div>

      <div style={{ padding: 12, borderRadius: 10, border: "1px solid #e5e7eb" }}>
        <h2 style={{ marginTop: 0 }}>This Week</h2>

        {days.map((day) => (
          <div key={day} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <strong>{day}</strong>
              <button
                onClick={() => addDayToCookbook(day)}
                style={{
                  padding: "8px 10px",
                  cursor: "pointer",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "#14b8a6",
                  color: "#022c22",
                  fontWeight: 800,
                }}
              >
                ➕ Add to Cookbook
              </button>
            </div>

            <input
              placeholder="Meal name"
              value={meals[day]?.name || ""}
              onChange={(e) => updateMeal(day, "name", e.target.value)}
              style={{ width: "100%", marginTop: 6 }}
            />
            <input
              placeholder="Ingredients (comma separated)"
              value={meals[day]?.ingredients || ""}
              onChange={(e) => updateMeal(day, "ingredients", e.target.value)}
              style={{ width: "100%", marginTop: 6 }}
            />
          </div>
        ))}
      </div>

      {uniqueShoppingList.length > 0 && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 10, border: "1px solid #e5e7eb" }}>
          <h2 style={{ marginTop: 0 }}>🛒 Shopping List</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {uniqueShoppingList.map((item) => (
              <li key={item} style={{ marginBottom: 8 }}>
                <label style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={checkedItems.includes(item)}
                    onChange={() => toggleItem(item)}
                    style={{ marginRight: 8 }}
                  />
                  <span
                    style={{
                      textDecoration: checkedItems.includes(item) ? "line-through" : "none",
                      opacity: checkedItems.includes(item) ? 0.6 : 1,
                    }}
                  >
                    {item}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
