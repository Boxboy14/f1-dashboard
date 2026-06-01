# Tasks: Teams Page

**Input**: Design documents from `specs/002-teams-page/`

**Organization**: Grid + data layer first (US1), then detail card (US2), per user instruction.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Foundational (Data Layer)

**Purpose**: Hook and utility that all UI components in this feature depend on. Must be complete before any component work begins.

**⚠️ CRITICAL**: Both tasks must be complete before Phase 2 can start.

- [X] T001 Add `useTeamsByYear(year)` hook to `src/hooks/useOpenF1.js` — chains `useSessions → lastSessionKey → useChampionshipTeams + useChampionshipDrivers + useDrivers` (all three parallel, guarded by `enabled: Boolean(lastSessionKey)`), merges via `useMemo` into `TeamRow[]` sorted by `position_current` ASC, returns `{ data: TeamRow[], isLoading: boolean }`. Import `useMemo` from React. See `specs/002-teams-page/data-model.md` for the exact merged shape and `specs/002-teams-page/research.md` Decision 2 for the merge algorithm.
- [X] T002 [P] Create `src/store/teams/utils.js` — export `createTeamSlug({ team_name })` that returns `team_name.replace(/\s+/g, "-").toLowerCase()`. Mirror the pattern in `src/store/drivers/utils.js`.

**Checkpoint**: `useTeamsByYear` and `createTeamSlug` are ready; no UI work done yet.

---

## Phase 2: User Story 1 — Constructor Standings Grid (Priority: P1) 🎯 MVP

**Goal**: `/teams` renders a working ag-grid showing all constructors for the selected season with rank, points, and both driver names. Season change updates the grid.

**Independent Test**: Navigate to `http://localhost:5173/teams?year=2025`. The grid loads with ~10 rows. Each row shows a championship rank, team name, total points, and two driver names. Changing the season selector to 2023 updates all rows to 2023 data. Red Bull Racing should appear at rank 1 for 2023.

- [X] T003 [P] [US1] Create `src/components/tabs/teams/TeamsGrid.module.scss` — copy the pattern from `src/components/tabs/drivers/DriversGrid.module.scss`; a single `.grid` class with `height: 100%` and `width: 100%` is sufficient.
- [X] T004 [US1] Create `src/components/tabs/teams/TeamsGrid.jsx` — ag-grid component with props `{ year, onTeamOpen }`. Calls `useTeamsByYear(year)`. Column defs: Rank (`position_current`, width 80, sortable), Team (`team_name`, flex 1, sortable), Points (`points_current`, width 100, sortable), Driver 1 (valueGetter: `({ data }) => data.drivers[0]?.full_name ?? "—"`, flex 1, not sortable), Driver 2 (valueGetter: `({ data }) => data.drivers[1]?.full_name ?? "—"`, flex 1, not sortable). `onRowDoubleClicked` calls `onTeamOpen(event.data)`. `getRowId` uses `team_name`. `onGridReady` calls `api.sizeColumnsToFit()`. Passes `rowData={isLoading ? [] : data}`. Import `DataGrid` from `../../DataGrid.jsx` and `useTeamsByYear` from `../../../hooks/useOpenF1.js`.
- [X] T005 [US1] Create `src/components/dashboard/TeamsPage.jsx` — reads `{ year }` from `useOutletContext()`, renders `<Text styleAs="h2">Teams</Text>` and `<TeamsGrid year={year} onTeamOpen={() => {}} />`. No detail card yet. Import Text from `@salt-ds/core`, DriversGrid equivalent from `../tabs/teams/TeamsGrid.jsx`.
- [X] T006 [US1] Add `/teams` and `/teams/:teamSlug` routes to `src/App.jsx` — import `TeamsPage` from `./components/dashboard/TeamsPage.jsx` and add `<Route path="teams" element={<TeamsPage />} />` and `<Route path="teams/:teamSlug" element={<TeamsPage />} />` inside the existing `<Route path="/" element={<DashboardLayout />}>` wrapper, after the drivers routes.
- [X] T007 [US1] Enable Teams nav item in `src/components/dashboard/Sidebar/Sidebar.jsx` — remove `disabled: true` from the `{ label: "Teams", icon: UserGroupIcon, path: "/teams" }` entry in `NAV_ITEMS`.

**Checkpoint**: Navigate to `/teams?year=2025` — grid renders with real constructor data. Season selector updates the grid. Teams sidebar link is active and navigable. Double-clicking a row does nothing (expected for MVP).

---

## Phase 3: User Story 2 — Team Detail View (Priority: P2)

**Goal**: Double-clicking a team row opens a Salt DS Dialog showing the team's championship rank, total points, and both drivers' individual championship stats. Closing the dialog returns to the grid with the season preserved in the URL.

**Independent Test**: Navigate to `/teams?year=2025`, double-click "McLaren". A dialog opens showing McLaren's rank, points, and two driver sections — each with driver name, number, individual championship rank and points. Close the dialog. URL returns to `/teams?year=2025` and the grid is still visible with 2025 data.

