/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CustomSocialLink {
  id: string;
  platform: string; // e.g. "Twitch", "TikTok", "Substack", "Spotify", "Portfolio", or custom name
  title?: string;
  url: string;
}

export interface UserSocials {
  website?: string;
  twitter?: string;
  instagram?: string;
  github?: string;
  discord?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
  twitch?: string;
  telegram?: string;
  reddit?: string;
  spotify?: string;
  pinterest?: string;
  threads?: string;
  bluesky?: string;
  mastodon?: string;
  patreon?: string;
  medium?: string;
  substack?: string;
  steam?: string;
  artstation?: string;
  behance?: string;
  customLinks?: CustomSocialLink[];
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  interests?: string[];
  persona?: string;
  nickname?: string;
  location?: string;
  occupation?: string;
  socials?: UserSocials;
  createdAt: number;
  onboardingCompleted?: boolean;
}

export interface CharacterTraits {
  friendly: number;
  shy: number;
  confident: number;
  funny: number;
  serious: number;
  romantic: number;
  sarcastic: number;
  energetic: number;
}

export interface Character {
  id: string;
  creatorId: string;
  creatorName?: string;
  name: string;
  role?: string;
  description: string;
  personality: string;
  traits: CharacterTraits;
  backstory: string;
  speakingStyle: string;
  likes: string[];
  dislikes: string[];
  greeting: string;
  knowsUserFromStart?: boolean;
  userRelationship?: string;
  sharedHistory?: string;
  userNickname?: string;
  visibility: 'public' | 'private' | 'unlisted';
  rating: 'general' | 'mature';
  avatarUrl: string;
  tags: string[];
  stats: {
    conversations: number;
    likes: number;
  };
  createdAt: number;
  updatedAt?: number;
}

export interface Memory {
  id: string;
  text: string;
  createdAt: number;
}

export interface Chat {
  id: string;
  userId: string;
  characterId: string;
  participants: string[]; // [userId, characterId]
  lastMessage: string;
  lastMessageAt: number;
  unread?: boolean;
  memories?: Memory[];
  character?: Character | null;
}

export interface Attachment {
  url: string;
  type: 'image' | 'file';
  name: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  role: 'user' | 'assistant';
  text: string;
  attachment?: Attachment;
  createdAt: number;
}

export type LibraryItemType = 'Image' | 'Scenario' | 'Prompt' | 'Template' | 'Saved';

export interface LibraryItem {
  id: string;
  userId: string;
  type: LibraryItemType;
  title: string;
  content: string;
  createdAt: number;
}

export interface AppState {
  currentUser: User | null;
  activeView: 'home' | 'discover' | 'create' | 'chats' | 'settings' | 'profile';
  selectedCharacterId: string | null;
  selectedChatId: string | null;
}
