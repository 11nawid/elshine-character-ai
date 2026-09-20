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
  userSocials?: Record<string, any>,
  recentChatText?: string
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

  // 6. Conversational requests referencing user's posts, subscribers, or profile -> fallback to profile socials or chat history!
  const mentionsPost = /\b(last|new|recent|latest)?\s*(post|reel|picture|photo|pic|story|feed|upload)\b/i.test(text);
  const mentionsVideo = /\b(last|new|recent|latest)?\s*(video|vlog|short|channel|stream)\b/i.test(text);
  const mentionsSubs = /\b(subs?|subscribers?|sub\s*count)\b/i.test(text);
  const mentionsProfile = /\b(followers?|following|posts?|names?|profile|bio|account|stats?)\b/i.test(text);
  const asksToCheck = /\b(check|look\s+at|did\s+you\s+see|have\s+you\s+seen|watch|visit|view|see|know|tell\s+me|how\s+many)\b/i.test(text);

  if (asksToCheck || mentionsPost || mentionsVideo || mentionsProfile || mentionsSubs) {
    if (mentionsSubs || mentionsVideo || /\b(youtube|yt)\b/i.test(text)) {
      let ytHandle = userSocials?.youtube;
      if (!ytHandle && recentChatText) {
        const atMatch = recentChatText.match(/@([A-Za-z0-9._-]+)/);
        if (atMatch && !["is", "the", "your", "my", "an", "a", "it", "this"].includes(atMatch[1].toLowerCase())) {
          ytHandle = atMatch[1];
        } else {
          const found = recentChatText.match(/(?:youtube|yt|channel)\s+(?:is\s+|account\s+)?[:=]?\s*@?([A-Za-z0-9._-]+)/i);
          if (found && !["is", "the", "your", "my", "an", "a", "it", "this"].includes(found[1].toLowerCase())) {
            ytHandle = found[1];
          }
        }
      }
      if (ytHandle && typeof ytHandle === "string") {
        return await scrapeYouTubeChannel(ytHandle);
      }
    }

    if (mentionsPost || mentionsProfile || /\b(instagram|insta|ig)\b/i.test(text) || asksToCheck) {
      let igHandle = userSocials?.instagram;
      if (!igHandle && recentChatText) {
        const atMatch = recentChatText.match(/@([A-Za-z0-9._-]+)/);
        if (atMatch && !["is", "the", "your", "my", "an", "a", "it", "this"].includes(atMatch[1].toLowerCase())) {
          igHandle = atMatch[1];
        } else {
          const found = recentChatText.match(/(?:it's|its|is|handle|instagram|insta|ig)\s+(?:is\s+|account\s+)?[:=]?\s*@?([A-Za-z0-9._-]+)/i);
          if (found && !["is", "the", "your", "my", "an", "a", "it", "this"].includes(found[1].toLowerCase())) {
            igHandle = found[1];
          }
        }
      }
      if (igHandle && typeof igHandle === "string") {
        return await scrapeInstagramProfile(igHandle);
      }
    }
  }

  return null;
}
