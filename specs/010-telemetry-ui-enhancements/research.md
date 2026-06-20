# Research: Telemetry & UI Enhancements

Phase 0 decisions. Each resolves an unknown or justifies a technology choice for the plan.

---

## 1. PDF generation library — `jspdf`

**Decision**: Add `jspdf` and generate the lap summary report entirely client-side in a new util (`src/utils/telemetry/lapSummaryPdf.js`).

**Rationale**: The report is a structured text document (title line, per-channel bullets, explanatory paragraphs). `jspdf` builds this with simple `text()` calls and ships a `save()` that triggers the browser download — no server, no canvas rasterization needed. It's the de-facto standard for client-side PDF in React apps, tree-shakeable, and ~30 KB gzipped.

**Alternatives considered**:
- `window.print()` + print stylesheet → can't reliably produce a clean standalone document (prints page chrome, browser-dependent margins/headers); rejected.
- `pdfmake` → heavier, document-definition-object API is more than this simple layout needs; rejected.
- `react-pdf` (`@react-pdf/renderer`) → renders React components to PDF; powerful but a much larger dependency and a second rendering model to learn for a text-only report; rejected.
- Plain `.txt` export → the user's described format (title, bullets, paragraphs) reads as a document; PDF chosen as the v1 format per spec assumption. (A `.txt` fallback can be added later without rework since the report data is assembled separately from the renderer.)

### Rule-3 Library Walkthrough — `jspdf`

1. **What it is**: A client-side JavaScript library that builds PDF files in the browser and triggers their download.
2. **Why we chose it**: We need to turn an on-screen telemetry comparison into a saveable/shareable document without a backend; `jspdf`'s imperative `text()`/`save()` API matches our simple title+bullets+paragraph layout with minimal code.
3. **How it's wired in**: One util module, `lapSummaryPdf.js`, exports `downloadLapSummary(reportData)`. It `new jsPDF()`, writes lines with cursor bookkeeping, and calls `doc.save(filename)`. The Download `Button` in `TelemetryCharts` calls it with data assembled in `TelemetryPage`. No provider, no global setup.
4. **The key concept**: jsPDF is a **stateful cursor on a page** — you track a `y` offset yourself, advance it as you write lines, and call `addPage()` when you'd overflow. There's no automatic text flow/layout engine; `splitTextToSize(text, maxWidth)` wraps a paragraph into an array of lines you then write and advance past.
5. **What to watch out for**:
   - **Manual pagination**: long paragraphs must be wrapped with `splitTextToSize` and you must check `y` against page height before writing, or text runs off the page.
   - **Units**: default unit is mm with an A4 page (~210×297). Pick a left margin and line height once and reuse.
   - **Fonts**: only the built-in standard fonts (Helvetica/Times/Courier) are available without embedding font files — fine for this report; do **not** assume Roboto renders inside the PDF.
   - **Import shape**: import as `import { jsPDF } from "jspdf"` (named export in v2+).

---

## 2. Tyre compound for the displayed lap

**Decision**: Fetch stints on the Telemetry page with the existing `useStints({ session_key })` hook, and for each driver's displayed lap map the lap number to the covering stint's `compound`. Surface it in `telemetryDrivers` meta (add `lap_number` + `compound`) so `DriverSummary` stays presentational.

**Rationale**: `/stints` is already wrapped (`useStints`, `staleTime` set) and returns one row per stint with `driver_number`, `lap_start`, `lap_end`, `compound`, `stint_number`, `tyre_age_at_start`. The displayed lap's compound is the stint where `lap_start ≤ lapNumber ≤ lap_end`. This adds one cached query for the whole session (not per-driver), respecting rate limits.

**Where the lap number lives**: `useDriverLapTelemetry` already resolves the concrete `lap` object (with `lap_number`). Today `useTelemetryComparison` puts `lapTime` into the meta but not `lap_number` — we add `lap_number` to the meta `base` so both the card (tyre lookup) and the PDF (header) can use it.

**Alternatives considered**:
- Deriving compound from `/laps` → laps don't carry compound; rejected.
- A new dedicated endpoint → none needed; `/stints` already covers it.

**Edge case**: no stint row covers the lap (sprint/practice gaps, missing data) → card shows an explicit "Tyre data unavailable" note (FR-007).

---

## 3. Track map start/finish marker geometry

**Decision** (updated per user request — "I want a start finish logo"): Render a **checkered-flag logo** at the start/finish gap, not a plain tick. The lap trace is a near-closed loop whose two endpoints (`sp[0]`, `sp[sp.length-1]`) sit on either side of the start/finish line — the visible "gap". Draw a small checkered-flag marker — an SVG `<g>` of alternating-fill `<rect>` squares (a 2-row × 4-column checker, classic motorsport start/finish symbol) — centered on the **midpoint** of those two endpoints, inside the same `<svg>`/`viewBox`, in **both** `dominance` and `speed` modes.

