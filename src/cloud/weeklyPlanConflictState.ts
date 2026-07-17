import { useSyncExternalStore } from "react";
import type {
  WeeklyPlanLocalSnapshot,
} from "./weeklyPlanLocal";

export type WeeklyPlanConflictChoice =
  | "cloud"
  | "local";

type PlanSummary = {
  dinnerCount: number;
  specialNightCount: number;
  lockedDayCount: number;
};

type WeeklyPlanConflictSnapshot = {
  isOpen: boolean;
  local: PlanSummary;
  cloud: PlanSummary;
};

const EMPTY_SUMMARY: PlanSummary = {
  dinnerCount: 0,
  specialNightCount: 0,
  lockedDayCount: 0,
};

const CLOSED_SNAPSHOT:
  WeeklyPlanConflictSnapshot = {
  isOpen: false,
  local: EMPTY_SUMMARY,
  cloud: EMPTY_SUMMARY,
};

let snapshot = CLOSED_SNAPSHOT;

let activeResolver:
  | ((choice: WeeklyPlanConflictChoice) => void)
  | null = null;

let activePromise:
  | Promise<WeeklyPlanConflictChoice>
  | null = null;

const listeners = new Set<() => void>();

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function summarizePlan(
  plan: WeeklyPlanLocalSnapshot,
): PlanSummary {
  let dinnerCount = 0;
  let specialNightCount = 0;

  Object.values(plan.meals).forEach((value) => {
    if (!isRecord(value)) {
      return;
    }

    /*
     * Current PlannedDay format.
     */
    if ("mode" in value) {
      if (
        value.mode === "leftovers" ||
        value.mode === "freezer"
      ) {
        specialNightCount += 1;
        return;
      }

      if (
        value.mode === "planned" &&
        value.meal
      ) {
        dinnerCount += 1;
      }

      return;
    }

    /*
     * Legacy saved format where the value itself
     * was the meal object.
     */
    if (Object.keys(value).length > 0) {
      dinnerCount += 1;
    }
  });

  return {
    dinnerCount,
    specialNightCount,
    lockedDayCount: Object.values(
      plan.lockedDays,
    ).filter(Boolean).length,
  };
}

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

export function useWeeklyPlanConflict() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
}

export function requestWeeklyPlanConflict(
  localPlan: WeeklyPlanLocalSnapshot,
  cloudPlan: WeeklyPlanLocalSnapshot,
): Promise<WeeklyPlanConflictChoice> {
  if (activePromise) {
    return activePromise;
  }

  snapshot = {
    isOpen: true,
    local: summarizePlan(localPlan),
    cloud: summarizePlan(cloudPlan),
  };

  emitChange();

  activePromise =
    new Promise<WeeklyPlanConflictChoice>(
      (resolve) => {
        activeResolver = resolve;
      },
    );

  return activePromise;
}

export function resolveWeeklyPlanConflict(
  choice: WeeklyPlanConflictChoice,
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