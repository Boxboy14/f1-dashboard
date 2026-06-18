# Data Model: Track Dominance Map

Derived view models produced inside `useTelemetryComparison`/`useMemo` and the pure helpers in `utils/telemetry.js`. Nothing persisted by the feature (beyond the existing query cache). Raw field names are confirmed against the live API.

---

## Raw input: `LocationSample` (from `/location`, internal)

| Field | Type | Source | Notes |
|---|---|---|---|
| `date` | ISO string | `location.date` | Ordering |
| `x` | number | `location.x` | Track-frame coordinate (metres) |
| `y` | number | `location.y` | Track-frame coordinate (metres) |

(`z` exists — elevation — and is ignored for the 2D map.) ~277 samples per lap at ~3.9 Hz.

---

## Entity: `TrackMap` (returned by `useTelemetryComparison`)

The single object the `TrackMap` component renders.

| Field | Type | Notes |
|---|---|---|
| `points` | `{ x, y }[]` | The outline, resampled onto the **shared 400-point grid** from the outline driver's `/location`. Raw track coords (component scales). |
| `mode` | `"dominance" \| "speed" \| null` | Two ok drivers → dominance; one → speed; otherwise null |
| `faster` | `number[] \| null` | Per-point driver **slot** (0/1) that dominates that point's minisector (dominance mode) |
| `speed` | `number[] \| null` | Per-point speed normalized 0..1 across the lap (speed mode) |
| `outlineSlot` | number | Which slot's lap the outline came from (for fallback messaging/colors) |
| `status` | `"ok" \| "no-data"` | `no-data` when the lap has no usable position trace |

`points`, `faster`/`speed` are all length 400 and **index-aligned** (point `i` ↔ `chartData[i].speed_a/_b`).

---

## Entity: `Minisector` (internal to `buildDominance`)

| Field | Type | Notes |
|---|---|---|
| `startIndex` | number | First grid index of the range |
| `endIndex` | number | Last grid index (exclusive) |
| `winnerSlot` | 0 \| 1 | Driver with the higher summed speed over the range |

24 equal-index ranges over the 400-point grid. Each writes its `winnerSlot` to every point it covers → the `faster` array.

---

## Pure helpers (`utils/telemetry.js`)

```text
deriveTrackDistance(locationSamples) -> samples + cumulative `distance`
  dist[0]=0; dist[i]=dist[i-1] + hypot(x[i]-x[i-1], y[i]-y[i-1])   // straight-line arc length

resampleTrack(samplesWithDistance, points=400) -> [{ x, y }]
  even distance grid 0..total; linear-interpolate x and y onto each grid distance
  (same grid resolution as resampleToGrid, so indices line up with chartData)

buildDominance(chartData, minisectorCount=24) -> number[] (per-point winner slot) | null
  null if either speed_a or speed_b is absent; else for each of `minisectorCount`
  contiguous equal ranges: sum speed_a vs speed_b over the range, write winner slot
  (0/1) to every index in the range

buildSpeedShade(chartData, suffix) -> number[] (per-point 0..1) | null
  v = chartData[i][`speed_${suffix}`]; normalize (v - min)/(max - min) across the lap
```

All pure, framework-free; `deriveTrackDistance`/`resampleTrack` sit beside the existing `deriveDistance`/`resampleToGrid` they parallel.

---

## Presentation-derived (inside `TrackMap` component, not the model)

- **Bounding box + viewBox**: `minX/minY/width/height` of `points` (+ padding) → SVG `viewBox`.
- **Y-flip**: `svgY = (minY + maxY) - y` so the circuit isn't vertically mirrored.
- **Segments**: consecutive `points` grouped by equal `faster[i]` → one `<polyline>` per minisector (dominance), or short per-segment colored lines keyed by `speed[i]` (speed mode).

These are scaling/orientation concerns and live in the component, keeping the data model in track coordinates.
