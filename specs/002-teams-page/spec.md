# Feature Specification: Teams Page

**Feature Branch**: `002-teams-page`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "The teams page must hold all the info about the teams participating in the selected season. As per the data from openF1, teams grid must have info about both their drivers in the season, team standings in the championship, points."

**Extension input** (2026-06-20): "Similar to the Drivers tab, add two season-standings charts to the Teams tab — a Team Points Evolution chart (cumulative constructor points per round) and a Team Ranking Evolution chart (constructor championship position per round) — sharing a chronological country-flag X-axis, colouring each team's line by its team colour, with per-round hover panels; reflow the page so the standings grid sits in a narrower left column with the charts stacked right."

## Clarifications

### Session 2026-06-20

- Q: Should sprint rounds appear as separate X-axis points, or races only? → A: Races only, mirroring the Drivers tab decision — sprint sessions are not plotted as separate rounds; their points are reflected in the standings after the round's race.
- Q: How should the per-round constructor standings be fetched without exceeding the OpenF1 rate limit? → A: Same approach as the Drivers tab — fetch each round's `/championship_teams` standings once via TanStack Query `useQueries`, cached/persisted like the rest of the app, so a season's evolution is assembled once and restored from cache on later visits/reloads.
- Q: `/championship_teams` doesn't return a team colour — where does the line colour come from? → A: Same join already used by `useTeamsByYear` — resolve each team's colour from `/drivers` (`team_colour` keyed by `team_name`), unioning the first and last completed round's rosters so a team that fields a mid-season driver swap still resolves a colour.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Constructor Standings Grid (Priority: P1)

An F1 fan navigates to the Teams page to see how all constructors are performing in the currently selected season. They want to quickly scan championship rank, total points, and know which two drivers are racing for each team — all in a single view without clicking into individual team pages.

**Why this priority**: This is the core value of the page — a complete season-level view of all constructors. Everything else builds on this.

**Independent Test**: Can be fully tested by navigating to `/teams` and verifying that a list of all constructors appears with championship rank, points, and two driver names per team. Delivers standalone value as a constructor standings reference.

**Acceptance Scenarios**:

1. **Given** the user has selected the 2025 season, **When** they navigate to `/teams`, **Then** they see all constructors that participated in the 2025 season, each displaying: championship rank, team name, total championship points, and both drivers' names.
2. **Given** the user is on the Teams page, **When** they change the season to 2023 using the global season selector, **Then** the grid updates to show only the constructors and drivers from the 2023 season with their respective standings.
3. **Given** the user is on the Teams page, **When** the data is still loading, **Then** the page displays a loading state so the user knows data is being fetched.
4. **Given** the user is on the Teams page, **When** no data is available for the selected season, **Then** the page shows a clear "no data" message instead of a blank or broken layout.
5. **Given** the teams data has loaded, **When** the user scans the grid, **Then** teams are ordered by their championship rank (1st place at the top).

---

### User Story 2 - Team Detail View (Priority: P2)

An F1 fan wants to dig deeper into a specific constructor's season. They click on a team from the standings grid and are taken to a team detail page showing both drivers' individual championship standings and points for that season.

**Why this priority**: Extends the grid with meaningful per-team context. Lower priority than the grid because the grid alone is useful; this adds depth for fans who want more than standings.

**Independent Test**: Can be fully tested by clicking a team row and verifying the detail page loads with the correct team name, both driver names, and each driver's individual championship points and position.

**Acceptance Scenarios**:

1. **Given** the user is viewing the teams grid, **When** they click on a team row, **Then** they are navigated to `/teams/:slug` showing that team's detail page.
2. **Given** the user is on a team detail page, **When** the page loads, **Then** they see both drivers assigned to that team in the selected season along with each driver's individual championship points and rank.
3. **Given** the user is on a team detail page, **When** they click the browser back button or a back navigation element, **Then** they return to the teams grid with the season selection preserved.
4. **Given** the user navigates directly to `/teams/red-bull-racing` with `?year=2023` in the URL, **When** the page loads, **Then** the correct 2023 team and driver data is displayed.

---

### User Story 3 - Team Points Evolution chart (Priority: P3)

A fan on the Teams page wants to see how every constructor's championship points built up across the season, round by round, and read the exact standings at any single round.

