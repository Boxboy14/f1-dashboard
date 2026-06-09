# Implementation Plan: Session Detail Page

**Branch**: `005-session-detail` | **Date**: 2026-06-07 | **Spec**: [spec.md](./spec.md)

---

## Summary

Build the `/sessions/:sessionKey` page that displays the final classification and pit stop history for any F1 session. Double-clicking a session row in `MeetingPage` already navigates to this route — this plan builds the page that renders there. A new `useSessionDetail` hook fetches session metadata, classification results, driver data, and pit stops in four parallel TanStack Query calls, joining them into enriched rows. Two new ag-grid components handle Race/Sprint vs. Qualifying/Practice display differences. The route is added to App.jsx.

---

## Technical Context

**Language/Version**: JavaScript (ES2022), React 19

**Primary Dependencies**: React Router 7, TanStack Query v5, ag-grid 35, Salt Design System

**Storage**: None — all data fetched on demand and cached by TanStack Query

**Target Platform**: Desktop + mobile browser (dark theme only)

**Performance Goals**: Page renders within 2 seconds. The four parallel queries (sessions, session_result, drivers, pit) are all gated on `sessionKey` and cached at `staleTime: 5 min`.

**Constraints**: OpenF1 free tier — 3 req/sec, 30 req/min. Four queries are fired simultaneously; TanStack Query deduplicates if any are already in cache (e.g., `useDrivers` may already be cached from the Drivers tab for recent sessions).

---

## Constitution Check

| Article | Requirement | This Feature |
|---|---|---|
| I — Spec-First | Spec must exist before code | ✅ spec.md complete |
| II — API-First | Verify actual API response shapes | ✅ Verified in research.md — `/session_result` has no full_name/team_name (requires driver join); `/pit` confirmed field names; qualifying `duration` is array |
| III — Component Isolation | Each page is self-contained | ✅ `SessionDetailPage` owns its data; `ClassificationGrid` and `PitStopsGrid` are presentation-only |
| IV — Data Layer Discipline | All fetching via hooks, staleTime required | ✅ `useSessionDetail` composes existing hooks; all have `staleTime` set |
| V — Clean Code | No premature abstractions, no dead code | ✅ One new hook, one page, two grid components, one utils file |
| VI — UI Consistency | Salt DS first | ✅ ag-grid for tables; Salt `CircularProgress` for loading; Salt `Text` for heading; Salt `Button` for back nav |
| VII — Learning First | Every decision explainable | ✅ See research.md for all 7 architectural decisions |

---

## Project Structure

### Documentation (this feature)

```
specs/005-session-detail/
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
├── App.jsx                                               MODIFY: add /sessions/:sessionKey route
│
├── components/
│   ├── dashboard/
│   │   └── SessionDetailPage.jsx                         NEW: session detail page
│   │
│   └── tabs/
│       └── session-detail/                               NEW folder
│           ├── ClassificationGrid.jsx                    NEW: ag-grid for race/qualifying results
│           ├── ClassificationGrid.module.scss            NEW
│           ├── PitStopsGrid.jsx                          NEW: ag-grid for pit stop history
│           ├── PitStopsGrid.module.scss                  NEW
│           └── utils/
│               └── formatters.js                         NEW: formatLapTime, formatPitDuration, formatGap
│
├── hooks/
│   └── useOpenF1.js                                      MODIFY: add useSessionDetail
│
└── utils/
    └── cellRenderers/
        └── statusStyles.js                               MODIFY: add Finished/DNF/DNS/DSQ entries
```

---

## Component Architecture

### SessionDetailPage.jsx

```
SessionDetailPage
  ├── reads sessionKey from useParams()
  ├── reads [searchParams] from useSearchParams()
  ├── calls useSessionDetail(sessionKey)
  │
  ├── if isLoading && !session: <CircularProgress aria-label="Loading session" />
  ├── if !isLoading && !session: <Text>Session not found</Text>
  └── else:
      ├── <Button onClick={() => navigate back to meeting}> ← Back link
      ├── <Text styleAs="h2">{session.session_name}</Text>
      ├── <Text>{formatted session date}</Text>
      ├── <ClassificationGrid results={results} sessionType={session.session_type} isLoading={isLoading} />
      └── {pitStops.length > 0 || isLoading} &&
          <PitStopsGrid pitStops={pitStops} isLoading={isLoading} />
```

Back navigation: `navigate({ pathname: '/meetings/${session.meeting_key}', search: searchParams.toString() })`

### useSessionDetail(sessionKey)

