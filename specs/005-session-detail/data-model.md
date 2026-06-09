# Data Model: Session Detail Page

**Branch**: `005-session-detail` | **Date**: 2026-06-07

---

## Entities

### Session *(from `/sessions?session_key=<key>`)*

The session metadata used for the page heading and back navigation.

| Field | Type | Source | Notes |
|---|---|---|---|
| `session_key` | number | API | Primary identifier |
| `meeting_key` | number | API | Used for back-navigation to `/meetings/:key` |
| `session_name` | string | API | Display name, e.g. "Race" |
| `session_type` | string | API | "Race", "Sprint", "Qualifying", "Sprint Qualifying", "Practice 1/2/3" |
| `date_start` | string (ISO 8601) | API | Session start time |
| `date_end` | string (ISO 8601) \| null | API | Session end time; may be null |

---

### ClassificationResult *(from `/session_result?session_key=<key>` + `/drivers?session_key=<key>` join)*

One row per driver in the final classification.

| Field | Type | Source | Notes |
|---|---|---|---|
| `position` | number | session_result | Finishing position (1-based) |
| `driver_number` | number | session_result | Join key |
| `full_name` | string | drivers join | "FIRST LAST" — fallback to driver_number if missing |
| `name_acronym` | string | drivers join | 3-letter code, e.g. "VER" |
| `team_name` | string | drivers join | Constructor name |
| `team_colour` | string | drivers join | Hex colour, e.g. "#3671C6" |
| `gap_to_leader` | string \| null | session_result | e.g. "+3.744", "+1 LAP", null for leader |
| `best_time` | number \| null | derived in hook | Qualifying/Practice best lap in seconds; null for Race |
| `dnf` | boolean | session_result | Did Not Finish |
| `dns` | boolean | session_result | Did Not Start |
| `dsq` | boolean | session_result | Disqualified |
| `status` | string | derived in hook | "Finished", "DNF", "DNS", or "DSQ" |

**Derivation logic** (in `useSessionDetail` hook):
```
best_time:
  - If session_type ∈ ["Race", "Sprint"]: null
  - If session_type contains "Qualifying": last non-null element of duration array
  - If session_type contains "Practice": duration (single number)

status:
  - dsq  → "DSQ"
  - dnf  → "DNF"
  - dns  → "DNS"
  - else → "Finished"
```

---

### PitStop *(from `/pit?session_key=<key>` + `/drivers?session_key=<key>` join)*

One row per pit stop event.

| Field | Type | Source | Notes |
|---|---|---|---|
| `driver_number` | number | pit | Join key |
| `full_name` | string | drivers join | Fallback to driver_number if missing |
| `team_name` | string | drivers join | Constructor name |
| `lap_number` | number | pit | Lap on which the stop occurred |
| `pit_duration` | number | pit | Total pit lane duration in seconds (entry to exit) |
| `date` | string (ISO 8601) | pit | Timestamp of stop (for sort tie-breaking) |

---

## Relationships

```
Session (1) ─────── (many) ClassificationResult
Session (1) ─────── (many) PitStop
Driver   (1) ─────── (1)   ClassificationResult  [joined by driver_number]
Driver   (1) ─────── (many) PitStop               [joined by driver_number]
```

---

## Hook Return Shape: `useSessionDetail(sessionKey)`

```js
{
  session: Session | null,
  results: ClassificationResult[],   // sorted by position ASC
  pitStops: PitStop[],               // sorted by lap_number ASC, date ASC
  isLoading: boolean,
}
```

Empty arrays are returned until all four parallel queries resolve. `isLoading` is true while any query is still in flight.
