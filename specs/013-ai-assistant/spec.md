# Feature Specification: AI Assistant

**Feature Branch**: `013-ai-assistant`

**Created**: 2026-06-21

**Status**: Draft

**Input**: User description: "Going into phase 2 of the app, the AI assistant which users can use to quickly get answers to their queries. When users type any query such as 'Who won the 2025 Monaco GP' the assistant must answer with the appropriate race winner. Users can ask any query for that F1 season. The season selected on the navbar must not restrict the assistant. The user should also be able to download the telemetry report for the 2 drivers through the assistant, but before that the assistant must ask the GP name, session, drivers and lap for which the report must be downloaded. User can ask any query related to the 2023, 2024 and 2025 season."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask a natural-language F1 question and get the right answer (Priority: P1)

As an F1 fan, I want to open a small chat assistant from anywhere in the app and ask a plain-English question — like "Who won the 2025 Monaco GP?" — and get the correct, concise answer, so I don't have to navigate menus to find a fact.

**Why this priority**: This is the core promise of the feature and the user's primary example. With only this, the assistant already delivers standalone value as a fast question-answering surface.

**Independent Test**: From any page, open the assistant, ask a factual question about a 2023/2024/2025 race (winner, podium, pole, standings, fastest lap, pit stops), and confirm the answer is correct and matches the app's data.

**Acceptance Scenarios**:

1. **Given** any page of the app, **When** the user looks at the bottom-right, **Then** a floating assistant icon is visible.
2. **Given** the assistant icon, **When** the user clicks it, **Then** a small chat window opens anchored to the bottom-left of the screen, and clicking the icon again (or a close control) dismisses it.
3. **Given** the open chat, **When** the user asks "Who won the 2025 Monaco GP?", **Then** the assistant replies with the correct race winner.
4. **Given** a question that maps to data the app already has a page for, **When** the assistant answers, **Then** the answer includes a link to that page (e.g. the session, driver, or telemetry page).
5. **Given** the navbar season is set to 2025, **When** the user asks a question about the 2023 season, **Then** the assistant answers the 2023 question correctly — the navbar season does not restrict it.

---

### User Story 2 - Guided download of a two-driver telemetry report (Priority: P2)

As a user, I want to ask the assistant for a telemetry report comparing two drivers, and have it walk me through choosing the GP, session, drivers, and lap before it generates a downloadable report, so I get exactly the comparison I meant without leaving the chat.

**Why this priority**: A distinct, explicitly requested capability that turns the assistant into a task tool, not just a Q&A box. It builds on P1's conversation surface but adds real value on its own.

**Independent Test**: Ask the assistant to "download a telemetry report". Confirm it asks for the GP, session, drivers, and lap (in any order, prompting for whatever is missing), and once all four are provided and valid, it delivers a downloadable report covering those drivers for that GP/session/lap.

**Acceptance Scenarios**:

