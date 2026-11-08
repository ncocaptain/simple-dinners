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

const catalogAuditCategoryCases = [
  ["ranch dressing", "Pantry"],
  ["balsamic glaze", "Pantry"],
  ["caesar dressing", "Pantry"],
  ["cherry pie filling", "Pantry"],
  ["italian dressing", "Pantry"],
  ["poppy seed dressing", "Pantry"],
  ["ranch or italian dressing", "Pantry"],
  ["ranch seasoning", "Spices / Seasonings"],
  ["whipped topping", "Frozen"],
  ["poppy seeds", "Spices / Seasonings"],
  ["raisins", "Pantry"],
  ["sliced almonds", "Pantry"],
  ["simple syrup", "Pantry"],
  ["red curry paste", "Pantry"],
  ["pie iron cooker", "Household"],
  ["racks baby back ribs", "Meat / Seafood"],
  ["refrigerated pie crust", "Deli / Refrigerated"],
  ["sheet puff pastry", "Frozen"],
  ["shortcake biscuits or dessert biscuits", "Bakery"],
  ["southwest ranch dressing", "Pantry"],
  ["sunflower seeds", "Pantry"],
  ["sweet chili sauce", "Pantry"],
  ["tagliatelle", "Pantry"],
  ["turnip", "Produce"],
  ["tzatziki sauce", "Deli / Refrigerated"],
  ["wasabi", "Pantry"],
  ["whole cloves", "Spices / Seasonings"],
];
for (const [name, expected] of catalogAuditCategoryCases) {
  assert.equal(categorizeGroceryItem(name), expected, "Wrong category for " + name);
}


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
  assert.ok(!/[0-9]/.test(label), "Shopping row name must not contain a recipe amount");
  assert.ok(!label.includes(" needed"), "Shopping row name must not show cooking units");
}
assert.equal(getGroceryProductIdentity("ground beef"), null);
assert.equal(formatGroceryPurchaseLabel("ground beef"), null);

// Recipe row display is product-only; manual rows preserve user-entered
// quantities; tapping a recipe item still shows its amount breakdown.
assert.ok(shoppingPage.includes("if (!value.isManual) {"));
assert.ok(shoppingPage.includes("formatGroceryPurchaseLabel(value.name)"));
assert.ok(shoppingPage.includes("formatDisplayName(simpleName)"));
assert.ok(shoppingPage.includes("pluralizeCountable(value.name, value.totalQuantity)"));
assert.ok(shoppingPage.includes("const recipeBreakdown = recipeNames.map"));
assert.ok(shoppingPage.includes("formatRecipeBreakdownAmount("));
assert.ok(shoppingPage.includes("if (value.isManual) {"));
assert.ok(shoppingSource.includes("getGroceryProductIdentity(normalizedName)"));

console.log("Little Chefs grocery names, categories, and ingredient regression checks passed.");
