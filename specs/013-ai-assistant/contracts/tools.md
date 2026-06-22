# Contract: Gemini Function Declarations & Handlers

Each tool is a `functionDeclaration` passed to Gemini under `config.tools = [{ functionDeclarations: [...] }]`. When the model emits a `functionCall`, `useAssistantChat` runs the matching handler and returns a `functionResponse`. Handlers fetch via `queryClient.fetchQuery(... meta:{ background:true })` over `openF1Api` (see research.md §5).

Tools are **fat/intent-level** to minimise model round-trips (research.md §4). All take an explicit `year` (2023–2025); none read the navbar season.

## Data tools

### `get_race_result`
Winner / podium / full classification for a Grand Prix session.
- **args**: `year` (int, required), `grand_prix` (string, required), `session` (string, optional — defaults to "Race").
- **returns**: `{ year, grand_prix, session, classification: [{ position, driver, team, status }], page: "/sessions/<key>" }`
- **resolves**: `grand_prix`+`year` → meeting → session_key (via `f1Resolvers`), then `session_result` + `drivers`.

### `get_championship_standings`
Driver or constructor standings.
- **args**: `year` (int, required), `type` ("driver" | "constructor", required), `after_round` (int, optional).
- **returns**: `{ year, type, standings: [{ position, name, points, team? }], page: "/drivers" | "/teams" }`

### `get_driver_season`
A driver's season summary (team, points, position, notable results).
- **args**: `year` (int, required), `driver` (string, required — name or number).
- **returns**: `{ year, driver, team, points, position, page: "/drivers/<slug>" }`

### `get_event_schedule`
Calendar / find a Grand Prix for a year (resolves ambiguous "which round / when").
- **args**: `year` (int, required), `grand_prix` (string, optional).
- **returns**: `{ year, events: [{ round, name, country, date_start, status }], page: "/seasons?year=<year>" }`

### `get_session_extras`
Pit stops / fastest lap / pole for a session (covers the "deeper" race-detail questions).
- **args**: `year` (int, required), `grand_prix` (string, required), `session` (string, optional), `kind` ("pit_stops" | "fastest_lap" | "pole", required).
- **returns**: shape depends on `kind`; always includes `page: "/sessions/<key>"`.

## Action tool

### `download_telemetry_report`
Gathers the four required fields, then builds and downloads the report.
- **args**: `year` (int, required), `grand_prix` (string, required), `session` (string, required), `drivers` (string[], required, 1–2), `lap` (int | "fastest", required).
- **behaviour**: validates the resolved combo; on success calls `buildAndDownloadReport(...)` (triggers the file download) and returns `{ ok: true, summary, page: "/telemetry" }`. On any missing/invalid field returns `{ ok: false, problem, missing?: [...] }` so the model asks the user to adjust (FR-012).

## Handler contract (all tools)

- Return **plain JSON** (no React, no hooks).
- On "no data for a valid request" (e.g. session has no telemetry, driver DNF) return `{ ok: false, problem }` — never throw for expected gaps.
- Network/parse failures propagate as `isError: true` so the model can apologise and the user can retry (FR-015).
- Every successful data result includes a `page` route so the model can satisfy the link requirement (FR-009).
