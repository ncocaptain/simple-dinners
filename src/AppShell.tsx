import { useTheme } from "./theme";
import App from "./App";

export default function AppShell() {
  const { theme, mode } = useTheme();

  return (
    <div style={{ minHeight: "100vh", color: theme.colors.text, position: "relative", overflow: "hidden" }}>
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
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: mode === "light" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)",
          zIndex: 1,
        }}
      />
      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh" }}>
        <div style={{ marginTop: 12, maxWidth: 980, marginLeft: "auto", marginRight: "auto", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
          <App />
        </div>
      </div>
    </div>
  );
}
