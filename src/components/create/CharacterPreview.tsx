import React from 'react';
import {
  ChevronLeft,
  MoreHorizontal,
  Mic,
  Image as ImageIcon,
  Send
} from 'lucide-react';

interface CharacterPreviewProps {
  avatarUrl: string;
  name: string;
  greeting: string;
  personality: string;
}

const CharacterPreview: React.FC<CharacterPreviewProps> = ({
  avatarUrl,
  name,
  greeting,
  personality
}) => {
  return (
    <div className="w-[500px] bg-[#F8F8F8] border-l border-zinc-100 flex-col hidden lg:flex relative">
      {/* Chat Header */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-[#F8F8F8]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button aria-label="Back" className="text-zinc-500 hover:text-black transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <img src={avatarUrl} className="w-10 h-10 rounded-full object-cover shadow-sm grayscale-0" />
            <div className="flex flex-col">
              <h3 className="text-[15px] font-semibold text-zinc-900 leading-tight tracking-tight truncate max-w-[200px]">
                {name || 'Your Character'}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-[#34C759] rounded-full" />
                <span className="text-[12px] text-zinc-500 font-medium leading-none">Online now</span>
              </div>
            </div>
          </div>
        </div>

        <button aria-label="More options" className="text-zinc-500 hover:text-black transition-colors">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 pt-28 pb-8 space-y-4 no-scrollbar scroll-smooth">

        {/* Character Message */}
        {(greeting || !personality) && (
          <div className="flex w-full justify-start">
            <div className="w-8 shrink-0 mr-2 flex flex-col justify-end">
              <img src={avatarUrl} className="w-7 h-7 rounded-full object-cover shadow-sm mb-1" />
            </div>
            <div className="max-w-[75%] px-5 py-3 text-[15px] leading-snug rounded-[24px] shadow-sm bg-white text-zinc-900 border border-black/5">
              <div className="prose-sm max-w-none text-current [&>p]:mb-2 [&>p:last-child]:mb-0">
                {greeting || "This is how I will say hello!"}
              </div>
            </div>
          </div>
        )}

        {/* User Message */}
        <div className="flex w-full justify-end">
          <div className="max-w-[75%] px-5 py-3 text-[15px] leading-snug rounded-[24px] shadow-sm bg-[#1a1a1a] text-white">
            <div className="prose-sm max-w-none text-current [&>p]:mb-2 [&>p:last-child]:mb-0">
              Hello! Tell me about yourself.
            </div>
          </div>
        </div>

        {/* Character Message */}
        <div className="flex w-full justify-start">
          <div className="w-8 shrink-0 mr-2 flex flex-col justify-end">
            <img src={avatarUrl} className="w-7 h-7 rounded-full object-cover shadow-sm mb-1" />
          </div>
          <div className="max-w-[75%] px-5 py-3 text-[15px] leading-snug rounded-[24px] shadow-sm bg-white text-zinc-900 border border-black/5">
            <div className="prose-sm max-w-none text-current [&>p]:mb-2 [&>p:last-child]:mb-0">
              {personality ? (
                `I'm manifested with ${personality.substring(0, 100)}...`
              ) : (
                "Describe my personality to see how I respond."
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Chat Input */}
      <footer className="px-6 py-6 shrink-0 bg-[#F8F8F8] z-10 relative">
        <div className="relative bg-white border border-black/5 shadow-sm rounded-full p-1.5 pl-5 pr-3 flex items-center gap-3 transition-all">
          <input
            type="text"
            placeholder="Chat simulation locked in preview..."
            disabled
            className="flex-1 bg-transparent border-none py-2.5 text-[15px] placeholder:text-zinc-400 outline-none cursor-not-allowed"
          />
          <div className="flex items-center gap-3 text-zinc-400 opacity-50 cursor-not-allowed">
            <button disabled type="button" className="p-1.5">
              <Mic className="w-5 h-5" />
            </button>
            <button disabled type="button" className="p-1.5">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button disabled className="hidden p-2 rounded-full transition-all active:scale-95 items-center justify-center">
              <Send className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CharacterPreview;