---
description: "Task list for Track Dominance Map"
---

# Tasks: Track Dominance Map

**Input**: Design documents from `specs/008-track-dominance-map/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/components.md ✅ · quickstart.md ✅

**Tests**: None requested — project convention is manual browser verification (quickstart.md). Implementation tasks only.

**Organization**: Grouped by user story (US1 outline → US2 dominance → US3 single-driver speed map). Builds on feature 007's `useTelemetryComparison` + `chartData`.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1]** circuit outline (P1) · **[US2]** two-driver dominance (P2) · **[US3]** single-driver speed map (P3)

---

## Phase 1: Setup

No project-level setup required. No new dependencies (the map is hand-rolled SVG). Reuses 007's ranged-fetch + 400-point grid (`chartData`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The position fetch + outline geometry every story depends on. No UI yet.

**⚠️ CRITICAL**: T002 needs T001; T003 is independent. All three precede US1.

- [X] T001 [P] In `src/services/api/openf1.js`, generalize the ranged-URL builder into `rangedLapUrl(endpoint, { session_key, driver_number, date_gte, date_lt })` (operators `date%3E=`/`date%3C`, `encodeURIComponent`-ed timestamps); reimplement `carDataLap` on it and add `locationLap(params) => fetchOpenF1Url(rangedLapUrl("location", params))` to `openF1Api`
- [X] T002 Add `useLocationLap(params, options)` to `src/hooks/useOpenF1.js` (and export) — `queryKey: ["location_lap", params]`, `queryFn: () => openF1Api.locationLap(params)`, long `staleTime`, `enabled` on all four params present — mirrors `useCarDataLap` — depends on T001
- [X] T003 [P] In `src/utils/telemetry.js`, add `deriveTrackDistance(location)` (cumulative straight-line arc length from consecutive `(x,y)`) and `resampleTrack(samplesWithDistance, points)` (linear-interpolate `x` and `y` onto an even `points`-length distance grid — same resolution as `resampleToGrid` so indices align with `chartData`)

**Checkpoint**: A lap's `/location` can be fetched and resampled into 400 grid-aligned `{x,y}` points.

---

## Phase 3: User Story 1 — Circuit outline (Priority: P1) 🎯 MVP

**Goal**: A correctly-proportioned, responsive SVG outline of the selected circuit renders below the driver summary, drawn from the selected lap's position data, with an "unavailable" state for missing data.

**Independent Test**: Select event/session/one driver → a recognisable, undistorted circuit outline appears below the driver summary and updates when the event changes; a lap with no position data shows "Track map unavailable".

- [X] T004 [US1] Extend `useTelemetryComparison` in `src/hooks/useOpenF1.js` to return `trackMap` — pick the outline driver (slot A if it has a lap+samples, else B); `useLocationLap({ session_key, driver_number, date_gte: lap.date_start, date_lt: lapEnd })`; in a `useMemo`, `deriveTrackDistance` → `resampleTrack(…, 400)` → `points`; set `status` ("ok"/"no-data" when the trace is empty/too short), `outlineSlot`, and `mode` ("outline" for now); return `{ points, mode, faster: null, speed: null, outlineSlot, status }` — depends on T002, T003
- [X] T005 [P] [US1] Create `src/components/tabs/telemetry/TrackMap.jsx` + `TrackMap.module.scss` — accepts `{ trackMap, drivers }`; null guard; `no-data` → Salt `Text` "Track map unavailable"; otherwise compute the `points` bounding box (+padding), **flip Y**, render `<svg viewBox preserveAspectRatio="xMidYMid meet" width="100%">` inside a max-width wrapper drawing the outline as one `<polyline>` with `vectorEffect="non-scaling-stroke"`; a Salt `Text styleAs="h3"` heading
- [X] T006 [US1] Wire `<TrackMap trackMap={trackMap} drivers={telemetryDrivers} />` into `src/components/dashboard/TelemetryPage.jsx` immediately below `<DriverSummary>` (destructure `trackMap` from `useTelemetryComparison`) — depends on T004, T005

**Checkpoint**: The track outline renders responsively below the driver summary and tracks the selection.

---

## Phase 4: User Story 2 — Two-driver dominance (Priority: P2)

**Goal**: With two drivers, color ~24 equal-length minisectors by the faster driver, with a legend, consistent with the speed charts.

**Independent Test**: Select two drivers → the track is colored in the two driver colors split into ~24 minisectors with a legend; a colored region matches where that driver's speed trace is higher.

- [X] T007 [US2] Add `buildDominance(chartData, minisectorCount = 24)` to `src/utils/telemetry.js` (null if either `speed_a`/`speed_b` absent; else for each of 24 contiguous equal index ranges, sum `speed_a` vs `speed_b` and write the winner slot to every point in the range) and use it in `useTelemetryComparison`'s `trackMap` memo: when both slots are `ok`, set `mode: "dominance"` and `faster: buildDominance(chartData, 24)` — depends on T004
- [X] T008 [US2] In `src/components/tabs/telemetry/TrackMap.jsx`, render dominance mode — walk `points` grouping consecutive equal-`faster` indices into per-minisector `<polyline>`s stroked in `DRIVER_COLORS[slot]`; add a legend (driver chips, same colors as the charts) — depends on T005, T007

**Checkpoint**: Two-driver dominance map with legend; colors match the charts.

---

## Phase 5: User Story 3 — Single-driver speed map (Priority: P3)

**Goal**: With one driver, shade the outline by that driver's speed (bright = fast, dim = slow).

**Independent Test**: Select one driver → the outline is speed-shaded (slow corners dim, fast straights bright); adding a second driver switches to dominance.

- [X] T009 [US3] Add `buildSpeedShade(chartData, suffix)` to `src/utils/telemetry.js` (per-point speed normalized 0..1 across the lap for the present driver) and use it in the `trackMap` memo: when exactly one slot is `ok`, set `mode: "speed"` and `speed: buildSpeedShade(chartData, suffix)` — depends on T004
- [X] T010 [US3] In `src/components/tabs/telemetry/TrackMap.jsx`, render speed mode — draw the outline as short segments colored from a single-hue brightness ramp keyed by `speed[i]` (the present driver's color, brightness ∝ speed) — depends on T005, T009

**Checkpoint**: Solo speed map; reverts to dominance with two drivers.

---

## Phase 6: Polish & Verification

- [X] T011 [P] Update root `plan.md` — mark the track map / minisector "fastest where" heatmap built under Phase 2 visualizations; note it lives on the telemetry page (`specs/008-track-dominance-map/`)
- [X] T012 Run `npm run build` and lint the new/changed files (`npx eslint src/components/tabs/telemetry src/components/dashboard/TelemetryPage.jsx src/hooks/useOpenF1.js src/utils/telemetry.js src/services/api/openf1.js`) — confirm no errors/warnings
- [ ] T013 Execute the 7 scenarios in `specs/008-track-dominance-map/quickstart.md` (outline, dominance, color consistency, single-driver speed, **aspect ratio + responsive resize**, selection changes, no-data) and confirm the Network tab shows only one ranged `/location` request per outline driver

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup**: none.
- **Foundational (Phase 2)**: T001 ∥ T003; T002 ← T001. Blocks US1.
- **US1 (Phase 3)**: needs the foundational fetch + outline geometry. MVP.
- **US2 (Phase 4)**: needs US1's `trackMap` (T004) + component (T005).
- **US3 (Phase 5)**: needs US1's `trackMap` (T004) + component (T005). Independent of US2.
- **Polish (Phase 6)**: after the stories you ship.

### Task-Level Dependencies

- T002 ← T001 · T004 ← T002, T003 · T005 (independent, US1) · T006 ← T004, T005
- T007 ← T004 · T008 ← T005, T007
- T009 ← T004 · T010 ← T005, T009
- **Same-file note**: `telemetry.js` is edited by T003, T007, T009; `useOpenF1.js` by T002, T004, T007, T009 (the `trackMap` memo grows across US1→US2→US3); `TrackMap.jsx` by T005, T008, T010 — all sequential within each file, which falls out of the phase order.

### Parallel Opportunities

```text
# Phase 2 — different files
T001  services/api/openf1.js
T003  utils/telemetry.js

