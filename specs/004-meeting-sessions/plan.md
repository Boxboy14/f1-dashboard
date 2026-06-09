# Implementation Plan: Meeting Sessions Grid

**Branch**: `004-meeting-sessions` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)

---

## Summary

Build the `/meetings/:meetingKey` page that displays all sessions for a GP weekend. The Calendar grid (already built) already navigates to this route on double-click — this plan closes that gap. A new `useMeetingDetail` hook fetches meeting metadata and sessions in parallel, computing a 3-way status (Completed / In Progress / Upcoming) per session. A new `SessionsGrid` ag-grid component renders the sessions. Double-clicking a session navigates to `/sessions/:key` (the session detail page is a future feature; navigation is wired but the route renders a placeholder).

---

## Technical Context

**Language/Version**: JavaScript (ES2022), React 19

**Primary Dependencies**: React Router 7, TanStack Query v5, ag-grid 35, Salt Design System

**Storage**: None — all data fetched on demand and cached by TanStack Query

**Target Platform**: Desktop + mobile browser (dark theme only)

**Performance Goals**: GP weekend page renders within 2 seconds under normal network. Sessions grid makes exactly **2** queries (`useMeetings` + `useSessions`) — both cached by TanStack Query after the first visit.

**Constraints**: OpenF1 free tier — 3 req/sec, 30 req/min. `useMeetingDetail` makes exactly 2 queries; both are gated on `meetingKey` truthy to prevent spurious requests.

---

## Constitution Check

| Article | Requirement | This Feature |
|---|---|---|
| I — Spec-First | Spec must exist before code | ✅ spec.md complete |
| II — API-First | Verify API response shapes | ✅ Verified in research.md — `/sessions?meeting_key` and `/meetings?meeting_key` confirmed; `date_start`/`date_end` available |
| III — Component Isolation | Each page is self-contained | ✅ `MeetingPage` owns its own data; `SessionsGrid` is presentation-only |
| IV — Data Layer Discipline | All fetching via hooks, staleTime required | ✅ `useMeetingDetail` wraps existing `useMeetings`+`useSessions`; both carry existing `staleTime` |
| V — Clean Code | No premature abstractions, no dead code | ✅ One new hook, two new components; no over-engineering |
| VI — UI Consistency | Salt DS first | ✅ ag-grid for data table; Salt `Text` for heading |
| VII — Learning First | Every decision explainable | ✅ See research.md for all 6 architectural decisions |

---

## Project Structure

### Documentation (this feature)

```
specs/004-meeting-sessions/
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
├── App.jsx                                             MODIFY: add /meetings/:meetingKey route
│
├── components/
│   ├── dashboard/
│   │   └── MeetingPage.jsx                             NEW: GP weekend page
│   │
│   └── tabs/
│       └── sessions/                                   NEW folder
│           ├── SessionsGrid.jsx                        NEW: ag-grid sessions table
│           └── SessionsGrid.module.scss                NEW
│
└── hooks/
    └── useOpenF1.js                                    MODIFY: add useMeetingDetail
```

No Sidebar changes needed — meetings is a drill-down from Calendar, not a top-level nav item.

---

## Component Architecture

### MeetingPage.jsx

```
MeetingPage
  ├── reads meetingKey from useParams()
  ├── reads [searchParams] from useSearchParams()
  ├── calls useMeetingDetail(meetingKey)
  ├── defines openSessionDetail(session) →
  │     navigate({ pathname: `/sessions/${session.session_key}`, search: searchParams.toString() })
  │
  ├── if isLoading && !meeting: <CircularProgress />
  ├── if !isLoading && !meeting: <Text>Meeting not found</Text>
  └── else:
      ├── <Text styleAs="h2">{meeting.meeting_name}</Text>
      ├── <Text>{meeting.country_name}</Text>
      └── <SessionsGrid sessions={sessions} isLoading={isLoading} onSessionOpen={openSessionDetail} />
```

### SessionsGrid.jsx

```
SessionsGrid
  ├── props: { sessions, isLoading, onSessionOpen }
  ├── columnDefs (see below)
  ├── getRowId = ({ data }) => String(data.session_key)
  ├── onGridReady = ({ api }) => api.sizeColumnsToFit()
  ├── onRowDoubleClicked = ({ data }) => onSessionOpen(data)
  └── <DataGrid rowData={isLoading ? [] : sessions} ... />
```

### useMeetingDetail(meetingKey)

```
Step 1: useMeetings({ meeting_key: meetingKey }, { enabled: Boolean(meetingKey) })
          → meetings[]  (array; take meetings[0] as meeting)
Step 2: useSessions({ meeting_key: meetingKey }, { enabled: Boolean(meetingKey) })
          → rawSessions[]
Step 3: useMemo
  - sort rawSessions by date_start ASC
  - map each session: compute status from date_start / date_end vs new Date()
    - date_end && date_end < now                          → "Completed"
    - date_start <= now && (!date_end || date_end >= now) → "In Progress"
    - date_start > now                                    → "Upcoming"
    - fallback (no dates)                                 → "Unknown"
Returns: { meeting: meetings[0] ?? null, sessions: Session[], isLoading }
```

---

## SessionsGrid Column Definitions

```js
const formatDateTime = ({ value }) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

const STATUS_STYLES = {
  Completed:    { color: "var(--salt-content-secondary-foreground)" },
  "In Progress": { color: "var(--salt-status-warning-foreground)" },
  Upcoming:     { color: "#22c55e" },
  Cancelled:    { color: "var(--salt-status-error-foreground)" },
  Unknown:      { color: "var(--salt-content-secondary-foreground)" },
};

const StatusCellRenderer = ({ value }) => (
  <span style={STATUS_STYLES[value] ?? {}}>{value}</span>
);

const columnDefs = [
  { headerName: "Session", field: "session_name",  sortable: true, flex: 1 },
  { headerName: "Type",    field: "session_type",  sortable: true, width: 120 },
  { headerName: "Date",    field: "date_start",    sortable: true, width: 180,
    valueFormatter: formatDateTime,
    filter: "agTextColumnFilter",
    filterValueGetter: ({ data }) => formatDateTime({ value: data?.date_start }) },
  { headerName: "Status",  field: "status",        sortable: true, width: 130,
    cellRenderer: StatusCellRenderer },
];
```

---

## Routing Changes

**App.jsx addition**:
```jsx
import MeetingPage from "./components/dashboard/MeetingPage.jsx";

// Inside <Route path="/" element={<DashboardLayout />}>
<Route path="meetings/:meetingKey" element={<MeetingPage />} />
```

The Calendar's existing double-click navigation already targets `/meetings/:meeting_key` — no changes needed to `SeasonsPage.jsx` or `CalendarGrid.jsx`.

---

## Complexity Tracking

No constitution violations. No complexity justification required.

**Why 2 queries instead of 1**: There is no single endpoint that returns both meeting metadata and session list. `useMeetings` gives the heading (name, country); `useSessions` gives the rows. TanStack Query parallelises both automatically and deduplicates if the same keys are live elsewhere (e.g. the Calendar tab cached meetings).
