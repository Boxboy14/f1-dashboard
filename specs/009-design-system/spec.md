# Feature Specification: App Design System — Typography, Color Scheme & Theme Switch

**Feature Branch**: `009-design-system`

**Created**: 2026-06-14

**Status**: Draft

**Input**: User description: "Set a global color scheme, global font sizes and a common font for the entire app. Currently styles are inconsistent (e.g. the telemetry driver name and the track-dominance area use different fonts). Use Roboto. Categorize headers — each tab's page header a fixed, readable size; sub-headers a bit smaller. Add a dark/light theme switch in the navbar. Red + white/black scheme depending on theme, red used sparingly; minimalistic, pleasing, not too colorful."

## User Scenarios & Testing *(mandatory)*

The app's styling has grown inconsistently — different fonts and ad-hoc sizes appear across pages, so it doesn't feel like one product. This feature establishes a single design system applied app-wide: one common font, a defined set of text sizes with a clear header hierarchy, a restrained red-and-neutral color scheme, and a dark/light theme the user can switch from the navbar. The result is a consistent, minimal, pleasant look on every tab.

### User Story 1 - Consistent typography everywhere (Priority: P1)

Every screen uses **one common font** and a **defined size hierarchy**. A fan moving between tabs sees the same typeface and consistent heading sizes — the telemetry driver name, the track-dominance heading, the calendar grid, and the overview cards all share the same font family and scale, instead of today's mismatched fonts.

**Why this priority**: This is the core complaint and the foundation everything else sits on. It delivers immediate, visible consistency without needing color or theming changes.

**Independent Test**: Visit each tab and inspect headings and body text. Confirm one font family throughout, and that headings follow a single, repeated size hierarchy (page header largest, sub-headers smaller) — no element using a different font or an off-scale size.

**Acceptance Scenarios**:

1. **Given** any page in the app, **When** it renders, **Then** all text uses the one common font (no element falls back to a different typeface).
2. **Given** any two pages, **When** their headers are compared, **Then** the page header is the same size on both, and section/sub-headers follow the same smaller sizes.
3. **Given** the telemetry page specifically, **When** the driver-card name and the track-dominance heading are compared, **Then** they use the same font family and sit on the same type scale (the original inconsistency is gone).
4. **Given** the chosen font cannot load, **When** the page renders, **Then** it falls back gracefully to a standard sans-serif without breaking layout.

---

### User Story 2 - Restrained red-and-neutral color scheme (Priority: P2)

The app adopts a deliberate, minimal palette: neutral surfaces and text carry the design, with **red used only as a small accent** (e.g. the active navigation item, primary actions, key highlights). It reads as clean and intentional, not colorful.

**Why this priority**: Color cohesion makes the app feel finished, but it builds on the typography foundation.

**Independent Test**: Scan each page and count the red elements — red should appear only as sparse accents on interactive/important items, with everything else neutral. The overall impression is minimal and uncluttered.

**Acceptance Scenarios**:

1. **Given** any page, **When** it renders, **Then** the bulk of the surface is neutral and red appears only as occasional accents (active nav, primary buttons, key highlights), not on large areas.
2. **Given** the color scheme, **When** applied, **Then** colors come from one shared, named set (not ad-hoc per-component colors), so the palette is consistent app-wide.
3. **Given** a fan views the app, **When** asked to describe it, **Then** it reads as "minimal/neutral with red accents", not "colorful".

---

### User Story 3 - Dark / light theme switch (Priority: P3)

A control in the navbar lets the fan switch between a **dark** theme (red accents on near-black/neutral-dark surfaces) and a **light** theme (red accents on white/neutral-light surfaces). The choice persists across reloads and sessions; both themes use the same restrained red-and-neutral scheme and remain fully readable.

**Why this priority**: A valuable enhancement, but the themes only make sense once the palette and typography are defined.

**Independent Test**: Toggle the switch in the navbar; confirm the whole app (including charts and the track map) flips between light and dark with readable contrast, and that the choice survives a reload.

**Acceptance Scenarios**:

1. **Given** the navbar, **When** the fan activates the theme switch, **Then** the entire app — every tab, control, chart, and the track map — switches between dark and light.
2. **Given** a theme is selected, **When** the page is reloaded or reopened later in the session, **Then** the same theme is still applied.
3. **Given** either theme, **When** any page is viewed, **Then** text and visualizations have readable contrast (no white-on-white or unreadable chart lines).
4. **Given** a first-time visit with no saved preference, **When** the app loads, **Then** it defaults to the dark theme.

