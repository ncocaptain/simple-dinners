import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";
import {
  decryptSecret,
  krogerBaseUrl,
  krogerClientCredentials,
  saveKrogerConnection,
  sha256,
  simpleDinnersAppOrigin,
  supabaseAdmin,
} from "./_krogerServer.js";

function responsePage(
  connected: boolean,
  message: string
) {
  const safeMessage =
    JSON.stringify(message);
  const targetOrigin =
    JSON.stringify(
      simpleDinnersAppOrigin()
    );

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Kroger Connection</title>
</head>
<body style="font-family:system-ui;padding:32px;background:#09111f;color:#f8fafc">
  <h2>${connected ? "Kroger connected" : "Kroger connection failed"}</h2>
  <p>${message}</p>
  <script>
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "simple-dinners-kroger-oauth",
          connected: ${connected ? "true" : "false"},
          message: ${safeMessage}
        },
        ${targetOrigin}
      );
    }
    setTimeout(() => window.close(), 1000);
  </script>
</body>
</html>`;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .send("GET only");
  }

  const code =
    String(
      req.query.code || ""
    ).trim();
  const state =
    String(
      req.query.state || ""
    ).trim();

  if (!code || !state) {
    return res
      .status(400)
      .send(
        responsePage(
          false,
          "Missing Kroger authorization response."
        )
      );
  }

  const admin =
    supabaseAdmin();

  const {
    data,
    error,
  } = await admin
    .from("kroger_oauth_states")
    .select("*")
    .eq(
      "state_hash",
      sha256(state)
    )
    .maybeSingle();

  if (
    error ||
    !data ||
    new Date(
      data.expires_at
    ).getTime() < Date.now()
  ) {
    return res
      .status(400)
      .send(
        responsePage(
          false,
          "The Kroger connection request expired or was invalid."
        )
      );
  }

  try {
    const {
      basic,
    } =
      krogerClientCredentials();

    const response =
      await fetch(
        `${krogerBaseUrl()}/connect/oauth2/token`,
        {
          method: "POST",
          headers: {
            Accept:
              "application/json",
            Authorization:
              `Basic ${basic}`,
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body:
            new URLSearchParams({
              grant_type:
                "authorization_code",
              code,
              redirect_uri:
                data.redirect_uri,
              code_verifier:
                decryptSecret(
                  data
                    .verifier_encrypted
                ),
            }),
        }
      );

    const tokenData =
      await response
        .json()
        .catch(() => null);

    if (
      !response.ok ||
      typeof tokenData
        ?.access_token !==
        "string"
    ) {
      throw new Error(
        "KROGER_TOKEN_EXCHANGE_FAILED"
      );
    }

    await saveKrogerConnection(
      data.user_id,
      tokenData
    );

    await admin
      .from(
        "kroger_oauth_states"
      )
      .delete()
      .eq("id", data.id);

    return res
      .status(200)
      .send(
        responsePage(
          true,
          "You can return to Simple Dinners."
        )
      );
  } catch (error) {
    await admin
      .from(
        "kroger_oauth_states"
      )
      .delete()
      .eq("id", data.id);

    return res
      .status(500)
      .send(
        responsePage(
          false,
          error instanceof Error
            ? error.message
            : "Kroger connection failed."
        )
      );
  }
}
