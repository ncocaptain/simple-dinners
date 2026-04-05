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
    background: "rgba(2,6,23,0.72)",
    zIndex: 5000,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "24px 16px",
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 380,
    marginTop: "12vh",
    padding: 18,
    borderRadius: 20,
    background: "#132033",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.42)",
    color: "#f8fafc",
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
    opacity: 0.9,
  };

  const titleStyle: React.CSSProperties = {
    margin: "14px 0 8px",
    fontSize: 24,
    lineHeight: 1.1,
    fontWeight: 1000,
  };

  const bodyStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.55,
    opacity: 0.88,
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
    marginTop: 18,
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  };

  const primaryBtn: React.CSSProperties = {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(20,184,166,0.45)",
    background: "rgba(20,184,166,0.24)",
    color: "#f8fafc",
    fontWeight: 900,
    cursor: "pointer",
  };

  const secondaryBtn: React.CSSProperties = {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#f8fafc",
    fontWeight: 800,
    cursor: "pointer",
  };

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div style={badgeStyle}>
            Step {stepIndex + 1} of {steps.length}
          </div>

          <button type="button" onClick={onSkip} style={secondaryBtn}>
            Skip
          </button>
        </div>

        <h2 style={titleStyle}>{step.title}</h2>
        <p style={bodyStyle}>{step.body}</p>

        {!!step.targetLabel && <div style={targetStyle}>Look for: {step.targetLabel}</div>}

        <div style={footerStyle}>
          {!isFirst && (
            <button type="button" onClick={onBack} style={secondaryBtn}>
              Back
            </button>
          )}

          {!isLast ? (
            <button type="button" onClick={onNext} style={primaryBtn}>
              Next
            </button>
          ) : (
            <button type="button" onClick={onFinish} style={primaryBtn}>
              Start Planning
            </button>
          )}
        </div>
      </div>
    </div>
  );
}