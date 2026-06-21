# Implementation Plan: AI Assistant

**Branch**: `013-ai-assistant` | **Date**: 2026-06-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/013-ai-assistant/spec.md`

## Summary

A floating AI assistant (launcher bottom-right, chat panel bottom-left, on every page) that answers natural-language F1 questions and produces downloadable two-driver telemetry reports. Data answers are grounded in the existing OpenF1 layer for 2023–2025 via **Gemini function calling**: the model picks a purpose-built tool, the app executes it through the existing `openF1Api` / TanStack Query layer, and the model writes a conversational answer with links to the matching app page. General F1 knowledge comes from the model directly. The telemetry report reuses the existing `buildLapSummary` → `downloadLapSummary` pipeline. The model is **Google Gemini Flash** (free tier) via `@google/genai`; the key is a client-side `VITE_GEMINI_API_KEY` (free key → no billing risk, mirrors the EmailJS pattern, no backend).

## Technical Context

**Language/Version**: JavaScript (ES2022), React 19, Vite

**Primary Dependencies**: `@google/genai` (new) · React Router 7 · TanStack Query v5 · Salt Design System · existing `src/services/api/openf1.js` + `src/hooks/useOpenF1.js` + `src/utils/telemetry/*`

**Storage**: None. Conversation lives in component state for the browser session only; no persistence, no accounts (consistent with the app).

**Testing**: Manual verification via quickstart (project has no automated test suite).

**Target Platform**: Modern browsers, desktop + mobile responsive.

**Project Type**: Client-only single-page web app (no backend).

**Performance Goals**: First answer typically < 10 s (SC-007); streamed token-by-token so the user sees progress immediately.

**Constraints**: Gemini free tier (~10–15 req/min, ~1,500 req/day on Flash); OpenF1 free tier (3 req/sec, 30 req/min) — already paced by `src/services/api/rateLimiter.js`. Minimise Gemini round-trips (fat intent tools, not thin per-endpoint tools).

**Scale/Scope**: Single hobby app, one user at a time per browser. ~3 new components, 1 hook, 1 service folder (~4 modules), 1 new dependency, 1 env var.

## Constitution Check

*GATE: re-checked after Phase 1 design — still passing.*

| Article | Status | Notes |
|---|---|---|
| I. Spec-First | ✅ | `spec.md` written and accepted; this plan precedes code. |
| II. API-First | ✅ | Reuses already-verified OpenF1 endpoints through the existing service; introduces no new endpoint assumptions. Gemini's response shape (`functionCalls`, `functionResponse` parts) documented in [research.md](./research.md). |
| III. Component Isolation | ✅ | Self-contained `src/components/assistant/` folder + own `useAssistantChat` hook + own styles + own `src/services/assistant/` service. No cross-page mutable state; deep-links use URL state. |
| IV. Data Layer Discipline | ✅ | OpenF1 tool handlers go through `queryClient.fetchQuery` reusing `openF1Api` (rate-limited, cache-shared) — **no raw `fetch` in components**. Gemini is a distinct external service isolated in `src/services/assistant/gemini.js`, exactly as EmailJS lives in `src/services/feedback/emailjs.js`. |
| V. Clean Code | ✅ | Purpose-built tools, no premature abstraction; report builder reuses existing pure utils rather than duplicating them. |
| VI. UI Consistency | ✅ | Chat built from Salt primitives (`Button`, `Card`, `Input`/`MultilineInput`, `Text`, `Spinner`). Only the fixed-position floating container is custom CSS (Salt has no chat-panel component) — justified below. Colour from Salt tokens; works in both themes. |
| VII. Learning | ✅ | `@google/genai` gets a library walkthrough at implementation; the function-calling loop mental model is documented in [research.md](./research.md). |

**No violations.** One **documented security trade-off** (not a constitution breach): the Gemini key ships in client JS. Because it is a *free* key, the worst case is rate-limit abuse, not cost — mitigated by an HTTP-referrer restriction on the key (Google Cloud console). See [research.md](./research.md) §Key handling. A serverless proxy remains the upgrade path if abuse occurs.

## Project Structure

### Documentation (this feature)

```text
specs/013-ai-assistant/
├── plan.md              # This file
├── research.md          # Decisions: provider, model, key handling, tool design, report builder
├── data-model.md        # Conversation / Message / ToolCall / TelemetryReportRequest
├── quickstart.md        # Get a Gemini key, set VITE_GEMINI_API_KEY, run, test
├── contracts/
│   ├── tools.md         # Gemini function declarations + handler contracts
│   └── assistant-interfaces.md  # gemini.js / useAssistantChat / component contracts
└── checklists/requirements.md   # (from /speckit-specify)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── assistant/
│       ├── AssistantLauncher.jsx        # floating icon, bottom-right, on every page
│       ├── AssistantLauncher.module.scss
│       ├── ChatPanel.jsx                # bottom-left window: message list + composer
│       ├── ChatPanel.module.scss
│       ├── ChatMessage.jsx              # one bubble; renders text + page links
│       └── ChatMessage.module.scss
├── hooks/
│   └── useAssistantChat.js              # conversation state + send/stream/tool loop
├── services/
│   └── assistant/
│       ├── gemini.js                    # @google/genai client; streamTurn(history, tools)
│       ├── tools.js                     # functionDeclarations[] + handler map
│       ├── f1Resolvers.js               # GP name + year → meeting_key → session_key
│       └── telemetryReport.js           # imperative buildAndDownloadReport(...) reusing utils
└── App.jsx                              # mount <AssistantLauncher /> beside <GlobalLoadingOverlay />

.env.example                             # add VITE_GEMINI_API_KEY
```

**Structure Decision**: Single client-only project (matches the whole app). The assistant is one isolated component folder, one hook, and one service folder — the same shape feature 012 used (`components/tabs/feedback/`, `hooks/useFeedbackSubmit.js`, `services/feedback/`). It mounts globally in `App.jsx` next to `GlobalLoadingOverlay` (not as a route) so it is present on every page (FR-001).

## Phase notes

- **Phase 0 (research)** → [research.md](./research.md): all decisions resolved (provider, model, key handling, tool granularity, OpenF1 access from handlers, report builder, streaming, season-independence, knowledge scope). No open `NEEDS CLARIFICATION`.
- **Phase 1 (design)** → [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md), CLAUDE.md updated.
- **Phase 2 (tasks)** is produced by `/speckit-tasks`, not here.

## Complexity Tracking

No constitution violations to justify. The single notable trade-off (client-side API key) is acceptable for a free-tier key and documented in research.md with its mitigation and upgrade path.
