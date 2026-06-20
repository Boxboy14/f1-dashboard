---
description: "Task list for Drivers Tab — Standings Evolution Charts"
---

# Tasks: Drivers Tab — Standings Evolution Charts

**Input**: Design documents from `specs/011-drivers-standings-charts/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/components.md ✅ · quickstart.md ✅

**Tests**: None requested — project convention is manual browser verification (quickstart.md). Implementation tasks only.

**Cross-cutting directives**:
- **No new dependencies** — charts reuse Recharts; data via existing `openF1Api` + TanStack Query.
- **Data layer discipline**: all access through `openF1Api` + TanStack Query (`useQueries`); every query keyed + `staleTime`; no raw `fetch`. Completed rounds only (`enabled: raceDate < now`).
- **No hardcoded palette hex**: chart chrome (axis/grid/tooltip) uses Salt tokens (existing telemetry pattern); driver line/label colours are **API team-colour data** (`#${team_colour}`) — allowed.
- **Races only**: rounds = sessions with `session_type === "Race"` **and** `session_name === "Race"` (sprints excluded).

**Organization**: Grouped by user story in priority order (US1 P1 → US3 P3).

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Parallelizable (different file, no dependency on an incomplete task)
- **[US#]**: User story the task serves

---

## Phase 1: Setup (shared building blocks)

- [X] T001 [P] Create `src/components/tabs/drivers/standings/standingsColors.js` — export `driverColor(team_colour)` returning `#${team_colour}` when present, else a readable neutral fallback (a resolved Salt token string, e.g. via the existing `cssColor` helper on `--salt-color-gray-500`). Pure function, no React. (FR-014)
- [X] T002 [P] Create `src/components/tabs/drivers/standings/FlagAxisTick.jsx` — a Recharts custom X-axis tick: receives `{ x, y, payload }` plus a `rounds` lookup, renders the round's `country_flag` as a centered SVG `<image>` (~18–20px wide) under the tick. (FR-001/006, FR-012)

---

## Phase 2: Foundational (Blocking Prerequisites for US1 + US2)

**Purpose**: The data-assembly hook both charts read from. **Blocks US1 and US2.** US3 (layout) does not depend on it.

- [X] T003 Create `src/hooks/useDriverStandingsEvolution.js` — `useDriverStandingsEvolution(year)`:
  - Resolve rounds: `useSessions({ year, session_type: "Race" })` filtered to `session_name === "Race"`, sorted by `date_start`; join each to its meeting via `useMeetings({ year })` for `country_name`/`country_flag`; mark `completed = date_start < now`; number rounds 1..n.
  - Fetch standings: `useQueries` over **completed** rounds, each `{ queryKey: ["championship_drivers", { session_key }], queryFn: () => openF1Api.championshipDrivers({ session_key }), staleTime: 10*60*1000, enabled: true }` (mirrors the existing `useChampionshipDrivers` key so it dedupes + persists).
  - Driver meta: `useDrivers({ session_key: lastCompletedRaceKey })` → map `driver_number → { name: full_name, code: name_acronym, color: driverColor(team_colour) }`.
  - Build `pointsData` / `rankData` rows (one per completed round): `{ round, countryName, countryFlag, [`d${dn}`]: points|null }` and `…: position|null` (per data-model.md); `driverCount = max position_current`; `drivers` sorted by latest position.
  - Return `{ rounds, drivers, pointsData, rankData, driverCount, isLoading, isEmpty }` — `isLoading` = any enabled query loading; `isEmpty` = no completed rounds. No raw `fetch`.

**Checkpoint**: Hook returns chart-ready data for a season; same-round queries dedupe and persist via the existing cache layer.

---

## Phase 3: User Story 1 — Driver Points Evolution (Priority: P1) 🎯 MVP

**Goal**: A team-coloured cumulative-points line chart over the season's flag axis, with a hover panel ranking every driver's points for the hovered round.

**Independent Test**: Pick 2024 in the navbar → "Driver Points Evolution" renders one line per driver over flag X-axis; hovering a round lists all drivers' points high→low; final round leader reads 437.

- [X] T004 [US1] Create `src/components/tabs/drivers/standings/PointsEvolutionChart.jsx` — props `{ rounds, drivers, data }`. Recharts `LineChart` over `data` inside a `ResponsiveContainer`; one `<Line dataKey={`d${driverNumber}`} stroke={driver.color} dot={false} connectNulls />` per driver; Y-axis cumulative points; `XAxis dataKey="round"` with `tick={<FlagAxisTick rounds={rounds} />}`; title "Driver Points Evolution" (`Text styleAs="h3"`). Custom `Tooltip content` → header = flag + `countryName` + `R{round}`, body = every driver with non-null points for that round **sorted points desc, ties by position asc**, each name in `driver.color`. (FR-001..005)
- [X] T005 [US1] Create `src/components/tabs/drivers/standings/DriverStandingsCharts.jsx` — props `{ year }`. Calls `useDriverStandingsEvolution(year)`; renders Salt `CircularProgress` while `isLoading`, a Salt `Text` empty state ("Standings will appear after the first race") when `isEmpty`, else `<PointsEvolutionChart rounds drivers data={pointsData} />`. (FR-011/013)
- [X] T006 [US1] In `src/components/dashboard/HomePage.jsx`, render `<DriverStandingsCharts year={year} />` after the grid (simple stacked placement for now — US3 reflows it). Keep the existing `<DriversGrid year onDriverOpen />`.
- [X] T007 [P] [US1] Create `src/components/tabs/drivers/standings/DriverStandingsCharts.module.scss` — chart panel + custom-tooltip surface styling using Salt tokens (container background, border, separators); no palette hex.

**Checkpoint**: US1 fully functional and visible on the Drivers tab.

---

## Phase 4: User Story 2 — Driver Ranking Evolution (Priority: P2)

**Goal**: A position "bump" chart (1 at top → N at bottom) over the same flag axis, with right-edge driver-code labels and an active-driver hover panel.

**Independent Test**: With 2024 selected, "Driver Ranking Evolution" renders positions 1..N (1 at top), team-coloured lines, right-edge 3-letter codes; hovering a line shows that driver's position at the hovered round.

- [X] T008 [US2] Create `src/components/tabs/drivers/standings/RankingEvolutionChart.jsx` — props `{ rounds, drivers, data, driverCount }`. Recharts `LineChart` over `data`; `<YAxis reversed domain={[1, driverCount]} allowDecimals={false} />`; one `<Line dataKey={`d${driverNumber}`} stroke={driver.color} dot={false} connectNulls />` per driver; `XAxis` with `FlagAxisTick`; title "Driver Ranking Evolution". Right-edge label per line = `driver.code` in `driver.color`, rendered only at each series' final round (e.g. a `LabelList`/custom label guarded on last index); reserve right margin. Custom `Tooltip content` → header = flag + `countryName` + `R{round}`, body = the **hovered** driver + position ("{name} — {pos}{ordinal} pos."), via per-`<Line>` `onMouseEnter`/`onMouseLeave` setting a `hoveredDriver` state (header-only when none hovered). (FR-006..010)
- [X] T009 [US2] In `src/components/tabs/drivers/standings/DriverStandingsCharts.jsx`, render `<RankingEvolutionChart rounds drivers data={rankData} driverCount={driverCount} />` below the points chart (stacked). (Same file as T005 — do after T005.)

**Checkpoint**: US1 + US2 both functional on the tab.

---

## Phase 5: User Story 3 — Drivers tab layout reflow (Priority: P3)

**Goal**: Grid in a narrow left column, charts stacked to its right; stacks on mobile.

**Independent Test**: At desktop width the grid sits in a narrow left column with charts filling the right; double-click a row still opens the driver card; mobile stacks without horizontal overflow.

- [X] T010 [US3] Create `src/components/dashboard/HomePage.module.scss` (two-column responsive: grid column ≈360–420px + charts column filling remaining width; stack under the mobile breakpoint) and update `src/components/dashboard/HomePage.jsx` to use it — grid left, `DriverStandingsCharts` right. Preserve the `<Text styleAs="h1">Drivers</Text>` heading and `onDriverOpen`. (Same file as T006 — do after T006.) (FR-015/016)
- [X] T011 [P] [US3] In `src/components/tabs/drivers/DriversGrid.jsx` (and its module.scss if needed), ensure the grid renders correctly at the constrained width — keep `onGridReady` `sizeColumnsToFit()` and a sensible grid height so the 3 columns aren't clipped at ~380px.

**Checkpoint**: All three stories functional; layout matches the design.

---

## Phase 6: Polish & Verification

- [X] T012 Run `npm run build` + `npx eslint src` (both clean), then `grep -rnE "#[0-9a-fA-F]{3,8}\b" src/components/tabs/drivers/standings src/hooks/useDriverStandingsEvolution.js` and confirm only data-derived `#${team_colour}` colours appear (no literal palette hex). Fix any straggler.
- [X] T013 [P] Update root `plan.md` (Phase 1 "Pending" / snapshot) to note the Drivers tab now has the Points Evolution + Ranking Evolution charts (feature 011).
- [ ] T014 Execute `specs/011-drivers-standings-charts/quickstart.md` (US1–US3 + cache reload check + theme flip + no-hex grep) — **manual browser check, pending user**.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (T001–T002)**: independent; can start immediately. T002 (FlagAxisTick) is used by both charts.
- **Foundational (T003)**: needs nothing new, but **blocks US1 (T004–T007) and US2 (T008–T009)**. US3 does not depend on it.
- **US1 (T004–T007)** → **US2 (T008–T009)**: US2 adds a second chart to the US1 container.
- **US3 (T010–T011)**: needs the container mounted (T006); otherwise independent.
- **Polish (T012–T014)**: after the stories being shipped are done.

### Same-file sequences (run in order)

- `DriverStandingsCharts.jsx`: **T005 → T009**
- `HomePage.jsx`: **T006 → T010**

### Parallel opportunities

```text
# Setup — different files
T001 standingsColors.js
T002 FlagAxisTick.jsx

# Within US1 — different files (after T003)
T004 PointsEvolutionChart.jsx   ┐
T007 DriverStandingsCharts.module.scss ┘  (parallel with each other; T005/T006 sequence the wiring)
```

---

## Implementation Strategy

### MVP first

1. Setup (T001–T002) → Foundational (T003) → **US1 (T004–T007)**. Stop and validate the Points Evolution chart (the headline feature) on the Drivers tab.

### Incremental delivery

1. Setup + Foundational → US1 (points chart visible) → validate.
2. US2 (ranking bump chart) → validate.
3. US3 (two-column reflow) → validate.
4. Polish: build + lint + hex grep, root plan.md, quickstart.

### Notes

- The one new concept is `useQueries` for the variable-length per-round fan-out (Rule-2 walkthrough in research.md §3) — a single hook call regardless of round count, cache-coherent with the existing `championship_drivers` key.
- Commit after each task or logical group.
