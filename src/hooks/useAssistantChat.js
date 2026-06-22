import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { streamTurn } from "../services/assistant/gemini.js";
import { systemInstruction } from "../services/assistant/systemInstruction.js";
import { functionDeclarations, handlers } from "../services/assistant/tools.js";

const MAX_TOOL_ROUNDS = 5;

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Math.random());

function toContents(messages) {
  return messages
    .filter((m) => m.status === "done" && m.text)
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }],
    }));
}

export function useAssistantChat() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const updateMessage = useCallback((id, patch) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const sendMessage = useCallback(
    async (rawText) => {
      const text = rawText.trim();
      if (!text || isStreaming) return;

      setError(null);
      setIsStreaming(true);

      const userMessage = { id: newId(), role: "user", text, status: "done", links: [] };
      const assistantId = newId();
      const assistantMessage = {
        id: assistantId,
        role: "assistant",
        text: "",
        status: "streaming",
        links: [],
      };

      const history = [...toContents(messages), { role: "user", parts: [{ text }] }];
      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      const pageLinks = [];
      const collectLink = (result) => {
        if (!result?.page) return;
        const link = { to: result.page, label: result.pageLabel ?? result.page };
        if (!pageLinks.some((l) => l.to === link.to)) pageLinks.push(link);
      };

      try {
        let answer = "";
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          let roundText = "";
          const callParts = [];

          for await (const chunk of streamTurn({
            history,
            tools: functionDeclarations,
            systemInstruction,
          })) {
            if (chunk.text) {
              roundText += chunk.text;
              updateMessage(assistantId, { text: roundText, links: pageLinks });
            }
            if (chunk.functionCallParts.length) callParts.push(...chunk.functionCallParts);
          }

          if (!callParts.length) {
            answer = roundText;
            break;
          }

          history.push({ role: "model", parts: callParts });
          const responseParts = [];
          for (const { functionCall: call } of callParts) {
            const handler = handlers[call.name];
            let result;
            try {
              result = handler
                ? await handler(call.args ?? {}, { queryClient })
                : { error: `Unknown tool: ${call.name}` };
            } catch (err) {
              result = { error: err?.message ?? "The data lookup failed." };
            }
            collectLink(result);
            responseParts.push({
              functionResponse: { name: call.name, response: result },
            });
          }
          history.push({ role: "user", parts: responseParts });

          updateMessage(assistantId, { text: "", links: pageLinks });
        }

        updateMessage(assistantId, {
          text: answer || "Sorry, I couldn't produce an answer. Please try rephrasing.",
          status: "done",
          links: pageLinks,
        });
      } catch (err) {
        const message = err?.message ?? "Something went wrong reaching the assistant.";
        setError(message);
        updateMessage(assistantId, { text: message, status: "error", links: [] });
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming, queryClient, updateMessage],
  );

  return { messages, isStreaming, sendMessage, error };
}
