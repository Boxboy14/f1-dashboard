# Research: AI Assistant

All decisions below resolve the Technical Context. No `NEEDS CLARIFICATION` remain.

## 1. AI provider & model

**Decision**: Google **Gemini Flash** (current Flash model — confirm the exact ID in Google AI Studio, e.g. `gemini-2.5-flash`), via the `@google/genai` JS SDK.

**Rationale**: Free tier with no credit card (~10–15 req/min, ~1,500 req/day on Flash), native function calling, streaming, 1M context, mature JS SDK. The earlier Anthropic plan was dropped because it is paid and the owner can't carry the bill.

**Alternatives considered**:
- **Anthropic Claude** — best tool-use, but paid. Rejected on cost.
- **Groq (Llama 3.3 70B)** — free, very fast, function calling, OpenAI-compatible `groq-sdk`. Kept as the **fallback** if Gemini limits bite. Lower daily quota (~1,000 req/day), open models only.
- **OpenRouter / Cerebras** — viable backstops; not needed for v1.

**Privacy note**: Gemini's free tier may use prompts to improve their models. Acceptable here — all content is public F1 trivia, nothing sensitive.

## 2. Key handling (client-side, no backend)

**Decision**: Ship the key as a client-side `VITE_GEMINI_API_KEY`, read in `src/services/assistant/gemini.js`. No backend/proxy.

**Rationale**: A *free* key carries no billing risk — the worst case of exposure is rate-limit abuse, not money. This mirrors the EmailJS pattern (feature 012, `VITE_EMAILJS_*`) and keeps the app's "no backend" architecture intact, which is what the owner wants.

**Mitigation**: Restrict the key in the Google Cloud console to the app's HTTP referrer(s) so a leaked key can't be used from other origins.

**Alternative considered**: A lightweight serverless proxy (Vercel/Netlify/Cloudflare function) holding the key server-side. Rejected for v1 (adds a backend the project doesn't have); documented as the upgrade path if the key gets abused.

## 3. Architecture: function-calling loop

**Decision**: The assistant is a tool-use loop, not a plain chat call.

1. User text + tool declarations → Gemini (`ai.models.generateContentStream`).
2. If the response contains `functionCall` parts, the app runs the matching handler and appends a `functionResponse` part.
3. Loop until the model returns a final text answer; stream that to the UI.

**Mental model (Article VII)**: Gemini doesn't *know* F1 results — it decides *which question to ask* the data layer. The app is the executor; OpenF1 is the source of truth. General-knowledge questions need no tool call.

## 4. Tool granularity: fat intent tools

**Decision**: A small set of purpose-built tools that each encapsulate multi-step OpenF1 resolution, rather than thin 1:1 endpoint tools.

**Rationale**: Gemini free tier is ~10–15 req/min. Thin tools (get_meetings → get_sessions → get_session_result) would cost 3+ model round-trips per question and risk hitting the rate limit. Fat tools resolve internally (GP name + year → meeting → session → result) in one model round-trip and fewer OpenF1 calls. Also more deterministic. (Tool set listed in [contracts/tools.md](./contracts/tools.md).)

## 5. OpenF1 access from tool handlers

**Decision**: Handlers fetch via `queryClient.fetchQuery({ queryKey, queryFn: () => openF1Api.X(...), staleTime, meta: { background: true } })`.

**Rationale**: Tool handlers run inside the async send loop, **not** in React render, so they can't use the `useOpenF1` hooks. Routing through `queryClient.fetchQuery` still (a) reuses the existing TanStack cache the pages already populated (Article IV: don't duplicate calls), (b) goes through `openF1Api` and the rate limiter, and (c) tagging `meta: { background: true }` keeps these fetches out of the `GlobalLoadingOverlay` (its predicate excludes `meta.background`) so the assistant never freezes the page.

**Alternative**: call `openF1Api.*` directly. Simpler but bypasses the shared cache. Rejected to honour "never make the same API call from two places."

## 6. Telemetry report

**Decision**: A new imperative `buildAndDownloadReport({ year, grandPrix, session, drivers, lap })` in `src/services/assistant/telemetryReport.js` that resolves the session, fetches each driver's laps + the fastest/selected lap's `carDataLap` window + `stints`, builds `chartData` with the existing pure utils (`deriveDistance`, `resampleToGrid`, `mergeDrivers` from `src/utils/telemetry.js`), then calls `buildLapSummary` ([lapSummary.js](../../src/utils/telemetry/lapSummary.js)) → `downloadLapSummary` ([lapSummaryPdf.js](../../src/utils/telemetry/lapSummaryPdf.js)).

**Rationale**: `useTelemetryComparison` is a hook and can't run in the tool loop. This reuses every pure transform and the entire PDF renderer — only the fetch orchestration is new (mirrors what the hook does imperatively).

**Alternative**: deep-link to `/telemetry` with prefilled params and let the user click the existing Download button. Rejected — FR-013 requires the assistant to deliver the file directly. (A deep-link can still accompany the download as a "view the full comparison" link.)

## 7. Streaming

**Decision**: `ai.models.generateContentStream` for the final answer so tokens render live. Because the Gemini call bypasses TanStack Query entirely, it is inherently excluded from the global loading overlay (FR: not counted).

## 8. Season independence & knowledge scope

**Decision**: Every data tool takes an explicit `year` argument. The system instruction tells the model to read the year from the *question* and ignore the navbar season; to ground 2023–2025 answers in tool calls; to answer general F1 knowledge directly; and to state the supported data range (2023–2025) instead of fabricating when asked for out-of-range *data* (FR-004/005/006/007/008). Where an answer maps to an app page, the model emits a link (FR-009) — see the link contract in [contracts/assistant-interfaces.md](./contracts/assistant-interfaces.md).

## 9. Conversation state

**Decision**: `useAssistantChat` holds the message array in component state. The API is stateless, so the full turn history is sent each request (FR-014). Not persisted across reloads (matches spec assumption).
