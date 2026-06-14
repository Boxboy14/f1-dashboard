---
description: "Task list for Telemetry Comparison"
---

# Tasks: Telemetry Comparison

**Input**: Design documents from `specs/007-telemetry-comparison/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/components.md ✅ · quickstart.md ✅

**Tests**: None requested — project convention is manual browser verification (quickstart.md). Implementation tasks only.

**Organization**: Grouped by user story (US1 single-driver charts → US2 two-driver comparison → US3 linked cursor).

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]** single-driver telemetry (P1) · **[US2]** two-driver comparison (P2) · **[US3]** synchronized cursor (P3)

---

## Phase 1: Setup

No project-level setup required. Recharts 3.8 and Salt DS are already installed (no new packages). The base query hooks (`useRaceCalendar`, `useSessions`, `useDrivers`, `useLaps`) already exist in `src/hooks/useOpenF1.js`. The `src/components/tabs/telemetry/` folder is created implicitly by the file-creation tasks below.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The data + math engine every chart depends on — pure utils, the ranged car_data fetch, and the composite hook. No UI yet.

**⚠️ CRITICAL**: Completes before any user-story UI. T001+T002+T004 are parallel; T003 needs T002; T005 needs T001+T003.

- [X] T001 [P] Create `src/utils/telemetry.js` — pure exports: `deriveDistance(samples)` (cumulative `distance += (speed/3.6)*dt_s` from consecutive `date`s), `resampleToGrid(samplesWithDistance, points)` (even distance grid 0..total; **linear** interp for speed/throttle/brake/rpm, **nearest-sample** for `n_gear` and `drs`), `mergeDrivers(gridA, gridB?)` (rows `{ distance, <chan>_a, <chan>_b }`; omit `_b` when no B), `decodeDrs(v)` (`1` if v ∈ {10,12,14} else `0`), `formatLapTime(seconds)` (`"m:ss.mmm"`)
- [X] T002 [P] Extend `src/services/api/openf1.js` — factor the rate-limited fetch into `fetchOpenF1Url(url)` (keep `fetchOpenF1(endpoint, params)` delegating to it); add `carDataLap({ session_key, driver_number, date_gte, date_lt })` that builds `/car_data?session_key&driver_number&date>=…&date<…` with operators percent-encoded (`%3E`/`%3C`) and each timestamp `encodeURIComponent`-ed (so the `+00:00` offset survives), routed through `fetchOpenF1Url`
- [X] T003 Add `useCarDataLap(params, options)` to `src/hooks/useOpenF1.js` (and export) — `queryKey: ["car_data_lap", params]`, `queryFn: () => openF1Api.carDataLap(params)`, long `staleTime`, `enabled: Boolean(session_key && driver_number && date_gte && date_lt)` merged with options — depends on T002
- [X] T004 [P] Create `src/components/tabs/telemetry/channels.js` — export `CHANNELS` (speed/throttle/brake/gear/rpm/drs with `{ key, label, unit, lineType, domain }` per data-model) and `DRIVER_COLORS = ["#3FC1C9", "#FB8C00"]`
- [X] T005 Add `useTelemetryComparison(sessionKey, driverNumbers)` to `src/hooks/useOpenF1.js` (and export) — two fixed slots (A/B); per slot `useLaps` → fastest valid lap (min `lap_duration`, exclude `is_pit_out_lap`/null) then `useCarDataLap` for the lap window; `useMemo` pipeline `deriveDistance`→`resampleToGrid`→`mergeDrivers`; build `DriverMeta[]` (name via `useDrivers({session_key})`, color by slot, `lapTime`, `topSpeed`=max speed); return `{ chartData, drivers, isLoading, statusBySlot }` (`empty`/`no-lap`/`no-telemetry`/`ok`) — depends on T001, T003

**Checkpoint**: `useTelemetryComparison` returns aligned `chartData` + driver meta for 1 or 2 drivers; only fastest-lap car_data is fetched.

---

## Phase 3: User Story 1 — Single-driver telemetry (Priority: P1) 🎯 MVP

**Goal**: Pick Event → Session → a driver and see that driver's fastest-lap telemetry as six charts plus lap time and top speed, with loading/empty/no-lap states.

**Independent Test**: Select season, event, session, one driver → six channel charts render the driver's fastest-lap traces over distance; summary shows fastest lap time + top speed; incomplete selection shows a prompt.

- [X] T006 [P] [US1] Create `src/components/tabs/telemetry/TelemetryChart.jsx` + `TelemetryChart.module.scss` — `ResponsiveContainer`(~170px) > Recharts `LineChart data={data}`; `XAxis dataKey="distance"`, channel `YAxis` (domain from config), subtle `CartesianGrid`, `Tooltip`; render one `<Line>` **per driver in `drivers`** (`dataKey={`${channel.key}_${slot}`}` with `gear`→`gear_a`/`gear_b`), `stroke={driver.color}`, `dot={false}`, `isAnimationActive={false}`, `type` = `stepAfter` for brake/gear/drs else `monotone`; title `Text` (label + unit). (No `syncId` yet — added in US3.) Depends on T004
- [X] T007 [P] [US1] Create `src/components/tabs/telemetry/DriverSummary.jsx` + `DriverSummary.module.scss` — `FlexLayout` of one Salt `Card`/chip per `DriverMeta`: name in `driver.color`, `formatLapTime(lapTime)`, `topSpeed` km/h
- [X] T008 [US1] Create `src/components/tabs/telemetry/TelemetryCharts.jsx` + `TelemetryCharts.module.scss` — vertical `StackLayout` rendering one `TelemetryChart` per `CHANNELS` entry, passing `data={chartData}` and `drivers`; accepts `{ chartData, drivers }` — depends on T006, T004
- [X] T009 [P] [US1] Create `src/components/tabs/telemetry/TelemetryControls.jsx` + `TelemetryControls.module.scss` — three Salt `Dropdown`s in `FormField`/`FormFieldLabel` via `FlexLayout`: Event, Session (disabled until event), Drivers (`multiselect`, controlled `selected`, disabled until session; `onSelectionChange` **caps at 2** — ignore a change exceeding two); props `{ events, sessions, drivers, meetingKey, sessionKey, driverNumbers, onEventChange, onSessionChange, onDriversChange }`
- [X] T010 [US1] Create `src/components/dashboard/TelemetryPage.jsx` + `TelemetryPage.module.scss` — read `{ year }` from `useOutletContext()`; local state `meetingKey`/`sessionKey`/`driverNumbers` with cascade resets; options from `useRaceCalendar(year)`, `useSessions({meeting_key})`, `useDrivers({session_key})`; call `useTelemetryComparison(sessionKey, driverNumbers)`; render `<Text styleAs="h2">Telemetry</Text>`, `<TelemetryControls/>`, then `<DriverSummary/>` + `<TelemetryCharts/>`; states — incomplete selection prompt, `<CircularProgress/>` while loading, per-driver `no-lap`/`no-telemetry` messages from `statusBySlot` — depends on T005, T007, T008, T009
- [X] T011 [US1] Wire routing in `src/App.jsx` (import `TelemetryPage`; add `<Route path="telemetry" element={<TelemetryPage />} />` inside the `DashboardLayout` route) and enable the nav item in `src/components/dashboard/Sidebar/Sidebar.jsx` (remove `disabled: true` from the Telemetry entry) — depends on T010

**Checkpoint**: `/telemetry` reachable from the sidebar; selecting one driver renders all six charts + summary. MVP done.

---

## Phase 4: User Story 2 — Two-driver comparison (Priority: P2)

**Goal**: Selecting a second driver overlays both drivers on every chart, visually distinct, with a shared legend and both summary chips — making all metrics directly comparable on one distance axis.

**Independent Test**: With an event/session chosen, select two drivers → every chart shows two color-distinct traces sharing one distance axis, a legend identifies each driver, and both summary chips appear; a third pick is rejected.

- [X] T012 [US2] Add a shared legend to `src/components/tabs/telemetry/TelemetryCharts.jsx` — a row of driver chips (name + `driver.color` swatch) above the chart stack, rendered from `drivers` — depends on T008
- [X] T013 [US2] Two-driver polish in `src/components/tabs/telemetry/TelemetryChart.jsx` and `DriverSummary.jsx` — confirm the second driver's `<Line>` (`_b`, color B) renders distinctly and overlapping traces stay readable (consistent stroke width, no fill); confirm both summary chips show; verify the max-2 cap from T009 holds — depends on T006, T007

**Checkpoint**: One and two drivers both render correctly; comparison is first-class and aligned.

---

## Phase 5: User Story 3 — Synchronized inspection (Priority: P3)

**Goal**: Hovering any chart marks the same lap distance on all six and shows each driver's value there.

**Independent Test**: Hover at a distance on one chart → all charts show a cursor at that distance with per-driver tooltips.

- [X] T014 [US3] Add `syncId="telemetry"` to every `LineChart` in `src/components/tabs/telemetry/TelemetryChart.jsx` and ensure a shared `Tooltip`/cursor so hovering one chart links the cursor across all six — depends on T006

**Checkpoint**: Linked cursor + tooltips across the whole stack.

---

## Phase 6: Polish & Verification

- [X] T015 [P] Update root `plan.md` — mark `/sessions/:key/telemetry` → standalone `/telemetry` built (chart-based 2-driver fastest-lap comparison), note Recharts now in use, and update the Phase 2 / current-state snapshot
- [X] T016 Run `npm run build` and lint the new/changed files (`npx eslint src/components/tabs/telemetry src/components/dashboard/TelemetryPage.jsx src/hooks/useOpenF1.js src/utils/telemetry.js src/services/api/openf1.js`) — confirm no errors/warnings
- [ ] T017 Execute the 9 scenarios in `specs/007-telemetry-comparison/quickstart.md` in the browser (single driver, two-driver overlay, max-2 cap, linked cursor, fastest-lap correctness, session types, cascade resets, no-timed-lap, incomplete/unavailable) and confirm the Network tab shows only ranged car_data (~300 rows), not whole-session

---

## Phase 7: Lap selection (added post-implementation)

**Goal**: A 4th "Lap" dropdown — "Fastest lap" (default) + numbered laps, one shared lap number for both drivers — so a specific lap can be compared, not only the fastest (spec FR-007 / FR-015).

- [X] T018 In `src/hooks/useOpenF1.js`, give `useDriverLapTelemetry` a `lapNumber` arg (null → fastest, else the lap with that number), thread it through `useTelemetryComparison(sessionKey, driverNumbers, lapNumber)`, and return `lapNumbers` (union of both drivers' timed laps)
- [X] T019 In `src/components/dashboard/TelemetryPage.jsx`, add `lapNumber` state + `onLapChange` (maps `"fastest"` → null) + cascade resets (event/session reset lap), build `lapOptions` from `lapNumbers`, pass to the hook and controls
- [X] T020 In `src/components/tabs/telemetry/TelemetryControls.jsx`, add the controlled **Lap** `Dropdown` (disabled until laps exist)
- [X] T021 Update spec.md (FR-002/FR-007/FR-015, US1, assumptions, scope, entities), plan.md, data-model.md, contracts/components.md for the lap selector

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup**: none.
- **Foundational (Phase 2)**: T001/T002/T004 parallel; T003←T002; T005←T001,T003. Blocks Phase 3+.
- **US1 (Phase 3)**: needs the foundational engine. MVP.
- **US2 (Phase 4)**: needs US1's chart/summary/controls + page (T006–T010).
- **US3 (Phase 5)**: needs US1's chart (T006).
- **Polish (Phase 6)**: after the stories you ship.

### Task-Level Dependencies

- T003←T002 · T005←T001,T003
- T006←T004 · T008←T006,T004 · T010←T005,T007,T008,T009 · T011←T010
- T012←T008 · T013←T006,T007 · T014←T006
- **Same-file note**: T003 and T005 both edit `src/hooks/useOpenF1.js` (sequential). T006 is edited again by T013 and T014 (US1 → US2 → US3 order). T008 is edited again by T012.

### Parallel Opportunities

```text
# Phase 2 — different files
T001  utils/telemetry.js
T002  services/api/openf1.js
T004  tabs/telemetry/channels.js

