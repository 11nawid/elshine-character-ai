export type SettingsSubPage = 'main' | 'profile' | 'email';

import { generateAvatar } from '../../lib/avatar';

/** Generated, fully-local avatar options shown in the profile editor. */
export const PRESET_AVATARS = [
  generateAvatar('profile-style-1', 96),
  generateAvatar('profile-style-2', 96),
  generateAvatar('profile-style-3', 96),
  generateAvatar('profile-style-4', 96),
  generateAvatar('profile-style-5', 96),
  generateAvatar('profile-style-6', 96),
];

export const AVAILABLE_INTERESTS = [
  'Poetry', 'Philosophy', 'Science', 'Art', 'Coding', 'Music',
  'History', 'Futurism', 'Gaming', 'Writing', 'Anime', 'Travel',
  'Cinema', 'Fitness', 'Reading', 'Design'
];