import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

import {
  applyWalmartCors,
  walmartMode,
} from "./_walmartServer.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  applyWalmartCors(
    req,
    res,
    "GET, OPTIONS",
  );

  if (req.method === "OPTIONS") {
    return res
      .status(200)
      .end();
  }

  if (req.method !== "GET") {
    return res
      .status(405)
      .json({
        error: "GET_ONLY",
      });
  }

  const mode =
    walmartMode();

  return res
    .status(200)
    .json({
      provider:
        "walmart",
      mode,
      configured:
        mode !== "disabled",
      live:
        mode === "live",
    });
}