- [X] T008 [P] [US2] Create `src/components/tabs/teams/TeamDetailCard.module.scss` — styles for the team detail dialog. Include `.content` (dialog body layout), `.teamSummary` (rank + points row), `.driverSection` (per-driver block), `.driverName` (name text), `.statRow` (label + value pair). Mirror the structure from `src/components/tabs/drivers/driverGridCss/DriverInfoCard.module.scss`.
- [X] T009 [US2] Create `src/components/tabs/teams/TeamDetailCard.jsx` — Salt DS Dialog component. Props: `{ isOpen, teamData, id, setIsDetailOpen }`. Destructure from `teamData`: `team_name`, `position_current`, `points_current`, `drivers`. DialogHeader shows `team_name` with a close Button (CloseIcon, `appearance="transparent"`). DialogContent shows: team championship summary (Rank: `position_current`, Points: `points_current`) and a section per driver showing `full_name`, `driver_number`, individual `championship.position_current`, individual `championship.points_current` (show "—" if `championship` is null). Use `FormField + FormFieldLabel + Input readOnly` for each stat field, matching the DriverInfoCard pattern. Guard entire render behind `if (!teamData) return null`.
- [X] T010 [US2] Update `src/components/dashboard/TeamsPage.jsx` — add full detail card wiring: (1) add `useParams` and `useNavigate` and `useSearchParams` imports from `react-router-dom`; (2) add `useCallback` to React imports; (3) import `createTeamSlug` from `../../../store/teams/utils.js`; (4) import `TeamDetailCard` from `../tabs/teams/TeamDetailCard.jsx`; (5) add `const navigate = useNavigate()`, `const { teamSlug } = useParams()`, `const [searchParams] = useSearchParams()` inside the component; (6) derive `const { data: teams = [] } = useTeamsByYear(year)` — note: TeamsGrid already calls this hook internally; TeamsPage only needs it to resolve `selectedTeam`; (7) import `useTeamsByYear` from `../../hooks/useOpenF1.js`; (8) add `const selectedTeam = teams.find(t => createTeamSlug(t) === teamSlug)`; (9) add `openTeamDetail` callback that navigates to `{ pathname: /teams/${createTeamSlug(team)}, search: searchParams.toString() }`; (10) add `handleDetailClose` that navigates to `{ pathname: "/teams", search: searchParams.toString() }` when `isOpen` is false; (11) replace the dummy `onTeamOpen={() => {}}` with `onTeamOpen={openTeamDetail}`; (12) render `<TeamDetailCard isOpen={Boolean(teamSlug && selectedTeam)} teamData={selectedTeam} id={teamSlug ?? "team-detail"} setIsDetailOpen={handleDetailClose} />` below TeamsGrid.

**Checkpoint**: Full feature complete. Both user stories working. Verify all 6 quickstart scenarios from `specs/002-teams-page/quickstart.md`.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [ ] T011 Verify quickstart scenario 2 in browser — change year to 2023, confirm Red Bull Racing appears at rank 1 with ~860 points and Verstappen + Pérez as drivers.
- [ ] T012 Verify quickstart scenario 4 in browser — open a team detail on 2023 season, close the dialog, confirm year selector still shows 2023 and grid shows 2023 data (URL `?year=2023` is preserved).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No external dependencies — start immediately
- **Phase 2 (US1)**: T001 and T002 must be complete — T003 and T004 need the hook; T002 not needed until T010 but good to have
- **Phase 3 (US2)**: All of Phase 2 must be complete
- **Phase 4 (Polish)**: All of Phase 3 must be complete

### Within Phase 2

```
T001, T002 done →
  T003 [P]  (styles, no deps beyond project setup)
  T004      (needs T001 for useTeamsByYear)
    ↓
  T005      (needs T004 for TeamsGrid import)
    ↓
  T006      (needs T005 for TeamsPage import)
    ↓
  T007      (independent, but logically after T006 so Teams link actually works)
```

### Within Phase 3

```
T008 [P]   (styles, no deps)
T009       (needs T008)
  ↓
T010       (needs T009 for TeamDetailCard import, needs T002 for createTeamSlug)
```

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T003 can run in parallel with T004 (different files)
- T008 can run in parallel with any remaining Phase 2 work if Phase 2 is complete

---

## Implementation Strategy

### MVP (US1 only — Phase 1 + Phase 2)

1. Complete T001 and T002 (data layer)
2. Complete T003 → T004 → T005 → T006 → T007 (grid and routing)
3. **Stop and validate**: navigate to `/teams?year=2025`, confirm grid loads with constructor data
4. Test season switching: change to 2023, confirm Red Bull Racing #1

### Full Feature (add US2 — Phase 3)

5. Complete T008 → T009 → T010 (detail card)
6. **Validate**: double-click a team row, confirm dialog opens with correct data
7. Verify URL and season preservation throughout

---

## Notes

- `TeamsPage` calls `useTeamsByYear(year)` twice (once directly for `selectedTeam`, once via `TeamsGrid`). TanStack Query deduplicates identical queries — only one API fetch occurs.
- The `team_colour` field from OpenF1 has no leading `#` (e.g. `"F47600"`). If used for styling in TeamDetailCard, prefix with `#`.
- Mid-season substitutions may result in a team having more than 2 entries in `drivers[]`. `drivers[0]` and `drivers[1]` are displayed in the grid columns; the detail card should map over all entries.
