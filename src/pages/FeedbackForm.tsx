import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Bug, MessageSquare, Star } from "lucide-react";

export default function FeedbackForm() {
  const navigate = useNavigate();
  const [type, setType] = useState("bug");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // This opens the user's email app with your info pre-filled
    const subject = `[Simple Dinners Feedback] ${type.toUpperCase()}`;
    const body = encodeURIComponent(`Feedback Type: ${type}\n\nMessage:\n${message}`);
    window.location.href = `mailto:YOUR_EMAIL@gmail.com?subject=${subject}&body=${body}`;
    
    alert("Opening your email app to send feedback!");
    navigate("/");
  };

  // Styles to match your existing app
  const cardStyle: React.CSSProperties = { 
    borderRadius: 20, 
    background: "rgba(30,41,59,0.40)", 
    backdropFilter: "blur(10px)", 
    border: "1px solid rgba(255,255,255,0.10)", 
    padding: 20,
    color: "#f8fafc"
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    marginTop: 8,
    fontSize: 16
  };

  const btnStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: "14px",
    borderRadius: 14,
    background: "#14b8a6",
    color: "white",
    border: "none",
    fontWeight: 900,
    cursor: "pointer",
    marginTop: 20
  };

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: "none", border: "none", color: "white", display: "flex", alignItems: "center", gap: 8, marginBottom: 20, cursor: "pointer", fontWeight: 800 }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 20px 0", fontWeight: 950 }}>Send Feedback</h2>
        
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, fontWeight: 800, opacity: 0.7 }}>WHAT KIND OF FEEDBACK?</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 8, marginBottom: 20 }}>
            <button type="button" onClick={() => setType("bug")} style={{ ...inputStyle, background: type === 'bug' ? "#ef4444" : "rgba(255,255,255,0.05)", border: "none", fontWeight: 800, marginTop: 0 }}>
              <Bug size={16} /> Bug
            </button>
            <button type="button" onClick={() => setType("idea")} style={{ ...inputStyle, background: type === 'idea' ? "#3b82f6" : "rgba(255,255,255,0.05)", border: "none", fontWeight: 800, marginTop: 0 }}>
              <MessageSquare size={16} /> Idea
            </button>
            <button type="button" onClick={() => setType("love")} style={{ ...inputStyle, background: type === 'love' ? "#eab308" : "rgba(255,255,255,0.05)", border: "none", fontWeight: 800, marginTop: 0 }}>
              <Star size={16} /> Love
            </button>
          </div>

          <label style={{ fontSize: 13, fontWeight: 800, opacity: 0.7 }}>YOUR MESSAGE</label>
          <textarea 
            required
            rows={6}
            style={inputStyle}
            placeholder="Tell the Captain what's on your mind..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button type="submit" style={btnStyle}>
            <Send size={18} /> Send to The Captain
          </button>
        </form>
      </div>
    </div>
  );
}