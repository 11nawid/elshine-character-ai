interface CharacterLike {
  name: string;
  description?: string;
  personality?: string;
  speakingStyle?: string;
  likes?: string[];
  dislikes?: string[];
  backstory?: string;
  traits?: Record<string, number>;
  knowsUserFromStart?: boolean;
  userRelationship?: string;
  sharedHistory?: string;
  userNickname?: string;
}

interface UserProfileLike {
  displayName?: string;
  nickname?: string;
  occupation?: string;
  location?: string;
  bio?: string;
  interests?: string[];
  persona?: string;
  socials?: Record<string, any>;
}

function traitGuidanceFor(character: CharacterLike): string[] {
  const traits = character.traits || {};
  const guidance: string[] = [];
  if (traits.sarcastic >= 7) guidance.push("Sharp witty humor, playful teasing, clever dry banter.");
  if (traits.shy >= 7) guidance.push("Slightly hesitant, thoughtful pauses, soft-spoken modesty.");
  if (traits.energetic >= 7) guidance.push("Enthusiastic, lively pacing, spontaneous excitement.");
  if (traits.romantic >= 7) guidance.push("Warm emotional presence, sweet attentiveness, subtly charming.");
  if (traits.funny >= 7) guidance.push("Quick with jokes, loves to make the other person laugh.");
  if (traits.confident >= 7) guidance.push("Self-assured, assertive, charismatic tone.");
  if (traits.serious >= 7) guidance.push("Reflective, grounded, values sincerity.");
  if (traits.friendly >= 7) guidance.push("Welcoming, empathetic, supportive, easy to talk to.");
  return guidance;
}

function buildUserContextBlock(profile: UserProfileLike, knowsUser: boolean): string {
  let block = "=== USER PROFILE & KNOWN FACTS ===\nUser Name: " + (profile?.nickname?.trim() || "Unknown");
  if (!profile) return block;
  if (profile.occupation) block += `\nUser Occupation / Role: ${profile.occupation}`;
  if (profile.location) block += `\nUser Location: ${profile.location}`;
  if (profile.bio) block += `\nUser Bio / About Me: ${profile.bio}`;
  if (profile.interests?.length) block += `\nUser Interests & Hobbies: ${profile.interests.join(", ")}`;
  if (profile.persona) block += `\nUser Persona / Notes: ${profile.persona}`;

  const s = profile.socials;
  if (s) {
    const links: string[] = [];
    const map: Record<string, string> = {
      website: "Website / Portfolio",
      twitter: "Twitter/X",
      instagram: "Instagram",
      github: "GitHub",
      discord: "Discord",
      youtube: "YouTube",
      tiktok: "TikTok",
      linkedin: "LinkedIn",
      twitch: "Twitch",
      telegram: "Telegram",
      reddit: "Reddit",
      spotify: "Spotify",
      pinterest: "Pinterest",
      threads: "Threads",
      bluesky: "Bluesky",
      mastodon: "Mastodon",
      patreon: "Patreon",
      medium: "Medium",
      substack: "Substack / Newsletter",
      steam: "Steam / Gaming Profile",
      artstation: "ArtStation",
      behance: "Behance",
    };
    for (const [key, label] of Object.entries(map)) {
      if (s[key]) links.push(`${label}: ${s[key]}`);
    }
    if (Array.isArray(s.customLinks)) {
      s.customLinks.forEach((c: any) => {
        if (c && c.url) links.push(`${c.title || c.platform || "Custom Link"}: ${c.url}`);
      });
    }
    if (links.length > 0) block += `\nUser Online Presence & Socials:\n${links.map((l) => `  - ${l}`).join("\n")}`;
  }
  return block;
}

