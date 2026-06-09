# Quickstart: Session Detail Page Integration Scenarios

**Branch**: `005-session-detail` | **Date**: 2026-06-07

---

## Scenario 1: Happy path — completed Race session

**URL**: `/sessions/9551` (2024 Bahrain Grand Prix Race)

**Expected**:
1. Page loads with heading "Race · Bahrain Grand Prix · DD Mon YYYY"
2. Back link is visible and navigates to `/meetings/<meeting_key>`
3. ClassificationGrid shows 20 rows (or however many drivers) sorted by position 1 → 20
4. Race column set is active: `#`, `Driver`, `Team`, `Gap`, `Status` columns present
5. Leader row (position 1) has blank Gap column
6. Drivers with DNF have "DNF" in Status column (red)
7. PitStopsGrid is visible with at least one row per driver that pitted

**Integration test**: Navigate to `/seasons?year=2024` → double-click Bahrain row → double-click Race session row → confirm above.

---

## Scenario 2: Happy path — completed Qualifying session

**URL**: `/sessions/<qualifying_session_key>`

**Expected**:
1. Page loads with heading "Qualifying · <GP Name> · DD Mon YYYY"
2. ClassificationGrid shows qualifying column set: `#`, `Driver`, `Team`, `Best Time` columns present
3. No `Gap` or `Status` columns
4. Best times formatted as "M:SS.mmm"
5. PitStopsGrid is absent (qualifying has no pit stops data)

**Integration test**: Navigate to a GP meeting → double-click Qualifying session row.

---

## Scenario 3: Upcoming session (no results yet)

**URL**: `/sessions/<future_session_key>`

**Expected**:
1. Page loads heading with session name and date
2. ClassificationGrid shows empty state message ("No results available")
3. PitStopsGrid is absent

**Integration test**: In a 2025 GP, navigate to a qualifying session that has not yet occurred.

---

## Scenario 4: Invalid session key

**URL**: `/sessions/9999999` (non-existent key)

**Expected**:
1. Both `useSessionResult` and `useSessions` return empty arrays
2. Page renders "Session not found" message
3. No JavaScript errors in console

**Integration test**: Manually type an invalid session key in the browser address bar.

---

## Scenario 5: Cancelled meeting session

**URL**: `/sessions/<session_key_from_cancelled_meeting>`

**Expected**:
1. Session record loads (OpenF1 still stores sessions for cancelled weekends)
2. Session result is empty (no race was run)
3. ClassificationGrid shows empty state
4. PitStopsGrid is absent
5. Back link still works to navigate to the meeting page (which shows all sessions as "Cancelled")

**Integration test**: Navigate to 2023 Emilia Romagna GP meeting → double-click any session row.

---

## Scenario 6: Practice session

**URL**: `/sessions/<practice_session_key>`

**Expected**:
1. Page heading shows "Practice 1" (or 2/3) and session date
2. ClassificationGrid shows qualifying/practice column set with Best Time column
3. PitStopsGrid may or may not be visible depending on whether pit data exists for that practice session
4. No errors if pit data is absent

**Integration test**: Navigate to any GP meeting → double-click a Practice 1 session row.