```
Step 1 (parallel): useSessions({ session_key: sessionKey }, { enabled: Boolean(sessionKey) })
Step 2 (parallel): useSessionResult({ session_key: sessionKey }, { enabled: Boolean(sessionKey) })
Step 3 (parallel): useDrivers({ session_key: sessionKey }, { enabled: Boolean(sessionKey) })
Step 4 (parallel): usePit({ session_key: sessionKey }, { enabled: Boolean(sessionKey) })

Step 5: useMemo over [rawResults, drivers, rawPitStops, sessions]
  - Build driverMap: Map<driver_number, { full_name, name_acronym, team_name, team_colour }>
  - Enrich rawResults:
      - full_name = driverMap.get(driver_number)?.full_name ?? String(driver_number)
      - team_name = driverMap.get(driver_number)?.team_name ?? "—"
      - status = dsq ? "DSQ" : dnf ? "DNF" : dns ? "DNS" : "Finished"
      - best_time:
          - isRaceType: null
          - isQualifying: last non-null element of duration array (if array)
          - isPractice: duration (number)
  - Sort results by position ASC
  - Enrich rawPitStops with full_name and team_name from driverMap
  - Sort pitStops by lap_number ASC, then date ASC

Returns: {
  session: sessions[0] ?? null,
  results: ClassificationResult[],
  pitStops: PitStop[],
  isLoading: Boolean(sessionKey) && (isLoadingSessions || isLoadingResults || isLoadingDrivers || isLoadingPit)
}
```

**Session type helpers** (internal to hook):
```js
const isRaceType = (type) => ["Race", "Sprint"].includes(type);
const isQualifyingType = (type) => type?.includes("Qualifying");
```

### ClassificationGrid.jsx

Column set selection based on `sessionType`:

**Race/Sprint columns:**
| Header | Field | Width |
|---|---|---|
| `#` | `position` | 60px |
| Driver | `full_name` | flex 1 |
| Team | `team_name` | 180px |
| Gap | `gap_to_leader` | 130px |
| Status | `status` | 100px (StatusCellRenderer) |

**Qualifying/Practice columns:**
| Header | Field | Width |
|---|---|---|
| `#` | `position` | 60px |
| Driver | `full_name` | flex 1 |
| Team | `team_name` | 180px |
| Best Time | `best_time` | 150px (formatLapTime) |

### PitStopsGrid.jsx

| Header | Field | Width |
|---|---|---|
| Driver | `full_name` | flex 1 |
| Team | `team_name` | 180px |
| Lap | `lap_number` | 80px |
| Duration | `pit_duration` | 120px (formatPitDuration) |

### Formatters (session-detail/utils/formatters.js)

```js
// seconds (float) → "M:SS.mmm" or "SS.mmm" if < 60s
const formatLapTime = ({ value }) => { ... }

// seconds → "X.Xs" (e.g. "23.1s")
const formatPitDuration = ({ value }) => { ... }

// gap_to_leader: null → "" (leader), string → as-is
const formatGap = ({ value }) => value ?? "";

export { formatLapTime, formatPitDuration, formatGap };
```

---

## statusStyles.js Extension

Add four new entries to `src/utils/cellRenderers/statusStyles.js` for classification result statuses:

```js
Finished: { color: "var(--salt-content-secondary-foreground)" },
DNF:      { color: "var(--salt-status-error-foreground)" },
DNS:      { color: "var(--salt-status-error-foreground)" },
DSQ:      { color: "var(--salt-status-error-foreground)" },
```

`StatusCellRenderer` requires no changes — it reads whatever key is in `STATUS_STYLES`, so new keys are picked up automatically.

---

## Routing Changes

**App.jsx addition:**
```jsx
import SessionDetailPage from "./components/dashboard/SessionDetailPage.jsx";

// Inside <Route path="/" element={<DashboardLayout />}>
<Route path="sessions/:sessionKey" element={<SessionDetailPage />} />
```

Note: The current `MeetingPage` already navigates to `/sessions/${session.session_key}` on double-click. This route completes that navigation.

---

## Complexity Tracking

No constitution violations. No complexity justification required.

**Why 4 queries**: There is no single OpenF1 endpoint that returns classification + driver names + pit stops together. The `/session_result` endpoint has driver numbers but no names. The `/drivers` endpoint has names but no race results. The `/pit` endpoint is entirely separate. TanStack Query parallelises all four with zero coordination overhead; deduplication means if the user has already visited the Drivers tab, `useDrivers` is a cache hit.
