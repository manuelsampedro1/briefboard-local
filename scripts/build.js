#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { parseJsonImport, renderBrief, renderPrompt } = require("../brief-format.js");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFile(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing required file: ${relativePath}`);
  }
}

for (const file of ["index.html", "styles.css", "brief-format.js", "app.js", "docs/preview.svg"]) {
  assertFile(file);
}

const html = read("index.html");
for (const asset of ["styles.css", "brief-format.js", "app.js"]) {
  if (!html.includes(asset)) {
    throw new Error(`index.html does not reference ${asset}`);
  }
}

const draft = parseJsonImport(read("examples/briefboard-draft.json"));
const brief = renderBrief(draft);
const prompt = renderPrompt(draft);

if (!brief.includes("- Ready for Codex handoff.")) {
  throw new Error("Example draft should render as ready for handoff.");
}

if (!prompt.includes("Please propose the smallest credible implementation")) {
  throw new Error("Example prompt is missing the implementation request.");
}

console.log("Static build checks passed.");
