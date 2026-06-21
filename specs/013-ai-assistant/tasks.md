---
description: "Task list for AI Assistant implementation"
---

# Tasks: AI Assistant

**Input**: Design documents from `specs/013-ai-assistant/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Not requested in the spec, and the project has no automated test suite — verification is manual via [quickstart.md](./quickstart.md). No test tasks are generated.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task belongs to (US1, US2, US3)
- Exact file paths are included in each description

## Path Conventions

Client-only React app — all paths are under `src/` at the repository root (per [plan.md](./plan.md) Project Structure).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the dependency and configuration the feature needs.

- [X] T001 Add the `@google/genai` dependency: run `npm install @google/genai` (updates `package.json` + `package-lock.json`)
- [X] T002 [P] Add `VITE_GEMINI_API_KEY=` placeholder with a comment to `.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The chat shell, the Gemini streaming service, and the generic function-calling loop — required before any user story behaves. After this phase the chat opens on every page and can answer questions that need no data tool.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Create `src/services/assistant/gemini.js`: a `GoogleGenAI` client built from `import.meta.env.VITE_GEMINI_API_KEY` (throw a friendly error if unset, mirroring `src/services/feedback/emailjs.js`) and an async `streamTurn({ history, tools, systemInstruction })` using `ai.models.generateContentStream` that yields text chunks and exposes `functionCalls`. Define the Gemini Flash model id constant here. This is the only module that imports `@google/genai`.
- [X] T004 [P] Create `src/services/assistant/systemInstruction.js`: the system prompt string covering F1-only scope, grounding 2023–2025 data answers in tool calls, ignoring the navbar season, declining out-of-range (pre-2023) *data* instead of fabricating, answering general F1 knowledge directly, the gather-GP/session/drivers/lap-before-report flow, and emitting in-app page links.
- [X] T005 [P] Create `src/services/assistant/tools.js` as a registry skeleton: `export const functionDeclarations = []` and `export const handlers = {}` (extended by US1 and US2).
- [X] T006 Create `src/hooks/useAssistantChat.js`: holds the `messages` array, exposes `sendMessage`, `isStreaming`, `error`; runs the generic stream + function-calling loop (stream → `functionCall` → `handlers[name](args, { queryClient })` → append `functionResponse` → repeat → stream final text); uses `useQueryClient`; imports the registry from `tools.js` and the prompt from `systemInstruction.js`. Registers no `useQuery`/`useMutation` (stays off the global overlay). (depends on T003, T004, T005)
- [X] T007 [P] Create `src/components/assistant/ChatMessage.jsx` + `ChatMessage.module.scss`: render a user/assistant bubble from Salt `Text`; render any `PageLink`s as React Router links (Salt `Link`).
- [X] T008 Create `src/components/assistant/ChatPanel.jsx` + `ChatPanel.module.scss`: fixed bottom-left Salt `Card` with a scrollable message list (`ChatMessage`), a `MultilineInput` composer, a send `Button`, and a close control; wires `useAssistantChat`; disables the composer while `isStreaming`. (depends on T006, T007)
- [X] T009 Create `src/components/assistant/AssistantLauncher.jsx` + `AssistantLauncher.module.scss`: fixed bottom-right Salt `Button` (chat icon) that toggles `ChatPanel` open/closed; usable on mobile and with the sidebar collapsed/expanded. (depends on T008)
- [X] T010 Mount `<AssistantLauncher />` in `src/App.jsx` beside `<GlobalLoadingOverlay />` so it appears on every route. (depends on T009)

**Checkpoint**: The launcher shows bottom-right on every page; clicking opens the bottom-left panel; a general question streams an answer.

---

## Phase 3: User Story 1 - Natural-language F1 Q&A (Priority: P1) 🎯 MVP

**Goal**: Ask a plain-English F1 question and get a correct, data-grounded answer (2023–2025) with a link to the matching page — independent of the navbar season.

