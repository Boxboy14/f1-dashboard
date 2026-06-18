---
description: "Task list for App Design System — Typography, Color Scheme & Theme Switch"
---

# Tasks: App Design System — Typography, Color Scheme & Theme Switch

**Input**: Design documents from `specs/009-design-system/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/components.md ✅ · quickstart.md ✅

**Tests**: None requested — project convention is manual browser verification (quickstart.md). Implementation tasks only.

**Cross-cutting directive (user)**: **Use Salt color variables — no raw hex anywhere.** Every hex in the app is replaced with a Salt token: semantic tokens for surfaces/text/borders, Salt palette tokens (`--salt-color-…`) for the red accent and data-series colors. This also means we lean on `SaltProvider mode` for dark/light (Salt's tokens already flip) instead of maintaining our own per-theme hex blocks — a simplification of data-model's custom-token table.

**Organization**: Grouped by user story (US1 typography → US2 color scheme/no-hex → US3 theme switch).

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Parallelizable (different files, no dependency on incomplete tasks)
- **[US1]** typography (P1) · **[US2]** color scheme (P2) · **[US3]** theme switch (P3)

---

## Phase 1: Setup

No project-level setup. No new dependencies — Salt already ships the themed token set used throughout.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The design tokens + theme engine the whole app reads. Must complete before the stories.

- [X] T001 [P] In `index.html`, add to `<head>` the two `preconnect` links and the Roboto stylesheet `<link>` (exactly as the user provided)
- [X] T002 In `src/index.css`, set `--font-family-primary` to `"Roboto", -apple-system, "Segoe UI", sans-serif` and remove the Inter `@import`; add the type-scale tokens (`--fs-page` 1.75rem/700, `--fs-section` 1.375rem/600, `--fs-subsection` 1.125rem/600, `--fs-body` 0.9375rem/400, `--fs-caption` 0.75rem/500); **redefine the `--color-*` tokens as aliases to Salt semantic tokens (no hex)** — e.g. `--color-bg-primary: var(--salt-container-primary-background)`, `--color-text-primary: var(--salt-content-primary-foreground)`, `--color-border: var(--salt-separable-secondary-borderColor)`; add `--color-accent: var(--salt-color-red-500)`; route global `body`/`:root` background+text through these
- [X] T003 [P] In `src/salt-overrides.css`, override Salt heading-size tokens to the scale (`--salt-text-h1-fontSize: var(--fs-page)`, h2 → `--fs-section`, h3 → `--fs-subsection`) and map Salt's accent/CTA/focus tokens to `var(--salt-color-red-500)` so red appears only on interactive/active states
- [X] T004 Create `src/theme/ThemeProvider.jsx` + `src/theme/useTheme.js` — context holding `theme` ("dark"/"light") initialized from `localStorage["f1-theme"]` (default "dark"), persisted on change, also setting `document.documentElement.dataset.theme`; renders `<SaltProvider mode={theme} applyClassesTo="root">`; `useTheme()` returns `{ theme, setTheme, toggleTheme }`
- [X] T005 In `src/main.jsx`, wrap `<App/>` in `<ThemeProvider>` (which now supplies `SaltProvider`) and remove the static `<SaltProvider mode="dark">` — depends on T004

**Checkpoint**: App renders (still dark by default) on Roboto, with the type-scale and Salt-aliased color tokens available and the theme engine in place.

---

## Phase 3: User Story 1 — Consistent typography (Priority: P1) 🎯 MVP

**Goal**: One font and one header hierarchy everywhere; the telemetry driver-name vs track-dominance inconsistency is gone.

**Independent Test**: Every tab uses Roboto; page headers share one size, sub-headers consistently smaller; on Telemetry the driver name and track-dominance heading share font + tier.

- [X] T006 [US1] Normalize **page headers** — make each tab's title use the page tier (`<Text styleAs="h1">`) across `OverviewPage`, `TeamsPage`, `SeasonsPage`, `MeetingPage`, `SessionDetailPage`, `TelemetryPage`, `HomePage`/Drivers (today they use `styleAs="h2"`); section headings use `h2`, card/chart/map headings `h3`
- [X] T007 [US1] Sweep component SCSS/JSX to remove ad-hoc `font-size` and map to the scale tokens — `tabs/overview/GrandPrixCard.module.scss` (`.name`), `tabs/telemetry/DriverSummary.module.scss` (`.name`), `tabs/telemetry/TrackMap.jsx`/`TelemetryCharts` headings, and any other literal `font-size` — so all headings sit on `--fs-*`; verify the telemetry driver name and track-dominance heading now match (SC-007)

**Checkpoint**: Typography is uniform app-wide.

---

## Phase 4: User Story 2 — Restrained color scheme, Salt variables only (Priority: P2)

**Goal**: A neutral palette with sparing red, sourced entirely from Salt tokens — **all static hex replaced** in SCSS and data-series/status constants.

**Independent Test**: No raw hex remains in component SCSS or the status/podium/driver-color constants (chart/grid/map handled in US3); red appears only as sparse accents; page reads neutral.

- [X] T008 [US2] Replace hex with Salt tokens in component SCSS — `tabs/telemetry/DriverSummary.module.scss` (photo `background: #15151e` → a Salt surface token e.g. `var(--salt-container-secondary-background)`), `dashboard/Sidebar/Sidebar.module.scss`, `tabs/overview/GrandPrixCard.module.scss` — use semantic surface/border/text tokens
- [X] T009 [US2] Replace hex in data-series/status constants with Salt **palette** tokens — `utils/cellRenderers/statusStyles.js` (`Upcoming: "#22c55e"` → `var(--salt-color-green-500)`), `tabs/overview/GrandPrixCard.jsx` `PODIUM_COLOR` (gold/silver/bronze → nearest Salt palette: `--salt-color-yellow-500`/`--salt-color-gray-300`/`--salt-color-orange-700`); these are inline-style usages where `var(--salt-…)` resolves directly

