import React from "react";

type Variant = "primary" | "secondary" | "danger";

export default function Button({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: Variant;
}) {
  const base: React.CSSProperties = {
    padding: "10px 18px",
    borderRadius: 14,
    fontWeight: 800,
    fontSize: 14,
    letterSpacing: 0.3,
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    cursor: "pointer",
    transition: "all .18s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  const styles: Record<Variant, React.CSSProperties> = {
    primary: {
      background:
        "linear-gradient(135deg, rgba(20,184,166,0.9), rgba(99,102,241,0.9))",
      color: "white",
      boxShadow: "0 6px 20px rgba(20,184,166,0.35)",
    },
    secondary: {
      background: "rgba(255,255,255,0.08)",
      color: "rgba(255,255,255,0.9)",
    },
    danger: {
      background:
        "linear-gradient(135deg, rgba(239,68,68,0.9), rgba(190,18,60,0.9))",
      color: "white",
      boxShadow: "0 6px 20px rgba(239,68,68,0.35)",
    },
  };

  return (
    <button
      onClick={onClick}
      style={{
        ...base,
        ...styles[variant],
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-2px)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.transform = "translateY(0)")
      }
      onMouseDown={(e) =>
        (e.currentTarget.style.transform = "translateY(1px)")
      }
      onMouseUp={(e) =>
        (e.currentTarget.style.transform = "translateY(-2px)")
      }
    >
      {children}
    </button>
  );
}
