import React, { useState, useEffect, useCallback } from 'react';
import { Plus, MessageSquare, Edit2, MoreVertical, Zap, Shield, Globe, Brain, ArrowRight, Sparkles, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { Character, Chat } from '../types';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { characterAvatar } from '../lib/avatar';
import { realName } from '../lib/userDisplay';
import { listCharacters, listChats, duplicateCharacter, deleteCharacter } from '../lib/api';
import { UnifiedMemoryMap } from './UnifiedMemoryMap';
import { useNavigate } from 'react-router-dom';

interface HomeProps {
  onNavigateToCreate?: () => void;
  onNavigateToChat?: (characterId: string) => void;
  onNavigateToProfile?: () => void;
  onNavigateToEdit?: (character: Character) => void;
}

const Home: React.FC<HomeProps> = ({ 
  onNavigateToCreate, 
  onNavigateToChat, 
  onNavigateToProfile, 
  onNavigateToEdit 
}) => {
  const navigate = useNavigate();
  const handleCreate = onNavigateToCreate || (() => navigate('/create'));
  const handleChat = onNavigateToChat || ((characterId: string) => navigate(`/chats/${characterId}`));
  const handleProfile = onNavigateToProfile || (() => navigate('/profile'));
  const handleEdit = onNavigateToEdit || ((character: Character) => navigate('/create', { state: { character } }));

  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentChats, setRecentChats] = useState<(Chat & { character: Character })[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showMemoryMapModal, setShowMemoryMapModal] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeDropdown]);

  const loadCharacters = useCallback(async () => {
    try {
      const mine = await listCharacters('mine');
      setCharacters(mine.characters);
    } catch (error) {
      console.error('Error loading my characters:', error);
    }
  }, []);

  const handleDuplicate = async (char: Character) => {
    setActiveDropdown(null);
    try {
      await duplicateCharacter(char.id);
      await loadCharacters();
    } catch (error) {
      console.error('Error duplicating character:', error);
    }
  };

  const handleDelete = async (charId: string) => {
    setActiveDropdown(null);
    if (!confirm('Are you sure you want to delete this character?')) return;
    try {
      await deleteCharacter(charId);
      await loadCharacters();
    } catch (error) {
      console.error('Error deleting character:', error);
    }
  };

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [mine, chats] = await Promise.all([listCharacters('mine'), listChats()]);
        if (!active) return;
        setCharacters(mine.characters);
        const recent = chats.chats
          .filter((chat) => chat.character)
          .slice(0, 6) as (Chat & { character: Character })[];
        setRecentChats(recent);
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const timeGreeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const userFirstName = realName(auth.currentUser?.displayName, auth.currentUser?.email).split(' ')[0] || 'there';

  return (
    <div className="flex-1 h-full bg-white font-sans text-black overflow-y-auto">
      {/* 1. Top Header */}
      <header className="px-6 md:px-12 py-8 border-b border-zinc-100 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block mb-1.5">{timeGreeting}</span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase leading-[0.9]">
              Welcome back, <br /> {userFirstName}.
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex items-center gap-3 flex-wrap"
          >
            <button
              type="button"
              onClick={() => setShowMemoryMapModal(true)}
              className="flex items-center gap-2 bg-white border border-zinc-200 text-black px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-xs cursor-pointer"
            >
              <Brain className="w-4 h-4 text-indigo-600" /> Memory Map
            </button>
            <button 
              onClick={handleCreate}
              className="flex items-center gap-2.5 bg-black text-white px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 hover:scale-[1.02] cursor-pointer"
            >
              Create Character <Plus className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="px-6 md:px-12 py-10 max-w-7xl mx-auto space-y-16">
        {/* Your Characters Collection */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block mb-1">My Collection</span>
              <h2 className="text-2xl font-bold tracking-tight uppercase">My Characters</h2>
            </div>
            {characters.length > 0 && (
              <button 
                onClick={handleProfile}
                className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:pr-3 transition-all cursor-pointer"
              >
                View in Profile
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : characters.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map((char, index) => (
                <motion.div 
                  key={char.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={cn("group relative", activeDropdown === char.id ? "z-50" : "z-10")}
                >
                  <div className="bg-zinc-50 rounded-3xl p-7 transition-all duration-500 hover:bg-white hover:border hover:border-zinc-200 hover:shadow-2xl hover:shadow-zinc-200/60 group-hover:-translate-y-1.5 flex flex-col justify-between h-full border border-zinc-100">
                    <div>
                      <div className="flex items-start justify-between mb-6">
                        <div className="relative">
                          <img 
                            src={characterAvatar(char)} 
                            alt={char.name} 
                            className="w-20 h-20 rounded-2xl object-cover grayscale transition-all duration-500 group-hover:grayscale-0 shadow-md" 
                          />
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                            <Zap className="w-2.5 h-2.5 text-white fill-white" />
                          </div>
                        </div>
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === char.id ? null : char.id);
                            }}
                            className="p-1.5 rounded-full hover:bg-zinc-200/60 text-zinc-400 hover:text-black transition-colors cursor-pointer"
                            aria-label="Character options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {activeDropdown === char.id && (
                            <div 
                              className="absolute right-0 top-full mt-2 w-44 bg-white border border-zinc-100 rounded-2xl shadow-xl shadow-zinc-200/60 z-20 py-2 overflow-hidden flex flex-col"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button 
                                onClick={() => handleDuplicate(char)}
                                className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors cursor-pointer"
                              >
                                Duplicate
                              </button>
                              <button 
                                onClick={() => handleEdit(char)}
                                className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors cursor-pointer"
                              >
                                Edit Details
                              </button>
                              <div className="h-px bg-zinc-100 my-1 mx-2" />
                              <button 
                                onClick={() => handleDelete(char.id)}
                                className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h3 className="text-xl font-bold tracking-tight uppercase">{char.name}</h3>
                          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-0.5 flex items-center gap-1.5">
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              char.visibility === 'public' ? "bg-black" : "bg-zinc-300"
                            )} />
                            {char.visibility} companion
                          </p>
                        </div>

                        <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">
                          {char.description || "No description provided."}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(char.tags || []).slice(0, 3).map(tag => (
                            <span key={tag} className="px-2.5 py-0.5 bg-white border border-zinc-100 text-zinc-400 text-[8px] font-black uppercase tracking-wider rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                      <button 
                        onClick={() => handleChat(char.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all cursor-pointer"
                      >
                        Chat <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleEdit(char)}
                        className="w-10 h-10 flex items-center justify-center bg-white border border-zinc-200 text-zinc-500 rounded-full hover:bg-black hover:text-white hover:border-black transition-all cursor-pointer"
                        title="Edit character"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-50 rounded-3xl py-14 px-8 text-center border-2 border-dashed border-zinc-200">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-zinc-100">
                <Plus className="w-6 h-6 text-zinc-400" />
              </div>
              <h3 className="text-xl font-bold tracking-tight uppercase mb-2">No characters created yet</h3>
              <p className="text-zinc-500 mb-6 max-w-sm mx-auto text-xs leading-relaxed">
                Start crafting your own unique AI companion with custom personality, voice, and persistent memory.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button 
                  onClick={handleCreate}
                  className="bg-black text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-md shadow-zinc-200 cursor-pointer"
                >
                  Create From Scratch
                </button>
                <button 
                  onClick={() => navigate('/explore')}
                  className="bg-white border border-zinc-200 text-black px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-50 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" /> Browse Community Roster
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Recent Chats & System Overview */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block mb-1">Conversations</span>
                <h2 className="text-2xl font-bold tracking-tight uppercase">Recent Chats</h2>
              </div>
              {recentChats.length > 0 && (
                <button 
                  onClick={() => navigate('/chats')}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-0.5 hover:pr-3 transition-all cursor-pointer"
                >
                  View All Chats
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {recentChats.length > 0 ? (
                recentChats.map((chat) => (
                  <button 
                    key={chat.id}
                    onClick={() => handleChat(chat.characterId)}
                    className="w-full flex items-center gap-5 p-4 bg-white border border-zinc-100 rounded-2xl hover:border-black hover:shadow-lg hover:shadow-zinc-100 transition-all group text-left cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <img 
                        src={characterAvatar(chat.character)} 
                        alt={chat.character.name} 
                        className="w-14 h-14 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                      />
                      {chat.unread && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-black border-2 border-white rounded-full animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-base font-bold tracking-tight uppercase truncate">{chat.character.name}</h4>
                        <span className="text-[9px] font-mono text-zinc-400 shrink-0">
                          {new Date(chat.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-xs truncate">
                        {chat.lastMessage || "No messages yet"}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                ))
              ) : (
                <div className="p-8 bg-zinc-50 border border-zinc-100 rounded-2xl text-center space-y-2">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">No active conversations</p>
                  <p className="text-zinc-400 text-xs font-light">Pick a character from the gallery to start your first chat.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Engine Status Widget */}
          <aside className="space-y-6">
            <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-5">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 block">System State</span>
              <div className="space-y-3.5">
                {[
                  { label: "Roleplay Intelligence", val: "Unlimited Web", icon: Zap },
                  { label: "Synaptic Memory", val: "Active Real-Time", icon: Brain },
                  { label: "Credential Security", val: "AES-256", icon: Shield },
                  { label: "Global Cluster", val: "Operational", icon: Globe },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="flex items-center justify-between pb-3 border-b border-zinc-200/50 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-xs text-zinc-600 font-medium">{stat.label}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase text-black bg-white px-2 py-0.5 rounded-full border border-zinc-100">
                        {stat.val}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </section>

      </main>

      {/* Global Unified Knowledge & Memory Map Modal */}
      <UnifiedMemoryMap 
        isOpen={showMemoryMapModal}
        onClose={() => setShowMemoryMapModal(false)}
        characters={characters}
        onNavigateToChat={handleChat}
      />
    </div>
  );
};

export default Home;
