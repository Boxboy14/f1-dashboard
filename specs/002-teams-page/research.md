# Research: Teams Page

**Feature**: 002-teams-page  
**Date**: 2026-05-30  
**Constitution Article**: II — API-First Design

---

## Decision 1: How to join team standings with their drivers

**Question**: The `/championship_teams` endpoint does not return driver info. How do we display both drivers on each team row?

**Decision**: Three-source join via `team_name` as the linking key.

**Strategy**:
1. `/championship_teams?session_key=<key>` → team rank and points
2. `/drivers?session_key=<key>` → driver names and `team_name` (the bridge) and `team_colour`
3. `/championship_drivers?session_key=<key>` → per-driver championship rank and points (keyed by `driver_number`)

Join:
- Group `/drivers` by `team_name` → `Map<team_name, Driver[]>`
- For each `championship_teams` entry, look up `driversByTeam[team.team_name]` to get the team's drivers
- For each driver, look up `championship_drivers` by `driver_number` to get their individual standings
- Result: each team row has `{ ...team, team_colour, drivers: [{ ...driver, championship: { ... } }] }`

**Verified API shapes** (real responses, 2026-05-30):

`/championship_teams`:
```json
{
  "meeting_key": 1285,
  "session_key": 11291,
  "team_name": "Mercedes",
  "position_start": 1,
  "position_current": 1,
  "points_start": 194.0,
  "points_current": 219.0
}
```

`/championship_drivers`:
```json
{
  "meeting_key": 1285,
  "session_key": 11291,
  "driver_number": 12,
  "position_start": 1,
  "position_current": 1,
  "points_start": 106.0,
  "points_current": 131.0
}
```

`/drivers`:
```json
{
  "driver_number": 1,
  "full_name": "Lando NORRIS",
  "team_name": "McLaren",
  "team_colour": "F47600",
  "first_name": "Lando",
  "last_name": "Norris",
  "headshot_url": "https://...",
  "country_code": null
}
```

**Alternatives considered**:
- Single endpoint for team + driver data — does not exist in OpenF1 free tier.
- Fetching drivers separately per team — would require one request per team (10 requests), violates the 3 req/sec rate limit and is unnecessary since a single `/drivers?session_key=<key>` returns all drivers.

---

## Decision 2: Where to place the data-merging logic

**Decision**: New `useTeamsByYear(year)` hook in `src/hooks/useOpenF1.js`.

**Rationale**: Follows the established `useDriversByYear(year)` pattern. The hook chains `useSessions` → session_key → 3 parallel queries → `useMemo` merge. Components stay presentation-only and receive a ready-to-render team array.

**Shape of merged team object returned by the hook**:
```js
{
  // from championship_teams
  meeting_key: 1285,
  session_key: 11291,
  team_name: "Mercedes",
  position_current: 1,
  points_current: 219.0,
  // enriched
  team_colour: "00D2BE",           // from drivers endpoint (hex, no leading #)
  drivers: [
    {
      // from drivers
      driver_number: 12,
      full_name: "Kimi Antonelli",
      headshot_url: "...",
      // from championship_drivers (may be null if driver scored no points)
      championship: {
        position_current: 1,
        points_current: 131.0
      }
    }
  ]
}
```

**Alternatives considered**:
- Merging inside `TeamsPage` component with `useMemo` — would mix data transformation with presentation logic, violates constitution Article III (component isolation).
- Separate `useTeams` and `useTeamDrivers` hooks with merge in the component — extra complexity for no gain since both sources always load together.

---

## Decision 3: Team detail — page-level or dialog?

**Decision**: Salt DS `Dialog` overlay, same pattern as `DriverInfoCard`. Triggered by double-clicking a row. URL param (`/teams/:teamSlug`) drives open state, consistent with the driver detail pattern.

**Ownership**: `TeamsPage` (not `DashboardLayout`) owns the team detail dialog state. This is a deliberate improvement over the driver pattern where `DashboardLayout` owns driver detail state — keeping each tab self-contained satisfies constitution Article III more cleanly.

**Rationale**: Dialog means the teams grid stays visible behind the overlay (no full navigation away), which is fast and contextually appropriate for a "quick look at a team's drivers" interaction.

**Alternatives considered**:
- Full detail page at `/teams/:teamSlug` — heavier navigation, overkill for Phase 1 data volume (team name + 2 drivers + their stats).
- Extending `DashboardLayout` to own both driver and team dialogs — makes DashboardLayout a god component; each tab being self-contained is the right direction.

---

## Decision 4: Team slug format

**Decision**: `createTeamSlug(team)` → `team.team_name.replace(/\s+/g, "-").toLowerCase()`.

Examples: `"Red Bull Racing"` → `"red-bull-racing"`, `"Mercedes"` → `"mercedes"`.

Mirrors `createDriverSlug` from `src/store/drivers/utils.js`. New `src/store/teams/utils.js` for the teams equivalent.

---

## Decision 5: ag-grid columns for nested driver data

**Decision**: Use ag-grid `valueGetter` to extract `drivers[0].full_name` and `drivers[1].full_name` from the nested array. No custom cell renderer needed for Phase 1.

**Rationale**: `valueGetter` is a plain function — no extra React component overhead, no additional complexity. Sufficient for displaying driver names.

**Columns planned**:
| Column | Source | valueGetter / field |
|---|---|---|
| Rank | `position_current` | `field` |
| Team | `team_name` | `field` |
| Points | `points_current` | `field` |
| Driver 1 | `drivers[0].full_name` | `valueGetter` |
| Driver 2 | `drivers[1].full_name` | `valueGetter` |

---

## Known gaps / edge cases

- **Mid-season driver substitutions**: A team may have more than 2 drivers in `drivers` for a given session if substitutions occurred. The grid displays `drivers[0]` and `drivers[1]` (highest index = highest points). The detail card lists all drivers for completeness.
- **`team_name` mismatch risk**: `championship_teams.team_name` and `drivers.team_name` both come from OpenF1. They have matched in all tested sessions. If they diverge in future data, the join will silently produce an empty `drivers` array for that team — the grid row will show "—" for both driver columns.
- **`team_colour` is per-driver, not per-team**: Both drivers on a team share the same `team_colour` hex value. We take it from `drivers[0]`. If the array is empty, colour falls back to `null` (no colour accent shown).
