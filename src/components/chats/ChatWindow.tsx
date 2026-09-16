import React from "react";
import { ChevronLeft, MoreHorizontal, MessageSquare } from "lucide-react";
import type { Character, Message } from "../../types";
import ChatMessageList from "./ChatMessageList";
import ChatInput, { type PendingAttachment } from "./ChatInput";
import { characterAvatar } from "../../lib/avatar";

import { useNavigate } from "react-router-dom";

export type { PendingAttachment };

interface ChatWindowProps {
  character: Character | null;
  messages: Message[];
  isLoading: boolean;
  isUploading: boolean;
  onBack: () => void;
  onToggleDetails: () => void;
  onRegenerate: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onSend: (text: string, attachment: PendingAttachment | null) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  character,
  messages,
  isLoading,
  isUploading,
  onBack,
  onToggleDetails,
  onRegenerate,
  onDeleteMessage,
  onSend,
}) => {
  const navigate = useNavigate();

  if (!character) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 md:p-20 gap-6">
        <div className="w-20 h-20 rounded-3xl bg-white border border-zinc-200/80 shadow-md shadow-zinc-100 flex items-center justify-center text-zinc-400">
          <MessageSquare className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tighter uppercase text-zinc-800">No Chat Selected</h2>
          <p className="text-xs text-zinc-500 font-light leading-relaxed">
            Pick an existing conversation from the left sidebar, or explore public characters to begin a new journey.
          </p>
        </div>
        <button
          onClick={() => navigate('/explore')}
          className="px-6 py-2.5 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-md shadow-zinc-200 hover:scale-105 cursor-pointer"
        >
          Explore Companions
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F8F8F8] overflow-hidden relative">
      <header className="absolute top-0 left-0 right-0 z-10 bg-[#F8F8F8]/90 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-black/5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-zinc-500 hover:text-black transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <img src={characterAvatar(character)} className="w-10 h-10 rounded-full object-cover shadow-sm grayscale-0" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-zinc-900 leading-tight tracking-tight">{character.name}</h3>
                {character.knowsUserFromStart ? (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {character.userRelationship || "Familiar"}
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-zinc-200/60 text-zinc-600 px-2 py-0.5 rounded-full">
                    New Friend
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-[#34C759] rounded-full animate-pulse" />
                <span className="text-[12px] text-zinc-500 font-medium leading-none">
                  {isLoading ? "typing a reply..." : "Online now"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onToggleDetails}
          className="text-zinc-500 hover:text-black transition-colors p-2 hover:bg-black/5 rounded-full"
          title="Toggle details"
        >
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </header>

      <ChatMessageList
        messages={messages}
        character={character}
        isLoading={isLoading}
        onRegenerate={onRegenerate}
        onDeleteMessage={onDeleteMessage}
      />

      <ChatInput
        character={character}
        isLoading={isLoading}
        isUploading={isUploading}
        onSend={onSend}
      />
    </div>
  );
};

export default ChatWindow;