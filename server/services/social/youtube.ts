import type { SocialPerceptionData, SocialPostInfo } from "./types";
import { getCached, setCached, BROWSER_HEADERS, cleanHandle } from "./cache";
import { tryScrapingBeeFallback } from "./paid-fallback";

/**
 * Multi-Tier Free YouTube Scraper
 * Inspired by scrapfly-scrapers/youtube-scraper
 * Tier 1 (Free): YouTube oEmbed + embedded ytInitialPlayerResponse
 * Tier 2 (Free): ytInitialData richGrid channel parser
 * Tier 3 (Free): Open Invidious public API fallback
 * Paid Fallback: ScrapingBee (only if SCRAPINGBEE_API_KEY configured)
 */
export async function scrapeYouTubeVideo(videoUrlOrId: string): Promise<SocialPerceptionData> {
  let videoId = videoUrlOrId;
  const match = videoUrlOrId.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  if (match) videoId = match[1];

  const cacheKey = `yt:video:${videoId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
  let title: string | undefined;
  let author: string | undefined;
  let viewCount: string | undefined;
  let publishDate: string | undefined;
  let description: string | undefined;

  // Tier 1a: YouTube oEmbed
  try {
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`,
      { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(2500) }
    );
    if (oembedRes.ok) {
      const json: any = await oembedRes.json();
      title = json.title;
      author = json.author_name;
    }
  } catch {}

  // Tier 1b: Scrapfly technique - parse ytInitialPlayerResponse from watch page
  try {
    const pageRes = await fetch(targetUrl, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(2500) });
    if (pageRes.ok) {
      const html = await pageRes.text();
      const playerMatch = html.match(/var ytInitialPlayerResponse\s*=\s*({.+?});(?:var|<\/script>)/s);
      if (playerMatch) {
        try {
          const data = JSON.parse(playerMatch[1]);
          const details = data?.videoDetails;
          if (details) {
            title = title || details.title;
            author = author || details.author;
            if (details.viewCount) viewCount = `${Number(details.viewCount).toLocaleString()} views`;
            if (details.shortDescription) description = details.shortDescription.slice(0, 400);
          }
          const micro = data?.microformat?.playerMicroformatRenderer;
          if (micro?.publishDate) publishDate = micro.publishDate;
        } catch {}
      }
    }
  } catch {}

  // Tier 3 (Free): Open Invidious instance fallback
  if (!title) {
    try {
      const invRes = await fetch(`https://yewtu.be/api/v1/videos/${videoId}`, { signal: AbortSignal.timeout(2500) });
      if (invRes.ok) {
        const invJson: any = await invRes.json();
        title = invJson.title;
        author = invJson.author;
        description = invJson.description?.slice(0, 400);
        if (invJson.viewCount) viewCount = `${Number(invJson.viewCount).toLocaleString()} views`;
        publishDate = invJson.publishedText;
      }
    } catch {}
  }

  // Paid Fallback (ScrapingBee)
  if (!title) {
    const paid = await tryScrapingBeeFallback(targetUrl, "youtube");
    if (paid) {
      setCached(cacheKey, paid);
      return paid;
    }
  }

  if (title) {
    const result: SocialPerceptionData = {
      platform: "youtube",
      targetType: "video",
      target: targetUrl,
      post: {
        platform: "youtube",
        url: targetUrl,
        titleOrCaption: title,
        authorName: author,
        authorHandle: author ? `@${author}` : undefined,
        mediaType: "video",
        timestampText: publishDate,
        engagement: { views: viewCount },
        extraDetails: description,
      },
    };
    setCached(cacheKey, result);
    return result;
  }

  return { platform: "youtube", targetType: "video", target: targetUrl, notFound: true };
}

/**
 * Multi-Tier Free YouTube Channel & Latest Videos Scraper
 * Uses scrapfly ytInitialData parsing technique on /@handle/videos
 */
export async function scrapeYouTubeChannel(rawHandle: string): Promise<SocialPerceptionData> {
  const handle = cleanHandle(rawHandle);
  const cacheKey = `yt:channel:${handle}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const targetUrl = `https://www.youtube.com/@${handle}/videos`;

  try {
    const res = await fetch(targetUrl, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const html = await res.text();
      let channelTitle = handle;

      const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i);
      if (titleMatch) channelTitle = titleMatch[1].replace(/ - YouTube$/, "").trim();

      const recentVideos: SocialPostInfo[] = [];

      let subscribers: string | undefined;
      let videoCount: string | undefined;

      // Scrapfly technique: Parse ytInitialData tab renderers & channel header
      const initialMatch = html.match(/var ytInitialData\s*=\s*({.+?});<\/script>/s);
      if (initialMatch) {
        try {
          const initial = JSON.parse(initialMatch[1]);
          const header = initial?.header?.pageHeaderRenderer || initial?.header?.c4TabbedHeaderRenderer;
          if (header?.subscriberCountText?.simpleText) {
            subscribers = header.subscriberCountText.simpleText;
          }
          const rows = header?.content?.pageHeaderViewModel?.metadata?.contentMetadataViewModel?.metadataRows || [];
          for (const row of rows) {
            for (const part of row.metadataParts || []) {
              const content = part?.text?.content || "";
              if (/subscribers/i.test(content)) subscribers = content;
              if (/videos/i.test(content)) videoCount = content;
            }
          }

          const tabs = initial?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
          const videoTab = tabs.find((t: any) => t.tabRenderer?.title?.toLowerCase?.() === "videos") || tabs[0];
          const contents = videoTab?.tabRenderer?.content?.richGridRenderer?.contents
            || videoTab?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.gridRenderer?.items
            || [];

          for (const item of contents) {
            const v = item?.richItemRenderer?.content?.videoRenderer || item?.gridVideoRenderer;
            if (!v || !v.videoId) continue;
            recentVideos.push({
              platform: "youtube",
              url: `https://www.youtube.com/watch?v=${v.videoId}`,
              titleOrCaption: v.title?.runs?.[0]?.text || v.title?.simpleText || "Video",
              authorName: channelTitle,
              authorHandle: `@${handle}`,
              mediaType: "video",
              timestampText: v.publishedTimeText?.simpleText,
              engagement: { views: v.viewCountText?.simpleText },
              extraDetails: v.descriptionSnippet?.runs?.[0]?.text,
            });
            if (recentVideos.length >= 3) break;
          }
        } catch {}
      }

      // Regex fallback if initialData parsing missed videos or subscribers
      if (!subscribers) {
        const sm = html.match(/([0-9,.]+[KMBkmb]?\s+subscribers)/i);
        if (sm) subscribers = sm[1];
      }
      if (!videoCount) {
        const vm = html.match(/([0-9,.]+[KMBkmb]?\s+videos)/i);
        if (vm) videoCount = vm[1];
      }

      if (recentVideos.length === 0) {
        const regex = /"videoId":"([A-Za-z0-9_-]{11})","thumbnail":.+?"title":{"runs":\[{"text":"([^"]+)"}\]/g;
        let m: RegExpExecArray | null;
        while ((m = regex.exec(html)) !== null && recentVideos.length < 3) {
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
          followers: subscribers,
          subscribers,
          postCount: videoCount,
          videoCount,
          recentPosts: recentVideos,
        },
        recentPosts: recentVideos,
      };
      setCached(cacheKey, result);
      return result;
    }
  } catch {}

  return { platform: "youtube", targetType: "channel", target: `@${handle}`, notFound: true };
}
