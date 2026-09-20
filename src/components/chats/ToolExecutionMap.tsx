import React, { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap,
  Sparkles,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { MessageToolExecution } from "../../types";
import type { PipelineNode } from "./toolexecution/types";
import { NeuralCanvas } from "./toolexecution/NeuralCanvas";

interface ToolExecutionMapProps {
  toolExecution: MessageToolExecution;
  initialOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const ToolExecutionMap: React.FC<ToolExecutionMapProps> = ({
  toolExecution,
  initialOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(initialOpen);
  const [isModal, setIsModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleToggle = onToggle || (() => setInternalIsOpen((prev) => !prev));

  const steps = toolExecution?.steps || [];

  // Generate clean spatial positions for Query -> Tool(s) -> Response
  const initialNodes = useMemo<PipelineNode[]>(() => {
    if (steps.length === 0) return [];
    const w = isModal ? 800 : 540;
    const h = isModal ? 520 : 340;
    const centerY = h / 2;

    const list: PipelineNode[] = [];

    // 1. User Query Node
    list.push({
      id: "node_query",
      type: "query",
      label: "User Query",
      sublabel: toolExecution.userPrompt?.slice(0, 45) || "Social audit request",
      status: "success",
      x: w * 0.18,
      y: centerY,
      vx: 0,
      vy: 0,
    });

    // 2. Real Scraped Tool Execution Nodes
    const toolCount = steps.length;
    steps.forEach((step, idx) => {
      const isYT = step.toolName.includes("youtube") || step.title.toLowerCase().includes("youtube");
      const isIG = step.toolName.includes("instagram") || step.title.toLowerCase().includes("instagram");
      const platform = isYT ? "youtube" : isIG ? "instagram" : undefined;

      const spacing = h / (toolCount + 1);
      const nodeY = toolCount === 1 ? centerY : spacing * (idx + 1);

      list.push({
        id: step.id,
        type: "tool",
        label: isYT ? "YouTube Scraper" : isIG ? "Instagram Scraper" : step.title,
        sublabel: step.outputSummary || step.inputSummary || "Live scraped telemetry",
        platform,
        status: step.status === "failed" ? "failed" : "success",
        target: step.target,
        metrics: step.metrics,
        durationMs: step.durationMs,
        x: w * 0.52,
        y: nodeY,
        vx: 0,
        vy: 0,
      });
    });

    // 3. Companion Response Node
    list.push({
      id: "node_response",
      type: "response",
      label: "AI Synthesis",
      sublabel: "Personalized companion response",
      status: "success",
      x: w * 0.84,
      y: centerY,
      vx: 0,
      vy: 0,
    });

    return list;
  }, [steps, toolExecution.userPrompt, isModal]);

  const [nodes, setNodes] = useState<PipelineNode[]>(initialNodes);

  // Sync when initialNodes changes
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNodeId(null);
    setNodes(initialNodes);
  }, [initialNodes]);

  if (steps.length === 0) return null;

  const content = (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-zinc-200/90 shadow-xl bg-[#fafafa] select-none ${
        isModal ? "h-[85vh] max-h-[720px]" : "h-[360px] mt-3"
      }`}
    >
      {/* Top Floating Glass Header matching MemoryMap */}
      <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto select-none">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-zinc-200/80 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
            Synaptic Tool Pipeline
          </span>
          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
            {steps.length} {steps.length === 1 ? "Synapse" : "Synapses"} Live
          </span>
        </div>

        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-full border border-zinc-200/80 shadow-xs">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2, Number((z * 1.15).toFixed(2))))}
            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.5, Number((z / 1.15).toFixed(2))))}
            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors"
            title="Reset Graph Layout"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsModal((m) => !m)}
            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors"
            title={isModal ? "Exit Fullscreen" : "Expand Fullscreen"}
          >
            {isModal ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          {isModal && (
            <button
              type="button"
              onClick={() => setIsModal(false)}
              className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors ml-0.5"
              title="Close Modal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Neural Canvas */}
      <NeuralCanvas
        nodes={nodes}
        onNodesChange={setNodes}
        width={isModal ? 800 : 540}
        height={isModal ? 520 : 340}
        selectedNodeId={selectedNodeId}
        onSelectNode={setSelectedNodeId}
        zoom={zoom}
        pan={pan}
        onPanChange={setPan}
      />
    </div>
  );

  return (
    <div className="mt-2.5 select-none font-sans">
      {/* Minimal Trigger Pill matching MemoryMap */}
      <button
        type="button"
        onClick={handleToggle}
        className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-white text-zinc-900 hover:bg-zinc-50 border border-zinc-200/90 shadow-sm transition-all active:scale-95 cursor-pointer"
      >
        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span className="font-bold">{steps.length} Tool Synapse{steps.length > 1 ? "s" : ""}</span>
        <span className="text-[10px] text-zinc-400 font-medium border-l border-zinc-200 pl-2">
          {isOpen ? "Collapse Synaptic Map" : "Inspect Neural Pipeline"}
        </span>
        {isOpen ? <ChevronUp className="w-3 h-3 text-zinc-400" /> : <ChevronDown className="w-3 h-3 text-zinc-400" />}
      </button>

      {/* Expandable Inline Map */}
      <AnimatePresence>
        {isOpen && !isModal && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Modal Portal */}
      {isModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl"
            >
              {content}
            </motion.div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ToolExecutionMap;
