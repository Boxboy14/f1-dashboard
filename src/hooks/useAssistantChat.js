import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { streamTurn } from "../services/assistant/gemini.js";
import { systemInstruction } from "../services/assistant/systemInstruction.js";
import { functionDeclarations, handlers } from "../services/assistant/tools.js";

// @google/genai mental model: Gemini doesn't know F1 results — it decides WHICH
// question to ask the data layer. A turn is a loop, not a single call:
//   stream → if the model emits functionCall parts, run the matching handler →
//   append the result as a functionResponse → stream again → repeat until the
//   model returns plain text. We are the executor; OpenF1 is the source of
//   truth. General-knowledge turns need no tool and end on the first stream.
//
// This hook deliberately registers no useQuery/useMutation: the Gemini call
// bypasses TanStack entirely, and every OpenF1 fetch the handlers make is
// tagged meta:{ background: true }, so the GlobalLoadingOverlay never counts the
// assistant's traffic.

const MAX_TOOL_ROUNDS = 5; // guard against a tool loop that never settles

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Math.random());

// The API is stateless, so the full turn history is sent each request (FR-014).
// Only completed text turns go to the model — the streaming placeholder and any
// error notices are skipped so they never pollute context.
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

      // Snapshot history from prior turns before the placeholder is appended.
      const history = [...toContents(messages), { role: "user", parts: [{ text }] }];
      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      // Page links accumulate across every tool round of this turn (FR-009).
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

          // The model wants data: record its tool turn (the function-call parts
          // verbatim, so Gemini 3's thoughtSignature is preserved — see
          // gemini.js), run each handler, then feed the results back as a single
          // function-response turn.
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

          // Drop any preamble text so the next round streams onto a clean bubble.
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
