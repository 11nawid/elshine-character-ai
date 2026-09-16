import { Router } from "express";
import { requireAuth, currentUser } from "../auth";
import {
  createCharacter,
  deleteCharacter,
  duplicateCharacter,
  getCharacter,
  isVisibleTo,
  listCharactersByCreator,
  listPublicCharacters,
  updateCharacter,
} from "../repos/character-repo";
import { getUser } from "../repos/user-repo";
import {
  asRecord,
  optionalBoolean,
  optionalEnum,
  optionalObject,
  optionalString,
  requireArray,
  requireEnum,
  requireString,
} from "../validation";
import { asyncHandler, forbidden, notFound } from "../errors";

export const charactersRouter = Router();

charactersRouter.use(requireAuth);

const VISIBILITIES = ["public", "private", "unlisted"] as const;
const RATINGS = ["general", "mature"] as const;

function extractCharacterFields(body: Record<string, unknown>): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  data.name = requireString(body, "name", 100);
  data.description = requireString(body, "description", 3000);
  data.personality = requireString(body, "personality", 3000);
  const greeting = optionalString(body, "greeting", 3000);
  data.greeting = greeting ?? "";
  data.visibility = requireEnum(body, "visibility", VISIBILITIES);
  data.rating = requireEnum(body, "rating", RATINGS);

  const avatarUrl = optionalString(body, "avatarUrl", 200000);
  if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;

  if (body.tags !== undefined) {
    data.tags = requireArray(body, "tags", 100).filter((item): item is string => typeof item === "string").slice(0, 100);
  }

  const traits = optionalObject(body, "traits");
  if (traits !== undefined) {
    const cleanTraits: Record<string, number> = {};
    for (const [key, value] of Object.entries(traits)) {
      if (typeof value === "number" && value >= 0 && value <= 100) cleanTraits[key] = value;
    }
    data.traits = cleanTraits;
  }

  const likes = requireArray(body, "likes", 100).filter((item): item is string => typeof item === "string").slice(0, 100);
  data.likes = likes;

  const dislikes = requireArray(body, "dislikes", 100).filter((item): item is string => typeof item === "string").slice(0, 100);
  data.dislikes = dislikes;

  const optionalTextFields = ["backstory", "speakingStyle", "userRelationship", "sharedHistory", "userNickname"] as const;
  for (const field of optionalTextFields) {
    const value = optionalString(body, field, 3000);
    if (value !== undefined) data[field] = value;
  }

  if (body.knowsUserFromStart !== undefined && body.knowsUserFromStart !== null) {
    data.knowsUserFromStart = optionalBoolean(body, "knowsUserFromStart");
  }

  return data;
}

async function creatorNameFor(uid: string, fallback?: string): Promise<string> {
  const user = await getUser(uid);
  return user?.displayName || fallback || "Anonymous";
}

charactersRouter.get("/", asyncHandler(async (req, res) => {
  const scope = req.query.scope === "mine" ? "mine" : "public";
  const characters = scope === "mine" ? await listCharactersByCreator(currentUser(res).uid) : await listPublicCharacters();
  res.json({ characters });
}));

charactersRouter.get("/:id", asyncHandler(async (req, res) => {
  const character = await getCharacter(req.params.id);
  if (!character) throw notFound("Character not found");
  if (!isVisibleTo(character, currentUser(res).uid)) {
    throw forbidden("You don't have access to this character");
  }
  res.json({ character });
}));

charactersRouter.post("/", asyncHandler(async (req, res) => {
  const body = asRecord(req.body);
  const data = extractCharacterFields(body);
  const u = currentUser(res);
  const character = await createCharacter(u.uid, await creatorNameFor(u.uid, u.displayName), data);
  res.status(201).json({ character });
}));

charactersRouter.put("/:id", asyncHandler(async (req, res) => {
  const uid = currentUser(res).uid;
  const character = await getCharacter(req.params.id);
  if (!character) throw notFound("Character not found");
  if (character.creatorId !== uid) throw forbidden("You can only edit your own characters");

  const body = asRecord(req.body);
  const data = extractCharacterFields(body);
  const updated = await updateCharacter(req.params.id, data);
  res.json({ character: updated });
}));

charactersRouter.delete("/:id", asyncHandler(async (req, res) => {
  const uid = currentUser(res).uid;
  const character = await getCharacter(req.params.id);
  if (!character) throw notFound("Character not found");
  if (character.creatorId !== uid) throw forbidden("You can only delete your own characters");

  await deleteCharacter(req.params.id);
  res.json({ ok: true });
}));

charactersRouter.post("/:id/duplicate", asyncHandler(async (req, res) => {
  const uid = currentUser(res).uid;
  const source = await getCharacter(req.params.id);
  if (!source) throw notFound("Character not found");
  if (!isVisibleTo(source, uid)) throw forbidden("You don't have access to this character");

  const character = await duplicateCharacter(req.params.id, uid, await creatorNameFor(uid, currentUser(res).displayName));
  res.status(201).json({ character });
}));