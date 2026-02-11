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
      color: theme.colors.text,
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Background image */}
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundImage: `url("/moody-kitchen.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        zIndex: 0,
      }}
    />

    {/* Dark overlay */}
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 1,
      }}
    />

    {/* App content */}
    <div style={{ position: "relative", zIndex: 2, minHeight: "100vh" }}>
      <ThemeToggleFab />

      <div
        style={{
          marginTop: 12,
          maxWidth: 980,
          marginLeft: "auto",
          marginRight: "auto",
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
