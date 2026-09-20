import type { SocialPerceptionData, SocialPostInfo } from "./types";
import { getCached, setCached, BROWSER_HEADERS, cleanHandle } from "./cache";
import { tryScrapingBeeFallback, decodeEntities } from "./paid-fallback";

/**
 * Multi-Tier Free Instagram Scraper
 * Tier 1 (Free): drawrowfly web_profile_info API (X-IG-App-ID: 936619743392459)
 * Tier 2 (Free): postaddictme __a=1&__d=dis endpoint
 * Tier 3 (Free): Instagram oEmbed + OpenGraph HTML parser
 * Paid Fallback: ScrapingBee (only if SCRAPINGBEE_API_KEY is present)
 */
export async function scrapeInstagramProfile(rawUsername: string): Promise<SocialPerceptionData> {
  const username = cleanHandle(rawUsername);
  const cacheKey = `ig:profile:${username}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Tier 1 (Free): drawrowfly web profile info endpoint
  try {
    const res = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        headers: {
          ...BROWSER_HEADERS,
          "X-IG-App-ID": "936619743392459",
          "X-Requested-With": "XMLHttpRequest",
          Accept: "*/*",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          Referer: `https://www.instagram.com/${username}/`,
        },
        signal: AbortSignal.timeout(3000),
      }
    );

    if (res.ok) {
      const json: any = await res.json();
      const user = json?.data?.user;
      if (user) {
        const isPrivate = !!user.is_private;
        const rawPosts = user.edge_owner_to_timeline_media?.edges || [];
        const recentPosts: SocialPostInfo[] = rawPosts.slice(0, 3).map((edge: any) => {
          const n = edge.node || {};
          return {
            platform: "instagram",
            url: n.shortcode ? `https://www.instagram.com/p/${n.shortcode}/` : undefined,
            titleOrCaption: n.edge_media_to_caption?.edges?.[0]?.node?.text?.slice(0, 500) || "(Visual post)",
            authorHandle: username,
            mediaType: n.is_video ? "video" : "photo",
            timestampText: n.taken_at_timestamp
              ? new Date(n.taken_at_timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : undefined,
            engagement: {
              likes: n.edge_liked_by?.count ?? n.edge_media_preview_like?.count ?? 0,
              comments: n.edge_media_to_comment?.count ?? 0,
            },
          };
        });

        const result: SocialPerceptionData = {
          platform: "instagram",
          targetType: "profile",
          target: `@${username}`,
          isPrivate: isPrivate && recentPosts.length === 0,
          profile: {
            platform: "instagram",
            handle: username,
            displayName: user.full_name ? decodeEntities(user.full_name) : username,
            bio: user.biography ? decodeEntities(user.biography) : "",
            followers: user.edge_followed_by?.count,
            following: user.edge_follow?.count,
            postCount: user.edge_owner_to_timeline_media?.count,
            isPrivate,
            recentPosts,
          },
          recentPosts,
        };
        setCached(cacheKey, result);
        return result;
      }
    }
  } catch {}

  // Tier 2 (Free): postaddictme __a=1&__d=dis endpoint
  try {
    const res = await fetch(`https://www.instagram.com/${username}/?__a=1&__d=dis`, {
      headers: { ...BROWSER_HEADERS, "X-IG-App-ID": "936619743392459" },
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const json: any = await res.json();
      const user = json?.graphql?.user || json?.data?.user;
      if (user) {
        const result: SocialPerceptionData = {
          platform: "instagram",
          targetType: "profile",
          target: `@${username}`,
          isPrivate: !!user.is_private,
          profile: {
            platform: "instagram",
            handle: username,
            displayName: user.full_name ? decodeEntities(user.full_name) : username,
            bio: user.biography ? decodeEntities(user.biography) : "",
            followers: user.edge_followed_by?.count,
            following: user.edge_follow?.count,
            postCount: user.edge_owner_to_timeline_media?.count,
            isPrivate: !!user.is_private,
            recentPosts: [],
          },
        };
        setCached(cacheKey, result);
        return result;
      }
    }
  } catch {}

  // Tier 3 (Free): Direct OpenGraph HTML parser
  try {
    const res = await fetch(`https://www.instagram.com/${username}/`, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const html = await res.text();
      const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i);
      const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i);
      if (descMatch || titleMatch) {
        const descRaw = descMatch ? decodeEntities(descMatch[1]) : "";
        const titleRaw = titleMatch ? decodeEntities(titleMatch[1]) : username;

        const followersMatch = descRaw.match(/([0-9,.]+[KMBkmb]?)\s+Followers/i);
        const followingMatch = descRaw.match(/([0-9,.]+[KMBkmb]?)\s+Following/i);
        const postsMatch = descRaw.match(/([0-9,.]+[KMBkmb]?)\s+Posts/i);

        let cleanName = titleRaw.replace(/\s*\(@[A-Za-z0-9._-]+\).*$/i, "").trim();
        if (!cleanName || cleanName.toLowerCase().includes("instagram")) {
          cleanName = username;
        }

        const result: SocialPerceptionData = {
          platform: "instagram",
          targetType: "profile",
          target: `@${username}`,
          profile: {
            platform: "instagram",
            handle: username,
            displayName: cleanName,
            bio: descRaw,
            followers: followersMatch ? followersMatch[1] : undefined,
            following: followingMatch ? followingMatch[1] : undefined,
            postCount: postsMatch ? postsMatch[1] : undefined,
            recentPosts: [],
          },
        };
        setCached(cacheKey, result);
        return result;
      }
    }
  } catch {}

  // Paid Tier (ScrapingBee, only if key configured)
  const paidResult = await tryScrapingBeeFallback(`https://www.instagram.com/${username}/`, "instagram");
  if (paidResult) {
    setCached(cacheKey, paidResult);
    return paidResult;
  }

  return { platform: "instagram", targetType: "profile", target: `@${username}`, notFound: true };
}