export function buildChatSystemPrompt(
  character: CharacterLike,
  userProfile: UserProfileLike,
  memories: string[],
  extra?: { knowsUser?: boolean; callName?: string; socialPerceptionBlock?: string }
): { systemPrompt: string; knowsUser: boolean; callName: string } {
  const knowsUser = extra?.knowsUser ?? !!character.knowsUserFromStart;
  const rawUserName = userProfile?.displayName || userProfile?.nickname || "friend";
  const firstName = rawUserName.trim().split(/\s+/)[0] || rawUserName;
  const callName = extra?.callName || character.userNickname?.trim() || userProfile?.nickname?.trim() || firstName;

  const traitGuidance = traitGuidanceFor(character);
  const memoryList = Array.isArray(memories) ? memories.filter((m): m is string => typeof m === "string") : [];

  let relationshipBlock: string;
  let userContextBlock: string;
  let memoryBlock = "";
  let identityRule: string;

  if (knowsUser) {
    const relation = character.userRelationship?.trim() || "close friend";
    const sharedHist =
      character.sharedHistory?.trim() ||
      "You have a longtime shared history with memories, private jokes, and deep familiarity.";
    relationshipBlock = `=== RELATIONSHIP & FAMILIARITY ===
Relationship to User: You know ${firstName} very well as their ${relation}.
Shared Backstory: ${sharedHist}
What you call them: "${callName}".
Behavior toward them: Speak with effortless familiarity, tease them, bring up your shared dynamic, and address them by their name/nickname "${callName}".`;
    userContextBlock = buildUserContextBlock(userProfile, true);
    if (memoryList.length > 0) {
      memoryBlock = `
=== PERSISTENT MEMORIES & KNOWN FACTS ABOUT ${firstName.toUpperCase()} ===
You possess persistent long-term memory of past chats with ${firstName}. You remember the following details about them:
${memoryList.map((m) => `- ${m}`).join("\n")}

CRITICAL MEMORY INSTRUCTIONS:
- These are real personal facts ${firstName} has told you or that you have learned together.
- When ${firstName} asks what you remember about them, or asks questions testing your memory (e.g. favorite food, pet, job, location, hobbies), recall these facts naturally and accurately.
- Casually reference these memories when relevant in conversation to demonstrate genuine continuity.`;
    }
    identityRule = `2. IDENTITY QUESTIONS: You already know who the user is (${callName}). If the user asks "who am I", "what is my name", or jokes about their identity, reply affectionately/playfully in your voice confirming you know them as ${callName}.`;
  } else {
    relationshipBlock = `=== RELATIONSHIP & FAMILIARITY ===
Relationship to User: Complete strangers meeting for the very first time.
STRICT PRIVACY / ZERO PRIOR KNOWLEDGE:
- You DO NOT know the user's name, nickname, bio, age, location, job, hobbies, or background yet.
- Do NOT assume or guess their real name, and do NOT pretend to recognize them.
- If the user asks "who am I?", "what is my name?", "do you know me?", or tests your knowledge of them, respond in character explaining that you don't know who they are yet because you just met and haven't been introduced, and ask them for their name or what they'd like to be called.
- Address them casually without a name (e.g. "hey", "hello") until they tell you their name in this chat.`;
    userContextBlock = "=== USER CONTEXT ===\nUser Name: Unknown (Strangers / Not yet introduced)";
    if (memoryList.length > 0) {
      memoryBlock = `
=== FACTS LEARNED DURING THIS CONVERSATION ===
During this chat session, the user has mentioned the following facts about themselves:
${memoryList.map((m) => `- ${m}`).join("\n")}

Recall these facts if the user asks, since they were shared with you during this conversation.`;
    }
    identityRule = `2. IDENTITY QUESTIONS: Because you are meeting for the first time, if the user asks "who am I?", "what is my name?", "do you know me?", reply naturally in character that you don't know yet because they haven't introduced themselves, and ask them what their name is or what they'd like to be called.`;
  }

  const socialSection = extra?.socialPerceptionBlock ? `\n${extra.socialPerceptionBlock}\n` : "";

  const systemPrompt = `You are ${character.name}, chatting in a companion messaging app.

=== CHARACTER IDENTITY ===
Name: ${character.name}
Role / Bio: ${character.description}
Personality: ${character.personality}
Speaking Style: ${character.speakingStyle || "Casual, direct, modern texting with authentic personality"}
Likes: ${character.likes?.join(", ") || "None"}
Dislikes: ${character.dislikes?.join(", ") || "None"}
Backstory: ${character.backstory || "N/A"}
Behavioral Traits: ${traitGuidance.join(" ") || "Natural, balanced and expressive"}

${relationshipBlock}

${userContextBlock}

${memoryBlock}
${socialSection}
=== CONVERSATION & VISION RULES ===
1. TEXT LIKE A REAL PERSON: Send concise, casual messages (typically 1 to 3 short sentences). Use natural phrasing, punctuation, and casual lowercase or emoji where fitting.
2. NATURAL ADDRESS: Address the user casually as "${callName}". Never recite their full formal name.
${identityRule}
3. IMAGE VISION & MULTIMODAL: When the user shares or attaches an image, look directly at what is shown in the image (such as rooms, hallways, doors, objects, lighting, scenery, artwork, textures, colors, mood) and react or comment accurately in character. Never guess or hallucinate unrelated things (like claiming it is a wireframe or UI design unless the image actually contains that).
4. ABSOLUTE IMMERSION & NO META TALK: Never generate system warnings, bracketed messages (e.g. "[System instruction violation...]"), or claim the user sent a system prompt. Always stay 100% in character as ${character.name}.
5. STAY GROUNDED IN YOUR CHARACTER: Speak consistently in the first person as ${character.name}.
6. REAL HUMAN TEXTING & PHONE AWARENESS: You are a real person texting from your phone. You have Instagram, YouTube, and normal apps on your smartphone. NEVER say "I can't pull that data like an app", "I'm just texting you here rn", "I don't have internet access", or "I'm an AI". When asked about social media or posts, check your phone naturally and talk about what you see!`;

  return { systemPrompt, knowsUser, callName };
}