**Checkpoint**: Static hex is gone outside the chart/grid/map; red is sparing; palette is Salt-sourced.

---

## Phase 5: User Story 3 — Dark/light theme switch (Priority: P3)

**Goal**: A navbar toggle flips the whole app — including charts, grids, and the track map — with persistence; this also completes the no-hex sweep for the visualization components (which need runtime resolution of Salt vars).

**Independent Test**: Toggle in the navbar flips light↔dark across every tab and all visualizations with readable contrast; choice persists on reload; first visit defaults to dark.

- [X] T010 [US3] Create `src/theme/ThemeToggle.jsx` (uses `useTheme()`, a Salt `Switch`/icon `Button` calling `toggleTheme()`, accessible label) and render it in `src/components/dashboard/Navbar/Navbar.jsx`
- [X] T011 [US3] Create `src/theme/chartColors.js` — a `cssVar(name)` reader (`getComputedStyle(document.documentElement).getPropertyValue`) and `chartColors(theme)` returning **Salt-token-resolved** strings (`axis`, `grid`, `tooltipBg`, `label`, `surface`) plus resolved `DRIVER_COLORS` from Salt palette tokens (e.g. `--salt-color-teal-500`/`--salt-color-orange-500`) — for SVG/canvas/grid APIs that don't resolve `var()`; replace the hex `DRIVER_COLORS` in `tabs/telemetry/channels.js` accordingly
- [X] T012 [US3] Make `src/components/DataGrid.jsx` theme-aware — `const { theme } = useTheme()`; build `themeQuartz.withParams(...)` from `chartColors`/Salt tokens per mode, removing its hard-coded dark hex params
- [X] T013 [US3] Make `src/components/tabs/telemetry/TelemetryChart.jsx` and `TrackMap.jsx` theme-aware — read axis/grid/tooltip/label/surface and driver colors from `chartColors(useTheme().theme)`, removing their hard-coded `#…`; track-map fallback/neutral colors from the theme too — depends on T011
- [X] T014 [US3] Verify the whole app flips and persists — toggling re-themes every tab + all visualizations; the choice survives reload; default is dark (FR-008/009)

**Checkpoint**: Full dark/light switch; visualizations themed; no hex remains anywhere.

