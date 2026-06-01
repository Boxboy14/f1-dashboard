# Data Model: Teams Page

**Feature**: 002-teams-page  
**Date**: 2026-05-30

---

## Source Entities (OpenF1 API)

### TeamStanding
From `/championship_teams?session_key=<key>`

| Field | Type | Notes |
|---|---|---|
| `meeting_key` | number | Race weekend identifier |
| `session_key` | number | Specific session identifier |
| `team_name` | string | Constructor name (join key to drivers) |
| `position_current` | number | Current championship rank |
| `position_start` | number | Rank at race start (unused in UI) |
| `points_current` | number | Total championship points |
| `points_start` | number | Points at race start (unused in UI) |

### DriverStanding
From `/championship_drivers?session_key=<key>`

| Field | Type | Notes |
|---|---|---|
| `meeting_key` | number | Race weekend identifier |
| `session_key` | number | Specific session identifier |
| `driver_number` | number | Join key to Driver |
| `position_current` | number | Driver's current championship rank |
| `points_current` | number | Driver's total championship points |

### Driver
From `/drivers?session_key=<key>` (transformed by `useDrivers`)

| Field | Type | Notes |
|---|---|---|
| `driver_number` | number | Join key to DriverStanding |
| `full_name` | string | Computed: `first_name + " " + last_name` |
| `team_name` | string | Join key to TeamStanding |
| `team_colour` | string | Hex string, no leading `#` (e.g., `"F47600"`) |
| `headshot_url` | string | URL to driver headshot image |
| `country_code` | string \| null | null for 2025 data — known OpenF1 gap |

---

## Derived Entity (computed by `useTeamsByYear`)

### TeamRow
The merged entity consumed by the UI. One per constructor per season.

| Field | Type | Source |
|---|---|---|
| `team_name` | string | TeamStanding |
| `position_current` | number | TeamStanding |
| `points_current` | number | TeamStanding |
| `team_colour` | string \| null | Driver (first driver's colour, or null) |
| `drivers` | DriverWithStanding[] | Joined Driver + DriverStanding |

### DriverWithStanding
A driver enriched with their championship stats. Embedded in `TeamRow.drivers`.

| Field | Type | Source |
|---|---|---|
| `driver_number` | number | Driver |
| `full_name` | string | Driver (computed) |
| `headshot_url` | string | Driver |
| `championship` | ChampionshipStats \| null | DriverStanding (null if not in standings) |

### ChampionshipStats
Embedded in `DriverWithStanding.championship`.

| Field | Type | Source |
|---|---|---|
| `position_current` | number | DriverStanding |
| `points_current` | number | DriverStanding |

---

## Routing Entity

### TeamSlug
Derived from `team_name` for URL routing.

- Format: `team_name.replace(/\s+/g, "-").toLowerCase()`
- Examples: `"Red Bull Racing"` → `"red-bull-racing"`, `"Mercedes"` → `"mercedes"`
- Used in: `/teams/:teamSlug` route param
- Computed by: `createTeamSlug(team)` in `src/store/teams/utils.js`

---

## Data Flow

```
year (URL ?year=2025)
  │
  ▼
useSessions({ year, session_type: "Race" })
  │
  └─ sessions.at(-1).session_key
         │
         ├─ useChampionshipTeams({ session_key })   ──→ TeamStanding[]
         ├─ useChampionshipDrivers({ session_key })  ──→ DriverStanding[]
         └─ useDrivers({ session_key })              ──→ Driver[]
                │
                ▼
           useMemo (merge in useTeamsByYear)
                │
                ▼
           TeamRow[]  (sorted by position_current ASC)
                │
         ┌──────┴──────┐
         ▼             ▼
      TeamsGrid    TeamDetailCard
   (ag-grid rows)   (dialog overlay)
```
