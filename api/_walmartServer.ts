import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

export type WalmartMode =
  | "disabled"
  | "mock"
  | "live";

const WALMART_ALLOWED_ORIGINS =
  new Set([
    "https://dinners.ncocaptain.com",
    "capacitor://localhost",
    "http://localhost",
    "https://localhost",
    "http://localhost:5173",
  ]);

export function applyWalmartCors(
  req: VercelRequest,
  res: VercelResponse,
  methods: string,
) {
  const origin =
    String(
      req.headers.origin || "",
    );

  if (
    WALMART_ALLOWED_ORIGINS.has(
      origin,
    )
  ) {
    res.setHeader(
      "Access-Control-Allow-Origin",
      origin,
    );
  }

  res.setHeader(
    "Vary",
    "Origin",
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    methods,
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type",
  );
}

export function walmartMode():
  WalmartMode {
  const mode =
    process.env.WALMART_MODE
      ?.trim()
      .toLowerCase();

  if (mode === "mock") {
    return "mock";
  }

  if (
    mode === "live" &&
    process.env.WALMART_CONSUMER_ID?.trim() &&
    process.env.WALMART_CLIENT_SECRET?.trim()
  ) {
    return "live";
  }

  return "disabled";
}

export function requireWalmartAvailable() {
  const mode =
    walmartMode();

  if (mode === "disabled") {
    throw new Error(
      "WALMART_NOT_CONFIGURED",
    );
  }

  return mode;
}

export function walmartApiBaseUrl() {
  return (
    process.env.WALMART_API_BASE_URL
      ?.trim() ||
    "https://developer.api.walmart.com/api-proxy/service"
  );
}

/*
 * Live OAuth is intentionally isolated here.
 * Nothing calls this while WALMART_MODE=mock.
 */
export async function getWalmartAccessToken() {
  if (walmartMode() !== "live") {
    throw new Error(
      "WALMART_LIVE_MODE_REQUIRED",
    );
  }

  const consumerId =
    process.env.WALMART_CONSUMER_ID
      ?.trim();

  const clientSecret =
    process.env.WALMART_CLIENT_SECRET
      ?.trim();

  if (
    !consumerId ||
    !clientSecret
  ) {
    throw new Error(
      "WALMART_CREDENTIALS_MISSING",
    );
  }

  const response =
    await fetch(
      `${walmartApiBaseUrl()}/identity/oauth/v1/token`,
      {
        method: "POST",
        headers: {
          "cache-control":
            "no-cache",
          "content-type":
            "application/x-www-form-urlencoded",
          "wm_consumer.id":
            consumerId,
        },
        body:
          new URLSearchParams({
            grant_type:
              "client_credentials",
            client_id:
              consumerId,
            client_secret:
              clientSecret,
          }),
      },
    );

  const data =
    await response
      .json()
      .catch(() => null);

  if (
    !response.ok ||
    typeof data?.access_token !==
      "string"
  ) {
    throw new Error(
      "WALMART_TOKEN_FAILED",
    );
  }

  return data.access_token;
}

export const MOCK_WALMART_STORES = [
  {
    storeId: "1318",
    name: "Walmart Supercenter",
    address:
      "3200 Fort Henry Dr",
    city: "Kingsport",
    state: "TN",
    postalCode: "37664",
  },
  {
    storeId: "742",
    name: "Walmart Supercenter",
    address:
      "3111 Browns Mill Rd",
    city: "Johnson City",
    state: "TN",
    postalCode: "37604",
  },
];

const MOCK_PRODUCTS = [
  {
    productId:
      "100000001",
    name:
      "Great Value Whole Milk",
    brand:
      "Great Value",
    imageUrl: "",
    price: 3.18,
    available: true,
  },
  {
    productId:
      "100000002",
    name:
      "Fresh Honeycrisp Apples",
    brand:
      "Fresh Produce",
    imageUrl: "",
    price: 1.87,
    available: true,
  },
  {
    productId:
      "100000003",
    name:
      "Great Value Ground Beef 80/20",
    brand:
      "Great Value",
    imageUrl: "",
    price: 5.47,
    available: true,
  },
  {
    productId:
      "100000004",
    name:
      "Great Value Chili Beans",
    brand:
      "Great Value",
    imageUrl: "",
    price: 0.88,
    available: true,
  },
];

export function mockWalmartProducts(
  term: string,
) {
  const normalized =
    term
      .toLowerCase()
      .trim();

  if (!normalized) {
    return [];
  }

  const tokens =
    normalized
      .split(/\s+/)
      .filter(Boolean);

  const matching =
    MOCK_PRODUCTS.filter(
      (product) => {
        const haystack =
          `${product.name} ${product.brand}`
            .toLowerCase();

        return tokens.some(
          (token) =>
            haystack.includes(
              token,
            ),
        );
      },
    );

  if (matching.length) {
    return matching;
  }

  const displayName =
    term
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );

  const mockId =
    "mock-" +
    normalized
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  return [
    {
      productId:
        mockId || "mock-item",
      name:
        `Walmart Match · ${displayName}`,
      brand:
        "Mock Walmart Product",
      imageUrl: "",
      price: 3.48,
      available: true,
    },
  ];
}

export function mockAddToCartUrl(
  itemIds: readonly string[],
) {
  const items =
    itemIds
      .map(
        (id) =>
          encodeURIComponent(
            id,
          ),
      )
      .join(",");

  /*
   * Local/mock-only placeholder.
   * We will replace this with Walmart's returned
   * affiliate/shoppable-cart URL once approved.
   */
  return (
    "https://www.walmart.com/" +
    `?simpleDinnersMockCart=${items}`
  );
}
