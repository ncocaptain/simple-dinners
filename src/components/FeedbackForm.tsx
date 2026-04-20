import { useState } from "react";
import Card from "./Card";
import Button from "./Button";
import { useToast } from "./Toast";
import { getCookbook } from "../core/cookbookStore";
import { getDinnerStreak } from "../core/streakStore";
import { MessageSquare, Bug, Lightbulb, Copy } from "lucide-react";

export default function FeedbackForm() {
  const [text, setText] = useState("");
  const toast = useToast();

  // =====================================================
  // Helper: Collect all current app data for debugging
  // =====================================================
  const getFullDebugData = () => {
    const cookbook = getCookbook();
    const streak = getDinnerStreak();
    const meals = localStorage.getItem("meals") || "{}";
    const pantry = localStorage.getItem("pantry") || "[]";

    return `
----------------------------
SIMPLE DINNERS DEBUG DATA
----------------------------
Cookbook Size: ${cookbook.length} recipes
Current Streak: ${streak.currentStreak} days
Best Streak: ${streak.bestStreak} days
Last Cooked: ${streak.lastCookedDay || "Never"}
User Agent: ${navigator.userAgent}

-- PERSISTED DATA --
Meals: ${meals}
Pantry: ${pantry}
----------------------------
    `;
  };

  // =====================================================
  // Action: Copy data to the phone's clipboard
  // =====================================================
  const copyDebugData = async () => {
    const data = getFullDebugData();
    try {
      await navigator.clipboard.writeText(data);
      toast("Debug data copied to clipboard!", "success");
    } catch (err) {
      toast("Failed to copy data.", "error");
    }
  };

  // =====================================================
  // Action: Open the phone's email app
  // =====================================================
  const sendFeedback = (type: "Bug" | "Feature" | "Comment") => {
    if (!text.trim()) {
      toast("Please enter a message first.", "warning");
      return;
    }

    const subject = encodeURIComponent(`Simple Dinners ${type}: Internal Tester`);
    const body = encodeURIComponent(`${text}\n\n${getFullDebugData()}`);
    
    window.location.href = `mailto:ncocaptain88@gmail.com?subject=${subject}&body=${body}`;
    
    setText("");
    toast("Opening your email app...", "success");
  };

  return (
    <Card 
      title="Tester Feedback" 
      subtitle="Help Tom improve the app! Your feedback goes directly to ncocaptain88@gmail.com."
    >
      <div style={{ display: "grid", gap: 16 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind? Found a bug or have a cool idea?"
          style={{
            width: "100%",
            minHeight: 120,
            padding: 14,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "#f8fafc",
            outline: "none",
            fontSize: 15,
            resize: "vertical"
          }}
        />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button onClick={() => sendFeedback("Bug")} variant="danger">
            <Bug size={16} style={{ marginRight: 6 }} /> Report Bug
          </Button>
          <Button onClick={() => sendFeedback("Feature")}>
            <Lightbulb size={16} style={{ marginRight: 6 }} /> Suggest Feature
          </Button>
          <Button variant="secondary" onClick={() => sendFeedback("Comment")}>
            <MessageSquare size={16} style={{ marginRight: 6 }} /> General Comment
          </Button>
        </div>

        {/* =====================================================
            DEBUG SECTION FOR TESTERS
        ===================================================== */}
        <div style={{ 
          marginTop: 8, 
          paddingTop: 16, 
          borderTop: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center"
        }}>
          <button 
            onClick={copyDebugData}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 600
            }}
          >
            <Copy size={12} /> Copy Debug Data for Tom
          </button>
        </div>
      </div>
    </Card>
  );
}