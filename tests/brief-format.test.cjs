const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildFileName,
  evaluateReadiness,
  fields,
  normalizeDraft,
  parseJsonImport,
  renderBrief,
  renderJsonExport,
  renderPrompt,
} = require("../brief-format.js");

test("normalizes known draft fields", () => {
  const draft = normalizeDraft({
    projectName: "  Support Triage  ",
    audience: "Ops",
    unknown: "ignored",
  });

  assert.equal(draft.projectName, "Support Triage");
  assert.equal(draft.audience, "Ops");
  assert.equal(draft.problem, "");
  assert.deepEqual(Object.keys(draft), fields);
});

test("renders a markdown brief with explicit TBD fallbacks", () => {
  const brief = renderBrief({
    projectName: "Support Triage",
    problem: "Incoming tickets lack priority.",
  });

  assert.match(brief, /^# Support Triage/);
  assert.match(brief, /## Brief Readiness\n- Missing before handoff: Audience, Desired deliverable, Acceptance criteria\./);
  assert.match(brief, /## Problem\nIncoming tickets lack priority\./);
  assert.match(brief, /## Acceptance Criteria\n_TBD_/);
});

test("evaluates whether a draft is ready for Codex handoff", () => {
  const incomplete = evaluateReadiness({
    projectName: "Runbook checker",
    audience: "solo builders",
  });
  const ready = evaluateReadiness({
    projectName: "Runbook checker",
    audience: "solo builders",
    problem: "Docs drift from scripts.",
    deliverable: "Local CLI.",
    acceptance: "Flags broken script references.",
  });

  assert.equal(incomplete.ready, false);
  assert.deepEqual(incomplete.missing, ["Problem", "Desired deliverable", "Acceptance criteria"]);
  assert.equal(ready.ready, true);
  assert.equal(ready.message, "Ready for Codex handoff.");
});

test("renders a Codex prompt that asks for verification and exposes readiness", () => {
  const prompt = renderPrompt({
    projectName: "Runbook checker",
    audience: "solo builders",
    problem: "Docs drift from scripts.",
    constraints: "No backend.",
    deliverable: "Local checker.",
    acceptance: "Detect broken commands.",
  });

  assert.match(prompt, /You are helping me build Runbook checker\./);
  assert.match(prompt, /Brief readiness:\n- Ready for Codex handoff\./);
  assert.match(prompt, /Constraints:\nNo backend\./);
  assert.match(prompt, /make verification explicit/);
});

test("exports stable JSON for handoff and restore", () => {
  const json = JSON.parse(
    renderJsonExport({
      projectName: "Agent Review",
      rollout: "Use on small diffs first.",
    }),
  );

  assert.equal(json.schema_version, "briefboard-local.v1");
  assert.equal(json.draft.projectName, "Agent Review");
  assert.equal(json.draft.rollout, "Use on small diffs first.");
  assert.equal(json.draft.stack, "");
});

test("imports exported JSON drafts", () => {
  const imported = parseJsonImport(
    renderJsonExport({
      projectName: "Agent Review",
      audience: "Founders",
      unknown: "ignored",
    }),
  );

  assert.equal(imported.projectName, "Agent Review");
  assert.equal(imported.audience, "Founders");
  assert.equal(imported.rollout, "");
  assert.deepEqual(Object.keys(imported), fields);
});

test("imports raw draft objects for manual handoff files", () => {
  const imported = parseJsonImport(
    JSON.stringify({
      projectName: "Local Audit",
      problem: "Kickoff notes are scattered.",
    }),
  );

  assert.equal(imported.projectName, "Local Audit");
  assert.equal(imported.problem, "Kickoff notes are scattered.");
  assert.equal(imported.stack, "");
});

test("rejects invalid imported JSON", () => {
  assert.throws(() => parseJsonImport("{"), /valid JSON/);
  assert.throws(
    () => parseJsonImport(JSON.stringify({ schema_version: "briefboard-local.v0", draft: {} })),
    /briefboard-local\.v1/,
  );
  assert.throws(
    () => parseJsonImport(JSON.stringify({ schema_version: "briefboard-local.v1" })),
    /draft object/,
  );
});

test("builds safe filenames from project names", () => {
  assert.equal(buildFileName("AI Support Inbox!", "brief.md"), "ai-support-inbox-brief.md");
  assert.equal(buildFileName("", "codex-prompt.txt"), "untitled-project-codex-prompt.txt");
});
