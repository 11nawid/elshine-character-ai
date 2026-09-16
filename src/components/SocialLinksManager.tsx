import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Globe, 
  ExternalLink, 
  Link2, 
  Sparkles, 
  ChevronDown, 
  Check, 
  X,
  Layers,
  HelpCircle
} from 'lucide-react';
import { UserSocials, CustomSocialLink } from '../types';
import { SOCIAL_PLATFORMS, SocialPlatformConfig, getSocialIcon } from '../lib/socialPlatforms';
import { cn } from '../lib/utils';

interface SocialLinksManagerProps {
  socials: UserSocials;
  onChange: (updatedSocials: UserSocials) => void;
}

export const SocialLinksManager: React.FC<SocialLinksManagerProps> = ({ socials, onChange }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'custom'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'core' | 'community' | 'creative' | 'dev-work'>('all');
  
  // Custom link creation form state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customPlatform, setCustomPlatform] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customError, setCustomError] = useState('');

  // Count active links
  const activePredefinedCount = SOCIAL_PLATFORMS.filter(p => !!socials[p.key as keyof UserSocials]).length;
  const activeCustomCount = socials.customLinks?.length || 0;
  const totalActiveLinks = activePredefinedCount + activeCustomCount;

  const handlePredefinedChange = (key: keyof Omit<UserSocials, 'customLinks'>, value: string) => {
    onChange({
      ...socials,
      [key]: value
    });
  };

  const handleAddCustomLink = (e: React.FormEvent) => {
    e.preventDefault();
    const urlTrimmed = customUrl.trim();
    if (!urlTrimmed) {
      setCustomError('Please enter a valid URL or link.');
      return;
    }

    const platformTrimmed = customPlatform.trim() || 'Custom';
    const titleTrimmed = customTitle.trim() || platformTrimmed;

    const newLink: CustomSocialLink = {
      id: 'cust_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      platform: platformTrimmed,
      title: titleTrimmed,
      url: urlTrimmed.startsWith('http://') || urlTrimmed.startsWith('https://') 
        ? urlTrimmed 
        : `https://${urlTrimmed}`
    };

    const updatedCustoms = [...(socials.customLinks || []), newLink];
    onChange({
      ...socials,
      customLinks: updatedCustoms
    });

    // Reset modal
    setCustomTitle('');
    setCustomPlatform('');
    setCustomUrl('');
    setCustomError('');
    setShowCustomModal(false);
  };

  const handleRemoveCustomLink = (id: string) => {
    const updatedCustoms = (socials.customLinks || []).filter(item => item.id !== id);
    onChange({
      ...socials,
      customLinks: updatedCustoms
    });
  };

  const handleEditCustomLink = (id: string, field: 'title' | 'url' | 'platform', val: string) => {
    const updatedCustoms = (socials.customLinks || []).map(item => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    });
    onChange({
      ...socials,
      customLinks: updatedCustoms
    });
  };

  const filteredPlatforms = SOCIAL_PLATFORMS.filter(p => {
    if (filterCategory === 'all') return true;
    return p.category === filterCategory;
  });

  return (
    <div className="p-8 md:p-10 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-8">
      {/* Header with Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-black" />
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900">
              Website & Online Presence
            </h3>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-zinc-200 text-zinc-800 rounded-full">
              {totalActiveLinks} Active {totalActiveLinks === 1 ? 'Link' : 'Links'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-medium mt-1">
            Connect any social network, personal portfolio, storefront, blog, podcast, or custom website. Companions with familiarity enabled will be fully aware of your online presence.
          </p>
        </div>

        {/* Add Custom Link Button */}
        <button
          type="button"
          onClick={() => setShowCustomModal(true)}
          className="bg-black text-white hover:bg-zinc-800 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Custom Link / Network
        </button>
      </div>

      {/* Category Pills & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-200/60">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
              filterCategory === 'all' 
                ? "bg-black text-white" 
                : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
            )}
          >
            All Networks ({SOCIAL_PLATFORMS.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('core')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
              filterCategory === 'core' 
                ? "bg-black text-white" 
                : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
            )}
          >
            Core & Socials
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('dev-work')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
              filterCategory === 'dev-work' 
                ? "bg-black text-white" 
                : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
            )}
          >
            Work & Dev
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('community')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
              filterCategory === 'community' 
                ? "bg-black text-white" 
                : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
            )}
          >
            Chat & Community
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('creative')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
              filterCategory === 'creative' 
                ? "bg-black text-white" 
                : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
            )}
          >
            Gaming & Creative
          </button>
        </div>

        {activeCustomCount > 0 && (
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-lg">
            +{activeCustomCount} Custom {activeCustomCount === 1 ? 'Link' : 'Links'} Added
          </span>
        )}
      </div>

      {/* Grid of Predefined Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlatforms.map((platform) => {
          const Icon = platform.icon;
          const val = (socials[platform.key as keyof UserSocials] as string) || '';
          const hasValue = !!val.trim();

          return (
            <div 
              key={platform.key}
              className={cn(
                "p-4 rounded-2xl border transition-all space-y-2",
                hasValue 
                  ? "bg-white border-black/30 shadow-sm ring-1 ring-black/5" 
                  : "bg-white/60 border-zinc-200/80 hover:bg-white hover:border-zinc-300"
              )}
            >
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                  <Icon className={cn("w-3.5 h-3.5", hasValue ? "text-black" : "text-zinc-400")} />
                  {platform.label}
                </label>
                {hasValue && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" title="Link active" />
                )}
              </div>

              <div className="relative flex items-center">
                <input 
                  type="text"
                  placeholder={platform.placeholder}
                  value={val}
                  onChange={(e) => handlePredefinedChange(platform.key, e.target.value)}
                  className="w-full bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white border border-zinc-200 focus:border-black rounded-xl px-3.5 py-2.5 text-xs font-mono text-black outline-none transition-colors pr-8"
                />
                {hasValue && (
                  <button
                    type="button"
                    onClick={() => handlePredefinedChange(platform.key, '')}
                    className="absolute right-2.5 text-zinc-300 hover:text-rose-600 transition-colors p-1"
                    title="Clear link"
                    aria-label={`Clear ${platform.label} link`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Links Section */}
      <div className="pt-6 border-t border-zinc-200/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-black" />
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900">
              Custom & Other Links ({socials.customLinks?.length || 0})
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 hover:text-black flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Another
          </button>
        </div>

        {socials.customLinks && socials.customLinks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socials.customLinks.map((custom) => {
              const CustomIcon = getSocialIcon(custom.platform || custom.title || 'link');

              return (
                <div 
                  key={custom.id}
                  className="p-4 bg-white border border-zinc-200 rounded-2xl flex items-start gap-4 shadow-sm group hover:border-black transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800 shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                    <CustomIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <input 
                        type="text"
                        value={custom.title || ''}
                        placeholder="Link Label (e.g. My Bandcamp, Etsy Store)"
                        onChange={(e) => handleEditCustomLink(custom.id, 'title', e.target.value)}
                        className="text-xs font-bold uppercase tracking-wider text-black bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-black outline-none w-full"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomLink(custom.id)}
                        className="text-zinc-400 hover:text-rose-600 p-1 transition-colors"
                        title="Delete custom link"
                        aria-label="Delete custom link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="url"
                        value={custom.url || ''}
                        placeholder="https://..."
                        onChange={(e) => handleEditCustomLink(custom.id, 'url', e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-800 outline-none focus:border-black"
                      />
                      <a 
                        href={custom.url.startsWith('http') ? custom.url : `https://${custom.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-zinc-400 hover:text-black shrink-0"
                        title="Open Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 bg-white border border-dashed border-zinc-200 rounded-2xl text-center space-y-2">
            <p className="text-xs font-medium text-zinc-400">
              No custom links added yet. You can add Patreon, Bandcamp, Steam, Spotify, Substack, Etsy, itch.io, personal blogs, or any URL.
            </p>
            <button
              type="button"
              onClick={() => setShowCustomModal(true)}
              className="text-xs font-bold uppercase tracking-wider text-black hover:underline"
            >
              + Click to add your first custom link
            </button>
          </div>
        )}
      </div>

      {/* Modal / Dialog to Add Custom Link */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-zinc-100 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 block">Create Custom Social</span>
                <h3 className="text-xl font-bold uppercase tracking-tight">Add Link or Profile</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowCustomModal(false)}
                aria-label="Close add custom link dialog"
                className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {customError && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl">
                {customError}
              </p>
            )}

            <form onSubmit={handleAddCustomLink} className="space-y-4">
              {/* Quick suggestions */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                  Quick Suggestion / Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Personal Portfolio', 'Blog', 'Substack', 'Twitch', 'Patreon', 'Spotify', 'TikTok', 'Store / Shop', 'Bandcamp', 'itch.io', 'Letterboxd'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setCustomTitle(type);
                        setCustomPlatform(type);
                      }}
                      className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-[10px] font-bold text-zinc-700 transition-colors"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title / Label */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block">
                  Link Title / Platform Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text"
                  placeholder="e.g. My Bandcamp / Second Portfolio / Discord Server"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-black"
                  required
                />
              </div>

              {/* URL */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block">
                  URL / Web Address <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text"
                  placeholder="https://..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-black"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default SocialLinksManager;
