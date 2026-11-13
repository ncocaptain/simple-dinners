"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

// Load the real pure TS dependency graph, not mocked eligibility or parsing.
const modules = new Map();
function load(file) {
  const filename = path.resolve(file);
  if (modules.has(filename)) return modules.get(filename).exports;
  const mod = { exports: {} };
  modules.set(filename, mod);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("require", "module", "exports", output)((name) => {
    assert.ok(name.startsWith("."), `Unexpected dependency: ${name}`);
    return load(path.resolve(path.dirname(filename), name.replace(/\.js$/, "") + ".ts"));
  }, mod, mod.exports);
  return mod.exports;
}

const { buildShoppingPurchaseSnapshot: build } = load("src/deals/shoppingSnapshot.ts");
const { deriveIngredientIdentity } = load("src/deals/ingredientIdentity.ts");
const { buildGroceryHandoffFromShopping } = load("src/fulfillment/groceryHandoffFromShopping.ts");
const { summarizeGroceryRequirements } = load("src/fulfillment/groceryRequirementSummary.ts");
const shopping = load("src/shoppingList.ts");
const { resolveGroceryChoice } = load("src/core/groceryChoiceResolver.ts");

const item = (id, name, extras = {}) => ({
  id, text: name, normalizedName: name, grocerySearchName: name,
  checked: false, addedAt: 1, category: "Pantry", quantity: null, unit: "", ...extras,
});
const row = (id, sourceIds, extras = {}) => ({
  id, sourceIds, checked: false, pantryCoverage: "none",
  pantryKey: id, pantryRestock: false, ...extras,
});
function snapshot(rawItems, combinedRows = rawItems.map((x) => row(x.id, [x.id])), ids = []) {
  return build({ rawItems, combinedRows, pantryBuyAnywayIds: new Set(ids) });
}
function freeze(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function only(result) {
  assert.equal(result.needs.length, 1);
  return result.needs[0];
}

// Eligibility is supplied by ShoppingListPage; forceBuy is already represented
// there as coverage=none. A contradictory covered snapshot must remain excluded.
const raw = [
  item("checked", "milk"),
  item("raw-checked", "milk", { checked: true }),
  item("covered", "milk"),
  item("forced", "milk", { forceBuy: true }),
  item("restock", "olive oil", { pantryRestock: true, forceBuy: true }),
  item("oil-recipe", "olive oil"),
  item("partial", "black beans"),
  item("anyway", "butter"),
  item("duplicate", "eggs"),
];
const rows = [
  row("checked", ["checked"], { checked: true }),
  row("raw-checked", ["raw-checked"]),
  row("covered", ["covered"], { pantryCoverage: "covered" }),
  row("forced", ["forced"]),
  row("restock", ["restock"], { pantryCoverage: "covered", pantryRestock: true, pantryKey: "oil" }),
  row("oil-recipe", ["oil-recipe"], { pantryCoverage: "covered", pantryKey: "oil" }),
  row("partial", ["partial"], { pantryCoverage: "partial" }),
  row("anyway", ["anyway"], { pantryCoverage: "partial" }),
  row("missing", ["not-saved"]),
  row("empty", []),
  row("repeat-within", ["duplicate", "duplicate"]),
  row("first", ["duplicate"]),
  row("repeat-across", ["duplicate"]),
];
freeze(raw); freeze(rows);
const buyAnyway = new Set(["anyway"]);
const before = JSON.stringify({ raw, rows, ids: [...buyAnyway] });
const result = build({ rawItems: raw, combinedRows: rows, pantryBuyAnywayIds: buyAnyway });
assert.equal(JSON.stringify({ raw, rows, ids: [...buyAnyway] }), before);
assert.deepEqual(result.needs.flatMap((need) => need.sourceIds),
  ["forced", "restock", "oil-recipe", "anyway", "duplicate"]);
assert.equal(result.excludedCheckedRows, 1);
assert.equal(result.excludedCheckedSources, 1);
assert.equal(result.excludedCoveredRows, 1);
assert.deepEqual(result.holds.map((hold) => hold.reason), [
  "partial-pantry", "missing-source", "missing-source", "duplicate-source", "duplicate-source",
]);
assert.deepEqual(result.holds[0].sourceIds, ["partial"]);
assert.deepEqual(result.rawItems, raw);
assert.deepEqual(result.combinedRows, rows);
const authority = buildGroceryHandoffFromShopping(raw, rows, buyAnyway);
assert.deepEqual(result.holds, authority.holds);
assert.equal(result.needs.length,
  summarizeGroceryRequirements(authority.lines).searchOnly.length);
assert.equal(snapshot([raw[3]], [row("forced", ["forced"], { pantryCoverage: "covered" })]).needs.length, 0);
assert.equal(only(snapshot([item("restock", "milk")], [row("restock", ["restock"], {
  pantryCoverage: "partial", pantryRestock: true,
})])).state, "search-only");

// Manual/unquantified items remain searchable without adopting registry defaults.
const manual = only(snapshot([item("beans", "black beans")]));
assert.equal(manual.state, "search-only");
assert.deepEqual(manual.requirement, { quantity: null, unit: "", packageSize: "" });
assert.equal(manual.identity.canonicalIngredientId, "black-beans");
assert.equal(manual.lines[0].sourceRecipe, null);
const noDefaultPackage = only(snapshot([item("cans", "black beans", {
  quantity: 2, unit: "can", recipeIngredientText: "2 cans black beans",
})]));
assert.equal(noDefaultPackage.state, "measured");
assert.deepEqual(noDefaultPackage.requirement, { quantity: 2, unit: "can", packageSize: "" });
assert.equal(noDefaultPackage.identity.canonicalIngredientId, "black-beans");
assert.equal(snapshot([item("checked-restock", "milk", { pantryRestock: true, forceBuy: true })], [
  row("checked-restock", ["checked-restock"], { checked: true, pantryRestock: true }),
]).needs.length, 0);
assert.equal(only(snapshot([item("unknown", "dragonfruit crisps")])).identity.status, "unmapped");
// Main has registry additions absent from the earlier architecture commit.
assert.equal(only(snapshot([item("new-registry", "italian seasoning")])).identity.canonicalIngredientId,
  "italian-seasoning");

// Quantities and original wording come from actual recipe generation/storage.
const storage = new Map();
global.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
};
shopping.addIngredientsToList("Fixture Recipe", "1 lb chicken breast\n2 cans (15 oz) black beans");
shopping.addIngredientsToList("Another Recipe", "1 lb chicken breast");
const generated = shopping.loadRawShoppingList();
assert.equal(generated.length, 3);
const generatedBefore = JSON.stringify(generated);
const recipeSnapshot = snapshot(generated);
assert.equal(JSON.stringify(generated), generatedBefore);
const chicken = recipeSnapshot.needs.find((need) => need.shoppingName === "chicken breast");
assert.equal(chicken.state, "measured");
assert.equal(chicken.requirement.quantity, 2);
assert.equal(chicken.requirement.unit, "lb");
assert.equal(chicken.sourceIds.length, 2);
assert.deepEqual(chicken.originalIngredients, ["1 lb chicken breast", "1 lb chicken breast"]);
assert.equal(chicken.identity.canonicalIngredientId, "chicken-breast");
assert.deepEqual(chicken.sourceIds, generated.filter((x) => x.normalizedName === "chicken breast").map((x) => x.id));
assert.equal(chicken.lines[0].sourceRecipe, "Fixture Recipe");
const beans = recipeSnapshot.needs.find((need) => need.shoppingName === "black beans");
assert.equal(beans.requirement.quantity, 2);
assert.equal(beans.requirement.unit, "can");
assert.match(beans.requirement.packageSize, /15/);
assert.deepEqual(beans.originalIngredients, ["2 cans (15 oz) black beans"]);
assert.equal(beans.searchName, generated.find((x) => x.normalizedName === "black beans").grocerySearchName);

