# Feature Specification: Track Dominance Map

**Feature Branch**: `008-track-dominance-map`

**Created**: 2026-06-14

**Status**: Draft

**Input**: User description: "Build track map for each grand prix as discussed earlier along with highlighting the dominance of which 2 players are selected for the telemetry comparison."

## User Scenarios & Testing *(mandatory)*

This feature adds a **track map** to the Telemetry Comparison page, shown directly below the driver summary. The map draws the outline of the currently-selected circuit from the chosen lap's car-position data. When two drivers are being compared, the track is split into a series of small equal-length segments ("minisectors") and each is colored by the driver who was faster through it — a "dominance" map that shows, at a glance, where each driver gains. When only one driver is selected, the outline is shaded by that driver's speed. It reflects whatever Grand Prix, session, and lap are currently selected for the comparison.

### User Story 1 - See the circuit for the selected lap (Priority: P1)

A fan who has selected an event, session, and at least one driver sees the shape of that circuit rendered as a track map below the driver summary, drawn from the selected lap's position data and correctly proportioned (not stretched).

**Why this priority**: The outline is the canvas everything else paints on; it delivers immediate value (recognise the circuit, orient yourself) and must exist before dominance or speed shading.

**Independent Test**: Select an event, session, and one driver (any lap). Confirm a recognisable, correctly-proportioned outline of that circuit appears below the driver summary, and that it changes when a different event/session is chosen.

**Acceptance Scenarios**:

1. **Given** an event, session, and one driver are selected, **When** the data loads, **Then** a correctly-proportioned outline of that circuit is drawn below the driver summary.
2. **Given** a different event/session is selected, **When** it loads, **Then** the map updates to the new circuit's shape.
3. **Given** a lap with no position data, **When** it is selected, **Then** the map shows a clear "track map unavailable" state rather than a broken or empty figure.

---

### User Story 2 - Two-driver dominance coloring (Priority: P2)

With two drivers selected, the track is divided into equal-length minisectors and each is colored with the color of the driver who carried more speed through it, so the fan can instantly see which driver dominates which part of the lap. A legend ties each color to its driver.

**Why this priority**: This is the headline of the feature — the "who's faster where" comparison. It builds on the outline (US1).

**Independent Test**: Select two drivers for a lap. Confirm the track is colored in two colors along its length, a legend identifies each driver, and the colored regions correspond to where each driver is faster (cross-checkable against the speed chart).

**Acceptance Scenarios**:

1. **Given** two drivers are selected, **When** the map renders, **Then** the track is split into equal-length minisectors, each colored with the faster driver's color.
2. **Given** the colored map, **When** it renders, **Then** a legend identifies which color is which driver, and the colors match those used in the telemetry charts and driver summary.
3. **Given** a minisector where one driver is clearly faster (a section where the speed chart shows a gap), **When** compared, **Then** that minisector is colored for the faster driver.
4. **Given** the selected lap or drivers change, **When** the change applies, **Then** the dominance coloring recomputes with no stale coloring left over.

---

### User Story 3 - Single-driver speed map (Priority: P3)

When only one driver is selected, the outline is shaded along its length by that driver's speed (brighter where faster, dimmer where slower), giving a solo speed map instead of a comparison.

**Why this priority**: A useful fallback that keeps the map meaningful with one driver, but secondary to the two-driver comparison.

**Independent Test**: Select a single driver for a lap. Confirm the outline is shaded by speed — slow corners visibly dimmer than fast straights.

**Acceptance Scenarios**:

1. **Given** exactly one driver is selected, **When** the map renders, **Then** the outline is shaded by that driver's speed along the lap.
2. **Given** a second driver is then added, **When** it loads, **Then** the map switches from speed shading to two-driver dominance coloring.

---

### Edge Cases