**Independent Test**: From any page, open the assistant and ask "Who won the 2025 Monaco GP?" → correct winner + a link to that session; with the navbar set to 2025, ask a 2023 question → answered correctly.

- [X] T011 [P] [US1] Create `src/services/assistant/f1Resolvers.js`: resolve `(year, grandPrix)` → `meeting_key` → target `session_key`, and driver name/number → `driver_number` for a session, using `queryClient.fetchQuery` over `openF1Api.meetings`/`sessions`/`drivers` with `meta: { background: true }` (reuse the season/meeting helpers' logic from `src/hooks/useOpenF1.js`).
- [X] T012 [US1] Implement the data tool handlers and register their declarations in `src/services/assistant/tools.js`: `get_race_result`, `get_championship_standings`, `get_driver_season`, `get_event_schedule`, `get_session_extras` (per [contracts/tools.md](./contracts/tools.md)) — each fetches via `queryClient.fetchQuery` over `openF1Api` with `meta: { background: true }` and returns JSON including a `page` route. (depends on T011)
- [X] T013 [US1] In each handler, return `{ ok: false, problem }` for expected gaps (no data / DNF) rather than throwing, and always include a `page` link for successful results; confirm `useAssistantChat` threads `queryClient` into `handlers`. (depends on T012, T006)
- [X] T014 [US1] Confirm season-independence end-to-end: all data tools take an explicit `year` and the navbar season is never read in the assistant path; tighten `src/services/assistant/systemInstruction.js` wording if the model leans on the UI year.

**Checkpoint**: US1 fully works — correct, linked answers across 2023–2025, independent of the navbar.

---

## Phase 4: User Story 2 - Guided two-driver telemetry report (Priority: P2)

**Goal**: Ask for a telemetry report; the assistant collects GP, session, drivers, and lap, then downloads the report.

**Independent Test**: Ask "download a telemetry report" → assistant asks for any missing GP/session/drivers/lap; once all four are valid a report file downloads; an invalid combo (driver who didn't run that session) is explained and a correction is requested.

- [X] T015 [P] [US2] Create `src/services/assistant/telemetryReport.js`: `buildAndDownloadReport({ queryClient, year, grandPrix, session, drivers, lap })` — resolve `session_key` + `driver_number`s (via `f1Resolvers`), fetch `laps` per driver and pick the fastest/selected lap, fetch the lap's `carDataLap` window + `stints` via `queryClient.fetchQuery` (`meta:{background:true}`), build `chartData` with `deriveDistance`/`resampleToGrid`/`mergeDrivers` from `src/utils/telemetry.js`, assemble per-driver meta (compound/tyreAge/sectors), then call `buildLapSummary` ([lapSummary.js](../../src/utils/telemetry/lapSummary.js)) → `downloadLapSummary` ([lapSummaryPdf.js](../../src/utils/telemetry/lapSummaryPdf.js)). (depends on T011)
- [X] T016 [US2] Add the `download_telemetry_report` declaration + handler to `src/services/assistant/tools.js`: validate the four fields (1–2 drivers; lap exists and has telemetry), call `buildAndDownloadReport`, and return `{ ok: true, summary, page: "/telemetry" }` or `{ ok: false, problem, missing }`. (depends on T015)
- [X] T017 [US2] Confirm `src/services/assistant/systemInstruction.js` drives the gather-then-confirm flow (ask only for the still-missing fields before calling the tool; never call it with placeholders).

**Checkpoint**: US1 and US2 both work independently.

---

## Phase 5: User Story 3 - General F1 knowledge & follow-ups (Priority: P3)

**Goal**: Answer general F1 questions (rules/history/background) and conversational follow-ups.

**Independent Test**: Ask how points are scored (answered with no tool call); then ask a follow-up that depends on the prior turn ("and who was second?") → handled using context.

- [X] T018 [US3] Verify/tune `src/services/assistant/systemInstruction.js` so general F1 knowledge is answered directly and out-of-range *data* requests return the "data covers 2023–2025" message rather than a fabricated figure.
- [X] T019 [US3] Confirm multi-turn context in `src/hooks/useAssistantChat.js`: the full message history is sent on every turn so follow-ups resolve against earlier answers (no change if already correct).

**Checkpoint**: All three stories work independently.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T020 [P] Failure handling: surface a clear in-chat error and preserve the conversation on a Gemini/data failure or missing key (FR-015) in `src/hooks/useAssistantChat.js` / `ChatPanel.jsx`; confirm assistant requests never trigger `GlobalLoadingOverlay` (Gemini bypasses TanStack; all OpenF1 handler fetches are tagged `meta:{background:true}`).
- [X] T021 [P] Responsive + theming pass for `AssistantLauncher.module.scss` / `ChatPanel.module.scss`: usable on mobile, legible in both Salt themes, dismissible, and never permanently covering page content (FR-016/017); colors from Salt tokens only.
- [X] T022 [P] Add a brief `@google/genai` mental-model note where the function-calling loop lives (`src/hooks/useAssistantChat.js`) per Constitution Article VII.
- [X] T023 Run the [quickstart.md](./quickstart.md) acceptance walk-through end-to-end (launcher, data Q&A, season-independence, out-of-range, general knowledge, report flow, failure).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — start immediately.
- **Foundational (Phase 2)**: depends on Setup — **blocks all user stories**.
- **User Stories (Phase 3–5)**: all depend on Foundational. US1 is the MVP; US2 and US3 build on the same loop but are independently testable.
- **Polish (Phase 6)**: after the desired stories are complete.

### User Story Dependencies

- **US1 (P1)**: after Foundational. No dependency on US2/US3.
- **US2 (P2)**: after Foundational. Reuses `f1Resolvers.js` (T011, created in US1) — if US2 is built first, create T011 as its prerequisite. Otherwise independent.
- **US3 (P3)**: after Foundational. Largely emergent from the system prompt + history authored in Phase 2; lightest story.

### Within Each Story

- Resolvers/services before tool registration; tool registration before verification.
- `tools.js` is the shared integration point — US1 adds the data tools, US2 adds the report tool (additive, non-conflicting edits).

### Parallel Opportunities

- T002 runs parallel to T001.
- Foundational: T003, T004, T005, T007 are `[P]` (distinct files); T006 needs T003–T005; T008→T009→T010 are sequential (composition chain).
- US1: T011 `[P]`; US2: T015 `[P]`; both depend only on the resolver/util layer.

---

## Parallel Example: Foundational

```text
# Launch the independent service + leaf-component files together:
Task: "Create src/services/assistant/gemini.js"            (T003)
Task: "Create src/services/assistant/systemInstruction.js" (T004)
Task: "Create src/services/assistant/tools.js skeleton"    (T005)
Task: "Create src/components/assistant/ChatMessage.jsx"    (T007)
# Then T006 (hook) → T008 (panel) → T009 (launcher) → T010 (mount) in order.
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 Setup → 2. Phase 2 Foundational → 3. Phase 3 US1 → **stop and validate** via quickstart (data Q&A + season-independence) → demo. This is the MVP.

### Incremental Delivery

1. Setup + Foundational → chat shell answers general questions.
2. + US1 → grounded F1 data Q&A with links (MVP).
3. + US2 → guided telemetry report download.
4. + US3 → polished general-knowledge + follow-ups.
5. Polish pass.

---

## Notes

- `[P]` = different files, no incomplete dependencies.
- The Gemini key ships client-side (`VITE_GEMINI_API_KEY`); restrict it by HTTP referrer (quickstart §1). Worst case of exposure is rate-limit abuse, not cost.
- Keep all OpenF1 access in handlers routed through `queryClient.fetchQuery` over `openF1Api` with `meta:{background:true}` — never raw `fetch` (Constitution Article IV), and never anything that the global loading overlay would count.
- Commit after each task or logical group; validate each checkpoint before moving on.
