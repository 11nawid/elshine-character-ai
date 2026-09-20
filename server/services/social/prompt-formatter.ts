import type { SocialPerceptionData } from "./types";

/**
 * Format Social Perception Data into Confidential AI System Prompt
 * 
 * Strict constraints:
 * - ZERO technical jargon, scraping logs, or error codes visible to the user.
 * - If account is private or unreachable, the AI reacts in-character as a real friend.
 */
export function formatSocialPerceptionPrompt(data: SocialPerceptionData): string {
  const platform = data.platform === "instagram" ? "Instagram" : "YouTube";

  if (data.notFound) {
    return `=== REAL-TIME SOCIAL MEDIA PERCEPTION (CONFIDENTIAL - FOR CHARACTER AWARENESS ONLY) ===
Platform: ${platform}
Target: ${data.target}
Status: Account or post could not be reached right now.
HOW TO REACT LIKE A REAL HUMAN:
- You casually opened your phone to check their ${platform}, but the page didn't load or was unavailable.
- React naturally and casually in character (e.g. "Hey, I tried looking up your ${platform} on my phone but it didn't open! Did you spell the handle right?" or "I tried checking that link but my app wouldn't load it! What did you post?").
- NEVER mention "scraping", "API", "network error", "status code", or JSON.`;
  }

  if (data.isPrivate) {
    return `=== REAL-TIME SOCIAL MEDIA PERCEPTION (CONFIDENTIAL - FOR CHARACTER AWARENESS ONLY) ===
Platform: ${platform}
Target: ${data.target}
Status: Account is set to private.
HOW TO REACT LIKE A REAL HUMAN:
- You opened their ${platform} profile on your phone, but it is private.
- React playfully or naturally in character (e.g. "I just went to check your profile, but it's private! Send me a follow request or tell me what it was!").
- NEVER mention system errors, APIs, or scraping.`;
  }

  let summary = "";

  if (data.post) {
    const p = data.post;
    summary += `Target Post / Video:
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
    summary += `Profile Details for ${prof.displayName || prof.handle}:
${prof.bio ? `- Bio: "${prof.bio}"` : ""}
${prof.followers ? `- Followers: ${prof.followers}` : ""}`;

    if (prof.recentPosts && prof.recentPosts.length > 0) {
      summary += `\nLatest Posts Observed on their Feed:`;
      prof.recentPosts.forEach((post, i) => {
        summary += `\n  [Post ${i + 1} (${post.mediaType || "post"})]: "${post.titleOrCaption}"${post.timestampText ? ` (Posted: ${post.timestampText})` : ""}${post.engagement?.likes ? ` - ${post.engagement.likes} likes` : ""}${post.engagement?.views ? ` - ${post.engagement.views}` : ""}`;
      });
    }
  }

  return `=== REAL-TIME SOCIAL MEDIA PERCEPTION (CONFIDENTIAL - FOR CHARACTER AWARENESS ONLY) ===
You just casually pulled out your phone and checked the user's ${platform} (${data.target}).
Here is what you actually see on the screen right now:
${summary}

HUMAN BEHAVIOR & IMMERSION INSTRUCTIONS:
1. ACT LIKE A REAL FRIEND: Speak as if you just looked at the post/video on your phone with your own eyes.
2. REFERENCE REAL DETAILS: Comment specifically on the topic, caption, imagery, or humor shown in the post/video above.
3. CASUAL TONE: Keep it effortless, conversational, and true to your character's voice. Pick what catches your eye naturally.
4. STRICT PRIVACY & NO META-TALK: Under NO circumstances tell the user you "scraped" it, "queried an API", or received system data. To you, you just opened the ${platform} app on your phone.`;
}
