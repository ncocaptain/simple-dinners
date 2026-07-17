import { useSyncExternalStore } from "react";

export type CookbookSyncStatus =
  | "local"
  | "connecting"
  | "syncing"
  | "synced"
  | "offline"
  | "error";

export type CookbookSyncSnapshot = {
  status: CookbookSyncStatus;
  error: string | null;
  lastSyncedAt: number | null;
};

export const COOKBOOK_SYNC_RETRY_EVENT =
  "simple-dinners:cookbook-sync-retry";

let snapshot: CookbookSyncSnapshot = {
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

export function publishCookbookSyncState(
  update: Partial<CookbookSyncSnapshot>,
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

export function useCookbookSyncStatus() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
}

export function requestCookbookSyncRetry() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new Event(COOKBOOK_SYNC_RETRY_EVENT),
  );
}