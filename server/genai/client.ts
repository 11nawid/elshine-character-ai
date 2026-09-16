import type { GeminiContent } from "./convert";
import { generateWeb, extractWebMemories } from "./web-engine";

const DEFAULT_MODEL = "gemini-2.5-flash";
const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest"];
const CHAT_TIMEOUT_MS = 30000;
const MEMORY_TIMEOUT_MS = 20000;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

interface BrainConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  retries: number;
}

function brainConfig(): BrainConfig {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  const model = (process.env.GEMINI_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL;
  const baseUrl = (
    process.env.GEMINI_API_BASE_URL || "https://generativelanguage.googleapis.com"
  ).replace(/\/+$/, "");
  const retries = Math.max(1, Number(process.env.GEMINI_RETRY_ATTEMPTS) || RETRY_ATTEMPTS);
  return { apiKey, model, baseUrl, retries };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function extractTextFromResponse(data: any): string {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .map((p: any) => (typeof p?.text === "string" ? p.text : ""))
    .join("")
    .trim();
}

async function callBrain(
  model: string,
  payload: Record<string, unknown>,
  signal?: AbortSignal
): Promise<string> {
  const config = brainConfig();
  const url = `${config.baseUrl}/v1beta/models/${model}:generateContent`;

  let lastErr: unknown = null;
  for (let attempt = 0; attempt < config.retries; attempt++) {
    if (signal?.aborted) throw new Error("Request aborted");

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": config.apiKey,
        },
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(
          `AI request failed: HTTP ${response.status}${detail ? ` - ${detail.slice(0, 200)}` : ""}`
        );
      }

      const data = await response.json();
      const text = extractTextFromResponse(data);
      if (text) return text;
      throw new Error("Empty response from AI");
    } catch (e: unknown) {
      lastErr = e;
      if (signal?.aborted || (e as { name?: string })?.name === "AbortError") throw e;
      if (attempt < config.retries - 1) await sleep(RETRY_DELAY_MS);
    }
  }

  throw lastErr;
}

function proxyBaseUrl(): string | null {
  return process.env.OPENAI_COMPATIBLE_BASE_URL || null;
}

function formatPromptForWeb(systemPrompt: string, contents: GeminiContent[]): string {
  const sections: string[] = [];

  if (systemPrompt && systemPrompt.trim()) {
    sections.push(`[System Instructions]\n${systemPrompt.trim()}`);
  }

  sections.push("[Conversation History]");
  for (const item of contents) {
    const speaker = item.role === "model" ? "Assistant" : "User";
    const textParts = (item.parts || [])
      .map((p) => {
        if (typeof p?.text === "string") return p.text;
        if (p?.inlineData) return "[Image attached]";
        return "";
      })
      .filter(Boolean)
      .join(" ");

    if (textParts.trim()) {
      sections.push(`${speaker}: ${textParts.trim()}`);
    }
  }

  sections.push("Assistant:");
  return sections.join("\n\n");
}

export async function generateChatResponse(
  contents: GeminiContent[],
  systemPrompt: string
): Promise<string> {
  const config = brainConfig();

  // 1. Primary: Official Gemini API (if GEMINI_API_KEY is configured)
  if (config.apiKey) {
    const candidates = Array.from(new Set([config.model, ...FALLBACK_MODELS]));
    const controller = new AbortController();
    const budget = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);
    try {
      for (const model of candidates) {
        try {
          const text = await callBrain(
            model,
            {
              contents,
              systemInstruction: { parts: [{ text: systemPrompt }] },
              generationConfig: { temperature: 0.88 },
            },
            controller.signal
          );
          if (text) return text;
        } catch (error: any) {
          console.warn(`Official AI attempt (${model}) unavailable:`, error?.message || error);
        }
      }
    } finally {
      clearTimeout(budget);
    }
  }

  // 2. Secondary: Free Unlimited Gemini Web Engine
  // Provides unlimited, fast, free generation without requiring API keys or incurring quota limits
  try {
    const webPrompt = formatPromptForWeb(systemPrompt, contents);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);
    try {
      const text = await generateWeb(webPrompt, controller.signal);
      if (text && text.trim().length > 0) {
        return text.trim();
      }
    } finally {
      clearTimeout(timer);
    }
  } catch (err: any) {
    console.warn("Free web engine attempt encountered an issue, trying secondary options:", err?.message || err);
  }

  // 3. Tertiary: OpenAI-compatible proxy (if OPENAI_COMPATIBLE_BASE_URL is configured)
  const base = proxyBaseUrl();
  if (base) {
    try {
      const response = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: "system", content: systemPrompt }, ...(contents as any)],
          temperature: 0.88,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        return typeof content === "string" ? content.trim() : "";
      }
    } catch (error) {
      console.warn("Proxy call bypassed/timed out:", error);
    }
  }

  return "";
}

