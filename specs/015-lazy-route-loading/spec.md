# Feature Specification: Lazy Route Loading

**Feature Branch**: `015-lazy-route-loading`

**Created**: 2026-08-30

**Status**: Draft

**Input**: User description: "Lazy-load non-default dashboard route pages (Overview, Teams, Calendar/Seasons, Meeting, Session Detail, Telemetry, How to Use, Feedback) in App.jsx via React.lazy + Suspense, so only the Drivers tab (the default landing route) is included in the initial JS bundle. Add a Suspense boundary around the router Outlet in DashboardLayout.jsx with a Salt DS Spinner fallback (visually consistent with the existing GlobalLoadingOverlay's spinner) so Navbar/Sidebar stay visible while a lazy page chunk downloads. This is a performance/code-splitting optimization with no change to user-facing behavior, page content, or navigation flow — each tab renders identically once loaded, just on-demand instead of upfront."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fast initial load on the default tab (Priority: P1)

A visitor opens the dashboard for the first time (or refreshes it). The app lands on the Drivers tab, which is the default route. The Drivers tab must appear as fast as before this change — its code must not wait on the code for any other tab.

**Why this priority**: This is the primary performance goal of the feature — most sessions land on Drivers first, and its load time directly shapes the first impression of the app.

**Independent Test**: Load the app fresh (cold cache) and confirm the Drivers tab renders without any visible loading placeholder for tab content, and without the browser downloading code belonging to Overview, Teams, Calendar, Telemetry, How to Use, or Feedback before Drivers is interactive.

**Acceptance Scenarios**:

1. **Given** a user with an empty cache, **When** they open the dashboard root URL, **Then** they are redirected to the Drivers tab and see driver data render without a code-loading placeholder for the tab content.
2. **Given** the Drivers tab has finished loading, **When** the browser's network activity is inspected, **Then** no code belonging to another tab has been downloaded yet.

---

### User Story 2 - Other tabs load on demand without breaking navigation (Priority: P1)

A user who is already on the dashboard clicks a sidebar/navbar link to a tab other than Drivers (Overview, Teams, Calendar, a specific meeting or session, Telemetry, How to Use, or Feedback). The tab's content loads and displays correctly, exactly as it did before this change.

**Why this priority**: The optimization is worthless if navigating to any tab fails, shows the wrong content, or behaves differently than before — correctness of every route must be fully preserved.

**Independent Test**: From the Drivers tab, navigate to each other tab in turn and confirm each renders its expected content and remains fully interactive (filtering, sorting, drill-down, etc. all continue to work as before).

**Acceptance Scenarios**:

1. **Given** a user on the Drivers tab, **When** they click through to any other tab for the first time in the session, **Then** that tab's content loads and displays correctly.
2. **Given** a user has already visited a tab once in the session, **When** they navigate away and back to it, **Then** it loads again (from cache or a fresh request) without error.
3. **Given** a user directly opens a deep link (e.g., a specific meeting or session URL) without visiting Drivers first, **Then** that page's content loads and displays correctly.

---

### User Story 3 - Visible feedback while a tab's code is downloading (Priority: P2)

A user navigates to a tab whose code has not yet been downloaded (e.g., on a slow connection). While that tab's code is being fetched, the user sees a clear loading indicator in place of the tab content, and the surrounding navigation (sidebar, navbar) remains visible and usable.

**Why this priority**: Without visible feedback, a slow network makes tab switches look broken (blank content, unresponsive click) rather than simply loading — this materially affects perceived quality but is secondary to correctness (User Story 2).

**Independent Test**: Throttle the network, click a tab not yet loaded in the session, and confirm a loading indicator appears in the content area while the sidebar and navbar remain visible and clickable, followed by the correct tab content once loading completes.

**Acceptance Scenarios**:

1. **Given** a user on a throttled connection, **When** they navigate to a tab whose code hasn't been downloaded yet, **Then** a loading indicator appears where the tab content will be, and the sidebar/navbar remain visible and interactive.
2. **Given** the tab's code finishes downloading, **When** the loading indicator is showing, **Then** it is replaced by the tab's actual content with no leftover placeholder.

---

### Edge Cases

- What happens if a tab's code chunk fails to download (e.g., the user is offline or the request errors)? The app should not crash the whole dashboard — at minimum the failure should be visibly contained to the tab being loaded.
- What happens if a user clicks between multiple not-yet-loaded tabs in rapid succession before any of them finishes loading? Each navigation should resolve to the correct final tab's content, without mixing content from an abandoned navigation.
- What happens on a hard refresh while deep-linked to a non-default tab (e.g., `/telemetry`)? That tab's code must load correctly even though the user never visited Drivers in that session.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST include the Drivers tab's code in the initial page load, without deferring it behind an on-demand fetch.
- **FR-002**: The system MUST defer downloading the code for the Overview, Teams, Calendar, Meeting, Session Detail, Telemetry, How to Use, and Feedback tabs until the user first navigates to each one.
- **FR-003**: The system MUST render each deferred tab's content and behavior identically to how it rendered before this change, once loaded.
- **FR-004**: The system MUST show a visible loading indicator in the tab content area while a deferred tab's code is being downloaded.
- **FR-005**: The system MUST keep the sidebar and navbar visible and interactive while a deferred tab's code is downloading.
- **FR-006**: The loading indicator MUST be visually consistent with the existing data-loading indicator already used elsewhere in the dashboard, rather than introducing a visually distinct loading style.
- **FR-007**: The system MUST support directly deep-linking to any tab (including non-default ones) without requiring the user to first visit the Drivers tab.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a cold cache, the amount of JavaScript downloaded before the Drivers tab is interactive is reduced compared to before this change (no other tab's code is included).
- **SC-002**: Every tab (Overview, Drivers, Teams, Calendar, Meeting, Session Detail, Telemetry, How to Use, Feedback) renders correctly and remains fully functional after this change, matching its pre-change behavior exactly.
- **SC-003**: A user on a slow connection sees a loading indicator within the content area, not a blank or frozen screen, while any non-default tab's code is being fetched.
- **SC-004**: Zero navigation regressions: deep-linking directly to any tab's URL works without visiting Drivers first.

## Assumptions

- "Initial load" / "initial JS bundle" refers to the code needed to render the Drivers tab (the app's default redirect target); it does not include shared/global chrome, which continues to load upfront regardless of this change.
- The existing dashboard chrome (sidebar, navbar, global data-loading overlay) and the AI Assistant launcher are unaffected by this change — this feature is scoped to the router-driven page tabs only.
- No new visual design is introduced for the loading indicator; it reuses the look of the spinner already used by the existing data-loading indicator.
- This is a non-functional/performance change: no tab's data, layout, or interaction behavior changes as a result of this feature.
