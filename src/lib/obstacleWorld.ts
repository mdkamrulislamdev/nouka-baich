import { Box3 } from "three";

export type ObstacleKind = "marker" | "rock" | "log" | "dinghy" | "racing";

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
  /** 1 = same heading as the player (−Z), -1 = oncoming. */
  facing: -1 | 1;
  sinking: boolean;
  sinkT: number;
  sinkSide: -1 | 1;
  sinkStartY: number;
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
    facing: 1,
    sinking: false,
    sinkT: 0,
    sinkSide: 1,
    sinkStartY: 0,
  };
}

export function isSinkableKind(kind: ObstacleKind): boolean {
  return kind === "racing" || kind === "dinghy";
}

export function resetObstacleCombat(record: ObstacleRecord): void {
  record.rotX = 0;
  record.rotZ = 0;
  record.sinking = false;
  record.sinkT = 0;
  record.sinkSide = 1;
  record.sinkStartY = 0;
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
