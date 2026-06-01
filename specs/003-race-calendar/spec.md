# Feature Specification: Race Calendar

**Feature Branch**: `003-race-calendar`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "The next grid to build is the Calendar grid. This grid would contain all the races in a particular season. In our case its 2023-2025."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Season Race Calendar Grid (Priority: P1)

An F1 fan navigates to the Calendar tab to see every race in the selected season at a glance. They want to know the round number, the GP name, the circuit and country, the race date, and whether the race has already taken place or is still upcoming — all in a single scrollable list without any additional interaction.

**Why this priority**: This is the core value of the page — a complete season schedule with past and upcoming races. Every other piece of GP-level data depends on first knowing what races exist in a season. It stands alone as a useful reference even without any drill-down.

**Independent Test**: Navigate to `/seasons?year=2025`. A grid loads showing all 2025 races with round numbers, GP names, circuit names, countries, dates, and a status (completed/upcoming). Changing the global year selector to 2023 replaces the grid with the 2023 schedule.

**Acceptance Scenarios**:

1. **Given** the user has selected the 2025 season, **When** they navigate to the Calendar tab, **Then** they see all rounds of the 2025 season in chronological order — each row showing the round number, official GP name, circuit name, country, and race date.
2. **Given** the calendar grid has loaded, **When** the user scans the rows, **Then** each row clearly indicates whether the race is completed or upcoming based on the race date relative to today.
3. **Given** the user is on the Calendar tab, **When** they change the global year selector to 2023, **Then** the grid updates to show all 2023 rounds without a page reload.
4. **Given** the user is on the Calendar tab, **When** the data is still loading, **Then** the page shows a loading state so the user knows data is being fetched.
5. **Given** the calendar data has loaded, **When** the user scans the grid, **Then** races are displayed in ascending round order (Round 1 at the top).

---

### User Story 2 - Navigate to Race Detail (Priority: P2)

An F1 fan wants to dig into a specific race weekend. They click on a row in the calendar grid and are taken to the GP weekend detail page for that race, where they can explore session results and classifications.

**Why this priority**: Extends the calendar grid into a full navigation hub for race-level data. Lower priority than the grid itself because the grid alone is useful — this adds depth for fans who want to explore individual GPs.

**Independent Test**: Navigate to `/seasons?year=2025`. Double-click any race row. The user is navigated to `/meetings/:key` for that race. Pressing browser back returns to the calendar with the year still set to 2025.

**Acceptance Scenarios**:

1. **Given** the user is viewing the calendar grid, **When** they click on a race row, **Then** they are navigated to the race weekend detail page for that GP.
2. **Given** the user is on the race detail page, **When** they press the browser back button, **Then** they return to the calendar grid with the same season still selected.
3. **Given** a race row is clicked, **When** the race detail page loads, **Then** the correct GP name and meeting data is shown (not data from a different round).

---

### Edge Cases

- What happens when the selected season is still in progress (e.g., 2025 with some rounds not yet completed)? Upcoming races must display clearly without errors.
- What if the API returns no meetings for a selected year? The grid must display an empty state rather than a blank screen.
- What if a round is cancelled or has no sessions? The row should still be visible; the detail page (US2) is responsible for handling missing session data.
- What if the race date is ambiguous (multi-day event)? The calendar shows the main race day date (Sunday), not the start of the weekend.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Calendar tab MUST display all race rounds that took place in the selected season, sourced from the global season selector.
- **FR-002**: Each race row MUST show: round number, GP name, circuit name, country, and race date.
- **FR-003**: Races MUST be displayed in ascending round order (Round 1 at the top).
- **FR-004**: Each race row MUST indicate its status — **Completed** if the race date is in the past, **Upcoming** if the race date is in the future.
- **FR-005**: The Calendar tab MUST respond to the global season selector — changing the year updates the grid without a page reload.
- **FR-006**: The Calendar tab MUST display a loading state while data is being fetched.
- **FR-007**: The Calendar tab MUST display a meaningful empty state if no race data is available for the selected season.
- **FR-008**: Clicking a race row MUST navigate the user to the race detail page for that GP (navigates to the meeting detail route).
- **FR-009**: The selected season MUST be preserved in the URL when navigating to a race detail page.
- **FR-010**: The Date column MUST support free-text search filtering — typing a formatted date (e.g., `"14 Mar 2025"`) MUST filter rows to matching races. Calendar-picker style date filters are not acceptable.

### Key Entities

- **Race Round (Meeting)**: A single Grand Prix weekend. Key attributes: round number, official GP name, circuit name, country, race date, status (completed/upcoming).
- **Season**: A calendar year (2023, 2024, or 2025) grouping all race rounds. Controls which rounds are displayed.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All race rounds for the selected season are visible on the Calendar tab without scrolling past the initial view on a standard desktop display (a typical F1 season has 22–24 rounds — all visible in a scrollable grid).
- **SC-002**: Switching the season selector updates the calendar grid within 2 seconds under normal network conditions.
- **SC-003**: A user can identify a race's name, circuit, country, and date within 5 seconds of arriving on the page.
- **SC-004**: Completed vs upcoming status is distinguishable at a glance — verified by a user correctly identifying at least one upcoming race without reading the date.
- **SC-005**: The page renders a meaningful loading or empty state in 100% of cases where data is unavailable — no blank screens or errors.

---

## Assumptions

- The global year selector in the navbar controls which season is shown — the Calendar tab reads this value and does not own its own year picker.
- Data coverage is 2023, 2024, and 2025 (OpenF1 free tier). Other years are not supported.
- "Race date" refers to the Sunday main race day. The GP weekend spans multiple days (FP, Qualifying, Race) but the calendar shows the race date only.
- Round number is not an explicit API field; it is derived from the chronological order of meetings within the season (Meeting 1 = Round 1, etc.).
- Race detail navigation (US2) lands on a future `/meetings/:key` page. If that page has not yet been built, clicking a row does nothing — the grid is still fully useful as a read-only schedule (US1 is independently valuable).
- A race is considered "Completed" if the race date is strictly before today's date; "Upcoming" if on or after today's date.
- Sprint races and sprint weekends are part of the standard round and are not displayed as separate rows.