storage.clear();
shopping.addSidesToList("Dinner", "garlic bread");
const sides = shopping.loadRawShoppingList();
assert.equal(sides.length, 1);
const side = only(snapshot(sides));
assert.equal(side.state, "search-only");
assert.equal(side.requirement.quantity, null);
assert.equal(side.lines[0].sourceRecipe, "Dinner sides");

// Review and product constraints stay explicit, not silently normalized away.
const reviewFixtures = [
  [item("choice", "milk", { recipeIngredientText: "milk or cream" }), "unresolved-item"],
  [item("lost", "milk", { recipeIngredientText: "2 cups milk" }), "missing-quantity"],
  [item("unit", "milk", { quantity: 2, recipeIngredientText: "2 cups milk" }), "missing-unit"],
  [item("missing-search", ""), "unresolved-item"],
  [item("prep", "garlic", { recipeIngredientText: "garlic, minced or grated" }), "unresolved-item"],
];
for (const [fixture, reason] of reviewFixtures) {
  const need = only(snapshot([fixture]));
  assert.equal(need.state, "needs-review", fixture.id);
  assert.equal(need.reviewReason, reason, fixture.id);
  assert.equal(need.lines[0].originalIngredient, fixture.recipeIngredientText || fixture.normalizedName);
}
const ambiguous = only(snapshot([item("alternative", "fresh ginger", {
  quantity: 1, unit: "Tbsp", recipeIngredientText: "1 Tbsp fresh ginger, grated (or 1/2 tsp ground ginger)",
})]));
assert.equal(ambiguous.identity.canonicalIngredientId, null);
assert.equal(ambiguous.lines[0].needsQuantityRecalculation, true);
assert.equal(ambiguous.lines[0].quantityOptions.length, 2);
for (const fixture of [
  item("manual-form", "strawberries", { text: "Frozen Strawberries" }),
  item("different", "tomato", { grocerySearchName: "tomato sauce" }),
  item("frozen", "strawberries", { recipeIngredientText: "1 cup frozen strawberries" }),
  item("cooked", "chicken breast", { recipeIngredientText: "1 lb cooked chicken breast" }),
  item("variety", "apple", { recipeIngredientText: "2 Granny Smith apples" }),
]) {
  const need = only(snapshot([fixture]));
  assert.equal(need.identity.canonicalIngredientId, null, fixture.id);
  assert.equal(need.identity.status, "needs-review", fixture.id);
  assert.equal(need.searchName, resolveGroceryChoice({
    normalizedName: fixture.normalizedName, grocerySearchName: fixture.grocerySearchName,
    recipeIngredientText: fixture.recipeIngredientText,
  }).searchName);
}
assert.equal(deriveIngredientIdentity([], []).status, "unmapped");

