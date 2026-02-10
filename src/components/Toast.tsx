import React from "react";
import { useTheme } from "../theme";

type ToastType = "success" | "error" | "warning";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

const ToastContext = React.createContext<
  ((message: string, type?: ToastType) => void) | null
>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}

      <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 9999 }}>
        {toasts.map((t) => {
          const bg =
            t.type === "error"
              ? theme.colors.danger
              : t.type === "warning"
              ? "#f59e0b"
              : theme.colors.primary;

          return (
            <div
              key={t.id}
              style={{
                marginTop: 8,
                padding: "12px 16px",
                borderRadius: theme.radius.md,
                background: bg,
                color: "white",
                fontWeight: 800,
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              }}
            >
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
