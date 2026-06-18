# Implementation Plan: App Design System — Typography, Color Scheme & Theme Switch

**Branch**: `009-design-system` | **Date**: 2026-06-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/009-design-system/spec.md`

## Summary

Unify the app's look with one design system: switch the global font to **Roboto**, define a categorized **type scale** (page header → section → sub/card header → body → caption) applied everywhere, define a restrained **red + neutral** color scheme as theme tokens, and add a **dark/light theme switch** in the navbar (persisted, default dark). Both themes use the same scheme; charts, the data grids, and the track map become theme-aware so the whole app flips cleanly.

The app already has the bones: a token system in `src/index.css`, a Salt bridge in `src/salt-overrides.css`, and `SaltProvider` (currently hard-pinned to `mode="dark"`). The work is to (1) tokenize colors per theme, (2) make `SaltProvider mode` + an `<html data-theme>` attribute driven by a persisted `ThemeProvider`, (3) normalize headings to the scale and remove ad-hoc font sizes/hex, and (4) add the navbar toggle.

## Technical Context

**Language/Version**: JavaScript (ES2022), React 19

**Primary Dependencies**: Salt DS `@salt-ds/core`/`@salt-ds/theme` 1.54 (themed token set + `SaltProvider mode`), React Router 7, SCSS Modules, Recharts 3.8 (telemetry charts), ag-grid 35 (grids), Roboto (Google Fonts). No new dependencies.

**Storage**: `localStorage` for the theme preference (client-only UI state). N/A otherwise.

**Testing**: Manual browser verification against `quickstart.md`.

**Target Platform**: Desktop + mobile responsive web; **now both dark and light** (previously dark-only).

**Project Type**: Single-page web app (Vite + React).

**Performance Goals**: Theme toggle flips the whole app < ~1s (SC-004); font loads without a flash that breaks layout.

**Constraints**: Purely visual — no data/behavior/layout-structure change (FR-012). Red used sparingly (FR-006). Both themes readable, including charts + track map (FR-010).

**Scale/Scope**: App-wide. 1 new theme module (provider + hook + toggle + chart-color helper), edits to global CSS/Salt overrides/`index.html`/`main.jsx`/navbar, theme-awareness for the 3 hard-coded-color components (DataGrid, TelemetryChart, TrackMap), and a sweep of component SCSS to drop ad-hoc sizes/hex in favor of tokens.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Article | Gate | Status |
|---|---|---|
| I. Spec-First | spec reviewed before code | ✅ spec.md + passing checklist |
| II. API-First | endpoint shapes verified | ✅ N/A — no data/API change |
| III. Component Isolation | self-contained, own styles | ✅ New `src/theme/` module; theme consumed via a hook; per-component SCSS keeps its styles, now token-driven |
| IV. Data Layer Discipline | data via the data layer | ✅ N/A — no data fetching |
| V. Clean Code | DRY, no dead code | ✅ One token source of truth; removes scattered hard-coded hex/sizes; `--color-*` consolidated per theme |
| VI. UI Consistency | **Salt DS first; dark theme fixed** | ⚠️ **Amends the constitution.** "Dark theme fixed, no light mode in v1" is intentionally superseded — the user now wants a light/dark switch. Salt-first is preserved (theming via `SaltProvider mode` + Salt tokens). Article VI will be updated (see Complexity Tracking). |
| VII. Learning | decisions explainable | ✅ research.md documents the Salt-mode + own-tokens theming model and the type scale |

**Result**: PASS with one **explicit, user-requested constitution amendment** (Article VI light-mode rule). Tracked below.

## Project Structure

### Documentation (this feature)

```text
specs/009-design-system/
├── plan.md          # This file
├── spec.md          # Feature spec
├── research.md      # Phase 0
├── data-model.md    # Phase 1 (type scale + color tokens + theme state)
├── quickstart.md    # Phase 1
├── contracts/
│   └── components.md # Phase 1
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
index.html                                   # MODIFY: Roboto preconnect + stylesheet <link> (per user)
src/
├── index.css                                # MODIFY: font→Roboto; type-scale tokens; split colors into theme blocks; add red accent
├── salt-overrides.css                       # MODIFY: map Salt heading sizes to the scale; map Salt accent → red; per-theme bridges
├── main.jsx                                 # MODIFY: wrap in <ThemeProvider> which renders SaltProvider with the live mode
├── theme/                                   # NEW folder
│   ├── ThemeProvider.jsx                    # NEW: context + localStorage persist; sets <html data-theme>; renders SaltProvider mode
│   ├── useTheme.js                          # NEW: { theme, toggleTheme, setTheme }
│   ├── chartColors.js                       # NEW: theme-aware colors (axis, grid, tooltip, surface, outline) for charts/SVG/grid
│   └── ThemeToggle.jsx                      # NEW: navbar dark/light control (Salt Switch / icon button)
├── components/
│   ├── dashboard/Navbar/Navbar.jsx          # MODIFY: add <ThemeToggle/>
│   ├── DataGrid.jsx                         # MODIFY: build the ag-grid theme from useTheme() per mode
│   └── tabs/telemetry/
│       ├── TelemetryChart.jsx               # MODIFY: axis/grid/tooltip colors from chartColors(theme)
│       └── TrackMap.jsx                     # MODIFY: fallback/neutral colors from theme
└── (sweep) **/*.module.scss                 # MODIFY: replace hard-coded hex (#1a1a1a, #15151e, …) with tokens; drop ad-hoc font-size → scale
.specify/memory/constitution.md              # MODIFY: amend Article VI (light + dark supported)
plan.md (repo root)                          # MODIFY: note the design system / theming
```

**Structure Decision**: A new self-contained `src/theme/` module owns theming (provider, hook, toggle, chart-color map). Global tokens live in the existing `src/index.css` + `src/salt-overrides.css` (one source of truth). Components keep their SCSS but reference tokens instead of literals. This extends the current architecture rather than replacing it.

## Architecture & Approach

### Theming model — Salt mode + our tokens, one red accent

- **`ThemeProvider`** holds `theme` ('dark'|'light'), initialized from `localStorage` (default `'dark'`), persists on change, sets `document.documentElement.dataset.theme`, and renders `SaltProvider mode={theme}` so **all Salt components re-theme for free**.
- **Our own `--color-*` tokens** in `index.css` are split: `:root` (dark defaults) + `:root[data-theme="light"]` overrides. Custom components and the global background/text follow these.
- **Red accent**: one token `--color-accent` (a measured red, slightly different shade per theme for contrast). In `salt-overrides.css`, map Salt's accent/CTA tokens to it so primary buttons/active nav/focus pick up red. Used sparingly (FR-006).
- The `<html data-theme>` attribute + `SaltProvider mode` move together, so Salt tokens and our tokens never disagree.

### Typography — Roboto + a categorized scale

- Roboto loaded via `index.html` `<link>` (preconnect, per the user); `--font-family-primary` → Roboto; the existing Salt font bridge already points Salt text at this var, so Salt + custom text share Roboto.
- Define the scale as tokens and **override Salt's heading sizes** so `<Text styleAs="h1|h2|h3">` is consistent app-wide:
  - **Page header** (each tab title) — fixed, largest, bold.
  - **Section header** — smaller.
  - **Sub/card header** — smaller again.
  - **Body**, **caption** — for content/secondary text.
- Normalize: page titles use one consistent tier; sweep components that hard-code font sizes (e.g. driver-card name, track-map heading, GP-card name) to use the scale — this is what removes the current font/size inconsistency (SC-001/002/007).

### Theme-aware visualizations

- `chartColors(theme)` returns axis, grid, tooltip-bg, label, and neutral-surface colors per mode. `TelemetryChart` and `TrackMap` read it via `useTheme()` instead of the current hard-coded `#8b8f97`/`#2a2a2a`/`#1a1a1a`/`#15151e`.
- `DataGrid` rebuilds its ag-grid `themeQuartz.withParams(...)` from the current mode (dark params today, plus a light param set).
- **`DRIVER_COLORS`** (cyan/orange) are kept — they read on both backgrounds and identify the two drivers consistently.

### Theme state location

A focused **React context** (`ThemeProvider`), not Redux. Theme must drive `SaltProvider mode` which wraps the whole tree, so a provider that renders `SaltProvider` is the natural home; persistence is a one-line `localStorage` read/write. (Redux was considered — the constitution allows it for cross-navigation UI state — but a dedicated provider is simpler and keeps the Salt wiring in one place.)

### Constitution amendment

Article VI's "dark theme fixed — no light mode in v1" is updated to "dark and light themes, user-switchable; Salt DS remains first choice." This is the one governance change, explicitly requested.

## Complexity Tracking

| Violation / Deviation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Amend Article VI (allow light mode) | The user explicitly wants a dark/light switch; the dark-only rule no longer reflects product direction | Keeping dark-only would refuse the requested feature; the amendment is the correct, minimal governance change |
