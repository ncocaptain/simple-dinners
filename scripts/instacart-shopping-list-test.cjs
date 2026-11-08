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
    if (dependencies[name]) {
      return dependencies[name];
    }
    throw new Error("Unexpected dependency: " + name);
  };

  new Function(
    "require",
    "module",
    "exports",
    output
  )(localRequire, mod, mod.exports);

  return mod.exports;
}

const retailer = load(
  "src/fulfillment/groceryRetailerMatch.ts"
);

const instacart = load(
  "src/fulfillment/instacartShoppingList.ts",
  {
    "./groceryRetailerMatch": retailer,
  }
);

function requirement(
  shoppingName,
  searchCandidate,
  quantity,
  unit,
  packageSize = ""
) {
  return {
    shoppingName,
    searchCandidate,
    quantity,
    unit,
    packageSize,
    sourceLines: [],
    canAutoAddToCart: false,
  };
}

const requirements = [
  requirement(
    "ground beef",
    "ground beef",
    1,
    "lb"
  ),
  requirement(
    "ready-to-eat apple pie filling",
    "Apple Pie Filling",
    1,
    "can",
    "21 oz"
  ),
  requirement(
    "ripe bananas",
    "bananas",
    2,
    "count"
  ),
  requirement(
    "ready-to-eat vanilla pudding snack cups",
    "Vanilla Pudding Snack Cups",
    4,
    "count"
  ),
  requirement(
    "whipped cream",
    "Whipped Cream",
    3,
    "cup"
  ),
  requirement(
    "ground cinnamon",
    "ground cinnamon",
    0.25,
    "tsp"
  ),
];

const before = JSON.stringify(requirements);

const payload =
  instacart.buildInstacartShoppingListPayload(
    requirements,
    {
      title: "Simple Dinners Grocery List",
      linkBackUrl:
        "https://dinners.ncocaptain.com/shopping-list",
      expiresInDays: 7,
    }
  );

assert.equal(payload.link_type, "shopping_list");
assert.equal(payload.expires_in, 7);
assert.equal(payload.line_items.length, 6);

const beef = payload.line_items[0];
assert.deepEqual(
  beef.line_item_measurements,
  [{ quantity: 1, unit: "lb" }]
);

const pie = payload.line_items[1];
assert.equal(pie.name, "Apple Pie Filling");
assert.deepEqual(
  pie.line_item_measurements,
  [{ quantity: 21, unit: "ounces can" }]
);

const bananas = payload.line_items[2];
assert.deepEqual(
  bananas.line_item_measurements,
  [{ quantity: 2, unit: "each" }]
);

const pudding = payload.line_items[3];
assert.equal(
  pudding.line_item_measurements,
  undefined
);
assert.match(
  pudding.display_text,
  /4 needed/i
);

const cream = payload.line_items[4];
assert.deepEqual(
  cream.line_item_measurements,
  [{ quantity: 3, unit: "cup" }]
);

const cinnamon = payload.line_items[5];
assert.deepEqual(
  cinnamon.line_item_measurements,
  [{ quantity: 0.25, unit: "teaspoon" }]
);

assert.equal(
  payload.landing_page_configuration
    .partner_linkback_url,
  "https://dinners.ncocaptain.com/shopping-list"
);

assert.equal(
  JSON.stringify(requirements),
  before
);

console.log("=== INSTACART SHOPPING LIST PAYLOAD ===");
console.log("Line items:", payload.line_items.length);
console.log(
  payload.line_items.map((item) => ({
    name: item.name,
    display: item.display_text,
    measurements: item.line_item_measurements,
  }))
);
console.log("");
console.log("PASS: Instacart uses clean product search names");
console.log("PASS: Recipe weights and volumes use supported measurements");
console.log("PASS: Countable produce uses each");
console.log("PASS: Package-internal counts do not become store package counts");
console.log("PASS: Explicit can weight is preserved");
console.log("PASS: Original grocery requirements unchanged");
