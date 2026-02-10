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
    inputBg: string;
    inputText: string;
    inputPlaceholder: string;

  };
  radius: { sm: number; md: number; lg: number };
  spacing: { xs: number; sm: number; md: number; lg: number };
};

export const lightTheme: Theme = {
  colors: {
    bg: "#f3f4f6",
    card: "#ffffff",
    text: "#111827",
    muted: "#6b7280",
    primary: "#14b8a6",
    primaryDark: "#0f766e",
    danger: "#ef4444",
    border: "#e5e7eb",
    inputBg: "#ffffff",
    inputText: "#111827",
    inputPlaceholder: "#6b7280",

  },
  radius: { sm: 6, md: 10, lg: 14 },
  spacing: { xs: 6, sm: 10, md: 14, lg: 20 },
};

export const darkTheme: Theme = {
  colors: {
    bg: "#0b1220",
    card: "#111827",
    text: "#f9fafb",
    muted: "#9ca3af",
    primary: "#14b8a6",
    primaryDark: "#0f766e",
    danger: "#ef4444",
    border: "rgba(255,255,255,0.08)",
    inputBg: "#0f172a",        // slightly darker than card
    inputText: "#f9fafb",
    inputPlaceholder: "#94a3b8",

  },
  radius: { sm: 6, md: 10, lg: 14 },
  spacing: { xs: 6, sm: 10, md: 14, lg: 20 },
};

type ThemeMode = "light" | "dark";

type ThemeCtx = {
  mode: ThemeMode;
  theme: Theme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = React.createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = React.useState<ThemeMode>(() => {
    const saved = localStorage.getItem("themeMode");
    return saved === "light" || saved === "dark" ? saved : "dark";
  });

  const setMode = (m: ThemeMode) => setModeState(m);
  const toggle = () => setModeState((m) => (m === "dark" ? "light" : "dark"));

  const theme = mode === "dark" ? darkTheme : lightTheme;

  React.useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, theme, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
