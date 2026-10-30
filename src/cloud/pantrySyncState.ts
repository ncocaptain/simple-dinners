import { useSyncExternalStore } from "react";

export type PantrySyncStatus =
  | "local"
  | "connecting"
  | "syncing"
  | "synced"
  | "offline"
  | "error";

export type PantrySyncSnapshot = {
  status: PantrySyncStatus;
  error: string | null;
  lastSyncedAt: number | null;
};

export const PANTRY_SYNC_RETRY_EVENT =
  "simple-dinners:pantry-sync-retry";

let snapshot: PantrySyncSnapshot = {
  status: "local",
  error: null,
  lastSyncedAt: null,
};

const listeners = new Set<() => void>();

function getSnapshot() {
  return snapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function publishPantrySyncState(
  update: Partial<PantrySyncSnapshot>,
) {
  const next = {
    ...snapshot,
    ...update,
  };

  if (
    next.status === snapshot.status &&
    next.error === snapshot.error &&
    next.lastSyncedAt === snapshot.lastSyncedAt
  ) {
    return;
  }

  snapshot = next;
  listeners.forEach((listener) => listener());
}

export function usePantrySyncStatus() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
}

export function requestPantrySyncRetry() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new Event(PANTRY_SYNC_RETRY_EVENT),
  );
}
