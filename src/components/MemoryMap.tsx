import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  X, 
  Brain, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sparkles,
  Zap
} from 'lucide-react';
import { Memory, Character } from '../types';
import { cn } from '../lib/utils';
import { characterAvatar } from '../lib/avatar';

interface MemoryMapProps {
  memories: Memory[];
  character: Character;
  onAddMemory?: (text: string) => Promise<void> | void;
  onDeleteMemory?: (id: string) => Promise<void> | void;
  isModal?: boolean;
  onOpenModal?: () => void;
  onCloseModal?: () => void;
}

interface SimNode {
  id: string;
  text: string;
  createdAt: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetRadius: number;
  targetAngle: number;
  isCenter: boolean;
}

export const MemoryMap: React.FC<MemoryMapProps> = ({
  memories = [],
  character,
  onAddMemory,
  onDeleteMemory,
  isModal = false,
  onOpenModal,
  onCloseModal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 340, height: isModal ? 640 : 400 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');

  // Canvas Pan & Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Physics Simulation Data
  const simNodesRef = useRef<SimNode[]>([]);
  const [renderedNodes, setRenderedNodes] = useState<SimNode[]>([]);
  const [orbitRadii, setOrbitRadii] = useState<number[]>([]);

  // Drag interaction state
  const dragRef = useRef<{
    mode: 'none' | 'pan' | 'node';
    nodeId?: string;
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
    startNodeX: number;
    startNodeY: number;
    lastClientX: number;
    lastClientY: number;
    hasMoved: boolean;
  }>({
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
  });

  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [activeDraggingNodeId, setActiveDraggingNodeId] = useState<string | null>(null);

  // ResizeObserver for accurate canvas container bounds
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: clientWidth || (isModal ? 800 : 340),
          height: isModal ? (clientHeight || 640) : 400
        });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [isModal]);

  // Synchronize simulation nodes with memory list and character
  useEffect(() => {
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;

    const existingMap = new Map<string, SimNode>();
    simNodesRef.current.forEach(n => existingMap.set(n.id, n));

    const total = memories.length;
    const newSimNodes: SimNode[] = [];
    const calculatedOrbits = new Set<number>();

    // Center Character Node
    const existingCenter = existingMap.get('center');
    const centerNode: SimNode = {
      id: 'center',
      text: character.name,
      createdAt: Date.now(),
      x: existingCenter ? existingCenter.x : cx,
      y: existingCenter ? existingCenter.y : cy,
      vx: existingCenter ? existingCenter.vx : 0,
      vy: existingCenter ? existingCenter.vy : 0,
      targetRadius: 0,
      targetAngle: 0,
      isCenter: true,
    };
    newSimNodes.push(centerNode);

    // Connected Memory Nodes Layout with balanced distribution
    memories.forEach((m, index) => {
      let radius = 0;
      let angle = 0;

      if (isModal) {
        const ring = Math.floor(index / 6);
        const indexInRing = index % 6;
        const ringCount = Math.min(total - ring * 6, 6);
        radius = 175 + ring * 95;
        angle = (2 * Math.PI * indexInRing) / ringCount - Math.PI / 2 + (ring * 0.5);
      } else {
        if (total === 1) {
          radius = 110;
          angle = -Math.PI / 2;
        } else if (total === 2) {
          radius = 115;
          angle = index === 0 ? -Math.PI * 0.75 : -Math.PI * 0.25;
        } else if (total === 3) {
          radius = 120;
          const angles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
          angle = angles[index];
        } else if (total === 4) {
          radius = 125;
          const angles = [-Math.PI * 0.75, -Math.PI * 0.25, Math.PI * 0.25, Math.PI * 0.75];
          angle = angles[index];
        } else {
          const ring = Math.floor(index / 5);
          const indexInRing = index % 5;
          const ringCount = Math.min(total - ring * 5, 5);
          radius = 100 + ring * 55;
          angle = (2 * Math.PI * indexInRing) / ringCount - Math.PI / 2 + (ring * 0.45);
        }
      }

      calculatedOrbits.add(radius);

      const existing = existingMap.get(m.id);
      if (existing) {
        newSimNodes.push({
          ...existing,
          text: m.text,
          targetRadius: radius,
          targetAngle: angle,
        });
      } else {
        const initX = centerNode.x + radius * Math.cos(angle);
        const initY = centerNode.y + radius * Math.sin(angle);
        newSimNodes.push({
          id: m.id,
          text: m.text,
          createdAt: m.createdAt || Date.now(),
          x: initX,
          y: initY,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          targetRadius: radius,
          targetAngle: angle,
          isCenter: false,
        });
      }
    });

    simNodesRef.current = newSimNodes;
    setRenderedNodes([...newSimNodes]);
    setOrbitRadii(Array.from(calculatedOrbits));
  }, [memories, dimensions, character.name, isModal]);

  // High-performance Physics Engine (Springs, Hooke's law, Inertia, Damping & Anti-clumping)
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const nodes = simNodesRef.current;
      if (nodes.length === 0) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const center = nodes.find(n => n.isCenter) || nodes[0];
      const draggedId = dragRef.current.mode === 'node' ? dragRef.current.nodeId : null;

      // 1. Center Node Physics
      if (draggedId === 'center') {
        center.vx = 0;
        center.vy = 0;
      } else {
        const cx = dimensions.width / 2;
        const cy = dimensions.height / 2;
        const toCenterX = (cx - center.x) * 0.015;
        const toCenterY = (cy - center.y) * 0.015;
        center.vx = (center.vx + toCenterX) * 0.88;
        center.vy = (center.vy + toCenterY) * 0.88;
        center.x += center.vx;
        center.y += center.vy;
      }

      // 2. Memory Nodes Physics with realistic springs pulling behind the character
      const memoryNodes = nodes.filter(n => !n.isCenter);

      memoryNodes.forEach((node, i) => {
        if (draggedId === node.id) {
          node.vx = 0;
          node.vy = 0;
          return;
        }

        let fx = 0;
        let fy = 0;

        // A. Primary Spring pulling towards ideal orbit position relative to center character
        const targetX = center.x + node.targetRadius * Math.cos(node.targetAngle);
        const targetY = center.y + node.targetRadius * Math.sin(node.targetAngle);

        const springK = isModal ? 0.055 : 0.065;
        fx += (targetX - node.x) * springK;
        fy += (targetY - node.y) * springK;

        // B. Rubber-band radial spring to Center
        const dx = node.x - center.x;
        const dy = node.y - center.y;
        const currentDist = Math.hypot(dx, dy) || 1;
        const distDiff = currentDist - node.targetRadius;
        const radialPull = distDiff * 0.035;
        fx -= (dx / currentDist) * radialPull;
        fy -= (dy / currentDist) * radialPull;

        // C. Repulsion between memory nodes to maintain clean spacing
        memoryNodes.forEach((other, j) => {
          if (i === j) return;
          const odx = node.x - other.x;
          const ody = node.y - other.y;
          const odist = Math.hypot(odx, ody) || 1;
          const minDist = isModal ? 120 : 90;
          if (odist < minDist) {
            const rep = ((minDist - odist) / minDist) * 2.0;
            fx += (odx / odist) * rep;
            fy += (ody / odist) * rep;
          }
        });

        // D. Cross-spring connection between adjacent memory nodes
        if (memoryNodes.length > 2) {
          const nextNode = memoryNodes[(i + 1) % memoryNodes.length];
          const cdx = nextNode.x - node.x;
          const cdy = nextNode.y - node.y;
          const cdist = Math.hypot(cdx, cdy) || 1;
          const idealCrossDist = (2 * Math.PI * node.targetRadius) / memoryNodes.length;
          const crossDiff = cdist - idealCrossDist;
          fx += (cdx / cdist) * crossDiff * 0.012;
          fy += (cdy / cdist) * crossDiff * 0.012;
        }

        // E. Damping & Integration
        const damping = 0.86;
        node.vx = (node.vx + fx) * damping;
        node.vy = (node.vy + fy) * damping;
        node.x += node.vx;
        node.y += node.vy;
      });

      setRenderedNodes([...nodes]);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [dimensions, isModal]);

  // Compute curved connecting Bezier edges with refined organic aesthetics
  const edges = useMemo(() => {
    const center = renderedNodes.find(n => n.isCenter) || renderedNodes[0];
    if (!center) return [];

    const memoryNodes = renderedNodes.filter(n => !n.isCenter);
    const edgeList: {
      from: SimNode;
      to: SimNode;
      key: string;
      pathD: string;
      dist: number;
      isCross?: boolean;
    }[] = [];

    // Main branches from Character center to each memory
    memoryNodes.forEach((node) => {
      const midX = (center.x + node.x) / 2;
      const midY = (center.y + node.y) / 2;
      
      const dx = node.x - center.x;
      const dy = node.y - center.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const perpAngle = angle + Math.PI / 2;
      
      // Dynamic subtle fluid bend responsive to velocity & tension
      const speed = Math.hypot(node.vx, node.vy) + Math.hypot(center.vx, center.vy);
      const dynamicBend = Math.min(22, dist * 0.08 + speed * 1.2) * Math.sin(angle * 2 || 1);
      
      const cpX = midX + Math.cos(perpAngle) * dynamicBend;
      const cpY = midY + Math.sin(perpAngle) * dynamicBend;

      const pathD = `M ${center.x} ${center.y} Q ${cpX} ${cpY} ${node.x} ${node.y}`;

      edgeList.push({
        from: center,
        to: node,
        key: `core-${node.id}`,
        pathD,
        dist,
        isCross: false
      });
    });

    // Elegant subtle ambient webbing between adjacent memories (clean, soft lines)
    if (memoryNodes.length > 2) {
      for (let i = 0; i < memoryNodes.length; i++) {
        const next = memoryNodes[(i + 1) % memoryNodes.length];
        const dist = Math.hypot(memoryNodes[i].x - next.x, memoryNodes[i].y - next.y);
        if (dist < (isModal ? 280 : 180)) {
          const midX = (memoryNodes[i].x + next.x) / 2;
          const midY = (memoryNodes[i].y + next.y) / 2;
          const pathD = `M ${memoryNodes[i].x} ${memoryNodes[i].y} Q ${midX} ${midY} ${next.x} ${next.y}`;
          edgeList.push({
            from: memoryNodes[i],
            to: next,
            key: `cross-${memoryNodes[i].id}-${next.id}`,
            pathD,
            dist,
            isCross: true
          });
        }
      }
    }

    return edgeList;
  }, [renderedNodes, isModal]);

  const activeNode = useMemo(() => {
    return renderedNodes.find(n => n.id === (selectedId || hoveredId));
  }, [renderedNodes, selectedId, hoveredId]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !onAddMemory) return;
    await onAddMemory(newText.trim());
    setNewText('');
    setIsAdding(false);
  };

  // Node Drag Start Handler
  const handleNodePointerDown = useCallback((nodeId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.cancelable) e.preventDefault();

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

  // Canvas Background Drag Start Handler
  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, input, form, [data-interactive="true"]')) {
      return;
    }
    if (e.cancelable) e.preventDefault();

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

  // Unified Pointer Move Handler
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

  // Unified Pointer Up Handler
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const current = dragRef.current;
    if (current.mode === 'node' && !current.hasMoved && current.nodeId) {
      if (current.nodeId === 'center') {
        if (!isModal && onOpenModal) onOpenModal();
      } else {
        setSelectedId(prev => (prev === current.nodeId ? null : current.nodeId!));
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
  }, [isModal, onOpenModal]);

  // Smooth Wheel Zoom Handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.cancelable) e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => {
      const next = Math.max(0.4, Math.min(2.5, prev * zoomFactor));
      return Number(next.toFixed(2));
    });
  }, []);

  // Reset entire graph layout
  const handleResetLayout = () => {
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    
    simNodesRef.current.forEach(node => {
      if (node.isCenter) {
        node.x = cx;
        node.y = cy;
        node.vx = 0;
        node.vy = 0;
      } else {
        node.x = cx + node.targetRadius * Math.cos(node.targetAngle);
        node.y = cy + node.targetRadius * Math.sin(node.targetAngle);
        node.vx = (Math.random() - 0.5) * 4;
        node.vy = (Math.random() - 0.5) * 4;
      }
    });

    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedId(null);
  };

  const centerNode = renderedNodes.find(n => n.isCenter) || renderedNodes[0];

  // Helper to get a clean, shortened display label from full memory text
  const getShortLabel = (text: string) => {
    let clean = text.replace(/^(User's|User|He|She|They|The user)\s+(is|has|works as|likes|loves|prefers|lives in|wants to)\s+/i, '');
    if (clean.length > 22) {
      return clean.slice(0, 20) + '...';
    }
    return clean;
  };

  // 1. Panel Inline View
  if (!isModal) {
    return (
      <div 
        ref={containerRef} 
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className={cn(
          "w-full relative bg-[#fafafa] overflow-hidden select-none border-t border-zinc-200/80 py-3 touch-none",
          isDraggingCanvas ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{ height: '400px', userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {/* Subtle high-precision dot grid */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none select-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #d4d4d8 1.2px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Minimal Header */}
        <div className="absolute top-3 left-5 right-5 z-30 flex items-center justify-between pointer-events-auto select-none">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
              Synaptic Map
            </span>
            <span className="text-[9px] font-bold text-zinc-400">
              ({memories.length})
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-full border border-zinc-200 shadow-xs">
            {onAddMemory && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsAdding(!isAdding); }}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors"
                title="Add Memory Fact"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleResetLayout(); }}
              className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors"
              title="Reset Layout"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            {onOpenModal && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpenModal(); }}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors"
                title="Expand Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Inline Add Input */}
        <AnimatePresence>
          {isAdding && (
            <motion.form
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              onSubmit={handleAddSubmit}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-12 left-5 right-5 z-40 flex items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 border border-zinc-200 rounded-2xl shadow-xl"
            >
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Connect new memory fact..."
                autoFocus
                className="flex-1 px-3 py-1.5 text-xs bg-transparent outline-none text-black placeholder:text-zinc-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-black text-white text-[9px] font-black uppercase rounded-xl hover:bg-zinc-800 transition-colors shadow-xs"
              >
                Connect
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="p-1.5 text-zinc-400 hover:text-black rounded-xl"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Dynamic Zoom & Pan Transform Layer */}
        <div 
          className="w-full h-full relative"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Map SVG with Aesthetic Radiant Neural Curves and Ambient Web */}
          <svg className="w-full h-full absolute inset-0 pointer-events-none select-none overflow-visible">
            <defs>
              <linearGradient id="active-synapse-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#18181b" stopOpacity="1" />
                <stop offset="100%" stopColor="#3f3f46" stopOpacity="0.85" />
              </linearGradient>

              <linearGradient id="passive-synapse-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a1a1aa" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#d4d4d8" stopOpacity="0.45" />
              </linearGradient>

              <filter id="glow-panel" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Subtle Concentric Orbital Tracks */}
            {centerNode && orbitRadii.map((r, i) => (
              <circle
                key={`orbit-panel-${i}`}
                cx={centerNode.x}
                cy={centerNode.y}
                r={r}
                fill="none"
                stroke="#e4e4e7"
                strokeWidth={1}
                strokeDasharray="3,5"
                opacity={0.7}
              />
            ))}

            {/* Render Fluid Synaptic Connection Lines */}
            {edges.map((edge) => {
              const isHighlight = activeNode && (activeNode.id === edge.from.id || activeNode.id === edge.to.id);
              
              if (edge.isCross) {
                return (
                  <path
                    key={edge.key}
                    d={edge.pathD}
                    fill="none"
                    stroke="#e4e4e7"
                    strokeWidth={1}
                    strokeDasharray="2,3"
                    opacity={0.6}
                  />
                );
              }

              return (
                <g key={edge.key}>
                  {/* Glowing backdrop path when active */}
                  {isHighlight && (
                    <path
                      d={edge.pathD}
                      fill="none"
                      stroke="#000000"
                      strokeWidth={5}
                      strokeOpacity={0.12}
                      filter="url(#glow-panel)"
                    />
                  )}

                  {/* Main Synapse Line */}
                  <path
                    d={edge.pathD}
                    fill="none"
                    stroke={isHighlight ? "url(#active-synapse-grad)" : "url(#passive-synapse-grad)"}
                    strokeWidth={isHighlight ? 2.5 : 1.5}
                    className="transition-colors duration-150"
                  />

                  {/* Terminal Synaptic Pulse Dot */}
                  <circle
                    cx={edge.to.x}
                    cy={edge.to.y}
                    r={isHighlight ? 3.5 : 2}
                    fill={isHighlight ? "#18181b" : "#a1a1aa"}
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Physics Nodes */}
          <div className="w-full h-full relative z-10 select-none">
            {renderedNodes.map((node) => {
              if (node.isCenter) {
                return (
                  <div
                    key="center-node-panel"
                    onPointerDown={(e) => handleNodePointerDown('center', e)}
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={cn(
                      "absolute flex flex-col items-center justify-center pointer-events-auto select-none touch-none",
                      activeDraggingNodeId === 'center' ? 'cursor-grabbing z-40 scale-105' : 'cursor-grab group'
                    )}
                  >
                    {/* Breathing halo ring */}
                    <div className="relative flex items-center justify-center">
                      <div className="absolute -inset-2.5 rounded-full bg-black/5 animate-pulse" />
                      <div className="relative w-13 h-13 rounded-full border-2 border-black bg-white p-0.5 shadow-md transition-transform group-hover:scale-105 pointer-events-none select-none">
                        <img
                          src={characterAvatar(character)}
                          alt={character.name}
                          draggable={false}
                          onDragStart={(e) => e.preventDefault()}
                          className="w-full h-full rounded-full object-cover pointer-events-none select-none"
                        />
                      </div>
                    </div>
                    <span className="mt-1.5 text-[9px] font-black uppercase tracking-wider text-black bg-white/95 border border-zinc-200/80 px-2 py-0.5 rounded-full pointer-events-none select-none shadow-xs">
                      {character.name}
                    </span>
                  </div>
                );
              }

              const isSelected = selectedId === node.id;
              const isHovered = hoveredId === node.id;
              const isActive = isSelected || isHovered || activeDraggingNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onPointerDown={(e) => handleNodePointerDown(node.id, e)}
                  onMouseEnter={() => setHoveredId(node.id)}
                  onMouseLeave={() => setHoveredId(null)}
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
                  {/* Default Compact Synaptic Node (Cleanly Truncated) */}
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs transition-all duration-200 max-w-[130px] select-none pointer-events-none border shadow-xs",
                      isActive
                        ? "bg-black text-white border-black shadow-lg ring-4 ring-black/10 scale-105"
                        : "bg-white/95 backdrop-blur-xs text-zinc-800 border-zinc-200/90 hover:border-zinc-400"
                    )}
                  >
                    <div 
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
                        isActive ? "bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" : "bg-zinc-400"
                      )} 
                    />
                    <span className="text-[10px] font-semibold tracking-tight leading-none truncate select-none pointer-events-none">
                      {getShortLabel(node.text)}
                    </span>
                  </div>

                  {/* Elegant Floating Full-Text Popover on Hover / Selection */}
                  <AnimatePresence>
                    {isActive && activeDraggingNodeId !== node.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-60 p-3 bg-zinc-950 text-white rounded-2xl shadow-2xl border border-zinc-800 z-50 pointer-events-auto select-none"
                      >
                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-800/80">
                          <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">
                            <Zap className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                            Memory Fact
                          </div>
                          {onDeleteMemory && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteMemory(node.id);
                                setSelectedId(null);
                                setHoveredId(null);
                              }}
                              className="p-1 text-zinc-400 hover:text-red-400 rounded-md transition-colors"
                              title="Delete Memory"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] font-medium leading-snug text-zinc-100">
                          "{node.text}"
                        </p>

                        {/* Speech bubble indicator arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-solid border-t-zinc-950 border-t-6 border-x-transparent border-x-6 border-b-0" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty state */}
        {memories.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none select-none">
            <Brain className="w-6 h-6 text-zinc-300 mb-1.5 animate-pulse" />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              No Memories Formed Yet
            </p>
            <p className="text-[9px] text-zinc-400 mt-0.5">
              Chat with {character.name} or add facts manually to build synaptic links
            </p>
          </div>
        )}
      </div>
    );
  }

  // 2. Fullscreen Expanded Modal (Rendered via React Portal onto document.body)
  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 bg-black/50 backdrop-blur-md animate-in fade-in duration-200 select-none"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <div 
        ref={containerRef}
        className="relative w-full max-w-5xl h-[85vh] bg-[#fafafa] rounded-3xl border border-zinc-200/90 shadow-2xl overflow-hidden flex flex-col select-none"
      >
        {/* Subtle dot matrix grid */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none select-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #d4d4d8 1.5px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />

        {/* Header */}
        <header className="px-8 py-5 border-b border-zinc-200/80 flex items-center justify-between bg-white/90 backdrop-blur-md z-30 shrink-0 select-none">
          <div className="select-none">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-900" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-black">
                {character.name}'s Neural Memory Map
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {memories.length} synaptic facts connected &bull; Drag character or nodes to explore responsive spring dynamics
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onAddMemory && (
              <button
                type="button"
                onClick={() => setIsAdding(!isAdding)}
                className="px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-full text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add Fact
              </button>
            )}

            {onCloseModal && (
              <button
                type="button"
                onClick={onCloseModal}
                className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-black transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        {/* Add Input Bar in Modal */}
        <AnimatePresence>
          {isAdding && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleAddSubmit}
              className="px-8 py-3 bg-zinc-50 border-b border-zinc-200 z-30 flex items-center gap-3 shrink-0"
            >
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Enter a new memory fact to connect to the character..."
                autoFocus
                className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-2 text-xs text-black placeholder:text-zinc-400 outline-none focus:border-black"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white text-xs font-bold uppercase rounded-xl hover:bg-zinc-800 transition-colors"
              >
                Connect
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-2 text-xs font-bold uppercase text-zinc-400 hover:text-black"
              >
                Cancel
              </button>
            </motion.form>
          )}
        </AnimatePresence>

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
            {/* SVG Connecting Lines with Smooth Curved Paths and Orbital Radii */}
            <svg className="w-full h-full absolute inset-0 pointer-events-none select-none overflow-visible">
              <defs>
                <linearGradient id="modal-active-synapse-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#000000" stopOpacity="1" />
                  <stop offset="100%" stopColor="#52525b" stopOpacity="0.85" />
                </linearGradient>

                <linearGradient id="modal-passive-synapse-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a1a1aa" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#e4e4e7" stopOpacity="0.4" />
                </linearGradient>

                <filter id="glow-modal" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Faint Orbital Guides centered around Character Node */}
              {centerNode && orbitRadii.map((r, i) => (
                <circle
                  key={`modal-orbit-${i}`}
                  cx={centerNode.x}
                  cy={centerNode.y}
                  r={r}
                  fill="none"
                  stroke="#e4e4e7"
                  strokeWidth={1.5}
                  strokeDasharray="4,6"
                  opacity={0.6}
                />
              ))}

              {/* Curved Connection Edges with live Bezier flexing */}
              {edges.map((edge) => {
                const isHighlight = activeNode && (activeNode.id === edge.from.id || activeNode.id === edge.to.id);
                
                if (edge.isCross) {
                  return (
                    <path
                      key={edge.key}
                      d={edge.pathD}
                      fill="none"
                      stroke="#e4e4e7"
                      strokeWidth={1}
                      strokeDasharray="3,4"
                      opacity={0.5}
                    />
                  );
                }

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
                        filter="url(#glow-modal)"
                      />
                    )}

                    {/* Main Synaptic Line */}
                    <path
                      d={edge.pathD}
                      fill="none"
                      stroke={isHighlight ? "url(#modal-active-synapse-grad)" : "url(#modal-passive-synapse-grad)"}
                      strokeWidth={isHighlight ? 3 : 1.75}
                      className="transition-colors duration-150"
                    />

                    {/* End Junction Point */}
                    <circle
                      cx={edge.to.x}
                      cy={edge.to.y}
                      r={isHighlight ? 4.5 : 2.5}
                      fill={isHighlight ? "#000000" : "#a1a1aa"}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {renderedNodes.map((node) => {
              if (node.isCenter) {
                return (
                  <div
                    key="center-node-modal"
                    onPointerDown={(e) => handleNodePointerDown('center', e)}
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    className={cn(
                      "absolute flex flex-col items-center justify-center select-none pointer-events-auto touch-none group",
                      activeDraggingNodeId === 'center' ? 'cursor-grabbing z-40 scale-105' : 'cursor-grab'
                    )}
                  >
                    <div className="relative flex items-center justify-center">
                      <div className="absolute -inset-4 rounded-full bg-black/5 animate-pulse" />
                      <div className="relative w-22 h-22 rounded-full border-2 border-black bg-white p-1 shadow-2xl pointer-events-none select-none transition-transform group-hover:scale-105">
                        <img
                          src={characterAvatar(character)}
                          alt={character.name}
                          draggable={false}
                          onDragStart={(e) => e.preventDefault()}
                          className="w-full h-full rounded-full object-cover pointer-events-none select-none"
                        />
                      </div>
                    </div>
                    <span className="mt-2.5 text-xs font-black uppercase tracking-widest text-black bg-white/95 border border-zinc-200 px-3 py-1 rounded-full shadow-sm pointer-events-none select-none">
                      {character.name}
                    </span>
                  </div>
                );
              }

              const isSelected = selectedId === node.id;
              const isHovered = hoveredId === node.id;
              const isActive = isSelected || isHovered || activeDraggingNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onPointerDown={(e) => handleNodePointerDown(node.id, e)}
                  onMouseEnter={() => setHoveredId(node.id)}
                  onMouseLeave={() => setHoveredId(null)}
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
                      {getShortLabel(node.text)}
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
                            <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            Connected Memory
                          </div>
                          {onDeleteMemory && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteMemory(node.id);
                                setSelectedId(null);
                                setHoveredId(null);
                              }}
                              className="p-1 text-zinc-400 hover:text-red-400 rounded-md transition-colors"
                              title="Delete Memory"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <p className="text-xs font-medium leading-relaxed text-zinc-100">
                          "{node.text}"
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
