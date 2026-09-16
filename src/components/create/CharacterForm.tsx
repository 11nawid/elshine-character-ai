import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  X,
  Loader2,
  Sparkles,
  Globe,
  Lock,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Character, CharacterTraits } from '../../types';
import { cn } from '../../lib/utils';
import { ApiError } from '../../lib/api';
import { defaultCharacterData, DEFAULT_AVATAR } from './presets';
import CharacterPreview from './CharacterPreview';
import { characterAvatar } from '../../lib/avatar';
import { compressImageFile } from '../chats/chatUtils';

interface CharacterFormProps {
  initialData: Partial<Character>;
  editing?: boolean;
  avatarSeed?: string;
  onCancel?: () => void;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
}

const traitLabels: (keyof CharacterTraits)[] = [
  'friendly', 'shy', 'confident', 'funny', 'serious', 'romantic', 'sarcastic', 'energetic'
];

const CharacterForm: React.FC<CharacterFormProps> = ({
  initialData,
  editing,
  avatarSeed,
  onCancel,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Character>>(
    initialData && Object.keys(initialData).length ? initialData : defaultCharacterData()
  );
  const [avatarPreview, setAvatarPreview] = useState(
    avatarSeed || (initialData?.name ? characterAvatar(initialData) : DEFAULT_AVATAR)
  );
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const preview = await compressImageFile(file, 800, 0.82);
      setAvatarPreview(preview);
    } catch (err) {
      console.error('Failed to read avatar image:', err);
    } finally {
      e.target.value = '';
    }
  };

  const handleTraitChange = (trait: keyof CharacterTraits, value: number) => {
    setFormData(prev => ({
      ...prev,
      traits: { ...prev.traits!, [trait]: value }
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.description;
      case 2:
        return !!formData.personality;
      case 3:
        return true;
      case 4:
        return true; // Greeting is now optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      alert("Please complete required fields (*)");
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== totalSteps) return;

    setLoading(true);
    try {
      const knowsUser = !!formData.knowsUserFromStart;
      const payload: Record<string, unknown> = {
        ...formData,
        knowsUserFromStart: knowsUser,
        userRelationship: knowsUser ? (formData.userRelationship || '') : '',
        sharedHistory: knowsUser ? (formData.sharedHistory || '') : '',
        userNickname: knowsUser ? (formData.userNickname || '') : '',
        avatarUrl: avatarPreview,
        tags: formData.tags?.length ? formData.tags : ['Neural Proxy'],
        greeting: formData.greeting || ''
      };
      await onSubmit(payload);
    } catch (err: any) {
      console.error('Failed to save character:', err);
      alert(err instanceof ApiError ? err.message : 'Failed to save character. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-white w-full">
      {/* Form Column */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 border-r border-zinc-100 relative h-full">
        <header className="px-4 sm:px-8 md:px-12 pt-6 md:pt-8 pb-4 shrink-0 z-10 bg-white border-b border-zinc-100">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                {editing ? 'Update Details' : 'Creation Lab'}
              </span>
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4].map(s => (
                    <div key={s} className={cn("h-1 rounded-full transition-all duration-500", s <= currentStep ? "w-6 sm:w-8 bg-black" : "w-3 sm:w-4 bg-zinc-200")} />
                  ))}
                </div>
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white border border-zinc-200 text-zinc-400 hover:bg-black hover:text-white hover:border-black transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter uppercase leading-tight mb-1">
              {currentStep === 1 && "Basic Info"}
              {currentStep === 2 && "Personality"}
              {currentStep === 3 && "Lore & Style"}
              {currentStep === 4 && "Final Details"}
            </h1>
            <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Step {currentStep} of {totalSteps}
            </p>
          </motion.div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar relative min-h-0">
          <form onSubmit={handleSubmit} className="px-4 sm:px-8 md:px-12 py-6 max-w-2xl w-full mx-auto flex flex-col">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.section
                  key="step-1"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-10 flex-1"
                >
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Avatar Image</label>
                    <div className="flex items-center gap-10">
                      <div className="relative group shrink-0">
                        <img src={avatarPreview} alt="Preview" className="w-32 h-32 rounded-3xl object-cover grayscale group-hover:grayscale-0 transition-all duration-700 shadow-2xl" />
                        <button type="button" className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                          <ImageIcon className="w-6 h-6" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => avatarFileInputRef.current?.click()}
                            className="px-6 py-3 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
                          >
                            Upload Image
                          </button>
                          <button
                            type="button"
                            onClick={() => setAvatarPreview(
                              initialData?.name ? characterAvatar(initialData) : DEFAULT_AVATAR
                            )}
                            className="px-6 py-3 text-zinc-500 border border-zinc-200 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-50 transition-all"
                          >
                            Remove
                          </button>
                          <input
                            ref={avatarFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarFile}
                            className="hidden"
                          />
                        </div>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.1em]">Recommended: High-quality square image.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Character Name *</label>
                      <input
                        type="text" name="name" placeholder="e.g. Luna"
                        value={formData.name} onChange={handleInputChange}
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-zinc-100 focus:bg-white outline-none transition-all font-medium text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Short Description *</label>
                      <input
                        type="text" name="description" placeholder="A friendly companion..."
                        value={formData.description} onChange={handleInputChange}
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-zinc-100 focus:bg-white outline-none transition-all font-medium text-sm"
                        required
                      />
                    </div>
                  </div>
                </motion.section>
              )}

              {currentStep === 2 && (
                <motion.section
                  key="step-2"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-12 flex-1"
                >
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Main Personality *</label>
                    <textarea
                      name="personality" rows={4} placeholder="How should your character act? What are their traits?"
                      value={formData.personality} onChange={handleInputChange}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-3xl px-8 py-6 focus:ring-4 focus:ring-zinc-100 focus:bg-white outline-none transition-all font-medium text-sm resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {traitLabels.map(trait => (
                      <div key={trait} className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{trait}</label>
                          <span className="text-[9px] font-black text-black">{formData.traits![trait]} / 10</span>
                        </div>
                        <input
                          type="range" min="1" max="10"
                          value={formData.traits![trait]}
                          onChange={(e) => handleTraitChange(trait, parseInt(e.target.value))}
                          className="w-full appearance-none h-1 bg-zinc-100 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {currentStep === 3 && (
                <motion.section
                  key="step-3"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-10 flex-1"
                >
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Backstory / Lore (Optional)</label>
                    <textarea
                      name="backstory" rows={6} placeholder="Where do they come from? What is their history?"
                      value={formData.backstory} onChange={handleInputChange}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-3xl px-8 py-6 focus:ring-4 focus:ring-zinc-100 focus:bg-white outline-none transition-all font-medium text-sm resize-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Speaking Style (Optional)</label>
                    <textarea
                      name="speakingStyle" rows={3} placeholder="Do they use slang? Speak formally? Any catchphrases?"
                      value={formData.speakingStyle} onChange={handleInputChange}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-3xl px-8 py-6 focus:ring-4 focus:ring-zinc-100 focus:bg-white outline-none transition-all font-medium text-sm resize-none"
                    />
                  </div>
                </motion.section>
              )}

              {currentStep === 4 && (
                <motion.section
                  key="step-4"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-10 flex-1"
                >
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">First Message / Greeting (Optional)</label>
                    <textarea
                      name="greeting" rows={3} placeholder="How will they start the conversation? Leave blank to start the chat yourself."
                      value={formData.greeting} onChange={handleInputChange}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-3xl px-8 py-6 focus:ring-4 focus:ring-zinc-100 focus:bg-white outline-none transition-all font-medium text-sm resize-none"
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      {/* Robust Interactive Switch Card */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setFormData(prev => ({ ...prev, knowsUserFromStart: !prev.knowsUserFromStart }))}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFormData(prev => ({ ...prev, knowsUserFromStart: !prev.knowsUserFromStart })); }}}
                        className={cn(
                          "p-5 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-4",
                          formData.knowsUserFromStart
                            ? "bg-black text-white border-black shadow-lg"
                            : "bg-zinc-50 border-zinc-200 text-zinc-800 hover:border-zinc-300"
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider">They know me already</span>
                            {formData.knowsUserFromStart ? (
                              <span className="text-[9px] font-bold bg-white/20 text-emerald-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Active
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                New Meeting
                              </span>
                            )}
                          </div>
                          <p className={cn("text-[11px] leading-relaxed", formData.knowsUserFromStart ? "text-zinc-300" : "text-zinc-500")}>
                            If active, this companion knows your profile, nickname, role, location, website/socials, and shared history from your settings.
                          </p>
                        </div>

                        {/* Switch UI */}
                        <div className={cn(
                          "w-12 h-7 rounded-full p-1 transition-colors shrink-0 flex items-center",
                          formData.knowsUserFromStart ? "bg-emerald-500 justify-end" : "bg-zinc-300 justify-start"
                        )}>
                          <motion.div
                            layout
                            className="w-5 h-5 rounded-full bg-white shadow-md"
                          />
                        </div>
                      </div>
                    </div>

                    {formData.knowsUserFromStart && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-6 bg-zinc-50 border border-zinc-200 rounded-3xl space-y-6"
                      >
                        <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Relationship to You</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {['Best Friend', 'Childhood Friend', 'Roommate', 'Partner / Crush', 'Mentor / Colleague', 'Rival'].map(rel => (
                              <button
                                key={rel}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, userRelationship: rel }))}
                                className={cn(
                                  "px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all",
                                  formData.userRelationship === rel
                                    ? "bg-black text-white"
                                    : "bg-white text-zinc-600 border border-zinc-200 hover:border-black"
                                )}
                              >
                                {rel}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            name="userRelationship"
                            placeholder="Or specify custom relationship (e.g. Twin brother, Lab partner)..."
                            value={formData.userRelationship || ''}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-3 text-xs font-medium focus:ring-2 focus:ring-black outline-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Shared History / Shared Memories (Optional)</label>
                          <textarea
                            name="sharedHistory"
                            rows={2}
                            placeholder="e.g. We met 4 years ago in college, we have a running joke about spilled coffee, and we text almost every day..."
                            value={formData.sharedHistory || ''}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-3 text-xs font-medium focus:ring-2 focus:ring-black outline-none resize-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">What they call you (Nickname / Pet name)</label>
                          <input
                            type="text"
                            name="userNickname"
                            placeholder="e.g. Nick, Chief, Bestie (leave blank for your default name)"
                            value={formData.userNickname || ''}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-3 text-xs font-medium focus:ring-2 focus:ring-black outline-none"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Tags (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="Fantasy, Romance, Helper"
                      value={formData.tags?.join(', ') || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-zinc-100 focus:bg-white outline-none transition-all font-medium text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-4">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block mb-6">Visibility</label>
                      <div className="flex gap-4">
                        {[
                          { id: 'public', icon: Globe, label: 'Public' },
                          { id: 'unlisted', icon: LinkIcon, label: 'Unlisted' },
                          { id: 'private', icon: Lock, label: 'Private' }
                        ].map(v => (
                          <button
                            key={v.id} type="button"
                            onClick={() => setFormData(prev => ({ ...prev, visibility: v.id as any }))}
                            className={cn(
                              "flex-1 p-4 rounded-[2rem] border transition-all duration-300 flex flex-col items-center gap-2",
                              formData.visibility === v.id
                                ? "bg-black border-black text-white"
                                : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-zinc-300"
                            )}
                          >
                            <v.icon className="w-4 h-4" />
                            <span className="text-[8px] font-black uppercase tracking-widest">{v.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block mb-6">Rating</label>
                      <div className="flex gap-4">
                        {[
                          { id: 'general', label: 'SFW' },
                          { id: 'mature', label: 'NSFW' }
                        ].map(r => (
                          <button
                            key={r.id} type="button"
                            onClick={() => setFormData(prev => ({ ...prev, rating: r.id as any }))}
                            className={cn(
                              "flex-1 py-4 rounded-[2rem] border transition-all duration-300 flex items-center justify-center gap-2",
                              formData.rating === r.id
                                ? "bg-black border-black text-white"
                                : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-zinc-300"
                            )}
                          >
                            <span className="text-[9px] font-black uppercase tracking-widest">{r.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Responsive Bottom Navigation */}
        <div className="shrink-0 p-4 sm:p-6 bg-white/95 backdrop-blur-sm border-t border-zinc-100 flex items-center gap-3 sm:gap-4 z-20">
          {currentStep > 1 && (
            <button
              type="button" onClick={handleBack}
              className="px-5 sm:px-8 py-3.5 sm:py-4 bg-zinc-100 text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all border border-zinc-200"
            >
              Back
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button" onClick={handleNext}
              className="flex-1 bg-black text-white py-3.5 sm:py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 shadow-lg shadow-zinc-200 transition-all flex items-center justify-center gap-2"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button" onClick={handleSubmit} disabled={loading}
              className="flex-1 bg-black text-white py-3.5 sm:py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 shadow-lg shadow-zinc-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <>{editing ? 'Update Details' : 'Initialize Character'} <Sparkles className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Preview Column */}
      <CharacterPreview
        avatarUrl={avatarPreview}
        name={formData.name || ''}
        greeting={formData.greeting || ''}
        personality={formData.personality || ''}
      />
    </div>
  );
};

export default CharacterForm;