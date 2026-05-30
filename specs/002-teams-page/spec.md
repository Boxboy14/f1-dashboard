# Feature Specification: Teams Page

**Feature Branch**: `002-teams-page`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "The teams page must hold all the info about the teams participating in the selected season. As per the data from openF1, teams grid must have info about both their drivers in the season, team standings in the championship, points."

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

### Edge Cases

- What happens when a team has fewer than two drivers registered for a session (e.g., a driver substitution mid-season means only one driver has championship points)?
- How does the grid behave when the OpenF1 API returns no championship data for the selected season?
- What if a driver is listed under multiple teams in the same season (rare, but can happen with mid-season seat changes)?
- What if the season is still in progress and the championship data is partial (e.g., some rounds not yet completed)?

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

### Key Entities

- **Constructor (Team)**: Represents an F1 constructor participating in a season. Key attributes: team name, championship rank, total points, team identifier/slug for routing.
- **Driver (in team context)**: A driver assigned to a constructor for a given season. Key attributes: driver name, driver number, individual championship points, individual championship rank.
- **Championship Standing**: The ranked result of a constructor or driver for a specific season. Attributes: rank, points, entity reference (team or driver).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All constructors for the selected season are visible on the Teams page without any additional user interaction (no pagination required for a typical F1 season of 10 teams).
- **SC-002**: Switching the season selector updates the teams grid within 2 seconds under normal network conditions.
- **SC-003**: A user can identify a team's championship position and points within 5 seconds of arriving on the page.
- **SC-004**: Navigating from the teams grid to a team detail page and back preserves the selected season in both directions — verified by checking the URL contains the correct `year` parameter throughout.
- **SC-005**: The page renders a meaningful loading or empty state in 100% of cases where data is unavailable — no blank screens or JavaScript errors shown to the user.

## Assumptions

- The selected season is controlled globally via the season selector in the navigation bar — the Teams page reads this value and does not own its own season picker.
- Data coverage is limited to 2023, 2024, and 2025 (OpenF1 free tier). Seasons outside this range are not supported.
- Team color/branding is a nice-to-have and is not required for this feature. The grid communicates identity through team name and driver names.
- A "team detail page" for this feature scope covers driver-level championship data only. Race-by-race results and head-to-head comparisons are deferred to a future feature iteration.
- When a team has a mid-season driver change, both drivers who scored points for the team appear in the detail view. The grid row shows the most prominent two drivers (highest points earners).
- The teams grid displays the final or most recent championship standings for the selected season — it does not show round-by-round progression.
