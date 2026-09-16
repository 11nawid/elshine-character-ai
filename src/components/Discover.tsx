import React, { useState, useEffect } from 'react';
import { Search, Heart, Users, ArrowRight, Zap, Globe, Sparkles, Shield, X, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { Character } from '../types';
import { cn } from '../lib/utils';
import { characterAvatar } from '../lib/avatar';
import { listCharacters } from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface DiscoverProps {
  onNavigateToChat?: (characterId: string) => void;
}

const Discover: React.FC<DiscoverProps> = ({ onNavigateToChat }) => {
  const navigate = useNavigate();
  const handleChat = onNavigateToChat || ((characterId: string) => navigate(`/chats/${characterId}`));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await listCharacters('public');
        if (active) setCharacters(data.characters);
      } catch (error) {
        console.error('Error loading public characters:', error);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const filters = [
    'All', 'Popular', 'Trending', 'New', 'Romance', 
    'Fantasy', 'Anime', 'Roleplay', 'Sci-Fi', 'Funny', 
    'Adventure', 'Gaming', 'Friends'
  ];

  const filteredCharacters = characters.filter(char => {
    const matchesSearch = (char.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (char.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (char.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesFilter = true;
    if (activeFilter !== 'All' && activeFilter !== 'Popular' && activeFilter !== 'Trending' && activeFilter !== 'New') {
      matchesFilter = char.tags ? char.tags.some(tag => tag.toLowerCase() === activeFilter.toLowerCase()) : false;
    }

    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (activeFilter === 'Popular') {
      return (b.stats?.likes || 0) - (a.stats?.likes || 0);
    }
    if (activeFilter === 'Trending') {
      return (b.stats?.conversations || 0) - (a.stats?.conversations || 0);
    }
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  return (
    <div className="flex-1 h-full bg-white font-sans text-black overflow-y-auto">
      {/* 1. Hero Header */}
      <header className="px-6 md:px-12 py-12 border-b border-zinc-100 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-400 block mb-3">Public Manifestations</span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase leading-[0.85] mb-6">
              Discover <br /> Companions.
            </h1>
            <p className="text-sm text-zinc-500 font-light max-w-lg mx-auto leading-relaxed">
              Explore hundreds of digital souls crafted by the community. Start a conversation and begin building shared memories.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-xl mx-auto"
          >
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search by name, archetype, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200/80 rounded-full py-4 pl-14 pr-12 focus:outline-none focus:ring-4 focus:ring-zinc-100 focus:bg-white transition-all text-sm font-medium shadow-xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-black transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        </div>
      </header>

      {/* 2. Category Filters & Status Bar */}
      <div className="px-6 md:px-12 py-5 border-b border-zinc-100 sticky top-0 bg-white/90 backdrop-blur-xl z-20 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto py-1">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all cursor-pointer",
                  activeFilter === filter 
                    ? "bg-black text-white shadow-md shadow-zinc-200" 
                    : "bg-zinc-100/70 text-zinc-500 hover:text-black hover:bg-zinc-200/70"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 shrink-0 hidden sm:block">
            {filteredCharacters.length} Available
          </span>
        </div>
      </div>

      {/* 3. Grid Content */}
      <main className="px-6 md:px-12 py-12 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Loading gallery...</p>
          </div>
        ) : filteredCharacters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCharacters.map((char, index) => (
              <motion.div 
                key={char.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                className="group relative"
              >
                <div className="bg-zinc-50 rounded-3xl overflow-hidden border border-zinc-100 transition-all duration-500 hover:bg-white hover:border-zinc-300 hover:shadow-2xl hover:shadow-zinc-200 group-hover:-translate-y-1.5 flex flex-col h-full">
                  <div className="relative h-64 overflow-hidden bg-zinc-100">
                    <img 
                      src={characterAvatar(char)} 
                      alt={char.name} 
                      loading="lazy"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      {char.rating === 'mature' && (
                        <span className="bg-black/80 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">18+</span>
                      )}
                      <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                      </div>
                    </div>
                    
                    <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
                      <div className="flex items-end justify-between">
                        <div>
                          <h3 className="text-xl font-bold tracking-tight uppercase mb-0.5">{char.name}</h3>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300 flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                            By {char.creatorName || 'Community'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end max-w-[140px]">
                          {(char.tags || []).slice(0, 2).map(tag => (
                            <span key={tag} className="text-[8px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">
                      {char.description || "A dynamic personality waiting to chat."}
                    </p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                      <div className="flex items-center gap-4 text-zinc-400 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold tracking-wider">{((char.stats?.conversations || 1)).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-[10px] font-bold tracking-wider">{((char.stats?.likes || 1)).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleChat(char.id)}
                        className="bg-black text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all flex items-center gap-2 group-hover:scale-105 cursor-pointer"
                      >
                        Chat <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-zinc-50 rounded-3xl border border-zinc-100 p-12 max-w-lg mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto text-zinc-400 shadow-md shadow-zinc-100">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight uppercase">No matching companions</h3>
              <p className="text-zinc-500 text-xs leading-relaxed mt-2">
                We couldn't find any characters matching "{searchQuery}". Try changing your filters or create your own custom companion.
              </p>
            </div>
            <div className="flex justify-center gap-4 pt-2">
              <button 
                onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
                className="px-6 py-2.5 border border-zinc-200 text-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors cursor-pointer"
              >
                Reset Search
              </button>
              <button 
                onClick={() => navigate('/create')}
                className="px-6 py-2.5 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Create New
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 4. Bottom Features Banner */}
      <section className="px-6 md:px-12 py-16 border-t border-zinc-100 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Global Public Roster', desc: 'Browse hundreds of unique voices, backstories, and archetypes.', icon: Globe },
            { title: 'Verified Quality', desc: 'Engineered for consistent roleplay and zero robotic repetition.', icon: Shield },
            { title: 'Instant Synaptic Memory', desc: 'Companions build enduring memory links as you chat.', icon: Sparkles }
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-zinc-100 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-black shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold uppercase tracking-tight">{feature.title}</h4>
                  <p className="text-zinc-500 text-xs font-light leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Discover;
