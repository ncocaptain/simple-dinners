const assert = require("node:assert/strict");
const fs = require("fs");
const ts = require("typescript");

const source = fs.readFileSync(
  "src/fulfillment/retailerPackageSolver.ts",
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

const {
  solveRetailerPackageCandidate,
  rankRetailerPackageCandidates,
} = mod.exports;

function requirement(name, quantity, unit) {
  return {
    shoppingName: name,
    searchCandidate: name,
    quantity,
    unit,
    packageSize: "",
    sourceLines: [],
    canAutoAddToCart: false,
  };
}

const broth = requirement(
  "chicken broth",
  2,
  "cup"
);

const broth32 = {
  id: "broth-32",
  productName: "Chicken Broth 32 fl oz",
  packageQuantity: 32,
  packageUnit: "fl oz",
};

const broth14 = {
  id: "broth-14",
  productName: "Chicken Broth 14 fl oz",
  packageQuantity: 14,
  packageUnit: "fl oz",
};

const brothSolution =
  solveRetailerPackageCandidate(
    broth,
    broth32
  );

assert.ok(brothSolution);
assert.equal(
  brothSolution.packagesNeeded,
  1
);
assert.equal(
  brothSolution.canAutoAddToCart,
  false
);

const rankedBroth =
  rankRetailerPackageCandidates(
    broth,
    [broth14, broth32]
  );

assert.equal(
  rankedBroth[0].candidate.id,
  "broth-32"
);

const beef = requirement(
  "ground beef",
  1.5,
  "lb"
);

const beef16 = {
  id: "beef-16",
  productName: "Ground Beef 16 oz",
  packageQuantity: 16,
  packageUnit: "oz",
};

const beefSolution =
  solveRetailerPackageCandidate(
    beef,
    beef16
  );

assert.ok(beefSolution);
assert.equal(
  beefSolution.packagesNeeded,
  2
);

const flour = requirement(
  "all-purpose flour",
  2,
  "cup"
);

const flour5lb = {
  id: "flour-5lb",
  productName: "All-Purpose Flour 5 lb",
  packageQuantity: 5,
  packageUnit: "lb",
};

assert.equal(
  solveRetailerPackageCandidate(
    flour,
    flour5lb
  ),
  null
);

const eggs = requirement(
  "egg",
  3,
  "count"
);

const dozenEggs = {
  id: "eggs-12",
  productName: "Large Eggs 12 Count",
  packageQuantity: 12,
  packageUnit: "count",
};

const eggSolution =
  solveRetailerPackageCandidate(
    eggs,
    dozenEggs
  );

assert.ok(eggSolution);
assert.equal(
  eggSolution.packagesNeeded,
  1
);

const snackCups = requirement(
  "vanilla pudding snack cups",
  4,
  "count"
);

const fourPack = {
  id: "pudding-4",
  productName: "Vanilla Pudding 4 Pack",
  packageQuantity: 1,
  packageUnit: "count",
  packageCount: 4,
};

const snackSolution =
  solveRetailerPackageCandidate(
    snackCups,
    fourPack
  );

assert.ok(snackSolution);
assert.equal(
  snackSolution.packagesNeeded,
  1
);

console.log(
  "=== RETAILER PACKAGE SOLVER ==="
);
console.log(
  "PASS: volume converts only within volume"
);
console.log(
  "PASS: weight converts only within weight"
);
console.log(
  "PASS: cup-to-pound density guesses are rejected"
);
console.log(
  "PASS: explicit count packages are supported"
);
console.log(
  "PASS: candidate ranking prefers fewer packages, then less excess"
);
console.log(
  "PASS: automatic cart addition remains disabled"
);
