import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";
import {
  encryptSecret,
  krogerBaseUrl,
  krogerClientCredentials,
  krogerRedirectUri,
  pkceChallenge,
  randomUrlSafe,
  requireSimpleDinnersUser,
  sha256,
  supabaseAdmin,
  authErrorStatus,
} from "./_krogerServer";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST_ONLY",
    });
  }

  try {
    const {
      user,
    } =
      await requireSimpleDinnersUser(
        req
      );

    const verifier =
      randomUrlSafe(48);
    const state =
      randomUrlSafe(32);
    const redirectUri =
      krogerRedirectUri();

    const admin =
      supabaseAdmin();

    await admin
      .from("kroger_oauth_states")
      .delete()
      .eq("user_id", user.id);

    const {
      error,
    } = await admin
      .from("kroger_oauth_states")
      .insert({
        state_hash:
          sha256(state),
        user_id: user.id,
        verifier_encrypted:
          encryptSecret(verifier),
        redirect_uri:
          redirectUri,
        expires_at:
          new Date(
            Date.now() +
              10 * 60 * 1000
          ).toISOString(),
      });

    if (error) {
      throw error;
    }

    const {
      clientId,
    } =
      krogerClientCredentials();

    const url = new URL(
      `${krogerBaseUrl()}/connect/oauth2/authorize`
    );

    url.searchParams.set(
      "client_id",
      clientId
    );
    url.searchParams.set(
      "redirect_uri",
      redirectUri
    );
    url.searchParams.set(
      "response_type",
      "code"
    );
    url.searchParams.set(
      "scope",
      "cart.basic:write profile.compact"
    );
    url.searchParams.set(
      "state",
      state
    );
    url.searchParams.set(
      "code_challenge",
      pkceChallenge(verifier)
    );
    url.searchParams.set(
      "code_challenge_method",
      "S256"
    );

    return res.status(200).json({
      url: url.toString(),
    });
  } catch (error) {
    return res
      .status(
        authErrorStatus(error)
      )
      .json({
        error:
          error instanceof Error
            ? error.message
            : "KROGER_OAUTH_START_FAILED",
      });
  }
}
