const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

function pass(message) {
  console.log("PASS:", message);
}

function assert(condition, message) {
  if (!condition) {
    console.error("FAIL:", message);
    process.exitCode = 1;
    return;
  }
  pass(message);
}

const shopping = read("src/pages/ShoppingListPage.tsx");
const preview = read("src/pages/GroceryDeliveryPreviewPage.tsx");
const panel = read("src/components/KrogerCatalogDevPanel.tsx");
const app = read("src/App.tsx");
const catalogApi = read("api/kroger-catalog.ts");
const oauthStart = read("api/kroger-oauth-start.ts");
const oauthCallback = read("api/kroger-oauth-callback.ts");
const statusApi = read("api/kroger-status.ts");
const cartApi = read("api/kroger-cart.ts");

assert(
  shopping.includes("VITE_KROGER_ENABLED"),
  "Shopping List exposes Kroger behind the production feature flag"
);

assert(
  shopping.includes("simple-dinners:grocery-preview-snapshot"),
  "Shopping List persists the Kroger shopping snapshot"
);

assert(
  shopping.includes("searchOnly: requirements.searchOnly"),
  "Search-only groceries are carried into the Kroger snapshot"
);

assert(
  preview.includes("readSavedGroceryPreviewSnapshot"),
  "Kroger shopping snapshot survives page refresh"
);

assert(
  preview.includes("searchOnly={snapshot.searchOnly}"),
  "Search-only groceries reach the Kroger product picker"
);

assert(
  panel.includes("searchableRequirements"),
  "Kroger picker combines measured and search-only groceries"
);

assert(
  panel.includes("choose product"),
  "Search-only groceries are visible as shopper-choice items"
);

assert(
  panel.includes("manualSelectionRequirement"),
  "Search-only groceries can create manual Kroger cart selections"
);

assert(
  app.includes('import.meta.env.VITE_KROGER_ENABLED === "true"'),
  "Production Kroger route is controlled by the feature flag"
);

for (const [name, source] of [
  ["catalog", catalogApi],
  ["oauth start", oauthStart],
  ["oauth callback", oauthCallback],
  ["status", statusApi],
  ["cart", cartApi],
]) {
  assert(
    !/from\s+["'][^"']*(?:_krogerServer|krogerCatalog)["'];/.test(source),
    `${name} serverless imports include explicit .js extensions`
  );
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("Kroger release regression checks passed.");
