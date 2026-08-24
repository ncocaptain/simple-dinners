import type {
  FulfillmentPlacement,
  FulfillmentProvider,
} from "./types";

const smashMealsMenuUrl =
  import.meta.env.VITE_SMASHMEALS_MENU_URL?.trim() ||
  "https://smashmeals.com/menu";

export const FULFILLMENT_PROVIDERS: FulfillmentProvider[] = [
  {
  id: "smashmeals",
  name: "SmashMeals",

  kind: "prepared-meals",

  enabled: true,
  placements: [
  "partner-preview",
  "weekly-plan-takeout",
],

  eyebrowLabel: "Local backup dinner",
  headline: "Too busy to cook tonight?",

  description:
    "SmashMeals offers fresh, ready-to-heat meals for busy weeks, sports nights, and nights when cooking just isn't happening.",

  ctaLabel: "View This Week's Menu",

  menuUrl: smashMealsMenuUrl,

  serviceAreaLabel: "Tri-Cities pickup & delivery",
secondaryLabel: "Shipping available",

serviceAreaUrl:
  "https://smashmeals.com/service-areas",

serviceAreaCtaLabel: "Check service area",

  logoSrc: "/partners/smashmeals/logo.png",

  capabilities: [
    "external-menu",
    "pickup",
  ],

  tracking: {
    source: "simple_dinners",
    medium: "partner",
    campaign: "backup_dinner",
  },
},
];

export function getFulfillmentProvider(
  providerId: string,
): FulfillmentProvider | undefined {
  return FULFILLMENT_PROVIDERS.find(
    (provider) =>
      provider.enabled &&
      provider.id === providerId,
  );
}

export function getEnabledFulfillmentProviders(
  placement?: FulfillmentPlacement,
): FulfillmentProvider[] {
  return FULFILLMENT_PROVIDERS.filter(
    (provider) =>
      provider.enabled &&
      (
        !placement ||
        provider.placements.includes(placement)
      ),
  );
}

export function buildFulfillmentProviderUrl(
  provider: FulfillmentProvider,
  placement?: FulfillmentPlacement,
): string {
  try {
    const url = new URL(provider.menuUrl);

    if (provider.tracking) {
      url.searchParams.set(
        "utm_source",
        provider.tracking.source,
      );

      url.searchParams.set(
        "utm_medium",
        provider.tracking.medium,
      );

      url.searchParams.set(
        "utm_campaign",
        provider.tracking.campaign,
      );
    }

    if (placement?.trim()) {
      url.searchParams.set(
        "utm_content",
        placement.trim(),
      );
    }

    return url.toString();
  } catch {
    return provider.menuUrl;
  }
}
