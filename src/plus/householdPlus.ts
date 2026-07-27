import { supabase } from "../lib/supabase";

export type HouseholdPlusSource =
  | "personal"
  | "household"
  | "none";

export type HouseholdPlusStatus = {
  hasPlus: boolean;
  hasPersonalPlus: boolean;
  hasHouseholdPlus: boolean;
  source: HouseholdPlusSource;
  householdId: string | null;
  subscriptionOwnerUserId: string | null;
};

type HouseholdPlusResult = {
  data: HouseholdPlusStatus | null;
  error: string | null;
};

export async function getHouseholdPlusStatus():
  Promise<HouseholdPlusResult> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const { data, error } =
    await supabase.functions.invoke(
      "household-plus-status",
      {
        method: "POST",
        body: {},
      },
    );

  if (error) {
    console.error(
      "Unable to check household Plus status:",
      error,
    );

    return {
      data: null,
      error: error.message,
    };
  }

  if (
    typeof data !== "object" ||
    data === null
  ) {
    return {
      data: null,
      error:
        "Household Plus status was unavailable.",
    };
  }

  return {
    data: {
      hasPlus:
        data.hasPlus === true,

      hasPersonalPlus:
        data.hasPersonalPlus === true,

      hasHouseholdPlus:
        data.hasHouseholdPlus === true,

      source:
        data.source === "personal" ||
        data.source === "household"
          ? data.source
          : "none",

      householdId:
        typeof data.householdId === "string"
          ? data.householdId
          : null,

      subscriptionOwnerUserId:
        typeof data.subscriptionOwnerUserId ===
        "string"
          ? data.subscriptionOwnerUserId
          : null,
    },
    error: null,
  };
}