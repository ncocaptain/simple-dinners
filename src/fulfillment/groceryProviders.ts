import type {
  GroceryProvider,
  GroceryProviderId,
} from "./groceryProviderTypes";

const krogerEnabled =
  import.meta.env.DEV ||
  import.meta.env.VITE_KROGER_ENABLED === "true";

const walmartEnabled =
  import.meta.env.DEV ||
  import.meta.env.VITE_WALMART_ENABLED === "true";

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
      "store-locator",
      "catalog-search",
      "cart-handoff",
    ],
    headline: "Shop with Walmart",
    description:
      "Match your Simple Dinners shopping list to Walmart products and hand your selected items off to a Walmart cart.",
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
