import React, { useState, useEffect, useCallback } from 'react';
import { 
  Edit2, 
  Calendar, 
  MessageSquare, 
  Heart, 
  MoreVertical, 
  Loader2, 
  ArrowRight, 
  PlusSquare, 
  Globe, 
  Briefcase, 
  MapPin, 
  Settings as SettingsIcon,
  ExternalLink,
  Link2
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

  const loadCharacters = useCallback(async () => {
    try {
      const data = await listCharacters('mine');
      setCharacters(data.characters);
    } catch (error) {
      console.error('Error loading profile characters:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadCharacters();
    const unsubscribe = subscribeProfileUpdated(loadProfile);
    return unsubscribe;
  }, [loadProfile, loadCharacters]);

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
    <div className="flex-1 h-full bg-white font-sans text-black overflow-y-auto relative">
      <header className="px-8 md:px-12 py-20 md:py-28 border-b border-zinc-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-12 md:gap-20">
          {/* Avatar with Edit Profile Redirection */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group shrink-0"
          >
            <img 
              src={photoURL} 
              alt={displayName} 
              className="w-40 h-40 md:w-48 md:h-48 rounded-[3.5rem] object-cover shadow-2xl shadow-zinc-200 grayscale hover:grayscale-0 transition-all duration-700" 
            />
            <button 
              onClick={handleSettingsProfile}
              title="Edit Profile in Settings"
              className="absolute -bottom-3 -right-3 bg-black text-white p-3.5 md:p-4 rounded-full shadow-2xl hover:scale-110 hover:bg-zinc-800 transition-all"
            >
              <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </motion.div>

          <div className="flex-1 space-y-8 text-center md:text-left">
            <div className="space-y-3">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
              >
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase leading-none">{displayName}</h1>
                {userProfile?.nickname && (
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full w-fit mx-auto md:mx-0">
                    Call name: "{userProfile.nickname}"
                  </span>
                )}
              </motion.div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono text-zinc-400">
                <span>@{username}</span>
                {userProfile?.occupation && (
                  <span className="flex items-center gap-1.5 text-zinc-700 font-sans font-bold uppercase tracking-wider">
                    <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                    {userProfile.occupation}
                  </span>
                )}
                {userProfile?.location && (
                  <span className="flex items-center gap-1.5 text-zinc-700 font-sans font-bold uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    {userProfile.location}
                  </span>
                )}
              </div>
            </div>

            {bio && (
              <p className="text-zinc-600 leading-relaxed max-w-2xl text-base md:text-lg uppercase tracking-tight font-medium opacity-90">
                {bio}
              </p>
            )}

            {/* Social Links and Website (Predefined + Custom) */}
            {socials && (Object.keys(socials).some(k => k !== 'customLinks' && !!(socials as any)[k]) || (socials.customLinks && socials.customLinks.length > 0)) && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
                {/* Standard Platforms */}
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
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 hover:bg-black hover:text-white border border-zinc-200 rounded-full text-xs font-bold text-zinc-800 transition-all shadow-2xs group"
                    >
                      <Icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                      <span>{display || platform.label}</span>
                    </a>
                  );
                })}

                {/* Custom User Links */}
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
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 hover:bg-black hover:text-white border border-zinc-200 rounded-full text-xs font-bold text-zinc-800 transition-all shadow-2xs group"
                    >
                      <CustomIcon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                      <span>{custom.title || custom.platform || 'Link'}</span>
                    </a>
                  );
                })}
              </div>
            )}

            {userProfile?.interests && userProfile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {userProfile.interests.map(interest => (
                  <span key={interest} className="px-3 py-1 bg-zinc-100 border border-zinc-200 rounded-full text-[9px] font-black uppercase tracking-wider text-zinc-700">
                    {interest}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap justify-center md:justify-start gap-8 md:gap-12 pt-2">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 block">Joined</span>
                <div className="flex items-center gap-2 text-black text-sm font-bold uppercase tracking-widest">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  {userProfile?.createdAt
                    ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : '—'}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 block">Characters</span>
                <div className="flex items-center gap-2 text-black text-sm font-bold uppercase tracking-widest">
                  <MessageSquare className="w-4 h-4 text-zinc-400" />
                  {characters.length} Character{characters.length !== 1 && 's'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
              <button 
                onClick={handleSettingsProfile}
                className="bg-black text-white px-8 md:px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 flex items-center gap-3"
              >
                <SettingsIcon className="w-3.5 h-3.5" /> Edit Profile & Socials in Settings <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Characters List */}
      <section className="px-8 md:px-12 py-20 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-400 block">My Creations</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">Your Characters.</h2>
          </div>
          <button 
            onClick={handleCreate}
            className="bg-black text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <PlusSquare className="w-4 h-4" /> New Character
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-28">
            <Loader2 className="w-10 h-10 text-black animate-spin opacity-20" />
          </div>
        ) : characters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {characters.map((char, idx) => (
              <motion.div 
                key={char.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative"
              >
                <div className="aspect-[4/5] bg-zinc-100 rounded-[2.5rem] overflow-hidden relative shadow-sm hover:shadow-xl transition-shadow">
                  <img src={characterAvatar(char)} alt={char.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />
                  
                  <div className="absolute top-5 right-5">
                    {char.knowsUserFromStart && (
                      <span className="text-[8px] font-black uppercase tracking-widest bg-white text-black px-2.5 py-1 rounded-full shadow-lg">
                        Familiar
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 space-y-2 text-white">
                    <h3 className="text-2xl font-bold tracking-tighter uppercase leading-none">{char.name}</h3>
                    <p className="text-zinc-300 text-xs line-clamp-2">{char.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(char.tags || []).slice(0, 3).map(tag => (
                        <span key={tag} className="text-[8px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded backdrop-blur-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between px-2">
                  <div className="flex items-center gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {char.stats?.conversations || 0}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5" />
                      {char.stats?.likes || 0}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleEdit(char)}
                    className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-colors flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 px-3.5 py-1.5 rounded-full"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-28 bg-zinc-50 rounded-[3rem] border border-zinc-100 flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md text-zinc-300">
              <PlusSquare className="w-7 h-7" />
            </div>
            <p className="text-zinc-400 text-xs font-black uppercase tracking-[0.3em]">You haven't created any characters yet.</p>
            <button 
              onClick={handleCreate}
              className="bg-black text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all"
            >
              Create Character
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
