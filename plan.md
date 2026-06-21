# F1 Dashboard — Project Plan

This is the working plan for the F1 Dashboard. Claude Code refers to this when generating code; humans refer to it when deciding what to build next. Keep it current.

---

## 1. Goal & Scope

**What:** A Formula 1 stats dashboard that gives F1 fans fast access to driver and team standings, race results, telemetry, tire strategy, and (eventually) an AI assistant for natural-language queries.

**Why:** Sharpen frontend skills, learn AI integration, and ship a real product the developer would use.

**In scope (v1):**
- Historical data from **2023 onwards** (OpenF1 free tier — 3 seasons: 2023, 2024, 2025).
- Single data source: OpenF1 only. No secondary APIs.
- Desktop + mobile responsive UI.
- Design system (feature 009): Roboto font, a categorized type scale (page > section > sub), and a restrained Salt-token color scheme (neutral surfaces, sparing red accent — no raw hex).
- User-switchable **dark/light theme** (navbar toggle, default dark, persisted) via `SaltProvider mode`.
- All four viz styles: line/bar charts, SVG track map, telemetry overlays, tire-strategy timelines.

**Out of scope (v1):**
- Live timing / real-time data (requires OpenF1 paid tier).
- User accounts, favourites, comments, sharing.
- Server-side persistence — everything is fetched on demand and cached client-side.

---

## 2. Tech Stack

| Layer | Choice | Role |
|---|---|---|
| Build | Vite | Dev server + bundler |
| Framework | React 19 | UI |
| Routing | React Router 7 | URL is source of truth for navigation |
| Server state | TanStack Query v5 | All OpenF1 fetching, caching, dedup |
| Client state | Redux Toolkit | UI-only state that survives navigation (used sparingly) |
| Data grids | ag-grid 35 | Drivers/teams/sessions tabular views |
| UI kit | Salt Design System | First choice for every UI element |
| Charts | Recharts (Phase 2) | Line/bar/scatter charts |
| Track map | Custom SVG (Phase 2) | OpenF1 location coords |
| Styles | SCSS Modules | No inline styles except dynamic values |
| API | OpenF1 (`https://api.openf1.org/v1`) | All F1 data — single source |
| Spec workflow | GitHub Speckit | `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` |

---

## 3. Pages & Routes

### Built
- `/` → redirects to `/drivers`
- `/drivers` — drivers grid (ag-grid, narrow left column) + season standings charts — Driver Points Evolution and Driver Ranking Evolution (Recharts, team-coloured, flag X-axis, per-round hover) — `specs/011-drivers-standings-charts/`
- `/drivers/:slug` — driver detail card (opened from grid row or search)
- `/feedback` — feedback form (Name, Email, Feedback) delivered to the owner's email via EmailJS (`@emailjs/browser`, client-only, no backend); entry point pinned to the bottom of the sidebar. EmailJS IDs in `VITE_EMAILJS_*` env vars; the send is a TanStack `useMutation` (not counted by the global loading overlay) — `specs/012-feedback-form/`

### Planned

**`/overview` — Season dashboard (BUILT)**
- Year-scoped to the navbar year selector.
- Season KPI strip: championship leader (driver + team + points), last race winner, next race (or "Season complete").
- Grand Prix cards: one Salt `Card` per GP — round, name, country + flag, circuit, weekend dates, status, and the GP's session list. GP name → meeting page; each session → session detail.
- See `specs/006-overview-page/`.

**`/teams` — Constructor standings (P1, next)**
- Team cards with both drivers, team color, current points, championship rank.
- Scatter plot: top speed vs lap consistency (Phase 2).
- Pit stop summary per team (avg duration, count) (Phase 2).

**`/teams/:slug` — Team detail**
- Both drivers' season-to-date stats.
- Team's race-by-race results table.
- Teammate head-to-head (qualifying, race, points).

**`/seasons` — Year picker**
- List of supported years (2023, 2024, 2025).
- Click → `/seasons/:year`.

**`/seasons/:year` — All GPs for that year**
- Calendar grid of meetings.
- Click a meeting → `/meetings/:key`.

