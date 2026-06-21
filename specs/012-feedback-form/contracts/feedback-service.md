# Contract: Feedback Service

Module: `src/services/feedback/emailjs.js`

The single boundary between the app and EmailJS. Components never import `@emailjs/browser` directly (Article IV intent).

---

## `sendFeedback(input)`

```ts
sendFeedback(input: {
  name: string;     // already trimmed by caller
  email: string;    // already trimmed, valid format
  message: string;  // already trimmed
}): Promise<void>
```

**Behaviour**:
- Maps input to `templateParams`: `{ user_name, user_email, message }`.
- Calls `emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY })`.
- Resolves (`void`) when EmailJS returns HTTP 200.
- **Rejects** with an `Error` when EmailJS returns a non-200 status or the network fails. The caller (mutation) maps rejection to the form's error state. The thrown message is generic/user-safe (no raw provider internals surfaced to the UI).

**Configuration** (read once at module load from Vite env):
- `import.meta.env.VITE_EMAILJS_SERVICE_ID`
- `import.meta.env.VITE_EMAILJS_TEMPLATE_ID`
- `import.meta.env.VITE_EMAILJS_PUBLIC_KEY`

If any are missing, `sendFeedback` rejects with a clear configuration error (so a misconfigured deploy fails loudly rather than silently dropping feedback).

**Does NOT**:
- Validate input (the form/data-model owns validation; the service trusts its caller).
- Persist anything.
- Know the owner's destination address — that lives in the EmailJS template's "To" field.

---

## `useFeedbackSubmit()`  (hook: `src/hooks/useFeedbackSubmit.js`)

Thin TanStack Query `useMutation` wrapper:

```ts
const { mutate, isPending, isSuccess, isError, reset } = useFeedbackSubmit();
mutate({ name, email, message });
```

- `isPending` → disable submit, show "Sending…" (FR-009).
- `isSuccess` → show confirmation, reset form fields (FR-007).
- `isError` → show error, preserve field values (FR-008).
- `reset()` → return mutation to idle (e.g. when the user edits after a success/error).
- Not counted by the global loading overlay (`useIsFetching` ignores mutations).