- **No position data for the lap**: show a "track map unavailable" state, not a broken figure.
- **One of two drivers has no data for the selected lap** (e.g. retired before that lap): the outline still draws from the available driver, and the map degrades to that driver's single-driver speed shading rather than a half-broken comparison.
- **Fastest-lap mode with different laps per driver**: each driver's fastest lap may be a different lap number; the dominance still compares the two drivers across the same track positions (this is the normal way telemetry laps are compared).
- **Very short / incomplete lap trace**: if the position trace is too sparse to form an outline, fall back to the unavailable state.
- **Selection cleared / changed**: the map clears or recomputes in step with the rest of the page; no stale outline or coloring remains.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST display a track map below the driver summary on the Telemetry Comparison page, reflecting the currently-selected event, session, and lap.
- **FR-002**: The map MUST draw the circuit outline from the selected lap's car-position data, preserving the circuit's real proportions (no horizontal/vertical stretching) and fitting within the page width.
- **FR-003**: When **two** drivers are selected, the map MUST divide the lap into a fixed number of equal-length minisectors and color each minisector with the color of the driver who carried the higher average speed through it.
- **FR-004**: The map MUST show a legend identifying which color corresponds to which driver, using the **same driver colors** as the telemetry charts and driver summary.
- **FR-005**: When exactly **one** driver is selected, the map MUST shade the outline by that driver's speed along the lap (faster = brighter, slower = dimmer).
- **FR-006**: The map MUST use the same selected lap as the telemetry charts, and MUST recompute when the event, session, drivers, or lap selection changes — with no stale outline or coloring.
- **FR-007**: When the selected lap has no usable position data, the map MUST show a clear "unavailable" state rather than an empty or broken figure.
- **FR-008**: When only one of two selected drivers has data for the lap, the map MUST still draw the outline from the available driver and fall back to single-driver speed shading.
- **FR-009**: The dominance comparison MUST reflect where each driver is faster around the lap such that it is consistent with the speed traces on the telemetry charts.

### Key Entities *(include if feature involves data)*

- **Track outline**: the ordered set of on-track positions for the selected lap, forming the circuit shape; sourced from one driver's lap.
- **Minisector**: one of a fixed number of equal-length segments the lap is divided into; carries the identity of the faster driver (in two-driver mode).
- **Dominance**: per minisector, the driver with the higher average speed through that segment.
- **Speed shading**: per outline segment (single-driver mode), a brightness derived from that driver's speed there.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With two drivers selected, a fan can identify which driver dominates a given part of the track within ~3 seconds of the map loading, without reading any numbers.
- **SC-002**: The circuit outline is recognisable and undistorted — its proportions match the real track (a corner is a corner, not an ellipse).
- **SC-003**: Driver colors on the map exactly match those on the telemetry charts and driver summary (no color means a different driver in different places).
- **SC-004**: The dominance coloring agrees with the speed charts — a minisector colored for a driver is one where that driver's speed trace is higher over that stretch.
- **SC-005**: Changing the selected lap or drivers updates the map with no stale coloring or outline from the previous selection.
- **SC-006**: The map appears within standard web expectations (under ~3 seconds) after a complete selection, and never shows a broken figure for the known no-data cases.

## Assumptions

- **Lives on the Telemetry page**: this extends the existing Telemetry Comparison page (feature 007); it is not a separate per-Grand-Prix gallery. "For each grand prix" means the map adapts to whichever circuit is currently selected.
- **Track shape from one lap's position data**: the outline is the driver's racing line for the selected lap, which approximates the circuit shape closely enough for this map. Single data source (OpenF1 position data), consistent with the rest of the app.
- **~24 equal-length minisectors** (a tunable count) — enough to read dominance cleanly without flickering between colors point-to-point.
- **Dominance by average speed over equal-length minisectors**: because each minisector covers equal distance, higher average speed through it means less time through it — so speed-based dominance is equivalent to time-based dominance, while being simpler to reason about.
- **Reuses the telemetry driver palette** (the two comparison colors already used for the charts and summary) so a driver is the same color everywhere.
- **Uses the already-selected lap** (fastest by default, or a specific lap) from the telemetry controls — no separate lap picker for the map.
- **Dark theme, responsive, single data source** — consistent with the rest of the app. The map uses only the selected lap's position + speed data (small volume), staying within the data source's rate limits.

## Out of Scope

- Animating a moving dot around the lap.
- Showing more than two drivers, or comparing two *different* laps.
- Corner numbers, DRS-zone markers, sector boundaries, or other circuit annotations.
- A standalone track-map page or per-Grand-Prix track-map gallery elsewhere in the app.
