import React from "react";

export type Theme = {
  colors: {
    bg: string;
    card: string;
    text: string;
    muted: string;
    primary: string;
    primaryDark: string;
    danger: string;
    border: string;
  };
  radius: { sm: number; md: number; lg: number };
  spacing: { xs: number; sm: number; md: number; lg: number };
};

export const darkTheme: Theme = {
  colors: {
    bg: "#0b1220",
    card: "rgba(30, 41, 59, 0.9)",
    text: "#f8fafc",
    muted: "#94a3b8",
    primary: "#14b8a6",
    primaryDark: "#0f766e",
    danger: "#ef4444",
    border: "rgba(255,255,255,0.10)",
  },
  radius: { sm: 6, md: 10, lg: 14 },
  spacing: { xs: 6, sm: 10, md: 14, lg: 20 },
};

type ThemeMode = "dark";

type ThemeCtx = {
  mode: ThemeMode;
  theme: Theme;
};

const ThemeContext = React.createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode: ThemeMode = "dark";
  const theme = darkTheme;

  return (
    <ThemeContext.Provider value={{ mode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}