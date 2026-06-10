# Implementation Plan: Overview Page — Season Dashboard with Grand Prix Cards

**Branch**: `006-overview-page` | **Date**: 2026-06-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-overview-page/spec.md`

## Summary

Build the `/overview` page: a year-scoped season dashboard. The top of the page shows a season KPI strip (driver championship leader, most-recent race winner, next race), and below it a responsive grid of Grand Prix cards — one Salt `Card` per Grand Prix in the selected season, each laying out the GP's identity (round, name, country + flag, circuit), weekend date range, overall status, and a list of its sessions (each with its own status and clickable through to the session detail page).

The page composes two new hooks in `src/hooks/useOpenF1.js` — `useSeasonGrandPrix(year)` (cards) and `useSeasonKpis(year)` (KPI strip) — both built only from existing season-level OpenF1 queries (`useMeetings`, `useSessions`, `useChampionshipDrivers`, `useChampionshipTeams`, `useDrivers`, `useSessionResult`), which TanStack Query deduplicates by query key. The per-session and per-GP status derivation currently inlined in `useMeetingDetail` is lifted into a shared `src/utils/sessionStatus.js` helper so cards, the meeting page, and the calendar compute status identically.

## Technical Context

**Language/Version**: JavaScript (ES2022), React 19

**Primary Dependencies**: React Router 7 (routing, URL = year state), TanStack Query v5 (server state + dedup), Salt Design System `@salt-ds/core` 1.54 (`Card`, `GridLayout`, `GridItem`, `Link`, `Pill`, `Divider`, `Text`/`H3`/`H4`, `CircularProgress`), SCSS Modules. No new dependencies.

**Storage**: N/A — all data fetched on demand from OpenF1 and cached client-side by TanStack Query.

**Testing**: Manual browser verification against `quickstart.md` scenarios (project convention — no automated test suite).

**Target Platform**: Desktop + mobile responsive web, dark theme only.

**Project Type**: Single-page web application (Vite + React).

**Performance Goals**: First usable view < ~3s on a typical connection (SC-006); switching season repaints KPIs + all cards with no stale data (SC-005).

**Constraints**: OpenF1 free tier — 3 req/sec, 30 req/min. The whole page must stay within ~6 season-level requests (meetings, sessions, championship_drivers, championship_teams, drivers, session_result), all cached and deduplicated — never per-Grand-Prix fan-out.

**Scale/Scope**: One season at a time (~24 Grand Prix, ~120 sessions). One new route, one page, ~5 new components, 2 new hooks, 1 shared util, 1 status-helper extraction.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Article | Gate | Status |
|---|---|---|
| I. Spec-First | `spec.md` exists and is reviewed before code | ✅ spec.md + passing requirements checklist |
| II. API-First | Endpoint response shapes verified, not assumed | ✅ Every field used (`meetings.country_flag`, `sessions.date_end`, `championship_drivers.position_current`, `session_result.position`, `drivers.team_name`…) is already consumed by existing hooks (`useRaceCalendar`, `useMeetingDetail`, `useTeamsByYear`, `useSessionDetail`). No new endpoints. |
| III. Component Isolation | Self-contained folder, own hook, own styles | ✅ New `src/components/tabs/overview/` folder; hooks added to the shared `useOpenF1.js` per existing convention (`useMeetingDetail`, `useTeamsByYear` live there); per-component SCSS modules. |
| IV. Data Layer Discipline | All access via the data layer; `staleTime` set; no duplicate calls | ✅ Only existing `useOpenF1` hooks used; every underlying query already declares `staleTime`; both new hooks share query keys so `useSessions({year})` / `useMeetings({year})` resolve to one network call each. |
| V. Clean Code | No premature abstraction, no dead code, DRY | ✅ Status logic is extracted once into `sessionStatus.js` and reused (removes the duplication that would otherwise exist between `useMeetingDetail` and the new cards). |
| VI. UI Consistency | Salt DS first; dark theme fixed | ✅ Salt `Card`/`GridLayout`/`Link`/`Pill`/`Text`/`CircularProgress`. `Card` is new to this project — documented with a Rule-3 walkthrough in `research.md`. |
| VII. Learning | Decisions explainable; new-library mental model documented | ✅ `research.md` documents the Salt `Card` model and the manual parent/child-free grouping approach (community ag-grid has no tree data, but here we use plain cards, not a grid). |

**Result**: PASS — no violations. Complexity Tracking section left empty.

## Project Structure

### Documentation (this feature)

```text
specs/006-overview-page/
├── plan.md              # This file
├── spec.md              # Feature spec (already written)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── components.md     # Phase 1 output — hook + component contracts
└── checklists/
    └── requirements.md  # From /speckit-specify
