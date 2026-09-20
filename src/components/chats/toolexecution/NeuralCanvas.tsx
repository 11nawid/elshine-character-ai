import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Globe, Sparkles, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import type { PipelineNode, DragState } from "./types";
import { createInitialDragState } from "./types";
import { cn } from "../../../lib/utils";

interface NeuralCanvasProps {
  nodes: PipelineNode[];
  onNodesChange: (nodes: PipelineNode[]) => void;
  width: number;
  height: number;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  zoom: number;
  pan: { x: number; y: number };
  onPanChange: (pan: { x: number; y: number }) => void;
}

export const NeuralCanvas: React.FC<NeuralCanvasProps> = ({
  nodes,
  onNodesChange,
  width,
  height,
  selectedNodeId,
  onSelectNode,
  zoom,
  pan,
  onPanChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState>(createInitialDragState());
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);

  const handlePointerDownCanvas = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-node]")) return;
    dragRef.current = {
      mode: "pan",
      startX: e.clientX,
      startY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
      startNodeX: 0,
      startNodeY: 0,
      lastClientX: e.clientX,
      lastClientY: e.clientY,
      hasMoved: false,
    };
    setIsDraggingCanvas(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [pan]);

  const handlePointerDownNode = useCallback((e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return;

    dragRef.current = {
      mode: "node",
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
      startNodeX: target.x,
      startNodeY: target.y,
      lastClientX: e.clientX,
      lastClientY: e.clientY,
      hasMoved: false,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [nodes, pan]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (d.mode === "none") return;
    const deltaX = e.clientX - d.startX;
    const deltaY = e.clientY - d.startY;

    if (Math.hypot(deltaX, deltaY) > 3) d.hasMoved = true;

    if (d.mode === "pan") {
      onPanChange({ x: d.startPanX + deltaX, y: d.startPanY + deltaY });
    } else if (d.mode === "node" && d.nodeId) {
      const updated = nodes.map((n) => {
        if (n.id === d.nodeId) {
          return {
            ...n,
            x: d.startNodeX + deltaX / zoom,
            y: d.startNodeY + deltaY / zoom,
          };
        }
        return n;
      });
      onNodesChange(updated);
    }
  }, [nodes, onNodesChange, onPanChange, zoom]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (d.mode === "node" && !d.hasMoved && d.nodeId) {
      onSelectNode(selectedNodeId === d.nodeId ? null : d.nodeId);
    }
    dragRef.current = createInitialDragState();
    setIsDraggingCanvas(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}
  }, [selectedNodeId, onSelectNode]);

  // Compute curved Bezier synapse paths between consecutive layers
  const queryNode = nodes.find((n) => n.type === "query");
  const toolNodes = nodes.filter((n) => n.type === "tool");
  const responseNode = nodes.find((n) => n.type === "response");

  const synapses: Array<{ id: string; path: string; active: boolean }> = [];

  if (queryNode) {
    if (toolNodes.length > 0) {
      toolNodes.forEach((tn) => {
        const dx = tn.x - queryNode.x;
        const cp1x = queryNode.x + dx * 0.5;
        const cp1y = queryNode.y;
        const cp2x = queryNode.x + dx * 0.5;
        const cp2y = tn.y;
        synapses.push({
          id: `syn_${queryNode.id}_${tn.id}`,
          path: `M ${queryNode.x} ${queryNode.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tn.x} ${tn.y}`,
          active: tn.status === "success",
        });

        if (responseNode) {
          const rdx = responseNode.x - tn.x;
          const rcp1x = tn.x + rdx * 0.5;
          const rcp1y = tn.y;
          const rcp2x = tn.x + rdx * 0.5;
          const rcp2y = responseNode.y;
          synapses.push({
            id: `syn_${tn.id}_${responseNode.id}`,
            path: `M ${tn.x} ${tn.y} C ${rcp1x} ${rcp1y}, ${rcp2x} ${rcp2y}, ${responseNode.x} ${responseNode.y}`,
            active: tn.status === "success",
          });
        }
      });
    } else if (responseNode) {
      const dx = responseNode.x - queryNode.x;
      synapses.push({
        id: `syn_${queryNode.id}_${responseNode.id}`,
        path: `M ${queryNode.x} ${queryNode.y} C ${queryNode.x + dx * 0.5} ${queryNode.y}, ${queryNode.x + dx * 0.5} ${responseNode.y}, ${responseNode.x} ${responseNode.y}`,
        active: true,
      });
    }
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDownCanvas}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={cn(
        "w-full h-full relative overflow-hidden select-none bg-[#fafafa] touch-none",
        isDraggingCanvas ? "cursor-grabbing" : "cursor-grab"
      )}
    >
      {/* High-precision dot grid matching MemoryMap */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #d4d4d8 1.2px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Synaptic Transform Canvas Layer */}
      <div
        className="w-full h-full relative"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        {/* SVG Synapse Lines & Flowing Action Pulses */}
        <svg className="w-full h-full absolute inset-0 pointer-events-none overflow-visible">
          <defs>
            <linearGradient id="active-pipeline-synapse" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#18181b" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#d97706" stopOpacity="1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="passive-pipeline-synapse" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4d4d8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a1a1aa" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {synapses.map((syn) => (
            <g key={syn.id}>
              <path
                d={syn.path}
                fill="none"
                stroke={syn.active ? "url(#active-pipeline-synapse)" : "url(#passive-pipeline-synapse)"}
                strokeWidth={syn.active ? 2.5 : 1.5}
                strokeDasharray={syn.active ? undefined : "4 4"}
                strokeLinecap="round"
              />
              {syn.active && (
                <circle r={3.5} fill="#f59e0b" className="filter drop-shadow-sm">
                  <animateMotion path={syn.path} dur="2.4s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          ))}
        </svg>

        {/* Neural Nodes */}
        {nodes.map((node) => {
          const isHovered = hoveredNodeId === node.id;
          const isSelected = selectedNodeId === node.id;
          const isQuery = node.type === "query";
          const isTool = node.type === "tool";
          const isResponse = node.type === "response";

          return (
            <div
              key={node.id}
              data-node="true"
              onPointerDown={(e) => handlePointerDownNode(e, node.id)}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200"
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                transform: `translate(-50%, -50%) scale(${isHovered || isSelected ? 1.08 : 1})`,
                zIndex: isSelected ? 30 : isHovered ? 25 : 10,
              }}
            >
              {/* Outer Radiant Glow */}
              <div
                className={cn(
                  "p-3 rounded-2xl flex items-center gap-2.5 shadow-md border backdrop-blur-md transition-all",
                  isQuery && "bg-zinc-900 text-white border-zinc-800",
                  isTool && node.platform === "youtube" && "bg-white text-zinc-900 border-red-200 ring-2 ring-red-500/20 hover:border-red-400",
                  isTool && node.platform === "instagram" && "bg-white text-zinc-900 border-pink-200 ring-2 ring-pink-500/20 hover:border-pink-400",
                  isTool && !node.platform && "bg-white text-zinc-900 border-amber-200 ring-2 ring-amber-500/20",
                  isResponse && "bg-zinc-950 text-white border-zinc-700 ring-2 ring-emerald-500/30",
                  isSelected && "ring-4 ring-amber-400 shadow-xl"
                )}
              >
                {/* Node Glyph */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-xs",
                    isQuery && "bg-zinc-800 text-zinc-200",
                    isTool && node.platform === "youtube" && "bg-red-500 text-white",
                    isTool && node.platform === "instagram" && "bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white",
                    isTool && !node.platform && "bg-amber-500 text-white",
                    isResponse && "bg-emerald-500 text-white"
                  )}
                >
                  {isQuery && <MessageSquare className="w-4 h-4" />}
                  {isTool && node.platform === "youtube" && <span>YT</span>}
                  {isTool && node.platform === "instagram" && <span>IG</span>}
                  {isTool && !node.platform && <Globe className="w-4 h-4" />}
                  {isResponse && <Sparkles className="w-4 h-4" />}
                </div>

                {/* Node Summary Label */}
                <div className="flex flex-col pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold tracking-tight leading-none truncate max-w-[130px]">
                      {node.label}
                    </span>
                    {node.status === "success" && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />}
                    {node.status === "failed" && <XCircle className="w-3 h-3 text-red-500 shrink-0" />}
                  </div>
                  <span className="text-[9.5px] font-medium text-zinc-400 mt-1 truncate max-w-[140px]">
                    {node.sublabel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Inspector Detail Card */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-4 left-4 right-4 z-40 bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-2xl p-3.5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 select-text"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0",
                  selectedNode.type === "query" && "bg-zinc-900",
                  selectedNode.platform === "youtube" && "bg-red-500",
                  selectedNode.platform === "instagram" && "bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600",
                  selectedNode.type === "response" && "bg-emerald-600"
                )}
              >
                {selectedNode.type === "query" ? "IN" : selectedNode.platform === "youtube" ? "YT" : selectedNode.platform === "instagram" ? "IG" : "AI"}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900">{selectedNode.label}</span>
                  {selectedNode.target && (
                    <span className="text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full">
                      {selectedNode.target}
                    </span>
                  )}
                  {selectedNode.durationMs && (
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {selectedNode.durationMs}ms
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-600">{selectedNode.sublabel}</p>
              </div>
            </div>

            {selectedNode.metrics && Object.keys(selectedNode.metrics).length > 0 && (
              <div className="flex items-center gap-2 flex-wrap border-t md:border-t-0 pt-2 md:pt-0 border-zinc-100">
                {Object.entries(selectedNode.metrics).map(([k, v]) => (
                  <div key={k} className="bg-zinc-50 border border-zinc-200/80 rounded-lg px-2.5 py-1 text-center">
                    <div className="text-[8.5px] uppercase font-bold text-zinc-400 tracking-wider">{k}</div>
                    <div className="text-[11px] font-extrabold text-zinc-900">{String(v)}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
