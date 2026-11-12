export type GroceryProviderId =
  | "kroger"
  | "walmart";

export type GroceryProviderStatus =
  | "live"
  | "scaffold";

export type GroceryProviderCapability =
  | "store-locator"
  | "catalog-search"
  | "account-link"
  | "cart-write"
  | "cart-handoff"
  | "search-handoff";

export type GroceryProvider = {
  id: GroceryProviderId;
  name: string;
  shortName: string;
  enabled: boolean;
  requiresPlus: boolean;
  status: GroceryProviderStatus;
  capabilities: GroceryProviderCapability[];
  headline: string;
  description: string;
};
