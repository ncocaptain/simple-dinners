import { useEffect } from "react";
import type {
  RealtimeChannel,
} from "@supabase/supabase-js";
import type { PantryItem } from "../core/types";
import {
  PANTRY_UPDATED_EVENT,
  loadPantryItems,
  pantrySignature,
  type PantryChangedDetail,
} from "../core/pantryStore";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../lib/supabase";
import {
  loadCloudPantry,
  saveCloudPantry,
} from "./pantrySync";
import {
  requestPantryConflict,
} from "./pantryConflictState";
import {
  PANTRY_SYNC_RETRY_EVENT,
  publishPantrySyncState,
} from "./pantrySyncState";

const LOCAL_BACKUP_KEY =
  "simple-dinners.pantry.pre-cloud-backup.v1";

const CLOUD_BACKUP_KEY =
  "simple-dinners.pantry.cloud-backup.v1";

type ApplyCloudPantry = (
  items: PantryItem[],
) => void;

function pantriesMatch(
  first: PantryItem[],
  second: PantryItem[],
) {
  return (
    pantrySignature(first) ===
    pantrySignature(second)
  );
}

function saveBackup(
  key: string,
  items: PantryItem[],
) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        savedAt: Date.now(),
        items,
      }),
    );
  } catch (error) {
    console.error(
      "Unable to create pantry backup:",
      error,
    );
  }
}