```

### Source Code (repository root)

```text
src/
├── hooks/
│   └── useOpenF1.js                      # MODIFY: add useSeasonGrandPrix, useSeasonKpis; refactor useMeetingDetail to use shared helper
├── utils/
│   └── sessionStatus.js                  # NEW: deriveSessionStatus(), deriveMeetingStatus()
├── components/
│   ├── dashboard/
│   │   ├── OverviewPage.jsx              # NEW: page orchestrator (reads year from useOutletContext)
│   │   └── OverviewPage.module.scss      # NEW
│   └── tabs/
│       └── overview/                     # NEW folder
│           ├── SeasonKpiStrip.jsx        # NEW: KPI strip (US2)
│           ├── SeasonKpiStrip.module.scss
│           ├── KpiCard.jsx               # NEW: single KPI card (presentational)
│           ├── GrandPrixCardGrid.jsx     # NEW: responsive grid of GP cards (US1)
│           ├── GrandPrixCardGrid.module.scss
│           ├── GrandPrixCard.jsx         # NEW: one GP card (US1 + US3 navigation)
│           ├── GrandPrixCard.module.scss
│           ├── StatusPill.jsx            # NEW: status pill reusing STATUS_STYLES
│           ├── StatusPill.module.scss
│           └── utils/
│               └── formatters.js         # NEW: weekend date-range + next-race date formatting
├── App.jsx                               # MODIFY: add <Route path="overview" element={<OverviewPage />} />
└── components/dashboard/Sidebar/Sidebar.jsx  # MODIFY: remove disabled:true from the Overview nav item
```

**Structure Decision**: Single-project Vite/React app. The page lives in `components/dashboard/` (alongside `SeasonsPage`, `TeamsPage`, `MeetingPage`), and its presentational pieces live in a self-contained `components/tabs/overview/` folder mirroring the existing `tabs/teams`, `tabs/sessions`, `tabs/session-detail` convention. Data hooks go in the shared `hooks/useOpenF1.js` to match where every other composite hook already lives.

## Architecture & Data Flow

### Hooks (in `src/hooks/useOpenF1.js`)

**`useSeasonGrandPrix(year)` → `{ grandPrix, isLoading }`** (drives US1)
1. `useMeetings({ year })` and `useSessions({ year })` — both season-level, both cached.
2. Group sessions by `meeting_key` (a `Map`).
3. For each meeting (filtering out testing events, as `useRaceCalendar` does), build a card model: round (index after sort by date), identity fields, weekend `dateStart`/`dateEnd` (min session start → max session end), per-session status via `deriveSessionStatus`, and a rolled-up GP status via `deriveMeetingStatus`.
4. Sort GPs by date, sort each GP's sessions by `date_start`.

**`useSeasonKpis(year)` → `{ kpis: { leader, lastWinner, nextRace }, isLoading }`** (drives US2)
1. `useSessions({ year })` (deduped with the cards hook) → derive `lastRaceKey` (latest **completed** `Race` session) and `nextRace` (earliest upcoming `Race`, or `null`).
2. `useChampionshipDrivers({ session_key: lastRaceKey })` + `useDrivers({ session_key: lastRaceKey })` → join on `driver_number`, take `position_current === 1` → **leader** (name, team, points).
3. `useSessionResult({ session_key: lastRaceKey })` + the same drivers list → `position === 1` → **lastWinner** (name, team, the GP's `meeting_name`).
4. All standings/result queries are `enabled` only when `lastRaceKey` exists; when it doesn't (season not started), `leader`/`lastWinner` are `null` and the KPI cards render placeholders.

### Shared status helper (`src/utils/sessionStatus.js`)

```text
deriveSessionStatus(session, isCancelled) -> "Cancelled" | "Completed" | "In Progress" | "Upcoming" | "Unknown"
  (exact logic lifted verbatim from useMeetingDetail: cancelled wins; else compare date_start/date_end to now)

deriveMeetingStatus(sessionsWithStatus, isCancelled) -> same union
  Cancelled if isCancelled; else "In Progress" if any session In Progress OR a mix of Completed+Upcoming;
  "Completed" if all Completed; "Upcoming" if all Upcoming; "Unknown" otherwise.
```

`useMeetingDetail` is refactored to call `deriveSessionStatus` instead of its inline block — behavior-preserving, removes duplication (Article V).

### Components

- **`OverviewPage`** — reads `{ year }` from `useOutletContext()`, calls both hooks, renders `<Text styleAs="h2">Overview</Text>`, `<SeasonKpiStrip>`, then `<GrandPrixCardGrid>`. Owns loading (`CircularProgress`) and empty (`No Grand Prix data for this season`) states. Builds the two navigation callbacks (`openMeeting`, `openSession`) with `useNavigate` + `useSearchParams` to preserve `?year=`.
- **`SeasonKpiStrip`** — lays out three `KpiCard`s in a `GridLayout`/`FlexLayout`. Maps `kpis` → labelled cards; renders placeholders for `null` values and a "Season complete" `nextRace` card.
- **`KpiCard`** — presentational: `Card` with a label, a primary value, and optional secondary line (e.g. team, points, date).
- **`GrandPrixCardGrid`** — responsive `GridLayout` of `GrandPrixCard`s; receives `grandPrix`, `onOpenMeeting`, `onOpenSession`.
- **`GrandPrixCard`** — a plain Salt `Card` (not `InteractableCard`, to avoid nesting interactive controls). Header: round + GP name as a `Link` (→ meeting) + country flag + a `StatusPill`. Body: circuit + weekend date range, then a session list where each row is a `Link` (→ session) with name + `StatusPill`. Cancelled GP sessions are shown non-navigable.
- **`StatusPill`** — small pill using `STATUS_STYLES[status]` color (Salt `Pill` or a styled span), reused by the GP header and each session row for one consistent status vocabulary.

### Routing & navigation

- `App.jsx`: add `<Route path="overview" element={<OverviewPage />} />` inside the `DashboardLayout` route.
- `Sidebar.jsx`: drop `disabled: true` from the Overview item (the link already preserves `?year=`).
- Drill-down reuses existing pages: `/meetings/:key` and `/sessions/:key`, both preserving `?year=` (matches `SeasonsPage`/`MeetingPage` patterns).

## Complexity Tracking

> No constitution violations — section intentionally empty.
