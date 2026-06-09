# Tasks: Session Detail Page

**Input**: Design documents from `specs/005-session-detail/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/components.md ✅ · quickstart.md ✅

**Organization**: Grouped by user story. No tests requested — implementation tasks only.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: View Session Classification (P1)
- **[US2]**: View Pit Stop History (P2)

---

## Phase 1: Setup

No project-level setup required. All dependencies (ag-grid, Salt DS, TanStack Query, React Router) are already installed. Infrastructure hooks (`useSessionResult`, `usePit`, `useDrivers`, `useSessions`) already exist in `useOpenF1.js`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared utilities that both user stories depend on. Must complete before any user story work begins.

**⚠️ CRITICAL**: Both T001 and T002 must be complete before Phase 3 can start.

- [X] T001 [P] Extend `src/utils/cellRenderers/statusStyles.js` — add `Finished`, `DNF`, `DNS`, `DSQ` entries using `var(--salt-content-secondary-foreground)` for Finished and `var(--salt-status-error-foreground)` for DNF/DNS/DSQ
- [X] T002 [P] Add `useSessionDetail(sessionKey)` hook to `src/hooks/useOpenF1.js` — four parallel queries (`useSessions`, `useSessionResult`, `useDrivers`, `usePit`) all gated on `Boolean(sessionKey)`; `useMemo` joins rawResults with driverMap (keyed on `driver_number`), derives `status` ("Finished"/"DNF"/"DNS"/"DSQ") and `best_time` (null for race, last non-null duration-array element for qualifying, scalar for practice), sorts results by position ASC and pitStops by lap_number ASC; add `useSessionDetail` to the export block at bottom of file; returns `{ session, results, pitStops, isLoading }`

**Checkpoint**: Foundation ready. `useSessionDetail` can be called and returns correct shape.

---

## Phase 3: User Story 1 — View Session Classification (Priority: P1) 🎯 MVP

**Goal**: Render the full classification grid at `/sessions/:sessionKey` — positions, driver names, teams, gaps/times, and status — with loading and empty states.

**Independent Test**: Navigate to `/sessions/<race_session_key>` directly in the browser. Confirm the classification table renders with position, driver, team, gap, and status columns. Confirm qualifying and practice sessions show a Best Time column instead.

- [X] T003 [P] [US1] Create `src/components/tabs/session-detail/utils/formatters.js` — named exports: `formatLapTime` (converts float seconds to "M:SS.mmm" or "SS.mmm" if < 60s; returns "—" for null), `formatGap` (returns `value ?? ""` — blank for leader, string as-is for others)
- [X] T004 [P] [US1] Create `src/components/tabs/session-detail/ClassificationGrid.module.scss` — `.grid { margin-top: 24px; }` (same pattern as `SessionsGrid.module.scss`)
- [X] T005 [US1] Create `src/components/tabs/session-detail/ClassificationGrid.jsx` — accepts `{ results, sessionType, isLoading }`; selects Race/Sprint column set (`#`, Driver, Team, Gap via `formatGap`, Status via `StatusCellRenderer`) when `["Race", "Sprint"].includes(sessionType)`, otherwise Qualifying/Practice column set (`#`, Driver, Team, Best Time via `formatLapTime`); `getRowId = ({ data }) => String(data.driver_number)`; `onGridReady = ({ api }) => api.sizeColumnsToFit()`; no row interaction; imports `StatusCellRenderer` from `../../../utils/cellRenderers/StatusCellRenderer.jsx` and `formatLapTime`/`formatGap` from `./utils/formatters.js`
- [X] T006 [US1] Create `src/components/dashboard/SessionDetailPage.jsx` — reads `sessionKey` from `useParams()` and `searchParams` from `useSearchParams()`; calls `useSessionDetail(sessionKey)`; renders `<CircularProgress>` while `isLoading && !session`; renders `<Text>Session not found</Text>` when `!isLoading && !session`; otherwise renders back-navigation `<Button>` (navigates to `/meetings/${session.meeting_key}?${searchParams}`), `<Text styleAs="h2">{session.session_name}</Text>`, formatted date `<Text>`, and `<ClassificationGrid results={results} sessionType={session.session_type} isLoading={isLoading} />`; imports from React Router, Salt DS, and local components
- [X] T007 [US1] Add `<Route path="sessions/:sessionKey" element={<SessionDetailPage />} />` inside the `<Route path="/" element={<DashboardLayout />}>` block in `src/App.jsx`; add corresponding import for `SessionDetailPage`

**Checkpoint**: Navigate to any session URL — classification grid renders with correct column set, loading state shows spinner, invalid key shows "Session not found".

---

## Phase 4: User Story 2 — View Pit Stop History (Priority: P2)

**Goal**: Add a pit stops table below the classification grid, visible only for sessions that have pit stop data.

