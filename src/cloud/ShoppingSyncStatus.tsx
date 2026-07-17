import {
  AlertTriangle,
  CheckCircle2,
  CloudOff,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { getStoredLanguage } from "../i18n";
import {
  requestShoppingSyncRetry,
  useShoppingSyncStatus,
  type ShoppingSyncStatus as SyncStatus,
} from "./shoppingSyncState";
import "./ShoppingSyncStatus.css";

type StatusCopy = {
  label: string;
  retry: string;
};

const ENGLISH_COPY: Record<SyncStatus, StatusCopy> = {
  local: {
    label: "Saved on this device",
    retry: "Retry",
  },
  connecting: {
    label: "Connecting…",
    retry: "Retry",
  },
  syncing: {
    label: "Syncing…",
    retry: "Retry",
  },
  synced: {
    label: "Synced",
    retry: "Retry",
  },
  offline: {
    label: "Offline — saved here",
    retry: "Retry",
  },
  error: {
    label: "Sync needs attention",
    retry: "Retry",
  },
};

const SPANISH_COPY: Record<SyncStatus, StatusCopy> = {
  local: {
    label: "Guardado en este dispositivo",
    retry: "Reintentar",
  },
  connecting: {
    label: "Conectando…",
    retry: "Reintentar",
  },
  syncing: {
    label: "Sincronizando…",
    retry: "Reintentar",
  },
  synced: {
    label: "Sincronizado",
    retry: "Reintentar",
  },
  offline: {
    label: "Sin conexión — guardado aquí",
    retry: "Reintentar",
  },
  error: {
    label: "La sincronización necesita atención",
    retry: "Reintentar",
  },
};

export function ShoppingSyncStatus() {
  const { isSignedIn, householdId } = useAuth();
  const { status, error, lastSyncedAt } =
    useShoppingSyncStatus();

  if (!isSignedIn || !householdId) {
    return null;
  }

  const copy =
    getStoredLanguage() === "es"
      ? SPANISH_COPY[status]
      : ENGLISH_COPY[status];

  const showRetry =
    status === "offline" || status === "error";

  const title = error
    ? error
    : lastSyncedAt
      ? `Last synced ${new Date(
        lastSyncedAt,
      ).toLocaleTimeString()}`
      : undefined;

  const Icon =
    status === "synced"
      ? CheckCircle2
      : status === "offline"
        ? CloudOff
        : status === "error"
          ? AlertTriangle
          : LoaderCircle;

  return (
    <div
      className={`sd-sync-status sd-sync-status-${status}`}
      role="status"
      aria-live="polite"
      title={title}
    >
      <Icon
        size={15}
        aria-hidden="true"
        className={
          status === "connecting" ||
            status === "syncing"
            ? "sd-sync-status-spinner"
            : undefined
        }
      />

      <span>{copy.label}</span>

      {showRetry && (
        <button
          type="button"
          onClick={requestShoppingSyncRetry}
        >
          <RefreshCw
            size={13}
            aria-hidden="true"
          />

          {copy.retry}
        </button>
      )}
    </div>
  );
}