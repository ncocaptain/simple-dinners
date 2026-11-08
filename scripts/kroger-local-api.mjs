import http from "node:http";

const clientId =
  process.env.KROGER_CLIENT_ID?.trim();
const clientSecret =
  process.env.KROGER_CLIENT_SECRET?.trim();
const environment =
  process.env.KROGER_ENV === "production"
    ? "production"
    : "certification";

if (!clientId || !clientSecret) {
  console.error(
    "Missing KROGER_CLIENT_ID / KROGER_CLIENT_SECRET."
  );
  process.exit(1);
}

const host =
  environment === "production"
    ? "https://api.kroger.com/v1"
    : "https://api-ce.kroger.com/v1";

const basic = Buffer.from(
  `${clientId}:${clientSecret}`
).toString("base64");

async function token() {
  const response = await fetch(
    `${host}/connect/oauth2/token`,
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

  const data = await response.json();

  if (!response.ok || !data?.access_token) {
    throw new Error("KROGER_TOKEN_FAILED");
  }

  return data.access_token;
}

async function krogerGet(path, params, accessToken) {
  const response = await fetch(
    `${host}${path}?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();
  return { response, data };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(
    req.url || "/",
    "http://localhost"
  );

  if (url.pathname !== "/api/kroger-catalog") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  try {
    const accessToken = await token();
    const action =
      url.searchParams.get("action") || "";

    if (action === "locations") {
      const zip =
        url.searchParams.get("zip") || "";

      if (!/^\d{5}$/.test(zip)) {
        res.writeHead(400, {
          "Content-Type": "application/json",
        });
        res.end(
          JSON.stringify({
            error: "INVALID_ZIP",
          })
        );
        return;
      }

      const params = new URLSearchParams({
        "filter.zipCode.near": zip,
        "filter.radiusInMiles": "25",
        "filter.limit": "10",
      });

      const result = await krogerGet(
        "/locations",
        params,
        accessToken
      );

      res.writeHead(
        result.response.ok ? 200 : 502,
        {
          "Content-Type": "application/json",
        }
      );
      res.end(
        JSON.stringify({
          locations: result.data?.data ?? [],
        })
      );
      return;
    }

    if (action === "products") {
      const term =
        url.searchParams.get("term") || "";
      const locationId =
        url.searchParams.get("locationId") ||
        "";

      const params = new URLSearchParams({
        "filter.term": term,
        "filter.limit": "10",
      });

      if (locationId) {
        params.set(
          "filter.locationId",
          locationId
        );
      }

      const result = await krogerGet(
        "/products",
        params,
        accessToken
      );

      res.writeHead(
        result.response.ok ? 200 : 502,
        {
          "Content-Type": "application/json",
        }
      );
      res.end(
        JSON.stringify({
          products: result.data?.data ?? [],
          storeFilterApplied:
            Boolean(locationId),
          warning: "",
        })
      );
      return;
    }

    res.writeHead(400, {
      "Content-Type": "application/json",
    });
    res.end(
      JSON.stringify({
        error: "INVALID_ACTION",
      })
    );
  } catch (error) {
    res.writeHead(500, {
      "Content-Type": "application/json",
    });
    res.end(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "KROGER_LOCAL_SERVER_ERROR",
      })
    );
  }
});

server.listen(8787, "127.0.0.1", () => {
  console.log(
    "Kroger local API listening on http://127.0.0.1:8787"
  );
});
