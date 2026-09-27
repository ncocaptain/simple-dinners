import { useEffect } from "react";
import type {
  RealtimeChannel,
} from "@supabase/supabase-js";

import { useAuth } from "../auth/AuthContext";
import { supabase } from "../lib/supabase";

import {
  loadCloudWeeklyPlan,
  saveCloudWeeklyPlan,
  type WeeklyPlanSnapshot,
} from "./weeklyPlanSync";

import {
  loadLocalWeeklyPlan,
  weeklyPlanSignature,
  WEEKLY_PLAN_CHANGED_EVENT,
  type WeeklyPlanChangedDetail,
  type WeeklyPlanLocalSnapshot,
} from "./weeklyPlanLocal";

import {
  publishWeeklyPlanSyncState,
  WEEKLY_PLAN_SYNC_RETRY_EVENT,
} from "./weeklyPlanSyncState";

const LOCAL_BACKUP_KEY =
  "simple-dinners.weeklyPlan.pre-cloud-backup.v1";

const CLOUD_BACKUP_KEY =
  "simple-dinners.weeklyPlan.cloud-backup.v1";

const PENDING_LOCAL_KEY_PREFIX =
  "simple-dinners.weeklyPlan.pending.v1";

function pendingLocalKey(
  householdId: string,
) {
  return `${PENDING_LOCAL_KEY_PREFIX}:${householdId}`;
}

function readPendingLocalChanges(
  householdId: string,
) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return (
      localStorage.getItem(
        pendingLocalKey(householdId),
      ) === "1"
    );
  } catch {
    return false;
  }
}

function writePendingLocalChanges(
  householdId: string,
  pending: boolean,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const key = pendingLocalKey(householdId);

    if (pending) {
      localStorage.setItem(key, "1");
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error(
      "Unable to persist weekly-plan pending state:",
      error,
    );
  }
}

type ApplyCloudWeeklyPlan = (
  snapshot: WeeklyPlanLocalSnapshot,
) => void;

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function toLocalSnapshot(
  snapshot: WeeklyPlanSnapshot,
): WeeklyPlanLocalSnapshot {
  return {
    meals: snapshot.meals,
    daySettings: snapshot.daySettings,
    lockedDays: snapshot.lockedDays,
  };
}

function snapshotsMatch(
  first: WeeklyPlanLocalSnapshot,
  second: WeeklyPlanLocalSnapshot,
) {
  return (
    weeklyPlanSignature(first) ===
    weeklyPlanSignature(second)
  );
}

function hasPlanContent(
  snapshot: WeeklyPlanLocalSnapshot,
) {
  const hasMealOrSpecialNight =
    Object.values(snapshot.meals).some(
      (value) => {
        if (!isRecord(value)) {
          return false;
        }

        if ("mode" in value) {
          if (
            value.mode === "leftovers" ||
            value.mode === "freezer"
          ) {
            return true;
          }

          return (
            value.mode === "planned" &&
            Boolean(value.meal)
          );
        }

        return Object.keys(value).length > 0;
      },
    );

  const hasDaySettings =
    Object.keys(snapshot.daySettings).length >
    0;

  const hasLockedDays =
    Object.values(snapshot.lockedDays).some(
      Boolean,
    );

  return (
    hasMealOrSpecialNight ||
    hasDaySettings ||
    hasLockedDays
  );
}

function saveBackup(
  key: string,
  snapshot: WeeklyPlanLocalSnapshot,
) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        savedAt: Date.now(),
        snapshot,
      }),
    );
  } catch (error) {
    console.error(
      "Unable to create weekly-plan backup:",
      error,
    );
  }
}

