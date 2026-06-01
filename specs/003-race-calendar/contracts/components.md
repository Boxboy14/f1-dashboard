# Component Contracts: Race Calendar

**Feature**: 003-race-calendar
**Date**: 2026-06-01

---

## SeasonsPage

Tab shell component. Analogous to `TeamsPage.jsx`.

**Route**: `/seasons`

**Props**: none (reads from React Router outlet context and URL params)

**Reads from outlet context**:
- `year: number` — the globally selected season year

**Responsibilities**:
- Renders `CalendarGrid`
- Handles `onRaceOpen(meeting)` callback: navigates to `/meetings/:meeting_key` with `?year` preserved
- Does not own a detail dialog — navigation is to a separate page

---

## CalendarGrid

ag-grid table of all race rounds for the selected season.

**Props**:

| Prop | Type | Required | Description |
|---|---|---|---|
| `year` | number | yes | Currently selected season |
| `onRaceOpen` | (meeting: RaceRound) => void | yes | Called on row double-click |

**Columns**:

| Header | Data | Behaviour |
|---|---|---|
| Rnd | `round` | Sortable, numeric, width 70 |
| Grand Prix | `meeting_name` | Sortable, flex 1 |
| Circuit | `circuit_short_name` | Sortable, flex 1 |
| Country | `country_name` + `country_flag` | Sortable, cellRenderer shows flag + name, width 160 |
| Date | `date_start` | Sortable, valueFormatter → `"26 Feb 2025"`, width 130 |
| Status | `status` | Sortable, cellRenderer with color-coded text, width 120 |

**Behaviour**:
- Displays empty rows while loading
- Double-click on a row calls `onRaceOpen(rowData)`
- Columns auto-size to fit container on grid ready
- `getRowId` uses `meeting_key`

---

## useRaceCalendar (hook contract)

New hook added to `src/hooks/useOpenF1.js`.

**Signature**: `useRaceCalendar(year: number) → { data: RaceRound[], isLoading: boolean }`

**Behaviour**:
- Calls `useMeetings({ year })`
- Filters via `useMemo`: excludes entries where `meeting_name` contains `"testing"` (case-insensitive)
- Sorts by `date_start` ASC
- Adds `round` (1-indexed position) and `status` (`"Completed"` / `"Upcoming"` / `"Cancelled"`)
- Returns `isLoading: true` while the meetings query is loading
- Returns `data: []` while loading or when no data exists

**Status logic** (applied in useMemo):
```
is_cancelled === true  → "Cancelled"
date_start < Date.now()  → "Completed"
otherwise  → "Upcoming"
```
