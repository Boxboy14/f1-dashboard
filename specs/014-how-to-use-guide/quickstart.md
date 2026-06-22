# Quickstart: How to Use Guide

Manual verification steps (no automated test suite in this project).

1. `npm run dev` and open the app in a browser.
2. Look at the sidebar: confirm a new **"How to Use"** entry appears directly above **"Feedback"** in the bottom auxiliary nav block, with its own icon.
3. Click **How to Use**. Confirm the URL becomes `/how-to-use` and the page loads with a heading + subtitle, no season selection or other prerequisite required.
4. Confirm six collapsible sections are present: Overview, Drivers, Teams, Calendar, Telemetry, AI Assistant (plus an optional short Feedback mention).
5. Expand the **Drivers** section: confirm it explicitly states that double-clicking a driver row opens that driver's full details. Repeat for **Teams** (team details) and **Calendar** (race → sessions → results drill-down).
6. Expand **Overview** and **Telemetry**: confirm there is no double-click callout for these (they don't have that behavior), and that Telemetry's section explains picking an event, session, up to two drivers, and a lap, plus the download option.
7. Expand **AI Assistant**: confirm it explains where the chat icon is, what it can answer, that it declines out-of-range questions rather than guessing, and gives clear steps to request a two-driver telemetry report (Grand Prix, session, two drivers, lap).
8. Switch the season selector in the top navbar while on `/how-to-use`: confirm the guide content is unaffected (FR-009).
9. Collapse the sidebar (icon-only mode): confirm "How to Use" still shows a tooltip with its label on hover, consistent with the other nav items.
10. Read through all six sections once more and confirm no technical/implementation terms (library names, "grid", "API", component names) appear anywhere (FR-007).
11. `npm run lint` — must pass with no new errors.
