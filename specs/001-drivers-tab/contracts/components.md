# Component Contracts: Drivers Tab

**Feature**: `001-drivers-tab`
**Date**: 2026-05-30

---

## YearSelector

**File**: `src/components/dashboard/DriversGrid/YearSelector.jsx`

**Purpose**: A dropdown that lets the user choose a season year (2023, 2024, 2025). Positioned in the top-right of the Drivers tab header area.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `value` | `number` | Yes | Currently selected year (2023, 2024, or 2025) |
| `onChange` | `(year: number) => void` | Yes | Called when user selects a different year |

### Behaviour

- Renders a Salt DS `Dropdown` with three items: 2023, 2024, 2025.
- The `value` prop controls which item is shown as selected.
- Calls `onChange` with the newly selected year as a `number` when the selection changes.
- Does **not** own state — it is a controlled component.

---

## DriversGrid

**File**: `src/components/dashboard/DriversGrid/DriversGrid.jsx`

**Purpose**: Displays the ag-grid of drivers for a given season year. Handles data fetching internally.

### Props (updated from current)

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `year` | `number` | Yes | — | Season year to display (2023, 2024, or 2025) |
| `onDriverOpen` | `(driver: object) => void` | No | `() => {}` | Called when a driver row is double-clicked |

**Change from current**: The component previously called `useDrivers({ session_key: 'latest' })` internally. It now accepts a `year` prop and calls `useDriversByYear(year)` internally. `session_key` is no longer a prop — year-to-session resolution is the hook's responsibility.

### Behaviour

- While data is loading: renders the grid with no rows (empty state).
- When data is ready: renders all drivers for the given year.
- Double-click on a row: calls `onDriverOpen(driverObject)`.
- All columns are sortable.
- Grid resizes columns to fit on mount.

---

## HomePage (Drivers page container)

**File**: `src/components/dashboard/HomePage.jsx`

**Purpose**: The page-level container for the `/drivers` route. Owns the year selection state (via URL params) and composes `YearSelector` + `DriversGrid`.

### No props — reads from router context

| Source | Value | Description |
|---|---|---|
| `useSearchParams()` | `year` search param | Currently selected year; defaults to `2025` if absent |
| `useOutletContext()` | `openDriverInfo` | Callback to open driver info card (passed from `DashboardLayout`) |

### Layout

```
┌─────────────────────────────────────────────────────┐
│  Drivers                              [Year ▼ 2025] │  ← top row: title left, selector right
├─────────────────────────────────────────────────────┤
│                                                     │
│   ag-grid (full width, fills remaining height)      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## useDriversByYear (hook)

**File**: `src/hooks/useOpenF1.js` (new export added to existing file)

### Signature

```js
useDriversByYear(year: number): UseQueryResult<Driver[]>
```

### Behaviour

- Calls `useSessions({ year, session_type: "Race" })` to retrieve all Race sessions for the year.
- Derives `lastSessionKey` = `sessions.at(-1)?.session_key`.
- Calls `useDrivers({ session_key: lastSessionKey }, { enabled: Boolean(lastSessionKey) })`.
- Returns the same shape as `useDrivers` — `{ data, isLoading, isError, error }`.
- While sessions are loading (no `lastSessionKey` yet): `data` is `undefined`, `isLoading` is `true`.
- `staleTime` is inherited from the individual `useSessions` and `useDrivers` hooks (5 min each).
