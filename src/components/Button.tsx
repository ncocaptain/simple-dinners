import React from "react";
import { useTheme } from "../theme";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({ variant = "primary", style, ...props }: Props) {
  const { theme } = useTheme();

  const bg =
    variant === "danger"
      ? theme.colors.danger
      : variant === "secondary"
      ? theme.colors.card
      : theme.colors.primary;

  const color = variant === "secondary" ? theme.colors.text : "white";

  return (
    <button
      {...props}
      style={{
        padding: "10px 14px",
        borderRadius: theme.radius.md,
        border: variant === "secondary" ? `1px solid ${theme.colors.border}` : "none",
        background: bg,
        color,
        fontWeight: 800,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.6 : 1,
        ...style,
      }}
    />
  );
}
