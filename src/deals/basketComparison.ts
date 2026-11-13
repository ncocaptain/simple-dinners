import { compareNeedPrices } from "./savings";
import type {
  BasketComparison, NeedComparisonTarget, PriceContext, StoreBasketResult, StorePriceSet,
} from "./types";

/**
 * Merchandise subtotals only: no inferred tax, travel, delivery/service fees.
 * heldNeedIds must explicitly include unresolved snapshot holds (e.g. hold:rowId).
 * All stores compare the same needs, basis, currency and channel. Any incomplete
 * store prevents a winner claim across the selected stores.
 */
export function compareStoreBaskets(
  targets: readonly NeedComparisonTarget[],
  stores: readonly StorePriceSet[],
  evaluation: Readonly<Pick<PriceContext, "currency" | "now">>,
  heldNeedIds: readonly string[],
): BasketComparison {
  const ids = [...targets.map((target) => target.need.id), ...heldNeedIds];
  const storeKeys = stores.map((store) => JSON.stringify([store.retailerId, store.storeId, store.channel]));
  if (!ids.length || !stores.length || new Set(ids).size !== ids.length ||
      new Set(storeKeys).size !== stores.length || new Set(stores.map((store) => store.channel)).size > 1 ||
      stores.some((store) => !store.storeId || !store.retailerId) ||
      !/^[A-Z]{3}$/.test(evaluation.currency) || !Number.isFinite(evaluation.now)) {
    return { stores: [], cheapestCompleteStores: [], winnerSuppression: "invalid-basket" };
  }
  const results: StoreBasketResult[] = stores.map((store) => {
    const context = { ...evaluation, retailerId: store.retailerId, storeId: store.storeId, channel: store.channel };
    const selections: StoreBasketResult["selections"][number][] = [];
    const missingNeedIds = [...heldNeedIds];
    let amountMinor = 0;
    let overflow = false;
    for (const target of targets) {
      const comparison = compareNeedPrices(target, store.offers.filter((offer) => offer.needId === target.need.id), context);
      const selected = comparison.offers.find((offer) => comparison.lowestRequirementCostOfferIds.includes(offer.offerId));
      if (!selected?.requirementCost.value) { missingNeedIds.push(target.need.id); continue; }
      const cost = selected.requirementCost.value.purchaseCost;
      amountMinor += cost.amountMinor;
      overflow ||= !Number.isSafeInteger(amountMinor);
      selections.push({ needId: target.need.id, offerIds: comparison.lowestRequirementCostOfferIds, cost });
    }
    return {
      retailerId: store.retailerId, storeId: store.storeId, channel: store.channel,
      merchandiseSubtotal: !selections.length || overflow ? null : { amountMinor, currency: evaluation.currency },
      totalSuppression: overflow ? "numeric-overflow" : null,
      complete: !missingNeedIds.length && !overflow,
      pricedItemCount: selections.length, totalItemCount: ids.length,
      missingNeedIds, selections,
    };
  });
  const complete = results.every((store) => store.complete);
  const minimum = Math.min(...results.map((store) => store.merchandiseSubtotal?.amountMinor ?? Infinity));
  return {
    stores: results,
    cheapestCompleteStores: complete ? results
      .filter((store) => store.merchandiseSubtotal?.amountMinor === minimum)
      .map((store) => ({ retailerId: store.retailerId, storeId: store.storeId, channel: store.channel })) : [],
    winnerSuppression: complete ? null : "incomplete-basket",
  };
}
