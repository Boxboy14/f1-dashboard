# Feature Specification: Overview Page — Season Dashboard with Grand Prix Cards

**Feature Branch**: `006-overview-page`

**Created**: 2026-06-09

**Status**: Draft

**Input**: User description: "Build the overview page, the overview page has the overview of all sessions."

## User Scenarios & Testing *(mandatory)*

The Overview page is the landing dashboard for a selected season. It answers two questions at a glance: *"What's the state of the championship right now?"* and *"What happened — and what's coming up — across every Grand Prix this year?"* It is scoped to the year chosen in the navbar year selector, the same way the Calendar and Teams pages are.

### User Story 1 - See every Grand Prix and its sessions as cards (Priority: P1)

A fan opens the Overview page for the selected season and sees a card for every Grand Prix of that year. Each card lays out the most important information about that Grand Prix — its round number, name, host country (with flag), circuit, weekend dates, and overall status (completed, upcoming, in progress, or cancelled) — the **top 3 finishers** of that Grand Prix's race, and a button that opens the full session list for the weekend.

**Why this priority**: This is the heart of the request — a season at a glance. Each card surfaces the headline outcome of a Grand Prix (who stood on the podium) and a one-click path into the full weekend's sessions. It delivers standalone value even without KPIs.

**Independent Test**: Load `/overview` with a season selected. Confirm one card renders per Grand Prix in that year, each showing the GP's identity, weekend dates, status, the race's top 3 finishers, and a "view all GP sessions" button. No KPIs required for this story to be useful.

**Acceptance Scenarios**:

1. **Given** the 2025 season is selected, **When** the Overview page loads, **Then** a card appears for each Grand Prix in 2025, ordered by round number.
2. **Given** a Grand Prix race has concluded, **When** its card renders, **Then** the card is marked completed and shows the top 3 finishers (position, driver, team) of that race.
3. **Given** a Grand Prix is in the future, **When** its card renders, **Then** the card is marked upcoming and shows a placeholder instead of a podium.
4. **Given** a Grand Prix was cancelled, **When** its card renders, **Then** the card is marked cancelled and shows a placeholder instead of a podium.
5. **Given** any Grand Prix card, **When** it renders, **Then** it shows a "Click here to view all GP sessions" button and the Grand Prix name is not a link.

---

### User Story 2 - Season snapshot KPIs (Priority: P2)

Above the Grand Prix cards, the fan sees a small set of season KPI cards summarising the current state of the championship for the selected year: the driver championship leader (with team and points), the most recent race winner (with the Grand Prix they won), and a countdown to the next race (Grand Prix name and date).

**Why this priority**: KPIs turn the page from a catalogue into a dashboard. They give immediate context — who's winning, what just happened, what's next — but the page is still valuable without them, so they rank below the GP cards.

**Independent Test**: With a season selected, confirm the KPI strip shows the current championship leader, the last completed race winner, and the next upcoming race. Each KPI can be verified against the standings and calendar independently of the GP cards.

**Acceptance Scenarios**:

1. **Given** a season with completed races, **When** the page loads, **Then** the driver championship leader is shown with their team and current points.
2. **Given** at least one race has been completed, **When** the page loads, **Then** the most recent race winner is shown with the Grand Prix name.
3. **Given** the season has upcoming races, **When** the page loads, **Then** the next race is shown with its Grand Prix name and date.
4. **Given** the season is complete (no upcoming races), **When** the page loads, **Then** the next-race KPI shows a "season complete" state instead of a countdown.
5. **Given** the season has not yet started (no completed races), **When** the page loads, **Then** the last-winner and leader KPIs show an empty/placeholder state without error.

---

### User Story 3 - View all sessions of a Grand Prix from a card (Priority: P3)

From any Grand Prix card, the fan can open that weekend's full session list by clicking the "view all GP sessions" button, which opens the Grand Prix's meeting page (where the session grid lives).

**Why this priority**: The cards become an index into the rest of the app. This is an enhancement on top of the read-only overview — valuable, but the overview informs even without it.

**Independent Test**: From a GP card, click the "view all GP sessions" button and confirm navigation to `/meetings/:key`. Confirm the selected season is preserved across navigation.

**Acceptance Scenarios**:

1. **Given** a Grand Prix card, **When** the fan clicks "Click here to view all GP sessions", **Then** they are taken to that Grand Prix's meeting page (the full session list).
2. **Given** the Grand Prix name on the card, **When** the fan tries to click it, **Then** nothing happens — it is not interactive.
3. **Given** the fan navigates away and back, **When** they return to the Overview, **Then** the same season remains selected.

---

### Edge Cases

