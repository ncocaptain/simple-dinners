import { useState } from "react";
import {
  Plus,
  Trash2,
  ShoppingCart,
  Eraser,
  CheckCircle2,
  Circle,
} from "lucide-react";
import Card from "../components/Card";
import { formatIngredients } from "../core/utils";

type StoreSection =
  | "Produce"
  | "Meat / Seafood"
  | "Dairy / Eggs"
  | "Bakery"
  | "Frozen"
  | "Pantry"
  | "Spices / Seasonings"
  | "Other";

const SECTION_ORDER: StoreSection[] = [
  "Produce",
  "Meat / Seafood",
  "Dairy / Eggs",
  "Bakery",
  "Frozen",
  "Pantry",
  "Spices / Seasonings",
  "Other",
];

function normalizeIngredient(line: string) {
  return line.toLowerCase().trim();
}

function cleanIngredient(line: string) {
  let text = line.toLowerCase().trim();

  // remove parenthetical notes
  text = text.replace(/\([^)]*\)/g, " ");

  // remove common phrases
  const removePhrases = [
    "to taste",
    "as needed",
    "optional",
    "for garnish",
    "plus more for garnish",
    "divided",
    "stems removed",
    "seeds removed",
  ];

  removePhrases.forEach((phrase) => {
    text = text.replaceAll(phrase, " ");
  });

  // remove prep / descriptor words
  const removeWords = [
    "small",
    "medium",
    "large",
    "extra-large",
    "fresh",
    "freshly",
    "thin",
    "thinly",
    "thick",
    "thickly",
    "finely",
    "roughly",
    "chopped",
    "diced",
    "minced",
    "sliced",
    "halved",
    "cubed",
    "shredded",
    "grated",
    "peeled",
    "crushed",
    "softened",
    "melted",
    "beaten",
    "drained",
    "rinsed",
    "packed",
    "whole",
    "boneless",
    "skinless",
  ];

  removeWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    text = text.replace(regex, " ");
  });

  // remove "clove/cloves", "fillet/fillets", etc if you want simpler shopping terms
  const removeNouns = ["clove", "cloves", "fillet", "fillets"];
  removeNouns.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    text = text.replace(regex, " ");
  });

  // split on commas and keep the first meaningful ingredient part
  text = text.split(",")[0];

  // remove stray leading dashes/bullets
  text = text.replace(/^[-•*]\s*/, "");

  // clean spaces
  text = text.replace(/\s+/g, " ").trim();

  // special cleanup
  if (text === "salt and pepper") return "salt / pepper";

  return text;
}

function categorizeIngredient(line: string): StoreSection {
  const item = normalizeIngredient(line);
  
  if (
  item.includes("crushed tomatoes") ||
  item.includes("diced tomatoes") ||
  item.includes("tomato sauce") ||
  item.includes("canned")
) {
  return "Pantry";
}

  const produce = [
    "onion",
    "yellow onion",
    "red onion",
    "white onion",
    "garlic",
    "tomato",
    "tomatoes",
    "lettuce",
    "romaine",
    "spinach",
    "kale",
    "carrot",
    "carrots",
    "celery",
    "potato",
    "potatoes",
    "sweet potato",
    "sweet potatoes",
    "broccoli",
    "cauliflower",
    "zucchini",
    "squash",
    "pepper",
    "peppers",
    "bell pepper",
    "green pepper",
    "red pepper",
    "jalapeno",
    "avocado",
    "lime",
    "lemon",
    "apple",
    "apples",
    "banana",
    "bananas",
    "cucumber",
    "cilantro",
    "parsley",
    "green onion",
    "green onions",
    "mushroom",
    "mushrooms",
    "corn",
  ];

  const meatSeafood = [
    "chicken",
    "ground beef",
    "beef",
    "steak",
    "pork",
    "sausage",
    "bacon",
    "turkey",
    "shrimp",
    "salmon",
    "fish",
    "tuna",
    "ham",
    "meatballs",
  ];

  const dairyEggs = [
    "milk",
    "butter",
    "cheese",
    "cheddar",
    "mozzarella",
    "parmesan",
    "cream cheese",
    "heavy cream",
    "half and half",
    "yogurt",
    "eggs",
    "egg",
    "sour cream",
  ];

  const bakery = [
    "bread",
    "buns",
    "rolls",
    "hamburger buns",
    "hot dog buns",
    "bagel",
    "bagels",
    "tortilla",
    "tortillas",
    "flatbread",
    "pizza crust",
  ];

  const frozen = [
    "frozen",
    "hash browns",
    "frozen vegetables",
    "frozen mixed vegetables",
    "frozen peas",
    "frozen corn",
    "ice cream",
  ];

  const spices = [
    "salt",
    "pepper",
    "garlic powder",
    "onion powder",
    "paprika",
    "cumin",
    "chili powder",
    "italian seasoning",
    "oregano",
    "basil",
    "parsley flakes",
    "red pepper flakes",
    "cinnamon",
  ];

  const pantry = [
    "rice",
    "pasta",
    "spaghetti",
    "noodles",
    "flour",
    "sugar",
    "brown sugar",
    "oil",
    "olive oil",
    "vegetable oil",
    "soy sauce",
    "broth",
    "chicken broth",
    "beef broth",
    "beans",
    "black beans",
    "kidney beans",
    "tomato sauce",
    "diced tomatoes",
    "crushed tomatoes",
    "breadcrumbs",
    "oats",
    "peanut butter",
    "jelly",
    "marinara",
    "salsa",
    "vinegar",
    "mustard",
    "ketchup",
    "mayo",
    "mayonnaise",
    "canned",
  ];

  if (produce.some((word) => item.includes(word))) return "Produce";
  if (meatSeafood.some((word) => item.includes(word))) return "Meat / Seafood";
  if (dairyEggs.some((word) => item.includes(word))) return "Dairy / Eggs";
  if (bakery.some((word) => item.includes(word))) return "Bakery";
  if (frozen.some((word) => item.includes(word))) return "Frozen";
  if (spices.some((word) => item.includes(word))) return "Spices / Seasonings";
  if (pantry.some((word) => item.includes(word))) return "Pantry";

  return "Other";
}