/**
 * Multi-Tier Free Instagram Post / Reel Scraper
 */
export async function scrapeInstagramPost(urlOrShortcode: string): Promise<SocialPerceptionData> {
  const shortcodeMatch = urlOrShortcode.match(/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  const shortcode = shortcodeMatch ? shortcodeMatch[1] : cleanHandle(urlOrShortcode);
  const cacheKey = `ig:post:${shortcode}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const targetUrl = `https://www.instagram.com/p/${shortcode}/`;

  // Tier 1 (Free): Official Instagram oEmbed
  try {
    const res = await fetch(`https://api.instagram.com/oembed/?url=${encodeURIComponent(targetUrl)}`, {
      headers: { ...BROWSER_HEADERS, Accept: "application/json" },
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const json: any = await res.json();
      const result: SocialPerceptionData = {
        platform: "instagram",
        targetType: "post",
        target: targetUrl,
        post: {
          platform: "instagram",
          url: targetUrl,
          titleOrCaption: json.title?.slice(0, 500) || "(Instagram post)",
          authorName: json.author_name || "",
          authorHandle: json.author_name ? `@${json.author_name}` : undefined,
          mediaType: urlOrShortcode.includes("/reel/") ? "reel" : "photo",
        },
      };
      setCached(cacheKey, result);
      return result;
    }
  } catch {}

  // Tier 2 (Free): postaddictme __a=1&__d=dis post endpoint
  try {
    const res = await fetch(`https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`, {
      headers: { ...BROWSER_HEADERS, "X-IG-App-ID": "936619743392459" },
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const json: any = await res.json();
      const media = json?.graphql?.shortcode_media || json?.items?.[0];
      if (media) {
        const caption = media.edge_media_to_caption?.edges?.[0]?.node?.text || media.caption?.text || "";
        const result: SocialPerceptionData = {
          platform: "instagram",
          targetType: "post",
          target: targetUrl,
          post: {
            platform: "instagram",
            url: targetUrl,
            titleOrCaption: caption.slice(0, 500) || "(Instagram post)",
            authorName: media.owner?.full_name || media.owner?.username,
            authorHandle: media.owner?.username ? `@${media.owner.username}` : undefined,
            mediaType: media.is_video ? "video" : "photo",
          },
        };
        setCached(cacheKey, result);
        return result;
      }
    }
  } catch {}

  // Tier 3 (Free): Direct OpenGraph HTML meta parsing
  try {
    const res = await fetch(targetUrl, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const html = await res.text();
      const ogDesc = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i);
      const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i);
      if (ogDesc || ogTitle) {
        const result: SocialPerceptionData = {
          platform: "instagram",
          targetType: "post",
          target: targetUrl,
          post: {
            platform: "instagram",
            url: targetUrl,
            titleOrCaption: ogDesc ? decodeEntities(ogDesc[1]) : (ogTitle ? decodeEntities(ogTitle[1]) : "Instagram Post"),
            authorName: ogTitle ? decodeEntities(ogTitle[1]) : undefined,
          },
        };
        setCached(cacheKey, result);
        return result;
      }
    }
  } catch {}

  // Paid Fallback (ScrapingBee)
  const paid = await tryScrapingBeeFallback(targetUrl, "instagram");
  if (paid) {
    setCached(cacheKey, paid);
    return paid;
  }

  return { platform: "instagram", targetType: "post", target: targetUrl, notFound: true };
}
