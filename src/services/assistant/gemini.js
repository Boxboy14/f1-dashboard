// The only module that imports @google/genai — every other assistant module
// stays SDK-free so the dependency boundary mirrors emailjs.js (Constitution
// Article IV). The key ships client-side as VITE_GEMINI_API_KEY; on the free
// tier the worst case of a leak is rate-limit abuse, not cost.
import { GoogleGenAI } from "@google/genai";

// Current free-tier Flash model — confirm the exact id in Google AI Studio.
export const GEMINI_MODEL = "gemini-2.5-flash";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let client = null;
function getClient() {
  if (!apiKey) {
    throw new Error("The assistant isn't configured yet — missing API key");
  }
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

export async function* streamTurn({ history, tools, systemInstruction }) {
  const ai = getClient();

  const config = { systemInstruction };
  if (tools?.length) config.tools = [{ functionDeclarations: tools }];

  const stream = await ai.models.generateContentStream({
    model: GEMINI_MODEL,
    contents: history,
    config,
  });

  for await (const chunk of stream) {
    const text = chunk.text ?? "";
    const functionCalls = chunk.functionCalls ?? [];
    if (text || functionCalls.length) yield { text, functionCalls };
  }
}
