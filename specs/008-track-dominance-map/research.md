# Research: Track Dominance Map

Phase 0 decisions. The data feasibility (`/location` shape + ranged fetch, the shared 400-point grid) was already proven during the 007 work, so these focus on the new rendering + geometry.

---

## Decision 1 — Custom SVG for the outline (not Salt, not Recharts)

**Decision**: Render the track as a hand-rolled `<svg>` of `<polyline>` segments.

**Rationale**: There is no Salt component and no Recharts chart type that draws an arbitrary closed circuit outline colored per-segment. plan.md has always specified "custom SVG" for the track map. SVG is the right primitive — vector, crisp at any scale, and segment coloring is just multiple `<polyline>`s.

**What stays Salt**: the section heading, the driver legend chips, loading/empty states, and layout — only the outline itself is custom. (Constitution VI: Salt-first, custom only where Salt has no equivalent.)

**Alternatives considered**: Canvas — rejected: harder to make crisp/responsive and to attach a legend; SVG scales for free. A charting lib — none model a track outline.

---

## Decision 2 — Responsive + aspect-ratio preservation via `viewBox` + `preserveAspectRatio`

**Decision**: Set the SVG `viewBox` to the track's bounding box (plus padding) and render `<svg viewBox=… preserveAspectRatio="xMidYMid meet" width="100%">` inside a max-width wrapper.

**Rationale**: This is exactly the user's constraint. The `viewBox` defines an internal coordinate space matching the track's real extents; `width="100%"` makes the SVG fill its container (responsive); `preserveAspectRatio="xMidYMid meet"` scales the drawing uniformly to fit while **keeping proportions** (a corner stays a corner) and centering it. The rendered height follows from the viewBox aspect ratio — no manual height math, no distortion at any screen size.

**Supporting details**:
- `vectorEffect="non-scaling-stroke"` on the polylines keeps the line a constant **pixel** thickness regardless of the scale factor, so the track looks the same weight on phone and desktop.
- A wrapper `max-width` caps it on very wide screens; it shrinks freely on small ones.

**Alternatives considered**: Manually scaling points to a fixed pixel box on resize (via a ResizeObserver) — rejected: reinvents what `viewBox` does natively and risks distortion bugs.

---

## Decision 3 — Outline from one driver's lap position trace, aligned to the shared grid

**Decision**: Fetch the **outline driver's** (slot A, else B) `/location` for the selected lap, derive cumulative arc-length distance from consecutive `(x,y)`, and resample `(x,y)` onto the **same 400-point grid** that `chartData` already uses.

**Rationale**: Because `chartData[i]` is already the same lap-fraction for both drivers (carrying `speed_a`/`speed_b`), resampling the track `(x,y)` onto that identical grid makes `points[i]` correspond to `speed_a[i]`/`speed_b[i]` **by index** — the dominance lookup is then trivial and perfectly aligned, with zero extra alignment code.

**Why arc-length (not speed-integration) for the track**: the location stream already *is* spatial; cumulative straight-line distance between consecutive points is the natural, robust distance measure for resampling a path. (car_data, which has no positions, still uses speed-integration — different stream, different right tool.)

**Volume**: one ranged `/location` fetch (~277 rows) for the outline driver only; the other driver contributes only speed (already fetched). Cheap, cached, persisted.

---

## Decision 4 — Dominance = faster average speed over ~24 equal-length minisectors

**Decision**: Split the lap (the 400-point grid) into `MINISECTORS = 24` contiguous equal-index ranges; for each, sum `speed_a` vs `speed_b`; the higher sum wins and its driver's slot colors every point in that range.

**Rationale**: Equal index ranges on the normalized grid ≈ equal distance, so higher average speed through a minisector = less time through it = "faster there." 24 is enough to localize dominance to corners/straights without the color flickering point-to-point where speeds momentarily cross. The result is a per-point `faster` array, smoothed by minisector, so the component draws ~24 clean single-color polylines.

**Alternatives considered**: per-point coloring (granular) — rejected by the user as too noisy. Per-minisector *time* via integrating dt — equivalent to average speed on equal-distance segments but more fiddly; the speed-sum is simpler and identical in outcome.

---

## Decision 5 — Single-driver mode: speed-tinted outline

**Decision**: With one driver, color each outline segment from a single-hue brightness ramp keyed by that driver's speed at that point, normalized 0..1 across the lap (bright = fast, dim = slow).

**Rationale**: The user chose this over a plain outline or hiding the map. It keeps the map meaningful solo (you can read where the car is quick/slow) and naturally flips to dominance when a second driver is added.

---

## Decision 6 — Reuse the telemetry driver palette; flip Y

**Decision**: Color drivers with the existing `DRIVER_COLORS` (cyan A / orange B) used by the charts and summary. Flip the Y axis when mapping to SVG.

**Rationale**: A driver must be one color everywhere (charts, summary, map) — that's the whole point of a consistent comparison. Y-flip: SVG's y grows downward while the position data's y grows upward, so without flipping the circuit would render vertically mirrored. Flipping keeps the shape correctly oriented. (Absolute rotation may still differ from the broadcast map's orientation — out of scope; proportions, the spec's actual requirement, are preserved.)

---

## Resolved unknowns

| Unknown | Resolution |
|---|---|
| Track shape source | One driver's `/location` lap trace (racing line ≈ circuit), single-source OpenF1 |
| Responsiveness + aspect ratio | SVG `viewBox` + `preserveAspectRatio="xMidYMid meet"`, `width:100%`, non-scaling stroke |
| Two-lap alignment for dominance | Resample track `(x,y)` onto the existing 400-pt shared grid → index-aligned with `speed_a/_b` |
| Minisector count | 24 (tunable constant) |
| Single-driver behavior | Speed-tinted outline |
| Extra data cost | One ranged `/location` fetch (~277 rows), rate-limited + persisted |
| New dependencies | None |
