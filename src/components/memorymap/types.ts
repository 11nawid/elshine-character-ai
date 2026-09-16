export interface MapNode {
  id: string;
  type: "user" | "character" | "memory";
  label: string;
  sublabel?: string;
  avatarUrl?: string;
  characterId?: string;
  characterName?: string;
  memoryId?: string;
  chatDocId?: string;
  fullText?: string;
  createdAt?: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  targetRadius?: number;
  targetAngle?: number;
  parentId?: string;
}

export interface DragState {
  mode: "none" | "pan" | "node";
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
}

export function createDragState(): DragState {
  return {
    mode: "none",
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
}