import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";
import { ThemeProvider, useTheme } from "./theme";
import ThemeToggleFab from "./components/ThemeToggleFab";
import "./index.css";
import { ToastProvider } from "./components/Toast";

function AppShell() {
  const { theme, mode } = useTheme();

  return (
   <div
  style={{
    minHeight: "100vh",
    background: "transparent",
    color: theme.colors.text,
    padding: 12,
  }}
>

      <div style={{ fontWeight: 900, marginBottom: 12 }}>
        ✅ AppShell mounted — mode: {mode}
      </div>

      <ThemeToggleFab />

      <div style={{ marginTop: 12 }}>
        <div
  style={{
    maxWidth: 980,
    margin: "0 auto",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
  }}
>
  <App />
</div>

      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <ToastProvider>
            <AppShell />
          </ToastProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
