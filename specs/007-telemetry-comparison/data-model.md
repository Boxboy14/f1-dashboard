# Data Model: Telemetry Comparison

Derived view models produced from raw OpenF1 responses inside hooks/`useMemo` — nothing persisted by the feature itself. Raw field names are confirmed against the live API.

---

## Selection state (in `TelemetryPage`)

| Field | Type | Notes |
|---|---|---|
| `year` | number | From `useOutletContext()` (navbar) |
| `meetingKey` | number \| null | Selected event |
| `sessionKey` | number \| null | Selected session |
| `driverNumbers` | number[] (≤2) | Selected drivers, in pick order (A then B) |
| `lapNumber` | number \| null | Selected lap; `null` = fastest (the default) |

**Cascade rule**: year change → remount (clears all); meeting change → clear session/drivers/lap; session change → clear drivers/lap; driver change → keep lap.

---

## Selector option models

- **EventOption**: `{ meeting_key, round, label }` from `useRaceCalendar(year)` (label = `meeting_name`).
- **SessionOption**: `{ session_key, label, session_type }` from `useSessions({ meeting_key })` (label = `session_name`), sorted by `date_start`.
- **DriverOption**: `{ driver_number, label, team_name }` from `useDrivers({ session_key })` (label = `full_name`).
- **LapOption**: `{ value: "fastest" | number, label }` — built from the hook's `lapNumbers` (union of both drivers' timed laps): `"Fastest lap"` plus `"Lap N"` per number. The `"fastest"` value maps to `lapNumber = null`.

---

## Entity: `SelectedLap` (per driver, internal)

Derived from `/laps`. The basis for the telemetry window and headline lap time.

| Field | Type | Source | Notes |
|---|---|---|---|
| `lap_number` | number | `laps.lap_number` | |
| `date_start` | ISO string | `laps.date_start` | Telemetry window start |
| `lap_duration` | number (s) | `laps.lap_duration` | Window length + headline lap time |

**Rule**: among laps where `lap_duration != null` and `!is_pit_out_lap` — if `lapNumber` is `null`, take the min `lap_duration` (fastest); otherwise the lap with that `lap_number`. If none matches → that driver's slot status is `"no-lap"` (so a lap one driver didn't run degrades just that driver).

---

## Entity: `TelemetrySample` (per driver, internal)

One row from the ranged `/car_data` fetch, then enriched with derived distance.

| Field | Type | Source | Notes |
|---|---|---|---|
| `date` | ISO string | `car_data.date` | Used to compute `dt` |
| `speed` | number (km/h) | `car_data.speed` | Also feeds distance + top speed |
| `throttle` | number (0–100) | `car_data.throttle` | |
| `brake` | number (0/100) | `car_data.brake` | Effectively binary |
| `n_gear` | number (0–8) | `car_data.n_gear` | Discrete → step interpolation |
| `rpm` | number | `car_data.rpm` | |
| `drs` | number (encoded) | `car_data.drs` | Decoded to 0/1 for charting |
| `distance` | number (m) | derived | Cumulative ∫ speed·dt |

---

## Entity: `ChartRow` (merged, what charts consume)

The single shared array driving all six charts. One row per point on the common distance grid.

| Field | Type | Notes |
|---|---|---|
| `distance` | number (m) | Shared x for both drivers and all charts |
| `speed_a`,`throttle_a`,`brake_a`,`gear_a`,`rpm_a`,`drs_a` | number | Driver A's interpolated values (decoded DRS) |
| `speed_b`,… `drs_b` | number | Driver B's values — **absent when only one driver** |

`gear`/`drs` interpolated nearest-sample (no fractional gears); others linear.

---

## Entity: `DriverMeta` (per selected driver)

Drives the summary chips and the legend.

| Field | Type | Source |
|---|---|---|
| `driver_number` | number | selection |
| `name` | string | `drivers.full_name` |
| `color` | string | `DRIVER_COLORS[slot]` (A=cyan, B=orange) |
| `lapTime` | number (s) | `FastestLap.lap_duration`, formatted `m:ss.mmm` |
| `topSpeed` | number (km/h) | max `speed` across the lap's samples |
| `status` | `"ok" \| "no-lap" \| "no-telemetry"` | drives per-driver messaging |

---

## Config: `CHANNELS` (`channels.js`) — drives all six charts

| key | label | unit | line type | y-domain |
|---|---|---|---|---|
| `speed` | Speed | km/h | line | auto |
| `throttle` | Throttle | % | line | `[0, 100]` |
| `brake` | Brake | % | step | `[0, 100]` |
| `gear` | Gear | — | step | `[0, 8]` |
| `rpm` | RPM | — | line | auto |
| `drs` | DRS | on/off | step | `[0, 1]` |

`DRIVER_COLORS = ["#3FC1C9", "#FB8C00"]` (A, B).

---

## Pure helpers (`utils/telemetry.js`)

```text
deriveDistance(samples) -> samples + cumulative `distance`
  dist[0]=0; dist[i]=dist[i-1] + (speed_kmh[i]/3.6) * ((date[i]-date[i-1])/1000)

resampleToGrid(samplesWithDistance, points) -> array of `points` rows on an
  even distance grid 0..total; linear interp for speed/throttle/brake/rpm,
  nearest-sample for n_gear and drs

mergeDrivers(gridA, gridB?) -> ChartRow[]  (suffix _a / _b; _b omitted if no B)

decodeDrs(v) -> 1 if v in {10,12,14} else 0
formatLapTime(seconds) -> "m:ss.mmm"
```

All pure, framework-free, and the same `deriveDistance` will feed the future track-map/heatmap work.
