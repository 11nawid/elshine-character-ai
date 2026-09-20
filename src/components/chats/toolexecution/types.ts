import type { ToolExecutionStep } from "../../../types";

export interface PipelineNode {
  id: string;
  type: "query" | "tool" | "response";
  label: string;
  sublabel: string;
  platform?: "youtube" | "instagram" | "persona";
  status: "success" | "failed" | "running";
  target?: string;
  metrics?: Record<string, string | number | undefined>;
  durationMs?: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
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

export function createInitialDragState(): DragState {
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
