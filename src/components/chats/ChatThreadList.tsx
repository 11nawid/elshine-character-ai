import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Plus, Loader2, Trash2, MessageSquare } from "lucide-react";
import { motion } from "motion/react";
import type { Character, Chat } from "../../types";
import { cn } from "../../lib/utils";
import { characterAvatar } from "../../lib/avatar";

interface ChatThreadListProps {
  chats: Chat[];
  characters: Record<string, Character>;
  activeChatId: string | null;
  loadingChats: boolean;
  availableCharacters: Character[];
  onSelectChat: (chat: Chat) => void;
  onStartNewChat: (characterId: string) => void;
  onDeleteChat: (chat: Chat) => void;
}

const ChatThreadList: React.FC<ChatThreadListProps> = ({
  chats,
  characters,
  activeChatId,
  loadingChats,
  availableCharacters,
  onSelectChat,
  onStartNewChat,
  onDeleteChat,
}) => {
  const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const newChatBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showNewChatDropdown) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current?.contains(target)) return;
      if (newChatBtnRef.current?.contains(target)) return;
      setShowNewChatDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowNewChatDropdown(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [showNewChatDropdown]);

  const toggleNewChatDropdown = () => {
    if (showNewChatDropdown) {
      setShowNewChatDropdown(false);
      return;
    }
    const rect = newChatBtnRef.current?.getBoundingClientRect();
    if (rect) {
      setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setShowNewChatDropdown(true);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <header className="px-6 py-8 border-b border-zinc-100 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-300">Messages</span>
            <h1 className="text-2xl font-bold tracking-tighter uppercase">Chats.</h1>
          </div>

          <div className="relative">
            <button
              ref={newChatBtnRef}
              onClick={toggleNewChatDropdown}
              aria-label="Start a new chat"
              className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
            >
              <Plus className="w-5 h-5" />
            </button>

            {showNewChatDropdown && dropdownPos && (
              createPortal(
                <div
                  className="fixed w-64 bg-white border border-zinc-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right"
                  style={{ top: dropdownPos.top, right: dropdownPos.right }}
                  ref={dropdownRef}
                >
                  <div className="p-3 border-b border-zinc-50">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block px-2">Start a new chat</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto no-scrollbar py-2">
                    {availableCharacters.map((char) => {
                      const existingChat = chats.find((c) => c.characterId === char.id);
                      return (
                        <button
                          key={char.id}
                          onClick={() => {
                            if (existingChat) {
                              onSelectChat(existingChat);
                            } else {
                              onStartNewChat(char.id);
                            }
                            setShowNewChatDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-zinc-50 transition-colors text-left"
                        >
                          <img src={characterAvatar(char)} alt={char.name} className="w-8 h-8 rounded-full object-cover grayscale opacity-80" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold uppercase tracking-tight truncate">{char.name}</h4>
                            <p className="text-[9px] text-zinc-400 truncate">{existingChat ? "Continue chat" : "Start new chat"}</p>
                          </div>
                        </button>
                      );
                    })}
                    {availableCharacters.length === 0 && (
                      <div className="px-5 py-4 text-center text-[10px] text-zinc-400 font-medium">
                        No characters found.
                      </div>
                    )}
                  </div>
                </div>,
                document.body
              )
            )}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-300" />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full bg-zinc-50 border border-zinc-100 rounded-full py-2.5 pl-10 pr-4 text-[9px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-black transition-all"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar py-4">
        {loadingChats ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-10">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-[8px] font-black uppercase tracking-widest">Loading Chats...</span>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-4">
            <div className="w-16 h-16 border-2 border-dashed border-zinc-200 rounded-[1.5rem] flex items-center justify-center text-zinc-300">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">No Chats Yet</h3>
              <p className="text-[10px] font-medium text-zinc-400 leading-relaxed">
                Tap <span className="font-black">+</span> above to start a conversation with a character.
              </p>
            </div>
          </div>
        ) : (
          chats.map((chat) => {
            const char = characters[chat.characterId];
            if (!char) return null;
            const isActive = activeChatId === chat.id;

            return (
              <div
                key={chat.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectChat(chat)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectChat(chat);
                  }
                }}
                className={cn(
                  "w-full px-10 py-8 text-left transition-all duration-500 group relative cursor-pointer select-none",
                  isActive ? "bg-zinc-50" : "hover:bg-zinc-50/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-chat-indicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-black"
                  />
                )}
                <div className="flex gap-6">
                  <div className="relative">
                    <img
                      src={characterAvatar(char)}
                      alt={char.name}
                      className={cn(
                        "w-12 h-12 rounded-[1.5rem] object-cover transition-all duration-500",
                        isActive ? "grayscale-0 shadow-2xl shadow-zinc-200" : "grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100"
                      )}
                    />
                    {chat.unread && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className={cn(
                        "text-xs font-black uppercase tracking-widest truncate",
                        isActive ? "text-black" : "text-zinc-400 group-hover:text-black"
                      )}>
                        {char.name}
                      </h4>
                      <span className="text-[8px] font-black text-zinc-300 tracking-tighter uppercase">
                        {new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className={cn(
                      "text-[10px] font-medium leading-relaxed truncate",
                      isActive ? "text-zinc-500" : "text-zinc-300"
                    )}>
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Delete chat with ${char.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-zinc-300 opacity-0 group-hover:opacity-100 hover:text-rose-600 hover:bg-rose-50 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatThreadList;