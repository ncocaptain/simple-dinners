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
  placements: FulfillmentPlacement[];

  eyebrowLabel: string;
  headline: string;
  description: string;
  ctaLabel: string;

  menuUrl: string;

  serviceAreaLabel?: string;
  secondaryLabel?: string;
  logoSrc?: string;

  capabilities: FulfillmentCapability[];

  tracking?: FulfillmentTracking;
};

export type FulfillmentPlacement =
  | "partner-preview"
  | "weekly-plan-takeout";
