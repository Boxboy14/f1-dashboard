import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const isConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

export async function sendFeedback({ name, email, message }) {
  if (!isConfigured) {
    throw new Error(
      "Feedback isn't configured yet — missing EmailJS settings. See the quickstart.",
    );
  }

  // Keys map to {{user_name}}, {{user_email}}, {{message}} in the EmailJS template.
  const templateParams = {
    name,
    email,
    message,
  };

  await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, {
    publicKey: PUBLIC_KEY,
  });
}
