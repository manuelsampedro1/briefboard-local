const STORAGE_KEY = "briefboard-local-draft";

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

const form = document.getElementById("brief-form");
const briefOutput = document.getElementById("brief-output");
const promptOutput = document.getElementById("prompt-output");
const clearButton = document.getElementById("clear-btn");

function readDraft() {
  const draft = {};
  for (const field of fields) {
    draft[field] = form.elements[field].value.trim();
  }
  return draft;
}

function saveDraft(draft) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

function loadDraft() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const draft = JSON.parse(raw);
    for (const field of fields) {
      if (typeof draft[field] === "string") {
        form.elements[field].value = draft[field];
      }
    }
  } catch (error) {
    console.warn("Could not parse saved draft", error);
  }
}

function renderBrief(draft) {
  return `# ${draft.projectName || "Untitled project"}

## Audience
${draft.audience || "_TBD_"}

## Problem
${draft.problem || "_TBD_"}

## Constraints
${draft.constraints || "_TBD_"}

## Desired Deliverable
${draft.deliverable || "_TBD_"}

## Preferred Stack
${draft.stack || "_TBD_"}

## Acceptance Criteria
${draft.acceptance || "_TBD_"}

## Rollout / Risk Notes
${draft.rollout || "_TBD_"}
`;
}

function renderPrompt(draft) {
  return `You are helping me build ${draft.projectName || "a project"}.

Audience:
${draft.audience || "_TBD_"}

Problem to solve:
${draft.problem || "_TBD_"}

Constraints:
${draft.constraints || "_TBD_"}

Desired deliverable:
${draft.deliverable || "_TBD_"}

Preferred stack:
${draft.stack || "_TBD_"}

Acceptance criteria:
${draft.acceptance || "_TBD_"}

Rollout / risk notes:
${draft.rollout || "_TBD_"}

Please propose the smallest credible implementation, list assumptions, and make verification explicit.`;
}

function update() {
  const draft = readDraft();
  saveDraft(draft);
  briefOutput.textContent = renderBrief(draft);
  promptOutput.textContent = renderPrompt(draft);
}

async function copyText(targetId) {
  const text = document.getElementById(targetId).textContent;
  await navigator.clipboard.writeText(text);
}

form.addEventListener("input", update);
clearButton.addEventListener("click", () => {
  form.reset();
  localStorage.removeItem(STORAGE_KEY);
  update();
});

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", async () => {
    const targetId = button.getAttribute("data-copy-target");
    try {
      await copyText(targetId);
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 1200);
    } catch (error) {
      console.warn("Copy failed", error);
    }
  });
});

loadDraft();
update();
