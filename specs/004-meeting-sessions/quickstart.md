# Quickstart: Meeting Sessions Grid

**Branch**: `004-meeting-sessions` | **Date**: 2026-06-05

---

## Integration Scenarios

### Scenario 1: Navigate from Calendar to GP Weekend Sessions (Happy Path)

1. Open `http://localhost:5173/seasons?year=2025`
2. The Calendar grid loads all 2025 rounds.
3. Double-click the "Monaco Grand Prix" row.
4. Browser navigates to `/meetings/<meeting_key>?year=2025`.
5. The MeetingPage loads, heading shows "Monaco Grand Prix — Monaco".
6. Sessions grid shows 5 rows: Practice 1, Practice 2, Practice 3, Qualifying, Race.
7. Completed sessions show muted grey status; upcoming sessions show green.
8. Press browser back → returns to `/seasons?year=2025` with calendar still loaded.

---

### Scenario 2: Direct URL Deep Link

1. Navigate directly to `http://localhost:5173/meetings/1229` (a known meeting key).
2. Page loads without needing to come from the Calendar.
3. Meeting heading and sessions grid render correctly.
4. No crash, no blank screen.

---

### Scenario 3: Navigate to Session Detail

1. On the MeetingPage, double-click the "Race" session row.
2. Browser navigates to `/sessions/<session_key>?year=2025`.
3. If the session detail page is not yet built, the browser shows a placeholder or empty route — app does not crash.
4. Press browser back → returns to the MeetingPage.

---

### Scenario 4: Sprint Weekend

1. Navigate to a sprint weekend meeting (e.g. 2024 Miami GP).
2. Sessions grid shows 6 rows: Practice 1, Sprint Qualifying, Sprint, Practice 2, Qualifying, Race.
3. No hard-coded session list — all sessions returned by the API are displayed.

---

### Scenario 5: Season Switching from GP Weekend Page

1. User is on `/meetings/1229?year=2025`.
2. User changes global season selector to 2024.
3. URL updates to include `year=2024` — if the meeting exists in 2024, content stays; otherwise the page may show "not found".
4. Back-navigation preserves the updated year in the calendar.

---

### Scenario 6: Empty / Error States

1. Navigate to `/meetings/99999` (non-existent meeting key).
2. API returns empty array for meetings.
3. Page shows a "No meeting found" empty state — no JS error, no blank screen.
