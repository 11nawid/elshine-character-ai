import type { SocialPerceptionData } from "./types";
import { scrapeInstagramProfile, scrapeInstagramPost } from "./instagram";
import { scrapeYouTubeVideo, scrapeYouTubeChannel } from "./youtube";

export * from "./types";
export * from "./cache";
export * from "./instagram";
export * from "./youtube";
export * from "./prompt-formatter";

/**
 * High-level Intent Detector & Autonomous Social Scraper
 * Inspects user chat text and user profile socials to determine if the user is asking
 * about their social media, posts, videos, or profiles.
 */
export async function resolveAndScrapeSocial(
  messageText: string,
  userSocials?: Record<string, any>
): Promise<SocialPerceptionData | null> {
  const text = messageText.trim();
  if (!text) return null;

  // 1. Direct Instagram Post / Reel URL
  const igPostMatch = text.match(/https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
  if (igPostMatch) return await scrapeInstagramPost(igPostMatch[0]);

  // 2. Direct YouTube Video URL
  const ytVideoMatch = text.match(
    /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i
  );
  if (ytVideoMatch) return await scrapeYouTubeVideo(ytVideoMatch[0]);

  // 3. Direct YouTube Channel URL
  const ytChannelMatch = text.match(/https?:\/\/(?:www\.)?youtube\.com\/@([A-Za-z0-9._-]+)/i);
  if (ytChannelMatch) return await scrapeYouTubeChannel(ytChannelMatch[1]);

  // 4. Direct Instagram Profile URL
  const igProfileMatch = text.match(/https?:\/\/(?:www\.)?instagram\.com\/([A-Za-z0-9._-]+)\/?/i);
  if (igProfileMatch) {
    const handle = igProfileMatch[1];
    if (!["p", "reel", "stories", "explore"].includes(handle.toLowerCase())) {
      return await scrapeInstagramProfile(handle);
    }
  }

  // 5. Explicit handles in text (e.g. "check my ig @username", "youtube is @channel")
  const igHandleMatch = text.match(/(?:instagram|insta|ig)\s+(?:is\s+|account\s+)?@([A-Za-z0-9._-]+)/i)
    || text.match(/@([A-Za-z0-9._-]+)\s+(?:on\s+)?(?:instagram|insta|ig)/i);
  if (igHandleMatch) return await scrapeInstagramProfile(igHandleMatch[1]);

  const ytHandleMatch = text.match(/(?:youtube|yt|channel)\s+(?:is\s+)?@([A-Za-z0-9._-]+)/i)
    || text.match(/@([A-Za-z0-9._-]+)\s+(?:on\s+)?(?:youtube|yt)/i);
  if (ytHandleMatch) return await scrapeYouTubeChannel(ytHandleMatch[1]);

  // 6. Conversational requests referencing user's posts or videos -> fallback to profile socials!
  const mentionsPost = /\b(last|new|recent|latest)?\s*(post|reel|picture|photo|pic|story|feed|profile|upload)\b/i.test(text);
  const mentionsVideo = /\b(last|new|recent|latest)?\s*(video|vlog|short|channel|stream)\b/i.test(text);
  const asksToCheck = /\b(check|look\s+at|did\s+you\s+see|have\s+you\s+seen|watch|visit|view|see)\b/i.test(text);

  if (asksToCheck || mentionsPost || mentionsVideo) {
    if (mentionsVideo || /\b(youtube|yt)\b/i.test(text)) {
      const ytHandle = userSocials?.youtube;
      if (ytHandle && typeof ytHandle === "string") {
        return await scrapeYouTubeChannel(ytHandle);
      }
    }

    if (mentionsPost || /\b(instagram|insta|ig)\b/i.test(text) || asksToCheck) {
      const igHandle = userSocials?.instagram;
      if (igHandle && typeof igHandle === "string") {
        return await scrapeInstagramProfile(igHandle);
      }
    }
  }

  return null;
}
