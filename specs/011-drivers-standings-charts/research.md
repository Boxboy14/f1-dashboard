# Research: Drivers Tab — Standings Evolution Charts

Phase 0 decisions. API behaviours were verified against the live OpenF1 API (Constitution II).

---

## 1. Per-round standings source — `/championship_drivers?session_key=X`

**Decision**: For each completed round, fetch `/championship_drivers?session_key={raceSessionKey}`. `points_current` is the driver's **cumulative** championship points after that race; `position_current` is their championship position after that race.

**Verification (live API, 2024)**:
- Standings at Bahrain (round 1, `session_key=9472`): leader `#1` = **26 pts**, pos 1; 20 rows.
- Standings at Abu Dhabi (final, `session_key=9662`): leader `#1` = **437 pts** (matches the inspiration screenshot's "2024 Drivers' Champion 437 pts"); 24 rows.
- Response fields: `meeting_key, session_key, driver_number, position_start, position_current, points_start, points_current`.

**Rationale**: The endpoint is session-scoped and cumulative — querying each round's race session yields the exact evolution both charts need, with no client-side points summing.

**Alternatives considered**: Summing `/session_result` points per race client-side → fragile (sprint/penalty/fastest-lap nuances); rejected since the championship endpoint already gives official cumulative standings.

**Edge fact surfaced**: row count grows across the season (20 → 24) — drivers who join mid-season simply have no row in early rounds (the "mid-season driver" edge case is real). Series must start where a driver first appears, not imply zero from round 1.

---

## 2. Rounds = races only (exclude sprints)

**Decision**: Rounds are the season's sessions where `session_type === "Race"` **and** `session_name === "Race"`, sorted by `date_start`. One round per meeting.

**Verification (live API, 2024)**: `session_type=Race` returns **30** sessions = `session_name` counts `{ Race: 24, Sprint: 6 }`; filtering to `session_name === "Race"` yields exactly **24** rounds across **24** unique meetings.

**Rationale**: Matches the clarified decision (races only; sprint points are already reflected in the standings after each round's race). Filtering by `session_name` is the reliable discriminator since OpenF1 tags sprint races with `session_type === "Race"` too.

---

## 3. Variable-length fan-out — TanStack Query `useQueries`

**Decision**: Assemble the per-round standings with TanStack Query's first-party `useQueries`, one query per completed round, each keyed `["championship_drivers", { session_key }]` (mirroring the existing `useChampionshipDrivers` key) with `staleTime` so they dedupe and persist.

**Rationale**: The number of rounds varies per season (Rules of Hooks forbids calling `useQuery` in a loop). `useQueries` is the idiomatic variable-length solution, returns an array of results, and shares the global query cache → each round is fetched once, paced by the existing `schedule()` rate limiter, and persisted to `localStorage` by `persistQueryCache.js` (the Overview-tab caching the user asked for). Revisits/reloads hydrate instantly.

**The key concept (Rule 2 note)**: `useQueries({ queries: rounds.map(r => ({ queryKey, queryFn, staleTime, enabled })) })` is a single hook call regardless of N — that's what makes a dynamic fan-out legal and cache-coherent. Because the keys match any other `championship_drivers` usage, there's no duplicate fetching.

**Alternatives considered**:
- A loop of `useChampionshipDrivers` → illegal (variable hook count); rejected.
- One big custom query whose `queryFn` loops fetches → loses per-round cache granularity and persistence; rejected.

**Watch out**: only **completed** rounds get an enabled query (`enabled: raceDate < now`), so future rounds don't fire requests; the overall loading state is "any enabled query still loading".

---

## 4. Driver identity & colour

**Decision**: Map `driver_number` → `{ name, name_acronym, team_colour }` from `/drivers?session_key={lastCompletedRaceKey}` (the most complete roster). Line/label colour = `#${team_colour}`; fallback to a neutral Salt token colour when `team_colour` is missing.

**Rationale**: Standings rows carry only `driver_number`; the drivers endpoint supplies the name, 3-letter code, and team colour. `team_colour` is a hex **without** `#` (the app already prefixes it, e.g. TeamsGrid `border-left: 6px solid #${team_colour}`). Two same-team drivers share a colour by design (FR-004) and are told apart by the hover panel and the ranking chart's right-edge code labels.

**No-hex note**: these colours are **API data**, not the app's own palette, so using them as concrete strokes does not violate the design-system rule (same as existing team-colour usage). Chart chrome (axis/grid/tooltip surfaces) uses Salt tokens.

---

## 5. Charting — Recharts (existing dependency)

**Decision**: Both charts are Recharts `LineChart`s with one `<Line>` per driver (`dataKey` = `d${driver_number}`), reusing the telemetry charts' theming approach. No new dependency.

- **Points chart**: normal Y-axis (cumulative points), `connectNulls` so a mid-season joiner's line starts at their first round.
- **Ranking chart (bump)**: `<YAxis reversed domain={[1, N]} allowDecimals={false} />` so position 1 is at the top and N at the bottom; `type="monotone"` lines crossing as positions change.

**Rationale**: Recharts already powers the telemetry charts; multi-series `LineChart` covers both. The bump chart is just a reversed integer Y-axis. Axis lines/ticks are themed by the existing global Recharts CSS (`index.css`); line strokes take concrete team-colour strings.

**Alternatives considered**: a dedicated bump-chart library → unjustified new dependency for what a reversed axis achieves; rejected.

---

## 6. X-axis country flags — custom tick

**Decision**: A shared `FlagAxisTick` renders the round's flag as an SVG `<image href={country_flag} … />` at each tick position (Recharts `XAxis tick={<FlagAxisTick rounds={…} />}`). Flag URLs come from the season meetings (`country_flag`), already used elsewhere (CalendarGrid/CountryCellRenderer).

**Rationale**: Recharts passes `{ x, y, payload }` to a custom tick; rendering an `<image>` centered under the tick gives the flag axis from the screenshots. Reuses existing flag data; no new asset pipeline.

**Watch out**: with ~24 flags, size them small (≈18–20px wide) and align centered so they don't overlap; the round index is the X datum (numeric), with the flag as its visual tick.

---

## 7. Hover panels (tooltips)

**Decision**: Custom Recharts `Tooltip content` per chart:
- **Points chart** — header shows the round's **flag + country + round number**; body lists **every driver** with cumulative points for that round, **sorted points desc, ties broken by `position_current`**, each name in its team colour (matches screenshot 1).
- **Ranking chart** — header shows flag + country + round; body shows the **single hovered driver** and their position (e.g. "Verstappen — 7th pos."), matching screenshot 2, and that driver's **line is highlighted** (thicker, full opacity) while the others are de-emphasised.

**Hovered-line detection (corrected)**: per-`<Line>` `onMouseEnter`/`onMouseLeave` is **unreliable** for a bump chart — crossing lines constantly re-fire enter/leave, so the tracked driver flips or clears and the panel shows nothing at most points. Instead, the chart's `onMouseMove` gives the active round (`activeLabel`), every line's value at that round (`activePayload`), and the cursor's chart Y (`chartY` / `activeCoordinate.y`). We map the cursor Y to a fractional position (`1 + (cy − plotTop)/(plotBottom − plotTop) × (N−1)`, using the known margins + X-axis height) and pick the driver whose position at that round is closest → a stable `hoveredDriver`. The tooltip and the line emphasis both read it.

**Rationale**: The points panel is naturally an all-driver ranked list (Recharts gives every series' value at the X point — we sort it). The ranking panel is per-driver by design; nearest-line-by-cursor detection makes the single-driver highlight reliable even where lines cross.

**Alternatives considered**: per-line mouse-enter events → flaky across crossings (the first attempt; rejected). Showing the full field in the ranking tooltip → reliable but off-design and redundant with the points panel; rejected in favour of the cursor-proximity single-driver panel.

---

## 8. Right-edge driver-code labels (ranking chart)

**Decision**: Render each driver's 3-letter `name_acronym` at the right end of their line, in team colour, using a Recharts `LabelList` whose content renders **only at the last data index** of each series (so one label per line, at the final round).

**Rationale**: Matches the screenshot's right-edge `NOR/VER/PIA…` labels and helps disambiguate same-colour teammates. Guarding on last index avoids a label at every point.

**Watch out**: near-tied final positions can overlap labels; acceptable for v1 (a small vertical nudge can be added later if needued). Reserve right margin in the chart for the labels.

---

## 9. Page layout reflow

**Decision**: `HomePage` becomes a responsive two-column CSS layout — `DriversGrid` in a constrained left column (≈360–420px), the `DriverStandingsCharts` container filling the remaining width with the two charts stacked. Below the mobile breakpoint, the columns stack (grid on top, charts below). The grid keeps its columns and `onDriverOpen` double-click behaviour untouched.

**Rationale**: Satisfies "squeeze the grid left" (FR-015/016) with a plain CSS Grid/flex split; no change to grid behaviour. The grid currently calls `api.sizeColumnsToFit()` so it adapts to the narrower column.

**Watch out**: ag-grid needs a defined height/width to render; the left column must give the grid a sensible height (it already lives in a scrollable content area). Verify the grid still fits its 3 columns without clipping at ~380px.

---

## 10. Loading & empty states

**Decision**: While any enabled round query is loading, the charts area shows a Salt `CircularProgress`. When the selected season has **no completed races**, show a Salt `Text` empty state ("Standings will appear after the first race") instead of empty axes (FR-013).

**Rationale**: Matches the app's existing loading/empty conventions (e.g. TelemetryPage) and avoids broken axes for not-yet-started seasons.
