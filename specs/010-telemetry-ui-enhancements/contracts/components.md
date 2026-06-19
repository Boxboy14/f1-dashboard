# Component Contracts: Telemetry & UI Enhancements

UI contracts for the changed/added components. "Salt-first" per Constitution Article VI: Salt `Button`, Salt icons, `Text styleAs`; colors from Salt tokens only.

---

## `lapSummaryPdf.js` (new util)

```text
downloadLapSummary(report: LapSummaryReport): void
```

- **Input**: the assembled `LapSummaryReport` (see data-model.md).
- **Behavior**: builds a PDF with `jsPDF`, writes:
  - Title: `"{gpName} — Summary of {lapLabel}"` (per driver, the format `… for Driver#{number} {name}` appears in the per-driver block).
  - For each driver: a heading line `Driver#{driver_number} {name} — {lapLabel}` (or `Lap {lapNumber}`), and the tyre compound; if `hasData === false`, the line "No lap data available for this driver."
  - For each channel: a bullet (`• {label}: {bullet}`) followed by the wrapped `paragraph`.
  - Manual pagination via `splitTextToSize` + `y`-cursor / `addPage()`.
- **Output**: triggers `doc.save("{gpName}-{lapLabel}.pdf")` (sanitized filename). No return value, no throw on normal input.
- **Import**: `import { jsPDF } from "jspdf"`.

---

## `TelemetryCharts.jsx` (edit)

**New prop**: `onDownload: () => void` (or `report` + internal handler — implementer's choice; the page assembles the data).

- The header row (existing `.legend` FlexLayout holding `lapLabel` + driver swatches) MUST render a single Salt `Button` (`Download` icon, accessible label "Download lap summary") **pushed to the far right** of that row (e.g. `justify="space-between"` or a spacer).
- Exactly one button in the stack (FR-002). Clicking it calls `onDownload`.
- The chart stack keeps `gap={4}` (32px ≥ 15px, FR-017).

**Acceptance**: header shows lap label + legend on the left and one download button on the right; no per-chart buttons.

---

## `TelemetryChart.jsx` (edit)

- `ResponsiveContainer height` MUST be ≥ 350 (set to `350`). (FR-016)
- Y-axis title `fontSize` increased (~14) and tick `fontSize` increased (~12). (FR-018)
- No color/data changes.

**Acceptance**: each chart renders ≥350px tall with visibly larger Y-axis label text.

---

## `DriverSummary.jsx` (edit)

**Changed input**: each `drivers[]` entry now carries `lap_number` and `compound` (added upstream).

- When `compound` is present, render a tyre row (e.g. `Text` "Tyre: {Compound}" with a Salt token color), alongside the existing Fastest lap / Top speed stats. (FR-006)
- When `compound` is null (and the driver has a lap), render "Tyre data unavailable" in secondary text. (FR-007)
- Compound display normalized to title case (e.g. "SOFT" → "Soft").

**Acceptance**: card shows the lap's tyre compound, or an explicit unavailable note; no blank/broken area.

---

## `TrackMap.jsx` (edit)

**New prop**: `circuitName: string`.

- Render a **checkered-flag start/finish logo** at the gap: an SVG `<g>` of alternating-fill `<rect>` squares (2 rows × 4 cols) centered on the midpoint of `sp[0]`–`sp[sp.length-1]`, sized as a fraction of the track extent (`cell ≈ Math.max(w,h) * 0.012`), fills `var(--salt-color-white)` / `var(--salt-color-gray-900)` applied via inline `style={{ fill }}`, with a thin Salt-token border rect for light-theme contrast. Drawn in **both** `dominance` and `speed` modes. (FR-009)
- Render `circuitName` as a `Text` caption **beneath** the `<svg>`. (FR-008)
- Track outline stroke width increased (visibly thicker; e.g. base `strokeWidth` 3 → 5 for the outline path / segments). (FR-014)
- The map is centered horizontally in its panel (CSS). (FR-013)
- The mode caption ("Speed map"/"Track dominance") renders at an existing heading scale level (keep `Text styleAs="h3"`; ensure SCSS doesn't shrink it). (FR-015)

**Acceptance**: circuit name appears below a centered, thicker map with a checkered-flag start/finish logo at the gap, in both modes; caption is comfortably sized.

---

## `Sidebar.jsx` (edit)

**New props**: `collapsed: boolean`, `onToggleCollapse: () => void`.

- `NAV_ITEMS` MUST NOT include the "Sessions" entry. (FR-019)
- A Salt `Button` pinned at the sidebar's bottom-right toggles collapse:
  - open state → `DoubleChevronRight` icon (»); collapsed state → `DoubleChevronLeft` icon («). (FR-011)
  - Accessible label reflects action ("Collapse sidebar" / "Expand sidebar").
- When `collapsed`, the sidebar shows an icon-only rail (labels hidden) via a `collapsed` class. (FR-010)
- The chevron control is hidden under the mobile breakpoint (mobile keeps the existing drawer behavior).

**Acceptance**: no Sessions entry; chevron at bottom-right toggles a labels↔icons rail and flips » / « to match state.

---

## `DashboardLayout.jsx` (edit)

- Owns `collapsed` state, initialized from `localStorage["f1-sidebar-collapsed"]` (default `false`), persisted on change. (FR-012)
- Passes `collapsed` + `onToggleCollapse` to `Sidebar`.

**Acceptance**: collapse choice survives reload.

---

## `TelemetryPage.jsx` (edit)

- Calls `useStints({ session_key: sessionKey }, { enabled: Boolean(sessionKey) })`.
- Adds `lap_number` + resolved `compound` into the driver meta (either by extending `useTelemetryComparison` or mapping in the page).
- Resolves `circuitName` from `meetings` + `meetingKey`; passes to `TrackMap`.
- Assembles the `LapSummaryReport` and passes a download handler to `TelemetryCharts`.

**Acceptance**: tyre + circuit + report data flow to children without raw `fetch` and without new uncached requests.
