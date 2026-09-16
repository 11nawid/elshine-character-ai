import type { Character } from "../../types";
import type { MapNode } from "./types";
import { avatarUrlFor } from "../../lib/avatar";

export interface MemoryAggregate {
  chatDocId?: string;
  memories: import("../../types").Memory[];
}

interface BuildNodesParams {
  dimensions: { width: number; height: number };
  characters: Character[];
  characterMemories: Record<string, MemoryAggregate>;
  filterCharId: string | "all";
  userName: string;
  userPhoto?: string | null;
  previous: MapNode[];
}

/** Builds the user -> characters -> memories hierarchy with target positions. */
export function buildNodes({
  dimensions,
  characters,
  characterMemories,
  filterCharId,
  userName,
  userPhoto,
  previous,
}: BuildNodesParams): MapNode[] {
  const cx = dimensions.width / 2;
  const cy = dimensions.height / 2;

  const existingMap = new Map<string, MapNode>();
  previous.forEach((n) => existingMap.set(n.id, n));

  const newNodes: MapNode[] = [];

  const activeChars = filterCharId === "all" ? characters : characters.filter((c) => c.id === filterCharId);
  const charCount = activeChars.length;

  let userTargetX = cx;
  let userTargetY = cy;
  let charRadius = 260;

  if (charCount === 1) {
    userTargetX = cx - 180;
    userTargetY = cy;
  } else if (charCount <= 2) {
    charRadius = 260;
  } else if (charCount <= 4) {
    charRadius = 270;
  } else {
    charRadius = 290;
  }

  const existingUser = existingMap.get("user-root");
  newNodes.push({
    id: "user-root",
    type: "user",
    label: userName,
    sublabel: "",
    avatarUrl: avatarUrlFor(userPhoto, `user-root-${userPhoto || "anon"}`),
    x: existingUser ? existingUser.x : userTargetX,
    y: existingUser ? existingUser.y : userTargetY,
    vx: 0,
    vy: 0,
    targetX: userTargetX,
    targetY: userTargetY,
  });

  activeChars.forEach((char, charIdx) => {
    let targetCharX = cx;
    let targetCharY = cy;
    let charAngle = 0;

    if (charCount === 1) {
      targetCharX = cx + 180;
      targetCharY = cy;
    } else if (charCount === 2) {
      charAngle = charIdx === 0 ? -Math.PI * 0.85 : -Math.PI * 0.15;
      targetCharX = cx + charRadius * Math.cos(charAngle);
      targetCharY = cy + charRadius * Math.sin(charAngle);
    } else if (charCount === 3) {
      const angles = [-Math.PI * 0.85, -Math.PI * 0.15, Math.PI * 0.5];
      charAngle = angles[charIdx];
      targetCharX = cx + charRadius * Math.cos(charAngle);
      targetCharY = cy + charRadius * Math.sin(charAngle);
    } else if (charCount === 4) {
      const angles = [-Math.PI * 0.75, -Math.PI * 0.25, Math.PI * 0.25, Math.PI * 0.75];
      charAngle = angles[charIdx];
      targetCharX = cx + charRadius * Math.cos(charAngle);
      targetCharY = cy + charRadius * Math.sin(charAngle);
    } else {
      charAngle = (2 * Math.PI * charIdx) / charCount - Math.PI / 2;
      targetCharX = cx + charRadius * Math.cos(charAngle);
      targetCharY = cy + charRadius * Math.sin(charAngle);
    }

    const charNodeId = `char-${char.id}`;
    const existingChar = existingMap.get(charNodeId);

    newNodes.push({
      id: charNodeId,
      type: "character",
      label: char.name,
      sublabel: char.visibility || "Companion",
      avatarUrl: avatarUrlFor(char.avatarUrl, `char-${char.id}`),
      characterId: char.id,
      characterName: char.name,
      x: existingChar ? existingChar.x : targetCharX,
      y: existingChar ? existingChar.y : targetCharY,
      vx: 0,
      vy: 0,
      targetX: targetCharX,
      targetY: targetCharY,
      parentId: "user-root",
    });

    const memoriesList = characterMemories[char.id]?.memories || [];
    const totalMems = memoriesList.length;

    memoriesList.forEach((mem, memIdx) => {
      const memNodeId = `mem-${mem.id}`;
      let memRadius = 140;
      let memAngle = charAngle;

      if (charCount === 1) {
        if (totalMems === 1) {
          memRadius = 135;
          memAngle = 0;
        } else if (totalMems === 2) {
          memRadius = 140;
          memAngle = memIdx === 0 ? -Math.PI / 3 : Math.PI / 3;
        } else if (totalMems === 3) {
          memRadius = 145;
          const offsets = [-Math.PI / 2, 0, Math.PI / 2];
          memAngle = offsets[memIdx];
        } else if (totalMems === 4) {
          memRadius = 150;
          const offsets = [-Math.PI * 0.65, -Math.PI * 0.2, Math.PI * 0.2, Math.PI * 0.65];
          memAngle = offsets[memIdx];
        } else if (totalMems <= 6) {
          memRadius = 150;
          memAngle = (2 * Math.PI * memIdx) / totalMems;
        } else {
          const ring = Math.floor(memIdx / 6);
          const indexInRing = memIdx % 6;
          const ringCount = Math.min(totalMems - ring * 6, 6);
          memRadius = 135 + ring * 55;
          memAngle = (2 * Math.PI * indexInRing) / ringCount + ring * 0.4;
        }
      } else {
        if (totalMems === 1) {
          memRadius = 135;
          memAngle = charAngle;
        } else if (totalMems === 2) {
          memRadius = 140;
          memAngle = memIdx === 0 ? charAngle - 0.75 : charAngle + 0.75;
        } else if (totalMems === 3) {
          memRadius = 145;
          const offsets = [-1.1, 0, 1.1];
          memAngle = charAngle + offsets[memIdx];
        } else if (totalMems === 4) {
          memRadius = 150;
          const offsets = [-1.35, -0.45, 0.45, 1.35];
          memAngle = charAngle + offsets[memIdx];
        } else if (totalMems <= 6) {
          memRadius = 150;
          memAngle = charAngle + (2 * Math.PI * memIdx) / totalMems;
        } else {
          const ring = Math.floor(memIdx / 6);
          const indexInRing = memIdx % 6;
          const ringCount = Math.min(totalMems - ring * 6, 6);
          memRadius = 140 + ring * 55;
          memAngle = (2 * Math.PI * indexInRing) / ringCount + ring * 0.5 + charAngle;
        }
      }

      const targetMemX = targetCharX + memRadius * Math.cos(memAngle);
      const targetMemY = targetCharY + memRadius * Math.sin(memAngle);
      const existingMem = existingMap.get(memNodeId);
      const memoriesObj = characterMemories[char.id];

      newNodes.push({
        id: memNodeId,
        type: "memory",
        label: mem.text,
        fullText: mem.text,
        memoryId: mem.id,
        chatDocId: memoriesObj?.chatDocId,
        createdAt: mem.createdAt,
        characterId: char.id,
        characterName: char.name,
        x: existingMem ? existingMem.x : targetMemX,
        y: existingMem ? existingMem.y : targetMemY,
        vx: 0,
        vy: 0,
        targetX: targetMemX,
        targetY: targetMemY,
        targetRadius: memRadius,
        targetAngle: memAngle,
        parentId: charNodeId,
      });
    });
  });

  return newNodes;
}