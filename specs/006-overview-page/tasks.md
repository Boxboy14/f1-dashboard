---
description: "Task list for Overview Page — Season Dashboard with Grand Prix Cards"
---

# Tasks: Overview Page — Season Dashboard with Grand Prix Cards

**Input**: Design documents from `specs/006-overview-page/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/components.md ✅ · quickstart.md ✅

**Tests**: None requested — project convention is manual browser verification (quickstart.md). Implementation tasks only.

**Organization**: Grouped by user story (US1 cards → US2 KPIs → US3 navigation) for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]**: View Grand Prix cards (P1) · **[US2]**: Season KPI snapshot (P2) · **[US3]**: Drill-down navigation (P3)

---

## Phase 1: Setup

No project-level setup required. All dependencies (Salt DS `@salt-ds/core` 1.54, TanStack Query, React Router, SCSS Modules) are already installed — no new packages. The base data queries (`useMeetings`, `useSessions`, `useChampionshipDrivers`, `useChampionshipTeams`, `useDrivers`, `useSessionResult`) already exist in `src/hooks/useOpenF1.js`. The `src/components/tabs/overview/` folder is created implicitly by the file-creation tasks below.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure, non-UI utilities that the user-story hooks and components build on. Must complete before Phase 3.

**⚠️ CRITICAL**: T001 blocks US1's hook (T004); T003 blocks both US1's card (T006) and US2's strip (T012).

- [X] T001 [P] Create `src/utils/sessionStatus.js` exporting `deriveSessionStatus(session, isCancelled)` (Cancelled wins; else compare `date_start`/`date_end` to now → "Completed"/"In Progress"/"Upcoming"; "Unknown" if no dates — logic lifted verbatim from `useMeetingDetail`) and `deriveMeetingStatus(sessionsWithStatus, isCancelled)` (Cancelled if cancelled; "Unknown" if none; "In Progress" if any in-progress or a Completed+Upcoming mix; "Completed" if all completed; "Upcoming" if all upcoming)
- [X] T002 Refactor `useMeetingDetail` in `src/hooks/useOpenF1.js` to import and call `deriveSessionStatus` instead of its inline date→status block (behavior-preserving; removes the duplication) — depends on T001
- [X] T003 [P] Create `src/components/tabs/overview/utils/formatters.js` exporting `formatWeekend(dateStart, dateEnd)` (e.g. `"14–16 Mar 2025"`, collapsing same month/year; single date if no end), `formatRaceDate(dateStart)` (e.g. `"Sun 16 Mar, 15:00"`), and `daysUntil(dateStart)` (whole days from now, render-time)

**Checkpoint**: Shared status + formatting utilities exist and `useMeetingDetail` still behaves identically.

---

## Phase 3: User Story 1 — View Grand Prix cards (Priority: P1) 🎯 MVP

**Goal**: `/overview` renders a card per Grand Prix in the selected season — identity (round, name, country + flag, circuit), weekend dates, overall status, and the GP's session list with per-session status — plus loading and empty states. Cards are display-only in this story (navigation comes in US3).

**Independent Test**: Navigate to `/overview` with a season selected. Confirm one card per GP (ordered by round, no testing event, no duplicates), each showing identity, weekend range, a status pill, and its sessions with per-session status pills. Spinner while loading; "No Grand Prix data for this season" when empty.

- [X] T004 [P] [US1] Add `useSeasonGrandPrix(year)` to `src/hooks/useOpenF1.js` (and its export) — compose `useMeetings({ year })` + `useSessions({ year })`; exclude testing meetings; sort by `date_start` and assign 1-based `round`; group sessions by `meeting_key`; per session set `status` via `deriveSessionStatus`; per GP derive `date_start` (min), `date_end` (max), `status` via `deriveMeetingStatus`; sort each GP's sessions by `date_start`; return `{ grandPrix, isLoading }` — depends on T001
- [X] T005 [P] [US1] Create `src/components/tabs/overview/StatusPill.jsx` + `StatusPill.module.scss` — Salt `Pill` (or styled span) labelled `status`, tinted by `STATUS_STYLES[status]` from `src/utils/cellRenderers/statusStyles.js`
- [X] T006 [US1] Create `src/components/tabs/overview/GrandPrixCard.jsx` + `GrandPrixCard.module.scss` — plain Salt `Card`; header shows `Round {round}`, GP name (plain `Text` for now), `country_flag` image (if present), and `<StatusPill status={gp.status} />`; sub-header shows `circuit_short_name` + `formatWeekend(date_start, date_end)`; body lists sessions as rows (plain `Text` for now) each with `session_name` + `<StatusPill status={s.status} />` — depends on T005, T003
- [X] T007 [US1] Create `src/components/tabs/overview/GrandPrixCardGrid.jsx` + `GrandPrixCardGrid.module.scss` — responsive Salt `GridLayout` rendering one `GrandPrixCard` per `grandPrix` item (key = `meeting_key`); accepts `{ grandPrix }` (nav props added in US3) — depends on T006
- [X] T008 [US1] Create `src/components/dashboard/OverviewPage.jsx` + `OverviewPage.module.scss` — read `{ year }` from `useOutletContext()`; call `useSeasonGrandPrix(year)`; render `<Text styleAs="h2">Overview</Text>`; show `<CircularProgress aria-label="Loading season" />` while loading with no data, `<Text>No Grand Prix data for this season</Text>` when not loading and empty, otherwise `<GrandPrixCardGrid grandPrix={grandPrix} />` — depends on T004, T007
- [X] T009 [US1] Wire routing in `src/App.jsx` (import `OverviewPage`; add `<Route path="overview" element={<OverviewPage />} />` inside the `DashboardLayout` route) and enable the nav item in `src/components/dashboard/Sidebar/Sidebar.jsx` (remove `disabled: true` from the Overview entry) — depends on T008

**Checkpoint**: `/overview` is reachable from the sidebar and shows the full season as cards. MVP complete and independently demoable.

---

## Phase 4: User Story 2 — Season KPI snapshot (Priority: P2)

**Goal**: A KPI strip above the cards showing the driver championship leader, the most-recent race winner, and the next race (or "Season complete"), with graceful placeholders when the season has no completed races.

**Independent Test**: With a completed season selected, confirm three KPI cards: leader (name/team/points), last winner (name + GP), next race ("Season complete" for past seasons). With a season that has no completed race, confirm leader/winner show placeholders without error.

- [X] T010 [P] [US2] Add `useSeasonKpis(year)` to `src/hooks/useOpenF1.js` (and its export) — from `useSessions({ year })` derive `lastRaceKey` (latest completed `Race`) and `nextRace` (earliest upcoming `Race`, with `daysUntil`, else `null`); `useChampionshipDrivers` + `useDrivers` (both `{ session_key: lastRaceKey }`, `enabled: Boolean(lastRaceKey)`) joined on `driver_number` → `leader` (`position_current === 1`); `useSessionResult({ session_key: lastRaceKey })` + drivers joined on `driver_number` → `lastWinner` (`position === 1`, with `meeting_name`); return `{ kpis: { leader, lastWinner, nextRace }, isLoading }` with `null` sub-fields when `lastRaceKey` is absent
- [X] T011 [P] [US2] Create `src/components/tabs/overview/KpiCard.jsx` (+ `KpiCard.module.scss` if needed) — presentational Salt `Card` with `{ label, primary, secondary? }`: muted label, emphasized primary, optional secondary line
- [X] T012 [US2] Create `src/components/tabs/overview/SeasonKpiStrip.jsx` + `SeasonKpiStrip.module.scss` — Salt `GridLayout`/`FlexLayout` of three `KpiCard`s: **Leader** (`leader.full_name` / `leader.team_name` · `{points} pts`, placeholder when null), **Last Winner** (`lastWinner.full_name` / `lastWinner.meeting_name`, placeholder when null), **Next Race** (`nextRace.meeting_name` / `formatRaceDate(date_start)` · `in {daysUntil} days`, or "Season complete" when null); accepts `{ kpis, isLoading }` — depends on T011, T003
- [X] T013 [US2] Wire `SeasonKpiStrip` into `src/components/dashboard/OverviewPage.jsx` — call `useSeasonKpis(year)` and render `<SeasonKpiStrip kpis={kpis} isLoading={kpisLoading} />` above `<GrandPrixCardGrid>` — depends on T010, T012, T008

**Checkpoint**: Overview shows both the KPI strip and the GP cards; both stories work independently.

---

## Phase 5: User Story 3 — Drill into a meeting or session from a card (Priority: P3)

**Goal**: Make the cards an index into the app — the GP name navigates to its meeting page and each session navigates to its session detail page, preserving the selected season.

**Independent Test**: From a GP card, activate the GP name → land on `/meetings/:key`. Activate a session → land on `/sessions/:key`. Confirm `?year=` is preserved across navigation.

- [X] T014 [US3] In `src/components/dashboard/OverviewPage.jsx`, add `onOpenMeeting(meeting_key)` and `onOpenSession(session_key)` callbacks (via `useNavigate` + `useSearchParams`, preserving `?year=` like `MeetingPage`/`SeasonsPage`) and thread them through `GrandPrixCardGrid` → `GrandPrixCard` — depends on T008, T007
- [X] T015 [US3] In `src/components/tabs/overview/GrandPrixCard.jsx`, convert the GP name to a Salt `Link` (onClick → `onOpenMeeting(gp.meeting_key)`) and each non-cancelled session row's name to a Salt `Link` (onClick → `onOpenSession(s.session_key)`); cancelled-GP session rows stay plain (non-navigable) — depends on T014, T006

**Checkpoint**: All three stories functional — cards render, KPIs populate, and every card is a working drill-down.

---

## Phase 6: Polish & Verification

**Purpose**: Keep the source-of-truth docs current and validate the whole feature.

- [X] T016 [P] Update root `plan.md` — revise the `/overview` route description (season dashboard: KPI strip + per-GP session cards, year-scoped) and the "Built/Pending" + current-state snapshot to reflect the implemented Overview page
- [X] T017 Run `npm run build` and confirm no errors and no console warnings (e.g. missing React keys in the card grid or session list)
- [ ] T018 Execute the 9 scenarios in `specs/006-overview-page/quickstart.md` in the browser (cards render, status, KPIs, session drill-down, meeting drill-down, season switch repaint, empty state, API-lockout, status parity with the meeting page)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: none — nothing to do.
- **Foundational (Phase 2)**: T001 and T003 in parallel; T002 after T001. Blocks Phase 3+.
- **US1 (Phase 3)**: needs T001 (status helper) + T003 (formatters). MVP.
- **US2 (Phase 4)**: needs T003 (formatters) + T008 (page shell to wire into). Independent of US1's cards otherwise.
- **US3 (Phase 5)**: needs T006/T007/T008 (cards + grid + page from US1).
- **Polish (Phase 6)**: after the stories you intend to ship.

### Task-Level Dependencies

- T002 → T001
- T004 → T001 · T006 → T005, T003 · T007 → T006 · T008 → T004, T007 · T009 → T008
- T012 → T011, T003 · T013 → T010, T012, T008
- T014 → T008, T007 · T015 → T014, T006
- T016/T017/T018 → all shipped stories
- **Same-file note**: T002, T004, T010 all edit `src/hooks/useOpenF1.js` — run them sequentially (they are in different phases, so this falls out naturally). T013 and T014 both edit `OverviewPage.jsx` — T013 (US2) before T014 (US3).

### Parallel Opportunities

```text
# Phase 2 — foundational utilities (different files)
T001  src/utils/sessionStatus.js
T003  src/components/tabs/overview/utils/formatters.js

