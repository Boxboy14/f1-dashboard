# Feature Specification: Drivers Tab — Standings Evolution Charts

**Feature Branch**: `011-drivers-standings-charts`

**Created**: 2026-06-20

**Status**: Draft

**Input**: User description: "Enhance the Drivers tab: keep the 3-column driver grid but squeeze it to the left, and add two season-standings charts — a Driver Points Evolution chart (points over each round, X-axis = race country flags in calendar order, hover shows every driver's points for that round ranked high→low) and a Driver Ranking Evolution chart (championship position 1..N over each round). Each driver is coloured by their team colour. Inspiration: app.formula1dashboard.com/driver-standings."

## Clarifications

### Session 2026-06-20

- Q: Should sprint rounds appear as separate points on the X-axis, or only races? → A: Races only — sprint sessions are not plotted as separate rounds; their points are reflected in the standings after the round's race.
- Q: The series needs per-round standings (up to ~24 lookups per season) — how should that be handled? → A: Fetch each round's standings once and cache + persist them the same way the rest of the app does (TanStack Query with localStorage persistence, as the Overview tab does), so a season's standings are assembled once and restored from cache on later visits/reloads.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Driver Points Evolution chart (Priority: P1)

A fan on the Drivers tab wants to see how every driver's championship points built up across the season, round by round, and to read the exact standings at any single round.

**Why this priority**: This is the headline addition — it turns a static grid into a season story and is the primary value the user asked for. It is independently shippable: the chart can exist and deliver value before the ranking chart or the layout reflow are perfected.

**Independent Test**: With a season selected in the navbar, the Drivers tab shows a "Driver Points Evolution" line chart with one line per driver; the X-axis is the season's races as country flags in calendar order; hovering a round shows a panel listing every driver and their cumulative points for that round, sorted highest to lowest.

**Acceptance Scenarios**:

1. **Given** a season with completed races is selected, **When** the Drivers tab loads, **Then** a "Driver Points Evolution" chart renders one line per driver, each line in that driver's team colour, with cumulative championship points on the Y-axis and the season's races (country flags, in calendar order) on the X-axis.
2. **Given** the points chart is rendered, **When** the user hovers (or focuses) a round on the X-axis, **Then** a panel shows that round's country and round number and lists every driver with their cumulative points after that round, sorted from highest to lowest.
3. **Given** a season that is partway through, **When** the chart renders, **Then** it only plots rounds that have completed (no empty future rounds), and lines extend only to the latest completed round.
4. **Given** two drivers share the same team, **When** their lines render, **Then** both use the team colour (they may be visually distinguished by the hover panel and labels, but the team colour is the line/label colour).

---

### User Story 2 - Driver Ranking Evolution chart (Priority: P2)

A fan wants to see how each driver's championship *position* (1st, 2nd, …) rose and fell across the season — the order-changes that the points chart doesn't make obvious.

**Why this priority**: Complements US1 with a different, highly engaging view (the crossing "bump chart"), but the tab already delivers value with US1 alone, so this is second.

**Independent Test**: With a season selected, the Drivers tab shows a "Driver Ranking Evolution" chart with championship positions (1 at the top down to N at the bottom) on the Y-axis and the same race-flag X-axis; each driver's line shows their position after each round and is coloured by team, with the driver's short code labelled at the right edge.

**Acceptance Scenarios**:

1. **Given** a season is selected, **When** the Drivers tab loads, **Then** a "Driver Ranking Evolution" chart renders with the Y-axis showing positions 1..N (1 at the top), the same race-flag X-axis as the points chart, and one team-coloured line per driver tracing their championship position after each round.
2. **Given** the ranking chart is rendered, **When** the user hovers a driver's line at a round, **Then** that driver's line is highlighted (emphasised) and the others de-emphasised, and a panel shows the round's country/round plus that driver's name and position at that round (e.g. "Verstappen — 7th pos.").
3. **Given** the number of drivers in the season varies (e.g. 20 or 21), **When** the chart renders, **Then** the Y-axis range adapts to the actual driver count (1..N).
4. **Given** the chart renders, **When** the user looks at the right edge, **Then** each line ends with the driver's three-letter code in their team colour.

