# Implementation Plan: Telemetry & UI Enhancements

**Branch**: `010-telemetry-ui-enhancements` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/010-telemetry-ui-enhancements/spec.md`

## Summary

Seven self-contained enhancements layered onto existing pages, with no change to the data-fetching architecture. The only net-new capability is a **client-side PDF export** of the telemetry comparison (one button at the right of the chart-stack header, producing one report for all channels + selected drivers) — which introduces one new dependency (`jspdf`). Everything else reuses tokens, hooks, and patterns already in the codebase: tyre compound comes from the existing `useStints` hook; the track-map circuit caption and start/finish marker are additive SVG/markup on the existing `TrackMap`; the sidebar collapse reuses the theme-toggle persistence pattern; and the chart/track sizing changes are token/prop edits.

## Technical Context

**Language/Version**: JavaScript (ES2020+), React 19

**Primary Dependencies**: React 19, React Router 7, TanStack Query v5, Recharts 3, Salt DS (`@salt-ds/core`, `@salt-ds/icons`, `@salt-ds/theme`), SCSS Modules, Vite 7. **New**: `jspdf` (client-side PDF generation).

**Storage**: `localStorage` for the persisted sidebar collapse state (matching the existing `f1-theme` pattern). No server-side storage.

**Testing**: Manual browser verification per project convention (quickstart.md). No automated test suite.

**Target Platform**: Desktop + mobile-responsive web (modern evergreen browsers).

**Project Type**: Single-page web application (single project, `src/`).

**Performance Goals**: PDF generation completes near-instantly for a single lap (text-only document, ≤ a few hundred data-derived numbers); no perceptible UI block. No new network calls beyond the already-fetched stint data.

**Constraints**: No raw hex — Salt tokens only (Constitution Article VI). OpenF1 free tier 3 req/s, 30 req/min — every new query declares `staleTime` (the stints query already does). Charts ≥350px tall, ≥15px inter-chart gap, larger Y-axis labels.

**Scale/Scope**: ~1 new dependency, ~1 new util module (PDF builder), ~1 new hook usage (stints on the telemetry page), edits to ~8 existing files (TelemetryPage, TelemetryCharts, TelemetryChart, DriverSummary, TrackMap + 2 SCSS, Sidebar + SCSS), plus 1 new Theme/sidebar-state helper.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Article | Gate | Status |
|---|---|---|
| I. Spec-First | spec.md exists, reviewed, checklist 18/18 PASS | ✅ |
| II. API-First | Tyre compound uses existing `/stints` shape (`compound`, `lap_start`, `lap_end`, `driver_number`); no assumed fields — verified in research.md | ✅ |
| III. Component Isolation | Each change stays within its component folder; PDF logic in a dedicated util; sidebar state lifted to the layout that already owns sidebar state | ✅ |
| IV. Data Layer Discipline | Tyre data via `useStints` hook from `useOpenF1.js` (already declares `staleTime`); no raw `fetch`; no new endpoint | ✅ |
| V. Clean Code | No new abstraction beyond the PDF builder (a genuine boundary); chart config stays data-driven via `CHANNELS` | ✅ |
| VI. UI Consistency | Salt components first (`Button` + Salt icons for download/chevron; `Text styleAs` for captions); colors from Salt tokens, zero hex; type scale tokens for caption/label sizing | ✅ |
| VII. Learning Goal | `jspdf` gets a Rule-3 walkthrough in research.md (what/why/how/mental-model/gotchas) | ✅ |

**Result**: PASS. One new dependency (`jspdf`) is justified — client-side PDF generation has no Salt or existing-stack equivalent, and the alternative (server-side rendering) violates the "no server-side persistence/processing" scope. Documented in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/010-telemetry-ui-enhancements/
├── plan.md              # This file
├── research.md          # Phase 0 — decisions (jspdf, stint→lap mapping, start/finish geometry, sidebar state, sizing tokens)
├── data-model.md        # Phase 1 — Lap Summary Report, Tyre Stint Detail, Sidebar Display State
├── quickstart.md        # Phase 1 — manual verification scenarios (maps to the 7 user stories)
├── contracts/
│   └── components.md     # Phase 1 — component prop/behavior contracts for the changed/added UI
└── tasks.md             # Phase 2 (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── dashboard/
│   │   ├── TelemetryPage.jsx                  # EDIT: fetch stints; pass circuit name + tyre into children; own report-data assembly
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.jsx                     # EDIT: collapsed state + double-chevron toggle; remove Sessions entry
│   │   │   └── Sidebar.module.scss            # EDIT: collapsed (icon-only) width + chevron footer styles
│   │   └── layouts/
│   │       └── DashboardLayout.jsx            # EDIT: own + persist sidebar collapsed state (passes to Sidebar)
│   └── tabs/telemetry/
│       ├── DriverSummary.jsx                  # EDIT: render tyre compound row (US2)
│       ├── DriverSummary.module.scss          # EDIT: tyre row styling
│       ├── TelemetryCharts.jsx                # EDIT: download Button in header; chart gap; pass report data down
│       ├── TelemetryCharts.module.scss        # EDIT: header flex (button to far right); ≥15px gap token
│       ├── TelemetryChart.jsx                 # EDIT: height ≥350px; larger Y-axis label/tick font
│       ├── TrackMap.jsx                        # EDIT: circuit caption; start/finish marker; thicker stroke; center; bigger caption
│       └── TrackMap.module.scss               # EDIT: center map; caption sizing token
├── theme/
│   └── useSidebarState.js                     # NEW (optional): persisted collapsed-state hook (mirrors theme persistence)
└── utils/
    └── telemetry/
        └── lapSummaryPdf.js                   # NEW: builds + triggers the PDF from assembled report data
```

**Structure Decision**: Single existing React project. The feature is overwhelmingly edits to existing telemetry/sidebar components plus one new PDF util and (optionally) one persisted-state hook. Tyre/circuit data is assembled in `TelemetryPage` (which already owns the telemetry hooks and `meetings`) and passed down as props, keeping child components presentational — consistent with how the page already passes `trackMap`, `drivers`, `lapLabel`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New dependency `jspdf` | Client-side PDF generation of the lap summary report (FR-001..005) | (a) Hand-rolling a PDF byte stream is far more complex and error-prone than a 30 KB-gzip library; (b) `window.print()` to PDF can't produce the structured title/bullets/paragraph layout reliably across browsers and would print the whole page chrome; (c) server-side PDF rendering violates the project's "no server-side processing/persistence" scope. `jspdf` is the minimal, well-established choice and is tree-shakeable. |
