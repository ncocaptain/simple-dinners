import { useSyncExternalStore } from "react";
import type { ShoppingItem } from "../shoppingList";

export type ShoppingListConflictChoice =
  | "cloud"
  | "local";

type ShoppingListConflictSnapshot = {
  isOpen: boolean;
  localItemCount: number;
  cloudItemCount: number;
  localCheckedCount: number;
  cloudCheckedCount: number;
};

const CLOSED_SNAPSHOT: ShoppingListConflictSnapshot = {
  isOpen: false,
  localItemCount: 0,
  cloudItemCount: 0,
  localCheckedCount: 0,
  cloudCheckedCount: 0,
};

let snapshot = CLOSED_SNAPSHOT;

let activeResolver:
  | ((choice: ShoppingListConflictChoice) => void)
  | null = null;

let activePromise:
  | Promise<ShoppingListConflictChoice>
  | null = null;

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

export function useShoppingListConflict() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
}

export function requestShoppingListConflict(
  localItems: ShoppingItem[],
  cloudItems: ShoppingItem[],
): Promise<ShoppingListConflictChoice> {
  if (activePromise) {
    return activePromise;
  }

  snapshot = {
    isOpen: true,
    localItemCount: localItems.length,
    cloudItemCount: cloudItems.length,
    localCheckedCount: localItems.filter(
      (item) => item.checked,
    ).length,
    cloudCheckedCount: cloudItems.filter(
      (item) => item.checked,
    ).length,
  };

  emitChange();

  activePromise =
    new Promise<ShoppingListConflictChoice>(
      (resolve) => {
        activeResolver = resolve;
      },
    );

  return activePromise;
}

export function resolveShoppingListConflict(
  choice: ShoppingListConflictChoice,
) {
  const resolver = activeResolver;

  if (!resolver) {
    return;
  }

  activeResolver = null;
  activePromise = null;
  snapshot = CLOSED_SNAPSHOT;

  emitChange();
  resolver(choice);
}