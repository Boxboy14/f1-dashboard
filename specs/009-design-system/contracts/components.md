# Contracts: App Design System

The interfaces each unit exposes. Tokens are the cross-cutting contract everything reads.

---

## Global tokens (`src/index.css`)

- **Font**: `--font-family-primary: "Roboto", -apple-system, "Segoe UI", sans-serif`.
- **Type scale**: `--fs-page`, `--fs-section`, `--fs-subsection`, `--fs-body`, `--fs-caption` (+ matching weights/line-heights) per data-model.
- **Colors**: the `--color-*` set defined under `:root` (dark) and `:root[data-theme="light"]` (light overrides), including `--color-accent` (red).
- **Contract**: components MUST read these tokens; no raw hex or ad-hoc `font-size` in component SCSS.

## Salt bridge (`src/salt-overrides.css`)

- Keep `--salt-text-fontFamily: var(--font-family-primary)`.
- **Add**: override Salt heading-size tokens to the scale (`--salt-text-h1-fontSize: var(--fs-page)`, h2 → section, h3 → subsection).
- **Add**: map Salt accent/CTA/focus tokens → `var(--color-accent)` so red shows on interactive/active states only.
- These overrides live under `.salt-theme` (and may vary by `[data-theme]` where a token differs per mode).

## `index.html`

Add to `<head>`: the two `preconnect` links + the Roboto stylesheet `<link>` (exactly as the user provided).

---

## `ThemeProvider` (`src/theme/ThemeProvider.jsx`)

**Props**: `{ children }`
**Behavior**:
- State `theme` initialized from `localStorage["f1-theme"]`, default `"dark"`.
- On mount + on change: set `document.documentElement.dataset.theme = theme` and write `localStorage`.
- Renders `<SaltProvider mode={theme} applyClassesTo="root">{children}</SaltProvider>`.
- Provides `{ theme, setTheme, toggleTheme }` via context.

**Contract**: must wrap the whole app (replaces the static `SaltProvider` in `main.jsx`). Reading `localStorage` before first paint avoids a theme flash.

## `useTheme()` (`src/theme/useTheme.js`)

**Returns**: `{ theme: "dark"|"light", setTheme: (t)=>void, toggleTheme: ()=>void }` from the provider context.

## `ThemeToggle` (`src/theme/ThemeToggle.jsx`)

**Props**: none (uses `useTheme()`).
**Renders**: a Salt control in the navbar (e.g. `Switch` or an icon `Button` with sun/moon) that calls `toggleTheme()`; reflects the current theme; labelled for accessibility.

## `chartColors(theme)` (`src/theme/chartColors.js`)

**Input**: `"dark"|"light"`
**Returns**: `{ axis, grid, tooltipBg, label, surface, trackBase }` (per data-model). Pure function, no React.

---

## Wiring changes

- **`src/main.jsx`**: wrap `<App/>` in `<ThemeProvider>` (which now provides `SaltProvider`); remove the static `SaltProvider mode="dark"`.
- **`Navbar.jsx`**: render `<ThemeToggle/>`.
- **`DataGrid.jsx`**: `const { theme } = useTheme();` → build `themeQuartz.withParams(themeParams(theme))` (dark params today + a light set) instead of the hard-coded dark params.
- **`TelemetryChart.jsx`** / **`TrackMap.jsx`**: replace hard-coded `#…` axis/grid/tooltip/surface colors with `chartColors(useTheme().theme)`.
- **SCSS sweep**: components with literal hex (`#1a1a1a`, `#15151e`, `#888`, etc.) or raw `font-size` switch to the `--color-*` / type-scale tokens.

## Governance

- **`.specify/memory/constitution.md`**: amend Article VI to allow user-switchable dark/light (Salt-first retained).

---

## Acceptance contract (maps to spec)

- One font everywhere (FR-001), categorized headers with a fixed page tier (FR-002/003), all headings on-scale (FR-004), shared color scheme with sparing red (FR-005/006), navbar toggle (FR-007) that re-themes the whole app incl. charts/grid/track-map (FR-008/010), persisted + default dark (FR-009), visual-only (FR-012).
