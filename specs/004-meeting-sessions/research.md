# Research: Meeting Sessions Grid

**Branch**: `004-meeting-sessions` | **Date**: 2026-06-05

---

## Decision 1: How to supply meeting context (name, country) to the MeetingPage

**Decision**: Fetch meeting data fresh via `useMeetings({ meeting_key })` on the MeetingPage — do not pass it through navigation state.

**Rationale**: React Router `state` is lost on page refresh and breaks deep links. TanStack Query caches the meetings list already (from the Calendar tab, `staleTime: 10 min`), so the second fetch for a single meeting is a cache hit with zero network cost in the normal flow. Keeping data fetching in the page component is consistent with Article III (Component Isolation) and Article IV (Data Layer Discipline).

**Alternatives considered**:
- Pass meeting data as router `state` — discarded: not refresh-safe, breaks direct URLs.
- Store meeting in Redux — discarded: unnecessary; this is server state, not client UI state.

---

## Decision 2: Status derivation for sessions (2-way vs 3-way)

**Decision**: 3-way status: **Completed** (date_end < now), **In Progress** (date_start ≤ now ≤ date_end), **Upcoming** (date_start > now).

**Rationale**: Sessions are short (1–2 hours). A race in progress is a materially different UI state from "Completed" or "Upcoming". The Calendar tab uses 2-way status (whole weekend = past/future), but individual sessions need the "In Progress" case. The OpenF1 `/sessions` endpoint provides both `date_start` and `date_end`, making this derivable without an extra API call.

**Alternatives considered**:
- 2-way (same as calendar, Completed/Upcoming) — discarded: loses "In Progress" value for users watching a live session.
- Pull live state from API — discarded: OpenF1 free tier has no live data.

---

## Decision 3: Where to compute session status

**Decision**: In `useMeetingDetail` hook via `useMemo` over the raw sessions array.

**Rationale**: Same pattern as `useRaceCalendar`. Keeps components presentation-only; hook owns data shape. `useMemo` ensures recomputation only when `sessions` reference changes.

**Alternatives considered**:
- Compute status inside `SessionsGrid` component — discarded: mixes data logic with presentation, harder to test.

---

## Decision 4: Single hook vs two separate hooks

**Decision**: One composite hook `useMeetingDetail(meetingKey)` that internally calls `useMeetings` and `useSessions` and merges them.

**Rationale**: The page needs both meeting metadata and its sessions in one go. A single hook mirrors the pattern in `useTeamsByYear` (which joined 3 API calls). The MeetingPage stays simple: one hook call, destructure `{ meeting, sessions, isLoading }`.

**Alternatives considered**:
- Two separate hook calls in the component — discarded: exposes internal data dependencies to the page, couples the component to the data structure.

---

## Decision 5: Double-click to navigate (consistent with calendar)

**Decision**: Session rows use `onRowDoubleClicked` to navigate to `/sessions/:key`, same interaction as the Calendar grid's row click to navigate to `/meetings/:key`.

**Rationale**: Consistent interaction model across grids in the app. Double-click is already established for drill-down navigation in this project.

**Alternatives considered**:
- Single click — considered for accessibility, but double-click is the established pattern here and avoids accidental navigation.

---

## Decision 6: How to handle missing `date_end`

**Decision**: If `date_end` is null or missing, fall back to deriving status from `date_start` only (Completed if `date_start` < now, else Upcoming — no "In Progress" possible).

**Rationale**: OpenF1 data quality varies; some historical sessions may lack `date_end`. Graceful fallback prevents undefined status display without erroring. This is an edge case in practice.
