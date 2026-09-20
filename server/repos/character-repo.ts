import { db } from "../firebase-admin";

export interface CharacterDoc {
  id: string;
  creatorId: string;
  creatorName?: string;
  name: string;
  description: string;
  personality: string;
  greeting: string;
  visibility: "public" | "private" | "unlisted";
  rating: "general" | "mature";
  avatarUrl?: string;
  tags?: string[];
  traits?: Record<string, number>;
  backstory?: string;
  speakingStyle?: string;
  likes?: string[];
  dislikes?: string[];
  knowsUserFromStart?: boolean;
  userRelationship?: string;
  sharedHistory?: string;
  userNickname?: string;
  stats?: { conversations?: number; likes?: number };
  createdAt: number;
  updatedAt?: number;
  isPinned?: boolean;
  [key: string]: unknown;
}

const PUBLIC_FIELD_ORDER: (keyof CharacterDoc)[] = [];

function toDoc(id: string, data: any): CharacterDoc {
  return { id, ...data } as CharacterDoc;
}

export function isVisibleTo(character: CharacterDoc, viewerId?: string): boolean {
  return character.visibility === "public" || character.visibility === "unlisted" || character.creatorId === viewerId;
}

export async function listPublicCharacters(limit = 100): Promise<CharacterDoc[]> {
  try {
    const snap = await db.collection("characters").where("visibility", "==", "public").limit(limit).get();
    const existing = snap.docs.map((d) => toDoc(d.id, d.data()));
    const existingIds = new Set(existing.map((c) => c.id));
    const missingStarters = DEFAULT_STARTER_CHARACTERS
      .filter((c) => c.visibility === "public" && !existingIds.has(c.id))
      .map((c) => ({ ...c, createdAt: c.createdAt || Date.now() } as CharacterDoc));
    return [...existing, ...missingStarters].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  } catch (err) {
    console.warn("Error fetching public characters from db, using defaults:", err);
    return DEFAULT_STARTER_CHARACTERS as CharacterDoc[];
  }
}

export async function listCharactersByCreator(creatorId: string): Promise<CharacterDoc[]> {
  const snap = await db.collection("characters").where("creatorId", "==", creatorId).get();
  return snap.docs
    .map((d) => toDoc(d.id, d.data()))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function getCharacter(id: string): Promise<CharacterDoc | null> {
  try {
    const snap = await db.collection("characters").doc(id).get();
    if (snap.exists) return toDoc(snap.id, snap.data());
  } catch (err) {
    console.warn(`Error fetching character ${id}:`, err);
  }
  const fallback = DEFAULT_STARTER_CHARACTERS.find((c) => c.id === id);
  return fallback ? ({ ...fallback, createdAt: fallback.createdAt || Date.now() } as CharacterDoc) : null;
}

export async function createCharacter(
  uid: string,
  creatorName: string,
  payload: Record<string, unknown>
): Promise<CharacterDoc> {
  const now = Date.now();
  const tags = Array.isArray(payload.tags) && payload.tags.length ? payload.tags : ["Neural Proxy"];
  const data: Record<string, unknown> = {
    ...payload,
    creatorId: uid,
    creatorName,
    tags,
    stats: { conversations: 0, likes: 0 },
    createdAt: now,
    updatedAt: now,
  };
  const ref = await db.collection("characters").add(data);
  return toDoc(ref.id, data);
}

export async function updateCharacter(id: string, payload: Record<string, unknown>): Promise<CharacterDoc> {
  const ref = db.collection("characters").doc(id);
  const data = { ...payload, updatedAt: Date.now() };
  await ref.update(data);
  const snap = await ref.get();
  return toDoc(snap.id, snap.data()!);
}

export async function deleteCharacter(id: string): Promise<void> {
  await db.collection("characters").doc(id).delete();
}

export async function duplicateCharacter(sourceId: string, uid: string, creatorName: string): Promise<CharacterDoc | null> {
  const source = await getCharacter(sourceId);
  if (!source) return null;

  const now = Date.now();
  const data: Record<string, unknown> = {
    ...source,
    id: undefined,
    creatorId: uid,
    creatorName,
    name: `Copy of ${source.name}`,
    stats: { conversations: 0, likes: 0 },
    createdAt: now,
    updatedAt: now,
  };
  delete data.id;
  const ref = await db.collection("characters").add(data);
  return toDoc(ref.id, data);
}

import { DEFAULT_STARTER_CHARACTERS, StarterCharacterDef } from "./starter-characters";

export { DEFAULT_STARTER_CHARACTERS, StarterCharacterDef };

export async function ensureDefaultCharacters(): Promise<void> {
  try {
    for (const char of DEFAULT_STARTER_CHARACTERS) {
      const docRef = db.collection("characters").doc(char.id);
      const snap = await docRef.get();
      const now = Date.now();
      if (!snap.exists) {
        await docRef.set({
          ...char,
          createdAt: char.createdAt || now,
          updatedAt: now,
        });
      } else {
        await docRef.set({
          ...char,
          createdAt: snap.data()?.createdAt || now,
          updatedAt: now,
        }, { merge: true });
      }
    }
  } catch (err) {
    console.warn("Could not seed default characters:", err);
  }
}

export { PUBLIC_FIELD_ORDER };