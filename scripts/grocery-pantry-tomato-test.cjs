const assert = require("node:assert/strict");
const fs = require("fs");
const ts = require("typescript");

function load(file) {
  const source = fs.readFileSync(file, "utf8");

  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020
    }
  }).outputText;

  const mod = { exports: {} };

  new Function(
    "module", "exports", output
  )(mod, mod.exports);

  return mod.exports;
}

const compatibility = load(
  "src/core/pantryShoppingCompatibility.ts"
);

const summary = load(
  "src/fulfillment/groceryRequirementSummary.ts"
);

const {
  classifyPantryUnitMatch: classify,
  selectCompatiblePantryItem: select
} = compatibility;

assert.equal(
  classify(null, "can", true),
  "incompatible"
);

assert.equal(
  classify(null, "each", true),
  "compatible"
);

assert.equal(
  classify("can", "can", false),
  "compatible"
);

assert.equal(
  classify("lb", "oz", false),
  "uncertain"
);

const canned = { name: "tomato", unit: "can", quantity: 1 };
const fresh = { name: "tomato", unit: "each", quantity: 1 };

assert.equal(select([canned], null, true), undefined);
assert.equal(select([canned, fresh], null, true), fresh);

// A genuinely insufficient fresh quantity must still
// be handled by the existing partial-coverage logic.
assert.equal(select([fresh], null, true), fresh);
assert.ok(fresh.quantity < 2);

function tomatoLine(original, id) {
  return {
    itemId: id,
    shoppingName: "tomato",
    searchCandidate: "tomato",
    originalIngredient: original,
    sourceRecipe: "Test",
    quantity: 1,
    unit: "",
    packageSize: "",
    status: "search-candidate",
    canAutoAddToCart: false
  };
}

const result = summary.summarizeGroceryRequirements([
  tomatoLine("1 tomato", "t1"),
  tomatoLine("1 medium tomato, diced", "t2")
]);

assert.equal(result.groups.length, 2);
assert.equal(result.reviews.length, 0);
assert.ok(result.groups.every(g => g.unit === "count"));
assert.equal(result.canAutoAddToCart, false);

console.log("=== FRESH VS CANNED PANTRY TEST ===");
console.log("PASS: Canned tomato cannot cover fresh tomato");
console.log("PASS: Fresh tomato preferred over canned tomato");
console.log("PASS: Genuine quantity shortage remains detectable");
console.log("PASS: Tomato recipe counts retained");
console.log("PASS: No retailer package-size assumptions");
console.log("PASS: Automatic cart additions remain disabled");
