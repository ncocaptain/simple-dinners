"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const fixtures = require("./fixtures/deals-comparison.cjs");
const modules = new Map();
function load(file) {
  const filename = path.resolve(file);
  if (modules.has(filename)) return modules.get(filename).exports;
  const mod = { exports: {} };
  modules.set(filename, mod);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("require", "module", "exports", output)((name) => {
    assert.ok(name.startsWith("."), `Unexpected dependency: ${name}`);
    return load(path.resolve(path.dirname(filename), name.replace(/\.js$/, "") + ".ts"));
  }, mod, mod.exports);
  return mod.exports;
}
function freeze(value) {
  if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
const { buildShoppingPurchaseSnapshot } = load("src/deals/shoppingSnapshot.ts");
const pkg = load("src/deals/packageComparability.ts");
const math = load("src/deals/savings.ts");
const { compareStoreBaskets } = load("src/deals/basketComparison.ts");
const snapshot = buildShoppingPurchaseSnapshot({ rawItems: fixtures.rawItems,
  combinedRows: fixtures.combinedRows, pantryBuyAnywayIds: new Set() });
const context = freeze(fixtures.context);
const target = freeze({ need: snapshot.needs[0], productFormKey: "raw-chicken-breast", requirementBasis: "net" });
const offers = freeze(fixtures.offers);
const before = JSON.stringify({ snapshot, context, target, offers });
const copy = (x) => structuredClone(x);
const cost = (offer, t = target) => math.calculateRequirementCost(t, freeze(offer), context);
function requirement(quantity, unit, extra = {}) {
  return { ...target, need: { ...target.need, requirement: { quantity, unit, packageSize: "", ...extra } } };
}
function priceChange(change) { return { ...copy(offers[0].price), ...change }; }
function offerChange(change) { return { ...copy(offers[0]), ...change }; }
function suppressed(result, reason) { assert.equal(result.value, null); assert.equal(result.reason, reason); }
function close(actual, expected) { assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} != ${expected}`); }
let count = 0;
function test(name, fn) { fn(); count++; console.log("PASS:", name); }

test("20 oz requirement: two 12 oz packs vs one 24 oz pack", () => {
  const a = cost(offers[0]).value, b = cost(offers[1]).value;
  assert.equal(a.packagesNeeded, 2); assert.equal(a.purchaseCost.amountMinor, 400);
  assert.equal(b.packagesNeeded, 1); assert.equal(b.purchaseCost.amountMinor, 350);
  close(a.excess.quantity, 4 * 28.349523125);
});
test("package price, unit price and requirement cost have three different winners", () => {
  const result = math.compareNeedPrices(target, offers, context);
  assert.deepEqual(result.lowestPackagePriceOfferIds, ["small"]);
  assert.deepEqual(result.lowestUnitPriceOfferIds, ["large"]);
  assert.deepEqual(result.lowestRequirementCostOfferIds, ["medium"]);
});
test("same product/store/channel/basis regular vs sale", () => {
  const price = priceChange({ salePrice: fixtures.money(150) });
  assert.deepEqual(math.calculateSaleSavings(price, context).value, fixtures.money(50));
  assert.deepEqual(math.effectivePrice(price, context).value, fixtures.money(150));
});
test("higher/equal sale prices suppress savings and retain lower regular price", () => {
  for (const amount of [200, 250]) {
    const price = priceChange({ salePrice: fixtures.money(amount) });
    suppressed(math.calculateSaleSavings(price, context), "no-positive-savings");
    assert.equal(math.effectivePrice(price, context).value.amountMinor, 200);
  }
});
test("missing regular price cannot establish savings; missing prices are null", () => {
  const price = priceChange({ regularPrice: null, salePrice: fixtures.money(100) });
  suppressed(math.calculateSaleSavings(price, context), "missing-regular-price");
  assert.equal(math.effectivePrice(price, context).value.amountMinor, 100);
  suppressed(math.effectivePrice(priceChange({ regularPrice: null }), context), "missing-price");
  assert.equal(math.effectivePrice(priceChange({ regularPrice: fixtures.money(0) }), context).value.amountMinor, 0);
});
test("unknown package size suppresses comparisons and totals", () => {
  const unknown = offerChange({ packageSize: { kind: "single", basis: "net", size: null } });
  suppressed(cost(unknown), "unknown-package");
  const comparison = math.compareNeedPrices(target, [unknown], context);
  assert.deepEqual(comparison.lowestUnitPriceOfferIds, []);
  assert.deepEqual(comparison.lowestPackagePriceOfferIds, []);
});
test("weight-to-weight conversions and exact pound/ounce boundaries", () => {
  close(pkg.normalizeMeasure({ quantity: 1, unit: "lb" }).value.quantity, 453.59237);
  close(pkg.normalizeMeasure({ quantity: 1, unit: "kg" }).value.quantity, 1000);
  const onePound = fixtures.offer("pound", 16, "oz", 100);
  assert.equal(cost(onePound, requirement(1, "lb")).value.packagesNeeded, 1);
  assert.equal(cost(onePound, requirement(16.000001, "oz")).value.packagesNeeded, 2);
});
test("volume-to-volume US cup/fluid-ounce conversion", () => {
  const volume = fixtures.offer("volume", 8, "fl oz", 100);
  assert.equal(cost(volume, requirement(1, "cup")).value.packagesNeeded, 1);
  assert.equal(cost(fixtures.offer("litre", 1, "l", 100), requirement(1000, "ml")).value.packagesNeeded, 1);
});
test("weight vs volume, mass oz vs fl oz, cups vs grams rejected", () => {
  suppressed(cost(fixtures.offer("fluid", 24, "fl oz", 100)), "dimension-mismatch");
  suppressed(cost(offers[0], requirement(1, "cup")), "dimension-mismatch");
  suppressed(cost(offers[0], requirement(1, "each")), "dimension-mismatch");
});
test("known multipacks expand inner contents; unknown size/count do not", () => {
  const multi = { kind: "multipack", basis: "net", packCount: 2, innerSize: { quantity: 12, unit: "oz" } };
  assert.equal(cost(offerChange({ packageSize: multi })).value.packagesNeeded, 1);
  suppressed(cost(offerChange({ packageSize: { ...multi, innerSize: null } })), "unknown-package");
  suppressed(cost(offerChange({ packageSize: { ...multi, packCount: null } })), "unknown-package");
  suppressed(cost(offerChange({ packageSize: { ...multi, packCount: 1.5 } })), "unknown-package");
});
test("countable items use known package counts without count-to-weight guessing", () => {
  const t = { ...requirement(7, "count"), requirementBasis: "count" };
  const countable = fixtures.offer("count", 6, "each", 300);
  const result = cost(countable, t).value;
  assert.equal(result.packagesNeeded, 2); assert.equal(result.excess.quantity, 5);
});
test("variable-weight item supports unit quote but not an invented package total", () => {
  const variable = offerChange({ packageSize: { kind: "variable-weight", basis: "net" },
    price: priceChange({ sellingBasis: { kind: "measure", measure: { quantity: 1, unit: "lb" } } }) });
  const result = math.compareNeedPrices(target, [variable], context);
  close(result.offers[0].unitPrice.value.per.quantity, 453.59237);
  suppressed(result.offers[0].packagePrice, "variable-weight");
  suppressed(result.offers[0].requirementCost, "variable-weight");
});
test("net/drained contents and unknown bases stay distinct", () => {
  const drained = offerChange({ packageSize: { ...offers[0].packageSize, basis: "drained" } });
  suppressed(cost(drained), "basis-mismatch");
  suppressed(pkg.comparePackages(offers[0], drained), "basis-mismatch");
  suppressed(cost(offerChange({ packageSize: { ...offers[0].packageSize, basis: "unknown" } })), "basis-mismatch");
});
test("product/preparation conflicts cannot be overridden by convertible units", () => {
  const cooked = offerChange({ productFormKey: "cooked-chicken-breast" });
  suppressed(cost(cooked), "product-mismatch");
  suppressed(pkg.comparePackages(offers[0], cooked), "product-mismatch");
  suppressed(cost(offerChange({ compatibility: "unverified" })), "unverified-product");
  suppressed(cost(offerChange({ compatibility: "mismatch" })), "product-mismatch");
});
test("package comparability permits different sizes in the same equivalence class", () => {
  assert.ok(pkg.comparePackages(offers[0], offers[1]).value);
  suppressed(pkg.comparePackages(offers[0], fixtures.offer("fluid", 12, "fl oz", 200)), "dimension-mismatch");
});
test("minimum-quantity promotion uses actual required package count", () => {
  const price = priceChange({ salePrice: fixtures.money(150), conditions: [{ kind: "minimum-quantity", packages: 2 }] });
  assert.equal(math.effectivePrice(price, context).value.amountMinor, 200);
  suppressed(math.calculateSaleSavings(price, context), "minimum-quantity");
  assert.equal(math.calculateSaleSavings(price, context, 2).value.amountMinor, 50);
  assert.equal(cost(offerChange({ price })).value.purchaseCost.amountMinor, 300);
  assert.equal(cost(offerChange({ price }), requirement(1, "oz")).value.purchaseCost.amountMinor, 200);
  suppressed(math.effectivePrice({ ...price, regularPrice: null }, context), "minimum-quantity");
  const cheapThreshold = { ...price, salePrice: fixtures.money(50) };
  const promotion = cost(offerChange({ price: cheapThreshold }), requirement(1, "oz")).value;
  assert.equal(promotion.packagesNeeded, 2);
  assert.equal(promotion.minimumPackagesNeeded, 1);
  assert.equal(promotion.promotionExtraPackages, 1);
  assert.equal(promotion.purchaseCost.amountMinor, 100);
  close(promotion.excess.quantity, 23 * 28.349523125);
});
test("unresolved loyalty/coupon conditions and unsupported promotions suppress", () => {
  for (const kind of ["membership", "coupon"]) {
    const price = priceChange({ salePrice: fixtures.money(100), conditions: [{ kind, eligibility: "unknown" }] });
    suppressed(math.calculateSaleSavings(price, context), "unresolved-condition");
    suppressed(cost(offerChange({ price })), "unresolved-condition");
    assert.equal(math.effectivePrice({ ...price, conditions: [{ kind, eligibility: "eligible" }] }, context).value.amountMinor, 100);
    suppressed(math.effectivePrice({ ...price, conditions: [{ kind, eligibility: "ineligible" }] }, context), "ineligible-condition");
  }
  suppressed(cost(offerChange({ price: priceChange({ conditions: [{ kind: "unsupported-promotion", description: "BOGO" }] }) })), "unsupported-promotion");
});
test("stale and inapplicable store/channel/product observations suppress", () => {
  suppressed(cost(offerChange({ price: priceChange({ expiresAt: context.now }) })), "stale-price");
  for (const change of [{ storeId: "elsewhere" }, { retailerId: "elsewhere" }, { channel: "delivery" },
    { observedAt: context.now + 1 }, { expiresAt: NaN }]) {
    suppressed(cost(offerChange({ price: priceChange(change) })), "inapplicable-price");
  }
  suppressed(cost(offerChange({ price: priceChange({ productId: "other-sku" }) })), "product-mismatch");
  suppressed(cost(offerChange({ price: priceChange({ availability: "unknown" }) })), "unavailable");
});
test("currency mismatch and invalid/overflowing money suppress", () => {
  suppressed(cost(offerChange({ price: priceChange({ regularPrice: fixtures.money(200, "CAD") }) })), "currency-mismatch");
  for (const amount of [-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    suppressed(cost(offerChange({ price: priceChange({ regularPrice: fixtures.money(amount) }) })), "invalid-money");
  }
  suppressed(cost(offerChange({ price: priceChange({ regularPrice: fixtures.money(Number.MAX_SAFE_INTEGER) }) })), "numeric-overflow");
});
test("unspecified quantity allows observed prices, never requirement cost", () => {
  const t = { ...target, need: { ...target.need, state: "search-only", requirement: { quantity: null, unit: "", packageSize: "" } } };
  const result = math.compareNeedPrices(t, offers, context);
  assert.deepEqual(result.lowestPackagePriceOfferIds, ["small"]);
  assert.deepEqual(result.lowestRequirementCostOfferIds, []);
  suppressed(result.offers[0].requirementCost, "unspecified-quantity");
  suppressed(cost(offers[0], { ...target, need: { ...target.need, state: "needs-review" } }), "need-review");
});
test("explicit container size can cover requirement; registry defaults never supply size", () => {
  assert.equal(cost(offers[0], requirement(2, "can", { packageSize: "12 oz" })).value.packagesNeeded, 2);
  suppressed(cost(offers[0], requirement(2, "can")), "unsupported-requirement");
  suppressed(cost(offers[0], requirement(2, "clove")), "unsupported-unit");
});
const riceTarget = freeze({ need: snapshot.needs[1], productFormKey: "dry-rice", requirementBasis: "net" });
const riceOffer = freeze({ ...fixtures.offer("rice", 1, "lb", 100), needId: riceTarget.need.id, productFormKey: "dry-rice" });
const storeA = freeze({ retailerId: context.retailerId, storeId: context.storeId, channel: context.channel, offers: [...offers, riceOffer] });
const storeB = freeze({ retailerId: "retailer-b", storeId: "store-b", channel: context.channel,
  offers: [offers[1], riceOffer].map((offer) => ({ ...copy(offer), price: { ...copy(offer.price), retailerId: "retailer-b", storeId: "store-b",
    regularPrice: fixtures.money(offer.price.regularPrice.amountMinor + 50) } })) });
test("complete common basket chooses lowest requirement cost at each store", () => {
  const result = compareStoreBaskets([target, riceTarget], [storeA, storeB], context, []);
  assert.equal(result.stores[0].merchandiseSubtotal.amountMinor, 450);
  assert.equal(result.stores[1].merchandiseSubtotal.amountMinor, 550);
  assert.equal(result.stores[0].pricedItemCount, 2); assert.equal(result.stores[0].complete, true);
  assert.deepEqual(result.cheapestCompleteStores, [{ retailerId: "retailer-a", storeId: "store-a", channel: "in-store" }]);
});
test("incomplete basket reports subtotal/count/missing IDs and no winner", () => {
  const partial = { ...storeB, offers: [storeB.offers[0]] };
  const result = compareStoreBaskets([target, riceTarget], [storeA, partial], context, []);
  assert.equal(result.stores[1].pricedItemCount, 1); assert.equal(result.stores[1].totalItemCount, 2);
  assert.deepEqual(result.stores[1].missingNeedIds, [riceTarget.need.id]);
  assert.equal(result.stores[1].merchandiseSubtotal.amountMinor, 400);
  assert.deepEqual(result.cheapestCompleteStores, []);
  assert.equal(result.winnerSuppression, "incomplete-basket");
  const held = compareStoreBaskets([target], [storeA], context, ["hold:partial-pantry"]);
  assert.equal(held.stores[0].complete, false);
  assert.deepEqual(held.stores[0].missingNeedIds, ["hold:partial-pantry"]);
});
test("no priced items has null subtotal; invalid or mixed-channel baskets have no winner", () => {
  const empty = compareStoreBaskets([target], [{ ...storeA, offers: [] }], context, []);
  assert.equal(empty.stores[0].merchandiseSubtotal, null);
  for (const [targets, stores] of [[[], [storeA]], [[target, target], [storeA]],
    [[target], [storeA, storeA]], [[target], [storeA, { ...storeB, channel: "delivery" }]]]) {
    assert.equal(compareStoreBaskets(targets, stores, context, []).winnerSuppression, "invalid-basket");
  }
});
test("incomparable unit dimensions and duplicate offer IDs cannot produce false winners", () => {
  const unquantified = { ...target, need: { ...target.need, state: "search-only" } };
  const comparison = math.compareNeedPrices(unquantified, [offers[0], fixtures.offer("volume", 12, "fl oz", 50)], context);
  assert.deepEqual(comparison.lowestUnitPriceOfferIds, []);
  assert.equal(comparison.unitPriceSuppression, "dimension-mismatch");
  const duplicates = math.compareNeedPrices(target, [offers[0], { ...offers[1], id: offers[0].id }], context);
  assert.deepEqual(duplicates.lowestRequirementCostOfferIds, []);
});
test("ties are retained and inputs remain immutable", () => {
  const result = math.compareNeedPrices(target, [offers[0], { ...offers[0], id: "tie" }], context);
  assert.deepEqual(result.lowestPackagePriceOfferIds, ["small", "tie"]);
  assert.equal(JSON.stringify({ snapshot, context, target, offers }), before);
});
console.log(`PASS: ${count} Deals Phase 2 comparison scenarios (static fixtures; no network)`);
