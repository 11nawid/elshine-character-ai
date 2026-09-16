import React, { useState } from 'react';
import { Sparkles, Users, X, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Character } from '../types';
import { createCharacter, updateCharacter } from '../lib/api';
import { characterAvatar } from '../lib/avatar';
import { PRESETS, DEFAULT_AVATAR, defaultCharacterData } from './create/presets';
import CharacterForm from './create/CharacterForm';
import { useNavigate, useLocation } from 'react-router-dom';

interface CreateProps {
  onCharacterCreated?: (character: Character) => void;
  editingCharacter?: Character | null;
  onCancel?: () => void;
}

interface FormInit {
  data: Partial<Character>;
  avatarSeed?: string;
}

const Create: React.FC<CreateProps> = ({ onCharacterCreated, editingCharacter, onCancel }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const effectiveEditingCharacter = editingCharacter ?? (location.state as any)?.character ?? null;
  const handleCancel = onCancel || (() => navigate('/home'));

  const [mode, setMode] = useState<'selection' | 'create'>(effectiveEditingCharacter ? 'create' : 'selection');
  const [showPresets, setShowPresets] = useState(false);
  const [formInit, setFormInit] = useState<FormInit | null>(
    effectiveEditingCharacter
      ? { data: { ...effectiveEditingCharacter }, avatarSeed: characterAvatar(effectiveEditingCharacter) }
      : null
  );
  const [formKey, setFormKey] = useState(0);

  const startFromScratch = () => {
    setFormInit({ data: defaultCharacterData(), avatarSeed: DEFAULT_AVATAR });
    setFormKey(k => k + 1);
    setMode('create');
  };

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setFormInit({
      data: {
        ...defaultCharacterData(),
        name: preset.name,
        description: preset.description,
        personality: preset.personality,
        backstory: preset.backstory,
        greeting: preset.greeting,
        tags: preset.tags,
        traits: preset.traits,
        visibility: 'public',
        rating: 'general'
      },
      avatarSeed: preset.avatarUrl
    });
    setFormKey(k => k + 1);
    setMode('create');
  };

  const handleSubmit = async (payload: Record<string, unknown>) => {
    if (effectiveEditingCharacter) {
      const { character } = await updateCharacter(effectiveEditingCharacter.id, payload);
      if (onCharacterCreated) {
        onCharacterCreated(character);
      } else {
        navigate(`/chats/${character.id}`);
      }
    } else {
      const { character } = await createCharacter(payload);
      if (onCharacterCreated) {
        onCharacterCreated(character);
      } else {
        navigate(`/chats/${character.id}`);
      }
    }
  };

  if (mode === 'selection') {
    return (
      <div className="flex h-full overflow-hidden bg-white items-center justify-center p-8 relative">
        <button
          onClick={handleCancel}
          className="absolute top-8 right-8 w-12 h-12 bg-white border border-zinc-200 text-zinc-400 rounded-full flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all z-50"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="max-w-4xl w-full">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold tracking-tighter uppercase mb-4">New Character</h1>
            <p className="text-zinc-500 font-medium uppercase tracking-widest text-[10px]">How would you like to begin?</p>
          </div>

          {!showPresets ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button
                onClick={startFromScratch}
                className="group p-10 border border-zinc-200 rounded-[3rem] hover:border-black transition-all text-left flex flex-col gap-6"
              >
                <div className="w-16 h-16 bg-zinc-100 group-hover:bg-black group-hover:text-white rounded-3xl flex items-center justify-center transition-all duration-300">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">Create From Scratch</h3>
                  <p className="text-zinc-500 text-sm font-medium">Build a neural proxy from the ground up. Define their personality, backstory, and visual identity.</p>
                </div>
              </button>

              <button
                onClick={() => setShowPresets(true)}
                className="group p-10 border border-zinc-200 rounded-[3rem] hover:border-black transition-all text-left flex flex-col gap-6"
              >
                <div className="w-16 h-16 bg-zinc-100 group-hover:bg-black group-hover:text-white rounded-3xl flex items-center justify-center transition-all duration-300">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">Use a Preset</h3>
                  <p className="text-zinc-500 text-sm font-medium">Start with one of our pre-configured archetypes and customize them to fit your needs.</p>
                </div>
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => setShowPresets(false)}
                  className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-zinc-500 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Back
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Select a Base Archetype</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[50vh] overflow-y-auto no-scrollbar pb-10">
                {PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="p-6 border border-zinc-200 rounded-3xl hover:border-black hover:shadow-xl hover:shadow-zinc-100 transition-all text-left flex flex-col gap-4 group"
                  >
                    <div className="flex items-center gap-4">
                      <img src={preset.avatarUrl} alt={preset.name} className="w-12 h-12 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      <div>
                        <h4 className="font-bold uppercase tracking-tight truncate max-w-[150px]">{preset.name}</h4>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 truncate max-w-[150px]">{preset.tags.slice(0, 2).join(' • ')}</p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium line-clamp-2">{preset.description}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <CharacterForm
      key={formKey}
      initialData={formInit?.data || defaultCharacterData()}
      avatarSeed={formInit?.avatarSeed}
      editing={!!effectiveEditingCharacter}
      onCancel={() => {
        if (effectiveEditingCharacter) {
          handleCancel();
        } else {
          setMode('selection');
        }
      }}
      onSubmit={handleSubmit}
    />
  );
};

export default Create;