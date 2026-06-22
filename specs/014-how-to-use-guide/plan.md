# Implementation Plan: How to Use Guide

**Branch**: `014-how-to-use-guide` | **Date**: 2026-06-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-how-to-use-guide/spec.md`

## Summary

Add a static, plain-language "How to Use" page reachable from a new sidebar entry pinned directly above "Feedback". The page explains each main tab (Overview, Drivers, Teams, Calendar, Telemetry) and the AI Assistant — including the data-table double-click behavior that's otherwise invisible to users — using collapsible Salt DS `Accordion` sections so any one topic can be found without reading the whole page. No data fetching, no new dependencies, no backend involvement: content is a static JS data structure rendered by one new page component, following the existing `FeedbackPage` + `Sidebar.NAV_ITEMS` patterns already in the codebase.

## Technical Context

**Language/Version**: JavaScript (ES2022+), React 19 JSX

**Primary Dependencies**: React Router 7 (new route), `@salt-ds/core` (`Accordion`, `AccordionGroup`, `AccordionHeader`, `AccordionPanel`, `Text`, `H2`/`H3`, `StackLayout`, `Tag` or `Badge` for the double-click callout) — all already in `package.json`; no new dependency added.

**Storage**: N/A — content is a static, hand-authored JS array, not fetched or persisted.

**Testing**: No automated test runner is configured in this project (`package.json` has no test script). Verification is manual (dev server walkthrough) plus `npm run lint`.

**Target Platform**: Web browser, same responsive dashboard shell as every other page (desktop + collapsed/mobile sidebar).

**Project Type**: Single-page React SPA (existing structure — no new project type).

**Performance Goals**: N/A — static content, no network calls, negligible render cost.

**Constraints**: Must not reference any technical/implementation terms in the rendered copy (FR-007); must render with zero prerequisite state — no season selection, no API data (FR-009).

**Scale/Scope**: One new route, one new page component, one new content-data module, six guide sections (five tabs + AI Assistant), one new sidebar nav entry.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Article | Check | Result |
|---|---|---|
| I. Spec-First | `spec.md` exists and was reviewed before this plan | ✅ Pass |
| II. API-First Design | No OpenF1 endpoint is used by this feature — purely static content | ✅ N/A, no violation |
| III. Component Isolation | New page lives in its own file/folder, owns no shared mutable state; reads no cross-page state | ✅ Pass |
| IV. Data Layer Discipline | No API calls, so no `useQuery`/`staleTime` concerns | ✅ N/A, no violation |
| V. Clean Code | Content extracted to a plain data array (no premature abstraction beyond what's already a Sidebar pattern); no dead code | ✅ Pass |
| VI. UI Consistency | Built entirely from Salt DS components (`Accordion`, `Text`, `StackLayout`); no raw HTML where Salt has an equivalent; no raw hex colors | ✅ Pass |
| VII. Learning Is a First-Class Goal | `Accordion` is new to this codebase — implementation step must include the Rule 3 library walkthrough (what/why/how/key concept/gotchas) before/with the code | ✅ Pass (tracked as an implementation task, not a plan violation) |

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/014-how-to-use-guide/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
└── tasks.md              # Phase 2 output (/speckit-tasks — not created by this command)
```

No `contracts/` directory: this feature exposes no API, CLI, or other external interface — it is a static presentational page consumed only by the browser UI. Contracts are N/A.

### Source Code (repository root)

Single-project React SPA — extends the existing `src/components/dashboard/` (pages) + `src/components/tabs/<feature>/` (feature-specific content) structure already used by every other tab, most directly mirroring `FeedbackPage.jsx` + `src/components/tabs/feedback/FeedbackForm.jsx`.

```text
src/
├── App.jsx                                    # add: <Route path="how-to-use" element={<HowToUsePage />} />
├── components/
│   ├── dashboard/
│   │   ├── Sidebar/
│   │   │   └── Sidebar.jsx                    # add HOW_TO_USE_ITEM, rendered above FEEDBACK_ITEM in bottomNav
│   │   ├── HowToUsePage.jsx                    # new — page shell (Text h1 + subtitle + <HowToUseGuide />), mirrors FeedbackPage.jsx
│   │   └── HowToUsePage.module.scss            # new — page-level layout styles, mirrors FeedbackPage.module.scss
│   └── tabs/
│       └── how-to-use/
│           ├── guideContent.js                 # new — static data: GUIDE_SECTIONS array (one entry per tab) + ASSISTANT_GUIDE object
│           └── HowToUseGuide.jsx               # new — renders GUIDE_SECTIONS + ASSISTANT_GUIDE as Salt AccordionGroup sections
```

**Structure Decision**: Reuse the established two-layer page pattern (thin page shell under `dashboard/`, feature content under `tabs/<feature>/`) rather than inventing a new layout. Content lives in a plain data array (`guideContent.js`) so the JSX in `HowToUseGuide.jsx` stays a simple `.map()` over sections — consistent with how `Sidebar.jsx` already drives its nav from a `NAV_ITEMS` array — and so future copy edits never touch component structure.

## Complexity Tracking

No Constitution Check violations — table not needed.
