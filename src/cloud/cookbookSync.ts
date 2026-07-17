import type { Meal } from "../core/types";
import { supabase } from "../lib/supabase";

export type CloudCookbookRecipe = Meal & {
  sourceUrl?: string;
};

export type CookbookSnapshot = {
  recipes: CloudCookbookRecipe[];
  updatedAt: string | null;
};

type CookbookSnapshotRow = {
  household_id: string;
  recipes: unknown;
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

function isCookbookRecipe(
  value: unknown,
): value is CloudCookbookRecipe {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.name === "string" &&
    typeof value.ingredients === "string"
  );
}

function toRecipes(
  value: unknown,
): CloudCookbookRecipe[] {
  if (!Array.isArray(value)) {
    return [];
  }

  /*
   * Keep every stored recipe field intact while
   * filtering out malformed non-recipe values.
   */
  return value.filter(isCookbookRecipe);
}

function rowToSnapshot(
  row: CookbookSnapshotRow,
): CookbookSnapshot {
  return {
    recipes: toRecipes(row.recipes),
    updatedAt: row.updated_at,
  };
}

export async function loadCloudCookbook(
  householdId: string,
): Promise<
  CloudResult<CookbookSnapshot | null>
> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const { data, error } = await supabase
    .from("cookbook_snapshots")
    .select(
      `
        household_id,
        recipes,
        updated_at
      `,
    )
    .eq("household_id", householdId)
    .maybeSingle();

  if (error) {
    console.error(
      "Unable to load cookbook snapshot:",
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
      data as CookbookSnapshotRow,
    ),
    error: null,
  };
}

export async function saveCloudCookbook(
  householdId: string,
  recipes: CloudCookbookRecipe[],
): Promise<CloudResult<string>> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const { data, error } = await supabase.rpc(
    "save_cookbook_snapshot",
    {
      p_household_id: householdId,
      p_recipes: recipes,
    },
  );

  if (error) {
    console.error(
      "Unable to save cookbook snapshot:",
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
        "Supabase did not return the cookbook save time.",
    };
  }

  return {
    data,
    error: null,
  };
}