import { Capacitor } from "@capacitor/core";

import type {
  GroceryRequirementGroup,
  GrocerySearchOnlyRequirement,
} from "./groceryRequirementSummary";

export const WALMART_API_ROUTES = {
  status: "/api/walmart-status",
  catalog: "/api/walmart-catalog",
  cart: "/api/walmart-cart",
} as const;

export function walmartApiUrl(
  path: string,
) {
  const explicit =
    import.meta.env.VITE_WALMART_API_BASE_URL?.trim() ||
    import.meta.env.VITE_API_BASE_URL?.trim();

  const base =
    explicit ||
    (
      Capacitor.isNativePlatform()
        ? "https://dinners.ncocaptain.com"
        : ""
    );

  return `${base}${path}`;
}

export type WalmartStore = {
  storeId: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
};

export type WalmartProduct = {
  productId: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  price?: number | null;
  available?: boolean;
  addToCartUrl?: string;
};

export type WalmartSearchIntent = {
  key: string;
  shoppingName: string;
  searchCandidate: string;
  quantity: number | null;
  unit: string | null;
  packageSize: string;
  source:
    | "measured"
    | "search-only";
};

export function buildWalmartSearchIntents(
  requirements:
    readonly GroceryRequirementGroup[],
  searchOnly:
    readonly GrocerySearchOnlyRequirement[],
): WalmartSearchIntent[] {
  const measured =
    requirements.map(
      (requirement, index) => ({
        key:
          `measured-${index}-${requirement.searchCandidate}`,
        shoppingName:
          requirement.shoppingName,
        searchCandidate:
          requirement.searchCandidate,
        quantity:
          requirement.quantity,
        unit:
          requirement.unit,
        packageSize:
          requirement.packageSize,
        source:
          "measured" as const,
      }),
    );

  const unmeasured =
    searchOnly.map(
      (requirement) => ({
        key:
          `search-${requirement.itemId}`,
        shoppingName:
          requirement.shoppingName,
        searchCandidate:
          requirement.searchCandidate,
        quantity: null,
        unit: null,
        packageSize: "",
        source:
          "search-only" as const,
      }),
    );

  return [
    ...measured,
    ...unmeasured,
  ];
}


async function walmartJsonRequest(
  path: string,
  options: RequestInit = {},
) {
  const response =
    await fetch(
      walmartApiUrl(path),
      options,
    );

  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
      `Walmart request failed (${response.status})`,
    );
  }

  return data;
}

export async function getWalmartStatus() {
  return walmartJsonRequest(
    WALMART_API_ROUTES.status,
  ) as Promise<{
    provider: "walmart";
    mode:
      | "disabled"
      | "mock"
      | "live";
    configured: boolean;
    live: boolean;
  }>;
}

export async function findWalmartStores(
  zip: string,
) {
  return walmartJsonRequest(
    `${WALMART_API_ROUTES.catalog}?action=stores&zip=${encodeURIComponent(zip)}`,
  ) as Promise<{
    provider: "walmart";
    mode: string;
    stores: WalmartStore[];
  }>;
}

export async function searchWalmartProducts(
  term: string,
  storeId?: string,
) {
  const params =
    new URLSearchParams({
      action: "products",
      term,
    });

  if (storeId) {
    params.set(
      "storeId",
      storeId,
    );
  }

  return walmartJsonRequest(
    `${WALMART_API_ROUTES.catalog}?${params.toString()}`,
  ) as Promise<{
    provider: "walmart";
    mode: string;
    storeId?: string | null;
    products: WalmartProduct[];
  }>;
}

export async function buildWalmartCart(
  items: readonly {
    productId: string;
    quantity: number;
  }[],
) {
  return walmartJsonRequest(
    WALMART_API_ROUTES.cart,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body:
        JSON.stringify({
          items,
        }),
    },
  ) as Promise<{
    provider: "walmart";
    mode: string;
    itemCount: number;
    cartUrl: string;
  }>;
}
