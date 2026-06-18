# Research: App Design System

Phase 0 decisions. Grounded in the current setup: `index.css` already has a `--color-*`/`--font-*` token system (dark-only), `salt-overrides.css` bridges Salt's font tokens to ours, and `SaltProvider mode="dark"` is hard-pinned in `main.jsx`.

---

## Decision 1 — Theming via `SaltProvider mode` + our own `[data-theme]` tokens (one red accent)

**Decision**: Drive theming from two coupled switches — `SaltProvider mode={theme}` (themes every Salt component) and `<html data-theme={theme}>` (themes our custom `--color-*` tokens). Define a single red **`--color-accent`** and map Salt's accent/CTA tokens onto it.

**Rationale**: Salt ships a complete, accessible light/dark token set; flipping `mode` re-themes all Salt UI for free. Our custom bits (global bg/text, cards, charts) ride our own tokens. Coupling the two switches keeps them from disagreeing. One accent token means red lives in exactly one place and stays sparing.

**Alternatives considered**: *Roll our own theme system entirely* — rejected: we'd reimplement what Salt already provides and fight its components. *Only our tokens, ignore Salt mode* — rejected: Salt components (Dropdown, Card, Dialog, FormField) would stay dark in light mode.

---

## Decision 2 — Roboto via `index.html` `<link>` (preconnect)

**Decision**: Load Roboto with the user-provided `<link rel="preconnect">` + stylesheet `<link>` in `index.html`; set `--font-family-primary` to Roboto with a system-sans fallback; remove the old Inter `@import` from `index.css`.

**Rationale**: The user specified Roboto and the exact links. `<link>` with `preconnect` in the document head is faster and less render-blocking than a CSS `@import`. The existing Salt font bridge (`--salt-text-fontFamily: var(--font-family-primary)`) already routes Salt text through this var, so one change re-fonts Salt + custom text together.

**Fallback**: `"Roboto", -apple-system, "Segoe UI", sans-serif` — if Roboto fails to load, text stays readable on the type scale (FR edge case).

---

## Decision 3 — Categorized type scale, mapped onto Salt heading levels

**Decision**: Define a fixed scale and override Salt's heading-size tokens so `<Text styleAs="…">` produces consistent sizes everywhere; then sweep components that hard-code `font-size` to use the scale.

| Tier | Use | Size | Weight |
|---|---|---|---|
| Page header | each tab's title | 1.75rem (28px) | 700 |
| Section header | a major section on a page | 1.375rem (22px) | 600 |
| Sub/card header | card titles, chart/map headings, driver name | 1.125rem (18px) | 600 |
| Body | reading text | 0.9375rem (15px) | 400 |
| Caption/label | secondary/small text | 0.75rem (12px) | 500 |

**Rationale**: A small, fixed set with one page-header size and progressively smaller sub-headers is exactly FR-002/FR-003. Mapping to Salt's `H1/H2/H3` (and overriding their token sizes) means the common `<Text styleAs>` usage becomes consistent without a custom heading component. The remaining inconsistency comes from components that hard-code sizes (driver name, track-map/GP-card headings) — those get normalized to the scale, fixing SC-007.

**Mapping**: page header → `h1`; section → `h2`; sub/card → `h3`. Page titles currently use `styleAs="h2"`; they migrate to `h1` (a ~7-file find/replace) so the largest tier is the page title.

**Alternatives considered**: a bespoke `<PageHeader>`/`<SectionHeader>` component set — reasonable, but overriding Salt's existing heading tokens reuses the components already in the app with less churn.

---

## Decision 4 — `ThemeProvider` context + `localStorage`, default dark

**Decision**: A `src/theme/ThemeProvider.jsx` holds `theme`, reads/writes `localStorage` (key `f1-theme`, default `'dark'`), sets `document.documentElement.dataset.theme`, and renders `SaltProvider mode={theme}`. A `useTheme()` hook exposes `{ theme, toggleTheme, setTheme }`.

**Rationale**: The theme must drive `SaltProvider mode`, which wraps the whole app — so a provider that renders `SaltProvider` is the natural owner. `localStorage` gives persistence across reloads/sessions (FR-009) in one line; reading it before first render avoids a flash. Default dark matches today's app.

**Alternatives considered**: *Redux slice* — the constitution permits Redux for cross-navigation UI state, and the app has a store; but theme uniquely needs to wrap `SaltProvider` at the root, which a provider does cleanly, so a dedicated context is simpler. *OS `prefers-color-scheme` auto* — out of scope (manual toggle only) per the spec.

---

## Decision 5 — Theme-aware visualizations (charts, grid, track map)

**Decision**: A `chartColors(theme)` helper returns axis, grid, tooltip-background, label, and neutral-surface colors per mode. `TelemetryChart` and `TrackMap` consume it via `useTheme()`; `DataGrid` rebuilds its `themeQuartz.withParams(...)` per mode. `DRIVER_COLORS` (cyan/orange) stay.

**Rationale**: These components currently hard-code dark values (`#8b8f97`, `#2a2a2a`, `#1a1a1a`, `#15151e`), which would be invisible/ugly in light mode. A small per-mode color map keeps them readable in both (FR-010). The two driver colors read fine on either background and must stay identical to the legend/summary for consistency, so they're not themed.

**Alternatives considered**: reading CSS custom properties at render via `getComputedStyle` — rejected: not reactive to theme changes and awkward for the ag-grid/Recharts JS APIs, which want plain color strings.

---

## Decision 6 — Red used as a single sparing accent

**Decision**: Red appears only via `--color-accent` (mapped onto Salt's accent/primary/CTA + focus tokens): active navigation item, primary buttons, focus rings, and a few key highlights. Surfaces and text stay neutral.

**Rationale**: FR-006/SC-003 — "little glimpses, not too colorful." Centralizing red in one token mapped to interactive states guarantees it stays sparse and consistent; designers change one value to retune it.

---

## Decision 7 — Constitution amendment (Article VI)

**Decision**: Update Article VI from "dark theme is fixed — no light mode support in v1" to "dark and light themes, user-switchable from the navbar; Salt DS remains the first choice."

**Rationale**: The feature is explicitly user-requested and directly contradicts the old rule; the constitution must reflect the new product direction. Salt-first is unchanged.

---

## Resolved unknowns

| Unknown | Resolution |
|---|---|
| How to theme Salt + custom together | `SaltProvider mode` + coupled `<html data-theme>` tokens |
| Font delivery | Roboto via `index.html` preconnect `<link>`; system-sans fallback |
| Header categories + sizes | 5-tier scale mapped to Salt `h1/h2/h3`; page title → `h1` |
| Theme persistence + default | `ThemeProvider` + `localStorage` (`f1-theme`), default dark |
| Charts/grid/SVG in light mode | `chartColors(theme)` helper + per-mode ag-grid theme; driver colors unchanged |
| Governance conflict | Amend Article VI |
| New dependencies | None |
