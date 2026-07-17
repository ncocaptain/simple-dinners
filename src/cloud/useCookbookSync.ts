import { useEffect } from "react";
import type {
  RealtimeChannel,
} from "@supabase/supabase-js";

import { useAuth } from "../auth/AuthContext";
import { supabase } from "../lib/supabase";

import {
  loadCloudCookbook,
  saveCloudCookbook,
  type CloudCookbookRecipe,
} from "./cookbookSync";

import {
  COOKBOOK_CHANGED_EVENT,
  cookbookSignature,
  getCookbook,
  type CookbookChangedDetail,
} from "../core/cookbookStore";

import {
  requestCookbookConflict,
} from "./cookbookConflictState";

import {
  COOKBOOK_SYNC_RETRY_EVENT,
  publishCookbookSyncState,
} from "./cookbookSyncState";

const LOCAL_BACKUP_KEY =
  "simple-dinners.cookbook.pre-cloud-backup.v1";

const CLOUD_BACKUP_KEY =
  "simple-dinners.cookbook.cloud-backup.v1";

type ApplyCloudCookbook = (
  recipes: CloudCookbookRecipe[],
) => void;

function cookbooksMatch(
  first: CloudCookbookRecipe[],
  second: CloudCookbookRecipe[],
) {
  return (
    cookbookSignature(first) ===
    cookbookSignature(second)
  );
}

function saveBackup(
  key: string,
  recipes: CloudCookbookRecipe[],
) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        savedAt: Date.now(),
        recipes,
      }),
    );
  } catch (error) {
    console.error(
      "Unable to create cookbook backup:",
      error,
    );
  }
}

