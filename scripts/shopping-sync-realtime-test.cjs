const assert = require("node:assert/strict");
const fs = require("fs");

const source = fs.readFileSync(
  "src/cloud/ShoppingSyncBridge.tsx",
  "utf8"
);

assert.match(
  source,
  /table:\s*"shopping_items"/,
  "Realtime must listen to shopping_items"
);

assert.match(
  source,
  /event:\s*"\*"/,
  "Realtime must react to insert, update, and delete changes"
);

assert.match(
  source,
  /household_id=eq\.\$\{activeHouseholdId\}/,
  "Realtime must stay scoped to the active household"
);

assert.doesNotMatch(
  source,
  /table:\s*"households"/,
  "Shopping sync must not depend on household row updates"
);

const subscribedBlock = source.match(
  /if \(status === "SUBSCRIBED"\) \{([\s\S]*?)return;/
);

assert.ok(
  subscribedBlock,
  "Expected SUBSCRIBED handler"
);

assert.match(
  subscribedBlock[1],
  /scheduleCloudPull\(0\)/,
  "Subscription should confirm cloud state before Synced"
);

assert.doesNotMatch(
  subscribedBlock[1],
  /status:\s*"synced"/,
  "Socket connection alone must not claim Synced"
);

assert.match(
  source,
  /window\.addEventListener\(\s*"focus",\s*handleForeground/,
  "Foreground should reconcile cloud state"
);

assert.match(
  source,
  /visibilitychange/,
  "Visible app resume should reconcile cloud state"
);

console.log("=== SHOPPING SYNC REALTIME TEST ===");
console.log("PASS: listens to shopping_items");
console.log("PASS: scoped to active household");
console.log("PASS: all row changes trigger reconciliation");
console.log("PASS: Realtime connection alone does not claim Synced");
console.log("PASS: foreground resume self-heals missed events");