# Phase 3 (US1) — different files
T004  useOpenF1.js (trackMap)
T005  TrackMap component
```

---

## Implementation Strategy

### MVP First (US1)

1. Foundational T001–T003.
2. US1 T004–T006 (outline below the summary).
3. **STOP and VALIDATE**: open `/telemetry`, pick a lap + driver → a responsive, proportioned circuit outline appears. Demoable MVP.

### Incremental Delivery

1. Foundational → US1 (outline) → validate.
2. US2 (dominance coloring + legend) → validate against the speed chart.
3. US3 (single-driver speed shading) → validate.
4. Polish: root plan.md, build + lint, run quickstart (incl. responsive/aspect check).

---

## Notes

- No new dependencies; one extra ranged `/location` fetch (~277 rows) for the outline driver only — never whole-session position data.
- The dominance lookup is **index-aligned** with the existing `chartData` (`speed_a`/`speed_b`) because the track is resampled onto the same 400-point grid — no new alignment code.
- Aspect ratio + responsiveness come entirely from the SVG `viewBox` + `preserveAspectRatio="xMidYMid meet"` + `width:100%` + non-scaling stroke (the user's explicit constraint).
- Y must be flipped (position-data y grows up, SVG y grows down) or the circuit renders mirrored.
- Commit after each task or logical group.
