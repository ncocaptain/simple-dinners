import { supabase } from "../lib/supabase";

export type HouseholdRole = "owner" | "member";

export type HouseholdInfo = {
  id: string;
  name: string;
  ownerId: string;
  role: HouseholdRole;
  inviteCode: string;
};

type CloudResult<T> = {
  data: T | null;
  error: string | null;
};

type HouseholdRow = {
  household_id: string;
  household_name: string;
  household_owner_id: string;
  household_role: string;
  household_invite_code: string;
};

export async function getCurrentHousehold(): Promise<
  CloudResult<HouseholdInfo | null>
> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const { data, error } = await supabase.rpc(
    "get_current_household",
  );

  if (error) {
    console.error(
      "Unable to load current household:",
      error,
    );

    return {
      data: null,
      error: error.message,
    };
  }

  const rows = Array.isArray(data)
    ? (data as HouseholdRow[])
    : [];

  const row = rows[0];

  if (!row) {
    return {
      data: null,
      error: null,
    };
  }

  const role: HouseholdRole =
    row.household_role === "owner"
      ? "owner"
      : "member";

  return {
    data: {
      id: row.household_id,
      name: row.household_name,
      ownerId: row.household_owner_id,
      role,
      inviteCode: row.household_invite_code,
    },
    error: null,
  };
}

export async function createCurrentHousehold(
  name: string,
): Promise<CloudResult<string>> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const safeName =
    name.trim() || "My Household";

  const { data, error } = await supabase.rpc(
    "create_household",
    {
      p_name: safeName,
    },
  );

  if (error) {
    console.error(
      "Unable to create household:",
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
        "Supabase did not return a household ID.",
    };
  }

  return {
    data,
    error: null,
  };
}

export async function joinCurrentHousehold(
  inviteCode: string,
): Promise<CloudResult<string>> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const normalizedCode = inviteCode
    .trim()
    .toUpperCase();

  if (!normalizedCode) {
    return {
      data: null,
      error: "Enter a household code.",
    };
  }

  const { data, error } = await supabase.rpc(
    "join_household_by_code",
    {
      p_invite_code: normalizedCode,
    },
  );

  if (error) {
    console.error(
      "Unable to join household:",
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
        "Supabase did not return a household ID.",
    };
  }

  return {
    data,
    error: null,
  };
}