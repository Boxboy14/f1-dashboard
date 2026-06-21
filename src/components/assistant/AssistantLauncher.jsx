import { useState } from "react";
import { Button } from "@salt-ds/core";
import { ChatIcon } from "@salt-ds/icons";
import { useAssistantChat } from "../../hooks/useAssistantChat.js";
import ChatPanel from "./ChatPanel.jsx";
import styles from "./AssistantLauncher.module.scss";

// Mounted once in App.jsx so the assistant is reachable from every route
// (FR-001). The conversation lives here, not in ChatPanel, so it survives the
// panel unmounting: dismissing the panel only hides it, the conversation
// persists for the session. While the panel is open the launcher button is
// hidden — the panel's own dismiss control takes over.
const AssistantLauncher = () => {
  const [open, setOpen] = useState(false);
  const chat = useAssistantChat();

  if (open) {
    return <ChatPanel chat={chat} onDismiss={() => setOpen(false)} />;
  }

  return (
    <Button
      appearance="solid"
      sentiment="accented"
      className={styles.launcher}
      aria-label="Open F1 assistant"
      onClick={() => setOpen(true)}
    >
      <ChatIcon aria-hidden />
    </Button>
  );
};

export default AssistantLauncher;
