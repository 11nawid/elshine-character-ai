import { Router } from "express";
import { requireAuth, currentUser } from "../auth";
import { asRecord, optionalBoolean, optionalObject, optionalString, requireEnum, requireString } from "../validation";
import {
  getChatForUser,
  listMessages,
  addMessage,
  setMemories,
  deleteMessage,
  type AttachmentDoc,
  type MessageDoc,
  type ToolExecutionStepDoc,
  type MessageToolExecutionDoc,
} from "../repos/chat-repo";
import { getCharacter, isVisibleTo } from "../repos/character-repo";
import { getUser, updateUser } from "../repos/user-repo";
import { filterRefusalMessages, sanitizeBracketedContent, isRefusalContent, generateInCharacterFallback } from "../genai/refusals";
import { convertMessagesToGeminiContents, type GeminiContent } from "../genai/convert";
import { buildChatSystemPrompt } from "../genai/prompt";
import { generateChatResponse, extractUserMemories } from "../genai/client";
import { asyncHandler, badRequest, notFound, tooMany } from "../errors";
import { rateLimitReached } from "../rate-limit";
import { resolveAndScrapeSocial, formatSocialPerceptionPrompt } from "../services/social-scraper";

export const aiRouter = Router();

aiRouter.use(requireAuth);

const CHAT_TURNS_PER_WINDOW = 30;
const WINDOW_MS = 10 * 60 * 1000;
const CONTEXT_MESSAGE_LIMIT = 30;
const CONTEXT_TEXT_LIMIT = 10000;

function messageToTurnItem(m: MessageDoc): { role: string; content: any } | null {
  const parts: any[] = [];
  if (m.text) parts.push({ type: "text", text: m.text });
  if (m.attachment && m.attachment.type === "image" && m.attachment.url.startsWith("data:")) {
    parts.push({ type: "image_url", image_url: { url: m.attachment.url } });
  }
  if (parts.length === 0) return null;
  return { role: m.role, content: parts };
}

function textLengthOf(item: { role: string; content: any }): number {
  if (typeof item.content === "string") return item.content.length;
  if (Array.isArray(item.content)) {
    return item.content.reduce(
      (sum, p) => (p && typeof p.text === "string" ? sum + p.text.length : sum),
      0
    );
  }
  return 0;
}

function lastUserText(messages: MessageDoc[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].text;
  }
  return "";
}

