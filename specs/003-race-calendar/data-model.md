# Data Model: Race Calendar

**Feature**: 003-race-calendar
**Date**: 2026-06-01

---

## Source Entity (OpenF1 API)

### Meeting
From `/meetings?year=<year>`

| Field | Type | Notes |
|---|---|---|
| `meeting_key` | number | Unique meeting identifier — used as route param for meeting detail |
| `meeting_name` | string | Short GP name (e.g., `"Australian Grand Prix"`, `"Pre-Season Testing"`) |
| `meeting_official_name` | string | Sponsor-prefixed name (unused in calendar grid) |
| `location` | string | City name (e.g., `"Melbourne"`) |
| `country_key` | number | Numeric country identifier (unused) |
| `country_code` | string | ISO 3166-1 alpha-3 (e.g., `"AUS"`) |
| `country_name` | string | Full country name (e.g., `"Australia"`) |
| `country_flag` | string | URL to F1 media CDN flag image |
| `circuit_key` | number | Numeric circuit identifier (unused) |
| `circuit_short_name` | string | Short circuit name (e.g., `"Melbourne"`) |
| `circuit_type` | string | `"Permanent"` or `"Street"` (unused in grid) |
| `circuit_info_url` | string | External link (unused) |
| `circuit_image` | string | URL to circuit layout image (unused — reserved for meeting detail) |
| `gmt_offset` | string | Local timezone offset (unused in grid) |
| `date_start` | string | ISO 8601 timestamp — start of the race weekend |
| `date_end` | string | ISO 8601 timestamp — end of the race weekend (unused in grid) |
| `year` | number | Calendar year |
| `is_cancelled` | boolean | `true` for cancelled races (e.g., 2023 Emilia Romagna) |

---

## Derived Entity

### RaceRound
Computed by `useRaceCalendar(year)` via `useMemo`. One per Grand Prix weekend — excludes testing events.

| Field | Type | Source |
|---|---|---|
| `meeting_key` | number | Meeting — used as route param for `/meetings/:key` |
| `round` | number | Derived — position in chronologically sorted race list (1-indexed) |
| `meeting_name` | string | Meeting |
| `circuit_short_name` | string | Meeting |
| `country_name` | string | Meeting |
| `country_flag` | string | Meeting — direct API URL |
| `date_start` | string | Meeting — raw ISO string (formatted at display layer) |
| `is_cancelled` | boolean | Meeting |
| `status` | `"Completed" \| "Upcoming" \| "Cancelled"` | Derived — see status logic below |

### Status Derivation Logic

```
if (is_cancelled)              → "Cancelled"
else if (date_start < now())   → "Completed"
else                           → "Upcoming"
```

---

## Routing Entity

### MeetingKey
Used directly as the URL segment for meeting detail navigation.
- Value: `meeting_key` (numeric, e.g., `1229`)
- Route: `/meetings/1229`
- No slug transformation needed (numeric IDs are URL-safe)

---

## Data Flow

```
year (URL ?year=2025)
  │
  ▼
useMeetings({ year })  ──────────────────────→  Meeting[]  (all 24 incl. testing)
  │
  ▼
useRaceCalendar (useMemo)
  ├── filter: exclude meeting_name containing "testing"
  ├── sort: date_start ASC
  ├── map: add round (index+1) and status
  └── result: RaceRound[]  (~22–24 races depending on year)
               │
               ▼
          CalendarGrid
       (ag-grid rows with flag, date, status)
```
