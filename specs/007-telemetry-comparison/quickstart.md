# Quickstart: Telemetry Comparison — Verification Scenarios

Manual browser verification. Run after implementation. `npm run dev`, open **Telemetry** in the sidebar (now enabled).

---

## Scenario 1 — Single-driver telemetry (US1 · SC-001/002/005)

1. Pick season **2024** (navbar), Event **Dutch Grand Prix**, Session **Race**, one driver (e.g. Verstappen).
2. **Expect**: within ~3s, six charts render — Speed, Throttle, Brake, Gear, RPM, DRS — each a single trace over distance. A summary chip shows the driver's fastest lap time and top speed.

✅ Pass: all six channels present, single clean trace, headline numbers shown.

---

## Scenario 2 — Two-driver comparison (US2 · SC-003/004)

1. Add a second driver (e.g. Norris).
2. **Expect**: every chart now shows two traces in the two driver colors (cyan / orange) with a shared legend; both summary chips present.
3. Confirm a given corner (a dip in the Speed trace) sits at the **same x-position** for both drivers — i.e. they share the distance axis.

✅ Pass: two distinguishable traces on every chart, aligned on one distance axis.

---

## Scenario 3 — Max-two cap (US2)

1. With two drivers selected, open the Drivers dropdown and try to select a third.
2. **Expect**: selection stays at two (third pick ignored).

✅ Pass: never more than two drivers.

---

## Scenario 4 — Linked cursor (US3)

1. Hover over any chart at some distance.
2. **Expect**: all six charts show a cursor at that same distance, and tooltips show each selected driver's value for that channel.

✅ Pass: synchronized cursor + tooltips across all charts.

---

## Scenario 5 — Fastest lap only (FR-007)

1. For a Race session, note the lap time on the summary chip.
2. **Expect**: it equals the driver's fastest lap of the session (cross-check against the session classification's fastest lap if available), not lap 1 or an out-lap.

✅ Pass: charts/figures reflect the fastest valid lap.

---

## Scenario 6 — Session types (FR-004)

1. Switch Session to **Qualifying**, then **Practice 3**.
2. **Expect**: charts re-fetch and redraw for the new session's fastest lap; the Session dropdown lists all sessions of the event.

✅ Pass: works across session types; no stale traces from the prior session.

---

## Scenario 7 — Cascade resets (FR-012 · SC-006)

1. With a full selection shown, change the **Event**.
2. **Expect**: Session and Drivers clear, charts disappear until re-selected. Changing the **navbar year** clears everything.

✅ Pass: dependent selections reset; no stale data.

---

## Scenario 8 — Edge: no timed lap

1. Select a driver who set no representative lap (DNF early) if available.
2. **Expect**: a "no timed lap" message for that driver instead of empty charts; a second valid driver still renders.

✅ Pass: graceful per-driver messaging.

---

## Scenario 9 — Edge: incomplete selection / unavailable data

1. Land on the page with nothing selected.
2. **Expect**: a prompt to choose event/session/driver, no charts.
3. If telemetry can't be retrieved (rate-limited/locked), a friendly unavailable state shows — not a crash.

✅ Pass: clear empty + unavailable states.

---

## Build / rate-limit sanity

- `npm run build` clean; no console key/prop warnings.
- **Network tab**: selecting two drivers issues a small number of requests (`/laps` ×2, ranged `/car_data` ×2, each ~300 rows) — **not** a whole-session car_data download. Reload paints from persisted cache.