**`/meetings/:key` — GP weekend overview**
- Session list (FP1, FP2, FP3, Quali, Race) with status.
- Weekend weather summary, circuit info.
- Click a session → `/sessions/:key`.

**`/sessions/:key` — Session detail**
- Final classification (positions, gaps, fastest lap).
- Lap time chart per driver (Phase 2).
- Tire strategy timeline (Phase 2).
- Pit stop table.

**`/telemetry` — Telemetry comparison (BUILT)**
- Standalone, year-scoped page: Select Event → Session → Drivers (max 2) dropdowns.
- Each driver's fastest lap of the session; six Recharts traces (speed, throttle, brake, gear, RPM, DRS) over derived distance, two-color overlay, linked hover cursor.
- Fetches only the fastest-lap car_data window (ranged `carDataLap`), not the whole session.
- 3-sector coloring, minisector heatmap, and track map remain future. See `specs/007-telemetry-comparison/`.

**`/track/:meeting_key` — Track map (Phase 2)**
- SVG track outline from `/location` data.
- Driver dots animated through a chosen lap.

**`/assistant` (Phase 3)**
- Floating chat, page-aware context.

---

## 4. Phases & Roadmap

### Phase 1 — Foundation & Core Pages (current)

**Done:**
- API service layer: `src/services/api/openf1.js` wraps all 18 OpenF1 endpoints.
- TanStack Query hooks: `src/hooks/useOpenF1.js` — `useDrivers`, `useSessions`, `useMeetings`, `useLaps`, `useChampionshipDrivers`, `useChampionshipTeams`, etc.
- `QueryClient` wired in `src/main.jsx` with `retry: 2`, `refetchOnWindowFocus: false`.
- Responsive sidebar + hamburger menu.
- Drivers grid migrated from Redux → TanStack Query.
- Driver search wired to TanStack Query.
- Driver card page at `/drivers/:slug`.
- CLAUDE.md with project rules.
- `.specify/memory/constitution.md` ratified.
- Speckit installed (`/speckit-*` commands available).

**Done (continued):**
- `/teams` + `/teams/:slug` (constructor standings + detail).
- `/seasons` calendar grid → `/meetings/:key` (GP weekend) → `/sessions/:key` (session classification + pit stops).
- `/overview` season dashboard (KPI strip + Grand Prix session cards) — `specs/006-overview-page/`.
- Shared `src/utils/sessionStatus.js` status helper (used by the meeting page and overview cards).

