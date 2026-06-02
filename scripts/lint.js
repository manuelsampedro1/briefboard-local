#!/usr/bin/env node

const { spawnSync } = require("node:child_process");

const files = [
  "brief-format.js",
  "app.js",
  "scripts/build.js",
  "scripts/lint.js",
  "tests/brief-format.test.cjs",
];

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status || 1);
  }
}

console.log("Syntax lint checks passed.");
