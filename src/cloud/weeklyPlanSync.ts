import { supabase } from "../lib/supabase";

export type WeeklyPlanSnapshot = {
  meals: Record<string, unknown>;
  daySettings: Record<string, unknown>;
  lockedDays: Record<string, boolean>;
  updatedAt: string | null;
};

type WeeklyPlanRow = {
  household_id: string;
  meals: unknown;
  day_settings: unknown;
  locked_days: unknown;
  updated_at: string;
};

type CloudResult<T> = {
  data: T | null;
  error: string | null;
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function toRecord(
  value: unknown,
): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function toBooleanRecord(
  value: unknown,
): Record<string, boolean> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(
        (
          entry,
        ): entry is [string, boolean] =>
          typeof entry[1] === "boolean",
      ),
  );
}

function rowToSnapshot(
  row: WeeklyPlanRow,
): WeeklyPlanSnapshot {
  return {
    meals: toRecord(row.meals),
    daySettings: toRecord(row.day_settings),
    lockedDays: toBooleanRecord(
      row.locked_days,
    ),
    updatedAt: row.updated_at,
  };
}

export async function loadCloudWeeklyPlan(
  householdId: string,
): Promise<
  CloudResult<WeeklyPlanSnapshot | null>
> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const { data, error } = await supabase
    .from("weekly_plan_snapshots")
    .select(
      `
        household_id,
        meals,
        day_settings,
        locked_days,
        updated_at
      `,
    )
    .eq("household_id", householdId)
    .maybeSingle();

  if (error) {
    console.error(
      "Unable to load weekly-plan snapshot:",
      error,
    );

    return {
      data: null,
      error: error.message,
    };
  }

  if (!data) {
    return {
      data: null,
      error: null,
    };
  }

  return {
    data: rowToSnapshot(
      data as WeeklyPlanRow,
    ),
    error: null,
  };
}

export async function saveCloudWeeklyPlan(
  householdId: string,
  snapshot: {
    meals: Record<string, unknown>;
    daySettings: Record<string, unknown>;
    lockedDays: Record<string, boolean>;
  },
): Promise<CloudResult<string>> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const { data, error } = await supabase.rpc(
    "save_weekly_plan_snapshot",
    {
      p_household_id: householdId,
      p_meals: snapshot.meals,
      p_day_settings: snapshot.daySettings,
      p_locked_days: snapshot.lockedDays,
    },
  );

  if (error) {
    console.error(
      "Unable to save weekly-plan snapshot:",
      error,
    );

    return {
      data: null,
      error: error.message,
    };
  }

  if (typeof data !== "string") {
    return {
      data: null,
      error:
        "Supabase did not return the weekly-plan save time.",
    };
  }

  return {
    data,
    error: null,
  };
}