# Research: Session Detail Page

**Branch**: `005-session-detail` | **Date**: 2026-06-07

---

## Decision 1: Driver name resolution strategy

**Decision**: Fetch `/drivers?session_key=<key>` in parallel with `/session_result?session_key=<key>` and join them in `useMemo` using `driver_number` as the key.

**Rationale**: The OpenF1 `/session_result` endpoint does NOT return `full_name` or `team_name` — it only has `driver_number`. The `/drivers` endpoint keyed on `session_key` returns the full driver roster for that session including name, team, and colours. This join pattern is already used in `useTeamsByYear` (joining championship data with drivers). Consistent with Article IV (Data Layer Discipline): all enrichment happens in the hook, not the component.

**Alternatives considered**:
- Hard-code a driver number → name map — discarded: changes season to season, breaks for new drivers.
- Use `/drivers?session_key=latest` — discarded: wrong session context, especially for historical races.

---

## Decision 2: Fastest lap indicator

**Decision**: Omit the fastest lap indicator in Phase 1. It is deferred to Phase 2 when lap-level data is introduced.

**Rationale**: The OpenF1 `/session_result` endpoint does not include a fastest lap field. Deriving it requires fetching all lap times via `/laps?session_key=<key>`, which can return hundreds of rows (20 drivers × ~60 laps = ~1200 rows). Fetching this data solely for a boolean indicator is a disproportionate network cost. The spec notes fastest lap "wherever data source provides it" — since the natural source is unavailable at reasonable cost, it is deferred. When Phase 2 lap charts are built, the fastest lap lap number will already be available in memory.

**Alternatives considered**:
- Fetch `/laps` and find minimum lap time — discarded: ~1200 rows for a single boolean, exceeds rate limit budget for a page load.
- Guess based on `position` + `gap_to_leader` — discarded: unreliable; fastest lap driver can be classified outside top 10.

---

## Decision 3: Column set adapts to session type

**Decision**: `ClassificationGrid` receives `sessionType` as a prop and renders different column sets for race-type sessions (Race, Sprint) vs timed sessions (Qualifying, Sprint Qualifying, Practice 1/2/3).

**Rationale**: Race sessions show gap-to-leader as the time metric. Qualifying and Practice sessions show a best lap time. These are fundamentally different data fields. The `session_type` string is available from the session record fetched by `useSessions`. The column selection logic belongs in the presentation component, not the hook — the hook normalizes data, the component decides how to display it.

**Alternatives considered**:
- Always show `gap_to_leader` column — discarded: qualifying results don't have gaps; field is null/irrelevant.
- Pass explicit `columnDefs` from the page — discarded: unnecessary prop passing; the component already knows its own column structure.

---

## Decision 4: Qualifying `duration` format

**Decision**: In `useSessionDetail`, compute a derived `best_time` field per result row: for qualifying sessions `duration` is an array `[Q1, Q2, Q3]` — take the last non-null element as the best qualifying time. For practice sessions `duration` is a single number. For race sessions `best_time` is `null` (gap is used instead).

**Rationale**: The OpenF1 API returns `duration` as an array for qualifying (confirmed via research). The last non-null element represents the final knockout round the driver participated in — their best qualifying performance. This normalisation in the hook keeps the grid component from needing to understand array vs scalar logic.

**Alternatives considered**:
- Take the minimum of the array — discarded: minimum might not be the best time relative to the session's knockout format.
- Show all three qualifying times in separate columns — discarded: complex and not in Phase 1 scope.

---

## Decision 5: Status field for DNF/DNS/DSQ

**Decision**: In `useSessionDetail`, map the three separate boolean flags (`dnf`, `dns`, `dsq`) to a single `status` string field: "DNF", "DNS", "DSQ", or "Finished". Render it with `StatusCellRenderer` using the shared `statusStyles.js` map.

**Rationale**: The ag-grid column model works best with a single field per cell. Three booleans would require complex `valueGetter` logic in the grid definition. A pre-computed `status` string is cleaner and matches the existing `STATUS_STYLES` pattern already established for the SessionsGrid and CalendarGrid. Adding "DNF", "DNS", "DSQ" to the shared `statusStyles.js` is a backward-compatible extension.

**Alternatives considered**:
- Show raw boolean columns `dnf`/`dns`/`dsq` — discarded: poor readability, three columns for one classification state.
- Use `position` alone (nulling out DNF positions) — discarded: OpenF1 assigns DNF drivers positions beyond the finishers, causing ambiguity.

---

## Decision 6: Pit stops section visibility

**Decision**: The pit stops section is rendered only when at least one pit stop record exists for the session. For sessions with no pit data (qualifying, practice, cancelled races), the section is absent entirely — no empty table, no "No pit stops" placeholder.

**Rationale**: Qualifying and practice sessions legitimately have no pit stops. Showing an empty section adds visual noise with no value. An empty `pitStops` array from the hook is a clean signal to omit the section, consistent with the conditional render pattern used for loading/empty states throughout the app.

**Alternatives considered**:
- Always show the section with a "No pit stops recorded" message — discarded: adds visual noise; a race with no pit data recorded is distinct from a qualifying session; the distinction is not useful to the user.

---

## Decision 7: Back navigation

**Decision**: The page derives `meeting_key` from the fetched session record and uses it to construct the back-navigation link to `/meetings/:meeting_key`, preserving any `?year=` search param.

**Rationale**: The URL at `/sessions/:key` has no meeting context. The session record from `/sessions?session_key=<key>` includes `meeting_key`, which is exactly what's needed. This is refresh-safe and direct-URL-safe, consistent with Decision 1 from the 004-meeting-sessions research (prefer fetched data over router state).

**Alternatives considered**:
- Pass `meeting_key` via router `state` from MeetingPage — discarded: lost on refresh, breaks deep links.
- Back button using `navigate(-1)` — discarded: unreliable (if user arrived via direct URL, goes to browser history, not the meeting page).
