# Feature Specification: How to Use Guide

**Feature Branch**: `014-how-to-use-guide`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "Build a how to use F1 Dashboard for the users below above the feedback page option. The purpose of this How to use page is to help users understand the app and how to use it correctly without any issues. Provide clear set of instructions to the users on how to use each tab + the F1 assistant. One of the issues users can face is that they won't know that ag grid is used and they can double click on it to view more data, users might not understand this immediately by just looking at the grid. The page should not mention any technical details of the app just simple user walkthrough instructions"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Learn how each tab works (Priority: P1)

A user new to the dashboard opens the "How to Use" page and reads a short explanation of what each tab (Overview, Drivers, Teams, Calendar, Telemetry) shows and how to work its controls, so they can start exploring without trial and error.

**Why this priority**: This is the core value of the feature — without it, the page has no reason to exist.

**Independent Test**: Open the How to Use page with no other context and confirm every main tab has a plain-language explanation of its purpose and controls.

**Acceptance Scenarios**:

1. **Given** a user has never used the dashboard, **When** they open the How to Use page, **Then** they see a separate, clearly labeled section for each of Overview, Drivers, Teams, Calendar, and Telemetry.
2. **Given** a user is reading the Telemetry section, **When** they finish reading, **Then** they understand they need to pick an event, a session, up to two drivers, and a lap before a comparison appears, and that a download option is available.

---

### User Story 2 - Discover that data tables reveal more on double-click (Priority: P1)

A user browsing the Drivers, Teams, or Calendar tab does not realize the data table rows are clickable. The How to Use page calls this out explicitly so the user knows to double-click a row to see more detail.

**Why this priority**: This is the specific, named pain point — without it, users miss a core piece of functionality with no visual cue to find it themselves.

**Independent Test**: Read only the callout about data tables and confirm it states, in plain language, that double-clicking a row opens more detail, and which tabs this applies to.

**Acceptance Scenarios**:

1. **Given** a user reads the Drivers tab section, **When** they reach the data table explanation, **Then** they are told that double-clicking a driver row opens that driver's full details.
2. **Given** a user reads the Calendar tab section, **When** they reach the data table explanation, **Then** they are told that double-clicking a race opens its sessions, and double-clicking a session opens its results.

---

### User Story 3 - Learn how to use the AI Assistant (Priority: P2)

A user wants help from the AI Assistant but doesn't know it exists, where to find it, what it can answer, or how to get a downloadable telemetry comparison out of it. The How to Use page explains all of this in plain steps.

**Why this priority**: High value, but the dashboard is still usable without the assistant — so it ranks below understanding the core tabs.

**Independent Test**: Read only the Assistant section and confirm a user could open the chat, ask a data question, and request a two-driver telemetry report using only the instructions given.

**Acceptance Scenarios**:

1. **Given** a user has not noticed the assistant, **When** they read the How to Use page, **Then** they learn where the chat icon is and how to open the chat panel.
2. **Given** a user wants a telemetry comparison, **When** they follow the page's instructions, **Then** they know to specify a Grand Prix, a session, two drivers, and a lap to get a downloadable report.
3. **Given** a user asks about a season or topic outside what the assistant covers, **When** they read the page, **Then** they understand the assistant will say so rather than guess.

---

### Edge Cases

- A user opens the How to Use page first, before visiting any other tab — every section must stand on its own without assuming prior context.
- A user only skims the page looking for one specific tab — content must be scannable per-tab (not one undifferentiated wall of text) so the relevant section is easy to find.
- A user reads the data-table callout but the tab they're on (e.g., session results, pit stops) doesn't support double-click — the guide must not imply double-click works everywhere; it should be scoped to the tabs where it actually applies.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "How to Use" entry in the sidebar's bottom auxiliary navigation, positioned directly above the "Feedback" entry.
- **FR-002**: System MUST provide a dedicated page reachable in one click from anywhere in the dashboard via that navigation entry.
- **FR-003**: Page MUST include a distinct, clearly labeled section for each of: Overview, Drivers, Teams, Calendar, and Telemetry, explaining in plain language what the tab shows and how to use its controls (e.g., season selection, search, dropdowns, download actions).
- **FR-004**: Page MUST explicitly state that data tables on the Drivers, Teams, Calendar, and Sessions views can be double-clicked on a row to reveal more detail, and must describe what that detail is for each (driver profile, team profile, race sessions, session results).
- **FR-005**: Page MUST include a section explaining the AI Assistant: where to find and open it, the kinds of questions it can answer (race results/stats and general F1 knowledge), and that it will say so rather than guess when something is outside what it covers.
- **FR-006**: Page MUST include step-by-step instructions for requesting a downloadable two-driver telemetry comparison report through the Assistant chat (what details to provide: race, session, two drivers, lap).
- **FR-007**: Page content MUST NOT reference any technical/implementation terms (e.g., library names, "grid", "API", component names) — all explanations use plain, everyday language a non-technical fan would understand.
- **FR-008**: Page MUST organize content so a user can find help for one specific tab without reading the entire page top to bottom (e.g., per-tab sections with headings, optionally collapsible).
- **FR-009**: Page MUST be viewable without selecting a season or any other prerequisite state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can locate the instructions for any specific tab within 10 seconds of opening the How to Use page.
- **SC-002**: When asked afterward, users who have read the page can correctly explain that double-clicking a data row reveals more detail, and name at least one tab where this applies.
- **SC-003**: A user with no prior product knowledge can follow the page's instructions to successfully request a two-driver telemetry report from the Assistant on their first attempt.
- **SC-004**: "How do I..." style feedback submissions and support questions about basic navigation decrease after the page is introduced.

## Assumptions

- "Above the feedback page option" means the new entry sits directly above "Feedback" in the sidebar's existing bottom auxiliary nav block, matching how Feedback is already pinned there.
- The guide covers the five current main tabs (Overview, Drivers, Teams, Calendar, Telemetry) plus the AI Assistant; the Feedback tab itself is self-explanatory and gets at most a one-line mention. Adding future tabs to this guide is a separate follow-up, not part of this feature.
- No screenshots or images are required for the first version — clear written walkthroughs are sufficient.
- The page does not require any season/year to be selected and is not affected by the global season selector.
- The page is accessible to all users with no permissions or login distinctions, consistent with the rest of the dashboard.
