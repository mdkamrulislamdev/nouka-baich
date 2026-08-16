import { Box3 } from "three";

export type ObstacleKind = "marker" | "rock" | "log" | "dinghy";

export type ObstacleRecord = {
  id: number;
  kind: ObstacleKind;
  active: boolean;
  x: number;
  y: number;
  z: number;
  rotY: number;
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
};

const obstacles: ObstacleRecord[] = [];

function usesWorldBox(kind: ObstacleKind): boolean {
  return kind === "rock" || kind === "log" || kind === "dinghy";
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
    rotY: 0,
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
  };
}

export function registerObstacle(record: ObstacleRecord): void {
  obstacles.push(record);
}

export function clearObstacles(): void {
  obstacles.length = 0;
}

export function deactivateAllObstacles(): void {
  for (let index = 0; index < obstacles.length; index += 1) {
    obstacles[index].active = false;
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
