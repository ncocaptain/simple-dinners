const assert = require("node:assert/strict");
const fs = require("fs");
const ts = require("typescript");

function load(file, dependencies = {}) {
  const source = fs.readFileSync(file, "utf8");

  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;

  const mod = { exports: {} };

  const localRequire = (name) => {
    if (Object.prototype.hasOwnProperty.call(
      dependencies, name
    )) {
      return dependencies[name];
    }
    throw new Error("Unexpected dependency: " + name);
  };

  new Function(
    "require", "module", "exports", output
  )(localRequire, mod, mod.exports);

  return mod.exports;
}

const resolver = load(
  "src/core/groceryChoiceResolver.ts"
);

const handoff = load(
  "src/fulfillment/groceryHandoff.ts",
  { "../core/groceryChoiceResolver": resolver }
);

const bridge = load(
  "src/fulfillment/groceryHandoffFromShopping.ts",
  { "./groceryHandoff": handoff }
);

function item(id, name, extras = {}) {
  return {
    id,
    text: name,
    normalizedName: name,
    grocerySearchName: name,
    checked: false,
    addedAt: 1,
    category: "Pantry",
    quantity: 1,
    unit: "count",
    ...extras,
  };
}

function row(id, sourceIds, coverage = "none", extras = {}) {
  return {
    id,
    sourceIds,
    pantryCoverage: coverage,
    checked: false,
    pantryKey: id,
    pantryRestock: false,
    ...extras,
  };
}

const raw = [
  item("c1", "chicken breast", {
    quantity: 1.5,
    unit: "lb",
  }),
  item("c2", "chicken breast", {
    quantity: 0.5,
    unit: "lb",
  }),
  item("milk", "milk"),
  item("oil", "olive oil"),
  item("oil2", "olive oil"),
  item("spray", "cooking spray", {
    quantity: null,
    unit: "",
  }),
  item("beans", "black beans"),
  item("checked", "orange juice"),
  item("ginger", "fresh ginger", {
    quantity: 1,
    unit: "Tbsp",
    recipeIngredientText:
      "1 Tbsp fresh ginger, grated (or 1/2 tsp ground ginger)",
  }),
  item("rawChecked", "cucumber", {
    checked: true,
  }),
];

const rows = [
  row("chicken", ["c1", "c2"]),
  row("milk", ["milk"], "covered"),
  row("oil", ["oil"], "covered", {
    pantryRestock: true,
    pantryKey: "olive",
  }),
  row("oil2", ["oil2"], "covered", {
    pantryKey: "olive",
  }),
  row("spray", ["spray"], "covered"),
  row("beans", ["beans"], "partial"),
  row("checked", ["checked"], "none", {
    checked: true,
  }),
  row("missing", ["unknown"]),
  row("ginger", ["ginger"]),
  row("rawChecked", ["rawChecked"]),
  row("duplicate", ["c1"]),
];

const buyAnyway = new Set(["spray"]);
const before = JSON.stringify({ raw, rows });

const result =
  bridge.buildGroceryHandoffFromShopping(
    raw, rows, buyAnyway
  );

assert.equal(result.totalMergedRows, 11);
assert.equal(result.excludedCheckedRows, 1);
assert.equal(result.excludedCoveredRows, 1);
assert.equal(result.excludedChecked, 1);
assert.equal(result.lines.length, 6);

assert.deepEqual(
  result.holds.map((x) => x.reason),
  [
    "partial-pantry",
    "missing-source",
    "duplicate-source",
  ]
);

assert.equal(result.requiresAttention, 5);

assert.equal(
  result.lines.find((x) => x.itemId === "spray").status,
  "needs-quantity-review"
);

assert.equal(
  result.lines.find((x) => x.itemId === "ginger").status,
  "needs-choice"
);

assert.equal(
  result.lines.find((x) => x.itemId === "ginger")
    .quantityOptions?.length,
  2
);

assert.deepEqual(
  result.lines
    .filter((x) => x.itemId === "c1" || x.itemId === "c2")
    .map((x) => x.quantity),
  [1.5, 0.5]
);

assert.equal(JSON.stringify({ raw, rows }), before);
assert.equal(result.canAutoAddToCart, false);
assert.ok(
  result.lines.every((x) => x.canAutoAddToCart === false)
);

console.log("=== PANTRY-AWARE GROCERY HANDOFF ===");
console.log("Merged rows tested:", result.totalMergedRows);
console.log("Grocery lines retained:", result.lines.length);
console.log("Covered rows excluded:", result.excludedCoveredRows);
console.log("Checked rows excluded:", result.excludedCheckedRows);
console.log("Held for review:", result.holds.length);
console.log("Total needing attention:", result.requiresAttention);
console.log("");
console.log("PASS: Pantry and Restock decisions");
console.log("PASS: Buy Anyway");
console.log("PASS: Checked item filtering");
console.log("PASS: Quantity preservation");
console.log("PASS: Alternative detection");
console.log("PASS: Original data unchanged");
console.log("PASS: No automatic cart additions");
