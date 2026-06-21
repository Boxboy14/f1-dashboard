# Research: Feedback Form

Phase 0 decisions. Service facts verified against vendor docs/pricing (June 2026).

---

## 1. Delivery service — EmailJS (vs Web3Forms vs Formspree)

**Decision**: Use **EmailJS** (`@emailjs/browser`) to deliver feedback from the browser straight to the owner's inbox, with no backend.

**The deciding requirement**: the owner specified an **exact email body**:

```
Feedback from {userName} for the F1 Dashboard

{
............................
} (feedback text)
```

Reproducing a fixed body verbatim is only clean when the service lets you author the full email template. That is EmailJS's core model (a dashboard template editor with `{{variable}}` placeholders), so it wins.

### Comparison

| Criterion | **EmailJS** ✅ | Web3Forms | Formspree |
|---|---|---|---|
| Backend required | No | No | No |
| Free tier | **200 emails/month**, 2 templates, ≤50KB/request | 250 submissions/month | 50 submissions/month |
| Custom email body format | **Full** — dashboard template editor, exact body with `{{vars}}` | Auto-formatted field table; limited shaping | Custom templates mostly paid |
| Account setup | Account + connect one email service (e.g. Gmail) | Just an access key emailed to you | Account + verify email |
| Deliverability | Established (since ~2016), reliable | Newer; occasional Gmail spam-filing | Best (longest-warmed IPs) |
| Reply-to support | Yes (reserved template var) | Yes | Yes |
| Client-side secret exposure | Public Key (publishable by design) | Access key (publishable) | Form ID (publishable) |

**Rationale**: 200 emails/month is far above a personal dashboard's feedback volume, EmailJS needs no server, and its template editor is the only one of the three that reproduces the owner's exact body for free. Reply-To is set to the submitter's email so the owner can respond directly.

**Alternatives considered**:
- **Web3Forms** — bigger free tier and no email-service linking, but it emails an auto-generated field table; matching the exact requested format is awkward/unreliable. Strong runner-up if the format constraint were relaxed.
- **Formspree** — best deliverability and a polished dashboard, but 50/month is tight and custom templates are a paid feature. Rejected on format + free-tier grounds.
- **A serverless function (e.g. mailer on a cloud function)** — would give full control but reintroduces backend/ops the "purely frontend" constraint explicitly rules out. Rejected.

---

## 2. EmailJS send contract

**Decision**: Call the SDK once via a service wrapper:

```js
import emailjs from "@emailjs/browser";

emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY });
// → Promise<{ status: number, text: string }>; rejects on failure
```

- `templateParams` keys map to `{{placeholders}}` in the dashboard template.
- For this feature: `templateParams = { user_name, user_email, message }`.
- The **To** address (owner's registered email) and the **body/subject** live in the EmailJS template, not in code.

**Verification (EmailJS docs, June 2026)**: signature is `emailjs.send(serviceID, templateID, templateParams, options)`; `@emailjs/browser` accepts the Public Key in the options object (`{ publicKey }`) or via `emailjs.init({ publicKey })`. Free plan confirmed at 200 emails/month, 2 templates, 50KB/request.

**Watch out**: the Public Key, Service ID, and Template ID are visible in the shipped bundle — this is expected (they are publishable, not secrets). Real protection comes from the EmailJS dashboard **allowed-origins/domain allowlist** + built-in rate limiting, plus an app-side honeypot. Do not treat these IDs as credentials.

---

## 3. Configuration — Vite env vars

**Decision**: Read the three EmailJS identifiers from Vite env vars (`import.meta.env.VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`), documented in `.env.example`.

**Rationale**: Keeps environment-specific IDs out of source, lets the owner swap the destination/template per deployment, and matches Vite's `VITE_`-prefix convention for client-exposed config. These are publishable values, so committing them would also be safe — env vars are for convenience/portability, not secrecy.

---

## 4. Async handling — TanStack `useMutation`

**Decision**: Wrap `sendFeedback` in a TanStack Query `useMutation` (via a small `useFeedbackSubmit` hook); the form reads `isPending` / `isSuccess` / `isError`.

**Rationale**: The send is a one-shot mutation, not cacheable server state, so `useMutation` (not `useQuery`) is the idiomatic fit and is already in the stack. Crucially, the **global loading overlay reads `useIsFetching` (queries only)**, so a mutation send will **not** trigger the full-screen blocker — the form shows its own inline "Sending…" state, exactly as intended. No `staleTime`/persistence applies.

**Alternatives considered**: plain `useState` flags — works, but re-implements what `useMutation` already gives (pending/success/error, no double-submit). `useQuery` — wrong tool (would cache + could auto-refetch a send). Both rejected.

---

## 5. Form UI — Salt components

**Decision**: Build the form from Salt `FormField` + `FormFieldLabel` + `Input` (Name, Email) + `MultilineInput` (Feedback) + `Button`, with `FormField` `validationStatus="error"` + `FormFieldHelperText` for inline errors. Page heading via `Text styleAs="h1"`.

**Rationale**: Article VI (Salt-first). Salt ships `MultilineInput` for the multi-line feedback field and `FormField` natively supports labels, helper text, and error status — covering all validation UX without custom controls.

**Watch out**: `MultilineInput` needs a sensible `rows`/min-height so the feedback area is comfortable. Keep both themes legible (Salt tokens handle this).

---

## 6. Sidebar entry point + active state

**Decision**: Add a "Feedback" item pinned to the **bottom** of the sidebar (a bottom section above the existing collapse-button footer), reusing the existing `NavLink` + `isPathActive` pattern with `match: ["/feedback"]`, and a tooltip in the collapsed rail (mirroring the other items).

**Rationale**: FR-001/002/010 — persistent, bottom-anchored, reachable in both expanded and collapsed states, and highlighted while on `/feedback` (consistent with the active-state logic already in `Sidebar.jsx`). `/feedback` is registered as a child route of `DashboardLayout` so the sidebar stays visible on the page.

**Watch out**: keep it visually separated from the main nav list (it's an auxiliary action, not a data tab) but still inside the scroll/rail so collapse behaviour is uniform.
