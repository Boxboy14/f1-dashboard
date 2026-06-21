# Implementation Plan: Feedback Form

**Branch**: `012-feedback-form` | **Date**: 2026-06-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/012-feedback-form/spec.md`

## Summary

Add a "Feedback" entry point pinned to the bottom of the sidebar that routes to a dedicated `/feedback` page. The page presents a three-field form (Name, Email, Feedback) with client-side validation. On submit, the feedback is delivered to the app owner's registered email via **EmailJS** — a client-only email-sending service that requires no backend — formatted to a fixed body the owner specified. The send is wrapped in a dedicated service module and a TanStack Query mutation; the form surfaces its own inline sending / success / error states.

## Technical Context

**Language/Version**: JavaScript (ES2022), React 19

**Primary Dependencies**: React Router 7 (routing), Salt Design System (form UI: `FormField`, `Input`, `MultilineInput`, `Button`), TanStack Query 5 (`useMutation` for the send), **`@emailjs/browser` (new)** for client-side email delivery

**Storage**: None. Feedback is delivered by email only; nothing is persisted in-app (no localStorage, no DB).

**Testing**: Manual verification + `npm run lint` (project has no automated test framework configured)

**Target Platform**: Web SPA (desktop + mobile browsers), same as the rest of the dashboard

**Project Type**: Single frontend web application

**Performance Goals**: Form submit resolves (success or error surfaced) within ~3s under normal network; the send must not block the rest of the UI and must not trigger the global loading overlay (it is a mutation, not a query)

**Constraints**: EmailJS free tier = 200 emails/month, 2 templates, request payload ≤ 50KB. The EmailJS Public Key + Service ID + Template ID are exposed client-side **by design** (publishable, not secret); abuse is mitigated via EmailJS's domain allowlist + built-in rate limiting + a honeypot field. Owner's destination email is configured in the EmailJS template, never in source.

**Scale/Scope**: One new route, one page, one form component, one service module, one sidebar entry; expected volume well under the 200/month free cap for a personal dashboard.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Article | Status | Notes |
|---|---|---|
| I. Spec-First Development | ✅ Pass | `spec.md` written and validated before this plan. |
| II. API-First Design | ✅ Pass | EmailJS is the external API here. Its contract (`emailjs.send(serviceID, templateID, params, { publicKey })`, `{{variable}}` template mapping, 200/mo free limit) was verified against EmailJS docs in [research.md](./research.md). No OpenF1 endpoint is involved. |
| III. Component Isolation | ✅ Pass | Self-contained `feedback/` component folder, own service module, own SCSS modules. The only shared state touched is URL (the new route) — no cross-page mutable state. |
| IV. Data Layer Discipline | ✅ Pass (interpreted) | Article IV centralises **OpenF1** access in `openf1.js`/`useOpenF1.js`. EmailJS is a different external integration; honouring the rule's intent ("no raw SDK calls in components; centralise external calls"), all EmailJS access flows through `src/services/feedback/emailjs.js`. `staleTime` is N/A (this is a one-shot mutation, not a cached query). |
| V. Clean Code | ✅ Pass | One service fn, one form component, one tiny submit hook. No premature abstraction. |
| VI. UI Consistency | ✅ Pass | Salt `FormField`/`Input`/`MultilineInput`/`Button`/`Text`; Salt tokens for all surfaces/text. No raw hex. Works in both themes. |
| VII. Learning Is First-Class | ✅ Pass | EmailJS mental model + "why it over Web3Forms/Formspree" documented in research.md and quickstart.md. |

**Result**: PASS — no violations, Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/012-feedback-form/
├── plan.md              # This file
├── research.md          # Phase 0: service comparison + EmailJS contract
├── data-model.md        # Phase 1: Feedback Submission entity + validation rules
├── quickstart.md        # Phase 1: EmailJS account/template/env setup + email format
├── contracts/
│   ├── feedback-service.md   # sendFeedback() service contract
│   └── ui-contract.md        # route, sidebar entry, form states
└── checklists/
    └── requirements.md  # Spec quality checklist (from /speckit-specify)
```

### Source Code (repository root)

```text
src/
├── App.jsx                                   # add <Route path="feedback"> under DashboardLayout
├── services/
│   └── feedback/
│       └── emailjs.js                         # NEW: init + sendFeedback({name,email,message})
├── hooks/
│   └── useFeedbackSubmit.js                   # NEW: useMutation wrapper around sendFeedback
└── components/
    ├── dashboard/
    │   ├── FeedbackPage.jsx                    # NEW: /feedback page (heading + form)
    │   ├── FeedbackPage.module.scss           # NEW
    │   └── Sidebar/
    │       ├── Sidebar.jsx                     # add pinned-bottom "Feedback" entry + active match
    │       └── Sidebar.module.scss            # bottom-section styles
    └── tabs/
        └── feedback/
            ├── FeedbackForm.jsx               # NEW: 3-field form, validation, submit states
            └── FeedbackForm.module.scss       # NEW

.env.example                                   # NEW: VITE_EMAILJS_* placeholders (documented)
```

**Structure Decision**: Single-project frontend layout, matching the existing dashboard. The feature is isolated to a new `services/feedback/` module, a new `components/tabs/feedback/` form, a new `FeedbackPage`, and small edits to `App.jsx` (route) and `Sidebar.jsx` (entry point). No existing data hooks are modified.

## Phase 0 — Research (complete)

See [research.md](./research.md). Key decisions:

- **Service: EmailJS** chosen over Web3Forms and Formspree. Decisive factor: EmailJS's dashboard template editor gives **exact** control of the email body, which is required to match the owner's fixed format. Web3Forms (larger 250/mo free tier) auto-formats a fields table and can't reproduce the exact body cleanly; Formspree's free tier (50/mo) is small and custom templates are paid.
- **Delivery is client-only** — no backend, satisfying the "purely frontend" constraint.
- **Email format** is owned by the EmailJS template (not the app), keeping the body fixed and editable without a redeploy.

## Phase 1 — Design (complete)

- **Data model**: [data-model.md](./data-model.md) — the Feedback Submission entity, its three fields, validation rules, and the `templateParams` mapping.
- **Contracts**: [contracts/feedback-service.md](./contracts/feedback-service.md) (service function), [contracts/ui-contract.md](./contracts/ui-contract.md) (route, sidebar entry, form states).
- **Quickstart**: [quickstart.md](./quickstart.md) — one-time EmailJS account/service/template setup, the exact template body, env-var wiring, and abuse mitigations.
- **Agent context**: CLAUDE.md SPECKIT block updated to point at this plan.

## Complexity Tracking

No constitution violations — section intentionally empty.
