import Card from "../components/Card";
import {
  CheckCircle2,
  Wand2,
  ShoppingCart,
  ChefHat,
  ArrowRightLeft,
} from "lucide-react";

export default function TestersGuidePage() {
  const tasks = [
    {
      title: "Magic Import",
      desc: "Go to Cookbook and import a recipe from a URL. Check whether the recipe name, image, ingredients, and instructions come in cleanly.",
      icon: <Wand2 size={20} color="#14b8a6" />,
    },
    {
      title: "Shopping List Flow",
      desc: "Open any recipe, select a few ingredients, and add them to the shopping list. Make sure they appear correctly and do not duplicate oddly.",
      icon: <ShoppingCart size={20} color="#22c55e" />,
    },
    {
      title: "Cook Mode",
      desc: "Open a recipe and launch Cook Mode. Step through the recipe, check that ingredient highlighting makes sense, and tap ingredients to mark them complete.",
      icon: <ChefHat size={20} color="#f59e0b" />,
    },
    {
      title: "Navigation Check",
      desc: "Open a recipe from Week Plan, then go back. Open one from Cookbook, then go back. Make sure the app returns you to the right place.",
      icon: <ArrowRightLeft size={20} color="#8b5cf6" />,
    },
  ];

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 700,
        margin: "0 auto",
        display: "grid",
        gap: 20,
      }}
    >
      <header style={{ textAlign: "center", marginBottom: 10 }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          Internal Tester&apos;s Guide
        </h2>
        <p style={{ opacity: 0.7, lineHeight: 1.6 }}>
          Help Tom break things. You do not need to test everything — even trying
          one or two of these helps a lot.
        </p>
      </header>

      {tasks.map((task, i) => (
        <Card
          key={i}
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {task.icon}
              {task.title}
            </div>
          }
        >
          <p style={{ lineHeight: 1.6, opacity: 0.9, margin: 0 }}>{task.desc}</p>
        </Card>
      ))}

      <Card
        style={{
          background: "rgba(20, 184, 166, 0.1)",
          borderColor: "#14b8a6",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <CheckCircle2 color="#14b8a6" />
          <div style={{ fontWeight: 800 }}>
            Found a bug or something confusing? Use the Send Feedback button in
            the menu and include what you tapped right before it happened.
          </div>
        </div>
      </Card>
    </div>
  );
}