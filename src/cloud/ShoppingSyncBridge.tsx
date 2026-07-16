import { useEffect } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../lib/supabase";
import {
  loadCloudShoppingSnapshot,
  replaceCloudShoppingSnapshot,
} from "./shoppingSync";
import {
  loadRawShoppingList,
  replaceShoppingListFromCloud,
  SHOPPING_LIST_CHANGED_EVENT,
  type ShoppingItem,
  type ShoppingListChangedDetail,
} from "../shoppingList";

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
  const { isSignedIn, householdId } = useAuth();

  useEffect(() => {
    if (
      !isSignedIn ||
      !householdId ||
      !supabase
    ) {
      return;
    }

    const activeHouseholdId = householdId;
    const activeSupabase = supabase;

    let cancelled = false;
    let syncReady = false;

    let uploadTimer: number | null = null;
    let uploadInProgress = false;
    let queuedItems: ShoppingItem[] | null = null;
    let pendingItems: ShoppingItem[] | null = null;

    let cloudPullTimer: number | null = null;
    let cloudPullInProgress = false;
    let cloudPullQueued = false;

    let realtimeChannel: RealtimeChannel | null = null;

    async function uploadSnapshot(
      items: ShoppingItem[],
    ): Promise<boolean> {
      if (cancelled) {
        return false;
      }

      if (uploadInProgress) {
        queuedItems = items;
        return true;
      }

      uploadInProgress = true;

      const result =
        await replaceCloudShoppingSnapshot(
          activeHouseholdId,
          items,
        );

      uploadInProgress = false;

      if (cancelled) {
        return false;
      }

      if (result.error) {
        console.error(
          "Shopping-list cloud upload failed:",
          result.error,
        );

        return false;
      }

      if (queuedItems) {
        const nextItems = queuedItems;
        queuedItems = null;

        return uploadSnapshot(nextItems);
      }

      return true;
    }

    function scheduleUpload(
      items: ShoppingItem[],
    ) {
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

      /*
       * Give this device's pending local upload priority.
       * This avoids pulling an older cloud snapshot over a
       * local edit that is still waiting to upload.
       */
      if (
        uploadTimer !== null ||
        uploadInProgress
      ) {
        scheduleCloudPull(400);
        return;
      }

      if (cloudPullInProgress) {
        cloudPullQueued = true;
        return;
      }

      cloudPullInProgress = true;

      const result =
        await loadCloudShoppingSnapshot(
          activeHouseholdId,
        );

      cloudPullInProgress = false;

      if (cancelled) {
        return;
      }

      if (result.error) {
        console.error(
          "Unable to receive live shopping-list update:",
          result.error,
        );
      } else {
        const cloudItems = result.data ?? [];
        const currentLocalItems =
          loadRawShoppingList();

        /*
         * Avoid unnecessary page refreshes and prevent
         * this device from reacting to its own upload.
         */
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
       * Cloud-applied data must not be uploaded again.
       * This prevents device-to-device update loops.
       */
      if (
        !detail ||
        detail.source !== "local"
      ) {
        return;
      }

      if (!syncReady) {
        pendingItems = detail.items;
        return;
      }

      scheduleUpload(detail.items);
    }

    function startRealtime() {
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
          if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT"
          ) {
            console.error(
              "Shopping-list Realtime connection failed:",
              status,
              error,
            );
          }
        });
    }

    window.addEventListener(
      SHOPPING_LIST_CHANGED_EVENT,
      handleShoppingListChanged,
    );

    async function initializeSync() {
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

        return;
      }

      const cloudItems =
        cloudResult.data ?? [];

      /*
       * Existing device with a new cloud account:
       * upload its current local list.
       */
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

      /*
       * Empty/new device joining an existing household:
       * download the household list.
       */
      if (
        localItems.length === 0 &&
        cloudItems.length > 0
      ) {
        replaceShoppingListFromCloud(
          cloudItems,
        );
      }

      /*
       * Both sides contain different data:
       * never overwrite silently.
       */
      if (
        localItems.length > 0 &&
        cloudItems.length > 0 &&
        !snapshotsMatch(
          localItems,
          cloudItems,
        )
      ) {
        const useCloudList =
          window.confirm(
            [
              "Simple Dinners Plus found two different shopping lists.",
              "",
              "Press OK to use the household cloud list on this device.",
              "",
              "Press Cancel to keep this device’s list and replace the cloud list.",
              "",
              "A backup will be saved before either list is replaced.",
            ].join("\n"),
          );

        if (useCloudList) {
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

      syncReady = true;
      startRealtime();

      /*
       * Preserve an edit made while the initial cloud
       * comparison was still loading.
       */
      if (pendingItems) {
        const latestItems = pendingItems;
        pendingItems = null;
        scheduleUpload(latestItems);
      }
    }

    void initializeSync();

    return () => {
      cancelled = true;
      syncReady = false;

      window.removeEventListener(
        SHOPPING_LIST_CHANGED_EVENT,
        handleShoppingListChanged,
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
  }, [householdId, isSignedIn]);

  return null;
}