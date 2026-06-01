# Component Contracts: Teams Page

**Feature**: 002-teams-page  
**Date**: 2026-05-30

---

## TeamsPage

Tab shell component. Analogous to `HomePage.jsx` for the drivers tab.

**Route**: `/teams` and `/teams/:teamSlug`

**Props**: none (reads from React Router outlet context and URL params)

**Reads from outlet context**:
- `year: number` — the globally selected season year

**Reads from URL params**:
- `teamSlug?: string` — present when a team detail dialog should be open

**Responsibilities**:
- Fetches merged team data via `useTeamsByYear(year)`
- Derives `selectedTeam` from `teamSlug` + team data
- Provides `openTeamDetail(team)` callback to `TeamsGrid`
- Renders `TeamsGrid` and `TeamDetailCard`
- Navigates to `/teams/:teamSlug?year=<year>` on team open
- Navigates back to `/teams?year=<year>` on team detail close

---

## TeamsGrid

ag-grid based table of all constructors for the selected season.

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `year` | number | yes | Currently selected season (for data fetching) |
| `onTeamOpen` | (team: TeamRow) => void | yes | Called on row double-click |

**Columns**:

| Header | Data | Behaviour |
|---|---|---|
| Rank | `position_current` | Sortable, numeric |
| Team | `team_name` | Sortable |
| Points | `points_current` | Sortable, numeric |
| Driver 1 | `drivers[0].full_name` | valueGetter, not sortable |
| Driver 2 | `drivers[1].full_name` | valueGetter, not sortable |

**Behaviour**:
- Displays loading state (empty rows) while data fetches
- Double-click on a row calls `onTeamOpen(rowData)`
- Columns auto-size to fit container on grid ready

---

## TeamDetailCard

Salt DS Dialog overlay showing team and driver championship detail.

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `isOpen` | boolean | yes | Controls dialog visibility |
| `teamData` | TeamRow \| undefined | yes | Team data to display (undefined = nothing rendered) |
| `id` | string | yes | Unique dialog ID for accessibility |
| `setIsDetailOpen` | (open: boolean) => void | yes | Called when dialog requests close |

**Content when open**:
- Dialog header: team name
- Team championship rank and total points
- Two driver sections, each showing: driver name, driver number, individual championship rank, individual points
- Graceful "—" fallback for any missing field
- Close button

---

## useTeamsByYear (hook contract)

New hook added to `src/hooks/useOpenF1.js`.

**Signature**: `useTeamsByYear(year: number) → { data: TeamRow[], isLoading: boolean }`

**Behaviour**:
- Internally chains: `useSessions` → `lastSessionKey` → `useChampionshipTeams` + `useChampionshipDrivers` + `useDrivers` (all guarded by `enabled: Boolean(lastSessionKey)`)
- Merges the 3 sources via `useMemo`
- Returns `isLoading: true` until all three queries have resolved
- Returns `data: []` while loading or when no data exists
- Does NOT throw — all errors surface as `data: []` + `isLoading: false`

---

## createTeamSlug (utility contract)

New function in `src/store/teams/utils.js`.

**Signature**: `createTeamSlug(team: { team_name: string }) → string`

**Examples**:
- `{ team_name: "Red Bull Racing" }` → `"red-bull-racing"`
- `{ team_name: "Mercedes" }` → `"mercedes"`
- `{ team_name: "Kick Sauber" }` → `"kick-sauber"`
