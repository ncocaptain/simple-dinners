export type WeeklyPlanChangeSource =
  | "local"
  | "cloud";

export type WeeklyPlanLocalSnapshot = {
  meals: Record<string, unknown>;
  daySettings: Record<string, unknown>;
  lockedDays: Record<string, boolean>;
};

export type WeeklyPlanChangedDetail = {
  snapshot: WeeklyPlanLocalSnapshot;
  source: WeeklyPlanChangeSource;
};

export const WEEKLY_PLAN_CHANGED_EVENT =
  "simple-dinners:weekly-plan-changed";

const MEALS_KEY = "meals";
const DAY_SETTINGS_KEY = "daySettings";
const LOCKED_DAYS_KEY = "lockedDays";

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parseRecord(
  value: string | null,
): Record<string, unknown> {
  if (!value) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function parseBooleanRecord(
  value: string | null,
): Record<string, boolean> {
  const parsed = parseRecord(value);

  return Object.fromEntries(
    Object.entries(parsed).filter(
      (
        entry,
      ): entry is [string, boolean] =>
        typeof entry[1] === "boolean",
    ),
  );
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [
          key,
          canonicalize(value[key]),
        ]),
    );
  }

  return value;
}

export function weeklyPlanSignature(
  snapshot: WeeklyPlanLocalSnapshot,
): string {
  return JSON.stringify(
    canonicalize(snapshot),
  );
}

export function loadLocalWeeklyPlan():
  WeeklyPlanLocalSnapshot {
  if (typeof window === "undefined") {
    return {
      meals: {},
      daySettings: {},
      lockedDays: {},
    };
  }

  return {
    meals: parseRecord(
      localStorage.getItem(MEALS_KEY),
    ),

    daySettings: parseRecord(
      localStorage.getItem(
        DAY_SETTINGS_KEY,
      ),
    ),

    lockedDays: parseBooleanRecord(
      localStorage.getItem(
        LOCKED_DAYS_KEY,
      ),
    ),
  };
}

function announceWeeklyPlanChange(
  snapshot: WeeklyPlanLocalSnapshot,
  source: WeeklyPlanChangeSource,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<WeeklyPlanChangedDetail>(
      WEEKLY_PLAN_CHANGED_EVENT,
      {
        detail: {
          snapshot,
          source,
        },
      },
    ),
  );
}

export function saveLocalWeeklyPlan(
  snapshot: WeeklyPlanLocalSnapshot,
  source: WeeklyPlanChangeSource = "local",
) {
  if (typeof window === "undefined") {
    return;
  }

  const previous =
    loadLocalWeeklyPlan();

  const previousSignature =
    weeklyPlanSignature(previous);

  const nextSignature =
    weeklyPlanSignature(snapshot);

  localStorage.setItem(
    MEALS_KEY,
    JSON.stringify(snapshot.meals),
  );

  localStorage.setItem(
    DAY_SETTINGS_KEY,
    JSON.stringify(snapshot.daySettings),
  );

  localStorage.setItem(
    LOCKED_DAYS_KEY,
    JSON.stringify(snapshot.lockedDays),
  );

  /*
   * Avoid duplicate sync announcements when App.tsx
   * saves because an unrelated value such as pantry
   * or cookbook changed.
   */
  if (
    previousSignature === nextSignature
  ) {
    return;
  }

  announceWeeklyPlanChange(
    snapshot,
    source,
  );
}

export function replaceWeeklyPlanFromCloud(
  snapshot: WeeklyPlanLocalSnapshot,
) {
  saveLocalWeeklyPlan(
    snapshot,
    "cloud",
  );
}