# Phase 3 (US1) — different files
T006  TelemetryChart
T007  DriverSummary
T009  TelemetryControls
```

---

## Implementation Strategy

### MVP First (US1)

1. Foundational T001–T005 (engine).
2. US1 T006–T011 (single-driver charts + page + nav).
3. **STOP and VALIDATE**: open `/telemetry`, pick event/session/one driver → six charts render. Demoable MVP.

### Incremental Delivery

1. Foundational → US1 (single-driver MVP) → validate.
2. US2 (overlay + legend) → validate two-driver comparison.
3. US3 (linked cursor) → validate synchronized hover.
4. Polish: update root plan.md, build + lint, run quickstart.

---

## Notes

- No new dependencies; no new endpoints beyond the **ranged** `carDataLap` (keeps each driver's fetch to ~300 rows — never whole-session). All fetches pass the existing rate limiter and persist to cache.
- The only non-trivial logic lives in the pure `utils/telemetry.js` (distance + resampling); components stay declarative and config-driven via `CHANNELS`.
- `gear`/`drs` must resample nearest-sample (no fractional gears); `drs` is decoded to 0/1.
- `TelemetryChart` is intentionally written to render one `<Line>` per driver present, so US2 is mostly legend + polish rather than rework.
- Commit after each task or logical group.
