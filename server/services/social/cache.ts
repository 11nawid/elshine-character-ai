import type { SocialPerceptionData } from "./types";

interface CacheEntry {
  data: SocialPerceptionData;
  expiresAt: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const socialCache = new Map<string, CacheEntry>();

export function getCached(key: string): SocialPerceptionData | null {
  const entry = socialCache.get(key.toLowerCase());
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    socialCache.delete(key.toLowerCase());
    return null;
  }
  return entry.data;
}

export function setCached(key: string, data: SocialPerceptionData): void {
  if (socialCache.size > 200) {
    const oldestKey = socialCache.keys().next().value;
    if (oldestKey) socialCache.delete(oldestKey);
  }
  socialCache.set(key.toLowerCase(), {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

export function cleanHandle(raw: string): string {
  return raw.replace(/^@+/, "").trim().split(/[/?#]/)[0];
}
