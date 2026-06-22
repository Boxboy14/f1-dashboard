# Data Model: How to Use Guide

This feature has no persisted or fetched data — "entities" here describe the shape of the static content module (`src/components/tabs/how-to-use/guideContent.js`), not database or API records.

## GuideSection

Represents one collapsible accordion entry for a main tab.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Stable key for the accordion item, e.g. `"overview"`, `"drivers"`. |
| `title` | string | Section heading shown in the accordion header, e.g. `"Overview"`. |
| `description` | string | Plain-language summary of what the tab shows. No technical terms (FR-007). |
| `controls` | string[] | Bullet points describing the tab's interactive controls in plain language (e.g. "Pick a season from the top-right menu to see that year's data."). |
| `interactionTip` | string \| null | Populated only for tabs where a row can be double-clicked (Drivers, Teams, Calendar); states what double-clicking reveals (FR-004). `null` for tabs without this behavior (Overview, Telemetry). |

One `GuideSection` exists for each of: Overview, Drivers, Teams, Calendar, Telemetry. A sixth, short entry for Feedback (per spec Assumptions — one-line mention) may reuse the same shape with `controls: []` and `interactionTip: null`.

## AssistantGuide

Represents the single AI Assistant section. Kept as a distinct shape (not a `GuideSection`) because its content has a different structure — capabilities + limitations + a numbered procedure — rather than a flat description + control list.

| Field | Type | Notes |
|---|---|---|
| `location` | string | Plain-language description of where the chat icon appears and how to open it. |
| `capabilities` | string[] | What kinds of questions it answers (race data 2023–2025, general F1 knowledge). |
| `limitations` | string[] | What it won't do / will decline (out-of-range seasons, live sessions) — satisfies FR-005's "say so rather than guess" requirement. |
| `telemetryReportSteps` | string[] | Ordered steps a user follows to request the two-driver telemetry report (Grand Prix → session → two drivers → lap) — satisfies FR-006. |

## Relationships / State

None — both shapes are static, read-only data consumed by a single render pass in `HowToUseGuide.jsx`. No state transitions, no validation rules beyond "every `GuideSection` for a tab that supports double-click must have a non-null `interactionTip`," which is enforced by content review, not runtime code (this is presentational copy, not user input).
