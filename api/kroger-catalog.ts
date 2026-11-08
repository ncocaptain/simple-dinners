import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";
import {
  normalizeKrogerLocations,
  normalizeKrogerProducts,
  type KrogerEnvironment,
} from "../src/fulfillment/krogerCatalog.js";

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
  const origin = String(
    req.headers.origin || ""
  );

  if (allowedOrigins.has(origin)) {
    res.setHeader(
      "Access-Control-Allow-Origin",
      origin
    );
  }

  res.setHeader("Vary", "Origin");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );
}

function environment(): KrogerEnvironment {
  return process.env.KROGER_ENV ===
    "production"
    ? "production"
    : "certification";
}

function baseUrl() {
  return environment() === "production"
    ? "https://api.kroger.com/v1"
    : "https://api-ce.kroger.com/v1";
}

async function getAccessToken() {
  const clientId =
    process.env.KROGER_CLIENT_ID?.trim();
  const clientSecret =
    process.env.KROGER_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      "KROGER_NOT_CONFIGURED"
    );
  }

  const basic = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "product.compact",
  });

  const response = await fetch(
    `${baseUrl()}/connect/oauth2/token`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${basic}`,
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    console.error(
      "[Kroger] token request failed",
      {
        environment: environment(),
        status: response.status,
        error: data,
      }
    );

    throw new Error(
      "KROGER_TOKEN_FAILED"
    );
  }

  const token =
    typeof data?.access_token === "string"
      ? data.access_token
      : "";

  if (!token) {
    throw new Error(
      "KROGER_TOKEN_MISSING"
    );
  }

  return token;
}

async function krogerGet(
  path: string,
  params: URLSearchParams,
  token: string
) {
  const response = await fetch(
    `${baseUrl()}${path}?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  return {
    response,
    data,
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "GET only",
    });
  }

  try {
    const token = await getAccessToken();
    const action = String(
      req.query.action || ""
    );

    if (action === "locations") {
      const zip = String(
        req.query.zip || ""
      ).trim();

      if (!/^\d{5}$/.test(zip)) {
        return res.status(400).json({
          error: "INVALID_ZIP",
        });
      }

      const params =
        new URLSearchParams({
          "filter.zipCode.near": zip,
          "filter.radiusInMiles": "25",
          "filter.limit": "10",
        });

      const { response, data } =
        await krogerGet(
          "/locations",
          params,
          token
        );

      if (!response.ok) {
        return res.status(502).json({
          error:
            "KROGER_LOCATIONS_FAILED",
          status: response.status,
        });
      }

      return res.status(200).json({
        provider: "kroger",
        environment: environment(),
        locations:
          normalizeKrogerLocations(data),
      });
    }

    if (action === "products") {
      const term = String(
        req.query.term || ""
      ).trim();
      const locationId = String(
        req.query.locationId || ""
      ).trim();

      if (!term) {
        return res.status(400).json({
          error: "INVALID_TERM",
        });
      }

      const params =
        new URLSearchParams({
          "filter.term": term,
          "filter.limit": "10",
        });

      if (locationId) {
        params.set(
          "filter.locationId",
          locationId
        );
      }

      let storeFilterApplied =
        Boolean(locationId);
      let warning = "";

      let result = await krogerGet(
        "/products",
        params,
        token
      );

      // Kroger Certification can return valid locations
      // while not populating store-specific product data.
      // Retry catalog-only search so CE can still prove
      // product discovery without pretending availability.
      if (
        !result.response.ok &&
        environment() ===
          "certification" &&
        locationId
      ) {
        params.delete(
          "filter.locationId"
        );
        result = await krogerGet(
          "/products",
          params,
          token
        );
        storeFilterApplied = false;
        warning =
          "Certification did not return store-specific product data, so results are catalog-only.";
      }

      if (!result.response.ok) {
        return res.status(502).json({
          error:
            "KROGER_PRODUCTS_FAILED",
          status:
            result.response.status,
        });
      }

      return res.status(200).json({
        provider: "kroger",
        environment: environment(),
        storeFilterApplied,
        warning,
        products:
          normalizeKrogerProducts(
            result.data
          ),
      });
    }

    return res.status(400).json({
      error: "INVALID_ACTION",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "KROGER_SERVER_ERROR";

    const status =
      message ===
      "KROGER_NOT_CONFIGURED"
        ? 503
        : 500;

    return res.status(status).json({
      error: message,
    });
  }
}
