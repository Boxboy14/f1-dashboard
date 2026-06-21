---
description: "Task list for Feedback Form implementation"
---

# Tasks: Feedback Form

**Input**: Design documents from `specs/012-feedback-form/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested. The project has no automated test framework (only `npm run lint` + manual verification per the constitution), so no test tasks are generated.

**Organization**: Tasks are grouped by user story (US1 → US2 → US3) so each is independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1 / US2 / US3 (Setup, Foundational, and Polish carry no story label)

## Path Conventions

Single-project frontend app; all paths are repo-root relative (e.g. `src/...`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencies, external service setup, and folders the feature needs.

- [ ] T001 Install the `@emailjs/browser` dependency (updates `package.json` + lockfile)
- [ ] T002 [P] **(MANUAL)** Complete the one-time EmailJS setup per [quickstart.md](./quickstart.md): create the account, connect the destination inbox as a Service, create the Template with the fixed body (`Feedback from {{user_name}} for the F1 Dashboard` / `{ {{message}} }`, Subject, Reply-To `{{user_email}}`, To = your email), set Allowed Origins; record the Service ID, Template ID, and Public Key
- [ ] T003 [P] Create `.env.example` with `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY` placeholders, and add the real values to a gitignored `.env.local` (confirm `.env.local` is in `.gitignore`)
- [ ] T004 [P] Create the feature folders `src/services/feedback/` and `src/components/tabs/feedback/`

**Checkpoint**: Dependency installed, EmailJS IDs available in env, folders exist.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared plumbing that lets a user reach an (inert) feedback page. Every user story builds on this.

**⚠️ CRITICAL**: Complete before starting any user story.

- [ ] T005 [P] Implement the feedback service in `src/services/feedback/emailjs.js`: read the three `VITE_EMAILJS_*` env vars; export `sendFeedback({ name, email, message })` that maps to `templateParams` `{ user_name, user_email, message }` and calls `emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY })`; resolve on HTTP 200, reject with a generic user-safe `Error` on non-200/network failure or missing config (per [contracts/feedback-service.md](./contracts/feedback-service.md))
- [ ] T006 Implement `useFeedbackSubmit` in `src/hooks/useFeedbackSubmit.js` as a TanStack `useMutation` wrapping `sendFeedback`, exposing `mutate`, `isPending`, `isSuccess`, `isError`, `reset` (depends on T005)
- [ ] T007 [P] Create the page shell `src/components/dashboard/FeedbackPage.jsx` (+ `FeedbackPage.module.scss`): `Text styleAs="h1"` heading ("Send Feedback") and a short subtitle explaining it's for improvement ideas / future enhancements (form added in US1)
- [ ] T008 Register the `/feedback` route as a child of `DashboardLayout` in `src/App.jsx`, rendering `FeedbackPage` (depends on T007)
- [ ] T009 [P] Add a "Feedback" entry point pinned to the bottom of the sidebar in `src/components/dashboard/Sidebar/Sidebar.jsx` (+ bottom-section styles in `Sidebar.module.scss`): an auxiliary item below the main nav and above the collapse footer, using the existing `NavLink` + `isPathActive` pattern with `match: ["/feedback"]`, a Salt message icon, and a collapsed-rail tooltip (FR-001, FR-002, FR-010)

**Checkpoint**: Clicking "Feedback" (expanded or collapsed) navigates to `/feedback`, the entry stays highlighted there, and the page renders its heading/subtitle.

---

## Phase 3: User Story 1 - Send feedback that reaches the app owner (Priority: P1) 🎯 MVP

**Goal**: A user can fill Name + Email + Feedback and submit; the owner receives the formatted email and the user sees a success confirmation.

**Independent Test**: From any page, open Feedback, enter valid values in all three fields, submit → confirm an email arrives at the owner's inbox in the required format and a success confirmation shows in the form.

- [ ] T010 [US1] Create `src/components/tabs/feedback/FeedbackForm.jsx` (+ `FeedbackForm.module.scss`): controlled state for `name`, `email`, `message`; Salt `FormField` + `Input` for Name and Email, `FormField` + `MultilineInput` (~5 rows) for Feedback, and a primary `Button` "Send Feedback" (per [contracts/ui-contract.md](./contracts/ui-contract.md))
- [ ] T011 [US1] Render `<FeedbackForm />` inside `src/components/dashboard/FeedbackPage.jsx` (depends on T010)
- [ ] T012 [US1] Wire submit in `FeedbackForm.jsx` to call `useFeedbackSubmit().mutate({ name, email, message })` with trimmed values (depends on T010, T006)
- [ ] T013 [US1] On `isSuccess` in `FeedbackForm.jsx`: show a success confirmation (Salt `Text`/banner) and reset the three fields so the form is ready for another submission (FR-007; depends on T012)

**Checkpoint**: Happy-path submission works end-to-end and is independently demoable (MVP).

---

## Phase 4: User Story 2 - Be guided to submit complete, valid input (Priority: P2)

**Goal**: Invalid or incomplete submissions are blocked before sending, with clear per-field messages.

**Independent Test**: Submit with an empty Name/Feedback or a malformed Email → submission is blocked and the offending field is flagged; correcting it clears the error.

- [ ] T014 [US2] Add submit-time validation in `FeedbackForm.jsx`: Name & Feedback required after trim, Email required + valid format, Name ≤ 80 / Feedback ≤ 2000 chars; block `mutate` when invalid (FR-005, per [data-model.md](./data-model.md))
- [ ] T015 [US2] Surface inline errors in `FeedbackForm.jsx` via Salt `FormField validationStatus="error"` + helper text per field, clearing a field's error once it becomes valid (US2 scenario 3; depends on T014)

**Checkpoint**: US1 still works for valid input; invalid input is now blocked with guidance.

---

## Phase 5: User Story 3 - Recover gracefully when sending fails (Priority: P3)

**Goal**: A failed send tells the user, keeps their content, allows retry, and duplicate sends are prevented.

**Independent Test**: Force a delivery failure → error shown, fields preserved, retry succeeds; rapid double-click yields a single send.

- [ ] T016 [US3] On `isError` in `FeedbackForm.jsx`: show a clear error message and preserve all entered values (do not reset), so the user can retry (FR-008)
- [ ] T017 [US3] Disable the submit `Button` while `isPending` and show a "Sending…" affordance, preventing duplicate submissions (FR-009; depends on T016)

**Checkpoint**: All three stories work independently; the form is resilient to failures.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Anti-spam safeguard, docs, and verification.

- [ ] T018 [P] Add a hidden off-screen honeypot field in `FeedbackForm.jsx`; if it is filled, silently no-op the submit (FR-012)
- [ ] T019 [P] Update the project-root `plan.md` (and current-state notes) to record the `/feedback` feature and `@emailjs/browser` dependency
- [ ] T020 Run `npm run lint` and fix any issues across the changed files
- [ ] T021 **(MANUAL)** Validate per [quickstart.md](./quickstart.md): success path (email arrives in the exact format), validation blocks, simulated failure preserves content + retries, and a blanked env var fails loudly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — start immediately. T005 (service) needs T001 (dep installed); the EmailJS IDs from T002 feed T003.
- **Foundational (Phase 2)**: depends on Setup. Blocks all user stories.
- **User Stories (Phase 3–5)**: depend on Foundational. US2 and US3 build on the `FeedbackForm.jsx` created in US1, so the recommended order is US1 → US2 → US3 (they edit the same file).
- **Polish (Phase 6)**: after the desired stories are complete.

### Within Each User Story

- US1: T010 → T011/T012 → T013 (T011 and T012 touch different files and can overlap after T010).
- US2: T014 → T015 (same file, sequential).
- US3: T016 → T017 (same file, sequential).

### Parallel Opportunities

- Setup: T002, T003, T004 in parallel (T001 alongside, different files).
- Foundational: T005, T007, T009 in parallel; T006 after T005; T008 after T007.
- Cross-story parallelism is limited because US1/US2/US3 all edit `FeedbackForm.jsx` — keep them sequential.
- Polish: T018 and T019 in parallel; T020 after all code tasks.

---

## Parallel Example: Foundational

```bash
# After Setup, launch these together (different files, no shared deps):
Task T005: "Implement feedback service in src/services/feedback/emailjs.js"
Task T007: "Create FeedbackPage shell in src/components/dashboard/FeedbackPage.jsx"
Task T009: "Add Feedback sidebar entry in src/components/dashboard/Sidebar/Sidebar.jsx"
# Then: T006 (hook, needs T005), T008 (route, needs T007)
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 Setup → 2. Phase 2 Foundational → 3. Phase 3 US1 → **STOP & validate** the happy path (email arrives, confirmation shows) → demo. This alone satisfies the core requirement.

### Incremental Delivery

1. Setup + Foundational → reachable feedback page.
2. US1 → feedback reaches the owner (MVP).
3. US2 → input validation.
4. US3 → failure resilience + no duplicate sends.
5. Polish → honeypot, docs, lint, manual verification.

---

## Notes

- [P] = different files, no incomplete dependency. Same-file tasks (the US1→US2→US3 edits to `FeedbackForm.jsx`) are sequential.
- T002 and T021 are manual (EmailJS dashboard + end-to-end verification); all others are code/config.
- The send is a `useMutation`, so it is **not** counted by the global loading overlay — the form shows its own "Sending…" state (do not add it to `useIsFetching`).
- Commit after each task or logical group; stop at any checkpoint to validate a story independently.
