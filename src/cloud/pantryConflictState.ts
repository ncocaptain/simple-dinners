import { useSyncExternalStore } from "react";
import type { PantryItem } from "../core/types";

export type PantryConflictChoice =
  | "cloud"
  | "local";

type PantrySummary = {
  itemCount: number;
};

type PantryConflictSnapshot = {
  isOpen: boolean;
  local: PantrySummary;
  cloud: PantrySummary;
};

const EMPTY: PantrySummary = {
  itemCount: 0,
};

const CLOSED: PantryConflictSnapshot = {
  isOpen: false,
  local: EMPTY,
  cloud: EMPTY,
};

let snapshot = CLOSED;
let activeResolver:
  | ((choice: PantryConflictChoice) => void)
  | null = null;
let activePromise:
  | Promise<PantryConflictChoice>
  | null = null;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

export function usePantryConflict() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
}

export function requestPantryConflict(
  localItems: PantryItem[],
  cloudItems: PantryItem[],
): Promise<PantryConflictChoice> {
  if (activePromise) {
    return activePromise;
  }

  snapshot = {
    isOpen: true,
    local: { itemCount: localItems.length },
    cloud: { itemCount: cloudItems.length },
  };

  emit();

  activePromise =
    new Promise<PantryConflictChoice>((resolve) => {
      activeResolver = resolve;
    });

  return activePromise;
}

export function resolvePantryConflict(
  choice: PantryConflictChoice,
) {
  const resolver = activeResolver;

  if (!resolver) {
    return;
  }

  activeResolver = null;
  activePromise = null;
  snapshot = CLOSED;
  emit();
  resolver(choice);
}
