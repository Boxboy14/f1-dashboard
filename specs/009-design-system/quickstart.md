# Quickstart: App Design System — Verification Scenarios

Manual browser verification. Run after implementation. `npm run dev`.

---

## Scenario 1 — One font everywhere (US1 · SC-001/007)

1. Visit each tab (Overview, Drivers, Teams, Calendar, a Session, Telemetry).
2. Inspect headings and body text (DevTools → computed `font-family`).
3. **Expect**: every element resolves to **Roboto** (no Inter, no stray fonts). On Telemetry specifically, the driver-card name and the track-dominance heading share the same font + size tier.

✅ Pass: single font app-wide; the old telemetry inconsistency is gone.

---

## Scenario 2 — Header hierarchy (US1 · SC-002)

1. Compare the page title across tabs (e.g. "Overview", "Telemetry").
2. **Expect**: identical page-header size on every tab; section and card/sub headers are consistently smaller, in one hierarchy (page > section > sub).

✅ Pass: categorized, consistent headers.

---

## Scenario 3 — Restrained red + neutral (US2 · SC-003)

1. Scan each page.
2. **Expect**: predominantly neutral surfaces/text; red appears only as a few accents (active nav item, primary buttons, focus ring) — not on large areas.

✅ Pass: minimal, red used sparingly.

---

## Scenario 4 — Theme switch flips the whole app (US3 · SC-004)

1. Click the theme toggle in the navbar.
2. **Expect**: within ~1s the entire app flips light↔dark — backgrounds, text, cards, dropdowns, **the data grids, the telemetry charts, and the track map** all re-theme with readable contrast.

✅ Pass: complete, fast theme switch including visualizations.

---

## Scenario 5 — Persistence + default (US3 · SC-005)

1. Set light mode, reload the page.
2. **Expect**: still light after reload.
3. Clear the stored preference (or use a fresh profile) and load.
4. **Expect**: defaults to dark.

✅ Pass: persisted; defaults to dark.

---

## Scenario 6 — Readability in both themes (US3 · SC-006)

1. In **light** mode, open Telemetry with two drivers + the track map.
2. **Expect**: chart axes/labels and the track outline are clearly legible on the light background (no light-on-light); the two driver colors are still distinguishable.
3. Repeat in dark.

✅ Pass: both themes readable, including charts/map.

---

## Scenario 7 — Edge: font load failure

1. Block the Google Fonts domain (DevTools request blocking) and reload.
2. **Expect**: text falls back to a system sans-serif; the type scale and layout still hold (no broken/oversized text).

✅ Pass: graceful font fallback.

---

## Build / behavior sanity

- `npm run build` clean; no console warnings.
- No data or behavior change — every page works exactly as before, only the look differs.
- The `<html>` element carries `data-theme="dark"|"light"` matching the toggle.