**Implementation notes**:
- **Sizing**: the marker is sized as a fraction of the track extent — `cell = Math.max(w, h) * 0.012` per square — so it scales proportionally with the circuit and never dominates the map. Computed from the bounding box already derived in `TrackMap`.
- **Orientation**: axis-aligned squares centered at the gap midpoint. A recognizable checkered-flag *logo* (not a literal perpendicular track band) is what the user asked for; axis alignment keeps the rect math trivial and reads clearly at any circuit.
- **Color / no-hex**: alternating fills come from Salt tokens — `var(--salt-color-white)` and `var(--salt-color-gray-900)` — applied via inline `style={{ fill: … }}` (SVG `fill` *attributes* don't resolve `var()`, but the `style` property does — the same constraint documented in feature 009 for stroke colors). A thin border rect uses the track/ separable Salt token so the white squares stay visible on a light theme.
- A small extracted helper (e.g. `startFinishMarker(sp, w, h)` returning the `<g>`, or an inline block) keeps `TrackMap` readable.

**Rationale**: A vector checkered flag built from `<rect>`s scales cleanly inside the `viewBox` (unlike a raster image), themes via Salt tokens (unlike a baked-in PNG), and needs no real marker data from the API (OpenF1 doesn't provide a start/finish coordinate — the lap-trace gap is the start/finish location). It satisfies the user's explicit "logo" request while staying within the no-hex / Salt-token constraint.

**Alternatives considered**:
- A plain perpendicular tick line → simpler, but the user explicitly wants a *logo*, not a tick; rejected.
- A raster/PNG checkered-flag image → doesn't scale cleanly in `viewBox` space and can't be Salt-themed for dark/light; rejected in favor of inline vector rects.
- Salt's `Flag` icon component → it's a single-color plain flag, not a checkered start/finish symbol, and embedding a foreign icon at exact `viewBox` coordinates fights the coordinate scaling; a purpose-built rect checker is clearer and self-contained.
- Connecting the gap (closing the loop) → would hide the start/finish location the user wants marked; rejected.

---

## 4. Circuit name for the track-map caption

**Decision**: Pass the circuit name down from `TelemetryPage`. The page already has `meetings` (from `useRaceCalendar(year)`) and the selected `meetingKey`; look up `circuit_short_name` (with `meeting_name` as fallback) and pass it to `TrackMap` as a `circuitName` prop, rendered as a `Text` caption beneath the `<svg>`.

**Rationale**: No new fetch — the meeting record already carries `circuit_short_name`. Keeping the lookup in the page preserves `TrackMap` as a pure presentational component.

---

## 5. Sidebar collapsed state + persistence

**Decision**: Lift a `collapsed` boolean into `DashboardLayout` (which already owns the mobile `sidebarOpen` state), initialized from `localStorage["f1-sidebar-collapsed"]` and persisted on change — mirroring the established `ThemeProvider` pattern (`f1-theme`). Pass `collapsed` + `onToggleCollapse` to `Sidebar`. A `Button` with `DoubleChevronRight` (when open) / `DoubleChevronLeft` (when collapsed) sits pinned at the sidebar's bottom-right.

**Rationale**: Reuses the exact persistence approach already in the app (Constitution-friendly, no new concept). The collapse is desktop-only: on mobile the sidebar is already a hamburger drawer (`isOpen`/`onClose`), and the collapsed icon-rail doesn't apply there — the chevron footer is hidden under the mobile breakpoint, leaving existing mobile behavior untouched.

**Collapsed presentation**: width shrinks from `220px` to an icon-rail (~64px); `.navLabel` is hidden; icons remain centered. CSS-only via a `collapsed` class on `.sidebar`.

**Alternatives considered**:
- A new React context for sidebar state → overkill; only the layout and its direct `Sidebar` child need it. Prop drilling one level is simpler (Article V).
- `sessionStorage` → the user wants the choice remembered across visits, so `localStorage` (like the theme), not `sessionStorage`.

---

## 6. Chart sizing & legibility tokens

**Decision**:
- **Chart height**: `TelemetryChart` `ResponsiveContainer height` 210 → `350` (px; satisfies "≥350px"). Keep responsive width. **This is the primary fix for the "cluttered" feel.**
- **Inter-chart gap**: **already satisfied — no change required.** Verified against the installed theme: default Salt density is `medium` → `--salt-spacing-100: 16px` (touch), `12px` (low), `8px` (medium), `4px` (high), and layout `gap={n}` resolves to `n × --salt-spacing-100`. The chart stack already uses `StackLayout gap={4}` = **32px** at medium density, comfortably above the ≥15px requirement (FR-017). We keep `gap={4}`; the implementer confirms ≥15px visually in quickstart. (Reducing it would violate the requirement, so it stays.)
- **Y-axis label**: increase the axis-title `fontSize` (currently 12) and tick `fontSize` (currently 11) to the next step up (label → ~14, ticks → ~12), keeping them as numeric Recharts font sizes (Recharts sets SVG attributes that don't resolve CSS `var()`). These are presentation sizes, not colors, so no token/hex concern.
- **Track caption**: the "Speed map"/"Track dominance" heading is already `Text styleAs="h3"` in JSX but the SCSS may shrink it; ensure it renders at the `h3` scale (no ad-hoc small size). Per spec US5, use an existing heading scale level rather than a hand-picked px.

**Rationale**: Height is the main fix for the "cluttered" feel; the label-size bump is a secondary legibility win. The inter-chart gap is already correct, so the only style edits are height + Y-axis font + track caption — minimal, per Article V. Recharts font sizes stay numeric because Recharts renders them as SVG `font-size` attributes (the same constraint documented in feature 009 for stroke colors).

---

## 7. Remove the Sessions sidebar entry

**Decision**: Delete the `{ label: "Sessions", … disabled: true }` row from `NAV_ITEMS` in `Sidebar.jsx`. The `/sessions/:key` route (reached from Calendar/Overview) is unaffected — only the dead nav shortcut is removed.

**Rationale**: Trivial dead-UI removal (FR-019, Article V). No route or other component references the sidebar entry.
