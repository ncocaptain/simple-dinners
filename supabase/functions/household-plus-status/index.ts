import {
  createClient,
} from "npm:@supabase/supabase-js@2";

const ENTITLEMENT_ID =
  "Simple Dinners Plus";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type RevenueCatEntitlement = {
  expires_date?: string | null;
  grace_period_expires_date?: string | null;
};

type RevenueCatResponse = {
  subscriber?: {
    entitlements?: Record<
      string,
      RevenueCatEntitlement
    >;
  };
};

type MemberCheck = {
  userId: string;
  active: boolean;
  checked: boolean;
};

function jsonResponse(
  body: unknown,
  status = 200,
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
}

function entitlementIsActive(
  entitlement:
    | RevenueCatEntitlement
    | undefined,
): boolean {
  if (!entitlement) {
    return false;
  }

  /*
   * A null expiration represents a
   * non-expiring entitlement.
   */
  if (entitlement.expires_date === null) {
    return true;
  }

  const expirationTime =
    entitlement.expires_date
      ? Date.parse(
        entitlement.expires_date,
      )
      : Number.NaN;

  const gracePeriodTime =
    entitlement
      .grace_period_expires_date
      ? Date.parse(
        entitlement
          .grace_period_expires_date,
      )
      : Number.NaN;

  const now = Date.now();

  return (
    (
      Number.isFinite(expirationTime) &&
      expirationTime > now
    ) ||
    (
      Number.isFinite(gracePeriodTime) &&
      gracePeriodTime > now
    )
  );
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(
      "ok",
      {
        headers: corsHeaders,
      },
    );
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        error: "Method not allowed.",
      },
      405,
    );
  }

  try {
    const authorization =
      request.headers.get(
        "Authorization",
      );

    if (!authorization) {
      return jsonResponse(
        {
          error:
            "Authentication required.",
        },
        401,
      );
    }

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const supabaseAnonKey =
      Deno.env.get(
        "SUPABASE_ANON_KEY",
      );

    const supabaseServiceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY",
      );

    const revenueCatSecretKey =
      Deno.env.get(
        "REVENUECAT_SECRET_API_KEY",
      );

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !supabaseServiceRoleKey
    ) {
      throw new Error(
        "Supabase function secrets are unavailable.",
      );
    }

    if (!revenueCatSecretKey) {
      throw new Error(
        "RevenueCat secret API key is missing.",
      );
    }

    /*
     * This client represents the signed-in
     * user who invoked the function.
     */
    const userClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization:
              authorization,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const {
      data: {
        user,
      },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse(
        {
          error:
            "Unable to verify the signed-in user.",
        },
        401,
      );
    }

    /*
     * The service-role client is used only
     * inside this secure server function.
     */
    const adminClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const {
      data: currentMembership,
      error: membershipError,
    } = await adminClient
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipError) {
      throw membershipError;
    }

    let householdId:
      | string
      | null = null;

    let memberUserIds = [
      user.id,
    ];

    if (
      currentMembership
        ?.household_id
    ) {
      householdId =
        currentMembership
          .household_id;

      const {
        data: memberRows,
        error: membersError,
      } = await adminClient
        .from("household_members")
        .select("user_id")
        .eq(
          "household_id",
          householdId,
        );

      if (membersError) {
        throw membersError;
      }

      memberUserIds = Array.from(
        new Set(
          [
            user.id,
            ...(memberRows ?? [])
              .map(
                (row) =>
                  row.user_id,
              )
              .filter(Boolean),
          ],
        ),
      );
    }

    const memberChecks:
      MemberCheck[] =
      await Promise.all(
        memberUserIds.map(
          async (
            memberUserId,
          ): Promise<MemberCheck> => {
            try {
              const response =
                await fetch(
                  `https://api.revenuecat.com/v1/subscribers/${
                    encodeURIComponent(
                      memberUserId,
                    )
                  }`,
                  {
                    method: "GET",
                    headers: {
                      Authorization:
                        `Bearer ${revenueCatSecretKey}`,
                      Accept:
                        "application/json",
                    },
                  },
                );

              if (!response.ok) {
                console.error(
                  "RevenueCat customer check failed:",
                  memberUserId,
                  response.status,
                );

                return {
                  userId:
                    memberUserId,
                  active: false,
                  checked: false,
                };
              }

              const revenueCatData =
                await response.json() as
                  RevenueCatResponse;

              const entitlement =
                revenueCatData
                  .subscriber
                  ?.entitlements
                  ?.[ENTITLEMENT_ID];

              return {
                userId:
                  memberUserId,

                active:
                  entitlementIsActive(
                    entitlement,
                  ),

                checked: true,
              };
            } catch (error) {
              console.error(
                "Unable to check RevenueCat customer:",
                memberUserId,
                error,
              );

              return {
                userId:
                  memberUserId,
                active: false,
                checked: false,
              };
            }
          },
        ),
      );

    const personalCheck =
      memberChecks.find(
        (check) =>
          check.userId === user.id,
      );

    const householdSubscriber =
      memberChecks.find(
        (check) =>
          check.userId !== user.id &&
          check.active,
      );

    const hasPersonalPlus =
      Boolean(
        personalCheck?.active,
      );

    const hasHouseholdPlus =
      Boolean(
        householdSubscriber,
      );

    return jsonResponse({
      hasPlus:
        hasPersonalPlus ||
        hasHouseholdPlus,

      hasPersonalPlus,
      hasHouseholdPlus,

      source:
        hasPersonalPlus
          ? "personal"
          : hasHouseholdPlus
            ? "household"
            : "none",

      householdId,

      subscriptionOwnerUserId:
        hasPersonalPlus
          ? user.id
          : householdSubscriber
              ?.userId ??
            null,
    });
  } catch (error) {
    console.error(
      "Household Plus check failed:",
      error,
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to check household Plus access.",
      },
      500,
    );
  }
});