**Why this priority**: Builds on the grid (US1) and detail dialog (US2) with a season-story view of the same data already on the page; independently shippable once the grid exists.

**Independent Test**: With a season selected in the navbar, the Teams page shows a "Team Points Evolution" line chart with one line per constructor; the X-axis is the season's races as country flags in calendar order; hovering a round shows a panel listing every team and their cumulative points for that round, sorted highest to lowest.

**Acceptance Scenarios**:

1. **Given** a season with completed races is selected, **When** the Teams page loads, **Then** a "Team Points Evolution" chart renders one line per constructor, each line in that team's colour, with cumulative championship points on the Y-axis and the season's races (country flags, in calendar order) on the X-axis.
2. **Given** the points chart is rendered, **When** the user hovers (or focuses) a round on the X-axis, **Then** a panel shows that round's country and round number and lists every team with their cumulative points after that round, sorted from highest to lowest.
3. **Given** a season that is partway through, **When** the chart renders, **Then** it only plots rounds that have completed (no empty future rounds), and lines extend only to the latest completed round.

---

### User Story 4 - Team Ranking Evolution chart (Priority: P4)

A fan wants to see how each constructor's championship *position* rose and fell across the season — the order-changes the points chart doesn't make obvious.

**Why this priority**: Complements US3 with the bump-chart view; the page already delivers value with the grid and points chart alone, so this is last among the chart stories.

**Independent Test**: With a season selected, the Teams page shows a "Team Ranking Evolution" chart with championship positions (1 at the top down to N at the bottom) on the Y-axis and the same race-flag X-axis; each team's line shows their position after each round, coloured by team, with the team's name labelled at the right edge.

**Acceptance Scenarios**:

1. **Given** a season is selected, **When** the Teams page loads, **Then** a "Team Ranking Evolution" chart renders with the Y-axis showing positions 1..N (1 at the top), the same race-flag X-axis as the points chart, and one team-coloured line per constructor tracing their championship position after each round.
2. **Given** the ranking chart is rendered, **When** the user hovers a team's line at a round, **Then** that team's line is highlighted (emphasised) and the others de-emphasised, and a panel shows the round's country/round plus that team's name and position at that round.
3. **Given** the number of teams in the season varies, **When** the chart renders, **Then** the Y-axis range adapts to the actual constructor count (1..N).
4. **Given** the chart renders, **When** the user looks at the right edge, **Then** each line ends with the team's name in their team colour.

---

### User Story 5 - Teams page layout reflow (Priority: P5)

A fan wants the page to make good use of space now that the standings grid no longer needs the full width.

**Why this priority**: A presentational reflow that makes the new charts fit cleanly; the charts deliver value in a temporary stacked layout first, so this is lowest priority.

**Independent Test**: On the Teams page at desktop width, the standings grid occupies a narrower column on the left, and the two charts occupy the remaining space (stacked) to its right; the grid remains fully usable (sortable, row double-click still opens the team detail dialog).

**Acceptance Scenarios**:

1. **Given** the Teams page at desktop width, **When** it renders, **Then** the standings grid is constrained to a narrower left column rather than spanning the full page width, and the two charts fill the remaining width.
2. **Given** the reflowed layout, **When** the user double-clicks a grid row, **Then** the team detail dialog still opens (existing behaviour preserved).
3. **Given** a narrow/mobile width, **When** the page renders, **Then** the grid and charts stack vertically and remain readable (no horizontal overflow).

---

### Edge Cases

