import { Text } from "@salt-ds/core";
import FeedbackForm from "../tabs/feedback/FeedbackForm.jsx";
import styles from "./FeedbackPage.module.scss";

const FeedbackPage = () => {
  return (
    <div className={styles.page}>
      <Text styleAs="h1">Send Feedback</Text>
      <Text color="secondary" className={styles.subtitle}>
        Have an idea to improve the dashboard or a feature you'd like to see?
        Tell us below — it goes straight to the team.
      </Text>
      <FeedbackForm />
    </div>
  );
};

export default FeedbackPage;
