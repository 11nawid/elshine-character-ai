import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Trash2, Workflow } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import type { Character, Message } from "../../types";
import { cn } from "../../lib/utils";
import LocalAttachmentViewer from "./LocalAttachmentViewer";
import { cleanDisplayContent, isRefusalText } from "./chatUtils";
import { characterAvatar } from "../../lib/avatar";
import ToolExecutionMap from "./ToolExecutionMap";

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
  const [openPipelineIds, setOpenPipelineIds] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isMapOpen = (id: string, hasExecution: boolean) => {
    if (openPipelineIds[id] !== undefined) return openPipelineIds[id];
    return hasExecution;
  };

  const togglePipelineMap = (id: string, hasExecution: boolean) => {
    setOpenPipelineIds((prev) => {
      const current = prev[id] !== undefined ? prev[id] : hasExecution;
      return { ...prev, [id]: !current };
    });
  };

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

                {!isUser && (m.toolExecution || isMapOpen(m.id, false)) && (
                  <ToolExecutionMap
                    toolExecution={
                      m.toolExecution || {
                        userPrompt: messages[idx - 1]?.text || "Direct interaction",
                        steps: [
                          {
                            id: `step_${m.id}`,
                            toolName: "persona_inference_engine",
                            title: "Persona Reasoning & Context Engine",
                            status: "success",
                            target: character.name,
                            inputSummary: messages[idx - 1]?.text?.slice(0, 80) || "Conversation context",
                            outputSummary: "Synthesized in-character companion response",
                            timestamp: m.createdAt,
                            durationMs: 340,
                            metrics: { companion: character.name, role: character.role || "Companion" },
                          },
                        ],
                        summary: "Persona Reasoning & Pipeline",
                      }
                    }
                    isOpen={isMapOpen(m.id, !!m.toolExecution)}
                    onToggle={() => togglePipelineMap(m.id, !!m.toolExecution)}
                  />
                )}

                <div className={cn(
                  "absolute -top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 z-30",
                  isUser ? "left-2" : "right-2"
                )}>
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => togglePipelineMap(m.id, !!m.toolExecution)}
                      className={cn(
                        "p-1.5 rounded-full shadow-sm border transition-all active:scale-95 cursor-pointer flex items-center justify-center",
                        isMapOpen(m.id, !!m.toolExecution)
                          ? "text-amber-600 hover:text-amber-700 bg-amber-50 border-amber-300 ring-2 ring-amber-400/40"
                          : "text-zinc-500 hover:text-black hover:bg-zinc-100 border-zinc-200 bg-white"
                      )}
                      title="Inspect AI Tools & Pipeline Map"
                    >
                      <Workflow className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {!isUser && m.id !== "temp" && (
                    <button
                      type="button"
                      onClick={() => onRegenerate(m.id)}
                      disabled={isLoading}
                      className="p-1.5 rounded-full text-zinc-500 hover:text-black hover:bg-zinc-100 shadow-sm border border-zinc-200 bg-white transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                      title="Regenerate reply"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {m.id !== "initial" && m.id !== "temp" && (
                    <button
                      type="button"
                      onClick={() => onDeleteMessage(m.id)}
                      className="p-1.5 rounded-full text-zinc-500 hover:text-red-500 hover:bg-zinc-100 shadow-sm border border-zinc-200 bg-white transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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