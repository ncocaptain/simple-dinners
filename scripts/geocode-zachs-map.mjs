import { mkdir, writeFile } from "node:fs/promises";
import {
  ZACHS_MAP_RESTAURANTS,
} from "../src/zachsMap/restaurants.ts";

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function stripSuite(address) {
  return String(address || "")
    .replace(/\s+(?:ste|suite)\s+[a-z0-9-]+$/i, "")
    .replace(/\s+#\s*[a-z0-9-]+$/i, "")
    .trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

const restaurants = ZACHS_MAP_RESTAURANTS
  .filter((restaurant) => restaurant.active)
  .map((restaurant) => {
    const fullAddress = [
      restaurant.address,
      restaurant.city,
      restaurant.state,
      restaurant.zip,
      "USA",
    ].join(", ");

    const simplifiedAddress = [
      stripSuite(restaurant.address),
      restaurant.city,
      restaurant.state,
      restaurant.zip,
      "USA",
    ].join(", ");

    const businessQuery = [
      restaurant.name,
      restaurant.city,
      restaurant.state,
      "USA",
    ].join(", ");

    return {
      id: restaurant.id,
      queries: unique([
        fullAddress,
        simplifiedAddress,
        businessQuery,
      ]),
    };
  });

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

    try {
      matched =
        await geocodeNominatim(query);
    } catch (error) {
      console.log(
        `   OSM lookup error: ${error.message}`,
      );
    }

    await sleep(1200);

    if (!matched) {
      console.log(
        "   OSM had no match; trying Census...",
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
  `\n✅ Wrote ${Object.keys(coordinates).length} coordinates to src/zachsMap/coordinates.generated.ts`,
);