function formatConversationText(messages: any[]): string {
  return messages
    .filter((m: any) => m && m.content)
    .slice(-10)
    .map((m: any) => {
      let text = "";
      if (typeof m.content === "string") text = m.content;
      else if (Array.isArray(m.content)) {
        text = m.content
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join(" ");
      }
      return `${m.role === "user" ? "User" : "Assistant"}: ${text}`;
    })
    .join("\n\n");
}

const MEMORY_SYSTEM_PROMPT = `You are a background memory extraction engine for a personal AI companion.
Your job is to read recent messages and extract specific, concise facts, preferences, background details, pets, profession, relationships, habits, or biographical information the USER has mentioned about themselves.

STRICT INSTRUCTIONS:
1. Extract concise, factual statements about the USER only (e.g., "Has a pet golden retriever named Cooper", "Works as a software developer in New York", "Loves sushi and spicy ramen", "Birthday is in October", "Favorite band is Coldplay", "Is traveling to Japan next week").
2. Do NOT extract facts about the AI assistant or generic chat pleasantries (e.g., do NOT extract "User said hello" or "User likes chatting").
3. Do NOT extract AI character details. ONLY extract real facts about the human user.
4. Output MUST be a clean JSON object with a single key "memories", formatted as:
{"memories": ["fact 1", "fact 2"]}
If no user facts are present, return: {"memories": []}`;

function cleanMemoryJson(raw: string): any[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.memories)) {
      return parsed.memories.filter((item: any) => typeof item === "string" && item.trim().length > 3);
    }
  } catch {
    // Fall through to empty list on malformed output
  }
  return [];
}

export async function extractUserMemories(messages: any[]): Promise<string[]> {
  if (!Array.isArray(messages) || messages.length === 0) return [];
  const convoText = formatConversationText(messages);
  let parsedMemories: string[] = [];

  const config = brainConfig();

  // 1. Primary: Official API if configured
  if (config.apiKey) {
    const candidates = Array.from(new Set([config.model, ...FALLBACK_MODELS]));
    const controller = new AbortController();
    const budget = setTimeout(() => controller.abort(), MEMORY_TIMEOUT_MS);
    try {
      for (const model of candidates) {
        try {
          const result = await callBrain(
            model,
            {
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: `Conversation:\n${convoText}\n\nExtract any personal memories/facts about the human user as JSON.` },
                  ],
                },
              ],
              systemInstruction: { parts: [{ text: MEMORY_SYSTEM_PROMPT }] },
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1,
              },
            },
            controller.signal
          );
          parsedMemories = cleanMemoryJson(result);
          if (parsedMemories.length > 0) return parsedMemories;
        } catch (error: any) {
          console.warn("AI memory extraction attempt unavailable:", error?.message || error);
        }
      }
    } finally {
      clearTimeout(budget);
    }
  }

  // 2. Secondary: Try Free Web Engine for memory extraction
  try {
    parsedMemories = await extractWebMemories(convoText);
    if (parsedMemories.length > 0) return parsedMemories;
  } catch (err: any) {
    console.warn("Free web engine memory extraction issue:", err?.message || err);
  }

  // 3. Fallback to OpenAI-compatible proxy if configured
  if (parsedMemories.length === 0) {
    const base = proxyBaseUrl();
    if (base) {
      try {
        const response = await fetch(`${base}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(MEMORY_TIMEOUT_MS),
          body: JSON.stringify({
            model: config.model,
            messages: [
              { role: "system", content: MEMORY_SYSTEM_PROMPT },
              { role: "user", content: `Here is the conversation:\n\n${convoText}\n\nExtract any personal memories/facts about the user as JSON.` },
            ],
            temperature: 0.1,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          let content: string = data.choices?.[0]?.message?.content || "{}";
          if (content.includes("```")) {
            content = content.replace(/^```(?:json)?\s*/im, "").replace(/```\s*$/im, "");
            content = content.replace(/```[a-z]*/gi, "").replace(/```/g, "");
          }
          parsedMemories = cleanMemoryJson(content.trim());
        }
      } catch {
        // Ignore secondary memory parse errors
      }
    }
  }

  return parsedMemories;
}