import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";
import {
  buildInstacartShoppingListPayload,
} from "../src/fulfillment/instacartShoppingList.js";
import type {
  GroceryRequirementGroup,
} from "../src/fulfillment/groceryRequirementSummary.js";

const allowedOrigins = new Set([
  "https://dinners.ncocaptain.com",
  "capacitor://localhost",
  "http://localhost",
  "https://localhost",
  "http://localhost:5173",
]);

function applyCors(
  req: VercelRequest,
  res: VercelResponse
) {
  const origin = String(req.headers.origin || "");

  if (allowedOrigins.has(origin)) {
    res.setHeader(
      "Access-Control-Allow-Origin",
      origin
    );
  }

  res.setHeader("Vary", "Origin");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST only",
    });
  }

  const apiKey =
    process.env.INSTACART_API_KEY?.trim();

  if (!apiKey) {
    return res.status(503).json({
      error: "INSTACART_NOT_CONFIGURED",
      message:
        "Instacart is not configured yet. Add INSTACART_API_KEY to the server environment.",
    });
  }

  const requirements =
    Array.isArray(req.body?.requirements)
      ? req.body.requirements
      : [];

  if (
    requirements.length === 0 ||
    requirements.length > 100
  ) {
    return res.status(400).json({
      error: "INVALID_REQUIREMENTS",
      message:
        "A grocery list must contain between 1 and 100 requirements.",
    });
  }

  try {
    const linkBackUrl =
      typeof req.body?.linkBackUrl === "string"
        ? req.body.linkBackUrl
        : "";

    const payload =
      buildInstacartShoppingListPayload(
        requirements as GroceryRequirementGroup[],
        {
          title: "Simple Dinners Grocery List",
          linkBackUrl,
          expiresInDays: 7,
        }
      );

    // Development is the safe default. Production must
    // be explicitly enabled after Instacart production approval.
    const production =
      process.env.INSTACART_ENV === "production";

    const baseUrl = production
      ? "https://connect.instacart.com"
      : "https://connect.dev.instacart.tools";

    const response = await fetch(
      `${baseUrl}/idp/v1/products/products_link`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response
      .json()
      .catch(() => null);

    if (!response.ok) {
      console.error(
        "[Instacart] shopping list creation failed",
        {
          status: response.status,
          error: data,
        }
      );

      return res.status(502).json({
        error: "INSTACART_REQUEST_FAILED",
        message:
          "Instacart could not create the shopping list.",
        status: response.status,
      });
    }

    const url =
      typeof data?.products_link_url === "string"
        ? data.products_link_url
        : "";

    if (!url) {
      return res.status(502).json({
        error: "INSTACART_MISSING_LINK",
        message:
          "Instacart did not return a shopping list URL.",
      });
    }

    return res.status(200).json({
      url,
      provider: "instacart",
      environment:
        production ? "production" : "development",
      lineItems: payload.line_items.length,
    });
  } catch (error) {
    console.error(
      "[Instacart] shopping list error",
      error
    );

    return res.status(500).json({
      error: "INSTACART_SERVER_ERROR",
      message:
        error instanceof Error
          ? error.message
          : "Unable to create Instacart shopping list.",
    });
  }
}