- What happens when a team has fewer than two drivers registered for a session (e.g., a driver substitution mid-season means only one driver has championship points)?
- How does the grid behave when the OpenF1 API returns no championship data for the selected season?
- What if a driver is listed under multiple teams in the same season (rare, but can happen with mid-season seat changes)?
- What if the season is still in progress and the championship data is partial (e.g., some rounds not yet completed)?
- **No completed races yet** (season not started): both charts show an empty/"standings available after the first race" state instead of a broken axis.
- **A single completed round**: charts render with one X point per team (a dot, not a line) without erroring.
- **Missing team colour**: fall back to a neutral readable colour so the line/label is still visible (mirrors the Drivers tab's driver-colour fallback).
- **Mid-season constructor entry/exit** (rare): a team's line begins/ends at the rounds where they actually appear in the standings, rather than implying a position for rounds they didn't race.
- **Ties on points** in the points-chart hover panel: teams with equal points are ordered by championship position (the official tiebreaker), not arbitrarily.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Teams page MUST display all constructors that participated in the selected season.
- **FR-002**: Each team entry MUST show the team's championship rank for the selected season.
- **FR-003**: Each team entry MUST show the team's total championship points for the selected season.
- **FR-004**: Each team entry MUST show the names of both drivers who raced for that team in the selected season.
- **FR-005**: Teams MUST be displayed in ascending championship rank order (rank 1 first).
- **FR-006**: The Teams page MUST respond to the global season selector — changing the season updates all teams data without requiring a page reload.
- **FR-007**: The Teams page MUST display a loading indicator while championship data is being fetched.
- **FR-008**: The Teams page MUST display a meaningful empty state message if no data is available for the selected season.
- **FR-009**: Each team row MUST be clickable, navigating the user to a team detail page at `/teams/:slug`.
- **FR-010**: The team detail page MUST show both drivers' individual championship points and rank within the selected season.
- **FR-011**: The selected season MUST persist in the URL when navigating to a team detail page (e.g., `?year=2023`).
- **FR-012**: Navigating back from a team detail page MUST return the user to the teams grid with the season selection intact.
- **FR-013**: Each team row MUST display a visual color indicator using the team's official constructor color, so users can identify teams at a glance without reading the name.

**Team Points Evolution (US3)**

- **FR-014**: The Teams page MUST display a chart titled "Team Points Evolution" with cumulative championship points on the Y-axis and the season's rounds on the X-axis, rendered as the round's country flag in calendar (chronological) order.
- **FR-015**: The chart MUST plot one line per constructor in the season, tracing that team's cumulative championship points after each completed round.
- **FR-016**: Each team's line MUST be coloured using that team's colour.
- **FR-017**: Hovering or focusing a round MUST reveal a panel showing the round's country and round number and listing every team with their cumulative points after that round, sorted highest-to-lowest (ties broken by championship position).
- **FR-018**: The chart MUST only include rounds that have completed; future rounds MUST NOT appear as empty points.

**Team Ranking Evolution (US4)**

- **FR-019**: The Teams page MUST display a chart titled "Team Ranking Evolution" with championship position on the Y-axis (1 at the top, increasing downward to the number of teams N) and the same race-flag X-axis as the points chart.
- **FR-020**: The chart MUST plot one line per constructor tracing their championship position after each completed round, coloured by team colour.
- **FR-021**: The Y-axis range MUST adapt to the actual number of constructors in the selected season (1..N).
- **FR-022**: Each line MUST be labelled at the right edge with the team's name, in the team's colour.
- **FR-023**: Hovering a team's line MUST reveal a panel showing the round's country/round and **that single team's** name and position at the hovered round.
- **FR-023a**: While a team's line is hovered, that line MUST be visually highlighted (emphasised stroke) and the other teams' lines de-emphasised (the right-edge label follows the same emphasis). Line detection MUST be reliable where lines cross (i.e., based on proximity to the cursor, not per-line mouse-enter events).

**Shared / data (US3 + US4)**

- **FR-024**: Both charts MUST be scoped to the season selected in the navbar year selector and MUST update when the selected year changes.
- **FR-025**: Both charts MUST use the same set of rounds and the same chronological flag X-axis, derived from the season's **Race** sessions only (one point per round; sprint sessions are not separate points).
- **FR-026**: Each round's constructor standings MUST be fetched once and cached/persisted (matching the app's existing cache-persistence behaviour), so the assembled season is restored from cache on later visits/reloads rather than re-fetched, and repeated fetches of the same round MUST be deduplicated.
- **FR-027**: When standings are not yet available (no completed races), both charts MUST show a clear empty state rather than an error or broken axis.
- **FR-028**: Team-to-colour mapping MUST come from team/driver data (not hardcoded per team), and a readable fallback colour MUST be used when a team colour is missing.

**Layout (US5)**

- **FR-029**: The existing standings grid MUST remain on the Teams page with its current columns and existing behaviours (sorting, double-click opens the team detail dialog), but constrained to a narrower left column at desktop width.
- **FR-030**: The two charts MUST occupy the remaining width to the right of the grid (stacked), and the whole layout MUST stack vertically and remain readable at narrow/mobile widths.

