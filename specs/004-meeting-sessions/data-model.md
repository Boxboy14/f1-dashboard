# Data Model: Meeting Sessions Grid

**Branch**: `004-meeting-sessions` | **Date**: 2026-06-05

---

## Entities

### Meeting

Represents a single Grand Prix weekend. Sourced from the OpenF1 `/meetings` endpoint filtered by `meeting_key`.

| Field | Type | Source | Notes |
|---|---|---|---|
| `meeting_key` | number | API | Primary identifier |
| `meeting_name` | string | API | Official GP name e.g. "Monaco Grand Prix" |
| `country_name` | string | API | e.g. "Monaco" |
| `country_flag` | string (URL) | API | Flag image URL |
| `year` | number | API | Season year |
| `circuit_short_name` | string | API | e.g. "Monte-Carlo" |

**Used by**: `useMeetingDetail` → page heading, breadcrumb, back-navigation context.

---

### Session

Represents a single on-track session within a meeting weekend. Sourced from the OpenF1 `/sessions` endpoint filtered by `meeting_key`.

| Field | Type | Source | Notes |
|---|---|---|---|
| `session_key` | number | API | Primary identifier; used for drill-down navigation |
| `meeting_key` | number | API | Foreign key to Meeting |
| `session_name` | string | API | Human-readable name e.g. "Practice 1", "Qualifying", "Race" |
| `session_type` | string | API | Type category e.g. "Practice", "Qualifying", "Race", "Sprint" |
| `date_start` | string (ISO 8601) | API | Session start datetime |
| `date_end` | string (ISO 8601) | API | Session end datetime; may be null for some historical sessions |
| `year` | number | API | Redundant with meeting, available on each session |
| `circuit_short_name` | string | API | Same as meeting's circuit (denormalised) |
| `country_name` | string | API | Same as meeting's country (denormalised) |

**Derived fields** (computed in `useMeetingDetail` hook):

| Field | Type | Derivation |
|---|---|---|
| `status` | `"Completed"` \| `"In Progress"` \| `"Upcoming"` | If `date_end` exists: `date_end < now` → Completed; `date_start ≤ now ≤ date_end` → In Progress; else Upcoming. If no `date_end`: `date_start < now` → Completed; else Upcoming. |

---

## Relationships

```
Meeting (1) ──── (many) Session
  meeting_key         meeting_key (FK)
```

One meeting has 5 sessions in a standard weekend (FP1, FP2, FP3, Qualifying, Race). Sprint weekends add Sprint Qualifying and Sprint Race sessions. The data layer makes no assumption about count — renders whatever the API returns.

---

## State Transitions

```
Session Status:
  [future]          → "Upcoming"
  [start reached]   → "In Progress"
  [end reached]     → "Completed"
```

Transition is time-based, computed client-side at render time. No mutation occurs — status is always derived fresh from `date_start` / `date_end` vs `new Date()`.
