# Quickstart: AI Assistant

## 1. Get a free Gemini API key
1. Go to **Google AI Studio** (aistudio.google.com) → **Get API key** (no credit card).
2. Note the current **Flash** model id from the model list (e.g. `gemini-2.5-flash`) — Flash/Flash-Lite are the free-tier models.
3. **Restrict the key** in the Google Cloud console — go to APIs & Services → Credentials, open the key. Some org-governed Google Cloud projects *require* API restrictions and only allow selecting the Generative Language API after enabling "Authenticate API calls through a service account" — which in turn disables the Application restrictions (Websites/HTTP-referrer) option. If your project forces this trade-off, accept it: scope the key to the Generative Language API and skip the referrer restriction. The key ships in client JS either way; on the free tier the worst case of it leaking is rate-limit abuse, not cost — regenerate the key if you see unexpected usage.

## 2. Configure the app
Add to `.env` (and document in `.env.example`):
```
VITE_GEMINI_API_KEY=your_key_here
```
> Vite only exposes vars prefixed `VITE_`. Restart the dev server after adding it.

## 3. Install the dependency
```
npm install @google/genai
```

## 4. Run
```
npm run dev
```

## 5. Verify (acceptance walk-through)
- **Launcher** (FR-001/002): a chat icon shows bottom-right on every page; clicking opens a panel bottom-left; clicking again / close dismisses it.
- **Data Q&A** (US1): ask *"Who won the 2025 Monaco GP?"* → correct winner, with a link to that session page.
- **Season independence** (FR-005): set the navbar to 2025, then ask a **2023** question → answered correctly.
- **Out-of-range** (FR-006): ask for *2021* lap data → assistant states data covers 2023–2025 rather than inventing.
- **General knowledge** (US3): ask how points are scored → answered without a tool call; ask a follow-up that depends on the prior turn → handled.
- **Report flow** (US2): ask *"download a telemetry report"* → assistant asks for GP, session, drivers, lap; once all four are valid, a report file downloads. Give an invalid combo (driver who didn't run that session) → it explains and asks you to adjust.
- **Failure** (FR-015): with a bad/empty `VITE_GEMINI_API_KEY`, the chat shows a clear error and the conversation is preserved.

## Notes
- If you hit Gemini free-tier rate limits (~10–15 req/min), wait or switch to Groq later (research.md §1) — only `gemini.js` changes.
- Free-tier prompts may be used by Google for training; fine here (public F1 trivia only).
