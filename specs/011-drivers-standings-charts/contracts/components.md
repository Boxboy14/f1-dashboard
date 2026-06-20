# Component & Hook Contracts: Drivers Tab — Standings Evolution Charts

UI/data contracts. Salt-first for layout/chrome; Recharts for the charts; colours from team data.

---

## `useDriverStandingsEvolution(year)` (new hook)

```text
useDriverStandingsEvolution(year: number)
  → { rounds, drivers, pointsData, rankData, driverCount, isLoading, isEmpty }
```

- Resolves the season's **race** rounds (`session_type === "Race" && session_name === "Race"`, chronological), joins each to its meeting flag, and fetches `/championship_drivers` per **completed** round via `useQueries` (queryKey `["championship_drivers", { session_key }]`, `staleTime` ≥ 10 min, `enabled: completed`).
- Maps `driver_number → { name, code, color }` from `/drivers` at the last completed race.
- Builds `pointsData` / `rankData` rows (see data-model.md), `driverCount = max position`.
- **No raw `fetch`**; all via `openF1Api` + TanStack Query. Same-round queries are deduplicated and persisted by the existing cache layer.
- `isEmpty` when no completed rounds; `isLoading` while any enabled query is loading.

**Acceptance**: returns chart-ready rows + driver meta for the selected year; changing `year` re-resolves; no duplicate network calls for an already-cached season.

---

## `DriverStandingsCharts.jsx` (new container)

**Props**: `{ year }`.

- Calls the hook. Renders a Salt `CircularProgress` while `isLoading`, a Salt `Text` empty state when `isEmpty`, otherwise both charts stacked.
- Passes the shared `rounds` + `drivers` + the relevant dataset to each chart.

**Acceptance**: loading/empty/loaded states per FR-013; both charts share the same rounds/flags axis (FR-012).

---

## `PointsEvolutionChart.jsx` (new)

**Props**: `{ rounds, drivers, data }`.

- Title "Driver Points Evolution". Recharts `LineChart` over `data`; one `<Line dataKey={`d${dn}`} stroke={driver.color} dot connectNulls />` per driver. Y-axis cumulative points; X-axis custom `FlagAxisTick`.
- Custom `Tooltip`: header = round flag + country + "R{round}"; body = all drivers' points for that round, **sorted desc (ties by position)**, names in team colour. (FR-001..005)

**Acceptance**: team-coloured lines; flag X-axis in calendar order; hover lists every driver's points ranked high→low; only completed rounds plotted.

---

## `RankingEvolutionChart.jsx` (new)

**Props**: `{ rounds, drivers, data, driverCount }`.

- Title "Driver Ranking Evolution". Recharts `LineChart` over `data`; `<YAxis reversed domain={[1, driverCount]} allowDecimals={false} />`; one team-coloured `<Line dataKey={`d${dn}`} />` per driver.
- Right-edge `name_acronym` label per line (at its final round), in team colour.
- Custom `Tooltip`: header = round flag + country + "R{round}"; body = the **hovered** driver + position (e.g. "Verstappen — 3rd pos."), via per-line hover state. (FR-006..010)

**Acceptance**: positions 1..N (1 at top), adapts to driver count; flag X-axis; right-edge coded labels; hover shows a driver's position at that round.

---

## `FlagAxisTick.jsx` (new, shared)

**Props (Recharts tick)**: `{ x, y, payload }` + `rounds`.

- Renders the round's `country_flag` as a small centered SVG `<image>` (~18–20px) under the tick.

**Acceptance**: each X tick is the round's flag, centered, non-overlapping across ~24 rounds.

---

## `standingsColors.js` (new, shared)

```text
driverColor(team_colour: string|null) → string   // "#RRGGBB" or a neutral Salt fallback
```

**Acceptance**: prefixes `#`; returns a readable fallback when missing (FR-014); no hardcoded app-palette colour.

---

## `HomePage.jsx` + `HomePage.module.scss` (edit/new)

- Two-column responsive layout: `DriversGrid` constrained left (~360–420px), `DriverStandingsCharts` filling the right; stacks vertically under the mobile breakpoint. Grid keeps its columns + `onDriverOpen` double-click.

**Acceptance**: grid no longer spans full width at desktop; double-click still opens the driver card; no horizontal overflow on mobile (FR-015/016, SC-006).
