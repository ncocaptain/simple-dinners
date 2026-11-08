import http from "node:http";
import crypto from "node:crypto";

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

const redirectUri =
  process.env.KROGER_REDIRECT_URI?.trim() ||
  "http://localhost:8787/api/kroger-oauth/callback";

let pendingOAuth = null;
let userToken = null;

const base64Url = (buffer) =>
  buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

function createPkce() {
  const verifier = base64Url(
    crypto.randomBytes(48)
  );
  const challenge = base64Url(
    crypto
      .createHash("sha256")
      .update(verifier)
      .digest()
  );

  return { verifier, challenge };
}

function tokenIsUsable() {
  return Boolean(
    userToken?.access_token &&
      typeof userToken.expires_at === "number" &&
      userToken.expires_at >
        Date.now() + 30_000
  );
}

async function exchangeAuthorizationCode(
  code,
  verifier
) {
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
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      }),
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok || !data?.access_token) {
    console.error(
      "Kroger authorization-code exchange failed:",
      response.status
    );
    throw new Error(
      "KROGER_USER_TOKEN_FAILED"
    );
  }

  userToken = {
    ...data,
    expires_at:
      Date.now() +
      Math.max(
        0,
        Number(data.expires_in || 1800)
      ) *
        1000,
  };
}

async function refreshUserToken() {
  if (!userToken?.refresh_token) {
    throw new Error(
      "KROGER_USER_NOT_CONNECTED"
    );
  }

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
        grant_type: "refresh_token",
        refresh_token:
          userToken.refresh_token,
      }),
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok || !data?.access_token) {
    userToken = null;
    throw new Error(
      "KROGER_REFRESH_FAILED"
    );
  }

  userToken = {
    ...userToken,
    ...data,
    refresh_token:
      data.refresh_token ||
      userToken.refresh_token,
    expires_at:
      Date.now() +
      Math.max(
        0,
        Number(data.expires_in || 1800)
      ) *
        1000,
  };
}

