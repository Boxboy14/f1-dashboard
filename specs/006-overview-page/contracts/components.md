# Contracts: Overview Page

UI + hook contracts for this feature. "Contract" here = the props/return shape each unit exposes, plus its responsibilities. These are the interfaces the implementation must honor.

---

## Hook: `useSeasonGrandPrix(year)`

**Location**: `src/hooks/useOpenF1.js`

**Input**: `year: number`

**Returns**: `{ grandPrix: GrandPrixCardModel[], isLoading: boolean }`

**Responsibilities**:
- Compose `useMeetings({ year })` + `useSessions({ year })`.
- Exclude testing meetings; sort meetings by `date_start`; assign 1-based `round`.
- Group sessions by `meeting_key`; per session derive `status` via `deriveSessionStatus`; sort each group by `date_start`.
- Derive each GP's `date_start` (min), `date_end` (max), and `status` via `deriveMeetingStatus`.
- `isLoading` true while either underlying query is loading.

**Must not**: make any per-Grand-Prix or per-session network call.

---

## Hook: `useSeasonKpis(year)`

**Location**: `src/hooks/useOpenF1.js`

**Input**: `year: number`

**Returns**: `{ kpis: { leader: ChampionshipLeader|null, lastWinner: RaceWinner|null, nextRace: NextRace|null }, isLoading: boolean }`

**Responsibilities**:
- From `useSessions({ year })` derive `lastRaceKey` (latest completed `Race`) and `nextRace` (earliest upcoming `Race` or `null`).
- `useChampionshipDrivers` + `useDrivers` (both `{ session_key: lastRaceKey }`, `enabled: Boolean(lastRaceKey)`) → `leader` via `driver_number` join, `position_current === 1`.
- `useSessionResult` ({ session_key: lastRaceKey }) + drivers → `lastWinner` via `driver_number` join, `position === 1`; `meeting_name` from the matching meeting.
- Return `null` sub-fields when `lastRaceKey` is absent.

**Must not**: fetch standings/results when `lastRaceKey` is null (queries stay disabled).

---

## Util: `src/utils/sessionStatus.js`

**Exports**:
- `deriveSessionStatus(session, isCancelled) -> StatusEnum`
- `deriveMeetingStatus(sessionsWithStatus, isCancelled) -> StatusEnum`

**Contract**: pure functions; no React, no fetching. `deriveSessionStatus` output must be identical to the logic previously inlined in `useMeetingDetail` (regression-safe extraction).

**Consumers**: `useSeasonGrandPrix`, `useMeetingDetail` (refactored to use it).

---

## Component: `OverviewPage`

**Location**: `src/components/dashboard/OverviewPage.jsx`

**Props**: none (reads `{ year }` from `useOutletContext()`).

**Renders**:
- `<Text styleAs="h2">Overview</Text>`
- `<SeasonKpiStrip kpis={...} isLoading={...} />`
- `<GrandPrixCardGrid grandPrix={...} onOpenMeeting={...} onOpenSession={...} />`

**States**:
- Loading (both hooks loading, no data yet): `<CircularProgress aria-label="Loading season" />`.
- Empty (`!isLoading && grandPrix.length === 0`): `<Text>No Grand Prix data for this season</Text>`.

**Navigation callbacks** (built with `useNavigate` + `useSearchParams`, preserving `?year=`):
- `onOpenMeeting(meeting_key)` → `/meetings/${meeting_key}?year=…`
- `onOpenSession(session_key)` → `/sessions/${session_key}?year=…`

---

## Component: `SeasonKpiStrip`

**Location**: `src/components/tabs/overview/SeasonKpiStrip.jsx`

**Props**: `{ kpis: SeasonKpis, isLoading: boolean }`

**Renders**: a `GridLayout`/`FlexLayout` of three `KpiCard`s:
1. **Championship Leader** — `leader.full_name` / `leader.team_name` · `{points} pts`; placeholder when `null`.
2. **Last Race Winner** — `lastWinner.full_name` / `lastWinner.meeting_name`; placeholder when `null`.
3. **Next Race** — `nextRace.meeting_name` / formatted date · "in N days"; renders "Season complete" when `null`.

**Responsibilities**: presentational only; no fetching, no navigation.

---

## Component: `KpiCard`

**Location**: `src/components/tabs/overview/KpiCard.jsx`

**Props**: `{ label: string, primary: ReactNode, secondary?: ReactNode }`

**Renders**: a Salt `Card` with `label` (muted), `primary` (emphasized), optional `secondary`. Pure presentational.

---

## Component: `GrandPrixCardGrid`

**Location**: `src/components/tabs/overview/GrandPrixCardGrid.jsx`

**Props**: `{ grandPrix: GrandPrixCardModel[], onOpenMeeting: (key)=>void, onOpenSession: (key)=>void }`

**Renders**: responsive Salt `GridLayout` of `GrandPrixCard`s (key = `meeting_key`).

---

## Component: `GrandPrixCard`

**Location**: `src/components/tabs/overview/GrandPrixCard.jsx`

**Props**: `{ gp: GrandPrixCardModel, onOpenMeeting: (key)=>void, onOpenSession: (key)=>void }`

**Renders** (plain Salt `Card`):
- **Header**: `Round {round}` · GP name as a `Link` (onClick → `onOpenMeeting(gp.meeting_key)`) · `country_flag` image (if present) · `<StatusPill status={gp.status} />`.
- **Sub-header**: `circuit_short_name` · weekend date range (`formatWeekend(date_start, date_end)`).
- **Body**: session list — each row a `Link` (onClick → `onOpenSession(s.session_key)`) showing `session_name` + `<StatusPill status={s.status} />`. Cancelled-GP sessions render as plain rows (no link).

**Accessibility**: discrete `Link`s per target; no nested interactive controls.

---

## Component: `StatusPill`

**Location**: `src/components/tabs/overview/StatusPill.jsx`

**Props**: `{ status: StatusEnum }`

**Renders**: a Salt `Pill` (or styled span) labelled `status`, tinted by `STATUS_STYLES[status]`. Reused by `GrandPrixCard` (header + session rows).

---

## Util: `src/components/tabs/overview/utils/formatters.js`

**Exports**:
- `formatWeekend(dateStart, dateEnd) -> string` — e.g. `"14–16 Mar 2025"` (collapses same month/year); single date if `dateEnd` missing.
- `formatRaceDate(dateStart) -> string` — e.g. `"Sun 16 Mar, 15:00"`.
- `daysUntil(dateStart) -> number` — whole days from now (render-time).

---

## Routing changes

- `src/App.jsx`: add `<Route path="overview" element={<OverviewPage />} />` inside the `DashboardLayout` route; import `OverviewPage`.
- `src/components/dashboard/Sidebar/Sidebar.jsx`: remove `disabled: true` from the `Overview` nav item.