---

### Edge Cases

- **Font fails to load** (network/CDN blocked): fall back to a system sans-serif; the type scale still applies.
- **Light mode + visualizations**: telemetry chart axes/labels and the track map lines must stay readable on a light background (not light-on-light).
- **Theme toggled mid-view**: the switch is instant and must not break layout or lose the user's place.
- **No saved preference**: default to dark.
- **Very long page header text**: the fixed header size must not overflow or distort the layout (truncate/wrap gracefully).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST use a single common font (Roboto, per the user's preference) across every page and component; no element may use a different typeface.
- **FR-002**: The app MUST define a named typographic scale with at least these categories: **page header** (each tab's title), **section header**, **sub-section/card header**, **body**, and **caption/label** — each with a consistent size and weight applied app-wide.
- **FR-003**: Each tab's **page header** MUST be a fixed, comfortably readable size, and **sub-headers MUST be smaller** than the page header, forming a clear and consistent hierarchy on every page.
- **FR-004**: All existing headings across the app MUST be mapped to one of the defined header categories (no ad-hoc heading sizes), resolving the current inconsistencies (e.g. telemetry driver name vs track-dominance heading).
- **FR-005**: The app MUST define a single shared color scheme — neutral base surfaces/text plus a **red accent used sparingly** — and apply it app-wide from one shared source rather than ad-hoc per-component colors.
- **FR-006**: Red MUST be limited to accents (active navigation, primary actions, key highlights); it MUST NOT dominate large surfaces. The overall result MUST read as minimal and neutral.
- **FR-007**: The navbar MUST provide a theme switch toggling between a **dark** theme and a **light** theme, both using the red-and-neutral scheme.
- **FR-008**: Switching the theme MUST update the entire app — all tabs, controls, charts, and the track map — to the selected theme.
- **FR-009**: The selected theme MUST persist across page reloads and within the browser session; first-time visits MUST default to dark.
- **FR-010**: Both themes MUST maintain readable contrast for text and for the data visualizations (telemetry charts, track map), with no theme leaving content unreadable.
- **FR-011**: The design system MUST be the single source of fonts, sizes, and colors so future pages inherit it automatically (one place to change the look).
- **FR-012**: The change MUST be purely visual — no page's data or behavior changes.

### Key Entities *(include if feature involves data)*

- **Typographic scale**: the named set of text categories (page header, section header, sub-header, body, caption) with their sizes and weights.
- **Color scheme**: the named, semantic color set (background, surface, primary/secondary text, borders, red accent) — defined per theme.
- **Theme**: a selectable mode (dark or light) that maps the color scheme to concrete values; includes the persisted user preference.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the app's visible text uses the single common font — a reviewer inspecting any page finds no off-font element.
- **SC-002**: Page headers are identical in size across all tabs, and sub-headers are consistently smaller, following one hierarchy.
- **SC-003**: On any page, red appears only as a small number of accent elements; the page reads as predominantly neutral.
- **SC-004**: A fan can switch dark/light from the navbar and the whole app (including charts and the track map) updates within ~1 second.
- **SC-005**: The selected theme is still applied after a page reload.
- **SC-006**: Both themes pass a basic readability check — body text and chart/map lines are clearly legible in each.
- **SC-007**: The original telemetry inconsistency (driver name vs track-dominance heading) is gone — both share the font and scale.

## Assumptions

- **Roboto via the user-provided Google Fonts source**, with a system sans-serif fallback if it fails to load.
- **This introduces a light theme.** The project was previously dark-only (the constitution states the dark theme is fixed with no light mode in v1); this feature deliberately amends that, so the governance note will be updated during planning.
- **Built on the app's existing theming/design-token mechanism** (the UI kit already supports theming) — extend it rather than introduce a parallel system.
- **Red is the single accent color**; neutrals (near-black/white/grays) carry everything else. No multi-color or per-team theming.
- **Default theme is dark** (matching today's app); the preference is stored locally (no user accounts).
- **App-wide scope**: all tabs, pages, and shared components — the telemetry page is the prompting example, not the limit.
- **Dark theme refinement**: the existing dark theme's colors are brought into the new restrained scheme (not left as-is).

## Out of Scope

- Multiple accent colors, per-team color theming, or a user-customizable theme builder.
- Dedicated high-contrast / accessibility-only themes beyond standard readable contrast.
- Changing any page's content, data, layout structure, or behavior (this is styling only).
- A system-preference ("auto") theme that follows the OS — the switch is a manual toggle (auto-detect may be a later enhancement).
