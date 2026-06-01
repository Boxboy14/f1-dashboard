# Tasks: Race Calendar

**Input**: Design documents from `specs/003-race-calendar/`

**Organization**: Grid + data layer first (US1), then race detail navigation (US2), per user instruction.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Foundational (Data Layer)

**Purpose**: Hook that all UI components depend on, plus the styles file (independent of the hook — both can run in parallel).

**⚠️ CRITICAL**: T001 must be complete before any component work begins.

- [X] T001 Add `useRaceCalendar(year)` hook to `src/hooks/useOpenF1.js` — calls `useMeetings({ year })`, transforms via `useMemo`: (1) filter out entries where `meeting_name.toLowerCase().includes("testing")`, (2) sort by `date_start` ASC, (3) map each meeting to a `RaceRound` object adding `round` (1-indexed position) and `status` (`"Cancelled"` if `is_cancelled`, `"Completed"` if `date_start < new Date()`, else `"Upcoming"`). Returns `{ data: RaceRound[], isLoading: boolean }`. The `useMeetings` hook already exists — only add `useRaceCalendar` to the export block. See `specs/003-race-calendar/data-model.md` for the full `RaceRound` shape.
- [X] T002 [P] Create `src/components/tabs/calendar/CalendarGrid.module.scss` — add `.countryCell` (flex row, `align-items: center`, `gap: 8px`, `height: 100%`) and `.countryFlag` (`height: 20px`, `width: auto`, `object-fit: contain`, `flex-shrink: 0`). Mirror the pattern from `src/components/tabs/teams/TeamsGrid.module.scss`.

**Checkpoint**: `useRaceCalendar` is ready; scss file exists; no UI work done yet.

---

## Phase 2: User Story 1 — Season Race Calendar Grid (Priority: P1) 🎯 MVP

**Goal**: `/seasons` renders a working ag-grid showing all race rounds for the selected season with round number, GP name, circuit, country (with flag), date, and status. Season change updates the grid. Calendar sidebar link is active.

**Independent Test**: Navigate to `http://localhost:5173/seasons?year=2025`. The grid loads with all 2025 race rounds. Each row shows a round number, GP name, circuit, country with a flag icon, formatted date, and status badge. Changing the season to 2023 updates the grid and the Emilia Romagna Grand Prix row shows "Cancelled".

- [X] T003 [US1] Create `src/components/tabs/calendar/CalendarGrid.jsx` — ag-grid component with props `{ year, onRaceOpen }`. Import `DataGrid` from `../../DataGrid.jsx`, `useRaceCalendar` from `../../../hooks/useOpenF1.js`, and `styles` from `./CalendarGrid.module.scss`. Define three inline helpers before `columnDefs`: (a) `const formatDate = ({ value }) => value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"` (b) `const CountryCellRenderer = ({ value, data }) => <span className={styles.countryCell}>{data?.country_flag && <img src={data.country_flag} alt="" className={styles.countryFlag} />}{value}</span>` (c) `const STATUS_STYLES = { Completed: { color: "var(--salt-content-secondary-foreground)" }, Upcoming: { color: "#22c55e" }, Cancelled: { color: "var(--salt-status-error-foreground)" } }` and `const StatusCellRenderer = ({ value }) => <span style={STATUS_STYLES[value] ?? {}}>{value}</span>`. Define `columnDefs` outside the component: Rnd (`round`, width 70, sortable), Grand Prix (`meeting_name`, flex 1, sortable), Circuit (`circuit_short_name`, flex 1, sortable), Country (`country_name`, width 160, sortable, `cellRenderer: CountryCellRenderer`), Date (`date_start`, width 130, sortable, `valueFormatter: formatDate`), Status (`status`, width 120, sortable, `cellRenderer: StatusCellRenderer`). Inside the component: `const { data: races = [], isLoading } = useRaceCalendar(year)`. Define `onGridReady = ({ api }) => api.sizeColumnsToFit()`, `onRowDoubleClicked = ({ data }) => onRaceOpen(data)`, `getRowId = ({ data: { meeting_key } }) => String(meeting_key)`. Render `<div className={styles.grid}><DataGrid columnDefs={columnDefs} getRowId={getRowId} rowData={isLoading ? [] : races} onGridReady={onGridReady} onRowDoubleClicked={onRowDoubleClicked} /></div>`.
- [X] T004 [US1] Create `src/components/dashboard/SeasonsPage.jsx` — reads `{ year }` from `useOutletContext()`, renders `<Text styleAs="h2">Calendar</Text>` and `<CalendarGrid year={year} onRaceOpen={() => {}} />`. Import `Text` from `@salt-ds/core`, `CalendarGrid` from `../tabs/calendar/CalendarGrid.jsx`, `useOutletContext` from `react-router-dom`. No navigation wiring yet — US2 adds that in T007.
- [X] T005 [US1] Add `/seasons` route to `src/App.jsx` — import `SeasonsPage` from `./components/dashboard/SeasonsPage.jsx` and add `<Route path="seasons" element={<SeasonsPage />} />` inside the existing `<Route path="/" element={<DashboardLayout />}>` wrapper, after the teams routes.
- [X] T006 [P] [US1] Enable Calendar nav item in `src/components/dashboard/Sidebar/Sidebar.jsx` — remove `disabled: true` from the `{ label: "Calendar", icon: CalendarIcon, path: "/seasons" }` entry in `NAV_ITEMS`.

