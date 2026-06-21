# Contract: UI

## Route

- **Path**: `/feedback`
- Registered as a child route of `DashboardLayout` in `App.jsx` (so Navbar + Sidebar remain visible).
- Element: `FeedbackPage`.
- Reachable directly by URL (US1 entry independence / Edge Case).

## Sidebar entry point

- Label **"Feedback"**, icon (Salt `MessageIcon` or similar), pinned to the **bottom** of the sidebar, above the collapse-button footer.
- Visible on every page (FR-001) in both expanded and collapsed states; collapsed rail shows a tooltip with the label (FR-002).
- Active highlight when `pathname` matches `/feedback`, via the existing `isPathActive` / `match` mechanism (FR-010), consistent with other nav items.
- Selecting it navigates to `/feedback`, preserving the current `?year=` param like the other items.

## FeedbackPage

- Heading: `Text styleAs="h1"` → e.g. "Send Feedback" with a short subtitle explaining the form is for improvement ideas / future enhancements.
- Renders `FeedbackForm`.

## FeedbackForm — fields & states

Fields (Salt):

| Field | Component | Notes |
|---|---|---|
| Name | `FormField` + `Input` | required |
| Email | `FormField` + `Input` (type email) | required, format-validated |
| Feedback | `FormField` + `MultilineInput` | required, multi-line, ~5 rows |
| (hidden) honeypot | off-screen text input | bot trap; if filled, silently no-op the submit |

Submit: Salt `Button` (primary), labelled "Send Feedback".

States (driven by `useFeedbackSubmit`):

- **idle** — clean form, submit enabled.
- **validation error** — invalid/empty fields flagged inline via `FormField validationStatus="error"` + helper text; submit blocked (FR-005). Error clears when the field becomes valid.
- **sending** (`isPending`) — submit disabled + "Sending…" affordance (FR-009).
- **success** (`isSuccess`) — visible confirmation (e.g. Salt `Text`/banner) + fields reset (FR-007).
- **error** (`isError`) — visible error message; field values preserved; retry allowed (FR-008).

## Out of scope (v1)

- Draft persistence across navigation, attachments, categories/tags, in-app review screen, captcha (honeypot only).
