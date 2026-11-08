import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";
import {
  deleteKrogerConnection,
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

      return res.status(200).json({
        connected:
          Boolean(connection),
        environment:
          connection?.environment ??
          krogerEnvironment(),
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
