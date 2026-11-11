import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

import {
  applyWalmartCors,
  mockAddToCartUrl,
  requireWalmartAvailable,
} from "./_walmartServer.js";

type WalmartCartItem = {
  productId: string;
  quantity: number;
};

function parseItems(
  value: unknown,
):
  WalmartCartItem[] | null {
  if (
    !Array.isArray(value) ||
    value.length < 1 ||
    value.length > 100
  ) {
    return null;
  }

  const items =
    value.map(
      (entry) => {
        const record =
          entry &&
          typeof entry ===
            "object"
            ? entry as
                Record<
                  string,
                  unknown
                >
            : {};

        const productId =
          String(
            record.productId ||
              "",
          ).trim();

        const quantity =
          Number(
            record.quantity,
          );

        return {
          productId,
          quantity,
        };
      },
    );

  if (
    items.some(
      (item) =>
        !item.productId ||
        !Number.isInteger(
          item.quantity,
        ) ||
        item.quantity < 1 ||
        item.quantity > 99,
    )
  ) {
    return null;
  }

  return items;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  applyWalmartCors(
    req,
    res,
    "POST, OPTIONS",
  );

  if (req.method === "OPTIONS") {
    return res
      .status(200)
      .end();
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({
        error: "POST_ONLY",
      });
  }

  try {
    const mode =
      requireWalmartAvailable();

    const items =
      parseItems(
        req.body?.items,
      );

    if (!items) {
      return res
        .status(400)
        .json({
          error:
            "INVALID_CART_ITEMS",
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
          itemCount:
            items.length,
          cartUrl:
            mockAddToCartUrl(
              items.map(
                (item) =>
                  item.productId,
              ),
            ),
        });
    }

    /*
     * Walmart's live response may supply an affiliate
     * add-to-cart URL or use the public Add To Cart
     * service. We normalize either path to cartUrl.
     */

    return res
      .status(501)
      .json({
        error:
          "WALMART_LIVE_CART_HANDOFF_NOT_ENABLED",
      });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "WALMART_CART_SERVER_ERROR";

    return res
      .status(
        message ===
          "WALMART_NOT_CONFIGURED"
          ? 503
          : 500,
      )
      .json({
        error: message,
      });
  }
}
