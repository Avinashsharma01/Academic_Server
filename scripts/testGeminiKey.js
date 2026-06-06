import dotenv from "dotenv";

const args = process.argv.slice(2);

const getArgValue = (name, fallback = "") => {
  const index = args.findIndex((arg) => arg === name);
  if (index === -1) return fallback;
  return args[index + 1] ?? fallback;
};

const firstPositionalArg = args.find((arg) => !arg.startsWith("--"));

const envPath = getArgValue("--env", firstPositionalArg || ".env");
const modelFromArg = getArgValue("--model", "");
const prompt = getArgValue("--prompt", "Reply with one short line saying API key works.");

dotenv.config({ path: envPath });

const apiKey = String(process.env.CHATBOT_API_KEY || "")
  .split("#")[0]
  .trim();
const model = modelFromArg || process.env.CHATBOT_MODEL || "gemini-flash-lite-latest";

if (!apiKey) {
  console.error("FAIL: CHATBOT_API_KEY is missing or empty in", envPath);
  process.exit(1);
}

const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

const run = async () => {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const bodyText = await response.text();

    if (!response.ok) {
      console.error(`FAIL: HTTP ${response.status}`);
      console.error(bodyText.slice(0, 700));
      process.exit(1);
    }

    let parsed;
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      console.log("PASS: Request succeeded but response was not JSON.");
      console.log(bodyText.slice(0, 300));
      process.exit(0);
    }

    const reply = parsed?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log(`PASS: HTTP ${response.status}`);
    console.log(`Model: ${model}`);
    console.log(`Reply: ${reply || "<empty reply>"}`);
  } catch (error) {
    console.error("FAIL: Network or runtime error");
    console.error(error?.message || error);
    process.exit(1);
  }
};

run();
