"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");
const renderer = require("react-test-renderer");
const { MemoryRouter } = require("react-router-dom");
const modules = new Map();
function load(file) {
  const filename = path.resolve(file);
  if (modules.has(filename)) return modules.get(filename).exports;
  const mod = { exports: {} }; modules.set(filename, mod);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  new Function("require", "module", "exports", output)((name) => {
    if (["react", "react/jsx-runtime", "react-router-dom"].includes(name)) return require(name);
    assert.ok(name.startsWith("."), `Unexpected dependency: ${name}`);
    if (name.endsWith(".css")) return {};
    const target = path.resolve(path.dirname(filename), name.replace(/\.js$/, ""));
    return load([target + ".ts", target + ".tsx", path.join(target, "index.ts")].find(fs.existsSync));
  }, mod, mod.exports);
  return mod.exports;
}
const storage = new Map();
global.localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
const fixtures = load("src/deals/fixturePreview.ts");
const { default: Page } = load("src/pages/ShoppingDealsPage.tsx");
const { compareStoreBaskets } = load("src/deals/basketComparison.ts");
const { en } = load("src/i18n/en.ts"); const { es } = load("src/i18n/es.ts");
const base = (id, name, extras = {}) => ({ id, text: name, normalizedName: name, grocerySearchName: name,
  checked: false, addedAt: 1, category: "Pantry", quantity: null, unit: "", ...extras });
const row = (item, extras = {}) => ({ id: item.id, sourceIds: [item.id], checked: item.checked,
  pantryCoverage: "none", pantryKey: item.id, pantryRestock: false, ...extras });
function snapshot(rawItems, combinedRows = rawItems.map((item) => row(item)), pantryBuyAnywayIds = new Set()) {
  return fixtures.createDealsRouteSnapshot({ rawItems, combinedRows, pantryBuyAnywayIds });
}
const measured = base("chicken", "chicken breast", { quantity: 20, unit: "oz", recipeIngredientText: "20 oz chicken breast" });
const measuredSnapshot = snapshot([measured]);
const clone = (value) => structuredClone(value);
function render(value) {
  let root;
  renderer.act(() => { root = renderer.create(React.createElement(MemoryRouter,
    { initialEntries: [{ pathname: "/shopping-deals", state: value ? { dealsSnapshot: value } : null }] }, React.createElement(Page))); });
  return root;
}
function text(root) {
  const collect = (node) => typeof node === "string" ? node : node ? (node.children || []).map(collect).join(" ") : "";
  return root.toJSON().map ? root.toJSON().map(collect).join(" ") : collect(root.toJSON());
}
function close(root) { renderer.act(() => root.unmount()); }
let count = 0;
function test(name, fn) { fn(); count++; console.log("PASS:", name); }

