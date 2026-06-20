# Implementation Plan: Teams Page

**Branch**: `002-teams-page` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-teams-page/spec.md`

---

## Summary

Build a `/teams` page that shows all constructors participating in the selected season — championship rank, total points, and both drivers per team — using a data grid consistent with the Drivers tab. A team detail dialog (same Salt DS Dialog pattern as DriverInfoCard) opens on row double-click and is driven by a `/teams/:teamSlug` URL param. The global year selector already exists in the Navbar; this page reads `year` from outlet context and responds to season changes automatically.

**Extension (2026-06-20)**: Add two season-standings charts to the Teams page — **Team Points Evolution** (cumulative constructor points per round) and **Team Ranking Evolution** (constructor championship position per round, a "bump" chart) — and reflow the page so the standings grid sits in a narrow left column with the charts stacked to its right. This mirrors `specs/011-drivers-standings-charts/` exactly: same chronological X-axis of race **country flags**, same hover-panel pattern, same `useQueries`-based per-round fetch, same Recharts implementation — applied to `/championship_teams` instead of `/championship_drivers`. **No new dependencies.**

---

## Technical Context

**Language/Version**: JavaScript (ES2022), React 19

**Primary Dependencies**: React Router 7, TanStack Query v5 (incl. `useQueries`), ag-grid 35, Salt Design System, Recharts 3 (already a dependency, used by the Drivers tab and Telemetry page)

**Storage**: Client-only. Grid data fetched on demand and cached by TanStack Query; the standings-evolution series additionally persists to `localStorage` via the existing `persistQueryCache.js`, same as the Drivers tab.

**Target Platform**: Desktop + mobile browser (dark theme only)

**Project Type**: Single-page web app (Vite + React)

**Performance Goals**: Teams grid renders within 2 seconds under normal network; season switch updates grid within 2 seconds (matching existing Drivers tab behaviour). First assembly of a full season's evolution series ≈ 8–10s (paced at ≤3 req/s by the existing rate limiter), shown behind a loading state; subsequent visits/reloads paint instantly from persisted cache.

**Constraints**: OpenF1 free tier — 3 req/sec, 30 req/min. The `useTeamsByYear` hook fires 3 queries in parallel (not serial) once `session_key` is known; rate limit is respected because all 3 are fired simultaneously and TanStack Query deduplicates. The new `useTeamStandingsEvolution` hook fans out per-round `/championship_teams` queries via `useQueries` (mirrors `useDriverStandingsEvolution`), all flowing through the existing rate limiter. No hardcoded palette hex — team line/label colours are API-provided team-colour data (dynamic data, same exception already used on the Drivers tab).

---

## Constitution Check

| Article | Requirement | This Feature |
|---|---|---|
| I — Spec-First | Spec must exist before code | ✅ spec.md complete (incl. US3–US5 extension) |
| II — API-First | Verify API response shapes before building | ✅ Verified in research.md — real API calls confirmed field names; `/championship_teams` per-round shape reused from existing research |
| III — Component Isolation | Each page is self-contained | ✅ `TeamsPage` owns its own team detail state; new `tabs/teams/standings/` folder is self-contained, mirroring `tabs/drivers/standings/` |
| IV — Data Layer Discipline | All fetching via hooks, staleTime required | ✅ New `useTeamsByYear` hook; new `useTeamStandingsEvolution` hook (`useQueries`, keyed + `staleTime`, dedupes/persists) |
| V — Clean Code | No premature abstractions, no dead code | ✅ `valueGetter` approach for driver columns; standings hook/components mirror the proven Drivers-tab pattern rather than introducing a new one |
| VI — UI Consistency | Salt DS first | ✅ `Dialog` for detail card, ag-grid for data table, Recharts (existing) for the two new charts, axis/grid/tooltip themed via Salt tokens |
| VII — Learning First | Every decision explainable | ✅ See research.md for grid decisions; chart decisions reuse the documented Drivers-tab rationale (research.md of feature 011) |

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
│   │   ├── TeamsPage.jsx                        MODIFY: two-column reflow (grid left, charts right)
│   │   └── TeamsPage.module.scss                NEW: two-column responsive layout (mirrors HomePage.module.scss)
│   │
│   └── tabs/
│       └── teams/                               NEW folder
│           ├── TeamsGrid.jsx                    NEW: ag-grid constructor standings
│           ├── TeamsGrid.module.scss             NEW
│           ├── TeamDetailCard.jsx               NEW: Salt Dialog team detail
│           ├── TeamDetailCard.module.scss        NEW
│           └── standings/                       NEW folder — mirrors tabs/drivers/standings/
│               ├── TeamStandingsCharts.jsx       NEW: container — calls the hook, renders both charts, loading/empty states
│               ├── PointsEvolutionChart.jsx      NEW: cumulative-points line chart + ranked hover panel
│               ├── RankingEvolutionChart.jsx     NEW: position bump chart (reversed Y) + right-edge name labels + hover panel
│               ├── FlagAxisTick.jsx              NEW: shared Recharts custom X-axis tick rendering a country flag
│               ├── standingsColors.js            NEW: team-colour resolver (`#`-prefix + readable fallback)
│               └── TeamStandingsCharts.module.scss NEW: chart panel + tooltip styling (Salt tokens)
│
├── hooks/
│   ├── useOpenF1.js                             MODIFY: add useTeamsByYear
│   └── useTeamStandingsEvolution.js             NEW: assembles rounds + per-team points/position series via useQueries
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

