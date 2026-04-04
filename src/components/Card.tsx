import React from "react";
import { useTheme } from "../theme";

type Props = {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void; // 1. Added this line
};

export default function Card({ children, title, subtitle, actions, style, onClick }: Props) { // 2. Destructure onClick
  const { theme } = useTheme();

  return (
    <div
      onClick={onClick} // 3. Pass it to the div
      style={{
        background: theme.colors.card,
        color: theme.colors.text,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        boxShadow: "0 12px 32px rgba(0,0,0,0.55)",
        cursor: onClick ? "pointer" : "default", // 4. Add a cursor pointer if it's clickable
        ...style,
      }}
    >
      {(title || subtitle || actions) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: theme.spacing.md,
            flexWrap: "wrap",
            alignItems: "baseline",
            marginBottom: theme.spacing.md,
          }}
        >
          <div>
            {title && <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>}
            {subtitle && <div style={{ color: theme.colors.muted, fontSize: 13, marginTop: 4 }}>{subtitle}</div>}
          </div>

          {actions && <div style={{ display: "flex", gap: theme.spacing.sm, flexWrap: "wrap" }}>{actions}</div>}
        </div>
      )}

      {children}
    </div>
  );
}