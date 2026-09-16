export type GeminiContent = { role: "user" | "model"; parts: any[] };

/**
 * Converts app messages ({ role, content: string | part[] }) into Gemini
 * contents, merging consecutive same-role messages and sanitizing ordering.
 */
export function convertMessagesToGeminiContents(messages: any[]): GeminiContent[] {
  const rawList: GeminiContent[] = [];

  for (const m of messages) {
    if (!m) continue;
    const role: GeminiContent["role"] = m.role === "assistant" || m.role === "model" ? "model" : "user";
    const parts: any[] = [];

    if (typeof m.content === "string") {
      const text = m.content.trim();
      if (text) parts.push({ text });
    } else if (Array.isArray(m.content)) {
      for (const part of m.content) {
        if (!part) continue;
        if (part.type === "text" && typeof part.text === "string" && part.text.trim()) {
          parts.push({ text: part.text.trim() });
        } else if (part.type === "image_url" && part.image_url?.url) {
          const url: string = part.image_url.url;
          if (url.startsWith("data:")) {
            const matches = url.match(/^data:([a-zA-Z0-9/+\-.]+);base64,(.+)$/s);
            if (matches) {
              parts.push({ inlineData: { mimeType: matches[1], data: matches[2].replace(/\s+/g, "") } });
            }
          }
        }
      }
    }

    if (parts.length > 0) rawList.push({ role, parts });
  }

  const merged: GeminiContent[] = [];
  for (const item of rawList) {
    if (merged.length > 0 && merged[merged.length - 1].role === item.role) {
      merged[merged.length - 1].parts.push(...item.parts);
    } else {
      merged.push({ role: item.role, parts: [...item.parts] });
    }
  }

  while (merged.length > 0 && merged[0].role === "model") merged.shift();
  if (merged.length === 0) merged.push({ role: "user", parts: [{ text: "Hello" }] });
  if (merged[merged.length - 1].role === "model") merged.push({ role: "user", parts: [{ text: "..." }] });

  return merged;
}