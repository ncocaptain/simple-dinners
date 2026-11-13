import { compatibleBasis, normalizeMeasure, normalizeRequirement, packageCoverage, usablePackageContents } from "./packageComparability";
import type {
  BestPriceResult, Calculation, Money, NeedComparisonTarget, OfferComparison,
  PriceContext, PriceObservation, ProductOffer, RequirementCost, SuppressionReason, UnitPrice,
} from "./types";

function fail<T>(reason: SuppressionReason): Calculation<T> {
  return { value: null, reason };
}

function validMoney(money: Money): boolean {
  return Number.isSafeInteger(money.amountMinor) && money.amountMinor >= 0 && /^[A-Z]{3}$/.test(money.currency);
}

/** Explicit clock, location, channel and currency; no clock/network side effects. */
function validateObservation(price: PriceObservation, context: PriceContext): SuppressionReason | null {
  if (!price.productId || !context.storeId || !context.retailerId ||
      price.storeId !== context.storeId || price.retailerId !== context.retailerId ||
      price.channel !== context.channel || !Number.isFinite(context.now) ||
      !Number.isFinite(price.observedAt) || !Number.isFinite(price.expiresAt) ||
      price.observedAt > context.now || price.expiresAt <= price.observedAt) return "inapplicable-price";
  if (price.expiresAt <= context.now) return "stale-price";
  if (price.availability !== "in-stock") return "unavailable";
  if (price.sellingBasis.kind === "measure") {
    const normalized = normalizeMeasure(price.sellingBasis.measure);
    if (!normalized.value) return normalized.reason;
  }
  for (const money of [price.regularPrice, price.salePrice]) {
    if (money !== null && !validMoney(money)) return "invalid-money";
    if (money !== null && money.currency !== context.currency) return "currency-mismatch";
  }
  for (const condition of price.conditions) {
    if (condition.kind === "unsupported-promotion") return "unsupported-promotion";
    if (condition.kind === "minimum-quantity") {
      if (!Number.isSafeInteger(condition.packages) || condition.packages <= 0 ||
          price.sellingBasis.kind !== "package") return "unsupported-promotion";
    } else if (condition.eligibility !== "eligible") {
      return condition.eligibility === "unknown" ? "unresolved-condition" : "ineligible-condition";
    }
  }
  return null;
}

function minimumMet(price: PriceObservation, packages: number): boolean {
  return price.conditions.every((condition) => condition.kind !== "minimum-quantity" || packages >= condition.packages);
}

/** Sale price is per selling basis, never a bundle total. */
export function effectivePrice(
  price: PriceObservation, context: PriceContext, packages = 1,
): Calculation<Money> {
  const reason = validateObservation(price, context);
  if (reason) return fail(reason);
  if (!Number.isSafeInteger(packages) || packages <= 0) return fail("invalid-measure");
  const regular = price.regularPrice;
  const sale = minimumMet(price, packages) ? price.salePrice : null;
  if (sale && (!regular || sale.amountMinor < regular.amountMinor)) return { value: { ...sale } };
  if (regular) return { value: { ...regular } };
  return fail(price.salePrice && !minimumMet(price, packages) ? "minimum-quantity" : "missing-price");
}

/** Per-package (or per quoted measure) savings for this single scoped observation. */
export function calculateSaleSavings(
  price: PriceObservation, context: PriceContext, packages = 1,
): Calculation<Money> {
  const eligible = effectivePrice(price, context, packages);
  if (!eligible.value) return eligible;
  if (!price.regularPrice) return fail("missing-regular-price");
  if (!minimumMet(price, packages)) return fail("minimum-quantity");
  if (!price.salePrice) return fail("missing-price");
  const amountMinor = price.regularPrice.amountMinor - price.salePrice.amountMinor;
  if (amountMinor <= 0) return fail("no-positive-savings");
  return { value: { amountMinor, currency: context.currency } };
}

function validateOffer(
  target: NeedComparisonTarget, offer: ProductOffer,
): SuppressionReason | null {
  if (target.need.state === "needs-review") return "need-review";
  if (!target.productFormKey || offer.needId !== target.need.id ||
      offer.productId !== offer.price.productId || offer.productFormKey !== target.productFormKey ||
      offer.compatibility === "mismatch") return "product-mismatch";
  if (offer.compatibility !== "verified") return "unverified-product";
  if (target.requirementBasis === "unknown" || target.requirementBasis !== offer.packageSize.basis) return "basis-mismatch";
  return null;
}

