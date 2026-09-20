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
 * Supports returning multiple tool perception results (e.g. YouTube AND Instagram simultaneously).
 */
export async function resolveAndScrapeSocial(
  messageText: string,
  userSocials?: Record<string, any>,
  recentChatText?: string
): Promise<SocialPerceptionData | SocialPerceptionData[] | null> {
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

  // 5. Dual or Single Handle Extraction from current message
  const igHandleMatch = text.match(/(?:instagram|insta|ig)\s*(?:username|handle|account|user|profile|name|is|:|=|\s)*@([A-Za-z0-9._-]+)/i)
    || text.match(/@([A-Za-z0-9._-]+)\s*(?:on\s+)?(?:instagram|insta|ig)/i);
  const ytHandleMatch = text.match(/(?:youtube|yt|channel)\s*(?:username|handle|account|user|profile|name|is|:|=|\s)*@([A-Za-z0-9._-]+)/i)
    || text.match(/@([A-Za-z0-9._-]+)\s*(?:on\s+)?(?:youtube|yt)/i);

  const foundIg = igHandleMatch?.[1];
  const foundYt = ytHandleMatch?.[1];

  // If BOTH YouTube and Instagram are specified in this message, scrape BOTH!
  if (foundIg && foundYt) {
    const [ytRes, igRes] = await Promise.all([
      scrapeYouTubeChannel(foundYt),
      scrapeInstagramProfile(foundIg),
    ]);
    const results = [ytRes, igRes].filter((r): r is SocialPerceptionData => !!r);
    if (results.length > 0) return results;
  }

  if (foundYt) return await scrapeYouTubeChannel(foundYt);
  if (foundIg) return await scrapeInstagramProfile(foundIg);

  // 5b. Action verb + handle (e.g. "check @drined", "audit @drined", "manage @drined")
  const actionHandleMatch = text.match(
    /(?:check|audit|review|manage|look\s+at|analyze|inspect|see|view|rate|grow)\s+(?:out\s+)?(?:channel\s+|page\s+|account\s+)?@([A-Za-z0-9._-]+)/i
  );
  if (actionHandleMatch) {
    const handle = actionHandleMatch[1];
    const ytRes = await scrapeYouTubeChannel(handle);
    if (ytRes) return ytRes;
    const igRes = await scrapeInstagramProfile(handle);
    if (igRes) return igRes;
  }

  // 6. Conversational requests referencing user's posts, subscribers, or profile -> fallback to profile socials or chat history!
  const mentionsPost = /\b(last|new|recent|latest)?\s*(post|reel|picture|photo|pic|story|feed|upload)\b/i.test(text);
  const mentionsVideo = /\b(last|new|recent|latest)?\s*(video|vlog|short|channel|stream)\b/i.test(text);
  const mentionsSubs = /\b(subs?|subscribers?|sub\s*count)\b/i.test(text);
  const mentionsProfile = /\b(followers?|following|posts?|names?|profile|bio|account|channel|socials?|social\s*media|stats?)\b/i.test(text);
  const asksToCheck = /\b(check|audit|review|manage|analyze|grow|rate|inspect|critique|look\s+at|did\s+you\s+see|have\s+you\s+seen|watch|visit|view|see|know|tell\s+me|how\s+many)\b/i.test(text);

  if (asksToCheck || mentionsPost || mentionsVideo || mentionsProfile || mentionsSubs) {
    // Check if user has an @handle anywhere in the current text
    const genericAtMatch = text.match(/@([A-Za-z0-9._-]+)/);
    if (genericAtMatch && !["is", "the", "your", "my", "an", "a", "it", "this"].includes(genericAtMatch[1].toLowerCase())) {
      const handle = genericAtMatch[1];
      if (mentionsSubs || mentionsVideo || /\b(youtube|yt)\b/i.test(text)) {
        const ytRes = await scrapeYouTubeChannel(handle);
        if (ytRes) return ytRes;
      }
      if (mentionsPost || mentionsProfile || /\b(instagram|insta|ig)\b/i.test(text)) {
        const igRes = await scrapeInstagramProfile(handle);
        if (igRes) return igRes;
      }
    }

    let ytHandle = userSocials?.youtube;
    let igHandle = userSocials?.instagram;

    if (recentChatText) {
      if (!ytHandle) {
        const foundYt = recentChatText.match(/(?:youtube|yt|channel)\s*(?:username|handle|account|user|profile|name|is|:|=|\s)+@([A-Za-z0-9._-]+)/i);
        if (foundYt && !["is", "the", "your", "my", "an", "a", "it", "this"].includes(foundYt[1].toLowerCase())) {
          ytHandle = foundYt[1];
        }
      }
      if (!igHandle) {
        const foundIg = recentChatText.match(/(?:instagram|insta|ig)\s*(?:username|handle|account|user|profile|name|is|:|=|\s)+@([A-Za-z0-9._-]+)/i);
        if (foundIg && !["is", "the", "your", "my", "an", "a", "it", "this"].includes(foundIg[1].toLowerCase())) {
          igHandle = foundIg[1];
        }
      }
    }

    // If both YouTube and Instagram handles are known and requested (e.g. "subs and followers", "counts")
    if (ytHandle && igHandle && (mentionsSubs || mentionsVideo || /\b(youtube|yt)\b/i.test(text) || asksToCheck) && (mentionsPost || mentionsProfile || /\b(instagram|insta|ig)\b/i.test(text) || asksToCheck)) {
      const [ytRes, igRes] = await Promise.all([
        scrapeYouTubeChannel(ytHandle),
        scrapeInstagramProfile(igHandle),
      ]);
      const results = [ytRes, igRes].filter((r): r is SocialPerceptionData => !!r);
      if (results.length > 0) return results;
    }

    if (ytHandle && (mentionsSubs || mentionsVideo || /\b(youtube|yt)\b/i.test(text) || asksToCheck)) {
      const ytRes = await scrapeYouTubeChannel(ytHandle);
      if (ytRes) return ytRes;
    }

    if (igHandle && (mentionsPost || mentionsProfile || /\b(instagram|insta|ig)\b/i.test(text) || asksToCheck)) {
      const igRes = await scrapeInstagramProfile(igHandle);
      if (igRes) return igRes;
    }
  }

  return null;
}
