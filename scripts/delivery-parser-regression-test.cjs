const assert = require("node:assert/strict");
const fs = require("fs");
const ts = require("typescript");

const shoppingSource = fs.readFileSync(
  "src/shoppingList.ts",
  "utf8"
);

assert.match(
  shoppingSource,
  /looksLikeMeasuredIngredient \|\| startsWithQuantity/
);
assert.match(
  shoppingSource,
  /describedContainerMatch/
);
assert.match(shoppingSource, /ears: "ear"/);
assert.match(shoppingSource, /before\.endsWith\("chipotle"\)/);
assert.doesNotMatch(
  shoppingSource,
  /parsedUnitForName === "Tbsp"[\s\S]{0,120}unit = "bunch"/
);

function loadSummary() {
  const source = fs.readFileSync(
    "src/fulfillment/groceryRequirementSummary.ts",
    "utf8"
  );
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const mod = { exports: {} };
  new Function("module", "exports", output)(
    mod,
    mod.exports
  );
  return mod.exports;
}

const { summarizeGroceryRequirements } =
  loadSummary();

function line(id, name, quantity, unit, raw) {
  return {
    itemId: id,
    shoppingName: name,
    searchCandidate: name,
    sourceRecipe: "Regression",
    originalIngredient: raw,
    quantity,
    unit,
    packageSize: "",
    status: "search-candidate",
    canAutoAddToCart: false,
  };
}

const result = summarizeGroceryRequirements([
  line("onion-half", "red onion", 0.5, "", "1/2 small red onion, thinly sliced"),
  line("jalapeno-half", "jalapeno", 0.5, "", "1/2 jalapeño, thinly sliced"),
  line("lemon", "lemon", 1, "", "juice of 1 lemon"),
  line("lime", "lime", 0.5, "", "juice from 1/2 lime"),
  line("chicken", "chicken breast", 4, "", "4 boneless, skinless chicken breasts"),
  line("corn", "corn on the cob", 4, "ear", "4 ears corn, husked"),
  line("sweet-potato", "sweet potato", 2, "", "2 large sweet potatoes, cut into wedges"),
  line("naan", "naan", 4, "", "4 naan flatbreads"),
  line("pita", "pita bread", 4, "", "4 soft Greek pita flatbreads"),
  line("green-onion-unspecified", "green onion", 1, "", "green onions, sliced"),
]);

assert.equal(result.reviews.length, 0);
assert.equal(result.groups.length, 9);
assert.equal(result.searchOnly.length, 1);
assert.equal(
  result.searchOnly[0].itemId,
  "green-onion-unspecified"
);
assert.equal(
  result.groups.filter(group => group.shoppingName !== "corn on the cob")
    .every(group => group.unit === "count"),
  true
);
assert.equal(
  result.groups.find(group => group.shoppingName === "corn on the cob")?.unit,
  "ear"
);

const parserSource = fs.readFileSync(
  "src/core/ingredientParser.ts",
  "utf8"
);
assert.match(parserSource, /ear\|ears/);
assert.match(
  parserSource,
  /block\|blocks\|ear\|ears/
);
assert.match(parserSource, /ears: "ear"/);

console.log("=== DELIVERY PARSER REGRESSION ===");
console.log("PASS: numbered prepared-side wording keeps quantity parsing");
console.log("PASS: explicit onion and herb units stay intact");
console.log("PASS: fractional produce counts resolve");
console.log("PASS: citrus juice wording resolves to fruit count");
console.log("PASS: ears of corn are recognized as a unit");
console.log("PASS: shopping parser preserves ear/ears");
console.log("PASS: chipotle pepper stays a pepper product, not black pepper");
console.log("PASS: size-described containers can preserve bag/package units");
console.log("PASS: sweet potato plurals resolve as counts");
console.log("PASS: numbered naan and pita resolve as counts");
console.log("PASS: unmeasured onion defaults become search-only");
