import { auth } from "./firebase";
import type { Character, Chat, Memory, Message, User } from "../types";
import { generateAvatar, isPlaceholderUrl } from "./avatar";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function getFreshToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  signal?: AbortSignal,
  authRequired = true
): Promise<T> {
  const token = await getFreshToken();
  if (authRequired && !token) {
    throw new ApiError("Not signed in", 401, "unauthenticated");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error: any) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError("A network error occurred. Check your connection and try again.", 0, "network_error");
  }

  if (!res.ok) {
    let message = res.statusText;
    let code: string | undefined;
    try {
      const data = await res.json();
      message = data?.error || message;
      code = data?.code;
    } catch {
      // keep default message
    }
    throw new ApiError(message, res.status, code);
  }

  return res.json() as Promise<T>;
}

const profileUpdatedListeners = new Set<() => void>();

export function subscribeProfileUpdated(listener: () => void): () => void {
  profileUpdatedListeners.add(listener);
  return () => profileUpdatedListeners.delete(listener);
}

export function emitProfileUpdated(): void {
  profileUpdatedListeners.forEach((listener) => listener());
}

// ---- users ----

export async function getMe(): Promise<User | null> {
  const data = await request<{ user: User | null }>("GET", "/users/me");
  return data.user;
}

export function ensureUser(): Promise<{ user: User }> {
  const u = auth.currentUser;
  const displayName = u?.displayName || undefined;
  const email = u?.email || undefined;
  const photoURL =
    u?.photoURL && !isPlaceholderUrl(u.photoURL) ? u.photoURL : generateAvatar(u?.uid || "user");
  return request<{ user: User }>("POST", "/users/ensure", { displayName, email, photoURL });
}

export function updateMe(partial: Partial<User>): Promise<{ user: User }> {
  return request<{ user: User }>("PATCH", "/users/me", partial);
}

// ---- characters ----

export type CharacterScope = "mine" | "public";

export async function listCharacters(scope: CharacterScope = "public"): Promise<{ characters: Character[] }> {
  return request<{ characters: Character[] }>("GET", `/characters?scope=${scope}`, undefined, undefined, scope === "mine");
}

export function getCharacter(id: string): Promise<{ character: Character }> {
  return request<{ character: Character }>("GET", `/characters/${id}`, undefined, undefined, false);
}

export function createCharacter(data: Partial<Character>): Promise<{ character: Character }> {
  return request<{ character: Character }>("POST", "/characters", data);
}

export function updateCharacter(id: string, data: Partial<Character>): Promise<{ character: Character }> {
  return request<{ character: Character }>("PUT", `/characters/${id}`, data);
}

export function deleteCharacter(id: string): Promise<{ ok: true }> {
  return request<{ ok: true }>("DELETE", `/characters/${id}`);
}

export function duplicateCharacter(id: string): Promise<{ character: Character }> {
  return request<{ character: Character }>("POST", `/characters/${id}/duplicate`);
}

// ---- chats ----

export async function listChats(): Promise<{ chats: Chat[] }> {
  return request<{ chats: Chat[] }>("GET", "/chats");
}

export function createChat(characterId: string): Promise<{ chat: Chat }> {
  return request<{ chat: Chat }>("POST", "/chats", { characterId });
}

export async function getChat(id: string): Promise<{ chat: Chat; messages: Message[] }> {
  return request<{ chat: Chat; messages: Message[] }>("GET", `/chats/${id}`);
}

export function deleteChat(id: string): Promise<{ ok: true }> {
  return request<{ ok: true }>("DELETE", `/chats/${id}`);
}

export function deleteMessage(chatId: string, messageId: string): Promise<{ ok: true }> {
  return request<{ ok: true }>("DELETE", `/chats/${chatId}/messages/${messageId}`);
}

export async function clearChat(id: string): Promise<{ chat: Chat; messages: Message[] }> {
  return request<{ chat: Chat; messages: Message[] }>("POST", `/chats/${id}/clear`);
}

export function setChatMemories(chatId: string, memories: Memory[]): Promise<{ chat: Chat }> {
  return request<{ chat: Chat }>("PUT", `/chats/${chatId}/memories`, { memories });
}

// ---- ai ----

export interface ChatAttachmentInput {
  name: string;
  type: "image" | "file";
  /** Image payloads are sent as compressed data URIs so the server can see them. */
  data?: string;
  /** File payloads stay device-local; only a reference key is sent. */
  url?: string;
}

export interface ChatTurnRequest {
  chatId: string;
  text?: string;
  attachment?: ChatAttachmentInput;
  regenerate?: boolean;
  /** When regenerating, delete this specific assistant message first. */
  assistantMessageId?: string;
}

export interface ChatCompletionResult {
  choices: { message: { role: string; content: string } }[];
  userMessage: Message | null;
  assistantMessage: Message | null;
  memories?: Memory[];
}

export async function chatCompletion(
  input: ChatTurnRequest,
  signal?: AbortSignal
): Promise<ChatCompletionResult> {
  return request<ChatCompletionResult>("POST", "/chat", input, signal);
}