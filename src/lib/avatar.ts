import { createAvatar } from "@dicebear/core";
import type { Style } from "@dicebear/core";
import * as dicebear from "@dicebear/collection";
import type { Character, User } from "../types";

/**
 * Fully local, free, unlimited avatar generation (DiceBear, MIT licensed).
 * Avatars are deterministic per seed and rendered as data URIs — no network,
 * no API keys, no quotas.
 */

const STYLES: Style<any>[] = [
  dicebear.adventurer,
  dicebear.avataaars,
  dicebear.bottts,
  dicebear.croodles,
  dicebear.dylan,
  dicebear.funEmoji,
  dicebear.glass,
  dicebear.identicon,
  dicebear.initials,
  dicebear.lorelei,
  dicebear.micah,
  dicebear.miniavs,
  dicebear.notionists,
  dicebear.openPeeps,
  dicebear.personas,
  dicebear.pixelArt,
  dicebear.rings,
  dicebear.shapes,
  dicebear.thumbs,
  dicebear.toonHead,
];

const BACKGROUNDS = [
  "d1d4f9",
  "f1d4d4",
  "ffd5dc",
  "ffe8d1",
  "d1f4d9",
  "bce0ff",
  "fde2a7",
  "c9ddc5",
  "e8d1ff",
  "d5e5ef",
  "efefef",
  "e5e5e5",
];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function generateAvatar(seed: string, size = 256): string {
  const style = STYLES[hashSeed(seed) % STYLES.length];
  const background = BACKGROUNDS[hashSeed(`${seed}·bg`) % BACKGROUNDS.length];
  const avatar = createAvatar(style, {
    seed,
    size,
    backgroundColor: [background],
  });
  return avatar.toDataUri();
}

const PLACEHOLDER_HOSTS = ["images.unsplash.com"];

/** True when the URL is one of the old hardcoded placeholder images (or empty). */
export function isPlaceholderUrl(url?: string | null): boolean {
  if (!url) return true;
  try {
    const host = new URL(url).hostname;
    if (PLACEHOLDER_HOSTS.includes(host)) return true;
  } catch {
    // unparseable (e.g. relative) — treat as a real custom value
  }
  return false;
}

/** Returns the stored real avatar if present, otherwise a generated avatar from the seed. */
export function avatarUrlFor(stored: string | null | undefined, seed: string): string {
  return stored && !isPlaceholderUrl(stored) ? stored : generateAvatar(seed);
}

export function userAvatar(
  user: { uid?: string; photoURL?: string | null; email?: string | null; displayName?: string | null } | null | undefined
): string {
  if (!user) return generateAvatar("anonymous");
  return avatarUrlFor(user.photoURL, user.uid || user.email || user.displayName || "user");
}

export function characterAvatar(char: { id?: string; name?: string; avatarUrl?: string | null } | null | undefined): string {
  if (!char) return generateAvatar("character");
  return avatarUrlFor(char.avatarUrl, char.id || char.name || "character");
}

/** A stable personal style picker option for the profile editor. */
export function avatarOption(seed: string, size = 96): string {
  return generateAvatar(seed, size);
}