import { mkdir, writeFile } from "node:fs/promises";

const restaurants = [
  {
    id: "motos-kingsport",
    queries: [
      "1001 E Stone Dr, Kingsport, TN 37660, USA",
    ],
  },
  {
    id: "super-yummy-kingsport",
    queries: [
      "4366 W Stone Dr, Kingsport, TN 37660, USA",
    ],
  },
  {
    id: "si-senor-gray",
    queries: [
      "405 Roy Martin Rd, Gray, TN 37615, USA",
      "Si Senor Mexican Grill, Gray, TN, USA",
    ],
  },
  {
    id: "jaks-diner",
    queries: [
      "4028 Fort Henry Dr, Kingsport, TN 37663, USA",
    ],
  },
  {
    id: "la-abejita",
    queries: [
      "1401 Bloomingdale Rd, Kingsport, TN 37660",
    ],
  },
  {
    id: "china-wok-kingsport",
    queries: [
      "600 E Sullivan St, Kingsport, TN 37660, USA",
    ],
  },
  {
    id: "rice-bistro-filipino",
    queries: [
      "1811 W State of Franklin Rd, Johnson City, TN 37604, USA",
      "Hana Asian Fusion, Johnson City, TN, USA",
    ],
  },
  {
    id: "thai-house-kingsport",
    queries: [
      "2003 N Eastman Rd, Kingsport, TN 37660, USA",
    ],
  },
  {
    id: "latin-love-kitchen",
    queries: [
      "221 E Center St, Kingsport, TN 37660, USA",
    ],
  },
  {
    id: "ole-crow-tavern",
    queries: [
      "215 Commerce St, Kingsport, TN 37660, USA",
    ],
  },
];

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const coordinates = {};

async function geocodeNominatim(query) {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "1",
    countrycodes: "us",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      headers: {
        "User-Agent":
          "SimpleDinners-ZachsMap/1.0 (+https://dinners.ncocaptain.com)",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Nominatim returned HTTP ${response.status}`,
    );
  }

  const results = await response.json();

  if (!results[0]) {
    return null;
  }

  return {
    latitude: Number(results[0].lat),
    longitude: Number(results[0].lon),
    displayName: results[0].display_name,
    source: "OpenStreetMap / Nominatim",
  };
}

async function geocodeCensus(query) {
  const params = new URLSearchParams({
    address: query.replace(/,\s*USA$/i, ""),
    benchmark: "Public_AR_Current",
    format: "json",
  });

  const response = await fetch(
    `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(
      `Census geocoder returned HTTP ${response.status}`,
    );
  }

  const data = await response.json();

  const match =
    data?.result?.addressMatches?.[0];

  if (!match?.coordinates) {
    return null;
  }

  return {
    latitude: Number(match.coordinates.y),
    longitude: Number(match.coordinates.x),
    displayName:
      match.matchedAddress || query,
    source: "U.S. Census Geocoder",
  };
}

for (const restaurant of restaurants) {
  console.log(`📍 Geocoding ${restaurant.id}...`);

  let matched = null;
  let matchedQuery = null;

  for (const query of restaurant.queries) {
    console.log(`   trying OSM: ${query}`);

    matched =
      await geocodeNominatim(query);

    await sleep(1200);

    if (!matched) {
      console.log(
        `   OSM had no match; trying Census...`,
      );

      try {
        matched =
          await geocodeCensus(query);
      } catch (error) {
        console.log(
          `   Census lookup error: ${error.message}`,
        );
      }
    }

    if (matched) {
      matchedQuery = query;
      break;
    }
  }

  if (!matched) {
    throw new Error(
      `No coordinates found for ${restaurant.id}`,
    );
  }

  coordinates[restaurant.id] = {
    latitude: matched.latitude,
    longitude: matched.longitude,
  };

  console.log(
    `   ✅ ${matched.latitude}, ${matched.longitude}`,
  );

  console.log(
    `   ↳ ${matched.displayName}`,
  );

  console.log(
    `   ↳ source: ${matched.source}`,
  );

  console.log(
    `   ↳ matched from: ${matchedQuery}`,
  );
}

await mkdir("src/zachsMap", {
  recursive: true,
});

await writeFile(
  "src/zachsMap/coordinates.generated.ts",
  `// Generated during development.
export const ZACHS_MAP_COORDINATES = ${JSON.stringify(
    coordinates,
    null,
    2,
  )} as const;
`,
);

console.log(
  "\n✅ Wrote src/zachsMap/coordinates.generated.ts",
);
