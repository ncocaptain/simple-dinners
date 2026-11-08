const assert = require("node:assert/strict");
const fs = require("fs");
const ts = require("typescript");

function load(file, deps = {}) {
  const source = fs.readFileSync(file, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;

  const mod = { exports: {} };
  const localRequire = (name) => {
    if (deps[name]) return deps[name];
    throw new Error("Unexpected dependency: " + name);
  };

  new Function("require", "module", "exports", output)(
    localRequire,
    mod,
    mod.exports
  );

  return mod.exports;
}

const summary = load(
  "src/fulfillment/groceryRequirementSummary.ts"
);

const retailer = load(
  "src/fulfillment/groceryRetailerMatch.ts",
  {
    "./groceryRequirementSummary": summary,
  }
);

const result = summary.summarizeGroceryRequirements([
  {
    itemId: "salt",
    shoppingName: "salt",
    searchCandidate: "salt",
    sourceRecipe: "Test",
    originalIngredient: "salt to taste",
    quantity: null,
    unit: "",
    packageSize: "",
    status: "search-candidate",
    canAutoAddToCart: false,
  },
  {
    itemId: "cheese",
    shoppingName: "shredded cheese",
    searchCandidate: "shredded cheese",
    sourceRecipe: "Test",
    originalIngredient: "shredded cheese for serving",
    quantity: null,
    unit: "",
    packageSize: "",
    status: "search-candidate",
    canAutoAddToCart: false,
  },
  {
    itemId: "lost",
    shoppingName: "green onions",
    searchCandidate: "green onions",
    sourceRecipe: "Test",
    originalIngredient: "2 Tbsp green onions, sliced",
    quantity: null,
    unit: "",
    packageSize: "",
    status: "search-candidate",
    canAutoAddToCart: false,
  },
]);

assert.equal(result.searchOnly.length, 2);
assert.equal(result.reviews.length, 1);
assert.equal(result.reviews[0].reason, "missing-quantity");

for (const item of result.searchOnly) {
  const match =
    retailer.assessRetailerSearchOnlyRequirement(item);

  assert.equal(match.status, "search-only");
  assert.equal(match.mode, "quantity-unspecified");
  assert.ok(match.searchName);
  assert.equal(match.canAutoAddToCart, false);
}

console.log("=== SEARCH-ONLY GROCERY REQUIREMENTS ===");
console.log("Searchable without quantity:", result.searchOnly.length);
console.log("True quantity/parser reviews:", result.reviews.length);
console.log("PASS: Product discovery can proceed without inventing quantity");
console.log("PASS: Numeric-source parser loss stays blocked");
console.log("PASS: Search-only groceries cannot auto-add to cart");