async function getUserAccessToken() {
  if (tokenIsUsable()) {
    return userToken.access_token;
  }

  await refreshUserToken();
  return userToken.access_token;
}

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

  if (
    url.pathname ===
    "/api/kroger-oauth/callback"
  ) {
    try {
      const code =
        url.searchParams.get("code") || "";
      const state =
        url.searchParams.get("state") || "";

      if (
        !pendingOAuth ||
        !code ||
        !state ||
        state !== pendingOAuth.state
      ) {
        throw new Error(
          "KROGER_OAUTH_STATE_MISMATCH"
        );
      }

      const verifier =
        pendingOAuth.verifier;
      pendingOAuth = null;

      await exchangeAuthorizationCode(
        code,
        verifier
      );

      res.writeHead(200, {
        "Content-Type":
          "text/html; charset=utf-8",
      });
      res.end(`<!doctype html>
<html>
  <body style="font-family:system-ui;padding:32px;background:#09111f;color:#f8fafc">
    <h2>Kroger connected</h2>
    <p>You can return to Simple Dinners.</p>
    <script>
      if (window.opener) {
        window.opener.postMessage(
          { type: "simple-dinners-kroger-oauth", connected: true },
          "http://localhost:5173"
        );
      }
      setTimeout(() => window.close(), 900);
    </script>
  </body>
</html>`);
    } catch (error) {
      res.writeHead(400, {
        "Content-Type":
          "text/html; charset=utf-8",
      });
      res.end(`<!doctype html>
<html>
  <body style="font-family:system-ui;padding:32px">
    <h2>Kroger connection failed</h2>
    <p>${error instanceof Error ? error.message : "OAuth error"}</p>
  </body>
</html>`);
    }
    return;
  }

  if (
    url.pathname ===
    "/api/kroger-oauth"
  ) {
    const action =
      url.searchParams.get("action") ||
      "status";

    if (action === "status") {
      res.writeHead(200, {
        "Content-Type": "application/json",
      });
      res.end(
        JSON.stringify({
          connected:
            Boolean(userToken),
          tokenUsable:
            tokenIsUsable(),
          environment,
        })
      );
      return;
    }

    if (action === "start") {
      const { verifier, challenge } =
        createPkce();
      const state = base64Url(
        crypto.randomBytes(24)
      );

      pendingOAuth = {
        verifier,
        state,
        createdAt: Date.now(),
      };

      const authorizeUrl = new URL(
        `${host}/connect/oauth2/authorize`
      );

      authorizeUrl.searchParams.set(
        "client_id",
        clientId
      );
      authorizeUrl.searchParams.set(
        "redirect_uri",
        redirectUri
      );
      authorizeUrl.searchParams.set(
        "response_type",
        "code"
      );
      authorizeUrl.searchParams.set(
        "scope",
        "cart.basic:write profile.compact"
      );
      authorizeUrl.searchParams.set(
        "state",
        state
      );
      authorizeUrl.searchParams.set(
        "code_challenge",
        challenge
      );
      authorizeUrl.searchParams.set(
        "code_challenge_method",
        "S256"
      );

      res.writeHead(302, {
        Location: authorizeUrl.toString(),
      });
      res.end();
      return;
    }

    res.writeHead(400, {
      "Content-Type": "application/json",
    });
    res.end(
      JSON.stringify({
        error: "INVALID_OAUTH_ACTION",
      })
    );
    return;
  }

  if (
    url.pathname === "/api/kroger-cart"
  ) {
    if (req.method !== "POST") {
      res.writeHead(405, {
        "Content-Type": "application/json",
      });
      res.end(
        JSON.stringify({
          error: "POST_ONLY",
        })
      );
      return;
    }

    let rawBody = "";
    for await (const chunk of req) {
      rawBody += chunk;
    }

    let body = null;
    try {
      body = JSON.parse(
        rawBody || "{}"
      );
    } catch {
      body = null;
    }

    const items =
      Array.isArray(body?.items)
        ? body.items
        : [];

    const safeItems = items
      .map((item) => ({
        upc:
          typeof item?.upc === "string"
            ? item.upc.trim()
            : "",
        quantity:
          Number.isFinite(
            Number(item?.quantity)
          )
            ? Math.max(
                1,
                Math.floor(
                  Number(item.quantity)
                )
              )
            : 0,
      }))
      .filter(
        (item) =>
          /^\d{8,14}$/.test(item.upc) &&
          item.quantity > 0
      );

    if (
      !safeItems.length ||
      safeItems.length !== items.length
    ) {
      res.writeHead(400, {
        "Content-Type": "application/json",
      });
      res.end(
        JSON.stringify({
          error:
            "INVALID_CART_ITEMS",
        })
      );
      return;
    }

    try {
      const accessToken =
        await getUserAccessToken();

      const response = await fetch(
        `${host}/cart/add`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization:
              `Bearer ${accessToken}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            items: safeItems,
          }),
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();
        console.error(
          "Kroger cart add failed:",
          response.status,
          errorText.slice(0, 300)
        );
        throw new Error(
          "KROGER_CART_ADD_FAILED"
        );
      }

      res.writeHead(200, {
        "Content-Type": "application/json",
      });
      res.end(
        JSON.stringify({
          added: safeItems.length,
          environment,
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
              : "KROGER_CART_ERROR",
        })
      );
    }
    return;
  }

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
      const locations = Array.isArray(
        result.data?.data
      )
        ? result.data.data.map((location) => ({
            locationId:
              location?.locationId || "",
            name: location?.name || "",
            chain: location?.chain || "",
            addressLine1:
              location?.address?.addressLine1 || "",
            city:
              location?.address?.city || "",
            state:
              location?.address?.state || "",
            zipCode:
              location?.address?.zipCode || "",
          }))
        : [];

      res.end(
        JSON.stringify({
          locations,
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
      const products = Array.isArray(
        result.data?.data
      )
        ? result.data.data.map((product) => {
            const item = Array.isArray(
              product?.items
            )
              ? product.items[0]
              : null;

            const image =
              Array.isArray(product?.images)
                ? product.images[0]
                : null;
            const sizes =
              Array.isArray(image?.sizes)
                ? image.sizes
                : [];
            const imageSize =
              sizes.find(
                (entry) =>
                  entry?.size === "medium"
              ) || sizes[0];

            return {
              productId:
                product?.productId || "",
              upc:
                item?.upc ||
                product?.upc ||
                "",
              description:
                product?.description || "",
              brand:
                product?.brand || "",
              size:
                item?.size ||
                product?.size ||
                "",
              imageUrl:
                imageSize?.url || "",
              regularPrice:
                typeof item?.price?.regular ===
                "number"
                  ? item.price.regular
                  : null,
              promoPrice:
                typeof item?.price?.promo ===
                "number"
                  ? item.price.promo
                  : null,
            };
          })
        : [];

      res.end(
        JSON.stringify({
          products,
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