- **Empty season**: a selected year with no published sessions yet shows an empty state ("No Grand Prix data for this season") rather than a blank page.
- **Cancelled Grand Prix**: rendered as a card marked cancelled; its sessions are not presented as navigable results.
- **Live-session API lockout**: when the data source restricts access during a live session, the page shows a friendly unavailable state rather than crashing.
- **Partial weekend data**: a Grand Prix missing some session entries still renders with the sessions that exist.
- **Season not started**: KPIs that depend on completed races degrade to placeholders; GP cards all render as upcoming.
- **Single in-progress session**: the GP card and KPIs reflect "in progress" without implying the weekend is complete.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Overview page MUST be scoped to the season selected in the navbar year selector, and MUST update when the selected year changes.
- **FR-002**: The page MUST display one Grand Prix card for every Grand Prix in the selected season, ordered by round number.
- **FR-003**: Each Grand Prix card MUST show the round number, Grand Prix name, host country name and flag, circuit, the weekend date (or date range), and an overall status of completed, upcoming, in progress, or cancelled.
- **FR-004**: Each Grand Prix card MUST show the top 3 finishers (podium) of that Grand Prix's race — finishing position, driver name, and team — and MUST provide a button ("Click here to view all GP sessions") that navigates to the full session list for that Grand Prix. When the race result is unavailable (not yet raced, cancelled, or data restricted), the card MUST show a non-error placeholder in place of the podium.
- **FR-005**: The page MUST display a season KPI strip above the Grand Prix cards showing, at minimum: the driver championship leader (name, team, points), the most recent completed race winner (driver and Grand Prix), and the next upcoming race (Grand Prix and date).
- **FR-006**: When the season has no upcoming races, the next-race KPI MUST show a "season complete" state; when no races have completed, leader/winner KPIs MUST show placeholder states without error.
- **FR-007**: The card's "view all GP sessions" button MUST navigate to that Grand Prix's meeting page (the full session list). The Grand Prix name itself is presentational and MUST NOT be interactive — the button is the only interactive element on the card.
- **FR-008**: Navigation originating from the Overview MUST preserve the selected season so the user returns to the same year context.
- **FR-009**: The page MUST present a loading state while season data is being retrieved and MUST not show partial/janky content as data arrives.
- **FR-010**: The page MUST present an empty state when the selected season has no Grand Prix/session data.
- **FR-011**: Completed, upcoming, in-progress, and cancelled states MUST be visually distinguishable on both the Grand Prix cards and their session lists.
- **FR-012**: The page MUST be built from the project's design-system card and layout components (per the project's UI rules), not ad-hoc markup.

### Key Entities *(include if feature involves data)*

- **Grand Prix (Meeting)**: a race weekend in the selected season. Attributes: round number, name, host country (name + flag), circuit, weekend date range, overall status, and the set of sessions it contains.
- **Session**: a single on-track session within a Grand Prix. Attributes: name, type (Practice / Qualifying / Sprint / Race), scheduled date/time, and status (completed / upcoming / in progress / cancelled).
- **Season KPI**: a derived snapshot for the selected year. Comprises the driver championship leader (driver, team, points), the most recent race winner (driver, Grand Prix), and the next upcoming race (Grand Prix, date).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From a cold load of the Overview page, a fan can identify the current championship leader and the next race within 5 seconds, without scrolling.
- **SC-002**: Every Grand Prix in the selected season is represented by exactly one card — no missing and no duplicate Grand Prix.
- **SC-003**: A fan can reach a Grand Prix's full session list from the Overview in a single click (the card's "view all GP sessions" button).
- **SC-004**: A fan can correctly distinguish completed from upcoming Grand Prix at a glance, with 100% of cards showing a status indicator; completed-race cards show a 3-driver podium.
- **SC-005**: Switching the selected season updates the entire page (KPIs and all cards) to the new year with no stale data from the previous selection.
- **SC-006**: The page renders a usable first view within standard web expectations (under ~3 seconds on a typical connection) and never shows a raw error screen for the known empty/locked data conditions.

## Assumptions

- **Year-scoped, single season at a time**: "all sessions" means all sessions for the season currently selected in the navbar (default 2025), consistent with the Calendar and Teams pages — not a combined multi-year view.
- **Card-per-Grand-Prix layout**: the "overview of all sessions" is organised as one card per Grand Prix, with that weekend's sessions listed inside the card, rather than a flat session table.
- **KPIs blended with cards**: the page combines the season-snapshot KPIs (the original plan.md vision for `/overview`) with the per-Grand-Prix session cards (this request).
- **Reuses existing detail pages**: drill-down targets are the already-built meeting detail (`/meetings/:key`) and session detail (`/sessions/:key`) pages; this feature adds no new detail pages.
- **Data source coverage**: season schedule, sessions, and championship standings come from the existing single data source (OpenF1), which covers 2023–2025; the page must stay within that source's rate limits by fetching season-level lists rather than per-item calls where avoidable.
- **Per-card podium requires a result lookup per Grand Prix**: each card shows its race's top 3, which means one race-result query per completed Grand Prix (~24 for a full season). These are cached (5-min staleTime) and reuse a single season-wide driver-name map, but the first uncached load fans out roughly one call per GP — which approaches the OpenF1 free-tier rate limit (3 req/sec, 30 req/min). Accepted as a deliberate trade-off for the podium feature.
- **Dark theme only**, consistent with the rest of the app.
