import { useState } from "react";

type Category = { label: string; query: string };

const CATEGORIES: Category[] = [
  { label: "🍔 Food", query: "restaurants" },
  { label: "☕ Coffee", query: "coffee" },
  { label: "🛒 Grocery", query: "grocery store" },
  { label: "⛽ Gas", query: "gas station" },
  { label: "💊 Pharmacy", query: "pharmacy" },
];

const isIOS = (): boolean => /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = (): boolean => /Android/.test(navigator.userAgent);
const isMobile = (): boolean => isIOS() || isAndroid();

function tryOpenWithFallback(primaryUrl: string, fallbackUrl: string) {
  const startedAt = Date.now();

  // Try native/primary
  window.location.href = primaryUrl;

  // Fallback if it didn't switch apps
  setTimeout(() => {
    if (Date.now() - startedAt < 1200) {
      window.location.href = fallbackUrl;
    }
  }, 900);
}

export default function NearbyButtons() {
  const [loading, setLoading] = useState(false);

  const openNearby = (query: string) => {
    if (!navigator.geolocation) {
      alert("Location not supported.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setLoading(false);

        const q = encodeURIComponent(query);

        // Web fallback (works everywhere)
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${q}&center=${latitude},${longitude}`;

        // Desktop: new tab
        if (!isMobile()) {
          window.open(webUrl, "_blank", "noopener,noreferrer");
          return;
        }

        // Mobile: try native first
        if (isIOS()) {
          const appleMaps = `https://maps.apple.com/?q=${q}&ll=${latitude},${longitude}`;
          tryOpenWithFallback(appleMaps, webUrl);
          return;
        }

        // Android
        const geoIntent = `geo:${latitude},${longitude}?q=${q}`;
        tryOpenWithFallback(geoIntent, webUrl);
      },
      (err: GeolocationPositionError) => {
        setLoading(false);
        console.error(err);
        alert("Could not get your location. Check permissions and try again.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontWeight: 700 }}>Find nearby:</div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.query}
            type="button"
            disabled={loading}
            onClick={() => openNearby(c.query)}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "white",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
              fontSize: 14,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading && <div style={{ opacity: 0.7 }}>Getting your location…</div>}
    </div>
  );
}