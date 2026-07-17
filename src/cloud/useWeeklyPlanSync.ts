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
  requestWeeklyPlanConflict,
} from "./weeklyPlanConflictState";

const LOCAL_BACKUP_KEY =
  "simple-dinners.weeklyPlan.pre-cloud-backup.v1";

const CLOUD_BACKUP_KEY =
  "simple-dinners.weeklyPlan.cloud-backup.v1";

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

        /*
         * Current PlannedDay format.
         */
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

        /*
         * Legacy format where the stored value
         * was the meal itself.
         */
        return Object.keys(value).length > 0;
      },
    );

  const hasDaySettings =
    Object.keys(snapshot.daySettings).length > 0;

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
    if (
      !isSignedIn ||
      householdLoading ||
      !householdId ||
      !supabase
    ) {
      return;
    }

    const activeHouseholdId = householdId;
    const activeSupabase = supabase;

    let cancelled = false;
    let syncReady = false;
    let initializationInProgress = false;
    let hasPendingLocalChanges = false;

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

    async function uploadSnapshot(
      snapshot: WeeklyPlanLocalSnapshot,
    ): Promise<boolean> {
      if (cancelled) {
        return false;
      }

      if (!navigator.onLine) {
        hasPendingLocalChanges = true;
        return false;
      }

      if (uploadInProgress) {
        queuedSnapshot = snapshot;
        hasPendingLocalChanges = true;
        return true;
      }

      uploadInProgress = true;

      let result;

      try {
        result = await saveCloudWeeklyPlan(
          activeHouseholdId,
          snapshot,
        );
      } catch (error) {
        uploadInProgress = false;
        hasPendingLocalChanges = true;

        console.error(
          "Unable to sync the weekly plan:",
          error,
        );

        return false;
      }

      uploadInProgress = false;

      if (cancelled) {
        return false;
      }

      if (result.error) {
        hasPendingLocalChanges = true;

        console.error(
          "Weekly-plan cloud upload failed:",
          result.error,
        );

        return false;
      }

      if (queuedSnapshot) {
        const nextSnapshot = queuedSnapshot;
        queuedSnapshot = null;

        return uploadSnapshot(nextSnapshot);
      }

      hasPendingLocalChanges = false;
      return true;
    }

    function scheduleUpload(
      snapshot: WeeklyPlanLocalSnapshot,
    ) {
      hasPendingLocalChanges = true;

      if (!navigator.onLine) {
        return;
      }

      if (uploadTimer !== null) {
        window.clearTimeout(uploadTimer);
      }

      uploadTimer = window.setTimeout(() => {
        uploadTimer = null;
        void uploadSnapshot(snapshot);
      }, 500);
    }

    async function pullCloudSnapshot() {
      if (cancelled || !navigator.onLine) {
        return;
      }

      /*
       * An unsaved local edit takes priority over
       * an older cloud snapshot.
       */
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

      let result;

      try {
        result = await loadCloudWeeklyPlan(
          activeHouseholdId,
        );
      } catch (error) {
        cloudPullInProgress = false;

        console.error(
          "Unable to receive the household plan:",
          error,
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
      } else {
        /*
         * Restore the household row if it was removed
         * while this device still has a useful plan.
         */
        const localSnapshot =
          loadLocalWeeklyPlan();

        if (hasPlanContent(localSnapshot)) {
          scheduleUpload(localSnapshot);
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

      /*
       * Never upload a snapshot that this device
       * just received from the household.
       */
      if (
        !detail ||
        detail.source !== "local"
      ) {
        return;
      }

      hasPendingLocalChanges = true;

      if (!syncReady) {
        pendingSnapshot = detail.snapshot;
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
          if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT"
          ) {
            console.error(
              "Weekly-plan Realtime connection failed:",
              status,
              error,
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
        initializationInProgress ||
        !navigator.onLine
      ) {
        return;
      }

      initializationInProgress = true;

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

        const cloudHasContent =
          cloudSnapshot
            ? hasPlanContent(
              cloudSnapshot,
            )
            : false;

        /*
         * This household has no useful cloud plan yet.
         * Preserve and upload this device's useful plan.
         */
        if (
          localHasContent &&
          !cloudHasContent
        ) {
          const uploaded =
            await uploadSnapshot(
              localSnapshot,
            );

          if (!uploaded || cancelled) {
            return;
          }
        }

        /*
         * This device has no useful plan, but the
         * household already does.
         */
        if (
          !localHasContent &&
          cloudSnapshot &&
          cloudHasContent
        ) {
          applyCloudWeeklyPlan(
            cloudSnapshot,
          );
        }

        /*
         * Both sides contain useful but different
         * weekly plans.
         */
        if (
          localHasContent &&
          cloudSnapshot &&
          cloudHasContent &&
          !snapshotsMatch(
            localSnapshot,
            cloudSnapshot,
          )
        ) {
          /*
           * Local edits made while disconnected or
           * while initialization was running take
           * priority when reconnecting.
           */
          if (
            hasPendingLocalChanges ||
            pendingSnapshot
          ) {
            saveBackup(
              CLOUD_BACKUP_KEY,
              cloudSnapshot,
            );

            const uploaded =
              await uploadSnapshot(
                localSnapshot,
              );

            if (!uploaded || cancelled) {
              return;
            }

            pendingSnapshot = null;
          } else {
            const conflictChoice =
              await requestWeeklyPlanConflict(
                localSnapshot,
                cloudSnapshot,
              );

            if (cancelled) {
              return;
            }

            if (
              conflictChoice === "cloud"
            ) {
              saveBackup(
                LOCAL_BACKUP_KEY,
                localSnapshot,
              );

              applyCloudWeeklyPlan(
                cloudSnapshot,
              );
            } else {
              saveBackup(
                CLOUD_BACKUP_KEY,
                cloudSnapshot,
              );

              const uploaded =
                await uploadSnapshot(
                  localSnapshot,
                );

              if (
                !uploaded ||
                cancelled
              ) {
                return;
              }
            }
          }
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

    function handleOnline() {
      if (cancelled) {
        return;
      }

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

    function handleOffline() {
      /*
       * Local changes continue saving normally.
       * They will upload after the online event.
       */
    }

    window.addEventListener(
      WEEKLY_PLAN_CHANGED_EVENT,
      handleWeeklyPlanChanged,
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