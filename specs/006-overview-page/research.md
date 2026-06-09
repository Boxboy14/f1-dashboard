# Research: Overview Page — Season Dashboard with Grand Prix Cards

Phase 0 decisions. Each resolves an unknown or commits to an approach before design.

---

## Decision 1 — Layout: card per Grand Prix, not a flat session table

**Decision**: Render one Salt `Card` per Grand Prix, with that weekend's sessions listed inside the card. The page is a responsive grid of these cards under a KPI strip.

**Rationale**: The user explicitly chose this over a flat table during specification. ~120 sessions in a flat grid is hard to scan; grouping them under their Grand Prix gives the season structure at a glance. Cards also give room for per-GP identity (flag, circuit, dates, status) that a table row can't.

**Alternatives considered**:
- *Flat sortable session table* (like the Calendar grid) — rejected by the user; loses GP-level grouping.
- *Expandable parent/child grid* (like the new PitStopsGrid) — community ag-grid has no real tree-data; the manual expand pattern works for a small table but is heavy for a 24×5 season view, and breaks column filtering. Cards are simpler and richer here.

---

## Decision 2 — Salt `Card` is the container (new component for this project)

**Decision**: Use `Card` from `@salt-ds/core` for both the Grand Prix cards and the KPI cards. Use a plain `Card` (not `InteractableCard`) for the Grand Prix card.

**What it is**: `Card` is Salt's surface container — a themed, padded, bordered box for grouping related content. `InteractableCard` is its clickable variant (hover/focus/selected states, behaves as one button).

**Why we chose it**: Constitution Article VI (Salt-first). `Card` is the canonical Salt surface for exactly this. The project hasn't used `Card` yet (`TeamDetailCard` is actually a `Dialog`), so this is the first use.

**How it's wired in**: Import `{ Card }` from `@salt-ds/core`; compose Salt layout (`StackLayout`/`FlexLayout`) and `Text` inside. Verified exported by the installed `@salt-ds/core@1.54.1`.

**Key concept**: A `Card` is just a styled container — it adds no behavior. Interactivity comes from the Salt `Link`/`Button` children you put inside it.

**What to watch out for**: Do **not** use `InteractableCard` for the Grand Prix card. The GP card needs two distinct navigation targets (the GP → meeting page, each session → session detail). Making the whole card one interactive control would force nested interactive elements (a session `Link` inside a card-button) — a DOM/accessibility anti-pattern. Plain `Card` + discrete `Link` children keeps each target clean and accessible.

---

## Decision 3 — Two focused hooks, not one mega-hook

**Decision**: Add `useSeasonGrandPrix(year)` (cards) and `useSeasonKpis(year)` (KPI strip) to `src/hooks/useOpenF1.js`, composed by `OverviewPage`.

**Rationale**: Maps cleanly to the two user stories (US1 cards, US2 KPIs) and keeps each hook single-purpose (Article V). US1 is independently shippable using only `useSeasonGrandPrix`. Both hooks call `useSessions({ year })`; TanStack Query deduplicates by query key, so there is no double fetch (Article IV).

**Alternatives considered**:
- *One `useSeasonOverview` hook returning everything* — rejected: couples two stories, larger surface, harder to reason about loading states independently.
- *Feature-local hook file* — rejected: every existing composite hook (`useMeetingDetail`, `useSessionDetail`, `useTeamsByYear`) lives in `useOpenF1.js`; consistency wins.

---

## Decision 4 — Lift session-status derivation into a shared helper

**Decision**: Extract the date→status logic currently inlined in `useMeetingDetail` into `src/utils/sessionStatus.js` (`deriveSessionStatus`, `deriveMeetingStatus`) and reuse it in the new hooks; refactor `useMeetingDetail` to call it.

**Rationale**: FR-011 requires consistent status across cards and the meeting page. Duplicating the logic would let them drift (Article V). The extraction is behavior-preserving — the exact same comparisons (`date_end < now` → Completed, `date_start <= now` → In Progress, else Upcoming, cancelled wins).