export function usePantrySync(
  applyCloudPantry: ApplyCloudPantry,
  enabled = true,
) {
  const {
    isSignedIn,
    householdId,
    householdLoading,
  } = useAuth();

  useEffect(() => {
    if (!enabled) {
      publishPantrySyncState({
        status: "local",
        error: null,
      });
      return;
    }

    if (!isSignedIn) {
      publishPantrySyncState({
        status: "local",
        error: null,
      });
      return;
    }

    if (householdLoading) {
      publishPantrySyncState({
        status: "connecting",
        error: null,
      });
      return;
    }

    if (!householdId) {
      publishPantrySyncState({
        status: "local",
        error: null,
      });
      return;
    }

    if (!supabase) {
      publishPantrySyncState({
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
    let hasPendingLocalChanges = false;
    let pendingItems: PantryItem[] | null = null;

    let uploadTimer: number | null = null;
    let uploadInProgress = false;
    let queuedItems: PantryItem[] | null = null;

    let cloudPullTimer: number | null = null;
    let cloudPullInProgress = false;
    let cloudPullQueued = false;

    let realtimeChannel:
      | RealtimeChannel
      | null = null;

    function markFailure(message: string) {
      publishPantrySyncState({
        status: navigator.onLine
          ? "error"
          : "offline",
        error: message,
      });
    }

    function markOffline() {
      publishPantrySyncState({
        status: "offline",
        error: null,
      });
    }

    async function uploadPantry(
      items: PantryItem[],
    ): Promise<boolean> {
      if (cancelled) {
        return false;
      }

      if (!navigator.onLine) {
        hasPendingLocalChanges = true;
        markOffline();
        return false;
      }

      if (uploadInProgress) {
        queuedItems = items;
        hasPendingLocalChanges = true;
        publishPantrySyncState({
          status: "syncing",
          error: null,
        });
        return true;
      }

      uploadInProgress = true;
      publishPantrySyncState({
        status: "syncing",
        error: null,
      });

      let result;

      try {
        result = await saveCloudPantry(
          activeHouseholdId,
          items,
        );
      } catch (error) {
        uploadInProgress = false;
        hasPendingLocalChanges = true;
        markFailure(
          error instanceof Error
            ? error.message
            : "Unable to sync the pantry.",
        );
        return false;
      }

      uploadInProgress = false;

      if (cancelled) {
        return false;
      }

      if (result.error) {
        hasPendingLocalChanges = true;
        markFailure(result.error);
        return false;
      }

      if (queuedItems) {
        const nextItems = queuedItems;
        queuedItems = null;
        return uploadPantry(nextItems);
      }

      hasPendingLocalChanges = false;
      publishPantrySyncState({
        status: "synced",
        error: null,
        lastSyncedAt: Date.now(),
      });

      return true;
    }

    function scheduleUpload(
      items: PantryItem[],
    ) {
      hasPendingLocalChanges = true;

      if (!navigator.onLine) {
        markOffline();
        return;
      }

      publishPantrySyncState({
        status: "syncing",
        error: null,
      });

      if (uploadTimer !== null) {
        window.clearTimeout(uploadTimer);
      }

      uploadTimer = window.setTimeout(() => {
        uploadTimer = null;
        void uploadPantry(items);
      }, 500);
    }

    function scheduleCloudPull(
      delay = 250,
    ) {
      if (cloudPullTimer !== null) {
        window.clearTimeout(cloudPullTimer);
      }

      cloudPullTimer = window.setTimeout(
        () => {
          cloudPullTimer = null;
          void pullCloudPantry();
        },
        delay,
      );
    }

    async function pullCloudPantry() {
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
      publishPantrySyncState({
        status: "syncing",
        error: null,
      });

      let result;

      try {
        result = await loadCloudPantry(
          activeHouseholdId,
        );
      } catch (error) {
        cloudPullInProgress = false;
        markFailure(
          error instanceof Error
            ? error.message
            : "Unable to receive the household pantry.",
        );
        return;
      }

      cloudPullInProgress = false;

      if (cancelled) {
        return;
      }

      if (result.error) {
        markFailure(result.error);
      } else if (result.data) {
        const cloudItems = result.data.items;
        const localItems = loadPantryItems();

        if (
          !pantriesMatch(
            localItems,
            cloudItems,
          )
        ) {
          applyCloudPantry(cloudItems);
        }

        publishPantrySyncState({
          status: "synced",
          error: null,
          lastSyncedAt: Date.now(),
        });
      } else {
        const localItems = loadPantryItems();

        if (localItems.length > 0) {
          scheduleUpload(localItems);
        } else {
          publishPantrySyncState({
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

    function handlePantryChanged(
      event: Event,
    ) {
      const customEvent =
        event as CustomEvent<PantryChangedDetail>;

      const detail = customEvent.detail;

      if (
        !detail ||
        detail.source !== "local"
      ) {
        return;
      }

      hasPendingLocalChanges = true;

      if (!syncReady) {
        pendingItems = detail.items;

        if (!navigator.onLine) {
          markOffline();
        }

        return;
      }

      scheduleUpload(detail.items);
    }

    function startRealtime() {
      if (
        realtimeChannel ||
        cancelled
      ) {
        return;
      }

      realtimeChannel = activeSupabase
        .channel(
          [
            "pantry-household",
            activeHouseholdId,
            Math.random()
              .toString(36)
              .slice(2),
          ].join("-"),
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "pantry_snapshots",
            filter:
              `household_id=eq.${activeHouseholdId}`,
          },
          () => {
            scheduleCloudPull();
          },
        )
        .subscribe((status, error) => {
          if (status === "SUBSCRIBED") {
            publishPantrySyncState({
              status: "synced",
              error: null,
              lastSyncedAt: Date.now(),
            });
            return;
          }

          if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT"
          ) {
            console.error(
              "Pantry Realtime connection failed:",
              status,
              error,
            );
            markFailure(
              error?.message ??
              "The live pantry sync connection was interrupted.",
            );
          }
        });
    }

    async function restartRealtime() {
      const previous =
        realtimeChannel;

      realtimeChannel = null;

      if (previous) {
        await activeSupabase.removeChannel(
          previous,
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
      publishPantrySyncState({
        status: "connecting",
        error: null,
      });

      try {
        const localItems =
          loadPantryItems();

        const cloudResult =
          await loadCloudPantry(
            activeHouseholdId,
          );

        if (cancelled) {
          return;
        }

        if (cloudResult.error) {
          markFailure(cloudResult.error);
          return;
        }

        const cloudItems =
          cloudResult.data?.items ?? null;

        const localHasItems =
          localItems.length > 0;

        const cloudHasItems =
          Boolean(
            cloudItems &&
            cloudItems.length > 0,
          );

        if (
          localHasItems &&
          !cloudHasItems
        ) {
          const uploaded =
            await uploadPantry(
              localItems,
            );

          if (!uploaded || cancelled) {
            return;
          }
        }

        if (
          !localHasItems &&
          cloudItems &&
          cloudHasItems
        ) {
          applyCloudPantry(
            cloudItems,
          );
        }

        if (
          localHasItems &&
          cloudItems &&
          cloudHasItems &&
          !pantriesMatch(
            localItems,
            cloudItems,
          )
        ) {
          if (
            hasPendingLocalChanges ||
            pendingItems
          ) {
            saveBackup(
              CLOUD_BACKUP_KEY,
              cloudItems,
            );

            const uploaded =
              await uploadPantry(
                localItems,
              );

            if (!uploaded || cancelled) {
              return;
            }

            pendingItems = null;
          } else {
            const choice =
              await requestPantryConflict(
                localItems,
                cloudItems,
              );

            if (cancelled) {
              return;
            }

            if (choice === "cloud") {
              saveBackup(
                LOCAL_BACKUP_KEY,
                localItems,
              );
              applyCloudPantry(
                cloudItems,
              );
            } else {
              saveBackup(
                CLOUD_BACKUP_KEY,
                cloudItems,
              );

              const uploaded =
                await uploadPantry(
                  localItems,
                );

              if (!uploaded || cancelled) {
                return;
              }
            }
          }
        }

        syncReady = true;
        startRealtime();

        publishPantrySyncState({
          status: "synced",
          error: null,
          lastSyncedAt: Date.now(),
        });

        if (pendingItems) {
          const latestItems =
            pendingItems;

          pendingItems = null;
          scheduleUpload(
            latestItems,
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

      publishPantrySyncState({
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
          loadPantryItems(),
        );
      } else {
        scheduleCloudPull(0);
      }
    }

    window.addEventListener(
      PANTRY_UPDATED_EVENT,
      handlePantryChanged,
    );
    window.addEventListener(
      PANTRY_SYNC_RETRY_EVENT,
      handleRetry,
    );
    window.addEventListener(
      "online",
      handleRetry,
    );
    window.addEventListener(
      "offline",
      markOffline,
    );

    void initializeSync();

    return () => {
      cancelled = true;
      syncReady = false;

      window.removeEventListener(
        PANTRY_UPDATED_EVENT,
        handlePantryChanged,
      );
      window.removeEventListener(
        PANTRY_SYNC_RETRY_EVENT,
        handleRetry,
      );
      window.removeEventListener(
        "online",
        handleRetry,
      );
      window.removeEventListener(
        "offline",
        markOffline,
      );

      if (uploadTimer !== null) {
        window.clearTimeout(uploadTimer);
      }

      if (cloudPullTimer !== null) {
        window.clearTimeout(cloudPullTimer);
      }

      if (realtimeChannel) {
        void activeSupabase.removeChannel(
          realtimeChannel,
        );
      }
    };
  }, [
    applyCloudPantry,
    enabled,
    householdId,
    householdLoading,
    isSignedIn,
  ]);
}
