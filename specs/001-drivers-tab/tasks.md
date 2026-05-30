# Tasks: Drivers Tab

**Input**: Design documents from `/specs/001-drivers-tab/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/components.md ✅

**Tests**: Not requested in spec — no test tasks included.

---

## Phase 1: Setup

**Purpose**: Confirm the baseline works before touching anything.

- [x] T001 Start dev server (`npm run dev`) and verify `/drivers` loads the existing grid with 2025 driver data — no code changes, just confirm green starting state.

---

## Phase 2: Foundational — Data Layer Hook

**Purpose**: Add `useDriversByYear(year)` — the core hook both user stories depend on. Nothing else can be implemented until this exists.

**⚠️ CRITICAL**: No user story tasks can begin until T002 is complete.

- [x] T002 Add `useDriversByYear(year)` export to `src/hooks/useOpenF1.js` — compose the existing `useSessions` and `useDrivers` hooks using TanStack Query's dependent query pattern:
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
  Place after `useDrivers`. No other file changes in this task.

**Checkpoint**: `useDriversByYear` is exported and can be imported in components.

---

## Phase 3: User Story 1 — Browse All Drivers for Current Season (Priority: P1) 🎯 MVP

**Goal**: The grid continues to show 2025 drivers on page load, but now driven by `useDriversByYear(2025)` via a `year` prop instead of the hardcoded `session_key: 'latest'`. The user experience is identical to today — this phase is a clean refactor.

**Independent Test**: Navigate to `/drivers` (no query param). Grid shows the 2025 driver lineup (~22 drivers). All columns sort correctly. Double-clicking a row still opens the driver info card.

### Implementation for User Story 1

- [x] T003 [US1] Update `src/components/dashboard/DriversGrid/DriversGrid.jsx`:
  - Change props from `{ onDriverOpen = () => {} }` to `{ year, onDriverOpen = () => {} }`
  - Replace `useDrivers({ session_key: "latest" })` with `useDriversByYear(year)` (import from `../../../hooks/useOpenF1.js`)
  - Remove the `useDrivers` import if it is no longer used directly in this file

- [x] T004 [US1] Update `src/components/dashboard/HomePage.jsx`:
  - Add `import { useSearchParams } from "react-router-dom"`
  - Read the year from search params with default: `const [searchParams] = useSearchParams(); const year = Number(searchParams.get("year") ?? "2025");`
  - Pass `year` to `DriversGrid`: `<DriversGrid year={year} onDriverOpen={openDriverInfo} />`
  - No layout changes yet (selector is added in US2)

**Checkpoint**: `/drivers` still shows 2025 drivers. `/drivers?year=2023` shows 2023 drivers (even without a UI selector yet — test via direct URL). No regressions in sorting or double-click navigation.

---

## Phase 4: User Story 2 — Filter Drivers by Season Year (Priority: P1)

**Goal**: A year dropdown appears in the top-right of the Drivers tab. Selecting 2023, 2024, or 2025 refreshes the grid with that season's roster. The selected year is stored in the URL and survives navigation.

**Independent Test**: Select 2023 from the dropdown. Grid shows 20 drivers including Verstappen (Red Bull), Hamilton (Mercedes), Bottas (Alfa Romeo). URL updates to `?year=2023`. Navigate away and back — grid still shows 2023.

### Implementation for User Story 2

- [x] T005 [P] [US2] Create `src/components/dashboard/DriversGrid/YearSelector.jsx` — a controlled Salt DS `Dropdown`:
  - Props: `{ value: number, onChange: (year: number) => void }`
  - Options list: `[2023, 2024, 2025]` (as strings for Dropdown, converted back to number in `onChange`)
  - Import `Dropdown` from `@salt-ds/core`
  - The selected item is the string matching `String(value)`
  - On selection: call `onChange(Number(selectedString))`

- [x] T006 [P] [US2] Create `src/components/dashboard/DriversGrid/YearSelector.module.scss` — minimal styles:
  - Set a fixed width on the dropdown container so it doesn't stretch (e.g., `width: 120px`)
  - No other custom styles needed; Salt DS handles appearance

- [x] T007 [US2] Update `src/components/dashboard/HomePage.jsx` (builds on T004):
  - Add `import { useSearchParams } from "react-router-dom"` (update existing import to destructure setter too): `const [searchParams, setSearchParams] = useSearchParams()`
  - Add year change handler: `const handleYearChange = (newYear) => setSearchParams({ year: String(newYear) })`
  - Import `FlexLayout` from `@salt-ds/core`
  - Import `YearSelector` from `../DriversGrid/YearSelector.jsx`
  - Wrap the existing `<DriversGrid …/>` in a `FlexLayout` column layout:
    ```jsx
    <FlexLayout direction="column" gap={0}>
      <FlexLayout justify="space-between" align="center" style={{ padding: "0 0 12px 0" }}>
        <span>Drivers</span>
        <YearSelector value={year} onChange={handleYearChange} />
      </FlexLayout>
      <DriversGrid year={year} onDriverOpen={openDriverInfo} />
    </FlexLayout>
    ```
  - Replace the `<span>` for the title with a Salt DS `Text` component if available

**Checkpoint**: Year dropdown visible top-right. Selecting 2023 shows 2023 drivers. URL shows `?year=2023`. Navigating away and returning preserves the year.

---

## Phase 5: Polish

**Purpose**: Clean up pre-existing code smell touched during this feature.

- [x] T008 Move the `style={{ marginTop: "24px" }}` inline style out of `src/components/dashboard/DriversGrid/DriversGrid.jsx`:
  - Create `src/components/dashboard/DriversGrid/DriversGrid.module.scss` with `.grid { margin-top: 24px; }`
  - Import it in `DriversGrid.jsx` and replace the inline style with `className={styles.grid}`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No code dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user story work
- **US1 (Phase 3)**: Depends on Phase 2 (T002 must be complete) — T003 and T004 must run sequentially (T004 depends on T003 changing the `year` prop)
- **US2 (Phase 4)**: Depends on Phase 3 (T004 must be complete before T007) — T005 and T006 can run in parallel, T007 depends on T005
- **Polish (Phase 5)**: Depends on US1 and US2 being complete

### Within-Story Dependencies

```
T001 → T002 → T003 → T004 → T005 (parallel) → T007 → T008
                            T006 (parallel) ↗
```

### Parallel Opportunities

```
# T005 and T006 can run in parallel (different files):
Task: "Create YearSelector.jsx in src/components/dashboard/DriversGrid/"
Task: "Create YearSelector.module.scss in src/components/dashboard/DriversGrid/"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. T001 — confirm baseline
2. T002 — add `useDriversByYear`
3. T003 → T004 — wire year prop through grid and page
4. **STOP**: Test that `/drivers` still works and `/drivers?year=2023` shows 2023 lineup via direct URL
5. Deploy/demo: grid works for all 3 years (URL-only, no visual selector yet)

### Full Delivery (US1 + US2)

After MVP checkpoint passes:
5. T005 + T006 (parallel) → T007 — add visual year selector
6. T008 — polish

### Notes

- `[P]` tasks (T005, T006) can be done simultaneously
- Commit after T002 (foundational), again after T004 (US1 complete), again after T007 (US2 complete)
- Verify quickstart.md steps manually after T007 before marking US2 done
