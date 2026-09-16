import React from 'react';
import { 
  Globe, 
  Twitter, 
  Instagram, 
  Github, 
  Youtube, 
  MessageCircle, 
  Linkedin, 
  Twitch, 
  Send, 
  Music, 
  Bookmark, 
  AtSign, 
  Radio, 
  Share2, 
  Gamepad2, 
  Palette, 
  Layers, 
  Newspaper, 
  FileText,
  ExternalLink,
  Link2
} from 'lucide-react';
import { CustomSocialLink, UserSocials } from '../types';

export interface SocialPlatformConfig {
  key: keyof Omit<UserSocials, 'customLinks'>;
  label: string;
  category: 'core' | 'community' | 'creative' | 'dev-work' | 'other';
  placeholder: string;
  prefix?: string;
  icon: React.ComponentType<{ className?: string }>;
  formatUrl: (val: string) => string;
  formatDisplay: (val: string) => string;
}

export const SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
  // Core & Personal
  {
    key: 'website',
    label: 'Website / Portfolio',
    category: 'core',
    placeholder: 'https://yourwebsite.com',
    icon: Globe,
    formatUrl: (val) => val.startsWith('http') ? val : `https://${val}`,
    formatDisplay: (val) => val.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
  },
  {
    key: 'twitter',
    label: 'Twitter / X',
    category: 'core',
    placeholder: '@handle or https://x.com/handle',
    icon: Twitter,
    formatUrl: (val) => val.startsWith('http') ? val : `https://x.com/${val.replace('@', '')}`,
    formatDisplay: (val) => val.startsWith('@') ? val : `@${val.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, '')}`
  },
  {
    key: 'instagram',
    label: 'Instagram',
    category: 'core',
    placeholder: '@handle or https://instagram.com/handle',
    icon: Instagram,
    formatUrl: (val) => val.startsWith('http') ? val : `https://instagram.com/${val.replace('@', '')}`,
    formatDisplay: (val) => val.startsWith('@') ? val : `@${val.replace(/^https?:\/\/(www\.)?instagram\.com\//, '')}`
  },
  {
    key: 'youtube',
    label: 'YouTube',
    category: 'core',
    placeholder: 'youtube.com/@channel',
    icon: Youtube,
    formatUrl: (val) => val.startsWith('http') ? val : `https://youtube.com/${val.startsWith('@') ? val : `@${val}`}`,
    formatDisplay: (val) => val.replace(/^https?:\/\/(www\.)?youtube\.com\//, '')
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    category: 'core',
    placeholder: '@handle or https://tiktok.com/@handle',
    icon: Radio,
    formatUrl: (val) => val.startsWith('http') ? val : `https://tiktok.com/@${val.replace('@', '')}`,
    formatDisplay: (val) => val.startsWith('@') ? val : `@${val.replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/, '')}`
  },

  // Tech & Work
  {
    key: 'github',
    label: 'GitHub',
    category: 'dev-work',
    placeholder: 'github.com/username',
    icon: Github,
    formatUrl: (val) => val.startsWith('http') ? val : `https://github.com/${val.replace('@', '')}`,
    formatDisplay: (val) => val.replace(/^https?:\/\/(www\.)?github\.com\//, '')
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    category: 'dev-work',
    placeholder: 'linkedin.com/in/username',
    icon: Linkedin,
    formatUrl: (val) => val.startsWith('http') ? val : `https://linkedin.com/in/${val.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}`,
    formatDisplay: (val) => val.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')
  },
  {
    key: 'medium',
    label: 'Medium',
    category: 'dev-work',
    placeholder: 'medium.com/@username',
    icon: FileText,
    formatUrl: (val) => val.startsWith('http') ? val : `https://medium.com/${val.startsWith('@') ? val : `@${val}`}`,
    formatDisplay: (val) => val.replace(/^https?:\/\/(www\.)?medium\.com\//, '')
  },
  {
    key: 'substack',
    label: 'Substack / Newsletter',
    category: 'dev-work',
    placeholder: 'username.substack.com',
    icon: Newspaper,
    formatUrl: (val) => val.startsWith('http') ? val : (val.includes('.') ? `https://${val}` : `https://${val}.substack.com`),
    formatDisplay: (val) => val.replace(/^https?:\/\//, '')
  },

  // Community & Chat
  {
    key: 'discord',
    label: 'Discord',
    category: 'community',
    placeholder: 'username or discord.gg/server',
    icon: MessageCircle,
    formatUrl: (val) => val.startsWith('http') ? val : (val.startsWith('discord.gg') ? `https://${val}` : `https://discord.com/users/${val}`),
    formatDisplay: (val) => val
  },
  {
    key: 'telegram',
    label: 'Telegram',
    category: 'community',
    placeholder: 't.me/username or @username',
    icon: Send,
    formatUrl: (val) => val.startsWith('http') ? val : `https://t.me/${val.replace(/^@/, '')}`,
    formatDisplay: (val) => val.startsWith('t.me') ? val : `@${val.replace(/^@/, '')}`
  },
  {
    key: 'reddit',
    label: 'Reddit',
    category: 'community',
    placeholder: 'u/username or reddit.com/u/username',
    icon: MessageCircle,
    formatUrl: (val) => val.startsWith('http') ? val : `https://reddit.com/u/${val.replace(/^u\//, '')}`,
    formatDisplay: (val) => val.startsWith('u/') ? val : `u/${val.replace(/^https?:\/\/(www\.)?reddit\.com\/u\//, '')}`
  },
  {
    key: 'threads',
    label: 'Threads',
    category: 'community',
    placeholder: '@handle or https://threads.net/@handle',
    icon: AtSign,
    formatUrl: (val) => val.startsWith('http') ? val : `https://threads.net/@${val.replace('@', '')}`,
    formatDisplay: (val) => val.startsWith('@') ? val : `@${val.replace(/^https?:\/\/(www\.)?threads\.net\/@?/, '')}`
  },
  {
    key: 'bluesky',
    label: 'Bluesky',
    category: 'community',
    placeholder: 'handle.bsky.social',
    icon: Share2,
    formatUrl: (val) => val.startsWith('http') ? val : `https://bsky.app/profile/${val.replace('@', '')}`,
    formatDisplay: (val) => val.replace(/^https?:\/\/(www\.)?bsky\.app\/profile\//, '')
  },
  {
    key: 'mastodon',
    label: 'Mastodon',
    category: 'community',
    placeholder: '@username@instance.social',
    icon: Share2,
    formatUrl: (val) => val.startsWith('http') ? val : `https://${val.replace(/^@/, '')}`,
    formatDisplay: (val) => val
  },

  // Creative & Entertainment
  {
    key: 'twitch',
    label: 'Twitch',
    category: 'creative',
    placeholder: 'twitch.tv/username',
    icon: Twitch,
    formatUrl: (val) => val.startsWith('http') ? val : `https://twitch.tv/${val.replace('@', '')}`,
    formatDisplay: (val) => val.replace(/^https?:\/\/(www\.)?twitch\.tv\//, '')
  },
  {
    key: 'spotify',
    label: 'Spotify Artist / Profile',
    category: 'creative',
    placeholder: 'open.spotify.com/user/... or artist',
    icon: Music,
    formatUrl: (val) => val.startsWith('http') ? val : `https://open.spotify.com/user/${val}`,
    formatDisplay: (val) => val.replace(/^https?:\/\/open\.spotify\.com\//, '')
  },
  {
    key: 'steam',
    label: 'Steam / Gaming Profile',
    category: 'creative',
    placeholder: 'steamcommunity.com/id/username',
    icon: Gamepad2,
    formatUrl: (val) => val.startsWith('http') ? val : `https://steamcommunity.com/id/${val}`,
    formatDisplay: (val) => val.replace(/^https?:\/\/(www\.)?steamcommunity\.com\/id\//, '')
  },
  {
    key: 'artstation',
    label: 'ArtStation',
    category: 'creative',
    placeholder: 'artstation.com/artist',
    icon: Palette,
    formatUrl: (val) => val.startsWith('http') ? val : `https://artstation.com/${val}`,
    formatDisplay: (val) => val.replace(/^https?:\/\/(www\.)?artstation\.com\//, '')
  },
  {
    key: 'behance',
    label: 'Behance',
    category: 'creative',
    placeholder: 'behance.net/portfolio',
    icon: Layers,
    formatUrl: (val) => val.startsWith('http') ? val : `https://behance.net/${val}`,
    formatDisplay: (val) => val.replace(/^https?:\/\/(www\.)?behance\.net\//, '')
  },
  {
    key: 'pinterest',
    label: 'Pinterest',
    category: 'creative',
    placeholder: 'pinterest.com/username',
    icon: Bookmark,
    formatUrl: (val) => val.startsWith('http') ? val : `https://pinterest.com/${val}`,
    formatDisplay: (val) => val.replace(/^https?:\/\/(www\.)?pinterest\.com\//, '')
  },
  {
    key: 'patreon',
    label: 'Patreon',
    category: 'creative',
    placeholder: 'patreon.com/creator',
    icon: HeartIcon,
    formatUrl: (val) => val.startsWith('http') ? val : `https://patreon.com/${val}`,
    formatDisplay: (val) => val.replace(/^https?:\/\/(www\.)?patreon\.com\//, '')
  }
];

function HeartIcon(props: { className?: string }) {
  return <ExternalLink {...props} />;
}

export function getSocialIcon(platform: string): React.ComponentType<{ className?: string }> {
  const norm = platform.toLowerCase().trim();
  const matched = SOCIAL_PLATFORMS.find(p => p.key === norm || p.label.toLowerCase().includes(norm));
  if (matched) return matched.icon;
  if (norm.includes('shop') || norm.includes('store') || norm.includes('buy')) return ExternalLink;
  return Link2;
}
