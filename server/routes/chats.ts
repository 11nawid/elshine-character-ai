import { Router } from "express";
import { requireAuth, currentUser } from "../auth";
import {
  addMessage,
  clearChat,
  createChat,
  deleteChat,
  deleteMessage,
  getChatForUser,
  listChatsForUser,
  listMessages,
  setMemories,
  type AttachmentDoc,
  type MemoryDoc,
} from "../repos/chat-repo";
import { getCharacter, isVisibleTo } from "../repos/character-repo";
import {
  asRecord,
  optionalObject,
  requireArray,
  requireEnum,
  requireString,
} from "../validation";
import { asyncHandler, notFound, tooMany } from "../errors";
import { rateLimitReached } from "../rate-limit";
import { extractUserMemories } from "../genai/client";

export const chatsRouter = Router();

chatsRouter.use(requireAuth);

async function ownedChat(uid: string, chatId: string) {
  const chat = await getChatForUser(uid, chatId);
  if (!chat) throw notFound("Chat not found");
  return chat;
}

chatsRouter.get("/", asyncHandler(async (_req, res) => {
  const chats = await listChatsForUser(currentUser(res).uid);
  res.json({ chats });
}));

chatsRouter.post("/", asyncHandler(async (req, res) => {
  const uid = currentUser(res).uid;
  if (rateLimitReached(`createChat:${uid}`, 20, 10 * 60 * 1000)) {
    throw tooMany("You're creating chats too quickly. Try again in a moment.");
  }
  const body = asRecord(req.body);
  const characterId = requireString(body, "characterId", 200);
  const character = await getCharacter(characterId);
  if (!character) throw notFound("Character not found");
  if (!isVisibleTo(character, uid)) throw notFound("Character not found");

  const chat = await createChat(uid, character);
  res.status(201).json({ chat });
}));

chatsRouter.get("/:id", asyncHandler(async (req, res) => {
  const uid = currentUser(res).uid;
  const chat = await ownedChat(uid, req.params.id);
  const limit = Math.min(Math.max(1, Number(req.query.limit) || 200), 500);
  const messages = await listMessages(req.params.id, limit);

  // If this chat has conversation history but no memories yet, backfill in background
  if ((!chat.memories || chat.memories.length === 0) && messages.length >= 2) {
    const formatted = messages.map((m) => ({ role: m.role, content: m.text }));
    extractUserMemories(formatted)
      .then(async (facts) => {
        if (!Array.isArray(facts) || facts.length === 0) return;
        const fresh: MemoryDoc[] = facts
          .filter((f) => typeof f === "string" && f.trim().length > 3)
          .map((f) => ({
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            text: f.trim(),
            createdAt: Date.now(),
          }));
        if (fresh.length > 0) {
          await setMemories(uid, req.params.id, fresh);
        }
      })
      .catch((err) => console.warn("Background legacy memory backfill failed:", err?.message || err));
  }

  res.json({ chat, messages });
}));

chatsRouter.delete("/:id", asyncHandler(async (req, res) => {
  const uid = currentUser(res).uid;
  const ok = await deleteChat(uid, req.params.id);
  if (!ok) throw notFound("Chat not found");
  res.json({ ok: true });
}));

chatsRouter.get("/:id/messages", asyncHandler(async (req, res) => {
  const uid = currentUser(res).uid;
  await ownedChat(uid, req.params.id);
  const limit = Math.min(Math.max(1, Number(req.query.limit) || 200), 500);
  const messages = await listMessages(req.params.id, limit);
  res.json({ messages });
}));

chatsRouter.post("/:id/messages", asyncHandler(async (req, res) => {
  const uid = currentUser(res).uid;
  const chatId = req.params.id;
  await ownedChat(uid, chatId);

  if (rateLimitReached(`addMessage:${uid}`, 60, 10 * 60 * 1000)) {
    throw tooMany("You're sending messages too quickly. Slow down a little.");
  }

  const body = asRecord(req.body);
  // Assistant messages are persisted exclusively by the server during /api/chat;
  // clients may only append their own user messages here.
  const role = requireEnum(body, "role", ["user"] as const);
  const text = requireString(body, "text", 6000);

  let attachment: AttachmentDoc | undefined;
  const rawAttachment = optionalObject(body, "attachment");
  if (rawAttachment !== undefined) {
    const url = requireString(rawAttachment, "url", 1500000);
    const type = requireEnum(rawAttachment, "type", ["image", "file"] as const);
    const name = requireString(rawAttachment, "name", 300);
    attachment = { url, type, name };
  }

  const message = await addMessage(uid, chatId, { role, text, attachment });
  res.status(201).json({ message });
}));

chatsRouter.delete("/:id/messages/:messageId", asyncHandler(async (req, res) => {
  const uid = currentUser(res).uid;
  const chat = await ownedChat(uid, req.params.id);
  const fallback = chat.character?.greeting?.trim() || "Chat started";
  await deleteMessage(uid, req.params.id, req.params.messageId, fallback);
  res.json({ ok: true });
}));

chatsRouter.post("/:id/clear", asyncHandler(async (req, res) => {
  const uid = currentUser(res).uid;
  const chat = await ownedChat(uid, req.params.id);
  const reset = chat.character?.greeting?.trim() || "Chat started";
  const cleared = await clearChat(uid, req.params.id, reset);
  res.json({ chat: cleared, messages: [] });
}));

chatsRouter.put("/:id/memories", asyncHandler(async (req, res) => {
  const uid = currentUser(res).uid;
  const chatId = req.params.id;
  await ownedChat(uid, chatId);

  const body = asRecord(req.body);
  const raw = requireArray(body, "memories", 200);
  const memories: MemoryDoc[] = raw
    .filter((item): item is Record<string, unknown> =>
      typeof item === "object" && item !== null && !Array.isArray(item)
    )
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : String(Date.now() + Math.random()),
      text: typeof item.text === "string" ? item.text.slice(0, 1000) : "",
      createdAt: typeof item.createdAt === "number" ? item.createdAt : Date.now(),
    }))
    .filter((m) => m.text.length > 0);

  const chat = await setMemories(uid, chatId, memories);
  res.json({ chat });
}));