> **Implementation note (US3)**: The planned `chartColors(theme)` resolver was simplified. Since CSS contexts (ag-grid params, inline `style`, Recharts tooltip/label) *do* resolve `var(--salt-…)` and auto-flip with `SaltProvider mode`, only Recharts `stroke` *attributes* (axis/grid/lines) needed help. So: DataGrid passes `var()` strings to `themeQuartz.withParams` (auto-themes); Recharts axis/grid/ticks are themed via global CSS in `index.css`; tooltip/label use inline `var()`; the track map uses inline-`style` `var()`; and only the driver **line** strokes use a tiny `src/theme/cssColor.js` `getComputedStyle` resolver (driver colors are theme-independent, so no per-theme rebuild). `ThemeProvider` also sets `color-scheme` so the grid's `inherit` scheme + native controls follow the theme.

---

## Phase 6: Polish & Verification

- [X] T015 [P] Amend `.specify/memory/constitution.md` Article VI — replace "the dark theme … is fixed — no light mode support in v1" with user-switchable dark/light (Salt DS remains first choice); bump the "Last Amended" date and add a rationale note
- [X] T016 [P] Update root `plan.md` — note the design system (Roboto, type scale, Salt-token color scheme, dark/light switch) under the relevant section/snapshot
- [X] T017 Run `npm run build` + lint, and `grep -rE "#[0-9a-fA-F]{3,8}" src` to confirm **no raw hex remains** (only Salt `var(--salt-…)` references) — fix any stragglers — ✅ build passes, hex count = 0, lint clean (added `argsIgnorePattern: '^[A-Z_]'` to `eslint.config.js`, matching the existing `varsIgnorePattern`, to fix a pre-existing JSX-component-as-destructured-arg false positive in `Sidebar.jsx`)
- [ ] T018 Execute the 7 scenarios in `specs/009-design-system/quickstart.md` (one font, header hierarchy, sparing red, full theme flip incl. charts/grid/map, persistence + default, both-theme readability, font-load fallback) — **manual browser check, pending user**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: T001/T002/T003 parallel; T004 then T005. Blocks all stories.
- **US1 (Phase 3)**: needs the scale tokens (T002/T003).
- **US2 (Phase 4)**: needs the Salt-aliased tokens (T002); independent of US1.
- **US3 (Phase 5)**: needs the theme engine (T004/T005) + `chartColors` (T011) for the visualization tasks.
- **Polish**: after the stories you ship.

### Task-Level Dependencies

- T005 ← T004 · T011 ← (engine) · T012 ← T011 · T013 ← T011 · T014 ← T010,T012,T013
- **Same-file note**: `index.css` (T002), `salt-overrides.css` (T003) are distinct. `channels.js` is touched by T011. `GrandPrixCard` SCSS (T007 font, T008 color) and `DriverSummary` SCSS (T007 font, T008 color) — do the font sweep (US1) before the color sweep (US2) on those files.

### Parallel Opportunities

```text
# Phase 2 — different files
T001 index.html
T002 index.css
T003 salt-overrides.css

# Phase 4 (US2) — different files
T008 component SCSS hex → Salt tokens
T009 status/podium/driver constants → Salt palette tokens
```

---

## Implementation Strategy

### MVP First

1. Foundational T001–T005 (Roboto + tokens + theme engine; app still dark).
2. US1 T006–T007 (typography uniform). **Validate** — one font, one header hierarchy, telemetry inconsistency gone.

### Incremental Delivery

1. Foundational → US1 (typography) → validate.
2. US2 (color scheme, static hex → Salt tokens) → validate neutral + sparing red.
3. US3 (theme switch + theme-aware visualizations, completing no-hex) → validate full flip + persistence.
4. Polish: constitution amendment, root plan.md, build + lint + **hex grep = 0**, quickstart.

---

## Notes

- No new dependencies. The color system is **entirely Salt tokens** (semantic + palette); the one red accent is `--salt-color-red-500`, applied via Salt's accent tokens so it stays sparing.
- Dark/light flips via `SaltProvider mode` (Salt's own tokens carry both themes) — we don't maintain custom per-theme hex, which refines/simplifies data-model's token table per the user's "use Salt variables" directive.
- The only place `var(--salt-…)` can't be used directly is SVG/canvas/ag-grid color **values** (attributes/JS don't resolve `var()`), so `chartColors` resolves Salt vars to strings via `getComputedStyle`, re-read on theme change. Inline-style and SCSS usages reference the Salt var directly.
- `DRIVER_COLORS` move to Salt palette tokens but stay theme-independent (one color per driver, readable on both backgrounds, matching legend/summary/charts).
- Commit after each task or logical group.
