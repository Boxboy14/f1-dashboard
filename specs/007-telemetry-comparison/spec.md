# Feature Specification: Telemetry Comparison

**Feature Branch**: `007-telemetry-comparison`

**Created**: 2026-06-13

**Status**: Draft

**Input**: User description: "The telemetry grid of the app is more like a chart based page not a grid. Display and compare telemetry data for 2 drivers using charts. All available metrics must be comparable for the 2 drivers. A single selected driver shows all their telemetry. For a session (e.g. Race) only display the fastest lap of the entire session. 3-sector coloring and the minisector heatmap are future."

## User Scenarios & Testing *(mandatory)*

The Telemetry page is a chart-based comparison tool. A fan picks a Grand Prix, a session, and one or two drivers; the page then draws each driver's fastest-lap telemetry — speed, throttle, brake, gear, engine RPM, and DRS — as charts plotted against distance around the lap, so the two laps can be read side by side. It is year-scoped to the navbar season selector, like the Calendar and Overview pages.

### User Story 1 - View one driver's fastest-lap telemetry (Priority: P1)

A fan opens the Telemetry page, picks a Grand Prix and a session, then selects a single driver. The page shows that driver's **fastest lap of the session** as a set of charts — one per telemetry channel (speed, throttle, brake, gear, RPM, DRS) — across the distance of the lap, plus headline numbers (fastest lap time, top speed).

**Why this priority**: This is the core, independently useful capability — see a driver's telemetry for a chosen session. It stands on its own without any comparison.

**Independent Test**: Select a season, a Grand Prix, a session, and one driver. Confirm a chart renders for each available telemetry channel showing the driver's fastest-lap trace, and the fastest lap time and top speed are shown.

**Acceptance Scenarios**:

1. **Given** an event, session, and one driver are selected, **When** the data loads, **Then** one chart per telemetry channel renders that driver's fastest-lap trace plotted against lap distance.
2. **Given** a session with no lap chosen, **When** the data loads, **Then** the charts default to the driver's fastest valid lap (lowest lap time, excluding in/out laps).
2a. **Given** the Lap selector, **When** the user picks a specific lap number, **Then** the charts re-render for that lap; picking "Fastest lap" returns to the default.
3. **Given** the selections are incomplete (no event, session, or driver), **When** the page is shown, **Then** no charts are drawn and the user is prompted to complete the selection.
4. **Given** a driver who set no timed lap in the session, **When** that driver is selected, **Then** a clear "no timed lap" message is shown instead of empty charts.

---

### User Story 2 - Compare two drivers on every metric (Priority: P2)

The fan adds a second driver (any two drivers on the grid, regardless of team). Every metric chart now overlays both drivers' fastest laps as two visually distinct traces with a legend, so all available metrics are directly comparable.

**Why this priority**: Comparison is the headline purpose of the page, but it builds on the single-driver view, which must exist first.

**Independent Test**: With an event and session selected, select two drivers. Confirm every metric chart shows two distinguishable traces sharing the same distance axis, with a legend identifying each driver, and both drivers' headline numbers.

**Acceptance Scenarios**:

1. **Given** two drivers are selected, **When** the data loads, **Then** each metric chart shows two color-distinguished traces with a legend.
2. **Given** both traces, **When** they render, **Then** they share the same distance x-axis so the same corner appears at the same x-position for both drivers.
3. **Given** two drivers are already selected, **When** the fan tries to add a third, **Then** selection is capped at two.
4. **Given** two drivers are shown, **When** the fan removes one, **Then** that driver's traces disappear and the remaining driver's charts stay.

---

### User Story 3 - Synchronized inspection across charts (Priority: P3)

The fan hovers over any chart at a point on the lap; all charts indicate that same lap distance and surface each driver's values there (e.g. "at this distance: Driver A 312 km/h / 100% throttle, Driver B 305 km/h / 80% throttle").

**Why this priority**: A linked cursor turns separate charts into one readable instrument, but the charts are useful without it.

**Independent Test**: Hover at a distance on one chart and confirm every chart marks the same distance and shows the value(s) there for the selected driver(s).

**Acceptance Scenarios**:

1. **Given** the charts are displayed, **When** the fan hovers at a lap distance, **Then** every chart marks that same distance and shows the corresponding value(s).
2. **Given** one or two drivers, **When** hovering, **Then** the readout reflects exactly the selected driver(s).

---

### Edge Cases

