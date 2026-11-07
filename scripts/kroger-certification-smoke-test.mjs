const environment =
  process.env.KROGER_ENV === "production"
    ? "production"
    : "certification";

const clientId =
  process.env.KROGER_CLIENT_ID?.trim();
const clientSecret =
  process.env.KROGER_CLIENT_SECRET?.trim();

if (!clientId || !clientSecret) {
  console.error(
    "Missing KROGER_CLIENT_ID / KROGER_CLIENT_SECRET."
  );
  console.error(
    "Use an ignored .env.local and run:"
  );
  console.error(
    "node --env-file=.env.local scripts/kroger-certification-smoke-test.mjs 37660 \"chicken broth\""
  );
  process.exit(1);
}

const zip = process.argv[2] || "";
const term =
  process.argv.slice(3).join(" ").trim() ||
  "chicken broth";

if (!/^\d{5}$/.test(zip)) {
  console.error(
    "Provide a 5-digit ZIP as the first argument."
  );
  process.exit(1);
}

const host =
  environment === "production"
    ? "https://api.kroger.com"
    : "https://api-ce.kroger.com";

const basic = Buffer.from(
  `${clientId}:${clientSecret}`
).toString("base64");

const tokenResponse = await fetch(
  `${host}/v1/connect/oauth2/token`,
  {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${basic}`,
      "Content-Type":
        "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "product.compact",
    }),
  }
);

const tokenData = await tokenResponse
  .json()
  .catch(() => null);

if (!tokenResponse.ok) {
  console.error(
    "Kroger token failed:",
    tokenResponse.status,
    tokenData
  );
  process.exit(1);
}

const token = tokenData?.access_token;

if (!token) {
  console.error(
    "Kroger did not return an access token."
  );
  process.exit(1);
}

console.log(
  `Kroger ${environment} token: OK`
);

const headers = {
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
};

const locationParams =
  new URLSearchParams({
    "filter.zipCode.near": zip,
    "filter.radiusInMiles": "25",
    "filter.limit": "10",
  });

const locationsResponse = await fetch(
  `${host}/v1/locations?${locationParams}`,
  { headers }
);

const locationsData =
  await locationsResponse
    .json()
    .catch(() => null);

if (!locationsResponse.ok) {
  console.error(
    "Kroger locations failed:",
    locationsResponse.status,
    locationsData
  );
  process.exit(1);
}

const locations = Array.isArray(
  locationsData?.data
)
  ? locationsData.data
  : [];

console.log(
  `Locations near ${zip}: ${locations.length}`
);

for (const location of locations.slice(
  0,
  5
)) {
  const address =
    location?.address || {};

  console.log(
    `- ${location?.locationId || "?"} · ${location?.name || location?.chain || "Kroger"} · ${address.addressLine1 || ""}, ${address.city || ""} ${address.state || ""}`
  );
}

const firstLocationId =
  locations[0]?.locationId || "";

const productParams =
  new URLSearchParams({
    "filter.term": term,
    "filter.limit": "10",
  });

if (firstLocationId) {
  productParams.set(
    "filter.locationId",
    firstLocationId
  );
}

let productsResponse = await fetch(
  `${host}/v1/products?${productParams}`,
  { headers }
);

let productsData =
  await productsResponse
    .json()
    .catch(() => null);

let storeFilterApplied =
  Boolean(firstLocationId);

if (
  !productsResponse.ok &&
  environment === "certification" &&
  firstLocationId
) {
  console.log(
    "Certification store filter unavailable; retrying catalog-only product search."
  );

  productParams.delete(
    "filter.locationId"
  );

  productsResponse = await fetch(
    `${host}/v1/products?${productParams}`,
    { headers }
  );

  productsData =
    await productsResponse
      .json()
      .catch(() => null);

  storeFilterApplied = false;
}

if (!productsResponse.ok) {
  console.error(
    "Kroger products failed:",
    productsResponse.status,
    productsData
  );
  process.exit(1);
}

const products = Array.isArray(
  productsData?.data
)
  ? productsData.data
  : [];

console.log(
  `Products for "${term}": ${products.length}`
);
console.log(
  `Store filter applied: ${storeFilterApplied ? "yes" : "no (Certification catalog-only)"}`
);

for (const product of products.slice(
  0,
  10
)) {
  const item = Array.isArray(
    product?.items
  )
    ? product.items[0]
    : null;

  const size =
    item?.size || product?.size || "";
  const regular =
    item?.price?.regular;

  console.log(
    `- ${product?.productId || "?"} · ${product?.description || "Unknown product"}${size ? ` · ${size}` : ""}${typeof regular === "number" ? ` · $${regular.toFixed(2)}` : ""}`
  );
}

console.log("");
console.log(
  "PASS: Kroger client-credentials authentication"
);
console.log(
  "PASS: ZIP-to-location lookup"
);
console.log(
  "PASS: product catalog search"
);
