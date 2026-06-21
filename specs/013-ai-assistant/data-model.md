# Data Model: AI Assistant

All entities are **client-side, in-memory** for the browser session. Nothing is persisted.

## Conversation

The ordered exchange for the current session.

| Field | Type | Notes |
|---|---|---|
| `messages` | `Message[]` | Append-only within the session; reset on reload. |

## Message

One turn in the chat.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Local unique id. |
| `role` | `"user" \| "assistant"` | Tool calls/results are internal to the send loop and not rendered as messages. |
| `text` | string | Rendered content; grows while streaming. |
| `links` | `PageLink[]` | Optional; links to existing app pages (FR-009). |
| `status` | `"streaming" \| "done" \| "error"` | Drives the composer/disabled state and error display. |

### PageLink

| Field | Type | Notes |
|---|---|---|
| `label` | string | e.g. "2025 Monaco GP — Race". |
| `to` | string | In-app route, e.g. `/sessions/:key`, `/drivers/:slug`, `/telemetry`. |

## ToolCall / ToolResult (internal to the send loop)

Not part of the rendered conversation; consumed by `useAssistantChat` while resolving a turn.

| Field | Type | Notes |
|---|---|---|
| `name` | string | Must match a declared tool (see contracts/tools.md). |
| `args` | object | Validated against the tool's parameter schema by Gemini. |
| `result` | object | JSON returned to the model as a `functionResponse`. |
| `isError` | boolean | True when the handler couldn't satisfy the call (no data, bad combo). |

## QueryIntent (conceptual)

Not stored — it's how the model routes a turn: `data_lookup` (→ tool call), `general_knowledge` (→ direct answer), or `report_request` (→ gather fields, then `download_telemetry_report`).

## TelemetryReportRequest

The four details required before a report can be produced (FR-010/011/012).

| Field | Type | Required | Validation |
|---|---|---|---|
| `year` | 2023 \| 2024 \| 2025 | yes | In supported range. |
| `grandPrix` | string | yes | Resolvable to a meeting for that year. |
| `session` | string | yes | A session that exists for that meeting (e.g. Race, Qualifying). |
| `drivers` | string[] | yes | 1–2 drivers; each ran that session. Two is the primary case. |
| `lap` | number \| "fastest" | yes | Lap exists and has telemetry for the selected driver(s). |

**State**: the model collects missing fields conversationally; the handler validates the resolved combo and returns an actionable error (which field is wrong) rather than producing an empty report.

## AssistantConfig

| Field | Source | Notes |
|---|---|---|
| `model` | constant | Current Gemini Flash model id. |
| `apiKey` | `import.meta.env.VITE_GEMINI_API_KEY` | Client-side; see research.md §2. |
| `systemInstruction` | constant | Scope, season-independence, data range, link behaviour, report flow. |
