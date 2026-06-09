# Quickstart: Overview Page — Verification Scenarios

Manual browser verification (project convention — no automated suite). Run after implementation. Each scenario maps to spec acceptance criteria / success criteria.

**Setup**: `npm run dev`, open the app, use the navbar **Overview** item (now enabled). The page is year-scoped via the navbar year selector (`?year=`).

---

## Scenario 1 — Grand Prix cards render for the season (US1 · SC-002)

1. Select **2024** in the year selector and open **Overview**.
2. **Expect**: one card per Grand Prix, ordered by round (1, 2, 3…), no duplicates, no "testing" event.
3. Each card shows: round number, GP name, country flag + name, circuit, weekend date range, a status pill, and a list of its sessions (Practice 1–3, Qualifying, Race; Sprint weekends also show Sprint sessions).

✅ Pass: every 2024 GP present exactly once, each with identity + session list.

---

## Scenario 2 — Completed vs upcoming status (US1 · SC-004)

1. On the same page, inspect any **completed** GP card.
2. **Expect**: GP status pill = "Completed"; every session row pill = "Completed".
3. Because all selectable seasons are in the past, **all** cards should read "Completed".

✅ Pass: 100% of cards show a status pill; completed GPs and sessions are clearly marked.

> To exercise Upcoming/In-Progress visually, a future-dated season (if/when data exists) would show those states; not reproducible with 2023–2025 data.

---

## Scenario 3 — Season KPI strip (US2 · SC-001)

1. With **2024** selected, look at the KPI strip above the cards.
2. **Expect** three KPI cards:
   - **Championship Leader** — driver name, team, points (2024 → Max Verstappen / Red Bull Racing / points).
   - **Last Race Winner** — driver name + the final GP of 2024 (Abu Dhabi Grand Prix).
   - **Next Race** — "Season complete" (2024 is fully in the past).
3. **Expect**: leader + winner identifiable within ~5 seconds of load, without scrolling.

✅ Pass: all three KPIs populated correctly; next-race shows the season-complete state.

---

## Scenario 4 — Drill into a session (US3 · SC-003)

1. On a completed Race card, click the **Race** session row.
2. **Expect**: navigate to `/sessions/:key` (the session detail page) for that race; `?year=` preserved.
3. Use the existing "Back to Meeting" → "Back to Calendar" path; confirm year context is retained throughout.

✅ Pass: session row → session detail in one click; year preserved.

---

## Scenario 5 — Drill into a meeting (US3)

1. On any GP card, click the **GP name** link.
2. **Expect**: navigate to `/meetings/:key` (the meeting page) for that GP; `?year=` preserved.

✅ Pass: GP name → meeting page; year preserved.

---

## Scenario 6 — Switch season repaints everything (SC-005)

1. With **2024** loaded, switch the year selector to **2023**.
2. **Expect**: KPI strip and every GP card update to 2023 (different leader, different GP set). No 2024 data lingers.

✅ Pass: full repaint to the new season, no stale cards or KPIs.

---

## Scenario 7 — Empty / no-data season (edge · FR-010)

1. Select a year with no published data (e.g. a future year if selectable, or simulate by clearing the response).
2. **Expect**: `No Grand Prix data for this season` message, not a blank page or crash.

✅ Pass: graceful empty state.

---

## Scenario 8 — Live-session API lockout (edge)

1. If OpenF1 returns the free-tier live-session restriction, the page must show a friendly unavailable/empty state, not a raw error screen.

✅ Pass: no uncaught error; degraded gracefully.

---

## Scenario 9 — Status parity with the meeting page (FR-011 regression)

1. Open a GP card; note a session's status.
2. Click into the meeting page for that GP; confirm the same session shows the **same** status.
3. **Expect**: identical status — both now compute via the shared `deriveSessionStatus`.

✅ Pass: card and meeting page agree on every session's status.

---

## Build sanity

- `npm run build` completes with no errors.
- No console warnings about missing keys in the card grid or session list.
