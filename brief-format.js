(function attachBriefboardFormat(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.BriefboardFormat = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createBriefboardFormat() {
  const schemaVersion = "briefboard-local.v1";
  const fields = [
    "projectName",
    "audience",
    "problem",
    "constraints",
    "deliverable",
    "stack",
    "acceptance",
    "rollout",
  ];

  function normalizeDraft(draft) {
    const normalized = {};
    for (const field of fields) {
      normalized[field] = typeof draft[field] === "string" ? draft[field].trim() : "";
    }
    return normalized;
  }

  function fallback(value) {
    return value || "_TBD_";
  }

  function renderBrief(draftInput) {
    const draft = normalizeDraft(draftInput);
    return `# ${draft.projectName || "Untitled project"}

## Audience
${fallback(draft.audience)}

## Problem
${fallback(draft.problem)}

## Constraints
${fallback(draft.constraints)}

## Desired Deliverable
${fallback(draft.deliverable)}

## Preferred Stack
${fallback(draft.stack)}

## Acceptance Criteria
${fallback(draft.acceptance)}

## Rollout / Risk Notes
${fallback(draft.rollout)}
`;
  }

  function renderPrompt(draftInput) {
    const draft = normalizeDraft(draftInput);
    return `You are helping me build ${draft.projectName || "a project"}.

Audience:
${fallback(draft.audience)}

Problem to solve:
${fallback(draft.problem)}

Constraints:
${fallback(draft.constraints)}

Desired deliverable:
${fallback(draft.deliverable)}

Preferred stack:
${fallback(draft.stack)}

Acceptance criteria:
${fallback(draft.acceptance)}

Rollout / risk notes:
${fallback(draft.rollout)}

Please propose the smallest credible implementation, list assumptions, and make verification explicit.`;
  }

  function renderJsonExport(draftInput) {
    return JSON.stringify(
      {
        schema_version: schemaVersion,
        draft: normalizeDraft(draftInput),
      },
      null,
      2,
    );
  }

  function parseJsonImport(jsonText) {
    let payload;
    try {
      payload = JSON.parse(jsonText);
    } catch {
      throw new Error("Import file must be valid JSON.");
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("Import file must contain a draft object.");
    }

    if ("schema_version" in payload || "draft" in payload) {
      if (payload.schema_version !== schemaVersion) {
        throw new Error(`Import file must use ${schemaVersion}.`);
      }
      if (!payload.draft || typeof payload.draft !== "object" || Array.isArray(payload.draft)) {
        throw new Error("Import file must include a draft object.");
      }
      return normalizeDraft(payload.draft);
    }

    return normalizeDraft(payload);
  }

  function slugProjectName(projectName) {
    const slug = String(projectName || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug || "untitled-project";
  }

  function buildFileName(projectName, suffix) {
    return `${slugProjectName(projectName)}-${suffix}`;
  }

  return {
    fields,
    normalizeDraft,
    parseJsonImport,
    renderBrief,
    renderPrompt,
    renderJsonExport,
    buildFileName,
  };
});
