import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";
import {
  applyKrogerCors,
  decryptSecret,
  loadKrogerConnection,
  requireSimpleDinnersUser,
  authErrorStatus,
} from "./_krogerServer";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  applyKrogerCors(
    req,
    res,
    "GET, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "GET_ONLY",
    });
  }

  try {
    const { user } =
      await requireSimpleDinnersUser(
        req
      );

    const connection =
      await loadKrogerConnection(
        user.id
      );

    if (!connection) {
      return res.status(200).json({
        connected: false,
        storedAccessToken: false,
        storedRefreshToken: false,
        accessTokenDecrypts: false,
        refreshTokenDecrypts: false,
      });
    }

    let accessTokenDecrypts = false;
    let refreshTokenDecrypts = false;
    let accessTokenError = "";
    let refreshTokenError = "";

    try {
      const value =
        decryptSecret(
          connection
            .access_token_encrypted
        );
      accessTokenDecrypts =
        Boolean(value);
    } catch (error) {
      accessTokenError =
        error instanceof Error
          ? error.message
          : "UNKNOWN";
    }

    if (
      connection
        .refresh_token_encrypted
    ) {
      try {
        const value =
          decryptSecret(
            connection
              .refresh_token_encrypted
          );
        refreshTokenDecrypts =
          Boolean(value);
      } catch (error) {
        refreshTokenError =
          error instanceof Error
            ? error.message
            : "UNKNOWN";
      }
    }

    return res.status(200).json({
      connected: true,
      storedAccessToken: true,
      storedRefreshToken:
        Boolean(
          connection
            .refresh_token_encrypted
        ),
      accessTokenDecrypts,
      refreshTokenDecrypts,
      accessTokenError:
        accessTokenError || null,
      refreshTokenError:
        refreshTokenError || null,
      environment:
        connection.environment,
      expiresAt:
        connection.expires_at,
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
            : "KROGER_DEBUG_FAILED",
      });
  }
}
