---
description: "Task list for Telemetry & UI Enhancements"
---

# Tasks: Telemetry & UI Enhancements

**Input**: Design documents from `specs/010-telemetry-ui-enhancements/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/components.md ✅ · quickstart.md ✅

**Tests**: None requested — project convention is manual browser verification (quickstart.md). Implementation tasks only.

**Cross-cutting directive**: **Salt tokens only — no raw hex** (Constitution Article VI). New colors (tyre row, start/finish checker, captions) use `var(--salt-…)` tokens; in SVG, `var()` goes through inline `style={{ fill/stroke }}`, never the `fill`/`stroke` attribute (feature-009 constraint). Charts keep numeric Recharts font sizes (SVG attrs don't resolve `var()`), which is fine — they're sizes, not colors.

**Organization**: Grouped by user story in priority order (US1 P1 → US7 P3).

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Parallelizable (different file, no dependency on an incomplete task)
- **[US#]**: User story the task serves

---

## Phase 1: Setup

- [X] T001 Install the PDF dependency: run `npm install jspdf` (adds `jspdf` to `package.json` dependencies). Verify it imports as `import { jsPDF } from "jspdf"`.

---

## Phase 2: Foundational (Blocking Prerequisites for US1 + US2 only)

**Purpose**: Make the displayed lap's number and tyre compound available on the telemetry driver meta. **Blocks US1 (report) and US2 (tyre card).** US3–US7 have no dependency here and may start anytime after Setup.

- [X] T002 In `src/hooks/useOpenF1.js`, add `lap_number: slot.lap?.lap_number ?? null` to the driver `base` meta object inside `useTelemetryComparison` (the `meta.push({...})` shape), so both the card and the report can read the concrete lap number.
- [X] T003 In `src/components/dashboard/TelemetryPage.jsx`, fetch stints with `useStints({ session_key: sessionKey }, { enabled: Boolean(sessionKey) })` (import `useStints` from the hooks barrel), and derive each driver's `compound` by finding the stint where `lap_start ≤ lap_number ≤ lap_end`; produce an enriched `telemetryDrivers` array (adds `compound: string | null`) that is passed to `DriverSummary` and reused when assembling the report. Title-case the compound for display (e.g. `SOFT` → `Soft`). No raw `fetch`; the hook already declares `staleTime`.

**Checkpoint**: Each telemetry driver object now carries `lap_number` + `compound` (null when no covering stint).

---

## Phase 3: User Story 1 — Downloadable lap summary report (Priority: P1) 🎯 MVP

**Goal**: One download button at the right of the chart-stack header produces a single PDF covering the GP, each driver's lap, tyre, and a bullet+paragraph summary of every channel.

**Independent Test**: Select event/session/2 drivers; click the single header download button; open the PDF and confirm GP name, per-driver lap/tyre blocks, and a summary per channel.

- [X] T004 [P] [US1] Create `src/utils/telemetry/lapSummary.js` — a pure builder `buildLapSummary({ gpName, circuitName, sessionName, lapLabel, drivers, chartData })` returning the `LapSummaryReport` object (per data-model.md): per-driver `{ name, driver_number, lapNumber, compound, hasData }`, and per-channel `{ label, unit, bullet, paragraph }` derived from `CHANNELS` + `chartData` columns (`${key}_a`/`${key}_b`). Compute honest stats: top speed (max), throttle max/avg, brake & DRS share-of-lap-on, gear range, rpm max; with two drivers the paragraph compares them in plain language. No hex, no rendering here — data only.
- [X] T005 [P] [US1] Create `src/utils/telemetry/lapSummaryPdf.js` — `downloadLapSummary(report)` using `import { jsPDF } from "jspdf"`: writes the title (`{gpName} — Summary of {lapLabel}`), a per-driver block (`Driver#{number} {name} — {lap}` + `Tyre: {compound}`, or "No lap data available for this driver." when `hasData` is false), then per channel a `• {label}: {bullet}` line and the wrapped `paragraph` (via `splitTextToSize`), with a `y`-cursor and `addPage()` pagination; ends with `doc.save("{gpName}-{lapLabel}.pdf")` (sanitized filename). Uses a built-in font (do not assume Roboto).
- [X] T006 [US1] In `src/components/tabs/telemetry/TelemetryCharts.jsx`, add an `onDownload` prop and render exactly one Salt `Button` (Salt `Download` icon, `aria-label="Download lap summary"`) pushed to the **far right** of the existing header `FlexLayout` (the lap-label + legend row) — e.g. `justify="space-between"` with the label/legend group on the left and the button on the right. No per-chart buttons. Keep `gap={4}` on the chart stack.
- [X] T007 [US1] In `src/components/dashboard/TelemetryPage.jsx`, resolve `sessionName` (from `sessionOptions`/selected session) and assemble the report via `buildLapSummary(...)`, then pass `onDownload={() => downloadLapSummary(report)}` to `TelemetryCharts`. Import both new utils.