**Pending in Phase 1:**
- Refactor Sidebar to use Salt DS components (`NavigationItem`, `StackLayout`) instead of raw `<aside>`, `<nav>`, `<NavLink>` (Rule 4 in CLAUDE.md).
- ✅ Resolved (feature 010): the disabled `/sessions` sidebar entry was removed (it won't be built); the `/sessions/:key` detail route reached from Calendar/Overview is unaffected.

### Phase 2 — Visualizations
- ✅ Recharts added; telemetry comparison page (`/telemetry`) built — `specs/007-telemetry-comparison/`.
- ✅ Track map + minisector "fastest where" dominance heatmap (custom SVG from `/location` data) on the telemetry page — `specs/008-track-dominance-map/`.
- ✅ Telemetry & UI enhancements — `specs/010-telemetry-ui-enhancements/`: downloadable lap-summary PDF (`jspdf`, one button in the chart-stack header), tyre compound on the driver card (from `/stints`), track-map circuit caption + checkered-flag start/finish logo + centered/thicker layout, persisted sidebar collapse toggle (double-chevron), taller/legible charts, and removal of the disabled Sessions sidebar entry.
- Lap time chart on session detail.
- Tire strategy timeline (custom SVG).
- Pace distribution histogram, degradation chart, driver-vs-driver delta.

### Phase 3 — AI Assistant
- Claude API integration.
- Floating chat bubble visible on every page.
- Page-aware context: assistant knows which driver/team/session the user is currently viewing.
- Natural-language queries → API call plan → rendered answer.

---

## 5. Architecture Decisions (Non-Negotiable)

| Decision | Rule |
|---|---|
| Data fetching | TanStack Query hooks from `src/hooks/useOpenF1.js`. **No raw `fetch` in components.** |
| API layer | All calls go through `src/services/api/openf1.js`. No URLs in components. |
| State split | TanStack Query owns server/async state. Redux is for client-only UI state that survives navigation. URL owns navigation state. |
| Styling | SCSS Modules. No inline styles except for genuinely dynamic values. |
| UI components | **Salt DS first.** Raw HTML only when Salt has no equivalent. See CLAUDE.md Rule 4. |
| Rate limits | OpenF1 free = 3 req/sec, 30 req/min. Every `useQuery` must declare `staleTime`. All fetches pass through the queue in `src/services/api/rateLimiter.js`, which paces them to ≤3/sec and ≤30/min so bursts never 429. |
| Cache persistence | Successful queries are persisted to `localStorage` (`src/services/cache/persistQueryCache.js`) and restored before first render — historical data is immutable, so reloads paint from cache. |
| Routing | React Router 7. URL state, not Redux, drives navigation. |
| Component isolation | Each page is a self-contained folder: component, hook, styles. |

Constitution: `.specify/memory/constitution.md` (Articles I–VII).

---

## 6. OpenF1 API Reference

**Base:** `https://api.openf1.org/v1`
**Rate limit (free):** 3 req/sec, 30 req/min.
**Coverage:** 2023 onwards (2023, 2024, 2025).

| Need | Endpoint | Key params |
|---|---|---|
| Drivers | `/drivers` | `session_key=latest` |
| Race calendar | `/meetings` | `year=2025` |
| Sessions in a meeting | `/sessions` | `meeting_key`, `session_type=Race` |
| Session results | `/session_result` | `session_key` |
| Starting grid | `/starting_grid` | `session_key` |
| Lap times | `/laps` | `session_key`, `driver_number` |
| Pit stops | `/pit` | `session_key` |
| Tire stints | `/stints` | `session_key` |
| Telemetry | `/car_data` | `session_key`, `driver_number` |
| Track position | `/location` | `session_key`, `driver_number` |
| Constructor standings | `/championship_teams` | `session_key` |
| Driver standings | `/championship_drivers` | `session_key` |
| Weather | `/weather` | `session_key` |
| Race control | `/race_control` | `session_key` |
| Overtakes | `/overtakes` | `session_key` |

**Known gaps:**
- `country_code` is `null` for all 2025-season driver data — OpenF1 limitation. UI must render blank without erroring.
- No live data on free tier — anything that says "live" or "now" silently falls back to "latest historical".

---

## 7. Spec Workflow (Required for Every New Feature)

```
/speckit-specify   → WHAT to build (user stories, acceptance criteria)
/speckit-clarify   → (optional) tighten ambiguous areas
/speckit-plan      → technical approach (components, files, data flow)
/speckit-checklist → (optional) validate plan completeness
/speckit-tasks     → atomic, checkboxed implementation tasks
/speckit-implement → execute the tasks
/speckit-analyze   → (optional) cross-check artifacts
```

- One feature branch per spec (e.g., `002-teams-page`).
- Specs live in `specs/<branch-name>/` and are committed alongside code.
- No implementation code without a `spec.md`.

---

## 8. Current State Snapshot

**Branch:** `feature-overview-tab`

**Built so far:** Drivers, Teams, Calendar → Meeting → Session detail, the Overview season dashboard, and the Telemetry comparison page. All via the Speckit workflow (`specs/001`–`007`).

**Immediate next actions (in order):**
1. Refactor `src/components/dashboard/Sidebar/Sidebar.jsx` to Salt DS components (replaces raw `<aside>`/`<nav>`/`<NavLink>`) — last Phase 1 cleanup.
2. Continue Phase 2 visualizations: lap-time chart on session detail, then tire-strategy timeline; later the track map + telemetry minisector heatmap.
3. Resolve the disabled `/sessions` sidebar entry (define a standalone sessions view or remove it).

When in doubt about what to build next, follow this list top-down.
