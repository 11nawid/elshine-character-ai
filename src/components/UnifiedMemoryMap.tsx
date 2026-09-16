import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Brain, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sparkles,
  Zap,
  Trash2,
  MessageSquare,
  User as UserIcon,
  Filter,
  Plus
} from 'lucide-react';
import { Character, Memory } from '../types';
import { auth } from '../lib/firebase';
import { listChats, setChatMemories } from '../lib/api';
import { cn } from '../lib/utils';
import type { MapNode } from './memorymap/types';
import { createDragState } from './memorymap/types';
import { buildNodes } from './memorymap/layout';
import { stepPhysics } from './memorymap/physics';
import { userAvatar } from '../lib/avatar';
import { realName } from '../lib/userDisplay';

interface UnifiedMemoryMapProps {
  characters: Character[];
  isOpen: boolean;
  onClose: () => void;
  onNavigateToChat: (characterId: string) => void;
}

export const UnifiedMemoryMap: React.FC<UnifiedMemoryMapProps> = ({
  characters = [],
  isOpen,
  onClose,
  onNavigateToChat
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 960, height: 680 });
  const [characterMemories, setCharacterMemories] = useState<Record<string, { chatDocId?: string; memories: Memory[] }>>({});
  
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterCharId, setFilterCharId] = useState<string | 'all'>('all');

  // Canvas Pan & Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Physics Simulation
  const simNodesRef = useRef<MapNode[]>([]);
  const [renderedNodes, setRenderedNodes] = useState<MapNode[]>([]);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [activeDraggingNodeId, setActiveDraggingNodeId] = useState<string | null>(null);

  // Drag interaction state
  const dragRef = useRef(createDragState());

  // Track container dimensions dynamically
  useEffect(() => {
    if (!isOpen) return;
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 960,
          height: containerRef.current.clientHeight || 680
        });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [isOpen]);

  // Load all chats for this user to map memories for every character
  useEffect(() => {
    if (!isOpen) return;
    let active = true;

    listChats()
      .then(({ chats }) => {
        if (!active) return;
        const memoryMap: Record<string, { chatDocId?: string; memories: Memory[] }> = {};
        chats.forEach((chat) => {
          if (chat.characterId && chat.memories && Array.isArray(chat.memories)) {
            memoryMap[chat.characterId] = {
              chatDocId: chat.id,
              memories: chat.memories
            };
          }
        });
        setCharacterMemories(memoryMap);
      })
      .catch((err) => {
        console.warn("UnifiedMemoryMap chats load notice:", err);
      });

    return () => {
      active = false;
    };
  }, [isOpen]);

  // Handle memory deletion directly from unified map
  const handleDeleteMemory = async (chatDocId: string | undefined, memoryId: string) => {
    if (!chatDocId) return;
    try {
      const entry = Object.values(characterMemories).find(v => v.chatDocId === chatDocId);
      const currentMemories = entry?.memories || [];
      const filtered = currentMemories.filter(m => m.id !== memoryId);
      const res = await setChatMemories(chatDocId, filtered);
      const updatedMemories = res.chat.memories || [];
      setCharacterMemories(prev => {
        const next: Record<string, { chatDocId?: string; memories: Memory[] }> = {};
        for (const [charId, v] of Object.entries(prev)) {
          next[charId] = v.chatDocId === chatDocId
            ? { chatDocId, memories: updatedMemories }
            : v;
        }
        return next;
      });
      setSelectedNodeId(null);
      setHoveredNodeId(null);
    } catch (e) {
      console.error("Error deleting memory:", e);
    }
  };

  // Build the hierarchical Node structure: User -> Characters -> Memories
  useEffect(() => {
    if (!isOpen) return;

    const currentUser = auth.currentUser;
    const newNodes: MapNode[] = buildNodes({
      dimensions,
      characters,
      characterMemories,
      filterCharId,
      userName: realName(currentUser?.displayName, currentUser?.email) || 'You',
      userPhoto: userAvatar(currentUser),
      previous: simNodesRef.current,
    });

    simNodesRef.current = newNodes;
    setRenderedNodes([...newNodes]);
  }, [characters, characterMemories, dimensions, filterCharId, isOpen]);

  // Spring Physics Engine
  useEffect(() => {
    if (!isOpen) return;
    let animId: number;

    const tick = () => {
      const nodes = simNodesRef.current;
      if (nodes.length === 0) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const draggedId = dragRef.current.mode === 'node' ? dragRef.current.nodeId : null;
      stepPhysics(nodes, draggedId);

      setRenderedNodes([...nodes]);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [dimensions, isOpen]);

  // Connecting Bezier Edges Calculation
  const edges = useMemo(() => {
    const edgeList: {
      from: MapNode;
      to: MapNode;
      key: string;
      pathD: string;
      dist: number;
      type: 'user-char' | 'char-mem';
    }[] = [];

    const nodesMap = new Map<string, MapNode>();
    renderedNodes.forEach(n => nodesMap.set(n.id, n));

    renderedNodes.forEach(node => {
      if (node.parentId) {
        const parent = nodesMap.get(node.parentId);
        if (parent) {
          const midX = (parent.x + node.x) / 2;
          const midY = (parent.y + node.y) / 2;
          const dx = node.x - parent.x;
          const dy = node.y - parent.y;
          const dist = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);
          const perpAngle = angle + Math.PI / 2;

          const speed = Math.hypot(node.vx, node.vy) + Math.hypot(parent.vx, parent.vy);
          const bend = Math.min(26, dist * 0.09 + speed * 1.3) * Math.sin(angle * 2 || 1);

          const cpX = midX + Math.cos(perpAngle) * bend;
          const cpY = midY + Math.sin(perpAngle) * bend;

          const pathD = `M ${parent.x} ${parent.y} Q ${cpX} ${cpY} ${node.x} ${node.y}`;

          edgeList.push({
            from: parent,
            to: node,
            key: `edge-${parent.id}-${node.id}`,
            pathD,
            dist,
            type: parent.type === 'user' ? 'user-char' : 'char-mem'
          });
        }
      }
    });

    return edgeList;
  }, [renderedNodes]);

  // Pointer & Drag Event Handlers
  const handleNodePointerDown = useCallback((nodeId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const target = simNodesRef.current.find(n => n.id === nodeId);
    if (!target) return;

    dragRef.current = {
      mode: 'node',
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

    setActiveDraggingNodeId(nodeId);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [pan]);

  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select, [data-interactive="true"]')) {
      return;
    }
    e.preventDefault();

    dragRef.current = {
      mode: 'pan',
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

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const current = dragRef.current;
    if (current.mode === 'none') return;

    const deltaX = e.clientX - current.startX;
    const deltaY = e.clientY - current.startY;

    if (Math.hypot(deltaX, deltaY) > 3) {
      current.hasMoved = true;
    }

    if (current.mode === 'pan') {
      setPan({
        x: current.startPanX + deltaX,
        y: current.startPanY + deltaY,
      });
    } else if (current.mode === 'node' && current.nodeId) {
      const node = simNodesRef.current.find(n => n.id === current.nodeId);
      if (node) {
        const scaledDeltaX = deltaX / zoom;
        const scaledDeltaY = deltaY / zoom;

        const instantaneousVx = (e.clientX - current.lastClientX) / zoom;
        const instantaneousVy = (e.clientY - current.lastClientY) / zoom;

        node.x = current.startNodeX + scaledDeltaX;
        node.y = current.startNodeY + scaledDeltaY;
        node.vx = instantaneousVx * 0.8;
        node.vy = instantaneousVy * 0.8;
      }
    }

    current.lastClientX = e.clientX;
    current.lastClientY = e.clientY;
  }, [zoom]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const current = dragRef.current;
    if (current.mode === 'node' && !current.hasMoved && current.nodeId) {
      const clicked = simNodesRef.current.find(n => n.id === current.nodeId);
      if (clicked?.type === 'character' && clicked.characterId) {
        onClose();
        onNavigateToChat(clicked.characterId);
      } else {
        setSelectedNodeId(prev => prev === current.nodeId ? null : current.nodeId!);
      }
    }

    dragRef.current = {
      mode: 'none',
      startX: 0,
      startY: 0,
      startPanX: 0,
      startPanY: 0,
      startNodeX: 0,
      startNodeY: 0,
      lastClientX: 0,
      lastClientY: 0,
      hasMoved: false,
    };

    setIsDraggingCanvas(false);
    setActiveDraggingNodeId(null);

    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch (err) {}
  }, [onClose, onNavigateToChat]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Number(Math.max(0.4, Math.min(2.5, prev * factor)).toFixed(2)));
  }, []);

  const handleResetLayout = () => {
    simNodesRef.current.forEach(node => {
      node.x = node.targetX;
      node.y = node.targetY;
      node.vx = (Math.random() - 0.5) * 3;
      node.vy = (Math.random() - 0.5) * 3;
    });
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNodeId(null);
  };

  // Helper to truncate node display text
  const getShortLabel = (text: string) => {
    let clean = text.replace(/^(User's|User|He|She|They|The user)\s+(is|has|works as|likes|loves|prefers|lives in|wants to)\s+/i, '');
    if (clean.length > 20) {
      return clean.slice(0, 18) + '...';
    }
    return clean;
  };

  const activeNode = renderedNodes.find(n => n.id === (selectedNodeId || hoveredNodeId));
  const userCenterNode = renderedNodes.find(n => n.type === 'user');

  // Total memories count
  const totalMemoriesCount = Object.values(characterMemories).reduce(
    (acc, val) => acc + (val.memories?.length || 0), 0
  );

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 bg-black/50 backdrop-blur-md animate-in fade-in duration-200 select-none"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <div 
        ref={containerRef}
        className="relative w-full max-w-5xl h-[85vh] bg-[#fafafa] rounded-3xl border border-zinc-200/90 shadow-2xl overflow-hidden flex flex-col select-none"
      >
        {/* Dot matrix grid */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none select-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #d4d4d8 1.5px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />

        {/* Modal Header */}
        <header className="px-8 py-5 border-b border-zinc-200/80 flex items-center justify-between bg-white/90 backdrop-blur-md z-30 shrink-0 select-none">
          <div className="select-none">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-900" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-black">
                Unified Neural Memory Map
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Connecting you &bull; {characters.length} AI companions &bull; {totalMemoriesCount} connected memories
            </p>
          </div>

          <div className="flex items-center gap-3">
            {characters.length > 1 && (
              <div className="flex items-center gap-1.5 bg-zinc-100 px-3 py-1.5 rounded-full border border-zinc-200 text-xs">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                <select
                  value={filterCharId}
                  onChange={(e) => setFilterCharId(e.target.value)}
                  className="bg-transparent text-xs text-zinc-800 font-bold outline-none cursor-pointer"
                >
                  <option value="all">All Companions</option>
                  {characters.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-black transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Fullscreen Interactive Map Canvas Area */}
        <div 
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          className={cn(
            "flex-1 relative overflow-hidden select-none touch-none",
            isDraggingCanvas ? "cursor-grabbing" : "cursor-grab"
          )}
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          {/* Zoom/Pan Transform Layer */}
          <div 
            className="w-full h-full relative"
            style={{ 
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* SVG Connecting Lines with Smooth Curved Paths */}
            <svg className="w-full h-full absolute inset-0 pointer-events-none select-none overflow-visible">
              <defs>
                <linearGradient id="unified-active-synapse-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#000000" stopOpacity="1" />
                  <stop offset="100%" stopColor="#52525b" stopOpacity="0.85" />
                </linearGradient>

                <linearGradient id="unified-passive-synapse-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a1a1aa" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#e4e4e7" stopOpacity="0.4" />
                </linearGradient>

                <filter id="glow-unified-modal" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Faint Orbital Guides centered around User Node */}
              {userCenterNode && (
                <>
                  <circle
                    cx={userCenterNode.x}
                    cy={userCenterNode.y}
                    r={260}
                    fill="none"
                    stroke="#e4e4e7"
                    strokeWidth={1.5}
                    strokeDasharray="4,6"
                    opacity={0.6}
                  />
                  <circle
                    cx={userCenterNode.x}
                    cy={userCenterNode.y}
                    r={420}
                    fill="none"
                    stroke="#f4f4f5"
                    strokeWidth={1.5}
                    strokeDasharray="4,6"
                    opacity={0.4}
                  />
                </>
              )}

              {/* Faint Orbital Rings around each Character */}
              {renderedNodes.filter(n => n.type === 'character').map(charNode => (
                <circle
                  key={`orbit-ring-${charNode.id}`}
                  cx={charNode.x}
                  cy={charNode.y}
                  r={140}
                  fill="none"
                  stroke="#f4f4f5"
                  strokeWidth={1.2}
                  strokeDasharray="3,5"
                  opacity={0.7}
                />
              ))}

              {/* Curved Connection Edges with live Bezier flexing */}
              {edges.map((edge) => {
                const isHighlight = activeNode && (
                  activeNode.id === edge.from.id || 
                  activeNode.id === edge.to.id ||
                  (activeNode.characterId && (activeNode.characterId === edge.to.characterId || activeNode.characterId === edge.from.characterId))
                );

                return (
                  <g key={edge.key}>
                    {/* Glowing highlight trace */}
                    {isHighlight && (
                      <path
                        d={edge.pathD}
                        fill="none"
                        stroke="#000000"
                        strokeWidth={6}
                        strokeOpacity={0.15}
                        filter="url(#glow-unified-modal)"
                      />
                    )}

                    {/* Main Synaptic Line */}
                    <path
                      d={edge.pathD}
                      fill="none"
                      stroke={isHighlight ? "url(#unified-active-synapse-grad)" : "url(#unified-passive-synapse-grad)"}
                      strokeWidth={isHighlight ? (edge.type === 'user-char' ? 3 : 2.5) : (edge.type === 'user-char' ? 2 : 1.5)}
                      strokeDasharray={edge.type === 'char-mem' && !isHighlight ? "3,4" : undefined}
                      className="transition-colors duration-150"
                    />

                    {/* End Junction Point */}
                    <circle
                      cx={edge.to.x}
                      cy={edge.to.y}
                      r={isHighlight ? (edge.type === 'user-char' ? 4.5 : 3.5) : (edge.type === 'user-char' ? 3 : 2)}
                      fill={isHighlight ? "#000000" : "#a1a1aa"}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {renderedNodes.map((node) => {
              // 1. CENTER USER "ME" NODE
              if (node.type === 'user') {
                return (
                  <div
                    key="user-node-modal"
                    onPointerDown={(e) => handleNodePointerDown('user-root', e)}
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 60
                    }}
                    className={cn(
                      "absolute flex flex-col items-center justify-center select-none pointer-events-auto touch-none group",
                      activeDraggingNodeId === 'user-root' ? 'cursor-grabbing z-60 scale-105' : 'cursor-grab'
                    )}
                  >
                    <div className="relative flex items-center justify-center">
                      <div className="absolute -inset-4 rounded-full bg-black/5 animate-pulse" />
                      <div className="relative w-20 h-20 rounded-full border-2 border-black bg-white p-1 shadow-2xl pointer-events-none select-none transition-transform group-hover:scale-105 overflow-hidden">
                        {node.avatarUrl ? (
                          <img
                            src={node.avatarUrl}
                            alt={node.label}
                            draggable={false}
                            className="w-full h-full rounded-full object-cover pointer-events-none select-none"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">
                            {node.label.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="mt-2 text-xs font-black uppercase tracking-widest text-black bg-white border border-zinc-200 px-3 py-1 rounded-full shadow-sm pointer-events-none select-none flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {node.label} (Me)
                    </span>
                  </div>
                );
              }

              // 2. CHARACTER NODES
              if (node.type === 'character') {
                const isSelected = selectedNodeId === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isActive = isSelected || isHovered || activeDraggingNodeId === node.id;

                return (
                  <div
                    key={node.id}
                    onPointerDown={(e) => handleNodePointerDown(node.id, e)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: isActive ? 55 : 30
                    }}
                    className={cn(
                      "absolute flex flex-col items-center justify-center select-none pointer-events-auto touch-none group",
                      activeDraggingNodeId === node.id ? 'cursor-grabbing scale-105' : 'cursor-grab'
                    )}
                  >
                    <div className="relative flex items-center justify-center">
                      <div className={cn(
                        "absolute -inset-3 rounded-full transition-colors",
                        isActive ? "bg-black/10 animate-pulse" : "bg-zinc-100"
                      )} />
                      <div className={cn(
                        "relative w-15 h-15 rounded-full border-2 bg-white p-0.5 shadow-xl transition-all group-hover:scale-105 overflow-hidden",
                        isActive ? "border-black shadow-black/10" : "border-zinc-300"
                      )}>
                        <img
                          src={node.avatarUrl}
                          alt={node.label}
                          draggable={false}
                          className="w-full h-full rounded-full object-cover pointer-events-none select-none"
                        />
                      </div>
                    </div>

                    <div className={cn(
                      "mt-1.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border transition-all text-xs font-black uppercase tracking-wider pointer-events-none shadow-xs",
                      isActive 
                        ? "bg-black text-white border-black" 
                        : "bg-white text-zinc-800 border-zinc-200"
                    )}>
                      <Zap className={cn("w-2.5 h-2.5", isActive ? "text-yellow-300 fill-yellow-300" : "text-yellow-500 fill-yellow-500")} />
                      <span className="text-[10px]">{node.label}</span>
                    </div>

                    {/* Character Hover Card */}
                    <AnimatePresence>
                      {isActive && activeDraggingNodeId !== node.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-4 bg-zinc-950 text-white rounded-2xl shadow-2xl border border-zinc-800 z-50 pointer-events-auto select-none"
                        >
                          <div className="flex items-center gap-3 mb-2.5">
                            <img src={node.avatarUrl} alt={node.label} className="w-10 h-10 rounded-xl object-cover border border-zinc-700" />
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-white">{node.label}</h4>
                              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{node.sublabel}</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                            <span className="text-[10px] text-zinc-400">
                              {characterMemories[node.characterId!]?.memories?.length || 0} facts
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                                if (node.characterId) onNavigateToChat(node.characterId);
                              }}
                              className="px-3 py-1 bg-white text-black text-[10px] font-black uppercase rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" /> Chat
                            </button>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-solid border-t-zinc-950 border-t-6 border-x-transparent border-x-6 border-b-0" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              // 3. MEMORY FACT NODES
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isActive = isSelected || isHovered || activeDraggingNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onPointerDown={(e) => handleNodePointerDown(node.id, e)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isActive ? 50 : 10,
                  }}
                  className={cn(
                    "absolute flex flex-col items-center justify-center pointer-events-auto select-none touch-none group",
                    activeDraggingNodeId === node.id ? 'cursor-grabbing scale-105' : 'cursor-grab'
                  )}
                >
                  {/* Clean Truncated Pill */}
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2 rounded-full text-xs transition-all duration-200 max-w-[150px] select-none pointer-events-none border shadow-sm",
                      isActive
                        ? "bg-black text-white border-black shadow-xl ring-4 ring-black/10 scale-105"
                        : "bg-white/95 backdrop-blur-xs text-zinc-800 border-zinc-200/90 hover:border-zinc-400"
                    )}
                  >
                    <div 
                      className={cn(
                        "w-2 h-2 rounded-full shrink-0 transition-colors",
                        isActive ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" : "bg-zinc-400"
                      )} 
                    />
                    <span className="font-semibold text-xs leading-none truncate select-none pointer-events-none">
                      {getShortLabel(node.label)}
                    </span>
                  </div>

                  {/* Rich Floating Full-Text Popover on Hover */}
                  <AnimatePresence>
                    {isActive && activeDraggingNodeId !== node.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 p-4 bg-zinc-950 text-white rounded-2xl shadow-2xl border border-zinc-800 z-50 pointer-events-auto select-none"
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                            <Sparkles className="w-3 h-3 text-yellow-400" />
                            {node.characterName}'s Memory
                          </div>
                          {node.chatDocId && node.memoryId && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMemory(node.chatDocId, node.memoryId!);
                              }}
                              className="p-1 text-zinc-400 hover:text-red-400 rounded-md transition-colors cursor-pointer"
                              title="Delete Memory"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <p className="text-xs font-medium leading-relaxed text-zinc-100">
                          "{node.fullText}"
                        </p>

                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-solid border-t-zinc-950 border-t-8 border-x-transparent border-x-8 border-b-0" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Canvas Floating Controls */}
          <div 
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute bottom-6 left-6 z-30 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-200 shadow-lg select-none pointer-events-auto"
          >
            <button
              type="button"
              onClick={() => setZoom(z => Number(Math.min(z + 0.2, 2.5).toFixed(2)))}
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-700 hover:text-black transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(z => Number(Math.max(z - 0.2, 0.4).toFixed(2)))}
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-700 hover:text-black transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="px-2.5 text-[10px] font-mono font-bold text-zinc-400 border-x border-zinc-200 select-none">
              {Math.round(zoom * 100)}%
            </div>
            <button
              type="button"
              onClick={handleResetLayout}
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-700 hover:text-black transition-colors"
              title="Reset Layout & Positions"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
