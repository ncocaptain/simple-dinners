import { useTheme } from "./theme";
import App from "./App";

export default function AppShell() {
  const { theme, mode } = useTheme();

  return (
  <div
    className={`appBackground ${mode}`}
    style={{ minHeight: "100vh", color: theme.colors.text }}
  >
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
);
}
