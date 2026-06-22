# Research: How to Use Guide

No `[NEEDS CLARIFICATION]` markers were present in the Technical Context — this feature reuses the existing stack end to end. The decisions below record *why* each choice was made, for the record.

## Decision: Salt DS `Accordion` for per-tab sections

**Rationale**: FR-008 requires a user to find one tab's help without reading the whole page. `Accordion`/`AccordionGroup` (already shipped in `@salt-ds/core@1.54.1`, no new dependency) gives collapsible, independently-labeled sections out of the box, satisfying Constitution Article VI (Salt-first UI) without custom disclosure-widget code.

**Alternatives considered**:
- **Salt `Tabs`** — rejected. Tabs imply switching between mutually-exclusive views; this content is more naturally a single scannable list a user skims top to bottom, and tabs would hide the table-of-contents effect of seeing all six section headings at once.
- **Plain scrolling sections with anchor links** — rejected. Works, but every other "expand for detail" pattern in this app (driver/team detail panels) already trains users to expect a click-to-reveal interaction; plain accordion is the closer fit and needs zero extra anchor/scroll-spy logic.

## Decision: Static JS data array, not fetched/persisted content

**Rationale**: FR-009 requires the page to render with no prerequisite state (no season, no API call). Modeling guide content as a plain exported array (`GUIDE_SECTIONS`) mirrors the existing `NAV_ITEMS` constant in `Sidebar.jsx` — same codebase idiom, zero new state management, trivially editable copy.

**Alternatives considered**:
- **CMS-style fetched content** — rejected as over-engineered for six static paragraphs that change only when the product itself changes; would violate Article V (no premature abstraction) and Article IV would force an unnecessary `useQuery` hook with no real backing API.

## Decision: New sidebar entry added to the existing `bottomNav` block, not a second container

**Rationale**: `Sidebar.jsx` already renders `FEEDBACK_ITEM` in a dedicated `bottomNav` block, separate from the main `NAV_ITEMS` list, specifically because Feedback is an auxiliary action, not a data tab. "How to Use" is the same kind of auxiliary, evergreen action — adding it to that same block (rendered before Feedback) satisfies "directly above Feedback" for free and reuses the existing collapsed-sidebar tooltip behavior with no extra code.

**Alternatives considered**:
- **New top-level array + new render block** — rejected; would duplicate the `renderItem` collapsed/tooltip logic that already exists for the bottom block.

## Decision: No automated tests added

**Rationale**: The project has no test runner configured (`package.json` has no `test` script, no Jest/Vitest dependency). Adding one is out of scope for a single static content page. Verification is manual (dev server walkthrough) + the existing `npm run lint` gate.