### Key Entities

- **Constructor (Team)**: Represents an F1 constructor participating in a season. Key attributes: team name, championship rank, total points, team identifier/slug for routing.
- **Driver (in team context)**: A driver assigned to a constructor for a given season. Key attributes: driver name, driver number, individual championship points, individual championship rank.
- **Championship Standing**: The ranked result of a constructor or driver for a specific season. Attributes: rank, points, entity reference (team or driver).
- **Round (race)**: One championship round in the selected season — has a calendar order/round number, a country, and a country flag. The ordered list of rounds forms both new charts' X-axis.
- **Team standing at a round**: A constructor's cumulative championship points and championship position as of a given round — the per-round data point for both new charts.
- **Season standings series**: For each team, the ordered sequence of their points (US3) and positions (US4) across the season's completed rounds — i.e., one line per team.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All constructors for the selected season are visible on the Teams page without any additional user interaction (no pagination required for a typical F1 season of 10 teams).
- **SC-002**: Switching the season selector updates the teams grid within 2 seconds under normal network conditions.
- **SC-003**: A user can identify a team's championship position and points within 5 seconds of arriving on the page.
- **SC-004**: Navigating from the teams grid to a team detail page and back preserves the selected season in both directions — verified by checking the URL contains the correct `year` parameter throughout.
- **SC-005**: The page renders a meaningful loading or empty state in 100% of cases where data is unavailable — no blank screens or JavaScript errors shown to the user.
- **SC-006**: From the Teams page, a user can identify the points leader at any round and read every team's points for that round within 5 seconds of hovering it.
- **SC-007**: A user can see how a chosen team's championship position changed across the whole season at a glance, without interacting (the line's path is visible).
- **SC-008**: Both new charts correctly reflect the season selected in the navbar; changing the year updates both charts to that season's rounds and teams.
- **SC-009**: Both new charts render their fully-loaded state for a complete season within a few seconds on a normal connection, and never show a broken/empty axis when at least one race has completed.
- **SC-010**: The standings grid remains fully functional after the reflow (sortable; double-click opens the team detail dialog) and no longer spans the entire page width at desktop sizes.
- **SC-011**: Once a season's standings have been assembled, revisiting the Teams page or reloading the page renders both charts from cache without re-fetching each round.

## Assumptions

- The selected season is controlled globally via the season selector in the navigation bar — the Teams page reads this value and does not own its own season picker.
- Data coverage is limited to 2023, 2024, and 2025 (OpenF1 free tier). Seasons outside this range are not supported.
- Each team row is highlighted with the team's official constructor color as a left border accent (FR-013). The `team_colour` value from the OpenF1 API is a hex string without a leading `#` (e.g., `"F47600"`) and must be prefixed before use in CSS.
- A "team detail page" for this feature scope covers driver-level championship data only. Race-by-race results and head-to-head comparisons are deferred to a future feature iteration.
- When a team has a mid-season driver change, both drivers who scored points for the team appear in the detail view. The grid row shows the most prominent two drivers (highest points earners).
- The teams grid displays the final or most recent championship standings for the selected season — it does not show round-by-round progression (the new evolution charts cover that view).
- **"Round" = Race session** (decided): mirrors the Drivers tab — one X-axis point per championship round, taken from the season's Race sessions in date order; sprint sessions are NOT plotted as separate rounds.
- **Cumulative points**: the points chart shows season-cumulative championship points after each round (lines generally rise), matching the Drivers tab's chart — not points scored in the individual round.
- **Standings source**: per-round standings (points + position) come from `/championship_teams` as of each round's session; team colour is resolved via `/drivers` (`team_colour` keyed by `team_name`), the same join `useTeamsByYear` already performs; the country flag per round and round order come from the season calendar.
- **Data volume & caching** (decided): building the series requires reading `/championship_teams` at each completed round of the season. Each round's standings are fetched once, paced to respect API rate limits, and cached + persisted the same way the Drivers tab's evolution charts are, so the assembled season is restored from cache on later visits/reloads. The charts show a loading state while the season is first assembled.
- **Reuse**: charts reuse the app's existing charting approach (Recharts) and the existing country-flag axis pattern already used on the Drivers tab — no new dependencies.
