# Implementation Plan: Telemetry Comparison

**Branch**: `007-telemetry-comparison` | **Date**: 2026-06-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-telemetry-comparison/spec.md`

## Summary

A standalone, chart-based `/telemetry` page. A control bar of three Salt dropdowns — **Event**, **Session**, **Drivers (max 2)** — sits on top; below it, per-driver summary chips (fastest lap time, top speed) and a vertical stack of six telemetry charts (speed, throttle, brake, gear, RPM, DRS). Each driver's **fastest lap of the chosen session** is fetched, distance is derived from speed, both laps are resampled onto a shared distance grid, and the charts overlay both drivers on a common x-axis with a linked hover cursor (Recharts `syncId`). Charts are clean dark-theme line charts in a two-color comparison palette.

Data is verified-available (live API probing in the spec phase). Telemetry volume is small — fastest-lap only, ~300 samples/driver — so the page fetches a handful of small, rate-limited, cacheable requests, never whole-session car_data.

## Technical Context

**Language/Version**: JavaScript (ES2022), React 19

**Primary Dependencies**: React Router 7, TanStack Query v5, **Recharts 3.8** (charts — first use in the project), Salt DS `@salt-ds/core` 1.54 (`Dropdown` multiselect, `FormField`, `FlexLayout`/`StackLayout`/`GridLayout`, `Card`, `Text`/`H3`, `CircularProgress`), SCSS Modules. No new dependencies (Recharts already installed).

**Storage**: N/A — OpenF1 fetched on demand, cached by TanStack Query, persisted to localStorage (existing infra). Fastest-lap car_data is small enough to persist safely.

**Testing**: Manual browser verification against `quickstart.md`.

**Target Platform**: Desktop + mobile responsive web, dark theme.

**Project Type**: Single-page web app (Vite + React).

**Performance Goals**: Charts appear < ~3s after selection (SC-001); selection changes repaint with no stale traces (SC-006).

**Constraints**: OpenF1 free tier (3 req/sec, 30 req/min) — handled by the existing rate limiter. The page must fetch **only each driver's fastest-lap car_data via a date-range filter** (~300 rows), never the whole session (~22k rows).

**Scale/Scope**: 1 new route, 1 page, ~5 components, 1 composite hook + 1 small data hook, 1 pure telemetry util, 1 API-layer extension (ranged car_data).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Article | Gate | Status |
|---|---|---|
| I. Spec-First | spec reviewed before code | ✅ spec.md + passing checklist |
| II. API-First | response shapes verified, not assumed | ✅ Probed live 2024 + 2025 sessions: `/meetings`, `/sessions`, `/drivers`, `/laps` (fastest lap, sector + speed fields), `/car_data` (speed, throttle, brake, n_gear, rpm, drs; ~3.8 Hz). Fields and volumes confirmed. |
| III. Component Isolation | self-contained folder, own hook, own styles | ✅ New `tabs/telemetry/` folder; composite hook in `useOpenF1.js` (codebase convention); per-component SCSS; pure math in `utils/telemetry.js`. |
| IV. Data Layer Discipline | all via the data layer; `staleTime`; no duplicate/oversized calls | ✅ Reuses `useRaceCalendar`/`useSessions`/`useDrivers`/`useLaps`; new ranged `useCarDataLap` fetches only the fastest-lap window; all routed through the rate limiter. |
| V. Clean Code | no premature abstraction, no dead code, DRY | ✅ One channel-config array drives all six charts; distance/resample logic lives once in a pure util. |
| VI. UI Consistency | Salt DS first; dark theme | ✅ Salt for every control/layout/surface. Recharts only for the charts — Salt has no charting component, and Recharts is the plan.md-sanctioned chart library. Documented as a Rule-3 new library in research. |
| VII. Learning | decisions explainable; new-library model documented | ✅ research.md walks through Recharts' mental model and the distance-derivation + resampling algorithm. |

**Result**: PASS — no violations. Complexity Tracking empty.

## Project Structure

### Documentation (this feature)

```text
specs/007-telemetry-comparison/
├── plan.md          # This file
├── spec.md          # Feature spec
├── research.md      # Phase 0
├── data-model.md    # Phase 1
├── quickstart.md    # Phase 1
├── contracts/
│   └── components.md # Phase 1
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── services/api/openf1.js                # MODIFY: factor fetch into fetchOpenF1Url; add carDataLap (date-range filtered)
├── hooks/useOpenF1.js                     # MODIFY: add useCarDataLap + useTelemetryComparison; export both
├── utils/telemetry.js                     # NEW: deriveDistance, resampleToGrid, mergeDrivers, decodeDrs, formatLapTime
├── components/
│   ├── dashboard/
│   │   ├── TelemetryPage.jsx              # NEW: page orchestrator (selection state + layout)
│   │   └── TelemetryPage.module.scss      # NEW
│   └── tabs/telemetry/                    # NEW folder
│       ├── TelemetryControls.jsx          # NEW: Event + Session + Drivers(max 2) Salt dropdowns
│       ├── TelemetryControls.module.scss
│       ├── DriverSummary.jsx              # NEW: color-coded chips (name, fastest lap, top speed)
│       ├── DriverSummary.module.scss
│       ├── TelemetryCharts.jsx            # NEW: maps CHANNELS -> TelemetryChart (vertical stack)
│       ├── TelemetryChart.jsx             # NEW: one Recharts LineChart (syncId, 1-2 Lines)
│       ├── TelemetryChart.module.scss
│       └── channels.js                    # NEW: CHANNELS config + DRIVER_COLORS palette
├── App.jsx                                # MODIFY: add <Route path="telemetry" element={<TelemetryPage />} />
└── components/dashboard/Sidebar/Sidebar.jsx   # MODIFY: remove disabled:true from the Telemetry item
```

**Structure Decision**: Single-project Vite/React app. Page in `components/dashboard/` (alongside the other pages); presentational pieces in a self-contained `components/tabs/telemetry/` folder (mirrors `tabs/overview`, `tabs/session-detail`). Composite data hook in the shared `hooks/useOpenF1.js`; the distance/resampling math in a framework-free `utils/telemetry.js` so it's trivially reasoned about and reusable by the future track-map/heatmap work.

## Architecture & Data Flow

### Selection state (in `TelemetryPage`)

- `year` from `useOutletContext()` (navbar). Local state: `meetingKey`, `sessionKey`, `driverNumbers` (array, ≤2), `lapNumber` (`null` = fastest).
- Cascade resets: changing **year** remounts the view (key) so all clears; changing **event** clears session + drivers + lap; changing **session** clears drivers + lap. Changing drivers keeps the lap (per-driver status covers a lap a driver doesn't have).
- (Local component state, not URL — simplest correct MVP; URL-shareable selection is a noted future enhancement.)

### Selector data (reused hooks)

- **Event** options ← `useRaceCalendar(year)` (meetings, testing excluded, with round).
- **Session** options ← `useSessions({ meeting_key })`, enabled once an event is picked; sorted by `date_start`.
- **Driver** options ← `useDrivers({ session_key })`, enabled once a session is picked.

### Telemetry composition (`useTelemetryComparison(sessionKey, driverNumbers)`)

Signature: `useTelemetryComparison(sessionKey, driverNumbers, lapNumber)`. Two **fixed slots** (A = `driverNumbers[0]`, B = `driverNumbers[1]`) so hook count is constant regardless of 1 vs 2 drivers. Per slot, gated by `enabled`:

1. `useLaps({ session_key, driver_number })` → the **selected lap**: when `lapNumber` is `null`, the fastest valid lap (min `lap_duration`, excluding `is_pit_out_lap`); otherwise the lap with that `lap_number`.
2. `useCarDataLap({ session_key, driver_number, date_gte: lap.date_start, date_lt: lap.date_start + lap_duration })` → ~300 telemetry samples for just that lap (enabled once the lap is known).

The hook also returns `lapNumbers` — the union of both drivers' timed lap numbers — for the Lap dropdown.

Then a `useMemo` pipeline (pure `utils/telemetry.js`):
1. `deriveDistance(samples)` per driver — cumulative ∫ speed·dt.
2. `resampleToGrid(...)` — interpolate each channel onto a shared, normalized distance grid (so the same track position maps to the same x for both drivers — FR-009).
3. `mergeDrivers(a, b)` → `chartData`: rows `{ distance, speed_a, speed_b, throttle_a, … , drs_a, drs_b }`.
4. Per-driver meta: `{ driver_number, name, color, lapTime, topSpeed }` (topSpeed = max sample speed; lapTime from `lap_duration`).

Returns `{ chartData, drivers, isLoading, statusBySlot }` where `statusBySlot` distinguishes "no timed lap" / "no telemetry" per driver (FR-013, edge cases).

### Rendering

- **`TelemetryControls`** — four Salt `Dropdown`s wrapped in `FormField`/`FormFieldLabel`: Event, Session, Drivers, Lap. Each is fully controlled via `selected` + `value` (button text) + `onSelectionChange`. Drivers is `multiselect` and **caps at 2** (ignores a 3rd pick). Lap offers "Fastest lap" + numbered laps (the `"fastest"` sentinel maps to `lapNumber = null`). Each dropdown is disabled until its prerequisite is chosen.
- **`DriverSummary`** — a color-coded chip/card per selected driver: name (in the driver's color), fastest lap time (`m:ss.mmm`), top speed.
- **`TelemetryCharts`** — maps the `CHANNELS` config to a vertical stack of `TelemetryChart`s (vertical stack so all share the distance x-axis and read like a telemetry trace stack). One shared legend (driver A/B chips) at the top.
- **`TelemetryChart`** — a Recharts `ResponsiveContainer`>`LineChart` with `syncId="telemetry"` (links the hover cursor across all six → US3), `XAxis dataKey="distance"`, a channel-specific `YAxis`, subtle `CartesianGrid`, `Tooltip`, and one `Line` per present driver (`<channel>_a` / `<channel>_b`) in the driver colors. Brake/gear/DRS render as stepped lines; speed/throttle/rpm as plain lines. No heavy animation/gradients ("clean, not glittery").

### API extension (ranged car_data)

`openf1.js`: factor the fetch into `fetchOpenF1Url(url)` (keeps the rate-limiter + ok-check), keep `fetchOpenF1(endpoint, params)` calling it. Add `carDataLap({ session_key, driver_number, date_gte, date_lt })` that builds `/car_data?session_key&driver_number&date>=…&date<…` with the operators percent-encoded (`%3E`,`%3C`) and the timestamp value `encodeURIComponent`-ed (so the `+00:00` offset survives), then routes through `fetchOpenF1Url`. This is the **only** way to keep the fetch to ~300 rows instead of the whole session.

### Routing & nav

- `App.jsx`: `<Route path="telemetry" element={<TelemetryPage />} />` inside the `DashboardLayout` route.
- `Sidebar.jsx`: drop `disabled: true` from the Telemetry item (it already preserves `?year=`).

## Complexity Tracking

> No constitution violations — section intentionally empty.
