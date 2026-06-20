# Quickstart: Telemetry & UI Enhancements — Manual Verification

Run `npm run dev`, open the app, and walk these scenarios. Each maps to a user story / acceptance criteria. (Project convention: manual browser verification, no automated tests.)

**Setup**: Navigate to Telemetry. Select an Event, Session, and two Drivers who both set a timed lap (e.g. a Race session). Leave Lap on "Fastest lap".

---

## US1 — Downloadable lap summary (P1)

1. Confirm the chart-stack header (the row with "Fastest lap" + the two driver swatches) shows **one** download button at its **far right** — and there is **no** download button on any individual chart.
2. Click it. A PDF downloads.
3. Open the PDF. Confirm it contains:
   - A title with the **GP name** and the lap label.
   - For **each** selected driver: a block `Driver#{number} {name} — {lap}` and the tyre compound.
   - For **each** channel (Speed, Throttle, Brake, Gear, RPM, DRS): a bullet + a readable plain-language paragraph.
4. Change the Lap dropdown to a specific lap, download again — the report reflects the new lap.
5. **Edge**: select one driver who did **not** set a lap (if available) → the PDF states "No lap data available for this driver" rather than failing or omitting them.
6. Select only **one** driver → report still generates with that driver's blocks.

## US2 — Driver card tyre detail (P2)

1. With drivers selected, look at each driver summary card → it shows the **tyre compound** for the displayed lap (e.g. "Tyre: Soft") alongside Fastest lap / Top speed.
2. **Edge**: pick a session/lap with no covering stint data (e.g. a practice session) → the card shows "Tyre data unavailable", not a blank or broken layout.

## US3 — Track map circuit name + start/finish marker (P2)

1. With a track map rendered, confirm the **circuit name** appears as a caption **beneath** the map.
2. Confirm a **checkered-flag start/finish logo** is visible at the outline gap.
3. Switch between a 2-driver selection (dominance view) and a 1-driver selection (speed view) → the marker and caption appear in **both**.

## US4 — Sidebar collapse toggle (P2)

1. At desktop width, find the **double-chevron** control at the **bottom-right** of the sidebar; in the open state it shows **»**.
2. Click it → sidebar collapses to an **icon-only rail**, labels hidden, and the chevron flips to **«**.
3. Click again → sidebar re-expands, chevron back to **»**.
4. Collapse it, then **reload** the page → it reopens **collapsed** (state persisted). Re-expand and reload → reopens expanded.
5. Shrink to mobile width → the sidebar behaves as the existing hamburger drawer; the chevron control is not shown.

## US5 — Track map layout & readability (P3)

1. The track map is **horizontally centered** in its panel.
2. The track **outline is visibly thicker** than before.
3. The "Speed map" / "Track dominance" caption above the map is **comfortably sized** (h3 scale), not tiny.

## US6 — Chart legibility (P3)

1. Each telemetry chart is **taller** (≥350px) — the stack feels less cramped.
2. There is **clear separation** (≥15px) between adjacent charts.
3. The **Y-axis label** text is **visibly larger** than before.

## US7 — Remove Sessions sidebar entry (P3)

1. Open the sidebar → there is **no "Sessions" entry** (it was previously greyed-out/disabled).
2. Confirm Calendar → meeting → session navigation still works (the `/sessions/:key` route is unaffected).

---

## Regression sweep

- Theme toggle still flips dark/light across the page, including the new download button, tyre row, track caption, and collapsed sidebar.
- No raw hex introduced: `grep -rnE "#[0-9a-fA-F]{3,8}\b" src --include=*.jsx --include=*.js --include=*.scss --include=*.css` → only Salt `var(--salt-…)` refs.
- `npm run build` passes; `npx eslint src` clean.
