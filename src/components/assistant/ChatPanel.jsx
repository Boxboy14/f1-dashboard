import { useEffect, useRef, useState } from "react";
import { Button, Card, MultilineInput, Text } from "@salt-ds/core";
import { CloseIcon, SendIcon } from "@salt-ds/icons";
import ChatMessage from "./ChatMessage.jsx";
import styles from "./ChatPanel.module.scss";

const ChatPanel = ({ chat, onDismiss }) => {
  const { messages, isStreaming, sendMessage } = chat;
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const submit = () => {
    const text = draft.trim();
    if (!text || isStreaming) return;
    sendMessage(text);
    setDraft("");
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <Card className={styles.panel} aria-label="F1 assistant">
      <div className={styles.header}>
        <Text styleAs="h3" className={styles.title}>
          F1 Assistant
        </Text>
        <Button
          appearance="transparent"
          aria-label="Dismiss assistant"
          onClick={onDismiss}
        >
          <CloseIcon aria-hidden />
        </Button>
      </div>

      <div className={styles.messages} ref={listRef}>
        {messages.length === 0 ? (
          <Text color="secondary" className={styles.empty}>
            Ask about any 2023–2025 race, standings, or driver — or request a
            two-driver telemetry report.
          </Text>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
      </div>

      <div className={styles.composer}>
        <MultilineInput
          className={styles.input}
          value={draft}
          rows={2}
          placeholder="Ask the F1 assistant…"
          disabled={isStreaming}
          onChange={(event) => setDraft(event.target.value)}
          textAreaProps={{ onKeyDown, "data-gramm": "false" }}
        />
        <Button
          appearance="solid"
          sentiment="accented"
          aria-label="Send message"
          onClick={submit}
          disabled={isStreaming || !draft.trim()}
        >
          <SendIcon aria-hidden />
        </Button>
      </div>
    </Card>
  );
};

export default ChatPanel;
