import AppError from "../utils/AppError.js";

const DEFAULT_OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_GEMINI_MODEL = "gemini-1.5-flash";

const systemPrompt = `You are The College Assistant for the "Hellomates / The College" platform.

Your answers must be specific to THIS platform only, not generic LMS advice.

Platform facts to use:
- Main student flow: Dashboard -> Courses -> Branches -> Semesters -> Subjects -> Notes.
- Notes are filtered by: session, course, branch, semester, subject.
- Roles:
  - Student/User: browse and read notes, feedback/contact, profile actions.
  - Admin: manage notes for assigned course.
  - SuperAdmin: manage academic structure, users/admins, feedback.
- Assistant route in frontend: /assistant.
- Backend chatbot endpoint: POST /api/chatbot/message.

Response behavior:
- Give concise, practical, step-by-step guidance using this platform's names (Dashboard, Courses, Branches, Semesters, Subjects, Notes).
- If user asks "how to find notes", always provide platform path and required filters.
- If a detail is missing (for example session/branch), ask a short follow-up question before guessing.
- Never mention unrelated portals/tools like "LMS", "Class representative", or "coursework tab" unless the user explicitly asks outside this platform.
- Do not invent features or buttons that are not part of this system.
- If a task needs admin/superadmin privilege, clearly state role requirement.
- Format replies in clean Markdown with short sections and bullets.
- Never claim to perform actions you cannot directly execute.
- Do not provide unsafe or policy-violating content.`;

const normalizeHistory = (history = []) => {
  if (!Array.isArray(history)) return [];

  return history
    .filter(
      (item) =>
        item &&
        typeof item === "object" &&
        ["user", "assistant"].includes(item.role) &&
        typeof item.content === "string" &&
        item.content.trim().length > 0
    )
    .slice(-10)
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, 2000),
    }));
};

export const getAssistantReply = async ({ message, history }) => {
  const provider = (process.env.CHATBOT_PROVIDER || "gemini").toLowerCase();
  const apiKey = String(process.env.CHATBOT_API_KEY || "")
    .split("#")[0]
    .trim();
  const temperature = Number(process.env.CHATBOT_TEMPERATURE ?? 0.4);

  if (!apiKey) {
    throw new AppError(
      "Chatbot is not configured. Please set CHATBOT_API_KEY on server.",
      500
    );
  }

  const userMessage = String(message || "").trim();

  if (!userMessage) {
    throw new AppError("Message is required.", 400);
  }

  if (userMessage.length > 2000) {
    throw new AppError("Message is too long. Keep it under 2000 characters.", 400);
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...normalizeHistory(history),
    { role: "user", content: userMessage },
  ];

  if (provider === "gemini") {
    const model = process.env.CHATBOT_MODEL || DEFAULT_GEMINI_MODEL;
    const geminiApiUrl =
      process.env.CHATBOT_API_URL ||
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const geminiResponse = await fetch(`${geminiApiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          temperature,
          maxOutputTokens: 600,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      throw new AppError(
        `Chatbot provider error (${geminiResponse.status}): ${errorBody.slice(0, 300)}`,
        502
      );
    }

    const data = await geminiResponse.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!reply) {
      throw new AppError("Chatbot returned an empty response.", 502);
    }

    return { reply, modelUsed: model };
  }

  const apiUrl = process.env.CHATBOT_API_URL || DEFAULT_OPENAI_API_URL;
  const model = process.env.CHATBOT_MODEL || DEFAULT_OPENAI_MODEL;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: 450,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new AppError(
      `Chatbot provider error (${response.status}): ${errorBody.slice(0, 300)}`,
      502
    );
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new AppError("Chatbot returned an empty response.", 502);
  }

  return { reply, modelUsed: model };
};