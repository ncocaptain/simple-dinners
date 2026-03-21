export default function WhatsNewPage() {
  const updates = [
    "Improved recipe importing",
    "Fixed Android import issues",
    "Unified recipe page design across Week Plan and Cookbook",
    "Better shopping list behavior from imported recipes",
    "Improved back navigation between recipe sources",
    "Upgraded Cook Mode with smarter ingredient highlighting",
    "Added prep-friendly ingredient tracking in Cook Mode",
    "General bug fixes and polish throughout the app",
  ];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
      <h2 style={{ fontSize: 30, fontWeight: 900, marginBottom: 10 }}>
        What&apos;s New in 1.1.0
      </h2>
      <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: 24 }}>
        Thanks for testing Simple Dinners. Here’s what’s improved in this update.
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        {updates.map((item, i) => (
          <div
            key={i}
            style={{
              padding: "16px 18px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}