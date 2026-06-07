# Component Contracts: Meeting Sessions Grid

**Branch**: `004-meeting-sessions` | **Date**: 2026-06-05

---

## useMeetingDetail(meetingKey)

**File**: `src/hooks/useOpenF1.js`

**Purpose**: Fetches meeting metadata and all sessions for a given GP weekend. Computes session status.

```ts
function useMeetingDetail(meetingKey: number | string): {
  meeting: Meeting | null,   // null while loading or if not found
  sessions: Session[],       // enriched with `status` field; sorted chronologically
  isLoading: boolean,
}
```

**Behaviour**:
- Both `useMeetings` and `useSessions` are enabled only when `meetingKey` is truthy.
- `meetings` response is an array; `meeting` is `meetings[0] ?? null`.
- Sessions are sorted by `date_start` ASC.
- `status` is derived per session using `date_start` / `date_end` vs `new Date()`.

---

## MeetingPage

**File**: `src/components/dashboard/MeetingPage.jsx`

**Purpose**: Page-level component for the `/meetings/:meetingKey` route. Shows GP weekend heading and sessions grid.

```ts
// No props — reads meetingKey from useParams(), searchParams from useSearchParams()
function MeetingPage(): JSX.Element
```

**Behaviour**:
- Reads `meetingKey` from URL params.
- Calls `useMeetingDetail(meetingKey)`.
- Passes sessions and loading state to `SessionsGrid`.
- `onSessionOpen` callback: navigates to `/sessions/${session.session_key}?${searchParams}`.
- While `isLoading` is true and `meeting` is null, renders a loading state.
- If `meeting` is null after loading completes, renders a "Meeting not found" empty state.

---

## SessionsGrid

**File**: `src/components/tabs/sessions/SessionsGrid.jsx`

**Purpose**: ag-grid table displaying all sessions for a GP weekend.

```ts
interface SessionsGridProps {
  sessions: Session[];       // enriched with `status`; already sorted
  isLoading: boolean;
  onSessionOpen: (session: Session) => void;
}
function SessionsGrid(props: SessionsGridProps): JSX.Element
```

**Columns**:

| Header | Field | Width | Notes |
|---|---|---|---|
| Session | session_name | flex 1 | e.g. "Practice 1", "Race" |
| Type | session_type | 120px | e.g. "Practice", "Qualifying" |
| Date | date_start | 160px | Formatted as "26 May 2025, 14:00" |
| Status | status | 120px | StatusCellRenderer; colour-coded |

**Interaction**: `onRowDoubleClicked` → calls `onSessionOpen(rowData)`.

---

## StatusCellRenderer (sessions variant)

**File**: `src/components/tabs/sessions/SessionsGrid.jsx` (internal)

**Colours**:
- Completed: `var(--salt-content-secondary-foreground)` (muted grey)
- In Progress: `var(--salt-status-warning-foreground)` (amber/orange — active state)
- Upcoming: `#22c55e` (green — consistent with calendar)
- Cancelled: `var(--salt-status-error-foreground)` (red)
