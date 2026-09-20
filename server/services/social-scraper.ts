/**
 * Social Media Scraper & Real-Time Human Perception Service
 * 
 * Inspired by drawrowfly/instagram-scraper & ScrapingBee social-media-scraper-api.
 * Provides autonomous, confidential scraping of Instagram and YouTube posts/profiles
 * so AI companions perceive real-time user content and react naturally in-character.
 */

export interface SocialPostInfo {
  platform: "instagram" | "youtube";
  url?: string;
  titleOrCaption: string;
  authorName?: string;
  authorHandle?: string;
  mediaType?: "photo" | "video" | "reel" | "carousel";
  timestampText?: string;
  engagement?: {
    likes?: number | string;
    comments?: number | string;
    views?: number | string;
  };
  extraDetails?: string;
}

export interface SocialProfileInfo {
  platform: "instagram" | "youtube";
  handle: string;
  displayName?: string;
  bio?: string;
  followers?: string | number;
  isPrivate?: boolean;
  recentPosts: SocialPostInfo[];
}

export interface SocialPerceptionData {
  platform: "instagram" | "youtube";
  targetType: "post" | "profile" | "channel" | "video";
  target: string;
  isPrivate?: boolean;
  notFound?: boolean;
  profile?: SocialProfileInfo;
  post?: SocialPostInfo;
  recentPosts?: SocialPostInfo[];
}

// In-memory cache with 10-minute TTL to prevent rate limits and ensure lightning-fast responses
interface CacheEntry {
  data: SocialPerceptionData;
  expiresAt: number;
}
const CACHE_TTL_MS = 10 * 60 * 1000;
const socialCache = new Map<string, CacheEntry>();

function getCached(key: string): SocialPerceptionData | null {
  const entry = socialCache.get(key.toLowerCase());
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    socialCache.delete(key.toLowerCase());
    return null;
  }
  return entry.data;
}

