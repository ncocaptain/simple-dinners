import { useEffect } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../lib/supabase";
import {
  loadCloudShoppingSnapshot,
  replaceCloudShoppingSnapshot,
} from "./shoppingSync";
import {
  publishShoppingSyncState,
  SHOPPING_SYNC_RETRY_EVENT,
} from "./shoppingSyncState";
import {
  loadRawShoppingList,
  replaceShoppingListFromCloud,
  SHOPPING_LIST_CHANGED_EVENT,
  type ShoppingItem,
  type ShoppingListChangedDetail,
} from "../shoppingList";
import {
  requestShoppingListConflict,
} from "./shoppingListConflictState";

const LOCAL_BACKUP_KEY =
  "simple-dinners.shoppingList.pre-cloud-backup.v1";

const CLOUD_BACKUP_KEY =
  "simple-dinners.shoppingList.cloud-backup.v1";

function normalizeSnapshotItem(item: ShoppingItem) {
  return {
    id: item.id,
    text: item.text,
    checked: Boolean(item.checked),
    addedAt: Number(item.addedAt || 0),
    category: item.category,
    sourceRecipe: item.sourceRecipe ?? "",
    normalizedName: item.normalizedName ?? "",
    quantity:
      typeof item.quantity === "number" &&
        Number.isFinite(item.quantity)
        ? item.quantity
        : null,
    unit: item.unit ?? "",
    packageSize: item.packageSize ?? "",
    displayText: item.displayText ?? "",
    grocerySearchName:
      item.grocerySearchName ?? "",
    groceryNotes: item.groceryNotes ?? "",
  };
}

function snapshotSignature(items: ShoppingItem[]) {
  return JSON.stringify(
    items
      .map(normalizeSnapshotItem)
      .sort((a, b) => a.id.localeCompare(b.id)),
  );
}

function snapshotsMatch(
  first: ShoppingItem[],
  second: ShoppingItem[],
) {
  return (
    snapshotSignature(first) ===
    snapshotSignature(second)
  );
}

function saveBackup(
  key: string,
  items: ShoppingItem[],
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
      "Unable to create shopping-list backup:",
      error,
    );
  }
}

