import fs from "node:fs";

const path = "src/core/data.ts";
const source = fs.readFileSync(path, "utf8");

const blocks = [...source.matchAll(/ingredients:\s*`([\s\S]*?)`/g)].map(
  (match) => match[1]
);

if (blocks.length < 500) {
  console.error(
    `Expected at least 500 ingredient blocks, found ${blocks.length}.`
  );
  process.exit(1);
}

const issues = [];

function addIssue(type, line, detail) {
  issues.push({
    type,
    line,
    detail,
  });
}

for (const block of blocks) {
  for (const rawLine of block.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const hasNoncanonicalUnit =
      /\b(?:tablespoons?|teaspoons?|ounces?|pounds?|lbs|pkgs?)\b/i.test(line) ||
      /\btbsps?\b/.test(line);

    if (hasNoncanonicalUnit) {
      addIssue(
        "noncanonical-unit",
        line,
        "Use Tbsp, tsp, oz, lb, or package."
      );
    }

    if (
      /^((?:\d+\s+\d+\/\d+)|(?:\d+\/\d+)|(?:\d+(?:\.\d+)?))\s+\([^)]+\)\s+(?:cans?|packages?|boxes?|jars?|bags?|cartons?|bottles?|tubes?|packets?)\b/i.test(
        line
      )
    ) {
      addIssue(
        "container-order",
        line,
        "Use quantity + container + package size + ingredient."
      );
    }

    if (/\s+\(optional\)\s*$/i.test(line)) {
      addIssue(
        "optional-format",
        line,
        "Use a trailing ', optional' marker."
      );
    }

    if (/\s+\(opcional\)\s*$/i.test(line)) {
      addIssue(
        "optional-format-es",
        line,
        "Use a trailing ', opcional' marker."
      );
    }

    if (/\s{2,}/.test(line)) {
      addIssue(
        "repeated-whitespace",
        line,
        "Collapse repeated spaces."
      );
    }
  }
}

const counts = new Map();
for (const issue of issues) {
  counts.set(
    issue.type,
    (counts.get(issue.type) || 0) + 1
  );
}

console.log(`Recipe ingredient blocks: ${blocks.length}`);

if (issues.length === 0) {
  console.log("Recipe data validation passed.");
  process.exit(0);
}

console.error(
  `Recipe data validation found ${issues.length} issue(s):`
);

for (const [type, count] of [...counts.entries()].sort()) {
  console.error(`  ${type}: ${count}`);
}

for (const issue of issues.slice(0, 40)) {
  console.error(
    `\n[${issue.type}] ${issue.detail}\n  ${issue.line}`
  );
}

if (issues.length > 40) {
  console.error(
    `\n...and ${issues.length - 40} more issue(s).`
  );
}

process.exit(1);