**Checkpoint**: US1 fully functional — one button, one comprehensive PDF, handles 1 driver and no-lap drivers.

---

## Phase 4: User Story 2 — Driver card tyre detail (Priority: P2)

**Goal**: Each driver summary card shows the lap's tyre compound, or an explicit unavailable note.

**Independent Test**: With drivers selected, each card shows e.g. "Tyre: Soft"; a session/lap with no covering stint shows "Tyre data unavailable".

**Depends on**: Phase 2 (T003 provides `compound`).

- [X] T008 [US2] In `src/components/tabs/telemetry/DriverSummary.jsx`, render a tyre row inside `.stats` (or beside Fastest lap / Top speed): when `d.compound` is present, `Text` "Tyre **{Compound}**"; when null and the driver has a lap (`d.status === "ok"` or has `lap_number`), `Text color="secondary"` "Tyre data unavailable". No layout break in either case.
- [X] T009 [P] [US2] In `src/components/tabs/telemetry/DriverSummary.module.scss`, add styling for the tyre row (spacing consistent with the existing `.stats` rows). Any color via Salt token.

**Checkpoint**: US1 + US2 both work independently.

---

## Phase 5: User Story 3 — Track map circuit name + start/finish logo (Priority: P2)

**Goal**: A checkered-flag start/finish logo at the gap and a circuit-name caption beneath the map, in both modes.

**Independent Test**: Track map shows a checkered-flag logo at the outline gap and the circuit name below it, for both 2-driver (dominance) and 1-driver (speed) selections.

- [X] T010 [US3] In `src/components/tabs/telemetry/TrackMap.jsx`, render a **checkered-flag start/finish logo** at the gap: compute the midpoint of `sp[0]` and `sp[sp.length-1]`, draw an SVG `<g>` of alternating-fill `<rect>` squares (2 rows × 4 cols), `cell = Math.max(w, h) * 0.012`, fills `var(--salt-color-white)` / `var(--salt-color-gray-900)` via inline `style={{ fill }}`, plus a thin border `<rect>` using a Salt separable/border token for light-theme contrast. Render it in **both** `dominance` and `speed` branches (place it after `shapes` so it sits on top). Keep it readable via `vectorEffect` where strokes are used.
- [X] T011 [US3] Add a `circuitName` prop to `src/components/tabs/telemetry/TrackMap.jsx` and render it as a `Text` caption **beneath** the `<svg>`; in `src/components/dashboard/TelemetryPage.jsx`, resolve the circuit name from `meetings` + `meetingKey` (`circuit_short_name`, fallback `meeting_name`) and pass it to `<TrackMap circuitName={…} />`. (Same file as T010 — do after T010.)

**Checkpoint**: US1–US3 independently functional.

---

## Phase 6: User Story 4 — Sidebar collapse toggle (Priority: P2)

**Goal**: A persisted double-chevron control collapses/expands the desktop sidebar.

**Independent Test**: Bottom-right chevron shows » when open, collapses to an icon rail and flips to « when clicked, restores on second click, and the state survives reload.

- [X] T012 [US4] In `src/components/dashboard/layouts/DashboardLayout.jsx`, add a `collapsed` state initialized from `localStorage["f1-sidebar-collapsed"]` (default `false`), persist it on change via `useEffect` (mirroring the `f1-theme` pattern), and pass `collapsed` + `onToggleCollapse={() => setCollapsed(c => !c)}` to `<Sidebar />`.
- [X] T013 [US4] In `src/components/dashboard/Sidebar/Sidebar.jsx`, accept `collapsed` + `onToggleCollapse`, apply a `collapsed` class to `.sidebar` when set, and render a Salt `Button` pinned bottom-right that calls `onToggleCollapse` and shows `DoubleChevronRight` (») when open / `DoubleChevronLeft` («) when collapsed, with `aria-label` "Collapse sidebar" / "Expand sidebar". Import the icons from `@salt-ds/icons`.
- [X] T014 [P] [US4] In `src/components/dashboard/Sidebar/Sidebar.module.scss`, add the `.collapsed` rail (icon-only width ~64px, hide `.navLabel`, center icons) and a bottom-pinned footer style for the chevron button; hide the chevron control under the `$mobile-breakpoint` (mobile keeps the existing drawer). Colors via existing `--color-*` / Salt tokens.

**Checkpoint**: US1–US4 independently functional.

---

## Phase 7: User Story 5 — Track map layout & readability (Priority: P3)

**Goal**: Centered, thicker track map with a comfortably sized mode caption.

**Independent Test**: Map is horizontally centered, the outline is visibly thicker, and the "Speed map"/"Track dominance" caption is at the h3 scale.

- [X] T015 [US5] In `src/components/tabs/telemetry/TrackMap.module.scss`, center the map in its panel (e.g. remove the left-anchored `max-width` or add `margin-inline: auto` / center the `.wrap`), and ensure the `.heading` caption renders at the h3 scale (no ad-hoc shrink). Keep tokens only.
- [X] T016 [US5] In `src/components/tabs/telemetry/TrackMap.jsx`, increase the track outline `strokeWidth` (e.g. 3 → 5) on the dominance polylines, speed segments, and the plain outline so the line is visibly thicker. (Same file as T010/T011 — do after them.)

