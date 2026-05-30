# Quickstart: Teams Page Integration Scenarios

**Feature**: 002-teams-page  
**Date**: 2026-05-30

---

## Scenario 1: Load teams grid for current season

1. User launches the app (or navigates to `/teams?year=2025`)
2. `TeamsPage` reads `year=2025` from outlet context
3. `TeamsGrid` calls `useTeamsByYear(2025)`
4. Hook internally fetches last race session key for 2025
5. Hook fetches championship_teams, championship_drivers, drivers in parallel
6. Hook merges data and returns `TeamRow[]` sorted by championship rank
7. Grid renders 10 team rows (one per constructor), each with rank, name, points, 2 driver names

**Expected grid row example**:
```
| 1 | McLaren | 468 | Lando Norris | Oscar Piastri |
```

---

## Scenario 2: Season change updates teams

1. User is on `/teams?year=2025` viewing the 2025 grid
2. User changes the global year selector to 2023
3. URL updates to `/teams?year=2023`
4. `TeamsPage` outlet context provides `year=2023`
5. `useTeamsByYear(2023)` fires with the new year
6. Grid re-renders with 2023 constructor standings

**Verify**: Red Bull Racing should be #1 in 2023 with ~860 points.

---

## Scenario 3: Open team detail card

1. User double-clicks on the "McLaren" row
2. `TeamsGrid.onRowDoubleClicked` calls `onTeamOpen(teamData)`
3. `TeamsPage.openTeamDetail` navigates to `/teams/mclaren?year=2025`
4. URL param `teamSlug=mclaren` is present
5. `TeamsPage` finds `selectedTeam` by matching `createTeamSlug(team) === "mclaren"`
6. `TeamDetailCard` opens showing:
   - Header: "McLaren"
   - Championship rank: 1, Points: 468
   - Driver 1: Lando Norris — Rank: 1, Points: 279
   - Driver 2: Oscar Piastri — Rank: 3, Points: 189

---

## Scenario 4: Close team detail, season preserved

1. User is viewing `/teams/mclaren?year=2023`
2. User clicks the close button on `TeamDetailCard`
3. `setIsDetailOpen(false)` is called
4. `TeamsPage.handleDetailClose` navigates to `{ pathname: "/teams", search: "year=2023" }`
5. URL becomes `/teams?year=2023`
6. `TeamDetailCard` closes, grid remains visible with 2023 data

**Verify**: After close, year selector still shows 2023 and grid shows 2023 standings.

---

## Scenario 5: Teams nav item in sidebar

1. User clicks "Teams" in the sidebar
2. Sidebar navigates to `{ pathname: "/teams", search: year ? "year=<year>" : "" }`
3. TeamsPage renders with the current year
4. "Teams" nav item is highlighted active in the sidebar

---

## Scenario 6: No data for a season

1. User selects a year with no available data (edge case — all 3 supported years should have data)
2. `useTeamsByYear` returns `{ data: [], isLoading: false }`
3. `TeamsGrid` renders an empty ag-grid (ag-grid's built-in "No Rows" overlay)
4. No blank screen, no JavaScript error
