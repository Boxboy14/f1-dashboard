# Feature Specification: Meeting Sessions Grid

**Feature Branch**: `004-meeting-sessions`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "Lets build the Sessions grid now. The sessions grid must have all the details about a session along with the status. Clicking on any session on the calendar grid must redirect to that sessions info as planned."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View GP Weekend Sessions (Priority: P1)

An F1 fan clicks on a race in the Calendar grid and is taken to the GP weekend overview page. There they see a list of all sessions in that race weekend — Free Practice 1, Free Practice 2, Free Practice 3, Qualifying, and the Race — each with its name, session type, date, and a status indicating whether it has already taken place or is still upcoming.

**Why this priority**: This is the core purpose of the page. The Calendar grid (already built) links out to `/meetings/:key` on row click, but that route currently doesn't exist. This story closes that gap and gives fans a complete picture of any GP weekend with one click. Every other piece of session-level data depends on this page existing.

**Independent Test**: Navigate to `/seasons?year=2025`. Click any race row in the calendar. A new page loads at `/meetings/<key>` showing all sessions for that GP weekend. Each session row shows name, type, date/time, and Completed/Upcoming/In Progress status. Changing no other state.

**Acceptance Scenarios**:

1. **Given** the user is on the Calendar tab for any season, **When** they click on a race row, **Then** they are navigated to the GP weekend page for that race showing all its sessions.
2. **Given** the GP weekend page has loaded, **When** the user scans the sessions list, **Then** they can see the session name (e.g. "Practice 1"), session type, scheduled date and time, and a status badge for every session in the weekend.
3. **Given** the GP weekend page has loaded, **When** the user checks a session that has already occurred, **Then** that session's status shows "Completed".
4. **Given** the GP weekend page has loaded, **When** the user checks a session that has not yet occurred, **Then** that session's status shows "Upcoming".
5. **Given** the GP weekend page is loading data, **When** the sessions are still being fetched, **Then** a loading indicator is shown so the user knows data is in flight.
6. **Given** the user arrived at the GP weekend page from the Calendar, **When** they press the browser back button, **Then** they return to the Calendar with the same season still selected.
7. **Given** the GP weekend page has loaded, **When** the user scans the page, **Then** the GP name and country are visible as a page heading so they know which race weekend they are viewing.

---

### User Story 2 - Navigate to Session Detail (Priority: P2)

An F1 fan wants to dig into a specific session — for example, the Race classification or Qualifying results. From the GP weekend sessions list, they click a session row and are taken to the session detail page for that session.

**Why this priority**: Extends the GP weekend page into a full drill-down path. Lower priority than the sessions list itself because the list alone is useful — this adds depth by opening up each session's results. The session detail page (`/sessions/:key`) is a separate future feature and may only partially exist when this is built.

**Independent Test**: On the GP weekend page, click any session row. The user is navigated to `/sessions/<key>` for that session. Pressing browser back returns to the GP weekend page.

**Acceptance Scenarios**:

1. **Given** the user is viewing the GP weekend sessions list, **When** they click on a session row, **Then** they are navigated to the session detail page at `/sessions/<key>` for that session.
2. **Given** the user navigated to a session detail page, **When** they press browser back, **Then** they return to the GP weekend page with the same GP still shown.
3. **Given** the session detail page has not yet been built, **When** the user clicks a session row, **Then** they still navigate to the correct `/sessions/:key` URL — the route may render an empty or placeholder page without breaking the app.

---

### Edge Cases

- What if the meeting has no sessions returned by the data source? The page must show an empty state (no blank screen, no crash).
- What if a session is currently in progress (started but not yet ended)? Status should reflect an "In Progress" state rather than forcing it into Completed or Upcoming.
- What if session date/time data is missing for a session? The date cell should display a dash or "TBC" rather than erroring.
- What if the `meeting_key` in the URL does not match any known meeting? The page must show a "not found" state rather than crashing.
- Sprint race weekends include additional sessions (Sprint Qualifying, Sprint Race) — the sessions list must display all sessions returned for the meeting, not just the standard 5.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The GP weekend page MUST be accessible by navigating to `/meetings/:key` where `:key` is the meeting identifier.
- **FR-002**: The GP weekend page MUST display the GP name and country as a page heading.
- **FR-003**: The sessions list MUST show all sessions for the selected meeting: name, session type, scheduled date/time, and status.
- **FR-004**: Session status MUST be derived from the session's start and end dates relative to the current time:
  - "Completed" if the session end time is in the past.
  - "In Progress" if the current time is between start and end.
  - "Upcoming" if the session start time is in the future.
- **FR-005**: Sessions MUST be displayed in chronological order (earliest session first).
- **FR-006**: The GP weekend page MUST show a loading state while session data is being fetched.
- **FR-007**: The GP weekend page MUST show a meaningful empty state if no sessions are returned for the meeting.
- **FR-008**: Clicking a row in the sessions list MUST navigate the user to `/sessions/:key` for that session.
- **FR-009**: The active season (year) MUST be preserved in the URL when navigating between the calendar, the GP weekend page, and a session detail page.
- **FR-010**: Clicking a race row in the Calendar grid MUST navigate the user to the GP weekend page for that race (this wires up the existing double-click navigation in the Calendar).

### Key Entities

- **Meeting**: A Grand Prix weekend. Key attributes: meeting key, official GP name, country, year. One meeting has many sessions.
- **Session**: A single on-track session within a meeting. Key attributes: session key, meeting key, session name, session type (Practice, Qualifying, Race, Sprint, etc.), scheduled start date/time, scheduled end date/time, status (Completed / In Progress / Upcoming).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user arriving at the GP weekend page can identify the GP name, all session names, and each session's status within 5 seconds.
- **SC-002**: Navigating from the Calendar to the GP weekend page takes no more than 2 seconds under normal network conditions.
- **SC-003**: The page renders a loading or empty state in 100% of cases where data is unavailable — no blank screens or JavaScript errors visible to the user.
- **SC-004**: All sessions for the selected GP weekend are visible on-screen without horizontal scrolling on a standard desktop display.
- **SC-005**: A user can navigate Calendar → GP Weekend → Session Detail and back through browser history in a single continuous flow without losing their selected season.

---

## Assumptions

- The Calendar grid's existing row-click navigation (double-click → `/meetings/:key`) is already wired and only needs the target route to exist.
- Session data comes from the same data source used throughout the app; no additional data sources are needed.
- "Race date" used for status computation is based on the session's own start/end timestamps, not the meeting's top-level date.
- Sprint weekends (with Sprint Qualifying and Sprint Race sessions) are handled automatically — the sessions list renders whatever sessions the data source returns without hard-coding a fixed list.
- The session detail page (`/sessions/:key`) is a future feature — this spec only covers navigation to it; its content is out of scope.
- The global season selector in the layout provides the year context, but the GP weekend page is keyed by meeting key (not year). The year is preserved in the URL query string for back-navigation consistency.
- Cancelled sessions (if any) are displayed in the list with a "Cancelled" status rather than being hidden.
