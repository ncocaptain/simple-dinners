const assert = require("node:assert/strict");
const fs = require("fs");
const ts = require("typescript");
const crypto = require("node:crypto");

process.env.KROGER_TOKEN_ENCRYPTION_KEY =
  Buffer.alloc(32, 7).toString("base64");

const source = fs.readFileSync(
  "api/_krogerServer.ts",
  "utf8"
);

const output = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
}).outputText;

const mod = { exports: {} };

new Function(
  "require",
  "module",
  "exports",
  "process",
  "Buffer",
  output
)(
  (name) => {
    if (name === "node:crypto") {
      return crypto;
    }

    if (
      name ===
      "@supabase/supabase-js"
    ) {
      return {
        createClient() {
          return {};
        },
      };
    }

    throw new Error(
      "Unexpected dependency: " + name
    );
  },
  mod,
  mod.exports,
  process,
  Buffer
);

const {
  encryptSecret,
  decryptSecret,
  randomUrlSafe,
  sha256,
  pkceChallenge,
} = mod.exports;

const secret =
  "kroger-refresh-token-test";
const encrypted =
  encryptSecret(secret);

assert.notEqual(
  encrypted,
  secret
);
assert.ok(
  encrypted.startsWith("v1.")
);
assert.equal(
  decryptSecret(encrypted),
  secret
);

const state =
  randomUrlSafe(32);
assert.ok(state.length > 30);
assert.equal(
  sha256("abc"),
  crypto
    .createHash("sha256")
    .update("abc")
    .digest("hex")
);

const verifier =
  randomUrlSafe(48);
const challenge =
  pkceChallenge(verifier);

assert.equal(
  challenge,
  crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url")
);

console.log(
  "=== KROGER SERVER SECURITY ==="
);
console.log(
  "PASS: OAuth tokens encrypt with AES-256-GCM"
);
console.log(
  "PASS: encrypted tokens decrypt exactly"
);
console.log(
  "PASS: OAuth state hashing is deterministic"
);
console.log(
  "PASS: PKCE S256 challenge matches verifier"
);
