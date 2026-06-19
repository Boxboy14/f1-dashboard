# Feature Specification: Telemetry & UI Enhancements

**Feature Branch**: `010-telemetry-ui-enhancements`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "Telemetry page enhancements (driver card tyre detail, per-chart downloadable lap summary, track map circuit name + start/finish marker, track map layout/readability, chart sizing/legibility) plus sidebar enhancements (collapse toggle, removal of the disabled Sessions entry)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Downloadable lap summary report (Priority: P1)

A user comparing driver telemetry on the Telemetry page wants to save or share what they're looking at. They click a single download control located at the right edge of the chart-stack header (the "Fastest lap …" / lap-label row that also carries the driver legend) and receive a single document that captures the Grand Prix, the lap and driver(s) being compared, and a plain-language summary of every channel shown (speed, throttle, brake, gear, RPM, DRS) — so the comparison survives after they leave the page.

**Why this priority**: This is the most-requested, highest-effort capability and turns a transient on-screen comparison into something the user can keep, print, or send to someone else. It delivers value independent of every other change in this spec.

**Independent Test**: Select an event, session, and one or two drivers on the Telemetry page so the charts render; click the download control on any chart; confirm the downloaded document opens and contains the GP name, the lap/driver header(s), and a summary entry for every channel.

**Acceptance Scenarios**:

1. **Given** two drivers are selected and their fastest-lap telemetry has loaded, **When** the user clicks the single download control at the right of the chart-stack header, **Then** a single document downloads containing the GP name, each driver's lap number and name, and a short summary (bullet + explanatory paragraph) for every channel chart.
2. **Given** only one driver is selected, **When** the user downloads the summary, **Then** the document follows the same structure for that one driver.
3. **Given** the chart stack is rendered, **When** the user looks at the header row, **Then** there is exactly one download control (at its right edge) — not one per chart.
4. **Given** one of the selected drivers has no valid timed lap for the session (e.g., did not set a lap), **When** the user downloads the summary, **Then** the document notes that driver has no lap data instead of omitting them silently or failing to generate.

---

### User Story 2 - Richer, better-laid-out driver summary card (Priority: P2)

A user looking at a driver's card on the Telemetry page wants more lap context than just lap time and top speed — the tyre compound and its age, the three sector times, and how far off the pace this driver was versus the other selected driver — presented in a clean, readable layout.

**Why this priority**: A self-contained enrichment of an existing component — immediate value, no dependency on other stories. All data comes from already-fetched sources (`/laps`, `/stints`, and the merged telemetry).

**Independent Test**: Select a session and two drivers with completed timed laps; confirm each card shows the tyre compound (with a compound icon) and age, the three sector times, and the lap-time gap, in a right-aligned layout with labels and values close together.

**Acceptance Scenarios**:

1. **Given** a driver's lap is displayed, **When** stint data covering that lap exists, **Then** the card shows the tyre compound used (with a Pirelli-style compound icon, e.g. Soft/Medium/Hard/Intermediate/Wet) and the tyre age in laps.
2. **Given** no stint record covers the displayed lap, **When** the card renders, **Then** it shows a clear "Unavailable" note for the tyre rather than a blank space or broken layout.
3. **Given** the lap has sector data, **When** the card renders, **Then** the three sector times (S1·S2·S3) are shown.
4. **Given** two drivers with timed laps are selected, **When** the cards render, **Then** each shows the lap-time gap — the faster driver labelled "Fastest" and the slower one a positive delta (e.g. "+0.642s").
5. **Given** the card renders, **When** viewed, **Then** it uses the broadcast-style layout — coloured top accent, photo left, name/team + lap-time block in the header, a divider, and a Sectors · Top speed · Tyre stats row — and reads correctly in both dark and light themes.

---

### User Story 3 - Track map circuit name and start/finish marker (Priority: P2)

A user viewing a track map wants to know which circuit it is without cross-referencing the rest of the page, and wants the visible gap in the track outline explained — it's the start/finish line, not a rendering defect.

**Why this priority**: Improves comprehension of an existing visualization that today provides no orientation context; independent of layout or sizing changes.

