import React from "react";

type Variant = "primary" | "secondary" | "danger";

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  style = {}, // Added style prop with a default empty object
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: Variant;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties; // Added type definition for the style prop
}) {
  const baseStyles: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    border: "1px solid rgba(255,255,255,0.12)",
    background:
      variant === "danger"
        ? "rgba(239,68,68,0.16)"
        : variant === "secondary"
        ? "rgba(255,255,255,0.06)"
        : "rgba(20,184,166,0.18)",
    color: "rgba(255,255,255,0.92)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "all 0.2s ease",
  };

  return (
    <button 
      type={type} 
      onClick={disabled ? undefined : onClick} 
      disabled={disabled} 
      // Merges baseStyles with whatever you pass in via the style prop
      style={{ ...baseStyles, ...style }} 
    >
      {children}
    </button>
  );
}