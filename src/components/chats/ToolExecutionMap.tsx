import React, { useState, useEffect } from "react";
import {
  Zap,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Globe,
  Cpu,
  Sparkles,
  MessageSquare,
  Clock,
  Database,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { MessageToolExecution } from "../../types";

interface ToolExecutionMapProps {
  toolExecution: MessageToolExecution;
  initialOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const ToolExecutionMap: React.FC<ToolExecutionMapProps> = ({
  toolExecution,
  initialOpen,
  isOpen: controlledIsOpen,
  onToggle,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(initialOpen ?? false);
  const [isFullView, setIsFullView] = useState(false);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleToggle = onToggle || (() => setInternalIsOpen((prev) => !prev));

  useEffect(() => {
    if (initialOpen !== undefined && controlledIsOpen === undefined) {
      setInternalIsOpen(initialOpen);
    }
  }, [initialOpen, controlledIsOpen]);

  const steps = toolExecution?.steps || [];
  if (steps.length === 0) return null;

  return (
    <div className="mt-2.5 select-none font-sans">
      {/* Compact Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-zinc-900 text-white hover:bg-black border border-zinc-700/60 shadow-md transition-all active:scale-95 cursor-pointer mt-2.5"
      >
        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
        <span>{toolExecution.summary || `${steps.length} Tool Executed`}</span>
        <span className="text-[10px] text-zinc-300 font-medium border-l border-zinc-700 pl-2">
          {isOpen ? "Collapse Pipeline Map" : "View Pipeline Map"}
        </span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
      </button>

      {/* Expandable Execution Map Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`mt-2 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 shadow-xl backdrop-blur-xl transition-all ${
              isFullView ? "p-5 ring-2 ring-amber-500/20" : "p-3.5"
            }`}
          >
            {/* Header with Maximize/Minimize Controls */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-semibold tracking-wide uppercase text-zinc-400">
                  AI Pipeline & Tool Execution Map
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsFullView((prev) => !prev)}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  title={isFullView ? "Minimize view" : "Maximize view"}
                >
                  {isFullView ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Visual Node Graph Flow */}
            <div className="space-y-0 relative">
              {/* Vertical Linking Pipeline Line */}
              <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500 via-amber-500 to-emerald-500 opacity-40 z-0" />

              {/* Node 1: User Input Query */}
              <div className="relative flex items-start gap-3 z-10 pb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-sm">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider">User Input Query</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-mono mt-0.5 truncate bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-zinc-800">
                    "{toolExecution.userPrompt}"
                  </p>
                </div>
              </div>

              {/* Node 2+: Tool Call Steps */}
              {steps.map((step, idx) => (
                <div key={step.id || idx} className="relative flex items-start gap-3 z-10 pb-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
                    {step.toolName.includes("youtube") ? (
                      <Globe className="w-4 h-4 text-red-400" />
                    ) : step.toolName.includes("instagram") ? (
                      <Globe className="w-4 h-4 text-pink-400" />
                    ) : (
                      <Database className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
                          Tool Call #{idx + 1}: {step.toolName}
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {step.status === "failed" ? "Fallback" : "200 OK"}
                        </span>
                      </div>
                      {step.durationMs !== undefined && (
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {step.durationMs}ms
                        </span>
                      )}
                    </div>

                    <div className="mt-1 bg-zinc-900/90 rounded-xl p-2.5 border border-zinc-800/90 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
                        <span>{step.title}</span>
                        {step.target && (
                          <span className="text-[11px] text-zinc-400 font-mono">({step.target})</span>
                        )}
                      </div>

                      {/* Payload Metrics Pills */}
                      {step.metrics && Object.keys(step.metrics).length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          {Object.entries(step.metrics).map(([k, v]) => (
                            <span
                              key={k}
                              className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60"
                            >
                              <span className="text-zinc-500 capitalize">{k}:</span> {String(v)}
                            </span>
                          ))}
                        </div>
                      )}

                      {step.outputSummary && (
                        <p className="text-[11px] text-zinc-400 font-mono truncate">
                          {step.outputSummary}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Node 3: AI Perception & Reasoning */}
              <div className="relative flex items-start gap-3 z-10 pb-4">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-sm">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
                    AI Context Perception
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Real-time metadata injected into character awareness prompt for natural human reaction.
                  </p>
                </div>
              </div>

              {/* Node 4: Character Response */}
              <div className="relative flex items-start gap-3 z-10">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                    Character Text Response
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Responded in authentic texting persona</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default ToolExecutionMap;
