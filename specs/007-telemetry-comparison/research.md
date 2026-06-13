# Research: Telemetry Comparison

Phase 0 decisions. Feasibility was already de-risked by probing the live OpenF1 API during specification (real 2024 + 2025 sessions), so these decisions build on confirmed data shapes.

---

## Decision 1 — Recharts for the charts (new library walkthrough)

**Decision**: Use **Recharts 3.8** (already installed) for all six telemetry charts.

**What it is**: A declarative React charting library built on SVG — you compose a chart from components (`<LineChart>`, `<Line>`, `<XAxis>`, `<Tooltip>`…) instead of calling an imperative drawing API.

**Why we chose it**: It's the plan.md-sanctioned chart library, already a dependency, and Salt DS has no charting component (so this is the one justified place to step outside Salt). Declarative composition fits the React codebase.

**How it's wired in**: Each chart is `<ResponsiveContainer><LineChart data={chartData} syncId="telemetry">…</LineChart></ResponsiveContainer>`. All six charts share the **same `data` array** and the **same `syncId`**, which is what makes the hover cursor link across them (US3) for free.

**The key concept**: A Recharts `LineChart` is driven by **one row array**; each `<Line dataKey="…">` reads a column from those rows. To overlay two drivers we therefore give every row both drivers' columns (`speed_a`, `speed_b`, …) on a shared x (`distance`). Get the data shape right and the charts are trivial.

**What to watch out for**: (a) Recharts re-renders can be heavy with many points — we keep it to ~400 resampled rows and disable per-point animation. (b) Overlaying two series **requires a common x domain** — hence the resampling step below; you cannot just hand Recharts two raw, differently-sampled laps and expect aligned cursors.

---

## Decision 2 — Fetch only the fastest lap's car_data via a date-range filter

**Decision**: Add a ranged `carDataLap({ session_key, driver_number, date_gte, date_lt })` to the API layer that filters `/car_data` to the fastest lap's time window (~300 rows), instead of the existing `useCarData` (whole session, ~22k rows for a race).

**Rationale**: Whole-session car_data is multi-MB and would bloat the persisted cache; the feature only needs the fastest lap. The probe confirmed `/car_data?...&date>=START&date<END` returns exactly that lap (~257–309 samples).

**Implementation note**: The existing `buildUrl` uses `searchParams.append(key, value)`, which can't express the `date>=` / `date<` operators. So `carDataLap` builds the URL manually with operators percent-encoded (`%3E`, `%3C`) and the timestamp **value `encodeURIComponent`-ed** — critical, because the raw `date_start` ends in `+00:00` and an unencoded `+` would be read as a space. It routes through a new `fetchOpenF1Url(url)` so it still passes through the rate limiter and ok-check.

**Alternatives considered**: *Fetch whole session, slice client-side* — rejected: ~22k rows × 2 drivers fetched to use ~600, and it would blow the localStorage persist budget.

---

## Decision 3 — Derive distance from speed, then resample both laps onto a shared grid

**Decision**: Compute each sample's distance as the cumulative integral of speed over time, then **interpolate both drivers onto one common, normalized distance grid** (≈400 points) before charting.

**Rationale**: The user chose a **distance** x-axis. `/car_data` has no distance field, so it's derived: `distance[i] = distance[i-1] + (speed_kmh[i] / 3.6) · dt_seconds`. Two laps have different durations and sample times, so to overlay them on one x-axis (FR-009, SC-004) each channel is linearly interpolated onto a shared grid. Both laps cover the same physical track, so the grid is normalized to a common length — guaranteeing the same corner lands at the same x for both drivers.

**The algorithm** (pure functions in `utils/telemetry.js`):
- `deriveDistance(samples)` → samples with cumulative `distance`.
- `resampleToGrid(samples, points)` → for a fixed number of evenly-spaced distances (0…total), linearly interpolate `speed/throttle/brake/n_gear/rpm/drs`.
- `mergeDrivers(gridA, gridB)` → rows `{ distance, <chan>_a, <chan>_b }`. With one driver, `_b` columns are simply absent.

