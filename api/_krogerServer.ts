import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export type KrogerEnvironment =
  | "certification"
  | "production";

export type StoredKrogerConnection = {
  user_id: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  expires_at: string;
  scope: string | null;
  environment: KrogerEnvironment;
  updated_at: string;
  created_at: string;
};

function requiredEnv(name: string) {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `MISSING_${name}`
    );
  }

  return value;
}

export function krogerEnvironment():
  KrogerEnvironment {
  return process.env.KROGER_ENV ===
    "production"
    ? "production"
    : "certification";
}

export function krogerBaseUrl() {
  return krogerEnvironment() ===
    "production"
    ? "https://api.kroger.com/v1"
    : "https://api-ce.kroger.com/v1";
}

export function krogerClientCredentials() {
  const clientId =
    requiredEnv("KROGER_CLIENT_ID");
  const clientSecret =
    requiredEnv("KROGER_CLIENT_SECRET");

  return {
    clientId,
    basic: Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString("base64"),
  };
}

export function krogerRedirectUri() {
  return requiredEnv(
    "KROGER_REDIRECT_URI"
  );
}

function encryptionKey() {
  const encoded =
    requiredEnv(
      "KROGER_TOKEN_ENCRYPTION_KEY"
    );

  const key = Buffer.from(
    encoded,
    "base64"
  );

  if (key.length !== 32) {
    throw new Error(
      "INVALID_KROGER_TOKEN_ENCRYPTION_KEY"
    );
  }

  return key;
}

