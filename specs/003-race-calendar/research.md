# Research: Race Calendar

**Feature**: 003-race-calendar
**Date**: 2026-06-01

---

## Decision 1: Filtering pre-season testing from the meetings list

**Decision**: Filter any meeting where `meeting_name` (case-insensitive) contains `"testing"`.

**Rationale**: The `/meetings?year=YEAR` endpoint returns **all** meetings including pre-season testing. Verified: 2025 returns 24 entries, first entry is `meeting_name: "Pre-Season Testing"`. 2023 similarly returns 24 entries with the same pattern. Filtering on `meeting_name.toLowerCase().includes("testing")` cleanly excludes all testing events without needing a separate API call or hardcoded list.

**Alternatives considered**:
- Fetch race sessions (`/sessions?year=YEAR&session_type=Race`), extract unique `meeting_key` values, then cross-reference meetings — reliable but requires two API calls and a join.
- Filter by `meeting_name` not matching "Grand Prix" — fragile (sprint weekends, testing labels vary year to year).
- Use a hardcoded count per year — unmaintainable.

---

## Decision 2: Round number derivation

**Decision**: After filtering and sorting by `date_start` ASC, use `index + 1` as the round number.

**Rationale**: OpenF1 does not return an explicit `round_number` field in the `/meetings` endpoint. The chronological order of race meetings is the correct representation of championship rounds. This is computed in `useMemo` inside `useRaceCalendar`.

**Alternatives considered**:
- Parse the `meeting_official_name` for a round number string — too fragile, names vary by year.
- Hard-code round numbers per year — unmaintainable when calendar changes.

---

## Decision 3: Race status derivation

**Decision**: Three possible statuses: `"Cancelled"`, `"Completed"`, `"Upcoming"`.
- `is_cancelled: true` → `"Cancelled"` (checked first)
- `new Date(date_start) < new Date()` → `"Completed"`
- Otherwise → `"Upcoming"`

**Rationale**: The `/meetings` endpoint returns `is_cancelled: boolean`. Verified in 2023 data: Emilia Romagna Grand Prix has `is_cancelled: true` (race was called off due to flooding). Status is derived at render time from the race date — no API field for "race has happened".

**Alternatives considered**:
- Using `/session_result?meeting_key=X` to check if results exist — additional API calls per meeting (up to 23 requests), violates rate limit constraints.
- Treating all past-dated races as completed — incorrect for cancelled races.

---

## Decision 4: Country flag source

**Decision**: Use `country_flag` directly from the OpenF1 `/meetings` response. No static map needed.

**Rationale**: Unlike team logos (which required a static map because OpenF1 doesn't include them), `country_flag` is a first-party field in the meetings endpoint. The URL points to the official F1 media CDN (`media.formula1.com`). Example: `https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/bahrain-flag.png`. Display the flag in the Country column (flag → country name), at 20px height.

**Alternatives considered**:
- Static map of country_code → emoji flags — no network dependency, but emoji rendering varies across OS/browser.
- Static map to a flag CDN (flagcdn.com) — extra dependency, requires manual mapping.

---

## Decision 5: Date formatting

**Decision**: Format `date_start` using `toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })` in an ag-grid `valueFormatter`. Output: `"26 Feb 2025"`.

**Rationale**: ag-grid `valueFormatter` receives the raw ISO string and returns a display string. This keeps the raw date in `rowData` (sortable by actual value), while the formatted label is only used for display. `en-GB` locale produces day-first format consistent with F1 convention.

**Alternatives considered**:
- Transform date string in `useRaceCalendar` hook — contaminates the data layer with display logic.
- Use a third-party date library — unnecessary for a single format pattern.

---

## Decision 6: Row interaction (single vs double click)

**Decision**: Use `onRowDoubleClicked` consistent with `DriversGrid` and `TeamsGrid`.

**Rationale**: All data grids in this project use double-click to open a detail view. Consistency matters more than the marginal usability gain of single-click navigation.

**Alternatives considered**:
- `onRowClicked` — inconsistent with existing grids; accidental navigation risk.
- Explicit "View" button column — overcomplicates the grid, conflicts with the clean minimal design.

---

## Known API Gaps

- `circuit_image` field exists in the meetings response but is not used in the calendar grid (reserved for a future meeting detail page).
- `date_start` is the start of the race weekend (Thursday/Friday), not the race day itself. For 2025 display purposes, showing `date_start` gives the correct feeling of "when this GP happens in the season" even if the Sunday is a few days later.
- `country_flag` URL is from the official F1 CDN and may change if Formula1.com restructures their media assets.