**Checkpoint**: Track map reads clearly and is centered.

---

## Phase 8: User Story 6 — Telemetry chart legibility (Priority: P3)

**Goal**: Taller charts with larger Y-axis labels; inter-chart gap already ≥15px.

**Independent Test**: Each chart is ≥350px tall with clearly larger Y-axis label text and clear separation between charts.

- [X] T017 [US6] In `src/components/tabs/telemetry/TelemetryChart.jsx`, set `ResponsiveContainer height={350}` (≥350px, FR-016) and increase the Y-axis label `fontSize` (12 → ~14) and tick `fontSize` (11 → ~12) (FR-018). Leave the chart-stack `gap={4}` as-is — it already resolves to 32px at the default medium density (≥15px, FR-017); confirm visually in quickstart.

**Checkpoint**: Chart stack is uncluttered and legible.

---

## Phase 9: User Story 7 — Remove the Sessions sidebar entry (Priority: P3)

**Goal**: No disabled "Sessions" entry in the sidebar.

**Independent Test**: Sidebar shows no "Sessions" entry; `/sessions/:key` navigation from Calendar/Overview still works.

- [X] T018 [US7] In `src/components/dashboard/Sidebar/Sidebar.jsx`, remove the `{ label: "Sessions", icon: FlagIcon, path: "/sessions", disabled: true }` row from `NAV_ITEMS` (and drop the now-unused `FlagIcon` import if nothing else uses it). (Same file as T013 — do after T013.)

**Checkpoint**: All seven stories independently functional.

---

## Phase 10: Polish & Verification

- [X] T019 Run `npm run build` and `npx eslint src` — both clean. Then `grep -rnE "#[0-9a-fA-F]{3,8}\b" src --include=*.jsx --include=*.js --include=*.scss --include=*.css` and confirm no raw hex was introduced (only `var(--salt-…)` refs). Fix any straggler.
- [X] T020 [P] Update root `plan.md` Phase 2 / snapshot to note feature 010 (lap-summary PDF, tyre card, track-map logo/caption, sidebar collapse, chart sizing, Sessions removal) and that the disabled `/sessions` sidebar entry was resolved by removal.
- [ ] T021 Execute `specs/010-telemetry-ui-enhancements/quickstart.md` (all 7 stories + regression sweep: theme flip over new elements, no-hex grep, build/lint) — **manual browser check, pending user**.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (T001)**: blocks the PDF utils (T005) only; everything else can start regardless.
- **Foundational (T002–T003)**: blocks **US1 (T004–T007)** and **US2 (T008–T009)**. Does **not** block US3–US7.
- **US3–US7**: independent of Foundational; can start after Setup at any time.
- **Polish (T019–T021)**: after the stories being shipped are done.

### Same-file sequences (must run in order, not parallel)

- `TrackMap.jsx`: **T010 → T011 → T016**
- `Sidebar.jsx`: **T013 → T018**
- `Sidebar.module.scss`: T014 (independent of the `.jsx` tasks)
- `TelemetryPage.jsx`: **T003 → T007 → T011** (foundational, then US1 wiring, then circuit prop)
- `useOpenF1.js`: T002 (single touch)

### Parallel opportunities

```text
# After Setup, these can begin immediately (different files, no foundational dep):
T012/T013/T014  US4 sidebar
T017            US6 chart sizing
T015            US5 track-map SCSS
T010            US3 start/finish logo

# Within US1 (after Foundational):
T004 lapSummary.js   ┐ different files, parallel
T005 lapSummaryPdf.js┘  (T005 also needs T001)
```

---

## Implementation Strategy

### MVP first

1. T001 (Setup) → T002–T003 (Foundational) → **US1 (T004–T007)**. Stop and validate the PDF download (the headline feature).

### Incremental delivery

1. Setup + Foundational → US1 (PDF) → validate.
2. US2 (tyre card) → validate.
3. US3 (track logo + caption) → validate.
4. US4 (sidebar collapse) → validate.
5. US5 (track layout), US6 (chart sizing), US7 (remove Sessions) — small polish stories, validate together.
6. Polish: build + lint + hex grep, root plan.md, quickstart.

### Quick wins (can be done first if you want fast visible progress)

- **T018** (remove Sessions) and **T017** (chart height/font) are one-file, no-dependency changes that deliver immediately.

---

## Notes

- One new dependency only: `jspdf` (Rule-3 walkthrough in research.md).
- Report data assembly (`lapSummary.js`) is deliberately separate from PDF rendering (`lapSummaryPdf.js`) so a `.txt` exporter could be added later without rework.
- The start/finish checker and tyre row are the only net-new colored elements — both use Salt palette/semantic tokens (no hex), with SVG fills via inline `style`.
- Commit after each task or logical group.
