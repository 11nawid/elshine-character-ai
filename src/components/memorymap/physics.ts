import type { MapNode } from "./types";

/** Advances one physics frame for all nodes (springs toward targets, anti-clumping repulsion). */
export function stepPhysics(nodes: MapNode[], draggedId?: string | null): void {
  if (nodes.length === 0) return;

  for (const node of nodes) {
    if (node.type === "user") continue;
    if (draggedId === node.id) {
      node.vx = 0;
      node.vy = 0;
      continue;
    }

    let fx = 0;
    let fy = 0;

    if (node.type === "character") {
      const springK = 0.05;
      fx += (node.targetX - node.x) * springK;
      fy += (node.targetY - node.y) * springK;
    } else if (node.type === "memory") {
      const parent = nodes.find((p) => p.id === node.parentId);
      const tX = parent
        ? parent.x + (node.targetRadius || 140) * Math.cos(node.targetAngle ?? 0)
        : node.targetX;
      const tY = parent
        ? parent.y + (node.targetRadius || 140) * Math.sin(node.targetAngle ?? 0)
        : node.targetY;

      const springK = 0.055;
      fx += (tX - node.x) * springK;
      fy += (tY - node.y) * springK;
    }

    for (const other of nodes) {
      if (other === node) continue;
      const dx = node.x - other.x;
      const dy = node.y - other.y;
      const dist = Math.hypot(dx, dy) || 1;

      const isMemMem = node.type === "memory" && other.type === "memory";
      const minDist = isMemMem ? 85 : 105;

      if (dist < minDist) {
        const rep = ((minDist - dist) / minDist) * 1.6;
        fx += (dx / dist) * rep;
        fy += (dy / dist) * rep;
      }
    }

    const damping = 0.84;
    node.vx = (node.vx + fx) * damping;
    node.vy = (node.vy + fy) * damping;

    const speed = Math.hypot(node.vx, node.vy);
    const maxSpeed = 10;
    if (speed > maxSpeed) {
      node.vx = (node.vx / speed) * maxSpeed;
      node.vy = (node.vy / speed) * maxSpeed;
    }

    if (Math.abs(node.vx) < 0.02) node.vx = 0;
    if (Math.abs(node.vy) < 0.02) node.vy = 0;

    node.x += node.vx;
    node.y += node.vy;
  }

  const userNode = nodes.find((n) => n.type === "user");
  if (userNode && draggedId !== userNode.id) {
    const toCenterX = (userNode.targetX - userNode.x) * 0.03;
    const toCenterY = (userNode.targetY - userNode.y) * 0.03;
    userNode.vx = (userNode.vx + toCenterX) * 0.85;
    userNode.vy = (userNode.vy + toCenterY) * 0.85;
    userNode.x += userNode.vx;
    userNode.y += userNode.vy;
  }
}