# Data Model: Drivers Tab — Standings Evolution Charts

No persisted/server entities. These are in-memory shapes assembled by `useDriverStandingsEvolution(year)` from existing OpenF1 queries and fed to the chart components.

---

## Source data (existing endpoints)

| Source | Used for |
|---|---|
| `/sessions?year&session_type=Race` (filter `session_name === "Race"`, sort by `date_start`) | the ordered list of rounds |
| `/meetings?year` | per-round `country_name`, `country_flag`, round order |
| `/championship_drivers?session_key={round}` | per-round `points_current`, `position_current` per `driver_number` (one query per completed round, via `useQueries`) |
| `/drivers?session_key={lastCompletedRace}` | `full_name`, `name_acronym`, `team_colour` per `driver_number` |

---

## Round

One championship round (race) in the season — the X-axis unit.

| Field | Type | Source |
|---|---|---|
| `round` | number | 1-based index in chronological race order |
| `sessionKey` | number | race session `session_key` |
| `meetingKey` | number | `meeting_key` |
| `countryName` | string | meeting `country_name` |
| `countryFlag` | string (URL) | meeting `country_flag` |
| `completed` | boolean | race `date_start < now` |

Only `completed` rounds are plotted and only completed rounds fire a standings query.

## Driver (chart identity)

| Field | Type | Source |
|---|---|---|
| `driverNumber` | number | standings / drivers |
| `name` | string | drivers `full_name` |
| `code` | string | drivers `name_acronym` (3-letter) |
| `color` | string | `#${team_colour}` (fallback neutral token when missing) |

## DriverStandingAtRound

The per-(driver, round) data point. Absent when the driver has no standings row that round (mid-season joiner) → `null` in the series.

| Field | Type | Source |
|---|---|---|
| `points` | number \| null | `points_current` |
| `position` | number \| null | `position_current` |

## Evolution output (hook return)

`useDriverStandingsEvolution(year)` returns:

| Field | Type | Notes |
|---|---|---|
| `rounds` | `Round[]` | completed rounds, chronological |
| `drivers` | `Driver[]` | one per driver, sorted by latest position (legend/label order) |
| `pointsData` | row[] | Recharts dataset for the points chart |
| `rankData` | row[] | Recharts dataset for the ranking chart |
| `driverCount` | number | N = max championship position seen (ranking Y-axis range 1..N) |
| `isLoading` | boolean | any enabled round query still loading |
| `isEmpty` | boolean | no completed rounds for the season |

**Chart row shapes** (one row per round; keyed for Recharts):

```js
// pointsData row
{ round, countryName, countryFlag, [`d${driverNumber}`]: points|null, … }
// rankData row
{ round, countryName, countryFlag, [`d${driverNumber}`]: position|null, … }
```

Each chart renders one `<Line dataKey={`d${driverNumber}`} stroke={driver.color} />` per driver. `connectNulls` bridges rounds a driver was absent for (so a mid-season joiner's line simply starts later).

**Derivation rules**:
- **Points chart hover panel**: for the hovered round, list all drivers with non-null points, sorted `points desc`, ties broken by `position` asc (official tiebreaker) — FR-004.
- **Ranking chart**: Y-axis reversed, integer domain `[1, driverCount]`; right-edge label = `driver.code` in `driver.color` at each line's final round — FR-008/009.
- **Colour**: `color` is data-derived team colour; never a hardcoded app-palette hex (FR-003/014).
