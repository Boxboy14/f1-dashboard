import { useEffect, useState } from "react";
import {
  Banner,
  BannerContent,
  Button,
  Card,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  MultilineInput,
} from "@salt-ds/core";
import { useFeedbackSubmit } from "../../../hooks/useFeedbackSubmit.js";
import styles from "./FeedbackForm.module.scss";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX = 80;
const MESSAGE_MAX = 5000;
const SUCCESS_RESET_DELAY = 3000;

function validate({ name, email, message }) {
  const errors = {};
  const n = name.trim();
  const e = email.trim();
  const m = message.trim();

  if (!n) errors.name = "Please enter your name.";
  else if (n.length > NAME_MAX)
    errors.name = `Name is too long (max ${NAME_MAX} characters).`;

  if (!e) errors.email = "Please enter your email.";
  else if (!EMAIL_RE.test(e))
    errors.email = "Please enter a valid email address.";

  if (!m) errors.message = "Please enter your feedback.";
  else if (m.length > MESSAGE_MAX)
    errors.message = `Feedback is too long (max ${MESSAGE_MAX} characters).`;

  return errors;
}

const FeedbackForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState({});

  const { mutate, isPending, isSuccess, isError, reset } = useFeedbackSubmit();

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(reset, SUCCESS_RESET_DELAY);
    return () => clearTimeout(timer);
  }, [isSuccess, reset]);

  const editField = (setter, key) => (event) => {
    setter(event.target.value);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (isSuccess || isError) reset();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (honeypot) return;

    const nextErrors = validate({ name, email, message });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    mutate(
      { name: name.trim(), email: email.trim(), message: message.trim() },
      {
        onSuccess: () => {
          setName("");
          setEmail("");
          setMessage("");
        },
      },
    );
  };

  return (
    <Card className={styles.card}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {isSuccess && (
          <Banner status="success">
            <BannerContent>
              Thanks for your feedback! It's on its way to the team.
            </BannerContent>
          </Banner>
        )}
        {isError && (
          <Banner status="error">
            <BannerContent>
              Sorry — your feedback couldn't be sent. Please try again.
            </BannerContent>
          </Banner>
        )}

        <FormField validationStatus={errors.name ? "error" : undefined}>
          <FormFieldLabel className={styles.label}>Name</FormFieldLabel>
          <Input
            value={name}
            placeholder="Name"
            inputProps={{
              onChange: editField(setName, "name"),
              maxLength: NAME_MAX,
            }}
          />
          {errors.name && (
            <FormFieldHelperText>{errors.name}</FormFieldHelperText>
          )}
        </FormField>

        <FormField validationStatus={errors.email ? "error" : undefined}>
          <FormFieldLabel className={styles.label}>Email</FormFieldLabel>
          <Input
            value={email}
            placeholder="Email"
            inputProps={{
              type: "email",
              onChange: editField(setEmail, "email"),
            }}
          />
          {errors.email && (
            <FormFieldHelperText>{errors.email}</FormFieldHelperText>
          )}
        </FormField>

        <FormField validationStatus={errors.message ? "error" : undefined}>
          <FormFieldLabel className={styles.label}>Feedback</FormFieldLabel>
          <MultilineInput
            value={message}
            rows={5}
            placeholder="What could be improved or what would you like to see next?"
            textAreaProps={{
              onChange: editField(setMessage, "message"),
              maxLength: MESSAGE_MAX,
              "data-gramm": "false",
              "data-gramm_editor": "false",
              "data-enable-grammarly": "false",
            }}
          />
          <div className={styles.messageFooter}>
            {errors.message && (
              <FormFieldHelperText>{errors.message}</FormFieldHelperText>
            )}
            <span className={styles.charCount}>
              {message.length}/{MESSAGE_MAX}
            </span>
          </div>
        </FormField>

        <input
          className={styles.honeypot}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />

        <Button
          type="submit"
          disabled={isPending || isSuccess}
          sentiment={isSuccess ? "positive" : "accented"}
          className={styles.submit}
        >
          {isPending
            ? "Sending…"
            : isSuccess
              ? "Feedback Sent"
              : "Send Feedback"}
        </Button>
      </form>
    </Card>
  );
};

export default FeedbackForm;