**Independent Test**: Navigate to a completed race session. Confirm a pit stops table appears below the classification grid with Driver, Team, Lap, and Duration columns. Navigate to a qualifying session — confirm the pit stops section is absent entirely.

- [X] T008 [P] [US2] Add `formatPitDuration` to `src/components/tabs/session-detail/utils/formatters.js` — formats `value` (float seconds) as `"${value.toFixed(1)}s"` (e.g. `"23.1s"`); returns `"—"` for null; add to named exports
- [X] T009 [P] [US2] Create `src/components/tabs/session-detail/PitStopsGrid.module.scss` — `.grid { margin-top: 24px; }` and `.heading { margin-top: 32px; }` for the section heading
- [X] T010 [US2] Create `src/components/tabs/session-detail/PitStopsGrid.jsx` — accepts `{ pitStops, isLoading }`; column set: Driver (`full_name`, flex 1), Team (`team_name`, 180px), Lap (`lap_number`, 80px), Duration (`pit_duration`, 120px, `valueFormatter: formatPitDuration`); `getRowId = ({ data }) => \`${data.driver_number}-${data.lap_number}\``; `onGridReady = ({ api }) => api.sizeColumnsToFit()`; no row interaction; imports `formatPitDuration` from `./utils/formatters.js`
- [X] T011 [US2] Wire `PitStopsGrid` into `src/components/dashboard/SessionDetailPage.jsx` — import `PitStopsGrid`; add a `<Text styleAs="h3">Pit Stops</Text>` heading and `<PitStopsGrid pitStops={pitStops} isLoading={isLoading} />` below the classification grid, rendered only when `pitStops.length > 0 || isLoading`

**Checkpoint**: Navigate to a race session — pit stops table visible with all driver pit events. Navigate to qualifying — pit stops section absent.

---

## Phase 5: Polish & Verification

**Purpose**: Validate the complete feature against all quickstart scenarios.

- [ ] T012 Browser verification — test all 6 quickstart scenarios from `specs/005-session-detail/quickstart.md`: (1) completed Race: classification with gap/status columns, pit stops visible; (2) Qualifying: best-time column, no pit stops; (3) Upcoming session: empty state message; (4) Invalid session key: "Session not found" no crash; (5) Cancelled meeting session: empty classification, no pit stops; (6) Practice session: best-time column, pit stops may or may not appear

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 2 (Foundational)**: T001 and T002 run in parallel — no prerequisites
- **Phase 3 (US1)**: Requires T001 (statusStyles) and T002 (hook) complete
  - T003 and T004 run in parallel after T001+T002
  - T005 requires T003 (formatters) and T004 (scss) and T001 (statusStyles) complete
  - T006 requires T005 (grid) and T002 (hook) complete
  - T007 requires T006 (page) complete
- **Phase 4 (US2)**: T008 and T009 run in parallel (can start once T003 exists to add to)
  - T010 requires T008 (formatPitDuration) and T009 (scss) complete
  - T011 requires T010 (PitStopsGrid) and T006 (SessionDetailPage) complete
- **Phase 5 (Polish)**: Requires T007 and T011 complete

### Parallel Opportunities

```
# Phase 2 — both foundational tasks in parallel
T001  statusStyles extension
T002  useSessionDetail hook

# Phase 3 — after T001+T002 complete
T003  formatters.js (formatLapTime, formatGap)
T004  ClassificationGrid.module.scss

# Phase 4 — T008 and T009 in parallel
T008  formatters.js (add formatPitDuration)
T009  PitStopsGrid.module.scss
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 + T002 — foundational (parallel)
2. T003 + T004 — grid utilities (parallel)
3. T005 — ClassificationGrid
4. T006 — SessionDetailPage
5. T007 — route wiring
6. **STOP and VALIDATE**: Navigate to a race session URL — confirm classification renders correctly

### Incremental Delivery

1. Complete MVP (T001-T007) → Classification grid is live
2. Add US2 (T008-T011) → Pit stops table added below classification
3. T012 → Full verification pass

---

## Notes

- No new library imports required — all dependencies (ag-grid, Salt DS, TanStack Query, React Router) are already installed
- `StatusCellRenderer` requires no changes — it reads from `STATUS_STYLES` by key; new keys from T001 are picked up automatically
- The `useSessionDetail` hook composes existing hooks only — no new API service methods needed
- T006 and T011 both modify `SessionDetailPage.jsx` — do T006 first, then T011 adds to it (no conflicts)
- Duration units: OpenF1 returns pit stop durations as float seconds; `formatPitDuration` formats accordingly
- Qualifying duration: OpenF1 returns an array `[Q1, Q2, Q3]` — the hook extracts the last non-null element as `best_time` before it reaches the grid
