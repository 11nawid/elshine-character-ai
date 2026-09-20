import { db } from "../firebase-admin";
import { getCharacter, isVisibleTo, type CharacterDoc } from "./character-repo";

export interface MemoryDoc {
  id: string;
  text: string;
  createdAt: number;
}

export interface AttachmentDoc {
  url: string;
  type: "image" | "file";
  name: string;
}

export interface ToolExecutionStepDoc {
  id: string;
  toolName: string;
  title: string;
  status: "running" | "success" | "failed" | "fallback";
  target?: string;
  inputSummary?: string;
  outputSummary?: string;
  metrics?: Record<string, string | number | undefined>;
  timestamp: number;
  durationMs?: number;
}

export interface MessageToolExecutionDoc {
  userPrompt: string;
  steps: ToolExecutionStepDoc[];
  summary: string;
}

export interface MessageDoc {
  id: string;
  chatId: string;
  senderId: string;
  role: "user" | "assistant";
  text: string;
  attachment?: AttachmentDoc;
  toolExecution?: MessageToolExecutionDoc;
  createdAt: number;
}

export interface ChatDoc {
  id: string;
  userId: string;
  characterId: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: number;
  unread?: boolean;
  memories?: MemoryDoc[];
  character?: CharacterDoc | null;
  [key: string]: unknown;
}

export interface AddMessageInput {
  role: "user" | "assistant";
  text: string;
  attachment?: AttachmentDoc;
  toolExecution?: MessageToolExecutionDoc;
}

function toChat(id: string, data: any): ChatDoc {
  return { id, ...data } as ChatDoc;
}

function toMessage(id: string, data: any): MessageDoc {
  return { id, ...data } as MessageDoc;
}

async function enrichChat(chat: ChatDoc, viewerId: string): Promise<ChatDoc> {
  try {
    const character = await getCharacter(chat.characterId);
    chat.character = character && isVisibleTo(character, viewerId) ? character : null;
  } catch {
    chat.character = null;
  }
  return chat;
}

export async function listChatsForUser(uid: string): Promise<ChatDoc[]> {
  const snap = await db.collection("chats").where("userId", "==", uid).limit(200).get();
  const chats = snap.docs
    .map((d) => toChat(d.id, d.data()))
    .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
  return Promise.all(chats.map((c) => enrichChat(c, uid)));
}

export async function getChatForUser(uid: string, chatId: string): Promise<ChatDoc | null> {
  const snap = await db.collection("chats").doc(chatId).get();
  if (!snap.exists) return null;
  const chat = toChat(snap.id, snap.data());
  if (chat.userId !== uid) return null;
  return enrichChat(chat, uid);
}

export async function createChat(uid: string, character: CharacterDoc): Promise<ChatDoc> {
  const now = Date.now();
  const greeting = character.greeting?.trim();
  const data = {
    userId: uid,
    characterId: character.id,
    participants: [uid, character.id],
    lastMessage: greeting || "Chat started",
    lastMessageAt: now,
    memories: [],
  };
  const ref = await db.collection("chats").add(data);
  if (greeting) {
    await db
      .collection("chats")
      .doc(ref.id)
      .collection("messages")
      .add({ chatId: ref.id, senderId: "assistant", role: "assistant", text: greeting, createdAt: now });
  }
  return toChat(ref.id, { ...data, character });
}

export async function listMessages(chatId: string, limit = 200): Promise<MessageDoc[]> {
  const cap = Math.min(Math.max(1, limit), 500);
  const snap = await db
    .collection("chats")
    .doc(chatId)
    .collection("messages")
    .orderBy("createdAt", "desc")
    .limit(cap)
    .get();
  return snap.docs.map((d) => toMessage(d.id, d.data())).reverse();
}

export async function addMessage(uid: string, chatId: string, input: AddMessageInput): Promise<MessageDoc> {
  const now = Date.now();
  const senderId = input.role === "user" ? uid : "assistant";
  const data = {
    chatId,
    senderId,
    role: input.role,
    text: input.text,
    ...(input.attachment ? { attachment: input.attachment } : {}),
    ...(input.toolExecution ? { toolExecution: input.toolExecution } : {}),
    createdAt: now,
  };
  const ref = await db.collection("chats").doc(chatId).collection("messages").add(data);

  const label = input.attachment
    ? `[${input.attachment.type === "image" ? "Image" : "File"}] ${input.text}`.trim()
    : input.text;
  await db.collection("chats").doc(chatId).update({ lastMessage: label, lastMessageAt: now });

  return toMessage(ref.id, data);
}

async function recomputeLastMessage(chatId: string, fallback: string): Promise<void> {
  const snap = await db.collection("chats").doc(chatId).collection("messages").orderBy("createdAt", "desc").limit(1).get();
  if (snap.size === 0) {
    await db.collection("chats").doc(chatId).update({ lastMessage: fallback, lastMessageAt: Date.now() });
    return;
  }
  const last = snap.docs[0].data();
  await db.collection("chats").doc(chatId).update({ lastMessage: last.text || fallback, lastMessageAt: last.createdAt || Date.now() });
}

export async function deleteMessage(uid: string, chatId: string, messageId: string, fallback: string): Promise<void> {
  await db.collection("chats").doc(chatId).collection("messages").doc(messageId).delete();
  await recomputeLastMessage(chatId, fallback);
}

export async function clearChat(uid: string, chatId: string, greetingReset: string): Promise<ChatDoc | null> {
  const chat = await getChatForUser(uid, chatId);
  if (!chat) return null;
  const ref = db.collection("chats").doc(chatId);
  const msgs = await ref.collection("messages").get();
  await Promise.all(msgs.docs.map((d) => d.ref.delete()));
  await ref.update({ lastMessage: greetingReset, lastMessageAt: Date.now(), memories: [] });
  const snap = await ref.get();
  return toChat(snap.id, snap.data());
}

export async function deleteChat(uid: string, chatId: string): Promise<boolean> {
  const chat = await getChatForUser(uid, chatId);
  if (!chat) return false;
  const ref = db.collection("chats").doc(chatId);
  const msgs = await ref.collection("messages").get();
  await Promise.all(msgs.docs.map((d) => d.ref.delete()));
  await ref.delete();
  return true;
}

export async function setMemories(uid: string, chatId: string, memories: MemoryDoc[]): Promise<ChatDoc | null> {
  const chat = await getChatForUser(uid, chatId);
  if (!chat) return null;
  await db.collection("chats").doc(chatId).update({ memories });
  const snap = await db.collection("chats").doc(chatId).get();
  return toChat(snap.id, snap.data());
}