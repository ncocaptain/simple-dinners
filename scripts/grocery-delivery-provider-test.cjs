const assert = require("node:assert/strict");
const fs = require("fs");
const ts = require("typescript");

const source = fs.readFileSync(
  "src/fulfillment/groceryDeliveryProviders.ts",
  "utf8"
);

const output = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;

const mod = { exports: {} };

new Function(
  "module",
  "exports",
  output
)(mod, mod.exports);

const {
  GROCERY_DELIVERY_PROVIDERS,
  getAvailableGroceryDeliveryProviders,
  getGroceryDeliveryProvider,
  getGroceryDeliveryProviderSummary,
} = mod.exports;

assert.equal(
  GROCERY_DELIVERY_PROVIDERS.length,
  3
);

assert.equal(
  getAvailableGroceryDeliveryProviders().length,
  0
);

assert.equal(
  getGroceryDeliveryProvider("kroger").status,
  "setup-required"
);

assert.equal(
  getGroceryDeliveryProvider("instacart").status,
  "application-closed"
);

assert.equal(
  getGroceryDeliveryProvider("uber").status,
  "application-closed"
);

for (const provider of GROCERY_DELIVERY_PROVIDERS) {
  assert.equal(
    provider.shopperReviewRequired,
    true
  );
  assert.equal(
    provider.canAutoCheckout,
    false
  );
  assert.equal(
    provider.supportsGroceryListHandoff,
    true
  );
}

const summary =
  getGroceryDeliveryProviderSummary();

assert.equal(summary.total, 3);
assert.equal(summary.available, 0);
assert.equal(summary.blocked, 2);
assert.equal(summary.setupRequired, 1);
assert.equal(summary.canAutoCheckout, false);

console.log("=== GROCERY DELIVERY PROVIDERS ===");
console.log("Configured providers:", summary.total);
console.log("Available now:", summary.available);
console.log("Blocked/on hold:", summary.blocked);
console.log("Setup required:", summary.setupRequired);
console.log("PASS: Provider availability is explicit");
console.log("PASS: Kroger Certification is tracked as setup-required");
console.log("PASS: Closed providers cannot become active accidentally");
console.log("PASS: Shopper review remains required");
console.log("PASS: Automatic checkout remains disabled");
