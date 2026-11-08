export type GroceryDeliveryProviderStatus =
  | "available"
  | "setup-required"
  | "application-closed"
  | "planned";

export type GroceryDeliveryProvider = {
  id: "kroger" | "instacart" | "uber";
  name: string;
  status: GroceryDeliveryProviderStatus;
  adapter:
    | "kroger-public-api"
    | "instacart-products-link"
    | "uber-consumer-delivery";
  description: string;
  shopperReviewRequired: true;
  supportsGroceryListHandoff: boolean;
  canAutoCheckout: false;
};

export const GROCERY_DELIVERY_PROVIDERS:
  readonly GroceryDeliveryProvider[] = [
  {
    id: "kroger",
    name: "Kroger",
    status: "setup-required",
    adapter: "kroger-public-api",
    description:
      "Public API access is registered in Certification. Simple Dinners is validating locations, products, and package matching before customer cart authorization.",
    shopperReviewRequired: true,
    supportsGroceryListHandoff: true,
    canAutoCheckout: false,
  },
  {
    id: "instacart",
    name: "Instacart",
    status: "application-closed",
    adapter: "instacart-products-link",
    description:
      "The Simple Dinners handoff adapter is ready, but new developer applications are currently unavailable.",
    shopperReviewRequired: true,
    supportsGroceryListHandoff: true,
    canAutoCheckout: false,
  },
  {
    id: "uber",
    name: "Uber",
    status: "application-closed",
    adapter: "uber-consumer-delivery",
    description:
      "Consumer Delivery integration is a good technical fit, but the current early-access intake is closed.",
    shopperReviewRequired: true,
    supportsGroceryListHandoff: true,
    canAutoCheckout: false,
  },
];

export function getAvailableGroceryDeliveryProviders() {
  return GROCERY_DELIVERY_PROVIDERS.filter(
    (provider) => provider.status === "available"
  );
}

export function getGroceryDeliveryProvider(
  providerId: GroceryDeliveryProvider["id"]
) {
  return GROCERY_DELIVERY_PROVIDERS.find(
    (provider) => provider.id === providerId
  );
}

export function getGroceryDeliveryProviderSummary() {
  return {
    total: GROCERY_DELIVERY_PROVIDERS.length,
    available:
      getAvailableGroceryDeliveryProviders().length,
    blocked: GROCERY_DELIVERY_PROVIDERS.filter(
      (provider) =>
        provider.status === "application-closed"
    ).length,
    setupRequired: GROCERY_DELIVERY_PROVIDERS.filter(
      (provider) =>
        provider.status === "setup-required"
    ).length,
    canAutoCheckout: false as const,
  };
}
