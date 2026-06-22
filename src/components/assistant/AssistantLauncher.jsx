import { useState } from "react";
import { Button, Tooltip } from "@salt-ds/core";
import fabIcon from "../../images/app-logo/f1-assistant-fab-icon.svg";
import { useAssistantChat } from "../../hooks/useAssistantChat.js";
import ChatPanel from "./ChatPanel.jsx";
import styles from "./AssistantLauncher.module.scss";

const AssistantLauncher = () => {
  const [open, setOpen] = useState(false);
  const chat = useAssistantChat();

  if (open) {
    return <ChatPanel chat={chat} onDismiss={() => setOpen(false)} />;
  }

  return (
    <Tooltip
      content={
        <span className={styles.tooltipContent}>
          <span className={styles.tooltipAccent}>F1</span> Dashboard Assistant
        </span>
      }
      placement="left"
      className={styles.tooltip}
    >
      <Button
        appearance="transparent"
        className={styles.launcher}
        aria-label="Open F1 assistant"
        onClick={() => setOpen(true)}
      >
        <img src={fabIcon} alt="" className={styles.icon} />
      </Button>
    </Tooltip>
  );
};

export default AssistantLauncher;
