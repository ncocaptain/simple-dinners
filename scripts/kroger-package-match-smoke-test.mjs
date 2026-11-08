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
    "Missing Kroger credentials in .env.local."
  );
  process.exit(1);
}

const zip = process.argv[2] || "37660";
const term =
  process.argv.slice(3).join(" ").trim() ||
  "chicken broth";

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

const tokenData = await tokenResponse.json();

if (!tokenResponse.ok) {
  console.error(
    "Token failed:",
    tokenResponse.status,
    tokenData
  );
  process.exit(1);
}

const headers = {
  Accept: "application/json",
  Authorization: `Bearer ${tokenData.access_token}`,
};

const locParams = new URLSearchParams({
  "filter.zipCode.near": zip,
  "filter.radiusInMiles": "25",
  "filter.limit": "10",
});

const locResponse = await fetch(
  `${host}/v1/locations?${locParams}`,
  { headers }
);
const locData = await locResponse.json();

if (!locResponse.ok) {
  console.error("Location lookup failed");
  process.exit(1);
}

const locationId =
  locData?.data?.[0]?.locationId;

if (!locationId) {
  console.error("No location found.");
  process.exit(1);
}

const productParams = new URLSearchParams({
  "filter.term": term,
  "filter.locationId": locationId,
  "filter.limit": "10",
});

const productResponse = await fetch(
  `${host}/v1/products?${productParams}`,
  { headers }
);
const productData = await productResponse.json();

if (!productResponse.ok) {
  console.error("Product lookup failed");
  process.exit(1);
}

const products = Array.isArray(productData?.data)
  ? productData.data
  : [];

const parseSize = (size) => {
  const normalized = String(size || "")
    .trim()
    .toLowerCase();

  const amount = normalized.match(
    /^(\d+(?:\.\d+)?)\s*(fl\s*oz|oz|lb|lbs|g|kg|ml|l)$/
  );

  if (!amount) return null;

  return {
    quantity: Number(amount[1]),
    unit:
      amount[2].replace(/\s+/g, " ").trim() === "lbs"
        ? "lb"
        : amount[2].replace(/\s+/g, " ").trim(),
  };
};

const mlPerUnit = {
  cup: 236.588,
  "fl oz": 29.5735,
  ml: 1,
  l: 1000,
};

const requiredMl = 2 * mlPerUnit.cup;

const candidates = products
  .map((product) => {
    const item = Array.isArray(product.items)
      ? product.items[0]
      : null;
    const parsed = parseSize(
      item?.size || product?.size || ""
    );

    if (!parsed || !(parsed.unit in mlPerUnit)) {
      return null;
    }

    const packageMl =
      parsed.quantity * mlPerUnit[parsed.unit];

    return {
      id: product.productId,
      name: product.description,
      size: `${parsed.quantity} ${parsed.unit}`,
      packageMl,
      packagesNeeded: Math.ceil(
        (requiredMl - 1e-9) / packageMl
      ),
      excess: Math.max(
        0,
        Math.ceil(
          (requiredMl - 1e-9) / packageMl
        ) *
          packageMl -
          requiredMl
      ),
    };
  })
  .filter(Boolean)
  .sort(
    (a, b) =>
      a.packagesNeeded - b.packagesNeeded ||
      a.excess - b.excess ||
      a.name.localeCompare(b.name)
  );

console.log(
  `Store: ${locData.data[0].name} (${locationId})`
);
console.log(
  'Requirement: 2 cups chicken broth'
);

for (const candidate of candidates) {
  console.log(
    `- ${candidate.name} · ${candidate.size} · buy ${candidate.packagesNeeded}`
  );
}

if (!candidates.length) {
  console.error(
    "No safely comparable Kroger packages found."
  );
  process.exit(1);
}

console.log("");
console.log(
  `BEST SAFE MATCH: ${candidates[0].name} · ${candidates[0].size} · buy ${candidates[0].packagesNeeded}`
);
console.log(
  "PASS: real Kroger package data can satisfy a Simple Dinners recipe-volume requirement"
);