**Alternatives considered**:
- *Duplicate the logic in the new hook* — rejected: two sources of truth for status.
- *Reuse `useRaceCalendar`'s meeting status* — rejected: it derives GP status from `date_start` only (no `date_end`, no session granularity), so it can't say "In Progress" mid-weekend. The new `deriveMeetingStatus` rolls up real session statuses.

---

## Decision 5 — KPI data sourcing (leader, last winner, next race)

**Decision**:
- **Leader**: `useChampionshipDrivers({ session_key: lastRaceKey })` joined with `useDrivers({ session_key: lastRaceKey })` on `driver_number`; take `position_current === 1`.
- **Last winner**: `useSessionResult({ session_key: lastRaceKey })` joined with the same drivers list; take `position === 1`. The GP name comes from the session's `meeting_key` → meeting.
- **Next race**: derived from the already-fetched `useSessions({ year })` — earliest `Race` with `date_start > now`, or `null`.
- `lastRaceKey` = latest **completed** `Race` session of the year (from the same sessions list).

**Rationale**: Mirrors the established join pattern in `useTeamsByYear`/`useSessionDetail` (championship and result endpoints carry `driver_number`, not names). All six queries are season-level and cached; no per-GP fan-out (Article IV, rate limits).

**Alternatives considered**:
- *Per-GP result lookups to show each card's winner* — rejected for the first cut: up to 24 `session_result` calls would strain the 30 req/min limit. The KPI strip's single "last winner" covers the need; per-card winners are a documented future enhancement.
- *`session_key=latest` for standings* — rejected: not year-scoped. The selected year's last completed race is the correct standings anchor.

**Known runtime reality**: With the current date (June 2026), all selectable seasons (2023–2025) are complete, so `nextRace` is almost always `null` → the next-race KPI shows "Season complete," and `lastRaceKey` is the year's final race. The placeholder/"season complete" states (FR-006) are therefore the common path and must be solid, not afterthoughts.

---

## Decision 6 — Status vocabulary reuse

**Decision**: Reuse the existing `STATUS_STYLES` map (`src/utils/cellRenderers/statusStyles.js`) for the `StatusPill` color, so the overview's status colors match the Calendar/Sessions grids exactly.

**Rationale**: One status vocabulary across the app (Completed/In Progress/Upcoming/Cancelled). No new color decisions, no drift. `StatusPill` is a small presentational wrapper — a Salt `Pill` (or styled span) tinted by `STATUS_STYLES[status]`.

**Alternatives considered**:
- *Salt `Badge`* — rejected: `Badge` is for counts/notifications, not status labels.
- *New per-card color set* — rejected: duplicates the grid vocabulary.

---

## Decision 7 — "Countdown" is a static relative date, not a live timer

**Decision**: The next-race KPI shows the GP name + date and a static "in N days" computed at render — no ticking `setInterval`.

**Rationale**: The spec says "countdown" but the value is informational; a live-ticking timer adds a re-render loop for no real benefit (and, given all seasons are past, would never run anyway). A static relative date satisfies the intent (SC-001: identify the next race) with zero added complexity (Article V).

---

## Resolved unknowns

| Unknown | Resolution |
|---|---|
| Year source on the page | `useOutletContext().year` (set from `?year=` in `DashboardLayout`), same as `SeasonsPage`/`TeamsPage` |
| Salt `Card`/`Link`/`Pill`/`GridLayout` availability | Verified exported by `@salt-ds/core@1.54.1` |
| How to avoid duplicate season fetches across the two hooks | Shared TanStack Query keys (`["sessions",{year}]`, `["meetings",{year}]`) dedupe to one call each |
| Names/teams on standings + results | Not present on `championship_drivers`/`session_result`; join with `useDrivers({session_key})` on `driver_number` (existing pattern) |
| New dependencies | None — Recharts is already installed but unused here; this feature adds nothing |
