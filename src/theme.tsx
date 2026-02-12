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
  },
  radius: { sm: 6, md: 10, lg: 14 },
  spacing: { xs: 6, sm: 10, md: 14, lg: 20 },
};

export const darkTheme: Theme = {
  colors: {
    bg: "#0b1220",
    card: "rgba(17, 24, 39, 0.72)",
    text: "#f9fafb",
    muted: "#9ca3af",
    primary: "#14b8a6",
    primaryDark: "#0f766e",
    danger: "#ef4444",
    border: "rgba(255,255,255,0.10)",
  },
  radius: { sm: 6, md: 10, lg: 14 },
  spacing: { xs: 6, sm: 10, md: 14, lg: 20 },
};

type ThemeMode = "light" | "dark";

type ThemeCtx = {
  mode: ThemeMode;
  theme: Theme;
};

const ThemeContext = React.createContext<ThemeCtx | null>(null);

function getSystemMode(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<ThemeMode>(() => getSystemMode());

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setMode(mq.matches ? "dark" : "light");

    // Initial sync
    handler();

    // Listen for changes
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  const theme = mode === "dark" ? darkTheme : lightTheme;

  return <ThemeContext.Provider value={{ mode, theme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
