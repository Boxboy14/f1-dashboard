# Data Model: Feedback Form

This feature has no persisted storage. The only data object is the in-memory form state, transformed into EmailJS `templateParams` on submit.

---

## Entity: Feedback Submission

A single message a user sends to the app owner. It exists only for the duration of one submit; it is not stored.

| Field | Type | Required | Source → Destination |
|---|---|---|---|
| `name` | string | Yes | Name input → `templateParams.user_name` → `{{user_name}}` in template |
| `email` | string (email) | Yes | Email input → `templateParams.user_email` → Reply-To + `{{user_email}}` |
| `message` | string (multi-line) | Yes | Feedback input → `templateParams.message` → `{{message}}` in template body |

There is one implicit fixed destination — the **owner's registered email** — configured in the EmailJS template's "To" field, not represented in app state.

---

## Validation Rules

Applied client-side before the send (FR-005). Validation runs on submit; a field's error clears as soon as it becomes valid (US2 scenario 3).

| Field | Rule | Error message (example) |
|---|---|---|
| `name` | Non-empty after trim | "Please enter your name." |
| `name` | ≤ 80 characters | "Name is too long (max 80 characters)." |
| `email` | Non-empty after trim | "Please enter your email." |
| `email` | Valid email format | "Please enter a valid email address." |
| `message` | Non-empty after trim | "Please enter your feedback." |
| `message` | ≤ 2000 characters | "Feedback is too long (max 2000 characters)." |

Notes:
- **Whitespace-only** values count as empty (trim before the non-empty check) — Edge Case.
- The 2000-char message cap keeps the request well under EmailJS's 50KB limit and bounds inbox noise; surface a live character count or block at the cap rather than truncating silently (Edge Case).
- Email format validation is **format-only** (a standard pattern); it does not verify deliverability (Assumption).

---

## State Model (submit lifecycle)

Managed by the `useFeedbackSubmit` mutation; drives the form UI.

```
idle ──submit(valid)──▶ sending ──success──▶ submitted (confirmation shown, fields reset)
  ▲                        │
  │                        └──error──▶ error (message shown, field values preserved)
  │                                       │
  └──────────────── user edits / retries ─┘
```

- `sending`: submit control disabled — prevents duplicate sends (FR-009 / US3 scenario 3).
- `error`: entered values are **kept** so the user can retry without retyping (FR-008 / US3 scenario 1).
- `submitted`: success confirmation shown and fields cleared so the page is ready for another submission (FR-007 / US1 scenario 4).

---

## EmailJS `templateParams` ↔ template body

The body is authored once in the EmailJS dashboard (see [quickstart.md](./quickstart.md)) to reproduce the owner's exact format:

```
Feedback from {{user_name}} for the F1 Dashboard

{
{{message}}
}
```

with **Subject** `F1 Dashboard Feedback from {{user_name}}` and **Reply-To** `{{user_email}}`.

App side sends exactly:

```js
{ user_name: name.trim(), user_email: email.trim(), message: message.trim() }
```
