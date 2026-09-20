import React, { useState, useEffect } from 'react';
import { Search, Heart, MessageSquare, ArrowRight, X, Plus, Pin } from 'lucide-react';
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
        if (active) setCharacters(data.characters || []);
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
    'All', 'Creator', 'YouTube', 'Instagram', 'Popular', 'Trending', 'New', 
    'Gaming', 'Romance', 'Fantasy', 'Anime', 'Roleplay', 'Friends'
  ];

  const filteredCharacters = characters.filter(char => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (char.name || '').toLowerCase().includes(q) || 
      (char.role || '').toLowerCase().includes(q) || 
      (char.description || '').toLowerCase().includes(q) ||
      (char.tags || []).some(t => t.toLowerCase().includes(q));
    
    let matchesFilter = true;
    if (activeFilter !== 'All' && activeFilter !== 'Popular' && activeFilter !== 'Trending' && activeFilter !== 'New') {
      matchesFilter = char.tags ? char.tags.some(tag => tag.toLowerCase() === activeFilter.toLowerCase()) : false;
    }

    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

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
      {/* 1. Sleek Compact Header */}
      <header className="px-6 md:px-10 pt-8 pb-5 border-b border-zinc-100 bg-white sticky top-0 z-20 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight uppercase leading-none">Explore</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-full">
                  {filteredCharacters.length} {filteredCharacters.length === 1 ? 'companion' : 'companions'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Discover community personas and start persistent roleplay.</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text"
                placeholder="Search companions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200/80 rounded-full py-2 pl-9.5 pr-8 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-zinc-400 text-xs font-medium placeholder:text-zinc-400 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 pb-0.5">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap transition-all cursor-pointer",
                  activeFilter === filter 
                    ? "bg-black text-white shadow-xs" 
                    : "bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200/70 hover:text-black"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 2. Character Grid */}
      <main className="px-6 md:px-10 py-8 max-w-7xl mx-auto">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 space-y-3">
            <div className="w-7 h-7 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-400 font-medium">Loading companions...</p>
          </div>
        ) : filteredCharacters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filteredCharacters.map((char, index) => (
              <motion.div 
                key={char.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.3) }}
                className={cn(
                  "group flex flex-col bg-white border rounded-2xl overflow-hidden transition-all duration-300",
                  char.isPinned 
                    ? "border-amber-400/80 shadow-md ring-1 ring-amber-400/40 hover:shadow-lg hover:border-amber-500" 
                    : "border-zinc-200/70 hover:border-zinc-300 hover:shadow-md"
                )}
              >
                <div 
                  onClick={() => handleChat(char.id)}
                  className="aspect-[4/5] bg-zinc-100 relative overflow-hidden cursor-pointer"
                >
                  <img 
                    src={characterAvatar(char)} 
                    alt={char.name} 
                    loading="lazy"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    {char.isPinned && (
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                        <Pin className="w-2.5 h-2.5 fill-white rotate-45" /> Pinned
                      </span>
                    )}
                    {char.rating === 'mature' && (
                      <span className="bg-black/70 backdrop-blur-xs text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        18+
                      </span>
                    )}
                    {char.knowsUserFromStart && (
                      <span className="bg-white/90 text-black text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        Familiar
                      </span>
                    )}
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-3 left-3 right-3 text-white space-y-0.5">
                    <h3 className="text-base font-bold tracking-tight uppercase leading-tight drop-shadow-xs">{char.name}</h3>
                    <p className="text-[10px] text-zinc-300 font-medium line-clamp-1">
                      {char.role || (char.creatorName ? `By ${char.creatorName}` : 'Companion')}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">
                    {char.description || "A distinct personality ready to converse."}
                  </p>

                  <div className="space-y-2.5 pt-1 border-t border-zinc-100">
                    <div className="flex flex-wrap gap-1">
                      {(char.tags || []).slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] font-medium uppercase tracking-wider bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-zinc-400 text-xs pt-0.5">
                      <div className="flex items-center gap-2.5 text-[11px]">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {char.stats?.conversations || 1}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {char.stats?.likes || 0}
                        </span>
                      </div>

                      <button 
                        onClick={() => handleChat(char.id)}
                        className="bg-black text-white hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        Chat <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 border border-dashed border-zinc-200 rounded-2xl p-8 max-w-md mx-auto">
            <p className="text-zinc-500 text-xs font-medium">
              {searchQuery ? `No companions found matching "${searchQuery}".` : 'No companions found in this category.'}
            </p>
            <div className="flex justify-center gap-2.5">
              <button 
                onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
                className="px-4 py-2 border border-zinc-200 text-black rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button 
                onClick={() => navigate('/create')}
                className="px-4 py-2 bg-black text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Create
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Discover;
