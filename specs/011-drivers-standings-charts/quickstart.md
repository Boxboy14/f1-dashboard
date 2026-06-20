# Quickstart: Drivers Tab — Standings Evolution Charts — Manual Verification

Run `npm run dev`, open the Drivers tab. Project convention: manual browser verification.

**Setup**: Pick a completed season in the navbar (e.g. **2024**). Wait for the first assembly (it fetches each round's standings, paced by the rate limiter — a loading spinner shows).

---

## US1 — Driver Points Evolution (P1)

1. Confirm a chart titled **"Driver Points Evolution"** renders one line per driver, each in its **team colour**, with cumulative points on the Y-axis.
2. Confirm the X-axis is the season's races as **country flags in calendar order**.
3. Hover a round → a panel shows the **flag + country + round number** and **every driver's cumulative points for that round, sorted highest→low** (ties resolved by championship position).
4. Sanity-check against known data: at the final 2024 round the leader reads **437 pts** (Verstappen).
5. **Edge**: select a season **partway through** (2025 if mid-season) → lines stop at the latest completed round; no empty future flags.

## US2 — Driver Ranking Evolution (P2)

1. Confirm a chart titled **"Driver Ranking Evolution"** with the Y-axis showing **positions 1..N (1 at top)** and the same flag X-axis.
2. Confirm each line is **team-coloured** and ends at the right edge with the driver's **3-letter code** in team colour.
3. Confirm the Y-axis range matches the **driver count** (20 or 21/24 depending on season).
4. Hover a round → panel shows flag + country + round and a **driver's position** at that round (e.g. "Verstappen — 3rd pos.").

## US3 — Layout reflow (P3)

1. At desktop width, the **driver grid sits in a narrower left column**, charts stacked to its right.
2. **Double-click a grid row** → the driver info card still opens.
3. Shrink to mobile width → grid and charts **stack vertically**, no horizontal overflow.

## Shared / data

1. Change the navbar **year** → both charts update to that season's rounds and drivers (FR-011).
2. **Empty state**: select a season with no completed races (if available) → an empty-state message, not broken axes.
3. **Cache**: after the season has assembled once, **reload the page** → both charts repaint quickly **from cache** without re-fetching every round (SC-007). (Confirm via DevTools Network: no burst of `championship_drivers` calls on reload within the cache window.)

---

## Regression sweep

- Theme toggle still flips dark/light across the charts (axis/grid/tooltip surfaces re-theme; team-coloured lines unchanged).
- No raw hex introduced in the app palette: `grep -rnE "#[0-9a-fA-F]{3,8}\b" src/components/tabs/drivers/standings src/hooks/useDriverStandingsEvolution.js` → only data-derived team colours (`#${team_colour}`), no literal palette hex.
- `npm run build` passes; `npx eslint src` clean.