// Snapshots detach and freeze data without freezing caller-owned inputs.
const mutable = [item("mutable", "milk")];
const mutableRows = [row("mutable", ["mutable"])];
const mutableIds = new Set();
const detached = build({ rawItems: mutable, combinedRows: mutableRows, pantryBuyAnywayIds: mutableIds });
assert.notEqual(detached.rawItems[0], mutable[0]);
assert.equal(Object.isFrozen(mutable[0]), false);
mutable[0].text = "changed";
mutableRows[0].sourceIds.push("new");
mutableIds.add("new");
assert.equal(detached.rawItems[0].text, "milk");
assert.deepEqual(detached.combinedRows[0].sourceIds, ["mutable"]);
assert.deepEqual(detached.pantryBuyAnywayIds, []);
assert.throws(() => { detached.needs[0].requirement.quantity = 1; }, TypeError);
assert.throws(() => { detached.rawItems[0].text = "changed"; }, TypeError);
assert.throws(() => { detached.needs[0].lines[0].shoppingName = "changed"; }, TypeError);
assert.throws(() => { ambiguous.lines[0].quantityOptions[0].quantity = 99; }, TypeError);
assert.throws(() => detached.combinedRows[0].sourceIds.push("changed"), TypeError);

// Deterministic versioned equality token; every eligibility/evidence change matters.
const baseRaw = [item("signature", "milk")];
const baseRows = [row("signature", ["signature"])];
const base = snapshot(baseRaw, baseRows);
assert.equal(base.version, 1);
assert.equal(base.identityVersion, 1);
assert.equal(base.signature, snapshot(baseRaw, baseRows).signature);
const reorderedKeys = Object.fromEntries(Object.entries(baseRaw[0]).reverse());
assert.equal(base.signature, snapshot([reorderedKeys], baseRows).signature);
assert.equal(snapshot(baseRaw, baseRows, ["b", "a"]).signature,
  snapshot(baseRaw, baseRows, ["a", "b"]).signature);
for (const change of [
  { checked: true }, { quantity: 2 }, { unit: "cup" }, { packageSize: "8 oz" },
  { recipeIngredientText: "whole milk" }, { grocerySearchName: "whole milk" },
  { forceBuy: true }, { pantryRestock: true },
]) assert.notEqual(base.signature, snapshot([{ ...baseRaw[0], ...change }], baseRows).signature);
for (const change of [
  { pantryCoverage: "covered" }, { pantryCoverage: "partial" }, { checked: true },
  { sourceIds: [] }, { pantryKey: "other" }, { pantryRestock: true },
]) assert.notEqual(base.signature, snapshot(baseRaw, [{ ...baseRows[0], ...change }]).signature);
assert.notEqual(base.signature, snapshot(baseRaw, baseRows, ["signature"]).signature);
// Real restock writer preserves explicit buy intent; no amount is invented.
storage.clear();
shopping.addPantryRestockToList("milk");
const restockRaw = shopping.loadRawShoppingList();
assert.equal(restockRaw[0].forceBuy, true);
assert.equal(restockRaw[0].pantryRestock, true);
const restockNeed = only(snapshot(restockRaw, [row("restock-real", [restockRaw[0].id], {
  pantryCoverage: "covered", pantryRestock: true,
})]));
assert.equal(restockNeed.state, "search-only");
assert.equal(restockNeed.requirement.quantity, null);
assert.equal(snapshot([]).needs.length, 0);
console.log("PASS: Deals foundation eligibility, provenance, identity, quantities, review, immutability and signatures");
