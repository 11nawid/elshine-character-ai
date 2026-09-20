/**
 * Social Scraper Shared Types
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
  subscribers?: string | number;
  following?: string | number;
  postCount?: string | number;
  videoCount?: string | number;
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