**Independent Test**: Open the Telemetry page for any session with a track map rendered; confirm the circuit name appears beneath the map and a start/finish marker appears at the gap in the outline.

**Acceptance Scenarios**:

1. **Given** a track map is rendered, **When** the user looks below it, **Then** the circuit name is displayed as a caption.
2. **Given** the track outline has a gap (the start/finish straight), **When** the user looks at that gap, **Then** a checkered-flag start/finish logo is rendered there, on both the dominance view and the speed view of the map.

---

### User Story 4 - Sidebar collapse toggle (Priority: P2)

A user who wants more horizontal room for the page content wants to collapse the left navigation sidebar down to an icon strip, and expand it again, using a clearly visible control.

**Why this priority**: A navigation-wide usability improvement, independent of the Telemetry-page-specific stories, and reuses the persistence pattern already established for the theme switch.

**Independent Test**: Load the dashboard at desktop width; confirm the sidebar fills the viewport height (its chevron control is visible without scrolling on any tab); click the chevron at the bottom-right; confirm the sidebar collapses to icons-only with tooltips on hover and the chevron flips; click again to restore; reload and confirm the chosen state is remembered.

**Acceptance Scenarios**:

1. **Given** any tab (including the long Telemetry page), **When** the page is viewed at desktop width, **Then** the sidebar occupies the viewport height with no gap below the navbar, and the chevron control is visible without scrolling the page.
2. **Given** the sidebar is in its default open state, **When** the user looks at the bottom-right of the sidebar, **Then** an inward-pointing double-chevron control («) is visible (indicating it will collapse toward the edge).
3. **Given** the sidebar is open, **When** the user clicks the chevron control, **Then** the sidebar collapses to an icon-only rail and the control now shows an outward-pointing double-chevron (»).
4. **Given** the sidebar is collapsed, **When** the user hovers a nav icon, **Then** a tooltip shows that tab's name.
5. **Given** the sidebar is collapsed, **When** the user clicks the chevron control again, **Then** the sidebar returns to its full open state and the control shows the inward chevron («) again.
6. **Given** the user collapsed (or re-opened) the sidebar in a previous visit, **When** they reload the app, **Then** the sidebar opens in the state they last left it.

---

### User Story 5 - Track map layout and readability (Priority: P3)

A user viewing a track map on the Telemetry page finds the map too far to one side and the track outline too thin to read clearly, and the "Speed map" / "Track dominance" caption above it too small to notice.

**Why this priority**: A visual polish pass on an existing, already-functional component — valuable but not blocking other stories.

**Independent Test**: Open the Telemetry page with a track map rendered at a typical desktop width; confirm the map sits centered in its panel, the track line is visibly thicker than before, and the caption above the map uses a larger, already-established heading size.

**Acceptance Scenarios**:

1. **Given** a track map renders on the page, **When** viewed at desktop width, **Then** the map is horizontally centered within its containing panel.
2. **Given** the track outline is rendered, **When** compared to its current appearance, **Then** the stroke is visibly thicker.
3. **Given** the caption above the map (e.g., "Speed map", "Track dominance"), **When** viewed, **Then** it is sized using one of the app's existing heading scale levels rather than a small ad hoc size.

---

### User Story 6 - Telemetry chart legibility (Priority: P3)

A user comparing driver telemetry finds the stacked charts (speed, throttle, brake, gear, RPM, DRS) cramped together with small axis text, making the comparison harder to read than it should be.

**Why this priority**: Visual polish across the existing chart stack — improves the page that already works, without changing what data is shown.

**Independent Test**: Open the Telemetry page with charts rendered; confirm each chart is taller, has visible breathing room from its neighbors, and the Y-axis label text is noticeably larger than before.

**Acceptance Scenarios**:

