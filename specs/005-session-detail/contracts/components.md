# Component Contracts: Session Detail Page

**Branch**: `005-session-detail` | **Date**: 2026-06-07

---

## `useSessionDetail(sessionKey)`

**File**: `src/hooks/useOpenF1.js` (exported)

**Inputs**:
| Param | Type | Required | Notes |
|---|---|---|---|
| `sessionKey` | string \| number | Yes | From `useParams()` in the page |

**Returns**:
```js
{
  session: Session | null,         // null until loaded
  results: ClassificationResult[], // empty until loaded
  pitStops: PitStop[],             // empty until loaded
  isLoading: boolean,
}
```

**Behaviour**:
- All four underlying queries (`useSessions`, `useSessionResult`, `useDrivers`, `usePit`) are gated on `Boolean(sessionKey)`.
- `isLoading` is true iff `sessionKey` is truthy AND any query is still fetching.
- Driver enrichment (full_name, team_name) uses driverMap built from `useDrivers` result; falls back to `String(driver_number)` when driver is not in the session roster.
- Returns empty arrays (not `undefined`) while loading, so consumers can call `.length` without null-checks.

---

## `SessionDetailPage`

**File**: `src/components/dashboard/SessionDetailPage.jsx`

**Props**: none — reads `sessionKey` from `useParams()`

**Responsibilities**:
- Calls `useSessionDetail(sessionKey)`
- Renders loading state: `<CircularProgress aria-label="Loading session" />`
- Renders not-found state: `<Text>Session not found</Text>`
- Renders heading: session name + session type + formatted date
- Renders back-navigation link: `/meetings/:meeting_key` + preserved search params
- Renders `<ClassificationGrid results={results} sessionType={session.session_type} isLoading={isLoading} />`
- Renders `<PitStopsGrid pitStops={pitStops} isLoading={isLoading} />` only when `pitStops.length > 0 || isLoading`

---

## `ClassificationGrid`

**File**: `src/components/tabs/session-detail/ClassificationGrid.jsx`

**Props**:
| Prop | Type | Required | Notes |
|---|---|---|---|
| `results` | `ClassificationResult[]` | Yes | Empty array while loading |
| `sessionType` | string | Yes | "Race", "Qualifying", "Practice 1", etc. |
| `isLoading` | boolean | Yes | Passed to DataGrid as `rowData={isLoading ? [] : results}` |

**Column sets**:

Race/Sprint (`sessionType ∈ ["Race", "Sprint"]`):
- `#` (position, 60px)
- `Driver` (full_name, flex 1)
- `Team` (team_name, 180px)
- `Gap` (gap_to_leader, 130px) — null/blank for leader
- `Status` (status, 100px) — StatusCellRenderer

Qualifying/Practice (all other session types):
- `#` (position, 60px)
- `Driver` (full_name, flex 1)
- `Team` (team_name, 180px)
- `Best Time` (best_time, 150px) — formatted M:SS.mmm

**Behaviour**:
- `getRowId = ({ data }) => String(data.driver_number)`
- `onGridReady = ({ api }) => api.sizeColumnsToFit()`
- No double-click navigation (this is a leaf page)

---

## `PitStopsGrid`

**File**: `src/components/tabs/session-detail/PitStopsGrid.jsx`

**Props**:
| Prop | Type | Required | Notes |
|---|---|---|---|
| `pitStops` | `PitStop[]` | Yes | Empty array while loading |
| `isLoading` | boolean | Yes | |

**Column set**:
- `Driver` (full_name, flex 1)
- `Team` (team_name, 180px)
- `Lap` (lap_number, 80px)
- `Duration` (pit_duration, 120px) — formatted as "X.Xs"

**Behaviour**:
- `getRowId = ({ data }) => \`${data.driver_number}-${data.lap_number}\``
- `onGridReady = ({ api }) => api.sizeColumnsToFit()`
- No row interaction (display-only)

---

## `src/components/tabs/session-detail/utils/formatters.js`

Named exports:
```js
// Formats seconds (float) as "M:SS.mmm" or "SS.mmm" if under 1 minute
export { formatLapTime };

// Formats pit stop duration as "Xs" (e.g. "23.1s")
export { formatPitDuration };

// Formats gap_to_leader: null → "" (blank, implies leader), string → as-is
export { formatGap };
```

---

## `src/utils/cellRenderers/statusStyles.js` — extend

Add entries for new session-result status values:

```js
const STATUS_STYLES = {
  // existing
  Completed:    { ... },
  "In Progress": { ... },
  Upcoming:     { ... },
  Cancelled:    { ... },
  Unknown:      { ... },
  // NEW
  Finished:     { color: "var(--salt-content-secondary-foreground)" },
  DNF:          { color: "var(--salt-status-error-foreground)" },
  DNS:          { color: "var(--salt-status-error-foreground)" },
  DSQ:          { color: "var(--salt-status-error-foreground)" },
};
```
