# Quickstart: Race Calendar Integration Scenarios

**Feature**: 003-race-calendar
**Date**: 2026-06-01

---

## Scenario 1: Load 2025 race calendar

1. User navigates to `/seasons?year=2025`
2. `SeasonsPage` reads `year=2025` from outlet context
3. `CalendarGrid` calls `useRaceCalendar(2025)`
4. Hook fetches all meetings for 2025 and filters out pre-season testing
5. Grid renders ~24 race rounds sorted by round number

**Expected first row**:
```
| 1 | Australian Grand Prix | Melbourne | Australia 🇦🇺 | 14 Mar 2025 | Completed |
```

---

## Scenario 2: Season change updates calendar

1. User is on `/seasons?year=2025`
2. User changes global year selector to 2023
3. URL updates to `/seasons?year=2023`
4. `useRaceCalendar(2023)` fires with the new year
5. Grid re-renders with 2023 race rounds

**Verify**: Emilia Romagna Grand Prix appears with status `"Cancelled"` in the 2023 grid.

---

## Scenario 3: Upcoming races in current season

1. User is on `/seasons?year=2025` mid-season
2. Races whose `date_start` is before today show status `"Completed"`
3. Races whose `date_start` is today or later show status `"Upcoming"`
4. Status column visually distinguishes the two states

---

## Scenario 4: Navigate to race detail (US2)

1. User is on `/seasons?year=2025`
2. User double-clicks on the "British Grand Prix" row
3. `CalendarGrid.onRowDoubleClicked` calls `onRaceOpen(rowData)`
4. `SeasonsPage.openRaceDetail` navigates to `/meetings/1234?year=2025`
5. URL includes `?year=2025` (season preserved)

---

## Scenario 5: No data for a season

1. User selects a year with no meetings returned from the API
2. `useRaceCalendar` returns `{ data: [], isLoading: false }`
3. `CalendarGrid` renders ag-grid's built-in "No Rows" overlay
4. No blank screen, no JavaScript error

---

## Scenario 6: Calendar nav item in sidebar

1. User clicks "Calendar" in the sidebar
2. Sidebar navigates to `/seasons?year=<current_year>`
3. `SeasonsPage` renders with the current year's race calendar
4. "Calendar" nav item is highlighted active