export default function ShoppingListPage({
  meals,
  extraIngredients,
  setExtraIngredients,
}: any) {
  const [newItem, setNewItem] = useState("");
  const [crossedOff, setCrossedOff] = useState<string[]>([]);

  const handleAddExtra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setExtraIngredients([...extraIngredients, newItem.trim()]);
    setNewItem("");
  };

  const toggleCrossed = (id: string) => {
    setCrossedOff((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const removeExtra = (index: number) => {
    setExtraIngredients(
      extraIngredients.filter((_: any, i: number) => i !== index)
    );
  };

  const clearAllExtras = () => {
    if (window.confirm("Clear all manual items?")) setExtraIngredients([]);
  };

  const recipeIngredients = Object.values(meals)
    .filter((m: any) => m.ingredients && m.ingredients.trim() !== "")
    .flatMap((m: any, mealIdx: number) =>
      m.ingredients
        .split("\n")
        .filter((line: string) => line.trim() !== "")
        .map((line: string, i: number) => ({
          id: `recipe-${mealIdx}-${i}`,
          text: line,
          section: categorizeIngredient(cleanIngredient(formatIngredients(line, true))),
        }))
    );

  const manualIngredients = extraIngredients.map((item: string, i: number) => ({
    id: `extra-${i}`,
    text: item,
    section: categorizeIngredient(cleanIngredient(formatIngredients(item, true))),
    isManual: true,
  }));

  const allIngredients = [...recipeIngredients, ...manualIngredients];

  const groupedBySection = SECTION_ORDER.map((section) => ({
    section,
    items: allIngredients.filter((item) => item.section === section),
  })).filter((group) => group.items.length > 0);

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
        <header style={{ textAlign: "center", margin: "20px 0" }}>
          <h2 style={{ fontSize: 28, fontWeight: 1000, margin: 0 }}>
            Shopping List
          </h2>
        </header>

        <Card style={{ marginBottom: 24 }}>
          <form onSubmit={handleAddExtra} style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Add milk, bread, snacks..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0 16px",
                borderRadius: "12px",
                background: "#22c55e",
                border: "none",
                color: "white",
              }}
            >
              <Plus size={24} />
            </button>
          </form>
        </Card>

        {extraIngredients.length > 0 && (
          <div style={{ marginBottom: 18, textAlign: "right" }}>
            <button
              onClick={clearAllExtras}
              style={{
                background: "none",
                border: "none",
                color: "#ef4444",
                fontSize: 10,
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Eraser size={12} /> CLEAR MANUAL ITEMS
            </button>
          </div>
        )}

        {groupedBySection.map((group) => (
          <div key={group.section} style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  height: 1,
                  flex: 1,
                  background: "rgba(255,255,255,0.1)",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  opacity: 0.5,
                  letterSpacing: 1.5,
                }}
              >
                {group.section.toUpperCase()}
              </span>
              <div
                style={{
                  height: 1,
                  flex: 1,
                  background: "rgba(255,255,255,0.1)",
                }}
              />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {group.items.map((item) => {
                const isDone = crossedOff.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleCrossed(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "14px 16px",
                      background: isDone
                        ? "transparent"
                        : "rgba(255,255,255,0.05)",
                      borderRadius: "14px",
                      border: isDone
                        ? "1px solid rgba(255,255,255,0.05)"
                        : "1px solid rgba(255,255,255,0.1)",
                      opacity: isDone ? 0.3 : 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      {isDone ? (
                        <CheckCircle2 size={18} color="#22c55e" />
                      ) : (
                        <Circle size={18} style={{ opacity: 0.2 }} />
                      )}

                      <span
                        style={{
                          fontWeight: 600,
                          textDecoration: isDone ? "line-through" : "none",
                        }}
                      >
                        {cleanIngredient(formatIngredients(item.text, true))}
                      </span>
                    </div>

                    {"isManual" in item && item.isManual ? (
                      <Trash2
                        size={18}
                        onClick={(e) => {
                          e.stopPropagation();
                          const index = Number(item.id.replace("extra-", ""));
                          removeExtra(index);
                        }}
                        style={{ opacity: 0.4, color: "#ef4444" }}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {groupedBySection.length === 0 && (
          <div style={{ textAlign: "center", padding: 80, opacity: 0.2 }}>
            <ShoppingCart size={48} style={{ marginBottom: 16 }} />
            <div style={{ fontWeight: 800 }}>List is empty</div>
          </div>
        )}
      </div>
    </div>
  );
}