# Phase 3 (US1) — after foundational
T004  useSeasonGrandPrix (useOpenF1.js)   ┐ different files
T005  StatusPill (+scss)                  ┘

# Phase 4 (US2)
T010  useSeasonKpis (useOpenF1.js)        ┐ different files
T011  KpiCard (+scss)                     ┘
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 2 foundational (T001–T003).
2. Phase 3 US1 (T004–T009).
3. **STOP and VALIDATE**: open `/overview` from the sidebar — the full season renders as cards with correct status. Demoable MVP.

### Incremental Delivery

1. Foundational → US1 (cards, MVP) → validate.
2. US2 (KPI strip) → validate independently.
3. US3 (drill-down navigation) → validate independently.
4. Polish: update root plan.md, build, run quickstart.

---

## Notes

- No new dependencies and no new API service methods — both hooks compose existing `useOpenF1` queries, deduplicated by TanStack Query key (≤ ~6 cached season-level calls total; never a per-GP fan-out).
- `StatusPill` reuses the existing `STATUS_STYLES` vocabulary so the overview matches the Calendar/Sessions grids.
- `GrandPrixCard` is a plain `Card` (not `InteractableCard`) — two nav targets (GP + sessions) would otherwise nest interactive controls; US3 adds discrete `Link`s.
- The "Season complete" / placeholder KPI states are the common path (all selectable seasons are in the past), not rare edges — build them deliberately.
- T002 is a behavior-preserving extraction; verify the meeting page still shows identical session statuses (quickstart Scenario 9).
- Commit after each task or logical group.
