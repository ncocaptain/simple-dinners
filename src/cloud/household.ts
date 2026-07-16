import { supabase } from "../lib/supabase";

type EnsureHouseholdResult = {
  householdId: string | null;
  error: string | null;
};

export async function ensureCurrentHousehold(): Promise<EnsureHouseholdResult> {
  if (!supabase) {
    return {
      householdId: null,
      error: "Cloud sync is not configured.",
    };
  }

  const { data, error } = await supabase.rpc(
    "ensure_household",
    {
      household_name: "My Household",
    },
  );

  if (error) {
    console.error(
      "Unable to create or load household:",
      error,
    );

    return {
      householdId: null,
      error: error.message,
    };
  }

  if (typeof data !== "string") {
    return {
      householdId: null,
      error: "Supabase did not return a household ID.",
    };
  }

  return {
    householdId: data,
    error: null,
  };
}