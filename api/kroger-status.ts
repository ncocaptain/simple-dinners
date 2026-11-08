import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";
import {
  deleteKrogerConnection,
  decryptSecret,
  krogerEnvironment,
  loadKrogerConnection,
  requireSimpleDinnersUser,
  authErrorStatus,
  applyKrogerCors,
} from "./_krogerServer";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const {
      user,
    } =
      await requireSimpleDinnersUser(
        req
      );

    if (req.method === "GET") {
      const connection =
        await loadKrogerConnection(
          user.id
        );

      let tokenHealth:
        | {
            accessTokenDecrypts: boolean;
            refreshTokenDecrypts:
              boolean | null;
            error?: string;
          }
        | null = null;

      if (connection) {
        try {
          const accessToken =
            decryptSecret(
              connection
                .access_token_encrypted
            );

          let refreshTokenDecrypts:
            boolean | null = null;

          if (
            connection
              .refresh_token_encrypted
          ) {
            refreshTokenDecrypts =
              Boolean(
                decryptSecret(
                  connection
                    .refresh_token_encrypted
                )
              );
          }

          tokenHealth = {
            accessTokenDecrypts:
              Boolean(accessToken),
            refreshTokenDecrypts,
          };
        } catch (tokenError) {
          tokenHealth = {
            accessTokenDecrypts: false,
            refreshTokenDecrypts:
              connection
                .refresh_token_encrypted
                ? false
                : null,
            error:
              tokenError instanceof Error
                ? tokenError.message
                : "UNKNOWN_TOKEN_ERROR",
          };
        }
      }

      return res.status(200).json({
        connected:
          Boolean(connection),
        environment:
          connection?.environment ??
          krogerEnvironment(),
        tokenHealth,
      });
    }

    if (req.method === "DELETE") {
      await deleteKrogerConnection(
        user.id
      );

      return res.status(200).json({
        connected: false,
      });
    }

    return res.status(405).json({
      error:
        "GET_OR_DELETE_ONLY",
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
            : "KROGER_STATUS_FAILED",
      });
  }
}
