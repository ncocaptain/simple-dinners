import Card from "../components/Card";
import { CheckCircle2, FlaskConical, Target, Zap } from "lucide-react";

export default function TestersGuidePage() {
  const tasks = [
    {
      title: "The Magic Planner",
      desc: "Go to 'Plan My Week' and generate a new schedule. Does it feel like a good mix?",
      icon: <Zap size={20} color="#14b8a6" />
    },
    {
      title: "The Kitchen Brain",
      desc: "Add 5 items to your Pantry, then check 'Cook Now'. Are the top suggestions accurate?",
      icon: <FlaskConical size={20} color="#8b5cf6" />
    },
    {
      title: "Recipe Import",
      desc: "Try adding a custom recipe to your Cookbook. Does the photo upload work smoothly?",
      icon: <Target size={20} color="#f59e0b" />
    }
  ];

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: "0 auto", display: "grid", gap: 20 }}>
      <header style={{ textAlign: "center", marginBottom: 10 }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Internal Tester's Guide</h2>
        <p style={{ opacity: 0.7 }}>Help Tom break things! Try to complete these three missions.</p>
      </header>

      {tasks.map((task, i) => (
        <Card key={i} title={<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{task.icon} {task.title}</div>}>
          <p style={{ lineHeight: 1.6, opacity: 0.9 }}>{task.desc}</p>
        </Card>
      ))}

      <Card style={{ background: "rgba(20, 184, 166, 0.1)", borderColor: "#14b8a6" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <CheckCircle2 color="#14b8a6" />
          <div style={{ fontWeight: 800 }}>Found a bug? Use the "Send Feedback" button in the menu!</div>
        </div>
      </Card>
    </div>
  );
}