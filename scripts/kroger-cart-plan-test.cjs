const assert = require("node:assert/strict");
const fs = require("fs");
const ts = require("typescript");

function load(file, dependencies = {}) {
  const source = fs.readFileSync(
    file,
    "utf8"
  );

  const output = ts.transpileModule(
    source,
    {
      compilerOptions: {
        module:
          ts.ModuleKind.CommonJS,
        target:
          ts.ScriptTarget.ES2020,
      },
    }
  ).outputText;

  const mod = { exports: {} };

  new Function(
    "require",
    "module",
    "exports",
    output
  )(
    (name) => dependencies[name] || {},
    mod,
    mod.exports
  );

  return mod.exports;
}

const plan = load(
  "src/fulfillment/krogerCartPlan.ts"
);

const requirement = {
  shoppingName: "chicken broth",
  searchCandidate: "chicken broth",
  quantity: 2,
  unit: "cup",
  packageSize: "",
  sourceLines: [
    {
      itemId: "broth-1",
      sourceRecipe: "Soup",
      originalIngredient:
        "2 cups chicken broth",
      quantity: 2,
    },
  ],
  canAutoAddToCart: false,
};

const product = {
  productId: "broth-product",
  upc: "0001111000001",
  description: "Chicken Broth",
  brand: "Kroger",
  size: "32 fl oz",
  imageUrl: "",
  regularPrice: 2.49,
  promoPrice: null,
};

const calculated =
  plan.buildCalculatedKrogerCartSelection(
    requirement,
    {
      candidate: {
        id: "broth-product",
        productName:
          "Chicken Broth",
        packageQuantity: 32,
        packageUnit: "fl oz",
      },
      packagesNeeded: 1,
      requirementInCandidateUnits: 0.5,
      totalAvailable: 946.352,
      excess: 473.176,
      canAutoAddToCart: false,
    },
    [product]
  );

assert.ok(calculated);
assert.equal(
  calculated.quantity,
  1
);
assert.equal(
  calculated.selectionMode,
  "calculated-package-match"
);
assert.equal(
  calculated.canAutoAddToCart,
  false
);

const manual =
  plan.buildManualKrogerCartSelection(
    {
      ...requirement,
      shoppingName: "blueberries",
      searchCandidate: "blueberries",
      quantity: 1,
      unit: "cup",
    },
    {
      ...product,
      productId: "blueberries",
      upc: "0001111999999",
      description: "Fresh Blueberries",
      size: "6 oz",
    }
  );

assert.ok(manual);
assert.equal(manual.quantity, 1);
assert.equal(
  manual.selectionMode,
  "manual-package-choice"
);

const preview =
  plan.buildKrogerCartPreview([
    calculated,
    manual,
  ]);

assert.deepEqual(preview.items, [
  {
    upc: "0001111000001",
    quantity: 1,
  },
  {
    upc: "0001111999999",
    quantity: 1,
  },
]);

assert.equal(
  preview.canSubmitToCart,
  false
);

console.log(
  "=== KROGER CART PLAN ==="
);
console.log(
  "PASS: calculated package selections retain package quantity"
);
console.log(
  "PASS: manual package selections default to one user-selected package"
);
console.log(
  "PASS: selections normalize to Kroger UPC + quantity cart lines"
);
console.log(
  "PASS: cart submission remains disabled until customer OAuth is wired"
);
