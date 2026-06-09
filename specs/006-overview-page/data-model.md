# Data Model: Overview Page

These are **derived view models** produced by the two hooks from raw OpenF1 responses. They are not persisted — they exist only in memory inside `useMemo`. Raw field names come from endpoints already consumed elsewhere in the app (verified, per Constitution Article II).

---

## Entity: `GrandPrixCardModel`

One per Grand Prix in the selected season. Produced by `useSeasonGrandPrix(year)`.

| Field | Type | Source | Notes |
|---|---|---|---|
| `meeting_key` | number | `meetings.meeting_key` | Stable id; row key and meeting-nav target |
| `round` | number | derived | Index (1-based) after sorting non-testing meetings by `date_start` |
| `meeting_name` | string | `meetings.meeting_name` | e.g. "Australian Grand Prix" |
| `country_name` | string | `meetings.country_name` | |
| `country_flag` | string \| null | `meetings.country_flag` | Flag image URL; may be absent → render without flag |
| `circuit_short_name` | string | `meetings.circuit_short_name` | |
| `date_start` | ISO string | derived | Min `session.date_start` across the GP's sessions (weekend start) |
| `date_end` | ISO string \| null | derived | Max `session.date_end` across the GP's sessions (weekend end) |
| `status` | StatusEnum | `deriveMeetingStatus()` | Rolled up from session statuses + `is_cancelled` |
| `sessions` | `SessionSummary[]` | derived | Sorted by `date_start` ascending |

**Validation / rules**:
- Meetings whose `meeting_name` contains "testing" are excluded (same filter as `useRaceCalendar`).
- A GP with zero sessions still renders (identity + status from the meeting), with an empty session list.
- `round` is positional, not from the API (OpenF1 has no round field).

---

## Entity: `SessionSummary`

One per session within a Grand Prix card.

| Field | Type | Source | Notes |
|---|---|---|---|
| `session_key` | number | `sessions.session_key` | Row key and session-nav target |
| `session_name` | string | `sessions.session_name` | e.g. "Practice 1", "Qualifying", "Race" |
| `session_type` | string | `sessions.session_type` | "Practice" / "Qualifying" / "Sprint" / "Race" |
| `date_start` | ISO string | `sessions.date_start` | Used for ordering and display |
| `status` | StatusEnum | `deriveSessionStatus()` | From `date_start`/`date_end` vs now; `Cancelled` if the GP is cancelled |

**Rules**:
- Cancelled-GP sessions carry `status: "Cancelled"` and are rendered non-navigable (no link to a result that doesn't exist).

---

## Entity: `SeasonKpis`

A single snapshot object produced by `useSeasonKpis(year)`: `{ leader, lastWinner, nextRace }`. Each sub-field is independently nullable so the strip degrades gracefully (FR-006).

### `leader` (`ChampionshipLeader \| null`)

| Field | Type | Source | Notes |
|---|---|---|---|
| `full_name` | string | `drivers.full_name` (joined) | Joined onto standings by `driver_number` |
| `team_name` | string | `drivers.team_name` (joined) | |
| `points` | number | `championship_drivers.points_current` | |
| `position` | number | `championship_drivers.position_current` | Always 1 for the leader; kept for clarity |

`null` when no race has completed in the season (no `lastRaceKey`).

### `lastWinner` (`RaceWinner \| null`)

| Field | Type | Source | Notes |
|---|---|---|---|
| `full_name` | string | `drivers.full_name` (joined) | Joined onto `session_result` by `driver_number` |
| `team_name` | string | `drivers.team_name` (joined) | |
| `meeting_name` | string | `meetings.meeting_name` | The GP of the last completed race |

`null` when no race has completed.

### `nextRace` (`NextRace \| null`)

| Field | Type | Source | Notes |
|---|---|---|---|
| `meeting_name` | string | `meetings.meeting_name` | GP of the next upcoming race |
| `country_flag` | string \| null | `meetings.country_flag` | |
| `date_start` | ISO string | `sessions.date_start` | The Race session start |
| `daysUntil` | number | derived | Whole days from now to `date_start` (static, render-time) |

`null` when the season has no upcoming race → KPI shows "Season complete".

---

## Shared type: `StatusEnum`

`"Completed" | "In Progress" | "Upcoming" | "Cancelled" | "Unknown"`

Maps to colors via the existing `STATUS_STYLES` (`src/utils/cellRenderers/statusStyles.js`). No new statuses introduced.

---

## Derivation helpers (`src/utils/sessionStatus.js`)

```text
deriveSessionStatus(session, isCancelled) -> StatusEnum
  if isCancelled: "Cancelled"
  start = session.date_start ? Date : null
  end   = session.date_end   ? Date : null
  if start && end:  end < now -> "Completed"; start <= now -> "In Progress"; else "Upcoming"
  else if start:    start < now -> "Completed"; else "Upcoming"
  else:             "Unknown"

deriveMeetingStatus(sessions, isCancelled) -> StatusEnum
  if isCancelled: "Cancelled"
  if no sessions: "Unknown"
  if any "In Progress": "In Progress"
  if all "Completed": "Completed"
  if all "Upcoming": "Upcoming"
  otherwise (mix of Completed + Upcoming, weekend underway): "In Progress"
```

These are pure functions of their inputs and `Date.now()` — no side effects, trivially reasoned about.
