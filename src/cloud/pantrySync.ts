import type { PantryItem } from "../core/types";
import { normalizePantryItems } from "../core/pantryStore";
import { supabase } from "../lib/supabase";

export type PantrySnapshot = {
  items: PantryItem[];
  updatedAt: string | null;
};

type PantrySnapshotRow = {
  household_id: string;
  items: unknown;
  updated_at: string;
};

type CloudResult<T> = {
  data: T | null;
  error: string | null;
};

function rowToSnapshot(
  row: PantrySnapshotRow,
): PantrySnapshot {
  return {
    items: normalizePantryItems(row.items),
    updatedAt: row.updated_at,
  };
}

export async function loadCloudPantry(
  householdId: string,
): Promise<CloudResult<PantrySnapshot | null>> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const { data, error } = await supabase
    .from("pantry_snapshots")
    .select("household_id, items, updated_at")
    .eq("household_id", householdId)
    .maybeSingle();

  if (error) {
    console.error("Unable to load pantry snapshot:", error);
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: null };
  }

  return {
    data: rowToSnapshot(data as PantrySnapshotRow),
    error: null,
  };
}

export async function saveCloudPantry(
  householdId: string,
  items: PantryItem[],
): Promise<CloudResult<string>> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      data: null,
      error:
        userError?.message ??
        "Authentication required.",
    };
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("pantry_snapshots")
    .upsert(
      {
        household_id: householdId,
        items: normalizePantryItems(items),
        updated_by: userData.user.id,
        updated_at: now,
      },
      {
        onConflict: "household_id",
      },
    )
    .select("updated_at")
    .single();

  if (error) {
    console.error("Unable to save pantry snapshot:", error);
    return { data: null, error: error.message };
  }

  return {
    data:
      typeof data?.updated_at === "string"
        ? data.updated_at
        : now,
    error: null,
  };
}
