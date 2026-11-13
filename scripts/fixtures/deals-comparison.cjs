// Synthetic observations only. No real retailer, location or price feed.
const now = Date.UTC(2026, 10, 13, 15);
const context = { retailerId: "retailer-a", storeId: "store-a", channel: "in-store", currency: "USD", now };
const rawItems = [
  { id: "protein", text: "Chicken Breast", normalizedName: "chicken breast", grocerySearchName: "chicken breast",
    recipeIngredientText: "20 oz chicken breast", sourceRecipe: "Fixture dinner", quantity: 20, unit: "oz",
    checked: false, addedAt: 1, category: "Meat / Seafood" },
  { id: "rice", text: "Rice", normalizedName: "rice", grocerySearchName: "rice",
    recipeIngredientText: "1 lb rice", sourceRecipe: "Fixture dinner", quantity: 1, unit: "lb",
    checked: false, addedAt: 1, category: "Pantry" },
];
const combinedRows = rawItems.map((item) => ({ id: item.id, sourceIds: [item.id], checked: false,
  pantryCoverage: "none", pantryKey: item.id, pantryRestock: false }));
const money = (amountMinor, currency = "USD") => ({ amountMinor, currency });
function offer(id, quantity, unit, amountMinor) {
  return {
    id, productId: id, needId: "need-0", productFormKey: "raw-chicken-breast", compatibility: "verified",
    packageSize: { kind: "single", basis: unit === "each" ? "count" : "net", size: { quantity, unit } },
    price: {
      productId: id, retailerId: context.retailerId, storeId: context.storeId, channel: context.channel,
      regularPrice: amountMinor === null ? null : money(amountMinor), salePrice: null,
      sellingBasis: { kind: "package" }, conditions: [], observedAt: now - 1000, expiresAt: now + 60000,
      availability: "in-stock",
    },
  };
}
const offers = [offer("small", 12, "oz", 200), offer("medium", 24, "oz", 350), offer("large", 40, "oz", 400)];
module.exports = { context, rawItems, combinedRows, money, offer, offers };
