const assert = require("node:assert/strict");
const fs = require("fs");
const ts = require("typescript");

function load(file) {
  const source = fs.readFileSync(file, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;

  const mod = { exports: {} };
  new Function("module", "exports", "require", output)(
    mod,
    mod.exports,
    () => ({})
  );
  return mod.exports;
}

const categories = load(
  "src/core/groceryCategories.ts"
);
const thumbnails = load(
  "src/plus/smartShoppingThumbnails.ts"
);

const freshVarieties = [
  "Honeycrisp Apple",
  "Honeycrisp Apples",
  "Gala Apples",
  "Fuji Apples",
  "Granny Smith Apples",
  "Pink Lady Apples",
  "Cosmic Crisp Apples",
  "Ambrosia Apples",
  "Golden Delicious Apples",
  "Red Delicious Apples",
  "Jazz Apples",
  "Envy Apples",
];

for (const name of freshVarieties) {
  assert.equal(
    categories.categorizeGroceryItem(name),
    "Produce",
    name
  );

  const thumb =
    thumbnails.resolveSmartShoppingThumbnail(
      name,
      "Produce"
    );

  assert.equal(
    thumb.thumbnailKey,
    "apple",
    name
  );
}

const processed = [
  ["Apple Juice", "Beverages"],
  ["Apple Pie Filling", "Pantry"],
  ["Apple Cider Vinegar", "Pantry"],
];

for (const [name, expectedCategory] of processed) {
  assert.equal(
    categories.categorizeGroceryItem(name),
    expectedCategory,
    name
  );
}

console.log("=== APPLE VARIETY SHOPPING TEST ===");
console.log("Fresh varieties tested:", freshVarieties.length);
console.log("PASS: Honeycrisp no longer collides with honey");
console.log("PASS: Fresh apple varieties classify as Produce");
console.log("PASS: Fresh apple varieties use apple thumbnail");
console.log("PASS: Processed apple products keep non-Produce categories");
