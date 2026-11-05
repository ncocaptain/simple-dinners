import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function loadPureTsModule(filename) {
  const source = readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const moduleObject = { exports: {} };
  runInNewContext(outputText, {
    exports: moduleObject.exports,
    module: moduleObject,
  });
  return moduleObject.exports;
}

const { LITTLE_CHEFS_RECIPES } = loadPureTsModule(
  "src/core/littleChefsRecipes.ts"
);
const { categorizeGroceryItem, getSpecificGroceryCategory } = loadPureTsModule(
  "src/core/groceryCategories.ts"
);
const { parseIngredientLine, isIngredientSectionHeader } = loadPureTsModule(
  "src/core/ingredientParser.ts"
);

for (const [slug, product] of [
  ["little-chefs-chocolate-dirt-cups", "chocolate"],
  ["little-chefs-banana-pudding-cups", "vanilla"],
]) {
  const recipe = LITTLE_CHEFS_RECIPES.find((item) => item.slug === slug);
  assert.ok(recipe, `Missing Little Chefs recipe: ${slug}`);
  const puddingLine = recipe.ingredients
    .split("\n")
    .find((line) => line.includes(`${product} pudding snack cups`));
  assert.ok(puddingLine, `Expected ready-to-eat ${product} pudding cups`);
  assert.equal(isIngredientSectionHeader(puddingLine), false);
  const parsed = parseIngredientLine(puddingLine);
  assert.equal(parsed.quantity, 4);
  assert.equal(parsed.nameText.includes("pudding snack cups"), true);
  assert.equal(categorizeGroceryItem(parsed.nameText), "Pantry");
}

const shoppingPage = readFileSync(
  "src/pages/ShoppingListPage.tsx",
  "utf8"
);
assert.match(shoppingPage, /pudding snack cups\?\$/);
const categoryExpectations = new Map([
  ["graham cracker sheets", "Pantry"],
  ["corn chips", "Pantry"],
  ["vanilla yogurt", "Dairy / Eggs"],
  ["granola", "Pantry"],
  ["ready-to-eat pound cake", "Bakery"],
  ["frozen yogurt", "Frozen"],
  ["taco seasoning", "Spices / Seasonings"],
  ["1 packet taco seasoning", "Spices / Seasonings"],
  ["ready-to-eat chocolate pudding snack cups", "Pantry"],
]);
for (const [product, category] of categoryExpectations) {
  assert.equal(
    categorizeGroceryItem(product),
    category,
    "Wrong grocery category for " + product,
  );
}

assert.equal(getSpecificGroceryCategory("taco seasoning"), "Spices / Seasonings");

const shortcake = LITTLE_CHEFS_RECIPES.find(
  (recipe) => recipe.slug === "little-chefs-strawberry-shortcake-cups"
);
assert.ok(shortcake);
assert.match(shortcake.ingredients, /1 package \(10 oz\) ready-to-eat pound cake/);

const shoppingSource = readFileSync("src/shoppingList.ts", "utf8");
assert.match(shoppingSource, /getSpecificGroceryCategory\(lower\)/);
assert.match(shoppingPage, /getSpecificGroceryCategory\(cleaned\)/);

const parseStart = shoppingPage.indexOf("function parseIngredient(line:");
const parseEnd = shoppingPage.indexOf("function normalizeCountableName", parseStart);
assert.ok(parseStart > 0 && parseEnd > parseStart);
const recipeIngredientParser = shoppingPage.slice(parseStart, parseEnd);
assert.match(recipeIngredientParser, /block\|blocks\|packet\|packets/);
assert.match(shoppingPage, /"corn chips",/);

const {
  getGroceryProductIdentity,
  formatGroceryPurchaseLabel,
} = loadPureTsModule("src/core/groceryProductIdentity.ts");


const groceryCases = [
  ["strawberries", "Fresh Strawberries"],
  ["blueberries", "Fresh Blueberries"],
  ["whipped cream", "Whipped Cream"],
  ["corn chips", "Corn Chips"],
  ["granola", "Granola"],
  ["vanilla yogurt", "Vanilla Yogurt"],
  ["graham cracker sheets", "Graham Crackers"],
  ["ready-to-eat pound cake", "Pound Cake"],
  ["ready-to-eat apple pie filling", "Apple Pie Filling"],
  ["ready-to-eat chocolate pudding snack cups", "Chocolate Pudding Snack Cups"],
  ["ready-to-eat vanilla pudding snack cups", "Vanilla Pudding Snack Cups"],
];
for (const [name, expectedProduct] of groceryCases) {
  const label = formatGroceryPurchaseLabel(name);
  assert.equal(label, expectedProduct);
  assert.equal(getGroceryProductIdentity(name)?.searchName, expectedProduct);
  assert.doesNotMatch(label, /\\b(?:cups?|tbsp|tsp|needed|\\d+\\s+(?:cans?|packages?|boxes?))\\b/i);
}
assert.equal(getGroceryProductIdentity("ground beef"), null);
assert.equal(formatGroceryPurchaseLabel("ground beef"), null);

// Fallback names must also be amount-free, while manual rows preserve
// the amounts the user personally entered.
assert.match(shoppingPage, /if \\(!value\\.isManual\\) \\{\\s*displayText =\\s*formatGroceryPurchaseLabel\\(value\\.name\\) \\?\\?\\s*formatDisplayName\\(value\\.name\\)/);
assert.match(shoppingPage, /const recipeBreakdown = recipeNames\\.map/);
assert.match(shoppingPage, /formatRecipeBreakdownAmount\\(/);
assert.match(shoppingSource, /getGroceryProductIdentity\\(normalizedName\\)/);

console.log("Little Chefs grocery names, categories, and ingredient regression checks passed.");
