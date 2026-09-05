import { Box3 } from "three";

import { getLaneLimit } from "@/components/canvas/sceneConfig";
import { clamp } from "@/lib/clamp";

export type ObstacleKind = "marker" | "rock" | "log" | "dinghy" | "racing";
export type ObstacleRole = "none" | "pace" | "flank" | "heat";

export type DirectedSpawn = {
  kind: "racing" | "dinghy" | "rock" | "log";
  x: number;
  z: number;
  forwardSpeed: number;
  facing: -1 | 1;
  role: ObstacleRole;
  heatIndex: number;
  amplitude: number;
};

export type ObstacleRecord = {
  id: number;
  kind: ObstacleKind;
  active: boolean;
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
  halfX: number;
  halfY: number;
  halfZ: number;
  worldBox: Box3 | null;
  originX: number;
  phase: number;
  amplitude: number;
  angularSpeed: number;
  forwardSpeed: number;
  cruiseSpeed: number;
  /** 1 = same heading as the player (−Z), -1 = oncoming. */
  facing: -1 | 1;
  sinking: boolean;
  sinkT: number;
  sinkSide: -1 | 1;
  sinkStartY: number;
  smash: boolean;
  smashT: number;
  smashScale: number;
  npcKickT: number;
  npcKickCool: number;
  bumpTimer: number;
  knockVx: number;
  knockVz: number;
  role: ObstacleRole;
  heatIndex: number;
  passed: boolean;
  aheadTracked: boolean;
};

const obstacles: ObstacleRecord[] = [];

function usesWorldBox(kind: ObstacleKind): boolean {
  return kind === "rock" || kind === "log" || kind === "dinghy" || kind === "racing";
}

export function getObstacles(): readonly ObstacleRecord[] {
  return obstacles;
}

export function createObstacleRecord(
  id: number,
  kind: ObstacleKind,
): ObstacleRecord {
  return {
    id,
    kind,
    active: false,
    x: 0,
    y: 0,
    z: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    scale: 1,
    halfX: 0.5,
    halfY: 0.5,
    halfZ: 0.5,
    worldBox: usesWorldBox(kind) ? new Box3() : null,
    originX: 0,
    phase: 0,
    amplitude: 0,
    angularSpeed: 0,
    forwardSpeed: 0,
    cruiseSpeed: 0,
    facing: 1,
    sinking: false,
    sinkT: 0,
    sinkSide: 1,
    sinkStartY: 0,
    smash: false,
    smashT: 0,
    smashScale: 1,
    npcKickT: 0,
    npcKickCool: 0,
    bumpTimer: 0,
    knockVx: 0,
    knockVz: 0,
    role: "none",
    heatIndex: -1,
    passed: false,
    aheadTracked: false,
  };
}

export function isSinkableKind(kind: ObstacleKind): boolean {
  return kind === "racing" || kind === "dinghy";
}

export function resetObstacleCombat(record: ObstacleRecord): void {
  record.rotX = 0;
  record.rotY = 0;
  record.rotZ = 0;
  record.sinking = false;
  record.sinkT = 0;
  record.sinkSide = 1;
  record.sinkStartY = 0;
  record.smash = false;
  record.smashT = 0;
  record.smashScale = 1;
  record.npcKickT = 0;
  record.npcKickCool = 0;
  record.bumpTimer = 0;
  record.knockVx = 0;
  record.knockVz = 0;
  record.role = "none";
  record.heatIndex = -1;
  record.passed = false;
  record.aheadTracked = false;
  record.cruiseSpeed = 0;
}

export function beginObstacleSink(
  record: ObstacleRecord,
  side: -1 | 1,
): void {
  record.sinking = true;
  record.sinkT = 0;
  record.sinkSide = side;
  record.sinkStartY = record.y;
  record.angularSpeed = 0;
  record.amplitude = 0;
  record.forwardSpeed = 0;
  record.bumpTimer = 0;
  record.knockVx = 0;
  record.knockVz = 0;
}

export function beginLogSmash(record: ObstacleRecord, side: -1 | 1): void {
  record.sinking = true;
  record.smash = true;
  record.smashT = 0;
  record.smashScale = record.scale;
  record.sinkT = 0;
  record.sinkSide = side;
  record.sinkStartY = record.y;
  record.angularSpeed = 0;
  record.amplitude = 0;
  record.forwardSpeed = 0;
  record.bumpTimer = 0;
  record.knockVx = 0;
  record.knockVz = 0;
}

export function beginObstacleBump(
  record: ObstacleRecord,
  side: -1 | 1,
  impulseX: number,
  impulseZ: number,
  speedMul: number,
  duration: number,
): void {
  record.sinking = false;
  record.sinkT = 0;
  record.bumpTimer = duration;
  record.sinkSide = side;
  record.knockVx = side * impulseX;
  record.knockVz = impulseZ;
  record.forwardSpeed *= speedMul;
  record.amplitude *= 0.18;
  record.rotZ = -side * 0.24;
  record.rotX = 0.06;
}

export function shoveNpcBoat(
  record: ObstacleRecord,
  side: -1 | 1,
  popX: number,
  impulseX: number,
  impulseZ: number,
  speedMul: number,
  duration: number,
): void {
  beginObstacleBump(record, side, impulseX, impulseZ, speedMul, duration);
  const travelLimit = Math.max(0.4, getLaneLimit() - record.halfX);
  record.x = clamp(record.x + side * popX, -travelLimit, travelLimit);
  record.originX = record.x;
}

export function registerObstacle(record: ObstacleRecord): void {
  obstacles.push(record);
}

export function clearObstacles(): void {
  obstacles.length = 0;
}

export function deactivateAllObstacles(): void {
  for (let index = 0; index < obstacles.length; index += 1) {
    const obstacle = obstacles[index];
    obstacle.active = false;
    resetObstacleCombat(obstacle);
  }
}

export function forEachActiveObstacle(
  callback: (obstacle: ObstacleRecord) => void,
): void {
  for (let index = 0; index < obstacles.length; index += 1) {
    const obstacle = obstacles[index];
    if (obstacle.active) {
      callback(obstacle);
    }
  }
}

export function acquireIdleObstacle(
  kind: ObstacleKind,
): ObstacleRecord | null {
  for (let index = 0; index < obstacles.length; index += 1) {
    const obstacle = obstacles[index];
    if (!obstacle.active && obstacle.kind === kind) {
      return obstacle;
    }
  }
  return null;
}

const directedQueue: DirectedSpawn[] = [];

export function queueDirectedSpawn(spawn: DirectedSpawn): void {
  directedQueue.push(spawn);
}

export function drainDirectedSpawns(): DirectedSpawn[] {
  if (directedQueue.length === 0) {
    return [];
  }
  const next = directedQueue.slice();
  directedQueue.length = 0;
  return next;
}

export function clearDirectedSpawns(): void {
  directedQueue.length = 0;
}

export function acquirePreferredObstacle(
  preferred: ObstacleKind,
): ObstacleRecord | null {
  const fallback: ObstacleKind[] = [
    preferred,
    "dinghy",
    "racing",
    "log",
    "rock",
    "marker",
  ];
  const tried = new Set<ObstacleKind>();

  for (let index = 0; index < fallback.length; index += 1) {
    const kind = fallback[index];
    if (tried.has(kind)) {
      continue;
    }
    tried.add(kind);
    const slot = acquireIdleObstacle(kind);
    if (slot) {
      return slot;
    }
  }

  return null;
}