1. **Given** the telemetry charts are displayed, **When** the user views any one of them, **Then** its rendered height is at least 350px (or the equivalent in the app's relative sizing unit).
2. **Given** two adjacent charts are displayed, **When** the user looks at the space between them, **Then** there is at least 15px of separation (or the app's spacing-token equivalent).
3. **Given** any chart's Y-axis label, **When** compared to its current size, **Then** it renders visibly larger.

---

### User Story 7 - Remove the disabled Sessions sidebar entry (Priority: P3)

A user browsing the sidebar navigation no longer sees a "Sessions" entry that has never been clickable and isn't going to be built.

**Why this priority**: A small cleanup that removes dead UI; independently shippable and carries no risk to other stories.

**Independent Test**: Open the sidebar; confirm no "Sessions" entry is present anywhere in the navigation list.

**Acceptance Scenarios**:

1. **Given** the sidebar is rendered, **When** the user reviews the navigation list, **Then** no "Sessions" entry appears, disabled or otherwise.

---

### Edge Cases

- A selected driver has no valid timed lap (DNF, no lap set) when the lap summary report is generated — the report must say so for that driver rather than failing or silently dropping them (US1).
- Stint data doesn't cover the lap shown on a driver's card — the card shows an "unavailable" note instead of guessing or breaking layout (US2).
- A session has no recorded location data at all — the track map already falls back to a "no data" state; the circuit name caption and start/finish marker only apply once a map is actually rendered (US3).
- The sidebar collapse control is part of the permanently-docked desktop sidebar; on narrow/mobile widths the sidebar already behaves as a hamburger-triggered drawer, and that existing behavior is unchanged by this control (US4).
- Removing the Sessions entry must not affect the existing `/sessions/:key` session-detail route reached from the Calendar/Overview flows — only the unusable sidebar shortcut is removed (US7).

## Requirements *(mandatory)*

### Functional Requirements

**Lap summary export (US1)**

- **FR-001**: System MUST provide a single download control on the Telemetry page, positioned at the right edge of the chart-stack header row (the lap-label / driver-legend row above the charts).
- **FR-002**: Triggering the download control MUST produce one document covering all chart channels and all currently selected drivers — there is exactly one control, not one per chart.
- **FR-003**: The downloaded document MUST identify the Grand Prix, and for each selected driver, the driver's name, number, and the lap number being summarized.
- **FR-003a**: For each driver with lap data, the document MUST show the tyre (a coloured compound badge next to the compound name), the tyre age, and the three sector times (S1/S2/S3).
- **FR-004**: The downloaded document MUST include, for each channel chart, a short bullet point plus a plain-language paragraph describing what that channel shows for the selected driver(s).
- **FR-005**: If a selected driver has no valid lap for the session, the document MUST state that explicitly for that driver instead of omitting them or failing to generate.
- **FR-005a**: An info icon MUST sit immediately to the left of the download control, with a tooltip indicating it downloads the telemetry data for the selected lap.

**Driver card content & layout (US2)**

- **FR-006**: Each driver's summary card MUST display the tyre compound used during the lap shown on that card (with a compound icon) when stint data for that lap is available, plus the tyre age in laps.
- **FR-007**: When no stint data covers the displayed lap, the card MUST show an explicit "unavailable" indication for the tyre instead of leaving the area blank or broken.
- **FR-006a**: Each card MUST display the three sector times (S1/S2/S3) for the displayed lap when sector data is available.
- **FR-006b**: When two drivers with timed laps are selected, each card MUST display the lap-time gap — the faster driver indicated as fastest and the slower driver as a positive delta.
- **FR-006c**: The card MUST follow the broadcast-style layout: a coloured top accent (the driver's comparison colour), the photo on the left, a header with the driver name (uppercase) and team on the left and a prominent lap-time block on the right (labelled "Lap time", with "Fastest" shown in green for the faster driver and the gap for the slower), a divider, then a stats row of Sectors · Top speed · Tyre. The card MUST read correctly in both dark and light themes (Salt tokens, no hardcoded theme colours).

**Track map identification (US3)**

- **FR-008**: Every rendered track map MUST display the circuit name as a caption beneath the map.
- **FR-009**: Every rendered track map MUST display a checkered-flag start/finish logo at the point where the track outline has a gap, on both the dominance view and the speed view.

**Sidebar collapse (US4)**

- **FR-010**: The sidebar MUST provide a double-chevron control at its bottom-right corner that toggles between an open (full-width, labeled) state and a collapsed (icon-only) state.
- **FR-011**: While the sidebar is open, the control MUST display an inward-pointing double-chevron («); while collapsed, it MUST display an outward-pointing double-chevron (»).
- **FR-012**: The sidebar's open/collapsed state MUST persist across page reloads.
- **FR-012a**: On desktop, the sidebar MUST occupy the viewport height with no gap below the navbar, so the chevron control is always visible without scrolling the page on any tab.
- **FR-012b**: While collapsed, hovering a nav icon MUST show a tooltip with that tab's name.

**Track map layout (US5)**

- **FR-013**: Every track map MUST render horizontally centered within its containing panel.
- **FR-014**: The track outline's stroke MUST be visibly thicker than its current rendering.
- **FR-015**: Captions above the track map (e.g., "Speed map", "Track dominance") MUST use one of the app's existing heading scale levels rather than a small ad hoc font size.
- **FR-015a**: The track map MUST be separated from the surrounding content with clear vertical spacing (above the heading and below the circuit-name caption), and the circuit-name caption MUST render at a subheading size.

**Telemetry chart legibility (US6)**

- **FR-016**: Every telemetry chart MUST render at a minimum height of 350px (or the app's equivalent relative unit).
- **FR-017**: Adjacent telemetry charts MUST have at least 15px of visual separation (or the app's equivalent spacing unit) between them.
- **FR-018**: Each chart's Y-axis label text MUST render at a visibly larger size than its current rendering.

**Sidebar cleanup (US7)**

- **FR-019**: The sidebar navigation list MUST NOT contain a "Sessions" entry.

### Key Entities

- **Lap Summary Report**: The generated, downloadable document produced from the Telemetry page — contains the GP name, one lap/driver identification block per selected driver, and one summary entry (bullet + paragraph) per telemetry channel chart.
- **Tyre Stint Detail**: The tyre compound and age (laps on that tyre) associated with the lap shown on a driver's summary card, drawn from that driver's stint history for the session.
- **Driver Card Stats**: The per-driver lap context shown on the summary card — lap time, lap-time gap to the faster driver, the three sector times, top speed, and tyre compound + age — assembled from the already-fetched lap, stint, and merged telemetry data.
- **Sidebar Display State**: Whether the sidebar is currently open or collapsed; persists across sessions the same way the existing theme preference does.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can produce a saved, shareable summary of a driver telemetry comparison without leaving the Telemetry page, regardless of which chart's download control they use.
- **SC-002**: Every driver summary card shows the tyre compound for its displayed lap whenever stint data for that lap exists, with no blank or broken states.
- **SC-003**: A user can identify the circuit shown and locate the start/finish point on any track map without consulting any other part of the page.
- **SC-004**: A user can switch the sidebar between open and collapsed in a single click, and the chevron icon always matches the sidebar's current state.
- **SC-005**: Telemetry charts and track maps remain comfortably readable (axis labels, captions, track outline) on a standard desktop screen without the user needing to zoom in.
- **SC-006**: The sidebar contains zero disabled or non-functional navigation entries.

## Assumptions

- **Export format**: PDF is the v1 export format for the lap summary report — it matches the structured title/bullets/paragraph layout described and renders consistently for saving, printing, or sharing. A plain-text alternative is not required for v1.
- **One report, one control**: there is a single download control at the right of the chart-stack header (clarified by the user), and it produces one comprehensive report covering all channels and selected drivers — not a per-chart control or a chart-specific report.
- **Tyre data source**: tyre compound per lap comes from the same per-session stint history already used elsewhere in the app (no new data source).
- **Sidebar collapse scope**: the chevron collapse control applies to the desktop, permanently-docked sidebar only; the existing mobile hamburger-drawer behavior is unchanged.
- **Persistence pattern reuse**: the sidebar's open/collapsed state is remembered using the same persisted-preference approach already used for the dark/light theme choice.
- **Track map scope**: the circuit name caption, start/finish marker, centering, thicker outline, and larger caption size apply uniformly to every track map mode already in the app (dominance view and speed view), not just one.
