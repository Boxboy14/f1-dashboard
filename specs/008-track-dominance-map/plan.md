# Implementation Plan: Track Dominance Map

**Branch**: `008-track-dominance-map` | **Date**: 2026-06-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-track-dominance-map/spec.md`

## Summary

Add a track map below the driver summary on the Telemetry page. It draws the selected circuit's outline from the chosen lap's car-position data, and — when two drivers are compared — colors ~24 equal-length minisectors by the faster driver (dominance). With one driver, the outline is shaded by that driver's speed. The map is a custom **responsive, aspect-ratio-preserving SVG** (`viewBox` + `preserveAspectRatio`).

The hard alignment work already exists from feature 007: `useTelemetryComparison` produces `chartData` — a 400-point grid where index `i` is the same lap-fraction for both drivers, carrying `speed_a`/`speed_b`. The map adds one ranged `/location` fetch for driver A's lap, resamples its `(x,y)` onto that **same grid**, and reads dominance straight off the existing speed columns. No new dependency.

## Technical Context

**Language/Version**: JavaScript (ES2022), React 19

**Primary Dependencies**: React Router 7, TanStack Query v5, Salt DS `@salt-ds/core` 1.54 (heading, legend chips, layout, loading/empty states), SCSS Modules. The map itself is hand-rolled SVG (no chart/UI library draws an arbitrary circuit outline). No new dependencies.

**Storage**: N/A — OpenF1 fetched on demand, cached by TanStack Query, persisted to localStorage (existing infra). One lap's position data is small and persist-safe.

**Testing**: Manual browser verification against `quickstart.md`.

**Target Platform**: Desktop + mobile responsive web, dark theme. The map MUST scale to the container and preserve the circuit's proportions (user constraint).

**Project Type**: Single-page web app (Vite + React).

**Performance Goals**: Map appears < ~3s after a complete selection (SC-006); selection changes recompute with no stale figure (SC-005).

**Constraints**: OpenF1 free tier (3 req/sec, 30 req/min) — handled by the existing rate limiter. The map adds **one** ranged `/location` fetch (~277 rows) for driver A's lap; never whole-session position data.

**Scale/Scope**: 1 new component (+scss), 1 new ranged API method + hook, ~4 new pure helpers in `telemetry.js`, extend one hook's return, wire into one page. No new route.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Article | Gate | Status |
|---|---|---|
| I. Spec-First | spec reviewed before code | ✅ spec.md + passing checklist |
| II. API-First | response shapes verified, not assumed | ✅ `/location` ranged fetch probed live earlier this session (returns `x,y,z,date`, ~277 pts/lap). `chartData` shape is the existing 007 output. |
| III. Component Isolation | self-contained, own hook/styles | ✅ `TrackMap` in `tabs/telemetry/`; data via the existing `useTelemetryComparison`; pure geometry in `utils/telemetry.js`. |
| IV. Data Layer Discipline | all via data layer; `staleTime`; no oversized calls | ✅ New ranged `useLocationLap` (one lap window, rate-limited, persisted); reuses the existing 400-pt grid — no recompute, no whole-session fetch. |
| V. Clean Code | DRY, no dead code | ✅ The ranged-URL builder is generalized and shared by `carDataLap` + `locationLap`; dominance reads the existing `chartData` rather than refetching/recomputing speed. |
| VI. UI Consistency | Salt DS first | ✅ Salt for heading, legend chips, layout, loading/empty. The **track outline is custom SVG** — neither Salt nor Recharts can draw an arbitrary circuit; plan.md always specified "custom SVG" for the track map. Documented in research. |
| VII. Learning | decisions explainable; new mental models documented | ✅ research.md explains the `viewBox`/`preserveAspectRatio` responsiveness model and the resample-onto-the-shared-grid alignment trick. |

**Result**: PASS — no violations. Complexity Tracking empty.

## Project Structure

### Documentation (this feature)

```text
specs/008-track-dominance-map/
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
├── services/api/openf1.js            # MODIFY: generalize the ranged-URL builder; add carDataLap+locationLap on it
├── hooks/useOpenF1.js                # MODIFY: add useLocationLap; extend useTelemetryComparison to return `trackMap`
├── utils/telemetry.js                # MODIFY: deriveTrackDistance, resampleTrack, buildDominance, buildSpeedShade
├── components/
│   ├── dashboard/TelemetryPage.jsx   # MODIFY: render <TrackMap> below <DriverSummary>
│   └── tabs/telemetry/
│       ├── TrackMap.jsx              # NEW: responsive aspect-preserving SVG outline + dominance/speed coloring + legend
│       └── TrackMap.module.scss      # NEW
```

**Structure Decision**: Single-project Vite/React app. The map is a self-contained component in the existing `tabs/telemetry/` folder; its geometry math lives in the framework-free `utils/telemetry.js` (alongside the existing distance/resample helpers it reuses); its data is produced by the existing `useTelemetryComparison` so charts and map stay in sync on one selection.

## Architecture & Data Flow

### Data: extend `useTelemetryComparison` to return `trackMap`

The hook already computes, per slot, the selected lap (`a.lap`/`b.lap`) and `chartData` (the 400-pt grid with `speed_a`/`speed_b`). Add:

1. Pick the **outline driver** — slot A if it has data, else slot B. Fetch its lap's position trace via `useLocationLap({ session_key, driver_number, date_gte: lap.date_start, date_lt: lap end })` (ranged, ~277 rows).
2. In a `useMemo`: `deriveTrackDistance(location)` (cumulative arc-length from `(x,y)`) → `resampleTrack(..., 400)` to put `(x,y)` on the **same grid** as `chartData` (index `i` = same lap fraction).
3. **Mode**: two `ok` drivers → `dominance`; one → `speed`; none/no-position → `null`/`no-data`.
4. **Dominance**: `buildDominance(chartData, MINISECTORS=24)` → for each of 24 contiguous equal-index ranges, sum `speed_a` vs `speed_b`; winner's `slot` is assigned to every point in that range → a per-point `faster` array (smoothed by minisector, so colors don't flicker).
5. **Speed shade**: `buildSpeedShade(chartData, suffix)` → per-point speed normalized 0..1 (min..max) for the single present driver.

Return `trackMap = { points: [{x,y}], faster: number[]|null, speed: number[]|null, mode, status, outlineSlot }`. (Raw track coords — the component owns scaling, so presentation stays in the view.)

### Presentation: `TrackMap` (responsive, aspect-preserving SVG)

- Compute the bounding box of `points`, build a `viewBox="minX minY width height"` (with a small padding). **Flip Y** (SVG y grows downward; position-data y grows upward) so the circuit isn't mirrored.
- `<svg viewBox=… preserveAspectRatio="xMidYMid meet" width="100%">` inside a max-width wrapper → it **scales to the container** (responsive) and **keeps the track's proportions** (aspect-ratio preserved) on any screen — directly satisfying the user's constraint. `vectorEffect="non-scaling-stroke"` keeps the line a constant pixel thickness at every size.
- **Dominance mode**: walk `points`, grouping consecutive same-`faster` points into `<polyline>`s (~24, one per minisector), each stroked in `DRIVER_COLORS[faster]`. Render a Salt legend (driver chips).
- **Speed mode**: draw the outline as short segments, each colored from a single-hue brightness ramp keyed by `speed[i]` (bright = fast).
- States: loading → Salt `CircularProgress`/skeleton; `no-data` → "Track map unavailable" `Text`.

### API + hooks

- `openf1.js`: generalize `carDataLapUrl` into `rangedLapUrl(endpoint, params)` (operator-encoded `date>=`/`date<`, `encodeURIComponent` timestamps); `carData` and `location` lap fetches both use it. Add `locationLap` to `openF1Api`.
- `useOpenF1.js`: `useLocationLap(params, options)` mirrors `useCarDataLap` (long `staleTime`, enabled on all params). `useTelemetryComparison` gains the location fetch + `trackMap` memo.

### Page wiring

`TelemetryPage` renders `<TrackMap trackMap={trackMap} drivers={telemetryDrivers} />` immediately below `<DriverSummary>` (and above the charts, or below — below the summary per the spec). No route changes.

## Complexity Tracking

> No constitution violations — section intentionally empty.
