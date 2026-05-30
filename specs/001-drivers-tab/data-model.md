# Data Model: Drivers Tab

**Feature**: `001-drivers-tab`
**Date**: 2026-05-30

---

## Entities

### Driver (from OpenF1 `/drivers` response)

Raw API fields:

| Field | Type | Notes |
|---|---|---|
| `session_key` | number | Session this driver record belongs to |
| `meeting_key` | number | Meeting (GP weekend) this session belongs to |
| `driver_number` | number | Official race number (e.g., 1, 44, 16) |
| `full_name` | string | Full name as provided by OpenF1 (e.g., "Lando NORRIS") |
| `first_name` | string | First name |
| `last_name` | string | Last name (may be in CAPS from API) |
| `broadcast_name` | string | Short name used on broadcast (e.g., "L NORRIS") |
| `name_acronym` | string | 3-letter code (e.g., "NOR") |
| `team_name` | string | Constructor name (e.g., "McLaren") |
| `team_colour` | string | Hex color without `#` (e.g., "F47600") |
| `headshot_url` | string | URL to official F1 headshot image |
| `country_code` | string \| null | IOC 3-letter country code — **null for all 2025 data** (known API gap) |

Computed fields added by `transformDrivers()` in `useOpenF1.js`:

| Field | Type | Source |
|---|---|---|
| `full_name` | string | Overwritten as `${first_name} ${last_name}` for consistent casing |
| `country_name` | string \| null | Looked up from `COUNTRY_CODE_MAP[country_code]`; null if `country_code` is null |

### Season

A calendar year of F1 competition supported by the app.

| Field | Type | Value |
|---|---|---|
| `year` | number | One of: 2023, 2024, 2025 |

This is not fetched from the API — it is a hardcoded constant in the UI.

### Session (from OpenF1 `/sessions` response, used internally for year→session_key resolution)

Only the fields relevant to the year-lookup are listed:

| Field | Type | Notes |
|---|---|---|
| `session_key` | number | Unique session identifier |
| `session_type` | string | "Race", "Sprint", "Qualifying", "Practice 1", etc. |
| `session_name` | string | Human-readable name (e.g., "Race") |
| `year` | number | Calendar year |
| `date_start` | string | ISO 8601 date-time string |

---

## State

### URL state

| Param | Type | Default | Owner |
|---|---|---|---|
| `year` (search param) | `"2023" \| "2024" \| "2025"` | `"2025"` | React Router `useSearchParams` |

The year is read from the URL and written back when the user changes the selector. Components read it via `useSearchParams()`.

### TanStack Query cache keys

| Key | Data |
|---|---|
| `["sessions", { year, session_type: "Race" }]` | All Race sessions for the selected year |
| `["drivers", { session_key }]` | Drivers for the derived session key |

Both are populated by `useDriversByYear(year)`. The two-level cache means switching back to a previously viewed year is instant (no re-fetch while within `staleTime`).

---

## Data flow diagram

```
URL ?year=2025
       │
       ▼
 useDriversByYear(2025)
       │
       ├── useSessions({ year: 2025, session_type: "Race" })
       │         │
       │         └── sessions[].at(-1).session_key  →  e.g. 11291
       │
       └── useDrivers({ session_key: 11291 })
                 │
                 └── transformDrivers(rawData)
                           │
                           └── [{ full_name, driver_number, country_name, team_name, ... }]
                                        │
                                        ▼
                                  DriversGrid (ag-grid rows)
```
