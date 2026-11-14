/** Price Network source validity, independent of Phase 4 cache reuse limits.
 * Only verified curated observations enter comparison via the provider.
 * Explicit dates may shorten validity; they never escape these source ceilings.
 */
const DAY_MS = 24 * 60 * 60 * 1000;
export const PRICE_NETWORK_FRESHNESS = Object.freeze({
  // Allow a bounded two-week circular window when a curated explicit date exists.
  manual: Object.freeze({ fallbackMs: 7 * DAY_MS, maximumMs: 14 * DAY_MS }),
  "receipt-confirmed": Object.freeze({ fallbackMs: 7 * DAY_MS, maximumMs: 7 * DAY_MS }),
  "user-contributed": Object.freeze({ fallbackMs: 3 * DAY_MS, maximumMs: 3 * DAY_MS }),
  // Only an approved, verified feed's explicit date permits more than one day.
  "approved-feed": Object.freeze({ fallbackMs: DAY_MS, maximumMs: 7 * DAY_MS }),
});
export type PriceNetworkSourceType = keyof typeof PRICE_NETWORK_FRESHNESS;
export const PRICE_NETWORK_LOOKBACK_MS = Math.max(...Object.values(PRICE_NETWORK_FRESHNESS).map((policy) => policy.maximumMs));

type FreshnessInput = Readonly<{
  sourceType: PriceNetworkSourceType; observedAt: number; expiresAt: number | null;
  saleExpiresAt: number | null; hasSalePrice: boolean;
}>;
export type PriceNetworkFreshness = Readonly<
  | { status: "malformed" | "future" | "stale" }
  | { status: "valid"; observationExpiresAt: number; priceExpiresAt: number; saleCurrent: boolean }
>;

export function priceNetworkFreshness(input: FreshnessInput, now: number): PriceNetworkFreshness {
  const { observedAt, expiresAt, saleExpiresAt } = input;
  if (!Number.isFinite(now) || now < 0 || !Number.isFinite(observedAt) || observedAt < 0 ||
      [expiresAt, saleExpiresAt].some((date) => date !== null && (!Number.isFinite(date) || date <= observedAt))) {
    return { status: "malformed" };
  }
  if (observedAt > now) return { status: "future" };
  const policy = PRICE_NETWORK_FRESHNESS[input.sourceType];
  if (!policy) return { status: "malformed" };
  const observationExpiresAt = expiresAt === null ? observedAt + policy.fallbackMs
    : Math.min(expiresAt, observedAt + policy.maximumMs);
  if (!Number.isFinite(observationExpiresAt)) return { status: "malformed" };
  if (observationExpiresAt <= now) return { status: "stale" };
  const saleCurrent = input.hasSalePrice && (saleExpiresAt === null || saleExpiresAt > now);
  return { status: "valid", observationExpiresAt, saleCurrent,
    priceExpiresAt: saleCurrent && saleExpiresAt !== null ? Math.min(observationExpiresAt, saleExpiresAt) : observationExpiresAt };
}