export function useCookbookSync(
  applyCloudCookbook: ApplyCloudCookbook,
) {
  const {
    isSignedIn,
    householdId,
    householdLoading,
  } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      publishCookbookSyncState({
        status: "local",
        error: null,
      });

      return;
    }

    if (householdLoading) {
      publishCookbookSyncState({
        status: "connecting",
        error: null,
      });

      return;
    }

    if (!householdId) {
      publishCookbookSyncState({
        status: "local",
        error: null,
      });

      return;
    }

    if (!supabase) {
      publishCookbookSyncState({
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

    let uploadTimer: number | null = null;
    let uploadInProgress = false;

    let queuedRecipes:
      | CloudCookbookRecipe[]
      | null = null;

    let pendingRecipes:
      | CloudCookbookRecipe[]
      | null = null;

    let cloudPullTimer: number | null = null;
    let cloudPullInProgress = false;
    let cloudPullQueued = false;

    let realtimeChannel:
      | RealtimeChannel
      | null = null;

    function markFailure(message: string) {
      publishCookbookSyncState({
        status: navigator.onLine
          ? "error"
          : "offline",
        error: message,
      });
    }

    function markOffline() {
      publishCookbookSyncState({
        status: "offline",
        error: null,
      });
    }

    async function uploadCookbook(
      recipes: CloudCookbookRecipe[],
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
        queuedRecipes = recipes;
        hasPendingLocalChanges = true;

        publishCookbookSyncState({
          status: "syncing",
          error: null,
        });

        return true;
      }

      uploadInProgress = true;

      publishCookbookSyncState({
        status: "syncing",
        error: null,
      });

      let result;

      try {
        result = await saveCloudCookbook(
          activeHouseholdId,
          recipes,
        );
      } catch (error) {
        uploadInProgress = false;
        hasPendingLocalChanges = true;

        markFailure(
          error instanceof Error
            ? error.message
            : "Unable to sync the cookbook.",
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
          "Cookbook cloud upload failed:",
          result.error,
        );

        markFailure(result.error);
        return false;
      }

      if (queuedRecipes) {
        const nextRecipes = queuedRecipes;
        queuedRecipes = null;

        return uploadCookbook(nextRecipes);
      }

      hasPendingLocalChanges = false;

      publishCookbookSyncState({
        status: "synced",
        error: null,
        lastSyncedAt: Date.now(),
      });

      return true;
    }

    function scheduleUpload(
      recipes: CloudCookbookRecipe[],
    ) {
      hasPendingLocalChanges = true;

      if (!navigator.onLine) {
        markOffline();
        return;
      }

      publishCookbookSyncState({
        status: "syncing",
        error: null,
      });

      if (uploadTimer !== null) {
        window.clearTimeout(uploadTimer);
      }

      uploadTimer = window.setTimeout(() => {
        uploadTimer = null;
        void uploadCookbook(recipes);
      }, 500);
    }

    async function pullCloudCookbook() {
      if (cancelled) {
        return;
      }

      if (!navigator.onLine) {
        markOffline();
        return;
      }

      /*
       * Unsaved local work takes priority over an
       * older household snapshot.
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

      publishCookbookSyncState({
        status: "syncing",
        error: null,
      });

      let result;

      try {
        result = await loadCloudCookbook(
          activeHouseholdId,
        );
      } catch (error) {
        cloudPullInProgress = false;

        markFailure(
          error instanceof Error
            ? error.message
            : "Unable to receive the household cookbook.",
        );

        return;
      }

      cloudPullInProgress = false;

      if (cancelled) {
        return;
      }

      if (result.error) {
        console.error(
          "Unable to receive live cookbook update:",
          result.error,
        );

        markFailure(result.error);
      } else if (result.data) {
        const cloudRecipes =
          result.data.recipes;

        const localRecipes =
          getCookbook();

        if (
          !cookbooksMatch(
            localRecipes,
            cloudRecipes,
          )
        ) {
          applyCloudCookbook(
            cloudRecipes,
          );
        }

        publishCookbookSyncState({
          status: "synced",
          error: null,
          lastSyncedAt: Date.now(),
        });
      } else {
        const localRecipes =
          getCookbook();

        if (localRecipes.length > 0) {
          scheduleUpload(localRecipes);
        } else {
          publishCookbookSyncState({
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
          void pullCloudCookbook();
        },
        delay,
      );
    }

    function handleCookbookChanged(
      event: Event,
    ) {
      const customEvent =
        event as CustomEvent<
          CookbookChangedDetail
        >;

      const detail = customEvent.detail;

      /*
       * Never upload recipes that this device
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
        pendingRecipes = detail.recipes;

        if (!navigator.onLine) {
          markOffline();
        }

        return;
      }

      scheduleUpload(detail.recipes);
    }

    function startRealtime() {
      if (
        realtimeChannel ||
        cancelled
      ) {
        return;
      }

      const channelName = [
        "cookbook-household",
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
            table: "cookbook_snapshots",
            filter:
              `household_id=eq.${activeHouseholdId}`,
          },
          () => {
            scheduleCloudPull();
          },
        )
        .subscribe((status, error) => {
          if (status === "SUBSCRIBED") {
            publishCookbookSyncState({
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
              "Cookbook Realtime connection failed:",
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

      publishCookbookSyncState({
        status: "connecting",
        error: null,
      });

      try {
        const localRecipes =
          getCookbook();

        const cloudResult =
          await loadCloudCookbook(
            activeHouseholdId,
          );

        if (cancelled) {
          return;
        }

        if (cloudResult.error) {
          console.error(
            "Unable to initialize cookbook sync:",
            cloudResult.error,
          );

          markFailure(cloudResult.error);
          return;
        }

        const cloudRecipes =
          cloudResult.data
            ? cloudResult.data.recipes
            : null;

        const localHasRecipes =
          localRecipes.length > 0;

        const cloudHasRecipes =
          Boolean(
            cloudRecipes &&
            cloudRecipes.length > 0,
          );

        if (
          localHasRecipes &&
          !cloudHasRecipes
        ) {
          const uploaded =
            await uploadCookbook(
              localRecipes,
            );

          if (!uploaded || cancelled) {
            return;
          }
        }

        if (
          !localHasRecipes &&
          cloudRecipes &&
          cloudHasRecipes
        ) {
          applyCloudCookbook(
            cloudRecipes,
          );
        }

        if (
          localHasRecipes &&
          cloudRecipes &&
          cloudHasRecipes &&
          !cookbooksMatch(
            localRecipes,
            cloudRecipes,
          )
        ) {
          if (
            hasPendingLocalChanges ||
            pendingRecipes
          ) {
            saveBackup(
              CLOUD_BACKUP_KEY,
              cloudRecipes,
            );

            const uploaded =
              await uploadCookbook(
                localRecipes,
              );

            if (!uploaded || cancelled) {
              return;
            }

            pendingRecipes = null;
          } else {
            const conflictChoice =
              await requestCookbookConflict(
                localRecipes,
                cloudRecipes,
              );

            if (cancelled) {
              return;
            }

            if (
              conflictChoice === "cloud"
            ) {
              saveBackup(
                LOCAL_BACKUP_KEY,
                localRecipes,
              );

              applyCloudCookbook(
                cloudRecipes,
              );
            } else {
              saveBackup(
                CLOUD_BACKUP_KEY,
                cloudRecipes,
              );

              const uploaded =
                await uploadCookbook(
                  localRecipes,
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

        publishCookbookSyncState({
          status: "synced",
          error: null,
          lastSyncedAt: Date.now(),
        });

        if (pendingRecipes) {
          const latestRecipes =
            pendingRecipes;

          pendingRecipes = null;

          scheduleUpload(
            latestRecipes,
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

      publishCookbookSyncState({
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
          getCookbook(),
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
      COOKBOOK_CHANGED_EVENT,
      handleCookbookChanged,
    );

    window.addEventListener(
      COOKBOOK_SYNC_RETRY_EVENT,
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
        COOKBOOK_CHANGED_EVENT,
        handleCookbookChanged,
      );

      window.removeEventListener(
        COOKBOOK_SYNC_RETRY_EVENT,
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
    applyCloudCookbook,
    householdId,
    householdLoading,
    isSignedIn,
  ]);
}