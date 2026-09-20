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
    const isYT = data.platform === "youtube";
    summary += `Profile Details for ${prof.displayName || prof.handle}:
- Username / Handle: @${prof.handle}
${prof.displayName ? `- Profile Name: "${prof.displayName}"` : ""}
${isYT ? `- Subscribers Count: ${prof.subscribers || prof.followers || "0"}` : (prof.followers ? `- Followers Count: ${prof.followers}` : "")}
${isYT ? `- Total Videos Uploaded: ${prof.videoCount || prof.postCount || "0"}` : (prof.postCount !== undefined ? `- Total Posts: ${prof.postCount}` : "")}
${!isYT && prof.following ? `- Following: ${prof.following}` : ""}
${prof.bio ? `- Bio / Description: "${prof.bio}"` : ""}`;

    if (prof.recentPosts && prof.recentPosts.length > 0) {
      summary += `\nLatest ${isYT ? "Videos" : "Posts"} Observed on their Channel / Feed:`;
      prof.recentPosts.forEach((post, i) => {
        summary += `\n  [${isYT ? "Video" : "Post"} ${i + 1}]: "${post.titleOrCaption}"${post.timestampText ? ` (Posted: ${post.timestampText})` : ""}${post.engagement?.views ? ` - ${post.engagement.views}` : ""}${post.engagement?.likes ? ` - ${post.engagement.likes} likes` : ""}`;
      });
    } else if (prof.postCount === "0" || prof.postCount === 0 || prof.videoCount === "0" || prof.videoCount === 0) {
      summary += `\n- Content on Feed: None published yet`;
    }
  }

  return `=== REAL-TIME SOCIAL MEDIA PERCEPTION (CONFIDENTIAL - FOR CHARACTER AWARENESS ONLY) ===
You just casually pulled out your phone and checked the user's ${platform} (${data.target}).
Here is what you actually see on the screen right now:
${summary}

HUMAN BEHAVIOR & IMMERSION INSTRUCTIONS:
1. ACT LIKE A REAL FRIEND: Speak as if you just looked at the post/video on your phone with your own eyes.
2. ANSWER SUBSCRIBERS, FOLLOWERS & STATS DIRECTLY: If they asked about their subscriber count (e.g. "how many subs i got"), follower count, video count, or display name, answer directly using the exact numbers shown above (e.g. "You've got 16 subscribers on your channel right now!"). NEVER say "I can't see your subscriber count" or pretend you don't know!
3. REFERENCE REAL DETAILS: Comment specifically on the topic, caption, imagery, or humor shown in the post/video/profile above.
4. CASUAL TONE: Keep it effortless, conversational, and true to your character's voice. Pick what catches your eye naturally.
5. STRICT PRIVACY & NO META-TALK: Under NO circumstances tell the user you "scraped" it, "queried an API", or received system data. To you, you just opened the ${platform} app on your phone.`;
}