export function useWeeklyPlanSync(
  applyCloudWeeklyPlan: ApplyCloudWeeklyPlan,
) {
  const {
    isSignedIn,
    householdId,
    householdLoading,
  } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      publishWeeklyPlanSyncState({
        status: "local",
        error: null,
      });

      return;
    }

    if (householdLoading) {
      publishWeeklyPlanSyncState({
        status: "connecting",
        error: null,
      });

      return;
    }

    if (!householdId) {
      publishWeeklyPlanSyncState({
        status: "local",
        error: null,
      });

      return;
    }

    if (!supabase) {
      publishWeeklyPlanSyncState({
        status: "error",
        error: "Cloud sync is not configured.",
      });

      return;
    }

    const activeHouseholdId = householdId;
    const activeSupabase = supabase;

    let cancelled = false;
    let syncReady = false;
    let initializationInProgress = false;
    let hasPendingLocalChanges =
      readPendingLocalChanges(
        activeHouseholdId,
      );

    function markLocalChangesPending() {
      hasPendingLocalChanges = true;
      writePendingLocalChanges(
        activeHouseholdId,
        true,
      );
    }

    function clearLocalChangesPending() {
      hasPendingLocalChanges = false;
      writePendingLocalChanges(
        activeHouseholdId,
        false,
      );
    }

    let uploadTimer: number | null = null;
    let uploadInProgress = false;

    let queuedSnapshot:
      | WeeklyPlanLocalSnapshot
      | null = null;

    let pendingSnapshot:
      | WeeklyPlanLocalSnapshot
      | null = null;

    let cloudPullTimer: number | null = null;
    let cloudPullInProgress = false;
    let cloudPullQueued = false;

    let realtimeChannel:
      | RealtimeChannel
      | null = null;

    function markFailure(message: string) {
      publishWeeklyPlanSyncState({
        status: navigator.onLine
          ? "error"
          : "offline",
        error: message,
      });
    }

    function markOffline() {
      publishWeeklyPlanSyncState({
        status: "offline",
        error: null,
      });
    }

    async function uploadSnapshot(
      snapshot: WeeklyPlanLocalSnapshot,
    ): Promise<boolean> {
      if (cancelled) {
        return false;
      }

      if (!navigator.onLine) {
        markLocalChangesPending();
        markOffline();
        return false;
      }

      if (uploadInProgress) {
        queuedSnapshot = snapshot;
        markLocalChangesPending();
        publishWeeklyPlanSyncState({
          status: "syncing",
          error: null,
        });

        return true;
      }

      uploadInProgress = true;

      publishWeeklyPlanSyncState({
        status: "syncing",
        error: null,
      });

      let result;

      try {
        result = await saveCloudWeeklyPlan(
          activeHouseholdId,
          snapshot,
        );
      } catch (error) {
        uploadInProgress = false;
        markLocalChangesPending();
        markFailure(
          error instanceof Error
            ? error.message
            : "Unable to sync the weekly plan.",
        );

        return false;
      }

      uploadInProgress = false;

      if (cancelled) {
        return false;
      }

      if (result.error) {
        markLocalChangesPending();
        console.error(
          "Weekly-plan cloud upload failed:",
          result.error,
        );

        markFailure(result.error);
        return false;
      }

      if (queuedSnapshot) {
        const nextSnapshot = queuedSnapshot;
        queuedSnapshot = null;

        return uploadSnapshot(nextSnapshot);
      }

      clearLocalChangesPending();
      publishWeeklyPlanSyncState({
        status: "synced",
        error: null,
        lastSyncedAt: Date.now(),
      });

      return true;
    }

    function scheduleUpload(
      snapshot: WeeklyPlanLocalSnapshot,
    ) {
      markLocalChangesPending();
      if (!navigator.onLine) {
        markOffline();
        return;
      }

      publishWeeklyPlanSyncState({
        status: "syncing",
        error: null,
      });

      if (uploadTimer !== null) {
        window.clearTimeout(uploadTimer);
      }

      uploadTimer = window.setTimeout(() => {
        uploadTimer = null;
        void uploadSnapshot(snapshot);
      }, 500);
    }

    async function pullCloudSnapshot() {
      if (cancelled) {
        return;
      }

      if (!navigator.onLine) {
        markOffline();
        return;
      }

      if (
        uploadTimer !== null ||
        uploadInProgress ||
        hasPendingLocalChanges
      ) {
        scheduleCloudPull(400);
        return;
      }

      if (cloudPullInProgress) {
        cloudPullQueued = true;
        return;
      }

      cloudPullInProgress = true;

      publishWeeklyPlanSyncState({
        status: "syncing",
        error: null,
      });

      let result;

      try {
        result = await loadCloudWeeklyPlan(
          activeHouseholdId,
        );
      } catch (error) {
        cloudPullInProgress = false;

        markFailure(
          error instanceof Error
            ? error.message
            : "Unable to receive the household plan.",
        );

        return;
      }

      cloudPullInProgress = false;

      if (cancelled) {
        return;
      }

      if (result.error) {
        console.error(
          "Unable to receive live weekly-plan update:",
          result.error,
        );

        markFailure(result.error);
      } else if (result.data) {
        const cloudSnapshot =
          toLocalSnapshot(result.data);

        const localSnapshot =
          loadLocalWeeklyPlan();

        if (
          !snapshotsMatch(
            localSnapshot,
            cloudSnapshot,
          )
        ) {
          applyCloudWeeklyPlan(
            cloudSnapshot,
          );
        }

        publishWeeklyPlanSyncState({
          status: "synced",
          error: null,
          lastSyncedAt: Date.now(),
        });
      } else {
        const localSnapshot =
          loadLocalWeeklyPlan();

        if (hasPlanContent(localSnapshot)) {
          scheduleUpload(localSnapshot);
        } else {
          publishWeeklyPlanSyncState({
            status: "synced",
            error: null,
            lastSyncedAt: Date.now(),
          });
        }
      }

      if (cloudPullQueued) {
        cloudPullQueued = false;
        scheduleCloudPull(100);
      }
    }

    function scheduleCloudPull(
      delay = 250,
    ) {
      if (cloudPullTimer !== null) {
        window.clearTimeout(
          cloudPullTimer,
        );
      }

      cloudPullTimer = window.setTimeout(
        () => {
          cloudPullTimer = null;
          void pullCloudSnapshot();
        },
        delay,
      );
    }

    function handleWeeklyPlanChanged(
      event: Event,
    ) {
      const customEvent =
        event as CustomEvent<
          WeeklyPlanChangedDetail
        >;

      const detail = customEvent.detail;

      if (
        !detail ||
        detail.source !== "local"
      ) {
        return;
      }

      markLocalChangesPending();
      if (!syncReady) {
        pendingSnapshot = detail.snapshot;

        if (!navigator.onLine) {
          markOffline();
        }

        return;
      }

      scheduleUpload(detail.snapshot);
    }

    function startRealtime() {
      if (realtimeChannel || cancelled) {
        return;
      }

      const channelName = [
        "weekly-plan-household",
        activeHouseholdId,
        Math.random()
          .toString(36)
          .slice(2),
      ].join("-");

      realtimeChannel = activeSupabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table:
              "weekly_plan_snapshots",
            filter:
              `household_id=eq.${activeHouseholdId}`,
          },
          () => {
            scheduleCloudPull();
          },
        )
        .subscribe((status, error) => {
          if (status === "SUBSCRIBED") {
            if (
              hasPendingLocalChanges ||
              uploadTimer !== null ||
              uploadInProgress
            ) {
              publishWeeklyPlanSyncState({
                status: "syncing",
                error: null,
              });
            } else {
              /*
               * Close the small gap between the initial
               * cloud load and the realtime subscription.
               * "Synced" is published by the verified pull.
               */
              scheduleCloudPull(0);
            }

            return;
          }

          if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT"
          ) {
            console.error(
              "Weekly-plan Realtime connection failed:",
              status,
              error,
            );

            markFailure(
              error?.message ??
              "The live sync connection was interrupted.",
            );
          }
        });
    }

    async function restartRealtime() {
      const previousChannel =
        realtimeChannel;

      realtimeChannel = null;

      if (previousChannel) {
        await activeSupabase.removeChannel(
          previousChannel,
        );
      }

      if (!cancelled) {
        startRealtime();
      }
    }

    async function initializeSync() {
      if (
        cancelled ||
        initializationInProgress
      ) {
        return;
      }

      if (!navigator.onLine) {
        markOffline();
        return;
      }

      initializationInProgress = true;

      publishWeeklyPlanSyncState({
        status: "connecting",
        error: null,
      });

      try {
        const localSnapshot =
          loadLocalWeeklyPlan();

        const cloudResult =
          await loadCloudWeeklyPlan(
            activeHouseholdId,
          );

        if (cancelled) {
          return;
        }

        if (cloudResult.error) {
          console.error(
            "Unable to initialize weekly-plan sync:",
            cloudResult.error,
          );

          markFailure(cloudResult.error);
          return;
        }

        const cloudSnapshot =
          cloudResult.data
            ? toLocalSnapshot(
              cloudResult.data,
            )
            : null;

        const localHasContent =
          hasPlanContent(localSnapshot);

        if (!cloudSnapshot) {
          /*
           * There is genuinely no household snapshot yet.
           * Seed it from this device if it has a plan or
           * if this device has a pending local change,
           * including an intentionally empty plan.
           */
          if (
            localHasContent ||
            hasPendingLocalChanges ||
            pendingSnapshot
          ) {
            const snapshotToUpload =
              pendingSnapshot ?? localSnapshot;

            const uploaded =
              await uploadSnapshot(
                snapshotToUpload,
              );

            if (!uploaded || cancelled) {
              return;
            }

            pendingSnapshot = null;
          }
        } else if (
          !snapshotsMatch(
            localSnapshot,
            cloudSnapshot,
          )
        ) {
          /*
           * A cloud row already exists. That row is a
           * legitimate household state even when empty.
           *
           * Only overwrite it when this device has a
           * real unsynced local edit.
           */
          if (
            hasPendingLocalChanges ||
            pendingSnapshot
          ) {
            saveBackup(
              CLOUD_BACKUP_KEY,
              cloudSnapshot,
            );

            const snapshotToUpload =
              pendingSnapshot ?? localSnapshot;

            const uploaded =
              await uploadSnapshot(
                snapshotToUpload,
              );

            if (!uploaded || cancelled) {
              return;
            }

            pendingSnapshot = null;
          } else {
            saveBackup(
              LOCAL_BACKUP_KEY,
              localSnapshot,
            );

            applyCloudWeeklyPlan(
              cloudSnapshot,
            );
          }
        } else if (hasPendingLocalChanges) {
          /*
           * Local and cloud already match, so any
           * persisted dirty marker is stale.
           */
          clearLocalChangesPending();
          pendingSnapshot = null;
        }

        syncReady = true;
        startRealtime();

        if (pendingSnapshot) {
          const latestSnapshot =
            pendingSnapshot;

          pendingSnapshot = null;

          scheduleUpload(
            latestSnapshot,
          );
        }
      } finally {
        initializationInProgress = false;
      }
    }

    function handleRetry() {
      if (cancelled) {
        return;
      }

      if (!navigator.onLine) {
        markOffline();
        return;
      }

      publishWeeklyPlanSyncState({
        status: "connecting",
        error: null,
      });

      if (!syncReady) {
        void initializeSync();
        return;
      }

      void restartRealtime();

      if (hasPendingLocalChanges) {
        scheduleUpload(
          loadLocalWeeklyPlan(),
        );
      } else {
        scheduleCloudPull(0);
      }
    }

    function handleOnline() {
      handleRetry();
    }

    function handleOffline() {
      markOffline();
    }

    window.addEventListener(
      WEEKLY_PLAN_CHANGED_EVENT,
      handleWeeklyPlanChanged,
    );

    window.addEventListener(
      WEEKLY_PLAN_SYNC_RETRY_EVENT,
      handleRetry,
    );

    window.addEventListener(
      "online",
      handleOnline,
    );

    window.addEventListener(
      "offline",
      handleOffline,
    );

    void initializeSync();

    return () => {
      cancelled = true;
      syncReady = false;

      window.removeEventListener(
        WEEKLY_PLAN_CHANGED_EVENT,
        handleWeeklyPlanChanged,
      );

      window.removeEventListener(
        WEEKLY_PLAN_SYNC_RETRY_EVENT,
        handleRetry,
      );

      window.removeEventListener(
        "online",
        handleOnline,
      );

      window.removeEventListener(
        "offline",
        handleOffline,
      );

      if (uploadTimer !== null) {
        window.clearTimeout(uploadTimer);
      }

      if (cloudPullTimer !== null) {
        window.clearTimeout(
          cloudPullTimer,
        );
      }

      if (realtimeChannel) {
        void activeSupabase.removeChannel(
          realtimeChannel,
        );
      }
    };
  }, [
    applyCloudWeeklyPlan,
    householdId,
    householdLoading,
    isSignedIn,
  ]);
}