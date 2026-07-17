import { useSyncExternalStore } from "react";

export type ShoppingSyncStatus =
  | "local"
  | "connecting"
  | "syncing"
  | "synced"
  | "offline"
  | "error";

export type ShoppingSyncSnapshot = {
  status: ShoppingSyncStatus;
  error: string | null;
  lastSyncedAt: number | null;
};

export const SHOPPING_SYNC_RETRY_EVENT =
  "simple-dinners:shopping-sync-retry";

let snapshot: ShoppingSyncSnapshot = {
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

  return () => {
    listeners.delete(listener);
  };
}

export function publishShoppingSyncState(
  update: Partial<ShoppingSyncSnapshot>,
) {
  const nextSnapshot = {
    ...snapshot,
    ...update,
  };

  if (
    nextSnapshot.status === snapshot.status &&
    nextSnapshot.error === snapshot.error &&
    nextSnapshot.lastSyncedAt ===
    snapshot.lastSyncedAt
  ) {
    return;
  }

  snapshot = nextSnapshot;

  listeners.forEach((listener) => {
    listener();
  });
}

export function useShoppingSyncStatus() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
}

export function requestShoppingSyncRetry() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new Event(SHOPPING_SYNC_RETRY_EVENT),
  );
}