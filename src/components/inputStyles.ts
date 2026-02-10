import type React from "react";
import { useTheme } from "../theme";

export function useInputStyles() {
  const { theme } = useTheme();

  const base: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.inputBg,
    color: theme.colors.inputText,
    outline: "none",
  };

  const label: React.CSSProperties = {
    fontWeight: 800,
    color: theme.colors.text,
  };

  const hint: React.CSSProperties = {
    color: theme.colors.muted,
    fontSize: 12,
  };

  return { base, label, hint, theme };
}