export function encryptSecret(
  value: string
) {
  const iv = crypto.randomBytes(12);
  const cipher =
    crypto.createCipheriv(
      "aes-256-gcm",
      encryptionKey(),
      iv
    );

  const encrypted = Buffer.concat([
    cipher.update(
      value,
      "utf8"
    ),
    cipher.final(),
  ]);

  const tag =
    cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptSecret(
  value: string
) {
  const [
    version,
    ivValue,
    tagValue,
    encryptedValue,
  ] = value.split(".");

  if (
    version !== "v1" ||
    !ivValue ||
    !tagValue ||
    !encryptedValue
  ) {
    throw new Error(
      "INVALID_ENCRYPTED_SECRET"
    );
  }

  try {
    const decipher =
      crypto.createDecipheriv(
        "aes-256-gcm",
        encryptionKey(),
        Buffer.from(
          ivValue,
          "base64url"
        )
      );

    decipher.setAuthTag(
      Buffer.from(
        tagValue,
        "base64url"
      )
    );

    const decrypted = Buffer.concat([
      decipher.update(
        Buffer.from(
          encryptedValue,
          "base64url"
        )
      ),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    throw new Error(
      "KROGER_TOKEN_DECRYPT_FAILED"
    );
  }
}

export function randomUrlSafe(
  bytes = 32
) {
  return crypto
    .randomBytes(bytes)
    .toString("base64url");
}

export function sha256(
  value: string
) {
  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
}

export function pkceChallenge(
  verifier: string
) {
  return crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
}

function supabaseUrl() {
  return (
    process.env.SUPABASE_URL?.trim() ||
    process.env.VITE_SUPABASE_URL?.trim() ||
    requiredEnv("SUPABASE_URL")
  );
}

function supabasePublishableKey() {
  return (
    process.env
      .SUPABASE_PUBLISHABLE_KEY
      ?.trim() ||
    process.env
      .VITE_SUPABASE_PUBLISHABLE_KEY
      ?.trim() ||
    requiredEnv(
      "SUPABASE_PUBLISHABLE_KEY"
    )
  );
}

function supabaseServiceKey() {
  return (
    process.env
      .SUPABASE_SERVICE_ROLE_KEY
      ?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    requiredEnv(
      "SUPABASE_SERVICE_ROLE_KEY"
    )
  );
}

export function supabaseAdmin() {
  return createClient(
    supabaseUrl(),
    supabaseServiceKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function requireSimpleDinnersUser(
  req: VercelRequest
) {
  const authorization =
    String(
      req.headers.authorization || ""
    ).trim();

  const match =
    authorization.match(
      /^Bearer\s+(.+)$/i
    );

  if (!match) {
    throw new Error(
      "SIMPLE_DINNERS_AUTH_REQUIRED"
    );
  }

  const accessToken =
    match[1].trim();

  const client = createClient(
    supabaseUrl(),
    supabasePublishableKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const {
    data,
    error,
  } = await client.auth.getUser(
    accessToken
  );

  if (
    error ||
    !data.user?.id
  ) {
    throw new Error(
      "SIMPLE_DINNERS_AUTH_INVALID"
    );
  }

  return {
    user: data.user,
    accessToken,
  };
}

export async function loadKrogerConnection(
  userId: string
) {
  const admin =
    supabaseAdmin();

  const {
    data,
    error,
  } = await admin
    .from("kroger_connections")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (
    data as
      | StoredKrogerConnection
      | null
  );
}

export async function saveKrogerConnection(
  userId: string,
  tokenData: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  }
) {
  const admin =
    supabaseAdmin();

  const expiresIn =
    Number(
      tokenData.expires_in || 1800
    );

  const expiresAt =
    new Date(
      Date.now() +
        Math.max(
          60,
          expiresIn
        ) *
          1000
    ).toISOString();

  const existing =
    await loadKrogerConnection(
      userId
    );

  const refreshEncrypted =
    tokenData.refresh_token
      ? encryptSecret(
          tokenData.refresh_token
        )
      : existing
        ?.refresh_token_encrypted ??
        null;

  const payload = {
    user_id: userId,
    access_token_encrypted:
      encryptSecret(
        tokenData.access_token
      ),
    refresh_token_encrypted:
      refreshEncrypted,
    expires_at: expiresAt,
    scope:
      tokenData.scope ??
      existing?.scope ??
      null,
    environment:
      krogerEnvironment(),
    updated_at:
      new Date().toISOString(),
  };

  const {
    error,
  } = await admin
    .from("kroger_connections")
    .upsert(payload, {
      onConflict: "user_id",
    });

  if (error) {
    throw error;
  }

  return payload;
}

export async function deleteKrogerConnection(
  userId: string
) {
  const {
    error,
  } = await supabaseAdmin()
    .from("kroger_connections")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function getKrogerUserAccessToken(
  userId: string
) {
  const connection =
    await loadKrogerConnection(
      userId
    );

  if (!connection) {
    throw new Error(
      "KROGER_NOT_CONNECTED"
    );
  }

  if (
    connection.environment !==
    krogerEnvironment()
  ) {
    throw new Error(
      "KROGER_ENVIRONMENT_MISMATCH"
    );
  }

  const expiry =
    new Date(
      connection.expires_at
    ).getTime();

  if (
    Number.isFinite(expiry) &&
    expiry > Date.now() + 30_000
  ) {
    return decryptSecret(
      connection.access_token_encrypted
    );
  }

  if (
    !connection.refresh_token_encrypted
  ) {
    throw new Error(
      "KROGER_REFRESH_TOKEN_MISSING"
    );
  }

  const {
    basic,
  } = krogerClientCredentials();

  const response = await fetch(
    `${krogerBaseUrl()}/connect/oauth2/token`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization:
          `Basic ${basic}`,
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type:
          "refresh_token",
        refresh_token:
          decryptSecret(
            connection
              .refresh_token_encrypted
          ),
      }),
    }
  );

  const data =
    await response
      .json()
      .catch(() => null);

  if (
    !response.ok ||
    typeof data
      ?.access_token !==
      "string"
  ) {
    await deleteKrogerConnection(
      userId
    );

    throw new Error(
      "KROGER_REFRESH_FAILED"
    );
  }

  await saveKrogerConnection(
    userId,
    data
  );

  return data.access_token;
}

export function authErrorStatus(
  error: unknown
) {
  const message =
    error instanceof Error
      ? error.message
      : "";

  if (
    message ===
      "SIMPLE_DINNERS_AUTH_REQUIRED" ||
    message ===
      "SIMPLE_DINNERS_AUTH_INVALID"
  ) {
    return 401;
  }

  if (
    message ===
      "KROGER_NOT_CONNECTED"
  ) {
    return 409;
  }

  if (
    message ===
      "KROGER_TOKEN_DECRYPT_FAILED" ||
    message ===
      "INVALID_KROGER_TOKEN_ENCRYPTION_KEY"
  ) {
    return 500;
  }

  return 500;
}


const KROGER_ALLOWED_ORIGINS =
  new Set([
    "https://dinners.ncocaptain.com",
    "capacitor://localhost",
    "http://localhost",
    "https://localhost",
    "http://localhost:5173",
  ]);

export function applyKrogerCors(
  req: VercelRequest,
  res: VercelResponse,
  methods: string
) {
  const origin =
    String(
      req.headers.origin || ""
    );

  if (
    KROGER_ALLOWED_ORIGINS.has(
      origin
    )
  ) {
    res.setHeader(
      "Access-Control-Allow-Origin",
      origin
    );
  }

  res.setHeader(
    "Vary",
    "Origin"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    methods
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type"
  );
}

export function simpleDinnersAppOrigin() {
  return (
    process.env
      .SIMPLE_DINNERS_APP_ORIGIN
      ?.trim() ||
    "https://dinners.ncocaptain.com"
  );
}
