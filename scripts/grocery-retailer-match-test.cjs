const assert = require("node:assert/strict");
const fs = require("fs");
const ts = require("typescript");

const source = fs.readFileSync(
  "src/fulfillment/groceryRetailerMatch.ts",
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
  assessRetailerRequirement,
  buildRetailerMatchPreview,
} = mod.exports;

function requirement(
  shoppingName,
  quantity,
  unit,
  packageSize = ""
) {
  return {
    shoppingName,
    searchCandidate: shoppingName,
    quantity,
    unit,
    packageSize,
    sourceLines: [],
    canAutoAddToCart: false,
  };
}

const cases = [
  [
    requirement("ground beef", 1, "lb"),
    "search-ready",
    "weight",
  ],
  [
    requirement(
      "ready-to-eat apple pie filling",
      1,
      "can",
      "21 oz"
    ),
    "search-ready",
    "exact-package",
  ],
  [
    requirement("ripe bananas", 2, "count"),
    "search-ready",
    "individual-count",
  ],
  [
    requirement(
      "ready-to-eat vanilla pudding snack cups",
      4,
      "count"
    ),
    "package-match-needed",
    "package-count",
  ],
  [
    requirement("vanilla wafer cookies", 16, "count"),
    "package-match-needed",
    "package-count",
  ],
  [
    requirement("whipped cream", 3, "cup"),
    "package-match-needed",
    "recipe-volume",
  ],
  [
    requirement("taco seasoning", 1, "packet"),
    "search-ready",
    "exact-package",
  ],
];

for (const [input, expectedStatus, expectedMode] of cases) {
  const result = assessRetailerRequirement(input);

  assert.equal(result.status, expectedStatus);
  assert.equal(result.mode, expectedMode);
  assert.equal(result.canAutoAddToCart, false);
  assert.ok(result.searchName);
  assert.ok(result.purchaseTarget);
  assert.ok(result.reason);
}

const preview = buildRetailerMatchPreview(
  cases.map(([input]) => input)
);

assert.equal(preview.items.length, 7);
assert.equal(preview.searchReady, 4);
assert.equal(preview.packageMatchNeeded, 3);
assert.equal(preview.canAutoAddToCart, false);

console.log("=== RETAILER MATCH PREVIEW ===");
console.log("Requirements:", preview.items.length);
console.log("Search ready:", preview.searchReady);
console.log("Package match needed:", preview.packageMatchNeeded);

for (const item of preview.items) {
  console.log(
    `${item.status} · ${item.requirement.shoppingName} · ${item.purchaseTarget}`
  );
}

console.log("");
console.log("PASS: Weight requirements are search-ready");
console.log("PASS: Exact recipe package sizes are preserved");
console.log("PASS: Individual produce counts are search-ready");
console.log("PASS: Multipack/count products require package matching");
console.log("PASS: Recipe volumes never guess retailer package sizes");
console.log("PASS: Automatic cart additions remain disabled");
