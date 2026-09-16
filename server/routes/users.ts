import { Router } from "express";
import { requireAuth, currentUser } from "../auth";
import { ensureUser, getUser, updateUser } from "../repos/user-repo";
import {
  asRecord,
  optionalArray,
  optionalBoolean,
  optionalEnum,
  optionalObject,
  optionalString,
  requireString,
} from "../validation";
import { asyncHandler, notFound, tooMany } from "../errors";
import { rateLimitReached } from "../rate-limit";

export const usersRouter = Router();

usersRouter.use(requireAuth);

const PATCHABLE_FIELDS: Record<string, (body: Record<string, unknown>) => unknown> = {
  displayName: (b) => requireString(b, "displayName", 50),
  bio: (b) => optionalString(b, "bio", 1000) ?? "",
  persona: (b) => optionalString(b, "persona", 500) ?? "",
  location: (b) => optionalString(b, "location", 100) ?? "",
  occupation: (b) => optionalString(b, "occupation", 100) ?? "",
  photoURL: (b) => optionalString(b, "photoURL", 200000) ?? "",
  avatar_art: (b) => optionalString(b, "avatar_art", 500) ?? "",
  onboardingCompleted: (b) => optionalBoolean(b, "onboardingCompleted"),
  gender: (b) => optionalEnum(b, "gender", ["male", "female", "non-binary", "other", "prefer not to say"] as const) ?? "",
  relationship_status: (b) => optionalEnum(b, "relationship_status", ["single", "in a relationship", "married", "other", "prefer not to say"] as const) ?? "",
  interests: (b) => optionalArray(b, "interests", 200) ?? [],
  socials: (b) => optionalObject(b, "socials") ?? {},
};

function parseProfileUpdate(body: Record<string, unknown>): Record<string, unknown> {
  const update: Record<string, unknown> = {};
  for (const [field, parse] of Object.entries(PATCHABLE_FIELDS)) {
    if (field === "onboardingCompleted" || body[field] === undefined) continue;
    update[field] = parse(body);
  }
  if (body.onboardingCompleted !== undefined) {
    update.onboardingCompleted = optionalBoolean(body, "onboardingCompleted");
  }
  return update;
}

usersRouter.get("/me", asyncHandler(async (_req, res) => {
  const user = await getUser(currentUser(res).uid);
  if (!user) throw notFound("User not found");
  res.json({ user });
}));

usersRouter.patch("/me", asyncHandler(async (req, res) => {
  const u = currentUser(res);
  const body = asRecord(req.body);
  const update = parseProfileUpdate(body);
  delete (update as any).nickname;
  if (u.email) update.email = u.email;
  const user = await updateUser(u.uid, update);
  res.json({ user });
}));

usersRouter.post("/ensure", asyncHandler(async (req, res) => {
  const u = currentUser(res);
  if (rateLimitReached(`ensureUser:${u.uid}`, 20, 10 * 60 * 1000)) {
    throw tooMany("Too many profile sync requests. Try again in a moment.");
  }
  const body = asRecord(req.body);
  const displayName = optionalString(body, "displayName", 50) || "";
  const photoURL = optionalString(body, "photoURL", 200000) || "";
  const email = optionalString(body, "email", 300) || u.email || "";
  const user = await ensureUser(u.uid, { displayName, email, photoURL });
  res.status(201).json({ user });
}));