# Contracts: Track Dominance Map

Props/return shapes and responsibilities each unit must honor. Reuses feature 007's `useTelemetryComparison` and `chartData`.

---

## API layer: `src/services/api/openf1.js`

**Refactor**: generalize the ranged URL builder so `car_data` and `location` share it:
```text
rangedLapUrl(endpoint, { session_key, driver_number, date_gte, date_lt })
  -> `${BASE_URL}/${endpoint}?session_key=…&driver_number=…&date%3E=…&date%3C…`
     (operators percent-encoded; date_gte/date_lt encodeURIComponent-ed)
```
`carDataLap` is reimplemented on it; **add** `locationLap(params) => fetchOpenF1Url(rangedLapUrl("location", params))`.

---

## Hook: `useLocationLap(params, options)`

**Location**: `src/hooks/useOpenF1.js`
**Contract**: `queryKey: ["location_lap", params]`; `queryFn: () => openF1Api.locationLap(params)`; long `staleTime`; `enabled: Boolean(session_key && driver_number && date_gte && date_lt)` merged with `options`. Mirrors `useCarDataLap`.

---

## Hook: `useTelemetryComparison(sessionKey, driverNumbers, lapNumber)` — extended

**Adds to its return**: `trackMap: TrackMap | null` (see data-model).

**New responsibilities**:
- Choose the outline driver: slot A if `a.lap` + `a.samples` exist, else slot B.
- `useLocationLap({ session_key, driver_number: outlineDriver, date_gte: lap.date_start, date_lt: lapEnd })`.
- `useMemo`: `deriveTrackDistance` → `resampleTrack(…, 400)` → `points`; `mode` from how many slots are `ok`; `buildDominance(chartData, 24)` → `faster` (dominance) or `buildSpeedShade(chartData, suffix)` → `speed`; `status` `no-data` when the location trace is empty/too short.

**Must not**: fetch whole-session `/location`; recompute speed (reads existing `chartData`).

---

## Util: `src/utils/telemetry.js` (additions)

`deriveTrackDistance(location)`, `resampleTrack(withDist, points)`, `buildDominance(chartData, minisectorCount)`, `buildSpeedShade(chartData, suffix)` — signatures per data-model. Pure, no React, no DOM.

---

## Component: `TrackMap`

**Location**: `src/components/tabs/telemetry/TrackMap.jsx`
**Props**: `{ trackMap: TrackMap | null, drivers: DriverMeta[] }`

**Renders**:
- Nothing/`null` guard when `!trackMap`.
- `trackMap.status === "no-data"` → Salt `Text` "Track map unavailable".
- Otherwise an `<svg viewBox={bbox} preserveAspectRatio="xMidYMid meet" width="100%">` (inside a `max-width` wrapper):
  - Compute bbox from `points` (+ padding); **flip Y**.
  - **dominance**: group consecutive points by `faster[i]` → one `<polyline>` per minisector, `stroke={DRIVER_COLORS[slot]}`, `vectorEffect="non-scaling-stroke"`, rounded caps/joins; render a legend (driver chips, same colors as charts).
  - **speed**: per-segment `<line>`/short polylines colored from a brightness ramp keyed by `speed[i]`.
- A small heading (Salt `Text styleAs="h3"` e.g. "Track dominance" / "Speed map").

**Responsibilities**: presentation only — scaling, Y-flip, segment grouping, legend. No fetching, no data math.

**Accessibility/quality**: aspect ratio preserved by `preserveAspectRatio`; responsive via `width:100%` + `viewBox`; constant line weight via non-scaling stroke.

---

## Page wiring: `src/components/dashboard/TelemetryPage.jsx`

Destructure `trackMap` from `useTelemetryComparison` and render `<TrackMap trackMap={trackMap} drivers={telemetryDrivers} />` immediately **below** `<DriverSummary>` (above the charts). No route or sidebar changes.
