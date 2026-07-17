import { useSyncExternalStore } from "react";
import type { Meal } from "../core/types";

export type CookbookConflictChoice =
  | "cloud"
  | "local";

type CookbookSummary = {
  recipeCount: number;
};

type CookbookConflictSnapshot = {
  isOpen: boolean;
  local: CookbookSummary;
  cloud: CookbookSummary;
};

const EMPTY_SUMMARY: CookbookSummary = {
  recipeCount: 0,
};

const CLOSED_SNAPSHOT:
  CookbookConflictSnapshot = {
  isOpen: false,
  local: EMPTY_SUMMARY,
  cloud: EMPTY_SUMMARY,
};

let snapshot = CLOSED_SNAPSHOT;

let activeResolver:
  | ((
    choice: CookbookConflictChoice,
  ) => void)
  | null = null;

let activePromise:
  | Promise<CookbookConflictChoice>
  | null = null;

const listeners = new Set<() => void>();

function summarizeCookbook(
  recipes: Meal[],
): CookbookSummary {
  return {
    recipeCount: recipes.length,
  };
}

function emitChange() {
  listeners.forEach((listener) => {
    listener();
  });
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

export function useCookbookConflict() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
}

export function requestCookbookConflict(
  localRecipes: Meal[],
  cloudRecipes: Meal[],
): Promise<CookbookConflictChoice> {
  if (activePromise) {
    return activePromise;
  }

  snapshot = {
    isOpen: true,
    local: summarizeCookbook(
      localRecipes,
    ),
    cloud: summarizeCookbook(
      cloudRecipes,
    ),
  };

  emitChange();

  activePromise =
    new Promise<CookbookConflictChoice>(
      (resolve) => {
        activeResolver = resolve;
      },
    );

  return activePromise;
}

export function resolveCookbookConflict(
  choice: CookbookConflictChoice,
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