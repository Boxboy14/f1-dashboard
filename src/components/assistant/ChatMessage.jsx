import { Link as RouterLink } from "react-router-dom";
import { Spinner, Text } from "@salt-ds/core";
import styles from "./ChatMessage.module.scss";

const ChatMessage = ({ message }) => {
  const { role, text, links = [], status } = message;
  const isUser = role === "user";

  return (
    <div className={`${styles.row} ${isUser ? styles.user : styles.assistant}`}>
      <div
        className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble} ${status === "error" ? styles.errorBubble : ""}`}
      >
        {text ? (
          <Text className={styles.text}>{text}</Text>
        ) : status === "streaming" ? (
          <Spinner size="small" aria-label="Assistant is typing" />
        ) : null}

        {links.length > 0 && (
          <div className={styles.links}>
            {links.map((link) => (
              <RouterLink key={link.to} to={link.to} className={styles.link}>
                {link.label}
              </RouterLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
