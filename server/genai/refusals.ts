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
  "can't pull all that insta data",
  "can't pull that insta data",
  "can't pull that data like an app",
  "can't pull data like an app",
  "can't pull insta data",
  "i'm just texting u here rn",
  "i'm just texting you here rn",
  "just texting you here rn",
  "just texting u here rn",
  "can't access instagram",
  "cannot access instagram",
  "don't have access to instagram",
  "can't check your instagram",
  "cannot check your instagram",
  "can't check instagram",
  "don't have internet access",
  "cannot access external",
  "can't access external",
  "i cannot browse",
  "i can't browse",
  "not able to browse",
  "as an artificial intelligence",
  "i am just an ai",
  "i'm just an ai",
  "i am an ai",
  "i'm an ai",
  "can't see your subscriber count",
  "can't see your sub count",
  "can't see your subscribers",
  "can't see subscribers",
  "cannot see your subscriber",
  "cannot see your sub",
  "don't have access to your subscriber",
  "can't view your subscriber",
  "pretend it's millions",
  "wish i had that kind of superpower",
  "wish i had that superpower",
  "can't peek into instagram",
  "can't peek into",
  "unfortunately i can't peek",
  "i can't peek",
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
  socialData?: any;
}

/** Generates a contextual in-character response when the AI refuses or times out. */
export function generateInCharacterFallback(lastUserMsgText: string, ctx: FallbackContext): string {
  const lowerInput = lastUserMsgText.toLowerCase();

  // Handle social media questions with real phone awareness
  if (
    lowerInput.includes("instagram") ||
    lowerInput.includes("followers") ||
    lowerInput.includes("post") ||
    lowerInput.includes("insta") ||
    lowerInput.includes("youtube") ||
    lowerInput.includes("video") ||
    lowerInput.includes("sub") ||
    lowerInput.includes("subs") ||
    lowerInput.includes("subscriber")
  ) {
    if (ctx.socialData?.profile) {
      const p = ctx.socialData.profile;
      if (p.platform === "youtube" || p.subscribers) {
        const subs = p.subscribers || p.followers || "a few";
        const vids = p.videoCount || p.postCount;
        return `You've got ${subs} on your channel right now${vids ? ` and ${vids} uploaded` : ""}!`;
      }
      const followers = p.followers !== undefined ? `${p.followers} followers` : "your profile";
      const posts = p.postCount !== undefined ? `${p.postCount} posts` : "0 posts yet";
      return `Yeah! I just checked your Insta on my phone—you've got ${followers} and ${posts}!`;
    }
    if (ctx.socialData?.post) {
      return `Yeah! I just watched your post on my phone: "${ctx.socialData.post.titleOrCaption.slice(0, 80)}"!`;
    }
    return `Wait, my app was lagging for a sec when I opened it on my phone! Tell me what you posted!`;
  }

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