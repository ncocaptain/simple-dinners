import { useSyncExternalStore } from "react";

export type WeeklyPlanSyncStatus =
  | "local"
  | "connecting"
  | "syncing"
  | "synced"
  | "offline"
  | "error";

export type WeeklyPlanSyncSnapshot = {
  status: WeeklyPlanSyncStatus;
  error: string | null;
  lastSyncedAt: number | null;
};

export const WEEKLY_PLAN_SYNC_RETRY_EVENT =
  "simple-dinners:weekly-plan-sync-retry";

let snapshot: WeeklyPlanSyncSnapshot = {
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

export function publishWeeklyPlanSyncState(
  update: Partial<WeeklyPlanSyncSnapshot>,
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

export function useWeeklyPlanSyncStatus() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
}

export function requestWeeklyPlanSyncRetry() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new Event(
      WEEKLY_PLAN_SYNC_RETRY_EVENT,
    ),
  );
}