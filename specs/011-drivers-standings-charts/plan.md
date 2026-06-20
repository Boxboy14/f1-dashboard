# Implementation Plan: Drivers Tab — Standings Evolution Charts

**Branch**: `011-drivers-standings-charts` | **Date**: 2026-06-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/011-drivers-standings-charts/spec.md`

## Summary

Add two season-standings charts to the Drivers tab — **Driver Points Evolution** (cumulative championship points per round) and **Driver Ranking Evolution** (championship position per round, a "bump" chart) — and reflow the page so the 3-column grid sits in a narrow left column with the charts stacked to its right. Both charts share one chronological X-axis of race **country flags**, colour each driver's line by their **team colour**, and reveal a per-round panel on hover. All data comes from existing OpenF1 endpoints assembled with **TanStack Query `useQueries`** (one cached `/championship_drivers` query per completed round), reusing the app's existing rate-limiter and localStorage cache-persistence so a season is assembled once and restored from cache on revisit. Charting reuses **Recharts** (already a dependency) — **no new dependencies**.

## Technical Context

**Language/Version**: JavaScript (ES2020+), React 19

**Primary Dependencies**: React 19, React Router 7, TanStack Query v5 (incl. `useQueries`), Recharts 3, ag-grid 35, Salt DS, SCSS Modules, Vite. **No new dependencies.**

**Storage**: Client-only. TanStack Query cache persisted to `localStorage` (existing `persistQueryCache.js`); standings restored on reload.

**Testing**: Manual browser verification per project convention (quickstart.md).

**Target Platform**: Desktop + mobile-responsive web (evergreen browsers).

**Project Type**: Single-page web application (single project, `src/`).

**Performance Goals**: First assembly of a full 24-round season ≈ 8–10 s (24 standings lookups paced at ≤3 req/s by the existing rate limiter), shown behind a loading state; subsequent visits/reloads paint instantly from persisted cache. Charts render smoothly with ~20 line series.

**Constraints**: OpenF1 free tier 3 req/s, 30 req/min — every query declares `staleTime` and flows through the existing `schedule()` rate limiter. No raw hex in the app's own palette (Salt tokens); **driver line colours are API-provided team-colour data**, which is allowed (dynamic data, as used elsewhere in the app). Recharts axis/grid/tooltip themed via the existing telemetry approach (global CSS + token strings); line strokes need resolved colour strings (team colours already are).

**Scale/Scope**: 1 new data hook, ~5 new presentational modules (2 charts + container + flag tick + tooltips/helpers), 1 page reflow (HomePage + SCSS). ~24 cached queries per season.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Article | Gate | Status |
|---|---|---|
| I. Spec-First | spec.md + clarifications complete; checklist 16/16 | ✅ |
| II. API-First | `/championship_drivers?session_key=X` **verified live** to return cumulative standings as of that race (Bahrain R1 leader 26 pts → final 437 pts); fields `points_current`/`position_current`; rounds = sessions with `session_name === "Race"` (verified: 24 races + 6 sprints excluded) — see research.md | ✅ |
| III. Component Isolation | New hook + self-contained `tabs/drivers/standings/` components; page composition in HomePage | ✅ |
| IV. Data Layer Discipline | All access via `openF1Api` + TanStack Query (`useQueries`); each query keyed + `staleTime`; no raw `fetch`; same-round queries deduplicated/persisted | ✅ |
| V. Clean Code | One assembly hook; charts are presentational; no premature abstraction (two charts share small helpers only) | ✅ |
| VI. UI Consistency | Salt for layout/headings/empty-loading states; Recharts (existing) for charts; axis/grid/tooltip use Salt tokens (existing telemetry pattern); **no hardcoded palette hex** — driver colours are team data | ✅ |
| VII. Learning Goal | No new library to introduce; the one new concept (`useQueries` for a variable-length fan-out) is documented in research.md | ✅ |

**Result**: PASS. No new dependencies, no constitution violations, no Complexity Tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/011-drivers-standings-charts/
├── plan.md              # This file
├── research.md          # Phase 0 — API verification, useQueries fan-out, race-only filter, bump chart, flag axis, tooltips, colours, layout
├── data-model.md        # Phase 1 — Round, DriverStandingAtRound, Driver, evolution series, chart-row shapes
├── quickstart.md        # Phase 1 — manual verification mapped to US1–US3
├── contracts/
│   └── components.md     # Phase 1 — hook + component prop/behaviour contracts
└── tasks.md             # Phase 2 (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── hooks/
│   └── useDriverStandingsEvolution.js     # NEW: assembles rounds + per-driver points/position series via useQueries
├── components/
│   ├── dashboard/
│   │   ├── HomePage.jsx                    # EDIT: reflow — grid (narrow, left) + charts (stacked, right)
│   │   └── HomePage.module.scss           # NEW: two-column responsive layout
│   └── tabs/drivers/
│       ├── DriversGrid.jsx                 # EDIT (light): allow a constrained width in the new layout
│       └── standings/
│           ├── DriverStandingsCharts.jsx   # NEW: container — calls the hook, renders both charts, loading/empty states
│           ├── PointsEvolutionChart.jsx    # NEW: cumulative-points line chart + ranked hover panel
│           ├── RankingEvolutionChart.jsx   # NEW: position bump chart (reversed Y) + right-edge code labels + hover panel
│           ├── FlagAxisTick.jsx            # NEW: shared Recharts custom X-axis tick rendering a country flag
│           ├── standingsColors.js          # NEW: team-colour resolver (`#`-prefix + readable fallback)
│           └── DriverStandingsCharts.module.scss  # NEW: chart panel + tooltip styling (Salt tokens)
```

**Structure Decision**: Single existing React project. The feature is one new data hook plus a self-contained `tabs/drivers/standings/` component folder, composed into the existing `HomePage` (the `/drivers` route host). The grid stays where it is and is only constrained by the new page layout. Data assembly lives in the hook (so the chart components stay presentational), mirroring how `useTelemetryComparison` feeds the telemetry components.

## Complexity Tracking

> No constitution violations — no new dependencies, no added projects, no new architectural patterns beyond TanStack Query's first-party `useQueries`. Table intentionally empty.
