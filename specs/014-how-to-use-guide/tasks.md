---
description: "Task list for How to Use Guide feature implementation"
---

# Tasks: How to Use Guide

**Input**: Design documents from `/specs/014-how-to-use-guide/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required for user stories), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: Not requested in the feature specification — no automated test runner exists in this project. Verification is manual, via `quickstart.md` and `npm run lint`.

**Organization**: Tasks are grouped by user story so each can be implemented and verified independently.

## Path Conventions

Single-project React SPA (existing structure). All paths are relative to the repository root (`f1-dashboard/`).

---

## Phase 1: Setup

**Purpose**: Prepare the new feature's home in the existing structure

- [ ] T001 Create the `src/components/tabs/how-to-use/` directory for this feature's content module and components. No new npm dependency is needed — `Accordion`/`AccordionGroup` already ship in the installed `@salt-ds/core`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Route, nav entry, page shell, and empty accordion renderer that every user story's content depends on

**⚠️ CRITICAL**: No user story task can be verified until this phase is complete — none of the content has anywhere to render

- [ ] T002 [P] Add the "How to Use" route in `src/App.jsx`: import `HowToUsePage` and add `<Route path="how-to-use" element={<HowToUsePage />} />` directly before the existing `feedback` route.
- [ ] T003 [P] In `src/components/dashboard/Sidebar/Sidebar.jsx`, add a `HOW_TO_USE_ITEM` constant (`{ label: "How to Use", icon: <an existing @salt-ds/icons icon not already used by NAV_ITEMS, e.g. InfoIcon>, path: "/how-to-use" }`) next to `FEEDBACK_ITEM`, and render it via `renderItem(HOW_TO_USE_ITEM)` inside the `bottomNav` block, immediately before `renderItem(FEEDBACK_ITEM)`.
- [ ] T004 [P] Create `src/components/dashboard/HowToUsePage.jsx`: a page shell mirroring `FeedbackPage.jsx` — a `Text styleAs="h1"` heading ("How to Use the F1 Dashboard"), a secondary subtitle `Text` summarizing the page's purpose in plain language, and a `<HowToUseGuide />` below it, wrapped in the page's own `styles.page` div.
- [ ] T005 [P] Create `src/components/dashboard/HowToUsePage.module.scss` mirroring `FeedbackPage.module.scss` (`.page` constrained max-width and centered, `.subtitle` spacing) — reuse the same values unless the longer guide content needs a wider max-width.
- [ ] T006 [P] Create `src/components/tabs/how-to-use/guideContent.js` exporting an empty `GUIDE_SECTIONS` array and an empty `ASSISTANT_GUIDE` object, matching the shapes defined in `data-model.md` (`GuideSection`: `id`, `title`, `description`, `controls`, `interactionTip`; `AssistantGuide`: `location`, `capabilities`, `limitations`, `telemetryReportSteps`).
- [ ] T007 Create `src/components/tabs/how-to-use/HowToUseGuide.jsx`: render `GUIDE_SECTIONS` (imported from `guideContent.js`, depends on T006) inside a Salt `AccordionGroup`, one `Accordion` + `AccordionHeader` (section `title`) + `AccordionPanel` (section `description`, then `controls` as a bullet list) per entry. Leave a placeholder spot for the Assistant section (populated in User Story 3) — render nothing for it yet if `ASSISTANT_GUIDE` is empty.

**Checkpoint**: `/how-to-use` is reachable from the sidebar (above Feedback) and renders an empty accordion shell. Ready for content.

---

## Phase 3: User Story 1 - Learn how each tab works (Priority: P1) 🎯 MVP

**Goal**: Every main tab (Overview, Drivers, Teams, Calendar, Telemetry) has its own accordion section explaining, in plain language, what it shows and how to use its controls.

**Independent Test**: Open `/how-to-use` with no other context, expand each of the five tab sections, and confirm each has an accurate plain-language description and a list of its controls (per spec Acceptance Scenarios 1–2 of User Story 1).

### Implementation for User Story 1

- [ ] T008 [US1] Add the **Overview** entry to `GUIDE_SECTIONS` in `src/components/tabs/how-to-use/guideContent.js`: description of the season snapshot and clickable race cards; controls bullet for picking a season from the top navbar; `interactionTip: null`.
- [ ] T009 [US1] Add the **Drivers** entry to `GUIDE_SECTIONS` in `guideContent.js`: description of the driver list alongside points/ranking charts; controls bullets for searching for a driver and picking a season; `interactionTip: null` (filled in by User Story 2).
- [ ] T010 [US1] Add the **Teams** entry to `GUIDE_SECTIONS` in `guideContent.js`: description of the ranked team list alongside points/ranking charts; controls bullet for picking a season; `interactionTip: null` (filled in by User Story 2).
- [ ] T011 [US1] Add the **Calendar** entry to `GUIDE_SECTIONS` in `guideContent.js`: description of the season's race list; controls bullet for picking a season; `interactionTip: null` (filled in by User Story 2).
- [ ] T012 [US1] Add the **Telemetry** entry to `GUIDE_SECTIONS` in `guideContent.js`: description of comparing two drivers lap by lap; controls bullets for picking an event, a session, up to two drivers, and a lap, plus downloading the comparison; `interactionTip: null`.
- [ ] T013 [US1] Manually verify against `quickstart.md` steps 3–4 and 6: all five sections expand with correct heading, description, and controls; no technical terms appear in the copy.

**Checkpoint**: User Story 1 is fully functional and independently testable — every tab is explained.

---

## Phase 4: User Story 2 - Discover that data tables reveal more on double-click (Priority: P1)

**Goal**: Drivers, Teams, and Calendar sections explicitly tell the user that double-clicking a row reveals more detail, and what that detail is.

**Independent Test**: Read only the Drivers, Teams, and Calendar sections and confirm each states, in plain language, that double-clicking a row opens more detail and describes what appears (per spec Acceptance Scenarios 1–2 of User Story 2).

### Implementation for User Story 2

- [ ] T014 [US2] Set `interactionTip` on the **Drivers** entry in `guideContent.js`: double-clicking a driver row opens that driver's full profile and season stats.
- [ ] T015 [US2] Set `interactionTip` on the **Teams** entry in `guideContent.js`: double-clicking a team row opens that team's details and driver lineup.
- [ ] T016 [US2] Set `interactionTip` on the **Calendar** entry in `guideContent.js`: double-clicking a race opens its list of sessions, and double-clicking a session opens that session's results.
- [ ] T017 [US2] Update `src/components/tabs/how-to-use/HowToUseGuide.jsx` so each `AccordionPanel` renders a visually distinct callout (e.g., an accent-colored `Text`/banner row) for `interactionTip` whenever it is non-null, and renders nothing extra when it is `null`.
- [ ] T018 [US2] Manually verify against `quickstart.md` step 5: Drivers/Teams/Calendar show the double-click callout with correct wording; Overview/Telemetry show no callout.

**Checkpoint**: User Stories 1 and 2 both work independently — every tab is explained, and the double-click behavior is no longer hidden.

---

## Phase 5: User Story 3 - Learn how to use the AI Assistant (Priority: P2)

**Goal**: A dedicated section explains where to find the Assistant, what it can answer, what it declines, and the exact steps to request a two-driver telemetry report.

**Independent Test**: Read only the Assistant section and confirm a user could open the chat, ask a data question, and request a two-driver telemetry report using only the instructions given (per spec Acceptance Scenarios 1–3 of User Story 3).

### Implementation for User Story 3

- [ ] T019 [US3] Populate `ASSISTANT_GUIDE` in `guideContent.js`: `location` (chat icon bottom-right on every page, opens a panel bottom-left); `capabilities` (2023–2025 race data questions, general F1 knowledge); `limitations` (declines seasons outside 2023–2025 and live, in-progress sessions rather than guessing); `telemetryReportSteps` (ordered: name a Grand Prix → pick a session → name two drivers → pick a lap → download the report).
- [ ] T020 [US3] Add an Assistant section to `src/components/tabs/how-to-use/HowToUseGuide.jsx`, separate from the `GUIDE_SECTIONS` loop (different shape): render `ASSISTANT_GUIDE.location` as intro text, `capabilities` and `limitations` as bullet lists, and `telemetryReportSteps` as a numbered list of steps, inside its own `Accordion` item.
- [ ] T021 [US3] Manually verify against `quickstart.md` step 7: the Assistant section explains location, capabilities, limitations, and the telemetry report steps clearly enough to follow with no prior product knowledge.

**Checkpoint**: All three user stories are independently functional — the guide fully covers every tab, the double-click behavior, and the Assistant.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency pass across all stories

- [ ] T022 [P] Per spec Assumptions, add a one-line mention of the Feedback tab (e.g., in the `HowToUsePage.jsx` subtitle or as a final short accordion entry) — it doesn't need its own full section.
- [ ] T023 Run `npm run lint` and fix any issues introduced by the new files.
- [ ] T024 Execute the full `quickstart.md` walkthrough (steps 1–11) end to end and fix any discrepancies found.
- [ ] T025 Re-read all six sections' copy once more and confirm no technical/implementation terms (library names, "grid", "API", component names) leak in anywhere, per FR-007.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. T002–T006 can run in parallel (different files); T007 depends on T006. **BLOCKS all user stories.**
- **User Stories (Phase 3–5)**: All depend on Foundational completion. Because all three stories edit the same two files (`guideContent.js` and `HowToUseGuide.jsx`), they are best done **sequentially in priority order** (US1 → US2 → US3) rather than in parallel, even though each is independently testable once its own tasks land.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational. No dependency on other stories.
- **User Story 2 (P1)**: Can start after Foundational. Adds `interactionTip` fields to entries User Story 1 creates in `guideContent.js` — implement after US1 to avoid editing the same array entries out of order, even though the *content* is independently testable.
- **User Story 3 (P2)**: Can start after Foundational. Touches a different part of `guideContent.js` (`ASSISTANT_GUIDE`) and a different rendering block in `HowToUseGuide.jsx` — could run in parallel with US1/US2 if staffed separately, but sequential is simpler given the small file count.

### Within Each User Story

- Content (`guideContent.js` entries) before rendering changes that depend on new fields (e.g., T017 depends on T014–T016 existing so there's something to render).
- Manual verification task last in each phase.

### Parallel Opportunities

- T002, T003, T004, T005, T006 (Foundational) — five different files, no shared dependencies.
- T008–T012 (User Story 1) all edit the same array in the same file (`guideContent.js`) — not meaningfully parallelizable; treat as a sequential block.
- T022 (Polish) can run in parallel with T023–T025 since it's a small, separate copy edit.

---

## Parallel Example: Foundational Phase

```bash
Task: "Add the How to Use route in src/App.jsx"
Task: "Add HOW_TO_USE_ITEM to src/components/dashboard/Sidebar/Sidebar.jsx"
Task: "Create src/components/dashboard/HowToUsePage.jsx"
Task: "Create src/components/dashboard/HowToUsePage.module.scss"
Task: "Create src/components/tabs/how-to-use/guideContent.js (empty shells)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (route, nav entry, page shell, empty accordion)
3. Complete Phase 3: User Story 1 — every tab explained
4. **STOP and VALIDATE**: walk through `quickstart.md` steps 1–4 and 6
5. This alone already satisfies the most common "how do I use this app" need

### Incremental Delivery

1. Setup + Foundational → page exists, empty
2. User Story 1 → every tab explained → demo-able MVP
3. User Story 2 → double-click confusion resolved → demo-able increment
4. User Story 3 → Assistant explained → feature complete
5. Polish → Feedback mention, lint, full quickstart pass, final copy review

---

## Notes

- No `[P]` markers within User Story 1/2 content tasks — they share `guideContent.js`, so true file-level parallelism doesn't apply even though they're conceptually independent pieces of copy.
- This feature has no test runner in the project; every "test" task above is a manual `quickstart.md`-driven check, not an automated test.
- Commit after each phase checkpoint, not necessarily after every single task, given how small each file change is.
