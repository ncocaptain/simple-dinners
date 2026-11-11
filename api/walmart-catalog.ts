import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

import {
  applyWalmartCors,
  MOCK_WALMART_STORES,
  mockWalmartProducts,
  requireWalmartAvailable,
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

  try {
    const mode =
      requireWalmartAvailable();

    const action =
      String(
        req.query.action || "",
      );

    if (
      action === "stores"
    ) {
      const zip =
        String(
          req.query.zip || "",
        ).trim();

      if (
        !/^\d{5}$/.test(zip)
      ) {
        return res
          .status(400)
          .json({
            error:
              "INVALID_ZIP",
          });
      }

      if (
        mode === "mock"
      ) {
        return res
          .status(200)
          .json({
            provider:
              "walmart",
            mode,
            stores:
              MOCK_WALMART_STORES,
          });
      }

      /*
       * Live implementation lands here once OPD access
       * is approved. Walmart's documented store locator
       * uses:
       *
       * POST
       * /affil/storeservice/v1/storeServiceLocator
       *
       * with postalCode and optional fulfillment filters.
       */

      return res
        .status(501)
        .json({
          error:
            "WALMART_LIVE_STORE_LOOKUP_NOT_ENABLED",
        });
    }

    if (
      action === "products"
    ) {
      const term =
        String(
          req.query.term || "",
        )
          .replace(/\+/g, " ")
          .trim();

      const storeId =
        String(
          req.query.storeId || "",
        ).trim();

      if (!term) {
        return res
          .status(400)
          .json({
            error:
              "INVALID_TERM",
          });
      }

      if (
        mode === "mock"
      ) {
        return res
          .status(200)
          .json({
            provider:
              "walmart",
            mode,
            storeId:
              storeId || null,
            products:
              mockWalmartProducts(
                term,
              ),
          });
      }

      /*
       * Live OPD product matching/local availability
       * will be inserted here once Walmart grants the
       * required API subscription.
       */

      return res
        .status(501)
        .json({
          error:
            "WALMART_LIVE_PRODUCT_LOOKUP_NOT_ENABLED",
        });
    }

    return res
      .status(400)
      .json({
        error:
          "INVALID_ACTION",
      });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "WALMART_SERVER_ERROR";

    return res
      .status(
        message ===
          "WALMART_NOT_CONFIGURED"
          ? 503
          : 500,
      )
      .json({
        error: message,
        mode:
          walmartMode(),
      });
  }
}