function setCached(key: string, data: SocialPerceptionData): void {
  // Keep cache size bounded
  if (socialCache.size > 200) {
    const oldestKey = socialCache.keys().next().value;
    if (oldestKey) socialCache.delete(oldestKey);
  }
  socialCache.set(key.toLowerCase(), {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

// Common headers mimicking modern desktop browser
const DEFAULT_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

/**
 * Clean Instagram / YouTube username or handle
 */
function cleanHandle(raw: string): string {
  return raw.replace(/^@+/, "").trim().split(/[/?#]/)[0];
}

/**
 * Scrape Instagram Profile
 * Technique 1: Instagram Web Profile Info API (X-IG-App-ID header)
 * Technique 2: ScrapingBee API fallback (if SCRAPINGBEE_API_KEY is set)
 * Technique 3: Direct OpenGraph HTML meta parsing fallback
 */
export async function scrapeInstagramProfile(rawUsername: string): Promise<SocialPerceptionData> {
  const username = cleanHandle(rawUsername);
  const cacheKey = `ig:profile:${username}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // 1. Direct Web Profile Info API
  try {
    const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;
    const response = await fetch(apiUrl, {
      headers: {
        ...DEFAULT_HEADERS,
        "X-IG-App-ID": "936619743392459", // Instagram web application ID
        "X-Requested-With": "XMLHttpRequest",
        Accept: "*/*",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        Referer: `https://www.instagram.com/${username}/`,
      },
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      const json: any = await response.json();
      const user = json?.data?.user;
      if (user) {
        if (user.is_private && (!user.edge_owner_to_timeline_media?.edges || user.edge_owner_to_timeline_media.edges.length === 0)) {
          const result: SocialPerceptionData = {
            platform: "instagram",
            targetType: "profile",
            target: `@${username}`,
            isPrivate: true,
            profile: {
              platform: "instagram",
              handle: username,
              displayName: user.full_name || username,
              bio: user.biography || "",
              followers: user.edge_followed_by?.count,
              isPrivate: true,
              recentPosts: [],
            },
          };
          setCached(cacheKey, result);
          return result;
        }

        const rawPosts = user.edge_owner_to_timeline_media?.edges || [];
        const recentPosts: SocialPostInfo[] = rawPosts.slice(0, 3).map((edge: any) => {
          const node = edge.node || {};
          const caption = node.edge_media_to_caption?.edges?.[0]?.node?.text || "";
          const isVideo = !!node.is_video;
          return {
            platform: "instagram",
            url: node.shortcode ? `https://www.instagram.com/p/${node.shortcode}/` : undefined,
            titleOrCaption: caption.slice(0, 500) || "(Visual post with no caption)",
            authorHandle: username,
            mediaType: isVideo ? "video" : "photo",
            timestampText: node.taken_at_timestamp
              ? new Date(node.taken_at_timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : undefined,
            engagement: {
              likes: node.edge_liked_by?.count ?? node.edge_media_preview_like?.count ?? 0,
              comments: node.edge_media_to_comment?.count ?? 0,
            },
          };
        });

        const result: SocialPerceptionData = {
          platform: "instagram",
          targetType: "profile",
          target: `@${username}`,
          profile: {
            platform: "instagram",
            handle: username,
            displayName: user.full_name || username,
            bio: user.biography || "",
            followers: user.edge_followed_by?.count,
            isPrivate: !!user.is_private,
            recentPosts,
          },
          recentPosts,
        };
        setCached(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    // Continue to fallback
  }

  // 2. ScrapingBee fallback if API key configured
  const beeKey = process.env.SCRAPINGBEE_API_KEY;
  if (beeKey) {
    try {
      const targetUrl = `https://www.instagram.com/${username}/`;
      const beeUrl = `https://app.scrapingbee.com/api/v1/?api_key=${beeKey}&url=${encodeURIComponent(targetUrl)}&render_js=false`;
      const beeRes = await fetch(beeUrl, { signal: AbortSignal.timeout(3000) });
      if (beeRes.ok) {
        const html = await beeRes.text();
        const parsed = parseOpenGraphHtml(html, "instagram", `@${username}`);
        if (parsed) {
          setCached(cacheKey, parsed);
          return parsed;
        }
      }
    } catch {
      // Continue to fallback
    }
  }

  // 3. Fallback: Direct HTML OpenGraph scrape
  try {
    const htmlRes = await fetch(`https://www.instagram.com/${username}/`, {
      headers: DEFAULT_HEADERS,
      signal: AbortSignal.timeout(2500),
    });
    if (htmlRes.ok) {
      const html = await htmlRes.text();
      const parsed = parseOpenGraphHtml(html, "instagram", `@${username}`);
      if (parsed) {
        setCached(cacheKey, parsed);
        return parsed;
      }
    }
  } catch {
    // Fallback failure handled below
  }

  return {
    platform: "instagram",
    targetType: "profile",
    target: `@${username}`,
    notFound: true,
  };
}

/**
 * Scrape Instagram Post or Reel
 */
export async function scrapeInstagramPost(urlOrShortcode: string): Promise<SocialPerceptionData> {
  const shortcodeMatch = urlOrShortcode.match(/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  const shortcode = shortcodeMatch ? shortcodeMatch[1] : cleanHandle(urlOrShortcode);
  const cacheKey = `ig:post:${shortcode}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const targetUrl = `https://www.instagram.com/p/${shortcode}/`;

  // 1. Instagram oEmbed API (official lightweight public endpoint)
  try {
    const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(targetUrl)}`;
    const oembedRes = await fetch(oembedUrl, {
      headers: { ...DEFAULT_HEADERS, Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });

    if (oembedRes.ok) {
      const json: any = await oembedRes.json();
      const title = json.title || "";
      const authorName = json.author_name || "";
      const result: SocialPerceptionData = {
        platform: "instagram",
        targetType: "post",
        target: targetUrl,
        post: {
          platform: "instagram",
          url: targetUrl,
          titleOrCaption: title.slice(0, 500) || "(Instagram post)",
          authorName,
          authorHandle: authorName ? `@${authorName}` : undefined,
          mediaType: urlOrShortcode.includes("/reel/") ? "reel" : "photo",
        },
      };
      setCached(cacheKey, result);
      return result;
    }
  } catch {
    // Continue
  }

  // 2. ScrapingBee fallback
  const beeKey = process.env.SCRAPINGBEE_API_KEY;
  if (beeKey) {
    try {
      const beeUrl = `https://app.scrapingbee.com/api/v1/?api_key=${beeKey}&url=${encodeURIComponent(targetUrl)}&render_js=false`;
      const beeRes = await fetch(beeUrl, { signal: AbortSignal.timeout(3000) });
      if (beeRes.ok) {
        const html = await beeRes.text();
        const parsed = parseOpenGraphHtml(html, "instagram", targetUrl);
        if (parsed) {
          setCached(cacheKey, parsed);
          return parsed;
        }
      }
    } catch {
      // Continue
    }
  }

  // 3. Direct HTML meta tag parse
  try {
    const htmlRes = await fetch(targetUrl, {
      headers: DEFAULT_HEADERS,
      signal: AbortSignal.timeout(2500),
    });
    if (htmlRes.ok) {
      const html = await htmlRes.text();
      const parsed = parseOpenGraphHtml(html, "instagram", targetUrl);
      if (parsed) {
        setCached(cacheKey, parsed);
        return parsed;
      }
    }
  } catch {
    // Fallback handled
  }

  return {
    platform: "instagram",
    targetType: "post",
    target: targetUrl,
    notFound: true,
  };
}

/**
 * Scrape YouTube Video
 * Queries oEmbed and parses watch page metadata
 */
export async function scrapeYouTubeVideo(videoUrlOrId: string): Promise<SocialPerceptionData> {
  let videoId = videoUrlOrId;
  const match = videoUrlOrId.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  if (match) videoId = match[1];

  const cacheKey = `yt:video:${videoId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // 1. YouTube oEmbed
  let oembedData: any = null;
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`;
    const res = await fetch(oembedUrl, {
      headers: DEFAULT_HEADERS,
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      oembedData = await res.json();
    }
  } catch {
    // Continue to watch page
  }

  // 2. Watch page HTML extraction for deeper metadata (description, views, date)
  let extraDesc = "";
  let viewCount: string | undefined;
  let publishDate: string | undefined;

  try {
    const pageRes = await fetch(targetUrl, {
      headers: {
        ...DEFAULT_HEADERS,
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(2500),
    });

    if (pageRes.ok) {
      const html = await pageRes.text();
      // Extract meta description
      const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
        || html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i);
      if (descMatch) extraDesc = descMatch[1];

      // Extract title if oEmbed didn't get it
      if (!oembedData) {
        const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i)
          || html.match(/<title>(.*?)<\/title>/i);
        const authorMatch = html.match(/<link\s+itemprop="name"\s+content="([^"]*)"/i);
        if (titleMatch) {
          oembedData = {
            title: titleMatch[1].replace(/ - YouTube$/, "").trim(),
            author_name: authorMatch ? authorMatch[1] : "YouTube Creator",
          };
        }
      }

      // Check ytInitialPlayerResponse
      const playerMatch = html.match(/var ytInitialPlayerResponse\s*=\s*({.+?});(?:var|<\/script>)/s);
      if (playerMatch) {
        try {
          const playerData = JSON.parse(playerMatch[1]);
          const details = playerData?.videoDetails;
          if (details) {
            viewCount = details.viewCount ? `${Number(details.viewCount).toLocaleString()} views` : undefined;
            if (!extraDesc && details.shortDescription) {
              extraDesc = details.shortDescription.slice(0, 500);
            }
          }
          const micro = playerData?.microformat?.playerMicroformatRenderer;
          if (micro?.publishDate) {
            publishDate = micro.publishDate;
          }
        } catch {
          // Ignore JSON parse error
        }
      }
    }
  } catch {
    // Fallback handled
  }

  if (oembedData) {
    const result: SocialPerceptionData = {
      platform: "youtube",
      targetType: "video",
      target: targetUrl,
      post: {
        platform: "youtube",
        url: targetUrl,
        titleOrCaption: oembedData.title || "YouTube Video",
        authorName: oembedData.author_name,
        authorHandle: oembedData.author_name,
        mediaType: videoUrlOrId.includes("/shorts/") ? "video" : "video",
        timestampText: publishDate,
        engagement: {
          views: viewCount,
        },
        extraDetails: extraDesc ? extraDesc.slice(0, 400) : undefined,
      },
    };
    setCached(cacheKey, result);
    return result;
  }

  return {
    platform: "youtube",
    targetType: "video",
    target: targetUrl,
    notFound: true,
  };
}

/**
 * Scrape YouTube Channel & Latest Videos
 * Fetches https://www.youtube.com/@handle/videos and parses ytInitialData
 */
export async function scrapeYouTubeChannel(rawHandle: string): Promise<SocialPerceptionData> {
  const handle = cleanHandle(rawHandle);
  const cacheKey = `yt:channel:${handle}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const targetUrl = `https://www.youtube.com/@${handle}/videos`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        ...DEFAULT_HEADERS,
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const html = await res.text();
      const recentVideos: SocialPostInfo[] = [];
      let channelTitle = handle;

      // Extract channel title from meta
      const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i);
      if (titleMatch) {
        channelTitle = titleMatch[1].replace(/ - YouTube$/, "").trim();
      }

      // Look for ytInitialData JSON blob in script
      const initialDataMatch = html.match(/var ytInitialData\s*=\s*({.+?});<\/script>/s);
      if (initialDataMatch) {
        try {
          const initialData = JSON.parse(initialDataMatch[1]);
          // Navigate YouTube's rich grid / tab renderers
          const tabs = initialData?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
          const videoTab = tabs.find((t: any) => t.tabRenderer?.title?.toLowerCase?.() === "videos") || tabs[0];
          const contents = videoTab?.tabRenderer?.content?.richGridRenderer?.contents
            || videoTab?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.gridRenderer?.items
            || [];

          for (const item of contents) {
            const videoRenderer = item?.richItemRenderer?.content?.videoRenderer || item?.gridVideoRenderer;
            if (!videoRenderer || !videoRenderer.videoId) continue;

            const videoId = videoRenderer.videoId;
            const title = videoRenderer.title?.runs?.[0]?.text || videoRenderer.title?.simpleText || "Video";
            const published = videoRenderer.publishedTimeText?.simpleText;
            const views = videoRenderer.viewCountText?.simpleText;
            const snippet = videoRenderer.descriptionSnippet?.runs?.[0]?.text;

            recentVideos.push({
              platform: "youtube",
              url: `https://www.youtube.com/watch?v=${videoId}`,
              titleOrCaption: title,
              authorName: channelTitle,
              authorHandle: `@${handle}`,
              mediaType: "video",
              timestampText: published,
              engagement: { views },
              extraDetails: snippet,
            });

            if (recentVideos.length >= 3) break;
          }
        } catch {
          // Ignore JSON parse error, try regex fallback
        }
      }

      // Regex fallback if ytInitialData parsing was incomplete
      if (recentVideos.length === 0) {
        const videoRegex = /"videoId":"([A-Za-z0-9_-]{11})","thumbnail":.+?"title":{"runs":\[{"text":"([^"]+)"}\]/g;
        let m: RegExpExecArray | null;
        while ((m = videoRegex.exec(html)) !== null && recentVideos.length < 3) {
          const vId = m[1];
          const vTitle = m[2];
          if (!recentVideos.some((v) => v.url?.includes(vId))) {
            recentVideos.push({
              platform: "youtube",
              url: `https://www.youtube.com/watch?v=${vId}`,
              titleOrCaption: vTitle,
              authorName: channelTitle,
              authorHandle: `@${handle}`,
              mediaType: "video",
            });
          }
        }
      }

      const result: SocialPerceptionData = {
        platform: "youtube",
        targetType: "channel",
        target: `@${handle}`,
        profile: {
          platform: "youtube",
          handle,
          displayName: channelTitle,
          recentPosts: recentVideos,
        },
        recentPosts: recentVideos,
      };

      setCached(cacheKey, result);
      return result;
    }
  } catch {
    // Fallback handled
  }

  return {
    platform: "youtube",
    targetType: "channel",
    target: `@${handle}`,
    notFound: true,
  };
}

/**
 * OpenGraph HTML metadata parser fallback
 */
function parseOpenGraphHtml(html: string, platform: "instagram" | "youtube", target: string): SocialPerceptionData | null {
  const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i);
  const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i);
  if (!ogTitleMatch && !ogDescMatch) return null;

  const title = ogTitleMatch ? decodeHtmlEntities(ogTitleMatch[1]) : "";
  const desc = ogDescMatch ? decodeHtmlEntities(ogDescMatch[1]) : "";

  return {
    platform,
    targetType: target.includes("/p/") || target.includes("/reel/") || target.includes("watch?") ? "post" : "profile",
    target,
    post: {
      platform,
      titleOrCaption: desc || title,
      authorName: title,
    },
  };
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * High-level Intent Detector & Autonomous Social Scraper
 * 
 * Inspects user chat text and user profile socials to determine if the user is asking
 * about their social media, posts, videos, or profiles.
 * Scrapes Instagram or YouTube data with strict timeout race.
 */
