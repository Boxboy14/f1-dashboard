# F1 Dashboard Constitution

## Core Principles

### I. Spec-First Development
Every new feature — no matter how small — begins with a spec. No implementation code is written before a `spec.md` exists and is reviewed. The spec defines user stories and acceptance criteria; the plan defines the technical approach. Code is the last artifact, not the first.

### II. API-First Design
Before building any UI component, understand the OpenF1 API endpoint it depends on. Verify the actual response shape with a real API call. Do not assume field names or types. Known gaps (e.g., `country_code: null` in 2025 data) must be documented and handled gracefully in the UI.

### III. Component Isolation
Each page or feature is a self-contained unit: its own folder, its own data fetching hook, its own styles. Components do not share mutable state across page boundaries. The only shared state is URL state (React Router) and cached API state (TanStack Query). Redux is for client-only UI state that genuinely needs to persist across navigation.

### IV. Data Layer Discipline
All API access flows through `src/services/api/openf1.js` and `src/hooks/useOpenF1.js`. No raw `fetch()` calls in components. Every `useQuery` hook must declare `staleTime` to respect the OpenF1 rate limit (3 req/sec, 30 req/min). Never make the same API call from two places that could be deduplicated.

### V. Clean Code — No Exceptions
No premature abstractions. No dead code. No backwards-compat shims. No defensive error handling for scenarios that cannot happen. Comments explain WHY (a constraint, a workaround, a non-obvious invariant) — never WHAT. Names must be self-explanatory. Functions must do one thing.

### VI. UI Consistency
Salt Design System is the first choice for every UI element — buttons, inputs, dialogs, layouts. Build custom only when Salt explicitly does not support the use case. The dark theme (`--color-bg-primary: #1a1a1a`) is fixed — no light mode support in v1.

### VII. Learning Is a First-Class Goal
This project exists to sharpen frontend skills and learn AI integration. Every architectural decision must be explainable. Clever code is wrong code here. When a new library is introduced, its mental model must be documented. Complexity that cannot be explained to a learning developer is complexity that should not exist.

## Development Workflow

- Feature → `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`
- One feature branch per spec. Branch name derived from spec (e.g., `001-teams-page`).
- Specs live in `specs/<branch-name>/` and are committed alongside implementation code.

## Governance

This constitution supersedes informal decisions. Amendments require updating this file with a rationale comment. All PRs must comply with Articles I–VII — violations must be explicitly justified in the PR description.

**Version**: 1.0.0 | **Ratified**: 2026-05-28 | **Last Amended**: 2026-05-28
