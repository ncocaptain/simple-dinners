import React from "react";

type Variant = "primary" | "secondary" | "danger";

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: Variant;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  const styles: React.CSSProperties = {
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
  };

  return (
    <button type={type} onClick={disabled ? undefined : onClick} disabled={disabled} style={styles}>
      {children}
    </button>
  );
}
