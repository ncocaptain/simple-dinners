import { supabase } from "../lib/supabase";

export type HouseholdRole = "owner" | "member";

export type HouseholdInfo = {
  id: string;
  name: string;
  ownerId: string;
  role: HouseholdRole;
  inviteCode: string;
};

export type HouseholdMember = {
  userId: string;
  role: HouseholdRole;
  email: string | null;
  displayName: string | null;
  joinedAt: string;
  isCurrentUser: boolean;
};

type HouseholdMemberRow = {
  member_user_id: string;
  member_role: string;
  member_email: string | null;
  member_display_name: string | null;
  member_joined_at: string;
  is_current_user: boolean;
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

export async function getHouseholdMembers(): Promise<
  CloudResult<HouseholdMember[]>
> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const { data, error } = await supabase.rpc(
    "get_household_members",
  );

  if (error) {
    console.error(
      "Unable to load household members:",
      error,
    );

    return {
      data: null,
      error: error.message,
    };
  }

  const rows = Array.isArray(data)
    ? (data as HouseholdMemberRow[])
    : [];

  const members: HouseholdMember[] = rows.map(
    (row) => ({
      userId: row.member_user_id,

      role:
        row.member_role === "owner"
          ? "owner"
          : "member",

      email: row.member_email,
      displayName: row.member_display_name,
      joinedAt: row.member_joined_at,
      isCurrentUser: Boolean(
        row.is_current_user,
      ),
    }),
  );

  return {
    data: members,
    error: null,
  };
}

export async function regenerateHouseholdInviteCode(): Promise<
  CloudResult<string>
> {
  if (!supabase) {
    return {
      data: null,
      error: "Cloud sync is not configured.",
    };
  }

  const { data, error } = await supabase.rpc(
    "regenerate_household_invite_code",
  );

  if (error) {
    console.error(
      "Unable to regenerate household invite code:",
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
        "Supabase did not return a new household code.",
    };
  }

  return {
    data: data.trim().toUpperCase(),
    error: null,
  };
}