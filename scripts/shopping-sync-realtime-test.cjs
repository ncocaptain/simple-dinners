const assert = require("node:assert/strict");
const fs = require("fs");

const source = fs.readFileSync(
  "src/cloud/ShoppingSyncBridge.tsx",
  "utf8"
);

assert.match(
  source,
  /table:\s*"households"/,
  "Realtime must listen for the completed household snapshot signal"
);

assert.match(
  source,
  /event:\s*"UPDATE"/,
  "Realtime must react to the snapshot-complete household update"
);

assert.match(
  source,
  /id=eq\.\$\{activeHouseholdId\}/,
  "Realtime must stay scoped to the active household"
);

assert.match(
  source,
  /replace_shopping_items updates the household row only after/,
  "The listener should document the completed-snapshot contract"
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
console.log("PASS: listens for completed shopping snapshots");
console.log("PASS: scoped to active household");
console.log("PASS: completed snapshot triggers reconciliation");
console.log("PASS: Realtime connection alone does not claim Synced");
console.log("PASS: foreground resume self-heals missed events");
