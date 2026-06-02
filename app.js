const STORAGE_KEY = "briefboard-local-draft";
const {
  fields,
  normalizeDraft,
  parseJsonImport,
  renderBrief,
  renderPrompt,
  renderJsonExport,
  buildFileName,
} = window.BriefboardFormat;

const form = document.getElementById("brief-form");
const briefOutput = document.getElementById("brief-output");
const promptOutput = document.getElementById("prompt-output");
const clearButton = document.getElementById("clear-btn");
const exportJsonButton = document.getElementById("export-json-btn");
const importJsonButton = document.getElementById("import-json-btn");
const importJsonInput = document.getElementById("import-json-input");
const importStatus = document.getElementById("import-status");

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

function writeDraft(draft) {
  const normalized = normalizeDraft(draft || {});
  for (const field of fields) {
    form.elements[field].value = normalized[field];
  }
}

function loadDraft() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const draft = JSON.parse(raw);
    writeDraft(draft);
  } catch (error) {
    console.warn("Could not parse saved draft", error);
  }
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

function flashButton(button, label) {
  const original = button.dataset.idleLabel || button.textContent;
  button.dataset.idleLabel = original;
  button.textContent = label;
  setTimeout(() => {
    button.textContent = original;
  }, 1200);
}

function setImportStatus(message, status = "info") {
  importStatus.textContent = message;
  importStatus.dataset.status = status;
}

function downloadText(fileName, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
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
      flashButton(button, "Copied");
    } catch (error) {
      console.warn("Copy failed", error);
    }
  });
});

document.querySelectorAll("[data-download-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-download-target");
    const draft = readDraft();
    const isPrompt = targetId === "prompt-output";
    const fileName = buildFileName(draft.projectName, isPrompt ? "codex-prompt.txt" : "brief.md");
    const type = isPrompt ? "text/plain" : "text/markdown";
    downloadText(fileName, document.getElementById(targetId).textContent, type);
    flashButton(button, "Downloaded");
  });
});

exportJsonButton.addEventListener("click", () => {
  const draft = readDraft();
  downloadText(
    buildFileName(draft.projectName, "briefboard-draft.json"),
    renderJsonExport(draft),
    "application/json",
  );
  flashButton(exportJsonButton, "Exported");
});

importJsonButton.addEventListener("click", () => {
  importJsonInput.click();
});

importJsonInput.addEventListener("change", async () => {
  const [file] = importJsonInput.files;
  if (!file) return;

  try {
    const draft = parseJsonImport(await file.text());
    writeDraft(draft);
    update();
    setImportStatus(`Imported ${file.name}`, "success");
    flashButton(importJsonButton, "Imported");
  } catch (error) {
    console.warn("Import failed", error);
    setImportStatus(error.message || "Could not import JSON.", "error");
    flashButton(importJsonButton, "Import failed");
  } finally {
    importJsonInput.value = "";
  }
});

loadDraft();
update();
