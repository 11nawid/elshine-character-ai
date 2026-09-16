import React, { useEffect, useRef } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import type { Character, Message } from "../../types";
import { cn } from "../../lib/utils";
import LocalAttachmentViewer from "./LocalAttachmentViewer";
import { cleanDisplayContent, isRefusalText } from "./chatUtils";
import { characterAvatar } from "../../lib/avatar";

interface ChatMessageListProps {
  messages: Message[];
  character: Character;
  isLoading: boolean;
  onRegenerate: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  character,
  isLoading,
  onRegenerate,
  onDeleteMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-6 pt-28 pb-8 space-y-4 no-scrollbar scroll-smooth">
      <AnimatePresence initial={false}>
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          const showAvatar = !isUser && (idx === messages.length - 1 || messages[idx + 1].role === "user");

          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={cn(
                "flex w-full",
                isUser ? "justify-end" : "justify-start"
              )}
            >
              {!isUser && (
                <div className="w-8 mr-2 flex flex-col justify-end">
                  {showAvatar ? (
                    <img src={characterAvatar(character)} className="w-7 h-7 rounded-full object-cover shadow-sm mb-1" />
                  ) : (
                    <div className="w-7 h-7" />
                  )}
                </div>
              )}

              <div className={cn(
                "group relative max-w-[75%] px-5 py-3 text-[15px] leading-relaxed rounded-[24px] shadow-sm",
                isUser
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-white text-zinc-900 border border-black/5"
              )}>
                {m.attachment && (
                  <div className="mb-3">
                    <LocalAttachmentViewer attachment={m.attachment} />
                  </div>
                )}
                <div className="prose-sm max-w-none text-current [&>p]:mb-2 [&>p:last-child]:mb-0 [&_a]:underline [&_strong]:font-bold [&_code]:font-mono [&_code]:text-xs [&_code]:bg-black/10 [&_code]:px-1 [&_code]:rounded">
                  <ReactMarkdown>
                    {!isUser && isRefusalText(m.text)
                      ? `Wait haha, my mind spaced out for a second! What did you say?`
                      : cleanDisplayContent(m.text)}
                  </ReactMarkdown>
                </div>

                <div className={cn(
                  "absolute -top-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-20",
                  isUser ? "-left-14" : "-right-16"
                )}>
                  {!isUser && m.id !== "temp" && (
                    <button
                      onClick={() => onRegenerate(m.id)}
                      disabled={isLoading}
                      className="p-1 rounded-full text-zinc-400 hover:text-black hover:bg-zinc-100 shadow-sm border border-zinc-200 bg-white transition-all active:scale-95"
                      title="Regenerate reply"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                  {m.id !== "initial" && m.id !== "temp" && (
                    <button
                      onClick={() => onDeleteMessage(m.id)}
                      className="p-1 rounded-full text-zinc-400 hover:text-red-500 hover:bg-zinc-100 shadow-sm border border-zinc-200 bg-white transition-all active:scale-95"
                      title="Delete message"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {isLoading && (
        <div className="flex w-full justify-start items-center">
          <div className="w-8 mr-2 flex flex-col justify-end">
            <img src={characterAvatar(character)} className="w-7 h-7 rounded-full object-cover shadow-sm mb-1" />
          </div>
          <div className="px-5 py-3.5 text-[14px] bg-white text-zinc-600 border border-black/5 rounded-[24px] shadow-sm flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500">{character.name} is typing</span>
            <span className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.3s]" />
            </span>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;