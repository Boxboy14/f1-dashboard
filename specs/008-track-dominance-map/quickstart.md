# Quickstart: Track Dominance Map — Verification Scenarios

Manual browser verification. Run after implementation. `npm run dev`, open **Telemetry**.

---

## Scenario 1 — Outline renders for the selected lap (US1 · SC-002)

1. Select season, event (e.g. 2025 Dutch GP), session (Race), one driver.
2. **Expect**: below the driver summary, a recognisable, **undistorted** outline of Zandvoort appears (corners look like corners, not ellipses).
3. Switch the event → the map updates to the new circuit's shape.

✅ Pass: correct, proportioned outline that tracks the selection.

---

## Scenario 2 — Two-driver dominance (US2 · SC-001/004)

1. Add a second driver.
2. **Expect**: the track is colored along its length in the two driver colors (cyan / orange), split into ~24 minisectors; a legend names each driver.
3. Cross-check one region against the Speed chart: a stretch colored for driver A is one where A's speed trace is higher.

✅ Pass: two-color dominance map, legend present, consistent with the speed chart.

---

## Scenario 3 — Colors match the rest of the page (SC-003)

1. With two drivers, compare the map colors to the chart legend and the driver summary name colors.
2. **Expect**: driver A is the same color in all three places; likewise B.

✅ Pass: one driver = one color everywhere.

---

## Scenario 4 — Single-driver speed map (US3)

1. Remove one driver (leave one).
2. **Expect**: the map switches to a speed-shaded outline — fast straights bright, slow corners dim.
3. Re-add a second driver → switches back to dominance coloring.

✅ Pass: solo speed map; reverts to dominance with two drivers.

---

## Scenario 5 — Aspect ratio + responsive (user constraint)

1. With the map shown, resize the browser narrow → wide (or use device toolbar for mobile).
2. **Expect**: the map scales with the container width, never stretches/squashes (proportions constant), the line stays a consistent thickness, and it stays within the viewport width (no horizontal scroll).

✅ Pass: responsive and aspect-ratio-preserving at all widths.

---

## Scenario 6 — Lap / selection changes (SC-005)

1. Change the **Lap** selector (Fastest → a specific lap).
2. **Expect**: the dominance coloring recomputes for that lap; no stale coloring from the previous lap.
3. Change the **drivers** → map recomputes.

✅ Pass: map stays in step with the selection.

---

## Scenario 7 — Edge: no position data

1. Select a lap/session with no position trace (or simulate empty `/location`).
2. **Expect**: "Track map unavailable" message, not a broken/empty SVG.

✅ Pass: graceful unavailable state.

---

## Build / rate-limit sanity

- `npm run build` clean; no console warnings.
- **Network tab**: selecting drivers adds **one** ranged `/location` request (~277 rows) for the outline driver — not whole-session position data. Reload paints from persisted cache.
