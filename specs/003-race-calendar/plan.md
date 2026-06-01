# Implementation Plan: Race Calendar

**Branch**: `003-race-calendar` | **Date**: 2026-06-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-race-calendar/spec.md`

---

## Summary

Build a `/seasons` page that shows all Grand Prix rounds for the selected season — round number, GP name, circuit, country (with flag), race date, and completion status. The race calendar reads from the global year selector and uses a single TanStack Query call to `/meetings`. Pre-season testing is filtered client-side. A double-click navigates to `/meetings/:key` (US2 — the meeting detail page is a future feature).

---

## Technical Context

**Language/Version**: JavaScript (ES2022), React 19

**Primary Dependencies**: React Router 7, TanStack Query v5, ag-grid 35, Salt Design System

**Storage**: None — all data fetched on demand and cached by TanStack Query

**Target Platform**: Desktop + mobile browser (dark theme only)

**Project Type**: Single-page web app (Vite + React)

**Performance Goals**: Calendar grid renders within 2 seconds under normal network conditions; season change updates grid within 2 seconds (matching existing Drivers/Teams tab behaviour)

**Constraints**: OpenF1 free tier — 3 req/sec, 30 req/min. `useRaceCalendar` makes exactly **1** query (`useMeetings`). No per-meeting queries in this feature.

---

## Constitution Check

| Article | Requirement | This Feature |
|---|---|---|
| I — Spec-First | Spec must exist before code | ✅ spec.md complete |
| II — API-First | Verify API response shapes before building | ✅ Verified in research.md — real API call confirmed `is_cancelled`, `country_flag`, pre-season testing filter |
| III — Component Isolation | Each page is self-contained | ✅ `SeasonsPage` owns its own data; no shared state with other tabs |
| IV — Data Layer Discipline | All fetching via hooks, staleTime required | ✅ `useRaceCalendar` wraps existing `useMeetings`; `staleTime` already set at 10 min |
| V — Clean Code | No premature abstractions, no dead code | ✅ `valueFormatter` for date, `cellRenderer` for status+flag — minimal, no over-engineering |
| VI — UI Consistency | Salt DS first | ✅ ag-grid for the data table (same as Drivers/Teams tabs) |
| VII — Learning First | Every decision explainable | ✅ See research.md for all 6 architectural decisions |

---

## Project Structure

### Documentation (this feature)

```
specs/003-race-calendar/
├── plan.md              ← this file
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── components.md
└── tasks.md             ← created by /speckit-tasks
```

### Source Code Changes

```
src/
├── App.jsx                                         MODIFY: add /seasons route
│
├── components/
│   ├── dashboard/
│   │   └── SeasonsPage.jsx                         NEW: tab shell
│   │
│   └── tabs/
│       └── calendar/                               NEW folder
│           ├── CalendarGrid.jsx                    NEW: ag-grid race calendar
│           └── CalendarGrid.module.scss             NEW
│
└── hooks/
    └── useOpenF1.js                                MODIFY: add useRaceCalendar
```

**Also**:
- `src/components/dashboard/Sidebar/Sidebar.jsx` — MODIFY: remove `disabled: true` from the Calendar nav item

---

## Component Architecture

### SeasonsPage.jsx

```
SeasonsPage
  ├── reads year from useOutletContext()
  ├── reads [searchParams] from useSearchParams()
  ├── defines openRaceDetail(meeting) → navigate({ pathname: `/meetings/${meeting.meeting_key}`, search })
  │
  ├── <Text styleAs="h2">Calendar</Text>
  └── <CalendarGrid year={year} onRaceOpen={openRaceDetail} />
```

No detail dialog — US2 is full-page navigation to `/meetings/:key`.

### CalendarGrid.jsx

```
CalendarGrid
  ├── props: { year, onRaceOpen }
  ├── calls useRaceCalendar(year)
  ├── columnDefs (see below)
  └── <DataGrid rowData={isLoading ? [] : races} onRowDoubleClicked={onRaceOpen} />
```

### useRaceCalendar(year) — new hook

```
Step 1: useMeetings({ year })  →  Meeting[]  (all, including testing)
Step 2: useMemo transform
  - filter: exclude meeting_name.toLowerCase().includes("testing")
  - sort: by date_start ASC
  - map: add round (index + 1) and status
Returns: { data: RaceRound[], isLoading: boolean }
```

---

## CalendarGrid Column Definitions

```js
const formatDate = ({ value }) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "—";

const CountryCellRenderer = ({ value, data }) => (
  <span className={styles.countryCell}>
    {data?.country_flag && (
      <img src={data.country_flag} alt="" className={styles.countryFlag} />
    )}
    {value}
  </span>
);

const STATUS_STYLES = {
  Completed: { color: "var(--salt-content-secondary-foreground)" },
  Upcoming:  { color: "#22c55e" },
  Cancelled: { color: "var(--salt-status-error-foreground)" },
};

const StatusCellRenderer = ({ value }) => (
  <span style={STATUS_STYLES[value] ?? {}}>{value}</span>
);

const columnDefs = [
  { headerName: "Rnd",        field: "round",             sortable: true, width: 70 },
  { headerName: "Grand Prix", field: "meeting_name",       sortable: true, flex: 1 },
  { headerName: "Circuit",    field: "circuit_short_name", sortable: true, flex: 1 },
  { headerName: "Country",    field: "country_name",       sortable: true, width: 160,
    cellRenderer: CountryCellRenderer },
  { headerName: "Date",       field: "date_start",         sortable: true, width: 130,
    valueFormatter: formatDate },
  { headerName: "Status",     field: "status",             sortable: true, width: 120,
    cellRenderer: StatusCellRenderer },
];
```

---

## Routing Changes

**App.jsx addition**:
```jsx
import SeasonsPage from "./components/dashboard/SeasonsPage.jsx";

// Inside <Route path="/" element={<DashboardLayout />}>
<Route path="seasons" element={<SeasonsPage />} />
```

No `/:param` sub-route needed — US2 navigates to `/meetings/:key` (a separate future route).

**Sidebar change**: Remove `disabled: true` from the Calendar entry in `NAV_ITEMS`.

---

## Complexity Tracking

No constitution violations. No complexity justification required.
