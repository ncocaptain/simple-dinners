import React from "react";

export type TutorialStep = {
  title: string;
  body: string;
  targetLabel?: string;
};

type Props = {
  open: boolean;
  stepIndex: number;
  steps: TutorialStep[];
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onFinish: () => void;
};

export default function FirstTimeTutorial({
  open,
  stepIndex,
  steps,
  onNext,
  onBack,
  onSkip,
  onFinish,
}: Props) {
  if (!open || !steps.length) return null;

  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(2,6,23,0.76)",
    zIndex: 5000,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "16px",
    overflowY: "auto",
    boxSizing: "border-box",
  };

  const cardStyle: React.CSSProperties = {
    width: "min(100%, 420px)",
    maxHeight: "calc(100dvh - 32px)",
    marginTop: 8,
    display: "flex",
    flexDirection: "column",
    borderRadius: 22,
    background: "linear-gradient(180deg, #162338 0%, #132033 100%)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.42)",
    color: "#f8fafc",
    overflow: "hidden",
  };

  const scrollAreaStyle: React.CSSProperties = {
    padding: 18,
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
  };

  const topRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  };

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: 12,
    fontWeight: 800,
    opacity: 0.95,
    letterSpacing: 0.4,
  };

  const dotsWrapStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  const titleStyle: React.CSSProperties = {
    margin: "14px 0 8px",
    fontSize: 22,
    lineHeight: 1.08,
    fontWeight: 1000,
    letterSpacing: -0.3,
  };

  const bodyStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.5,
    opacity: 0.9,
  };

  const targetStyle: React.CSSProperties = {
    marginTop: 14,
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(20,184,166,0.14)",
    border: "1px solid rgba(20,184,166,0.28)",
    fontSize: 13,
    fontWeight: 800,
    color: "#ccfbf1",
  };

  const footerStyle: React.CSSProperties = {
    padding: "14px 18px 16px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,16,28,0.9)",
    display: "grid",
    gap: 10,
    flexShrink: 0,
  };

  const btnBase: React.CSSProperties = {
    width: "100%",
    minHeight: 46,
    padding: "11px 14px",
    borderRadius: 14,
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 15,
  };

  const primaryBtn: React.CSSProperties = {
    ...btnBase,
    border: "1px solid rgba(20,184,166,0.45)",
    background: "rgba(20,184,166,0.24)",
    color: "#f8fafc",
  };

  const secondaryBtn: React.CSSProperties = {
    ...btnBase,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#f8fafc",
  };

  const ghostBtn: React.CSSProperties = {
    ...btnBase,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    color: "rgba(248,250,252,0.88)",
    fontWeight: 800,
  };

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <div style={scrollAreaStyle}>
          <div style={topRowStyle}>
            <div style={badgeStyle}>QUICK TOUR</div>

            <div style={dotsWrapStyle} aria-hidden="true">
              {steps.map((_, index) => {
                const active = index === stepIndex;

                return (
                  <span
                    key={index}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: active ? "#22d3ee" : "rgba(255,255,255,0.35)",
                      boxShadow: active
                        ? "0 0 0 3px rgba(34,211,238,0.14)"
                        : "none",
                      display: "inline-block",
                    }}
                  />
                );
              })}
            </div>
          </div>

          <h2 style={titleStyle}>{step.title}</h2>
          <p style={bodyStyle}>{step.body}</p>

          {!!step.targetLabel && (
            <div style={targetStyle}>✨ {step.targetLabel}</div>
          )}

          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              opacity: 0.55,
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            Step {stepIndex + 1} of {steps.length}
          </div>
        </div>

        <div style={footerStyle}>
          {!isLast ? (
            <button type="button" onClick={onNext} style={primaryBtn}>
              Next →
            </button>
          ) : (
            <button type="button" onClick={onFinish} style={primaryBtn}>
              Start Planning
            </button>
          )}

          {!isFirst && (
            <button type="button" onClick={onBack} style={secondaryBtn}>
              Back
            </button>
          )}

          <button type="button" onClick={onSkip} style={ghostBtn}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}