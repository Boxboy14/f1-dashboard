# F1 Dashboard — Copilot Instructions

F1 stats dashboard: React 19, React Router 7, Redux Toolkit, TanStack Query, ag-grid 35, Salt Design System, SCSS Modules, Vite, OpenF1 API (free tier, 3 req/sec / 30 req/min).

This repo follows GitHub Spec Kit — every feature has a `specs/NNN-feature-name/` folder (spec.md, plan.md, tasks.md). See `plan.md` at the repo root for scope/phases and `.specify/memory/constitution.md` for the non-negotiable rules.

## Architecture rules

- Data fetching: use TanStack Query hooks from `src/hooks/useOpenF1.js`. Never raw `fetch` in components.
- API calls: only through `src/services/api/openf1.js`. No inline URLs in components.
- State: TanStack Query owns server state; Redux is for client-only UI state.
- Styling: SCSS Modules only, no inline styles for static values.
- UI components: prefer Salt Design System (`@salt-ds/core`, `@salt-ds/lab`) over raw HTML elements (`<div>`, `<button>`, `<nav>`, etc.) whenever an equivalent exists.
- Routing: React Router 7; the URL is the source of truth for navigation state.
- Clean code: no dead code, no premature abstraction, comments only for non-obvious "why".

## Spec Sync Policy — required before touching `src/`

Before editing or creating **any file under `src/`**, stop and ask the developer to choose one:

1. Update spec along with code changes (Recommended)
2. Do not update spec, just make code changes.
3. Create new spec

Look up the file's matching spec folder(s) in `specs/spec-index.json` first, so you can tell the developer what you found (or that nothing matched, in which case lean toward option 3). Full procedure for each option: `specs/SPEC_SYNC_POLICY.md`.

This rule is restated with tighter scoping in `.github/instructions/spec-sync.instructions.md` — follow that version when it's shown to you, since it's the more specific one.