export function ShoppingSyncBridge() {
  const {
    isSignedIn,
    householdId,
    householdLoading,
  } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      publishShoppingSyncState({
        status: "local",
        error: null,
      });

      return;
    }

    if (householdLoading) {
      publishShoppingSyncState({
        status: "connecting",
        error: null,
      });

      return;
    }

    if (!householdId) {
      publishShoppingSyncState({
        status: "local",
        error: null,
      });

      return;
    }

    if (!supabase) {
      publishShoppingSyncState({
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
    let queuedItems: ShoppingItem[] | null = null;
    let pendingItems: ShoppingItem[] | null = null;

    let cloudPullTimer: number | null = null;
    let cloudPullInProgress = false;
    let cloudPullQueued = false;

    let realtimeChannel: RealtimeChannel | null = null;

    function markFailure(message: string) {
      publishShoppingSyncState({
        status: navigator.onLine
          ? "error"
          : "offline",
        error: message,
      });
    }

    function markOffline() {
      publishShoppingSyncState({
        status: "offline",
        error: null,
      });
    }

    async function uploadSnapshot(
      items: ShoppingItem[],
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

        publishShoppingSyncState({
          status: "syncing",
          error: null,
        });

        return true;
      }

      uploadInProgress = true;

      publishShoppingSyncState({
        status: "syncing",
        error: null,
      });

      let result;

      try {
        result =
          await replaceCloudShoppingSnapshot(
            activeHouseholdId,
            items,
          );
      } catch (error) {
        uploadInProgress = false;
        hasPendingLocalChanges = true;

        markFailure(
          error instanceof Error
            ? error.message
            : "Unable to sync the shopping list.",
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
          "Shopping-list cloud upload failed:",
          result.error,
        );

        markFailure(result.error);
        return false;
      }

      if (queuedItems) {
        const nextItems = queuedItems;
        queuedItems = null;

        return uploadSnapshot(nextItems);
      }

      hasPendingLocalChanges = false;

      publishShoppingSyncState({
        status: "synced",
        error: null,
        lastSyncedAt: Date.now(),
      });

      return true;
    }

    function scheduleUpload(
      items: ShoppingItem[],
    ) {
      hasPendingLocalChanges = true;

      if (!navigator.onLine) {
        markOffline();
        return;
      }

      publishShoppingSyncState({
        status: "syncing",
        error: null,
      });

      if (uploadTimer !== null) {
        window.clearTimeout(uploadTimer);
      }

      uploadTimer = window.setTimeout(() => {
        uploadTimer = null;
        void uploadSnapshot(items);
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

      /*
       * A local change waiting to upload takes priority
       * over an older cloud snapshot.
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

      publishShoppingSyncState({
        status: "syncing",
        error: null,
      });

      let result;

      try {
        result =
          await loadCloudShoppingSnapshot(
            activeHouseholdId,
          );
      } catch (error) {
        cloudPullInProgress = false;

        markFailure(
          error instanceof Error
            ? error.message
            : "Unable to receive the household list.",
        );

        return;
      }

      cloudPullInProgress = false;

      if (cancelled) {
        return;
      }

      if (result.error) {
        console.error(
          "Unable to receive live shopping-list update:",
          result.error,
        );

        markFailure(result.error);
      } else {
        const cloudItems = result.data ?? [];
        const currentLocalItems =
          loadRawShoppingList();

        if (
          !snapshotsMatch(
            currentLocalItems,
            cloudItems,
          )
        ) {
          replaceShoppingListFromCloud(
            cloudItems,
          );
        }

        publishShoppingSyncState({
          status: "synced",
          error: null,
          lastSyncedAt: Date.now(),
        });
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
        window.clearTimeout(cloudPullTimer);
      }

      cloudPullTimer = window.setTimeout(() => {
        cloudPullTimer = null;
        void pullCloudSnapshot();
      }, delay);
    }

    function handleShoppingListChanged(
      event: Event,
    ) {
      const customEvent =
        event as CustomEvent<ShoppingListChangedDetail>;

      const detail = customEvent.detail;

      /*
       * A cloud-applied list must never be uploaded
       * again by this device.
       */
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
      if (realtimeChannel || cancelled) {
        return;
      }

      const channelName = [
        "shopping-household",
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
            event: "UPDATE",
            schema: "public",
            table: "households",
            filter:
              `id=eq.${activeHouseholdId}`,
          },
          () => {
            scheduleCloudPull();
          },
        )
        .subscribe((status, error) => {
          if (status === "SUBSCRIBED") {
            publishShoppingSyncState({
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
              "Shopping-list Realtime connection failed:",
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
      const previousChannel = realtimeChannel;
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

      publishShoppingSyncState({
        status: "connecting",
        error: null,
      });

      try {
        const localItems =
          loadRawShoppingList();

        const cloudResult =
          await loadCloudShoppingSnapshot(
            activeHouseholdId,
          );

        if (cancelled) {
          return;
        }

        if (cloudResult.error) {
          console.error(
            "Unable to initialize shopping-list sync:",
            cloudResult.error,
          );

          markFailure(cloudResult.error);
          return;
        }

        const cloudItems =
          cloudResult.data ?? [];

        if (
          localItems.length > 0 &&
          cloudItems.length === 0
        ) {
          const uploaded =
            await uploadSnapshot(localItems);

          if (!uploaded || cancelled) {
            return;
          }
        }

        if (
          localItems.length === 0 &&
          cloudItems.length > 0
        ) {
          replaceShoppingListFromCloud(
            cloudItems,
          );
        }

        if (
          localItems.length > 0 &&
          cloudItems.length > 0 &&
          !snapshotsMatch(
            localItems,
            cloudItems,
          )
        ) {
          /*
           * Changes made while offline should be sent
           * when this device reconnects instead of
           * producing another conflict prompt.
           */
          if (
            hasPendingLocalChanges ||
            pendingItems
          ) {
            saveBackup(
              CLOUD_BACKUP_KEY,
              cloudItems,
            );

            const uploaded =
              await uploadSnapshot(localItems);

            if (!uploaded || cancelled) {
              return;
            }

            pendingItems = null;
          } else {
            const conflictChoice =
              await requestShoppingListConflict(
                localItems,
                cloudItems,
              );

            if (cancelled) {
              return;
            }

            if (conflictChoice === "cloud") {
              saveBackup(
                LOCAL_BACKUP_KEY,
                localItems,
              );

              replaceShoppingListFromCloud(
                cloudItems,
              );
            } else {
              saveBackup(
                CLOUD_BACKUP_KEY,
                cloudItems,
              );

              const uploaded =
                await uploadSnapshot(localItems);

              if (!uploaded || cancelled) {
                return;
              }
            }
          }
        }

        syncReady = true;
        startRealtime();

        publishShoppingSyncState({
          status: "synced",
          error: null,
          lastSyncedAt: Date.now(),
        });

        if (pendingItems) {
          const latestItems = pendingItems;
          pendingItems = null;
          scheduleUpload(latestItems);
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

      publishShoppingSyncState({
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
          loadRawShoppingList(),
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
      SHOPPING_LIST_CHANGED_EVENT,
      handleShoppingListChanged,
    );

    window.addEventListener(
      SHOPPING_SYNC_RETRY_EVENT,
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
        SHOPPING_LIST_CHANGED_EVENT,
        handleShoppingListChanged,
      );

      window.removeEventListener(
        SHOPPING_SYNC_RETRY_EVENT,
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
        window.clearTimeout(cloudPullTimer);
      }

      if (realtimeChannel) {
        void activeSupabase.removeChannel(
          realtimeChannel,
        );
      }
    };
  }, [
    householdId,
    householdLoading,
    isSignedIn,
  ]);

  return null;
}