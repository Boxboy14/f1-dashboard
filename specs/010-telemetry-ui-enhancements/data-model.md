# Data Model: Telemetry & UI Enhancements

This feature adds no persisted/server entities. The "entities" below are in-memory shapes assembled from already-fetched data, plus one persisted UI preference.

---

## Lap Summary Report

The structured data handed to the PDF builder (`lapSummaryPdf.js`). Assembled in `TelemetryPage` from data already on the page.

| Field | Type | Source | Notes |
|---|---|---|---|
| `gpName` | string | selected meeting's `meeting_name` | report title |
| `circuitName` | string | meeting's `circuit_short_name` | optional subtitle |
| `sessionName` | string | selected session's label | from the Session dropdown |
| `lapLabel` | string | page `lapLabel` ("Fastest lap" or "Lap N") | |
| `drivers` | `ReportDriver[]` | `telemetryDrivers` (status `ok` and non-ok) | 1–2 entries |
| `channels` | `ChannelSummary[]` | derived from `CHANNELS` + `chartData` | one per chart |

**ReportDriver**

| Field | Type | Notes |
|---|---|---|
| `name` | string | full name |
| `driver_number` | number | |
| `lapNumber` | number \| null | concrete lap; null only if no lap |
| `compound` | string \| null | tyre for the lap (see Tyre Stint Detail) |
| `hasData` | boolean | false when status is `no-lap`/`no-telemetry` → report states "no lap data" (FR-005) |

**ChannelSummary** (one per telemetry channel)

| Field | Type | Notes |
|---|---|---|
| `label` | string | e.g. "Speed" |
| `unit` | string | e.g. "km/h" |
| `bullet` | string | one-line headline (e.g. per-driver max/min/avg) |
| `paragraph` | string | plain-language explanation of what the channel shows for the selected driver(s) over the lap |

**Derivation rules** (per channel, from `chartData` columns `${key}_a` / `${key}_b`):
- Compute simple, honest stats from the merged grid: max (speed, rpm), max/average (throttle), share-of-lap on (brake, DRS), gear range. These feed the bullet + paragraph in plain language. No new fetch — all from `chartData` already in memory.
- With two drivers, the paragraph compares them (e.g., "Driver A reached a higher top speed (…) while Driver B carried more throttle through the lap").

---

## Tyre Stint Detail

The tyre compound and age shown on a driver's summary card and in the report, derived from the session's stints.

| Field | Type | Source |
|---|---|---|
| `driver_number` | number | stint row |
| `compound` | string | stint row `compound` (e.g. "SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET") |
| `tyreAge` | number | `tyre_age_at_start + (lap_number - lap_start)` of the covering stint |

**Source**: `useStints({ session_key })` → rows with `driver_number`, `lap_start`, `lap_end`, `compound`, `tyre_age_at_start`.

**Mapping rule**: for a driver's displayed `lap_number`, find the stint where `lap_start ≤ lap_number ≤ lap_end` (`stintForLap`); its `compound` is the tyre and `tyre_age_at_start + (lap_number - lap_start)` is the age. If no stint covers the lap → `compound`/`tyreAge = null` → card shows "Unavailable" (FR-007).

**Carrier**: `useTelemetryComparison` meta gains `lap_number` and `sectors` ({s1,s2,s3} from the lap's `duration_sector_1/2/3`); `TelemetryPage` enrichment adds `compound`, `tyreAge`, and `delta` (lap-time gap to the faster driver, only when two timed laps are selected). `DriverSummary` and the report read these without re-deriving.

## Driver Card Stats

The per-driver lap context rendered on the summary card, all from already-fetched data:

| Field | Type | Source |
|---|---|---|
| `lapTime` | number | lap `lap_duration` |
| `delta` | number \| null | `lapTime - min(okLapTimes)`; null unless ≥2 timed laps; `0` ⇒ shown as "Fastest" |
| `sectors` | {s1,s2,s3} | lap `duration_sector_1/2/3` |
| `topSpeed` | number | max speed over the merged telemetry |
| `compound` / `tyreAge` | string / number | Tyre Stint Detail above |

---

## Sidebar Display State

A persisted UI preference (the only persisted entity in this feature).

| Field | Type | Storage | Default |
|---|---|---|---|
| `collapsed` | boolean | `localStorage["f1-sidebar-collapsed"]` | `false` (open) |

**State transitions**: `collapsed` toggles on each click of the sidebar's double-chevron control. Persisted on change; restored on app load. Owned by `DashboardLayout`. Desktop-only — has no effect at/under the mobile breakpoint, where the sidebar is a hamburger drawer.

---

## Track Map additions (no new entity)

The existing `trackMap` object gains no new fetched fields. Two presentational additions are computed from data already in it / passed alongside:
- **Start/finish logo**: a checkered-flag marker (alternating-fill `<rect>` grid) derived geometrically from the existing `sp[]` endpoints (`sp[0]`, `sp[sp.length-1]`) — centered on their midpoint, sized from the track bounding box. No data change.
- **Circuit caption**: `circuitName` passed as a prop from `TelemetryPage` (from the meeting record). No data change.
