# Quickstart: Drivers Tab

**Feature**: `001-drivers-tab`
**Date**: 2026-05-30

## How to validate this feature manually

1. **Start the dev server**
   ```bash
   npm run dev
   ```

2. **Verify US1 — Drivers grid loads for current season**
   - Navigate to `http://localhost:5173/drivers`
   - Grid must show ~22 drivers (2025 season)
   - Year selector in top-right must show "2025"
   - Columns visible: Driver Name, Driver Number, Nationality, Constructor
   - Click any column header → rows re-sort

3. **Verify US2 — Year selector changes the grid**
   - Open the year dropdown → confirm three options: 2023, 2024, 2025
   - Select **2023** → grid must refresh and show 20 drivers (2023 lineup)
     - Confirm you see: Verstappen (Red Bull), Hamilton (Mercedes), Bottas (Alfa Romeo)
     - Confirm you do NOT see: drivers added after 2023 (e.g., Andrea Kimi Antonelli in 2025)
   - Select **2024** → grid must refresh and show 2024 lineup
   - Select **2025** → grid returns to current season

4. **Verify year persists across navigation**
   - While viewing 2023 drivers, click a sidebar link (e.g., any nav item) to navigate away
   - Use the browser back button to return to `/drivers`
   - Year selector must still show "2023"
   - URL must show `?year=2023`

5. **Verify empty-state loading (if observable)**
   - Open DevTools → Network → throttle to Slow 3G
   - Select a different year
   - Grid must show empty rows while loading (no stale data from the previous year)

6. **Verify mobile layout**
   - Open DevTools → responsive mode → set width to 375px
   - Year selector must be visible and tappable
   - Grid must be scrollable horizontally
