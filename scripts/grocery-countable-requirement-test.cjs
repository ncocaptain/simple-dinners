const assert = require("node:assert/strict");
const fs = require("fs");
const ts = require("typescript");

const source = fs.readFileSync(
  "src/fulfillment/groceryRequirementSummary.ts",
  "utf8"
);

const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020
  }
});

const mod = { exports: {} };

new Function(
  "module", "exports", compiled.outputText
)(mod, mod.exports);

const summarize =
  mod.exports.summarizeGroceryRequirements;

const cases = [
  ["graham cracker sheets", 4, "4 graham cracker sheets"],
  ["ready-to-eat vanilla pudding snack cups", 4, "4 ready-to-eat vanilla pudding snack cups"],
  ["ripe bananas", 2, "2 ripe bananas"],
  ["vanilla wafer cookies", 16, "16 vanilla wafer cookies"],
  ["ready-to-eat chocolate pudding snack cups", 4, "4 ready-to-eat chocolate pudding snack cups"],
  ["chocolate sandwich cookies", 8, "8 chocolate sandwich cookies"],
  ["gummy worms", 4, "4 gummy worms, optional"],
  ["chicken breast", 4, "4 skinless chicken breasts"],
  ["ahi tuna steak", 2, "2 ahi tuna steaks (about 6 oz each)"],
  ["egg", 1, "1 large egg, beaten"],
  ["cherry pepper", 6, "6 cherry peppers, chopped"],
  ["jalapeno smoked sausage", 4, "4 jalapeño smoked sausages, sliced into medallions"],
  ["green bell pepper", 1, "1 green bell pepper, diced"],
  ["yellow onion", 1, "1 small yellow onion, finely diced"]
];

const lines = cases.map(([name, qty, raw], index) => ({
  itemId: String(index),
  shoppingName: name,
  searchCandidate: name,
  sourceRecipe: "Test Recipe",
  originalIngredient: raw,
  quantity: qty,
  unit: "",
  packageSize: "",
  status: "search-candidate",
  canAutoAddToCart: false
}));

// Lost measurement/container units and inconsistent quantities
// must remain held instead of being silently converted to counts.
lines.push(
  {
    ...lines[0],
    itemId: "invalid1",
    shoppingName: "green onions",
    searchCandidate: "green onions",
    originalIngredient: "1 Tbsp green onions, sliced",
    quantity: 1
  },
  {
    ...lines[0],
    itemId: "invalid2",
    shoppingName: "yellow onion",
    searchCandidate: "yellow onion",
    originalIngredient: "1 cup yellow onion, diced",
    quantity: 1
  },
  {
    ...lines[6],
    itemId: "invalid3",
    originalIngredient: "2 bags gummy worms",
    quantity: 2
  },
  {
    ...lines[6],
    itemId: "invalid4",
    quantity: 2
  }
);

const before = JSON.stringify(lines);
const result = summarize(lines);

assert.equal(result.groups.length, 7);
assert.equal(result.reviews.length, 3);
assert.ok(result.groups.every(x => x.unit === "count"));
assert.equal(JSON.stringify(lines), before);
assert.equal(result.canAutoAddToCart, false);

console.log("=== COUNTABLE INGREDIENTS ===");

for (const group of result.groups) {
  console.log(
    `${group.quantity} count — ${group.shoppingName}`
  );
}

console.log("\nResolved:", result.groups.length);
console.log("Unsafe cases held:", result.reviews.length);
console.log("PASS: Countable ingredient regression tests");
