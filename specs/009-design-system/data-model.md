# Data Model: App Design System

The "entities" here are design tokens and theme state — the named, reusable values the whole app reads. Concrete numbers are proposals (tunable in implementation).

---

## Type scale (tokens in `index.css`, mapped to Salt headings)

| Tier | Token | Size | Weight | Line-height | Salt mapping |
|---|---|---|---|---|---|
| Page header | `--fs-page` | 1.75rem | 700 | 1.2 | `styleAs="h1"` (override `--salt-text-h1-fontSize`) |
| Section header | `--fs-section` | 1.375rem | 600 | 1.25 | `styleAs="h2"` |
| Sub/card header | `--fs-subsection` | 1.125rem | 600 | 1.3 | `styleAs="h3"` |
| Body | `--fs-body` | 0.9375rem | 400 | 1.5 | default `Text` |
| Caption/label | `--fs-caption` | 0.75rem | 500 | 1.4 | `styleAs="label"` |

- `--font-family-primary` → `"Roboto", -apple-system, "Segoe UI", sans-serif`.
- The existing `--font-size-*`/`--font-weight-*` tokens remain; the tiers above are the **named, semantic** layer components reference (no more raw `font-size: 19px` in component SCSS).

**Rule**: every heading in the app maps to exactly one tier. Page titles use the page tier; sections the section tier; card/chart/map titles the sub tier.

---

## Color tokens (semantic, per theme)

Defined in `index.css` as `:root` (dark default) + `:root[data-theme="light"]` overrides. Values are proposals.

| Token | Role | Dark | Light |
|---|---|---|---|
| `--color-bg-primary` | app background | `#141414` | `#f5f5f6` |
| `--color-bg-secondary` | raised surface (cards) | `#1d1d1f` | `#ffffff` |
| `--color-bg-tertiary` | inset / hover | `#2a2a2c` | `#ececee` |
| `--color-text-primary` | primary text | `rgba(255,255,255,.95)` | `#1a1a1d` |
| `--color-text-secondary` | secondary text | `rgba(255,255,255,.66)` | `#5a5a60` |
| `--color-border` | separators | `rgba(255,255,255,.12)` | `rgba(0,0,0,.12)` |
| `--color-accent` | **the red** (sparing) | `#e8313b` | `#d10a18` |
| `--color-accent-contrast` | text on accent | `#ffffff` | `#ffffff` |

**Rules**:
- `--color-accent` is the **only** chromatic token; everything else is neutral.
- It is mapped (in `salt-overrides.css`) onto Salt's accent/CTA/focus tokens, so red shows only on interactive/active elements (active nav, primary buttons, focus ring) — never on large surfaces (FR-006).

---

## Chart/visualization colors (`chartColors(theme)`)

A JS helper (not CSS) for the canvas/SVG/grid APIs that need plain strings:

| Field | Role | Dark | Light |
|---|---|---|---|
| `axis` | chart axis lines/ticks | `#8b8f97` | `#6b7280` |
| `grid` | chart gridlines | `#2a2a2a` | `#e3e3e6` |
| `tooltipBg` | tooltip background | `#1a1a1a` | `#ffffff` |
| `label` | axis/heading label | `#cbd5e1` | `#374151` |
| `surface` | neutral fill (e.g. photo bg) | `#15151e` | `#e9e9ec` |
| `trackBase` | track-map outline fallback | `#888888` | `#9aa0a6` |

`DRIVER_COLORS = ["#3FC1C9", "#FB8C00"]` — **unchanged**; identifies the two drivers consistently and reads on both themes.

---

## Theme state

| Field | Type | Notes |
|---|---|---|
| `theme` | `"dark" \| "light"` | The active theme |
| (storage) | `localStorage["f1-theme"]` | Persisted preference; default `"dark"` when absent |

**Applied as**:
- `document.documentElement.dataset.theme = theme` → drives our `[data-theme]` token overrides.
- `SaltProvider mode={theme}` → drives all Salt components.

**Transitions**: `dark ↔ light` via `toggleTheme()`; persisted on every change; restored before first render (no flash).
