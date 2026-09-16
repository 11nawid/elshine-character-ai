import React from "react";
import { X, Users, Sparkles, Trash2, ArrowRight } from "lucide-react";
import type { Character, Chat } from "../../types";
import { MemoryMap } from "../MemoryMap";
import { characterAvatar } from "../../lib/avatar";

interface ChatDetailsPanelProps {
  character: Character;
  chat: Chat;
  onClose: () => void;
  onResetChat: () => void;
  onAddMemory: (text: string) => void;
  onDeleteMemory: (memoryId: string) => void;
  onOpenMemoryModal: () => void;
}

const ChatDetailsPanel: React.FC<ChatDetailsPanelProps> = ({
  character,
  chat,
  onClose,
  onResetChat,
  onAddMemory,
  onDeleteMemory,
  onOpenMemoryModal,
}) => (
  <div className="flex flex-col h-full">
    <header className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
      <h3 className="text-xs font-black uppercase tracking-[0.3em]">Connection & Lore</h3>
      <button onClick={onClose} aria-label="Close details panel" className="p-2 text-zinc-300 hover:text-black transition-colors">
        <X className="w-4 h-4" />
      </button>
    </header>

    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
      {/* Character Identity */}
      <div className="space-y-4 text-center bg-white p-6 rounded-[2rem] border border-zinc-100">
        <div className="relative inline-block">
          <img
            src={characterAvatar(character)}
            className="w-28 h-28 rounded-full object-cover shadow-xl shadow-zinc-200 mx-auto"
          />
        </div>
        <div className="space-y-1">
          <h4 className="text-2xl font-bold tracking-tighter uppercase">{character.name}</h4>
          <p className="text-xs text-zinc-500 font-medium italic">"{character.description}"</p>
        </div>
      </div>

      {/* Familiarity & Connection Status */}
      <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 space-y-3">
        <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs uppercase tracking-wider">
          <Users className="w-4 h-4 text-black" />
          <span>Relationship Lore</span>
        </div>

        {character.knowsUserFromStart ? (
          <div className="space-y-2 text-xs">
            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 space-y-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">Dynamic</span>
              <p className="font-bold text-zinc-800">{character.userRelationship || "Close Longtime Friend"}</p>
            </div>

            {character.userNickname && (
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">What they call you</span>
                <p className="font-bold text-zinc-800">"{character.userNickname}"</p>
              </div>
            )}

            {character.sharedHistory && (
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">Shared Backstory</span>
                <p className="text-zinc-600 leading-relaxed font-medium">{character.sharedHistory}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-xs text-zinc-500 space-y-1">
            <p className="font-bold text-zinc-700">First Meeting</p>
            <p className="text-[11px] leading-relaxed">This character is getting to know you dynamically as you chat.</p>
          </div>
        )}
      </div>

      {/* Personality Vibe */}
      {character.traits && (
        <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 space-y-3">
          <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Human Vibe Profile</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
              <span className="text-zinc-400 uppercase font-black tracking-widest block text-[8px]">Sarcasm</span>
              <span className="font-bold text-zinc-800">{character.traits.sarcastic ?? 5}/10</span>
            </div>
            <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
              <span className="text-zinc-400 uppercase font-black tracking-widest block text-[8px]">Humor</span>
              <span className="font-bold text-zinc-800">{character.traits.funny ?? 7}/10</span>
            </div>
            <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
              <span className="text-zinc-400 uppercase font-black tracking-widest block text-[8px]">Warmth</span>
              <span className="font-bold text-zinc-800">{character.traits.friendly ?? 8}/10</span>
            </div>
            <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
              <span className="text-zinc-400 uppercase font-black tracking-widest block text-[8px]">Energy</span>
              <span className="font-bold text-zinc-800">{character.traits.energetic ?? 6}/10</span>
            </div>
          </div>
        </div>
      )}

      {/* Reset chat */}
      <button
        onClick={onResetChat}
        className="w-full flex items-center justify-between p-4 bg-red-50/50 border border-red-100 hover:border-red-500 hover:bg-red-50 text-red-600 rounded-[1.5rem] transition-all group"
      >
        <div className="flex items-center gap-3">
          <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" />
          <div className="text-left">
            <h6 className="text-[10px] font-black uppercase tracking-widest">Reset Chat</h6>
            <p className="text-[8px] font-bold text-red-400 uppercase">Clear message history</p>
          </div>
        </div>
        <ArrowRight className="w-3 h-3 text-red-300 group-hover:text-red-600" />
      </button>

      {/* Seamless Full-Width Neural Memory Constellation Map */}
      <div className="-mx-6 pt-2">
        <MemoryMap
          memories={chat.memories || []}
          character={character}
          onAddMemory={onAddMemory}
          onDeleteMemory={onDeleteMemory}
          isModal={false}
          onOpenModal={onOpenMemoryModal}
        />
      </div>
    </div>
  </div>
);

export default ChatDetailsPanel;