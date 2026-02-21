# F1 Dashboard

F1 Dashboard is a React + Vite app that currently fetches OpenF1 driver data and displays it in AG Grid.

## Suggested product direction

You already have a good **Drivers Table** foundation. To make the dashboard feel like a complete F1 analysis app, organize it around these high-value tabs.

### 1) Overview (Landing)
Use this as a fast “state of the weekend” screen.

- KPI cards at top:
  - Session (FP1 / Qualifying / Race)
  - Fastest lap so far
  - Most laps completed
  - Avg top speed leader
- “On Track Now” list (active drivers and latest lap time)
- Mini timeline of key events (yellow flag, pit stop, fastest lap)

### 2) Drivers (your current grid, enhanced)
Keep AG Grid as the main component and add:

- Driver headshot + number + team color pill
- Quick filters: team, nationality, active/inactive, rookie
- Column presets:
  - Identity preset (name, number, nationality, team)
  - Performance preset (best lap, gap to leader, stint count)
- Row click opens a side panel with driver details + charts

### 3) Teams / Constructors
Help users compare teammates and team pace.

- Team cards with both drivers and average pace
- Scatter plot: top speed vs lap consistency
- Pit stop summary per team (count, avg pit duration)

### 4) Live Timing
Best for race-day engagement.

- Real-time leaderboard (position, interval, tyre, stint)
- Last 5 laps sparkline for each driver
- Sector-by-sector mini table with green/purple highlights
- Auto-refresh indicator + manual pause button

### 5) Session Analysis
For deeper post-session insights.

- Lap time degradation chart by stint/tyre compound
- Pace distribution histogram (clean laps only)
- Driver-vs-driver delta chart (selected pair)
- Track evolution: average lap time by minute of session

### 6) Track & Telemetry
If OpenF1 endpoints allow coordinates/telemetry, this tab can stand out.

- Track map with live dots for cars
- Speed trace and throttle/brake chart by lap
- Compare two laps (same driver or different drivers)
- DRS activation zones overlay

### 7) Pit Wall (Strategy)
Useful for strategy storytelling.

- Stint timeline (compound bars per driver)
- “Undercut/Overcut windows” estimate cards
- Tyre life remaining estimator (simple model)
- Pit stop impact simulator (basic what-if)

### 8) Events / Race Control
Turn raw events into a clean feed.

- Chronological race control messages
- Flag state timeline
- Incident tagging by driver/team
- Search and filter by event type

## Recommended app layout

- **Top nav**: Overview | Drivers | Teams | Live Timing | Analysis | Telemetry | Pit Wall | Events
- **Global controls** (sticky): Year, Grand Prix, Session, Auto-refresh toggle
- **Main content area**: tab-specific visualizations
- **Right side quick panel** (optional): selected driver summary

## UI/UX suggestions for your current dark theme

- Keep AG Grid dark, but add stronger visual hierarchy:
  - Team colors as subtle accents
  - Purple/green timing colors for best sectors/laps
  - Consistent spacing + card containers around charts
- Add skeleton loaders for all async blocks
- Show “last updated Xs ago” in header
- Add empty-state messaging (e.g., no live session data)

## Suggested implementation order (practical roadmap)

1. **Enhance Drivers tab** with side panel + presets + quick filters
2. Add **Overview tab** with KPI cards and event timeline
3. Add **Live Timing tab** with realtime leaderboard and lap sparklines
4. Add **Teams tab** with teammate comparison
5. Add **Analysis tab** charts (stint and degradation)
6. Add **Telemetry + Pit Wall** for advanced users

## OpenF1-driven features to prioritize first

Given your existing driver dataset, start with these low-effort/high-value additions:

- Join driver data with session/lap endpoints to calculate:
  - Best lap
  - Gap to leader
  - Consistency index (std dev of valid laps)
- Build a reusable `SessionContext` (meeting + session selection)
- Normalize team metadata (name, color, short code) for consistent styling

---

If you want, next step can be a concrete component map (`routes`, `tabs`, Redux slices, and chart library choices) so you can implement this in phases without refactoring later.
