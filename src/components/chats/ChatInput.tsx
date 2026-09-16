import React, { useRef, useState } from "react";
import { Send, Image as ImageIcon, FileText, Paperclip, X } from "lucide-react";
import type { Character } from "../../types";
import { cn } from "../../lib/utils";

export type PendingAttachment = { file: File; type: "image" | "file" };

interface ChatInputProps {
  character: Character;
  isLoading: boolean;
  isUploading: boolean;
  onSend: (text: string, attachment: PendingAttachment | null) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ character, isLoading, isUploading, onSend }) => {
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachment) || isLoading || isUploading) return;
    onSend(inputText.trim(), attachment);
    setInputText("");
    setAttachment(null);
  };

  return (
    <footer className="px-6 py-6 bg-[#F8F8F8] z-10 relative space-y-3">
      {attachment && (
        <div className="flex items-center gap-3 p-3 bg-white border border-black/5 shadow-sm rounded-xl">
          {attachment.type === "image" ? <ImageIcon className="w-5 h-5 text-zinc-400" /> : <FileText className="w-5 h-5 text-zinc-400" />}
          <span className="text-sm font-medium flex-1 truncate text-black">{attachment.file.name}</span>
          <button onClick={() => setAttachment(null)} aria-label="Remove attachment" className="p-1 hover:text-red-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white border border-black/5 shadow-sm rounded-full p-1.5 pl-5 pr-3 flex items-center gap-3 transition-all focus-within:shadow-md focus-within:border-black/10"
      >
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) setAttachment({ file: e.target.files[0], type: "image" }); }}
        />
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) setAttachment({ file: e.target.files[0], type: "file" }); }}
        />
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={character.knowsUserFromStart ? `Message ${character.name}...` : `Say hi to ${character.name}...`}
          className="flex-1 bg-transparent border-none py-2.5 text-[15px] placeholder:text-zinc-400 outline-none"
        />
        <div className="flex items-center gap-3 text-zinc-400">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 hover:text-black transition-colors" title="Attach file">
            <Paperclip className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => imageInputRef.current?.click()} className="p-1.5 hover:text-black transition-colors" title="Attach image">
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            type="submit"
            disabled={isLoading || isUploading || (!inputText.trim() && !attachment)}
            className={cn(
              "p-2 rounded-full transition-all active:scale-95 flex items-center justify-center",
              (inputText.trim() || attachment) && !isLoading && !isUploading ? "bg-[#1a1a1a] text-white shadow-md" : "hidden"
            )}
          >
            <Send className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" />
          </button>
        </div>
      </form>
    </footer>
  );
};

export default ChatInput;