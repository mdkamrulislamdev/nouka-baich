import { Box3 } from "three";

export type ObstacleKind = "marker" | "rock";

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
};

const obstacles: ObstacleRecord[] = [];

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
    worldBox: kind === "rock" ? new Box3() : null,
  };
}

export function registerObstacle(record: ObstacleRecord): void {
  obstacles.push(record);
}

export function clearObstacles(): void {
  obstacles.length = 0;
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
