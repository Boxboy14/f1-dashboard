# Contract: Service, Hook & Component Interfaces

## Service — `src/services/assistant/gemini.js`

```js
// Reads VITE_GEMINI_API_KEY; throws a friendly error if unset (mirrors emailjs.js).
// history: Gemini `contents` array. tools: functionDeclarations.
// Yields streamed text chunks and surfaces any functionCalls for the loop.
export async function* streamTurn({ history, tools, systemInstruction }) { /* ... */ }
```

- Uses `new GoogleGenAI({ apiKey })` and `ai.models.generateContentStream({ model, contents, config: { systemInstruction, tools } })`.
- The model id is the current Gemini Flash (confirm in AI Studio).
- Isolated here so no other module imports `@google/genai` (Article IV boundary, like `emailjs.js`).

## Service — `src/services/assistant/tools.js`

```js
export const functionDeclarations = [ /* see contracts/tools.md */ ];
export const handlers = { get_race_result, get_championship_standings, /* ... */ download_telemetry_report };
```

## Service — `src/services/assistant/telemetryReport.js`

```js
// Resolves session + drivers + lap, fetches laps/carDataLap/stints via queryClient,
// builds chartData with existing utils, then buildLapSummary -> downloadLapSummary.
export async function buildAndDownloadReport({ queryClient, year, grandPrix, session, drivers, lap }) { /* ... */ }
```

## Hook — `src/hooks/useAssistantChat.js`

```js
const {
  messages,        // Message[]
  isStreaming,     // boolean — disables composer, no global overlay involvement
  sendMessage,     // (text: string) => void  — runs the stream + tool loop
  error,           // last error or null
} = useAssistantChat();
```

- Owns the conversation array and the function-calling loop (stream → functionCall → handler → functionResponse → repeat → final text).
- Uses `useQueryClient()` so handlers can `fetchQuery` (cache reuse + rate limiter + `meta:{background:true}`).
- Never registers a `useQuery`/`useMutation` that the `GlobalLoadingOverlay` would count.

## Components — `src/components/assistant/`

- **`AssistantLauncher.jsx`** — fixed bottom-right Salt `Button` (chat icon); toggles the panel; mounted once in `App.jsx`. Visible on every route (FR-001), usable collapsed/expanded sidebar and on mobile (FR-016).
- **`ChatPanel.jsx`** — fixed bottom-left Salt `Card`: scrollable message list + `MultilineInput` composer + send `Button` + close control. Dismissible at any time and does not permanently cover content (FR-002/017).
- **`ChatMessage.jsx`** — one bubble; renders assistant text and any `PageLink`s as React Router `<Link>`/Salt `Link` (FR-009).

**Styling**: Salt components + tokens throughout; only the two fixed-position wrappers use custom SCSS module CSS (Salt has no chat-panel primitive). Both light/dark themes must stay legible (Article VI).
