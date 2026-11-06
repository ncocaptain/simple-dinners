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
  ["graham cracker sheets", 4],
  ["ready-to-eat vanilla pudding snack cups", 4],
  ["ripe bananas", 2],
  ["vanilla wafer cookies", 16],
  ["ready-to-eat chocolate pudding snack cups", 4],
  ["chocolate sandwich cookies", 8],
  ["gummy worms", 4]
];

const lines = cases.map(([name, qty], index) => ({
  itemId: String(index),
  shoppingName: name,
  searchCandidate: name,
  sourceRecipe: "Test Recipe",
  originalIngredient:
    `${qty} ${name}` +
    (name === "gummy worms" ? ", optional" : ""),
  quantity: qty,
  unit: "",
  packageSize: "",
  status: "search-candidate",
  canAutoAddToCart: false
}));

// Invalid or unrecognized counts must remain held.
lines.push(
  {
    ...lines[0],
    itemId: "invalid1",
    shoppingName: "milk",
    originalIngredient: "4 cups milk"
  },
  {
    ...lines[6],
    itemId: "invalid2",
    quantity: 2
  },
  {
    ...lines[6],
    itemId: "invalid3",
    originalIngredient: "2 bags gummy worms",
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