## Standings Evolution Charts — Architecture (extension)

### useTeamStandingsEvolution(year) — new hook

Mirrors `useDriverStandingsEvolution` field-for-field, swapping the driver standings endpoint for the team one and resolving colour via `team_name` instead of `driver_number`:

```
Step 1: useSessions({ year, session_type: "Race" }) + useMeetings({ year })
  → rounds = Race-only sessions, sorted, joined to country_name/country_flag,
    numbered 1..n, completed = date_start < now

Step 2: useQueries over completedRounds
  → one { queryKey: ["championship_teams", { session_key }],
          queryFn: () => openF1Api.championshipTeams({ session_key }),
          staleTime: 10*60*1000 } per round (same key useChampionshipTeams
    uses elsewhere, so it dedupes + persists)

Step 3: team identity + colour
  → useDrivers at the first and last completed round's session_key (union of
    rosters, same "mid-season change" safeguard as the driver hook), grouped
    by team_name to get { team_colour } per team (championship_teams itself
    has no colour field — same gap useTeamsByYear already works around)

Step 4: useMemo assembly
  → teams: [{ teamName, color, ... }] sorted by latest position
  → pointsData / rankData: one row per completed round,
    { round, countryName, countryFlag, [`t_<slug>`]: points|position|null }
  → teamCount = max position_current across rounds

Returns: { rounds, teams, pointsData, rankData, teamCount, isLoading, isEmpty }
```

**Key difference from the driver hook**: the per-series key is a sanitized team-name slug (`t_${slug}`) rather than `d${driver_number}`, since `/championship_teams` has no numeric identifier — `team_name` is the only join key (same constraint `useTeamsByYear`/research.md Decision 1 already documents).

### TeamStandingsCharts.jsx / PointsEvolutionChart.jsx / RankingEvolutionChart.jsx / FlagAxisTick.jsx / standingsColors.js

Identical structure and behaviour to their `tabs/drivers/standings/` counterparts (container with loading/empty states; line chart + ranked hover panel; reversed-Y bump chart with proximity-based hover detection and right-edge labels; shared flag tick; colour resolver with neutral fallback) — titled "Team Points Evolution" / "Team Ranking Evolution", one line per **team** instead of per driver, right-edge label = team name instead of 3-letter code.

### TeamsPage.jsx (reflow)

```
TeamsPage
  ├── (unchanged) team detail dialog wiring via teamSlug/searchParams
  ├── <Text styleAs="h1">Teams</Text>
  ├── <div className={styles.layout}>
  │     ├── <div className={styles.gridCol}><TeamsGrid ... /></div>
  │     └── <div className={styles.chartsCol}><TeamStandingsCharts year={year} /></div>
  │   </div>
  └── <TeamDetailCard ... /> (unchanged)
```

`TeamsPage.module.scss` mirrors `HomePage.module.scss`'s flex two-column layout, but with a slightly wider `gridCol` (≈440px vs 380px) to accommodate the standings grid's 5 columns (Rank, Team, Points, Driver 1, Driver 2) vs the Drivers grid's 3.

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