aiRouter.post("/chat", asyncHandler(async (req, res) => {
  const uid = currentUser(res).uid;
  const body = asRecord(req.body);
  const chatId = requireString(body, "chatId", 200);

  if (rateLimitReached(`chat:${uid}`, CHAT_TURNS_PER_WINDOW, WINDOW_MS)) {
    throw tooMany("You're sending messages too quickly. Give it a second and try again.");
  }

  const chat = await getChatForUser(uid, chatId);
  if (!chat) throw notFound("Chat not found");

  const character = await getCharacter(chat.characterId);
  if (!character || !isVisibleTo(character, uid)) throw notFound("Character not found");

  const regenerate = optionalBoolean(body, "regenerate") === true;
  const text = optionalString(body, "text", 6000) || "";

  let attachment: AttachmentDoc | undefined;
  const rawAttachment = optionalObject(body, "attachment");
  if (rawAttachment !== undefined) {
    const type = requireEnum(rawAttachment, "type", ["image", "file"] as const);
    const name = requireString(rawAttachment, "name", 300);
    const url = optionalString(rawAttachment, "url", 1500000) || "";
    const data = optionalString(rawAttachment, "data", 1500000) || "";
    attachment = { url: data || url, type, name };
  }

  if (!regenerate && !text && !attachment) {
    throw badRequest("Message text or attachment is required");
  }

  let storedMessages = await listMessages(chatId);

  if (regenerate) {
    const target = optionalString(body, "assistantMessageId", 200);
    let toRemove: string | null = target || null;
    if (target) {
      const match = storedMessages.find((m) => m.id === target);
      if (!match || match.role !== "assistant") toRemove = null;
    } else {
      toRemove = null;
      for (let i = storedMessages.length - 1; i >= 0; i--) {
        if (storedMessages[i].role === "assistant") {
          toRemove = storedMessages[i].id;
          break;
        }
      }
    }
    if (toRemove) {
      const fallback = chat.character?.greeting?.trim() || "Chat started";
      await deleteMessage(uid, chatId, toRemove, fallback);
      storedMessages = await listMessages(chatId);
    }
  }

  let userMessage: MessageDoc | null = null;
  if (!regenerate) {
    userMessage = await addMessage(uid, chatId, {
      role: "user",
      text,
      ...(attachment ? { attachment } : {}),
    });
    storedMessages = await listMessages(chatId);
  }

  if (storedMessages.length === 0) {
    const greeting = character.greeting?.trim() || "Chat started";
    const assistantMessage = await addMessage(uid, chatId, { role: "assistant", text: greeting });
    res.json({
      choices: [{ message: { role: "assistant", content: greeting } }],
      userMessage,
      assistantMessage,
    });
    return;
  }

  const recent = storedMessages.slice(-CONTEXT_MESSAGE_LIMIT);
  const items: Array<{ role: string; content: any }> = [];
  let totalText = 0;
  for (let i = recent.length - 1; i >= 0; i--) {
    const item = messageToTurnItem(recent[i]);
    if (!item) continue;
    const len = textLengthOf(item);
    if (totalText + len > CONTEXT_TEXT_LIMIT) break;
    totalText += len;
    items.unshift(item);
  }

  const cleanMessages = filterRefusalMessages(items);
  const contents: GeminiContent[] = convertMessagesToGeminiContents(cleanMessages);

  const profile = await getUser(uid);
  const memoryStrings = (chat.memories || []).map((m) => m.text).filter(Boolean);
  const lastUserMsgText = text || lastUserText(storedMessages);

  // Autonomous real-time social media inspection (Instagram & YouTube)
  let socialPerceptionBlock: string | undefined;
  let socialDataForMemory: string | undefined;
  let socialData: any = null;
  const toolSteps: ToolExecutionStepDoc[] = [];
  const startTs = Date.now();

  try {
    const recentChatText = storedMessages.slice(-6).map((m) => m.text).join("\n");
    const socialPerceptionTask = resolveAndScrapeSocial(lastUserMsgText, profile?.socials, recentChatText);
    socialData = await Promise.race([
      socialPerceptionTask,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
    ]);

    if (socialData) {
      const items = Array.isArray(socialData) ? socialData : [socialData];
      const promptBlocks: string[] = [];

      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        promptBlocks.push(formatSocialPerceptionPrompt(item));

        const isYT = item.platform === "youtube";
        const toolTitle = isYT ? "YouTube Scraper & Feed Engine" : "Instagram Profile & Media Scraper";
        const toolName = isYT ? "youtube_scraper" : "instagram_scraper";

        let outSummary = "";
        const metricsObj: Record<string, string | number | undefined> = {};

        if (item.profile) {
          const p = item.profile;
          if (isYT) {
            metricsObj.subscribers = p.subscribers || p.followers || "N/A";
            metricsObj.videos = p.videoCount || p.postCount || p.recentPosts?.length || 0;
            outSummary = `@${p.handle} • ${metricsObj.subscribers} • ${metricsObj.videos} videos`;
            if (p.handle && profile?.socials?.youtube !== p.handle) {
              updateUser(uid, { socials: { ...(profile?.socials || {}), youtube: p.handle } }).catch(() => {});
            }
          } else {
            metricsObj.followers = p.followers || 0;
            metricsObj.following = p.following || 0;
            metricsObj.posts = p.postCount || p.recentPosts?.length || 0;
            metricsObj.name = p.displayName || p.handle;
            outSummary = `@${p.handle} • ${metricsObj.followers} followers • ${metricsObj.following} following • ${metricsObj.posts} posts`;
            if (p.handle && profile?.socials?.instagram !== p.handle) {
              updateUser(uid, { socials: { ...(profile?.socials || {}), instagram: p.handle } }).catch(() => {});
            }
          }
        } else if (item.post) {
          outSummary = `Extracted post: "${item.post.titleOrCaption.slice(0, 60)}..."`;
          metricsObj.type = item.post.mediaType;
        }

        toolSteps.push({
          id: `tool_${Date.now()}_${idx + 1}`,
          toolName,
          title: toolTitle,
          status: item.notFound ? "failed" : "success",
          target: item.target,
          inputSummary: `Target: ${item.target || lastUserMsgText.slice(0, 60)}`,
          outputSummary: outSummary || (item.notFound ? "Target unreachable" : "Social payload loaded"),
          metrics: metricsObj,
          timestamp: Date.now(),
          durationMs: Date.now() - startTs,
        });

        if (item.post?.titleOrCaption) {
          socialDataForMemory = `User posted on ${item.platform}: "${item.post.titleOrCaption.slice(0, 150)}"`;
        } else if (item.recentPosts && item.recentPosts.length > 0) {
          socialDataForMemory = `User posted on ${item.platform}: "${item.recentPosts[0].titleOrCaption.slice(0, 150)}"`;
        }
      }

      socialPerceptionBlock = promptBlocks.join("\n\n");
    }
  } catch (err: any) {
    console.warn("Social scraping perception failed:", err?.message || err);
  }

  const { systemPrompt, knowsUser, callName } = buildChatSystemPrompt(
    character as any,
    (profile || {}) as any,
    memoryStrings,
    { socialPerceptionBlock }
  );

  // Start memory extraction concurrently with chat response generation for instant real-time sync
  const memoryTask = (async () => {
    try {
      const facts = await extractUserMemories(items);
      const combinedFacts = Array.isArray(facts) ? [...facts] : [];
      if (socialDataForMemory && !combinedFacts.some((f) => typeof f === "string" && f.includes(socialDataForMemory!))) {
        combinedFacts.push(socialDataForMemory);
      }

      if (combinedFacts.length === 0) return null;
      const current = await getChatForUser(uid, chatId);
      if (!current) return null;
      const existing = current.memories || [];
      const seen = new Set(existing.map((m) => m.text.toLowerCase().trim()));
      const fresh: Array<{ id: string; text: string; createdAt: number }> = combinedFacts
        .filter((f) => typeof f === "string" && f.trim().length > 3 && !seen.has(f.trim().toLowerCase()))
        .map((f) => ({
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          text: f.trim(),
          createdAt: Date.now(),
        }));
      if (fresh.length > 0) {
        const updated = [...existing, ...fresh];
        await setMemories(uid, chatId, updated);
        return updated;
      }
      return existing;
    } catch (err: any) {
      console.warn("Background memory extraction failed:", err?.message || err);
      return null;
    }
  })();

  let content = await generateChatResponse(contents, systemPrompt);
  if (content) {
    content = sanitizeBracketedContent(content);
  }

  if (!content || isRefusalContent(content)) {
    console.warn("Empty/refusal response detected; using in-character fallback.");
    content = generateInCharacterFallback(lastUserMsgText, {
      knowsUser,
      callName,
      characterName: character.name || "Elshine",
      socialData,
    });
  }

  const toolExecution: MessageToolExecutionDoc | undefined = toolSteps.length > 0 ? {
    userPrompt: lastUserMsgText,
    steps: toolSteps,
    summary: `${toolSteps.length} tool${toolSteps.length > 1 ? "s" : ""} executed`,
  } : undefined;

  const assistantMessage = await addMessage(uid, chatId, {
    role: "assistant",
    text: content,
    ...(toolExecution ? { toolExecution } : {}),
  });

  // Await memory extraction with a short fallback race
  const memoryResult = await Promise.race([
    memoryTask,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 1800)),
  ]);

  const currentChat = memoryResult ? null : await getChatForUser(uid, chatId);
  const memories = memoryResult || currentChat?.memories || chat.memories || [];

  res.json({
    choices: [{ message: { role: "assistant", content } }],
    userMessage,
    assistantMessage,
    memories,
  });
}));