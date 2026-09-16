import { db } from "../firebase-admin";

export interface UserDoc {
  uid?: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  bio?: string;
  nickname?: string;
  persona?: string;
  location?: string;
  occupation?: string;
  interests?: string[];
  socials?: Record<string, unknown>;
  onboardingCompleted?: boolean;
  updatedAt?: number;
  createdAt?: number;
  [key: string]: unknown;
}

function withId(id: string, data: any): UserDoc {
  return { ...data, uid: id };
}

function emailLocalPart(email?: string | null): string {
  if (!email) return "";
  const at = email.indexOf("@");
  return at > 0 ? email.slice(0, at) : email;
}

export function generateNickname(displayName?: string | null, email?: string | null, uid?: string): string {
  const base = (displayName?.trim() || emailLocalPart(email) || "user")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .replace(/^_+/, "");
  const cleanBase = base.length >= 2 ? base.slice(0, 15) : "user";
  const suffix = uid
    ? uid.slice(0, 6).toLowerCase().replace(/[^a-z0-9]/g, "")
    : Math.random().toString(36).slice(2, 8);
  return `${cleanBase}_${suffix}`;
}

export async function getUser(uid: string): Promise<UserDoc | null> {
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data() || {};
  if (!data.nickname || !String(data.nickname).trim()) {
    const generated = generateNickname(data.displayName, data.email, uid);
    data.nickname = generated;
    await ref.set({ nickname: generated, updatedAt: Date.now() }, { merge: true });
  }
  return withId(snap.id, data);
}

export async function ensureUser(
  uid: string,
  authInfo: { displayName?: string | null; email?: string | null; photoURL?: string | null }
): Promise<UserDoc> {
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();

  const displayName = authInfo.displayName || emailLocalPart(authInfo.email);
  const photoURL = authInfo.photoURL || "";

  if (snap.exists) {
    const data = snap.data() || {};
    const update: Record<string, unknown> = {};
    if (!data.displayName && displayName) update.displayName = displayName;
    if (authInfo.email && !data.email) update.email = authInfo.email;
    if (!data.photoURL && photoURL) update.photoURL = photoURL;
    if (!data.nickname || !String(data.nickname).trim()) {
      update.nickname = generateNickname(data.displayName || displayName, authInfo.email || data.email, uid);
    }
    if (Object.keys(update).length > 0) {
      update.updatedAt = Date.now();
      await ref.set(update, { merge: true });
    }
    return withId(snap.id, { ...data, ...update });
  }

  const now = Date.now();
  const generatedNickname = generateNickname(displayName, authInfo.email, uid);
  const data: Record<string, unknown> = {
    displayName: displayName || uid.slice(0, 8),
    nickname: generatedNickname,
    email: authInfo.email || "",
    photoURL,
    onboardingCompleted: false,
    createdAt: now,
  };
  await ref.set(data);
  return withId(uid, data);
}

export async function updateUser(uid: string, partial: Record<string, unknown>): Promise<UserDoc> {
  const ref = db.collection("users").doc(uid);
  // Nickname is permanent and never changeable
  delete (partial as any).nickname;
  partial.updatedAt = Date.now();
  await ref.set(partial, { merge: true });
  const snap = await ref.get();
  return withId(snap.id, snap.data()!);
}