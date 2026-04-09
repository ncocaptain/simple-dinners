import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

export default function TipsModal({ tips }: { tips: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ? BUTTON */}
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "none",
          border: "none",
          color: "white",
          opacity: 0.6,
          cursor: "pointer",
        }}
      >
        <HelpCircle size={20} />
      </button>

      {/* MODAL */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(20,20,20,0.95)",
              borderRadius: 20,
              padding: 20,
              maxWidth: 400,
              width: "100%",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div style={{ fontWeight: 900 }}>Quick Tips</div>

              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  opacity: 0.6,
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* TIPS */}
            <div style={{ display: "grid", gap: 10 }}>
              {tips.map((tip, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: 14,
                    opacity: 0.6,
                  }}
                >
                  • {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}