
import Button from "./Button";
import { useTheme } from "../theme";

export default function ThemeToggleFab() {
  const { mode, toggle } = useTheme();

  return (
    <div style={{ position: "fixed", right: 12, top: 12, zIndex: 9999 }}>
      <Button variant="secondary" onClick={toggle} title="Toggle theme">
        {mode === "dark" ? "☀️ Light" : "🌙 Dark"}
      </Button>
    </div>
  );
}