- **No timed lap**: a driver who crashed or pitted without a representative lap shows a "no timed lap" message; if the other selected driver has a lap, their charts still render.
- **Session with no telemetry**: a session lacking telemetry data shows a clear unavailable state, not blank charts.
- **Data-source rate limit / live lockout**: when telemetry can't be retrieved, the page shows a friendly retry/unavailable state rather than erroring.
- **Single driver**: with only one driver selected, every chart renders a single trace (no comparison).
- **Very different lap quality**: if one driver's fastest lap is much slower, the distance x-axis still aligns both by track position; the slower trace simply differs in shape.
- **Changing a selector mid-view**: changing event, session, or driver re-derives the fastest lap(s) and redraws without leaving stale traces.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST be a standalone destination reachable from the sidebar (the currently-disabled Telemetry item), year-scoped to the navbar season selector.
- **FR-002**: The page MUST present four selectors: **Event** (Grand Prix), **Session**, **Drivers**, and **Lap**, populated in that order.
- **FR-003**: The Event selector MUST list every Grand Prix of the selected season (excluding pre-season testing).
- **FR-004**: The Session selector MUST list all sessions for the chosen event (e.g. Practice 1–3, Qualifying, Sprint, Sprint Qualifying, Race, as applicable).
- **FR-005**: The Drivers selector MUST list the drivers present in the chosen session and MUST allow selecting a **maximum of two** (any two, regardless of team).
- **FR-006**: Telemetry MUST be retrieved and charts drawn only once an event, a session, and at least one driver are selected.
- **FR-007**: The page MUST default to each driver's **fastest valid lap of the session** (lowest lap time, excluding in/out laps), and MUST provide a **Lap selector** offering "Fastest lap" plus the individual lap numbers so the user can compare a specific lap instead.
- **FR-015**: The selected lap MUST be a single shared lap **number** applied to both drivers (e.g. "Lap 30" = each driver's lap 30); the Lap selector's options MUST be the union of the selected drivers' timed laps; if a chosen lap number does not exist for one driver (e.g. they retired earlier), that driver MUST degrade to its per-driver "no data" state while the other still renders.
- **FR-008**: The page MUST display one chart per available telemetry channel: **speed, throttle, brake, gear, engine RPM, and DRS**.
- **FR-009**: All charts MUST plot against **distance into the lap** (derived consistently for every driver) and MUST share the same distance basis so corners align across drivers and across charts.
- **FR-010**: With one driver selected, each chart MUST show a single trace; with two drivers, each chart MUST overlay both as visually distinct, legend-identified traces.
- **FR-011**: The page MUST show headline figures per selected driver: fastest lap time and top speed.
- **FR-012**: Changing any selector MUST update the charts accordingly, and removing a driver MUST remove that driver's traces while preserving the other's.
- **FR-013**: The page MUST present loading, empty (incomplete selection), no-timed-lap, and unavailable (no telemetry / retrieval failure) states without crashing.
- **FR-014**: DRS MUST be presented as an on/off-style indication (the underlying value is an encoded state, not a plain boolean) so the viewer can read where DRS was active.

### Out of Scope (this version)

- 3-sector "who's fastest" coloring and the minisector speed heatmap (explicitly future).
- The circuit track map / position overlay.
- A between-driver time-delta channel.
- Comparing two *different* laps (the Lap selector applies one shared lap number to both drivers) and comparing more than two drivers.

### Key Entities *(include if feature involves data)*

- **Event**: a Grand Prix in the selected season (round, name) — the first selector.
- **Session**: an on-track session within the event (Practice / Qualifying / Sprint / Race) — the second selector.
- **Driver selection**: up to two drivers chosen from the session's grid.
- **Lap selection**: a single shared choice — "Fastest" (default) or a specific lap number — applied to both drivers; options are the union of the drivers' timed laps.
- **Selected lap**: per driver, the lap matching the Lap selection (fastest, or the chosen number); the basis for all charts and headline figures.
- **Telemetry channel**: one measured quantity along the lap — speed, throttle, brake, gear, RPM, DRS.
- **Telemetry sample**: a point along the lap carrying the channel values, positioned by **distance into the lap**.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After choosing an event, session, and driver, a fan sees the telemetry charts within ~3 seconds on a typical connection.
- **SC-002**: All available telemetry channels (speed, throttle, brake, gear, RPM, DRS) are each shown as a chart.
- **SC-003**: With two drivers selected, every chart shows both drivers as distinguishable traces, identifiable via a legend, with no chart missing a driver.
- **SC-004**: Both drivers' traces share one distance axis, so a given corner appears at the same x-position for each driver and across all charts.
- **SC-005**: Selecting only one driver yields complete single-trace charts; the page never requires two drivers to be useful.
- **SC-006**: Changing the event, session, or driver fully refreshes the charts with no stale traces from the previous selection.

## Assumptions

- **Standalone page, own selectors**: telemetry lives at its own sidebar destination (not nested inside a session page), because the page carries its own Event and Session pickers — consistent with the flow the user described.
- **Year from the navbar**: the Event list is scoped to the season chosen in the existing navbar selector, like Calendar/Overview/Teams.
- **"All available metrics"** means the six telemetry channels the data source exposes per sample: speed, throttle, brake, gear, RPM, DRS.
- **"All telemetry for a single driver"** means all six channels for the selected lap (fastest by default) — it does not mean every lap of the session at once.
- **Lap selection is a single shared lap number** for both drivers. Comparing two *different* laps for two drivers is intentionally not offered — it isn't a meaningful comparison.
- **Distance is derived** from the telemetry (speed over time) for the x-axis, per the agreed comparison basis; this is the standard way to align laps of different durations.
- **Comparison is overlay-only** in this version — metric traces side by side. A time-delta channel, sector coloring, and the track map are deliberate future phases.
- **Two-driver hard cap**: more than two drivers is out of scope for this version.
- **Single data source (OpenF1)**, dark theme, desktop + mobile responsive — consistent with the rest of the app. Telemetry for the fastest lap is a small volume per driver, so retrieval stays within the source's rate limits.
