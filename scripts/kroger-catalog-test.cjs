const assert = require("node:assert/strict");
const fs = require("fs");
const ts = require("typescript");

const source = fs.readFileSync(
  "src/fulfillment/krogerCatalog.ts",
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
  normalizeKrogerLocations,
  normalizeKrogerProducts,
  krogerProductToRetailerPackageCandidate,
} = mod.exports;

const locations =
  normalizeKrogerLocations({
    data: [
      {
        locationId: "01400001",
        name: "Test Kroger",
        chain: "Kroger",
        address: {
          addressLine1: "123 Main St",
          city: "Kingsport",
          state: "TN",
          zipCode: "37660",
        },
      },
    ],
  });

assert.deepEqual(locations, [
  {
    locationId: "01400001",
    name: "Test Kroger",
    chain: "Kroger",
    addressLine1: "123 Main St",
    city: "Kingsport",
    state: "TN",
    zipCode: "37660",
  },
]);

const products =
  normalizeKrogerProducts({
    data: [
      {
        productId: "0001111000001",
        description: "Chicken Broth",
        brand: "Kroger",
        images: [
          {
            sizes: [
              {
                size: "medium",
                url: "https://example.test/broth.jpg",
              },
            ],
          },
        ],
        items: [
          {
            upc: "0001111000001",
            size: "32 fl oz",
            price: {
              regular: 2.49,
              promo: 1.99,
            },
          },
        ],
      },
    ],
  });

assert.equal(products.length, 1);
assert.equal(
  products[0].productId,
  "0001111000001"
);
assert.equal(
  products[0].size,
  "32 fl oz"
);
assert.equal(
  products[0].regularPrice,
  2.49
);
assert.equal(
  products[0].promoPrice,
  1.99
);
assert.equal(
  products[0].imageUrl,
  "https://example.test/broth.jpg"
);

console.log(
  "PASS: Kroger locations normalize for Simple Dinners"
);
console.log(
  "PASS: Kroger products normalize with UPC, size, image, and price"
);

const candidate =
  krogerProductToRetailerPackageCandidate(
    products[0]
  );

assert.deepEqual(candidate, {
  id: "0001111000001",
  productName: "Chicken Broth",
  packageQuantity: 32,
  packageUnit: "fl oz",
});

console.log(
  "PASS: Kroger package sizes map to retailer package candidates"
);