---

### User Story 3 - Drivers tab layout reflow (Priority: P3)

A fan wants the page to make good use of space now that the 3-column grid no longer needs the full width.

**Why this priority**: A presentational reflow that makes the new charts fit cleanly; valuable but the charts can ship in a temporary stacked layout first.

**Independent Test**: On the Drivers tab at desktop width, the driver grid occupies a narrower column on the left, and the two charts occupy the remaining space (stacked) to its right; the grid remains fully usable (sortable, row double-click still opens the driver card).

**Acceptance Scenarios**:

1. **Given** the Drivers tab at desktop width, **When** it renders, **Then** the 3-column driver grid is constrained to a narrower left column rather than spanning the full page width, and the two charts fill the remaining width.
2. **Given** the reflowed layout, **When** the user double-clicks a grid row, **Then** the driver info card still opens (existing behaviour preserved).
3. **Given** a narrow/mobile width, **When** the tab renders, **Then** the grid and charts stack vertically and remain readable (no horizontal overflow).

---

### Edge Cases

- **No completed races yet** (season not started): both charts show an empty/"standings available after the first race" state instead of a broken axis.
- **A single completed round**: charts render with one X point per driver (a dot, not a line) without erroring.
- **Missing team colour** for a driver: fall back to a neutral readable colour so the line/label is still visible.
- **Driver who joined mid-season** (no standings in early rounds): their line begins at the first round they appear in, rather than implying zero from round 1 in a misleading way.
- **Ties on points** in the points-chart hover panel: drivers with equal points are ordered by championship position (the official tiebreaker), not arbitrarily.
- **Many rounds (~24)**: the X-axis stays readable (flags don't overlap illegibly) and the data loads within a reasonable time despite per-round standings lookups.

## Requirements *(mandatory)*

### Functional Requirements

**Driver Points Evolution (US1)**

- **FR-001**: The Drivers tab MUST display a chart titled "Driver Points Evolution" with cumulative championship points on the Y-axis and the season's rounds on the X-axis, rendered as the round's country flag in calendar (chronological) order.
- **FR-002**: The chart MUST plot one line per driver in the season, tracing that driver's cumulative championship points after each completed round.
- **FR-003**: Each driver's line MUST be coloured using that driver's team colour.
- **FR-004**: Hovering or focusing a round MUST reveal a panel showing the round's country and round number and listing every driver with their cumulative points after that round, sorted highest-to-lowest (ties broken by championship position).
- **FR-005**: The chart MUST only include rounds that have completed; future rounds MUST NOT appear as empty points.

**Driver Ranking Evolution (US2)**

- **FR-006**: The Drivers tab MUST display a chart titled "Driver Ranking Evolution" with championship position on the Y-axis (1 at the top, increasing downward to the number of drivers N) and the same race-flag X-axis as the points chart.
- **FR-007**: The chart MUST plot one line per driver tracing their championship position after each completed round, coloured by team colour.
- **FR-008**: The Y-axis range MUST adapt to the actual number of drivers in the selected season (1..N).
- **FR-009**: Each line MUST be labelled at the right edge with the driver's three-letter code, in the driver's team colour.
- **FR-010**: Hovering a driver's line MUST reveal a panel showing the round's country/round and **that single driver's** name and position at the hovered round (e.g. "Verstappen — 7th pos.").
- **FR-010a**: While a driver's line is hovered, that line MUST be visually highlighted (emphasised stroke) and the other drivers' lines de-emphasised (the right-edge code label follows the same emphasis). Line detection MUST be reliable where lines cross (i.e., based on proximity to the cursor, not per-line mouse-enter events).

**Shared / data (US1 + US2)**

- **FR-011**: Both charts MUST be scoped to the season selected in the navbar year selector and MUST update when the selected year changes.
- **FR-012**: Both charts MUST use the same set of rounds and the same chronological flag X-axis, derived from the season's **Race** sessions only (one point per round; sprint sessions are not separate points).
- **FR-012a**: Each round's standings MUST be fetched once and cached/persisted (matching the app's existing cache-persistence behaviour), so the assembled season is restored from cache on later visits/reloads rather than re-fetched, and repeated fetches of the same round MUST be deduplicated.
- **FR-013**: When standings are not yet available (no completed races), both charts MUST show a clear empty state rather than an error or broken axis.
- **FR-014**: Driver-to-colour mapping MUST come from team data (not hardcoded per driver), and a readable fallback colour MUST be used when a team colour is missing.

