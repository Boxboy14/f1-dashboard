# Implementation Plan: Teams Page

**Branch**: `002-teams-page` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-teams-page/spec.md`

---

## Summary

Build a `/teams` page that shows all constructors participating in the selected season — championship rank, total points, and both drivers per team — using a data grid consistent with the Drivers tab. A team detail dialog (same Salt DS Dialog pattern as DriverInfoCard) opens on row double-click and is driven by a `/teams/:teamSlug` URL param. The global year selector already exists in the Navbar; this page reads `year` from outlet context and responds to season changes automatically.

---

## Technical Context

**Language/Version**: JavaScript (ES2022), React 19

**Primary Dependencies**: React Router 7, TanStack Query v5, ag-grid 35, Salt Design System

**Storage**: None — all data fetched on demand and cached by TanStack Query

**Target Platform**: Desktop + mobile browser (dark theme only)

**Project Type**: Single-page web app (Vite + React)

**Performance Goals**: Teams grid renders within 2 seconds under normal network; season switch updates grid within 2 seconds (matching existing Drivers tab behaviour)

**Constraints**: OpenF1 free tier — 3 req/sec, 30 req/min. The `useTeamsByYear` hook fires 3 queries in parallel (not serial) once `session_key` is known; rate limit is respected because all 3 are fired simultaneously and TanStack Query deduplicates.

---

## Constitution Check

| Article | Requirement | This Feature |
|---|---|---|
| I — Spec-First | Spec must exist before code | ✅ spec.md complete |
| II — API-First | Verify API response shapes before building | ✅ Verified in research.md — real API calls confirmed field names |
| III — Component Isolation | Each page is self-contained | ✅ `TeamsPage` owns its own team detail state; `DashboardLayout` not modified |
| IV — Data Layer Discipline | All fetching via hooks, staleTime required | ✅ New `useTeamsByYear` hook; all child queries already have `staleTime` |
| V — Clean Code | No premature abstractions, no dead code | ✅ `valueGetter` approach for driver columns — no custom cell renderers needed |
| VI — UI Consistency | Salt DS first | ✅ `Dialog` for detail card, ag-grid for data table (same as Drivers tab) |
| VII — Learning First | Every decision explainable | ✅ See research.md for all architectural decisions |

---

## Project Structure

### Documentation (this feature)

```
specs/002-teams-page/
├── plan.md              ← this file
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── components.md
└── tasks.md             ← created by /speckit-tasks
```

### Source Code Changes

```
src/
├── App.jsx                                      MODIFY: add /teams and /teams/:teamSlug routes
│
├── components/
│   ├── dashboard/
│   │   └── TeamsPage.jsx                        NEW: tab shell
│   │
│   └── tabs/
│       └── teams/                               NEW folder
│           ├── TeamsGrid.jsx                    NEW: ag-grid constructor standings
│           ├── TeamsGrid.module.scss             NEW
│           ├── TeamDetailCard.jsx               NEW: Salt Dialog team detail
│           └── TeamDetailCard.module.scss        NEW
│
├── hooks/
│   └── useOpenF1.js                             MODIFY: add useTeamsByYear
│
└── store/
    └── teams/
        └── utils.js                             NEW: createTeamSlug
```

**Also**:
- `src/components/dashboard/Sidebar/Sidebar.jsx` — MODIFY: remove `disabled: true` from the Teams nav item

---

## Component Architecture

### TeamsPage.jsx

```
TeamsPage
  ├── reads year from useOutletContext()
  ├── reads teamSlug from useParams()
  ├── calls useTeamsByYear(year)
  ├── derives selectedTeam = teams.find(t => createTeamSlug(t) === teamSlug)
  ├── defines openTeamDetail(team) → navigate({ pathname: /teams/${slug}, search })
  ├── defines handleDetailClose(isOpen) → if (!isOpen) navigate({ pathname: /teams, search })
  │
  ├── <Text styleAs="h2">Teams</Text>
  ├── <TeamsGrid year={year} onTeamOpen={openTeamDetail} />
  └── <TeamDetailCard isOpen={...} teamData={selectedTeam} ... />
```

### TeamsGrid.jsx

```
TeamsGrid
  ├── props: { year, onTeamOpen }
  ├── calls useTeamsByYear(year)
  ├── columnDefs with valueGetters for nested driver names
  └── <DataGrid rowData={isLoading ? [] : teams} onRowDoubleClicked={onTeamOpen} />
```

### TeamDetailCard.jsx

```
TeamDetailCard (Salt Dialog)
  ├── props: { isOpen, teamData, id, setIsDetailOpen }
  ├── DialogHeader: team name + close button
  └── DialogContent:
       ├── Team rank and points summary
       └── Per-driver section (×2):
            driver name, number, individual rank, individual points
```

### useTeamsByYear(year) — new hook

```
Step 1: useSessions({ year, session_type: "Race" }) → lastSessionKey
Step 2 (parallel, guarded by enabled: Boolean(lastSessionKey)):
  - useChampionshipTeams({ session_key: lastSessionKey })
  - useChampionshipDrivers({ session_key: lastSessionKey })
  - useDrivers({ session_key: lastSessionKey })
Step 3: useMemo merge
  - driverStandingMap: Map<driver_number, DriverStanding>
  - driversByTeam: Map<team_name, DriverWithStanding[]>
  - return teamStandings.map(team => ({
      ...team,
      team_colour: driversByTeam[team.team_name]?.[0]?.team_colour ?? null,
      drivers: driversByTeam[team.team_name] ?? []
    })).sort by position_current ASC
Returns: { data: TeamRow[], isLoading: boolean }
```

---

## Routing Changes

**App.jsx additions**:
```jsx
import TeamsPage from "./components/dashboard/TeamsPage.jsx";

// Inside <Route path="/" element={<DashboardLayout />}>
<Route path="teams" element={<TeamsPage />} />
<Route path="teams/:teamSlug" element={<TeamsPage />} />
```

**Sidebar change**: Remove `disabled: true` from the Teams entry in `NAV_ITEMS`.

---

## TeamsGrid Column Definitions

```js
const columnDefs = [
  { headerName: "Rank", field: "position_current", sortable: true, width: 80 },
  { headerName: "Team", field: "team_name", sortable: true, flex: 1 },
  { headerName: "Points", field: "points_current", sortable: true, width: 100 },
  {
    headerName: "Driver 1",
    valueGetter: ({ data }) => data.drivers[0]?.full_name ?? "—",
    sortable: false,
    flex: 1,
  },
  {
    headerName: "Driver 2",
    valueGetter: ({ data }) => data.drivers[1]?.full_name ?? "—",
    sortable: false,
    flex: 1,
  },
];
```

---

## Complexity Tracking

No constitution violations. No complexity justification required.
