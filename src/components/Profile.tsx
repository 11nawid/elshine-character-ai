import React, { useState, useEffect, useCallback } from 'react';
import { 
  Edit2, 
  Calendar, 
  MessageSquare, 
  Heart, 
  Loader2, 
  PlusSquare, 
  Briefcase, 
  MapPin, 
  Settings as SettingsIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { Character, User } from '../types';
import { auth } from '../lib/firebase';
import { getMe, listCharacters, subscribeProfileUpdated } from '../lib/api';
import { characterAvatar, userAvatar } from '../lib/avatar';
import { realName, realUsername } from '../lib/userDisplay';
import { SOCIAL_PLATFORMS, getSocialIcon } from '../lib/socialPlatforms';
import { useNavigate } from 'react-router-dom';

interface ProfileProps {
  onNavigateToSettingsProfile?: () => void;
  onNavigateToCreate?: () => void;
  onNavigateToEditCharacter?: (character: Character) => void;
}

const Profile: React.FC<ProfileProps> = ({ 
  onNavigateToSettingsProfile, 
  onNavigateToCreate, 
  onNavigateToEditCharacter 
}) => {
  const navigate = useNavigate();
  const handleSettingsProfile = onNavigateToSettingsProfile || (() => navigate('/settings/profile'));
  const handleCreate = onNavigateToCreate || (() => navigate('/create'));
  const handleEdit = onNavigateToEditCharacter || ((char: Character) => navigate('/create', { state: { character: char } }));
  
  const [characters, setCharacters] = useState<Character[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await getMe();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      const data = await listCharacters('mine');
      setCharacters(data.characters || []);
    } catch (error) {
      console.error('Error loading profile characters:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadData();
    const unsubscribe = subscribeProfileUpdated(loadProfile);
    return unsubscribe;
  }, [loadProfile, loadData]);

  const displayName = realName(userProfile?.displayName || auth.currentUser?.displayName, auth.currentUser?.email) || userProfile?.displayName || '';
  const username = realUsername(userProfile?.displayName || auth.currentUser?.displayName, auth.currentUser?.email, userProfile?.nickname);
  const bio = userProfile?.bio || '';
  const photoURL = userAvatar({
    uid: auth.currentUser?.uid,
    photoURL: userProfile?.photoURL || auth.currentUser?.photoURL,
    email: auth.currentUser?.email,
  });
  const socials = userProfile?.socials;

  return (
    <div className="flex-1 h-full bg-white font-sans text-black overflow-y-auto">
      {/* 1. Clean Minimal Header */}
      <header className="px-6 md:px-12 py-10 md:py-14 border-b border-zinc-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <img 
              src={photoURL} 
              alt={displayName} 
              className="w-28 h-28 md:w-36 md:h-36 rounded-3xl object-cover shadow-sm grayscale hover:grayscale-0 transition-all duration-500 bg-zinc-50 border border-zinc-200/80" 
            />
            <button 
              onClick={handleSettingsProfile}
              title="Edit Profile"
              className="absolute -bottom-2 -right-2 bg-black text-white p-2.5 rounded-full shadow-md hover:scale-105 hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-3.5 text-center md:text-left">
            <div className="space-y-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase leading-none">{displayName}</h1>
                {userProfile?.nickname && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full w-fit mx-auto md:mx-0">
                    "{userProfile.nickname}"
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 text-xs text-zinc-400">
                <span className="font-mono text-zinc-500">@{username}</span>
                {userProfile?.occupation && (
                  <span className="flex items-center gap-1.5 text-zinc-600 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                    {userProfile.occupation}
                  </span>
                )}
                {userProfile?.location && (
                  <span className="flex items-center gap-1.5 text-zinc-600 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    {userProfile.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  Joined {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2026'}
                </span>
              </div>
            </div>

            {bio && (
              <p className="text-zinc-600 leading-relaxed max-w-xl text-sm font-normal">
                {bio}
              </p>
            )}

            {/* Social Links */}
            {socials && (Object.keys(socials).some(k => k !== 'customLinks' && !!(socials as any)[k]) || (socials.customLinks && socials.customLinks.length > 0)) && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-0.5">
                {SOCIAL_PLATFORMS.map(platform => {
                  const val = (socials[platform.key as keyof typeof socials] as string);
                  if (!val) return null;
                  const Icon = platform.icon;
                  const url = platform.formatUrl(val);
                  const display = platform.formatDisplay(val);

                  return (
                    <a
                      key={platform.key}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1 bg-zinc-50 hover:bg-black hover:text-white border border-zinc-200/80 rounded-full text-xs font-medium text-zinc-700 transition-all cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                      <span>{display || platform.label}</span>
                    </a>
                  );
                })}

                {socials.customLinks?.map(custom => {
                  if (!custom.url) return null;
                  const CustomIcon = getSocialIcon(custom.platform || custom.title || 'link');
                  const url = custom.url.startsWith('http') ? custom.url : `https://${custom.url}`;

                  return (
                    <a
                      key={custom.id}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1 bg-zinc-50 hover:bg-black hover:text-white border border-zinc-200/80 rounded-full text-xs font-medium text-zinc-700 transition-all cursor-pointer"
                    >
                      <CustomIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                      <span>{custom.title || custom.platform || 'Link'}</span>
                    </a>
                  );
                })}
              </div>
            )}

            {/* Action button */}
            <div className="pt-1 flex flex-wrap gap-3 justify-center md:justify-start">
              <button 
                onClick={handleSettingsProfile}
                className="bg-black text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <SettingsIcon className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Clean Characters Grid */}
      <main className="px-6 md:px-12 py-10 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold tracking-tight uppercase">Your Characters</h2>
            <p className="text-xs text-zinc-400">{characters.length} authored {characters.length === 1 ? 'companion' : 'companions'}</p>
          </div>
          <button 
            onClick={handleCreate}
            className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PlusSquare className="w-3.5 h-3.5" /> New Character
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-black animate-spin opacity-20" />
          </div>
        ) : characters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((char, idx) => (
              <motion.div 
                key={char.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group relative"
              >
                <div className="aspect-[4/5] bg-zinc-100 rounded-2xl overflow-hidden relative border border-zinc-200/60 shadow-xs hover:shadow-md transition-shadow">
                  <img src={characterAvatar(char)} alt={char.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                  
                  <div className="absolute top-3 right-3">
                    {char.knowsUserFromStart && (
                      <span className="text-[8px] font-bold uppercase tracking-wider bg-white text-black px-2 py-0.5 rounded-full shadow-xs">
                        Familiar
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 space-y-1 text-white">
                    <h3 className="text-lg font-bold tracking-tight uppercase leading-none">{char.name}</h3>
                    <p className="text-zinc-300 text-xs line-clamp-2">{char.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(char.tags || []).slice(0, 3).map(tag => (
                        <span key={tag} className="text-[8px] font-medium uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-2.5 flex items-center justify-between px-1">
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {char.stats?.conversations || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {char.stats?.likes || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigate(`/chats/${char.id}`)}
                      className="text-[10px] font-bold uppercase tracking-wider text-black hover:bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200 cursor-pointer transition-colors"
                    >
                      Chat
                    </button>
                    <button 
                      onClick={() => handleEdit(char)}
                      className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 hover:text-black hover:bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200 cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-2.5 h-2.5" /> Edit
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-4 border border-dashed border-zinc-200 rounded-2xl p-8 max-w-lg mx-auto">
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">You haven't created any characters yet.</p>
            <button 
              onClick={handleCreate}
              className="bg-black text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <PlusSquare className="w-4 h-4" /> Create Character
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