export function calculateUnitPrice(
  target: NeedComparisonTarget, offer: ProductOffer, context: PriceContext,
): Calculation<UnitPrice> {
  const reason = validateOffer(target, offer);
  if (reason) return fail(reason);
  const price = effectivePrice(offer.price, context);
  if (!price.value) return price;
  if (offer.price.sellingBasis.kind === "measure") {
    // Variable-weight items can have a known price/kg without a known pack weight.
    if (offer.packageSize.kind !== "variable-weight") return fail("inapplicable-price");
    const measure = normalizeMeasure(offer.price.sellingBasis.measure);
    if (!measure.value) return measure;
    if (measure.value.unit !== "g" || !compatibleBasis(offer.packageSize.basis, measure.value)) {
      return fail("dimension-mismatch");
    }
    const required = normalizeRequirement(target);
    if (required.value && required.value.unit !== measure.value.unit) return fail("dimension-mismatch");
    return { value: { money: price.value, per: measure.value } };
  }
  const contents = usablePackageContents(offer.packageSize);
  if (!contents.value) return contents;
  const required = normalizeRequirement(target);
  if (required.value && required.value.unit !== contents.value.unit) return fail("dimension-mismatch");
  return { value: { money: price.value, per: contents.value } };
}

export function calculateRequirementCost(
  target: NeedComparisonTarget, offer: ProductOffer, context: PriceContext,
): Calculation<RequirementCost> {
  const reason = validateOffer(target, offer);
  if (reason) return fail(reason);
  if (offer.price.sellingBasis.kind !== "package") return fail("variable-weight");
  const coverage = packageCoverage(target, offer.packageSize);
  if (!coverage.value) return coverage;
  function plan(minimumPackages: number): Calculation<RequirementCost> {
    const covered = packageCoverage(target, offer.packageSize, minimumPackages);
    if (!covered.value) return covered;
    const price = effectivePrice(offer.price, context, covered.value.packagesNeeded);
    if (!price.value) return price;
    const amountMinor = price.value.amountMinor * covered.value.packagesNeeded;
    if (!Number.isSafeInteger(amountMinor)) return fail("numeric-overflow");
    return { value: {
      ...covered.value,
      minimumPackagesNeeded: coverage.value!.packagesNeeded,
      promotionExtraPackages: covered.value.packagesNeeded - coverage.value!.packagesNeeded,
      purchaseCost: { amountMinor, currency: context.currency },
    } };
  }
  const base = plan(1);
  // A known per-pack threshold has only two relevant purchase counts: the
  // coverage minimum and max(coverage minimum, promotion minimum). Select the
  // cheaper eligible plan and retain all excess, rather than applying a discount
  // to an insufficient quantity or silently overbuying.
  const threshold = Math.max(1, ...offer.price.conditions.map((condition) =>
    condition.kind === "minimum-quantity" ? condition.packages : 1));
  if (threshold <= coverage.value.packagesNeeded || !offer.price.salePrice) return base;
  const promotional = plan(threshold);
  if (!base.value) return promotional.value ? promotional : base;
  return promotional.value && promotional.value.purchaseCost.amountMinor < base.value.purchaseCost.amountMinor
    ? promotional : base;
}

export function compareNeedPrices(
  target: NeedComparisonTarget, offers: readonly ProductOffer[], context: PriceContext,
): BestPriceResult {
  const duplicateIds = new Set(offers.map((offer) => offer.id)).size !== offers.length;
  const results: OfferComparison[] = offers.map((offer) => {
    const reason = duplicateIds || !offer.id ? "inapplicable-price" : validateOffer(target, offer);
    const contents = usablePackageContents(offer.packageSize);
    const required = normalizeRequirement(target);
    // Observed package price is deliberately not a price per kg or an unknown pack.
    const packagePrice = reason ? fail<Money>(reason)
      : offer.price.sellingBasis.kind !== "package" ? fail<Money>("variable-weight")
      : !contents.value ? contents
      : required.value && required.value.unit !== contents.value.unit ? fail<Money>("dimension-mismatch")
      : effectivePrice(offer.price, context);
    return {
      offerId: offer.id, packagePrice,
      unitPrice: reason ? fail<UnitPrice>(reason) : calculateUnitPrice(target, offer, context),
      requirementCost: reason ? fail<RequirementCost>(reason) : calculateRequirementCost(target, offer, context),
    };
  });
  function lowest(score: (result: OfferComparison) => number | null): string[] {
    let minimum = Infinity;
    let ids: string[] = [];
    for (const result of results) {
      const value = score(result);
      if (value === null || !Number.isFinite(value)) continue;
      if (value < minimum) { minimum = value; ids = [result.offerId]; }
      else if (value === minimum) ids.push(result.offerId);
    }
    return ids;
  }
  const units = new Set(results.flatMap((result) => result.unitPrice.value ? [result.unitPrice.value.per.unit] : []));
  return {
    offers: results,
    lowestPackagePriceOfferIds: lowest((result) => result.packagePrice.value?.amountMinor ?? null),
    // Never compare price/g against price/ml, even for the same product label.
    lowestUnitPriceOfferIds: units.size > 1 ? [] : lowest((result) => result.unitPrice.value
      ? result.unitPrice.value.money.amountMinor / result.unitPrice.value.per.quantity : null),
    unitPriceSuppression: units.size > 1 ? "dimension-mismatch" : null,
    lowestRequirementCostOfferIds: lowest((result) => result.requirementCost.value?.purchaseCost.amountMinor ?? null),
  };
}
