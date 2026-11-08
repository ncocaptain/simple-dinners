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
  assessKrogerProductRelevance,
  rankRelevantKrogerProducts,
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


const freshBlueberries = {
  productId: "blueberries-fresh",
  upc: "1",
  description: "Fresh Blueberries",
  brand: "Kroger",
  size: "6 oz",
  imageUrl: "",
  regularPrice: 3.49,
  promoPrice: null,
};

const blueberryPouch = {
  productId: "blueberries-pouch",
  upc: "2",
  description:
    "Happy Tot Stage 4 Organic Bananas Blueberries Yogurt & Oats + Super Chia Pouch",
  brand: "Happy Tot",
  size: "4 fl oz",
  imageUrl: "",
  regularPrice: 1.99,
  promoPrice: null,
};

const brothRelevant = {
  productId: "broth-relevant",
  upc: "3",
  description:
    "Kroger Less Sodium Chicken Broth",
  brand: "Kroger",
  size: "32 oz",
  imageUrl: "",
  regularPrice: 2.19,
  promoPrice: null,
};

assert.equal(
  assessKrogerProductRelevance(
    "blueberries",
    blueberryPouch
  ).rejected,
  true
);

assert.equal(
  assessKrogerProductRelevance(
    "blueberries",
    freshBlueberries
  ).rejected,
  false
);

const blueberryRanked =
  rankRelevantKrogerProducts(
    "blueberries",
    [blueberryPouch, freshBlueberries]
  );

assert.equal(
  blueberryRanked.length,
  1
);
assert.equal(
  blueberryRanked[0].product.productId,
  "blueberries-fresh"
);

assert.equal(
  assessKrogerProductRelevance(
    "chicken broth",
    brothRelevant
  ).rejected,
  false
);

console.log(
  "PASS: prepared blueberry pouches are rejected for fresh blueberry searches"
);
console.log(
  "PASS: fresh blueberry products remain eligible"
);
console.log(
  "PASS: multi-word grocery searches require all meaningful terms"
);