**Layout (US3)**

- **FR-015**: The existing driver grid MUST remain on the Drivers tab with its current columns (name, number, constructor) and existing behaviours (sorting, double-click opens the driver card), but constrained to a narrower left column at desktop width.
- **FR-016**: The two charts MUST occupy the remaining width to the right of the grid (stacked), and the whole layout MUST stack vertically and remain readable at narrow/mobile widths.

### Key Entities

- **Round (race)**: One championship round in the selected season — has a calendar order/round number, a country, and a country flag. The ordered list of rounds forms both charts' X-axis.
- **Driver standing at a round**: A driver's cumulative championship points and championship position as of a given round — the per-round data point for both charts.
- **Driver**: Identity for the chart — full name, three-letter code, and team association (which supplies the line/label colour).
- **Season standings series**: For each driver, the ordered sequence of their points (US1) and positions (US2) across the season's completed rounds — i.e., one line per driver.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From the Drivers tab, a user can identify the points leader at any round and read every driver's points for that round within 5 seconds of hovering it.
- **SC-002**: A user can see how a chosen driver's championship position changed across the whole season at a glance, without interacting (the line's path is visible).
- **SC-003**: Both charts correctly reflect the season selected in the navbar; changing the year updates both charts to that season's rounds and drivers.
- **SC-004**: Every driver's line is visually associated with their team via colour, and drivers can still be told apart via the hover panels and right-edge labels.
- **SC-005**: Both charts render their fully-loaded state for a complete season within a few seconds on a normal connection, and never show a broken/empty axis when at least one race has completed.
- **SC-006**: The driver grid remains fully functional after the reflow (sortable; double-click opens the driver card) and no longer spans the entire page width at desktop sizes.
- **SC-007**: Once a season's standings have been assembled, revisiting the Drivers tab or reloading the page renders both charts from cache without re-fetching each round (no repeated loading delay for an already-assembled season).

## Assumptions

- **Season scope**: Both charts follow the existing navbar year selector (2023–2025), matching how the rest of the app is year-scoped.
- **"Round" = Race session** (decided): One X-axis point per championship round, taken from the season's Race sessions in date order. Sprint sessions are NOT plotted as separate rounds — their points are reflected in the standings after the round's race.
- **Cumulative points**: The points chart shows season-cumulative championship points after each round (lines generally rise), matching the inspiration screenshot — not points scored in the individual round.
- **Standings source**: Per-round standings (points + position) come from the championship standings as of each round's session; the country flag per round and the round order come from the season calendar; team colours come from driver/team data.
- **Data volume & caching** (decided): Building the series requires reading the standings at each completed round of the season (up to ~24 lookups). Each round's standings are fetched once, paced to respect API rate limits, and cached + persisted the same way the rest of the app does (the Overview tab pattern) so the assembled season is restored from cache on later visits/reloads rather than re-fetched. The charts show a loading state while the season is first assembled.
- **Download control out of scope**: The inspiration screenshots show a per-chart download icon; exporting the charts is NOT part of this feature (can be a later enhancement).
- **2024-champion reference line out of scope (v1)**: The dashed "previous champion" reference line seen in the inspiration is a nice-to-have and not required for v1.
- **Team colours are data, not the app palette**: Per-driver line/label colours come from API-provided team colours (dynamic data), consistent with how the app already renders team colours elsewhere; this does not conflict with the design-system rule about not hardcoding the app's own colour scheme.
- **Reuse**: Charts reuse the app's existing charting approach and the existing country-flag rendering already used elsewhere in the app.
