import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL = "gemini-3.1-flash-lite";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let client = null;
function getClient() {
  if (!apiKey) {
    throw new Error("The assistant isn't configured yet — missing API key");
  }
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

const SERVICE_UNAVAILABLE_MESSAGE =
  "Sorry, I can't process your request right now. Please try again after some time.";

export async function* streamTurn({ history, tools, systemInstruction }) {
  const ai = getClient();

  const config = { systemInstruction };
  if (tools?.length) config.tools = [{ functionDeclarations: tools }];

  try {
    const stream = await ai.models.generateContentStream({
      model: GEMINI_MODEL,
      contents: history,
      config,
    });

    for await (const chunk of stream) {
      const text = chunk.text ?? "";
      const parts = chunk.candidates?.[0]?.content?.parts ?? [];
      const functionCallParts = parts.filter((p) => p.functionCall);
      if (text || functionCallParts.length) yield { text, functionCallParts };
    }
  } catch (err) {
    console.error("Gemini request failed:", err);
    throw new Error(SERVICE_UNAVAILABLE_MESSAGE);
  }
}
