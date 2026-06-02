# AGENTS.md

## Purpose

`briefboard-local` is a static, local-first web app that turns messy kickoff notes into a structured project brief and Codex-ready prompt.

## Constraints

- Keep the app browser-only and dependency-free unless a dependency removes a specific product risk.
- Preserve JSON export/import compatibility for `briefboard-local.v1`.
- Keep user data local; do not add telemetry, backend sync, analytics, or network calls by default.
- Prefer small product improvements that clarify kickoff quality before adding new fields or surfaces.

## Verification

Run these before closing a change:

```sh
npm test
npm run build
npm run lint
```

For UI or export/import changes, also open `index.html` or serve the folder with `python3 -m http.server 4173` and manually verify localStorage restore, JSON import/export, generated brief, and generated prompt.
