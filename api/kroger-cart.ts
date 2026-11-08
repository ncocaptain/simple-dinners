import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";
import {
  authErrorStatus,
  getKrogerUserAccessToken,
  krogerBaseUrl,
  requireSimpleDinnersUser,
} from "./_krogerServer";

type CartItem = {
  upc: string;
  quantity: number;
};

function validCartItems(
  value: unknown
): CartItem[] | null {
  if (
    !Array.isArray(value) ||
    value.length < 1 ||
    value.length > 100
  ) {
    return null;
  }

  const items =
    value.map((entry) => {
      const item =
        entry &&
        typeof entry ===
          "object"
          ? (entry as Record<
              string,
              unknown
            >)
          : {};

      const upc =
        typeof item.upc ===
        "string"
          ? item.upc.trim()
          : "";

      const quantity =
        Number(item.quantity);

      return {
        upc,
        quantity:
          Number.isInteger(quantity)
            ? quantity
            : 0,
      };
    });

  if (
    items.some(
      (item) =>
        !/^\d{8,14}$/.test(
          item.upc
        ) ||
        item.quantity < 1 ||
        item.quantity > 99
    )
  ) {
    return null;
  }

  return items;
}

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

    const items =
      validCartItems(
        req.body?.items
      );

    if (!items) {
      return res
        .status(400)
        .json({
          error:
            "INVALID_CART_ITEMS",
        });
    }

    const accessToken =
      await getKrogerUserAccessToken(
        user.id
      );

    const response =
      await fetch(
        `${krogerBaseUrl()}/cart/add`,
        {
          method: "PUT",
          headers: {
            Accept:
              "application/json",
            Authorization:
              `Bearer ${accessToken}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            items,
          }),
        }
      );

    if (!response.ok) {
      const body =
        await response
          .text()
          .catch(() => "");

      console.error(
        "[Kroger] cart add failed",
        {
          status:
            response.status,
          body:
            body.slice(0, 300),
        }
      );

      return res
        .status(502)
        .json({
          error:
            "KROGER_CART_ADD_FAILED",
          status:
            response.status,
        });
    }

    return res
      .status(200)
      .json({
        added: items.length,
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
            : "KROGER_CART_SERVER_ERROR",
      });
  }
}
