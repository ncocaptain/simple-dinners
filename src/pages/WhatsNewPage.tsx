export default function WhatsNewPage() {
  const updates = [
    "New: Import from URL now opens a review screen before saving",
    "New: Edit imported recipes before adding them to your cookbook",
    "Improved: Smoother import flow with auto-open review when importing from the top bar",
    "Improved: More reliable recipe importing across more websites",
    "Fixed: Android import issues",
    "Improved: Unified recipe page design across Week Plan and Cookbook",
    "Improved: Shopping list behavior from imported recipes",
    "Improved: Back navigation between recipe sources",
    "Improved: Cook Mode with smarter ingredient highlighting",
    "New: Prep-friendly ingredient tracking in Cook Mode",
    "General bug fixes and performance improvements",
  ];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
      <h2 style={{ fontSize: 30, fontWeight: 900, marginBottom: 10 }}>
        What&apos;s New in 1.1.0
      </h2>
      <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: 24 }}>
        Thanks for using Simple Dinners. This update makes importing recipes
        smoother, improves Cook Mode, and adds helpful polish across the app.
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