**Checkpoint**: Navigate to `/seasons?year=2025` — grid renders with all 2025 race rounds. Season selector updates the grid. 2023 shows Emilia Romagna as "Cancelled". Calendar sidebar link is active and navigable. Double-clicking a row does nothing (expected for MVP).

---

## Phase 3: User Story 2 — Race Detail Navigation (Priority: P2)

**Goal**: Double-clicking a race row navigates to `/meetings/:meeting_key` with the current year preserved in the URL.

**Independent Test**: Navigate to `/seasons?year=2025`, double-click the "Australian Grand Prix" row. The URL changes to `/meetings/1229?year=2025` (the meeting_key for Australia 2025). Pressing browser back returns to `/seasons?year=2025` and the grid is still visible with 2025 data.

- [X] T007 [US2] Update `src/components/dashboard/SeasonsPage.jsx` — add `useCallback` to React imports; add `useNavigate` and `useSearchParams` to react-router-dom imports; inside the component add `const navigate = useNavigate()` and `const [searchParams] = useSearchParams()`; define `const openRaceDetail = useCallback((meeting) => { navigate({ pathname: \`/meetings/\${meeting.meeting_key}\`, search: searchParams.toString() }); }, [navigate, searchParams])`; replace the stub `onRaceOpen={() => {}}` with `onRaceOpen={openRaceDetail}`.

**Checkpoint**: Double-clicking any race row navigates to `/meetings/:key?year=YEAR`. Back button returns to `/seasons?year=YEAR` with grid intact.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [ ] T008 Verify 2023 calendar in browser — navigate to `/seasons?year=2023`, confirm Emilia Romagna Grand Prix row shows status "Cancelled" and all other 2023 races show "Completed".
- [ ] T009 Verify season switching in browser — starting at `/seasons?year=2025`, change the year selector to 2024, confirm grid updates to show 2024 races within 2 seconds with no blank screen.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No external dependencies — T001 and T002 can run in parallel
- **Phase 2 (US1)**: T001 must be complete; T002 must be complete before T003 (imports the scss); T003 → T004 → T005 in sequence; T006 is parallel to T005
- **Phase 3 (US2)**: All of Phase 2 must be complete; T007 modifies SeasonsPage.jsx
- **Phase 4 (Polish)**: All of Phase 3 must be complete

### Within Phase 2

```
T001, T002 done →
  T003      (needs T001 for hook, T002 for scss)
    ↓
  T004      (needs T003 for CalendarGrid import)
    ↓
  T005      (needs T004 for SeasonsPage import)
  T006 [P]  (Sidebar — independent of App.jsx changes, can run with T005)
```

### Parallel Opportunities

- T001 and T002 can run in parallel (different files, no deps between them)
- T005 and T006 can run in parallel (different files: App.jsx and Sidebar.jsx)

---

## Implementation Strategy

### MVP (US1 only — Phase 1 + Phase 2)

1. Complete T001 and T002 in parallel (data hook + scss)
2. Complete T003 → T004 → T005 in sequence; T006 in parallel with T005
3. **Stop and validate**: navigate to `/seasons?year=2025`, confirm grid loads with all 2025 rounds
4. Test season switching and verify 2023 Emilia Romagna shows "Cancelled"

### Full Feature (add US2 — Phase 3)

5. Complete T007 (navigation wiring in SeasonsPage)
6. **Validate**: double-click a race, confirm URL changes to `/meetings/:key?year=YEAR`
7. Verify back button preserves year

---

## Notes

- `useRaceCalendar` makes exactly 1 API query (`useMeetings`) — no per-meeting requests. TanStack Query caches the result for 10 minutes (`staleTime` already declared in `useMeetings`).
- `CountryCellRenderer` and `StatusCellRenderer` are defined **outside** the `CalendarGrid` component so ag-grid does not recreate them on each render.
- `formatDate` is a `valueFormatter` (not a `cellRenderer`) so ag-grid retains the raw ISO string for sorting — only the display label is formatted.
- `StatusCellRenderer` uses inline `style` (not CSS modules) because the color depends on the cell value at render time — a legitimate dynamic style use case per CLAUDE.md.
- The `/meetings/:key` route does not need to exist for US2 to work — the navigation call succeeds and the app lands on a future 404/empty page until the meetings detail feature is built.
