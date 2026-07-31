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

function normalizeSignatureText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim().toLowerCase()
    : "";
}

function summarizePlannedDay(
  value: unknown,
): unknown {
  if (!isRecord(value)) {
    return null;
  }

  /*
   * Current PlannedDay format.
   */
  if ("mode" in value) {
    if (
      value.mode === "leftovers" ||
      value.mode === "freezer"
    ) {
      return {
        mode: value.mode,
      };
    }

    if (value.mode !== "planned") {
      return null;
    }

    const meal = value.meal;

    if (!isRecord(meal)) {
      return null;
    }

    /*
     * Compare the selected dinner rather than its
     * hydrated recipe details. Photos, ingredients,
     * instructions, tags, and other recipe updates
     * should not create a weekly-plan conflict.
     */
   const mealKey =
  normalizeSignatureText(meal.slug) ||
  normalizeSignatureText(meal.id) ||
  normalizeSignatureText(meal.name);

    if (!mealKey) {
      return null;
    }

    return {
      mode: "planned",
      meal: mealKey,
    };
  }

  /*
   * Legacy format where the saved value itself
   * was the meal object.
   */
 const mealKey =
  normalizeSignatureText(value.slug) ||
  normalizeSignatureText(value.id) ||
  normalizeSignatureText(value.name);

  if (!mealKey) {
    return null;
  }

  return {
    mode: "planned",
    meal: mealKey,
  };
}

export function weeklyPlanSignature(
  snapshot: WeeklyPlanLocalSnapshot,
): string {
  const meaningfulMeals =
    Object.fromEntries(
      Object.entries(snapshot.meals)
        .map(([day, value]) => [
          day,
          summarizePlannedDay(value),
        ])
        .filter((entry) => entry[1] !== null),
    );

  const meaningfulDaySettings =
    Object.fromEntries(
      Object.entries(
        snapshot.daySettings,
      ).filter(([, value]) => {
        return (
          value !== null &&
          value !== undefined &&
          value !== ""
        );
      }),
    );

  const meaningfulLockedDays =
    Object.fromEntries(
      Object.entries(
        snapshot.lockedDays,
      ).filter(([, isLocked]) => isLocked),
    );

  return JSON.stringify(
    canonicalize({
      meals: meaningfulMeals,
      daySettings:
        meaningfulDaySettings,
      lockedDays:
        meaningfulLockedDays,
    }),
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