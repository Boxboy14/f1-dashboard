# Research: Drivers Tab

**Feature**: `001-drivers-tab`
**Date**: 2026-05-30

---

## Q1: How does the OpenF1 `/drivers` endpoint handle year-based filtering?

**Question**: Can `/drivers` be filtered by `year` directly, or does it require a `session_key`?

**Finding**: `/drivers` does **not** accept a `year` parameter. It only accepts `session_key`. Passing `session_key=latest` returns the most recent session's driver roster.

**Verified with live API calls**:
- `GET /drivers?session_key=latest` → 22 drivers (2025 season current roster)
- `GET /sessions?year=2023&session_type=Race` → 29 race/sprint sessions; last entry is Abu Dhabi (session_key=9197)
- `GET /drivers?session_key=9197` → 20 drivers (correct 2023 season lineup: Verstappen, Hamilton, Norris, Bottas, Ricciardo, etc.)

**Decision**: Use a **two-step dependent query** pattern to resolve year → session_key → drivers:
1. `GET /sessions?year=<year>&session_type=Race` — fetch all Race sessions for the year
2. Take the last entry's `session_key` (last race = Abu Dhabi / final round = full-season lineup)
3. `GET /drivers?session_key=<last_key>` — fetch the driver roster

**Rationale**: The last race session of a season has the complete, stable driver lineup. Mid-season driver replacements (e.g., Ricciardo replacing De Vries in 2023) are reflected because the final race includes the end-of-season roster.

**Alternatives considered**:
- Hardcoding a `year → session_key` lookup table — rejected: brittle, breaks when a new season is added, requires manual maintenance.
- Using `session_key=latest` for 2025 and chaining only for 2023/2024 — rejected: inconsistent pattern, harder to maintain.

---

## Q2: Where should the selected year state live?

**Question**: URL search params, Redux, or React component state?

**Decision**: **URL search params** (`/drivers?year=2024`) via React Router's `useSearchParams`.

**Rationale**:
- Satisfies FR-009 (persists across navigation) — the URL carries the state into the browser history stack, so back/forward and tab navigation preserve it.
- Bookmarkable — a user can share `/drivers?year=2023` and the recipient lands on the 2023 lineup directly.
- Aligns with the project constitution (Article III): "The only shared state is URL state (React Router) and cached API state (TanStack Query)."
- No Redux required — Redux is for client-only UI state with no URL equivalent (e.g., modal open/closed).

**Alternatives considered**:
- Redux slice — rejected: year selector is navigation state, not client-only UI state.
- React `useState` in the page component — rejected: lost on navigation away from `/drivers`.

---

## Q3: What Salt DS component should be used for the year dropdown?

**Decision**: Salt DS `Dropdown` from `@salt-ds/core` (already installed at v1.54.1).

**Rationale**: Salt DS is the first choice for every UI element per constitution Article VI. `Dropdown` is the correct component for a small fixed set of options (2023, 2024, 2025).

**Alternatives considered**:
- `ComboBox` — rejected: adds type-to-search which is unnecessary for a 3-item list.
- Raw `<select>` — rejected: violates constitution Rule 4 (Salt DS first).

---

## Q4: Should a new `useDriversByYear` hook be created or should `DriversGrid` compose hooks itself?

**Decision**: Add a **`useDriversByYear(year)`** hook to `src/hooks/useOpenF1.js` that encapsulates the two-step query.

**Implementation pattern**:
```js
export function useDriversByYear(year) {
  const { data: sessions = [] } = useSessions({ year, session_type: "Race" });
  const lastSessionKey = sessions.at(-1)?.session_key;
  return useDrivers(
    { session_key: lastSessionKey },
    { enabled: Boolean(lastSessionKey) }
  );
}
```

**Rationale**: Constitution Article IV: "All API access flows through `src/hooks/useOpenF1.js`." The two-step resolution is API-layer logic, not component logic. `DriversGrid` should not know that year resolution requires two API calls. TanStack Query's dependent query pattern (`enabled: Boolean(lastSessionKey)`) handles the sequencing automatically — the drivers query waits until the session_key is resolved.

**Known limitation**: `DashboardLayout` currently uses `useDrivers({ session_key: 'latest' })` to power the global search and driver info card. If a user views 2023 drivers and double-clicks a driver who is no longer in the 2025 roster (e.g., Valtteri Bottas), the info card will not open because `selectedDriver` is resolved against the 2025 driver list. This is out of scope for this spec (assumption documented in spec.md).

---

## Summary of decisions

| Decision | Choice |
|---|---|
| Year → session_key resolution | Two-step: `/sessions?year=Y&session_type=Race` → last entry's `session_key` |
| Year state location | URL search param (`?year=2025`) via `useSearchParams` |
| Year dropdown component | Salt DS `Dropdown` |
| Hook encapsulation | New `useDriversByYear(year)` in `useOpenF1.js` |
| Default year | 2025 (hardcoded, per spec assumption) |
