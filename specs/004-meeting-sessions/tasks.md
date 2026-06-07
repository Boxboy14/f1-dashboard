# Tasks: Meeting Sessions Grid

**Input**: Design documents from `specs/004-meeting-sessions/`

**Feature**: Build the `/meetings/:meetingKey` page displaying all sessions for a GP weekend, with double-click navigation to session detail.

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: The `useMeetingDetail` hook is required by both user stories. Must be complete before any page work begins.

- [X] T001 Add `useMeetingDetail(meetingKey)` hook to `src/hooks/useOpenF1.js` — calls `useMeetings({ meeting_key: meetingKey })` and `useSessions({ meeting_key: meetingKey })` in parallel (both gated on `Boolean(meetingKey)`), uses `useMemo` to sort sessions by `date_start` ASC and compute 3-way status (Completed/In Progress/Upcoming/Unknown) from `date_start`/`date_end` vs `new Date()`, returns `{ meeting: meetings[0] ?? null, sessions, isLoading }`; add `useMeetingDetail` to the collected export block at the bottom of the file

**Checkpoint**: Hook exported and ready — US1 and US2 implementation can begin

---

## Phase 3: User Story 1 — View GP Weekend Sessions (Priority: P1) 🎯 MVP

**Goal**: The `/meetings/:meetingKey` route loads, shows the GP name and country as a heading, and renders an ag-grid table of all sessions with Session, Type, Date, and Status columns.

**Independent Test**: Navigate to `/seasons?year=2025`, double-click any race row. Browser goes to `/meetings/<key>`. Page shows GP name, country, and a sessions grid with 5+ rows each having a session name, type, formatted date, and colour-coded status.

- [X] T002 [P] [US1] Create `src/components/tabs/sessions/SessionsGrid.module.scss` — add `.grid` (margin-top: 24px) and `.statusCell` classes
- [X] T003 [US1] Create `src/components/tabs/sessions/SessionsGrid.jsx` — ag-grid component with props `{ sessions, isLoading, onSessionOpen }`; columns: Session (`session_name`, flex 1), Type (`session_type`, 120px), Date (`date_start`, 180px, `valueFormatter` → en-GB locale with time `"26 May 2025, 14:00"`, `filter: "agTextColumnFilter"`, `filterValueGetter` returns formatted string), Status (`status`, 130px, `StatusCellRenderer` with `STATUS_STYLES` for Completed/In Progress/Upcoming/Cancelled/Unknown); `getRowId = ({ data }) => String(data.session_key)`; `onRowDoubleClicked = ({ data }) => onSessionOpen(data)`; `onGridReady = ({ api }) => api.sizeColumnsToFit()`; renders `<DataGrid rowData={isLoading ? [] : sessions} />`
- [X] T004 [US1] Create `src/components/dashboard/MeetingPage.jsx` — reads `meetingKey` from `useParams()` and `[searchParams]` from `useSearchParams()`; calls `useMeetingDetail(meetingKey)`; renders: `<CircularProgress />` while `isLoading && !meeting`, `<Text>Meeting not found</Text>` if `!isLoading && !meeting`, otherwise `<Text styleAs="h2">{meeting.meeting_name}</Text>`, `<Text>{meeting.country_name}</Text>`, and `<SessionsGrid sessions={sessions} isLoading={isLoading} onSessionOpen={() => {}} />`; import `CircularProgress` from `@salt-ds/core` and `Text` from `@salt-ds/core`
- [X] T005 [US1] Add `<Route path="meetings/:meetingKey" element={<MeetingPage />} />` to `src/App.jsx` inside the `<Route path="/" element={<DashboardLayout />}>` block; import `MeetingPage` from `"./components/dashboard/MeetingPage.jsx"`

**Checkpoint**: US1 complete — calendar → meeting page flow works end-to-end

---

## Phase 4: User Story 2 — Navigate to Session Detail (Priority: P2)

**Goal**: Double-clicking a session row in the sessions grid navigates to `/sessions/:session_key` preserving the current search params in the URL.

**Independent Test**: On the meeting page, double-click any session row. Browser navigates to `/sessions/<session_key>?year=2025` (or whatever search params are present). Pressing browser back returns to the meeting page. App does not crash even though `/sessions/:key` has no built page yet.

- [X] T006 [US2] Update `src/components/dashboard/MeetingPage.jsx` — add `useNavigate` import from `react-router-dom`; define `openSessionDetail` with `useCallback`: `(session) => navigate({ pathname: /sessions/${session.session_key}, search: searchParams.toString() })`; replace the `onSessionOpen={() => {}}` stub with `onSessionOpen={openSessionDetail}`

**Checkpoint**: US2 complete — full drill-down path Calendar → Meeting → Session URL works

---

## Phase 5: Polish & Verification

- [ ] T007 Browser verification — start dev server, navigate to `/seasons?year=2025`, double-click a race row, confirm meeting page loads with GP name and sessions grid, verify status colours (grey/green/amber) appear correctly, double-click a session row and confirm browser navigates to `/sessions/<key>` without crashing

---

## Dependencies & Execution Order

- **T001** (Foundational): Must complete before T003 and T004
- **T002** (stylesheet): Parallelisable with T001 — different files, no dependency
- **T003** (SessionsGrid): Depends on T001 (uses `useMeetingDetail` indirectly via prop) and T002 (imports styles)
- **T004** (MeetingPage): Depends on T001 and T003
- **T005** (route): Depends on T004
- **T006** (navigation): Depends on T004 (edits same file)
- **T007** (verification): Depends on all above

### Parallel Opportunities

- T001 and T002 can run simultaneously (different files)
- T003 can start as soon as T001 and T002 are complete
- T005 and T006 cannot overlap — both edit MeetingPage.jsx / App.jsx sequentially

---

## Implementation Strategy

### MVP (US1 only)

1. T001 → useMeetingDetail hook
2. T002 + (wait for T001) T003 → SessionsGrid
3. T004 → MeetingPage
4. T005 → wire route
5. Validate: Calendar → Meeting page with sessions grid visible

### Full Feature

Continue with T006 (US2 navigation) then T007 (verification).