test("Free DEV route and secondary entry independent of existing grocery gate", () => {
  const app = fs.readFileSync("src/App.tsx", "utf8");
  const route = app.slice(app.indexOf('path="/shopping-deals"'), app.indexOf('path="/grocery-preview"'));
  assert.match(route, /import\.meta\.env\.DEV/); assert.doesNotMatch(route, /PlusFeatureGate|requirePlus|VITE_KROGER/);
  const grocery = app.slice(app.indexOf('path="/grocery-preview"'), app.indexOf('path="/settings"'));
  assert.match(grocery, /VITE_KROGER_ENABLED === "true"/); assert.match(grocery, /PlusFeatureGate feature="kroger-shopping"/);
  const shopping = fs.readFileSync("src/pages/ShoppingListPage.tsx", "utf8");
  const entry = shopping.slice(shopping.indexOf("const openDealsPreview"), shopping.indexOf("const openGroceryPreview"));
  assert.match(entry, /rawItems: shoppingItems/); assert.match(entry, /combinedRows: combinedItems/);
  assert.match(entry, /pantryBuyAnywayIds/); assert.match(entry, /if \(!import\.meta\.env\.DEV\) return/);
  assert.doesNotMatch(entry, /saveShoppingList|localStorage|sessionStorage|requirePlus|console\.|signature/);
});
test("direct route and malformed navigation state render a safe return path", () => {
  const root = render(null); assert.match(text(root), /Open Find Deals from your Shopping List/); close(root);
  assert.equal(fixtures.readDealsRouteSnapshot({ dealsSnapshot: { version: 1, needs: [null] } }), null);
  assert.equal(fixtures.readDealsRouteSnapshot({ dealsSnapshot: measuredSnapshot }).needs.length, 1);
});
test("snapshot uses existing eligibility, Buy Anyway and restock without mutating inputs", () => {
  const raw = [measured, base("checked", "milk", { checked: true }), base("covered", "milk"),
    base("partial", "milk"), base("anyway", "milk"), base("restock", "milk", { forceBuy: true, pantryRestock: true })];
  const rows = raw.map((item) => row(item, ["covered", "partial", "anyway", "restock"].includes(item.id)
    ? { pantryCoverage: item.id === "partial" ? "partial" : "covered", pantryRestock: item.id === "restock" } : {}));
  const before = JSON.stringify({ raw, rows });
  const result = snapshot(raw, rows, new Set(["anyway"]));
  assert.equal(JSON.stringify({ raw, rows }), before);
  assert.deepEqual(result.needs.flatMap((need) => need.sourceIds), ["chicken", "anyway", "restock"]);
  assert.equal(result.excludedCheckedRows, 1); assert.equal(result.excludedCoveredRows, 1);
  assert.equal(result.holds[0].reason, "partial-pantry");
  assert.equal("signature" in result, false); assert.equal("rawItems" in result, false);
  const root = render(result); assert.match(text(root), /Pantry coverage is partial/); close(root);
});
test("fixtures feed Phase 2 and complete basket winner is rendered only when valid", () => {
  const model = fixtures.buildFixturePreview(measuredSnapshot, {}, fixtures.FIXTURE_STORES, "standard");
  const targets = model.comparisons.map((item) => item.target);
  const stores = fixtures.FIXTURE_STORES.map((storeId) => ({ storeId, retailerId: storeId, channel: "in-store",
    offers: model.products.filter((product) => product.offer.price.retailerId === storeId).map((product) => product.offer) }));
  assert.deepEqual(model.basket, compareStoreBaskets(targets, stores, { currency: "USD", now: fixtures.FIXTURE_NOW }, []));
  assert.equal(model.basket.stores[0].merchandiseSubtotal.amountMinor, 350);
  const root = render(measuredSnapshot); assert.match(text(root), /Lowest estimated subtotal among selected sample stores/); close(root);
});
test("partial baskets include missing needs and cannot claim cheapest store", () => {
  const value = snapshot([measured, base("quantity", "milk")]);
  const root = render(value); const content = text(root);
  assert.match(content, /Priced 1 of 2 needs/); assert.match(content, /Missing from subtotal.*milk/);
  assert.match(content, /No cheapest-store claim/); assert.doesNotMatch(content, /Lowest estimated subtotal among selected sample stores/); close(root);
});
test("ambiguous ingredient and unquantified item have explicit UI", () => {
  const root = render(snapshot([base("choice", "milk", { recipeIngredientText: "milk or cream" }), base("quantity", "rice")]));
  assert.match(text(root), /Choose ingredient/); assert.match(text(root), /Quantity needed/); close(root);
});
test("rejecting a match is local and resets on remount", () => {
  const before = JSON.stringify(measuredSnapshot); const root = render(measuredSnapshot);
  const reject = root.root.findAllByType("button").find((button) => button.props["aria-label"]?.startsWith("Reject match"));
  renderer.act(() => reject.props.onClick()); assert.match(text(root), /Rejected for this preview/);
  assert.equal(JSON.stringify(measuredSnapshot), before); assert.equal(storage.size, 0); close(root);
  const again = render(measuredSnapshot); assert.doesNotMatch(text(again), /Rejected for this preview/); close(again);
});
test("accept cannot override unknown size or preparation mismatch", () => {
  const root = render(measuredSnapshot);
  const accept = root.root.findAllByType("button").find((button) => button.props["aria-label"]?.startsWith("Accept match") && button.props["aria-label"].includes("Size needs review"));
  renderer.act(() => accept.props.onClick()); assert.match(text(root), /Package contents are unknown/);
  const mismatched = root.root.findAllByType("button").filter((button) => button.props["aria-label"]?.startsWith("Accept match") && button.props["aria-label"].includes("Different preparation"));
  assert.ok(mismatched.every((button) => button.props.disabled));
  const model = fixtures.buildFixturePreview(measuredSnapshot, { "need-0:sample-a:unknown": "accepted" }, fixtures.FIXTURE_STORES, "standard");
  assert.equal(model.comparisons[0].stores[0].result.offers.find((offer) => offer.offerId.endsWith(":unknown")).requirementCost.reason, "unknown-package"); close(root);
});
test("stale/inapplicable prices show unavailable messaging and no winner", () => {
  for (const scenario of ["stale", "inapplicable"]) {
    const root = render(measuredSnapshot);
    renderer.act(() => root.root.findByType("select").props.onChange({ target: { value: scenario } }));
    assert.match(text(root), /Price unavailable/);
    assert.match(text(root), scenario === "stale" ? /sample price has expired/ : /sample price does not apply/);
    assert.doesNotMatch(text(root), /Lowest estimated subtotal among selected sample stores/); close(root);
  }
});
test("empty and all-checked lists remain empty; no fixture items are injected", () => {
  for (const value of [snapshot([]), snapshot([base("checked", "milk", { checked: true })])]) {
    const root = render(value); assert.match(text(root), /Nothing pending to compare/); assert.doesNotMatch(text(root), /Sample product:/); close(root);
  }
});
test("English/Spanish strings have parity and Spanish page renders", () => {
  assert.deepEqual(Object.keys(en.deals).sort(), Object.keys(es.deals).sort());
  storage.set("simple-dinners.language.v1", "es");
  const root = render(measuredSnapshot); assert.match(text(root), /Ofertas para mi lista/); assert.match(text(root), /Mercado ficticio/); close(root); storage.clear();
});
test("Walmart search handoff remains independent and search-only", () => {
  const walmart = load("src/fulfillment/walmartApiClient.ts");
  const intents = walmart.buildWalmartSearchIntents([], [{ itemId: "manual", shoppingName: "milk", searchCandidate: "whole milk" }]);
  assert.equal(intents[0].searchCandidate, "whole milk"); assert.equal(intents[0].quantity, null);
  const panel = fs.readFileSync("src/components/WalmartHandoffPanel.tsx", "utf8");
  assert.match(panel, /https:\/\/www\.walmart\.com\/search\?q=/); assert.doesNotMatch(panel, /deals\//);
});
test("preview modules contain no network, persistence, clock timers or provider requests", () => {
  for (const file of ["src/deals/fixturePreview.ts", "src/pages/ShoppingDealsPage.tsx", "src/components/deals/DealsNeedCard.tsx"]) {
    assert.doesNotMatch(fs.readFileSync(file, "utf8"), /\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|setInterval|setTimeout|console\.|https?:\/\//);
  }
});
console.log(`PASS: ${count} Deals Phase 3 UI/snapshot scenarios`);
