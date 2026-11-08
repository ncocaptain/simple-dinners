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
    target: ts.ScriptTarget.ES2020,
  },
});

const mod = { exports: {} };

new Function(
  "module", "exports", compiled.outputText
)(mod, mod.exports);

const summarize =
  mod.exports.summarizeGroceryRequirements;

function line(id, name, quantity, unit, original, extras = {}) {
  return {
    itemId: id,
    shoppingName: name,
    sourceRecipe: `Recipe ${id}`,
    originalIngredient: original,
    searchCandidate: name,
    quantity,
    unit,
    packageSize: "",
    status: "search-candidate",
    quantityOptions: null,
    needsQuantityRecalculation: false,
    canAutoAddToCart: false,
    ...extras,
  };
}

const items = [
  line("c1", "chicken breast", 1.5, "lb",
    "1 1/2 lb boneless skinless chicken breast"),
  line("c2", "chicken breast", 0.5, "lb",
    "0.5 lb boneless skinless chicken breast"),
  line("c3", "chicken breast", 8, "oz",
    "8 oz boneless skinless chicken breast"),
  line("c4", "chicken breast", 1, "lb",
    "1 lb bone-in chicken breast"),
  line("t1", "diced tomatoes", 2, "can",
    "2 cans diced tomatoes",
    { packageSize: "14.5 oz" }),
  line("t2", "diced tomatoes", 1, "can",
    "1 can diced tomatoes",
    { packageSize: "15 oz" }),
  line("spray", "cooking spray", null, "",
    "cooking spray"),
  line("salt", "salt", null, "",
    "salt to taste"),
  line("lostqty", "green onions", null, "",
    "2 Tbsp green onions, sliced"),
  line("ginger", "ginger", 1, "Tbsp",
    "1 Tbsp fresh ginger or 1/2 tsp ground ginger",
    { status: "needs-choice" }),
];

const before = JSON.stringify(items);
const result = summarize(items);

assert.equal(result.originalLines, 10);
assert.equal(result.groups.length, 5);
assert.equal(result.searchOnly.length, 2);
assert.equal(result.reviews.length, 2);

assert.deepEqual(
  result.searchOnly.map(item => item.itemId).sort(),
  ["salt", "spray"]
);

assert.equal(
  result.searchOnly.every(
    item => item.canAutoAddToCart === false
  ),
  true
);

const combined = result.groups.find(
  group => group.sourceLines.length === 2
);

assert.ok(combined);
assert.equal(combined.quantity, 2);
assert.equal(combined.unit, "lb");

assert.equal(
  result.groups.filter(
    group => group.shoppingName === "diced tomatoes"
  ).length,
  2
);

assert.equal(
  result.groups.filter(
    group => group.shoppingName === "chicken breast"
  ).length,
  3
);

assert.equal(JSON.stringify(items), before);
assert.equal(result.canAutoAddToCart, false);

console.log("=== GROCERY REQUIREMENT SUMMARY ===");
console.log("Original lines:", result.originalLines);
console.log("Safe groups:", result.groups.length);
console.log("Search-only requirements:", result.searchOnly.length);
console.log("Held for review:", result.reviews.length);

for (const group of result.groups) {
  console.log(
    `${group.quantity} ${group.unit} ${group.shoppingName}` +
    (group.packageSize ? ` (${group.packageSize})` : "")
  );
}

console.log("\nPASS: Unspecified recipe quantities remain searchable");
console.log("PASS: Numeric-source quantity loss remains under review");
console.log("PASS: Search-only items cannot auto-add to cart");
console.log("PASS: Compatible quantities consolidated");
console.log("PASS: Different units remain separate");
console.log("PASS: Different package sizes remain separate");
console.log("PASS: Bone-in and boneless remain separate");
console.log("PASS: Unresolved items held for review");
console.log("PASS: Source requirements preserved");
console.log("PASS: No shopping data modified");
console.log("PASS: Automatic cart additions disabled");
