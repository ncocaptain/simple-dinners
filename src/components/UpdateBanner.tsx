import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { APP_VERSION } from "../appVersion";
import { t } from "../i18n";

type RemoteVersion = {
  latestVersion?: string;
  latestBuild?: number;
  message?: string;
  androidUrl?: string;
  iosUrl?: string;
};

function compareVersions(a: string, b: string) {
  const pa = String(a || "0").split(".").map(Number);
  const pb = String(b || "0").split(".").map(Number);

  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;

    if (na > nb) return 1;
    if (na < nb) return -1;
  }

  return 0;
}

function getPlatform() {
  const ua = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";

  return "web";
}

export default function UpdateBanner() {
  const [remote, setRemote] = useState<RemoteVersion | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedVersion = localStorage.getItem(
      "simple-dinners.dismissed-update-version"
    );

    let cancelled = false;

    async function checkForUpdate() {
      try {
        const response = await fetch(`/app-version.json?ts=${Date.now()}`, {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = (await response.json()) as RemoteVersion;
        const latestVersion = data.latestVersion || "";

        if (!latestVersion) return;

        const hasUpdate = compareVersions(latestVersion, APP_VERSION) > 0;

        if (!hasUpdate) return;
        if (dismissedVersion === latestVersion) return;

        if (!cancelled) {
          setRemote(data);
        }
      } catch {
        // Silently ignore update-check failures.
      }
    }

    checkForUpdate();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!remote || dismissed) return null;

  const latestVersion = remote.latestVersion || "";

  const handleDismiss = () => {
    if (latestVersion) {
      localStorage.setItem(
        "simple-dinners.dismissed-update-version",
        latestVersion
      );
    }

    setDismissed(true);
  };

  const handleUpdate = () => {
    const platform = getPlatform();

    if (platform === "android" && remote.androidUrl) {
      window.open(remote.androidUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (platform === "ios" && remote.iosUrl) {
      window.open(remote.iosUrl, "_blank", "noopener,noreferrer");
      return;
    }

    window.location.reload();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "calc(env(safe-area-inset-top, 0px) + 12px)",
        left: 12,
        right: 12,
        zIndex: 5000,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 18,
          padding: 12,
          background: "rgba(15,23,42,0.96)",
          border: "1px solid rgba(34,197,94,0.35)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 12,
          pointerEvents: "auto",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 1000 }}>
            {t("update.title")}
          </div>

          <div
            style={{
              marginTop: 2,
              fontSize: 12,
              opacity: 0.68,
              lineHeight: 1.35,
            }}
          >
            {remote.message || t("update.message")}
          </div>
        </div>

        <button
          type="button"
          onClick={handleUpdate}
          style={{
            border: "1px solid rgba(34,197,94,0.45)",
            background: "rgba(34,197,94,0.14)",
            color: "#86efac",
            borderRadius: 12,
            padding: "9px 12px",
            fontWeight: 900,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {t("update.action")}
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label={t("update.dismiss")}
          style={{
            width: 34,
            height: 34,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.72)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}