**Alternatives considered**: *Raw elapsed-time x-axis* — rejected by the user (corners wouldn't align). *Absolute (un-normalized) derived distance* — rejected: integration drift would leave the two laps slightly misaligned at the end; normalizing to a common length keeps corners aligned, which is the whole point of the comparison.

**Watch out**: gear and DRS are discrete — interpolating them linearly would invent fractional gears. Resample those with **nearest-sample** (step) interpolation, not linear.

---

## Decision 4 — Linked cursor via shared `syncId` (US3 falls out for free)

**Decision**: Give all six charts `syncId="telemetry"` and a shared `data` array.

**Rationale**: Recharts synchronizes tooltip + cursor position across charts that share a `syncId`. Because we already merged both drivers onto one row array, hovering any chart highlights the same distance on all six and shows each driver's value — exactly US3, with no custom cursor code.

---

## Decision 5 — Drivers picker: Salt `Dropdown multiselect`, capped at two

**Decision**: The Drivers selector is a Salt `Dropdown` with `multiselect`, controlled via `selected` + `onSelectionChange`; the handler ignores a selection that would exceed two.

**Rationale**: Confirmed available in `@salt-ds/core` 1.54 (`multiselect?: boolean`, `selected?: Item[]`, `onSelectionChange(e, newSelected)`). Keeps the control Salt-native (Article VI) and the max-2 rule is a one-line guard in the handler. Controlled selection also avoids the "uncontrolled ListControl" warning seen elsewhere.

**Alternatives considered**: *ComboBox multiselect* (token style, like the driver search) — fine, but a checkbox `Dropdown` reads better for a small fixed grid of drivers. *Two single-driver dropdowns* — clunkier and makes "max 2" implicit rather than enforced.

---

## Decision 6 — Two-color comparison palette, one shared legend

**Decision**: Fixed driver colors — **A = cyan (`#3FC1C9`)**, **B = orange (`#FB8C00`)** — used consistently across every chart and the summary chips, with a single legend above the stack.

**Rationale**: The user asked for "colorful but not glittery, clean." Two high-contrast, dark-theme-friendly colors are instantly distinguishable on every trace and color-link the summary chips to their traces. Using fixed A/B colors (not team colors) avoids the case where two drivers from similar-liveried teams are hard to tell apart.

**Alternatives considered**: *Team colours per driver* — rejected: risk of near-identical colors (e.g. two red cars) defeats the comparison.

---

## Decision 7 — DRS decoded to on/off; brake/gear as steps

**Decision**: Render DRS as a 0/1 stepped line via a decode map; brake and gear as stepped lines; speed/throttle/RPM as plain lines.

**Rationale**: The probe showed `drs` is an **encoded integer** (e.g. `0,1,8,10,12,14`), not a boolean. `decodeDrs(v)` → `1` when `v ∈ {10,12,14}` (DRS open/active) else `0`, so the chart reads as clear on/off bands. `brake` is effectively 0/100 and `n_gear` is integer 0–8 — stepped lines represent both honestly (no fake ramps).

---

## Resolved unknowns

| Unknown | Resolution |
|---|---|
| Telemetry channels available | `speed, throttle, brake, n_gear, rpm, drs` (+ `date`) — confirmed on live data |
| Per-lap volume | ~300 samples/driver (~3.8 Hz) — small, persist-safe |
| How to fetch just the fastest lap | `/car_data` with `date>=`/`date<` operators (encoded); ~300 rows |
| Two-lap x-axis alignment | derive distance, resample both onto one normalized grid |
| Linked cursor across charts | Recharts `syncId` + shared `data` |
| Salt multi-select availability | `Dropdown multiselect` confirmed in `@salt-ds/core` 1.54 |
| New dependencies | none — Recharts already installed |
