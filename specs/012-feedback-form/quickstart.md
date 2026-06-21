# Quickstart: Feedback Form (EmailJS setup)

One-time setup so the `/feedback` form delivers to your inbox. ~10 minutes.

---

## 1. Create the EmailJS account + service

1. Sign up free at https://www.emailjs.com (free plan = 200 emails/month).
2. **Email Services → Add New Service** → connect the inbox you want feedback delivered to (e.g. Gmail). Note the **Service ID** (e.g. `service_xxx`).

## 2. Create the template (this controls the exact email body)

**Email Templates → Create New Template**. Set:

- **To Email**: your registered email (the destination — this is the only place the owner address lives).
- **Reply To**: `{{user_email}}` (so you can reply straight to the submitter).
- **Subject**: `F1 Dashboard Feedback from {{user_name}}`
- **Content** (plain text — reproduces the requested format exactly):

  ```
  Feedback from {{user_name}} for the F1 Dashboard

  {
  {{message}}
  }
  ```

Save and note the **Template ID** (e.g. `template_xxx`).

## 3. Get the Public Key

**Account → General → Public Key** (e.g. `xxxxxxxxxxxx`). This is publishable (not a secret) but we keep it in env vars for portability.

## 4. Wire env vars

Create `.env.local` (gitignored) from `.env.example`:

```
VITE_EMAILJS_SERVICE_ID=service_xxx
VITE_EMAILJS_TEMPLATE_ID=template_xxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxx
```

Restart `npm run dev` after adding env vars (Vite reads them at startup).

## 5. Lock down abuse (recommended)

In the EmailJS dashboard:
- **Account → Security → Allowed Origins**: add your dev (`http://localhost:5173`) and production domains so other sites can't use your key.
- Keep **rate limiting** enabled (default).
- The app also adds a hidden **honeypot** field; a filled honeypot silently drops the submit.

---

## Install the dependency

```
npm install @emailjs/browser
```

EmailJS in one sentence: it sends email straight from the browser by POSTing your form values to EmailJS, which fills your dashboard **template** and sends it from your connected service — no backend. The mental model: **the app supplies variables (`user_name`, `user_email`, `message`); the template owns the format and destination.**

---

## Verify it works

1. `npm run dev`, open the app, click **Feedback** at the bottom of the sidebar.
2. Submit Name + a valid Email + a message → expect a success confirmation in the form and an email in your inbox formatted as:

   ```
   Feedback from <name> for the F1 Dashboard

   {
   <message>
   }
   ```
3. Submit with an empty field or a bad email → expect inline validation errors, no email sent.
4. Temporarily blank an env var → expect a clear "feedback isn't configured" style error on submit (fails loudly, not silently).

## Notes / gotchas

- The Service/Template/Public IDs ship in the client bundle by design — protect with the **Allowed Origins** allowlist, not by hiding them.
- Free tier is **200 emails/month**; fine for personal feedback volume.
- This is a **mutation**, so it does **not** trigger the global "Loading…" overlay — the form shows its own "Sending…" state.
