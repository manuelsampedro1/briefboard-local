# Decisions

## Browser-Only v1

Keep the first version static and local-first.

Rationale:

- No credentials or service setup required.
- Easier to show as a small, honest product example.
- Matches the way I prefer to start product tools in Codex.

## Dual Output

Generate both a structured brief and a Codex prompt.

Rationale:

- The brief is useful for human alignment.
- The prompt is useful for immediate execution.
- Keeping both in one tool makes the handoff tighter.

## Exportable Artifacts

Let users download the brief, prompt, and JSON draft without adding a backend.

Rationale:

- A real client kickoff needs portable handoff files, not only copied text.
- JSON export makes a saved draft inspectable and reusable outside the browser.
- Keeping formatters dependency-free makes the core output testable in Node and usable in the browser.

## Importable Drafts

Support restoring exported JSON drafts directly in the browser.

Rationale:

- Export without import only creates a file; import closes the loop for real kickoff work.
- The app stays local-first and shareable without accounts, sync, or a database.
- Validating the JSON schema keeps restore behavior predictable while still allowing raw draft objects for manual handoffs.

## Brief Readiness Before Prompting

Show missing essential fields in the generated brief and prompt before a user copies the Codex handoff.

Rationale:

- A prompt can look complete while still missing audience, problem, deliverable, or acceptance criteria.
- The readiness check stays descriptive rather than scoring quality with a fake number.
- Keeping it in the shared formatter makes the behavior testable in Node and visible in the browser.
