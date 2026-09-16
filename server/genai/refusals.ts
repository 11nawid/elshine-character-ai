export const REFUSAL_KEYWORDS = [
  "system instruction violation",
  "temporarily restricted",
  "non-conversational ai formats",
  "system prompt block",
  "why'd you send me a system prompt",
  "cannot engage in role-play",
  "cannot participate in role-play",
  "cannot adopt a persona",
  "can't adopt a persona",
  "can't participate in role-play",
  "adopting a false personal identity",
  "as a large language model",
  "as an ai language model",
  "as an ai, i cannot",
  "as an ai, i am unable",
  "as a language model, i cannot",
  "i am unable to pretend to be",
  "cannot act as a real person",
  "pretend to be a real person",
  "i am unable to simulate a real person",
  "i cannot simulate a real person",
  "any other topic you would like to discuss as gemini",
  "i cannot fulfill this request",
  "i cannot assist with this request",
  "i'm sorry, but as an ai",
  "i am sorry, but as an ai",
];

export function getMessageText(m: any): string {
  if (typeof m?.content === "string") return m.content;
  if (Array.isArray(m?.content)) {
    return m.content
      .filter((part: any) => part.type === "text" && typeof part.text === "string")
      .map((part: any) => part.text)
      .join(" ");
  }
  return "";
}

/** Filters out contaminated assistant refusal messages from conversation context. */
export function filterRefusalMessages(messages: any[]): any[] {
  return (messages || []).filter((m: any) => {
    if (m.role === "assistant") {
      const text = getMessageText(m).toLowerCase();
      if (REFUSAL_KEYWORDS.some((kw) => text.includes(kw))) return false;
    }
    return true;
  });
}

/** Removes bracketed "[System ...]" headers that occasionally leak into responses. */
export function sanitizeBracketedContent(content: string): string {
  if (typeof content !== "string" || !content) return "";
  return content
    .replace(/\[System instruction violation[^\]]*\]/gi, "")
    .replace(/\[System message[^\]]*\]/gi, "")
    .replace(/\[System error[^\]]*\]/gi, "")
    .replace(/\[System[^\]]*\]/gi, "")
    .trim();
}

export function isRefusalContent(content: string): boolean {
  return !content || REFUSAL_KEYWORDS.some((kw) => content.toLowerCase().includes(kw));
}

interface FallbackContext {
  knowsUser: boolean;
  callName: string;
  characterName: string;
}

/** Generates a contextual in-character response when the AI refuses or times out. */
export function generateInCharacterFallback(lastUserMsgText: string, ctx: FallbackContext): string {
  const lowerInput = lastUserMsgText.toLowerCase();
  if (lowerInput.includes("who am i") || lowerInput.includes("my name")) {
    return ctx.knowsUser
      ? `Wait, are you testing my memory or did you just wake up from a nap? 😂 You're ${ctx.callName}!`
      : `Haha wait, we haven't introduced ourselves yet! What's your name?`;
  }
  if (lowerInput.includes("who are you") || lowerInput.includes("your name")) {
    return `I'm ${ctx.characterName}! Who else would I be?`;
  }
  if (lowerInput.includes("linya") || lowerInput.includes("alex")) {
    return ctx.knowsUser
      ? `Haha wait, you're confusing me now! You're ${ctx.callName}, right?`
      : `Haha wait, you're confusing me now! What's your name?`;
  }
  if (lowerInput.includes("repeat") || lowerInput.includes("repeating") || lowerInput.includes("again")) {
    return `Sorry about that! My connection had a brief hiccup. I'm right here with you now—what were we talking about?`;
  }
  if (lowerInput.includes("image") || lowerInput.includes("picture") || lowerInput.includes("photo") || lowerInput.includes("look")) {
    return `I can see it! It looks like an atmospheric, dimly lit room with warm pinkish-purple neon lights inside and an open doorway.`;
  }

  const variations = [
    `Hey! Got a bit distracted there for a second. Tell me what's on your mind!`,
    `I'm listening! What are you up to today?`,
    `Haha gotcha! What do you think about that?`,
    `Ooh interesting! Tell me more about what you're thinking.`,
  ];
  return variations[Math.floor(Math.random() * variations.length)];
}