export type FulfillmentProviderKind =
  | "prepared-meals"
  | "restaurant-discovery"
  | "delivery";

export type FulfillmentCapability =
  | "external-menu"
  | "pickup"
  | "delivery";

export type FulfillmentTracking = {
  source: string;
  medium: string;
  campaign: string;
};

export type FulfillmentProvider = {
  id: string;
  name: string;

  kind: FulfillmentProviderKind;

  enabled: boolean;

  description: string;
  ctaLabel: string;

  menuUrl: string;

  serviceAreaLabel?: string;
  logoSrc?: string;

  capabilities: FulfillmentCapability[];

  tracking?: FulfillmentTracking;
};
