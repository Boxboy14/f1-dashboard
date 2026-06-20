# Feature Specification: Session Detail Page

**Feature Branch**: `005-session-detail`

**Created**: 2026-06-07

**Status**: Draft

**Input**: User description: "Now as per plan we need to implement the exact session details by double clicking on it."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Session Classification (Priority: P1)

As an F1 fan, when I double-click a session row in the GP weekend sessions list and arrive at the session detail page, I want to see the full final classification — driver positions, times, gaps, and fastest lap — so I can quickly understand what happened in that session.

**Why this priority**: The final classification is the primary outcome of any F1 session. Without it, the page has no content value. It is the reason a user would navigate here.

**Independent Test**: Navigate to any completed race or qualifying session URL (e.g., `/sessions/9551`), confirm the classification table loads with positions, driver names, teams, times, and gaps. No other feature is required to validate this story.

**Acceptance Scenarios**:

1. **Given** a completed race session, **When** the user navigates to the session detail page, **Then** a classification table is shown with each finisher's position, driver name, team, time/gap to leader, and fastest lap indicator.
2. **Given** a session with no results (upcoming, in progress, or cancelled), **When** the user navigates to the session detail page, **Then** an informative "No results available" message is shown instead of an empty table.
3. **Given** any session detail page, **When** it loads, **Then** the heading shows the season year, Grand Prix name, and session name as `{year} {gpName} - {sessionName} Results` (falling back to `{year} {sessionName} Results` until the GP name resolves), with the date below it.
4. **Given** any session detail page, **When** the user wants to go back, **Then** a navigation control returns them to the GP weekend sessions list for that meeting.

---

### User Story 2 - View Pit Stop History (Priority: P2)

As an F1 fan, I want to see the complete pit stop history for a session — which driver stopped, on which lap, and how long the stop took — so I can analyse race strategy. The pit stops open in an overlay dialog on demand so they don't crowd the classification view.

**Why this priority**: Pit strategy is a core part of race analysis. It enriches the classification view with tactical context. It is independent from classifications and can be shown or hidden without affecting US1.

**Independent Test**: Navigate to a completed race session. Confirm a "Click to view Pit Stops" button appears at the top-right of the results grid; clicking it opens a dialog titled `{year} {gpName} Pit Stops` containing the pit stops table (each driver's stops with lap number and duration in seconds). For non-race sessions (e.g., qualifying) with no pit data, confirm the button is absent.

**Acceptance Scenarios**:

1. **Given** a race session with pit stop data, **When** the user clicks the "Click to view Pit Stops" button at the top-right of the results grid, **Then** a dialog opens, titled `{year} {gpName} Pit Stops`, showing a pit stops table with driver name, team, lap number, and pit duration.
2. **Given** the pit stops dialog is open, **When** the user clicks the close button or clicks away, **Then** the dialog closes and returns focus to the results view.
3. **Given** a session with no pit stop data (qualifying, practice, or a race with no recorded stops), **When** the user views the session detail, **Then** the "Click to view Pit Stops" button is absent.
4. **Given** a driver with multiple pit stops in one race, **When** the user opens the pit stops dialog, **Then** all stops for that driver are listed (grouped under the driver, expandable to individual stops).

---

### Edge Cases

- What happens when a session has results but no driver name mappings (e.g., driver number not in current session drivers)? Driver number should be shown as fallback.
- How does the page handle a `session_key` in the URL that does not exist? A "Session not found" message is shown.
- Practice sessions have lap-based leaderboards, not gaps — the classification table should gracefully show whatever time data is available without crashing.
- Sprint sessions follow the same format as a Race; the page should render identically.
- A Race session where the leader did not finish (DNF at the front) may have `null` reference time — gaps may not be calculable and should display "—".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST display the season year, Grand Prix name, session name, and scheduled date/time in a header area, with the results heading formatted as `{year} {gpName} - {sessionName} Results`.
- **FR-002**: The page MUST show a final classification table with at minimum: finishing position, driver name, team name, and time or gap to leader.
- **FR-003**: The classification table MUST visually indicate which driver set the fastest lap.
- **FR-004**: The page MUST show an empty-state message when no classification data is available for the session.
- **FR-005**: When pit stop data is available for a race/sprint session, the page MUST show a "Click to view Pit Stops" button at the top-right of the results grid; the pit stops table MUST be presented in an overlay dialog titled `{year} {gpName} Pit Stops`, containing driver name, team, lap number, and pit duration.
- **FR-006**: The page MUST provide a navigation control (back link or breadcrumb) that returns the user to the parent GP weekend sessions list.
- **FR-007**: The page MUST handle invalid or unknown session keys gracefully, showing a "Session not found" message rather than crashing.
- **FR-008**: The pit stops dialog MUST be dismissible via a close control and standard click-away/escape behaviour.

### Key Entities

- **Session**: Identified by `session_key`; carries `session_name`, `session_type`, `date_start`, `meeting_key` for back-navigation. The Grand Prix name (`gpName`) is resolved from `/meetings` via the session's `meeting_key`.
- **ClassificationResult**: One row per finishing position; carries position, driver identifier, driver name, team name, time, gap to leader, fastest lap flag.
- **PitStop**: One row per pit event; carries driver identifier, driver name, team name, lap number, pit duration in seconds.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can reach a session's final classification within 3 clicks from the race calendar year view.
- **SC-002**: All drivers listed in the classification result are shown — no rows are silently dropped.
- **SC-003**: The fastest lap indicator is shown for exactly one driver (or zero if data is unavailable).
- **SC-004**: The page renders without errors for any session in the 2023–2025 OpenF1 dataset.
- **SC-005**: Pit stop data is shown for completed race sessions wherever the data source provides it.

## Assumptions

- Phase 1 scope covers the classification table and pit stop table only. Lap time charts and tire strategy timelines are Phase 2 and are out of scope for this feature.
- Driver names will be resolved from the session's driver list; if a driver number has no name mapping, the number is shown as a fallback.
- The OpenF1 `/session_result` endpoint is the authoritative source for classification data; `/pit` is the source for pit stop data; `/meetings` (by `meeting_key`) supplies the Grand Prix name.
- The user will always arrive at this page from the GP weekend sessions list (the `meeting_key` can be derived from the session's own data for back-navigation).
- Fastest lap determination comes directly from the `/session_result` data (`is_fastest_lap` or equivalent field).
- Starting grid data (`/starting_grid`) is out of scope for Phase 1 and will not be shown on this page.
