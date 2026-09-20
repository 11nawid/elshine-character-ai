import type { SocialPerceptionData } from "./types";

/**
 * Optional Paid Fallback (ScrapingBee)
 * 
 * Only invoked if SCRAPINGBEE_API_KEY is configured in the environment AND
 * all completely free scrapers have failed.
 * If no key is set, returns null immediately without throwing errors.
 */
export async function tryScrapingBeeFallback(
  targetUrl: string,
  platform: "instagram" | "youtube"
): Promise<SocialPerceptionData | null> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const beeUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}&render_js=false`;
    const res = await fetch(beeUrl, { signal: AbortSignal.timeout(3500) });
    if (!res.ok) return null;

    const html = await res.text();
    const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i);
    const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i);
    if (!ogTitleMatch && !ogDescMatch) return null;

    const title = ogTitleMatch ? decodeEntities(ogTitleMatch[1]) : "";
    const desc = ogDescMatch ? decodeEntities(ogDescMatch[1]) : "";

    return {
      platform,
      targetType: targetUrl.includes("/p/") || targetUrl.includes("/reel/") || targetUrl.includes("watch?") ? "post" : "profile",
      target: targetUrl,
      post: {
        platform,
        url: targetUrl,
        titleOrCaption: desc || title || `${platform} content`,
        authorName: title,
      },
    };
  } catch {
    return null;
  }
}

export function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
