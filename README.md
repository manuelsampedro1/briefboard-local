# briefboard-local

Local-first client brief builder for Codex projects.

The problem: good Codex runs start with a tight brief, but most project kickoffs begin as scattered messages, half-decisions, and missing acceptance criteria. This small web app turns that mess into a structured build brief and a copyable Codex prompt.

## What It Does

- Runs fully in the browser with no backend.
- Stores the current brief in `localStorage`.
- Captures problem, audience, constraints, deliverable, stack, acceptance criteria, and rollout notes.
- Generates:
  - a project brief,
  - an implementation handoff,
  - a Codex-ready prompt.

## Why This Exists

This is the local-first product example in the profile set: small, practical, and immediately usable in real Codex work.

## Stack

- HTML
- CSS
- Vanilla JavaScript

## Quick Start

Open locally:

```sh
open index.html
```

Or serve it:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Status

Working v1. The app is intentionally simple and offline-first.

## Verification

Manual checks:

- Fill every field and confirm the generated brief updates live.
- Reload the page and confirm content is restored from `localStorage`.
- Use the copy buttons for both outputs.
- Confirm the "clear" action resets both the form and stored draft.

## Files

- `index.html`: app shell.
- `styles.css`: lightweight presentation.
- `app.js`: local state, rendering, and copy actions.
- `DECISIONS.md`: small design notes.