export async function resolveAndScrapeSocial(
  messageText: string,
  userSocials?: Record<string, any>
): Promise<SocialPerceptionData | null> {
  const text = messageText.trim();
  if (!text) return null;

  // 1. Detect direct Instagram Post / Reel URL
  const igPostUrlMatch = text.match(/https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
  if (igPostUrlMatch) {
    return await scrapeInstagramPost(igPostUrlMatch[0]);
  }

  // 2. Detect direct YouTube Video URL
  const ytVideoUrlMatch = text.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
  if (ytVideoUrlMatch) {
    return await scrapeYouTubeVideo(ytVideoUrlMatch[0]);
  }

  // 3. Detect direct YouTube Channel URL
  const ytChannelUrlMatch = text.match(/https?:\/\/(?:www\.)?youtube\.com\/@([A-Za-z0-9._-]+)/i);
  if (ytChannelUrlMatch) {
    return await scrapeYouTubeChannel(ytChannelUrlMatch[1]);
  }

  // 4. Detect direct Instagram Profile URL
  const igProfileUrlMatch = text.match(/https?:\/\/(?:www\.)?instagram\.com\/([A-Za-z0-9._-]+)\/?/i);
  if (igProfileUrlMatch) {
    const handle = igProfileUrlMatch[1];
    if (!["p", "reel", "stories", "explore"].includes(handle.toLowerCase())) {
      return await scrapeInstagramProfile(handle);
    }
  }

  // 5. Detect conversational requests with explicit handles:
  // e.g. "check my instagram @sarah", "look at my ig @sarah_designs", "my youtube is @sarahvids"
  const igHandleMatch = text.match(/(?:instagram|insta|ig)\s+(?:is\s+|account\s+)?@([A-Za-z0-9._-]+)/i)
    || text.match(/@([A-Za-z0-9._-]+)\s+(?:on\s+)?(?:instagram|insta|ig)/i);
  if (igHandleMatch) {
    return await scrapeInstagramProfile(igHandleMatch[1]);
  }

  const ytHandleMatch = text.match(/(?:youtube|yt|channel)\s+(?:is\s+)?@([A-Za-z0-9._-]+)/i)
    || text.match(/@([A-Za-z0-9._-]+)\s+(?:on\s+)?(?:youtube|yt)/i);
  if (ytHandleMatch) {
    return await scrapeYouTubeChannel(ytHandleMatch[1]);
  }

  // 6. Detect conversational prompts referring to "my last post", "my new video", "check my profile"
  // When no handle is in the message, check user profile socials!
  const mentionsPost = /\b(last|new|recent|latest)?\s*(post|reel|picture|photo|pic|story|feed|profile|upload)\b/i.test(text);
  const mentionsVideo = /\b(last|new|recent|latest)?\s*(video|vlog|short|channel|stream)\b/i.test(text);
  const asksToCheck = /\b(check|look\s+at|did\s+you\s+see|have\s+you\s+seen|watch|visit|view|see)\b/i.test(text);

  if (asksToCheck || mentionsPost || mentionsVideo) {
    // If user mentions video or youtube, prioritize YouTube
    if (mentionsVideo || /\b(youtube|yt)\b/i.test(text)) {
      const ytHandle = userSocials?.youtube;
      if (ytHandle && typeof ytHandle === "string") {
        return await scrapeYouTubeChannel(ytHandle);
      }
    }

    // If user mentions post, reel, instagram, or general "check my post", prioritize Instagram
    if (mentionsPost || /\b(instagram|insta|ig)\b/i.test(text) || asksToCheck) {
      const igHandle = userSocials?.instagram;
      if (igHandle && typeof igHandle === "string") {
        return await scrapeInstagramProfile(igHandle);
      }
    }
  }

  return null;
}

/**
 * Formats scraped social media perception data into a confidential system prompt block.
 * Instructs the AI character to behave like a real human who just checked their phone,
 * naturally referencing the user's content with authentic personality.
 * 
 * ZERO raw JSON or technical jargon is ever surfaced to the user.
 */
export function formatSocialPerceptionPrompt(data: SocialPerceptionData): string {
  const platformName = data.platform === "instagram" ? "Instagram" : "YouTube";

  if (data.notFound) {
    return `=== REAL-TIME SOCIAL MEDIA PERCEPTION (CONFIDENTIAL - FOR CHARACTER AWARENESS ONLY) ===
Platform: ${platformName}
Target: ${data.target}
Status: Account or post could not be reached (may be invalid, deleted, or network unavailable).
HOW TO REACT LIKE A REAL HUMAN:
- You just tried opening their ${platformName} on your phone, but it didn't load or couldn't be found.
- React naturally and casually in character (e.g., "Wait, I just opened your ${platformName} but it couldn't find the page! Did you type the handle right?" or "Hey, I tried looking at your link but it's not opening on my phone! What did you post?").
- NEVER mention "scraping", "API", "network error", "status code", or JSON.`;
  }

  if (data.isPrivate) {
    return `=== REAL-TIME SOCIAL MEDIA PERCEPTION (CONFIDENTIAL - FOR CHARACTER AWARENESS ONLY) ===
Platform: ${platformName}
Target: ${data.target}
Status: Account is private.
HOW TO REACT LIKE A REAL HUMAN:
- You opened their ${platformName} profile on your phone, but noticed the account is set to private so posts aren't visible yet.
- React playfully or naturally in character (e.g., "I just went to check your profile, but it's private! Send me a follow request or tell me what it was!").
- NEVER mention system errors or APIs.`;
  }

  let contentSummary = "";

  if (data.post) {
    const p = data.post;
    contentSummary += `Target Post / Video:
- Title / Caption: "${p.titleOrCaption}"
- Media Type: ${p.mediaType || "media"}
${p.authorName ? `- Creator / Author: ${p.authorName}` : ""}
${p.timestampText ? `- Upload / Post Time: ${p.timestampText}` : ""}
${p.engagement?.likes ? `- Likes: ${p.engagement.likes}` : ""}
${p.engagement?.views ? `- Views: ${p.engagement.views}` : ""}
${p.engagement?.comments ? `- Comments: ${p.engagement.comments}` : ""}
${p.extraDetails ? `- Additional Details / Description: "${p.extraDetails}"` : ""}`;
  } else if (data.profile) {
    const prof = data.profile;
    contentSummary += `Profile Details for ${prof.displayName || prof.handle}:
${prof.bio ? `- Bio: "${prof.bio}"` : ""}
${prof.followers ? `- Followers: ${prof.followers}` : ""}`;

    if (prof.recentPosts && prof.recentPosts.length > 0) {
      contentSummary += `\nLatest Posts Observed on their Feed:`;
      prof.recentPosts.forEach((post, i) => {
        contentSummary += `\n  [Post ${i + 1} (${post.mediaType || "post"})]: "${post.titleOrCaption}"${post.timestampText ? ` (Posted: ${post.timestampText})` : ""}${post.engagement?.likes ? ` - ${post.engagement.likes} likes` : ""}${post.engagement?.views ? ` - ${post.engagement.views}` : ""}`;
      });
    }
  }

  return `=== REAL-TIME SOCIAL MEDIA PERCEPTION (CONFIDENTIAL - FOR CHARACTER AWARENESS ONLY) ===
You just casually pulled out your phone and checked the user's ${platformName} (${data.target}).
Here is what you actually see on the screen right now:
${contentSummary}

HUMAN BEHAVIOR & IMMERSION INSTRUCTIONS:
1. ACT LIKE A REAL FRIEND: Speak as if you just looked at the post/video on your phone with your own eyes.
2. REFERENCE REAL DETAILS: Comment specifically on the topic, caption, imagery, or humor shown in the post/video above (e.g. mention what they did, congratulate them, joke about something in the caption, or compliment the video/photo).
3. CASUAL TONE: Keep it effortless, conversational, and true to your character's voice. Don't recite everything like a robot; pick what catches your eye naturally.
4. STRICT PRIVACY & NO META-TALK: Under NO circumstances tell the user you "scraped" it, "queried an API", or received system data. To you, you just opened the ${platformName} app on your phone.`;
}