1. **Given** the open chat, **When** the user requests a telemetry report without details, **Then** the assistant asks for the GP, session, driver(s), and lap before generating anything.
2. **Given** the user has supplied some but not all of those details, **When** the assistant responds, **Then** it asks only for the still-missing details.
3. **Given** all four details are provided and valid, **When** the user confirms, **Then** the assistant delivers a downloadable telemetry report for the chosen GP, session, driver(s) and lap.
4. **Given** a requested detail is invalid or unavailable (e.g. a driver who didn't run that session, or a lap with no telemetry), **When** the assistant detects it, **Then** it tells the user what's wrong and asks them to adjust, rather than producing an empty or misleading report.

---

### User Story 3 - Broader F1 knowledge and conversational follow-ups (Priority: P3)

As a fan, I want to ask general F1 questions (rules, history, driver/team background) and ask natural follow-ups in the same conversation, so the assistant feels like a knowledgeable companion rather than a one-shot lookup.

**Why this priority**: Expands usefulness beyond the OpenF1 dataset and makes the experience conversational, but the data Q&A (P1) and the report flow (P2) deliver the core value first.

**Independent Test**: Ask a general F1 question not covered by the dataset (e.g. how points are scored, or who a driver drove for before 2023), then ask a follow-up that depends on the previous turn, and confirm both are handled coherently.

**Acceptance Scenarios**:

1. **Given** the open chat, **When** the user asks a general F1 knowledge question, **Then** the assistant answers from general F1 knowledge.
2. **Given** an answer about the 2023–2025 seasons, **When** the user asks a follow-up like "and who was second?", **Then** the assistant uses the earlier context to answer.
3. **Given** the user asks about a season outside 2023–2025 for *data* (e.g. "fastest lap of the 2021 British GP"), **When** the assistant responds, **Then** it clearly states its verifiable data covers 2023–2025 rather than inventing a figure.

### Edge Cases

- **Ambiguous query** (e.g. "Who won Monaco?" with no year): the assistant asks which season before answering.
- **Out-of-coverage data** (pre-2023 results, lap times, telemetry): the assistant states the supported data range (2023–2025) instead of fabricating; it may still offer general knowledge where appropriate.
- **No data for a valid selection** (e.g. a session with no telemetry, or a DNF driver): the assistant explains rather than erroring.
- **Off-topic / non-F1 question**: the assistant stays on its F1 purpose and politely redirects.
- **Service unavailable / network failure** (AI service or data API): the assistant shows a clear error and keeps the conversation so the user can retry.
- **Rate limits**: heavy data lookups stay within the app's existing request pacing and never crash the chat.
- **Report request for a single driver**: handled (one or two drivers supported); the two-driver comparison is the primary case.
- **Reopening the chat**: the conversation from the current browser session is still there; it is not persisted across reloads.
- **Small viewports**: the icon and chat window remain usable on mobile without covering the whole screen permanently.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST display a persistent floating assistant icon at the bottom-right of every page.
- **FR-002**: Activating the icon MUST open a chat window anchored to the bottom-left of the screen; the user MUST be able to dismiss it and reopen it.
- **FR-003**: The user MUST be able to type a free-text question and receive a relevant answer in the chat.
- **FR-004**: For data-backed questions, answers MUST be grounded in the app's F1 data for the 2023, 2024, and 2025 seasons.
- **FR-005**: The assistant MUST answer questions for any supported season regardless of the season currently selected in the navbar.
- **FR-006**: When a data question targets a season outside 2023–2025, the assistant MUST clearly state the supported data range instead of returning a fabricated answer.
- **FR-007**: The assistant MAY answer general F1 knowledge questions (rules, history, background) that fall outside the OpenF1 dataset.
- **FR-008**: When a query is ambiguous (e.g. a missing season or event), the assistant MUST ask a clarifying question before answering.
- **FR-009**: When an answer corresponds to an existing app page, the assistant SHOULD include a link to that page.
- **FR-010**: The assistant MUST support a guided flow that, before generating a telemetry report, collects the GP/event, session, driver(s), and lap.
- **FR-011**: The telemetry report MUST cover one or two drivers (the requested two-driver comparison being the primary case) for the specified GP, session, and lap.
- **FR-012**: If a required report detail is missing, the assistant MUST prompt only for the missing detail(s); if a provided detail is invalid or unavailable, it MUST explain and ask the user to adjust rather than produce an invalid report.
- **FR-013**: On a complete, valid selection, the assistant MUST deliver the telemetry report as a downloadable file.
- **FR-014**: The assistant MUST retain conversation context across turns within a session to support follow-up questions and the multi-step report flow.
- **FR-015**: On an AI-service or data failure, the assistant MUST show a clear error and preserve the conversation so the user can retry.
- **FR-016**: The assistant icon and chat window MUST be usable on both desktop and mobile layouts.
- **FR-017**: The chat window MUST NOT permanently obscure the underlying page's primary content; it MUST be dismissible at any time.

### Key Entities *(include if feature involves data)*

- **Conversation**: the ordered exchange of user and assistant messages within a browser session; provides the context for follow-ups and the report flow.
- **Message**: a single turn — the user's text, or the assistant's text answer with optional links to app pages.
- **Query Intent**: what the user is trying to do — a data lookup, a general-knowledge question, or a telemetry-report request — used to route the response.
- **Telemetry Report Request**: the four details required before a report can be produced — GP/event, session, driver(s) (one or two), and lap.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Across a representative set of factual 2023–2025 data questions (race winners, podiums, pole, standings, fastest laps, pit stops), at least 90% return an answer that matches the app's data.
- **SC-002**: 100% of in-scope questions return the same correct answer regardless of the navbar season selection (season selection never changes a data answer).
- **SC-003**: A user can go from opening the chat to a downloaded telemetry report in under 2 minutes, being prompted for any of the GP, session, drivers, or lap they omit.
- **SC-004**: The assistant icon is reachable from 100% of the app's pages in a single action.
- **SC-005**: 100% of data requests for seasons outside 2023–2025 produce a clear "supported range" response rather than a fabricated figure.
- **SC-006**: When the AI or data service fails, 100% of the time the conversation is preserved and the user can retry without re-typing.
- **SC-007**: A typical question returns a first answer within about 10 seconds under normal conditions.

## Assumptions

- The feature relies on an external AI capability for natural-language understanding and general F1 knowledge; provisioning, credentials, and cost handling are deferred to the planning phase.
- Data-backed answers use the app's existing OpenF1 data source (2023–2025); no new data source is introduced, and data lookups respect the app's existing request pacing.
- The downloadable telemetry report reuses the app's existing lap-summary report format (the same output produced from the telemetry comparison view).
- The conversation lives for the current browser session only; there is no server-side persistence, accounts, or cross-device history (consistent with the rest of the app).
- One or two drivers are supported in a report, mirroring the existing two-driver telemetry comparison; two drivers is the primary scenario the user described.
- The assistant is scoped to Formula 1; non-F1 questions are politely redirected.
- The user referred to this as "phase 2"; the project plan tracks the AI assistant under its AI phase. The label does not affect scope.
