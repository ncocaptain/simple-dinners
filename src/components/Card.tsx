import React from "react";
import { useTheme } from "../theme";

type Props = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  style?: React.CSSProperties;
};

export default function Card({ children, title, subtitle, actions, style }: Props) {
  const { theme } = useTheme();

  return (
    <div
      style={{
        background: theme.colors.card,
        color: theme.colors.text,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
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
