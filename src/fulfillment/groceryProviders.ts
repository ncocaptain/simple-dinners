import type {
  GroceryProvider,
  GroceryProviderId,
} from "./groceryProviderTypes";

const krogerEnabled =
  import.meta.env.DEV ||
  import.meta.env.VITE_KROGER_ENABLED === "true";

const walmartEnabled =
  import.meta.env.VITE_WALMART_ENABLED !== "false";

export const GROCERY_PROVIDERS:
  readonly GroceryProvider[] = [
  {
    id: "kroger",
    name: "Kroger Family Stores",
    shortName: "Kroger",
    enabled: krogerEnabled,
    requiresPlus: true,
    status: "live",
    capabilities: [
      "store-locator",
      "catalog-search",
      "account-link",
      "cart-write",
    ],
    headline: "Shop with Kroger Family Stores",
    description:
      "Match your Simple Dinners shopping list to products at participating Kroger Family stores, choose the items you want, and send them to your cart.",
  },
  {
    id: "walmart",
    name: "Walmart",
    shortName: "Walmart",
    enabled: walmartEnabled,
    requiresPlus: true,
    status: "scaffold",
    capabilities: [
      "search-handoff",
    ],
    headline: "Shop with Walmart",
    description:
      "Open your Simple Dinners grocery items on Walmart to choose products and complete checkout directly with Walmart.",
  },
];

export function getGroceryProvider(
  providerId: GroceryProviderId,
) {
  return GROCERY_PROVIDERS.find(
    (provider) =>
      provider.id === providerId,
  );
}

export function getEnabledGroceryProviders() {
  return GROCERY_PROVIDERS.filter(
    (provider) =>
      provider.enabled,
  );
}
